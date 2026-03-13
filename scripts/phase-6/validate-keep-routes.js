import fs from 'node:fs/promises';
import path from 'node:path';

import { parse as parseCsv } from 'csv-parse/sync';
import { stringify as stringifyCsv } from 'csv-stringify/sync';

import {
  collectContentState,
  collectPublicAssetState,
  collectPublicHtmlState,
  collectStaticFileState,
  normalizeUrlLike,
  repoRoot,
  toRepoRelative
} from '../migration/url-validation-helpers.js';

const defaults = {
  inputPath: path.join(repoRoot, 'migration/url-map.csv'),
  contentRoot: path.join(repoRoot, 'src/content'),
  staticRoot: path.join(repoRoot, 'src/static'),
  publicRoot: path.join(repoRoot, 'public'),
  reportPath: path.join(repoRoot, 'migration/reports/phase-6-keep-route-audit.csv')
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

    if (arg === '--static-dir') {
      options.staticRoot = path.resolve(argv[index + 1]);
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
  console.log(`Usage: node scripts/phase-6/validate-keep-routes.js [options]

Options:
  --input <path>        Override the reviewed URL map path.
  --content-dir <path>  Override the Hugo content root.
  --static-dir <path>   Override the static source root.
  --public-dir <path>   Override the built public directory.
  --report <path>       Override the keep-route audit CSV path.
  --help                Show this help message.
`);
}

function loadKeepRows(source) {
  return parseCsv(source, {
    columns: true,
    skip_empty_lines: true
  })
    .filter((row) => row.disposition === 'keep')
    .sort((left, right) => left.legacy_url.localeCompare(right.legacy_url));
}

function createRow(row) {
  return {
    legacy_url: row.legacy_url,
    target_url: row.target_url,
    route_class: row.route_class,
    content_file: '',
    source_artifact: '',
    public_artifact: '',
    status: 'pass',
    actual_outcome: '',
    notes: ''
  };
}

function categoryBundlePath(contentRoot, routeInfo) {
  const segments = routeInfo.pathname.replace(/^\/+|\/+$/g, '').split('/');
  if (segments.length !== 2 || segments[0] !== 'category') {
    return null;
  }

  return path.join(contentRoot, 'categories', segments[1], '_index.md');
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
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
        'route_class',
        'content_file',
        'source_artifact',
        'public_artifact',
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

  const rows = loadKeepRows(await fs.readFile(options.inputPath, 'utf8'));
  const contentState = await collectContentState(options.contentRoot);
  const staticState = await collectStaticFileState(options.staticRoot);
  const publicHtmlState = await collectPublicHtmlState(options.publicRoot);
  const publicAssetState = await collectPublicAssetState(options.publicRoot);
  const reportRows = [];

  for (const row of rows) {
    const reportRow = createRow(row);
    const targetInfo = normalizeUrlLike(row.target_url);
    const primaryMatches = contentState.primaryRoutes.get(targetInfo.comparablePathOnly) ?? [];
    const publicHtml = publicHtmlState.htmlRoutes.get(targetInfo.comparablePathOnly);
    const sourceAsset = staticState.staticRoutes.get(targetInfo.pathname);
    const publicAsset = publicAssetState.assetRoutes.get(targetInfo.pathname);

    if (primaryMatches.length > 1) {
      reportRow.status = 'fail';
      reportRow.actual_outcome = 'duplicate-frontmatter-route';
      reportRow.content_file = primaryMatches.map((match) => match.relativePath).join(', ');
      reportRow.notes = 'Multiple content files declare the same keep route via explicit url front matter.';
      reportRows.push(reportRow);
      continue;
    }

    if (primaryMatches.length === 1) {
      reportRow.content_file = primaryMatches[0].relativePath;
      reportRow.public_artifact = publicHtml?.relativePath ?? '';
      reportRow.actual_outcome = 'explicit-frontmatter-route';
      reportRow.notes = 'Keep route is preserved by explicit url front matter on the destination content file.';
      reportRows.push(reportRow);
      continue;
    }

    if (row.route_class === 'category') {
      const bundlePath = categoryBundlePath(options.contentRoot, targetInfo);
      const bundleExists = bundlePath ? await fileExists(bundlePath) : false;
      reportRow.content_file = bundleExists ? toRepoRelative(bundlePath) : '';
      reportRow.public_artifact = publicHtml?.relativePath ?? '';

      if (!bundleExists || !publicHtml) {
        reportRow.status = 'fail';
        reportRow.actual_outcome = 'missing-taxonomy-route';
        reportRow.notes = 'Expected a category term bundle and built term page for this preserved taxonomy keep route.';
        reportRows.push(reportRow);
        continue;
      }

      reportRow.actual_outcome = 'taxonomy-generated-route';
      reportRow.notes = 'Owner-approved RHI-065 exception: Hugo taxonomy permalinks preserve this keep route without explicit url front matter.';
      reportRows.push(reportRow);
      continue;
    }

    if (row.route_class === 'system' && publicHtml) {
      reportRow.public_artifact = publicHtml.relativePath;
      reportRow.actual_outcome = 'generated-system-route';
      reportRow.notes = 'Keep route is preserved as a generated system helper route in the built output.';
      reportRows.push(reportRow);
      continue;
    }

    if (sourceAsset || publicAsset) {
      reportRow.source_artifact = sourceAsset?.relativePath ?? '';
      reportRow.public_artifact = publicAsset?.relativePath ?? '';

      if (!publicAsset) {
        reportRow.status = 'fail';
        reportRow.actual_outcome = 'missing-public-asset';
        reportRow.notes = 'Keep route is backed by a static or generated asset but is missing from the built public output.';
        reportRows.push(reportRow);
        continue;
      }

      reportRow.actual_outcome = sourceAsset ? 'live-static-asset' : 'generated-system-file';
      reportRow.notes = sourceAsset
        ? 'Keep route is preserved as a static asset in both source and built output.'
        : 'Keep route is preserved as a generated system file in the built output.';
      reportRows.push(reportRow);
      continue;
    }

    if (publicHtml) {
      reportRow.public_artifact = publicHtml.relativePath;
      reportRow.status = 'fail';
      reportRow.actual_outcome = 'missing-explicit-frontmatter-route';
      reportRow.notes = 'Keep route renders in the built output but is not tied to explicit url front matter or an approved generated-route exception.';
      reportRows.push(reportRow);
      continue;
    }

    reportRow.status = 'fail';
    reportRow.actual_outcome = 'missing-keep-route';
    reportRow.notes = 'Keep route is missing from both content front matter and built output.';
    reportRows.push(reportRow);
  }

  await writeReport(options.reportPath, reportRows);

  const failures = reportRows.filter((row) => row.status === 'fail');
  console.log(`Audited ${reportRows.length} keep route row(s) from ${toRepoRelative(options.inputPath)}`);
  console.log(`Keep-route audit report written to ${toRepoRelative(options.reportPath)}`);
  console.log(`Pass rows: ${reportRows.length - failures.length}`);
  console.log(`Fail rows: ${failures.length}`);

  if (failures.length > 0) {
    console.error('Keep-route audit failed:');
    for (const failure of failures) {
      console.error(`- ${failure.legacy_url} [${failure.actual_outcome}] ${failure.notes}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Keep-route audit passed.');
}

await main();