import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { load as loadHtml } from 'cheerio';
import fg from 'fast-glob';
import { XMLParser } from 'fast-xml-parser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

const defaults = {
  publicDir: path.join(repoRoot, 'public'),
  manifestPath: path.join(repoRoot, 'url-data', 'url-manifest.json'),
  expectedOrigin: 'https://staging.rhino-inquisitor.com/',
  crawlMode: 'blocked',
  reportPath: ''
};

const validCrawlModes = new Set(['blocked', 'indexable']);
const knownInternalHosts = new Set([
  'staging.rhino-inquisitor.com',
  'rhino-inquisitor.com',
  'rhino-inquisitor.com',
  'taurgis.github.io'
]);

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  trimValues: true
});

function printHelp() {
  console.log(`Usage: node scripts/gates/check-seo-safe-deploy.js [options]

Options:
  --public-dir <path>        Override the built public directory.
  --manifest <path>          Override the migration manifest path.
  --expected-origin <url>    Expected absolute HTTPS origin and optional base path.
  --crawl-mode <mode>        Crawl policy mode: blocked or indexable.
  --report <path>            Optional JSON report output path.
  --help                     Show this help message.
`);
}

function parseArgs(argv) {
  const options = { ...defaults, help: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case '--public-dir':
        options.publicDir = path.resolve(argv[++index]);
        break;
      case '--manifest':
        options.manifestPath = path.resolve(argv[++index]);
        break;
      case '--expected-origin':
        options.expectedOrigin = argv[++index]?.trim() ?? '';
        break;
      case '--crawl-mode': {
        const crawlMode = argv[++index]?.trim();
        if (!validCrawlModes.has(crawlMode)) {
          throw new Error(`Unknown crawl mode: ${crawlMode}`);
        }
        options.crawlMode = crawlMode;
        break;
      }
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

  if (!options.expectedOrigin) {
    throw new Error('Expected a non-empty --expected-origin value.');
  }

  options.expectedOrigin = normalizeExpectedOrigin(options.expectedOrigin);
  return options;
}

function normalizeExpectedOrigin(rawUrl) {
  const normalized = new URL(rawUrl);
  normalized.protocol = 'https:';
  const trimmedPath = normalized.pathname.replace(/\/+$/u, '');
  normalized.pathname = trimmedPath ? `${trimmedPath}/` : '/';
  normalized.hash = '';
  normalized.search = '';
  return normalized.toString();
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function toRepoRelative(filePath) {
  return toPosixPath(path.relative(repoRoot, filePath));
}

function normalizeRoute(route) {
  if (!route || route === '/') {
    return '/';
  }

  if (route === '/404.html') {
    return route;
  }

  return route.endsWith('/') ? route : `${route}/`;
}

function routeFromHtmlPath(filePath, publicDir) {
  const relativePath = toPosixPath(path.relative(publicDir, filePath));

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

function basePathFromExpectedOrigin(expectedOrigin) {
  const parsed = new URL(expectedOrigin);
  return parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/$/u, '');
}

function toExpectedUrl(route, expectedOrigin) {
  const parsed = new URL(expectedOrigin);
  const basePath = basePathFromExpectedOrigin(expectedOrigin);

  if (route === '/') {
    parsed.pathname = basePath ? `${basePath}/` : '/';
    return parsed.toString();
  }

  if (route === '/404.html') {
    parsed.pathname = `${basePath}/404.html`;
    return parsed.toString();
  }

  parsed.pathname = `${basePath}${route}`;
  return parsed.toString();
}

function stripExpectedBasePath(pathname, expectedOrigin) {
  const basePath = basePathFromExpectedOrigin(expectedOrigin);
  if (!basePath) {
    return pathname || '/';
  }

  if (pathname === basePath) {
    return '/';
  }

  if (pathname.startsWith(`${basePath}/`)) {
    const stripped = pathname.slice(basePath.length);
    return stripped || '/';
  }

  return pathname || '/';
}

function isKnownInternalHost(hostname) {
  return knownInternalHosts.has(hostname.toLowerCase());
}

function isRedirectPage($) {
  return $('meta[http-equiv]').toArray().some((element) => {
    const value = ($(element).attr('http-equiv') ?? '').trim().toLowerCase();
    return value === 'refresh';
  });
}

function readCanonicalHref($) {
  const link = $('link[rel]').toArray().find((element) => {
    const rel = ($(element).attr('rel') ?? '').trim().toLowerCase().split(/\s+/u).filter(Boolean);
    return rel.includes('canonical');
  });

  return link ? ($(link).attr('href') ?? '').trim() : '';
}

function readMetaContent($, attributeName, attributeValue) {
  const match = $('meta').toArray().find((element) => {
    const candidate = ($(element).attr(attributeName) ?? '').trim().toLowerCase();
    return candidate === attributeValue;
  });

  return match ? ($(match).attr('content') ?? '').trim() : '';
}

function readRobotsTokens($) {
  const content = [
    readMetaContent($, 'name', 'robots'),
    readMetaContent($, 'name', 'googlebot')
  ]
    .join(',')
    .toLowerCase();

  return new Set(
    content
      .split(/[\s,]+/u)
      .map((token) => token.trim())
      .filter(Boolean)
  );
}

function collectJsonLdUrls(value, collected = []) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectJsonLdUrls(item, collected);
    }
    return collected;
  }

  if (value && typeof value === 'object') {
    for (const childValue of Object.values(value)) {
      collectJsonLdUrls(childValue, collected);
    }
    return collected;
  }

  if (typeof value === 'string' && /^https?:\/\//u.test(value.trim())) {
    collected.push(value.trim());
  }

  return collected;
}

