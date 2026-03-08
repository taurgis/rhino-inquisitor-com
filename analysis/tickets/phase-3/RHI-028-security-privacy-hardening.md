## RHI-028 · Workstream I — Security, Privacy, and Operational Hardening

**Status:** Open  
**Priority:** Medium  
**Estimate:** M  
**Phase:** 3  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-03  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Document and implement the security and privacy baseline appropriate for a GitHub Pages static site. Because GitHub Pages does not provide origin-server response header control, this ticket must clearly separate what can be achieved in the scaffold alone (HTTPS, mixed-content safety, `noindex` staging controls) from what requires an edge/CDN layer (CSP, HSTS tuning, advanced security headers). The goal is a security control matrix that is complete and honest — no controls should be implied as in place if they are not yet implemented.

Additionally, ensure that no migration artifacts, draft content, or internal URLs are accidentally exposed in production build output.

---

### Acceptance Criteria

- [ ] Security control matrix exists in `docs/migration/SECURITY-CONTROLS.md` documenting for each control:
  - [ ] What the control is
  - [ ] Current implementation status: `implemented`, `edge-required`, or `deferred`
  - [ ] The implementation layer: `github-pages`, `edge-cdn`, `dns`, or `none`
  - [ ] Owner responsible for the control
- [ ] Security matrix includes at minimum:
  - [ ] HTTPS enforcement — `implemented` (GitHub Pages enforces HTTPS for custom domains)
  - [ ] HSTS — `edge-required` (GitHub Pages does not emit HSTS headers; requires edge/CDN)
  - [ ] Content Security Policy (CSP) — `edge-required` (static Pages cannot set CSP headers)
  - [ ] `X-Frame-Options` / `frame-ancestors` — `edge-required`
  - [ ] `X-Content-Type-Options: nosniff` — `edge-required`
  - [ ] Mixed-content safety — `implemented` (all template URLs use HTTPS; verified in build)
  - [ ] Staging `noindex` — `implemented` (via meta tag in staging config; see RHI-024)
  - [ ] Draft content exclusion from production build — `implemented` (via Hugo environment flag)
  - [ ] Migration artifacts not exposed in production build — `implemented` (verified in this ticket)
- [ ] HTTPS and mixed-content cleanliness is verified in generated HTML:
  - [ ] No `http://` URLs in template-generated `href`, `src`, or `action` attributes in `public/`
  - [ ] All hardcoded URLs in templates and partials use HTTPS
- [ ] Migration artifact exposure check:
  - [ ] `public/` does not contain any file from `migration/` (scripts, JSON manifests, reports)
  - [ ] `public/` does not contain draft content pages
  - [ ] `public/` does not contain any `.md` source files
- [ ] Privacy and analytics policy is documented:
  - [ ] If analytics is included in the scaffold: consent mechanism is defined and privacy-safe (no PII in first request)
  - [ ] If analytics is not yet included: deferred decision is documented with a placeholder in `SECURITY-CONTROLS.md`
- [ ] No third-party scripts are added to the scaffold without explicit documentation in `SECURITY-CONTROLS.md`
- [ ] `docs/migration/SECURITY-CONTROLS.md` is committed and reviewed by migration owner before RHI-029 begins

---

### Tasks

- [ ] Review scaffold templates from RHI-023 for any HTTP (non-HTTPS) URLs in template code:
  - [ ] Grep for `http://` in `layouts/` and `static/` directories
  - [ ] Fix any found references to use HTTPS
- [ ] Build scaffold with `--environment production` and inspect `public/` HTML for mixed content:
  - [ ] Check `href`, `src`, and `action` attribute values in generated pages
  - [ ] Confirm all template-generated URLs are HTTPS
- [ ] Verify migration artifact isolation:
  - [ ] Confirm `migration/` directory is not included in Hugo build output (`public/`)
  - [ ] Confirm `scripts/` directory is not included in build output
  - [ ] Confirm `package.json` and `.md` source files are not in `public/`
- [ ] Verify draft content isolation:
  - [ ] Create a test content file with `draft: true`
  - [ ] Build with `--environment production` and confirm the file is absent from `public/`
  - [ ] Remove test file after verification
- [ ] Create `docs/migration/SECURITY-CONTROLS.md` with the security control matrix:
  - [ ] List all controls from the acceptance criteria with current status and owner
  - [ ] Note which controls require edge/CDN layer and link to Phase 2 edge decision (RHI-013/RHI-016)
  - [ ] Note which controls are deferred to a post-launch phase
- [ ] Document analytics policy:
  - [ ] If analytics is to be included: define the tool, consent model, and data minimization approach
  - [ ] If deferred: mark as `deferred` in security matrix with a target phase for decision
- [ ] Review scaffold for any third-party script tags; document each in `SECURITY-CONTROLS.md` with justification
- [ ] Commit `docs/migration/SECURITY-CONTROLS.md` and any template HTTPS fixes

---

### Out of Scope

- Implementing edge CDN or HSTS (requires infrastructure not available on GitHub Pages alone)
- Full penetration testing or security audit
- GDPR compliance legal review (requires legal owner, not engineering scope alone)
- Web Application Firewall (WAF) configuration

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-019 Done — Phase 3 Bootstrap complete | Ticket | Pending |
| RHI-021 Done — Hugo config locked (ensures `baseURL` is HTTPS) | Ticket | Pending |
| RHI-023 Done — Template scaffold committed (needed for mixed-content inspection) | Ticket | Pending |
| RHI-024 Done — Staging `noindex` controls verified | Ticket | Pending |
| RHI-013 Outcomes — Edge redirect and CDN timing decision available | Ticket | Pending |
| RHI-016 Outcomes — Deployment and operations contract confirmed | Ticket | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Security controls requiring edge/CDN documented as "implemented" by mistake | Low | High | Each control in `SECURITY-CONTROLS.md` must have an honest status — `edge-required` is a valid and expected status, not a failure | Engineering Owner |
| Analytics added post-Phase 3 without revisiting consent model | Medium | Medium | `SECURITY-CONTROLS.md` analytics entry explicitly marks the decision as pending; any addition must update this document | Migration Owner |
| Draft content accidentally included in production due to environment flag omission | Low | High | CI build step (RHI-029) must always use `--environment production`; add explicit assertion in smoke check | Engineering Owner |
| Migration JSON artifacts accessible at known paths in `public/` | Low | Medium | Run artifact isolation check in CI as part of RHI-029 deployment workflow | Engineering Owner |

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

- `docs/migration/SECURITY-CONTROLS.md` — security control matrix
- Any HTTPS fix commits to template or partial files

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- GitHub Pages does not provide response header control for security headers (CSP, HSTS, `X-Frame-Options`). These require an edge layer (CDN). Do not treat them as implemented unless an edge layer is confirmed operational. Be accurate in the security matrix.
- The most important security check for a static migration site is preventing accidental exposure of migration data (manifests, scripts, draft content). This is achievable within GitHub Pages constraints.
- Reference: `analysis/plan/details/phase-3.md` §Workstream I: Security, Privacy, and Operational Hardening
