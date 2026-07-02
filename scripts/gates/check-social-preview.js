import fs from 'node:fs/promises';
import path from 'node:path';

import fg from 'fast-glob';
import matter from 'gray-matter';
import sharp from 'sharp';

import {
  collectHtmlInventory,
  getArtifactProvenance,
  normalizeRoute,
  normalizeRouteLike,
  phase8SeoDefaults,
  readHtmlPage,
  readMetaContent,
  toAbsoluteUrl,
  writeJsonReport
} from './seo-gate-helpers.js';
import {
  canonicalOrigin,
  collectPublicAssetState,
  toRepoRelative
} from '../url/url-validation-helpers.js';

const canonicalHost = new URL(canonicalOrigin).hostname;
const defaults = {
  publicRoot: phase8SeoDefaults.publicRoot,
  contentRoot: phase8SeoDefaults.contentRoot,
  sampleMatrixPath: phase8SeoDefaults.sampleMatrixPath,
  priorityRoutesPath: phase8SeoDefaults.priorityRoutesPath,
  reportPath: path.join(path.dirname(phase8SeoDefaults.sampleMatrixPath), 'social-preview-report.json')
};

function printHelp() {
  console.log(`Usage: node scripts/gates/check-social-preview.js [options]

Options:
  --public-dir <path>      Override the built public directory.
  --content-dir <path>     Override the content directory used for route-family inference.
  --sample-matrix <path>   Override validation/sample-matrix.json.
  --priority-routes <path> Override validation/priority-routes.json.
  --report <path>          Override validation/social-preview-report.json.
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
      case '--content-dir':
        options.contentRoot = path.resolve(argv[++index]);
        break;
      case '--sample-matrix':
        options.sampleMatrixPath = path.resolve(argv[++index]);
        break;
      case '--priority-routes':
        options.priorityRoutesPath = path.resolve(argv[++index]);
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

function createRouteRecord(route) {
  return {
    route,
    expectedUrl: toAbsoluteUrl(route),
    sources: []
  };
}

function routeFamilyFromSampleGroup(groupName) {
  if (groupName === 'recent_posts' || groupName === 'video_posts') {
    return 'article';
  }

  if (groupName === 'homepage') {
    return 'home';
  }

  if (groupName === 'category_pages') {
    return 'category';
  }

  if (groupName === 'archive_pages') {
    return 'archive';
  }

  if (groupName === 'privacy_legal_pages') {
    return 'legal';
  }

  if (groupName === 'video_pages') {
    return 'video';
  }

  return 'page';
}

function routeFamilyFromPriorityClass(urlClass) {
  if (urlClass === 'post') {
    return 'article';
  }

  if (urlClass === 'category') {
    return 'category';
  }

  if (urlClass === 'system') {
    return 'system';
  }

  if (urlClass === 'video') {
    return 'video';
  }

  return 'page';
}

function collectValidationRoutes(sampleMatrix, priorityRoutes) {
  const routes = new Map();

  for (const [groupName, entries] of Object.entries(sampleMatrix.page_samples ?? {})) {
    for (const entry of Array.isArray(entries) ? entries : []) {
      const route = normalizeRouteLike(entry.url);
      if (!route) {
        continue;
      }

      const existing = routes.get(route) ?? createRouteRecord(route);
      existing.sources.push({
        type: 'sample-matrix',
        group: groupName,
        family: routeFamilyFromSampleGroup(groupName),
        title: entry.title ?? null,
        contentPath: entry.content_path ?? null,
        selectionReason: entry.selection_reason ?? null
      });
      routes.set(route, existing);
    }
  }

  for (const entry of priorityRoutes.routes ?? []) {
    if (entry.expected_outcome === 'retire' || entry.disposition === 'retire' || !entry.final_target_url) {
      continue;
    }

    const route = normalizeRouteLike(entry.final_target_url ?? entry.route);
    if (!route) {
      continue;
    }

    const existing = routes.get(route) ?? createRouteRecord(route);
    existing.sources.push({
      type: 'priority-routes',
      family: routeFamilyFromPriorityClass(entry.url_class ?? ''),
      priority: entry.priority ?? null,
      urlClass: entry.url_class ?? null,
      sourceRoute: entry.route ?? null,
      expectedOutcome: entry.expected_outcome ?? null,
      selectionReason: entry.selection_reason ?? null
    });
    routes.set(route, existing);
  }

  return [...routes.values()].sort((left, right) => left.route.localeCompare(right.route));
}

function describeSources(routeRecord) {
  return routeRecord.sources.map((source) => {
    if (source.type === 'sample-matrix') {
      return {
        type: source.type,
        group: source.group,
        family: source.family,
        title: source.title,
        contentPath: source.contentPath,
        selectionReason: source.selectionReason
      };
    }

    return {
      type: source.type,
      family: source.family,
      priority: source.priority,
      urlClass: source.urlClass,
      sourceRoute: source.sourceRoute,
      expectedOutcome: source.expectedOutcome,
      selectionReason: source.selectionReason
    };
  });
}

function isSystemOnlyRoute(routeRecord) {
  return routeRecord.sources.length > 0 && routeRecord.sources.every((source) => source.family === 'system');
}

function expectsArticleMeta(routeRecord) {
  return routeRecord.sources.some((source) => source.family === 'article');
}

function isPriorityRoute(routeRecord) {
  return routeRecord.sources.some((source) => source.type === 'priority-routes');
}

async function loadContentRouteMetadata(contentRoot) {
  const markdownFiles = await fg('**/*.md', {
    cwd: contentRoot,
    absolute: true,
    onlyFiles: true,
    suppressErrors: true
  });
  const routeMetadata = new Map();

  for (const filePath of markdownFiles.sort()) {
    const source = await fs.readFile(filePath, 'utf8');
    const parsed = matter(source);
    const route = normalizeRouteLike(parsed.data?.url);
    if (!route) {
      continue;
    }

    const relativePath = path.relative(contentRoot, filePath).split(path.sep).join('/');
    const section = relativePath.split('/')[0] ?? '';
    routeMetadata.set(route, {
      section,
      contentPath: toRepoRelative(filePath),
      hasVideo: Boolean(parsed.data?.video?.id)
    });
  }

  return routeMetadata;
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

  return parsed;
}

async function resolveImage(url, publicAssetState) {
  const findings = [];
  const warnings = [];
  const parsed = validateAbsoluteHttpsUrl(url, 'Social image URL', findings);
  let width = null;
  let height = null;
  let resolved = false;
  let assetPath = null;
  let host = null;

  if (parsed) {
    host = parsed.hostname;
    if (parsed.hostname === canonicalHost) {
      const descriptor = publicAssetState.assetRoutes.get(parsed.pathname);
      if (!descriptor) {
        findings.push(`Social image is not present in the built artifact (${url}).`);
      } else {
        resolved = true;
        assetPath = toRepoRelative(descriptor.absolutePath);
        try {
          const metadata = await sharp(descriptor.absolutePath).metadata();
          width = metadata.width ?? null;
          height = metadata.height ?? null;
          if ((width ?? 0) > 0 && (height ?? 0) > 0 && (width < 1200 || height < 630)) {
            warnings.push(`Social image dimensions ${width}x${height} are below the recommended 1200x630 minimum.`);
          }
        } catch (error) {
          warnings.push(`Could not read image dimensions for ${url} (${error.message}).`);
        }
      }
    } else {
      warnings.push(`Social image uses a non-canonical host and was not statically verified (${url}).`);
    }
  }

  return {
    url,
    host,
    resolved,
    assetPath,
    width,
    height,
    httpStatus: resolved ? 200 : null,
    findings,
    warnings
  };
}

function readMetaByProperty($, propertyName) {
  return readMetaContent($, 'property', propertyName);
}

function readMetaByName($, name) {
  return readMetaContent($, 'name', name);
}

async function analyzeRoute(routeRecord, htmlInventory, publicAssetState, imageCache, contentRouteMetadata) {
  const inventoryEntry = htmlInventory.get(routeRecord.route);
  if (isSystemOnlyRoute(routeRecord)) {
    return {
      route: routeRecord.route,
      expectedUrl: routeRecord.expectedUrl,
      sources: describeSources(routeRecord),
      builtArtifactPath: inventoryEntry?.repoRelativePath ?? null,
      result: 'skipped',
      blockingFindings: [],
      warnings: ['System-only priority route is excluded from social-preview page metadata validation.'],
      meta: null,
      images: []
    };
  }

  if (!inventoryEntry) {
    return {
      route: routeRecord.route,
      expectedUrl: routeRecord.expectedUrl,
      sources: describeSources(routeRecord),
      builtArtifactPath: null,
      result: isSystemOnlyRoute(routeRecord) ? 'skipped' : 'fail',
      blockingFindings: isSystemOnlyRoute(routeRecord)
        ? []
        : ['Expected route is missing from the production HTML artifact.'],
      warnings: isSystemOnlyRoute(routeRecord)
        ? ['System-only priority route does not resolve to an indexable HTML page in public/.']
        : [],
      meta: null,
      images: []
    };
  }

  const { $ } = await readHtmlPage(inventoryEntry.filePath);
  const title = $('title').first().text().trim();
  const metaDescription = readMetaByName($, 'description');
  const ogTitle = readMetaByProperty($, 'og:title');
  const ogDescription = readMetaByProperty($, 'og:description');
  const ogUrl = readMetaByProperty($, 'og:url');
  const ogType = readMetaByProperty($, 'og:type');
  const ogImage = readMetaByProperty($, 'og:image');
  const twitterCard = readMetaByName($, 'twitter:card');
  const twitterTitle = readMetaByName($, 'twitter:title');
  const twitterDescription = readMetaByName($, 'twitter:description');
  const twitterImage = readMetaByName($, 'twitter:image');
  const blockingFindings = [];
  const warnings = [];
  const contentMetadata = contentRouteMetadata.get(routeRecord.route);
  const expectedOgType = expectsArticleMeta(routeRecord) || contentMetadata?.section === 'posts'
    ? 'article'
    : 'website';

  if (!ogTitle) {
    blockingFindings.push('Missing og:title meta tag.');
  } else if (ogTitle !== title) {
    blockingFindings.push(`og:title must match <title> (${ogTitle} != ${title}).`);
  }

  if (!ogDescription) {
    blockingFindings.push('Missing og:description meta tag.');
  } else if (ogDescription !== metaDescription) {
    blockingFindings.push('og:description must match the meta description.');
  }

  const ogUrlParsed = validateAbsoluteHttpsUrl(ogUrl, 'og:url', blockingFindings);
  if (ogUrlParsed) {
    if (ogUrlParsed.hostname !== canonicalHost) {
      blockingFindings.push(`og:url must use the canonical ${canonicalHost} host (${ogUrl}).`);
    }

    if (normalizeRoute(ogUrlParsed.pathname) !== routeRecord.route) {
      blockingFindings.push(`og:url must self-reference the current route (${ogUrl}).`);
    }
  }

  if (!ogType) {
    blockingFindings.push('Missing og:type meta tag.');
  } else if (ogType !== expectedOgType) {
    blockingFindings.push(`og:type must be ${expectedOgType} for this route (${ogType}).`);
  }

  if (!ogImage) {
    blockingFindings.push('Missing og:image meta tag.');
  }

  if (!twitterCard) {
    blockingFindings.push('Missing twitter:card meta tag.');
  } else if (expectsArticleMeta(routeRecord) && twitterCard !== 'summary_large_image') {
    blockingFindings.push(`twitter:card must be summary_large_image for article routes (${twitterCard}).`);
  }

  if (!twitterTitle) {
    blockingFindings.push('Missing twitter:title meta tag.');
  } else if (twitterTitle !== title) {
    blockingFindings.push(`twitter:title must match <title> (${twitterTitle} != ${title}).`);
  }

  if (!twitterDescription) {
    blockingFindings.push('Missing twitter:description meta tag.');
  } else if (twitterDescription !== metaDescription) {
    blockingFindings.push('twitter:description must match the meta description.');
  }

  if (ogImage && !twitterImage) {
    blockingFindings.push('twitter:image is required when og:image is present.');
  }

  const imageUrls = [...new Set([ogImage, twitterImage].filter(Boolean))];
  const imageResults = [];
  for (const imageUrl of imageUrls) {
    let imageResult = imageCache.get(imageUrl);
    if (!imageResult) {
      imageResult = await resolveImage(imageUrl, publicAssetState);
      imageCache.set(imageUrl, imageResult);
    }

    imageResults.push({
      tagNames: [
        ogImage === imageUrl ? 'og:image' : null,
        twitterImage === imageUrl ? 'twitter:image' : null
      ].filter(Boolean),
      ...imageResult
    });
    blockingFindings.push(...imageResult.findings);
    warnings.push(...imageResult.warnings);
  }

  return {
    route: routeRecord.route,
    expectedUrl: routeRecord.expectedUrl,
    sources: describeSources(routeRecord),
    builtArtifactPath: inventoryEntry.repoRelativePath,
    result: blockingFindings.length === 0 ? 'pass' : 'fail',
    blockingFindings,
    warnings,
    meta: {
      title,
      metaDescription,
      expectedOgType,
      ogTitle,
      ogDescription,
      ogUrl,
      ogType,
      ogImage,
      twitterCard,
      twitterTitle,
      twitterDescription,
      twitterImage
    },
    images: imageResults
  };
}

function summarizeResults(entries, imageCache) {
  return entries.reduce(
    (summary, entry) => {
      summary.totalRoutes += 1;
      if (entry.result === 'skipped') {
        summary.skippedRoutes += 1;
      } else {
        summary.checkedRoutes += 1;
      }
      summary[entry.result === 'fail' ? 'failCount' : 'passCount'] += entry.result === 'skipped' ? 0 : 1;
      summary.blockingFailures += entry.blockingFindings.length;
      summary.warningCount += entry.warnings.length;
      if (entry.meta?.ogImage) {
        summary.routesWithOgImage += 1;
      }
      if (entry.meta?.twitterImage) {
        summary.routesWithTwitterImage += 1;
      }
      return summary;
    },
    {
      totalRoutes: 0,
      checkedRoutes: 0,
      skippedRoutes: 0,
      passCount: 0,
      failCount: 0,
      blockingFailures: 0,
      warningCount: 0,
      routesWithOgImage: 0,
      routesWithTwitterImage: 0,
      uniqueImageCount: imageCache.size,
      unresolvedImageCount: [...imageCache.values()].filter((entry) => entry.findings.length > 0).length,
      lowDimensionWarnings: [...imageCache.values()].filter((entry) => entry.warnings.some((warning) => warning.includes('1200x630'))).length
    }
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const [sampleMatrixSource, priorityRoutesSource, htmlInventory, publicAssetState] = await Promise.all([
    fs.readFile(options.sampleMatrixPath, 'utf8'),
    fs.readFile(options.priorityRoutesPath, 'utf8'),
    collectHtmlInventory(options.publicRoot),
    collectPublicAssetState(options.publicRoot)
  ]);
  const sampleMatrix = JSON.parse(sampleMatrixSource);
  const priorityRoutes = JSON.parse(priorityRoutesSource);
  const routeRecords = collectValidationRoutes(sampleMatrix, priorityRoutes);
  const imageCache = new Map();
  const contentRouteMetadata = await loadContentRouteMetadata(options.contentRoot);
  const entries = [];

  for (const routeRecord of routeRecords) {
    entries.push(await analyzeRoute(routeRecord, htmlInventory, publicAssetState, imageCache, contentRouteMetadata));
  }

  const imageAudit = [...imageCache.values()].sort((left, right) => left.url.localeCompare(right.url));
  const summary = summarizeResults(entries, imageCache);
  const report = {
    phase: 8,
    ticket: 'RHI-087',
    artifact: 'social-preview-report',
    status: summary.blockingFailures === 0 ? 'pass' : 'fail',
    rcTag: sampleMatrix.rc?.tag ?? null,
    rcSha: sampleMatrix.rc?.commit ?? null,
    generatedAt: new Date().toISOString(),
    publicDir: toRepoRelative(options.publicRoot),
    sampleMatrix: {
      path: toRepoRelative(options.sampleMatrixPath),
      generatedAt: sampleMatrix.generated_at
    },
    priorityRoutes: {
      path: toRepoRelative(options.priorityRoutesPath),
      generatedAt: priorityRoutes.generated_at
    },
    artifactProvenance: getArtifactProvenance(sampleMatrix.rc),
    policy: {
      canonicalHost: canonicalOrigin,
      ogTypeArticle: 'article',
      ogTypeDefault: 'website',
      imageVerificationMode: 'artifact-path',
      imageDimensionSeverity: 'warning-only',
      missingSocialImageSeverity: 'blocking'
    },
    summary,
    imageAudit,
    entries
  };

  await writeJsonReport(options.reportPath, report);

  console.log(`social-preview report written to ${toRepoRelative(options.reportPath)}`);
  console.log(`Routes checked: ${summary.checkedRoutes}`);
  console.log(`Pass routes: ${summary.passCount}`);
  console.log(`Fail routes: ${summary.failCount}`);
  console.log(`Blocking findings: ${summary.blockingFailures}`);
  console.log(`Warnings: ${summary.warningCount}`);

  if (summary.blockingFailures > 0) {
    process.exitCode = 1;
  }
}

await main();