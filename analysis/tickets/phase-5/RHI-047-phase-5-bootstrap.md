## RHI-047 · Phase 5 Bootstrap: Kickoff and SEO Governance Environment Setup

**Status:** Open  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 5  
**Assigned to:** SEO Owner  
**Target date:** 2026-04-09  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Confirm that Phase 3 sign-off is complete and all Phase 3 scaffold outputs required by Phase 5 are accessible before any SEO workstream begins. Establish the Phase 5 team, review all governing contracts, confirm tooling availability, and agree the workstream sequence and owners.

Phase 5 deals with SEO signal correctness — defects introduced here propagate directly into Google's understanding of the site. Starting workstreams before confirming the Phase 3 foundation (template scaffolding, SEO partials, CI framework) means any misconfiguration in canonical tags, structured data, or robots controls can silently corrupt the launch build. This bootstrap prevents that.

No Phase 5 workstream ticket (RHI-048 through RHI-059) should begin until this ticket is `Done`.

---

### Acceptance Criteria

- [ ] Phase 3 sign-off (RHI-030) is `Done` and `migration/phase-3-signoff.md` is committed
- [ ] Migration owner, SEO owner, and engineering owner are confirmed and available for Phase 5
- [ ] All Phase 5 workstream owners have read `analysis/plan/details/phase-5.md` and confirmed understanding
- [ ] Phase 3 SEO scaffold outputs are accessible and verified:
  - [ ] RHI-024 Outcomes — `src/layouts/partials/seo/` canonical, OG, and JSON-LD partials are committed and callable
  - [ ] RHI-025 Outcomes — `check:url-parity` script is callable; `migration/url-parity-report.json` exists
  - [ ] RHI-029 Outcomes — CI/CD pipeline runs to completion; Pages deployment is operational
- [ ] Phase 1 and Phase 2 contracts are accessible:
  - [ ] `migration/url-inventory.normalized.json` exists with expected record count
  - [ ] `migration/url-manifest.json` exists with 100% disposition and `implementation_layer` coverage
  - [ ] RHI-012 Outcomes — Front matter contract accessible (required fields, `canonical` override rules)
  - [ ] RHI-013 Outcomes — Route and redirect contract accessible (mechanism, threshold, legacy endpoints)
  - [ ] RHI-014 Outcomes — SEO and discoverability contract confirmed as the Phase 5 operating baseline
- [ ] Phase 5 non-negotiable constraints reviewed with the full team:
  - [ ] Every indexable URL must have one and only one canonical outcome
  - [ ] Zero redirect chains in final configuration
  - [ ] Canonical, sitemap URL, and internal-link destination must agree for each indexable URL
  - [ ] `robots.txt` must never be used as a substitute for de-indexing decisions
  - [ ] Staging `noindex` controls must not leak into release artifacts
  - [ ] Any URL retirement must resolve to meaningful `404` behavior — not thin soft-404 substitutes
- [ ] Phase 5 tooling dependencies are confirmed available in `package.json`:
  - [ ] `zod` — schema validation
  - [ ] `fast-glob` — content and generated-output discovery
  - [ ] `fast-xml-parser` — sitemap/feed parsing
  - [ ] `cheerio` — HTML-level tag extraction checks
  - [ ] `linkinator` or `broken-link-checker` — broken-link validation
  - [ ] `pa11y-ci` — accessibility quick checks
  - [ ] `@lhci/cli` — lab-based performance quality gates
  - [ ] `html-validate` — head metadata and duplicate-tag policy checks (strongly recommended)
  - [ ] `csv-stringify` — deterministic compliance report outputs
- [ ] Phase 5 workstream owner for each of WS-A through WS-L is named and recorded in the Progress Log
- [ ] Phase 5 target completion dates for each workstream are agreed and recorded

---

### Tasks

- [ ] Verify RHI-030 is `Done`; if not, document the blocker and pause Phase 5
- [ ] Confirm migration owner, SEO owner, and engineering owner identities for Phase 5
- [ ] Share `analysis/plan/details/phase-5.md` with all workstream owners; request read confirmation
- [ ] Share links to Phase 2 contract outcomes (RHI-012, RHI-013, RHI-014)
- [ ] Verify each Phase 3 SEO scaffold item is accessible from a clean install:
  - [ ] Confirm `src/layouts/partials/seo/head-meta.html` (or equivalent) is committed
  - [ ] Confirm `src/layouts/partials/seo/open-graph.html` is committed
  - [ ] Confirm `src/layouts/partials/seo/json-ld-article.html` is committed
  - [ ] Confirm `npm run check:url-parity` exits with code 0 on scaffold
- [ ] Verify Phase 5 tooling dependencies are installable (`npm install`)
- [ ] Review Phase 5 Non-Negotiable Constraints with the full team; log confirmations in Progress Log
- [ ] Assign workstream owners for WS-A through WS-L
- [ ] Agree on target dates for each workstream ticket (RHI-048 through RHI-059)
- [ ] Establish Phase 5 CI gate sequence (metadata → redirects → crawl-controls → sitemap → schema → internal-links → images → accessibility → performance → pages-constraints)
- [ ] Log all confirmations in Progress Log with names and dates
- [ ] Announce Phase 5 kickoff with linked Phase 3 sign-off and Phase 5 plan

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
| RHI-030 Done — Phase 3 sign-off recorded | Ticket | Pending |
| `migration/phase-3-signoff.md` committed and readable | Phase | Pending |
| SEO owner available for Phase 5 kickoff | Access | Pending |
| Migration owner available and confirmed | Access | Pending |
| Engineering owner available and confirmed | Access | Pending |
| `migration/url-manifest.json` with 100% disposition coverage | Phase | Pending |
| Phase 3 SEO partials committed in `src/layouts/partials/seo/` | Phase | Pending |
| Node.js runtime and `package.json` from Phase 3 | Tool | Pending |

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- Progress Log entries confirming Phase 5 team alignment and Phase 3 contract receipt
- Phase 5 workstream owner assignments recorded
- `package.json` confirmed to include Phase 5 tooling dependencies
- Agreed target dates for RHI-048 through RHI-060

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- Phase 5 runs in parallel with Phase 4. Do not wait for Phase 4 to be complete before starting Phase 5 workstreams — but both phases require Phase 3 completion. Coordinate with Phase 4 team on shared CI gates and shared `package.json` dependencies.
- The SEO partial templates committed in Phase 3 are the Phase 5 working surface. Any deficiency found at bootstrap must be escalated to the Phase 3 workstream owner before WS-A begins.
- Search Console access is time-sensitive. Confirm access at bootstrap — delays in WS-J access can block pre-launch monitoring preparation.
- Reference: `analysis/plan/details/phase-5.md` §Phase Position and Dependencies, §Non-Negotiable Constraints, §Required Libraries and Tooling
