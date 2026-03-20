## RHI-087 · Workstream D — Structured Data and Social Preview Gates

**Status:** Done  
**Priority:** High  
**Estimate:** M  
**Phase:** 8  
**Assigned to:** SEO Owner  
**Target date:** 2026-06-09  
**Created:** 2026-03-08  
**Updated:** 2026-03-20

---

### Goal

Confirm that every page template emits well-formed, content-accurate structured data and valid social preview metadata before launch. Rich-result eligibility and social sharing quality depend on these signals; defects here are not caught by users until search snippets degrade or social previews break. Validate at the representative template level — not just spot-check one URL — so class-wide defects in shared partials are caught before go/no-go.

---

### Acceptance Criteria

- [x] Structured data (JSON-LD) is present and valid on all representative template types:
  - [x] `WebSite` schema on the homepage
  - [x] `BlogPosting` or `Article` schema on post/article templates
  - [x] `BreadcrumbList` schema on post and category templates (if implemented)
  - [x] `VideoObject` schema on video templates (if in scope)
  - [x] No schema types emitted on templates where they are not applicable (e.g., `BlogPosting` must not appear on list/category pages)
- [x] Structured data quality:
  - [x] All required properties for each schema type are present and non-empty
  - [x] `datePublished` and `dateModified` use ISO 8601 format with timezone offset
  - [x] `url`, `mainEntityOfPage`, and `@id` values are absolute HTTPS `www.rhino-inquisitor.com` URLs
  - [x] All string values passed through Hugo's `jsonify` function (no raw unescaped HTML in JSON-LD)
  - [x] Schema values match visible page content (headline matches `<h1>`, image URL resolves)
- [x] Representative template validation passes Google Rich Results Test code mode with no critical errors using the local production HTML artifact:
  - [x] Homepage sample from `validation/sample-matrix.json` returned `No items detected` and no critical errors
  - [x] First 2 post/article samples from `validation/sample-matrix.json` returned valid `Articles` and `Breadcrumbs` items
  - [x] First category sample from `validation/sample-matrix.json` returned a valid `Breadcrumbs` item
  - [x] First video sample from `validation/sample-matrix.json` returned valid `Videos` and `Breadcrumbs` items
  - [x] Rich Results Test results are documented with screenshots in `validation/rich-results-test-evidence/`
- [x] Open Graph tags are present and correct on all pages in sample matrix:
  - [x] `og:title` — present and matches `<title>`
  - [x] `og:description` — present and matches `<meta name="description">`
  - [x] `og:url` — present, absolute HTTPS `www.rhino-inquisitor.com` URL
  - [x] `og:type` — `article` for posts; `website` for homepage and list pages
  - [x] `og:image` — present on all pages that have a hero image; URL resolves with HTTP 200; minimum 1200×630 px recommended for sharing cards
- [x] Twitter/X card tags are present and correct on all pages in sample matrix:
  - [x] `twitter:card` — present (`summary_large_image` for article pages)
  - [x] `twitter:title` — present
  - [x] `twitter:description` — present
  - [x] `twitter:image` — present where `og:image` is present; URL resolves
- [x] Social preview images:
  - [x] All `og:image` and `twitter:image` URLs in priority routes and sample matrix return HTTP 200
  - [x] No broken image URLs in social preview tags
- [x] Gate output is machine-readable, archived as CI artifact, and committed:
  - [x] `validation/structured-data-report.json` — per-URL: schema types found, required properties status, errors/warnings
  - [x] `validation/social-preview-report.json` — per-URL: OG and Twitter tag presence, image URL resolution status

---

### Tasks

- [x] Create `scripts/phase-8/check-structured-data.js`:
  - [x] Parse each HTML file in sample matrix
  - [x] Extract all `<script type="application/ld+json">` blocks
  - [x] Validate JSON-LD syntax (parseable JSON)
  - [x] Validate required schema types by template family (post → BlogPosting, home → WebSite, etc.)
  - [x] Check required properties for each type: `headline`, `datePublished`, `dateModified`, `author`, `publisher`, `url`, `image` for BlogPosting
  - [x] Validate ISO 8601 datetime format
  - [x] Verify no raw HTML fragments in string values (check for `<` and `>` characters)
  - [x] Flag any schema type appearing on a template where it is not appropriate
  - [x] Output `validation/structured-data-report.json`
  - [x] Exit with non-zero code on critical errors (missing required schema on homepage or article template; invalid JSON)
- [x] Create `scripts/phase-8/check-social-preview.js`:
  - [x] Parse each HTML file in sample matrix and priority routes
  - [x] Extract all OG and Twitter meta tags
  - [x] Validate presence of required tags per template type
  - [x] Collect all unique image URLs from `og:image` and `twitter:image` tags
  - [x] For each image URL: verify it resolves to HTTP 200 (use a static check against `public/` or a HEAD request)
  - [x] Output `validation/social-preview-report.json`
  - [x] Exit with non-zero code on blocking failures (missing `og:image` on priority pages; broken image URLs)
- [x] Run Google Rich Results Test manually in code mode against the local production HTML artifact:
  - [x] Homepage sample from `validation/sample-matrix.json`
  - [x] First 2 post samples from `validation/sample-matrix.json` sorted by front matter `date` descending
  - [x] First category sample from `validation/sample-matrix.json` sorted by category slug alphabetically
  - [x] First video sample from `validation/sample-matrix.json`
  - [x] Record results (screenshots) in `validation/rich-results-test-evidence/`
