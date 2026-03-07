## RHI-024 · Workstream E — SEO Foundation Implementation

**Status:** Open  
**Priority:** High  
**Estimate:** M  
**Phase:** 3  
**Assigned to:** SEO Owner  
**Target date:** 2026-04-02  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Validate and complete the full SEO signal layer on top of the template scaffold (RHI-023): verify that every indexable page type emits correct canonical, meta, Open Graph, Twitter card, and structured data; that `sitemap.xml` and `robots.txt` match the approved host policy; that staging environments enforce `noindex` through meta tags (not only `robots.txt`); and that feed output paths are compatible with the WordPress migration. This ticket is the final SEO-correctness gate before Phase 4 content begins flowing in at volume.

---

### Acceptance Criteria

- [ ] Every indexable page type (article, page, homepage, archive, category/term) produces:
  - [ ] Unique `<title>` (max 60 chars recommended)
  - [ ] `<meta name="description">` (120–155 chars)
  - [ ] `<link rel="canonical">` pointing to the absolute `https://www.rhino-inquisitor.com/...` URL
  - [ ] `og:title`, `og:description`, `og:type`, `og:url`, `og:image`
  - [ ] Twitter/X card tags
- [ ] `BlogPosting` JSON-LD is emitted on article templates only — not on list, taxonomy, or homepage templates
- [ ] `WebSite` JSON-LD is emitted on the homepage
- [ ] `BreadcrumbList` JSON-LD is emitted on templates with a meaningful hierarchy (articles, category terms)
- [ ] All JSON-LD blocks are valid JSON (no unescaped special characters): verified with automated check
- [ ] `datePublished` and `dateModified` in JSON-LD use ISO 8601 format with timezone
- [ ] `public/sitemap.xml` is generated in production build and:
  - [ ] Contains only indexable pages (no `draft: true` content)
  - [ ] All URLs use the canonical `https://www.rhino-inquisitor.com/` base
  - [ ] Alias/redirect pages are excluded from sitemap entries
- [ ] `public/robots.txt` is generated in production build and:
  - [ ] Does not accidentally block crawling of production content
  - [ ] Contains a `Sitemap:` directive pointing to `https://www.rhino-inquisitor.com/sitemap.xml`
  - [ ] Does not use `Disallow` as the sole mechanism for de-indexing
- [ ] Staging environment enforces `noindex` via `<meta name="robots" content="noindex">` — not only `robots.txt Disallow`
- [ ] Feed output path decision from RHI-013/RHI-021 is implemented:
  - [ ] If WordPress `/feed/` is redirected: alias or redirect page exists and target is correct
  - [ ] If `/feed/` is retired: disposition is recorded and no soft-404 risk exists
- [ ] SEO smoke-check script (`scripts/check-seo.js`) exists and:
  - [ ] Validates presence of canonical, meta description, and JSON-LD on representative pages in `public/`
  - [ ] Exits with non-zero code if any required SEO element is missing
  - [ ] Is referenced in `package.json` as `npm run check:seo`

---

### Tasks

- [ ] Verify template outputs from RHI-023 against SEO criteria for each page type (inspect built `public/` HTML):
  - [ ] Article: canonical, meta description, og:*, Twitter card, `BlogPosting` JSON-LD
  - [ ] Page: canonical, meta description, og:*, Twitter card (no `BlogPosting` JSON-LD)
  - [ ] Homepage: canonical, meta description, og:*, `WebSite` JSON-LD
  - [ ] Archive/list: canonical, meta description, og:* (no `BlogPosting` JSON-LD)
  - [ ] Category/term: canonical, meta description, og:*, `BreadcrumbList` JSON-LD
- [ ] Fix any missing or incorrect SEO signal in templates (coordinate with RHI-023 if template changes needed)
- [ ] Validate `sitemap.xml`:
  - [ ] Build with sample draft and non-draft content
  - [ ] Confirm draft pages are absent from sitemap
  - [ ] Confirm all sitemap URLs use the canonical www base
  - [ ] Confirm URL count is consistent with non-draft content count
- [ ] Validate `robots.txt`:
  - [ ] Review directives for accidental blocking
  - [ ] Confirm `Sitemap:` directive is present and correct
  - [ ] Confirm production `robots.txt` does not contain `Disallow: /` or any directive blocking production content
