import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import fg from 'fast-glob';
import sharp from 'sharp';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const contentRoot = path.join(repoRoot, 'src', 'content');
const assetsRoot = path.join(repoRoot, 'src', 'assets');
const outputRoot = path.join(assetsRoot, 'generated-avif');
const manifestPath = path.join(outputRoot, '.avif-cache-manifest.json');
const supportedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const responsiveWidths = [768, 1280];
const avifOptions = {
  quality: 55,
  effort: 4,
  chromaSubsampling: '4:2:0'
};
const manifestVersion = 1;
const generatorFingerprint = JSON.stringify({
  manifestVersion,
  responsiveWidths,
  avifOptions,
  sharpVersion: sharp.versions.sharp
});

function toRepoRelative(filePath) {
  return path.relative(repoRoot, filePath) || '.';
}

function replaceExtension(filePath, extension) {
  return `${filePath.slice(0, -path.extname(filePath).length)}${extension}`;
}

function resolveOutputBase(filePath) {
  if (filePath.startsWith(`${contentRoot}${path.sep}`)) {
    const relativePath = path.relative(contentRoot, filePath);
    return path.join(outputRoot, 'content', replaceExtension(relativePath, ''));
  }

  if (filePath.startsWith(`${assetsRoot}${path.sep}`)) {
    const relativePath = path.relative(assetsRoot, filePath);
    return path.join(outputRoot, 'global', replaceExtension(relativePath, ''));
  }

  throw new Error(`Unsupported AVIF source path: ${filePath}`);
}

async function ensureDirectory(filePath) {
  await fs.mkdir(filePath, { recursive: true });
}

async function loadManifest() {
  try {
    const parsed = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    if (
      parsed.version !== manifestVersion ||
      parsed.generatorFingerprint !== generatorFingerprint ||
      typeof parsed.sources !== 'object' ||
      parsed.sources === null
    ) {
      return { version: manifestVersion, generatorFingerprint, sources: {} };
    }

    return parsed;
  } catch {
    return { version: manifestVersion, generatorFingerprint, sources: {} };
  }
}

async function saveManifest(manifest) {
  await ensureDirectory(path.dirname(manifestPath));
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

async function computeSourceFingerprint(sourcePath) {
  const fileBuffer = await fs.readFile(sourcePath);
  return crypto
    .createHash('sha256')
    .update(generatorFingerprint)
    .update(fileBuffer)
    .digest('hex');
}

function toOutputRelative(filePath) {
  return path.relative(outputRoot, filePath).split(path.sep).join('/');
}

async function allTargetsExist(targetPaths) {
  try {
    await Promise.all(targetPaths.map((targetPath) => fs.access(targetPath)));
    return true;
  } catch {
    return false;
  }
}

async function generateVariant(pipeline, targetPath, width) {
  await ensureDirectory(path.dirname(targetPath));

  let transformer = pipeline.clone();
  if (width > 0) {
    transformer = transformer.resize({ width, withoutEnlargement: true });
  }

  await transformer.avif(avifOptions).toFile(targetPath);
}

function buildTargetPaths(sourcePath, metadata) {
  const baseOutputPath = `${resolveOutputBase(sourcePath)}.avif`;
  const targetPaths = [baseOutputPath];

  for (const width of responsiveWidths) {
    if (metadata.width <= width) {
      continue;
    }

    targetPaths.push(`${resolveOutputBase(sourcePath)}.${width}w.avif`);
  }

  return targetPaths;
}

async function pruneStaleOutputs(expectedOutputPaths) {
  const existingOutputPaths = await fg('src/assets/generated-avif/**/*.avif', {
    cwd: repoRoot,
    absolute: true,
    onlyFiles: true,
    suppressErrors: true
  });

  let removed = 0;
  for (const existingOutputPath of existingOutputPaths) {
    if (expectedOutputPaths.has(existingOutputPath)) {
      continue;
    }

    await fs.rm(existingOutputPath, { force: true });
    removed += 1;
  }

  return removed;
}

async function processSourceImage(sourcePath, counters, previousManifest, nextManifest, expectedOutputPaths) {
  const extension = path.extname(sourcePath).toLowerCase();
  if (supportedExtensions.has(extension) === false) {
    counters.skipped += 1;
    return;
  }

  const image = sharp(sourcePath, { animated: true });
  const metadata = await image.metadata();

  if (!metadata.width || metadata.pages > 1) {
    counters.skipped += 1;
    return;
  }

  const sourceFingerprint = await computeSourceFingerprint(sourcePath);
  const targetPaths = buildTargetPaths(sourcePath, metadata);
  for (const targetPath of targetPaths) {
    expectedOutputPaths.add(targetPath);
  }

  const sourceKey = toRepoRelative(sourcePath).split(path.sep).join('/');
  const previousEntry = previousManifest.sources[sourceKey];
  const expectedOutputs = targetPaths.map((targetPath) => toOutputRelative(targetPath));

  if (
    previousEntry?.fingerprint === sourceFingerprint &&
    JSON.stringify(previousEntry.outputs) === JSON.stringify(expectedOutputs) &&
    await allTargetsExist(targetPaths)
  ) {
    counters.cached += 1;
    nextManifest.sources[sourceKey] = {
      fingerprint: sourceFingerprint,
      outputs: expectedOutputs
    };
    return;
  }

  for (const targetPath of targetPaths) {
    const widthMatch = targetPath.match(/\.(\d+)w\.avif$/);
    const width = widthMatch ? Number(widthMatch[1]) : 0;
    await generateVariant(image, targetPath, width);
  }

  counters.generated += 1;
  nextManifest.sources[sourceKey] = {
    fingerprint: sourceFingerprint,
    outputs: expectedOutputs
  };
}

async function main() {
  await ensureDirectory(outputRoot);
  const previousManifest = await loadManifest();
  const nextManifest = {
    version: manifestVersion,
    generatorFingerprint,
    sources: {}
  };

  const sourceFiles = await fg([
    'src/content/**/*.{jpg,jpeg,png,webp}',
    'src/assets/**/*.{jpg,jpeg,png,webp}',
    '!src/assets/generated-avif/**'
  ], {
    cwd: repoRoot,
    absolute: true,
    onlyFiles: true,
    suppressErrors: true
  });

  const counters = {
    generated: 0,
    cached: 0,
    skipped: 0,
    failed: 0,
    removed: 0
  };
  const failures = [];
  const expectedOutputPaths = new Set();

  for (const sourceFile of sourceFiles.sort((left, right) => left.localeCompare(right))) {
    try {
      await processSourceImage(sourceFile, counters, previousManifest, nextManifest, expectedOutputPaths);
    } catch (error) {
      counters.failed += 1;
      failures.push(`- ${toRepoRelative(sourceFile)}: ${error.message}`);
    }
  }

  counters.removed = await pruneStaleOutputs(expectedOutputPaths);
  await saveManifest(nextManifest);

  console.log(
    [
      `AVIF cache scan complete for ${sourceFiles.length} source image(s).`,
      `Generated: ${counters.generated}.`,
      `Cached: ${counters.cached}.`,
      `Skipped: ${counters.skipped}.`,
      `Removed stale: ${counters.removed}.`
    ].join(' ')
  );

  if (failures.length > 0) {
    console.error('AVIF generation failed for one or more sources:');
    console.error(failures.join('\n'));
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});