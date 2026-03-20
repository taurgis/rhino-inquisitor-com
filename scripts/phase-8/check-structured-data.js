import fs from 'node:fs/promises';
import path from 'node:path';

import {
  collectHtmlInventory,
  getArtifactProvenance,
  isIso8601,
  normalizeRoute,
  normalizeRouteLike,
  phase8SeoDefaults,
  readHtmlPage,
  toAbsoluteUrl,
  writeJsonReport
} from './seo-gate-helpers.js';
import {
  canonicalOrigin,
  collectPublicAssetState,
  toRepoRelative
} from '../migration/url-validation-helpers.js';

const canonicalHost = new URL(canonicalOrigin).hostname;
const defaults = {
  publicRoot: phase8SeoDefaults.publicRoot,
  sampleMatrixPath: phase8SeoDefaults.sampleMatrixPath,
  reportPath: path.join(path.dirname(phase8SeoDefaults.sampleMatrixPath), 'structured-data-report.json')
};

function printHelp() {
  console.log(`Usage: node scripts/phase-8/check-structured-data.js [options]

Options:
  --public-dir <path>      Override the built public directory.
  --sample-matrix <path>   Override validation/sample-matrix.json.
  --report <path>          Override validation/structured-data-report.json.
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
      case '--help':
        options.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function normalizeText(value) {
  return String(value ?? '')
    .replace(/\s+/gu, ' ')
    .replace(/[“”]/gu, '"')
    .replace(/[‘’]/gu, "'")
    .trim()
    .toLowerCase();
}

function arrayify(value) {
  if (value == null) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function flattenJsonLdNodes(value) {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => flattenJsonLdNodes(entry));
  }

  if (!value || typeof value !== 'object') {
    return [];
  }

  if (Array.isArray(value['@graph'])) {
    return value['@graph'].flatMap((entry) => flattenJsonLdNodes(entry));
  }

  return [value];
}

function readTypes(node) {
  return arrayify(node?.['@type'])
    .map((value) => String(value).trim())
    .filter(Boolean);
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

function getExpectedRules(routeRecord) {
  const families = new Set(routeRecord.sources.map((source) => source.family));
  const required = [];
  const forbidden = [];

  if (families.has('home')) {
    required.push({ key: 'website', label: 'WebSite', anyOf: ['WebSite'] });
    forbidden.push({ label: 'BlogPosting or Article', types: ['BlogPosting', 'Article'] });
    forbidden.push({ label: 'VideoObject', types: ['VideoObject'] });
  }

  if (families.has('post') || families.has('video-post')) {
    required.push({ key: 'article', label: 'BlogPosting or Article', anyOf: ['BlogPosting', 'Article'] });
    required.push({ key: 'breadcrumb', label: 'BreadcrumbList', anyOf: ['BreadcrumbList'] });
  } else {
    forbidden.push({ label: 'BlogPosting or Article', types: ['BlogPosting', 'Article'] });
  }

  if (families.has('category')) {
    required.push({ key: 'category-breadcrumb', label: 'BreadcrumbList', anyOf: ['BreadcrumbList'] });
  }

  if (families.has('video-page') || families.has('video-post')) {
    required.push({ key: 'video', label: 'VideoObject', anyOf: ['VideoObject'] });
  } else {
    forbidden.push({ label: 'VideoObject', types: ['VideoObject'] });
  }

  return { required, forbidden };
}

function validateAbsoluteHttpsUrl(value, label, findings) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    findings.push(`${label} is missing or empty.`);
    return null;
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    findings.push(`${label} is not a valid absolute URL (${value}).`);
    return null;
  }

  if (parsed.protocol !== 'https:') {
    findings.push(`${label} must use HTTPS (${value}).`);
  }

  if (parsed.hostname !== canonicalHost) {
    findings.push(`${label} must use the canonical ${canonicalHost} host (${value}).`);
  }

  return parsed;
}

function validateAbsoluteHttpsUrlAnyHost(value, label, findings) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    findings.push(`${label} is missing or empty.`);
    return null;
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    findings.push(`${label} is not a valid absolute URL (${value}).`);
    return null;
  }

  if (parsed.protocol !== 'https:') {
    findings.push(`${label} must use HTTPS (${value}).`);
  }

  return parsed;
}

function collectHtmlFragmentPaths(value, currentPath = '$') {
  if (typeof value === 'string') {
    return value.includes('<') || value.includes('>') ? [currentPath] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => collectHtmlFragmentPaths(entry, `${currentPath}[${index}]`));
  }

  if (!value || typeof value !== 'object') {
    return [];
  }

  return Object.entries(value).flatMap(([key, entry]) => collectHtmlFragmentPaths(entry, `${currentPath}.${key}`));
}

function describeSourceSummary(routeRecord) {
  return routeRecord.sources.map((source) => ({
    group: source.group,
    family: source.family,
    title: source.title,
    contentPath: source.contentPath,
    selectionReason: source.selectionReason
  }));
}

function summarizeNodes(nodes) {
  return nodes.map((node, index) => ({
    index,
    types: readTypes(node)
  }));
}

function readStringOrObjectName(value) {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (value && typeof value === 'object' && typeof value.name === 'string') {
    return value.name.trim();
  }

  return '';
}

function extractUrlList(value) {
  return arrayify(value)
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean);
}

function validateImageUrls(urls, label, findings, warnings, publicAssetState) {
  if (urls.length === 0) {
    findings.push(`${label} is missing or empty.`);
    return [];
  }

  return urls.map((url) => {
    const imageFindings = [];
    const imageWarnings = [];
    const parsed = validateAbsoluteHttpsUrl(url, label, imageFindings);
    let resolved = false;
    let assetPath = null;

    if (parsed && parsed.hostname === canonicalHost) {
      const descriptor = publicAssetState.assetRoutes.get(parsed.pathname);
      if (!descriptor) {
        imageFindings.push(`${label} does not resolve to a built asset (${url}).`);
      } else {
        resolved = true;
        assetPath = toRepoRelative(descriptor.absolutePath);
      }
    } else if (parsed) {
      imageWarnings.push(`${label} uses a non-canonical host and was not statically verified (${url}).`);
    }

    findings.push(...imageFindings);
    warnings.push(...imageWarnings);

    return {
      url,
      resolved,
      assetPath,
      findings: imageFindings,
      warnings: imageWarnings
    };
  });
}

function validateWebsiteNode(node, findings) {
  const name = typeof node.name === 'string' ? node.name.trim() : '';
  if (!name) {
    findings.push('WebSite.name is missing or empty.');
  }

  validateAbsoluteHttpsUrl(node.url, 'WebSite.url', findings);
}

function validateArticleNode(node, routeRecord, h1Text, findings, warnings, publicAssetState) {
  const headline = typeof node.headline === 'string' ? node.headline.trim() : '';
  if (!headline) {
    findings.push('BlogPosting.headline is missing or empty.');
  }

  if (headline && h1Text && normalizeText(headline) !== normalizeText(h1Text)) {
    findings.push(`BlogPosting.headline does not match the visible <h1> (${headline} != ${h1Text}).`);
  }

  if (!isIso8601(node.datePublished ?? '')) {
    findings.push(`BlogPosting.datePublished is not ISO 8601 with timezone (${node.datePublished ?? ''}).`);
  }

  if (!isIso8601(node.dateModified ?? '')) {
    findings.push(`BlogPosting.dateModified is not ISO 8601 with timezone (${node.dateModified ?? ''}).`);
  }

  const url = validateAbsoluteHttpsUrl(node.url, 'BlogPosting.url', findings);
  if (url && normalizeRoute(url.pathname) !== routeRecord.route) {
    findings.push(`BlogPosting.url does not self-reference the current route (${node.url}).`);
  }

  if (typeof node.mainEntityOfPage === 'string') {
    validateAbsoluteHttpsUrl(node.mainEntityOfPage, 'BlogPosting.mainEntityOfPage', findings);
  } else if (node.mainEntityOfPage && typeof node.mainEntityOfPage === 'object') {
    const mainEntityId = typeof node.mainEntityOfPage['@id'] === 'string' ? node.mainEntityOfPage['@id'] : '';
    const mainEntityUrl = validateAbsoluteHttpsUrl(mainEntityId, 'BlogPosting.mainEntityOfPage.@id', findings);
    if (mainEntityUrl && normalizeRoute(mainEntityUrl.pathname) !== routeRecord.route) {
      findings.push(`BlogPosting.mainEntityOfPage.@id does not self-reference the current route (${mainEntityId}).`);
    }
  } else {
    findings.push('BlogPosting.mainEntityOfPage is missing or empty.');
  }

  const authorName = readStringOrObjectName(node.author);
  if (!authorName) {
    findings.push('BlogPosting.author.name is missing or empty.');
  }

  const publisherName = readStringOrObjectName(node.publisher);
  if (!publisherName) {
    findings.push('BlogPosting.publisher.name is missing or empty.');
  }

  return validateImageUrls(extractUrlList(node.image), 'BlogPosting.image', findings, warnings, publicAssetState);
}

function validateBreadcrumbNode(node, routeRecord, findings) {
  const items = Array.isArray(node.itemListElement) ? node.itemListElement : [];
  if (items.length < 2) {
    findings.push('BreadcrumbList.itemListElement must contain at least 2 items.');
    return;
  }

  items.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      findings.push(`BreadcrumbList item ${index + 1} is not an object.`);
      return;
    }

    if (item['@type'] !== 'ListItem') {
      findings.push(`BreadcrumbList item ${index + 1} must use @type ListItem.`);
    }

    if (!Number.isInteger(item.position) || item.position <= 0) {
      findings.push(`BreadcrumbList item ${index + 1} has an invalid position (${item.position ?? ''}).`);
    }

    if (typeof item.name !== 'string' || item.name.trim().length === 0) {
      findings.push(`BreadcrumbList item ${index + 1} is missing a name.`);
    }

    validateAbsoluteHttpsUrl(item.item, `BreadcrumbList item ${index + 1}.item`, findings);
  });

  const lastItem = items[items.length - 1];
  if (lastItem?.item) {
    const parsed = validateAbsoluteHttpsUrl(lastItem.item, 'BreadcrumbList final item', findings);
    if (parsed && normalizeRoute(parsed.pathname) !== routeRecord.route) {
      findings.push(`BreadcrumbList final item does not match the current route (${lastItem.item}).`);
    }
  }
}

function validateVideoNode(node, routeRecord, findings, warnings, publicAssetState) {
  const name = typeof node.name === 'string' ? node.name.trim() : '';
  const description = typeof node.description === 'string' ? node.description.trim() : '';
  if (!name) {
    findings.push('VideoObject.name is missing or empty.');
  }

  if (!description) {
    findings.push('VideoObject.description is missing or empty.');
  }

  if (!isIso8601(node.uploadDate ?? '')) {
    findings.push(`VideoObject.uploadDate is not ISO 8601 with timezone (${node.uploadDate ?? ''}).`);
  }

  const url = validateAbsoluteHttpsUrl(node.url, 'VideoObject.url', findings);
  if (url && normalizeRoute(url.pathname) !== routeRecord.route) {
    findings.push(`VideoObject.url does not self-reference the current route (${node.url}).`);
  }

  validateAbsoluteHttpsUrlAnyHost(node.embedUrl, 'VideoObject.embedUrl', findings);
  validateAbsoluteHttpsUrlAnyHost(node.contentUrl, 'VideoObject.contentUrl', findings);
  return validateImageUrls(extractUrlList(node.thumbnailUrl), 'VideoObject.thumbnailUrl', findings, warnings, publicAssetState);
}

async function analyzeRoute(routeRecord, htmlInventory, publicAssetState) {
  const inventoryEntry = htmlInventory.get(routeRecord.route);
  if (!inventoryEntry) {
    return {
      route: routeRecord.route,
      expectedUrl: routeRecord.expectedUrl,
      sources: describeSourceSummary(routeRecord),
      builtArtifactPath: null,
      result: 'fail',
      schemaBlocks: [],
      schemaNodes: [],
      blockingFindings: ['Expected route is missing from the production HTML artifact.'],
      warnings: []
    };
  }

  const { $ } = await readHtmlPage(inventoryEntry.filePath);
  const h1Text = $('h1').first().text().trim();
  const scriptElements = $('script[type="application/ld+json"]').toArray();
  const schemaBlocks = [];
  const parsedNodes = [];
  const blockingFindings = [];
  const warnings = [];

  scriptElements.forEach((element, index) => {
    const source = $(element).html()?.trim() ?? '';
    if (!source) {
      schemaBlocks.push({ index, result: 'fail', types: [], findings: ['Empty JSON-LD block.'] });
      blockingFindings.push(`Structured-data block ${index + 1} is empty.`);
      return;
    }

    try {
      const parsed = JSON.parse(source);
      const nodes = flattenJsonLdNodes(parsed);
      schemaBlocks.push({
        index,
        result: 'pass',
        types: nodes.flatMap((node) => readTypes(node)),
        findings: []
      });
      parsedNodes.push(...nodes);
    } catch (error) {
      schemaBlocks.push({
        index,
        result: 'fail',
        types: [],
        findings: [`Invalid JSON-LD: ${error.message}`]
      });
      blockingFindings.push(`Structured-data block ${index + 1} is not valid JSON (${error.message}).`);
    }
  });

  const allTypes = new Set(parsedNodes.flatMap((node) => readTypes(node)));
  const { required, forbidden } = getExpectedRules(routeRecord);

  required.forEach((rule) => {
    const matched = rule.anyOf.some((type) => allTypes.has(type));
    if (!matched) {
      blockingFindings.push(`Missing required structured-data type ${rule.label}.`);
    }
  });

  forbidden.forEach((rule) => {
    const matched = rule.types.find((type) => allTypes.has(type));
    if (matched) {
      blockingFindings.push(`Structured-data type ${matched} is not applicable on this route.`);
    }
  });

  const nodeSummaries = [];
  parsedNodes.forEach((node, index) => {
    const nodeTypes = readTypes(node);
    const findings = [];
    const nodeWarnings = [];
    const htmlPaths = collectHtmlFragmentPaths(node);
    if (htmlPaths.length > 0) {
      findings.push(`JSON-LD contains raw HTML-like characters in ${htmlPaths.join(', ')}.`);
    }

    const imageChecks = [];
    if (nodeTypes.includes('WebSite')) {
      validateWebsiteNode(node, findings);
    }

    if (nodeTypes.includes('BlogPosting') || nodeTypes.includes('Article')) {
      imageChecks.push(...validateArticleNode(node, routeRecord, h1Text, findings, nodeWarnings, publicAssetState));
    }

    if (nodeTypes.includes('BreadcrumbList')) {
      validateBreadcrumbNode(node, routeRecord, findings);
    }

    if (nodeTypes.includes('VideoObject')) {
      imageChecks.push(...validateVideoNode(node, routeRecord, findings, nodeWarnings, publicAssetState));
    }

    blockingFindings.push(...findings);
    warnings.push(...nodeWarnings);
    nodeSummaries.push({
      index,
      types: nodeTypes,
      result: findings.length === 0 ? 'pass' : 'fail',
      findings,
      warnings: nodeWarnings,
      imageChecks
    });
  });

  return {
    route: routeRecord.route,
    expectedUrl: routeRecord.expectedUrl,
    sources: describeSourceSummary(routeRecord),
    builtArtifactPath: inventoryEntry.repoRelativePath,
    h1: h1Text,
    schemaBlockCount: scriptElements.length,
    schemaBlocks,
    schemaNodes: nodeSummaries,
    result: blockingFindings.length === 0 ? 'pass' : 'fail',
    blockingFindings,
    warnings
  };
}

function summarizeResults(entries) {
  return entries.reduce(
    (summary, entry) => {
      summary.totalRoutes += 1;
      summary[entry.result === 'pass' ? 'passCount' : 'failCount'] += 1;
      summary.blockingFailures += entry.blockingFindings.length;
      summary.warningCount += entry.warnings.length;
      summary.jsonLdBlockCount += entry.schemaBlockCount ?? 0;
      summary.invalidJsonBlocks += entry.schemaBlocks?.filter((block) => block.result === 'fail').length ?? 0;
      summary.routesWithBreadcrumb += entry.schemaNodes?.some((node) => node.types.includes('BreadcrumbList')) ? 1 : 0;
      summary.routesWithVideoObject += entry.schemaNodes?.some((node) => node.types.includes('VideoObject')) ? 1 : 0;
      return summary;
    },
    {
      totalRoutes: 0,
      passCount: 0,
      failCount: 0,
      blockingFailures: 0,
      warningCount: 0,
      jsonLdBlockCount: 0,
      invalidJsonBlocks: 0,
      routesWithBreadcrumb: 0,
      routesWithVideoObject: 0
    }
  );
}

function collectRichResultsTargets(sampleMatrix) {
  const homepage = sampleMatrix.page_samples?.homepage?.[0]?.absolute_url ?? null;
  const recentPosts = (sampleMatrix.page_samples?.recent_posts ?? []).slice(0, 2).map((entry) => entry.absolute_url);
  const category = sampleMatrix.page_samples?.category_pages?.[0]?.absolute_url ?? null;
  const video = sampleMatrix.page_samples?.video_pages?.[0]?.absolute_url
    ?? sampleMatrix.page_samples?.video_posts?.[0]?.absolute_url
    ?? null;

  return {
    homepage,
    recentPosts,
    category,
    video,
    evidencePath: 'validation/rich-results-test-evidence'
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const [sampleMatrixSource, htmlInventory, publicAssetState] = await Promise.all([
    fs.readFile(options.sampleMatrixPath, 'utf8'),
    collectHtmlInventory(options.publicRoot),
    collectPublicAssetState(options.publicRoot)
  ]);
  const sampleMatrix = JSON.parse(sampleMatrixSource);
  const routeRecords = collectSampleRoutes(sampleMatrix);
  const entries = [];

  for (const routeRecord of routeRecords) {
    entries.push(await analyzeRoute(routeRecord, htmlInventory, publicAssetState));
  }

  const summary = summarizeResults(entries);
  const report = {
    phase: 8,
    ticket: 'RHI-087',
    artifact: 'structured-data-report',
    status: summary.blockingFailures === 0 ? 'pass' : 'fail',
    rcTag: sampleMatrix.rc?.tag ?? null,
    rcSha: sampleMatrix.rc?.commit ?? null,
    generatedAt: new Date().toISOString(),
    publicDir: toRepoRelative(options.publicRoot),
    sampleMatrix: {
      path: toRepoRelative(options.sampleMatrixPath),
      generatedAt: sampleMatrix.generated_at
    },
    artifactProvenance: getArtifactProvenance(sampleMatrix.rc),
    richResultsTargets: collectRichResultsTargets(sampleMatrix),
    policy: {
      canonicalHost: canonicalOrigin,
      articleSchema: 'BlogPosting-or-Article',
      breadcrumbSeverity: 'blocking-on-post-and-category-routes',
      htmlFragmentSeverity: 'blocking',
      imageVerificationMode: 'artifact-path'
    },
    summary,
    entries
  };

  await writeJsonReport(options.reportPath, report);

  console.log(`Phase 8 structured-data report written to ${toRepoRelative(options.reportPath)}`);
  console.log(`Routes checked: ${summary.totalRoutes}`);
  console.log(`Pass routes: ${summary.passCount}`);
  console.log(`Fail routes: ${summary.failCount}`);
  console.log(`Blocking findings: ${summary.blockingFailures}`);
  console.log(`Warnings: ${summary.warningCount}`);

  if (summary.blockingFailures > 0) {
    process.exitCode = 1;
  }
}

await main();