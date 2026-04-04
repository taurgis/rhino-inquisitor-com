# Environment-Aware BaseURL Deploy Selection - 2026-04-04

## Change summary

Updated the Pages deployment flow so the artifact left in `public/` matches the host that GitHub Pages is currently targeting instead of always restoring the production-host artifact before upload.

## Why this changed

The Phase 7 gate script builds both a production validation artifact and a preview or staging rehearsal artifact. Before this change, the script always restored the production build into `public/` when it exited. That meant the GitHub Actions workflow uploaded production-host links even when GitHub Pages was configured for `staging.rhino-inquisitor.com`.

## Behavior details

Old behavior:

- `scripts/phase-7/run-all-gates.sh` always restored the production validation artifact into `public/` on exit after preview validation completed.
- `.github/workflows/deploy-pages.yml` always uploaded `./public`, so staging deployments could still publish production-host canonicals and internal absolute links.
- Local builds depended on manually passing `--baseURL` to Hugo when developers wanted localhost-aware absolute URLs.

New behavior:

- `scripts/phase-7/run-all-gates.sh` now accepts `--deploy-artifact-source` or `PHASE7_DEPLOY_ARTIFACT_SOURCE` with `auto`, `production`, or `preview`.
- In `auto` mode, the gate script keeps the preview artifact in `public/` when the deploy host differs from `https://www.rhino-inquisitor.com/`, and restores the production artifact only when the target base URL is the canonical production host.
- `.github/workflows/deploy-pages.yml` now derives the deploy artifact source from the normalized Pages `base_url`, so staging or preview hosts publish staging-aware links while production keeps production-host output.
- `package.json` now exposes `build:local`, `build:staging`, and `dev` commands so localhost and staging builds can be generated without editing `hugo.toml`.

## Impact

- Staging deployments now publish self-consistent staging-host absolute links, canonicals, sitemap URLs, and related metadata instead of leaking the production host through the uploaded artifact.
- Production deployments still keep `https://www.rhino-inquisitor.com/` as the canonical source of truth in `hugo.toml` and publish the production validation artifact when the deploy host is production.
- Developers have explicit local and staging build entry points for validating absolute URLs outside GitHub Actions.

## Verification

- Run `npm run build:staging` and confirm generated absolute URLs in `public/` use `https://staging.rhino-inquisitor.com/`.
- Run `npm run build:prod` and confirm generated absolute URLs in `public/` use `https://www.rhino-inquisitor.com/`.
- Trigger `.github/workflows/deploy-pages.yml` against a staging-host Pages configuration and confirm the workflow summary reports `Deploy artifact source: environment-aware output for https://staging.rhino-inquisitor.com/`.
- Trigger `.github/workflows/deploy-pages.yml` against a production-host Pages configuration and confirm the workflow summary reports `Deploy artifact source: production validation output.`

## Related files

- `.github/workflows/deploy-pages.yml`
- `scripts/phase-7/run-all-gates.sh`
- `package.json`
- `hugo.toml`