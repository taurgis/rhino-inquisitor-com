import fs from 'node:fs/promises';
import path from 'node:path';

import { parse as parseCsv } from 'csv-parse/sync';
import { stringify as stringifyCsv } from 'csv-stringify/sync';

import {
  collectPublicHtmlState,
  matchesExpectedMergeTarget,
  normalizeUrlLike,
  readRedirectHtml,
  repoRoot,
  toRepoRelative
} from '../migration/url-validation-helpers.js';

const defaults = {
  inputPath: path.join(repoRoot, 'migration/url-map.csv'),
  publicRoot: path.join(repoRoot, 'public'),
  reportPath: path.join(repoRoot, 'migration/reports/phase-6-alias-page-validation.csv')
};

function parseArgs(argv) {
  const options = { ...defaults, help: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--input') {
      options.inputPath = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--public-dir') {
      options.publicRoot = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--report') {
      options.reportPath = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--help') {
      options.help = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function printHelp() {
  console.log(`Usage: node scripts/phase-6/validate-alias-pages.js [options]

Options:
  --input <path>       Override the reviewed URL map path.
  --public-dir <path>  Override the built public directory.
  --report <path>      Override the alias validation CSV path.
  --help               Show this help message.
`);
}

function loadRedirectRows(source) {
  return parseCsv(source, {
    columns: true,
    skip_empty_lines: true
  })
    .filter((row) => row.disposition === 'merge' && row.implementation_layer === 'pages-static')
    .sort((left, right) => left.legacy_url.localeCompare(right.legacy_url));
}

function createResult(row, descriptor) {
  return {
    legacy_url: row.legacy_url,
    target_url: row.target_url,
    public_file: descriptor?.relativePath ?? '',
    refresh_target: '',
    canonical_target: '',
    status: 'pass',
    actual_outcome: 'alias-page-valid',
    notes: ''
  };
}

async function writeReport(reportPath, rows) {
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(
    reportPath,
    stringifyCsv(rows, {
      header: true,
      columns: [
        'legacy_url',
        'target_url',
        'public_file',
        'refresh_target',
        'canonical_target',
        'status',
        'actual_outcome',
        'notes'
      ]
    }),
    'utf8'
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const rows = loadRedirectRows(await fs.readFile(options.inputPath, 'utf8'));
  const publicState = await collectPublicHtmlState(options.publicRoot);
  const aliasCache = new Map();
  const reportRows = [];

  for (const row of rows) {
    const legacyInfo = normalizeUrlLike(row.legacy_url);
    const expectedTarget = normalizeUrlLike(row.target_url);
    const descriptor = publicState.htmlRoutes.get(legacyInfo.comparablePathOnly);
    const reportRow = createResult(row, descriptor);

    if (!descriptor) {
      reportRow.status = 'fail';
      reportRow.actual_outcome = 'missing-alias-page';
      reportRow.notes = 'Expected a built alias helper page for this pages-static redirect record.';
      reportRows.push(reportRow);
      continue;
    }

    let parsedAlias = aliasCache.get(descriptor.relativePath);
    if (!parsedAlias) {
      parsedAlias = await readRedirectHtml(descriptor);
      aliasCache.set(descriptor.relativePath, parsedAlias);
    }

    if (!parsedAlias?.isRedirectPage || !parsedAlias.metaRefreshTarget) {
      reportRow.status = 'fail';
      reportRow.actual_outcome = 'missing-meta-refresh';
      reportRow.notes = 'Alias helper page exists but does not expose a meta refresh target.';
      reportRows.push(reportRow);
      continue;
    }

    const refreshTarget = normalizeUrlLike(parsedAlias.metaRefreshTarget);
    reportRow.refresh_target = refreshTarget.serverRelative;

    if (refreshTarget.comparablePathOnly === legacyInfo.comparablePathOnly) {
      reportRow.status = 'fail';
      reportRow.actual_outcome = 'self-referencing-refresh';
      reportRow.notes = 'Alias helper refreshes back to the legacy source path.';
      reportRows.push(reportRow);
      continue;
    }

    if (!matchesExpectedMergeTarget(row, refreshTarget, expectedTarget)) {
      reportRow.status = 'fail';
      reportRow.actual_outcome = 'wrong-refresh-target';
      reportRow.notes = `Alias helper refreshes to ${refreshTarget.serverRelative} instead of ${row.target_url}.`;
      reportRows.push(reportRow);
      continue;
    }

    if (!parsedAlias.canonicalTarget) {
      reportRow.status = 'fail';
      reportRow.actual_outcome = 'missing-canonical-target';
      reportRow.notes = 'Alias helper page does not declare a canonical link.';
      reportRows.push(reportRow);
      continue;
    }

    const canonicalTarget = normalizeUrlLike(parsedAlias.canonicalTarget);
    reportRow.canonical_target = canonicalTarget.serverRelative;

    if (canonicalTarget.comparablePathOnly === legacyInfo.comparablePathOnly) {
      reportRow.status = 'fail';
      reportRow.actual_outcome = 'self-referencing-canonical';
      reportRow.notes = 'Alias helper canonical points back to the legacy source path.';
      reportRows.push(reportRow);
      continue;
    }

    if (!matchesExpectedMergeTarget(row, canonicalTarget, expectedTarget)) {
      reportRow.status = 'fail';
      reportRow.actual_outcome = 'wrong-canonical-target';
      reportRow.notes = `Alias helper canonical points to ${canonicalTarget.serverRelative} instead of ${row.target_url}.`;
      reportRows.push(reportRow);
      continue;
    }

    if (canonicalTarget.comparable !== refreshTarget.comparable) {
      reportRow.status = 'fail';
      reportRow.actual_outcome = 'refresh-canonical-mismatch';
      reportRow.notes = 'Alias helper canonical and meta refresh targets do not match.';
      reportRows.push(reportRow);
      continue;
    }

    reportRow.notes = `Alias helper verified at ${descriptor.relativePath}.`;
    reportRows.push(reportRow);
  }

  await writeReport(options.reportPath, reportRows);

  const failures = reportRows.filter((row) => row.status === 'fail');
  console.log(`Validated ${reportRows.length} alias-backed redirect row(s) from ${toRepoRelative(options.inputPath)}`);
  console.log(`Alias validation report written to ${toRepoRelative(options.reportPath)}`);
  console.log(`Pass rows: ${reportRows.length - failures.length}`);
  console.log(`Fail rows: ${failures.length}`);

  if (failures.length > 0) {
    console.error('Alias page validation failed:');
    for (const failure of failures) {
      console.error(`- ${failure.legacy_url} [${failure.actual_outcome}] ${failure.notes}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Alias page validation passed.');
}

await main();