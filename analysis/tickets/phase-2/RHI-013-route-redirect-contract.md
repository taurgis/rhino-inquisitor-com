## RHI-013 · Workstream C — Route and Redirect Contract

**Status:** Open  
**Priority:** Critical  
**Estimate:** L  
**Phase:** 2  
**Assigned to:** Migration Owner  
**Target date:** 2026-03-20  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Define and approve every URL routing policy and redirect strategy decision required before Phase 3 scaffolding begins. This covers host policy, trailing slash handling, casing, taxonomy route shapes, the redirect mechanism (Hugo `aliases`), the edge-escalation threshold, legacy system endpoint retirement decisions, and pagination parity policy. Without a locked redirect contract, Phase 3 cannot scaffold taxonomy routes correctly, and Phase 4 cannot generate `aliases` safely.

This is the highest-risk workstream in Phase 2 because static-hosting redirect limitations mean that decisions made here directly affect post-launch SEO equity transfer. The SEO owner must approve this contract before it is finalized.

---

### Acceptance Criteria

- [ ] Host policy is documented: `www.rhino-inquisitor.com` is the canonical host; `http://` and apex (`rhino-inquisitor.com`) must redirect to the canonical `https://www.` variant
- [ ] Trailing slash policy is approved: all content URLs end with `/`; Hugo `uglyURLs` is confirmed `false`
- [ ] Case policy is approved: all route outputs are lowercase; content `url` field enforces lowercase
- [ ] Taxonomy route shapes are defined and approved:
  - [ ] Category archive: `/category/{slug}/`
  - [ ] Video listing page: `/video/` (WordPress page-type URL, **not** a custom post type archive; confirmed from Phase 1 data as a `page-sitemap.xml` entry and must be treated as a `page` class URL; separate from the `/category/video/` category archive which must also be preserved)
  - [ ] Post archive/pagination: `/page/{n}/` or documented path
  - [ ] Tag archive: `/tag/{slug}/` (or omitted if tags are not indexable)
- [ ] Redirect mechanism is confirmed as Hugo `aliases` (HTML meta-refresh) with explicit acknowledgment that this is client-side, not HTTP 301/308 on Pages-only hosting
- [ ] Edge redirect escalation trigger is approved using an explicit formula:
  - [ ] `indexed_urls = count(disposition == "keep" OR has_organic_traffic == true)`
  - [ ] `changed_indexed_urls = count(indexed_urls where disposition != "keep")`
  - [ ] `change_rate = changed_indexed_urls / indexed_urls * 100`
  - [ ] If `change_rate > 5`, edge redirect layer is mandatory before launch
- [ ] Current estimated URL change percentage is recorded (from `migration/url-manifest.json` data)
- [ ] Edge redirect infrastructure decision is documented: conditionally approved, activated only if escalation threshold is met
- [ ] Legacy system endpoint retirement decisions are documented and approved:
  - [ ] `/feed/` — confirmed canonical feed route; must resolve on migrated site
  - [ ] `/feed/rss/` and `/feed/atom/` — explicit mapping decision (redirect or retire) recorded in `migration/url-manifest.json`
  - [ ] `/comments/feed/`, `/wp-json/`, `/xmlrpc.php`, `/author/*` — retired with explicit 404/410 behavior
  - [ ] `/search/*` — retired unless search feature is validated before cutover
- [ ] Pagination parity policy is documented and approved:
  - [ ] Strict parity required for pagination routes with ≥ 100 clicks in 90 days OR ≥ 10 referring domains
  - [ ] Non-critical deep pagination routes may be intentionally retired with explicit mapping review
  - [ ] `migration/pagination-priority-manifest.json` schema is defined (fields: `legacy_url`, `url_class`, `value_signal.clicks_90d`, `value_signal.ref_domains`, `decision`, `approvers`)
  - [ ] Process for populating `migration/pagination-priority-manifest.json` is agreed and assigned
- [ ] Redirect chain policy is documented: no redirect chains; every legacy URL resolves in one hop to final destination
- [ ] All approved decisions are recorded in this ticket's Outcomes and in `analysis/plan/details/phase-2.md`

