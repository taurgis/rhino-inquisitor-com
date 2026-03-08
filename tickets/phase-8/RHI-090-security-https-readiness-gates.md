## RHI-090 · Workstream G — Security and HTTPS Readiness Gates

**Status:** Open  
**Priority:** High  
**Estimate:** S  
**Phase:** 8  
**Assigned to:** Engineering Owner  
**Target date:** 2026-06-10  
**Created:** 2026-03-08  
**Updated:** 2026-03-08

---

### Goal

Confirm that the production site posture is secure at launch: HTTPS is enforced on the canonical host, there are no critical mixed-content resources, custom domain verification is active (reducing domain takeover risk), and the security header posture is documented. GitHub Pages constrains which headers can be set at the origin host; this gate ensures that any gap is documented with a clear decision and — if required — an escalation path to an edge/CDN layer before launch.

---

### Acceptance Criteria

- [ ] HTTPS enforcement:
  - [ ] TLS certificate is valid and not expired for `www.rhino-inquisitor.com`
  - [ ] "Enforce HTTPS" is enabled in the GitHub Pages repository settings
  - [ ] `http://www.rhino-inquisitor.com/` redirects to `https://www.rhino-inquisitor.com/` (GitHub Pages enforces this when the setting is on)
  - [ ] `https://www.rhino-inquisitor.com/` returns HTTP 200
- [ ] No critical mixed-content resources:
  - [ ] `npm run check:mixed-content` (from Phase 7) exits 0 on the RC build
  - [ ] No HTTP-scheme `<img>`, `<script>`, `<link>`, or `<iframe>` src/href references in any page in the sample matrix
  - [ ] Result confirmed in `validation/https-security-report.json`
- [ ] Custom domain verification and anti-takeover controls:
  - [ ] GitHub Pages custom domain TXT verification record is active (verified in repository Pages settings)
  - [ ] Wildcard DNS records are not used (wildcard records expand domain takeover attack surface)
  - [ ] Domain configuration matches the canonical `www.rhino-inquisitor.com` host only
