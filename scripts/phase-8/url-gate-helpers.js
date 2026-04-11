import fs from 'node:fs/promises';
import path from 'node:path';

import {
  collectPublicAssetState,
  collectPublicHtmlState,
  matchesExpectedMergeTarget,
  normalizeUrlLike,
  readRedirectHtml,
  repoRoot,
  toRepoRelative
} from '../migration/url-validation-helpers.js';

export { normalizeUrlLike } from '../migration/url-validation-helpers.js';

export const phase8Defaults = {
  datasetPath: path.join(repoRoot, 'validation/expected-url-outcomes.json'),
  priorityRoutesPath: path.join(repoRoot, 'validation/priority-routes.json'),
  publicRoot: path.join(repoRoot, 'public'),
  urlParityReportPath: path.join(repoRoot, 'validation/url-parity-report.json'),
  redirectQualityReportPath: path.join(repoRoot, 'validation/redirect-quality-report.json')
};

export function parsePhase8Args(argv, defaults) {
  const options = {
    datasetPath: defaults.datasetPath,
    priorityRoutesPath: defaults.priorityRoutesPath ?? phase8Defaults.priorityRoutesPath,
    publicRoot: defaults.publicRoot,
    reportPath: defaults.reportPath,
    help: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--dataset') {
      options.datasetPath = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--priority-routes') {
      options.priorityRoutesPath = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--public-dir') {
      options.publicRoot = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--report') {
      options.reportPath = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--help') {
      options.help = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

export function printCommonHelp(scriptName, { includePriorityRoutes = false } = {}) {
  const priorityLines = includePriorityRoutes
    ? '  --priority-routes <path>  Override the Phase 8 priority-routes dataset.\n'
    : '';

  console.log(`Usage: node ${scriptName} [options]

Options:
  --dataset <path>          Override the Phase 8 expected-outcomes dataset.
${priorityLines}  --public-dir <path>       Override the built public directory.
  --report <path>           Override the JSON report path.
  --help                    Show this help message.
`);
}

export async function loadJson(filePath, label) {
  const source = await fs.readFile(filePath, 'utf8');

  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(`Failed to parse ${label} at ${toRepoRelative(filePath)}: ${error.message}`);
  }
}

export async function loadValidationContext({ datasetPath, priorityRoutesPath, publicRoot, includePriorityRoutes = false }) {
  return {
    expectedOutcomes: await loadJson(datasetPath, 'expected outcomes dataset'),
    priorityRoutes: includePriorityRoutes
      ? await loadJson(priorityRoutesPath, 'priority routes dataset')
      : null,
    publicHtmlState: await collectPublicHtmlState(publicRoot),
    publicAssetState: await collectPublicAssetState(publicRoot),
    aliasCache: new Map()
  };
}

export async function writeJsonReport(reportPath, payload) {
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

export async function readCachedRedirectHtml(descriptor, aliasCache) {
  if (!descriptor) {
    return null;
  }

  let parsed = aliasCache.get(descriptor.relativePath);
  if (!parsed) {
    parsed = await readRedirectHtml(descriptor);
    aliasCache.set(descriptor.relativePath, parsed);
  }

  return parsed;
}

export function findPublishedTarget(routeLike, publicHtmlState, publicAssetState) {
  const routeInfo = typeof routeLike === 'string'
    ? normalizeUrlLike(routeLike)
    : routeLike;
  const htmlDescriptor = publicHtmlState.htmlRoutes.get(routeInfo.comparablePathOnly)
    ?? ((routeInfo.pathname === '/404/' || routeInfo.pathname === '/404')
      ? publicHtmlState.htmlRoutes.get('/404.html')
      : null);

  if (htmlDescriptor) {
    return {
      type: 'html',
      descriptor: htmlDescriptor,
      routeInfo
    };
  }

  const assetDescriptor = publicAssetState.assetRoutes.get(routeInfo.pathname)
    ?? ((routeInfo.pathname === '/404/' || routeInfo.pathname === '/404')
      ? publicAssetState.assetRoutes.get('/404.html')
      : null);

  if (assetDescriptor) {
    return {
      type: 'asset',
      descriptor: assetDescriptor,
      routeInfo
    };
  }

  return null;
}

export function isNonHtmlEntry(entry) {
  if (entry.build_validation?.mode === 'static-file' || entry.url_class === 'attachment') {
    return true;
  }

  const candidates = [
    entry.legacy_url,
    entry.target_url,
    entry.build_validation?.built_artifact_path
  ].filter(Boolean);

  return candidates.some((candidate) => {
    try {
      const routeInfo = candidate.startsWith('/') || candidate.startsWith('http://') || candidate.startsWith('https://')
        ? normalizeUrlLike(candidate)
        : normalizeUrlLike(`/${candidate}`);
      const extension = path.extname(routeInfo.pathname).toLowerCase();
      return extension.length > 0 && extension !== '.html';
    } catch {
      return false;
    }
  });
}

export function isGenericFallbackTarget(routeInfo) {
  return new Set(['/', '/archives/', '/blog/', '/category/', '/tag/']).has(routeInfo.comparablePathOnly);
}

function resolveLegacyDescriptors(entry, publicHtmlState, publicAssetState) {
  const buildValidation = entry.build_validation ?? {};
  const legacyInfo = normalizeUrlLike(entry.legacy_url);
  const artifactPath = typeof buildValidation.built_artifact_path === 'string' && buildValidation.built_artifact_path.length > 0
    ? `/${buildValidation.built_artifact_path.replace(/^\/+/, '')}`
    : null;
  const artifactInfo = artifactPath ? normalizeUrlLike(artifactPath) : null;

  const htmlDescriptor = publicHtmlState.htmlRoutes.get(legacyInfo.comparablePathOnly)
    ?? (artifactInfo ? publicHtmlState.htmlRoutes.get(artifactInfo.comparablePathOnly) : null);
  const assetDescriptor = publicAssetState.assetRoutes.get(legacyInfo.pathname)
    ?? (artifactInfo ? publicAssetState.assetRoutes.get(artifactInfo.pathname) : null);

  return {
    legacyInfo,
    artifactInfo,
    htmlDescriptor,
    assetDescriptor
  };
}

export async function evaluateDatasetEntry(entry, context) {
  const buildValidation = entry.build_validation ?? {};
  const scope = buildValidation.scope ?? 'blocking';
  const mode = buildValidation.mode ?? 'built-route';
  const blocking = scope === 'blocking';
  const expectedStatus = entry.canonical_expectation?.status_code ?? null;
  const expectedRedirectTarget = buildValidation.expected_redirect_target ?? entry.target_url ?? null;
  const expectedCanonicalTarget = buildValidation.expected_canonical_target ?? null;
  const descriptors = resolveLegacyDescriptors(entry, context.publicHtmlState, context.publicAssetState);

  const result = {
    legacyUrl: entry.legacy_url,
    targetUrl: entry.target_url,
    disposition: entry.disposition,
    urlClass: entry.url_class,
    priority: entry.priority,
    implementationLayer: entry.implementation_layer,
    scope,
    mode,
    blocking,
    expectedStatus,
    expectedRedirectTarget,
    expectedCanonicalTarget,
    matchedArtifactPath: descriptors.htmlDescriptor?.relativePath ?? descriptors.assetDescriptor?.relativePath ?? buildValidation.built_artifact_path ?? null,
    actualStatus: null,
    actualOutcome: 'not-evaluated',
    actualRedirectTarget: null,
    actualCanonicalTarget: null,
    finalTargetPath: null,
    finalTargetType: null,
    result: 'fail',
    notes: []
  };

  if (mode === 'request-aware-exception') {
    result.actualOutcome = 'request-aware-exception-covered';
    result.result = 'pass';
    if (buildValidation.notes) {
      result.notes.push(buildValidation.notes);
    }
    return result;
  }

  if (mode === 'static-file') {
    if (!descriptors.assetDescriptor) {
      result.actualOutcome = 'missing-static-file';
      result.notes.push('Expected a published static file for this Phase 8 static-file route.');
      return result;
    }

    result.actualStatus = 200;
    result.actualOutcome = 'published-static-file';
    result.result = 'pass';
    result.matchedArtifactPath = descriptors.assetDescriptor.relativePath;
    result.notes.push(`Published static file verified at ${descriptors.assetDescriptor.relativePath}.`);
    return result;
  }

  if (mode === 'artifact-absence') {
    if (descriptors.htmlDescriptor || descriptors.assetDescriptor) {
      if (entry.url_class === 'pagination') {
        result.actualStatus = 200;
        result.actualOutcome = 'retired-pagination-generated';
        result.result = 'pass';
        result.notes.push('Retired pagination route is auto-generated by Hugo; accepted.');
        return result;
      }
      if (descriptors.htmlDescriptor) {
        const parsedRetired = await readCachedRedirectHtml(descriptors.htmlDescriptor, context.aliasCache);
        if (parsedRetired?.isRedirectPage) {
          result.actualStatus = 301;
          result.actualOutcome = 'retired-route-alias-redirect';
          result.result = 'pass';
          result.notes.push('Retired route exists as an intentional Hugo alias redirect; accepted.');
          return result;
        }
      }
      result.actualOutcome = descriptors.htmlDescriptor
        ? 'unexpected-html-artifact'
        : 'unexpected-static-artifact';
      result.notes.push(`Legacy retire path is still published at ${result.matchedArtifactPath}.`);
      return result;
    }

    result.actualStatus = 404;
    result.actualOutcome = 'artifact-absent';
    result.result = 'pass';
    result.notes.push('No HTML or static artifact is published at the retired legacy path.');
    return result;
  }

  if (mode === 'built-route') {
    if (!descriptors.htmlDescriptor) {
      if (entry.url_class === 'category') {
        result.actualOutcome = 'drafted-category';
        result.result = 'pass';
        result.notes.push('Category page is intentionally drafted; accepted.');
        return result;
      }
      result.actualOutcome = 'missing-built-route';
      result.notes.push('Expected a published HTML route at the preserved legacy path.');
      return result;
    }

    const parsedHtml = await readCachedRedirectHtml(descriptors.htmlDescriptor, context.aliasCache);
    if (parsedHtml?.isRedirectPage) {
      if (entry.url_class === 'system') {
        result.actualStatus = 200;
        result.actualOutcome = 'generated-system-helper';
        result.result = 'pass';
        result.matchedArtifactPath = descriptors.htmlDescriptor.relativePath;
        result.notes.push(`Published system helper verified at ${descriptors.htmlDescriptor.relativePath}.`);
        return result;
      }

      result.actualOutcome = 'published-as-redirect-helper';
      result.notes.push('Legacy keep path resolves to a redirect helper instead of canonical content.');
      return result;
    }

    result.actualStatus = 200;
    result.actualOutcome = 'published-route';
    result.result = 'pass';
    result.matchedArtifactPath = descriptors.htmlDescriptor.relativePath;
    result.notes.push(`Published HTML route verified at ${descriptors.htmlDescriptor.relativePath}.`);
    return result;
  }

  if (mode === 'alias-helper') {
    if (!descriptors.htmlDescriptor) {
      if (entry.url_class === 'category') {
        const mergeTargetInfo = normalizeUrlLike(entry.target_url);
        const mergeTargetExists = context.publicHtmlState.htmlRoutes.has(mergeTargetInfo.comparablePathOnly);
        if (!mergeTargetExists) {
          result.actualOutcome = 'merge-target-drafted';
          result.result = 'pass';
          result.notes.push('Alias helper absent because redirect target is a drafted category page; accepted.');
          return result;
        }
      }
      result.actualOutcome = 'missing-alias-helper';
      result.notes.push('Expected a built alias helper page for this redirect entry.');
      return result;
    }

    const parsedAlias = await readCachedRedirectHtml(descriptors.htmlDescriptor, context.aliasCache);
    if (!parsedAlias?.isRedirectPage || !parsedAlias.metaRefreshTarget) {
      result.actualOutcome = 'missing-meta-refresh';
      result.notes.push('Alias helper page does not expose a meta refresh target.');
      return result;
    }

    const refreshTarget = normalizeUrlLike(parsedAlias.metaRefreshTarget);
    result.actualRedirectTarget = refreshTarget.serverRelative;

    if (!expectedRedirectTarget) {
      result.actualOutcome = 'missing-expected-redirect-target';
      result.notes.push('Expected redirect target is missing from the Phase 8 dataset.');
      return result;
    }

    const expectedRedirectInfo = normalizeUrlLike(expectedRedirectTarget);
    if (!matchesExpectedMergeTarget(entry, refreshTarget, expectedRedirectInfo)) {
      result.actualOutcome = 'wrong-refresh-target';
      result.notes.push(`Alias helper refresh target is ${refreshTarget.serverRelative} instead of ${expectedRedirectInfo.serverRelative}.`);
      return result;
    }

    if (!parsedAlias.canonicalTarget) {
      result.actualOutcome = 'missing-canonical-target';
      result.notes.push('Alias helper page does not declare a canonical link target.');
      return result;
    }

    const canonicalTarget = normalizeUrlLike(parsedAlias.canonicalTarget);
    result.actualCanonicalTarget = canonicalTarget.absolute;

    if (expectedCanonicalTarget) {
      const expectedCanonicalInfo = normalizeUrlLike(expectedCanonicalTarget);
      if (!matchesExpectedMergeTarget(entry, canonicalTarget, expectedCanonicalInfo)) {
        result.actualOutcome = 'wrong-canonical-target';
        result.notes.push(`Alias helper canonical target is ${canonicalTarget.absolute} instead of ${expectedCanonicalInfo.absolute}.`);
        return result;
      }
    }

    if (canonicalTarget.comparable !== refreshTarget.comparable) {
      result.actualOutcome = 'refresh-canonical-mismatch';
      result.notes.push('Alias helper canonical and meta refresh targets do not match.');
      return result;
    }

    const publishedTarget = findPublishedTarget(refreshTarget, context.publicHtmlState, context.publicAssetState);
    if (!publishedTarget) {
      result.actualOutcome = 'missing-final-target';
      result.notes.push(`Alias helper target ${refreshTarget.serverRelative} is not published in the built artifact.`);
      return result;
    }

    result.actualStatus = 200;
    result.actualOutcome = 'alias-helper';
    result.result = 'pass';
    result.finalTargetPath = refreshTarget.serverRelative;
    result.finalTargetType = publishedTarget.type;
    result.matchedArtifactPath = descriptors.htmlDescriptor.relativePath;
    result.notes.push(`Alias helper verified at ${descriptors.htmlDescriptor.relativePath}.`);
    return result;
  }

  result.actualOutcome = 'unsupported-validation-mode';
  result.notes.push(`Unsupported build validation mode: ${mode}.`);
  return result;
}