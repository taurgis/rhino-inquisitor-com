import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse as parseCsv } from 'csv-parse/sync';
import { stringify as stringifyCsv } from 'csv-stringify/sync';
import fg from 'fast-glob';
import matter from 'gray-matter';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const defaultContentDir = path.join(repoRoot, 'migration/output/content');
const defaultCorrectionsFile = path.join(repoRoot, 'migration/input/image-alt-corrections.csv');
const defaultSummaryReport = path.join(repoRoot, 'migration/reports/content-corrections-summary.json');
const defaultAltAuditReport = path.join(repoRoot, 'migration/reports/image-alt-corrections-audit.csv');

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const altCorrections = await loadAltCorrections(options.correctionsFile);
  const markdownFiles = (await fg('**/*.md', {
    cwd: options.contentDir,
    absolute: true,
    onlyFiles: true
  })).sort((left, right) => left.localeCompare(right));

  const summary = {
    contentDir: toRepoRelative(options.contentDir),
    correctionsFile: toRepoRelative(options.correctionsFile),
    correctionsFilePresent: altCorrections.exists,
    markdownFileCount: markdownFiles.length,
    filesChanged: 0,
    fencedBlocksNormalized: 0,
    mixedImageLinesSplit: 0,
    imageParagraphSpacersInserted: 0,
    altCorrectionsApplied: 0,
    unmatchedAltCorrections: 0
  };
  const auditRows = [];
  const seenCorrectionKeys = new Set();

  for (const markdownFile of markdownFiles) {
    const source = await fs.readFile(markdownFile, 'utf8');
    const parsed = matter(source);
    const pageUrl = normalizePageUrl(parsed.data.url);
    const fileLabel = toRepoRelative(markdownFile);

    const fenceResult = normalizeFencedCodeBlocks(parsed.content);
    const imageResult = normalizeImageParagraphs(fenceResult.content);
    const altResult = applyAltCorrections({
      bodyContent: imageResult.content,
      pageUrl,
      fileLabel,
      correctionsByKey: altCorrections.byKey,
      seenCorrectionKeys,
      auditRows
    });

    if (altResult.content !== parsed.content) {
      const rewritten = matter.stringify(altResult.content.trimEnd() ? `${altResult.content.trimEnd()}\n` : '', parsed.data, {
        lineWidth: 0
      });
      await fs.writeFile(markdownFile, rewritten, 'utf8');
      summary.filesChanged += 1;
    }

    summary.fencedBlocksNormalized += fenceResult.normalizedBlocks;
    summary.mixedImageLinesSplit += imageResult.mixedImageLinesSplit;
    summary.imageParagraphSpacersInserted += imageResult.imageParagraphSpacersInserted;
    summary.altCorrectionsApplied += altResult.appliedCount;
  }

  for (const row of altCorrections.rows) {
    const key = buildCorrectionKey(row.pageUrl, row.imageSrc, row.occurrenceIndex);
    if (seenCorrectionKeys.has(key)) {
      continue;
    }

    summary.unmatchedAltCorrections += 1;
    auditRows.push({
      page_url: row.pageUrl,
      image_src: row.imageSrc,
      occurrence_index: row.occurrenceIndex,
      original_alt: '',
      corrected_alt: row.correctedAlt,
      source_file: row.sourceFile,
      status: 'unmatched'
    });
  }

  await ensureDirectory(path.dirname(options.summaryReport));
  await ensureDirectory(path.dirname(options.altAuditReport));
  await fs.writeFile(options.summaryReport, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  await fs.writeFile(options.altAuditReport, serializeAltAuditRows(auditRows), 'utf8');

  console.log(
    [
      `Scanned ${markdownFiles.length} staged Markdown file(s).`,
      `Updated ${summary.filesChanged} file(s).`,
      `Fenced blocks normalized: ${summary.fencedBlocksNormalized}.`,
      `Mixed image lines split: ${summary.mixedImageLinesSplit}.`,
      `Image paragraph spacers inserted: ${summary.imageParagraphSpacersInserted}.`,
      `Alt corrections applied: ${summary.altCorrectionsApplied}.`,
      `Unmatched alt corrections: ${summary.unmatchedAltCorrections}.`,
      `Summary: ${toRepoRelative(options.summaryReport)}.`
    ].join(' ')
  );
}

