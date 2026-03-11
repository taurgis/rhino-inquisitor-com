import fs from 'node:fs/promises';
import path from 'node:path';

import { stringify as stringifyCsv } from 'csv-stringify/sync';

import {
  collectContentState,
  collectPublicHtmlState,
  ensureExpectedTarget,
  isGeneratedKeepRoute,
  loadManifest,
  normalizeUrlLike,
  parseCommonArgs,
  readRedirectHtml,
  repoRoot,
  resolveManifestChains,
  severityForEntry,
  sortManifestEntries,
  toRepoRelative
} from './url-validation-helpers.js';

const defaults = {
  manifestPath: path.join(repoRoot, 'migration/url-manifest.json'),
  contentRoot: path.join(repoRoot, 'src/content'),
  publicRoot: path.join(repoRoot, 'public'),
  reportPath: path.join(repoRoot, 'migration/reports/url-parity-report.csv'),
  recordsPath: path.join(repoRoot, 'migration/intermediate/records.normalized.json'),
  scope: 'full-manifest'
};

function printHelp() {
  console.log(`Usage: node scripts/migration/validate-url-parity.js [options]

Options:
  --manifest <path>      Override manifest path.
  --content-dir <path>   Override content directory (defaults to src/content).
  --public-dir <path>    Override built public directory (defaults to public).
  --records-file <path>  Override normalized records path used by selected-records scope.
  --scope <mode>         Validation scope: full-manifest or selected-records.
  --report <path>        Override CSV report path.
  --help                 Show this help message.
`);
}

function createRow(entry, actualOutcome, status, severity) {
  return {
    legacy_url: entry.legacy_url,
    disposition: entry.disposition,
    expected_target: entry.target_url ?? '',
    actual_outcome: actualOutcome,
    status,
    severity
  };
}

function summarizeRows(rows) {
  return rows.reduce(
    (summary, row) => {
      summary[row.status] = (summary[row.status] ?? 0) + 1;
      if (row.actual_outcome === 'deferred-edge-redirect') {
        summary.deferred += 1;
      }
      if (row.actual_outcome === 'scaffold-mode-skipped') {
        summary.scaffoldSkipped += 1;
      }
      if (row.status === 'fail' && row.severity === 'critical') {
        summary.criticalFailures += 1;
      }
      return summary;
    },
    { pass: 0, fail: 0, deferred: 0, scaffoldSkipped: 0, criticalFailures: 0 }
  );
}

