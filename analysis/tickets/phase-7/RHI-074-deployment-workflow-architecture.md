## RHI-074 · Workstream A — Deployment Workflow Architecture

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 7  
**Assigned to:** Engineering Owner  
**Target date:** 2026-05-21  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Produce a hardened, auditable GitHub Pages deployment workflow that can publish the migrated Hugo site deterministically from a protected release branch, enforces minimum permissions, prevents overlapping deploys, and exposes deployment URL and environment status so downstream smoke tests and sign-off can use it as a reliable reference.

Phase 3 created a scaffold deployment workflow (RHI-029) as a structural baseline. This workstream upgrades it to a production-grade pipeline with environment protections, correct concurrency configuration, explicit dependency ordering between build and deploy jobs, with a dedicated validation integration point for WS-F quality gates. The Phase 3 scaffold is not sufficient on its own for a live production cutover.

---

### Acceptance Criteria

- [ ] `.github/workflows/deploy-pages.yml` exists and satisfies all of the following:
  - [ ] Triggers on push to the designated release branch **and** `workflow_dispatch` for manual deploy
  - [ ] Top-level `permissions` block declares `contents: read` only; job-level `permissions` extend to `pages: write` and `id-token: write` on the deploy job only
  - [ ] No `write-all` or unrestricted permissions at any level
  - [ ] `concurrency` block is present:
    - `group: pages`
    - `cancel-in-progress: false` — must be false for the deploy job to prevent mid-flight Pages deploy interruption
  - [ ] `env: HUGO_VERSION` is set at workflow level to a pinned version (not `latest`)
  - [ ] Build job uses `actions/checkout@v4` with `fetch-depth: 0`
  - [ ] Build job runs `actions/configure-pages` before the Hugo build step
  - [ ] Build command is `hugo --gc --minify --baseURL "${{ steps.pages.outputs.base_url }}/"` using the Pages-injected base URL
  - [ ] `actions/upload-pages-artifact` is called with `path: ./public` after successful build
  - [ ] Deploy job declares `needs: build` (or the equivalent gate-job name) — deploy cannot run unless build succeeds
  - [ ] Deploy job declares `environment: name: github-pages, url: ${{ steps.deployment.outputs.page_url }}`
  - [ ] Deploy job uses `actions/deploy-pages` as the final step
  - [ ] Deploy job has `permissions: pages: write` and `id-token: write` scoped to that job only
  - [ ] Deploy workflow includes a dedicated validation integration point (`validate` job or equivalent) for WS-F to wire full gate coverage without restructuring deploy semantics
- [ ] `.github/workflows/build-pr.yml` exists and:
  - [ ] Triggers on `pull_request` targeting the release branch
  - [ ] Declares `permissions: contents: read`
  - [ ] Uses `concurrency: cancel-in-progress: true` (acceptable for PR builds, not deploys)
  - [ ] Runs Hugo production build and `npm run validate:frontmatter` on every PR
  - [ ] Runs `npm run check:url-parity` and `npm run check:seo` on PRs touching `src/content/**`, `src/layouts/**`, `src/static/**`, `src/archetypes/**`, or `hugo.toml`
- [ ] `github-pages` environment is configured in repository Settings → Environments:
  - [ ] Environment protection rules restrict deployment to the release branch only
  - [ ] At least one required reviewer is configured if the repository has multiple contributors
- [ ] Workflow is tested end-to-end via `workflow_dispatch`:
  - [ ] Build, artifact upload, and deploy jobs pass with expected ordering and permissions
  - [ ] Negative check: an intentionally failing build step in a test branch prevents deploy from running (`needs` enforced)
  - [ ] Artifact is uploaded successfully
  - [ ] Deploy job completes with a valid Pages deployment URL in the run output
  - [ ] Actions run URL is recorded in the Progress Log
- [ ] `docs/migration/RUNBOOK.md` is updated with:
  - [ ] How to trigger a deployment (push to release branch or `workflow_dispatch`)
  - [ ] How to interpret each quality gate failure
  - [ ] How to roll back (re-run deploy job from last known-good run; do not re-run build only)

---

### Tasks

- [ ] Open existing `.github/workflows/deploy-pages.yml` from RHI-029 and audit against Phase 7 requirements:
  - [ ] Verify `concurrency.cancel-in-progress` is `false`
  - [ ] Verify `HUGO_VERSION` is pinned and not `latest`
  - [ ] Verify `actions/configure-pages` is called before Hugo build
  - [ ] Verify `baseURL` uses `${{ steps.pages.outputs.base_url }}/` (not a hard-coded value)
  - [ ] Verify deploy job has correct `needs`, `environment`, and permission scope
  - [ ] Verify no broader-than-required permissions exist at the top level
