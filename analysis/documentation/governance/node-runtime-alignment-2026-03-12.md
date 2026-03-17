# Node Runtime Alignment - 2026-03-12

## Change summary

The repository runtime contract now requires Node 20.18.1 or newer for repo tooling, and the GitHub Actions workflows now use Node 24-capable majors for the repo-controlled helper actions that check out code, install Node, restore caches, and upload artifacts.

## Why this changed

The earlier runtime floor correction fixed broken validation by moving repo tooling off Node 18, but the workflows still referenced older helper-action majors. This follow-up keeps the repository toolchain pinned to Node 20.18.1 while reducing action-runtime drift and Node 20 deprecation noise for the repo-controlled GitHub JavaScript actions.

## Behavior details

Old behavior:

- `package.json` declared Node `>=18`, and the GitHub Actions workflows installed dependencies on Node 18.
- After the Node 20.18.1 floor correction, `.github/workflows/build-pr.yml` still pinned helper actions to `actions/checkout@v4`, `actions/setup-node@v4`, `actions/cache@v4`, and `actions/upload-artifact@v4`.
- The PR workflow relied on older helper-action runtimes even though the repo toolchain had already been aligned to Node 20.18.1.

New behavior:

- `package.json` declares Node `>=20.18.1`.
- `.github/workflows/build-pr.yml` and `.github/workflows/deploy-pages.yml` keep `NODE_VERSION` at `20.18.1` for repository scripts.
- `.github/workflows/build-pr.yml` now uses `actions/checkout@v5`, `actions/setup-node@v5`, `actions/cache@v5`, and `actions/upload-artifact@v6`.
- `actions/setup-node@v5` is configured with `package-manager-cache: false` so the workflow continues to use the existing explicit npm and `node_modules` cache steps instead of implicit cache behavior.
- `.github/workflows/deploy-pages.yml` already follows the same helper-action major alignment while keeping the official Pages action trio on their current majors.

## Impact

- Keeps PR validation behavior unchanged while moving repo-controlled helper actions onto Node 24-capable releases.
- Preserves the existing Hugo build contract, explicit npm cache contract, and artifact retention behavior.
- Reduces action-runtime deprecation noise without changing PR gate selection, Pages artifact flow, or deployment sequencing.

## Verification

- Confirm `.github/workflows/build-pr.yml` uses `actions/checkout@v5`, `actions/setup-node@v5`, `actions/cache@v5`, and `actions/upload-artifact@v6` everywhere those helper actions appear.
- Confirm each `setup-node` step in `.github/workflows/build-pr.yml` sets `package-manager-cache: false` alongside `NODE_VERSION: 20.18.1`.
- Run the Build Pull Requests workflow via `workflow_dispatch` or on a PR and confirm the `prepare`, `build`, `migration-batch-validation`, `accessibility`, and `performance` jobs stay green.
- Run the Deploy to GitHub Pages workflow and confirm its helper-action majors remain aligned while the official Pages action trio remains unchanged.

## Related files

- `package.json`
- `.github/workflows/build-pr.yml`
- `.github/workflows/deploy-pages.yml`
