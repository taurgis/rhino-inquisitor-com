import fs from 'node:fs/promises';
import path from 'node:path';

import { HtmlValidate } from 'html-validate';

import {
  collectHtmlInventory,
  getArtifactProvenance,
  normalizeRouteLike,
  phase8SeoDefaults,
  toAbsoluteUrl,
  writeJsonReport
} from './seo-gate-helpers.js';
import { toRepoRelative } from '../url/url-validation-helpers.js';

const defaults = {
  publicRoot: phase8SeoDefaults.publicRoot,
  sampleMatrixPath: phase8SeoDefaults.sampleMatrixPath,
  reportPath: path.join(path.dirname(phase8SeoDefaults.sampleMatrixPath), 'html-conformance-report.json'),
  warningOwner: 'Engineering Owner'
};

const validatorConfig = {
  extends: ['html-validate:recommended'],
  rules: {
    'aria-label-misuse': 'off',
    'attr-quotes': 'off',
    'doctype-style': 'off',
    'form-dup-name': 'off',
    'long-title': 'off',
    'no-raw-characters': 'off',
    'no-inline-style': 'off',
    'no-redundant-role': 'off',
    'prefer-native-element': 'off',
    'unique-landmark': 'off',
    'wcag/h37': 'off'
  }
};

function printHelp() {
  console.log(`Usage: node scripts/gates/check-html-conformance.js [options]

Options:
  --public-dir <path>      Override the built public directory.
  --sample-matrix <path>   Override validation/sample-matrix.json.
  --report <path>          Override validation/html-conformance-report.json.
  --warning-owner <name>   Record the owner responsible for html-validate warning triage.
  --help                   Show this help message.
`);
}

