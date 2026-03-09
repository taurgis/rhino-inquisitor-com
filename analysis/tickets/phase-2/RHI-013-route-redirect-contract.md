## RHI-013 · Workstream C — Route and Redirect Contract

**Status:** Done  
**Priority:** Critical  
**Estimate:** L  
**Phase:** 2  
**Assigned to:** Migration Owner  
**Target date:** 2026-03-20  
**Created:** 2026-03-07  
**Updated:** 2026-03-09

---

### Goal

Define and approve every URL routing policy and redirect strategy decision required before Phase 3 scaffolding begins. This covers host policy, trailing slash handling, casing, taxonomy route shapes, the redirect mechanism (Hugo `aliases`), the edge-escalation threshold, legacy system endpoint retirement decisions, and pagination parity policy. Without a locked redirect contract, Phase 3 cannot scaffold taxonomy routes correctly, and Phase 4 cannot generate `aliases` safely.

This is the highest-risk workstream in Phase 2 because static-hosting redirect limitations mean that decisions made here directly affect post-launch SEO equity transfer. The SEO owner must approve this contract before it is finalized.

---

### Acceptance Criteria

- [x] Host policy is documented: `www.rhino-inquisitor.com` is the canonical host; `http://` and apex (`rhino-inquisitor.com`) must redirect to the canonical `https://www.` variant
- [x] Trailing slash policy is approved: all content URLs end with `/`; Hugo `uglyURLs` is confirmed `false`
- [x] Case policy is approved: all route outputs are lowercase; content `url` field enforces lowercase
- [x] Taxonomy route shapes are defined and approved:
  - [x] Category archive: `/category/{slug}/`
  - [x] Video listing page: `/video/` (WordPress page-type URL, **not** a custom post type archive; confirmed from Phase 1 data as a `page-sitemap.xml` entry and must be treated as a `page` class URL; separate from the `/category/video/` category archive which must also be preserved)
  - [x] Post archive/pagination: `/page/{n}/`
  - [x] Tag archive is omitted from the public Phase 3 route contract; existing `/tag/*` URLs remain retired unless a later exception is explicitly approved
- [x] Redirect mechanism is confirmed as Hugo `aliases` (HTML meta-refresh) with explicit acknowledgment that this is client-side, not HTTP 301/308 on Pages-only hosting
- [x] Edge redirect escalation trigger is approved using an explicit formula:
  - [x] `indexed_urls = count(disposition == "keep" OR has_organic_traffic == true)`
  - [x] `changed_indexed_urls = count(indexed_urls where disposition != "keep")`
  - [x] `change_rate = changed_indexed_urls / indexed_urls * 100`
  - [x] If `change_rate > 5`, edge redirect layer is mandatory before launch
- [x] Current estimated URL change percentage is recorded (from `migration/url-manifest.json` data): `39.1%` (`131 / 335`)
- [x] Edge redirect infrastructure decision is documented: threshold exceeded, so edge redirect infrastructure is mandatory before launch; Hugo `aliases` remain acceptable fallback behavior for Pages-only validation and non-edge cases
- [x] Legacy system endpoint retirement decisions are documented and approved:
  - [x] `/feed/` — confirmed canonical feed route; must resolve on migrated site
  - [x] `/feed/rss/` and `/feed/atom/` — explicit mapping decision recorded in `migration/url-manifest.json` as direct merge to `/feed/`
  - [x] `/comments/feed/`, `/wp-json/`, `/xmlrpc.php`, `/author/*` — retired with explicit 404/410 behavior
  - [x] `/search/*` — retired unless search feature is validated before cutover
- [x] Pagination parity policy is documented and approved:
  - [x] Strict parity required for pagination routes with ≥ 100 clicks in 90 days OR ≥ 10 referring domains
  - [x] Non-critical deep pagination routes may be intentionally retired with explicit mapping review
  - [x] `migration/pagination-priority-manifest.json` schema is defined (fields: `legacy_url`, `url_class`, `value_signal.clicks_90d`, `value_signal.ref_domains`, `decision`, `approvers`)
  - [x] Process for populating `migration/pagination-priority-manifest.json` is agreed and assigned to the migration engineer before URL parity gate implementation
- [x] Redirect chain policy is documented: no redirect chains; every legacy URL resolves in one hop to final destination
- [x] All approved decisions are recorded in this ticket's Outcomes and in `analysis/plan/details/phase-2.md`

---

### Tasks

