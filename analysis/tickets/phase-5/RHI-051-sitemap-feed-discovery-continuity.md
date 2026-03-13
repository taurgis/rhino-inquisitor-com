## RHI-051 · Workstream D — Sitemap, Feed, and Discovery Surface Continuity

**Status:** Done  
**Priority:** High  
**Estimate:** M  
**Phase:** 5  
**Assigned to:** SEO Owner  
**Target date:** 2026-04-16  
**Created:** 2026-03-07  
**Updated:** 2026-03-13

---

### Goal

Validate that `sitemap.xml` is correct, machine-readable, and contains only canonical indexable URLs. Confirm the RSS feed endpoint is functional and that the canonical WordPress `/feed/` route must resolve (direct output or one-hop redirect). Preserve category, video, and archive pages that carry organic search value as crawlable discovery surfaces.

Machine-readable discovery pathways are how search engines find and index content at scale. A broken sitemap, a missing feed redirect, or a silently removed archive page can cause organic traffic drops weeks before any visible page problem appears. This workstream validates and documents every discovery surface before cutover.

---

### Acceptance Criteria

- [x] `migration/phase-5-sitemap-feed-policy.md` is committed and contains:
  - [x] Sitemap generation strategy (Hugo built-in vs custom template)
  - [x] Sitemap inclusion/exclusion rules for drafts, redirects, and retired URLs
  - [x] Sitemap split strategy if record count approaches sitemap protocol limits (50,000 URLs or 50 MB uncompressed per sitemap)
  - [x] Feed URL strategy (`/index.xml` or custom path) and `/feed/` must-resolve decision
  - [x] Archive and category surface preservation decisions with rationale
- [x] Sitemap validation script `scripts/seo/check-sitemap.js` exists and:
  - [x] Parses `public/sitemap.xml` (or sitemap index if split)
  - [x] Validates all URLs are absolute HTTPS and use `www.rhino-inquisitor.com` as the host
  - [x] Validates no draft or retire-disposition URLs are included
  - [x] Validates no redirect-helper alias pages are included
  - [x] Validates `<lastmod>` values are present and parseable as ISO 8601
  - [x] Validates sitemap URL count is consistent with indexable URL inventory (within a documented tolerance)
  - [x] Cross-references sitemap URLs against canonical tag output from `check:metadata` (host and path must match)
  - [x] Produces `migration/reports/phase-5-sitemap-audit.csv` with per-URL results
  - [x] Exits with non-zero code on any absolute-URL, host-mismatch, or excluded-URL defect
  - [x] Is referenced in `package.json` as `npm run check:sitemap`
- [x] RSS feed endpoint is operational and verified:
  - [x] Hugo RSS feed URL (e.g., `/index.xml`) returns valid Atom/RSS content in local build
  - [x] Feed includes `<link>` elements with absolute canonical URLs
  - [x] Feed items include valid publication dates (`<pubDate>` for RSS or `<published>` for Atom) using the format required by the feed type
  - [x] WordPress `/feed/` route must resolve: either direct feed output or Hugo alias/edge redirect maps to the new feed URL
  - [x] Feed route decision is recorded in `migration/phase-5-sitemap-feed-policy.md`
- [x] Archive and category surfaces are confirmed:
  - [x] All category pages from Phase 1 URL inventory with organic traffic are present in `public/`
  - [x] Category pages return non-empty listing content (not orphan empty-list pages)
  - [x] Archive page (`/archive/` if it exists) is confirmed present or explicitly retired with documented rationale
  - [x] Pagination on high-volume categories is crawlable (not blocked by `robots.txt`)
- [x] `npm run check:sitemap` integrated as a blocking CI gate in the deploy workflow

---

### Tasks

- [x] Review Phase 1 URL inventory for all `category`, `video`, and archive/pagination routes:
  - [x] Identify which category pages have organic traffic (from Phase 1 SEO baseline RHI-005)
  - [x] Identify the live WordPress feed URL and subscriber behavior
  - [x] Confirm which archive routes exist and their traffic status
- [x] Review Hugo `hugo.toml` sitemap configuration (from RHI-021):
  - [x] Confirm `[sitemap]` block is configured correctly
  - [x] Confirm `changefreq` and `priority` are either omitted or set intentionally for internal consistency (do not treat them as ranking signals)
  - [x] Confirm `lastmod` is tied to meaningful content updates (Hugo `.GitInfo.AuthorDate` or front matter `lastmod`)
- [x] Create `scripts/seo/check-sitemap.js`:
  - [x] Use `fast-xml-parser` to parse sitemap output
  - [x] Implement absolute-URL and canonical-host checks
  - [x] Implement draft/retire exclusion check (cross-reference with `url-manifest.json`)
  - [x] Implement `lastmod` format check
  - [x] Implement URL count consistency check against known indexable inventory
  - [x] Write per-URL results to `migration/reports/phase-5-sitemap-audit.csv`
- [x] Confirm Hugo RSS template output (from RHI-021):
  - [x] Verify feed at `/index.xml` is generated with correct absolute URLs
  - [x] Decide on `/feed/` must-resolve implementation: direct output, Hugo alias, or edge redirect
  - [x] Implement `/feed/` must-resolve behavior (direct route or redirect documented in redirect matrix)
- [x] Confirm category and archive listing page output in local build
- [x] Draft `migration/phase-5-sitemap-feed-policy.md`
- [x] Add `"check:sitemap": "node scripts/seo/check-sitemap.js"` to `package.json`
- [x] Integrate `check:sitemap` as a blocking step in the deploy CI workflow

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

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Implemented a dedicated sitemap/feed validation gate, committed the Phase 5 sitemap/feed policy, and hardened preserved discovery surfaces so organic category routes no longer ship as orphan empty pages. The `/feed/` continuity route is now explicitly governed as a GitHub Pages-compatible compatibility helper to Hugo's canonical `/index.xml` feed, and both the route-sensitive PR workflow and deploy workflow block on the new audit.

**Delivered artefacts:**

- `migration/phase-5-sitemap-feed-policy.md`
- `scripts/seo/check-sitemap.js`
- `migration/reports/phase-5-sitemap-audit.csv`
- `/feed/` must-resolve behavior validated as a Pages-compatible helper redirect to `/index.xml`
- `src/layouts/sitemap.xml`
- `src/layouts/_default/taxonomy.html`
- `package.json` updated with `check:sitemap` script
- CI workflows updated with `check:sitemap` blocking gates
- `analysis/documentation/phase-5/rhi-051-sitemap-feed-discovery-continuity-implementation-2026-03-13.md`

**Deviations from plan:**

- The route-sensitive PR workflow now blocks on `check:sitemap` in addition to the deploy workflow for Phase 5 parity.
- Preserved category routes with no direct migrated posts now fall back to recent posts instead of rendering an empty-state shell.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-13 | Done | Added `check:sitemap`, committed the sitemap/feed policy, validated `/feed/` continuity, and kept empty preserved category routes non-empty through a recent-post discovery fallback. |

---

### Notes

- Hugo's default sitemap template includes all rendered pages. This ticket keeps the repository-owned custom sitemap template and blocks release if metadata inventory, sitemap URLs, or excluded routes drift apart.
- The WordPress `/feed/` path is frequently bookmarked by RSS readers and podcast aggregators. The current GitHub Pages-safe implementation keeps `/feed/` as the must-resolve compatibility route while the canonical XML feed remains `/index.xml`.
- Reference: `analysis/plan/details/phase-5.md` §Workstream D: Sitemap, Feed, and Discovery Surface Continuity
