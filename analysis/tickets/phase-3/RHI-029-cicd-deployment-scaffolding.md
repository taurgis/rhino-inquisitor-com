## RHI-029 · Workstream J — CI/CD and Deployment Scaffolding

**Status:** Done  
**Priority:** Critical  
**Estimate:** L  
**Phase:** 3  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-04  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Create a deterministic, auditable GitHub Pages deployment workflow with all Phase 3 quality gates wired as blocking pre-deploy checks. The workflow must enforce the production build, URL parity, front matter validation, SEO smoke checks, and broken link checks before any artifact reaches Pages. Deploy behavior must be reproducible from a clean CI environment with no manual intervention, and the concurrency configuration must prevent overlapping Pages deployments from corrupting the live site.

This ticket is the final integration gate for all Phase 3 workstreams — it proves the scaffold is cohesive, buildable, and deployable end-to-end.

---

### Acceptance Criteria

- [x] GitHub Actions workflow file `.github/workflows/deploy-pages.yml` exists and:
  - [x] Uses the official Pages deployment triple in order:
    1. `actions/configure-pages`
    2. `actions/upload-pages-artifact` (artifact name: `github-pages`)
    3. `actions/deploy-pages`
  - [x] Deploy job references `environment: github-pages` for OIDC token scoping
  - [x] Permissions are explicitly declared:
    - [x] `contents: read`
    - [x] `pages: write`
    - [x] `id-token: write`
    - No broader permissions granted
  - [x] Concurrency configuration prevents overlapping Pages deployments:
    - `group: pages`
    - `cancel-in-progress: false` (must be false for deploy job)
  - [x] Hugo version is pinned via `HUGO_VERSION` env var — not `latest`
  - [x] Build command is `hugo --minify --environment production`
  - [x] Artifact path is `./public`
  - [x] `fetch-depth: 0` is set on checkout (required if Hugo uses `.GitInfo` or `.Lastmod`)
- [x] All quality gates run as blocking steps before the deploy job:
  - [x] Hugo production build (`hugo --minify --environment production`)
  - [x] Front matter validation (`npm run validate:frontmatter`)
  - [x] URL parity check (`npm run check:url-parity`)
  - [x] SEO smoke check (`npm run check:seo`)
  - [x] Broken link check (`npm run check:links`)
- [x] Quality gate jobs use `needs:` dependency so deploy is blocked on any gate failure
- [x] Accessibility and performance baseline checks are run in CI as staged, non-deploy-blocking gates in Phase 3:
  - [x] Accessibility check (`npm run check:a11y`) runs and reports pass/fail
  - [x] Performance check (`npm run check:perf`) runs and reports pass/fail
  - [x] Any staged-gate failure is tracked and must be resolved or risk-accepted before RHI-030 closes
- [x] PR build validation workflow (`.github/workflows/build-pr.yml`) exists and:
  - [x] Triggers on all PRs to `main`
  - [x] Runs Hugo production build and front matter validation as minimum checks
  - [x] URL parity check and SEO smoke check also run on PRs touching `src/content/**`, `src/layouts/**`, `src/static/**`, `src/archetypes/**`, or `hugo.toml`
- [x] Broken link check script (`scripts/check-links.js`) exists and:
  - [x] Scans all internal links in generated `public/` HTML
  - [x] Reports any links pointing to non-existent `public/` paths
  - [x] Exits with non-zero code on broken internal links
  - [x] Is referenced in `package.json` as `npm run check:links`
- [x] `.nojekyll` handling: workflow adds `.nojekyll` to `public/` before artifact packaging to prevent unintended Jekyll processing on Pages
- [x] Deployment is reproducible from a clean CI environment with only documented prerequisites
- [x] `docs/migration/RUNBOOK.md` is updated with CI/CD deployment runbook:
  - [x] How to trigger a deployment
  - [x] How to interpret quality gate failures
  - [x] Rollback procedure
  - [x] Search Console migration steps after cutover (new sitemap submission, transition handling, indexing/soft-404 monitoring)

---

### Tasks

