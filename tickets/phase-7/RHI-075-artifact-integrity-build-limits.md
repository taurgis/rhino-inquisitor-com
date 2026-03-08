## RHI-075 · Workstream B — Artifact Integrity and Build Limits

**Status:** Open  
**Priority:** High  
**Estimate:** M  
**Phase:** 7  
**Assigned to:** Engineering Owner  
**Target date:** 2026-05-22  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Ensure the Hugo build output produces a GitHub Pages-compatible artifact that is correctly structured, free of unsupported file types, and within GitHub Pages size and deployment constraints. Deploy-time failures caused by artifact shape problems (missing `index.html`, unexpected symlinks, or oversized artifacts) are silent and difficult to debug under cutover pressure. Catching these issues proactively via an artifact validation gate prevents a class of launch-blocking failures that have nothing to do with content quality or redirect logic.

This workstream establishes and validates the artifact integrity gate that runs as a blocking pre-deploy step in the deployment workflow.

---

### Acceptance Criteria

- [ ] Hugo production build output in `public/` satisfies all of the following structural constraints:
  - [ ] Top-level `public/index.html` exists
  - [ ] No symbolic links (`-type l`) exist anywhere in `public/`
  - [ ] No hard links exist in `public/` (all files have link count 1)
  - [ ] No special device files or pipes in `public/`
  - [ ] All file paths in `public/` use consistent lowercase naming (no Windows-origin case inconsistencies)
- [ ] Artifact size gate is in place:
  - [ ] Total compressed artifact size is measured and logged in the CI run
  - [ ] If compressed artifact approaches 700 MB (internal guardrail), CI warns and flags for review
  - [ ] CI fails if projected published site size exceeds 900 MB (hard stop before reaching the 1 GB Pages limit)
- [ ] Build output controls are applied:
  - [ ] `--gc` (garbage collection) and `--minify` flags are used in the production build command
  - [ ] No accidental source files, backup files, `node_modules`, or `.git` artifacts are present in `public/`
  - [ ] `public/` does not contain any `.map` source-map files (reduce artifact size and avoid leaking source)
- [ ] `scripts/phase-7/validate-artifact.js` exists and:
  - [ ] Checks for top-level `index.html`
  - [ ] Recursively checks for symbolic links and reports their paths
  - [ ] Reports total file count and estimated uncompressed size
  - [ ] Exits with non-zero code on any structural violation
  - [ ] Is referenced in `package.json` as `npm run validate:artifact`
- [ ] `npm run validate:artifact` is wired as a blocking step in `.github/workflows/deploy-pages.yml` before `actions/upload-pages-artifact`
- [ ] Artifact validator report is attached as a CI artifact on every main branch build

---

### Tasks

- [ ] Run the current Hugo production build locally: `hugo --gc --minify --environment production`
- [ ] Inspect `public/` output:
  - [ ] Confirm `public/index.html` exists
  - [ ] Run `find public/ -type l` and confirm zero symlinks
  - [ ] Run `find public/ -type f -links +1` and confirm zero hard links
  - [ ] Run `find public/ -name "*.map"` and confirm no source maps
  - [ ] Check for accidental inclusion of non-site files
- [ ] Measure artifact size:
  - [ ] `du -sh public/` for uncompressed size
  - [ ] Create a temporary tar and check compressed size: `tar -czf /tmp/site-artifact.tar.gz public/ && ls -lh /tmp/site-artifact.tar.gz`
  - [ ] Compare against 700 MB guardrail and 1 GB hard limit
- [ ] Write `scripts/phase-7/validate-artifact.js`:
  - [ ] Use `fast-glob` to list all files in `public/`
  - [ ] Check for `public/index.html` existence
  - [ ] Use Node `fs.lstatSync` to detect symbolic links (check `isSymbolicLink()`)
  - [ ] Accumulate total file size and report
  - [ ] Apply warn threshold (700 MB) and error threshold (900 MB)
  - [ ] Output a structured report to stdout (JSON or human-readable summary)
  - [ ] Exit 1 on any structural violation or size breach
- [ ] Add `"validate:artifact": "node scripts/phase-7/validate-artifact.js"` to `package.json` scripts
- [ ] Add the artifact size and structure check to `mkdir scripts/phase-7/` if it does not exist
- [ ] Wire `npm run validate:artifact` into `.github/workflows/deploy-pages.yml` as a blocking step after Hugo build and before `actions/upload-pages-artifact`:
  - [ ] Step runs the artifact validator
  - [ ] Step fails the build on non-zero exit code
  - [ ] Step uploads the validator output as a CI artifact (`actions/upload-artifact`)
- [ ] Test in CI via `workflow_dispatch`; confirm gate runs and output is attached to the run
- [ ] Document artifact budget and interpretation guide in `docs/migration/RUNBOOK.md`

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
| RHI-073 Done — Phase 7 Bootstrap complete | Ticket | Pending |
| RHI-074 Done — Deployment workflow architecture complete (workflow must exist to wire the gate) | Ticket | Pending |
| Phase 4 media migration (RHI-037) output committed — artifact contains all production media | Ticket | Pending |
| `fast-glob` available in `package.json` (from Phase 3 tooling) | Tool | Pending |

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- `scripts/phase-7/validate-artifact.js` — artifact integrity and size validation script
- `package.json` updated with `validate:artifact` script
- `.github/workflows/deploy-pages.yml` updated to wire artifact gate before upload
- CI artifact: artifact validator report attached to build run

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- GitHub Pages silently rejects artifacts containing symbolic links. The failure mode is a successful `actions/upload-pages-artifact` step followed by an opaque deploy error. Pre-flight validation catches this before upload and provides a clear failure message.
- The `.nojekyll` file is **not required** for GitHub Pages custom workflow deployments — it is only relevant for branch-based (`gh-pages` branch) publishing patterns. Do not add it to the production artifact for the custom workflow path.
- The 1 GB published-site size limit is a hard constraint from GitHub. The 700 MB internal guardrail gives headroom for organic content growth after launch. If the initial artifact is close to 700 MB, investigate image optimization in Phase 4 outputs before proceeding.
- Monthly bandwidth usage on GitHub Pages has a 100 GB soft guidance limit. If the site has high media volumes or high traffic, monitor bandwidth post-launch (Phase 9). This ticket does not need to solve for bandwidth — just ensure the artifact itself is within structural limits.
- Reference: `analysis/plan/details/phase-7.md` §Workstream B: Artifact Integrity and Build Limits; GitHub Pages limits: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
