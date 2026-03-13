## RHI-063 · Workstream A — Legacy URL Inventory Finalization

**Status:** Done
**Priority:** Critical  
**Estimate:** M  
**Phase:** 6  
**Assigned to:** Migration Owner  
**Target date:** 2026-05-07  
**Created:** 2026-03-07  
**Updated:** 2026-03-13

---

### Goal

Produce a complete, normalized, and frozen URL inventory that covers every legacy route in scope for the migration — including URLs not captured in sitemaps but known from analytics landing pages, backlink reports, and system endpoints. The inventory becomes the authoritative input for redirect mapping (WS-B), alias implementation (WS-C), and all Phase 6 CI gates.

An incomplete inventory at this stage is the most common cause of post-launch 404 surprises. URLs discovered after launch require emergency patches and disrupt monitoring baselines. This workstream closes that gap before redirect implementation begins.

---

### Acceptance Criteria

- [x] All sitemap-derived URLs from Phase 1 are present in the finalized inventory:
  - [x] `post-sitemap.xml` URLs included
  - [x] `page-sitemap.xml` URLs included
  - [x] `category-sitemap.xml` URLs included
  - [x] `video-sitemap.xml` URLs included
  - [x] `e-landing-page-sitemap.xml` URLs included
- [x] Analytics landing page URLs (from Search Console and GA) merged into inventory:
  - [x] Top 200 landing pages by sessions cross-checked against manifest
  - [x] Any landing page URL not in sitemap added as a new manifest record with source annotation
- [x] Backlink-derived URLs merged into inventory:
  - [x] Phase 1 backlink data (`migration/phase-1-seo-baseline.md`) cross-checked against manifest
  - [x] Any backlink target URL not in manifest added with source annotation and `has_external_links: true`
- [x] System and legal endpoints explicitly covered:
  - [x] `/feed/` must resolve and `/rss/` feed endpoint has explicit disposition
  - [x] `/privacy-policy/` has explicit disposition
  - [x] `/sitemap.xml` and sitemap index endpoints have explicit disposition
  - [x] `/robots.txt` has explicit disposition
  - [x] `404` and error-path behavior is documented
  - [x] Any WordPress admin or system paths (`/wp-admin/`, `/wp-login.php`) are explicitly retired
- [x] URL normalization applied to all records:
  - [x] All legacy path-style URLs are lowercase
  - [x] All legacy path-style URLs have trailing slash while file-like and query-string routes preserve source form
  - [x] All duplicate URL forms (HTTP vs HTTPS, apex vs www) are collapsed to canonical key
  - [x] No duplicate `legacy_url` keys remain after normalization
- [x] Every in-scope URL has a non-null `disposition` field (`keep`, `merge`, or `retire`)
- [x] Every `merge` disposition record has a non-null, valid `target_url`
- [x] No in-scope URL is missing `implementation_layer` field
- [x] `migration/url-map.csv` is generated from `migration/url-manifest.json` with required columns: `legacy_url`, `legacy_path`, `route_class`, `disposition`, `target_url`, `intent_class`, `owner`, `notes`
- [x] Finalized manifest record count is documented in the Progress Log
- [x] Validation script `scripts/phase-6/validate-url-inventory.js` exits with code 0 on the finalized manifest

---

### Tasks

- [x] Load `migration/url-manifest.json` and `migration/url-inventory.normalized.json` as the starting inventory
- [x] Cross-check against sitemap sources:
  - [x] Parse each sitemap file and compare URL list to manifest
  - [x] Flag any sitemap URL not present in manifest; add missing records
- [x] Cross-check against Search Console landing page data (from `migration/phase-1-seo-baseline.md`):
  - [x] Export top 200 landing pages by sessions (if not already in baseline)
  - [x] Mark URLs with `has_organic_traffic: true` where sessions > 0
  - [x] Add any missing high-traffic landing pages to manifest with `source: search-console`
- [x] Cross-check against backlink data from Phase 1 baseline:
  - [x] Load external link targets from `migration/phase-1-seo-baseline.md`
  - [x] Mark URLs with `has_external_links: true`
  - [x] Add any missing backlink targets to manifest with `source: backlink-report`
