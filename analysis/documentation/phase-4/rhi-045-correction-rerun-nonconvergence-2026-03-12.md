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

## Validation update (2026-03-12, full workflow replay)

### Replay change summary

- Replayed the full `npm run migrate:apply-corrections` workflow against a temp copy of the current `migration/output/content/` corpus, including the trailing `markdownlint-cli2 --fix` step.
- Separated the Node correction summary counters from the net final-tree diffs between completed pass snapshots.
- Confirmed that the current workflow still fails the stricter first-rerun zero-change expectation, even though the completed filesystem output now converges after repeated full-workflow passes.

### Replay behavior details

#### Node correction summary counters

- pass 1: `166` files changed
- pass 2: `57` files changed
- pass 3: `19` files changed
- pass 4: `16` files changed

These counts come from `content-corrections-summary.json` emitted by `scripts/migration/apply-content-corrections.js` before `markdownlint-cli2 --fix` runs.

#### Final-tree diffs after each completed workflow pass

- pass 0 -> pass 1: `166` files differ
- pass 1 -> pass 2: `48` files differ
- pass 2 -> pass 3: `3` files differ
- pass 3 -> pass 4: `0` files differ

The late-pass final-tree diffs were limited to:

- `pages/page-designer-dynamic-pages-optional-subcategories.md`
- `posts/salesforce-b2c-commerce-the-22-5-release.md`
- `posts/your-definitive-mobile-app-checklist.md`

Those residual diffs were list indentation, malformed `Note **:` emphasis spacing, and fenced/autolink-style angle-bracket URL normalization. No additional files changed between completed passes 3 and 4.

### Replay impact

- RHI-045 still cannot claim the explicit Batch 3 acceptance criterion that the finalized long-tail corpus passed a zero-change correction rerun, because the first replayed full workflow pass still changes `166` files and the second still changes `48` files at the final-tree level.
- The current evidence is stronger than the earlier non-convergence note because it distinguishes two different truths:
  - the first rerun is still not zero-change
  - the overall completed workflow now reaches a stable end state after repeated passes
- Ticket and sign-off wording should treat that as a remaining acceptance-gap on the first-rerun rule, not as missing migration coverage.

### Replay verification

1. Created `tmp/rhi045_rerun_snapshots/pass0` from the current `migration/output/content/` corpus.
2. Replayed four full correction passes on successive temp-copy snapshots using:
   - `node scripts/migration/apply-content-corrections.js --content-dir ...`
   - `npx markdownlint-cli2 --fix ".../**/*.md"`
3. Recorded `summary1.json` through `summary4.json` for the Node correction counters.
4. Compared completed pass trees with `git diff --no-index --name-only` and confirmed `166 -> 48 -> 3 -> 0` net diffs.

### Replay related files

- `analysis/tickets/phase-4/RHI-045-long-tail-taxonomy-batch.md`
- `scripts/migration/apply-content-corrections.js`
- `migration/reports/content-corrections-summary.json`
- `tmp/rhi045_rerun_snapshots/summary1.json`
- `tmp/rhi045_rerun_snapshots/summary2.json`
- `tmp/rhi045_rerun_snapshots/summary3.json`
- `tmp/rhi045_rerun_snapshots/summary4.json`

## Resolution update (2026-03-12, convergence-aware correction pipeline)

### Resolution change summary

- Added `scripts/migration/run-correction-pipeline.js` and repointed `npm run migrate:apply-corrections` to the new runner.
- Tightened `scripts/migration/apply-content-corrections.js` for the dominant non-idempotent signatures: fenced-code wrapper indentation, nested-list indentation preservation, standalone emphasis handling, malformed emphasis spacing, and malformed autolink cleanup.
- Revalidated the current staged corpus with a fresh temp-copy two-run replay and confirmed the external rerun contract is now satisfied.

### Resolution behavior details

#### Previous behavior

- A single `npm run migrate:apply-corrections` run did not reach a stable filesystem end state.
- Temp-copy replays of the current staged corpus required repeated external reruns to converge and still failed the first-rerun zero-change requirement.

#### Updated behavior

- `npm run migrate:apply-corrections` now runs a convergence-aware pipeline wrapper:
  1. run `scripts/migration/apply-content-corrections.js`
  2. run `markdownlint-cli2 --fix`
  3. snapshot the staged Markdown tree
  4. repeat until the staged tree stops changing or the configured pass cap is reached
