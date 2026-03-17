# Phase 3 Performance Baseline Retirement

## Change summary

Retired the scaffold-only `Phase 3 Performance Baseline` post from active site output, removed its route from current accessibility checks, and aligned active migration guidance with the current representative article and taxonomy routes.

## Why this changed

The removed post was an internal Phase 3 scaffold fixture rather than production-intent content. Keeping it in active checks and migration guidance created a stale dependency on a route that no longer reflects the current site baseline.

## Behavior details

### Old behavior

- The site published `/phase-3-performance-baseline/` from scaffold fixture content.
- `.pa11yci.json` used that route as an active accessibility baseline target.
- `docs/migration/RUNBOOK.md` and `docs/migration/ASSET-POLICY.md` documented the fixture route as a representative baseline page.
- Historical Phase 3 and Phase 8 evidence referenced the route as a successful preview-host fixture or a local-only parity exception.

### New behavior

- The scaffold fixture content is removed, so `/phase-3-performance-baseline/` now retires with a 404 in production output.
- Active accessibility coverage no longer targets the retired scaffold route.
- Active performance/runbook guidance now references `/sending-emails-from-sfcc/` and `/category/technical/`, matching the current Lighthouse CI baseline.
- Historical sign-off, audit, and parity artifacts remain unchanged as dated evidence snapshots and are superseded for current-state operations by this note.

## Impact

- Affects active accessibility checks, migration runbook guidance, and generated site output for the retired scaffold route.
- Removes a scaffold-only article from homepage, posts, category, sitemap, and canonical output on future production builds.
- Preserves historical audit traceability by avoiding retroactive edits to dated sign-off and report artifacts.
- No redirect is added for the retired route; requests for `/phase-3-performance-baseline/` are expected to resolve as 404.

## Verification

- Run `npm run build:prod`.
- Run `npm run check:a11y`.
- Run `npm run check:seo`.
- Confirm `public/phase-3-performance-baseline/index.html` is absent after the production build.
- Confirm active checks no longer reference `/phase-3-performance-baseline/` and that active performance docs now reference `/sending-emails-from-sfcc/` and `/category/technical/`.

## Related files

- `.pa11yci.json`
- `docs/migration/RUNBOOK.md`
- `docs/migration/ASSET-POLICY.md`
- `src/content/posts/phase-3-performance-baseline/index.md`
- `src/content/posts/phase-3-performance-baseline/hero.png`

## Historical evidence preserved

The following files remain unchanged and should be read as historical snapshots taken before the retirement decision:

- `migration/phase-3-signoff.md`
- `migration/reports/phase-8-article-fidelity-critical-rerun-2026-03-17.csv`
- `analysis/documentation/phase-8/article-fidelity-critical-rerun-2026-03-17.md`
- `analysis/documentation/phase-8/article-fidelity-reaudit-2026-03-17.md`