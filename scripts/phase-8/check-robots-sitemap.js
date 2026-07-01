import fs from 'node:fs/promises';
import path from 'node:path';

import {
  collectHtmlInventory,
  fileExists,
  getArtifactProvenance,
  getCanonicalLinks,
  isAliasHelperPage,
  isIso8601,
  loadFrontMatterNoindexRoutes,
  loadSitemapCollection,
  normalizeRoute,
  phase8SeoDefaults,
  readHtmlPage,
  readRobotsTokens,
  resolveRobotsRule,
  parseRobotsFile,
  toAbsoluteUrl,
  writeJsonReport
} from './seo-gate-helpers.js';
import { toRepoRelative } from '../url/url-validation-helpers.js';

const defaults = {
  publicRoot: phase8SeoDefaults.publicRoot,
  contentRoot: phase8SeoDefaults.contentRoot,
  sampleMatrixPath: phase8SeoDefaults.sampleMatrixPath,
  robotsPath: path.join(phase8SeoDefaults.publicRoot, 'robots.txt'),
  reportPath: phase8SeoDefaults.robotsSitemapReportPath,
  sitemapPath: ''
};

function printHelp() {
  console.log(`Usage: node scripts/phase-8/check-robots-sitemap.js [options]

Options:
  --public-dir <path>      Override the built public directory.
  --content-dir <path>     Override the content directory used for expected noindex routes.
  --sample-matrix <path>   Override validation/sample-matrix.json for RC provenance.
  --robots-file <path>     Override the robots.txt path.
  --sitemap <path>         Override the sitemap.xml or sitemap_index.xml path.
  --report <path>          Override validation/robots-sitemap-report.json.
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
        options.robotsPath = path.join(options.publicRoot, 'robots.txt');
        break;
      case '--content-dir':
        options.contentRoot = path.resolve(argv[++index]);
        break;
      case '--sample-matrix':
        options.sampleMatrixPath = path.resolve(argv[++index]);
        break;
      case '--robots-file':
        options.robotsPath = path.resolve(argv[++index]);
        break;
      case '--sitemap':
        options.sitemapPath = path.resolve(argv[++index]);
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

function expectedNoindexReason(route, aliasHelperRoutes, frontMatterNoindexRoutes) {
  if (aliasHelperRoutes.has(route)) {
    return 'alias-helper';
  }

  if (route === '/404.html' || route === '/404/') {
    return '404-page';
  }

  if (frontMatterNoindexRoutes.has(route)) {
    return 'front-matter';
  }

  return null;
}

async function collectNoindexPages(htmlInventory, aliasHelperRoutes, frontMatterNoindexRoutes, sitemapRoutes) {
  const pages = [];
  const blockingFindings = [];

  for (const inventoryEntry of htmlInventory.values()) {
    const { $ } = await readHtmlPage(inventoryEntry.filePath);
    const robotsTokens = readRobotsTokens($);
    if (!robotsTokens.has('noindex')) {
      continue;
    }

    const expectedReason = expectedNoindexReason(inventoryEntry.route, aliasHelperRoutes, frontMatterNoindexRoutes);
    const sitemapIncluded = sitemapRoutes.has(inventoryEntry.route);

    pages.push({
      route: inventoryEntry.route,
      builtArtifactPath: inventoryEntry.repoRelativePath,
      expected: expectedReason != null,
      reason: expectedReason,
      sitemapIncluded
    });

    if (sitemapIncluded) {
      blockingFindings.push(`${inventoryEntry.route} is marked noindex but still appears in the sitemap.`);
    }
  }

  return {
    pages: pages.sort((left, right) => left.route.localeCompare(right.route)),
    blockingFindings
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const [sitemap, htmlInventory, expectedNoindex, sampleMatrixSource] = await Promise.all([
    loadSitemapCollection(options.publicRoot, options.sitemapPath),
    collectHtmlInventory(options.publicRoot),
    loadFrontMatterNoindexRoutes(options.contentRoot),
    fs.readFile(options.sampleMatrixPath, 'utf8')
  ]);
  const sampleMatrix = JSON.parse(sampleMatrixSource);
  const aliasHelperRoutes = new Map();

  for (const inventoryEntry of htmlInventory.values()) {
    const { $, htmlSource } = await readHtmlPage(inventoryEntry.filePath);
    if (!isAliasHelperPage($)) {
      continue;
    }

    const canonicalUrl = getCanonicalLinks($).first().attr('href')?.trim() ?? '';
    const metaRefresh = /<meta\b[^>]*http-equiv=(?:"refresh"|'refresh')[^>]*content=(?:"[^"]*url=([^"]+)"|'[^']*url=([^']+)')[^>]*>/iu.exec(htmlSource);
    aliasHelperRoutes.set(inventoryEntry.route, {
      route: inventoryEntry.route,
      builtArtifactPath: inventoryEntry.repoRelativePath,
      canonicalUrl,
      redirectTarget: metaRefresh?.[1] ?? metaRefresh?.[2] ?? null
    });
  }

  const sitemapEntries = [];
  const sitemapBlockingFindings = [];

  for (const entry of sitemap.urlEntries) {
    const findings = [];
    let route = null;

    try {
      const parsed = new URL(entry.loc);
      route = normalizeRoute(parsed.pathname);

      if (parsed.protocol !== 'https:') {
        findings.push(`Sitemap URL is not HTTPS (${entry.loc}).`);
      }

      if (parsed.hostname !== 'www.rhino-inquisitor.com') {
        findings.push(`Sitemap URL host is not www.rhino-inquisitor.com (${entry.loc}).`);
      }

      if (parsed.search || parsed.hash) {
        findings.push(`Sitemap URL must not include query strings or fragments (${entry.loc}).`);
      }
    } catch {
      findings.push(`Sitemap <loc> is not a valid absolute URL (${entry.loc}).`);
    }

    if (entry.lastmod && !isIso8601(entry.lastmod)) {
      findings.push(`Sitemap <lastmod> is not ISO 8601 (${entry.lastmod}).`);
    }

    if (route && aliasHelperRoutes.has(route)) {
      findings.push('Sitemap must not include Hugo alias redirect helper pages.');
    }

    sitemapEntries.push({
      loc: entry.loc,
      route,
      lastmod: entry.lastmod || null,
      sourceFile: entry.sourceFile,
      result: findings.length === 0 ? 'pass' : 'fail',
      findings
    });
    sitemapBlockingFindings.push(...findings);
  }

  for (const document of sitemap.documents) {
    if (!document.utf8) {
      sitemapBlockingFindings.push(`${document.path} is not valid UTF-8.`);
    }

    if (document.byteSize > 50 * 1024 * 1024) {
      sitemapBlockingFindings.push(`${document.path} exceeds the 50 MB uncompressed sitemap limit.`);
    }

    if (document.type === 'urlset' && document.urlCount > 50000) {
      sitemapBlockingFindings.push(`${document.path} exceeds the 50,000 URL sitemap limit.`);
    }
  }

  for (const unresolvedChild of sitemap.unresolvedChildren) {
    sitemapBlockingFindings.push(`Referenced child sitemap could not be validated (${unresolvedChild.loc}).`);
  }

  let robots = {
    present: false,
    path: toRepoRelative(options.robotsPath),
    sitemapDirectives: [],
    wildcardRules: [],
    disallowedSitemapRoutes: []
  };
  const robotsBlockingFindings = [];
  const expectedSitemapUrl = toAbsoluteUrl(`/${path.relative(options.publicRoot, sitemap.rootPath).split(path.sep).join('/')}`);

  if (!(await fileExists(options.robotsPath))) {
    robotsBlockingFindings.push('robots.txt is missing from the built public artifact.');
  } else {
    const robotsSource = await fs.readFile(options.robotsPath, 'utf8');
    const robotsData = parseRobotsFile(robotsSource);

    robots = {
      present: true,
      path: toRepoRelative(options.robotsPath),
      sitemapDirectives: robotsData.sitemapDirectives,
      wildcardRules: robotsData.wildcardRules,
      disallowedSitemapRoutes: []
    };

    if (!robotsData.sitemapDirectives.includes(expectedSitemapUrl)) {
      robotsBlockingFindings.push(`robots.txt must include Sitemap: ${expectedSitemapUrl}.`);
    }

    for (const sitemapRoute of sitemap.routes.keys()) {
      const resolution = resolveRobotsRule(sitemapRoute, robotsData.wildcardRules);
      if (!resolution.blocked) {
        continue;
      }

      robots.disallowedSitemapRoutes.push({
        route: sitemapRoute,
        matchedRule: resolution.matchedRule?.value ?? ''
      });
      robotsBlockingFindings.push(`robots.txt blocks a sitemap URL (${sitemapRoute}) via ${resolution.matchedRule?.value ?? 'unknown rule'}.`);
    }
  }

  const noindex = await collectNoindexPages(
    htmlInventory,
    new Set(aliasHelperRoutes.keys()),
    expectedNoindex.routes,
    sitemap.routes
  );
  const allBlockingFindings = [
    ...sitemapBlockingFindings,
    ...robotsBlockingFindings,
    ...noindex.blockingFindings
  ];
  const summary = {
    sitemapEntryCount: sitemap.urlEntries.length,
    sitemapDocumentCount: sitemap.documents.length,
    invalidSitemapEntryCount: sitemapEntries.filter((entry) => entry.result === 'fail').length,
    aliasHelperCount: aliasHelperRoutes.size,
    aliasInclusionFailures: sitemapEntries.filter((entry) => entry.findings.includes('Sitemap must not include Hugo alias redirect helper pages.')).length,
    noindexPageCount: noindex.pages.length,
    unexpectedNoindexPageCount: noindex.pages.filter((page) => !page.expected).length,
    disallowedSitemapRouteCount: robots.disallowedSitemapRoutes.length,
    blockingFailures: allBlockingFindings.length
  };
  const artifactProvenance = getArtifactProvenance(sampleMatrix.rc);
  const report = {
    phase: 8,
    ticket: 'RHI-086',
    artifact: 'robots-sitemap-report',
    status: summary.blockingFailures === 0 ? 'pass' : 'fail',
    rcTag: sampleMatrix.rc?.tag ?? null,
    rcSha: sampleMatrix.rc?.commit ?? null,
    generatedAt: new Date().toISOString(),
    publicDir: toRepoRelative(options.publicRoot),
    artifactProvenance,
    sitemap: {
      rootPath: toRepoRelative(sitemap.rootPath),
      expectedUrl: expectedSitemapUrl,
      documents: sitemap.documents,
      unresolvedChildren: sitemap.unresolvedChildren,
      entries: sitemapEntries
    },
    robots: {
      ...robots,
      findings: robotsBlockingFindings
    },
    noindexPages: noindex.pages,
    aliasPages: [...aliasHelperRoutes.values()].sort((left, right) => left.route.localeCompare(right.route)),
    summary,
    blockingFindings: allBlockingFindings
  };

  await writeJsonReport(options.reportPath, report);

  console.log(`Phase 8 robots/sitemap report written to ${toRepoRelative(options.reportPath)}`);
  console.log(`Sitemap URLs: ${summary.sitemapEntryCount}`);
  console.log(`Alias helpers: ${summary.aliasHelperCount}`);
  console.log(`Noindex pages: ${summary.noindexPageCount}`);
  console.log(`Blocking failures: ${summary.blockingFailures}`);

  if (report.status === 'fail') {
    process.exitCode = 1;
  }
}

await main();