import fs from 'node:fs/promises';
import path from 'node:path';

import { parse as parseCsv } from 'csv-parse/sync';
import { stringify as stringifyCsv } from 'csv-stringify/sync';

import {
  collectContentState,
  collectPublicHtmlState,
  matchesExpectedMergeTarget,
  normalizeUrlLike,
  readRedirectHtml,
  repoRoot,
  toRepoRelative
} from '../migration/url-validation-helpers.js';

const defaults = {
  inputPath: path.join(repoRoot, 'migration/url-map.csv'),
  contentRoot: path.join(repoRoot, 'src/content'),
  publicRoot: path.join(repoRoot, 'public'),
  reportPath: path.join(repoRoot, 'migration/reports/phase-6-redirect-chain-report.csv')
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

    if (arg === '--content-dir') {
      options.contentRoot = path.resolve(argv[index + 1]);
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
  console.log(`Usage: node scripts/phase-6/check-redirect-chains.js [options]

Options:
  --input <path>        Override the reviewed URL map path.
  --content-dir <path>  Override the Hugo content root.
  --public-dir <path>   Override the built public directory.
  --report <path>       Override the redirect chain CSV path.
  --help                Show this help message.
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

function createReportRow(row, descriptor) {
  return {
    legacy_url: row.legacy_url,
    target_url: row.target_url,
    public_file: descriptor?.relativePath ?? '',
    actual_target: '',
    additional_hops: '0',
    status: 'pass',
    actual_outcome: 'one-hop-final-target',
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
        'actual_target',
        'additional_hops',
        'status',
        'actual_outcome',
        'notes'
      ]
    }),
    'utf8'
  );
}

async function readHtmlDescriptor(descriptor, aliasCache) {
  if (!descriptor) {
    return null;
  }

  let parsed = aliasCache.get(descriptor.relativePath);
  if (!parsed) {
    parsed = await readRedirectHtml(descriptor);
    aliasCache.set(descriptor.relativePath, parsed);
  }

  return parsed;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const rows = loadRedirectRows(await fs.readFile(options.inputPath, 'utf8'));
  const contentState = await collectContentState(options.contentRoot);
  const publicState = await collectPublicHtmlState(options.publicRoot);
  const aliasCache = new Map();
  const redirectEdges = new Map();
  const recordsBySource = new Map();
  const reportRows = [];

  for (const row of rows) {
    const legacyInfo = normalizeUrlLike(row.legacy_url);
    const expectedTarget = normalizeUrlLike(row.target_url);
    const descriptor = publicState.htmlRoutes.get(legacyInfo.comparablePathOnly);
    const reportRow = createReportRow(row, descriptor);

    const primaryMatches = contentState.primaryRoutes.get(legacyInfo.comparablePathOnly) ?? [];
    if (primaryMatches.length > 0) {
      reportRow.status = 'fail';
      reportRow.actual_outcome = 'source-conflicts-primary-route';
      reportRow.notes = `Legacy alias source matches a canonical content route: ${primaryMatches.map((match) => match.relativePath).join(', ')}`;
      reportRows.push(reportRow);
      continue;
    }

    if (!descriptor) {
      reportRow.status = 'fail';
      reportRow.actual_outcome = 'missing-alias-page';
      reportRow.notes = 'Expected a built alias helper page for this pages-static redirect record.';
      reportRows.push(reportRow);
      continue;
    }

    const parsedAlias = await readHtmlDescriptor(descriptor, aliasCache);
    if (!parsedAlias?.isRedirectPage || !parsedAlias.metaRefreshTarget) {
      reportRow.status = 'fail';
      reportRow.actual_outcome = 'missing-meta-refresh';
      reportRow.notes = 'Alias helper page exists but does not expose a meta refresh target.';
      reportRows.push(reportRow);
      continue;
    }

    const actualTarget = normalizeUrlLike(parsedAlias.metaRefreshTarget);
    reportRow.actual_target = actualTarget.serverRelative;

    if (!matchesExpectedMergeTarget(row, actualTarget, expectedTarget)) {
      reportRow.status = 'fail';
      reportRow.actual_outcome = 'wrong-refresh-target';
      reportRow.notes = `Alias helper refreshes to ${actualTarget.serverRelative} instead of ${row.target_url}.`;
      reportRows.push(reportRow);
      continue;
    }

    if (actualTarget.comparablePathOnly === legacyInfo.comparablePathOnly) {
      reportRow.status = 'fail';
      reportRow.actual_outcome = 'self-loop';
      reportRow.notes = 'Alias helper refreshes back to the legacy source path.';
      reportRows.push(reportRow);
      continue;
    }

    redirectEdges.set(legacyInfo.comparablePathOnly, actualTarget.comparablePathOnly);
    recordsBySource.set(legacyInfo.comparablePathOnly, {
      reportRow,
      actualTarget
    });
    reportRows.push(reportRow);
  }

  for (const [sourcePath, record] of recordsBySource.entries()) {
    if (record.reportRow.status === 'fail') {
      continue;
    }

    const visited = new Set([sourcePath]);
    const pathTrace = [sourcePath];
    let currentPath = redirectEdges.get(sourcePath);
    let additionalHops = 0;
    let loopDetected = false;

    while (currentPath && redirectEdges.has(currentPath)) {
      if (visited.has(currentPath)) {
        pathTrace.push(currentPath);
        loopDetected = true;
        break;
      }

      visited.add(currentPath);
      pathTrace.push(currentPath);
      additionalHops += 1;
      currentPath = redirectEdges.get(currentPath);
    }

    record.reportRow.additional_hops = String(additionalHops);

    if (loopDetected) {
      record.reportRow.status = 'fail';
      record.reportRow.actual_outcome = 'redirect-loop';
      record.reportRow.notes = `Redirect loop detected through ${pathTrace.join(' -> ')}.`;
      continue;
    }

    if (additionalHops > 0) {
      const finalTarget = currentPath ?? pathTrace[pathTrace.length - 1];
      record.reportRow.status = 'fail';
      record.reportRow.actual_outcome = 'redirect-chain';
      record.reportRow.notes = `Alias helper resolves through ${additionalHops} additional hop(s) before ${finalTarget}.`;
      continue;
    }

    const terminalDescriptor = publicState.htmlRoutes.get(record.actualTarget.comparablePathOnly);
    const terminalPage = await readHtmlDescriptor(terminalDescriptor, aliasCache);
    if (terminalPage?.isRedirectPage) {
      record.reportRow.status = 'fail';
      record.reportRow.actual_outcome = 'target-is-redirect-page';
      record.reportRow.notes = `Alias helper points to another redirect helper at ${record.actualTarget.serverRelative}.`;
      continue;
    }

    record.reportRow.notes = `One-hop final destination verified at ${record.actualTarget.serverRelative}.`;
  }

  await writeReport(options.reportPath, reportRows);

  const failures = reportRows.filter((row) => row.status === 'fail');
  console.log(`Checked ${reportRows.length} alias-backed redirect row(s) from ${toRepoRelative(options.inputPath)}`);
  console.log(`Redirect chain report written to ${toRepoRelative(options.reportPath)}`);
  console.log(`Pass rows: ${reportRows.length - failures.length}`);
  console.log(`Fail rows: ${failures.length}`);
  console.log(`Chain defects: ${reportRows.filter((row) => row.actual_outcome === 'redirect-chain').length}`);
  console.log(`Loop defects: ${reportRows.filter((row) => row.actual_outcome === 'redirect-loop').length}`);

  if (failures.length > 0) {
    console.error('Redirect chain validation failed:');
    for (const failure of failures) {
      console.error(`- ${failure.legacy_url} [${failure.actual_outcome}] ${failure.notes}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Redirect chain validation passed.');
}

await main();