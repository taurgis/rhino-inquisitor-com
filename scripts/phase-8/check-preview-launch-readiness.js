import fs from 'node:fs/promises';
import path from 'node:path';

import { load as loadHtml } from 'cheerio';
import { XMLParser } from 'fast-xml-parser';

import {
  getArtifactProvenance,
  phase8SeoDefaults,
  readMetaContent,
  readRobotsTokens,
  writeJsonReport
} from './seo-gate-helpers.js';
import { normalizeUrlLike, repoRoot, toRepoRelative } from '../migration/url-validation-helpers.js';

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  trimValues: true
});

const defaults = {
  baseUrl: 'https://taurgis.github.io/rhino-inquisitor-com/',
  sampleMatrixPath: phase8SeoDefaults.sampleMatrixPath,
  priorityRoutesPath: phase8SeoDefaults.priorityRoutesPath,
  reportPath: path.join(repoRoot, 'validation', 'preview-launch-readiness-report.json'),
  markdownPath: path.join(repoRoot, 'migration', 'phase-8-smoke-test-results.md'),
  requestTimeoutMs: 10000,
  maxRedirects: 10,
  feedPath: '/index.xml',
  sitemapPath: '/sitemap.xml',
  robotsPath: '/robots.txt'
};

function printHelp() {
  console.log(`Usage: node scripts/phase-8/check-preview-launch-readiness.js [options]

Options:
  --base-url <url>           Preview-host entrypoint to resolve and test.
  --sample-matrix <path>     Override validation/sample-matrix.json.
  --priority-routes <path>   Override validation/priority-routes.json.
  --report <path>            Override validation/preview-launch-readiness-report.json.
  --markdown <path>          Override migration/phase-8-smoke-test-results.md.
  --request-timeout-ms <ms>  HTTP request timeout (default: 10000).
  --max-redirects <count>    Maximum redirects to follow manually (default: 10).
  --feed-path <path>         Feed path to test (default: /index.xml).
  --sitemap-path <path>      Sitemap path to test (default: /sitemap.xml).
  --robots-path <path>       robots.txt path to test (default: /robots.txt).
  --help                     Show this help message.
`);
}

function parseArgs(argv) {
  const options = { ...defaults, help: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case '--base-url':
        options.baseUrl = String(argv[++index] ?? '').trim() || defaults.baseUrl;
        break;
      case '--sample-matrix':
        options.sampleMatrixPath = path.resolve(argv[++index]);
        break;
      case '--priority-routes':
        options.priorityRoutesPath = path.resolve(argv[++index]);
        break;
      case '--report':
        options.reportPath = path.resolve(argv[++index]);
        break;
      case '--markdown':
        options.markdownPath = path.resolve(argv[++index]);
        break;
      case '--request-timeout-ms':
        options.requestTimeoutMs = Number.parseInt(argv[++index], 10);
        break;
      case '--max-redirects':
        options.maxRedirects = Number.parseInt(argv[++index], 10);
        break;
      case '--feed-path':
        options.feedPath = String(argv[++index] ?? '').trim() || defaults.feedPath;
        break;
      case '--sitemap-path':
        options.sitemapPath = String(argv[++index] ?? '').trim() || defaults.sitemapPath;
        break;
      case '--robots-path':
        options.robotsPath = String(argv[++index] ?? '').trim() || defaults.robotsPath;
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

async function loadJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

function normalizeBaseUrl(rawUrl) {
  const parsed = new URL(rawUrl);
  parsed.protocol = 'https:';
  parsed.hash = '';
  parsed.search = '';
  const trimmedPath = parsed.pathname.replace(/\/+$/u, '');
  parsed.pathname = trimmedPath ? `${trimmedPath}/` : '/';
  return parsed.toString();
}

function buildRouteUrl(baseUrl, route) {
  const normalizedRoute = route === '/'
    ? '/'
    : route.endsWith('/') || /\.[a-z0-9]+$/iu.test(route)
      ? route
      : `${route}/`;
  const parsedBaseUrl = new URL(baseUrl);
  const basePath = parsedBaseUrl.pathname === '/' ? '' : parsedBaseUrl.pathname.replace(/\/$/u, '');
  parsedBaseUrl.pathname = normalizedRoute === '/'
    ? `${basePath || ''}/`
    : `${basePath}${normalizedRoute}`;
  parsedBaseUrl.search = '';
  parsedBaseUrl.hash = '';
  return parsedBaseUrl.toString();
}

function toComparableRoute(value, baseUrl) {
  const parsedBaseUrl = new URL(baseUrl);
  const parsedValue = new URL(value, parsedBaseUrl);
  const basePath = parsedBaseUrl.pathname === '/' ? '' : parsedBaseUrl.pathname.replace(/\/$/u, '');
  let pathname = parsedValue.pathname || '/';

  if (basePath && pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length) || '/';
  }

  if (!pathname.startsWith('/')) {
    pathname = `/${pathname}`;
  }

  if (pathname !== '/' && !pathname.endsWith('/') && !/\.[a-z0-9]+$/iu.test(pathname)) {
    pathname = `${pathname}/`;
  }

  return pathname;
}

function arrayify(value) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

async function fetchWithRedirectTrace(url, options) {
  const trace = [];
  let currentUrl = url;

  for (let redirectCount = 0; redirectCount <= options.maxRedirects; redirectCount += 1) {
    const response = await fetch(currentUrl, {
      redirect: 'manual',
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7',
        'user-agent': 'rhino-inquisitor-rhi-091-smoke/1.0'
      },
      signal: AbortSignal.timeout(options.requestTimeoutMs)
    });
    const body = await response.text();
    const location = response.headers.get('location');

    trace.push({
      url: currentUrl,
      statusCode: response.status,
      location: location || null
    });

    if (location && response.status >= 300 && response.status < 400) {
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }

    return {
      requestedUrl: url,
      finalUrl: currentUrl,
      statusCode: response.status,
      headers: {
        contentType: response.headers.get('content-type'),
        cacheControl: response.headers.get('cache-control')
      },
      trace,
      body
    };
  }

  throw new Error(`Too many redirects while requesting ${url}`);
}

