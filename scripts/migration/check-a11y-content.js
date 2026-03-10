import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { stringify as stringifyCsv } from 'csv-stringify/sync';
import fg from 'fast-glob';
import matter from 'gray-matter';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const defaultContentDir = path.join(repoRoot, 'migration/output/content');
const defaultReportFile = path.join(repoRoot, 'migration/reports/a11y-content-warnings.csv');
const defaultExceptionsFile = path.join(repoRoot, 'migration/input/a11y-content-exceptions.json');
const genericAltWords = new Set(['image', 'img', 'photo', 'picture', 'screenshot']);
const weakLinkTexts = new Set(['click here', 'read more', 'here']);
const tableDividerPattern = /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?\s*$/u;

async function main() {
  const options = resolveOptions(process.argv.slice(2));
  await fs.mkdir(path.dirname(options.reportFile), { recursive: true });

  const markdownFiles = (await fg('**/*.md', {
    cwd: options.contentDir,
    absolute: true,
    onlyFiles: true
  })).sort((left, right) => left.localeCompare(right));

  if (markdownFiles.length === 0) {
    throw new Error(`No Markdown files found under ${toRepoRelative(options.contentDir)}.`);
  }

  const decorativeExceptions = await loadDecorativeExceptions(options.exceptionsFile);
  const findings = [];

  for (const markdownFile of markdownFiles) {
    const source = await fs.readFile(markdownFile, 'utf8');
    const parsed = matter(source);
    const relativePath = toRepoRelative(markdownFile);
    const contentRelativePath = toPosixPath(path.relative(options.contentDir, markdownFile));
    const contentLines = stripCommentsPreservingLines(parsed.content).split(/\r?\n/u);
    const scanLines = stripFencedCodeBlocks(contentLines);

    findings.push(...scanMarkdownImages({
      relativePath,
      contentRelativePath,
      lines: scanLines,
      decorativeExceptions,
      genericAltSeverity: options.genericAltSeverity
    }));
    findings.push(...scanHeadings({ relativePath, lines: scanLines }));
    findings.push(...scanWeakLinks({ relativePath, lines: scanLines }));
    findings.push(...scanTables({ relativePath, lines: scanLines }));
  }

  const sortedFindings = findings.sort((left, right) => {
    if (left.file !== right.file) {
      return left.file.localeCompare(right.file);
    }
    if (left.line !== right.line) {
      return left.line - right.line;
    }
    return left.issueType.localeCompare(right.issueType);
  });

  await fs.writeFile(
    options.reportFile,
    stringifyCsv(sortedFindings, {
      header: true,
      columns: [
        'file',
        'line',
        'issueType',
        'status',
        'severity',
        'value',
        'message',
        'suggestion'
      ]
    }),
    'utf8'
  );

  const blockingCount = sortedFindings.filter((finding) => finding.status === 'fail').length;
  const linkWarningCount = sortedFindings.filter((finding) => finding.issueType === 'weak_link_text').length;
  const warningCount = sortedFindings.length - blockingCount;

  console.log(
    [
      `Scanned ${markdownFiles.length} staged Markdown file(s).`,
      `Blocking findings: ${blockingCount}.`,
      `Warnings: ${warningCount}.`,
      `Weak-link warnings: ${linkWarningCount}/${options.linkWarningCap}.`,
      `Decorative exceptions: ${decorativeExceptions.size}.`,
      `Wrote ${toRepoRelative(options.reportFile)}.`
    ].join(' ')
  );

  if (blockingCount > options.blockingCap || linkWarningCount > options.linkWarningCap) {
    process.exitCode = 1;
  }
}

