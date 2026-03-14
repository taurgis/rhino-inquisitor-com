# RHI-069 Redirect Observability And Reporting

## Change summary

RHI-069 now has committed evidence generators for coverage and canonical alignment, an upgraded redirect-chain validator that also flags missing targets and cross-host anomalies in the RHI-069 quality report, and a seeded cutover runbook section that defines the post-launch monitoring cadence, incident thresholds, and escalation ownership required under the committed Model A launch posture.

## Why this changed

Phase 6 already had alias validation, redirect-chain detection, retirement governance, host/protocol validation, and redirect-security validation. What it lacked was the ticket-specific observability layer that turns those checks into release evidence:

1. there was no coverage report proving every in-scope legacy URL had a verified outcome,
2. there was no dedicated canonical alignment report for the `check:canonical-alignment` gate named by the downstream tickets,
3. the chains report path and logic did not yet align with the RHI-069 quality-report contract,
4. there was no committed monitoring section in `migration/phase-6-cutover-runbook.md` for the first 14 days after cutover.

Without those artefacts, RHI-069 remained open even though the adjacent Phase 6 validators existed.

## Behavior details

Old behavior:

1. `scripts/phase-6/check-redirect-chains.js` produced `migration/reports/phase-6-redirect-chain-report.csv`, but it did not flag off-site targets or missing final targets in the same report and it was not wired to the `phase-6-chains-loops.csv` path used by the Phase 6 tickets.
2. There was no script that generated `migration/reports/phase-6-coverage.csv` from `migration/url-map.csv` and the built production artifact.
3. There was no script that generated `migration/reports/phase-6-canonical-alignment.csv` and exposed the `check:canonical-alignment` command expected by downstream Phase 6 and Phase 7 tickets.
4. `migration/phase-6-cutover-runbook.md` did not exist yet, so the post-launch threshold and escalation content referenced by RHI-069 was missing.

New behavior:

1. `npm run phase6:generate-coverage-report` now audits every row in `migration/url-map.csv` and writes `migration/reports/phase-6-coverage.csv` with the required RHI-069 columns.
2. Coverage reporting distinguishes between artifact-verified outcomes and policy-verified Model A query-string exceptions:
   - `merge` rows backed by Hugo aliases are verified from the built alias helper pages,
   - accepted Model A query-string `merge` rows stay in scope and count as verified only when the approved target exists and the row carries the accepted RHI-062 note,
   - retired query-string rows are verified either by unpublished-path `404` behavior or, for `/?s=ocapi`, by the owner-approved residual limitation already codified in RHI-067.
3. `npm run check:redirect-chains` now writes `migration/reports/phase-6-chains-loops.csv` and fails on missing alias helpers, redirect chains, loops, missing published targets, HTTP downgrade targets, and cross-host anomalies.
4. `npm run check:canonical-alignment` now writes `migration/reports/phase-6-canonical-alignment.csv` and fails on any sitemap-to-canonical mismatch or any indexable page missing from the sitemap.
5. `migration/phase-6-cutover-runbook.md` now exists with the RHI-069 monitoring boundary, Day-0 smoke checks, T+1 to T+14 review cadence, incident thresholds, and named escalation ownership. The remaining cutover and rollback sections stay reserved for RHI-071.
6. A dedicated Hugo content entry now emits the root `404.html` GitHub Pages error document alongside the existing `/404/` validation route so the adjacent retirement-policy gate can pass on a clean production build.

## Impact

1. Maintainers now have repeatable, ticket-specific observability artefacts for coverage, quality, and canonical alignment before launch freeze.
2. RHI-070 can now consume real command contracts for `check:redirect-chains` and `check:canonical-alignment` instead of placeholder ticket references.
3. RHI-071 can extend an existing cutover runbook instead of creating the file from scratch, while preserving the ownership boundary that keeps full cutover and rollback authoring in the downstream ticket.
4. Model A query-string limitations remain visible in the coverage report instead of being silently dropped from the denominator.

## Verification

1. Build a clean production artifact:

```bash
npm run build:prod
```

2. Generate the coverage report:

```bash
npm run phase6:generate-coverage-report
```

3. Generate the RHI-069 quality report:

```bash
npm run check:redirect-chains
```

4. Generate the canonical alignment report:

```bash
npm run check:canonical-alignment
```

5. Re-run the adjacent Phase 6 controls against the same production artifact:

```bash
npm run phase6:validate-alias-pages
npm run check:host-protocol
npm run check:retirement-policy
npm run check:redirect-security
```

Verified on 2026-03-14:

1. A clean production build completed successfully with `Pages 206`, `Aliases 17`, and no build errors.
2. `npm run phase6:generate-coverage-report` passed with `1223/1223` verified outcomes in `migration/reports/phase-6-coverage.csv`.
3. `npm run check:redirect-chains` passed with `18` reviewed alias-backed redirect rows, `0` chain defects, and `0` loop defects in `migration/reports/phase-6-chains-loops.csv`.
4. `npm run check:canonical-alignment` passed with `215` canonical alignment rows and `0` mismatch rows in `migration/reports/phase-6-canonical-alignment.csv`.
5. `npm run phase6:validate-alias-pages`, `npm run check:host-protocol`, `npm run check:retirement-policy`, and `npm run check:redirect-security` all passed on the same final production artifact.
6. The cutover runbook now contains the required Day-0 and T+1 to T+14 monitoring content, explicit incident thresholds, and named escalation owners.

## Related files

1. `scripts/phase-6/generate-coverage-report.js`
2. `scripts/phase-6/generate-canonical-alignment-report.js`
3. `scripts/phase-6/check-redirect-chains.js`
4. `package.json`
5. `migration/reports/phase-6-coverage.csv`
6. `migration/reports/phase-6-chains-loops.csv`
7. `migration/reports/phase-6-canonical-alignment.csv`
8. `migration/phase-6-cutover-runbook.md`
9. `src/content/404-html.md`
10. `analysis/tickets/phase-6/RHI-069-redirect-observability-reporting.md`