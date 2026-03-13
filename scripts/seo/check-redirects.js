import fs from 'node:fs/promises';
import path from 'node:path';

import { stringify as stringifyCsv } from 'csv-stringify/sync';

import {
  collectPublicHtmlState,
  loadManifest,
  matchesExpectedMergeTarget,
  normalizeUrlLike,
  parseCommonArgs,
  readRedirectHtml,
  repoRoot,
  severityForEntry,
  sortManifestEntries,
  toRepoRelative
} from '../migration/url-validation-helpers.js';

const defaults = {
  manifestPath: path.join(repoRoot, 'migration/url-manifest.json'),
  publicRoot: path.join(repoRoot, 'public'),
  reportPath: path.join(repoRoot, 'migration/reports/phase-5-redirect-validation.csv'),
  matrixPath: path.join(repoRoot, 'migration/phase-5-redirect-signal-matrix.csv')
};

function printHelp() {
  console.log(`Usage: node scripts/seo/check-redirects.js [options]

Options:
  --manifest <path>    Override manifest path.
  --public-dir <path>  Override built public directory (defaults to public).
  --report <path>      Override validation CSV path.
  --matrix <path>      Override redirect signal matrix CSV path.
  --help               Show this help message.
`);
}

function normalizeRedirectCode(value, fallback) {
  if (value == null) {
    return fallback;
  }

  return String(value);
}

function deriveImplementation(entry, legacyInfo) {
  if (entry.disposition === 'keep') {
    return {
      implementationLayer: 'none',
      redirectCode: 'none',
      layerRationale: 'Exact route preserved; no redirect required.'
    };
  }

  if (entry.disposition === 'retire') {
    if (legacyInfo.hasQuery) {
      return {
        implementationLayer: 'edge-cdn',
        redirectCode: 'none',
        layerRationale: 'Query-string retire routes require request-aware edge handling to enforce explicit not-found behavior.'
      };
    }

    return {
      implementationLayer: 'none',
      redirectCode: 'none',
      layerRationale: 'Path-based retire routes resolve through normal 404 handling because no artifact is published at the legacy path.'
    };
  }

  if (legacyInfo.hasQuery) {
    return {
      implementationLayer: 'edge-cdn',
      redirectCode: normalizeRedirectCode(entry.redirect_code, '301'),
      layerRationale: 'Query-string legacy URLs cannot be represented as Hugo alias files; request-aware edge redirects are required.'
    };
  }

  if (entry.implementation_layer === 'dns') {
    return {
      implementationLayer: 'dns',
      redirectCode: normalizeRedirectCode(entry.redirect_code, '308'),
      layerRationale: 'Host or protocol consolidation is handled outside the Pages artifact at the DNS or host-routing layer.'
    };
  }

  if (entry.implementation_layer === 'edge-cdn') {
    return {
      implementationLayer: 'edge-cdn',
      redirectCode: normalizeRedirectCode(entry.redirect_code, '301'),
      layerRationale: 'Manifest assigns this moved path to an edge redirect layer rather than Hugo alias output.'
    };
  }

  if (entry.implementation_layer === 'pages-static') {
    return {
      implementationLayer: 'pages-static',
      redirectCode: 'meta-refresh',
      layerRationale: 'Static path redirect is represented by a Hugo alias helper page in the Pages artifact.'
    };
  }

  return {
    implementationLayer: entry.implementation_layer,
    redirectCode: normalizeRedirectCode(entry.redirect_code, 'none'),
    layerRationale: 'Implementation layer comes directly from the manifest entry.'
  };
}

