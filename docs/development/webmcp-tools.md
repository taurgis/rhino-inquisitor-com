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

This change is the first of five slices and registers **one** tool,
`listRecentArticles`, proving the delivery mechanism the remaining three
(`searchArticles`, `getSiteOverview`, `getArticle`) will reuse. The full spec and
the reasoning behind every decision below live on the wayfinder map,
[issue #49](https://github.com/taurgis/rhino-inquisitor-com/issues/49), and its
closed tickets.

## Behaviour details

### Old behaviour

No WebMCP integration. An in-page agent had no structured access to the site's
content and had to read the rendered DOM.

### New behaviour

On a browser **with** WebMCP available and the origin enrolled in the trial, one
read-only tool is registered at script execution:

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

On every **other** browser — which today means nearly all of them — the script
does nothing observable: no registered tool, no console output, no thrown error,
and no network request. The same silence applies once the origin-trial token
expires, because the absent-API check and the expired-token case are
indistinguishable from the page and want identical handling.

### Three behaviours worth knowing before changing this file

**The output budget is enforced in code, and it bites.** Chrome recommends at
most 1.5K characters per individual tool output. Four rows of real data serialize
to **1,480 characters** — 20 under the limit. A full `limit: 20` would be **6,870
characters**, 4.6x over, and no variation of the row shape brings 20 rows under
it. So `fitToBudget()` returns the most rows that actually fit and adds a
`guidance` sentence saying the list was cut. A consequence to expect: because the
guidance sentence itself costs ~170 characters, asking for `limit: 5` currently
returns **three** rows, one fewer than the default call's four. That is
deliberate. The budget matters more than it looks, because exceeding it fails
*invisibly* — the agent silently drops or truncates the payload, so an
over-budget tool appears to work while quietly lying.

**Failures resolve, they never reject.** Offline, aborted, and malformed-index
paths all return a `guidance` sentence that names a next move (usually
`/llms.txt`). An agent handed an opaque rejection has nothing to act on.

**The index is cached as a promise, not a value.** Concurrent tool calls join one
in-flight request rather than racing two, and a rejection clears the cache so the
next call retries instead of being permanently stuck on a failed fetch. Only one
tool calls it today, but the other three land on this same function.

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
unconditional script declaration), and the new script itself. No content,
routing, or output-format change, so no URL or redirect surface is touched.

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

21 tests covering the feature detect, the idempotency guard, swallowed
registration failures, the `type: "posts"` filter, limit clamping, the shared
promise (including single-fetch-under-concurrency and retry-after-rejection),
`AbortSignal` pass-through, and the output budget. The script is a browser IIFE
reading only globals, so it runs under `node:vm` with `document` and `fetch`
stubbed — no DOM library needed. The test lives in `scripts/` rather than beside
the asset so that test code stays out of Hugo's asset tree.

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

Measured impact of this change, from `validation/performance-budget-report.json`
(minified + gzipped, 1,194 B standalone):

| Template | Before | After | Delta | Headroom remaining |
|---|---|---|---|---|
| homepage | 128,586 | 129,750 | +1,164 | 44,330 |
| article | 147,652 | 148,848 | +1,196 | **25,232** |
| category | 90,355 | 91,540 | +1,185 | 82,540 |

`budgetFailures` stays at **0** against the 174,080 B (170 KB) threshold. The
gate counts every `<script src>` with no `defer`/`async` exemption, so this
weight lands on the critical-path total despite the script being deferred.

The article template's ~25 KB is the binding headroom for the remaining four
tools. Note the gate reports `status: fail` both before and after this change,
on six pre-existing Lighthouse SEO findings (score 92 against a required 95)
that are unrelated to WebMCP — so `budgetFailures` and `scoreFailures` must be
read separately rather than treating overall status as the signal.

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

- `src/assets/scripts/webmcp-tools.js` — the integration (this change).
- `scripts/webmcp-tools.test.js` — its unit tests (this change).
- `src/layouts/_default/baseof.html` — unconditional script declaration.
- `src/layouts/partials/site/deferred-script.html` — the shared fingerprint +
  SRI + `defer` delivery partial extracted by this change (this change).
- `src/layouts/partials/seo/head-meta.html` — the two gated origin-trial tags.
- `hugo.toml` — `webmcpOriginTrialTokenChrome`, `webmcpOriginTrialTokenEdge`.
- `docs/development/scroll-restoration.md` — the analogous Hugo Pipes asset this
  delivery pattern copies.
- `docs/publishing/article-markdown-link-headers.md` — the edge-header
  regression that argued for a meta tag over a Cloudflare rule.
