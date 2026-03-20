import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import fg from 'fast-glob';
import matter from 'gray-matter';

import {
  canonicalOrigin,
  loadManifest,
  normalizeUrlLike,
  repoRoot,
  toPosixPath,
} from '../migration/url-validation-helpers.js';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const phase8Root = path.resolve(scriptDir, '..');

const defaults = {
  manifestPath: path.join(repoRoot, 'migration', 'url-manifest.json'),
  seoBaselinePath: path.join(repoRoot, 'migration', 'phase-1-seo-baseline.md'),
  contentRoot: path.join(repoRoot, 'src', 'content'),
  publicRoot: path.join(repoRoot, 'public'),
  expectedOutcomesPath: path.join(repoRoot, 'validation', 'expected-url-outcomes.json'),
  sampleMatrixPath: path.join(repoRoot, 'validation', 'sample-matrix.json'),
  priorityRoutesPath: path.join(repoRoot, 'validation', 'priority-routes.json'),
  rcTag: 'phase-8-rc-v1',
  manifestTag: 'phase-6-redirect-map-v1',
  generatedAt: new Date().toISOString(),
};

const legalRoutePattern = /(privacy|cookie|legal|terms|disclaimer)/i;
const requiredUrlClasses = ['post', 'page', 'category', 'video', 'landing', 'system'];
const priorityOrder = ['critical', 'high', 'medium', 'low'];

