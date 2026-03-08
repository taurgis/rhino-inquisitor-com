## RHI-078 · Workstream E — SEO-Safe Deployment and Host Consolidation

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 7  
**Assigned to:** SEO Owner  
**Target date:** 2026-05-27  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Verify that the Hugo build output emits the correct canonical host (`https://www.rhino-inquisitor.com`) exclusively in all canonical tags, sitemap URLs, `robots.txt` references, and internal links — and that no staging-era SEO anti-patterns (`noindex` leakage, `github.io` canonicals, canonical pointing to redirected paths) survive into the release candidate artifact. The Phase 6 redirect map must be active and parity-tested on the deployed artifact.

This workstream produces no new features or configuration — it is a validation and anti-regression gate that must be satisfied on every release candidate before launch. Its outputs are automated checks and a sign-off document confirming the site is SEO-safe for cutover.

---

### Acceptance Criteria

- [ ] All canonical tags in the generated `public/` HTML use the canonical host exclusively:
  - [ ] No canonical tag contains `github.io` as the host
  - [ ] No canonical tag uses `http://` (all must be `https://`)
  - [ ] No canonical tag uses the apex host without `www` (`https://rhino-inquisitor.com/...`)
  - [ ] Verified on: homepage, three most-recent published posts by front matter date, one category page selected from the first alphabetical category slug, and one archive page
  - [ ] Sampling method and selected URLs are recorded in `migration/phase-7-seo-safety-report.md` for reproducibility
- [ ] Sitemap (`public/sitemap.xml`) uses canonical host exclusively:
  - [ ] All `<loc>` elements start with `https://www.rhino-inquisitor.com/`
  - [ ] No `github.io` URLs in sitemap
  - [ ] No HTTP URLs in sitemap
  - [ ] No redirected source paths (legacy URLs from Phase 6 redirect map) appear in sitemap
- [ ] `public/robots.txt` references the canonical sitemap URL:
  - [ ] `Sitemap: https://www.rhino-inquisitor.com/sitemap.xml` is present
  - [ ] No staging-blocking `Disallow: /` directive present
  - [ ] `User-agent: *` with correct allow rules present
- [ ] No `noindex` directive leakage from staging environments:
  - [ ] No `<meta name="robots" content="noindex">` in any page that should be indexable
  - [ ] No `X-Robots-Tag: noindex` in HTTP response headers (check via `curl -I`)
  - [ ] Checked on: homepage, a post, a category page
- [ ] Internal links resolve to canonical host and final paths:
  - [ ] No internal links pointing to the `github.io` host
  - [ ] No internal links using HTTP protocol
  - [ ] No internal links targeting legacy redirect source URLs (i.e., no internal link goes through a redirect hop)
- [ ] Feed endpoint continuity:
  - [ ] Canonical feed endpoint (`/index.xml` unless an explicit `/feed/` mapping is documented) is accessible over HTTPS
  - [ ] Feed `<link>` or `<atom:link>` elements use canonical HTTPS host
- [ ] Phase 6 redirect parity gate passes on the deployed artifact:
  - [ ] `npm run check:url-parity` exits with code 0
  - [ ] `npm run check:canonical-alignment` exits with code 0
- [ ] `scripts/phase-7/check-seo-safe-deploy.js` exists and:
  - [ ] Checks canonical tags on all HTML pages in `public/` for host and protocol correctness
  - [ ] Checks all sitemap `<loc>` URLs for canonical host and HTTPS
  - [ ] Checks `robots.txt` for sitemap declaration and absence of `Disallow: /`
  - [ ] Reports any `noindex` meta tags found in indexable pages
  - [ ] Exits non-zero on any violation
  - [ ] Is referenced in `package.json` as `npm run check:seo-safe-deploy`
- [ ] `migration/phase-7-seo-safety-report.md` is committed confirming all checks passed on the release candidate, with the Actions run URL as evidence

---

### Tasks

- [ ] Run Hugo production build: `hugo --gc --minify --environment production`
- [ ] Audit canonical tags in generated HTML:
  - [ ] Select sample URLs deterministically: homepage, three most-recent published posts, first alphabetical category page, and archive page
  - [ ] Open each file and verify `<link rel="canonical" href="...">` uses `https://www.rhino-inquisitor.com`
  - [ ] Search `public/` for any canonical tags with `github.io`: `grep -r 'github.io' public/ --include="*.html" -l`
  - [ ] Search `public/` for any canonical tags with `http://`: `grep -r 'canonical.*http://' public/ --include="*.html" -l`
  - [ ] Fix any violations in SEO partials (RHI-024 outputs)
- [ ] Audit sitemap:
  - [ ] Parse `public/sitemap.xml` and check all `<loc>` values
  - [ ] Confirm all use `https://www.rhino-inquisitor.com/` prefix
  - [ ] Cross-check Phase 6 redirect source URLs against sitemap — none should appear
- [ ] Audit `robots.txt`:
  - [ ] Open `public/robots.txt`
  - [ ] Confirm `Sitemap:` directive points to `https://www.rhino-inquisitor.com/sitemap.xml`
  - [ ] Confirm no `Disallow: /` or similar crawl-blocking directives are present
- [ ] Audit for `noindex` leakage:
  - [ ] `grep -r 'noindex' public/ --include="*.html" -l`
  - [ ] Check all matched pages — are they legitimately noindex (e.g., `draft: true` pages should not be in the production build at all) or false positives?
  - [ ] Fix any unintended `noindex` in indexable pages
