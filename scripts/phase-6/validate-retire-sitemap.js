import fs from 'node:fs/promises';
import path from 'node:path';

import { parse as parseCsv } from 'csv-parse/sync';
import { stringify as stringifyCsv } from 'csv-stringify/sync';
import { XMLParser } from 'fast-xml-parser';

import {
  collectPublicAssetState,
  collectPublicHtmlState,
  normalizeUrlLike,
  repoRoot,
  toRepoRelative
} from '../migration/url-validation-helpers.js';

const canonicalOrigin = 'https://www.rhino-inquisitor.com';

const defaults = {
  inputPath: path.join(repoRoot, 'migration/url-map.csv'),
  publicRoot: path.join(repoRoot, 'public'),
  sitemapPath: path.join(repoRoot, 'public/sitemap.xml'),
  reportPath: path.join(repoRoot, 'migration/reports/phase-6-retire-sitemap-audit.csv')
};

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  trimValues: true
});

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

    if (arg === '--sitemap') {
      options.sitemapPath = path.resolve(argv[index + 1]);
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
  console.log(`Usage: node scripts/phase-6/validate-retire-sitemap.js [options]

Options:
  --input <path>       Override the reviewed URL map path.
  --public-dir <path>  Override the built public directory.
  --sitemap <path>     Override the sitemap entry path.
  --report <path>      Override the retire/sitemap audit CSV path.
  --help               Show this help message.
`);
}

function arrayify(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value == null) {
    return [];
  }

  return [value];
}

function loadRows(source) {
  return parseCsv(source, {
    columns: true,
    skip_empty_lines: true
  }).sort((left, right) => left.legacy_url.localeCompare(right.legacy_url));
}

function createRow(values) {
  return {
    check_group: values.check_group,
    route: values.route,
    target_url: values.target_url ?? '',
    artifact: values.artifact ?? '',
    status: values.status,
    actual_outcome: values.actual_outcome ?? '',
    notes: values.notes ?? ''
  };
}

