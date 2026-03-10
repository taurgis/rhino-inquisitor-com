import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { load as loadHtml } from 'cheerio';
import { stringify as stringifyCsv } from 'csv-stringify/sync';
import TurndownService from 'turndown';
import { gfm } from '@joplin/turndown-plugin-gfm';

import { CanonicalRecordSchema } from './schemas/record.schema.js';
import { ConvertedRecordSchema } from './schemas/converted-record.schema.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outputFileSuffix = '.json';
const inScopeDispositions = new Set(['keep', 'merge']);
const presentationAttributes = new Set(['class', 'id', 'style']);
const removableSvgTags = new Set(['svg', 'path', 'use', 'circle', 'ellipse', 'g', 'line', 'polyline', 'polygon', 'rect']);
const blockLevelHtmlTags = new Set([
  'audio', 'blockquote', 'br', 'div', 'figcaption', 'figure', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'iframe', 'img', 'li', 'ol',
  'p', 'picture', 'pre', 'section', 'summary', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul', 'video'
]);
const shortcodeNoteByTag = new Map([
  ['matomo_opt_out', 'Legacy Matomo opt-out widget removed during migration. Add a Hugo-safe replacement before publishing.'],
  ['cmplz-document', 'Legacy Complianz document shortcode removed during migration. Recreate the required consent or cookie statement in Hugo before publishing.']
]);

async function main() {
  const options = await resolveOptions(process.argv.slice(2));
  const normalizedRecords = await readJsonFile(options.recordsFile, 'normalized records');

  if (!Array.isArray(normalizedRecords)) {
    throw new Error('Expected normalized records input to be an array.');
  }

  const recordsToConvert = sortRecords(
    normalizedRecords
      .map((record) => {
        const validation = CanonicalRecordSchema.safeParse(record);
        if (!validation.success) {
          throw new Error(`Normalized record ${record?.sourceId ?? 'unknown'} failed schema validation: ${validation.error.message}`);
        }
        return validation.data;
      })
      .filter((record) => inScopeDispositions.has(record.disposition))
  );

  await ensureDirectory(options.outputDir);
  await ensureDirectory(path.dirname(options.fallbackReport));
  await cleanOutputDirectory(options.outputDir);

  const fallbackRows = [];
  const metrics = {
    convertedCount: 0,
    skippedCount: 0,
    warningCount: 0,
    manualReviewCount: 0
  };

  for (const record of recordsToConvert) {
    const convertedRecord = convertRecord(record, fallbackRows);
    const validation = ConvertedRecordSchema.safeParse(convertedRecord);

    if (!validation.success) {
      throw new Error(`Converted record ${record.sourceId} failed schema validation: ${validation.error.message}`);
    }

    metrics.warningCount += validation.data.conversionWarnings.length;
    metrics.manualReviewCount += validation.data.manualReviewRequired ? 1 : 0;
    metrics[validation.data.conversionStatus === 'skipped' ? 'skippedCount' : 'convertedCount'] += 1;

    const outputPath = path.join(options.outputDir, `${validation.data.sourceId}${outputFileSuffix}`);
    await writeJsonFile(outputPath, stabilizeConvertedRecord(validation.data));
  }

  const sortedFallbackRows = sortFallbackRows(fallbackRows);
  await fsp.writeFile(options.fallbackReport, serializeFallbackRows(sortedFallbackRows), 'utf8');

  console.log(
    [
      `Converted ${recordsToConvert.length} keep/merge record(s).`,
      `Markdown outputs written to ${toRepoRelative(options.outputDir)}.`,
      `Fallback entries: ${sortedFallbackRows.length}.`,
      `Warnings: ${metrics.warningCount}.`,
      `Manual review required: ${metrics.manualReviewCount}.`
    ].join(' ')
  );

  if (sortedFallbackRows.length > 0) {
    console.warn(
      `Review ${toRepoRelative(options.fallbackReport)} before using fallback-marked records in a merge batch.`
    );
  }
}

