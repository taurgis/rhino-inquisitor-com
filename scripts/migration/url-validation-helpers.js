import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import fg from 'fast-glob';
import matter from 'gray-matter';
import { z } from 'zod';

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const canonicalOrigin = 'https://www.rhino-inquisitor.com';

const priorityOrder = ['critical', 'high', 'medium', 'low'];

const manifestEntrySchema = z.object({
  legacy_url: z.string().trim().min(1),
  disposition: z.enum(['keep', 'merge', 'retire']),
  target_url: z.string().nullable(),
  redirect_code: z.union([z.number().int(), z.null()]),
  reason: z.string().trim().min(1),
  owner: z.string().trim().min(1),
  priority: z.enum(priorityOrder),
  implementation_layer: z.enum(['pages-static', 'edge-cdn', 'dns', 'none']),
  url_class: z.string().trim().min(1),
  source: z.string().trim().min(1),
  has_organic_traffic: z.boolean(),
  has_external_links: z.boolean()
});

const manifestSchema = z.array(manifestEntrySchema);
const pathAliasPattern = /^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)\/$/;
const generatedKeepRoutes = new Set(['/archives/', '/blog/', '/feed/']);

export function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

export function toRepoRelative(filePath) {
  return toPosixPath(path.relative(repoRoot, filePath));
}

export function normalizeUrlLike(value, { allowNull = false } = {}) {
  if (value == null) {
    if (allowNull) {
      return null;
    }

    throw new Error('Expected a URL or site-relative path value.');
  }

  const trimmedValue = String(value).trim();
  if (trimmedValue.length === 0) {
    if (allowNull) {
      return null;
    }

    throw new Error('Expected a URL or site-relative path value.');
  }

  const normalizedInput = trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://')
    ? trimmedValue
    : `${canonicalOrigin}${trimmedValue.startsWith('/') ? trimmedValue : `/${trimmedValue}`}`;
  const parsedUrl = new URL(normalizedInput);
  const pathname = parsedUrl.pathname || '/';
  const search = parsedUrl.search || '';
  const comparablePathOnly = pathname === '/'
    ? '/'
    : pathname.endsWith('/')
      ? pathname
      : `${pathname}/`;

  return {
    absolute: `${parsedUrl.origin}${pathname}${search}`,
    pathname,
    search,
    comparable: `${comparablePathOnly}${search}`,
    comparablePathOnly,
    hasQuery: search.length > 0,
    isHomepage: pathname === '/',
    serverRelative: `${pathname}${search}`
  };
}

