import fs from 'node:fs/promises';
import path from 'node:path';

import { load as loadHtml } from 'cheerio';
import { stringify as stringifyCsv } from 'csv-stringify/sync';
import fg from 'fast-glob';

import {
  extractRedirectDetails,
  loadManifest,
  normalizeUrlLike,
  repoRoot,
  toRepoRelative
} from '../migration/url-validation-helpers.js';

const defaults = {
  manifestPath: path.join(repoRoot, 'migration/url-manifest.json'),
  publicRoot: path.join(repoRoot, 'public'),
  robotsPath: path.join(repoRoot, 'public/robots.txt'),
  reportPath: path.join(repoRoot, 'migration/reports/phase-5-crawl-control-audit.csv'),
  mode: 'production',
  baseUrl: 'https://www.rhino-inquisitor.com/'
};

const validModes = new Set(['production', 'preview']);

function printHelp() {
  console.log(`Usage: node scripts/seo/check-crawl-controls.js [options]

Options:
  --manifest <path>    Override manifest path.
  --public-dir <path>  Override built public directory (defaults to public).
  --robots-file <path> Override robots.txt path (defaults to public/robots.txt).
  --report <path>      Override audit CSV path.
  --mode <mode>        Validation mode: production or preview.
  --base-url <url>     Expected site base URL for sitemap validation.
  --help               Show this help message.
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
      case '--public-dir':
        options.publicRoot = path.resolve(argv[++index]);
        options.robotsPath = path.join(options.publicRoot, 'robots.txt');
        break;
      case '--robots-file':
        options.robotsPath = path.resolve(argv[++index]);
        break;
      case '--report':
        options.reportPath = path.resolve(argv[++index]);
        break;
      case '--mode': {
        const mode = argv[++index]?.trim();
        if (!validModes.has(mode)) {
          throw new Error(`Unknown crawl-control mode: ${mode}`);
        }
        options.mode = mode;
        break;
      }
      case '--base-url':
        options.baseUrl = argv[++index]?.trim();
        break;
      case '--help':
        options.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.baseUrl) {
    throw new Error('Expected a non-empty --base-url value.');
  }

  return options;
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

function normalizeRoute(route) {
  if (route === '/' || route === '/404.html') {
    return route;
  }

  return route.endsWith('/') ? route : `${route}/`;
}

function is404Route(route) {
  return route === '/404.html' || route === '/404/';
}

function isFeedRoute(route) {
  return route === '/index.xml' || route.startsWith('/feed/');
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
    hasNoindex: tokens.has('noindex'),
    hasNofollow: tokens.has('nofollow')
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

  const sitemapDirectives = [];

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
      currentRules.push({
        directive,
        value
      });
      continue;
    }

    if (directive === 'sitemap') {
      sitemapDirectives.push(value);
    }
  }

  flushCurrentGroup();

  const wildcardGroup = groups.find((group) => group.agents.includes('*'));

  return {
    groups,
    wildcardRules: wildcardGroup?.rules ?? [],
    wildcardPresent: Boolean(wildcardGroup),
    sitemapDirectives
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

function collectManifestIndexIntent(manifestEntries) {
  const indexIntent = new Map();

  for (const entry of manifestEntries) {
    if (entry.disposition === 'retire') {
      continue;
    }

    const rawTarget = entry.disposition === 'keep'
      ? (entry.target_url ?? entry.legacy_url)
      : entry.target_url;

    if (!rawTarget) {
      continue;
    }

    const targetInfo = normalizeUrlLike(rawTarget);
    if (targetInfo.hasQuery) {
      continue;
    }

    const route = normalizeRoute(targetInfo.comparablePathOnly);
    const current = indexIntent.get(route) ?? {
      dispositions: new Set(),
      sources: new Set()
    };
    current.dispositions.add(entry.disposition);
    current.sources.add(entry.legacy_url);
    indexIntent.set(route, current);
  }

  return indexIntent;
}

function createRobotsRow({ options, robotsData, findings }) {
  const status = findings.length === 0 ? 'pass' : 'fail';
  return {
    route: '/robots.txt',
    file_path: toRepoRelative(options.robotsPath),
    mode: options.mode,
    expected_indexable: 'n/a',
    manifest_indexable: 'n/a',
    redirect_page: 'n/a',
    robots_meta: '',
    googlebot_meta: '',
    has_noindex: 'n/a',
    blocked_by_robots: resolveRobotsRule('/', robotsData.wildcardRules).blocked ? 'yes' : 'no',
    matched_rule: resolveRobotsRule('/', robotsData.wildcardRules).matchedRule?.value ?? '',
    status,
    findings: findings.join(' | ')
  };
}

function createHtmlRow({
  htmlFile,
  route,
  options,
  manifestIndexable,
  expectedIndexable,
  redirectPage,
  signals,
  robotsDecision,
  findings
}) {
  return {
    route,
    file_path: toRepoRelative(htmlFile),
    mode: options.mode,
    expected_indexable: expectedIndexable ? 'yes' : 'no',
    manifest_indexable: manifestIndexable ? 'yes' : 'no',
    redirect_page: redirectPage ? 'yes' : 'no',
    robots_meta: signals.robots,
    googlebot_meta: signals.googlebot,
    has_noindex: signals.hasNoindex ? 'yes' : 'no',
    blocked_by_robots: robotsDecision.blocked ? 'yes' : 'no',
    matched_rule: robotsDecision.matchedRule?.value ?? '',
    status: findings.length === 0 ? 'pass' : 'fail',
    findings: findings.join(' | ')
  };
}

async function writeCsv(filePath, rows) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(
    filePath,
    stringifyCsv(rows, {
      header: true,
      columns: [
        'route',
        'file_path',
        'mode',
        'expected_indexable',
        'manifest_indexable',
        'redirect_page',
        'robots_meta',
        'googlebot_meta',
        'has_noindex',
        'blocked_by_robots',
        'matched_rule',
        'status',
        'findings'
      ]
    }),
    'utf8'
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const htmlFiles = (await fg('**/*.html', {
    cwd: options.publicRoot,
    absolute: true,
    onlyFiles: true,
    suppressErrors: true
  })).sort((left, right) => left.localeCompare(right));

  if (htmlFiles.length === 0) {
    throw new Error(`No built HTML files found under ${options.publicRoot}.`);
  }

  const manifestEntries = await loadManifest(options.manifestPath);
  const manifestIndexIntent = collectManifestIndexIntent(manifestEntries);
  const robotsSource = await fs.readFile(options.robotsPath, 'utf8');
  const robotsData = parseRobotsFile(robotsSource);
  const expectedSitemapUrl = new URL('sitemap.xml', options.baseUrl).toString();
  const robotsFindings = [];

  if (!robotsData.wildcardPresent) {
    robotsFindings.push('missing User-agent: * group');
  }

  if (!robotsData.sitemapDirectives.includes(expectedSitemapUrl)) {
    robotsFindings.push(`missing sitemap directive for ${expectedSitemapUrl}`);
  }

  const rootDecision = resolveRobotsRule('/', robotsData.wildcardRules);
  if (options.mode === 'preview' && rootDecision.blocked) {
    robotsFindings.push('preview robots.txt blocks the site root; preview must remain crawlable noindex');
  }

  const rows = [createRobotsRow({ options, robotsData, findings: robotsFindings })];
  const blockingMessages = robotsFindings.map((finding) => `/robots.txt: ${finding}`);

  for (const htmlFile of htmlFiles) {
    const htmlSource = await fs.readFile(htmlFile, 'utf8');
    const route = normalizeRoute(routeFromHtmlPath(options.publicRoot, htmlFile));
    const $ = loadHtml(htmlSource);
    const redirectDetails = extractRedirectDetails(htmlSource);
    const signals = readRobotsSignals($);
    const routeInfo = normalizeUrlLike(route);
    const robotsDecision = resolveRobotsRule(routeInfo.pathname, robotsData.wildcardRules);
    const manifestIndexable = manifestIndexIntent.has(route);
    const specialNonIndexable = is404Route(route) || isFeedRoute(route) || redirectDetails.isRedirectPage;
    const expectedIndexable = options.mode === 'production'
      ? !specialNonIndexable
      : false;
    const findings = [];

    if (options.mode === 'production') {
      if (expectedIndexable && signals.hasNoindex) {
        findings.push('unexpected noindex on indexable route');
      }

      if (expectedIndexable && robotsDecision.blocked) {
        findings.push(`indexable route blocked by robots.txt (${robotsDecision.matchedRule?.value ?? 'unknown rule'})`);
      }

      if (signals.hasNoindex && robotsDecision.blocked) {
        findings.push('robots/noindex contradiction on crawl-blocked route');
      }

      if (is404Route(route) && !signals.hasNoindex) {
        findings.push('404 route is missing an explicit noindex directive');
      }
    } else {
      if (!signals.hasNoindex) {
        findings.push('preview route is missing a noindex directive');
      }

      if (!signals.hasNofollow) {
        findings.push('preview route is missing a nofollow directive');
      }

      if (robotsDecision.blocked) {
        findings.push(`preview route is blocked by robots.txt (${robotsDecision.matchedRule?.value ?? 'unknown rule'})`);
      }
    }

    const row = createHtmlRow({
      htmlFile,
      route,
      options,
      manifestIndexable,
      expectedIndexable,
      redirectPage: redirectDetails.isRedirectPage,
      signals,
      robotsDecision,
      findings
    });

    rows.push(row);

    for (const finding of findings) {
      blockingMessages.push(`${route}: ${finding}`);
    }
  }

  await writeCsv(options.reportPath, rows);

  if (blockingMessages.length > 0) {
    console.error(`Crawl-control validation failed in ${options.mode} mode:\n`);
    for (const message of blockingMessages) {
      console.error(`- ${message}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    `Crawl-control validation passed for ${rows.length - 1} HTML route(s) in ${options.mode} mode. Report: ${toRepoRelative(options.reportPath)}`
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
