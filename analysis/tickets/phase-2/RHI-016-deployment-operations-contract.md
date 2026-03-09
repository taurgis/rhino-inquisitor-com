## RHI-016 · Workstream F — Deployment and Operations Contract

**Status:** Done  
**Priority:** High  
**Estimate:** M  
**Phase:** 2  
**Assigned to:** Engineering Owner  
**Target date:** 2026-03-20  
**Created:** 2026-03-07  
**Updated:** 2026-03-09

---

### Goal

Define and approve the GitHub Pages deployment workflow contract, including CI permissions, the Pages Actions trio sequence, artifact handling, custom domain source of truth, rollback plan, and operational constraints. This contract becomes the exact specification for the deployment workflow YAML file in Phase 3 (or Phase 7). Every constraint documented here is derived from GitHub Pages custom-workflow behavior that, if misunderstood, can produce deployment failures, custom-domain drift, artifact rejection, or rollback assumptions that do not hold in production.

The engineering owner must approve this contract. The deployment contract is also a dependency for defining the deployment integrity validation gate in RHI-017.

---

### Acceptance Criteria

- [x] Workflow trigger strategy is confirmed:
  - [x] Deploy on push to `main`
  - [x] `workflow_dispatch` manual trigger included for emergency redeployment
- [x] Workflow permissions are documented (minimum required):
  - [x] `contents: read`
  - [x] `pages: write`
  - [x] `id-token: write`
  - [x] No broader permissions granted
- [x] Deployment pipeline uses the official Pages Actions trio in correct order:
  - [x] `actions/configure-pages@v5`
  - [x] `actions/upload-pages-artifact@v4` uploads `path: ./public`; artifact name defaults to `github-pages`
  - [x] `actions/deploy-pages@v4`
- [x] Deploy job depends on build/upload via `needs` and references `environment: github-pages` for OIDC scoping and environment protection
- [x] `concurrency` contract is documented:
  - [x] Build/test jobs use ref-scoped concurrency with `cancel-in-progress: true`
  - [x] Deploy job uses a dedicated Pages deployment concurrency group with `cancel-in-progress: false`
- [x] Hugo version pin strategy is documented (ties to RHI-011 version decision): workflow-level `HUGO_VERSION=0.156.0`, never `latest`
- [x] Build command is confirmed: `hugo --gc --minify --environment production`
- [x] Build flags explicitly excluded: `--buildDrafts`, `--buildFuture`, `--buildExpired`
- [x] Artifact contract is confirmed:
  - [x] Source path is `./public`
  - [x] Official Pages artifact constraints are documented: single gzip archive containing a single tar file; files/directories only; no symbolic or hard links
- [x] Checkout-depth rule is documented:
  - [x] Shallow checkout is the default because RHI-012 makes front matter `lastmod` authoritative from WordPress export metadata
  - [x] `fetch-depth: 0` becomes mandatory only if a later approved contract adopts Hugo `.GitInfo` or other git-derived lastmod behavior
- [x] Custom domain source of truth is documented:
  - [x] Domain is configured in GitHub repository Pages settings or via API for Actions publishing
  - [x] A committed `CNAME` file is ignored and not required for custom GitHub Actions workflow publishing
  - [x] Custom domain is saved in Pages settings before DNS changes
- [x] Artifact size and build-time guardrails are documented from the Phase 1 inventory profile:
  - [x] Planning estimate assumes roughly 220 primary rendered routes plus shared outputs
  - [x] Investigate if compressed artifact exceeds 100 MB or CI build exceeds 5 minutes
  - [x] Block release-candidate promotion if compressed artifact exceeds 500 MB or Pages deployment approaches the 10-minute timeout window
- [x] Rollback plan is documented:
  - [x] Identify the last known good workflow run and commit SHA in Actions history
  - [x] Preferred rollback path is GitHub rerun of that prior good workflow run within the 30-day rerun window
  - [x] Fallback path is `workflow_dispatch` against the same known-good commit when rerun is unavailable
  - [x] Contract does not rely on deploy-job-only reruns after artifact expiry; `upload-pages-artifact` defaults to 1-day artifact retention
  - [x] Record rollback decision in `monitoring/launch-cutover-log.md`
- [x] `.nojekyll` handling decision is documented: not required for artifact-based Pages deployment; relevant only to branch-published or external-CI patterns
- [x] Actions version pinning strategy is documented: use the official Pages action majors approved in RHI-015 (`@v5`, `@v4`, `@v4`), never `latest`; future SHA hardening must preserve the same semantic versions
- [x] Workflow contract is recorded in Outcomes and referenced from `analysis/plan/details/phase-2.md`

---

### Tasks

- [x] Review `analysis/plan/details/phase-2.md` §Workstream F with engineering owner
- [x] Confirm workflow triggers: `push` to `main` and `workflow_dispatch`
- [x] Define minimum required workflow permissions and document why broader grants are not needed (`contents: write` is excluded because deploy workflow only reads repo content and writes Pages deployments)
- [x] Confirm the Pages Actions trio, their required order, and approved version tags from RHI-015
- [x] Confirm `environment: github-pages` and `needs` linkage on the deploy job
- [x] Define concurrency groups for build and deploy jobs separately:
  - [x] Build/test jobs use a ref-scoped group such as `ci-${{ github.ref }}` with `cancel-in-progress: true`
  - [x] Deploy job uses a dedicated Pages deployment group such as `pages-deploy` with `cancel-in-progress: false`