- [ ] Harden `deploy-pages.yml` with any gaps found in the audit:
  - [ ] Scope permissions correctly (top-level `contents: read`; deploy job `pages: write`, `id-token: write`)
  - [ ] Add or confirm `concurrency` block with `cancel-in-progress: false`
  - [ ] Add or confirm `HUGO_VERSION` env var pinned to a specific version
  - [ ] Add or confirm `actions/configure-pages` step with correct `id: pages` for URL output capture
  - [ ] Update build command to `hugo --gc --minify --baseURL "${{ steps.pages.outputs.base_url }}/"`
  - [ ] Add or confirm `fetch-depth: 0` on checkout
  - [ ] Add or confirm deploy job `environment` block with URL capture
- [ ] Configure `github-pages` environment in repository Settings → Environments:
  - [ ] Enable environment protection rules
  - [ ] Restrict to release branch
  - [ ] Add required reviewer(s) if appropriate
  - [ ] Document protection settings in Progress Log
- [ ] Verify or create `.github/workflows/build-pr.yml`:
  - [ ] Check trigger, permissions, and concurrency settings
  - [ ] Confirm PR build runs Hugo production build + front matter validation on all PRs
  - [ ] Confirm path-filtered gates run on content/layout/config changes
- [ ] Perform end-to-end test via `workflow_dispatch`:
  - [ ] Trigger from `main` or the release branch
  - [ ] Verify build -> upload -> deploy sequence succeeds on a valid commit
  - [ ] Verify deploy does not run if build fails (test branch)
  - [ ] Verify artifact upload succeeds
  - [ ] Verify Pages deployment completes and URL is accessible
  - [ ] Record Actions run URL in Progress Log
- [ ] Update `docs/migration/RUNBOOK.md` with Phase 7 deployment runbook section
- [ ] Commit all workflow changes and runbook updates

---

### Out of Scope

- Configuring custom domain or DNS records (WS-C: RHI-076)
- HTTPS enforcement (WS-D: RHI-077)
- SEO canonical verification in build output (WS-E: RHI-078)
- Adding new quality gate scripts (WS-F: RHI-079 — scripts are consumed by the workflow; this ticket only wires them)
- Launch day cutover execution (WS-G: RHI-080)
- Incident response planning (WS-H: RHI-081)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-073 Done — Phase 7 Bootstrap complete | Ticket | Pending |
| RHI-029 Done — Phase 3 CI/CD scaffold committed (`deploy-pages.yml` baseline) | Ticket | Pending |
| WS-F integration point agreed (`validate` job or equivalent) for later full gate wiring in RHI-079 | Ticket | Pending |
| GitHub repository Pages settings access (environment protection configuration) | Access | Pending |
| Hugo version number confirmed for pinning | Tool | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| `cancel-in-progress: true` set on deploy job (incorrect), interrupting a live Pages deploy | Medium | High | Explicitly verify the `concurrency` block before merging; deploy job must have `cancel-in-progress: false` | Engineering Owner |
| `baseURL` hard-coded instead of using `${{ steps.pages.outputs.base_url }}`, causing incorrect canonical host in Pages build | Medium | High | Verify build command uses the Pages-injected base URL; test with `workflow_dispatch` and inspect canonical tag in built output | Engineering Owner |
| Permissions broader than required (`write-all`) granting excessive access | Low | High | Code-review `permissions` blocks; compare against Phase 2 deployment and operations contract (RHI-016) | Engineering Owner |
| `github-pages` environment protection rules block legitimate deploys from release branch | Low | Medium | Test environment rules with the designated release branch before declaring Done; record expected actor and ref pattern | Engineering Owner |
| Phase 3 workflow scaffold has drifted from Phase 7 requirements, requiring significant rework | Medium | Medium | Audit the Phase 3 scaffold at the start of this ticket; surface rework scope at bootstrap if significant (before scheduling WS-C and WS-E) | Engineering Owner |

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

- `.github/workflows/deploy-pages.yml` — production-hardened Pages deployment workflow
- `.github/workflows/build-pr.yml` — PR build validation workflow (verified or updated)
- `docs/migration/RUNBOOK.md` — updated with Phase 7 deployment runbook section
- Progress Log entry with successful `workflow_dispatch` run URL and Pages deployment URL

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- `concurrency.cancel-in-progress: false` on the deploy job is a hard requirement. GitHub Pages deploys cannot be safely interrupted mid-flight — an interrupted deploy can leave the Pages site in a partially updated or unavailable state.
- The build command must use `${{ steps.pages.outputs.base_url }}/` (from `actions/configure-pages`) as the base URL, not a hard-coded `https://www.rhino-inquisitor.com`. This ensures the workflow functions correctly during staging/preview deployments and correctly resolves to the production domain when deployed to the live `github-pages` environment.
- For custom workflow deployments, the `github-pages` environment is the control plane. Environment protection rules are configured in Settings → Environments, not in the workflow file itself. The workflow file's `environment:` declaration binds the deploy job to that environment; the protection rules are enforced by GitHub.
- `fetch-depth: 0` is required if Hugo uses `.GitInfo` or `.Lastmod` from git history. Without it, shallow clones return incorrect or empty git metadata, which can cause incorrect `lastmod` values in the sitemap.
- Reference: `analysis/plan/details/phase-7.md` §Workstream A: Deployment Workflow Architecture; `.github/instructions/ci-workflow-standards.instructions.md`; https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
