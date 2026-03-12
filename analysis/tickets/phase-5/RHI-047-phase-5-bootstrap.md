## RHI-047 · Phase 5 Bootstrap: Kickoff and SEO Governance Environment Setup

**Status:** Done  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 5  
**Assigned to:** SEO Owner  
**Target date:** 2026-04-09  
**Created:** 2026-03-07  
**Updated:** 2026-03-12

---

### Goal

Confirm that Phase 3 sign-off is complete and all Phase 3 scaffold outputs required by Phase 5 are accessible before any SEO workstream begins. Establish the Phase 5 team, review all governing contracts, confirm tooling availability, and agree the workstream sequence and owners.

Phase 5 deals with SEO signal correctness — defects introduced here propagate directly into Google's understanding of the site. Starting workstreams before confirming the Phase 3 foundation (template scaffolding, SEO partials, CI framework) means any misconfiguration in canonical tags, structured data, or robots controls can silently corrupt the launch build. This bootstrap prevents that.

No Phase 5 workstream ticket (RHI-048 through RHI-059) should begin until this ticket is `Done`.

---

### Acceptance Criteria

- [x] Phase 3 sign-off (RHI-030) is `Done` and `migration/phase-3-signoff.md` is committed
- [x] Migration owner, SEO owner, and engineering owner are confirmed and available for Phase 5
- [x] All Phase 5 workstream owners have read `analysis/plan/details/phase-5.md` and confirmed understanding
- [ ] Phase 3 SEO scaffold outputs are accessible and verified:
  - [x] RHI-024 Outcomes — `src/layouts/partials/seo/` canonical, OG, and JSON-LD partials are committed and callable
  - [x] RHI-025 Outcomes — `check:url-parity` script is callable; `migration/url-parity-report.json` exists
  - [x] RHI-029 Outcomes — CI/CD pipeline runs to completion; Pages deployment is operational
- [ ] Phase 1 and Phase 2 contracts are accessible:
  - [x] `migration/url-inventory.normalized.json` exists with expected record count
  - [x] `migration/url-manifest.json` exists with 100% disposition and `implementation_layer` coverage
  - [x] RHI-012 Outcomes — Front matter contract accessible (required fields, `canonical` override rules)
  - [x] RHI-013 Outcomes — Route and redirect contract accessible (mechanism, threshold, legacy endpoints)
  - [x] RHI-014 Outcomes — SEO and discoverability contract confirmed as the Phase 5 operating baseline
- [x] Phase 5 non-negotiable constraints reviewed with the full team:
  - [x] Every indexable URL must have one and only one canonical outcome
  - [x] Zero redirect chains in final configuration
  - [x] Canonical, sitemap URL, and internal-link destination must agree for each indexable URL
  - [x] `robots.txt` must never be used as a substitute for de-indexing decisions
  - [x] Staging `noindex` controls must not leak into release artifacts
  - [x] Any URL retirement must resolve to meaningful `404` behavior — not thin soft-404 substitutes
- [x] Phase 5 tooling dependencies are confirmed available in `package.json`:
  - [x] `zod` — schema validation
  - [x] `fast-glob` — content and generated-output discovery
  - [x] `fast-xml-parser` — sitemap/feed parsing
  - [x] `cheerio` — HTML-level tag extraction checks
  - [x] Broken-link validation coverage accepted for bootstrap via `scripts/check-links.js`; adding `linkinator` or `broken-link-checker` is deferred unless a later workstream needs it
  - [x] `pa11y-ci` — accessibility quick checks
  - [x] `@lhci/cli` — lab-based performance quality gates
  - [x] Head metadata and duplicate-tag policy coverage accepted for bootstrap via current repo validators; `html-validate` remains optional unless a later workstream needs it
  - [x] `csv-stringify` — deterministic compliance report outputs
- [x] Phase 5 workstream owner for each of WS-A through WS-L is named and recorded in the Progress Log
- [x] Phase 5 target completion dates for each workstream are agreed and recorded

---

### Tasks

- [x] Verify RHI-030 is `Done`; if not, document the blocker and pause Phase 5
- [x] Confirm migration owner, SEO owner, and engineering owner identities for Phase 5
- [x] Share `analysis/plan/details/phase-5.md` with all workstream owners; request read confirmation
- [x] Share links to Phase 2 contract outcomes (RHI-012, RHI-013, RHI-014)
- [ ] Verify each Phase 3 SEO scaffold item is accessible from a clean install:
  - [x] Confirm `src/layouts/partials/seo/head-meta.html` (or equivalent) is committed
  - [x] Confirm `src/layouts/partials/seo/open-graph.html` is committed
  - [x] Confirm `src/layouts/partials/seo/json-ld-article.html` is committed
  - [x] Confirm `npm run check:url-parity` exits with code 0 on the current full-manifest corpus
- [x] Verify Phase 5 tooling dependencies are installable (`npm install`)
- [x] Review Phase 5 Non-Negotiable Constraints with the full team; log confirmations in Progress Log
- [x] Assign workstream owners for WS-A through WS-L
- [x] Agree on target dates for each workstream ticket (RHI-048 through RHI-059)
- [x] Establish Phase 5 CI gate sequence (metadata → redirects → crawl-controls → sitemap → schema → internal-links → images → accessibility → performance → pages-constraints)
- [x] Log all confirmations in Progress Log with names and dates
- [x] Announce Phase 5 kickoff with linked Phase 3 sign-off and Phase 5 plan

---

### Out of Scope

