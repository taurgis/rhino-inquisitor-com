import fs from 'node:fs/promises';
import path from 'node:path';

import { load as loadHtml } from 'cheerio';
import { stringify as stringifyCsv } from 'csv-stringify/sync';
import fg from 'fast-glob';
import { XMLParser } from 'fast-xml-parser';

import {
  canonicalOrigin,
  extractRedirectDetails,
  repoRoot,
  toRepoRelative
} from '../migration/url-validation-helpers.js';

const defaults = {
  publicRoot: path.join(repoRoot, 'public'),
  sitemapPath: path.join(repoRoot, 'public/sitemap.xml'),
  baseUrl: `${canonicalOrigin}/`,
  reportPath: path.join(repoRoot, 'migration/reports/phase-6-canonical-alignment.csv')
};

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  trimValues: true,
  removeNSPrefix: true
});

function parseArgs(argv) {
  const options = { ...defaults, ci: false, help: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--public-dir') {
      options.publicRoot = path.resolve(argv[index + 1]);
      options.sitemapPath = path.join(options.publicRoot, 'sitemap.xml');
      index += 1;
      continue;
    }

    if (arg === '--sitemap') {
      options.sitemapPath = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--base-url') {
      options.baseUrl = argv[index + 1].trim();
      index += 1;
      continue;
    }

    if (arg === '--report') {
      options.reportPath = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--ci') {
      options.ci = true;
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

function printHelp() {
  console.log(`Usage: node scripts/phase-6/generate-canonical-alignment-report.js [options]

Options:
  --public-dir <path>  Override the built public directory.
  --sitemap <path>     Override the sitemap entry path.
  --base-url <url>     Override the expected production base URL.
  --report <path>      Override the canonical alignment CSV path.
  --ci                 Keep output concise for CI.
  --help               Show this help message.
`);
}

function arrayify(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value == null) {
    return [];
  }

  return [value];
}

function normalizeRoute(route) {
  if (!route || route === '/') {
    return '/';
  }

  if (route === '/404.html' || route.endsWith('.xml')) {
    return route;
  }

  return route.endsWith('/') ? route : `${route}/`;
}

function routeFromHtmlPath(publicRoot, htmlFile) {
  const relativePath = path.relative(publicRoot, htmlFile).replace(/\\/g, '/');

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

function toAbsoluteUrl(route, baseUrl) {
  return new URL(route, baseUrl).toString();
}

function readCanonical($, baseUrl) {
  const link = $('link[rel]').filter((_, element) => {
    const rel = ($(element).attr('rel') ?? '').toLowerCase().split(/\s+/u).filter(Boolean);
    return rel.includes('canonical');
  }).first();

  const href = link.attr('href')?.trim() ?? '';
  if (!href) {
    return '';
  }

  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return href;
  }
}

function isIndexable(route, $, redirectDetails) {
  if (route === '/404.html') {
    return false;
  }

  if (redirectDetails.isRedirectPage) {
    return false;
  }

  const robots = ($('meta[name="robots"]').attr('content') ?? '').toLowerCase();
  return !robots.includes('noindex');
}

async function collectSitemapEntries(publicRoot, sitemapFilePath, visited = new Set()) {
  const resolvedPath = path.resolve(sitemapFilePath);
  if (visited.has(resolvedPath)) {
    return [];
  }

  visited.add(resolvedPath);

  const source = await fs.readFile(resolvedPath, 'utf8');
  const parsed = xmlParser.parse(source);
  const urls = [];

  for (const node of arrayify(parsed?.urlset?.url)) {
    if (typeof node?.loc === 'string' && node.loc.trim().length > 0) {
      urls.push(node.loc.trim());
    }
  }

  for (const node of arrayify(parsed?.sitemapindex?.sitemap)) {
    if (typeof node?.loc !== 'string' || node.loc.trim().length === 0) {
      continue;
    }

    const childUrl = new URL(node.loc.trim());
    const childPath = path.join(publicRoot, childUrl.pathname.replace(/^\//, ''));
    urls.push(...await collectSitemapEntries(publicRoot, childPath, visited));
  }

  return urls;
}

async function writeReport(reportPath, rows) {
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(
    reportPath,
    stringifyCsv(rows, {
      header: true,
      columns: [
        'url',
        'canonical_tag_value',
        'sitemap_loc_value',
        'match',
        'notes'
      ]
    }),
    'utf8'
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const htmlFiles = await fg('**/*.html', {
    cwd: options.publicRoot,
    absolute: true,
    dot: true
  });

  if (htmlFiles.length === 0) {
    throw new Error(`No built HTML files found under ${toRepoRelative(options.publicRoot)}. Run a production build first.`);
  }

  const indexableRoutes = new Map();
  for (const htmlFile of htmlFiles) {
    const source = await fs.readFile(htmlFile, 'utf8');
    const redirectDetails = extractRedirectDetails(source);
    const route = normalizeRoute(routeFromHtmlPath(options.publicRoot, htmlFile));
    const $ = loadHtml(source);

    if (!isIndexable(route, $, redirectDetails)) {
      continue;
    }

    indexableRoutes.set(route, {
      url: toAbsoluteUrl(route, options.baseUrl),
      canonical: readCanonical($, options.baseUrl),
      filePath: path.relative(repoRoot, htmlFile).replace(/\\/g, '/')
    });
  }

  const sitemapUrls = await collectSitemapEntries(options.publicRoot, options.sitemapPath);
  const rows = [];
  const failures = [];
  const seenRoutes = new Set();

  for (const sitemapUrl of [...new Set(sitemapUrls)].sort()) {
    const route = normalizeRoute(new URL(sitemapUrl).pathname);
    const record = indexableRoutes.get(route);
    seenRoutes.add(route);

    if (!record) {
      rows.push({
        url: sitemapUrl,
        canonical_tag_value: '',
        sitemap_loc_value: sitemapUrl,
        match: 'no',
        notes: 'Sitemap URL does not resolve to an indexable HTML page in the production artifact.'
      });
      failures.push(`${sitemapUrl}: sitemap URL is missing a matching indexable HTML page.`);
      continue;
    }

    if (!record.canonical) {
      rows.push({
        url: sitemapUrl,
        canonical_tag_value: '',
        sitemap_loc_value: sitemapUrl,
        match: 'no',
        notes: `Indexable HTML page ${record.filePath} is missing a canonical link.`
      });
      failures.push(`${sitemapUrl}: missing canonical tag.`);
      continue;
    }

    const match = record.canonical === sitemapUrl ? 'yes' : 'no';
    const notes = match === 'yes'
      ? `Canonical tag from ${record.filePath} matches sitemap.xml.`
      : `Canonical tag from ${record.filePath} does not match sitemap.xml.`;
    rows.push({
      url: sitemapUrl,
      canonical_tag_value: record.canonical,
      sitemap_loc_value: sitemapUrl,
      match,
      notes
    });

    if (match === 'no') {
      failures.push(`${sitemapUrl}: canonical ${record.canonical} does not match sitemap loc.`);
    }
  }

  for (const [route, record] of indexableRoutes.entries()) {
    if (seenRoutes.has(route)) {
      continue;
    }

    rows.push({
      url: record.url,
      canonical_tag_value: record.canonical,
      sitemap_loc_value: '',
      match: 'no',
      notes: `Indexable HTML page ${record.filePath} is missing from sitemap.xml.`
    });
    failures.push(`${record.url}: indexable HTML page is missing from sitemap.xml.`);
  }

  rows.sort((left, right) => left.url.localeCompare(right.url));
  await writeReport(options.reportPath, rows);

  console.log(`Checked ${rows.length} canonical alignment row(s) using ${toRepoRelative(options.publicRoot)}.`);
  console.log(`Canonical alignment report written to ${toRepoRelative(options.reportPath)}.`);
  console.log(`Mismatch rows: ${rows.filter((row) => row.match === 'no').length}`);

  if (failures.length > 0) {
    if (!options.ci) {
      console.error('Canonical alignment failed:');
      for (const failure of failures) {
        console.error(`- ${failure}`);
      }
    }
    process.exitCode = 1;
    return;
  }

  console.log('Canonical alignment passed.');
}

await main();