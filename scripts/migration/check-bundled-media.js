#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const repoRoot = path.resolve('.');
const defaultContentRoots = [
  path.join(repoRoot, 'src/content/posts'),
  path.join(repoRoot, 'src/content/pages')
];
const defaultAssetRoot = path.join(repoRoot, 'src/assets/media');
const defaultBuildRoot = path.join(repoRoot, 'public');
const defaultReportFile = path.join(repoRoot, 'tmp/bundled-media-audit.json');
const defaultDeleteList = path.join(repoRoot, 'tmp/assets-media-duplicate-list.txt');
const referencePattern = /\/media\/|src\/assets\/media|assets\/media/giu;
const textFileExtensions = new Set(['.md', '.html', '.xml', '.json', '.txt', '.css', '.js']);

function parseArgs(argv) {
  const options = {
    contentRoots: defaultContentRoots,
    assetRoot: defaultAssetRoot,
    buildRoot: defaultBuildRoot,
    reportFile: defaultReportFile,
    deleteListFile: defaultDeleteList
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--report-file' && next) {
      options.reportFile = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === '--delete-list' && next) {
      options.deleteListFile = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === '--asset-root' && next) {
      options.assetRoot = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === '--build-root' && next) {
      options.buildRoot = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === '--content-root' && next) {
      options.contentRoots = next
        .split(',')
        .map((value) => path.resolve(value.trim()))
        .filter(Boolean);
      index += 1;
    }
  }

  return options;
}

function toRepoRelative(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join('/');
}

function walkFiles(rootPath) {
  if (!fs.existsSync(rootPath)) {
    return [];
  }

  const files = [];
  const queue = [rootPath];

  while (queue.length > 0) {
    const currentPath = queue.pop();
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        queue.push(fullPath);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  }

  return files.sort();
}

function isTextFile(filePath) {
  return textFileExtensions.has(path.extname(filePath).toLowerCase());
}

function collectReferenceMatches(filePaths) {
  const matches = [];

  for (const filePath of filePaths) {
    if (!isTextFile(filePath)) {
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/u);

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      referencePattern.lastIndex = 0;
      if (referencePattern.test(lines[lineIndex])) {
        matches.push({
          file: toRepoRelative(filePath),
          line: lineIndex + 1,
          text: lines[lineIndex].trim()
        });
      }
    }
  }

  return matches;
}

function hashFile(filePath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

function buildBundleHashIndex(contentRoots) {
  const hashIndex = new Map();

  for (const rootPath of contentRoots) {
    for (const filePath of walkFiles(rootPath)) {
      if (path.basename(filePath) === 'index.md') {
        continue;
      }

      const hash = hashFile(filePath);
      const matches = hashIndex.get(hash) ?? [];
      matches.push(toRepoRelative(filePath));
      hashIndex.set(hash, matches);
    }
  }

  return hashIndex;
}

function classifySharedAssets(assetRoot, bundleHashIndex) {
  const duplicates = [];
  const unique = [];

  for (const filePath of walkFiles(assetRoot)) {
    const hash = hashFile(filePath);
    const matches = bundleHashIndex.get(hash) ?? [];

    if (matches.length > 0) {
      duplicates.push({
        file: toRepoRelative(filePath),
        matches
      });
      continue;
    }

    unique.push(toRepoRelative(filePath));
  }

  return { duplicates, unique };
}

function ensureParentDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const contentFiles = options.contentRoots.flatMap((rootPath) => walkFiles(rootPath));
  const buildFiles = walkFiles(options.buildRoot);
  const sourceReferenceMatches = collectReferenceMatches(contentFiles);
  const buildReferenceMatches = collectReferenceMatches(buildFiles);
  const bundleHashIndex = buildBundleHashIndex(options.contentRoots);
  const { duplicates, unique } = classifySharedAssets(options.assetRoot, bundleHashIndex);

  const report = {
    generatedAt: new Date().toISOString(),
    contentRoots: options.contentRoots.map(toRepoRelative),
    assetRoot: toRepoRelative(options.assetRoot),
    buildRoot: toRepoRelative(options.buildRoot),
    sourceReferenceCount: sourceReferenceMatches.length,
    buildReferenceCount: buildReferenceMatches.length,
    duplicateCount: duplicates.length,
    uniqueCount: unique.length,
    sourceReferenceMatches,
    buildReferenceMatches,
    duplicateFiles: duplicates,
    uniqueFiles: unique
  };

  ensureParentDirectory(options.reportFile);
  fs.writeFileSync(options.reportFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  ensureParentDirectory(options.deleteListFile);
  const deleteListContent = duplicates.map((entry) => entry.file).join('\n');
  fs.writeFileSync(options.deleteListFile, deleteListContent === '' ? '' : `${deleteListContent}\n`, 'utf8');

  console.log(
    `Bundled media audit complete. Source refs: ${sourceReferenceMatches.length}. Built refs: ${buildReferenceMatches.length}. ` +
      `Shared duplicates: ${duplicates.length}. Shared unique holdouts: ${unique.length}. Report: ${toRepoRelative(options.reportFile)}.`
  );

  if (sourceReferenceMatches.length > 0 || buildReferenceMatches.length > 0) {
    process.exitCode = 1;
  }
}

main();