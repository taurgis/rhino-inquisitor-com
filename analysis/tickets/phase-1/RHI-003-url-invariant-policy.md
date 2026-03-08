## RHI-003 · Canonical and URL Invariant Policy

**Status:** Done  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 1  
**Assigned to:** Migration Owner + SEO Owner  
**Target date:** 2026-03-10  
**Created:** 2026-03-07  
**Updated:** 2026-03-08

---

### Goal

Define and formally approve the canonical URL policy governing host, trailing slash, case, query parameters, and canonical tag behaviour. This policy is the decision document that RHI-004 (URL Classification) applies mechanically to every URL in the inventory.

Without this policy approved before classification begins, conflicting decisions will be made ad hoc, producing inconsistent URL handling across the migration and creating post-launch SEO risk. This ticket produces a written, stakeholder-approved policy artefact and records it in `migration/url-class-matrix.json` as the normative reference.

---

### Acceptance Criteria

- [x] Host policy documented and approved: `www.rhino-inquisitor.com` is the canonical host; apex (`rhino-inquisitor.com`) redirects to `www`
- [x] Trailing slash policy documented: one indexable canonical variant per route; slash variant chosen and documented
- [x] Case policy documented: all generated and internal URLs are lowercase; legacy case redirects documented where required
- [x] Query parameter policy documented: tracking parameters excluded from canonical; filter parameters that produce crawlable duplicates are addressed
- [x] Canonical tag policy documented: all canonical tags resolve to final `https://www.rhino-inquisitor.com/...` URLs
- [x] GitHub Pages hosting constraints acknowledged and documented: implementation layer confirmed for each policy item (`pages-static`, `edge-cdn`, `dns`, `none`)
- [x] Policy document committed to `migration/url-class-matrix.json` with class-level defaults
- [x] Policy approved by migration owner and SEO owner (sign-off recorded in Progress Log or linked document)
- [x] Unresolved policy items that would block Phase 2 are listed as explicit blockers

---

### Tasks

- [x] Review live-site behaviour: probe `www` vs apex, slash vs no-slash, mixed-case vs lowercase variants
  - [x] Document current HTTP status for apex: `http://rhino-inquisitor.com/` → `301` (to `https://rhino-inquisitor.com/`), final response `200`
  - [x] Document current HTTP status for no-slash: `https://www.rhino-inquisitor.com/sfcc-introduction` → `200` (canonical points to trailing slash variant)
  - [x] Document current HTTP status for mixed-case: `https://www.rhino-inquisitor.com/Sfcc-introduction/` → `200` (canonical points to lowercase variant)
- [x] Draft host policy (canonical `www`; redirect mechanism: DNS or CDN layer)
- [x] Draft trailing slash policy (one canonical trailing-slash variant per indexable route; no blind rewrite promise)
- [x] Draft case normalisation policy (lowercase enforcement; identify any paths currently served uppercase)
- [x] Draft query parameter policy (define parameter list for canonical exclusion; assess `?s=` search, `?page=N` pagination)
- [x] Draft canonical tag policy (always absolute `https://www` URL; no self-referential relative canonicals)
- [x] Assess each policy point against GitHub Pages hosting constraints
  - [x] Which policies require origin-level response (edge/CDN)?
  - [x] Which can be satisfied statically by Hugo alias pages?
- [x] Compile policy draft into a written document (Markdown) for review
- [x] Add owner sign-off block and review checklist for formal approval capture
- [x] Schedule policy review with migration owner and SEO owner
- [x] Incorporate feedback and obtain explicit approval
- [x] Write and commit `migration/url-class-matrix.json` with per-class canonical defaults
- [x] Document any open items that require Phase 2 architecture decisions

---

### Review Checklist and Sign-Off Record

Use this checklist during policy review with Migration Owner and SEO Owner.

- [x] Host policy accepted (`www` canonical; apex strategy approved)
- [x] Trailing slash policy accepted (single canonical route variant)
- [x] Case policy accepted (lowercase generation and legacy handling)
- [x] Query parameter policy accepted (tracking/search/pagination treatment)
- [x] Canonical tag policy accepted (absolute `https://www` canonical URLs)
- [x] Implementation layer mapping accepted (`pages-static` / `edge-cdn` / `dns` / `none`)
- [x] Phase 2 blockers acknowledged and owners assigned
- [x] RHI-004 is cleared to consume policy matrix defaults

| Approver | Role | Decision | Date | Evidence Link | Notes |
|----------|------|----------|------|---------------|-------|
| Migration Owner | Accountable owner | Approved | 2026-03-08 | Progress Log entry (2026-03-08) | Approved by Thomas Theunen |
| SEO Owner | Policy approver | Approved | 2026-03-08 | Progress Log entry (2026-03-08) | Approved by Thomas Theunen |

**Approval rule:** RHI-003 may be set to `Done` only when both approver rows are updated to `Approved` and the acceptance criterion "Policy approved by migration owner and SEO owner" is checked.

---

### Out of Scope

- Assigning disposition to individual URLs (RHI-004)
- Implementing redirects or canonical tags in templates (Phase 3, RHI not yet assigned)
- DNS configuration changes (Phase 7)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-002 Done | Ticket | Ready |
| SEO owner available for policy review | Access | Ready (approved 2026-03-08) |
| Live site probe results (slash, case, apex behaviour) | Data | Ready (captured 2026-03-08) |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| SEO owner unavailable for timely review | Low | High | Pre-draft policy with conservative defaults; escalate if no review by Day 3 end | Migration Owner |
| Live site currently serves both apex and `www` as `200` (canonicalisation risk) | High | High | Document as existing defect; policy must fix this in Phase 7 via DNS | SEO Owner |
| Live site serves both slash and no-slash as `200` | High | Medium | Document as existing defect; choose slash variant and enforce in Hugo config | SEO Owner |
| GitHub Pages cannot enforce all policies statically | Medium | High | Identify edge/CDN escalation requirement in policy; this must be resolved before Phase 2 architecture sign-off | Migration Owner |
| Policy conflicts between SEO and development preferences | Low | Medium | Use official Google guidance as tie-breaker; document decision rationale | Migration Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Final outcomes:

- Live-site behavior probes executed for host, slash, case, and query variants.
- Draft policy matrix committed with implementation-layer mapping and explicit Phase 2 blockers.
- Documentation update committed for policy implementation traceability.
- Migration Owner and SEO Owner approvals recorded with formal sign-off checklist completion.

**Delivered artefacts:**

- `migration/url-class-matrix.json`
- Policy review sign-off noted in Progress Log

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-08 | In Progress | Completed live probe evidence and policy draft; committed `migration/url-class-matrix.json`; pending migration owner + SEO owner approval |
| 2026-03-08 | Done | Formal approval captured from Thomas Theunen acting as both Migration Owner and SEO Owner; all review checklist items accepted and RHI-003 closed |

---

### Notes

- The live site already shows dual-host and dual-slash risks (phase-1.md §Current Live-Site Snapshot items 4 and 5). The policy must address both as Day 1 priorities.
- Any unresolved policy item from this ticket is a **Phase 2 blocker** per `analysis/plan/details/phase-1.md` §SEO Policy Items That Cannot Be Deferred.
- Reference: `analysis/plan/details/phase-1.md` §Workstream 2
- Official: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