function parseArgs(argv) {
  const options = {
    contentDir: defaultContentDir,
    correctionsFile: defaultCorrectionsFile,
    summaryReport: defaultSummaryReport,
    altAuditReport: defaultAltAuditReport
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case '--content-dir':
        options.contentDir = path.resolve(argv[++index]);
        break;
      case '--corrections-file':
        options.correctionsFile = path.resolve(argv[++index]);
        break;
      case '--summary-report':
        options.summaryReport = path.resolve(argv[++index]);
        break;
      case '--alt-audit-report':
        options.altAuditReport = path.resolve(argv[++index]);
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
  console.log(`Usage: node scripts/migration/apply-content-corrections.js [options]

Options:
  --content-dir <path>        Override migration/output/content directory.
  --corrections-file <path>   Override migration/input/image-alt-corrections.csv.
  --summary-report <path>     Override migration/reports/content-corrections-summary.json.
  --alt-audit-report <path>   Override migration/reports/image-alt-corrections-audit.csv.
  --help                      Show this help message.
`);
}

async function loadAltCorrections(filePath) {
  let raw;
  try {
    raw = await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return {
        exists: false,
        rows: [],
        byKey: new Map()
      };
    }
    throw error;
  }

  const records = parseCsv(raw, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
  const requiredColumns = ['page_url', 'image_src', 'corrected_alt'];
  const rows = [];
  const byKey = new Map();

  for (const record of records) {
    for (const column of requiredColumns) {
      if (!(column in record)) {
        throw new Error(`Alt corrections CSV is missing required column ${column}.`);
      }
    }

    const row = {
      pageUrl: normalizePageUrl(record.page_url),
      imageSrc: normalizeImageSrc(record.image_src),
      occurrenceIndex: normalizeOccurrenceIndex(record.occurrence_index),
      correctedAlt: normalizeAltText(record.corrected_alt),
      sourceFile: String(record.source_file ?? '').trim()
    };

    if (!row.pageUrl || !row.imageSrc || !row.correctedAlt) {
      throw new Error(`Alt corrections CSV contains an incomplete row for page ${record.page_url ?? 'unknown'}.`);
    }

    const key = buildCorrectionKey(row.pageUrl, row.imageSrc, row.occurrenceIndex);
    const existing = byKey.get(key);
    if (existing) {
      if (existing.correctedAlt !== row.correctedAlt) {
        throw new Error(`Alt corrections CSV contains conflicting corrections for ${row.pageUrl} ${row.imageSrc} occurrence ${row.occurrenceIndex}.`);
      }
      continue;
    }

    rows.push(row);
    byKey.set(key, row);
  }

  return {
    exists: true,
    rows,
    byKey
  };
}

function normalizeFencedCodeBlocks(content) {
  const lines = String(content ?? '').replace(/\r\n?/gu, '\n').split('\n');
  const normalizedLines = [];
  let normalizedBlocks = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const openingFence = line.match(/^(`{3,}|~{3,})(.*)$/u);
    if (!openingFence) {
      normalizedLines.push(line);
      continue;
    }

    const fenceMarker = openingFence[1];
    normalizedLines.push(line);
    const blockLines = [];
    index += 1;

    while (index < lines.length) {
      const trimmedLine = lines[index].trim();
      const closingFence = trimmedLine.match(/^(`{3,}|~{3,})$/u);
      if (closingFence && closingFence[1][0] === fenceMarker[0] && closingFence[1].length >= fenceMarker.length) {
        break;
      }
      blockLines.push(lines[index]);
      index += 1;
    }

    const normalizedBlock = normalizeFenceBlockLines(blockLines);
    if (normalizedBlock.changed) {
      normalizedBlocks += 1;
    }
    normalizedLines.push(...normalizedBlock.lines);

    if (index < lines.length) {
      normalizedLines.push(lines[index]);
    }
  }

  return {
    content: normalizedLines.join('\n'),
    normalizedBlocks
  };
}

