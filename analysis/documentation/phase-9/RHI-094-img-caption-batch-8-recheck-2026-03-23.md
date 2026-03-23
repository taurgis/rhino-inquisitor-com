# RHI-094 Batch 8 Recheck (2026-03-23)

## Change summary

Rechecked the existing batch-8 closure scope under the corrected caption-quality workflow. Batch 8 remains a preservation-only batch with zero shortcode routes, zero nearby-text candidates, no source edits, and unchanged preservation exceptions.

## Why this changed

The original batch-8 execution note closed caption migration as complete, but it predated the later corrected recheck format used for batches 5 to 7. This note normalizes batch-8 evidence to the same closure standard without expanding scope into new conversion work.

## Behavior details

### Old behavior

- Batch 8 was already recorded as a preservation-only closure batch with six retained Markdown-image routes.
- It did not yet have a dedicated corrected-workflow recheck note aligned to batches 5 to 7.

### New behavior

- Batch 8 is now explicitly closed under the corrected recheck workflow as a no-op preservation batch.
- The six preserved routes remain unchanged.
- No `{{< img-caption >}}` routes exist in batch-8 scope, so duplicate-caption cleanup was not triggered for any route.
- The corrected post-figure detector was still rerun and returned zero candidates.

## Impact

- Recheck scope: 6 routes in `tmp/img-caption-batch-8-seed-2026-03-22.txt`
- Initial and final corrected-logic candidate scan: `0` candidate rows
- Final reviewed outcome: `0` removals, `0` rewrites, `0` reviewed keep exceptions
- Source edits in this recheck: none
- Preservation classes unchanged:
  - linked-image click-target routes: 5
  - svg build-safety exception routes: 1

## Verification

1. Preservation inventory remained unchanged:
- Baseline files: `tmp/img-caption-batch-8-before.csv`, `tmp/img-caption-batch-8-after.csv`
- Result: before and after inventories remain identical; no conversions were introduced.

2. Corrected-workflow nearby-text detector:
- Command: `node tmp/check_seed_post_figure_paragraphs.cjs tmp/img-caption-batch-8-seed-2026-03-22.txt`
- Report: `tmp/img-caption-batch-8-seed-2026-03-22-post-figure-paragraph-candidates.csv`
- Result: header only, `candidates=0`

3. Hugo build success:
- Command: `hugo --config hugo.toml --destination tmp/hugo-caption-batch-8-recheck-final --cleanDestinationDir`
- Result: successful build (`Pages=204`, `Processed images=1028`, no build errors)

4. Rendered figure/figcaption parity:
- Command: `node tmp/check_seed_figure_parity.cjs tmp/img-caption-batch-8-seed-2026-03-22.txt tmp/hugo-caption-batch-8-recheck-final`
- Report: `tmp/img-caption-batch-8-seed-2026-03-22-render-parity-recheck.csv`
- Result: `routes_total=6`, `pass=6`, `fail=0`

5. Applicability note:
- Batch 8 contains zero shortcode routes, so the corrected recheck functioned as preservation validation rather than caption rewrite/removal review.

## Related files

- `analysis/documentation/phase-9/RHI-094-img-caption-batch-8-execution-2026-03-22.md`
- `tmp/img-caption-batch-8-seed-2026-03-22.txt`
- `tmp/img-caption-batch-8-before.csv`
- `tmp/img-caption-batch-8-after.csv`
- `tmp/img-caption-batch-8-seed-2026-03-22-post-figure-paragraph-candidates.csv`
- `tmp/img-caption-batch-8-seed-2026-03-22-render-parity-recheck.csv`
- `tmp/check_seed_post_figure_paragraphs.cjs`
- `tmp/check_seed_figure_parity.cjs`
- `src/content/posts/storefront-protection-in-the-pwa-kit/index.md`
- `src/content/posts/submitting-a-file-to-a-third-party-service-in-sfcc/index.md`
- `src/content/posts/helpful-salesforce-b2c-commerce-cloud-cli-tools/index.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-the-22-7-release/index.md`
- `src/content/posts/submit-multipart-form-data-to-a-third-party-service-in-sfcc/index.md`
- `src/content/posts/the-deprecation-of-the-uuid-token-for-api-clients/index.md`