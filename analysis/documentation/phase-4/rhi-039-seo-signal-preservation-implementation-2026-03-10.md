# RHI-039 SEO Signal Preservation Implementation

## Change summary

RHI-039 now adds three migration-facing validation commands for staged Phase 4 content: `npm run check:seo-completeness`, `npm run check:feed-compatibility`, and `npm run check:noindex`. The change also tightens staged front matter generation so generated pages carry `date` and generated posts always emit a `categories` field, allowing the new SEO completeness gate to validate the staged corpus against the Phase 4 SEO contract.

## Why this changed

Phase 4 had URL parity, internal-link, and rendered SEO smoke checks, but it did not yet have a migration-specific gate that validates the staged Markdown corpus before a batch is approved. That left a gap between front matter mapping and rendered-site validation where empty descriptions, missing dates, post category gaps, noindex leakage, and feed-regression issues could slip through undetected.

## Behavior details

Old behavior:

- No repository command validated the full staged migration corpus under `migration/output/content/` for SEO completeness.
- No repository command validated the built feed compatibility behavior expected by the Phase 2 route contract.
- The repository documentation referenced `npm run check:noindex`, but no dedicated command existed for validating production-style builds for unintended noindex leakage.
- Generated page front matter did not emit `date`, even though Phase 4 SEO review expects a publish timestamp on launch-intended migrated pages.
- Generated post front matter omitted `categories` entirely when the normalized record did not provide any categories, which made SEO gaps harder to distinguish from missing-field emission.

New behavior:

- `scripts/migration/check-seo-completeness.js` validates every staged Markdown file in `migration/output/content/`.
- The completeness validator blocks on empty `title`, empty `description`, malformed `url`, missing or invalid `date`, missing or invalid `lastmod`, post entries without categories, non-explicit `draft: false`, duplicate primary URLs, and any front matter `noindex` signal on launch-intended content.
- The completeness validator also performs sampled rendered-output checks against a built public directory to verify canonical tags, sitemap inclusion, merge-target canonical behavior, and internal-link resolution on representative routes.
- `scripts/migration/check-feed-compatibility.js` validates the canonical Hugo feed at `/index.xml`, the Pages-safe helper routes at `/feed/`, `/feed/rss/`, and `/feed/atom/`, and ensures `robots.txt` does not block those endpoints.
- `scripts/check-noindex.js` provides the dedicated production-build gate that fails when indexable HTML emits `noindex`, while allowing feed helpers, redirect helpers, and the 404 route.
- `scripts/migration/map-frontmatter.js` now emits `date` for generated pages and always emits `categories` for generated posts so the staged SEO contract is explicit in the generated Markdown.

## Impact

- Maintainers now have a repeatable Phase 4 gate that validates staged migration content before pilot and batch approval.
- Feed compatibility regressions and noindex leakage are now reported explicitly instead of being inferred indirectly from Phase 3 scaffold checks.
- Generated front matter is more SEO-auditable because publish dates and category-field presence are always explicit in staged Markdown.
- This change does not alter Hugo templates or the approved Phase 3 feed-helper implementation; it validates the existing contract rather than changing route behavior.

## Verification

- Run `npm run migrate:map-frontmatter` after the updated mapper is in place so staged Markdown reflects the explicit `date` and `categories` emission contract.
- Run `npm run migrate:rewrite-media` and `npm run migrate:rewrite-links` so the staged Markdown and rendered build reflect the normal post-mapping Phase 4 pipeline state.
- Build staged migration content with `hugo --minify --environment production --contentDir migration/output/content --destination tmp/rhi039-public`.
- Run `npm run check:seo-completeness -- --public-dir tmp/rhi039-public`.
- Run `npm run check:feed-compatibility -- --public-dir tmp/rhi039-public`.
- Run `CHECK_NOINDEX_PUBLIC_DIR=tmp/rhi039-public npm run check:noindex`.
- Review:
  - `migration/reports/seo-completeness-report.csv`
  - `migration/reports/feed-compatibility-report.csv`
  - any residual Phase 3 rendered SEO issues surfaced by `npm run check:seo` when run against a matching built output directory

## Related files

- `scripts/migration/check-seo-completeness.js`
- `scripts/migration/check-feed-compatibility.js`
- `scripts/check-noindex.js`
- `scripts/migration/map-frontmatter.js`
- `package.json`
- `docs/migration/RUNBOOK.md`
- `analysis/tickets/phase-4/RHI-039-seo-signal-preservation.md`