# Hugo URL Strategy Reference

## Project URL Policy (Normative)

| Rule | Value | Source |
|------|-------|--------|
| Canonical host | `https://www.rhino-inquisitor.com/` | policy |
| Trailing slash | Preserve existing behaviour per-route | contract |
| Case | Lowercase only | contract |
| Query parameters | Tracking params stripped; filter params documented | contract |

## Permalink Configuration

```toml
# hugo.toml
[permalinks]
  # Posts: preserve the slug exactly via front matter `url`
  # Set these as fallbacks; explicit `url` in front matter takes precedence
  posts = "/:slug/"
  pages  = "/:slug/"
```

When a page has explicit `url` front matter, Hugo uses that value directly — permalink pattern is ignored.
Always prefer explicit `url` over relying on permalink patterns for content.

## URL Front Matter Safety Rules

Hugo does not sanitize `url` values. Before merging any front matter with `url`:

1. Must start with `/`
2. Must end with `/` (trailing slash policy)
3. Must be lowercase
4. Must not contain `..` or URL-unsafe characters outside the path
5. Must not duplicate any other page's `url` value (run collision check)
6. Must match the approved `url-data/url-manifest.json` entry for that content item

Validation script entry point: `scripts/validate-frontmatter.js`

## Hugo Aliases Behaviour

Hugo `aliases` generate a static HTML page at each listed path containing:

```html
<meta http-equiv="refresh" content="0; url={{ canonical URL }}">
<link rel="canonical" href="{{ canonical URL }}">
```

**This is a client-side redirect, not a server-side HTTP 301.**

Implications:

- Google can follow meta-refresh redirects, but server-side 301/308 passes link equity faster.
- Preserve the original URL wherever possible instead of relying on an alias.
- Use aliases only for paths that genuinely changed or were retired.
- If changed indexed URLs exceed 5% of inventory, activate edge redirect layer (decision).

## Alias Exclusion from Sitemap

Hugo excludes alias-generated pages from `sitemap.xml` by default.
Verify this behaviour after any template or output config change:

```bash
grep -r "aliases" public/sitemap.xml  # should return nothing
```

## URL Parity Workflow

1. produces `url-data/url-manifest.json`.
2. builds `scripts/url-parity-check.js`:
   - Reads manifest entries with `disposition: keep`.
   - For each, checks that `public/{path}/index.html` exists OR an alias redirect is present.
   - Fails CI if any `keep` URL has no output.
3. CI gate: `npm run check:url-parity` — blocking on any failure.

## Feed Compatibility

Hugo default RSS path: `/index.xml`
Canonical feed path: `/feed/`

Required alias mapping in site config or homepage front matter:

```yaml
# content/_index.md
aliases: ["/feed/"]   # Points /feed/ → homepage RSS
```

Or map via Hugo output format configuration to produce output at `/feed/index.xml`.
Document the chosen approach in `url-data/feed-compatibility-check.md` (deliverable).

## Redirect Chain Prevention

Rules enforced by the URL parity checker:

1. An alias path must never also be a `url` of another live page.
2. An alias must not point to another alias (no chains).
3. Every `target_url` in `url-manifest.json` must exist in `public/` output.

## Official References

- <https://gohugo.io/content-management/urls/>
- <https://gohugo.io/content-management/front-matter/>
- <https://gohugo.io/configuration/permalinks/>
- <https://developers.google.com/search/docs/crawling-indexing/301-redirects>
- <https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls>
