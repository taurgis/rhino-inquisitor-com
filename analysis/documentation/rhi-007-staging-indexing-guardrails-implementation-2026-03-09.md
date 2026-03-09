# RHI-007 Staging and Indexing Guardrails - Implementation Note

## Change Summary

Documented and approved the Phase 1 staging index-control and DNS TTL readiness plan for RHI-007, including owner decisions, noindex mechanism, unblock checklist, and DNS evidence.

## Why This Changed

RHI-007 requires an explicit strategy to prevent staging indexing and reduce DNS cutover risk before production launch. Without this, duplicate indexing risk and long DNS propagation windows can increase launch and rollback impact.

## Behavior Details

### Previous Behavior

- RHI-007 ticket was open with planning tasks unchecked.
- No dedicated migration artifact existed for staging noindex and DNS TTL plan.
- No captured DNS baseline snapshot was recorded in ticket evidence.

### New Behavior

- RHI-007 now records owner decisions:
  - staging is used
  - staging host approach is GitHub Pages preview or separate staging site
  - planned cutover date is 2026-04-15
- Standalone migration plan added at migration/phase-1-staging-indexing-guardrails.md.
- Ticket now includes completed planning tasks, documented DNS evidence, and explicit runtime validation blockers deferred to Phase 3.

## Impact

- Maintainers now have a deterministic checklist for staging noindex controls and production unblock steps.
- Phase 7 cutover preparation has concrete TTL timing anchored to a cutover date.
- Remaining risk is isolated to runtime verification after staging deployment.

## Verification

Checks performed:
- Verified DNS record values and TTL from public resolvers 1.1.1.1 and 8.8.8.8.
- Updated RHI-007 acceptance/task state to match completed planning work.
- Confirmed migration artifact path and analysis documentation path exist.

Pending checks (blocked until Phase 3 staging deployment):
- Confirm noindex meta tag on all representative staging pages.
- Confirm no staging URLs appear in production Search Console property.

## Related Files

- analysis/tickets/phase-1/RHI-007-staging-indexing-guardrails.md
- migration/phase-1-staging-indexing-guardrails.md

## Assumptions and Open Questions

Assumptions:
- User acts as ticket owner for migration and SEO approvals.
- Staging implementation occurs in Phase 3 templates/workflows.

Open questions:
- None blocking for planning completion.
- Runtime verification remains open until staging environment is live.
