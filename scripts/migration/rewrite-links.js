import fs from 'node:fs/promises';
import path from 'node:path';

import fg from 'fast-glob';
import { stringify as stringifyCsv } from 'csv-stringify/sync';

import {
  canonicalOrigin,
  loadManifest,
  repoRoot,
  toRepoRelative
} from './url-validation-helpers.js';
import { defaultManifestFile as defaultMediaManifestPath, normalizeSourceMediaUrl } from './media-helpers.js';

const defaultContentDir = path.join(repoRoot, 'migration/output/content');
const defaultManifestPath = path.join(repoRoot, 'migration/url-manifest.json');
const defaultReportPath = path.join(repoRoot, 'migration/reports/link-rewrite-log.csv');
const supportedInternalHosts = new Set([
  'rhino-inquisitor.com',
  'www.rhino-inquisitor.com',
  'therhinotimes.com',
  'www.therhinotimes.com'
]);
const routeOverrides = new Map([
  ['/how-to-set-up-the-ecdn-for-staging-in-salesforce-b2c-commerce-cloud/', '/how-to-set-up-the-ecdn-in-sfcc-staging/']
]);

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const manifestEntries = await loadManifest(options.manifestPath);
  const manifestLookup = buildManifestLookup(manifestEntries);
  const mediaLookup = await loadMediaLookup(options.mediaManifestPath);

  const markdownFiles = (await fg('**/*.md', {
    cwd: options.contentDir,
    absolute: true,
    onlyFiles: true
  })).sort((left, right) => left.localeCompare(right));
  const pageTitleLookup = await buildPageTitleLookup(markdownFiles);

  const logRows = [];
  let changedFileCount = 0;

  for (const markdownFile of markdownFiles) {
    const source = await fs.readFile(markdownFile, 'utf8');
    const { frontMatter, body } = splitFrontMatter(source);
    const rewritten = rewriteBody(body, {
      fileLabel: toRepoRelative(markdownFile),
      manifestLookup,
      mediaLookup,
      pageTitleLookup,
      logRows
    });

    if (rewritten !== body) {
      await fs.writeFile(markdownFile, `${frontMatter}${rewritten}`, 'utf8');
      changedFileCount += 1;
    }
  }

  logRows.sort((left, right) => {
    if (left.source_file !== right.source_file) {
      return left.source_file.localeCompare(right.source_file);
    }
    if (left.original_url !== right.original_url) {
      return left.original_url.localeCompare(right.original_url);
    }
    if (left.rewritten_url !== right.rewritten_url) {
      return left.rewritten_url.localeCompare(right.rewritten_url);
    }
    return left.action.localeCompare(right.action);
  });

  await fs.mkdir(path.dirname(options.reportPath), { recursive: true });
  await fs.writeFile(
    options.reportPath,
    stringifyCsv(logRows, {
      header: true,
      columns: ['source_file', 'original_url', 'rewritten_url', 'action', 'link_kind', 'anchor_text']
    }),
    'utf8'
  );

  const orphanCount = logRows.filter((row) => row.action === 'remove-orphan').length;
  console.log(
    [
      `Scanned ${markdownFiles.length} staged Markdown file(s).`,
      `Updated ${changedFileCount} file(s).`,
      `Logged ${logRows.length} rewrite action(s).`,
      `Orphan removals: ${orphanCount}.`,
      `Report: ${toRepoRelative(options.reportPath)}.`
    ].join(' ')
  );
}

async function buildPageTitleLookup(markdownFiles) {
  const lookup = new Map();

  for (const markdownFile of markdownFiles) {
    if (!markdownFile.includes(`${path.sep}pages${path.sep}`)) {
      continue;
    }

    const source = await fs.readFile(markdownFile, 'utf8');
    const { frontMatter } = splitFrontMatter(source);
    const title = matchFrontMatterValue(frontMatter, 'title');
    const url = matchFrontMatterValue(frontMatter, 'url');
    if (!title || !url) {
      continue;
    }

    lookup.set(normalizeLookupText(title), url);
  }

  return lookup;
}