function normalizeFenceBlockLines(blockLines) {
  let startIndex = 0;
  let endIndex = blockLines.length - 1;
  while (startIndex <= endIndex && blockLines[startIndex].trim().length === 0) {
    startIndex += 1;
  }
  while (endIndex >= startIndex && blockLines[endIndex].trim().length === 0) {
    endIndex -= 1;
  }

  const trimmedLines = startIndex <= endIndex ? blockLines.slice(startIndex, endIndex + 1) : [];
  const leadingWhitespaceValues = trimmedLines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^[\t ]*/u)?.[0] ?? '');
  const commonIndent = findCommonLeadingWhitespace(leadingWhitespaceValues);
  const indentWidth = getIndentWidth(commonIndent);
  const shouldDedent = commonIndent.length > 0 && ((startIndex > 0) || commonIndent.includes('\t') || indentWidth >= 4);
  let normalizedLines = shouldDedent
    ? trimmedLines.map((line) => (line.startsWith(commonIndent) ? line.slice(commonIndent.length) : line))
    : trimmedLines;
  let changed = startIndex > 0 || endIndex < blockLines.length - 1 || shouldDedent;

  const firstLineIndent = normalizedLines[0]?.match(/^[\t ]*/u)?.[0] ?? '';
  const firstLineIndentWidth = getIndentWidth(firstLineIndent);
  if (!shouldDedent && firstLineIndent.length > 0 && (firstLineIndent.includes('\t') || firstLineIndentWidth >= 4)) {
    normalizedLines = [...normalizedLines];
    normalizedLines[0] = normalizedLines[0].slice(firstLineIndent.length);
    changed = true;
  }

  return {
    lines: normalizedLines,
    changed
  };
}

function findCommonLeadingWhitespace(values) {
  if (values.length === 0) {
    return '';
  }

  let prefix = values[0];
  for (const value of values.slice(1)) {
    let index = 0;
    while (index < prefix.length && index < value.length && prefix[index] === value[index]) {
      index += 1;
    }
    prefix = prefix.slice(0, index);
    if (!prefix) {
      return '';
    }
  }

  return prefix;
}

function getIndentWidth(value) {
  return [...String(value ?? '')].reduce((total, character) => total + (character === '\t' ? 4 : 1), 0);
}

function normalizeImageParagraphs(content) {
  const lines = String(content ?? '').replace(/\r\n?/gu, '\n').split('\n');
  const splitLines = [];
  let mixedImageLinesSplit = 0;
  let insideFence = false;

  for (const line of lines) {
    if (/^(`{3,}|~{3,})/u.test(line.trim())) {
      insideFence = !insideFence;
      splitLines.push(line);
      continue;
    }

    if (insideFence) {
      splitLines.push(line);
      continue;
    }

    const splitBlocks = splitMixedImageLine(line);
    if (splitBlocks.length <= 1) {
      splitLines.push(line);
      continue;
    }

    mixedImageLinesSplit += 1;
    splitBlocks.forEach((block, index) => {
      if (index > 0) {
        splitLines.push('');
      }
      splitLines.push(block);
    });
  }

  const normalizedLines = [];
  let imageParagraphSpacersInserted = 0;
  insideFence = false;

  for (let index = 0; index < splitLines.length; index += 1) {
    const line = splitLines[index];
    if (/^(`{3,}|~{3,})/u.test(line.trim())) {
      insideFence = !insideFence;
      normalizedLines.push(line);
      continue;
    }

    normalizedLines.push(line);
    if (insideFence || !isStandaloneImageLine(line.trim())) {
      continue;
    }

    const nextLine = splitLines[index + 1];
    if (typeof nextLine !== 'string' || nextLine.trim().length === 0) {
      continue;
    }
    if (startsNewMarkdownBlock(nextLine.trim()) || isStandaloneImageLine(nextLine.trim())) {
      continue;
    }

    normalizedLines.push('');
    imageParagraphSpacersInserted += 1;
  }

  return {
    content: normalizedLines.join('\n'),
    mixedImageLinesSplit,
    imageParagraphSpacersInserted
  };
}

function splitMixedImageLine(line) {
  if (!line.includes('![')) {
    return [line];
  }

  const tokenPattern = /\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)|!\[[^\]]*\]\([^)]*\)/gu;
  const blocks = [];
  let lastIndex = 0;

  for (const match of line.matchAll(tokenPattern)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      blocks.push({
        type: 'text',
        value: line.slice(lastIndex, start).trim()
      });
    }
    blocks.push({
      type: 'image',
      value: match[0].trim()
    });
    lastIndex = start + match[0].length;
  }

  if (lastIndex < line.length) {
    blocks.push({
      type: 'text',
      value: line.slice(lastIndex).trim()
    });
  }

  const nonEmptyBlocks = blocks.filter((block) => block.value.length > 0);
  const meaningfulTextBlocks = nonEmptyBlocks.filter((block) => block.type === 'text' && blockHasMeaningfulText(block.value));
  const imageBlocks = nonEmptyBlocks.filter((block) => block.type === 'image');
  if (meaningfulTextBlocks.length === 0 || imageBlocks.length === 0) {
    return [line];
  }

  return nonEmptyBlocks.map((block) => block.value);
}

