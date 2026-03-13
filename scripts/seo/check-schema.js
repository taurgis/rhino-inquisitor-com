import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { load as loadHtml } from 'cheerio';
import { stringify as stringifyCsv } from 'csv-stringify/sync';
import fg from 'fast-glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const canonicalHost = 'https://www.rhino-inquisitor.com';

const defaults = {
  publicDir: path.join(repoRoot, 'public'),
  reportPath: path.join(repoRoot, 'migration', 'reports', 'phase-5-schema-audit.csv')
};

function printHelp() {
  console.log(`Usage: node scripts/seo/check-schema.js [options]

Options:
  --public-dir <path>  Override built public directory (defaults to public).
  --report <path>      Override audit CSV path.
  --help               Show this help message.
`);
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
      case '--help':
        options.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function routeFromHtmlPath(publicDir, filePath) {
  const relativePath = toPosixPath(path.relative(publicDir, filePath));

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

function normalizeRoute(route) {
  if (route === '/' || route === '/404.html') {
    return route;
  }

  return route.endsWith('/') ? route : `${route}/`;
}

function normalizeText(value) {
  return String(value ?? '')
    .replace(/\s+/gu, ' ')
    .replace(/[“”]/gu, '"')
    .replace(/[‘’]/gu, "'")
    .trim()
    .toLowerCase();
}

function normalizeTitleCandidate(value) {
  const normalized = String(value ?? '').replace(/\s+/gu, ' ').trim();
  return normalized.replace(/\s*\|\s*Rhino Inquisitor$/u, '').trim();
}

function hasMetaRefresh($) {
  return $('meta[http-equiv]').toArray().some((element) => {
    const value = ($(element).attr('http-equiv') ?? '').toLowerCase();
    return value === 'refresh';
  });
}

function classifyTemplateFamily(route, $) {
  if (route === '/') {
    return 'homepage';
  }

  if (route === '/404.html') {
    return '404';
  }

  if (hasMetaRefresh($)) {
    return 'redirect-helper';
  }

  if (/\/page\/\d+\/$/u.test(route)) {
    return 'pagination';
  }

  if (route === '/posts/' || route === '/pages/') {
    return 'list';
  }

  if (route === '/category/') {
    return 'taxonomy';
  }

  if (route.startsWith('/category/')) {
    return 'term';
  }

  if (($('meta[property="og:type"]').attr('content') ?? '').trim() === 'article') {
    return 'article';
  }

  return 'page';
}

function parseJsonLdBlocks(html) {
  const blocks = [];
  const pattern = /<script[^>]+type=(?:["']application\/ld\+json["']|application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/giu;

  for (const match of html.matchAll(pattern)) {
    const raw = match[1]?.trim() ?? '';
    if (!raw) {
      continue;
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      throw new Error(`Invalid JSON-LD: ${error.message}`);
    }

    blocks.push({ raw, parsed });
  }

  return blocks;
}

function flattenJsonLdNodes(value) {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => flattenJsonLdNodes(entry));
  }

  if (!value || typeof value !== 'object') {
    return [];
  }

  const nodes = [];
  if ('@type' in value) {
    nodes.push(value);
  }

  if (Array.isArray(value['@graph'])) {
    nodes.push(...flattenJsonLdNodes(value['@graph']));
  }

  return nodes;
}

function getSchemaTypes(nodes) {
  return [...new Set(nodes.flatMap((node) => [node?.['@type']].flat().filter(Boolean)))];
}

function findSchemaNodes(nodes, schemaType) {
  return nodes.filter((node) => [node?.['@type']].flat().includes(schemaType));
}

function isIso8601WithTimezone(value) {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/u.test(value)
    && !Number.isNaN(Date.parse(value));
}

function hasTemplateLeak(value) {
  if (typeof value === 'string') {
    return value.includes('{{');
  }

  if (Array.isArray(value)) {
    return value.some((entry) => hasTemplateLeak(entry));
  }

  if (value && typeof value === 'object') {
    return Object.values(value).some((entry) => hasTemplateLeak(entry));
  }

  return false;
}

function validateAbsoluteHost(value, field, failures) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return;
  }

  if (!/^https?:\/\//u.test(value)) {
    return;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(value);
  } catch {
    failures.push(`${field} is not a valid absolute URL (${value})`);
    return;
  }

  if (`${parsedUrl.protocol}//${parsedUrl.host}` !== canonicalHost) {
    failures.push(`${field} host mismatch (${value})`);
  }
}

function validateWebsiteSchema(nodes, route, failures) {
  const websiteNodes = findSchemaNodes(nodes, 'WebSite');

  if (route === '/') {
    if (websiteNodes.length !== 1) {
      failures.push(`expected exactly one WebSite schema on homepage, found ${websiteNodes.length}`);
      return;
    }
  } else if (websiteNodes.length > 0) {
    failures.push('WebSite schema emitted on a non-homepage route');
    return;
  } else {
    return;
  }

  const websiteSchema = websiteNodes[0];
  if (!websiteSchema.name) {
    failures.push('WebSite schema is missing name');
  }
  if (!websiteSchema.url) {
    failures.push('WebSite schema is missing url');
  }
  validateAbsoluteHost(websiteSchema.url, 'WebSite.url', failures);
}

