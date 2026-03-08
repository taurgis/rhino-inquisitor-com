## RHI-050 · Workstream C — Crawlability and Indexing Controls

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 5  
**Assigned to:** SEO Owner  
**Target date:** 2026-04-14  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Ensure the production `robots.txt` and per-page `noindex` directives are correctly configured, mutually consistent, and environment-safe. Crawl and index control errors are silent release blockers — a `robots.txt` disallow rule that blocks a core content section, or a `noindex` tag leaked from staging, will not cause a build error but will cause search engines to hide the content.

This workstream makes crawl and index control correctness a machine-verified release gate and documents the intent for every significant control decision.

---

### Acceptance Criteria

- [ ] Production `robots.txt` is correct and committed at `static/robots.txt`:
  - [ ] Does not `Disallow` any paths serving indexable content (posts, pages, categories, video pages)
  - [ ] Does not `Disallow` any paths required for canonical resolution or sitemap fetch
  - [ ] Includes a valid sitemap directive for production (`https://www.rhino-inquisitor.com/sitemap.xml` or `https://www.rhino-inquisitor.com/sitemap_index.xml` when split/indexed sitemaps are used)
  - [ ] Allows all user-agents by default (`User-agent: *` with only intentional Disallow rules)
  - [ ] Staging/preview environments have additional `noindex` meta tags — `robots.txt` is never the sole mechanism for staging de-indexing
- [ ] `noindex` audit passes on all indexable templates:
  - [ ] No page with `draft: false` and `keep`/`merge` disposition emits `<meta name="robots" content="noindex">`
  - [ ] Pages intended for non-indexation (404, privacy redirects, staging previews) have explicit `noindex` meta tags
  - [ ] No `noindex` page is also blocked by `robots.txt` (contradiction rule: Googlebot cannot see `noindex` if crawl is blocked)
- [ ] Crawl control validation script `scripts/seo/check-crawl-controls.js` exists and:
  - [ ] Parses `static/robots.txt` and flags any `Disallow` rule that blocks a URL class expected to be indexable
  - [ ] Scans all generated HTML files for `<meta name="robots">` and `<meta name="googlebot">` tags
  - [ ] Detects `noindex` on pages that should be indexable (checks against `url-manifest.json` disposition)
  - [ ] Detects `robots.txt`/`noindex` contradiction (URL blocked in robots AND carrying `noindex`)
  - [ ] Produces `migration/reports/phase-5-crawl-control-audit.csv` with per-URL results
  - [ ] Exits with non-zero code on any unintended `noindex` or contradiction defect
  - [ ] Is referenced in `package.json` as `npm run check:crawl-controls`
- [ ] Staging/preview environment index suppression is implemented:
  - [ ] Staging build emits `<meta name="robots" content="noindex, nofollow">` on all pages
  - [ ] Staging `robots.txt` includes `Disallow: /` AND pages carry `noindex` (belt-and-suspenders)
  - [ ] Production release artifact CI gate verifies no staging `noindex` tags are present
- [ ] `migration/reports/phase-5-crawl-control-audit.csv` achieves zero defects on the representative template set

---

### Tasks

- [ ] Review current `static/robots.txt` (from Phase 3 RHI-024):
  - [ ] Verify no `Disallow` rules that block indexable content paths
  - [ ] Verify sitemap directive is present and correct
  - [ ] Compare against live WordPress `robots.txt` at `https://www.rhino-inquisitor.com/robots.txt` for any intentional rules that must carry over
- [ ] Audit Phase 3 template partials for `noindex` output logic:
  - [ ] Identify any condition that emits `noindex` — confirm conditions are correct for production
  - [ ] Confirm that `draft: true` front matter triggers `noindex` (correct) but no other unintended condition does
- [ ] Create `scripts/seo/check-crawl-controls.js`:
  - [ ] Implement `robots.txt` disallow-path parser using known URL inventory from `url-manifest.json`
  - [ ] Implement HTML meta robots tag scanner
  - [ ] Implement contradiction detector (`Disallow` + `noindex` on same URL)
  - [ ] Write per-URL results to `migration/reports/phase-5-crawl-control-audit.csv`
- [ ] Verify staging environment build correctly suppresses indexing (both `robots.txt` and `noindex` meta)
- [ ] Verify production environment CI gate rejects any artifact with a `noindex` tag on an indexable page
- [ ] Add `"check:crawl-controls": "node scripts/seo/check-crawl-controls.js"` to `package.json`
- [ ] Integrate `check:crawl-controls` as a blocking step in the deploy CI workflow
- [ ] Document intent for any intentional `Disallow` or `noindex` rules in Progress Log with SEO owner sign-off

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- `scripts/seo/check-crawl-controls.js`
- `migration/reports/phase-5-crawl-control-audit.csv`
- `static/robots.txt` verified (or updated) and committed
- `package.json` updated with `check:crawl-controls` script
- CI workflow updated with `check:crawl-controls` blocking gate

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- Critical rule: do NOT pair `Disallow` in `robots.txt` with a de-indexing objective when search engines need to crawl the page to see `noindex`. If a page must be de-indexed, it must be crawlable AND carry a `noindex` meta tag. `robots.txt` alone cannot de-index; `noindex` alone without crawl access cannot de-index.
- The production Hugo build must NEVER pass `--buildDrafts`, `--buildFuture`, or `--buildExpired`. If these flags are accidentally used, draft content with staging `noindex` could be included in the production artifact. Verify the CI build command.
- Reference: `analysis/plan/details/phase-5.md` §Workstream C: Crawlability and Indexing Controls, §Critical Corrections §3
