## RHI-028 · Workstream I — Security, Privacy, and Operational Hardening

**Status:** Done  
**Priority:** Medium  
**Estimate:** M  
**Phase:** 3  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-03  
**Created:** 2026-03-07  
**Updated:** 2026-03-09

---

### Goal

Document and implement the security and privacy baseline appropriate for a GitHub Pages static site. Because GitHub Pages does not provide origin-server response header control, this ticket must clearly separate what can be achieved in the scaffold alone (HTTPS, mixed-content safety, `noindex` staging controls) from what requires an edge/CDN layer (CSP, HSTS tuning, advanced security headers). The goal is a security control matrix that is complete and honest — no controls should be implied as in place if they are not yet implemented.

Additionally, ensure that no migration artifacts, draft content, or internal URLs are accidentally exposed in production build output.

---

### Acceptance Criteria

- [x] Security control matrix exists in `docs/migration/SECURITY-CONTROLS.md` documenting for each control:
  - [x] What the control is
  - [x] Current implementation status: `implemented`, `edge-required`, or `deferred`
  - [x] The implementation layer: `github-pages`, `edge-cdn`, `dns`, or `none`
  - [x] Owner responsible for the control
- [x] Security matrix includes at minimum:
  - [x] HTTPS enforcement — `implemented` (GitHub Pages enforces HTTPS for custom domains)
  - [x] HSTS — `edge-required` (GitHub Pages does not emit HSTS headers; requires edge/CDN)
  - [x] Content Security Policy (CSP) — `edge-required` (static Pages cannot set CSP headers)
  - [x] `X-Frame-Options` / `frame-ancestors` — `edge-required`
  - [x] `X-Content-Type-Options: nosniff` — `edge-required`
  - [x] Mixed-content safety — `implemented` (all template URLs use HTTPS; verified in build)
  - [x] Staging `noindex` — `implemented` (via meta tag in staging config; see RHI-024)
  - [x] Draft content exclusion from production build — `implemented` (via Hugo environment flag)
  - [x] Migration artifacts not exposed in production build — `implemented` (verified in this ticket)
- [x] HTTPS and mixed-content cleanliness is verified in generated HTML:
  - [x] No `http://` URLs in template-generated `href`, `src`, or `action` attributes in `public/`
  - [x] All hardcoded URLs in templates and partials use HTTPS
- [x] Migration artifact exposure check:
  - [x] `public/` does not contain any file from `migration/` (scripts, JSON manifests, reports)
  - [x] `public/` does not contain draft content pages
  - [x] `public/` does not contain any `.md` source files
- [x] Privacy and analytics policy is documented:
  - Deferred path chosen in Phase 3: no analytics runtime is included in the scaffold, so the consent-mechanism branch is not applicable in this ticket
  - [x] If analytics is not yet included: deferred decision is documented with a placeholder in `SECURITY-CONTROLS.md`
- [x] No third-party scripts are added to the scaffold without explicit documentation in `SECURITY-CONTROLS.md`
- [x] `docs/migration/SECURITY-CONTROLS.md` is committed and reviewed by migration owner before RHI-029 begins

---

### Tasks

- [x] Review scaffold templates from RHI-023 for any HTTP (non-HTTPS) URLs in template code:
  - [x] Grep for `http://` in `src/layouts/` and `src/static/` directories
  - [x] Fix any found references to use HTTPS
- [x] Build scaffold with `--environment production` and inspect `public/` HTML for mixed content:
  - [x] Check `href`, `src`, and `action` attribute values in generated pages
  - [x] Confirm all template-generated URLs are HTTPS
- [x] Verify migration artifact isolation:
  - [x] Confirm `migration/` directory is not included in Hugo build output (`public/`)
  - [x] Confirm `scripts/` directory is not included in build output
  - [x] Confirm `package.json` and `.md` source files are not in `public/`
- [x] Verify draft content isolation:
  - [x] Create a test content file with `draft: true`
  - [x] Build with `--environment production` and confirm the file is absent from `public/`
  - [x] Remove test file after verification
