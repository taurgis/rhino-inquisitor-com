import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse as parseCsv } from 'csv-parse/sync';
import { stringify as stringifyCsv } from 'csv-stringify/sync';
import fg from 'fast-glob';
import matter from 'gray-matter';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const defaultCurrentDir = path.join(repoRoot, 'migration/output/content');
const defaultOutputFile = path.join(repoRoot, 'migration/input/link-text-corrections.csv');
const weakLinkTexts = new Set(['click here', 'read more', 'here']);
const markdownLinkPattern = /(?<!!)\[([^\]]+)\]\(([^)]+)\)/gu;

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const existingRowsByKey = await loadExistingRows(options.outputFile);
  const markdownFiles = (await fg('**/*.md', {
    cwd: options.currentDir,
    absolute: true,
    onlyFiles: true
  })).sort((left, right) => left.localeCompare(right));
  const rowsByKey = new Map(existingRowsByKey);

  for (const markdownFile of markdownFiles) {
    const parsed = matter(await fs.readFile(markdownFile, 'utf8'));
    const pageUrl = normalizePageUrl(parsed.data.url);
    if (!pageUrl) {
      continue;
    }

    const sourceFile = toRepoRelative(markdownFile);
    const occurrencesByTarget = new Map();
    for (const match of parsed.content.matchAll(markdownLinkPattern)) {
      const originalText = normalizeLinkTextValue(match[1]);
      if (!weakLinkTexts.has(normalizeWeakLinkToken(originalText))) {
        continue;
      }

      const target = normalizeLinkTarget(extractMarkdownTarget(match[2]));
      const occurrenceIndex = (occurrencesByTarget.get(target) ?? 0) + 1;
      occurrencesByTarget.set(target, occurrenceIndex);

      const key = buildLinkCorrectionKey(pageUrl, target, occurrenceIndex);
      const existingRow = rowsByKey.get(key);
      rowsByKey.set(key, {
        page_url: pageUrl,
        target,
        occurrence_index: occurrenceIndex,
        corrected_text: existingRow?.corrected_text ?? '',
        original_text: originalText,
        source_file: sourceFile
      });
    }
  }

  const rows = [...rowsByKey.values()];
  rows.sort((left, right) => {
    if (left.page_url !== right.page_url) {
      return left.page_url.localeCompare(right.page_url);
    }
    if (left.target !== right.target) {
      return left.target.localeCompare(right.target);
    }
    return left.occurrence_index - right.occurrence_index;
  });

  await fs.mkdir(path.dirname(options.outputFile), { recursive: true });
  await fs.writeFile(
    options.outputFile,
    stringifyCsv(rows, {
      header: true,
      columns: ['page_url', 'target', 'occurrence_index', 'corrected_text', 'original_text', 'source_file']
    }),
    'utf8'
  );

  console.log(
    [
      `Scanned ${markdownFiles.length} staged Markdown file(s).`,
      `Exported ${rows.length} weak-link correction row(s).`,
      `Output: ${toRepoRelative(options.outputFile)}.`
    ].join(' ')
  );
}

function parseArgs(argv) {
  const options = {
    currentDir: defaultCurrentDir,
    outputFile: defaultOutputFile
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case '--current-dir':
        options.currentDir = path.resolve(argv[++index]);
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
  console.log(`Usage: node scripts/migration/export-link-text-corrections.js [options]

Options:
  --current-dir <path>   Override migration/output/content directory.
  --output-file <path>   Override migration/input/link-text-corrections.csv.
  --help                 Show this help message.
`);
}

async function loadExistingRows(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const records = parseCsv(raw, {
      bom: true,
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    const rowsByKey = new Map();
    for (const record of records) {
      const pageUrl = normalizePageUrl(record.page_url);
      const target = normalizeLinkTarget(record.target);
      if (!pageUrl || !target) {
        continue;
      }

      const occurrenceIndex = normalizeOccurrenceIndex(record.occurrence_index);
      rowsByKey.set(buildLinkCorrectionKey(pageUrl, target, occurrenceIndex), {
        page_url: pageUrl,
        target,
        occurrence_index: occurrenceIndex,
        corrected_text: normalizeLinkTextValue(record.corrected_text),
        original_text: normalizeLinkTextValue(record.original_text),
        source_file: String(record.source_file ?? '').trim()
      });
    }
    return rowsByKey;
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return new Map();
    }
    throw error;
  }
}

function buildLinkCorrectionKey(pageUrl, target, occurrenceIndex = 1) {
  return `${pageUrl}\u0000${target}\u0000${occurrenceIndex}`;
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

function normalizeLinkTarget(value) {
  const trimmedValue = String(value ?? '').trim();
  if (!trimmedValue) {
    return '';
  }

  try {
    const parsed = new URL(trimmedValue, 'https://www.rhino-inquisitor.com');
    if (parsed.origin === 'https://www.rhino-inquisitor.com') {
      return normalizePageUrl(`${parsed.pathname}${parsed.search}${parsed.hash}`);
    }
    return parsed.href;
  } catch {
    return trimmedValue;
  }
}

function normalizeOccurrenceIndex(value) {
  const parsedValue = Number.parseInt(String(value ?? '1').trim(), 10);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 1;
}

function normalizeLinkTextValue(value) {
  return String(value ?? '').replace(/\r\n?/gu, ' ').replace(/\s+/gu, ' ').trim();
}

function normalizeWeakLinkToken(value) {
  return normalizeLinkTextValue(value)
    .toLowerCase()
    .replace(/[!?.,:;]+$/gu, '')
    .replace(/\s+/gu, ' ');
}

function extractMarkdownTarget(rawTarget) {
  return String(rawTarget ?? '')
    .trim()
    .replace(/^<|>$/gu, '')
    .split(/\s+['"]/u, 1)[0];
}

function toRepoRelative(filePath) {
  return path.relative(repoRoot, filePath) || '.';
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});