- [ ] Implement staging `noindex` control:
  - [ ] Create `config/staging/hugo.toml` or template condition that emits `<meta name="robots" content="noindex">` in staging builds
  - [ ] Verify staging build does NOT emit `noindex` in production build
  - [ ] Confirm staging protection does not rely solely on `robots.txt Disallow`
- [ ] Implement feed path disposition (per RHI-013 decision):
  - [ ] If redirecting `/feed/` → add alias or redirect page in `static/feed/index.html`
  - [ ] Verify redirect target is correct and does not create a redirect chain
- [ ] Create `scripts/check-seo.js`:
  - [ ] Read HTML files from `public/` using `fast-glob`
  - [ ] Check each representative template type for: `<link rel="canonical">`, `<meta name="description">`, valid JSON-LD block presence
  - [ ] Output list of failing pages with missing element names
  - [ ] Exit 1 on any failure
- [ ] Add `"check:seo": "node scripts/check-seo.js"` to `package.json` scripts
- [ ] Run `npm run check:seo` on scaffold build — confirm pass
- [ ] Validate at least one article template through [Google Rich Results Test](https://search.google.com/test/rich-results) (manual check; log result in Progress Log)
- [ ] Commit `scripts/check-seo.js`, any staging config changes, and feed path artifacts

---

### Out of Scope

- Final `robots.txt` content policy beyond draft blocking and sitemap reference (advanced Disallow rules are post-launch scope)
- Paid Search Console integration or GSC property verification (Phase 9)
- Full SEO audit against WordPress baseline (Phase 8)
- Social image creation (Phase 4 media scope)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-019 Done — Phase 3 Bootstrap complete | Ticket | Pending |
| RHI-021 Done — Output formats (sitemap, robots, RSS) enabled in config | Ticket | Pending |
| RHI-023 Done — Template scaffold with SEO partials committed | Ticket | Pending |
| RHI-013 Outcomes — Feed endpoint disposition (redirect/retire) approved | Ticket | Pending |
| RHI-014 Outcomes — SEO partial architecture and JSON-LD obligations approved | Ticket | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| `BlogPosting` JSON-LD emitted on non-article pages, producing invalid structured data | Medium | Medium | Enforce type guard `{{ if eq .Type "posts" }}` in json-ld-article.html; verify with automated check | Engineering Owner |
| Staging `noindex` accidentally included in production build | Medium | High | Use explicit environment config split; add CI test that production build HTML does not contain `noindex` meta | Engineering Owner |
| Sitemap contains `draft: true` content due to environment flag mismatch | Low | High | Run build validation with `--environment production` flag only; confirm draft exclusion in acceptance check | Engineering Owner |
| Feed redirect creates a chain (e.g. `/feed/` → `/index.xml` → actual feed) | Low | Medium | Verify redirect target resolves in one hop; check for chains in parity check | SEO Owner |
| JSON-LD fails Rich Results Test due to missing required field | Medium | Medium | Use Google Rich Results Test as manual acceptance step before close | SEO Owner |

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

- `scripts/check-seo.js` — SEO smoke-check script
- `config/staging/hugo.toml` (or equivalent staging `noindex` config)
- Feed path artifact (static redirect page or alias, per RHI-013 decision)
- `package.json` updated with `check:seo` script
- Progress Log entry with Rich Results Test result

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- **Canonical tags do not replace redirects.** If a URL has moved, a canonical pointing to the new location is helpful but not sufficient — a redirect must also exist. Do not close this ticket with canonical-only coverage for moved URLs; ensure RHI-025 covers those cases.
- Staging de-indexing must use `<meta name="robots" content="noindex">` because `robots.txt Disallow` can be ignored by some crawlers and does not guarantee de-indexing. See phase-3.md §Audit Corrections Applied.
- Do not use `robots.txt` as a canonicalization mechanism. Its purpose is crawl access control, not duplicate URL resolution.
- Reference: `analysis/plan/details/phase-3.md` §Workstream E: SEO Foundation Implementation; `.github/instructions/seo-compliance.instructions.md`