async function main() {
  const options = parseCommonArgs(process.argv.slice(2), defaults);
  if (options.help) {
    printHelp();
    return;
  }

  const manifestEntries = await loadManifest(options.manifestPath);
  const contentState = await collectContentState(options.contentRoot);
  const publicState = await collectPublicHtmlState(options.publicRoot);
  const selectedRecords = options.scope === 'selected-records'
    ? await loadSelectedRecords(options.recordsPath)
    : [];
  const scopedManifestEntries = filterManifestEntriesForScope({
    manifestEntries,
    selectedRecords,
    contentState,
    scope: options.scope
  });
  const manifestChains = resolveManifestChains(scopedManifestEntries);
  const scaffoldMode = contentState.migrationOwnedMarkdownCount === 0;
  const rows = [];

  for (const entry of scopedManifestEntries.sort(sortManifestEntries)) {
    const severity = severityForEntry(entry);
    const legacyInfo = normalizeUrlLike(entry.legacy_url);
    const targetInfo = ensureExpectedTarget(entry);

    if (scaffoldMode) {
      rows.push(createRow(entry, 'scaffold-mode-skipped', 'pass', severity));
      continue;
    }

    if (entry.disposition === 'keep') {
      if (!targetInfo) {
        rows.push(createRow(entry, 'missing-target-url', 'fail', severity));
        continue;
      }

      const contentMatches = contentState.primaryRoutes.get(targetInfo.comparablePathOnly) ?? [];
      if (contentMatches.length === 0 && !isGeneratedKeepRoute(entry)) {
        rows.push(createRow(entry, 'missing-source-content', 'fail', severity));
        continue;
      }

      const publicDescriptor = publicState.htmlRoutes.get(targetInfo.comparablePathOnly);
      if (!publicDescriptor) {
        rows.push(createRow(entry, 'missing-public-page', 'fail', severity));
        continue;
      }

      const parsedHtml = await readRedirectHtml(publicDescriptor);
      if (parsedHtml?.isRedirectPage && entry.url_class === 'system') {
        rows.push(createRow(entry, 'generated-system-helper', 'pass', severity));
        continue;
      }

      if (parsedHtml?.isRedirectPage) {
        rows.push(createRow(entry, 'published-as-redirect', 'fail', severity));
        continue;
      }

      rows.push(createRow(entry, contentMatches.length === 0 ? 'generated-route' : 'live-page', 'pass', severity));
      continue;
    }

    if (entry.disposition === 'merge') {
      if (!targetInfo) {
        rows.push(createRow(entry, 'missing-target-url', 'fail', severity));
        continue;
      }

      const chainedEntry = manifestChains.get(targetInfo.comparable);
      if (chainedEntry && chainedEntry.legacy_url !== entry.legacy_url && chainedEntry.disposition !== 'keep') {
        rows.push(createRow(entry, 'redirect-chain', 'fail', severity));
        continue;
      }

      if (targetInfo.isHomepage && legacyInfo.comparablePathOnly !== '/') {
        rows.push(createRow(entry, 'homepage-catch-all', 'fail', severity));
        continue;
      }

      if (legacyInfo.hasQuery || entry.implementation_layer !== 'pages-static') {
        rows.push(createRow(entry, 'deferred-edge-redirect', 'pass', severity));
        continue;
      }

      const aliasDescriptor = publicState.htmlRoutes.get(legacyInfo.comparablePathOnly);
      if (!aliasDescriptor) {
        rows.push(createRow(entry, 'missing-alias-page', 'fail', severity));
        continue;
      }

      const parsedAlias = await readRedirectHtml(aliasDescriptor);
      if (!parsedAlias?.isRedirectPage || !parsedAlias.metaRefreshTarget) {
        rows.push(createRow(entry, 'missing-meta-refresh', 'fail', severity));
        continue;
      }

      const refreshTarget = normalizeUrlLike(parsedAlias.metaRefreshTarget);
      if (refreshTarget.comparable !== targetInfo.comparable) {
        rows.push(createRow(entry, 'wrong-refresh-target', 'fail', severity));
        continue;
      }

      const canonicalTarget = parsedAlias.canonicalTarget
        ? normalizeUrlLike(parsedAlias.canonicalTarget)
        : null;
      if (!canonicalTarget || canonicalTarget.comparable !== targetInfo.comparable) {
        rows.push(createRow(entry, 'wrong-canonical-target', 'fail', severity));
        continue;
      }

      rows.push(createRow(entry, 'meta-refresh', 'pass', severity));
      continue;
    }

    if (legacyInfo.hasQuery) {
      rows.push(createRow(entry, 'deferred-edge-redirect', 'pass', severity));
      continue;
    }

    const retiredDescriptor = publicState.htmlRoutes.get(legacyInfo.comparablePathOnly);
    if (retiredDescriptor) {
      rows.push(createRow(entry, 'retired-route-still-published', 'fail', severity));
      continue;
    }

    rows.push(createRow(entry, 'true-not-found', 'pass', severity));
  }

  await fs.mkdir(path.dirname(options.reportPath), { recursive: true });
  await fs.writeFile(
    options.reportPath,
    stringifyCsv(rows, {
      header: true,
      columns: ['legacy_url', 'disposition', 'expected_target', 'actual_outcome', 'status', 'severity']
    }),
    'utf8'
  );

  const summary = summarizeRows(rows);
  console.log(`URL parity report written to ${toRepoRelative(options.reportPath)}`);
  console.log(`Validation scope: ${options.scope}`);
  console.log(`Manifest entries: ${scopedManifestEntries.length}`);
  console.log(`Content directory: ${toRepoRelative(options.contentRoot)}`);
  console.log(`Public directory: ${toRepoRelative(options.publicRoot)}`);
  console.log(`Scaffold mode: ${scaffoldMode ? 'yes' : 'no'}`);
  console.log(`Pass rows: ${summary.pass}`);
  console.log(`Fail rows: ${summary.fail}`);
  console.log(`Deferred edge rows: ${summary.deferred}`);
  console.log(`Critical failures: ${summary.criticalFailures}`);

  if (scaffoldMode) {
    console.log('Scaffold mode active: route-level migration validation was skipped because no migration-owned content exists in the selected content directory.');
  }

  if (summary.criticalFailures > 0) {
    process.exitCode = 1;
  }
}

async function loadSelectedRecords(recordsPath) {
  const source = await fs.readFile(recordsPath, 'utf8');
  const parsed = JSON.parse(source);

  if (!Array.isArray(parsed)) {
    throw new Error(`Expected selected records at ${toRepoRelative(recordsPath)} to be a JSON array.`);
  }

  return parsed;
}

function filterManifestEntriesForScope({ manifestEntries, selectedRecords, contentState, scope }) {
  if (scope !== 'selected-records') {
    return manifestEntries;
  }

  const selectedLegacyUrls = new Set();
  const selectedTargetUrls = new Set();
  const selectedAliasUrls = new Set();

  for (const record of selectedRecords) {
    if (typeof record?.legacyUrl === 'string' && record.legacyUrl.trim()) {
      selectedLegacyUrls.add(normalizeUrlLike(record.legacyUrl).comparablePathOnly);
    }
    if (typeof record?.targetUrl === 'string' && record.targetUrl.trim()) {
      selectedTargetUrls.add(normalizeUrlLike(record.targetUrl).comparablePathOnly);
    }
    if (Array.isArray(record?.aliasUrls)) {
      for (const aliasUrl of record.aliasUrls) {
        if (typeof aliasUrl === 'string' && aliasUrl.trim()) {
          selectedAliasUrls.add(normalizeUrlLike(aliasUrl).comparablePathOnly);
        }
      }
    }
  }

  for (const aliasPath of contentState.aliasRoutes.keys()) {
    selectedAliasUrls.add(aliasPath);
  }

  return manifestEntries.filter((entry) => {
    const legacyInfo = normalizeUrlLike(entry.legacy_url);
    const targetInfo = entry.target_url ? normalizeUrlLike(entry.target_url) : null;

    if (entry.disposition === 'keep') {
      return targetInfo ? selectedTargetUrls.has(targetInfo.comparablePathOnly) : false;
    }

    if (entry.disposition === 'merge') {
      if (selectedAliasUrls.has(legacyInfo.comparablePathOnly)) {
        return true;
      }

      return selectedLegacyUrls.has(legacyInfo.comparablePathOnly);
    }

    return selectedLegacyUrls.has(legacyInfo.comparablePathOnly);
  });
}

await main();