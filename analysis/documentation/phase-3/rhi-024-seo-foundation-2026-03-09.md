# RHI-024 SEO Foundation Implementation - 2026-03-09

## Change summary

Implemented the Phase 3 SEO foundation layer on top of the RHI-023 template scaffold by adding environment-aware robots behavior, deterministic fallback social metadata, sitemap indexability controls, feed compatibility helpers, and a build-artifact smoke check.

## Why this changed

RHI-023 provided the shared SEO partial architecture, but Phase 3 still needed proof that built output matches the approved SEO/discoverability contract before Phase 4 content import begins. Without a build-level gate, canonical drift, missing metadata, broken feed continuity, or staging index leaks would remain latent until later launch-readiness phases.

## Behavior details

Old behavior:

- Shared SEO partials existed, but non-production builds did not automatically emit `noindex`.
- `og:image` and `twitter:image` were omitted when a page lacked `heroImage` or `seo.ogImage`.
- Sitemap generation relied on Hugo defaults with no repo-owned exclusion rule for `seo.noindex` pages.
- `/feed/`, `/feed/rss/`, and `/feed/atom/` compatibility artifacts were not implemented.
- No repo script validated built HTML, `robots.txt`, and `sitemap.xml` against the Phase 2 SEO contract.

New behavior:

- Non-production Hugo builds now emit `<meta name="robots" content="noindex, nofollow">` through the shared SEO resolver.
- Every indexable page now emits fallback social-image tags from a repo-owned default asset when page-level images are absent.
- Sitemap output is controlled by a repo-owned template that excludes pages marked `seo.noindex`.
- Pages-safe feed compatibility helpers now resolve `/feed/`, `/feed/rss/`, and `/feed/atom/` to the canonical Hugo RSS endpoint without requiring a config overlay.
- `npm run check:seo` validates built HTML metadata, JSON-LD parsing, sitemap host parity, and `robots.txt` safety on the generated `public/` artifact.

## Impact

- Maintainers can validate SEO-critical output locally before Phase 4 migration volume lands.
- The repo keeps the root-config Hugo contract from Phase 2 while still protecting staging and preview builds from indexing.
- Feed continuity and sitemap/robots expectations are now represented in repo code instead of ticket prose only.
- RHI-029 gains a concrete SEO gate command to integrate into CI later in Phase 3.

## Verification

- Run `hugo --minify --environment production` and confirm `public/robots.txt`, `public/sitemap.xml`, `public/index.xml`, and representative HTML pages render.
- Run `hugo --environment staging` and confirm representative HTML contains `noindex, nofollow` while the production build does not.
- Run `npm run check:seo` and confirm it passes on the generated `public/` output.
- Spot-check `/feed/`, `/feed/rss/`, and `/feed/atom/` helper outputs in `public/feed/`.
- Rich Results Test result for the representative article fixture: `https://search.google.com/test/rich-results/result?id=NA7Sva7WYtceAcPUDpx5ZA`.
- Temporary content fixtures were used to verify article, page, category term, alias, draft, and noindex behavior, then removed before the final clean scaffold build.

## Related files

- hugo.toml
- src/layouts/partials/seo/resolve.html
- src/layouts/partials/seo/head-meta.html
- src/layouts/partials/seo/open-graph.html
- src/layouts/partials/seo/json-ld-article.html
- src/layouts/sitemap.xml
- src/static/images/social-default.svg
- src/static/feed/index.html
- src/static/feed/rss/index.html
- src/static/feed/atom/index.html
- scripts/check-seo.js
- package.json
- README.md
- docs/migration/RUNBOOK.md
- analysis/tickets/phase-3/RHI-024-seo-foundation.md