## RHI-062 · Redirect Architecture Decision Record

**Status:** Open  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 6  
**Assigned to:** SEO Owner, Engineering Owner  
**Target date:** 2026-05-06  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Formally select, document, and sign off the redirect implementation architecture for the migration — choosing between Model A (GitHub Pages + Hugo aliases only) or Model B (edge redirect layer in front of GitHub Pages). The chosen model determines which HTTP status semantics are achievable for moved and retired URLs, and directly constrains what WS-C (RHI-065) implements and what WS-I (RHI-071) must plan for at cutover.

This decision cannot be deferred, partially resolved, or delegated without sign-off from both the SEO owner and engineering owner. An undecided or inconsistent redirect architecture is a critical launch risk.

The output is a committed Architecture Decision Record (ADR): `migration/phase-6-redirect-architecture-decision.md`.

---

### Acceptance Criteria

- [ ] URL change percentage calculated from `migration/url-manifest.json`:
  - [ ] Total in-scope legacy URLs counted
  - [ ] `redirect` (merge) disposition count calculated as percentage of total indexed inventory
  - [ ] Model B trigger threshold (>5% changed indexed URLs, or >100 high-value linked legacy URLs requiring redirect) evaluated
- [ ] Architecture model selected and rationale documented:
  - [ ] **If Model A selected:** risk acceptance statement signed by SEO owner covering client-side redirect semantics, limitations of meta-refresh vs server-side 301/308, and the fact that true 410 responses are not achievable through this model
  - [ ] **If Model B selected:** edge provider/tooling identified, operational complexity accepted by engineering owner, and cutover runbook impact assessed
  - [ ] **If hybrid selected:** clear scope boundary defined (which URL classes use each model) with no ambiguity
- [ ] `migration/phase-6-redirect-architecture-decision.md` is committed containing:
  - [ ] Decision summary (model chosen, model rejected, and why)
  - [ ] Quantitative trigger evaluation (% changed URLs, high-value URL count)
  - [ ] GitHub Pages capability constraints acknowledged explicitly
  - [ ] Risk acceptance for the chosen model with named owner
  - [ ] Impact on WS-C implementation scope
  - [ ] Impact on WS-I cutover runbook
  - [ ] Sign-off block (SEO owner and engineering owner, with dates)
- [ ] Decision is communicated to WS-C (RHI-065) and WS-I (RHI-071) owners before their work begins

---

### Tasks

- [ ] Pull final URL manifest stats from `migration/url-manifest.json`:
  - [ ] Count total in-scope legacy URLs
  - [ ] Count URLs with `disposition: merge` (redirect candidates)
  - [ ] Count URLs with `disposition: retire`
  - [ ] Calculate percentage of indexed inventory changing URL
  - [ ] Identify high-value linked legacy URLs (from Phase 1 backlink and Search Console data in `migration/phase-1-seo-baseline.md`)
- [ ] Evaluate Model B trigger conditions:
  - [ ] Does changed-URL percentage exceed 5% of indexed inventory?
  - [ ] Does high-value linked redirect count exceed 100?
  - [ ] Is there a hard requirement for true 301/308 or explicit 410 at origin?
- [ ] If Model B is triggered:
  - [ ] Identify edge provider/tooling options (CDN, edge function, Workers, etc.)
  - [ ] Assess operational complexity and maintenance burden
  - [ ] Confirm engineering owner accepts complexity trade-off
  - [ ] Identify provider-specific rules validator/CLI
- [ ] If Model A is selected:
  - [ ] Draft risk acceptance statement for SEO owner:
    - [ ] Client-side redirect semantics (meta-refresh, not 301/308)
    - [ ] Inability to serve explicit 410 for retired content
    - [ ] Dependency on crawlers following meta-refresh correctly
  - [ ] SEO owner signs risk acceptance statement
