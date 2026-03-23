# RHI-094 Batch 6 Recheck (2026-03-23)

## Change summary

Rechecked the existing batch-6 caption routes under the corrected logic that evaluates both the visible figcaption and the first plain paragraph immediately after each figure. The recheck found one candidate paragraph and kept it as a reviewed exception because it adds a genuine HSTS safety warning rather than acting as leftover caption text.

## Why this changed

The original batch-6 execution note proved shortcode migration and render parity, but it predated the stricter rule for nearby-body-copy duplication and leftover post-image paragraphs. This recheck applies that rule to the batch-6 scope so the batch can be closed under the corrected standard.

## Behavior details

### Old behavior

- Batch 6 had already migrated plain Markdown images to `{{< img-caption >}}` where safe.
- The batch had not yet been reviewed with the corrected immediate-post-figure paragraph rule.

### New behavior

- All 15 batch-6 routes were re-audited under the corrected logic.
- One candidate paragraph was flagged on `salesforce-b2c-commerce-cloud-23-1`.
- That paragraph was kept with rationale because it is an operational safety warning, not a screenshot label or caption restatement.
- No source edits were required for the batch-6 recheck.

## Impact

- Recheck scope: 15 routes in `tmp/img-caption-batch-6-seed-2026-03-22.txt`
- Initial corrected-logic candidate scan: `1` candidate row
- Final reviewed-exception outcome: `1` keep, `0` removals, `0` rewrites
- Source edits in this recheck: none

## Verification

1. Corrected-logic candidate audit:
- Command: `node tmp/check_seed_post_figure_paragraphs.cjs tmp/img-caption-batch-6-seed-2026-03-22.txt`
- Report: `tmp/img-caption-batch-6-seed-2026-03-22-post-figure-paragraph-candidates.csv`
- Result: `candidates=1`

2. Reviewed exception recorded:
- Route: `salesforce-b2c-commerce-cloud-23-1`
- Figure: `2`
- Paragraph disposition: `keep-body`
- Rationale: safety warning about enabling HSTS on subdomains; the paragraph adds rollout guidance not expressed by the caption.

3. Hugo build success:
- Command: `hugo --config hugo.toml --destination tmp/hugo-caption-batch-6-recheck --cleanDestinationDir`
- Result: successful build (`Pages=204`, `Processed images=1028`, no build errors)

4. Rendered figure/figcaption parity:
- Command: `node tmp/check_seed_figure_parity.cjs tmp/img-caption-batch-6-seed-2026-03-22.txt tmp/hugo-caption-batch-6-recheck`
- Report: `tmp/img-caption-batch-6-seed-2026-03-22-render-parity-recheck.csv`
- Result: `routes_total=15`, `pass=15`, `fail=0`

## Related files

- `tmp/img-caption-batch-6-seed-2026-03-22.txt`
- `tmp/img-caption-batch-6-seed-2026-03-22-post-figure-paragraph-candidates.csv`
- `tmp/img-caption-batch-6-seed-2026-03-22-render-parity-recheck.csv`
- `tmp/check_seed_post_figure_paragraphs.cjs`
- `tmp/check_seed_figure_parity.cjs`
- `src/content/posts/salesforce-b2c-commerce-cloud-23-1/index.md`
- `analysis/documentation/phase-9/RHI-094-caption-reviewed-exception-allowlist-2026-03-23.md`
