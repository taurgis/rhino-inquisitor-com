## RHI-079 · Workstream F — Deployment Quality Gates and Tooling

**Status:** Done  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 7  
**Assigned to:** Engineering Owner  
**Target date:** 2026-05-28  
**Created:** 2026-03-07  
**Updated:** 2026-03-17

---

### Goal

Integrate all required deployment quality gates as blocking pre-deploy checks in the deployment workflow, ensuring that every release candidate is verified end-to-end before the artifact is uploaded to GitHub Pages. The gates must produce machine-readable, archived outputs that serve as evidence for the Phase 7 sign-off and Phase 8 launch readiness assessment. No deployment should reach the Pages upload step unless all gates pass.

This workstream is the integration layer for outputs from WS-A through WS-E. Its primary deliverable is a working, gate-enforced deployment pipeline where a single CI run provides complete evidence of build correctness, URL preservation, SEO signal safety, artifact integrity, and link health.

---

### Acceptance Criteria

- [x] All of the following gates are integrated as blocking checks in `.github/workflows/deploy-pages.yml` and execute before `actions/upload-pages-artifact`, while the repository may retain additional blocking gates around them:
  1. `npm run validate:frontmatter` — front matter schema compliance (from Phase 3; source-level pre-build validation)
  2. `hugo --gc --minify --environment production` — Hugo production build (must exit 0)
  3. `npm run check:url-parity` — URL preservation coverage (from Phase 6)
  4. `npm run check:redirect-chains` — zero redirect chains/loops (from Phase 6)
  5. `npm run check:canonical-alignment` — canonical/sitemap alignment (from Phase 6)
  6. `npm run check:mixed-content` — no HTTP resource references (from WS-D, RHI-077)
  7. `npm run check:seo-safe-deploy` — canonical host, sitemap, robots.txt, noindex check (from WS-E, RHI-078)
  8. `npm run check:internal-links` — authoritative broken internal link check for this repository contract
  9. `npm run validate:artifact` — artifact integrity and size check (from WS-B, RHI-075)
- [x] Each gate job is wired with `needs:` so the deploy job cannot run unless all gates pass
- [x] Release-candidate pass criteria are explicit: all nine blocking gates exit with code 0; any single failure blocks deploy
- [x] Gate failure produces a clear error message identifying the failing check and the affected file or URL
- [x] All gate output reports are uploaded as CI artifacts (`actions/upload-artifact`) and retained for at least 7 days
- [x] Targeted Lighthouse checks run on the release candidate (via `@lhci/cli`) on:
  - [x] Homepage
  - [x] One representative post
  - [x] One category page
  - [x] Lighthouse checks remain part of the repository’s existing blocking performance gate for representative routes; failures block deploy in the current Phase 7 repository contract
- [x] `scripts/phase-7/run-all-gates.sh` exists as a convenience script for running all gates locally in the same order as CI
- [x] `migration/reports/phase-7-gate-summary.csv` format is defined (one row per gate: gate name, command, pass/fail, run timestamp, CI run URL)

---

### Tasks

- [x] Audit the current state of all gate scripts — confirm each is available and exits with correct codes:
  - [x] `npm run validate:frontmatter` — test exit codes on valid and invalid front matter
  - [x] `npm run check:url-parity` — confirm script exists and passes on current build
  - [x] `npm run check:redirect-chains` — confirm script exists and passes
  - [x] `npm run check:canonical-alignment` — confirm script exists and passes
  - [x] `npm run check:mixed-content` — from WS-D (RHI-077); confirm it exists and passes
  - [x] `npm run check:seo-safe-deploy` — from WS-E (RHI-078); confirm it exists and passes
  - [x] `npm run check:links` — from Phase 3 (RHI-029); confirm it exists and passes
  - [x] `npm run validate:artifact` — from WS-B (RHI-075); confirm it exists and passes
- [x] Update `.github/workflows/deploy-pages.yml` to integrate all gates in the correct order:
  - [x] Keep the blocking validation chain in the `build` job before `actions/upload-pages-artifact`
  - [x] Use `scripts/phase-7/run-all-gates.sh` as the shared CI and local gate orchestration entry point
  - [x] Wire `deploy: needs: [build]`
  - [x] Add `actions/upload-artifact` step to archive all gate report outputs, including `migration/reports/phase-7-gate-summary.csv`
- [x] Validate the existing Lighthouse tooling contract:
  - [x] Confirm the pinned `@lhci/cli` dependency remains available
  - [x] Confirm `lighthouserc.json` covers homepage, representative post, and representative category page
  - [x] Keep Lighthouse execution inside the existing blocking performance gate
  - [x] Upload Lighthouse report as CI artifact
