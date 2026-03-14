## RHI-066 · Workstream D — Host and Protocol Canonical Consolidation

**Status:** In Progress  
**Priority:** High  
**Estimate:** M  
**Phase:** 6  
**Assigned to:** Engineering Owner  
**Target date:** 2026-05-12  
**Created:** 2026-03-07  
**Updated:** 2026-03-14

---

### Goal

Ensure that all entry-path variants of the site — `http://`, `http://www.`, `https://` (apex), `https://www.` — consolidate correctly to the canonical host (`https://www.rhino-inquisitor.com/`). Prevent authority dilution from multiple crawlable host variants and eliminate canonical leakage to non-production hosts. Verify that GitHub Pages custom-domain and HTTPS settings produce the expected host/protocol consolidation behavior.

Host/protocol fragmentation is a persistent post-migration index problem. If crawlers index the apex domain independently of the `www` canonical, Search Console shows coverage anomalies and Googlebot dilutes link equity across both properties. This workstream enforces a single canonical host before cutover.

---

### Acceptance Criteria

- [x] Hugo template canonical tags always output `https://www.rhino-inquisitor.com/` as the canonical host:
  - [x] `src/layouts/partials/seo/head-meta.html` (or equivalent) uses `.Permalink` which is derived from `baseURL = "https://www.rhino-inquisitor.com/"`
  - [x] No hardcoded apex, HTTP, or non-www canonical URL exists in any template
  - [x] `hugo.toml` `baseURL` is `"https://www.rhino-inquisitor.com/"` (www, HTTPS, trailing slash)
- [x] Sitemap output uses canonical host exclusively:
  - [x] All `<loc>` values in `public/sitemap.xml` begin with `https://www.rhino-inquisitor.com/`
  - [x] Zero apex (`https://rhino-inquisitor.com/`) or HTTP URLs in sitemap
- [ ] GitHub Pages custom-domain configuration confirmed:
  - [ ] Custom domain set to `www.rhino-inquisitor.com` in GitHub Pages repository settings
  - [ ] `Enforce HTTPS` is enabled in GitHub Pages settings
  - [ ] Expected behavior documented: Pages enforces HTTPS; apex/www consolidation depends on DNS configuration
- [ ] DNS consolidation plan confirmed for cutover:
  - [x] Apex-to-www redirect mechanism identified (DNS provider URL forwarding/redirect feature, CDN/edge redirect, or equivalent HTTP redirect layer)
  - [ ] `http://` to `https://` redirect is platform-enforced (GitHub Pages HTTPS enforcement)
  - [x] DNS plan documented in `migration/phase-6-url-policy.md`
- [x] Non-production host canonical leakage check:
  - [x] Staging and preview deployment URLs confirmed as `noindex` (meta tag, not solely robots.txt)
  - [x] No staging canonical tag referencing a non-production host appears in the release build
- [ ] Search Console property coverage confirmed:
  - [x] Domain ownership confirmed by user on 2026-03-14
  - [ ] `https://www.rhino-inquisitor.com/` (primary preferred property) — ownership verified in recorded evidence
  - [ ] `https://rhino-inquisitor.com/` (apex variant) — ownership verified or covered by documented domain-property scope
  - [ ] `http://www.rhino-inquisitor.com/` and `http://rhino-inquisitor.com/` — verified or noted as unavailable
- [x] Entry-path validation test confirms single canonical endpoint:
  - [x] `scripts/phase-6/check-host-protocol.js` exits with code 0:
    - [x] Checks all canonical tags in built HTML use canonical host
    - [x] Checks sitemap has zero non-canonical host entries
    - [x] Checks `robots.txt` `Sitemap:` directive uses canonical host URL

---

### Tasks

- [x] Audit `hugo.toml` `baseURL`:
  - [x] Confirm it is `"https://www.rhino-inquisitor.com/"` — exactly: HTTPS, www, trailing slash
  - [x] Fix if incorrect; run production build and verify `.Permalink` output
- [x] Audit canonical tag template:
  - [x] Locate canonical tag generation in `src/layouts/partials/seo/`
  - [x] Confirm it uses `.Permalink` (not `.URL` or `.RelPermalink`)
  - [x] Spot-check 5 sample canonical tags in the built `public/` directory with `cheerio`
- [x] Audit sitemap output:
  - [x] Build production site; parse `public/sitemap.xml`
  - [x] Extract all `<loc>` values; verify all start with `https://www.rhino-inquisitor.com/`
  - [x] Fix any non-canonical host appearing in sitemap
- [ ] Confirm GitHub Pages configuration:
  - [ ] Verify custom domain setting in repository Settings → Pages
  - [ ] Verify `Enforce HTTPS` is enabled
  - [ ] Document current state in Progress Log
