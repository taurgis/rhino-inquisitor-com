# Homepage Markdown alternate

## Change summary

Every post and reference page already publishes a Markdown companion
(`.../slug/index.md`) served via `[outputs] page = ["html", "markdown"]` in
`hugo.toml`, and a Cloudflare edge rule content-negotiates `Accept:
text/markdown` requests to the `index.md` alternate. The homepage (`/`) was
explicitly excluded from that rule because Hugo did not emit a Markdown
output for the home page and no template existed to render one. The
homepage now publishes the same alternate, at `/index.md`.

## Old vs new behavior

| Aspect | Old | New |
|--------|-----|-----|
| `hugo.toml` `[outputs].home` | `["html", "rss", "json", "llms", "llmsfull", "sitemap", ...]` (no `markdown`) | Adds `"markdown"` — Hugo now emits `public/index.md` alongside `public/index.html` |
| Homepage Markdown template | None | `src/layouts/home.markdown.md` — front matter (`title`, `canonical_url`, `markdown_url`, `content_type: website`, `site_name`, `description`) plus a body summarizing the hero intro, featured article, recent articles, and key links, mirroring `src/layouts/_default/single.markdown.md`'s shape |
| `<head>` alternate link | `partials/seo/head-meta.html` only emitted `<link rel="alternate" type="text/markdown" ...>` `{{ if and .IsPage (not noindex) }}` — home is `.IsHome`, not `.IsPage`, so it was never advertised | Condition widened to `{{ if and (or .IsPage .IsHome) (not noindex) }}`; the link's title falls back to `.Site.Title` since the home page's own `.Title` is normally empty |
| `scripts/seo/generate-llm-artifacts.js` body extraction | `extractBodyHtml` only recognized `section.article-body` (posts/pages) and `.archive-layout` (archive/section pages); the homepage's `article.home-redesign` markup matched neither, so post-processing would have replaced the generated `index.md` body with an empty string | Added `extractHomeBodyHtml`, checked before the archive fallback: pulls the hero intro (`.home-redesign__intro`), the featured card link + excerpt (`.home-featured-card`), the recent-articles list (`.home-recent-card`), and the blog/about links (`.home-redesign__blog-cta`, `.home-redesign__button--secondary`) into semantic HTML that Turndown then converts to Markdown |
| Cloudflare edge rule | Excluded `/` from the Markdown-negotiation match, so `Accept: text/markdown` on `/` always served the HTML homepage | `/` removed from the exclusion set — see the updated rule below |

## Impact and verification

- Impacted files: `hugo.toml`, `src/layouts/home.markdown.md` (new),
  `src/layouts/partials/seo/head-meta.html`,
  `scripts/seo/generate-llm-artifacts.js`.
- `scripts/seo/check-llm-artifacts.js` already asserts every `**/index.md`
  under `public/` has `canonical_url`, `markdown_url`, and a non-empty body —
  this now also covers `public/index.md`, so a regression that breaks the
  homepage extraction fails the existing `check:llm-artifacts` gate rather
  than shipping silently.
- Verify locally: `npm run build:prod` (or `build:local`), then confirm
  `public/index.md` exists, has front matter (`title`, `canonical_url`,
  `markdown_url`, `content_type: website`), and a non-empty body with a
  `## Featured` and/or `## Recent Articles` section; `npm run
  check:llm-artifacts` should pass with the homepage counted in
  `markdownCompanionCount`.
- Verify the edge behavior after deploying the Cloudflare rule change below:
  `curl -H "Accept: text/markdown" https://rhino-inquisitor.com/` returns the
  Markdown companion instead of the HTML homepage.
- Related files: `hugo.toml`, `src/layouts/home.markdown.md`,
  `src/layouts/partials/seo/head-meta.html`,
  `scripts/seo/generate-llm-artifacts.js`,
  `src/layouts/_default/single.markdown.md` (the existing pattern this
  mirrors).

## Updated Cloudflare rule

Match expression — `/` removed from the exclusion set (`/posts/` and
`/pages/` list pages, and `/category/*`, stay excluded since they have no
Markdown output):

```text
any(http.request.headers["accept"][*] contains "text/markdown") and ends_with(http.request.uri.path, "/") and not http.request.uri.path in {"/posts/" "/pages/"} and not starts_with(http.request.uri.path, "/category/")
```

URL rewrite (unchanged — `concat("/", "index.md")` naturally resolves to
`/index.md` for the homepage, matching Hugo's output path):

```text
concat("https://rhino-inquisitor.com", http.request.uri.path, "index.md")
```
