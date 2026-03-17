import { readFile } from 'node:fs/promises';

function printHelp() {
  console.log(`Usage: node scripts/phase-7/check-preview-prefix-noindex.js --base-url <url>

Options:
  --base-url <url>  Expected HTTPS preview base URL.
  --help            Show this help message.
`);
}

function parseArgs(argv) {
  const options = {
    baseUrl: ''
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case '--base-url':
        options.baseUrl = argv[++index] ?? '';
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

function escapeRegex(value) {
  return String(value).replace(/[|\\{}()[\]^$+*?.-]/gu, '\\$&');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  if (!options.baseUrl) {
    throw new Error('Expected --base-url.');
  }

  if (!options.baseUrl.startsWith('https://')) {
    throw new Error(`Expected HTTPS preview base URL, received: ${options.baseUrl}`);
  }

  const html = await readFile('public/index.html', 'utf8');
  const { pathname } = new URL(options.baseUrl);
  const basePath = pathname === '/' ? '' : pathname.replace(/\/$/u, '');
  const expectedStylesheetPrefix = `${basePath}/styles/site`;
  const stylesheetPattern = new RegExp(`href=(?:"|')?${escapeRegex(expectedStylesheetPrefix)}\\.[a-f0-9]+\\.css(?:"|')?`);

  if (!stylesheetPattern.test(html)) {
    throw new Error(`Preview HTML is missing a fingerprinted stylesheet path with prefix: ${expectedStylesheetPrefix}`);
  }

  if (!html.includes('noindex, nofollow')) {
    throw new Error('Preview HTML is missing the expected noindex, nofollow robots directive.');
  }

  console.log(`[RHI-079] Preview build contains the expected path prefix and noindex directive for ${options.baseUrl}`);
}

main().catch((error) => {
  console.error(`[RHI-079] Preview prefix validation failed: ${error.message}`);
  process.exitCode = 1;
});