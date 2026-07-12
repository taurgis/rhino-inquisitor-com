import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';

const execFileAsync = promisify(execFile);

/**
 * Blocking gate for the `when-published` shortcode
 * (src/layouts/shortcodes/when-published.html).
 *
 * The shortcode hides a block until its `target` URL resolves to a built
 * page, so live articles can reference planned (draft) articles without
 * shipping a dead internal link. That only works if the target is real: the
 * shortcode matches against `RelPermalink` at build time, so a typo'd target
 * never matches anything and silently hides the block forever. This gate
 * closes that hole by validating every target against content front matter,
 * where both draft and published URLs are visible.
 *
 * Findings (blocking):
 *
 *   1. markdown-notation — the shortcode was called with {{% %}} delimiters.
 *                          The template renders its inner Markdown itself
 *                          (RenderString in block mode); markdown notation
 *                          would push that HTML through Goldmark a second
 *                          time and strip it. Use {{< >}}.
 *   2. self-closing      — a self-closing call wraps no content; there is
 *                          nothing to conditionally render.
 *   3. unclosed          — an opening tag without a matching closing tag
 *                          (Hugo would also fail the build, but this reports
 *                          it before a build exists).
 *   4. missing-target    — no `target` argument.
 *   5. malformed-target  — target does not follow the url front matter
 *                          format (lowercase, leading/trailing slash,
 *                          `a-z 0-9 - /` only).
 *   6. alias-target      — target matches an `aliases` entry instead of a
 *                          canonical `url`. Alias stubs never match the
 *                          shortcode's RelPermalink lookup, so the block
 *                          would stay hidden even after publication.
 *   7. unknown-target    — target matches no content file's `url` at all
 *                          (draft or published) — almost always a typo.
 *
 * Notices (non-blocking, informational):
 *
 *   - pending   — target exists but is still draft: the block is hidden by
 *                 design. Listed so pending content stays discoverable.
 *   - unwrap    — target is already published: the wrapper is inert and can
 *                 be removed on the next editorial pass (no urgency).
 *
 * Fenced code blocks, inline code spans, HTML comments, and comment-escaped
 * shortcode examples (the form used in documentation) are masked before
 * scanning, so posts and docs can quote the syntax verbatim. AGENTS.md files
 * are excluded for the same reason.
 *
 * Bypass for one commit: SKIP_WHEN_PUBLISHED_CHECK=1 git commit ...
 */

const REPO_ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const CONTENT_PREFIX = 'src/content/';

/** Same shape rule the frontmatter validator enforces for `url`. */
const URL_SHAPE = /^\/[a-z0-9-]+(?:\/[a-z0-9-]+)*\/$/u;

/**
 * One opening or self-closing when-published tag in either notation.
 * Closing tags ({{% /when-published %}}) are matched separately.
 */
const OPEN_TAG_PATTERN = /\{\{([%<])\s*when-published\b([^}]*?)(\/?)\s*[%>]\}\}/gu;
const CLOSE_TAG_PATTERN = /\{\{[%<]\s*\/when-published\s*[%>]\}\}/gu;
const TARGET_ARG_PATTERN = /\btarget\s*=\s*(?:"([^"\n]*)"|'([^'\n]*)'|`([^`]*)`|(\S+))/u;

const MASK_CHAR = ' ';

function blank(region) {
  return region.replace(/[^\n]/gu, MASK_CHAR);
}

/**
 * Mask regions where the shortcode syntax is quoted, not used: fenced and
 * inline code, HTML comments, and Hugo comment-escaped shortcode examples
 * (the "slash-star inside the delimiters" form used in documentation).
 * Length-preserving so line numbers in findings point at the original source.
 */
