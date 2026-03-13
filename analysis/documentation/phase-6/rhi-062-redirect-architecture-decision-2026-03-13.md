# RHI-062 Redirect Architecture Decision Update

Date: 2026-03-13
Ticket: `analysis/tickets/phase-6/RHI-062-redirect-architecture-decision.md`

## Change summary

Added the committed Phase 6 redirect architecture ADR at `migration/phase-6-redirect-architecture-decision.md`, closed RHI-062, and recorded a dated exception trail in the Phase 5 handoff artefacts because the final redirect posture no longer follows the previously frozen edge-mandatory baseline.

## Why this changed

RHI-062 is the hard gate before WS-C and WS-I can proceed. The repository already contained the trigger evidence and the GitHub Pages and Hugo platform constraints, but the actual architecture decision and owner sign-off were still missing. The owner chose Model A as the final launch posture and explicitly accepted that this overrides the earlier Phase 5 assumption that edge redirects were mandatory before launch.

## Behavior details

Old behavior:

- Phase 5 and Phase 6 planning treated Model B as the expected final posture because the measured redirect-change baseline exceeded the approved threshold.
- No committed ADR existed under `migration/` to capture the final model choice, rejected options, implementation boundary, and owner risk acceptance.
- The Phase 5 contract and sign-off summary did not yet contain any append-only note explaining a later exception to the edge-mandatory baseline.

New behavior:

- `migration/phase-6-redirect-architecture-decision.md` now records Model A as the accepted final posture by explicit owner exception.
- The ADR keeps the quantitative trigger evidence visible: `1212` total legacy URLs, `336` indexed URLs, `141` changed indexed URLs, and a `41.96%` change rate by the ticket formula.
- The ADR explicitly rejects Model B and hybrid despite the earlier recommendation, because the owner wants Hugo to remain the main system.
- The ADR records the accepted limitations of that choice, including the loss of true per-path HTTP `301`, `308`, and `410` semantics and the accepted risk for `525` query-string edge-owned rows plus `402` query-string retire rows that Hugo aliases cannot reproduce faithfully.
- `migration/phase-5-seo-contract.md` and `migration/phase-5-signoff.md` now include dated append-only addenda that preserve the historical baseline while recording that the final launch posture has changed by owner-approved exception.
- RHI-062 and the ticket indexes now show the ADR as `Done`.

## Impact

- WS-C now has an explicit decision record telling it to treat Hugo as the only committed redirect implementation surface for launch.
- WS-I now has an explicit decision record telling it not to assume an edge override layer exists for rollback or cutover handling.
- Future reviewers can see both the historical Phase 5 baseline and the later owner-approved exception, instead of inferring a silent policy change from downstream implementation work.

## Verification

- Verified `migration/url-manifest.json` still satisfies the ticket formula inputs and computed:
  - total legacy URLs = `1212`
  - indexed URLs = `336`
  - changed indexed URLs = `141`
  - change rate = `41.96%`
- Verified the effective Phase 5 redirect signal matrix split remains `541 edge-cdn`, `1 pages-static`, and `670 none`.
- Verified query-string edge-owned scope remains `525` rows, with `402` query-string retire rows in the redirect validation artefact.
- Added and completed `migration/phase-6-redirect-architecture-decision.md`.
- Appended dated exception notes to `migration/phase-5-seo-contract.md` and `migration/phase-5-signoff.md` instead of rewriting the original Phase 5 baseline.
- Updated the RHI-062 ticket and ticket indexes to `Done`.

## Related files

- `analysis/tickets/phase-6/RHI-062-redirect-architecture-decision.md`
- `analysis/tickets/phase-6/INDEX.md`
- `analysis/tickets/INDEX.md`
- `analysis/plan/details/phase-6.md`
- `migration/phase-6-redirect-architecture-decision.md`
- `migration/phase-5-seo-contract.md`
- `migration/phase-5-signoff.md`
- `migration/phase-5-redirect-signal-matrix.csv`
- `migration/reports/phase-5-redirect-validation.csv`