- [x] Review `analysis/plan/details/phase-2.md` §Workstream C with migration owner and SEO owner
- [x] Confirm and document host policy (www canonical, HTTP→HTTPS redirect handling on Pages)
- [x] Confirm trailing slash policy; validate that Hugo `uglyURLs: false` is the correct config to enforce it
- [x] Confirm case policy; validate that all `url` values in `migration/url-manifest.json` are lowercase
- [x] Define taxonomy route shapes for categories, videos, tags, and post archives
  - Cross-reference against existing URL patterns in `migration/url-inventory.normalized.json`
  - Confirm routes with SEO owner against existing indexed taxonomy URLs
  - Note: the live site has a WordPress page at `/video/` (page-type listing page, listed in `page-sitemap.xml`) AND a category archive at `/category/video/`; these are distinct URL classes and both must be explicitly mapped in the route contract
- [x] Document redirect mechanism as Hugo `aliases` (client-side HTML meta-refresh)
  - SEO owner acceptance recorded for Pages-only fallback behavior, with explicit acknowledgment that this does not waive the edge redirect requirement once the threshold is exceeded
  - Acceptance recorded in Progress Log
- [x] Calculate current URL change rate from `migration/url-manifest.json` using the explicit formula:
  - [x] `indexed_urls = count(disposition == "keep" OR has_organic_traffic == true)`
  - [x] `changed_indexed_urls = count(indexed_urls where disposition != "keep")`
  - [x] `change_rate = changed_indexed_urls / indexed_urls * 100`
  - `39.1%` (`131 / 335`) exceeded the threshold, so edge redirect infrastructure is now a mandatory pre-launch dependency
- [x] Document and approve legacy system endpoint decisions (feed, wp-json, xmlrpc, author, search)
  - Update `migration/url-manifest.json` with explicit disposition entries for each system endpoint not yet mapped
- [x] Define pagination parity policy and the `pagination-priority-manifest.json` schema
  - Assign responsibility for populating the manifest to the migration engineer using Phase 1 SEO baseline exports and route review before URL parity gate implementation
  - Confirm target file path: `migration/pagination-priority-manifest.json`
- [x] Review redirect chain risk across all `merge` dispositions in `url-manifest.json`
  - Verified no A→B→C chains exist; each legacy URL maps directly to its final destination
- [x] Draft redirect contract document; circulate for SEO owner and migration owner approval
- [x] Record approved contract in Outcomes
- [x] Update `analysis/plan/details/phase-2.md` §Workstream C

---

### Out of Scope

- Writing Hugo taxonomy templates or permalink config (Phase 3)
- Generating redirect pages or alias HTML files (Phase 3)
- Running URL parity checks against built output (Phase 3 and Phase 8)
- Setting up edge CDN redirect layer (conditional — Phase 6 or Phase 7 if threshold is met)
- Populating `migration/pagination-priority-manifest.json` with SEO data (data collection task; may span Phase 3)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-010 Done — Phase 2 kickoff and decision owners confirmed | Ticket | Done |
| RHI-004 Done — URL classification and disposition mapping complete | Ticket | Done |
| RHI-012 Done — content model `url` and `aliases` contract approved | Ticket | Done |
| `migration/url-manifest.json` — needed for URL change percentage calculation and endpoint coverage check | Phase | Done |
| SEO owner available to approve redirect mechanism and escalation threshold | Access | Done |
| Engineering owner available to assess edge redirect feasibility | Access | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| URL change rate exceeds 5% threshold (`change_rate = changed_indexed_urls / indexed_urls * 100`), triggering mandatory edge layer before Phase 3 | Medium | High | Calculate change rate early in this ticket using explicit indexed-URL formula; if exceeded, initiate edge infrastructure scoping before Phase 3 begins | Migration Owner |
| SEO owner does not explicitly accept client-side alias redirect for Pages hosting | Low | High | Prepare written summary of GitHub Pages constraints and alias behavior; get written acceptance before proceeding | SEO Owner |
| Legacy system endpoints not mapped, causing silent 404s at launch | Medium | High | Audit `url-manifest.json` against the system endpoint list in phase-2.md; add missing entries before sign-off | Migration Engineer |
| Taxonomy route shape conflicts with existing indexed URLs | Medium | High | Cross-reference proposed shapes against `url-inventory.normalized.json` taxonomy entries; adjust before approval | SEO Owner |
| Redirect chains introduced through `merge` disposition chains in manifest | Low | High | Programmatically check `target_url` of each `merge` record against existing dispositions; flag any chain | Migration Engineer |
| Pagination manifest population delayed, blocking Phase 3 | Medium | Medium | Assign clear owner and target date for manifest population; track as a dependency in RHI-017 and RHI-018 | Migration Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Completed. Workstream C is now the approved Phase 2 route and redirect contract for Phase 3 scaffolding and downstream URL-preservation work.

Approved decisions:

