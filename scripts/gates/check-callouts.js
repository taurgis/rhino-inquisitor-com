import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';

const execFileAsync = promisify(execFile);

/**
 * Blocking callout gate for published content.
 *
 * The theme renders GitHub-style alerts (`> [!NOTE]`) through
 * src/layouts/_default/_markup/render-blockquote.html, which styles exactly
 * three types (NOTE, TIP, WARNING) and prints the type as the callout's
 * visible label. The 2026-07-07 callout sweep fixed a batch of articles that
 * drifted from that contract; this gate keeps the fixed state from rotting.
 *
 * Findings (all blocking):
 *
 *   1. unknown-type       — an alert type the theme has no styling for
 *                           ([!INFO], [!IMPORTANT], [!CAUTION], ...); it would
 *                           render as an unstyled grey box. The report suggests
 *                           the closest supported type.
 *   2. type-case          — a marker that is not uppercase ([!note], [!Note]).
 *                           Hugo still parses it, but the house form is
 *                           uppercase and mixed case usually signals a
 *                           hand-typed marker that needs a second look.
 *   3. trailing-text      — text on the marker line itself
 *                           (`> [!NOTE] Remember this`). Hugo treats it as an
 *                           Obsidian-style alert title, which the theme's
 *                           render hook ignores — the text silently vanishes
 *                           from the published page (verified against the
 *                           render hook with Hugo 0.163).
 *   4. empty-callout      — a marker with no content at all; it renders as a
 *                           label-only box.
 *   5. lazy-continuation  — content on the line(s) after the callout without
 *                           the `>` prefix. CommonMark lazy continuation means
 *                           Hugo renders it inside the box today, but a blank
 *                           line or paragraph reflow silently drops it out —
 *                           quote every content line explicitly.
 *   6. redundant-label    — the callout body opens with a bold generic
 *                           mini-title (`**Note:**`, `**Info:**`,
 *                           `**Important:**`, ...) that duplicates or
 *                           contradicts the label the theme already renders.
 *                           Meaningful bold leads (`**Updated 26 July 2025:**`,
 *                           `**Deprecated:**`, `**Limitations:**`) are house
 *                           style and pass.
 *   7. marker-not-first   — a marker line deeper inside a blockquote; Hugo
 *                           only recognises the alert on the quote's first
 *                           line, so `[!NOTE]` is published as literal text.
 *   8. missing-quote      — a marker at the start of a plain line with no `>`;
 *                           also published as literal text.
 *   9. bold-pseudo-callout— a paragraph opening with an urgency label
 *                           (`**Important:**`, `Warning! ...`, `**Caution:**`)
 *                           instead of a real callout box. The label must
 *                           carry its `:`/`!` punctuation — a bare
 *                           `**Warning**` lead reads as referential prose
 *                           ("**Warning** and **Error** levels...") and is
 *                           left alone, as are plain `**Note:**` /
 *                           `**Pro tip:**` asides (the author's established
 *                           voice).
 *
 * Fenced code blocks, inline code spans, and HTML comments are masked before
 * any check runs, so posts can quote alert syntax as an example; indented
 * (4-space) code blocks are skipped by the prose-column guard. AGENTS.md
 * files are excluded — they cite both good and bad patterns verbatim.
 *
 * Bypass for one commit: SKIP_CALLOUT_CHECK=1 git commit ...
 */

const REPO_ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const CONTENT_PREFIX = 'src/content/';

/** Alert types the theme's render hook + CSS actually style (uppercase). */
const THEME_ALERT_TYPES = new Set(['NOTE', 'TIP', 'WARNING']);

/** Closest supported type for the alert names GitHub/Obsidian authors reach for. */
const TYPE_SUGGESTIONS = {
  INFO: 'NOTE',
  NOTICE: 'NOTE',
  SUMMARY: 'NOTE',
  HINT: 'TIP',
  SUCCESS: 'TIP',
  IMPORTANT: 'WARNING',
  CAUTION: 'WARNING',
  DANGER: 'WARNING',
  ATTENTION: 'WARNING',
  ALERT: 'WARNING',
  ERROR: 'WARNING'
};

/**
 * Bold mini-titles that only restate (or contradict) the label the theme
 * renders above the callout body. Anything more specific ("Deprecated:",
 * "Limitations:", "Updated 26 July 2025:") carries information and passes.
 */
