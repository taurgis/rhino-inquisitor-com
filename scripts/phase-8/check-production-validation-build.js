import path from 'node:path';

import {
  collectHtmlInventory,
  getArtifactProvenance,
  isAliasHelperPage,
  isPaginationRoute,
  loadFrontMatterNoindexRoutes,
  phase8SeoDefaults,
  readHtmlPage,
  writeJsonReport
} from './seo-gate-helpers.js';
import { repoRoot, toRepoRelative } from '../migration/url-validation-helpers.js';

const defaults = {
  publicRoot: phase8SeoDefaults.publicRoot,
  contentRoot: phase8SeoDefaults.contentRoot,
  sampleMatrixPath: phase8SeoDefaults.sampleMatrixPath,
  reportPath: path.join(repoRoot, 'validation', 'production-host-smoke-report.json'),
  forbiddenOrigins: [
    'https://staging.rhino-inquisitor.com',
    'http://staging.rhino-inquisitor.com',
    'https://taurgis.github.io/rhino-inquisitor-com',
    'http://taurgis.github.io/rhino-inquisitor-com'
  ]
};

const allowedSystemNoindexRoutes = new Set([
  '/404/',
  '/404.html',
  '/feed/',
  '/feed/atom/',
  '/feed/rss/',
  '/rss/'
]);

function printHelp() {
  console.log(`Usage: node scripts/phase-8/check-production-validation-build.js [options]

Options:
  --public-dir <path>         Override the built public directory.
  --content-dir <path>        Override the content directory for expected noindex front matter.
  --sample-matrix <path>      Override validation/sample-matrix.json.
  --report <path>             Override validation/production-host-smoke-report.json.
  --forbidden-origin <url>    Add a forbidden preview or staging origin to scan for.
  --help                      Show this help message.
`);
}