function parseArgs(argv) {
  const options = { ...defaults, help: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case '--public-dir':
        options.publicRoot = path.resolve(argv[++index]);
        break;
      case '--sample-matrix':
        options.sampleMatrixPath = path.resolve(argv[++index]);
        break;
      case '--report':
        options.reportPath = path.resolve(argv[++index]);
        break;
      case '--warning-owner':
        options.warningOwner = String(argv[++index] ?? '').trim() || defaults.warningOwner;
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

async function loadJson(filePath, label) {
  const source = await fs.readFile(filePath, 'utf8');

  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(`Failed to parse ${label} at ${toRepoRelative(filePath)}: ${error.message}`);
  }
}

function routeFamilyFromGroup(groupName) {
  switch (groupName) {
    case 'homepage':
      return 'home';
    case 'recent_posts':
      return 'post';
    case 'archive_pages':
      return 'archive';
    case 'category_pages':
      return 'category';
    case 'privacy_legal_pages':
      return 'legal';
    case 'video_pages':
      return 'video-page';
    case 'video_posts':
      return 'video-post';
    case 'landing_pages':
      return 'landing';
    default:
      return 'other';
  }
}

function collectSampleRoutes(sampleMatrix) {
  const routes = new Map();

  for (const [groupName, entries] of Object.entries(sampleMatrix.page_samples ?? {})) {
    for (const entry of Array.isArray(entries) ? entries : []) {
      const route = normalizeRouteLike(entry.url);
      if (!route) {
        continue;
      }

      const existing = routes.get(route) ?? {
        route,
        expectedUrl: toAbsoluteUrl(route),
        groups: [],
        sources: []
      };

      if (!existing.groups.includes(groupName)) {
        existing.groups.push(groupName);
      }

      existing.sources.push({
        group: groupName,
        family: routeFamilyFromGroup(groupName),
        title: entry.title ?? null,
        builtArtifactPath: entry.built_artifact_path ?? null,
        contentPath: entry.content_path ?? null,
        selectionReason: entry.selection_reason ?? null
      });
      routes.set(route, existing);
    }
  }

  return [...routes.values()].sort((left, right) => left.route.localeCompare(right.route));
}

function describeSources(routeRecord) {
  return routeRecord.sources.map((source) => ({
    group: source.group,
    family: source.family,
    title: source.title,
    contentPath: source.contentPath,
    selectionReason: source.selectionReason
  }));
}

function summarizeMessages(messages) {
  return messages.map((message) => ({
    ruleId: message.ruleId ?? null,
    severity: message.severity === 1 ? 'warning' : 'error',
    message: message.message,
    line: message.line ?? null,
    column: message.column ?? null,
    selector: message.selector ?? null,
    ruleUrl: message.ruleUrl ?? null
  }));
}

async function analyzeRoute(routeRecord, inventoryEntry, validator) {
  if (!inventoryEntry) {
    return {
      route: routeRecord.route,
      expectedUrl: routeRecord.expectedUrl,
      sources: describeSources(routeRecord),
      builtArtifactPath: routeRecord.sources.find((source) => source.builtArtifactPath)?.builtArtifactPath ?? null,
      result: 'fail',
      errorCount: 1,
      warningCount: 0,
      blockingFindings: ['Expected route is missing from the production HTML artifact.'],
      warnings: []
    };
  }

  const result = await validator.validateFile(inventoryEntry.filePath);
  const fileResult = result.results[0] ?? {
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    messages: []
  };
  const messages = summarizeMessages(fileResult.messages ?? []);

  return {
    route: routeRecord.route,
    expectedUrl: routeRecord.expectedUrl,
    sources: describeSources(routeRecord),
    builtArtifactPath: inventoryEntry.repoRelativePath,
    result: (fileResult.errorCount ?? 0) === 0 ? 'pass' : 'fail',
    errorCount: fileResult.errorCount ?? 0,
    warningCount: fileResult.warningCount ?? 0,
    blockingFindings: messages.filter((message) => message.severity === 'error'),
    warnings: messages.filter((message) => message.severity === 'warning')
  };
}

function summarizeEntries(entries) {
  return entries.reduce((summary, entry) => {
    summary.totalRoutes += 1;
    if (entry.result === 'pass') {
      summary.passCount += 1;
    } else {
      summary.failCount += 1;
    }

    summary.errorCount += entry.errorCount;
    summary.warningCount += entry.warningCount;

    if (entry.warningCount > 0) {
      summary.routesWithWarnings += 1;
    }

    return summary;
  }, {
    totalRoutes: 0,
    passCount: 0,
    failCount: 0,
    errorCount: 0,
    warningCount: 0,
    routesWithWarnings: 0
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const sampleMatrix = await loadJson(options.sampleMatrixPath, 'sample matrix');
  const routeRecords = collectSampleRoutes(sampleMatrix);
  const htmlInventory = await collectHtmlInventory(options.publicRoot);
  const validator = new HtmlValidate(validatorConfig);
  const entries = [];

  for (const routeRecord of routeRecords) {
    entries.push(await analyzeRoute(routeRecord, htmlInventory.get(routeRecord.route), validator));
  }

  const summary = summarizeEntries(entries);
  const report = {
    phase: 8,
    ticket: 'RHI-089',
    artifact: 'html-conformance-report',
    status: summary.errorCount === 0 ? 'pass' : 'fail',
    rcTag: sampleMatrix.rc?.tag ?? null,
    rcSha: sampleMatrix.rc?.commit ?? null,
    generatedAt: new Date().toISOString(),
    publicDir: toRepoRelative(options.publicRoot),
    sampleMatrix: {
      path: toRepoRelative(options.sampleMatrixPath),
      generatedAt: sampleMatrix.generated_at ?? null
    },
    artifactProvenance: getArtifactProvenance(sampleMatrix.rc),
    policy: {
      validatorPreset: 'html-validate:recommended',
      ruleOverrides: Object.entries(validatorConfig.rules).map(([ruleId, setting]) => ({ ruleId, setting })),
      errorSeverity: 'blocking',
      warningSeverity: 'review-required-non-blocking',
      warningOwner: options.warningOwner
    },
    summary,
    entries
  };

  await writeJsonReport(options.reportPath, report);

  console.log(`HTML conformance report written to ${toRepoRelative(options.reportPath)}`);
  console.log(`Routes checked: ${summary.totalRoutes}`);
  console.log(`Pass routes: ${summary.passCount}`);
  console.log(`Fail routes: ${summary.failCount}`);
  console.log(`Errors: ${summary.errorCount}`);
  console.log(`Warnings: ${summary.warningCount}`);

  if (report.status === 'fail') {
    process.exitCode = 1;
  }
}

await main();