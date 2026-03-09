## RHI-005 · SEO Baseline Capture

**Status:** Done  
**Priority:** High  
**Estimate:** M  
**Phase:** 1  
**Assigned to:** SEO Owner + Migration Engineer  
**Target date:** 2026-03-12  
**Created:** 2026-03-07  
**Updated:** 2026-03-09

---

### Goal

Record a pre-migration SEO snapshot that will serve as the launch comparison benchmark. Without this baseline, it will be impossible to detect indexing regressions, ranking drops, or crawl degradations caused by the migration.

This ticket covers organic performance data, link equity, metadata quality, technical crawl controls, structured data presence, and security header inventory. The output is a set of Markdown baseline reports in `migration/` that remain immutable after sign-off.

---

### Acceptance Criteria

- [x] `migration/phase-1-seo-baseline.md` exists and contains all sections listed in the Tasks below
- [x] Indexing data captured: page indexing trend, sitemap coverage, and open indexing issues in Search Console; Crawl Stats export accepted as owner-approved gap for Phase 1 baseline closure
- [x] Organic landing pages captured: top 25+ pages by clicks for both 90-day and 28-day windows (impressions, clicks, CTR, average position)
- [x] Link equity captured: top linked pages from Search Console Links report; external backlink data for top 10 URLs where available
- [x] Metadata quality sampled: title uniqueness checked, meta description coverage checked, canonical consistency spot-checked on 10+ pages
- [x] OG tag coverage sampled on homepage, one post, one category page
- [x] Structured data presence confirmed or absence noted for representative template types (post, page, homepage)
- [x] `robots.txt` and `sitemap.xml` references verified and documented
- [x] `migration/phase-1-security-header-matrix.md` exists with response headers for homepage and one post
- [x] Search Console verification method documented with continuity plan for post-migration
- [x] Baseline approved by SEO owner (sign-off recorded in Progress Log)

---

### Tasks

- [x] Export 90-day and 28-day performance reports from Google Search Console (or use API)
  - [x] Top pages: URL, impressions, clicks, CTR, average position
  - [x] Save to `migration/phase-1-seo-baseline.md` under §Organic Landing Pages
- [x] Export page indexing status from Search Console
  - [x] Indexed count, excluded count, page indexing trend (chart screenshot or data table)
  - [x] List any open indexing errors or warnings
- [x] Export crawl stats from Search Console (requests per day trend)
  - [x] Owner-approved gap: export unavailable in current dataset; closure accepted by SEO Owner and Migration Owner on 2026-03-09
- [x] Export Links report from Search Console
  - [x] Top linked pages (internal and external link counts)
  - [x] Save top 20 externally linked URLs to baseline
- [x] Spot-check metadata quality on live site:
  - [x] Probe 10–15 representative URLs; capture `<title>`, `<meta name="description">`, `<link rel="canonical">`
  - [x] Identify any duplicate titles or missing descriptions
- [x] Spot-check OG tags: homepage, one recent post, one category page
- [x] Spot-check structured data: validate JSON-LD presence on homepage and one post using browser DevTools or validator
- [x] Verify `robots.txt` content: fetch and record `https://www.rhino-inquisitor.com/robots.txt`
- [x] Verify sitemap index: fetch `sitemap_index.xml`; confirm it lists all 5 sub-sitemaps
- [x] Confirm `Sitemap:` directive in `robots.txt` matches actual sitemap URL
  - ⚠️ **Live-site note:** Current `robots.txt` references `sitemap_index.xml` (e.g. `Sitemap: https://www.rhino-inquisitor.com/sitemap_index.xml`). Hugo generates a single `sitemap.xml` by default. Phase 5 must update `robots.txt` to point to the new `sitemap.xml`; document this in the baseline as a known migration task.
