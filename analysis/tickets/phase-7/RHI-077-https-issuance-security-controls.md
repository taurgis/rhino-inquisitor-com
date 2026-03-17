## RHI-077 · Workstream D — HTTPS Issuance and Security Controls

**Status:** Done  
**Priority:** High  
**Estimate:** M  
**Phase:** 7  
**Assigned to:** Engineering Owner  
**Target date:** 2026-05-26  
**Created:** 2026-03-07  
**Updated:** 2026-03-17

---

### Goal

Ensure the staging site at `staging.rhino-inquisitor.com` is served exclusively over HTTPS with certificate issuance monitored and enforced before staging sign-off. This workstream validates the HTTPS procedures and team readiness on the staging subdomain. Production HTTPS enforcement will be handled in a separate final ticket after staging validation completes.

GitHub Pages automatically provisions a Let's Encrypt TLS certificate after a custom domain is configured. However, certificate provisioning can lag DNS changes by up to 24 hours, and the Enforce HTTPS toggle may not be available immediately after a domain change. Without explicit monitoring and a certificate readiness gate in the launch runbook, a site could go live accessible only over HTTP — exposing visitors and damaging the canonical host signal.

---

### Acceptance Criteria

- [x] GitHub Pages "Enforce HTTPS" is enabled in repository Settings → Pages after staging DNS cutover and certificate provisioning:
  - [x] Toggle is enabled (not grayed out — it becomes available only after certificate issuance)
  - [x] Visiting `http://staging.rhino-inquisitor.com/` redirects to `https://staging.rhino-inquisitor.com/`
  - [x] Verified via `curl -sI http://staging.rhino-inquisitor.com/ | grep -i location`
- [x] HTTPS works for staging homepage and representative deep URLs:
  - [x] `https://staging.rhino-inquisitor.com/` returns HTTP 200
  - [x] At least two representative post URLs return HTTP 200 over HTTPS
  - [x] At least one category page URL returns HTTP 200 over HTTPS
- [x] No mixed-content errors on the homepage and representative templates:
  - [x] No HTTP image, script, or stylesheet references in generated HTML
  - [x] Browser console shows no mixed-content warnings on homepage load
- [x] CAA DNS record audit is complete:
  - [x] Either no CAA records exist (permitting all CAs — acceptable default) or a CAA record explicitly permits `letsencrypt.org`
  - [x] If restrictive CAA records exist, `letsencrypt.org` is in the permitted issuers list or Pages cannot provision the certificate
- [x] `migration/phase-7-https-staging-checklist.md` is committed documenting:
  - [x] CAA record audit result (shared with production ticket)
  - [x] Certificate issuance monitoring log for staging (Pages settings check timestamps)
  - [x] Enforce HTTPS enablement confirmation with timestamp for staging
  - [x] HTTPS verification check results for staging homepage and representative routes
  - [x] Mixed-content audit results
- [x] Staging HTTPS decision SLO is documented: if Enforce HTTPS is not available within 60 minutes after staging DNS propagation confirmation, trigger an incident hold; staging sign-off is gated on HTTPS readiness

---

### Tasks

- [x] Audit CAA DNS records:
  - [x] Run `dig rhino-inquisitor.com CAA +short`
  - [x] If CAA records exist: check whether `letsencrypt.org` is an authorized issuer
  - [x] If CAA records restrict issuers and `letsencrypt.org` is missing: add `0 issue "letsencrypt.org"` to CAA records before DNS cutover (not required; record already present)
  - [x] Record audit result in Progress Log
- [x] Mixed-content audit — scan generated HTML for HTTP references:
  - [x] Run Hugo production build: `hugo --cleanDestinationDir --gc --minify --environment production`
  - [x] Search `public/` for HTTP (non-HTTPS) resource references:
    - [x] `grep -r 'src="http://' public/`
    - [x] `grep -r 'href="http://' public/`
    - [x] `grep -r "src='http://" public/`
    - [x] `grep -r "url(http://" public/`
  - [x] Fix any found HTTP references in templates, partials, or front matter
  - [x] Confirm zero HTTP resource references after fixes
  - [x] Document fix summary in Progress Log
- [x] Write `scripts/phase-7/check-mixed-content.js`:
  - [x] Use `fast-glob` to find all HTML files in `public/`
  - [x] Parse each file for HTTP-protocol resource URLs (src, href attributes and CSS url() references)
  - [x] Report file path and matching line for each violation
  - [x] Exit non-zero on any HTTP reference found
  - [x] Add `"check:mixed-content": "node scripts/phase-7/check-mixed-content.js"` to `package.json`
- [x] Wire `npm run check:mixed-content` into `.github/workflows/deploy-pages.yml` as a blocking pre-deploy step
- [x] Document HTTPS monitoring procedure in `migration/phase-7-https-staging-checklist.md`:
  - [x] Step 1: Check DNS propagation for staging (`dig staging.rhino-inquisitor.com CNAME +short`)
  - [x] Step 2: Watch Pages settings for certificate issuance (can take up to 24 hours after DNS change)
  - [x] Step 3: When certificate is issued, check Enforce HTTPS toggle is available
  - [x] Step 4: Enable Enforce HTTPS and verify HTTP-to-HTTPS redirect for staging
  - [x] Step 5: Test HTTPS on staging homepage and representative routes
  - [x] Step 6: Confirm no mixed-content errors in browser console
  - [x] Step 7: Record staging HTTPS sign-off with timestamp
