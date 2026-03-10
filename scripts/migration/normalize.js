import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { load as loadHtml } from 'cheerio';

import { CanonicalRecordSchema } from './schemas/record.schema.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const canonicalHost = 'https://www.rhino-inquisitor.com';
const knownMediaSourceFallbacks = new Map([
  ['http://img.youtube.com/vi/u0mlLP_M6HU/maxresdefault.jpg', 'https://www.rhino-inquisitor.com/wp-content/uploads/2022/09/yte-hd-image.jpg']
]);
const contentBackedManifestClasses = new Set(['post', 'page', 'attachment', 'video', 'category', 'landing']);
const supportedMediaExtensions = new Set([
  'avif',
  'gif',
  'jpg',
  'jpeg',
  'mov',
  'mp3',
  'mp4',
  'm4a',
  'ogg',
  'ogv',
  'pdf',
  'png',
  'svg',
  'wav',
  'webm',
  'webp',
  'wmv'
]);
const canonicalStatusMap = new Map([
  ['publish', 'publish'],
  ['inherit', 'publish'],
  ['draft', 'draft'],
  ['pending', 'draft'],
  ['future', 'draft'],
  ['auto-draft', 'draft'],
  ['private', 'private'],
  ['trash', 'trash']
]);

async function main() {
  const options = await resolveOptions(process.argv.slice(2));
  const [extractRecords, extractSummary, manifest, inventory] = await Promise.all([
    readJsonFile(options.recordsFile, 'extraction records'),
    readJsonFile(options.extractSummaryFile, 'extraction summary'),
    readJsonFile(options.manifestFile, 'URL manifest'),
    readJsonFile(options.inventoryFile, 'normalized URL inventory')
  ]);

  if (!Array.isArray(extractRecords)) {
    throw new Error('Expected extraction records to be an array.');
  }

  if (!Array.isArray(manifest)) {
    throw new Error('Expected the URL manifest to be an array.');
  }

  const manifestByLegacyUrl = buildManifestLookup(manifest);
  const aliasUrlsByTargetUrl = buildAliasUrlsByTargetUrl(manifest);
  const attachmentUrlBySourceId = buildAttachmentUrlLookup(extractRecords);
  const metrics = createMetrics();
  const normalizedRecords = [];
  const normalizeErrors = [];

  if ((extractSummary?.selection?.recordCount ?? extractRecords.length) !== extractRecords.length) {
    normalizeErrors.push({
      sourceId: null,
      legacyUrl: null,
      targetUrl: null,
      disposition: null,
      field: 'extractSummary.selection.recordCount',
      errorType: 'input-count-mismatch',
      blocking: true,
      message: `Extraction summary count ${extractSummary?.selection?.recordCount ?? 'missing'} does not match ${extractRecords.length} extracted record(s).`
    });
  }

  for (const record of sortExtractedRecords(extractRecords)) {
    const normalizedLegacyUrl = canonicalizeRelativePath(record.legacyUrl);
    const manifestEntry = normalizedLegacyUrl ? manifestByLegacyUrl.get(normalizedLegacyUrl) ?? null : null;
    const isBlockingRecord = manifestEntry ? isSourceBackedManifestEntry(manifestEntry) : false;

    if (!normalizedLegacyUrl) {
      normalizeErrors.push(createNormalizeError({
        record,
        manifestEntry,
        field: 'legacyUrl',
        errorType: 'invalid-legacy-url',
        blocking: isBlockingRecord,
        message: 'Record legacyUrl could not be normalized to a canonical relative path.'
      }));
      continue;
    }

    if (!manifestEntry) {
      recordSkippedWithoutManifest(metrics, { ...record, legacyUrl: normalizedLegacyUrl });
      continue;
    }

    const normalizedRecordResult = buildNormalizedRecord({
      record: { ...record, legacyUrl: normalizedLegacyUrl },
      manifestEntry,
      aliasUrlsByTargetUrl,
      attachmentUrlBySourceId,
      inventory,
      metrics
    });

    if (!normalizedRecordResult.ok) {
      normalizeErrors.push(...normalizedRecordResult.errors.map((error) => ({
        ...error,
        blocking: error.blocking ?? isBlockingRecord
      })));
      continue;
    }

    const validation = CanonicalRecordSchema.safeParse(normalizedRecordResult.record);
    if (!validation.success) {
      normalizeErrors.push(createSchemaError({
        record: normalizedRecordResult.record,
        manifestEntry,
        validationError: validation.error,
        blocking: isBlockingRecord
      }));
      continue;
    }

    normalizedRecords.push(stabilizeNormalizedRecord(validation.data));
  }

  const sortedNormalizedRecords = sortNormalizedRecords(normalizedRecords);
  const sortedErrors = sortNormalizeErrors(normalizeErrors);
  const coverage = buildCoverageReport({
    manifest,
    normalizedRecords: sortedNormalizedRecords,
    normalizeErrors: sortedErrors,
    requiredScope: extractSummary?.coverage?.scope ?? 'source-backed-content-only'
  });
  const summary = createNormalizeSummary({
    extractRecords,
    extractSummary,
    inventory,
    manifest,
    normalizedRecords: sortedNormalizedRecords,
    normalizeErrors: sortedErrors,
    coverage,
    metrics,
    options
  });

  await writeJsonFile(options.outputRecords, sortedNormalizedRecords);
  await writeJsonFile(options.outputSummary, summary);
  await writeJsonFile(options.outputErrors, sortedErrors);

  const blockingErrors = sortedErrors.filter((error) => error.blocking);
  if (blockingErrors.length > 0) {
    console.error(
      `Normalization failed with ${blockingErrors.length} blocking error(s). Review ${toRepoRelative(options.outputErrors)} and ${toRepoRelative(options.outputSummary)}.`
    );
    process.exitCode = 1;
  }
}