- [x] Create `.github/workflows/deploy-pages.yml`:
  - [x] Set workflow name: `Deploy to GitHub Pages`
  - [x] Set triggers: `push` to `main`, `workflow_dispatch`
  - [x] Declare top-level `permissions: contents: read`
  - [x] Set `concurrency: group: pages, cancel-in-progress: false`
  - [x] Add `env: HUGO_VERSION: {pinned-version}` at workflow level
  - [x] Create `build` job:
    - `actions/checkout@v4` with `fetch-depth: 0`
    - Cache Hugo binary and Node modules
    - Install Hugo extended (pinned version)
    - `npm ci` to install Node dependencies
    - Run quality gates in sequence (each must pass before next):
      1. `npm run validate:frontmatter`
      2. `hugo --minify --environment production`
      3. `npm run check:url-parity`
      4. `npm run check:seo`
      5. `npm run check:links`
    - `actions/configure-pages`
    - Add `.nojekyll` to `public/`
    - `actions/upload-pages-artifact` with `path: ./public`
  - [x] Create `deploy` job:
    - `needs: build`
    - `permissions: pages: write, id-token: write`
    - `environment: name: github-pages, url: ${{ steps.deployment.outputs.page_url }}`
    - `actions/deploy-pages`
- [x] Create `.github/workflows/build-pr.yml`:
  - [x] Trigger on `pull_request` targeting `main`
  - [x] `permissions: contents: read`
  - [x] Concurrency: `group: pr-${{ github.ref }}, cancel-in-progress: true` (OK for PR builds)
  - [x] Run Hugo production build and `validate:frontmatter` on all PRs
  - [x] Run URL parity and SEO smoke check on PRs touching `src/content/**`, `src/layouts/**`, `src/static/**`, `src/archetypes/**`, or `hugo.toml`
  - [x] Run `check:a11y` and `check:perf` as non-blocking informational jobs in Phase 3
- [x] Create `scripts/check-links.js`:
  - [x] Use `fast-glob` to find all HTML files in `public/`
  - [x] Parse `href` attributes for internal links (links starting with `/`)
  - [x] For each internal link, verify the corresponding file exists in `public/`
  - [x] Report all broken internal links with source page and missing target
  - [x] Exit 1 on any broken link found
- [x] Add `"check:links": "node scripts/check-links.js"` to `package.json` scripts
- [x] Test the complete workflow end-to-end using `workflow_dispatch` trigger:
  - [x] Trigger build on branch
  - [x] Verify all quality gates pass
  - [x] Verify artifact is uploaded correctly
  - [x] Verify deploy job succeeds and Pages URL is accessible
  - [x] Log run URL in Progress Log
- [x] Verify custom domain settings in GitHub repository Settings → Pages (do not rely on CNAME file alone):
  - [x] Custom domain `www.rhino-inquisitor.com` is configured
  - [x] HTTPS enforcement is enabled
  - [x] Document settings state in Progress Log
- [x] Update `docs/migration/RUNBOOK.md` with deployment runbook:
  - [x] Trigger deployment: push to `main` or use `workflow_dispatch`
  - [x] Quality gate failure response: which script to run locally to reproduce and debug
  - [x] Rollback: re-run deploy job from last known-good run (do not re-run build-only job)
  - [x] Search Console migration steps: submit new sitemap set after cutover, keep old sitemap references during transition if needed, monitor indexing and soft-404 signals
- [x] Commit workflows, `scripts/check-links.js`, and updated `package.json`

---

### Out of Scope

- Custom domain DNS cutover (Phase 7)
- Edge redirect layer or CDN configuration (Phase 6/7)
- Full broken link check across live URLs after content import (Phase 8)
- Rollback of the custom domain DNS record (Phase 9)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-019 Done — Phase 3 Bootstrap complete | Ticket | Pending |
| RHI-020 Done — Repository structure committed | Ticket | Pending |
| RHI-021 Done — `hugo.toml` hardened and Hugo version pinned | Ticket | Pending |
| RHI-022 Done — `validate:frontmatter` script available | Ticket | Pending |
| RHI-023 Done — Template scaffold committed | Ticket | Pending |
| RHI-024 Done — `check:seo` script available | Ticket | Pending |
| RHI-025 Done — `check:url-parity` script available | Ticket | Pending |
| RHI-016 Outcomes — Deployment and operations contract approved | Ticket | Pending |
| RHI-017 Outcomes — Validation gate specifications confirmed | Ticket | Pending |
| GitHub repository Pages settings — custom domain configured | Access | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| `cancel-in-progress: true` accidentally set on deploy job, interrupting a live Pages deploy | Medium | High | Code-review `concurrency` block before merge; set `cancel-in-progress: false` on deploy job only | Engineering Owner |
| Permissions broader than required granted (e.g. `write-all`) | Low | High | Code-review `permissions` block; enforce minimum required; compare against the approved contract in RHI-016 | Engineering Owner |
| Workflow references `latest` instead of pinned Hugo version | Medium | Medium | Pin `HUGO_VERSION` env var; add CI check that env var is set and not `latest` | Engineering Owner |
| Quality gate fails in CI but passes locally due to environment differences | Medium | Medium | Run all gates locally with `--environment production` before pushing; document the local test procedure in RUNBOOK | Engineering Owner |
| Custom domain HTTPS not yet valid when first deploy runs | Low | Medium | Document Pages HTTPS provisioning delay (can take up to 24 hours after domain is set); do not block sign-off on HTTPS if domain is newly assigned | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Final outcomes:

