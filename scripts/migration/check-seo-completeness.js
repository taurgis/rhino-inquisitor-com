import { accessSync, readFileSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import fg from 'fast-glob';
import { XMLParser } from 'fast-xml-parser';
import matter from 'gray-matter';
import { stringify as stringifyCsv } from 'csv-stringify/sync';

// Cheerio's current dependency chain expects a global File on Node 18.
if (typeof globalThis.File === 'undefined') {
  globalThis.File = class File {};
}

const { load: loadHtml } = await import('cheerio');

import {
  loadManifest,
  normalizeUrlLike,
  toRepoRelative,
  toPosixPath
} from './url-validation-helpers.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const canonicalOrigin = 'https://www.rhino-inquisitor.com';
const defaultContentDir = path.join(repoRoot, 'migration/output/content');
const defaultPublicDir = path.join(repoRoot, 'public');
const defaultManifest = path.join(repoRoot, 'migration/url-manifest.json');
const defaultBaseline = path.join(repoRoot, 'migration/phase-1-seo-baseline.md');
const defaultReport = path.join(repoRoot, 'migration/reports/seo-completeness-report.csv');
const urlPattern = /^\/[a-z0-9-]+(?:\/[a-z0-9-]+)*\/$/u;
const isoDateTimePattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/u;
const internalAssetPattern = /\.(?:xml|json|txt|pdf|png|svg|jpe?g|gif|webp|avif|css|js|map|woff2?|ttf|eot)$/iu;

async function main() {
  const options = resolveOptions(process.argv.slice(2));
  await fs.mkdir(path.dirname(options.reportFile), { recursive: true });

  const [manifest, baselineSource, contentEntries, publicState] = await Promise.all([
    loadManifest(options.manifestFile),
    fs.readFile(options.baselineFile, 'utf8'),
    loadContentEntries(options.contentDir),
    loadPublicState(options.publicDir)
  ]);

  const rows = [];
  const failures = [];
  const warnings = [];
  const contentByRoute = new Map();

  for (const entry of contentEntries) {
    if (entry.route) {
      const currentEntries = contentByRoute.get(entry.route) ?? [];
      currentEntries.push(entry);
      contentByRoute.set(entry.route, currentEntries);
    }
  }

  for (const [route, entries] of contentByRoute.entries()) {
    if (entries.length < 2) {
      continue;
    }

    for (const entry of entries) {
      recordRow(rows, failures, {
        scope: 'frontmatter',
        file: entry.relativePath,
        url: route,
        sampleGroup: '',
        check: 'duplicate_url',
        status: 'fail',
        severity: 'critical',
        message: 'Multiple staged Markdown files resolve to the same primary url.',
        expected: 'unique url',
        actual: route
      });
    }
  }

  for (const entry of contentEntries) {
    validateFrontMatterEntry(entry, rows, failures, warnings);
  }

  validateRenderedSamples({
    baselineSource,
    contentEntries,
    contentByRoute,
    manifest,
    publicState,
    rows,
    failures,
    warnings
  });

  const sortedRows = rows.sort((left, right) => {
    if (left.status !== right.status) {
      return statusRank(left.status) - statusRank(right.status);
    }

    if (left.url !== right.url) {
      return left.url.localeCompare(right.url);
    }

    if (left.scope !== right.scope) {
      return left.scope.localeCompare(right.scope);
    }

    return left.check.localeCompare(right.check);
  });

  await fs.writeFile(
    options.reportFile,
    stringifyCsv(sortedRows, {
      header: true,
      columns: [
        'scope',
        'file',
        'url',
        'sampleGroup',
        'check',
        'status',
        'severity',
        'message',
        'expected',
        'actual'
      ]
    }),
    'utf8'
  );

  console.log(
    [
      `Validated ${contentEntries.length} staged Markdown file(s).`,
      `Rendered sample checks used ${publicState.sampleRouteCount} route(s).`,
      `Warnings: ${warnings.length}.`,
      `Failures: ${failures.length}.`,
      `Wrote ${toRepoRelative(options.reportFile)}.`
    ].join(' ')
  );

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

function resolveOptions(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    switch (argument) {
      case '--content-dir':
        parsed.contentDir = path.resolve(argv[++index]);
        break;
      case '--public-dir':
        parsed.publicDir = path.resolve(argv[++index]);
        break;
      case '--manifest-file':
        parsed.manifestFile = path.resolve(argv[++index]);
        break;
      case '--baseline-file':
        parsed.baselineFile = path.resolve(argv[++index]);
        break;
      case '--report-file':
        parsed.reportFile = path.resolve(argv[++index]);
        break;
      case '--help':
        printHelp();
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown argument: ${argument}`);
    }
  }

  return {
    contentDir: parsed.contentDir ?? defaultContentDir,
    publicDir: parsed.publicDir ?? defaultPublicDir,
    manifestFile: parsed.manifestFile ?? defaultManifest,
    baselineFile: parsed.baselineFile ?? defaultBaseline,
    reportFile: parsed.reportFile ?? defaultReport
  };
}

function printHelp() {
  console.log(`Usage: node scripts/migration/check-seo-completeness.js [options]

Options:
  --content-dir <path>    Override migration/output/content directory.
  --public-dir <path>     Override the built public directory used for sampled HTML checks.
  --manifest-file <path>  Override migration/url-manifest.json.
  --baseline-file <path>  Override migration/phase-1-seo-baseline.md.
  --report-file <path>    Override migration/reports/seo-completeness-report.csv.
  --help                  Show this help message.
`);
}

async function loadContentEntries(contentDir) {
  const markdownFiles = (await fg('**/*.md', {
    cwd: contentDir,
    absolute: true,
    onlyFiles: true
  })).sort((left, right) => left.localeCompare(right));

  return Promise.all(markdownFiles.map(async (absolutePath) => {
    const parsed = matter(await fs.readFile(absolutePath, 'utf8'));
    const relativePath = toPosixPath(path.relative(contentDir, absolutePath));
    const contentType = relativePath.startsWith('posts/')
      ? 'post'
      : relativePath.startsWith('pages/')
        ? 'page'
        : 'other';
    const route = typeof parsed.data.url === 'string' && parsed.data.url.trim()
      ? normalizeUrlLike(parsed.data.url).comparablePathOnly
      : null;

    return {
      absolutePath,
      relativePath: toRepoRelative(absolutePath),
      contentType,
      data: parsed.data,
      route
    };
  }));
}

async function loadPublicState(publicDir) {
  const htmlFiles = (await fg('**/*.html', {
    cwd: publicDir,
    absolute: true,
    onlyFiles: true,
    suppressErrors: true
  })).sort((left, right) => left.localeCompare(right));
  const htmlRoutes = new Map();

  for (const absolutePath of htmlFiles) {
    const relativePath = toPosixPath(path.relative(publicDir, absolutePath));
    const route = relativePath === 'index.html'
      ? '/'
      : relativePath.endsWith('/index.html')
        ? `/${relativePath.slice(0, -'index.html'.length)}`
        : `/${relativePath}`;
    const normalizedRoute = normalizeUrlLike(route).comparablePathOnly;
    htmlRoutes.set(normalizedRoute, {
      absolutePath,
      relativePath: toRepoRelative(absolutePath)
    });
  }

  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  let sitemapRoutes = new Set();
  if (await fileExists(sitemapPath)) {
    sitemapRoutes = await loadSitemapRoutes(sitemapPath);
  }

  return {
    publicDir,
    htmlRoutes,
    sitemapRoutes,
    sampleRouteCount: htmlRoutes.size
  };
}

async function loadSitemapRoutes(sitemapPath) {
  const source = await fs.readFile(sitemapPath, 'utf8');
  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(source);
  const urlEntries = asArray(parsed?.urlset?.url);

  return new Set(urlEntries
    .map((entry) => String(entry?.loc ?? '').trim())
    .filter(Boolean)
    .map((location) => normalizeUrlLike(location).comparablePathOnly));
}

function validateFrontMatterEntry(entry, rows, failures, warnings) {
  const issues = [];
  const data = entry.data;
  const url = entry.route ?? '';

  if (data.draft !== false) {
    issues.push(issue('draft_false', 'fail', 'critical', 'Launch-intended content must set draft to false explicitly.', 'false', String(data.draft)));
  }

  if (!isNonEmptyString(data.title)) {
    issues.push(issue('title_present', 'fail', 'critical', 'title is required and must be non-empty.', 'non-empty title', String(data.title ?? '')));
  } else if (String(data.title).trim().length > 60) {
    issues.push(issue('title_length', 'warn', 'medium', 'title exceeds the recommended 60-character limit.', '<= 60 characters', String(String(data.title).trim().length)));
  }

  if (!isNonEmptyString(data.description)) {
    issues.push(issue('description_present', 'fail', 'critical', 'description is required and must be non-empty.', 'non-empty description', String(data.description ?? '')));
  } else {
    const length = String(data.description).trim().length;
    if (length < 120 || length > 155) {
      issues.push(issue('description_length', 'warn', 'medium', 'description length is outside the 120-155 character target range.', '120-155 characters', String(length)));
    }
  }

  if (!isNonEmptyString(data.url) || !isValidUrlValue(String(data.url).trim())) {
    issues.push(issue('url_format', 'fail', 'critical', 'url must be lowercase, start with "/", and end with "/".', 'lowercase site-relative path', String(data.url ?? '')));
  }

  if (!isIsoDateTime(data.date)) {
    issues.push(issue('date_iso8601', 'fail', 'high', 'date must be present and parseable as ISO 8601.', 'valid ISO 8601 datetime', String(data.date ?? '')));
  }

  if (!isIsoDateTime(data.lastmod)) {
    issues.push(issue('lastmod_iso8601', 'fail', 'high', 'lastmod must be present and parseable as ISO 8601.', 'valid ISO 8601 datetime', String(data.lastmod ?? '')));
  }

  if (entry.contentType === 'post') {
    const categories = Array.isArray(data.categories) ? data.categories.filter((value) => isNonEmptyString(value)) : [];
    if (categories.length === 0) {
      issues.push(issue('categories_present', 'fail', 'high', 'Post content must include at least one category.', 'at least one category', JSON.stringify(data.categories ?? null)));
    }
  }

  if (hasNoindex(data)) {
    issues.push(issue('noindex_absent', 'fail', 'critical', 'Indexable migrated content must not carry a noindex signal in front matter.', 'no noindex signal', 'true'));
  }

  if (issues.length === 0) {
    rows.push({
      scope: 'frontmatter',
      file: entry.relativePath,
      url,
      sampleGroup: '',
      check: 'page_frontmatter',
      status: 'pass',
      severity: 'none',
      message: 'Required front matter checks passed.',
      expected: '',
      actual: ''
    });
    return;
  }

  for (const currentIssue of issues) {
    recordRow(rows, currentIssue.status === 'fail' ? failures : warnings, {
      scope: 'frontmatter',
      file: entry.relativePath,
      url,
      sampleGroup: '',
      check: currentIssue.check,
      status: currentIssue.status,
      severity: currentIssue.severity,
      message: currentIssue.message,
      expected: currentIssue.expected,
      actual: currentIssue.actual
    });
  }
}

function validateRenderedSamples({ baselineSource, contentEntries, contentByRoute, manifest, publicState, rows, failures, warnings }) {
  const availableRoutes = new Set(publicState.htmlRoutes.keys());
  const manifestByLegacy = new Map();
  const mergeTargetMap = new Map();

  for (const entry of manifest) {
    const legacyInfo = normalizeUrlLike(entry.legacy_url, { allowNull: false });
    manifestByLegacy.set(legacyInfo.serverRelative, entry);
    if (entry.disposition === 'merge' && typeof entry.target_url === 'string') {
      const currentTargets = mergeTargetMap.get(entry.target_url) ?? [];
      currentTargets.push(entry);
      mergeTargetMap.set(entry.target_url, currentTargets);
    }
  }

  const sampleSets = buildSampleSets({ baselineSource, availableRoutes, manifest, mergeTargetMap });

  for (const coverageCheck of sampleSets.coverageChecks) {
    recordRow(rows, coverageCheck.status === 'fail' ? failures : warnings, coverageCheck);
  }

  if (availableRoutes.size === 0) {
    recordRow(rows, failures, {
      scope: 'rendered',
      file: toRepoRelative(path.join(publicState.publicDir, 'index.html')),
      url: '',
      sampleGroup: 'prerequisite',
      check: 'public_build_present',
      status: 'fail',
      severity: 'critical',
      message: 'No built HTML files were found for sampled canonical and sitemap checks.',
      expected: 'built public HTML output',
      actual: '0 HTML files'
    });
    return;
  }

  if (publicState.sitemapRoutes.size === 0) {
    recordRow(rows, failures, {
      scope: 'rendered',
      file: toRepoRelative(path.join(publicState.publicDir, 'sitemap.xml')),
      url: '',
      sampleGroup: 'prerequisite',
      check: 'sitemap_present',
      status: 'fail',
      severity: 'critical',
      message: 'sitemap.xml is required for sampled canonical cross-signal validation.',
      expected: 'parseable sitemap.xml',
      actual: 'missing or empty'
    });
    return;
  }

  for (const sample of sampleSets.samples) {
    const htmlEntry = publicState.htmlRoutes.get(sample.route);
    if (!htmlEntry) {
      recordRow(rows, failures, {
        scope: 'rendered',
        file: '',
        url: sample.route,
        sampleGroup: sample.group,
        check: 'rendered_route_present',
        status: 'fail',
        severity: 'critical',
        message: 'Sampled route is missing from the built HTML output.',
        expected: 'rendered HTML file',
        actual: 'missing'
      });
      continue;
    }

    const contentEntry = contentByRoute.get(sample.route)?.[0] ?? null;
    const html = sample.html ?? null;

    void html;
    sample.file = htmlEntry.relativePath;
    sample.contentEntry = contentEntry;
  }

  const htmlCache = new Map();
  for (const sample of sampleSets.samples) {
    if (!sample.file) {
      continue;
    }

    const htmlEntry = publicState.htmlRoutes.get(sample.route);
    const html = htmlCache.get(sample.route) ?? loadHtmlDocument(htmlEntry.absolutePath);
    htmlCache.set(sample.route, html);

    const expectedCanonical = `${canonicalOrigin}${sample.route === '/' ? '/' : sample.route}`;
    const canonicalHref = getCanonicalHref(html.$);
    if (canonicalHref !== expectedCanonical) {
      recordRow(rows, failures, {
        scope: 'rendered',
        file: sample.file,
        url: sample.route,
        sampleGroup: sample.group,
        check: 'canonical_matches_target',
        status: 'fail',
        severity: 'critical',
        message: 'Rendered canonical tag does not match the expected target URL.',
        expected: expectedCanonical,
        actual: canonicalHref || 'missing'
      });
    } else {
      rows.push({
        scope: 'rendered',
        file: sample.file,
        url: sample.route,
        sampleGroup: sample.group,
        check: 'canonical_matches_target',
        status: 'pass',
        severity: 'none',
        message: 'Rendered canonical matches the expected target URL.',
        expected: expectedCanonical,
        actual: canonicalHref
      });
    }

    if (!publicState.sitemapRoutes.has(sample.route)) {
      recordRow(rows, failures, {
        scope: 'rendered',
        file: sample.file,
        url: sample.route,
        sampleGroup: sample.group,
        check: 'sitemap_contains_route',
        status: 'fail',
        severity: 'high',
        message: 'Sampled route is missing from sitemap.xml.',
        expected: sample.route,
        actual: 'missing'
      });
    } else {
      rows.push({
        scope: 'rendered',
        file: sample.file,
        url: sample.route,
        sampleGroup: sample.group,
        check: 'sitemap_contains_route',
        status: 'pass',
        severity: 'none',
        message: 'Sampled route is present in sitemap.xml.',
        expected: sample.route,
        actual: sample.route
      });
    }

    const internalLinkIssues = inspectInternalLinks({
      sample,
      $: html.$,
      htmlRoutes: publicState.htmlRoutes,
      manifestByLegacy,
      publicDir: publicState.publicDir
    });

    if (internalLinkIssues.length === 0) {
      rows.push({
        scope: 'rendered',
        file: sample.file,
        url: sample.route,
        sampleGroup: sample.group,
        check: 'internal_links_canonical',
        status: 'pass',
        severity: 'none',
        message: 'Sampled internal links resolve to canonical or valid in-build targets.',
        expected: 'canonical internal links',
        actual: ''
      });
    } else {
      for (const currentIssue of internalLinkIssues) {
        recordRow(rows, failures, {
          scope: 'rendered',
          file: sample.file,
          url: sample.route,
          sampleGroup: sample.group,
          check: currentIssue.check,
          status: currentIssue.status,
          severity: currentIssue.severity,
          message: currentIssue.message,
          expected: currentIssue.expected,
          actual: currentIssue.actual
        });
      }
    }

    if (sample.group === 'merge_target') {
      const mergeRows = mergeTargetMap.get(sample.route) ?? [];
      const mergeLegacyUrls = mergeRows.map((entry) => entry.legacy_url).join('; ');
      if (canonicalHref === expectedCanonical) {
        rows.push({
          scope: 'rendered',
          file: sample.file,
          url: sample.route,
          sampleGroup: sample.group,
          check: 'merge_canonical_target',
          status: 'pass',
          severity: 'none',
          message: 'Merge target renders with the canonical target URL rather than a legacy source URL.',
          expected: expectedCanonical,
          actual: mergeLegacyUrls
        });
      } else {
        recordRow(rows, failures, {
          scope: 'rendered',
          file: sample.file,
          url: sample.route,
          sampleGroup: sample.group,
          check: 'merge_canonical_target',
          status: 'fail',
          severity: 'critical',
          message: 'Merge target does not render with the expected canonical target URL.',
          expected: expectedCanonical,
          actual: canonicalHref || mergeLegacyUrls || 'missing'
        });
      }
    }
  }
}

function buildSampleSets({ baselineSource, availableRoutes, manifest, mergeTargetMap }) {
  const trafficUrls = parseTableUrls(
    baselineSource,
    '### Top pages by clicks (90-day export)',
    '### 90-day vs 28-day top pages status'
  ).filter((route) => availableRoutes.has(route));
  const backlinkUrls = parseTableUrls(
    baselineSource,
    '## Link equity baseline',
    '## Metadata quality spot check'
  ).filter((route) => availableRoutes.has(route));
  const baselineCategoryUrls = [...new Set(
    parseAllBaselineUrls(baselineSource).filter((route) => route.startsWith('/category/') && availableRoutes.has(route))
  )];
  const renderedCategoryUrls = [...availableRoutes]
    .filter((route) => route.startsWith('/category/') && route !== '/category/')
    .sort((left, right) => left.localeCompare(right));
  const categoryUrls = takeUnique([...baselineCategoryUrls, ...renderedCategoryUrls], 5);
  const videoUrls = takeUnique(
    manifest
      .filter((entry) => entry.url_class === 'video' && typeof entry.target_url === 'string' && availableRoutes.has(entry.target_url))
      .map((entry) => entry.target_url),
    3
  );
  const mergeTargetUrls = takeUnique(
    [...mergeTargetMap.keys()]
      .filter((route) => route !== '/feed/' && availableRoutes.has(route))
      .sort((left, right) => left.localeCompare(right)),
    5
  );

  const homepage = availableRoutes.has('/') ? [{ route: '/', group: 'homepage' }] : [];
  const topTrafficRoutes = takeUnique(trafficUrls.filter((route) => route !== '/'), 10).map((route) => ({ route, group: 'top_traffic' }));
  const excludedBacklinks = new Set(['/', ...topTrafficRoutes.map((sample) => sample.route)]);
  const backlinkRoutes = takeUnique(
    backlinkUrls.filter((route) => !excludedBacklinks.has(route) && !route.startsWith('/category/')),
    5
  ).map((route) => ({ route, group: 'backlink' }));

  const samples = takeUniqueObjects([
    ...homepage,
    ...topTrafficRoutes,
    ...categoryUrls.map((route) => ({ route, group: 'category' })),
    ...videoUrls.map((route) => ({ route, group: 'video' })),
    ...backlinkRoutes,
    ...mergeTargetUrls.map((route) => ({ route, group: 'merge_target' }))
  ]);

  const coverageChecks = [
    sampleCoverageRow('homepage', homepage.length, 1),
    sampleCoverageRow('top_traffic', topTrafficRoutes.length, 10),
    sampleCoverageRow('category', categoryUrls.length, 5),
    sampleCoverageRow('video', videoUrls.length, 3),
    sampleCoverageRow('backlink', backlinkRoutes.length, 5)
  ];

  return { samples, coverageChecks };
}

function sampleCoverageRow(group, actualCount, expectedCount) {
  const passed = actualCount >= expectedCount;
  return {
    scope: 'sampling',
    file: '',
    url: '',
    sampleGroup: group,
    check: 'sample_coverage',
    status: passed ? 'pass' : 'warn',
    severity: passed ? 'none' : 'medium',
    message: passed
      ? `Representative sample coverage met the ${group} target.`
      : `Representative sample coverage is below the target for ${group}.`,
    expected: String(expectedCount),
    actual: String(actualCount)
  };
}

function inspectInternalLinks({ sample, $, htmlRoutes, manifestByLegacy, publicDir }) {
  const issues = [];
  const inspected = new Set();

  $('a[href]').each((_, element) => {
    const href = String(element.attribs?.href ?? '').trim();
    if (!href || inspected.has(href) || href.startsWith('#')) {
      return;
    }
    inspected.add(href);

    if (/^(?:mailto:|tel:|javascript:)/iu.test(href)) {
      return;
    }

    let normalized;
    try {
      normalized = normalizeHref(href);
    } catch {
      return;
    }

    if (!normalized || normalized.origin !== canonicalOrigin) {
      return;
    }

    const manifestEntry = manifestByLegacy.get(normalized.serverRelative);
    if (manifestEntry?.disposition === 'merge' && manifestEntry.target_url !== normalized.comparablePathOnly) {
      issues.push(issue(
        'internal_link_targets_canonical',
        'fail',
        'high',
        'Internal link still points at a legacy merge URL instead of its canonical target.',
        String(manifestEntry.target_url ?? ''),
        normalized.serverRelative
      ));
      return;
    }

    if (normalized.hasQuery) {
      return;
    }

    if (internalAssetPattern.test(normalized.pathname)) {
      const assetPath = path.join(publicDir, normalized.pathname.replace(/^\//u, ''));
      if (!issues.some((entry) => entry.actual === normalized.pathname) && !pathExistsSync(assetPath)) {
        issues.push(issue(
          'internal_link_resolves',
          'fail',
          'medium',
          'Internal asset link does not resolve in the built output.',
          'existing asset',
          normalized.pathname
        ));
      }
      return;
    }

    if (!htmlRoutes.has(normalized.comparablePathOnly)) {
      issues.push(issue(
        'internal_link_resolves',
        'fail',
        'high',
        'Internal link does not resolve to a canonical built HTML route.',
        'existing canonical route',
        normalized.comparablePathOnly
      ));
    }
  });

  return issues;
}

function normalizeHref(value) {
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return normalizeUrlLike(value);
  }

  if (value.startsWith('/')) {
    return normalizeUrlLike(value);
  }

  return normalizeUrlLike(`/${value}`);
}

function loadHtmlDocument(filePath) {
  const source = readFileSync(filePath, 'utf8');
  return {
    source,
    $: loadHtml(source)
  };
}

function getCanonicalHref($) {
  return $('link[rel="canonical"]').attr('href')?.trim() ?? '';
}

function parseTableUrls(source, startMarker, endMarker) {
  const section = sliceBetween(source, startMarker, endMarker);
  return [...section.matchAll(/\|\s*\d+\s*\|\s*(https:\/\/www\.rhino-inquisitor\.com[^\s|]+)\s*\|/g)]
    .map((match) => normalizeUrlLike(match[1]).comparablePathOnly);
}

function parseAllBaselineUrls(source) {
  return [...source.matchAll(/https:\/\/www\.rhino-inquisitor\.com([^\s|`)>]+)/g)]
    .map((match) => normalizeUrlLike(match[1]).comparablePathOnly);
}