- Canonical public host remains `https://www.rhino-inquisitor.com/`; apex and HTTP variants are redirect-only host variants and not separate public routes.
- Public HTML routes preserve trailing slashes and lowercase output. Hugo `uglyURLs` remains `false`, and manifest-driven content `url` values continue to be lowercase path-only values.
- Route classes are separated explicitly:
  - regular migrated content keeps manifest-driven `url` values;
  - generated category archives use `/category/{slug}/`;
  - the WordPress page `/video/` remains a preserved page route and is distinct from the category archive `/category/video/`;
  - blog pagination routes use `/page/{n}/` when preserved;
  - tag archives are not part of the approved public Phase 3 route contract, so the legacy `/tag/*` family remains retired unless a later exception is explicitly approved.
- Hugo `aliases` are the approved redirect mechanism for Pages-only fallback behavior. They are accepted explicitly as client-side HTML meta-refresh redirect pages, not origin-level `301`/`308` responses.
- The explicit URL-change threshold formula is locked and has now been executed against the current manifest baseline:
  - `indexed_urls = 335`
  - `changed_indexed_urls = 131`
  - `change_rate = 39.1%`
- Because `39.1% > 5%`, edge redirect infrastructure is mandatory before launch. Hugo `aliases` remain acceptable fallback behavior for Pages-only validation and non-edge cases, but they are not sufficient to waive the edge requirement.
- Legacy endpoint policy is now locked:
  - `/feed/` is preserved as the canonical feed route;
  - `/feed/rss/` and `/feed/atom/` merge directly to `/feed/`;
  - `/comments/feed/`, `/wp-json/`, `/xmlrpc.php`, and legacy `/author/*` routes retire with explicit not-found behavior;
  - legacy `/search/*` routes retire unless a validated production search feature is implemented before cutover.
- Pagination parity policy is now locked:
  - preserve pagination only where a route has at least 100 clicks in 90 days or at least 10 referring domains;
  - allow intentional retirement for non-critical deep pagination;
  - define `migration/pagination-priority-manifest.json` as the schema scaffold in Phase 2 and assign the migration engineer to populate it before URL parity gate implementation.
- Redirect-chain policy is locked: every legacy URL must resolve in one hop to its final destination. Current manifest baseline check found zero merge-chain violations.

**Delivered artefacts:**

- Approved redirect contract (recorded in this ticket's Outcomes)
- Updated `migration/url-manifest.json` with feed endpoint entries and `/feed/` correction
- `migration/pagination-priority-manifest.json` schema scaffold
- URL change percentage calculation and verdict
- Updated `analysis/plan/details/phase-2.md` §Workstream C
- Documentation note: `analysis/documentation/phase-2/rhi-013-route-redirect-contract-2026-03-09.md`

**Deviations from plan:**

- Conditional edge approval is no longer hypothetical: the approved threshold calculation on the current manifest baseline yields `39.1%`, so the Model B trigger is met and edge redirect infrastructure becomes a mandatory pre-launch dependency.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-09 | In Progress | Reviewed Workstream C against `analysis/plan/details/phase-2.md`, the current `migration/url-manifest.json`, official Hugo/GitHub Pages/Google Search documentation, and Phase 1 inventory evidence; confirmed `/video/` is a page route while `/category/video/` is a separate category archive |
| 2026-03-09 | In Progress | Executed the approved threshold formula against `migration/url-manifest.json`: the initial audit before feed correction was `39.4%` (`132 / 335`); the approved post-correction manifest baseline is `39.1%` (`131 / 335`). Both exceed the threshold; zero redirect-chain violations were found and the `/feed/` contradiction plus missing `/feed/rss/` and `/feed/atom/` entries were corrected |
| 2026-03-09 | In Progress | Approved Workstream C contract direction: keep `/feed/` as the canonical feed route, merge `/feed/rss/` and `/feed/atom/` to `/feed/`, omit tag archives from the public Phase 3 route contract, accept Hugo alias/meta-refresh behavior only as Pages-only fallback, and treat edge redirects as mandatory before launch because the threshold is exceeded |
| 2026-03-09 | Done | All RHI-013 acceptance criteria satisfied; route, redirect, endpoint, and pagination-schema decisions are now locked for Phase 3 scaffolding and downstream SEO/redirect work |

---

### Notes

- The 5% URL change threshold is fixed; use `change_rate = changed_indexed_urls / indexed_urls * 100`, where `indexed_urls = count(disposition == "keep" OR has_organic_traffic == true)` and `changed_indexed_urls = count(indexed_urls where disposition != "keep")`.
- `/feed/` is a canonical route and must work on the migrated site — it is not optional.
- Alias HTML redirect pages (generated by Hugo) are served as a static `index.html` at the alias path; they are not HTTP-level redirects. Googlebot follows them but they are not equivalent to 301s. SEO owner must acknowledge this explicitly.
- Reference: `analysis/plan/details/phase-2.md` §Workstream C, §Resolved Decisions for Phase 3 Entry
- Reference: https://gohugo.io/content-management/urls/ (Hugo URL and alias docs)
- Reference: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages (GitHub Pages static-hosting constraints)
- Reference: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
