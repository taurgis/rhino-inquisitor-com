## RHI-075 · Workstream B — Artifact Integrity and Build Limits

**Status:** Done  
**Priority:** High  
**Estimate:** M  
**Phase:** 7  
**Assigned to:** Engineering Owner  
**Target date:** 2026-05-22  
**Created:** 2026-03-07  
**Updated:** 2026-03-16

---

### Goal

Ensure the Hugo build output produces a GitHub Pages-compatible artifact that is correctly structured, free of unsupported file types, and within GitHub Pages size and deployment constraints. Deploy-time failures caused by artifact shape problems (missing `index.html`, unexpected symlinks, or oversized artifacts) are silent and difficult to debug under cutover pressure. Catching these issues proactively via an artifact validation gate prevents a class of launch-blocking failures that have nothing to do with content quality or redirect logic.

This workstream establishes and validates the artifact integrity gate that runs as a blocking pre-deploy step in the deployment workflow.

---

### Acceptance Criteria

- [x] Hugo production build output in `public/` satisfies all of the following structural constraints:
  - [x] Top-level `public/index.html` exists
  - [x] No symbolic links (`-type l`) exist anywhere in `public/`
  - [x] No hard links exist in `public/` (all files have link count 1)
  - [x] No special device files or pipes in `public/`
  - [x] All file paths in `public/` use consistent lowercase naming (with explicit owner-approved exceptions from `migration/url-manifest.json`)
- [x] Artifact size gate is in place:
  - [x] Total compressed artifact size is measured and logged in the CI run
  - [x] If compressed artifact approaches 700 MB (internal guardrail), CI warns and flags for review
  - [x] CI fails if projected published site size exceeds 900 MB (hard stop before reaching the 1 GB Pages limit)
- [x] Build output controls are applied:
  - [x] `--gc` (garbage collection) and `--minify` flags are used in the production build command
  - [x] No accidental source files, backup files, `node_modules`, or `.git` artifacts are present in `public/`
  - [x] `public/` does not contain any `.map` source-map files (reduce artifact size and avoid leaking source)
- [x] `scripts/phase-7/validate-artifact.js` exists and:
  - [x] Checks for top-level `index.html`
  - [x] Recursively checks for symbolic links and reports their paths
  - [x] Reports total file count and estimated uncompressed size
  - [x] Exits with non-zero code on any structural violation
  - [x] Is referenced in `package.json` as `npm run validate:artifact`
- [x] `npm run validate:artifact` is wired as a blocking step in `.github/workflows/deploy-pages.yml` before `actions/upload-pages-artifact`
- [x] Artifact validator report is attached as a CI artifact on every main branch build and must show zero structural violations on the release candidate

---

### Tasks

- [x] Run the current Hugo production build locally: `hugo --gc --minify --environment production`
- [x] Inspect `public/` output:
  - [x] Confirm `public/index.html` exists
  - [x] Run `find public/ -type l` and confirm zero symlinks
  - [x] Run `find public/ -type f -links +1` and confirm zero hard links
  - [x] Run `find public/ -name "*.map"` and confirm no source maps
  - [x] Check for accidental inclusion of non-site files
- [x] Measure artifact size:
  - [x] `du -sh public/` for uncompressed size
  - [x] Create a temporary tar and check compressed size: `tar -czf /tmp/site-artifact.tar.gz public/ && ls -lh /tmp/site-artifact.tar.gz`
  - [x] Compare against 700 MB guardrail and 1 GB hard limit
- [x] Write `scripts/phase-7/validate-artifact.js`:
  - [x] Use `fast-glob` to list all files in `public/`
  - [x] Check for `public/index.html` existence
  - [x] Use Node `fs.lstat`/`lstatSync` to detect symbolic links (check `isSymbolicLink()`)
  - [x] Accumulate total file size and report
  - [x] Apply warn threshold (700 MB) and error threshold (900 MB)
  - [x] Output a structured report to stdout (JSON or human-readable summary)
  - [x] Exit 1 on any structural violation or size breach
- [x] Add `"validate:artifact": "node scripts/phase-7/validate-artifact.js"` to `package.json` scripts
- [x] Create `scripts/phase-7/` if it does not exist and add the artifact size/structure validator there
- [x] Wire `npm run validate:artifact` into `.github/workflows/deploy-pages.yml` as a blocking step after Hugo build and before `actions/upload-pages-artifact`:
  - [x] Step runs the artifact validator
  - [x] Step fails the build on non-zero exit code
  - [x] Step uploads the validator output as a CI artifact (`actions/upload-artifact`)
- [x] Test in CI on the release-candidate deploy path; confirm gate runs and output is attached to the run
- [x] Document artifact budget and interpretation guide in `docs/migration/RUNBOOK.md`

---

### Out of Scope

