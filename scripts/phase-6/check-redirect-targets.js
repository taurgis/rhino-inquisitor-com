import fs from 'node:fs/promises';
import path from 'node:path';

import { parse as parseCsv } from 'csv-parse/sync';
import { stringify as stringifyCsv } from 'csv-stringify/sync';

import {
  collectPublicAssetState,
  collectPublicHtmlState,
  normalizeUrlLike,
  repoRoot,
  toRepoRelative
} from '../migration/url-validation-helpers.js';

const defaults = {
  inputPath: path.join(repoRoot, 'migration/url-map.csv'),
  publicRoot: path.join(repoRoot, 'public'),
  reportPath: path.join(repoRoot, 'migration/reports/phase-6-redirect-targets.csv')
};

function parseArgs(argv) {
  const options = { ...defaults, ci: false, help: false };

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

    if (arg === '--ci') {
      options.ci = true;
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
  console.log(`Usage: node scripts/phase-6/check-redirect-targets.js [options]

Options:
  --input <path>       Override the reviewed URL map path.
  --public-dir <path>  Override the built public directory.
  --report <path>      Override the redirect target CSV path.
  --ci                 Keep output concise for CI.
  --help               Show this help message.
`);
}

function loadRedirectRows(source) {
  return parseCsv(source, {
    columns: true,
    skip_empty_lines: true
  })
    .filter((row) => row.disposition === 'merge')
    .sort((left, right) => left.legacy_url.localeCompare(right.legacy_url));
}

function findHtmlDescriptor(routeInfo, publicHtmlState) {
  return publicHtmlState.htmlRoutes.get(routeInfo.comparablePathOnly)
    ?? ((routeInfo.pathname === '/404/' || routeInfo.pathname === '/404')
      ? publicHtmlState.htmlRoutes.get('/404.html')
      : null);
}

function findAssetDescriptor(routeInfo, publicAssetState) {
  return publicAssetState.assetRoutes.get(routeInfo.pathname)
    ?? ((routeInfo.pathname === '/404/' || routeInfo.pathname === '/404')
      ? publicAssetState.assetRoutes.get('/404.html')
      : null);
}

function findPublishedTarget(routeInfo, publicHtmlState, publicAssetState) {
  const htmlDescriptor = findHtmlDescriptor(routeInfo, publicHtmlState);
  if (htmlDescriptor) {
    return {
      type: 'html',
      descriptor: htmlDescriptor
    };
  }

  const assetDescriptor = findAssetDescriptor(routeInfo, publicAssetState);
  if (assetDescriptor) {
    return {
      type: 'asset',
      descriptor: assetDescriptor
    };
  }

  return null;
}

function createReportRow(row) {
  return {
    legacy_url: row.legacy_url,
    target_url: row.target_url,
    implementation_layer: row.implementation_layer,
    published_file: '',
    target_type: '',
    status: 'pass',
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
        'implementation_layer',
        'published_file',
        'target_type',
        'status',
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
  const publicHtmlState = await collectPublicHtmlState(options.publicRoot);
  const publicAssetState = await collectPublicAssetState(options.publicRoot);
  const reportRows = [];

  for (const row of rows) {
    const reportRow = createReportRow(row);

    if (!row.target_url || String(row.target_url).trim().length === 0) {
      reportRow.status = 'fail';
      reportRow.notes = 'Redirect row is missing a target_url value.';
      reportRows.push(reportRow);
      continue;
    }

    const targetInfo = normalizeUrlLike(row.target_url);
    const targetDescriptor = findPublishedTarget(targetInfo, publicHtmlState, publicAssetState);

    if (!targetDescriptor) {
      reportRow.status = 'fail';
      reportRow.notes = `Approved redirect target is not published in the production artifact (${targetInfo.serverRelative}).`;
      reportRows.push(reportRow);
      continue;
    }

    reportRow.published_file = targetDescriptor.descriptor.relativePath;
    reportRow.target_type = targetDescriptor.type;
    reportRow.notes = targetDescriptor.type === 'asset'
      ? `Redirect target exists as a published static asset at ${targetDescriptor.descriptor.relativePath}.`
      : `Redirect target exists as a published HTML route at ${targetDescriptor.descriptor.relativePath}.`;
    reportRows.push(reportRow);
  }

  await writeReport(options.reportPath, reportRows);

  const failures = reportRows.filter((row) => row.status === 'fail');

  console.log(`Checked ${reportRows.length} redirect target row(s) from ${toRepoRelative(options.inputPath)}`);
  console.log(`Redirect target report written to ${toRepoRelative(options.reportPath)}`);
  console.log(`Pass rows: ${reportRows.length - failures.length}`);
  console.log(`Fail rows: ${failures.length}`);

  if (failures.length > 0) {
    console.error('Redirect target validation failed:');
    for (const failure of failures) {
      console.error(`- ${failure.legacy_url} -> ${failure.target_url || '(missing target)'}: ${failure.notes}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Redirect target validation passed.');
}

await main();