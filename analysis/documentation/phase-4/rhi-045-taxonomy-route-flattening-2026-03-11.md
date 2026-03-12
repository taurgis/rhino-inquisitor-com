# RHI-045 Taxonomy Route Flattening and Category Term Emission

## Change summary

Started the RHI-045 long-tail and taxonomy batch by locking the Batch 3 taxonomy route policy, emitting durable category term bundles from the migration pipeline, and promoting the validated full-corpus Markdown output into `src/content/`.

## Why this changed

The full-corpus Batch 3 inventory exposed nine remaining nested category `keep` routes that conflicted with the repository's current Hugo taxonomy contract at `/category/:slug/`. At the same time, the front matter mapper still skipped `postType=category`, which meant the migration pipeline had no durable way to author category term metadata even after the route policy was clarified.

## Behavior details

Old behavior:

- Nine nested category routes still expected direct `keep` behavior even though the current Hugo config is flat.
- The manifest named flattened merge targets such as `/category/architecture/`, but those canonical category targets were not first-class `keep` rows.
- `scripts/migration/map-frontmatter.js` skipped category records entirely, so Batch 3 could not emit `categories/**/_index.md` term metadata files.
- `scripts/migration/check-seo-completeness.js` treated category `_index.md` files like regular pages and incorrectly required `url`, `date`, and `lastmod` front matter.
- Promoting the full staged corpus into `src/content/` collided with the older scaffold placeholder at `src/content/pages/privacy-policy/index.md`.

New behavior:

- User-owner approved keeping the current flat Hugo taxonomy contract for Batch 3.
- Nine nested category legacy URLs now use merge-based flattening:
  - `/category/external/forward/` -> `/category/external/`
  - `/category/external/linkedin/` -> `/category/linkedin/`
  - `/category/external/salesforce-architects-blog/` -> `/category/salesforce-architects-blog/`
  - `/category/external/salesforce-ben/` -> `/category/salesforce-ben/`
  - `/category/salesforce-commerce-cloud/ai/` -> `/category/ai/`
  - `/category/salesforce-commerce-cloud/erd/` -> `/category/erd/`
  - `/category/salesforce-commerce-cloud/technical/` -> `/category/technical/`
  - `/category/video/podcasts/` -> `/category/podcasts/`
  - `/category/video/sessions/` -> `/category/sessions/`
- The manifest now includes explicit `keep` rows for the canonical flat category targets required by the current route contract, including the previously approved RHI-044 targets (`/category/architecture/`, `/category/go-live/`, `/category/release-notes/`).
- `scripts/migration/map-frontmatter.js` now emits one durable category term bundle per canonical target URL under `migration/output/content/categories/**/_index.md` and deduplicates merge-to-parent collisions by preferring the matching `keep` record when one exists.
- Category term descriptions now use the WordPress category description when available and otherwise expand to a deterministic archive-description fallback that stays inside the SEO completeness target range.
- `scripts/migration/check-seo-completeness.js` now recognizes category `_index.md` files as taxonomy metadata surfaces and skips regular-page-only `url`, `date`, and `lastmod` requirements while keeping title/description/noindex validation and rendered canonical/sitemap checks.
- The validated full-corpus output was synced from `migration/output/content/` into `src/content/`, and the obsolete scaffold file `src/content/pages/privacy-policy/index.md` was removed so the migrated privacy policy now owns `/privacy-policy/` without a route collision.

## Impact

- Batch 3 now has a durable repo-level route policy for the remaining nested category paths instead of relying on implicit Hugo behavior.
- The migration pipeline can now generate category term metadata through reruns rather than requiring hand-authored `src/content/categories/**/_index.md` files.
- Full-corpus local batch evidence is available for RHI-045:
  - 331 migration item rows
  - 186 `ready`
  - 145 `review-required`
  - 0 `blocked`
  - 0 conversion fallback rows
  - 0 quarantine rows
  - zero-change correction rerun confirmed after convergence
- Remaining warning-level carryover items are still visible for owner review:
  - 89 SEO completeness warnings
  - 1 accessibility-content weak-link warning
   - 7 warning-level URL parity failures with 0 critical failures
  - 2 Hugo `warning-goldmark-raw-html` render warnings

## Closeout status

- Video route handling is confirmed in the promoted repository state:
   - `/video/` is backed by `src/content/pages/video.md`
   - `/category/video/`, `/category/podcasts/`, and `/category/sessions/` render as generated taxonomy routes
   - `/category/video/podcasts/` and `/category/video/sessions/` are handled as merge-based deferred-edge redirects
- Archive handling is mostly confirmed:
   - `/archive/` is backed by `src/content/pages/archive.md`
   - `/archive/2/` through `/archive/8/` are explicitly retired and pass parity as true not found
   - Official Hugo documentation confirms date-grouped archives are a custom template choice, not an automatic built-in page kind
- One manifest-policy mismatch remains before honest PR-readiness:
- The former manual seed mismatch at `/archives/` and `/blog/` has been resolved:
   - user-owner approved retiring both routes
   - both routes now pass URL parity as `retire -> true-not-found`
   - the full-manifest parity report now shows 7 warning-level failures with 0 critical failures
- The closeout work is now isolated on branch `copilot/rhi-045-batch-3-closeout` so the remaining decision can be resolved without reworking the validated Batch 3 corpus.

## Verification

1. Refreshed the full-corpus migration inputs:
   - `npm run migrate:extract`
   - `npm run migrate:normalize`
2. Rebuilt the full staged corpus after the route and mapper changes:
   - `npm run migrate:convert`
   - `npm run migrate:map-frontmatter`
   - `npm run migrate:finalize-content`
3. Validated the staged corpus:
   - `npm run validate:frontmatter -- --content-dir migration/output/content`
   - `hugo --minify --environment production --contentDir migration/output/content --destination tmp/rhi045-public`
   - `npm run check:url-parity -- --content-dir migration/output/content --public-dir tmp/rhi045-public`
   - `npm run check:seo-completeness -- --content-dir migration/output/content --public-dir tmp/rhi045-public`
   - `npm run check:feed-compatibility -- --public-dir tmp/rhi045-public`
   - `npm run check:media -- --content-dir migration/output/content --public-dir tmp/rhi045-public`
   - `CHECK_LINKS_PUBLIC_DIR=tmp/rhi045-public CHECK_LINKS_ALLOW_MANIFEST_TARGETS=1 npm run check:links`
   - `npm run check:a11y-content -- --content-dir migration/output/content`
   - `node scripts/migration/check-security-content.js --content-dir migration/output/content --records-dir migration/output --public-dir tmp/rhi045-public`
   - `CHECK_NOINDEX_PUBLIC_DIR=tmp/rhi045-public npm run check:noindex`
   - `npm run migrate:report`
   - `npm run check:migration-thresholds`
4. Confirmed correction-pass convergence:
   - reran `npm run migrate:apply-corrections` until `migration/reports/content-corrections-summary.json` reported `filesChanged: 0`
5. Promoted the validated corpus and rechecked the repository build:
   - `rsync -a migration/output/content/ src/content/`
   - `npm run validate:frontmatter`
   - `npm run build:prod`
   - `npm run check:url-parity`
   - `CHECK_LINKS_ALLOW_MANIFEST_TARGETS=1 npm run check:links`
   - `npm run check:noindex`

## Related files

- `migration/url-manifest.json`
- `scripts/migration/map-frontmatter.js`
- `scripts/migration/check-seo-completeness.js`
- `src/content/`
- `analysis/tickets/phase-4/RHI-045-long-tail-taxonomy-batch.md`
- `docs/migration/RUNBOOK.md`