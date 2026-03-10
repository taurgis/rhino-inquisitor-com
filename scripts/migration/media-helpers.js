import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { stringify as stringifyCsv } from 'csv-stringify/sync';

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const canonicalHost = 'https://www.rhino-inquisitor.com';
export const defaultRecordsFile = path.join(repoRoot, 'migration/intermediate/records.normalized.json');
export const defaultConvertedRecordsDir = path.join(repoRoot, 'migration/output');
export const defaultContentDir = path.join(repoRoot, 'migration/output/content');
export const defaultAssetsDir = path.join(repoRoot, 'src/assets');
export const defaultStaticDir = path.join(repoRoot, 'src/static');
export const defaultManifestFile = path.join(repoRoot, 'migration/intermediate/media-manifest.json');
export const defaultMissingReport = path.join(repoRoot, 'migration/reports/media-missing.csv');
export const defaultHotlinksReport = path.join(repoRoot, 'migration/reports/media-hotlinks.csv');
export const defaultIntegrityReport = path.join(repoRoot, 'migration/reports/media-integrity-report.csv');

export const rasterImageExtensions = new Set(['avif', 'gif', 'jpeg', 'jpg', 'png', 'webp']);
export const imageExtensions = new Set([...rasterImageExtensions, 'svg']);
export const downloadableExtensions = new Set([
  ...imageExtensions,
  'bmp',
  'm4a',
  'mov',
  'mp3',
  'mp4',
  'ogg',
  'ogv',
  'pdf',
  'wav',
  'webm',
  'wmv'
]);

export function shortHash(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 10);
}

export function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function sanitizeSlug(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

export function stripWordPressSizeSuffix(value) {
  return String(value ?? '').replace(/-\d+x\d+$/i, '');
}

export function isImageExtension(extension) {
  return imageExtensions.has(String(extension ?? '').toLowerCase());
}

export function shouldUseAssetStorage(extension) {
  return rasterImageExtensions.has(String(extension ?? '').toLowerCase());
}

export function normalizeLocalMediaPath(value) {
  const normalized = String(value ?? '').trim();
  if (!normalized) {
    return null;
  }

  if (normalized.startsWith('/')) {
    return normalized.split('#', 1)[0].split('?', 1)[0];
  }

  return `/${normalized.split('#', 1)[0].split('?', 1)[0].replace(/^\/+/, '')}`;
}

export function stripUrlSearchHash(value) {
  try {
    const parsed = new URL(String(value));
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return String(value ?? '').trim();
  }
}

export function stripUrlHash(value) {
  try {
    const parsed = new URL(String(value));
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return String(value ?? '').trim();
  }
}

function normalizeWpComPath(pathname) {
  const embeddedUploadsPath = String(pathname).match(/^\/[^/]+\/(wp-content\/uploads\/.*)$/i);
  if (!embeddedUploadsPath) {
    return null;
  }

  return `/${embeddedUploadsPath[1]}`;
}

function resolveCanonicalMediaUrl(parsed) {
  const host = parsed.host.toLowerCase();
  const pathname = decodeURIComponent(parsed.pathname);

  if (pathname.startsWith('/wp-content/uploads/')) {
    const canonicalPath = pathname.replace(/-\d+x\d+(?=\.[^.]+$)/i, '');
    return `${canonicalHost}${canonicalPath}`;
  }

  if (host.endsWith('wp.com') || host.endsWith('wordpress.com')) {
    const normalizedPath = normalizeWpComPath(pathname);
    if (normalizedPath) {
      const canonicalPath = normalizedPath.replace(/-\d+x\d+(?=\.[^.]+$)/i, '');
      return `${canonicalHost}${canonicalPath}`;
    }
  }

  const canonical = new URL(parsed.toString());
  canonical.search = '';
  canonical.hash = '';
  return canonical.toString();
}

function isYouTubeThumbnailHost(hostname) {
  const host = String(hostname ?? '').toLowerCase();
  return host === 'img.youtube.com' || host === 'i.ytimg.com';
}

function buildYouTubeThumbnailAttemptUrls(parsed) {
  if (!isYouTubeThumbnailHost(parsed.host)) {
    return [];
  }

  const pathname = decodeURIComponent(parsed.pathname);
  const match = pathname.match(/^\/vi(?:_webp)?\/([^/]+)\/(maxresdefault|sddefault|hqdefault|mqdefault|default)\.(jpg|jpeg|webp)$/i);
  if (!match) {
    return [];
  }

  const [, videoId, requestedVariant, extension] = match;
  const normalizedExtension = extension.toLowerCase();
  const variants = uniqueValues([
    requestedVariant.toLowerCase(),
    'hqdefault',
    'sddefault',
    'mqdefault',
    'default'
  ]);
  const hosts = ['https://img.youtube.com', 'http://img.youtube.com', 'https://i.ytimg.com', 'http://i.ytimg.com'];

  const attemptUrls = [];
  for (const host of hosts) {
    for (const variant of variants) {
      attemptUrls.push(`${host}/vi/${videoId}/${variant}.${normalizedExtension}`);
    }
  }

  return attemptUrls;
}

export function normalizeSourceMediaUrl(rawUrl) {
  const sourceUrl = String(rawUrl ?? '').trim();
  if (!sourceUrl) {
    return null;
  }

  let parsed;
  try {
    parsed = new URL(sourceUrl, canonicalHost);
  } catch {
    return null;
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return null;
  }

  const extension = path.posix.extname(parsed.pathname).slice(1).toLowerCase();
  if (!extension || !downloadableExtensions.has(extension)) {
    return null;
  }

  const canonicalUrl = resolveCanonicalMediaUrl(parsed);
  const canonicalParsed = new URL(canonicalUrl);
  const canonicalPathname = canonicalParsed.pathname;
  const year = canonicalPathname.match(/\/(20\d{2})\/\d{2}\//)?.[1] ?? 'external';
  const baseName = path.posix.basename(canonicalPathname, path.posix.extname(canonicalPathname));
  const slugBase = sanitizeSlug(stripWordPressSizeSuffix(baseName) || baseName || canonicalParsed.host);
  const fileName = `${slugBase || 'media'}-${shortHash(canonicalUrl)}.${extension}`;
  const relativeMediaPath = path.posix.join('media', year, fileName);

  return {
    sourceUrl,
    normalizedSourceUrl: stripUrlSearchHash(parsed.toString()),
    canonicalUrl,
    canonicalPathname,
    extension,
    relativeMediaPath,
    publicPath: `/${relativeMediaPath}`,
    storageKind: shouldUseAssetStorage(extension) ? 'asset' : 'static',
    isImage: isImageExtension(extension),
    isProcessableImage: shouldUseAssetStorage(extension),
    attemptUrls: uniqueValues([
      ...buildYouTubeThumbnailAttemptUrls(parsed),
      canonicalUrl,
      stripUrlSearchHash(parsed.toString()),
      stripUrlHash(parsed.toString()),
      sourceUrl
    ])
  };
}

export function buildTargetFilePath({ assetsDir, staticDir, storageKind, relativeMediaPath }) {
  return path.join(storageKind === 'asset' ? assetsDir : staticDir, relativeMediaPath);
}

export function toRepoRelative(absolutePath) {
  return path.relative(repoRoot, absolutePath).split(path.sep).join('/');
}

export async function ensureDirectory(directoryPath) {
  await fs.mkdir(directoryPath, { recursive: true });
}

export async function readJsonFile(filePath, label) {
  const source = await fs.readFile(filePath, 'utf8');
  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(`Failed to parse ${label} at ${toRepoRelative(filePath)}: ${error.message}`);
  }
}

export async function writeJsonFile(filePath, data) {
  await ensureDirectory(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function hashFile(filePath) {
  const buffer = await fs.readFile(filePath);
  return sha256(buffer);
}

export function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export function createCsv(rows, columns) {
  return stringifyCsv(rows, {
    header: true,
    columns
  });
}

export function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))];
}

