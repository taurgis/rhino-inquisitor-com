import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  URL_SHAPE,
  analyzeSource,
  buildUrlIndex,
  maskNonProse,
  parseFrontMatter,
  listAllContentFiles
} from './check-when-published.js';

const REPO_ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));

/** URL index fixture: one live article, one draft, one alias. */
const INDEX = {
  urls: new Map([
    ['/live-article/', { file: 'src/content/posts/live-article/index.md', draft: false }],
    ['/planned-article/', { file: 'src/content/posts/planned-article/index.md', draft: true }]
  ]),
  aliases: new Map([['/old-live-article/', '/live-article/']])
};

function findingTypes(result) {
  return result.findings.map((finding) => finding.type);
}

function noticeTypes(result) {
  return result.notices.map((notice) => notice.type);
}

function wrap(target, inner = '> [!NOTE]\n> See the update.\n') {
  return `{{< when-published target="${target}" >}}\n${inner}{{< /when-published >}}\n`;
}

// --- passing shapes -----------------------------------------------------------

test('a block targeting a draft passes with a pending notice', () => {
  const result = analyzeSource(wrap('/planned-article/'), INDEX);
  assert.deepEqual(findingTypes(result), []);
  assert.deepEqual(noticeTypes(result), ['pending']);
});

test('a block targeting a published page passes with an unwrap notice', () => {
  const result = analyzeSource(wrap('/live-article/'), INDEX);
  assert.deepEqual(findingTypes(result), []);
  assert.deepEqual(noticeTypes(result), ['unwrap']);
});

test('multiple well-formed blocks in one document all pass', () => {
  const source = `${wrap('/planned-article/')}\nSome prose.\n\n${wrap('/live-article/')}`;
  const result = analyzeSource(source, INDEX);
  assert.deepEqual(findingTypes(result), []);
  assert.deepEqual(noticeTypes(result), ['pending', 'unwrap']);
});

test('shortcode syntax inside fenced code and inline code is ignored', () => {
  const source =
    'Example usage:\n\n```md\n{{< when-published target="/not-real/" >}}\nx\n{{< /when-published >}}\n```\n\n' +
    'And inline: `{{< when-published target="/also-not-real/" >}}`.\n';
  const result = analyzeSource(source, INDEX);
  assert.deepEqual(findingTypes(result), []);
  assert.deepEqual(noticeTypes(result), []);
});

test('comment-escaped documentation examples are ignored', () => {
  const source =
    'Call it like {{</* when-published target="/not-real/" */>}} in markup,\n' +
    'or {{%/* when-published target="/not-real/" */%}} which the gate rejects.\n';
  const result = analyzeSource(source, INDEX);
  assert.deepEqual(findingTypes(result), []);
});

test('a document without the shortcode yields nothing', () => {
  const result = analyzeSource('Plain prose with a [link](/live-article/).\n', INDEX);
  assert.deepEqual(findingTypes(result), []);
  assert.deepEqual(noticeTypes(result), []);
});

// --- blocking shapes ----------------------------------------------------------

test('markdown notation is blocked (rendered HTML would be Goldmark-processed twice)', () => {
  const source = '{{% when-published target="/planned-article/" %}}\nx\n{{% /when-published %}}\n';
  const result = analyzeSource(source, INDEX);
  assert.ok(findingTypes(result).includes('markdown-notation'));
});

test('a self-closing call is blocked', () => {
  const source = '{{< when-published target="/planned-article/" />}}\n';
  const result = analyzeSource(source, INDEX);
  assert.ok(findingTypes(result).includes('self-closing'));
});

test('an opening tag without a closing tag is blocked', () => {
  const source = '{{< when-published target="/planned-article/" >}}\n> [!NOTE]\n> Orphaned.\n';
  const result = analyzeSource(source, INDEX);
  assert.ok(findingTypes(result).includes('unclosed'));
});

