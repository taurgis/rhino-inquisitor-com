# RHI-081 Incident Response And Rollback Preparation

## Change summary

Added the initial Phase 7 staging rollback runbook and incident log template, normalized the authoritative rollback artifact path to `migration/phase-7-staging-rollback-runbook.md`, and reconciled rollback guidance with the current GitHub Pages workflow behavior.

Updated on 2026-03-19 to record the owner-confirmed WordPress rollback-readiness state, the completed Option A and Option B dry runs, the rollback-runbook review, and the final formal sign-off under the repository single-owner governance model.

## Why this changed

RHI-080 closed with a staging launch runbook that already handed incident escalation off to a staging-specific rollback artifact, but RHI-081 and several downstream tickets still referenced a generic Phase 7 rollback filename. The repository also needed operator-ready rollback guidance that reflects the actual Pages workflow shape, artifact-mode caveats, and current external evidence gaps.

## Behavior details

### Old behavior

- No Phase 7 staging rollback runbook or incident log template was committed.
- RHI-081, the Phase 7 index, and downstream Phase 8 and Phase 9 tickets referenced a generic Phase 7 rollback filename, while the staging launch runbook already referenced `migration/phase-7-staging-rollback-runbook.md`.
- Existing rollback guidance in `docs/migration/RUNBOOK.md` implied a 7-day rollback artifact window, which did not distinguish between the deployable Pages artifact and the separate 7-day audit-artifact retention used elsewhere in CI.

### New behavior

- `migration/phase-7-staging-rollback-runbook.md` now defines objective rollback triggers, Option A/B/C procedures, owner authorization, MTTR objectives, notification text, and rollback deactivation criteria.
- `migration/phase-7-incident-log.md` now provides the required Phase 7 incident-log template.
- RHI-081 and downstream ticket references now use the staging-specific rollback runbook path consistently.
- Rollback documentation now reflects the current deploy workflow shape: Phase 7 redeploys restore the Pages-served artifact path, while the production-validation build remains a separate archived output.
- The prior external evidence gaps are now closed: WordPress rollback-readiness plus the Option A and Option B rehearsals are documented, and formal owner sign-off is recorded.

## Impact

- Affects Phase 7 through Phase 9 operational documentation only.
- Removes path ambiguity before future rehearsal and sign-off work depends on the rollback artifact.
- Prevents maintainers from assuming that 7-day audit artifact retention automatically means the deployable Pages artifact is still available for a fast redeploy.
- Captures that the previous WordPress stack remains the documented rollback target during the stabilization window and that both the Pages redeploy path and the DNS revert procedure have been dry-run rehearsed.
- Establishes the rollback package as complete for Phase 7 by recording formal sign-off for the migration owner, SEO owner, and engineering owner roles under the single-owner model.
- Does not change deployed site behavior, DNS state, or GitHub Actions workflow logic.

## Verification

1. Confirm `migration/phase-7-staging-rollback-runbook.md` and `migration/phase-7-incident-log.md` exist and cover the acceptance-criteria sections needed for RHI-081.
2. Search the repository for the old generic rollback filename and confirm Phase 7 through Phase 9 references now point at `migration/phase-7-staging-rollback-runbook.md` where applicable.
3. Review `.github/workflows/deploy-pages.yml`, `src/layouts/robots.txt`, and `src/layouts/partials/seo/resolve.html` against the runbook wording to confirm the rollback guidance matches the current Pages artifact and crawl-control behavior.
4. Confirm the rollback runbook records the owner-confirmed WordPress rollback-readiness state, the completed Option A and Option B rehearsals, and the final sign-off record.

## Related files

- `migration/phase-7-staging-rollback-runbook.md`
- `migration/phase-7-incident-log.md`
- `analysis/tickets/phase-7/RHI-081-incident-response-rollback.md`
- `analysis/tickets/phase-7/INDEX.md`
- `analysis/tickets/phase-8/RHI-083-phase-8-bootstrap.md`
- `analysis/tickets/phase-8/RHI-091-operational-readiness-go-nogo.md`
- `analysis/tickets/phase-8/RHI-092-phase-8-signoff.md`
- `analysis/tickets/phase-9/RHI-094-cutover-execution-immediate-verification.md`
- `analysis/tickets/phase-9/RHI-097-incident-detection-triage-recovery.md`
- `docs/migration/RUNBOOK.md`