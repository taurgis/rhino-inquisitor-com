import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { scanMixedContent } from './mixed-content-helpers.js';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const defaultPublicDir = path.join(repoRoot, 'public');

function printHelp() {
  console.log(`Usage: node scripts/gates/check-mixed-content.js [options]

Options:
  --public-dir <path>  Path to built Hugo output (default: public)
  --help               Show this help message
`);
}

function parseArgs(argv) {
  const options = {
    publicDir: defaultPublicDir,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case '--public-dir':
        options.publicDir = path.resolve(argv[index + 1] ?? '');
        index += 1;
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

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  const result = await scanMixedContent(options.publicDir);

  if (result.failures.length > 0) {
    console.error('check:mixed-content failed');
    for (const failure of result.failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`check:mixed-content passed (${result.htmlFilesScanned} HTML files, ${result.cssFilesScanned} CSS files scanned)`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});