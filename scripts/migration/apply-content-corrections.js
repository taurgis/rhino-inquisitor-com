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
const defaultLinkCorrectionsFile = path.join(repoRoot, 'migration/input/link-text-corrections.csv');
const defaultBodyOverridesFile = path.join(repoRoot, 'migration/input/body-overrides.json');
const defaultBodyOverridesDir = path.join(repoRoot, 'migration/input/body-overrides');
const defaultSummaryReport = path.join(repoRoot, 'migration/reports/content-corrections-summary.json');
const defaultAltAuditReport = path.join(repoRoot, 'migration/reports/image-alt-corrections-audit.csv');
const defaultLinkAuditReport = path.join(repoRoot, 'migration/reports/link-text-corrections-audit.csv');
const weakLinkTexts = new Set(['click here', 'read more', 'here']);
const tableDividerPattern = /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?\s*$/u;
const markdownLinkPattern = /(?<!!)\[([^\]]+)\]\(([^)]+)\)/gu;
const inlineLabelTypeByLabel = new Map([
  ['caching', 'note'],
  ['cdn', 'note'],
  ['clearing the cache', 'note'],
  ['default cache times', 'note'],
  ['deleted', 'warning'],
  ['deletion', 'warning'],
  ['deprecated', 'warning'],
  ['deprecation', 'warning'],
  ['info', 'note'],
  ['not found', 'note'],
  ['replication', 'note']
]);
const inlineLabelCandidates = [...inlineLabelTypeByLabel.keys()].sort((left, right) => right.length - left.length);
const linkedImageTokenPattern = /\[\s*!\[[^\]]*\]\([^)]*\)\s*\]\([^)]*\)|!\[[^\]]*\]\([^)]*\)/gu;
const standaloneImagePattern = /^(?:\[\s*!\[[^\]]*\]\([^)]*\)\s*\]\([^)]*\)|!\[[^\]]*\]\([^)]*\))$/u;
const brokenInlineLinkPattern = /(?<!!)\[([^\]]+)\]\(([^)]+)\)([a-z]{1,20})(?=(?:\s|[.,;:!?)]|$))/gu;

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const altCorrections = await loadAltCorrections(options.correctionsFile);
  const linkCorrections = await loadLinkCorrections(options.linkCorrectionsFile);
  const bodyOverrides = await loadBodyOverrides(options.bodyOverridesFile, options.bodyOverridesDir);
  const markdownFiles = (await fg('**/*.md', {
    cwd: options.contentDir,
    absolute: true,
    onlyFiles: true
  })).sort((left, right) => left.localeCompare(right));

  const summary = {
    contentDir: toRepoRelative(options.contentDir),
    correctionsFile: toRepoRelative(options.correctionsFile),
    correctionsFilePresent: altCorrections.exists,
    linkCorrectionsFile: toRepoRelative(options.linkCorrectionsFile),
    linkCorrectionsFilePresent: linkCorrections.exists,
    bodyOverridesFile: toRepoRelative(options.bodyOverridesFile),
    bodyOverridesFilePresent: bodyOverrides.exists,
    markdownFileCount: markdownFiles.length,
    filesChanged: 0,
    hardTabsExpanded: 0,
    fencedBlocksNormalized: 0,
    fenceLanguagesAssigned: 0,
    listIndentationNormalized: 0,
    unorderedListMarkerSpacingNormalized: 0,
    orderedListMarkerSpacingNormalized: 0,
    orderedListPrefixesNormalized: 0,
    repeatedListMarkersCollapsed: 0,
    blockquoteLinesNormalized: 0,
    listSpacingNormalized: 0,
    malformedRepositoryLinksNormalized: 0,
    headingPunctuationNormalized: 0,
    duplicateHeadingsDisambiguated: 0,
    emphasisSpacingNormalized: 0,
    emphasisHeadingsNormalized: 0,
    codeSpanSpacingNormalized: 0,
    markdownLinkTextSpacingNormalized: 0,
    bareUrlsWrapped: 0,
    inPageFragmentsNormalized: 0,
    inlineHtmlEscaped: 0,
    mixedImageLinesSplit: 0,
    imageParagraphSpacersInserted: 0,
    tableHeaderRowsNormalized: 0,
    multilineTablesNormalized: 0,
    pseudoTagMarkupNormalized: 0,
    bodyOverridesApplied: 0,
    altCorrectionsApplied: 0,
    unmatchedAltCorrections: 0,
    linkTextCorrectionsApplied: 0,
    unmatchedLinkTextCorrections: 0
  };
  const altAuditRows = [];
  const linkAuditRows = [];
  const seenAltCorrectionKeys = new Set();
  const seenLinkCorrectionKeys = new Set();

  for (const markdownFile of markdownFiles) {
    const source = await fs.readFile(markdownFile, 'utf8');
    const parsed = matter(source);
    const pageUrl = normalizePageUrl(parsed.data.url);
    const fileLabel = toRepoRelative(markdownFile);
    const bodyOverride = pageUrl ? bodyOverrides.byPageUrl.get(pageUrl) ?? null : null;

    if (bodyOverride) {
      parsed.content = bodyOverride.bodyMarkdown;
      if (bodyOverride.description) {
        parsed.data.description = bodyOverride.description;
      }
      summary.bodyOverridesApplied += 1;
    }

    const tabResult = normalizeHardTabs(parsed.content);
    const fenceResult = normalizeFencedCodeBlocks(tabResult.content);
    const listResult = normalizeMarkdownLists(fenceResult.content);
    const blockquoteResult = normalizeBlockquoteSpacing(listResult.content);
    const listSpacingResult = normalizeBlankLinesAroundLists(blockquoteResult.content);
    const repositoryLinkResult = normalizeRepositoryEntryLinks(listSpacingResult.content);
    const headingResult = normalizeHeadingPunctuation(repositoryLinkResult.content);
    const duplicateHeadingResult = normalizeDuplicateHeadings(headingResult.content);
    const emphasisResult = normalizeSpacedEmphasis(duplicateHeadingResult.content);
    const codeSpanResult = normalizeCodeSpanSpacing(emphasisResult.content);
    const linkTextResult = normalizeMarkdownLinkTextSpacing(codeSpanResult.content);
    const fragmentResult = normalizeInPageFragments(linkTextResult.content);
    const urlResult = wrapBareUrls(fragmentResult.content);
    const inlineHtmlResult = normalizeInlineHtmlTokens(urlResult.content);
    const imageResult = normalizeImageParagraphs(inlineHtmlResult.content);
    const tableResult = normalizeMarkdownTables(imageResult.content);
    const calloutResult = normalizeInlineLabelCallouts(tableResult.content);
    const linkRepairResult = normalizeBrokenInlineLinks(calloutResult.content);
    const pseudoTagResult = normalizePseudoTagMarkup(linkRepairResult.content);
    const altResult = applyAltCorrections({
      bodyContent: pseudoTagResult.content,
      pageUrl,
      fileLabel,
      correctionsByKey: altCorrections.byKey,
      seenCorrectionKeys: seenAltCorrectionKeys,
      auditRows: altAuditRows
    });
    const linkResult = applyLinkTextCorrections({
      bodyContent: altResult.content,
      pageUrl,
      fileLabel,
      correctionsByKey: linkCorrections.byKey,
      seenCorrectionKeys: seenLinkCorrectionKeys,
      auditRows: linkAuditRows
    });

    const rewritten = matter.stringify(linkResult.content.trimEnd() ? `${linkResult.content.trimEnd()}\n` : '', parsed.data, {
      lineWidth: 0
    });

    if (rewritten !== source) {
      await fs.writeFile(markdownFile, rewritten, 'utf8');
      summary.filesChanged += 1;
    }

    summary.hardTabsExpanded += tabResult.expandedTabs;
    summary.fencedBlocksNormalized += fenceResult.normalizedBlocks;
    summary.fenceLanguagesAssigned += fenceResult.assignedLanguages;
    summary.listIndentationNormalized += listResult.listIndentationNormalized;
    summary.unorderedListMarkerSpacingNormalized += listResult.unorderedSpacingNormalized;
    summary.orderedListMarkerSpacingNormalized += listResult.orderedSpacingNormalized;
    summary.orderedListPrefixesNormalized += listResult.orderedPrefixesNormalized;
    summary.repeatedListMarkersCollapsed += listResult.repeatedMarkersCollapsed;
    summary.blockquoteLinesNormalized += blockquoteResult.normalizedBlockquoteLines;
    summary.listSpacingNormalized += listSpacingResult.normalizedListSpacing;
    summary.malformedRepositoryLinksNormalized += repositoryLinkResult.normalizedEntries;
    summary.headingPunctuationNormalized += headingResult.normalizedHeadings;
    summary.duplicateHeadingsDisambiguated += duplicateHeadingResult.duplicateHeadingsDisambiguated;
    summary.emphasisSpacingNormalized += emphasisResult.normalizedEmphasis;
    summary.emphasisHeadingsNormalized += emphasisResult.normalizedHeadingLikeEmphasis;
    summary.codeSpanSpacingNormalized += codeSpanResult.normalizedCodeSpans;
    summary.markdownLinkTextSpacingNormalized += linkTextResult.normalizedLinks;
    summary.bareUrlsWrapped += urlResult.wrappedUrls;
    summary.inPageFragmentsNormalized += fragmentResult.normalizedFragments;
    summary.inlineHtmlEscaped += inlineHtmlResult.escapedTokens;
    summary.mixedImageLinesSplit += imageResult.mixedImageLinesSplit;
    summary.imageParagraphSpacersInserted += imageResult.imageParagraphSpacersInserted;
    summary.tableHeaderRowsNormalized += tableResult.normalizedTables;
    summary.multilineTablesNormalized += tableResult.multilineTablesNormalized;
    summary.inlineLabelCalloutsNormalized = (summary.inlineLabelCalloutsNormalized ?? 0) + calloutResult.normalizedCallouts;
    summary.inlineLinksRepaired = (summary.inlineLinksRepaired ?? 0) + linkRepairResult.repairedLinks;
    summary.pseudoTagMarkupNormalized += pseudoTagResult.normalizedPatterns;
    summary.altCorrectionsApplied += altResult.appliedCount;
    summary.linkTextCorrectionsApplied += linkResult.appliedCount;
  }

  for (const row of altCorrections.rows) {
    const key = buildCorrectionKey(row.pageUrl, row.imageSrc, row.occurrenceIndex);
    if (seenAltCorrectionKeys.has(key)) {
      continue;
    }

    summary.unmatchedAltCorrections += 1;
    altAuditRows.push({
      page_url: row.pageUrl,
      image_src: row.imageSrc,
      occurrence_index: row.occurrenceIndex,
      original_alt: '',
      corrected_alt: row.correctedAlt,
      source_file: row.sourceFile,
      status: 'unmatched'
    });
  }

  for (const row of linkCorrections.rows) {
    const key = buildLinkCorrectionKey(row.pageUrl, row.target, row.occurrenceIndex);
    if (seenLinkCorrectionKeys.has(key)) {
      continue;
    }

    summary.unmatchedLinkTextCorrections += 1;
    linkAuditRows.push({
      page_url: row.pageUrl,
      target: row.target,
      occurrence_index: row.occurrenceIndex,
      original_text: '',
      corrected_text: row.correctedText,
      source_file: row.sourceFile,
      status: 'unmatched'
    });
  }

  await ensureDirectory(path.dirname(options.summaryReport));
  await ensureDirectory(path.dirname(options.altAuditReport));
  await ensureDirectory(path.dirname(options.linkAuditReport));
  await fs.writeFile(options.summaryReport, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  await fs.writeFile(options.altAuditReport, serializeAltAuditRows(altAuditRows), 'utf8');
  await fs.writeFile(options.linkAuditReport, serializeLinkAuditRows(linkAuditRows), 'utf8');

  console.log(
    [
      `Scanned ${markdownFiles.length} staged Markdown file(s).`,
      `Updated ${summary.filesChanged} file(s).`,
      `Hard tabs expanded: ${summary.hardTabsExpanded}.`,
      `Fenced blocks normalized: ${summary.fencedBlocksNormalized}.`,
      `Fence languages assigned: ${summary.fenceLanguagesAssigned}.`,
      `List indentation normalized: ${summary.listIndentationNormalized}.`,
      `Repeated list markers collapsed: ${summary.repeatedListMarkersCollapsed}.`,
      `Unordered list spacing normalized: ${summary.unorderedListMarkerSpacingNormalized}.`,
      `Ordered list spacing normalized: ${summary.orderedListMarkerSpacingNormalized}.`,
      `Ordered list prefixes normalized: ${summary.orderedListPrefixesNormalized}.`,
      `Heading punctuation normalized: ${summary.headingPunctuationNormalized}.`,
      `Duplicate headings disambiguated: ${summary.duplicateHeadingsDisambiguated}.`,
      `Blockquote lines normalized: ${summary.blockquoteLinesNormalized}.`,
      `Blank lines around lists normalized: ${summary.listSpacingNormalized}.`,
      `Malformed repository links normalized: ${summary.malformedRepositoryLinksNormalized}.`,
      `Emphasis spacing normalized: ${summary.emphasisSpacingNormalized}.`,
      `Heading-like emphasis normalized: ${summary.emphasisHeadingsNormalized}.`,
      `Code spans normalized: ${summary.codeSpanSpacingNormalized}.`,
      `Markdown link text spacing normalized: ${summary.markdownLinkTextSpacingNormalized}.`,
      `Bare URLs wrapped: ${summary.bareUrlsWrapped}.`,
      `In-page fragments normalized: ${summary.inPageFragmentsNormalized}.`,
      `Inline HTML escaped: ${summary.inlineHtmlEscaped}.`,
      `Mixed image lines split: ${summary.mixedImageLinesSplit}.`,
      `Image paragraph spacers inserted: ${summary.imageParagraphSpacersInserted}.`,
      `Table headers normalized: ${summary.tableHeaderRowsNormalized}.`,
      `Multiline tables normalized: ${summary.multilineTablesNormalized}.`,
      `Pseudo-tag markup normalized: ${summary.pseudoTagMarkupNormalized}.`,
      `Body overrides applied: ${summary.bodyOverridesApplied}.`,
      `Alt corrections applied: ${summary.altCorrectionsApplied}.`,
      `Unmatched alt corrections: ${summary.unmatchedAltCorrections}.`,
      `Link-text corrections applied: ${summary.linkTextCorrectionsApplied}.`,
      `Unmatched link-text corrections: ${summary.unmatchedLinkTextCorrections}.`,
      `Summary: ${toRepoRelative(options.summaryReport)}.`
    ].join(' ')
  );
}

