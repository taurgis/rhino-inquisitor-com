## RHI-070 · Workstream H — CI and Release Gates for URL Preservation

**Status:** Done  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 6  
**Assigned to:** Engineering Owner  
**Target date:** 2026-05-15  
**Created:** 2026-03-07  
**Updated:** 2026-03-14

---

### Goal

Integrate all Phase 6 redirect and URL preservation validation scripts into the CI/CD pipeline as blocking gates, ensuring that no deployment can succeed with redirect chains, missing URL mappings, canonical mismatches, or policy violations. Once configured, the CI gates protect the redirect mapping from regression throughout the lifetime of the site, not just at launch.

Phase 6 CI gates are the long-term enforcement mechanism. Without them, every future content update or Hugo config change is a potential redirect regression risk. The gates defined here must block deploys just as firmly as the Hugo build step itself.

---

### Acceptance Criteria

- [x] The following gates are integrated in the GitHub Actions deployment workflow as blocking pre-deploy steps (all must exit with code 0):
  - [x] `npm run validate:url-inventory` — URL manifest completeness and schema check (from WS-A: RHI-063)
  - [x] `npm run check:url-parity` — legacy URL coverage against Hugo build output (from Phase 3: RHI-025, extended for Phase 6)
  - [x] `npm run check:redirect-targets` — redirect target existence in production build (new: Phase 6)
  - [x] `npm run check:redirect-chains` — zero redirect chains and loops in mapping (from WS-C: RHI-065)
  - [x] `npm run check:canonical-alignment` — canonical tag and sitemap `<loc>` agreement (from WS-G: RHI-069)
  - [x] `npm run check:retirement-policy` — retired URLs absent from sitemap and alias outputs (from WS-E: RHI-067)
  - [x] `npm run check:host-protocol` — canonical host/protocol invariant check (from WS-D: RHI-066)
  - [x] `npm run check:redirect-security` — open redirect and HTTPS destination check (from WS-F: RHI-068)
- [x] All Phase 6 gate scripts are referenced in `package.json` with the correct script names and paths
- [x] Zero-tolerance thresholds enforced for all gates (any failure = deploy blocked):
  - [x] Missing mapped outcome for any in-scope legacy URL: 0 allowed
  - [x] Redirect chain in migration routes: 0 allowed
  - [x] Redirect loop: 0 allowed
  - [x] Canonical target mismatch with final URL: 0 allowed
  - [x] Redirect target not found in production build: 0 allowed
  - [x] Non-canonical host in canonical tags or sitemaps: 0 allowed
  - [x] Off-site or HTTP redirect destination: 0 allowed
- [x] Gates are added as `needs:` dependencies of the deploy job in `.github/workflows/deploy-pages.yml`:
  - [x] All Phase 6 gates run after Hugo build completes and before the upload-artifact step
  - [x] Failure of any gate prevents artifact upload and deploy
- [x] Phase 6 gates documented in `migration/phase-6-url-policy.md` CI gate reference section
- [x] All gates pass on a clean production build with the full content set from Phase 4

---

### Tasks

- [x] Audit all Phase 6 validation scripts from WS-A through WS-G:
  - [x] Confirm each script is committed and callable via Node.js
  - [x] Confirm each script exits with a non-zero code on failure
  - [x] Confirm each script accepts a build output path argument (e.g., `--build-dir ./public`)
- [x] Add all Phase 6 gate scripts to `package.json` scripts section:
  - [x] `"validate:url-inventory": "node scripts/phase-6/validate-url-inventory.js"`
  - [x] `"check:redirect-targets": "node scripts/phase-6/check-redirect-targets.js"`
  - [x] `"check:redirect-chains": "node scripts/phase-6/check-redirect-chains.js"`
  - [x] `"check:canonical-alignment": "node scripts/phase-6/generate-canonical-alignment-report.js --ci"`
  - [x] `"check:retirement-policy": "node scripts/phase-6/check-retirement-policy.js"`
  - [x] `"check:host-protocol": "node scripts/phase-6/check-host-protocol.js"`
  - [x] `"check:redirect-security": "node scripts/phase-6/check-redirect-security.js"`
- [x] Write `scripts/phase-6/check-redirect-targets.js` (if not already produced by WS-C or WS-G):
  - [x] Loads `migration/url-map.csv`
  - [x] For each `redirect` record, checks that a file exists at `target_url` path in `public/`
  - [x] Exits with code 1 if any target is missing; exits with code 0 if all targets exist
- [x] Update `.github/workflows/deploy-pages.yml`:
  - [x] Add a `validate` job or add validation steps to the existing `build` job after Hugo build completes
  - [x] Add all Phase 6 gate scripts as sequential steps
  - [x] Confirm `deploy` job has `needs: [build]` (or equivalent) and will not run if `build` fails
  - [x] Confirm `cancel-in-progress: false` is still set for the deploy job concurrency
- [x] Run all Phase 6 gates locally against a production build:
  - [x] Fix any blocking failures before committing the CI configuration
  - [x] Document results in Progress Log
