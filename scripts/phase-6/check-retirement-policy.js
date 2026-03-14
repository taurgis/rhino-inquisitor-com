import fs from 'node:fs/promises';
import path from 'node:path';

import { parse as parseCsv } from 'csv-parse/sync';
import { stringify as stringifyCsv } from 'csv-stringify/sync';
import { XMLParser } from 'fast-xml-parser';

import {
  collectContentState,
  collectPublicAssetState,
  collectPublicHtmlState,
  normalizeUrlLike,
  repoRoot,
  toRepoRelative
} from '../migration/url-validation-helpers.js';

const defaults = {
  inputPath: path.join(repoRoot, 'migration/url-map.csv'),
  contentRoot: path.join(repoRoot, 'src/content'),
  publicRoot: path.join(repoRoot, 'public'),
  sitemapPath: path.join(repoRoot, 'public/sitemap.xml'),
  reportPath: path.join(repoRoot, 'migration/reports/phase-6-retired-url-audit.csv')
};

const acceptedRequestAwareResiduals = new Map([
  [
    '/?s=ocapi',
    'Owner accepted on 2026-03-14: the legacy WordPress search query route shares the published homepage path under Model A and still returns the homepage with HTTP 200 on GitHub Pages until an edge layer exists.'
  ]
]);

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  trimValues: true
});

function printHelp() {
  console.log(`Usage: node scripts/phase-6/check-retirement-policy.js [options]

Options:
  --input <path>        Override the reviewed URL map path.
  --content-dir <path>  Override the Hugo content directory.
  --public-dir <path>   Override the built public directory.
  --sitemap <path>      Override the sitemap entry path.
  --report <path>       Override the retired URL audit CSV path.
  --help                Show this help message.
`);
}

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
  })
    .filter((row) => row.disposition === 'retire')
    .sort((left, right) => left.legacy_url.localeCompare(right.legacy_url));
}

function parseBoolean(value) {
  const normalized = String(value ?? '').trim().toLowerCase();
  return normalized === '1' || normalized === 'true';
}

function deriveReasonCode(row) {
  const notes = String(row.notes ?? '');

  if (notes.includes('redirect target could not be resolved')) {
    return 'redirect-target-unresolvable';
  }

  if (notes.includes('sitemap')) {
    return 'legacy-sitemap-replaced';
  }

  if (notes.includes('WordPress admin route') || notes.includes('WordPress login route')) {
    return 'wordpress-system-removed';
  }

  if (notes.includes('sample page')) {
    return 'wordpress-default-removed';
  }

  if (notes.includes('Elementor test landing page')) {
    return 'test-landing-removed';
  }

  if (notes.includes('placeholder child path')) {
    return 'invalid-placeholder-route';
  }

  if (row.route_class === 'attachment') {
    return 'attachment-no-equivalent';
  }

  if (row.route_class === 'pagination') {
    return 'pagination-no-equivalent';
  }

  if (row.route_class === 'page') {
    return 'page-no-source';
  }

  if (row.route_class === 'landing') {
    return 'landing-no-source';
  }

  return 'system-route-no-equivalent';
}

function determineOutcome(row) {
  const notes = String(row.notes ?? '').toLowerCase();

  if (row.implementation_layer === 'edge-cdn' && (notes.includes(' 410 ') || notes.includes('gone'))) {
    return '410';
  }

  return '404';
}

function determineReviewer() {
  return 'seo-owner';
}

function determineQueryBehavior(routeInfo, publicHtmlState, publicAssetState) {
  if (!routeInfo.hasQuery) {
    return 'path-based';
  }

  const htmlDescriptor = publicHtmlState.htmlRoutes.get(routeInfo.comparablePathOnly);
  const assetDescriptor = publicAssetState.assetRoutes.get(routeInfo.pathname);

  if (htmlDescriptor || assetDescriptor) {
    return 'request-aware-limitation';
  }

  return 'query-path-not-published';
}

