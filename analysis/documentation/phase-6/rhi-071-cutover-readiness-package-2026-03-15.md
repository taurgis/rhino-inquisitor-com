# RHI-071 Cutover Readiness And Rollback Package

## Change summary

RHI-071 now has the repository-controlled operational package that was still missing after RHI-069 and RHI-070: the seeded cutover runbook has been expanded into a full launch-window procedure, a dedicated rollback runbook now exists, the ticket has been updated to reflect the approved Model A rollback boundary, and the repository now contains documented rollback-drill evidence instead of a hypothetical drill requirement.

## Why this changed

Before this update, the repository had strong Phase 6 validators and a monitoring-only cutover runbook section, but it did not yet have the operator-ready handoff that converts those checks into launch execution.

Old behavior:

1. `migration/phase-6-cutover-runbook.md` only covered the RHI-069 monitoring cadence and explicitly reserved freeze, T0 execution, verification logs, and rollback for RHI-071.
2. There was no `migration/phase-6-rollback-runbook.md` artifact.
3. RHI-071 still carried a Model B-only edge override rollback bullet even though Phase 6 had already committed to Model A in the ADR and Phase 6 index.
4. The ticket did not yet record a real rollback drill outcome or the practical caveat discovered during drill execution.

New behavior:

1. `migration/phase-6-cutover-runbook.md` now contains the full prelaunch, T0, and T+14 operating procedure for the Model A stack, including owners, sample sets, host/protocol validation, Search Console continuity steps, and the internal-link deviation plan.
2. `migration/phase-6-rollback-runbook.md` now defines rollback triggers, authority, decision tree, realistic Model A rollback options, execution steps, and incident-evidence expectations.
3. RHI-071 now records that edge override rollback is unavailable under the current Model A posture unless the architecture changes first.
4. The ticket and rollback runbook now include a 2026-03-15 emergency alias drill that proved the repair path and documented the clean-build requirement needed to avoid stale alias helpers in `public/`.

## Impact

1. Maintainers now have a concrete Phase 6 launch and rollback playbook instead of a monitoring-only stub.
2. The repository now distinguishes clearly between repo-verifiable readiness and live cutover evidence that still depends on the custom domain, GitHub Pages settings, DNS, and Search Console.
3. The rollback plan now matches the approved architecture instead of implying an unavailable edge-layer capability.
4. Downstream Phase 7 and Phase 8 work can consume a real handoff package even though final RHI-071 closure still depends on live-window evidence.

## Verification

Repository-controlled verification completed on 2026-03-15:

```bash
npm run build:prod && npm run validate:url-inventory && npm run check:url-parity && npm run check:redirect-targets && npm run check:redirect-chains && npm run check:canonical-alignment && npm run check:retirement-policy && npm run check:host-protocol && npm run check:redirect-security
npm run check:links && npm run check:internal-links
```

Observed results:

1. The production build succeeded with `Pages 206` and `Aliases 17`.
2. All mandatory Phase 6 gate commands passed locally on commit `3f29de0ccfb587956ea405813dd27426edf98f61`.
3. Link audits reported `0` blocking findings and `20` warnings, which are now classified in the cutover runbook.
4. The rollback drill succeeded for the simulated broken alias on `/how-to-set-up-the-ecdn-for-staging-in-salesforce-b2c-commerce-cloud/` and documented a clean-build requirement for alias validation.

## Remaining open items

This change does not close RHI-071 by itself. The following still require live evidence:

1. Live host/protocol verification on the production custom domain.
2. Manual critical-route verification against the real cutover candidate, including the owner-approved top linked legacy URL exception set.
3. Final confirmed-readiness handoff after the live runtime blockers clear.

Redirect-map freeze update recorded on 2026-03-15:

1. Local annotated tag `phase-6-redirect-map-v1` now points to commit `3f29de0ccfb587956ea405813dd27426edf98f61`.
2. `migration/url-manifest.json` and `migration/url-map.csv` had no additional local changes beyond that tagged commit at the time of tagging.
3. The tag was pushed to `origin` on 2026-03-15.

Live runtime evidence recorded on 2026-03-15:

1. The current public apex host still terminates at `https://rhino-inquisitor.com/` instead of consolidating to `https://www.rhino-inquisitor.com/`.
2. `https://www.rhino-inquisitor.com/sitemap.xml` still resolves to the legacy `sitemap_index.xml` endpoint.
3. `https://www.rhino-inquisitor.com/category/release-notes/` still emits canonical `https://www.rhino-inquisitor.com/category/salesforce-commerce-cloud/release-notes/`.
4. Those runtime results confirm that the live public host is not yet in the final Hugo cutover state, so RHI-071 cannot be closed from repository and runtime evidence combined yet.

Staging rehearsal evidence recorded on 2026-03-15:

1. `https://staging.rhino-inquisitor.com` passed the top 50 traffic sample `50/50` and the owner-approved top linked sample effectively `20/20` (`19` direct passes plus one legacy nested category alias resolving to the flattened category target).
2. `/privacy-policy/`, `/feed/`, `/robots.txt`, `/sitemap.xml`, and `/404/` were reachable on staging, and an unknown control route returned HTTP `404`.
3. Representative staging pages were self-canonical on the staging host and emitted `noindex, nofollow`, which is the expected preview-host behavior.
4. Staging verified the cutover candidate quality, but it still does not satisfy the production-only host/protocol acceptance criteria because `www.staging.rhino-inquisitor.com` is not provisioned and staging cannot prove the final production canonical host behavior.
5. The specific RHI-071 sub-check for the top 50 traffic legacy URLs can therefore be treated as complete for staging rehearsal evidence, while the parent manual-verification acceptance criterion remains open for production confirmation.
6. The owner-approved top linked sample, the critical legal/system route set, and the runbook documentation sub-checks can also be treated as complete for staging rehearsal evidence, while the four-variant host/protocol matrix remains production-only final evidence.

Owner decisions recorded on 2026-03-15:

1. Search Console is accepted as ready and validated.
2. The committed top-20 Search Console links baseline is accepted as the current backlink verification exception in place of a literal top-50 backlink list.
3. Advisory Phase 7 and Phase 8 handoff is approved now, while formal confirmed-readiness handoff remains deferred until the live runtime blockers clear.

## Related files

1. `analysis/tickets/phase-6/RHI-071-cutover-readiness-rollback-design.md`
2. `analysis/tickets/phase-6/INDEX.md`
3. `migration/phase-6-cutover-runbook.md`
4. `migration/phase-6-rollback-runbook.md`
5. `migration/phase-1-seo-baseline.md`
6. `migration/phase-5-monitoring-runbook.md`
7. `.github/workflows/deploy-pages.yml`