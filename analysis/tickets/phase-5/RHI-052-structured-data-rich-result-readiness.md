## RHI-052 · Workstream E — Structured Data and Rich-Result Readiness

**Status:** Done  
**Priority:** High  
**Estimate:** M  
**Phase:** 5  
**Assigned to:** SEO Owner  
**Target date:** 2026-04-18  
**Created:** 2026-03-07  
**Updated:** 2026-03-13

---

### Goal

Validate that JSON-LD structured data is emitted correctly for all applicable template families, contains the required properties, and reflects visible page content. Verify that rich-result eligibility is maintained for article, video, and breadcrumb schema types that were likely present or intended on the WordPress site.

Rich-result eligibility is a meaningful discovery advantage. Schema errors introduced during migration — missing `author`, wrong `datePublished` format, or `BlogPosting` emitted on a list template — will be detected by Google's validators and reported as search enhancement losses. This workstream catches those errors before they reach production.

---

### Acceptance Criteria

- [x] `migration/phase-5-structured-data-coverage.md` is committed and contains:
  - [x] Schema type inventory: which schema types are emitted and on which template families
  - [x] Required property checklist for each emitted schema type
  - [x] Template mapping: `baseof.html` site-level schemas vs. `single.html` article schemas vs. `list.html` taxonomy schemas
  - [x] Confirmed scope: `WebSite`, `BlogPosting` (or `Article`), `BreadcrumbList`, `VideoObject` (if applicable)
- [x] Structured data validation script `scripts/seo/check-schema.js` exists and:
  - [x] Parses `<script type="application/ld+json">` blocks from generated HTML in `public/`
  - [x] Validates `WebSite` schema: `@type`, `url`, `name` present
  - [x] Validates `BlogPosting`/`Article` schema: `@type`, `headline`, `url`, `datePublished`, `dateModified`, `author`, `description` present
  - [x] Validates `datePublished` and `dateModified` are valid ISO 8601 format with timezone offset
  - [x] Validates `author` is an object with `@type` and `name` properties
  - [x] Validates structured data values match visible page content (headline matches `<title>` or `<h1>`)
  - [x] Validates `BlogPosting`/`Article` is NOT emitted on list or taxonomy pages
  - [x] Validates all string values in JSON-LD are not raw Hugo template expressions (detect `{{` in output)
  - [x] Produces `migration/reports/phase-5-schema-audit.csv` with per-page results
  - [x] Exits with non-zero code on any required-property or format defect
  - [x] Is referenced in `package.json` as `npm run check:schema`
- [x] Manual Google Rich Results Test validation passes for:
  - [x] Homepage evidence is recorded and accepted as `No items detected` for `WebSite` markup when homepage `WebSite` properties pass `check:schema`
  - [x] One article page
  - [x] One category page (if BreadcrumbList is emitted)
  - [x] One video page (if VideoObject is emitted) or is explicitly not applicable because `VideoObject` is not implemented
- [x] `VideoObject` schema emitted only on pages with qualifying video content (not on all posts)
- [x] `BreadcrumbList` schema emitted on pages with hierarchical navigation where it reflects actual page hierarchy
- [x] `migration/reports/phase-5-schema-audit.csv` achieves zero critical errors on the representative template set
- [x] `npm run check:schema` integrated as a blocking CI gate in the deploy workflow

---

### Tasks

- [x] Audit Phase 3 JSON-LD partial templates (from RHI-024):
  - [x] Review `src/layouts/partials/seo/json-ld-article.html` (or equivalent) for required properties
  - [x] Verify `datePublished` and `dateModified` use ISO 8601 format with Hugo `.Date.Format`
  - [x] Verify all string values pass through Hugo `jsonify` function
  - [x] Verify `BlogPosting` is not emitted on list or taxonomy templates
  - [x] Verify `WebSite` schema is present in `baseof.html` or site-level partial
  - [x] Assess `BreadcrumbList` — determine if current navigation hierarchy warrants it
  - [x] Assess `VideoObject` — identify which video page templates qualify
- [x] Draft `migration/phase-5-structured-data-coverage.md` based on audit findings
- [x] Create `scripts/seo/check-schema.js`:
  - [x] Use `cheerio` to extract `<script type="application/ld+json">` blocks
  - [x] Parse JSON and validate required properties per type
  - [x] Validate ISO 8601 dates with timezone
  - [x] Validate `headline` matches `<title>` or `<h1>` content (fuzzy match acceptable)
  - [x] Detect raw Hugo template expression leakage (`{{` in JSON-LD output)
  - [x] Write per-page results to `migration/reports/phase-5-schema-audit.csv`