function parseArgs(argv) {
  const options = {
    contentDir: defaultContentDir,
    correctionsFile: defaultCorrectionsFile,
    linkCorrectionsFile: defaultLinkCorrectionsFile,
    bodyOverridesFile: defaultBodyOverridesFile,
    bodyOverridesDir: defaultBodyOverridesDir,
    summaryReport: defaultSummaryReport,
    altAuditReport: defaultAltAuditReport,
    linkAuditReport: defaultLinkAuditReport
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
      case '--link-corrections-file':
        options.linkCorrectionsFile = path.resolve(argv[++index]);
        break;
      case '--body-overrides-file':
        options.bodyOverridesFile = path.resolve(argv[++index]);
        break;
      case '--body-overrides-dir':
        options.bodyOverridesDir = path.resolve(argv[++index]);
        break;
      case '--summary-report':
        options.summaryReport = path.resolve(argv[++index]);
        break;
      case '--alt-audit-report':
        options.altAuditReport = path.resolve(argv[++index]);
        break;
      case '--link-audit-report':
        options.linkAuditReport = path.resolve(argv[++index]);
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
  --link-corrections-file <path>
                              Override migration/input/link-text-corrections.csv.
  --body-overrides-file <path>
                              Override migration/input/body-overrides.json.
  --body-overrides-dir <path>
                              Override migration/input/body-overrides directory.
  --summary-report <path>     Override migration/reports/content-corrections-summary.json.
  --alt-audit-report <path>   Override migration/reports/image-alt-corrections-audit.csv.
  --link-audit-report <path>  Override migration/reports/link-text-corrections-audit.csv.
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

async function loadLinkCorrections(filePath) {
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
  const requiredColumns = ['page_url', 'target', 'corrected_text'];
  const rows = [];
  const byKey = new Map();

  for (const record of records) {
    for (const column of requiredColumns) {
      if (!(column in record)) {
        throw new Error(`Link-text corrections CSV is missing required column ${column}.`);
      }
    }

    const row = {
      pageUrl: normalizePageUrl(record.page_url),
      target: normalizeLinkTarget(record.target),
      occurrenceIndex: normalizeOccurrenceIndex(record.occurrence_index),
      correctedText: normalizeLinkTextValue(record.corrected_text),
      sourceFile: String(record.source_file ?? '').trim()
    };

    if (!row.pageUrl || !row.target) {
      throw new Error(`Link-text corrections CSV contains an incomplete row for page ${record.page_url ?? 'unknown'}.`);
    }

    if (!row.correctedText) {
      continue;
    }

    const key = buildLinkCorrectionKey(row.pageUrl, row.target, row.occurrenceIndex);
    const existing = byKey.get(key);
    if (existing) {
      if (existing.correctedText !== row.correctedText) {
        throw new Error(`Link-text corrections CSV contains conflicting corrections for ${row.pageUrl} ${row.target} occurrence ${row.occurrenceIndex}.`);
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

async function loadBodyOverrides(filePath, overridesDir) {
  let raw;
  try {
    raw = await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return {
        exists: false,
        rows: [],
        byPageUrl: new Map()
      };
    }
    throw error;
  }

  let records;
  try {
    records = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Body overrides file ${toRepoRelative(filePath)} is not valid JSON: ${error.message}`);
  }

  if (!Array.isArray(records)) {
    throw new Error(`Body overrides file ${toRepoRelative(filePath)} must contain a JSON array.`);
  }

  const rows = [];
  const byPageUrl = new Map();

  for (const record of records) {
    const pageUrl = normalizePageUrl(record?.page_url);
    const bodyFile = String(record?.body_file ?? '').trim();
    const description = normalizeDescriptionOverride(record?.description ?? '');
    if (!pageUrl || !bodyFile) {
      throw new Error(`Body overrides file ${toRepoRelative(filePath)} contains an incomplete row.`);
    }

    const bodyFilePath = path.resolve(overridesDir, bodyFile);
    let bodyMarkdown;
    try {
      bodyMarkdown = await fs.readFile(bodyFilePath, 'utf8');
    } catch (error) {
      throw new Error(`Unable to read body override ${toRepoRelative(bodyFilePath)} for ${pageUrl}: ${error.message}`);
    }

    const normalizedRow = {
      pageUrl,
      bodyFile: toRepoRelative(bodyFilePath),
      bodyMarkdown: normalizeOverrideBody(bodyMarkdown),
      description
    };

    if (byPageUrl.has(pageUrl)) {
      throw new Error(`Body overrides file ${toRepoRelative(filePath)} contains duplicate page_url ${pageUrl}.`);
    }

    rows.push(normalizedRow);
    byPageUrl.set(pageUrl, normalizedRow);
  }

  return {
    exists: true,
    rows,
    byPageUrl
  };
}

function normalizeOverrideBody(value) {
  return String(value ?? '')
    .replace(/\r\n?/gu, '\n')
    .trim();
}

function normalizeDescriptionOverride(value) {
  return String(value ?? '')
    .replace(/\r\n?/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

function normalizeHardTabs(content) {
  const source = String(content ?? '').replace(/\r\n?/gu, '\n');
  const matches = source.match(/\t/gu);

  return {
    content: source.replace(/\t/gu, '    '),
    expandedTabs: matches ? matches.length : 0
  };
}

function normalizeFencedCodeBlocks(content) {
  const lines = String(content ?? '').replace(/\r\n?/gu, '\n').split('\n');
  const normalizedLines = [];
  let normalizedBlocks = 0;
  let assignedLanguages = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const openingFence = line.match(/^(\s*)(`{3,}|~{3,})(.*)$/u);
    if (!openingFence) {
      normalizedLines.push(line);
      continue;
    }

    const fenceIndent = openingFence[1];
    const fenceMarker = openingFence[2];
    const fenceInfo = openingFence[3].trim();
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
    let openingFenceLine = line;
    if (!fenceInfo) {
      openingFenceLine = `${fenceIndent}${fenceMarker}${detectFenceLanguage(normalizedBlock.lines)}`;
      assignedLanguages += 1;
    }
    if (normalizedBlock.changed) {
      normalizedBlocks += 1;
    }
    normalizedLines.push(openingFenceLine);
    normalizedLines.push(...normalizedBlock.lines);

    if (index < lines.length) {
      normalizedLines.push(lines[index]);
    }
  }

  return {
    content: normalizedLines.join('\n'),
    normalizedBlocks,
    assignedLanguages
  };
}

function detectFenceLanguage(blockLines) {
  const joined = blockLines.join('\n').trim();
  if (!joined) {
    return 'text';
  }

  if (/^(\{|\[)[\s\S]*(\}|\])$/u.test(joined)) {
    try {
      JSON.parse(joined);
      return 'json';
    } catch {
      // Fall through to heuristic detection.
    }
  }

  if (/<\/?[a-z][\w:-]*\b[^>]*>/iu.test(joined)) {
    return 'html';
  }

  if (/^(npm|yarn|pnpm|git|curl|node|hugo|sfcc-ci)\b/mu.test(joined) || /^\$\s+/mu.test(joined) || /^#!/u.test(joined)) {
    return 'bash';
  }

  if (/\b(module\.exports|require\(|exports\.|function\b|const\b|let\b|var\b|=>)\b/u.test(joined)) {
    return 'js';
  }

  if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER)\b/imu.test(joined)) {
    return 'sql';
  }

  return 'text';
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

function normalizeMarkdownLists(content) {
  const lines = String(content ?? '').replace(/\r\n?/gu, '\n').split('\n');
  const normalizedLines = [];
  let repeatedMarkersCollapsed = 0;
  let listIndentationNormalized = 0;
  let unorderedSpacingNormalized = 0;
  let orderedSpacingNormalized = 0;
  let orderedPrefixesNormalized = 0;
  let insideFence = false;
  let previousNonEmptyLine = '';

  for (const line of lines) {
    if (/^(`{3,}|~{3,})/u.test(line.trim())) {
      insideFence = !insideFence;
      normalizedLines.push(line);
      previousNonEmptyLine = line.trim().length > 0 ? line : previousNonEmptyLine;
      continue;
    }

    if (insideFence) {
      normalizedLines.push(line);
      previousNonEmptyLine = line.trim().length > 0 ? line : previousNonEmptyLine;
      continue;
    }

    let updatedLine = line;
    const repeatedMarkerMatch = updatedLine.match(/^(\s*)([*+-]|\d+\.)\s+(?:[*+-]|\d+\.)\s+(.*)$/u);
    if (repeatedMarkerMatch) {
      updatedLine = `${repeatedMarkerMatch[1]}${repeatedMarkerMatch[2]} ${repeatedMarkerMatch[3]}`;
      repeatedMarkersCollapsed += 1;
    }

    const orderedMatch = updatedLine.match(/^(?<blockquote>(?:>\s*)*)(?<indent>\s*)(?<prefix>\d+)\.(?<spacing>\s+)(?<rest>.*)$/u);
    if (orderedMatch) {
      const blockquotePrefix = orderedMatch.groups.blockquote ?? '';
      let normalizedIndent = normalizeListIndentation(orderedMatch.groups.indent ?? '', {
        blockquotePrefix,
        previousNonEmptyLine
      });
      if (/^ {2}1\. /u.test(`${normalizedIndent}1. ${orderedMatch.groups.rest}`) && /^1\. /u.test(stripBlockquotePrefix(previousNonEmptyLine).trim())) {
        normalizedIndent = '';
      }
      if (normalizedIndent !== (orderedMatch.groups.indent ?? '')) {
        listIndentationNormalized += 1;
      }
      if ((orderedMatch.groups.spacing ?? '') !== ' ') {
        orderedSpacingNormalized += 1;
      }
      if ((orderedMatch.groups.prefix ?? '') !== '1') {
        orderedPrefixesNormalized += 1;
      }
      const normalizedLine = `${blockquotePrefix}${normalizedIndent}1. ${orderedMatch.groups.rest}`;
      normalizedLines.push(normalizedLine);
      previousNonEmptyLine = normalizedLine;
      continue;
    }

    const unorderedMatch = updatedLine.match(/^(?<blockquote>(?:>\s*)*)(?<indent>\s*)(?<marker>[*+-])(?<spacing>\s+)(?<rest>.*)$/u);
    if (unorderedMatch) {
      const blockquotePrefix = unorderedMatch.groups.blockquote ?? '';
      const normalizedIndent = normalizeListIndentation(unorderedMatch.groups.indent ?? '', {
        blockquotePrefix,
        previousNonEmptyLine
      });
      if (normalizedIndent !== (unorderedMatch.groups.indent ?? '')) {
        listIndentationNormalized += 1;
      }
      if ((unorderedMatch.groups.spacing ?? '') !== ' ') {
        unorderedSpacingNormalized += 1;
      }
      const normalizedLine = `${blockquotePrefix}${normalizedIndent}${unorderedMatch.groups.marker} ${unorderedMatch.groups.rest}`;
      normalizedLines.push(normalizedLine);
      previousNonEmptyLine = normalizedLine;
      continue;
    }

    normalizedLines.push(updatedLine);
    previousNonEmptyLine = updatedLine.trim().length > 0 ? updatedLine : previousNonEmptyLine;
  }

  return {
    content: normalizedLines.join('\n'),
    repeatedMarkersCollapsed,
    listIndentationNormalized,
    unorderedSpacingNormalized,
    orderedSpacingNormalized,
    orderedPrefixesNormalized
  };
}

function normalizeListIndentation(value, { blockquotePrefix = '', previousNonEmptyLine = '' } = {}) {
  const indent = String(value ?? '');
  if (!indent || /[^ ]/u.test(indent)) {
    return indent;
  }

  if (indent.length >= 4) {
    return ' '.repeat(Math.max(2, Math.floor(indent.length / 4) * 2));
  }

  if (indent.length === 2) {
    const previousContext = extractListContext(previousNonEmptyLine);
    if (!previousContext || previousContext.blockquotePrefix !== blockquotePrefix) {
      return '';
    }

    return previousContext.indent.length >= 2 ? '  ' : '';
  }

  return '';
}

function extractListContext(line) {
  const match = String(line ?? '').match(/^(?<blockquote>(?:>\s*)*)(?<indent>\s*)(?<marker>(?:[*+-]|\d+\.))\s+(?<rest>.*)$/u);
  if (!match) {
    return null;
  }

  return {
    blockquotePrefix: match.groups.blockquote ?? '',
    indent: match.groups.indent ?? '',
    marker: match.groups.marker ?? '',
    rest: match.groups.rest ?? ''
  };
}

function stripBlockquotePrefix(line) {
  return String(line ?? '').replace(/^(?:>\s*)+/u, '');
}

function normalizeBlockquoteSpacing(content) {
  const lines = String(content ?? '').replace(/\r\n?/gu, '\n').split('\n');
  const normalizedLines = [];
  let normalizedBlockquoteLines = 0;
  let insideFence = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmedLine = line.trim();

    if (/^(`{3,}|~{3,})/u.test(trimmedLine)) {
      insideFence = !insideFence;
      normalizedLines.push(line);
      continue;
    }

    if (insideFence) {
      normalizedLines.push(line);
      continue;
    }

    if (trimmedLine.length === 0 || /^>\s*$/u.test(trimmedLine)) {
      const previous = normalizedLines.at(-1)?.trim() ?? '';
      const next = (lines[index + 1] ?? '').trim();
      if (previous.startsWith('>') && next.startsWith('>')) {
        normalizedBlockquoteLines += 1;
        continue;
      }
    }

    normalizedLines.push(line);
  }

  return {
    content: normalizedLines.join('\n'),
    normalizedBlockquoteLines
  };
}

function normalizeBlankLinesAroundLists(content) {
  const lines = String(content ?? '').replace(/\r\n?/gu, '\n').split('\n');
  const normalizedLines = [];
  let normalizedListSpacing = 0;
  let insideFence = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmedLine = line.trim();

    if (/^(`{3,}|~{3,})/u.test(trimmedLine)) {
      insideFence = !insideFence;
      normalizedLines.push(line);
      continue;
    }

    if (!insideFence && isMarkdownListLine(trimmedLine)) {
      const isBlockquoteList = /^(?:>\s*)+/.test(trimmedLine);
      const previousLine = normalizedLines.at(-1) ?? '';
      if (!isBlockquoteList && previousLine.trim().length > 0 && !isMarkdownListLine(previousLine.trim()) && !previousLine.trim().startsWith('> [!')) {
        normalizedLines.push('');
        normalizedListSpacing += 1;
      }

      normalizedLines.push(line);

      const nextLine = lines[index + 1] ?? '';
      if (!isBlockquoteList && nextLine.trim().length > 0 && !isMarkdownListLine(nextLine.trim()) && !startsNewMarkdownBlock(nextLine.trim())) {
        normalizedLines.push('');
        normalizedListSpacing += 1;
      }
      continue;
    }

    normalizedLines.push(line);
  }

  return {
    content: normalizedLines.join('\n').replace(/\n{3,}/gu, '\n\n'),
    normalizedListSpacing
  };
}

function isMarkdownListLine(value) {
  return /^(?:>\s*)*(?:[*+-]\s|\d+\.\s)/u.test(String(value ?? '').trim());
}

function normalizeRepositoryEntryLinks(content) {
  let normalizedEntries = 0;
  const repositoryPattern = /\[\s*\n+(?:###\s+Author\s*\n+)([\s\S]+?)\s+(Download & Install|Go to repository|Go to the tool|Got to the tool)\]\((https?:\/\/[^\s)]+)\)/gu;
  const normalizedContent = String(content ?? '').replace(repositoryPattern, (_match, author, action, href) => {
    normalizedEntries += 1;
    const normalizedAuthor = normalizeRepositoryEntryText(author);
    const normalizedAction = action === 'Got to the tool' ? 'Go to the tool' : action;
    return `**Author:** ${normalizedAuthor}\n\n[${normalizedAction}](${href})`;
  });

  return {
    content: normalizedContent,
    normalizedEntries
  };
}

function normalizeRepositoryEntryText(value) {
  return String(value ?? '')
    .replace(/\r\n?/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

function normalizeHeadingPunctuation(content) {
  const lines = String(content ?? '').replace(/\r\n?/gu, '\n').split('\n');
  const normalizedLines = [];
  let normalizedHeadings = 0;
  let insideFence = false;

  for (const line of lines) {
    if (/^(`{3,}|~{3,})/u.test(line.trim())) {
      insideFence = !insideFence;
      normalizedLines.push(line);
      continue;
    }

    if (insideFence) {
      normalizedLines.push(line);
      continue;
    }

    const headingMatch = line.match(/^(\s{0,3}#{1,6}\s+)(.*?)(\s+#+\s*)?$/u);
    if (!headingMatch) {
      normalizedLines.push(line);
      continue;
    }

    const headingText = headingMatch[2].trimEnd();
    const normalizedText = stripTrailingHeadingPunctuation(headingText);
    if (normalizedText !== headingText) {
      normalizedHeadings += 1;
    }

    normalizedLines.push(`${headingMatch[1]}${normalizedText}${headingMatch[3] ?? ''}`);
  }

  return {
    content: normalizedLines.join('\n'),
    normalizedHeadings
  };
}

function stripTrailingHeadingPunctuation(value) {
  const headingText = String(value ?? '');
  if (/[!?;:]$/u.test(headingText)) {
    return headingText.replace(/[!?;:]+$/u, '').trimEnd();
  }

  if (/\.$/u.test(headingText) && !/\b[A-Z]\.$/u.test(headingText)) {
    return headingText.replace(/\.+$/u, '').trimEnd();
  }

  return headingText;
}

function normalizeSpacedEmphasis(content) {
  const lines = String(content ?? '').replace(/\r\n?/gu, '\n').split('\n');
  const normalizedLines = [];
  let normalizedEmphasis = 0;
  let normalizedHeadingLikeEmphasis = 0;
  let insideFence = false;

  for (let index = 0; index < lines.length; index += 1) {
    let line = lines[index];

    if (/^(`{3,}|~{3,})/u.test(line.trim())) {
      insideFence = !insideFence;
      normalizedLines.push(line);
      continue;
    }

    if (insideFence) {
      normalizedLines.push(line);
      continue;
    }

    const nextLine = lines[index + 1] ?? '';
    if (/^\s*>\s*_[^_]+$/u.test(line) && /^\s*>\s*_\s*$/u.test(nextLine)) {
      line = `${line.trimEnd()}_`;
      normalizedEmphasis += 1;
      index += 1;
    }

    const standaloneEmphasis = normalizeStandaloneEmphasisLine({
      line,
      previousLine: lines[index - 1] ?? '',
      nextLine: lines[index + 1] ?? ''
    });
    if (standaloneEmphasis) {
      normalizedLines.push(standaloneEmphasis.line);
      normalizedEmphasis += 1;
      normalizedHeadingLikeEmphasis += standaloneEmphasis.normalizedHeadingLikeEmphasis;
      continue;
    }

    const normalizedLine = transformPreservingMarkdownLinks(line, rewriteEmphasisSpacingLine);

    if (normalizedLine !== line) {
      normalizedEmphasis += 1;
    }

    normalizedLines.push(normalizedLine);
  }

  return {
    content: normalizedLines.join('\n'),
    normalizedEmphasis,
    normalizedHeadingLikeEmphasis
  };
}

function normalizeStandaloneEmphasisLine({ line, previousLine, nextLine }) {
  const trimmedLine = String(line ?? '').trim();
  const match = trimmedLine.match(/^(\*\*|__|\*|_)(.+?)\1$/u);
  if (!match) {
    return null;
  }

  if (String(previousLine ?? '').trim().length > 0 || String(nextLine ?? '').trim().length > 0) {
    return null;
  }

  const label = match[2].trim();
  if (!label) {
    return null;
  }

  if (/[>/]/u.test(label) || label.length > 50) {
    return {
      line: label,
      normalizedHeadingLikeEmphasis: 1
    };
  }

  if (label.split(/\s+/u).length <= 6 && !/[.!?]$/u.test(label)) {
    return {
      line: `### ${stripTrailingHeadingPunctuation(label)}`,
      normalizedHeadingLikeEmphasis: 1
    };
  }

  return {
    line: label,
    normalizedHeadingLikeEmphasis: 1
  };
}

function rewriteEmphasisSpacingLine(value) {
  let current = String(value ?? '');
  for (let iteration = 0; iteration < 3; iteration += 1) {
    const next = current
      .replace(/^(\s*>\s*)_(\s+)(.+?)(\s+)_$/u, '$1_$3_')
      .replace(/^(\s*)_(\s+)(.+?)(\s+)_$/u, '$1_$3_')
      .replace(/^(\s*)_(\s+)(.+?)_$/u, '$1_$3_')
      .replace(/^(\s*)_(.+?)(\s+)_$/u, '$1_$2_')
      .replace(/\*\*(\s+)([^*\n]+?)\*\*/gu, '**$2**')
      .replace(/\*\*([^*\n]+?)(\s+)\*\*/gu, '**$1**')
      .replace(/\*\*([^*\n]+?)\s+\*\*(?=\S)/gu, '**$1** ')
      .replace(/\*\*(\s+)([^*\n]+?)(\s+)\*\*/gu, '**$2**')
      .replace(/\*(\s+)([^*\n]+?)(\s+)\*/gu, '*$2*')
      .replace(/_\s+([^_\n]+?)_/gu, '_$1_')
      .replace(/_([^_\n]+?)\s+_/gu, '_$1_')
      .replace(/\*\*([^*\n]+?)\s+:\*\*/gu, '**$1:**')
      .replace(/([A-Za-z0-9).,:;!?])(\*\*[^*\n]+?\*\*)/gu, '$1 $2')
      .replace(/(\*\*[^*\n]+?\*\*)([A-Za-z0-9(`])/gu, '$1 $2')
      .replace(/([A-Za-z0-9).,:;!?])(_[^_\n]+?_)/gu, '$1 $2')
      .replace(/(_[^_\n]+?_)([A-Za-z0-9(`])/gu, '$1 $2')
      .replace(/\*\*([^*\n]+)\*\*:\*\*/gu, '**$1:**')
      .replace(/\*\*([^*\n]+?)\*\*\*\*(?=[:;,.!?])/gu, '**$1**');
    if (next === current) {
      return next;
    }
    current = next;
  }
  return current;
}

function normalizeCodeSpanSpacing(content) {
  const lines = String(content ?? '').replace(/\r\n?/gu, '\n').split('\n');
  const normalizedLines = [];
  let normalizedCodeSpans = 0;
  let insideFence = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (/^(`{3,}|~{3,})/u.test(trimmedLine)) {
      insideFence = !insideFence;
      normalizedLines.push(line);
      continue;
    }

    if (insideFence) {
      normalizedLines.push(line);
      continue;
    }

    const normalizedLine = line
      .replace(/`([^`\n<]+)`<([^>\n]+)>``/gu, (_match, prefix, suffix) => {
        normalizedCodeSpans += 1;
        return `\`${prefix}<${suffix}>\``;
      })
      .replace(/`([^`\n<]+)`<([^>\n]+)>`([^`\n]+)`/gu, (_match, prefix, middle, suffix) => {
        normalizedCodeSpans += 1;
        return `\`${prefix}<${middle}>${suffix}\``;
      })
      .replace(/`<([^>\n`]+)`>/gu, (_match, inner) => {
        normalizedCodeSpans += 1;
        return `\`<${inner}>\``;
      })
      .replace(/``(<[^>\n]+>)`/gu, (_match, inner) => {
        normalizedCodeSpans += 1;
        return `\`${inner}\``;
      })
      .replace(/`([^`\n]*?)`/gu, (match, inner) => {
        const trimmedInner = inner.trim();
        if (!trimmedInner || trimmedInner === inner) {
          return match;
        }
        normalizedCodeSpans += 1;
        return `\`${trimmedInner}\``;
      });

    normalizedLines.push(normalizedLine);
  }

  return {
    content: normalizedLines.join('\n'),
    normalizedCodeSpans
  };
}