function parseArgs(argv) {
  const options = {
    ...defaults,
    forbiddenOrigins: [...defaults.forbiddenOrigins],
    help: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case '--public-dir':
        options.publicRoot = path.resolve(argv[++index]);
        break;
      case '--content-dir':
        options.contentRoot = path.resolve(argv[++index]);
        break;
      case '--sample-matrix':
        options.sampleMatrixPath = path.resolve(argv[++index]);
        break;
      case '--report':
        options.reportPath = path.resolve(argv[++index]);
        break;
      case '--forbidden-origin':
        options.forbiddenOrigins.push(String(argv[++index] ?? '').trim());
        break;
      case '--help':
        options.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  options.forbiddenOrigins = [...new Set(options.forbiddenOrigins.filter(Boolean))];

  return options;
}

async function loadJson(filePath) {
  const source = await import('node:fs/promises').then((fs) => fs.readFile(filePath, 'utf8'));
  return JSON.parse(source);
}

function extractAbsoluteUrls(source) {
  return [...new Set(source.match(/https?:\/\/[^\s"'<>]+/giu) ?? [])];
}

function isAllowedNoindexRoute(route, $, expectedNoindexRoutes) {
  if (expectedNoindexRoutes.has(route)) {
    return true;
  }

  if (allowedSystemNoindexRoutes.has(route)) {
    return true;
  }

  if (route.startsWith('/feed/')) {
    return true;
  }

  if (isPaginationRoute(route)) {
    return true;
  }

  return isAliasHelperPage($);
}

function collectRequiredSampleRoutes(sampleMatrix) {
  const pageSamples = sampleMatrix.page_samples ?? {};
  const privacyPage = (pageSamples.privacy_legal_pages ?? []).find((entry) => entry.url === '/privacy-policy/')
    ?? (pageSamples.privacy_legal_pages ?? [])[0]
    ?? null;

  return [
    ...(pageSamples.homepage ?? []).slice(0, 1).map((entry) => ({ label: 'Homepage', route: entry.url })),
    ...(pageSamples.recent_posts ?? []).slice(0, 3).map((entry, index) => ({
      label: `Recent post ${index + 1}`,
      route: entry.url
    })),
    ...(pageSamples.category_pages ?? []).slice(0, 3).map((entry, index) => ({
      label: `Category ${index + 1}`,
      route: entry.url
    })),
    ...(pageSamples.archive_pages ?? []).slice(0, 1).map((entry) => ({ label: 'Archive', route: entry.url })),
    ...(privacyPage ? [{ label: 'Privacy policy', route: privacyPage.url }] : [])
  ];
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const sampleMatrix = await loadJson(options.sampleMatrixPath);
  const artifactProvenance = getArtifactProvenance(sampleMatrix.rc ?? {});
  const htmlInventory = await collectHtmlInventory(options.publicRoot);
  const frontMatterNoindex = await loadFrontMatterNoindexRoutes(options.contentRoot);
  const requiredSampleRoutes = collectRequiredSampleRoutes(sampleMatrix);

  const previewLeakage = [];
  const unexpectedNoindex = [];
  const allowedNoindex = [];
  const sampleChecks = [];

  const sampleRouteLookup = new Map(requiredSampleRoutes.map((entry) => [entry.route, entry.label]));

  for (const { route, filePath, repoRelativePath } of htmlInventory.values()) {
    const { htmlSource, $ } = await readHtmlPage(filePath);
    const absoluteUrls = extractAbsoluteUrls(htmlSource);
    const matchedForbiddenOrigins = absoluteUrls.filter((candidate) => options.forbiddenOrigins.some((origin) => candidate.startsWith(origin)));

    if (matchedForbiddenOrigins.length > 0) {
      previewLeakage.push({
        route,
        filePath: repoRelativePath,
        forbiddenOrigins: [...new Set(matchedForbiddenOrigins)]
      });
    }

    const robotsContent = ($('meta[name="robots"]').attr('content') ?? '').toLowerCase();
    const hasNoindex = robotsContent.includes('noindex');
    const allowedNoindexRoute = hasNoindex && isAllowedNoindexRoute(route, $, frontMatterNoindex.routes);

    if (hasNoindex && !allowedNoindexRoute) {
      unexpectedNoindex.push({
        route,
        filePath: repoRelativePath,
        robotsContent: robotsContent || null
      });
    }

    if (allowedNoindexRoute) {
      allowedNoindex.push({
        route,
        filePath: repoRelativePath,
        reason: isAliasHelperPage($)
          ? 'alias-helper'
          : isPaginationRoute(route)
            ? 'pagination-helper'
            : allowedSystemNoindexRoutes.has(route) || route.startsWith('/feed/')
              ? 'system-route'
              : 'front-matter'
      });
    }

    if (sampleRouteLookup.has(route)) {
      sampleChecks.push({
        label: sampleRouteLookup.get(route),
        route,
        filePath: repoRelativePath,
        title: $('title').first().text().trim() || null,
        hasNoindex,
        aliasHelper: isAliasHelperPage($)
      });
    }
  }

  const blockingFailureCount = previewLeakage.length + unexpectedNoindex.length;
  const report = {
    phase: 8,
    ticket: 'RHI-091',
    artifact: 'production-host-smoke-report',
    status: blockingFailureCount === 0 ? 'pass' : 'fail',
    generatedAt: new Date().toISOString(),
    publicDir: toRepoRelative(options.publicRoot),
    sampleMatrix: {
      path: toRepoRelative(options.sampleMatrixPath),
      generatedAt: sampleMatrix.generated_at ?? null
    },
    artifactProvenance,
    policy: {
      forbiddenOrigins: options.forbiddenOrigins,
      allowedNoindexRoutes: [...allowedSystemNoindexRoutes],
      allowedNoindexBehaviors: [
        'front-matter noindex',
        'alias-helper redirects',
        'pagination helper routes',
        '404 and feed system outputs'
      ]
    },
    summary: {
      totalHtmlPages: htmlInventory.size,
      passCount: htmlInventory.size - blockingFailureCount,
      failCount: blockingFailureCount,
      blockingFailures: blockingFailureCount,
      warningCount: allowedNoindex.length,
      previewLeakageCount: previewLeakage.length,
      unexpectedNoindexCount: unexpectedNoindex.length,
      allowedNoindexCount: allowedNoindex.length,
      sampleRouteCount: sampleChecks.length
    },
    sampleChecks,
    previewLeakage,
    unexpectedNoindex,
    allowedNoindex
  };

  await writeJsonReport(options.reportPath, report);

  console.log(`Phase 8 production validation report written to ${toRepoRelative(options.reportPath)}`);
  console.log(`HTML pages checked: ${report.summary.totalHtmlPages}`);
  console.log(`Preview-host leakage findings: ${report.summary.previewLeakageCount}`);
  console.log(`Unexpected noindex findings: ${report.summary.unexpectedNoindexCount}`);

  if (report.status === 'fail') {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});