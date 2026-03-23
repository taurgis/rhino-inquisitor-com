# RHI-094 Corrected Recheck Closeout (Batches 5-8) (2026-03-23)

## Change summary

This closeout consolidates the corrected recheck evidence for RHI-094 across batches 5 through 8. The recheck program applied the stricter caption-quality rule that evaluates both figcaption content and the first plain paragraph immediately after each figure, then closed all remaining migration batches under a consistent evidence format.

## Why this changed

The original batch execution notes proved migration and render parity, but they predated the stricter nearby-body-copy and leftover post-figure paragraph rule. Without a consolidated closeout, the final RHI-094 state would remain split across multiple batch notes and an outdated ticket.

## Behavior details

### Old behavior

- Batch evidence primarily proved shortcode migration and figure parity.
- Immediate post-figure paragraphs were not explicitly classified as leftover caption text or legitimate body prose.
- Batch 8 had closure evidence, but not in the same corrected-workflow format used later.

### New behavior

- Batches 5 to 8 are now all closed under the corrected caption-quality workflow.
- Batch 5 removed leftover or low-value post-figure paragraphs and closed with zero remaining candidates.
- Batches 6 and 7 retained a small number of reviewed keep-body exceptions where the paragraph added genuine warning, transition, or explanatory value.
- Batch 8 was normalized as a preservation-only no-op recheck because it contains zero shortcode routes and unchanged preservation exceptions.

## Policy boundary

This closeout is repository-local evidence for the RHI-094 corrected rechecks across batches 5 through 8. It records internal caption-quality outcomes, reviewed exceptions, and repository build and render-parity verification within the repository’s existing policy boundary. It is not a public WCAG conformance claim.

## Consolidated Batch Outcomes

| Batch | Routes reviewed | Candidates flagged | Removals | Rewrites | Keep-body exceptions | Source edits | Verification result |
|---|---|---|---|---|---|---|---|
| 5 | 15 | 7 | 8 | 0 | 0 | yes | Build pass, parity 15/15, final candidates 0 |
| 6 | 15 | 1 | 0 | 0 | 1 | no | Build pass, parity 15/15, reviewed exception documented |
| 7 | 15 | 2 | 0 | 0 | 2 | no | Build pass, parity 15/15, reviewed exceptions documented |
| 8 | 6 | 0 | 0 | 0 | 0 | no | Build pass, parity 6/6, preservation validation only |

## Exception boundary

- Repository-wide reviewed no-change exceptions are tracked in `analysis/documentation/phase-9/RHI-094-caption-reviewed-exception-allowlist-2026-03-23.md` and anchored to the current global audit output in `tmp/post-figure-paragraph-candidates.csv`.
- Batch-6 and batch-7 keep-body decisions remain valid batch-local recheck outcomes even when they are not part of the current standing global allowlist set.
- Batch-8 preserved routes remain intentionally unconverted under the approved exception classes:
  - linked-image click-target routes
  - one svg build-safety exception route

## Verification

1. Governing rule and QA gate:
- `analysis/documentation/phase-9/RHI-094-caption-quality-rule-update-2026-03-23.md`
- `analysis/documentation/phase-9/RHI-094-caption-nearby-text-recheck-qa-2026-03-23.md`

2. Batch evidence:
- `analysis/documentation/phase-9/RHI-094-img-caption-batch-5-recheck-2026-03-23.md`
- `analysis/documentation/phase-9/RHI-094-img-caption-batch-6-recheck-2026-03-23.md`
- `analysis/documentation/phase-9/RHI-094-img-caption-batch-7-recheck-2026-03-23.md`
- `analysis/documentation/phase-9/RHI-094-img-caption-batch-8-recheck-2026-03-23.md`

3. Aggregate reviewed-exception evidence:
- Global audit source: `tmp/post-figure-paragraph-candidates.csv`
- Reviewed exception allowlist: `analysis/documentation/phase-9/RHI-094-caption-reviewed-exception-allowlist-2026-03-23.md`
- Current global result: `candidates=8`

4. Final closeout result:
- No remaining convertible plain Markdown images remain in batch-8 closure scope.
- No reopened batch from 5 to 8 has unresolved corrected-workflow findings.
- Build and parity evidence pass for all four corrected rechecks.

## Related files

- `analysis/tickets/phase-9/RHI-094-img-caption-accessibility-migration.md`
- `analysis/documentation/phase-9/RHI-094-caption-quality-rule-update-2026-03-23.md`
- `analysis/documentation/phase-9/RHI-094-caption-reviewed-exception-allowlist-2026-03-23.md`
- `analysis/documentation/phase-9/RHI-094-img-caption-batch-5-recheck-2026-03-23.md`
- `analysis/documentation/phase-9/RHI-094-img-caption-batch-6-recheck-2026-03-23.md`
- `analysis/documentation/phase-9/RHI-094-img-caption-batch-7-recheck-2026-03-23.md`
- `analysis/documentation/phase-9/RHI-094-img-caption-batch-8-recheck-2026-03-23.md`
- `tmp/post-figure-paragraph-candidates.csv`