function extractHtmlSignals(htmlSource) {
  const $ = loadHtml(htmlSource);
  const canonical = $('link[rel="canonical"]').first().attr('href') ?? '';
  const title = $('title').first().text().trim();
  const robots = [...readRobotsTokens($)];
  const metaRefresh = $('meta[http-equiv]').toArray().find((element) => {
    const httpEquiv = ($(element).attr('http-equiv') ?? '').trim().toLowerCase();
    return httpEquiv === 'refresh';
  });
  const refreshContent = metaRefresh ? ($(metaRefresh).attr('content') ?? '').trim() : '';
  const refreshTargetMatch = refreshContent.match(/url\s*=\s*([^;]+)/iu);
  const refreshTarget = refreshTargetMatch ? refreshTargetMatch[1].trim() : '';

  return {
    canonical: canonical || null,
    title: title || null,
    robots,
    metaRefreshTarget: refreshTarget || null,
    metaDescription: readMetaContent($, 'name', 'description') || null
  };
}

function selectSmokeRoutes(sampleMatrix, priorityRoutes) {
  const pageSamples = sampleMatrix.page_samples ?? {};
  const privacyRoute = (pageSamples.privacy_legal_pages ?? []).find((entry) => entry.url === '/privacy-policy/')
    ?? (pageSamples.privacy_legal_pages ?? [])[0]
    ?? null;
  const redirectRoutes = (priorityRoutes.routes ?? [])
    .filter((entry) => entry.disposition === 'merge')
    .slice(0, 5);

  return {
    pages: [
      ...(pageSamples.homepage ?? []).slice(0, 1).map((entry) => ({
        key: 'homepage',
        label: 'Homepage',
        route: entry.url,
        bucket: 'homepage'
      })),
      ...(pageSamples.recent_posts ?? []).slice(0, 3).map((entry, index) => ({
        key: `recent-post-${index + 1}`,
        label: `Recent post ${index + 1}`,
        route: entry.url,
        bucket: 'recent-post'
      })),
      ...(pageSamples.category_pages ?? []).slice(0, 3).map((entry, index) => ({
        key: `category-${index + 1}`,
        label: `Category ${index + 1}`,
        route: entry.url,
        bucket: 'category'
      })),
      ...(pageSamples.archive_pages ?? []).slice(0, 1).map((entry) => ({
        key: 'archive',
        label: 'Archive',
        route: entry.url,
        bucket: 'archive'
      })),
      ...(privacyRoute
        ? [{
          key: 'privacy-policy',
          label: 'Privacy policy',
          route: privacyRoute.url,
          bucket: 'privacy'
        }]
        : [])
    ],
    redirectRoutes
  };
}