- [x] Confirm Hugo version pin approach (from RHI-011); document `HUGO_VERSION=0.156.0` as a workflow-level environment variable
- [x] Confirm build command and excluded flags
- [x] Confirm artifact path and official artifact constraints (`./public`, default artifact name `github-pages`, no unsupported link types)
- [x] Resolve checkout-depth decision using RHI-012:
  - [x] Front matter `lastmod` comes from WordPress export metadata, so shallow checkout is the default
  - [x] Document that any future Git-derived metadata adoption requires `fetch-depth: 0`
- [x] Research and document custom domain handling from official GitHub Pages docs:
  - [x] Pages settings/API are authoritative for Actions publishing
  - [x] `CNAME` files are ignored and not required for custom workflow publishing
  - [x] Domain is configured in Pages settings before DNS changes
- [x] Estimate artifact size from the Phase 1 inventory profile and document investigation/block thresholds
- [x] Define build time budget and escalation threshold
- [x] Document rollback procedure as a numbered runbook that does not depend on deploy-job-only reruns after artifact expiry
- [x] Document `.nojekyll` handling for artifact-based Pages deployment
- [x] Define Actions version pinning approach: official version tags per RHI-015 now; no `latest`; future SHA hardening allowed without changing contract semantics
- [x] Record all decisions in Outcomes
- [x] Update `analysis/plan/details/phase-2.md` §Workstream F

---

### Out of Scope

- Writing the actual GitHub Actions workflow YAML file (Phase 3 or Phase 7)
- Setting up the custom domain in GitHub settings (Phase 7 — DNS cutover)
- Configuring CDN or edge infrastructure (conditional — Phase 6 or Phase 7)
- Staging environment configuration (covered by RHI-007 and Phase 3 scaffold)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-010 Done — Phase 2 kickoff and decision owners confirmed | Ticket | Done |
| RHI-011 Done — Hugo version pin and artifact path confirmed | Ticket | Done |
| RHI-012 Done — Front matter `lastmod` source confirms shallow checkout default | Ticket | Done |
| Engineering owner available for workflow and operations review | Access | Done |
| Official GitHub Pages and Pages Actions documentation reviewed for contract evidence | Evidence | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| `cancel-in-progress: true` on deploy job interrupts a live Pages deployment | Medium | High | Explicitly set `cancel-in-progress: false` for the dedicated deploy concurrency group and verify this in the later deployment-integrity gate | Engineering Owner |
| Incorrect workflow permissions cause OIDC scoping failure or deploy rejection | Low | High | Use only `contents: read`, `pages: write`, and `id-token: write`; test with `workflow_dispatch` before production promotion | Engineering Owner |
| Assuming `CNAME` controls custom domain state in Actions publishing causes cutover misconfiguration | Medium | High | Treat Pages settings/API as the sole custom-domain authority for custom workflows; save domain before DNS changes; do not depend on committed `CNAME` files | Engineering Owner |
| Artifact packaging includes unsupported link types or source files and fails deploy or times out | Low | High | Use the official `upload-pages-artifact` action on `./public` only; prohibit symbolic/hard links; enforce artifact validation in RHI-017 | Engineering Owner |
| Rollback plan depends on an expired Pages artifact | Medium | Medium | Prefer rerunning the last known good workflow within GitHub's 30-day rerun window and fall back to `workflow_dispatch` on the same known-good commit rather than deploy-job-only reruns | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Completed. Workstream F is now the approved deployment and operations contract for the GitHub Pages custom-workflow path that Phase 3 or Phase 7 will implement.

Approved contract:

- Workflow trigger contract:
  - Deploy workflow supports `push` to `main` and `workflow_dispatch` for controlled redeploys.
- Official Pages action sequence and job semantics:
  - Action sequence is fixed to `actions/configure-pages@v5`, `actions/upload-pages-artifact@v4`, and `actions/deploy-pages@v4`.
  - The deploy job must depend on the build/upload job via `needs` so deployment never starts without an uploaded Pages artifact.
  - The deploy job targets `environment: github-pages` to align with GitHub's recommended Pages environment and OIDC protection model.
- Minimum workflow permissions:
  - Workflow contract uses `contents: read`, `pages: write`, and `id-token: write` only.
  - Broader repository write scopes are excluded because the deploy workflow reads repository content and creates a Pages deployment; it does not write back to the repository.
- Concurrency contract:
  - Build/test jobs use ref-scoped concurrency with `cancel-in-progress: true`.
  - Deploy job uses a dedicated Pages deployment concurrency group (for example `pages-deploy`) with `cancel-in-progress: false` so an in-progress production deployment is never cancelled.
