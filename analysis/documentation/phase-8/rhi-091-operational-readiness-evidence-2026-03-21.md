# RHI-091 Operational Readiness Evidence Update

## Change summary

Added the first operational-readiness automation for RHI-091:

- a live preview-host smoke-test script that resolves the public rehearsal entrypoint, checks the deterministic Phase 8 sample set, and writes both machine-readable and human-readable evidence
- a production-build cleanliness script that verifies the built artifact contains no preview-host leakage and no unexpected `noindex` on launch-critical routes
- the initial RHI-091 evidence artefacts generated from those scripts

## Why this changed

RHI-091 previously depended on manual ad hoc checks for the rehearsal host and the production validation build. That left the ticket without a repeatable artifact contract for two of its core acceptance areas: preview-host smoke testing and production-build purity. The new scripts make those checks reproducible and reduce the risk of claiming go/no-go readiness from scattered terminal output.

## Behavior details

### Previous behavior

- The repository had committed WS-B through WS-G reports, but no dedicated WS-H report for live rehearsal smoke tests.
- There was no machine-readable report that classified preview-host leakage versus allowed helper-page `noindex` behavior in the production artifact.
- The Phase 8 ticket and index listed smoke-test markdown as a deliverable, but there was no automation to generate it from the deterministic datasets.

### New behavior

- `npm run check:preview-launch-readiness` now resolves `https://taurgis.github.io/rhino-inquisitor-com/`, records the redirect chain into the active rehearsal host, tests the deterministic homepage, recent posts, categories, archive, privacy page, priority redirect sample, sitemap, robots.txt, and feed endpoints, and writes:
  - `validation/preview-launch-readiness-report.json`
  - `migration/phase-8-smoke-test-results.md`
- `npm run check:production-validation-build` now scans the built production artifact for preview-host URL leakage and unexpected `noindex` while separately classifying allowed helper-page and system-route `noindex` behavior. It writes:
  - `validation/production-host-smoke-report.json`
- The Phase 8 ticket index and RHI-091 ticket now reference the new WS-H evidence artifacts and record the current in-progress state.

## Impact

- Maintainers now have a repeatable, committed way to regenerate the RHI-091 smoke and production-build reports instead of reconstructing them from shell history.
- The go/no-go package now has an explicit evidence boundary for preview-host behavior versus production-build cleanliness.
- Phase 8 tracking no longer shows RHI-088 through RHI-090 as open after their upstream closeouts.

## Verification

Run these commands from the repository root:

1. `npm run check:preview-launch-readiness`
2. `npm run check:production-validation-build`

Current verification snapshot from 2026-03-21:

- `validation/preview-launch-readiness-report.json` generated successfully and reported `status: pass`
- `migration/phase-8-smoke-test-results.md` generated successfully from the same live smoke-test run
- `validation/production-host-smoke-report.json` generated successfully and reported zero preview-host leakage and zero unexpected `noindex`

## Related files

- `scripts/phase-8/check-preview-launch-readiness.js`
- `scripts/phase-8/check-production-validation-build.js`
- `package.json`
- `validation/README.md`
- `validation/preview-launch-readiness-report.json`
- `validation/production-host-smoke-report.json`
- `migration/phase-8-smoke-test-results.md`
- `migration/phase-8-exception-register.md`
- `analysis/tickets/phase-8/RHI-091-operational-readiness-go-nogo.md`
- `analysis/tickets/phase-8/INDEX.md`