async function collectSitemapEntries(publicRoot, sitemapFilePath, visited = new Set()) {
  const resolvedPath = path.resolve(sitemapFilePath);
  if (visited.has(resolvedPath)) {
    return [];
  }
  visited.add(resolvedPath);

  const source = await fs.readFile(resolvedPath, 'utf8');
  const parsed = xmlParser.parse(source);
  const urls = [];

  for (const node of arrayify(parsed?.urlset?.url)) {
    urls.push({
      loc: typeof node?.loc === 'string' ? node.loc.trim() : '',
      sourceFile: resolvedPath
    });
  }

  for (const node of arrayify(parsed?.sitemapindex?.sitemap)) {
    if (typeof node?.loc !== 'string' || node.loc.trim().length === 0) {
      continue;
    }

    const childUrl = new URL(node.loc.trim());
    const childPath = path.join(publicRoot, childUrl.pathname.replace(/^\//, ''));
    urls.push(...await collectSitemapEntries(publicRoot, childPath, visited));
  }

  return urls;
}

async function writeReport(reportPath, rows) {
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(
    reportPath,
    stringifyCsv(rows, {
      header: true,
      columns: ['check_group', 'route', 'target_url', 'artifact', 'status', 'actual_outcome', 'notes']
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

  const rows = loadRows(await fs.readFile(options.inputPath, 'utf8'));
  const publicHtmlState = await collectPublicHtmlState(options.publicRoot);
  const publicAssetState = await collectPublicAssetState(options.publicRoot);
  const sitemapEntries = await collectSitemapEntries(options.publicRoot, options.sitemapPath);
  const sitemapRouteSet = new Set();
  const reportRows = [];

  for (const entry of sitemapEntries) {
    let route = entry.loc;
    const failures = [];

    try {
      const parsedUrl = new URL(entry.loc);
      route = normalizeUrlLike(parsedUrl.pathname).comparablePathOnly;
      if (parsedUrl.protocol !== 'https:') {
        failures.push('Sitemap URL is not HTTPS.');
      }
      if (`${parsedUrl.protocol}//${parsedUrl.host}` !== canonicalOrigin) {
        failures.push('Sitemap URL host does not match the canonical origin.');
      }
    } catch {
      failures.push('Sitemap URL is not a valid absolute URL.');
    }

    sitemapRouteSet.add(route);
    reportRows.push(createRow({
      check_group: 'sitemap-url',
      route,
      artifact: toRepoRelative(entry.sourceFile),
      status: failures.length === 0 ? 'pass' : 'fail',
      actual_outcome: failures.length === 0 ? 'canonical-sitemap-url' : 'invalid-sitemap-url',
      notes: failures.join(' ') || 'Sitemap URL is absolute, HTTPS, and canonical-host aligned.'
    }));
  }

  for (const row of rows.filter((entry) => entry.disposition === 'retire')) {
    const legacyInfo = normalizeUrlLike(row.legacy_url);
    const isQueryRoute = legacyInfo.hasQuery;

    if (isQueryRoute) {
      reportRows.push(createRow({
        check_group: 'retire-route',
        route: row.legacy_url,
        status: 'pass',
        actual_outcome: 'excluded-request-aware-route',
        notes: 'Request-aware retire route is excluded from static redirect outputs under the RHI-062 Model A exception.'
      }));
      continue;
    }

    const htmlDescriptor = publicHtmlState.htmlRoutes.get(legacyInfo.comparablePathOnly);
    const assetDescriptor = publicAssetState.assetRoutes.get(legacyInfo.pathname);

    if (htmlDescriptor || assetDescriptor) {
      reportRows.push(createRow({
        check_group: 'retire-route',
        route: row.legacy_url,
        artifact: htmlDescriptor?.relativePath ?? assetDescriptor?.relativePath ?? '',
        status: 'fail',
        actual_outcome: 'retired-route-still-published',
        notes: 'Retired route still resolves to a built HTML or asset artifact.'
      }));
      continue;
    }

    reportRows.push(createRow({
      check_group: 'retire-route',
      route: row.legacy_url,
      status: 'pass',
      actual_outcome: isQueryRoute ? 'excluded-request-aware-route' : 'true-not-found',
      notes: isQueryRoute
        ? 'Request-aware retire route is excluded from static redirect outputs under the RHI-062 Model A exception.'
        : 'No built HTML or asset artifact exists for this retired route.'
    }));
  }

  for (const row of rows.filter((entry) => entry.disposition === 'merge' || entry.disposition === 'retire')) {
    const legacyInfo = normalizeUrlLike(row.legacy_url);

    if (legacyInfo.hasQuery) {
      reportRows.push(createRow({
        check_group: 'sitemap-exclusion',
        route: row.legacy_url,
        target_url: row.target_url,
        artifact: toRepoRelative(options.sitemapPath),
        status: 'pass',
        actual_outcome: 'excluded-request-aware-route',
        notes: 'Query-string legacy route is outside static sitemap matching scope and remains an accepted RHI-062 request-aware limitation.'
      }));
      continue;
    }

    reportRows.push(createRow({
      check_group: 'sitemap-exclusion',
      route: row.legacy_url,
      target_url: row.target_url,
      artifact: toRepoRelative(options.sitemapPath),
      status: sitemapRouteSet.has(legacyInfo.comparablePathOnly) ? 'fail' : 'pass',
      actual_outcome: sitemapRouteSet.has(legacyInfo.comparablePathOnly)
        ? 'legacy-route-present-in-sitemap'
        : 'legacy-route-excluded-from-sitemap',
      notes: sitemapRouteSet.has(legacyInfo.comparablePathOnly)
        ? 'Sitemap still includes a legacy merge or retire source URL.'
        : 'Legacy merge or retire source URL is excluded from the sitemap.'
    }));
  }

  await writeReport(options.reportPath, reportRows);

  const failures = reportRows.filter((row) => row.status === 'fail');
  console.log(`Audited ${reportRows.length} retire and sitemap row(s) using ${toRepoRelative(options.inputPath)}`);
  console.log(`Retire/sitemap audit report written to ${toRepoRelative(options.reportPath)}`);
  console.log(`Pass rows: ${reportRows.length - failures.length}`);
  console.log(`Fail rows: ${failures.length}`);

  if (failures.length > 0) {
    console.error('Retire/sitemap audit failed:');
    for (const failure of failures) {
      console.error(`- ${failure.check_group} ${failure.route} [${failure.actual_outcome}] ${failure.notes}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Retire/sitemap audit passed.');
}

await main();