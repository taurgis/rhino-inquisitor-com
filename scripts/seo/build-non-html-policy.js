import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { stringify as stringifyCsv } from 'csv-stringify/sync';
import fg from 'fast-glob';
import matter from 'gray-matter';

import {
  canonicalOrigin,
  loadManifest,
  repoRoot,
  toRepoRelative,
  toPosixPath
} from '../migration/url-validation-helpers.js';

const defaults = {
  manifestPath: path.join(repoRoot, 'migration', 'url-manifest.json'),
  mediaManifestPath: path.join(repoRoot, 'migration', 'intermediate', 'media-manifest.json'),
  contentRoot: path.join(repoRoot, 'src', 'content'),
  publicRoot: path.join(repoRoot, 'public'),
  staticRoot: path.join(repoRoot, 'src', 'static'),
  reportPath: path.join(repoRoot, 'migration', 'reports', 'phase-5-non-html-policy.csv')
};

const feedCompatibilityRoutes = new Set(['/feed/', '/feed/rss/', '/feed/atom/', '/rss/']);
const approvedPdfRedirectTargets = new Map();
const mediaExtensions = new Set([
  'apng',
  'avif',
  'gif',
  'ico',
  'jpeg',
  'jpg',
  'mov',
  'mp3',
  'mp4',
  'm4v',
  'png',
  'svg',
  'wav',
  'webm',
  'webp'
]);