function resultFromFindings(findings) {
  return findings.length === 0 ? 'pass' : 'fail';
}

function summarizeNotes(findings) {
  return findings.length === 0 ? 'Pass' : findings.join(' ');
}

function escapeMarkdownCell(value) {
  return String(value ?? 'n/a')
    .replace(/\|/gu, '\\|')
    .replace(/\r?\n/gu, ' ');
}

function createMarkdown(report) {
  const lines = [
    '# Phase 8 Smoke Test Results',
    '',
    `- Status: ${report.status}`,
    `- Generated at: ${report.generatedAt}`,
    `- RC dataset: ${report.sampleMatrix.rcTag} (${report.sampleMatrix.rcSha.slice(0, 8)})`,
    `- Requested preview entrypoint: ${report.entrypoint.requestedUrl}`,
    `- Effective rehearsal host: ${report.entrypoint.finalUrl}`,
    `- Redirect hops from preview entrypoint: ${report.entrypoint.redirectHopCount}`,
    `- Deterministic datasets: ${report.sampleMatrix.path} and ${report.priorityRoutes.path}`,
    `- Priority redirect coverage: ${report.priorityRoutes.redirectSampleCount} redirect route${report.priorityRoutes.redirectSampleCount === 1 ? '' : 's'} available in the frozen priority-route dataset; all available redirect routes were tested.`,
    '',
    '## Summary',
    '',
    `- Total checks: ${report.summary.totalChecks}`,
    `- Pass: ${report.summary.passCount}`,
    `- Fail: ${report.summary.failCount}`,
    `- Warning: ${report.summary.warningCount}`,
    `- Blocking failures: ${report.summary.blockingFailures}`,
    '',
    '## Checks',
    '',
    '| Bucket | Requested URL | Final URL | HTTP | Result | Canonical | Title | Notes |',
    '|---|---|---|---:|---|---|---|---|'
  ];

  for (const entry of report.checks) {
    lines.push(`| ${escapeMarkdownCell(entry.label)} | ${escapeMarkdownCell(entry.requestedUrl)} | ${escapeMarkdownCell(entry.finalUrl)} | ${escapeMarkdownCell(entry.statusCode)} | ${escapeMarkdownCell(entry.result)} | ${escapeMarkdownCell(entry.canonical)} | ${escapeMarkdownCell(entry.title)} | ${escapeMarkdownCell(entry.notes)} |`);
  }

  return `${lines.join('\n')}\n`;
}

async function runHtmlCheck(entry, effectiveBaseUrl, options) {
  const requestedUrl = buildRouteUrl(effectiveBaseUrl, entry.route);
  const response = await fetchWithRedirectTrace(requestedUrl, options);
  const signals = extractHtmlSignals(response.body);
  const findings = [];

  if (response.statusCode !== 200) {
    findings.push(`Expected HTTP 200 but received ${response.statusCode}.`);
  }

  if (!signals.title) {
    findings.push('Missing page title.');
  }

  if (!signals.robots.includes('noindex')) {
    findings.push('Preview page is missing noindex.');
  }

  if (!signals.canonical) {
    findings.push('Missing canonical URL.');
  } else {
    const comparableRoute = toComparableRoute(signals.canonical, effectiveBaseUrl);
    if (comparableRoute !== entry.route) {
      findings.push(`Canonical route ${comparableRoute} does not match expected ${entry.route}.`);
    }
  }

  return {
    key: entry.key,
    label: entry.label,
    bucket: entry.bucket,
    route: entry.route,
    requestedUrl,
    finalUrl: response.finalUrl,
    statusCode: response.statusCode,
    redirectChain: response.trace,
    result: resultFromFindings(findings),
    title: signals.title,
    canonical: signals.canonical,
    robots: signals.robots,
    notes: summarizeNotes(findings),
    findings
  };
}

