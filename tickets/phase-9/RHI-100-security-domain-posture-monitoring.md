## RHI-100 · Workstream G — Security and Domain Posture Monitoring

**Status:** Open  
**Priority:** High  
**Estimate:** S  
**Phase:** 9  
**Workstream:** WS-G  
**Assigned to:** Engineering Owner  
**Target date:** 2026-07-29  
**Created:** 2026-03-08  
**Updated:** 2026-03-08

---

### Goal

Keep the domain and transport security posture stable throughout the cutover and post-launch stabilization window. HTTPS enforcement, TLS certificate validity, domain verification continuity, and absence of critical mixed content are non-negotiable during stabilization. Any regression in security posture is a Sev-1 incident.

---

### Acceptance Criteria

**Launch day:**
- [ ] HTTPS enforced on `https://www.rhino-inquisitor.com`; TLS certificate is valid with no critical errors
- [ ] `http://` requests redirect to `https://` (single hop, not a loop)
- [ ] No critical mixed content on homepage or article template (no HTTP resources loaded on an HTTPS page)
- [ ] GitHub Pages domain verification is active (TXT record present; verified badge in Pages settings)
- [ ] No wildcard DNS records that could create domain takeover risk
- [ ] Initial findings recorded in `monitoring/security-domain-report.json`

**Daily (week 1):**
- [ ] HTTPS and TLS validity confirmed daily
- [ ] Domain verification record confirmed present (spot-check)
- [ ] No critical mixed content introduced by new content embeds
- [ ] Daily check results recorded in `monitoring/security-domain-report.json`

**Weekly (weeks 2–6):**
- [ ] HTTPS and domain verification status confirmed weekly
- [ ] TLS certificate expiry date monitored; alert if < 30 days remaining
- [ ] Mixed-content check run on homepage and a sample of article pages
- [ ] Security headers posture reviewed: document what is and is not enforceable at GitHub Pages origin; if edge-layer headers are required, record implementation status
- [ ] Weekly findings appended to `monitoring/security-domain-report.json`

**Escalation triggers:**
- [ ] Sev-1: HTTPS enforcement fails or certificate becomes invalid
- [ ] Sev-1: Domain verification fails or TXT record removed
- [ ] Sev-2: Critical mixed content introduced by content edit on any primary template
- [ ] Sev-2: DNS change detected not in the approved change record

**Stabilization exit:**
- [ ] HTTPS enforced and TLS certificate valid with > 60 days remaining
- [ ] Domain verification active and unchanged
- [ ] No critical mixed content on any primary template
- [ ] Security header posture documented with edge-layer plan if origin limitations apply

---

### Tasks

**Launch-day security checks:**
- [ ] Verify TLS certificate in browser and via `curl -I https://www.rhino-inquisitor.com`
- [ ] Confirm Enforce HTTPS status in GitHub Pages repository settings; if unavailable after DNS propagation, follow incident decision flow at the 60-minute checkpoint
- [ ] Verify domain verification TXT record is present: `dig TXT _github-pages-challenge-taurgis.rhino-inquisitor.com`
- [ ] Run mixed-content check on homepage and article template using browser DevTools Security tab
- [ ] Check DNS for wildcard records via DNS provider zone review; additionally verify random-subdomain queries return no catch-all answer on both `@1.1.1.1` and `@8.8.8.8`
- [ ] Record all launch-day security outcomes in `monitoring/security-domain-report.json`

**Daily week-1 security checks:**
- [ ] Check HTTPS accessibility: `curl -I https://www.rhino-inquisitor.com`; confirm 200 and valid cert
- [ ] Spot-check domain verification TXT record (can be automated)
- [ ] Review browser console on homepage and a recent article for mixed-content warnings
- [ ] Record pass/fail per check in `monitoring/security-domain-report.json`

