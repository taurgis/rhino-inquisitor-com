## RHI-051 · Workstream D — Sitemap, Feed, and Discovery Surface Continuity

**Status:** Open  
**Priority:** High  
**Estimate:** M  
**Phase:** 5  
**Assigned to:** SEO Owner  
**Target date:** 2026-04-16  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Validate that `sitemap.xml` is correct, machine-readable, and contains only canonical indexable URLs. Confirm the RSS feed endpoint is functional and backward-compatible with the WordPress `/feed/` path. Preserve category, video, and archive pages that carry organic search value as crawlable discovery surfaces.

Machine-readable discovery pathways are how search engines find and index content at scale. A broken sitemap, a missing feed redirect, or a silently removed archive page can cause organic traffic drops weeks before any visible page problem appears. This workstream validates and documents every discovery surface before cutover.

---

### Acceptance Criteria

- [ ] `migration/phase-5-sitemap-feed-policy.md` is committed and contains:
  - [ ] Sitemap generation strategy (Hugo built-in vs custom template)
  - [ ] Sitemap inclusion/exclusion rules for drafts, redirects, and retired URLs
  - [ ] Sitemap split strategy if record count approaches Hugo single-file limits (50,000 URLs)
  - [ ] Feed URL strategy (`/index.xml` or custom path) and `/feed/` compatibility decision
  - [ ] Archive and category surface preservation decisions with rationale
- [ ] Sitemap validation script `scripts/seo/check-sitemap.js` exists and:
  - [ ] Parses `public/sitemap.xml` (or sitemap index if split)
  - [ ] Validates all URLs are absolute HTTPS and use `www.rhino-inquisitor.com` as the host
  - [ ] Validates no draft or retire-disposition URLs are included
  - [ ] Validates no redirect-helper alias pages are included
  - [ ] Validates `<lastmod>` values are present and parseable as ISO 8601
  - [ ] Validates sitemap URL count is consistent with indexable URL inventory (within a documented tolerance)
  - [ ] Cross-references sitemap URLs against canonical tag output from `check:metadata` (host and path must match)
  - [ ] Produces `migration/reports/phase-5-sitemap-audit.csv` with per-URL results
  - [ ] Exits with non-zero code on any absolute-URL, host-mismatch, or excluded-URL defect
  - [ ] Is referenced in `package.json` as `npm run check:sitemap`
- [ ] RSS feed endpoint is operational and verified:
  - [ ] Hugo RSS feed URL (e.g., `/index.xml`) returns valid Atom/RSS content in local build
  - [ ] Feed includes `<link>` elements with absolute canonical URLs
  - [ ] Feed items include `<pubDate>` or `<published>` with valid ISO 8601 dates
  - [ ] WordPress `/feed/` path compatibility: either Hugo alias or documented edge redirect maps to new feed URL
  - [ ] Feed redirect decision is recorded in `migration/phase-5-sitemap-feed-policy.md`
- [ ] Archive and category surfaces are confirmed:
  - [ ] All category pages from Phase 1 URL inventory with organic traffic are present in `public/`
  - [ ] Category pages return non-empty listing content (not orphan empty-list pages)
  - [ ] Archive page (`/archive/` if it exists) is confirmed present or explicitly retired with documented rationale
  - [ ] Pagination on high-volume categories is crawlable (not blocked by `robots.txt`)
- [ ] `npm run check:sitemap` integrated as a blocking CI gate in the deploy workflow

---

### Tasks

- [ ] Review Phase 1 URL inventory for all `category`, `video`, and archive/pagination routes:
  - [ ] Identify which category pages have organic traffic (from Phase 1 SEO baseline RHI-005)
  - [ ] Identify the live WordPress feed URL and subscriber behavior
  - [ ] Confirm which archive routes exist and their traffic status
- [ ] Review Hugo `hugo.toml` sitemap configuration (from RHI-021):
  - [ ] Confirm `[sitemap]` block is configured correctly
  - [ ] Confirm `changefreq` and `priority` are set intentionally (or disabled if not maintained)
  - [ ] Confirm `lastmod` is tied to meaningful content updates (Hugo `.GitInfo.AuthorDate` or front matter `lastmod`)