function resolveRedirectGraph(entry, manifestRouteMap) {
  if (entry.disposition !== 'merge' || !entry.target_url) {
    return {
      chainCount: 0,
      loopDetected: false,
      finalTargetUrl: entry.target_url ?? ''
    };
  }

  const visited = new Set([normalizeUrlLike(entry.legacy_url).comparable]);
  let currentTarget = normalizeUrlLike(entry.target_url);
  let chainCount = 0;

  while (true) {
    const nextEntry = manifestRouteMap.get(currentTarget.comparable);
    if (!nextEntry) {
      return {
        chainCount,
        loopDetected: false,
        finalTargetUrl: currentTarget.absolute
      };
    }

    const nextComparable = normalizeUrlLike(nextEntry.legacy_url).comparable;
    if (visited.has(nextComparable)) {
      return {
        chainCount,
        loopDetected: true,
        finalTargetUrl: currentTarget.absolute
      };
    }

    if (nextEntry.disposition !== 'merge' || !nextEntry.target_url) {
      return {
        chainCount,
        loopDetected: false,
        finalTargetUrl: nextEntry.target_url ?? nextEntry.legacy_url
      };
    }

    visited.add(nextComparable);
    chainCount += 1;
    currentTarget = normalizeUrlLike(nextEntry.target_url);
  }
}

function createMatrixRow(entry, details) {
  return {
    legacy_url: entry.legacy_url,
    disposition: entry.disposition,
    target_url: entry.target_url ?? 'null',
    redirect_code: details.redirectCode,
    implementation_layer: details.implementationLayer,
    chain_count: details.chainCount,
    loop_detected: details.loopDetected,
    broad_redirect_risk: details.broadRedirectRisk,
    manifest_redirect_code: entry.redirect_code == null ? 'null' : String(entry.redirect_code),
    manifest_implementation_layer: entry.implementation_layer,
    layer_rationale: details.layerRationale
  };
}

function createValidationRow(entry, details) {
  return {
    legacy_url: entry.legacy_url,
    disposition: entry.disposition,
    target_url: entry.target_url ?? 'null',
    redirect_code: details.redirectCode,
    implementation_layer: details.implementationLayer,
    chain_count: details.chainCount,
    loop_detected: details.loopDetected,
    broad_redirect_risk: details.broadRedirectRisk,
    actual_outcome: details.actualOutcome,
    status: details.status,
    severity: details.severity,
    notes: details.notes
  };
}

function summarizeValidation(rows) {
  return rows.reduce(
    (summary, row) => {
      summary.total += 1;
      summary[row.status] += 1;
      if (row.loop_detected === 'true') {
        summary.loops += 1;
      }
      if (Number(row.chain_count) > 0) {
        summary.chains += 1;
      }
      if (row.broad_redirect_risk === 'true') {
        summary.broadRedirects += 1;
      }
      return summary;
    },
    { total: 0, pass: 0, fail: 0, loops: 0, chains: 0, broadRedirects: 0 }
  );
}

