## RHI-090 · Workstream G — Security and HTTPS Readiness Gates

**Status:** Done  
**Priority:** High  
**Estimate:** S  
**Phase:** 8  
**Assigned to:** Engineering Owner  
**Target date:** 2026-06-10  
**Created:** 2026-03-08  
**Updated:** 2026-03-20

---

### Goal

Confirm that the production site posture is secure at launch: HTTPS is enforced on the canonical host, there are no critical mixed-content resources, custom domain verification is active (reducing domain takeover risk), and the security header posture is documented. GitHub Pages constrains which headers can be set at the origin host; this gate ensures that any gap is documented with a clear decision and — if required — an escalation path to an edge/CDN layer before launch.

---

### Acceptance Criteria

- [x] HTTPS enforcement:
  - [x] TLS certificate is valid and not expired for `www.rhino-inquisitor.com`
  - [x] "Enforce HTTPS" is enabled in the GitHub Pages repository settings
  - [x] `http://www.rhino-inquisitor.com/` redirects to `https://www.rhino-inquisitor.com/` (GitHub Pages enforces this when the setting is on)
  - [x] `https://www.rhino-inquisitor.com/` returns HTTP 200
- [x] No critical mixed-content resources:
  - [x] `npm run check:mixed-content` (from Phase 7) exits 0 on the RC build
  - [x] No HTTP-scheme `<img>`, `<script>`, `<link>`, or `<iframe>` src/href references in any page in the sample matrix
  - [x] Result confirmed in `validation/https-security-report.json`
- [x] Custom domain verification and anti-takeover controls:
  - [x] GitHub Pages custom domain TXT verification record is active (verified in repository Pages settings)
  - [x] Wildcard DNS records are not used (wildcard records expand domain takeover attack surface)
  - [x] Domain configuration mismatch on apex host is documented and owner-accepted as a launch warning for this ticket
