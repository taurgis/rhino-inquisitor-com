# RHI-092 Sign-off Closeout and Archival Policy Decision

## Change summary

RHI-092 was closed by applying the owner-approved archival interpretation for deterministic Phase 8 datasets: generated validation reports remain archived in CI artifacts with 30-day retention, while deterministic input datasets are preserved in Git as immutable RC evidence inputs.

## Why this changed

The original RHI-092 wording implied every listed validation artifact must be retained in CI artifacts for 30 days, including deterministic inputs (`validation/expected-url-outcomes.json`, `validation/sample-matrix.json`, `validation/priority-routes.json`).

During closeout, this created ambiguity because these three files are controlled source artifacts, not per-run generated reports.

The owner selected Option 1 to resolve the ambiguity and allow closeout:

1. Generated report outputs remain CI-archived for 30 days.
2. Deterministic input datasets are retained in Git and referenced from sign-off documentation.

## Behavior details

### Previous behavior

- RHI-092 remained open with a closeout blocker for deterministic dataset archival interpretation.
- Ticket wording suggested all listed files needed CI artifact retention, without differentiating report outputs from deterministic inputs.

### New behavior

- RHI-092 is marked Done.
- Acceptance criteria and task text now explicitly follow the archival policy split:
  - Generated reports: CI artifact retention policy.
  - Deterministic datasets: Git-preserved evidence inputs.
- Final sign-off package references the immutable `phase-8-signoff` tag and RC v3 evidence basis.

## Impact and verification

Impacted workflows:

1. Phase 8 ticket closeout and sign-off traceability.
2. Phase 9 bootstrap dependency checks that rely on Phase 8 completion evidence.

Verification performed:

1. Confirmed `analysis/tickets/phase-8/RHI-092-phase-8-signoff.md` has all acceptance criteria and DoD items checked.
2. Confirmed `migration/phase-8-signoff.md` documents the archival split and final sign-off tag.
3. Confirmed phase ticket indexes report Phase 8 and RHI-092 as Done.
4. Confirmed `phase-8-signoff` annotated tag points to commit `576709fd6217653446e8c8e031ebad705668c36e`.

## Related files

- `analysis/tickets/phase-8/RHI-092-phase-8-signoff.md`
- `analysis/tickets/phase-8/INDEX.md`
- `analysis/tickets/INDEX.md`
- `migration/phase-8-signoff.md`
- `analysis/tickets/phase-9/RHI-093-phase-9-bootstrap.md`