async function runRedirectCheck(entry, effectiveBaseUrl, options) {
  const requestedUrl = buildRouteUrl(effectiveBaseUrl, entry.route);
  const response = await fetchWithRedirectTrace(requestedUrl, options);
  const findings = [];
  let canonical = null;
  let title = null;
  let derivedTarget = null;

  if (response.statusCode >= 400) {
    findings.push(`Expected a reachable legacy route but received ${response.statusCode}.`);
  }

  if (response.body && response.headers.contentType?.includes('text/html')) {
    const signals = extractHtmlSignals(response.body);
    canonical = signals.canonical;
    title = signals.title;
    derivedTarget = signals.metaRefreshTarget || signals.canonical;
  }

  if (!derivedTarget && response.trace.length > 1) {
    derivedTarget = response.finalUrl;
  }

  const comparableTarget = derivedTarget ? normalizeUrlLike(derivedTarget).comparablePathOnly : null;
  const expectedTarget = normalizeUrlLike(entry.final_target_url).comparablePathOnly;

  if (comparableTarget !== expectedTarget) {
    findings.push(`Resolved target ${comparableTarget ?? 'n/a'} does not match expected ${expectedTarget}.`);
  }

  return {
    key: `priority-${entry.route}`,
    label: `Priority redirect ${entry.route}`,
    bucket: 'priority-redirect',
    route: entry.route,
    requestedUrl,
    finalUrl: response.finalUrl,
    statusCode: response.statusCode,
    redirectChain: response.trace,
    result: resultFromFindings(findings),
    title,
    canonical,
    expectedTarget: entry.final_target_url,
    actualTarget: comparableTarget,
    notes: summarizeNotes(findings),
    findings
  };
}

async function runSitemapCheck(effectiveBaseUrl, options) {
  const requestedUrl = buildRouteUrl(effectiveBaseUrl, options.sitemapPath);
  const response = await fetchWithRedirectTrace(requestedUrl, options);
  const findings = [];
  let locCount = 0;

  if (response.statusCode !== 200) {
    findings.push(`Expected HTTP 200 but received ${response.statusCode}.`);
  }

  try {
    const parsed = xmlParser.parse(response.body);
    const urlEntries = arrayify(parsed.urlset?.url);
    const sitemapEntries = arrayify(parsed.sitemapindex?.sitemap);
    const locs = [
      ...urlEntries.map((entry) => entry.loc).filter(Boolean),
      ...sitemapEntries.map((entry) => entry.loc).filter(Boolean)
    ];
    locCount = locs.length;

    if (locs.length === 0) {
      findings.push('Sitemap XML parsed but no <loc> entries were found.');
    }

    const invalidLocs = locs.filter((loc) => !String(loc).startsWith(effectiveBaseUrl));
    if (invalidLocs.length > 0) {
      findings.push(`Sitemap contains ${invalidLocs.length} <loc> values outside ${effectiveBaseUrl}.`);
    }
  } catch (error) {
    findings.push(`Failed to parse sitemap XML: ${error instanceof Error ? error.message : String(error)}`);
  }

  return {
    key: 'sitemap',
    label: 'Sitemap',
    bucket: 'system',
    route: options.sitemapPath,
    requestedUrl,
    finalUrl: response.finalUrl,
    statusCode: response.statusCode,
    redirectChain: response.trace,
    result: resultFromFindings(findings),
    title: null,
    canonical: null,
    locCount,
    notes: summarizeNotes(findings),
    findings
  };
}

async function runRobotsCheck(effectiveBaseUrl, options) {
  const requestedUrl = buildRouteUrl(effectiveBaseUrl, options.robotsPath);
  const response = await fetchWithRedirectTrace(requestedUrl, options);
  const findings = [];
  const expectedSitemap = buildRouteUrl(effectiveBaseUrl, options.sitemapPath);

  if (response.statusCode !== 200) {
    findings.push(`Expected HTTP 200 but received ${response.statusCode}.`);
  }

  if (!response.body.includes(`Sitemap: ${expectedSitemap}`)) {
    findings.push(`robots.txt is missing the expected Sitemap directive for ${expectedSitemap}.`);
  }

  return {
    key: 'robots',
    label: 'Robots',
    bucket: 'system',
    route: options.robotsPath,
    requestedUrl,
    finalUrl: response.finalUrl,
    statusCode: response.statusCode,
    redirectChain: response.trace,
    result: resultFromFindings(findings),
    title: null,
    canonical: null,
    notes: summarizeNotes(findings),
    findings
  };
}

