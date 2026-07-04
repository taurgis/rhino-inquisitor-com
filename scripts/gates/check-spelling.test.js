import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  MISSPELLINGS,
  DOUBLED_WORDS,
  createSpeller,
  maskNonProse,
  analyzeSource,
  loadAllowlist
} from './check-spelling.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const gatePath = path.join(repoRoot, 'scripts/gates/check-spelling.js');
const speller = createSpeller();

function foundWords(findings) {
  return findings.map((finding) => finding.found);
}

// --- dictionary and allowlist integrity -------------------------------------

test('dictionary integrity: keys are lowercase, single-token, and not self-correcting', () => {
  for (const [misspelling, correction] of Object.entries(MISSPELLINGS)) {
    assert.equal(misspelling, misspelling.toLowerCase(), `key "${misspelling}" must be lowercase`);
    assert.match(misspelling, /^[a-z']+$/u, `key "${misspelling}" must be a single ASCII word`);
    assert.ok(correction.length > 0, `"${misspelling}" must have a correction`);
    assert.notEqual(
      misspelling,
      correction.toLowerCase(),
      `"${misspelling}" must not be its own correction`
    );
  }
});

test('dictionary integrity: no correction is itself a flagged misspelling', () => {
  for (const [misspelling, correction] of Object.entries(MISSPELLINGS)) {
    for (const word of correction.toLowerCase().split(/\s+/u)) {
      assert.equal(
        Object.hasOwn(MISSPELLINGS, word),
        false,
        `correction "${word}" for "${misspelling}" is itself flagged as a misspelling`
      );
    }
  }
});

test('allowlist does not shadow (silently disable) any dictionary entry', async () => {
  const allowlist = await loadAllowlist();
  for (const word of allowlist) {
    assert.equal(
      Object.hasOwn(MISSPELLINGS, word),
      false,
      `allowlisted word "${word}" is in the dictionary, so it can never be flagged — remove one`
    );
  }
});

test('project word list is clean: lowercase, single-token entries', async () => {
  const allowlist = await loadAllowlist();
  for (const word of allowlist) {
    assert.match(word, /^[a-z][a-z'’-]*$/u, `project word "${word}" should be a single lowercase token`);
  }
});

// --- curated misspellings ---------------------------------------------------

test('detects a known misspelling and suggests the correction', () => {
  const findings = analyzeSource('We recieve the payload.', { speller });
  const spelling = findings.filter((finding) => finding.type === 'spelling');
  assert.equal(spelling.length, 1);
  assert.equal(spelling[0].found, 'recieve');
  assert.equal(spelling[0].suggestion, 'receive');
  assert.equal(spelling[0].line, 1);
});

test('respects the allowlist', () => {
  const withoutAllow = analyzeSource('A recieve here.', { speller });
  assert.equal(withoutAllow.length, 1);
  const withAllow = analyzeSource('A recieve here.', { speller, allowlist: new Set(['recieve']) });
  assert.equal(withAllow.length, 0);
});

// --- dictionary check -------------------------------------------------------

test('flags a word neither dictionary nor the project list knows', () => {
  const findings = analyzeSource('This frobnicator is here.', { speller });
  assert.deepEqual(foundWords(findings), ['frobnicator']);
  assert.equal(findings[0].type, 'unknown-word');
});

test('an unknown word can be cleared via the allowlist', () => {
  const findings = analyzeSource('This frobnicator is here.', {
    speller,
    allowlist: new Set(['frobnicator'])
  });
  assert.deepEqual(findings, []);
});

test('accepts British spelling and flags American variants', () => {
  assert.deepEqual(
    analyzeSource('We favour the colour and organise the catalogue.', { speller }),
    [],
    'British spellings pass'
  );
  const american = analyzeSource('We favor the color and optimise the catalog.', { speller });
  assert.deepEqual(
    american.map((finding) => finding.found).sort(),
    ['catalog', 'color', 'favor'].sort(),
    'American variants are flagged'
  );
});

test('British generically, but accepts the Authorization/Organization identifiers', async () => {
  const allowlist = await loadAllowlist();
  // Generic prose is British and passes.
  assert.deepEqual(
    analyzeSource('A well-organised authorisation model helps the organisation.', { speller, allowlist }),
    []
  );
  // The literal HTTP header and SLAS field identifiers are allowlisted American.
  assert.deepEqual(
    analyzeSource('Send the Authorization header with your Organization ID.', { speller, allowlist }),
    []
  );
});

test('does not flag acronyms or code-style identifiers in prose', () => {
  assert.deepEqual(analyzeSource('Call the OCAPI getProps hook via SCAPI.', { speller }), []);
});

test('checks front-matter title and description, not keys or url', () => {
  const source = [
    '---',
    'title: A frobnicator guide',
    'description: Nothing wrong here.',
    'url: /a-frobnicator-guide/',
    '---',
    'Body text is fine.'
  ].join('\n');
  const findings = analyzeSource(source, { speller });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].found, 'frobnicator');
  assert.equal(findings[0].field, 'title');
});

// --- masking ----------------------------------------------------------------

test('ignores misspellings inside inline code and fenced code blocks', () => {
  const source = ['Use `recieve` carefully.', '', '```', 'const recieve = 1;', '```'].join('\n');
  assert.deepEqual(analyzeSource(source, { speller }), []);
});

test('ignores misspelling-like fragments inside URLs and link targets', () => {
  const source = 'See [the docs](https://example.com/recieve/frobnicator) for details.';
  assert.deepEqual(analyzeSource(source, { speller }), []);
});

test('masks long URLs that contain parentheses', () => {
  const source = 'Open [it](https://viewer.example.com/?title=Thing%20(v2)&data=frobnicatorxyzzy) now.';
  assert.deepEqual(analyzeSource(source, { speller }), []);
});

test('masks @-mention link text', () => {
  assert.deepEqual(analyzeSource('Thanks [@frobnicator](https://github.com/frobnicator)!', { speller }), []);
});

test('maskNonProse preserves line count so offsets stay accurate', () => {
  const source = 'line one\n```\ncode\n```\nline five';
  const masked = maskNonProse(source);
  assert.equal(masked.split('\n').length, source.split('\n').length);
});

// --- repeated words ---------------------------------------------------------

test('detects an accidentally doubled function word', () => {
  const findings = analyzeSource('See the the docs.', { speller });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].type, 'repeated-word');
  assert.equal(findings[0].suggestion, 'the');
});

