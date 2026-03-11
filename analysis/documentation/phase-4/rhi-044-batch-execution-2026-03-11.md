# RHI-044 High-Value Batch Execution

## Change summary

Executed the local RHI-044 Batch 2 migration run for a locked 35-record high-value subset, aligned the selected high-value category routes to the current Hugo route strategy, and fixed a mapper gap that was preventing page-backed taxonomy terms from rendering in the combined build.

## Why this changed

RHI-044 expands the migration from the pilot subset to a materially larger set of high-value content and category routes. The batch surfaced two non-pilot pipeline issues that needed durable fixes before the batch could be treated as valid:

- page records were carrying category taxonomy in normalized data, but `map-frontmatter.js` only emitted `categories` for posts, which blocked `/category/video/` in the combined build
- four selected high-value nested WordPress category URLs still assumed `keep` behavior in the manifest even though the current Hugo site uses flat category term routes; the SEO owner approved flattening those routes during execution

## Behavior details

Old behavior:

- RHI-044 had no committed Batch 2 source-id input.
- Page records lost category taxonomy during front matter mapping.
- The high-value nested category URLs below were still modeled as `keep` routes in `migration/url-manifest.json`:
  - `/category/salesforce-commerce-cloud/architecture/`
  - `/category/salesforce-commerce-cloud/documentation/`
  - `/category/salesforce-commerce-cloud/go-live/`
  - `/category/salesforce-commerce-cloud/release-notes/`
- Two Batch 2 articles emitted Hugo `Raw HTML omitted` warnings because malformed pseudo-tag markup survived the conversion pipeline.

New behavior:

- Batch 2 now has a committed 35-record source-id input at `migration/input/batch2-source-ids.txt`.
- `scripts/migration/map-frontmatter.js` now preserves `categories` for page records as well as posts, enabling page-backed taxonomies such as `/category/video/` in the combined build.
- The four selected nested high-value category URLs above now use owner-approved `merge` behavior toward the current Hugo route model, with `implementation_layer: edge-cdn`:
  - `/category/salesforce-commerce-cloud/architecture/` → `/category/architecture/`
  - `/category/salesforce-commerce-cloud/documentation/` → `/category/salesforce-commerce-cloud/`
  - `/category/salesforce-commerce-cloud/go-live/` → `/category/go-live/`
  - `/category/salesforce-commerce-cloud/release-notes/` → `/category/release-notes/`
- `scripts/migration/apply-content-corrections.js` now normalizes the two malformed pseudo-tag patterns surfaced during Batch 2 review so reruns no longer emit those Hugo warnings.

## Impact

- The staged Batch 2 payload now passes the formal batch-scoped validation suite.
- Combined-build route review now includes a working `/category/video/` term page backed by selected page records.
- The selected high-value category routes no longer block parity because their legacy nested WordPress URLs are treated as redirecting legacy paths instead of impossible `keep` routes.
- Batch 2 content is copied into `src/content/` for combined-build review, but ticket completion still depends on PR/open-merge workflow and final SEO-owner sign-off.

## Verification

1. Refresh and run the locked Batch 2 subset:
   - `npm run migrate:extract -- --source-id-file migration/input/batch2-source-ids.txt`
   - `npm run migrate:normalize`
   - `npm run migrate:convert`
   - `npm run migrate:download-media`
   - `npm run migrate:map-frontmatter`
   - `npm run migrate:finalize-content`
   - `npm run migrate:apply-corrections`
2. Build and validate the staged Batch 2 payload:
   - `hugo --minify --environment production --contentDir migration/output/content --destination tmp/rhi044-public`
   - `npm run validate:frontmatter -- --content-dir migration/output/content`
   - `node scripts/migration/validate-url-parity.js --scope selected-records --records-file migration/intermediate/records.normalized.json --content-dir migration/output/content --public-dir tmp/rhi044-public`
   - `node scripts/migration/check-redirects.js --scope selected-records --records-file migration/intermediate/records.normalized.json --public-dir tmp/rhi044-public`
   - `npm run check:seo-completeness -- --content-dir migration/output/content --public-dir tmp/rhi044-public`
   - `npm run check:feed-compatibility -- --public-dir tmp/rhi044-public`
   - `npm run check:media -- --content-dir migration/output/content --public-dir tmp/rhi044-public`
   - `CHECK_LINKS_PUBLIC_DIR=tmp/rhi044-public CHECK_LINKS_ALLOW_MANIFEST_TARGETS=1 npm run check:links`
   - `npm run check:a11y-content -- --content-dir migration/output/content`
   - `node scripts/migration/check-security-content.js --content-dir migration/output/content --records-dir migration/output --public-dir tmp/rhi044-public`
   - `CHECK_NOINDEX_PUBLIC_DIR=tmp/rhi044-public npm run check:noindex`
   - `npm run migrate:report`
   - `npm run check:migration-thresholds`
3. Combined-build review highlights:
   - original top-10 traffic sample rechecked in the combined build per owner decision
   - category routes `release-notes`, `go-live`, and `video` render in the combined build after the mapper and manifest fixes
   - the two Batch 2 Hugo raw-HTML warnings were cleared after the pseudo-tag correction rerun

## Related files

- `migration/input/batch2-source-ids.txt`
- `migration/url-manifest.json`
- `scripts/migration/map-frontmatter.js`
- `scripts/migration/apply-content-corrections.js`
- `migration/reports/migration-item-report.csv`
- `migration/reports/url-parity-report.csv`
- `migration/reports/content-corrections-summary.json`
- `analysis/tickets/phase-4/RHI-044-high-value-content-batch.md`
