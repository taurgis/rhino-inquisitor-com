# Phase 8 Lighthouse CI Reports

RHI-088 replaces the Phase 8 bootstrap placeholder with committed Lighthouse CI filesystem output for the sampled homepage, first sampled post, and first sampled category.

## Layout

- `mobile/` contains the blocking mobile-profile LHCI manifest plus JSON and HTML reports.
- `desktop/` contains the blocking desktop-profile LHCI manifest plus JSON and HTML reports.

## Current status

- The Phase 8 LHCI implementation is wired and both profiles archive correctly.
- The current branch-state run passed all Lighthouse category thresholds for the sampled routes.
- RHI-088 remains open because `validation/performance-budget-report.json` recorded blocking budget overruns on the homepage and first sampled post, which require owner-approved remediation through the RC re-cut path defined in the ticket scope.