function normalizeMarkdownLinkTextSpacing(content) {
  let normalizedLinks = 0;
  const normalizedContent = String(content ?? '').replace(markdownLinkPattern, (_match, label, target) => {
    const trimmedLabel = label.replace(/\s+/gu, ' ').trim();
    const normalizedTarget = target.replace(/\s+/gu, '');
    if (trimmedLabel === label && normalizedTarget === target) {
      return `[${label}](${target})`;
    }
    normalizedLinks += 1;
    return `[${trimmedLabel}](${normalizedTarget})`;
  });

  return {
    content: normalizedContent,
    normalizedLinks
  };
}

function transformPreservingMarkdownLinks(line, transform) {
  const tokens = [];
  const protectedLine = String(line ?? '').replace(markdownLinkPattern, (match) => {
    const token = `§§RHILINK${tokens.length}§§`;
    tokens.push(match);
    return token;
  });
  const transformedLine = transform(protectedLine);
  return transformedLine.replace(/§§RHILINK(\d+)§§/gu, (_match, index) => tokens[Number.parseInt(index, 10)] ?? '');
}

function normalizeDuplicateHeadings(content) {
  const lines = String(content ?? '').replace(/\r\n?/gu, '\n').split('\n');
  const normalizedLines = [];
  const seenHeadings = new Set();
  const headingStack = [];
  let duplicateHeadingsDisambiguated = 0;
  let insideFence = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (/^(`{3,}|~{3,})/u.test(trimmedLine)) {
      insideFence = !insideFence;
      normalizedLines.push(line);
      continue;
    }

    if (insideFence) {
      normalizedLines.push(line);
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/u);
    if (!headingMatch) {
      normalizedLines.push(line);
      continue;
    }

    const level = headingMatch[1].length;
    const originalText = headingMatch[2].trim();
    let finalText = originalText;
    let normalizedKey = normalizeHeadingKey(finalText);

    if (seenHeadings.has(normalizedKey)) {
      duplicateHeadingsDisambiguated += 1;
      const parentContext = buildDuplicateHeadingContext(headingStack, level);
      finalText = parentContext ? `${originalText} (${parentContext})` : `${originalText} (${countHeadingOccurrences(seenHeadings, normalizedKey) + 1})`;
      normalizedKey = normalizeHeadingKey(finalText);
      let suffix = 2;
      while (seenHeadings.has(normalizedKey)) {
        finalText = `${originalText} (${parentContext || 'Section'} ${suffix})`;
        normalizedKey = normalizeHeadingKey(finalText);
        suffix += 1;
      }
    }

    seenHeadings.add(normalizedKey);
    headingStack[level - 1] = finalText;
    headingStack.length = level;
    normalizedLines.push(`${headingMatch[1]} ${finalText}`);
  }

  return {
    content: normalizedLines.join('\n'),
    duplicateHeadingsDisambiguated
  };
}

function buildDuplicateHeadingContext(headingStack, level) {
  const parent = headingStack[level - 2] ?? '';
  return String(parent).trim();
}

function countHeadingOccurrences(seenHeadings, keyPrefix) {
  let count = 0;
  for (const key of seenHeadings) {
    if (key === keyPrefix || key.startsWith(`${keyPrefix}(`)) {
      count += 1;
    }
  }
  return count;
}

function normalizeHeadingKey(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\[([^\]]+)\]\([^)]*\)/gu, '$1')
    .replace(/[`*_]/gu, '')
    .replace(/[^a-z0-9\s-]/gu, '')
    .replace(/\s+/gu, ' ')
    .trim();
}

function wrapBareUrls(content) {
  const lines = String(content ?? '').replace(/\r\n?/gu, '\n').split('\n');
  const normalizedLines = [];
  let wrappedUrls = 0;
  let insideFence = false;

  for (const line of lines) {
    if (/^(`{3,}|~{3,})/u.test(line.trim())) {
      insideFence = !insideFence;
      normalizedLines.push(line);
      continue;
    }

    if (insideFence) {
      normalizedLines.push(line);
      continue;
    }

    let normalizedLine = line;
    normalizedLine = normalizedLine.replace(/(?<!\]\()(?<![\[<])\bhttps?:\/\/[^\s<>()]+[^\s<>().,!?;:]/gu, (match) => {
      wrappedUrls += 1;
      return `<${match}>`;
    });
    normalizedLine = normalizedLine.replace(/(?<!\]\()(?<![\w/<])\bwww\.[^\s<>()]+[^\s<>().,!?;:]/gu, (match) => {
      wrappedUrls += 1;
      return `<${match}>`;
    });
    normalizedLine = normalizedLine.replace(/(?<!\]\()(?<![\[<`])\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu, (match) => {
      wrappedUrls += 1;
      return `<${match}>`;
    });
    normalizedLines.push(normalizedLine);
  }

  return {
    content: normalizedLines.join('\n'),
    wrappedUrls
  };
}

