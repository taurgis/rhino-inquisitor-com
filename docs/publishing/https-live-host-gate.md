# HTTPS Live-Host Gate and Project-Host Rehearsal Mode

This document records how the HTTPS/security gate (`scripts/gates/check-https-security.js`) treats live-host checks before the production custom domain is active.

## Change summary

The gate performs two kinds of checks:

- **Artifact checks** (canonical URLs, sitemap URLs, structured-data URLs, mixed content) — always blocking.
- **Live-host checks** (HTTPS response, apex/www redirects, TLS, CAA, DNS, security headers, agent-discovery `Link` header) — target the canonical origin `https://www.rhino-inquisitor.com`.

Until the production custom domain is active, deploys run in **project-host rehearsal mode**: the active GitHub Pages host is the apex project host (`rhino-inquisitor.com`), so the canonical `www` origin does not yet serve `200` (it `301`-redirects to the apex). The live-host checks are expected to fail in this state, which is not a real defect.

## Old vs new behavior

- **Old:** live-host checks always ran as blocking. In rehearsal mode `https://www.rhino-inquisitor.com` returned `301`, so the gate failed and blocked deploys even though the artifact was correct and the preview ships `noindex`.
- **New:** live-host checks run as blocking **only** when the deploy workflow confirms the canonical `www` host is the active Pages host. Otherwise they are recorded in the report as `manual-required` (non-fatal) and the gate passes on a healthy artifact.

## Readiness signal

- The deploy workflow (`.github/workflows/deploy-pages.yml`) computes `steps.pages_host.outputs.ready` by comparing the live Pages host to `EXPECTED_PAGES_HOST` (`www.rhino-inquisitor.com`).
- That value is passed to the gate as `RHI_HTTPS_LIVE_HOST_READY`.
- In the gate, `RHI_HTTPS_LIVE_HOST_READY=true` enables blocking live-host checks; any other value (or unset) selects rehearsal mode and skips them. This preserves the existing `--skip-live-checks` / `--require-live-checks` CLI flags.
- The report `mode` block records `liveHostReady` and `rehearsal` for auditability.

When the custom domain goes live, no code change is required: the workflow's host check will report `ready=true`, and the gate will enforce the live checks as blocking again.

## Impact and verification

- Impacted: the "Run HTTPS and security gate" step inside `npm run gates:local`, driven by the Pages host check in the deploy workflow.
- Rehearsal mode (expected on the apex project host):

  ```bash
  node scripts/gates/check-https-security.js   # exit 0, live status manual-required
  ```

- Production-ready enforcement (blocking live checks):

  ```bash
  RHI_HTTPS_LIVE_HOST_READY=true node scripts/gates/check-https-security.js
  ```

- Full deploy gate suite: `npm run gates:local`.

## Related files

- `scripts/gates/check-https-security.js` — gate implementation and `RHI_HTTPS_LIVE_HOST_READY` handling.
- `.github/workflows/deploy-pages.yml` — Pages host readiness check and env wiring.
- `scripts/gates/run-all-gates.sh` — invokes the gate via `gates:local`.
