import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');

const defaults = {
  manifestPath: path.join(repoRoot, 'migration/url-manifest.json')
};

const allowedDispositions = new Set(['keep', 'merge', 'retire']);
const allowedLayers = new Set(['none', 'pages-static', 'dns']);
const requiredEndpoints = {
  '/feed/': { disposition: 'keep', targetUrl: '/feed/' },
  '/rss/': { disposition: 'merge', targetUrl: '/feed/' },
  '/privacy-policy/': null,
  '/sitemap.xml': { disposition: 'keep', targetUrl: '/sitemap.xml' },
  '/sitemap_index.xml': { disposition: 'retire', targetUrl: null },
  '/post-sitemap.xml': { disposition: 'retire', targetUrl: null },
  '/page-sitemap.xml': { disposition: 'retire', targetUrl: null },
  '/category-sitemap.xml': { disposition: 'retire', targetUrl: null },
  '/video-sitemap.xml': { disposition: 'retire', targetUrl: null },
  '/e-landing-page-sitemap.xml': { disposition: 'retire', targetUrl: null },
  '/robots.txt': { disposition: 'keep', targetUrl: '/robots.txt' },
  '/wp-admin/': { disposition: 'retire', targetUrl: null },
  '/wp-login.php': { disposition: 'retire', targetUrl: null }
};

function parseArgs(argv) {
  const options = { ...defaults, help: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--manifest') {
      options.manifestPath = path.resolve(argv[index + 1]);
      index += 1;
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
  console.log(`Usage: node scripts/phase-6/validate-url-inventory.js [options]

Options:
  --manifest <path>  Override manifest path.
  --help             Show this help message.
`);
}

function isFileLikePath(urlPath) {
  if (urlPath.includes('?')) {
    return false;
  }

  const pathname = urlPath.split('?')[0];
  if (pathname === '/' || pathname.endsWith('/')) {
    return false;
  }

  return path.posix.basename(pathname).includes('.');
}

function isNormalizedRoute(value) {
  if (typeof value !== 'string' || value.length === 0) {
    return false;
  }

  if (!value.startsWith('/')) {
    return false;
  }

  if (value === '/') {
    return true;
  }

  if (value.includes('?') || isFileLikePath(value)) {
    return true;
  }

  return value === value.toLowerCase() && value.endsWith('/');
}

function validateEntry(entry, duplicateSet, issues) {
  if (typeof entry.legacy_url !== 'string' || entry.legacy_url.length === 0) {
    issues.push('Encountered a record with missing legacy_url.');
    return;
  }

  if (duplicateSet.has(entry.legacy_url)) {
    issues.push(`Duplicate legacy_url detected: ${entry.legacy_url}`);
  }
  duplicateSet.add(entry.legacy_url);

  if (!isNormalizedRoute(entry.legacy_url)) {
    issues.push(`legacy_url is not normalized: ${entry.legacy_url}`);
  }

  if (!allowedDispositions.has(entry.disposition)) {
    issues.push(`Invalid disposition for ${entry.legacy_url}: ${entry.disposition}`);
  }

  if (!allowedLayers.has(entry.implementation_layer)) {
    issues.push(`Invalid implementation_layer for ${entry.legacy_url}: ${entry.implementation_layer}`);
  }

  if (entry.disposition === 'keep' || entry.disposition === 'merge') {
    if (typeof entry.target_url !== 'string' || entry.target_url.length === 0) {
      issues.push(`Missing target_url for ${entry.legacy_url}`);
    } else if (!isNormalizedRoute(entry.target_url)) {
      issues.push(`target_url is not normalized for ${entry.legacy_url}: ${entry.target_url}`);
    }
  }

  if (entry.disposition === 'retire' && entry.target_url !== null) {
    issues.push(`Retired route must have null target_url: ${entry.legacy_url}`);
  }

  if (entry.disposition === 'merge' && entry.legacy_url.includes('?') && entry.implementation_layer !== 'none') {
    issues.push(`Query-string merge route must use implementation_layer none under Model A: ${entry.legacy_url}`);
  }
}

function validateRequiredEndpoints(entries, issues) {
  for (const [legacyUrl, expectation] of Object.entries(requiredEndpoints)) {
    const entry = entries.find((candidate) => candidate.legacy_url === legacyUrl);
    if (!entry) {
      issues.push(`Missing required manifest record: ${legacyUrl}`);
      continue;
    }

    if (!expectation) {
      continue;
    }

    if (entry.disposition !== expectation.disposition) {
      issues.push(`Required endpoint has wrong disposition for ${legacyUrl}: ${entry.disposition}`);
    }

    if (entry.target_url !== expectation.targetUrl) {
      issues.push(`Required endpoint has wrong target_url for ${legacyUrl}: ${entry.target_url}`);
    }
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const manifest = JSON.parse(await fs.readFile(options.manifestPath, 'utf8'));
  if (!Array.isArray(manifest)) {
    throw new Error(`Expected ${options.manifestPath} to contain a JSON array.`);
  }

  const issues = [];
  const seenLegacyUrls = new Set();

  for (const entry of manifest) {
    validateEntry(entry, seenLegacyUrls, issues);
  }

  validateRequiredEndpoints(manifest, issues);

  const dispositionCounts = manifest.reduce((counts, entry) => {
    counts[entry.disposition] = (counts[entry.disposition] || 0) + 1;
    return counts;
  }, {});
  const layerCounts = manifest.reduce((counts, entry) => {
    counts[entry.implementation_layer] = (counts[entry.implementation_layer] || 0) + 1;
    return counts;
  }, {});

  console.log(`Validated ${manifest.length} manifest row(s) from ${path.relative(repoRoot, options.manifestPath)}`);
  console.log(`Disposition counts: ${JSON.stringify(dispositionCounts)}`);
  console.log(`Implementation-layer counts: ${JSON.stringify(layerCounts)}`);

  if (issues.length > 0) {
    console.error('Inventory validation failed:');
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Inventory validation passed.');
}

await main();