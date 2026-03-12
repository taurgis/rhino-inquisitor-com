import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import fg from 'fast-glob';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const defaultContentDir = path.join(repoRoot, 'migration/output/content');
const defaultSummaryReport = path.join(repoRoot, 'migration/reports/content-corrections-summary.json');
const defaultAltAuditReport = path.join(repoRoot, 'migration/reports/image-alt-corrections-audit.csv');
const defaultLinkAuditReport = path.join(repoRoot, 'migration/reports/link-text-corrections-audit.csv');
const defaultMaxPasses = 6;

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'rhi-correction-pipeline-'));
  const initialSnapshot = await snapshotMarkdownTree(options.contentDir);
  let previousSnapshot = initialSnapshot;
  let currentSnapshot = initialSnapshot;
  let firstPassSummary = null;
  let lastPassSummary = null;
  let converged = false;
  const passSummaries = [];

  try {
    for (let pass = 1; pass <= options.maxPasses; pass += 1) {
      const passSummaryReport = path.join(tempRoot, `summary-pass-${pass}.json`);
      const passAltAuditReport = pass === 1 ? options.altAuditReport : path.join(tempRoot, `alt-pass-${pass}.csv`);
      const passLinkAuditReport = pass === 1 ? options.linkAuditReport : path.join(tempRoot, `link-pass-${pass}.csv`);
      const passArgs = withOverriddenReportArgs(options.forwardedArgs, {
        summaryReport: passSummaryReport,
        altAuditReport: passAltAuditReport,
        linkAuditReport: passLinkAuditReport
      });

      runNodeScript('scripts/migration/apply-content-corrections.js', passArgs);
      runMarkdownlintFix(options.contentDir);

      currentSnapshot = await snapshotMarkdownTree(options.contentDir);
      const rawSummary = JSON.parse(await fs.readFile(passSummaryReport, 'utf8'));
      if (!firstPassSummary) {
        firstPassSummary = rawSummary;
      }
      lastPassSummary = rawSummary;

      passSummaries.push({
        pass,
        rawFilesChanged: rawSummary.filesChanged,
        netFilesChanged: countChangedFiles(previousSnapshot, currentSnapshot)
      });

      if (snapshotsEqual(previousSnapshot, currentSnapshot)) {
        converged = true;
        break;
      }

      previousSnapshot = currentSnapshot;
    }

    if (!converged || !firstPassSummary || !lastPassSummary) {
      throw new Error(`Correction pipeline failed to converge within ${options.maxPasses} pass(es).`);
    }

    const finalSummary = {
      ...firstPassSummary,
      filesChanged: countChangedFiles(initialSnapshot, currentSnapshot),
      converged: true,
      convergencePasses: passSummaries.length,
      rawFilesChangedFirstPass: firstPassSummary.filesChanged,
      rawFilesChangedLastPass: lastPassSummary.filesChanged,
      passSummaries
    };

    await fs.mkdir(path.dirname(options.summaryReport), { recursive: true });
    await fs.writeFile(options.summaryReport, `${JSON.stringify(finalSummary, null, 2)}\n`, 'utf8');

    console.log(
      [
        `Correction pipeline converged in ${passSummaries.length} pass(es).`,
        `Net files changed: ${finalSummary.filesChanged}.`,
        `Raw first-pass changes: ${finalSummary.rawFilesChangedFirstPass}.`,
        `Raw last-pass changes: ${finalSummary.rawFilesChangedLastPass}.`,
        `Summary: ${toRepoRelative(options.summaryReport)}.`
      ].join(' ')
    );
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
}

function parseArgs(argv) {
  const forwardedArgs = [];
  let contentDir = defaultContentDir;
  let summaryReport = defaultSummaryReport;
  let altAuditReport = defaultAltAuditReport;
  let linkAuditReport = defaultLinkAuditReport;
  let maxPasses = defaultMaxPasses;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case '--content-dir':
        contentDir = path.resolve(argv[index + 1]);
        forwardedArgs.push(arg, contentDir);
        index += 1;
        break;
      case '--summary-report':
        summaryReport = path.resolve(argv[index + 1]);
        index += 1;
        break;
      case '--alt-audit-report':
        altAuditReport = path.resolve(argv[index + 1]);
        index += 1;
        break;
      case '--link-audit-report':
        linkAuditReport = path.resolve(argv[index + 1]);
        index += 1;
        break;
      case '--max-passes':
        maxPasses = Number.parseInt(argv[index + 1], 10) || defaultMaxPasses;
        index += 1;
        break;
      default:
        forwardedArgs.push(arg);
        if (arg.startsWith('--') && index + 1 < argv.length && !argv[index + 1].startsWith('--')) {
          forwardedArgs.push(argv[index + 1]);
          index += 1;
        }
        break;
    }
  }

  return {
    contentDir,
    summaryReport,
    altAuditReport,
    linkAuditReport,
    maxPasses,
    forwardedArgs
  };
}

function withOverriddenReportArgs(args, { summaryReport, altAuditReport, linkAuditReport }) {
  const filteredArgs = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (['--summary-report', '--alt-audit-report', '--link-audit-report'].includes(arg)) {
      index += 1;
      continue;
    }
    filteredArgs.push(arg);
  }

  return [
    ...filteredArgs,
    '--summary-report',
    summaryReport,
    '--alt-audit-report',
    altAuditReport,
    '--link-audit-report',
    linkAuditReport
  ];
}

function runNodeScript(scriptPath, args) {
  execFileSync('node', [scriptPath, ...args], {
    cwd: repoRoot,
    stdio: 'inherit'
  });
}

function runMarkdownlintFix(contentDir) {
  const lintGlob = `${contentDir.replace(/\\/gu, '/')}/**/*.md`;
  execFileSync('npx', ['markdownlint-cli2', '--fix', lintGlob], {
    cwd: repoRoot,
    stdio: 'inherit'
  });
}

async function snapshotMarkdownTree(contentDir) {
  const markdownFiles = (await fg('**/*.md', {
    cwd: contentDir,
    onlyFiles: true
  })).sort((left, right) => left.localeCompare(right));
  const snapshot = new Map();

  for (const relativePath of markdownFiles) {
    const content = await fs.readFile(path.join(contentDir, relativePath), 'utf8');
    snapshot.set(relativePath, hashContent(content));
  }

  return snapshot;
}

function hashContent(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function snapshotsEqual(left, right) {
  return countChangedFiles(left, right) === 0;
}

function countChangedFiles(left, right) {
  const allPaths = new Set([...left.keys(), ...right.keys()]);
  let changedFiles = 0;

  for (const relativePath of allPaths) {
    if ((left.get(relativePath) ?? null) !== (right.get(relativePath) ?? null)) {
      changedFiles += 1;
    }
  }

  return changedFiles;
}

function toRepoRelative(absolutePath) {
  const relativePath = path.relative(repoRoot, absolutePath);
  return relativePath && !relativePath.startsWith('..') ? relativePath.replace(/\\/gu, '/') : absolutePath;
}

await main();