## RHI-087 · Workstream D — Structured Data and Social Preview Gates

**Status:** Open  
**Priority:** High  
**Estimate:** M  
**Phase:** 8  
**Assigned to:** SEO Owner  
**Target date:** 2026-06-09  
**Created:** 2026-03-08  
**Updated:** 2026-03-08

---

### Goal

Confirm that every page template emits well-formed, content-accurate structured data and valid social preview metadata before launch. Rich-result eligibility and social sharing quality depend on these signals; defects here are not caught by users until search snippets degrade or social previews break. Validate at the representative template level — not just spot-check one URL — so class-wide defects in shared partials are caught before go/no-go.

---

### Acceptance Criteria

- [ ] Structured data (JSON-LD) is present and valid on all representative template types:
  - [ ] `WebSite` schema on the homepage
  - [ ] `BlogPosting` or `Article` schema on post/article templates
  - [ ] `BreadcrumbList` schema on post and category templates (if implemented)
  - [ ] `VideoObject` schema on video templates (if in scope)
  - [ ] No schema types emitted on templates where they are not applicable (e.g., `BlogPosting` must not appear on list/category pages)
- [ ] Structured data quality:
  - [ ] All required properties for each schema type are present and non-empty
  - [ ] `datePublished` and `dateModified` use ISO 8601 format with timezone offset
  - [ ] `url`, `mainEntityOfPage`, and `@id` values are absolute HTTPS `www.rhino-inquisitor.com` URLs
  - [ ] All string values passed through Hugo's `jsonify` function (no raw unescaped HTML in JSON-LD)
  - [ ] Schema values match visible page content (headline matches `<h1>`, image URL resolves)
- [ ] Representative template URLs pass the Google Rich Results Test with no critical errors:
  - [ ] Homepage
  - [ ] At least 2 post/article pages
  - [ ] At least 1 category page (if BreadcrumbList is emitted)
  - [ ] At least 1 video page (if VideoObject is emitted)
  - [ ] Rich Results Test results are documented with screenshots or export
- [ ] Open Graph tags are present and correct on all pages in sample matrix:
  - [ ] `og:title` — present and matches `<title>`
  - [ ] `og:description` — present and matches `<meta name="description">`
  - [ ] `og:url` — present, absolute HTTPS `www.rhino-inquisitor.com` URL
  - [ ] `og:type` — `article` for posts; `website` for homepage and list pages
  - [ ] `og:image` — present on all pages that have a hero image; URL resolves with HTTP 200; minimum 1200×630 px recommended for sharing cards
- [ ] Twitter/X card tags are present and correct on all pages in sample matrix:
  - [ ] `twitter:card` — present (`summary_large_image` for article pages)
  - [ ] `twitter:title` — present
  - [ ] `twitter:description` — present
  - [ ] `twitter:image` — present where `og:image` is present; URL resolves
- [ ] Social preview images:
  - [ ] All `og:image` and `twitter:image` URLs in priority routes and sample matrix return HTTP 200
  - [ ] No broken image URLs in social preview tags
- [ ] Gate output is machine-readable, archived as CI artifact, and committed:
  - [ ] `validation/structured-data-report.json` — per-URL: schema types found, required properties status, errors/warnings
  - [ ] `validation/social-preview-report.json` — per-URL: OG and Twitter tag presence, image URL resolution status

---

### Tasks

- [ ] Create `scripts/phase-8/check-structured-data.js`:
  - [ ] Parse each HTML file in sample matrix
  - [ ] Extract all `<script type="application/ld+json">` blocks
  - [ ] Validate JSON-LD syntax (parseable JSON)
  - [ ] Validate required schema types by template family (post → BlogPosting, home → WebSite, etc.)
  - [ ] Check required properties for each type: `headline`, `datePublished`, `dateModified`, `author`, `publisher`, `url`, `image` for BlogPosting
  - [ ] Validate ISO 8601 datetime format
  - [ ] Verify no raw HTML fragments in string values (check for `<` and `>` characters)
  - [ ] Flag any schema type appearing on a template where it is not appropriate
  - [ ] Output `validation/structured-data-report.json`
  - [ ] Exit with non-zero code on critical errors (missing required schema on homepage or article template; invalid JSON)
