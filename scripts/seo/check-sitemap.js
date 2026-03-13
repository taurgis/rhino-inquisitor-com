import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { load as loadHtml } from 'cheerio';
import { parse as parseCsv } from 'csv-parse/sync';
import { stringify as stringifyCsv } from 'csv-stringify/sync';
import fg from 'fast-glob';
import { XMLParser } from 'fast-xml-parser';

import {
  canonicalOrigin,
  extractRedirectDetails,
  loadManifest,
  repoRoot,
  toRepoRelative
} from '../migration/url-validation-helpers.js';

const defaults = {
  manifestPath: path.join(repoRoot, 'migration/url-manifest.json'),
  metadataReportPath: path.join(repoRoot, 'migration/reports/phase-5-metadata-report.csv'),
  publicRoot: path.join(repoRoot, 'public'),
  sitemapPath: path.join(repoRoot, 'public/sitemap.xml'),
  robotsPath: path.join(repoRoot, 'public/robots.txt'),
  reportPath: path.join(repoRoot, 'migration/reports/phase-5-sitemap-audit.csv')
};

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  trimValues: true
});

const sitemapTolerance = 0;

function printHelp() {
  console.log(`Usage: node scripts/seo/check-sitemap.js [options]

Options:
  --manifest <path>         Override manifest path.
  --metadata-report <path>  Override metadata report CSV path.
  --public-dir <path>       Override built public directory (defaults to public).
  --sitemap <path>          Override sitemap entry file (defaults to public/sitemap.xml).
  --robots-file <path>      Override robots.txt path (defaults to public/robots.txt).
  --report <path>           Override audit CSV path.
  --help                    Show this help message.
`);
}

function parseArgs(argv) {
  const options = { ...defaults };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case '--manifest':
        options.manifestPath = path.resolve(argv[++index]);
        break;
      case '--metadata-report':
        options.metadataReportPath = path.resolve(argv[++index]);
        break;
      case '--public-dir':
        options.publicRoot = path.resolve(argv[++index]);
        options.sitemapPath = path.join(options.publicRoot, 'sitemap.xml');
        options.robotsPath = path.join(options.publicRoot, 'robots.txt');
        break;
      case '--sitemap':
        options.sitemapPath = path.resolve(argv[++index]);
        break;
      case '--robots-file':
        options.robotsPath = path.resolve(argv[++index]);
        break;
      case '--report':
        options.reportPath = path.resolve(argv[++index]);
        break;
      case '--help':
        options.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function arrayify(value) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function normalizeRoute(route) {
  if (!route) {
    return '';
  }

  if (route === '/' || route === '/404.html') {
    return route;
  }

  if (route.endsWith('.xml')) {
    return route;
  }

  return route.endsWith('/') ? route : `${route}/`;
}

function routeFromHtmlPath(publicRoot, htmlFile) {
  const relativePath = path.relative(publicRoot, htmlFile).replace(/\\/g, '/');

  if (relativePath === 'index.html') {
    return '/';
  }

  if (relativePath === '404.html') {
    return '/404.html';
  }

  if (relativePath.endsWith('/index.html')) {
    return `/${relativePath.slice(0, -'index.html'.length)}`;
  }

  return `/${relativePath}`;
}

function toAbsoluteUrl(route) {
  return new URL(route, `${canonicalOrigin}/`).toString();
}

function isIso8601(value) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/u.test(value)
    && !Number.isNaN(Date.parse(value));
}

function isValidPublishedDate(value) {
  return typeof value === 'string' && value.trim().length > 0 && !Number.isNaN(Date.parse(value));
}

function normalizeRedirectTarget(value) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return '';
  }

  const trimmed = value.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return new URL(trimmed).pathname;
  }

  return trimmed;
}

function stripInlineComment(line) {
  const hashIndex = line.indexOf('#');
  return (hashIndex === -1 ? line : line.slice(0, hashIndex)).trim();
}

