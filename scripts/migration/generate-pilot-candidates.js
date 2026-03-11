import fs from 'node:fs/promises';
import path from 'node:path';

import { stringify as stringifyCsv } from 'csv-stringify/sync';

import { loadManifest, repoRoot, sortManifestEntries, toRepoRelative } from './url-validation-helpers.js';

const aliasPattern = /^\/(?:|[a-z0-9/-]*[a-z0-9-]\/)$/;

const defaultPaths = {
  normalizedRecordsFile: path.join(repoRoot, 'migration/intermediate/records.normalized.json'),
  convertedRecordsDir: path.join(repoRoot, 'migration/output'),
  manifestFile: path.join(repoRoot, 'migration/url-manifest.json'),
  baselineFile: path.join(repoRoot, 'migration/phase-1-seo-baseline.md'),
  reportFile: path.join(repoRoot, 'migration/reports/pilot-selection-candidates.csv'),
  summaryFile: path.join(repoRoot, 'migration/reports/pilot-selection-summary.json')
};

const reportColumns = [
  'source_id',
  'selection_scope',
  'primary_source_type',
  'source_channel_set',
  'post_type',
  'disposition',
  'title',
  'legacy_url',
  'target_url',
  'top_90_rank',
  'top_28_rank',
  'compatible_alias_count',
  'has_code_blocks',
  'has_tables',
  'has_embedded_media',
  'image_count',
  'word_count',
  'coverage_tags',
  'notes'
];

async function main() {
  const options = resolveOptions(process.argv.slice(2));
  await ensureRequiredFiles(options);

  const [records, convertedBySourceId, manifest, baselineMarkdown] = await Promise.all([
    readJsonArray(options.normalizedRecordsFile, 'normalized records'),
    loadConvertedRecords(options.convertedRecordsDir),
    loadManifest(options.manifestFile),
    fs.readFile(options.baselineFile, 'utf8')
  ]);

  const top90Ranks = extractTrafficRanks(baselineMarkdown, '### Top pages by clicks (90-day export)');
  const top28Ranks = extractTrafficRanks(baselineMarkdown, '### Top pages by clicks (28-day dedicated export)');

  const rows = buildRows({
    records,
    convertedBySourceId,
    top90Ranks,
    top28Ranks
  });
  const summary = buildSummary({
    rows,
    manifest,
    top90Ranks,
    top28Ranks
  });

  await fs.mkdir(path.dirname(options.reportFile), { recursive: true });
  await fs.writeFile(
    options.reportFile,
    stringifyCsv(rows, {
      header: true,
      columns: reportColumns
    }),
    'utf8'
  );
  await fs.writeFile(options.summaryFile, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

  console.log(
    [
      `Wrote ${rows.length} pilot candidate row(s) to ${toRepoRelative(options.reportFile)}.`,
      `Source-backed merge candidates: ${summary.counts.sourceBackedMergeCandidates}.`,
      `Alias-backed redirect candidates: ${summary.counts.aliasBackedRedirectCandidates}.`,
      `Source-backed video candidates: ${summary.counts.sourceBackedVideoCandidates}.`,
      `Wrote ${toRepoRelative(options.summaryFile)}.`
    ].join(' ')
  );
}

function resolveOptions(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    switch (argument) {
      case '--normalized-records-file':
        parsed.normalizedRecordsFile = path.resolve(argv[++index]);
        break;
      case '--converted-records-dir':
        parsed.convertedRecordsDir = path.resolve(argv[++index]);
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
      case '--summary-file':
        parsed.summaryFile = path.resolve(argv[++index]);
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
    ...defaultPaths,
    ...parsed
  };
}

function printHelp() {
  console.log(`Usage: node scripts/migration/generate-pilot-candidates.js [options]

Options:
  --normalized-records-file <path>  Override migration/intermediate/records.normalized.json.
  --converted-records-dir <path>    Override migration/output used for converted record JSON files.
  --manifest-file <path>            Override migration/url-manifest.json.
  --baseline-file <path>            Override migration/phase-1-seo-baseline.md.
  --report-file <path>              Override migration/reports/pilot-selection-candidates.csv.
  --summary-file <path>             Override migration/reports/pilot-selection-summary.json.
  --help                            Show this help message.
`);
}

async function ensureRequiredFiles(options) {
  const requiredFiles = [
    options.normalizedRecordsFile,
    options.manifestFile,
    options.baselineFile
  ];

  for (const filePath of requiredFiles) {
    try {
      const stat = await fs.stat(filePath);
      if (!stat.isFile()) {
        throw new Error(`${toRepoRelative(filePath)} is not a file.`);
      }
    } catch (error) {
      if (error?.code === 'ENOENT') {
        throw new Error(`Required input is missing: ${toRepoRelative(filePath)}.`);
      }
      throw error;
    }
  }

  try {
    const stat = await fs.stat(options.convertedRecordsDir);
    if (!stat.isDirectory()) {
      throw new Error(`${toRepoRelative(options.convertedRecordsDir)} is not a directory.`);
    }
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error(`Required directory is missing: ${toRepoRelative(options.convertedRecordsDir)}.`);
    }
    throw error;
  }
}

