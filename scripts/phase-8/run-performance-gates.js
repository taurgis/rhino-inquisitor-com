import { runLhciProfiles } from './run-lhci.js';
import { runPerformanceBudgetReport } from './check-performance-budget.js';

function parseArgs(argv) {
  const options = {
    outputRoot: undefined,
    publicRoot: undefined,
    sampleMatrixPath: undefined,
    baselinePath: undefined,
    reportPath: undefined
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case '--lhci-root':
        options.outputRoot = argv[++index];
        break;
      case '--public-dir':
        options.publicRoot = argv[++index];
        break;
      case '--sample-matrix':
        options.sampleMatrixPath = argv[++index];
        break;
      case '--baseline':
        options.baselinePath = argv[++index];
        break;
      case '--report':
        options.reportPath = argv[++index];
        break;
      case '--help':
        options.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage: node scripts/phase-8/run-performance-gates.js [options]

Options:
  --lhci-root <path>      Override the LHCI filesystem report root.
  --public-dir <path>     Override the built public directory.
  --sample-matrix <path>  Override validation/sample-matrix.json.
  --baseline <path>       Override migration/phase-1-performance-baseline.md.
  --report <path>         Override validation/performance-budget-report.json.
  --help                  Show this help message.
`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const lhciExitCode = await runLhciProfiles(undefined, { outputRoot: options.outputRoot });
  const budgetExitCode = await runPerformanceBudgetReport({
    publicRoot: options.publicRoot,
    sampleMatrixPath: options.sampleMatrixPath,
    baselinePath: options.baselinePath,
    lhciRoot: options.outputRoot,
    reportPath: options.reportPath
  });

  if (lhciExitCode !== 0 || budgetExitCode !== 0) {
    process.exitCode = 1;
  }
}

await main();