function validateArticleSchema(nodes, route, canonical, h1, titleText, family, failures) {
  const articleNodes = [
    ...findSchemaNodes(nodes, 'BlogPosting'),
    ...findSchemaNodes(nodes, 'Article')
  ];

  const isArticleFamily = family === 'article';

  if (!isArticleFamily) {
    if (articleNodes.length > 0) {
      failures.push('BlogPosting/Article schema emitted on a non-article route');
    }
    return;
  }

  if (articleNodes.length !== 1) {
    failures.push(`expected exactly one BlogPosting/Article schema on article route, found ${articleNodes.length}`);
    return;
  }

  const articleSchema = articleNodes[0];
  const headline = String(articleSchema.headline ?? '').trim();
  const normalizedHeadline = normalizeText(headline);
  const normalizedH1 = normalizeText(h1);
  const normalizedTitle = normalizeText(normalizeTitleCandidate(titleText));

  if (!headline) {
    failures.push('BlogPosting/Article schema is missing headline');
  }
  if (!articleSchema.url) {
    failures.push('BlogPosting/Article schema is missing url');
  }
  if (!articleSchema.description) {
    failures.push('BlogPosting/Article schema is missing description');
  }
  if (!articleSchema.datePublished) {
    failures.push('BlogPosting/Article schema is missing datePublished');
  }
  if (!articleSchema.dateModified) {
    failures.push('BlogPosting/Article schema is missing dateModified');
  }
  if (!isIso8601WithTimezone(articleSchema.datePublished)) {
    failures.push('BlogPosting/Article datePublished is not ISO 8601 with timezone');
  }
  if (!isIso8601WithTimezone(articleSchema.dateModified)) {
    failures.push('BlogPosting/Article dateModified is not ISO 8601 with timezone');
  }
  if (articleSchema.url && articleSchema.url !== canonical) {
    failures.push(`BlogPosting/Article url does not match canonical (${articleSchema.url} != ${canonical})`);
  }
  validateAbsoluteHost(articleSchema.url, 'BlogPosting/Article.url', failures);

  const author = articleSchema.author;
  if (!author || Array.isArray(author) || typeof author !== 'object') {
    failures.push('BlogPosting/Article author is not an object');
  } else {
    if (!author['@type']) {
      failures.push('BlogPosting/Article author is missing @type');
    }
    if (!author.name) {
      failures.push('BlogPosting/Article author is missing name');
    }
  }

  if (!normalizedHeadline || !(normalizedHeadline === normalizedH1 || normalizedHeadline === normalizedTitle)) {
    failures.push('BlogPosting/Article headline does not match the visible page title or h1');
  }

  const mainEntityId = articleSchema.mainEntityOfPage?.['@id'];
  if (mainEntityId && mainEntityId !== canonical) {
    failures.push(`BlogPosting/Article mainEntityOfPage.@id does not match canonical (${mainEntityId} != ${canonical})`);
  }
  validateAbsoluteHost(mainEntityId, 'BlogPosting/Article.mainEntityOfPage.@id', failures);
}

function validateBreadcrumbSchema(nodes, family, breadcrumbLabels, failures) {
  const breadcrumbNodes = findSchemaNodes(nodes, 'BreadcrumbList');
  const expectsBreadcrumb = breadcrumbLabels.length > 1;

  if (!expectsBreadcrumb) {
    if (breadcrumbNodes.length > 0) {
      failures.push('BreadcrumbList schema emitted without a visible breadcrumb trail');
    }
    return;
  }

  if (breadcrumbNodes.length !== 1) {
    failures.push(`expected exactly one BreadcrumbList schema when breadcrumbs are visible, found ${breadcrumbNodes.length}`);
    return;
  }

  const breadcrumbSchema = breadcrumbNodes[0];
  const items = Array.isArray(breadcrumbSchema.itemListElement) ? breadcrumbSchema.itemListElement : [];

  if (items.length < 2) {
    failures.push('BreadcrumbList schema has fewer than two ListItem entries');
    return;
  }

  items.forEach((item, index) => {
    if (item?.['@type'] !== 'ListItem') {
      failures.push(`BreadcrumbList item ${index + 1} is missing @type ListItem`);
    }

    if (item?.position !== index + 1) {
      failures.push(`BreadcrumbList item ${index + 1} has unexpected position (${item?.position ?? 'missing'})`);
    }

    if (!item?.name) {
      failures.push(`BreadcrumbList item ${index + 1} is missing name`);
    }

    validateAbsoluteHost(item?.item, `BreadcrumbList.itemListElement[${index + 1}].item`, failures);
  });

  const schemaLabels = items.map((item) => normalizeText(item?.name));
  const normalizedBreadcrumbLabels = breadcrumbLabels.map((label) => normalizeText(label));
  if (schemaLabels.length !== normalizedBreadcrumbLabels.length) {
    failures.push('BreadcrumbList item count does not match the visible breadcrumb trail');
    return;
  }

  for (let index = 0; index < schemaLabels.length; index += 1) {
    if (schemaLabels[index] !== normalizedBreadcrumbLabels[index]) {
      failures.push(`BreadcrumbList label mismatch at position ${index + 1}`);
      break;
    }
  }

  if (family === 'redirect-helper') {
    failures.push('BreadcrumbList schema emitted on redirect helper page');
  }
}

