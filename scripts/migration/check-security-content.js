import fs from 'node:fs/promises';
import path from 'node:path';

import { load as loadHtml } from 'cheerio';
import fg from 'fast-glob';
import matter from 'gray-matter';
import { stringify as stringifyCsv } from 'csv-stringify/sync';

import {
  normalizeUrlLike,
  parseAttributes,
  repoRoot,
  toRepoRelative
} from './url-validation-helpers.js';

const defaultContentDir = path.join(repoRoot, 'migration/output/content');
const defaultRecordsDir = path.join(repoRoot, 'migration/output');
const defaultReportFile = path.join(repoRoot, 'migration/reports/security-content-scan.csv');
const defaultPublicDir = path.join(repoRoot, 'public');
const allowedIframeHosts = new Set([
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
  'vimeo.com',
  'www.vimeo.com'
]);
const disallowedFrontMatterKeys = new Set([
  'sourceId',
  'source_id',
  'sourceType',
  'source_type',
  'sourceChannels',
  'source_channels',
  'legacyUrl',
  'legacy_url',
  'status',
  'postStatus',
  'post_status',
  'wpPostId',
  'wp_post_id',
  'wordpressId',
  'wordpress_id',
  'sourcePath',
  'source_path',
  'filesystemPath',
  'filesystem_path',
  'sqlPath',
  'sql_path',
  'mediaRefs',
  'media_refs',
  '_raw',
  'raw'
]);
const frontMatterPathLeakPattern = /(?:\/Users\/|\/private\/var\/|\/var\/folders\/|tmp\/website-wordpress-backup|wordpress-database\.sql|[A-Za-z]:\\)/u;
const scriptTagPattern = /<script\b[^>]*>/giu;
const eventHandlerPattern = /<[^>]+\s(on[a-z][a-z0-9_-]*)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/giu;
const javascriptUriMarkdownPattern = /(?<!!)\[[^\]]*\]\(\s*<?\s*(javascript:[^)\s>]+)/giu;
const javascriptUriHtmlPattern = /<(?:a|area|form|iframe)\b[^>]*\b(?:href|src|action)\s*=\s*(?:"(javascript:[^"]*)"|'(javascript:[^']*)'|(javascript:[^\s>]+))/giu;
const iframeTagPattern = /<iframe\b[^>]*>/giu;
const mixedContentMarkdownImagePattern = /!\[[^\]]*\]\(\s*<?(http:\/\/[^)\s>]+)[^)]*\)/giu;
const mixedContentHtmlImagePattern = /<(?:img|source)\b[^>]*\b(?:src|srcset)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/giu;
const wpAdminPattern = /(?:https?:\/\/[^\s"'<>)]*)?\/wp-admin\/[A-Za-z0-9_\-./?=&%#]*/giu;
const wpApiPattern = /(?:https?:\/\/[^\s"'<>)]*)?\/wp-json\/wp\/v2(?:\/[^\s"'<>)]*)?/giu;
const wpNoncePattern = /(?:\b_wpnonce\b|\bwpnonce\b|\bX-WP-Nonce\b|\bwp_create_nonce\b)/giu;
const wpAuthArtifactPattern = /(?:\bwordpress_logged_in_[a-z0-9]+\b|\bwordpress_sec_[a-z0-9]+\b|\bwp-postpass_[a-z0-9]+\b|\bwp-settings-\d+\b)/giu;

async function main() {
  const options = resolveOptions(process.argv.slice(2));
  await fs.mkdir(path.dirname(options.reportFile), { recursive: true });

  const markdownFiles = (await fg('**/*.md', {
    cwd: options.contentDir,
    absolute: true,
    onlyFiles: true
  })).sort((left, right) => left.localeCompare(right));

  if (markdownFiles.length === 0) {
    throw new Error(`No Markdown files found under ${toRepoRelative(options.contentDir)}.`);
  }

  const [recordStateByRoute, publicDirExists] = await Promise.all([
    loadRecordStateByRoute(options.recordsDir),
    directoryExists(options.publicDir)
  ]);

  const findings = [];
  let renderedHtmlCount = 0;

  for (const markdownFile of markdownFiles) {
    const source = await fs.readFile(markdownFile, 'utf8');
    const parsed = matter(source);
    const relativePath = toRepoRelative(markdownFile);
    const frontMatterInfo = readFrontMatterInfo(source);

    findings.push(...scanFrontMatter({
      relativePath,
      frontMatterInfo,
      frontMatter: parsed.data
    }));

    const bodyStartLine = frontMatterInfo.bodyStartLine;
    const protectedBody = protectContentPreservingLines(parsed.content);
    findings.push(...scanMarkupContent({
      relativePath,
      source: protectedBody,
      lineOffset: bodyStartLine - 1,
      scanMode: 'markdown'
    }));

    findings.push(...scanDraftMismatch({
      relativePath,
      frontMatter: parsed.data,
      recordStateByRoute,
      frontMatterInfo
    }));

    if (!publicDirExists) {
      continue;
    }

    const route = typeof parsed.data.url === 'string' && parsed.data.url.trim()
      ? normalizeUrlLike(parsed.data.url)
      : null;
    if (!route) {
      continue;
    }

    const htmlFile = routeToHtmlFile(options.publicDir, route.comparablePathOnly);
    if (!(await fileExists(htmlFile))) {
      continue;
    }

    const htmlSource = await fs.readFile(htmlFile, 'utf8');
    const fragment = extractArticleHtmlFragment(htmlSource);
    findings.push(...scanMarkupContent({
      relativePath: toRepoRelative(htmlFile),
      source: fragment,
      lineOffset: 0,
      scanMode: 'html'
    }));
    renderedHtmlCount += 1;
  }

  const sortedFindings = findings.sort((left, right) => {
    if (left.file !== right.file) {
      return left.file.localeCompare(right.file);
    }
    if (left.line !== right.line) {
      return left.line - right.line;
    }
    if (left.issueType !== right.issueType) {
      return left.issueType.localeCompare(right.issueType);
    }
    return left.value.localeCompare(right.value);
  });

  await fs.writeFile(
    options.reportFile,
    stringifyCsv(sortedFindings, {
      header: true,
      columns: [
        'file',
        'line',
        'issueType',
        'status',
        'severity',
        'value',
        'message',
        'suggestion'
      ]
    }),
    'utf8'
  );

  const criticalCount = sortedFindings.filter((finding) => finding.status === 'fail').length;
  const warningCount = sortedFindings.filter((finding) => finding.status === 'warn').length;

  console.log(
    [
      `Scanned ${markdownFiles.length} staged Markdown file(s).`,
      publicDirExists
        ? `Scanned ${renderedHtmlCount} rendered HTML file(s) from ${toRepoRelative(options.publicDir)}.`
        : `Rendered HTML scan skipped because ${toRepoRelative(options.publicDir)} does not exist.`,
      `Critical findings: ${criticalCount}.`,
      `Warnings: ${warningCount}.`,
      `Wrote ${toRepoRelative(options.reportFile)}.`
    ].join(' ')
  );

  if (criticalCount > 0) {
    process.exitCode = 1;
  }
}

function resolveOptions(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    switch (argument) {
      case '--content-dir':
        parsed.contentDir = path.resolve(argv[++index]);
        break;
      case '--records-dir':
        parsed.recordsDir = path.resolve(argv[++index]);
        break;
      case '--public-dir':
        parsed.publicDir = path.resolve(argv[++index]);
        break;
      case '--report-file':
        parsed.reportFile = path.resolve(argv[++index]);
        break;
      case '--help':
        printHelp();
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown argument: ${argument}`);
    }
  }

  return {
    contentDir: parsed.contentDir ?? defaultContentDir,
    recordsDir: parsed.recordsDir ?? defaultRecordsDir,
    publicDir: parsed.publicDir ?? defaultPublicDir,
    reportFile: parsed.reportFile ?? defaultReportFile
  };
}

function printHelp() {
  console.log(`Usage: node scripts/migration/check-security-content.js [options]

Options:
  --content-dir <path>  Override migration/output/content directory.
  --records-dir <path>  Override migration/output directory used for source-status checks.
  --public-dir <path>   Override the built HTML directory used for rendered-content checks.
  --report-file <path>  Override migration/reports/security-content-scan.csv.
  --help                Show this help message.
`);
}

async function loadRecordStateByRoute(recordsDir) {
  const records = new Map();
  const jsonFiles = (await fg('*.json', {
    cwd: recordsDir,
    absolute: true,
    onlyFiles: true
  })).sort((left, right) => left.localeCompare(right));

  for (const jsonFile of jsonFiles) {
    let record;
    try {
      record = JSON.parse(await fs.readFile(jsonFile, 'utf8'));
    } catch {
      continue;
    }

    if (!record || typeof record !== 'object') {
      continue;
    }

    if (typeof record.targetUrl !== 'string' || record.targetUrl.trim().length === 0) {
      continue;
    }

    const route = normalizeUrlLike(record.targetUrl).comparablePathOnly;
    records.set(route, {
      sourceId: String(record.sourceId ?? path.basename(jsonFile, '.json')),
      status: String(record.status ?? '').trim().toLowerCase()
    });
  }

  return records;
}

async function directoryExists(dirPath) {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

async function fileExists(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

function readFrontMatterInfo(source) {
  const lines = String(source ?? '').split(/\r?\n/u);
  const delimiter = lines[0]?.trim();
  if (delimiter !== '---' && delimiter !== '+++') {
    return {
      bodyStartLine: 1,
      frontMatterLines: []
    };
  }

  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index].trim() === delimiter) {
      return {
        bodyStartLine: index + 2,
        frontMatterLines: lines.slice(1, index)
      };
    }
  }

  return {
    bodyStartLine: 1,
    frontMatterLines: []
  };
}

function scanFrontMatter({ relativePath, frontMatterInfo, frontMatter }) {
  const findings = [];

  for (let index = 0; index < frontMatterInfo.frontMatterLines.length; index += 1) {
    const line = frontMatterInfo.frontMatterLines[index];
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    const keyMatch = /^([A-Za-z_][A-Za-z0-9_]*)\s*:/u.exec(trimmedLine);
    if (keyMatch && disallowedFrontMatterKeys.has(keyMatch[1])) {
      findings.push(createFinding({
        file: relativePath,
        line: index + 2,
        issueType: 'source_metadata_frontmatter',
        status: 'fail',
        severity: 'critical',
        value: keyMatch[1],
        message: 'Front matter contains source-system-only metadata.',
        suggestion: 'Remove extraction-layer identifiers and keep them only in migration audit artifacts.'
      }));
    }

    if (frontMatterPathLeakPattern.test(line)) {
      findings.push(createFinding({
        file: relativePath,
        line: index + 2,
        issueType: 'filesystem_path_frontmatter',
        status: 'fail',
        severity: 'critical',
        value: trimmedLine,
        message: 'Front matter contains a local filesystem or source-dump path.',
        suggestion: 'Replace source-environment paths with publishable Hugo values only.'
      }));
    }

    const mixedContentMatch = line.match(/:\s*["']?(http:\/\/[^\s"']+)/u);
    if (mixedContentMatch && isLikelyImageField(trimmedLine)) {
      findings.push(createFinding({
        file: relativePath,
        line: index + 2,
        issueType: 'mixed_content_image',
        status: 'warn',
        severity: 'medium',
        value: mixedContentMatch[1],
        message: 'Front matter references an http:// image on an HTTPS site.',
        suggestion: 'Rewrite the image reference to a local /media path or an HTTPS asset URL.'
      }));
    }
  }

  if (frontMatter && typeof frontMatter.params === 'object' && frontMatter.params !== null) {
    for (const key of Object.keys(frontMatter.params)) {
      if (!disallowedFrontMatterKeys.has(key)) {
        continue;
      }

      findings.push(createFinding({
        file: relativePath,
        line: 1,
        issueType: 'source_metadata_frontmatter',
        status: 'fail',
        severity: 'critical',
        value: `params.${key}`,
        message: 'Front matter params contain source-system-only metadata.',
        suggestion: 'Keep source identifiers in migration reports, not publishable params.'
      }));
    }
  }

  return findings;
}

function scanDraftMismatch({ relativePath, frontMatter, recordStateByRoute, frontMatterInfo }) {
  if (frontMatter?.draft !== false) {
    return [];
  }

  if (typeof frontMatter?.url !== 'string' || frontMatter.url.trim().length === 0) {
    return [];
  }

  const route = normalizeUrlLike(frontMatter.url).comparablePathOnly;
  const recordState = recordStateByRoute.get(route);
  if (!recordState) {
    return [];
  }

  if (recordState.status === 'publish') {
    return [];
  }

  const draftLine = findFrontMatterKeyLine(frontMatterInfo.frontMatterLines, 'draft');
  return [createFinding({
    file: relativePath,
    line: draftLine ?? 1,
    issueType: 'draft_status_mismatch',
    status: 'fail',
    severity: 'critical',
    value: `${route} (${recordState.status})`,
    message: 'Source record is not publishable but the staged Markdown sets draft: false.',
    suggestion: 'Fix the mapping pipeline so draft/private source records remain non-publishable.'
  })];
}

function scanMarkupContent({ relativePath, source, lineOffset, scanMode }) {
  const findings = [];

  findings.push(...collectRegexFindings({
    source,
    pattern: scriptTagPattern,
    relativePath,
    lineOffset,
    issueType: 'script_tag',
    status: 'fail',
    severity: 'critical',
    message: 'Content contains a raw <script> tag.',
    suggestion: 'Strip script fragments during conversion or correction before publishing.'
  }));

  findings.push(...collectEventHandlerFindings({ source, relativePath, lineOffset }));
  findings.push(...collectJavascriptUriFindings({ source, relativePath, lineOffset }));
  findings.push(...collectIframeFindings({ source, relativePath, lineOffset }));
  findings.push(...collectRegexFindings({
    source,
    pattern: wpNoncePattern,
    relativePath,
    lineOffset,
    issueType: 'wp_nonce_artifact',
    status: 'fail',
    severity: 'critical',
    message: 'Content contains a WordPress nonce artifact.',
    suggestion: 'Remove the nonce-bearing content or replace it with a redacted placeholder.'
  }));
  findings.push(...collectRegexFindings({
    source,
    pattern: wpAuthArtifactPattern,
    relativePath,
    lineOffset,
    issueType: 'wp_auth_artifact',
    status: 'fail',
    severity: 'critical',
    message: 'Content contains a WordPress authentication cookie or token artifact.',
    suggestion: 'Remove or redact the source-system auth artifact before publishing.'
  }));
  findings.push(...collectRegexFindings({
    source,
    pattern: wpAdminPattern,
    relativePath,
    lineOffset,
    issueType: 'wp_admin_url',
    status: 'warn',
    severity: 'medium',
    message: 'Content links to a WordPress admin route.',
    suggestion: 'Remove the admin URL or replace it with a public documentation link.'
  }));
  findings.push(...collectRegexFindings({
    source,
    pattern: wpApiPattern,
    relativePath,
    lineOffset,
    issueType: 'wp_api_url',
    status: 'warn',
    severity: 'medium',
    message: 'Content exposes a WordPress REST API route.',
    suggestion: 'Remove the internal API URL or replace it with a public-safe reference.'
  }));

  if (scanMode === 'markdown') {
    findings.push(...collectMixedContentMarkdownImageFindings({ source, relativePath, lineOffset }));
  }
  findings.push(...collectMixedContentHtmlImageFindings({ source, relativePath, lineOffset }));

  return findings;
}

function collectRegexFindings({
  source,
  pattern,
  relativePath,
  lineOffset,
  issueType,
  status,
  severity,
  message,
  suggestion
}) {
  const findings = [];
  for (const match of source.matchAll(pattern)) {
    const index = match.index ?? 0;
    const value = match[1] ?? match[0] ?? '';
    findings.push(createFinding({
      file: relativePath,
      line: lineNumberFromIndex(source, index, lineOffset),
      issueType,
      status,
      severity,
      value: normalizeFindingValue(value),
      message,
      suggestion
    }));
  }
  return findings;
}

function collectEventHandlerFindings({ source, relativePath, lineOffset }) {
  const findings = [];
  for (const match of source.matchAll(eventHandlerPattern)) {
    const index = match.index ?? 0;
    findings.push(createFinding({
      file: relativePath,
      line: lineNumberFromIndex(source, index, lineOffset),
      issueType: 'inline_event_handler',
      status: 'fail',
      severity: 'critical',
      value: normalizeFindingValue(match[1] ?? match[0] ?? ''),
      message: 'Content contains an inline event handler attribute.',
      suggestion: 'Remove the inline on* handler from migrated content.'
    }));
  }
  return findings;
}

function collectJavascriptUriFindings({ source, relativePath, lineOffset }) {
  const findings = [];
  for (const pattern of [javascriptUriMarkdownPattern, javascriptUriHtmlPattern]) {
    for (const match of source.matchAll(pattern)) {
      const index = match.index ?? 0;
      const value = match[1] ?? match[2] ?? match[3] ?? match[0] ?? '';
      findings.push(createFinding({
        file: relativePath,
        line: lineNumberFromIndex(source, index, lineOffset),
        issueType: 'javascript_uri',
        status: 'fail',
        severity: 'critical',
        value: normalizeFindingValue(value),
        message: 'Content uses a javascript: URI.',
        suggestion: 'Replace the javascript: URI with a safe URL or remove the link.'
      }));
    }
  }
  return findings;
}

function collectIframeFindings({ source, relativePath, lineOffset }) {
  const findings = [];
  for (const match of source.matchAll(iframeTagPattern)) {
    const tagSource = match[0] ?? '';
    const attributes = parseAttributes(tagSource);
    const src = attributes.get('src') ?? '';
    let isApproved = false;

    if (src) {
      try {
        const host = new URL(src, 'https://www.rhino-inquisitor.com').hostname.toLowerCase();
        isApproved = allowedIframeHosts.has(host);
      } catch {
        isApproved = false;
      }
    }

    if (isApproved) {
      continue;
    }

    findings.push(createFinding({
      file: relativePath,
      line: lineNumberFromIndex(source, match.index ?? 0, lineOffset),
      issueType: 'suspicious_iframe',
      status: 'warn',
      severity: 'medium',
      value: normalizeFindingValue(src || tagSource),
      message: 'Content contains an iframe that is not on the approved YouTube or Vimeo allowlist.',
      suggestion: 'Remove the iframe or replace it with an approved YouTube/Vimeo embed or a plain link.'
    }));
  }
  return findings;
}

function collectMixedContentMarkdownImageFindings({ source, relativePath, lineOffset }) {
  const findings = [];
  for (const match of source.matchAll(mixedContentMarkdownImagePattern)) {
    findings.push(createFinding({
      file: relativePath,
      line: lineNumberFromIndex(source, match.index ?? 0, lineOffset),
      issueType: 'mixed_content_image',
      status: 'warn',
      severity: 'medium',
      value: normalizeFindingValue(match[1] ?? match[0] ?? ''),
      message: 'Content references an http:// image on an HTTPS site.',
      suggestion: 'Rewrite the image reference to a local /media path or an HTTPS URL.'
    }));
  }
  return findings;
}

function collectMixedContentHtmlImageFindings({ source, relativePath, lineOffset }) {
  const findings = [];
  for (const match of source.matchAll(mixedContentHtmlImagePattern)) {
    const rawValue = match[1] ?? match[2] ?? match[3] ?? '';
    const urls = rawValue.includes(',') ? extractSrcSetUrls(rawValue) : [rawValue];
    for (const url of urls) {
      if (!url.startsWith('http://')) {
        continue;
      }

      findings.push(createFinding({
        file: relativePath,
        line: lineNumberFromIndex(source, match.index ?? 0, lineOffset),
        issueType: 'mixed_content_image',
        status: 'warn',
        severity: 'medium',
        value: normalizeFindingValue(url),
        message: 'Content references an http:// image on an HTTPS site.',
        suggestion: 'Rewrite the image reference to a local /media path or an HTTPS URL.'
      }));
    }
  }
  return findings;
}

function protectContentPreservingLines(source) {
  let protectedSource = stripCommentsPreservingLines(String(source ?? ''));
  for (const pattern of [/```[\s\S]*?```/g, /~~~[\s\S]*?~~~/g, /<(code|pre)\b[^>]*>[\s\S]*?<\/\1>/gi, /`[^`\n]+`/g]) {
    protectedSource = protectedSource.replace(pattern, preserveLineBreaks);
  }
  return protectedSource;
}

function stripCommentsPreservingLines(source) {
  return source.replace(/<!--([\s\S]*?)-->/gu, preserveLineBreaks);
}

function preserveLineBreaks(match) {
  return String(match ?? '').replace(/[^\n]/gu, ' ');
}

function lineNumberFromIndex(source, index, lineOffset = 0) {
  return lineOffset + source.slice(0, index).split('\n').length;
}

function routeToHtmlFile(publicDir, routePath) {
  if (routePath === '/') {
    return path.join(publicDir, 'index.html');
  }

  return path.join(publicDir, routePath.replace(/^\//u, ''), 'index.html');
}

function extractArticleHtmlFragment(htmlSource) {
  const $ = loadHtml(htmlSource);
  const fragment = $('.page-article__body').first();
  if (fragment.length > 0) {
    return $.html(fragment) ?? '';
  }

  const main = $('main').first();
  return $.html(main) ?? htmlSource;
}

function isLikelyImageField(line) {
  return /^(heroImage|image|featuredImage|socialImage)\s*:/u.test(line.trim());
}

function findFrontMatterKeyLine(frontMatterLines, key) {
  for (let index = 0; index < frontMatterLines.length; index += 1) {
    if (new RegExp(`^\\s*${key}\\s*:`, 'u').test(frontMatterLines[index])) {
      return index + 2;
    }
  }
  return null;
}

function extractSrcSetUrls(value) {
  return String(value ?? '')
    .split(',')
    .map((entry) => entry.trim().split(/\s+/u)[0] ?? '')
    .filter(Boolean);
}

function normalizeFindingValue(value) {
  return String(value ?? '').trim().replace(/\s+/gu, ' ').slice(0, 200);
}

function createFinding({ file, line, issueType, status, severity, value, message, suggestion }) {
  return {
    file,
    line,
    issueType,
    status,
    severity,
    value,
    message,
    suggestion
  };
}

main().catch((error) => {
  console.error(`check:security-content failed: ${error.message}`);
  process.exitCode = 1;
});