- `migration/reports/content-corrections-summary.json` is now written as a pipeline-level summary for the full command and records:
  - net `filesChanged` for the whole command
  - `converged`
  - `convergencePasses`
  - `rawFilesChangedFirstPass`
  - `rawFilesChangedLastPass`
  - per-pass `passSummaries`

### Resolution impact

- The RHI-045 correction-rerun blocker is resolved at the pipeline level.
- The current staged corpus now satisfies the external zero-change rerun requirement even though raw internal correction passes still report transient normalization work before markdownlint restores the stable end state.
- Maintainers now have a summary artifact that reflects the full pipeline contract instead of a single raw pass.

### Resolution verification

1. Ran `node scripts/migration/run-correction-pipeline.js --content-dir tmp/rhi045_pipeline_validate2/content --summary-report tmp/rhi045_pipeline_validate2/summary-run1.json --alt-audit-report tmp/rhi045_pipeline_validate2/alt-run1.csv --link-audit-report tmp/rhi045_pipeline_validate2/link-run1.csv` against a temp copy of the current `migration/output/content/` corpus.
2. Confirmed first-run convergence in `4` internal passes with:
   - raw script changes: `166 -> 25 -> 19 -> 16`
   - net pass-to-pass diffs: `166 -> 12 -> 3 -> 0`
3. Re-ran the same command against the already-stable temp corpus and confirmed:
   - `summary-run2.json -> filesChanged: 0`
   - `summary-run2.json -> convergencePasses: 1`
   - `run1-run2-diff.txt` is empty

### Resolution related files

- `scripts/migration/apply-content-corrections.js`
- `scripts/migration/run-correction-pipeline.js`
- `package.json`
- `analysis/tickets/phase-4/RHI-045-long-tail-taxonomy-batch.md`
- `tmp/rhi045_pipeline_validate2/summary-run1.json`
- `tmp/rhi045_pipeline_validate2/summary-run2.json`
- `tmp/rhi045_pipeline_validate2/run1-run2-diff.txt`

## Follow-up update (2026-03-12, real staged corpus rerun and PR #27 merge-evidence guardrail)

### Follow-up change summary

- Reran `npm run migrate:apply-corrections` against the real staged corpus in `migration/output/content/` and refreshed checked-in correction artifacts.
- Updated PR-facing checklist and sign-off wording in RHI-045 so pre-merge evidence can be marked complete without marking merge-dependent completion complete.

### Follow-up rationale

- The follow-up request required two explicit outcomes: refresh checked-in correction artifacts on the real staged corpus and tighten PR #27 completion wording around direct merge evidence.

### Follow-up behavior details

#### Follow-up previous behavior

- The checked-in correction summary reflected an older run state (`filesChanged: 166`) and did not reflect the latest real-corpus rerun.
- PR closeout wording still allowed interpretation that pre-merge approval could imply completion without direct GitHub merge evidence.

#### Follow-up new behavior

- The refreshed `migration/reports/content-corrections-summary.json` now records `filesChanged: 0`, `convergencePasses: 1`, `rawFilesChangedFirstPass: 16`, `rawFilesChangedLastPass: 16`, and pass-level net deltas.
- `migration/reports/image-alt-corrections-audit.csv` was regenerated from the same real-corpus run.
- RHI-045 now marks the PR-open checklist slice as complete while keeping merge-dependent completion open until merged PR state plus merge-commit URL on `main` is recorded.

### Follow-up impact

- Pre-merge correction evidence is now current and can be referenced as refreshed.
- RHI-045 and downstream sign-off must remain In Progress until direct GitHub merge evidence is captured.

### Follow-up verification

1. Ran `npm run migrate:apply-corrections` from the repository root against the real staged corpus.
2. Confirmed `migration/reports/content-corrections-summary.json` reports `filesChanged: 0` with convergence metadata.
3. Confirmed correction report deltas exist in `migration/reports/content-corrections-summary.json` and `migration/reports/image-alt-corrections-audit.csv`.
4. Updated and reviewed PR-facing acceptance/task wording in `analysis/tickets/phase-4/RHI-045-long-tail-taxonomy-batch.md`.

### Follow-up related files

- `migration/reports/content-corrections-summary.json`
- `migration/reports/image-alt-corrections-audit.csv`
- `analysis/tickets/phase-4/RHI-045-long-tail-taxonomy-batch.md`
- `analysis/documentation/phase-4/rhi-045-correction-rerun-nonconvergence-2026-03-12.md`
