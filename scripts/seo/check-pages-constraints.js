import { access, lstat, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import fg from 'fast-glob';

import {
  extractRedirectDetails,
  loadManifest,
  repoRoot,
  toPosixPath,
  toRepoRelative
} from '../migration/url-validation-helpers.js';

const publishedSiteLimitBytes = 1024 * 1024 * 1024;
const defaultMaxSizeBytes = 800 * 1024 * 1024;
const defaultAliasWarningThreshold = 500;

const defaults = {
  manifestPath: path.join(repoRoot, 'migration', 'url-manifest.json'),
  publicRoot: path.join(repoRoot, 'public'),
  staticRoot: path.join(repoRoot, 'src', 'static'),
  reportPath: path.join(repoRoot, 'migration', 'reports', 'phase-5-pages-constraints-report.md'),
  maxSizeBytes: defaultMaxSizeBytes,
  aliasWarningThreshold: defaultAliasWarningThreshold,
  buildDurationMs: parseBuildDuration(process.env.PAGES_CONSTRAINTS_BUILD_DURATION_MS)
};

function parseBuildDuration(value) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid build duration value: ${value}`);
  }

  return parsed;
}

function printHelp() {
  console.log(`Usage: node scripts/seo/check-pages-constraints.js [options]

Options:
  --manifest <path>              Override migration/url-manifest.json path.
  --public-dir <path>            Override built public directory path.
  --static-dir <path>            Override source static directory path.
  --report <path>                Override markdown report output path.
  --max-size-mb <number>         Override maximum allowed public size in MB (default: 800).
  --alias-warning-threshold <n>  Override warning threshold for pages-static alias count (default: 500).
  --build-duration-ms <number>   Supply production build duration in milliseconds.
  --help                         Show this help message.
`);
}

function parseArgs(argv) {
  const options = { ...defaults };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case '--manifest':
        options.manifestPath = path.resolve(argv[++index]);
        break;
      case '--public-dir':
        options.publicRoot = path.resolve(argv[++index]);
        break;
      case '--static-dir':
        options.staticRoot = path.resolve(argv[++index]);
        break;
      case '--report':
        options.reportPath = path.resolve(argv[++index]);
        break;
      case '--max-size-mb':
        options.maxSizeBytes = toBytesFromMegabytes(argv[++index], '--max-size-mb');
        break;
      case '--alias-warning-threshold':
        options.aliasWarningThreshold = toPositiveInteger(argv[++index], '--alias-warning-threshold');
        break;
      case '--build-duration-ms':
        options.buildDurationMs = parseBuildDuration(argv[++index]);
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

function toBytesFromMegabytes(value, flagName) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${flagName} must be a positive number.`);
  }

  return Math.round(parsed * 1024 * 1024);
}