function buildAuditNotes(row, outcome, queryBehavior) {
  const notes = [];
  const baseNotes = String(row.notes ?? '').trim();
  if (baseNotes.length > 0) {
    notes.push(baseNotes);
  }

  if (parseBoolean(row.has_organic_traffic) || parseBoolean(row.has_external_links)) {
    notes.push(
      `Review confirmed: no approved equivalent replacement exists in the finalized Phase 6 mapping; retain explicit ${outcome} outcome under Model A.`
    );
  }

  if (queryBehavior === 'request-aware-limitation') {
    const acceptedResidualNote = acceptedRequestAwareResiduals.get(row.legacy_url);
    notes.push(
      acceptedResidualNote
        ?? 'Model A limitation: this request-aware query route shares a published path component and cannot be forced to a deterministic 404 on GitHub Pages without an edge layer.'
    );
  }

  if (queryBehavior === 'query-path-not-published') {
    notes.push(
      'Request-aware query route falls through to not-found because its underlying path is not published in the Hugo artifact.'
    );
  }

  return notes.join(' ');
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
    urls.push(typeof node?.loc === 'string' ? node.loc.trim() : '');
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

async function writeAuditReport(reportPath, rows) {
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(
    reportPath,
    stringifyCsv(rows, {
      header: true,
      columns: [
        'legacy_url',
        'route_class',
        'reason_code',
        'has_organic_traffic',
        'has_external_links',
        'outcome',
        'reviewer',
        'notes'
      ]
    }),
    'utf8'
  );
}

async function ensureFileExists(filePath) {
  await fs.access(filePath);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const rows = loadRows(await fs.readFile(options.inputPath, 'utf8'));
  const contentState = await collectContentState(options.contentRoot);
  const publicHtmlState = await collectPublicHtmlState(options.publicRoot);
  const publicAssetState = await collectPublicAssetState(options.publicRoot);
  const sitemapEntries = await collectSitemapEntries(options.publicRoot, options.sitemapPath);
  const sitemapRouteSet = new Set(
    sitemapEntries
      .filter((entry) => entry.length > 0)
      .map((entry) => normalizeUrlLike(new URL(entry).pathname).comparablePathOnly)
  );
  const auditRows = [];
  const failures = [];

  for (const row of rows) {
    const routeInfo = normalizeUrlLike(row.legacy_url);
    const reasonCode = deriveReasonCode(row);
    const outcome = determineOutcome(row);
    const reviewer = determineReviewer();
    const queryBehavior = determineQueryBehavior(routeInfo, publicHtmlState, publicAssetState);

    auditRows.push({
      legacy_url: row.legacy_url,
      route_class: row.route_class,
      reason_code: reasonCode,
      has_organic_traffic: parseBoolean(row.has_organic_traffic) ? 'true' : 'false',
      has_external_links: parseBoolean(row.has_external_links) ? 'true' : 'false',
      outcome,
      reviewer,
      notes: buildAuditNotes(row, outcome, queryBehavior)
    });

    if (String(row.target_url ?? '').trim().length > 0 || String(row.redirect_code ?? '').trim().length > 0) {
      failures.push(
        `${row.legacy_url}: retire rows must not carry target_url or redirect_code values.`
      );
    }

    if (contentState.aliasRoutes.has(routeInfo.comparablePathOnly)) {
      const aliasOwners = contentState.aliasRoutes.get(routeInfo.comparablePathOnly) ?? [];
      failures.push(
        `${row.legacy_url}: retired route is still implemented as a Hugo alias in ${aliasOwners.map((entry) => entry.relativePath).join(', ')}.`
      );
    }

    if (routeInfo.hasQuery) {
      if (queryBehavior === 'request-aware-limitation') {
        if (!acceptedRequestAwareResiduals.has(row.legacy_url)) {
          failures.push(
            `${row.legacy_url}: request-aware retire route shares a published path component (${routeInfo.pathname}) and cannot guarantee deterministic 404 behavior under Model A.`
          );
        }
      }

      continue;
    }

    const htmlDescriptor = publicHtmlState.htmlRoutes.get(routeInfo.comparablePathOnly);
    const assetDescriptor = publicAssetState.assetRoutes.get(routeInfo.pathname);

    if (htmlDescriptor || assetDescriptor) {
      failures.push(
        `${row.legacy_url}: retired route still resolves to built output at ${htmlDescriptor?.relativePath ?? assetDescriptor?.relativePath}.`
      );
    }

    if (sitemapRouteSet.has(routeInfo.comparablePathOnly)) {
      failures.push(`${row.legacy_url}: retired route still appears in sitemap.xml.`);
    }
  }

  try {
    await ensureFileExists(path.join(options.publicRoot, '404.html'));
  } catch {
    failures.push(`${toRepoRelative(path.join(options.publicRoot, '404.html'))}: production 404 artifact is missing.`);
  }

  await writeAuditReport(options.reportPath, auditRows);

  console.log(`Audited ${auditRows.length} retired URL row(s) using ${toRepoRelative(options.inputPath)}.`);
  console.log(`Retired URL audit written to ${toRepoRelative(options.reportPath)}.`);

  if (failures.length > 0) {
    console.error('Retirement policy check failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Retirement policy check passed.');
}

main().catch((error) => {
  console.error(`Retirement policy check failed: ${error.message}`);
  process.exitCode = 1;
});