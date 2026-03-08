## RHI-077 · Workstream D — HTTPS Issuance and Security Controls

**Status:** Open  
**Priority:** High  
**Estimate:** M  
**Phase:** 7  
**Assigned to:** Engineering Owner  
**Target date:** 2026-05-26  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Ensure the site is served exclusively over HTTPS from first production traffic, with certificate issuance monitored and enforced before declaring launch complete, mixed-content issues identified and fixed before cutover, and CAA DNS records correctly configured to avoid Let's Encrypt certificate issuance failures.

GitHub Pages automatically provisions a Let's Encrypt TLS certificate after a custom domain is configured. However, certificate provisioning can lag DNS changes by up to 24 hours, and the Enforce HTTPS toggle may not be available immediately after a domain change. Without explicit monitoring and a certificate readiness gate in the launch runbook, a site could go live accessible only over HTTP — exposing visitors and damaging the canonical host signal.

---

### Acceptance Criteria

- [ ] GitHub Pages "Enforce HTTPS" is enabled in repository Settings → Pages after DNS cutover and certificate provisioning:
  - [ ] Toggle is enabled (not grayed out — it becomes available only after certificate issuance)
  - [ ] Visiting `http://www.rhino-inquisitor.com/` redirects to `https://www.rhino-inquisitor.com/`
  - [ ] Verified via `curl -sI http://www.rhino-inquisitor.com/ | grep -i location`
- [ ] HTTPS works for homepage and representative deep URLs:
  - [ ] `https://www.rhino-inquisitor.com/` returns HTTP 200
  - [ ] At least two representative post URLs return HTTP 200 over HTTPS
  - [ ] At least one category page URL returns HTTP 200 over HTTPS
- [ ] No mixed-content errors on the homepage and representative templates:
  - [ ] No HTTP image, script, or stylesheet references in generated HTML
  - [ ] Browser console shows no mixed-content warnings on homepage load
- [ ] CAA DNS record audit is complete:
  - [ ] Either no CAA records exist (permitting all CAs — acceptable default) or a CAA record explicitly permits `letsencrypt.org`
  - [ ] If restrictive CAA records exist, `letsencrypt.org` is in the permitted issuers list or Pages cannot provision the certificate
- [ ] `migration/phase-7-https-checklist.md` is committed documenting:
  - [ ] CAA record audit result
  - [ ] Certificate issuance monitoring log (Pages settings check timestamps)
  - [ ] Enforce HTTPS enablement confirmation with timestamp
  - [ ] HTTPS verification check results for homepage and representative routes
  - [ ] Mixed-content audit results
- [ ] Launch HTTPS decision SLO is documented: if Enforce HTTPS is not available within 60 minutes after DNS propagation confirmation, trigger an incident hold and WS-H escalation; rollback decision is made per WS-H severity criteria while acknowledging GitHub certificate provisioning may take up to 24 hours

---

### Tasks

- [ ] Audit CAA DNS records:
  - [ ] Run `dig rhino-inquisitor.com CAA +short`
  - [ ] If CAA records exist: check whether `letsencrypt.org` is an authorized issuer
  - [ ] If CAA records restrict issuers and `letsencrypt.org` is missing: add `0 issue "letsencrypt.org"` to CAA records before DNS cutover
  - [ ] Record audit result in Progress Log
- [ ] Mixed-content audit — scan generated HTML for HTTP references:
  - [ ] Run Hugo production build: `hugo --gc --minify --environment production`
  - [ ] Search `public/` for HTTP (non-HTTPS) resource references:
    - [ ] `grep -r 'src="http://' public/`
    - [ ] `grep -r 'href="http://' public/`
    - [ ] `grep -r "src='http://" public/`
    - [ ] `grep -r "url(http://" public/`
  - [ ] Fix any found HTTP references in templates, partials, or front matter
  - [ ] Confirm zero HTTP resource references after fixes
  - [ ] Document fix summary in Progress Log
- [ ] Write `scripts/phase-7/check-mixed-content.js`:
  - [ ] Use `fast-glob` to find all HTML files in `public/`
  - [ ] Parse each file for HTTP-protocol resource URLs (src, href attributes and CSS url() references)
  - [ ] Report file path and matching line for each violation
  - [ ] Exit non-zero on any HTTP reference found
  - [ ] Add `"check:mixed-content": "node scripts/phase-7/check-mixed-content.js"` to `package.json`