const REDUNDANT_LABELS = new Set([
  'note', 'info', 'important', 'warning', 'tip', 'caution', 'attention',
  'notice', 'nb'
]);

/**
 * Paragraph leads that mark an operational gotcha and should be a
 * `> [!WARNING]` (or `> [!NOTE]` for "Info:") box instead of body text.
 * "note" and "pro tip" are deliberately absent: short inline `**Note:**`
 * asides are the author's voice (see src/content/posts/AGENTS.md).
 */
const PSEUDO_CALLOUT_LABELS = new Set([
  'warning', 'important', 'caution', 'attention', 'danger', 'info'
]);

// `[!type]` at the start of a line's text, any case — the loose net that
// catches malformed markers so they can be diagnosed precisely.
const MARKER_PATTERN = /^\[!\s*([A-Za-z][A-Za-z-]*)\s*\](.*)$/u;
// A bold lead: `**Label:**` / `**Label!**` / `**Label**` as the very first
// thing on the line. The label is captured without its punctuation.
const BOLD_LEAD_PATTERN = /^\*\*([^*\n]+?)[:!]?\*\*/u;
// A pseudo-callout lead must carry its urgency punctuation, inside or outside
// the bold (`**Important:**` / `**Important**:`) — a bare `**Warning**` is
// referential prose, not a mislabelled callout.
const PSEUDO_BOLD_LEAD_PATTERN = /^\*\*([^*\n]+?)(?:[:!]\*\*|\*\*[:!])/u;
// An unbolded urgency lead: `Warning! ...` / `Important: ...` opening a
// paragraph (the archived getCustomer warning was exactly this shape).
const PLAIN_LEAD_PATTERN = /^([A-Za-z]+)[:!]\s/u;
const QUOTE_LINE_PATTERN = /^ {0,3}>/u;
// Markdown treats 4+ spaces (or a tab) of indentation as a code block, so
// checks that read a line as prose only run when it starts in columns 0-3.
const PROSE_COLUMN_PATTERN = /^ {0,3}\S/u;

/**
 * Mask filler. NUL is not whitespace, so `trim()` keeps masked spans: a
 * masked code block inside a callout still counts as callout content, and a
 * line that starts with a masked span never anchors a line-start pattern.
 * (Written as an escape on purpose — a literal NUL makes git treat the source
 * as binary.)
 */
const MASK_CHAR = '\u0000';

/**
 * Blank every character except newlines and `>`. Keeping `>` preserves
 * blockquote structure through masked regions: a fenced code block inside a
 * callout neither splits the quote (which would mis-scope the block checks)
 * nor hides a literal `[!TYPE]` line that follows it in the same quote.
 */
function blank(region) {
  return region.replace(/[^\n>]/gu, MASK_CHAR);
}

/** Mask regions where alert syntax is quoted, not used. Length-preserving. */
function maskNonProse(source) {
  return source
    .replace(/```[\s\S]*?(?:```|$)/gu, blank)
    .replace(/~~~[\s\S]*?(?:~~~|$)/gu, blank)
    .replace(/`[^`\n]*`/gu, blank)
    .replace(/<!--[\s\S]*?-->/gu, blank);
}

/** Strip mask characters from text echoed back in a report. */
function display(text) {
  return text.replace(/\u0000+/gu, '…');
}

/** Lines occupied by a leading front-matter block (0 when there is none). */
function frontMatterLineCount(source) {
  const match = /^---\r?\n[\s\S]*?\r?\n---[ \t]*\r?\n?/u.exec(source);
  return match ? (match[0].match(/\n/gu) ?? []).length : 0;
}

function normalizeBoldLabel(lead) {
  return lead.trim().toLowerCase();
}

/**
 * Whether `line`, immediately following a blockquote, reads as a CommonMark
 * lazy continuation of it (paragraph text) rather than a new block (blank
 * line, heading, list item, fence, table row, HTML, another quote). A
 * CLOSING shortcode tag ({{< /when-published >}}) is also a block boundary:
 * when the callout sits inside a paired shortcode, Hugo's parser consumes
 * the closer before Goldmark ever runs, so it is never quote content. An
 * OPENING or standalone tag is the opposite case — Hugo replaces it (or the
 * whole paired region) with an inline placeholder on that line, which
 * Goldmark lazily continues into the quote, rendering the shortcode's
 * output inside the callout box (verified with Hugo 0.163) — so those lines
 * must still count as continuations.
 */
function isLazyContinuation(line) {
  const trimmed = line.trim();
  if (trimmed === '') {
    return false;
  }
  return !/^(?:#{1,6}\s|[-*+]\s|\d{1,9}[.)]\s|>|\||<|```|~~~|\{\{[%<]\s*\/)/u.test(trimmed);
}