- [ ] Draft `migration/phase-6-redirect-architecture-decision.md` using the template below
- [ ] Circulate ADR draft to SEO owner and engineering owner for review
- [ ] Record sign-off with names and dates in the ADR and in this ticket's Progress Log
- [ ] Commit `migration/phase-6-redirect-architecture-decision.md` to repository
- [ ] Notify WS-C owner (RHI-065) and WS-I owner (RHI-071) of the decision; link ADR

---

### ADR Document Structure

The committed `migration/phase-6-redirect-architecture-decision.md` must include:

1. **Status** — Proposed / Accepted / Superseded
2. **Date** — Decision date
3. **Decision** — One-sentence summary of the chosen model
4. **Context** — Migration scenario, GitHub Pages constraints, URL change volume, and trigger evaluation results
5. **Options evaluated** — Model A, Model B (and hybrid if considered)
6. **Decision rationale** — Why this model was chosen over alternatives
7. **GitHub Pages capability constraints** — Explicit acknowledgement of static-hosting limitations
8. **Risk acceptance** — Named owner, risk statement, and mitigation strategy for the chosen model
9. **Implementation impact** — Effect on WS-C (alias/redirect implementation) and WS-I (cutover design)
10. **Sign-off** — SEO owner name/date + Engineering owner name/date

---

### Out of Scope

- Implementing redirects or alias pages (WS-C: RHI-065)
- Writing CI validation gates for redirect behavior (WS-H: RHI-070)
- DNS cutover decisions (Phase 7)
- Post-launch redirect monitoring setup (WS-G: RHI-069, WS-I: RHI-071)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-061 Done — Phase 6 Bootstrap complete | Ticket | Pending |
| `migration/url-manifest.json` with 100% disposition coverage | Phase | Pending |
| `migration/phase-1-seo-baseline.md` with backlink and traffic data | Phase | Pending |
| SEO owner available for review and sign-off | Access | Pending |
| Engineering owner available for review and sign-off | Access | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Decision delayed beyond Day 2 of Phase 6, blocking WS-C | Medium | High | Set decision deadline at bootstrap; escalate to migration owner immediately if sign-off cannot be obtained by target date | Migration Owner |
| URL manifest data is incomplete, making trigger evaluation unreliable | Medium | High | Verify manifest completeness at RHI-061 bootstrap before scheduling ADR; do not proceed with ADR if coverage is below 100% | SEO Owner |
| Model B triggers are borderline, leading to indecision between models | Medium | Medium | Document trigger results quantitatively; if borderline, prefer Model B to avoid post-launch redirect signal weakness; accept the complexity trade-off with a documented rationale | SEO Owner, Engineering Owner |
| SEO owner and engineering owner disagree on chosen model | Low | High | Escalate to migration owner for tiebreaker; document disagreement and resolution in ADR | Migration Owner |

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

- `migration/phase-6-redirect-architecture-decision.md` — committed ADR with sign-off block

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- The ADR is the gate for WS-C implementation. WS-C (RHI-065) must not begin implementation work until this ADR is `Done` and committed.
- Model B is the recommended choice for medium/high URL churn per `analysis/plan/details/phase-6.md`. The default assumption in tooling selection (undici, playwright) aligns with Model B observability. If Model A is chosen, the security review in WS-F still applies to alias pages.
- The GitHub Pages static-hosting constraint is non-negotiable and must be explicitly acknowledged in the ADR. The Pages platform does not provide per-path 301/308 redirect management from repository configuration. Any claim that it does must be treated as incorrect.
- Hugo `aliases` generate static HTML pages with `<meta http-equiv="refresh">` and a `<link rel="canonical">` pointing to the destination. These are client-side redirects, not server-side permanent redirects. Crawlers may treat them as equivalent but the signal is weaker than origin-level 301/308.
- Reference: `analysis/plan/details/phase-6.md` §Redirect Architecture Decision Model, §GitHub Pages Redirect Capability Baseline
