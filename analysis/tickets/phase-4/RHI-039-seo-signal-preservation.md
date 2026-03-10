## RHI-039 · Workstream H — SEO Signal Preservation

**Status:** Done  
**Priority:** High  
**Estimate:** M  
**Phase:** 4  
**Assigned to:** SEO Owner  
**Target date:** 2026-04-17  
**Created:** 2026-03-07  
**Updated:** 2026-03-10

---

### Goal

Define and enforce the SEO validation rules required to ensure that every migrated page preserves the ranking signals and indexability of its WordPress source. This workstream does not generate content — it defines the completeness policy, builds the SEO completeness check script, and validates the full migrated set against that policy before any batch is approved for production.

Content migration can silently degrade SEO in ways that are not visible until ranking data shows a drop weeks after launch. This workstream closes that gap by making SEO compliance a blocking CI gate for every batch.

---

### Acceptance Criteria

- [x] SEO completeness check script `scripts/migration/check-seo-completeness.js` exists and:
  - [x] Scans all generated `.md` files in `migration/output/content/` for indexable pages (`draft: false`, not `retire`)
  - [x] Validates the following per-page:
    - [x] `title` is present, non-empty, and within 60 characters (warn above; block if empty)
    - [x] `description` is present, non-empty, and between 120–155 characters (warn if outside range; block if empty)
    - [x] `url` is present, lowercase, starts with `/`, ends with `/`
    - [x] `date` is present and parseable as ISO 8601
    - [x] `lastmod` is present and parseable as ISO 8601
    - [x] `categories` is present for post-type pages
    - [x] `draft` is explicitly `false` for launch-intended content
  - [x] Checks that no indexable page has `noindex: true` in front matter
  - [x] Validates canonical cross-signal consistency on the sampling set:
    - [x] Rendered canonical tag equals expected `targetUrl`
    - [x] Canonical URL matches sitemap URL entry for the same page
    - [x] Internal canonical links on sampled pages resolve to canonical targets
    - [x] For `merge` pages, canonical points to the target URL (not legacy URL)
  - [x] Produces `migration/reports/seo-completeness-report.csv` with per-page results
  - [x] Exits with non-zero code on any blocking validation failure
  - [x] Is referenced in `package.json` as `npm run check:seo-completeness`
- [x] Feed compatibility check script `scripts/migration/check-feed-compatibility.js` exists and:
  - [x] Verifies canonical Hugo feed endpoint is reachable
  - [x] Verifies legacy `/feed/` endpoint behavior matches the approved compatibility strategy (redirect or compatible response)
  - [x] Exits with non-zero code on feed endpoint regression
  - [x] Is referenced in `package.json` as `npm run check:feed-compatibility`
- [x] Index-control check:
  - [x] `npm run check:noindex` (from Phase 3 SEO scripts) passes on all batch output — no unintended `noindex` signals
  - [x] `robots.txt` does not disallow any paths that should be indexable in production
- [x] SEO preservation sampling is performed on a minimum representative set before each batch:
  - [x] Homepage
  - [x] 10 highest-traffic articles (per Phase 1 SEO baseline from RHI-005)
  - [x] 5 category pages
  - [x] 3 video-related pages
  - [x] 5 long-tail pages with known backlinks
- [x] Feed endpoint compatibility is verified:
  - [x] Hugo RSS feed URL is defined and accessible
  - [x] Legacy WordPress feed URL (`/feed/`) has a redirect or documented migration plan
- [x] `migration/reports/seo-completeness-report.csv` achieves 100% pass rate on all required fields for indexable pages in the release candidate batch

---

### Tasks

- [x] Review Phase 1 SEO baseline (`migration/phase-1-seo-baseline.md` from RHI-005):
  - [x] Identify the 10 highest-traffic articles to include in every sampling round
  - [x] Identify top 5 category pages by traffic
  - [x] Note any pages with custom meta descriptions in WordPress, including plugin-managed metadata recovered from WXR, SQL, or API sources (prioritize for manual description review)