async function resolveOptions(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case '--records-file':
        parsed.recordsFile = path.resolve(argv[++index]);
        break;
      case '--extract-summary-file':
        parsed.extractSummaryFile = path.resolve(argv[++index]);
        break;
      case '--manifest-file':
        parsed.manifestFile = path.resolve(argv[++index]);
        break;
      case '--inventory-file':
        parsed.inventoryFile = path.resolve(argv[++index]);
        break;
      case '--output-records':
        parsed.outputRecords = path.resolve(argv[++index]);
        break;
      case '--output-summary':
        parsed.outputSummary = path.resolve(argv[++index]);
        break;
      case '--output-errors':
        parsed.outputErrors = path.resolve(argv[++index]);
        break;
      case '--help':
        printHelp();
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return {
    recordsFile: parsed.recordsFile ?? path.join(repoRoot, 'migration/intermediate/extract-records.json'),
    extractSummaryFile: parsed.extractSummaryFile ?? path.join(repoRoot, 'migration/intermediate/extract-summary.json'),
    manifestFile: parsed.manifestFile ?? path.join(repoRoot, 'migration/url-manifest.json'),
    inventoryFile: parsed.inventoryFile ?? path.join(repoRoot, 'migration/url-inventory.normalized.json'),
    outputRecords: parsed.outputRecords ?? path.join(repoRoot, 'migration/intermediate/records.normalized.json'),
    outputSummary: parsed.outputSummary ?? path.join(repoRoot, 'migration/intermediate/normalize-summary.json'),
    outputErrors: parsed.outputErrors ?? path.join(repoRoot, 'migration/intermediate/normalize-errors.json')
  };
}

function printHelp() {
  console.log(`Usage: node scripts/migration/normalize.js [options]

Options:
  --records-file <path>          Override migration/intermediate/extract-records.json.
  --extract-summary-file <path>  Override migration/intermediate/extract-summary.json.
  --manifest-file <path>         Override migration/url-manifest.json.
  --inventory-file <path>        Override migration/url-inventory.normalized.json.
  --output-records <path>        Override records.normalized.json output path.
  --output-summary <path>        Override normalize-summary.json output path.
  --output-errors <path>         Override normalize-errors.json output path.
  --help                         Show this help message.
`);
}

function buildManifestLookup(manifest) {
  const lookup = new Map();
  for (const entry of manifest) {
    const legacyUrl = canonicalizeRelativePath(entry.legacy_url);
    if (!legacyUrl) {
      continue;
    }
    lookup.set(legacyUrl, {
      ...entry,
      legacy_url: legacyUrl,
      target_url: entry.target_url == null ? null : canonicalizeRelativePath(entry.target_url)
    });
  }
  return lookup;
}

