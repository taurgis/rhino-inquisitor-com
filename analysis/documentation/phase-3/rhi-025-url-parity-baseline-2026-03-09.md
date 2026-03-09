# RHI-025 URL Parity Baseline - 2026-03-09

## Change summary

Implemented the Phase 3 URL parity baseline gate as `npm run check:url-parity`, added the baseline report artifact at `migration/url-parity-report.json`, and documented how to run and interpret the check in the migration runbook.

## Why this changed

Phase 3 needed a release-blocking URL parity baseline before content migration begins. Without it, missing keep routes, broken merge targets, duplicate published URLs, redirect chains, and early soft-404 patterns would remain invisible until much later phases when fixes are more expensive and launch risk is higher.

## Behavior details

Old behavior:

- No Phase 3 URL parity script existed.
- No baseline parity report artifact was generated from the Hugo build output.
- URL-change threshold tracking for the `> 5%` redirect-layer trigger was not automated.
- Collision and redirect-chain detection for parity work depended on manual review or future phases.

New behavior:

- `scripts/check-url-parity.js` reads `migration/url-manifest.json`, scans `public/`, and writes `migration/url-parity-report.json` on every run.
- The script reports per-URL statuses: `ok`, `missing`, `wrong-target`, `chain`, and `collision`, plus summary counts and a timestamp.
- Merge and retire targets that resolve to the homepage, `404`, or a different top-level section are surfaced as warnings for soft-404 review.
- The script computes the indexed-URL change-rate formula explicitly and reports both:
  - early warning at `>= 5%`
  - mandatory edge-redirect requirement at `> 5%`
- When `src/content/` has no Markdown content yet, the checker enters scaffold mode, still validates manifest/report generation, and exits cleanly without pretending route-level parity has already been proven.

## Impact

- Phase 3 now has a concrete URL parity gate that CI and later phases can call directly.
- The current scaffold report keeps the redirect-layer decision visible by reporting a 39.1% indexed-URL change rate (`131 / 335`).
- Phase 4 can extend this script instead of inventing a separate baseline from scratch.

## Verification

- Ran `hugo --minify --environment production` successfully.
- Ran `npm run check:url-parity` successfully on the current scaffold; generated `migration/url-parity-report.json` with `scaffold_mode: true` and zero hard failures.
- Ran isolated fixture validation with environment overrides:
  - passing keep-plus-merge case exited `0`
  - missing keep-route case exited `1`
  - homepage merge target emitted `soft-404-homepage` warning evidence

## Related files

- `scripts/check-url-parity.js`
- `package.json`
- `migration/url-parity-report.json`
- `docs/migration/RUNBOOK.md`
- `analysis/tickets/phase-3/RHI-025-url-parity-redirect-baseline.md`
- `analysis/tickets/phase-3/INDEX.md`