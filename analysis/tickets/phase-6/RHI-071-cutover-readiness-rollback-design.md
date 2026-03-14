## RHI-071 · Workstream I — Cutover Readiness and Rollback Design

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 6  
**Assigned to:** Migration Owner  
**Target date:** 2026-05-16  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Confirm that the redirect map and architecture are ready for launch-window execution, produce operational runbooks for cutover and rollback that a non-author can execute under pressure, and validate that rollback is feasible by running at least one rollback drill before the launch window. Establish monitoring expectations for the first 14 days post-cutover.

Cutover is the highest-risk moment of the migration. A well-designed redirect strategy that is never drilled and has no clear rollback path creates a false sense of security. This workstream converts Phase 6 technical work into operational readiness — the difference between "we believe the redirects work" and "we have executed and validated the cutover process end-to-end."

---

### Acceptance Criteria

- [ ] All Phase 6 mandatory CI gates are green on the latest `main` branch build (as verified by WS-H: RHI-070):
  - [ ] `npm run validate:url-inventory` passes
  - [ ] `npm run check:url-parity` passes
  - [ ] `npm run check:redirect-targets` passes
  - [ ] `npm run check:redirect-chains` passes
  - [ ] `npm run check:canonical-alignment` passes
  - [ ] `npm run check:retirement-policy` passes
  - [ ] `npm run check:host-protocol` passes
  - [ ] `npm run check:redirect-security` passes
- [ ] Redirect map frozen and version-tagged:
  - [ ] `migration/url-manifest.json` is in its final form for launch window
  - [ ] `migration/url-map.csv` is in its final form
  - [ ] A git tag is applied to the final redirect-map commit (e.g., `phase-6-redirect-map-v1`)
  - [ ] Version tag is recorded in `migration/phase-6-cutover-runbook.md`
- [ ] Critical route manual verification complete:
  - [ ] Top 50 traffic legacy URLs manually checked (from Phase 1 SEO baseline)
  - [ ] Top 50 backlink legacy URLs manually checked (from Phase 1 SEO baseline)
  - [ ] All critical legal/system routes verified: `/privacy-policy/`, `/feed/`, `/robots.txt`, `/sitemap.xml`, `/404`
  - [ ] Host/protocol variants checked for core templates: HTTP apex, HTTPS apex, HTTP www, HTTPS www
  - [ ] Manual check results documented in `migration/phase-6-cutover-runbook.md` verification section
- [ ] Search Console continuity confirmed:
  - [ ] Ownership verified for all registered host/protocol property variants (confirmed in WS-D: RHI-066)
  - [ ] Old-URL sitemap can be retained alongside new sitemap during transition period (plan documented)
  - [ ] Sitemap submission plan: post-cutover submission uses only final canonical sitemap URLs
- [ ] `migration/phase-6-cutover-runbook.md` is complete and committed:
  - [ ] T-7 to T-3 pre-launch checklist (freeze, automated gate suite, manual sampling)
  - [ ] T-2 to T-1 checklist (runbook finalization, hotfix patch pre-staging)
  - [ ] T0 cutover steps (deploy candidate, smoke verification for priority legacy URLs, sitemap submission)
  - [ ] T+1 to T+14 post-launch monitoring cadence (daily review, 404/soft-404, canonical anomalies)
  - [ ] Named owner for each cutover step
  - [ ] Rollback trigger thresholds (per non-negotiable constraints from RHI-061)
  - [ ] Rollback options and execution steps
- [ ] `migration/phase-6-rollback-runbook.md` is complete and committed:
  - [ ] Rollback trigger criteria: >5 priority URL failures, >2% priority-route sample failing in 24 hours, critical route class failure
  - [ ] Rollback option 1: re-enable previous site (if operationally available)
  - [ ] Rollback option 2: emergency redirect map patch (priority set only)
  - [ ] Rollback option 3: edge override rules while static build is repaired (only if Model B is active)
  - [ ] Decision tree: which rollback option applies to which scenario
  - [ ] Execution time estimate for each rollback option
  - [ ] Communication path: who is notified, in what order, in what channel
  - [ ] Named owner for rollback authorization
- [ ] Rollback drill executed at least once:
  - [ ] Drill scenario documented (simulated priority URL failure)
  - [ ] Rollback option 2 (emergency patch) walked through in staging or pre-production process
  - [ ] Drill outcome documented in Progress Log: time-to-patch, blockers discovered, action items
- [ ] Internal link update plan documented:
  - [ ] Confirm all internal links in Hugo content files point to final destination URLs (not legacy redirect sources)
  - [ ] Any internal link still pointing to a redirect source identified as a known deviation with a plan
- [ ] Phase 7 and Phase 8 have been notified that Phase 6 cutover readiness is confirmed

---

### Tasks

- [ ] Confirm all Phase 6 CI gates pass on latest `main` build (run full gate suite; record Actions run URL)
- [ ] Freeze redirect map:
  - [ ] Verify `migration/url-manifest.json` and `migration/url-map.csv` are in final state
  - [ ] Apply git tag `phase-6-redirect-map-v1` to the commit
  - [ ] Record tag SHA in Progress Log and cutover runbook
