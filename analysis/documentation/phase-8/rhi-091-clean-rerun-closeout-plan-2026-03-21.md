# RHI-091 Clean Rerun and Closeout Plan

## Change summary

This document defines the recommended clean-rerun path for RHI-091 after the WS-H automation was added after the frozen `phase-8-rc-v2` snapshot. It also defines the final closeout sequence for the remaining Phase 8 launch-governance artifacts.

## Why this changed

The current WS-H evidence is valid working evidence, but it is not final launch evidence because:

- `validation/preview-launch-readiness-report.json` and `validation/production-host-smoke-report.json` were generated on a dirty workspace after `phase-8-rc-v2`
- the new WS-H scripts do not exist on `phase-8-rc-v2`, so the required clean rerun cannot be performed honestly against that tag
- the owner requires a fresh RHI-091 decision record and a rollback drill against the previous WordPress stack before go/no-go can move forward

## Behavior details

### Previous state

- WS-H had working automation and current branch-state evidence.
- The repository did not yet have a documented exact path to turn those working artifacts into final clean-RC evidence.
- The three remaining closeout artifacts did not exist yet.

### New state

The recommended closeout path is:

1. Merge the WS-H automation and related docs without introducing any Hugo template, configuration, routing, or content changes.
2. Cut a fresh RC snapshot for the merged clean state. Recommended tag: `phase-8-rc-v3`.
3. Trigger a new manual `workflow_dispatch` run on the branch that contains the tagged commit, and record both the workflow run URL and the `phase-8-rc-v3` tag as the final evidence basis.
4. Regenerate the two WS-H reports from the clean RC basis:
   - `validation/production-host-smoke-report.json`
   - `validation/preview-launch-readiness-report.json`
5. Execute the rollback drill against the previous WordPress stack and commit `migration/phase-8-rollback-drill-result.md`.
6. Close the two open `blocking` entries in `migration/phase-8-exception-register.md`.
7. Finalize the remaining RHI-091 artifacts from the clean evidence set:
   - `LAUNCH-GATE-PASS-SUMMARY.md`
   - `CUTOVER-VERIFICATION-CHECKLIST.md`
   - `migration/phase-8-go-nogo-decision.md`
   - `migration/phase-8-rollback-drill-result.md`
   - `migration/phase-8-rc-v3-record.md`

The closeout plan now also includes an explicit row-flip matrix so reviewers can tell which remaining RHI-091 items become eligible to close after the final clean `workflow_dispatch` run and WS-H re-review, and which still remain blocked on rollback or sign-off work.

### Exact rerun sequence

#### A. Freeze the final WS-H snapshot

1. Review the diff from `phase-8-rc-v2` and confirm it is limited to WS-H scripts, validation outputs, and documentation.
2. Commit the WS-H changes on a clean workspace.
3. Create the fresh RC tag on that commit. Recommended command shape:

```bash
git tag -a phase-8-rc-v3 -m "Phase 8 RC v3: WS-H operational readiness evidence"
```

4. Create and commit `migration/phase-8-rc-v3-record.md` with the new RC provenance.

#### B. Run the clean CI evidence pass

1. Trigger the `Deploy to GitHub Pages` workflow with `workflow_dispatch` on the branch that contains the `phase-8-rc-v3` commit.
2. Record the workflow run URL.
3. Treat this as a new manual run, not a rerun attempt of the old RC v2 run.
4. Capture the deployed Pages URL from the `github-pages` environment deployment.

#### C. Regenerate the two WS-H reports on the clean basis

Use the final RC checkout after the clean CI run completes.

1. Regenerate the production-build cleanliness report against the production artifact snapshot:

```bash
node scripts/phase-8/check-production-validation-build.js --public-dir tmp/ci-prod-public --report validation/production-host-smoke-report.json
```

2. Regenerate the live preview-host smoke report against the deployed rehearsal entrypoint:

```bash
node scripts/phase-8/check-preview-launch-readiness.js --base-url https://taurgis.github.io/rhino-inquisitor-com/ --report validation/preview-launch-readiness-report.json --markdown migration/phase-8-smoke-test-results.md
```

3. Confirm both reports are no longer `branch-state` and reflect the clean RC basis.

#### D. Execute the rollback drill

1. Follow `migration/phase-7-staging-rollback-runbook.md` step by step.
2. Use the previous WordPress stack as the rollback target.
3. Measure trigger-to-confirmed-access time.
4. Commit `migration/phase-8-rollback-drill-result.md`.

#### E. Finalize go or no-go evidence