async function runFeedCheck(effectiveBaseUrl, options) {
  const requestedUrl = buildRouteUrl(effectiveBaseUrl, options.feedPath);
  const response = await fetchWithRedirectTrace(requestedUrl, options);
  const findings = [];

  if (response.statusCode !== 200) {
    findings.push(`Expected HTTP 200 but received ${response.statusCode}.`);
  }

  try {
    xmlParser.parse(response.body);
  } catch (error) {
    findings.push(`Failed to parse feed XML: ${error instanceof Error ? error.message : String(error)}`);
  }

  return {
    key: 'feed',
    label: 'Feed',
    bucket: 'system',
    route: options.feedPath,
    requestedUrl,
    finalUrl: response.finalUrl,
    statusCode: response.statusCode,
    redirectChain: response.trace,
    result: resultFromFindings(findings),
    title: null,
    canonical: null,
    notes: summarizeNotes(findings),
    findings
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const sampleMatrix = await loadJson(options.sampleMatrixPath);
  const priorityRoutes = await loadJson(options.priorityRoutesPath);
  const artifactProvenance = getArtifactProvenance(sampleMatrix.rc ?? {});

  const entrypoint = await fetchWithRedirectTrace(normalizeBaseUrl(options.baseUrl), options);
  const effectiveBaseUrl = normalizeBaseUrl(entrypoint.finalUrl);
  const smokeRoutes = selectSmokeRoutes(sampleMatrix, priorityRoutes);

  const checks = [];

  for (const entry of smokeRoutes.pages) {
    checks.push(await runHtmlCheck(entry, effectiveBaseUrl, options));
  }

  for (const entry of smokeRoutes.redirectRoutes) {
    checks.push(await runRedirectCheck(entry, effectiveBaseUrl, options));
  }

  checks.push(await runSitemapCheck(effectiveBaseUrl, options));
  checks.push(await runRobotsCheck(effectiveBaseUrl, options));
  checks.push(await runFeedCheck(effectiveBaseUrl, options));

  const blockingFailures = checks.filter((entry) => entry.result === 'fail');
  const report = {
    phase: 8,
    ticket: 'RHI-091',
    artifact: 'preview-launch-readiness-report',
    status: blockingFailures.length === 0 ? 'pass' : 'fail',
    generatedAt: new Date().toISOString(),
    entrypoint: {
      requestedUrl: normalizeBaseUrl(options.baseUrl),
      finalUrl: effectiveBaseUrl,
      redirectHopCount: Math.max(entrypoint.trace.length - 1, 0),
      redirectChain: entrypoint.trace
    },
    sampleMatrix: {
      path: toRepoRelative(options.sampleMatrixPath),
      generatedAt: sampleMatrix.generated_at ?? null,
      rcTag: sampleMatrix.rc?.tag ?? null,
      rcSha: sampleMatrix.rc?.commit ?? null
    },
    priorityRoutes: {
      path: toRepoRelative(options.priorityRoutesPath),
      generatedAt: priorityRoutes.generated_at ?? null,
      redirectSampleCount: smokeRoutes.redirectRoutes.length
    },
    artifactProvenance,
    policy: {
      requestTimeoutMs: options.requestTimeoutMs,
      maxRedirects: options.maxRedirects,
      expectedPreviewNoindex: true,
      feedPath: options.feedPath,
      sitemapPath: options.sitemapPath,
      robotsPath: options.robotsPath
    },
    summary: {
      totalChecks: checks.length,
      passCount: checks.filter((entry) => entry.result === 'pass').length,
      failCount: blockingFailures.length,
      warningCount: 0,
      blockingFailures: blockingFailures.length
    },
    checks
  };

  await writeJsonReport(options.reportPath, report);
  await fs.mkdir(path.dirname(options.markdownPath), { recursive: true });
  await fs.writeFile(options.markdownPath, createMarkdown(report), 'utf8');

  console.log(`Phase 8 preview launch readiness report written to ${toRepoRelative(options.reportPath)}`);
  console.log(`Phase 8 smoke test markdown written to ${toRepoRelative(options.markdownPath)}`);
  console.log(`Effective rehearsal host: ${effectiveBaseUrl}`);
  console.log(`Smoke checks run: ${report.summary.totalChecks}`);
  console.log(`Blocking failures: ${report.summary.blockingFailures}`);

  if (report.status === 'fail') {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});