async function resolveOptions(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case '--records-file':
        parsed.recordsFile = path.resolve(argv[++index]);
        break;
      case '--output-dir':
        parsed.outputDir = path.resolve(argv[++index]);
        break;
      case '--fallback-report':
        parsed.fallbackReport = path.resolve(argv[++index]);
        break;
      case '--help':
        printHelp();
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return {
    recordsFile: parsed.recordsFile ?? path.join(repoRoot, 'migration/intermediate/records.normalized.json'),
    outputDir: parsed.outputDir ?? path.join(repoRoot, 'migration/output'),
    fallbackReport: parsed.fallbackReport ?? path.join(repoRoot, 'migration/reports/conversion-fallbacks.csv')
  };
}

function printHelp() {
  console.log(`Usage: node scripts/migration/convert.js [options]

Options:
  --records-file <path>     Override migration/intermediate/records.normalized.json.
  --output-dir <path>       Override migration/output/.
  --fallback-report <path>  Override migration/reports/conversion-fallbacks.csv.
  --help                    Show this help message.
`);
}

function convertRecord(record, fallbackRows) {
  const bodyHtml = String(record.bodyHtml ?? '');
  if (bodyHtml.trim().length === 0) {
    return {
      ...record,
      bodyMarkdown: '',
      conversionStatus: 'skipped',
      manualReviewRequired: false,
      fallbackTypes: [],
      conversionWarnings: []
    };
  }

  const warnings = [];
  const recordFallbackRows = [];
  const preprocessedHtml = preprocessHtml({
    bodyHtml,
    record,
    warnings,
    fallbackRows: recordFallbackRows
  });
  const turndownService = createTurndownService();
  let bodyMarkdown = turndownService.turndown(preprocessedHtml);

  const postProcessed = postProcessMarkdown({
    bodyMarkdown,
    record,
    fallbackRows: recordFallbackRows,
    warnings
  });

  bodyMarkdown = postProcessed.bodyMarkdown;
  if (postProcessed.hasUnexpectedHtml) {
    const rawHtmlFallback = buildFallbackBlock({
      fallbackType: 'raw-html-fragment',
      source: preprocessedHtml,
      label: 'Preserved HTML fragment for manual review.'
    });
    bodyMarkdown = `${bodyMarkdown}\n\n${rawHtmlFallback}`.trim();
    recordFallbackRows.push(
      createFallbackRow({
        record,
        fallbackType: 'raw-html-fragment',
        manualReviewNote: 'Residual HTML remained after conversion. Review the preserved fallback fragment before batch inclusion.'
      })
    );
  }

  const uniqueFallbackTypes = [...new Set(recordFallbackRows.map((row) => row.fallbackType))].sort((left, right) => left.localeCompare(right));
  fallbackRows.push(...recordFallbackRows);

  return {
    ...record,
    bodyMarkdown,
    conversionStatus: 'converted',
    manualReviewRequired: uniqueFallbackTypes.length > 0,
    fallbackTypes: uniqueFallbackTypes,
    conversionWarnings: sortWarnings(warnings)
  };
}

function preprocessHtml({ bodyHtml, record, warnings, fallbackRows }) {
  const normalizedHtml = stripWordPressArtifacts(bodyHtml);
  const $ = loadHtml(normalizedHtml, null, false);

  removeCommentNodes($);
  $('style, script').remove();
  $([...removableSvgTags].join(',')).remove();
  unwrapPresentationalWrappers($, 'div');
  unwrapPresentationalWrappers($, 'span');
  $('a').each((_, element) => sanitizeAnchor($, element));
  $('img').each((_, element) => sanitizeImage($, element, record, warnings));
  $('iframe').each((_, element) => replaceIframe($, element, record, fallbackRows));
  $('xmp').each((_, element) => replaceXmp($, element));
  stripPresentationAttributes($);

  $('h1').each((_, element) => {
    element.tagName = 'h2';
  });

  return $.root().html() ?? '';
}

function stripWordPressArtifacts(html) {
  return String(html ?? '')
    .replace(/\uFEFF/gu, '')
    .replace(/<!--\s*\/?wp:[\s\S]*?-->/giu, '')
    .replace(/<!--\s*more\s*-->/giu, '')
    .replace(/\[caption[^\]]*\]([\s\S]*?)\[\/caption\]/giu, '$1')
    .replace(/\[gallery[^\]]*\]/giu, '')
    .replace(/\[embed[^\]]*\]([\s\S]*?)\[\/embed\]/giu, '$1')
    .replace(/\[(?:Read more|\.\.\.|…|\u2026)\]/giu, '');
}

