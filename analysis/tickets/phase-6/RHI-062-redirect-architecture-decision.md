## RHI-062 · Redirect Architecture Decision Record

**Status:** Done  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 6  
**Assigned to:** SEO Owner, Engineering Owner  
**Target date:** 2026-05-06  
**Created:** 2026-03-07  
**Updated:** 2026-03-13

---

### Goal

Formally select, document, and sign off the redirect implementation architecture for the migration — choosing between Model A (GitHub Pages + Hugo aliases only) or Model B (edge redirect layer in front of GitHub Pages). The chosen model determines which HTTP status semantics are achievable for moved and retired URLs, and directly constrains what WS-C (RHI-065) implements and what WS-I (RHI-071) must plan for at cutover.

This decision cannot be deferred, partially resolved, or delegated without sign-off from both the SEO owner and engineering owner. An undecided or inconsistent redirect architecture is a critical launch risk.

The output is a committed Architecture Decision Record (ADR): `migration/phase-6-redirect-architecture-decision.md`.

---

### Acceptance Criteria

- [x] URL change percentage calculated from `migration/url-manifest.json`:
  - [x] Total in-scope legacy URLs counted
  - [x] Change rate calculated using explicit formula:
    - [x] `indexed_urls = count(disposition == "keep" OR has_organic_traffic == true)`
    - [x] `changed_indexed_urls = count(indexed_urls where disposition != "keep")`
    - [x] `change_rate = changed_indexed_urls / indexed_urls * 100`
  - [x] Model B trigger threshold (>5% changed indexed URLs, or >100 high-value linked legacy URLs requiring redirect) evaluated
- [x] Architecture model selected and rationale documented:
  - [x] **If Model A selected:** risk acceptance statement signed by SEO owner covering client-side redirect semantics, limitations of meta-refresh vs server-side 301/308, and the fact that true 410 responses are not achievable through this model
  - [x] **If Model B selected:** evaluated and rejected; edge provider and tooling options were documented as decision context but not chosen for launch
  - [x] **If hybrid selected:** evaluated and rejected; no hybrid scope boundary was adopted for launch
- [x] `migration/phase-6-redirect-architecture-decision.md` is committed containing:
  - [x] Decision summary (model chosen, model rejected, and why)
  - [x] Quantitative trigger evaluation (% changed URLs, high-value URL count)
  - [x] GitHub Pages capability constraints acknowledged explicitly
  - [x] Risk acceptance for the chosen model with named owner
  - [x] Impact on WS-C implementation scope
  - [x] Impact on WS-I cutover runbook
  - [x] Sign-off block (SEO owner and engineering owner, with dates)
- [x] Decision is communicated to WS-C (RHI-065) and WS-I (RHI-071) owners before their work begins

---

### Tasks

- [x] Pull final URL manifest stats from `migration/url-manifest.json`:
  - [x] Count total in-scope legacy URLs
  - [x] Count URLs with `disposition: merge` (redirect candidates)
  - [x] Count URLs with `disposition: retire`
  - [x] Calculate `change_rate = changed_indexed_urls / indexed_urls * 100` using explicit indexed-URL formula
  - [x] Identify high-value linked legacy URLs (from Phase 1 backlink and Search Console data in `migration/phase-1-seo-baseline.md`)
- [x] Evaluate Model B trigger conditions:
  - [x] Does `change_rate` exceed 5?
  - [x] Does high-value linked redirect count exceed 100?
  - [x] Is there a hard requirement for true 301/308 or explicit 410 at origin?
- [x] If Model B is triggered:
  - [x] Identify edge provider/tooling options (CDN, edge function, Workers, etc.)
  - [x] Assess operational complexity and maintenance burden
  - [x] Confirm engineering owner accepts complexity trade-off
  - [x] Identify provider-specific rules validator/CLI
- [x] If Model A is selected:
  - [x] Draft risk acceptance statement for SEO owner:
    - [x] Client-side redirect semantics (meta-refresh, not 301/308)
    - [x] Inability to serve explicit 410 for retired content
    - [x] Dependency on crawlers following meta-refresh correctly
  - [x] SEO owner signs risk acceptance statement
