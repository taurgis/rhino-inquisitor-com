## RHI-048 · Workstream A — Metadata and Canonical Signal Architecture

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 5  
**Assigned to:** SEO Owner  
**Target date:** 2026-04-11  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Ensure every indexable page template emits exactly one correct canonical tag, unique title, unique meta description, and complete Open Graph baseline. This workstream validates that the Phase 3 SEO partials produce the right output for each template type and hardens the CI gates that reject any metadata gap before it reaches production.

Canonical signal errors are among the most damaging SEO problems during a migration: they cannot always be detected from browser previews, they take weeks to surface in ranking data, and they are expensive to correct post-launch. This workstream closes the gap by making metadata correctness a machine-verified release blocker.

---

### Acceptance Criteria

- [ ] Metadata validation script `scripts/seo/check-metadata.js` exists and:
  - [ ] Scans all generated HTML files in `public/` for indexable pages
  - [ ] Validates `<title>` is present, non-empty, and unique across all indexable pages
  - [ ] Validates `<meta name="description">` is present, non-empty, and unique per page (warn if duplicate)
  - [ ] Validates exactly one `<link rel="canonical">` per page
  - [ ] Validates canonical href is absolute HTTPS, uses `www.rhino-inquisitor.com`, and matches the page URL
  - [ ] Validates OG baseline: `og:title`, `og:description`, `og:type`, `og:url`, `og:image` all present
  - [ ] Validates no multiple canonical tags (block on two or more)
  - [ ] Validates canonical does not point to a URL flagged as redirected or retired in `url-manifest.json`
  - [ ] Produces `migration/reports/phase-5-metadata-report.csv` with per-page pass/fail results
  - [ ] Exits with non-zero code on any blocking validation failure
  - [ ] Is referenced in `package.json` as `npm run check:metadata`
- [ ] `migration/phase-5-canonical-policy.md` is committed and contains:
  - [ ] Default canonical rule (self-referencing absolute URL from `https://www.rhino-inquisitor.com/`)
  - [ ] Permitted canonical override conditions and approval requirement
  - [ ] Canonical conflict resolution procedure
  - [ ] Canonical-to-sitemap consistency requirement
- [ ] Canonical policy validation passes on all representative template families:
  - [ ] Homepage (`/`)
  - [ ] Single post template (`/post-slug/`)
  - [ ] Category archive template (`/category/name/`)
  - [ ] Static page template (`/page-slug/`)
  - [ ] 404 page (must not appear in sitemap; must not have canonical pointing to live URL)
- [ ] `migration/reports/phase-5-metadata-report.csv` achieves 100% pass rate on indexable pages in the representative template set
- [ ] `npm run check:metadata` is integrated as a blocking CI gate in the deploy workflow

---

### Tasks

- [ ] Audit Phase 3 SEO partial templates for canonical, title, and description output:
  - [ ] Confirm `layouts/partials/seo/head-meta.html` outputs canonical correctly for all template types
  - [ ] Confirm `<title>` uses Hugo front matter `title` field and site title suffix consistently
  - [ ] Confirm `<meta name="description">` falls back correctly when `description` is absent (or blocks as intended)
  - [ ] Confirm OG tags output correctly for article vs. list vs. page templates
  - [ ] Document any deficiencies found; raise with Phase 3 workstream owner before proceeding
- [ ] Create `scripts/seo/check-metadata.js`:
  - [ ] Use `cheerio` to parse generated HTML files in `public/`
  - [ ] Implement title uniqueness check (warn on duplicate; block on empty)
  - [ ] Implement description presence check (block on empty)
  - [ ] Implement single-canonical check (block on multiple or absent)
  - [ ] Implement canonical-host and canonical-absolute-URL checks
  - [ ] Implement OG baseline completeness check
  - [ ] Implement canonical-vs-manifest consistency check (flag redirected/retired URLs in canonical href)
  - [ ] Write results to `migration/reports/phase-5-metadata-report.csv`
- [ ] Draft `migration/phase-5-canonical-policy.md`
- [ ] Run `check:metadata` against scaffold and confirm zero blocking failures on template set
- [ ] Add `"check:metadata": "node scripts/seo/check-metadata.js"` to `package.json`
- [ ] Integrate `check:metadata` as a blocking step in the deploy CI workflow (before deploy job)
- [ ] Spot-check canonical output manually on 5 representative pages in the local build
- [ ] Document findings and any template fixes applied in Progress Log

---

### Out of Scope

- Canonical override logic for cross-canonical syndication cases (deferred to post-launch if needed)
- Structured data validation (Workstream E, RHI-052)
- Meta tag optimization for conversion or engagement (post Phase 9)
- Social card visual preview testing (manual step in Phase 8 launch readiness)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-047 Done — Phase 5 Bootstrap complete | Ticket | Pending |
| RHI-024 Done — Phase 3 SEO partials committed (`layouts/partials/seo/`) | Ticket | Pending |
| RHI-023 Done — Phase 3 template scaffolding complete (baseof.html, single.html, list.html) | Ticket | Pending |
| RHI-014 Done — Phase 2 SEO and discoverability contract (canonical and metadata rules) | Ticket | Pending |
| `cheerio` available in `package.json` | Tool | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Phase 3 SEO partials emit different canonical formats across template types | Medium | High | Audit partials at task start before writing validation logic; fix template gaps before running checks | Engineering Owner |
| OG `og:image` absent on posts without a hero image | High | Medium | Define fallback OG image in `hugo.toml` site params; validate fallback is emitted by the partial | SEO Owner |
| Title uniqueness violations from duplicate migrated posts | Medium | Medium | Flag duplicates in metadata report as warnings; do not block migration — address duplicate content in Phase 4 WS-K reporting | SEO Owner |
| `cheerio` HTML parsing misses server-side rendered meta order quirks | Low | Low | Cross-validate 5 pages manually in a live Hugo local build | Engineering Owner |

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

- `scripts/seo/check-metadata.js`
- `migration/reports/phase-5-metadata-report.csv`
- `migration/phase-5-canonical-policy.md`
- `package.json` updated with `check:metadata` script
- CI workflow updated to include `check:metadata` as blocking gate

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- Canonical signals are supporting signals, not substitutes for redirect correctness. This workstream validates canonical tag output; redirect signal validation is Workstream B (RHI-049).
- The `check:metadata` script must run against the generated `public/` HTML, not the Markdown source. This validates that the Hugo template produces correct output, not just that the front matter is correct.
- Hugo's `.Permalink` should be used for all canonical and OG URLs in partials — never `.RelPermalink` or `.URL`. Verify this is enforced in Phase 3 partials.
- Reference: `analysis/plan/details/phase-5.md` §Workstream A: Metadata and Canonical Signal Architecture