function buildAliasUrlsByTargetUrl(manifest) {
  const aliasBuckets = new Map();

  for (const entry of manifest) {
    if (entry.target_url == null) {
      continue;
    }

    if (!['keep', 'merge'].includes(String(entry.disposition ?? ''))) {
      continue;
    }

    const targetUrl = canonicalizeRelativePath(entry.target_url);
    const legacyUrl = canonicalizeRelativePath(entry.legacy_url);
    if (!targetUrl || !legacyUrl) {
      continue;
    }

    const bucket = aliasBuckets.get(targetUrl) ?? new Set();
    bucket.add(legacyUrl);
    aliasBuckets.set(targetUrl, bucket);
  }

  return new Map(
    [...aliasBuckets.entries()].map(([targetUrl, legacyUrls]) => [
      targetUrl,
      [...legacyUrls]
        .filter((legacyUrl) => legacyUrl !== targetUrl)
        .sort((left, right) => left.localeCompare(right))
    ])
  );
}

function buildAttachmentUrlLookup(records) {
  const lookup = new Map();

  for (const record of Array.isArray(records) ? records : []) {
    if (record?.postType !== 'attachment') {
      continue;
    }

    const attachmentUrl = typeof record?._raw?.attachmentUrl === 'string' ? record._raw.attachmentUrl.trim() : '';
    if (!attachmentUrl) {
      continue;
    }

    lookup.set(String(record.sourceId), attachmentUrl);
  }

  return lookup;
}

