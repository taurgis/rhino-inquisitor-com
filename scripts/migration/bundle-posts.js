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
const defaultFilesystemRoot = path.join(path.resolve('.'), 'tmp/website-wordpress-backup/wp-content');
const siteMediaPattern = /(?:https?:\/\/(?:www\.)?rhino-inquisitor\.com)?(\/media\/[^\s)"'>]+)/giu;
const wordPressUploadVideoPattern = /https?:\/\/(?:www\.)?rhino-inquisitor\.com\/wp-content\/uploads\/[^\s)"'>]+\.(?:mp4|mov)(?:\?[^\s)"'>]*)?(?:#[^\s)"'>]*)?/giu;
const videoExtensionPattern = /\.(?:mp4|mov)$/iu;
const standaloneMarkdownLinkPattern = /^\s*\[([^\]\n]+)\]\((<[^>\n]+>|[^)\s]+)(?:\s+"[^"]*")?\)\s*$/u;

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const flatPostFiles = (await fg('*.md', {
    cwd: options.postsDir,
    absolute: true,
    onlyFiles: true
  })).filter((filePath) => path.basename(filePath).toLowerCase() !== '_index.md')
    .sort((left, right) => left.localeCompare(right));
  const bundleIndexFiles = (await fg('*/index.md', {
    cwd: options.postsDir,
    absolute: true,
    onlyFiles: true
  })).sort((left, right) => left.localeCompare(right));

  const report = {
    generatedAt: new Date().toISOString(),
    mode: options.write ? 'write' : 'dry-run',
    postsDir: toRepoRelative(options.postsDir),
    migratedPostCount: 0,
    localizedBundleCount: 0,
    shortcodeConversionCount: 0,
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
    report.shortcodeConversionCount += result.shortcodeConversions;
    report.copiedAssetCount += result.assets.filter((asset) => asset.status === 'copied').length;
    report.unresolvedReferenceCount += result.unresolved.length;
  }

  for (const bundleIndexFile of bundleIndexFiles) {
    const result = await localizeExistingBundle(bundleIndexFile, options);
    report.posts.push(result);
    if (result.status === 'bundle-updated') {
      report.localizedBundleCount += 1;
    }
    report.bundleAssetCount += result.assets.length;
    report.shortcodeConversionCount += result.shortcodeConversions;
    report.copiedAssetCount += result.assets.filter((asset) => asset.status === 'copied').length;
    report.unresolvedReferenceCount += result.unresolved.length;
  }

  if (options.reportFile) {
    await ensureDirectory(path.dirname(options.reportFile));
    await fs.writeFile(options.reportFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }

  console.log(
    [
      `Processed ${flatPostFiles.length} flat file(s) and ${bundleIndexFiles.length} existing bundle index file(s).`,
      `Migrated: ${report.migratedPostCount}.`,
      `Localized bundles: ${report.localizedBundleCount}.`,
      `Shortcode conversions: ${report.shortcodeConversionCount}.`,
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
      case '--filesystem-root':
        parsed.filesystemRoot = path.resolve(argv[++index]);
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
    filesystemRoot: parsed.filesystemRoot ?? defaultFilesystemRoot,
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
  --filesystem-root <path>
                        Override the WordPress filesystem snapshot root.
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
      shortcodeConversions: 0,
      assets: [],
      unresolved: []
    };
  }

  const localization = await localizeMediaInBundle(source, options);

  if (options.write) {
    await ensureDirectory(bundleDir);
    await copyPlannedAssets(localization.assets, bundleDir);
    await fs.writeFile(bundleIndexPath, localization.rewritten, 'utf8');
    await fs.unlink(postFile);
  }

  return {
    file: toRepoRelative(postFile),
    bundleDir: toRepoRelative(bundleDir),
    status: 'migrated',
    reason: '',
    reusedExistingDir: bundleExists,
    rewrittenReferences: localization.replacementCount,
    shortcodeConversions: localization.shortcodeConversions,
    assets: localization.assets,
    unresolved: localization.unresolved
  };
}

