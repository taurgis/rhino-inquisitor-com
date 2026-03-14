## RHI-070 · Workstream H — CI and Release Gates for URL Preservation

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 6  
**Assigned to:** Engineering Owner  
**Target date:** 2026-05-15  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Integrate all Phase 6 redirect and URL preservation validation scripts into the CI/CD pipeline as blocking gates, ensuring that no deployment can succeed with redirect chains, missing URL mappings, canonical mismatches, or policy violations. Once configured, the CI gates protect the redirect mapping from regression throughout the lifetime of the site, not just at launch.

Phase 6 CI gates are the long-term enforcement mechanism. Without them, every future content update or Hugo config change is a potential redirect regression risk. The gates defined here must block deploys just as firmly as the Hugo build step itself.

---

### Acceptance Criteria

- [ ] The following gates are integrated in the GitHub Actions deployment workflow as blocking pre-deploy steps (all must exit with code 0):
  - [ ] `npm run validate:url-inventory` — URL manifest completeness and schema check (from WS-A: RHI-063)
  - [ ] `npm run check:url-parity` — legacy URL coverage against Hugo build output (from Phase 3: RHI-025, extended for Phase 6)
  - [ ] `npm run check:redirect-targets` — redirect target existence in production build (new: Phase 6)
  - [ ] `npm run check:redirect-chains` — zero redirect chains and loops in mapping (from WS-C: RHI-065)
  - [ ] `npm run check:canonical-alignment` — canonical tag and sitemap `<loc>` agreement (from WS-G: RHI-069)
  - [ ] `npm run check:retirement-policy` — retired URLs absent from sitemap and alias outputs (from WS-E: RHI-067)
  - [ ] `npm run check:host-protocol` — canonical host/protocol invariant check (from WS-D: RHI-066)
  - [ ] `npm run check:redirect-security` — open redirect and HTTPS destination check (from WS-F: RHI-068)
- [ ] All Phase 6 gate scripts are referenced in `package.json` with the correct script names and paths
- [ ] Zero-tolerance thresholds enforced for all gates (any failure = deploy blocked):
  - [ ] Missing mapped outcome for any in-scope legacy URL: 0 allowed
  - [ ] Redirect chain in migration routes: 0 allowed
  - [ ] Redirect loop: 0 allowed
  - [ ] Canonical target mismatch with final URL: 0 allowed
  - [ ] Redirect target not found in production build: 0 allowed
  - [ ] Non-canonical host in canonical tags or sitemaps: 0 allowed
  - [ ] Off-site or HTTP redirect destination: 0 allowed
- [ ] Gates are added as `needs:` dependencies of the deploy job in `.github/workflows/deploy-pages.yml`:
  - [ ] All Phase 6 gates run after Hugo build completes and before the upload-artifact step
  - [ ] Failure of any gate prevents artifact upload and deploy
- [ ] Phase 6 gates documented in `migration/phase-6-url-policy.md` CI gate reference section
- [ ] All gates pass on a clean production build with the full content set from Phase 4

---

### Tasks

- [ ] Audit all Phase 6 validation scripts from WS-A through WS-G:
  - [ ] Confirm each script is committed and callable via Node.js
  - [ ] Confirm each script exits with a non-zero code on failure
  - [ ] Confirm each script accepts a build output path argument (e.g., `--build-dir ./public`)
- [ ] Add all Phase 6 gate scripts to `package.json` scripts section:
  - [ ] `"validate:url-inventory": "node scripts/phase-6/validate-url-inventory.js"`
  - [ ] `"check:redirect-targets": "node scripts/phase-6/check-redirect-targets.js"`
  - [ ] `"check:redirect-chains": "node scripts/phase-6/check-redirect-chains.js"`
  - [ ] `"check:canonical-alignment": "node scripts/phase-6/generate-canonical-alignment-report.js --ci"`
  - [ ] `"check:retirement-policy": "node scripts/phase-6/check-retirement-policy.js"`
  - [ ] `"check:host-protocol": "node scripts/phase-6/check-host-protocol.js"`
  - [ ] `"check:redirect-security": "node scripts/phase-6/check-redirect-security.js"`
- [ ] Write `scripts/phase-6/check-redirect-targets.js` (if not already produced by WS-C or WS-G):
  - [ ] Loads `migration/url-map.csv`
  - [ ] For each `redirect` record, checks that a file exists at `target_url` path in `public/`
  - [ ] Exits with code 1 if any target is missing; exits with code 0 if all targets exist
- [ ] Update `.github/workflows/deploy-pages.yml`:
  - [ ] Add a `validate` job or add validation steps to the existing `build` job after Hugo build completes
  - [ ] Add all Phase 6 gate scripts as sequential steps
  - [ ] Confirm `deploy` job has `needs: [build]` (or equivalent) and will not run if `build` fails
  - [ ] Confirm `cancel-in-progress: false` is still set for the deploy job concurrency
- [ ] Run all Phase 6 gates locally against a production build:
  - [ ] Fix any blocking failures before committing the CI configuration
  - [ ] Document results in Progress Log
- [ ] Document all Phase 6 CI gates in `migration/phase-6-url-policy.md` CI reference section:
  - [ ] Gate name, script command, blocking threshold, zero-tolerance indicator
- [ ] Commit `package.json` updates, new script, and updated CI workflow

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
| RHI-063 Done — `validate-url-inventory.js` script committed | Ticket | Pending |
| RHI-065 Done — `check-redirect-chains.js` script committed | Ticket | Pending |
| RHI-066 Done — `check-host-protocol.js` script committed | Ticket | Done |
| RHI-067 Done — `check-retirement-policy.js` script committed | Ticket | Pending |
| RHI-068 Done — `check-redirect-security.js` script committed | Ticket | Done |
| RHI-069 Done — `generate-canonical-alignment-report.js` committed | Ticket | Pending |
| `.github/workflows/deploy-pages.yml` from Phase 3 (RHI-029) | Phase | Pending |
| Production Hugo build available for gate integration test | Phase | Pending |

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- `package.json` — updated with all Phase 6 gate script references
- `.github/workflows/deploy-pages.yml` — updated with Phase 6 blocking gate steps
- `scripts/phase-6/check-redirect-targets.js` — redirect target existence check
- `migration/phase-6-url-policy.md` — CI gate reference section complete

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- Every gate in this workstream must use a non-zero exit code on failure. A script that prints errors but exits with code 0 will not block the CI pipeline. Test this explicitly.
- The CI workflow standard from `.github/instructions/ci-workflow-standards.instructions.md` requires `cancel-in-progress: false` for the deploy job. Any workflow modification in this workstream must preserve that setting. It is easy to accidentally overwrite it during a merge.
- The gate scripts should accept a `--ci` flag or environment variable to suppress interactive output (color codes, progress bars) in CI environments. CI log parsers can be confused by ANSI codes.
- Phase 6 gates supplement, not replace, Phase 3 (`check:url-parity`) and Phase 5 (`check:metadata`, `check:redirects:seo`) gates. All gates must be active simultaneously.
- Reference: `analysis/plan/details/phase-6.md` §Workstream H, §Non-Negotiable Constraints (Release Blocking)