function parseRobotsFile(source) {
  const groups = [];
  const sitemapDirectives = [];
  let currentAgents = [];
  let currentRules = [];

  const flushCurrentGroup = () => {
    if (currentAgents.length === 0) {
      return;
    }

    groups.push({
      agents: [...currentAgents],
      rules: [...currentRules]
    });
    currentAgents = [];
    currentRules = [];
  };

  for (const rawLine of source.split(/\r?\n/u)) {
    const line = stripInlineComment(rawLine);
    if (!line) {
      continue;
    }

    const match = /^([^:]+):\s*(.*)$/u.exec(line);
    if (!match) {
      continue;
    }

    const directive = match[1].trim().toLowerCase();
    const value = match[2].trim();

    if (directive === 'user-agent') {
      if (currentRules.length > 0) {
        flushCurrentGroup();
      }
      currentAgents.push(value.toLowerCase());
      continue;
    }

    if (directive === 'allow' || directive === 'disallow') {
      if (currentAgents.length === 0) {
        continue;
      }
      currentRules.push({ directive, value });
      continue;
    }

    if (directive === 'sitemap') {
      sitemapDirectives.push(value);
    }
  }

  flushCurrentGroup();

  const wildcardGroup = groups.find((group) => group.agents.includes('*'));
  return {
    sitemapDirectives,
    wildcardRules: wildcardGroup?.rules ?? []
  };
}

function resolveRobotsRule(pathname, rules) {
  let bestRule = null;

  for (const rule of rules) {
    if (!rule.value) {
      continue;
    }

    if (!pathname.startsWith(rule.value)) {
      continue;
    }

    const currentLength = bestRule?.value.length ?? -1;
    const candidateLength = rule.value.length;
    const sameLengthAllowWins = candidateLength === currentLength
      && rule.directive === 'allow'
      && bestRule?.directive === 'disallow';

    if (candidateLength > currentLength || sameLengthAllowWins) {
      bestRule = rule;
    }
  }

  return {
    matchedRule: bestRule,
    blocked: bestRule?.directive === 'disallow'
  };
}

function createRow(values) {
  return {
    check_group: values.check_group,
    route: values.route,
    artifact: values.artifact,
    status: values.status,
    severity: values.severity,
    sitemap_url: values.sitemap_url ?? '',
    canonical_url: values.canonical_url ?? '',
    lastmod: values.lastmod ?? '',
    finding: values.finding ?? '',
    details: values.details ?? ''
  };
}