---

### Tasks

- [ ] Review `analysis/plan/details/phase-2.md` §Workstream C with migration owner and SEO owner
- [ ] Confirm and document host policy (www canonical, HTTP→HTTPS redirect handling on Pages)
- [ ] Confirm trailing slash policy; validate that Hugo `uglyURLs: false` is the correct config to enforce it
- [ ] Confirm case policy; validate that all `url` values in `migration/url-manifest.json` are lowercase
- [ ] Define taxonomy route shapes for categories, videos, tags, and post archives
  - Cross-reference against existing URL patterns in `migration/url-inventory.normalized.json`
  - Confirm routes with SEO owner against existing indexed taxonomy URLs
  - Note: the live site has a WordPress page at `/video/` (page-type listing page, listed in `page-sitemap.xml`) AND a category archive at `/category/video/`; these are distinct URL classes and both must be explicitly mapped in the route contract
- [ ] Document redirect mechanism as Hugo `aliases` (client-side HTML meta-refresh)
  - Get explicit SEO owner acceptance that client-side redirect is acceptable under Pages-only hosting constraints
  - Record acceptance in Progress Log
- [ ] Calculate current URL change rate from `migration/url-manifest.json` using the explicit formula:
  - [ ] `indexed_urls = count(disposition == "keep" OR has_organic_traffic == true)`
  - [ ] `changed_indexed_urls = count(indexed_urls where disposition != "keep")`
  - [ ] `change_rate = changed_indexed_urls / indexed_urls * 100`
  - If ≥ 5%: escalate edge redirect decision to engineering owner immediately
  - If < 5%: record risk acceptance in Outcomes
- [ ] Document and approve legacy system endpoint decisions (feed, wp-json, xmlrpc, author, search)
  - Update `migration/url-manifest.json` with explicit disposition entries for each system endpoint not yet mapped
- [ ] Define pagination parity policy and the `pagination-priority-manifest.json` schema
  - Assign responsibility for populating the manifest (migration engineer or SEO owner)
  - Confirm target file path: `migration/pagination-priority-manifest.json`
- [ ] Review redirect chain risk across all `merge` dispositions in `url-manifest.json`
  - Verify no A→B→C chains exist; each legacy URL maps directly to its final destination
- [ ] Draft redirect contract document; circulate for SEO owner and migration owner approval
- [ ] Record approved contract in Outcomes
- [ ] Update `analysis/plan/details/phase-2.md` §Workstream C

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
| RHI-010 Done — Phase 2 kickoff and decision owners confirmed | Ticket | Pending |
| RHI-004 Done — URL classification and disposition mapping complete | Ticket | Pending |
| RHI-012 In Progress — content model `url` and `aliases` contract being defined | Ticket | Pending |
| `migration/url-manifest.json` — needed for URL change percentage calculation and endpoint coverage check | Phase | Pending |
| SEO owner available to approve redirect mechanism and escalation threshold | Access | Pending |
| Engineering owner available to assess edge redirect feasibility | Access | Pending |

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- Approved redirect contract (recorded in this ticket's Outcomes)
- Updated `migration/url-manifest.json` with system endpoint entries
- `migration/pagination-priority-manifest.json` schema definition
- URL change percentage calculation
- Updated `analysis/plan/details/phase-2.md` §Workstream C

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- The 5% URL change threshold is fixed; use `change_rate = changed_indexed_urls / indexed_urls * 100`, where `indexed_urls = count(disposition == "keep" OR has_organic_traffic == true)` and `changed_indexed_urls = count(indexed_urls where disposition != "keep")`.
- `/feed/` is a canonical route and must work on the migrated site — it is not optional.
- Alias HTML redirect pages (generated by Hugo) are served as a static `index.html` at the alias path; they are not HTTP-level redirects. Googlebot follows them but they are not equivalent to 301s. SEO owner must acknowledge this explicitly.
- Reference: `analysis/plan/details/phase-2.md` §Workstream C, §Resolved Decisions for Phase 3 Entry
- Reference: https://gohugo.io/content-management/urls/ (Hugo URL and alias docs)
- Reference: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
