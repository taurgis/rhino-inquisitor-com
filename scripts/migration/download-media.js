import fs from 'node:fs/promises';
import path from 'node:path';

import pLimit from 'p-limit';
import { fileTypeFromBuffer } from 'file-type';
import { imageSize } from 'image-size';
import sharp from 'sharp';

import {
  buildTargetFilePath,
  createCsv,
  repoRoot,
  defaultAssetsDir,
  defaultManifestFile,
  defaultMissingReport,
  defaultRecordsFile,
  defaultStaticDir,
  delay,
  ensureDirectory,
  fileExists,
  hashFile,
  mimeMatchesExtension,
  normalizeSourceMediaUrl,
  readJsonFile,
  sha256,
    canonicalHost,
  sortByKey,
  toRepoRelative,
  uniqueValues,
  writeJsonFile
} from './media-helpers.js';

async function main() {
  const options = resolveOptions(process.argv.slice(2));
  const records = await readJsonFile(options.recordsFile, 'normalized records');
  const existingManifest = await loadExistingManifest(options.manifestFile);
  const plan = buildDownloadPlan(records);

  await Promise.all([
    ensureDirectory(options.assetsDir),
    ensureDirectory(options.staticDir),
    ensureDirectory(path.dirname(options.manifestFile)),
    ensureDirectory(path.dirname(options.missingReport))
  ]);

  const checksumIndex = new Map();
  const localPathIndex = new Map();
  for (const entry of existingManifest.filter((manifestEntry) => manifestEntry.status === 'ok')) {
    checksumIndex.set(entry.checksum, entry);
    localPathIndex.set(entry.localPath, entry);
  }

  const failures = [];
  const manifestEntries = [];
  const limit = pLimit(options.concurrency);

  const resolvedEntries = await Promise.all(plan.map((planEntry) => limit(async () => {
    const result = await resolvePlanEntry(planEntry, options, checksumIndex, localPathIndex);
    if (result.status === 'error') {
      failures.push(...result.failures);
      return result.manifestEntries;
    }

    for (const manifestEntry of result.manifestEntries) {
      checksumIndex.set(manifestEntry.checksum, manifestEntry);
      localPathIndex.set(manifestEntry.localPath, manifestEntry);
    }
    return result.manifestEntries;
  })));

  for (const batch of resolvedEntries) {
    manifestEntries.push(...batch);
  }

  const deduplicatedManifest = deduplicateManifestEntries([...existingManifest, ...manifestEntries]);
  await writeJsonFile(options.manifestFile, deduplicatedManifest);
  await fs.writeFile(
    options.missingReport,
    createCsv(sortByKey(failures, 'sourceUrl'), [
      'sourceUrl',
      'canonicalUrl',
      'attemptedUrl',
      'errorType',
      'statusCode',
      'retries',
      'message'
    ]),
    'utf8'
  );

  const okCount = deduplicatedManifest.filter((entry) => entry.status === 'ok').length;
  console.log(
    [
      `Processed ${plan.length} canonical media item(s).`,
      `Manifest entries: ${okCount}.`,
      `Failures: ${failures.length}.`,
      `Wrote ${toRepoRelative(options.manifestFile)} and ${toRepoRelative(options.missingReport)}.`
    ].join(' ')
  );

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

function resolveOptions(argv) {
  const parsed = {
    concurrency: 6,
    heroMaxEdge: 2000
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    switch (argument) {
      case '--records-file':
        parsed.recordsFile = path.resolve(argv[++index]);
        break;
      case '--assets-dir':
        parsed.assetsDir = path.resolve(argv[++index]);
        break;
      case '--static-dir':
        parsed.staticDir = path.resolve(argv[++index]);
        break;
      case '--manifest-file':
        parsed.manifestFile = path.resolve(argv[++index]);
        break;
      case '--missing-report':
        parsed.missingReport = path.resolve(argv[++index]);
        break;
      case '--filesystem-root':
        parsed.filesystemRoot = path.resolve(argv[++index]);
        break;
      case '--concurrency':
        parsed.concurrency = Number(argv[++index]);
        break;
      case '--hero-max-edge':
        parsed.heroMaxEdge = Number(argv[++index]);
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
    recordsFile: parsed.recordsFile ?? defaultRecordsFile,
    assetsDir: parsed.assetsDir ?? defaultAssetsDir,
    staticDir: parsed.staticDir ?? defaultStaticDir,
    manifestFile: parsed.manifestFile ?? defaultManifestFile,
    missingReport: parsed.missingReport ?? defaultMissingReport,
    filesystemRoot: parsed.filesystemRoot ?? path.join(process.cwd(), 'tmp/website-wordpress-backup/wp-content'),
    concurrency: Number.isFinite(parsed.concurrency) && parsed.concurrency >= 1 ? parsed.concurrency : 6,
    heroMaxEdge: Number.isFinite(parsed.heroMaxEdge) && parsed.heroMaxEdge >= 1 ? parsed.heroMaxEdge : 2000
  };
}

function printHelp() {
  console.log(`Usage: node scripts/migration/download-media.js [options]

Options:
  --records-file <path>   Override migration/intermediate/records.normalized.json.
  --assets-dir <path>     Override src/assets root.
  --static-dir <path>     Override src/static root.
  --manifest-file <path>  Override migration/intermediate/media-manifest.json.
  --missing-report <path> Override migration/reports/media-missing.csv.
  --filesystem-root <path>
                          Override the approved WordPress wp-content snapshot root for recovery.
  --concurrency <number>  Override bounded download concurrency.
  --hero-max-edge <num>   Resize hero images down to this longest-edge budget.
  --help                  Show this help message.
`);
}

async function loadExistingManifest(filePath) {
  if (!(await fileExists(filePath))) {
    return [];
  }

  const manifest = await readJsonFile(filePath, 'media manifest');
  return Array.isArray(manifest) ? manifest : [];
}

function buildDownloadPlan(records) {
  const grouped = new Map();
  const heroCanonicalUrls = new Set();

  for (const record of Array.isArray(records) ? records : []) {
    if (!['keep', 'merge'].includes(record?.disposition)) {
      continue;
    }

    const featuredImage = normalizeSourceMediaUrl(record?._raw?.extracted?.featuredImageUrl ?? null);
    if (featuredImage?.canonicalUrl) {
      heroCanonicalUrls.add(featuredImage.canonicalUrl.toLowerCase());
    }

    for (const rawUrl of Array.isArray(record.mediaRefs) ? record.mediaRefs : []) {
      const normalized = normalizeSourceMediaUrl(rawUrl);
      if (!normalized) {
        continue;
      }

      const bucket = grouped.get(normalized.canonicalUrl) ?? {
        ...normalized,
        sourceUrls: new Set(),
        attemptUrls: new Set()
      };

      bucket.sourceUrls.add(rawUrl);
      for (const attemptUrl of normalized.attemptUrls) {
        bucket.attemptUrls.add(attemptUrl);
      }
      grouped.set(normalized.canonicalUrl, bucket);
    }
  }

  return [...grouped.values()]
    .map((entry) => ({
      ...entry,
      usedAsHero: heroCanonicalUrls.has(entry.canonicalUrl.toLowerCase()),
      sourceUrls: [...entry.sourceUrls].sort((left, right) => left.localeCompare(right)),
      attemptUrls: [...entry.attemptUrls].sort((left, right) => left.localeCompare(right))
    }))
    .sort((left, right) => left.canonicalUrl.localeCompare(right.canonicalUrl));
}

async function resolvePlanEntry(planEntry, options, checksumIndex, localPathIndex) {
  const targetFilePath = buildTargetFilePath({
    assetsDir: options.assetsDir,
    staticDir: options.staticDir,
    storageKind: planEntry.storageKind,
    relativeMediaPath: planEntry.relativeMediaPath
  });
  const localPath = toRepoRelative(targetFilePath);
  const existingLocalEntry = localPathIndex.get(localPath);

  if (await fileExists(targetFilePath)) {
    const existingEntry = existingLocalEntry ?? checksumIndex.get(existingLocalEntry?.checksum ?? await hashFile(targetFilePath));
    const finalized = await finalizeStoredAsset({
      planEntry,
      absolutePath: targetFilePath,
      localPath: existingEntry?.localPath ?? localPath,
      publicPath: existingEntry?.publicPath ?? planEntry.publicPath,
      storageKind: existingEntry?.storageKind ?? planEntry.storageKind,
      deduplicatedTo: existingEntry?.localPath && existingEntry.localPath !== localPath ? existingEntry.localPath : null,
      contentType: existingEntry?.mimeType ?? null,
      options
    });
    const manifestEntries = buildManifestEntries(planEntry, {
      ...finalized
    });

    return {
      status: 'ok',
      manifestEntries
    };
  }

  const downloadResult = await downloadWithRetries(planEntry, 3);
  const recoveryResult = downloadResult.ok ? downloadResult : await recoverFromFilesystem(planEntry, options.filesystemRoot);
  if (!recoveryResult.ok) {
    return {
      status: 'error',
      manifestEntries: [],
      failures: planEntry.sourceUrls.map((sourceUrl) => ({
        sourceUrl,
        canonicalUrl: planEntry.canonicalUrl,
        attemptedUrl: recoveryResult.attemptedUrl ?? planEntry.canonicalUrl,
        errorType: 'download_failed',
        statusCode: recoveryResult.statusCode ?? '',
        retries: recoveryResult.retries,
        message: recoveryResult.message
      }))
    };
  }

  const checksum = sha256(recoveryResult.buffer);
  const existingChecksumEntry = checksumIndex.get(checksum);

  let resolvedLocalPath = localPath;
  let resolvedPublicPath = planEntry.publicPath;
  let resolvedStorageKind = planEntry.storageKind;
  let deduplicatedTo = null;

  if (existingChecksumEntry) {
    resolvedLocalPath = existingChecksumEntry.localPath;
    resolvedPublicPath = existingChecksumEntry.publicPath;
    resolvedStorageKind = existingChecksumEntry.storageKind;
    deduplicatedTo = existingChecksumEntry.localPath;
  } else {
    await ensureDirectory(path.dirname(targetFilePath));
    await fs.writeFile(targetFilePath, recoveryResult.buffer);
  }

  const finalized = await finalizeStoredAsset({
    planEntry,
    absolutePath: path.join(repoRoot, resolvedLocalPath),
    localPath: resolvedLocalPath,
    publicPath: resolvedPublicPath,
    storageKind: resolvedStorageKind,
    deduplicatedTo,
    contentType: recoveryResult.contentType ?? null,
    options
  });

  const manifestEntries = buildManifestEntries(planEntry, {
    ...finalized
  });

  return {
    status: 'ok',
    manifestEntries
  };
}

async function finalizeStoredAsset({
  planEntry,
  absolutePath,
  localPath,
  publicPath,
  storageKind,
  deduplicatedTo,
  contentType,
  options
}) {
  let buffer = await fs.readFile(absolutePath);
  buffer = await optimizeHeroAssetIfNeeded(buffer, planEntry, options);
  await fs.writeFile(absolutePath, buffer);

  const dimensions = getDimensions(buffer, planEntry.isImage);
  const detectedType = await fileTypeFromBuffer(buffer).catch(() => undefined);
  const detectedExtension = detectedType?.ext ?? null;
  const mimeType = detectedType?.mime ?? contentType ?? null;

  return {
    checksum: sha256(buffer),
    detectedExtension,
    mimeType,
    width: dimensions.width,
    height: dimensions.height,
    localPath,
    publicPath,
    storageKind,
    deduplicatedTo,
    mimeMismatch: !mimeMatchesExtension(detectedExtension, planEntry.extension)
  };
}

async function optimizeHeroAssetIfNeeded(buffer, planEntry, options) {
  if (!planEntry.usedAsHero || !planEntry.isProcessableImage || planEntry.extension === 'gif') {
    return buffer;
  }

  const dimensions = getDimensions(buffer, true);
  const longestEdge = Math.max(dimensions.width ?? 0, dimensions.height ?? 0);
  if (!longestEdge || longestEdge <= options.heroMaxEdge) {
    return buffer;
  }

  return sharp(buffer, { limitInputPixels: false })
    .rotate()
    .resize({
      width: options.heroMaxEdge,
      height: options.heroMaxEdge,
      fit: 'inside',
      withoutEnlargement: true
    })
    .toBuffer();
}

function buildManifestEntries(planEntry, metadata) {
  return planEntry.sourceUrls.map((sourceUrl) => ({
    sourceUrl,
    normalizedSourceUrl: normalizeSourceMediaUrl(sourceUrl)?.normalizedSourceUrl ?? sourceUrl,
    canonicalUrl: planEntry.canonicalUrl,
    publicPath: metadata.publicPath,
    localPath: metadata.localPath,
    storageKind: metadata.storageKind,
    checksum: metadata.checksum,
    mimeType: metadata.mimeType,
    detectedExtension: metadata.detectedExtension,
    mimeMismatch: Boolean(metadata.mimeMismatch),
    width: metadata.width,
    height: metadata.height,
    deduplicatedTo: metadata.deduplicatedTo,
    status: 'ok'
  }));
}

async function downloadWithRetries(planEntry, maxRetries) {
  let lastError = null;
  let lastStatusCode = null;
  let lastAttemptedUrl = null;

  for (const attemptUrl of planEntry.attemptUrls) {
    for (let retry = 0; retry < maxRetries; retry += 1) {
      lastAttemptedUrl = attemptUrl;
      try {
        const response = await fetch(attemptUrl);
        if (!response.ok) {
          lastStatusCode = response.status;
          throw new Error(`HTTP ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return {
          ok: true,
          buffer: Buffer.from(arrayBuffer),
          retries: retry,
          attemptedUrl: attemptUrl,
          contentType: response.headers.get('content-type')?.split(';', 1)[0] ?? null
        };
      } catch (error) {
        lastError = error;
        if (retry < maxRetries - 1) {
          await delay(250 * (2 ** retry));
        }
      }
    }
  }

  return {
    ok: false,
    message: lastError?.message ?? 'Unknown download failure.',
    retries: maxRetries,
    statusCode: lastStatusCode,
    attemptedUrl: lastAttemptedUrl
  };
}

async function recoverFromFilesystem(planEntry, filesystemRoot) {
  if (!filesystemRoot) {
    return {
      ok: false,
      message: 'Filesystem recovery root is not configured.',
      retries: 0,
      statusCode: '',
      attemptedUrl: null
    };
  }

  for (const relativePath of buildFilesystemRecoveryPaths(planEntry)) {
    const candidatePath = path.resolve(filesystemRoot, relativePath);
    if (!isWithinRoot(filesystemRoot, candidatePath)) {
      continue;
    }

    try {
      const buffer = await fs.readFile(candidatePath);
      return {
        ok: true,
        buffer,
        retries: 0,
        attemptedUrl: `filesystem:${relativePath}`,
        contentType: null
      };
    } catch {
      // Try the next candidate path.
    }
  }

  return {
    ok: false,
    message: 'HTTP download failed and no matching filesystem recovery file was found.',
    retries: 0,
    statusCode: '',
    attemptedUrl: null
  };
}

function buildFilesystemRecoveryPaths(planEntry) {
  const relativePaths = new Set();

  for (const candidate of [planEntry.canonicalUrl, ...planEntry.sourceUrls]) {
    for (const pathname of extractUploadPathnames(candidate)) {
      relativePaths.add(pathname.replace(/^\/wp-content\//, ''));
    }
  }

  return [...relativePaths].sort((left, right) => left.localeCompare(right));
}

function extractUploadPathnames(candidate) {
  const pathnames = new Set();

  try {
    const parsed = new URL(String(candidate ?? ''), canonicalHost);
    if (parsed.pathname.startsWith('/wp-content/uploads/')) {
      pathnames.add(parsed.pathname);
    }
  } catch {
    // Ignore invalid candidate values.
  }

  const normalized = normalizeSourceMediaUrl(candidate);
  if (normalized?.canonicalPathname?.startsWith('/wp-content/uploads/')) {
    pathnames.add(normalized.canonicalPathname);
  }

  return [...pathnames];
}

function isWithinRoot(rootPath, candidatePath) {
  const absoluteRoot = path.resolve(rootPath);
  const absoluteCandidate = path.resolve(candidatePath);
  return absoluteCandidate === absoluteRoot || absoluteCandidate.startsWith(`${absoluteRoot}${path.sep}`);
}

function getDimensions(buffer, isImage) {
  if (!isImage) {
    return { width: null, height: null };
  }

  try {
    const dimensions = imageSize(buffer);
    return {
      width: dimensions.width ?? null,
      height: dimensions.height ?? null
    };
  } catch {
    return { width: null, height: null };
  }
}

function deduplicateManifestEntries(entries) {
  const bySourceUrl = new Map();
  for (const entry of entries) {
    bySourceUrl.set(entry.sourceUrl, entry);
  }
  return [...bySourceUrl.values()].sort((left, right) => left.sourceUrl.localeCompare(right.sourceUrl));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});