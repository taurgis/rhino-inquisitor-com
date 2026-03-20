import fs from 'node:fs/promises';
import path from 'node:path';
import { isUtf8 } from 'node:buffer';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { load as loadHtml } from 'cheerio';
import fg from 'fast-glob';
import matter from 'gray-matter';
import { XMLParser } from 'fast-xml-parser';

import { canonicalOrigin, toRepoRelative } from '../migration/url-validation-helpers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

export const phase8SeoDefaults = {
  publicRoot: path.join(repoRoot, 'public'),
  contentRoot: path.join(repoRoot, 'src', 'content'),
  sampleMatrixPath: path.join(repoRoot, 'validation', 'sample-matrix.json'),
  priorityRoutesPath: path.join(repoRoot, 'validation', 'priority-routes.json'),
  seoConsistencyReportPath: path.join(repoRoot, 'validation', 'seo-consistency-report.json'),
  robotsSitemapReportPath: path.join(repoRoot, 'validation', 'robots-sitemap-report.json')
};

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  trimValues: true
});

export function arrayify(value) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

export function normalizeRoute(route) {
  if (!route || route === '/') {
    return '/';
  }

  if (route === '/404.html') {
    return route;
  }

  if (/\.[a-z0-9]+$/iu.test(route)) {
    return route;
  }

  return route.endsWith('/') ? route : `${route}/`;
}

export function normalizeRouteLike(value) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  const trimmed = value.trim();
  const parsed = trimmed.startsWith('http://') || trimmed.startsWith('https://')
    ? new URL(trimmed)
    : new URL(trimmed.startsWith('/') ? trimmed : `/${trimmed}`, `${canonicalOrigin}/`);

  return normalizeRoute(parsed.pathname);
}

export function routeFromHtmlPath(filePath, publicRoot) {
  const relativePath = path.relative(publicRoot, filePath).split(path.sep).join('/');

  if (relativePath === 'index.html') {
    return '/';
  }

  if (relativePath === '404.html') {
    return '/404.html';
  }

  if (relativePath.endsWith('/index.html')) {
    return `/${relativePath.slice(0, -'index.html'.length)}`;
  }

  return `/${relativePath}`;
}

export function toAbsoluteUrl(route) {
  return new URL(route, `${canonicalOrigin}/`).toString();
}

export async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function writeJsonReport(reportPath, report) {
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

function runGit(args) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore']
  }).trim();
}

export function getArtifactProvenance(datasetRc = {}) {
  try {
    const currentHead = runGit(['rev-parse', 'HEAD']);
    const workspaceDirty = runGit(['status', '--short']).length > 0;
    const matchesDatasetRc = typeof datasetRc.commit === 'string'
      && datasetRc.commit.length > 0
      && currentHead === datasetRc.commit
      && workspaceDirty === false;

    return {
      gitHead: currentHead,
      gitHeadShort: currentHead.slice(0, 8),
      workspaceDirty,
      datasetRcTag: datasetRc.tag ?? null,
      datasetRcSha: datasetRc.commit ?? null,
      matchesDatasetRc,
      provenanceStatus: matchesDatasetRc ? 'frozen-rc' : 'branch-state',
      note: matchesDatasetRc
        ? 'Artifact provenance matches the frozen dataset RC commit and the workspace is clean.'
        : 'Artifact provenance differs from the frozen dataset RC or the workspace is dirty; treat this as branch-state evidence until a new RC is cut.'
    };
  } catch {
    return {
      gitHead: null,
      gitHeadShort: null,
      workspaceDirty: null,
      datasetRcTag: datasetRc.tag ?? null,
      datasetRcSha: datasetRc.commit ?? null,
      matchesDatasetRc: false,
      provenanceStatus: 'unknown',
      note: 'Git provenance could not be resolved for this artifact run.'
    };
  }
}

export function readMetaContent($, attributeName, attributeValue) {
  const match = $('meta').toArray().find((element) => {
    const candidate = ($(element).attr(attributeName) ?? '').trim().toLowerCase();
    return candidate === attributeValue;
  });

  return match ? ($(match).attr('content') ?? '').trim() : '';
}