function normalizeInPageFragments(content) {
  const headingSlugs = collectHeadingSlugs(content);
  let normalizedFragments = 0;
  const normalizedContent = String(content ?? '').replace(markdownLinkPattern, (match, label, target) => {
    if (!target.startsWith('#')) {
      return match;
    }

    const fragment = target.slice(1);
    if (headingSlugs.has(fragment)) {
      return match;
    }

    const fallbackFragment = findClosestHeadingSlug(headingSlugs, fragment);
    if (fallbackFragment) {
      normalizedFragments += 1;
      return `[${label}](#${fallbackFragment})`;
    }

    if (fragment === 'steptypes') {
      normalizedFragments += 1;
      return label;
    }

    if (/leave a reply/iu.test(label)) {
      normalizedFragments += 1;
      return label;
    }

    return match;
  });

  return {
    content: normalizedContent,
    normalizedFragments
  };
}

function collectHeadingSlugs(content) {
  const slugs = new Set();
  const lines = String(content ?? '').replace(/\r\n?/gu, '\n').split('\n');
  let insideFence = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (/^(`{3,}|~{3,})/u.test(trimmedLine)) {
      insideFence = !insideFence;
      continue;
    }

    if (insideFence) {
      continue;
    }

    const headingMatch = line.match(/^#{1,6}\s+(.+)$/u);
    if (!headingMatch) {
      continue;
    }

    slugs.add(slugifyHeading(headingMatch[1]));
  }

  return slugs;
}

function findClosestHeadingSlug(headingSlugs, fragment) {
  const normalizedFragment = String(fragment ?? '').toLowerCase();
  const fragmentComparable = normalizedFragment.replace(/-/gu, '');
  for (const slug of headingSlugs) {
    const comparable = slug.replace(/-/gu, '');
    if (slug === normalizedFragment || slug.startsWith(normalizedFragment) || comparable === fragmentComparable || comparable.startsWith(fragmentComparable)) {
      return slug;
    }
  }
  return '';
}

function slugifyHeading(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\[([^\]]+)\]\([^)]*\)/gu, '$1')
    .replace(/[`*_]/gu, '')
    .replace(/[^a-z0-9\s-]/gu, '')
    .trim()
    .replace(/\s+/gu, '-');
}