- [x] Probe security headers for homepage and one post; record in `migration/phase-1-security-header-matrix.md`
  - [x] `Content-Security-Policy`
  - [x] `Strict-Transport-Security`
  - [x] `X-Frame-Options`
  - [x] `X-Content-Type-Options`
  - [x] `Referrer-Policy`
  - [x] `Permissions-Policy`
  - [x] `X-Robots-Tag` (on HTML and non-HTML resources)
- [x] Document Search Console verification method (HTML file, meta tag, DNS TXT, or GA snippet)
  - [x] Confirm verification method survives a Hugo build and static deploy
  - [x] Document fallback verification method if primary is at risk
- [x] Submit baseline report for SEO owner review; record approval in Progress Log

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
| RHI-001 Done | Ticket | Ready |
| Google Search Console access (both properties) | Access | Ready (CSV exports available; Crawl Stats gap owner-approved for Phase 1 closure) |
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

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-005 is complete. Baseline package delivered and owner-approved.

**Delivered artefacts:**

- `migration/phase-1-seo-baseline.md`
- `migration/phase-1-security-header-matrix.md`

**Deviations from plan:**

- Crawl Stats export could not be produced from the available Search Console exports. This gap was explicitly accepted by SEO Owner and Migration Owner for Phase 1 baseline closure on 2026-03-09.

---

### Owner Sign-Off Checklist and Approval Record

Checklist before marking this ticket `Done`:

- [x] 90-day and 28-day organic landing-page exports are both documented with explicit date ranges and source file names
- [x] 28-day export is from Search Console `Performance -> Search results -> Pages` with metrics `Clicks`, `Impressions`, `CTR`, and `Position`
- [x] Crawl Stats trend evidence is documented (export or explicitly accepted gap with rationale)
- [x] Search Console verification method is confirmed and continuity plan is documented
- [x] Baseline immutability is acknowledged by approvers (no overwrite after sign-off; only dated append comparisons)
- [x] All blocking gaps are either resolved or explicitly accepted by owners with rationale

Approval record:

| Approver | Role | Decision | Date | Evidence | Notes |
|---|---|---|---|---|---|
| SEO Owner | Owner | Approved | 2026-03-09 | Progress Log entry (2026-03-09) | Approved with Crawl Stats gap acceptance for Phase 1 closure |
| Migration Owner | Owner | Approved | 2026-03-09 | Progress Log entry (2026-03-09) | Approved with Crawl Stats gap acceptance for Phase 1 closure |

Ticket closure rule:

- [x] Ticket can move to `Done` only when both approvers are set to `Approved` with dated evidence links

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-09 | In Progress | Started RHI-005 baseline implementation after RHI-004 completion; generated `migration/phase-1-seo-baseline.md` and `migration/phase-1-security-header-matrix.md` from Search Console exports and live probes |
| 2026-03-09 | In Progress | Indexation issue drilldown incorporated from `tmp/search-console/404/`, `tmp/search-console/alternative-page/`, `tmp/search-console/found-not-indexed/`, and `tmp/search-console/not-crawled-not-indexed/` |
| 2026-03-09 | In Progress | Ingested dedicated 28-day export from `tmp/search-console/pages-28d-2026-03-09/` and updated baseline with top 25 page rows and export metadata |
| 2026-03-09 | In Progress | Confirmed Search Console DNS TXT verification method and continuity recommendation; verification-method blocker cleared |
| 2026-03-09 | In Progress | Baseline package submitted for owner review (SEO + Migration) |
| 2026-03-09 | In Progress | Crawl Stats export gap explicitly accepted by owner decision for Phase 1 baseline closure |
| 2026-03-09 | Done | SEO Owner and Migration Owner approved baseline package; ticket moved to Done |

---

### Notes

- The baseline report is **immutable after sign-off**. Do not update it post-launch; instead append a dated comparison section.
- The `has_organic_traffic` and `has_external_links` fields from this baseline feed directly into disposition decisions in RHI-004.
- Search Console verification continuity is a launch-day blocker — confirm early.
- Reference: `analysis/plan/details/phase-1.md` §Workstream 4
- Official: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
