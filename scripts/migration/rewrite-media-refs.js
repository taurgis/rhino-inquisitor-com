import fs from 'node:fs/promises';
import path from 'node:path';

import fg from 'fast-glob';
import matter from 'gray-matter';

import {
  defaultContentDir,
  defaultConvertedRecordsDir,
  defaultManifestFile,
  normalizeSourceMediaUrl,
  readJsonFile,
  toRepoRelative,
  writeJsonFile
} from './media-helpers.js';

async function main() {
  const options = resolveOptions(process.argv.slice(2));
  const manifest = await readJsonFile(options.manifestFile, 'media manifest');
  const replacementMap = buildReplacementMap(Array.isArray(manifest) ? manifest : []);
  const warnings = [];

  const recordFiles = (await fg('*.json', {
    cwd: options.recordsDir,
    absolute: true,
    onlyFiles: true
  })).sort((left, right) => left.localeCompare(right));

  for (const recordFile of recordFiles) {
    const record = await readJsonFile(recordFile, `converted record ${path.basename(recordFile)}`);
    if (typeof record.bodyMarkdown !== 'string') {
      continue;
    }

    const rewritten = rewriteContent(record.bodyMarkdown, replacementMap);
    warnings.push(...findUnmappedWarnings(rewritten, replacementMap, record.legacyUrl));
    if (rewritten !== record.bodyMarkdown) {
      record.bodyMarkdown = rewritten;
      await writeJsonFile(recordFile, record);
    }
  }

  const markdownFiles = (await fg('**/*.md', {
    cwd: options.contentDir,
    absolute: true,
    onlyFiles: true
  })).sort((left, right) => left.localeCompare(right));

  for (const markdownFile of markdownFiles) {
    const source = await fs.readFile(markdownFile, 'utf8');
    const parsed = matter(source);
    const rewrittenContent = rewriteContent(parsed.content, replacementMap);
    const currentHeroImage = typeof parsed.data.heroImage === 'string' ? parsed.data.heroImage : null;
    const rewrittenHeroImage = currentHeroImage ? resolveReplacement(currentHeroImage, replacementMap) ?? currentHeroImage : currentHeroImage;
    const heroChanged = rewrittenHeroImage !== currentHeroImage;
    warnings.push(...findUnmappedWarnings(rewrittenContent, replacementMap, toRepoRelative(markdownFile)));

    if (rewrittenContent !== parsed.content || heroChanged) {
      if (heroChanged) {
        parsed.data.heroImage = rewrittenHeroImage;
      }
      const updated = matter.stringify(rewrittenContent.trimEnd() ? `${rewrittenContent.trimEnd()}\n` : '', parsed.data, {
        lineWidth: 0
      });
      await fs.writeFile(markdownFile, updated, 'utf8');
    }
  }

  const warningCount = warnings.length;
  if (warningCount > 0) {
    for (const warning of warnings.slice(0, 50)) {
      console.warn(`Warning: ${warning}`);
    }
    if (warningCount > 50) {
      console.warn(`Warning: ${warningCount - 50} additional unmapped media reference(s) omitted from console output.`);
    }
  }

  console.log(
    [
      `Rewrote media references in ${recordFiles.length} converted record(s) and ${markdownFiles.length} staged Markdown file(s).`,
      `Warnings: ${warningCount}.`,
      `Manifest: ${toRepoRelative(options.manifestFile)}.`
    ].join(' ')
  );
}

function resolveOptions(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    switch (argument) {
      case '--records-dir':
        parsed.recordsDir = path.resolve(argv[++index]);
        break;
      case '--content-dir':
        parsed.contentDir = path.resolve(argv[++index]);
        break;
      case '--manifest-file':
        parsed.manifestFile = path.resolve(argv[++index]);
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
    recordsDir: parsed.recordsDir ?? defaultConvertedRecordsDir,
    contentDir: parsed.contentDir ?? defaultContentDir,
    manifestFile: parsed.manifestFile ?? defaultManifestFile
  };
}

function printHelp() {
  console.log(`Usage: node scripts/migration/rewrite-media-refs.js [options]

Options:
  --records-dir <path>     Override migration/output input directory.
  --content-dir <path>     Override migration/output/content directory.
  --manifest-file <path>   Override migration/intermediate/media-manifest.json.
  --help                   Show this help message.
`);
}

function buildReplacementMap(manifest) {
  const map = new Map();

  for (const entry of manifest.filter((manifestEntry) => manifestEntry.status === 'ok')) {
    for (const candidate of buildSourceCandidates(entry)) {
      map.set(candidate, entry.publicPath);
      map.set(candidate.toLowerCase(), entry.publicPath);
    }
  }

  return map;
}

function buildSourceCandidates(entry) {
  const normalized = normalizeSourceMediaUrl(entry.sourceUrl);
  return [
    entry.sourceUrl,
    entry.normalizedSourceUrl,
    entry.canonicalUrl,
    normalized?.sourceUrl,
    normalized?.normalizedSourceUrl,
    normalized?.canonicalUrl
  ].filter(Boolean);
}

function rewriteContent(source, replacementMap) {
  let rewritten = source.replace(/(\]\()(https?:\/\/[^\s)"'>]+)(\))/g, (match, prefix, candidate, suffix) => {
    const replacement = resolveReplacement(candidate, replacementMap);
    return replacement ? `${prefix}${replacement}${suffix}` : match;
  });

  rewritten = rewritten.replace(/https?:\/\/[^\s\]"'>)]+/g, (candidate) => resolveReplacement(candidate, replacementMap) ?? candidate);

  return rewritten;
}

function resolveReplacement(candidate, replacementMap) {
  const normalized = normalizeSourceMediaUrl(candidate);
  return replacementMap.get(candidate)
    ?? replacementMap.get(candidate.toLowerCase())
    ?? replacementMap.get(normalized?.sourceUrl ?? '')
    ?? replacementMap.get((normalized?.sourceUrl ?? '').toLowerCase())
    ?? replacementMap.get(normalized?.normalizedSourceUrl ?? '')
    ?? replacementMap.get((normalized?.normalizedSourceUrl ?? '').toLowerCase())
    ?? replacementMap.get(normalized?.canonicalUrl ?? '')
    ?? replacementMap.get((normalized?.canonicalUrl ?? '').toLowerCase())
    ?? null;
}

function findUnmappedWarnings(source, replacementMap, label) {
  const warnings = [];
  const pattern = /https?:\/\/[^\s\]"'>)]+/g;

  for (const match of source.matchAll(pattern)) {
    const candidate = match[0];
    const normalized = normalizeSourceMediaUrl(candidate);
    if (!normalized || replacementMap.has(candidate) || replacementMap.has(normalized.canonicalUrl)) {
      continue;
    }
    warnings.push(`${label} retains non-manifest media reference ${candidate}`);
  }

  return warnings;
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});