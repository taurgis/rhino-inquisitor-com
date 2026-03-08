## RHI-072 · Phase 6 Sign-off and Handover to Phase 7/8

**Status:** Open  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 6  
**Assigned to:** Migration Owner  
**Target date:** 2026-05-19  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Formally close Phase 6 by verifying that all workstream deliverables are complete, all Phase 6 CI gates are passing on the latest release candidate build, the redirect map is frozen, and the Phase 7 (GitHub Pages Deployment and Domain Cutover) and Phase 8 (Validation and Launch Readiness) teams have received and acknowledged the Phase 6 handover package.

Phase 7 DNS cutover and Phase 8 launch readiness assessments must not finalize until this sign-off is recorded. Any unresolved Phase 6 blocking defect must be fixed or explicitly accepted with a documented owner before sign-off proceeds. The Phase 6 sign-off document is the authoritative record of what URL preservation and redirect controls are in place for the launch window.

---

### Acceptance Criteria

- [ ] All Phase 6 workstream tickets are `Done`:
  - [ ] RHI-061 Done — Phase 6 Bootstrap complete
  - [ ] RHI-062 Done — Redirect architecture decision committed and signed off
  - [ ] RHI-063 Done — Legacy URL inventory finalized
  - [ ] RHI-064 Done — Redirect mapping intent review complete
  - [ ] RHI-065 Done — Hugo route preservation and alias integration complete
  - [ ] RHI-066 Done — Host and protocol canonical consolidation complete
  - [ ] RHI-067 Done — Retirement and error path governance complete
  - [ ] RHI-068 Done — Security and privacy controls for redirect logic complete
  - [ ] RHI-069 Done — Redirect observability and reporting complete
  - [ ] RHI-070 Done — CI and release gates for URL preservation complete
  - [ ] RHI-071 Done — Cutover readiness and rollback design complete
- [ ] All Phase 6 CI gates pass on the latest `main` branch build:
  - [ ] `npm run validate:url-inventory` exits with code 0
  - [ ] `npm run check:url-parity` exits with code 0
  - [ ] `npm run check:redirect-targets` exits with code 0
  - [ ] `npm run check:redirect-chains` exits with code 0 (zero chains, zero loops)
  - [ ] `npm run check:canonical-alignment` exits with code 0 (zero mismatches)
  - [ ] `npm run check:retirement-policy` exits with code 0
  - [ ] `npm run check:host-protocol` exits with code 0
  - [ ] `npm run check:redirect-security` exits with code 0
- [ ] Phase 6 deliverables are all committed:
  - [ ] `migration/phase-6-redirect-architecture-decision.md` — signed off ADR
  - [ ] `migration/url-map.csv` — finalized and frozen
  - [ ] `migration/phase-6-url-policy.md` — complete policy document
  - [ ] `migration/phase-6-cutover-runbook.md` — complete and verified
  - [ ] `migration/phase-6-rollback-runbook.md` — complete and drilled
  - [ ] `migration/reports/phase-6-coverage.csv` — 100% coverage, zero gaps
  - [ ] `migration/reports/phase-6-chains-loops.csv` — zero chains and loops
  - [ ] `migration/reports/phase-6-canonical-alignment.csv` — zero mismatches
  - [ ] `migration/reports/phase-6-retired-url-audit.csv` — all retired URLs documented
  - [ ] `migration/reports/phase-6-redirect-intent-review.csv` — all redirects approved
- [ ] Phase 6 exit gate conditions met:
  - [ ] Redirect map is frozen with git tag `phase-6-redirect-map-v1`
  - [ ] Rollback drill has been executed and documented
  - [ ] Critical route manual verification complete (top 50 traffic + top 50 backlink)
  - [ ] Security sign-off recorded in `migration/phase-6-url-policy.md`
  - [ ] All Phase 6 mandatory CI gates green on latest release candidate
- [ ] `migration/phase-6-signoff.md` is committed with:
  - [ ] Summary of all Phase 6 workstream outcomes (RHI-062 through RHI-071) with ticket IDs and deliverable file paths
  - [ ] Phase 6 CI gate compliance statement with evidence (Actions run URL)
  - [ ] Exception register: all accepted deviations from plan with owner, reason, and target resolution phase
  - [ ] Phase 6 Definition of Done compliance checklist
  - [ ] Phase 7/8 entry conditions — what downstream phases can rely on from Phase 6
  - [ ] Outstanding risks accepted for Phase 7/8 with owners
  - [ ] Stakeholder sign-off block (migration owner, SEO owner, engineering owner) with dates
- [ ] Phase 7 and Phase 8 teams have confirmed receipt of the Phase 6 handover package

---

### Tasks

- [ ] Confirm all 11 Phase 6 workstream tickets (RHI-061 through RHI-071) are `Done`
- [ ] Run all Phase 6 CI gates against the latest `main` branch build:
  - [ ] Full gate list as above — every gate must pass
  - [ ] Record Actions run URL in Progress Log