- [ ] Audit internal links for canonical host compliance:
  - [ ] `grep -r 'href="http://' public/ --include="*.html" -l`
  - [ ] `grep -r 'href="https://github.io' public/ --include="*.html" -l`
  - [ ] Fix any violations in templates or content files
- [ ] Check feed endpoint:
  - [ ] Confirm `public/index.xml` exists; if a `/feed/` route is used, document its redirect mapping from the canonical endpoint
  - [ ] Verify `<link>` or `<atom:link>` in feed uses canonical HTTPS host
- [ ] Run Phase 6 redirect parity gates:
  - [ ] `npm run check:url-parity`
  - [ ] `npm run check:canonical-alignment`
  - [ ] Record pass/fail and any output in Progress Log
- [ ] Write `scripts/phase-7/check-seo-safe-deploy.js`:
  - [ ] Parse all HTML in `public/` with `cheerio`
  - [ ] Check canonical `href` attribute value on every page
  - [ ] Parse `public/sitemap.xml` and check all `<loc>` values
  - [ ] Read `public/robots.txt` and validate `Sitemap:` directive and absence of blocking `Disallow`
  - [ ] Check for `<meta name="robots" content="noindex">` on all pages
  - [ ] Output structured report to stdout
  - [ ] Exit 1 on any violation
- [ ] Add `"check:seo-safe-deploy": "node scripts/phase-7/check-seo-safe-deploy.js"` to `package.json`
- [ ] Wire `npm run check:seo-safe-deploy` into `.github/workflows/deploy-pages.yml` as a blocking pre-deploy gate
- [ ] Commit `migration/phase-7-seo-safety-report.md` after all checks pass on the release candidate

---

### Out of Scope

- Redesigning canonical tag templates (Phase 3/5 scope — fix bugs only, not redesign)
- Changing sitemap generation strategy or robots.txt policy (Phase 5 scope)
- Implementing new redirect rules (Phase 6 scope — manifest is frozen)
- Post-launch SEO monitoring and Search Console submission (Phase 9 scope)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-073 Done — Phase 7 Bootstrap complete | Ticket | Pending |
| RHI-074 Done — WS-A deployment workflow complete; production build available | Ticket | Pending |
| RHI-024 Done — Phase 3 SEO foundation partials committed (canonical, sitemap, robots.txt templates) | Ticket | Pending |
| RHI-050 Done — Phase 5 crawlability and indexing controls (robots.txt, noindex policy) committed | Ticket | Pending |
| RHI-065 Done — Phase 6 Hugo route preservation and alias integration complete | Ticket | Pending |
| RHI-069 Done — Phase 6 canonical alignment report passing | Ticket | Pending |
| `cheerio` available in `package.json` (from Phase 6 tooling) | Tool | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| `github.io` host leaks into canonical tags if `baseURL` was hard-coded instead of using Pages-injected value | Medium | High | Audit template canonical tag output in the deployed Pages artifact, not just the local build; Pages base URL injection (`actions/configure-pages`) must be the source | SEO Owner |
| `noindex` meta tag added during Phase 7 staging deploy survives into the production release candidate | Low | High | The `check:seo-safe-deploy` gate runs on every build including PR builds; any `noindex` in a non-draft page will fail CI | SEO Owner |
| Phase 5 sitemap generation produces absolute URLs with the wrong host during CI build | Medium | High | Verify that `hugo.toml` `baseURL` and the `actions/configure-pages` base URL are consistent; test the sitemap in a `workflow_dispatch` deploy before WS-G | SEO Owner |
| Internal links in migrated content point to the legacy WordPress host or `http://` variant | Medium | Medium | The `check:seo-safe-deploy` script will detect and fail on these; check the Phase 4 internal link rewrite output (RHI-038) for completeness | SEO Owner |

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

- `scripts/phase-7/check-seo-safe-deploy.js` — SEO host and canonical safety checker
- `package.json` updated with `check:seo-safe-deploy` script
- `.github/workflows/deploy-pages.yml` updated to wire SEO safety gate
- `migration/phase-7-seo-safety-report.md` — sign-off report confirming all SEO safety checks pass on release candidate

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- The canonical host check must run against the deployed Pages artifact, not just the local Hugo build. The Pages base URL injection (`actions/configure-pages` step providing `${{ steps.pages.outputs.base_url }}`) is what ensures the correct canonical host is embedded — a local build with a different `baseURL` may produce different canonical values. Always use `workflow_dispatch` to trigger a real deploy and inspect the live artifact.
- No production page that is meant to be indexed should have `<meta name="robots" content="noindex">`. The only exception is the 404 page. The staging `noindex` pattern (sometimes applied in Phase 7 pre-launch staging builds) must be removed before the release candidate build.
- The robots.txt Sitemap declaration must match exactly: `Sitemap: https://www.rhino-inquisitor.com/sitemap.xml`. Any deviation (wrong host, HTTP instead of HTTPS, missing trailing `/`, wrong path) is a crawlability defect.
- The feed endpoint (`/index.xml`) continuity check is important for RSS subscribers. If the feed URL changed during migration, subscribers lose their feed. Verify the feed URL maps to the same path as the WordPress feed or that a redirect is in place.
- Reference: `analysis/plan/details/phase-7.md` §Workstream E: SEO-Safe Deployment and Host Consolidation; Google canonical guidance: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
