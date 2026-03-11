import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { stringify as stringifyCsv } from 'csv-stringify/sync';
import fg from 'fast-glob';
import matter from 'gray-matter';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const defaultCurrentDir = path.join(repoRoot, 'migration/output/content');
const defaultBaselineDir = path.join(repoRoot, 'tmp/rhi-correction-baseline-content');
const defaultOutputFile = path.join(repoRoot, 'migration/input/image-alt-corrections.csv');

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const baselineByPageUrl = await loadImageIndex(options.baselineDir);
  const currentByPageUrl = await loadImageIndex(options.currentDir);
  const rowsByKey = new Map();

  for (const [pageUrl, currentImages] of currentByPageUrl.entries()) {
    const baselineImages = baselineByPageUrl.get(pageUrl) ?? [];
    const baselineBySource = new Map();
    for (const image of baselineImages) {
      const bucket = baselineBySource.get(image.imageSrc) ?? [];
      bucket.push(image);
      baselineBySource.set(image.imageSrc, bucket);
    }

    for (const currentImage of currentImages) {
      const bucket = baselineBySource.get(currentImage.imageSrc) ?? [];
      const baselineImage = bucket.shift();
      if (!baselineImage) {
        continue;
      }

      if (currentImage.altText === baselineImage.altText || !currentImage.altText) {
        continue;
      }

      const row = {
        page_url: pageUrl,
        image_src: currentImage.imageSrc,
        occurrence_index: currentImage.occurrenceIndex,
        corrected_alt: currentImage.altText,
        original_alt: baselineImage.altText,
        source_file: currentImage.sourceFile
      };
      const key = `${row.page_url}\u0000${row.image_src}\u0000${row.occurrence_index}`;
      const existing = rowsByKey.get(key);
      if (existing) {
        if (existing.corrected_alt !== row.corrected_alt) {
          throw new Error(`Conflicting alt-text corrections detected for ${row.page_url} ${row.image_src} occurrence ${row.occurrence_index}.`);
        }
        continue;
      }
      rowsByKey.set(key, row);
    }
  }

  const rows = [...rowsByKey.values()];
  rows.sort((left, right) => {
    if (left.page_url !== right.page_url) {
      return left.page_url.localeCompare(right.page_url);
    }
    return left.image_src.localeCompare(right.image_src);
  });

  await fs.mkdir(path.dirname(options.outputFile), { recursive: true });
  await fs.writeFile(
    options.outputFile,
    stringifyCsv(rows, {
      header: true,
      columns: ['page_url', 'image_src', 'occurrence_index', 'corrected_alt', 'original_alt', 'source_file']
    }),
    'utf8'
  );

  console.log(
    [
      `Compared ${currentByPageUrl.size} current staged page(s) against ${baselineByPageUrl.size} baseline page(s).`,
      `Exported ${rows.length} alt-text correction row(s).`,
      `Output: ${toRepoRelative(options.outputFile)}.`
    ].join(' ')
  );
}

function parseArgs(argv) {
  const options = {
    currentDir: defaultCurrentDir,
    baselineDir: defaultBaselineDir,
    outputFile: defaultOutputFile
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case '--current-dir':
        options.currentDir = path.resolve(argv[++index]);
        break;
      case '--baseline-dir':
        options.baselineDir = path.resolve(argv[++index]);
        break;
      case '--output-file':
        options.outputFile = path.resolve(argv[++index]);
        break;
      case '--help':
        printHelp();
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage: node scripts/migration/export-alt-text-corrections.js [options]

Options:
  --current-dir <path>   Override migration/output/content directory.
  --baseline-dir <path>  Override baseline generated content directory.
  --output-file <path>   Override migration/input/image-alt-corrections.csv.
  --help                 Show this help message.
`);
}

async function loadImageIndex(rootDirectory) {
  const files = (await fg('**/*.md', {
    cwd: rootDirectory,
    absolute: true,
    onlyFiles: true
  })).sort((left, right) => left.localeCompare(right));
  const byPageUrl = new Map();

  for (const filePath of files) {
    const parsed = matter(await fs.readFile(filePath, 'utf8'));
    const pageUrl = normalizePageUrl(parsed.data.url);
    if (!pageUrl) {
      continue;
    }

    byPageUrl.set(pageUrl, extractImages(parsed.content, toRepoRelative(filePath)));
  }

  return byPageUrl;
}

function extractImages(content, sourceFile) {
  const pattern = /\[!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\]\(([^)]+)\)|!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/gu;
  const images = [];
  const occurrencesBySrc = new Map();

  for (const match of content.matchAll(pattern)) {
    const linkedAlt = match[1];
    const linkedSrc = match[2];
    const bareAlt = match[5];
    const bareSrc = match[6];
    const imageSrc = normalizeImageSrc(linkedSrc || bareSrc);
    const occurrenceIndex = (occurrencesBySrc.get(imageSrc) ?? 0) + 1;
    occurrencesBySrc.set(imageSrc, occurrenceIndex);

    images.push({
      altText: normalizeAltText(linkedSrc ? linkedAlt : bareAlt),
      imageSrc,
      occurrenceIndex,
      sourceFile
    });
  }

  return images;
}

function normalizePageUrl(value) {
  const trimmedValue = String(value ?? '').trim();
  if (!trimmedValue) {
    return '';
  }

  try {
    const parsed = new URL(trimmedValue, 'https://www.rhino-inquisitor.com');
    if (parsed.origin === 'https://www.rhino-inquisitor.com') {
      return normalizePageUrl(`${parsed.pathname}${parsed.search}${parsed.hash}`);
    }
  } catch {
    // Ignore parse failures.
  }

  let normalized = trimmedValue.startsWith('/') ? trimmedValue : `/${trimmedValue}`;
  if (!/[?#]/u.test(normalized) && !normalized.endsWith('/') && !path.posix.extname(normalized)) {
    normalized = `${normalized}/`;
  }
  return normalized;
}

function normalizeImageSrc(value) {
  const trimmedValue = String(value ?? '').trim();
  if (!trimmedValue) {
    return '';
  }

  try {
    const parsed = new URL(trimmedValue, 'https://www.rhino-inquisitor.com');
    if (parsed.origin === 'https://www.rhino-inquisitor.com') {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    // Ignore parse failures.
  }

  return trimmedValue;
}

function normalizeAltText(value) {
  return String(value ?? '').replace(/\r\n?/gu, ' ').replace(/\s+/gu, ' ').trim();
}

function toRepoRelative(filePath) {
  return path.relative(repoRoot, filePath) || '.';
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