async function readJsonArray(filePath, label) {
  const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
  if (!Array.isArray(data)) {
    throw new Error(`Expected ${label} at ${toRepoRelative(filePath)} to be a JSON array.`);
  }
  return data;
}

async function loadConvertedRecords(convertedRecordsDir) {
  const entries = (await fs.readdir(convertedRecordsDir)).filter((name) => name.endsWith('.json')).sort();
  const convertedBySourceId = new Map();

  for (const name of entries) {
    const filePath = path.join(convertedRecordsDir, name);
    const parsed = JSON.parse(await fs.readFile(filePath, 'utf8'));
    if (parsed?.sourceId == null) {
      continue;
    }
    convertedBySourceId.set(String(parsed.sourceId), parsed);
  }

  return convertedBySourceId;
}

function extractTrafficRanks(markdown, heading) {
  const ranks = new Map();
  const lines = markdown.split(/\r?\n/u);
  let inSection = false;

  for (const line of lines) {
    if (!inSection) {
      if (line.trim() === heading) {
        inSection = true;
      }
      continue;
    }

    if (/^##\s/u.test(line) || /^###\s/u.test(line)) {
      break;
    }

    const match = /^\|\s*(\d+)\s*\|\s*(https:\/\/www\.rhino-inquisitor\.com\/[^|]*)\s*\|/u.exec(line);
    if (!match) {
      continue;
    }

    const rank = Number(match[1]);
    const pathname = new URL(match[2].trim()).pathname;
    const comparablePath = pathname === '/' ? '/' : pathname.endsWith('/') ? pathname : `${pathname}/`;
    ranks.set(comparablePath, rank);
  }

  return ranks;
}

function buildRows({ records, convertedBySourceId, top90Ranks, top28Ranks }) {
  return records
    .filter((record) => record.disposition === 'keep' || record.disposition === 'merge' || (record.disposition === 'retire' && record.postType !== 'attachment'))
    .map((record) => buildRow({
      record,
      convertedRecord: convertedBySourceId.get(String(record.sourceId)) ?? null,
      top90Ranks,
      top28Ranks
    }))
    .sort((left, right) => {
      const scopeDelta = left.selection_scope.localeCompare(right.selection_scope);
      if (scopeDelta !== 0) {
        return scopeDelta;
      }

      return left.legacy_url.localeCompare(right.legacy_url);
    });
}

function buildRow({ record, convertedRecord, top90Ranks, top28Ranks }) {
  const targetUrl = normalizeComparablePath(record.targetUrl);
  const legacyUrl = normalizeComparablePath(record.legacyUrl);
  const trafficKey = targetUrl ?? legacyUrl;
  const compatibleAliases = (record.aliasUrls ?? []).filter((aliasUrl) => aliasPattern.test(aliasUrl) && !aliasUrl.includes('//'));
  const bodyMarkdown = typeof convertedRecord?.bodyMarkdown === 'string' ? convertedRecord.bodyMarkdown : '';
  const bodyHtml = typeof record.bodyHtml === 'string' ? record.bodyHtml : '';
  const hasCodeBlocks = /```/u.test(bodyMarkdown);
  const hasTables = /\n\|.+\|\n\|(?:\s*:?-+:?\s*\|)+/u.test(bodyMarkdown);
  const hasEmbeddedMedia = /<iframe\b|\[(?:embed|gallery|caption)\b/iu.test(bodyHtml)
    || /youtube\.com|youtu\.be|vimeo\.com/iu.test(bodyHtml);
  const imageCount = (bodyMarkdown.match(/!\[[^\]]*\]\(/gu) ?? []).length;
  const wordCount = countWords(bodyMarkdown);
  const coverageTags = buildCoverageTags({
    record,
    targetUrl,
    hasCodeBlocks,
    hasTables,
    hasEmbeddedMedia,
    compatibleAliases,
    top90Rank: top90Ranks.get(trafficKey) ?? null,
    top28Rank: top28Ranks.get(trafficKey) ?? null
  });

  return {
    source_id: String(record.sourceId),
    selection_scope: record.disposition === 'retire' ? 'route-validation' : 'content-backed',
    primary_source_type: String(record.sourceType ?? ''),
    source_channel_set: Array.isArray(record.sourceChannels) ? [...record.sourceChannels].sort().join('|') : '',
    post_type: String(record.postType ?? ''),
    disposition: String(record.disposition ?? ''),
    title: String(record.titleRaw ?? ''),
    legacy_url: legacyUrl ?? '',
    target_url: targetUrl ?? '',
    top_90_rank: top90Ranks.get(trafficKey) ?? '',
    top_28_rank: top28Ranks.get(trafficKey) ?? '',
    compatible_alias_count: compatibleAliases.length,
    has_code_blocks: hasCodeBlocks,
    has_tables: hasTables,
    has_embedded_media: hasEmbeddedMedia,
    image_count: imageCount,
    word_count: wordCount,
    coverage_tags: coverageTags.join('|'),
    notes: buildNotes({ record, compatibleAliases, top90Ranks, top28Ranks, trafficKey })
  };
}

function normalizeComparablePath(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();
  if (trimmedValue.length === 0) {
    return null;
  }

  if (trimmedValue === '/') {
    return '/';
  }

  return trimmedValue.endsWith('/') ? trimmedValue : `${trimmedValue}/`;
}

function countWords(markdown) {
  if (markdown.trim().length === 0) {
    return 0;
  }

  return markdown
    .replace(/```[\s\S]*?```/gu, ' ')
    .replace(/`[^`]+`/gu, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/gu, ' ')
    .replace(/\[[^\]]+\]\([^)]*\)/gu, ' ')
    .split(/\s+/u)
    .filter(Boolean)
    .length;
}

