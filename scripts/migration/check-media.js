import fs from 'node:fs/promises';
import path from 'node:path';

import fg from 'fast-glob';
import matter from 'gray-matter';
import { load as loadHtml } from 'cheerio';
import { fileTypeFromFile } from 'file-type';
import { imageSize } from 'image-size';

import {
  createCsv,
  defaultAssetsDir,
  defaultContentDir,
  defaultHotlinksReport,
  defaultIntegrityReport,
  defaultStaticDir,
  fileExists,
  imageExtensions,
  isMixedContentUrl,
  isWordPressHotlink,
  mimeMatchesExtension,
  normalizeLocalMediaPath,
  resolveSourceMediaFile,
  toRepoRelative
} from './media-helpers.js';

async function main() {
  const options = resolveOptions(process.argv.slice(2));
  const rows = [];
  const hotlinkRows = [];
  const publicFileTypeCache = new Map();

  await Promise.all([
    ensureParentDirectory(options.reportFile),
    ensureParentDirectory(options.hotlinksReport)
  ]);

  const markdownFiles = (await fg('**/*.md', {
    cwd: options.contentDir,
    absolute: true,
    onlyFiles: true
  })).sort((left, right) => left.localeCompare(right));

  for (const markdownFile of markdownFiles) {
    const source = await fs.readFile(markdownFile, 'utf8');
    const parsed = matter(source);
    const fileLabel = toRepoRelative(markdownFile);

    if (typeof parsed.data.heroImage === 'string' && parsed.data.heroImage.trim()) {
      const heroRows = await inspectReference({
        scope: 'markdown',
        file: fileLabel,
        reference: parsed.data.heroImage,
        kind: 'heroImage',
        options,
        publicFileTypeCache
      });
      rows.push(...heroRows);
      hotlinkRows.push(...heroRows.filter((row) => row.category === 'hotlink' || row.category === 'mixed-content'));
    }

    for (const reference of extractMarkdownImageReferences(parsed.content)) {
      const imageRows = await inspectReference({
        scope: 'markdown',
        file: fileLabel,
        reference,
        kind: 'bodyImage',
        options,
        publicFileTypeCache
      });
      rows.push(...imageRows);
      hotlinkRows.push(...imageRows.filter((row) => row.category === 'hotlink' || row.category === 'mixed-content'));
    }
  }

  const htmlFiles = (await fg('**/*.html', {
    cwd: options.publicDir,
    absolute: true,
    onlyFiles: true
  })).sort((left, right) => left.localeCompare(right));

  for (const htmlFile of htmlFiles) {
    const htmlSource = await fs.readFile(htmlFile, 'utf8');
    const fileLabel = toRepoRelative(htmlFile);
    const $ = loadHtml(htmlSource);
    const references = [];

    $('img[src], source[src], source[srcset]').each((_, element) => {
      const src = element.attribs?.src;
      if (src) {
        references.push(src);
      }
      const srcset = element.attribs?.srcset;
      if (srcset) {
        references.push(...parseSrcSet(srcset));
      }
    });

    for (const reference of references) {
      const htmlRows = await inspectReference({
        scope: 'public',
        file: fileLabel,
        reference,
        kind: 'renderedImage',
        options,
        publicFileTypeCache
      });
      rows.push(...htmlRows);
      hotlinkRows.push(...htmlRows.filter((row) => row.category === 'hotlink' || row.category === 'mixed-content'));
    }
  }

  const sortedRows = rows.sort((left, right) => {
    if (left.file !== right.file) {
      return left.file.localeCompare(right.file);
    }
    return left.reference.localeCompare(right.reference);
  });
  const sortedHotlinks = hotlinkRows.sort((left, right) => {
    if (left.file !== right.file) {
      return left.file.localeCompare(right.file);
    }
    return left.reference.localeCompare(right.reference);
  });

  await fs.writeFile(
    options.reportFile,
    createCsv(sortedRows, [
      'scope',
      'file',
      'kind',
      'reference',
      'category',
      'status',
      'severity',
      'resolvedPath',
      'mimeType',
      'expectedExtension',
      'width',
      'height',
      'message'
    ]),
    'utf8'
  );
  await fs.writeFile(
    options.hotlinksReport,
    createCsv(sortedHotlinks, [
      'scope',
      'file',
      'kind',
      'reference',
      'category',
      'status',
      'severity',
      'message'
    ]),
    'utf8'
  );

  const failures = sortedRows.filter((row) => row.status === 'fail');
  console.log(
    [
      `Scanned ${markdownFiles.length} staged Markdown file(s) and ${htmlFiles.length} rendered HTML file(s).`,
      `Failures: ${failures.length}.`,
      `Wrote ${toRepoRelative(options.reportFile)} and ${toRepoRelative(options.hotlinksReport)}.`
    ].join(' ')
  );

  if (failures.length > 0) {
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
      case '--public-dir':
        parsed.publicDir = path.resolve(argv[++index]);
        break;
      case '--assets-dir':
        parsed.assetsDir = path.resolve(argv[++index]);
        break;
      case '--static-dir':
        parsed.staticDir = path.resolve(argv[++index]);
        break;
      case '--report-file':
        parsed.reportFile = path.resolve(argv[++index]);
        break;
      case '--hotlinks-report':
        parsed.hotlinksReport = path.resolve(argv[++index]);
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
    publicDir: parsed.publicDir ?? path.join(path.resolve('.'), 'public'),
    assetsDir: parsed.assetsDir ?? defaultAssetsDir,
    staticDir: parsed.staticDir ?? defaultStaticDir,
    reportFile: parsed.reportFile ?? defaultIntegrityReport,
    hotlinksReport: parsed.hotlinksReport ?? defaultHotlinksReport
  };
}