- [x] Add explicit records for system and legal endpoints (see Acceptance Criteria list)
- [x] Normalize all URL keys:
  - [x] Apply lowercase transformation where path-style normalization is valid
  - [x] Enforce trailing slash on path-style routes while preserving file-like and query-string source forms
  - [x] Collapse HTTP/HTTPS and apex/www variants to single canonical key
  - [x] Deduplicate
- [x] Validate every record has required fields:
  - [x] Run inventory schema-equivalent validation against manifest
  - [x] Fix or escalate any record with missing `disposition`, `target_url` (for merges), or `implementation_layer`
- [x] Generate `migration/url-map.csv` from finalized manifest
- [x] Write and run `scripts/phase-6/validate-url-inventory.js`:
  - [x] Checks: no duplicate keys, no missing dispositions, no merge without target, no missing `implementation_layer`
  - [x] Exits with code 0 on clean manifest
- [x] Document final record count breakdown in Progress Log:
  - [x] Total records
  - [x] `keep` count
  - [x] `merge` count
  - [x] `retire` count
  - [x] Records with `has_organic_traffic: true`
  - [x] Records with `has_external_links: true`
- [x] Commit finalized `migration/url-manifest.json` and `migration/url-map.csv`

---

### Out of Scope

- Implementing redirects or alias pages (WS-C: RHI-065)
- Reviewing redirect intent and equivalence (WS-B: RHI-064)
- Host/protocol consolidation testing (WS-D: RHI-066)
- Changing already-approved URL dispositions without SEO owner approval per `migration-data.instructions.md`

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-061 Done — Phase 6 Bootstrap complete | Ticket | Resolved |
| `migration/url-manifest.json` from Phase 1/4 with current dispositions | Phase | Resolved |
| `migration/url-inventory.normalized.json` from Phase 1 | Phase | Resolved |
| `migration/phase-1-seo-baseline.md` with Search Console and backlink data | Phase | Resolved |
| Sitemap source files accessible (`migration/input/` or live site) | Phase | Resolved via `migration/url-inventory.sitemaps.raw.json` and `migration/url-discovery.sitemaps.summary.json` |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Analytics or backlink data reveals high-traffic URLs not in manifest | Medium | High | Cross-check at task start; flag any new URL for SEO owner disposition review before adding to manifest; do not auto-assign disposition | SEO Owner |
| Disposition changes required during finalization trigger SEO approval process | Medium | Medium | Follow `migration-data.instructions.md` Disposition Change Gate; document approvals in ADR comment or Progress Log | SEO Owner |
| Large number of missing records extends WS-A timeline, delaying WS-B | Low | High | Timebox discovery phase to Day 1; escalate volume to migration owner if >20 new records found; schedule parallel SEO review | Migration Owner |
| Normalization collapses URLs that should be distinct routes | Low | High | Validate normalization output against original sitemap sources; confirm with SEO owner before committing deduplicated manifest | SEO Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-063 is complete. The finalized Phase 6 inventory now covers all Phase 1 sitemap-derived URLs, the Search Console top-200 landing-page sample, backlink-derived targets, and the required system routes used by downstream redirect and governance work. The manifest was aligned to the approved Model A launch posture by reclassifying the `16` path-based former `edge-cdn` merge rows to `pages-static`, reclassifying the `123` unsupported query-string merge rows to `none`, and adding explicit records for `/rss/`, `/sitemap.xml`, `/sitemap_index.xml`, the five legacy WordPress sitemap shard endpoints, `/robots.txt`, `/wp-admin/`, and `/wp-login.php`.

The ticket also produced the repeatable inventory controls Phase 6 needs: `npm run validate:url-inventory` now enforces the manifest contract and required endpoint coverage, and `npm run phase6:generate-url-map` rebuilds the human-review CSV consumed by WS-B. The final manifest totals are `1223` rows: `197` `keep`, `141` `merge`, `885` `retire`, with `331` records flagged `has_organic_traffic: true` and `37` flagged `has_external_links: true`.