function removeCommentNodes($) {
  $.root().find('*').contents().each((_, node) => {
    if (node.type === 'comment') {
      $(node).remove();
    }
  });
}

function sanitizeAnchor($, element) {
  const anchor = $(element);
  const href = anchor.attr('href');
  if (!href || href.trim().length === 0) {
    anchor.replaceWith(anchor.contents());
    return;
  }

  anchor.removeAttr('target');
  anchor.removeAttr('rel');
  anchor.removeAttr('role');
}

function sanitizeImage($, element, record, warnings) {
  const image = $(element);
  if (!image.attr('alt')) {
    warnings.push({
      code: 'missing-image-alt',
      message: `Image missing alt text in ${record.legacyUrl}.`
    });
    image.attr('alt', '');
  }

  image.removeAttr('loading');
  image.removeAttr('decoding');
  image.removeAttr('srcset');
  image.removeAttr('sizes');
}

function replaceIframe($, element, record, fallbackRows) {
  const iframe = $(element);
  const src = String(iframe.attr('src') ?? '').trim();
  const youtubeId = extractYouTubeId(src);

  if (youtubeId) {
    iframe.replaceWith(`<div data-rhi-placeholder="youtube" data-youtube-id="${youtubeId}"></div>`);
    return;
  }

  iframe.replaceWith(`<div data-rhi-placeholder="iframe-comment" data-iframe-src="${escapeAttribute(src || 'missing-src')}"></div>`);
  fallbackRows.push(
    createFallbackRow({
      record,
      fallbackType: 'unknown-iframe',
      manualReviewNote: `Unknown iframe source ${src || 'missing-src'} preserved as a manual-review marker.`
    })
  );
}

function replaceXmp($, element) {
  const xmp = $(element);
  xmp.replaceWith(xmp.text());
}

function unwrapPresentationalWrappers($, tagName) {
  $(tagName).each((_, element) => {
    const wrapper = $(element);
    if (!hasSemanticAttributes(wrapper) && wrapper.parent().length > 0) {
      wrapper.replaceWith(wrapper.contents());
    }
  });
}

function hasSemanticAttributes(node) {
  if (node.attr('data-rhi-placeholder')) {
    return true;
  }

  const attributes = node.attr() ?? {};
  return Object.keys(attributes).some((name) => {
    if (presentationAttributes.has(name)) {
      return false;
    }

    if (name.startsWith('data-') || name.startsWith('aria-')) {
      return false;
    }

    return true;
  });
}

function stripPresentationAttributes($) {
  $('*').each((_, element) => {
    const node = $(element);
    const attributes = element.attribs ?? {};
    const keepCodeClass = ['code', 'pre'].includes(element.tagName?.toLowerCase()) && attributes.class;

    for (const name of Object.keys(attributes)) {
      if (name === 'class' && keepCodeClass) {
        continue;
      }

      if (name.startsWith('data-rhi-')) {
        continue;
      }

      if (presentationAttributes.has(name) || name.startsWith('data-') || name.startsWith('aria-')) {
        node.removeAttr(name);
      }
    }
  });
}

function createTurndownService() {
  const service = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    fence: '```'
  });
  service.use(gfm);

  service.addRule('rhi-placeholder', {
    filter(node) {
      return node.nodeName?.toLowerCase() === 'div' && node.getAttribute('data-rhi-placeholder') != null;
    },
    replacement(_content, node) {
      const kind = node.getAttribute('data-rhi-placeholder');
      if (kind === 'youtube') {
        return `\n\n{{< youtube ${node.getAttribute('data-youtube-id')} >}}\n\n`;
      }

      if (kind === 'iframe-comment') {
        return `\n\n<!-- iframe: ${node.getAttribute('data-iframe-src')} -->\n\n`;
      }

      return '\n\n';
    }
  });

  service.addRule('preformatted-code', {
    filter(node) {
      return node.nodeName?.toLowerCase() === 'pre';
    },
    replacement(_content, node) {
      const textContent = normalizeCodeText(node.textContent ?? '');
      if (textContent.length === 0) {
        return '\n\n';
      }

      const language = detectCodeLanguage(node);
      const fence = chooseFence(textContent);
      const infoString = language ? `${language}` : '';
      return `\n\n${fence}${infoString}\n${textContent}\n${fence}\n\n`;
    }
  });

  return service;
}

