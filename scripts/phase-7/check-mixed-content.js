import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { load as loadHtml } from 'cheerio';
import fg from 'fast-glob';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const defaultPublicDir = path.join(repoRoot, 'public');

const resourceSelectors = [
  { selector: 'img[src]', attributes: ['src'] },
  { selector: 'img[srcset]', attributes: ['srcset'] },
  { selector: 'source[src]', attributes: ['src'] },
  { selector: 'source[srcset]', attributes: ['srcset'] },
  { selector: 'script[src]', attributes: ['src'] },
  { selector: 'iframe[src]', attributes: ['src'] },
  { selector: 'embed[src]', attributes: ['src'] },
  { selector: 'video[src]', attributes: ['src'] },
  { selector: 'video[poster]', attributes: ['poster'] },
  { selector: 'audio[src]', attributes: ['src'] },
  { selector: 'input[type="image"][src]', attributes: ['src'] },
  { selector: 'link[href]', attributes: ['href'] },
];

function printHelp() {
  console.log(`Usage: node scripts/phase-7/check-mixed-content.js [options]

Options:
  --public-dir <path>  Path to built Hugo output (default: public)
  --help               Show this help message
`);
}

function parseArgs(argv) {
  const options = {
    publicDir: defaultPublicDir,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case '--public-dir':
        options.publicDir = path.resolve(argv[index + 1] ?? '');
        index += 1;
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

function toPosixPath(value) {
  return value.split(path.sep).join('/');
}

function indexToLineNumber(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}

function findLineNumber(source, token) {
  const index = source.indexOf(token);
  if (index === -1) {
    return null;
  }

  return indexToLineNumber(source, index);
}

function normalizeSrcsetCandidates(value) {
  return String(value ?? '')
    .split(',')
    .map((candidate) => candidate.trim().split(/\s+/, 1)[0])
    .filter(Boolean);
}

function findCssUrlMatches(source) {
  const matches = [];
  const urlPattern = /url\(\s*(['"]?)(http:\/\/[^)'"\s]+)\1\s*\)/gi;
  const importPattern = /@import\s+(?:url\(\s*)?(['"])(http:\/\/[^)'"\s]+)\1\s*\)?/gi;

  for (const match of source.matchAll(urlPattern)) {
    matches.push({ value: match[2], index: match.index ?? 0 });
  }

  for (const match of source.matchAll(importPattern)) {
    matches.push({ value: match[2], index: match.index ?? 0 });
  }

  return matches;
}

function buildFailure(relativePath, lineNumber, context, value) {
  return `${relativePath}:${lineNumber} ${context} -> ${value}`;
}

function findHtmlFailures(relativePath, source) {
  const failures = [];
  const $ = loadHtml(source, { decodeEntities: false });

  for (const resourceSelector of resourceSelectors) {
    $(resourceSelector.selector).each((_, element) => {
      for (const attributeName of resourceSelector.attributes) {
        const rawValue = $(element).attr(attributeName);
        if (!rawValue) {
          continue;
        }

        const candidates = attributeName === 'srcset'
          ? normalizeSrcsetCandidates(rawValue)
          : [String(rawValue).trim()];

        for (const candidate of candidates) {
          if (!candidate.startsWith('http://')) {
            continue;
          }

          const lineNumber = findLineNumber(source, candidate) ?? 1;
          failures.push(buildFailure(relativePath, lineNumber, `${resourceSelector.selector} ${attributeName}`, candidate));
        }
      }
    });
  }

  $('[style]').each((_, element) => {
    const styleValue = $(element).attr('style');
    if (!styleValue) {
      return;
    }

    for (const match of findCssUrlMatches(styleValue)) {
      const lineNumber = findLineNumber(source, match.value) ?? 1;
      failures.push(buildFailure(relativePath, lineNumber, 'inline style', match.value));
    }
  });

  $('style').each((_, element) => {
    const styleContent = $(element).html() ?? '';
    for (const match of findCssUrlMatches(styleContent)) {
      const lineNumber = findLineNumber(source, match.value) ?? 1;
      failures.push(buildFailure(relativePath, lineNumber, 'style tag', match.value));
    }
  });

  return failures;
}

function findCssFailures(relativePath, source) {
  return findCssUrlMatches(source).map((match) => {
    const lineNumber = indexToLineNumber(source, match.index);
    return buildFailure(relativePath, lineNumber, 'stylesheet', match.value);
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  await access(options.publicDir);

  const htmlFiles = await fg('**/*.html', {
    cwd: options.publicDir,
    absolute: true,
    onlyFiles: true,
  });
  const cssFiles = await fg('**/*.css', {
    cwd: options.publicDir,
    absolute: true,
    onlyFiles: true,
  });

  const failures = [];

  for (const filePath of htmlFiles) {
    const source = await readFile(filePath, 'utf8');
    const relativePath = toPosixPath(path.relative(options.publicDir, filePath));
    failures.push(...findHtmlFailures(relativePath, source));
  }

  for (const filePath of cssFiles) {
    const source = await readFile(filePath, 'utf8');
    const relativePath = toPosixPath(path.relative(options.publicDir, filePath));
    failures.push(...findCssFailures(relativePath, source));
  }

  if (failures.length > 0) {
    console.error('check:mixed-content failed');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`check:mixed-content passed (${htmlFiles.length} HTML files, ${cssFiles.length} CSS files scanned)`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});