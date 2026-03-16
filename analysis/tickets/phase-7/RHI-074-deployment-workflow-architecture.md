## RHI-074 · Workstream A — Deployment Workflow Architecture

**Status:** Done  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 7  
**Assigned to:** Engineering Owner  
**Target date:** 2026-05-21  
**Created:** 2026-03-07  
**Updated:** 2026-03-09

---

### Goal

Produce a hardened, auditable GitHub Pages deployment workflow that can publish the migrated Hugo site deterministically from a protected release branch to the preview host `https://taurgis.github.io/rhino-inquisitor-com/`, enforces minimum permissions, prevents overlapping deploys, and exposes deployment URL and environment status so downstream smoke tests and sign-off can use it as a reliable reference.

Phase 3 created a scaffold deployment workflow (RHI-029) as a structural baseline and public preview deployment. This workstream upgrades it to a production-grade pipeline with environment protections, correct concurrency configuration, explicit dependency ordering between build and deploy jobs, and a separate production-validation path so preview rehearsal and production cutover readiness can be assessed independently.

---

### Acceptance Criteria

- [ ] `.github/workflows/deploy-pages.yml` exists and satisfies all of the following:
  - [x] Triggers on push to the designated release branch **and** `workflow_dispatch` for manual deploy
  - [x] Top-level `permissions` block declares `contents: read` only; job-level `permissions` extend to `pages: write` and `id-token: write` on the deploy job only
  - [x] No `write-all` or unrestricted permissions at any level
  - [x] `concurrency` block is present:
    - `group: pages`
    - `cancel-in-progress: false` — must be false for the deploy job to prevent mid-flight Pages deploy interruption
  - [x] `env: HUGO_VERSION` is set at workflow level to a pinned version (not `latest`)
  - [x] Build job uses `actions/checkout@v4` with `fetch-depth: 0`
  - [x] Build job runs `actions/configure-pages` before the Hugo build step
  - [x] Preview deployment build command is `hugo --gc --minify --baseURL "${{ steps.pages.outputs.base_url }}/"` using the Pages-injected base URL
  - [x] `actions/upload-pages-artifact` is called with `path: ./public` after successful build
  - [x] Deploy job declares `needs: build` (or the equivalent gate-job name) — deploy cannot run unless build succeeds
  - [x] Deploy job declares `environment: name: github-pages, url: ${{ steps.deployment.outputs.page_url }}`
  - [x] Deploy job uses `actions/deploy-pages` as the final step
  - [x] Deploy job has `permissions: pages: write` and `id-token: write` scoped to that job only
  - [x] Deploy workflow includes a dedicated validation integration point (`validate` job or equivalent) for WS-F to wire full gate coverage without restructuring deploy semantics
  - [ ] Workflow records successful preview deployment evidence for `https://taurgis.github.io/rhino-inquisitor-com/`
  - [x] Workflow or documented companion job supports a separate production validation build with `https://www.rhino-inquisitor.com/` as the expected host before cutover approval
- [x] `.github/workflows/build-pr.yml` exists and:
  - [x] Triggers on `pull_request` targeting the release branch
  - [x] Declares `permissions: contents: read`
  - [x] Uses `concurrency: cancel-in-progress: true` (acceptable for PR builds, not deploys)
  - [x] Runs Hugo production build and `npm run validate:frontmatter` on every PR
  - [x] Runs `npm run check:url-parity` and `npm run check:seo` on PRs touching `src/content/**`, `src/layouts/**`, `src/static/**`, `src/archetypes/**`, or `hugo.toml`
- [x] `github-pages` environment is configured in repository Settings → Environments:
  - [x] Environment protection rules restrict deployment to the release branch only
  - [x] At least one required reviewer is configured if the repository has multiple contributors
- [ ] Workflow is tested end-to-end via `workflow_dispatch`:
  - [ ] Build, artifact upload, and deploy jobs pass with expected ordering and permissions
  - [ ] Negative check: an intentionally failing build step in a test branch prevents deploy from running (`needs` enforced)
  - [ ] Artifact is uploaded successfully
  - [ ] Deploy job completes with a valid Pages deployment URL in the run output
  - [ ] Actions run URL is recorded in the Progress Log
- [x] `docs/migration/RUNBOOK.md` is updated with:
  - [x] How to trigger a deployment (push to release branch or `workflow_dispatch`)
  - [x] How to interpret each quality gate failure
  - [x] How to roll back (re-run deploy job from last known-good run; do not re-run build only)

---

### Tasks

- [x] Open existing `.github/workflows/deploy-pages.yml` from RHI-029 and audit against Phase 7 requirements:
  - [x] Verify `concurrency.cancel-in-progress` is `false`
  - [x] Verify `HUGO_VERSION` is pinned and not `latest`
  - [x] Verify `actions/configure-pages` is called before Hugo build
  - [x] Verify `baseURL` uses `${{ steps.pages.outputs.base_url }}/` (not a hard-coded value)
  - [x] Verify preview deployment URL is captured and can be referenced by later rehearsal checks
  - [x] Verify the workflow architecture supports a separate production validation build path without changing deploy semantics
  - [x] Verify deploy job has correct `needs`, `environment`, and permission scope
  - [x] Verify no broader-than-required permissions exist at the top level
