# RHI-045 Correction Rerun Non-Convergence (2026-03-12)

## Change summary

- Investigated the Batch 3 correction evidence mismatch after the ticket claimed a zero-change rerun while the checked-in `migration/reports/content-corrections-summary.json` still reported `filesChanged: 166`.
- Confirmed that the checked-in summary is now current for the regenerated staged corpus, but also confirmed that the current correction workflow is still not rerun-idempotent on Batch 3 staged content.
- Documented the exact rerun counts, the residual rewrite signatures, and the evidence that must be reflected in the ticket before RHI-045 can be treated as evidence-complete again.

## Why this changed

- RHI-045 closeout evidence was internally inconsistent: the ticket asserted zero-change rerun convergence, while the checked-in correction summary reported `166` changed files.
- Phase 4 sign-off and any Batch 3 PR closeout need a single, current, defensible statement about correction-pass behavior.
- The investigation was scoped to evidence correction and requirement clarity only. It does not implement a pipeline fix.

## Behavior details

### Old behavior

- The ticket and closeout notes treated the correction rerun evidence as converged and cited a zero-change rerun.
- The earlier evidence review treated the checked-in summary as stale because it no longer matched the then-current staged corpus investigation.

### New behavior

- The evidence set now distinguishes two separate facts:
  - the checked-in summary file is current for the regenerated staged corpus and still reports `166`
  - the current staged corpus still does not converge to `0` on repeated correction reruns
- Temp-copy validation of the current `migration/output/content/` corpus on 2026-03-12 produced these sequential correction-pass results:
  - pass 1: `60` files changed
  - pass 2: `21` files changed after `markdownlint-cli2 --fix`
  - pass 3: `17` files changed
  - pass 4: `16` files changed
  - pass 5: `16` files changed
- The net residual pass-5 diff was limited to:
  - `migration/output/content/posts/what-is-new-in-sfcc-24-6.md`
- The remaining net diff is a malformed nested angle-bracket token pattern in the supported algorithms list, where repeated correction passes continue to rewrite a malformed MAC token run. The broader pass summaries still show repeated activity in code-span, inline-HTML, and blockquote normalization, which is consistent with overlapping normalization phases acting on malformed `<...>` token structures.

## Impact

- RHI-045 cannot currently claim the acceptance criterion that the finalized long-tail corpus passed a zero-change correction rerun.
- RHI-046 and any Phase 4 sign-off package must treat correction-rerun convergence as open until either:
  - the correction pipeline is made rerun-idempotent on the current staged corpus, or
  - the owner explicitly accepts a revised evidence rule that does not require zero-change reruns
- `migration/reports/content-corrections-summary.json` can be used as current first-pass evidence for the regenerated staged corpus, but it cannot be presented as proof of rerun-idempotent convergence.

## BA recommendations

### Exact scope

- Limit this follow-up to correction-evidence integrity for Batch 3 staged content and Phase 4 closeout artifacts.
- Do not widen scope to general formatting-fidelity cleanup outside the residual non-convergent signatures unless a separate implementation ticket is opened.

### Acceptance criteria

- `FR-045-E1`: The RHI-045 ticket must state the current checked-in correction-summary value and whether it is accepted as current, stale, or superseded.
- `FR-045-E2`: The RHI-045 ticket must record measured rerun behavior for the current staged corpus, including the exact file-change counts for each validation pass used in the investigation.
- `FR-045-E3`: Supporting documentation must identify the residual non-convergent file set and the dominant rewrite signature categories still preventing zero-change reruns.
- `FR-045-E4`: The ticket must clearly state whether zero-change correction rerun evidence remains a blocking acceptance criterion for Batch 3 closeout.
- `NFR-045-E1`: Evidence statements must be traceable to repository files or explicit validation commands run against the current workspace state.
- `NFR-045-E2`: The ticket and supporting documentation must distinguish sourced facts from investigation hypotheses.

### Assumptions