function toPositiveInteger(value, flagName) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${flagName} must be a positive integer.`);
  }

  return parsed;
}

function formatBytes(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatPercentage(value) {
  return `${value.toFixed(2)}%`;
}

function formatDuration(milliseconds) {
  if (milliseconds == null) {
    return 'Not supplied';
  }

  if (milliseconds < 1000) {
    return `${milliseconds.toFixed(0)} ms`;
  }

  const seconds = milliseconds / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(2)} s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
}

function escapeMarkdown(value) {
  return String(value).replace(/\|/g, '\\|');
}

function statusLabel(passed) {
  return passed ? 'Pass' : 'Fail';
}

function domainStatus(name, fallback) {
  const value = process.env[name];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

async function ensureReadable(filePath) {
  try {
    await access(filePath);
  } catch {
    throw new Error(`Required path is missing: ${toRepoRelative(filePath)}`);
  }
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function collectArtifactStats(publicRoot) {
  const symlinks = [];
  const hardLinks = [];
  const unsupportedEntries = [];
  const directories = [];
  let fileCount = 0;
  let totalSizeBytes = 0;
  const queue = [publicRoot];

  while (queue.length > 0) {
    const currentDirectory = queue.shift();
    const entries = await readdir(currentDirectory, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = path.join(currentDirectory, entry.name);
      const relativePath = toPosixPath(path.relative(publicRoot, absolutePath));
      const stats = await lstat(absolutePath);

      if (stats.isSymbolicLink()) {
        symlinks.push(relativePath);
        continue;
      }

      if (stats.isDirectory()) {
        directories.push(relativePath);
        queue.push(absolutePath);
        continue;
      }

      if (stats.isFile()) {
        fileCount += 1;
        totalSizeBytes += stats.size;

        if (stats.nlink > 1) {
          hardLinks.push({ path: relativePath, linkCount: stats.nlink });
        }

        continue;
      }

      unsupportedEntries.push(relativePath);
    }
  }

  return {
    fileCount,
    directoryCount: directories.length,
    totalSizeBytes,
    symlinks,
    hardLinks,
    unsupportedEntries,
    hasTopLevelIndex: await fileExists(path.join(publicRoot, 'index.html'))
  };
}

async function collectAliasArtifactStats(publicRoot) {
  const htmlFiles = await fg('**/*.html', {
    cwd: publicRoot,
    absolute: true,
    onlyFiles: true,
    suppressErrors: true
  });
  let redirectHelperCount = 0;
  let redirectHelperBytes = 0;

  for (const filePath of htmlFiles) {
    const htmlSource = await readFile(filePath, 'utf8');
    const redirectDetails = extractRedirectDetails(htmlSource);

    if (!redirectDetails.isRedirectPage) {
      continue;
    }

    const stats = await lstat(filePath);
    redirectHelperCount += 1;
    redirectHelperBytes += stats.size;
  }

  return {
    redirectHelperCount,
    redirectHelperBytes,
    averageRedirectHelperBytes: redirectHelperCount > 0 ? redirectHelperBytes / redirectHelperCount : 0,
    estimatedBytesPer100Aliases: redirectHelperCount > 0 ? (redirectHelperBytes / redirectHelperCount) * 100 : 0
  };
}

function collectManifestAliasStats(manifestEntries) {
  const mergeEntries = manifestEntries.filter((entry) => entry.disposition === 'merge');
  const pagesStaticMergeEntries = mergeEntries.filter((entry) => entry.implementation_layer === 'pages-static');
  const edgeRedirectEntries = mergeEntries.filter((entry) => entry.implementation_layer === 'edge-cdn');

  return {
    mergeCount: mergeEntries.length,
    pagesStaticMergeCount: pagesStaticMergeEntries.length,
    edgeRedirectCount: edgeRedirectEntries.length
  };
}

function collectChecks({ artifactStats, maxSizeBytes }) {
  return [
    {
      label: 'Top-level index.html present',
      passed: artifactStats.hasTopLevelIndex,
      details: artifactStats.hasTopLevelIndex ? 'public/index.html is present.' : 'public/index.html is missing.'
    },
    {
      label: 'Published size below threshold',
      passed: artifactStats.totalSizeBytes <= maxSizeBytes,
      details: `${formatBytes(artifactStats.totalSizeBytes)} used vs ${formatBytes(maxSizeBytes)} configured gate.`
    },
    {
      label: 'No symbolic links in public/',
      passed: artifactStats.symlinks.length === 0,
      details: artifactStats.symlinks.length === 0 ? 'No symbolic links detected.' : `${artifactStats.symlinks.length} symbolic link(s) detected.`
    },
    {
      label: 'No hard links in public/',
      passed: artifactStats.hardLinks.length === 0,
      details: artifactStats.hardLinks.length === 0 ? 'No hard links detected.' : `${artifactStats.hardLinks.length} hard-linked file(s) detected.`
    },
    {
      label: 'Only files and directories in public/',
      passed: artifactStats.unsupportedEntries.length === 0,
      details: artifactStats.unsupportedEntries.length === 0 ? 'No unsupported special file types detected.' : `${artifactStats.unsupportedEntries.length} unsupported path(s) detected.`
    }
  ];
}

function buildReport({
  reportTimestamp,
  publicRoot,
  staticRoot,
  manifestPath,
  maxSizeBytes,
  aliasWarningThreshold,
  artifactStats,
  aliasArtifactStats,
  manifestAliasStats,
  checks,
  buildDurationMs,
  staticNoJekyllPresent
}) {
  const totalUsagePercent = (artifactStats.totalSizeBytes / publishedSiteLimitBytes) * 100;
  const gateUsagePercent = (artifactStats.totalSizeBytes / maxSizeBytes) * 100;
  const headroomToGateBytes = Math.max(maxSizeBytes - artifactStats.totalSizeBytes, 0);
  const headroomToPublishedLimitBytes = Math.max(publishedSiteLimitBytes - artifactStats.totalSizeBytes, 0);
  const aliasWarningTriggered = manifestAliasStats.pagesStaticMergeCount > aliasWarningThreshold;

  return `# Phase 5 Pages Constraints Report