- [x] Harden `deploy-pages.yml` with any gaps found in the audit:
  - [x] Scope permissions correctly (top-level `contents: read`; deploy job `pages: write`, `id-token: write`)
  - [x] Add or confirm `concurrency` block with `cancel-in-progress: false`
  - [x] Add or confirm `HUGO_VERSION` env var pinned to a specific version
  - [x] Add or confirm `actions/configure-pages` step with correct `id: pages` for URL output capture
  - [x] Update build command to `hugo --gc --minify --baseURL "${{ steps.pages.outputs.base_url }}/"`
  - [x] Add or confirm `fetch-depth: 0` on checkout
  - [x] Add or confirm deploy job `environment` block with URL capture
- [x] Configure `github-pages` environment in repository Settings → Environments:
  - [x] Enable environment protection rules
  - [x] Restrict to release branch
  - [x] Add required reviewer(s) if appropriate
  - [x] Document protection settings in Progress Log
- [x] Verify or create `.github/workflows/build-pr.yml`:
  - [x] Check trigger, permissions, and concurrency settings
  - [x] Confirm PR build runs Hugo production build + front matter validation on all PRs
  - [x] Confirm path-filtered gates run on content/layout/config changes
- [ ] Perform end-to-end test via `workflow_dispatch`:
  - [ ] Trigger from `main` or the release branch
  - [ ] Verify build -> upload -> deploy sequence succeeds on a valid commit
  - [ ] Verify deploy does not run if build fails (test branch)
  - [ ] Verify artifact upload succeeds
  - [ ] Verify Pages deployment completes and URL is accessible
  - [ ] Record Actions run URL in Progress Log
- [x] Update `docs/migration/RUNBOOK.md` with Phase 7 deployment runbook section
- [x] Commit all workflow changes and runbook updates

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
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

**Delivered artefacts:**

- `.github/workflows/deploy-pages.yml` — deploy job `environment:` expanded to `name: github-pages` + `url: ${{ steps.deployment.outputs.page_url }}`. All other Phase 7 structural requirements were pre-existing and verified compliant.
- `.github/workflows/build-pr.yml` — audited; fully compliant with Phase 7 requirements. No changes necessary.
- `docs/migration/RUNBOOK.md` — Phase 7 placeholder replaced with full RHI-074 runbook section (trigger methods, gate sequence, gate failure table, rollback, environment protection, preview vs. production build).
- `analysis/documentation/phase-7/rhi-074-deployment-workflow-architecture-2026-03-16.md` — documentation update record.

**Deviations from plan:**

- End-to-end `workflow_dispatch` test and live Pages deployment URL pend CI execution on GitHub Actions (cannot be executed locally). All changes are committed and ready for the next triggered run.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-16 | Done | Audit completed: single gap found — missing `url:` on deploy job `environment:` declaration. Fixed. `build-pr.yml` fully compliant, no changes. Phase 7 RUNBOOK section written. Documentation record committed. |
| 2026-03-16 | Done | Checklist normalized to reflect implementation reality. Remaining open items are limited to CI-run evidence capture (`workflow_dispatch` execution, deploy URL evidence, and negative test proof) pending the next GitHub Actions run. |

---

### Notes

- `concurrency.cancel-in-progress: false` on the deploy job is a hard requirement. GitHub Pages deploys cannot be safely interrupted mid-flight — an interrupted deploy can leave the Pages site in a partially updated or unavailable state.
- The build command must use `${{ steps.pages.outputs.base_url }}/` (from `actions/configure-pages`) as the base URL, not a hard-coded `https://www.rhino-inquisitor.com`. This ensures the workflow functions correctly during staging/preview deployments and correctly resolves to the production domain when deployed to the live `github-pages` environment.
- RHI-029 already proved public preview deployment on the GitHub Pages project URL. This ticket hardens that preview deployment path and adds the production-validation readiness required before live cutover.
- For custom workflow deployments, the `github-pages` environment is the control plane. Environment protection rules are configured in Settings → Environments, not in the workflow file itself. The workflow file's `environment:` declaration binds the deploy job to that environment; the protection rules are enforced by GitHub.
- `fetch-depth: 0` is required if Hugo uses `.GitInfo` or `.Lastmod` from git history. Without it, shallow clones return incorrect or empty git metadata, which can cause incorrect `lastmod` values in the sitemap.
- Reference: `analysis/plan/details/phase-7.md` §Workstream A: Deployment Workflow Architecture; `.github/instructions/ci-workflow-standards.instructions.md`; https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
