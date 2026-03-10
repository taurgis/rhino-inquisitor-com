import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import fg from 'fast-glob';
import matter from 'gray-matter';
import { stringify as stringifyCsv } from 'csv-stringify/sync';

import { ConvertedRecordSchema } from './schemas/converted-record.schema.js';
import {
  DiscoveryMetadataCurationFileSchema,
  DiscoveryParamsSchema,
  discoveryFieldKeys
} from './schemas/discovery-metadata.schema.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const canonicalHost = 'https://www.rhino-inquisitor.com';
const maxDescriptionLength = 155;
const minDescriptionLength = 120;
const minAcceptableDescriptionLength = 80;
const urlPattern = /^\/(?:|[a-z0-9/-]*[a-z0-9-]\/?)$/;
const aliasPattern = /^\/(?:|[a-z0-9/-]*[a-z0-9-]\/)$/;

async function main() {
  const options = await resolveOptions(process.argv.slice(2));
  const curation = await loadDiscoveryCuration(options.discoveryFile);
  const extractRecords = await readJsonFile(options.extractRecordsFile, 'extraction records');
  const outputPathToSourceIds = new Map();
  const mappingStats = {
    excludedNonPathAliasCount: 0
  };
  const recordFiles = (await fg('*.json', {
    cwd: options.recordsDir,
    onlyFiles: true
  })).sort();

  if (recordFiles.length === 0) {
    throw new Error(`No converted records found under ${toRepoRelative(options.recordsDir)}.`);
  }

  await resetDirectory(options.contentDir);
  await ensureDirectory(path.dirname(options.errorReport));
  await ensureDirectory(path.dirname(options.coverageReport));

  const errors = [];
  const coverage = createCoverageReport(options, curation.__meta.exists);
  const mappedRecords = [];
  const urlToFiles = new Map();
  const validatedRecords = [];

  for (const relativeFile of recordFiles) {
    const absoluteFile = path.join(options.recordsDir, relativeFile);
    const rawRecord = await readJsonFile(absoluteFile, `converted record ${relativeFile}`);
    const validation = ConvertedRecordSchema.safeParse(rawRecord);
    if (!validation.success) {
      errors.push(createErrorRow({
        sourceId: rawRecord?.sourceId ?? path.basename(relativeFile, '.json'),
        file: relativeFile,
        field: 'record',
        errorType: 'schema',
        errorMessage: validation.error.message
      }));
      continue;
    }

    validatedRecords.push({
      relativeFile,
      record: validation.data
    });
  }

  const attachmentUrlBySourceId = buildAttachmentUrlLookup(Array.isArray(extractRecords) ? extractRecords : []);

  for (const { relativeFile, record } of validatedRecords) {
    if (!['keep', 'merge'].includes(record.disposition) || record.postType === 'category') {
      continue;
    }

    const discoveryResult = resolveDiscoveryParams(record, curation, errors);
    const frontMatter = buildFrontMatter(record, discoveryResult.params, attachmentUrlBySourceId, errors, mappingStats);
    const outputRelativePath = buildOutputRelativePath(record);
    const outputPath = path.join(options.contentDir, outputRelativePath);

    recordCoverage(coverage, record, discoveryResult);

    mappedRecords.push({
      record,
      frontMatter,
      outputRelativePath,
      outputPath
    });

    if (typeof frontMatter.url === 'string' && frontMatter.url.length > 0) {
      const currentFiles = urlToFiles.get(frontMatter.url) ?? [];
      currentFiles.push(outputRelativePath);
      urlToFiles.set(frontMatter.url, currentFiles);
    }

    const currentSourceIds = outputPathToSourceIds.get(outputRelativePath) ?? [];
    currentSourceIds.push(record.sourceId);
    outputPathToSourceIds.set(outputRelativePath, currentSourceIds);
  }

  for (const [urlValue, filePaths] of urlToFiles.entries()) {
    if (filePaths.length < 2) {
      continue;
    }

    for (const filePath of filePaths) {
      errors.push(createErrorRow({
        sourceId: filePath,
        file: filePath,
        field: 'url',
        errorType: 'url_collision',
        errorMessage: `url collides with another generated file: ${urlValue}`
      }));
    }
  }

  for (const [outputRelativePath, sourceIds] of outputPathToSourceIds.entries()) {
    if (sourceIds.length < 2) {
      continue;
    }

    for (const sourceId of sourceIds) {
      errors.push(createErrorRow({
        sourceId,
        file: outputRelativePath,
        field: 'file',
        errorType: 'output_collision',
        errorMessage: `output file collides with another generated record: ${outputRelativePath}`
      }));
    }
  }

  const errorReport = serializeErrorRows(errors);
  await fsp.writeFile(options.errorReport, errorReport, 'utf8');
  await writeJsonFile(options.coverageReport, finalizeCoverageReport(coverage));

  if (errors.length > 0) {
    throw new Error(
      `Front matter mapping failed with ${errors.length} error(s). Review ${toRepoRelative(options.errorReport)}.`
    );
  }

  for (const mappedRecord of mappedRecords) {
    await ensureDirectory(path.dirname(mappedRecord.outputPath));
    const content = matter.stringify(`${mappedRecord.record.bodyMarkdown.trim()}\n`, mappedRecord.frontMatter, {
      lineWidth: 0
    });
    await fsp.writeFile(mappedRecord.outputPath, content, 'utf8');
  }

  console.log(
    [
      `Mapped ${mappedRecords.length} keep/merge record(s) to ${toRepoRelative(options.contentDir)}.`,
      `Discovery enrichment present on ${coverage.totals.enrichedRecords} record(s).`,
        `Excluded ${mappingStats.excludedNonPathAliasCount} non-path alias URL(s) from front matter.`,
        `Coverage report written to ${toRepoRelative(options.coverageReport)}.`
    ].join(' ')
  );
}