function blockHasMeaningfulText(value) {
  return value
    .replace(/\[[^\]]*\]\([^)]*\)/gu, '')
    .replace(/[_*`>#-]/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim().length > 0;
}

function isStandaloneImageLine(value) {
  return /^(?:\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)|!\[[^\]]*\]\([^)]*\))$/u.test(value);
}

function startsNewMarkdownBlock(value) {
  return /^(?:#{1,6}\s|>|[-*+]\s|\d+\.\s|```|~~~|\|)/u.test(value);
}

function applyAltCorrections({ bodyContent, pageUrl, fileLabel, correctionsByKey, seenCorrectionKeys, auditRows }) {
  if (!pageUrl || correctionsByKey.size === 0) {
    return {
      content: bodyContent,
      appliedCount: 0
    };
  }

  const imagePattern = /\[!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\]\(([^)]+)\)|!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/gu;
  let appliedCount = 0;
  const imageOccurrences = new Map();

  const content = bodyContent.replace(imagePattern, (match, linkedAlt, linkedSrc, linkedTitle, linkTarget, bareAlt, bareSrc, bareTitle) => {
    const isLinked = typeof linkedSrc === 'string';
    const originalAlt = isLinked ? linkedAlt : bareAlt;
    const imageSrc = normalizeImageSrc(isLinked ? linkedSrc : bareSrc);
    const nextOccurrenceIndex = (imageOccurrences.get(imageSrc) ?? 0) + 1;
    imageOccurrences.set(imageSrc, nextOccurrenceIndex);
    const correctionKey = buildCorrectionKey(pageUrl, imageSrc, nextOccurrenceIndex);
    const correction = correctionsByKey.get(correctionKey);
    if (!correction) {
      return match;
    }

    seenCorrectionKeys.add(correctionKey);
    if (originalAlt === correction.correctedAlt) {
      auditRows.push({
        page_url: pageUrl,
        image_src: imageSrc,
        occurrence_index: nextOccurrenceIndex,
        original_alt: originalAlt,
        corrected_alt: correction.correctedAlt,
        source_file: correction.sourceFile || fileLabel,
        status: 'already-current'
      });
      return match;
    }

    appliedCount += 1;
    auditRows.push({
      page_url: pageUrl,
      image_src: imageSrc,
      occurrence_index: nextOccurrenceIndex,
      original_alt: originalAlt,
      corrected_alt: correction.correctedAlt,
      source_file: correction.sourceFile || fileLabel,
      status: 'applied'
    });

    const nextAlt = escapeMarkdownAlt(correction.correctedAlt);
    if (isLinked) {
      const titleSuffix = linkedTitle ? ` "${linkedTitle}"` : '';
      return `[![${nextAlt}](${linkedSrc}${titleSuffix})](${linkTarget})`;
    }

    const titleSuffix = bareTitle ? ` "${bareTitle}"` : '';
    return `![${nextAlt}](${bareSrc}${titleSuffix})`;
  });

  return {
    content,
    appliedCount
  };
}

function buildCorrectionKey(pageUrl, imageSrc, occurrenceIndex = 1) {
  return `${pageUrl}\u0000${imageSrc}\u0000${occurrenceIndex}`;
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
    // Ignore parse failures and fall back to path normalization.
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
    // Ignore parse failures and fall back to the raw trimmed value.
  }

  return trimmedValue;
}

function normalizeAltText(value) {
  return String(value ?? '').replace(/\r\n?/gu, ' ').replace(/\s+/gu, ' ').trim();
}

function normalizeOccurrenceIndex(value) {
  const parsedValue = Number.parseInt(String(value ?? '1').trim(), 10);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 1;
}

function escapeMarkdownAlt(value) {
  return normalizeAltText(value).replace(/\]/gu, '\\]');
}

function serializeAltAuditRows(rows) {
  return stringifyCsv(rows, {
    header: true,
    columns: ['page_url', 'image_src', 'occurrence_index', 'original_alt', 'corrected_alt', 'source_file', 'status']
  });
}

async function ensureDirectory(directoryPath) {
  await fs.mkdir(directoryPath, {
    recursive: true
  });
}

function toRepoRelative(filePath) {
  return path.relative(repoRoot, filePath) || '.';
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
