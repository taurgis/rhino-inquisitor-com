# WebMCP Tool Surface

## Change summary

Added a client-side script that exposes this site's content to an **in-page AI
agent** through [WebMCP](https://developer.chrome.com/docs/ai/webmcp)
(`document.modelContext`), so an agent running inside the reader's browser can
query the corpus with structured tool calls instead of scraping rendered HTML.

This is distinct from the machine-reader surface the site already serves
(`/llms.txt`, `/llms-full.txt`, per-page `/<slug>/index.md` companions,
`/index.json`). Those serve crawlers and retrieval pipelines that *fetch a URL*.
WebMCP serves an agent that is *already executing JavaScript in the page*.

The surface is being built in five slices. Two tools are registered so far,
`listRecentArticles` and `searchArticles`; `getSiteOverview` and `getArticle`
follow, then a verification pass. The full spec and the reasoning behind every
decision below live on the wayfinder map,
[issue #49](https://github.com/taurgis/rhino-inquisitor-com/issues/49), and its
closed tickets.

## Behaviour details

### Old behaviour

No WebMCP integration. An in-page agent had no structured access to the site's
content and had to read the rendered DOM.

### New behaviour

On a browser **with** WebMCP available and the origin enrolled in the trial,
read-only tools are registered at script execution. Each `registerTool()` call
is wrapped in its own `try`/`catch`, so a definition the browser rejects — a
schema shape that drifted mid-origin-trial, say — costs that one tool rather
than the whole surface.

| | |
|---|---|
| `name` | `listRecentArticles` |
| `title` | List recent articles |
| `inputSchema` | one optional `limit` integer, 1–20, default 4 |
| `annotations` | `readOnlyHint: true` |

It resolves `/index.json`, keeps only `type: "posts"` entries (the index also
holds standalone reference pages), sorts newest-first, and returns
`{ returned, totalArticles, results }` with each row shaped
`{ title, url, topic, date, readingTime, summary }`.

| | |
|---|---|
| `name` | `searchArticles` |
| `title` | Search articles |
| `inputSchema` | required `query` string; optional `limit` integer 1–20 default 4; optional `topic` string |
| `annotations` | `readOnlyHint: true` |

Its description, verbatim, because an agent picks a tool on this text alone:

> Searches the titles, topics and summaries of every article and reference page
> published on rhino-inquisitor.com, a technical blog about Salesforce B2C
> Commerce Cloud. Use it to find what this site has written on a subject, and to
> get the URL of an article before calling getArticle. Results are ranked by
> relevance, best match first.

Unlike `listRecentArticles`, it searches **both** articles and standalone
reference pages, because the description promises "every article and reference
page". It returns `{ query, matchCount, returned, results }` with the same row
shape, or `{ query, matchCount: 0, returned: 0, results: [], guidance }` when
nothing matches.

`matchCount` is the number of entries that matched, `returned` the number of
rows that fit the response. They differ whenever the caller's `limit` or the
character budget cut the list, which is how an agent learns there is more to
ask for.

### How ranking works

`searchArticles` normalizes every text field (NFD-decompose, strip combining
marks, lowercase, trim), splits the query on whitespace into tokens, and builds
a per-entry haystack from `title`, `summary`, `typeLabel`, `primaryTopic` and
`categories`.

A **token-AND gate** runs first: if any one token is absent from the haystack,
the entry is excluded outright however well the others scored. Surviving
entries then accumulate, per token:

| Field the token appears in | Weight |
|---|---|
| `title` | +6 |
| `primaryTopic` | +4 |
| any entry in `categories` (counted once, via `.some()`) | +3 |
| `summary` | +1 |

A token that matches only `typeLabel` passes the gate and scores nothing — so
`query: "article"` matches every post and leaves the date tie-break to decide
the order. Ties break newest-first; neither the spec nor the archive script says
how to break them.

**This code is an intentional duplicate** of `normalize`, `tokenize`,
`scoreEntry`, `compareTitles` and `compareByNewest` in
`src/static/scripts/archive-search.js`, which powers the human-facing archive
search. The site has no bundler, so there is no import to share, and the two are
expected to diverge: the archive copy feeds a rendered list with its own
date/title sort controls and only ever reads the score as a `>= 0` match gate,
while this copy sorts by the score itself. **`searchArticles` is therefore the
first place on the site where those weights affect what anyone sees.** Both
files carry a comment pointing at the other; keep the gate and the 6/4/3/1
weights in step, so a visitor searching the archive and an agent calling
`searchArticles` agree on what counts as a match.

The optional `topic` filter runs **before** scoring and matches `primaryTopic`
exactly after normalizing — not `categories`, and not as a substring. That
distinction is load-bearing: the two fields carry different display strings for
most of the corpus (`primaryTopic: "Commerce Cloud"` against
`categories: ["Salesforce Commerce Cloud", …]`, `"Go-Live"` against
`"GO-LIVE"`), so filtering on categories would silently drop the larger half of
the site. An unrecognized topic yields nothing and flows into the ordinary
no-match answer; there is no separate error for it. Four reference pages have an
empty `primaryTopic` and are unreachable by any topic filter, which is correct.

On every **other** browser — which today means nearly all of them — the script
does nothing observable: no registered tool, no console output, no thrown error,
and no network request. The same silence applies once the origin-trial token
expires, because the absent-API check and the expired-token case are
indistinguishable from the page and want identical handling.

### Three behaviours worth knowing before changing this file

**The output budget is enforced in code, and it bites.** Chrome recommends at
most 1.5K characters per individual tool output. Four rows of real data serialize
to around **1,480 characters** — a couple of dozen under the limit. A full
`limit: 20` would be **6,870 characters**, 4.6x over, and no variation of the row
shape brings 20 rows under it. So `fitToBudget()` counts down from the requested
count and returns the most rows that actually fit.

The two tools declare that cut differently, which is why `fitToBudget()` takes a
candidate-builder rather than a row list. `listRecentArticles` has no field that
would reveal a trim, so it adds a `guidance` sentence; because that sentence
itself costs ~170 characters, asking it for `limit: 5` returns **three** rows,
one fewer than the default call's four. That wart is deliberate.
`searchArticles` adds no sentence: `matchCount` against `returned` already says
more rows exist, and spending ~170 characters to repeat that in prose would cost
most of a whole row.

The budget matters more than it looks, because exceeding it fails *invisibly* —
the agent silently drops or truncates the payload, so an over-budget tool
appears to work while quietly lying.

**Failures resolve, they never reject.** Offline, aborted, and malformed-index
paths all return a `guidance` sentence that names a next move (usually
`/llms.txt`). An agent handed an opaque rejection has nothing to act on.

**The index is cached as a promise, not a value.** Concurrent tool calls join one
in-flight request rather than racing two, and a rejection clears the cache so the
next call retries instead of being permanently stuck on a failed fetch. Both
tools share it, and the other two will land on the same function.

**One exception to "every answer reads the index":** a `searchArticles` query
that tokenizes to nothing (`""`, whitespace, a missing `query` despite the
schema marking it required) is answered without any network request at all.
There is nothing to search for, and the answer would be identical either way.

### The row shape is fixed, and it is full

All four tools return the same row — `{ title, url, topic, date, readingTime,
summary }` — so an agent that has read one result set can read the others
without re-learning it. `url` comes from the index's `relPermalink`, `topic`
from `primaryTopic`.

Resist adding a field. The tool spec's own `getSiteOverview` rationale assumes
`searchArticles` rows carry `primaryTopicUrl`, but its worked example for the
row does not list it, and the two cannot both be honoured: measured against the
live index, `primaryTopicUrl` costs **82 characters per row**, or 328 across
four rows, against the **29 characters** of headroom left in the worst
four-row payload observed on the real corpus. Adding it would cost roughly one
row out of every result set. The row is therefore exactly as specified, and
`getSiteOverview` needs a different argument for omitting per-topic URLs.

### Origin-trial tokens

WebMCP is an origin trial in both Chrome (M149–M156) and Edge (150+). **Both
trials end 2026-11-17.** The browsers run separate trials with separate signing
keys, so each needs its own token; a Chrome token does nothing in Edge.

Tokens live in two `hugo.toml` params, `webmcpOriginTrialTokenChrome` and
`webmcpOriginTrialTokenEdge`, each rendering its own
`<meta http-equiv="origin-trial">` tag from `seo/head-meta.html` only when
non-empty. Multiple origin-trial tags on one page are legal and the framework
takes the first *valid* one, so each browser skips the other's.

An origin-trial token is public by design — it ships in HTML to every visitor —
so it is not a credential. It is still a value that belongs in the site rather
than in an issue or a commit message.

**Why a meta tag and not a Cloudflare `Origin-Trial` response header.** Both are
valid per Chrome's docs, and the header would make renewal a dashboard edit with
no rebuild. The meta tag won on this zone's own history: the `Link`-header rules
in [`docs/publishing/article-markdown-link-headers.md`](../publishing/article-markdown-link-headers.md)
needed a third rule (Rule 3) purely to repair an overwrite race that silently
dropped a signal off the homepage in production.

**Token expiry is not the same as trial expiry.** Chrome issued a token lasting
to 2026-11-17, the full trial, so it needs no renewal. Edge issued a shorter one
expiring **2026-11-01**, so covering Edge to the end of the trial takes one
renewal — and an Edge renewal generates a *new value* that must be pasted in and
rebuilt, unlike Chrome's email renewal link.

When both tokens lapse, no action is required: the feature detect disables the
integration on its own.

## Impact and verification

**Impacted components.** `hugo.toml` (two new params),
`seo/head-meta.html` (two gated meta tags), `_default/baseof.html` (one
unconditional script declaration), and the script itself. No content, routing,
or output-format change, so no URL or redirect surface is touched.
`src/static/scripts/archive-search.js` gained a comment marking its scorer as
one of the two intentionally parallel copies; its behaviour is untouched.

The script is declared unconditionally in `baseof.html` rather than through the
`{{ block "scripts" }}` hook, because the tools describe the *site* rather than
the current page and only `single.html` defines that block. It is delivered
through Hugo Pipes with `minify | fingerprint` plus SRI.

Adding it made the delivery boilerplate duplicate, so the shared shape moved to
a new `site/deferred-script.html` partial taking an asset path, and
`scroll-restore.js` now goes through it too. That refactor was verified
behaviour-neutral: the emitted `<script>` tags are byte-identical before and
after, on the same 240 pages. Further deferred assets should use the partial
rather than re-inlining the pipeline. Note it only applies to assets under
`src/assets`; the eight scripts under `src/static` are referenced with `relURL`
and are not part of the Pipes pipeline.

Fingerprinting is load-bearing here: WebMCP
has already renamed its entry point once (`navigator.modelContext` ->
`document.modelContext`), and a stable filename behind the 1-year asset cache
could strand a returning visitor on a cached copy calling a dead API.

### Verify the unit behaviour

```bash
npm run test:webmcp-tools
```

41 tests covering the feature detect, the idempotency guard, per-tool
registration isolation, the `type: "posts"` filter, limit clamping, the shared
promise (including single-fetch-under-concurrency and retry-after-rejection),
`AbortSignal` pass-through, the output budget, and for `searchArticles` the
token-AND gate, each of the four weights, the date tie-break, the
`primaryTopic`-not-`categories` topic filter, and both empty-result sentences.
The script is a browser IIFE reading only globals, so it runs under `node:vm`
with `document` and `fetch` stubbed — no DOM library needed. The test lives in
`scripts/` rather than beside the asset so that test code stays out of Hugo's
asset tree.

One trap when adding tests there: `node:vm` gives the sandbox its own `Array`,
and `assert/strict` compares prototypes, so an array the script built is never
deep-strict-equal to a literal in the test file, however identical the contents
("Values have same structure but are not reference-equal"). Read rows through
the `column()` helper, which copies into this realm, or compare lengths.

### Verify the delivery

```bash
npm run build:local:fast

# No origin-trial tag while both params are empty.
grep -rc 'http-equiv=origin-trial' public/index.html   # expect 0

# One fingerprinted, SRI-protected script tag on every real template.
grep -o '<script src=/scripts/webmcp-tools[^>]*>' public/index.html
```

Note `hugo --minify` strips attribute quotes, so grep for
`src=/scripts/...` rather than `src="/scripts/...`.

To check the gated tags without committing a token, override the params for one
build:

```bash
SKIP_AVIF_CACHE=1 HUGO_PARAMS_WEBMCPORIGINTRIALTOKENCHROME=PLACEHOLDER \
  hugo --cleanDestinationDir --gc --minify --environment development --quiet
grep -o '<meta http-equiv=origin-trial[^>]*>' public/index.html
```

Each param gates independently: neither set renders no tag, either alone renders
one, both render two, in Chrome-then-Edge order, all inside `<head>` and
therefore ahead of the deferred script that depends on them.

### Verify the budget

```bash
npm run check:perf-budget
```

Measured impact, from `validation/performance-budget-report.json`. The script
is 5,160 B raw and **2,275 B gzipped** standalone, up from 1,194 B when it
carried `listRecentArticles` alone.

| Template | No tools | + listRecentArticles | + searchArticles | Headroom remaining |
|---|---|---|---|---|
| homepage | 128,586 | 129,750 | 130,828 | 43,252 |
| article | 147,652 | 148,848 | 149,926 | **24,154** |
| category | 90,355 | 91,540 | 92,990 | 81,090 |

`budgetFailures` stays at **0** against the 174,080 B (170 KB) threshold. The
gate counts every `<script src>` with no `defer`/`async` exemption, so this
weight lands on the critical-path total despite the script being deferred.

The article template's ~24 KB is the binding headroom for the remaining two
tools. Note the gate reports `status: fail` both before and after this change,
on six pre-existing Lighthouse SEO findings (score 92 against a required 95)
that are unrelated to WebMCP — so `budgetFailures` and `scoreFailures` must be
read separately rather than treating overall status as the signal.

### Verify the ranking against the real corpus

The unit tests use fixtures chosen to separate the weights from one another;
they cannot tell you whether the tool behaves on 175 real entries. Sweep the
live corpus with a throwaway harness — the script only reads globals, so
`node:vm` with a stubbed `fetch` is the whole setup:

```bash
curl -s https://rhino-inquisitor.com/index.json -o /tmp/index.json
node --input-type=module -e "
import fs from 'node:fs';
import vm from 'node:vm';
const registered = [];
const box = {
  fetch: () => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync('/tmp/index.json', 'utf8'))) }),
  document: { modelContext: { registerTool: (d) => registered.push(d) } },
};
box.window = box; box.globalThis = box;
vm.createContext(box);
vm.runInContext(fs.readFileSync('src/assets/scripts/webmcp-tools.js', 'utf8'), box);
const search = registered.find((d) => d.name === 'searchArticles');
for (const query of ['cartridge', 'storefront', 'the', 'job']) {
  for (const limit of [4, 20]) {
    const r = await search.execute({ query, limit });
    const chars = JSON.stringify(r).length;
    console.log(query, limit, 'matchCount', r.matchCount, 'returned', r.returned, chars, chars > 1500 ? 'OVER BUDGET' : '');
  }
}
"
```

Widen the query list to every distinct word in the corpus's titles for a full
sweep. What that full sweep established when `searchArticles` landed:

- Every one of the 15 topic names in the live index is reachable by an exact
  `topic` filter, and every returned row carries the filtered topic.
- Neither of the two category strings that diverge from a topic name
  (`Salesforce Commerce Cloud`, `Video`) is accepted as a topic.
- The weighting genuinely reorders real results: `query: "cartridge"` puts the
  2026 cartridge-path article first on a title match, ahead of a 2022 entry that
  a plain date sort would promote.
- Sweeping all 351 distinct words in the corpus's titles at both `limit: 4` and
  `limit: 20` produced **no payload over 1,500 characters**; the worst was
  1,471. `query: "storefront"` trims to 3 of 19 matches at 1,143 characters,
  proving the trim path on real data.

Re-run this sweep when the row shape, the weights, or the summary lengths in
`/index.json` change — those 29 characters of worst-case headroom are the whole
safety margin.

### Verify in a browser

WebMCP needs `chrome://flags/#enable-webmcp-testing` (toggle, then relaunch).
Two inspection paths answer different questions and both matter:

- **DevTools → Application → WebMCP** lists registered tools and logs
  invocations with their exact input and output, and offers a manual **Run tool**
  action. This proves a tool *works* when invoked with known input.
- The [Model Context Tool Inspector extension](https://chromewebstore.google.com/detail/model-context-tool-inspec/gbpdfapgefenggkahomfgkhfehlcenpd),
  which Chrome documents on its
  [WebMCP getting-started page](https://developer.chrome.com/docs/ai/webmcp),
  drives a real agent from natural-language prompts. This proves a tool gets
  *chosen* — that the name and description are enough for an agent to select it
  and fill its parameters.

Neither needs an origin-trial token; a secure context (`localhost` or an HTTPS
preview) is the only requirement. Only verification against the live tokened
origin needs the tokens, and that window closes 2026-11-17.

## Related files

- `src/assets/scripts/webmcp-tools.js` — the integration: both tools, the
  shared index promise, the budget fitter, and the duplicated scorer.
- `scripts/webmcp-tools.test.js` — its unit tests.
- `src/static/scripts/archive-search.js` — the human-facing archive search, and
  the other half of the intentionally duplicated scorer.
- `src/layouts/_default/baseof.html` — unconditional script declaration.
- `src/layouts/partials/site/deferred-script.html` — the shared fingerprint +
  SRI + `defer` delivery partial extracted by this change (this change).
- `src/layouts/partials/seo/head-meta.html` — the two gated origin-trial tags.
- `hugo.toml` — `webmcpOriginTrialTokenChrome`, `webmcpOriginTrialTokenEdge`.
- `docs/development/scroll-restoration.md` — the analogous Hugo Pipes asset this
  delivery pattern copies.
- `docs/publishing/article-markdown-link-headers.md` — the edge-header
  regression that argued for a meta tag over a Cloudflare rule.
