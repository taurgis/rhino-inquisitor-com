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

The surface is being built in five slices. Three tools are registered so far —
`listRecentArticles`, `searchArticles` and `getSiteOverview` — with `getArticle`
to follow, then a verification pass. The full spec and the reasoning behind every
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
is isolated, so a definition the browser rejects — a schema shape that drifted
mid-origin-trial, say — costs that one tool rather than the whole surface.
"Isolated" means both a `try`/`catch` *and* a `.catch()` on the promise
`registerTool()` returns, because Chrome reports a bad definition by rejecting
that promise rather than by throwing (see
[What Chrome actually does, measured](#what-chrome-actually-does-measured)).

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

| | |
|---|---|
| `name` | `getSiteOverview` |
| `title` | Site overview |
| `inputSchema` | `{ "type": "object", "properties": {} }` — no parameters |
| `annotations` | `readOnlyHint: true` |

Its description, verbatim:

> Describes rhino-inquisitor.com: what it publishes, how many articles it has,
> the range of publication dates, the topics it covers with an article count for
> each, and the URLs of its machine-readable feeds. Use it first to judge whether
> this site covers a subject, and to get valid topic names for searchArticles.

It returns `{ name, description, about, articleCount, pageCount, newestArticle,
oldestArticle, topics, feeds }`, where `topics` is `[{ name, articleCount }]` and
`feeds` is `{ llms, llmsFull, searchIndex, rss, sitemap }`. Against the live
corpus that payload is **1,052 characters**, 448 under the budget.

Every figure in it is computed from `/index.json` **at call time**, through the
same shared promise the other tools use — never baked in at build time — so the
counts, the date range and the topic list stay correct as posts publish, with no
second build step to keep in sync.

#### Where the site identity comes from

`name`, `description` and `about` are not in the script. `baseof.html` renders
them onto `<body>` as `data-rhino-site-name`, `data-rhino-site-description` and
`data-rhino-site-about`, and the script reads `document.body.dataset`. That is
the same route `search-bar.html` uses to hand `archive-search.js` its index URL,
and it keeps `hugo.toml` the single source of truth rather than letting a second
copy of those strings drift inside a JavaScript file. The alternative —
`resources.ExecuteAsTemplate` — would put Hugo actions inside the asset and
leave it unreadable to its own `node:vm` unit tests.

| Field | Backed by | Value today |
|---|---|---|
| `name` | `site.Title` | Rhino Inquisitor |
| `description` | `params.description` | the site tagline |
| `about` | `params.author.description` | the site owner's professional bio |

`about` is the honest best of what exists. There is no site-level
`params.about`, and the map's "consume what exists" rule rules out inventing
one; of the two prose params on offer, the tagline already backs `description`,
which leaves the owner's bio. It is strictly about the *author* rather than the
site, but it is what tells an agent who writes here and at what depth, which is
what `about` is read for. Give the site a real `params.about` and this field
should move to it.

A missing attribute **omits** its field rather than emitting `""`: an absent key
reads as "not stated", where an empty string reads as "stated to be nothing".

`about` is capped at **300 characters**, marked with an ellipsis when it is cut.
Nothing stops prose in a Hugo param from growing, and without the cap the topic
list would be what gave way to make room — exactly backwards, since the topics
are the part an agent acts on. The cap leaves well over half the output budget
for measured data whatever anyone writes in the params. Today's value is 156
characters, so it never fires; it is a floor under the payload rather than a
working feature.

The five `feeds` paths, by contrast, *are* hardcoded in the script rather than
derived from Hugo — the one place this change knowingly duplicates a
build-time fact. They are route constants fixed by `[outputFormats]`, not
editorial strings, and the repo already hardcodes the same paths in
`scripts/seo/check-llm-artifacts.js`, `scripts/seo/check-sitemap.js` and
`scripts/gates/validate-url-inventory.js`, so a renamed output format fails a
gate long before it reaches an agent.

#### How the topic list is built

`topics` counts distinct `primaryTopic` values across `type: "posts"` entries
only, most-covered first, ties broken by name so the order never depends on the
order the index arrived in. Three exclusions, each deliberate:

- **The empty topic.** A handful of pages carry no `primaryTopic`; there is no
  name to give.
- **Page-only topics.** Two topic names (today Podcasts and Sessions) exist only
  among pages, with zero articles behind them. Listing them beside an
  `articleCount` of 0 would advertise a filter that matches nothing.
- **`categories`.** The names here are exactly the strings `searchArticles`
  filters on, and that filter reads `primaryTopic`. A category name would be a
  topic that returns nothing: for 88 of the live index's 175 entries, the
  `categories` array does not contain that entry's own `primaryTopic`.

`newestArticle` and `oldestArticle` are the ends of the article date range, not
the whole index's. The field names say Article, and a page dated after the newest
post would otherwise be reported as one. On today's corpus both readings give
the same pair (2022-02-24 to 2026-09-14), so nothing observable turns on it.

#### getSiteOverview is the only tool that names the feeds

`feeds` announces `/llms.txt`, `/llms-full.txt`, `/index.json`, `/index.xml` and
`/sitemap.xml`, so an agent that would rather bulk-read the corpus than make
repeated tool calls learns those exist. No other tool mentions them, by design:
one announcement point, not five. All five were confirmed live (HTTP 200 with
the expected content type); `/sitemap.xml` is Hugo's `<sitemapindex>`, and it is
the index that gets advertised rather than any of its five children.

#### Trimming the overview, and the failure answer

Topic names and feed URLs are **never** shortened — half a topic name is a
filter that silently matches nothing — so the only thing left to give up is
whole topics, thinnest first, and a `guidance` sentence then says how many of
how many survived. The `about` cap above is the other half of that guarantee:
with prose bounded, the topic countdown can always reach a payload that fits. That path does not fire on today's corpus, but it is closer
than the 448 characters of headroom suggest: measured by feeding the live index
extra topics, the trim starts at **11 more topics** (24 in total), because each
one costs around 38 characters and the guidance sentence costs 105 more the
moment it appears. The topic list, not the article count, is what will push this
payload over.

When the index cannot be read or fetched, the overview omits every *measured*
field rather than zeroing it, and keeps only what needs no network: the site
identity, the feed URLs, and a `guidance` sentence. This diverges from the other
two tools, which do return `matchCount: 0`-style empty envelopes, and the
difference is the point: those count *results*, where `articleCount: 0` would be
a claim about the site that an agent could act on by skipping it. An absent key
says the measurement failed; a zero says the site is empty.

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
next call retries instead of being permanently stuck on a failed fetch. All three
tools share it — verified in a real browser, where four tool calls in a row
produced exactly one `/index.json` request — and `getArticle` will land on the
same function.

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
row out of every result set. The row is therefore exactly as specified.

That left the spec's stated reason for omitting per-topic URLs from
`getSiteOverview` — "the result rows already carry `primaryTopicUrl`" — false as
built. The real reason turns out to be stronger, and measured: the index stores
`primaryTopicUrl` as an **absolute** URL, so giving each of the 13 topics one
adds **763 characters**, taking a 1,052-character payload to **1,815** — 315
*over* budget, not near it. Per-topic URLs are not a style choice here; they do
not fit. An agent that needs one has the topic name and can get there through
`searchArticles`.

### What Chrome actually does, measured

Chrome's WebMCP documentation is silent or wrong on five points that decide how
this file has to be written. Each was measured directly against **Chrome
153.0.8010.47** (see [Verify in a browser](#verify-in-a-browser) for the
harness), not inferred:

**An `inputSchema` with an empty `properties` object is valid.** This was the
one open unknown `getSiteOverview` carried: the tool takes no arguments, Chrome's
imperative-API page says registration wants "an input schema with relevant
properties" without saying whether *none* counts, and the earlier verification
rig had only ever exercised a single-property schema. Registration resolves, and
`getTools()` lists the tool with `inputSchema` reflected back as the string
`{"type":"object","properties":{}}`. The recorded fallback — omitting
`inputSchema` entirely — is therefore unnecessary. Both that and a bare
`{ type: "object" }` also register cleanly, so the shape is not load-bearing;
the empty-`properties` form ships because it is what the spec asked for.

**`registerTool()` never throws — it rejects.** Every bad definition tried
(missing `description`, an `inputSchema` that cannot be converted, a duplicate
tool name) resolved into a *rejection* of the returned promise, with nothing
thrown synchronously. A bare `try`/`catch` around a fire-and-forget call
therefore catches nothing, and the rejection surfaces as an unhandled rejection
in every reader's console — precisely the observable failure this integration
exists to avoid. Hence the `.catch()` alongside the `try`/`catch`.

**`execute` is handed `{ signal }`, not a signal.** Chrome's documentation says
the `execute` function "receives an `AbortSignal` parameter named `signal` as a
second argument". On M153 the second argument is an *options object* carrying
the `AbortSignal` on a `signal` property. This is not pedantry: passing that
object to `fetch()` rejects the request outright with "Failed to read the
'signal' property from `RequestInit`: Failed to convert value to
'AbortSignal'", so every tool answered every call with nothing but its own
could-not-load guidance while a plain `fetch('/index.json')` from the same page
succeeded. It failed *gracefully*, which is exactly why unit tests with a
hand-rolled signal never caught it. `abortSignalFrom()` now accepts either
shape, duck-typed on `aborted` rather than `instanceof AbortSignal` so it also
works under `node:vm`.

**`executeTool()` takes two arguments and a JSON string.** Chrome's docs
describe "an optional JavaScript object for input arguments". On M153 the call
requires exactly two arguments, the first a `RegisteredTool` from `getTools()`
(a name string is rejected), and the second a JSON *string* — passing `{}`
fails with "Failed to parse input arguments". Only relevant when driving the
tools from a harness, but it is what a verification script has to do.

**A bare `AbortSignal` handed to `executeTool()` is silently ignored.** Chrome's
docs say a pending tool execution can be cancelled "with an `AbortSignal`, when
passed as an optional parameter". That parameter has to be an *options* object —
`executeTool(tool, json, { signal })` — the same asymmetry `execute` shows on
the way in. Passed bare as `executeTool(tool, json, signal)`, the abort does
nothing: against a deliberately stalled `/index.json` the call ran the full five
seconds and resolved with rows, indistinguishable from never aborting at all.
Wrapped, aborting at 500 ms rejected the call with `AbortError` at 501 ms and
failed the in-flight request with `net::ERR_ABORTED`. That failed request is
also the direct proof that the signal Chrome hands `execute` reaches our
`fetch()` — the round trip the abort criterion on
[issue #57](https://github.com/taurgis/rhino-inquisitor-com/issues/57) asked for,
and one no unit test can stand in for.

One more observation, harmless but worth not being surprised by: `getTools()`
reflects `annotations` back with `untrustedContentHint: false` filled in
alongside the `readOnlyHint: true` that was registered.

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
unconditional script declaration plus three `data-rhino-site-*` attributes on
`<body>`, which is how `getSiteOverview` gets the site's name, tagline and
about text), and the script itself. The machine-reader feed list is now also
part of this surface, since `getSiteOverview` announces it. No content,
routing, or output-format change, so no URL or redirect surface is touched.
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

67 tests covering the feature detect, the idempotency guard, per-tool
registration isolation (both the sync-throw and the rejected-promise route),
the `type: "posts"` filter, limit clamping, the shared
promise (including single-fetch-under-concurrency and retry-after-rejection),
`AbortSignal` pass-through in **both** argument shapes, the output budget, for
`searchArticles` the token-AND gate, each of the four weights, the date
tie-break, the `primaryTopic`-not-`categories` topic filter and both
empty-result sentences, and for `getSiteOverview` the empty-`properties`
schema, `type`-not-`typeLabel` counting, the topic exclusions and tie-break,
the articles-only date range, the five feed URLs, a live-scale budget check,
the topic trim, the `about` cap, and the omit-rather-than-zero failure answer.
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

# The site identity getSiteOverview reports, on the same pages.
grep -o '<body[^>]*>' public/index.html
```

Both should appear on 239 of the 269 built `index.html` files. The 30 without
are `page/1/` pagination stubs, which bypass `baseof.html` entirely — count
them with `grep -rL` rather than assuming a shortfall is a bug.

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
is 7,311 B raw and **2,956 B gzipped** standalone, up from 1,194 B when it
carried `listRecentArticles` alone.

| Template | No tools | + listRecentArticles | + searchArticles | + getSiteOverview | Headroom remaining |
|---|---|---|---|---|---|
| homepage | 128,586 | 129,750 | 130,828 | 131,541 | 42,539 |
| article | 147,652 | 148,848 | 149,926 | 150,721 | **23,359** |
| category | 90,355 | 91,540 | 92,990 | 93,814 | 80,266 |

The `getSiteOverview` column includes the three `data-rhino-site-*` attributes
on `<body>`, roughly 355 bytes of uncompressed HTML on every page carrying
`baseof.html`.

`budgetFailures` stays at **0** against the 174,080 B (170 KB) threshold. The
gate counts every `<script src>` with no `defer`/`async` exemption, so this
weight lands on the critical-path total despite the script being deferred.

The article template's ~23 KB is the binding headroom for `getArticle`, the one
tool left. Note the gate reports `status: fail` both before and after this change,
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

Two of the three routes below need no manual flag toggling, which makes the
whole surface verifiable from a script.

**Scripted, against the real build.** Launching the *installed* Chrome with
`--enable-features=WebMCP` gives a working `document.modelContext` with no flag
toggle and no origin-trial token, so Playwright (already a devDependency) can
drive the real asset end to end. This is the harness every measurement in
[What Chrome actually does, measured](#what-chrome-actually-does-measured) came
from.

```bash
npm run build:local:fast
( cd public && python3 -m http.server 8787 --bind 127.0.0.1 & )

node --input-type=module -e "
import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chrome', args: ['--enable-features=WebMCP'] });
const page = await browser.newPage();
await page.goto('http://127.0.0.1:8787/', { waitUntil: 'load' });
const out = await page.evaluate(async () => {
  const tools = await document.modelContext.getTools();
  const call = (name, args) =>
    document.modelContext.executeTool(tools.find((t) => t.name === name), JSON.stringify(args));
  return {
    listed: tools.map((t) => [t.name, t.description.length, t.inputSchema]),
    overview: await call('getSiteOverview', {}),
  };
});
console.log(out.listed);
console.log(out.overview.length, 'chars');
console.log(out.overview);
await browser.close();
"
```

Mind the call shape: `executeTool()` wants the `RegisteredTool` object and a
JSON **string**, not a tool name and an object, and an `AbortSignal` only takes
effect wrapped as `{ signal }` in a third argument. What this proved when
`getSiteOverview` landed, on Chrome 153.0.8010.47:

- All three tools register and round-trip through `getTools()`, alphabetized by
  Chrome, with descriptions of 312, 249 and 333 characters against the 500-char
  budget.
- `getSiteOverview` returns **1,052 characters** — 161 articles, 14 pages, 13
  topics, 2022-02-24 to 2026-09-14, five feeds — with 448 to spare.
- `listRecentArticles` returns **1,480 characters** at its default `limit: 4`:
  20 characters of headroom on real summaries. The budget fitter is not
  theoretical.
- `searchArticles` with `query: "commerce"` and `topic: "Release Notes"` reports
  30 matches, returns 3, and lands at 1,127 characters.
- Four tool calls produced exactly **one** `/index.json` request.

The same harness closed out the tracer bullet's remaining browser criteria, and
these are the ones worth re-running after any change to the guard, the fetch, or
`register()`:

- Launched **without** `--enable-features=WebMCP`, the page logs nothing, sets
  no guard flag, requests no `/index.json`, and registers nothing — the script
  is inert rather than half-enabled, exactly as it must be for every reader
  today.
- Re-running the fetched asset twice more in the page leaves the tool count at
  three: `window.__rhinoWebmcpToolsLoaded` stops a re-insert from registering a
  second copy.
- With `registerTool` patched to throw, and separately to reject, all three
  registrations fail, `getTools()` returns `[]`, and the console stays clean —
  the page carries on rendering. Only the promise `.catch()` makes the second
  of those two quiet.
- A first `/index.json` that fails at the network layer answers with the
  could-not-load guidance, and the very next call fetches again and returns
  rows: the cached promise clears on rejection rather than latching the
  failure.
- `limit` is clamped in code, not rejected: `0` returns one row and `999`
  behaves as `20`.

`localhost` is a secure context, so this needs no token. Verification against
the live tokened origin is the only thing that does, and that window closes
2026-11-17.

**Interactive.** WebMCP also exposes itself through
`chrome://flags/#enable-webmcp-testing` (toggle, then relaunch). Two inspection
paths answer different questions and both matter:

- **DevTools → Application → WebMCP** lists registered tools and logs
  invocations with their exact input and output, and offers a manual **Run tool**
  action. This proves a tool *works* when invoked with known input.
- The [Model Context Tool Inspector extension](https://chromewebstore.google.com/detail/model-context-tool-inspec/gbpdfapgefenggkahomfgkhfehlcenpd),
  which Chrome documents on its
  [WebMCP getting-started page](https://developer.chrome.com/docs/ai/webmcp),
  drives a real agent from natural-language prompts. This proves a tool gets
  *chosen* — that the name and description are enough for an agent to select it
  and fill its parameters.

Neither needs an origin-trial token either; a secure context (`localhost` or an
HTTPS preview) is the only requirement. The Tool Inspector is the one route the
scripted harness cannot replace, because only a real agent can show whether a
tool gets *chosen* from its name and description.

## Related files

- `src/assets/scripts/webmcp-tools.js` — the integration: all three tools, the
  shared index promise, the signal unwrapping, the budget fitter, and the
  duplicated scorer.
- `scripts/webmcp-tools.test.js` — its unit tests.
- `src/static/scripts/archive-search.js` — the human-facing archive search, and
  the other half of the intentionally duplicated scorer.
- `src/layouts/_default/baseof.html` — unconditional script declaration, and
  the three `data-rhino-site-*` attributes on `<body>` that back the overview's
  `name`, `description` and `about`.
- `src/layouts/partials/search/search-bar.html` — the precedent for handing a
  browser script its Hugo-side configuration through data attributes.
- `src/layouts/partials/site/deferred-script.html` — the shared fingerprint +
  SRI + `defer` delivery partial extracted by this change (this change).
- `src/layouts/partials/seo/head-meta.html` — the two gated origin-trial tags.
- `hugo.toml` — `webmcpOriginTrialTokenChrome`, `webmcpOriginTrialTokenEdge`.
- `docs/development/scroll-restoration.md` — the analogous Hugo Pipes asset this
  delivery pattern copies.
- `docs/publishing/article-markdown-link-headers.md` — the edge-header
  regression that argued for a meta tag over a Cloudflare rule.
