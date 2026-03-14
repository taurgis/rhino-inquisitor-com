import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

const defaults = {
  publicRoot: path.join(repoRoot, 'public'),
  previewPublicRoot: '',
  reportDir: path.join(repoRoot, 'tmp', 'phase-6-host-protocol'),
  productionBaseUrl: 'https://www.rhino-inquisitor.com/',
  previewBaseUrl: 'https://taurgis.github.io/rhino-inquisitor-com/'
};

function printHelp() {
  console.log(`Usage: node scripts/phase-6/check-host-protocol.js [options]

Options:
  --public-dir <path>          Override the production public directory.
  --preview-public-dir <path>  Optional preview public directory for noindex validation.
  --report-dir <path>          Directory for generated validation reports.
  --production-base-url <url>  Expected production base URL.
  --preview-base-url <url>     Expected preview base URL.
  --help                       Show this help message.

Notes:
  - Production checks always run.
  - Preview checks run only when --preview-public-dir is supplied.
`);
}

function parseArgs(argv) {
  const options = { ...defaults, help: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--public-dir') {
      options.publicRoot = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--preview-public-dir') {
      options.previewPublicRoot = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--report-dir') {
      options.reportDir = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--production-base-url') {
      options.productionBaseUrl = argv[index + 1]?.trim();
      index += 1;
      continue;
    }

    if (arg === '--preview-base-url') {
      options.previewBaseUrl = argv[index + 1]?.trim();
      index += 1;
      continue;
    }

    if (arg === '--help') {
      options.help = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!options.productionBaseUrl) {
    throw new Error('Expected a non-empty --production-base-url value.');
  }

  if (options.previewPublicRoot && !options.previewBaseUrl) {
    throw new Error('Expected a non-empty --preview-base-url value when --preview-public-dir is provided.');
  }

  return options;
}

function runNodeScript(scriptPath, args, label) {
  console.log(`\n[host-protocol] ${label}`);
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: repoRoot,
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status ?? 1}.`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  await fs.mkdir(options.reportDir, { recursive: true });

  const metadataReportPath = path.join(options.reportDir, 'phase-6-host-protocol-metadata.csv');
  const sitemapReportPath = path.join(options.reportDir, 'phase-6-host-protocol-sitemap.csv');
  const productionCrawlReportPath = path.join(
    options.reportDir,
    'phase-6-host-protocol-crawl-controls-production.csv'
  );

  runNodeScript(
    path.join(repoRoot, 'scripts', 'seo', 'check-metadata.js'),
    ['--public-dir', options.publicRoot, '--report', metadataReportPath],
    'validate canonical and metadata host invariants'
  );

  runNodeScript(
    path.join(repoRoot, 'scripts', 'seo', 'check-sitemap.js'),
    [
      '--public-dir',
      options.publicRoot,
      '--metadata-report',
      metadataReportPath,
      '--report',
      sitemapReportPath
    ],
    'validate sitemap and robots host invariants'
  );

  runNodeScript(
    path.join(repoRoot, 'scripts', 'seo', 'check-crawl-controls.js'),
    [
      '--public-dir',
      options.publicRoot,
      '--mode',
      'production',
      '--base-url',
      options.productionBaseUrl,
      '--report',
      productionCrawlReportPath
    ],
    'validate production crawl-control and robots sitemap invariants'
  );

  if (options.previewPublicRoot) {
    const previewCrawlReportPath = path.join(
      options.reportDir,
      'phase-6-host-protocol-crawl-controls-preview.csv'
    );

    runNodeScript(
      path.join(repoRoot, 'scripts', 'seo', 'check-crawl-controls.js'),
      [
        '--public-dir',
        options.previewPublicRoot,
        '--mode',
        'preview',
        '--base-url',
        options.previewBaseUrl,
        '--report',
        previewCrawlReportPath
      ],
      'validate preview noindex and preview-host crawl controls'
    );
  } else {
    console.log('\n[host-protocol] Preview validation skipped because --preview-public-dir was not provided.');
  }

  console.log(`\n[host-protocol] Validation passed. Reports written to ${path.relative(repoRoot, options.reportDir) || '.'}`);
}

main().catch((error) => {
  console.error(`\n[host-protocol] ${error.message}`);
  process.exitCode = 1;
});