- [x] CAA record check:
  - [x] If CAA DNS records exist for `rhino-inquisitor.com`, they explicitly allow `letsencrypt.org` (GitHub Pages uses Let's Encrypt)
  - [x] CAA check result is documented in the security report
- [x] Canonical and sitemap HTTPS conformance (aligned with WS-C RHI-086):
  - [x] All canonical tag URLs are HTTPS
  - [x] All sitemap `<loc>` entries are HTTPS
  - [x] No HTTP entry points in structured data `@id` or `url` values
- [x] HTTP entry-point consolidation:
  - [x] `http://www.rhino-inquisitor.com/` redirects to HTTPS (verified above)
  - [x] `http://rhino-inquisitor.com/` (apex HTTP) behavior is confirmed and the non-canonical apex-host exposure is documented and owner-accepted where it cannot be enforced at origin
- [x] Security header posture is documented:
  - [x] Document current GitHub Pages header behavior for: `Strict-Transport-Security`, `Content-Security-Policy`, `Referrer-Policy`, `X-Content-Type-Options`
  - [x] If required headers cannot be set at origin, document the gap and the decision: accept as a risk, or use an edge/CDN layer
  - [x] Decision is committed to `migration/phase-8-security-header-decision.md`
- [x] Gate output is machine-readable, archived as CI artifact, and committed:
  - [x] `validation/https-security-report.json` — HTTPS cert status, mixed content findings, CAA result, header posture summary, custom domain verification status

---

### Tasks

- [x] Create `scripts/phase-8/check-https-security.js`:
  - [x] Verify the `public/` build contains no HTTP resource references (extend or re-use Phase 7 mixed-content check)
  - [x] Check all canonical and sitemap URL values for HTTPS scheme
  - [x] Check all JSON-LD `@id`, `url`, `mainEntityOfPage` values for HTTPS scheme
  - [x] Output `validation/https-security-report.json` with: cert status, mixed-content count, HTTP references list, CAA annotation, header posture summary
  - [x] Exit with non-zero code on: any mixed-content on homepage or article template; any HTTP canonical or sitemap URL
- [x] Run certificate and enforcement checks:
  - [x] `curl -s -o /dev/null -w "%{http_code}" https://www.rhino-inquisitor.com/` — confirm HTTP 200
  - [x] `curl -s -o /dev/null -w "%{redirect_url}" http://www.rhino-inquisitor.com/` — confirm redirect to HTTPS
  - [x] `openssl s_client -connect www.rhino-inquisitor.com:443 -servername www.rhino-inquisitor.com` — verify cert validity and expiry
  - [x] Record in `validation/https-security-report.json`
- [x] Check CAA records:
  - [x] `dig CAA rhino-inquisitor.com` — record result
  - [x] If CAA records exist, verify `letsencrypt.org` is allowed
  - [x] Document result in security report
- [x] Check custom domain verification:
  - [x] Open GitHub Pages settings and confirm "Custom domain" shows as verified (green tick)
  - [x] Document verification status and date in the security report
  - [x] Confirm wildcard DNS is not used
- [x] Document security header posture:
  - [x] Make a `curl -I https://www.rhino-inquisitor.com/` request and inspect response headers
  - [x] Document current header values for: `Strict-Transport-Security`, `Content-Security-Policy`, `Referrer-Policy`, `X-Content-Type-Options`, `X-Frame-Options`
  - [x] For each missing header: document the risk, whether it is acceptable for a static blog on GitHub Pages, and any planned edge-layer mitigation
  - [x] Commit decision to `migration/phase-8-security-header-decision.md`
- [x] Run the HTTPS security gate against the RC build; archive the report as a CI artifact with 30-day retention
- [x] Update `.github/workflows/deploy-pages.yml`:
  - [x] Add HTTPS security gate as a blocking pre-deploy step
  - [x] Upload security report as CI artifact
- [x] Add `package.json` script:
  - [x] `"check:https-security": "node scripts/phase-8/check-https-security.js"`

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

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

WS-G is complete.

**Delivered artefacts:**

- `scripts/phase-8/check-https-security.js` — HTTPS and mixed-content gate script
- `scripts/phase-7/mixed-content-helpers.js` — shared mixed-content scanner reused by WS-G and the existing Phase 7 gate
- `validation/https-security-report.json` — HTTPS cert status, mixed content, CAA, header posture
- `validation/https-security-manual-evidence.json` — owner-confirmed Pages settings evidence and accepted apex-host warning disposition
- `migration/phase-8-security-header-decision.md` — documented header posture and gap decisions
- Updated `package.json` with `check:https-security` script
- Updated `.github/workflows/deploy-pages.yml` with HTTPS security gate as blocking step

**Deviations from plan:**

- Live apex-host consolidation is not fully enforced: `http://rhino-inquisitor.com/` redirects to HTTPS apex and `https://rhino-inquisitor.com/` returns `200` instead of redirecting to `https://www.rhino-inquisitor.com/`. The owner accepted this as a documented launch warning for RHI-090 closeout.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | Open | Ticket created |
| 2026-03-20 | In Progress | Implemented the WS-G gate, report, workflow wiring, and security-header decision doc. Owner-confirmed Pages settings are now recorded through `validation/https-security-manual-evidence.json`; the remaining open item is whether the live apex-host behavior is an accepted launch warning or a blocker requiring provider or edge remediation. |
| 2026-03-20 | Done | Owner confirmed Pages settings were complete and accepted the remaining apex-host behavior as a documented launch warning. WS-G report, decision doc, workflow wiring, and ticket evidence are complete. |

---

### Notes

- GitHub Pages does not allow custom HTTP response header configuration at the origin. HSTS, CSP, and Referrer-Policy cannot be set through the repository or pages config. This is a known platform constraint. Document it; do not block launch on it for a static blog site.
- Mixed content is the most common security regression in a WordPress-to-Hugo migration because WordPress sites often contain hardcoded HTTP media URLs in post bodies. Phase 4 should have cleaned these, but re-check every post in the sample matrix.
- The custom domain verification TXT record should have been set in Phase 7. Confirm it is still active and retained to preserve domain verification and takeover protection.
- Reference: `analysis/plan/details/phase-8.md` §Workstream G: Security and HTTPS Readiness Gates; https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
