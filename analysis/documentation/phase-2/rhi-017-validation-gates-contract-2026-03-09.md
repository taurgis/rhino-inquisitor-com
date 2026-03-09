# RHI-017 Validation Gates Contract - 2026-03-09

## Change summary

Finalized Phase 2 ticket RHI-017 by converting the draft validation-gates list into an implementation-ready contract for seven gates, each with binary pass criteria, blocking level, implementation phase, evidence output, and upstream contract traceability.

## Why this changed

RHI-017 was still too abstract for Phase 3 engineering work and too vague for Phase 8 launch sign-off. Without a stricter contract, Phase 3 would have had to reinterpret gate scope, tool choice, and evidence expectations, and Phase 8 would have lacked a consistent audit trail across release-candidate runs.

## Behavior details

Old behavior:

- RHI-017 named the seven gates but left several key items implied rather than fixed: blocking level, evidence outputs, live-state versus CI-only scope, and the Gate 4 tool decision.
- Gate 1 and Gate 2 did not cleanly distinguish artifact-level Pages checks from live edge-routing checks.
- Gate 6 treated custom-domain confirmation as part of deployment integrity without explicitly separating repository-state validation from external Pages-settings state.
- The tightened validation checklist in the Phase 2 plan was not mapped to gates and evidence artifacts.

New behavior:

- Every gate now has a fixed contract covering what it checks, exact pass criteria, fail consequence, implementation phase, execution frequency, named entry point or tool, blocking level, evidence artifact, and upstream Phase 2 contract references.
- Gate 4 now explicitly uses a custom Node validator so Phase 3 does not reopen dependency selection.
- Gate 6 now separates CI-static workflow and artifact validation from the live Pages-settings checks that must run before DNS cutover.
- Gate 7 is now the explicit launch-only live sign-off gate for items that repository-state validation cannot prove on its own.
- The tightened validation checklist from the Phase 2 plan is now mapped to gates and evidence, which makes later release reviews auditable.

## Impact

- Phase 3 can scaffold CI and validation scripts against a fixed contract instead of re-deciding gate semantics.
- Phase 7 and Phase 8 now have named evidence outputs to request and review during release-candidate and launch sign-off.
- Downstream tickets can distinguish CI-blocking checks from launch-only live checks, which reduces false expectations about what GitHub Pages and Hugo can prove from repository state alone.

## Verification

- Reconciled the ticket against approved contracts RHI-011, RHI-012, RHI-013, RHI-014, RHI-015, and RHI-016.
- Cross-checked GitHub Pages custom workflow, custom-domain, HTTPS, and Hugo URL, sitemap, robots, and RSS behavior against official documentation already incorporated in the task.
- Synced the Phase 2 plan summary and ticket index to the completed RHI-017 state and updated Phase 2 sign-off prerequisites to reflect the new ticket status.

## Related files

- analysis/tickets/phase-2/RHI-017-validation-gates-contract.md
- analysis/plan/details/phase-2.md
- analysis/tickets/phase-2/INDEX.md
- analysis/tickets/phase-2/RHI-018-phase-2-signoff.md