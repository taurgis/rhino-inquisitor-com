# Phase 8 Lighthouse CI Reports

RHI-088 replaces the Phase 8 bootstrap placeholder with committed Lighthouse CI filesystem output for the sampled homepage, first sampled post, and first sampled category.

## Layout

- `mobile/` contains the blocking mobile-profile LHCI manifest plus JSON and HTML reports.
- `desktop/` contains the blocking desktop-profile LHCI manifest plus JSON and HTML reports.

## Current status

- The Phase 8 LHCI implementation is wired and both profiles archive correctly.
- The committed report bundle comes from the `phase-8-rc-v2` re-cut created for RHI-088.
- Both mobile and desktop profiles passed the blocking category thresholds for the sampled homepage, first sampled post, and first sampled category.
- The paired `validation/performance-budget-report.json` now passes the blocking homepage and article budget thresholds, so RHI-088 is closed.