## RHI-018 · Phase 2 Sign-off and Handover to Phase 3

**Status:** Open  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 2  
**Assigned to:** Migration Owner  
**Target date:** 2026-03-24  
**Created:** 2026-03-07  
**Updated:** 2026-03-09

---

### Goal

Formally close Phase 2 by verifying that all six workstream contracts (WS-A through WS-F) and the validation gates contract are approved and documented, all architecture blockers for Phase 3 scaffolding are resolved, and the Phase 3 team has received and acknowledged the Phase 2 decision package. This ticket is the gate between Phase 2 (Stack and Architecture Decision) and Phase 3 (Hugo Scaffold and CI Setup).

Phase 3 must not begin until this ticket is `Done`. Any unresolved architecture decision identified here must either be resolved or explicitly accepted with documented risk before sign-off is recorded.

---

### Acceptance Criteria

- [ ] All Phase 2 workstream tickets are `Done`:
  - [x] RHI-010 Done — Phase 2 kickoff and decision owner alignment complete
  - [x] RHI-011 Done — Generator and repo contract approved
  - [x] RHI-012 Done — Content model and front matter contract approved
  - [x] RHI-013 Done — Route and redirect contract approved (including SEO owner acceptance of alias redirect behavior)
  - [x] RHI-014 Done — SEO and discoverability contract approved
  - [x] RHI-015 Done — Library and tooling contract approved
  - [x] RHI-016 Done — Deployment and operations contract approved
  - [x] RHI-017 Done — Validation gates contract defined
- [ ] All five Architecture Principles from `analysis/plan/details/phase-2.md` are confirmed as reflected in approved contracts:
  - [ ] Preserve existing high-value URLs exactly whenever possible
  - [ ] Do not rely on canonical tags as a substitute for redirects
  - [ ] Make SEO behavior template-driven and testable
  - [ ] Fail build/CI on URL collisions and missing mapped routes
  - [ ] Keep architecture explicit in docs and config, not implicit in tooling defaults
- [ ] No unresolved architecture blockers remain for Phase 3 entry:
  - [ ] Hugo version pin confirmed (RHI-011)
  - [ ] `baseURL` and environment injection method confirmed (RHI-011)
  - [ ] Front matter `url` normalization rules approved (RHI-012)
  - [x] Redirect mechanism and SEO owner acceptance recorded (RHI-013)
  - [x] Edge redirect threshold calculation completed (RHI-013)
  - [x] Legacy system endpoint dispositions recorded in `migration/url-manifest.json` (RHI-013)
  - [x] Pagination parity manifest schema defined and assignment confirmed (RHI-013)
  - [x] SEO partial architecture approved (RHI-014)
  - [x] Deployment workflow contract approved (RHI-016)
  - [x] Validation gate specifications approved (RHI-017)
- [ ] `migration/phase-2-signoff.md` is committed with decision summary and stakeholder approval
- [ ] Phase 3 team has confirmed receipt of the Phase 2 decision package
- [x] RSS feed scope is confirmed: RSS required, Atom parity optional and non-blocking (from §Resolved Decisions for Phase 3 Entry)
- [ ] Feed compatibility check deliverable (`migration/feed-compatibility-check.md`) is noted as a Phase 4 dependency

---

### Tasks

- [ ] Confirm each workstream ticket is `Done` (run through checklist in Acceptance Criteria)
- [ ] Review each contract outcome against the six Architecture Principles; flag any principle not yet reflected in a contract decision
- [x] Verify that `migration/url-manifest.json` includes explicit entries for all legacy system endpoints (feed variants, wp-json, xmlrpc, author, search) — per RHI-013
- [x] Confirm pagination parity manifest schema is documented and ownership assigned — per RHI-013
- [x] Verify edge redirect threshold calculation is recorded with pass/fail status — per RHI-013
- [x] Verify SEO owner acceptance of alias redirect mechanism is recorded in RHI-013 Progress Log
- [ ] Review all Resolved Decisions for Phase 3 Entry from `analysis/plan/details/phase-2.md`:
  - [x] URL-change threshold and owner confirmed
  - [x] Legacy endpoint policy confirmed (feed, wp-json, xmlrpc, author, search)
  - [x] Pagination parity policy confirmed
  - [x] Edge redirect infrastructure timing confirmed
  - [x] Feed format scope confirmed (RSS required, Atom non-blocking)
- [ ] Draft `migration/phase-2-signoff.md`:
  - [ ] Summary of all Phase 2 decision tickets (RHI-010 bootstrap, RHI-011–RHI-016 workstreams, and RHI-017 validation gates) with outcomes and file paths
  - [ ] Architecture Principles compliance statement
  - [ ] Outstanding risks accepted for Phase 3 (if any)
  - [ ] Phase 3 entry conditions (what Phase 3 can rely on from Phase 2 outputs)
  - [ ] Stakeholder sign-off block (migration owner, SEO owner, engineering owner)
- [ ] Circulate sign-off document for approval
- [ ] Record final approval in Progress Log with approver names and date
- [ ] Notify Phase 3 team that Phase 2 is complete; provide link to `migration/phase-2-signoff.md` and the eight preceding Phase 2 tickets (RHI-010 through RHI-017)

---

### Out of Scope

- Beginning any Phase 3 work (Hugo scaffold and CI setup)
- Implementing any validation script or template (Phase 3)
- Any content conversion (Phase 4)
- DNS cutover (Phase 7)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-010 Done | Ticket | Done |
| RHI-011 Done | Ticket | Done |
| RHI-012 Done | Ticket | Done |
| RHI-013 Done | Ticket | Done |
| RHI-014 Done | Ticket | Done |
| RHI-015 Done | Ticket | Done |
| RHI-016 Done | Ticket | Done |
| RHI-017 Done | Ticket | Done |
| Migration owner, SEO owner, and engineering owner available for sign-off | Access | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| One or more workstream tickets not `Done` by target date | Medium | High | Identify on Day 6 of Phase 2; triage blockers; defer only with explicit scope-reduction approval | Migration Owner |
| SEO owner sign-off delayed — specifically on alias redirect acceptance | Medium | High | Pre-circulate the redirect contract summary on Day 5; use async approval via documented comment if synchronous review is not available | SEO Owner |
| Architecture blocker discovered at sign-off review (e.g. edge threshold exceeded, requiring infrastructure decision before Phase 3) | Low | High | If threshold is met, edge infrastructure scoping must be resolved before sign-off; do not accept Phase 3 start without a clear infrastructure path | Migration Owner |
| Phase 3 team not ready to receive handover | Low | Low | Notify Phase 3 team on Day 5 of Phase 2; confirm availability for Day 8 handover call | Project Manager |
| `migration/phase-2-signoff.md` content is too sparse to be useful for Phase 3 | Low | Medium | Use the deliverable template from RHI-009 sign-off as a reference; ensure each decision has a source (ticket ID) | Migration Owner |

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

- `migration/phase-2-signoff.md`
- All Phase 2 decision tickets (RHI-010 through RHI-017) confirmed and documented in respective tickets

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- The sign-off document must include a clear Phase 3 entry conditions section. Phase 3 engineers should be able to read `migration/phase-2-signoff.md` and know exactly what has been decided, what they can rely on, and what is still an open question.
- Any architecture decision accepted with risk at sign-off must be logged with the accepting owner's name. Undocumented risk acceptance is indistinguishable from overlooked risk.
- Reference: `analysis/plan/details/phase-2.md` §Definition of Done (Phase 2), §Resolved Decisions for Phase 3 Entry
