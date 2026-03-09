import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import fg from 'fast-glob';
import matter from 'gray-matter';
import { z } from 'zod';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = process.env.URL_PARITY_MANIFEST
  ? path.resolve(process.env.URL_PARITY_MANIFEST)
  : path.join(repoRoot, 'migration/url-manifest.json');
const publicRoot = process.env.URL_PARITY_PUBLIC_DIR
  ? path.resolve(process.env.URL_PARITY_PUBLIC_DIR)
  : path.join(repoRoot, 'public');
const contentRoot = process.env.URL_PARITY_CONTENT_DIR
  ? path.resolve(process.env.URL_PARITY_CONTENT_DIR)
  : path.join(repoRoot, 'src/content');
const reportPath = process.env.URL_PARITY_REPORT
  ? path.resolve(process.env.URL_PARITY_REPORT)
  : path.join(repoRoot, 'migration/url-parity-report.json');
const canonicalOrigin = 'https://www.rhino-inquisitor.com';
const contentRoutePattern = /^\/[a-z0-9/-]+\/$/;
const priorityOrder = ['critical', 'high', 'medium', 'low'];
const hardFailureStatuses = new Set(['missing', 'wrong-target', 'chain', 'collision']);

const manifestEntrySchema = z.object({
  legacy_url: z.string().trim().min(1),
  disposition: z.enum(['keep', 'merge', 'retire']),
  target_url: z.string().nullable(),
  redirect_code: z.union([z.number().int(), z.null()]),
  reason: z.string().trim().min(1),
  owner: z.string().trim().min(1),
  priority: z.enum(priorityOrder),
  implementation_layer: z.enum(['pages-static', 'edge-cdn', 'dns', 'none']),
  url_class: z.string().trim().min(1),
  source: z.string().trim().min(1),
  has_organic_traffic: z.boolean(),
  has_external_links: z.boolean()
});

const manifestSchema = z.array(manifestEntrySchema);

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function formatComparableRoute(pathname, search = '') {
  if (pathname === '/') {
    return search ? `/${search}` : '/';
  }

  const normalizedPathname = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return `${normalizedPathname}${search}`;
}

function normalizeUrlLike(value, { allowNull = false } = {}) {
  if (value == null) {
    if (allowNull) {
      return null;
    }

    throw new Error('Expected a URL or site-relative path value.');
  }

  const trimmedValue = String(value).trim();
  if (trimmedValue.length === 0) {
    if (allowNull) {
      return null;
    }

    throw new Error('Expected a URL or site-relative path value.');
  }

  const normalizedInput = trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://')
    ? trimmedValue
    : `${canonicalOrigin}${trimmedValue.startsWith('/') ? trimmedValue : `/${trimmedValue}`}`;
  const parsedUrl = new URL(normalizedInput);
  const pathname = parsedUrl.pathname || '/';
  const search = parsedUrl.search || '';

  return {
    absolute: `${parsedUrl.origin}${pathname}${search}`,
    pathname,
    search,
    comparable: formatComparableRoute(pathname, search),
    comparablePathOnly: formatComparableRoute(pathname),
    hasQuery: search.length > 0,
    isHomepage: pathname === '/',
    is404: pathname === '/404/' || pathname === '/404.html',
    firstSegment: pathname.split('/').filter(Boolean)[0] ?? null,
    serverRelative: `${pathname}${search}`
  };
}