function maskNonProse(source) {
  return source
    .replace(/```[\s\S]*?(?:```|$)/gu, blank)
    .replace(/~~~[\s\S]*?(?:~~~|$)/gu, blank)
    .replace(/`[^`\n]*`/gu, blank)
    .replace(/<!--[\s\S]*?-->/gu, blank)
    .replace(/\{\{[%<]\/\*[\s\S]*?\*\/[%>]\}\}/gu, blank);
}

function lineOf(source, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (source.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

/**
 * Extract `url`, `aliases`, and `draft` from one Markdown file's front
 * matter. Tolerant line-based parse — dependency-free so the pre-commit hook
 * can run before `npm ci`. Returns null when there is no front matter block.
 */
function parseFrontMatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:[ \t]*\r?\n|$)/u.exec(source);
  if (!match) {
    return null;
  }
  const lines = match[1].split(/\r?\n/u);
  const result = { url: null, draft: false, aliases: [] };
  let inAliases = false;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const aliasItem = /^\s*-\s+(.+?)\s*$/u.exec(line);
    if (inAliases && aliasItem) {
      result.aliases.push(stripQuotes(aliasItem[1]));
      continue;
    }
    inAliases = false;
    const keyed = /^(url|draft|aliases):\s*(.*)$/u.exec(line);
    if (!keyed) {
      continue;
    }
    const [, key, rawValue] = keyed;
    let value = rawValue.trim();
    // YAML block scalar (url: >- / url: |-): the value is on the next
    // indented line.
    if (/^[>|][+-]?$/u.test(value)) {
      value = (lines[i + 1] ?? '').trim();
      i += 1;
    }
    if (key === 'url') {
      result.url = stripQuotes(value);
    } else if (key === 'draft') {
      result.draft = value === 'true';
    } else if (key === 'aliases') {
      if (value.startsWith('[')) {
        for (const item of value.replace(/^\[|\]$/gu, '').split(',')) {
          const alias = stripQuotes(item.trim());
          if (alias) result.aliases.push(alias);
        }
      } else if (value === '') {
        inAliases = true;
      }
    }
  }
  return result;
}

function stripQuotes(value) {
  return value.replace(/^['"]|['"]$/gu, '');
}

/**
 * Build the target index for the whole content tree: canonical url ->
 * { file, draft }, plus the set of alias urls (alias -> canonical file).
 */
async function buildUrlIndex(readFile = defaultRead) {
  const files = await listAllContentFiles();
  const urls = new Map();
  const aliases = new Map();
  for (const file of files) {
    const front = parseFrontMatter(await readFile(file));
    if (!front || !front.url) {
      continue;
    }
    urls.set(front.url, { file, draft: front.draft });
    for (const alias of front.aliases) {
      aliases.set(alias, front.url);
    }
  }
  return { urls, aliases };
}

/**
 * Scan one document for when-published calls and diagnose each against the
 * URL index. Returns { findings, notices } — findings block, notices inform.
 */
function analyzeSource(source, index) {
  const findings = [];
  const notices = [];
  const masked = maskNonProse(source);

  const closings = [...masked.matchAll(CLOSE_TAG_PATTERN)].length;
  let openings = 0;

  for (const match of masked.matchAll(OPEN_TAG_PATTERN)) {
    const [, delimiter, args, selfClosing] = match;
    const line = lineOf(masked, match.index);

    if (delimiter === '%') {
      findings.push({
        type: 'markdown-notation',
        line,
        message:
          'when-published must use standard notation ({{< >}}) — the template renders its own Markdown, and {{% %}} would run Goldmark over the rendered HTML a second time'
      });
    }

    if (selfClosing === '/') {
      findings.push({
        type: 'self-closing',
        line,
        message: 'self-closing when-published wraps no content — use an opening and closing tag around the block'
      });
    } else {
      openings += 1;
    }

    const targetMatch = TARGET_ARG_PATTERN.exec(args);
    const target = targetMatch ? (targetMatch[1] ?? targetMatch[2] ?? targetMatch[3] ?? targetMatch[4]) : null;

    if (!target) {
      findings.push({
        type: 'missing-target',
        line,
        message: 'when-published requires a target="/pretty-url/" argument'
      });
      continue;
    }

    if (!URL_SHAPE.test(target)) {
      findings.push({
        type: 'malformed-target',
        line,
        target,
        message:
          'target must match the url front matter shape: lowercase, leading and trailing slash, a-z 0-9 - / only'
      });
      continue;
    }

    const entry = index.urls.get(target);
    if (entry) {
      if (entry.draft) {
        notices.push({
          type: 'pending',
          line,
          target,
          message: `target is still draft (${entry.file}) — block stays hidden until it publishes`
        });
      } else {
        notices.push({
          type: 'unwrap',
          line,
          target,
          message: `target is already published (${entry.file}) — the wrapper is inert and can be removed on the next edit`
        });
      }
      continue;
    }

    const canonical = index.aliases.get(target);
    if (canonical) {
      findings.push({
        type: 'alias-target',
        line,
        target,
        message: `target is an alias — use the canonical url ${canonical} or the block never unhides`
      });
      continue;
    }

    findings.push({
      type: 'unknown-target',
      line,
      target,
      message: 'target matches no content file url (draft or published) — check for a typo'
    });
  }

  if (openings > closings) {
    findings.push({
      type: 'unclosed',
      line: lineOf(masked, masked.length - 1),
      message: `${openings} when-published opening tag(s) but ${closings} closing tag(s) — Hugo will fail the build`
    });
  }

  return { findings, notices };
}

// --- file discovery (mirrors check-callouts.js) --------------------------------

function isContentMarkdown(file) {
  return (
    file.startsWith(CONTENT_PREFIX) &&
    file.endsWith('.md') &&
    // AGENTS.md cites both correct and broken shortcode patterns verbatim.
    path.basename(file) !== 'AGENTS.md'
  );
}

async function listStagedContentFiles() {
  const { stdout } = await execFileAsync(
    'git',
    ['diff', '--cached', '--name-only', '--diff-filter=ACMR'],
    { cwd: REPO_ROOT }
  );
  return stdout.split('\n').filter(Boolean).filter(isContentMarkdown);
}

async function readStaged(file) {
  const { stdout } = await execFileAsync('git', ['show', `:${file}`], {
    cwd: REPO_ROOT,
    maxBuffer: 16 * 1024 * 1024
  });
  return stdout;
}

function defaultRead(file) {
  return fs.readFile(path.join(REPO_ROOT, file), 'utf8');
}

async function listAllContentFiles() {
  const entries = await fs.readdir(path.join(REPO_ROOT, CONTENT_PREFIX), {
    recursive: true,
    withFileTypes: true
  });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) =>
      path
        .relative(REPO_ROOT, path.join(entry.parentPath ?? entry.path, entry.name))
        .split(path.sep)
        .join('/')
    )
    .filter(isContentMarkdown)
    .sort((left, right) => left.localeCompare(right));
}

// --- CLI ---------------------------------------------------------------------

function parseArgs(argv) {
  const parsed = { files: [], staged: false, all: false };
  for (const arg of argv) {
    if (arg === '--staged') parsed.staged = true;
    else if (arg === '--all') parsed.all = true;
    else parsed.files.push(arg);
  }
  return parsed;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let files;
  let read;
  if (args.staged) {
    files = await listStagedContentFiles();
    read = readStaged;
  } else if (args.all) {
    files = await listAllContentFiles();
    read = defaultRead;
  } else if (args.files.length > 0) {
    files = args.files.map((file) => path.relative(REPO_ROOT, path.resolve(file)));
    read = defaultRead;
  } else {
    console.error(
      'usage: node scripts/gates/check-when-published.js --staged | --all | <file.md> [...]'
    );
    process.exitCode = 2;
    return;
  }

  if (files.length === 0) {
    if (args.all) {
      console.error(
        `when-published gate: --all found no content files under ${CONTENT_PREFIX} — broken checkout?`
      );
      process.exitCode = 2;
      return;
    }
    console.log('when-published gate: no staged content files; nothing to check.');
    return;
  }

  // Targets are validated against the whole working tree so a staged file can
  // reference a draft that already exists on disk.
  const index = await buildUrlIndex();

  const findings = [];
  const notices = [];
  for (const file of files) {
    const source = await read(file);
    const result = analyzeSource(source, index);
    findings.push(...result.findings.map((finding) => ({ ...finding, file })));
    notices.push(...result.notices.map((notice) => ({ ...notice, file })));
  }

  for (const notice of notices) {
    console.log(`- ${notice.file}:${notice.line}  ${notice.type}: ${notice.target} — ${notice.message}`);
  }

  if (findings.length === 0) {
    const pending = notices.filter((notice) => notice.type === 'pending').length;
    console.log(
      `when-published gate: ${files.length} file(s) checked, ${notices.length} block(s) found (${pending} pending publication). No defects.`
    );
    return;
  }

  console.error(`when-published gate: found ${findings.length} issue(s) in ${files.length} file(s):`);
  for (const finding of findings) {
    const detail = finding.target ? `${finding.target} — ` : '';
    console.error(`- ${finding.file}:${finding.line}  ${finding.type}: ${detail}${finding.message}`);
    if (process.env.GITHUB_ACTIONS) {
      console.error(
        `::error file=${finding.file},line=${finding.line},title=when-published gate::${finding.type}: ${finding.message}`
      );
    }
  }
  console.error(
    'Fix the block(s) above; the shortcode contract lives in src/layouts/shortcodes/when-published.html and docs/publishing/when-published-shortcode.md. Bypass once with SKIP_WHEN_PUBLISHED_CHECK=1 git commit.'
  );
  process.exitCode = 1;
}

export {
  URL_SHAPE,
  analyzeSource,
  buildUrlIndex,
  maskNonProse,
  parseFrontMatter,
  listAllContentFiles
};

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
