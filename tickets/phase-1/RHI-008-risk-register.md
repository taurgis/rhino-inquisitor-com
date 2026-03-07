## RHI-008 · Risk Register and Mitigations

**Status:** Open  
**Priority:** High  
**Estimate:** M  
**Phase:** 1  
**Assigned to:** Migration Owner  
**Target date:** 2026-03-12  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Produce a reviewed, owner-assigned risk register covering all identified high-impact delivery risks for the Phase 1 baseline and URL inventory work, as well as risks that will carry forward into later phases.

A risk register without owners is a checklist, not a risk register. Every risk must have an assigned owner who is accountable for monitoring and executing the mitigation. Unresolved high-impact risks are Phase 2 blockers.

---

### Acceptance Criteria

- [ ] `migration/risk-register.md` exists and contains all six initial high-risk items from `analysis/plan/details/phase-1.md` §Workstream 7
- [ ] Every risk record has all required fields: `id`, `description`, `impact`, `likelihood`, `owner`, `mitigation`, `trigger`, `contingency`, `status`
- [ ] All six initial risks from phase-1.md are represented: host duplication, slash duplication, legacy endpoint gaps, video/taxonomy parity, redirect design exceeds Pages capabilities, DNS/certificate timing
- [ ] Additional risks discovered during RHI-002, RHI-003, RHI-004 are added to the register
- [ ] Every risk has an assigned owner who is a named person or role (not "TBD")
- [ ] Risk owners have reviewed and accepted their risks (sign-off in Progress Log)
- [ ] Risk register reviewed with migration owner and SEO owner before Phase 2 sign-off

---

### Tasks

- [ ] Create `migration/risk-register.md` using a consistent table structure
- [ ] Document initial risk set from `analysis/plan/details/phase-1.md`:
  - [ ] Risk 1: Host duplication — `www` and apex both indexable as `200`
    - Impact: High | Likelihood: High (confirmed in live-site snapshot) | Owner: Migration Owner
  - [ ] Risk 2: Slash duplication — slash and no-slash variants both return `200`
    - Impact: Medium | Likelihood: High (confirmed in live-site snapshot) | Owner: SEO Owner
  - [ ] Risk 3: Legacy endpoint handling gaps — system routes (`/wp-json/`, `/xmlrpc.php`, etc.) need explicit retirement policy
    - Impact: Medium | Likelihood: Medium | Owner: Migration Engineer
  - [ ] Risk 4: Video and taxonomy parity risk — category and video pages may have different URL structures post-migration
    - Impact: High | Likelihood: Medium | Owner: SEO Owner
  - [ ] Risk 5: Redirect design exceeds GitHub Pages static capabilities — complex redirect requirements may need edge/CDN
    - Impact: High | Likelihood: Medium | Owner: Migration Owner
  - [ ] Risk 6: DNS/certificate/verification timing — DNS propagation, HTTPS issuance, and Search Console re-verification must be sequenced correctly
    - Impact: High | Likelihood: Low | Owner: Migration Owner
- [ ] Review findings from RHI-002 (URL inventory) and add new risks surfaced by discovery
- [ ] Review findings from RHI-003 (URL invariant policy) and add risks from policy gaps
- [ ] Review findings from RHI-004 (URL classification) and add risks from high-traffic `retire` decisions
- [ ] Assign owners to all risks; confirm owner acceptance
- [ ] Conduct risk review meeting with migration owner and SEO owner
- [ ] Document agreed mitigations, triggers, and contingency plans for each risk
- [ ] Record risk review sign-off in Progress Log

---

### Out of Scope

- Executing mitigations (those are tickets in later phases)
- Resolving the root causes of risks identified here (Phase 2+)
- Creating a detailed project schedule or milestone plan

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-002 Done or In Progress (risks from URL discovery) | Ticket | Pending |
| RHI-003 Done or In Progress (risks from policy gaps) | Ticket | Pending |
| RHI-004 Done or In Progress (risks from high-traffic retire decisions) | Ticket | Pending |
| Migration owner and SEO owner available for risk review session | Access | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Risk owners unavailable for review before Phase 2 | Low | High | Schedule review on Day 5; send pre-read 24 hours in advance | Migration Owner |
| New critical risks discovered late in Phase 1 | Medium | High | Risk register is a living document; add entries at any time; escalate immediately if Phase 2 blocking | Migration Owner |
| Mitigation for edge/CDN redirect requirement deferred to Phase 2 | Medium | High | Document as explicit Phase 2 architecture dependency; do not start Phase 2 without resolving | Migration Owner |

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

- `migration/risk-register.md`

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- Risk register must follow the append-only convention from `.github/instructions/migration-data.instructions.md` — do not overwrite historical entries.
- The two confirmed live-site risks (host duplication, slash duplication) are high-likelihood and must be treated as active issues, not future risks.
- Reference: `analysis/plan/details/phase-1.md` §Workstream 7