function routeToPublicRelative(routeInfo) {
  if (routeInfo.pathname === '/') {
    return 'index.html';
  }

  const trimmedPathname = routeInfo.pathname.replace(/^\//, '');

  if (trimmedPathname.endsWith('/')) {
    return `${trimmedPathname}index.html`;
  }

  return trimmedPathname;
}

function publicRelativeToRoute(relativeFilePath) {
  const normalizedPath = toPosixPath(relativeFilePath);

  if (normalizedPath === 'index.html') {
    return '/';
  }

  if (normalizedPath.endsWith('/index.html')) {
    return `/${normalizedPath.slice(0, -'index.html'.length)}`;
  }

  return `/${normalizedPath}`;
}

function getContentType(relativePath) {
  const normalizedPath = toPosixPath(relativePath);

  if (normalizedPath.startsWith('posts/')) {
    return 'post';
  }

  if (normalizedPath.startsWith('pages/')) {
    return 'page';
  }

  if (normalizedPath.startsWith('categories/')) {
    return 'category';
  }

  return 'default';
}

function isScaffoldFixtureContent(frontMatterData) {
  return frontMatterData?.scaffoldFixture === true;
}

function priorityRank(priority) {
  const index = priorityOrder.indexOf(priority);
  return index === -1 ? priorityOrder.length : index;
}

function sortByPriorityAndUrl(left, right) {
  const priorityDelta = priorityRank(left.priority) - priorityRank(right.priority);
  if (priorityDelta !== 0) {
    return priorityDelta;
  }

  return left.legacy_url.localeCompare(right.legacy_url);
}

function createResult(entry, status, details = {}) {
  return {
    legacy_url: entry.legacy_url,
    disposition: entry.disposition,
    target_url: entry.target_url,
    priority: entry.priority,
    implementation_layer: entry.implementation_layer,
    status,
    message: details.message ?? null,
    public_file: details.publicFile ?? null,
    output_kind: details.outputKind ?? null,
    redirect_target: details.redirectTarget ?? null,
    canonical_target: details.canonicalTarget ?? null
  };
}

function addSummaryCount(summaryCounts, status) {
  summaryCounts[status] = (summaryCounts[status] ?? 0) + 1;
}

function parseAttributes(tagSource) {
  const attributes = new Map();
  const attributePattern = /([a-zA-Z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;

  for (const match of tagSource.matchAll(attributePattern)) {
    const attributeName = match[1].toLowerCase();
    const attributeValue = match[2] ?? match[3] ?? match[4] ?? '';
    attributes.set(attributeName, attributeValue.trim());
  }

  return attributes;
}

function extractRedirectDetails(htmlSource) {
  let metaRefreshTarget = null;
  let canonicalTarget = null;

  for (const metaTagMatch of htmlSource.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = parseAttributes(metaTagMatch[0]);
    if ((attributes.get('http-equiv') ?? '').toLowerCase() !== 'refresh') {
      continue;
    }

    const contentValue = attributes.get('content') ?? '';
    const contentMatch = /url\s*=\s*(.+)$/i.exec(contentValue);
    if (!contentMatch) {
      continue;
    }

    metaRefreshTarget = contentMatch[1].trim().replace(/^['"]|['"]$/g, '');
    break;
  }

  for (const linkTagMatch of htmlSource.matchAll(/<link\b[^>]*>/gi)) {
    const attributes = parseAttributes(linkTagMatch[0]);
    if ((attributes.get('rel') ?? '').toLowerCase() !== 'canonical') {
      continue;
    }

    canonicalTarget = attributes.get('href') ?? null;
    if (canonicalTarget) {
      break;
    }
  }

  return {
    metaRefreshTarget,
    canonicalTarget,
    isRedirectPage: metaRefreshTarget != null
  };
}

function collectSoft404Warnings(entry, targetInfo) {
  const warnings = [];

  if (entry.disposition !== 'merge' && entry.disposition !== 'retire') {
    return warnings;
  }

  if (!targetInfo) {
    return warnings;
  }

  if (targetInfo.isHomepage) {
    warnings.push({
      kind: 'soft-404-homepage',
      legacy_url: entry.legacy_url,
      target_url: entry.target_url,
      message: 'Target resolves to the homepage, which is a soft-404 risk for merged or retired URLs.'
    });
  }

  if (targetInfo.is404) {
    warnings.push({
      kind: 'soft-404-404-page',
      legacy_url: entry.legacy_url,
      target_url: entry.target_url,
      message: 'Target resolves to the 404 route, which is a soft-404 risk for merged or retired URLs.'
    });
  }

  const legacyInfo = normalizeUrlLike(entry.legacy_url);
  if (
    !legacyInfo.hasQuery &&
    !targetInfo.hasQuery &&
    legacyInfo.firstSegment &&
    targetInfo.firstSegment &&
    legacyInfo.firstSegment !== targetInfo.firstSegment
  ) {
    warnings.push({
      kind: 'soft-404-section-mismatch',
      legacy_url: entry.legacy_url,
      target_url: entry.target_url,
      message: 'Target resolves to a different top-level section than the legacy URL. Review for soft-404 risk.'
    });
  }

  return warnings;
}

async function loadManifest() {
  const manifestSource = await fs.readFile(manifestPath, 'utf8');
  const parsedManifest = JSON.parse(manifestSource);
  return manifestSchema.parse(parsedManifest);
}

async function collectContentRoutes() {
  const markdownFiles = (await fg('**/*.md', {
    cwd: contentRoot,
    onlyFiles: true,
    suppressErrors: true
  })).sort();
  const primaryRouteMap = new Map();
  const outputRouteMap = new Map();
  let migrationOwnedMarkdownCount = 0;

  for (const relativePath of markdownFiles) {
    const absolutePath = path.join(contentRoot, relativePath);
    const normalizedPath = toPosixPath(relativePath);
    const contentType = getContentType(normalizedPath);

    const parsedFile = matter.read(absolutePath);
    const isScaffoldFixture = isScaffoldFixtureContent(parsedFile.data);

    if (!isScaffoldFixture) {
      migrationOwnedMarkdownCount += 1;
    }

    if (contentType === 'category') {
      continue;
    }

    const routeValues = [];

    if (typeof parsedFile.data.url === 'string' && parsedFile.data.url.trim() !== '') {
      routeValues.push(parsedFile.data.url.trim());
      const currentFiles = primaryRouteMap.get(parsedFile.data.url.trim()) ?? [];
      currentFiles.push(normalizedPath);
      primaryRouteMap.set(parsedFile.data.url.trim(), currentFiles);
    }

    if (Array.isArray(parsedFile.data.aliases)) {
      for (const aliasValue of parsedFile.data.aliases) {
        if (typeof aliasValue === 'string' && aliasValue.trim() !== '') {
          routeValues.push(aliasValue.trim());
        }
      }
    }

    for (const routeValue of routeValues) {
      if (!contentRoutePattern.test(routeValue)) {
        continue;
      }

      const currentRoutes = outputRouteMap.get(routeValue) ?? [];
      currentRoutes.push(normalizedPath);
      outputRouteMap.set(routeValue, currentRoutes);
    }
  }

  const collisions = [];

  for (const [routeValue, filePaths] of primaryRouteMap.entries()) {
    if (filePaths.length < 2) {
      continue;
    }

    collisions.push({
      route: routeValue,
      kind: 'primary-url',
      file_paths: filePaths.sort()
    });
  }

  for (const [routeValue, filePaths] of outputRouteMap.entries()) {
    if (filePaths.length < 2) {
      continue;
    }

    collisions.push({
      route: routeValue,
      kind: 'published-output',
      file_paths: filePaths.sort()
    });
  }

  return {
    markdown_file_count: markdownFiles.length,
    migration_owned_markdown_count: migrationOwnedMarkdownCount,
    collisions
  };
}

async function collectPublicState() {
  const publicFiles = (await fg('**/*', {
    cwd: publicRoot,
    onlyFiles: true,
    dot: true,
    followSymbolicLinks: false,
    suppressErrors: true
  })).sort();
  const htmlRouteMap = new Map();
  const fileRouteMap = new Map();

  for (const relativePath of publicFiles) {
    const normalizedPath = toPosixPath(relativePath);
    const routeValue = publicRelativeToRoute(normalizedPath);
    const descriptor = {
      route: routeValue,
      relative_path: normalizedPath,
      output_kind: normalizedPath.endsWith('.html') ? 'html' : 'file'
    };

    fileRouteMap.set(routeValue, descriptor);
    if (descriptor.output_kind === 'html') {
      htmlRouteMap.set(routeValue, descriptor);
    }
  }

  return {
    public_file_count: publicFiles.length,
    htmlRouteMap,
    fileRouteMap
  };
}

async function readHtmlDescriptor(htmlDescriptor, cache) {
  if (!htmlDescriptor) {
    return null;
  }

  const cacheKey = htmlDescriptor.relative_path;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const absolutePath = path.join(publicRoot, htmlDescriptor.relative_path);
  const htmlSource = await fs.readFile(absolutePath, 'utf8');
  const parsedHtml = extractRedirectDetails(htmlSource);
  const result = {
    ...htmlDescriptor,
    ...parsedHtml
  };

  cache.set(cacheKey, result);
  return result;
}

async function main() {
  const manifestEntries = await loadManifest();
  const contentState = await collectContentRoutes();
  const publicState = await collectPublicState();
  const htmlCache = new Map();
  const summaryCounts = { ok: 0, missing: 0, 'wrong-target': 0, chain: 0, collision: 0 };
  const warnings = [];
  const results = [];

  const indexedUrls = manifestEntries.filter(
    (entry) => entry.disposition === 'keep' || entry.has_organic_traffic
  ).length;
  const changedIndexedUrls = manifestEntries.filter(
    (entry) => entry.disposition !== 'keep' && entry.has_organic_traffic
  ).length;
  const changeRate = indexedUrls === 0 ? 0 : Number(((changedIndexedUrls / indexedUrls) * 100).toFixed(2));

  const manifestRouteMap = new Map(
    manifestEntries.map((entry) => [normalizeUrlLike(entry.legacy_url).comparable, entry])
  );
  const scaffoldMode = contentState.migration_owned_markdown_count === 0;

  if (!publicState.fileRouteMap.has('/')) {
    const syntheticEntry = {
      legacy_url: '/',
      disposition: 'keep',
      target_url: '/',
      priority: 'critical',
      implementation_layer: 'none'
    };
    const result = createResult(syntheticEntry, 'missing', {
      message: 'public/index.html is missing. GitHub Pages requires a top-level index.html in the build artifact.'
    });
    results.push(result);
    addSummaryCount(summaryCounts, result.status);
  }

  for (const collision of contentState.collisions) {
    const priority = collision.kind === 'primary-url' ? 'critical' : 'high';
    const entry = {
      legacy_url: collision.route,
      disposition: 'keep',
      target_url: collision.route,
      priority,
      implementation_layer: 'pages-static'
    };
    const result = createResult(entry, 'collision', {
      message: `Multiple content files publish the same route (${collision.kind}): ${collision.file_paths.join(', ')}`
    });
    results.push(result);
    addSummaryCount(summaryCounts, result.status);
  }

  for (const entry of manifestEntries.sort(sortByPriorityAndUrl)) {
    const targetInfo = entry.target_url ? normalizeUrlLike(entry.target_url, { allowNull: true }) : null;
    warnings.push(...collectSoft404Warnings(entry, targetInfo));

    if (entry.disposition === 'merge' && targetInfo) {
      const chainedEntry = manifestRouteMap.get(targetInfo.comparable);
      if (chainedEntry && chainedEntry.legacy_url !== entry.legacy_url && chainedEntry.disposition !== 'keep') {
        const result = createResult(entry, 'chain', {
          message: `Target URL resolves to another non-keep manifest entry: ${chainedEntry.legacy_url}`
        });
        results.push(result);
        addSummaryCount(summaryCounts, result.status);
        continue;
      }
    }

    if (scaffoldMode) {
      continue;
    }

    const legacyInfo = normalizeUrlLike(entry.legacy_url);
    const expectedPublicFile = routeToPublicRelative(legacyInfo);
    const htmlDescriptor = publicState.htmlRouteMap.get(legacyInfo.comparablePathOnly);
    const fileDescriptor = publicState.fileRouteMap.get(legacyInfo.comparablePathOnly);

    if (entry.disposition === 'keep') {
      if (legacyInfo.hasQuery) {
        const result = createResult(entry, 'missing', {
          message: 'Keep URLs with query strings cannot be represented as distinct static output paths in public/.',
          publicFile: expectedPublicFile
        });
        results.push(result);
        addSummaryCount(summaryCounts, result.status);
        continue;
      }

      if (!htmlDescriptor) {
        const result = createResult(entry, 'missing', {
          message: `Expected live route at ${expectedPublicFile}, but no HTML page was generated.`,
          publicFile: expectedPublicFile
        });
        results.push(result);
        addSummaryCount(summaryCounts, result.status);
        continue;
      }

      const parsedHtml = await readHtmlDescriptor(htmlDescriptor, htmlCache);
      if (parsedHtml?.isRedirectPage) {
        const result = createResult(entry, 'wrong-target', {
          message: 'Keep URL resolves to a redirect page instead of a live HTML page.',
          publicFile: htmlDescriptor.relative_path,
          outputKind: parsedHtml.output_kind,
          redirectTarget: parsedHtml.metaRefreshTarget,
          canonicalTarget: parsedHtml.canonicalTarget
        });
        results.push(result);
        addSummaryCount(summaryCounts, result.status);
        continue;
      }

      const result = createResult(entry, 'ok', {
        message: 'Live HTML route exists at the expected output path.',
        publicFile: htmlDescriptor.relative_path,
        outputKind: 'html'
      });
      results.push(result);
      addSummaryCount(summaryCounts, result.status);
      continue;
    }

    if (entry.disposition === 'merge') {
      if (!htmlDescriptor) {
        const result = createResult(entry, 'missing', {
          message: `Expected redirect page at ${expectedPublicFile}, but no HTML page was generated.`,
          publicFile: expectedPublicFile
        });
        results.push(result);
        addSummaryCount(summaryCounts, result.status);
        continue;
      }

      const parsedHtml = await readHtmlDescriptor(htmlDescriptor, htmlCache);
      if (!parsedHtml?.isRedirectPage || !parsedHtml.metaRefreshTarget) {
        const result = createResult(entry, 'wrong-target', {
          message: 'HTML output exists, but no meta refresh redirect target was found.',
          publicFile: htmlDescriptor.relative_path,
          outputKind: parsedHtml?.output_kind ?? 'html',
          canonicalTarget: parsedHtml?.canonicalTarget ?? null
        });
        results.push(result);
        addSummaryCount(summaryCounts, result.status);
        continue;
      }

      const redirectInfo = normalizeUrlLike(parsedHtml.metaRefreshTarget);
      if (!targetInfo || redirectInfo.comparable !== targetInfo.comparable) {
        const result = createResult(entry, 'wrong-target', {
          message: `Redirect target mismatch. Expected ${entry.target_url}, found ${parsedHtml.metaRefreshTarget}.`,
          publicFile: htmlDescriptor.relative_path,
          outputKind: parsedHtml.output_kind,
          redirectTarget: parsedHtml.metaRefreshTarget,
          canonicalTarget: parsedHtml.canonicalTarget
        });
        results.push(result);
        addSummaryCount(summaryCounts, result.status);
        continue;
      }

      const targetDescriptor = publicState.htmlRouteMap.get(targetInfo.comparablePathOnly);
      const parsedTargetHtml = await readHtmlDescriptor(targetDescriptor ?? null, htmlCache);
      if (parsedTargetHtml?.isRedirectPage) {
        const result = createResult(entry, 'chain', {
          message: `Redirect target resolves to another redirect page at ${parsedTargetHtml.relative_path}.`,
          publicFile: htmlDescriptor.relative_path,
          outputKind: parsedHtml.output_kind,
          redirectTarget: parsedHtml.metaRefreshTarget,
          canonicalTarget: parsedHtml.canonicalTarget
        });
        results.push(result);
        addSummaryCount(summaryCounts, result.status);
        continue;
      }

      const result = createResult(entry, 'ok', {
        message: 'Redirect page exists and points to the approved target.',
        publicFile: htmlDescriptor.relative_path,
        outputKind: parsedHtml.output_kind,
        redirectTarget: parsedHtml.metaRefreshTarget,
        canonicalTarget: parsedHtml.canonicalTarget
      });
      results.push(result);
      addSummaryCount(summaryCounts, result.status);
      continue;
    }

    if (fileDescriptor) {
      const result = createResult(entry, 'collision', {
        message: 'Retired URL still resolves to generated output and is not truly retired.',
        publicFile: fileDescriptor.relative_path,
        outputKind: fileDescriptor.output_kind
      });
      results.push(result);
      addSummaryCount(summaryCounts, result.status);
      continue;
    }

    const result = createResult(entry, 'ok', {
      message: 'No generated output exists for this retired URL.'
    });
    results.push(result);
    addSummaryCount(summaryCounts, result.status);
  }

  const hardFailures = results.filter((result) => hardFailureStatuses.has(result.status));
  const report = {
    generated_at: new Date().toISOString(),
    scaffold_mode: scaffoldMode,
    manifest_path: path.relative(repoRoot, manifestPath),
    public_path: path.relative(repoRoot, publicRoot),
    content_path: path.relative(repoRoot, contentRoot),
    summary: {
      manifest_entries: manifestEntries.length,
      content_files: contentState.markdown_file_count,
      public_files: publicState.public_file_count,
      checked_urls: results.length,
      ok: summaryCounts.ok,
      missing: summaryCounts.missing,
      wrong_target: summaryCounts['wrong-target'],
      chain: summaryCounts.chain,
      collision: summaryCounts.collision,
      hard_failures: hardFailures.length,
      warnings: warnings.length
    },
    threshold: {
      indexed_urls: indexedUrls,
      changed_indexed_urls: changedIndexedUrls,
      change_rate_percent: changeRate,
      warn_at_or_above_five_percent: changeRate >= 5,
      edge_redirect_required_before_launch: changeRate > 5
    },
    warnings,
    results
  };

  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);

  console.log(`URL parity report written to ${path.relative(repoRoot, reportPath)}`);
  console.log(`Manifest entries: ${manifestEntries.length}`);
  console.log(`Content files: ${contentState.markdown_file_count}`);
  console.log(`Migration-owned content files: ${contentState.migration_owned_markdown_count}`);
  console.log(`Public files: ${publicState.public_file_count}`);
  console.log(`Checked URLs: ${results.length}`);
  console.log(`Hard failures: ${hardFailures.length}`);
  console.log(`Warnings: ${warnings.length}`);
  console.log(`Indexed URL change rate: ${changeRate}% (${changedIndexedUrls}/${indexedUrls || 0})`);

  if (scaffoldMode) {
    console.log('Scaffold mode active: no migration-owned Markdown content files found under src/content, so route-level parity checks were skipped.');
  }

  if (changeRate >= 5) {
    console.log('Warning: URL change rate is at or above 5%; review edge redirect readiness before launch.');
  }

  if (hardFailures.length > 0) {
    console.log('URL parity check failed:');
    for (const failure of hardFailures) {
      console.log(`- ${failure.legacy_url} [${failure.status}] ${failure.message ?? 'No details provided.'}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('URL parity baseline passed.');
}

await main();