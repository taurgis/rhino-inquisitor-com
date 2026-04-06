# Pages AVIF Build Contract - 2026-04-06

## Change summary

Updated the GitHub Pages deployment path so the Phase 7 gate runner now uses the repository npm build scripts for production and preview artifacts, and hardened the workflow runtime so Sharp optional binaries and AVIF support are validated on GitHub Actions before deployment continues.

## Why this changed

The repository added automatic AVIF generation to the npm build scripts, but the actual GitHub Pages deploy path still rebuilt artifacts with raw Hugo commands inside the Phase 7 gate runner. That meant staging and deploy artifacts could bypass AVIF generation even though local and direct npm builds included it.

## Behavior details

Old behavior:

- `scripts/phase-7/run-all-gates.sh` built production and preview artifacts with direct `hugo --cleanDestinationDir --gc --minify ...` commands.
- Those raw Hugo commands bypassed the npm build scripts that run `generate:avif-cache` before Hugo.
- The deploy workflow installed dependencies with a plain `npm ci` step and did not explicitly prove Sharp could generate AVIF on the GitHub Actions runner.

New behavior:

- `package.json` now exposes a dedicated `build:preview-pages` script for preview-host builds that require an injected `PREVIEW_BASE_URL`.
- `build:prod`, `build:staging`, and `build:local` now include the same clean-destination and garbage-collection flags expected by the Phase 7 CI contract.
- `scripts/phase-7/run-all-gates.sh` now calls `npm run build:prod` for the production validation artifact and `npm run build:preview-pages` for the preview rehearsal artifact.
- `.github/workflows/deploy-pages.yml` now installs Node dependencies with `npm ci --include=optional` so Sharp’s Linux optional packages are included explicitly.
- `.github/workflows/deploy-pages.yml` now runs a small Sharp AVIF smoke test on ubuntu-latest before the blocking deployment gates.

## Impact

- Local builds, CI production validation builds, and preview deploy artifacts now share the same AVIF-aware build contract.
- Staging and GitHub Pages artifacts no longer bypass AVIF generation due to direct Hugo invocation in the gate runner.
- GitHub Actions now fails early if the Linux runner cannot load Sharp or generate AVIF output.
- The preview build path keeps its dynamic Pages base URL instead of reusing the fixed staging-host npm script.

## Verification

- Run `npm run build:prod` and confirm the production build still completes and includes generated AVIF sources in built HTML.
- Run `PREVIEW_BASE_URL=https://staging.rhino-inquisitor.com/ npm run build:preview-pages` and confirm the preview build completes with preview-host behavior intact.
- Run `npm run check:seo:artifact` after a build and confirm the production artifact still passes the SEO smoke gate.
- In GitHub Actions, confirm the `Verify Sharp AVIF runtime` step passes before the blocking deployment gates run.
- After deployment, inspect a staging page with a local image and confirm it emits `<picture>` with an `image/avif` source.

## Related files

- `.github/workflows/deploy-pages.yml`
- `scripts/phase-7/run-all-gates.sh`
- `package.json`
- `scripts/generate-avif-cache.js`