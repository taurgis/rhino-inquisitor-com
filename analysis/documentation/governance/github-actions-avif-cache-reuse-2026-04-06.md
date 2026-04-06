# GitHub Actions AVIF Cache Reuse - 2026-04-06

## Change summary

Updated the GitHub Pages deploy workflow to cache generated AVIF derivatives between workflow runs and hardened the AVIF generator so restored files are reused by content fingerprint instead of file modification times.

## Why this changed

The Pages workflow was regenerating the AVIF cache on fresh GitHub-hosted runners even when the source image set had not changed. The repository already kept generated AVIF files under `src/assets/generated-avif`, but the generator decided reuse only from source and target mtimes, which is not reliable after a cache restore on a new runner. The workflow now restores that directory before the build and refreshes it only when the image tree or generator inputs change.

## Behavior details

Old behavior:

- GitHub Actions started from an empty runner workspace on each run and had no persisted AVIF derivative cache.
- `scripts/generate-avif-cache.js` reused outputs only when the source image mtime was newer than the target AVIF mtime.
- Fresh workflow runs often had to re-encode unchanged images because restored runner timestamps were not part of the contract.

New behavior:

- `.github/workflows/deploy-pages.yml` computes an AVIF source-tree fingerprint, restores `src/assets/generated-avif` with `actions/cache`, and reuses the latest compatible cache via restore keys.
- The cache key varies when the source image tree changes, the AVIF generator changes, the lockfile changes, or the manual cache version is bumped.
- `scripts/generate-avif-cache.js` now writes a manifest inside `src/assets/generated-avif` that records per-source content fingerprints and expected outputs.
- Restored AVIF files are reused only when the manifest fingerprint matches the current source bytes and all expected derivative files exist.
- Stale generated AVIF files for removed or reshaped sources are pruned during generation to keep the cache bounded.

## Impact

- Warm GitHub Actions runs can restore the generated AVIF directory and skip re-encoding unchanged images.
- When only a subset of source images changes, only those images should be regenerated while the rest remain cached.
- Preview and production builds remain separate host-state artifacts; only the shared pre-build AVIF derivatives are cached.
- If the cache is missing or incompatible, the workflow still falls back to full regeneration and produces the same final artifact.

## Verification

- Run `npm run generate:avif-cache` twice in a row and confirm the second run reports cached sources instead of regenerated ones.
- Run `npm run build:prod` and confirm the production build still succeeds with the manifest-backed generator.
- Trigger the Pages workflow twice on unchanged image inputs and confirm the second run restores the generated AVIF cache.
- Modify one tracked source image, rerun the workflow, and confirm the cache restores but only changed-image derivatives are regenerated.

## Related files

- `.github/workflows/deploy-pages.yml`
- `scripts/generate-avif-cache.js`