function validateVideoSchema(nodes, videoEligible, failures) {
  const videoNodes = findSchemaNodes(nodes, 'VideoObject');

  if (!videoEligible) {
    if (videoNodes.length > 0) {
      failures.push('VideoObject schema emitted on a page without a qualifying on-page video surface');
    }
    return;
  }

  if (videoNodes.length === 0) {
    failures.push('missing VideoObject schema on a page with a qualifying on-page video surface');
    return;
  }

  for (const videoNode of videoNodes) {
    for (const field of ['name', 'description', 'thumbnailUrl', 'uploadDate']) {
      if (typeof videoNode?.[field] !== 'string' || videoNode[field].trim().length === 0) {
        failures.push(`VideoObject schema is missing ${field}`);
      }
    }
  }
}

function createRow(route, filePath, family, schemaTypes, videoEligible, failures) {
  return {
    route,
    file_path: filePath,
    template_family: family,
    schema_types: schemaTypes.join('|'),
    video_eligible: videoEligible ? 'yes' : 'no',
    status: failures.length === 0 ? 'pass' : 'fail',
    severity: failures.length === 0 ? 'none' : 'critical',
    findings: failures.join(' | ')
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const htmlFiles = await fg('**/*.html', {
    cwd: options.publicDir,
    absolute: true,
    dot: true
  });

  if (htmlFiles.length === 0) {
    throw new Error(`No built HTML files found under ${path.relative(repoRoot, options.publicDir)}. Run a production build first.`);
  }

  const rows = [];
  const blockingMessages = [];

  for (const htmlFile of htmlFiles.sort()) {
    const html = await readFile(htmlFile, 'utf8');
    const $ = loadHtml(html);
    const route = normalizeRoute(routeFromHtmlPath(options.publicDir, htmlFile));
    const family = classifyTemplateFamily(route, $);
    const canonical = ($('link[rel="canonical"]').attr('href') ?? '').trim();
    const h1 = $('h1').first().text().trim();
    const titleText = $('title').first().text().trim();
    const breadcrumbLabels = $('nav.breadcrumbs li').toArray().map((element) => $(element).text().trim()).filter(Boolean);
    const videoEligible = $('iframe[src*="youtube.com"], iframe[src*="youtube-nocookie.com"], video, lite-youtube').length > 0;

    const failures = [];
    let schemaTypes = [];

    let blocks = [];
    try {
      blocks = parseJsonLdBlocks(html);
    } catch (error) {
      failures.push(error.message);
    }

    const nodes = blocks.flatMap((block) => flattenJsonLdNodes(block.parsed));
    schemaTypes = getSchemaTypes(nodes);

    for (const block of blocks) {
      if (block.raw.includes('{{')) {
        failures.push('JSON-LD output contains raw Hugo template expressions');
        break;
      }
    }

    if (hasTemplateLeak(nodes)) {
      failures.push('JSON-LD values contain raw Hugo template expressions');
    }

    validateWebsiteSchema(nodes, route, failures);
    validateArticleSchema(nodes, route, canonical, h1, titleText, family, failures);
    validateBreadcrumbSchema(nodes, family, breadcrumbLabels, failures);
    validateVideoSchema(nodes, videoEligible, failures);

    const row = createRow(
      route,
      toPosixPath(path.relative(repoRoot, htmlFile)),
      family,
      schemaTypes,
      videoEligible,
      failures
    );
    rows.push(row);

    if (row.status === 'fail') {
      blockingMessages.push(`${route}: ${row.findings}`);
    }
  }

  await mkdir(path.dirname(options.reportPath), { recursive: true });
  await writeFile(
    options.reportPath,
    `${stringifyCsv(rows, {
      header: true,
      columns: [
        'route',
        'file_path',
        'template_family',
        'schema_types',
        'video_eligible',
        'status',
        'severity',
        'findings'
      ]
    })}\n`,
    'utf8'
  );

  if (blockingMessages.length > 0) {
    console.error('Schema validation failed:\n');
    for (const message of blockingMessages) {
      console.error(`- ${message}`);
    }
    console.error(`\nReport written to ${path.relative(repoRoot, options.reportPath)}.`);
    process.exitCode = 1;
    return;
  }

  console.log(`Schema validation passed for ${rows.length} built HTML page(s).`);
  console.log(`Report written to ${path.relative(repoRoot, options.reportPath)}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});