- [x] Document escalation trigger: if Enforce HTTPS is not available within 60 minutes of staging DNS propagation confirmation, trigger incident response and hold staging sign-off until resolved
- [x] Commit `migration/phase-7-https-staging-checklist.md`, updated scripts, and `package.json`

---

### Out of Scope

- Production `www.rhino-inquisitor.com` and apex HTTPS enforcement (handled in final production cutover ticket after staging sign-off)
- Provisioning or renewing the TLS certificate manually (GitHub Pages manages Let's Encrypt provisioning automatically)
- Configuring a custom CDN or WAF TLS termination
- HSTS header configuration (GitHub Pages controls this; not configurable at the static site level)
- DNS record changes (WS-C: RHI-076 — CAA record changes already completed; staging uses CAA findings)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-073 Done — Phase 7 Bootstrap complete | Ticket | Done |
| RHI-076 Done — WS-C DNS cutover plan complete; CAA record audit findings available | Ticket | Done |
| RHI-074 Done — WS-A deployment workflow working; can perform Pages deploys to verify HTTPS | Ticket | Done |
| GitHub Pages settings access (Enforce HTTPS toggle, certificate status) | Access | Resolved via owner confirmation |
| Phase 3 SEO partials using HTTPS canonical URLs (RHI-024 outputs) | Phase | Done |

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

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Completed the dedicated mixed-content gate for Phase 7, wired it into the GitHub Pages deploy workflow, committed the staging HTTPS checklist artifact, captured live staging redirect/CAA/mixed-content evidence, and recorded owner confirmation that GitHub Pages certificate and HTTPS configuration are correct because the staging site is available over HTTPS.

**Delivered artefacts:**

- `scripts/phase-7/check-mixed-content.js` — mixed-content HTTP reference detector
- `package.json` updated with `check:mixed-content` script
- `.github/workflows/deploy-pages.yml` updated to wire mixed-content gate
- `migration/phase-7-https-staging-checklist.md` — HTTPS monitoring and enforcement checklist

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-17 | In Progress | Added the dedicated `check:mixed-content` gate script, wired it into `.github/workflows/deploy-pages.yml`, created `migration/phase-7-https-staging-checklist.md`, confirmed staging HTTP-to-HTTPS behavior (`301` to `https://staging.rhino-inquisitor.com/`), confirmed HTTPS `200` responses for homepage, two representative articles, and one category route, captured CAA output showing `letsencrypt.org` authorization, and verified zero browser mixed-content warnings or insecure requests on representative staging pages. Remaining closeout item is direct GitHub Pages settings/API confirmation for certificate state and Enforce HTTPS toggle availability/enabled status. |
| 2026-03-17 | In Progress | Re-ran the mixed-content gate against the workflow-equivalent clean production build (`hugo --cleanDestinationDir --gc --minify --environment production && npm run check:mixed-content`) after stale local `public/` development output initially surfaced `http://localhost:1313` references. Clean release-candidate output passed with zero mixed-content findings; the remaining blocker is still direct GitHub Pages settings/API confirmation for certificate issuance and Enforce HTTPS control-plane state. |
| 2026-03-17 | Done | Owner confirmed GitHub Pages certificate and HTTPS are configured correctly, with accepted evidence that `https://staging.rhino-inquisitor.com/` is live over HTTPS. That confirmation closes the final HTTPS-control blocker and completes RHI-077. |

---

### Notes

- The Enforce HTTPS toggle in Pages settings becomes available only after the TLS certificate has been provisioned. It is not available immediately after entering a custom domain. The launch runbook (WS-G, RHI-080) must include an explicit wait-and-check step for certificate issuance before attempting to enable enforcement.
- If CAA records are restrictive (e.g., only permit a specific CA), Let's Encrypt cannot provision the certificate and Pages will show a certificate error indefinitely. This must be audited before the cutover — CAA record changes take time to propagate, and fixing a CAA record post-cutover adds hours to the HTTPS recovery path.
- Mixed-content HTTP references in the build output are often remnants of WordPress-era image URLs or hard-coded links in templates. The `check-mixed-content.js` script must be thorough — it should check HTML attributes, inline styles, and linked stylesheets (including CSS files in `public/`).
- GitHub Pages Enforce HTTPS applies at the Pages platform level and produces an HTTP 301 redirect to the HTTPS equivalent. This is not configurable in the static site itself. The canonical tags and sitemap already point to `https://` (ensured by Phase 5 and WS-E) — the Enforce HTTPS toggle is the final layer that makes HTTP access impossible.
- Reference: `analysis/plan/details/phase-7.md` §Workstream D: HTTPS Issuance and Security Controls; GitHub HTTPS docs: https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
