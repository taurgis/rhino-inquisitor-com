# Post-launch audit fixes — sitemaps, structured data, search

**Date:** 2026-07-02
**Trigger:** Full post-launch audit of the live apex site (performance, SEO, content, responsive/functionality).

## Change summary

A cross-cutting audit surfaced a small set of real defects (most audit "findings" were
false positives — see below). This note records the behavioural changes made to the
sitemap generation, structured data, `robots.txt`, archive search, and one content fix.

## What changed (old → new)

### 1. Paginated URLs removed from sitemaps
- **Old:** `post-sitemap.xml` and `page-sitemap.xml` included `…/page/N/` listing shards
  (via `partials/sitemap/pagination-entries.xml`). `post-sitemap.xml` carried 164 URLs.
- **New:** Pagination shards are excluded; only canonical content URLs are submitted.
  `post-sitemap.xml` now carries 150 URLs. The `pagination-entries.xml` partial was
  deleted (no remaining references).
- **Why:** Paginated listing pages are not canonical index targets and should not be
  submitted for indexing; they remain crawlable via on-page links.

### 2. Per-sub-sitemap `lastmod`
- **Old:** `partials/sitemap/index.xml` stamped every sub-sitemap with the global
  `site.Lastmod`, so all five shared one frozen date.
- **New:** Each sub-sitemap advertises the newest `Lastmod` of the content it actually
  contains (posts / pages+home / categories←posts / videos / all pages for images),
  falling back to `site.Lastmod` only when a set is empty.
- **Why:** Independent, accurate freshness signals per sitemap. (The prior single date
  was genuine `site.Lastmod`, not a hardcode — but it masked per-set freshness.)

### 3. Video sitemap titles reflect the page, not the embedded clip
- **Old:** `home.videositemap.xml` used the `video.title`/`video.description` front-matter
  overrides, which on a few posts were literal YouTube music-video titles (background
  filler embeds), creating a topical mismatch.
- **New:** `video:title`/`video:description` derive from the page's own title and resolved
  SEO description.

### 4. Organization structured data
- **Old:** Home emitted only `WebSite` JSON-LD; posts' `BlogPosting.publisher` was a bare
  `Organization` with no logo.
- **New:** Home emits an `@graph` with a first-class `Organization` node (`@id`, `logo`
  → `/images/brand-mark.svg`, `sameAs` → the site's public GitHub/LinkedIn profiles) and a
  `WebSite` node whose `publisher` references it. `BlogPosting.publisher` now includes
  `url` and an `ImageObject` `logo`, per Google's Article rich-result guidance.

### 5. `robots.txt` sitemap directive deduplicated
- **Old:** Two `Sitemap:` lines (`sitemap.xml` and `sitemap_index.xml`).
- **New:** One canonical `Sitemap: …/sitemap.xml` line.
- **Note:** `sitemap_index.xml` is still generated (byte-identical index) because it is a
  **blocking `keep` URL in `url-data/url-manifest.json`** — a preserved legacy URL. It was
  NOT removed; only the redundant robots advertisement was dropped.

### 6. Archive search filters as you type
- **Old:** `archive-search.js` only ran a search on submit/Enter; the field looked live
  but was not.
- **New:** A debounced (250 ms) `input` listener runs the search live using
  `history.replaceState` (no history spam, no scroll on keystroke). Submit/Enter still
  `pushState`s and scrolls, unchanged.

### 7. Content fix
- `how-to-use-ocapi-scapi-hooks` — repaired a broken sentence fragment in the
  "Strategic Caching" section (grammar only).

### 8. Documentation drift
- `hugo-coding-standards` (source instruction + generated mirror) said `baseURL` was `www`;
  corrected to state the apex is canonical and `www` 301-redirects to it, matching live.

## Impact & verification

- **Impacted:** sitemap output, home/article JSON-LD, `robots.txt`, archive/topic search UX.
- **Verified:**
  - `hugo --minify --environment production` — 0 errors.
  - `npm run check:url-parity` — 1224/1224 pass, **0 blocking failures**.
  - `post-sitemap.xml` = 150 `<loc>`, 0 `page/N` URLs; index `lastmod`s now differ per set.
  - Home JSON-LD parses; `@graph` = `Organization, WebSite`. Post JSON-LD = `BlogPosting`
    (publisher w/ logo) + `BreadcrumbList`. Category = `BreadcrumbList`.
  - `robots.txt` has exactly one `Sitemap:` line.
  - `node --check archive-search.js` passes.

## Related files

- `src/layouts/home.postsitemap.xml`, `src/layouts/home.pagesitemap.xml`
- `src/layouts/partials/sitemap/index.xml` (deleted `partials/sitemap/pagination-entries.xml`)
- `src/layouts/home.videositemap.xml`
- `src/layouts/partials/seo/json-ld-site.html`, `src/layouts/partials/seo/json-ld-article.html`
- `src/layouts/robots.txt`
- `src/static/scripts/archive-search.js`
- `src/content/posts/how-to-use-ocapi-scapi-hooks/index.md`
- `.github/instructions/hugo-coding-standards.instructions.md` + generated mirror

## Not changed (audit false positives / out of repo scope)

- **`font-display`** — `fragments/fonts.css` correctly uses `font-display: optional` on every
  face. The `--font-display` token is a CSS custom property (a font-family), not the descriptor.
- **BreadcrumbList on category pages** — already emitted (verified live).
- **Hero image alt "empty"** — hero `alt` is the post title (verified live), not empty.
- **`realm-split-checklist__scroll: overflow: visible`** — correct inside the mobile
  (`max-width: 47.99rem`) stacked-card layout where the table is de-tabled.
- **HTML edge cache TTL** (Cloudflare `max-age=600`, CF not caching HTML) — infra/Cloudflare
  dashboard change, not a repo change.
- **Core Web Vitals field numbers** — PSI API was quota-blocked during the audit; re-run with
  a key to confirm CLS/LCP in the field.
- **AI-writing voice drift on 2025–26 long posts** — editorial judgement; needs a targeted
  `human-prose-editing`/`anti-ai-writing` pass with audience direction, not a mechanical fix.