function normalizeCodeText(value) {
  return String(value ?? '')
    .replace(/\r\n?/gu, '\n')
    .replace(/^\n+|\n+$/gu, '');
}

function detectCodeLanguage(node) {
  const attributeSources = [
    node.getAttribute('class') ?? '',
    node.firstElementChild?.getAttribute?.('class') ?? ''
  ];

  for (const source of attributeSources) {
    const lowerSource = String(source).toLowerCase();
    const languageMatch = lowerSource.match(/(?:language-|lang-|brush:\s*)([a-z0-9#+-]+)/u);
    if (languageMatch) {
      return languageMatch[1];
    }
  }

  return '';
}

function chooseFence(textContent) {
  const maxBacktickRun = Math.max(0, ...[...textContent.matchAll(/`+/gu)].map((match) => match[0].length));
  return '`'.repeat(Math.max(3, maxBacktickRun + 1));
}

function postProcessMarkdown({ bodyMarkdown, record, fallbackRows, warnings }) {
  const lines = String(bodyMarkdown ?? '').replace(/\r\n?/gu, '\n').split('\n');
  const processedLines = [];
  let insideFence = false;

  for (const line of lines) {
    if (/^`{3,}/u.test(line.trim())) {
      insideFence = !insideFence;
      processedLines.push(line);
      continue;
    }

    if (insideFence) {
      processedLines.push(line);
      continue;
    }

    const trimmedLine = line.trim();
    const unescapedShortcodeLine = trimmedLine.replace(/\\([\[\]_])/gu, '$1');
    const shortcodeMatch = unescapedShortcodeLine.match(/^\[([a-z][a-z0-9_-]*)([^\]]*)\]$/iu);
    if (shortcodeMatch) {
      const tag = shortcodeMatch[1].toLowerCase();
      if (shortcodeNoteByTag.has(tag)) {
        warnings.push({
          code: 'shortcode-converted-to-note',
          message: `Shortcode ${tag} in ${record.legacyUrl} converted to an explicit Markdown note.`
        });
        processedLines.push(`> ${shortcodeNoteByTag.get(tag)}`);
        continue;
      }

      if (['caption', 'gallery', 'embed'].includes(tag)) {
        continue;
      }

      const fallbackBlock = buildFallbackBlock({
        fallbackType: 'unsupported-shortcode',
        source: unescapedShortcodeLine,
        label: `Unsupported shortcode preserved for manual review: ${tag}.`
      });
      processedLines.push(fallbackBlock);
      fallbackRows.push(
        createFallbackRow({
          record,
          fallbackType: 'unsupported-shortcode',
          manualReviewNote: `Unsupported shortcode ${unescapedShortcodeLine} requires an explicit Hugo-safe replacement before batch inclusion.`
        })
      );
      continue;
    }

    processedLines.push(
      escapeInlineHtmlTokens(
        line
        .replace(/<br\s*\/?>/giu, '  \n')
        .replace(/\[(?:Read more|\.\.\.|…|\u2026)\]/giu, '')
        .replace(/\u00A0/gu, ' ')
      )
    );
  }

  const normalizedMarkdown = processedLines
    .join('\n')
    .replace(/\n{3,}/gu, '\n\n')
    .replace(/[ \t]+$/gmu, '')
    .trim();

  return {
    bodyMarkdown: normalizedMarkdown,
    hasUnexpectedHtml: containsUnexpectedHtml(normalizedMarkdown)
  };
}

function containsUnexpectedHtml(markdown) {
  const withoutFencedBlocks = String(markdown ?? '').replace(/```[\s\S]*?```/gu, '');
  const withoutComments = withoutFencedBlocks
    .replace(/<!--(?:[\s\S]*?)-->/gu, '')
    .replace(/\{\{[%<][\s\S]*?[>%]\}\}/gu, '');
  for (const line of withoutComments.split('\n')) {
    const match = line.match(/^\s*<\/?([a-z][a-z0-9-]*)\b[^>]*>/iu);
    if (match && blockLevelHtmlTags.has(match[1].toLowerCase())) {
      return true;
    }
  }

  return false;
}

function escapeInlineHtmlTokens(line) {
  const trimmedLine = line.trim();
  if (trimmedLine.startsWith('<') && trimmedLine.endsWith('>')) {
    return line;
  }

  return line.replace(/<\/?[A-Za-z][^>\n]*>/gu, (match, offset, source) => {
    const before = source.slice(0, offset);
    const after = source.slice(offset + match.length);
    if (before.endsWith('`') && after.startsWith('`')) {
      return match;
    }

    return `\`${match}\``;
  });
}

function buildFallbackBlock({ fallbackType, source, label }) {
  const sanitizedSource = String(source ?? '')
    .replace(/\r\n?/gu, '\n')
    .replace(/```/gu, '``\u200b`')
    .trim();

  return [
    `<!-- fallback: ${fallbackType} -->`,
    `> ${label}`,
    '```html',
    sanitizedSource,
    '```'
  ].join('\n');
}

function createFallbackRow({ record, fallbackType, manualReviewNote }) {
  return {
    sourceId: record.sourceId,
    legacyUrl: record.legacyUrl,
    targetUrl: record.targetUrl,
    title: record.titleRaw,
    fallbackType,
    manualReviewNote,
    owner: '',
    status: 'needs-owner-assignment'
  };
}

function sortRecords(records) {
  return [...records].sort((left, right) => {
    const byLegacyUrl = left.legacyUrl.localeCompare(right.legacyUrl);
    if (byLegacyUrl !== 0) {
      return byLegacyUrl;
    }
    return left.sourceId.localeCompare(right.sourceId);
  });
}

function sortWarnings(warnings) {
  return [...warnings].sort((left, right) => {
    const byCode = left.code.localeCompare(right.code);
    if (byCode !== 0) {
      return byCode;
    }
    return left.message.localeCompare(right.message);
  });
}

function sortFallbackRows(rows) {
  return [...rows].sort((left, right) => {
    const bySourceId = left.sourceId.localeCompare(right.sourceId);
    if (bySourceId !== 0) {
      return bySourceId;
    }
    return left.fallbackType.localeCompare(right.fallbackType);
  });
}

function stabilizeConvertedRecord(record) {
  return {
    ...record,
    fallbackTypes: [...record.fallbackTypes].sort((left, right) => left.localeCompare(right)),
    conversionWarnings: sortWarnings(record.conversionWarnings)
  };
}

function serializeFallbackRows(rows) {
  return stringifyCsv(rows, {
    header: true,
    columns: [
      'sourceId',
      'legacyUrl',
      'targetUrl',
      'title',
      'fallbackType',
      'manualReviewNote',
      'owner',
      'status'
    ]
  });
}

function extractYouTubeId(value) {
  if (!value) {
    return '';
  }

  try {
    const parsed = new URL(value, 'https://www.rhino-inquisitor.com');
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === 'youtu.be') {
      return parsed.pathname.replace(/^\//u, '');
    }

    if (hostname.endsWith('youtube.com') || hostname.endsWith('youtube-nocookie.com')) {
      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/')[2] ?? '';
      }

      return parsed.searchParams.get('v') ?? '';
    }
  } catch {
    return '';
  }

  return '';
}

function escapeAttribute(value) {
  return String(value ?? '').replace(/&/gu, '&amp;').replace(/"/gu, '&quot;');
}

async function cleanOutputDirectory(directoryPath) {
  const directoryEntries = await fsp.readdir(directoryPath, { withFileTypes: true });
  await Promise.all(
    directoryEntries
      .filter((entry) => entry.isFile() && entry.name.endsWith(outputFileSuffix))
      .map((entry) => fsp.unlink(path.join(directoryPath, entry.name)))
  );
}

async function ensureDirectory(directoryPath) {
  await fsp.mkdir(directoryPath, { recursive: true });
}

async function readJsonFile(filePath, description) {
  try {
    const raw = await fsp.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Unable to read ${description} at ${toRepoRelative(filePath)}: ${error.message}`);
  }
}

async function writeJsonFile(filePath, value) {
  await ensureDirectory(path.dirname(filePath));
  await fsp.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function toRepoRelative(filePath) {
  return path.relative(repoRoot, filePath) || '.';
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});