export function sortByKey(rows, key) {
  return [...rows].sort((left, right) => String(left[key] ?? '').localeCompare(String(right[key] ?? '')));
}

export function isWordPressHotlink(value) {
  const candidate = String(value ?? '').trim();
  if (!candidate) {
    return false;
  }

  if (candidate.startsWith('/wp-content/uploads/')) {
    return true;
  }

  try {
    const parsed = new URL(candidate, canonicalHost);
    const host = parsed.host.toLowerCase();
    if (parsed.pathname.startsWith('/wp-content/uploads/') && (host.includes('rhino-inquisitor.com') || host.includes('therhinotimes.com'))) {
      return true;
    }
    if (host.endsWith('wp.com') || host.endsWith('wordpress.com')) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export function isMixedContentUrl(value) {
  return String(value ?? '').trim().startsWith('http://');
}

export function mimeMatchesExtension(detectedExtension, actualExtension) {
  const left = String(detectedExtension ?? '').toLowerCase();
  const right = String(actualExtension ?? '').toLowerCase();

  if (!left || !right) {
    return true;
  }

  if (left === right) {
    return true;
  }

  return (left === 'jpg' && right === 'jpeg') || (left === 'jpeg' && right === 'jpg');
}

export async function resolveSourceMediaFile(localPath, { assetsDir = defaultAssetsDir, staticDir = defaultStaticDir } = {}) {
  const normalized = normalizeLocalMediaPath(localPath);
  if (!normalized) {
    return null;
  }

  const relativePath = normalized.replace(/^\//, '');
  const assetPath = path.join(assetsDir, relativePath);
  if (await fileExists(assetPath)) {
    return assetPath;
  }

  const staticPath = path.join(staticDir, relativePath);
  if (await fileExists(staticPath)) {
    return staticPath;
  }

  return null;
}