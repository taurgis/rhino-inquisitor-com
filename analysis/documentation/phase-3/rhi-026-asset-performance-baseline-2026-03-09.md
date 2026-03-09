# RHI-026 Asset and Performance Baseline - 2026-03-09

## Change summary

Added the Phase 3 asset-policy baseline, local performance gate wiring, representative scaffold fixtures, and a minimal Hugo image-rendering path so asset handling and Lighthouse checks are reproducible before Phase 4 migration begins.

## Why this changed

Phase 3 needed an explicit asset policy and a local, repeatable performance gate before importing real WordPress media. Without that baseline, later phases would inherit image-dimension drift, uncontrolled scripts, and untracked payload growth.

## Behavior details

Old behavior:

- No Phase 3 asset policy document existed.
- No `check:perf` script or Lighthouse CI configuration existed for scaffold output.
- The scaffold had no deterministic published post/page fixtures for local performance checks.
- Template images were not routed through a repo-owned performance-safe partial.

New behavior:

- `docs/migration/ASSET-POLICY.md` defines the baseline image strategy, payload budgets, JavaScript policy, representative routes, and validation commands.
- `package.json` now exposes `build:prod`, `check:perf:budget`, and `check:perf`.
- `scripts/check-perf-budget.js` enforces representative-page JS, CSS, and image budgets, rejects uncontrolled third-party scripts, and fails if generated `<img>` tags lack explicit width/height.
- `lighthouserc.json` runs Lighthouse CI against the built static output in `public/` using `staticDistDir`.
- The scaffold now includes one published post, one published page, and the generated `platform` category route for deterministic local checks.
- `src/layouts/partials/media/image.html` centralizes scaffold image rendering and enforces dimension-safe output for local Hugo image resources.

## Impact

- Phase 3 now has a repeatable performance command surface that later CI and release work can build on.
- Scaffold image handling has one sanctioned path instead of ad hoc template markup.
- The repository now documents the difference between field CWV targets and the lab proxy used in Phase 3 (`total-blocking-time` for INP).

## Verification

- Run `npm run build:prod`.
- Run `npm run check:perf:budget`.
- Run `npm run check:perf`.
- Review the generated report output in `tmp/lhci/`.

## Related files

- `package.json`
- `lighthouserc.json`
- `scripts/check-perf-budget.js`
- `docs/migration/ASSET-POLICY.md`
- `docs/migration/RUNBOOK.md`
- `src/layouts/partials/media/image.html`
- `src/layouts/home.html`
- `src/layouts/_default/single.html`
- `src/layouts/partials/content-list.html`
- `src/content/posts/phase-3-performance-baseline/index.md`
- `src/content/pages/scaffold-readiness/index.md`
- `analysis/tickets/phase-3/RHI-026-asset-performance-baseline.md`