test('a missing target argument is blocked', () => {
  const source = '{{< when-published >}}\nx\n{{< /when-published >}}\n';
  const result = analyzeSource(source, INDEX);
  assert.deepEqual(findingTypes(result), ['missing-target']);
});

test('malformed targets are blocked', () => {
  for (const target of ['/Upper-Case/', 'no-leading-slash/', '/no-trailing-slash', '/spaced url/', '/under_score/']) {
    const result = analyzeSource(wrap(target), INDEX);
    assert.deepEqual(findingTypes(result), ['malformed-target'], `expected malformed-target for ${target}`);
  }
});

test('an alias target is blocked and points at the canonical url', () => {
  const result = analyzeSource(wrap('/old-live-article/'), INDEX);
  assert.deepEqual(findingTypes(result), ['alias-target']);
  assert.match(result.findings[0].message, /\/live-article\//u);
});

test('an unknown target is blocked as a probable typo', () => {
  const result = analyzeSource(wrap('/whcih-typo/'), INDEX);
  assert.deepEqual(findingTypes(result), ['unknown-target']);
});

test('findings carry line numbers pointing at the opening tag', () => {
  const source = `Intro paragraph.\n\n${wrap('/whcih-typo/')}`;
  const result = analyzeSource(source, INDEX);
  assert.equal(result.findings[0].line, 3);
});

// --- front matter parsing -----------------------------------------------------

test('parseFrontMatter reads url, draft, and block-list aliases', () => {
  const source =
    '---\ntitle: Test\nurl: /some-article/\ndraft: true\naliases:\n  - /old-a/\n  - "/old-b/"\n---\nBody.\n';
  assert.deepEqual(parseFrontMatter(source), {
    url: '/some-article/',
    draft: true,
    aliases: ['/old-a/', '/old-b/']
  });
});

test('parseFrontMatter reads inline-list aliases and quoted urls', () => {
  const source = "---\nurl: '/quoted/'\ndraft: false\naliases: [/old-a/, '/old-b/']\n---\n";
  assert.deepEqual(parseFrontMatter(source), {
    url: '/quoted/',
    draft: false,
    aliases: ['/old-a/', '/old-b/']
  });
});

test('parseFrontMatter returns null without a front matter block', () => {
  assert.equal(parseFrontMatter('No front matter here.\n'), null);
});

// --- masking ------------------------------------------------------------------

test('maskNonProse keeps offsets stable (masking replaces with spaces)', () => {
  const source = 'a\n```\n{{% when-published %}}\n```\nb\n';
  const masked = maskNonProse(source);
  assert.equal(masked.length, source.length);
  assert.equal(masked.split('\n').length, source.split('\n').length);
});

// --- repository baseline ------------------------------------------------------

test('baseline: every content file passes the gate against the real url index', async () => {
  const index = await buildUrlIndex();
  const files = await listAllContentFiles();
  assert.ok(files.length > 0, 'expected content files in the checkout');
  const failures = [];
  for (const file of files) {
    const source = await fs.readFile(path.join(REPO_ROOT, file), 'utf8');
    const { findings } = analyzeSource(source, index);
    for (const finding of findings) {
      failures.push(`${file}:${finding.line} ${finding.type}`);
    }
  }
  assert.deepEqual(failures, []);
});

test('baseline: the url index resolves known pages, including block scalars', async () => {
  const index = await buildUrlIndex();
  assert.ok(index.urls.size > 0, 'expected urls in the index');
  // Article url shapes are valid when-published targets.
  const article = index.urls.get('/what-is-commerce-on-core/');
  assert.ok(article, 'expected the Commerce on Core article in the index');
  assert.equal(article.draft, false);
  assert.ok(URL_SHAPE.test('/what-is-commerce-on-core/'));
  // This article declares url with a YAML block scalar (url: >-).
  assert.ok(
    index.urls.has('/the-move-from-sitegenesis-and-sfra-to-the-composable-storefront-as-a-developer/'),
    'expected the block-scalar url to be indexed'
  );
});
