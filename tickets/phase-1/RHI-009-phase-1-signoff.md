## RHI-009 · Phase 1 Sign-off and Handover to Phase 2

**Status:** Open  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 1  
**Assigned to:** Migration Owner  
**Target date:** 2026-03-16  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Formally close Phase 1 by verifying that all workstream tickets are `Done`, that every deliverable is committed and approved, and that the handover package for Phase 2 is complete. This ticket is the gate between Phase 1 (Baseline and URL Inventory) and Phase 2 (Stack and Architecture Decision).

Phase 2 must not begin until this ticket is `Done`. Any open blocker identified here must be resolved or explicitly accepted before sign-off is recorded.

---

### Acceptance Criteria

- [ ] All eight workstream tickets are `Done`: RHI-001, RHI-002, RHI-003, RHI-004, RHI-005, RHI-006, RHI-007, RHI-008
- [ ] All nine deliverable files are committed to the repository:
  - [ ] `migration/url-inventory.raw.json`
  - [ ] `migration/url-inventory.normalized.json`
  - [ ] `migration/url-class-matrix.json`
  - [ ] `migration/url-manifest.json`
  - [ ] `migration/url-manifest.csv`
  - [ ] `migration/phase-1-seo-baseline.md`
  - [ ] `migration/phase-1-performance-baseline.md`
  - [ ] `migration/phase-1-security-header-matrix.md`
  - [ ] `migration/risk-register.md`
- [ ] `migration/phase-1-signoff.md` is committed with stakeholder approval signatures or equivalent
- [ ] 100% URL mapping completeness is confirmed (no unmapped URLs remain in the normalised inventory)
- [ ] All Phase 2 blocking items from Phase 1 are either resolved or explicitly accepted with documented rationale
- [ ] Phase 2 team has received the Phase 1 deliverables package and confirmed receipt

---

### Tasks

- [ ] Confirm each workstream ticket status is `Done` (see checklist below)
  - [ ] RHI-001 Done
  - [ ] RHI-002 Done
  - [ ] RHI-003 Done
  - [ ] RHI-004 Done
  - [ ] RHI-005 Done
  - [ ] RHI-006 Done
  - [ ] RHI-007 Done
  - [ ] RHI-008 Done
- [ ] Verify all nine deliverable files are committed and present in `migration/`
- [ ] Run a final manifest completeness check: URL count in `url-manifest.json` ≥ URL count in `url-inventory.normalized.json`
- [ ] Review open items from risk register (RHI-008): confirm no unmitigated Critical risks remain
- [ ] Review open items from URL invariant policy (RHI-003): confirm no unresolved policy items that block Phase 2
- [ ] Draft `migration/phase-1-signoff.md`:
  - [ ] Summary of all deliverables with file paths
  - [ ] URL count summary (total, by class, by disposition)
  - [ ] Outstanding risks accepted for Phase 2 (if any)
  - [ ] Staging and DNS TTL readiness confirmation from RHI-007
  - [ ] Stakeholder sign-off block (migration owner and SEO owner)
- [ ] Circulate sign-off document for approval
- [ ] Record final approval in Progress Log with approver names and date
- [ ] Notify Phase 2 team that Phase 1 is complete; provide link to `migration/phase-1-signoff.md`

---

### Out of Scope

- Beginning any Phase 2 work (stack and architecture decisions)
- Fixing issues discovered post-sign-off (open a new ticket)
- Any content conversion or Hugo scaffold work

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-001 Done | Ticket | Pending |
| RHI-002 Done | Ticket | Pending |
| RHI-003 Done | Ticket | Pending |
| RHI-004 Done | Ticket | Pending |
| RHI-005 Done | Ticket | Pending |
| RHI-006 Done | Ticket | Pending |
| RHI-007 Done | Ticket | Pending |
| RHI-008 Done | Ticket | Pending |
| Migration owner and SEO owner available for sign-off | Access | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| One or more workstream tickets not `Done` by target date | Medium | High | Identify on Day 6; triage to resolve blockers; accept scope reduction only with explicit approval | Migration Owner |
| Stakeholder unavailable for sign-off | Low | Medium | Pre-share sign-off document on Day 7 morning; use async approval if in-person review not feasible | Migration Owner |
| URL manifest has coverage gaps discovered at sign-off review | Low | High | Final completeness check catches this; resolve before circulating sign-off document | Migration Engineer |
| Phase 2 team not ready to receive handover | Low | Low | Notify Phase 2 team on Day 6; confirm readiness for Day 8 handover | Project Manager |

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

- `migration/phase-1-signoff.md`
- All nine workstream deliverables confirmed committed

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- This ticket must remain `Open` until every dependent ticket is `Done`. Do not advance to `In Progress` until the final completeness check is being actively performed.
- Any scope reduction accepted at sign-off (e.g. a deliverable moved to Phase 2) must be documented with explicit stakeholder approval in this ticket's Progress Log.
- Reference: `analysis/plan/details/phase-1.md` §Deliverables, §Definition of Done