- [x] Fix any critical template defects identified in the audit before running the script
- [x] Run Rich Results Test manually on representative page set; document results in Progress Log
- [x] Add `"check:schema": "node scripts/seo/check-schema.js"` to `package.json`
- [x] Integrate `check:schema` as a blocking step in the deploy CI workflow

---

### Out of Scope

- Schema types not currently used by the site (e.g., `Recipe`, `HowTo`, `FAQ`) unless present in WordPress
- Schema optimization for new content types not in the migration scope
- `schema-dts` TypeScript type library (optional — only if TypeScript is adopted in tooling)
- Post-launch Search Console rich-result performance monitoring (Workstream J, RHI-057)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-047 Done — Phase 5 Bootstrap complete | Ticket | Done |
| RHI-024 Done — Phase 3 SEO foundation (JSON-LD partials committed) | Ticket | Done |
| RHI-023 Done — Phase 3 template scaffolding (single.html, list.html, baseof.html) | Ticket | Done |
| RHI-035 Done — Phase 4 front matter mapping (date, lastmod, author fields populated) | Ticket | Done |
| `cheerio` available in `package.json` | Tool | Available |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| `datePublished` populated with incorrect timezone or format (e.g., no timezone offset) | Medium | Medium | Validate ISO 8601 format with timezone in `check:schema`; fix Hugo date template if needed | Engineering Owner |
| `author` field missing from migrated post front matter, causing invalid `BlogPosting` | High | Medium | Phase 4 WS-D (RHI-035) should populate `author`; add `author` to SEO completeness check as a warning | SEO Owner |
| Raw Hugo template expressions appear in JSON-LD output when partial variables are undefined | Medium | High | Template expression leak check in `check:schema` catches this; fix template conditionals before release | Engineering Owner |
| `VideoObject` emitted on pages without qualifying video content | Low | Medium | Scope VideoObject to a dedicated video page template, not the general post template | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-052 is complete. The automated schema gate, coverage artefacts, and CI enforcement are in place, and manual Google Rich Results Test evidence is now recorded for representative homepage, article, and category samples. The homepage acceptance criterion is satisfied by explicit evidence language: Google Rich Results Test reports `No items detected` for homepage `WebSite` markup, and that outcome is accepted because homepage `WebSite` properties are validated by `check:schema` and `WebSite` is not a supported Google rich-result type.

**Delivered artefacts:**

- `migration/phase-5-structured-data-coverage.md`
- `scripts/seo/check-schema.js`
- `migration/reports/phase-5-schema-audit.csv`
- `src/layouts/partials/seo/json-ld-breadcrumb.html` updated to suppress breadcrumb schema on the 404 page
- `package.json` updated with `check:schema` script
- CI workflows updated with `check:schema` blocking gates
- `analysis/documentation/phase-5/rhi-052-structured-data-rich-result-readiness-implementation-2026-03-13.md`
- Manual Rich Results Test evidence captured for category, article, and homepage behavior

**Deviations from plan:**

- Homepage Rich Results Test does not produce a rich-result item for `WebSite` markup. The ticket now treats the recorded `No items detected` result as expected tool behavior rather than a homepage schema defect, while keeping the automated schema gate as the homepage validity control.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-13 | In Progress | Added `check:schema`, committed the structured-data coverage artifact, wired the schema audit into the PR and deploy workflows, fixed 404 breadcrumb schema leakage, and generated `migration/reports/phase-5-schema-audit.csv` with `223` scanned HTML pages and `0` critical failures. Manual Google Rich Results Test evidence is still pending before the ticket can move to Done. |
| 2026-03-13 | In Progress | Recorded manual Google Rich Results Test evidence: `/category/video/` returned `1` valid Breadcrumbs item, `/a-dev-guide-to-combating-fraud-on-sfcc/` returned `2` valid items (`Articles` plus `Breadcrumbs`) with non-critical article issues, and `/` returned `No items detected` because `WebSite` is not a supported Google rich-result type. The ticket remains open until the homepage acceptance criterion is clarified or revised. |
| 2026-03-13 | Done | User approved revising the homepage acceptance wording to match observed Google behavior. Homepage `WebSite` markup remains governed by `check:schema`, while the recorded Rich Results Test result of `No items detected` is accepted as expected for a non-supported rich-result type. |

---

### Notes

- Hugo's `jsonify` function must be used for all string values in `<script type="application/ld+json">` blocks. A raw `{{ .Title }}` in JSON-LD can break the JSON if the title contains quotes or special characters. Verify every string value in the Phase 3 partial uses `jsonify`.
- Emitting `BlogPosting` structured data on list pages can cause rich-result ineligibility or policy issues. Confirm template conditional guards use explicit type checks (`{{ if eq .Type "posts" }}`) rather than implicit `.IsPage` checks.
- Reference: `analysis/plan/details/phase-5.md` §Workstream E: Structured Data and Rich-Result Readiness