Generated: ${reportTimestamp}

## Artifact summary

| Metric | Value | Notes |
| --- | --- | --- |
| Public output path | ${escapeMarkdown(toRepoRelative(publicRoot))} | Production build artifact inspected by the gate |
| Source static path | ${escapeMarkdown(toRepoRelative(staticRoot))} | Source of truth for static passthrough assets |
| URL manifest path | ${escapeMarkdown(toRepoRelative(manifestPath))} | Alias-growth baseline source |
| Public output size | ${formatBytes(artifactStats.totalSizeBytes)} | ${formatPercentage(totalUsagePercent)} of the 1 GB GitHub Pages published-site limit |
| Gate threshold | ${formatBytes(maxSizeBytes)} | ${formatPercentage(gateUsagePercent)} of the configured gate budget currently used |
| Headroom to gate | ${formatBytes(headroomToGateBytes)} | Remaining space before the CI gate fails |
| Headroom to 1 GB Pages limit | ${formatBytes(headroomToPublishedLimitBytes)} | Remaining space before the GitHub Pages hard limit |
| Artifact file count | ${artifactStats.fileCount} | Regular files in public/ |
| Artifact directory count | ${artifactStats.directoryCount} | Directories in public/ excluding root |
| Production build duration | ${formatDuration(buildDurationMs)} | Reported when supplied by the caller or CI workflow |

## Artifact structure conformance

| Check | Status | Details |
| --- | --- | --- |
${checks.map((check) => `| ${escapeMarkdown(check.label)} | ${statusLabel(check.passed)} | ${escapeMarkdown(check.details)} |`).join('\n')}

## Alias redirect growth

| Metric | Value | Notes |
| --- | --- | --- |
| Manifest merge records | ${manifestAliasStats.mergeCount} | All legacy routes currently classified as merge in migration/url-manifest.json |
| Pages-static merge records | ${manifestAliasStats.pagesStaticMergeCount} | Routes expected to publish as static redirect helpers |
| Edge redirect merge records | ${manifestAliasStats.edgeRedirectCount} | Routes already designated for edge handling |
| Redirect helper pages detected in public/ | ${aliasArtifactStats.redirectHelperCount} | HTML files in public/ with Hugo redirect-helper behavior |
| Redirect helper total size | ${formatBytes(aliasArtifactStats.redirectHelperBytes)} | Aggregate footprint of generated redirect helpers |
| Average redirect helper size | ${aliasArtifactStats.averageRedirectHelperBytes.toFixed(0)} bytes | Observed average HTML redirect-helper size |
| Estimated size per 100 aliases | ${formatBytes(aliasArtifactStats.estimatedBytesPer100Aliases)} | Based on observed redirect helper pages in public/ |
| Alias warning threshold | ${aliasWarningThreshold} pages-static merge records | ${aliasWarningTriggered ? 'Threshold exceeded. Evaluate edge redirect alternative.' : 'Threshold not exceeded.'} |

## Domain and Pages readiness snapshot

| Check | Status |
| --- | --- |
| src/static/.nojekyll present | ${staticNoJekyllPresent ? 'Yes' : 'No'} |
| Public DNS www.rhino-inquisitor.com CNAME | ${escapeMarkdown(domainStatus('PAGES_CONSTRAINTS_WWW_CNAME_STATUS', 'Pending manual verification'))} |
| Observed www target detail | ${escapeMarkdown(domainStatus('PAGES_CONSTRAINTS_WWW_CNAME_TARGET', 'Pending manual verification'))} |
| GitHub Pages custom-domain setting | ${escapeMarkdown(domainStatus('PAGES_CONSTRAINTS_PAGES_DOMAIN_STATUS', 'Pending repository settings verification'))} |
| GitHub Pages HTTPS status | ${escapeMarkdown(domainStatus('PAGES_CONSTRAINTS_HTTPS_STATUS', 'Pending repository settings verification'))} |
| GitHub domain verification status | ${escapeMarkdown(domainStatus('PAGES_CONSTRAINTS_DOMAIN_VERIFICATION_STATUS', 'Pending repository settings verification'))} |

## Notes

