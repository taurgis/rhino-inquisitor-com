# RHI-029 CI/CD and Deployment Scaffolding - 2026-03-09

## Change summary

Added the Phase 3 GitHub Pages CI/CD scaffold: a deploy workflow, a PR validation workflow, an internal link checker wired into `package.json`, and runbook guidance for deployment, rollback, and post-cutover Search Console follow-up.

## Why this changed

Phase 3 needed a repo-owned deployment surface that turns the existing local checks into reproducible CI gates before any artifact can reach GitHub Pages. Without that workflow layer, the scaffold had quality checks but no auditable deployment path or PR validation contract.

## Behavior details

Old behavior:

- The repository had no `.github/workflows/` deployment or PR validation workflows.
- Internal broken links in generated HTML were not checked by a repo-owned gate.
- Deployment and rollback steps for GitHub Pages existed only in the ticket and phase plans, not in the operational runbook.

New behavior:

- `.github/workflows/deploy-pages.yml` now builds the site with a pinned Hugo version, runs blocking Phase 3 gates, adds `.nojekyll`, uploads audit artifacts, and publishes the Pages artifact through the official Pages actions.
- `.github/workflows/build-pr.yml` now validates every PR to `main`, lints changed Markdown files with `markdownlint-cli2`, and runs route-sensitive URL parity, SEO, and internal-link checks only when the affected paths change.
- `scripts/check-links.js` now scans generated HTML for internal `href` targets and fails on missing `public/` paths.
- `package.json` now exposes `npm run check:links`, and the repo includes a minimal `.markdownlint-cli2.jsonc` config so the PR workflow can lint changed Markdown without the existing long-line docs style becoming noise.
- `docs/migration/RUNBOOK.md` now documents the deployment trigger paths, local gate reproduction commands, rollback path, staged-gate handling, and Search Console follow-up steps.

## Impact

- Phase 3 now has a concrete CI/CD scaffold that can gate GitHub Pages deployments instead of relying on manual local execution.
- PRs to `main` now have a documented baseline for build, front matter, Markdown, SEO, URL parity, and internal-link validation.
- Accessibility and performance remain explicitly staged, non-deploy-blocking jobs in Phase 3 instead of being silently omitted.

## Verification

- Ran `hugo --cleanDestinationDir --minify --environment production` successfully.
- Ran `npm run validate:frontmatter` successfully.
- Ran `npm run check:seo` successfully.
- Ran `npm run check:links` successfully.
- Ran `npm run check:url-parity` successfully after aligning the script with the Phase 3 scaffold-fixture contract. The run wrote `migration/url-parity-report.json` with `scaffold_mode: true`, zero hard failures, and the previously documented 39.1% indexed URL change rate warning.
- Local editor validation accepts the workflow structure, permissions, and action ordering, but still flags the literal `github-pages` environment value even though that is the official GitHub Pages deployment environment name used by the ticket and official docs. This remains a local schema false-positive to watch when the workflow is first pushed.
- GitHub-only validation still pending:
  - first `workflow_dispatch` deploy run URL
  - deployed Pages URL from `actions/deploy-pages`
  - repository Pages custom-domain and HTTPS settings verification

## Related files

- `.github/workflows/deploy-pages.yml`
- `.github/workflows/build-pr.yml`
- `scripts/check-links.js`
- `package.json`
- `package-lock.json`
- `.markdownlint-cli2.jsonc`
- `docs/migration/RUNBOOK.md`
- `analysis/tickets/phase-3/RHI-029-cicd-deployment-scaffolding.md`