function matchFrontMatterValue(frontMatter, key) {
  const pattern = new RegExp(`^${key}:\\s*(.+)$`, 'mu');
  const match = frontMatter.match(pattern);
  if (!match) {
    return null;
  }

  return match[1].trim().replace(/^['"]|['"]$/g, '');
}

function parseArgs(argv) {
  const options = {
    contentDir: defaultContentDir,
    manifestPath: defaultManifestPath,
    mediaManifestPath: defaultMediaManifestPath,
    reportPath: defaultReportPath,
    help: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case '--content-dir':
        options.contentDir = path.resolve(argv[++index]);
        break;
      case '--manifest':
        options.manifestPath = path.resolve(argv[++index]);
        break;
      case '--media-manifest':
        options.mediaManifestPath = path.resolve(argv[++index]);
        break;
      case '--report':
        options.reportPath = path.resolve(argv[++index]);
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

function printHelp() {
  console.log(`Usage: node scripts/migration/rewrite-links.js [options]

Options:
  --content-dir <path>      Override migration/output/content directory.
  --manifest <path>         Override migration/url-manifest.json.
  --media-manifest <path>   Override migration/intermediate/media-manifest.json.
  --report <path>           Override migration/reports/link-rewrite-log.csv.
  --help                    Show this help message.
`);
}

async function loadMediaLookup(mediaManifestPath) {
  try {
    const source = await fs.readFile(mediaManifestPath, 'utf8');
    const parsed = JSON.parse(source);
    const lookup = new Map();

    for (const entry of Array.isArray(parsed) ? parsed : []) {
      if (entry?.status !== 'ok' || typeof entry.publicPath !== 'string') {
        continue;
      }

      for (const candidate of buildMediaCandidates(entry)) {
        lookup.set(candidate, entry.publicPath);
      }
    }

    return lookup;
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return new Map();
    }

    throw new Error(`Failed to load media manifest: ${error.message}`);
  }
}

function buildMediaCandidates(entry) {
  const candidates = new Set();
  for (const value of [entry.sourceUrl, entry.normalizedSourceUrl, entry.canonicalUrl]) {
    if (typeof value !== 'string' || value.trim().length === 0) {
      continue;
    }

    for (const candidate of expandMediaVariants(value.trim())) {
      candidates.add(candidate);
      const normalized = normalizeSourceMediaUrl(candidate);
      if (normalized) {
        candidates.add(normalized.sourceUrl);
        candidates.add(normalized.normalizedSourceUrl);
        candidates.add(normalized.canonicalUrl);
      }
    }
  }

  return [...candidates];
}

function expandMediaVariants(value) {
  const variants = new Set([value]);
  variants.add(value.replace(/-scaled(?=\.[^.?#]+(?:[?#].*)?$)/i, ''));
  return [...variants].filter(Boolean);
}

function buildManifestLookup(entries) {
  const lookup = new Map();

  for (const entry of entries) {
    const parsed = parseUrlValue(entry.legacy_url);
    if (!parsed) {
      continue;
    }

    lookup.set(buildLookupKey(parsed.pathname, parsed.search), entry);
    lookup.set(buildLookupKey(parsed.pathname.toLowerCase(), parsed.search), entry);
    if (!parsed.search) {
      lookup.set(buildLookupKey(parsed.pathname, ''), entry);
      lookup.set(buildLookupKey(parsed.pathname.toLowerCase(), ''), entry);
    }
  }

  return lookup;
}

function splitFrontMatter(source) {
  const match = source.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/u);
  if (!match) {
    return {
      frontMatter: '',
      body: source
    };
  }

  return {
    frontMatter: match[0],
    body: source.slice(match[0].length)
  };
}

function rewriteBody(source, context) {
  const protectedSegments = [];
  const renderedSegments = [];

  let working = protectPattern(source, /```[\s\S]*?```/g, protectedSegments);
  working = protectPattern(working, /~~~[\s\S]*?~~~/g, protectedSegments);
  working = protectPattern(working, /<(code|pre)\b[^>]*>[\s\S]*?<\/\1>/gi, protectedSegments);
  working = protectPattern(working, /`[^`\n]+`/g, protectedSegments);

  const htmlAnchorPattern = /<a\b([^>]*?)\bhref=(?:"([^"]*)"|'([^']*)'|([^\s>]+))([^>]*)>([\s\S]*?)<\/a>/gi;
  working = working.replace(htmlAnchorPattern, (match, beforeHref, doubleQuoted, singleQuoted, unquoted, afterHref, innerHtml) => {
    const originalUrl = doubleQuoted ?? singleQuoted ?? unquoted ?? '';
    const resolution = resolveLinkTarget(originalUrl, {
      kind: 'html-anchor',
      anchorText: stripHtmlTags(innerHtml),
      manifestLookup: context.manifestLookup,
      mediaLookup: context.mediaLookup
    });

    if (!resolution.changed) {
      return storeSegment(renderedSegments, match, 'HTML');
    }

    context.logRows.push(createLogRow(context.fileLabel, originalUrl, resolution.rewrittenUrl, resolution.action, 'html-anchor', resolution.anchorText));
    if (resolution.remove) {
      return storeSegment(renderedSegments, innerHtml, 'HTML');
    }

    return storeSegment(renderedSegments, `<a${beforeHref}href="${resolution.rewrittenUrl}"${afterHref}>${innerHtml}</a>`, 'HTML');
  });

  const linkedImagePattern = /(\[!\[[^\]]*\]\([^)]*\)\])\((<[^>\n]+>|[^)\s]+)(\s+"[^"]*")?\)/g;
  working = working.replace(linkedImagePattern, (match, label, rawTarget, title = '') => {
    const originalUrl = unwrapAngleBrackets(rawTarget);
    let resolution = resolveLinkTarget(originalUrl, {
      kind: 'markdown-link',
      anchorText: stripMarkdownLabel(label),
      manifestLookup: context.manifestLookup,
      mediaLookup: context.mediaLookup
    });

    if (!resolution.changed) {
      const wrappedImageTarget = extractWrappedImageTarget(label);
      if (wrappedImageTarget && originalUrl.includes('/wp-content/uploads/')) {
        resolution = changed(wrappedImageTarget, 'rewrite-media-wrapper', resolution.anchorText);
      }
    }

    if (!resolution.changed) {
      return storeSegment(renderedSegments, match, 'MD');
    }

    context.logRows.push(createLogRow(context.fileLabel, originalUrl, resolution.rewrittenUrl, resolution.action, 'markdown-link', resolution.anchorText));
    if (resolution.remove) {
      return storeSegment(renderedSegments, unwrapMarkdownLabel(label), 'MD');
    }

    const rewrittenTarget = rawTarget.startsWith('<') && rawTarget.endsWith('>')
      ? `<${resolution.rewrittenUrl}>`
      : resolution.rewrittenUrl;
    return storeSegment(renderedSegments, `${label}(${rewrittenTarget}${title})`, 'MD');
  });

  const markdownLinkPattern = /(!?\[[^\]]*\])\((<[^>\n]+>|[^)\s]+)(\s+"[^"]*")?\)/g;
  working = working.replace(markdownLinkPattern, (match, label, rawTarget, title = '') => {
    const originalUrl = unwrapAngleBrackets(rawTarget);
    const isImage = label.startsWith('![');
    const resolution = resolveLinkTarget(originalUrl, {
      kind: isImage ? 'markdown-image' : 'markdown-link',
      anchorText: stripMarkdownLabel(label),
      manifestLookup: context.manifestLookup,
      mediaLookup: context.mediaLookup
    });

    if (!resolution.changed) {
      return storeSegment(renderedSegments, match, 'MD');
    }

    context.logRows.push(createLogRow(context.fileLabel, originalUrl, resolution.rewrittenUrl, resolution.action, isImage ? 'markdown-image' : 'markdown-link', resolution.anchorText));
    if (resolution.remove) {
      return storeSegment(renderedSegments, unwrapMarkdownLabel(label), 'MD');
    }

    const rewrittenTarget = rawTarget.startsWith('<') && rawTarget.endsWith('>')
      ? `<${resolution.rewrittenUrl}>`
      : resolution.rewrittenUrl;
    return storeSegment(renderedSegments, `${label}(${rewrittenTarget}${title})`, 'MD');
  });

  const plainUrlPattern = /(^|[\s(>])(<)?(https?:\/\/[^\s<>")]+)(>)?/gm;
  working = working.replace(plainUrlPattern, (match, prefix, opening, rawUrl, closing) => {
    const resolution = resolveLinkTarget(rawUrl, {
      kind: 'plain-url',
      anchorText: '',
      manifestLookup: context.manifestLookup,
      mediaLookup: context.mediaLookup
    });

    if (!resolution.changed || resolution.remove) {
      return match;
    }

    context.logRows.push(createLogRow(context.fileLabel, rawUrl, resolution.rewrittenUrl, resolution.action, 'plain-url', ''));
    const leftWrapper = opening ?? '';
    const rightWrapper = closing ?? '';
    return `${prefix}${leftWrapper}${resolution.rewrittenUrl}${rightWrapper}`;
  });

  working = restoreSegments(working, renderedSegments, 'MD');
  working = restoreSegments(working, renderedSegments, 'HTML');
  working = restoreSegments(working, protectedSegments, 'PROTECTED');
  working = rewriteVideoHubHeadings(working, context);
  return working;
}

function rewriteVideoHubHeadings(source, context) {
  if (!context.fileLabel.endsWith('migration/output/content/pages/video.md')) {
    return source;
  }

  return source.replace(/^(####\s+)(?!\[)(.+)$/gmu, (match, prefix, headingText) => {
    const normalizedHeading = normalizeLookupText(headingText);
    const targetUrl = context.pageTitleLookup.get(normalizedHeading);
    if (!targetUrl) {
      return match;
    }

    context.logRows.push(createLogRow(context.fileLabel, headingText, targetUrl, 'link-video-heading', 'video-heading', headingText));
    return `${prefix}[${headingText}](${targetUrl})`;
  });
}

function normalizeLookupText(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/["'`]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function resolveLinkTarget(originalUrl, { kind, anchorText, manifestLookup, mediaLookup }) {
  if (!originalUrl || originalUrl.startsWith('#')) {
    return unchanged(originalUrl, anchorText);
  }

  const mediaTarget = resolveMediaTarget(originalUrl, mediaLookup);
  if (mediaTarget && mediaTarget !== originalUrl) {
    return changed(mediaTarget, 'rewrite-media', anchorText);
  }

  const parsed = parseUrlValue(originalUrl);
  if (!parsed || !parsed.isInternalSiteUrl) {
    return unchanged(originalUrl, anchorText);
  }

  if (path.posix.extname(parsed.pathname)) {
    return unchanged(originalUrl, anchorText);
  }

  const manifestEntry = findManifestEntry(parsed, manifestLookup);
  if (!manifestEntry) {
    return unchanged(originalUrl, anchorText);
  }

  if (manifestEntry.disposition === 'retire' || manifestEntry.target_url == null) {
    if (kind === 'markdown-link' || kind === 'html-anchor') {
      return {
        changed: true,
        remove: true,
        rewrittenUrl: '',
        action: 'remove-orphan',
        anchorText
      };
    }

    return unchanged(originalUrl, anchorText);
  }

  const rewrittenUrl = `${normalizeTargetUrl(manifestEntry.target_url)}${parsed.hash}`;
  if (rewrittenUrl === originalUrl) {
    return unchanged(originalUrl, anchorText);
  }

  return changed(rewrittenUrl, 'rewrite', anchorText);
}

function resolveMediaTarget(originalUrl, mediaLookup) {
  const normalized = normalizeSourceMediaUrl(originalUrl);
  const candidates = new Set(expandMediaVariants(originalUrl));
  if (normalized) {
    for (const candidate of expandMediaVariants(normalized.sourceUrl)) {
      candidates.add(candidate);
    }
    for (const candidate of expandMediaVariants(normalized.normalizedSourceUrl)) {
      candidates.add(candidate);
    }
    for (const candidate of expandMediaVariants(normalized.canonicalUrl)) {
      candidates.add(candidate);
    }
  }

  for (const candidate of candidates) {
    if (mediaLookup.has(candidate)) {
      return mediaLookup.get(candidate);
    }
  }

  return null;
}

function parseUrlValue(value) {
  try {
    const parsed = value.startsWith('http://') || value.startsWith('https://')
      ? new URL(value)
      : new URL(value, canonicalOrigin);
    const hostname = parsed.hostname.toLowerCase();
    const isRelativeInput = !value.startsWith('http://') && !value.startsWith('https://');
    const isInternalSiteUrl = isRelativeInput || supportedInternalHosts.has(hostname);
    return {
      pathname: parsed.pathname || '/',
      search: parsed.search || '',
      hash: parsed.hash || '',
      isInternalSiteUrl
    };
  } catch {
    return null;
  }
}

function findManifestEntry(parsed, manifestLookup) {
  const exactKey = buildLookupKey(parsed.pathname, parsed.search);
  if (manifestLookup.has(exactKey)) {
    return manifestLookup.get(exactKey);
  }

  const loweredExactKey = buildLookupKey(parsed.pathname.toLowerCase(), parsed.search);
  if (manifestLookup.has(loweredExactKey)) {
    return manifestLookup.get(loweredExactKey);
  }

  if (!parsed.search) {
    const pathOnlyKey = buildLookupKey(parsed.pathname, '');
    if (manifestLookup.has(pathOnlyKey)) {
      return manifestLookup.get(pathOnlyKey);
    }

    const loweredPathOnlyKey = buildLookupKey(parsed.pathname.toLowerCase(), '');
    if (manifestLookup.has(loweredPathOnlyKey)) {
      return manifestLookup.get(loweredPathOnlyKey);
    }
  }

  return null;
}

function buildLookupKey(pathname, search) {
  const comparablePath = toComparablePath(pathname);
  return `${comparablePath}${search ?? ''}`;
}

function normalizeTargetUrl(targetUrl) {
  let normalizedTarget = routeOverrides.get(targetUrl) ?? targetUrl;
  const segments = normalizedTarget.split('/').filter(Boolean);
  if (segments[0] === 'category' && segments.length > 2) {
    normalizedTarget = `/category/${segments.at(-1)}/`;
  }

  return normalizedTarget;
}

function toComparablePath(pathname) {
  if (!pathname || pathname === '/') {
    return '/';
  }

  if (path.posix.extname(pathname)) {
    return pathname;
  }

  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

function unwrapAngleBrackets(value) {
  return value.startsWith('<') && value.endsWith('>') ? value.slice(1, -1) : value;
}

function stripMarkdownLabel(label) {
  return unwrapMarkdownLabel(label)
    .replace(/!\[[^\]]*\]\(([^)]*)\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .trim();
}

function extractWrappedImageTarget(label) {
  const match = label.match(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/u);
  if (!match) {
    return null;
  }

  return unwrapAngleBrackets(match[1]);
}

function unwrapMarkdownLabel(label) {
  if (label.startsWith('![')) {
    return label;
  }

  return label.slice(1, -1);
}

function stripHtmlTags(value) {
  return String(value ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function protectPattern(source, pattern, bucket) {
  return source.replace(pattern, (match) => storeSegment(bucket, match, 'PROTECTED'));
}

function storeSegment(bucket, value, prefix) {
  const token = `@@RHI038_${prefix}_${bucket.length}@@`;
  bucket.push({ token, value });
  return token;
}

function restoreSegments(source, bucket, prefix) {
  let restored = source;
  for (const entry of bucket.filter((item) => item.token.includes(`_${prefix}_`))) {
    restored = restored.replace(entry.token, entry.value);
  }
  return restored;
}

function unchanged(originalUrl, anchorText) {
  return {
    changed: false,
    remove: false,
    rewrittenUrl: originalUrl,
    action: '',
    anchorText
  };
}

function changed(rewrittenUrl, action, anchorText) {
  return {
    changed: true,
    remove: false,
    rewrittenUrl,
    action,
    anchorText
  };
}

function createLogRow(sourceFile, originalUrl, rewrittenUrl, action, linkKind, anchorText) {
  return {
    source_file: sourceFile,
    original_url: originalUrl,
    rewritten_url: rewrittenUrl,
    action,
    link_kind: linkKind,
    anchor_text: anchorText
  };
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});