import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { load as loadHtml } from 'cheerio';
import { stringify as stringifyCsv } from 'csv-stringify/sync';
import fg from 'fast-glob';

import {
  canonicalOrigin,
  loadManifest,
  normalizeUrlLike,
  repoRoot,
  toPosixPath,
  toRepoRelative
} from '../migration/url-validation-helpers.js';
import {
  isWordPressHotlink,
  normalizeLocalMediaPath
} from '../migration/media-helpers.js';

const canonicalHost = new URL(canonicalOrigin).host.toLowerCase();
const supportedLocalHosts = new Set([
  canonicalHost,
  'rhino-inquisitor.com',
  'www.rhino-inquisitor.com',
  'therhinotimes.com',
  'www.therhinotimes.com',
  'taurgis.github.io'
]);
const severityRank = {
  none: 0,
  warning: 1,
  critical: 2
};
const defaults = {
  publicDir: path.join(repoRoot, 'public'),
  manifestPath: path.join(repoRoot, 'migration', 'url-manifest.json'),
  robotsPath: path.join(repoRoot, 'public', 'robots.txt'),
  reportPath: path.join(repoRoot, 'migration', 'reports', 'phase-5-image-audit.csv')
};

function printHelp() {
  console.log(`Usage: node scripts/seo/check-images.js [options]

Options:
  --public-dir <path>   Override built public directory (defaults to public).
  --manifest <path>     Override migration/url-manifest.json path.
  --robots-file <path>  Override built robots.txt path.
  --report <path>       Override audit CSV path.
  --help                Show this help message.
`);
}

function parseArgs(argv) {
  const options = { ...defaults };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case '--public-dir':
        options.publicDir = path.resolve(argv[++index]);
        options.robotsPath = path.join(options.publicDir, 'robots.txt');
        break;
      case '--manifest':
        options.manifestPath = path.resolve(argv[++index]);
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

function routeFromHtmlPath(publicDir, filePath) {
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

function normalizeRoute(route) {
  if (route === '/' || route === '/404.html') {
    return route;
  }

  return route.endsWith('/') ? route : `${route}/`;
}

function readMetaContent($, attributeName, attributeValue) {
  const match = $('meta').toArray().find((element) => {
    const candidate = ($(element).attr(attributeName) ?? '').trim().toLowerCase();
    return candidate === attributeValue;
  });

  return match ? ($(match).attr('content') ?? '').trim() : '';
}

function readRobotsSignals($) {
  const robots = readMetaContent($, 'name', 'robots');
  const googlebot = readMetaContent($, 'name', 'googlebot');
  const tokens = new Set(
    `${robots},${googlebot}`
      .toLowerCase()
      .split(/[\s,]+/u)
      .map((token) => token.trim())
      .filter(Boolean)
  );

  return {
    robots,
    googlebot,
    hasNoindex: tokens.has('noindex')
  };
}

function stripInlineComment(line) {
  const hashIndex = line.indexOf('#');
  return (hashIndex === -1 ? line : line.slice(0, hashIndex)).trim();
}

function parseRobotsFile(source) {
  const groups = [];
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
    }
  }

  flushCurrentGroup();

  return {
    wildcardRules: groups.find((group) => group.agents.includes('*'))?.rules ?? []
  };
}

function resolveRobotsRule(pathname, rules) {
  let bestRule = null;

  for (const rule of rules) {
    if (!rule.value || !pathname.startsWith(rule.value)) {
      continue;
    }

    const ruleLength = rule.value.length;
    const currentLength = bestRule?.value.length ?? -1;
    const sameLengthAllowWins = ruleLength === currentLength
      && rule.directive === 'allow'
      && bestRule?.directive === 'disallow';

    if (ruleLength > currentLength || sameLengthAllowWins) {
      bestRule = rule;
    }
  }

  return {
    matchedRule: bestRule,
    blocked: bestRule?.directive === 'disallow'
  };
}