test('doubled-word check ignores valid and capitalised doubles', () => {
  assert.deepEqual(analyzeSource('I had had enough by then.', { speller }), [], 'had had is valid');
  assert.deepEqual(
    analyzeSource('The reason is that that server failed.', { speller }),
    [],
    'that that is valid'
  );
});

test('the safelist and dictionary are non-empty', () => {
  assert.ok(Object.keys(MISSPELLINGS).length > 0);
  assert.ok(DOUBLED_WORDS.size > 0);
});

// --- CLI --------------------------------------------------------------------

test('CLI exits 0 on clean content and 1 on a seeded typo', async () => {
  const workDir = await mkdtemp(path.join(os.tmpdir(), 'spelling-gate-'));
  try {
    const contentDir = path.join(workDir, 'content');
    await mkdir(contentDir, { recursive: true });

    await writeFile(path.join(contentDir, 'clean.md'), 'This sentence is perfectly fine.\n', 'utf8');
    const clean = await runGate(contentDir);
    assert.equal(clean.code, 0, clean.stderr);

    await writeFile(path.join(contentDir, 'bad.md'), 'This has a definately wrong word.\n', 'utf8');
    const dirty = await runGate(contentDir);
    assert.equal(dirty.code, 1);
    assert.match(dirty.stderr, /definately/u);
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
});

function runGate(contentDir) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [gatePath, '--content-dir', contentDir], {
      cwd: repoRoot
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}
