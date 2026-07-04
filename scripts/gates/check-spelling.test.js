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
  PHRASE_ERRORS,
  createSpeller,
  maskNonProse,
  expectedArticle,
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
    assert.equal(
      Object.hasOwn(PHRASE_ERRORS, word),
      false,
      `allowlisted phrase "${word}" would silently disable the error-phrase check for it — remove one`
    );
  }
});

test('project word list is clean: lowercase words or phrases', async () => {
  const allowlist = await loadAllowlist();
  for (const word of allowlist) {
    assert.match(
      word,
      /^[a-z][a-z'’-]*(?: [a-z][a-z'’-]*)*$/u,
      `project word "${word}" should be a lowercase word or space-separated phrase`
    );
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
  const american = analyzeSource('We favor the color and optimise the behavior.', { speller });
  assert.deepEqual(
    american.map((finding) => finding.found).sort(),
    ['behavior', 'color', 'favor'].sort(),
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

test('allowlisted phrases pass without accepting their words elsewhere', () => {
  const allowlist = new Set(['log center']);
  // The proper-noun phrase is accepted...
  assert.deepEqual(analyzeSource('Open the Log Center to view logs.', { speller, allowlist }), []);
  // ...but generic American "center" is still flagged (British "centre" enforced).
  const generic = analyzeSource('Visit the data center today.', { speller, allowlist });
  assert.deepEqual(generic.map((f) => f.found), ['center']);
});

test('does not flag acronyms or code-style identifiers in prose', () => {
  assert.deepEqual(analyzeSource('Call the OCAPI getProps hook via SCAPI.', { speller }), []);
});

test('un- words with a vowel stem keep "an"', () => {
  assert.deepEqual(analyzeSource('We hit an unidentified error.', { speller }), []);
});

test('a takeaway that repeats earlier front-matter text reports its own line', () => {
  const source = [
    '---',
    'title: Something else',
    'description: Use the bridge to connect systems togther and more.',
    'takeaways:',
    '  - "Use the bridge to connect systems togther"',
    '---',
    'Body fine.'
  ].join('\n');
  const findings = analyzeSource(source, { speller });
  const byField = Object.fromEntries(findings.map((finding) => [finding.field, finding.line]));
  assert.equal(byField.description, 3);
  assert.equal(byField.takeaways, 5, 'takeaway finding points at the takeaway, not the description');
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

test('doubled-word check ignores valid doubles', () => {
  assert.deepEqual(analyzeSource('I had had enough by then.', { speller }), [], 'had had is valid');
  assert.deepEqual(
    analyzeSource('The reason is that that server failed.', { speller }),
    [],
    'that that is valid'
  );
});

test('doubled-word check ignores proper nouns, labels, and digit-glued tokens', () => {
  assert.deepEqual(
    analyzeSource('Will Will Smith star in the sequel?', { speller }),
    [],
    'a doubled name is not a typo'
  );
  assert.deepEqual(
    analyzeSource('Go with Plan A a.k.a. the fallback.', { speller }),
    [],
    'label + article is not a doubled word'
  );
  assert.deepEqual(
    analyzeSource('Leave a 2in in the margin.', { speller }),
    [],
    'digit-glued token is one word, not a double'
  );
});

test('doubled-word check does not pair words across a masked code span', () => {
  assert.deepEqual(
    analyzeSource('Pass the `id` the server returns.', { speller }),
    [],
    'the `code` the is valid prose'
  );
});

test('detects a doubled word across a capitalised sentence start', () => {
  const findings = analyzeSource('The the server restarts.', { speller });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].type, 'repeated-word');
});

test('doubled-word check ignores hyphenated compounds', () => {
  assert.deepEqual(
    analyzeSource('Adds support for Apple Web Sign-In in SFRA projects.', {
      speller,
      allowlist: new Set(['sfra'])
    }),
    []
  );
});

test('the safelist and dictionary are non-empty', () => {
  assert.ok(Object.keys(MISSPELLINGS).length > 0);
  assert.ok(DOUBLED_WORDS.size > 0);
});

// --- error phrases ------------------------------------------------------------

test('phrase dictionary integrity: lowercase multi-word keys with corrections', () => {
  for (const [phrase, correction] of Object.entries(PHRASE_ERRORS)) {
    assert.equal(phrase, phrase.toLowerCase(), `key "${phrase}" must be lowercase`);
    assert.ok(phrase.includes(' '), `key "${phrase}" must be multi-word`);
    assert.ok(correction.length > 0, `"${phrase}" must have a correction`);
    assert.notEqual(phrase, correction.toLowerCase(), `"${phrase}" must not be its own correction`);
  }
});

test('detects curated error phrases the dictionary cannot see', () => {
  const findings = analyzeSource('You should of tested more then once before trying to setup JWT.', {
    speller
  });
  assert.deepEqual(
    findings.map((finding) => `${finding.found} -> ${finding.suggestion}`).sort(),
    [
      'more then -> more than',
      'should of -> should have',
      'to setup -> to set up'
    ]
  );
  assert.ok(findings.every((finding) => finding.type === 'phrase'));
});

test('a capitalised compound noun reads as a proper noun, but title-case errors still flag', () => {
  // "to Setup" as a named page is left alone...
  assert.deepEqual(analyzeSource('Navigate to Setup in the admin.', { speller }), []);
  // ...but a then/than mistake in a title-case heading is still an error.
  const heading = analyzeSource('## More Then You Think', { speller });
  assert.equal(heading.length, 1);
  assert.equal(heading[0].type, 'phrase');
  assert.equal(heading[0].suggestion, 'more than');
});

// --- article agreement --------------------------------------------------------

test('expectedArticle follows opening sound, initialisms, and numbers', () => {
  const cases = [
    ['SFCC', 'an'], ['HTML', 'an'], ['XML', 'an'], ['URL', 'a'], ['UUID', 'a'],
    ['API', 'an'], ['JSON', 'a'], ['HTTPError', 'an'], ['S3', 'an'],
    ['npm', 'an'], ['REST', 'a'], ['LINK', 'a'], ['SLAS', 'a'], ['SCAPI', 'a'],
    ['user', 'a'], ['unique', 'a'], ['university', 'a'], ['unusual', 'an'],
    ['uninstalled', 'an'], ['unidentified', 'an'], ['unidirectional', 'a'],
    ['European', 'a'], ['one-off', 'a'],
    ['hour', 'an'], ['honest', 'an'], ['hook', 'a'],
    ['error', 'an'], ['server', 'a'], ['useEffect', 'a'],
    ['8-second', 'an'], ['11th', 'an'], ['404', 'a'], ['30-minute', 'a']
  ];
  for (const [word, article] of cases) {
    assert.equal(expectedArticle(word), article, `${article} ${word}`);
  }
});

test('expectedArticle with a speller treats ambiguous all-caps words as either-article', () => {
  const cases = [
    ['MUST', null], ['GET', null], // caps-for-emphasis / HTTP verbs: word-read plausible
    ['SPA', null], ['SAP', null], // letter-read acronyms whose lowercase is a word
    ['SLAs', 'an'], // mixed-case plural of SLA is letter-read, not the SLAS acronym
    ['US', 'a'], ['IT', 'an'], // two-letter tokens stay letter-read
    ['REST', 'a'] // WORD_ACRONYMS stays deterministic
  ];
  for (const [word, article] of cases) {
    assert.equal(expectedArticle(word, speller), article, `${article} ${word}`);
  }
});

test('flags article disagreement and preserves capitalisation in the suggestion', () => {
  const findings = analyzeSource('An Salesforce cartridge. Also a SFCC instance.', { speller });
  assert.deepEqual(
    findings.map((finding) => `${finding.found} -> ${finding.suggestion}`).sort(),
    ['An Salesforce -> A Salesforce', 'a SFCC -> an SFCC']
  );
  assert.ok(findings.every((finding) => finding.type === 'article'));
});

test('article check skips the A of Q&A and articles before masked spans', () => {
  assert.deepEqual(analyzeSource('We host a Q&A at the end.', { speller }), []);
  // `option` is masked; "an" must not pair with "value".
  assert.deepEqual(analyzeSource('Pass an `option` value here.', { speller }), []);
});

test('a bare capital A mid-sentence is a label, at a sentence start an article', () => {
  assert.deepEqual(
    analyzeSource('Choose between option A and option B.', { speller }),
    [],
    'option labels are not articles'
  );
  assert.deepEqual(analyzeSource('Appendix A explains the flow.', { speller }), []);
  const sentenceStart = analyzeSource('A API endpoint responds.', { speller });
  assert.equal(sentenceStart.length, 1);
  assert.equal(sentenceStart[0].suggestion, 'An API');
});

test('caps-for-emphasis words and mixed-case plurals do not trip the article check', () => {
  assert.deepEqual(analyzeSource('This cartridge is a MUST for merchants.', { speller }), []);
  assert.deepEqual(analyzeSource('We fire a GET request first.', { speller }), []);
  assert.deepEqual(
    analyzeSource('The team ran an SLAs review yesterday.', { speller }),
    [],
    'SLAs (plural of SLA) is letter-read, unlike the SLAS acronym'
  );
});

test('a false-positive article pairing can be suppressed with an allowlist phrase', () => {
  // House style reads SLAS as a word ("a SLAS token"); a post that spells it
  // out letter by letter can keep "an SLAS" via a phrase entry.
  const source = 'Request an SLAS token.';
  assert.equal(analyzeSource(source, { speller }).length, 1);
  assert.deepEqual(analyzeSource(source, { speller, allowlist: new Set(['an slas']) }), []);
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
