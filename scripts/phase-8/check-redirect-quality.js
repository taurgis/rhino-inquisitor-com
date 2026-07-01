import fs from 'node:fs/promises';

import {
  evaluateDatasetEntry,
  isGenericFallbackTarget,
  isNonHtmlEntry,
  loadValidationContext,
  normalizeUrlLike,
  parsePhase8Args,
  phase8Defaults,
  printCommonHelp,
  writeJsonReport
} from './url-gate-helpers.js';
import { toRepoRelative } from '../url/url-validation-helpers.js';

const defaults = {
  datasetPath: phase8Defaults.datasetPath,
  priorityRoutesPath: phase8Defaults.priorityRoutesPath,
  publicRoot: phase8Defaults.publicRoot,
  reportPath: phase8Defaults.redirectQualityReportPath
};

const retentionPolicySources = [
  'docs/publishing/redirect-retention-policy.md'
];

function analyzeRedirectTrace(sourcePath, redirectEdges) {
  let current = sourcePath;
  const visited = new Set([sourcePath]);
  const trace = [sourcePath];
  let hopCount = 0;
  let loopDetected = false;

  while (redirectEdges.has(current)) {
    const next = redirectEdges.get(current);
    hopCount += 1;
    trace.push(next);

    if (visited.has(next)) {
      loopDetected = true;
      break;
    }

    visited.add(next);
    current = next;
  }

  return {
    hopCount,
    loopDetected,
    chainDetected: !loopDetected && hopCount > 1,
    trace,
    finalTarget: trace[trace.length - 1]
  };
}

function summarizeRedirects(redirects, priorityRouteChecks, nonHtmlCoverage) {
  return {
    totalRedirectEntries: redirects.length,
    blockingRedirectEntries: redirects.filter((entry) => entry.scope === 'blocking').length,
    acceptedRiskRedirectEntries: redirects.filter((entry) => entry.scope === 'accepted-risk').length,
    failCount: redirects.filter((entry) => entry.result === 'fail').length,
    blockingFailures: redirects.filter((entry) => entry.blocking && entry.result === 'fail').length,
    chainCount: redirects.filter((entry) => entry.chainDetected).length,
    loopCount: redirects.filter((entry) => entry.loopDetected).length,
    homepageCatchAllCount: redirects.filter((entry) => entry.homepageCatchAll).length,
    genericFallbackCount: redirects.filter((entry) => entry.genericFallback).length,
    priorityRouteCount: priorityRouteChecks.length,
    priorityRouteFailures: priorityRouteChecks.filter((entry) => entry.result === 'fail').length,
    nonHtmlCoverageCount: nonHtmlCoverage.length,
    nonHtmlBlockingFailures: nonHtmlCoverage.filter((entry) => entry.blocking && entry.result === 'fail').length
  };
}

async function confirmRetentionPolicy() {
  for (const relativePath of retentionPolicySources) {
    await fs.access(relativePath);
  }

  return {
    status: 'documented',
    minimumDuration: 'at least 12 months',
    sources: retentionPolicySources,
    notes: 'Phase 8 carries the documented redirect-retention expectation forward as policy evidence under the committed Model A launch posture.'
  };
}

