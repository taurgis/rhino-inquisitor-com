## RHI-004 · URL Classification and Disposition Mapping

**Status:** Done  
**Priority:** Critical  
**Estimate:** L  
**Phase:** 1  
**Assigned to:** Migration Engineer + SEO Owner  
**Target date:** 2026-03-11  
**Created:** 2026-03-07  
**Updated:** 2026-03-09

---

### Goal

Assign every URL in the normalised inventory a disposition (`keep`, `merge`, `retire`) and a complete mapping record that is directly implementable on GitHub Pages. This manifest is the single source of truth consumed by Phase 4 (content migration), Phase 5 (SEO), and Phase 6 (redirect strategy).

A URL without a complete, approved mapping record is a migration risk. This ticket is done only when 100% of discovered URLs have an implementable, reviewed mapping.

---

### Acceptance Criteria

- [x] `migration/url-manifest.json` exists and contains one record per URL from `migration/url-inventory.normalized.json`
- [x] Every record has all mandatory fields: `legacy_url`, `disposition`, `target_url`, `redirect_code`, `reason`, `owner`, `priority`, `implementation_layer`, `url_class`, `source`, `has_organic_traffic`, `has_external_links`
- [x] URL coverage is 100%: every URL in the normalised inventory appears exactly once in the manifest
- [x] No redirect chains: every `merge` or `retire` record points directly to the final destination
- [x] `implementation_layer` is set explicitly on every non-`keep` record: `pages-static`, `edge-cdn`, `dns`, or `none`
- [x] All `retire` records with `has_organic_traffic: true` or `has_external_links: true` have explicit SEO owner approval documented in `reason` or Progress Log
- [x] No `target_url` is set to the homepage as a catch-all for `retire` dispositions unless explicitly approved
- [x] `migration/url-manifest.csv` is generated as an audit-friendly export
- [x] All `system` and `attachment` class URLs have `retire` as default unless approved otherwise (123 `system` merge exceptions are preserved legacy redirect mappings and documented in manifest `reason` fields)
- [x] `scripts/classify-urls.js` is committed to drive classification output

---

### Tasks

- [x] Apply URL class taxonomy from `analysis/plan/details/phase-1.md` to every URL in `migration/url-inventory.normalized.json`
  - [x] `post` — from `post-sitemap.xml`
  - [x] `page` — from `page-sitemap.xml`
    - ⚠️ **Live-site flag:** The homepage `/` is present in `page-sitemap.xml`. It must be classified as `page` with `keep` disposition. In Hugo the homepage is served from `content/_index.md` (not a regular page file), so migration scripts must treat this URL specially rather than generating a standard content file.
    - ⚠️ **Live-site flag:** `/sample-page/` is a WordPress installation default page present in `page-sitemap.xml`. It has no migration value and should be default `retire`. Also note that several URLs in `page-sitemap.xml` look like article-type content (e.g., `/versioning-of-content-assets/`, `/can-a-isslot-element-have-a-dynamic-id/`) — verify intended content type during classification review.
    - ⚠️ **Live-site flag:** `/video/` appears in `page-sitemap.xml` and is the video listing page, not a video-type URL. It must be classified as `page`, not `video`. Preserve it as `keep` unless page traffic data suggests otherwise. The video-type URLs (from `video-sitemap.xml`) are at root level (e.g., `/sfcc-introduction/`).
    - ⚠️ **Live-site flag:** Three pages form a nested URL hierarchy under `/ideas/`: `/ideas/` (parent listing), `/ideas/page-designer-add-ability-to-copy-paste-components/` and `/ideas/page-designer-dynamic-pages-optional-subcategories/` (child pages). WordPress hierarchical slugs must map to Hugo subdirectory paths (e.g., `content/pages/ideas/`) to preserve the URL structure. Verify that Hugo correctly emits these at their original paths.
  - [x] `category` — from `category-sitemap.xml`
  - [x] `video` — from `video-sitemap.xml`
    - ⚠️ **Live-site note:** All 5 video-sitemap URLs also appear in `post-sitemap.xml`. The classification of these URLs as `video` type takes precedence. Consolidated source provenance should reflect both sitemaps.
    - ⚠️ **Live-site flag:** Video URLs are at root level (e.g., `/sfcc-introduction/`), not under a `/video/` prefix. Do not confuse with the `/video/` listing page classified above under `page`.
  - [x] `landing` — from `e-landing-page-sitemap.xml`
    - ⚠️ **Live-site flag:** The single URL in this sitemap is `/elementor-landing-page-1179/` — an Elementor test/draft page that was accidentally published. It has no descriptive content and should be treated as a default `retire` candidate unless the site owner explicitly confirms otherwise. Verify before assigning `keep`.
  - [x] `system` — probed routes (`/wp-json/`, `/xmlrpc.php`, `/feed/`, etc.)
  - [x] `attachment` — `?attachment_id=` and media routes
  - [x] `pagination` — `/page/N/` routes
