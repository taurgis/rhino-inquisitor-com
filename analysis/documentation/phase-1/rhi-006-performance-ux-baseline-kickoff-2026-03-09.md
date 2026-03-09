# RHI-006 Performance and UX Baseline Kickoff - 2026-03-09

## Change summary

Started implementation of RHI-006 by replacing the performance baseline script stub with a working collector and generating the first baseline snapshot in `migration/phase-1-performance-baseline.md`.

## Why this changed

Phase 1 Workstream 5 requires measurable pre-migration performance and UX baselines. Without concrete baseline evidence, Phase 3 optimization work and Phase 8 launch-readiness checks cannot be compared against a consistent starting point.

## Behavior details

Old behavior:

- `scripts/perf-baseline.js` was a bootstrap stub and did not collect or write any metrics.
- `migration/phase-1-performance-baseline.md` did not exist.
- RHI-006 ticket remained `Open` with no execution evidence.

New behavior:

- `scripts/perf-baseline.js` now:
  - Runs Lighthouse CLI for each required template URL on mobile and desktop profiles.
  - Captures lab metrics: LCP, INP/FID fallback, CLS, TTFB.
  - Captures payload metrics: total KB, JS KB, image KB from Lighthouse resource totals.
  - Runs a lightweight accessibility quick-pass (landmarks, heading hierarchy, missing alt count, keyboard-nav heuristic).
  - Queries CrUX with layered fallback: URL-level -> origin with form factor -> aggregate origin without form factor.
  - Generates `migration/phase-1-performance-baseline.md` and stores raw Lighthouse evidence in `tmp/phase-1-perf-baseline/`.
- `analysis/tickets/phase-1/RHI-006-performance-ux-baseline.md` moved to `In Progress` with completed task and acceptance items for generated evidence.

## Impact

- Repository now has a reproducible performance baseline capture workflow for RHI-006.
- Baseline evidence exists for all required template types across both device profiles.
- Remaining blocker to close RHI-006 is migration-owner review/approval.
- CrUX fallback behavior is explicitly documented, so low-coverage URL data does not block baseline completion.

## Verification

- Ran `npm run phase1:perf-baseline` with `CRUX_API_KEY` in environment.
- Confirmed script output:
  - `migration/phase-1-performance-baseline.md`
  - `tmp/phase-1-perf-baseline/*.json` (10 files)
- Confirmed RHI-006 ticket checklist and status updates reflect current execution state.
- Confirmed no API key string is present in generated or updated tracked files.

## Related files

- `scripts/perf-baseline.js`
- `migration/phase-1-performance-baseline.md`
- `analysis/tickets/phase-1/RHI-006-performance-ux-baseline.md`
- `tmp/phase-1-perf-baseline/`