function normalizeInlineHtmlTokens(content) {
  let normalizedContent = String(content ?? '')
    .replace(/<HTTP _Method>/gu, '&lt;HTTP Method&gt;')
    .replace(/<POD-No\.>/gu, '&lt;POD-No.&gt;')
    .replace(/<Cylinder>/gu, '&lt;Cylinder&gt;');
  const lines = normalizedContent.replace(/\r\n?/gu, '\n').split('\n');
  const normalizedLines = [];
  let escapedTokens = 0;
  let insideFence = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (/^(`{3,}|~{3,})/u.test(trimmedLine)) {
      insideFence = !insideFence;
      normalizedLines.push(line);
      continue;
    }

    if (insideFence || /^<!--/u.test(trimmedLine) || /^<[^>]+>$/u.test(trimmedLine)) {
      normalizedLines.push(line);
      continue;
    }

    const normalizedLine = line.replace(/<\/?[A-Za-z][^>\n]*>/gu, (match, offset, source) => {
      const before = source.slice(0, offset);
      const after = source.slice(offset + match.length);
      if (before.endsWith('`') && after.startsWith('`')) {
        return match;
      }
      escapedTokens += 1;
      return `\`${match}\``;
    });
    normalizedLines.push(normalizedLine);
  }

  return {
    content: normalizedLines.join('\n'),
    escapedTokens
  };
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

