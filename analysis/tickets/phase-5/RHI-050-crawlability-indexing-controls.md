## RHI-050 · Workstream C — Crawlability and Indexing Controls

**Status:** Done  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 5  
**Assigned to:** SEO Owner  
**Target date:** 2026-04-14  
**Created:** 2026-03-07  
**Updated:** 2026-03-13

---

### Goal

Ensure the production `robots.txt` and per-page `noindex` directives are correctly configured, mutually consistent, and environment-safe. Crawl and index control errors are silent release blockers — a `robots.txt` disallow rule that blocks a core content section, or a `noindex` tag leaked from staging, will not cause a build error but will cause search engines to hide the content.

This workstream makes crawl and index control correctness a machine-verified release gate and documents the intent for every significant control decision.

---

### Acceptance Criteria

- [x] Production `robots.txt` is correct and committed via `src/layouts/robots.txt`, with the built artifact validated at `public/robots.txt`:
  - [x] Does not `Disallow` any paths serving indexable content (posts, pages, categories, video pages)
  - [x] Does not `Disallow` any paths required for canonical resolution or sitemap fetch
  - [x] Includes a valid sitemap directive for production (`https://www.rhino-inquisitor.com/sitemap.xml`)
  - [x] Allows all user-agents by default (`User-agent: *` with only intentional Disallow rules)
  - [x] Preview environments use page-level `noindex` directives — `robots.txt` is never the sole mechanism for preview de-indexing
- [x] `noindex` audit passes on all indexable templates:
  - [x] No page with `draft: false` and final `keep`/`merge` target intent emits `<meta name="robots" content="noindex">`
  - [x] Pages intended for non-indexation (404, redirect helpers, preview artifacts) have explicit `noindex` meta tags
  - [x] No `noindex` page is also blocked by `robots.txt` (contradiction rule: Googlebot cannot see `noindex` if crawl is blocked)
- [x] Crawl control validation script `scripts/seo/check-crawl-controls.js` exists and:
  - [x] Parses the built `robots.txt` artifact from the Hugo template and flags any `Disallow` rule that blocks a URL class expected to be indexable
  - [x] Scans all generated HTML files for `<meta name="robots">` and `<meta name="googlebot">` tags
  - [x] Detects `noindex` on pages that should be indexable (checks against `url-manifest.json` target intent plus built route classification)
  - [x] Detects `robots.txt`/`noindex` contradiction (URL blocked in robots AND carrying `noindex`)
  - [x] Produces `migration/reports/phase-5-crawl-control-audit.csv` with per-URL results
  - [x] Exits with non-zero code on any unintended `noindex` or contradiction defect
  - [x] Is referenced in `package.json` as `npm run check:crawl-controls`
- [x] Preview environment index suppression is implemented:
  - [x] Preview build emits `<meta name="robots" content="noindex, nofollow">` on all generated HTML pages, including alias helper pages
  - [x] Preview `robots.txt` remains crawlable and self-consistent with the preview host instead of using `Disallow: /`
  - [x] Production release artifact CI gate verifies no preview `noindex` tags are present
- [x] `migration/reports/phase-5-crawl-control-audit.csv` achieves zero defects on the representative template set

---

### Tasks

- [x] Review current `src/layouts/robots.txt` (from Phase 3 RHI-024):
  - [x] Verify no `Disallow` rules that block indexable content paths
  - [x] Verify sitemap directive is present and correct
  - [x] Compare against live WordPress `robots.txt` at `https://www.rhino-inquisitor.com/robots.txt` and intentionally keep only the Hugo-relevant disallows
- [x] Audit Phase 3 template partials for `noindex` output logic:
  - [x] Identify every condition that emits `noindex` and confirm the production logic remains limited to 404 and explicit per-page controls
  - [x] Confirm that non-production builds emit `noindex, nofollow` and production builds do not leak preview controls
- [x] Create `scripts/seo/check-crawl-controls.js`:
  - [x] Implement `robots.txt` disallow-path parser using known URL inventory from `url-manifest.json`
  - [x] Implement HTML meta robots tag scanner
  - [x] Implement contradiction detector (`Disallow` + `noindex` on same URL)
  - [x] Write per-URL results to `migration/reports/phase-5-crawl-control-audit.csv`
