# Per-article Markdown `Link` response headers

Documents the Cloudflare-side configuration needed to close the one
remaining gap from the 2026-07 AI-agent-support audit: per-article HTTP
`Link` headers connecting each HTML page to its Markdown companion, and
each Markdown companion back to its canonical HTML page.

## Why this changed

An AI-agent-support audit found the site's Markdown-companion story mostly
complete — `<link rel="alternate" type="text/markdown">` in every page's
`<head>` (`seo/head-meta.html`), `llms.txt`/`llms-full.txt` linking to
Markdown output (`home.llms.txt`), and HTML kept canonical in the sitemap
while `llms.txt` uses Markdown URLs. The one partial item: no HTTP `Link`
header carries the same alternate/canonical relationship at the transport
level, only in the HTML `<head>` and in the Markdown document's own
`canonical_url` front matter.

This is the same class of gap already documented for the homepage's
`describedby` header in
[`docs/publishing/agent-discovery-link-header.md`](agent-discovery-link-header.md):
GitHub Pages cannot set custom response headers, so the header has to be
injected at the Cloudflare edge in front of the site, outside this repo's
version control. That doc's Transform Rule only covers `/` (one static
header value). This one is per-article, so the header value has to be
computed per request from the URL path — the same dynamic-value technique
the site's Markdown content-negotiation rewrite rule already uses (see
[`docs/publishing/homepage-markdown-alternate.md`](homepage-markdown-alternate.md)).

## What's already covered without this change

- `Content-Type: text/markdown; charset=utf-8` on `.../index.md` responses
  is live and correct — verified directly against production:

  ```bash
  curl -sD - -o /dev/null https://rhino-inquisitor.com/index.md | grep -i '^content-type:'
  # content-type: text/markdown; charset=utf-8
  ```

- Every article now has a visible "View as Markdown" link in the article
  footer (`article/footer-actions.html`), not just the `<head>` alternate —
  see the template change below.
- The Markdown document's own front matter already declares `canonical_url`
  back to the HTML page (`single.markdown.md`).

The `Link` header below is an additional transport-level signal for clients
that check headers before parsing the body (crawlers, agent frameworks) —
it does not replace any of the above.

## Template change: visible Markdown link

- `src/layouts/partials/article/footer-actions.html` now resolves the
  page's `markdown` output format (same guard as `head-meta.html`: `(or
  .IsPage .IsHome)` and not `seo.noindex`) and renders `View as Markdown`
  in the existing footer nav, alongside "Browse more in {topic}" and "Next
  article". The nav's visibility condition widened from `{{ if or
  $topicPage $nextArticle }}` to also show when only the Markdown link
  applies (e.g. an article with no resolved topic and no next article).

## Recommended Cloudflare Transform Rules

Two separate **Response Header Transform Rules**, dashboard path: zone
`rhino-inquisitor.com` → **Rules** → **Overview** → **Create rule** →
**Response Header Transform Rule**
([docs](https://developers.cloudflare.com/rules/transform/response-header-modification/create-dashboard/)).
Both use **Set dynamic** (not **Set static**) since the value depends on
the request path.

### Rule 1 — HTML page → `Link: <its Markdown companion>; rel="alternate"`

- **Rule name:** `Article Markdown alternate Link header`
- **When incoming requests match** (mirrors the exclusion set already
  validated for the Markdown content-negotiation rule — list/section pages
  with no Markdown output stay excluded):

  ```text
  (http.host eq "rhino-inquisitor.com" or http.host eq "www.rhino-inquisitor.com") and ends_with(http.request.uri.path, "/") and not http.request.uri.path in {"/posts/" "/pages/"} and not starts_with(http.request.uri.path, "/category/")
  ```

- **Modify response header** → **Set dynamic**
- **Header name:** `Link`
- **Value:**

  ```text
  concat("<", http.request.uri.path, "index.md>; rel=\"alternate\"; type=\"text/markdown\"")
  ```

### Rule 2 — Markdown companion → `Link: <canonical HTML>; rel="canonical"`

- **Rule name:** `Article Markdown canonical Link header`
- **When incoming requests match:**

  ```text
  (http.host eq "rhino-inquisitor.com" or http.host eq "www.rhino-inquisitor.com") and ends_with(http.request.uri.path, "index.md")
  ```

- **Modify response header** → **Set dynamic**
- **Header name:** `Link`
- **Value:**

  ```text
  concat("<https://rhino-inquisitor.com", substring(http.request.uri.path, 0, -8), ">; rel=\"canonical\"")
  ```

  `substring()`'s negative end index strips a fixed number of trailing
  characters (`-8` removes the 8 characters of `index.md`), matching the
  rule's own match filter (`ends_with(..., "index.md")`) — no regex
  required, so this works on the Free plan. `regex_replace()` would also
  work but needs a Business (or WAF Advanced) plan; `substring()` is the
  right choice here specifically because the suffix being stripped is
  always the same fixed string, not a variable pattern.

  `rel="canonical"` on an HTTP `Link` header for an alternate-format
  document pointing back to the primary URL is the same convention used by
  AMP pages' canonical header — a registered, widely recognized relation
  for exactly this "this is an alternate representation of that URL" case.

Both rules use **Set dynamic**, which behaves like `describedby`'s
**Set static** in `agent-discovery-link-header.md`: it always overrides to
the computed value, so a conflicting `Link` value from another rule or the
origin can't leak through.

`concat()` and `substring()` are already relied on / confirmed plan-free in
this zone (see `homepage-markdown-alternate.md` for `concat()`); neither
rule above needs `regex_replace()`, which is gated to Business/WAF Advanced
plans and unavailable on this zone's plan.

### Rule 3 — homepage combined `Link` header (required — fixes a regression)

Rule 1's match (`ends_with(path, "/")`, not excluded) also matches `/`
itself, so it fires on the homepage alongside the pre-existing
`describedby` rule from `agent-discovery-link-header.md` — both rules
write to the same `Link` header on the same path. `Set` **overwrites**
rather than appends, so only whichever rule executes last in the Transform
Rules list actually takes effect; deploying Rule 1 silently dropped the
`describedby → /llms.txt` signal on `/` (confirmed live: `curl -sI
https://rhino-inquisitor.com/` showed only the `alternate` header, not
`describedby`, after Rules 1 and 2 went live).

