import path from 'node:path';

import fs from 'node:fs/promises';

import {
  canonicalOrigin,
  collectPublicHtmlState,
  ensureExpectedTarget,
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
  reportPath: path.join(repoRoot, 'migration/reports/redirect-integrity-report.csv'),
  baseUrl: null,
  recordsPath: path.join(repoRoot, 'migration/intermediate/records.normalized.json'),
  scope: 'full-manifest'
};

function printHelp() {
  console.log(`Usage: node scripts/migration/check-redirects.js [options]

Options:
  --manifest <path>      Override manifest path.
  --public-dir <path>    Override built public directory (defaults to public).
  --records-file <path>  Override normalized records path used by selected-records scope.
  --scope <mode>         Validation scope: full-manifest or selected-records.
  --base-url <url>       Optional deployed base URL for runtime redirect checks.
  --help                 Show this help message.
`);
}

function createResult(entry, actualOutcome, status, severity) {
  return {
    legacy_url: entry.legacy_url,
    implementation_layer: entry.implementation_layer,
    expected_target: entry.target_url ?? '',
    actual_outcome: actualOutcome,
    status,
    severity
  };
}

function isRedirectStatus(statusCode) {
  return statusCode >= 301 && statusCode <= 308;
}

async function validateRuntimeRedirect(entry, targetInfo, baseUrl) {
  const requestUrl = new URL(entry.legacy_url, baseUrl).toString();
  const response = await fetch(requestUrl, { redirect: 'manual' });

  if (entry.implementation_layer === 'pages-static') {
    if (response.status !== 200) {
      return 'runtime-non-200';
    }

    const body = await response.text();
    const details = await readRedirectHtml({ absolutePath: null, relativePath: requestUrl, body });
    if (!details?.isRedirectPage || !details.metaRefreshTarget) {
      return 'runtime-missing-meta-refresh';
    }

    const refreshTarget = normalizeUrlLike(details.metaRefreshTarget);
    if (refreshTarget.comparable !== targetInfo.comparable) {
      return 'runtime-wrong-refresh-target';
    }

    const canonicalTarget = details.canonicalTarget
      ? normalizeUrlLike(details.canonicalTarget)
      : null;
    if (!canonicalTarget || canonicalTarget.comparable !== targetInfo.comparable) {
      return 'runtime-wrong-canonical-target';
    }

    return 'runtime-meta-refresh';
  }

  if (!isRedirectStatus(response.status)) {
    return 'runtime-missing-http-redirect';
  }

  const locationHeader = response.headers.get('location');
  if (!locationHeader) {
    return 'runtime-missing-location';
  }

  const locationTarget = normalizeUrlLike(new URL(locationHeader, baseUrl).toString());
  if (locationTarget.comparable !== targetInfo.comparable) {
    return 'runtime-wrong-location';
  }

  return `runtime-http-${response.status}`;
}

