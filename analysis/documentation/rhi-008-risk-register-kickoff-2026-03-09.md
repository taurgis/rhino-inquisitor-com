# RHI-008 Risk Register Kickoff - 2026-03-09

## Change summary

Completed Phase 1 ticket RHI-008 by creating the governed baseline artifact `migration/risk-register.md`, recording owner acceptance, moving the ticket to `Done`, and synchronizing the Phase 1 index status.

## Why this changed

Phase 1 required a reviewed, owner-assigned risk register before Phase 2 sign-off. The repository had completed the discovery, policy, and URL-classification inputs needed to draft the register, but the risk artifact itself did not yet exist.

## Behavior details

Old behavior:
- No append-only risk register existed under `migration/`.
- RHI-008 was still marked `Open`, so the Phase 1 index did not reflect active work on the required risk artifact.
- Risk evidence from RHI-002, RHI-003, and RHI-004 was spread across tickets and migration artifacts.

New behavior:
- `migration/risk-register.md` now exists as the authoritative Phase 1 risk register draft with all six mandatory Workstream 7 risks and additional risks discovered from upstream Phase 1 evidence.
- The new register uses a consistent table structure with required fields for each risk and includes append-only update rules, a review section, and a revision log.
- RHI-008 is now `Done` in both the ticket file and the Phase 1 index.
- Migration Owner, SEO Owner, and final acceptance for remaining risk ownership are recorded to Thomas Theunen in the review section and ticket Progress Log.
- The risk register is now the accepted Phase 1 baseline artifact for Phase 2 planning rather than a draft pending closure.

## Impact

- Maintainers now have a single governed location for launch-critical migration risks instead of needing to infer them from multiple upstream tickets.
- Phase 1 tracking now accurately shows that the risk-register workstream is complete.
- Phase 2 planning can now reference an accepted baseline risk set immediately.

## Verification

- Confirm `migration/risk-register.md` exists and includes all six baseline Workstream 7 risks plus additional risks from RHI-002, RHI-003, and RHI-004.
- Confirm each risk row contains `id`, `description`, `impact`, `likelihood`, `owner`, `mitigation`, `trigger`, `contingency`, and `status`.
- Confirm `analysis/tickets/phase-1/RHI-008-risk-register.md` and `analysis/tickets/phase-1/INDEX.md` both show RHI-008 as `Done`.
- Confirm Thomas Theunen is recorded as the accepting reviewer and final owner decision for the risk register closure.

## Related files

- `migration/risk-register.md`
- `analysis/tickets/phase-1/RHI-008-risk-register.md`
- `analysis/tickets/phase-1/INDEX.md`