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
  maskNonProse,
  analyzeSource,
  loadAllowlist
} from './check-spelling.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const gatePath = path.join(repoRoot, 'scripts/gates/check-spelling.js');

function types(findings) {
  return findings.map((finding) => `${finding.type}:${finding.found}`);
}

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

test('detects a known misspelling and suggests the correction', () => {
  const findings = analyzeSource('We recieve the payload.');
  assert.equal(findings.length, 1);
  assert.equal(findings[0].type, 'spelling');
  assert.equal(findings[0].found, 'recieve');
  assert.equal(findings[0].suggestion, 'receive');
  assert.equal(findings[0].line, 1);
});

test('respects the allowlist', () => {
  const withoutAllow = analyzeSource('A recieve here.');
  assert.equal(withoutAllow.length, 1);
  const withAllow = analyzeSource('A recieve here.', new Set(['recieve']));
  assert.equal(withAllow.length, 0);
});

test('ignores misspellings inside inline code and fenced code blocks', () => {
  const source = ['Use `recieve` carefully.', '', '```', 'const recieve = 1;', '```'].join('\n');
  assert.deepEqual(analyzeSource(source), []);
});

test('ignores misspelling-like fragments inside URLs and link targets', () => {
  const source = 'See [the docs](https://example.com/recieve/seperate) for details.';
  assert.deepEqual(analyzeSource(source), []);
});

test('detects an accidentally doubled function word', () => {
  const findings = analyzeSource('See the the docs.');
  assert.equal(findings.length, 1);
  assert.equal(findings[0].type, 'repeated-word');
  assert.equal(findings[0].suggestion, 'the');
});

test('doubled-word check ignores valid and capitalised doubles', () => {
  assert.deepEqual(analyzeSource('I had had enough by then.'), [], 'had had is valid');
  assert.deepEqual(analyzeSource('The reason is that that server failed.'), [], 'that that is valid');
  assert.deepEqual(analyzeSource('Then Will Will spoke.'), [], 'capitalised proper nouns are skipped');
});

test('reports line numbers and de-duplicates repeats on the same line', () => {
  const source = ['clean line', 'a recieve and recieve again'].join('\n');
  const findings = analyzeSource(source);
  assert.equal(findings.length, 1, 'identical token on the same line is reported once');
  assert.equal(findings[0].line, 2);
});

test('maskNonProse preserves line count so offsets stay accurate', () => {
  const source = 'line one\n```\ncode\n```\nline five';
  const masked = maskNonProse(source);
  assert.equal(masked.split('\n').length, source.split('\n').length);
});

test('the safelist and dictionary are non-empty', () => {
  assert.ok(Object.keys(MISSPELLINGS).length > 0);
  assert.ok(DOUBLED_WORDS.size > 0);
});

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
