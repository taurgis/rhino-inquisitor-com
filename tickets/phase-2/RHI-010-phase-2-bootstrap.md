## RHI-010 · Phase 2 Bootstrap: Kickoff and Decision Owner Alignment

**Status:** Open  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 2  
**Assigned to:** Migration Owner  
**Target date:** 2026-03-17  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Confirm that Phase 1 deliverables are complete and accepted, identify the decision owners for each Phase 2 workstream, schedule review sessions, and ensure all participants have access to the Phase 1 outputs they need before any architecture decisions are made. This ticket is the prerequisite gate for all Phase 2 workstream tickets (RHI-011 through RHI-017). No Phase 2 decision workstream should begin until this ticket is `Done`.

Without alignment on ownership and access to Phase 1 outputs (particularly the URL manifest and risk register), architecture decisions in the remaining workstreams will be made without the baseline evidence they depend on.

---

### Acceptance Criteria

- [ ] Phase 1 sign-off (RHI-009) is `Done` and `migration/phase-1-signoff.md` is committed
- [ ] Migration owner, SEO owner, and engineering owner are confirmed and reachable for Phase 2
- [ ] All three decision owners have read `analysis/plan/details/phase-2.md` and confirmed understanding
- [ ] Phase 1 deliverables are accessible to all Phase 2 decision owners:
  - [ ] `migration/url-manifest.json` — URL classification and disposition decisions
  - [ ] `migration/phase-1-seo-baseline.md` — SEO baseline for risk assessment
  - [ ] `migration/risk-register.md` — active risks that constrain architecture decisions
- [ ] Workstream owner for each of WS-A through WS-F is named and recorded in the Progress Log
- [ ] Schedule for Phase 2 review sessions is agreed (synchronous or async format documented)
- [ ] Pagination priority manifest decision process is initiated (record how `migration/pagination-priority-manifest.json` will be populated — ticket or inline in RHI-013)
- [ ] Phase 2 target completion date is set and agreed by all decision owners

---

### Tasks

- [ ] Verify RHI-009 is `Done`; if not, document blocker in Progress Log and pause Phase 2
- [ ] Confirm migration owner, SEO owner, and engineering owner identities and contact details
- [ ] Share `analysis/plan/details/phase-2.md` with all three decision owners; request read confirmation
- [ ] Share links to `migration/url-manifest.json`, `migration/phase-1-seo-baseline.md`, and `migration/risk-register.md`
- [ ] Assign workstream owners for WS-A through WS-F (can be the same person for multiple workstreams)
- [ ] Set Phase 2 review format: synchronous workshop, async doc-comment, or hybrid
- [ ] Agree on target date for each workstream ticket (RHI-011 through RHI-017)
- [ ] Confirm decision ownership table:
  - [ ] Migration owner owns: redirect architecture, threshold enforcement, rollout acceptance
  - [ ] SEO owner owns: URL-change threshold usage, endpoint retire/keep, pagination parity exceptions
  - [ ] Engineering owner owns: Pages-only vs. edge-layer feasibility judgment
- [ ] Log all confirmations in the Progress Log with names and dates
- [ ] Announce Phase 2 kickoff to the team with linked Phase 1 summary

---

### Out of Scope

- Making any architecture decisions (covered by RHI-011 through RHI-017)
- Updating `migration/url-manifest.json` or any Phase 1 deliverable
- Writing Hugo templates or scaffolding (Phase 3)
- Populating `migration/pagination-priority-manifest.json` (covered by RHI-013)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-009 Done — Phase 1 sign-off recorded | Ticket | Pending |
| Migration owner available and confirmed | Access | Pending |
| SEO owner available and confirmed | Access | Pending |
| Engineering owner available and confirmed | Access | Pending |
| `migration/url-manifest.json` committed and readable | Phase | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Phase 1 sign-off delayed, blocking Phase 2 start | Medium | High | Identify earliest resolvable blocker in RHI-009; pre-position Phase 2 materials so kickoff is instant once sign-off lands | Migration Owner |
| SEO or engineering owner unavailable | Low | High | Identify backup decision-makers on Day 1; confirm availability before circulating Phase 2 materials | Migration Owner |
| Decision owners have not read Phase 1 outputs | Medium | Medium | Provide a one-page summary of Phase 1 outputs alongside the full documents; request read receipts | Migration Owner |
| Scope of Phase 2 misunderstood by participants | Low | Medium | Include explicit out-of-scope statement in kickoff communication; reference `analysis/plan/details/phase-2.md §Phase 2 Scope` | Migration Owner |

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

- Progress Log entries confirming decision owner alignment
- Agreed workstream ownership record
- Phase 2 schedule confirmed

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- Do not begin any workstream ticket until this ticket is `Done`. The dependency chain ensures Phase 1 evidence reaches Phase 2 decisions.
- If any Phase 1 deliverable is missing or incomplete at kickoff, log the gap here and assess whether Phase 2 can proceed with a documented risk acceptance.
- Reference: `analysis/plan/details/phase-2.md` §Phase 2 Scope, §Decision Ownership and Sign-Off
