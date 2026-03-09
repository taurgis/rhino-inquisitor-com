---
name: hugo-development
description: 'Hugo SSG configuration, templates, partials, front matter, URL/route management, and GitHub Pages deployment for the rhino-inquisitor.com WordPress-to-Hugo migration. Use when writing hugo.toml, src/layouts, src/partials, src/archetypes, or GitHub Pages deployment workflows, and when debugging Hugo build, routing, or output behaviour.'
license: Forward Proprietary
compatibility: 'Hugo extended v0.120+, GitHub Actions, GitHub Pages'
---

# Hugo Development

Practical guidance for Hugo SSG configuration, template authoring, URL strategy, and GitHub Pages deployment in the context of the rhino-inquisitor.com WordPress-to-Hugo migration.

## When to Use This Skill

- Writing or editing `hugo.toml` configuration
- Authoring or reviewing layouts, partials, archetypes, or shortcodes
- Defining permalink rules, taxonomies, and URL output strategies
- Setting `url` and `aliases` front matter for migrated content
- Building or reviewing the GitHub Pages deployment workflow
- Debugging Hugo build errors, canonical drift, or sitemap anomalies
- **Not for:** general JavaScript scripting (use `javascript-development`) or SEO strategy decisions (use `seo-migration`)

## Non-Negotiable Project Rules

| Rule | Reason |
|------|--------|
| `baseURL = "https://www.rhino-inquisitor.com/"` (trailing slash required) | Prevents URL drift across templates and sitemap |
| Every migrated page must set explicit `url` front matter | Preserves WordPress path exactly |
| `aliases` must map only to known legacy URLs from `migration/url-manifest.json` | Prevents orphan redirect pages |
| Production builds must never use `--buildDrafts`, `--buildFuture`, or `--buildExpired` | Avoids leaking draft content |
| Hugo `aliases` emit HTML meta-refresh pages, not HTTP 301/308 | Treat them as fallback; prefer URL preservation |
| `robots.txt` is crawl control only — use `noindex` in `<meta>` for de-index intent | Core Pages constraint |
| Canonical tags do **not** replace missing redirects | Signal alignment requires both |

## Quick Start

1. Pin Hugo extended version in CI (`HUGO_VERSION` env var).
2. Use `hugo.toml` (not `config.yaml`) for the primary config file.
3. Use the repository contract: root `hugo.toml` with Hugo source components under `src/`, including `src/content/posts/`, `src/content/pages/`, and `src/content/categories/`.
4. Run `hugo --minify --environment production` in CI.
5. Upload `public/` as the Pages artifact using `actions/upload-pages-artifact`.

## Core Configuration (`hugo.toml`)

```toml
baseURL = "https://www.rhino-inquisitor.com/"
languageCode = "en-us"
title = "Rhino Inquisitor"
contentDir = "src/content"
layoutDir = "src/layouts"
staticDir = ["src/static"]
assetDir = "src/assets"
dataDir = "src/data"
archetypeDir = "src/archetypes"
publishDir = "public"

[build]
  # Never enable in production CI
  # buildDrafts = false
  # buildFuture = false
  # buildExpired = false

[outputs]
  home    = ["HTML", "RSS", "Sitemap"]
  section = ["HTML", "RSS"]
  page    = ["HTML"]

[taxonomies]
  category = "categories"
  tag      = "tags"

[permalinks]
  posts = "/:slug/"
  pages = "/:slug/"

[sitemap]
  changefreq = "weekly"
  priority   = 0.5
```

**Danger zones:**
- Changing `permalinks` after content is live = URL regression. Run URL parity check immediately.
- `[taxonomies]` keys must match front matter field names exactly.
- `outputs` changes can silently drop `sitemap.xml` or `robots.txt` — verify after every change.

## Front Matter Contract (Migrated Content)

```yaml
---
title: "Article Title"
description: "Unique meta description, 120–155 characters."
date: 2024-01-15T09:00:00Z
lastmod: 2024-06-01T12:00:00Z
categories: ["sfcc"]
tags: ["b2c-commerce", "cartridges"]
heroImage: "/images/posts/article-slug/hero.webp"
url: "/some-article/"          # REQUIRED on all migrated content
aliases: ["/old-url/"]         # Only for known legacy paths in url-manifest.json
draft: false
# Optional SEO overrides
# canonical: "https://www.rhino-inquisitor.com/some-article/"  # absolute HTTPS only
# seo:
#   noindex: false
#   ogImage: "/images/posts/article-slug/og.webp"
---
```