- [ ] Define and document DNS consolidation plan:
  - [x] Identify apex-to-www redirect mechanism available with DNS provider
  - [x] Document in `migration/phase-6-url-policy.md` under host/protocol policy section
  - [ ] Note that DNS execution is Phase 7 scope; this workstream only confirms the plan
- [x] Check for non-production canonical leakage:
  - [x] Inspect CI/CD workflow for staging deployments
  - [x] Confirm staging uses `noindex` meta tag (not solely robots.txt Disallow)
  - [x] Confirm release build does not inherit staging noindex settings
- [ ] Confirm Search Console property coverage:
  - [x] User confirmed domain ownership in Search Console
  - [ ] Record whether ownership is via domain property or URL-prefix properties in Progress Log
  - [ ] Note variant coverage status in Progress Log
- [x] Write `scripts/phase-6/check-host-protocol.js`
- [x] Run script and fix all failures
- [ ] Commit script and any template/config fixes

---

### Out of Scope

- DNS record execution at the registrar (Phase 7: RHI-077 or equivalent)
- Setting up new Search Console properties (Search Console access is a Phase 5 deliverable from RHI-057)
- Content-level canonical overrides (covered in Phase 5: RHI-048)
- Edge redirect configuration for apex-to-www (Phase 7 execution; this workstream defines the plan only)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-061 Done — Phase 6 Bootstrap complete | Ticket | Pending |
| `hugo.toml` with `baseURL` set from Phase 3 (RHI-021) | Phase | Pending |
| SEO partials from Phase 3 (RHI-024) — canonical tag template accessible | Phase | Pending |
| Search Console access confirmed from Phase 5 (RHI-057) | Phase | Pending |
| GitHub Pages custom-domain setting configured (from Phase 3 or Phase 7 pre-work) | Phase | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| `hugo.toml` `baseURL` incorrect (apex instead of www, or HTTP), causing all canonicals and sitemap URLs to be wrong | Low | Critical | Audit `baseURL` as first task; treat any mismatch as a P0 blocker; fix before any other workstream uses build output | Engineering Owner |
| DNS provider does not support apex-to-www redirect at DNS layer | Medium | Medium | Document the gap; use provider URL forwarding, CDN/edge redirect, or an equivalent HTTP redirect mechanism; escalate to Phase 7 cutover planning | Migration Owner |
| Staging deployment is accessible to Googlebot via canonical host (canonical leakage) | Low | High | Confirm staging is either on a non-crawlable domain or explicitly suppressed with `noindex` meta tag on every page | Engineering Owner |
| Search Console properties not verified for all host variants, making post-cutover monitoring unreliable | Medium | Medium | Verify property ownership at this workstream; flag any unverifiable property to Phase 9 monitoring owner | SEO Owner |

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

- `scripts/phase-6/check-host-protocol.js` — host/protocol validation script
- `migration/phase-6-url-policy.md` — updated with host/protocol consolidation plan
- Any `hugo.toml` or template fixes committed
- Search Console property coverage status in Progress Log

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-14 | In Progress | Added `scripts/phase-6/check-host-protocol.js`, wired `npm run check:host-protocol`, documented the host/protocol policy in `migration/phase-6-url-policy.md`, and verified temp artifacts: production metadata `215` indexable pages, production sitemap `215` URLs, production crawl-controls `237` HTML routes, preview crawl-controls `237` HTML routes. Live checks found the current preview deployment emitting `http://taurgis.github.io/...` absolute URLs, so `.github/workflows/deploy-pages.yml` now normalizes the preview base URL to HTTPS for future deploys. User confirmed Search Console ownership for the domain. Live production checks also showed `https://rhino-inquisitor.com/` still resolving directly instead of consolidating to `https://www.rhino-inquisitor.com/`, so apex-to-www runtime consolidation remains an external Phase 7 item. |

---

### Notes

- The canonical host policy is `https://www.rhino-inquisitor.com/`. This is fixed. Do not introduce flexibility here — any deviation requires explicit SEO owner approval and documentation as an exception.
- GitHub Pages enforces HTTPS when `Enforce HTTPS` is enabled, but apex-to-www consolidation should not be assumed to happen automatically. The DNS plan must define and test an explicit apex-to-www redirect mechanism.
- `http://` to `https://` is handled by GitHub Pages `Enforce HTTPS`. `https://rhino-inquisitor.com/` (apex) to `https://www.rhino-inquisitor.com/` requires correct DNS setup (ANAME/ALIAS record for apex → www, or a Pages-compatible apex redirect approach).
- The Search Console property coverage verification is a prerequisite for the Phase 9 monitoring runbook (inherited from Phase 5: RHI-057). If Search Console properties are missing, post-cutover monitoring will have blind spots.
- Reference: `analysis/plan/details/phase-6.md` §Workstream D, §URL Policy Contract (Final)
