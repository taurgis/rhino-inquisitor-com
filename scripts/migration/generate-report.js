import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse as parseCsv } from 'csv-parse/sync';
import { stringify as stringifyCsv } from 'csv-stringify/sync';
import fg from 'fast-glob';

import { normalizeUrlLike, repoRoot, toRepoRelative, toPosixPath } from './url-validation-helpers.js';

const defaultPaths = {
  normalizedRecordsFile: path.join(repoRoot, 'migration/intermediate/records.normalized.json'),
  convertedRecordsDir: path.join(repoRoot, 'migration/output'),
  contentDir: path.join(repoRoot, 'migration/output/content'),
  reportFile: path.join(repoRoot, 'migration/reports/migration-item-report.csv'),
  conversionFallbackReport: path.join(repoRoot, 'migration/reports/conversion-fallbacks.csv'),
  mediaReport: path.join(repoRoot, 'migration/reports/media-integrity-report.csv'),
  frontmatterReport: path.join(repoRoot, 'migration/reports/frontmatter-errors.csv'),
  seoReport: path.join(repoRoot, 'migration/reports/seo-completeness-report.csv'),
  feedReport: path.join(repoRoot, 'migration/reports/feed-compatibility-report.csv'),
  a11yReport: path.join(repoRoot, 'migration/reports/a11y-content-warnings.csv'),
  securityReport: path.join(repoRoot, 'migration/reports/security-content-scan.csv'),
  urlParityReport: path.join(repoRoot, 'migration/reports/url-parity-report.csv'),
  linkRewriteReport: path.join(repoRoot, 'migration/reports/link-rewrite-log.csv'),
  correctionsSummaryReport: path.join(repoRoot, 'migration/reports/content-corrections-summary.json'),
  altAuditReport: path.join(repoRoot, 'migration/reports/image-alt-corrections-audit.csv'),
  linkAuditReport: path.join(repoRoot, 'migration/reports/link-text-corrections-audit.csv')
};

const csvOptions = {
  bom: true,
  columns: true,
  skip_empty_lines: true,
  trim: true
};

const reportColumns = [
  'source_id',
  'primary_source_type',
  'source_channel_set',
  'source_url',
  'target_file',
  'target_url',
  'disposition',
  'conversion_mode',
  'media_status',
  'seo_status',
  'a11y_status',
  'security_status',
  'url_parity_status',
  'content_corrections_status',
  'qa_status',
  'owner'
];