- [x] Verify preview environment build correctly suppresses indexing with crawlable `noindex` output on every generated HTML page
- [x] Verify production environment CI gate rejects any artifact with a `noindex` tag on an indexable page
- [x] Add `"check:crawl-controls": "node scripts/seo/check-crawl-controls.js"` to `package.json`
- [x] Integrate `check:crawl-controls` as a blocking step in the deploy CI workflow and the full-site route-sensitive PR workflow
- [x] Document intent for intentional `Disallow` and `noindex` rules in the implementation note and Progress Log with owner-approved preview policy

---

### Out of Scope

- `X-Robots-Tag` response headers for non-HTML resources (Workstream K, RHI-058)
- Staging environment infrastructure setup (Phase 3 scope)
- Google Search Console crawl rate configuration (Workstream J, RHI-057)
- Robots.txt disallow rules for authenticated/private sections (not applicable — static site)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-047 Done — Phase 5 Bootstrap complete | Ticket | Pending |
| RHI-024 Done — Phase 3 SEO foundation (robots.txt template committed) | Ticket | Pending |
| RHI-023 Done — Phase 3 template scaffolding (noindex logic in partials) | Ticket | Pending |
| `migration/url-manifest.json` with disposition coverage (to determine which URLs should be indexable) | Phase | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Staging `noindex` meta tag accidentally included in production artifact | Medium | Critical | CI gate (`check:crawl-controls`) is a blocking gate for every deploy; enforce before any launch candidate build | Engineering Owner |
| Overly broad `Disallow` in legacy WordPress `robots.txt` copied without review | Medium | High | Always review `robots.txt` changes against current live WordPress file; do not copy blindly | SEO Owner |
| `robots.txt`/`noindex` contradiction on pages that require de-indexing | Low | High | Contradiction detector in `check:crawl-controls` catches this at CI; fix before merge | Engineering Owner |
| Hugo's draft behavior emits `noindex` correctly but some edge case does not (e.g., future-dated posts) | Low | Medium | Include future-dated content in template audit; confirm Hugo `publishDate` behavior in production build | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Implemented a dedicated crawl-control validator for production and preview artifacts, hardened alias helper pages so preview `noindex` applies to redirect outputs as well, and wired the new gate into the deploy workflow plus the full-site route-sensitive PR workflow. The ticket now follows the owner-approved contract that keeps preview crawlable `noindex` and keeps `src/layouts/robots.txt` as the Hugo source of truth for `robots.txt`.

**Delivered artefacts:**

- `scripts/seo/check-crawl-controls.js`
- `migration/reports/phase-5-crawl-control-audit.csv`
- `src/layouts/robots.txt` verified as the robots source of truth and validated through the built `public/robots.txt` artifact
- `src/layouts/alias.html`
- `package.json` updated with `check:crawl-controls` script
- CI workflows updated with `check:crawl-controls` blocking gates and preview-mode validation

**Deviations from plan:**

- Ticket wording updated to reflect the owner-approved preview policy (`crawlable noindex`) and the existing Hugo template location for `robots.txt`.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-13 | Done | Added `check:crawl-controls`, preview alias `noindex` coverage, production and preview crawl-control CI gates, and the owner-approved crawlable-preview policy with template-based `robots.txt`. |

---

### Notes

- Critical rule: do NOT pair `Disallow` in `robots.txt` with a de-indexing objective when search engines need to crawl the page to see `noindex`. If a page must be de-indexed, it must be crawlable AND carry a `noindex` meta tag. `robots.txt` alone cannot de-index; `noindex` alone without crawl access cannot de-index.
- The production Hugo build must NEVER pass `--buildDrafts`, `--buildFuture`, or `--buildExpired`. If these flags are accidentally used, draft content with staging `noindex` could be included in the production artifact. Verify the CI build command.
- Reference: `analysis/plan/details/phase-5.md` §Workstream C: Crawlability and Indexing Controls, §Critical Corrections §3
