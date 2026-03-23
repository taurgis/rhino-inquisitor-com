# RHI-094 Batch 5 Recheck (2026-03-23)

## Change summary

Rechecked the existing batch-5 caption routes under the corrected logic that evaluates both the visible figcaption and the first plain paragraph immediately after each figure. The recheck removed leftover post-image caption paragraphs where they were still present and verified that the batch now closes with zero remaining candidates.

## Why this changed

The original batch-5 execution note confirmed shortcode migration and render parity, but it did not apply the stricter rule for leftover caption-style paragraphs after figures. This recheck closes that gap before later batches rely on the corrected workflow.

## Behavior details

### Old behavior

- Batch 5 had already migrated Markdown images to `{{< img-caption >}}` where safe.
- Some routes still carried short post-image paragraphs that behaved like leftover WordPress caption text or low-value rhetorical restatements.

### New behavior

- Batch-5 routes were re-reviewed using the corrected two-part rule: caption disposition plus immediate post-figure paragraph disposition.
- Eight leftover or low-value post-image paragraphs were removed across five routes.
- No additional figcaption rewrites were required for this recheck batch.

## Impact

- Recheck scope: 15 routes in `tmp/img-caption-batch-5-seed-2026-03-22.txt`
- Initial corrected-logic candidate scan: `7` candidate rows
- Iterative cleanup outcome: `0` final candidate rows
- Routes changed in this recheck:
  - `src/content/posts/is-salesforce-certification-worth-it/index.md`
  - `src/content/posts/mastering-chunk-oriented-job-steps-in-salesforce-b2c-commerce-cloud/index.md`
  - `src/content/posts/understanding-locale-fallback-in-sfcc/index.md`
  - `src/content/posts/what-does-the-composable-storefront-mean-for-sfcc-developers/index.md`
  - `src/content/posts/what-is-oci-omnichannel-inventory/index.md`

## Verification

1. Corrected-logic candidate audit:
- Command: `node tmp/check_seed_post_figure_paragraphs.cjs tmp/img-caption-batch-5-seed-2026-03-22.txt`
- Final report: `tmp/img-caption-batch-5-seed-2026-03-22-post-figure-paragraph-candidates.csv`
- Result: header only, `candidates=0`

2. Hugo build success:
- Command: `hugo --config hugo.toml --destination tmp/hugo-caption-batch-5-recheck-final --cleanDestinationDir`
- Result: successful build (`Pages=204`, `Processed images=1028`, no build errors)

3. Rendered figure/figcaption parity:
- Command: `node tmp/check_seed_figure_parity.cjs tmp/img-caption-batch-5-seed-2026-03-22.txt tmp/hugo-caption-batch-5-recheck-final`
- Report: `tmp/img-caption-batch-5-seed-2026-03-22-render-parity-recheck.csv`
- Result: `routes_total=15`, `pass=15`, `fail=0`

4. Diagnostics:
- Edited route checks returned no file diagnostics after the recheck edits.

## Related files

- `tmp/img-caption-batch-5-seed-2026-03-22.txt`
- `tmp/img-caption-batch-5-seed-2026-03-22-post-figure-paragraph-candidates.csv`
- `tmp/img-caption-batch-5-seed-2026-03-22-render-parity-recheck.csv`
- `tmp/check_seed_post_figure_paragraphs.cjs`
- `tmp/check_seed_figure_parity.cjs`
- `src/content/posts/is-salesforce-certification-worth-it/index.md`
- `src/content/posts/mastering-chunk-oriented-job-steps-in-salesforce-b2c-commerce-cloud/index.md`
- `src/content/posts/understanding-locale-fallback-in-sfcc/index.md`
- `src/content/posts/what-does-the-composable-storefront-mean-for-sfcc-developers/index.md`
- `src/content/posts/what-is-oci-omnichannel-inventory/index.md`