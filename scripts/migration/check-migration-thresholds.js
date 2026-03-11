import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse as parseCsv } from 'csv-parse/sync';

import { repoRoot, toRepoRelative } from './url-validation-helpers.js';

const defaultPaths = {
  itemReport: path.join(repoRoot, 'migration/reports/migration-item-report.csv'),
  frontmatterReport: path.join(repoRoot, 'migration/reports/frontmatter-errors.csv'),
  seoReport: path.join(repoRoot, 'migration/reports/seo-completeness-report.csv')
};

const requiredItemColumns = [
  'source_id',
  'target_file',
  'source_url',
  'conversion_mode',
  'a11y_status',
  'url_parity_status',
  'qa_status'
];

const requiredFrontmatterChecks = new Set([
  'draft_false',
  'title_present',
  'description_present',
  'url_format',
  'date_iso8601',
  'lastmod_iso8601',
  'categories_present'
]);

async function main() {
  const options = resolveOptions(process.argv.slice(2));
  const config = resolveThresholdConfig();

  const [itemRows, frontmatterRows, seoRows] = await Promise.all([
    readCsvRows(options.itemReport, 'migration item report'),
    readCsvRows(options.frontmatterReport, 'front matter report'),
    readCsvRows(options.seoReport, 'SEO completeness report')
  ]);

  ensureRequiredColumns(itemRows, requiredItemColumns, options.itemReport);

  const itemBySourceId = new Map(itemRows.map((row) => [String(row.source_id), row]));
  const itemByFile = new Map(itemRows.filter((row) => row.target_file).map((row) => [String(row.target_file), row]));

  const urlParityBreaches = itemRows.filter((row) => row.target_file && row.url_parity_status === 'fail');
  const frontmatterBreaches = collectFrontmatterBreaches({
    frontmatterRows,
    seoRows,
    itemBySourceId,
    itemByFile
  });
  const noindexBreaches = collectNoindexBreaches({
    seoRows,
    itemByFile
  });

  const coveredBlockedIds = new Set([
    ...urlParityBreaches.map((row) => row.source_id),
    ...frontmatterBreaches.map((breach) => breach.source_id).filter(Boolean),
    ...noindexBreaches.map((breach) => breach.source_id).filter(Boolean)
  ]);

  const otherBlockedBreaches = itemRows.filter(
    (row) => row.target_file && row.qa_status === 'blocked' && !coveredBlockedIds.has(row.source_id)
  );
  const htmlFallbackRows = itemRows.filter((row) => row.conversion_mode === 'html-fallback');
  const a11yWarningRows = itemRows.filter((row) => row.a11y_status === 'warn');

  const capBreaches = [];
  if (htmlFallbackRows.length > config.htmlFallbackCap) {
    capBreaches.push({
      label: `html-fallback cap exceeded (${htmlFallbackRows.length}/${config.htmlFallbackCap})`,
      sourceIds: htmlFallbackRows.map((row) => row.source_id)
    });
  }
  if (a11yWarningRows.length > config.a11yWarningCap) {
    capBreaches.push({
      label: `a11y warning cap exceeded (${a11yWarningRows.length}/${config.a11yWarningCap})`,
      sourceIds: a11yWarningRows.map((row) => row.source_id)
    });
  }

  const hardBreaches = [
    formatRowBreaches('URL parity failures', urlParityBreaches),
    formatMappedBreaches('Required front matter failures', frontmatterBreaches),
    formatMappedBreaches('Unexpected noindex failures', noindexBreaches),
    formatRowBreaches('Other blocked records', otherBlockedBreaches)
  ].filter(Boolean);

  if (hardBreaches.length > 0 || capBreaches.length > 0) {
    console.error('Migration threshold gate failed.');
    for (const breach of hardBreaches) {
      console.error(`- ${breach.label}: ${breach.sourceIds.join(', ') || breach.details.join(', ')}`);
    }
    for (const breach of capBreaches) {
      console.error(`- ${breach.label}: ${breach.sourceIds.join(', ')}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    [
      'Migration threshold gate passed.',
      `HTML fallback rows: ${htmlFallbackRows.length}/${config.htmlFallbackCap}.`,
      `A11y warning rows: ${a11yWarningRows.length}/${config.a11yWarningCap}.`,
      `Item rows: ${itemRows.length}.`
    ].join(' ')
  );
}

function resolveOptions(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    switch (argument) {
      case '--item-report':
        parsed.itemReport = path.resolve(argv[++index]);
        break;
      case '--frontmatter-report':
        parsed.frontmatterReport = path.resolve(argv[++index]);
        break;
      case '--seo-report':
        parsed.seoReport = path.resolve(argv[++index]);
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
  console.log(`Usage: node scripts/migration/check-migration-thresholds.js [options]

Options:
  --item-report <path>         Override migration/reports/migration-item-report.csv.
  --frontmatter-report <path>  Override migration/reports/frontmatter-errors.csv.
  --seo-report <path>          Override migration/reports/seo-completeness-report.csv.
  --help                       Show this help message.
`);
}

function resolveThresholdConfig() {
  return {
    htmlFallbackCap: parseCap(process.env.MIGRATION_THRESHOLD_HTML_FALLBACK_CAP, 5),
    a11yWarningCap: parseCap(process.env.MIGRATION_THRESHOLD_A11Y_WARNING_CAP, 25)
  };
}

function parseCap(value, fallback) {
  if (value == null || value === '') {
    return fallback;
  }

  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`Threshold cap must be a non-negative integer. Received: ${value}`);
  }
  return parsed;
}

async function readCsvRows(filePath, label) {
  try {
    return parseCsv(await fs.readFile(filePath, 'utf8'), {
      bom: true,
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
  } catch (error) {
    throw new Error(`Unable to read ${label} at ${toRepoRelative(filePath)}: ${error.message}`);
  }
}

function ensureRequiredColumns(rows, columns, filePath) {
  const firstRow = rows[0] ?? {};
  for (const column of columns) {
    if (!(column in firstRow)) {
      throw new Error(`Column ${column} is missing from ${toRepoRelative(filePath)}.`);
    }
  }
}

function collectFrontmatterBreaches({ frontmatterRows, seoRows, itemBySourceId, itemByFile }) {
  const mapped = [];

  for (const row of frontmatterRows) {
    const item = itemBySourceId.get(String(row.sourceId ?? '').trim())
      ?? itemByFile.get(String(row.file ?? '').trim())
      ?? null;
    mapped.push(createMappedBreach(item, row.file, row.errorType || 'frontmatter_error'));
  }

  for (const row of seoRows) {
    if (String(row.status ?? '').trim().toLowerCase() !== 'fail') {
      continue;
    }
    if (!requiredFrontmatterChecks.has(String(row.check ?? '').trim())) {
      continue;
    }

    const item = itemByFile.get(String(row.file ?? '').trim()) ?? null;
    mapped.push(createMappedBreach(item, row.file, row.check));
  }

  return dedupeMappedBreaches(mapped);
}

function collectNoindexBreaches({ seoRows, itemByFile }) {
  const mapped = [];

  for (const row of seoRows) {
    if (String(row.status ?? '').trim().toLowerCase() !== 'fail') {
      continue;
    }
    if (String(row.check ?? '').trim() !== 'noindex_absent') {
      continue;
    }

    const item = itemByFile.get(String(row.file ?? '').trim()) ?? null;
    mapped.push(createMappedBreach(item, row.file, 'noindex_absent'));
  }

  return dedupeMappedBreaches(mapped);
}

function createMappedBreach(item, file, reason) {
  return {
    source_id: item?.source_id ?? '',
    file: String(file ?? '').trim(),
    reason: String(reason ?? '').trim()
  };
}

function dedupeMappedBreaches(breaches) {
  const seen = new Set();
  return breaches.filter((breach) => {
    const key = `${breach.source_id}|${breach.file}|${breach.reason}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function formatRowBreaches(label, rows) {
  if (rows.length === 0) {
    return null;
  }
  return {
    label,
    sourceIds: rows.map((row) => row.source_id),
    details: []
  };
}

function formatMappedBreaches(label, rows) {
  if (rows.length === 0) {
    return null;
  }

  return {
    label,
    sourceIds: rows.map((row) => row.source_id).filter(Boolean),
    details: rows.filter((row) => !row.source_id).map((row) => `${row.file || 'unknown-file'}:${row.reason}`)
  };
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
