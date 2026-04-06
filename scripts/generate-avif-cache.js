import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import fg from 'fast-glob';
import sharp from 'sharp';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const contentRoot = path.join(repoRoot, 'src', 'content');
const assetsRoot = path.join(repoRoot, 'src', 'assets');
const outputRoot = path.join(assetsRoot, 'generated-avif');
const supportedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const responsiveWidths = [768, 1280];
const avifOptions = {
  quality: 55,
  effort: 4,
  chromaSubsampling: '4:2:0'
};

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

async function shouldGenerate(sourcePath, targetPath) {
  try {
    const [sourceStat, targetStat] = await Promise.all([
      fs.stat(sourcePath),
      fs.stat(targetPath)
    ]);
    return sourceStat.mtimeMs > targetStat.mtimeMs;
  } catch {
    return true;
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

async function processSourceImage(sourcePath, counters) {
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

  const baseOutputPath = `${resolveOutputBase(sourcePath)}.avif`;
  let generatedForSource = false;

  if (await shouldGenerate(sourcePath, baseOutputPath)) {
    await generateVariant(image, baseOutputPath, 0);
    generatedForSource = true;
  }

  for (const width of responsiveWidths) {
    if (metadata.width <= width) {
      continue;
    }

    const widthOutputPath = `${resolveOutputBase(sourcePath)}.${width}w.avif`;
    if (await shouldGenerate(sourcePath, widthOutputPath)) {
      await generateVariant(image, widthOutputPath, width);
      generatedForSource = true;
    }
  }

  if (generatedForSource) {
    counters.generated += 1;
  } else {
    counters.cached += 1;
  }
}

async function main() {
  await ensureDirectory(outputRoot);

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
    failed: 0
  };
  const failures = [];

  for (const sourceFile of sourceFiles.sort((left, right) => left.localeCompare(right))) {
    try {
      await processSourceImage(sourceFile, counters);
    } catch (error) {
      counters.failed += 1;
      failures.push(`- ${toRepoRelative(sourceFile)}: ${error.message}`);
    }
  }

  console.log(
    [
      `AVIF cache scan complete for ${sourceFiles.length} source image(s).`,
      `Generated: ${counters.generated}.`,
      `Cached: ${counters.cached}.`,
      `Skipped: ${counters.skipped}.`
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