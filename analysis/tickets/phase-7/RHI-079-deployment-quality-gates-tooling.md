## RHI-079 · Workstream F — Deployment Quality Gates and Tooling

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 7  
**Assigned to:** Engineering Owner  
**Target date:** 2026-05-28  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Integrate all required deployment quality gates as blocking pre-deploy checks in the deployment workflow, ensuring that every release candidate is verified end-to-end before the artifact is uploaded to GitHub Pages. The gates must produce machine-readable, archived outputs that serve as evidence for the Phase 7 sign-off and Phase 8 launch readiness assessment. No deployment should reach the Pages upload step unless all gates pass.

This workstream is the integration layer for outputs from WS-A through WS-E. Its primary deliverable is a working, gate-enforced deployment pipeline where a single CI run provides complete evidence of build correctness, URL preservation, SEO signal safety, artifact integrity, and link health.

---

### Acceptance Criteria

- [ ] All of the following gates are integrated as blocking steps in `.github/workflows/deploy-pages.yml` and run in this order before `actions/upload-pages-artifact`:
  1. `hugo --gc --minify --environment production` — Hugo production build (must exit 0)
  2. `npm run validate:frontmatter` — front matter schema compliance (from Phase 3)
  3. `npm run check:url-parity` — URL preservation coverage (from Phase 6)
  4. `npm run check:redirect-chains` — zero redirect chains/loops (from Phase 6)
  5. `npm run check:canonical-alignment` — canonical/sitemap alignment (from Phase 6)
  6. `npm run check:mixed-content` — no HTTP resource references (from WS-D, RHI-077)
  7. `npm run check:seo-safe-deploy` — canonical host, sitemap, robots.txt, noindex check (from WS-E, RHI-078)
  8. `npm run check:links` — broken internal link check (from Phase 3)
  9. `npm run validate:artifact` — artifact integrity and size check (from WS-B, RHI-075)
- [ ] Each gate job is wired with `needs:` so the deploy job cannot run unless all gates pass
- [ ] Release-candidate pass criteria are explicit: all nine blocking gates exit with code 0; any single failure blocks deploy
- [ ] Gate failure produces a clear error message identifying the failing check and the affected file or URL
- [ ] All gate output reports are uploaded as CI artifacts (`actions/upload-artifact`) and retained for at least 7 days
- [ ] Targeted Lighthouse checks run on the release candidate (via `@lhci/cli`) on:
  - [ ] Homepage
  - [ ] One representative post
  - [ ] One category page
  - [ ] Lighthouse checks run as a non-blocking advisory step (failures are logged, not blocking — Lighthouse scores are not stable enough to block deployment without calibrated thresholds); blocking thresholds must be set in WS-G before they become blocking
- [ ] `scripts/phase-7/run-all-gates.sh` exists as a convenience script for running all gates locally in the same order as CI
- [ ] `migration/reports/phase-7-gate-summary.csv` format is defined (one row per gate: gate name, command, pass/fail, run timestamp, CI run URL)

---

### Tasks

- [ ] Audit the current state of all gate scripts — confirm each is available and exits with correct codes:
  - [ ] `npm run validate:frontmatter` — test exit codes on valid and invalid front matter
  - [ ] `npm run check:url-parity` — confirm script exists and passes on current build
  - [ ] `npm run check:redirect-chains` — confirm script exists and passes
  - [ ] `npm run check:canonical-alignment` — confirm script exists and passes
  - [ ] `npm run check:mixed-content` — from WS-D (RHI-077); confirm it exists and passes
  - [ ] `npm run check:seo-safe-deploy` — from WS-E (RHI-078); confirm it exists and passes
  - [ ] `npm run check:links` — from Phase 3 (RHI-029); confirm it exists and passes
  - [ ] `npm run validate:artifact` — from WS-B (RHI-075); confirm it exists and passes
- [ ] Update `.github/workflows/deploy-pages.yml` to integrate all gates in the correct order:
  - [ ] Create a `validate` job that runs after `checkout` and Hugo build
  - [ ] Add each gate as a sequential step in the validate job with explicit failure messages
  - [ ] Wire `deploy: needs: [validate]` (or include in `build` job before upload)
  - [ ] Add `actions/upload-artifact` step to archive all gate report outputs
