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
- The shared gate runner executes each gate in a non-login Bash subprocess so GitHub Actions-provided toolchain paths, including the pinned Hugo binary, are preserved instead of being replaced by login-shell profile defaults.
- When a blocking gate fails in GitHub Actions, the runner now emits an explicit `::error::` annotation naming the failed gate so public run metadata exposes more than the generic step exit code.
- The production build gate now creates the parent directory for `tmp/phase-7-build-duration-ms.txt` before writing the measured Hugo build duration, so fresh CI checkouts without a tracked `tmp/` directory do not fail after a successful production build.
- The deploy workflow now opts GitHub JavaScript actions into the Node 24 runtime with `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` and upgrades the repo-controlled helper actions to `actions/checkout@v5`, `actions/setup-node@v5`, `actions/cache@v5`, and `actions/upload-artifact@v6` while leaving the GitHub Pages action trio unchanged.
- `actions/setup-node@v5` is configured with `package-manager-cache: false` so the workflow keeps using the existing explicit npm and `node_modules` cache steps instead of adding implicit cache behavior.
- The markdown render-link hook now rebases internal root-relative links and known internal-host absolute links through Hugo's current base path so GitHub Pages project-host preview builds keep links under `/rhino-inquisitor-com/` instead of resolving from the host root.
- `migration/reports/phase-7-gate-summary.csv` is now the canonical Phase 7 gate summary format with headers `gate_name,command,status,blocking,run_timestamp,ci_run_url,notes`.
- The authoritative broken-link gate for RHI-079 is `npm run check:internal-links`.
- The repository-specific blocking Lighthouse performance gate remains in Phase 7; representative Lighthouse checks are not advisory-only in this repository contract.

## Impact

- Affects the GitHub Pages deployment workflow, local validation ergonomics, and Phase 7 audit evidence only.
- Keeps the broader existing blocking gate set while ensuring the ticket-required validation chain is executed before Pages artifact upload.
- Improves operator traceability by recording pass, fail, and skipped outcomes in a single CSV alongside the existing artifact reports.
- Reduces GitHub Actions runtime deprecation noise for repo-controlled helper actions without changing Hugo build commands, Pages artifact flow, or deployment host-state behavior.
- Does not change URL policy, canonical host policy, preview crawl-control policy, or Pages deployment sequencing.

## Verification

- Run `npm run gates:local`.
- Run `PHASE7_PREVIEW_BASE_URL=https://taurgis.github.io/rhino-inquisitor-com/ npm run gates:local` to verify the project-host preview path used by GitHub Pages before the staging custom domain is active.
- Run `npm run build:prod && npm run check:seo` as a baseline production validation check.
- Run `.github/workflows/deploy-pages.yml` via `workflow_dispatch` or a push to `main` and confirm the build and deploy jobs stay green while Node 20 deprecation warnings disappear for the repo-controlled helper actions.
- In CI, confirm `.github/workflows/deploy-pages.yml` uploads `migration/reports/phase-7-gate-summary.csv` with the other audit artifacts.
- Confirm a forced failing gate exits the runner non-zero and records later gates as `skipped` in the summary CSV.

## Related files

- `.github/workflows/deploy-pages.yml`
- `scripts/phase-7/run-all-gates.sh`
- `scripts/phase-7/check-preview-prefix-noindex.js`
- `src/layouts/_default/_markup/render-link.html`
- `package.json`
- `migration/reports/phase-7-gate-summary.csv`
- `analysis/tickets/phase-7/RHI-079-deployment-quality-gates-tooling.md`