function parseJsonLdUrls(htmlSource) {
  const urls = [];

  for (const match of htmlSource.matchAll(/<script[^>]+type=(?:["']application\/ld\+json["']|application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/giu)) {
    const raw = match[1]?.trim();
    if (!raw) {
      continue;
    }

    try {
      const parsed = JSON.parse(raw);
      collectJsonLdUrls(parsed, urls);
    } catch (error) {
      urls.push(`__invalid_json_ld__:${error.message}`);
    }
  }

  return urls;
}

function normalizeLegacyRoute(value) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return '';
  }

  const trimmed = value.trim();
  if (/^https?:\/\//u.test(trimmed)) {
    const parsed = new URL(trimmed);
    return normalizeRoute(parsed.pathname);
  }

  if (!trimmed.startsWith('/')) {
    return '';
  }

  return normalizeRoute(trimmed.split(/[?#]/u)[0]);
}

async function loadRedirectSourceRoutes(manifestPath) {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const routes = new Set();

  for (const entry of Array.isArray(manifest) ? manifest : []) {
    if (!['merge', 'retire'].includes(String(entry?.disposition ?? ''))) {
      continue;
    }

    const route = normalizeLegacyRoute(entry?.legacy_url);
    if (route) {
      routes.add(route);
    }
  }

  return routes;
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

  return {
    groups,
    sitemapDirectives,
    wildcardGroup: groups.find((group) => group.agents.includes('*')) ?? null
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

    const candidateLength = rule.value.length;
    const currentLength = bestRule?.value.length ?? -1;
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

function collectXmlLocs(node, collected = []) {
  if (Array.isArray(node)) {
    for (const entry of node) {
      collectXmlLocs(entry, collected);
    }
    return collected;
  }

  if (!node || typeof node !== 'object') {
    return collected;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key === 'loc') {
      if (Array.isArray(value)) {
        for (const locValue of value) {
          collected.push(String(locValue).trim());
        }
      } else {
        collected.push(String(value).trim());
      }
      continue;
    }

    collectXmlLocs(value, collected);
  }

  return collected;
}

function collectFeedLinkUrls(source) {
  const urls = [];

  for (const match of source.matchAll(/<link>(https?:\/\/[^<]+)<\/link>/giu)) {
    urls.push(match[1].trim());
  }

  for (const match of source.matchAll(/<atom:link\b[^>]*\shref=(?:"([^"]+)"|'([^']+)')[^>]*>/giu)) {
    urls.push((match[1] ?? match[2] ?? '').trim());
  }

  return urls.filter(Boolean);
}

function checkAbsoluteInternalUrl({
  rawUrl,
  expectedOrigin,
  redirectSourceRoutes,
  publishedRouteStates,
  findings,
  context
}) {
  let parsed;

  try {
    parsed = new URL(rawUrl);
  } catch {
    findings.push(`${context}: invalid absolute URL (${rawUrl})`);
    return;
  }

  if (!isKnownInternalHost(parsed.hostname)) {
    return;
  }

  if (parsed.protocol !== 'https:') {
    findings.push(`${context}: internal URL is not HTTPS (${rawUrl})`);
  }

  if (!rawUrl.startsWith(expectedOrigin)) {
    findings.push(`${context}: internal URL does not match expected host or base path (${rawUrl})`);
  }

  const route = normalizeRoute(stripExpectedBasePath(parsed.pathname, expectedOrigin));
  const publishedRouteState = publishedRouteStates?.get(route);
  const redirectsInArtifact = publishedRouteState?.redirectPage === true;
  const unpublishedRoute = !publishedRouteState && route !== '/index.xml';

  if (redirectSourceRoutes.has(route) && (redirectsInArtifact || unpublishedRoute)) {
    findings.push(`${context}: internal URL targets redirect-source route (${rawUrl})`);
  }
}

function collectAnchorFindings({
  $, route, expectedOrigin, redirectSourceRoutes, publishedRouteStates, findings
}) {
  const pageUrl = toExpectedUrl(route, expectedOrigin);

  $('a[href]').each((_, element) => {
    const href = ($(element).attr('href') ?? '').trim();
    if (!href || href.startsWith('#') || /^(?:mailto|tel|javascript|data):/iu.test(href)) {
      return;
    }

    let resolved;
    try {
      resolved = new URL(href, pageUrl);
    } catch {
      findings.push(`anchor href is not a valid URL (${href})`);
      return;
    }

    if (!isKnownInternalHost(resolved.hostname)) {
      return;
    }

    if (resolved.protocol !== 'https:') {
      findings.push(`anchor href is not HTTPS (${resolved.toString()})`);
    }

    if (!resolved.toString().startsWith(expectedOrigin)) {
      findings.push(`anchor href does not match expected host or base path (${resolved.toString()})`);
    }

    const routeTarget = normalizeRoute(stripExpectedBasePath(resolved.pathname, expectedOrigin));
    const publishedRouteState = publishedRouteStates.get(routeTarget);
    const redirectsInArtifact = publishedRouteState?.redirectPage === true;
    const unpublishedRoute = !publishedRouteState;

    if (redirectSourceRoutes.has(routeTarget) && (redirectsInArtifact || unpublishedRoute)) {
      findings.push(`anchor href targets redirect-source route (${resolved.toString()})`);
    }
  });
}

async function collectHtmlPages(publicDir) {
  const htmlFiles = (await fg('**/*.html', {
    cwd: publicDir,
    absolute: true,
    onlyFiles: true,
    dot: true
  })).sort();

  if (htmlFiles.length === 0) {
    throw new Error(`No built HTML files found under ${toRepoRelative(publicDir) || '.'}. Run a build first.`);
  }

  const pages = [];

  for (const htmlFile of htmlFiles) {
    const htmlSource = await readFile(htmlFile, 'utf8');
    const $ = loadHtml(htmlSource);
    const route = normalizeRoute(routeFromHtmlPath(htmlFile, publicDir));

    pages.push({
      htmlFile,
      htmlSource,
      $,
      route,
      redirectPage: isRedirectPage($)
    });
  }

  return pages;
}

async function validateHtmlFiles(options, redirectSourceRoutes) {
  const pages = await collectHtmlPages(options.publicDir);
  const publishedRouteStates = new Map(
    pages.map((page) => [page.route, { redirectPage: page.redirectPage }])
  );

  const findings = [];
  let checkedRoutes = 0;

  for (const page of pages) {
    const { htmlSource, $, route, redirectPage } = page;
    const robotsTokens = readRobotsTokens($);
    const canonicalHref = readCanonicalHref($);
    const ogUrl = readMetaContent($, 'property', 'og:url');

    checkedRoutes += 1;

    if (!redirectPage) {
      const expectedUrl = toExpectedUrl(route, options.expectedOrigin);
      const isPagination = /\/page\/\d+\/$/u.test(route);

      if (!canonicalHref) {
        findings.push(`${route}: missing canonical href`);
      } else if (canonicalHref !== expectedUrl && !isPagination) {
        findings.push(`${route}: canonical mismatch (${canonicalHref} != ${expectedUrl})`);
      }

      if (!ogUrl) {
        findings.push(`${route}: missing og:url`);
      } else if (ogUrl !== expectedUrl && !isPagination) {
        findings.push(`${route}: og:url mismatch (${ogUrl} != ${expectedUrl})`);
      }

      for (const jsonLdUrl of parseJsonLdUrls(htmlSource)) {
        if (jsonLdUrl.startsWith('__invalid_json_ld__:')) {
          findings.push(`${route}: ${jsonLdUrl.replace('__invalid_json_ld__:', 'invalid JSON-LD: ')}`);
          continue;
        }

        checkAbsoluteInternalUrl({
          rawUrl: jsonLdUrl,
          expectedOrigin: options.expectedOrigin,
          redirectSourceRoutes,
          publishedRouteStates,
          findings,
          context: `${route}: JSON-LD`
        });
      }

      collectAnchorFindings({
        $,
        route,
        expectedOrigin: options.expectedOrigin,
        redirectSourceRoutes,
        publishedRouteStates,
        findings
      });
    }

    if (options.crawlMode === 'blocked') {
      if (!robotsTokens.has('noindex')) {
        findings.push(`${route}: blocked crawl mode requires noindex`);
      }
    } else if (!redirectPage && route !== '/404.html' && robotsTokens.has('noindex')) {
      findings.push(`${route}: indexable crawl mode forbids noindex`);
    }
  }

  return {
    checkedRoutes,
    findings,
    publishedRouteStates
  };
}

async function validateRobots(options) {
  const robotsPath = path.join(options.publicDir, 'robots.txt');
  const robotsSource = await readFile(robotsPath, 'utf8');
  const parsed = parseRobotsFile(robotsSource);
  const findings = [];
  const expectedSitemap = new URL('sitemap.xml', options.expectedOrigin).toString();
  const wildcardRules = parsed.wildcardGroup?.rules ?? [];
  const rootDecision = resolveRobotsRule('/', wildcardRules);

  if (!parsed.wildcardGroup) {
    findings.push('robots.txt is missing a User-agent: * group');
  }

  if (!parsed.sitemapDirectives.includes(expectedSitemap)) {
    findings.push(`robots.txt is missing Sitemap: ${expectedSitemap}`);
  }

  if (options.crawlMode === 'blocked') {
    if (!rootDecision.blocked) {
      findings.push('blocked crawl mode requires Disallow: / on robots.txt');
    }
  } else if (rootDecision.blocked) {
    findings.push('indexable crawl mode forbids Disallow: / on robots.txt');
  }

  return {
    findings,
    robotsPath: toRepoRelative(robotsPath),
    expectedSitemap
  };
}

async function validateSitemaps(options, redirectSourceRoutes, publishedRouteStates) {
  const sitemapFiles = (await fg('sitemap*.xml', {
    cwd: options.publicDir,
    absolute: true,
    onlyFiles: true,
    dot: true
  })).sort();

  if (sitemapFiles.length === 0) {
    throw new Error(`No sitemap XML files found under ${toRepoRelative(options.publicDir) || '.'}.`);
  }

  const findings = [];
  let totalLocs = 0;

  for (const sitemapFile of sitemapFiles) {
    const xmlSource = await readFile(sitemapFile, 'utf8');
    const parsed = xmlParser.parse(xmlSource);
    const locs = collectXmlLocs(parsed);

    for (const loc of locs) {
      totalLocs += 1;
      let parsed;

      try {
        parsed = new URL(loc);
      } catch {
        findings.push(`${toRepoRelative(sitemapFile)} <loc>: invalid absolute URL (${loc})`);
        continue;
      }

      if (parsed.protocol !== 'https:') {
        findings.push(`${toRepoRelative(sitemapFile)} <loc>: internal URL is not HTTPS (${loc})`);
      }

      if (!loc.startsWith(options.expectedOrigin)) {
        findings.push(`${toRepoRelative(sitemapFile)} <loc>: internal URL does not match expected host or base path (${loc})`);
      }

      const route = normalizeRoute(stripExpectedBasePath(parsed.pathname, options.expectedOrigin));
      const publishedRouteState = publishedRouteStates.get(route);
      const redirectsInArtifact = publishedRouteState?.redirectPage === true;
      const unpublishedRoute = !publishedRouteState && route !== '/index.xml';

      if (redirectSourceRoutes.has(route) && (redirectsInArtifact || unpublishedRoute)) {
        findings.push(`${toRepoRelative(sitemapFile)} <loc>: internal URL targets redirect-source route (${loc})`);
      }
    }
  }

  return {
    checkedFiles: sitemapFiles.map(toRepoRelative),
    totalLocs,
    findings
  };
}

async function validateFeed(options, redirectSourceRoutes, publishedRouteStates) {
  const feedPath = path.join(options.publicDir, 'index.xml');
  const feedSource = await readFile(feedPath, 'utf8');
  const findings = [];
  const absoluteUrls = collectFeedLinkUrls(feedSource);

  if (absoluteUrls.length === 0) {
    findings.push('feed is missing absolute URLs');
  }

  let internalUrlCount = 0;
  for (const rawUrl of absoluteUrls) {
    const parsed = new URL(rawUrl);
    if (!isKnownInternalHost(parsed.hostname)) {
      continue;
    }

    internalUrlCount += 1;
    if (parsed.protocol !== 'https:') {
      findings.push(`index.xml: internal URL is not HTTPS (${rawUrl})`);
    }

    if (!rawUrl.startsWith(options.expectedOrigin)) {
      findings.push(`index.xml: internal URL does not match expected host or base path (${rawUrl})`);
    }

    const route = normalizeRoute(stripExpectedBasePath(parsed.pathname, options.expectedOrigin));
    const publishedRouteState = publishedRouteStates.get(route);
    const redirectsInArtifact = publishedRouteState?.redirectPage === true;
    const unpublishedRoute = !publishedRouteState && route !== '/index.xml';

    if (redirectSourceRoutes.has(route) && (redirectsInArtifact || unpublishedRoute)) {
      findings.push(`index.xml: internal URL targets redirect-source route (${rawUrl})`);
    }
  }

  if (internalUrlCount === 0) {
    findings.push('feed is missing internal canonical URLs');
  }

  return {
    feedPath: toRepoRelative(feedPath),
    internalUrlCount,
    findings
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const redirectSourceRoutes = await loadRedirectSourceRoutes(options.manifestPath);
  const html = await validateHtmlFiles(options, redirectSourceRoutes);
  const robots = await validateRobots(options);
  const sitemap = await validateSitemaps(options, redirectSourceRoutes, html.publishedRouteStates);
  const feed = await validateFeed(options, redirectSourceRoutes, html.publishedRouteStates);

  const allFindings = [
    ...html.findings,
    ...robots.findings,
    ...sitemap.findings,
    ...feed.findings
  ];

  const report = {
    status: allFindings.length === 0 ? 'pass' : 'fail',
    expectedOrigin: options.expectedOrigin,
    crawlMode: options.crawlMode,
    checkedRoutes: html.checkedRoutes,
    checkedSitemapFiles: sitemap.checkedFiles,
    checkedSitemapLocs: sitemap.totalLocs,
    feedPath: feed.feedPath,
    findings: allFindings
  };

  if (options.reportPath) {
    await mkdir(path.dirname(options.reportPath), { recursive: true });
    await writeFile(options.reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }

  console.log(JSON.stringify(report, null, 2));

  if (allFindings.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
