import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  analyzeSource,
  buildUrlIndex,
  isBuilt,
  derivedUrl,
  maskNonProse,
  parseFrontMatter,
  listAllContentFiles
} from './check-when-published.js';
import { normalizeUrl, urlPattern } from './url-shape.js';

const REPO_ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));

/** URL index fixture: one live article, one draft, one alias. */
const INDEX = {
  urls: new Map([
    ['/live-article/', { file: 'src/content/posts/live-article/index.md', built: true }],
    ['/planned-article/', { file: 'src/content/posts/planned-article/index.md', built: false }]
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

function wrapElse(target, inner = 'The interim wording.\n') {
  return `{{< when-unpublished target="${target}" >}}\n${inner}{{< /when-unpublished >}}\n`;
}

test('when-unpublished on a draft target passes with a fallback-active notice', () => {
  const result = analyzeSource(wrapElse('/planned-article/'), INDEX);
  assert.deepEqual(findingTypes(result), []);
  assert.deepEqual(noticeTypes(result), ['fallback-active']);
});

test('when-unpublished on a published target passes with a stale-fallback notice', () => {
  const result = analyzeSource(wrapElse('/live-article/'), INDEX);
  assert.deepEqual(findingTypes(result), []);
  assert.deepEqual(noticeTypes(result), ['stale-fallback']);
});

test('an if/else pair on the same target yields one notice per branch', () => {
  const source = wrapElse('/planned-article/') + '\n' + wrap('/planned-article/');
  const result = analyzeSource(source, INDEX);
  assert.deepEqual(findingTypes(result), []);
  assert.deepEqual(noticeTypes(result), ['fallback-active', 'pending']);
});

test('display="inline" and display="block" pass; anything else is blocked', () => {
  const inline = `{{< when-published target="/planned-article/" display="inline" >}}x{{< /when-published >}}\n`;
  assert.deepEqual(findingTypes(analyzeSource(inline, INDEX)), []);
  const block = `{{< when-unpublished target="/planned-article/" display=block >}}x{{< /when-unpublished >}}\n`;
  assert.deepEqual(findingTypes(analyzeSource(block, INDEX)), []);
  const bad = `{{< when-published target="/planned-article/" display="inilne" >}}x{{< /when-published >}}\n`;
  assert.ok(findingTypes(analyzeSource(bad, INDEX)).includes('invalid-display'));
});

test('a when-published closing tag does not close a when-unpublished block', () => {
  const source = '{{< when-unpublished target="/planned-article/" >}}\nx\n{{< /when-published >}}\n';
  const result = analyzeSource(source, INDEX);
  assert.ok(findingTypes(result).includes('unclosed'));
});

test('when-unpublished with a typo target is blocked', () => {
  const result = analyzeSource(wrapElse('/whcih-typo/'), INDEX);
  assert.deepEqual(findingTypes(result), ['unknown-target']);
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
  for (const target of ['/Upper-Case/', 'no-leading-slash/', '/spaced url/', '/under_score/']) {
    const result = analyzeSource(wrap(target), INDEX);
    assert.deepEqual(findingTypes(result), ['malformed-target'], `expected malformed-target for ${target}`);
  }
});

test('a target without a trailing slash resolves via normalization', () => {
  const result = analyzeSource(wrap('/live-article'), INDEX);
  assert.deepEqual(findingTypes(result), []);
  assert.deepEqual(noticeTypes(result), ['unwrap']);
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
    date: null,
    aliases: ['/old-a/', '/old-b/']
  });
});

test('parseFrontMatter reads inline-list aliases and quoted urls', () => {
  const source = "---\nurl: '/quoted/'\ndraft: false\naliases: [/old-a/, '/old-b/']\n---\n";
  assert.deepEqual(parseFrontMatter(source), {
    url: '/quoted/',
    draft: false,
    date: null,
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
  const article = index.urls.get('/what-is-commerce-on-core/');
  assert.ok(article, 'expected the Commerce on Core article in the index');
  assert.equal(article.built, true);
  assert.ok(urlPattern.test('/what-is-commerce-on-core/'));
  // This article declares url with a YAML block scalar (url: >-).
  assert.ok(
    index.urls.has('/the-move-from-sitegenesis-and-sfra-to-the-composable-storefront-as-a-developer/'),
    'expected the block-scalar url to be indexed'
  );
  // Category term pages have no url front matter; their URL is derived from
  // hugo.toml [permalinks.term].
  const term = index.urls.get('/category/ai/');
  assert.ok(term, 'expected the ai category term page in the index');
  assert.equal(term.built, true);
});

// --- review-fix regressions ----------------------------------------------------

test('an unquoted Hugo-valid target is not misread as self-closing', () => {
  const source = '{{< when-published target=/planned-article/ >}}\nx\n{{< /when-published >}}\n';
  const result = analyzeSource(source, INDEX);
  assert.deepEqual(findingTypes(result), []);
  assert.deepEqual(noticeTypes(result), ['pending']);
});

test('a stray closing tag without an opening tag is blocked', () => {
  const result = analyzeSource('x\n{{< /when-published >}}\n', INDEX);
  assert.deepEqual(findingTypes(result), ['unclosed']);
});

test('double-backtick code spans are masked', () => {
  const source = 'Use ``{{< when-published >}}`` in docs.\n';
  const result = analyzeSource(source, INDEX);
  assert.deepEqual(findingTypes(result), []);
});

test('isBuilt treats future-dated draft:false pages as not built', () => {
  const now = Date.parse('2026-07-12T12:00:00Z');
  assert.equal(isBuilt({ draft: false, date: '2026-08-01T00:00:00Z' }, now), false);
  assert.equal(isBuilt({ draft: false, date: '2026-07-01T00:00:00Z' }, now), true);
  assert.equal(isBuilt({ draft: false, date: null }, now), true);
  assert.equal(isBuilt({ draft: true, date: '2026-07-01T00:00:00Z' }, now), false);
});

test('a scheduled (future-dated) target reports pending, not unwrap', () => {
  const index = {
    urls: new Map([['/scheduled/', { file: 'src/content/posts/scheduled/index.md', built: false }]]),
    aliases: new Map()
  };
  const result = analyzeSource(wrap('/scheduled/'), index);
  assert.deepEqual(findingTypes(result), []);
  assert.deepEqual(noticeTypes(result), ['pending']);
});

test('derivedUrl maps category term pages and nothing else', () => {
  assert.equal(derivedUrl('src/content/categories/ai/_index.md'), '/category/ai/');
  assert.equal(derivedUrl('src/content/posts/some-post/index.md'), null);
  assert.equal(derivedUrl('src/content/categories/_index.md'), null);
});

test('normalizeUrl adds a trailing slash only to directory urls', () => {
  assert.equal(normalizeUrl('/foo'), '/foo/');
  assert.equal(normalizeUrl('/foo/'), '/foo/');
  assert.equal(normalizeUrl('/404.html'), '/404.html');
  assert.equal(normalizeUrl('/'), '/');
});