function normalizeMarkdownTables(content) {
  const lines = String(content ?? '').replace(/\r\n?/gu, '\n').split('\n');
  const normalizedLines = [];
  let normalizedTables = 0;
  let multilineTablesNormalized = 0;
  let insideFence = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^(`{3,}|~{3,})/u.test(line.trim())) {
      insideFence = !insideFence;
      normalizedLines.push(line);
      continue;
    }

    if (insideFence || !looksLikeTableLine(line) || !tableDividerPattern.test(lines[index + 1] ?? '')) {
      normalizedLines.push(line);
      continue;
    }

    const tableBlock = collectTableBlock(lines, index);
    const normalizedMultilineTable = normalizeMultilineTableRows(tableBlock.lines);
    const normalizedTable = normalizeTableHeaderRow(normalizedMultilineTable.lines);
    if (normalizedLines.length > 0 && normalizedLines.at(-1) !== '') {
      normalizedLines.push('');
    }
    normalizedLines.push(...normalizedTable.lines);
    normalizedTables += normalizedTable.normalizedTables;
    multilineTablesNormalized += normalizedMultilineTable.normalizedTables;
    if (tableBlock.nextIndex < lines.length && lines[tableBlock.nextIndex].trim().length > 0) {
      normalizedLines.push('');
    }
    index = tableBlock.nextIndex - 1;
  }

  return {
    content: normalizedLines.join('\n'),
    normalizedTables,
    multilineTablesNormalized
  };
}

function collectTableBlock(lines, startIndex) {
  const collectedLines = [lines[startIndex], lines[startIndex + 1]];
  let index = startIndex + 2;
  let currentRow = [];
  const expectedCells = splitTableCells(lines[startIndex]).length;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (trimmed.length === 0 && currentRow.length === 0) {
      break;
    }

    if (/^(`{3,}|~{3,})/u.test(trimmed)) {
      break;
    }

    if (/^\s*\|/u.test(line)) {
      if (currentRow.length > 0) {
        collectedLines.push(...currentRow);
      }
      currentRow = [line];
      index += 1;
      continue;
    }

    if (currentRow.length === 0) {
      break;
    }

    if (isTableRowClosed(currentRow, expectedCells) && trimmed.length > 0) {
      break;
    }

    currentRow.push(line);
    index += 1;
  }

  if (currentRow.length > 0) {
    collectedLines.push(...currentRow);
  }

  return {
    lines: collectedLines,
    nextIndex: index
  };
}