export function routeToPublicRelative(routeInfo) {
  if (routeInfo.pathname === '/') {
    return 'index.html';
  }

  const trimmedPathname = routeInfo.pathname.replace(/^\//, '');
  return trimmedPathname.endsWith('/')
    ? `${trimmedPathname}index.html`
    : `${trimmedPathname}/index.html`;
}

export function parseAttributes(tagSource) {
  const attributes = new Map();
  const attributePattern = /([a-zA-Z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;

  for (const match of tagSource.matchAll(attributePattern)) {
    const attributeName = match[1].toLowerCase();
    const attributeValue = match[2] ?? match[3] ?? match[4] ?? '';
    attributes.set(attributeName, attributeValue.trim());
  }

  return attributes;
}

export function extractRedirectDetails(htmlSource) {
  let metaRefreshTarget = null;
  let canonicalTarget = null;

  for (const metaTagMatch of htmlSource.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = parseAttributes(metaTagMatch[0]);
    if ((attributes.get('http-equiv') ?? '').toLowerCase() !== 'refresh') {
      continue;
    }

    const contentValue = attributes.get('content') ?? '';
    const contentMatch = /url\s*=\s*(.+)$/i.exec(contentValue);
    if (!contentMatch) {
      continue;
    }

    metaRefreshTarget = contentMatch[1].trim().replace(/^['"]|['"]$/g, '');
    break;
  }

  for (const linkTagMatch of htmlSource.matchAll(/<link\b[^>]*>/gi)) {
    const attributes = parseAttributes(linkTagMatch[0]);
    const relValue = (attributes.get('rel') ?? '').toLowerCase();
    if (!relValue.split(/\s+/u).includes('canonical')) {
      continue;
    }

    canonicalTarget = attributes.get('href') ?? null;
    if (canonicalTarget) {
      break;
    }
  }

  return {
    isRedirectPage: metaRefreshTarget != null,
    metaRefreshTarget,
    canonicalTarget
  };
}

export function severityForEntry(entry) {
  return entry.priority === 'critical' || entry.has_organic_traffic ? 'critical' : 'warning';
}

export function isGeneratedKeepRoute(entry) {
  return entry.url_class === 'category'
    || entry.url_class === 'system'
    || generatedKeepRoutes.has(entry.target_url ?? '');
}

export function sortManifestEntries(left, right) {
  const priorityDelta = priorityOrder.indexOf(left.priority) - priorityOrder.indexOf(right.priority);
  if (priorityDelta !== 0) {
    return priorityDelta;
  }

  return left.legacy_url.localeCompare(right.legacy_url);
}

export async function loadManifest(manifestPath) {
  const manifestSource = await fs.readFile(manifestPath, 'utf8');
  return manifestSchema.parse(JSON.parse(manifestSource));
}

export async function collectContentState(contentRoot) {
  const markdownFiles = (await fg('**/*.md', {
    cwd: contentRoot,
    onlyFiles: true,
    suppressErrors: true
  })).sort();
  const primaryRoutes = new Map();
  const aliasRoutes = new Map();
  let migrationOwnedMarkdownCount = 0;

  for (const relativePath of markdownFiles) {
    const normalizedPath = toPosixPath(relativePath);
    const absolutePath = path.join(contentRoot, relativePath);
    const parsedFile = matter.read(absolutePath);
    if (parsedFile.data?.scaffoldFixture !== true) {
      migrationOwnedMarkdownCount += 1;
    }

    const info = {
      relativePath: normalizedPath,
      absolutePath,
      url: typeof parsedFile.data.url === 'string' ? parsedFile.data.url.trim() : null,
      aliases: []
    };

    if (info.url) {
      const routeInfo = normalizeUrlLike(info.url);
      const currentRoutes = primaryRoutes.get(routeInfo.comparablePathOnly) ?? [];
      currentRoutes.push(info);
      primaryRoutes.set(routeInfo.comparablePathOnly, currentRoutes);
    }

    if (Array.isArray(parsedFile.data.aliases)) {
      for (const aliasValue of parsedFile.data.aliases) {
        if (typeof aliasValue !== 'string') {
          continue;
        }

        const trimmedAlias = aliasValue.trim();
        if (!pathAliasPattern.test(trimmedAlias)) {
          continue;
        }

        info.aliases.push(trimmedAlias);
        const aliasInfo = normalizeUrlLike(trimmedAlias);
        const currentRoutes = aliasRoutes.get(aliasInfo.comparablePathOnly) ?? [];
        currentRoutes.push(info);
        aliasRoutes.set(aliasInfo.comparablePathOnly, currentRoutes);
      }
    }
  }

  return {
    markdownFileCount: markdownFiles.length,
    migrationOwnedMarkdownCount,
    primaryRoutes,
    aliasRoutes
  };
}

async function collectFileState(root, { ignore = [] } = {}) {
  const files = (await fg('**/*', {
    cwd: root,
    onlyFiles: true,
    dot: true,
    ignore,
    suppressErrors: true
  })).sort();
  const fileRoutes = new Map();

  for (const relativePath of files) {
    const normalizedPath = toPosixPath(relativePath);
    const routeInfo = normalizeUrlLike(`/${normalizedPath}`);

    fileRoutes.set(routeInfo.pathname, {
      relativePath: normalizedPath,
      absolutePath: path.join(root, relativePath)
    });
  }

  return {
    fileCount: files.length,
    fileRoutes
  };
}

export async function collectStaticFileState(staticRoot) {
  const state = await collectFileState(staticRoot);

  return {
    staticFileCount: state.fileCount,
    staticRoutes: state.fileRoutes
  };
}

export async function collectPublicHtmlState(publicRoot) {
  const htmlFiles = (await fg('**/*.html', {
    cwd: publicRoot,
    onlyFiles: true,
    suppressErrors: true
  })).sort();
  const htmlRoutes = new Map();

  for (const relativePath of htmlFiles) {
    const normalizedPath = toPosixPath(relativePath);
    let route = '/';
    if (normalizedPath !== 'index.html') {
      route = normalizedPath.endsWith('/index.html')
        ? `/${normalizedPath.slice(0, -'index.html'.length)}`
        : `/${normalizedPath}`;
    }

    const routeInfo = normalizeUrlLike(route);
    htmlRoutes.set(routeInfo.comparablePathOnly, {
      relativePath: normalizedPath,
      absolutePath: path.join(publicRoot, relativePath)
    });
  }

  return {
    publicFileCount: htmlFiles.length,
    htmlRoutes
  };
}

export async function collectPublicAssetState(publicRoot) {
  const state = await collectFileState(publicRoot, { ignore: ['**/*.html'] });

  return {
    publicAssetCount: state.fileCount,
    assetRoutes: state.fileRoutes
  };
}

export async function readRedirectHtml(descriptor) {
  if (!descriptor) {
    return null;
  }

  const htmlSource = typeof descriptor.body === 'string'
    ? descriptor.body
    : await fs.readFile(descriptor.absolutePath, 'utf8');
  return {
    ...descriptor,
    ...extractRedirectDetails(htmlSource)
  };
}

export function parseCommonArgs(argv, defaults) {
  const options = {
    manifestPath: defaults.manifestPath,
    contentRoot: defaults.contentRoot,
    staticRoot: defaults.staticRoot ?? null,
    publicRoot: defaults.publicRoot,
    reportPath: defaults.reportPath,
    baseUrl: defaults.baseUrl ?? null,
    recordsPath: defaults.recordsPath ?? null,
    scope: defaults.scope ?? 'full-manifest'
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case '--manifest':
        options.manifestPath = path.resolve(argv[++index]);
        break;
      case '--content-dir':
        options.contentRoot = path.resolve(argv[++index]);
        break;
      case '--static-dir':
        options.staticRoot = path.resolve(argv[++index]);
        break;
      case '--public-dir':
        options.publicRoot = path.resolve(argv[++index]);
        break;
      case '--report':
        options.reportPath = path.resolve(argv[++index]);
        break;
      case '--base-url':
        options.baseUrl = argv[++index].trim();
        break;
      case '--records-file':
        options.recordsPath = path.resolve(argv[++index]);
        break;
      case '--scope': {
        const scope = argv[++index].trim();
        if (!['full-manifest', 'selected-records'].includes(scope)) {
          throw new Error(`Unknown validation scope: ${scope}`);
        }
        options.scope = scope;
        break;
      }
      case '--help':
        options.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

export function ensureExpectedTarget(entry) {
  if (entry.disposition === 'retire') {
    return null;
  }

  return normalizeUrlLike(entry.target_url);
}

export function isApprovedFeedCompatibilityTarget(entry, actualTarget, expectedTarget) {
  const routeClass = entry.url_class ?? entry.route_class;

  return routeClass === 'system'
    && expectedTarget.pathname === '/feed/'
    && (actualTarget.pathname === '/feed/' || actualTarget.pathname === '/index.xml');
}

export function matchesExpectedMergeTarget(entry, actualTarget, expectedTarget) {
  return actualTarget.comparable === expectedTarget.comparable
    || isApprovedFeedCompatibilityTarget(entry, actualTarget, expectedTarget);
}

export function isStaticAssetRoute(routeInfo) {
  return routeInfo.pathname !== '/' && path.extname(routeInfo.pathname).length > 0;
}

export function resolveManifestChains(manifestEntries) {
  return new Map(manifestEntries.map((entry) => [normalizeUrlLike(entry.legacy_url).comparable, entry]));
}