function parseJsonLdBlocks(html) {
  const blocks = [];
  const pattern = /<script[^>]+type=(?:["']application\/ld\+json["']|application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/giu;

  for (const match of html.matchAll(pattern)) {
    const raw = match[1]?.trim() ?? '';
    if (!raw) {
      continue;
    }

    try {
      blocks.push(JSON.parse(raw));
    } catch {
      continue;
    }
  }

  return blocks;
}

function flattenJsonLdNodes(value) {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => flattenJsonLdNodes(entry));
  }

  if (!value || typeof value !== 'object') {
    return [];
  }

  const nodes = [];
  if ('@type' in value) {
    nodes.push(value);
  }

  if (Array.isArray(value['@graph'])) {
    nodes.push(...flattenJsonLdNodes(value['@graph']));
  }

  return nodes;
}

function findSchemaNodes(nodes, schemaType) {
  return nodes.filter((node) => [node?.['@type']].flat().includes(schemaType));
}

function asNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : '';
}

function highestSeverity(findings) {
  return findings.reduce((highest, finding) => {
    return severityRank[finding.severity] > severityRank[highest] ? finding.severity : highest;
  }, 'none');
}

function statusFromSeverity(severity) {
  if (severity === 'critical') {
    return 'fail';
  }

  if (severity === 'warning') {
    return 'warn';
  }

  return 'pass';
}

function createRow({
  scope,
  route,
  filePath,
  elementIndex = '',
  source = '',
  resolvedPath = '',
  alt = '',
  decorative = '',
  qualifyingSurface = '',
  width = '',
  height = '',
  findings
}) {
  const severity = highestSeverity(findings);
  return {
    scope,
    route,
    file_path: filePath,
    element_index: elementIndex,
    source,
    resolved_path: resolvedPath,
    alt_text: alt,
    decorative,
    qualifying_video_surface: qualifyingSurface,
    width,
    height,
    status: statusFromSeverity(severity),
    severity,
    findings: findings.map((finding) => finding.message).join(' | ')
  };
}

function isDecorativeImage(element) {
  const altValue = typeof element.attr('alt') === 'string' ? element.attr('alt').trim() : element.attr('alt');
  const role = (element.attr('role') ?? '').trim().toLowerCase();
  const ariaHidden = (element.attr('aria-hidden') ?? '').trim().toLowerCase();

  return altValue === '' && (role === 'presentation' || role === 'none' || ariaHidden === 'true');
}