- Optimizing Hugo template output size or compression (Phase 3 scope)
- Optimizing media asset sizes (Phase 4 scope — RHI-037)
- Managing GitHub Pages bandwidth usage (Phase 9 monitoring scope)
- Configuring CDN or object storage as an alternative artifact delivery path

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-073 Done — Phase 7 Bootstrap complete | Ticket | Done |
| RHI-074 baseline deploy workflow exists (`.github/workflows/deploy-pages.yml`) so WS-B can wire the gate when ready | Ticket | Done |
| Phase 4 media migration (RHI-037) output committed — artifact contains all production media | Ticket | Done |
| `fast-glob` available in `package.json` (from Phase 3 tooling) | Tool | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Artifact exceeds 1 GB Pages limit after media assets are included | Medium | High | Measure artifact size with full Phase 4 media content before WS-G launch window; if over limit, escalate to Phase 4 owner (RHI-037) for image optimization before cutover | Engineering Owner |
| Hugo build silently includes `node_modules` or source files due to misconfigured `.gitignore` or `public/` output scope | Low | Medium | Add explicit check for unexpected top-level directories in `public/`; run `du -sh public/*/` to surface unexpectedly large subdirectories | Engineering Owner |
| GitHub Pages deployment fails due to symlink in artifact (Pages silently rejects them) | Low | High | The symlink check in `validate-artifact.js` catches this before upload; ensure the check runs before `actions/upload-pages-artifact` | Engineering Owner |
| Pages deployment timeout (10-minute limit) exceeded by large artifact upload | Low | High | Measure upload time during dry-run deploy; if approaching 8 minutes, flag for image optimization before cutover | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-075 is fully verified by the successful release-candidate deployment run [#118](https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23145892296). The artifact gate ran before Pages upload, the dedicated validator artifact was attached, and deploy completed successfully.

**Delivered artefacts:**

- `scripts/phase-7/validate-artifact.js` — artifact integrity and size validation script
- `package.json` updated with `validate:artifact` script
- `.github/workflows/deploy-pages.yml` updated to wire artifact gate before upload, run production/preview artifact validation, and upload validator reports
- `docs/migration/RUNBOOK.md` updated with RHI-075 threshold interpretation and troubleshooting guidance
- `analysis/documentation/phase-7/rhi-075-artifact-integrity-build-limits-2026-03-16.md` implementation record added
- Bundle media renamed to lowercase to remove non-manifest uppercase output drift:
  - `src/content/posts/salesforce-b2c-commerce-cloud-23-2/rd-overview.mov`
  - `src/content/posts/what-is-new-in-the-23-8-commerce-cloud-release/cookie-support-demo.mp4`
- CI evidence from run [#118](https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23145892296):
  - overall status: success
  - total duration: 6m 9s
  - build duration: 5m 24s
  - deploy duration: 36s
  - deployed URL: `http://staging.rhino-inquisitor.com/`
  - `github-pages` artifact: 524 MB
  - `phase-7-artifact-validator-f780d1c4a417cdef9ecc505b1cb5777bfced27cc` artifact: 1.43 KB

**Deviations from plan:**

- CI evidence was captured from the push-to-`main` release-candidate run rather than a separate `workflow_dispatch` rerun because the same `deploy-pages.yml` path executed end-to-end and satisfied the acceptance criteria.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-16 | In Progress | Implemented `validate:artifact`, wired blocking workflow gate before Pages artifact upload, added validator report uploads, updated RUNBOOK + phase documentation, and completed local validation evidence (size/structure checks and negative-path `.map` failure test). CI `workflow_dispatch` evidence capture remains open. |
| 2026-03-16 | Done | Release-candidate run [#118](https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23145892296) passed end-to-end in 6m 9s. The build job completed in 5m 24s, deploy completed in 36s, the dedicated `phase-7-artifact-validator-f780d1c4a417cdef9ecc505b1cb5777bfced27cc` artifact was attached, and the `github-pages` artifact was uploaded at 524 MB with zero artifact-gate violations blocking release. |

---

### Notes

- GitHub Pages silently rejects artifacts containing symbolic links. The failure mode is a successful `actions/upload-pages-artifact` step followed by an opaque deploy error. Pre-flight validation catches this before upload and provides a clear failure message.
- The `.nojekyll` file is **not required** for GitHub Pages custom workflow deployments — it is only relevant for branch-based (`gh-pages` branch) publishing patterns. Do not add it to the production artifact for the custom workflow path.
- The 1 GB published-site size limit is a hard constraint from GitHub. The 700 MB internal guardrail gives headroom for organic content growth after launch. If the initial artifact is close to 700 MB, investigate image optimization in Phase 4 outputs before proceeding.
- Monthly bandwidth usage on GitHub Pages has a 100 GB soft guidance limit. If the site has high media volumes or high traffic, monitor bandwidth post-launch (Phase 9). This ticket does not need to solve for bandwidth — just ensure the artifact itself is within structural limits.
- Reference: `analysis/plan/details/phase-7.md` §Workstream B: Artifact Integrity and Build Limits; GitHub Pages limits: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
