# Node Runtime Alignment - 2026-03-12

## Change summary

The repository runtime contract now requires Node 20.18.1 or newer in both `package.json` and the GitHub Actions build and deploy workflows.

## Why this changed

The metadata validation gate was crashing in GitHub Actions before running any SEO assertions because the workflow still installed dependencies on Node 18 while the current dependency set already required Node 20+. The immediate failure surfaced in `npm run check:metadata` through `cheerio` and `undici`, and the repository also includes `file-type@21.3.1`, which requires Node 20.

## Behavior details

Old behavior:

- `package.json` declared Node `>=18`.
- `.github/workflows/build-pr.yml` and `.github/workflows/deploy-pages.yml` ran `actions/setup-node` with Node 18.
- `npm ci` could install a dependency tree whose engine requirements exceeded the workflow runtime, causing runtime crashes in build-time checks such as `npm run check:metadata`.

New behavior:

- `package.json` declares Node `>=20.18.1`.
- `.github/workflows/build-pr.yml` and `.github/workflows/deploy-pages.yml` set `NODE_VERSION` to `20.18.1`.
- CI now uses a runtime that satisfies the current direct and transitive dependency engine floor before running Hugo validation, metadata validation, and Pages deployment checks.

## Impact

- Restores the metadata gate as a real SEO signal instead of a runtime compatibility failure.
- Aligns local and CI expectations with the repository's current dependency set.
- Preserves the existing Hugo build contract, Pages artifact flow, and deploy job structure.

## Verification

- Run `npm ci` on Node 20.18.1 or newer and confirm dependency installation succeeds without engine mismatches.
- Run `npm run build:prod` and `npm run check:metadata` on Node 20.18.1 or newer.
- Confirm the PR build workflow and Pages deploy workflow both use `NODE_VERSION: 20.18.1` and complete the metadata validation step successfully.

## Related files

- `package.json`
- `.github/workflows/build-pr.yml`
- `.github/workflows/deploy-pages.yml`