- [x] Run both structured data and social preview gate scripts against the accepted closeout build; archive reports as CI artifacts with 30-day retention
- [x] Update `.github/workflows/deploy-pages.yml`:
  - [x] Add structured data gate as blocking step
  - [x] Add social preview gate as blocking step (image URL resolution failures are blocking)
  - [x] Upload all gate reports as CI artifacts
- [x] Add `package.json` scripts:
  - [x] `"check:structured-data": "node scripts/phase-8/check-structured-data.js"`
  - [x] `"check:social-preview": "node scripts/phase-8/check-social-preview.js"`

---

### Out of Scope

- Validating schema markup not already defined in the Phase 5 SEO architecture (no new schema types added here)
- Submitting Rich Results feedback to Google (post-launch monitoring in Phase 9)
- Template-level changes to add missing structured data (requires RC re-cut per RHI-084 protocol)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-083 Done — Phase 8 Bootstrap complete | Ticket | Done |
| RHI-084 Done — RC frozen, sample matrix and priority routes committed | Ticket | Done |
| Phase 5 RHI-052 Done — Structured data templates implemented | Phase | Done |
| `og:`, `twitter:` meta tag templates implemented in Phase 3/5 SEO partials | Phase | Done |
| Hero images committed to `src/static/` and paths confirmed in front matter | Phase | Done |

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

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-087 is complete. The repo now enforces Phase 8 structured-data and social-preview validation through committed WS-D reports, blocking gate execution in the deployment flow, archived CI artifacts, and owner-approved Google Rich Results code-mode evidence captured from a clean local production build. The staging host remained intentionally blocked from indexing, so live-URL Rich Results mode was documented as a historical non-blocking limitation rather than used as the final closeout path.

**Delivered artefacts:**

- `scripts/phase-8/check-structured-data.js` — JSON-LD schema gate script
- `scripts/phase-8/check-social-preview.js` — OG/Twitter tag and image resolution gate
- `validation/structured-data-report.json` — per-URL structured data results from RC build
- `validation/social-preview-report.json` — per-URL OG/Twitter results from RC build
- `validation/rich-results-test-evidence/` — manual Rich Results Test screenshots or exports
- Updated `package.json` with structured data and social preview gate scripts
- Updated `.github/workflows/deploy-pages.yml` with both gates wired as blocking steps
- `analysis/documentation/phase-8/rhi-087-structured-data-social-preview-gates-2026-03-20.md` — implementation and closeout note for WS-D

**Deviations from plan:**

- Rich Results final evidence used Google code mode against a locally served production artifact instead of live-URL mode on staging, because staging is intentionally blocked from indexing and the owner explicitly approved the alternative evidence path.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | Open | Ticket created |
| 2026-03-20 | In Progress | Added `check:structured-data` and `check:social-preview`, generated passing WS-D branch-state reports, wired both gates into `scripts/phase-7/run-all-gates.sh`, and added 30-day WS-D artifact uploads in `.github/workflows/deploy-pages.yml`. |
| 2026-03-20 | In Progress | Verified the full `npm run gates:local` blocking chain passes with the new WS-D steps included. Structured-data report status: pass with `27` checked routes and `0` blocking failures. Social-preview report status: pass with `60` checked routes, `1` skipped system route, `0` blocking failures, and `21` advisory warnings (`20` below-recommendation social-image dimensions). |
| 2026-03-20 | In Progress | Attempted Google Rich Results live-URL validation against `https://staging.rhino-inquisitor.com/`, but Google returned `URL is not available to Google`. Blocker evidence was committed under `validation/rich-results-test-evidence/` while awaiting owner direction. |
| 2026-03-20 | Done | Owner approved Google Rich Results code mode against a clean local production build because staging is intentionally blocked from indexing. Captured screenshots for homepage, top 2 recent posts, first category sample, and first video sample. Homepage returned `No items detected` with no critical errors; posts returned valid `Articles` and `Breadcrumbs`; category returned valid `Breadcrumbs`; video page returned valid `Videos` and `Breadcrumbs`. |

---

### Notes

- Structured data defects are silent at launch: pages render correctly for users but lose rich-result eligibility in search. Catching this before launch is far cheaper than recovering rich-result status after the fact.
- The `jsonify` requirement is not just a best practice — it is a security control. Unescaped HTML in JSON-LD strings can produce JSON injection that breaks the structured data block or exposes XSS vectors in contexts that evaluate the JSON.
- Rich Results Test evidence for this ticket was completed in Google code mode against a clean locally served production artifact. That owner-approved approach replaced staging live-URL validation because the staging host is intentionally blocked from indexing.
- Social preview images must be committed to the `src/static/` directory (not externally hosted) unless a CDN strategy was explicitly decided in Phase 4.
- On 2026-03-20, Google Rich Results live-URL mode could not fetch the staging host and returned `URL is not available to Google` for `https://staging.rhino-inquisitor.com/`. That screenshot remains in `validation/rich-results-test-evidence/` for traceability, but it is not a closure blocker because the owner accepted code-mode validation against the production HTML artifact.
- Reference: `analysis/plan/details/phase-8.md` §Workstream D: Structured Data and Social Preview Gates; `.github/instructions/hugo-coding-standards.instructions.md` §Template and Partial Standards
