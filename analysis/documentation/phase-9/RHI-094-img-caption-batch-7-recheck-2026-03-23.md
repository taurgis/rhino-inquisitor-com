# RHI-094 Batch 7 Recheck (2026-03-23)

## Change summary

Rechecked the existing batch-7 caption routes under the corrected logic that evaluates both the visible figcaption and the first plain paragraph immediately after each figure. The recheck retained both detected candidates as reviewed exceptions because each paragraph advances article flow instead of acting as leftover caption text.

## Why this changed

The original batch-7 execution note proved shortcode migration and render parity, but it predated the stricter nearby-body-copy and immediate-post-figure paragraph rule. This recheck applies the corrected rule set to close batch 7 under the same standard already applied to batches 5 and 6.

## Behavior details

### Old behavior

- Batch 7 had already migrated plain Markdown images to `{{< img-caption >}}` where safe.
- The batch had not yet been reviewed with the corrected immediate-post-figure paragraph rule.

### New behavior

- All 15 batch-7 routes were re-audited under the corrected logic.
- Two candidates were retained as reviewed exceptions (`keep-body`) with explicit rationale.
- No source edits were required for batch-7 closure under the corrected rule.

## Impact

- Recheck scope: 15 routes in `tmp/img-caption-batch-7-seed-2026-03-22.txt`
- Initial corrected-logic candidate scan: `2` candidate rows
- Final reviewed outcome: `2` keeps (reviewed exceptions), `0` removals, `0` rewrites
- Source edits in this recheck: none

## Verification

1. Corrected-logic candidate audit:
- Command: `node tmp/check_seed_post_figure_paragraphs.cjs tmp/img-caption-batch-7-seed-2026-03-22.txt`
- Report: `tmp/img-caption-batch-7-seed-2026-03-22-post-figure-paragraph-candidates.csv`
- Result: `candidates=2`

2. Reviewed exceptions recorded:
- Route: `the-createorders-api-in-sfcc`
- Figure: `1`
- Paragraph disposition: `keep-body`
- Rationale: transition sentence introducing the expected API response payload, not an image label.

- Route: `sfcc-url-cracking-the-code`
- Figure: `1`
- Paragraph disposition: `keep-body`
- Rationale: lead-in sentence to the numbered URL-component breakdown, not a caption restatement.

3. Hugo build success:
- Command: `hugo --config hugo.toml --destination tmp/hugo-caption-batch-7-recheck-final --cleanDestinationDir`
- Result: successful build (`Pages=204`, `Processed images=1028`, no build errors)

4. Rendered figure/figcaption parity:
- Command: `node tmp/check_seed_figure_parity.cjs tmp/img-caption-batch-7-seed-2026-03-22.txt tmp/hugo-caption-batch-7-recheck-final`
- Report: `tmp/img-caption-batch-7-seed-2026-03-22-render-parity-recheck.csv`
- Result: `routes_total=15`, `pass=15`, `fail=0`

5. Diagnostics:
- No source route edits were made in this recheck, so no route-level diagnostic cleanup was required.

## Related files

- `tmp/img-caption-batch-7-seed-2026-03-22.txt`
- `tmp/img-caption-batch-7-seed-2026-03-22-post-figure-paragraph-candidates.csv`
- `tmp/img-caption-batch-7-seed-2026-03-22-render-parity-recheck.csv`
- `tmp/check_seed_post_figure_paragraphs.cjs`
- `tmp/check_seed_figure_parity.cjs`
- `src/content/posts/the-createorders-api-in-sfcc/index.md`
- `src/content/posts/sfcc-url-cracking-the-code/index.md`
