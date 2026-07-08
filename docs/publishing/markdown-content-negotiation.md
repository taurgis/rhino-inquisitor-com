# Markdown content negotiation for agents (`Accept: text/markdown`)

This document records how rhino-inquisitor.com answers agent requests that use
markdown content negotiation, why we serve our own pre-generated markdown
instead of relying on Cloudflare's automatic HTML→markdown conversion, and the
exact Cloudflare zone configuration (out of repo) required to activate it.

## Background — what Cloudflare shipped

In February 2026 Cloudflare launched **Markdown for Agents**
([blog](https://blog.cloudflare.com/markdown-for-agents/),
[docs](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/)):
when a client sends `Accept: text/markdown` and the zone has the feature
enabled, Cloudflare fetches the HTML from the origin and converts it to
markdown at the edge, responding with `Vary: accept`, an `x-markdown-tokens`
estimate, and a `Content-Signal: ai-train=yes, search=yes, ai-input=yes`
header. Key constraint: **the feature is only available on Pro, Business,
Enterprise, and SSL for SaaS plans** (beta, no extra cost). It converts the
rendered HTML generically; it does not know about, or prefer, origin-provided
markdown files.

## Change summary

- **Old behavior:** `curl -H "Accept: text/markdown" https://rhino-inquisitor.com/<post>/`
  returned the full HTML page (verified live 2026-07-08). The curated markdown
  companion at `/<post>/index.md` was reachable only by clients that read the
  `<link rel="alternate" type="text/markdown">` tag or `llms.txt`.
- **New behavior (once the Cloudflare rule below is enabled):** the same
  request is answered with a `302` to the page's `/index.md` companion, which
  GitHub Pages already serves as `text/markdown; charset=utf-8`. Requests
  without `text/markdown` in `Accept` are untouched.

## Why redirect to our own markdown instead of enabling the toggle

1. **Plan fit.** The zone fronts GitHub Pages; the native toggle requires a
   Pro+ plan, while Redirect Rules (10 dynamic rules) are available on the
   Free plan ([dynamic redirects blog](https://blog.cloudflare.com/dynamic-redirect-rules/),
   [Single Redirects docs](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/)).
2. **Quality.** Hugo already emits a curated markdown output for every post
   and standalone page (`page = ["html", "markdown"]` in `hugo.toml`, rendered
   by `src/layouts/_default/single.markdown.md`): YAML front matter with
   `canonical_url`, dates, categories/tags, key takeaways, and a cleaned body
   via `partials/llms/clean-body.html`. Edge auto-conversion of the rendered
   HTML would discard that curation and re-derive a noisier document.
3. **Transparency.** A `302` to the `.md` URL keeps one canonical HTML URL,
   gives agents a stable, cacheable markdown URL that is already advertised in
   `<head>` and `llms.txt`, and avoids serving two different bodies from a
   single URL through caches that may ignore `Vary: Accept`.

If the zone is ever upgraded to Pro+, the native toggle can be enabled *in
addition*: redirect rules execute before the edge conversion, so negotiated
requests for content pages still receive the curated `.md`, and the toggle
only adds coverage for URLs without a companion (home, lists, categories).

## Cloudflare configuration (dashboard, out of repo)

Create a **Single Redirect** (Rules → Redirect Rules → Create rule, type
*Dynamic*):

- **Rule name:** `Content negotiation: serve markdown companions`
- **Custom filter expression:**

  ```
  any(http.request.headers["accept"][*] contains "text/markdown")
  and ends_with(http.request.uri.path, "/")
  and not http.request.uri.path in {"/" "/posts/" "/pages/"}
  and not starts_with(http.request.uri.path, "/category/")
  ```

- **Type:** Dynamic
- **Expression (target URL):**

  ```
  concat("https://rhino-inquisitor.com", http.request.uri.path, "index.md")
  ```

- **Status code:** `302` (temporary — the HTML URL stays canonical; do not use
  `301`, which would let intermediaries permanently cache the negotiation
  decision)
- **Preserve query string:** off

Optional second rule — point agents asking for a markdown homepage at the
LLM index instead of 404ing:

```
Filter:  any(http.request.headers["accept"][*] contains "text/markdown")
         and http.request.uri.path eq "/"
Target:  concat("https://rhino-inquisitor.com", "/llms.txt")   (302)
```

### Why the exclusions

Only Hugo `page`-kind outputs have a markdown companion. Verified live
(2026-07-08): `/<post>/index.md` and `/<page>/index.md` return
`200 text/markdown`, while `/index.md`, `/posts/index.md`, `/pages/index.md`,
and `/category/*` companions return `404`. Excluding `/`, `/posts/`,
`/pages/`, and `/category/` prevents redirecting agents into 404s. Browsers
never send `text/markdown` in `Accept`, so human traffic is unaffected. An
agent that lists `text/markdown` with a low q-value alongside `text/html`
will still be redirected — an accepted simplification (Cloudflare's native
feature applies the same "present in Accept" semantics).

## Impact and verification

- **Impacted:** live request handling at the Cloudflare edge only. No build,
  template, or workflow changes; `.md` companions, `rel=alternate` links, and
  `llms.txt` already ship today.
- **Verify after enabling the rule:**

  ```bash
  # Negotiated request → 302 to the markdown companion
  curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" \
    -H "Accept: text/markdown" https://rhino-inquisitor.com/20-years-of-dreamforce/
  # → 302 https://rhino-inquisitor.com/20-years-of-dreamforce/index.md

  # Following redirects yields markdown
  curl -sL -H "Accept: text/markdown" \
    -o /dev/null -w "%{content_type}\n" \
    https://rhino-inquisitor.com/20-years-of-dreamforce/
  # → text/markdown; charset=utf-8

  # Normal traffic untouched
  curl -s -o /dev/null -w "%{http_code} %{content_type}\n" \
    https://rhino-inquisitor.com/20-years-of-dreamforce/
  # → 200 text/html; charset=utf-8

  # Excluded routes untouched
  curl -s -o /dev/null -w "%{http_code}\n" -H "Accept: text/markdown" \
    https://rhino-inquisitor.com/category/technical/
  # → 200 (HTML)
  ```

- **SEO:** no effect on search crawlers — Googlebot does not send
  `Accept: text/markdown`. `.md` companions remain out of the sitemap; the
  canonical HTML URL is declared in each companion's `canonical_url` front
  matter and in the HTML page's `rel=canonical`.
- **Caching:** redirect rules run before cache and origin fetch, so enabling
  HTML edge caching later (open infra item in
  `docs/seo/launch-audit-fixes.md`) cannot serve markdown to browsers or HTML
  to agents.

## Known coverage gaps

`/`, `/posts/`, `/pages/`, and `/category/*` have no markdown companion, so
negotiated requests there fall through to HTML (or `/llms.txt` for the
homepage if the optional rule is added). If list-page markdown becomes
worthwhile, add a `markdown` output format for `section`/`term` kinds in
`hugo.toml` with matching list templates — note that adding output routes
requires an RHI-025 URL parity re-run before merge.

## Related files

- `hugo.toml` — `[outputFormats.markdown]`, `page = ["html", "markdown"]`
- `src/layouts/_default/single.markdown.md` — curated markdown companion body
- `src/layouts/partials/seo/head-meta.html` — `rel=alternate type=text/markdown`
- `src/layouts/partials/llms/clean-body.html`, `src/layouts/home.llmsfull.txt` — LLM corpus outputs
- `docs/seo/audit-2026-07.md` — prior Cloudflare hand-off items (redirect + cache rules)
