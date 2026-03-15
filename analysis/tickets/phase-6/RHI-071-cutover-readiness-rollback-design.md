## RHI-071 · Workstream I — Cutover Readiness and Rollback Design

**Status:** In Progress  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 6  
**Assigned to:** Migration Owner  
**Target date:** 2026-05-16  
**Created:** 2026-03-07  
**Updated:** 2026-03-15

---

### Goal

Confirm that the redirect map and architecture are ready for launch-window execution, produce operational runbooks for cutover and rollback that a non-author can execute under pressure, and validate that rollback is feasible by running at least one rollback drill before the launch window. Establish monitoring expectations for the first 14 days post-cutover.

Cutover is the highest-risk moment of the migration. A well-designed redirect strategy that is never drilled and has no clear rollback path creates a false sense of security. This workstream converts Phase 6 technical work into operational readiness — the difference between "we believe the redirects work" and "we have executed and validated the cutover process end-to-end."

---

### Acceptance Criteria

- [x] All Phase 6 mandatory CI gates are green on the latest `main` branch build (as verified by WS-H: RHI-070):
  - [x] `npm run validate:url-inventory` passes
  - [x] `npm run check:url-parity` passes
  - [x] `npm run check:redirect-targets` passes
  - [x] `npm run check:redirect-chains` passes
  - [x] `npm run check:canonical-alignment` passes
  - [x] `npm run check:retirement-policy` passes
  - [x] `npm run check:host-protocol` passes
  - [x] `npm run check:redirect-security` passes
- [x] Redirect map frozen and version-tagged:
  - [x] `migration/url-manifest.json` is in its final form for launch window
  - [x] `migration/url-map.csv` is in its final form
  - [x] A git tag is applied to the final redirect-map commit (e.g., `phase-6-redirect-map-v1`)
  - [x] Version tag is recorded in `migration/phase-6-cutover-runbook.md`
- [ ] Critical route manual verification complete:
  - [x] Staging rehearsal completed on `https://staging.rhino-inquisitor.com`, but final production confirmation remains pending
  - [x] Top 50 traffic legacy URLs manually checked on staging (from Phase 1 SEO baseline; `50/50` pass on `https://staging.rhino-inquisitor.com`)
  - [x] Owner-approved top linked legacy URL sample manually checked on staging (current accepted exception: committed top-20 Search Console links baseline replaces the literal top-50 backlink list unless a larger export is later supplied; effective `20/20` pass on `https://staging.rhino-inquisitor.com`)
  - [x] Critical legal/system routes verified on staging rehearsal: `/privacy-policy/`, `/feed/`, `/robots.txt`, `/sitemap.xml`, `/404`
  - [ ] Host/protocol variants checked for core templates: HTTP apex, HTTPS apex, HTTP www, HTTPS www (staging checked HTTP/HTTPS apex behavior, but `www.staging.rhino-inquisitor.com` is not provisioned; final production matrix remains pending)
  - [x] Manual staging check results documented in `migration/phase-6-cutover-runbook.md`; production verification log entries remain pending
- [x] Search Console continuity confirmed:
  - [x] Ownership verified for all registered host/protocol property variants (confirmed in WS-D: RHI-066)
  - [x] Old-URL sitemap can be retained alongside new sitemap during transition period (plan documented)
  - [x] Sitemap submission plan: post-cutover submission uses only final canonical sitemap URLs
- [x] `migration/phase-6-cutover-runbook.md` is complete and committed:
  - [x] T-7 to T-3 pre-launch checklist (freeze, automated gate suite, manual sampling)
  - [x] T-2 to T-1 checklist (runbook finalization, hotfix patch pre-staging)
  - [x] T0 cutover steps (deploy candidate, smoke verification for priority legacy URLs, sitemap submission)
  - [x] T+1 to T+14 post-launch monitoring cadence (daily review, 404/soft-404, canonical anomalies)
  - [x] Named owner for each cutover step
  - [x] Rollback trigger thresholds (per non-negotiable constraints from RHI-061)
  - [x] Rollback options and execution steps
- [x] `migration/phase-6-rollback-runbook.md` is complete and committed:
  - [x] Rollback trigger criteria: >5 priority URL failures, >2% priority-route sample failing in 24 hours, critical route class failure
  - [x] Rollback option 1: re-enable previous site (if operationally available)
  - [x] Rollback option 2: emergency redirect map patch (priority set only)
  - [x] Rollback option 3: edge override rules while static build is repaired (recorded as unavailable under the current Model A posture; executable only if Model B becomes active)
  - [x] Decision tree: which rollback option applies to which scenario
  - [x] Execution time estimate for each rollback option
  - [x] Communication path: who is notified, in what order, in what channel
  - [x] Named owner for rollback authorization