- [ ] Create `scripts/seo/check-sitemap.js`:
  - [ ] Use `fast-xml-parser` to parse sitemap output
  - [ ] Implement absolute-URL and canonical-host checks
  - [ ] Implement draft/retire exclusion check (cross-reference with `url-manifest.json`)
  - [ ] Implement `lastmod` format check
  - [ ] Implement URL count consistency check against known indexable inventory
  - [ ] Write per-URL results to `migration/reports/phase-5-sitemap-audit.csv`
- [ ] Confirm Hugo RSS template output (from RHI-021):
  - [ ] Verify feed at `/index.xml` is generated with correct absolute URLs
  - [ ] Decide on `/feed/` compatibility: Hugo alias or edge redirect
  - [ ] Implement `/feed/` compatibility (alias or documented in redirect matrix)
- [ ] Confirm category and archive listing page output in local build
- [ ] Draft `migration/phase-5-sitemap-feed-policy.md`
- [ ] Add `"check:sitemap": "node scripts/seo/check-sitemap.js"` to `package.json`
- [ ] Integrate `check:sitemap` as a blocking step in the deploy CI workflow

---

### Out of Scope

- Sitemap submission to Google Search Console (Workstream J, RHI-057)
- Category page content optimization (content quality — post Phase 9)
- Video sitemap generation for YouTube-embedded content (assessed in Workstream H, RHI-055)
- Advanced feed templating (e.g., category-level feeds) unless currently live on WordPress

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-047 Done — Phase 5 Bootstrap complete | Ticket | Pending |
| RHI-021 Done — Phase 3 Hugo config hardening (sitemap and feed config) | Ticket | Pending |
| RHI-048 Done — Canonical policy established (sitemap URLs must match canonical URLs) | Ticket | Pending |
| RHI-005 Done — Phase 1 SEO baseline (category/archive organic traffic data) | Ticket | Pending |
| `fast-xml-parser` available in `package.json` | Tool | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Sitemap includes redirect alias pages, diluting its value to crawlers | Medium | Medium | Exclude Hugo alias pages by type/layout in sitemap template or via front matter `_build: render: never` — verify after local build | Engineering Owner |
| RSS feed subscribers break because `/feed/` is not redirected | Medium | High | Implement `/feed/` Hugo alias or edge redirect on Day 1 of this workstream — do not defer to launch | SEO Owner |
| Category pages with low content render as empty lists if no posts are migrated yet | High | Medium | Acceptable risk during Phase 5 (Phase 4 runs in parallel); verify category pages are non-empty before sign-off, not during this workstream | SEO Owner |
| `lastmod` tied to git commit timestamp instead of content authoring date, producing noisy sitemap churn | Medium | Low | Configure Hugo to use front matter `lastmod` field as primary; fall back to `.GitInfo.AuthorDate` only where front matter value is absent | Engineering Owner |

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

- `migration/phase-5-sitemap-feed-policy.md`
- `scripts/seo/check-sitemap.js`
- `migration/reports/phase-5-sitemap-audit.csv`
- `/feed/` compatibility alias or redirect implemented
- `package.json` updated with `check:sitemap` script
- CI workflow updated with `check:sitemap` blocking gate

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- Hugo's default sitemap template includes all rendered pages. Custom exclusion logic is typically handled via front matter `_build` options or the Hugo `[outputs]` config. Verify that alias redirect pages are excluded from sitemap output in the Phase 3 template — if not, fix it before running sitemap validation.
- The WordPress `/feed/` path is frequently bookmarked by RSS readers and podcast aggregators. Any subscriber using this path will silently stop receiving updates if the feed is removed without a redirect. Treat this as a high-value redirect, not a low-priority edge case.
- Reference: `analysis/plan/details/phase-5.md` §Workstream D: Sitemap, Feed, and Discovery Surface Continuity
