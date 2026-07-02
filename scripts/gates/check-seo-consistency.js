import fs from 'node:fs/promises';
import path from 'node:path';

import {
  collectHtmlInventory,
  getArtifactProvenance,
  getCanonicalLinks,
  isAliasHelperPage,
  isPaginationRoute,
  loadFrontMatterNoindexRoutes,
  loadSitemapCollection,
  normalizeRoute,
  normalizeRouteLike,
  phase8SeoDefaults,
  readHtmlPage,
  readMetaContent,
  readRobotsTokens,
  toAbsoluteUrl,
  writeJsonReport
} from './seo-gate-helpers.js';
import { canonicalOrigin, toRepoRelative } from '../url/url-validation-helpers.js';

const defaults = {
  publicRoot: phase8SeoDefaults.publicRoot,
  contentRoot: phase8SeoDefaults.contentRoot,
  sampleMatrixPath: phase8SeoDefaults.sampleMatrixPath,
  priorityRoutesPath: phase8SeoDefaults.priorityRoutesPath,
  reportPath: phase8SeoDefaults.seoConsistencyReportPath
};

function printHelp() {
  console.log(`Usage: node scripts/gates/check-seo-consistency.js [options]

Options:
  --public-dir <path>      Override the built public directory.
  --content-dir <path>     Override the content directory used for expected noindex routes.
  --sample-matrix <path>   Override validation/sample-matrix.json.
  --priority-routes <path> Override validation/priority-routes.json.
  --report <path>          Override validation/seo-consistency-report.json.
  --help                   Show this help message.
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
      case '--content-dir':
        options.contentRoot = path.resolve(argv[++index]);
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
      case '--help':
        options.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function createRouteRecord(route) {
  return {
    route,
    expectedUrl: toAbsoluteUrl(route),
    sources: []
  };
}

function addRouteSource(routeMap, route, source) {
  const normalizedRoute = normalizeRoute(route);
  const existing = routeMap.get(normalizedRoute) ?? createRouteRecord(normalizedRoute);
  existing.sources.push(source);
  routeMap.set(normalizedRoute, existing);
}

function collectValidationRoutes(sampleMatrix, priorityRoutes) {
  const routes = new Map();

  for (const [groupName, entries] of Object.entries(sampleMatrix.page_samples ?? {})) {
    for (const entry of Array.isArray(entries) ? entries : []) {
      const route = normalizeRouteLike(entry.url);
      if (!route) {
        continue;
      }

      addRouteSource(routes, route, {
        type: 'sample-matrix',
        group: groupName,
        title: entry.title ?? null,
        builtArtifactPath: entry.built_artifact_path ?? null,
        contentPath: entry.content_path ?? null,
        selectionReason: entry.selection_reason ?? null
      });
    }
  }

  for (const entry of priorityRoutes.routes ?? []) {
    if (entry.expected_outcome === 'retire' || entry.disposition === 'retire' || !entry.final_target_url) {
      continue;
    }

    const route = normalizeRouteLike(entry.final_target_url ?? entry.route);
    if (!route) {
      continue;
    }

    addRouteSource(routes, route, {
      type: 'priority-routes',
      priority: entry.priority ?? null,
      urlClass: entry.url_class ?? null,
      sourceRoute: entry.route ?? null,
      expectedOutcome: entry.expected_outcome ?? null,
      selectionReason: entry.selection_reason ?? null
    });
  }

  return [...routes.values()].sort((left, right) => left.route.localeCompare(right.route));
}

function shouldAllowSkip(routeRecord) {
  return routeRecord.sources.length > 0
    && routeRecord.sources.every((source) => source.type === 'priority-routes' && source.urlClass === 'system');
}

function normalizeComparableAbsoluteUrl(value) {
  const parsed = new URL(value);
  parsed.protocol = 'https:';
  parsed.hash = '';
  parsed.search = '';
  parsed.pathname = normalizeRoute(parsed.pathname);
  return parsed.toString();
}

function describeSources(routeRecord) {
  return routeRecord.sources.map((source) => {
    if (source.type === 'sample-matrix') {
      return {
        type: source.type,
        group: source.group,
        title: source.title,
        contentPath: source.contentPath,
        selectionReason: source.selectionReason
      };
    }

    return {
      type: source.type,
      priority: source.priority,
      urlClass: source.urlClass,
      sourceRoute: source.sourceRoute,
      expectedOutcome: source.expectedOutcome,
      selectionReason: source.selectionReason
    };
  });
}

async function analyzeRoute(routeRecord, htmlInventory, sitemap, expectedNoindexRoutes) {
  const inventoryEntry = htmlInventory.get(routeRecord.route);
  if (!inventoryEntry) {
    if (shouldAllowSkip(routeRecord)) {
      return {
        route: routeRecord.route,
        expectedUrl: routeRecord.expectedUrl,
        sources: describeSources(routeRecord),
        builtArtifactPath: null,
        result: 'skipped',
        blockingFindings: [],
        warnings: ['Priority system route does not resolve to an indexable HTML file in public/.']
      };
    }

    return {
      route: routeRecord.route,
      expectedUrl: routeRecord.expectedUrl,
      sources: describeSources(routeRecord),
      builtArtifactPath: null,
      result: 'fail',
      blockingFindings: ['Expected route is missing from the production HTML artifact.'],
      warnings: []
    };
  }

  const { $ } = await readHtmlPage(inventoryEntry.filePath);
  if (isAliasHelperPage($)) {
    if (shouldAllowSkip(routeRecord)) {
      return {
        route: routeRecord.route,
        expectedUrl: routeRecord.expectedUrl,
        sources: describeSources(routeRecord),
        builtArtifactPath: inventoryEntry.repoRelativePath,
        result: 'skipped',
        blockingFindings: [],
        warnings: ['Priority system route resolves to a redirect helper and is excluded from indexable-page SEO checks.']
      };
    }

    return {
      route: routeRecord.route,
      expectedUrl: routeRecord.expectedUrl,
      sources: describeSources(routeRecord),
      builtArtifactPath: inventoryEntry.repoRelativePath,
      result: 'fail',
      blockingFindings: ['Expected indexable route resolves to a redirect helper page instead of a final HTML page.'],
      warnings: []
    };
  }

  const title = $('title').first().text().trim();
  const description = readMetaContent($, 'name', 'description');
  const canonicalLinks = getCanonicalLinks($);
  const canonicalUrl = canonicalLinks.first().attr('href')?.trim() ?? '';
  const robotsTokens = readRobotsTokens($);
  const blockingFindings = [];
  const warnings = [];
  let canonicalUrlParsed = null;

  if (canonicalLinks.length !== 1) {
    blockingFindings.push(`Expected exactly one canonical tag, found ${canonicalLinks.length}.`);
  }

  if (!canonicalUrl) {
    blockingFindings.push('Missing canonical href.');
  } else {
    try {
      canonicalUrlParsed = new URL(canonicalUrl);
    } catch {
      blockingFindings.push(`Canonical is not a valid absolute URL (${canonicalUrl}).`);
    }
  }

  if (canonicalUrlParsed) {
    if (canonicalUrlParsed.protocol !== 'https:') {
      blockingFindings.push(`Canonical is not HTTPS (${canonicalUrl}).`);
    }

    if (canonicalUrlParsed.hostname !== 'rhino-inquisitor.com') {
      blockingFindings.push(`Canonical host is not rhino-inquisitor.com (${canonicalUrl}).`);
    }

    if (canonicalUrlParsed.search || canonicalUrlParsed.hash) {
      blockingFindings.push(`Canonical must not include query strings or fragments (${canonicalUrl}).`);
    }

    if (/(?:github\.io|staging\.rhino-inquisitor\.com)/u.test(canonicalUrlParsed.hostname)) {
      blockingFindings.push(`Canonical points to a non-production host (${canonicalUrl}).`);
    }

    const comparableCanonical = normalizeComparableAbsoluteUrl(canonicalUrlParsed.toString());
    if (comparableCanonical !== routeRecord.expectedUrl) {
      blockingFindings.push(`Canonical does not self-reference the page URL (${comparableCanonical} != ${routeRecord.expectedUrl}).`);
    }
  }

  if (!sitemap.routes.has(routeRecord.route) && !robotsTokens.has('noindex')) {
    blockingFindings.push('Expected route is missing from sitemap.xml.');
  }

  if (!title) {
    blockingFindings.push('Missing non-empty <title> tag.');
  } else if (title.length > 60) {
    warnings.push(`Title length ${title.length} exceeds the recommended 60-character limit.`);
  }

  if (!description) {
    blockingFindings.push('Missing non-empty meta description.');
  } else if (description.length < 120 || description.length > 155) {
    warnings.push(`Meta description length ${description.length} is outside the recommended 120-155 character range.`);
  }

  const hasNoindex = robotsTokens.has('noindex');
  if (hasNoindex && !expectedNoindexRoutes.has(routeRecord.route)) {
    blockingFindings.push('Unexpected noindex directive on an indexable route.');
  }

  return {
    route: routeRecord.route,
    expectedUrl: routeRecord.expectedUrl,
    sources: describeSources(routeRecord),
    builtArtifactPath: inventoryEntry.repoRelativePath,
    title,
    titleLength: title.length,
    description,
    descriptionLength: description.length,
    canonicalCount: canonicalLinks.length,
    canonicalUrl,
    sitemapUrl: sitemap.routes.get(routeRecord.route)?.loc ?? null,
    robots: [...robotsTokens].sort(),
    hasNoindex,
    result: blockingFindings.length === 0 ? 'pass' : 'fail',
    blockingFindings,
    warnings
  };
}

async function analyzeDuplicateTitles(htmlInventory) {
  const titles = new Map();

  for (const inventoryEntry of htmlInventory.values()) {
    const { $ } = await readHtmlPage(inventoryEntry.filePath);
    if (inventoryEntry.route === '/404.html' || isAliasHelperPage($)) {
      continue;
    }

    const robotsTokens = readRobotsTokens($);
    if (robotsTokens.has('noindex')) {
      continue;
    }

    const title = $('title').first().text().trim();
    if (!title) {
      continue;
    }

    const canonicalUrl = getCanonicalLinks($).first().attr('href')?.trim() ?? '';
    let selfCanonical = false;

    if (canonicalUrl) {
      try {
        selfCanonical = normalizeComparableAbsoluteUrl(canonicalUrl) === toAbsoluteUrl(inventoryEntry.route);
      } catch {
        selfCanonical = false;
      }
    }

    const current = titles.get(title) ?? [];
    current.push({
      route: inventoryEntry.route,
      builtArtifactPath: inventoryEntry.repoRelativePath,
      canonicalUrl,
      selfCanonical,
      pagination: isPaginationRoute(inventoryEntry.route)
    });
    titles.set(title, current);
  }

  return [...titles.entries()]
    .filter(([, entries]) => entries.length > 1)
    .map(([title, entries]) => {
      const nonPagination = entries.filter((entry) => !entry.pagination);
      const paginationEntries = entries.filter((entry) => entry.pagination);
      const allowed = nonPagination.length === 1
        && nonPagination[0].selfCanonical
        && paginationEntries.length > 0
        && paginationEntries.every((entry) => !entry.selfCanonical);
      return {
        title,
        routes: entries,
        allowed,
        result: allowed ? 'allowed' : 'fail',
        reason: allowed
          ? 'Paginated pages share a title with their self-canonical section root.'
          : 'Duplicate title detected on non-pagination or non-self-canonical routes.'
      };
    })
    .sort((left, right) => left.title.localeCompare(right.title));
}

function summarize(entries, duplicateTitles, environmentDiagnostics, sampleMatrix, priorityRoutes) {
  const checkedEntries = entries.filter((entry) => entry.result !== 'skipped');
  const duplicateFailures = duplicateTitles.filter((entry) => entry.result === 'fail').length;

  return {
    sampleMatrixRouteCount: Object.values(sampleMatrix.page_samples ?? {}).reduce(
      (count, group) => count + (Array.isArray(group) ? group.length : 0),
      0
    ),
    priorityRouteCount: Array.isArray(priorityRoutes.routes) ? priorityRoutes.routes.length : 0,
    totalRoutes: entries.length,
    checkedRoutes: checkedEntries.length,
    skippedRoutes: entries.filter((entry) => entry.result === 'skipped').length,
    passCount: checkedEntries.filter((entry) => entry.result === 'pass').length,
    failCount: checkedEntries.filter((entry) => entry.result === 'fail').length,
    blockingFailures: checkedEntries.filter((entry) => entry.result === 'fail').length + duplicateFailures + environmentDiagnostics.length,
    warningCount: entries.reduce((count, entry) => count + (entry.warnings?.length ?? 0), 0),
    unexpectedNoindexCount: checkedEntries.filter((entry) => entry.hasNoindex).length,
    duplicateTitleGroups: duplicateTitles.length,
    duplicateTitleFailures: duplicateFailures,
    duplicateTitleAllowedGroups: duplicateTitles.filter((entry) => entry.result === 'allowed').length,
    environmentDiagnostics: environmentDiagnostics.length
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const [sampleMatrixSource, priorityRoutesSource, htmlInventory, expectedNoindex, sitemap] = await Promise.all([
    fs.readFile(options.sampleMatrixPath, 'utf8'),
    fs.readFile(options.priorityRoutesPath, 'utf8'),
    collectHtmlInventory(options.publicRoot),
    loadFrontMatterNoindexRoutes(options.contentRoot),
    loadSitemapCollection(options.publicRoot)
  ]);
  const sampleMatrix = JSON.parse(sampleMatrixSource);
  const priorityRoutes = JSON.parse(priorityRoutesSource);
  const routeRecords = collectValidationRoutes(sampleMatrix, priorityRoutes);
  const entries = [];

  for (const routeRecord of routeRecords) {
    entries.push(await analyzeRoute(routeRecord, htmlInventory, sitemap, expectedNoindex.routes));
  }

  const duplicateTitles = await analyzeDuplicateTitles(htmlInventory);
  const environmentDiagnostics = [];
  const checkedEntries = entries.filter((entry) => entry.result !== 'skipped');
  if (checkedEntries.length > 0 && checkedEntries.every((entry) => entry.hasNoindex)) {
    environmentDiagnostics.push('Every checked route carries noindex. Verify that the build was produced with --environment production.');
  }

  const summary = summarize(entries, duplicateTitles, environmentDiagnostics, sampleMatrix, priorityRoutes);
  const artifactProvenance = getArtifactProvenance(sampleMatrix.rc);
  const report = {
    phase: 8,
    ticket: 'RHI-086',
    artifact: 'seo-consistency-report',
    status: summary.blockingFailures === 0 ? 'pass' : 'fail',
    rcTag: sampleMatrix.rc?.tag ?? null,
    rcSha: sampleMatrix.rc?.commit ?? null,
    generatedAt: new Date().toISOString(),
    publicDir: toRepoRelative(options.publicRoot),
    sampleMatrix: {
      path: toRepoRelative(options.sampleMatrixPath),
      generatedAt: sampleMatrix.generated_at ?? null
    },
    artifactProvenance,
    priorityRoutes: {
      path: toRepoRelative(options.priorityRoutesPath),
      generatedAt: priorityRoutes.generated_at ?? null
    },
    sitemap: {
      path: toRepoRelative(sitemap.rootPath),
      urlCount: sitemap.urlEntries.length
    },
    policy: {
      canonicalHost: canonicalOrigin,
      paginationDuplicateTitles: 'allowed-if-self-canonical',
      metadataLengthSeverity: 'warning-only',
      metadataPresenceSeverity: 'blocking'
    },
    summary,
    environmentDiagnostics,
    expectedNoindexRoutes: expectedNoindex.details,
    entries,
    duplicateTitles
  };

  await writeJsonReport(options.reportPath, report);

  console.log(`SEO consistency report written to ${toRepoRelative(options.reportPath)}`);
  console.log(`Checked routes: ${summary.checkedRoutes}`);
  console.log(`Skipped routes: ${summary.skippedRoutes}`);
  console.log(`Blocking failures: ${summary.blockingFailures}`);
  console.log(`Warnings: ${summary.warningCount}`);

  if (report.status === 'fail') {
    process.exitCode = 1;
  }
}

await main();