import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import fg from 'fast-glob';

import { extractRedirectDetails } from './migration/url-validation-helpers.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultPublicDir = path.join(repoRoot, 'public');

async function main() {
  const options = resolveOptions(process.argv.slice(2));
  const htmlFiles = (await fg('**/*.html', {
    cwd: options.publicDir,
    absolute: true,
    onlyFiles: true,
    suppressErrors: true
  })).sort((left, right) => left.localeCompare(right));

  if (htmlFiles.length === 0) {
    throw new Error(`No built HTML files found under ${options.publicDir}.`);
  }

  const failures = [];

  for (const htmlFile of htmlFiles) {
    const html = await fs.readFile(htmlFile, 'utf8');
    const route = normalizeRoute(routeFromHtmlPath(options.publicDir, htmlFile));
    if (isAllowedNoindexRoute(route, html)) {
      continue;
    }

    const robotsMeta = getRobotsMeta(html).toLowerCase();
    if (robotsMeta.includes('noindex')) {
      failures.push(`${route}: unexpected noindex robots meta`);
    }
  }

  if (failures.length > 0) {
    console.error('Unexpected noindex signals found:\n');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`No unintended noindex signals found across ${htmlFiles.length} built HTML file(s).`);
}

function resolveOptions(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    switch (argument) {
      case '--public-dir':
        parsed.publicDir = path.resolve(argv[++index]);
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
    publicDir: parsed.publicDir ?? process.env.CHECK_NOINDEX_PUBLIC_DIR ?? defaultPublicDir
  };
}

function printHelp() {
  console.log(`Usage: node scripts/check-noindex.js [options]

Options:
  --public-dir <path>  Override the built public directory.
  --help               Show this help message.
`);
}

function routeFromHtmlPath(publicDir, htmlFile) {
  const relativePath = path.relative(publicDir, htmlFile).replace(/\\/g, '/');
  if (relativePath === 'index.html') {
    return '/';
  }

  if (relativePath.endsWith('/index.html')) {
    return `/${relativePath.slice(0, -'index.html'.length)}`;
  }

  return `/${relativePath}`;
}

function normalizeRoute(route) {
  if (route === '/') {
    return route;
  }

  return route.endsWith('/') ? route : `${route}/`;
}

function isAllowedNoindexRoute(route, html) {
  if (route === '/404/' || route === '/404.html') {
    return true;
  }

  if (route.startsWith('/feed/')) {
    return true;
  }

  return extractRedirectDetails(html).isRedirectPage;
}

function getRobotsMeta(html) {
  const match = html.match(/<meta\b[^>]*name=(?:"robots"|'robots')[^>]*content=(?:"([^"]*)"|'([^']*)')/iu);
  return (match?.[1] ?? match?.[2] ?? '').trim();
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});