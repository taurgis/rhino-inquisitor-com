import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import fg from 'fast-glob';

import {
  DOMAIN_RULES,
  VALID_STRATEGIES,
  resolveDomainRule
} from './external-link-domains.js';
import {
  maskNonProse,
  extractExternalLinks,
  collectUnknownDomains,
  unknownDomainMessage,
  judgeStatus,
  judgeRenderedPage,
  checkStatusLink,
  verifyLinks
} from './check-external-links.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const gatePath = path.join(repoRoot, 'scripts/gates/check-external-links.js');

// --- baseline: every domain linked so far must resolve in the registry ------
//
// This is the contract the pre-commit hook relies on: existing content never
// trips the unknown-domain error, and any NEW domain someone links must be
// added to scripts/gates/external-link-domains.js before it can be committed.

test('baseline: every external domain linked from src/content is registered', async () => {
  const files = await fg('src/content/**/*.md', { cwd: repoRoot, absolute: true });
  assert.ok(files.length > 0, 'expected content files to exist');
  const unregistered = new Map();
  for (const file of files) {
    const source = await fs.readFile(file, 'utf8');
    for (const link of extractExternalLinks(source)) {
      if (link.malformed) continue; // reported per-article by the gate itself
      if (resolveDomainRule(link.host)) continue;
      if (!unregistered.has(link.host)) unregistered.set(link.host, []);
      unregistered.get(link.host).push(path.relative(repoRoot, file));
    }
  }
  assert.deepEqual(
    [...unregistered.keys()].sort(),
    [],
    `unregistered domains found; add them to scripts/gates/external-link-domains.js:\n` +
      [...unregistered.entries()]
        .map(([host, where]) => `  ${host} (${[...new Set(where)][0]})`)
        .join('\n')
  );
});

// --- registry integrity ------------------------------------------------------

test('registry integrity: hostnames are lowercase and strategies are valid', () => {
  for (const [domain, rule] of Object.entries(DOMAIN_RULES)) {
    assert.equal(domain, domain.toLowerCase(), `domain "${domain}" must be lowercase`);
    assert.match(
      domain,
      /^(\*\.)?[a-z0-9.-]+$/,
      `domain "${domain}" must be a hostname or *.suffix wildcard`
    );
    assert.ok(
      VALID_STRATEGIES.includes(rule.strategy),
      `domain "${domain}" has unknown strategy "${rule.strategy}"`
    );
  }
});

test('registry integrity: render entries can actually detect a dead page', () => {
  for (const [domain, rule] of Object.entries(DOMAIN_RULES)) {
    if (rule.strategy !== 'render') continue;
    const markers = [...(rule.deadMarkers ?? []), ...(rule.deadUrlPatterns ?? [])];
    assert.ok(
      markers.length > 0,
      `render domain "${domain}" needs deadMarkers or deadUrlPatterns`
    );
    for (const marker of markers) {
      assert.ok(marker instanceof RegExp, `markers for "${domain}" must be RegExps`);
    }
  }
});

test('registry integrity: skip entries state why they cannot be verified', () => {
  for (const [domain, rule] of Object.entries(DOMAIN_RULES)) {
    if (rule.strategy !== 'skip') continue;
    assert.ok(rule.reason?.length > 0, `skip domain "${domain}" needs a reason`);
  }
});

// --- async SFCC properties get the render strategy ---------------------------
//
// These Salesforce sites are client-rendered and answer the same HTTP shell
// for valid and invalid URLs (the exact failure mode behind the shipped 404),
// so a plain status check must never be considered sufficient for them.

for (const host of [
  'help.salesforce.com',
  'developer.salesforce.com',
  'trailhead.salesforce.com',
  'trailblazer.salesforce.com',
  'ideas.salesforce.com',
  'appexchange.salesforce.com'
]) {
  test(`async SPA baseline: ${host} uses the render strategy`, () => {
    assert.equal(resolveDomainRule(host)?.strategy, 'render');
  });
}

test('help.salesforce.com markers catch the SPA not-found page', () => {
  const rule = resolveDomainRule('help.salesforce.com');
  const dead = judgeRenderedPage(
    {
      finalUrl: 'https://help.salesforce.com/s/articleView?id=cc.b2c_gone.htm&type=5',
      text: "Sorry, we can't find the article you're looking for."
    },
    rule
  );
  assert.equal(dead.state, 'dead');
  const bounced = judgeRenderedPage(
    { finalUrl: 'https://help.salesforce.com/s/', text: 'Salesforce Help' },
    rule
  );
  assert.equal(bounced.state, 'dead');
  const alive = judgeRenderedPage(
    {
      finalUrl: 'https://help.salesforce.com/s/articleView?id=cc.b2c_access_files_webdav.htm&type=5',
      text: 'Access Files with WebDAV — use the folder browser to inspect impex.'
    },
    rule
  );
  assert.equal(alive.state, 'ok');
});

