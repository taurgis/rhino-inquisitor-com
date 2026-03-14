import fs from 'node:fs/promises';
import path from 'node:path';

import { parse as parseCsv } from 'csv-parse/sync';
import { stringify as stringifyCsv } from 'csv-stringify/sync';
import { XMLParser } from 'fast-xml-parser';

import {
  collectContentState,
  collectPublicAssetState,
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
  sitemapPath: path.join(repoRoot, 'public/sitemap.xml'),
  reportPath: path.join(repoRoot, 'migration/reports/phase-6-coverage.csv')
};

const acceptedRequestAwareResiduals = new Map([
  [
    '/?s=ocapi',
    'Owner accepted on 2026-03-14: the legacy WordPress search query route still resolves to the homepage under Model A because GitHub Pages serves the published / path.'
  ]
]);

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  trimValues: true
});

function parseArgs(argv) {
  const options = { ...defaults, ci: false, help: false };

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
      options.sitemapPath = path.join(options.publicRoot, 'sitemap.xml');
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
  console.log(`Usage: node scripts/phase-6/generate-coverage-report.js [options]

Options:
  --input <path>        Override the reviewed URL map path.
  --content-dir <path>  Override the Hugo content directory.
  --public-dir <path>   Override the built public directory.
  --sitemap <path>      Override the sitemap entry path.
  --report <path>       Override the coverage CSV path.
  --ci                  Keep output concise for CI.
  --help                Show this help message.
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

function normalizeSitemapRoute(urlValue) {
  return normalizeUrlLike(new URL(urlValue).pathname).comparablePathOnly;
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
    if (typeof node?.loc === 'string' && node.loc.trim().length > 0) {
      urls.push(node.loc.trim());
    }
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
      columns: [
        'legacy_url',
        'route_class',
        'disposition',
        'target_url',
        'outcome_verified',
        'http_status',
        'notes'
      ]
    }),
    'utf8'
  );
}

function formatDisposition(value) {
  return value === 'merge' ? 'redirect' : value;
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

function createRow(row, outcomeVerified, httpStatus, notes) {
  return {
    legacy_url: row.legacy_url,
    route_class: row.route_class,
    disposition: formatDisposition(row.disposition),
    target_url: row.target_url,
    outcome_verified: outcomeVerified ? 'yes' : 'no',
    http_status: httpStatus,
    notes
  };
}

function determineQueryBehavior(routeInfo, publicHtmlState, publicAssetState) {
  if (!routeInfo.hasQuery) {
    return 'path-based';
  }

  const htmlDescriptor = findHtmlDescriptor(routeInfo, publicHtmlState);
  const assetDescriptor = findAssetDescriptor(routeInfo, publicAssetState);

  if (htmlDescriptor || assetDescriptor) {
    return 'request-aware-limitation';
  }

  return 'query-path-not-published';
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
  const sitemapRouteSet = new Set(sitemapEntries.map((entry) => normalizeSitemapRoute(entry)));
  const aliasCache = new Map();
  const reportRows = [];
  const failures = [];

  for (const row of rows) {
    const legacyInfo = normalizeUrlLike(row.legacy_url);
    const targetInfo = row.target_url ? normalizeUrlLike(row.target_url) : null;
    const legacyAliasOwners = contentState.aliasRoutes.get(legacyInfo.comparablePathOnly) ?? [];

    if (row.disposition === 'keep') {
      if (!targetInfo) {
        const reportRow = createRow(row, false, '', 'Keep route is missing a target_url value.');
        reportRows.push(reportRow);
        failures.push(`${row.legacy_url}: keep route is missing a target_url value.`);
        continue;
      }

      const targetDescriptor = findPublishedTarget(targetInfo, publicHtmlState, publicAssetState);
      if (!targetDescriptor) {
        const reportRow = createRow(row, false, '', `Keep target is not published in the production artifact (${row.target_url}).`);
        reportRows.push(reportRow);
        failures.push(`${row.legacy_url}: keep target is not published (${row.target_url}).`);
        continue;
      }

      const note = targetDescriptor.type === 'asset'
        ? `Published keep asset verified at ${targetDescriptor.descriptor.relativePath}.`
        : `Published keep route verified at ${targetDescriptor.descriptor.relativePath}.`;
      reportRows.push(createRow(row, true, '200', note));
      continue;
    }

    if (row.disposition === 'merge') {
      if (!targetInfo) {
        const reportRow = createRow(row, false, '', 'Redirect route is missing a target_url value.');
        reportRows.push(reportRow);
        failures.push(`${row.legacy_url}: redirect route is missing a target_url value.`);
        continue;
      }

      if (row.implementation_layer === 'pages-static') {
        const descriptor = findHtmlDescriptor(legacyInfo, publicHtmlState);
        if (!descriptor) {
          const reportRow = createRow(row, false, '', 'Expected a built alias helper page for this pages-static redirect record.');
          reportRows.push(reportRow);
          failures.push(`${row.legacy_url}: missing alias helper page.`);
          continue;
        }

        let parsedAlias = aliasCache.get(descriptor.relativePath);
        if (!parsedAlias) {
          parsedAlias = await readRedirectHtml(descriptor);
          aliasCache.set(descriptor.relativePath, parsedAlias);
        }

        if (!parsedAlias?.isRedirectPage || !parsedAlias.metaRefreshTarget || !parsedAlias.canonicalTarget) {
          const reportRow = createRow(row, false, '', 'Alias helper page is missing redirect or canonical metadata.');
          reportRows.push(reportRow);
          failures.push(`${row.legacy_url}: alias helper metadata is incomplete.`);
          continue;
        }

        const refreshTarget = normalizeUrlLike(parsedAlias.metaRefreshTarget);
        const canonicalTarget = normalizeUrlLike(parsedAlias.canonicalTarget);
        if (!matchesExpectedMergeTarget(row, refreshTarget, targetInfo) || !matchesExpectedMergeTarget(row, canonicalTarget, targetInfo)) {
          const reportRow = createRow(row, false, '', `Alias helper does not resolve to the approved target (${row.target_url}).`);
          reportRows.push(reportRow);
          failures.push(`${row.legacy_url}: alias helper points to the wrong target.`);
          continue;
        }

        const resolvedTarget = findPublishedTarget(refreshTarget, publicHtmlState, publicAssetState);
        if (!resolvedTarget) {
          const reportRow = createRow(row, false, '', `Alias helper target is not published in the production artifact (${refreshTarget.serverRelative}).`);
          reportRows.push(reportRow);
          failures.push(`${row.legacy_url}: alias helper target is not published.`);
          continue;
        }

        const note = resolvedTarget.type === 'asset'
          ? `Alias helper verified at ${descriptor.relativePath}; final target published as static asset ${resolvedTarget.descriptor.relativePath}.`
          : `Alias helper verified at ${descriptor.relativePath}; final target published at ${resolvedTarget.descriptor.relativePath}.`;
        reportRows.push(createRow(row, true, '200', note));
        continue;
      }

      const targetDescriptor = findPublishedTarget(targetInfo, publicHtmlState, publicAssetState);
      if (!legacyInfo.hasQuery) {
        const reportRow = createRow(
          row,
          false,
          '',
          'Redirect route is not backed by a pages-static helper and cannot be verified from the production artifact.'
        );
        reportRows.push(reportRow);
        failures.push(`${row.legacy_url}: unsupported redirect verification path.`);
        continue;
      }

      if (!targetDescriptor) {
        const reportRow = createRow(row, false, '', `Model A query-string redirect target is not published (${row.target_url}).`);
        reportRows.push(reportRow);
        failures.push(`${row.legacy_url}: query-string redirect target is not published.`);
        continue;
      }

      if (!String(row.notes ?? '').includes('accepted RHI-062 query-string limitation under Model A')) {
        const reportRow = createRow(row, false, '', 'Query-string redirect row is missing the approved Model A exception note.');
        reportRows.push(reportRow);
        failures.push(`${row.legacy_url}: missing approved Model A exception note.`);
        continue;
      }

      const note = targetDescriptor.type === 'asset'
        ? `Policy-verified Model A query-string redirect; source is not served by Hugo aliases at launch and the approved target asset ${targetDescriptor.descriptor.relativePath} exists.`
        : `Policy-verified Model A query-string redirect; source is not served by Hugo aliases at launch and the approved target ${targetDescriptor.descriptor.relativePath} exists.`;
      reportRows.push(createRow(row, true, '', note));
      continue;
    }

    const queryBehavior = determineQueryBehavior(legacyInfo, publicHtmlState, publicAssetState);
    if (legacyAliasOwners.length > 0) {
      const reportRow = createRow(row, false, '', `Retired route is still present as a Hugo alias in ${legacyAliasOwners.map((entry) => entry.relativePath).join(', ')}.`);
      reportRows.push(reportRow);
      failures.push(`${row.legacy_url}: retired route is still configured as an alias.`);
      continue;
    }

    if (legacyInfo.hasQuery) {
      if (queryBehavior === 'request-aware-limitation') {
        if (!acceptedRequestAwareResiduals.has(row.legacy_url)) {
          const reportRow = createRow(
            row,
            false,
            '',
            'Request-aware retire route shares a published path component and is not in the accepted Model A residual list.'
          );
          reportRows.push(reportRow);
          failures.push(`${row.legacy_url}: unapproved request-aware retire residual.`);
          continue;
        }

        reportRows.push(createRow(row, true, '200', acceptedRequestAwareResiduals.get(row.legacy_url)));
        continue;
      }

      if (sitemapRouteSet.has(legacyInfo.comparablePathOnly)) {
        const reportRow = createRow(row, false, '', 'Retired query-path route still appears in sitemap.xml.');
        reportRows.push(reportRow);
        failures.push(`${row.legacy_url}: retired query path still appears in sitemap.xml.`);
        continue;
      }

      reportRows.push(
        createRow(
          row,
          true,
          '404',
          'Policy-verified Model A retire route; the underlying path is not published in the production artifact, so the query variant falls through to not-found.'
        )
      );
      continue;
    }

    const legacyDescriptor = findPublishedTarget(legacyInfo, publicHtmlState, publicAssetState);
    if (legacyDescriptor) {
      const reportRow = createRow(
        row,
        false,
        '',
        `Retired route still resolves to built output at ${legacyDescriptor.descriptor.relativePath}.`
      );
      reportRows.push(reportRow);
      failures.push(`${row.legacy_url}: retired route still resolves to built output.`);
      continue;
    }

    if (sitemapRouteSet.has(legacyInfo.comparablePathOnly)) {
      const reportRow = createRow(row, false, '', 'Retired route still appears in sitemap.xml.');
      reportRows.push(reportRow);
      failures.push(`${row.legacy_url}: retired route still appears in sitemap.xml.`);
      continue;
    }

    reportRows.push(createRow(row, true, '404', 'Retire route verified: no published artifact, alias, or sitemap entry remains.'));
  }

  await writeReport(options.reportPath, reportRows);

  const verifiedCount = reportRows.filter((row) => row.outcome_verified === 'yes').length;
  const coveragePercentage = Number(((verifiedCount / reportRows.length) * 100).toFixed(2));
  const breakdown = reportRows.reduce((summary, row) => {
    summary[row.disposition] = (summary[row.disposition] ?? 0) + 1;
    return summary;
  }, {});

  console.log(`Reviewed ${reportRows.length} URL outcome row(s) from ${toRepoRelative(options.inputPath)}.`);
  console.log(`Coverage report written to ${toRepoRelative(options.reportPath)}.`);
  console.log(`Verified outcomes: ${verifiedCount}/${reportRows.length} (${coveragePercentage}%).`);
  console.log(`Disposition breakdown: ${Object.entries(breakdown).map(([key, value]) => `${key}=${value}`).join(', ')}`);

  if (failures.length > 0) {
    if (!options.ci) {
      console.error('Coverage verification failed:');
      for (const failure of failures) {
        console.error(`- ${failure}`);
      }
    }
    process.exitCode = 1;
    return;
  }

  console.log('Coverage verification passed.');
}

await main();