# RHI-080 Staging Launch Runbook Alignment

## Change summary

Aligned RHI-080 to the repository's staging-first Phase 7 contract, committed the staging launch runbook at `migration/phase-7-staging-launch-runbook.md`, and normalized the affected ticket, index, and phase-plan references to the same staging artifact.

## Why this changed

RHI-080 already described a staging cutover execution runbook in its ticket body, but several indexes and downstream references still described it as a production cutover ticket and pointed at the stale path `migration/phase-7-launch-runbook.md`. That inconsistency created ambiguous requirements, a circular prerequisite with RHI-081, and an unreliable closeout contract.

## Behavior details

### Old behavior

1. The RHI-080 ticket mixed staging and production wording.
2. The ticket body required `migration/phase-7-staging-launch-runbook.md`, but tasks, outcomes, and indexes still referenced `migration/phase-7-launch-runbook.md`.
3. Workstream G in the Phase 7 plan still described the live production cutover sequence.
4. RHI-080 tasks incorrectly treated RHI-081 as a prerequisite even though RHI-081 depends on RHI-080.

### New behavior

1. RHI-080 is now explicitly a staging cutover execution ticket end to end.
2. `migration/phase-7-staging-launch-runbook.md` is now the authoritative Workstream G runbook artifact.
3. The staging runbook documents exact smoke-test URLs, operator roles, DNS and HTTPS checks, escalation paths, and production handoff notes.
4. The Phase 7 detail plan now treats staging custom-domain cutover as the Phase 7 proof point and reserves live production cutover for the later production execution ticket.
5. Downstream references that depended on the stale runbook path now reference the validated staging template instead.

## Impact

1. Affects Phase 7 and immediate downstream planning artifacts only.
2. Removes ambiguity from RHI-080 closeout and unblocks clean handoff to RHI-081 and later production planning.
3. Preserves the repository's staging-first launch-safety posture.
4. Does not change runtime site behavior, deploy workflow logic, canonical output, or DNS settings directly.

## Verification

1. Confirm `analysis/tickets/phase-7/RHI-080-launch-window-execution-runbook.md` uses staging-only scope and references only `migration/phase-7-staging-launch-runbook.md`.
2. Confirm `analysis/tickets/phase-7/INDEX.md` and `analysis/tickets/INDEX.md` label RHI-080 as `Staging Cutover Execution Runbook`.
3. Confirm `analysis/plan/details/phase-7.md` Workstream G and Definition of Done describe staging cutover readiness rather than live production launch.
4. Confirm the staging runbook includes exact URLs for homepage, three recent posts, archive, three category routes, privacy policy, the legacy inbound sample, `robots.txt`, and `sitemap.xml`.
5. Confirm the recorded dry-run evidence URL remains `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23213150405`.

## Related files

1. `analysis/tickets/phase-7/RHI-080-launch-window-execution-runbook.md`
2. `analysis/tickets/phase-7/INDEX.md`
3. `analysis/tickets/INDEX.md`
4. `analysis/plan/details/phase-7.md`
5. `analysis/tickets/phase-8/RHI-083-phase-8-bootstrap.md`
6. `analysis/tickets/phase-9/RHI-094-cutover-execution-immediate-verification.md`
7. `migration/phase-7-staging-launch-runbook.md`