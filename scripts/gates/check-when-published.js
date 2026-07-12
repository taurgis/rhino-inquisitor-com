import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { urlPattern, normalizeUrl } from './url-shape.js';

const execFileAsync = promisify(execFile);

/**
 * Blocking gate for the `when-published` / `when-unpublished` shortcode pair
 * (src/layouts/shortcodes/when-published.html and when-unpublished.html).
 *
 * when-published hides a block until its `target` URL resolves to a built
 * page, so live articles can reference planned (draft) articles without
 * shipping a dead internal link; when-unpublished is the "else" branch,
 * rendering interim wording only while the target is still draft. Either
 * way the shortcode matches against `RelPermalink` at build time, so a
 * typo'd target never matches anything — silently hiding a block forever,
 * or pinning a fallback forever. This gate closes that hole by validating
 * every target against content front matter, where both draft and published
 * URLs are visible.
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
 *   3. unclosed          — opening and closing tags for a shortcode name do
 *                          not balance, in either direction (Hugo would also
 *                          fail the build, but this reports it before a
 *                          build exists).
 *   4. missing-target    — no `target` argument.
 *   5. malformed-target  — target does not follow the shared url shape
 *                          (scripts/gates/url-shape.js: lowercase, leading
 *                          slash, `a-z 0-9 - /` only).
 *   6. alias-target      — target matches an `aliases` entry instead of a
 *                          canonical `url`. Alias stubs never match the
 *                          shortcode's RelPermalink lookup, so the block
 *                          would stay hidden even after publication.
 *   7. unknown-target    — target matches no content file's `url` at all
 *                          (draft or published) — almost always a typo.
 *
 * Notices (non-blocking, informational):
 *
 *   - pending         — when-published on a target not yet in the build
 *                       (draft, or scheduled with a future date — production
 *                       never passes --buildFuture): hidden by design.
 *                       Listed so pending content stays discoverable.
 *   - unwrap          — when-published on a built target: the wrapper is
 *                       inert; remove it on the next editorial pass.
 *   - fallback-active — when-unpublished on a not-yet-built target: the
 *                       interim wording is what readers currently see.
 *   - stale-fallback  — when-unpublished on a built target: the block
 *                       renders nothing anymore; remove the dead source.
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

/**
 * Target shape and normalization are shared with the frontmatter validator
 * via ./url-shape.js, so the two rules cannot drift. Targets and index keys
 * are both normalized to Hugo's served form (trailing slash), so a
 * `url: /foo` page matches a `/foo/` target.
 */

/**
 * One opening or self-closing tag of either shortcode in either notation.
 * Closing tags are matched separately, per shortcode name.
 */