- [ ] Execute critical route manual verification:
  - [ ] Pull top 50 traffic URLs and top 50 backlink URLs from Phase 1 baseline
  - [ ] Run `scripts/phase-6/check-redirect-targets.js` on this subset for automated verification
  - [ ] Manually verify outcomes in browser or via HTTP tool for the top 20 priority routes
  - [ ] Document results in cutover runbook verification table
- [ ] Confirm Search Console property ownership and note any gaps
- [ ] Draft and commit `migration/phase-6-cutover-runbook.md` (full structure per Acceptance Criteria)
- [ ] Draft and commit `migration/phase-6-rollback-runbook.md` (full structure per Acceptance Criteria)
- [ ] Execute rollback drill:
  - [ ] Pick a simulated scenario (e.g., top-5 priority URL returning unexpected destination)
  - [ ] Walk through emergency patch process (modify `migration/url-manifest.json` on a branch, apply aliases, rebuild)
  - [ ] Measure time-to-patch
  - [ ] Document blockers and resolutions in Progress Log
- [ ] Confirm all internal links in content files use canonical destination URLs:
  - [ ] Run `linkinator` or equivalent against production build
  - [ ] Document any residual legacy redirect sources found in internal links
- [ ] Notify Phase 7 (deployment and DNS cutover: RHI-073+) that Phase 6 is complete
- [ ] Notify Phase 8 (validation and launch readiness: RHI-083+) that Phase 6 CI gates are integrated and passing
- [ ] Record all notifications in Progress Log

---

### Out of Scope

- DNS record execution at the registrar (Phase 7)
- Full launch smoke test and validation suite (Phase 8)
- Post-launch monitoring execution beyond the first 14-day runbook (Phase 9)
- Making changes to redirect mappings after the freeze (hotfix process only, requiring migration owner approval)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-070 Done — all Phase 6 CI gates integrated and passing | Ticket | Pending |
| RHI-062 Done — architecture decision (determines rollback options available) | Ticket | Pending |
| RHI-066 Done — repository host/protocol controls complete; Search Console domain ownership confirmed; runtime variant verification deferred to cutover | Ticket | Done |
| RHI-068 Done — security sign-off recorded | Ticket | Pending |
| RHI-069 Done — pre-launch reports (coverage, chains, canonical alignment) all clean | Ticket | Pending |
| Migration owner, SEO owner, and engineering owner available for drill and sign-off | Access | Pending |
| Phase 7 and Phase 8 teams available to receive handover notification | Access | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Rollback drill reveals that the rollback process takes longer than acceptable (>2 hours) | Medium | High | Document time constraint at start of drill planning; if estimated time exceeds 2 hours, redesign the priority-URL hotfix patch set to be smaller and faster to apply | Engineering Owner |
| Critical route manual verification discovers unexpected redirect failures at this late stage | Low | High | Any failure found at this stage triggers an immediate return to WS-C (RHI-065); do not bypass fixes and proceed to sign-off | Migration Owner |
| Internal link audit finds high volume of residual legacy redirect source links | Medium | Medium | Coordinate with Phase 4 owner (RHI-038); internal link rewrites are Phase 4 scope, but if not complete, Phase 6 must document the gap and the monitoring consequence | Engineering Owner |
| Phase 7 or Phase 8 teams unavailable to acknowledge handover | Low | Medium | Notify Phase 7/8 by Day 1 of WS-I; confirm acknowledgement before sign-off is scheduled | Migration Owner |

---

### Definition of Done

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- `migration/phase-6-cutover-runbook.md` — complete with pre-launch checklist, T0 steps, and post-launch monitoring
- `migration/phase-6-rollback-runbook.md` — complete with trigger criteria, options, and execution steps
- Git tag `phase-6-redirect-map-v1` applied to final redirect map commit
- Rollback drill outcome documented in Progress Log
- Phase 7 and Phase 8 notification recorded in Progress Log

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- The rollback drill is not optional. "We have a rollback plan" and "we have drilled the rollback plan" are categorically different levels of readiness. The drill must be executed and documented; if it reveals problems, those problems must be fixed before the launch window.
- The cutover runbook must be executable by any team member with repository access — not only the original engineer who built the redirect implementation. Write it for the 3 AM incident, not for the comfortable Monday morning demo.
- The redirect map freeze with a git tag is important: it creates an immutable reference point for the launch state. Any post-launch hotfix must be applied as a new commit on top of the tagged state, not by modifying the tagged commit.
- "Keep old-URL sitemap during transition" means: do not immediately remove the old WordPress sitemap from Search Console. During the transition period, old-URL-based sitemap entries generate "redirect" warnings in Search Console — this is expected and not an error. The Phase 9 monitoring runbook should note this and define when to remove old sitemaps (typically when the coverage report shows full migration to new canonical URLs).
- Reference: `analysis/plan/details/phase-6.md` §Workstream I, §Launch-Window Execution Plan, §Rollback Design
