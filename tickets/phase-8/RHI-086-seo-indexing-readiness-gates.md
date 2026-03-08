## RHI-086 · Workstream C — SEO and Indexing Readiness Gates

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 8  
**Assigned to:** SEO Owner  
**Target date:** 2026-06-06  
**Created:** 2026-03-08  
**Updated:** 2026-03-08

---

### Goal

Verify that every indexable page has correct, self-consistent SEO signals — canonical tags, sitemap inclusion, robots directives, title, meta description — so crawlers and search engines receive unambiguous guidance at launch. SEO indexing regressions (canonical drift, accidental noindex, soft-404 patterns) are among the hardest migration failures to recover from because search engines take weeks to re-evaluate signals after corrections. This gate catches these regressions before the launch window.

---

### Acceptance Criteria

- [ ] Canonical tag consistency:
  - [ ] Every indexable page in the sample matrix has exactly one `<link rel="canonical">` in the HTML head
  - [ ] Each canonical tag uses an absolute HTTPS URL with the `www.rhino-inquisitor.com` host
  - [ ] Each canonical tag URL matches the page's own URL (self-canonical) — no page canonicalizes to a redirected or non-canonical host URL
  - [ ] Canonical and sitemap `<loc>` entries agree for every URL in `validation/sample-matrix.json`
  - [ ] No canonical tag points to a `github.io` or staging URL
- [ ] Sitemap integrity:
  - [ ] `sitemap.xml` is reachable at `https://www.rhino-inquisitor.com/sitemap.xml` (or equivalent path)
  - [ ] All `<loc>` elements in the sitemap use absolute HTTPS `www.rhino-inquisitor.com` URLs
  - [ ] Sitemap does not include Hugo alias/redirect helper pages
  - [ ] Sitemap passes protocol constraints: UTF-8 encoding, fully qualified URLs, under 50 MB uncompressed or 50,000 URLs per file
  - [ ] Sitemap `<lastmod>` values use ISO 8601 format
- [ ] Robots.txt:
  - [ ] `robots.txt` is served at the root (HTTP 200) or returns a proper 404 if intentionally absent
  - [ ] No `Disallow` rules accidentally block crawling of indexable production content
  - [ ] `Sitemap:` directive in `robots.txt` points to the production HTTPS canonical sitemap URL
  - [ ] If staging/preview environments exist, they use `<meta name="robots" content="noindex">` — not relying solely on `robots.txt Disallow`
- [ ] Noindex / indexability controls:
  - [ ] No accidental `noindex` on pages intended to be indexed (every page in sample matrix verified)
  - [ ] No `robots` meta tag on pages that are intended to be crawled and indexed
  - [ ] Pages that should be de-indexed (draft, staging, utility pages) have both `noindex` and remain crawlable so the directive is seen
- [ ] Metadata completeness:
  - [ ] Every page in the sample matrix has a unique `<title>` tag (≤ 60 chars recommended)
  - [ ] Every page in the sample matrix has a `<meta name="description">` (120–155 chars recommended)
  - [ ] No two pages in the full build share identical title tags (duplicate title check)
- [ ] Search Console verification continuity:
  - [ ] Existing Search Console properties for `www.rhino-inquisitor.com` and apex `rhino-inquisitor.com` are still verified
  - [ ] Any new host or protocol variant that will receive traffic post-cutover is added as a Search Console property
- [ ] Gate outputs are machine-readable, archived as CI artifacts, and committed:
  - [ ] `validation/seo-consistency-report.json` — per-URL: canonical URL, sitemap URL, match status, noindex flag, title, description, pass/fail
  - [ ] `validation/robots-sitemap-report.json` — sitemap entry count, disallowed paths, `Sitemap:` directive value, noindex pages list

---

### Tasks

- [ ] Create or update `scripts/phase-8/check-seo-consistency.js`:
  - [ ] Parse each HTML file in `public/` corresponding to the sample matrix and priority routes
  - [ ] Extract `<link rel="canonical">`, `<title>`, `<meta name="description">`, and `<meta name="robots">`
  - [ ] Validate canonical: absolute HTTPS www URL, self-referencing, no github.io URLs
  - [ ] Cross-reference canonical URL against sitemap `<loc>` entries for same page
  - [ ] Flag any missing, duplicate, or mismatched canonical
  - [ ] Flag any accidental `noindex` on indexable pages
  - [ ] Flag missing or too-short title or description
  - [ ] Output `validation/seo-consistency-report.json`
  - [ ] Exit with non-zero code on blocking failures (canonical mismatch on priority URLs, missing title/description on any sampled page)
