import fs from 'node:fs/promises';
import path from 'node:path';

import fg from 'fast-glob';

import {
  defaultAssetsDir,
  defaultStaticDir,
  ensureDirectory,
  fileExists,
  resolveSourceMediaFile,
  toRepoRelative
} from './media-helpers.js';

const defaultPostsDir = path.join(path.resolve('.'), 'src/content/posts');
const defaultReportFile = path.join(path.resolve('.'), 'tmp/post-bundle-migration-report.json');
const siteMediaPattern = /(?:https?:\/\/(?:www\.)?rhino-inquisitor\.com)?(\/media\/[^\s)"'>]+)/giu;

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const flatPostFiles = (await fg('*.md', {
    cwd: options.postsDir,
    absolute: true,
    onlyFiles: true
  })).sort((left, right) => left.localeCompare(right));

  const report = {
    generatedAt: new Date().toISOString(),
    mode: options.write ? 'write' : 'dry-run',
    postsDir: toRepoRelative(options.postsDir),
    migratedPostCount: 0,
    bundleAssetCount: 0,
    copiedAssetCount: 0,
    unresolvedReferenceCount: 0,
    posts: []
  };

  for (const postFile of flatPostFiles) {
    const result = await migratePostFile(postFile, options);
    report.posts.push(result);
    if (result.status === 'migrated') {
      report.migratedPostCount += 1;
    }
    report.bundleAssetCount += result.assets.length;
    report.copiedAssetCount += result.assets.filter((asset) => asset.status === 'copied').length;
    report.unresolvedReferenceCount += result.unresolved.length;
  }

  if (options.reportFile) {
    await ensureDirectory(path.dirname(options.reportFile));
    await fs.writeFile(options.reportFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }

  console.log(
    [
      `Processed ${flatPostFiles.length} flat post file(s).`,
      `Migrated: ${report.migratedPostCount}.`,
      `Bundle assets: ${report.bundleAssetCount}.`,
      options.write ? `Copied assets: ${report.copiedAssetCount}.` : '',
      `Unresolved references: ${report.unresolvedReferenceCount}.`,
      options.reportFile ? `Report: ${toRepoRelative(options.reportFile)}.` : ''
    ].filter(Boolean).join(' ')
  );

  if (report.unresolvedReferenceCount > 0) {
    process.exitCode = 1;
  }
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    switch (argument) {
      case '--posts-dir':
        parsed.postsDir = path.resolve(argv[++index]);
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
      case '--write':
        parsed.write = true;
        break;
      case '--no-report':
        parsed.reportFile = null;
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
    postsDir: parsed.postsDir ?? defaultPostsDir,
    assetsDir: parsed.assetsDir ?? defaultAssetsDir,
    staticDir: parsed.staticDir ?? defaultStaticDir,
    reportFile: Object.prototype.hasOwnProperty.call(parsed, 'reportFile') ? parsed.reportFile : defaultReportFile,
    write: parsed.write === true
  };
}

function printHelp() {
  console.log(`Usage: node scripts/migration/bundle-posts.js [options]

Options:
  --posts-dir <path>    Override the posts directory to migrate.
  --assets-dir <path>   Override the src/assets directory.
  --static-dir <path>   Override the src/static directory.
  --report-file <path>  Write a JSON migration report to this path.
  --no-report           Skip writing the JSON report.
  --write               Apply the migration. Without this flag the script is dry-run only.
  --help                Show this help message.
`);
}

async function migratePostFile(postFile, options) {
  const source = await fs.readFile(postFile, 'utf8');
  const bundleDir = path.join(path.dirname(postFile), path.basename(postFile, path.extname(postFile)));
  const bundleIndexPath = path.join(bundleDir, 'index.md');
  const bundleExists = await fileExists(bundleDir);
  const bundleIndexExists = await fileExists(bundleIndexPath);

  if (bundleIndexExists) {
    return {
      file: toRepoRelative(postFile),
      bundleDir: toRepoRelative(bundleDir),
      status: 'skipped',
      reason: 'Target bundle index already exists.',
      reusedExistingDir: false,
      rewrittenReferences: 0,
      assets: [],
      unresolved: []
    };
  }

  const matches = [...source.matchAll(siteMediaPattern)].map((match) => match[0]);
  const uniqueMatches = [...new Set(matches)];
  const assets = [];
  const unresolved = [];
  const replacementMap = new Map();
  const assignedNames = new Map();

  for (const reference of uniqueMatches) {
    const normalizedPath = normalizeMediaReference(reference);
    if (!normalizedPath) {
      continue;
    }

    const sourceFile = await resolveSourceMediaFile(normalizedPath, {
      assetsDir: options.assetsDir,
      staticDir: options.staticDir
    });

    if (!sourceFile) {
      unresolved.push({
        reference,
        normalizedPath,
        message: 'Referenced media file does not resolve in src/assets or src/static.'
      });
      continue;
    }

    const targetFileName = assignTargetFileName(normalizedPath, sourceFile, assignedNames);
    replacementMap.set(reference, targetFileName);
    assets.push({
      reference,
      normalizedPath,
      sourceFile: toRepoRelative(sourceFile),
      targetFileName,
      status: options.write ? 'copied' : 'planned'
    });
  }

  let rewritten = source;
  for (const [reference, replacement] of replacementMap.entries()) {
    rewritten = rewritten.split(reference).join(replacement);
  }

  if (options.write) {
    await ensureDirectory(bundleDir);

    for (const asset of assets) {
      const fromPath = path.join(path.resolve('.'), asset.sourceFile);
      const toPath = path.join(bundleDir, asset.targetFileName);
      if (!(await fileExists(toPath))) {
        await fs.copyFile(fromPath, toPath);
      }
    }

    await fs.writeFile(bundleIndexPath, rewritten, 'utf8');
    await fs.unlink(postFile);
  }

  return {
    file: toRepoRelative(postFile),
    bundleDir: toRepoRelative(bundleDir),
    status: 'migrated',
    reason: '',
    reusedExistingDir: bundleExists,
    rewrittenReferences: replacementMap.size,
    assets,
    unresolved
  };
}

function normalizeMediaReference(reference) {
  const trimmed = String(reference ?? '').trim();
  if (!trimmed) {
    return null;
  }

  const match = trimmed.match(/(?:https?:\/\/(?:www\.)?rhino-inquisitor\.com)?(\/media\/[^\s)"'>]+)/iu);
  return match?.[1] ?? null;
}

function assignTargetFileName(normalizedPath, sourceFile, assignedNames) {
  const preferredName = path.basename(normalizedPath);
  const existingSource = assignedNames.get(preferredName);
  if (!existingSource || existingSource === sourceFile) {
    assignedNames.set(preferredName, sourceFile);
    return preferredName;
  }

  const parsedPath = path.parse(preferredName);
  let collisionIndex = 2;
  let candidateName = `${parsedPath.name}-${collisionIndex}${parsedPath.ext}`;
  while (assignedNames.has(candidateName) && assignedNames.get(candidateName) !== sourceFile) {
    collisionIndex += 1;
    candidateName = `${parsedPath.name}-${collisionIndex}${parsedPath.ext}`;
  }
  assignedNames.set(candidateName, sourceFile);
  return candidateName;
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});