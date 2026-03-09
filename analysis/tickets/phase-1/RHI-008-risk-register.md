## RHI-008 · Risk Register and Mitigations

**Status:** Done  
**Priority:** High  
**Estimate:** M  
**Phase:** 1  
**Assigned to:** Migration Owner  
**Target date:** 2026-03-12  
**Created:** 2026-03-07  
**Updated:** 2026-03-09

---

### Goal

Produce a reviewed, owner-assigned risk register covering all identified high-impact delivery risks for the Phase 1 baseline and URL inventory work, as well as risks that will carry forward into later phases.

A risk register without owners is a checklist, not a risk register. Every risk must have an assigned owner who is accountable for monitoring and executing the mitigation. Unresolved high-impact risks are Phase 2 blockers.

---

### Acceptance Criteria

- [x] `migration/risk-register.md` exists and contains all six initial high-risk items from `analysis/plan/details/phase-1.md` §Workstream 7
- [x] Every risk record has all required fields: `id`, `description`, `impact`, `likelihood`, `owner`, `mitigation`, `trigger`, `contingency`, `status`
- [x] All six initial risks from phase-1.md are represented: host duplication, slash duplication, legacy endpoint gaps, video/taxonomy parity, redirect design exceeds Pages capabilities, DNS/certificate timing
- [x] Additional risks discovered during RHI-002, RHI-003, RHI-004 are added to the register
- [x] Every risk has an assigned owner who is a named person or role (not "TBD")
- [x] Risk owners have reviewed and accepted their risks (sign-off in Progress Log)
- [x] Risk register reviewed with migration owner and SEO owner before Phase 2 sign-off

---

### Tasks

- [x] Create `migration/risk-register.md` using a consistent table structure
- [x] Document initial risk set from `analysis/plan/details/phase-1.md`:
  - [x] Risk 1: Host duplication — `www` and apex both indexable as `200`
    - Impact: High | Likelihood: High (confirmed in live-site snapshot) | Owner: Migration Owner
  - [x] Risk 2: Slash duplication — slash and no-slash variants both return `200`
    - Impact: High | Likelihood: High (confirmed in live-site snapshot) | Owner: SEO Owner
  - [x] Risk 3: Legacy endpoint handling gaps — system routes (`/wp-json/`, `/xmlrpc.php`, etc.) need explicit retirement policy
    - Impact: Medium | Likelihood: Medium | Owner: Migration Engineer
  - [x] Risk 4: Video and taxonomy parity risk — category and video pages may have different URL structures post-migration
    - Impact: High | Likelihood: Medium | Owner: SEO Owner
  - [x] Risk 5: Redirect design exceeds GitHub Pages static capabilities — complex redirect requirements may need edge/CDN
    - Impact: High | Likelihood: Medium | Owner: Migration Owner
  - [x] Risk 6: DNS/certificate/verification timing — DNS propagation, HTTPS issuance, and Search Console re-verification must be sequenced correctly
    - Impact: High | Likelihood: Medium | Owner: Migration Owner
- [x] Review findings from RHI-002 (URL inventory) and add new risks surfaced by discovery
- [x] Review findings from RHI-003 (URL invariant policy) and add risks from policy gaps
- [x] Review findings from RHI-004 (URL classification) and add risks from high-traffic `retire` decisions
- [x] Assign owners to all draft risks
- [x] Confirm owner acceptance
- [x] Conduct risk review meeting with migration owner and SEO owner
- [x] Document agreed mitigations, triggers, and contingency plans for each risk
- [x] Record risk review sign-off in Progress Log

---

### Out of Scope

- Executing mitigations (those are tickets in later phases)
- Resolving the root causes of risks identified here (Phase 2+)
- Creating a detailed project schedule or milestone plan

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-002 Done or In Progress (risks from URL discovery) | Ticket | Ready |
| RHI-003 Done or In Progress (risks from policy gaps) | Ticket | Ready |
| RHI-004 Done or In Progress (risks from high-traffic retire decisions) | Ticket | Ready |
| Migration owner and SEO owner available for risk review session | Access | Ready |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Risk owners unavailable for review before Phase 2 | Low | High | Schedule review on Day 5; send pre-read 24 hours in advance | Migration Owner |
| New critical risks discovered late in Phase 1 | Medium | High | Risk register is a living document; add entries at any time; escalate immediately if Phase 2 blocking | Migration Owner |
| Mitigation for edge/CDN redirect requirement deferred to Phase 2 | Medium | High | Document as explicit Phase 2 architecture dependency; do not start Phase 2 without resolving | Migration Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Completed. Phase 1 now has an append-only risk register that captures the six mandatory baseline risks plus discovery-driven additions from RHI-002, RHI-003, and RHI-004, with accepted owners, mitigations, triggers, and contingencies.

**Delivered artefacts:**

- `migration/risk-register.md`

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-09 | In Progress | Drafted `migration/risk-register.md` with the six mandatory baseline risks plus discovery-driven risks from RHI-002, RHI-003, and RHI-004; owner acceptance and final review still pending |
| 2026-03-09 | In Progress | Thomas Theunen approved the register in chat as both Migration Owner and SEO Owner; Migration Engineer confirmation remains outstanding before full owner-acceptance closure |
| 2026-03-09 | Done | Thomas Theunen confirmed all risks are accepted; ticket closed with `migration/risk-register.md` established as the Phase 1 baseline risk register |

---

### Notes

- Risk register must follow the append-only convention from `.github/instructions/migration-data.instructions.md` — do not overwrite historical entries.
- The two confirmed live-site risks (host duplication, slash duplication) are high-likelihood and must be treated as active issues, not future risks.
- Reference: `analysis/plan/details/phase-1.md` §Workstream 7