async function localizeExistingBundle(bundleIndexPath, options) {
  const source = await fs.readFile(bundleIndexPath, 'utf8');
  const bundleDir = path.dirname(bundleIndexPath);
  const localization = await localizeMediaInBundle(source, options);
  const contentChanged = localization.rewritten !== source;

  if (options.write) {
    await copyPlannedAssets(localization.assets, bundleDir);
    if (contentChanged) {
      await fs.writeFile(bundleIndexPath, localization.rewritten, 'utf8');
    }
  }

  return {
    file: toRepoRelative(bundleIndexPath),
    bundleDir: toRepoRelative(bundleDir),
    status: contentChanged || localization.assets.length > 0 ? 'bundle-updated' : 'bundle-unchanged',
    reason: '',
    reusedExistingDir: true,
    rewrittenReferences: localization.replacementCount,
    shortcodeConversions: localization.shortcodeConversions,
    assets: localization.assets,
    unresolved: localization.unresolved
  };
}

async function localizeMediaInBundle(source, options) {
  const references = collectMediaReferences(source);
  const assets = [];
  const unresolved = [];
  const replacementMap = new Map();
  const assignedNames = new Map();

  for (const reference of references) {
    const referenceMeta = parseMediaReference(reference);
    if (!referenceMeta) {
      continue;
    }

    const sourceFile = await resolveReferenceSource(referenceMeta, options);
    if (!sourceFile) {
      unresolved.push({
        reference,
        normalizedPath: referenceMeta.normalizedPath,
        message: referenceMeta.sourceKind === 'wp-upload-video'
          ? 'Referenced WordPress upload video does not resolve in the configured filesystem snapshot root.'
          : 'Referenced media file does not resolve in src/assets or src/static.'
      });
      continue;
    }

    const targetFileName = assignTargetFileName(referenceMeta.preferredName, sourceFile, assignedNames);
    replacementMap.set(reference, targetFileName);
    assets.push({
      reference,
      normalizedPath: referenceMeta.normalizedPath,
      sourceFile: toRepoRelative(sourceFile),
      targetFileName,
      sourceKind: referenceMeta.sourceKind,
      status: options.write ? 'copied' : 'planned'
    });
  }

  let rewritten = source;
  for (const [reference, replacement] of replacementMap.entries()) {
    rewritten = rewritten.split(reference).join(replacement);
  }

  const localizedVideoTargets = collectLocalizedVideoTargets(assets);
  const shortcodeRewrite = rewriteStandaloneLocalVideoLinks(rewritten, localizedVideoTargets);

  return {
    rewritten: shortcodeRewrite.rewritten,
    replacementCount: replacementMap.size,
    shortcodeConversions: shortcodeRewrite.convertedCount,
    assets,
    unresolved
  };
}

function collectLocalizedVideoTargets(assets) {
  const targets = new Set();

  for (const asset of assets) {
    if (!isVideoTarget(asset.targetFileName)) {
      continue;
    }

    const normalizedTarget = normalizeBundleRelativeTarget(asset.targetFileName);
    if (normalizedTarget) {
      targets.add(normalizedTarget.toLowerCase());
    }
  }

  return targets;
}

function rewriteStandaloneLocalVideoLinks(source, localizedVideoTargets) {
  if (localizedVideoTargets.size === 0) {
    return { rewritten: source, convertedCount: 0 };
  }

  const lines = String(source ?? '').split(/\r?\n/u);
  let convertedCount = 0;

  const rewrittenLines = lines.map((line) => {
    const match = line.match(standaloneMarkdownLinkPattern);
    if (!match) {
      return line;
    }

    const normalizedTarget = normalizeBundleRelativeTarget(match[2]);
    if (!normalizedTarget || !localizedVideoTargets.has(normalizedTarget.toLowerCase())) {
      return line;
    }

    convertedCount += 1;
    const title = normalizeShortcodeTitle(match[1], normalizedTarget);
    return `{{< local-video src="${normalizedTarget}" title="${title}" >}}`;
  });

  return {
    rewritten: rewrittenLines.join('\n'),
    convertedCount
  };
}