/**
 * Diagnose one blockquote (array of { line, text } with the `>` prefix
 * stripped) and append findings. `followingLine` is the raw line right after
 * the quote (empty string at end of file) — needed to tell an empty callout
 * from a lazily-continued one.
 */
function checkBlockquote(quote, findings, followingLine) {
  const [first, ...rest] = quote;
  const marker = MARKER_PATTERN.exec(first.text.trim());

  // Marker-like lines after the first render as literal text.
  for (const entry of rest) {
    if (MARKER_PATTERN.test(entry.text.trim())) {
      findings.push({
        type: 'marker-not-first',
        line: entry.line,
        found: display(entry.text.trim()),
        message:
          'alert marker is not on the first line of its blockquote, so it publishes as literal text — start a new `> [!TYPE]` blockquote'
      });
    }
  }

  if (!marker) {
    return;
  }

  const rawType = marker[1];
  const upperType = rawType.toUpperCase();
  const trailing = marker[2].trim();

  if (!THEME_ALERT_TYPES.has(upperType)) {
    const suggestion = TYPE_SUGGESTIONS[upperType];
    findings.push({
      type: 'unknown-type',
      line: first.line,
      found: `[!${rawType}]`,
      message:
        `the theme only styles ${[...THEME_ALERT_TYPES].map((t) => `[!${t}]`).join(', ')}` +
        (suggestion ? ` — use [!${suggestion}] instead` : ' — pick the closest one')
    });
  } else if (rawType !== upperType) {
    findings.push({
      type: 'type-case',
      line: first.line,
      found: `[!${rawType}]`,
      message: `alert type must be uppercase: [!${upperType}]`
    });
  }

  if (trailing !== '') {
    findings.push({
      type: 'trailing-text',
      line: first.line,
      found: display(first.text.trim()),
      message:
        'text after the alert marker is dropped by the theme — put it on its own `> ` line below the marker'
    });
  }

  const lastLine = quote[quote.length - 1].line;
  if (isLazyContinuation(followingLine)) {
    findings.push({
      type: 'lazy-continuation',
      line: lastLine + 1,
      found: display(followingLine.trim().slice(0, 60)),
      message:
        'callout content continues on an unquoted line — Hugo renders it inside the box today, but a blank line or reflow silently drops it out; prefix every content line with `>`'
    });
  }

  const contentLines = rest.filter((entry) => entry.text.trim() !== '');
  if (trailing === '' && contentLines.length === 0 && !isLazyContinuation(followingLine)) {
    findings.push({
      type: 'empty-callout',
      line: first.line,
      found: display(first.text.trim()),
      message:
        'callout has no content — the box renders as a bare label and the next paragraph stays outside it; quote the content lines with `>`'
    });
    return;
  }

  const firstContent = contentLines[0];
  if (firstContent) {
    const bold = BOLD_LEAD_PATTERN.exec(firstContent.text.trim());
    if (bold && REDUNDANT_LABELS.has(normalizeBoldLabel(bold[1]))) {
      findings.push({
        type: 'redundant-label',
        line: firstContent.line,
        found: display(bold[0]),
        message:
          `the theme already renders the "${upperType.charAt(0)}${upperType.slice(1).toLowerCase()}" label — drop the bold mini-title (or replace it with a meaningful one)`
      });
    }
  }
}

/**
 * Analyse one document's raw source. Returns findings sorted by line, with
 * line numbers relative to the whole file (front matter included).
 */
