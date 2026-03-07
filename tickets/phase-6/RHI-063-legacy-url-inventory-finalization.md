## RHI-063 · Workstream A — Legacy URL Inventory Finalization

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 6  
**Assigned to:** Migration Owner  
**Target date:** 2026-05-07  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Produce a complete, normalized, and frozen URL inventory that covers every legacy route in scope for the migration — including URLs not captured in sitemaps but known from analytics landing pages, backlink reports, and system endpoints. The inventory becomes the authoritative input for redirect mapping (WS-B), alias implementation (WS-C), and all Phase 6 CI gates.

An incomplete inventory at this stage is the most common cause of post-launch 404 surprises. URLs discovered after launch require emergency patches and disrupt monitoring baselines. This workstream closes that gap before redirect implementation begins.

---

### Acceptance Criteria

- [ ] All sitemap-derived URLs from Phase 1 are present in the finalized inventory:
  - [ ] `post-sitemap.xml` URLs included
  - [ ] `page-sitemap.xml` URLs included
  - [ ] `category-sitemap.xml` URLs included
  - [ ] `video-sitemap.xml` URLs included
  - [ ] `e-landing-page-sitemap.xml` URLs included
- [ ] Analytics landing page URLs (from Search Console and GA) merged into inventory:
  - [ ] Top 200 landing pages by sessions cross-checked against manifest
  - [ ] Any landing page URL not in sitemap added as a new manifest record with source annotation
- [ ] Backlink-derived URLs merged into inventory:
  - [ ] Phase 1 backlink data (`migration/phase-1-seo-baseline.md`) cross-checked against manifest
  - [ ] Any backlink target URL not in manifest added with source annotation and `has_external_links: true`
- [ ] System and legal endpoints explicitly covered:
  - [ ] `/feed/` and `/rss/` feed endpoints have explicit disposition
  - [ ] `/privacy-policy/` has explicit disposition
  - [ ] `/sitemap.xml` and sitemap index endpoints have explicit disposition
  - [ ] `/robots.txt` has explicit disposition
  - [ ] `404` and error-path behavior is documented
  - [ ] Any WordPress admin or system paths (`/wp-admin/`, `/wp-login.php`) are explicitly retired
- [ ] URL normalization applied to all records:
  - [ ] All legacy URLs are lowercase
  - [ ] All legacy URLs have trailing slash (consistent with URL invariant policy from Phase 3)
  - [ ] All duplicate URL forms (HTTP vs HTTPS, apex vs www) are collapsed to canonical key
  - [ ] No duplicate `legacy_url` keys remain after normalization
- [ ] Every in-scope URL has a non-null `disposition` field (`keep`, `redirect`, or `retire`)
- [ ] Every `redirect` disposition record has a non-null, valid `target_url`
- [ ] No in-scope URL is missing `implementation_layer` field
- [ ] `migration/url-map.csv` is generated from `migration/url-manifest.json` with required columns: `legacy_url`, `legacy_path`, `route_class`, `disposition`, `target_url`, `intent_class`, `owner`, `notes`
- [ ] Finalized manifest record count is documented in the Progress Log
- [ ] Validation script `scripts/phase-6/validate-url-inventory.js` exits with code 0 on the finalized manifest

---

### Tasks

- [ ] Load `migration/url-manifest.json` and `migration/url-inventory.normalized.json` as the starting inventory
- [ ] Cross-check against sitemap sources:
  - [ ] Parse each sitemap file and compare URL list to manifest
  - [ ] Flag any sitemap URL not present in manifest; add missing records
- [ ] Cross-check against Search Console landing page data (from `migration/phase-1-seo-baseline.md`):
  - [ ] Export top 200 landing pages by sessions (if not already in baseline)
  - [ ] Mark URLs with `has_organic_traffic: true` where sessions > 0
  - [ ] Add any missing high-traffic landing pages to manifest with `source: search-console`
- [ ] Cross-check against backlink data from Phase 1 baseline:
  - [ ] Load external link targets from `migration/phase-1-seo-baseline.md`
  - [ ] Mark URLs with `has_external_links: true`
  - [ ] Add any missing backlink targets to manifest with `source: backlink-report`
- [ ] Add explicit records for system and legal endpoints (see Acceptance Criteria list)
- [ ] Normalize all URL keys:
  - [ ] Apply lowercase transformation
  - [ ] Enforce trailing slash
  - [ ] Collapse HTTP/HTTPS and apex/www variants to single canonical key
  - [ ] Deduplicate
- [ ] Validate every record has required fields:
  - [ ] Run JSON schema validation against manifest
  - [ ] Fix or escalate any record with missing `disposition`, `target_url` (for redirects), or `implementation_layer`
- [ ] Generate `migration/url-map.csv` from finalized manifest
- [ ] Write and run `scripts/phase-6/validate-url-inventory.js`:
  - [ ] Checks: no duplicate keys, no missing dispositions, no redirect without target, no missing `implementation_layer`
  - [ ] Exits with code 0 on clean manifest
- [ ] Document final record count breakdown in Progress Log:
  - [ ] Total records
  - [ ] `keep` count
  - [ ] `redirect` count
  - [ ] `retire` count
  - [ ] Records with `has_organic_traffic: true`
  - [ ] Records with `has_external_links: true`
- [ ] Commit finalized `migration/url-manifest.json` and `migration/url-map.csv`

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
| RHI-061 Done — Phase 6 Bootstrap complete | Ticket | Pending |
| `migration/url-manifest.json` from Phase 1/4 with current dispositions | Phase | Pending |
| `migration/url-inventory.normalized.json` from Phase 1 | Phase | Pending |
| `migration/phase-1-seo-baseline.md` with Search Console and backlink data | Phase | Pending |
| Sitemap source files accessible (`migration/input/` or live site) | Phase | Pending |

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- `migration/url-manifest.json` — finalized and versioned
- `migration/url-map.csv` — generated mapping table with all required columns
- `scripts/phase-6/validate-url-inventory.js` — inventory validation script
- Final record count breakdown in Progress Log

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- WS-A runs in parallel with the architecture decision (RHI-062). The inventory does not need the architecture model to be finalized — it is pure data work. However, WS-B (RHI-064) depends on both WS-A and RHI-062 being Done before proceeding.
- Any URL added during WS-A that changes an existing `disposition` field must follow the Disposition Change Gate in `.github/instructions/migration-data.instructions.md`. Do not silently change dispositions during normalization.
- The `migration/url-map.csv` file is the primary human-readable artifact consumed by WS-B reviewers and SEO owners performing intent equivalence review.
- The `validate-url-inventory.js` script should be added to CI via `npm run validate:url-inventory` and made a blocking gate in WS-H (RHI-070).
- Reference: `analysis/plan/details/phase-6.md` §Workstream A, §Data Contracts and File Artifacts
