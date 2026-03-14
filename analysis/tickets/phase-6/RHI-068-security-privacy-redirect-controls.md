## RHI-068 · Workstream F — Security and Privacy Controls for Redirect Logic

**Status:** Done  
**Priority:** High  
**Estimate:** S  
**Phase:** 6  
**Assigned to:** Engineering Owner  
**Target date:** 2026-05-13  
**Created:** 2026-03-07  
**Updated:** 2026-03-14

---

### Goal

Ensure that the redirect implementation cannot be exploited as an open redirect vector, does not downgrade protocol security, does not expose secrets or tokens in test artifacts, and enforces same-site destination policy for all migration redirects. A security sign-off must be recorded before Phase 6 cutover readiness (WS-I) can proceed.

Redirects are an attractive target for open redirect attacks and phishing because a trusted domain name appears in the URL before the redirect fires. Even in a static Hugo-based implementation, the risk exists if destination URLs are ever sourced from user input or if alias pages can be manipulated to point to off-site destinations. This workstream eliminates that risk by design.

---

### Acceptance Criteria

- [x] Open redirect prevention confirmed by design:
  - [x] All redirect destination URLs come from the static `migration/url-map.csv` manifest — never from user-supplied URL parameters
  - [x] No alias destination in any content file's `aliases` front matter points to an off-site URL (cross-domain destination)
  - [x] Hugo `aliases` are relative paths only (e.g., `/old-slug/`) — absolute external URLs in aliases are prohibited
  - [x] Validation script `scripts/phase-6/check-redirect-security.js` confirms no off-site alias destinations exist in the built `public/` directory
- [x] Same-site destination policy enforced:
  - [x] Every redirect destination is within `https://www.rhino-inquisitor.com/`
  - [x] Any intentional cross-domain redirect is documented as an exception with SEO owner sign-off
- [x] HTTPS-only destinations enforced:
  - [x] No alias or redirect record in `migration/url-map.csv` has an HTTP target URL
  - [x] Template canonical tag and alias page meta-refresh always generate HTTPS destination URLs (derived from `baseURL`)
- [x] Secrets and tokens removed from test artifacts:
  - [x] No API key, credential, or auth token appears in any Phase 6 script or validation report
  - [x] No redirect test artifact committed to the repository contains real user data or personally identifiable information
  - [x] Test fixtures use synthetic URLs only (e.g., `https://www.rhino-inquisitor.com/test-path/`)
- [x] Security review sign-off recorded before Phase 6 cutover readiness (WS-I: RHI-071) proceeds:
  - [x] Security review checklist completed and committed to `migration/phase-6-url-policy.md` security section
  - [x] Engineering owner has reviewed and signed off
- [x] `scripts/phase-6/check-redirect-security.js` exits with code 0:
  - [x] Checks: no off-site alias destination in built HTML
  - [x] Checks: no HTTP (non-HTTPS) canonical or meta-refresh URL in any alias page
  - [x] Checks: `migration/url-map.csv` has zero HTTP target URLs

---

### Tasks

- [x] Audit all alias entries in Hugo content files:
  - [x] Grep for `aliases:` in all content file front matter
  - [x] Confirm all alias values are relative paths (e.g., `/old-slug/`) — reject any absolute URL
  - [x] Confirm no alias value starts with `http://` or points to an external domain
- [x] Audit `migration/url-map.csv` for HTTP target URLs:
  - [x] Check all `target_url` values — none should start with `http://`
  - [x] Fix any HTTP target URL to HTTPS equivalent
- [x] Audit Hugo alias page HTML output for protocol and destination safety:
  - [x] Build production site
  - [x] Parse each alias page in `public/` with `cheerio`
  - [x] Extract `meta http-equiv="refresh"` content URL — must be HTTPS and same-site
  - [x] Extract `<link rel="canonical">` href — must be HTTPS and same-site
- [x] Verify source-of-truth provenance:
  - [x] Confirm no script reads redirect destination from environment variables, query parameters, or user input
  - [x] Confirm all destination resolution comes from `migration/url-map.csv` or front matter read from source-controlled content files