- The current `migration/output/content/` tree is the staged Batch 3 corpus relevant to RHI-045 closeout.
- Temp-copy reruns are representative because they were executed against an unmodified copy of the current staged content and used the same correction script and curated inputs as the main workflow.
- The residual non-convergent signatures are pipeline-owned defects unless later evidence proves they originate from an intentional downstream formatter rule.

### Evidence that must be reflected

- The current checked-in summary value in `migration/reports/content-corrections-summary.json`.
- The rerun sequence observed on 2026-03-12 against the current staged corpus: `60 -> 21 -> 17 -> 16 -> 16`.
- The residual net non-convergent post and its malformed nested angle-bracket token pattern.
- The fact that no pipeline fix was implemented in this investigation task.

## Verification

1. Read `migration/reports/content-corrections-summary.json` after the latest full regeneration and confirmed the checked-in value remained `filesChanged: 166` for the current staged corpus.
2. Created a temp copy of `migration/output/content/` and ran repeated correction passes against that copy using `node scripts/migration/apply-content-corrections.js --content-dir ...` with `markdownlint-cli2 --fix` after each pass.
3. Recorded summary outputs for passes 1 through 5 and confirmed the current staged corpus remained non-idempotent (`60 -> 21 -> 17 -> 16 -> 16`).
4. Diffed the net pass-5 file set against the pass-4 snapshot and confirmed the remaining residual rewrite was limited to a malformed nested angle-bracket token pattern in `what-is-new-in-sfcc-24-6.md`.

## Related files

- `analysis/tickets/phase-4/RHI-045-long-tail-taxonomy-batch.md`
- `migration/reports/content-corrections-summary.json`
- `migration/reports/image-alt-corrections-audit.csv`
- `scripts/migration/apply-content-corrections.js`
- `migration/output/content/posts/what-is-new-in-sfcc-24-6.md`

## Implementation update (2026-03-12, option 1)

### Implementation change summary

- Implemented a targeted normalization fix in `scripts/migration/apply-content-corrections.js` to stop repeated rewrites of `migration/output/content/posts/what-is-new-in-sfcc-24-6.md`.
- Updated the email autolink wrapper regex in `wrapBareUrls` so it no longer matches mid-token substrings inside algorithm identifiers.

### Implementation behavior details

#### Previous behavior (implementation scope)

- In algorithm strings such as `<curve25519-sha256@libssh.org>`, the email matcher could skip the leading segment and wrap a substring (`sha256@libssh.org`) because the token began with `<`.
- This produced malformed nested angle-bracket tokens (`curve25519-<sha256@...>`), which then cascaded through inline HTML and code-span normalization and caused repeated pass-to-pass rewrites.

#### Updated behavior (implementation scope)

- The email matcher now enforces an additional left-boundary guard: `(?<![A-Z0-9._%+-])`.
- Mid-token matches inside local-part-safe characters are blocked, so existing `<...@...>` algorithm identifiers are no longer split and rewrapped.
- The isolated problematic post now stabilizes after the first pass instead of rewriting on every pass.

### Impact and verification

- Validation on isolated replay (`tmp/rhi045_single_fix`) for `what-is-new-in-sfcc-24-6.md`:
  - pass 1: `filesChanged=1`, `bareUrlsWrapped=0`, `inlineHtmlEscaped=0`, `codeSpanSpacingNormalized=0`
  - pass 2: `filesChanged=0`, all three counters remain `0`
  - pass 3: `filesChanged=0`, all three counters remain `0`
  - pass 4: `filesChanged=0`, all three counters remain `0`
- Pass-to-pass diffs (`pass1->pass2`, `pass2->pass3`) are empty for the previously looping token region.

### Related files (implementation update)

- `scripts/migration/apply-content-corrections.js`
- `analysis/documentation/phase-4/rhi-045-correction-rerun-nonconvergence-2026-03-12.md`
- `migration/output/content/posts/what-is-new-in-sfcc-24-6.md`
