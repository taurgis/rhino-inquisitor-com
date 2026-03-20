# RHI-083 Phase 8 Bootstrap Scaffold and Contract Normalization

## Change summary

Started RHI-083 by turning the bootstrap contract into committed repository artefacts: the missing `validation/` scaffold now exists, the missing Phase 8 validation packages are installed and pinned in the workspace lockfile, `migration/phase-8-approver-roster.md` now exists as the owner-decision record for the bootstrap, and the Phase 8 ticket set now points at the actual Lighthouse CI config filename used by the repository.

## Why this changed

RHI-083 is the hard entry gate for Phase 8, but the repository was still missing the validation output tree that downstream workstreams expect, several required Phase 8 packages were not yet present in `package.json`, and the ticket set still mixed a stale Lighthouse CI config filename with implicit owner-acknowledgment and evidence-recording expectations. That made the bootstrap difficult to audit and left too much room for subjective completion.

## Behavior details

### Previous behavior

- `validation/` did not exist, so RHI-083 could not prove that downstream reports had stable, pre-created destinations.
- `@axe-core/playwright`, `ajv`, and `linkinator` were listed as Phase 8 requirements but were not installed in the workspace.
- RHI-083 and nearby Phase 8 references still used `lighthouserc.js` even though the repo uses `lighthouserc.json`.
- The bootstrap ticket did not say where owner acknowledgments, backup contacts, and the go/no-go decision window should be recorded.

### New behavior

- `validation/` now contains committed placeholder report files, a manual accessibility checklist template, and README placeholders for `validation/lhci-report/`, `validation/report-schema/`, and `validation/runs/`.
- The workspace now includes `@axe-core/playwright`, `ajv`, and `linkinator` in the package manifest and lockfile, so the required Phase 8 toolchain is available in-repo.
- `migration/phase-8-approver-roster.md` now serves as the Phase 8 owner-decision record for primary roles, backup contacts, read confirmations, and the go/no-go window.
- RHI-083, the Phase 8 index, and the immediate WS-A ticket now use `lighthouserc.json` as the authoritative Lighthouse CI config filename.

## Impact

- Affects Phase 8 bootstrap execution, documentation, and downstream workstream readiness.
- Reduces ambiguity for RHI-084 through RHI-091 by giving them a stable validation file contract before their scripts exist.
- Does not close RHI-083 by itself. Owner confirmation is still required for the canonical RC ref, backup contacts, workstream-owner read confirmations, and the go/no-go decision window.

## Verification

1. Confirm `validation/README.md` exists and lists the committed placeholder reports and ownership expectations.
2. Confirm the placeholder report files named in RHI-083 exist under `validation/` and `validation/lhci-report/README.md` exists to hold the future LHCI output directory.
3. Confirm `migration/phase-8-approver-roster.md` exists and records the repository single-owner baseline plus the remaining owner-decision fields.
4. Confirm `package.json` and `package-lock.json` now include `@axe-core/playwright`, `ajv`, and `linkinator`.
5. Confirm `analysis/tickets/phase-8/RHI-083-phase-8-bootstrap.md`, `analysis/tickets/phase-8/INDEX.md`, and `analysis/tickets/phase-8/RHI-084-rc-freeze-validation-dataset.md` reference `lighthouserc.json`.

## Related files

- `analysis/tickets/phase-8/RHI-083-phase-8-bootstrap.md`
- `analysis/tickets/phase-8/RHI-084-rc-freeze-validation-dataset.md`
- `analysis/tickets/phase-8/INDEX.md`
- `analysis/tickets/INDEX.md`
- `migration/phase-8-approver-roster.md`
- `validation/README.md`
- `package.json`
- `package-lock.json`

## Assumptions and open questions

- The repository single-owner model remains the default until the user records delegated backups.
- The canonical Phase 8 RC is not final yet. The bootstrap currently documents candidate refs rather than assuming one.