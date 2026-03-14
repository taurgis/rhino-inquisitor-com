# RHI-070 CI Release Gates For URL Preservation

## Change summary

RHI-070 now makes the full Phase 6 URL-preservation gate set release-blocking in the GitHub Pages deployment workflow. The repository also has a dedicated `check:redirect-targets` command and report so redirect-target publication is enforced separately from redirect-chain detection, and the shared Phase 6 URL policy now records the complete CI gate matrix used before Pages artifact upload.

## Why this changed

Phase 6 already had working validators for inventory, parity, chains, canonical alignment, retirement governance, host/protocol, and redirect security, but the deployment workflow only executed `check:url-parity` from that set. That left multiple Phase 6 contracts unenforced at deploy time and kept the URL-policy CI section in a placeholder state.

Without explicit workflow integration, redirect regressions could still ship even though the scripts existed locally. RHI-070 closes that gap by moving the Phase 6 controls into the release path and by adding the one remaining command contract the ticket expected.

## Behavior details

Old behavior:

1. `.github/workflows/deploy-pages.yml` ran the production build plus Phase 3 and Phase 5 checks, but only `npm run check:url-parity` from the required Phase 6 gate set.
2. `package.json` did not expose `npm run check:redirect-targets`, so the ticketed redirect-target publication gate could not run in CI.
3. There was no dedicated report for merge-target publication in `migration/reports/`, and `migration/phase-6-url-policy.md` still marked the Phase 6 CI matrix as pending future work.

New behavior:

1. `npm run check:redirect-targets` now validates every `merge` row in `migration/url-map.csv` against the built production artifact and writes `migration/reports/phase-6-redirect-targets.csv`.
2. `.github/workflows/deploy-pages.yml` now runs the full Phase 6 release-gate block after the production Hugo build and before any audit or Pages artifact upload:
   - `npm run validate:url-inventory`
   - `npm run check:url-parity`
   - `npm run check:redirect-targets`
   - `npm run check:redirect-chains`
   - `npm run check:canonical-alignment`
   - `npm run check:retirement-policy`
   - `npm run check:host-protocol`
   - `npm run check:redirect-security`
3. The workflow now archives the Phase 6 gate reports alongside the existing build artifacts so CI evidence is retained with the run.
4. `migration/phase-6-url-policy.md` now records the complete active Phase 6 gate matrix, the commands, and the zero-tolerance release-blocking contract.

## Impact

1. Future deploys cannot upload a Pages artifact or reach the deploy job if any Phase 6 URL-preservation gate fails.
2. Redirect-target publication is now enforced for all `merge` rows, including Model A query-string merge records that are not covered by the alias-only chain report.
3. Maintainers now have one policy reference and one workflow implementation path for Phase 6 release gating instead of a partially implemented ticket expectation.

## Verification

1. Build a clean production artifact and run the full Phase 6 gate matrix:

```bash
npm run build:prod && npm run validate:url-inventory && npm run check:url-parity && npm run check:redirect-targets && npm run check:redirect-chains && npm run check:canonical-alignment && npm run check:retirement-policy && npm run check:host-protocol && npm run check:redirect-security
```

Verified on 2026-03-14:

1. `npm run build:prod` completed successfully with `Pages 206`, `Aliases 17`, and no build errors.
2. `npm run validate:url-inventory` passed for `1223` manifest rows.
3. `npm run check:url-parity` passed with `1223` pass rows, `0` fail rows, and `0` critical failures.
4. `npm run check:redirect-targets` passed with `141` reviewed merge rows and `0` failures.
5. `npm run check:redirect-chains` passed with `18` alias-backed redirect rows, `0` chain defects, and `0` loop defects.
6. `npm run check:canonical-alignment` passed with `215` canonical rows and `0` mismatch rows.
7. `npm run check:retirement-policy` passed for `885` retired URL rows.
8. `npm run check:host-protocol` passed for the production artifact and wrote reports under `tmp/phase-6-host-protocol`.
9. `npm run check:redirect-security` passed with `50` pass rows and `0` failures.

## Related files

1. `scripts/phase-6/check-redirect-targets.js`
2. `package.json`
3. `.github/workflows/deploy-pages.yml`
4. `migration/phase-6-url-policy.md`
5. `analysis/tickets/phase-6/RHI-070-ci-release-gates.md`
6. `analysis/tickets/phase-6/INDEX.md`