Fix: replace the separate `describedby` rule with one homepage-specific
rule carrying both relations in a single comma-separated value (valid per
RFC 8288 §3.5), positioned **last** in the Transform Rules list so it wins
over Rule 1 for `/`:

- **Rule name:** `Homepage combined Link header`
- **When incoming requests match:**

  ```text
  (http.host eq "rhino-inquisitor.com" or http.host eq "www.rhino-inquisitor.com") and http.request.uri.path eq "/"
  ```

- **Modify response header** → **Set static** (homepage path is fixed, no
  per-request value needed)
- **Header name:** `Link`
- **Value:**

  ```text
  </index.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="describedby"
  ```

- Delete (or disable) the original standalone `describedby` rule from
  `agent-discovery-link-header.md` once this combined rule is deployed —
  keeping both live is redundant and re-introduces the same overwrite race
  depending on list order.

## Impact and verification

- No repo-side gate currently asserts the live `Link` header on article or
  homepage pages (the existing `agentDiscoveryLinkHeader` check in
  `scripts/gates/check-https-security.js` only inspects the homepage'
  `describedby` relation, and will need re-pointing at the combined value
  once Rule 3 replaces the standalone rule). This document does not add a
  gate — it is Cloudflare-side configuration outside the build, same as
  the precedent it follows.
- Rules 1 and 2 are deployed and verified live and correct (2026-07-14):

  ```bash
  curl -sI "https://rhino-inquisitor.com/preparing-for-the-b2c-commerce-developer-certification/?cachebust=1" | grep -i '^link:'
  # link: </preparing-for-the-b2c-commerce-developer-certification/index.md>; rel="alternate"; type="text/markdown"

  curl -sI "https://rhino-inquisitor.com/preparing-for-the-b2c-commerce-developer-certification/index.md?cachebust=1" | grep -i '^link:'
  # link: <https://rhino-inquisitor.com/preparing-for-the-b2c-commerce-developer-certification/>; rel="canonical"
  ```

  Use a `?cachebust=` query param (or wait out `cache-control: max-age=600`)
  when re-checking — Cloudflare/Fastly edge caching otherwise serves a
  pre-Rule response for up to ~10 minutes after a deploy.

- Rule 3 (homepage combined header) is deployed and verified live and
  correct (2026-07-14) — both relations survive in one header, and the
  standalone `describedby` rule's overwrite conflict is resolved:

  ```bash
  curl -sI "https://rhino-inquisitor.com/?cachebust=1" | grep -i '^link:'
  # link: </index.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="describedby"

  curl -sI "https://rhino-inquisitor.com/index.md?cachebust=1" | grep -i '^link:'
  # link: <https://rhino-inquisitor.com/>; rel="canonical"
  ```

- Re-verify `Content-Type` on the Markdown response hasn't regressed:

  ```bash
  curl -sI https://rhino-inquisitor.com/some-article/index.md | grep -i '^content-type:'
  ```

## Related files

- `src/layouts/partials/article/footer-actions.html` — visible "View as
  Markdown" link (this change).
- `src/layouts/partials/seo/head-meta.html` — existing `<head>` alternate
  link this header mirrors.
- `docs/publishing/agent-discovery-link-header.md` — prior precedent for a
  Cloudflare-side `Link` header (homepage `describedby`, static value).
- `docs/publishing/homepage-markdown-alternate.md` — prior precedent for a
  Cloudflare-side dynamic rule keyed on request path (`concat()` usage).
- Cloudflare zone configuration for `rhino-inquisitor.com` (outside this
  repo) — where both Transform Rules must actually be created.