- [ ] Create or update `scripts/phase-8/check-robots-sitemap.js`:
  - [ ] Parse `public/sitemap.xml` (and index file if present):
    - [ ] Count total `<loc>` entries
    - [ ] Verify all `<loc>` values are absolute HTTPS `www.rhino-inquisitor.com` URLs
    - [ ] Check file size and URL count against GitHub Pages sitemap constraints
    - [ ] Check UTF-8 encoding and `<lastmod>` ISO 8601 format
    - [ ] Verify no alias/redirect pages appear in the sitemap
  - [ ] Parse `public/robots.txt` if present:
    - [ ] Check for `Disallow` rules that block production content paths
    - [ ] Verify `Sitemap:` directive points to HTTPS canonical URL
  - [ ] Output `validation/robots-sitemap-report.json`
  - [ ] Exit with non-zero code on blocking failures
- [ ] Check for duplicate `<title>` tags across the full build output:
  - [ ] Use `fast-glob` to enumerate all HTML files in `public/`
  - [ ] Extract and count title occurrences
  - [ ] Flag duplicates as blocking defects (unless intentionally shared, e.g., pagination — document any exception)
- [ ] Verify Search Console property verification:
  - [ ] Confirm the `www.rhino-inquisitor.com` property exists and is verified in Search Console
  - [ ] Confirm the apex `rhino-inquisitor.com` property is present (or document why it is not needed)
  - [ ] Record verification status in Progress Log
- [ ] Run both SEO gates against the RC build; archive all reports as CI artifacts with 30-day retention
- [ ] Update `.github/workflows/deploy-pages.yml` to include both SEO gates as blocking pre-deploy steps
- [ ] Add `package.json` scripts:
  - [ ] `"check:seo-consistency": "node scripts/phase-8/check-seo-consistency.js"`
  - [ ] `"check:robots-sitemap": "node scripts/phase-8/check-robots-sitemap.js"`

---

### Out of Scope

- Fixing template-level SEO issues (changes require RC re-cut per RHI-084 protocol)
- Structured data validation (covered by RHI-087)
- Search Console submission of the sitemap (covered by Phase 9 scope, though preparation is confirmed here)
- Making changes to `robots.txt` content (a content change; confirm with Phase 5 SEO owner before any edit)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-083 Done — Phase 8 Bootstrap complete | Ticket | Pending |
| RHI-084 Done — RC frozen, sample matrix and priority routes committed | Ticket | Pending |
| Phase 7 SEO safety checks already passing (`npm run check:seo-safe-deploy`) | Phase | Pending |
| `fast-xml-parser` available in `package.json` | Tool | Pending |
| `fast-glob` and `gray-matter` available in `package.json` | Tool | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Canonical tag points to `github.io` staging domain on one or more pages | Medium | High | This is a critical failure; any `github.io` canonical is a blocking defect; check the Hugo base URL configuration in `hugo.toml` | Engineering Owner |
| Sitemap includes Hugo alias redirect pages, polluting indexing signals | Medium | High | Cross-check sitemap entries against known alias paths; alias files should not be in the sitemap — confirm Hugo default behavior holds | SEO Owner |
| `noindex` accidentally appears on one or more category or post templates | Low | High | Automated check catches this; verify the source of any `noindex` found (front matter, template partial, or CDN rule) | SEO Owner |
| Duplicate title tags across pagination or archive pages | Medium | Medium | Investigate and accept with documentation or fix; pagination pages with identical titles are acceptable if the URL is unique and canonical is self-referencing | SEO Owner |
| Search Console verification is no longer valid after domain change | Low | High | Verify in Search Console before launch; re-add verification tag to `<head>` or DNS TXT record if needed | SEO Owner |

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

- `scripts/phase-8/check-seo-consistency.js` — canonical, noindex, title/description gate
- `scripts/phase-8/check-robots-sitemap.js` — sitemap and robots.txt integrity gate
- `validation/seo-consistency-report.json` — per-URL SEO signal results from RC build
- `validation/robots-sitemap-report.json` — sitemap and robots.txt analysis from RC build
- Updated `package.json` with SEO gate scripts
- Updated `.github/workflows/deploy-pages.yml` with SEO gates wired as blocking steps

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | Open | Ticket created |

---

### Notes

- Canonical drift is the silent killer of WordPress-to-Hugo migrations. One template partial with a misconfigured base URL or a missing `.Permalink` can affect every page of that type simultaneously. The duplicate title and canonical checks must cover the full build output — not just the sample matrix.
- The sitemap exclusion of alias/redirect pages is a Hugo default but must be explicitly verified. Hugo does not add alias pages to the sitemap by default, but theme or custom template overrides can change this behavior.
- Search Console submission of the new sitemap is Phase 9 scope. However, Phase 8 must confirm that verification continuity holds so Phase 9 is not blocked on re-verification delays.
- Reference: `analysis/plan/details/phase-8.md` §Workstream C: SEO and Indexing Readiness Gates; `.github/instructions/seo-compliance.instructions.md`