- [ ] Wire `npm run check:mixed-content` into `.github/workflows/deploy-pages.yml` as a blocking pre-deploy step
- [ ] Document HTTPS monitoring procedure in `migration/phase-7-https-checklist.md`:
  - [ ] Step 1: Check DNS propagation (`dig www.rhino-inquisitor.com CNAME +short`)
  - [ ] Step 2: Watch Pages settings for certificate issuance (can take up to 24 hours after DNS change)
  - [ ] Step 3: When certificate is issued, check Enforce HTTPS toggle is available
  - [ ] Step 4: Enable Enforce HTTPS and verify HTTP-to-HTTPS redirect
  - [ ] Step 5: Test HTTPS on homepage and representative routes
  - [ ] Step 6: Confirm no mixed-content errors in browser console
- [ ] Document escalation trigger: if Enforce HTTPS is not available within 60 minutes of DNS propagation confirmation, open WS-H incident response (RHI-081), record GitHub status, and choose hold vs rollback per impact
- [ ] Commit `migration/phase-7-https-checklist.md`, updated scripts, and `package.json`

---

### Out of Scope

- Provisioning or renewing the TLS certificate manually (GitHub Pages manages Let's Encrypt provisioning automatically)
- Configuring a custom CDN or WAF TLS termination
- HSTS header configuration (GitHub Pages controls this; not configurable at the static site level)
- DNS record changes (WS-C: RHI-076 — CAA record changes, if needed, are coordinated with WS-C)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-073 Done — Phase 7 Bootstrap complete | Ticket | Pending |
| RHI-076 Done — WS-C DNS cutover plan complete; CAA record audit findings available | Ticket | Pending |
| RHI-074 Done — WS-A deployment workflow working; can perform Pages deploys to verify HTTPS | Ticket | Pending |
| GitHub Pages settings access (Enforce HTTPS toggle, certificate status) | Access | Pending |
| Phase 3 SEO partials using HTTPS canonical URLs (RHI-024 outputs) | Phase | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Certificate provisioning takes more than 24 hours after DNS cutover | Low | High | At 60 minutes, escalate to WS-H incident hold and decision review; rollback is conditional on impact/severity because GitHub docs allow certificate provisioning delays up to 24 hours | Engineering Owner |
| CAA records block Let's Encrypt issuance | Low | High | Audit CAA records before DNS cutover; add `letsencrypt.org` authorization if missing — this is a pre-cutover task, not a post-problem | Engineering Owner |
| Mixed-content errors from hard-coded HTTP image or script URLs survive into production | Medium | Medium | Run `check:mixed-content` as a blocking CI gate before artifact upload; fix any findings before cutover | Engineering Owner |
| Enforce HTTPS toggle unavailable immediately after domain change | Medium | Low | This is an expected Pages behavior; document the monitoring wait period in the launch runbook (WS-G). It becomes available after cert provisioning, which can take up to 24 hours | Engineering Owner |
| `http://` references in CSS `url()` values missed by grep-based checks | Low | Medium | The `check-mixed-content.js` script must check CSS content embedded in HTML and linked stylesheets in `public/` in addition to HTML attributes | Engineering Owner |

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

- `scripts/phase-7/check-mixed-content.js` — mixed-content HTTP reference detector
- `package.json` updated with `check:mixed-content` script
- `.github/workflows/deploy-pages.yml` updated to wire mixed-content gate
- `migration/phase-7-https-checklist.md` — HTTPS monitoring and enforcement checklist

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- The Enforce HTTPS toggle in Pages settings becomes available only after the TLS certificate has been provisioned. It is not available immediately after entering a custom domain. The launch runbook (WS-G, RHI-080) must include an explicit wait-and-check step for certificate issuance before attempting to enable enforcement.
- If CAA records are restrictive (e.g., only permit a specific CA), Let's Encrypt cannot provision the certificate and Pages will show a certificate error indefinitely. This must be audited before the cutover — CAA record changes take time to propagate, and fixing a CAA record post-cutover adds hours to the HTTPS recovery path.
- Mixed-content HTTP references in the build output are often remnants of WordPress-era image URLs or hard-coded links in templates. The `check-mixed-content.js` script must be thorough — it should check HTML attributes, inline styles, and linked stylesheets (including CSS files in `public/`).
- GitHub Pages Enforce HTTPS applies at the Pages platform level and produces an HTTP 301 redirect to the HTTPS equivalent. This is not configurable in the static site itself. The canonical tags and sitemap already point to `https://` (ensured by Phase 5 and WS-E) — the Enforce HTTPS toggle is the final layer that makes HTTP access impossible.
- Reference: `analysis/plan/details/phase-7.md` §Workstream D: HTTPS Issuance and Security Controls; GitHub HTTPS docs: https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
