# RHI-079 Deployment Quality Gates Tooling

## Change summary

Aligned the Phase 7 deploy workflow with a reusable gate runner that executes the full blocking validation chain before `actions/upload-pages-artifact`, writes a machine-readable Phase 7 gate summary CSV, and provides a matching local command for pre-CI verification.

## Why this changed

RHI-079 needed an explicit, repeatable evidence trail for the deployment gate chain and a local way to reproduce the same ordered checks that CI uses before a Pages artifact is uploaded.

## Behavior details

### Old behavior

- `.github/workflows/deploy-pages.yml` ran many blocking checks inline, but the order lived only in workflow YAML.
- There was no dedicated `scripts/phase-7/run-all-gates.sh` command for local parity with CI.
- `migration/reports/phase-7-gate-summary.csv` did not exist, so Phase 7 lacked a dedicated machine-readable gate summary contract.
- The RHI-079 ticket language still referenced `check:links` and advisory Lighthouse behavior, which no longer matched the repository’s blocking gate posture.

### New behavior

- `scripts/phase-7/run-all-gates.sh` is now the shared orchestration entry point for the blocking Phase 7 validation chain.
- `npm run gates:local` runs the same blocking gate order locally that the deploy workflow uses in CI.
- `npm run gates:local` defaults to the current staging preview host and still accepts `PHASE7_PREVIEW_BASE_URL` or `--preview-base-url` for project-host rehearsal or future host changes.
- The workflow passes `PHASE7_PREVIEW_BASE_URL` and `PHASE7_CI_RUN_URL` into the runner so preview-host checks and the Phase 7 gate summary are tied to the actual run context.
- `migration/reports/phase-7-gate-summary.csv` is now the canonical Phase 7 gate summary format with headers `gate_name,command,status,blocking,run_timestamp,ci_run_url,notes`.
- The authoritative broken-link gate for RHI-079 is `npm run check:internal-links`.
- The repository-specific blocking Lighthouse performance gate remains in Phase 7; representative Lighthouse checks are not advisory-only in this repository contract.

## Impact

- Affects the GitHub Pages deployment workflow, local validation ergonomics, and Phase 7 audit evidence only.
- Keeps the broader existing blocking gate set while ensuring the ticket-required validation chain is executed before Pages artifact upload.
- Improves operator traceability by recording pass, fail, and skipped outcomes in a single CSV alongside the existing artifact reports.
- Does not change URL policy, canonical host policy, preview crawl-control policy, or Pages deployment sequencing.

## Verification

- Run `npm run gates:local`.
- Run `npm run build:prod && npm run check:seo` as a baseline production validation check.
- In CI, confirm `.github/workflows/deploy-pages.yml` uploads `migration/reports/phase-7-gate-summary.csv` with the other audit artifacts.
- Confirm a forced failing gate exits the runner non-zero and records later gates as `skipped` in the summary CSV.

## Related files

- `.github/workflows/deploy-pages.yml`
- `scripts/phase-7/run-all-gates.sh`
- `scripts/phase-7/check-preview-prefix-noindex.js`
- `package.json`
- `migration/reports/phase-7-gate-summary.csv`
- `analysis/tickets/phase-7/RHI-079-deployment-quality-gates-tooling.md`