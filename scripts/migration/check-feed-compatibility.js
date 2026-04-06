import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import fg from 'fast-glob';
import { XMLParser } from 'fast-xml-parser';
import matter from 'gray-matter';
import { stringify as stringifyCsv } from 'csv-stringify/sync';

import {
  extractRedirectDetails,
  toRepoRelative
} from './url-validation-helpers.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const defaultPublicDir = path.join(repoRoot, 'public');
const defaultContentDir = path.join(repoRoot, 'src/content');
const defaultReport = path.join(repoRoot, 'migration/reports/feed-compatibility-report.csv');

async function main() {
  const options = resolveOptions(process.argv.slice(2));
  await fs.mkdir(path.dirname(options.reportFile), { recursive: true });

  const rows = [];
  const failures = [];
  const feedPolicy = await loadRootFeedPolicy(options.contentDir);

  const canonicalFeedPath = path.join(options.publicDir, 'index.xml');
  if (!(await fileExists(canonicalFeedPath))) {
    pushRow(rows, failures, {
      endpoint: '/index.xml',
      check: 'canonical_feed_exists',
      status: 'fail',
      severity: 'critical',
      behavior: 'missing',
      redirectTarget: '',
      xmlValid: 'false',
      itemCount: '',
      message: 'Canonical Hugo RSS feed is missing from the built output.'
    });
  } else {
    const feedSource = await fs.readFile(canonicalFeedPath, 'utf8');
    const { valid, itemCount, message } = validateFeedXml(feedSource, feedPolicy);
    pushRow(rows, valid ? null : failures, {
      endpoint: '/index.xml',
      check: 'canonical_feed_exists',
      status: valid ? 'pass' : 'fail',
      severity: valid ? 'none' : 'critical',
      behavior: 'xml',
      redirectTarget: '',
      xmlValid: String(valid),
      itemCount: String(itemCount),
      message
    });
  }

  const helperEndpoints = ['/feed/', '/feed/rss/', '/feed/atom/', '/rss/'];
  for (const endpoint of helperEndpoints) {
    const helperPath = path.join(options.publicDir, endpoint.replace(/^\//u, ''), 'index.html');
    if (!(await fileExists(helperPath))) {
      pushRow(rows, failures, {
        endpoint,
        check: 'helper_route_exists',
        status: 'fail',
        severity: 'high',
        behavior: 'missing',
        redirectTarget: '',
        xmlValid: '',
        itemCount: '',
        message: 'Feed compatibility helper route is missing from the built output.'
      });
      continue;
    }

    const helperSource = await fs.readFile(helperPath, 'utf8');
    const details = extractRedirectDetails(helperSource);
    const redirectTarget = normalizeRedirectTarget(details.metaRefreshTarget);
    const validTarget = redirectTarget === '/index.xml' || redirectTarget === '/feed/';

    pushRow(rows, validTarget ? null : failures, {
      endpoint,
      check: 'helper_route_behavior',
      status: validTarget ? 'pass' : 'fail',
      severity: validTarget ? 'none' : 'high',
      behavior: details.isRedirectPage ? 'meta-refresh' : 'html',
      redirectTarget,
      xmlValid: '',
      itemCount: '',
      message: validTarget
        ? 'Feed helper route resolves through the approved Pages-compatible compatibility pattern.'
        : 'Feed helper route does not resolve to /index.xml or /feed/ as expected.'
    });
  }

  const robotsSource = await fs.readFile(options.robotsFile, 'utf8');
  const disallowedFeed = /(^|\n)Disallow:\s*\/feed(?:\/|\s*$)/iu.test(robotsSource)
    || /(^|\n)Disallow:\s*\/index\.xml\s*$/imu.test(robotsSource);

  pushRow(rows, disallowedFeed ? failures : null, {
    endpoint: '/robots.txt',
    check: 'robots_allows_feed',
    status: disallowedFeed ? 'fail' : 'pass',
    severity: disallowedFeed ? 'critical' : 'none',
    behavior: 'robots',
    redirectTarget: '',
    xmlValid: '',
    itemCount: '',
    message: disallowedFeed
      ? 'robots.txt disallows the canonical feed route or the canonical Hugo feed endpoint.'
      : 'robots.txt does not disallow feed compatibility endpoints.'
  });

  await fs.writeFile(
    options.reportFile,
    stringifyCsv(rows, {
      header: true,
      columns: ['endpoint', 'check', 'status', 'severity', 'behavior', 'redirectTarget', 'xmlValid', 'itemCount', 'message']
    }),
    'utf8'
  );

  console.log(
    [
      `Validated ${helperEndpoints.length + 2} feed compatibility checks.`,
      `Failures: ${failures.length}.`,
      `Wrote ${toRepoRelative(options.reportFile)}.`
    ].join(' ')
  );

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

function resolveOptions(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    switch (argument) {
      case '--public-dir':
        parsed.publicDir = path.resolve(argv[++index]);
        break;
      case '--robots-file':
        parsed.robotsFile = path.resolve(argv[++index]);
        break;
      case '--content-dir':
        parsed.contentDir = path.resolve(argv[++index]);
        break;
      case '--report-file':
        parsed.reportFile = path.resolve(argv[++index]);
        break;
      case '--help':
        printHelp();
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown argument: ${argument}`);
    }
  }

  return {
    publicDir: parsed.publicDir ?? defaultPublicDir,
    contentDir: parsed.contentDir ?? defaultContentDir,
    robotsFile: parsed.robotsFile ?? path.join(parsed.publicDir ?? defaultPublicDir, 'robots.txt'),
    reportFile: parsed.reportFile ?? defaultReport
  };
}

function printHelp() {
  console.log(`Usage: node scripts/migration/check-feed-compatibility.js [options]

Options:
  --public-dir <path>   Override the built public directory.
  --robots-file <path>  Override the robots.txt file to inspect.
  --content-dir <path>  Override the content directory used for feed-block rules.
  --report-file <path>  Override migration/reports/feed-compatibility-report.csv.
  --help                Show this help message.
`);
}

function validateFeedXml(source, feedPolicy) {
  try {
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(source);
    const itemCount = countFeedItems(parsed);
    const itemRoutes = extractFeedItemRoutes(parsed);
    const blockedFeedItems = [...new Set(itemRoutes.filter((route) => feedPolicy.blockedRoutes.has(route)))];
    const nonPostFeedItems = [...new Set(itemRoutes.filter((route) => !feedPolicy.allowedPostRoutes.has(route)))];
    if (itemCount < 1) {
      return {
        valid: false,
        itemCount,
        message: 'Canonical feed XML is present but contains no items.'
      };
    }

    if (blockedFeedItems.length > 0) {
      return {
        valid: false,
        itemCount,
        message: `Canonical feed XML contains blocked routes: ${blockedFeedItems.join(', ')}`
      };
    }

    if (nonPostFeedItems.length > 0) {
      return {
        valid: false,
        itemCount,
        message: `Canonical feed XML contains non-post routes: ${nonPostFeedItems.join(', ')}`
      };
    }

    return {
      valid: true,
      itemCount,
      message: 'Canonical feed XML is present, parseable, excludes blocked routes, and contains posts only.'
    };
  } catch (error) {
    return {
      valid: false,
      itemCount: 0,
      message: `Canonical feed XML is not parseable: ${error.message}`
    };
  }
}

function countFeedItems(parsed) {
  const rssItems = parsed?.rss?.channel?.item;
  if (Array.isArray(rssItems)) {
    return rssItems.length;
  }
  if (rssItems) {
    return 1;
  }

  const atomEntries = parsed?.feed?.entry;
  if (Array.isArray(atomEntries)) {
    return atomEntries.length;
  }
  if (atomEntries) {
    return 1;
  }

  return 0;
}

function extractFeedItemRoutes(parsed) {
  const routes = [];
  const rssItems = parsed?.rss?.channel?.item;

  if (Array.isArray(rssItems)) {
    for (const item of rssItems) {
      const route = normalizeRoute(item?.link);
      if (route) {
        routes.push(route);
      }
    }
    return routes;
  }

  if (rssItems) {
    const route = normalizeRoute(rssItems?.link);
    if (route) {
      routes.push(route);
    }
    return routes;
  }

  const atomEntries = parsed?.feed?.entry;
  const entries = Array.isArray(atomEntries) ? atomEntries : atomEntries ? [atomEntries] : [];

  for (const entry of entries) {
    const links = Array.isArray(entry?.link) ? entry.link : entry?.link ? [entry.link] : [];
    const firstLink = links.find((candidate) => typeof candidate?.['@_href'] === 'string');
    const route = normalizeRoute(firstLink?.['@_href']);
    if (route) {
      routes.push(route);
    }
  }

  return routes;
}

async function loadRootFeedPolicy(contentDir) {
  const markdownFiles = await fg('**/*.md', {
    cwd: contentDir,
    absolute: true,
    onlyFiles: true,
    suppressErrors: true
  });
  const allowedPostRoutes = new Set();
  const routes = new Set();

  for (const markdownFile of markdownFiles.sort()) {
    const source = await fs.readFile(markdownFile, 'utf8');
    const parsed = matter(source);
    const relativePath = path.relative(contentDir, markdownFile).split(path.sep).join('/');
    const hasNoindex = parsed.data?.noindex === true || parsed.data?.seo?.noindex === true;
    const isScaffoldFixture = parsed.data?.scaffoldFixture === true;
    const isDraft = parsed.data?.draft === true;
    const route = normalizeRoute(parsed.data?.url);

    if (route && relativePath.startsWith('posts/') && !hasNoindex && !isScaffoldFixture && !isDraft) {
      allowedPostRoutes.add(route);
    }

    if (!hasNoindex && !isScaffoldFixture) {
      continue;
    }

    if (route) {
      routes.add(route);
    }
  }

  return {
    allowedPostRoutes,
    blockedRoutes: routes
  };
}

function normalizeRedirectTarget(value) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return '';
  }

  const trimmed = value.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return new URL(trimmed).pathname;
  }

  return trimmed;
}

function normalizeRoute(value) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return '';
  }

  const trimmed = value.trim();
  let route = trimmed;

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    route = new URL(trimmed).pathname;
  }

  if (!route.startsWith('/')) {
    route = `/${route}`;
  }

  route = route.replace(/\/+/gu, '/');

  if (route !== '/' && !route.endsWith('/') && !/\.[a-z0-9]+$/iu.test(route)) {
    route = `${route}/`;
  }

  return route;
}

function pushRow(rows, failures, row) {
  rows.push(row);
  if (failures) {
    failures.push(row);
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});