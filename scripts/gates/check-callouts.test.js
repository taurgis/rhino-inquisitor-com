import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  THEME_ALERT_TYPES,
  TYPE_SUGGESTIONS,
  analyzeSource,
  listAllContentFiles
} from './check-callouts.js';

const REPO_ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));

const FRONT_MATTER = `---\ntitle: Test\nurl: /test/\ndraft: false\n---\n`;

function types(findings) {
  return findings.map((finding) => finding.type);
}

// --- passing shapes -----------------------------------------------------------

test('a well-formed callout with content passes', () => {
  const body = '> [!NOTE]\n> The permission paths cannot intersect each other.\n';
  assert.deepEqual(analyzeSource(FRONT_MATTER + body), []);
});

test('all three theme-supported types pass', () => {
  for (const type of THEME_ALERT_TYPES) {
    const body = `> [!${type}]\n> Some content.\n`;
    assert.deepEqual(analyzeSource(body), []);
  }
});

test('a meaningful bold mini-title inside a callout passes', () => {
  const body =
    '> [!NOTE]\n> **Updated 26 July 2025:** This article was refreshed.\n\n' +
    '> [!WARNING]\n> **Deprecated:** the v1 hook is discouraged.\n';
  assert.deepEqual(analyzeSource(body), []);
});

test('a multi-paragraph callout with a list passes', () => {
  const body = '> [!WARNING]\n> The requirements are:\n>\n> - Twelve characters.\n> - No reuse.\n';
  assert.deepEqual(analyzeSource(body), []);
});

test('a plain **Note:** aside stays allowed (house voice)', () => {
  const body = '**Note:** The PWA Kit is only responsible for the front end.\n';
  assert.deepEqual(analyzeSource(body), []);
});

test('an ordinary blockquote without a marker passes', () => {
  const body = '> Only GET calls can be cached.\n';
  assert.deepEqual(analyzeSource(body), []);
});

test('alert syntax inside fenced code and inline code is ignored', () => {
  const body =
    'Use the alert syntax:\n\n```markdown\n> [!IMPORTANT]\n> demo\n```\n\n' +
    'Write `> [!NOTE]` on the first line. Or:\n\n~~~\n[!CAUTION]\n~~~\n';
  assert.deepEqual(analyzeSource(body), []);
});

test('a fenced code block inside a callout is content, not an empty callout', () => {
  const withIntro = '> [!WARNING]\n> Run this first:\n>\n> ```js\n> var x = 1;\n> ```\n';
  assert.deepEqual(analyzeSource(withIntro), []);
  const fenceOnly = '> [!NOTE]\n> ```\n> code\n> ```\n';
  assert.deepEqual(analyzeSource(fenceOnly), []);
});

test('a literal marker after an in-callout fence is still caught', () => {
  const body = '> [!NOTE]\n> ```\n> code\n> ```\n> [!WARNING]\n> text\n';
  assert.deepEqual(types(analyzeSource(body)), ['marker-not-first']);
});

test('alert syntax inside a 4-space indented code block is ignored', () => {
  const body = 'Example:\n\n    [!NOTE] inside indented code\n    **Important:** also code\n';
  assert.deepEqual(analyzeSource(body), []);
});

test('CRLF sources are handled', () => {
  const body = '---\r\ntitle: t\r\n---\r\n> [!IMPORTANT]\r\n> Content.\r\n';
  assert.deepEqual(types(analyzeSource(body)), ['unknown-type']);
});

// --- blocking shapes ----------------------------------------------------------

test('an alert type the theme does not style is flagged with a suggestion', () => {
  const findings = analyzeSource('> [!IMPORTANT]\n> Turn the switch on per environment.\n');
  assert.deepEqual(types(findings), ['unknown-type']);
  assert.match(findings[0].message, /\[!WARNING\]/);
});

test('every curated type suggestion maps to a theme-styled type', () => {
  for (const [from, to] of Object.entries(TYPE_SUGGESTIONS)) {
    assert.ok(THEME_ALERT_TYPES.has(to), `${from} -> ${to}`);
    const findings = analyzeSource(`> [!${from}]\n> Content.\n`);
    assert.deepEqual(types(findings), ['unknown-type']);
    assert.match(findings[0].message, new RegExp(`\\[!${to}\\]`));
  }
});

test('a lowercase or mixed-case marker is flagged', () => {
  for (const bad of ['note', 'Note', 'wArNiNg']) {
    const findings = analyzeSource(`> [!${bad}]\n> Content.\n`);
    assert.deepEqual(types(findings), ['type-case'], bad);
  }
});

test('text on the marker line is flagged (the theme drops it)', () => {
  const findings = analyzeSource('> [!NOTE] Remember to test this.\n> More content.\n');
  assert.deepEqual(types(findings), ['trailing-text']);
});

test('a marker with no quoted content is flagged as empty', () => {
  const findings = analyzeSource('> [!NOTE]\n\nThis paragraph was meant to be inside the box.\n');
  assert.deepEqual(types(findings), ['empty-callout']);
});