function buildNormalizedRecord({ record, manifestEntry, aliasUrlsByTargetUrl, attachmentUrlBySourceId, inventory, metrics }) {
  const errors = [];
  const normalizedStatus = normalizeStatus(record.status);
  if (!normalizedStatus) {
    errors.push(createNormalizeError({
      record,
      manifestEntry,
      field: 'status',
      errorType: 'unsupported-status',
      blocking: null,
      message: `Unsupported WordPress status \"${record.status ?? 'missing'}\".`
    }));
  }

  const targetUrl = manifestEntry.target_url;
  const disposition = String(manifestEntry.disposition ?? '');
  if ((disposition === 'keep' || disposition === 'merge') && !targetUrl) {
    errors.push(createNormalizeError({
      record,
      manifestEntry,
      field: 'targetUrl',
      errorType: 'missing-target-url',
      blocking: null,
      message: 'Keep and merge manifest entries require a non-null target_url.'
    }));
  }

  if (disposition === 'retire' && targetUrl !== null) {
    errors.push(createNormalizeError({
      record,
      manifestEntry,
      field: 'targetUrl',
      errorType: 'invalid-retire-target-url',
      blocking: null,
      message: 'Retire manifest entries must emit targetUrl: null.'
    }));
  }

  if (!['keep', 'merge', 'retire'].includes(disposition)) {
    errors.push(createNormalizeError({
      record,
      manifestEntry,
      field: 'disposition',
      errorType: 'unsupported-disposition',
      blocking: null,
      message: `Unsupported manifest disposition \"${disposition || 'missing'}\".`
    }));
  }

  const publishedAtSource = normalizeDateValue(record.publishedAt);
  const modifiedAtSource = normalizeDateValue(record.modifiedAt);
  const sourceTimestamp = normalizeDateValue(record.sourceTimestamp) ?? new Date(0).toISOString();
  const publishedAt = publishedAtSource ?? modifiedAtSource ?? sourceTimestamp;
  const modifiedAt = modifiedAtSource ?? publishedAtSource ?? sourceTimestamp;

  if (!publishedAtSource) {
    incrementMetric(metrics.dateFallbacks, 'publishedAt');
  }
  if (!modifiedAtSource) {
    incrementMetric(metrics.dateFallbacks, 'modifiedAt');
  }
  if (String(record.status ?? '').trim().toLowerCase() !== normalizedStatus) {
    incrementMetric(metrics.statusTransforms, `${String(record.status ?? 'missing').trim().toLowerCase() || 'missing'}->${normalizedStatus}`);
  }

  const normalizedCategories = normalizeTerms(record.categories, 'categories', inventory, metrics);
  const normalizedTags = normalizeTerms(record.tags, 'tags', inventory, metrics);
  const normalizedSlug = normalizeSlugValue(record.slug);
  const normalizedTitleRaw = decodeHtmlText(stripUnsafeTextArtifacts(record.titleRaw ?? ''));
  const normalizedExcerptRaw = decodeHtmlText(stripUnsafeTextArtifacts(record.excerptRaw ?? ''));
  const normalizedBodyHtml = replaceKnownMediaFallbacks(stripUnsafeTextArtifacts(record.bodyHtml ?? ''));
  const author = decodeHtmlText(stripUnsafeTextArtifacts(record.author ?? '')) || 'system';
  const featuredImageUrl = resolveFeaturedImageUrl(record, attachmentUrlBySourceId);
  const mediaRefs = collectMediaRefs({
    bodyHtml: normalizedBodyHtml,
    legacyUrl: record.legacyUrl,
    attachmentUrl: record?._raw?.attachmentUrl ?? null,
    featuredImageUrl
  });
  const aliasUrls = targetUrl == null ? [] : aliasUrlsByTargetUrl.get(targetUrl) ?? [];

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    record: {
      sourceId: String(record.sourceId),
      sourceType: normalizeSourceChannel(record.sourceType) ?? 'fallback',
      sourceChannels: normalizeSourceChannels(record.sourceChannels),
      postType: normalizePostType(record.postType) ?? 'unknown',
      status: normalizedStatus,
      titleRaw: normalizedTitleRaw,
      excerptRaw: normalizedExcerptRaw,
      bodyHtml: normalizedBodyHtml,
      slug: normalizedSlug,
      publishedAt,
      modifiedAt,
      author,
      categories: normalizedCategories,
      tags: normalizedTags,
      legacyUrl: record.legacyUrl,
      targetUrl,
      disposition,
      aliasUrls,
      mediaRefs,
      _raw: {
        sourceTimestamp: record.sourceTimestamp ?? null,
        status: record.status ?? null,
        titleRaw: record.titleRaw ?? '',
        excerptRaw: record.excerptRaw ?? '',
        publishedAt: record.publishedAt ?? null,
        modifiedAt: record.modifiedAt ?? null,
        author: record.author ?? null,
        categories: Array.isArray(record.categories) ? record.categories : [],
        tags: Array.isArray(record.tags) ? record.tags : [],
        mediaRefs: normalizeExplicitMediaRefs(record.mediaRefs),
        manifest: {
          legacyUrl: manifestEntry.legacy_url,
          targetUrl: manifestEntry.target_url,
          disposition: manifestEntry.disposition,
          redirectCode: manifestEntry.redirect_code ?? null,
          implementationLayer: manifestEntry.implementation_layer ?? null,
          urlClass: manifestEntry.url_class ?? null
        },
        normalization: {
          aliasUrlsDerivedFromSameTarget: aliasUrls,
          usedPublishedAtFallback: !publishedAtSource,
          usedModifiedAtFallback: !modifiedAtSource,
          statusNormalizedFrom: record.status ?? null
        },
        extracted: {
          ...(record._raw ?? {}),
          featuredImageUrl
        }
      }
    }
  };
}

function replaceKnownMediaFallbacks(value) {
  let rewritten = String(value ?? '');
  for (const [sourceUrl, replacementUrl] of knownMediaSourceFallbacks) {
    rewritten = rewritten.split(sourceUrl).join(replacementUrl);
  }
  return rewritten;
}

