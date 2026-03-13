import fs from 'node:fs/promises';
import path from 'node:path';

import { parse as parseCsv } from 'csv-parse/sync';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');

const defaults = {
  inputPath: path.join(repoRoot, 'migration/url-map.csv'),
  reportPath: path.join(repoRoot, 'migration/reports/phase-6-redirect-intent-review.csv')
};

const allowedIntentClasses = new Set(['exact-equivalent', 'consolidated-equivalent']);
const genericTargets = new Set(['/archive/', '/category/external/', '/category/salesforce-commerce-cloud/', '/ideas/', '/video/']);

function parseArgs(argv) {
  const options = { ...defaults, help: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--input') {
      options.inputPath = path.resolve(argv[index + 1]);
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
  console.log(`Usage: node scripts/phase-6/validate-redirect-intent-review.js [options]

Options:
  --input <path>   Override the reviewed URL map path.
  --report <path>  Override the redirect intent review report path.
  --help           Show this help message.
`);
}

function requireNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const rows = parseCsv(await fs.readFile(options.inputPath, 'utf8'), {
    columns: true,
    skip_empty_lines: true
  });
  const reportRows = parseCsv(await fs.readFile(options.reportPath, 'utf8'), {
    columns: true,
    skip_empty_lines: true
  });

  const issues = [];
  const mergeRows = rows.filter((row) => row.disposition === 'merge');
  const mergeLegacyUrls = new Set(mergeRows.map((row) => row.legacy_url));
  const reportByLegacyUrl = new Map();

  for (const row of mergeRows) {
    if (row.intent_class === 'pending-review') {
      issues.push(`Merge row still pending review: ${row.legacy_url}`);
    }

    if (!allowedIntentClasses.has(row.intent_class)) {
      issues.push(`Merge row has invalid reviewed intent class: ${row.legacy_url} -> ${row.intent_class}`);
    }

    if (!requireNonEmpty(row.owner)) {
      issues.push(`Merge row missing owner: ${row.legacy_url}`);
    }

    if (!requireNonEmpty(row.notes) || !row.notes.includes('RHI-064 review:')) {
      issues.push(`Merge row missing RHI-064 review note: ${row.legacy_url}`);
    }

    if (row.target_url === '/') {
      issues.push(`Homepage redirect is not allowed for reviewed merge row: ${row.legacy_url}`);
    }

    if (mergeLegacyUrls.has(row.target_url)) {
      issues.push(`Redirect chain detected within merge scope: ${row.legacy_url} -> ${row.target_url}`);
    }

    if (genericTargets.has(row.target_url) && !row.notes.includes('not a convenience redirect') && !row.notes.includes('consolidates')) {
      issues.push(`Generic target missing explicit rationale: ${row.legacy_url} -> ${row.target_url}`);
    }
  }

  for (const row of reportRows) {
    if (reportByLegacyUrl.has(row.legacy_url)) {
      issues.push(`Duplicate report row for ${row.legacy_url}`);
      continue;
    }

    reportByLegacyUrl.set(row.legacy_url, row);

    if (row.review_status !== 'approved') {
      issues.push(`Report row is not approved: ${row.legacy_url} -> ${row.review_status}`);
    }

    if (!requireNonEmpty(row.reviewer)) {
      issues.push(`Report row missing reviewer: ${row.legacy_url}`);
    }
  }

  if (reportRows.length !== mergeRows.length) {
    issues.push(`Report row count mismatch: expected ${mergeRows.length}, found ${reportRows.length}`);
  }

  for (const row of mergeRows) {
    const reportRow = reportByLegacyUrl.get(row.legacy_url);
    if (!reportRow) {
      issues.push(`Missing report row for ${row.legacy_url}`);
      continue;
    }

    if (reportRow.target_url !== row.target_url) {
      issues.push(`Report target mismatch for ${row.legacy_url}: ${reportRow.target_url} !== ${row.target_url}`);
    }

    if (reportRow.intent_class !== row.intent_class) {
      issues.push(`Report intent mismatch for ${row.legacy_url}: ${reportRow.intent_class} !== ${row.intent_class}`);
    }
  }

  const intentCounts = mergeRows.reduce((counts, row) => {
    counts[row.intent_class] = (counts[row.intent_class] || 0) + 1;
    return counts;
  }, {});

  console.log(`Validated ${mergeRows.length} reviewed merge row(s) from ${path.relative(repoRoot, options.inputPath)}`);
  console.log(`Validated ${reportRows.length} review report row(s) from ${path.relative(repoRoot, options.reportPath)}`);
  console.log(`Intent-class counts: ${JSON.stringify(intentCounts)}`);

  if (issues.length > 0) {
    console.error('Redirect intent review validation failed:');
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Redirect intent review validation passed.');
}

await main();