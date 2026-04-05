# Performance Gate LHCI Route Hardening - 2026-04-05

## Change summary

Hardened the Phase 8 Lighthouse gate so representative performance URLs are derived from `validation/sample-matrix.json` instead of relying on a separate hardcoded URL list in the static LHCI config.

## Why this changed

The performance gate intermittently failed with `Missing representative LHCI run for /real-time-inventory-checks-in-sfcc/ on mobile profile`. The gate validator already derives its required homepage, article, and category routes from the sample matrix, but Lighthouse collection still used a separate hardcoded URL list from `lighthouserc.json`. That created a dual source of truth and made investigation of missing-profile artifacts harder. At the same time, native article speculation was still using `moderate` eagerness, which is more likely to create extra mobile lab traffic than the conservative rollout requires.

## Behavior details

Old behavior:

- `scripts/phase-8/run-lhci.js` always ran LHCI against the static URLs declared in `lighthouserc.json`.
- `scripts/phase-8/check-performance-budget.js` independently derived the required routes from `validation/sample-matrix.json`.
- Post detail pages used `moderate` native article speculation.

New behavior:

- `scripts/phase-8/run-lhci.js` now reads `validation/sample-matrix.json`, derives the representative homepage, recent article, and category URLs from the same dataset the budget validator expects, and writes a generated LHCI config per profile run.
- The generated LHCI config also sets `collect.settings.maxWaitForLoad` to bound route-load waits during lab collection.
- `scripts/phase-8/run-performance-gates.js` now passes the chosen sample-matrix path through to LHCI collection, keeping collection and validation aligned.
- Post detail pages now emit native article speculation with `conservative` eagerness.

## Impact

- LHCI collection and performance-budget validation now share a single route-selection source of truth.
- Future sample-matrix changes no longer require manual synchronized edits to the Lighthouse collection URL list for the Phase 8 gate path.
- Mobile article lab runs are less likely to generate speculative navigation work during Lighthouse collection.

## Verification

- Run `npm run build:prod`.
- Run `npm run check:perf:gate` and confirm the LHCI logs print the derived representative URLs for each profile.
- Confirm the generated performance report no longer fails because the collected article route and the expected sample-matrix article route drift apart.
- Run `npm run check:seo:artifact`, `npm run check:crawl-controls`, and `npm run check:internal-links` to confirm the native speculation eagerness adjustment does not regress existing SEO gates.

## Related files

- `scripts/phase-8/run-lhci.js`
- `scripts/phase-8/run-performance-gates.js`
- `lighthouserc.json`
- `validation/sample-matrix.json`
- `src/layouts/partials/seo/speculation-rules.html`