function printHelp() {
  console.log(`Usage: node scripts/migration/check-media.js [options]

Options:
  --content-dir <path>      Override migration/output/content directory.
  --public-dir <path>       Override built public directory.
  --assets-dir <path>       Override src/assets root.
  --static-dir <path>       Override src/static root.
  --report-file <path>      Override migration/reports/media-integrity-report.csv.
  --hotlinks-report <path>  Override migration/reports/media-hotlinks.csv.
  --help                    Show this help message.
`);
}

async function ensureParentDirectory(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

function extractMarkdownImageReferences(source) {
  const references = [];
  const markdownImagePattern = /!\[[^\]]*\]\(([^)\s]+(?:\s+"[^"]*")?)\)/g;
  for (const match of source.matchAll(markdownImagePattern)) {
    const candidate = match[1].trim().replace(/^<|>$/g, '').split(/\s+"/, 1)[0];
    references.push(candidate);
  }

  const htmlPattern = /<(?:img|source)\b[^>]*\b(?:src|srcset)=(?:"([^"]*)"|'([^']*)')/gi;
  for (const match of source.matchAll(htmlPattern)) {
    const candidate = (match[1] ?? match[2] ?? '').trim();
    if (candidate.includes(',')) {
      references.push(...parseSrcSet(candidate));
    } else {
      references.push(candidate);
    }
  }

  return references.filter(Boolean);
}

function parseSrcSet(value) {
  return String(value ?? '')
    .split(',')
    .map((candidate) => candidate.trim().split(/\s+/u)[0])
    .filter(Boolean);
}

async function inspectReference({ scope, file, reference, kind, options, publicFileTypeCache }) {
  const trimmedReference = String(reference ?? '').trim();
  if (!trimmedReference) {
    return [];
  }

  if (isWordPressHotlink(trimmedReference)) {
    return [createRow({
      scope,
      file,
      kind,
      reference: trimmedReference,
      category: 'hotlink',
      status: 'fail',
      severity: 'critical',
      message: 'WordPress-origin image hotlink remains after migration.'
    })];
  }

  if (isMixedContentUrl(trimmedReference)) {
    return [createRow({
      scope,
      file,
      kind,
      reference: trimmedReference,
      category: 'mixed-content',
      status: 'fail',
      severity: 'high',
      message: 'HTTP image reference remains on an HTTPS page.'
    })];
  }

  const localPath = normalizeLocalMediaPath(trimmedReference);
  if (!localPath) {
    return [];
  }

  const isImageReference = imageExtensions.has(path.extname(localPath).slice(1).toLowerCase()) || kind === 'heroImage';
  if (!isImageReference) {
    return [];
  }

  if (scope === 'markdown') {
    const sourceFile = await resolveSourceMediaFile(localPath, {
      assetsDir: options.assetsDir,
      staticDir: options.staticDir
    });
    if (!sourceFile) {
      return [createRow({
        scope,
        file,
        kind,
        reference: trimmedReference,
        category: 'missing-file',
        status: 'fail',
        severity: 'critical',
        resolvedPath: '',
        message: 'Local Markdown image reference does not resolve in src/assets or src/static.'
      })];
    }

    const metadata = await inspectBinaryFile(sourceFile, localPath, publicFileTypeCache);
    const rows = [createValidationRow({
      scope,
      file,
      kind,
      reference: trimmedReference,
      resolvedPath: toRepoRelative(sourceFile),
      metadata
    })];

    if (kind === 'heroImage' && metadata.longestEdge > 2000) {
      rows.push(createRow({
        scope,
        file,
        kind,
        reference: trimmedReference,
        category: 'hero-size',
        status: 'fail',
        severity: 'high',
        resolvedPath: toRepoRelative(sourceFile),
        mimeType: metadata.mimeType,
        expectedExtension: metadata.expectedExtension,
        width: metadata.width,
        height: metadata.height,
        message: 'Hero image exceeds the 2000px longest-edge budget.'
      }));
    }

    return rows;
  }

  const publicFile = path.join(options.publicDir, localPath.replace(/^\//, ''));
  if (!(await fileExists(publicFile))) {
    return [createRow({
      scope,
      file,
      kind,
      reference: trimmedReference,
      category: 'missing-file',
      status: 'fail',
      severity: 'critical',
      resolvedPath: toRepoRelative(publicFile),
      message: 'Rendered image reference does not exist in the built public output.'
    })];
  }

  const metadata = await inspectBinaryFile(publicFile, localPath, publicFileTypeCache);
  return [createValidationRow({
    scope,
    file,
    kind,
    reference: trimmedReference,
    resolvedPath: toRepoRelative(publicFile),
    metadata
  })];
}

async function inspectBinaryFile(filePath, localPath, cache) {
  const cacheKey = filePath;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const detectedType = await fileTypeFromFile(filePath).catch(() => undefined);
  const expectedExtension = path.extname(localPath).slice(1).toLowerCase();
  const mimeType = detectedType?.mime ?? null;
  let width = null;
  let height = null;
  let longestEdge = 0;

  try {
    const dimensions = imageSize(await fs.readFile(filePath));
    width = dimensions.width ?? null;
    height = dimensions.height ?? null;
    longestEdge = Math.max(width ?? 0, height ?? 0);
  } catch {
    width = null;
    height = null;
    longestEdge = 0;
  }

  const metadata = {
    mimeType,
    expectedExtension,
    detectedExtension: detectedType?.ext ?? null,
    width,
    height,
    longestEdge,
    mimeMatches: mimeMatchesExtension(detectedType?.ext ?? null, expectedExtension)
  };
  cache.set(cacheKey, metadata);
  return metadata;
}

function createValidationRow({ scope, file, kind, reference, resolvedPath, metadata }) {
  return createRow({
    scope,
    file,
    kind,
    reference,
    category: metadata.mimeMatches ? 'ok' : 'mime-mismatch',
    status: metadata.mimeMatches ? 'pass' : 'fail',
    severity: metadata.mimeMatches ? 'info' : 'high',
    resolvedPath,
    mimeType: metadata.mimeType,
    expectedExtension: metadata.expectedExtension,
    width: metadata.width,
    height: metadata.height,
    message: metadata.mimeMatches
      ? 'Reference resolves to an existing local file.'
      : 'File signature does not match the referenced file extension.'
  });
}

function createRow(row) {
  return {
    scope: row.scope,
    file: row.file,
    kind: row.kind,
    reference: row.reference,
    category: row.category,
    status: row.status,
    severity: row.severity,
    resolvedPath: row.resolvedPath ?? '',
    mimeType: row.mimeType ?? '',
    expectedExtension: row.expectedExtension ?? '',
    width: row.width ?? '',
    height: row.height ?? '',
    message: row.message
  };
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});