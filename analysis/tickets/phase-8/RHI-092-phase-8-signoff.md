## RHI-092 · Phase 8 Sign-off and Handover to Phase 9

**Status:** Open  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 8  
**Assigned to:** Migration Owner  
**Target date:** 2026-06-13  
**Created:** 2026-03-08  
**Updated:** 2026-03-08

---

### Goal

Formally close Phase 8 by verifying that all workstream deliverables are complete, the go/no-go decision has been recorded with named approvals, and the Phase 9 (Cutover and Post-Launch Monitoring) team has received and acknowledged the Phase 8 handover package. This sign-off is the authoritative record that the site has been validated against all required launch gates and is cleared for DNS cutover and public monitoring activities in Phase 9.

Any unresolved blocking gate failure or outstanding exception must be fixed or explicitly accepted with a documented owner before sign-off proceeds. This ticket cannot be closed on a No-Go decision.

---

### Acceptance Criteria

- [ ] All Phase 8 workstream tickets are `Done`:
  - [ ] RHI-083 Done — Phase 8 Bootstrap complete
  - [ ] RHI-084 Done — RC frozen and validation dataset committed
  - [ ] RHI-085 Done — URL parity and redirect integrity gates passing
  - [ ] RHI-086 Done — SEO and indexing readiness gates passing
  - [ ] RHI-087 Done — Structured data and social preview gates passing
  - [ ] RHI-088 Done — Performance and Core Web Vitals gates passing
  - [ ] RHI-089 Done — Accessibility and markup conformance gates passing
  - [ ] RHI-090 Done — Security and HTTPS readiness gates passing
  - [ ] RHI-091 Done — Operational readiness, rehearsal, and Go/No-Go complete
- [ ] Go/No-Go decision is recorded as Go:
  - [ ] `migration/phase-8-go-nogo-decision.md` is committed
  - [ ] All required approvers from `migration/phase-8-approver-roster.md` (migration owner, SEO owner, engineering owner, DNS/operations owner) have signed with names and dates
  - [ ] All blocking gate failures are resolved
  - [ ] Any accepted warnings/exceptions are listed with owners and target resolution phase
- [ ] `LAUNCH-GATE-PASS-SUMMARY.md` is committed and reviewed
- [ ] `CUTOVER-VERIFICATION-CHECKLIST.md` is committed and completed
- [ ] All Phase 8 validation artifacts are committed to `validation/` and archived as CI artifacts with 30-day retention:
  - [ ] `validation/expected-url-outcomes.json`
  - [ ] `validation/sample-matrix.json`
  - [ ] `validation/priority-routes.json`
  - [ ] `validation/url-parity-report.json`
  - [ ] `validation/redirect-quality-report.json`
  - [ ] `validation/seo-consistency-report.json`
  - [ ] `validation/robots-sitemap-report.json`
  - [ ] `validation/structured-data-report.json`
  - [ ] `validation/social-preview-report.json`
  - [ ] `validation/lhci-report/`
  - [ ] `validation/performance-budget-report.json`
  - [ ] `validation/accessibility-axe-report.json`
  - [ ] `validation/accessibility-manual-checklist.md`
  - [ ] `validation/html-conformance-report.json`
  - [ ] `validation/https-security-report.json`
- [ ] `migration/phase-8-signoff.md` is committed with:
  - [ ] Summary of all Phase 8 workstream outcomes (RHI-084 through RHI-091) with ticket IDs and deliverable file paths
  - [ ] Gate pass evidence: reference to `LAUNCH-GATE-PASS-SUMMARY.md` and CI Actions run URL
  - [ ] Exception register reference: `migration/phase-8-exception-register.md`
  - [ ] Smoke test results summary: reference to `migration/phase-8-smoke-test-results.md`
  - [ ] Rollback drill result: reference to `migration/phase-8-rollback-drill-result.md`
  - [ ] Go/No-Go decision: reference to `migration/phase-8-go-nogo-decision.md`
  - [ ] Phase 9 entry conditions: what Phase 9 can rely on from Phase 8
  - [ ] Outstanding risks accepted for Phase 9 with owners
  - [ ] Stakeholder sign-off block (migration owner, SEO owner, engineering owner) with dates
- [ ] Phase 9 team has confirmed receipt of the handover package

---

### Tasks