function parseArgs(argv) {
  const options = { ...defaults };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case '--manifest':
        options.manifestPath = path.resolve(argv[++index]);
        break;
      case '--seo-baseline':
        options.seoBaselinePath = path.resolve(argv[++index]);
        break;
      case '--content-dir':
        options.contentRoot = path.resolve(argv[++index]);
        break;
      case '--public-dir':
        options.publicRoot = path.resolve(argv[++index]);
        break;
      case '--expected-outcomes':
        options.expectedOutcomesPath = path.resolve(argv[++index]);
        break;
      case '--sample-matrix':
        options.sampleMatrixPath = path.resolve(argv[++index]);
        break;
      case '--priority-routes':
        options.priorityRoutesPath = path.resolve(argv[++index]);
        break;
      case '--rc-tag':
        options.rcTag = String(argv[++index] ?? '').trim() || defaults.rcTag;
        break;
      case '--manifest-tag':
        options.manifestTag = String(argv[++index] ?? '').trim() || defaults.manifestTag;
        break;
      case '--generated-at':
        options.generatedAt = String(argv[++index] ?? '').trim() || defaults.generatedAt;
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

function printHelp() {
  console.log(`Usage: node scripts/phase-8/generate-validation-datasets.js [options]

Options:
  --manifest <path>            Override migration/url-manifest.json
  --seo-baseline <path>        Override migration/phase-1-seo-baseline.md
  --content-dir <path>         Override src/content directory
  --public-dir <path>          Override built public output directory
  --expected-outcomes <path>   Output path for validation/expected-url-outcomes.json
  --sample-matrix <path>       Output path for validation/sample-matrix.json
  --priority-routes <path>     Output path for validation/priority-routes.json
  --rc-tag <value>             RC tag recorded in metadata (default: phase-8-rc-v1)
  --manifest-tag <value>       Frozen manifest tag recorded in metadata (default: phase-6-redirect-map-v1)
  --generated-at <iso>         Override generation timestamp
  --help                       Show this help message
`);
}

function gitStdout(args) {
  const result = spawnSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed: ${result.stderr.trim() || 'unknown error'}`);
  }

  return result.stdout.trim();
}

function getRefCommit(ref) {
  return gitStdout(['rev-list', '-n', '1', ref]);
}

function toRepoRelative(filePath) {
  return toPosixPath(path.relative(repoRoot, filePath));
}

function routeToBuiltPath(routeInfo) {
  if (routeInfo.pathname === '/') {
    return 'index.html';
  }

  const trimmedPath = routeInfo.pathname.replace(/^\//u, '');
  if (path.extname(trimmedPath)) {
    return trimmedPath;
  }

  if (trimmedPath.endsWith('/')) {
    return `${trimmedPath}index.html`;
  }

  return `${trimmedPath}/index.html`;
}

function normalizeRoute(value) {
  return normalizeUrlLike(value).comparablePathOnly;
}

function deriveRouteFromContentPath(relativePosix, section) {
  const withoutSection = relativePosix.replace(new RegExp(`^${section}/`, 'u'), '');
  const withoutFilename = withoutSection.replace(/(?:^|\/)_(?:index)\.md$/u, '').replace(/(?:^|\/)index\.md$/u, '');
  const trimmed = withoutFilename.replace(/^\/+|\/+$/gu, '');

  if (section === 'categories') {
    return trimmed.length > 0 ? `/category/${trimmed}/` : '/category/';
  }

  return trimmed.length > 0 ? `/${trimmed}/` : '/';
}

function toAbsoluteUrl(route) {
  return `${canonicalOrigin}${route === '/' ? '/' : route}`;
}

function priorityRank(priority) {
  const index = priorityOrder.indexOf(priority);
  return index === -1 ? priorityOrder.length : index;
}

function compareRoutes(left, right) {
  return left.localeCompare(right);
}

function createPublicLookup(publicFiles) {
  const fileSet = new Set(publicFiles);

  return {
    hasRoute(route) {
      return fileSet.has(routeToBuiltPath(normalizeUrlLike(route)));
    },
    builtPathForRoute(route) {
      const builtPath = routeToBuiltPath(normalizeUrlLike(route));
      return fileSet.has(builtPath) ? builtPath : null;
    },
    hasFile(relativePath) {
      return fileSet.has(relativePath);
    },
  };
}

function parseMarkdownTableLines(lines) {
  const rows = [];
  let headers = null;

  for (const line of lines) {
    if (!line.trim().startsWith('|')) {
      continue;
    }

    const columns = line
      .split('|')
      .slice(1, -1)
      .map((column) => column.trim());

    if (columns.every((column) => /^:?-{3,}:?$/u.test(column))) {
      continue;
    }

    if (!headers) {
      headers = columns;
      continue;
    }

    const row = {};
    headers.forEach((header, index) => {
      row[header] = columns[index] ?? '';
    });
    rows.push(row);
  }

  return rows;
}

function extractTable(markdown, heading) {
  const lines = markdown.split(/\r?\n/u);
  const headingIndex = lines.findIndex((line) => line.trim() === heading);
  if (headingIndex === -1) {
    throw new Error(`Could not find heading: ${heading}`);
  }

  const tableLines = [];
  let inTable = false;

  for (let index = headingIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!inTable && trimmed.startsWith('|')) {
      inTable = true;
      tableLines.push(line);
      continue;
    }

    if (!inTable) {
      continue;
    }

    if (!trimmed.startsWith('|')) {
      break;
    }

    tableLines.push(line);
  }

  if (tableLines.length === 0) {
    throw new Error(`Could not find table under heading: ${heading}`);
  }

  return parseMarkdownTableLines(tableLines);
}

function parseNumber(rawValue) {
  const sanitized = String(rawValue)
    .replace(/[%#,]/gu, '')
    .trim();

  return Number(sanitized);
}

function parsePercent(rawValue) {
  return Number(String(rawValue).replace('%', '').trim());
}

async function collectContentEntries(contentRoot, publicLookup) {
  const files = (await fg(['posts/**/*.md', 'pages/**/*.md', 'categories/**/*.md'], {
    cwd: contentRoot,
    onlyFiles: true,
    dot: false,
    suppressErrors: true,
  })).sort();

  const entries = [];

  for (const relativePath of files) {
    const absolutePath = path.join(contentRoot, relativePath);
    const parsed = matter(await readFile(absolutePath, 'utf8'));
    if (parsed.data?.draft === true || parsed.data?.scaffoldFixture === true) {
      continue;
    }

    const relativePosix = toPosixPath(relativePath);
    const section = relativePosix.split('/')[0];
    const routeValue = typeof parsed.data.url === 'string' && parsed.data.url.trim().length > 0
      ? parsed.data.url.trim()
      : deriveRouteFromContentPath(relativePosix, section);
    if (!routeValue) {
      continue;
    }

    const routeInfo = normalizeUrlLike(routeValue);
    const builtPath = publicLookup.builtPathForRoute(routeInfo.pathname);
    entries.push({
      route: routeInfo.pathname,
      absoluteUrl: routeInfo.absolute,
      builtPath,
      contentPath: toRepoRelative(absolutePath),
      section,
      title: typeof parsed.data.title === 'string' ? parsed.data.title.trim() : routeInfo.pathname,
      date: parsed.data.date ?? null,
      lastmod: parsed.data.lastmod ?? null,
      hasVideo: Boolean(parsed.data?.video?.id),
      isBuilt: builtPath != null,
      layout: typeof parsed.data.layout === 'string' ? parsed.data.layout.trim() : null,
    });
  }

  return entries;
}

function isoDateValue(rawValue) {
  if (!rawValue) {
    return null;
  }

  const parsed = new Date(String(rawValue));
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function buildSample(entry, selectionReason) {
  return {
    url: entry.route,
    absolute_url: entry.absoluteUrl,
    built_artifact_path: entry.builtPath,
    content_path: entry.contentPath,
    title: entry.title,
    section: entry.section,
    date: isoDateValue(entry.date),
    lastmod: isoDateValue(entry.lastmod),
    selection_reason: selectionReason,
  };
}

function buildAuxiliarySample({ route, builtPath, selectionReason, validationMode, notes = null }) {
  return {
    url: route,
    absolute_url: toAbsoluteUrl(route),
    built_artifact_path: builtPath,
    validation_mode: validationMode,
    selection_reason: selectionReason,
    notes,
  };
}

function compareContentEntriesByRoute(left, right) {
  return compareRoutes(left.route, right.route);
}

function compareRecentPosts(left, right) {
  const leftDate = isoDateValue(left.date);
  const rightDate = isoDateValue(right.date);

  if (leftDate && rightDate && leftDate !== rightDate) {
    return rightDate.localeCompare(leftDate);
  }

  if (leftDate && !rightDate) {
    return -1;
  }

  if (!leftDate && rightDate) {
    return 1;
  }

  return compareContentEntriesByRoute(left, right);
}

function selectCoverageRepresentative(entries, predicate) {
  return entries.filter(predicate).sort(compareContentEntriesByRoute)[0] ?? null;
}

function buildExpectedOutcomeEntry(entry) {
  const legacyInfo = normalizeUrlLike(entry.legacy_url);
  const targetInfo = entry.target_url ? normalizeUrlLike(entry.target_url) : null;
  const queryException = legacyInfo.hasQuery;
  const aliasBackedMerge = entry.disposition === 'merge' && entry.implementation_layer === 'pages-static' && !queryException;
  const isKeep = entry.disposition === 'keep';
  const isRetire = entry.disposition === 'retire';

  const canonicalExpectation = {
    outcome: isKeep ? 'serve' : isRetire ? 'not-found' : 'redirect',
    status_code: isKeep ? 200 : isRetire ? (entry.redirect_code ?? 404) : (entry.redirect_code ?? 301),
    target_url: targetInfo?.pathname ?? null,
    max_hops: entry.disposition === 'merge' ? 1 : 0,
  };

  let buildValidation;

  if (queryException) {
    buildValidation = {
      scope: 'accepted-risk',
      mode: 'request-aware-exception',
      assertion: 'phase-8-coverage-only',
      built_artifact_path: null,
      expected_redirect_target: targetInfo?.pathname ?? null,
      expected_canonical_target: targetInfo?.absolute ?? null,
      notes: entry.reason,
    };
  } else if (isKeep) {
    buildValidation = {
      scope: 'blocking',
      mode: path.extname(legacyInfo.pathname) ? 'static-file' : 'built-route',
      assertion: 'artifact-exists-at-preserved-path',
      built_artifact_path: routeToBuiltPath(legacyInfo),
      expected_redirect_target: null,
      expected_canonical_target: targetInfo?.absolute ?? legacyInfo.absolute,
      notes: null,
    };
  } else if (aliasBackedMerge) {
    buildValidation = {
      scope: 'blocking',
      mode: 'alias-helper',
      assertion: 'meta-refresh-points-to-final-target',
      built_artifact_path: routeToBuiltPath(legacyInfo),
      expected_redirect_target: targetInfo?.pathname ?? null,
      expected_canonical_target: targetInfo?.absolute ?? null,
      notes: null,
    };
  } else if (isRetire) {
    buildValidation = {
      scope: 'blocking',
      mode: 'artifact-absence',
      assertion: 'no-generated-artifact-at-legacy-path',
      built_artifact_path: routeToBuiltPath(legacyInfo),
      expected_redirect_target: null,
      expected_canonical_target: null,
      notes: entry.redirect_code === 410 ? 'Hosting layer may emit 410 when supported; Pages-only validation checks artifact absence.' : null,
    };
  } else {
    buildValidation = {
      scope: 'accepted-risk',
      mode: 'unimplemented-merge-exception',
      assertion: 'phase-8-coverage-only',
      built_artifact_path: null,
      expected_redirect_target: targetInfo?.pathname ?? null,
      expected_canonical_target: targetInfo?.absolute ?? null,
      notes: entry.reason,
    };
  }

  return {
    legacy_url: legacyInfo.pathname + legacyInfo.search,
    target_url: targetInfo?.pathname ?? null,
    disposition: entry.disposition,
    redirect_code: entry.redirect_code,
    url_class: entry.url_class,
    priority: entry.priority,
    implementation_layer: entry.implementation_layer,
    has_organic_traffic: entry.has_organic_traffic,
    has_external_links: entry.has_external_links,
    source: entry.source,
    canonical_expectation: canonicalExpectation,
    build_validation: buildValidation,
  };
}

function buildExpectedOutcomes(manifest, options) {
  const entries = manifest
    .map(buildExpectedOutcomeEntry)
    .sort((left, right) => left.legacy_url.localeCompare(right.legacy_url));

  const summary = {
    total_entries: entries.length,
    dispositions: {
      keep: entries.filter((entry) => entry.disposition === 'keep').length,
      merge: entries.filter((entry) => entry.disposition === 'merge').length,
      retire: entries.filter((entry) => entry.disposition === 'retire').length,
    },
    validation_scopes: {
      blocking: entries.filter((entry) => entry.build_validation.scope === 'blocking').length,
      accepted_risk: entries.filter((entry) => entry.build_validation.scope === 'accepted-risk').length,
    },
    query_string_exceptions: entries.filter((entry) => entry.build_validation.mode === 'request-aware-exception').length,
  };

  return {
    schema_version: 1,
    generated_at: options.generatedAt,
    rc: {
      tag: options.rcTag,
      commit: getRefCommit(options.rcTag),
      manifest_tag: options.manifestTag,
      manifest_commit: getRefCommit(options.manifestTag),
    },
    summary,
    entries,
  };
}

function buildSampleMatrix(entries, manifest, publicLookup, options) {
  const builtEntries = entries.filter((entry) => entry.isBuilt);
  const posts = builtEntries.filter((entry) => entry.section === 'posts').sort(compareRecentPosts);
  const pages = builtEntries.filter((entry) => entry.section === 'pages').sort(compareContentEntriesByRoute);
  const categories = builtEntries.filter((entry) => entry.section === 'categories').sort(compareContentEntriesByRoute);
  const legalPages = pages.filter((entry) => legalRoutePattern.test(entry.route));
  const videoPages = pages.filter((entry) => entry.hasVideo);
  const videoPosts = posts.filter((entry) => entry.hasVideo);
  const archiveEntries = ['/archive/', '/posts/']
    .filter((route) => publicLookup.hasRoute(route))
    .map((route, index) => buildAuxiliarySample({
      route,
      builtPath: publicLookup.builtPathForRoute(route),
      validationMode: 'page',
      selectionReason: index === 0
        ? 'Fixed archive discovery route retained for Phase 8 coverage.'
        : 'Section list route emitted by Hugo outputs and retained to cover list rendering behavior.',
    }));
  const homepage = buildAuxiliarySample({
    route: '/',
    builtPath: publicLookup.builtPathForRoute('/'),
    validationMode: 'page',
    selectionReason: 'Fixed homepage route required by the RHI-084 sample matrix contract.',
  });
  const taxonomyRoot = publicLookup.hasRoute('/category/')
    ? buildAuxiliarySample({
      route: '/category/',
      builtPath: publicLookup.builtPathForRoute('/category/'),
      validationMode: 'page',
      selectionReason: 'Taxonomy root is emitted by Hugo and kept as a separate family from category terms.',
    })
    : null;

  const redirectRepresentative = manifest
    .filter((entry) => entry.disposition === 'merge' && entry.implementation_layer === 'pages-static' && !entry.legacy_url.includes('?'))
    .sort((left, right) => left.legacy_url.localeCompare(right.legacy_url))
    .map((entry) => {
      const builtPath = publicLookup.builtPathForRoute(entry.legacy_url);
      if (!builtPath) {
        return null;
      }

      return buildAuxiliarySample({
        route: normalizeUrlLike(entry.legacy_url).pathname,
        builtPath,
        validationMode: 'redirect-only',
        selectionReason: 'First deterministic alias-backed merge route from the frozen manifest.',
        notes: `Expected final target ${normalizeUrlLike(entry.target_url).pathname}.`,
      });
    })
    .find(Boolean) ?? null;

  const systemOutputs = ['/robots.txt', '/sitemap.xml', '/index.xml', '/index.json']
    .filter((route) => publicLookup.hasRoute(route))
    .map((route) => buildAuxiliarySample({
      route,
      builtPath: publicLookup.builtPathForRoute(route),
      validationMode: 'system-only',
      selectionReason: 'System output retained for downstream Phase 8 route and discovery validation.',
    }));

  const errorPages = publicLookup.hasFile('404.html')
    ? [buildAuxiliarySample({
      route: '/404.html',
      builtPath: '404.html',
      validationMode: 'system-only',
      selectionReason: 'Dedicated 404 output retained for not-found validation coverage.',
    })]
    : [];

  const nonSpecialPages = pages.filter((entry) => !legalRoutePattern.test(entry.route) && entry.route !== '/archive/' && entry.route !== '/video/' && entry.route !== '/home/');
  const pageSingleRepresentative = nonSpecialPages[0] ?? null;

  const videoManifestRetained = manifest.some((entry) => entry.url_class === 'video' && ['keep', 'merge'].includes(entry.disposition));
  const landingManifestRetained = manifest.some((entry) => entry.url_class === 'landing' && ['keep', 'merge'].includes(entry.disposition));

  const templateFamilyCoverage = [
    { family_id: 'home', validation_mode: 'page', representative_urls: ['/'], status: 'covered', selection_rule: 'fixed-route' },
    { family_id: 'post-single', validation_mode: 'page', representative_urls: posts.slice(0, 1).map((entry) => entry.route), status: posts.length > 0 ? 'covered' : 'missing', selection_rule: 'recent-posts-descending' },
    { family_id: 'page-single', validation_mode: 'page', representative_urls: pageSingleRepresentative ? [pageSingleRepresentative.route] : [], status: pageSingleRepresentative ? 'covered' : 'missing', selection_rule: 'first-built-non-special-page' },
    { family_id: 'archive-list', validation_mode: 'page', representative_urls: archiveEntries.map((entry) => entry.url), status: archiveEntries.length > 0 ? 'covered' : 'missing', selection_rule: 'fixed-route-then-section-list' },
    { family_id: 'taxonomy-root', validation_mode: 'page', representative_urls: taxonomyRoot ? [taxonomyRoot.url] : [], status: taxonomyRoot ? 'covered' : 'missing', selection_rule: 'fixed-taxonomy-root' },
    { family_id: 'taxonomy-term', validation_mode: 'page', representative_urls: categories.slice(0, 1).map((entry) => entry.route), status: categories.length > 0 ? 'covered' : 'missing', selection_rule: 'alphabetical-category-slugs' },
    { family_id: 'legal-page', validation_mode: 'page', representative_urls: legalPages.slice(0, 1).map((entry) => entry.route), status: legalPages.length > 0 ? 'covered' : 'missing', selection_rule: 'keyword-filtered-legal-pages' },
    { family_id: 'video-capable-page', validation_mode: 'page', representative_urls: videoPages.slice(0, 1).map((entry) => entry.route), status: videoPages.length > 0 ? 'covered' : videoManifestRetained ? 'missing' : 'not-retained', selection_rule: 'first-built-video-page' },
    { family_id: 'video-capable-post', validation_mode: 'page', representative_urls: videoPosts.slice(0, 1).map((entry) => entry.route), status: videoPosts.length > 0 ? 'covered' : 'not-present', selection_rule: 'first-built-video-post' },
    { family_id: 'redirect-helper', validation_mode: 'redirect-only', representative_urls: redirectRepresentative ? [redirectRepresentative.url] : [], status: redirectRepresentative ? 'covered' : 'missing', selection_rule: 'first-alias-backed-merge-route' },
    { family_id: 'error-404', validation_mode: 'system-only', representative_urls: errorPages.map((entry) => entry.url), status: errorPages.length > 0 ? 'covered' : 'missing', selection_rule: 'fixed-404-output' },
    { family_id: 'system-outputs', validation_mode: 'system-only', representative_urls: systemOutputs.map((entry) => entry.url), status: systemOutputs.length > 0 ? 'covered' : 'missing', selection_rule: 'fixed-system-output-routes' },
    { family_id: 'landing-page', validation_mode: 'page', representative_urls: [], status: landingManifestRetained ? 'missing' : 'not-retained', selection_rule: 'frozen-manifest-landing-keep-or-merge-check' },
  ];

  return {
    schema_version: 1,
    generated_at: options.generatedAt,
    rc: {
      tag: options.rcTag,
      commit: getRefCommit(options.rcTag),
      manifest_tag: options.manifestTag,
      manifest_commit: getRefCommit(options.manifestTag),
    },
    selection_policy: {
      recent_posts: 'Select the 10 most-recent built post URLs by front matter date descending. Tie-breaker: route ascending.',
      archive_pages: 'Keep /archive/ first, then add /posts/ if the built section list exists.',
      category_pages: 'Select the first 5 alphabetical built category term routes.',
      privacy_legal_pages: 'Select built page routes whose URL matches privacy, cookie, legal, terms, or disclaimer keywords.',
      video_pages: 'Select built page routes with front matter video.id. Select built video-capable posts separately when present.',
      landing_pages: 'Treat landing as not retained unless the frozen manifest contains at least one keep or merge row for url_class landing.',
      template_family_coverage: 'Treat auxiliary redirect/system routes as separate validation modes so downstream tickets do not confuse them with content-page samples.',
    },
    page_samples: {
      homepage: [homepage],
      recent_posts: posts.slice(0, 10).map((entry, index) => buildSample(entry, `Recent post rank ${index + 1} by front matter date descending.`)),
      archive_pages: archiveEntries,
      category_pages: categories.slice(0, 5).map((entry, index) => buildSample(entry, `Alphabetical category sample rank ${index + 1}.`)),
      privacy_legal_pages: legalPages.map((entry) => buildSample(entry, 'Legal/privacy route matched the deterministic keyword allowlist.')),
      video_pages: videoPages.map((entry) => buildSample(entry, 'Video-capable page with front matter video.id present.')),
      video_posts: videoPosts.map((entry) => buildSample(entry, 'Video-capable post with front matter video.id present.')),
      landing_pages: [],
    },
    auxiliary_samples: {
      taxonomy_roots: taxonomyRoot ? [taxonomyRoot] : [],
      redirect_helpers: redirectRepresentative ? [redirectRepresentative] : [],
      error_pages: errorPages,
      system_outputs: systemOutputs,
    },
    template_family_coverage: templateFamilyCoverage,
  };
}

function buildPriorityMetric(source, row) {
  if (source === 'organic') {
    return {
      clicks: parseNumber(row.Clicks),
      impressions: parseNumber(row.Impressions),
      ctr_percent: parsePercent(row.CTR),
      average_position: parseNumber(row['Avg position']),
    };
  }

  return {
    incoming_links: parseNumber(row['Incoming links']),
    linking_sites: parseNumber(row['Linking sites']),
  };
}

function createPriorityRouteEntry(manifestEntry, sourceRecord = null, supplementalFor = null) {
  const legacyInfo = normalizeUrlLike(manifestEntry.legacy_url);
  const targetInfo = manifestEntry.target_url ? normalizeUrlLike(manifestEntry.target_url) : null;

  return {
    route: legacyInfo.pathname + legacyInfo.search,
    final_target_url: targetInfo?.pathname ?? null,
    disposition: manifestEntry.disposition,
    expected_outcome: manifestEntry.disposition === 'keep' ? 'keep' : manifestEntry.disposition === 'retire' ? 'retire' : 'redirect',
    url_class: manifestEntry.url_class,
    priority: manifestEntry.priority,
    source: sourceRecord
      ? [{
        source_set: sourceRecord.source,
        source_rank: sourceRecord.rank,
        metric: buildPriorityMetric(sourceRecord.source, sourceRecord.row),
        source_url: sourceRecord.absoluteUrl,
      }]
      : [],
    coverage_supplement_for_url_class: supplementalFor,
    selection_reason: sourceRecord
      ? `${sourceRecord.source} rank ${sourceRecord.rank} from migration/phase-1-seo-baseline.md.`
      : `Coverage supplement added to guarantee url_class ${supplementalFor}.`,
  };
}

function mergePrioritySources(existingEntry, sourceRecord) {
  existingEntry.source.push({
    source_set: sourceRecord.source,
    source_rank: sourceRecord.rank,
    metric: buildPriorityMetric(sourceRecord.source, sourceRecord.row),
    source_url: sourceRecord.absoluteUrl,
  });

  existingEntry.selection_reason = `${existingEntry.selection_reason} Also present in ${sourceRecord.source} rank ${sourceRecord.rank}.`;
}

function chooseCoverageSupplement(manifest, urlClass, existingRoutes) {
  const usedRoutes = new Set(existingRoutes);

  return manifest
    .filter((entry) => entry.url_class === urlClass)
    .sort((left, right) => {
      const leftQueryPenalty = left.legacy_url.includes('?') ? 1 : 0;
      const rightQueryPenalty = right.legacy_url.includes('?') ? 1 : 0;
      if (leftQueryPenalty !== rightQueryPenalty) {
        return leftQueryPenalty - rightQueryPenalty;
      }

      const dispositionOrder = ['keep', 'merge', 'retire'];
      const dispositionDelta = dispositionOrder.indexOf(left.disposition) - dispositionOrder.indexOf(right.disposition);
      if (dispositionDelta !== 0) {
        return dispositionDelta;
      }

      const organicDelta = Number(right.has_organic_traffic) - Number(left.has_organic_traffic);
      if (organicDelta !== 0) {
        return organicDelta;
      }

      const externalDelta = Number(right.has_external_links) - Number(left.has_external_links);
      if (externalDelta !== 0) {
        return externalDelta;
      }

      const priorityDelta = priorityRank(left.priority) - priorityRank(right.priority);
      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return left.legacy_url.localeCompare(right.legacy_url);
    })
    .find((entry) => !usedRoutes.has(normalizeUrlLike(entry.legacy_url).pathname + normalizeUrlLike(entry.legacy_url).search));
}

function buildPriorityRoutes(manifest, markdown, options) {
  const organicRows = extractTable(markdown, '### Top pages by clicks (90-day export)').slice(0, 20);
  const backlinkRows = extractTable(markdown, '## Link equity baseline').slice(0, 20);
  const manifestByLegacyRoute = new Map(
    manifest.map((entry) => {
      const routeInfo = normalizeUrlLike(entry.legacy_url);
      return [`${routeInfo.pathname}${routeInfo.search}`, entry];
    })
  );

  const routes = new Map();
  const rankedSets = {
    organic: [],
    backlink: [],
    coverage_supplements: [],
  };

  for (const [source, rows] of [['organic', organicRows], ['backlink', backlinkRows]]) {
    rows.forEach((row, index) => {
      const absoluteUrl = String(row.URL ?? '').trim();
      const routeInfo = normalizeUrlLike(absoluteUrl);
      const routeKey = `${routeInfo.pathname}${routeInfo.search}`;
      const manifestEntry = manifestByLegacyRoute.get(routeKey);
      if (!manifestEntry) {
        throw new Error(`No manifest entry found for ${absoluteUrl} from ${source} baseline.`);
      }

      const sourceRecord = {
        source,
        rank: index + 1,
        absoluteUrl,
        row,
      };

      if (routes.has(routeKey)) {
        mergePrioritySources(routes.get(routeKey), sourceRecord);
      } else {
        routes.set(routeKey, createPriorityRouteEntry(manifestEntry, sourceRecord));
      }

      rankedSets[source].push(routeKey);
    });
  }

  const existingRoutes = [...routes.keys()];
  const missingClasses = requiredUrlClasses.filter((urlClass) => ![...routes.values()].some((entry) => entry.url_class === urlClass));
  for (const urlClass of missingClasses) {
    const supplement = chooseCoverageSupplement(manifest, urlClass, existingRoutes);
    if (!supplement) {
      continue;
    }

    const routeInfo = normalizeUrlLike(supplement.legacy_url);
    const routeKey = `${routeInfo.pathname}${routeInfo.search}`;
    routes.set(routeKey, createPriorityRouteEntry(supplement, null, urlClass));
    rankedSets.coverage_supplements.push(routeKey);
    existingRoutes.push(routeKey);
  }

  const routeEntries = [...routes.values()].sort((left, right) => {
    const leftBestRank = Math.min(...left.source.map((sourceEntry) => sourceEntry.source_rank), Number.POSITIVE_INFINITY);
    const rightBestRank = Math.min(...right.source.map((sourceEntry) => sourceEntry.source_rank), Number.POSITIVE_INFINITY);
    if (leftBestRank !== rightBestRank) {
      return leftBestRank - rightBestRank;
    }

    return left.route.localeCompare(right.route);
  });

  return {
    schema_version: 1,
    generated_at: options.generatedAt,
    rc: {
      tag: options.rcTag,
      commit: getRefCommit(options.rcTag),
      manifest_tag: options.manifestTag,
      manifest_commit: getRefCommit(options.manifestTag),
      seo_baseline_path: toRepoRelative(options.seoBaselinePath),
    },
    selection_method: {
      organic: 'Take the first 20 rows from the 90-day top-pages-by-clicks table in migration/phase-1-seo-baseline.md. Preserve source rank order exactly as captured.',
      backlink: 'Take the first 20 rows from the link-equity baseline table in migration/phase-1-seo-baseline.md. Preserve source rank order exactly as captured.',
      deduplication: 'Merge duplicate routes across source sets into one route entry and retain per-source rank metadata.',
      class_coverage_supplements: 'For any missing required URL class, add one deterministic supplement preferring non-query keep routes, then merge, then retire, then organic/external signal, then priority, then route sort order.',
      tie_breaker: 'Where selection order is otherwise equal, use route ascending.',
    },
    coverage: {
      required_url_classes: requiredUrlClasses,
      represented_url_classes: [...new Set(routeEntries.map((entry) => entry.url_class))].sort(),
      supplemented_url_classes: routeEntries
        .filter((entry) => entry.coverage_supplement_for_url_class != null)
        .map((entry) => entry.coverage_supplement_for_url_class)
        .sort(),
    },
    ranked_sets: rankedSets,
    routes: routeEntries,
  };
}

async function writeJson(filePath, data) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const manifest = await loadManifest(options.manifestPath);
  const seoBaselineMarkdown = await readFile(options.seoBaselinePath, 'utf8');
  const publicFiles = (await fg('**/*', {
    cwd: options.publicRoot,
    onlyFiles: true,
    dot: true,
    suppressErrors: true,
  })).map(toPosixPath);
  const publicLookup = createPublicLookup(publicFiles);
  const contentEntries = await collectContentEntries(options.contentRoot, publicLookup);

  const expectedOutcomes = buildExpectedOutcomes(manifest, options);
  const sampleMatrix = buildSampleMatrix(contentEntries, manifest, publicLookup, options);
  const priorityRoutes = buildPriorityRoutes(manifest, seoBaselineMarkdown, options);

  await writeJson(options.expectedOutcomesPath, expectedOutcomes);
  await writeJson(options.sampleMatrixPath, sampleMatrix);
  await writeJson(options.priorityRoutesPath, priorityRoutes);

  console.log(`Generated ${toRepoRelative(options.expectedOutcomesPath)}`);
  console.log(`Generated ${toRepoRelative(options.sampleMatrixPath)}`);
  console.log(`Generated ${toRepoRelative(options.priorityRoutesPath)}`);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});