function normalizeBundleRelativeTarget(rawTarget) {
  const trimmed = String(rawTarget ?? '').trim().replace(/^<|>$/g, '');
  if (!trimmed || isExternalTarget(trimmed)) {
    return '';
  }

  const withoutQueryHash = stripQueryHash(trimmed).replace(/^\.\//, '');
  if (!withoutQueryHash) {
    return '';
  }

  const normalized = path.posix.normalize(withoutQueryHash);
  if (!normalized || normalized.startsWith('..') || normalized.startsWith('/')) {
    return '';
  }

  return normalized;
}

function isExternalTarget(target) {
  return target.startsWith('http://')
    || target.startsWith('https://')
    || target.startsWith('/')
    || target.startsWith('#')
    || target.startsWith('mailto:')
    || target.startsWith('tel:');
}

function isVideoTarget(target) {
  return videoExtensionPattern.test(stripQueryHash(String(target ?? '')));
}

function normalizeShortcodeTitle(rawTitle, fallback) {
  const cleaned = String(rawTitle ?? '').replace(/\s+/gu, ' ').trim();
  const title = cleaned || fallback;
  return title.replace(/"/gu, "'");
}

function collectMediaReferences(source) {
  const references = new Set();

  for (const match of source.matchAll(siteMediaPattern)) {
    references.add(match[0]);
  }

  for (const match of source.matchAll(wordPressUploadVideoPattern)) {
    references.add(match[0]);
  }

  return [...references];
}

function parseMediaReference(reference) {
  const trimmed = String(reference ?? '').trim();
  if (!trimmed) {
    return null;
  }

  const localMediaMatch = trimmed.match(/(?:https?:\/\/(?:www\.)?rhino-inquisitor\.com)?(\/media\/[^\s)"'>]+)/iu);
  if (localMediaMatch?.[1]) {
    const normalizedPath = localMediaMatch[1];
    return {
      sourceKind: 'site-media',
      normalizedPath,
      preferredName: path.basename(stripQueryHash(normalizedPath))
    };
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  const host = parsed.host.toLowerCase();
  const pathname = decodeURIComponent(parsed.pathname);
  if (!(host === 'rhino-inquisitor.com' || host === 'www.rhino-inquisitor.com')) {
    return null;
  }
  if (!pathname.startsWith('/wp-content/uploads/')) {
    return null;
  }
  if (!videoExtensionPattern.test(pathname)) {
    return null;
  }

  return {
    sourceKind: 'wp-upload-video',
    normalizedPath: pathname,
    preferredName: path.basename(pathname)
  };
}

async function resolveReferenceSource(referenceMeta, options) {
  if (referenceMeta.sourceKind === 'site-media') {
    return resolveSourceMediaFile(referenceMeta.normalizedPath, {
      assetsDir: options.assetsDir,
      staticDir: options.staticDir
    });
  }

  if (referenceMeta.sourceKind === 'wp-upload-video') {
    return resolveWordPressUploadVideo(referenceMeta.normalizedPath, options.filesystemRoot);
  }

  return null;
}

async function resolveWordPressUploadVideo(uploadPath, filesystemRoot) {
  if (!filesystemRoot) {
    return null;
  }

  const normalizedUploadPath = path.posix.normalize(String(uploadPath ?? ''));
  if (!normalizedUploadPath.startsWith('/wp-content/uploads/')) {
    return null;
  }

  const relativeUploadPath = normalizedUploadPath.replace(/^\/wp-content\//, '');
  if (!relativeUploadPath || relativeUploadPath.startsWith('..')) {
    return null;
  }

  const sourceFile = path.join(filesystemRoot, relativeUploadPath);
  return (await fileExists(sourceFile)) ? sourceFile : null;
}

async function copyPlannedAssets(assets, bundleDir) {
  for (const asset of assets) {
    const fromPath = path.join(path.resolve('.'), asset.sourceFile);
    const toPath = path.join(bundleDir, asset.targetFileName);
    if (!(await fileExists(toPath))) {
      await fs.copyFile(fromPath, toPath);
    }
  }
}

function stripQueryHash(value) {
  return String(value ?? '').split('#', 1)[0].split('?', 1)[0];
}

function assignTargetFileName(preferredName, sourceFile, assignedNames) {
  const candidateName = stripQueryHash(preferredName);
  const resolvedPreferredName = candidateName || path.basename(sourceFile);
  const normalizedPreferredName = path.basename(resolvedPreferredName);
  const finalPreferredName = normalizedPreferredName || path.basename(sourceFile);
  const existingSource = assignedNames.get(finalPreferredName);
  if (!existingSource || existingSource === sourceFile) {
    assignedNames.set(finalPreferredName, sourceFile);
    return finalPreferredName;
  }

  const parsedPath = path.parse(finalPreferredName);
  let collisionIndex = 2;
  let candidate = `${parsedPath.name}-${collisionIndex}${parsedPath.ext}`;
  while (assignedNames.has(candidate) && assignedNames.get(candidate) !== sourceFile) {
    collisionIndex += 1;
    candidate = `${parsedPath.name}-${collisionIndex}${parsedPath.ext}`;
  }
  assignedNames.set(candidate, sourceFile);
  return candidate;
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