async function resolveOptions(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case '--records-dir':
        parsed.recordsDir = path.resolve(argv[++index]);
        break;
      case '--content-dir':
        parsed.contentDir = path.resolve(argv[++index]);
        break;
      case '--extract-records-file':
        parsed.extractRecordsFile = path.resolve(argv[++index]);
        break;
      case '--discovery-file':
        parsed.discoveryFile = path.resolve(argv[++index]);
        break;
      case '--error-report':
        parsed.errorReport = path.resolve(argv[++index]);
        break;
      case '--coverage-report':
        parsed.coverageReport = path.resolve(argv[++index]);
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
    recordsDir: parsed.recordsDir ?? path.join(repoRoot, 'migration/output'),
    contentDir: parsed.contentDir ?? path.join(repoRoot, 'migration/output/content'),
    extractRecordsFile: parsed.extractRecordsFile ?? path.join(repoRoot, 'migration/intermediate/extract-records.json'),
    discoveryFile: parsed.discoveryFile ?? path.join(repoRoot, 'migration/input/discovery-metadata.json'),
    errorReport: parsed.errorReport ?? path.join(repoRoot, 'migration/reports/frontmatter-errors.csv'),
    coverageReport: parsed.coverageReport ?? path.join(repoRoot, 'migration/reports/discovery-metadata-coverage.json')
  };
}

function printHelp() {
  console.log(`Usage: node scripts/migration/map-frontmatter.js [options]

Options:
  --records-dir <path>      Override migration/output input directory.
  --content-dir <path>      Override generated Markdown output directory.
  --extract-records-file <path>
                            Override migration/intermediate/extract-records.json used for attachment lookups.
  --discovery-file <path>   Override optional discovery metadata curation file.
  --error-report <path>     Override frontmatter-errors CSV path.
  --coverage-report <path>  Override discovery coverage JSON path.
  --help                    Show this help message.
`);
}

async function loadDiscoveryCuration(filePath) {
  try {
    await fsp.access(filePath);
  } catch {
    return {
      __meta: {
        exists: false
      }
    };
  }

  const raw = await readJsonFile(filePath, 'discovery metadata curation file');
  const validation = DiscoveryMetadataCurationFileSchema.safeParse(raw);
  if (!validation.success) {
    throw new Error(`Discovery metadata curation file failed validation: ${validation.error.message}`);
  }

  return {
    ...validation.data,
    __meta: {
      exists: true
    }
  };
}