function normalizeImageSource(value) {
  const trimmedValue = String(value ?? '').trim();
  if (!trimmedValue) {
    return null;
  }

  const isAbsoluteUrl = /^[a-z][a-z\d+.-]*:/iu.test(trimmedValue);
  const localPath = !isAbsoluteUrl ? normalizeLocalMediaPath(trimmedValue) : null;
  if (localPath) {
    return {
      kind: 'local',
      original: trimmedValue,
      localPath
    };
  }

  try {
    const parsed = new URL(trimmedValue, canonicalOrigin);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return {
        kind: 'other',
        original: trimmedValue
      };
    }

    const normalizedUrl = parsed.toString();
    if (supportedLocalHosts.has(parsed.host.toLowerCase())) {
      return {
        kind: 'local',
        original: trimmedValue,
        localPath: normalizeLocalMediaPath(`${parsed.pathname}${parsed.search}${parsed.hash}`) ?? parsed.pathname
      };
    }

    return {
      kind: 'external',
      original: trimmedValue,
      url: normalizedUrl
    };
  } catch {
    return {
      kind: 'other',
      original: trimmedValue
    };
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

function localPathToPublicFile(publicDir, localPath) {
  return path.join(publicDir, decodeURIComponent(localPath.replace(/^\/+/, '')));
}

function collectVideoRoutes(manifestEntries) {
  const routes = new Map();

  for (const entry of manifestEntries) {
    if (entry.url_class !== 'video' || entry.disposition === 'retire') {
      continue;
    }

    const rawTarget = entry.disposition === 'keep'
      ? (entry.target_url ?? entry.legacy_url)
      : entry.target_url;
    if (!rawTarget) {
      continue;
    }

    const routeInfo = normalizeUrlLike(rawTarget);
    if (routeInfo.hasQuery) {
      continue;
    }

    const route = normalizeRoute(routeInfo.comparablePathOnly);
    const current = routes.get(route) ?? {
      route,
      legacyUrls: new Set()
    };
    current.legacyUrls.add(entry.legacy_url);
    routes.set(route, current);
  }

  return [...routes.values()].sort((left, right) => left.route.localeCompare(right.route));
}

async function auditImages(htmlEntries, options) {
  const rows = [];

  for (const htmlEntry of htmlEntries) {
    htmlEntry.$('img').each((index, node) => {
      rows.push({ htmlEntry, index, node });
    });
  }

  const resolvedRows = [];

  for (const row of rows) {
    const { htmlEntry, index, node } = row;
    const element = htmlEntry.$(node);
    const src = asNonEmptyString(element.attr('src'));
    const altAttribute = element.attr('alt');
    const normalizedAlt = typeof altAttribute === 'string' ? altAttribute.trim() : altAttribute;
    const width = asNonEmptyString(element.attr('width'));
    const height = asNonEmptyString(element.attr('height'));
    const findings = [];
    const decorative = isDecorativeImage(element);
    let resolvedPath = '';

    if (!src) {
      findings.push({ severity: 'critical', message: 'img is missing src' });
    }

    if (altAttribute == null) {
      findings.push({ severity: 'critical', message: 'img is missing alt attribute' });
    } else if (normalizedAlt === '' && !decorative) {
      findings.push({ severity: 'critical', message: 'img has empty alt text without decorative markup' });
    }

    if (!width || !height) {
      findings.push({ severity: 'warning', message: 'img is missing intrinsic width and/or height' });
    }

    if (src && isWordPressHotlink(src)) {
      findings.push({ severity: 'critical', message: 'img src still points to legacy WordPress media' });
    }

    if (src) {
      const sourceInfo = normalizeImageSource(src);
      if (sourceInfo?.kind === 'local') {
        const publicFile = localPathToPublicFile(options.publicDir, sourceInfo.localPath);
        resolvedPath = toRepoRelative(publicFile);
        if (!(await fileExists(publicFile))) {
          findings.push({ severity: 'critical', message: `img src does not resolve in built output (${sourceInfo.localPath})` });
        }
      }
    }

    resolvedRows.push(createRow({
      scope: 'image',
      route: htmlEntry.route,
      filePath: htmlEntry.filePath,
      elementIndex: index + 1,
      source: src,
      resolvedPath,
      alt: normalizedAlt ?? '',
      decorative: decorative ? 'yes' : 'no',
      width,
      height,
      findings
    }));
  }

  return resolvedRows;
}

function validateVideoObject(videoNode, findings) {
  for (const field of ['name', 'description', 'thumbnailUrl', 'uploadDate']) {
    if (!asNonEmptyString(videoNode?.[field])) {
      findings.push({ severity: 'critical', message: `VideoObject is missing ${field}` });
    }
  }
}

function hasVideoWatchSurface($) {
  return $('iframe[src*="youtube.com"], iframe[src*="youtube-nocookie.com"], video, lite-youtube').length > 0;
}

async function auditVideoRoutes(htmlByRoute, robotsData, manifestEntries) {
  const rows = [];
  const keptVideoRoutes = collectVideoRoutes(manifestEntries);

  for (const videoRoute of keptVideoRoutes) {
    const htmlEntry = htmlByRoute.get(videoRoute.route);
    const findings = [];

    if (!htmlEntry) {
      findings.push({ severity: 'critical', message: 'kept video route is missing from built output' });
      rows.push(createRow({
        scope: 'video-route',
        route: videoRoute.route,
        filePath: '',
        source: [...videoRoute.legacyUrls].join('|'),
        findings
      }));
      continue;
    }

    const signals = readRobotsSignals(htmlEntry.$);
    const routeInfo = normalizeUrlLike(videoRoute.route);
    const robotsDecision = resolveRobotsRule(routeInfo.pathname, robotsData.wildcardRules);

    if (signals.hasNoindex) {
      findings.push({ severity: 'critical', message: 'video route has noindex' });
    }

    if (robotsDecision.blocked) {
      findings.push({ severity: 'critical', message: `video route is blocked by robots.txt (${robotsDecision.matchedRule?.value ?? 'unknown rule'})` });
    }

    const nodes = parseJsonLdBlocks(htmlEntry.html).flatMap((block) => flattenJsonLdNodes(block));
    const videoNodes = findSchemaNodes(nodes, 'VideoObject');
    const qualifyingVideoSurface = hasVideoWatchSurface(htmlEntry.$);

    if (!qualifyingVideoSurface && videoNodes.length > 0) {
      findings.push({ severity: 'critical', message: 'VideoObject is emitted on a route without a qualifying on-page video surface' });
    }

    for (const videoNode of videoNodes) {
      validateVideoObject(videoNode, findings);
    }

    rows.push(createRow({
      scope: 'video-route',
      route: videoRoute.route,
      filePath: htmlEntry.filePath,
      source: [...videoRoute.legacyUrls].join('|'),
      qualifyingSurface: qualifyingVideoSurface ? 'yes' : 'no',
      findings
    }));
  }

  return rows;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const htmlFiles = (await fg('**/*.html', {
    cwd: options.publicDir,
    absolute: true,
    onlyFiles: true,
    suppressErrors: true
  })).sort((left, right) => left.localeCompare(right));

  if (htmlFiles.length === 0) {
    throw new Error(`No built HTML files found under ${toRepoRelative(options.publicDir)}. Run a production build first.`);
  }

  const robotsSource = await readFile(options.robotsPath, 'utf8');
  const robotsData = parseRobotsFile(robotsSource);
  const manifestEntries = await loadManifest(options.manifestPath);
  const htmlEntries = [];
  const htmlByRoute = new Map();

  for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, 'utf8');
    const $ = loadHtml(html);
    const route = normalizeRoute(routeFromHtmlPath(options.publicDir, htmlFile));
    const htmlEntry = {
      route,
      filePath: toRepoRelative(htmlFile),
      html,
      $
    };
    htmlEntries.push(htmlEntry);
    htmlByRoute.set(route, htmlEntry);
  }

  const rows = [
    ...(await auditImages(htmlEntries, options)),
    ...(await auditVideoRoutes(htmlByRoute, robotsData, manifestEntries))
  ].sort((left, right) => {
    if (left.scope !== right.scope) {
      return left.scope.localeCompare(right.scope);
    }

    if (left.route !== right.route) {
      return left.route.localeCompare(right.route);
    }

    return String(left.element_index).localeCompare(String(right.element_index));
  });

  await mkdir(path.dirname(options.reportPath), { recursive: true });
  await writeFile(
    options.reportPath,
    `${stringifyCsv(rows, {
      header: true,
      columns: [
        'scope',
        'route',
        'file_path',
        'element_index',
        'source',
        'resolved_path',
        'alt_text',
        'decorative',
        'qualifying_video_surface',
        'width',
        'height',
        'status',
        'severity',
        'findings'
      ]
    })}\n`,
    'utf8'
  );

  const blockingRows = rows.filter((row) => row.status === 'fail');
  const warningRows = rows.filter((row) => row.status === 'warn');

  if (blockingRows.length > 0) {
    console.error('Image and video SEO validation failed:\n');
    for (const row of blockingRows) {
      console.error(`- [${row.scope}] ${row.route}${row.element_index ? `#${row.element_index}` : ''}: ${row.findings}`);
    }
    console.error(`\nReport written to ${toRepoRelative(options.reportPath)}.`);
    process.exitCode = 1;
    return;
  }

  console.log(`Image and video SEO validation passed for ${rows.length} audit row(s).`);
  if (warningRows.length > 0) {
    console.log(`Warnings: ${warningRows.length}.`);
  }
  console.log(`Report written to ${toRepoRelative(options.reportPath)}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});