import { access, lstat, mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import fg from 'fast-glob';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');

const defaults = {
  publicDir: path.join(repoRoot, 'public'),
  reportPath: path.join(repoRoot, 'tmp', 'artifact-validation-report.json'),
  manifestPath: path.join(repoRoot, 'url-data', 'url-manifest.json'),
  label: 'artifact-validation',
  compressedWarnMb: 700,
  projectedFailMb: 900,
};

const forbiddenDirectorySegments = new Set(['node_modules', '.git', '.github']);
const forbiddenFilePattern = /(^|\/)~|\.bak$|\.old$|\.orig$|\.tmp$|\.swp$|\.swo$/i;
const forbiddenRepoFilePattern = /(^|\/)(package\.json|package-lock\.json|yarn\.lock|pnpm-lock\.yaml|hugo\.toml|\.env(?:\..*)?)$/i;

function printHelp() {
  console.log(`Usage: node scripts/gates/validate-artifact.js [options]

Options:
  --public-dir <path>            Path to built Hugo output (default: public)
  --report <path>                Report output path (default: tmp/artifact-validation-report.json)
  --manifest <path>              Path to url-manifest.json for uppercase route exceptions
  --label <value>                Label used in report/log output (default: artifact-validation)
  --compressed-warn-mb <number>  Warn when compressed artifact size is at/above this value (default: 700)
  --projected-fail-mb <number>   Fail when projected published size is above this value (default: 900)
  --help                         Show this help message
`);
}

function toPositiveNumber(rawValue, flagName) {
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${flagName} must be a positive number.`);
  }
  return parsed;
}

function parseArgs(argv) {
  const options = { ...defaults };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case '--public-dir':
        options.publicDir = path.resolve(argv[++index]);
        break;
      case '--report':
        options.reportPath = path.resolve(argv[++index]);
        break;
      case '--manifest':
        options.manifestPath = path.resolve(argv[++index]);
        break;
      case '--label':
        options.label = String(argv[++index] ?? '').trim() || defaults.label;
        break;
      case '--compressed-warn-mb':
        options.compressedWarnMb = toPositiveNumber(argv[++index], '--compressed-warn-mb');
        break;
      case '--projected-fail-mb':
        options.projectedFailMb = toPositiveNumber(argv[++index], '--projected-fail-mb');
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

function toMegabytes(bytes) {
  return Number((bytes / (1024 * 1024)).toFixed(2));
}

function formatMegabytes(bytes) {
  return `${toMegabytes(bytes).toFixed(2)} MB`;
}

function toPosixPath(value) {
  return value.split(path.sep).join('/');
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function measureCompressedArtifactBytes(publicDir) {
  const tempDirectory = await mkdtemp(path.join(os.tmpdir(), 'rhi-075-artifact-'));
  const archivePath = path.join(tempDirectory, 'artifact.tar.gz');

  try {
    const result = spawnSync('tar', ['-czf', archivePath, '-C', publicDir, '.'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    if (result.status !== 0) {
      throw new Error(`tar failed with exit code ${result.status}: ${result.stderr || 'no stderr output'}`);
    }

    const archiveStats = await stat(archivePath);
    return archiveStats.size;
  } finally {
    await rm(tempDirectory, { recursive: true, force: true });
  }
}

function containsUppercase(value) {
  return /[A-Z]/.test(value);
}

async function loadUppercaseManifestExceptions(manifestPath) {
  const allowedUppercasePaths = new Set();
  const manifestSource = await readFile(manifestPath, 'utf8');
  const parsed = JSON.parse(manifestSource);
  const entries = Array.isArray(parsed) ? parsed : [];

  for (const entry of entries) {
    if (entry?.disposition !== 'keep') {
      continue;
    }

    for (const key of ['legacy_url', 'target_url']) {
      const route = typeof entry?.[key] === 'string' ? entry[key].trim() : '';
      if (!route.startsWith('/') || !containsUppercase(route)) {
        continue;
      }

      allowedUppercasePaths.add(toPosixPath(route));
    }
  }

  return allowedUppercasePaths;
}

function hasForbiddenDirectorySegment(relativePath) {
  const segments = relativePath.split('/').filter(Boolean);
  return segments.some((segment) => forbiddenDirectorySegments.has(segment));
}

function isLowercasePath(relativePath) {
  return relativePath === relativePath.toLowerCase();
}

async function collectArtifactData(publicDir, allowedUppercasePaths) {
  const entries = await fg(['**/*', '**/.*'], {
    cwd: publicDir,
    dot: true,
    followSymbolicLinks: false,
    onlyFiles: false,
    markDirectories: false,
    unique: true,
  });

  const symlinkPaths = [];
  const hardLinkPaths = [];
  const specialEntryPaths = [];
  const uppercasePaths = [];
  const uppercaseExceptionPaths = [];
  const sourceMapPaths = [];
  const unexpectedSourcePaths = [];

  let fileCount = 0;
  let directoryCount = 0;
  let totalUncompressedBytes = 0;

  for (const relative of entries.sort()) {
    const normalizedRelative = toPosixPath(relative);
    const absolutePath = path.join(publicDir, relative);
    const entryStats = await lstat(absolutePath);
    const routePath = `/${normalizedRelative}`;

    if (!isLowercasePath(normalizedRelative)) {
      if (allowedUppercasePaths.has(routePath)) {
        uppercaseExceptionPaths.push(normalizedRelative);
      } else {
        uppercasePaths.push(normalizedRelative);
      }
    }

    if (hasForbiddenDirectorySegment(normalizedRelative)
      || forbiddenFilePattern.test(normalizedRelative)
      || forbiddenRepoFilePattern.test(normalizedRelative)) {
      unexpectedSourcePaths.push(normalizedRelative);
    }

    if (entryStats.isSymbolicLink()) {
      symlinkPaths.push(normalizedRelative);
      continue;
    }

    if (entryStats.isDirectory()) {
      directoryCount += 1;
      continue;
    }

    if (entryStats.isFile()) {
      fileCount += 1;
      totalUncompressedBytes += entryStats.size;

      if (entryStats.nlink > 1) {
        hardLinkPaths.push({ path: normalizedRelative, linkCount: entryStats.nlink });
      }

      if (normalizedRelative.toLowerCase().endsWith('.map')) {
        sourceMapPaths.push(normalizedRelative);
      }

      continue;
    }

    specialEntryPaths.push(normalizedRelative);
  }

  const hasTopLevelIndex = await fileExists(path.join(publicDir, 'index.html'));

  return {
    fileCount,
    directoryCount,
    totalUncompressedBytes,
    hasTopLevelIndex,
    symlinkPaths,
    hardLinkPaths,
    specialEntryPaths,
    uppercasePaths,
    uppercaseExceptionPaths,
    sourceMapPaths,
    unexpectedSourcePaths,
  };
}

function buildSummary(data, compressedArtifactBytes, compressedWarnBytes, projectedFailBytes) {
  const structuralViolations = [
    ...(!data.hasTopLevelIndex ? ['missing-top-level-index'] : []),
    ...(data.symlinkPaths.length > 0 ? ['symbolic-links-detected'] : []),
    ...(data.hardLinkPaths.length > 0 ? ['hard-links-detected'] : []),
    ...(data.specialEntryPaths.length > 0 ? ['special-files-detected'] : []),
    ...(data.uppercasePaths.length > 0 ? ['uppercase-paths-detected'] : []),
    ...(data.sourceMapPaths.length > 0 ? ['source-maps-detected'] : []),
    ...(data.unexpectedSourcePaths.length > 0 ? ['unexpected-source-artifacts-detected'] : []),
  ];

  const sizeWarnings = [];
  if (compressedArtifactBytes >= compressedWarnBytes) {
    sizeWarnings.push('compressed-artifact-near-guardrail');
  }

  const sizeViolations = [];
  if (data.totalUncompressedBytes > projectedFailBytes) {
    sizeViolations.push('projected-published-size-exceeds-limit');
  }

  const errorCount = structuralViolations.length + sizeViolations.length;
  const warningCount = sizeWarnings.length;
  const status = errorCount > 0 ? 'fail' : warningCount > 0 ? 'warn' : 'pass';

  return {
    status,
    errorCount,
    warningCount,
    structuralViolations,
    sizeWarnings,
    sizeViolations,
  };
}

async function writeReport(reportPath, report) {
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

function printConsoleSummary(report) {
  const { label, publicDir, thresholds, totals, summary } = report;
  console.log(`[validate:artifact] ${label}`);
  console.log(`[validate:artifact] publicDir=${publicDir}`);
  console.log(`[validate:artifact] fileCount=${totals.fileCount}, directoryCount=${totals.directoryCount}`);
  console.log(`[validate:artifact] projectedPublishedSize=${formatMegabytes(totals.projectedPublishedSizeBytes)} (limit ${formatMegabytes(thresholds.projectedFailBytes)})`);
  console.log(`[validate:artifact] compressedArtifactSize=${formatMegabytes(totals.compressedArtifactSizeBytes)} (warn at ${formatMegabytes(thresholds.compressedWarnBytes)})`);

  if (summary.warningCount > 0) {
    console.log(`[validate:artifact] warnings=${summary.sizeWarnings.join(', ')}`);
  }

  if (summary.errorCount > 0) {
    console.log(`[validate:artifact] errors=${[...summary.structuralViolations, ...summary.sizeViolations].join(', ')}`);
  }

  console.log(`[validate:artifact] status=${summary.status}`);
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const compressedWarnBytes = Math.round(options.compressedWarnMb * 1024 * 1024);
  const projectedFailBytes = Math.round(options.projectedFailMb * 1024 * 1024);

  const allowedUppercasePaths = await loadUppercaseManifestExceptions(options.manifestPath);
  const data = await collectArtifactData(options.publicDir, allowedUppercasePaths);
  const compressedArtifactBytes = await measureCompressedArtifactBytes(options.publicDir);
  const summary = buildSummary(data, compressedArtifactBytes, compressedWarnBytes, projectedFailBytes);

  const report = {
    label: options.label,
    timestamp: new Date().toISOString(),
    publicDir: options.publicDir,
    reportPath: options.reportPath,
    manifestPath: options.manifestPath,
    thresholds: {
      compressedWarnBytes,
      compressedWarnMb: options.compressedWarnMb,
      projectedFailBytes,
      projectedFailMb: options.projectedFailMb,
    },
    totals: {
      fileCount: data.fileCount,
      directoryCount: data.directoryCount,
      projectedPublishedSizeBytes: data.totalUncompressedBytes,
      projectedPublishedSizeMb: toMegabytes(data.totalUncompressedBytes),
      compressedArtifactSizeBytes: compressedArtifactBytes,
      compressedArtifactSizeMb: toMegabytes(compressedArtifactBytes),
    },
    checks: {
      hasTopLevelIndex: data.hasTopLevelIndex,
      symlinkPaths: data.symlinkPaths,
      hardLinkPaths: data.hardLinkPaths,
      specialEntryPaths: data.specialEntryPaths,
      uppercasePaths: data.uppercasePaths,
      uppercaseExceptionPaths: data.uppercaseExceptionPaths,
      sourceMapPaths: data.sourceMapPaths,
      unexpectedSourcePaths: data.unexpectedSourcePaths,
    },
    summary,
  };

  await writeReport(options.reportPath, report);
  printConsoleSummary(report);

  if (summary.errorCount > 0) {
    process.exitCode = 1;
  }
}

run().catch(async (error) => {
  const fallbackReportPath = defaults.reportPath;
  const failureReport = {
    label: defaults.label,
    timestamp: new Date().toISOString(),
    summary: {
      status: 'fail',
      errorCount: 1,
      warningCount: 0,
      structuralViolations: ['validator-runtime-error'],
      sizeWarnings: [],
      sizeViolations: [],
    },
    error: error instanceof Error ? error.message : String(error),
  };

  try {
    await mkdir(path.dirname(fallbackReportPath), { recursive: true });
    await writeFile(fallbackReportPath, `${JSON.stringify(failureReport, null, 2)}\n`, 'utf8');
  } catch {
    // Intentionally swallow fallback write failures to keep original error visible.
  }

  console.error(`[validate:artifact] ${failureReport.error}`);
  process.exitCode = 1;
});