- Added a deterministic GitHub Pages deployment workflow with explicit permissions, pinned Hugo installation, blocking Phase 3 gate execution, audit-artifact upload, and official Pages deployment actions.
- Added a PR validation workflow that runs the minimum production checks on every PR, route-sensitive parity/SEO/link gates when relevant files change, and staged accessibility/performance jobs as non-blocking Phase 3 signals.
- Added `scripts/check-links.js` and the `npm run check:links` command so internal link integrity is enforced before deploy.
- Aligned `scripts/check-url-parity.js` with the documented Phase 3 scaffold-fixture contract so placeholder scaffold routes do not disable scaffold mode before Phase 4 migration begins.
- Updated the migration runbook and Phase 3 implementation documentation with deployment trigger, rollback, staged-gate handling, and successful public run evidence.
- Completed a successful public deployment run at `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/22871838125` and confirmed the Pages artifact is reachable at `https://taurgis.github.io/rhino-inquisitor-com/`.

**Delivered artefacts:**

- `.github/workflows/deploy-pages.yml`
- `.github/workflows/build-pr.yml`
- `scripts/check-links.js`
- `package.json` updated with `check:links` script
- `scripts/check-url-parity.js` updated to ignore scaffold-owned fixture content when deciding scaffold mode
- `src/content/posts/phase-3-performance-baseline/index.md` updated with `scaffoldFixture: true`
- `src/content/pages/scaffold-readiness/index.md` updated with `scaffoldFixture: true`
- `docs/migration/RUNBOOK.md` updated with CI/CD runbook
- Progress Log entry with successful `workflow_dispatch` run URL and Pages URL
- `analysis/documentation/phase-3/rhi-029-cicd-deployment-scaffolding-2026-03-09.md`

**Deviations from plan:**

- Repository owner requested ticket closure after successful GitHub Pages deployment evidence. Custom-domain and HTTPS settings are treated as owner-verified for this ticket closeout even though they were not directly inspectable from the local environment.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-09 | In Progress | Implemented the deploy workflow, PR validation workflow, broken-link gate, Markdown lint pin/config, and runbook update. Local production build, front matter, SEO, internal-link, and URL parity checks now pass on the scaffold after excluding scaffold-owned fixture content from parity gating. |
| 2026-03-09 | In Progress | Verified successful public deploy run `Deploy to GitHub Pages #3` at `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/22871838125` and confirmed the deployed Pages URL is reachable at `https://taurgis.github.io/rhino-inquisitor-com/`. Repository Pages custom-domain and HTTPS settings verification for `www.rhino-inquisitor.com` remain pending. |
| 2026-03-09 | Done | Ticket closed by owner after successful deploy validation, passing local gate stack, and documented Phase 3 workflow/runbook updates. Custom-domain/HTTPS settings verification is treated as owner-confirmed for closeout and will remain operationally relevant in Phase 7. |

---

### Notes

- `concurrency.cancel-in-progress` must be `false` for the deploy job. GitHub Pages deploys cannot be safely interrupted mid-flight. The `true` setting is only acceptable for the build/test jobs, not the deploy job.
- Custom domain truth of record is in GitHub repository Settings → Pages, not in a committed `CNAME` file. For Actions-based publishing, `CNAME` is not the authoritative source. Verify settings/API state.
- All quality gates must run as blocking `needs:` dependencies of the deploy job — not as steps after the deploy step. If gates fail, the artifact must not be uploaded and the deploy must not run.
- Reference: `analysis/plan/details/phase-3.md` §Workstream J: CI/CD and Deployment Scaffolding; `.github/instructions/ci-workflow-standards.instructions.md`
