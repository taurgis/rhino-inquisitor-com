# RHI-094 Corrected Recheck Closeout (Batches 5-8) (2026-03-23)

## Change summary

This closeout consolidates corrected recheck outcomes for RHI-094 batches 5 through 8 using the stricter caption-nearby-body-text rule and immediate post-figure paragraph review. It confirms current-state pass/fail status, reviewed exceptions, and release recommendation wording.

## Why this changed

Batch-level recheck notes existed, but a single QA closeout statement was still needed for release and audit decisions that require one consolidated verdict.

## Behavior details

### Old behavior

- Recheck evidence was distributed across separate per-batch notes.
- Go/no-go wording had to be inferred manually from multiple files.

### New behavior

- Batches 5 to 8 now have one consolidated closeout verdict.
- Evidence references, residual risks, and release wording are explicitly documented in one place.

## Consolidated corrected recheck outcomes

| Batch | Scope routes | Post-figure candidates (current) | Render parity (current) | Outcome |
|---|---:|---:|---:|---|
| 5 | 15 | 0 | fail=0 | Closed after cleanup edits; no remaining candidates |
| 6 | 15 | 1 | fail=0 | Closed with 1 reviewed keep-body exception |
| 7 | 15 | 2 | fail=0 | Closed with 2 reviewed keep-body exceptions |
| 8 | 6 | 0 | fail=0 | Closed as preservation-only no-op batch |

Consolidated totals:

- Route scope: 51
- Current candidate rows: 3 (all reviewed keep exceptions in batches 6-7)
- Current parity failures: 0

## Impact and verification

### Current-state verification run (2026-03-23)

1. Hugo build:
- Command: hugo --config hugo.toml --destination tmp/hugo-caption-closeout-2026-03-23 --cleanDestinationDir
- Result: success (Pages=204, Processed images=1028)

2. Candidate scan rerun for batches 5-8:
- Command pattern: node tmp/check_seed_post_figure_paragraphs.cjs tmp/img-caption-batch-N-seed-2026-03-22.txt
- Results: batch 5=0, batch 6=1, batch 7=2, batch 8=0

3. Figure/figcaption parity rerun for batches 5-8:
- Command pattern: node tmp/check_seed_figure_parity.cjs tmp/img-caption-batch-N-seed-2026-03-22.txt tmp/hugo-caption-closeout-2026-03-23
- Results: fail=0 for all batches

### Required evidence references for sign-off

Minimum evidence set that must be cited in release and closure decisions:

1. Corrected-rule definition and acceptance criteria.
2. Per-batch recheck notes for batches 5, 6, 7, and 8.
3. Current candidate and parity CSV artifacts for each batch.
4. Reviewed-exception allowlist for retained keep-body decisions.
5. Fresh closeout build destination and rerun command outcomes.

## Residual risks

1. Medium: detector heuristics may miss semantic duplication when wording differs materially but meaning overlaps.
2. Medium: reviewed keep-body exceptions can become stale if nearby prose changes without rerunning exception review.
3. Low: preservation-only routes (linked-image click targets, SVG/GIF exceptions) remain intentionally outside blanket shortcode conversion and need case-by-case handling on future edits.

## Release recommendation

Recommendation: Go with known risk.

Go/no-go wording for downstream records:

"RHI-094 corrected rechecks for batches 5-8 are closed and releasable. All current batch scopes pass figure/figcaption parity and Hugo build validation, with only explicitly reviewed keep-body exceptions remaining. Proceed with go decision while retaining the documented medium residual risk for semantic false negatives and exception drift."

## Related files

- analysis/documentation/phase-9/RHI-094-caption-quality-rule-update-2026-03-23.md
- analysis/documentation/phase-9/RHI-094-caption-nearby-text-recheck-qa-2026-03-23.md
- analysis/documentation/phase-9/RHI-094-caption-reviewed-exception-allowlist-2026-03-23.md
- analysis/documentation/phase-9/RHI-094-img-caption-batch-5-recheck-2026-03-23.md
- analysis/documentation/phase-9/RHI-094-img-caption-batch-6-recheck-2026-03-23.md
- analysis/documentation/phase-9/RHI-094-img-caption-batch-7-recheck-2026-03-23.md
- analysis/documentation/phase-9/RHI-094-img-caption-batch-8-recheck-2026-03-23.md
- tmp/img-caption-batch-5-seed-2026-03-22-post-figure-paragraph-candidates.csv
- tmp/img-caption-batch-6-seed-2026-03-22-post-figure-paragraph-candidates.csv
- tmp/img-caption-batch-7-seed-2026-03-22-post-figure-paragraph-candidates.csv
- tmp/img-caption-batch-8-seed-2026-03-22-post-figure-paragraph-candidates.csv
- tmp/img-caption-batch-5-seed-2026-03-22-render-parity-recheck.csv
- tmp/img-caption-batch-6-seed-2026-03-22-render-parity-recheck.csv
- tmp/img-caption-batch-7-seed-2026-03-22-render-parity-recheck.csv
- tmp/img-caption-batch-8-seed-2026-03-22-render-parity-recheck.csv
