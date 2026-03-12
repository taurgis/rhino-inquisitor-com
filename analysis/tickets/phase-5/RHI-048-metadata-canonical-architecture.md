## RHI-048 · Workstream A — Metadata and Canonical Signal Architecture

**Status:** Done  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 5  
**Assigned to:** SEO Owner  
**Target date:** 2026-04-11  
**Created:** 2026-03-07  
**Updated:** 2026-03-12

---

### Goal

Ensure every indexable page template emits exactly one correct canonical tag, unique title, unique meta description, and complete Open Graph baseline. This workstream validates that the Phase 3 SEO partials produce the right output for each template type and hardens the CI gates that reject any metadata gap before it reaches production.

Canonical signal errors are among the most damaging SEO problems during a migration: they cannot always be detected from browser previews, they take weeks to surface in ranking data, and they are expensive to correct post-launch. This workstream closes the gap by making metadata correctness a machine-verified release blocker.

---

### Acceptance Criteria

- [x] Metadata validation script `scripts/seo/check-metadata.js` exists and:
  - [x] Scans all generated HTML files in `public/` for indexable pages
  - [x] Validates `<title>` is present, non-empty, and unique across all indexable pages
  - [x] Validates `<meta name="description">` is present, non-empty, and unique per page (warn if duplicate)
  - [x] Validates exactly one `<link rel="canonical">` per page
  - [x] Validates canonical href is absolute HTTPS, uses `www.rhino-inquisitor.com`, and matches the page URL
  - [x] Validates OG baseline: `og:title`, `og:description`, `og:type`, `og:url`, `og:image` all present
  - [x] Validates no multiple canonical tags (block on two or more)
  - [x] Validates canonical does not point to a URL flagged as redirected or retired in `url-manifest.json`
  - [x] Produces `migration/reports/phase-5-metadata-report.csv` with per-page pass/fail results
  - [x] Exits with non-zero code on any blocking validation failure
  - [x] Is referenced in `package.json` as `npm run check:metadata`
- [x] `migration/phase-5-canonical-policy.md` is committed and contains:
  - [x] Default canonical rule (self-referencing absolute URL from `https://www.rhino-inquisitor.com/`)
  - [x] Permitted canonical override conditions and approval requirement
  - [x] Canonical conflict resolution procedure
  - [x] Canonical-to-sitemap consistency requirement
- [x] Canonical policy validation passes on all representative template families:
  - [x] Homepage (`/`)
  - [x] Single post template (`/post-slug/`)
  - [x] Category archive template (`/category/name/`)
  - [x] Static page template (`/page-slug/`)
  - [x] 404 page (must not appear in sitemap; must not have canonical pointing to live URL)
- [x] `migration/reports/phase-5-metadata-report.csv` achieves 100% pass rate on indexable pages in the representative template set
- [x] `npm run check:metadata` is integrated as a blocking CI gate in the deploy workflow

---

### Tasks

- [x] Audit Phase 3 SEO partial templates for canonical, title, and description output:
  - [x] Confirm `src/layouts/partials/seo/head-meta.html` outputs canonical correctly for all template types
  - [x] Confirm `<title>` uses Hugo front matter `title` field and site title suffix consistently
  - [x] Confirm `<meta name="description">` falls back correctly when `description` is absent (or blocks as intended)
  - [x] Confirm OG tags output correctly for article vs. list vs. page templates
  - [x] Document any deficiencies found; raise with Phase 3 workstream owner before proceeding
- [x] Create `scripts/seo/check-metadata.js`:
  - [x] Use `cheerio` to parse generated HTML files in `public/`
  - [x] Implement title uniqueness check (warn on duplicate; block on empty)
  - [x] Implement description presence check (block on empty)
  - [x] Implement single-canonical check (block on multiple or absent)
  - [x] Implement canonical-host and canonical-absolute-URL checks
  - [x] Implement OG baseline completeness check
  - [x] Implement canonical-vs-manifest consistency check (flag redirected/retired URLs in canonical href)
  - [x] Write results to `migration/reports/phase-5-metadata-report.csv`
