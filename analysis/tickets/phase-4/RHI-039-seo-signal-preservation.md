## RHI-039 · Workstream H — SEO Signal Preservation

**Status:** Open  
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

- [ ] SEO completeness check script `scripts/migration/check-seo-completeness.js` exists and:
  - [ ] Scans all generated `.md` files in `migration/output/content/` for indexable pages (`draft: false`, not `retire`)
  - [ ] Validates the following per-page:
    - [ ] `title` is present, non-empty, and within 60 characters (warn above; block if empty)
    - [ ] `description` is present, non-empty, and between 120–155 characters (warn if outside range; block if empty)
    - [ ] `url` is present, lowercase, starts with `/`, ends with `/`
    - [ ] `date` is present and parseable as ISO 8601
    - [ ] `lastmod` is present and parseable as ISO 8601
    - [ ] `categories` is present for post-type pages
    - [ ] `draft` is explicitly `false` for launch-intended content
  - [ ] Checks that no indexable page has `noindex: true` in front matter
  - [ ] Validates canonical cross-signal consistency on the sampling set:
    - [ ] Rendered canonical tag equals expected `targetUrl`
    - [ ] Canonical URL matches sitemap URL entry for the same page
    - [ ] Internal canonical links on sampled pages resolve to canonical targets
    - [ ] For `merge` pages, canonical points to the target URL (not legacy URL)
  - [ ] Produces `migration/reports/seo-completeness-report.csv` with per-page results
  - [ ] Exits with non-zero code on any blocking validation failure
  - [ ] Is referenced in `package.json` as `npm run check:seo-completeness`
- [ ] Feed compatibility check script `scripts/migration/check-feed-compatibility.js` exists and:
  - [ ] Verifies canonical Hugo feed endpoint is reachable
  - [ ] Verifies legacy `/feed/` endpoint behavior matches the approved compatibility strategy (redirect or compatible response)
  - [ ] Exits with non-zero code on feed endpoint regression
  - [ ] Is referenced in `package.json` as `npm run check:feed-compatibility`
- [ ] Index-control check:
  - [ ] `npm run check:noindex` (from Phase 3 SEO scripts) passes on all batch output — no unintended `noindex` signals
  - [ ] `robots.txt` does not disallow any paths that should be indexable in production
- [ ] SEO preservation sampling is performed on a minimum representative set before each batch:
  - [ ] Homepage
  - [ ] 10 highest-traffic articles (per Phase 1 SEO baseline from RHI-005)
  - [ ] 5 category pages
  - [ ] 3 video-related pages
  - [ ] 5 long-tail pages with known backlinks
- [ ] Feed endpoint compatibility is verified:
  - [ ] Hugo RSS feed URL is defined and accessible
  - [ ] Legacy WordPress feed URL (`/feed/`) has a redirect or documented migration plan
- [ ] `migration/reports/seo-completeness-report.csv` achieves 100% pass rate on all required fields for indexable pages in the release candidate batch

---

### Tasks

- [ ] Review Phase 1 SEO baseline (`migration/phase-1-seo-baseline.md` from RHI-005):
  - [ ] Identify the 10 highest-traffic articles to include in every sampling round
  - [ ] Identify top 5 category pages by traffic
  - [ ] Note any pages with custom meta descriptions in WordPress, including plugin-managed metadata recovered from WXR, SQL, or API sources (prioritize for manual description review)
- [ ] Create `scripts/migration/check-seo-completeness.js`:
  - [ ] Implement field validators for each required SEO field
  - [ ] Implement `noindex` front matter detector
  - [ ] Implement `draft` status check
  - [ ] Implement description length check (warn if outside 120–155; block if empty)
  - [ ] Implement canonical cross-signal checks for sampled pages (canonical tag, sitemap URL, internal links, redirect target behavior)
  - [ ] Write per-page results to `migration/reports/seo-completeness-report.csv`
- [ ] Create `scripts/migration/check-feed-compatibility.js`:
  - [ ] Verify canonical feed endpoint resolves
  - [ ] Verify legacy `/feed/` behavior matches approved compatibility strategy
  - [ ] Write feed compatibility findings to `migration/reports/feed-compatibility-report.csv`
- [ ] Confirm Hugo RSS feed configuration in `hugo.toml` (from RHI-021):
  - [ ] Verify feed URL matches intended canonical path
  - [ ] Verify `robots.txt` does not disallow the feed URL
- [ ] Define legacy WordPress feed redirect strategy:
  - [ ] `/feed/` → Hugo RSS URL (via Hugo alias or edge redirect)
  - [ ] Document decision in Progress Log and update manifest if needed
- [ ] Run `check:seo-completeness` against pilot batch and fix all blocking failures before RHI-043
- [ ] Add `"check:seo-completeness": "node scripts/migration/check-seo-completeness.js"` to `package.json`
- [ ] Add `"check:feed-compatibility": "node scripts/migration/check-feed-compatibility.js"` to `package.json`
- [ ] Perform representative sampling review on 10-article set; document findings in Progress Log

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
| RHI-031 Done — Phase 4 Bootstrap complete | Ticket | Pending |
| RHI-035 Done — Front matter mapping complete; all SEO fields populated | Ticket | Pending |
| RHI-005 Done — Phase 1 SEO baseline available for traffic-prioritized sampling | Ticket | Pending |
| RHI-024 Done — Phase 3 `check:seo` and `check:noindex` scripts callable | Ticket | Pending |

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- `scripts/migration/check-seo-completeness.js`
- `scripts/migration/check-feed-compatibility.js`
- `migration/reports/seo-completeness-report.csv`
- `migration/reports/feed-compatibility-report.csv`
- Feed redirect decision recorded in Progress Log and manifest (if applicable)
- `package.json` updated with `check:seo-completeness` and `check:feed-compatibility` scripts

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- SEO plugin custom fields (Yoast `_yoast_wpseo_metadesc`, RankMath equivalents) often contain better descriptions than the native WordPress excerpt. Check for these during WS-A across the approved source channels (WXR `<wp:postmeta>`, SQL dump, or API-exposed meta) — they must be extracted then, not retrofitted after normalization.
- The `check:seo-completeness` script should be strict during migration but its threshold can be relaxed for `draft: true` content. Only launch-intended (`draft: false`) indexable pages should trigger blocking failures.
- The canonical tag generated by Hugo templates is structural — it will always reference `.Permalink`. This workstream validates that the `url` front matter value will produce the correct `.Permalink` at build time, which is sufficient pre-deploy verification.
- Reference: `analysis/plan/details/phase-4.md` §Workstream H: SEO Signal Preservation During Migration
