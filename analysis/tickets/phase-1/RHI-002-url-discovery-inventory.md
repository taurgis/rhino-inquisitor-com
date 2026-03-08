## RHI-002 · URL Discovery and Inventory

**Status:** Open  
**Priority:** Critical  
**Estimate:** L  
**Phase:** 1  
**Assigned to:** Migration Engineer  
**Target date:** 2026-03-09  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Produce an exhaustive, de-duplicated inventory of every live URL associated with `www.rhino-inquisitor.com`. This inventory is the single authoritative input for URL classification (RHI-004) and the SEO baseline (RHI-005). Any URL omitted here is at risk of being lost in the migration without notice.

The inventory must include URLs from sitemaps, internal crawl, Search Console, server/CDN logs, and manual seed lists. Every record must carry source provenance and machine-readable metadata sufficient to drive classification decisions.

---

### Acceptance Criteria

- [ ] `migration/url-inventory.raw.json` exists and contains at least 200 entries (all 5 sitemaps account for 200 raw sitemap entries; source: live-site snapshot 2026-03-07)
- [ ] `migration/url-inventory.normalized.json` contains at least 195 entries after de-duplication (all 5 video-sitemap URLs are duplicated in post-sitemap; no other cross-sitemap duplicates expected)
- [ ] Every entry in the raw inventory has the fields: `url`, `path`, `source`, `url_type`, `http_status`, `canonical_target`, `indexability_signal`, `in_sitemap`, `lastmod`, `has_external_links`, `has_organic_traffic`
- [ ] All 5 sitemap files are parsed: `post-sitemap.xml`, `page-sitemap.xml`, `category-sitemap.xml`, `video-sitemap.xml`, `e-landing-page-sitemap.xml`
- [ ] De-duplication is applied: each normalised absolute URL appears exactly once with consolidated source list
- [ ] Non-sitemap seeds included: homepage, archive, category pages, 10–20 recent posts, footer links, utility links
- [ ] System routes probed and included: `/feed/`, `/comments/feed/`, `/wp-json/`, `/xmlrpc.php`, `/author/admin/`, `/search/sfcc/`, paginated routes
- [ ] `migration/url-inventory.normalized.json` exists with normalised absolute URLs (lowercase, trailing slash, `www` canonical host)
- [ ] `scripts/parse-sitemap.js` is committed and documented

---

### Tasks

- [ ] Write `scripts/parse-sitemap.js` to fetch and parse `sitemap_index.xml` using `fast-xml-parser`
  - [ ] Parse `post-sitemap.xml` (expected ~150 URLs)
  - [ ] Parse `page-sitemap.xml` (expected ~22 URLs)
  - [ ] Parse `category-sitemap.xml` (expected ~22 URLs)
  - [ ] Parse `video-sitemap.xml` (expected 5 URLs — note: all 5 also appear in `post-sitemap.xml`)
  - [ ] Parse `e-landing-page-sitemap.xml` (expected ~1 URL)
- [ ] Write `scripts/crawl-urls.js` to expand the seed set via internal crawl using `undici`
  - [ ] Seed with homepage, archive, all category pages from sitemap
  - [ ] Follow internal links to a configurable depth (start with depth 2)
  - [ ] Probe known system routes explicitly (see list in phase-1.md §WS1 step 6); also probe `/author/thomas-theunen/` (the active author URL visible in video-sitemap uploader data — `/author/admin/` listed in phase-1.md may redirect or be a separate user)
- [ ] Merge all discovered URLs, de-duplicate by normalised absolute URL
  - ⚠️ **Live-site note:** All 5 URLs in `video-sitemap.xml` also appear in `post-sitemap.xml`: `/sfcc-introduction/`, `/new-apis-and-features-for-a-headless-sfcc/`, `/what-is-new-in-the-23-8-commerce-cloud-release/`, `/sitegenesis-vs-sfra-vs-pwa/`, and `/everything-new-in-sfcc-23-4/`. De-duplication must consolidate source provenance for all five rather than treating them as separate inventory records.
- [ ] HTTP probe each unique URL: capture status code and final redirect destination
- [ ] Enrich with Search Console data (impressions, clicks) using the Search Console API or CSV export
- [ ] Enrich `has_external_links` field from Search Console Links report
- [ ] Normalise all URLs: lowercase, enforce trailing slash where applicable, enforce `www` canonical host
- [ ] Output `migration/url-inventory.raw.json` (pre-normalisation with source provenance)
- [ ] Output `migration/url-inventory.normalized.json` (post-normalisation, de-duplicated)
- [ ] Validate both outputs against the expected field schema using `zod`
- [ ] Review output with migration owner for completeness gaps

---

### Out of Scope

- Assigning disposition (`keep` / `merge` / `retire`) — covered by RHI-004
- Writing canonical and URL invariant policies — covered by RHI-003
- Downloading media assets or content bodies
- Crawling external sites or backlink sources

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-001 Done | Ticket | Pending |
| Search Console API access or CSV export | Access | Pending |
| Live site is accessible and returning responses | External | Ready |
| `fast-xml-parser`, `undici`, `p-limit`, `zod`, `fast-glob` installed | Tool | Pending (RHI-001) |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Sitemap references additional undiscovered sitemaps | Low | High | Parse `sitemap_index.xml` dynamically rather than hardcoding file list | Migration Engineer |
| HTTP probe rate-limited by origin server | Medium | Medium | Use `p-limit` to cap concurrency at 5–10 requests; add jitter | Migration Engineer |
| Search Console access not available in time | Medium | High | Proceed without SC enrichment; mark `has_organic_traffic` as `null` and flag for backfill | Migration Engineer |
| Normalisation edge cases (mixed-case slugs, double slashes) | Low | Medium | Apply `zod` schema validation; log normalisation changes | Migration Engineer |
| Pagination and archive URLs generate hundreds of extra routes | Medium | Medium | Cap crawl depth; log and classify pagination routes separately | Migration Engineer |

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

- `migration/url-inventory.raw.json`
- `migration/url-inventory.normalized.json`
- `scripts/parse-sitemap.js`
- `scripts/crawl-urls.js`

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- Expected URL count based on live site snapshot (2026-03-07): 200 raw entries across all 5 sitemaps; 195 unique after de-duplication (all 5 video-sitemap URLs are already present in post-sitemap). Total with system routes and crawl expansion likely 230–300+.
- `has_organic_traffic` is a critical field for `retire` disposition decisions in RHI-004 — do not leave it unpopulated without escalating.
- Reference: `analysis/plan/details/phase-1.md` §Workstream 1
