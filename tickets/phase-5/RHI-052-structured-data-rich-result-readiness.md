## RHI-052 · Workstream E — Structured Data and Rich-Result Readiness

**Status:** Open  
**Priority:** High  
**Estimate:** M  
**Phase:** 5  
**Assigned to:** SEO Owner  
**Target date:** 2026-04-18  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Validate that JSON-LD structured data is emitted correctly for all applicable template families, contains the required properties, and reflects visible page content. Verify that rich-result eligibility is maintained for article, video, and breadcrumb schema types that were likely present or intended on the WordPress site.

Rich-result eligibility is a meaningful discovery advantage. Schema errors introduced during migration — missing `author`, wrong `datePublished` format, or `BlogPosting` emitted on a list template — will be detected by Google's validators and reported as search enhancement losses. This workstream catches those errors before they reach production.

---

### Acceptance Criteria

- [ ] `migration/phase-5-structured-data-coverage.md` is committed and contains:
  - [ ] Schema type inventory: which schema types are emitted and on which template families
  - [ ] Required property checklist for each emitted schema type
  - [ ] Template mapping: `baseof.html` site-level schemas vs. `single.html` article schemas vs. `list.html` taxonomy schemas
  - [ ] Confirmed scope: `WebSite`, `BlogPosting` (or `Article`), `BreadcrumbList`, `VideoObject` (if applicable)
- [ ] Structured data validation script `scripts/seo/check-schema.js` exists and:
  - [ ] Parses `<script type="application/ld+json">` blocks from generated HTML in `public/`
  - [ ] Validates `WebSite` schema: `@type`, `url`, `name` present
  - [ ] Validates `BlogPosting`/`Article` schema: `@type`, `headline`, `url`, `datePublished`, `dateModified`, `author`, `description` present
  - [ ] Validates `datePublished` and `dateModified` are valid ISO 8601 format with timezone offset
  - [ ] Validates `author` is an object with `@type` and `name` properties
  - [ ] Validates structured data values match visible page content (headline matches `<title>` or `<h1>`)
  - [ ] Validates `BlogPosting`/`Article` is NOT emitted on list or taxonomy pages
  - [ ] Validates all string values in JSON-LD are not raw Hugo template expressions (detect `{{` in output)
  - [ ] Produces `migration/reports/phase-5-schema-audit.csv` with per-page results
  - [ ] Exits with non-zero code on any required-property or format defect
  - [ ] Is referenced in `package.json` as `npm run check:schema`
- [ ] Manual Google Rich Results Test validation passes for:
  - [ ] Homepage
  - [ ] One article page
  - [ ] One category page (if BreadcrumbList is emitted)
  - [ ] One video page (if VideoObject is emitted)
- [ ] `VideoObject` schema emitted only on pages with qualifying video content (not on all posts)
- [ ] `BreadcrumbList` schema emitted on pages with hierarchical navigation where it reflects actual page hierarchy
- [ ] `migration/reports/phase-5-schema-audit.csv` achieves zero critical errors on the representative template set
- [ ] `npm run check:schema` integrated as a blocking CI gate in the deploy workflow

---

### Tasks

- [ ] Audit Phase 3 JSON-LD partial templates (from RHI-024):
  - [ ] Review `layouts/partials/seo/json-ld-article.html` (or equivalent) for required properties
  - [ ] Verify `datePublished` and `dateModified` use ISO 8601 format with Hugo `.Date.Format`
  - [ ] Verify all string values pass through Hugo `jsonify` function
  - [ ] Verify `BlogPosting` is not emitted on list or taxonomy templates
  - [ ] Verify `WebSite` schema is present in `baseof.html` or site-level partial
  - [ ] Assess `BreadcrumbList` — determine if current navigation hierarchy warrants it
  - [ ] Assess `VideoObject` — identify which video page templates qualify
- [ ] Draft `migration/phase-5-structured-data-coverage.md` based on audit findings
- [ ] Create `scripts/seo/check-schema.js`:
  - [ ] Use `cheerio` to extract `<script type="application/ld+json">` blocks
  - [ ] Parse JSON and validate required properties per type
  - [ ] Validate ISO 8601 dates with timezone
  - [ ] Validate `headline` matches `<title>` or `<h1>` content (fuzzy match acceptable)
  - [ ] Detect raw Hugo template expression leakage (`{{` in JSON-LD output)
  - [ ] Write per-page results to `migration/reports/phase-5-schema-audit.csv`
- [ ] Fix any critical template defects identified in the audit before running the script
- [ ] Run Rich Results Test manually on representative page set; document results in Progress Log
- [ ] Add `"check:schema": "node scripts/seo/check-schema.js"` to `package.json`
- [ ] Integrate `check:schema` as a blocking step in the deploy CI workflow

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
| RHI-047 Done — Phase 5 Bootstrap complete | Ticket | Pending |
| RHI-024 Done — Phase 3 SEO foundation (JSON-LD partials committed) | Ticket | Pending |
| RHI-023 Done — Phase 3 template scaffolding (single.html, list.html, baseof.html) | Ticket | Pending |
| RHI-035 Done — Phase 4 front matter mapping (date, lastmod, author fields populated) | Ticket | Pending |
| `cheerio` available in `package.json` | Tool | Pending |

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- `migration/phase-5-structured-data-coverage.md`
- `scripts/seo/check-schema.js`
- `migration/reports/phase-5-schema-audit.csv`
- `package.json` updated with `check:schema` script
- CI workflow updated with `check:schema` blocking gate
- Rich Results Test manual evidence recorded in Progress Log

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- Hugo's `jsonify` function must be used for all string values in `<script type="application/ld+json">` blocks. A raw `{{ .Title }}` in JSON-LD can break the JSON if the title contains quotes or special characters. Verify every string value in the Phase 3 partial uses `jsonify`.
- Emitting `BlogPosting` structured data on list pages can cause rich-result ineligibility or policy issues. Confirm template conditional guards use explicit type checks (`{{ if eq .Type "posts" }}`) rather than implicit `.IsPage` checks.
- Reference: `analysis/plan/details/phase-5.md` §Workstream E: Structured Data and Rich-Result Readiness