- [ ] Create `scripts/phase-8/check-social-preview.js`:
  - [ ] Parse each HTML file in sample matrix and priority routes
  - [ ] Extract all OG and Twitter meta tags
  - [ ] Validate presence of required tags per template type
  - [ ] Collect all unique image URLs from `og:image` and `twitter:image` tags
  - [ ] For each image URL: verify it resolves to HTTP 200 (use a static check against `public/` or a HEAD request)
  - [ ] Output `validation/social-preview-report.json`
  - [ ] Exit with non-zero code on blocking failures (missing `og:image` on priority pages; broken image URLs)
- [ ] Run Google Rich Results Test manually on representative URLs:
  - [ ] Homepage
  - [ ] At least 2 post pages
  - [ ] At least 1 category page
  - [ ] At least 1 video page (if applicable)
  - [ ] Record results (screenshots or test result export) in `validation/rich-results-test-evidence/`
- [ ] Run both structured data and social preview gate scripts against the RC build; archive reports as CI artifacts with 30-day retention
- [ ] Update `.github/workflows/deploy-pages.yml`:
  - [ ] Add structured data gate as blocking step
  - [ ] Add social preview gate as blocking step (image URL resolution failures are blocking)
  - [ ] Upload all gate reports as CI artifacts
- [ ] Add `package.json` scripts:
  - [ ] `"check:structured-data": "node scripts/phase-8/check-structured-data.js"`
  - [ ] `"check:social-preview": "node scripts/phase-8/check-social-preview.js"`

---

### Out of Scope

- Validating schema markup not already defined in the Phase 5 SEO architecture (no new schema types added here)
- Submitting Rich Results feedback to Google (post-launch monitoring in Phase 9)
- Template-level changes to add missing structured data (requires RC re-cut per RHI-084 protocol)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-083 Done — Phase 8 Bootstrap complete | Ticket | Pending |
| RHI-084 Done — RC frozen, sample matrix and priority routes committed | Ticket | Pending |
| Phase 5 RHI-052 Done — Structured data templates implemented | Phase | Pending |
| `og:`, `twitter:` meta tag templates implemented in Phase 3/5 SEO partials | Phase | Pending |
| Hero images committed to `static/` and paths confirmed in front matter | Phase | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Required schema type missing on article or homepage template | Medium | High | Blocking defect; requires template fix and RC re-cut; escalate to engineering owner | Engineering Owner |
| `og:image` URLs broken (images not committed or wrong path) | Medium | High | Blocking defect; fix media asset paths and re-cut RC; social previews on all priority pages are non-negotiable | Engineering Owner |
| Raw HTML fragments in JSON-LD values (title or description contains HTML from migration) | Medium | Medium | Run `jsonify` validation in the structured data check script; fix template to pipe through Hugo `jsonify` | Engineering Owner |
| Rich Results Test fails on a template for a reason not caught by automated checks | Low | Medium | Manual Rich Results Test runs cover templates that automated checks may miss (e.g., Google-specific validation rules); fix before sign-off | SEO Owner |
| Social preview image dimensions too small for sharing card quality | Low | Low | Document image dimensions; flag as warning but not blocking if image is present and resolves | SEO Owner |

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

- `scripts/phase-8/check-structured-data.js` — JSON-LD schema gate script
- `scripts/phase-8/check-social-preview.js` — OG/Twitter tag and image resolution gate
- `validation/structured-data-report.json` — per-URL structured data results from RC build
- `validation/social-preview-report.json` — per-URL OG/Twitter results from RC build
- `validation/rich-results-test-evidence/` — manual Rich Results Test screenshots or exports
- Updated `package.json` with structured data and social preview gate scripts
- Updated `.github/workflows/deploy-pages.yml` with both gates wired as blocking steps

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | Open | Ticket created |

---

### Notes

- Structured data defects are silent at launch: pages render correctly for users but lose rich-result eligibility in search. Catching this before launch is far cheaper than recovering rich-result status after the fact.
- The `jsonify` requirement is not just a best practice — it is a security control. Unescaped HTML in JSON-LD strings can produce JSON injection that breaks the structured data block or exposes XSS vectors in contexts that evaluate the JSON.
- Rich Results Test runs must be done against the deployed RC URL (not against `file://` paths). If the RC is deployed to a staging environment, use that environment's URL for the test.
- Social preview images must be committed to the `static/` directory (not externally hosted) unless a CDN strategy was explicitly decided in Phase 4.
- Reference: `analysis/plan/details/phase-8.md` §Workstream D: Structured Data and Social Preview Gates; `.github/instructions/hugo-coding-standards.instructions.md` §Template and Partial Standards