function isTableRowClosed(rowLines, expectedCells) {
  const rowText = rowLines.join('\n').trim();
  if (!rowText.endsWith('|')) {
    return false;
  }

  return splitRawTableRow(rowText).length === expectedCells;
}

function normalizeMultilineTableRows(tableLines) {
  if (tableLines.length < 3) {
    return {
      lines: tableLines,
      normalizedTables: 0
    };
  }

  const normalizedLines = [tableLines[0], tableLines[1]];
  const expectedCells = splitTableCells(tableLines[0]).length;
  let index = 2;
  let normalizedTables = 0;

  while (index < tableLines.length) {
    const rowBlock = [tableLines[index]];
    index += 1;

    while (index < tableLines.length && !/^\s*\|/u.test(tableLines[index])) {
      rowBlock.push(tableLines[index]);
      index += 1;
    }

    const normalizedRow = normalizeMultilineTableRow(rowBlock, expectedCells);
    if (normalizedRow.changed) {
      normalizedTables += 1;
    }
    normalizedLines.push(normalizedRow.line);
  }

  return {
    lines: normalizedLines,
    normalizedTables
  };
}

function normalizeMultilineTableRow(rowLines, expectedCells) {
  const sourceText = rowLines.join('\n');
  const cells = splitRawTableRow(sourceText);
  if (cells.length !== expectedCells) {
    return {
      line: rowLines[0],
      changed: false
    };
  }

  const normalizedCells = cells.map((cell) => cell
    .replace(/\r\n?/gu, '\n')
    .split(/\n\s*\n+/u)
    .map((part) => part.replace(/\s*\n\s*/gu, ' ').replace(/\s+/gu, ' ').trim())
    .filter(Boolean)
    .join(' '));
  const normalizedLine = `| ${normalizedCells.join(' | ')} |`;

  return {
    line: normalizedLine,
    changed: normalizedLine !== rowLines[0] || rowLines.length > 1
  };
}

function splitRawTableRow(value) {
  const normalized = String(value ?? '').trim();
  if (!normalized.startsWith('|') || !normalized.endsWith('|')) {
    return [];
  }

  return normalized
    .slice(1, -1)
    .split('|')
    .map((cell) => cell.trim());
}

function normalizeTableHeaderRow(tableLines) {
  if (tableLines.length < 3) {
    return {
      lines: tableLines,
      normalizedTables: 0
    };
  }

  const headerCells = splitTableCells(tableLines[0]);
  if (headerCells.length === 0 || headerCells.some((cell) => cell.length > 0)) {
    return {
      lines: tableLines,
      normalizedTables: 0
    };
  }

  if (!tableDividerPattern.test(tableLines[1])) {
    return {
      lines: tableLines,
      normalizedTables: 0
    };
  }

  const promotedHeaderCells = splitTableCells(tableLines[2]);
  if (promotedHeaderCells.length === 0 || promotedHeaderCells.every((cell) => cell.length === 0)) {
    return {
      lines: tableLines,
      normalizedTables: 0
    };
  }

  return {
    lines: [tableLines[2], tableLines[1], ...tableLines.slice(3)],
    normalizedTables: 1
  };
}