- [x] Rollback drill executed at least once:
  - [x] Drill scenario documented (simulated priority URL failure)
  - [x] Rollback option 2 (emergency patch) walked through in staging or pre-production process
  - [x] Drill outcome documented in Progress Log: time-to-patch, blockers discovered, action items
- [x] Internal link update plan documented:
  - [x] Confirm all internal links in Hugo content files point to final destination URLs (not legacy redirect sources)
  - [x] Any internal link still pointing to a redirect source identified as a known deviation with a plan
- [ ] Phase 7 and Phase 8 have been notified that Phase 6 cutover readiness is confirmed

---

### Tasks

- [x] Confirm all Phase 6 CI gates pass on latest `main` build (run full gate suite; record Actions run URL)
- [ ] Freeze redirect map:
  - [x] Verify `migration/url-manifest.json` and `migration/url-map.csv` are in final state
  - [x] Apply git tag `phase-6-redirect-map-v1` to the commit
  - [x] Record tag SHA in Progress Log and cutover runbook
- [ ] Execute critical route manual verification:
  - [x] Run staging rehearsal against `https://staging.rhino-inquisitor.com`
  - [x] Pull top 50 traffic URLs and the owner-approved top linked legacy URL sample from the available Search Console exports
  - [x] Verify the staging top 50 traffic sample via HTTP tool (`50/50` pass)
  - [x] Verify the staging owner-approved top linked sample via HTTP tool (`19` direct pass plus `1` alias-backed nested category path resolving to the flattened category target)
  - [x] Verify staging critical routes and unknown-route 404 control: `/privacy-policy/`, `/feed/`, `/robots.txt`, `/sitemap.xml`, `/404/`, and `/this-route-should-not-exist-rhi-071/`
  - [x] Capture representative staging browser evidence for homepage, privacy policy, article, flattened category, and alias-backed legacy article route
  - [ ] Run `scripts/phase-6/check-redirect-targets.js` on the final manual-verification subset if a subset-specific rerun is still required beyond the full gate pass already recorded
  - [ ] Re-run the manual verification set against the final production cutover candidate
  - [x] Document staging rehearsal results in `migration/phase-6-cutover-runbook.md`
- [x] Confirm Search Console property ownership and note any gaps
- [x] Draft and commit `migration/phase-6-cutover-runbook.md` (full structure per Acceptance Criteria)
- [x] Draft and commit `migration/phase-6-rollback-runbook.md` (full structure per Acceptance Criteria)
- [x] Execute rollback drill:
  - [x] Pick a simulated scenario (e.g., top-5 priority URL returning unexpected destination)
  - [x] Walk through emergency patch process (simulate a broken alias-backed priority route, repair the Hugo alias, rebuild from a clean destination, and re-run the Phase 6 alias checks)
  - [x] Measure time-to-patch
  - [x] Document blockers and resolutions in Progress Log
- [x] Confirm all internal links in content files use canonical destination URLs:
  - [x] Run `linkinator` or equivalent against production build
  - [x] Document any residual legacy redirect sources found in internal links