**Weekly security review (weeks 2–6):**
- [ ] Run HTTPS and domain verification checks
- [ ] Check TLS certificate expiry; record days remaining
- [ ] Run mixed-content check on homepage and article sample
- [ ] Review security-headers posture:
  - [ ] Document headers available at GitHub Pages origin (e.g., basic HTTPS, HSTS may be present)
  - [ ] Document headers not achievable at origin (e.g., `Content-Security-Policy`, `Permissions-Policy`)
  - [ ] If edge-layer is in scope, check implementation progress
- [ ] Append weekly findings to `monitoring/security-domain-report.json`

**Hardening governance:**
- [ ] Document final security-header enforcement capabilities and limitations in `monitoring/security-domain-report.json`
- [ ] If an edge-layer is not in scope for Phase 9, record the decision and accept the limitation with owner sign-off
- [ ] Monitor for Repeated HTTP `429` responses (possible platform rate limiting from monitoring scripts); back off monitor frequency if detected

---

### Out of Scope

- Implementing full CSP or Permissions-Policy headers at origin (GitHub Pages cannot serve arbitrary response headers; this requires an edge/CDN layer and is out of Phase 9 scope unless escalated)
- Penetration testing or vulnerability scanning
- Security review of application code (no application code is deployed)
- DNSSEC implementation (separate DNS governance task if desired)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-093 Done — Phase 9 Bootstrap complete | Ticket | Pending |
| RHI-094 Done — Cutover executed; HTTPS confirmed at T+0 | Ticket | Pending |
| Phase 8 HTTPS gate passing (`validation/https-security-report.json`) | Phase | Pending |
| Phase 8 security header decision doc (`migration/phase-8-security-header-decision.md`) | Phase | Pending |
| GitHub Pages Enforce HTTPS enabled on repository | Infra | Pending |
| Domain verification TXT record present in DNS | Infra | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| TLS certificate expires unexpectedly (GitHub Pages auto-renewal failure) | Low | Critical | Monitor certificate expiry weekly; if < 30 days, raise alert; GitHub Pages typically auto-renews via Let's Encrypt | Engineering Owner |
| Domain verification TXT record removed during DNS cleanup | Low | High | Include TXT record verification in DNS change review; document that this record must not be removed | DNS Operator |
| Mixed content introduced by a new embedded video or social post in article content | Medium | Medium | Include mixed-content check in content review process during stabilization; automate where possible | Engineering Owner |
| Monitoring script frequency causes `429` responses from GitHub Pages CDN | Low | Medium | Rate-limit synthetic checks; ensure check frequency does not exceed 1 request per 30 seconds per URL | Engineering Owner |
| Wildcard DNS record created by mistake during DNS configuration | Low | High | DNS changes require provider-zone review plus random-subdomain resolution checks on `@1.1.1.1` and `@8.8.8.8` | DNS Operator |
| HTTPS is not enforced immediately after domain change (issuance delay) | Low | High | Pre-confirm TLS cert status at T-24h; if cert not ready, delay T-0 | DNS Operator |

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

- `monitoring/security-domain-report.json` — daily week-1 and weekly week-2–6 HTTPS, TLS, mixed-content, and domain verification log
- Security header posture document with origin limitations and edge-layer plan (or explicit not-needed decision)

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | Open | Ticket created |

---

### Notes

- GitHub Pages auto-manages TLS via Let's Encrypt. Keep custom-domain and DNS records correctly configured and track Enforce HTTPS status during cutover because issuance/availability can lag after DNS changes.
- Mixed content on GitHub Pages is most commonly introduced by content embeds (YouTube iframes, Twitter embeds, or image references from HTTP URLs in Markdown). Content editors must understand that all embedded resources must reference HTTPS URLs.
- GitHub Pages cannot serve arbitrary security headers (no `Content-Security-Policy`, `X-Frame-Options`, etc.) at the origin level. This is a known constraint documented in Phase 8. If CSP is required, an edge/CDN layer is mandatory.
- Reference: `analysis/plan/details/phase-9.md` §Workstream G: Security and Domain Posture Monitoring
