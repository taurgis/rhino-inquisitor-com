# 404 Artifact Consolidation - 2026-04-05

## Change summary

Consolidated the repository’s 404 implementation to remove redundant 404 layout files and standardize on one authored validation route plus a build-time sync for the root GitHub Pages error document.

## Why this changed

The repository had accumulated multiple 404 layout files with duplicated markup even though Hugo was not selecting those templates in clean builds. Debug output showed `src/layouts/404.html` as unused, while clean artifact builds only emitted `/404/` from the content-backed route. That left the repository with duplicate 404 template ownership and an unreliable root `public/404.html` artifact after a clean build.

## Behavior details

Old behavior:

- The repo contained `src/layouts/404.html`, `src/layouts/_default/404.html`, and `src/layouts/page/404.html`, all with duplicated 404 body markup.
- The repo also contained two content-backed 404 routes: `src/content/404.md` and `src/content/404-html.md`.
- Clean builds did not reliably emit `public/404.html` from the Hugo 404 template path even though the special template file existed.

New behavior:

- `src/content/404.md` remains the single authored 404 page source and still owns the browsable `/404/` validation route.
- The dedicated 404 layout files were removed because they were redundant and not selected by the current Hugo build path.
- A build-time sync script now copies `public/404/index.html` to `public/404.html` so GitHub Pages still receives a root error document in every real build path.
- The real build entrypoints in `package.json`, `.github/workflows/build-pr.yml`, and `scripts/phase-7/run-all-gates.sh` now all run the same `sync:404-artifact` step after Hugo renders HTML.

## Impact

- Maintainers now have one clear authored 404 source instead of multiple duplicated layout wrappers.
- Clean builds once again produce both `public/404/index.html` and `public/404.html`.
- The repository no longer depends on stale `public/404.html` artifacts lingering from earlier builds.

## Verification

1. Remove `public/404.html` and `public/404/index.html`.
2. Run `npm run build:prod`.
3. Confirm both `public/404/index.html` and `public/404.html` exist after the build.
4. Run `npm run check:seo:artifact`.
5. Run `npm run check:crawl-controls`.
6. Run `npm run check:internal-links`.
7. Confirm `/404/` and `/404.html` both remain `noindex, nofollow` in the emitted artifact.

## Related files

- `src/content/404.md`
- `scripts/seo/sync-404-artifact.js`
- `package.json`
- `scripts/phase-7/run-all-gates.sh`
- `.github/workflows/build-pr.yml`