async function main() {
  const options = parseCommonArgs(process.argv.slice(2), defaults);
  if (options.help) {
    printHelp();
    return;
  }

  const manifestEntries = await loadManifest(options.manifestPath);
  const publicState = await collectPublicHtmlState(options.publicRoot);
  const selectedRecords = options.scope === 'selected-records'
    ? await loadSelectedRecords(options.recordsPath)
    : [];
  const scopedManifestEntries = filterMergeEntriesForScope({ manifestEntries, selectedRecords, publicState, scope: options.scope });
  const manifestChains = resolveManifestChains(scopedManifestEntries);
  const results = [];

  for (const entry of scopedManifestEntries.sort(sortManifestEntries)) {
    const severity = severityForEntry(entry);
    const legacyInfo = normalizeUrlLike(entry.legacy_url);
    const targetInfo = ensureExpectedTarget(entry);

    if (!targetInfo) {
      results.push(createResult(entry, 'missing-target-url', 'fail', severity));
      continue;
    }

    const chainedEntry = manifestChains.get(targetInfo.comparable);
    if (chainedEntry && chainedEntry.legacy_url !== entry.legacy_url && chainedEntry.disposition !== 'keep') {
      results.push(createResult(entry, 'redirect-chain', 'fail', severity));
      continue;
    }

    if (targetInfo.isHomepage && legacyInfo.comparablePathOnly !== '/') {
      results.push(createResult(entry, 'homepage-catch-all', 'fail', severity));
      continue;
    }

    if (legacyInfo.hasQuery) {
      results.push(createResult(entry, 'deferred-edge-redirect', 'pass', severity));
      continue;
    }

    if (options.baseUrl) {
      const runtimeOutcome = await validateRuntimeRedirect(entry, targetInfo, options.baseUrl);
      const status = runtimeOutcome === 'runtime-meta-refresh' || runtimeOutcome.startsWith('runtime-http-')
        ? 'pass'
        : 'fail';
      results.push(createResult(entry, runtimeOutcome, status, severity));
      continue;
    }

    if (legacyInfo.hasQuery || entry.implementation_layer !== 'pages-static') {
      results.push(createResult(entry, 'deferred-edge-redirect', 'pass', severity));
      continue;
    }

    const aliasDescriptor = publicState.htmlRoutes.get(legacyInfo.comparablePathOnly);
    if (!aliasDescriptor) {
      results.push(createResult(entry, 'missing-alias-page', 'fail', severity));
      continue;
    }

    const parsedAlias = await readRedirectHtml(aliasDescriptor);
    if (!parsedAlias?.isRedirectPage || !parsedAlias.metaRefreshTarget) {
      results.push(createResult(entry, 'missing-meta-refresh', 'fail', severity));
      continue;
    }

    const refreshTarget = normalizeUrlLike(parsedAlias.metaRefreshTarget);
    if (refreshTarget.comparable !== targetInfo.comparable) {
      results.push(createResult(entry, 'wrong-refresh-target', 'fail', severity));
      continue;
    }

    const canonicalTarget = parsedAlias.canonicalTarget
      ? normalizeUrlLike(parsedAlias.canonicalTarget)
      : null;
    if (!canonicalTarget || canonicalTarget.comparable !== targetInfo.comparable) {
      results.push(createResult(entry, 'wrong-canonical-target', 'fail', severity));
      continue;
    }

    results.push(createResult(entry, 'meta-refresh', 'pass', severity));
  }

  const criticalFailures = results.filter((result) => result.status === 'fail' && result.severity === 'critical');
  const deferredCount = results.filter((result) => result.actual_outcome === 'deferred-edge-redirect').length;

  console.log(`Redirect integrity checked for ${results.length} merge URL(s).`);
  console.log(`Validation scope: ${options.scope}`);
  console.log(`Public directory: ${toRepoRelative(options.publicRoot)}`);
  if (options.baseUrl) {
    console.log(`Runtime base URL: ${new URL(options.baseUrl, canonicalOrigin).toString()}`);
  }
  console.log(`Deferred edge rows: ${deferredCount}`);
  console.log(`Critical failures: ${criticalFailures.length}`);

  if (results.some((result) => result.status === 'fail')) {
    console.log('Redirect integrity details:');
    for (const result of results.filter((candidate) => candidate.status === 'fail')) {
      console.log(`- ${result.legacy_url} [${result.actual_outcome}] (${result.severity})`);
    }
  }

  if (criticalFailures.length > 0) {
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

function filterMergeEntriesForScope({ manifestEntries, selectedRecords, publicState, scope }) {
  const mergeEntries = manifestEntries.filter((candidate) => candidate.disposition === 'merge');

  if (scope !== 'selected-records') {
    return mergeEntries;
  }

  const selectedLegacyUrls = new Set();
  const selectedAliasUrls = new Set(publicState.htmlRoutes.keys());

  for (const record of selectedRecords) {
    if (typeof record?.legacyUrl === 'string' && record.legacyUrl.trim()) {
      selectedLegacyUrls.add(normalizeUrlLike(record.legacyUrl).comparablePathOnly);
    }
    if (Array.isArray(record?.aliasUrls)) {
      for (const aliasUrl of record.aliasUrls) {
        if (typeof aliasUrl === 'string' && aliasUrl.trim()) {
          selectedAliasUrls.add(normalizeUrlLike(aliasUrl).comparablePathOnly);
        }
      }
    }
  }

  return mergeEntries.filter((entry) => {
    const legacyInfo = normalizeUrlLike(entry.legacy_url);
    return selectedAliasUrls.has(legacyInfo.comparablePathOnly) || selectedLegacyUrls.has(legacyInfo.comparablePathOnly);
  });
}

await main();