- [x] Document all Phase 6 CI gates in `migration/phase-6-url-policy.md` CI reference section:
  - [x] Gate name, script command, blocking threshold, zero-tolerance indicator
- [x] Commit `package.json` updates, new script, and updated CI workflow

---

### Out of Scope

- Writing the individual validation scripts (WS-A through WS-G: RHI-063 through RHI-069)
- CI gates from other phases (Phase 3 url-parity, Phase 5 SEO gates) — those are already in the pipeline
- Performance testing gate configuration (Phase 5: RHI-054)
- Broken link checking beyond redirect target existence (Phase 8)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-063 Done — `validate-url-inventory.js` script committed | Ticket | Done |
| RHI-065 Done — `check-redirect-chains.js` script committed | Ticket | Done |
| RHI-066 Done — `check-host-protocol.js` script committed | Ticket | Done |
| RHI-067 Done — `check-retirement-policy.js` script committed | Ticket | Done |
| RHI-068 Done — `check-redirect-security.js` script committed | Ticket | Done |
| RHI-069 Done — `generate-canonical-alignment-report.js` committed | Ticket | Done |
| `.github/workflows/deploy-pages.yml` from Phase 3 (RHI-029) | Phase | Done |
| Production Hugo build available for gate integration test | Phase | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| One or more Phase 6 scripts fail in CI environment due to missing Node.js dependencies or path differences | Medium | Medium | Test each gate command locally with the same Node.js version used in CI; pin Node.js version in CI; use `npm ci` for deterministic installs | Engineering Owner |
| CI gate runtime for full URL set is too slow (gates add >5 minutes to deploy pipeline) | Low | Medium | Profile individual gate performance; parallelize independent gates; split CI gates into `build` (blocking) and `report` (informational) runs if needed | Engineering Owner |
| Modifying `deploy-pages.yml` breaks existing Phase 3/5 gates | Low | High | Run full CI pipeline after adding new gates; verify all existing Phase 3 and Phase 5 gates still pass | Engineering Owner |
| `cancel-in-progress` accidentally set to `true` for deploy job after workflow edit | Low | Critical | Add explicit check: confirm `cancel-in-progress: false` is preserved for deploy job after workflow update; this is a hard CI workflow standard requirement | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-070 is complete. The deploy workflow now treats the full Phase 6 URL-preservation command set as a blocking release gate before any Pages artifact upload, and the repository now has a dedicated redirect-target publication check and report for the merge rows that are not covered by the alias-only chain validator.

**Delivered artefacts:**

- `package.json` — updated with the missing `check:redirect-targets` script reference
- `.github/workflows/deploy-pages.yml` — updated with the full Phase 6 blocking gate sequence and archived Phase 6 reports before Pages artifact upload
- `scripts/phase-6/check-redirect-targets.js` — redirect target existence check for all `merge` rows in `migration/url-map.csv`
- `migration/reports/phase-6-redirect-targets.csv` — redirect target publication report generated by the new gate
- `migration/phase-6-url-policy.md` — CI gate reference section completed with the active Phase 6 gate matrix
- `analysis/documentation/phase-6/rhi-070-ci-release-gates-2026-03-14.md` — implementation and verification record

**Deviations from plan:**

- The ticket allowed either a dedicated `validate` job or validation steps in the existing `build` job. The repository kept the existing `build` job and added the Phase 6 release-gate block there so deploy behavior, Pages artifact ordering, and the current preview-rehearsal flow remained unchanged.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-14 | In progress | Added the missing redirect-target validator, wired the Phase 6 gate commands into the deploy workflow before artifact upload, and completed the Phase 6 CI matrix in the shared URL policy. |
| 2026-03-14 | Done | Clean production validation passed: inventory `1223` rows, URL parity `1223` pass rows with `0` critical failures, redirect targets `141` pass rows, chains `18` pass rows with zero defects, canonical alignment `215` rows with zero mismatches, retirement `885` retired rows, host/protocol passed, and redirect security `50` pass rows with zero failures. |

---

### Notes

- Every gate in this workstream must use a non-zero exit code on failure. A script that prints errors but exits with code 0 will not block the CI pipeline. Test this explicitly.
- The CI workflow standard from `.github/instructions/ci-workflow-standards.instructions.md` requires `cancel-in-progress: false` for the deploy job. Any workflow modification in this workstream must preserve that setting. It is easy to accidentally overwrite it during a merge.
- The gate scripts should accept a `--ci` flag or environment variable to suppress interactive output (color codes, progress bars) in CI environments. CI log parsers can be confused by ANSI codes.
- Phase 6 gates supplement, not replace, Phase 3 (`check:url-parity`) and Phase 5 (`check:metadata`, `check:redirects:seo`) gates. All gates must be active simultaneously.
- Reference: `analysis/plan/details/phase-6.md` §Workstream H, §Non-Negotiable Constraints (Release Blocking)