function normalizeInlineLabelCallouts(content) {
  const lines = String(content ?? '').replace(/\r\n?/gu, '\n').split('\n');
  const normalizedLines = [];
  let normalizedCallouts = 0;
  let insideFence = false;
  let paragraphLines = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) {
      return;
    }

    const paragraphText = paragraphLines.join(' ').replace(/\s+/gu, ' ').trim();
    paragraphLines = [];
    if (!paragraphText) {
      return;
    }

    const rewritten = rewriteParagraphWithInlineLabels(paragraphText);
    normalizedLines.push(...rewritten.lines);
    normalizedCallouts += rewritten.normalizedCallouts;
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (/^(`{3,}|~{3,})/u.test(trimmedLine)) {
      flushParagraph();
      insideFence = !insideFence;
      normalizedLines.push(line);
      continue;
    }

    if (insideFence) {
      normalizedLines.push(line);
      continue;
    }

    if (trimmedLine.length === 0) {
      flushParagraph();
      if (normalizedLines.at(-1) !== '') {
        normalizedLines.push('');
      }
      continue;
    }

    if (startsNewMarkdownBlock(trimmedLine) || isStandaloneImageLine(trimmedLine)) {
      flushParagraph();
      normalizedLines.push(line);
      continue;
    }

    paragraphLines.push(trimmedLine);
  }

  flushParagraph();

  return {
    content: normalizedLines.join('\n').replace(/\n{3,}/gu, '\n\n'),
    normalizedCallouts
  };
}

function rewriteParagraphWithInlineLabels(paragraphText) {
  const labelMatches = findInlineLabelMatches(paragraphText);
  if (labelMatches.length === 0) {
    return {
      lines: [paragraphText],
      normalizedCallouts: 0
    };
  }

  const renderedBlocks = [];
  let cursor = 0;

  for (let index = 0; index < labelMatches.length; index += 1) {
    const match = labelMatches[index];
    const prefix = paragraphText.slice(cursor, match.index).trim();
    if (prefix) {
      renderedBlocks.push(prefix);
    }

    const nextIndex = index + 1 < labelMatches.length ? labelMatches[index + 1].index : paragraphText.length;
    const body = paragraphText.slice(match.index + match.label.length, nextIndex).trim();
    if (body) {
      renderedBlocks.push(buildInlineLabelCallout(match.label, match.type, body));
    } else {
      renderedBlocks.push(match.label);
    }
    cursor = nextIndex;
  }

  const tail = paragraphText.slice(cursor).trim();
  if (tail) {
    renderedBlocks.push(tail);
  }

  const lines = [];
  renderedBlocks.forEach((block, index) => {
    if (index > 0) {
      lines.push('');
    }

    if (Array.isArray(block)) {
      lines.push(...block);
      return;
    }

    lines.push(block);
  });

  return {
    lines,
    normalizedCallouts: labelMatches.length
  };
}

function findInlineLabelMatches(paragraphText) {
  const lowerText = paragraphText.toLowerCase();
  const matches = [];

  for (const label of inlineLabelCandidates) {
    let searchIndex = 0;
    while (searchIndex < lowerText.length) {
      const index = lowerText.indexOf(label, searchIndex);
      if (index === -1) {
        break;
      }

      if (isInlineLabelBoundary(paragraphText, index, label)) {
        matches.push({
          index,
          label: paragraphText.slice(index, index + label.length),
          type: inlineLabelTypeByLabel.get(label)
        });
      }

      searchIndex = index + label.length;
    }
  }

  return matches
    .sort((left, right) => left.index - right.index || right.label.length - left.label.length)
    .filter((match, index, collection) => {
      if (index === 0) {
        return true;
      }

      const previous = collection[index - 1];
      return match.index >= previous.index + previous.label.length;
    });
}

function isInlineLabelBoundary(text, index, label) {
  const before = text.slice(0, index).trimEnd();
  if (before.length > 0) {
    const previousCharacter = before.at(-1);
    if (!previousCharacter || !'.!?:'.includes(previousCharacter)) {
      return false;
    }
  }

  const after = text.slice(index + label.length);
  const whitespaceMatch = after.match(/^\s+/u);
  if (!whitespaceMatch) {
    return false;
  }

  const nextCharacter = after.slice(whitespaceMatch[0].length).charAt(0);
  return /[A-Z0-9("“‘]/u.test(nextCharacter);
}

function buildInlineLabelCallout(label, type, body) {
  return [
    `> [!${String(type ?? 'note').toUpperCase()}]`,
    `> **${formatInlineLabel(label)}:** ${body}`
  ];
}

function formatInlineLabel(label) {
  return String(label ?? '')
    .split(/\s+/u)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(' ');
}

function normalizeBrokenInlineLinks(content) {
  let repairedLinks = 0;
  const normalizedContent = String(content ?? '').replace(
    brokenInlineLinkPattern,
    (match, label, target, suffix) => {
      repairedLinks += 1;
      return `[${label}${suffix}](${target})`;
    }
  );

  return {
    content: normalizedContent,
    repairedLinks
  };
}

function normalizePseudoTagMarkup(content) {
  let normalizedPatterns = 0;
  let normalizedContent = String(content ?? '');

  normalizedContent = normalizedContent.replace(
    /`\[`<iscache>`\]\((https:\/\/developer\.salesforce\.com\/docs\/commerce\/b2c-commerce\/guide\/b2c-content-cache\.html)\)`/gu,
    (_match, target) => {
      normalizedPatterns += 1;
      return `[ <iscache> ](${target})`;
    }
  );

  normalizedContent = normalizedContent.replace(
    /`https:\/\/logcenter-`<POD-No\.>``<Cylinder>`-hippo\.demandware\.net\/logcenter`/gu,
    () => {
      normalizedPatterns += 1;
      return '`https://logcenter-<POD-No.><Cylinder>-hippo.demandware.net/logcenter`';
    }
  );

  normalizedContent = normalizedContent.replace(/\u0000/gu, '`');

  return {
    content: normalizedContent,
    normalizedPatterns
  };
}

function splitMixedImageLine(line) {
  if (!line.includes('![')) {
    return [line];
  }

  const blocks = [];
  let lastIndex = 0;

  for (const match of line.matchAll(linkedImageTokenPattern)) {
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
    .replace(/\[([^\]]*)\]\([^)]*\)/gu, '$1')
    .replace(/[_*`>#-]/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim().length > 0;
}

function isStandaloneImageLine(value) {
  return standaloneImagePattern.test(value);
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

  const imagePattern = /\[\s*!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\s*\]\(([^)]+)\)|!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/gu;
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

function applyLinkTextCorrections({ bodyContent, pageUrl, fileLabel, correctionsByKey, seenCorrectionKeys, auditRows }) {
  if (!pageUrl || correctionsByKey.size === 0) {
    return {
      content: bodyContent,
      appliedCount: 0
    };
  }

  const linkOccurrences = new Map();
  let appliedCount = 0;

  const content = bodyContent.replace(markdownLinkPattern, (match, linkText, rawTarget) => {
    const normalizedTarget = normalizeLinkTarget(extractMarkdownTarget(rawTarget));
    const nextOccurrenceIndex = (linkOccurrences.get(normalizedTarget) ?? 0) + 1;
    linkOccurrences.set(normalizedTarget, nextOccurrenceIndex);

    const correctionKey = buildLinkCorrectionKey(pageUrl, normalizedTarget, nextOccurrenceIndex);
    const correction = correctionsByKey.get(correctionKey);
    if (!correction) {
      return match;
    }

    seenCorrectionKeys.add(correctionKey);
    if (normalizeLinkTextValue(linkText) === correction.correctedText) {
      auditRows.push({
        page_url: pageUrl,
        target: normalizedTarget,
        occurrence_index: nextOccurrenceIndex,
        original_text: linkText,
        corrected_text: correction.correctedText,
        source_file: correction.sourceFile || fileLabel,
        status: 'already-current'
      });
      return match;
    }

    appliedCount += 1;
    auditRows.push({
      page_url: pageUrl,
      target: normalizedTarget,
      occurrence_index: nextOccurrenceIndex,
      original_text: linkText,
      corrected_text: correction.correctedText,
      source_file: correction.sourceFile || fileLabel,
      status: 'applied'
    });

    return `[${escapeMarkdownLinkText(correction.correctedText)}](${rawTarget})`;
  });

  return {
    content,
    appliedCount
  };
}

function buildCorrectionKey(pageUrl, imageSrc, occurrenceIndex = 1) {
  return `${pageUrl}\u0000${imageSrc}\u0000${occurrenceIndex}`;
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

function normalizeAltText(value) {
  return String(value ?? '').replace(/\r\n?/gu, ' ').replace(/\s+/gu, ' ').trim();
}

function normalizeLinkTextValue(value) {
  return String(value ?? '').replace(/\r\n?/gu, ' ').replace(/\s+/gu, ' ').trim();
}

function normalizeOccurrenceIndex(value) {
  const parsedValue = Number.parseInt(String(value ?? '1').trim(), 10);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 1;
}

function escapeMarkdownAlt(value) {
  return normalizeAltText(value).replace(/\]/gu, '\\]');
}

function escapeMarkdownLinkText(value) {
  return normalizeLinkTextValue(value).replace(/\]/gu, '\\]');
}

function serializeAltAuditRows(rows) {
  return stringifyCsv(rows, {
    header: true,
    columns: ['page_url', 'image_src', 'occurrence_index', 'original_alt', 'corrected_alt', 'source_file', 'status']
  });
}

function serializeLinkAuditRows(rows) {
  return stringifyCsv(rows, {
    header: true,
    columns: ['page_url', 'target', 'occurrence_index', 'original_text', 'corrected_text', 'source_file', 'status']
  });
}

function looksLikeTableLine(line) {
  const trimmed = String(line ?? '').trim();
  if (!trimmed || trimmed.startsWith('>')) {
    return false;
  }
  return (trimmed.match(/\|/gu) ?? []).length >= 2;
}

function splitTableCells(line) {
  const trimmed = String(line ?? '').trim().replace(/^\||\|$/gu, '');
  return trimmed.split('|').map((cell) => cell.trim());
}

function extractMarkdownTarget(rawTarget) {
  return String(rawTarget ?? '')
    .trim()
    .replace(/^<|>$/gu, '')
    .split(/\s+['"]/u, 1)[0];
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