function resolveDiscoveryParams(record, curation, errors) {
  const rawEmbedded = normalizeDiscoveryValue(record._raw?.discoveryMetadata);
  const curationEntry = normalizeDiscoveryValue(curation[record.sourceId]);
  const merged = {
    ...(rawEmbedded ?? {}),
    ...(curationEntry ?? {})
  };

  const source = rawEmbedded && curationEntry
    ? 'embedded+curation'
    : rawEmbedded
      ? 'embedded'
      : curationEntry
        ? 'curation'
        : 'none';

  if (Object.keys(merged).length === 0) {
    return {
      params: undefined,
      source,
      presentFields: []
    };
  }

  const validation = DiscoveryParamsSchema.safeParse(merged);
  if (!validation.success) {
    for (const issue of validation.error.issues) {
      errors.push(createErrorRow({
        sourceId: record.sourceId,
        file: `${record.sourceId}.json`,
        field: issue.path.length === 0 ? 'params' : `params.${issue.path.join('.')}`,
        errorType: 'discovery_metadata',
        errorMessage: issue.message
      }));
    }

    return {
      params: undefined,
      source,
      presentFields: []
    };
  }

  const params = orderDiscoveryParams(validation.data);

  return {
    params,
    source,
    presentFields: discoveryFieldKeys.filter((fieldName) => fieldName in params)
  };
}

function normalizeDiscoveryValue(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  return value;
}

function buildAttachmentUrlLookup(records) {
  const lookup = new Map();

  for (const record of records) {
    if (record.postType !== 'attachment') {
      continue;
    }

    const attachmentUrl = resolveAttachmentSourceUrl(record);
    if (!attachmentUrl) {
      continue;
    }

    lookup.set(String(record.sourceId), attachmentUrl);
  }

  return lookup;
}

function resolveAttachmentSourceUrl(record) {
  const attachmentUrl = record?._raw?.extracted?.attachmentUrl ?? record?._raw?.attachmentUrl ?? null;
  if (typeof attachmentUrl !== 'string') {
    return null;
  }

  const normalized = attachmentUrl.trim();
  if (!normalized) {
    return null;
  }

  if (/^https?:\/\//iu.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith('/')) {
    return `${canonicalHost}${normalized}`;
  }

  return null;
}

function buildFrontMatter(record, discoveryParams, attachmentUrlBySourceId, errors, mappingStats) {
  const title = record.titleRaw.trim();
  if (title.length === 0) {
    errors.push(createErrorRow({
      sourceId: record.sourceId,
      file: `${record.sourceId}.json`,
      field: 'title',
      errorType: 'missing_required',
      errorMessage: 'titleRaw resolved to an empty value.'
    }));
  }

  const description = resolveDescription(record);
  if (description.length === 0) {
    errors.push(createErrorRow({
      sourceId: record.sourceId,
      file: `${record.sourceId}.json`,
      field: 'description',
      errorType: 'missing_required',
      errorMessage: 'description resolved to an empty value.'
    }));
  }

  if (!record.targetUrl || !urlPattern.test(record.targetUrl)) {
    errors.push(createErrorRow({
      sourceId: record.sourceId,
      file: `${record.sourceId}.json`,
      field: 'url',
      errorType: 'invalid_url',
      errorMessage: 'targetUrl is missing or violates the canonical path format.'
    }));
  }

  if (record.aliasUrls.includes(record.targetUrl)) {
    errors.push(createErrorRow({
      sourceId: record.sourceId,
      file: `${record.sourceId}.json`,
      field: 'aliases',
      errorType: 'alias_loop',
      errorMessage: 'aliasUrls must not include the canonical targetUrl.'
    }));
  }

  const compatibleAliasUrls = record.aliasUrls.filter((aliasUrl) => {
    const isCompatible = aliasPattern.test(aliasUrl) && !aliasUrl.includes('//');
    if (!isCompatible) {
      mappingStats.excludedNonPathAliasCount += 1;
    }

    return isCompatible;
  });

  const frontMatter = {
    title,
    description,
    date: record.publishedAt,
    lastmod: record.modifiedAt,
    url: record.targetUrl,
    draft: record.status !== 'publish'
  };

  const thumbnailId = record?._raw?.extracted?.thumbnailId ?? null;
  const normalizedFeaturedImageUrl = typeof record?._raw?.extracted?.featuredImageUrl === 'string'
    ? record._raw.extracted.featuredImageUrl.trim()
    : '';
  const heroImage = normalizedFeaturedImageUrl || (thumbnailId ? attachmentUrlBySourceId.get(String(thumbnailId)) ?? null : null);
  if (heroImage) {
    frontMatter.heroImage = heroImage;
  }

  if (record.postType === 'post') {
    frontMatter.categories = record.categories.map((term) => term.name);
  }

  if (record.postType === 'post') {
    frontMatter.tags = record.tags.map((term) => term.name);
  }

  if (compatibleAliasUrls.length > 0) {
    frontMatter.aliases = compatibleAliasUrls;
  }

  if (record.author.trim().length > 0) {
    frontMatter.author = record.author.trim();
  }

  if (discoveryParams && Object.keys(discoveryParams).length > 0) {
    frontMatter.params = discoveryParams;
  }

  return frontMatter;
}