- Hugo build contract:
  - Hugo Extended stays pinned to `0.156.0` per RHI-011 and is exposed in CI as `HUGO_VERSION=0.156.0`.
  - Canonical production build command is `hugo --gc --minify --environment production` from repository root.
  - Production deploy workflow must not use `--buildDrafts`, `--buildFuture`, or `--buildExpired`.
- Checkout-depth contract:
  - Shallow checkout is the default because RHI-012 makes front matter `lastmod` authoritative from WordPress export metadata.
  - `fetch-depth: 0` is not required in the Phase 2 contract and becomes mandatory only if a later approved contract adopts Hugo `.GitInfo` or other git-derived lastmod behavior.
- Artifact contract:
  - Hugo output path is fixed to `./public`.
  - The workflow uses the official Pages artifact packaging model: a single gzip archive containing a single tar file, generated from `./public` only, with files/directories only and no symbolic or hard links.
  - `upload-pages-artifact` default artifact naming (`github-pages`) is accepted; no custom artifact naming contract is needed.
- Custom domain contract:
  - GitHub repository Pages settings or API are the authoritative source of truth for custom-domain configuration in custom Actions workflows.
  - For custom GitHub Actions workflow publishing, committed `CNAME` files are ignored and are not required.
  - The custom domain must be saved in Pages settings before DNS changes in Phase 7.
- `.nojekyll` handling:
  - `.nojekyll` is not required for artifact-based Pages deployment and remains relevant only to branch-published or external-CI patterns.
- Action pinning strategy:
  - Phase 2 locks the official Pages action majors already approved in RHI-015 (`@v5`, `@v4`, `@v4`).
  - `latest` is prohibited.
  - Future SHA hardening is allowed only if it preserves the same approved action versions and behavior.
- Planning budgets and guardrails:
  - Phase 1 inventory profiling indicates roughly 220 primary rendered routes (posts, pages, category pages, pagination, and landing surfaces) plus shared outputs such as feeds, sitemap, and robots.
  - Investigate if the compressed Pages artifact exceeds 100 MB or the CI production build exceeds 5 minutes.
  - Block release-candidate promotion if the compressed artifact exceeds 500 MB or if Pages deployment approaches GitHub's 10-minute deployment timeout window.
- Rollback runbook:
  1. Locate the last known good Pages workflow run and associated commit SHA in GitHub Actions history.
  2. If the run is within GitHub's 30-day rerun window, rerun the full workflow from that run so the same SHA rebuilds, uploads, and deploys.
  3. If rerun is unavailable, trigger `workflow_dispatch` against the same known-good commit or ref to rebuild and deploy that revision.
  4. Verify the Pages deployment URL, canonical custom domain, and homepage response before closing the incident.
  5. Record incident context, chosen rollback path, run URL, and verification evidence in `monitoring/launch-cutover-log.md`.
  6. Escalate if the last known good commit cannot be rebuilt or if domain or HTTPS state deviates after redeploy.
- RHI-017 handoff requirements:
  - Deployment-integrity validation must verify the minimum permissions, action sequence and `needs` relationship, artifact packaging rules, custom-domain configuration contract, build-flag exclusions, and deploy concurrency semantics defined here.

**Delivered artefacts:**

- Approved deployment workflow contract (recorded in this ticket's Outcomes)
- Rollback runbook
- Updated `analysis/plan/details/phase-2.md` §Workstream F
- Documentation note: `analysis/documentation/phase-2/rhi-016-deployment-operations-contract-2026-03-09.md`

**Deviations from plan:**

- The original ticket treated `CNAME` persistence, deploy-job-only rollback, and `.nojekyll` requirement as open questions. Official GitHub documentation resolved these points: Pages settings or API are authoritative for custom domains in custom workflow publishing, committed `CNAME` files are ignored and not required in that model, deploy-job-only reruns cannot be the sole rollback assumption because `upload-pages-artifact` defaults to 1-day artifact retention, and `.nojekyll` is not required for artifact deployments.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-09 | In Progress | Reconciled Workstream F against RHI-011, RHI-012, RHI-015, Hugo specialist guidance, and official GitHub Pages and Pages Actions documentation; corrected custom-domain, artifact, checkout-depth, and rollback assumptions |
| 2026-03-09 | Done | Approved deployment and operations contract recorded; Workstream F in the Phase 2 plan updated; rollback runbook and deployment guardrails documented; RHI-017 handoff inputs made explicit |

---

### Notes

- `cancel-in-progress: false` on the deploy job remains a hard rule because the contract must never intentionally cancel an in-progress production deployment.
- Custom GitHub Actions workflow publishing uses Pages settings or API for custom-domain authority; committed `CNAME` files are ignored in this model and should not be treated as the source of truth.
- `upload-pages-artifact` defaults artifact retention to 1 day, so rollback cannot depend on deploy-job-only reruns after artifact expiry.
- Reference: `analysis/plan/details/phase-2.md` §Workstream F
- Reference: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- Reference: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- Reference: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- Reference: https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs
- Reference: https://github.com/actions/deploy-pages
- Reference: https://github.com/actions/upload-pages-artifact
- Reference: https://github.com/actions/configure-pages