- [x] Record advisory Phase 7 handoff (deployment and DNS cutover: RHI-073+) with remaining live blockers
- [x] Record advisory Phase 8 handoff (validation and launch readiness: RHI-083+) with remaining live blockers
- [x] Record all notifications in Progress Log

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
| RHI-070 Done — all Phase 6 CI gates integrated and passing | Ticket | Done |
| RHI-062 Done — architecture decision (determines rollback options available) | Ticket | Done |
| RHI-066 Done — repository host/protocol controls complete; Search Console domain ownership confirmed; runtime variant verification deferred to cutover | Ticket | Done |
| RHI-068 Done — security sign-off recorded | Ticket | Done |
| RHI-069 Done — pre-launch reports (coverage, chains, canonical alignment) all clean | Ticket | Done |
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
| 2026-03-15 | In Progress | Completed the repo-controlled RHI-071 package: reran the production build plus all Phase 6 gate commands on commit `3f29de0`, expanded `migration/phase-6-cutover-runbook.md`, created `migration/phase-6-rollback-runbook.md`, documented the Search Console and internal-link execution plans, and executed a local emergency-patch drill against `/how-to-set-up-the-ecdn-for-staging-in-salesforce-b2c-commerce-cloud/`. The drill proved the alias repair path and exposed one operational caveat: alias-removal defects must be validated from a clean `public/` build because stale helper files can mask missing aliases. Remaining closure blockers: live host/protocol verification on the production custom domain, Search Console cutover evidence, confirmation of the top-50 backlink sample source, and Phase 7/8 notification records. |
| 2026-03-15 | In Progress | Applied local redirect-map freeze tag `phase-6-redirect-map-v1` to commit `3f29de0ccfb587956ea405813dd27426edf98f61` after confirming `migration/url-manifest.json` and `migration/url-map.csv` had no additional local changes beyond that commit. |
| 2026-03-15 | In Progress | Published `phase-6-redirect-map-v1` to `origin` and captured live runtime checks on the public domain. Current live evidence does not satisfy the remaining Phase 6 cutover-readiness checks: `http://rhino-inquisitor.com/` and `https://rhino-inquisitor.com/` both still terminate on the apex host instead of consolidating to `https://www.rhino-inquisitor.com/`, `https://www.rhino-inquisitor.com/sitemap.xml` still resolves to `https://www.rhino-inquisitor.com/sitemap_index.xml`, and `https://www.rhino-inquisitor.com/category/release-notes/` emits canonical `https://www.rhino-inquisitor.com/category/salesforce-commerce-cloud/release-notes/`. These results indicate the live public host is still serving the legacy runtime rather than the final Hugo cutover state. |
| 2026-03-15 | In Progress | Owner decisions applied: Search Console continuity is accepted as ready and validated, the committed top-20 Search Console links baseline is accepted as the current backlink-sample exception in place of a literal top-50 list, and advisory Phase 7/8 handoff records are approved now while formal confirmed-readiness handoff remains deferred until the live runtime blockers clear. |
| 2026-03-15 | In Progress | Re-ran the full mandatory Phase 6 gate bundle locally on `main` commit `3f29de0` and all commands passed: `build:prod`, `validate:url-inventory`, `check:url-parity`, `check:redirect-targets`, `check:redirect-chains`, `check:canonical-alignment`, `check:retirement-policy`, `check:host-protocol`, and `check:redirect-security`. Latest successful `Deploy to GitHub Pages` workflow run on `main` for the same commit is [actions run 23091859154](https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23091859154). |
| 2026-03-15 | In Progress | Executed a staging rehearsal of the critical-route manual verification set against `https://staging.rhino-inquisitor.com`. The top 50 traffic sample passed `50/50`, the owner-approved top linked sample passed effectively `20/20` (`19` direct passes plus one legacy nested category route resolving to the flattened category target), `/privacy-policy/`, `/feed/`, `/robots.txt`, `/sitemap.xml`, and `/404/` were reachable, and an unknown path returned HTTP `404`. Representative staging pages were self-canonical on the staging host with `noindex, nofollow`, `http://staging.rhino-inquisitor.com/` upgraded to HTTPS, and `www.staging.rhino-inquisitor.com` did not resolve. This rehearsal validates the staging candidate but does not close the production-only host/protocol and final confirmed-readiness acceptance criteria. |
| 2026-03-15 | In Progress | Closed the staging-specific top-50 traffic sub-check for RHI-071 based on the staging rehearsal evidence: the Phase 1 traffic sample passed `50/50` on `https://staging.rhino-inquisitor.com`. The broader manual-verification acceptance criterion remains open because the linked-sample, production host/protocol, and final production confirmation items are still pending. |
| 2026-03-15 | In Progress | Closed the remaining staging-backed manual-verification sub-checks for the owner-approved linked sample, critical legal/system routes, and runbook documentation. The linked sample passed effectively `20/20` on staging, the critical route set was reachable on staging, and the cutover runbook now serves as the staging manual verification section. The only remaining open manual-verification sub-check is the full four-variant production host/protocol matrix, because `www.staging.rhino-inquisitor.com` is not provisioned and staging cannot satisfy that final acceptance item. |

---

### Notes

- The rollback drill is not optional. "We have a rollback plan" and "we have drilled the rollback plan" are categorically different levels of readiness. The drill must be executed and documented; if it reveals problems, those problems must be fixed before the launch window.
- The cutover runbook must be executable by any team member with repository access — not only the original engineer who built the redirect implementation. Write it for the 3 AM incident, not for the comfortable Monday morning demo.
- The redirect map freeze with a git tag is important: it creates an immutable reference point for the launch state. Any post-launch hotfix must be applied as a new commit on top of the tagged state, not by modifying the tagged commit.
- "Keep old-URL sitemap during transition" means: do not immediately remove the old WordPress sitemap from Search Console. During the transition period, old-URL-based sitemap entries generate "redirect" warnings in Search Console — this is expected and not an error. The Phase 9 monitoring runbook should note this and define when to remove old sitemaps (typically when the coverage report shows full migration to new canonical URLs).
- The local rollback drill showed that `npm run build:prod` by itself does not remove stale alias helper files from `public/`. Alias-removal verification must therefore use a clean destination build or CI artifact before concluding that a broken alias has been reproduced or repaired.
- Reference: `analysis/plan/details/phase-6.md` §Workstream I, §Launch-Window Execution Plan, §Rollback Design
