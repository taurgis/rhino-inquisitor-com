import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import { promisify } from 'node:util';

import { load as loadHtml } from 'cheerio';
import fg from 'fast-glob';
import { fileURLToPath } from 'node:url';

import {
  getArtifactProvenance,
  normalizeRoute,
  normalizeRouteLike,
  phase8SeoDefaults,
  toAbsoluteUrl,
  writeJsonReport
} from './seo-gate-helpers.js';
import { canonicalOrigin, toRepoRelative } from '../url/url-validation-helpers.js';

const gzip = promisify(zlib.gzip);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');
const entryFilePath = process.argv[1] ? path.resolve(process.argv[1]) : null;
const budgetThresholdBytes = 170 * 1024;
const profileIds = ['mobile', 'desktop'];
const scoreThresholds = {
  performance: 90,
  accessibility: 90,
  seo: 95,
  bestPractices: 90
};
const blockingBudgetTemplates = new Set(['homepage', 'article']);
const canonicalHost = new URL(canonicalOrigin).origin;
const defaults = {
  publicRoot: phase8SeoDefaults.publicRoot,
  sampleMatrixPath: phase8SeoDefaults.sampleMatrixPath,
  baselinePath: path.join(repoRoot, 'url-data', 'performance-baseline.md'),
  lhciRoot: path.join(repoRoot, 'validation', 'lhci-report'),
  reportPath: path.join(repoRoot, 'validation', 'performance-budget-report.json')
};

function manifestPathForProfile(lhciRoot, profileId) {
  return path.join(lhciRoot, profileId, 'manifest.json');
}