- [x] Create `scripts/migration/check-seo-completeness.js`:
  - [x] Implement field validators for each required SEO field
  - [x] Implement `noindex` front matter detector
  - [x] Implement `draft` status check
  - [x] Implement description length check (warn if outside 120–155; block if empty)
  - [x] Implement canonical cross-signal checks for sampled pages (canonical tag, sitemap URL, internal links, redirect target behavior)
  - [x] Write per-page results to `migration/reports/seo-completeness-report.csv`
- [x] Create `scripts/migration/check-feed-compatibility.js`:
  - [x] Verify canonical feed endpoint resolves
  - [x] Verify legacy `/feed/` behavior matches approved compatibility strategy
  - [x] Write feed compatibility findings to `migration/reports/feed-compatibility-report.csv`
- [x] Confirm Hugo RSS feed configuration in `hugo.toml` (from RHI-021):
  - [x] Verify feed URL matches intended canonical path
  - [x] Verify `robots.txt` does not disallow the feed URL
- [x] Define legacy WordPress feed redirect strategy:
  - [x] `/feed/` → Hugo RSS URL (via Hugo alias or edge redirect)
  - [x] Document decision in Progress Log and update manifest if needed
- [x] Run `check:seo-completeness` against pilot batch and fix all blocking failures before RHI-043
- [x] Add `"check:seo-completeness": "node scripts/migration/check-seo-completeness.js"` to `package.json`
- [x] Add `"check:feed-compatibility": "node scripts/migration/check-feed-compatibility.js"` to `package.json`
- [x] Perform representative sampling review on 10-article set; document findings in Progress Log

---

### Out of Scope

- Advanced SEO experiments (structured data A/B testing, title optimization) — Phase 5 scope
- Building or modifying SEO template partials — Phase 3 (RHI-023, RHI-024) scope
- Post-launch Search Console monitoring — Phase 9 scope
- Crawl simulations against the live WordPress site

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-031 Done — Phase 4 Bootstrap complete | Ticket | Satisfied |
| RHI-035 Done — Front matter mapping complete; all SEO fields populated | Ticket | Satisfied |
| RHI-005 Done — Phase 1 SEO baseline available for traffic-prioritized sampling | Ticket | Satisfied |
| RHI-024 Done — Phase 3 `check:seo` and `check:noindex` scripts callable | Ticket | Satisfied |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| High proportion of posts with empty `description` fields (no WordPress excerpt) | High | High | The WS-D fallback (first 155 chars of body) addresses this; but top-traffic pages should have human-authored descriptions — flag in sampling report | SEO Owner |
| WordPress custom meta descriptions stored in SEO plugin custom fields are incomplete or inconsistent across source artifacts | Medium | High | Audit WXR, SQL, and API exposure for Yoast/RankMath meta fields (`_yoast_wpseo_metadesc` and equivalents) during WS-A extraction; ensure the best available value is extracted into `excerptRaw` or a dedicated field | Engineering Owner |
| Legacy feed URL (`/feed/`) not redirected, breaking existing RSS subscribers | Medium | Medium | Define feed redirect in this workstream before pilot batch; do not leave as a launch-day decision | SEO Owner |
| Accidental `noindex` in staging front matter bleeds into release artifacts | Low | Critical | `check:noindex` is a blocking gate for every batch PR; catch this before it reaches production | Engineering Owner |
| Taxonomy pages for low-value categories lack unique descriptions | Medium | Low | Acceptable for launch; flag for Phase 5 SEO enrichment rather than blocking migration | SEO Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Completed. Workstream H now provides batch-ready SEO validation for the staged Phase 4 migration corpus and the built Hugo output that corresponds to that corpus.

Implemented changes so far:

- Added `scripts/migration/check-seo-completeness.js` to validate staged front matter completeness and sampled rendered canonical, sitemap, merge-target, and internal-link behavior.
- Added `scripts/migration/check-feed-compatibility.js` to validate `index.xml`, `/feed/`, `/feed/rss/`, `/feed/atom/`, and `robots.txt` feed accessibility rules.
- Added `scripts/check-noindex.js` and wired `npm run check:noindex` so production-style build output now has a dedicated index-control gate.
- Updated `scripts/migration/map-frontmatter.js` so generated pages always emit `date` and generated posts always emit `categories`, making the staged SEO contract explicit in the generated Markdown.
- Regenerated `migration/output/content/` and wrote the new validation artefacts at `migration/reports/seo-completeness-report.csv` and `migration/reports/feed-compatibility-report.csv`.
- Updated the migration runbook and Phase 4 implementation documentation with the RHI-039 command sequence and evidence requirements.