async function main() {
  const options = parsePhase8Args(process.argv.slice(2), defaults);
  if (options.help) {
    printCommonHelp('scripts/phase-8/check-redirect-quality.js', { includePriorityRoutes: true });
    return;
  }

  const context = await loadValidationContext({
    datasetPath: options.datasetPath,
    priorityRoutesPath: options.priorityRoutesPath,
    publicRoot: options.publicRoot,
    includePriorityRoutes: true
  });
  const evaluationsByLegacyUrl = new Map();

  for (const entry of context.expectedOutcomes.entries) {
    evaluationsByLegacyUrl.set(entry.legacy_url, await evaluateDatasetEntry(entry, context));
  }

  const redirectEdges = new Map();
  for (const entry of context.expectedOutcomes.entries) {
    const evaluation = evaluationsByLegacyUrl.get(entry.legacy_url);
    if (entry.disposition !== 'merge' || evaluation.mode !== 'alias-helper' || !evaluation.actualRedirectTarget) {
      continue;
    }

    redirectEdges.set(normalizeUrlLike(entry.legacy_url).comparablePathOnly, normalizeUrlLike(evaluation.actualRedirectTarget).comparablePathOnly);
  }

  const redirects = [];
  for (const entry of context.expectedOutcomes.entries.filter((item) => item.disposition === 'merge')) {
    const evaluation = evaluationsByLegacyUrl.get(entry.legacy_url);
    const legacyInfo = normalizeUrlLike(entry.legacy_url);
    const qualityRow = {
      legacyUrl: entry.legacy_url,
      targetUrl: entry.target_url,
      priority: entry.priority,
      urlClass: entry.url_class,
      scope: evaluation.scope,
      mode: evaluation.mode,
      blocking: evaluation.blocking,
      expectedStatus: evaluation.expectedStatus,
      expectedMaxHops: entry.canonical_expectation?.max_hops ?? null,
      actualStatus: evaluation.actualStatus,
      actualOutcome: evaluation.actualOutcome,
      actualTarget: evaluation.actualRedirectTarget ?? evaluation.targetUrl,
      actualCanonicalTarget: evaluation.actualCanonicalTarget,
      matchedArtifactPath: evaluation.matchedArtifactPath,
      hopCount: null,
      chainDetected: false,
      loopDetected: false,
      homepageCatchAll: false,
      genericFallback: false,
      topicEquivalence: evaluation.scope === 'accepted-risk'
        ? 'accepted-risk-request-aware-exception'
        : 'final-target-approved-by-frozen-dataset',
      finalTargetType: evaluation.finalTargetType,
      result: evaluation.result,
      notes: [...evaluation.notes]
    };

    if (evaluation.mode === 'alias-helper' && evaluation.actualRedirectTarget) {
      const trace = analyzeRedirectTrace(legacyInfo.comparablePathOnly, redirectEdges);
      qualityRow.hopCount = trace.hopCount;
      qualityRow.chainDetected = trace.chainDetected;
      qualityRow.loopDetected = trace.loopDetected;
      qualityRow.actualTarget = trace.finalTarget;
      qualityRow.homepageCatchAll = trace.finalTarget === '/' && legacyInfo.comparablePathOnly !== '/';
      qualityRow.genericFallback = isGenericFallbackTarget(normalizeUrlLike(trace.finalTarget))
        && normalizeUrlLike(trace.finalTarget).comparablePathOnly !== normalizeUrlLike(entry.target_url).comparablePathOnly;

      if (qualityRow.loopDetected) {
        qualityRow.result = 'fail';
        qualityRow.actualOutcome = 'redirect-loop';
        qualityRow.notes.push(`Redirect loop detected through ${trace.trace.join(' -> ')}.`);
      } else if (qualityRow.chainDetected) {
        qualityRow.result = 'fail';
        qualityRow.actualOutcome = 'redirect-chain';
        qualityRow.notes.push(`Redirect chain detected through ${trace.trace.join(' -> ')}.`);
      } else if (qualityRow.homepageCatchAll) {
        qualityRow.result = 'fail';
        qualityRow.actualOutcome = 'homepage-catch-all';
        qualityRow.topicEquivalence = 'generic-fallback-disallowed';
        qualityRow.notes.push('Redirect terminates at the homepage, which is disallowed without explicit approval.');
      } else if (qualityRow.genericFallback) {
        qualityRow.result = 'fail';
        qualityRow.actualOutcome = 'generic-fallback-target';
        qualityRow.topicEquivalence = 'generic-fallback-disallowed';
        qualityRow.notes.push('Redirect terminates at a generic index target instead of a topic-equivalent final URL.');
      }
    }

    redirects.push(qualityRow);
  }

  const redirectRowsByLegacyUrl = new Map(redirects.map((entry) => [entry.legacyUrl, entry]));
  const priorityRouteChecks = context.priorityRoutes.routes.map((route) => {
    const evaluation = evaluationsByLegacyUrl.get(route.route);
    const redirectRow = redirectRowsByLegacyUrl.get(route.route);

    if (!evaluation) {
      return {
        route: route.route,
        disposition: route.disposition,
        expectedOutcome: route.expected_outcome,
        urlClass: route.url_class,
        priority: route.priority,
        verificationMethod: 'priority-spot-check-artifact-inspection',
        actualOutcome: 'missing-dataset-entry',
        actualStatus: null,
        result: 'fail',
        notes: ['Priority route is missing from validation/expected-url-outcomes.json.']
      };
    }

    const result = redirectRow?.result === 'fail' ? 'fail' : evaluation.result;
    return {
      route: route.route,
      finalTargetUrl: route.final_target_url,
      disposition: route.disposition,
      expectedOutcome: route.expected_outcome,
      urlClass: route.url_class,
      priority: route.priority,
      verificationMethod: 'priority-spot-check-artifact-inspection',
      actualOutcome: redirectRow?.actualOutcome ?? evaluation.actualOutcome,
      actualStatus: redirectRow?.actualStatus ?? evaluation.actualStatus,
      actualTarget: redirectRow?.actualTarget ?? evaluation.actualRedirectTarget ?? evaluation.targetUrl,
      result,
      notes: [
        ...(redirectRow?.notes ?? evaluation.notes),
        'Priority route verified individually against the built production artifact.'
      ]
    };
  });

  const nonHtmlCoverage = context.expectedOutcomes.entries
    .filter(isNonHtmlEntry)
    .map((entry) => {
      const evaluation = evaluationsByLegacyUrl.get(entry.legacy_url);
      return {
        legacyUrl: entry.legacy_url,
        targetUrl: entry.target_url,
        disposition: entry.disposition,
        urlClass: entry.url_class,
        scope: evaluation.scope,
        mode: evaluation.mode,
        blocking: evaluation.blocking,
        actualOutcome: evaluation.actualOutcome,
        matchedArtifactPath: evaluation.matchedArtifactPath,
        result: evaluation.result,
        notes: evaluation.notes
      };
    });

  const retentionPolicy = await confirmRetentionPolicy();
  const summary = summarizeRedirects(redirects, priorityRouteChecks, nonHtmlCoverage);
  const report = {
    phase: 8,
    ticket: 'RHI-085',
    artifact: 'redirect-quality-report',
    status: summary.blockingFailures === 0 && summary.priorityRouteFailures === 0 && summary.nonHtmlBlockingFailures === 0
      ? 'pass'
      : 'fail',
    rcTag: context.expectedOutcomes.rc?.tag ?? null,
    rcSha: context.expectedOutcomes.rc?.commit ?? null,
    generatedAt: new Date().toISOString(),
    publicDir: toRepoRelative(options.publicRoot),
    dataset: {
      path: toRepoRelative(options.datasetPath),
      generatedAt: context.expectedOutcomes.generated_at,
      summary: context.expectedOutcomes.summary
    },
    priorityRoutes: {
      path: toRepoRelative(options.priorityRoutesPath),
      generatedAt: context.priorityRoutes.generated_at,
      routeCount: context.priorityRoutes.routes.length
    },
    retentionPolicy,
    summary,
    redirects,
    priorityRouteChecks,
    nonHtmlCoverage
  };

  await writeJsonReport(options.reportPath, report);

  console.log(`Phase 8 redirect quality report written to ${toRepoRelative(options.reportPath)}`);
  console.log(`Redirect rows: ${summary.totalRedirectEntries}`);
  console.log(`Blocking redirect failures: ${summary.blockingFailures}`);
  console.log(`Priority-route failures: ${summary.priorityRouteFailures}`);
  console.log(`Non-HTML blocking failures: ${summary.nonHtmlBlockingFailures}`);

  if (report.status === 'fail') {
    process.exitCode = 1;
  }
}

await main();