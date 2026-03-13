## RHI-060 · Phase 5 Sign-off and Handover to Phase 6/8

**Status:** Open  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 5  
**Assigned to:** SEO Owner  
**Target date:** 2026-05-02  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Formally close Phase 5 by verifying that all workstream deliverables are complete, all CI gates are passing on the latest release candidate build, and the Phase 6 and Phase 8 teams have received and acknowledged the Phase 5 handover package. Phase 6 (URL Preservation and Redirect Strategy) and Phase 8 (Validation and Launch Readiness) must not finalize their release-candidate assessments until this sign-off is recorded.

Any unresolved Phase 5 blocking defect identified at sign-off must be fixed or explicitly accepted with documented owner before sign-off is recorded. The Phase 5 sign-off document is the authoritative record of what SEO and discoverability controls are in place for the launch window.

---

### Acceptance Criteria

- [ ] All Phase 5 workstream tickets are `Done`:
  - [ ] RHI-047 Done — Phase 5 Bootstrap complete
  - [x] RHI-048 Done — Metadata and canonical signal architecture complete
  - [ ] RHI-049 Done — Redirect and URL consolidation signals complete
  - [ ] RHI-050 Done — Crawlability and indexing controls complete
  - [x] RHI-051 Done — Sitemap, feed, and discovery surface continuity complete
  - [ ] RHI-052 Done — Structured data and rich-result readiness complete
  - [ ] RHI-053 Done — Internal linking and information architecture signals complete
  - [ ] RHI-054 Done — Mobile-first and Core Web Vitals controls complete
  - [ ] RHI-055 Done — Image and video SEO integrity complete
  - [ ] RHI-056 Done — Accessibility as discoverability support complete
  - [ ] RHI-057 Done — Search Console and analytics monitoring program complete
  - [ ] RHI-058 Done — Non-HTML resource SEO controls complete
  - [ ] RHI-059 Done — GitHub Pages limits and artifact integrity complete
- [ ] All Phase 5 CI gates pass on the latest `main` branch build:
  - [ ] `npm run check:metadata` exits with code 0 (zero blocking metadata errors)
  - [ ] `npm run check:redirects:seo` exits with code 0 (zero chain/loop/broad-redirect defects)
  - [ ] `npm run check:crawl-controls` exits with code 0 (zero unintended noindex; zero contradiction defects)
  - [ ] `npm run check:sitemap` exits with code 0 (zero host-mismatch or excluded-URL defects)
  - [ ] `npm run check:schema` exits with code 0 (zero critical schema property errors)
  - [ ] `npm run check:internal-links` exits with code 0 on critical template pages
  - [ ] `npm run check:images` exits with code 0 (zero broken image refs; zero missing alt text on non-decorative images)
  - [ ] `npm run check:perf` passes Lighthouse assertions on representative templates
  - [ ] `npm run check:a11y:seo` exits with code 0 on Level A violations
  - [ ] `npm run check:pages-constraints` exits with code 0 (artifact within size limit; no symlinks)
- [ ] Phase 5 deliverables are all committed:
  - [ ] `migration/phase-5-seo-contract.md` (derived from canonical policy, redirect matrix, and workstream outcomes)
  - [ ] `migration/phase-5-canonical-policy.md`
  - [ ] `migration/phase-5-redirect-signal-matrix.csv`
  - [ ] `migration/phase-5-sitemap-feed-policy.md`
  - [ ] `migration/phase-5-structured-data-coverage.md`
  - [ ] `migration/phase-5-monitoring-runbook.md`
  - [ ] `migration/reports/phase-5-gate-summary.csv`
  - [ ] `migration/reports/phase-5-non-html-policy.csv`
  - [ ] `migration/reports/phase-5-pages-constraints-report.md`
- [ ] Phase 5 exit gate conditions met:
  - [ ] Redirect behavior and canonical policies are frozen for the launch window
  - [ ] Monitoring and rollback decision paths are confirmed with owners
  - [ ] Phase 5 blocking gates are green on the latest release candidate
- [ ] `migration/phase-5-signoff.md` is committed with:
  - [ ] Summary of all Phase 5 workstream outcomes (RHI-048 through RHI-059) with ticket IDs and deliverable file paths
  - [ ] Phase 5 CI gate compliance statement with evidence (Actions run URL)
  - [ ] Exception register: all accepted deviations from plan with owner, reason, and target resolution phase
  - [ ] Phase 5 Definition of Done compliance checklist
  - [ ] Phase 6/8 entry conditions — what downstream phases can rely on from Phase 5
  - [ ] Outstanding risks accepted for Phase 6/8 with owners
  - [ ] Stakeholder sign-off block (migration owner, SEO owner, engineering owner)