- [x] Review all Phase 6 validation scripts for accidental secret inclusion:
  - [x] Check for any hardcoded credentials, tokens, or API keys
  - [x] Confirm no test fixture contains real user data
- [x] Write `scripts/phase-6/check-redirect-security.js`
- [x] Run security validation script against production build; fix all failures
- [x] Document security review findings in `migration/phase-6-url-policy.md` security section
- [x] Engineering owner completes security checklist and records sign-off in Progress Log
- [x] Commit security validation script and policy document updates

---

### Out of Scope

- General application security review beyond redirect logic (out of migration scope)
- HTTPS certificate management (GitHub Pages HTTPS enforcement from WS-D: RHI-066)
- Content sanitization in migrated posts (Phase 4: RHI-041)
- Penetration testing or vulnerability scanning of the hosted site

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-065 Done — Hugo alias implementation complete (alias pages are the primary security review surface) | Ticket | Done |
| RHI-062 Done — Architecture decision known (Model B edge rules also need security review if applicable) | Ticket | Done |
| Engineering owner available for security review and sign-off | Access | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Cross-site alias accidentally introduced in front matter through a copy-paste error during WS-C | Low | High | Security validation script catches this immediately; run script after every batch of alias additions, not just at end of WS-C | Engineering Owner |
| Model B edge redirect rules allow open redirect via wildcard patterns | Low | High | If Model B is active, review edge ruleset for wildcard patterns that could be exploited; prefer exact-path rules over pattern-based rules; document review outcome | Engineering Owner |
| Phase 6 test scripts accidentally include real site credentials (e.g., Search Console tokens) | Low | Medium | Code review for secrets before committing any new script; use environment variables for any credential-dependent step and exclude from committed code | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-068 is complete. The repository now has a dedicated redirect-security gate, a committed security policy section with recorded owner sign-off, and a machine-readable report proving the current alias and redirect surfaces remain same-site, non-user-controlled, and free of HTTP downgrade or credential-like artifact leakage.

**Delivered artefacts:**

- `scripts/phase-6/check-redirect-security.js` — redirect security validation script
- `migration/phase-6-url-policy.md` — updated with security controls section and sign-off record
- `migration/reports/phase-6-redirect-security.csv` — redirect security validation report
- `analysis/documentation/phase-6/rhi-068-redirect-security-controls-2026-03-14.md` — implementation and verification record
- Engineering owner security sign-off recorded in Progress Log

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-14 | In progress | `scripts/phase-6/check-redirect-security.js`, `migration/reports/phase-6-redirect-security.csv`, and the shared policy security section are now implemented. `npm run build:prod`, `npm run check:redirect-security`, `npm run phase6:validate-alias-pages`, and `npm run check:host-protocol` all passed. Explicit engineering-owner sign-off is still pending before the ticket can be marked done. |
| 2026-03-14 | Done | User-owner approved the engineering security sign-off after the RHI-068 validation evidence passed and the ticket artefacts were updated. |

---

### Notes

- Hugo `aliases` front matter accepts relative paths. If an absolute URL (e.g., `https://other-site.com/`) is ever placed in `aliases:`, Hugo will generate a redirect page pointing off-site. This is the primary open-redirect risk vector for a Hugo-based implementation. The security script must explicitly test for this pattern in the built HTML rather than relying on front matter validation alone — HTML output is the ground truth.
- OWASP Unvalidated Redirects and Forwards Cheat Sheet is the authoritative reference: https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html
- This workstream is short (estimate: S) but must not be skipped. The security sign-off from this workstream is a prerequisite for WS-I cutover readiness (RHI-071). Launching without a security review of redirect behavior exposes the site to a redirect abuse risk that could be exploited immediately after launch.
- If Model B (edge redirect layer) is chosen, the edge ruleset must also be audited. Edge redirect rules that use wildcard or parameter-based destination resolution are a higher-risk surface than static Hugo aliases.
- Reference: `analysis/plan/details/phase-6.md` §Workstream F, §Required Libraries and Tooling anti-patterns
