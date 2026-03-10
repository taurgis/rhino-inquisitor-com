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

Update on 2026-03-10:

- The original deploy workflow validated a production artifact and then uploaded that same artifact to the GitHub Pages project-site host. Because the preview host lives under `/rhino-inquisitor-com/`, root-relative asset paths such as `/styles/site.css` resolved incorrectly and produced 404s on the deployed rehearsal site.
- The deploy workflow now keeps the production validation build for gates, archives that output separately, then rebuilds the uploaded Pages artifact with `--environment preview` and the Pages-provided `base_url`. This makes the deployed rehearsal artifact path-prefix-correct and restores preview-host `noindex` behavior without changing the canonical production `baseURL` in `hugo.toml`.

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
- Confirmed a successful public GitHub Actions deploy run at `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/22871838125` (`Deploy to GitHub Pages #3`, commit `2217b65aaeb89f474a33c12b7c9e14d0adf0f3f2`).
- Confirmed the deployed Pages site is reachable at `https://taurgis.github.io/rhino-inquisitor-com/`.
- Local editor validation accepts the workflow structure, permissions, and action ordering, but still flags the literal `github-pages` environment value even though that is the official GitHub Pages deployment environment name used by the ticket and official docs. This remains a local schema false-positive to watch when the workflow is first pushed.
- Owner closeout decision:
  - repository owner requested ticket completion after successful public deploy validation
  - custom-domain and HTTPS settings are treated as owner-confirmed for this ticket closeout, with operational follow-through remaining relevant in Phase 7 cutover work

Additional verification on 2026-03-10:

- Confirmed the broken deployed CSS path root cause in the rendered output: the preview host was serving a production-shaped artifact with `/styles/site.css` instead of the project-site-prefixed path.
- Updated `.github/workflows/deploy-pages.yml` so the production validation build remains unchanged, but the uploaded rehearsal artifact is rebuilt with `hugo --gc --minify --environment preview --baseURL "${{ steps.pages.outputs.base_url }}/"`.
- Added workflow verification for preview-host path-prefix correctness and preview `noindex` before the Pages artifact upload step.
- Updated the shared header, footer, homepage hero, taxonomy empty-state/archive links, and SEO image resolver so preview-host builds stop emitting origin-root URLs such as `/images/brand-mark.svg` and `/styles/site.css` that bypass the project-site path prefix.
- Updated `docs/migration/RUNBOOK.md` so local reproduction now distinguishes between the production validation build and the preview-host rehearsal build.

## Related files

- `.github/workflows/deploy-pages.yml`
- `.github/workflows/build-pr.yml`
- `scripts/check-links.js`
- `package.json`
- `package-lock.json`
- `.markdownlint-cli2.jsonc`
- `docs/migration/RUNBOOK.md`
- `analysis/tickets/phase-3/RHI-029-cicd-deployment-scaffolding.md`