Validation work in this ticket verifies:

- 171 staged Markdown files pass all blocking SEO completeness checks.
- sampled rendered coverage across homepage, 10 top-traffic routes, 5 category routes, 3 video routes, 5 backlink-backed routes, and merge-target routes used for canonical verification.
- canonical URLs match rendered sitemap entries for the sampled set.
- sampled internal links resolve to canonical or valid in-build targets.
- canonical feed XML is present and parseable at `/index.xml`, and Pages-compatible `/feed/`, `/feed/rss/`, and `/feed/atom/` helpers resolve correctly.
- no unintended `noindex` signals appear in the staged production-style build.

**Delivered artefacts:**

- `scripts/migration/check-seo-completeness.js`
- `scripts/migration/check-feed-compatibility.js`
- `scripts/check-noindex.js`
- `migration/reports/seo-completeness-report.csv`
- `migration/reports/feed-compatibility-report.csv`
- Feed redirect decision recorded in Progress Log and validated against the current manifest and static helper behaviour
- `package.json` updated with `check:seo-completeness` and `check:feed-compatibility` scripts
- `package.json` updated with `check:noindex`
- `analysis/documentation/phase-4/rhi-039-seo-signal-preservation-implementation-2026-03-10.md`

**Deviations from plan:**

- The Phase 1 SEO baseline only exposed a limited number of explicit category URLs, so the validator honors the baseline where available and supplements the required 5-category sample set from rendered taxonomy routes in the staged Hugo output.
- Re-running `npm run migrate:map-frontmatter` resets downstream staged rewrites, so representative RHI-039 validation must follow the normal Phase 4 sequence: map front matter, rewrite media references, rewrite internal links, then build and validate.
- Metadata-length warnings remain in `migration/reports/seo-completeness-report.csv` for a subset of titles and short descriptions. These are non-blocking because all required fields are present and the release-candidate batch achieved a 100% pass rate on blocking checks.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-10 | In Progress | Reconciled the ticket against the Phase 1 SEO baseline, the Phase 2 `/feed/` contract, the Phase 3 SEO/noindex contract, Hugo specialist guidance, and official Hugo RSS behavior before implementing the migration-facing SEO gates. |
| 2026-03-10 | In Progress | Added `check:seo-completeness`, `check:feed-compatibility`, and `check:noindex`; updated front matter mapping so staged pages emit `date` and staged posts always emit `categories`; and documented the Phase 4 validation sequence in the runbook and implementation note. |
| 2026-03-10 | Done | Regenerated staged content, reran media and internal-link rewrites, built the staged migration site to `tmp/rhi039-public`, and confirmed: `npm run check:seo-completeness -- --public-dir tmp/rhi039-public` passes with 0 blocking failures, `npm run check:feed-compatibility -- --public-dir tmp/rhi039-public --robots-file tmp/rhi039-public/robots.txt` passes, and `CHECK_NOINDEX_PUBLIC_DIR=tmp/rhi039-public npm run check:noindex` passes. |

---

### Notes

- SEO plugin custom fields (Yoast `_yoast_wpseo_metadesc`, RankMath equivalents) often contain better descriptions than the native WordPress excerpt. Check for these during WS-A across the approved source channels (WXR `<wp:postmeta>`, SQL dump, or API-exposed meta) — they must be extracted then, not retrofitted after normalization.
- The `check:seo-completeness` script should be strict during migration but its threshold can be relaxed for `draft: true` content. Only launch-intended (`draft: false`) indexable pages should trigger blocking failures.
- The canonical tag generated by Hugo templates is structural — it will always reference `.Permalink`. This workstream validates that the `url` front matter value will produce the correct `.Permalink` at build time, which is sufficient pre-deploy verification.
- The current release-candidate warnings are metadata-quality recommendations, not missing-field failures. Use `migration/reports/seo-completeness-report.csv` to prioritize manual title and description refinement for top-traffic pages in later SEO enrichment work.
- Reference: `analysis/plan/details/phase-4.md` §Workstream H: SEO Signal Preservation During Migration