function resolveOptions(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    switch (argument) {
      case '--content-dir':
        parsed.contentDir = path.resolve(argv[++index]);
        break;
      case '--report-file':
        parsed.reportFile = path.resolve(argv[++index]);
        break;
      case '--exceptions-file':
        parsed.exceptionsFile = path.resolve(argv[++index]);
        break;
      case '--blocking-cap':
        parsed.blockingCap = Number.parseInt(argv[++index], 10);
        break;
      case '--link-warning-cap':
        parsed.linkWarningCap = Number.parseInt(argv[++index], 10);
        break;
      case '--generic-alt-severity':
        parsed.genericAltSeverity = argv[++index];
        break;
      case '--help':
        printHelp();
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown argument: ${argument}`);
    }
  }

  const genericAltSeverity = parsed.genericAltSeverity ?? 'blocking';
  if (!['blocking', 'warning'].includes(genericAltSeverity)) {
    throw new Error('--generic-alt-severity must be either "blocking" or "warning".');
  }

  return {
    contentDir: parsed.contentDir ?? defaultContentDir,
    reportFile: parsed.reportFile ?? defaultReportFile,
    exceptionsFile: parsed.exceptionsFile ?? defaultExceptionsFile,
    blockingCap: Number.isInteger(parsed.blockingCap) ? parsed.blockingCap : 0,
    linkWarningCap: Number.isInteger(parsed.linkWarningCap) ? parsed.linkWarningCap : 5,
    genericAltSeverity
  };
}

function printHelp() {
  console.log(`Usage: node scripts/migration/check-a11y-content.js [options]

Options:
  --content-dir <path>           Override migration/output/content directory.
  --report-file <path>           Override migration/reports/a11y-content-warnings.csv.
  --exceptions-file <path>       Override migration/input/a11y-content-exceptions.json.
  --blocking-cap <count>         Maximum allowed blocking findings before failure. Default: 0.
  --link-warning-cap <count>     Maximum allowed weak-link warnings before failure. Default: 5.
  --generic-alt-severity <mode>  Set generic alt handling to blocking or warning. Default: blocking.
  --help                         Show this help message.
`);
}

async function loadDecorativeExceptions(exceptionsFile) {
  try {
    const source = await fs.readFile(exceptionsFile, 'utf8');
    const parsed = JSON.parse(source);
    const decorativeImages = Array.isArray(parsed?.decorativeImages)
      ? parsed.decorativeImages
      : Array.isArray(parsed)
        ? parsed
        : [];
    const allowed = new Set();

    for (const entry of decorativeImages) {
      if (!entry || typeof entry !== 'object') {
        continue;
      }
      const file = typeof entry.file === 'string' ? toPosixPath(entry.file) : '';
      const src = typeof entry.src === 'string' ? normalizeImageSource(entry.src) : '';
      if (file && src) {
        allowed.add(`${file}::${src}`);
      }
    }

    return allowed;
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return new Set();
    }
    throw new Error(`Unable to read decorative image exceptions from ${toRepoRelative(exceptionsFile)}: ${error.message}`);
  }
}

function scanMarkdownImages({ relativePath, contentRelativePath, lines, decorativeExceptions, genericAltSeverity }) {
  const findings = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const markdownImages = [...line.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/gu)];
    for (const match of markdownImages) {
      const altText = String(match[1] ?? '').trim();
      const src = normalizeImageSource(extractMarkdownTarget(match[2] ?? ''));
      const exceptionKey = `${contentRelativePath}::${src}`;

      if (!altText) {
        if (decorativeExceptions.has(exceptionKey)) {
          continue;
        }
        findings.push(createFinding({
          file: relativePath,
          line: index + 1,
          issueType: 'missing_alt_text',
          status: 'fail',
          severity: 'critical',
          value: src,
          message: 'Markdown image is missing alt text.',
          suggestion: 'Provide descriptive alt text, or add an explicit decorative-image exception for this file and src.'
        }));
        continue;
      }

      if (isGenericAltText(altText, src)) {
        findings.push(createFinding({
          file: relativePath,
          line: index + 1,
          issueType: 'generic_alt_text',
          status: genericAltSeverity === 'blocking' ? 'fail' : 'warn',
          severity: genericAltSeverity === 'blocking' ? 'high' : 'medium',
          value: altText,
          message: 'Markdown image alt text is generic or filename-like.',
          suggestion: 'Replace the placeholder alt text with a concise description of the image purpose.'
        }));
      }
    }
  }

  return findings;
}

function scanHeadings({ relativePath, lines }) {
  const findings = [];
  let previousLevel = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const markdownMatch = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/u);
    if (markdownMatch) {
      const level = markdownMatch[1].length;
      findings.push(...evaluateHeading({
        relativePath,
        line: index + 1,
        value: markdownMatch[2].trim(),
        level,
        previousLevel
      }));
      previousLevel = level;
      continue;
    }

    for (const match of line.matchAll(/<h([1-6])\b[^>]*>(.*?)<\/h\1>/giu)) {
      const level = Number.parseInt(match[1], 10);
      const value = String(match[2] ?? '').replace(/<[^>]+>/gu, ' ').trim();
      findings.push(...evaluateHeading({
        relativePath,
        line: index + 1,
        value,
        level,
        previousLevel
      }));
      previousLevel = level;
    }
  }

  return findings;
}

function evaluateHeading({ relativePath, line, value, level, previousLevel }) {
  const findings = [];

  if (level === 1) {
    findings.push(createFinding({
      file: relativePath,
      line,
      issueType: 'body_h1_heading',
      status: 'fail',
      severity: 'high',
      value,
      message: 'Migrated content body contains an h1 heading.',
      suggestion: 'Use h2 or lower in the body so the page title remains the only h1.'
    }));
  }

  if (previousLevel !== null && level > previousLevel + 1) {
    findings.push(createFinding({
      file: relativePath,
      line,
      issueType: 'heading_level_skip',
      status: 'warn',
      severity: 'medium',
      value: `h${previousLevel} -> h${level}`,
      message: 'Heading hierarchy skips a level.',
      suggestion: 'Use sequential heading levels unless a repeated page region justifies the jump.'
    }));
  }

  return findings;
}

function scanWeakLinks({ relativePath, lines }) {
  const findings = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    for (const match of line.matchAll(/(?<!!)\[([^\]]+)\]\(([^)]+)\)/gu)) {
      const linkText = String(match[1] ?? '').replace(/<[^>]+>/gu, ' ').trim();
      const normalized = normalizeLinkText(linkText);
      if (!weakLinkTexts.has(normalized)) {
        continue;
      }
      findings.push(createFinding({
        file: relativePath,
        line: index + 1,
        issueType: 'weak_link_text',
        status: 'warn',
        severity: 'medium',
        value: linkText,
        message: 'Link text is too generic to stand alone reliably.',
        suggestion: 'Replace the link text with a destination-specific label.'
      }));
    }
  }

  return findings;
}

function scanTables({ relativePath, lines }) {
  const findings = [];

  for (let index = 0; index < lines.length - 1; index += 1) {
    const headerLine = lines[index];
    const nextLine = lines[index + 1];
    if (!looksLikeTableLine(headerLine) || !looksLikeTableLine(nextLine)) {
      continue;
    }

    if (!tableDividerPattern.test(nextLine)) {
      findings.push(createFinding({
        file: relativePath,
        line: index + 1,
        issueType: 'table_missing_header_divider',
        status: 'warn',
        severity: 'medium',
        value: headerLine.trim(),
        message: 'Possible GFM table is missing a header divider row.',
        suggestion: 'Add a Markdown table divider row such as | --- | --- |.'
      }));
      continue;
    }

    const headers = splitTableCells(headerLine);
    if (headers.length > 0 && headers.every((cell) => cell.length === 0)) {
      findings.push(createFinding({
        file: relativePath,
        line: index + 1,
        issueType: 'table_empty_headers',
        status: 'fail',
        severity: 'high',
        value: headerLine.trim(),
        message: 'Markdown table header row is present but all headers are empty.',
        suggestion: 'Provide meaningful header labels, or convert the structure to prose if it is not a data table.'
      }));
    }
  }

  return findings;
}

function stripCommentsPreservingLines(source) {
  return String(source ?? '').replace(/<!--([\s\S]*?)-->/gu, (match) => match.replace(/[^\n]/gu, ' '));
}

function stripFencedCodeBlocks(lines) {
  const stripped = [];
  let activeFence = null;

  for (const line of lines) {
    const fenceMatch = line.match(/^\s*(```+|~~~+)/u);
    if (fenceMatch) {
      if (!activeFence) {
        activeFence = fenceMatch[1][0];
      } else if (activeFence === fenceMatch[1][0]) {
        activeFence = null;
      }
      stripped.push('');
      continue;
    }

    stripped.push(activeFence ? '' : line);
  }

  return stripped;
}

function looksLikeTableLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('>')) {
    return false;
  }
  return (trimmed.match(/\|/gu) ?? []).length >= 2;
}

function splitTableCells(line) {
  const trimmed = line.trim().replace(/^\||\|$/gu, '');
  return trimmed.split('|').map((cell) => cell.trim());
}

function extractMarkdownTarget(rawTarget) {
  return String(rawTarget ?? '')
    .trim()
    .replace(/^<|>$/gu, '')
    .split(/\s+['"]/u, 1)[0];
}

function normalizeImageSource(src) {
  return String(src ?? '').trim().replace(/^<|>$/gu, '');
}

function isGenericAltText(altText, src) {
  const normalizedAlt = normalizeLinkText(altText);
  if (genericAltWords.has(normalizedAlt)) {
    return true;
  }

  const lowerAlt = String(altText ?? '').trim().toLowerCase();
  const sourceBaseName = path.basename(String(src ?? '').split(/[?#]/u, 1)[0]).toLowerCase();
  const sourceStem = sourceBaseName.replace(/\.[a-z0-9]+$/u, '');

  if (lowerAlt === sourceBaseName || lowerAlt === sourceStem) {
    return true;
  }

  if (/\b(?:img|image|photo|picture|screenshot)[-_\s]*\d*\b/u.test(lowerAlt)) {
    return true;
  }

  return /^[a-z0-9._-]+\.[a-z0-9]{2,5}$/u.test(lowerAlt)
    || /^[a-z0-9._-]{8,}$/u.test(lowerAlt);
}

function normalizeLinkText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[!?.,:;]+$/gu, '')
    .replace(/\s+/gu, ' ');
}

function createFinding({ file, line, issueType, status, severity, value, message, suggestion }) {
  return {
    file,
    line,
    issueType,
    status,
    severity,
    value,
    message,
    suggestion
  };
}

function toPosixPath(value) {
  return String(value ?? '').split(path.sep).join('/');
}

function toRepoRelative(absolutePath) {
  return toPosixPath(path.relative(repoRoot, absolutePath));
}

main().catch((error) => {
  console.error(`check:a11y-content failed: ${error.message}`);
  process.exitCode = 1;
});