// --- domain resolution --------------------------------------------------------

test('resolveDomainRule: exact match, wildcard match, and unknown domains', () => {
  assert.equal(resolveDomainRule('github.com')?.strategy, 'status');
  assert.equal(resolveDomainRule('GITHUB.COM')?.strategy, 'status', 'case-insensitive');
  assert.equal(
    resolveDomainRule('production-eu01-mybrand.demandware.net')?.strategy,
    'skip',
    '*.demandware.net wildcard covers instance hostnames'
  );
  assert.equal(resolveDomainRule('api.example.com')?.strategy, 'skip');
  assert.equal(resolveDomainRule('definitely-new-domain.dev'), null);
  assert.equal(
    resolveDomainRule('evil-demandware.net'),
    null,
    'wildcard must not match lookalike apex domains'
  );
});

// --- extraction ---------------------------------------------------------------

const SAMPLE = `---
title: Sample
description: front matter link https://frontmatter.example.dev/ must be ignored
---
Intro with an [inline link](https://github.com/SalesforceCommerceCloud/pwa-kit) here.

\`\`\`javascript
fetch('https://in-code-block.example.dev/api');
\`\`\`

Inline code \`https://inline-code.example.dev/\` is also ignored, but a
[wiki link](https://en.wikipedia.org/wiki/WebDAV_(protocol)) with parentheses works,
as does an autolink <https://datatracker.ietf.org/doc/html/rfc4918> and raw HTML
<a href="https://developer.mozilla.org/en-US/docs/Web/HTTP">MDN</a>.

A [templated link](https://{shortCode}.api.commercecloud.salesforce.com/checkout) is skipped,
a [broken link](http://t) is malformed, and [internal links](/some-post/) are ignored.
`;

test('extraction: prose links only — front matter, code blocks, inline code masked', () => {
  const links = extractExternalLinks(SAMPLE);
  const urls = links.map((link) => link.url);
  assert.deepEqual(urls, [
    'https://github.com/SalesforceCommerceCloud/pwa-kit',
    'https://en.wikipedia.org/wiki/WebDAV_(protocol)',
    'https://datatracker.ietf.org/doc/html/rfc4918',
    'https://developer.mozilla.org/en-US/docs/Web/HTTP',
    'http://t'
  ]);
});

test('extraction: line numbers point at the original source lines', () => {
  const links = extractExternalLinks(SAMPLE);
  const byUrl = Object.fromEntries(links.map((link) => [link.url, link.line]));
  assert.equal(byUrl['https://github.com/SalesforceCommerceCloud/pwa-kit'], 5);
  assert.equal(byUrl['https://en.wikipedia.org/wiki/WebDAV_(protocol)'], 12);
});

test('extraction: templated hosts are dropped, dotless hosts flagged malformed', () => {
  const links = extractExternalLinks(SAMPLE);
  assert.ok(!links.some((link) => link.host?.includes('{')));
  const broken = links.find((link) => link.url === 'http://t');
  assert.equal(broken.malformed, true);
});

test('maskNonProse keeps offsets stable (masking replaces with spaces)', () => {
  const masked = maskNonProse(SAMPLE);
  assert.equal(masked.length, SAMPLE.length);
  assert.equal(masked.split('\n').length, SAMPLE.split('\n').length);
  assert.ok(!masked.includes('frontmatter.example.dev'));
  assert.ok(!masked.includes('in-code-block.example.dev'));
  assert.ok(!masked.includes('inline-code.example.dev'));
});

// --- unknown-domain error -----------------------------------------------------

test('unknown domains are collected and the error explains how to register them', () => {
  const links = extractExternalLinks(
    'A [new tool](https://shiny-new-tool.dev/docs) and [github](https://github.com/x/y).'
  );
  for (const link of links) link.file = 'src/content/posts/sample/index.md';
  const unknown = collectUnknownDomains(links);
  assert.deepEqual([...unknown.keys()], ['shiny-new-tool.dev']);
  const message = unknownDomainMessage(unknown);
  assert.match(message, /shiny-new-tool\.dev/);
  assert.match(message, /scripts\/gates\/external-link-domains\.js/);
  assert.match(message, /'status'/);
  assert.match(message, /'render'/);
  assert.match(message, /'skip'/);
  assert.match(message, /src\/content\/posts\/sample\/index\.md:1/);
});

// --- status verdicts ----------------------------------------------------------