- [ ] Verify redirect map freeze:
  - [ ] Confirm git tag `phase-6-redirect-map-v1` is applied and SHA recorded
  - [ ] Confirm `migration/url-manifest.json` and `migration/url-map.csv` have not been modified after the tag
- [ ] Review exception register from all workstreams:
  - [ ] Confirm all accepted deviations have owners and target resolution phases
  - [ ] Confirm no deferred item represents an unacceptable launch risk for Phase 7
- [ ] Compile `migration/reports/phase-6-gate-summary.csv`:
  - [ ] One row per gate: gate name, script command, pass/fail, blocking threshold, run date, Actions run URL
- [ ] Draft `migration/phase-6-signoff.md`:
  - [ ] Workstream outcomes table (ticket ID, deliverable, file path, pass/fail)
  - [ ] CI gate evidence (Actions run URL, pass/fail per gate)
  - [ ] Redirect map freeze confirmation (git tag and SHA)
  - [ ] Exception register
  - [ ] Phase 7/8 entry conditions
  - [ ] Outstanding risks accepted for Phase 7/8 with owners
  - [ ] Stakeholder sign-off block
- [ ] Circulate sign-off document for approval (migration owner, SEO owner, engineering owner)
- [ ] Record final approval in Progress Log with approver names and dates
- [ ] Notify Phase 7 team (GitHub Pages Deployment and Domain Cutover) that Phase 6 redirect policies, cutover runbook, and rollback runbook are available
- [ ] Notify Phase 8 team (Validation and Launch Readiness) that Phase 6 CI gates are integrated and passing; share CI gate reference

---

### Out of Scope

- DNS record execution and domain cutover (Phase 7)
- Full launch validation and smoke tests (Phase 8)
- Post-launch monitoring execution (Phase 9 — cutover runbook monitoring section prepared in WS-I; executed in Phase 9)
- Making any new redirect mapping changes after the redirect-map freeze

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-061 through RHI-071 all Done | Ticket | Pending |
| Migration owner, SEO owner, and engineering owner available for sign-off | Access | Pending |
| Phase 7 and Phase 8 teams available to receive handover | Access | Pending |
| Latest `main` branch build represents the full migrated content set from Phase 4 | Phase | Pending |
| Git tag `phase-6-redirect-map-v1` applied | Phase | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| One or more workstream tickets not `Done` by target date | Medium | High | Track workstream progress weekly; surface blockers by Day 6 of Phase 6 to assess extension vs. scope deferral; critical workstreams (RHI-062, RHI-065, RHI-070) have zero deferral tolerance | Migration Owner |
| Final CI gate run reveals a systematic failure not caught in individual workstream testing | Low | High | Run all Phase 6 gates against full `main` build 2 days before sign-off; leave time for fixes | Engineering Owner |
| Phase 4 content not fully merged when Phase 6 sign-off is attempted | Medium | Medium | Phase 6 can sign off on infrastructure-level gates (inventory, redirect chains, canonical alignment) before all Phase 4 content is present; document which gates are content-volume-dependent and re-validate after Phase 4 completion | Migration Owner |
| Phase 7 or Phase 8 teams unavailable to acknowledge handover | Low | Medium | Notify Phase 7/8 teams at Day 8 of Phase 6; confirm handover receipt before sign-off is scheduled | Migration Owner |
| Exception register reveals a deferred item that is actually a launch blocker | Low | High | Review each exception at sign-off with both SEO owner and migration owner; do not allow vague "to be resolved in Phase X" notes — every exception needs a named owner, a date, and a clear resolution plan | Migration Owner |

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

- `migration/phase-6-signoff.md`
- `migration/reports/phase-6-gate-summary.csv`
- All Phase 6 workstream tickets (RHI-062 through RHI-071) confirmed `Done`
- CI gate evidence (passing Actions run URL)
- Git tag `phase-6-redirect-map-v1` applied and SHA recorded

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- The Phase 6 sign-off document must contain a clear Phase 7/8 entry conditions section. Phase 7 engineers should be able to read `migration/phase-6-signoff.md` and know exactly: which redirect architecture is in place, whether the cutover and rollback runbooks are drilled, what the redirect map freeze tag is, and what monitoring is in place post-cutover. Phase 8 engineers should know which CI gates are integrated, what their current pass/fail state is, and which gates are Phase 6 additions.
- Any accepted deviation at sign-off must be logged with the accepting owner's name and a resolution phase. Undocumented risk acceptance is indistinguishable from overlooked risk.
- The redirect map freeze tag is the single most important artifact from Phase 6. It creates an immutable reference for the launch state, which is essential for rollback (Phase 6 sign-off → Phase 7 cutover → if rollback triggered, revert to the tagged state).
- The gate summary CSV (`phase-6-gate-summary.csv`) provides Phase 8 with a machine-readable evidence trail for the Phase 8 launch readiness check.
- Reference: `analysis/plan/details/phase-6.md` §Definition of Done, §Exit Gate to Phase 7 and Phase 8