function resolveDescription(record) {
  const excerpt = normalizeDescriptionText(record.excerptRaw ?? '');
  const bodyText = normalizeDescriptionText(record.bodyMarkdown ?? '');

  const candidates = [];
  if (excerpt.length > 0) {
    candidates.push(excerpt);
  }
  if (bodyText.length > 0) {
    candidates.push(bodyText);
  }

  for (const candidate of candidates) {
    const resolved = buildDescription(candidate);
    if (resolved.length > 0) {
      if (resolved.length >= minAcceptableDescriptionLength) {
        return resolved;
      }

      const fallbackSuffix = record.postType === 'post'
        ? 'Read the full article on Rhino Inquisitor for implementation details.'
        : 'Explore the full page on Rhino Inquisitor for additional context.';
      return buildDescription([resolved, fallbackSuffix].join(' '));
    }
  }

  const titleFallback = normalizeDescriptionText(record.titleRaw ?? '');
  if (titleFallback.length > 0) {
    const context = record.postType === 'post'
      ? 'Read practical Salesforce Commerce Cloud insights from Rhino Inquisitor.'
      : 'Explore this Rhino Inquisitor page for migration-safe reference details.';
    const titleEndsSentence = /[.?]$/u.test(titleFallback) || titleFallback.endsWith(String.fromCharCode(33));
    const titleSentence = titleEndsSentence ? titleFallback : titleFallback + '.';
    return buildDescription([titleSentence, context].join(' '));
  }

  return buildDescription('Visit Rhino Inquisitor for Salesforce Commerce Cloud migration and engineering insights.');
}

function buildDescription(sourceText) {
  if (sourceText.length === 0) {
    return '';
  }

  if (sourceText.length <= maxDescriptionLength) {
    return sourceText;
  }

  const sentenceSummary = buildSentenceSummary(sourceText);
  if (sentenceSummary.length > 0) {
    return sentenceSummary;
  }

  return trimToWordBoundary(sourceText, maxDescriptionLength);
}

function buildSentenceSummary(sourceText) {
  const sentences = sourceText
    .split(/(?<=[.!?])\s+/u)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);

  let summary = '';
  for (const sentence of sentences) {
    const candidate = summary.length === 0 ? sentence : [summary, sentence].join(' ');
    if (candidate.length > maxDescriptionLength) {
      if (summary.length > 0) {
        return summary;
      }
      break;
    }
    summary = candidate;
    if (summary.length >= minDescriptionLength) {
      return summary;
    }
  }

  if (summary.length > 0) {
    return summary;
  }

  return '';
}