export function readRobotsTokens($) {
  const content = [
    readMetaContent($, 'name', 'robots'),
    readMetaContent($, 'name', 'googlebot')
  ]
    .join(',')
    .toLowerCase();

  return new Set(
    content
      .split(/[\s,]+/u)
      .map((token) => token.trim())
      .filter(Boolean)
  );
}

export function getCanonicalLinks($) {
  return $('link[rel]').filter((_, element) => {
    const relTokens = ($(element).attr('rel') ?? '')
      .trim()
      .toLowerCase()
      .split(/\s+/u)
      .filter(Boolean);
    return relTokens.includes('canonical');
  });
}

export function isAliasHelperPage($) {
  return $('meta[http-equiv]').toArray().some((element) => {
    const httpEquiv = ($(element).attr('http-equiv') ?? '').trim().toLowerCase();
    return httpEquiv === 'refresh';
  });
}

export function isPaginationRoute(route) {
  return /\/page\/\d+\/$/u.test(route);
}

export async function collectHtmlInventory(publicRoot) {
  const htmlFiles = await fg('**/*.html', {
    cwd: publicRoot,
    absolute: true,
    dot: true,
    suppressErrors: true
  });
  const inventory = new Map();

  for (const htmlFile of htmlFiles.sort()) {
    const route = normalizeRoute(routeFromHtmlPath(htmlFile, publicRoot));
    inventory.set(route, {
      route,
      filePath: htmlFile,
      repoRelativePath: toRepoRelative(htmlFile)
    });
  }

  return inventory;
}

export async function loadFrontMatterNoindexRoutes(contentRoot) {
  const markdownFiles = await fg('**/*.md', {
    cwd: contentRoot,
    absolute: true,
    onlyFiles: true,
    suppressErrors: true
  });
  const routes = new Set();
  const details = [];

  for (const markdownFile of markdownFiles.sort()) {
    const source = await fs.readFile(markdownFile, 'utf8');
    const parsed = matter(source);

    if (parsed.data?.seo?.noindex !== true) {
      continue;
    }

    const route = normalizeRouteLike(parsed.data?.url);
    if (!route) {
      continue;
    }

    routes.add(route);
    details.push({
      route,
      contentPath: toRepoRelative(markdownFile)
    });
  }

  return {
    routes,
    details
  };
}

function stripInlineComment(line) {
  const hashIndex = line.indexOf('#');
  return (hashIndex === -1 ? line : line.slice(0, hashIndex)).trim();
}

export function parseRobotsFile(source) {
  const groups = [];
  const sitemapDirectives = [];
  let currentAgents = [];
  let currentRules = [];

  const flushGroup = () => {
    if (currentAgents.length === 0) {
      return;
    }

    groups.push({
      agents: [...currentAgents],
      rules: [...currentRules]
    });
    currentAgents = [];
    currentRules = [];
  };

  for (const rawLine of source.split(/\r?\n/u)) {
    const line = stripInlineComment(rawLine);
    if (!line) {
      continue;
    }

    const match = /^([^:]+):\s*(.*)$/u.exec(line);
    if (!match) {
      continue;
    }

    const directive = match[1].trim().toLowerCase();
    const value = match[2].trim();

    if (directive === 'user-agent') {
      if (currentRules.length > 0) {
        flushGroup();
      }
      currentAgents.push(value.toLowerCase());
      continue;
    }

    if (directive === 'allow' || directive === 'disallow') {
      if (currentAgents.length === 0) {
        continue;
      }

      currentRules.push({ directive, value });
      continue;
    }

    if (directive === 'sitemap') {
      sitemapDirectives.push(value);
    }
  }

  flushGroup();

  const wildcardGroup = groups.find((group) => group.agents.includes('*'));
  return {
    groups,
    wildcardRules: wildcardGroup?.rules ?? [],
    sitemapDirectives
  };
}

export function resolveRobotsRule(pathname, rules) {
  let bestRule = null;

  for (const rule of rules) {
    if (!rule.value) {
      continue;
    }

    if (!pathname.startsWith(rule.value)) {
      continue;
    }

    const candidateLength = rule.value.length;
    const currentLength = bestRule?.value.length ?? -1;
    const sameLengthAllowWins = candidateLength === currentLength
      && rule.directive === 'allow'
      && bestRule?.directive === 'disallow';

    if (candidateLength > currentLength || sameLengthAllowWins) {
      bestRule = rule;
    }
  }

  return {
    matchedRule: bestRule,
    blocked: bestRule?.directive === 'disallow'
  };
}

