## RHI-029 · Workstream J — CI/CD and Deployment Scaffolding

**Status:** In Progress  
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

- [ ] GitHub Actions workflow file `.github/workflows/deploy-pages.yml` exists and:
  - [ ] Uses the official Pages deployment triple in order:
    1. `actions/configure-pages`
    2. `actions/upload-pages-artifact` (artifact name: `github-pages`)
    3. `actions/deploy-pages`
  - [ ] Deploy job references `environment: github-pages` for OIDC token scoping
  - [ ] Permissions are explicitly declared:
    - [ ] `contents: read`
    - [ ] `pages: write`
    - [ ] `id-token: write`
    - No broader permissions granted
  - [ ] Concurrency configuration prevents overlapping Pages deployments:
    - `group: pages`
    - `cancel-in-progress: false` (must be false for deploy job)
  - [ ] Hugo version is pinned via `HUGO_VERSION` env var — not `latest`
  - [ ] Build command is `hugo --minify --environment production`
  - [ ] Artifact path is `./public`
  - [ ] `fetch-depth: 0` is set on checkout (required if Hugo uses `.GitInfo` or `.Lastmod`)
- [ ] All quality gates run as blocking steps before the deploy job:
  - [ ] Hugo production build (`hugo --minify --environment production`)
  - [ ] Front matter validation (`npm run validate:frontmatter`)
  - [ ] URL parity check (`npm run check:url-parity`)
  - [ ] SEO smoke check (`npm run check:seo`)
  - [ ] Broken link check (`npm run check:links`)
- [ ] Quality gate jobs use `needs:` dependency so deploy is blocked on any gate failure
- [ ] Accessibility and performance baseline checks are run in CI as staged, non-deploy-blocking gates in Phase 3:
  - [ ] Accessibility check (`npm run check:a11y`) runs and reports pass/fail
  - [ ] Performance check (`npm run check:perf`) runs and reports pass/fail
  - [ ] Any staged-gate failure is tracked and must be resolved or risk-accepted before RHI-030 closes
- [ ] PR build validation workflow (`.github/workflows/build-pr.yml`) exists and:
  - [ ] Triggers on all PRs to `main`
  - [ ] Runs Hugo production build and front matter validation as minimum checks
  - [ ] URL parity check and SEO smoke check also run on PRs touching `src/content/**`, `src/layouts/**`, `src/static/**`, `src/archetypes/**`, or `hugo.toml`
- [ ] Broken link check script (`scripts/check-links.js`) exists and:
  - [ ] Scans all internal links in generated `public/` HTML
  - [ ] Reports any links pointing to non-existent `public/` paths
  - [ ] Exits with non-zero code on broken internal links
  - [ ] Is referenced in `package.json` as `npm run check:links`
- [ ] `.nojekyll` handling: workflow adds `.nojekyll` to `public/` before artifact packaging to prevent unintended Jekyll processing on Pages
- [ ] Deployment is reproducible from a clean CI environment with only documented prerequisites
- [ ] `docs/migration/RUNBOOK.md` is updated with CI/CD deployment runbook:
  - [ ] How to trigger a deployment
  - [ ] How to interpret quality gate failures
  - [ ] Rollback procedure
  - [ ] Search Console migration steps after cutover (new sitemap submission, transition handling, indexing/soft-404 monitoring)

---

### Tasks

- [ ] Create `.github/workflows/deploy-pages.yml`:
  - [ ] Set workflow name: `Deploy to GitHub Pages`
  - [ ] Set triggers: `push` to `main`, `workflow_dispatch`
  - [ ] Declare top-level `permissions: contents: read`
  - [ ] Set `concurrency: group: pages, cancel-in-progress: false`
  - [ ] Add `env: HUGO_VERSION: {pinned-version}` at workflow level
  - [ ] Create `build` job:
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
  - [ ] Create `deploy` job:
    - `needs: build`
    - `permissions: pages: write, id-token: write`
    - `environment: name: github-pages, url: ${{ steps.deployment.outputs.page_url }}`
    - `actions/deploy-pages`