- [ ] Phase 6 and Phase 8 teams have confirmed receipt of the Phase 5 handover package

---

### Tasks

- [ ] Confirm all 13 Phase 5 workstream tickets (RHI-047 through RHI-059) are `Done`
- [ ] Run all Phase 5 CI gates against the latest `main` branch build:
  - [ ] Full gate list as above — every gate must pass
  - [ ] Record Actions run URL in Progress Log
- [ ] Compile `migration/reports/phase-5-gate-summary.csv`:
  - [ ] One row per gate: gate name, script, pass/fail, blocking threshold, run date
- [ ] Review exception register from all workstreams:
  - [ ] Confirm all accepted deviations have owners and target phases
  - [ ] Confirm no deferred item represents an unacceptable launch risk for Phase 7
- [ ] Compile `migration/phase-5-seo-contract.md`:
  - [ ] Synthesize canonical policy, redirect matrix, sitemap/feed policy, and schema coverage into a single contract document for Phase 6/8 reference
- [ ] Draft `migration/phase-5-signoff.md`:
  - [ ] Workstream outcomes table (ticket ID, deliverable, file path, pass/fail)
  - [ ] CI gate evidence (Actions run URL, pass/fail per gate)
  - [ ] Exception register
  - [ ] Phase 6/8 entry conditions
  - [ ] Stakeholder sign-off block
- [ ] Circulate sign-off document for approval (migration owner, SEO owner, engineering owner)
- [ ] Record final approval in Progress Log with approver names and dates
- [ ] Notify Phase 6 team (URL Preservation and Redirect Strategy) that Phase 5 policies and redirect signal matrix are available
- [ ] Notify Phase 8 team (Validation and Launch Readiness) that Phase 5 CI gates are integrated and passing

---

### Out of Scope

- Executing the URL redirect infrastructure (Phase 6)
- DNS cutover (Phase 7)
- Full launch validation and smoke tests (Phase 8)
- Post-launch monitoring actions (Phase 9 — monitoring runbook prepared in WS-J, executed in Phase 9)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-047 through RHI-059 all Done | Ticket | Pending |
| Migration owner, SEO owner, and engineering owner available for sign-off | Access | Pending |
| Phase 6 and Phase 8 teams available to receive handover | Access | Pending |
| Latest `main` branch build represents the full migrated content set | Phase | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| One or more workstream tickets not `Done` by target date | Medium | High | Track workstream progress weekly; surface blockers by Day 8 of Phase 5 to assess extension vs. scope deferral | SEO Owner |
| Final CI gate run reveals a systemic failure not caught in individual workstream gates | Low | High | Run all Phase 5 gates against full `main` build 2 days before sign-off; leave time for fixes | Engineering Owner |
| Phase 4 content not fully merged when Phase 5 sign-off is attempted | Medium | Medium | Phase 5 can sign off on template-level gates before all content is present; document which gates are content-dependent and re-validate after Phase 4 completion | SEO Owner |
| Phase 6 or Phase 8 teams unavailable to acknowledge handover | Low | Medium | Notify Phase 6/8 teams at Day 10 of Phase 5; confirm handover receipt before sign-off is scheduled | Project Manager |

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

- `migration/phase-5-signoff.md`
- `migration/phase-5-seo-contract.md`
- `migration/reports/phase-5-gate-summary.csv`
- All Phase 5 workstream tickets (RHI-048 through RHI-059) confirmed `Done`
- CI gate evidence (passing Actions run URL)

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- The Phase 5 sign-off document must contain a clear Phase 6/8 entry conditions section. Phase 6 engineers should be able to read `migration/phase-5-signoff.md` and know exactly which redirect policies are frozen, what the redirect mechanism decision is, and what edge-layer escalation decisions have been made. Phase 8 engineers should know which CI gates are integrated and what their current pass/fail state is.
- Any accepted deviation at sign-off must be logged with the accepting owner's name. Undocumented risk acceptance is indistinguishable from overlooked risk — this is a hard rule.
- The `migration/phase-5-seo-contract.md` is a synthesis document that consolidates all Phase 5 policy decisions into a single reference. It is the primary handover artifact for Phase 6 and Phase 8 teams.
- Reference: `analysis/plan/details/phase-5.md` §Definition of Done, §Exit Gate to Phase 6 and Phase 8