export function isIso8601(value) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/u.test(value)
    && !Number.isNaN(Date.parse(value));
}

function toLocalSitemapPath(loc, publicRoot) {
  try {
    const parsed = new URL(loc);
    return path.join(publicRoot, parsed.pathname.replace(/^\//u, ''));
  } catch {
    return null;
  }
}

async function loadSitemapFile(filePath, publicRoot, seenPaths) {
  const resolvedPath = path.resolve(filePath);
  if (seenPaths.has(resolvedPath)) {
    return {
      documents: [],
      urlEntries: [],
      unresolvedChildren: []
    };
  }

  seenPaths.add(resolvedPath);

  const buffer = await fs.readFile(resolvedPath);
  const xmlSource = buffer.toString('utf8');
  const parsed = xmlParser.parse(xmlSource);

  const documents = [];
  const urlEntries = [];
  const unresolvedChildren = [];

  if (parsed.urlset?.url) {
    const urls = arrayify(parsed.urlset.url).map((entry) => ({
      loc: typeof entry.loc === 'string' ? entry.loc.trim() : '',
      lastmod: typeof entry.lastmod === 'string' ? entry.lastmod.trim() : '',
      sourceFile: toRepoRelative(resolvedPath)
    }));

    documents.push({
      path: toRepoRelative(resolvedPath),
      type: 'urlset',
      utf8: isUtf8(buffer),
      byteSize: buffer.length,
      urlCount: urls.length
    });
    urlEntries.push(...urls);

    return {
      documents,
      urlEntries,
      unresolvedChildren
    };
  }

  if (parsed.sitemapindex?.sitemap) {
    const sitemapRefs = arrayify(parsed.sitemapindex.sitemap);
    documents.push({
      path: toRepoRelative(resolvedPath),
      type: 'sitemapindex',
      utf8: isUtf8(buffer),
      byteSize: buffer.length,
      urlCount: sitemapRefs.length
    });

    for (const ref of sitemapRefs) {
      const loc = typeof ref.loc === 'string' ? ref.loc.trim() : '';
      const childPath = loc ? toLocalSitemapPath(loc, publicRoot) : null;
      if (!childPath || !(await fileExists(childPath))) {
        unresolvedChildren.push({
          loc,
          reason: 'Referenced sitemap file is not present in public/.'
        });
        continue;
      }

      const child = await loadSitemapFile(childPath, publicRoot, seenPaths);
      documents.push(...child.documents);
      urlEntries.push(...child.urlEntries);
      unresolvedChildren.push(...child.unresolvedChildren);
    }

    return {
      documents,
      urlEntries,
      unresolvedChildren
    };
  }

  throw new Error(`Unsupported sitemap structure in ${toRepoRelative(resolvedPath)}.`);
}

export async function loadSitemapCollection(publicRoot, explicitSitemapPath = '') {
  const candidatePaths = explicitSitemapPath
    ? [path.resolve(explicitSitemapPath)]
    : [
      path.join(publicRoot, 'sitemap.xml'),
      path.join(publicRoot, 'sitemap_index.xml')
    ];
  let rootPath = null;

  for (const candidate of candidatePaths) {
    if (await fileExists(candidate)) {
      rootPath = candidate;
      break;
    }
  }

  if (!rootPath) {
    throw new Error(`No sitemap.xml or sitemap_index.xml found under ${toRepoRelative(publicRoot)}.`);
  }

  const collection = await loadSitemapFile(rootPath, publicRoot, new Set());
  const routes = new Map();

  for (const entry of collection.urlEntries) {
    try {
      const parsed = new URL(entry.loc);
      routes.set(normalizeRoute(parsed.pathname), entry);
    } catch {
      // Keep invalid locs only in the raw urlEntries list.
    }
  }

  return {
    rootPath,
    documents: collection.documents,
    urlEntries: collection.urlEntries,
    routes,
    unresolvedChildren: collection.unresolvedChildren
  };
}

export async function readHtmlPage(filePath) {
  const htmlSource = await fs.readFile(filePath, 'utf8');
  return {
    htmlSource,
    $: loadHtml(htmlSource)
  };
}