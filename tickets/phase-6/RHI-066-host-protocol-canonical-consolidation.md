## RHI-066 · Workstream D — Host and Protocol Canonical Consolidation

**Status:** Open  
**Priority:** High  
**Estimate:** M  
**Phase:** 6  
**Assigned to:** Engineering Owner  
**Target date:** 2026-05-12  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Ensure that all entry-path variants of the site — `http://`, `http://www.`, `https://` (apex), `https://www.` — consolidate correctly to the canonical host (`https://www.rhino-inquisitor.com/`). Prevent authority dilution from multiple crawlable host variants and eliminate canonical leakage to non-production hosts. Verify that GitHub Pages custom-domain and HTTPS settings produce the expected host/protocol consolidation behavior.

Host/protocol fragmentation is a persistent post-migration index problem. If crawlers index the apex domain independently of the `www` canonical, Search Console shows coverage anomalies and Googlebot dilutes link equity across both properties. This workstream enforces a single canonical host before cutover.

---

### Acceptance Criteria

- [ ] Hugo template canonical tags always output `https://www.rhino-inquisitor.com/` as the canonical host:
  - [ ] `layouts/partials/seo/head-meta.html` (or equivalent) uses `.Permalink` which is derived from `baseURL = "https://www.rhino-inquisitor.com/"`
  - [ ] No hardcoded apex, HTTP, or non-www canonical URL exists in any template
  - [ ] `hugo.toml` `baseURL` is `"https://www.rhino-inquisitor.com/"` (www, HTTPS, trailing slash)
- [ ] Sitemap output uses canonical host exclusively:
  - [ ] All `<loc>` values in `public/sitemap.xml` begin with `https://www.rhino-inquisitor.com/`
  - [ ] Zero apex (`https://rhino-inquisitor.com/`) or HTTP URLs in sitemap
- [ ] GitHub Pages custom-domain configuration confirmed:
  - [ ] Custom domain set to `www.rhino-inquisitor.com` in GitHub Pages repository settings
  - [ ] `Enforce HTTPS` is enabled in GitHub Pages settings
  - [ ] Expected behavior documented: Pages enforces HTTPS; apex/www consolidation depends on DNS configuration
- [ ] DNS consolidation plan confirmed for cutover:
  - [ ] Apex-to-www redirect mechanism identified (DNS provider URL forwarding/redirect feature, CDN/edge redirect, or equivalent HTTP redirect layer)
  - [ ] `http://` to `https://` redirect is platform-enforced (GitHub Pages HTTPS enforcement)
  - [ ] DNS plan documented in `migration/phase-6-url-policy.md`
- [ ] Non-production host canonical leakage check:
  - [ ] Staging and preview deployment URLs confirmed as `noindex` (meta tag, not solely robots.txt)
  - [ ] No staging canonical tag referencing a non-production host appears in the release build
- [ ] Search Console property coverage confirmed:
  - [ ] `https://www.rhino-inquisitor.com/` (primary preferred property) — ownership verified
  - [ ] `https://rhino-inquisitor.com/` (apex variant) — ownership verified
  - [ ] `http://www.rhino-inquisitor.com/` and `http://rhino-inquisitor.com/` — verified or noted as unavailable
- [ ] Entry-path validation test confirms single canonical endpoint:
  - [ ] `scripts/phase-6/check-host-protocol.js` exits with code 0:
    - [ ] Checks all canonical tags in built HTML use canonical host
    - [ ] Checks sitemap has zero non-canonical host entries
    - [ ] Checks `robots.txt` `Sitemap:` directive uses canonical host URL

---

### Tasks

- [ ] Audit `hugo.toml` `baseURL`:
  - [ ] Confirm it is `"https://www.rhino-inquisitor.com/"` — exactly: HTTPS, www, trailing slash
  - [ ] Fix if incorrect; run production build and verify `.Permalink` output
- [ ] Audit canonical tag template:
  - [ ] Locate canonical tag generation in `layouts/partials/seo/`
  - [ ] Confirm it uses `.Permalink` (not `.URL` or `.RelPermalink`)
  - [ ] Spot-check 5 sample canonical tags in the built `public/` directory with `cheerio`
- [ ] Audit sitemap output:
  - [ ] Build production site; parse `public/sitemap.xml`
  - [ ] Extract all `<loc>` values; verify all start with `https://www.rhino-inquisitor.com/`
  - [ ] Fix any non-canonical host appearing in sitemap
- [ ] Confirm GitHub Pages configuration:
  - [ ] Verify custom domain setting in repository Settings → Pages
  - [ ] Verify `Enforce HTTPS` is enabled
  - [ ] Document current state in Progress Log
- [ ] Define and document DNS consolidation plan:
  - [ ] Identify apex-to-www redirect mechanism available with DNS provider
  - [ ] Document in `migration/phase-6-url-policy.md` under host/protocol policy section
  - [ ] Note that DNS execution is Phase 7 scope; this workstream only confirms the plan
- [ ] Check for non-production canonical leakage:
  - [ ] Inspect CI/CD workflow for staging deployments
  - [ ] Confirm staging uses `noindex` meta tag (not solely robots.txt Disallow)
  - [ ] Confirm release build does not inherit staging noindex settings
- [ ] Confirm Search Console property coverage:
  - [ ] Log in to Search Console and verify properties listed above
  - [ ] Note ownership status in Progress Log
- [ ] Write `scripts/phase-6/check-host-protocol.js`
- [ ] Run script and fix all failures
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

---

### Notes

- The canonical host policy is `https://www.rhino-inquisitor.com/`. This is fixed. Do not introduce flexibility here — any deviation requires explicit SEO owner approval and documentation as an exception.
- GitHub Pages enforces HTTPS when `Enforce HTTPS` is enabled, but apex-to-www consolidation should not be assumed to happen automatically. The DNS plan must define and test an explicit apex-to-www redirect mechanism.
- `http://` to `https://` is handled by GitHub Pages `Enforce HTTPS`. `https://rhino-inquisitor.com/` (apex) to `https://www.rhino-inquisitor.com/` requires correct DNS setup (ANAME/ALIAS record for apex → www, or a Pages-compatible apex redirect approach).
- The Search Console property coverage verification is a prerequisite for the Phase 9 monitoring runbook (inherited from Phase 5: RHI-057). If Search Console properties are missing, post-cutover monitoring will have blind spots.
- Reference: `analysis/plan/details/phase-6.md` §Workstream D, §URL Policy Contract (Final)