- [ ] Install and configure `@lhci/cli`:
  - [ ] `npm install --save-dev @lhci/cli`
  - [ ] Create `lighthouserc.js` or `.lighthouserc.json` with URLs for homepage, post, and category page
  - [ ] Configure Lighthouse to run in CI mode (no browser required; use local URLs from a served `public/` directory or Pages deployment URL)
  - [ ] Add Lighthouse run as a separate non-blocking advisory job in the workflow
  - [ ] Upload Lighthouse report as CI artifact
- [ ] Create `scripts/phase-7/run-all-gates.sh`:
  - [ ] Sequential execution of all gate commands in CI order
  - [ ] Prints PASS/FAIL for each gate
  - [ ] Exits with non-zero code if any gate fails
  - [ ] Add `"gates:local": "bash scripts/phase-7/run-all-gates.sh"` to `package.json`
- [ ] Define `migration/reports/phase-7-gate-summary.csv` schema:
  - [ ] Headers: `gate_name`, `command`, `status`, `blocking`, `run_timestamp`, `ci_run_url`, `notes`
  - [ ] Commit empty CSV with headers as a template
- [ ] Test the complete gate suite in CI via `workflow_dispatch`:
  - [ ] All gates pass
  - [ ] Gate reports are attached as CI artifacts
  - [ ] Negative test confirms a single failing gate prevents deploy
  - [ ] Deploy job runs and completes on a fully passing run
  - [ ] Record Actions run URL in Progress Log
- [ ] Commit all changes: workflow updates, new scripts, `package.json`, and CSV template

---

### Out of Scope

- Writing new gate scripts (scripts are produced by their respective workstreams; this ticket only wires them)
- Setting blocking Lighthouse score thresholds (advisory only in Phase 7; thresholds for Phase 8 are set in Phase 8 scope)
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
| `@lhci/cli` version confirmed and checked for known vulnerabilities | Tool | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| One or more gate scripts do not exist or exit with unexpected codes | Medium | High | Audit all gate scripts at the start of this workstream; if any are missing, escalate to the owning workstream before proceeding | Engineering Owner |
| Gate ordering causes false pass (e.g., URL parity check runs before Hugo build completes, checking stale `public/`) | Medium | High | Ensure Hugo build runs and succeeds before all validation scripts; sequence is enforced by the job step ordering | Engineering Owner |
| Lighthouse CI configuration requires a running server rather than static file inspection | Medium | Low | Use `lhci autorun` with `--collect.staticDistDir=./public` for static analysis mode, or spin up a temporary `npx serve public/` within the CI step | Engineering Owner |
| `@lhci/cli` or other new tooling introduces a supply-chain vulnerability | Low | Medium | Run security advisory check on `@lhci/cli` before adding to `package.json`; pin to a specific version | Engineering Owner |
| CI artifact retention policy doesn't retain gate reports for long enough | Low | Medium | Set `retention-days: 30` on `actions/upload-artifact` for gate reports to support the Phase 8 launch readiness audit | Engineering Owner |

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

- `.github/workflows/deploy-pages.yml` — updated with full gate integration and artifact uploads
- `scripts/phase-7/run-all-gates.sh` — local convenience script for running all gates in CI order
- `package.json` — updated with `gates:local` script and `@lhci/cli` dev dependency
- `lighthouserc.js` or `.lighthouserc.json` — Lighthouse CI configuration
- `migration/reports/phase-7-gate-summary.csv` — schema template for gate evidence
- CI artifacts: all gate reports attached to the `workflow_dispatch` test run

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- Gate ordering matters: the Hugo build must complete before any script checks `public/`. Run the build first, then validate its output. Do not validate front matter or URL parity before the build runs (front matter validation is the one exception — it can run on source files before the build, but URL parity must run after `public/` exists).
- Lighthouse is non-blocking in Phase 7 because score thresholds need to be calibrated against real production URLs after cutover. Phase 8 will set explicit blocking thresholds and fail CI on regressions.
- The `migration/reports/phase-7-gate-summary.csv` is the machine-readable evidence trail for the Phase 7 sign-off (RHI-082) and the Phase 8 launch readiness check. Every gate must appear in this CSV for each release candidate build.
- Reference: `analysis/plan/details/phase-7.md` §Workstream F: Deployment Quality Gates and Tooling; `.github/instructions/ci-workflow-standards.instructions.md` §Required Quality Gates