function buildCoverageTags({ record, targetUrl, hasCodeBlocks, hasTables, hasEmbeddedMedia, compatibleAliases, top90Rank, top28Rank }) {
  const tags = [];
  const comparableTarget = targetUrl ?? normalizeComparablePath(record.legacyUrl);

  if (record.postType === 'post' && !hasCodeBlocks && !hasTables && !hasEmbeddedMedia) {
    tags.push('standard-article');
  }
  if (record.postType === 'post' && hasCodeBlocks && hasTables) {
    tags.push('long-form-code-table');
  }
  if ((record.postType === 'post' || record.postType === 'page') && hasEmbeddedMedia) {
    tags.push('embedded-media');
  }
  if (record.postType === 'page') {
    tags.push('page');
  }
  if (record.postType === 'category') {
    tags.push('category-listing');
  }
  if (comparableTarget === '/') {
    tags.push('homepage');
  }
  if (comparableTarget === '/video/') {
    tags.push('video-related-page');
  }
  if (compatibleAliases.length > 0) {
    tags.push('redirect-alias-scenario');
  }
  if (record.disposition === 'retire') {
    tags.push('retire-route');
  }
  if (top90Rank && top90Rank <= 10) {
    tags.push('top-10-traffic-90d');
  }
  if (top28Rank && top28Rank <= 10) {
    tags.push('top-10-traffic-28d');
  }

  return tags;
}

function buildNotes({ record, compatibleAliases, top90Ranks, top28Ranks, trafficKey }) {
  const notes = [];

  if (compatibleAliases.length > 0) {
    notes.push(`aliases:${compatibleAliases.slice(0, 3).join(',')}`);
  }
  if (record.disposition === 'retire') {
    notes.push('retire validation should confirm no staged Hugo page output');
  }
  if ((top90Ranks.get(trafficKey) ?? null) != null || (top28Ranks.get(trafficKey) ?? null) != null) {
    notes.push('traffic-priority candidate from Phase 1 baseline');
  }

  return notes.join(' | ');
}