**Rules:**
1. `url` is mandatory for every migrated page — Hugo does not sanitize it; validate for URL safety.
2. `canonical` override must be absolute HTTPS. Never set it to a different host.
3. `draft: true` pages must be excluded from sitemap — verify `sitemap` output config.
4. `aliases` values must originate from the approved legacy URL manifest.

## Template Hierarchy

```
src/layouts/
├── _default/
│   ├── baseof.html        # Master shell: head, body, footer blocks
│   ├── single.html        # Article/page detail
│   ├── list.html          # Section and taxonomy list
│   └── terms.html         # Taxonomy term index
├── index.html             # Homepage
├── 404.html               # Custom 404
└── partials/
    ├── seo/
    │   ├── head-meta.html      # title, description, canonical
    │   ├── open-graph.html     # og:* tags
    │   ├── twitter-card.html   # twitter:* tags
    │   ├── json-ld-article.html    # BlogPosting schema
    │   ├── json-ld-website.html    # WebSite schema
    │   └── json-ld-breadcrumb.html # BreadcrumbList schema
    ├── head.html          # Assembles all seo/* partials + CSS links
    ├── header.html
    ├── footer.html
    ├── pagination.html
    └── breadcrumbs.html
```

**Pattern rules:**
- All SEO meta generation lives in `partials/seo/` — never duplicate in individual templates.
- `baseof.html` defines blocks; single/list extend it — no standalone HTML boilerplate in leaf templates.
- Use `.Scratch` or `partial` caching (`partialCached`) for expensive repeated calls.

## URL and Redirect Patterns

```go-html-template
{{/* Canonical URL — prefer .Permalink, allow front matter override */}}
{{ $canonical := .Permalink }}
{{ with .Params.canonical }}{{ $canonical = . }}{{ end }}
<link rel="canonical" href="{{ $canonical }}">

{{/* Hugo aliases (meta-refresh redirect pages) — used for legacy paths only */}}
# In front matter:
aliases: ["/old-wordpress-slug/", "/category/old/post-name/"]
```

**Alias behaviour:**
- Hugo generates a `index.html` at every alias path containing `<meta http-equiv="refresh" content="0; url=CANONICAL">`.
- This is a client-side redirect, not an HTTP 301. Google can follow it but server-side is faster/stronger.
- Alias pages are excluded from sitemap by default — verify this holds after config changes.

## GitHub Pages Deployment Workflow Skeleton

```yaml
# .github/workflows/deploy-pages.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false   # Never cancel a deploy in progress

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      HUGO_VERSION: "0.128.0"  # Pin — never use latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - name: Install Hugo
        run: |
          curl -fsSL "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz" | tar -xz
          sudo mv hugo /usr/local/bin/
      - uses: actions/configure-pages@v5
      - run: hugo --minify --environment production
      - uses: actions/upload-pages-artifact@v3
        with: { path: ./public }

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

**Constraints:**
- `concurrency.cancel-in-progress: false` — never cancel a live Pages deploy.
- Artifact must be named `github-pages` (default from `upload-pages-artifact`).
- No symbolic links in `public/` — GitHub Pages rejects them.
- Custom domain is configured in repository Settings → Pages, not solely via a `CNAME` file.

## Common Build Errors and Fixes

| Error | Likely Cause | Fix |
|-------|-------------|-----|
| `duplicate output files` | Two pages produce same path | Check `url` collision in front matter |
| `template ... not found` | Wrong lookup path | Check `src/layouts/` hierarchy and content type |
| Sitemap missing pages | `draft: true` or wrong output config | Verify `outputs.page` includes Sitemap |
| Canonical shows `localhost` | `baseURL` not set for production | Pass `--baseURL` flag or use env config |
| Alias pages appear in sitemap | Hugo bug or custom template | Explicitly exclude alias template from sitemap output |
| RSS at wrong path | Default is `/index.xml`, WP expects `/feed/` | Add explicit alias `/feed/ → /index.xml` |

## Assets

- [hugo.toml template](assets/hugo-toml-template.toml) — Base config with all required settings

## References

- [URL and route strategy](references/URL-STRATEGY.md) — Permalink rules, alias patterns, URL parity
- [Template patterns](references/TEMPLATE-PATTERNS.md) — Partial architecture, SEO partials, schema
- [Hugo content management](https://gohugo.io/content-management/front-matter/)
- [Hugo URL management](https://gohugo.io/content-management/urls/)
- [Hugo templates](https://gohugo.io/templates/introduction/)
- [Hugo sitemap](https://gohugo.io/templates/sitemap/)
- [GitHub Pages Hugo guide](https://gohugo.io/hosting-and-deployment/hosting-on-github/)
- [actions/deploy-pages](https://github.com/actions/deploy-pages)
