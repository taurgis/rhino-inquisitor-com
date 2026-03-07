## RHI-003 · Canonical and URL Invariant Policy

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 1  
**Assigned to:** Migration Owner + SEO Owner  
**Target date:** 2026-03-10  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Define and formally approve the canonical URL policy governing host, trailing slash, case, query parameters, and canonical tag behaviour. This policy is the decision document that RHI-004 (URL Classification) applies mechanically to every URL in the inventory.

Without this policy approved before classification begins, conflicting decisions will be made ad hoc, producing inconsistent URL handling across the migration and creating post-launch SEO risk. This ticket produces a written, stakeholder-approved policy artefact and records it in `migration/url-class-matrix.json` as the normative reference.

---

### Acceptance Criteria

- [ ] Host policy documented and approved: `www.rhino-inquisitor.com` is the canonical host; apex (`rhino-inquisitor.com`) redirects to `www`
- [ ] Trailing slash policy documented: one indexable canonical variant per route; slash variant chosen and documented
- [ ] Case policy documented: all generated and internal URLs are lowercase; legacy case redirects documented where required
- [ ] Query parameter policy documented: tracking parameters excluded from canonical; filter parameters that produce crawlable duplicates are addressed
- [ ] Canonical tag policy documented: all canonical tags resolve to final `https://www.rhino-inquisitor.com/...` URLs
- [ ] GitHub Pages hosting constraints acknowledged and documented: implementation layer confirmed for each policy item (`pages-static`, `edge-cdn`, `dns`, `none`)
- [ ] Policy document committed to `migration/url-class-matrix.json` with class-level defaults
- [ ] Policy approved by migration owner and SEO owner (sign-off recorded in Progress Log or linked document)
- [ ] Unresolved policy items that would block Phase 2 are listed as explicit blockers

---

### Tasks

- [ ] Review live-site behaviour: probe `www` vs apex, slash vs no-slash, mixed-case vs lowercase variants
  - [ ] Document current HTTP status for apex: `http://rhino-inquisitor.com/` → ?
  - [ ] Document current HTTP status for no-slash: `https://www.rhino-inquisitor.com/some-post` → ?
  - [ ] Document current HTTP status for mixed-case: `https://www.rhino-inquisitor.com/Some-Post/` → ?
- [ ] Draft host policy (canonical `www`; redirect mechanism: DNS or CDN layer)
- [ ] Draft trailing slash policy (consistent trailing slash for all paths; Hugo `canonifyURLs` or `trailingSlash` config)
- [ ] Draft case normalisation policy (lowercase enforcement; identify any paths currently served uppercase)
- [ ] Draft query parameter policy (define parameter list for canonical exclusion; assess `?s=` search, `?page=N` pagination)
- [ ] Draft canonical tag policy (always absolute `https://www` URL; no self-referential relative canonicals)
- [ ] Assess each policy point against GitHub Pages hosting constraints
  - [ ] Which policies require origin-level response (edge/CDN)?
  - [ ] Which can be satisfied statically by Hugo alias pages?
- [ ] Compile policy draft into a written document (Markdown) for review
- [ ] Schedule policy review with migration owner and SEO owner
- [ ] Incorporate feedback and obtain explicit approval
- [ ] Write and commit `migration/url-class-matrix.json` with per-class canonical defaults
- [ ] Document any open items that require Phase 2 architecture decisions

---

### Out of Scope

- Assigning disposition to individual URLs (RHI-004)
- Implementing redirects or canonical tags in templates (Phase 3, RHI not yet assigned)
- DNS configuration changes (Phase 7)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-002 Done | Ticket | Pending |
| SEO owner available for policy review | Access | Pending |
| Live site probe results (slash, case, apex behaviour) | Data | Pending (RHI-002) |

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

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

---

### Notes

- The live site already shows dual-host and dual-slash risks (phase-1.md §Current Live-Site Snapshot items 4 and 5). The policy must address both as Day 1 priorities.
- Any unresolved policy item from this ticket is a **Phase 2 blocker** per `analysis/plan/details/phase-1.md` §SEO Policy Items That Cannot Be Deferred.
- Reference: `analysis/plan/details/phase-1.md` §Workstream 2
- Official: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