test('judgeStatus: 2xx/3xx pass, 404/410 fail, everything murky only warns', () => {
  assert.equal(judgeStatus(200).state, 'ok');
  assert.equal(judgeStatus(301).state, 'ok');
  assert.equal(judgeStatus(404).state, 'dead');
  assert.equal(judgeStatus(410).state, 'dead');
  assert.equal(judgeStatus(403).state, 'warn');
  assert.equal(judgeStatus(429).state, 'warn');
  assert.equal(judgeStatus(500).state, 'warn');
  assert.equal(judgeStatus(403, { okStatuses: [403] }).state, 'ok');
});

function fakeResponse(status) {
  return { status, body: { cancel: async () => {} } };
}

test('checkStatusLink: dead DNS fails, network errors only warn', async () => {
  const nxdomain = await checkStatusLink('https://gone.example.dev/', {}, {
    fetchImpl: async () => {
      throw Object.assign(new Error('fetch failed'), { cause: { code: 'ENOTFOUND' } });
    }
  });
  assert.equal(nxdomain.state, 'dead');

  const offline = await checkStatusLink('https://github.com/', {}, {
    fetchImpl: async () => {
      throw Object.assign(new Error('fetch failed'), { cause: { code: 'ETIMEDOUT' } });
    }
  });
  assert.equal(offline.state, 'warn');
});

// --- end-to-end verification with stubbed network ------------------------------

const STUB_RULES = Object.freeze({
  'alive.dev': { strategy: 'status' },
  'dead.dev': { strategy: 'status' },
  'spa.dev': { strategy: 'render', deadMarkers: [/page not found/i] },
  'walled.dev': { strategy: 'skip', reason: 'login required' }
});

function stubFetch(statusByUrl) {
  return async (url) => fakeResponse(statusByUrl[url] ?? 200);
}

test('verifyLinks: per-strategy verdicts with stubbed fetch and renderer', async () => {
  const links = extractExternalLinks(
    [
      '[a](https://alive.dev/page) [b](https://dead.dev/gone)',
      '[c](https://spa.dev/missing) [d](https://spa.dev/present) [e](https://walled.dev/x)'
    ].join('\n')
  );
  const { results } = await verifyLinks(links, {
    rules: STUB_RULES,
    fetchImpl: stubFetch({ 'https://dead.dev/gone': 404 }),
    createRenderer: async () => ({
      async render(url) {
        return {
          finalUrl: url,
          text: url.endsWith('/missing') ? 'Oops — Page Not Found' : 'Real article body'
        };
      },
      async close() {}
    })
  });
  const byUrl = Object.fromEntries(results.map((link) => [link.url, link.state]));
  assert.equal(byUrl['https://alive.dev/page'], 'ok');
  assert.equal(byUrl['https://dead.dev/gone'], 'dead');
  assert.equal(byUrl['https://spa.dev/missing'], 'dead');
  assert.equal(byUrl['https://spa.dev/present'], 'ok');
  assert.equal(byUrl['https://walled.dev/x'], 'skipped');
});

test('verifyLinks: duplicate URLs are fetched once', async () => {
  let calls = 0;
  const links = extractExternalLinks(
    '[a](https://alive.dev/same) and again [b](https://alive.dev/same)'
  );
  await verifyLinks(links, {
    rules: STUB_RULES,
    fetchImpl: async (url) => {
      calls += 1;
      return fakeResponse(200);
    }
  });
  assert.equal(calls, 1);
});

test('verifyLinks: SPA links degrade to warnings when no browser is available', async () => {
  const links = extractExternalLinks('[c](https://spa.dev/article)');
  const { results } = await verifyLinks(links, {
    rules: STUB_RULES,
    createRenderer: async () => {
      throw new Error("no Playwright browser found (run 'npx playwright install chromium')");
    }
  });
  assert.equal(results[0].state, 'warn');
  assert.match(results[0].detail, /playwright install chromium/);
});

// --- CLI: unknown-domain gate blocks before any network use --------------------

function runGate(args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [gatePath, ...args], {
      cwd: repoRoot,
      ...options
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => (stdout += chunk));
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

test('CLI: a file linking a new domain exits 1 with registration instructions', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'link-gate-'));
  const file = path.join(dir, 'draft.md');
  await fs.writeFile(
    file,
    '---\ntitle: Draft\n---\nSee [this brand-new site](https://never-linked-before.dev/post).\n'
  );
  try {
    const { code, stderr } = await runGate([file]);
    assert.equal(code, 1);
    assert.match(stderr, /never-linked-before\.dev/);
    assert.match(stderr, /external-link-domains\.js/);
    assert.match(stderr, /'status'/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('CLI: no arguments prints usage and exits 2', async () => {
  const { code, stderr } = await runGate([]);
  assert.equal(code, 2);
  assert.match(stderr, /usage:/);
});