- [ ] CAA record check:
  - [ ] If CAA DNS records exist for `rhino-inquisitor.com`, they explicitly allow `letsencrypt.org` (GitHub Pages uses Let's Encrypt)
  - [ ] CAA check result is documented in the security report
- [ ] Canonical and sitemap HTTPS conformance (aligned with WS-C RHI-086):
  - [ ] All canonical tag URLs are HTTPS
  - [ ] All sitemap `<loc>` entries are HTTPS
  - [ ] No HTTP entry points in structured data `@id` or `url` values
- [ ] HTTP entry-point consolidation:
  - [ ] `http://www.rhino-inquisitor.com/` redirects to HTTPS (verified above)
  - [ ] `http://rhino-inquisitor.com/` (apex HTTP) redirects to `https://www.rhino-inquisitor.com/` — confirm behavior and document if it cannot be enforced at origin
- [ ] Security header posture is documented:
  - [ ] Document current GitHub Pages header behavior for: `Strict-Transport-Security`, `Content-Security-Policy`, `Referrer-Policy`, `X-Content-Type-Options`
  - [ ] If required headers cannot be set at origin, document the gap and the decision: accept as a risk, or use an edge/CDN layer
  - [ ] Decision is committed to `migration/phase-8-security-header-decision.md`
- [ ] Gate output is machine-readable, archived as CI artifact, and committed:
  - [ ] `validation/https-security-report.json` — HTTPS cert status, mixed content findings, CAA result, header posture summary, custom domain verification status

---

### Tasks

- [ ] Create `scripts/phase-8/check-https-security.js`:
  - [ ] Verify the `public/` build contains no HTTP resource references (extend or re-use Phase 7 mixed-content check)
  - [ ] Check all canonical and sitemap URL values for HTTPS scheme
  - [ ] Check all JSON-LD `@id`, `url`, `mainEntityOfPage` values for HTTPS scheme
  - [ ] Output `validation/https-security-report.json` with: cert status, mixed-content count, HTTP references list, CAA annotation, header posture summary
  - [ ] Exit with non-zero code on: any mixed-content on homepage or article template; any HTTP canonical or sitemap URL
- [ ] Run certificate and enforcement checks:
  - [ ] `curl -s -o /dev/null -w "%{http_code}" https://www.rhino-inquisitor.com/` — confirm HTTP 200
  - [ ] `curl -s -o /dev/null -w "%{redirect_url}" http://www.rhino-inquisitor.com/` — confirm redirect to HTTPS
  - [ ] `openssl s_client -connect www.rhino-inquisitor.com:443 -servername www.rhino-inquisitor.com` — verify cert validity and expiry
  - [ ] Record in `validation/https-security-report.json`
- [ ] Check CAA records:
  - [ ] `dig CAA rhino-inquisitor.com` — record result
  - [ ] If CAA records exist, verify `letsencrypt.org` is allowed
  - [ ] Document result in security report
- [ ] Check custom domain verification:
  - [ ] Open GitHub Pages settings and confirm "Custom domain" shows as verified (green tick)
  - [ ] Document verification status and date in the security report
  - [ ] Confirm wildcard DNS is not used
- [ ] Document security header posture:
  - [ ] Make a `curl -I https://www.rhino-inquisitor.com/` request and inspect response headers
  - [ ] Document current header values for: `Strict-Transport-Security`, `Content-Security-Policy`, `Referrer-Policy`, `X-Content-Type-Options`, `X-Frame-Options`
  - [ ] For each missing header: document the risk, whether it is acceptable for a static blog on GitHub Pages, and any planned edge-layer mitigation
  - [ ] Commit decision to `migration/phase-8-security-header-decision.md`
- [ ] Run the HTTPS security gate against the RC build; archive the report as a CI artifact with 30-day retention
- [ ] Update `.github/workflows/deploy-pages.yml`:
  - [ ] Add HTTPS security gate as a blocking pre-deploy step
  - [ ] Upload security report as CI artifact
- [ ] Add `package.json` script:
  - [ ] `"check:https-security": "node scripts/phase-8/check-https-security.js"`

---

### Out of Scope

- Implementing a CDN or edge layer for security headers (decision is documented here, but implementation is a post-launch activity if not available at launch)
- Fixing HTTPS certificate issuance failures (these are GitHub Pages platform issues; if cert is not issuing, the blockers are the CNAME configuration and Pages settings, both covered in Phase 7)
- Changing the canonical host after this point (canonical host is locked; any change would require a full Phase 8 re-run)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-083 Done — Phase 8 Bootstrap complete | Ticket | Pending |
| RHI-084 Done — RC frozen, sample matrix committed | Ticket | Pending |
| Phase 7 RHI-077 Done — HTTPS enforcement confirmed and mixed-content gate operational | Phase | Pending |
| Phase 7 RHI-076 Done — Custom domain configured in Pages settings | Phase | Pending |
| Live site accessible at `https://www.rhino-inquisitor.com/` (Phase 7 deployment complete) | Phase | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| TLS certificate not yet issued or expired | Low | High | Phase 7 (RHI-077) should have confirmed cert issuance; if found expired at Phase 8, check Pages HTTPS settings and trigger re-issuance via toggling the Enforce HTTPS setting | Engineering Owner |
| Mixed-content found in a migrated post body (HTTP image references from WordPress media) | Medium | High | Phase 4 media migration (RHI-037) should have re-linked all images; any remaining HTTP references are blocking; fix at content level and re-cut RC | Engineering Owner |
| CAA records block Let's Encrypt issuance | Low | High | Fix by adding `letsencrypt.org` to CAA records; do not launch until Let's Encrypt is permitted | Engineering Owner |
| Security headers unavailable at GitHub Pages origin, increasing risk surface | High | Low | Document as known limitation of static hosting; for a static blog this is low risk; if CSP is needed, plan an edge layer post-launch | Engineering Owner |
| Wildcard DNS record discovered, expanding domain takeover attack surface | Low | Medium | Remove wildcard record or replace with explicit records; document in security report | Engineering Owner |

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

- `scripts/phase-8/check-https-security.js` — HTTPS and mixed-content gate script
- `validation/https-security-report.json` — HTTPS cert status, mixed content, CAA, header posture
- `migration/phase-8-security-header-decision.md` — documented header posture and gap decisions
- Updated `package.json` with `check:https-security` script
- Updated `.github/workflows/deploy-pages.yml` with HTTPS security gate as blocking step

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | Open | Ticket created |

---

### Notes

- GitHub Pages does not allow custom HTTP response header configuration at the origin. HSTS, CSP, and Referrer-Policy cannot be set through the repository or pages config. This is a known platform constraint. Document it; do not block launch on it for a static blog site.
- Mixed content is the most common security regression in a WordPress-to-Hugo migration because WordPress sites often contain hardcoded HTTP media URLs in post bodies. Phase 4 should have cleaned these, but re-check every post in the sample matrix.
- The custom domain verification TXT record should have been set in Phase 7. Confirm it is still active and retained to preserve domain verification and takeover protection.
- Reference: `analysis/plan/details/phase-8.md` §Workstream G: Security and HTTPS Readiness Gates; https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