- Implementing any Phase 5 validation script or policy document (covered by RHI-048 through RHI-059)
- Making new architecture decisions (decided in Phase 2)
- Migrating content (Phase 4 scope)
- Executing DNS cutover (Phase 7 scope)
- Post-launch monitoring (Phase 9 scope)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-030 Done — Phase 3 sign-off recorded | Ticket | Verified |
| `migration/phase-3-signoff.md` committed and readable | Phase | Verified locally |
| SEO owner available for Phase 5 kickoff | Access | Verified — Thomas Theunen |
| Migration owner available and confirmed | Access | Verified — Thomas Theunen |
| Engineering owner available and confirmed | Access | Verified — Thomas Theunen |
| `migration/url-manifest.json` with 100% disposition coverage | Phase | Verified locally — `1212 / 1212` `disposition` and `implementation_layer` coverage |
| Phase 3 SEO partials committed in `src/layouts/partials/seo/` | Phase | Verified locally |
| Node.js runtime and `package.json` from Phase 3 | Tool | Verified locally — `npm install` returned up to date; current bootstrap accepts `scripts/check-links.js` and the existing SEO validators as the approved package-gap equivalents |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Phase 3 sign-off delayed, blocking Phase 5 start | Medium | High | Pre-position Phase 5 materials; review contracts; resolve tool dependencies before sign-off lands | SEO Owner |
| SEO partial templates from Phase 3 are incomplete or inconsistent | Medium | High | Audit each partial at bootstrap; identify gaps and raise deviation before WS-A starts — WS-A depends on a fully operational template scaffold | Engineering Owner |
| Phase 5 workstream ownership gaps (WS-G performance, WS-J monitoring) | Medium | Medium | Identify backup owners at kickoff; WS-J requires Search Console access which must be confirmed by Day 1 | SEO Owner |
| Phase 5 tooling not pinned to compatible versions | Low | Medium | Verify dependency versions against existing `package.json` constraints; lock versions on Day 1 | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Phase 5 bootstrap is complete. The Phase 3 and Phase 4 handoff artefacts, current repo-side SEO controls, owner assignments, target dates, and bootstrap tooling decisions are all recorded for downstream workstream execution.

**Delivered artefacts:**

- Progress Log entries confirming Phase 5 team alignment and Phase 3 contract receipt
- Phase 5 workstream owner assignments recorded
- `package.json` confirmed to include Phase 5 tooling dependencies
- Agreed target dates for RHI-048 through RHI-060
- Phase 5 bootstrap readiness note: `analysis/documentation/phase-5/rhi-047-phase-5-bootstrap-readiness-2026-03-12.md`

**Deviations from plan:**

- The bootstrap gate accepts the repository's existing validators (`scripts/check-links.js` and current SEO validators) as the approved broken-link and head-policy controls for RHI-047. Adding `linkinator` or `broken-link-checker` and `html-validate` is deferred unless a later Phase 5 workstream needs those specific packages.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-12 | In Progress | Verified current Phase 3 and Phase 4 handoff evidence for Phase 5 bootstrap: `migration/phase-3-signoff.md` is finalized, `migration/phase-4-signoff.md` is finalized for Phase 5/6/8 handover, and the current repo gates `npm run check:url-parity`, `npm run check:seo:artifact`, and `npm run check:links` all passed on the present repository state. |
| 2026-03-12 | In Progress | Confirmed Phase 1 and Phase 2 prerequisite artifacts remain accessible: `migration/url-inventory.normalized.json` contains `1199` rows, `migration/url-manifest.json` contains `1212 / 1212` populated `disposition` values and `1212 / 1212` populated `implementation_layer` values, and RHI-012, RHI-013, and RHI-014 remain readable as the current Phase 5 operating contracts. |
| 2026-03-12 | In Progress | Confirmed the Phase 3 SEO scaffold remains callable from the current repository: `src/layouts/partials/seo/head-meta.html`, `open-graph.html`, and `json-ld-article.html` are committed, the current `public/` artifact passes `npm run check:seo:artifact` for `215` indexable routes, and `npm run check:url-parity` now passes the full-manifest corpus with `1212` pass rows and `0` fail rows. |
| 2026-03-12 | Done | Thomas Theunen confirmed the bootstrap owner model for Phase 5: Migration Owner, SEO Owner, Engineering Owner, and the single workstream owner for WS-A through WS-L. Thomas also confirmed review of `analysis/plan/details/phase-5.md`, acceptance of the Phase 5 non-negotiable constraints, Search Console readiness for bootstrap, and the existing Phase 5 target dates as the agreed initial schedule. |
| 2026-03-12 | Done | `npm install` completed without changes. Thomas approved the current repo validators as the Phase 5 bootstrap broken-link and head-policy controls: `scripts/check-links.js` and the existing SEO validators satisfy RHI-047 without adding `linkinator`/`broken-link-checker` or `html-validate` at bootstrap. Phase 5 kickoff is approved to proceed from the current handoff state. |

---

### Notes

- Phase 5 was planned to run in parallel with Phase 4, but the current repo state already includes finalized Phase 4 handover evidence in `migration/phase-4-signoff.md`. Coordinate against the accepted Phase 4 artefacts and shared CI/package dependencies rather than waiting on active Phase 4 execution.
- The SEO partial templates committed in Phase 3 are the Phase 5 working surface. Any deficiency found at bootstrap must be escalated to the Phase 3 workstream owner before WS-A begins.
- Search Console access is time-sensitive. Confirm access at bootstrap — delays in WS-J access can block pre-launch monitoring preparation.
- Reference: `analysis/plan/details/phase-5.md` §Phase Position and Dependencies, §Non-Negotiable Constraints, §Required Libraries and Tooling