function pushRow(rows, failures, row) {
  rows.push(row);
  if (row.status === 'fail') {
    failures.push(`${row.route}: ${row.finding}`);
  }
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function loadMetadataInventory(metadataReportPath) {
  if (!(await fileExists(metadataReportPath))) {
    throw new Error(`Metadata report not found at ${toRepoRelative(metadataReportPath)}. Run npm run check:metadata first.`);
  }

  const source = await readFile(metadataReportPath, 'utf8');
  const rows = parseCsv(source, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  const inventory = new Map();

  for (const row of rows) {
    if (row.indexable !== 'yes') {
      continue;
    }

    if (!row.canonical) {
      continue;
    }

    const canonicalUrl = new URL(row.canonical);
    const route = normalizeRoute(canonicalUrl.pathname);
    inventory.set(route, {
      route,
      canonicalUrl: canonicalUrl.toString(),
      filePath: row.file_path,
      templateFamily: row.template_family
    });
  }

  return inventory;
}

async function collectRedirectHelperRoutes(publicRoot) {
  const htmlFiles = await fg('**/*.html', {
    cwd: publicRoot,
    absolute: true,
    dot: true
  });
  const routes = new Set();

  for (const htmlFile of htmlFiles) {
    const source = await readFile(htmlFile, 'utf8');
    const details = extractRedirectDetails(source);
    if (!details.isRedirectPage) {
      continue;
    }

    routes.add(normalizeRoute(routeFromHtmlPath(publicRoot, htmlFile)));
  }

  return routes;
}

async function collectSitemapEntries(publicRoot, sitemapFilePath, rows, failures, visited = new Set()) {
  const resolvedPath = path.resolve(sitemapFilePath);
  if (visited.has(resolvedPath)) {
    return [];
  }
  visited.add(resolvedPath);

  const source = await readFile(resolvedPath, 'utf8');
  const parsed = xmlParser.parse(source);

  const urlNodes = arrayify(parsed?.urlset?.url);
  if (urlNodes.length > 0) {
    return urlNodes.map((node) => ({
      loc: String(node.loc ?? '').trim(),
      lastmod: String(node.lastmod ?? '').trim(),
      sourceFile: resolvedPath
    }));
  }

  const indexNodes = arrayify(parsed?.sitemapindex?.sitemap);
  if (indexNodes.length === 0) {
    pushRow(rows, failures, createRow({
      check_group: 'sitemap-index',
      route: '/sitemap.xml',
      artifact: toRepoRelative(resolvedPath),
      status: 'fail',
      severity: 'critical',
      finding: 'sitemap.xml is neither a urlset nor a sitemapindex.',
      details: 'Expected a root <urlset> or <sitemapindex> element.'
    }));
    return [];
  }

  const nestedEntries = [];

  for (const node of indexNodes) {
    const loc = String(node.loc ?? '').trim();
    if (!loc) {
      pushRow(rows, failures, createRow({
        check_group: 'sitemap-index',
        route: '/sitemap.xml',
        artifact: toRepoRelative(resolvedPath),
        status: 'fail',
        severity: 'critical',
        finding: 'sitemap index entry is missing a <loc> value.'
      }));
      continue;
    }

    let childUrl;
    try {
      childUrl = new URL(loc);
    } catch {
      pushRow(rows, failures, createRow({
        check_group: 'sitemap-index',
        route: loc,
        artifact: toRepoRelative(resolvedPath),
        status: 'fail',
        severity: 'critical',
        sitemap_url: loc,
        finding: 'sitemap index entry is not an absolute URL.'
      }));
      continue;
    }

    const childRoute = normalizeRoute(childUrl.pathname);
    const childHost = `${childUrl.protocol}//${childUrl.host}`;
    const childFilePath = path.join(publicRoot, childUrl.pathname.replace(/^\//u, ''));
    const childFailures = [];

    if (childUrl.protocol !== 'https:') {
      childFailures.push('sitemap index entry is not HTTPS');
    }
    if (childHost !== canonicalOrigin) {
      childFailures.push('sitemap index entry host mismatch');
    }
    if (!(await fileExists(childFilePath))) {
      childFailures.push(`referenced sitemap file is missing from public/ (${toRepoRelative(childFilePath)})`);
    }

    pushRow(rows, failures, createRow({
      check_group: 'sitemap-index',
      route: childRoute,
      artifact: toRepoRelative(resolvedPath),
      status: childFailures.length === 0 ? 'pass' : 'fail',
      severity: childFailures.length === 0 ? 'none' : 'critical',
      sitemap_url: loc,
      finding: childFailures.join(' | ') || 'Referenced sitemap file is present and canonical.',
      details: toRepoRelative(childFilePath)
    }));

    if (childFailures.length > 0) {
      continue;
    }

    nestedEntries.push(...await collectSitemapEntries(publicRoot, childFilePath, rows, failures, visited));
  }

  return nestedEntries;
}

function collectManifestRoutes(entries, predicate) {
  const routes = new Set();

  for (const entry of entries) {
    if (!predicate(entry)) {
      continue;
    }

    const candidate = entry.target_url ?? entry.legacy_url;
    if (!candidate || typeof candidate !== 'string' || candidate.startsWith('http')) {
      continue;
    }

    routes.add(normalizeRoute(candidate.trim()));
  }

  return routes;
}

function collectLegacyManifestRoutes(entries, predicate) {
  const routes = new Set();

  for (const entry of entries) {
    if (!predicate(entry)) {
      continue;
    }

    if (!entry.legacy_url || typeof entry.legacy_url !== 'string') {
      continue;
    }

    routes.add(normalizeRoute(entry.legacy_url.trim()));
  }

  return routes;
}

async function validateFeed(options, rows, failures, robotsData) {
  const canonicalFeedPath = path.join(options.publicRoot, 'index.xml');
  if (!(await fileExists(canonicalFeedPath))) {
    pushRow(rows, failures, createRow({
      check_group: 'feed',
      route: '/index.xml',
      artifact: toRepoRelative(canonicalFeedPath),
      status: 'fail',
      severity: 'critical',
      finding: 'Canonical Hugo feed is missing from the built output.'
    }));
    return;
  }

  const feedSource = await readFile(canonicalFeedPath, 'utf8');
  let parsedFeed;

  try {
    parsedFeed = xmlParser.parse(feedSource);
  } catch (error) {
    pushRow(rows, failures, createRow({
      check_group: 'feed',
      route: '/index.xml',
      artifact: toRepoRelative(canonicalFeedPath),
      status: 'fail',
      severity: 'critical',
      finding: `Canonical feed XML is not parseable: ${error.message}`
    }));
    return;
  }

  let feedFailures = [];
  let itemCount = 0;

  if (parsedFeed?.rss?.channel) {
    const channel = parsedFeed.rss.channel;
    const items = arrayify(channel.item);
    itemCount = items.length;

    const channelLink = String(channel.link ?? '').trim();
    if (!channelLink) {
      feedFailures.push('RSS channel is missing a <link> element');
    } else if (!channelLink.startsWith(`${canonicalOrigin}/`)) {
      feedFailures.push(`RSS channel link is not on the canonical host (${channelLink})`);
    }

    if (items.length === 0) {
      feedFailures.push('RSS feed contains no items');
    }

    for (const item of items) {
      const itemLink = String(item.link ?? '').trim();
      const itemDate = String(item.pubDate ?? '').trim();

      if (!itemLink || !itemLink.startsWith(`${canonicalOrigin}/`)) {
        feedFailures.push(`RSS item link is missing or non-canonical (${itemLink || 'blank'})`);
        break;
      }

      if (!isValidPublishedDate(itemDate)) {
        feedFailures.push(`RSS item pubDate is missing or invalid (${itemDate || 'blank'})`);
        break;
      }
    }
  } else if (parsedFeed?.feed) {
    const feed = parsedFeed.feed;
    const entries = arrayify(feed.entry);
    itemCount = entries.length;

    if (entries.length === 0) {
      feedFailures.push('Atom feed contains no entries');
    }

    for (const entry of entries) {
      const linkNode = arrayify(entry.link).find((candidate) => candidate?.['@_href']);
      const entryLink = String(linkNode?.['@_href'] ?? '').trim();
      const published = String(entry.published ?? entry.updated ?? '').trim();

      if (!entryLink || !entryLink.startsWith(`${canonicalOrigin}/`)) {
        feedFailures.push(`Atom entry link is missing or non-canonical (${entryLink || 'blank'})`);
        break;
      }

      if (!isValidPublishedDate(published)) {
        feedFailures.push(`Atom entry published/updated is missing or invalid (${published || 'blank'})`);
        break;
      }
    }
  } else {
    feedFailures.push('Feed XML is neither RSS nor Atom.');
  }

  pushRow(rows, failures, createRow({
    check_group: 'feed',
    route: '/index.xml',
    artifact: toRepoRelative(canonicalFeedPath),
    status: feedFailures.length === 0 ? 'pass' : 'fail',
    severity: feedFailures.length === 0 ? 'none' : 'critical',
    finding: feedFailures.join(' | ') || 'Canonical feed is parseable with canonical links and valid publication dates.',
    details: `items=${itemCount}`
  }));

  const helperEndpoints = ['/feed/', '/feed/rss/', '/feed/atom/', '/rss/'];
  for (const endpoint of helperEndpoints) {
    const helperPath = path.join(options.publicRoot, endpoint.replace(/^\//u, ''), 'index.html');
    const helperFailures = [];

    if (!(await fileExists(helperPath))) {
      helperFailures.push('Feed compatibility helper route is missing from the built output');
    } else {
      const helperSource = await readFile(helperPath, 'utf8');
      const details = extractRedirectDetails(helperSource);
      const redirectTarget = normalizeRedirectTarget(details.metaRefreshTarget);
      const validTarget = redirectTarget === '/index.xml' || redirectTarget === '/feed/';

      if (!details.isRedirectPage) {
        helperFailures.push('Feed compatibility helper is not an HTML redirect page');
      }
      if (!validTarget) {
        helperFailures.push(`Feed compatibility helper does not resolve to /index.xml or /feed/ (${redirectTarget || 'blank'})`);
      }
    }

    pushRow(rows, failures, createRow({
      check_group: 'feed',
      route: endpoint,
      artifact: toRepoRelative(helperPath),
      status: helperFailures.length === 0 ? 'pass' : 'fail',
      severity: helperFailures.length === 0 ? 'none' : 'high',
      finding: helperFailures.join(' | ') || 'Feed compatibility helper resolves through the approved Pages-compatible redirect pattern.'
    }));
  }

  const feedRoutes = ['/feed/', '/feed/rss/', '/feed/atom/', '/rss/', '/index.xml'];
  const blockedRoutes = feedRoutes.filter((route) => resolveRobotsRule(route, robotsData.wildcardRules).blocked);

  pushRow(rows, failures, createRow({
    check_group: 'feed',
    route: '/robots.txt',
    artifact: toRepoRelative(options.robotsPath),
    status: blockedRoutes.length === 0 ? 'pass' : 'fail',
    severity: blockedRoutes.length === 0 ? 'none' : 'critical',
    finding: blockedRoutes.length === 0
      ? 'robots.txt does not block the canonical feed or compatibility routes.'
      : `robots.txt blocks feed routes: ${blockedRoutes.join(', ')}`
  }));
}

async function validateDiscoverySurfaces(options, manifestEntries, rows, failures, robotsData) {
  const archiveRoute = collectManifestRoutes(manifestEntries, (entry) => entry.legacy_url === '/archive/' && entry.disposition === 'keep');
  const archiveExpected = archiveRoute.has('/archive/');
  const archivePath = path.join(options.publicRoot, 'archive/index.html');

  pushRow(rows, failures, createRow({
    check_group: 'discovery-surfaces',
    route: '/archive/',
    artifact: toRepoRelative(archivePath),
    status: archiveExpected && (await fileExists(archivePath)) ? 'pass' : 'fail',
    severity: archiveExpected ? 'critical' : 'none',
    finding: archiveExpected
      ? ((await fileExists(archivePath)) ? 'Archive discovery surface is present in the build output.' : 'Archive discovery surface is missing from the build output.')
      : 'Archive route is not marked keep in the manifest.'
  }));

  const videoExpected = collectManifestRoutes(manifestEntries, (entry) => entry.target_url === '/video/' && entry.disposition === 'keep').has('/video/');
  const videoPath = path.join(options.publicRoot, 'video/index.html');
  pushRow(rows, failures, createRow({
    check_group: 'discovery-surfaces',
    route: '/video/',
    artifact: toRepoRelative(videoPath),
    status: videoExpected && (await fileExists(videoPath)) ? 'pass' : 'fail',
    severity: videoExpected ? 'critical' : 'none',
    finding: videoExpected
      ? ((await fileExists(videoPath)) ? 'Video discovery surface is present in the build output.' : 'Video discovery surface is missing from the build output.')
      : 'Video route is not marked keep in the manifest.'
  }));

  const organicCategoryRoutes = [...collectLegacyManifestRoutes(
    manifestEntries,
    (entry) => entry.url_class === 'category' && entry.disposition === 'keep' && entry.has_organic_traffic
  )].sort();

  for (const route of organicCategoryRoutes) {
    const relativePath = route === '/'
      ? 'index.html'
      : `${route.replace(/^\//u, '')}index.html`;
    const filePath = path.join(options.publicRoot, relativePath);
    const categoryFailures = [];
    let details = '';

    if (!(await fileExists(filePath))) {
      categoryFailures.push('Organic-traffic category route is missing from the build output');
    } else {
      const htmlSource = await readFile(filePath, 'utf8');
      const $ = loadHtml(htmlSource);
      const articleCount = $('.article-card-grid > li').length;
      const topicCount = $('.topic-hub-grid > li').length;
      const emptyState = $('.empty-state').length > 0;
      details = `articleCards=${articleCount}; topicCards=${topicCount}`;

      if (emptyState) {
        categoryFailures.push('Category page renders as an orphan empty-state surface');
      }

      if (articleCount === 0 && topicCount === 0) {
        categoryFailures.push('Category page has no article-card or topic-hub discovery content');
      }
    }

    pushRow(rows, failures, createRow({
      check_group: 'discovery-surfaces',
      route,
      artifact: toRepoRelative(filePath),
      status: categoryFailures.length === 0 ? 'pass' : 'fail',
      severity: categoryFailures.length === 0 ? 'none' : 'critical',
      finding: categoryFailures.join(' | ') || 'Organic-traffic category route is present with non-empty discovery content.',
      details
    }));
  }

  const categoryPaginationFiles = await fg('category/**/page/*/index.html', {
    cwd: options.publicRoot,
    absolute: true
  });

  if (categoryPaginationFiles.length === 0) {
    rows.push(createRow({
      check_group: 'discovery-surfaces',
      route: '__category_pagination__',
      artifact: toRepoRelative(options.publicRoot),
      status: 'pass',
      severity: 'none',
      finding: 'No category pagination routes were generated in the current build.'
    }));
    return;
  }

  for (const htmlFile of categoryPaginationFiles) {
    const route = normalizeRoute(routeFromHtmlPath(options.publicRoot, htmlFile));
    const robotsDecision = resolveRobotsRule(route, robotsData.wildcardRules);

    pushRow(rows, failures, createRow({
      check_group: 'discovery-surfaces',
      route,
      artifact: toRepoRelative(htmlFile),
      status: robotsDecision.blocked ? 'fail' : 'pass',
      severity: robotsDecision.blocked ? 'critical' : 'none',
      finding: robotsDecision.blocked
        ? `Category pagination route is blocked by robots.txt (${robotsDecision.matchedRule?.value ?? 'unknown rule'})`
        : 'Category pagination route remains crawlable under the production robots policy.'
    }));
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const rows = [];
  const failures = [];

  const manifestEntries = await loadManifest(options.manifestPath);
  const metadataInventory = await loadMetadataInventory(options.metadataReportPath);
  const redirectHelperRoutes = await collectRedirectHelperRoutes(options.publicRoot);
  const excludedManifestRoutes = collectLegacyManifestRoutes(
    manifestEntries,
    (entry) => entry.disposition === 'merge' || entry.disposition === 'retire'
  );

  const robotsSource = await readFile(options.robotsPath, 'utf8');
  const robotsData = parseRobotsFile(robotsSource);
  const expectedSitemapDirective = `${canonicalOrigin}/sitemap.xml`;

  pushRow(rows, failures, createRow({
    check_group: 'robots',
    route: '/robots.txt',
    artifact: toRepoRelative(options.robotsPath),
    status: robotsData.sitemapDirectives.includes(expectedSitemapDirective) ? 'pass' : 'fail',
    severity: robotsData.sitemapDirectives.includes(expectedSitemapDirective) ? 'none' : 'critical',
    finding: robotsData.sitemapDirectives.includes(expectedSitemapDirective)
      ? 'robots.txt contains the canonical sitemap directive.'
      : `robots.txt is missing the canonical sitemap directive (${expectedSitemapDirective}).`
  }));

  const sitemapEntries = await collectSitemapEntries(options.publicRoot, options.sitemapPath, rows, failures);
  const seenRoutes = new Set();
  const duplicateRoutes = new Set();
  const sitemapRouteSet = new Set();

  for (const entry of sitemapEntries) {
    const routeFailures = [];
    let route = '';

    try {
      const url = new URL(entry.loc);
      route = normalizeRoute(url.pathname);

      if (url.protocol !== 'https:') {
        routeFailures.push('Sitemap URL is not HTTPS');
      }

      if (`${url.protocol}//${url.host}` !== canonicalOrigin) {
        routeFailures.push('Sitemap URL host mismatch');
      }
    } catch {
      route = entry.loc;
      routeFailures.push('Sitemap URL is not a valid absolute URL');
    }

    if (route && seenRoutes.has(route)) {
      duplicateRoutes.add(route);
      routeFailures.push('Sitemap URL is duplicated');
    }
    seenRoutes.add(route);
    if (route) {
      sitemapRouteSet.add(route);
    }

    if (!entry.lastmod) {
      routeFailures.push('Sitemap URL is missing <lastmod>');
    } else if (!isIso8601(entry.lastmod)) {
      routeFailures.push(`Sitemap <lastmod> is not valid ISO 8601 (${entry.lastmod})`);
    }

    if (excludedManifestRoutes.has(route)) {
      routeFailures.push('Sitemap includes a merge or retire manifest route');
    }

    if (redirectHelperRoutes.has(route)) {
      routeFailures.push('Sitemap includes a redirect-helper alias page');
    }

    const metadataRow = metadataInventory.get(route);
    if (!metadataRow) {
      routeFailures.push('Sitemap route is missing from the metadata inventory');
    } else if (metadataRow.canonicalUrl !== entry.loc) {
      routeFailures.push(`Sitemap URL does not match metadata canonical (${metadataRow.canonicalUrl})`);
    }

    pushRow(rows, failures, createRow({
      check_group: 'sitemap-url',
      route,
      artifact: toRepoRelative(entry.sourceFile),
      status: routeFailures.length === 0 ? 'pass' : 'fail',
      severity: routeFailures.length === 0 ? 'none' : 'critical',
      sitemap_url: entry.loc,
      canonical_url: metadataInventory.get(route)?.canonicalUrl ?? '',
      lastmod: entry.lastmod,
      finding: routeFailures.join(' | ') || 'Sitemap URL is canonical, allowed, and metadata-consistent.'
    }));
  }

  for (const route of metadataInventory.keys()) {
    if (sitemapRouteSet.has(route)) {
      continue;
    }

    pushRow(rows, failures, createRow({
      check_group: 'sitemap-url',
      route,
      artifact: toRepoRelative(options.metadataReportPath),
      status: 'fail',
      severity: 'critical',
      canonical_url: metadataInventory.get(route)?.canonicalUrl ?? '',
      finding: 'Metadata inventory contains an indexable canonical route that is missing from the sitemap.'
    }));
  }

  const countDelta = Math.abs(sitemapRouteSet.size - metadataInventory.size);
  pushRow(rows, failures, createRow({
    check_group: 'sitemap-inventory',
    route: '__sitemap_inventory__',
    artifact: `${toRepoRelative(options.sitemapPath)} | ${toRepoRelative(options.metadataReportPath)}`,
    status: countDelta <= sitemapTolerance ? 'pass' : 'fail',
    severity: countDelta <= sitemapTolerance ? 'none' : 'critical',
    finding: countDelta <= sitemapTolerance
      ? 'Sitemap URL count matches the indexable metadata inventory within the documented tolerance.'
      : 'Sitemap URL count does not match the indexable metadata inventory within the documented tolerance.',
    details: `sitemap=${sitemapRouteSet.size}; metadata=${metadataInventory.size}; tolerance=${sitemapTolerance}`
  }));

  await validateFeed(options, rows, failures, robotsData);
  await validateDiscoverySurfaces(options, manifestEntries, rows, failures, robotsData);

  await mkdir(path.dirname(options.reportPath), { recursive: true });
  await writeFile(
    options.reportPath,
    stringifyCsv(rows, {
      header: true,
      columns: [
        'check_group',
        'route',
        'artifact',
        'status',
        'severity',
        'sitemap_url',
        'canonical_url',
        'lastmod',
        'finding',
        'details'
      ]
    }),
    'utf8'
  );

  if (failures.length > 0) {
    console.error('Sitemap and feed validation failed:\n');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    console.error(`\nReport written to ${toRepoRelative(options.reportPath)}.`);
    process.exitCode = 1;
    return;
  }

  console.log(`Sitemap and feed validation passed for ${sitemapRouteSet.size} sitemap URL(s).`);
  console.log(`Report written to ${toRepoRelative(options.reportPath)}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});