async function writeCsv(filePath, rows, columns) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(
    filePath,
    stringifyCsv(rows, {
      header: true,
      columns
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

  const manifestEntries = await loadManifest(options.manifestPath);
  const publicState = await collectPublicHtmlState(options.publicRoot);
  const manifestRouteMap = new Map(
    manifestEntries.map((entry) => [normalizeUrlLike(entry.legacy_url).comparable, entry])
  );
  const aliasCache = new Map();
  const matrixRows = [];
  const validationRows = [];

  const indexedUrls = manifestEntries.filter(
    (entry) => entry.disposition === 'keep' || entry.has_organic_traffic
  ).length;
  const changedIndexedUrls = manifestEntries.filter(
    (entry) => entry.disposition !== 'keep' && entry.has_organic_traffic
  ).length;
  const changeRate = indexedUrls === 0 ? 0 : Number(((changedIndexedUrls / indexedUrls) * 100).toFixed(2));

  for (const entry of manifestEntries.sort(sortManifestEntries)) {
    const legacyInfo = normalizeUrlLike(entry.legacy_url);
    const targetInfo = entry.target_url ? normalizeUrlLike(entry.target_url) : null;
    const redirectGraph = resolveRedirectGraph(entry, manifestRouteMap);
    const implementation = deriveImplementation(entry, legacyInfo);
    const broadRedirectRisk = entry.disposition === 'merge'
      && Boolean(targetInfo)
      && targetInfo.isHomepage
      && legacyInfo.comparablePathOnly !== '/';

    const baseDetails = {
      redirectCode: implementation.redirectCode,
      implementationLayer: implementation.implementationLayer,
      chainCount: String(redirectGraph.chainCount),
      loopDetected: redirectGraph.loopDetected ? 'true' : 'false',
      broadRedirectRisk: broadRedirectRisk ? 'true' : 'false',
      layerRationale: implementation.layerRationale
    };

    matrixRows.push(createMatrixRow(entry, baseDetails));

    if (entry.disposition === 'keep') {
      continue;
    }

    const severity = severityForEntry(entry);
    const validation = {
      ...baseDetails,
      severity,
      status: 'pass',
      actualOutcome: 'validated',
      notes: ''
    };

    if (entry.disposition === 'merge' && !targetInfo) {
      validation.status = 'fail';
      validation.actualOutcome = 'missing-target-url';
      validation.notes = 'Merge URL must define a non-null target_url.';
      validationRows.push(createValidationRow(entry, validation));
      continue;
    }

    if (redirectGraph.loopDetected) {
      validation.status = 'fail';
      validation.actualOutcome = 'redirect-loop';
      validation.notes = `Redirect graph loops before reaching a final destination. Last resolved target: ${redirectGraph.finalTargetUrl}`;
      validationRows.push(createValidationRow(entry, validation));
      continue;
    }

    if (redirectGraph.chainCount > 0) {
      validation.status = 'fail';
      validation.actualOutcome = 'redirect-chain';
      validation.notes = `Legacy URL resolves through ${redirectGraph.chainCount} additional manifest hop(s) before the final destination.`;
      validationRows.push(createValidationRow(entry, validation));
      continue;
    }

    if (broadRedirectRisk) {
      validation.status = 'fail';
      validation.actualOutcome = 'homepage-catch-all';
      validation.notes = 'Homepage redirect for a non-homepage legacy URL is a broad irrelevant redirect risk.';
      validationRows.push(createValidationRow(entry, validation));
      continue;
    }

    if (entry.disposition === 'merge') {
      if (implementation.implementationLayer === 'pages-static') {
        const aliasDescriptor = publicState.htmlRoutes.get(legacyInfo.comparablePathOnly);
        if (!aliasDescriptor) {
          validation.status = 'fail';
          validation.actualOutcome = 'missing-alias-page';
          validation.notes = 'Expected a Hugo alias helper page in public/ for this path-based merge URL.';
          validationRows.push(createValidationRow(entry, validation));
          continue;
        }

        let parsedAlias = aliasCache.get(aliasDescriptor.relativePath);
        if (!parsedAlias) {
          parsedAlias = await readRedirectHtml(aliasDescriptor);
          aliasCache.set(aliasDescriptor.relativePath, parsedAlias);
        }

        if (!parsedAlias?.isRedirectPage || !parsedAlias.metaRefreshTarget) {
          validation.status = 'fail';
          validation.actualOutcome = 'missing-meta-refresh';
          validation.notes = 'Alias helper page exists but does not expose an instant meta refresh redirect target.';
          validationRows.push(createValidationRow(entry, validation));
          continue;
        }

        const refreshTarget = normalizeUrlLike(parsedAlias.metaRefreshTarget);
        if (!matchesExpectedMergeTarget(entry, refreshTarget, targetInfo)) {
          validation.status = 'fail';
          validation.actualOutcome = 'wrong-refresh-target';
          validation.notes = `Alias helper redirects to ${parsedAlias.metaRefreshTarget} instead of ${entry.target_url}.`;
          validationRows.push(createValidationRow(entry, validation));
          continue;
        }

        const canonicalTarget = parsedAlias.canonicalTarget
          ? normalizeUrlLike(parsedAlias.canonicalTarget)
          : null;
        if (!canonicalTarget || !matchesExpectedMergeTarget(entry, canonicalTarget, targetInfo)) {
          validation.status = 'fail';
          validation.actualOutcome = 'wrong-canonical-target';
          validation.notes = 'Alias helper canonical target does not match the approved final destination.';
          validationRows.push(createValidationRow(entry, validation));
          continue;
        }

        validation.actualOutcome = 'meta-refresh';
        validation.notes = `Alias helper verified at ${aliasDescriptor.relativePath}.`;
        validationRows.push(createValidationRow(entry, validation));
        continue;
      }

      if (implementation.implementationLayer === 'edge-cdn') {
        validation.actualOutcome = legacyInfo.hasQuery ? 'documented-edge-query-redirect' : 'documented-edge-redirect';
        validation.notes = implementation.layerRationale;
        validationRows.push(createValidationRow(entry, validation));
        continue;
      }

      if (implementation.implementationLayer === 'dns') {
        validation.actualOutcome = 'documented-dns-redirect';
        validation.notes = implementation.layerRationale;
        validationRows.push(createValidationRow(entry, validation));
        continue;
      }

      validation.status = 'fail';
      validation.actualOutcome = 'undocumented-redirect-layer';
      validation.notes = 'Merge URL does not resolve to a supported implementation layer.';
      validationRows.push(createValidationRow(entry, validation));
      continue;
    }

    if (entry.target_url != null) {
      validation.status = 'fail';
      validation.actualOutcome = 'retire-has-target-url';
      validation.notes = 'Retire URLs must not carry a live target_url. Use null and explicit not-found behavior.';
      validationRows.push(createValidationRow(entry, validation));
      continue;
    }

    if (implementation.implementationLayer === 'edge-cdn') {
      validation.actualOutcome = 'documented-edge-not-found';
      validation.notes = implementation.layerRationale;
      validationRows.push(createValidationRow(entry, validation));
      continue;
    }

    const retiredDescriptor = publicState.htmlRoutes.get(legacyInfo.comparablePathOnly);
    if (retiredDescriptor) {
      validation.status = 'fail';
      validation.actualOutcome = 'retired-route-still-published';
      validation.notes = `Retired path still resolves to generated output at ${retiredDescriptor.relativePath}.`;
      validationRows.push(createValidationRow(entry, validation));
      continue;
    }

    validation.actualOutcome = 'true-not-found';
    validation.notes = 'No generated HTML artifact exists at the retired legacy path.';
    validationRows.push(createValidationRow(entry, validation));
  }

  await writeCsv(options.matrixPath, matrixRows, [
    'legacy_url',
    'disposition',
    'target_url',
    'redirect_code',
    'implementation_layer',
    'chain_count',
    'loop_detected',
    'broad_redirect_risk',
    'manifest_redirect_code',
    'manifest_implementation_layer',
    'layer_rationale'
  ]);
  await writeCsv(options.reportPath, validationRows, [
    'legacy_url',
    'disposition',
    'target_url',
    'redirect_code',
    'implementation_layer',
    'chain_count',
    'loop_detected',
    'broad_redirect_risk',
    'actual_outcome',
    'status',
    'severity',
    'notes'
  ]);

  const summary = summarizeValidation(validationRows);
  console.log(`Redirect signal matrix written to ${toRepoRelative(options.matrixPath)}`);
  console.log(`Redirect validation report written to ${toRepoRelative(options.reportPath)}`);
  console.log(`Checked redirect rows: ${summary.total}`);
  console.log(`Pass rows: ${summary.pass}`);
  console.log(`Fail rows: ${summary.fail}`);
  console.log(`Chain defects: ${summary.chains}`);
  console.log(`Loop defects: ${summary.loops}`);
  console.log(`Broad redirect defects: ${summary.broadRedirects}`);
  console.log(`Indexed URL change rate: ${changeRate}% (${changedIndexedUrls}/${indexedUrls || 0})`);
  if (changeRate > 5) {
    console.log(
      'Phase 5 baseline would require an edge redirect layer because the URL change rate exceeds 5%, but RHI-062 records an owner-approved Model A exception for launch.'
    );
  }

  if (summary.fail > 0) {
    console.log('Redirect validation failures:');
    for (const row of validationRows.filter((candidate) => candidate.status === 'fail')) {
      console.log(`- ${row.legacy_url} [${row.actual_outcome}] ${row.notes}`);
    }
    process.exitCode = 1;
  }
}

function parseArgs(argv) {
  const options = parseCommonArgs(argv, defaults);
  options.matrixPath = defaults.matrixPath;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case '--matrix':
        options.matrixPath = path.resolve(argv[++index]);
        break;
      case '--help':
        options.help = true;
        break;
      case '--manifest':
      case '--public-dir':
      case '--report':
        index += 1;
        break;
      default:
        if (arg.startsWith('--')) {
          throw new Error(`Unknown argument: ${arg}`);
        }
        break;
    }
  }

  return options;
}

await main();