The `404` and error-path acceptance item is satisfied through documentation and existing artifact evidence rather than a symbolic manifest row. Phase 5 already established and documented a real `public/404.html` artifact and noindex/non-sitemap handling for the 404 page, which is the relevant behavior RHI-063 needed to carry forward.

**Delivered artefacts:**

- `migration/url-manifest.json` — finalized and versioned
- `migration/url-map.csv` — generated mapping table with all required columns
- `scripts/phase-6/validate-url-inventory.js` — inventory validation script
- `scripts/phase-6/generate-url-map.js` — deterministic URL map generator
- Final record count breakdown in Progress Log

**Deviations from plan:**

- The 404 acceptance item was closed with documentation and prior artifact evidence from Phase 5 rather than by adding a symbolic manifest row that would not map to a real legacy URL.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-13 | In Progress | Started WS-A after RHI-062. Initial manifest audit confirms strong field completeness (`1212` rows, `0` missing `disposition`, `0` missing `target_url` for merge rows, `0` missing `implementation_layer`) but surfaced two blocking inventory follow-ups before freeze: required explicit records are still missing for `/rss/`, `/sitemap.xml`, `/robots.txt`, `/wp-admin/`, and `/wp-login.php`, and the current Model A launch posture needs an owner-confirmed rule for legacy implementation-layer rows that still carry non-final launch semantics (`16` `edge-cdn` rows and `123` query-string `pages-static` merge rows). |
| 2026-03-13 | In Progress | Completed the first coverage audit pass. `migration/url-inventory.sitemaps.raw.json` is fully covered by the manifest (`0` sitemap misses), the backlink export has `0` missing manifest targets, and the only apparent Search Console top-200 misses were already-covered PDF compatibility assets that remain exact file paths rather than trailing-slash routes. Owner approved the Phase 6 inventory rule changes for Model A: the `16` path-based legacy `edge-cdn` rows are reclassified to `pages-static`, the `123` query-string merge rows are reclassified to `none`, and explicit system-route records are added for `/rss/`, `/sitemap.xml`, `/robots.txt`, `/wp-admin/`, and `/wp-login.php`. |
| 2026-03-13 | In Progress | Implemented `npm run validate:url-inventory` and `npm run phase6:generate-url-map`, regenerated `migration/url-map.csv`, and validated the updated manifest successfully. Current inventory totals are `1217` rows with `197` `keep`, `141` `merge`, and `879` `retire`; implementation-layer totals are `1196` `none` and `21` `pages-static`. Remaining WS-A closeout work is limited to any additional endpoint-policy decisions not yet encoded in the manifest and final completion review against the ticket acceptance checklist. |
| 2026-03-13 | Done | Closed the remaining endpoint-policy gaps for WS-A. Added explicit `retire` records for `/sitemap_index.xml` plus the five legacy WordPress sitemap shard endpoints discovered in `migration/url-discovery.sitemaps.summary.json`, re-ran `npm run validate:url-inventory` and `npm run phase6:generate-url-map`, and completed the RHI-063 closeout checklist. Final count evidence: `1223` total rows, `197` `keep`, `141` `merge`, `885` `retire`, `331` rows with organic-traffic evidence, and `37` rows with external-link evidence. The 404 acceptance item is satisfied by existing Phase 5 404 artifact and policy documentation rather than by adding a synthetic manifest route. |

---

### Notes

- WS-A runs in parallel with the architecture decision (RHI-062). The inventory does not need the architecture model to be finalized — it is pure data work. However, WS-B (RHI-064) depends on both WS-A and RHI-062 being Done before proceeding.
- Any URL added during WS-A that changes an existing `disposition` field must follow the Disposition Change Gate in `.github/instructions/migration-data.instructions.md`. Do not silently change dispositions during normalization.
- The `migration/url-map.csv` file is the primary human-readable artifact consumed by WS-B reviewers and SEO owners performing intent equivalence review.
- The `validate-url-inventory.js` script should be added to CI via `npm run validate:url-inventory` and made a blocking gate in WS-H (RHI-070).
- Reference: `analysis/plan/details/phase-6.md` §Workstream A, §Data Contracts and File Artifacts
