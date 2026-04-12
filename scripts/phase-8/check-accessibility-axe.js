import fs from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'node:http';

import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

import {
  collectHtmlInventory,
  getArtifactProvenance,
  normalizeRouteLike,
  phase8SeoDefaults,
  toAbsoluteUrl,
  writeJsonReport
} from './seo-gate-helpers.js';
import { toRepoRelative } from '../migration/url-validation-helpers.js';

const defaults = {
  publicRoot: phase8SeoDefaults.publicRoot,
  sampleMatrixPath: phase8SeoDefaults.sampleMatrixPath,
  reportPath: path.join(path.dirname(phase8SeoDefaults.sampleMatrixPath), 'accessibility-axe-report.json'),
  baseUrl: '',
  moderateOwner: 'Engineering Owner',
  moderateDueDate: ''
};

const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'];
const primaryTemplateFamilies = new Set(['home', 'post', 'video-post', 'category']);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8'
};

function printHelp() {
  console.log(`Usage: node scripts/phase-8/check-accessibility-axe.js [options]

Options:
  --public-dir <path>         Override the built public directory.
  --sample-matrix <path>      Override validation/sample-matrix.json.
  --report <path>             Override validation/accessibility-axe-report.json.
  --base-url <url>            Use an existing deployed base URL instead of a local static server.
  --moderate-owner <name>     Record the owner responsible for documented moderate findings.
  --moderate-due-date <date>  ISO date for non-blocking moderate findings.
  --help                      Show this help message.
`);
}

