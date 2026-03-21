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