function analyzeSource(source) {
  const findings = [];
  const fmLines = frontMatterLineCount(source);
  const body = source.split(/\r?\n/u).slice(fmLines).join('\n');
  const lines = maskNonProse(body).split('\n');

  let quote = null;
  const flush = (followingLine) => {
    if (quote) {
      checkBlockquote(quote, findings, followingLine);
      quote = null;
    }
  };

  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index];
    const line = fmLines + index + 1;

    if (QUOTE_LINE_PATTERN.test(raw)) {
      const text = raw.replace(/^ {0,3}> ?/u, '');
      (quote ??= []).push({ line, text });
      continue;
    }
    flush(raw);

    // 4+ spaces (or a tab) of indentation is a code block, not prose.
    if (!PROSE_COLUMN_PATTERN.test(raw)) {
      continue;
    }
    const trimmed = raw.trim();

    if (MARKER_PATTERN.test(trimmed)) {
      findings.push({
        type: 'missing-quote',
        line,
        found: display(trimmed),
        message:
          'alert marker outside a blockquote publishes as literal text — prefix the marker and its content lines with `>`'
      });
      continue;
    }

    const lead = PSEUDO_BOLD_LEAD_PATTERN.exec(trimmed) ?? PLAIN_LEAD_PATTERN.exec(trimmed);
    if (lead && PSEUDO_CALLOUT_LABELS.has(normalizeBoldLabel(lead[1]))) {
      const suggested = normalizeBoldLabel(lead[1]) === 'info' ? 'NOTE' : 'WARNING';
      findings.push({
        type: 'bold-pseudo-callout',
        line,
        found: display(lead[0].trim()),
        message:
          `"${lead[1].trim()}" paragraph should be a real callout — convert it to \`> [!${suggested}]\` (drop the label)`
      });
    }
  }
  flush('');

  return findings.sort((left, right) => left.line - right.line);
}

// --- file gathering ----------------------------------------------------------

function isContentMarkdown(file) {
  return (
    file.startsWith(CONTENT_PREFIX) &&
    file.endsWith('.md') &&
    // AGENTS.md cites both correct and broken callout patterns verbatim.
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

async function listAllContentFiles() {
  const contentDir = path.join(REPO_ROOT, CONTENT_PREFIX);
  let entries;
  try {
    entries = await fs.readdir(contentDir, { recursive: true, withFileTypes: true });
  } catch {
    return [];
  }
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
    read = (file) => fs.readFile(path.join(REPO_ROOT, file), 'utf8');
  } else if (args.files.length > 0) {
    files = args.files.map((file) => path.relative(REPO_ROOT, path.resolve(file)));
    read = (file) => fs.readFile(path.join(REPO_ROOT, file), 'utf8');
  } else {
    console.error('usage: node scripts/gates/check-callouts.js --staged | --all | <file.md> [...]');
    process.exitCode = 2;
    return;
  }

  if (files.length === 0) {
    if (args.all) {
      // The --all sweep is the CI backstop; finding nothing to sweep means a
      // broken checkout, and a silent green here would defeat the backstop.
      console.error(`callout gate: --all found no content files under ${CONTENT_PREFIX} — broken checkout?`);
      process.exitCode = 2;
      return;
    }
    console.log('callout gate: no staged content files; nothing to check.');
    return;
  }

  const findings = [];
  for (const file of files) {
    const source = await read(file);
    for (const finding of analyzeSource(source)) {
      findings.push({ ...finding, file });
    }
  }

  if (findings.length === 0) {
    console.log(
      `callout gate: ${files.length} file(s) use only ${[...THEME_ALERT_TYPES].map((t) => `[!${t}]`).join('/')} callouts with well-formed markers and labels.`
    );
    return;
  }

  console.error(`callout gate: found ${findings.length} issue(s) in ${files.length} file(s):`);
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line}  ${finding.type}: "${finding.found}" — ${finding.message}`);
    if (process.env.GITHUB_ACTIONS) {
      console.error(
        `::error file=${finding.file},line=${finding.line},title=callout gate::${finding.type}: ${finding.message}`
      );
    }
  }
  console.error(
    'Fix the callout(s) above; the theme contract lives in src/layouts/_default/_markup/render-blockquote.html. Bypass once with SKIP_CALLOUT_CHECK=1 git commit.'
  );
  process.exitCode = 1;
}

export {
  THEME_ALERT_TYPES,
  TYPE_SUGGESTIONS,
  REDUNDANT_LABELS,
  PSEUDO_CALLOUT_LABELS,
  analyzeSource,
  maskNonProse,
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
