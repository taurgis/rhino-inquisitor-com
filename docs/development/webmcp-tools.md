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

The surface was built in five slices. All four tools are registered —
`listRecentArticles`, `searchArticles`, `getSiteOverview` and `getArticle` —
and the closing pass has verified the finished set against the built site on
Chrome 153.0.8010.47; every figure it measured is recorded under
[The finished surface, measured](#the-finished-surface-measured). The full spec
and the reasoning behind every
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

| | |
|---|---|
| `name` | `getArticle` |
| `title` | Get article |
| `inputSchema` | required `url` string |
| `annotations` | `readOnlyHint: true` |

Its description, verbatim:

> Returns a summary of one article on rhino-inquisitor.com: its title,
> publication date, topic, hand-written key takeaways, opening paragraph, and
> the URL of its full Markdown text. Use it after searchArticles or
> listRecentArticles to learn what an article covers. Fetch the returned
> markdownUrl for the complete article.

It returns `{ title, url, markdownUrl, date, topic, categories, readingTime,
keyTakeaways, opening }`. Everything but the last two comes from `/index.json`;
those two are read from the article's own Markdown companion.

**It is a digest, not the body.** Companion Markdown averages 11.5 KB and peaks
at 39 KB — 8 to 27 times the output budget. The digest is not a truncation of that:
every one of the 161 articles authors a three-bullet `takeaways` block by hand,
so each already has a real abstract. An agent that wants the whole text fetches
`markdownUrl`, which is precisely what the companions exist for.

#### Taking the url in whatever shape the agent has it

`url` is normalised in the tool rather than in the agent, which is Chrome's
[best-practices](https://developer.chrome.com/docs/ai/webmcp/best-practices?hl=en)
rule — "Accept raw user input. Avoid asking the agent to perform math or
transform the input strings" — applied to a string the agent is relaying
verbatim from a previous tool result. Accepted, all resolving to the same
article: the bare path `/headless/` the other tools return, the full permalink
`https://rhino-inquisitor.com/headless/`, no trailing slash, no leading slash,
a `?utm_source=…` query, a `#fragment`, surrounding whitespace, mixed case, and
the `index.md` or `index.html` suffix.

An origin is accepted only when it is the document's own or one the index's
permalinks carry, so `https://example.com/headless/` resolves to nothing rather
than to our article on a path collision.

#### Two dead ends answered from the index, with no fetch

Neither failure costs a request, which is both cheaper than fetching a URL the
site does not build and the only way to tell the two apart:

- A browse page answers `That URL is a topic index, not an article. …`. The
  recognised roots are `/posts/`, `/pages/`, `/category/`, `/categories/`,
  `/blog/`, `/archive/` and `/` — measured against a build, where all six
  directories exist, pagination included (`/posts/page/2/`). Sections,
  taxonomies and terms have no Markdown companion at all, because `hugo.toml`
  gives the `markdown` output format to the `page` kind only: that is by design,
  not a build gap, and it is why fetching one of these URLs could only ever
  404.
- Anything else unmatched answers `No article at that URL on
  rhino-inquisitor.com. Call searchArticles to find one, or listRecentArticles
  for the newest.`

**One deliberate deviation from the specified string.** The topic-index sentence
was specified with one topic as its example — `topic "AI"` — and the
implementation fills that slot in from the URL instead of quoting it literally,
because a fixed name is the wrong name for every term page but one. So
`/category/architecture/` answers `… with topic "Architecture" …`, while
`/posts/`, which names no topic at all, answers `… with a topic from
getSiteOverview …`. The name offered is always a `primaryTopic` value taken from
the index, because that is the exact string `searchArticles` filters on — a term
page's own display name is not (`/category/salesforce-commerce-cloud/` reads
"Salesforce Commerce Cloud" while the topic behind it is "Commerce Cloud").

Also as specified, and worth correcting the next time that text is revised: the
`url` parameter description offers `"/cartridge-path-and-overrides/"` as its
example, and no article lives there (the real path is
`/sfcc-cartridge-path-overrides-explained/`). An agent that calls the example
instead of a URL from a prior result gets the "No article at that URL" sentence
and a pointer to `searchArticles`, so it recovers — but it should not have to.

#### Reading the Markdown companion, and what a template change breaks

The companion is **not** what `src/layouts/_default/single.markdown.md` emits.
`scripts/seo/generate-llm-artifacts.js` rewrites every Hugo-emitted `index.md`
in place from the *rendered HTML*: front matter, then `## Key Takeaways` with
one `-` bullet per `.article-summary__list` item, then the body turned down
from `section.article-body`. That script's output is the shape this tool parses,
so **a change to either the template or that script can silently change what
`getArticle` returns.** Re-run the corpus sweep below when you touch either.

The parse rule, and what a full production build measured on 2026-09-17 says
about it across 180 companions:

- Front matter is skipped, not parsed. `/index.json` already carries the date,
  topic, categories and reading time, and the one field that would be worth
  having — `markdown_url` — equals `permalink` + `index.md` for all 175 indexed
  entries, so it is computed instead. It is also folded onto a second line as a
  YAML `>-` scalar for the 69 longest URLs, which is more YAML than a browser
  asset should have to learn.
- A body starting with `## Key Takeaways` yields the contiguous `-` lines that
  follow it, with no blank line in between: 161 companions, three bullets every
  time. Three is not a contract — the block mirrors however many items the
  post's `takeaways` front matter carries.
- The 19 companions with no takeaways block at all are a normal path, not an
  error: the 14 `pages`-type entries set no `takeaways`, and nor do the home,
  archive and other unindexed pages. They return `keyTakeaways: []`.
- `opening` is the first blank-line-delimited block that carries a sentence,
  scanning at most four blocks in. **This is a deliberate deviation**: the tool
  was specified to take "the first paragraph" flat, and its ticket's Notes
  flagged the risk that a shortcode replacement could land there instead,
  "worth spot-checking against a wider sample before shipping". The sweep found
  the risk is real, so the rule skips rather than quotes. **Five of the 180 open on something that is
  not prose**: four on `Play video`, a label the rendered player contributes
  (`/headless/`, `/the-path-to-being-an-architect/` and two more), and
  `/salesforce-b2c-commerce-cloud-erd/` on an image, then a bare link, then a
  heading. Skipping those is why the scan exists; bounding it at four is why a
  body of nothing but fragments falls back to its own first block rather than
  quoting the middle of the article.
- A block carries a sentence when, after dropping blockquote markers, images and
  link targets, what is left still ends a sentence somewhere. Headings and code
  fences never count.
- Block-level markers are stripped from the chosen block and inline markup is
  not, so the four articles that open on an update callout
  (`> **Updated July 2026:** …`) lose the `>` and keep their bold and links.

#### markdownUrl is absolute, the fetch is not

The companion is fetched at `relPermalink` + `index.md`, so the request is
same-origin whatever host serves the build — which is what makes the tool work
in the localhost-served production build the browser verification uses. The
reported `markdownUrl` is the absolute URL the companion declares for itself,
because that is the one the agent hands on.

There is one shared cached promise for `/index.json` and **no** cache for
companions. 175 of them at 11.5 KB average would either grow without bound or need
eviction logic a digest tool has not earned; each call fetches at most one, and
only after the URL has already resolved against the index.

#### What gives way when the payload is too big

Only the opening. The takeaways are the article's own abstract and everything
else is a single measured field, so trimming those would cost the agent exactly
what it called for. Measured across the corpus, the payload *without* an opening
peaks at 813 characters against the 1,500 budget, so there is always room for
some of one. The countdown is by characters rather than by whole fields, and it
re-measures after each cut because JSON escaping can make a cut smaller than it
looks; the cut itself is marked with an ellipsis. Across the 175 live entries
exactly two openings get trimmed, and the largest payload lands on 1,500 —
*on* the budget, not under it, because the fitter treats 1,500 as a maximum, the
same way `fitToBudget` does and the same way Chrome's own wording reads — it
recommends "1.5K character limit per individual tool output", a ceiling rather
than a target, and 1,500 is the stricter reading of it.

A companion that 404s, fails the network, is aborted, or comes back as something
other than a companion returns every index-sourced field plus a sentence naming
the absolute URL to fetch by hand. `keyTakeaways` and `opening` are omitted
rather than emptied, the same distinction the overview's failure answer draws:
an absent key says the read failed, where an empty one would be a claim about
the article.

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
four rows, against the **9 characters** of headroom left in the worst four-row
payload the closing pass found on the real corpus (1,491 of 1,500 — see
[The finished surface, measured](#the-finished-surface-measured)). Adding it would cost roughly one
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

**`executeTool()` hands back a JSON string, not the object the tool returned.**
Chrome's docs say the method "returns the result of the tool execution". On M153
an object returned from `execute` reaches the caller already serialized: the
resolved value's `typeof` is `"string"`, holding the JSON text. That is load-
bearing for the output budget rather than a curiosity, because it makes the
thing being budgeted *exactly* the string the two budget fitters measure with
`JSON.stringify` — they agree to the character, so the in-code limit is the
limit the agent sees. It also sets one trap for a verification rig: stringify
that result a second time and every inner quote is escaped again, inflating the
measured length by roughly 5% and manufacturing phantom budget breaches.
[Issue #53](https://github.com/taurgis/rhino-inquisitor-com/issues/53) pinned
the input side and the plain-*string* return; this is the object return.

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

103 tests covering the feature detect, the idempotency guard, per-tool
registration isolation (both the sync-throw and the rejected-promise route),
the `type: "posts"` filter, limit clamping, the shared
promise (including single-fetch-under-concurrency and retry-after-rejection),
`AbortSignal` pass-through in **both** argument shapes, the output budget, for
`searchArticles` the token-AND gate, each of the four weights, the date
tie-break, the `primaryTopic`-not-`categories` topic filter and both
empty-result sentences, and for `getSiteOverview` the empty-`properties`
schema, `type`-not-`typeLabel` counting, the topic exclusions and tie-break,
the articles-only date range, the five feed URLs, a live-scale budget check,
the topic trim, the `about` cap, and the omit-rather-than-zero failure answer,
and for `getArticle` every shape the `url` argument arrives in, the two
index-only dead ends, the companion parse against verbatim fixtures copied out
of a production build, the prose-skipping opening rule, the absolute
`markdownUrl` against the same-origin fetch, and the second budget fitter.
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

Measured impact, from `validation/performance-budget-report.json`. The finished
script is 11,739 B raw and **4,380 B gzipped** standalone, up from 1,194 B
gzipped when it carried `listRecentArticles` alone and 2,956 B at three tools.

| Template | No tools | + listRecentArticles | + searchArticles | + getSiteOverview | + getArticle | Headroom remaining |
|---|---|---|---|---|---|---|
| homepage | 128,586 | 129,750 | 130,828 | 131,541 | 133,092 | 40,988 |
| article | 147,652 | 148,848 | 149,926 | 150,721 | 152,249 | **21,831** |
| category | 90,355 | 91,540 | 92,990 | 93,814 | 95,354 | 78,726 |

The `getSiteOverview` column includes the three `data-rhino-site-*` attributes
on `<body>`, roughly 355 bytes of uncompressed HTML on every page carrying
`baseof.html`.

`budgetFailures` stays at **0** against the 174,080 B (170 KB) threshold. The
gate counts every `<script src>` with no `defer`/`async` exemption, so this
weight lands on the critical-path total despite the script being deferred.

The article template — the binding one — keeps **21,831 B** of headroom with all
four tools in place, so the whole surface cost 4,597 B of it: the script's
4,380 B gzipped plus about 220 B of `<body>` attributes and script markup. Read
`budgetFailures` and `scoreFailures` separately rather than treating the
report's overall `status` as the signal: a category score below its threshold
fails the gate too, and for reasons that have nothing to do with transfer
weight — see [the gates](#the-gates-with-the-finished-script-in-place) for one
that cost this pass a wrong diagnosis.

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
  proving the trim path on real data. The closing pass re-ran this in the
  browser over 392 distinct title words, all at `limit: 20`, and found a worst
  of **1,491** — still inside the budget, and the tighter of the two figures.

Re-run this sweep when the row shape, the weights, or the summary lengths in
`/index.json` change — those **9** characters of worst-case headroom are the
whole safety margin.

### Verify getArticle against the real companions

`getArticle` is the only tool that reads something other than `/index.json`, and
the shape it reads is generated, not authored — so the fixtures in the unit tests
prove the parse rule while only a sweep proves the corpus still matches it. Run
it against a **production** build:

```bash
SKIP_AVIF_CACHE=1 npm run build:prod
find public -name index.md | wc -l   # 180; a development build gives 0, see below
```

```bash
node --input-type=module -e "
import fs from 'node:fs';
import vm from 'node:vm';
const index = JSON.parse(fs.readFileSync('public/index.json', 'utf8'));
const registered = [];
const box = {
  fetch(url) {
    if (url === '/index.json') return Promise.resolve({ ok: true, json: () => Promise.resolve(index) });
    const file = 'public' + url;
    if (!fs.existsSync(file)) return Promise.resolve({ ok: false, status: 404, text: () => Promise.resolve('') });
    return Promise.resolve({ ok: true, text: () => Promise.resolve(fs.readFileSync(file, 'utf8')) });
  },
  document: { modelContext: { registerTool: (d) => registered.push(d) }, body: { dataset: {} } },
};
box.window = box; box.globalThis = box;
vm.createContext(box);
vm.runInContext(fs.readFileSync('src/assets/scripts/webmcp-tools.js', 'utf8'), box);
const tool = registered.find((d) => d.name === 'getArticle');
let worst = 0, trimmed = 0, problems = 0;
for (const entry of index) {
  const r = await tool.execute({ url: entry.relPermalink });
  const chars = JSON.stringify(r).length;
  const declared = /markdown_url:[ \t]*(?:>-)?[ \t]*\n?[ \t]*'?([^'\"\n]+)'?/
    .exec(fs.readFileSync('public' + entry.relPermalink + 'index.md', 'utf8'))[1].trim();
  const bad = r.guidance || chars > 1500 || !r.opening || r.markdownUrl !== declared
    || (entry.type === 'posts' && r.keyTakeaways.length === 0);
  if (bad) { problems += 1; console.log('PROBLEM', entry.relPermalink, chars, r.guidance || ''); }
  if (r.opening.endsWith('…')) trimmed += 1;
  worst = Math.max(worst, chars);
}
console.log('entries', index.length, 'problems', problems, 'largest', worst, 'trimmed', trimmed);
"
```

What it established when `getArticle` landed: **175 entries, 0 problems**, the
largest payload 1,500 characters exactly, two openings trimmed, and takeaway
counts of three for all 161 articles and zero for all 14 reference pages. Every
`markdownUrl` matched the value its own companion's front matter declares.

Two traps in that harness, both worth knowing before trusting a clean run:

- **A development build has no companions to read.** `npm run build:local:fast`
  marks pages `noindex`, and `scripts/seo/generate-llm-artifacts.js` deletes the
  companion of any `noindex` page — so it leaves zero `index.md` files behind and
  every sweep entry would "fail" for the wrong reason. Use `build:prod`, or pass
  `--keep-noindex`.
- **The resolution paths need their own checks**, since a sweep over the index
  only ever passes URLs that exist. Worth re-running by hand after any change to
  the normaliser: `/headless` and `https://rhino-inquisitor.com/headless/` both
  resolve to the article, `/posts/` `/archive/` `/` answer the topic-index
  sentence with the `getSiteOverview` pointer, `/category/architecture/` answers
  it with `topic "Architecture"`, and `/nope/` plus
  `https://example.com/headless/` both answer "No article at that URL".

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

### The finished surface, measured

The closing pass ran the finished four-tool script against a **production**
build served over `localhost`, on **Chrome 153.0.8010.47** launched with
`--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport` — the rig shape
[issue #50](https://github.com/taurgis/rhino-inquisitor-com/issues/50)
established, reused rather than reinvented. Build production, not development:
a development build ships no Markdown companions at all (see
[Verify getArticle against the real companions](#verify-getarticle-against-the-real-companions)),
so `getArticle` would answer every call with its could-not-read guidance.

Chrome's budgets are **recommendations** in its own words ("we recommend the
following character limits"), not enforced ceilings, and they fail invisibly:
500 per tool description, 150 per parameter description, 30 per name, 1.5K per
individual tool output. Every name and description read back out of
`getTools()`, so this is what an agent is handed rather than what the source
intends:

| Tool | Name | Description | Parameters (name / description) |
|---|---|---|---|
| `getArticle` | 10 | 319 | `url` 3 / 124 |
| `getSiteOverview` | 15 | 312 | none |
| `listRecentArticles` | 18 | 249 | `limit` 5 / 55 |
| `searchArticles` | 14 | 333 | `query` 5 / 110, `limit` 5 / 103, `topic` 5 / 99 |

The tightest margin is `getArticle`'s `url` description at 124 of 150 — 26
characters. Everything else sits at two thirds of its budget or less. All four
tools reflect `annotations` as `{"readOnlyHint":true,"untrustedContentHint":false}`
and `inputSchema` as a JSON **string**.

Output is the budget that actually binds, so it was measured by sweeping real
data rather than sampling:

| Tool | Worst case measured | Where | Sweep |
|---|---|---|---|
| `getArticle` | **1,500** | `/simplifying-the-salesforce-order-of-execution/` and `/what-can-i-use-chatgpt-for-when-working-with-salesforce/` | all 175 index entries — 161 articles plus 14 reference pages; smallest 335 |
| `searchArticles` | **1,491** | `query: "and"`, 4 returned of 128 matched | 392 distinct title words, each at `limit: 20` |
| `listRecentArticles` | **1,480** | `limit: 4` | all 20 limits, 1 through 20 |
| `getSiteOverview` | **1,052** | its only call | — |

Nothing exceeded 1,500, the constant the script enforces, which is also the
stricter reading of Chrome's "1.5K" (1,536 would leave 36 more). Two of the 175
entries land on 1,500 *exactly* — the fitter is working at its limit on real
content, not coasting.

Two traps in that table worth keeping:

- **The worst case is not the largest input.** `listRecentArticles` peaks at
  `limit: 4` (1,480) and *falls* to 1,300 at `limit: 5`, holding there (1,301
  from `limit: 10`) all the way to 20, because past four rows the fitter drops
  to three and spends the difference on its "only the first N fit" sentence.
  Measure every value, not a sample: a first pass sampled
  `1, 2, 3, 4, 6, 8, 12, 16, 20` and put the fall at `limit: 6`, one value
  late.
- **Stringifying twice manufactures breaches.** A first run of this rig
  measured `JSON.stringify(result).length` and reported a 1,540-character
  `getArticle` payload with 41 search queries over budget. All of it was the
  rig's own double-escaping of a value Chrome had already serialized (see
  [What Chrome actually does, measured](#what-chrome-actually-does-measured)).

Thirty guidance and input-shape paths were exercised deliberately, and **none
threw**. They split cleanly, which is the distinction worth keeping: a tool
either cannot answer and says so, or recovers from the malformed input and
answers properly. Never an error either way.

**Sixteen could not answer, and all sixteen returned a guiding sentence** —
`searchArticles` with no query, an empty query, whitespace only, punctuation
only, a wrong-typed query, words that match nothing, and an unknown topic;
`listRecentArticles` when more rows were asked for than fit; `getArticle` with
a missing, empty or wrong-typed url, an unknown path, a foreign origin on a real
path, a listing root, a term URL, and the schema's own example path. Sentences
ran 97 to 157 characters inside payloads of 135 to 1,301.

**Fourteen recovered and answered properly**, which is what the input-shape
criteria on [#52](https://github.com/taurgis/rhino-inquisitor-com/issues/52)
and [#55](https://github.com/taurgis/rhino-inquisitor-com/issues/55) asked for:
`limit` at 0, 999, negative, fractional, null and non-numeric all clamped and
returned rows; `getArticle` resolved an uppercase url with no trailing slash, an
`index.md` suffix, and a url carrying a query string and fragment to the same
480-character article; `getSiteOverview` ignored an unexpected argument.

With `/index.json` aborted at the network layer, all four tools answer the
could-not-load sentence (payloads of 161 to 562 characters) instead of
rejecting.

The remaining browser-level facts, re-checked on the finished script:

- Tool discovery returns all four, alphabetized by Chrome.
- **Zero** `/index.json` requests on page load and exactly **one** across eight
  tool calls, on the article, home and archive templates alike — the lazy fetch
  [ticket #56](https://github.com/taurgis/rhino-inquisitor-com/issues/56)
  specified, still lazy with four tools sharing the promise.
- Zero console errors on all three templates.
- Aborting a `getArticle` call at 500 ms rejected with `AbortError` at 501 ms
  while its companion request was still in flight.

Every figure above comes back from this, which regenerates the description
budgets and the three sweepable worst cases in one run. Write it at the repo
root rather than `/tmp`: a script outside the project cannot resolve the bare
`playwright` specifier.

```bash
SKIP_AVIF_CACHE=1 npm run build:prod
( cd public && python3 -m http.server 8792 --bind 127.0.0.1 >/dev/null 2>&1 & )

node --input-type=module -e "
import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chrome',
  args: ['--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport'] });
const page = await browser.newPage();
await page.goto('http://127.0.0.1:8792/', { waitUntil: 'load' });
console.log(browser.version());
console.log(JSON.stringify(await page.evaluate(async () => {
  const tools = await document.modelContext.getTools();
  // Chrome returns the payload already serialized: measure that string's own
  // length. JSON.stringify()ing it again double-escapes and reads ~5% high.
  const chars = async (name, args) =>
    (await document.modelContext.executeTool(
      tools.find((t) => t.name === name), JSON.stringify(args), {})).length;
  const peak = async (name, argsFor, values) => {
    let top = 0;
    for (const value of values) { top = Math.max(top, await chars(name, argsFor(value))); }
    return top;
  };
  const entries = await (await fetch('/index.json')).json();
  const words = new Set(entries.flatMap((e) =>
    String(e.title).toLowerCase().match(/[a-z0-9]{3,}/g) || []));
  return {
    budgets: tools.map((t) => [t.name, t.name.length, t.description.length,
      Object.entries(JSON.parse(t.inputSchema).properties)
        .map(([k, v]) => [k, k.length, v.description.length])]),
    getArticle: await peak('getArticle', (e) => ({ url: e.relPermalink }), entries),
    searchArticles: await peak('searchArticles', (w) => ({ query: w, limit: 20 }), [...words]),
    listRecentArticles: await peak('listRecentArticles', (n) => ({ limit: n }),
      Array.from({ length: 20 }, (_, i) => i + 1)),
    getSiteOverview: await chars('getSiteOverview', {})
  };
}), null, 1));
await browser.close();
"
```

Add the guidance probes, the `/index.json` request accounting and the abort to
that same `page.evaluate` to reproduce the rest; the abort needs
`executeTool(tool, json, { signal })` and a route that stalls the companion
request, or it has nothing to cancel.

### The gates, with the finished script in place

`npm run gates:local` runs 38 blocking gates and stops at the first failure.
**All 38 pass** with the finished script in place.

Fresh Lighthouse medians, three runs per profile in `staticDistDir` mode, with
the script declared on every page:

| Template | Performance (≥90) | Accessibility (≥90) | Best practices (≥90) | SEO (≥95) |
|---|---|---|---|---|
| homepage | 97 mobile / 100 desktop | 100 | 100 | 100 |
| article | 98 / 100 | 100 | 100 | 100 |
| category | 97 / 100 | 100 | 100 | 100 |

`budgetFailures: 0`, `scoreFailures: 0`, `status: "pass"`.

**A stale `node_modules` can fail this gate on SEO, and it is not the site's
fault.** Worth recording, because it cost this pass a wrong diagnosis. A first
run scored SEO **92** against the required 95 on all three templates and both
profiles, with the `robots-txt` audit at 0 reporting
`Content-Signal: ai-train=yes, search=yes, ai-input=yes` as an
`Unknown directive` — the Content Signals line this site deliberately publishes
from `src/layouts/robots.txt`. That looked like Lighthouse penalising a policy
choice, and it is not: `@lhci/cli` 0.15.1 bundles its own Lighthouse 12.6.1,
which has no `content-signal` in the `DIRECTIVE_SAFELIST` of
`core/audits/seo/robots-txt.js`, while the version this repo pins — 13.0.3, held
in place by the `overrides: { "lighthouse": "$lighthouse" }` block in
`package.json` — lists it explicitly, commented "not officially supported, but
used in the wild". `npm ci` honours the override and leaves one top-level copy,
which is what CI resolves; a `node_modules` predating the override can keep the
nested 12.6.1 alive, and only the local run then fails. Confirm with:

```bash
node -e "console.log(require.resolve('lighthouse', { paths: ['node_modules/@lhci/cli'] }))"
```

If that prints a path under `@lhci/cli/node_modules`, run `npm ci` before
trusting an SEO number. Read `budgetFailures` and `scoreFailures` separately in
any case, rather than treating the overall `status` as the signal.

Three acceptance checks on
[issue #61](https://github.com/taurgis/rhino-inquisitor-com/issues/61) cannot be
met from a script and are owner work, not gaps in the implementation:

- **The DevTools WebMCP pane** (Application → WebMCP) needs a human clicking
  through Available Tools, the invocation log, and **Run tool**. Everything the
  pane surfaces was verified through the same API it renders, with the same
  flags, but the pane itself was not walked.
- **The Model Context Tool Inspector extension** needs a Chrome Web Store
  install and a real agent driven from natural-language prompts. It is the one
  route a script cannot replace, because it answers a question none of the
  above does: whether each tool gets *chosen* from its name and description.
- **The map owner's end-to-end review**, which the map names as its closing
  step.

One slice is outstanding by design rather than by capability: the check against
the real tokened origins. Both `hugo.toml` token params ship empty today, so
there is nothing live to verify against yet, and that slice is the only one on a
clock — Edge's token expires **2026-11-01** and both trials end **2026-11-17**.
Everything above was measured behind a local flag and has no expiry, so it can
be redone at any time.

One observation the pass turned up that is worth a follow-up rather than a
silent fix: `searchArticles` with a valid `query` and an unmatched `topic`
answers `No articles match "sfcc" on rhino-inquisitor.com…`, attributing the
empty result to the query when the topic filter caused it. The sentence is
guiding and within budget, so it meets the criterion as written, but an agent
reading it would retry with different words rather than drop the topic.

## Related files

- `src/assets/scripts/webmcp-tools.js` — the integration: all four tools, the
  shared index promise, the signal unwrapping, the budget fitter, the companion
  parser, and the duplicated scorer.
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
- `scripts/seo/generate-llm-artifacts.js` — writes the Markdown companions
  `getArticle` parses, by rewriting each Hugo-emitted `index.md` from the
  rendered HTML. The `## Key Takeaways` block and the body shape come from
  here, not from the template.
- `src/layouts/_default/single.markdown.md` — the companion's front matter and
  the takeaways block the script above rewrites.
- `docs/publishing/article-markdown-link-headers.md` — the edge-header
  regression that argued for a meta tag over a Cloudflare rule, and the
  companion `Link` headers `markdownUrl` points into.