- [x] Create `docs/migration/SECURITY-CONTROLS.md` with the security control matrix:
  - [x] List all controls from the acceptance criteria with current status and owner
  - [x] Note which controls require edge/CDN layer and link to Phase 2 edge decision (RHI-013/RHI-016)
  - [x] Note which controls are deferred to a post-launch phase
- [x] Document analytics policy:
  - Deferred path chosen in Phase 3: analytics implementation remains out of scope until the later monitoring workstream
  - [x] If deferred: mark as `deferred` in security matrix with a target phase for decision
- [x] Review scaffold for any third-party script tags; document each in `SECURITY-CONTROLS.md` with justification
- [x] Commit `docs/migration/SECURITY-CONTROLS.md` and any template HTTPS fixes

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
| RHI-019 Done — Phase 3 Bootstrap complete | Ticket | Resolved |
| RHI-021 Done — Hugo config locked (ensures `baseURL` is HTTPS) | Ticket | Resolved |
| RHI-023 Done — Template scaffold committed (needed for mixed-content inspection) | Ticket | Resolved |
| RHI-024 Done — Staging `noindex` controls verified | Ticket | Resolved |
| RHI-013 Outcomes — Edge redirect and CDN timing decision available | Ticket | Resolved |
| RHI-016 Outcomes — Deployment and operations contract confirmed | Ticket | Resolved |

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

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Completed. Workstream I now establishes the Phase 3 security and privacy baseline for the GitHub Pages scaffold through a repo-owned security gate, an explicit security control matrix, and operator-facing documentation that separates scaffold-deliverable controls from edge-required controls.

**Delivered artefacts:**

- `docs/migration/SECURITY-CONTROLS.md` — security control matrix covering implemented, edge-required, and deferred controls
- `scripts/check-security.js` — repo-owned production-output security verification script
- `package.json` — `npm run check:security` command surface
- `docs/migration/RUNBOOK.md` — operational guidance for the Phase 3 security verification flow
- `README.md` — top-level documentation for the new security/privacy validation command
- `analysis/documentation/phase-3/rhi-028-security-privacy-hardening-2026-03-09.md` — Phase 3 implementation note and verification summary

**Deviations from plan:**

- Added a reusable repo-owned `check:security` script instead of leaving the ticket as one-off manual verification. This keeps RHI-029 CI work aligned with the existing Phase 3 pattern used by SEO, performance, and accessibility gates.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-09 | In Progress | Reconciled RHI-028 with PM, BA, Senior QA, Hugo Specialist, and official-source guidance; confirmed the current Phase 3 scaffold ships no external runtime scripts and keeps analytics deferred to Phase 5. |
| 2026-03-09 | In Progress | Added `docs/migration/SECURITY-CONTROLS.md`, the repo-owned `npm run check:security` gate, and the matching Phase 3 documentation and runbook updates. |
| 2026-03-09 | In Progress | Verified a clean production build, confirmed no `http://` `href`/`src`/`action` values in rendered HTML, confirmed no blocked repo artifacts in `public/`, and validated draft exclusion with a temporary `draft: true` fixture that stayed out of both `public/` and `public/sitemap.xml`. |
| 2026-03-09 | Done | Migration-owner review approved the control matrix; `npm run check:security` passed on the final working tree and the ticket was closed for engineering. |

---

### Notes

- GitHub Pages does not provide response header control for security headers (CSP, HSTS, `X-Frame-Options`). These require an edge layer (CDN). Do not treat them as implemented unless an edge layer is confirmed operational. Be accurate in the security matrix.
- The most important security check for a static migration site is preventing accidental exposure of migration data (manifests, scripts, draft content). This is achievable within GitHub Pages constraints.
- No owner clarification was required during implementation. The scaffold currently ships no analytics runtime, and the ticket explicitly allows documenting analytics as deferred until a later phase.
- Reference: `analysis/plan/details/phase-3.md` §Workstream I: Security, Privacy, and Operational Hardening