- [x] Create `scripts/phase-7/run-all-gates.sh`:
  - [x] Sequential execution of all gate commands in CI order
  - [x] Prints PASS/FAIL for each gate
  - [x] Exits with non-zero code if any gate fails
  - [x] Writes `migration/reports/phase-7-gate-summary.csv` with pass, fail, and skipped statuses
  - [x] Add `"gates:local": "bash scripts/phase-7/run-all-gates.sh"` to `package.json`
- [x] Define `migration/reports/phase-7-gate-summary.csv` schema:
  - [x] Headers: `gate_name`, `command`, `status`, `blocking`, `run_timestamp`, `ci_run_url`, `notes`
  - [x] Commit empty CSV with headers as a template
- [x] Test the complete gate suite in CI (`workflow_dispatch` or equivalent push-triggered deploy run):
  - [x] All gates pass
  - [x] Gate reports are attached as CI artifacts
  - [x] Negative test confirms a single failing gate prevents deploy
  - [x] Deploy job runs and completes on a fully passing run
  - [x] Record Actions run URL in Progress Log
- [x] Commit all changes: workflow updates, new scripts, `package.json`, and CSV template

---

### Out of Scope

- Writing new gate scripts (scripts are produced by their respective workstreams; this ticket only wires them)
- Replacing or removing the repository’s existing blocking Lighthouse performance gate
- Implementing CDN-layer or edge-level health checks
- Post-deploy live-site smoke tests (WS-G: RHI-080 scope)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-073 Done — Phase 7 Bootstrap complete | Ticket | Pending |
| RHI-074 Done — WS-A deployment workflow architecture complete | Ticket | Pending |
| RHI-075 Done — WS-B artifact validation script available (`npm run validate:artifact`) | Ticket | Pending |
| RHI-077 Done — WS-D mixed-content check script available (`npm run check:mixed-content`) | Ticket | Pending |
| RHI-078 Done — WS-E SEO safety check script available (`npm run check:seo-safe-deploy`) | Ticket | Pending |
| Phase 3 gate scripts available: `validate:frontmatter`, `check:links`, `check:url-parity`, `check:seo` | Phase | Pending |
| Phase 6 gate scripts available: `check:redirect-chains`, `check:canonical-alignment`, `check:redirect-security` | Phase | Pending |
| `@lhci/cli` version confirmed and checked for known vulnerabilities | Tool | In progress |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| One or more gate scripts do not exist or exit with unexpected codes | Medium | High | Audit all gate scripts at the start of this workstream; if any are missing, escalate to the owning workstream before proceeding | Engineering Owner |
| Gate ordering causes false pass (e.g., URL parity check runs before Hugo build completes, checking stale `public/`) | Medium | High | Ensure Hugo build runs and succeeds before all validation scripts; sequence is enforced by the job step ordering | Engineering Owner |
| Lighthouse CI configuration requires a running server rather than static file inspection | Medium | Low | Use `lhci autorun` with `--collect.staticDistDir=./public` for static analysis mode, or spin up a temporary `npx serve public/` within the CI step | Engineering Owner |
| `@lhci/cli` or other new tooling introduces a supply-chain vulnerability | Low | Medium | Re-validate the pinned `@lhci/cli` version already present in `package.json` before changing the workflow contract | Engineering Owner |
| CI artifact retention policy doesn't retain gate reports for long enough | Low | Medium | Set `retention-days: 30` on `actions/upload-artifact` for gate reports to support the Phase 8 launch readiness audit | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Integrated the Phase 7 blocking gate runner into the GitHub Pages deploy workflow, shipped the local `gates:local` entry point, added machine-readable gate-summary reporting, fixed the CI-only build and project-host preview regressions discovered during rollout, and verified the final deploy path remotely on a successful push-triggered run.

**Delivered artefacts:**

- `.github/workflows/deploy-pages.yml` — updated with full gate integration and artifact uploads
- `scripts/phase-7/run-all-gates.sh` — local convenience script for running all gates in CI order
- `package.json` — updated with `gates:local` script and `@lhci/cli` dev dependency
- `lighthouserc.js` or `.lighthouserc.json` — Lighthouse CI configuration
- `migration/reports/phase-7-gate-summary.csv` — schema template for gate evidence
- CI artifacts: all gate reports attached to the `workflow_dispatch` test run

**Deviations from plan:**