- [x] Draft `migration/phase-6-redirect-architecture-decision.md` using the template below
- [x] Circulate ADR draft to SEO owner and engineering owner for review
- [x] Record sign-off with names and dates in the ADR and in this ticket's Progress Log
- [x] Commit `migration/phase-6-redirect-architecture-decision.md` to repository
- [x] Notify WS-C owner (RHI-065) and WS-I owner (RHI-071) of the decision; link ADR

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
| RHI-061 Done — Phase 6 Bootstrap complete | Ticket | Resolved |
| `migration/url-manifest.json` with 100% disposition coverage | Phase | Verified locally — formula input produced `1212` total rows and `41.96%` changed indexed URL rate |
| `migration/phase-1-seo-baseline.md` with backlink and traffic data | Phase | Verified as baseline evidence source; current manifest still shows `1` non-keep row with external links |
| SEO owner available for review and sign-off | Access | Resolved |
| Engineering owner available for review and sign-off | Access | Resolved |

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

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-062 is complete. The repository now contains the committed ADR at `migration/phase-6-redirect-architecture-decision.md`, which records Model A as the final redirect posture by explicit owner-approved exception. The ADR preserves the trigger evidence that originally favored Model B (`1212` total legacy URLs, `336` indexed URLs, `141` changed indexed URLs, `41.96%` change rate) but records the chosen override: Hugo remains the main system, Hugo aliases are the committed redirect mechanism for alias-eligible moved routes, and the previously expected edge layer is not part of the final launch posture.

The decision also records the accepted limitations of that choice. The earlier Phase 5 signal matrix remains historically valid and still identifies `541` effective edge-owned rows, including `525` query-string edge-owned routes and `402` query-string retire rows that Hugo aliases cannot reproduce faithfully. Those limits are now explicit owner-accepted launch risks rather than unresolved technical gaps.

**Delivered artefacts:**

- `migration/phase-6-redirect-architecture-decision.md` — committed ADR with sign-off block
- `analysis/documentation/phase-6/rhi-062-redirect-architecture-decision-2026-03-13.md` — implementation and exception note
- `migration/phase-5-seo-contract.md` append-only exception addendum
- `migration/phase-5-signoff.md` append-only exception addendum

**Deviations from plan:**

- Model B was the prior recommended and contract-aligned posture, but the owner approved a formal exception selecting Model A as the final launch redirect mechanism.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-13 | In Progress | Recomputed the required manifest trigger metrics from current `migration/url-manifest.json`: `1212` total rows, `336` indexed URLs, `141` changed indexed URLs, `41.96%` change rate, `140` merge rows, `877` retire rows, and `1` non-keep row with external links. The ticket formula still triggers Model B on change-rate threshold even though the high-value linked redirect threshold is not met. |
| 2026-03-13 | In Progress | Reviewed the current platform constraints and downstream dependencies with PM, BA, Senior QA Engineer, Hugo Specialist, SEO Specialist, and Official Docs research support. Confirmed GitHub Pages remains static hosting, Hugo aliases remain client-side meta-refresh helpers, WS-C depends on this ADR to define implementation boundary, and WS-I depends on this ADR to define available rollback options. |
| 2026-03-13 | In Progress | Owner selected Model A as the final redirect posture, confirmed Thomas Theunen as both SEO Owner and Engineering Owner sign-off for the ADR, and explicitly approved a formal exception to the Phase 5 edge-mandatory baseline. Owner also accepted the resulting query-string and request-aware route limitation as a launch risk rather than reverting to the prior Model B baseline. |
| 2026-03-13 | Done | Committed `migration/phase-6-redirect-architecture-decision.md`, documented the Model A exception and risk acceptance, appended dated exception notes to the Phase 5 contract and sign-off summary, and notified the WS-C and WS-I owner roles through the ADR and this ticket log. |

---

### Notes

- The ADR is the gate for WS-C implementation. WS-C (RHI-065) must not begin implementation work until this ADR is `Done` and committed.
- Model B remained the technically recommended choice for medium/high URL churn and was the prior Phase 5 baseline. This ticket closes on a formal owner exception selecting Model A instead, so downstream work must treat the exception record as authoritative.
- Because Model A is the final posture, the repository no longer assumes an edge override layer is available for rollback or launch-week fixes. WS-I must plan around previous-site recovery and Hugo or content-patch paths instead.
- The GitHub Pages static-hosting constraint is non-negotiable and must be explicitly acknowledged in the ADR. The Pages platform does not provide per-path 301/308 redirect management from repository configuration. Any claim that it does must be treated as incorrect.
- Hugo `aliases` generate static HTML pages with `<meta http-equiv="refresh">` and a `<link rel="canonical">` pointing to the destination. These are client-side redirects, not server-side permanent redirects. Crawlers may treat them as equivalent but the signal is weaker than origin-level 301/308.
- Reference: `analysis/plan/details/phase-6.md` §Redirect Architecture Decision Model, §GitHub Pages Redirect Capability Baseline