function sliceBetween(source, startMarker, endMarker) {
  const startIndex = source.indexOf(startMarker);
  if (startIndex === -1) {
    return '';
  }

  const endIndex = source.indexOf(endMarker, startIndex + startMarker.length);
  if (endIndex === -1) {
    return source.slice(startIndex);
  }

  return source.slice(startIndex, endIndex);
}

function takeUnique(values, limit) {
  const uniqueValues = [];
  const seen = new Set();

  for (const value of values) {
    if (seen.has(value)) {
      continue;
    }
    seen.add(value);
    uniqueValues.push(value);
    if (uniqueValues.length >= limit) {
      break;
    }
  }

  return uniqueValues;
}

function takeUniqueObjects(values) {
  const uniqueValues = [];
  const seen = new Set();
  for (const value of values) {
    const key = `${value.group}:${value.route}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    uniqueValues.push(value);
  }
  return uniqueValues;
}

function recordRow(rows, bucket, row) {
  rows.push(row);
  bucket.push(row);
}

function issue(check, status, severity, message, expected, actual) {
  return { check, status, severity, message, expected, actual };
}

function statusRank(status) {
  switch (status) {
    case 'fail':
      return 0;
    case 'warn':
      return 1;
    default:
      return 2;
  }
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isIsoDateTime(value) {
  return typeof value === 'string'
    && isoDateTimePattern.test(value)
    && !Number.isNaN(Date.parse(value));
}

function isValidUrlValue(value) {
  return value === '/' || urlPattern.test(value);
}

function hasNoindex(data) {
  if (data?.noindex === true) {
    return true;
  }

  return data?.seo?.noindex === true;
}

function asArray(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (value == null) {
    return [];
  }
  return [value];
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function pathExistsSync(filePath) {
  try {
    accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});