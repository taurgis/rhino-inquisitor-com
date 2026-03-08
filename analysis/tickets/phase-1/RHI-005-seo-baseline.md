## RHI-005 · SEO Baseline Capture

**Status:** Open  
**Priority:** High  
**Estimate:** M  
**Phase:** 1  
**Assigned to:** SEO Owner + Migration Engineer  
**Target date:** 2026-03-12  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Record a pre-migration SEO snapshot that will serve as the launch comparison benchmark. Without this baseline, it will be impossible to detect indexing regressions, ranking drops, or crawl degradations caused by the migration.

This ticket covers organic performance data, link equity, metadata quality, technical crawl controls, structured data presence, and security header inventory. The output is a set of Markdown baseline reports in `migration/` that remain immutable after sign-off.

---

### Acceptance Criteria

- [ ] `migration/phase-1-seo-baseline.md` exists and contains all sections listed in the Tasks below
- [ ] Indexing data captured: page indexing trend, crawl stats trend, sitemap coverage, and any open indexing issues in Search Console
- [ ] Organic landing pages captured: top 25+ pages by clicks for both 90-day and 28-day windows (impressions, clicks, CTR, average position)
- [ ] Link equity captured: top linked pages from Search Console Links report; external backlink data for top 10 URLs where available
- [ ] Metadata quality sampled: title uniqueness checked, meta description coverage checked, canonical consistency spot-checked on 10+ pages
- [ ] OG tag coverage sampled on homepage, one post, one category page
- [ ] Structured data presence confirmed or absence noted for representative template types (post, page, homepage)
- [ ] `robots.txt` and `sitemap.xml` references verified and documented
- [ ] `migration/phase-1-security-header-matrix.md` exists with response headers for homepage and one post
- [ ] Search Console verification method documented with continuity plan for post-migration
- [ ] Baseline approved by SEO owner (sign-off recorded in Progress Log)

---

### Tasks

- [ ] Export 90-day and 28-day performance reports from Google Search Console (or use API)
  - [ ] Top pages: URL, impressions, clicks, CTR, average position
  - [ ] Save to `migration/phase-1-seo-baseline.md` under §Organic Landing Pages
- [ ] Export page indexing status from Search Console
  - [ ] Indexed count, excluded count, page indexing trend (chart screenshot or data table)
  - [ ] List any open indexing errors or warnings
- [ ] Export crawl stats from Search Console (requests per day trend)
- [ ] Export Links report from Search Console
  - [ ] Top linked pages (internal and external link counts)
  - [ ] Save top 20 externally linked URLs to baseline
- [ ] Spot-check metadata quality on live site:
  - [ ] Probe 10–15 representative URLs; capture `<title>`, `<meta name="description">`, `<link rel="canonical">`
  - [ ] Identify any duplicate titles or missing descriptions
- [ ] Spot-check OG tags: homepage, one recent post, one category page
- [ ] Spot-check structured data: validate JSON-LD presence on homepage and one post using browser DevTools or validator
- [ ] Verify `robots.txt` content: fetch and record `https://www.rhino-inquisitor.com/robots.txt`
- [ ] Verify sitemap index: fetch `sitemap_index.xml`; confirm it lists all 5 sub-sitemaps
- [ ] Confirm `Sitemap:` directive in `robots.txt` matches actual sitemap URL
  - ⚠️ **Live-site note:** Current `robots.txt` references `sitemap_index.xml` (e.g. `Sitemap: https://www.rhino-inquisitor.com/sitemap_index.xml`). Hugo generates a single `sitemap.xml` by default. Phase 5 must update `robots.txt` to point to the new `sitemap.xml`; document this in the baseline as a known migration task.
- [ ] Probe security headers for homepage and one post; record in `migration/phase-1-security-header-matrix.md`
  - [ ] `Content-Security-Policy`
  - [ ] `Strict-Transport-Security`
  - [ ] `X-Frame-Options`
  - [ ] `X-Content-Type-Options`
  - [ ] `Referrer-Policy`
  - [ ] `Permissions-Policy`
  - [ ] `X-Robots-Tag` (on HTML and non-HTML resources)
- [ ] Document Search Console verification method (HTML file, meta tag, DNS TXT, or GA snippet)
  - [ ] Confirm verification method survives a Hugo build and static deploy
  - [ ] Document fallback verification method if primary is at risk
- [ ] Submit baseline report for SEO owner review; record approval in Progress Log

---

### Out of Scope

- Generating a new sitemap or robots.txt (Phase 5)
- Implementing structured data in Hugo templates (Phase 5)
- Fixing any identified SEO issues (these are post-migration targets, not pre-migration blockers)
- Full backlink audit from third-party tools (flag if available but not required to unblock)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-001 Done | Ticket | Pending |
| Google Search Console access (both properties) | Access | Pending |
| Google Analytics access | Access | Pending |
| Live site accessible | External | Ready |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Search Console access delayed | Medium | High | Use Analytics data as fallback for landing page ranking; mark SC sections as pending | SEO Owner |
| Search Console data shows unexpected indexing gaps | Medium | High | Document gaps in baseline; investigate before Phase 2 sign-off | SEO Owner |
| Structured data absent on existing site | Medium | Medium | Document absence; this becomes a Phase 5 uplift target, not a Phase 1 blocker | Migration Engineer |
| Security headers absent (baseline risk) | Low | Low | Document as-is; this is informational for Phase 7 hardening targets | Migration Engineer |
| Search Console verification method breaks on static deploy | Medium | High | Confirm method supports Hugo static output; choose DNS TXT as most reliable fallback | Migration Owner |

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

- `migration/phase-1-seo-baseline.md`
- `migration/phase-1-security-header-matrix.md`

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- The baseline report is **immutable after sign-off**. Do not update it post-launch; instead append a dated comparison section.
- The `has_organic_traffic` and `has_external_links` fields from this baseline feed directly into disposition decisions in RHI-004.
- Search Console verification continuity is a launch-day blocker — confirm early.
- Reference: `analysis/plan/details/phase-1.md` §Workstream 4
- Official: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