function parseArgs(argv) {
  const options = { ...defaults, help: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case '--public-dir':
        options.publicRoot = path.resolve(argv[++index]);
        break;
      case '--sample-matrix':
        options.sampleMatrixPath = path.resolve(argv[++index]);
        break;
      case '--report':
        options.reportPath = path.resolve(argv[++index]);
        break;
      case '--base-url':
        options.baseUrl = String(argv[++index] ?? '').trim();
        break;
      case '--moderate-owner':
        options.moderateOwner = String(argv[++index] ?? '').trim() || defaults.moderateOwner;
        break;
      case '--moderate-due-date':
        options.moderateDueDate = String(argv[++index] ?? '').trim();
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

async function loadJson(filePath, label) {
  const source = await fs.readFile(filePath, 'utf8');

  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(`Failed to parse ${label} at ${toRepoRelative(filePath)}: ${error.message}`);
  }
}

function routeFamilyFromGroup(groupName) {
  switch (groupName) {
    case 'homepage':
      return 'home';
    case 'recent_posts':
      return 'post';
    case 'archive_pages':
      return 'archive';
    case 'category_pages':
      return 'category';
    case 'privacy_legal_pages':
      return 'legal';
    case 'video_pages':
      return 'video-page';
    case 'video_posts':
      return 'video-post';
    case 'landing_pages':
      return 'landing';
    default:
      return 'other';
  }
}

function collectSampleRoutes(sampleMatrix) {
  const routes = new Map();

  for (const [groupName, entries] of Object.entries(sampleMatrix.page_samples ?? {})) {
    for (const entry of Array.isArray(entries) ? entries : []) {
      const route = normalizeRouteLike(entry.url);
      if (!route) {
        continue;
      }

      const existing = routes.get(route) ?? {
        route,
        expectedUrl: toAbsoluteUrl(route),
        groups: [],
        sources: []
      };

      if (!existing.groups.includes(groupName)) {
        existing.groups.push(groupName);
      }

      existing.sources.push({
        group: groupName,
        family: routeFamilyFromGroup(groupName),
        title: entry.title ?? null,
        builtArtifactPath: entry.built_artifact_path ?? null,
        contentPath: entry.content_path ?? null,
        selectionReason: entry.selection_reason ?? null
      });
      routes.set(route, existing);
    }
  }

  return [...routes.values()].sort((left, right) => left.route.localeCompare(right.route));
}

function describeSources(routeRecord) {
  return routeRecord.sources.map((source) => ({
    group: source.group,
    family: source.family,
    title: source.title,
    contentPath: source.contentPath,
    selectionReason: source.selectionReason
  }));
}

function isPrimaryTemplate(routeRecord) {
  return routeRecord.sources.some((source) => primaryTemplateFamilies.has(source.family));
}

function countViolations(violations) {
  return violations.reduce((counts, violation) => {
    const impact = violation.impact ?? 'unknown';
    counts[impact] = (counts[impact] ?? 0) + 1;
    return counts;
  }, {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
    unknown: 0
  });
}

function summarizeViolation(violation, routeRecord, options) {
  const impact = violation.impact ?? 'unknown';
  const primary = isPrimaryTemplate(routeRecord);
  const blocksBecauseCritical = impact === 'critical';
  const blocksBecauseSerious = impact === 'serious' && primary;
  const moderateRequiresDate = impact === 'moderate' && options.moderateDueDate.length === 0;
  const blocking = blocksBecauseCritical || blocksBecauseSerious || moderateRequiresDate;

  return {
    id: violation.id,
    impact,
    description: violation.description,
    help: violation.help,
    helpUrl: violation.helpUrl,
    tags: violation.tags ?? [],
    blocking,
    blockingReason: blocksBecauseCritical
      ? 'Critical axe violations are blocking on all sampled routes.'
      : blocksBecauseSerious
        ? 'Serious axe violations are blocking on primary templates.'
        : moderateRequiresDate
          ? 'Moderate axe violations require an owner and target resolution date before they can be treated as non-blocking.'
          : null,
    nodes: (violation.nodes ?? []).map((node) => ({
      target: Array.isArray(node.target) ? node.target.join(' ') : String(node.target ?? ''),
      html: node.html ?? null,
      failureSummary: node.failureSummary ?? null
    }))
  };
}

function summarizeEntries(entries) {
  return entries.reduce((summary, entry) => {
    summary.totalRoutes += 1;
    if (entry.result === 'pass') {
      summary.passCount += 1;
    } else {
      summary.failCount += 1;
    }

    summary.blockingFailures += entry.blockingViolations.length + entry.blockingFindings.length;
    summary.warningCount += entry.nonBlockingViolations.length;
    summary.criticalViolations += entry.violationCounts.critical;
    summary.seriousViolations += entry.violationCounts.serious;
    summary.moderateViolations += entry.violationCounts.moderate;
    summary.minorViolations += entry.violationCounts.minor;
    summary.unknownViolations += entry.violationCounts.unknown;

    if (entry.blockingViolations.length > 0) {
      summary.routesWithBlockingViolations += 1;
    }

    if (entry.nonBlockingViolations.length > 0) {
      summary.routesWithWarnings += 1;
    }

    return summary;
  }, {
    totalRoutes: 0,
    passCount: 0,
    failCount: 0,
    blockingFailures: 0,
    warningCount: 0,
    criticalViolations: 0,
    seriousViolations: 0,
    moderateViolations: 0,
    minorViolations: 0,
    unknownViolations: 0,
    routesWithBlockingViolations: 0,
    routesWithWarnings: 0
  });
}

function getContentType(filePath) {
  return contentTypes[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream';
}

function toFilePath(requestPathname, publicDir) {
  const decodedPath = decodeURIComponent(requestPathname);
  const normalizedPath = path.posix.normalize(decodedPath);
  const relativePath = normalizedPath === '/'
    ? 'index.html'
    : normalizedPath.endsWith('/')
      ? path.posix.join(normalizedPath.slice(1), 'index.html')
      : normalizedPath.slice(1);

  const resolvedPath = path.resolve(publicDir, relativePath);
  if (!resolvedPath.startsWith(publicDir)) {
    return null;
  }

  return resolvedPath;
}

async function serveFile(filePath, response) {
  const fileBuffer = await fs.readFile(filePath);
  response.writeHead(200, { 'Content-Type': getContentType(filePath) });
  response.end(fileBuffer);
}

async function createStaticServer(publicDir) {
  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1');
      const filePath = toFilePath(requestUrl.pathname, publicDir);

      if (!filePath) {
        response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Bad request');
        return;
      }

      await serveFile(filePath, response);
    } catch (error) {
      if (error?.code === 'ENOENT') {
        response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Not found');
        return;
      }

      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Internal server error');
    }
  });

  return await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${address.port}`
      });
    });
  });
}

function moderateDisposition(options, violationCounts) {
  if (violationCounts.moderate === 0) {
    return null;
  }

  return {
    owner: options.moderateOwner,
    targetResolutionDate: options.moderateDueDate || null,
    status: options.moderateDueDate ? 'documented' : 'missing-target-resolution-date'
  };
}

async function analyzeRoute(routeRecord, inventoryEntry, browser, baseUrl, options) {
  if (!inventoryEntry) {
    return {
      route: routeRecord.route,
      expectedUrl: routeRecord.expectedUrl,
      sources: describeSources(routeRecord),
      templateFamilies: [...new Set(routeRecord.sources.map((source) => source.family))],
      primaryTemplate: isPrimaryTemplate(routeRecord),
      builtArtifactPath: routeRecord.sources.find((source) => source.builtArtifactPath)?.builtArtifactPath ?? null,
      checkedUrl: new URL(routeRecord.route.replace(/^\//u, ''), `${baseUrl}/`).toString(),
      result: 'fail',
      httpStatus: null,
      violationCounts: {
        critical: 0,
        serious: 0,
        moderate: 0,
        minor: 0,
        unknown: 0
      },
      blockingFindings: ['Expected route is missing from the production HTML artifact.'],
      blockingViolations: [],
      nonBlockingViolations: [],
      moderateDisposition: null
    };
  }

  const context = await browser.newContext();
  const page = await context.newPage();
  const checkedUrl = new URL(routeRecord.route.replace(/^\//u, ''), `${baseUrl}/`).toString();

  try {
    const response = await page.goto(checkedUrl, { waitUntil: 'domcontentloaded' });
    await page.locator('body').waitFor({ state: 'visible' });
    await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {});

    const axeResults = await new AxeBuilder({ page })
      .withTags(wcagTags)
      .exclude('iframe[src*="youtube"]')
      .exclude('iframe[src*="youtube-nocookie"]')
      .analyze();
    const summarizedViolations = axeResults.violations.map((violation) => summarizeViolation(violation, routeRecord, options));
    const violationCounts = countViolations(axeResults.violations);
    const blockingFindings = [];

    if ((response?.status() ?? 0) >= 400) {
      blockingFindings.push(`Accessibility scan returned HTTP ${response.status()} for the sampled route.`);
    }

    if (violationCounts.moderate > 0 && options.moderateDueDate.length === 0) {
      blockingFindings.push('Moderate axe findings require a target resolution date before the route can pass the Phase 8 gate.');
    }

    const blockingViolations = summarizedViolations.filter((violation) => violation.blocking);
    const nonBlockingViolations = summarizedViolations.filter((violation) => !violation.blocking);

    return {
      route: routeRecord.route,
      expectedUrl: routeRecord.expectedUrl,
      sources: describeSources(routeRecord),
      templateFamilies: [...new Set(routeRecord.sources.map((source) => source.family))],
      primaryTemplate: isPrimaryTemplate(routeRecord),
      builtArtifactPath: inventoryEntry.repoRelativePath,
      checkedUrl,
      httpStatus: response?.status() ?? null,
      result: blockingViolations.length === 0 && blockingFindings.length === 0 ? 'pass' : 'fail',
      violationCounts,
      blockingFindings,
      blockingViolations,
      nonBlockingViolations,
      moderateDisposition: moderateDisposition(options, violationCounts)
    };
  } finally {
    await context.close();
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const sampleMatrix = await loadJson(options.sampleMatrixPath, 'sample matrix');
  const routeRecords = collectSampleRoutes(sampleMatrix);
  const htmlInventory = await collectHtmlInventory(options.publicRoot);

  let serverContext = null;
  let baseUrl = options.baseUrl;

  if (!baseUrl) {
    serverContext = await createStaticServer(options.publicRoot);
    baseUrl = serverContext.baseUrl;
  }

  const browser = await chromium.launch({ headless: true });

  try {
    const entries = [];
    for (const routeRecord of routeRecords) {
      entries.push(await analyzeRoute(routeRecord, htmlInventory.get(routeRecord.route), browser, baseUrl, options));
    }

    const summary = summarizeEntries(entries);
    const report = {
      phase: 8,
      ticket: 'RHI-089',
      artifact: 'accessibility-axe-report',
      status: summary.blockingFailures === 0 ? 'pass' : 'fail',
      rcTag: sampleMatrix.rc?.tag ?? null,
      rcSha: sampleMatrix.rc?.commit ?? null,
      generatedAt: new Date().toISOString(),
      publicDir: toRepoRelative(options.publicRoot),
      sampleMatrix: {
        path: toRepoRelative(options.sampleMatrixPath),
        generatedAt: sampleMatrix.generated_at ?? null
      },
      artifactProvenance: getArtifactProvenance(sampleMatrix.rc),
      execution: {
        mode: options.baseUrl ? 'external-base-url' : 'local-static-server',
        baseUrl,
        wcagTags
      },
      policy: {
        primaryTemplateFamilies: [...primaryTemplateFamilies],
        criticalSeverity: 'blocking-all-sampled-routes',
        seriousSeverity: 'blocking-on-primary-templates',
        moderateSeverity: options.moderateDueDate
          ? 'documented-non-blocking-with-owner-and-target-date'
          : 'requires-owner-and-target-date-before-non-blocking',
        moderateOwner: options.moderateOwner,
        moderateDueDate: options.moderateDueDate || null,
        manualChecksRequired: true
      },
      summary,
      entries
    };

    await writeJsonReport(options.reportPath, report);

    console.log(`Phase 8 accessibility report written to ${toRepoRelative(options.reportPath)}`);
    console.log(`Routes checked: ${summary.totalRoutes}`);
    console.log(`Pass routes: ${summary.passCount}`);
    console.log(`Fail routes: ${summary.failCount}`);
    console.log(`Blocking failures: ${summary.blockingFailures}`);
    console.log(`Warnings: ${summary.warningCount}`);

    if (report.status === 'fail') {
      process.exitCode = 1;
    }
  } finally {
    await browser.close();
    if (serverContext) {
      serverContext.server.close();
    }
  }
}

await main();