- [ ] Create `.github/workflows/build-pr.yml`:
  - [ ] Trigger on `pull_request` targeting `main`
  - [ ] `permissions: contents: read`
  - [ ] Concurrency: `group: pr-${{ github.ref }}, cancel-in-progress: true` (OK for PR builds)
  - [ ] Run Hugo production build and `validate:frontmatter` on all PRs
  - [ ] Run URL parity and SEO smoke check on PRs touching `src/content/**`, `src/layouts/**`, `src/static/**`, `src/archetypes/**`, or `hugo.toml`
  - [ ] Run `check:a11y` and `check:perf` as non-blocking informational jobs in Phase 3
- [ ] Create `scripts/check-links.js`:
  - [ ] Use `fast-glob` to find all HTML files in `public/`
  - [ ] Parse `href` attributes for internal links (links starting with `/`)
  - [ ] For each internal link, verify the corresponding file exists in `public/`
  - [ ] Report all broken internal links with source page and missing target
  - [ ] Exit 1 on any broken link found
- [ ] Add `"check:links": "node scripts/check-links.js"` to `package.json` scripts
- [ ] Test the complete workflow end-to-end using `workflow_dispatch` trigger:
  - [ ] Trigger build on branch
  - [ ] Verify all quality gates pass
  - [ ] Verify artifact is uploaded correctly
  - [ ] Verify deploy job succeeds and Pages URL is accessible
  - [ ] Log run URL in Progress Log
- [ ] Verify custom domain settings in GitHub repository Settings → Pages (do not rely on CNAME file alone):
  - [ ] Custom domain `www.rhino-inquisitor.com` is configured
  - [ ] HTTPS enforcement is enabled
  - [ ] Document settings state in Progress Log
- [ ] Update `docs/migration/RUNBOOK.md` with deployment runbook:
  - [ ] Trigger deployment: push to `main` or use `workflow_dispatch`
  - [ ] Quality gate failure response: which script to run locally to reproduce and debug
  - [ ] Rollback: re-run deploy job from last known-good run (do not re-run build-only job)
  - [ ] Search Console migration steps: submit new sitemap set after cutover, keep old sitemap references during transition if needed, monitor indexing and soft-404 signals
- [ ] Commit workflows, `scripts/check-links.js`, and updated `package.json`

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- `.github/workflows/deploy-pages.yml`
- `.github/workflows/build-pr.yml`
- `scripts/check-links.js`
- `package.json` updated with `check:links` script
- `docs/migration/RUNBOOK.md` updated with CI/CD runbook
- Progress Log entry with successful `workflow_dispatch` run URL and Pages URL

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-09 | In Progress | Implemented the deploy workflow, PR validation workflow, broken-link gate, Markdown lint pin/config, and runbook update. Local production build, front matter, SEO, and internal-link checks passed. The existing URL parity baseline still fails on unmigrated routes, and GitHub-side `workflow_dispatch` plus Pages settings verification remain pending. |

---

### Notes

- `concurrency.cancel-in-progress` must be `false` for the deploy job. GitHub Pages deploys cannot be safely interrupted mid-flight. The `true` setting is only acceptable for the build/test jobs, not the deploy job.
- Custom domain truth of record is in GitHub repository Settings → Pages, not in a committed `CNAME` file. For Actions-based publishing, `CNAME` is not the authoritative source. Verify settings/API state.
- All quality gates must run as blocking `needs:` dependencies of the deploy job — not as steps after the deploy step. If gates fail, the artifact must not be uploaded and the deploy must not run.
- Reference: `analysis/plan/details/phase-3.md` §Workstream J: CI/CD and Deployment Scaffolding; `.github/instructions/ci-workflow-standards.instructions.md`
