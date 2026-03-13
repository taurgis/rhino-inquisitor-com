import fs from 'node:fs/promises';
import path from 'node:path';

import { stringify as stringifyCsv } from 'csv-stringify/sync';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');

const defaults = {
  manifestPath: path.join(repoRoot, 'migration/url-manifest.json'),
  outputPath: path.join(repoRoot, 'migration/url-map.csv')
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

    if (arg === '--output') {
      options.outputPath = path.resolve(argv[index + 1]);
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
  console.log(`Usage: node scripts/phase-6/generate-url-map.js [options]

Options:
  --manifest <path>  Override manifest path.
  --output <path>    Override CSV output path.
  --help             Show this help message.
`);
}

function deriveIntentClass(entry) {
  if (entry.disposition === 'keep') {
    return 'preserved-exact';
  }

  if (entry.disposition === 'merge') {
    return 'pending-review';
  }

  return 'retired-no-equivalent';
}

function toRow(entry) {
  return {
    legacy_url: entry.legacy_url,
    legacy_path: entry.legacy_url,
    route_class: entry.url_class,
    disposition: entry.disposition,
    target_url: entry.target_url ?? '',
    intent_class: deriveIntentClass(entry),
    owner: entry.owner,
    notes: entry.reason,
    implementation_layer: entry.implementation_layer,
    redirect_code: entry.redirect_code ?? '',
    has_organic_traffic: entry.has_organic_traffic,
    has_external_links: entry.has_external_links,
    source: entry.source
  };
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

  const rows = manifest
    .slice()
    .sort((left, right) => left.legacy_url.localeCompare(right.legacy_url))
    .map(toRow);

  await fs.mkdir(path.dirname(options.outputPath), { recursive: true });
  await fs.writeFile(
    options.outputPath,
    stringifyCsv(rows, {
      header: true,
      columns: [
        'legacy_url',
        'legacy_path',
        'route_class',
        'disposition',
        'target_url',
        'intent_class',
        'owner',
        'notes',
        'implementation_layer',
        'redirect_code',
        'has_organic_traffic',
        'has_external_links',
        'source'
      ]
    }),
    'utf8'
  );

  console.log(`Wrote ${rows.length} row(s) to ${path.relative(repoRoot, options.outputPath)}`);
}

await main();