# SEO Check Build Contract - 2026-03-12

## Change summary

`npm run check:seo` now rebuilds the production Hugo output before running `scripts/check-seo.js`. This removes false failures caused by validating stale files already present under `public/`.

## Why this changed

The SEO validator reads built HTML, `robots.txt`, and `sitemap.xml` from `public/`. When source templates were already correct but `public/index.html` was out of date, the gate could still fail with homepage-level errors such as missing `WebSite` JSON-LD even though the current Hugo source would render the schema correctly.

## Behavior details

Old behavior:

- `npm run check:seo` only executed `node scripts/check-seo.js`.
- The command depended on whatever `public/` content happened to exist from an earlier build.
- Maintainers and CI had to remember to run `npm run build:prod` first to avoid stale-artifact false negatives.

New behavior:

- `npm run check:seo` now runs `npm run build:prod && node scripts/check-seo.js`.
- The gate validates the current production render of homepage JSON-LD, page metadata, sitemap routes, and `robots.txt`.
- The README command reference now makes the build-before-validate behavior explicit.

## Impact

- SEO smoke validation is now self-contained and no longer depends on pre-existing `public/` state.
- Homepage `WebSite` JSON-LD regressions are checked against fresh Hugo output instead of leftover build artifacts.
- The command now matches the repository pattern already used by `check:security`, `check:a11y`, and `check:perf`, which build before validating.

## Verification

- Run `npm run check:seo` and confirm it triggers `build:prod` before the validator output.
- Confirm the command exits with code `0` on the current repository state.
- Confirm `public/index.html` contains the homepage `WebSite` JSON-LD block after the build completes.

## Related files

- `package.json`
- `README.md`