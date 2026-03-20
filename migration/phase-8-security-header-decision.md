# Phase 8 Security Header Decision

**Date:** 2026-03-20  
**Ticket:** RHI-090  
**Status:** Done

## Change Summary

RHI-090 adds a Phase 8 HTTPS and security gate, records the observed live production header posture for `https://www.rhino-inquisitor.com`, and documents how missing origin headers are handled for the current GitHub Pages deployment model.

## Why This Changed

Before this change, Phase 8 had only a placeholder `validation/https-security-report.json` file and no dedicated WS-G gate. HTTPS reachability, mixed-content regressions, sitemap/canonical HTTPS conformance, and the live security-header posture were not captured in one machine-readable artifact, and the repository had no written decision for how to handle GitHub Pages origin-header limitations.

## Behavior Details

### Previous Behavior

- No `scripts/phase-8/check-https-security.js` command existed.
- `validation/https-security-report.json` remained a bootstrap placeholder.
- The local blocking gate runner and deploy workflow did not execute or archive a dedicated Phase 8 HTTPS/security report.
- The repository had no Phase 8 decision artifact explaining whether missing origin headers on GitHub Pages were a launch blocker or an accepted static-hosting risk.

### New Behavior

- `npm run check:https-security` now validates the built production artifact for mixed-content regressions, HTTPS-only canonical URLs, HTTPS-only sitemap URLs, and HTTPS-only structured-data `@id`/`url`/`mainEntityOfPage` values.
- The gate reuses the same mixed-content scanner as `npm run check:mixed-content`, so Phase 7 and Phase 8 cannot drift into conflicting verdicts.
- The gate also records live-host evidence for HTTPS `200`, `http://www` redirect behavior, TLS certificate validity, CAA state, wildcard-DNS checks, and observed response headers.
- The local gate runner now executes the WS-G gate as part of the blocking production validation sequence, and the deploy workflow archives `validation/https-security-report.json` with 30-day retention.

## Observed Production Header Posture

Observed on 2026-03-20 from the live production host:

- `Strict-Transport-Security`: present (`max-age=31536000; includeSubDomains; preload`)
- `X-Content-Type-Options`: present (`nosniff`)
- `Content-Security-Policy`: not present
- `Referrer-Policy`: not present
- `X-Frame-Options`: not present

Additional live observations captured in `validation/https-security-report.json`:

- `https://www.rhino-inquisitor.com/` returned `200`
- `http://www.rhino-inquisitor.com/` redirected to `https://www.rhino-inquisitor.com/`
- The live TLS certificate for `www.rhino-inquisitor.com` is trusted and currently valid
- CAA records for `rhino-inquisitor.com` include `letsencrypt.org`
- No wildcard-style DNS answers were returned for a randomized subdomain probe
- `http://rhino-inquisitor.com/` currently redirects to `https://rhino-inquisitor.com/`, not directly to `https://www.rhino-inquisitor.com/`

## Decision

1. Missing `Content-Security-Policy`, `Referrer-Policy`, and `X-Frame-Options` on the current origin response do not block launch for this static blog deployment.
2. If strict origin-header enforcement becomes mandatory, it must be implemented through an edge/CDN layer or by moving off the current GitHub Pages origin model.
3. The current apex-host behavior (`http://rhino-inquisitor.com/` -> `https://rhino-inquisitor.com/`) is a documented host-consolidation warning, not a repository-level WS-G blocker. If one-hop apex-to-www consolidation is required, it must be enforced at the DNS/provider or edge layer.
4. The repository Pages settings state for `Enforce HTTPS` and verified-domain status is now owner-confirmed and carried into the WS-G report through `validation/https-security-manual-evidence.json`.
5. The owner accepted the live HTTPS apex host (`https://rhino-inquisitor.com/`) serving `200` instead of redirecting to `https://www.rhino-inquisitor.com/` as a documented launch warning for RHI-090 closeout.

## Official-Source Basis

The current decision uses the following official documentation inputs:

- GitHub Pages HTTPS and Enforce HTTPS behavior: `https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https`
- GitHub Pages custom-domain management and DNS guidance: `https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site`
- GitHub Pages verified-domain protection and anti-takeover guidance: `https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages`
- GitHub Pages custom-domain behavior and wildcard-risk guidance: `https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages`
- GitHub Pages troubleshooting for CAA and certificate issuance: `https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages`

GitHub.com Pages documentation reviewed for this ticket does not document a repository-level mechanism to configure origin response headers such as CSP, Referrer-Policy, or X-Frame-Options. The only official response-header configuration documentation identified applies to GitHub Enterprise Server, not this GitHub.com Pages deployment.

## Impact

- WS-G now produces a committed report instead of a placeholder artifact.
- CI and local validation can block on deterministic artifact regressions without pretending to automate every Pages control-plane check.
- The remaining follow-up work is post-ticket: if one-hop apex-to-www host consolidation becomes mandatory, remediate it at the provider or edge layer in a separate follow-up task.

## Verification

Verification completed for this decision and implementation:

1. Built the site with `npm run build:prod`.
2. Ran `npm run check:https-security` and confirmed the report recorded `artifactStatus: "pass"` with zero mixed-content, canonical, sitemap, or structured-data HTTPS failures.
3. Confirmed the live report captured `https://www.rhino-inquisitor.com/` as `200`, `http://www.rhino-inquisitor.com/` as a redirect to HTTPS `www`, a valid TLS certificate, CAA allowance for `letsencrypt.org`, and no wildcard-style DNS answers.
4. Recorded the owner-confirmed Pages settings state in `validation/https-security-manual-evidence.json` and reran `npm run check:https-security`, which now reports Pages settings and verified-domain status as `pass`.
5. Recorded the owner decision to accept the HTTPS apex host returning `200` as a documented non-blocking launch warning for RHI-090 closeout.

## Related Files

- `scripts/phase-7/mixed-content-helpers.js`
- `scripts/phase-7/check-mixed-content.js`
- `scripts/phase-8/check-https-security.js`
- `scripts/phase-7/run-all-gates.sh`
- `.github/workflows/deploy-pages.yml`
- `package.json`
- `validation/https-security-report.json`
- `validation/https-security-manual-evidence.json`
- `validation/README.md`
- `analysis/documentation/phase-8/rhi-090-security-https-readiness-gates-2026-03-20.md`
- `analysis/tickets/phase-8/RHI-090-security-https-readiness-gates.md`