function normalizeExplicitMediaRefs(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return [...new Set(values
    .map((value) => normalizeMediaUrl(value) ?? String(value ?? '').trim())
    .filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function resolveFeaturedImageUrl(record, attachmentUrlBySourceId) {
  const thumbnailId = record?._raw?.thumbnailId;
  if (thumbnailId == null || thumbnailId === '') {
    return null;
  }

  return attachmentUrlBySourceId.get(String(thumbnailId)) ?? null;
}

function normalizeSourceChannel(value) {
  const normalized = String(value ?? '').trim().toLowerCase();
  return ['wxr', 'rest', 'sql', 'filesystem', 'fallback'].includes(normalized) ? normalized : null;
}

function normalizeSourceChannels(values) {
  const normalized = [...new Set(
    (Array.isArray(values) ? values : [values])
      .map((value) => normalizeSourceChannel(value))
      .filter(Boolean)
  )].sort((left, right) => left.localeCompare(right));

  return normalized.length > 0 ? normalized : ['fallback'];
}

function normalizePostType(postType) {
  if (!postType) {
    return null;
  }
  if (postType === 'e-landing-page') {
    return 'landing';
  }
  return String(postType).trim().toLowerCase();
}

function normalizeStatus(status) {
  const normalized = String(status ?? '').trim().toLowerCase();
  return canonicalStatusMap.get(normalized) ?? null;
}

function normalizeTerms(values, bucket, inventory, metrics) {
  const terms = Array.isArray(values) ? values : [];
  const normalizedTerms = [];
  const seenSlugs = new Set();

  for (const term of terms) {
    const name = decodeHtmlText(stripUnsafeTextArtifacts(term?.name ?? '')).trim();
    const originalSlug = String(term?.slug ?? '').trim();
    const normalizedSlug = normalizeSlugValue(originalSlug || name);

    if (!normalizedSlug || seenSlugs.has(normalizedSlug)) {
      continue;
    }

    seenSlugs.add(normalizedSlug);
    normalizedTerms.push({
      name,
      slug: normalizedSlug
    });

    if (normalizedSlug !== originalSlug) {
      metrics.taxonomyTransforms.total += 1;
      if (metrics.taxonomyTransforms.samples.length < 25) {
        metrics.taxonomyTransforms.samples.push({
          bucket,
          from: originalSlug,
          to: normalizedSlug,
          inventoryReference: findInventoryReference(inventory, normalizedSlug)
        });
      }
    }
  }

  return normalizedTerms.sort((left, right) => `${left.slug}:${left.name}`.localeCompare(`${right.slug}:${right.name}`));
}

function findInventoryReference(inventory, slug) {
  if (!Array.isArray(inventory)) {
    return null;
  }
  const match = inventory.find((entry) => String(entry?.url ?? '').includes(`/${slug}/`) || String(entry?.legacy_url ?? '').includes(`/${slug}/`));
  return match?.url ?? match?.legacy_url ?? null;
}

function normalizeSlugValue(value) {
  return String(value ?? '')
    .trim()
    .replace(/^\/+|\/+$/gu, '')
    .replace(/[_\s]+/gu, '-')
    .replace(/-+/gu, '-')
    .toLowerCase();
}

function collectMediaRefs({ bodyHtml, legacyUrl, attachmentUrl, featuredImageUrl }) {
  const mediaRefs = new Set();
  for (const candidate of [attachmentUrl, featuredImageUrl, legacyUrl]) {
    const normalized = normalizeMediaUrl(candidate);
    if (normalized) {
      mediaRefs.add(normalized);
    }
  }

  if (!bodyHtml) {
    return [...mediaRefs].sort((left, right) => left.localeCompare(right));
  }

  const $ = loadHtml(bodyHtml, null, false);
  $('img[src], img[srcset], source[src], source[srcset], video[src], audio[src], iframe[src]').each((_, element) => {
    const attributes = element.attribs ?? {};
    if (attributes.src) {
      const normalizedSrc = normalizeMediaUrl(attributes.src);
      if (normalizedSrc) {
        mediaRefs.add(normalizedSrc);
      }
    }

    if (attributes.srcset) {
      for (const candidate of parseSrcSet(attributes.srcset)) {
        const normalizedSrcSet = normalizeMediaUrl(candidate);
        if (normalizedSrcSet) {
          mediaRefs.add(normalizedSrcSet);
        }
      }
    }
  });

  return [...mediaRefs].sort((left, right) => left.localeCompare(right));
}

function parseSrcSet(value) {
  return String(value ?? '')
    .split(',')
    .map((candidate) => candidate.trim().split(/\s+/u)[0])
    .filter(Boolean);
}

function normalizeMediaUrl(value) {
  const trimmed = replaceKnownMediaFallbacks(String(value ?? '').trim());
  if (!trimmed) {
    return null;
  }

  const normalizedPath = canonicalizeRelativePath(trimmed);
  if (normalizedPath?.startsWith('/wp-content/uploads/')) {
    return absoluteSiteUrl(normalizedPath);
  }

  try {
    const parsed = new URL(trimmed, canonicalHost);
    const extension = parsed.pathname.split('.').pop()?.toLowerCase();
    if (!extension || !supportedMediaExtensions.has(extension)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

function decodeHtmlText(value) {
  const sanitized = stripUnsafeTextArtifacts(value);
  if (!sanitized) {
    return '';
  }

  const $ = loadHtml(`<span>${sanitized}</span>`, null, false);
  return $('span').text().replace(/\u00a0/gu, ' ').trim();
}

function stripUnsafeTextArtifacts(value) {
  return String(value ?? '')
    .replace(/^\ufeff/gu, '')
    .replace(/\u0000/gu, '')
    .replace(/\ufffd/gu, '')
    .trim();
}

function normalizeDateValue(value) {
  if (!value) {
    return null;
  }
  const trimmed = String(value).trim();
  if (!trimmed || trimmed === '0000-00-00 00:00:00') {
    return null;
  }
  if (/^[A-Z][a-z]{2},/u.test(trimmed)) {
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }
  const parsed = new Date(trimmed.includes('T') || /[+-]\d\d:?\d\d$/u.test(trimmed) ? trimmed : `${trimmed.replace(' ', 'T')}Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function canonicalizeRelativePath(value) {
  if (!value) {
    return null;
  }

  try {
    const parsed = new URL(String(value), canonicalHost);
    const pathname = parsed.pathname || '/';
    const search = parsed.search || '';
    const lowerCasedPathname = pathname === '/' ? '/' : pathname.toLowerCase();

    if (lowerCasedPathname === '/') {
      return search ? `/${search.toLowerCase()}` : '/';
    }

    if (lowerCasedPathname.endsWith('/') || isFileLikePath(lowerCasedPathname) || search) {
      return `${lowerCasedPathname}${search.toLowerCase()}`;
    }

    return `${lowerCasedPathname}/${search.toLowerCase()}`;
  } catch {
    return null;
  }
}

function absoluteSiteUrl(pathname) {
  return pathname.startsWith('http://') || pathname.startsWith('https://') ? pathname : `${canonicalHost}${pathname}`;
}

function isFileLikePath(pathname) {
  return /\/[^/]+\.[a-z0-9]+$/iu.test(pathname);
}

function isSourceBackedManifestEntry(entry) {
  if (!contentBackedManifestClasses.has(entry.url_class)) {
    return false;
  }

  const source = String(entry.source ?? '');

  if (entry.legacy_url === '/') {
    return false;
  }

  if (entry.url_class === 'category') {
    return /^\/category\/[^/].*[^/]\/$/u.test(entry.legacy_url) && !entry.legacy_url.endsWith('/feed/');
  }

  if (entry.url_class === 'attachment') {
    return entry.legacy_url.startsWith('/wp-content/uploads/');
  }

  if (entry.url_class === 'page') {
    return source.includes('page-sitemap.xml') && !entry.legacy_url.endsWith('/feed/');
  }

  if (entry.url_class === 'landing') {
    return source.includes('e-landing-page-sitemap.xml');
  }

  if (entry.url_class === 'video') {
    return (source.includes('video-sitemap.xml') || source.includes('post-sitemap.xml')) && !entry.legacy_url.endsWith('/feed/');
  }

  if (entry.url_class === 'post') {
    return source.includes('post-sitemap.xml') && !entry.legacy_url.endsWith('/feed/');
  }

  return !entry.legacy_url.endsWith('/feed/');
}

function createNormalizeError({ record, manifestEntry, field, errorType, blocking, message }) {
  return {
    sourceId: record?.sourceId ? String(record.sourceId) : null,
    legacyUrl: record?.legacyUrl ?? manifestEntry?.legacy_url ?? null,
    targetUrl: manifestEntry?.target_url ?? null,
    disposition: manifestEntry?.disposition ?? null,
    field,
    errorType,
    blocking,
    message
  };
}

function createSchemaError({ record, manifestEntry, validationError, blocking }) {
  return {
    sourceId: String(record.sourceId),
    legacyUrl: record.legacyUrl,
    targetUrl: record.targetUrl,
    disposition: record.disposition,
    field: 'schema',
    errorType: 'schema-validation-failed',
    blocking,
    message: 'Canonical record failed Zod schema validation.',
    issues: validationError.issues.map((issue) => ({
      path: issue.path.join('.') || '(root)',
      message: issue.message,
      code: issue.code
    })),
    manifestUrlClass: manifestEntry?.url_class ?? null
  };
}

function buildCoverageReport({ manifest, normalizedRecords, normalizeErrors, requiredScope }) {
  const normalizedByLegacyUrl = new Map(normalizedRecords.map((record) => [record.legacyUrl, record]));
  const requiredManifestEntries = manifest
    .map((entry) => ({
      ...entry,
      legacy_url: canonicalizeRelativePath(entry.legacy_url),
      target_url: entry.target_url == null ? null : canonicalizeRelativePath(entry.target_url)
    }))
    .filter(
      (entry) => entry.legacy_url
        && isSourceBackedManifestEntry(entry)
        && (entry.disposition === 'keep' || entry.disposition === 'merge')
    );
  const missingRequiredUrls = requiredManifestEntries
    .filter((entry) => !normalizedByLegacyUrl.has(entry.legacy_url))
    .map((entry) => ({
      legacyUrl: entry.legacy_url,
      disposition: entry.disposition,
      targetUrl: entry.target_url,
      urlClass: entry.url_class
    }))
    .sort((left, right) => left.legacyUrl.localeCompare(right.legacyUrl));
  const requiredLegacyUrls = new Set(requiredManifestEntries.map((entry) => entry.legacy_url));
  const requiredScopeRecords = normalizedRecords.filter((record) => requiredLegacyUrls.has(record.legacyUrl));

  return {
    requiredScope,
    requiredManifestCount: requiredManifestEntries.length,
    normalizedRequiredCount: requiredScopeRecords.length,
    missingRequiredUrls,
    keepMergeMissingTargetUrlCount: requiredScopeRecords.filter(
      (record) => (record.disposition === 'keep' || record.disposition === 'merge') && record.targetUrl == null
    ).length,
    retireWithExplicitNullTargetUrlCount: normalizedRecords.filter(
      (record) => record.disposition === 'retire' && record.targetUrl === null
    ).length,
    blockingErrorCount: normalizeErrors.filter((error) => error.blocking).length,
    nonBlockingErrorCount: normalizeErrors.filter((error) => !error.blocking).length
  };
}

function createNormalizeSummary({
  extractRecords,
  extractSummary,
  inventory,
  manifest,
  normalizedRecords,
  normalizeErrors,
  coverage,
  metrics,
  options
}) {
  return {
    mode: extractSummary?.mode ?? 'full',
    selection: extractSummary?.selection ?? {
      recordCount: extractRecords.length
    },
    sourceCoverageScope: coverage.requiredScope,
    inputFiles: {
      records: toRepoRelative(options.recordsFile),
      extractSummary: toRepoRelative(options.extractSummaryFile),
      manifest: toRepoRelative(options.manifestFile),
      inventory: toRepoRelative(options.inventoryFile)
    },
    outputFiles: {
      records: toRepoRelative(options.outputRecords),
      summary: toRepoRelative(options.outputSummary),
      errors: toRepoRelative(options.outputErrors)
    },
    totals: {
      extracted: extractRecords.length,
      normalized: normalizedRecords.length,
      errors: normalizeErrors.length,
      blockingErrors: normalizeErrors.filter((error) => error.blocking).length,
      nonBlockingErrors: normalizeErrors.filter((error) => !error.blocking).length,
      skippedWithoutManifest: metrics.skippedWithoutManifest.count,
      manifestEntries: manifest.length,
      inventoryEntries: Array.isArray(inventory) ? inventory.length : 0
    },
    byPostType: countBy(normalizedRecords, 'postType'),
    byStatus: countBy(normalizedRecords, 'status'),
    byDisposition: countBy(normalizedRecords, 'disposition'),
    coverage,
    normalizationNotes: {
      aliasContract: 'Derived aliasUrls from manifest rows that share the same target_url, excluding the canonical target URL itself.',
      mediaScope: 'Collected mediaRefs from src attributes plus srcset candidate URLs, with attachment upload URLs preserved when available.',
      timestampFallbacks: {
        publishedAt: metrics.dateFallbacks.publishedAt,
        modifiedAt: metrics.dateFallbacks.modifiedAt,
        policy: 'When source timestamps are missing, publishedAt falls back to modifiedAt then sourceTimestamp; modifiedAt falls back to publishedAt then sourceTimestamp.'
      },
      statusTransforms: sortObject(metrics.statusTransforms),
      taxonomyTransforms: metrics.taxonomyTransforms,
      skippedWithoutManifest: metrics.skippedWithoutManifest
    }
  };
}

function createMetrics() {
  return {
    dateFallbacks: {
      publishedAt: 0,
      modifiedAt: 0
    },
    statusTransforms: Object.create(null),
    taxonomyTransforms: {
      total: 0,
      samples: []
    },
    skippedWithoutManifest: {
      count: 0,
      byPostType: Object.create(null),
      samples: []
    }
  };
}

function incrementMetric(bucket, key) {
  bucket[key] = (bucket[key] ?? 0) + 1;
}

function recordSkippedWithoutManifest(metrics, record) {
  metrics.skippedWithoutManifest.count += 1;
  incrementMetric(metrics.skippedWithoutManifest.byPostType, record.postType ?? 'unknown');
  if (metrics.skippedWithoutManifest.samples.length < 25) {
    metrics.skippedWithoutManifest.samples.push({
      sourceId: String(record.sourceId ?? ''),
      postType: record.postType ?? 'unknown',
      legacyUrl: record.legacyUrl ?? null
    });
  }
}

function countBy(records, field) {
  return sortObject(
    records.reduce((bucket, record) => {
      const key = record[field] ?? 'unknown';
      bucket[key] = (bucket[key] ?? 0) + 1;
      return bucket;
    }, Object.create(null))
  );
}

function sortObject(value) {
  return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)));
}

function sortExtractedRecords(records) {
  return [...records].sort((left, right) => {
    const urlDelta = String(left.legacyUrl ?? '').localeCompare(String(right.legacyUrl ?? ''));
    if (urlDelta !== 0) {
      return urlDelta;
    }
    return String(left.sourceId ?? '').localeCompare(String(right.sourceId ?? ''));
  });
}

function sortNormalizedRecords(records) {
  return [...records].sort((left, right) => {
    const urlDelta = String(left.legacyUrl ?? '').localeCompare(String(right.legacyUrl ?? ''));
    if (urlDelta !== 0) {
      return urlDelta;
    }
    return String(left.sourceId).localeCompare(String(right.sourceId));
  });
}

function stabilizeNormalizedRecord(record) {
  return {
    ...record,
    sourceChannels: [...record.sourceChannels].sort((left, right) => left.localeCompare(right)),
    categories: [...record.categories].sort((left, right) => `${left.slug}:${left.name}`.localeCompare(`${right.slug}:${right.name}`)),
    tags: [...record.tags].sort((left, right) => `${left.slug}:${left.name}`.localeCompare(`${right.slug}:${right.name}`)),
    aliasUrls: [...new Set(record.aliasUrls)].sort((left, right) => left.localeCompare(right)),
    mediaRefs: [...new Set(record.mediaRefs)].sort((left, right) => left.localeCompare(right))
  };
}

function sortNormalizeErrors(errors) {
  return [...errors].sort((left, right) => {
    const blockingDelta = Number(right.blocking) - Number(left.blocking);
    if (blockingDelta !== 0) {
      return blockingDelta;
    }
    const urlDelta = String(left.legacyUrl ?? '').localeCompare(String(right.legacyUrl ?? ''));
    if (urlDelta !== 0) {
      return urlDelta;
    }
    const sourceIdDelta = String(left.sourceId ?? '').localeCompare(String(right.sourceId ?? ''));
    if (sourceIdDelta !== 0) {
      return sourceIdDelta;
    }
    return String(left.errorType ?? '').localeCompare(String(right.errorType ?? ''));
  });
}

async function readJsonFile(filePath, label) {
  try {
    const fileContent = await fsp.readFile(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    throw new Error(`Unable to read ${label} at ${toRepoRelative(filePath)}: ${error.message}`);
  }
}

async function writeJsonFile(filePath, value) {
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
  await fsp.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function toRepoRelative(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join('/');
}

main().catch((error) => {
  console.error(`Normalization failed: ${error.message}`);
  process.exitCode = 1;
});