function buildSummary({ rows, manifest, top90Ranks, top28Ranks }) {
  const manifestEntries = [...manifest].sort(sortManifestEntries);
  const mergeManifestRows = manifestEntries.filter((entry) => entry.disposition === 'merge');
  const queryMergeManifestRows = mergeManifestRows.filter((entry) => entry.legacy_url.includes('?'));
  const pathMergeManifestRows = mergeManifestRows.filter((entry) => !entry.legacy_url.includes('?'));
  const contentBackedRows = rows.filter((row) => row.selection_scope === 'content-backed');
  const retireRows = rows.filter((row) => row.selection_scope === 'route-validation');
  const aliasBackedRedirectRows = rows.filter((row) => Number(row.compatible_alias_count) > 0);
  const sourceBackedMergeRows = rows.filter((row) => row.disposition === 'merge');
  const sourceBackedVideoRows = rows.filter((row) => row.post_type === 'video');
  const videoPageRows = rows.filter((row) => row.coverage_tags.split('|').includes('video-related-page'));

  return {
    inputs: {
      normalizedRecordsFile: toRepoRelative(defaultPaths.normalizedRecordsFile),
      convertedRecordsDir: toRepoRelative(defaultPaths.convertedRecordsDir),
      manifestFile: toRepoRelative(defaultPaths.manifestFile),
      baselineFile: toRepoRelative(defaultPaths.baselineFile)
    },
    counts: {
      contentBackedCandidates: contentBackedRows.length,
      routeValidationCandidates: retireRows.length,
      top90Top10Candidates: rows.filter((row) => Number(row.top_90_rank) > 0 && Number(row.top_90_rank) <= 10).length,
      top28Top10Candidates: rows.filter((row) => Number(row.top_28_rank) > 0 && Number(row.top_28_rank) <= 10).length,
      aliasBackedRedirectCandidates: aliasBackedRedirectRows.length,
      sourceBackedMergeCandidates: sourceBackedMergeRows.length,
      sourceBackedVideoCandidates: sourceBackedVideoRows.length,
      videoPageCandidates: videoPageRows.length,
      mergeManifestRows: mergeManifestRows.length,
      queryMergeManifestRows: queryMergeManifestRows.length,
      pathMergeManifestRows: pathMergeManifestRows.length,
      top90TrackedUrls: top90Ranks.size,
      top28TrackedUrls: top28Ranks.size
    },
    openQuestions: [
      'Choose the authoritative traffic window for the pilot top-10 requirement: 90-day export or 28-day export.',
      'Confirm whether the existing /video/ page satisfies the "video-related post" criterion because the normalized corpus has no source-backed postType=video records.',
      'Confirm whether an alias-backed keep record plus one manifest merge URL is acceptable for redirect validation because the normalized corpus has no source-backed merge records.'
    ],
    keyFindings: [
      sourceBackedMergeRows.length === 0
        ? 'No source-backed normalized records currently carry disposition=merge.'
        : `${sourceBackedMergeRows.length} source-backed merge records are available for pilot selection.`,
      sourceBackedVideoRows.length === 0
        ? 'No source-backed normalized records currently carry postType=video.'
        : `${sourceBackedVideoRows.length} source-backed video records are available for pilot selection.`,
      `${aliasBackedRedirectRows.length} keep records already expose one or more Hugo-compatible alias paths for static redirect validation.`,
      `${queryMergeManifestRows.length} manifest merge rows are query-style legacy URLs that require route-level or edge-layer validation rather than source-id subset selection.`
    ],
    recommendedValidationRoutes: {
      aliasRedirectCandidates: aliasBackedRedirectRows.slice(0, 5).map(toSummaryCandidate),
      manifestMergeCandidates: mergeManifestRows.slice(0, 5).map((entry) => ({
        legacyUrl: entry.legacy_url,
        targetUrl: entry.target_url,
        implementationLayer: entry.implementation_layer,
        priority: entry.priority
      })),
      retireCandidates: retireRows.slice(0, 5).map(toSummaryCandidate)
    },
    candidateBuckets: {
      standardArticle: rows.filter((row) => row.coverage_tags.split('|').includes('standard-article')).slice(0, 10).map(toSummaryCandidate),
      longFormCodeTable: rows.filter((row) => row.coverage_tags.split('|').includes('long-form-code-table')).slice(0, 10).map(toSummaryCandidate),
      embeddedMedia: rows.filter((row) => row.coverage_tags.split('|').includes('embedded-media')).slice(0, 10).map(toSummaryCandidate),
      page: rows.filter((row) => row.coverage_tags.split('|').includes('page')).slice(0, 10).map(toSummaryCandidate),
      homepage: rows.filter((row) => row.coverage_tags.split('|').includes('homepage')).slice(0, 10).map(toSummaryCandidate),
      categoryListing: rows.filter((row) => row.coverage_tags.split('|').includes('category-listing')).slice(0, 10).map(toSummaryCandidate),
      traffic90dTop10: rows.filter((row) => Number(row.top_90_rank) > 0 && Number(row.top_90_rank) <= 10).slice(0, 10).map(toSummaryCandidate),
      traffic28dTop10: rows.filter((row) => Number(row.top_28_rank) > 0 && Number(row.top_28_rank) <= 10).slice(0, 10).map(toSummaryCandidate)
    }
  };
}

function toSummaryCandidate(row) {
  return {
    sourceId: row.source_id,
    postType: row.post_type,
    disposition: row.disposition,
    legacyUrl: row.legacy_url,
    targetUrl: row.target_url,
    top90Rank: row.top_90_rank || null,
    top28Rank: row.top_28_rank || null,
    compatibleAliasCount: Number(row.compatible_alias_count),
    coverageTags: row.coverage_tags ? row.coverage_tags.split('|').filter(Boolean) : []
  };
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