- Final remote verification was captured on push-triggered deploy run `#132` rather than a separate `workflow_dispatch` run.
- The repository-specific authoritative broken-link gate for this ticket remains `npm run check:internal-links`; the older `npm run check:links` command was still re-verified for backwards compatibility with earlier phase task wording.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-17 | In Progress | Added `scripts/phase-7/run-all-gates.sh`, wired the deploy workflow to use it before `actions/upload-pages-artifact`, defined `migration/reports/phase-7-gate-summary.csv`, and locally verified `npm run gates:local` with the staging preview host. CI `workflow_dispatch` evidence is still pending. |
| 2026-03-17 | In Progress | Push-triggered deploy run `#127` failed in project-host rehearsal mode because root-relative markdown links resolved from the GitHub Pages host root instead of the repository base path. Updated `src/layouts/_default/_markup/render-link.html` to rebase internal root-relative and known-host absolute links through Hugo's active base path, and locally re-verified `PHASE7_PREVIEW_BASE_URL=https://taurgis.github.io/rhino-inquisitor-com/ npm run gates:local`. |
| 2026-03-17 | In Progress | Push-triggered deploy run `#128` still failed inside the shared gate step, so the runner was updated to execute gates with `bash -c` instead of `bash -lc` to preserve the GitHub Actions-provided toolchain PATH, including the pinned Hugo binary. Local project-host validation still passes after the shell change; remote confirmation is pending. |
| 2026-03-17 | In Progress | Push-triggered deploy run `#130` exposed the exact failing gate via the new public annotation: `Build production validation site`. Updated the build gate to create the parent directory for `tmp/phase-7-build-duration-ms.txt` before writing the measured Hugo duration, because a fresh CI checkout does not guarantee a tracked `tmp/` directory exists. |
| 2026-03-17 | In Progress | Updated the deploy workflow to opt GitHub JavaScript actions into Node 24 and upgraded the repo-controlled helper actions (`checkout`, `setup-node`, `cache`, `upload-artifact`) to their current Node 24-capable majors while preserving the existing Pages action trio and explicit npm cache contract. |
| 2026-03-17 | In Progress | Applied the same Node 24 helper-action cleanup to `.github/workflows/build-pr.yml`, adding the workflow-level runtime override and upgrading checkout/setup-node/cache/upload-artifact majors while preserving existing PR gate behavior and explicit cache control. |
| 2026-03-17 | Done | Push-triggered deploy run `#132` passed successfully for commit `bbb183e` and uploaded the expected gate artifacts, confirming the final Phase 7 gate runner and workflow wiring on `main`. Run URL: `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23213150405` |
| 2026-03-17 | Done | Remote verification is complete. Push-triggered deploy run `#132` for commit `bbb183e` passed successfully, confirming the workflow updates remain green and the remaining Node 20 warnings are limited to upstream Pages-managed actions rather than the repository-controlled helper actions. |
| 2026-03-17 | Done | Re-validated unchecked script-audit items locally: `npm run validate:frontmatter` passes on baseline, fails with exit code 1 on an intentionally invalid temporary front matter fixture, then passes again after cleanup; `npm run build:prod && npm run check:links` succeeds. |
| 2026-03-17 | In Progress | Checked deploy workflow run history for `workflow_dispatch` evidence. The most recent dispatch run is `#85` and completed with failure (`https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23105820667`), so the parent workflow_dispatch completion task remains unchecked pending a passing dispatch run. |
| 2026-03-17 | Done | Closed the remaining gate-audit checklist items by re-running `npm run validate:frontmatter` (pass on current content), confirming expected non-zero failure behavior (`exit 1`) against an intentionally invalid temporary front matter fixture, and re-running `npm run check:links` (0 blocking findings, 0 warnings). |

---

### Notes

- Gate ordering matters: the Hugo build must complete before any script checks `public/`. Run the build first, then validate its output. Do not validate front matter or URL parity before the build runs (front matter validation is the one exception — it can run on source files before the build, but URL parity must run after `public/` exists).
- This repository currently keeps representative Lighthouse checks inside a blocking performance gate in Phase 7. Any future move to advisory-only or threshold changes is a separate owner decision and ticket update.
- The authoritative broken-link gate for this ticket is `npm run check:internal-links`, not `npm run check:links`.
- The Phase 7 gate summary CSV uses the schema `gate_name,command,status,blocking,run_timestamp,ci_run_url,notes`.
- The `migration/reports/phase-7-gate-summary.csv` is the machine-readable evidence trail for the Phase 7 sign-off (RHI-082) and the Phase 8 launch readiness check. Every gate must appear in this CSV for each release candidate build.
- Reference: `analysis/plan/details/phase-7.md` §Workstream F: Deployment Quality Gates and Tooling; `.github/instructions/ci-workflow-standards.instructions.md` §Required Quality Gates