1. Update `migration/phase-8-exception-register.md` so both current `blocking` entries are closed.
2. Populate `LAUNCH-GATE-PASS-SUMMARY.md` from the single clean workflow run.
3. Complete `CUTOVER-VERIFICATION-CHECKLIST.md` at T-24h before the go/no-go record is signed.
4. Record the formal decision in `migration/phase-8-go-nogo-decision.md`.

## Unchecked Row Flip Matrix

This matrix defines which currently unchecked rows in `analysis/tickets/phase-8/RHI-091-operational-readiness-go-nogo.md` should flip after specific evidence events.

### Rows that flip after the final `workflow_dispatch` run plus WS-H re-review

These rows may close only when all are true:

1. The final Phase 8 evidence run is a clean `workflow_dispatch` run on the final RC basis.
2. `validation/preview-launch-readiness-report.json` and `validation/production-host-smoke-report.json` are regenerated from that basis and are no longer `branch-state`.
3. Review completion for the WS-H reports is logged in the ticket progress log.

Rows expected to flip from that event set:

- Full gate suite parent row and the still-open gate subrows for `lhci:run:p8`, `check:perf-budget`, and `check:links`
- `validation/preview-launch-readiness-report.json` generated and reviewed alongside the smoke-test markdown summary
- `validation/production-host-smoke-report.json` generated and reviewed alongside the final launch summary
- Priority legacy redirect smoke row, if the final rehearsal uses the same frozen `validation/priority-routes.json` contract and records the available route sample outcome explicitly
- Task row to trigger `workflow_dispatch` on the RC branch with all gates enabled
- Task row to record review completion in the progress log with reviewer name and date
- The parent task row `Run the full Phase 8 gate suite in a single CI run against the final RC commit` when its remaining children are closed

### Rows that still require rollback-drill evidence after the final run succeeds

These rows do not flip from the final run alone:

- All acceptance and task rows under `Rollback drill is executed and timed`
- `No unresolved blocking gate failure is carried to the go/no-go decision`
- Any row in downstream decision artifacts that references `migration/phase-8-rollback-drill-result.md`

These rows may close only when the rollback drill file contains real timestamps, MTTR, WordPress accessibility proof, and a final disposition with no remaining unresolved `blocking` rollback entry in `migration/phase-8-exception-register.md`.

### Rows that still require T-24h or formal sign-off action after final run and rollback evidence exist

These rows remain open until the decision window itself occurs:

- `LAUNCH-GATE-PASS-SUMMARY.md` signed off by migration owner
- `CUTOVER-VERIFICATION-CHECKLIST.md` completed at T-24h before go/no-go meeting with ownership sign-off from engineering, SEO, and incident commander
- All `Go/No-Go decision is made and recorded` acceptance rows
- All `Convene Go/No-Go meeting with all required approvers` task rows
- All remaining rows under `Commit migration/phase-8-go-nogo-decision.md`

### Guardrail

Do not flip parent rows early. Update child rows first, then close the parent row only when every dependent child row is backed by one committed artifact, one run URL, and one date-aligned review or sign-off record.

### Support record scaffolds

Two additional support files exist so the final decision window does not need to invent evidence structure under time pressure:

- `migration/phase-8-rollback-drill-result.md` is a drill-result scaffold only and must remain obviously unfilled until the live rollback rehearsal is executed.
- `migration/phase-8-rc-v3-record.md` is an RC-freeze scaffold only and must remain obviously unfilled until the RC v3 tag and final run provenance exist.
- `analysis/documentation/phase-8/rhi-091-live-fill-command-checklist-2026-03-21.md` is the operator-facing command sequence for executing the live fill-in step.
- `analysis/documentation/phase-8/rhi-091-wsh-rc-v3-scope-isolation-2026-03-21.md` defines the WS-H-only include and exclude set after preflight showed the current branch contains broader non-WS-H changes.

Both files intentionally use explicit `PENDING_*` placeholders so incomplete evidence is detectable during review.

## Impact

- Maintainers now have one explicit path from branch-state working evidence to clean-RC final evidence.
- The final closeout artifacts can be completed without re-deciding structure during the release window.
- The repository now distinguishes clearly between preview-host rehearsal evidence, production-build cleanliness evidence, rollback readiness, and final decision evidence.

## Verification

Use this sequence after the WS-H automation is merged:

1. Confirm the workspace is clean and the fresh RC tag exists.
2. Run the final `workflow_dispatch` pass and capture the Actions run URL.
3. Re-run both WS-H scripts on the clean RC basis.
4. Verify both WS-H reports no longer show `provenanceStatus: "branch-state"`.
5. Complete and record the rollback drill.
6. Populate the three pending closeout templates from the clean evidence set.
7. Replace all `PENDING_*` values in the rollback-drill and RC-v3 support records.

Row-flip verification:

1. After the final run and WS-H re-review, verify only the row set named in `Rows that flip after the final workflow_dispatch run plus WS-H re-review` is closed.
2. After the rollback drill, verify only the rollback-dependent row set is newly closed.
3. After T-24h and final decision sign-off, verify the remaining decision and checklist rows are closed.

## Related files

- `scripts/phase-8/check-preview-launch-readiness.js`
- `scripts/phase-8/check-production-validation-build.js`
- `migration/phase-8-exception-register.md`
- `migration/phase-8-approver-roster.md`
- `migration/phase-7-staging-rollback-runbook.md`
- `validation/preview-launch-readiness-report.json`
- `validation/production-host-smoke-report.json`
- `migration/phase-8-smoke-test-results.md`
- `migration/phase-8-rollback-drill-result.md`
- `migration/phase-8-rc-v3-record.md`
- `analysis/documentation/phase-8/rhi-091-live-fill-command-checklist-2026-03-21.md`
- `analysis/documentation/phase-8/rhi-091-wsh-rc-v3-scope-isolation-2026-03-21.md`
- `LAUNCH-GATE-PASS-SUMMARY.md`
- `CUTOVER-VERIFICATION-CHECKLIST.md`
- `migration/phase-8-go-nogo-decision.md`
- `analysis/tickets/phase-8/RHI-091-operational-readiness-go-nogo.md`

## 2026-03-22 Execution Update

### Change summary

The clean rerun path was executed against an isolated `phase-8-rc-v3` tag, but two follow-up corrections were required during the live evidence run.

### Why this changed

The first isolated RC v3 rerun was invalidated because the refreshed validation datasets had been generated before a Hugo production build existed for the isolated candidate. That produced a homepage-only `sample-matrix.json`, which in turn failed the performance gate. After rebuilding the isolated candidate against a temp production output, the corrected RC v3 rerun passed the build and blocking gate suite.

### Behavior details

Previous behavior:

- The closeout plan assumed dataset regeneration could happen immediately after the isolated RC files were staged.
- It also assumed the committed sample-matrix file could be used directly for final frozen-RC WS-H report regeneration.

New behavior:

- RC dataset regeneration must be run against an actual Hugo production output, even for an isolated RC candidate, or the deterministic sample matrix can collapse to homepage-only selections.
- The committed RC dataset files remain one commit behind the final tag by construction because the dataset refresh itself produces the next commit. To generate final WS-H `frozen-rc` reports, use a tag-aligned external sample-matrix snapshot whose `rc.commit` matches the final RC tag commit during report execution.

### Impact

- The corrected RC v3 build and gate suite were first proven by `workflow_dispatch` run `23397825399` on `phase-8-rc-v3@576709fd6217653446e8c8e031ebad705668c36e`.
- The WS-H production and preview reports can now be generated with `provenanceStatus: frozen-rc`.
- The failed deploy was traced to a `github-pages` environment protection rule that allowed only `main`. Adding a matching `phase-8-rc-v3` tag policy and rerunning as `23398112474` produced the final successful build-plus-deploy evidence basis used for sign-off.

### Verification

1. Confirm the superseded rerun `23397686845` failed at `check-performance-budget` with `sample-matrix is missing the required article selection`.
2. Confirm corrected tag `phase-8-rc-v3` points to `576709fd6217653446e8c8e031ebad705668c36e`.
3. Confirm corrected rerun `23397825399` shows build success and deploy failure caused by the `github-pages` environment tag restriction.
4. Confirm final rerun `23398112474` shows both build and deploy success.
5. Confirm `validation/production-host-smoke-report.json` and `validation/preview-launch-readiness-report.json` both show `provenanceStatus: "frozen-rc"` and `matchesDatasetRc: true`.

### Related files

- `migration/phase-8-rc-v3-record.md`
- `migration/phase-8-exception-register.md`
- `validation/sample-matrix.json`
- `validation/runs/phase-8-rc-v3-sample-matrix.json`
- `validation/priority-routes.json`
- `validation/expected-url-outcomes.json`
- `validation/preview-launch-readiness-report.json`
- `validation/production-host-smoke-report.json`
- `migration/phase-8-smoke-test-results.md`
- `LAUNCH-GATE-PASS-SUMMARY.md`