function printHelp() {
  console.log(`Usage: node scripts/seo/build-non-html-policy.js [options]

Options:
  --manifest <path>        Override migration/url-manifest.json path.
  --media-manifest <path>  Override migration/intermediate/media-manifest.json path.
  --content-dir <path>     Override source content root (defaults to src/content).
  --public-dir <path>      Override built public directory (defaults to public).
  --static-dir <path>      Override source static directory (defaults to src/static).
  --report <path>          Override CSV output path.
  --help                   Show this help message.
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
      case '--media-manifest':
        options.mediaManifestPath = path.resolve(argv[++index]);
        break;
      case '--content-dir':
        options.contentRoot = path.resolve(argv[++index]);
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
      case '--help':
        options.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function toComparableUrlKey(value) {
  const url = new URL(value, `${canonicalOrigin}/`);
  return `${url.pathname}${url.search}`.toLowerCase();
}

function toAbsoluteUrl(route) {
  return new URL(route, `${canonicalOrigin}/`).toString();
}

function normalizeExtension(route) {
  const pathname = new URL(toAbsoluteUrl(route)).pathname;
  const extension = path.posix.extname(pathname).toLowerCase().replace(/^\./u, '');
  return extension || null;
}

function determineResourceType(route) {
  if (route === '/rss/' || route === '/feed/' || route.startsWith('/feed/') || route.endsWith('/feed/')) {
    return 'feed';
  }

  const extension = normalizeExtension(route);
  if (extension === 'pdf') {
    return 'pdf';
  }

  if (extension && mediaExtensions.has(extension)) {
    return 'media';
  }

  if (extension === 'css' || extension === 'js' || extension === 'xml' || extension === 'txt') {
    return 'other';
  }

  return 'attachment';
}

function normalizeDisposition(disposition) {
  return disposition === 'merge' ? 'redirect' : disposition;
}

function headerControlPossible(implementationLayer) {
  return implementationLayer === 'edge-cdn' || implementationLayer === 'dns' ? 'yes' : 'no';
}

function targetValue(disposition, targetUrl) {
  return disposition === 'redirect' && targetUrl ? targetUrl : 'null';
}

function createReportRow({
  legacyUrl,
  resourceType,
  disposition,
  targetUrl,
  implementationLayer,
  owner
}) {
  return {
    legacy_url: legacyUrl,
    resource_type: resourceType,
    disposition,
    target_url: targetValue(disposition, targetUrl),
    index_control_needed: 'no',
    implementation_layer: implementationLayer,
    header_control_possible: headerControlPossible(implementationLayer),
    owner
  };
}

async function ensureReadable(filePath) {
  try {
    await access(filePath);
  } catch (error) {
    throw new Error(`Required file is missing: ${toRepoRelative(filePath)}`);
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

async function loadMediaManifest(mediaManifestPath) {
  const manifestSource = await readFile(mediaManifestPath, 'utf8');
  return JSON.parse(manifestSource);
}

function buildMediaRedirectMap(entries) {
  const redirectMap = new Map();

  for (const entry of entries) {
    if (entry?.status !== 'ok' || typeof entry.publicPath !== 'string' || !entry.publicPath.startsWith('/')) {
      continue;
    }

    for (const keyName of ['sourceUrl', 'normalizedSourceUrl', 'canonicalUrl']) {
      const value = entry[keyName];
      if (typeof value !== 'string' || value.trim().length === 0) {
        continue;
      }

      redirectMap.set(toComparableUrlKey(value), entry.publicPath);
    }
  }

  return redirectMap;
}

async function loadContentEntries(contentRoot) {
  const markdownFiles = await fg('**/*.md', {
    cwd: contentRoot,
    onlyFiles: true,
    suppressErrors: true
  });

  return Promise.all(markdownFiles.sort().map(async (relativePath) => {
    const absolutePath = path.join(contentRoot, relativePath);
    const source = await readFile(absolutePath, 'utf8');
    const parsed = matter(source);

    return {
      absolutePath,
      relativePath: toPosixPath(relativePath),
      source,
      lowerSource: source.toLowerCase(),
      url: typeof parsed.data.url === 'string' ? parsed.data.url.trim() : null
    };
  }));
}

function findOwningContentUrl(legacyUrl, contentEntries) {
  const approvedTarget = approvedPdfRedirectTargets.get(legacyUrl);
  if (approvedTarget) {
    return approvedTarget;
  }

  const absoluteLegacy = toAbsoluteUrl(legacyUrl).toLowerCase();
  const legacyPath = new URL(absoluteLegacy).pathname.toLowerCase();
  const legacyBasename = path.posix.basename(legacyPath);

  for (const entry of contentEntries) {
    if (!entry.url) {
      continue;
    }

    if (entry.lowerSource.includes(absoluteLegacy) || entry.lowerSource.includes(legacyBasename)) {
      return entry.url;
    }
  }

  return null;
}

async function collectStaticParity(staticRoot, publicRoot) {
  const staticFiles = await fg('**/*', {
    cwd: staticRoot,
    onlyFiles: true,
    suppressErrors: true
  });
  const missing = [];

  for (const relativePath of staticFiles) {
    const normalizedPath = toPosixPath(relativePath);
    const publicPath = path.join(publicRoot, relativePath);

    try {
      await access(publicPath);
    } catch {
      missing.push(normalizedPath);
    }
  }

  return {
    staticFileCount: staticFiles.length,
    missing
  };
}

async function collectLegacyAttachmentRefs(publicRoot, legacyAttachmentRoutes) {
  const htmlFiles = await fg('**/*.html', {
    cwd: publicRoot,
    onlyFiles: true,
    suppressErrors: true
  });
  const findings = [];
  const attachmentPatterns = legacyAttachmentRoutes.map((route) => ({
    absolute: toAbsoluteUrl(route).toLowerCase(),
    relative: route.toLowerCase()
  }));

  for (const relativePath of htmlFiles) {
    const absolutePath = path.join(publicRoot, relativePath);
    const source = (await readFile(absolutePath, 'utf8')).toLowerCase();
    const matches = new Set();

    for (const pattern of attachmentPatterns) {
      if (source.includes(pattern.absolute) || source.includes(pattern.relative)) {
        matches.add(pattern.relative);
      }
    }

    for (const route of matches) {
      findings.push({
        htmlFile: toPosixPath(relativePath),
        legacyRoute: route
      });
    }
  }

  return findings;
}

function isFeedRow(entry) {
  return entry.legacy_url === '/rss/'
    || entry.legacy_url === '/feed/'
    || entry.legacy_url.startsWith('/feed/')
    || entry.legacy_url.endsWith('/feed/');
}

async function ensureFeedHelpersExist(staticRoot, publicRoot) {
  const requiredRoutes = ['/feed/', '/feed/rss/', '/feed/atom/', '/rss/'];

  for (const route of requiredRoutes) {
    const relativeFile = route === '/feed/'
      ? path.join('feed', 'index.html')
      : path.join(route.replace(/^\//u, ''), 'index.html');

    await ensureReadable(path.join(staticRoot, relativeFile));
    await ensureReadable(path.join(publicRoot, relativeFile));
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  await Promise.all([
    ensureReadable(options.manifestPath),
    ensureReadable(options.mediaManifestPath),
    ensureReadable(options.contentRoot),
    ensureReadable(options.publicRoot),
    ensureReadable(options.staticRoot)
  ]);

  await ensureFeedHelpersExist(options.staticRoot, options.publicRoot);

  const [manifestEntries, mediaEntries, contentEntries, staticParity] = await Promise.all([
    loadManifest(options.manifestPath),
    loadMediaManifest(options.mediaManifestPath),
    loadContentEntries(options.contentRoot),
    collectStaticParity(options.staticRoot, options.publicRoot)
  ]);

  const mediaRedirectMap = buildMediaRedirectMap(mediaEntries);
  const reportRows = [];
  const legacyAttachmentRoutes = [];
  const issues = [];

  for (const entry of manifestEntries) {
    if (entry.url_class !== 'attachment' && !isFeedRow(entry)) {
      continue;
    }

    const resourceType = determineResourceType(entry.legacy_url);

    if (resourceType === 'feed') {
      if (feedCompatibilityRoutes.has(entry.legacy_url)) {
        reportRows.push(createReportRow({
          legacyUrl: entry.legacy_url,
          resourceType,
          disposition: 'redirect',
          targetUrl: '/index.xml',
          implementationLayer: 'pages-static',
          owner: 'seo-owner'
        }));
        continue;
      }

      reportRows.push(createReportRow({
        legacyUrl: entry.legacy_url,
        resourceType,
        disposition: 'retire',
        targetUrl: null,
        implementationLayer: 'none',
        owner: entry.owner
      }));
      continue;
    }

    if (entry.disposition !== 'keep') {
      legacyAttachmentRoutes.push(entry.legacy_url);
    }

    const directMediaTarget = mediaRedirectMap.get(toComparableUrlKey(entry.legacy_url));
    if (typeof directMediaTarget === 'string' && directMediaTarget.startsWith('/')) {
      reportRows.push(createReportRow({
        legacyUrl: entry.legacy_url,
        resourceType,
        disposition: 'redirect',
        targetUrl: directMediaTarget,
        implementationLayer: 'edge-cdn',
        owner: 'engineering-owner'
      }));
      continue;
    }

    if (resourceType === 'pdf' && entry.disposition !== 'keep') {
      const owningContentUrl = findOwningContentUrl(entry.legacy_url, contentEntries);

      if (!owningContentUrl) {
        issues.push(`Missing owning content target for PDF ${entry.legacy_url}`);
        reportRows.push(createReportRow({
          legacyUrl: entry.legacy_url,
          resourceType,
          disposition: 'retire',
          targetUrl: null,
          implementationLayer: 'none',
          owner: entry.owner
        }));
        continue;
      }

      reportRows.push(createReportRow({
        legacyUrl: entry.legacy_url,
        resourceType,
        disposition: 'redirect',
        targetUrl: owningContentUrl,
        implementationLayer: 'edge-cdn',
        owner: 'engineering-owner'
      }));
      continue;
    }

    if (resourceType === 'pdf' && entry.disposition === 'keep') {
      const expectedPublicFile = path.join(options.publicRoot, entry.legacy_url.replace(/^\//u, ''));
      if (!(await fileExists(expectedPublicFile))) {
        issues.push(`Kept PDF is missing from built output: ${entry.legacy_url}`);
      }
    }

    const normalizedDisposition = normalizeDisposition(entry.disposition);
    reportRows.push(createReportRow({
      legacyUrl: entry.legacy_url,
      resourceType,
      disposition: normalizedDisposition,
      targetUrl: normalizedDisposition === 'redirect' ? entry.target_url : null,
      implementationLayer: normalizedDisposition === 'redirect'
        ? (entry.implementation_layer === 'none' ? 'edge-cdn' : entry.implementation_layer)
        : entry.implementation_layer,
      owner: entry.owner
    }));
  }

  for (const syntheticRoute of ['/feed/rss/', '/feed/atom/', '/rss/']) {
    if (reportRows.some((row) => row.legacy_url === syntheticRoute)) {
      continue;
    }

    reportRows.push(createReportRow({
      legacyUrl: syntheticRoute,
      resourceType: 'feed',
      disposition: 'redirect',
      targetUrl: '/index.xml',
      implementationLayer: 'pages-static',
      owner: 'seo-owner'
    }));
  }

  if (staticParity.missing.length > 0) {
    issues.push(`Missing ${staticParity.missing.length} src/static file(s) from the public build.`);
  }

  const lingeringAttachmentRefs = await collectLegacyAttachmentRefs(options.publicRoot, legacyAttachmentRoutes);
  if (lingeringAttachmentRefs.length > 0) {
    issues.push(`Found ${lingeringAttachmentRefs.length} built HTML reference(s) to manifest-tracked legacy attachment URLs.`);
  }

  reportRows.sort((left, right) => left.legacy_url.localeCompare(right.legacy_url));

  await mkdir(path.dirname(options.reportPath), { recursive: true });
  await writeFile(options.reportPath, stringifyCsv(reportRows, {
    header: true,
    columns: [
      'legacy_url',
      'resource_type',
      'disposition',
      'target_url',
      'index_control_needed',
      'implementation_layer',
      'header_control_possible',
      'owner'
    ]
  }));

  const summary = reportRows.reduce((accumulator, row) => {
    const current = accumulator[row.disposition] ?? 0;
    return {
      ...accumulator,
      [row.disposition]: current + 1
    };
  }, {});

  console.log(`Wrote ${reportRows.length} non-HTML policy row(s) to ${toRepoRelative(options.reportPath)}.`);
  console.log(`Disposition summary: ${JSON.stringify(summary)}`);

  if (issues.length > 0) {
    for (const issue of issues) {
      console.error(`ERROR: ${issue}`);
    }

    for (const finding of lingeringAttachmentRefs) {
      console.error(`  ${finding.htmlFile}: ${finding.legacyRoute}`);
    }

    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});