function parseArgs(argv) {
  const options = {
    ...defaults,
    help: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case '--public-dir':
        options.publicRoot = path.resolve(argv[++index]);
        break;
      case '--sample-matrix':
        options.sampleMatrixPath = path.resolve(argv[++index]);
        break;
      case '--baseline':
        options.baselinePath = path.resolve(argv[++index]);
        break;
      case '--lhci-root':
        options.lhciRoot = path.resolve(argv[++index]);
        break;
      case '--report':
        options.reportPath = path.resolve(argv[++index]);
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

function printHelp() {
  console.log(`Usage: node scripts/gates/check-performance-budget.js [options]

Options:
  --public-dir <path>    Override the built public directory.
  --sample-matrix <path> Override validation/sample-matrix.json.
  --baseline <path>      Override url-data/performance-baseline.md.
  --lhci-root <path>     Override the Lighthouse report root.
  --report <path>        Override validation/performance-budget-report.json.
  --help                 Show this help message.
`);
}

function toPosixRelative(filePath, publicRoot) {
  return path.relative(publicRoot, filePath).split(path.sep).join('/');
}

function routeToHtmlPath(publicRoot, route) {
  if (route === '/') {
    return path.join(publicRoot, 'index.html');
  }

  return path.join(publicRoot, route.replace(/^\//u, ''), 'index.html');
}

function parseNumber(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.toLowerCase() === 'n/a') {
    return null;
  }

  const numeric = Number(trimmed.replace(/,/gu, ''));
  return Number.isFinite(numeric) ? numeric : null;
}

function splitMarkdownRow(line) {
  return line
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim());
}

function parseBaselineTable(source) {
  const baseline = new Map();

  for (const line of source.split(/\r?\n/u)) {
    if (!line.startsWith('|')) {
      continue;
    }

    const cells = splitMarkdownRow(line);
    if (cells.length < 16 || cells[0] === 'Template' || cells[0].startsWith('---')) {
      continue;
    }

    const template = cells[0];
    const device = cells[1];

    if (!['homepage', 'recent_article', 'category'].includes(template)) {
      continue;
    }

    baseline.set(`${template}:${device}`, {
      template,
      device,
      measuredUrl: cells[2],
      finalUrl: cells[3],
      lcpMs: parseNumber(cells[4]),
      inpMs: parseNumber(cells[5]),
      cls: parseNumber(cells[7]),
      totalKb: parseNumber(cells[9]),
      perfScore: parseNumber(cells[12]),
      accessibilityScore: parseNumber(cells[13]),
      bestPracticesScore: parseNumber(cells[14]),
      seoScore: parseNumber(cells[15])
    });
  }

  return baseline;
}

function scoreToPercent(value) {
  return typeof value === 'number' ? Number((value * 100).toFixed(0)) : null;
}

function normalizeAssetSource(pageRoute, source) {
  if (typeof source !== 'string' || source.trim().length === 0 || source.startsWith('data:') || source.startsWith('//')) {
    return null;
  }

  if (source.startsWith('http://') || source.startsWith('https://')) {
    const parsed = new URL(source);
    if (parsed.origin !== canonicalHost) {
      return null;
    }

    return parsed.pathname;
  }

  if (source.startsWith('/')) {
    return source;
  }

  const basePath = pageRoute === '/' ? '/' : pageRoute;
  return path.posix.normalize(path.posix.join(basePath, source));
}

function collectAssetCandidates($, route) {
  const candidates = [];

  $('link[href]').each((_, element) => {
    const relTokens = String($(element).attr('rel') ?? '')
      .toLowerCase()
      .split(/\s+/u)
      .filter(Boolean);
    const href = $(element).attr('href');

    if (!href) {
      return;
    }

    if (relTokens.includes('stylesheet')) {
      candidates.push({ type: 'stylesheet', source: href });
      return;
    }

    if (relTokens.includes('preload') || relTokens.includes('modulepreload')) {
      candidates.push({ type: 'preload', source: href, as: $(element).attr('as') ?? null });
    }
  });

  $('script[src]').each((_, element) => {
    candidates.push({ type: 'script', source: $(element).attr('src') });
  });

  $('img[src]').each((_, element) => {
    const loading = String($(element).attr('loading') ?? '').toLowerCase();
    const fetchPriority = String($(element).attr('fetchpriority') ?? '').toLowerCase();
    if (loading === 'lazy' && fetchPriority !== 'high') {
      return;
    }

    candidates.push({ type: 'image', source: $(element).attr('src') });
  });

  return candidates
    .map((candidate) => {
      const assetPath = normalizeAssetSource(route, candidate.source);
      return assetPath ? { ...candidate, assetPath } : null;
    })
    .filter(Boolean);
}

async function buildAssetInventory(publicRoot) {
  const files = await fg(['**/*.{html,css,js,mjs,cjs,webp,png,jpg,jpeg,gif,avif,svg,woff,woff2}'], {
    cwd: publicRoot,
    absolute: true,
    dot: false
  });

  return new Map(files.map((filePath) => [toPosixRelative(filePath, publicRoot), filePath]));
}

async function gzipSize(filePath) {
  const source = await fs.readFile(filePath);
  const compressed = await gzip(source);

  return {
    rawBytes: source.length,
    gzipBytes: compressed.length
  };
}

function findRepresentativeRuns(manifest) {
  return manifest.filter((entry) => entry?.isRepresentativeRun);
}

function resolveReportPath(manifestPath, candidatePath) {
  if (typeof candidatePath !== 'string' || candidatePath.trim().length === 0) {
    return null;
  }

  if (path.isAbsolute(candidatePath)) {
    return candidatePath;
  }

  return path.resolve(path.dirname(manifestPath), candidatePath);
}

async function loadProfileResults(routeSet, lhciRoot) {
  const profileResults = new Map();
  const missingArtifacts = [];

  for (const profileId of profileIds) {
    const manifestPath = manifestPathForProfile(lhciRoot, profileId);
    const manifestSource = await fs.readFile(manifestPath, 'utf8').catch(() => null);
    if (!manifestSource) {
      missingArtifacts.push(`Missing LHCI manifest for ${profileId} profile at ${toRepoRelative(manifestPath)}`);
      continue;
    }

    const manifest = JSON.parse(manifestSource);
    const representativeRuns = findRepresentativeRuns(manifest);
    const entries = new Map();

    for (const run of representativeRuns) {
      const route = normalizeRouteLike(run.url);
      if (!route || !routeSet.has(route)) {
        continue;
      }

      const jsonReportPath = resolveReportPath(manifestPath, run.jsonPath ?? run.lhrPath ?? run.reportJsonPath);
      const htmlReportPath = resolveReportPath(manifestPath, run.htmlPath ?? run.reportHtmlPath);
      let audits = {};

      if (jsonReportPath) {
        const reportSource = await fs.readFile(jsonReportPath, 'utf8').catch(() => null);
        if (reportSource) {
          audits = JSON.parse(reportSource).audits ?? {};
        }
      }

      entries.set(route, {
        profile: profileId,
        url: run.url,
        htmlReportPath: htmlReportPath ? toRepoRelative(htmlReportPath) : null,
        jsonReportPath: jsonReportPath ? toRepoRelative(jsonReportPath) : null,
        scores: {
          performance: scoreToPercent(run.summary?.performance),
          accessibility: scoreToPercent(run.summary?.accessibility),
          seo: scoreToPercent(run.summary?.seo),
          bestPractices: scoreToPercent(run.summary?.['best-practices'])
        },
        metrics: {
          lcpMs: audits['largest-contentful-paint']?.numericValue ?? null,
          inpMs: audits['interaction-to-next-paint']?.numericValue
            ?? audits['experimental-interaction-to-next-paint']?.numericValue
            ?? null,
          cls: audits['cumulative-layout-shift']?.numericValue ?? null,
          ttiMs: audits.interactive?.numericValue ?? null
        }
      });
    }

    for (const route of routeSet) {
      if (!entries.has(route)) {
        missingArtifacts.push(`Missing representative LHCI run for ${route} on ${profileId} profile`);
      }
    }

    profileResults.set(profileId, entries);
  }

  return { profileResults, missingArtifacts };
}

function evaluateScores(profileEntry) {
  const failures = [];

  for (const [metric, threshold] of Object.entries(scoreThresholds)) {
    const actual = profileEntry.scores[metric];
    if (typeof actual !== 'number') {
      failures.push(`Missing ${metric} score for ${profileEntry.profile}`);
      continue;
    }

    if (actual < threshold) {
      failures.push(`${profileEntry.profile} ${metric} score ${actual} is below ${threshold}`);
    }
  }

  return failures;
}

function createDelta(baseline, current) {
  if (typeof baseline !== 'number' || typeof current !== 'number') {
    return null;
  }

  return Number((current - baseline).toFixed(2));
}

function buildBaselineComparison(templateKey, absoluteUrl, profileResults, baselineTable) {
  const comparison = {};

  for (const profileName of ['mobile', 'desktop']) {
    const baselineKey = `${templateKey}:${profileName}`;
    const baselineEntry = baselineTable.get(baselineKey);
    const profileEntry = profileResults[profileName];

    if (!baselineEntry || !profileEntry) {
      comparison[profileName] = null;
      continue;
    }

    comparison[profileName] = {
      baselineRepresentativeUrl: baselineEntry.finalUrl,
      currentUrl: absoluteUrl,
      note: baselineEntry.finalUrl === absoluteUrl
        ? 'Route-aligned comparison.'
        : 'Template-family comparison against the representative WordPress baseline URL.',
      scores: {
        performance: {
          baseline: baselineEntry.perfScore,
          current: profileEntry.scores.performance,
          delta: createDelta(baselineEntry.perfScore, profileEntry.scores.performance)
        },
        accessibility: {
          baseline: baselineEntry.accessibilityScore,
          current: profileEntry.scores.accessibility,
          delta: createDelta(baselineEntry.accessibilityScore, profileEntry.scores.accessibility)
        },
        bestPractices: {
          baseline: baselineEntry.bestPracticesScore,
          current: profileEntry.scores.bestPractices,
          delta: createDelta(baselineEntry.bestPracticesScore, profileEntry.scores.bestPractices)
        },
        seo: {
          baseline: baselineEntry.seoScore,
          current: profileEntry.scores.seo,
          delta: createDelta(baselineEntry.seoScore, profileEntry.scores.seo)
        }
      },
      metrics: {
        lcpMs: {
          baseline: baselineEntry.lcpMs,
          current: profileEntry.metrics.lcpMs,
          delta: createDelta(baselineEntry.lcpMs, profileEntry.metrics.lcpMs)
        },
        inpMs: {
          baseline: baselineEntry.inpMs,
          current: profileEntry.metrics.inpMs,
          delta: createDelta(baselineEntry.inpMs, profileEntry.metrics.inpMs)
        },
        cls: {
          baseline: baselineEntry.cls,
          current: profileEntry.metrics.cls,
          delta: createDelta(baselineEntry.cls, profileEntry.metrics.cls)
        }
      }
    };
  }

  return comparison;
}

async function analyzeTemplate(routeRecord, publicRoot, assetInventory, baselineTable, profileResults) {
  const htmlPath = routeToHtmlPath(publicRoot, routeRecord.route);
  const htmlSource = await fs.readFile(htmlPath, 'utf8');
  const $ = loadHtml(htmlSource);
  const criticalAssets = [];
  const seenAssets = new Set();
  const warnings = [];
  const failures = [];
  const htmlSizes = await gzipSize(htmlPath);

  criticalAssets.push({
    type: 'document',
    assetPath: toPosixRelative(htmlPath, publicRoot),
    rawBytes: htmlSizes.rawBytes,
    gzipBytes: htmlSizes.gzipBytes
  });
  seenAssets.add(toPosixRelative(htmlPath, publicRoot));

  for (const candidate of collectAssetCandidates($, routeRecord.route)) {
    const publicRelativePath = decodeURIComponent(candidate.assetPath.replace(/^\//u, ''));
    const absolutePath = assetInventory.get(publicRelativePath);

    if (!absolutePath) {
      warnings.push(`Referenced ${candidate.type} asset missing from public/: ${candidate.assetPath}`);
      continue;
    }

    if (seenAssets.has(publicRelativePath)) {
      continue;
    }

    const sizes = await gzipSize(absolutePath);
    criticalAssets.push({
      type: candidate.type,
      assetPath: publicRelativePath,
      rawBytes: sizes.rawBytes,
      gzipBytes: sizes.gzipBytes,
      as: candidate.as ?? null
    });
    seenAssets.add(publicRelativePath);
  }

  criticalAssets.sort((left, right) => right.gzipBytes - left.gzipBytes);

  const totalGzipBytes = criticalAssets.reduce((sum, asset) => sum + asset.gzipBytes, 0);
  const budgetBlocking = blockingBudgetTemplates.has(routeRecord.template);
  if (budgetBlocking && totalGzipBytes > budgetThresholdBytes) {
    failures.push(`Critical-path transfer ${totalGzipBytes} exceeds ${budgetThresholdBytes} bytes`);
  }

  if (!budgetBlocking && totalGzipBytes > budgetThresholdBytes) {
    warnings.push(`Critical-path transfer ${totalGzipBytes} exceeds the informational 170 KB budget for ${routeRecord.template}`);
  }

  for (const profileName of ['mobile', 'desktop']) {
    const profileEntry = profileResults[profileName];
    if (!profileEntry) {
      failures.push(`Missing ${profileName} Lighthouse result for ${routeRecord.route}`);
      continue;
    }

    failures.push(...evaluateScores(profileEntry));
  }

  return {
    template: routeRecord.template,
    route: routeRecord.route,
    expectedUrl: routeRecord.absoluteUrl,
    builtArtifactPath: toRepoRelative(htmlPath),
    selectionReason: routeRecord.selectionReason,
    budget: {
      blocking: budgetBlocking,
      thresholdBytes: budgetThresholdBytes,
      totalGzipBytes,
      totalGzipKb: Number((totalGzipBytes / 1024).toFixed(2)),
      criticalAssets
    },
    profiles: profileResults,
    baselineComparison: buildBaselineComparison(routeRecord.baselineTemplate, routeRecord.absoluteUrl, profileResults, baselineTable),
    warnings,
    blockingFindings: failures,
    result: failures.length === 0 ? 'pass' : 'fail'
  };
}

function collectTargetRoutes(sampleMatrix) {
  const homepage = sampleMatrix.page_samples?.homepage?.[0];
  const article = sampleMatrix.page_samples?.recent_posts?.[0];
  const category = sampleMatrix.page_samples?.category_pages?.[0];

  const records = [
    {
      template: 'homepage',
      baselineTemplate: 'homepage',
      entry: homepage
    },
    {
      template: 'article',
      baselineTemplate: 'recent_article',
      entry: article
    },
    {
      template: 'category',
      baselineTemplate: 'category',
      entry: category
    }
  ];

  return records.map(({ template, baselineTemplate, entry }) => {
    if (!entry) {
      throw new Error(`sample-matrix is missing the required ${template} selection`);
    }

    const route = normalizeRouteLike(entry.url);
    if (!route) {
      throw new Error(`sample-matrix entry for ${template} does not contain a usable route`);
    }

    return {
      template,
      baselineTemplate,
      route,
      absoluteUrl: entry.absolute_url ?? toAbsoluteUrl(route),
      selectionReason: entry.selection_reason ?? null
    };
  });
}

function summarize(entries, missingArtifacts) {
  return entries.reduce(
    (summary, entry) => {
      summary.totalTemplates += 1;
      summary[entry.result === 'pass' ? 'passCount' : 'failCount'] += 1;
      summary.blockingFailures += entry.blockingFindings.length;
      summary.warningCount += entry.warnings.length;
      if (entry.budget.blocking && entry.budget.totalGzipBytes > budgetThresholdBytes) {
        summary.budgetFailures += 1;
      }

      for (const profileName of ['mobile', 'desktop']) {
        const profileEntry = entry.profiles[profileName];
        if (!profileEntry) {
          continue;
        }

        summary.scoreFailures += evaluateScores(profileEntry).length;
      }

      return summary;
    },
    {
      totalTemplates: 0,
      passCount: 0,
      failCount: 0,
      blockingFailures: missingArtifacts.length,
      warningCount: 0,
      budgetFailures: 0,
      scoreFailures: 0,
      missingArtifacts: missingArtifacts.length
    }
  );
}

export async function runPerformanceBudgetReport(overrides = {}) {
  const options = {
    ...defaults,
    ...overrides
  };
  const [sampleMatrixSource, baselineSource, assetInventory] = await Promise.all([
    fs.readFile(options.sampleMatrixPath, 'utf8'),
    fs.readFile(options.baselinePath, 'utf8'),
    buildAssetInventory(options.publicRoot)
  ]);
  const sampleMatrix = JSON.parse(sampleMatrixSource);
  const baselineTable = parseBaselineTable(baselineSource);
  const targetRoutes = collectTargetRoutes(sampleMatrix);
  const routeSet = new Set(targetRoutes.map((record) => record.route));
  const { profileResults, missingArtifacts } = await loadProfileResults(routeSet, options.lhciRoot);
  const entries = [];

  for (const routeRecord of targetRoutes) {
    const entryProfiles = {
      mobile: profileResults.get('mobile')?.get(routeRecord.route) ?? null,
      desktop: profileResults.get('desktop')?.get(routeRecord.route) ?? null
    };
    entries.push(await analyzeTemplate(routeRecord, options.publicRoot, assetInventory, baselineTable, entryProfiles));
  }

  const summary = summarize(entries, missingArtifacts);
  const report = {
    phase: 8,
    ticket: 'RHI-088',
    artifact: 'performance-budget-report',
    status: summary.blockingFailures === 0 ? 'pass' : 'fail',
    rcTag: sampleMatrix.rc?.tag ?? null,
    rcSha: sampleMatrix.rc?.commit ?? null,
    generatedAt: new Date().toISOString(),
    publicDir: toRepoRelative(options.publicRoot),
    sampleMatrix: {
      path: toRepoRelative(options.sampleMatrixPath),
      generatedAt: sampleMatrix.generated_at
    },
    baseline: {
      path: toRepoRelative(options.baselinePath)
    },
    lhciRoot: toRepoRelative(options.lhciRoot),
    artifactProvenance: getArtifactProvenance(sampleMatrix.rc),
    policy: {
      lighthouse: {
        profiles: ['mobile', 'desktop'],
        numberOfRuns: 3,
        aggregationMethod: 'median',
        thresholds: scoreThresholds,
        collectionMode: 'staticDistDir'
      },
      cwvTargets: {
        lcpMs: 2500,
        inpMs: 200,
        cls: 0.1,
        ttiMs: 'informational',
        fieldDataPolicy: 'Use p75 field data when available as readiness evidence only; do not override blocking lab gates at launch when field data is sparse.'
      },
      performanceBudget: {
        criticalPathTransferGzipBytes: budgetThresholdBytes,
        criticalPathTransferGzipKb: 170,
        blockingTemplates: ['homepage', 'article'],
        informationalTemplates: ['category'],
        assetSelection: 'HTML document, linked stylesheets, preload/modulepreload assets, linked scripts, and non-lazy or high-priority images resolved from the built public artifact.'
      }
    },
    missingArtifacts,
    summary,
    entries
  };

  await writeJsonReport(options.reportPath, report);

  console.log(`performance budget report written to ${toRepoRelative(options.reportPath)}`);
  console.log(`Templates checked: ${summary.totalTemplates}`);
  console.log(`Blocking failures: ${summary.blockingFailures}`);
  console.log(`Warnings: ${summary.warningCount}`);

  return summary.blockingFailures === 0 ? 0 : 1;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  process.exitCode = await runPerformanceBudgetReport(options);
}

if (entryFilePath === fileURLToPath(import.meta.url)) {
  await main();
}