# RHI-090 Security and HTTPS Readiness Gates

## Change Summary

RHI-090 adds the Phase 8 WS-G HTTPS/security gate, replaces the placeholder HTTPS report with a real machine-readable artifact, wires WS-G into the blocking local gate runner and deploy workflow artifact uploads, and documents the current security-header posture for the live production host.

## Why This Changed

Before this change, Phase 8 had no dedicated HTTPS/security gate even though the ticket required proof that the release-candidate artifact contained no mixed-content regressions and that the production host posture was reviewed before launch. That left WS-G dependent on scattered Phase 7 checks and ad hoc terminal inspection instead of one repeatable report that distinguishes deterministic build evidence from live/control-plane confirmation.

## Behavior Details

### Previous Behavior

- `validation/https-security-report.json` was still a bootstrap placeholder from RHI-083.
- The repo had no `scripts/phase-8/check-https-security.js` command.
- `scripts/phase-7/run-all-gates.sh` did not run a dedicated WS-G HTTPS/security gate.
- `.github/workflows/deploy-pages.yml` did not upload a Phase 8 HTTPS/security report artifact.
- The repository had no written Phase 8 decision artifact for GitHub Pages origin-header limitations.

### New Behavior

- `scripts/phase-8/check-https-security.js` now validates the built `public/` artifact for mixed-content regressions, HTTPS-only canonical URLs, HTTPS-only sitemap URLs, and HTTPS-only structured-data URL fields.
- The new WS-G gate reuses the same shared mixed-content scanner as `scripts/phase-7/check-mixed-content.js`, so Phase 7 and Phase 8 cannot disagree about mixed-content findings.
- The generated `validation/https-security-report.json` separates `artifactChecks` from `liveChecks`, recording deterministic build evidence alongside live-host observations for HTTPS reachability, redirects, TLS, CAA, wildcard DNS, custom-domain verification evidence, and observed response headers.
- `validation/https-security-manual-evidence.json` now provides a repeatable way to carry owner-confirmed GitHub Pages settings evidence into the generated WS-G report.
- `scripts/phase-7/run-all-gates.sh` now executes `npm run check:https-security` as a blocking WS-G step in the production validation sequence.
- `.github/workflows/deploy-pages.yml` now archives `validation/https-security-report.json` as a dedicated 30-day Phase 8 HTTPS/security artifact bundle.
- `migration/phase-8-security-header-decision.md` now records the launch decision for missing origin headers, the owner-confirmed Pages settings state, and the owner-accepted apex-host warning.

## Impact

- Maintainers can run `npm run check:https-security` locally after `npm run build:prod` and get the same report shape CI archives.
- Phase 8 now has explicit machine-readable evidence that the built artifact contains zero mixed-content, canonical, sitemap, and structured-data HTTP regressions.
- Live production checks are no longer conflated with deterministic repo checks; the report now records the owner-confirmed Pages settings state directly.
- Current live evidence shows the production host is healthy on core HTTPS checks, and the remaining visible WS-G risks are warning-only and documented as accepted launch warnings for this ticket:
  - apex HTTP currently consolidates to HTTPS apex rather than HTTPS `www`;
  - `https://rhino-inquisitor.com/` currently returns `200` instead of redirecting to HTTPS `www`;
  - the origin still omits CSP, Referrer-Policy, and X-Frame-Options.

## Verification

Verification completed for this change:

1. Built the site with `npm run build:prod`.
2. Ran `npm run check:https-security` and confirmed `validation/https-security-report.json` recorded `artifactStatus: "pass"` with zero mixed-content, canonical, sitemap, or structured-data HTTPS failures.
3. Confirmed the report captured live production evidence for `https://www.rhino-inquisitor.com/` returning `200`, `http://www.rhino-inquisitor.com/` redirecting to HTTPS `www`, a trusted TLS certificate, CAA compatibility for `letsencrypt.org`, and no wildcard-style DNS answers.
4. Added `validation/https-security-manual-evidence.json` to capture the owner-confirmed Pages settings state and reran `npm run check:https-security`.
5. Confirmed the regenerated report now records Pages settings and verified-domain status as `pass`, and captures both apex-host warnings (`http://` apex to HTTPS apex, plus HTTPS apex `200`) as non-blocking live findings accepted for this ticket closeout.
6. Retrieved official GitHub Pages documentation covering HTTPS enforcement, custom-domain verification, wildcard-DNS risk, and CAA behavior to support the decision documented in `migration/phase-8-security-header-decision.md`.

## Related Files

- `scripts/phase-7/mixed-content-helpers.js`
- `scripts/phase-7/check-mixed-content.js`
- `scripts/phase-8/check-https-security.js`
- `scripts/phase-7/run-all-gates.sh`
- `.github/workflows/deploy-pages.yml`
- `package.json`
- `validation/README.md`
- `validation/https-security-report.json`
- `validation/https-security-manual-evidence.json`
- `migration/phase-8-security-header-decision.md`
- `analysis/tickets/phase-8/RHI-090-security-https-readiness-gates.md`