async function main() {
  const options = resolveOptions(process.argv.slice(2));
  await ensureRequiredFiles(options);

  const [records, convertedBySourceId, stagedFileSet] = await Promise.all([
    readJsonArray(options.normalizedRecordsFile, 'normalized records'),
    loadConvertedRecords(options.convertedRecordsDir),
    loadStagedFileSet(options.contentDir)
  ]);

  const [
    conversionFallbackRows,
    mediaRows,
    frontmatterRows,
    seoRows,
    feedRows,
    a11yRows,
    securityRows,
    urlParityRows,
    linkRewriteRows,
    correctionsSummary,
    altAuditRows,
    linkAuditRows
  ] = await Promise.all([
    readCsvRows(options.conversionFallbackReport),
    readCsvRows(options.mediaReport),
    readCsvRows(options.frontmatterReport),
    readCsvRows(options.seoReport),
    readCsvRows(options.feedReport),
    readCsvRows(options.a11yReport),
    readCsvRows(options.securityReport),
    readCsvRows(options.urlParityReport),
    readCsvRows(options.linkRewriteReport),
    readJsonFile(options.correctionsSummaryReport, 'content corrections summary'),
    readCsvRows(options.altAuditReport),
    readOptionalCsvRows(options.linkAuditReport)
  ]);

  const stageState = buildStageState({
    conversionFallbackRows,
    mediaRows,
    frontmatterRows,
    seoRows,
    feedRows,
    a11yRows,
    securityRows,
    urlParityRows,
    linkRewriteRows,
    correctionsSummary,
    altAuditRows,
    linkAuditRows
  });

  const rows = records
    .map((record) => buildReportRow({
      record,
      convertedBySourceId,
      stagedFileSet,
      stageState
    }))
    .sort((left, right) => {
      const bySourceId = left.source_id.localeCompare(right.source_id);
      if (bySourceId !== 0) {
        return bySourceId;
      }
      return left.source_url.localeCompare(right.source_url);
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

  const summary = summarizeRows(rows);
  console.log(
    [
      `Generated ${rows.length} migration item row(s).`,
      `Ready: ${summary.ready}.`,
      `Review-required: ${summary.reviewRequired}.`,
      `Blocked: ${summary.blocked}.`,
      `Feed report rows observed: ${feedRows.length}.`,
      `Link rewrite rows observed: ${linkRewriteRows.length}.`,
      `Corrections summary files changed: ${Number(correctionsSummary?.filesChanged ?? 0)}.`,
      `Wrote ${toRepoRelative(options.reportFile)}.`
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
      case '--content-dir':
        parsed.contentDir = path.resolve(argv[++index]);
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
    ...defaultPaths,
    ...parsed
  };
}

function printHelp() {
  console.log(`Usage: node scripts/migration/generate-report.js [options]

Options:
  --normalized-records-file <path>  Override migration/intermediate/records.normalized.json.
  --converted-records-dir <path>    Override migration/output directory used for converted record JSON files.
  --content-dir <path>              Override migration/output/content staged Markdown directory.
  --report-file <path>              Override migration/reports/migration-item-report.csv.
  --help                            Show this help message.
`);
}

async function ensureRequiredFiles(options) {
  const requiredFiles = [
    options.normalizedRecordsFile,
    options.conversionFallbackReport,
    options.mediaReport,
    options.frontmatterReport,
    options.seoReport,
    options.feedReport,
    options.a11yReport,
    options.securityReport,
    options.urlParityReport,
    options.linkRewriteReport,
    options.correctionsSummaryReport,
    options.altAuditReport
  ];

  for (const filePath of requiredFiles) {
    try {
      const stat = await fs.stat(filePath);
      if (!stat.isFile()) {
        throw new Error(`${toRepoRelative(filePath)} is not a file.`);
      }
    } catch (error) {
      if (error?.code === 'ENOENT') {
        throw new Error(`Required report input is missing: ${toRepoRelative(filePath)}.`);
      }
      throw error;
    }
  }
}

async function readJsonArray(filePath, label) {
  const data = await readJsonFile(filePath, label);
  if (!Array.isArray(data)) {
    throw new Error(`Expected ${label} at ${toRepoRelative(filePath)} to be a JSON array.`);
  }
  return data;
}

async function readJsonFile(filePath, label) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Unable to read ${label} at ${toRepoRelative(filePath)}: ${error.message}`);
  }
}

async function readCsvRows(filePath) {
  try {
    return parseCsv(await fs.readFile(filePath, 'utf8'), csvOptions);
  } catch (error) {
    throw new Error(`Unable to read CSV rows from ${toRepoRelative(filePath)}: ${error.message}`);
  }
}

async function readOptionalCsvRows(filePath) {
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      return [];
    }
    return await readCsvRows(filePath);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function loadConvertedRecords(recordsDir) {
  const jsonFiles = (await fg('*.json', {
    cwd: recordsDir,
    absolute: true,
    onlyFiles: true,
    suppressErrors: true
  })).sort((left, right) => left.localeCompare(right));

  const lookup = new Map();
  for (const filePath of jsonFiles) {
    let record;
    try {
      record = JSON.parse(await fs.readFile(filePath, 'utf8'));
    } catch {
      continue;
    }

    if (!record || typeof record !== 'object' || typeof record.sourceId !== 'string') {
      continue;
    }

    lookup.set(record.sourceId, record);
  }

  return lookup;
}

async function loadStagedFileSet(contentDir) {
  const files = await fg('**/*.md', {
    cwd: contentDir,
    onlyFiles: true,
    suppressErrors: true
  });

  return new Set(files.map((relativePath) => toPosixPath(path.join(toRepoRelative(contentDir), relativePath))));
}

function buildStageState({
  conversionFallbackRows,
  mediaRows,
  frontmatterRows,
  seoRows,
  feedRows,
  a11yRows,
  securityRows,
  urlParityRows,
  linkRewriteRows,
  correctionsSummary,
  altAuditRows,
  linkAuditRows
}) {
  return {
    conversionFallbackBySourceId: groupRows(conversionFallbackRows, (row) => String(row.sourceId ?? '').trim()),
    mediaByFile: groupRows(mediaRows, (row) => normalizeFileKey(row.file)),
    frontmatterBySourceId: groupRows(frontmatterRows, (row) => String(row.sourceId ?? '').trim()),
    frontmatterByFile: groupRows(frontmatterRows, (row) => normalizeFileKey(row.file)),
    seoByFile: groupRows(seoRows, (row) => normalizeFileKey(row.file)),
    seoByUrl: groupRows(seoRows, (row) => normalizeRouteKey(row.url)),
    a11yByFile: groupRows(a11yRows, (row) => normalizeFileKey(row.file)),
    securityByFile: groupRows(securityRows, (row) => normalizeFileKey(row.file)),
    urlParityByLegacyUrl: mapRowsByKey(urlParityRows, (row) => normalizeLegacyUrlKey(row.legacy_url)),
    altAuditByFile: groupRows(altAuditRows, (row) => normalizeFileKey(row.source_file)),
    linkAuditByFile: groupRows(linkAuditRows, (row) => normalizeFileKey(row.source_file)),
    linkRewriteByFile: groupRows(linkRewriteRows, (row) => normalizeFileKey(row.source_file)),
    correctionsSummary
  };
}

function groupRows(rows, keySelector) {
  const grouped = new Map();
  for (const row of rows) {
    const key = keySelector(row);
    if (!key) {
      continue;
    }
    const current = grouped.get(key) ?? [];
    current.push(row);
    grouped.set(key, current);
  }
  return grouped;
}

function mapRowsByKey(rows, keySelector) {
  const lookup = new Map();
  for (const row of rows) {
    const key = keySelector(row);
    if (!key || lookup.has(key)) {
      continue;
    }
    lookup.set(key, row);
  }
  return lookup;
}

function buildReportRow({ record, convertedBySourceId, stagedFileSet, stageState }) {
  const sourceId = String(record.sourceId ?? '').trim();
  if (!sourceId) {
    throw new Error('Normalized record is missing sourceId.');
  }

  const targetFile = resolveTargetFile(record);
  const requiresGeneratedContent = Boolean(targetFile);

  if (requiresGeneratedContent && !stagedFileSet.has(targetFile)) {
    throw new Error(
      `Expected staged Markdown file ${targetFile} for source ${sourceId}, but it was not found. Run migrate:map-frontmatter and migrate:finalize-content before generating the report.`
    );
  }

  const convertedRecord = convertedBySourceId.get(sourceId) ?? null;
  if (requiresGeneratedContent && !convertedRecord) {
    throw new Error(`Converted record ${sourceId} is missing from ${toRepoRelative(defaultPaths.convertedRecordsDir)}.`);
  }

  const conversionFallbackRows = stageState.conversionFallbackBySourceId.get(sourceId) ?? [];
  const mediaRows = targetFile ? stageState.mediaByFile.get(targetFile) ?? [] : [];
  const frontmatterRows = [
    ...(stageState.frontmatterBySourceId.get(sourceId) ?? []),
    ...(targetFile ? stageState.frontmatterByFile.get(targetFile) ?? [] : [])
  ];
  const seoRows = dedupeRows([
    ...(targetFile ? stageState.seoByFile.get(targetFile) ?? [] : []),
    ...(normalizeRouteKey(record.targetUrl) ? stageState.seoByUrl.get(normalizeRouteKey(record.targetUrl)) ?? [] : [])
  ]);
  const a11yRows = targetFile ? stageState.a11yByFile.get(targetFile) ?? [] : [];
  const securityRows = targetFile ? stageState.securityByFile.get(targetFile) ?? [] : [];
  const altAuditRows = targetFile ? stageState.altAuditByFile.get(targetFile) ?? [] : [];
  const linkAuditRows = targetFile ? stageState.linkAuditByFile.get(targetFile) ?? [] : [];
  const parityRow = findParityRow(stageState.urlParityByLegacyUrl, record);

  if (!parityRow) {
    throw new Error(`No URL parity row found for ${record.legacyUrl ?? sourceId}.`);
  }

  const conversionMode = resolveConversionMode({
    record,
    convertedRecord,
    conversionFallbackRows,
    requiresGeneratedContent
  });
  const mediaStatus = resolveMediaStatus(mediaRows);
  const seoStatus = resolvePassWarnFail(seoRows);
  const a11yStatus = resolvePassWarnFail(a11yRows);
  const securityStatus = resolvePassWarnFail(securityRows);
  const contentCorrectionsStatus = resolveCorrectionStatus({
    altAuditRows,
    linkAuditRows
  });
  const qaStatus = resolveQaStatus({
    requiresGeneratedContent,
    conversionMode,
    mediaStatus,
    seoStatus,
    a11yStatus,
    securityStatus,
    urlParityStatus: parityRow.status,
    contentCorrectionsStatus,
    hasFrontmatterErrors: frontmatterRows.length > 0
  });

  return {
    source_id: sourceId,
    primary_source_type: String(record.sourceType ?? record.postType ?? '').trim(),
    source_channel_set: Array.isArray(record.sourceChannels)
      ? record.sourceChannels.map((channel) => String(channel).trim()).filter(Boolean).join(',')
      : '',
    source_url: String(record.legacyUrl ?? '').trim(),
    target_file: targetFile,
    target_url: String(record.targetUrl ?? '').trim(),
    disposition: String(record.disposition ?? '').trim(),
    conversion_mode: conversionMode,
    media_status: mediaStatus,
    seo_status: seoStatus,
    a11y_status: a11yStatus,
    security_status: securityStatus,
    url_parity_status: parityRow.status,
    content_corrections_status: contentCorrectionsStatus,
    qa_status: qaStatus,
    owner: resolveOwner({ convertedRecord, conversionFallbackRows })
  };
}

function findParityRow(urlParityByLegacyUrl, record) {
  return urlParityByLegacyUrl.get(normalizeLegacyUrlKey(record.legacyUrl)) ?? null;
}

function resolveTargetFile(record) {
  if (!['keep', 'merge'].includes(String(record.disposition ?? ''))) {
    return '';
  }
  if (!['post', 'page'].includes(String(record.postType ?? ''))) {
    return '';
  }

  return toPosixPath(path.join('migration/output/content', buildOutputRelativePath(record)));
}

function buildOutputRelativePath(record) {
  return path.posix.join(resolveOutputDirectory(record.postType), `${sanitizeFileSegment(record.slug || record.sourceId)}.md`);
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
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/gu, '-')
    .replace(/-{2,}/gu, '-')
    .replace(/^-|-$/gu, '') || 'record';
}

function normalizeFileKey(value) {
  const trimmed = String(value ?? '').trim();
  return trimmed ? toPosixPath(trimmed) : '';
}

function normalizeRouteKey(value) {
  if (!value) {
    return '';
  }
  try {
    return normalizeUrlLike(String(value).trim()).comparablePathOnly;
  } catch {
    return '';
  }
}

function normalizeLegacyUrlKey(value) {
  if (!value) {
    return '';
  }

  try {
    return normalizeUrlLike(String(value).trim()).comparable;
  } catch {
    return String(value).trim();
  }
}

function resolveConversionMode({ record, convertedRecord, conversionFallbackRows, requiresGeneratedContent }) {
  if (!requiresGeneratedContent) {
    return 'manual';
  }

  if (!convertedRecord) {
    return 'manual';
  }

  if (convertedRecord.manualReviewRequired === true) {
    return 'manual';
  }

  if (conversionFallbackRows.length > 0) {
    return 'html-fallback';
  }

  return 'markdown';
}

function resolveMediaStatus(rows) {
  const categories = rows.map((row) => String(row.category ?? '').trim().toLowerCase());
  const statuses = rows.map((row) => String(row.status ?? '').trim().toLowerCase());

  if (categories.includes('hotlink')) {
    return 'hotlink';
  }
  if (categories.includes('missing') || statuses.includes('fail')) {
    return 'missing';
  }
  return 'ok';
}

function resolvePassWarnFail(rows) {
  const statuses = rows.map((row) => String(row.status ?? '').trim().toLowerCase());
  if (statuses.includes('fail')) {
    return 'fail';
  }
  if (statuses.includes('warn')) {
    return 'warn';
  }
  return 'pass';
}

function resolveCorrectionStatus({ altAuditRows, linkAuditRows }) {
  const statuses = [...altAuditRows, ...linkAuditRows].map((row) => String(row.status ?? '').trim().toLowerCase());
  if (statuses.includes('unmatched')) {
    return 'review-required';
  }
  if (statuses.includes('applied') || statuses.includes('already-current')) {
    return 'corrected';
  }
  return 'clean';
}

function resolveQaStatus({
  requiresGeneratedContent,
  conversionMode,
  mediaStatus,
  seoStatus,
  a11yStatus,
  securityStatus,
  urlParityStatus,
  contentCorrectionsStatus,
  hasFrontmatterErrors
}) {
  const hasBlockingFailure = urlParityStatus === 'fail'
    || seoStatus === 'fail'
    || a11yStatus === 'fail'
    || securityStatus === 'fail'
    || hasFrontmatterErrors
    || (requiresGeneratedContent && conversionMode === 'manual')
    || (requiresGeneratedContent && mediaStatus !== 'ok');

  if (hasBlockingFailure) {
    return 'blocked';
  }

  const needsReview = conversionMode === 'html-fallback'
    || seoStatus === 'warn'
    || a11yStatus === 'warn'
    || securityStatus === 'warn'
    || contentCorrectionsStatus !== 'clean';

  return needsReview ? 'review-required' : 'ready';
}

function resolveOwner({ convertedRecord, conversionFallbackRows }) {
  for (const row of conversionFallbackRows) {
    const owner = String(row.owner ?? '').trim();
    if (owner) {
      return owner;
    }
  }

  const owner = String(convertedRecord?.owner ?? '').trim();
  return owner || 'Engineering Owner';
}

function dedupeRows(rows) {
  const seen = new Set();
  return rows.filter((row) => {
    const key = JSON.stringify(row);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function summarizeRows(rows) {
  return rows.reduce(
    (summary, row) => {
      if (row.qa_status === 'ready') {
        summary.ready += 1;
      } else if (row.qa_status === 'review-required') {
        summary.reviewRequired += 1;
      } else {
        summary.blocked += 1;
      }
      return summary;
    },
    { ready: 0, reviewRequired: 0, blocked: 0 }
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