- GitHub Pages custom-workflow deployments must upload a single gzip archive containing a single tar file; the tar must contain only files and directories and must not contain symbolic or hard links.
- The published site should stay under 1 GB; this repository uses an 800 MB gate to keep operational headroom before the hard limit and deployment timeout risk.
- Official GitHub guidance says .nojekyll is not required for Actions-based Pages artifacts. This repository keeps a source-controlled marker so local and CI artifacts stay aligned.
- The domain and HTTPS checks above are informational. They are captured here for Phase 7 cutover readiness but are not used as deploy-time pass/fail signals inside this script.
`;
}

function printSummary({ artifactStats, aliasArtifactStats, manifestAliasStats, checks, maxSizeBytes, aliasWarningThreshold, reportPath }) {
  console.log('check:pages-constraints passed');
  console.log(`- public size: ${formatBytes(artifactStats.totalSizeBytes)} / ${formatBytes(maxSizeBytes)}`);
  console.log(`- artifact files: ${artifactStats.fileCount}`);
  console.log(`- directories: ${artifactStats.directoryCount}`);
  console.log(`- manifest merge records: ${manifestAliasStats.mergeCount} (${manifestAliasStats.pagesStaticMergeCount} pages-static, ${manifestAliasStats.edgeRedirectCount} edge-cdn)`);
  console.log(`- redirect helper pages detected: ${aliasArtifactStats.redirectHelperCount}`);
  console.log(`- symbolic links: ${artifactStats.symlinks.length}`);
  console.log(`- hard links: ${artifactStats.hardLinks.length}`);
  console.log(`- report written: ${toRepoRelative(reportPath)}`);

  const warningCheck = checks.find((check) => check.label === 'Published size below threshold');
  if (warningCheck?.passed !== true) {
    console.warn(`- warning: ${warningCheck.details}`);
  }

  if (manifestAliasStats.pagesStaticMergeCount > aliasWarningThreshold) {
    console.warn(`- warning: pages-static alias count ${manifestAliasStats.pagesStaticMergeCount} exceeds the ${aliasWarningThreshold}-record warning threshold; evaluate edge redirects.`);
  }
}

function printFailures({ artifactStats, checks }) {
  console.error('check:pages-constraints failed');

  for (const check of checks.filter((item) => !item.passed)) {
    console.error(`- ${check.label}: ${check.details}`);
  }

  for (const symlink of artifactStats.symlinks.slice(0, 10)) {
    console.error(`- symbolic link: ${symlink}`);
  }

  for (const hardLink of artifactStats.hardLinks.slice(0, 10)) {
    console.error(`- hard link: ${hardLink.path} (nlink=${hardLink.linkCount})`);
  }

  for (const unsupportedEntry of artifactStats.unsupportedEntries.slice(0, 10)) {
    console.error(`- unsupported entry: ${unsupportedEntry}`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  await ensureReadable(options.publicRoot);
  await ensureReadable(options.manifestPath);
  await ensureReadable(options.staticRoot);

  const staticNoJekyllPresent = await fileExists(path.join(options.staticRoot, '.nojekyll'));
  const manifestEntries = await loadManifest(options.manifestPath);
  const artifactStats = await collectArtifactStats(options.publicRoot);
  const aliasArtifactStats = await collectAliasArtifactStats(options.publicRoot);
  const manifestAliasStats = collectManifestAliasStats(manifestEntries);
  const checks = collectChecks({ artifactStats, maxSizeBytes: options.maxSizeBytes });
  const reportContent = buildReport({
    reportTimestamp: new Date().toISOString(),
    publicRoot: options.publicRoot,
    staticRoot: options.staticRoot,
    manifestPath: options.manifestPath,
    maxSizeBytes: options.maxSizeBytes,
    aliasWarningThreshold: options.aliasWarningThreshold,
    artifactStats,
    aliasArtifactStats,
    manifestAliasStats,
    checks,
    buildDurationMs: options.buildDurationMs,
    staticNoJekyllPresent
  });

  await mkdir(path.dirname(options.reportPath), { recursive: true });
  await writeFile(options.reportPath, reportContent, 'utf8');

  const hasBlockingFailure = checks.some((check) => !check.passed);
  if (hasBlockingFailure) {
    printFailures({ artifactStats, checks });
    process.exitCode = 1;
    return;
  }

  printSummary({
    artifactStats,
    aliasArtifactStats,
    manifestAliasStats,
    checks,
    maxSizeBytes: options.maxSizeBytes,
    aliasWarningThreshold: options.aliasWarningThreshold,
    reportPath: options.reportPath
  });
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`check:pages-constraints failed: ${message}`);
  process.exitCode = 1;
});