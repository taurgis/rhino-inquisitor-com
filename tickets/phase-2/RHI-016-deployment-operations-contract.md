## RHI-016 · Workstream F — Deployment and Operations Contract

**Status:** Open  
**Priority:** High  
**Estimate:** M  
**Phase:** 2  
**Assigned to:** Engineering Owner  
**Target date:** 2026-03-20  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Define and approve the GitHub Pages deployment workflow contract, including CI permissions, the Pages Actions trio sequence, artifact handling, custom domain source of truth, rollback plan, and operational constraints. This contract becomes the exact specification for the deployment workflow YAML file in Phase 3 (or Phase 7). Every constraint documented here is derived from GitHub Pages limitations that, if violated, produce silent failures: incorrect permissions cause deploy failures; incorrect artifact format causes silent content omission; incorrect domain handling causes cutover failures.

The engineering owner must approve this contract. The deployment contract is also a dependency for defining the deployment integrity validation gate in RHI-017.

---

### Acceptance Criteria

- [ ] Workflow trigger strategy is confirmed:
  - [ ] Deploy on push to `main`
  - [ ] `workflow_dispatch` manual trigger included for emergency redeployment
- [ ] Workflow permissions are documented (minimum required):
  - [ ] `contents: read`
  - [ ] `pages: write`
  - [ ] `id-token: write`
  - [ ] No broader permissions granted
- [ ] Deployment job uses the official Pages Actions trio in correct order:
  - [ ] `actions/configure-pages`
  - [ ] `actions/upload-pages-artifact` with `artifact: github-pages`
  - [ ] `actions/deploy-pages`
- [ ] Deploy job references `environment: github-pages` for OIDC token scoping
- [ ] `concurrency` is configured correctly:
  - [ ] Build/test jobs: `cancel-in-progress: true`
  - [ ] Deploy job: `cancel-in-progress: false` (never cancel an in-progress deploy)
- [ ] Hugo version pin strategy is documented (ties to RHI-011 version decision): `HUGO_VERSION` env var, not `latest`
- [ ] Build command is confirmed: `hugo --minify --environment production`
- [ ] Build flags explicitly excluded: `--buildDrafts`, `--buildFuture`, `--buildExpired`
- [ ] Artifact path is confirmed: `./public`
- [ ] `fetch-depth: 0` checkout is addressed: decision recorded on whether `.GitInfo` / `.Lastmod` are needed (requires full history) or shallow checkout is sufficient
- [ ] Custom domain source of truth is documented:
  - [ ] Domain configured in GitHub repository Pages settings (not a committed `CNAME` file alone)
  - [ ] Relationship between `CNAME` file (if any) and Pages settings is documented
- [ ] Artifact size and build-time budgets are estimated from Phase 1 URL inventory (content volume)
- [ ] Rollback plan is documented:
  - [ ] Identify last good artifact SHA in Actions run history
  - [ ] Re-run deploy job from that run (not just build job)
  - [ ] Record rollback decision in `monitoring/launch-cutover-log.md`
- [ ] `.nojekyll` handling decision is documented: required or not for artifact-based Pages deployment
- [ ] Actions version pinning strategy is documented: full SHA for security-sensitive operations or verified version tags
- [ ] Workflow contract is recorded in Outcomes and referenced from `analysis/plan/details/phase-2.md`

---

### Tasks

- [ ] Review `analysis/plan/details/phase-2.md` §Workstream F with engineering owner
- [ ] Confirm workflow triggers: `push` to `main` and `workflow_dispatch`
- [ ] Define minimum required workflow permissions; document why broader grants are not needed
- [ ] Confirm the Pages Actions trio and their required order; document version tags or SHAs to pin
- [ ] Confirm `environment: github-pages` on the deploy job
- [ ] Define concurrency groups for build and deploy jobs separately
- [ ] Confirm Hugo version pin approach (from RHI-011); document `HUGO_VERSION` env var name and location
- [ ] Confirm build command and excluded flags
- [ ] Confirm artifact path and artifact name (`github-pages`)
- [ ] Decide on `fetch-depth: 0` vs shallow checkout:
  - Does the site use `.GitInfo` for `lastmod` values?
  - If yes, `fetch-depth: 0` is required; document this
  - If no, shallow checkout is preferred for build speed
- [ ] Research and document custom domain handling:
  - Is a `CNAME` file in `static/` required for artifact-based Pages deployment?
  - How is domain configuration persisted across deployments?
  - Document authoritative source for custom domain configuration
- [ ] Estimate artifact size from Phase 1 URL count (approximate pages × average HTML size)
- [ ] Define build time budget (acceptable CI build time ceiling before investigation is triggered)
- [ ] Document rollback procedure as a numbered runbook
- [ ] Decide on `.nojekyll` requirement for artifact-based (non-branch) Pages deployment
- [ ] Define Actions version pinning approach: SHA-pin vs. tag-pin; document the rule
- [ ] Record all decisions in Outcomes
- [ ] Update `analysis/plan/details/phase-2.md` §Workstream F

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
| RHI-010 Done — Phase 2 kickoff and decision owners confirmed | Ticket | Pending |
| RHI-011 In Progress — Hugo version pin and artifact path confirmed | Ticket | Pending |
| Engineering owner available for workflow and operations review | Access | Pending |
| GitHub repository Pages settings accessible | Access | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| `cancel-in-progress: true` on deploy job causes a partially completed deployment | Medium | High | Explicitly set `cancel-in-progress: false` for deploy job in this contract; enforce in Phase 3 workflow YAML | Engineering Owner |
| Incorrect workflow permissions cause OIDC token scoping failure and deploy rejection | Low | High | Use minimum permissions listed in this contract; test with `workflow_dispatch` before pushing to main | Engineering Owner |
| `CNAME` file missing from artifact causes custom domain reset on each deploy | Medium | High | Research GitHub Pages artifact deployment behavior; document whether `CNAME` in `static/` is required | Engineering Owner |
| Build artifact size exceeds GitHub Pages 1 GB limit | Low | High | Estimate artifact size from URL inventory; flag if risk exists; optimize image handling before Phase 7 | Engineering Owner |
| Rollback requires a rebuild rather than re-deploy of an existing artifact | Low | Medium | Confirm Pages artifact retention policy; document whether re-running deploy job alone is sufficient | Engineering Owner |

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

- Approved deployment workflow contract (recorded in this ticket's Outcomes)
- Rollback runbook
- Updated `analysis/plan/details/phase-2.md` §Workstream F

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- `cancel-in-progress: false` on the deploy job is a hard rule. Cancelling a Pages deployment mid-run can leave the site in an indeterminate state. This has been observed to serve mixed content or stale pages until the next successful deploy.
- The Pages artifact size limit is 1 GB (compressed). For a blog migration with a moderate media volume, this is rarely an issue, but confirm artifact includes only `public/` output and not source files.
- Reference: `analysis/plan/details/phase-2.md` §Workstream F
- Reference: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- Reference: https://github.com/actions/deploy-pages
- Reference: https://github.com/actions/upload-pages-artifact