- [ ] Confirm all Phase 8 workstream tickets (RHI-083 through RHI-091) are `Done`
- [ ] Verify the Go/No-Go decision in `migration/phase-8-go-nogo-decision.md` is Go with all approvals recorded
- [ ] Verify approvals match `migration/phase-8-approver-roster.md`
- [ ] Verify all Phase 8 validation artifacts are committed to `validation/` and retrievable from CI artifact storage
- [ ] Draft `migration/phase-8-signoff.md`:
  - [ ] Table of workstream outcomes with ticket IDs and deliverable paths
  - [ ] Gate pass evidence section (reference `LAUNCH-GATE-PASS-SUMMARY.md` with Actions run URL)
  - [ ] Exception register reference with risk summary
  - [ ] Smoke test results summary
  - [ ] Rollback drill result and timing
  - [ ] Go/No-Go decision reference
  - [ ] Phase 9 entry conditions:
    - [ ] All Phase 8 hard-blocker gates pass on RC commit `phase-8-rc-v1`
    - [ ] Rollback drill completed within target time
    - [ ] Smoke tests pass on deployed RC
    - [ ] Exception register reviewed with no unacceptable risks carried forward
    - [ ] Search Console verification confirmed
  - [ ] Outstanding risks accepted for Phase 9 with owners and resolution timelines
  - [ ] Stakeholder sign-off block
- [ ] Circulate `migration/phase-8-signoff.md` for approval:
  - [ ] Migration owner signs
  - [ ] SEO owner signs
  - [ ] Engineering owner signs
- [ ] Record final approval in Progress Log with approver names and dates
- [ ] Notify Phase 9 team with handover package:
  - [ ] Link to `migration/phase-8-signoff.md`
  - [ ] Link to `LAUNCH-GATE-PASS-SUMMARY.md`
  - [ ] Link to `migration/phase-8-exception-register.md`
  - [ ] Link to rollback runbook (`migration/phase-7-rollback-runbook.md`)
  - [ ] RC commit SHA and `phase-8-rc-v1` tag reference
  - [ ] Confirmed live site URL and DNS state
  - [ ] Search Console action items for Phase 9
- [ ] Tag repository with `phase-8-signoff` on the RC commit after sign-off is recorded
- [ ] Announce Phase 8 sign-off with link to sign-off document

---

### Out of Scope

- Executing DNS cutover or post-launch monitoring (Phase 9 scope)
- Making any configuration changes to the live site after sign-off (require new tickets in Phase 9)
- New content additions or SEO growth experiments (post-launch stabilization scope)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-083 through RHI-091 all Done | Ticket | Pending |
| `migration/phase-8-go-nogo-decision.md` committed with Go decision and all approvals | Ticket | Pending |
| `LAUNCH-GATE-PASS-SUMMARY.md` committed | Ticket | Pending |
| `CUTOVER-VERIFICATION-CHECKLIST.md` committed | Ticket | Pending |
| All validation artifacts committed to `validation/` | Ticket | Pending |
| Migration owner, SEO owner, and engineering owner available for sign-off | Access | Pending |
| Phase 9 team available to receive handover | Access | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| One or more workstream tickets not `Done` by sign-off target date | Medium | High | Track daily progress in the final week of Phase 8; surface blockers 3 days before scheduled sign-off | Migration Owner |
| Go/No-Go decision is No-Go, blocking sign-off | Low | High | If No-Go: document blockers, assign resolution owners, set re-evaluation date; sign-off cannot proceed until blockers are resolved | Migration Owner |
| Phase 9 team unavailable to receive handover | Low | Medium | Notify Phase 9 team at T-3 days before sign-off; confirm handover receipt before closing RHI-092 | Migration Owner |
| Validation artifact storage gap: some reports missing or not archived | Low | High | Verify all artifact paths are committed and CI artifacts are uploaded with 30-day retention before circulating sign-off for approval | Engineering Owner |
| A post-sign-off issue is discovered that would have been a blocking gate failure | Very Low | Critical | Treat as a Phase 9 P1 incident; do not silently patch; use the exception register and rollback protocol as appropriate | Migration Owner |

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

- `migration/phase-8-signoff.md` — full Phase 8 sign-off record
- `phase-8-signoff` git tag on the RC commit
- All Phase 8 validation artifacts confirmed in `validation/`
- Phase 9 handover notification sent with package links

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | Open | Ticket created |

---

### Notes

- This sign-off document is the handover artifact for Phase 9. Phase 9 engineers must be able to read it and know: which CI gates are integrated and passing, what the current exception list is, where the rollback runbook lives, and what the first monitoring actions are. Gaps in this document become invisible risks in post-launch monitoring.
- The `phase-8-signoff` git tag is the immutable reference for the validated launch state. Any modification to the site after this tag must go through a new ticket and a targeted re-validation of the affected gates.
- Phase 8 sign-off does not mean the launch is irreversible. The rollback runbook remains active and the rollback window starts from Phase 8 sign-off, not from DNS cutover.
- Reference: `analysis/plan/details/phase-8.md` §Definition of Done; `analysis/plan/details/phase-9.md` §Phase Position and Dependencies