const OPEN_TAG_PATTERN = /\{\{([%<])\s*(when-published|when-unpublished)\b([^}]*?)(?:\s(\/))?\s*[%>]\}\}/gu;
const CLOSE_TAG_PATTERN = /\{\{[%<]\s*\/(when-published|when-unpublished)\s*[%>]\}\}/gu;
const TARGET_ARG_PATTERN = /\btarget\s*=\s*(?:"([^"\n]*)"|'([^'\n]*)'|`([^`]*)`|(\S+))/u;
const DISPLAY_ARG_PATTERN = /\bdisplay\s*=\s*(?:"([^"\n]*)"|'([^'\n]*)'|(\S+))/u;

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
    .replace(/(`+)(?:(?!\n\n)[\s\S])*?\1/gu, blank)
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
 * Extract `url`, `aliases`, `draft`, and `date` from one Markdown file's
 * front matter. Tolerant line-based parse — dependency-free so the pre-commit hook
 * can run before `npm ci`. Returns null when there is no front matter block.
 */
function parseFrontMatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:[ \t]*\r?\n|$)/u.exec(source);
  if (!match) {
    return null;
  }
  const lines = match[1].split(/\r?\n/u);
  const result = { url: null, draft: false, date: null, aliases: [] };
  let inAliases = false;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const aliasItem = /^\s*-\s+(.+?)\s*$/u.exec(line);
    if (inAliases && aliasItem) {
      result.aliases.push(stripQuotes(aliasItem[1]));
      continue;
    }
    inAliases = false;
    const keyed = /^(url|draft|date|aliases):\s*(.*)$/u.exec(line);
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
    } else if (key === 'date') {
      result.date = stripQuotes(value);
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
 * Whether a page with this front matter is part of a production build:
 * not draft, and not scheduled with a future date (production builds never
 * pass --buildFuture, per hugo-coding-standards).
 */
function isBuilt(front, now = Date.now()) {
  if (front.draft) {
    return false;
  }
  if (front.date) {
    const timestamp = Date.parse(front.date);
    if (!Number.isNaN(timestamp) && timestamp > now) {
      return false;
    }
  }
  return true;
}

/**
 * URL a content file resolves to when it has no explicit `url` front matter
 * key. Category term pages are the one such class in this repo: hugo.toml
 * [permalinks.term] maps categories to /category/:slug/ and no term file
 * overrides its slug. Returns null for anything else.
 */
function derivedUrl(file) {
  const term = /^src\/content\/categories\/([a-z0-9-]+)\/_index\.md$/u.exec(file);
  return term ? `/category/${term[1]}/` : null;
}

/**
 * Build the target index for the whole content tree: normalized url ->
 * { file, built }, plus alias url -> canonical url. In staged mode the index
 * reads the git index (the tree the commit will create): untracked files do
 * not exist there, and staged renames are already visible — so the
 * pre-commit verdict matches what CI sees on the pushed tree.
 */
async function buildUrlIndex({ staged = false } = {}) {
  const files = staged ? await listTrackedContentFiles() : await listAllContentFiles();
  const dirty = staged ? await listDirtyContentFiles() : new Set();
  const urls = new Map();
  const aliases = new Map();
  const now = Date.now();
  for (const file of files) {
    const source = dirty.has(file) ? await readStaged(file) : await defaultRead(file);
    const front = parseFrontMatter(source);
    if (!front) {
      continue;
    }
    const url = front.url ?? derivedUrl(file);
    if (!url) {
      continue;
    }
    urls.set(normalizeUrl(url), { file, built: isBuilt(front, now) });
    for (const alias of front.aliases) {
      aliases.set(normalizeUrl(alias), normalizeUrl(url));
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

  const closings = { 'when-published': 0, 'when-unpublished': 0 };
  for (const match of masked.matchAll(CLOSE_TAG_PATTERN)) {
    closings[match[1]] += 1;
  }
  const openings = { 'when-published': 0, 'when-unpublished': 0 };

  for (const match of masked.matchAll(OPEN_TAG_PATTERN)) {
    const [, delimiter, name, args, selfClosing] = match;
    const line = lineOf(masked, match.index);

    if (delimiter === '%') {
      findings.push({
        type: 'markdown-notation',
        line,
        message: `${name} must use standard notation ({{< >}}) — the template renders its own Markdown, and {{% %}} would run Goldmark over the rendered HTML a second time`
      });
    }

    if (selfClosing === '/') {
      findings.push({
        type: 'self-closing',
        line,
        message: `self-closing ${name} wraps no content — use an opening and closing tag around the block`
      });
    } else {
      openings[name] += 1;
    }

    const displayMatch = DISPLAY_ARG_PATTERN.exec(args);
    if (displayMatch) {
      const display = displayMatch[1] ?? displayMatch[2] ?? displayMatch[3];
      if (display !== 'block' && display !== 'inline') {
        findings.push({
          type: 'invalid-display',
          line,
          message: `display must be "block" or "inline", got ${JSON.stringify(display)} — the template fails the build on anything else`
        });
      }
    }

    const targetMatch = TARGET_ARG_PATTERN.exec(args);
    const target = targetMatch ? (targetMatch[1] ?? targetMatch[2] ?? targetMatch[3] ?? targetMatch[4]) : null;

    if (!target) {
      findings.push({
        type: 'missing-target',
        line,
        message: `${name} requires a target="/pretty-url/" argument`
      });
      continue;
    }

    if (!urlPattern.test(target)) {
      findings.push({
        type: 'malformed-target',
        line,
        target,
        message:
          'target must match the url front matter shape (scripts/gates/url-shape.js): lowercase, leading slash, a-z 0-9 - / only'
      });
      continue;
    }

    const entry = index.urls.get(normalizeUrl(target));
    if (entry) {
      const state = entry.built ? 'built' : 'hidden';
      const NOTICE = {
        'when-published': {
          hidden: ['pending', `target is not in the build yet (${entry.file}: draft or future-dated) — block stays hidden until it publishes`],
          built: ['unwrap', `target is published (${entry.file}) — the wrapper is inert and can be removed on the next edit`]
        },
        'when-unpublished': {
          hidden: ['fallback-active', `target is not in the build yet (${entry.file}) — this interim wording is what readers currently see`],
          built: ['stale-fallback', `target is published (${entry.file}) — this fallback renders nothing anymore and can be removed`]
        }
      };
      const [type, message] = NOTICE[name][state];
      notices.push({ type, line, target, message });
      continue;
    }

    const canonical = index.aliases.get(normalizeUrl(target));
    if (canonical) {
      findings.push({
        type: 'alias-target',
        line,
        target,
        message: `target is an alias — use the canonical url ${canonical} or the block never switches state`
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

  for (const name of Object.keys(openings)) {
    if (openings[name] !== closings[name]) {
      findings.push({
        type: 'unclosed',
        line: lineOf(masked, masked.length - 1),
        message: `${openings[name]} ${name} opening tag(s) but ${closings[name]} closing tag(s) — Hugo will fail the build`
      });
    }
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

/** Content files in the git index — the tree the commit will create. */
async function listTrackedContentFiles() {
  const { stdout } = await execFileAsync('git', ['ls-files', '--cached', '--', CONTENT_PREFIX], {
    cwd: REPO_ROOT,
    maxBuffer: 16 * 1024 * 1024
  });
  return stdout.split('\n').filter(Boolean).filter(isContentMarkdown);
}

/**
 * Tracked content files whose working-tree copy differs from the git index —
 * only these need the slower `git show :file` read; clean files are read
 * from disk, which is identical.
 */
async function listDirtyContentFiles() {
  const { stdout } = await execFileAsync(
    'git',
    ['diff', '--name-only', '--', CONTENT_PREFIX],
    { cwd: REPO_ROOT }
  );
  return new Set(stdout.split('\n').filter(Boolean).filter(isContentMarkdown));
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

  // Targets are validated against the tree the commit/CI will actually see:
  // the git index in --staged mode (untracked drafts don't count), the
  // working tree otherwise.
  const index = await buildUrlIndex({ staged: args.staged });

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
    const fallbacks = notices.filter((notice) => notice.type === 'fallback-active').length;
    console.log(
      `when-published gate: ${files.length} file(s) checked, ${notices.length} block(s) found (${pending} pending publication, ${fallbacks} active fallback(s)). No defects.`
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
  analyzeSource,
  buildUrlIndex,
  isBuilt,
  derivedUrl,
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
