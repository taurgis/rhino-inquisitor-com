# Change summary

The Phase 7 deployment gate script now preserves the preview rehearsal build separately and restores the production build back into `public/` before the GitHub Pages artifact upload step runs.

# Why this changed

The deployment workflow runs a production validation build first, then rebuilds `public/` for preview-host rehearsal checks. Before this update, the last successful preview build remained in `public/`, so the GitHub Pages upload step could publish the preview artifact instead of the validated production artifact.

# Behavior details

Old behavior:

- `scripts/phase-7/run-all-gates.sh` archived the production build into `tmp/ci-prod-public`, then rebuilt `public/` for preview-host checks.
- When all gates passed, the workflow uploaded `./public` to GitHub Pages, which meant the preview rehearsal output could become the deployed artifact.
- The workflow artifacts preserved the production snapshot, but not the final preview build separately.

New behavior:

- `scripts/phase-7/run-all-gates.sh` still archives the validated production build into `tmp/ci-prod-public`.
- After preview rehearsal checks pass, the script archives the preview output into `tmp/ci-preview-public`.
- On script exit after the preview build stage, the production snapshot is restored into `public/` so the Pages upload step uses the production artifact path required by the workflow contract.
- The workflow now uploads `tmp/ci-preview-public` alongside the existing audit artifacts for debugging and parity review.

# Impact

- GitHub Pages deploys now use the validated production Hugo build instead of the preview rehearsal artifact.
- Preview-host output remains available as a separate CI artifact for investigation when preview-only checks fail or differ from production.
- This change reduces the risk of deploy-time crawl-control, base URL, or host-prefix drift caused by publishing the wrong build output.

# Verification

1. Run the Phase 7 gate script and confirm that `tmp/ci-prod-public` and `tmp/ci-preview-public` are both created.
2. After the script completes successfully, verify that `public/robots.txt` and `public/sitemap.xml` still match the production build expectations.
3. Confirm the Pages workflow uploads `./public` and includes `tmp/ci-preview-public` in the audit artifact bundle.
4. Recheck the deployed Pages artifact or downstream staging host to confirm the production crawl surface matches the restored production output.

# Related files

- `.github/workflows/deploy-pages.yml`
- `scripts/phase-7/run-all-gates.sh`