test('unquoted content after a callout is flagged as a lazy continuation', () => {
  // CommonMark lazy continuation: this renders INSIDE the box today, so it
  // must not be reported as empty — the box is fragile, not empty.
  const bare = analyzeSource('> [!NOTE]\nlazy continuation content here\n');
  assert.deepEqual(types(bare), ['lazy-continuation']);
  const afterContent = analyzeSource('> [!NOTE]\n> Quoted line.\nlazy trailing line\n');
  assert.deepEqual(types(afterContent), ['lazy-continuation']);
});

test('a block start after a callout is not a lazy continuation', () => {
  const body = '> [!NOTE]\n> Content.\n## Next heading\n\n> [!TIP]\n> Content.\n- a list item\n';
  assert.deepEqual(analyzeSource(body), []);
});

test('a redundant generic bold mini-title is flagged', () => {
  const cases = [
    ['NOTE', '**Note:**'],
    ['NOTE', '**Info:**'],
    ['WARNING', '**Important:**'],
    ['WARNING', '**important!**']
  ];
  for (const [type, label] of cases) {
    const findings = analyzeSource(`> [!${type}]\n> ${label} the paths cannot intersect.\n`);
    assert.deepEqual(types(findings), ['redundant-label'], `${type} ${label}`);
  }
});

test('a marker deeper inside a blockquote is flagged as literal text', () => {
  const findings = analyzeSource('> Some quote text.\n> [!NOTE]\n> More text.\n');
  assert.deepEqual(types(findings), ['marker-not-first']);
});

test('a marker outside any blockquote is flagged', () => {
  const findings = analyzeSource('[!WARNING]\nThis renders as literal text.\n');
  assert.deepEqual(types(findings), ['missing-quote']);
});

test('a bold urgency paragraph outside a callout is flagged', () => {
  const findings = analyzeSource('**Important:** This switch has to be turned on separately.\n');
  assert.deepEqual(types(findings), ['bold-pseudo-callout']);
  assert.match(findings[0].message, /\[!WARNING\]/);
});

test('an unbolded urgency lead is flagged (the archived getCustomer shape)', () => {
  const findings = analyzeSource('Warning! The example I have used is insecure.\n');
  assert.deepEqual(types(findings), ['bold-pseudo-callout']);
});

test('a bold **Info:** paragraph suggests a NOTE callout', () => {
  const findings = analyzeSource('**Info:** This article was updated in July 2025.\n');
  assert.deepEqual(types(findings), ['bold-pseudo-callout']);
  assert.match(findings[0].message, /\[!NOTE\]/);
});

test('punctuation outside the bold is also a pseudo-callout', () => {
  const findings = analyzeSource('**Important**: This switch is per environment.\n');
  assert.deepEqual(types(findings), ['bold-pseudo-callout']);
});

test('a bare bold urgency word without punctuation is referential prose', () => {
  const body =
    '**Warning** and **Error** log levels differ in retention.\n\n' +
    '**Important considerations** apply to both storefronts.\n';
  assert.deepEqual(analyzeSource(body), []);
});

test('an urgency word mid-sentence or as a heading is not flagged', () => {
  const body =
    '## Important considerations\n\nIt is important: test everything twice.\n\n' +
    'The warning: header disappeared after the fix.\n';
  const findings = analyzeSource(body).filter((f) => f.type === 'bold-pseudo-callout');
  // "The warning: ..." starts with "The", and headings/mid-sentence uses never
  // match the paragraph-lead pattern.
  assert.deepEqual(findings, []);
});

// --- line numbers -------------------------------------------------------------

test('findings report absolute line numbers (front matter included)', () => {
  const source = `${FRONT_MATTER}Intro paragraph.\n\n> [!IMPORTANT]\n> Content.\n`;
  const findings = analyzeSource(source);
  assert.equal(findings.length, 1);
  // Front matter spans lines 1-5, intro is 6, blank 7, marker on line 8.
  assert.equal(findings[0].line, 8);
});

// --- the six defects fixed in the 2026-07 callout sweep ------------------------

test('the pre-sweep defect shapes are all caught', () => {
  const sweep = [
    ['> [!NOTE]\n> **Note:** that the permission paths cannot intersect.\n', 'redundant-label'],
    ['**Important:** This switch has to be turned on separately in each environment.\n', 'bold-pseudo-callout'],
    ['> [!NOTE]\n> **Info:** This article was updated with the latest information.\n', 'redundant-label'],
    ['> [!WARNING]\n> **Important:** to note that developers will still need to learn.\n', 'redundant-label'],
    ['Warning! The example I have used (getCustomer) is insecure.\n', 'bold-pseudo-callout']
  ];
  for (const [body, expected] of sweep) {
    assert.deepEqual(types(analyzeSource(body)), [expected], body.slice(0, 40));
  }
});

// --- baseline contract ---------------------------------------------------------

test('baseline: every published content file passes the gate', async () => {
  const files = await listAllContentFiles();
  assert.ok(files.length > 100, `expected the full corpus, got ${files.length} files`);
  const failures = [];
  for (const file of files) {
    const source = await fs.readFile(path.join(REPO_ROOT, file), 'utf8');
    for (const finding of analyzeSource(source)) {
      failures.push(`${file}:${finding.line} ${finding.type} "${finding.found}"`);
    }
  }
  assert.deepEqual(failures, []);
});
