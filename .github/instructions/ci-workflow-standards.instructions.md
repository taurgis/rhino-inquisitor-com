---
description: 'Enforce CI workflow standards, required quality gates, and safe deployment practices for all GitHub Actions workflow files in this repository'
applyTo: '.github/workflows/**'
---

# CI Workflow Standards

## Mandatory Pre-Step

Before authoring or modifying any workflow file, review the GitHub Pages deployment contract in `plan/details/phase-7.md` and the validation gate contract in `plan/details/phase-2.md`.

## Security and Permissions

1. Every workflow must declare `permissions` explicitly at the top level. Never omit it (implicit `write-all` is a security risk).
2. Use **minimum required permissions**:
   - Build-only jobs: `contents: read`
   - Pages deployment: `contents: read`, `pages: write`, `id-token: write`
3. Never grant `write` permissions to `pull_request` workflows triggered from forks.
4. Secrets must be referenced as `${{ secrets.NAME }}` — never hard-coded in workflow files.
5. Third-party actions must be pinned to a full commit SHA for security-sensitive operations (e.g., `actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683`). Use verified version tags for well-known actions (e.g., `actions/checkout@v4`).

## Deployment Workflow Rules

1. Pages deployment must use the official triple in order:
   ```
   actions/configure-pages
   actions/upload-pages-artifact (artifact name: github-pages)
   actions/deploy-pages
   ```
2. Deploy job must reference `environment: github-pages` for OIDC token scoping.
3. `concurrency.cancel-in-progress` must be `false` for the deploy job:
   ```yaml
   concurrency:
     group: pages
     cancel-in-progress: false
   ```
4. Hugo version must be pinned via `HUGO_VERSION` env var — never use `latest`.
5. Build command must be `hugo --minify --environment production` — no draft/future/expired flags.
6. Artifact path must be `./public`.
7. `fetch-depth: 0` on checkout if Hugo uses `.GitInfo` or `.Lastmod` from Git history.

## Required Quality Gates (Run Before Deploy)

Every deployment workflow must include these gates as blocking steps — failure must prevent deployment:

| Gate | Script / Tool | Phase |
|------|--------------|-------|
| Hugo production build | `hugo --minify --environment production` | 3 |
| Front matter validation | `npm run validate:frontmatter` | 3 |
| URL parity check | `npm run check:url-parity` | 3 |
| Broken link check | `npm run check:links` | 8 |
| SEO smoke check | `npm run check:seo` | 8 |

Gates must be `needs:` dependencies of the deploy job — not parallel with it.

## PR / Build Workflow Rules

1. Build validation must run on every PR to `main`.
2. Lint and validate Markdown files with `markdownlint-cli2` before content merges.
3. Front matter validation must run on any PR touching `content/**`.
4. URL parity check must run on any PR touching `content/**`, `layouts/**`, or `hugo.toml`.
5. Never auto-merge PRs that fail any quality gate.

## Workflow Structure Standards

```yaml
name: Descriptive Workflow Name
on:
  push:
    branches: [main]
  workflow_dispatch:      # Always include for manual triggering

permissions:
  contents: read          # Declare explicitly; extend only as needed

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true   # OK for build/test; must be false for deploy

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      # Steps here

  deploy:
    needs: build
    # ... deploy steps
```

## Caching

1. Cache Hugo module downloads and the Hugo binary when using Hugo Modules.
2. Cache `node_modules` keyed on `package-lock.json` hash for script steps.
3. Use `actions/cache@v4` — do not roll custom cache implementations.

## Artifact Retention

1. Retain build artifacts (`public/`) for at least 7 days on main branch builds for rollback capability.
2. Retain migration report artifacts (`migration/migration-report.json`, `migration/url-parity-report.json`) for audit trail.

## Rollback Plan

Every deployment workflow must have a documented rollback path:
1. Identify the last good artifact SHA in the Actions run history.
2. Re-run the deploy job from that run — do not re-run only the build job.
3. Record the rollback decision in `monitoring/launch-cutover-log.md`.

## When This Is Not Required

- Workflow files that are entirely read-only CI checks (no deploy steps) are exempt from the Pages deployment rules but must still follow security and permissions standards.

## References

- `plan/details/phase-7.md` — Pages deployment and domain cutover requirements
- `plan/details/phase-2.md` — Validation gate contract (Section: Required Validation Gates)
- `plan/details/phase-8.md` — Launch readiness CI gate requirements
- [GitHub Actions security hardening](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions)
- [actions/deploy-pages](https://github.com/actions/deploy-pages)
- [actions/upload-pages-artifact](https://github.com/actions/upload-pages-artifact)
- [GitHub Pages custom workflow docs](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