- [x] Apply default dispositions per class:
  - [x] `post` → `keep` (same path)
  - [x] `page` → `keep` (same path)
  - [x] `category` → `keep` by default; `merge` only with approval
  - [x] `video` → `keep` by default; `merge` only with approval
  - [x] `landing` → `keep` by default; `merge` only with approval
  - [x] `system` → `retire` by default; exceptions need approval
  - [x] `attachment` → `retire` or redirect to parent content
  - [x] `pagination` → assess measured value; default `retire` unless criteria met
- [x] Flag all `merge` and `retire` records with `has_organic_traffic: true` for SEO owner review
- [x] Flag all records with `has_external_links: true` for migration owner review
- [x] Assign `implementation_layer` for every non-`keep` record
- [x] Run redirect chain validation: ensure no `target_url` points to another non-`keep` URL
- [x] Generate `migration/url-manifest.json` via `scripts/classify-urls.js`
- [x] Generate `migration/url-manifest.csv` from JSON manifest
- [x] Validate entire manifest against schema using `zod`
- [x] Conduct joint review with SEO owner for all `merge` and `retire` decisions with organic traffic
- [x] Resolve all flagged records; document approval or escalation in Progress Log

---

### Out of Scope

- Implementing redirects in Hugo templates or CI (Phase 3 / Phase 6)
- Creating or converting content files (Phase 4)
- DNS configuration changes (Phase 7)
- Reviewing URL disposition for Phase 2+ URLs not in scope of current inventory

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-002 Done (`migration/url-inventory.normalized.json`) | Ticket | Ready |
| RHI-003 Done (canonical and URL invariant policy approved) | Ticket | Ready |
| SEO owner availability for disposition review | Access | Ready (retire queue approved 2026-03-09) |
| Migration owner availability for approval of `retire` records with traffic | Access | Ready (retire queue approved 2026-03-09) |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| SEO owner review delays classification completion | Medium | High | Begin automated classification of default dispositions while awaiting review of flagged records | Migration Engineer |
| High volume of `has_organic_traffic` records requiring individual approval | Medium | Medium | Batch approve by URL class; only individual URLs with >100 clicks in 90 days need per-record review | SEO Owner |
| `implementation_layer` unclear for some redirect patterns | Medium | High | Default to `edge-cdn` for complex cases; document as Phase 2 architecture dependency | Migration Owner |
| Redirect chain validation finds circular references | Low | High | Validate manifest with script before submitting for review; fail fast on cycles | Migration Engineer |
| `attachment` URLs redirect to deleted parent content | Medium | Medium | Default to `404`; only redirect when parent content is confirmed to exist in Phase 4 manifest | Migration Engineer |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Final outcomes:

- Implemented URL classification and manifest generation for the full normalized inventory (1199 URLs) with 100% coverage.
- Enforced schema validation, redirect-chain safety, and explicit implementation-layer assignment in generator logic.
- Produced owner-review queue and grouped summary CSV outputs for approval workflows.
- Captured owner approval for all `retire` records requiring SEO/Migration review.

**Delivered artefacts:**

- `migration/url-manifest.json`
- `migration/url-manifest.csv`
- `migration/url-manifest.owner-review-queue.csv`
- `migration/url-manifest.owner-review-summary.csv`
- `scripts/classify-urls.js`

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-08 | In Progress | Implemented `scripts/classify-urls.js` and generated baseline `migration/url-manifest.json` and `migration/url-manifest.csv` (1199 records, 100% coverage, schema and chain validation passing); 132 `merge`/`retire` records with traffic/links queued for owner review |
| 2026-03-09 | In Progress | SEO/Migration owner approved the retire review queue CSV (`migration/url-manifest.owner-review-queue.csv`); approval applies to all 132 `retire` records with organic traffic and zero `merge` records with traffic |
| 2026-03-09 | Done | RHI-004 closure completed: acceptance criteria and Definition of Done verified, Phase 1 index synchronized, and all manifest/review artifacts ready for downstream phases |

---

### Notes

- The field schema for `migration/url-manifest.json` is the normative reference from `analysis/plan/details/phase-1.md` §Workstream 3.
- Any URL class outside the defined taxonomy is a Phase 1 blocker until policy is defined (per phase-1.md §URL Class Taxonomy rule 1).
- Governance rules for this manifest are enforced by `.github/instructions/migration-data.instructions.md`.
- Reference: `analysis/plan/details/phase-1.md` §Workstream 3, §URL Class Taxonomy
