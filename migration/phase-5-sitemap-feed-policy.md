# Phase 5 Sitemap and Feed Policy

Date: 2026-03-13
Owner: SEO Owner
Related ticket: `analysis/tickets/phase-5/RHI-051-sitemap-feed-discovery-continuity.md`

## Sitemap generation strategy

- The repository uses the custom sitemap template at `src/layouts/sitemap.xml` instead of relying on Hugo's embedded sitemap template unchanged.
- The current site is monolingual, so the production artifact publishes a single root sitemap at `public/sitemap.xml`.
- Sitemap validation is artifact-driven, not template-assumed: `npm run check:sitemap` validates the built `public/` output and compares sitemap URLs to the canonical inventory emitted by `npm run check:metadata`.

## Sitemap inclusion and exclusion rules

- Include only canonical, indexable HTML routes from the production build.
- Exclude drafts, `seo.noindex` surfaces, the 404 page, feed helper routes, redirect-helper alias pages, and manifest legacy routes marked `merge` or `retire`.
- Every sitemap URL must be absolute HTTPS on `https://www.rhino-inquisitor.com`.
- Every sitemap URL must emit a parseable ISO 8601 `lastmod` value.
- Sitemap route count tolerance is fixed at `0` for the production build: the sitemap URL set must match the indexable metadata inventory exactly.

## Sitemap split strategy

- Keep a single root sitemap while the production artifact remains safely below sitemap protocol limits.
- If the generated sitemap approaches `50,000` URLs or `50 MB` uncompressed, switch to a sitemap index plus per-slice sitemap files before cutover.
- Any future split sitemap files must remain on the canonical host and stay addressable from the root sitemap index.

## Feed URL strategy

- Hugo's canonical RSS output remains `https://www.rhino-inquisitor.com/index.xml`.
- The legacy WordPress feed route `https://www.rhino-inquisitor.com/feed/` is the required must-resolve compatibility endpoint and currently resolves in one hop to `/index.xml` through a static Pages-compatible HTML helper.
- The legacy helper variants `/feed/rss/` and `/feed/atom/` remain compatibility routes to the same canonical feed target until edge redirects replace them.
- Feed XML must remain parseable, use absolute canonical-host links, and include valid publication dates for each item or entry.

## Archive and category surface policy

- `/archive/` remains a preserved discovery surface and must exist in the production build.
- `/video/` remains a preserved discovery surface and must exist in the production build.
- Category routes marked `keep` with `has_organic_traffic: true` in `migration/url-manifest.json` must remain present, indexable, and non-empty.
- When a preserved category route has no direct migrated posts yet, the term template falls back to recent posts so the route remains useful and crawlable instead of rendering an orphan empty state.
- Generated category pagination routes must remain crawlable and must not be blocked by the production `robots.txt` policy.

## Verification

- `npm run build:prod`
- `npm run check:metadata`
- `npm run check:sitemap`
- `npm run check:crawl-controls`
- `npm run check:seo:artifact`
- `npm run check:links`

## Related files

- `src/layouts/sitemap.xml`
- `src/layouts/_default/taxonomy.html`
- `src/static/feed/index.html`
- `src/static/feed/rss/index.html`
- `src/static/feed/atom/index.html`
- `scripts/seo/check-sitemap.js`
- `scripts/seo/check-metadata.js`
- `.github/workflows/build-pr.yml`
- `.github/workflows/deploy-pages.yml`
