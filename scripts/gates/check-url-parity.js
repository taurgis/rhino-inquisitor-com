import {
  evaluateDatasetEntry,
  loadValidationContext,
  parsePhase8Args,
  phase8Defaults,
  printCommonHelp,
  writeJsonReport
} from './url-gate-helpers.js';
import { toRepoRelative } from '../url/url-validation-helpers.js';

const defaults = {
  datasetPath: phase8Defaults.datasetPath,
  publicRoot: phase8Defaults.publicRoot,
  reportPath: phase8Defaults.urlParityReportPath
};

function summarizeEntries(entries) {
  return entries.reduce(
    (summary, entry) => {
      summary.totalEntries += 1;
      summary.coveredEntries += 1;
      summary[entry.scope === 'blocking' ? 'blockingEntries' : 'acceptedRiskEntries'] += 1;
      summary[entry.result === 'pass' ? 'passCount' : 'failCount'] += 1;
      if (entry.blocking && entry.result === 'fail') {
        summary.blockingFailures += 1;
      }

      const scopeKey = entry.scope === 'blocking' ? 'blocking' : 'acceptedRisk';
      summary.byMode[scopeKey][entry.mode] = (summary.byMode[scopeKey][entry.mode] ?? 0) + 1;
      summary.byOutcome[entry.actualOutcome] = (summary.byOutcome[entry.actualOutcome] ?? 0) + 1;
      return summary;
    },
    {
      totalEntries: 0,
      coveredEntries: 0,
      blockingEntries: 0,
      acceptedRiskEntries: 0,
      passCount: 0,
      failCount: 0,
      blockingFailures: 0,
      byMode: {
        blocking: {},
        acceptedRisk: {}
      },
      byOutcome: {}
    }
  );
}

async function main() {
  const options = parsePhase8Args(process.argv.slice(2), defaults);
  if (options.help) {
    printCommonHelp('scripts/gates/check-url-parity.js');
    return;
  }

  const context = await loadValidationContext({
    datasetPath: options.datasetPath,
    publicRoot: options.publicRoot
  });
  const entries = [];

  for (const entry of context.expectedOutcomes.entries) {
    entries.push(await evaluateDatasetEntry(entry, context));
  }

  const summary = summarizeEntries(entries);
  const report = {
    phase: 8,
    ticket: 'RHI-085',
    artifact: 'url-parity-report',
    status: summary.blockingFailures === 0 ? 'pass' : 'fail',
    rcTag: context.expectedOutcomes.rc?.tag ?? null,
    rcSha: context.expectedOutcomes.rc?.commit ?? null,
    generatedAt: new Date().toISOString(),
    publicDir: toRepoRelative(options.publicRoot),
    dataset: {
      path: toRepoRelative(options.datasetPath),
      generatedAt: context.expectedOutcomes.generated_at,
      summary: context.expectedOutcomes.summary
    },
    summary,
    entries
  };

  await writeJsonReport(options.reportPath, report);

  console.log(`URL parity report written to ${toRepoRelative(options.reportPath)}`);
  console.log(`Total rows: ${summary.totalEntries}`);
  console.log(`Blocking rows: ${summary.blockingEntries}`);
  console.log(`Accepted-risk rows: ${summary.acceptedRiskEntries}`);
  console.log(`Pass rows: ${summary.passCount}`);
  console.log(`Fail rows: ${summary.failCount}`);
  console.log(`Blocking failures: ${summary.blockingFailures}`);

  if (summary.blockingFailures > 0) {
    process.exitCode = 1;
  }
}

await main();