function normalizeDescriptionText(value) {
  return String(value)
    .replace(/```[\s\S]*?```/gu, ' ')
    .replace(/`([^`]+)`/gu, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/gu, ' ')
    .replace(/\[[^\]]+\]\([^)]*\)/gu, '$1')
    .replace(/<!--(?:[\s\S]*?)-->/gu, ' ')
    .replace(/\[(?:\.{3}|\u2026|Read more)\]/giu, ' ')
    .replace(/\$1(?=[!?.,;:]|\s|$)/gu, ' ')
    .replace(/[>#*_~]/gu, ' ')
    .replace(/\s+([,.;!?])/gu, '$1')
    .replace(/(?:\.{3}|\u2026)+$/gu, '')
    .replace(/\s+/gu, ' ')
    .trim();
}

function trimToWordBoundary(value, maxLength) {
  if (value.length <= maxLength) {
    return value;
  }

  const sliced = value.slice(0, maxLength + 1).trimEnd();
  const lastSpace = sliced.lastIndexOf(' ');
  const minimumBoundary = Math.floor(maxLength * 0.6);
  if (lastSpace >= minimumBoundary) {
    return sliced.slice(0, lastSpace).trimEnd();
  }

  return value.slice(0, maxLength).trimEnd();
}
function buildOutputRelativePath(record) {
  const directory = resolveOutputDirectory(record.postType);
  const fileName = `${sanitizeFileSegment(record.slug || record.sourceId)}.md`;
  return path.posix.join(directory, fileName);
}

function resolveOutputDirectory(postType) {
  if (postType === 'post') {
    return 'posts';
  }

  if (postType === 'page') {
    return 'pages';
  }

  if (postType === 'category') {
    return 'categories';
  }

  return sanitizeFileSegment(postType || 'content');
}

function sanitizeFileSegment(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/gu, '-')
    .replace(/-{2,}/gu, '-')
    .replace(/^-|-$/gu, '') || 'record';
}

function orderDiscoveryParams(params) {
  const ordered = {};

  for (const fieldName of discoveryFieldKeys) {
    if (fieldName in params) {
      ordered[fieldName] = params[fieldName];
    }
  }

  for (const [fieldName, value] of Object.entries(params)) {
    if (!(fieldName in ordered)) {
      ordered[fieldName] = value;
    }
  }

  return ordered;
}

function createCoverageReport(options, curationFilePresent) {
  const fieldCoverage = {};
  for (const fieldName of discoveryFieldKeys) {
    fieldCoverage[fieldName] = {
      present: 0,
      missing: 0
    };
  }

  return {
    generatedAt: null,
    _latestRecordTimestamp: null,
    inputs: {
      recordsDir: toRepoRelative(options.recordsDir),
      discoveryFile: toRepoRelative(options.discoveryFile),
      curationFilePresent
    },
    totals: {
      recordCount: 0,
      enrichedRecords: 0,
      recordsWithoutEnrichment: 0
    },
    sourceBreakdown: {
      none: 0,
      embedded: 0,
      curation: 0,
      'embedded+curation': 0
    },
    fieldCoverage,
    records: []
  };
}

function recordCoverage(coverage, record, discoveryResult) {
  coverage.totals.recordCount += 1;
  coverage.sourceBreakdown[discoveryResult.source] += 1;

  if (coverage._latestRecordTimestamp == null || record.modifiedAt > coverage._latestRecordTimestamp) {
    coverage._latestRecordTimestamp = record.modifiedAt;
  }

  if (discoveryResult.presentFields.length > 0) {
    coverage.totals.enrichedRecords += 1;
  } else {
    coverage.totals.recordsWithoutEnrichment += 1;
  }

  for (const fieldName of discoveryFieldKeys) {
    const hasField = discoveryResult.presentFields.includes(fieldName);
    coverage.fieldCoverage[fieldName][hasField ? 'present' : 'missing'] += 1;
  }

  coverage.records.push({
    sourceId: record.sourceId,
    targetUrl: record.targetUrl,
    postType: record.postType,
    discoverySource: discoveryResult.source,
    presentFields: discoveryResult.presentFields
  });
}

function finalizeCoverageReport(coverage) {
  const { _latestRecordTimestamp, ...rest } = coverage;

  return {
    ...rest,
    generatedAt: _latestRecordTimestamp,
    records: coverage.records.sort((left, right) => left.targetUrl.localeCompare(right.targetUrl))
  };
}

function createErrorRow({ sourceId, file, field, errorType, errorMessage }) {
  return {
    sourceId,
    file,
    field,
    errorType,
    errorMessage
  };
}

function serializeErrorRows(rows) {
  return stringifyCsv(rows, {
    header: true,
    columns: ['sourceId', 'file', 'field', 'errorType', 'errorMessage']
  });
}

async function resetDirectory(directoryPath) {
  await fsp.rm(directoryPath, {
    recursive: true,
    force: true
  });
  await ensureDirectory(directoryPath);
}

async function ensureDirectory(directoryPath) {
  await fsp.mkdir(directoryPath, {
    recursive: true
  });
}

async function readJsonFile(filePath, label) {
  const raw = await fsp.readFile(filePath, 'utf8');

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Unable to parse ${label} at ${toRepoRelative(filePath)}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function writeJsonFile(filePath, data) {
  await fsp.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function toRepoRelative(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join('/');
}

await main();