- [x] Draft `migration/phase-5-canonical-policy.md`
- [x] Run `check:metadata` against scaffold and confirm zero blocking failures on template set
- [x] Add `"check:metadata": "node scripts/seo/check-metadata.js"` to `package.json`
- [x] Integrate `check:metadata` as a blocking step in the deploy CI workflow (before deploy job)
- [x] Spot-check canonical output manually on 5 representative pages in the local build
- [x] Document findings and any template fixes applied in Progress Log

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
| RHI-047 Done — Phase 5 Bootstrap complete | Ticket | Verified |
| RHI-024 Done — Phase 3 SEO partials committed (`src/layouts/partials/seo/`) | Ticket | Verified |
| RHI-023 Done — Phase 3 template scaffolding complete (baseof.html, single.html, list.html) | Ticket | Verified |
| RHI-014 Done — Phase 2 SEO and discoverability contract (canonical and metadata rules) | Ticket | Verified |
| `cheerio` available in `package.json` | Tool | Verified |

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

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-048 is complete. The repo now has a dedicated metadata and canonical validation gate, a committed canonical policy, paginator-aware canonical rendering, and a real 404 artifact that participates in Phase 5 validation.

**Delivered artefacts:**

- `scripts/seo/check-metadata.js`
- `migration/reports/phase-5-metadata-report.csv`
- `migration/phase-5-canonical-policy.md`
- `package.json` updated with `check:metadata` script
- `.github/workflows/deploy-pages.yml` updated to include `check:metadata` as blocking gate
- `.github/workflows/build-pr.yml` updated to include `check:metadata` for route-sensitive PR validation
- `src/layouts/_default/list.html`, `src/layouts/partials/seo/resolve.html`, and `src/layouts/404.html` updated to fix paginated canonical drift and emit an explicit 404 page
- `analysis/documentation/phase-5/rhi-048-metadata-canonical-architecture-implementation-2026-03-12.md`

**Deviations from plan:**

- `migration/reports/phase-5-metadata-report.csv` closes with `0` blocking failures and `10` warning-only duplicate title/description advisories from the current content corpus. These remain non-blocking under the ticket's duplicate-warning contract.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-12 | In Progress | Audited the shared SEO partials and current production artifact. Identified two template-level gaps before validator rollout: retained paginator routes were still canonicalizing to the section root, and the repo did not emit a dedicated 404 artifact for representative validation. |
| 2026-03-12 | Done | Added `scripts/seo/check-metadata.js`, committed `migration/phase-5-canonical-policy.md`, wired `npm run check:metadata` into the PR and deploy workflows, fixed paginated canonical/title/description handling in the shared SEO resolver, added `src/layouts/404.html`, and generated `migration/reports/phase-5-metadata-report.csv` with `215` indexable pass rows, `0` blocking failures, and `10` warning-only duplicate metadata advisories. Manual artifact checks covered homepage, a post, a category archive, a static page, a paginated archive route, and the new 404 output. |

---

### Notes

- Canonical signals are supporting signals, not substitutes for redirect correctness. This workstream validates canonical tag output; redirect signal validation is Workstream B (RHI-049).
- The `check:metadata` script must run against the generated `public/` HTML, not the Markdown source. This validates that the Hugo template produces correct output, not just that the front matter is correct.
- Hugo's `.Permalink` should be used for all canonical and OG URLs in partials — never `.RelPermalink` or `.URL`. Verify this is enforced in Phase 3 partials.
- Residual duplicate title/description warnings in the current metadata report are advisory only. They reflect current content corpus overlap and a `/video/` versus `/category/video/` title collision, not a blocking failure in the shared metadata architecture.
- Reference: `analysis/plan/details/phase-5.md` §Workstream A: Metadata and Canonical Signal Architecture
