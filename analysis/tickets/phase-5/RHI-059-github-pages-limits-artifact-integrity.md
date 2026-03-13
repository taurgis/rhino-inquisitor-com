## RHI-059 · Workstream L — GitHub Pages Limits and Artifact Integrity

**Status:** Done  
**Priority:** High  
**Estimate:** S  
**Phase:** 5  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-25  
**Created:** 2026-03-07  
**Updated:** 2026-03-13

---

### Goal

Ensure the Hugo production build and Pages deployment artifact remain within documented GitHub Pages constraints and that no hosting limitation becomes a launch-day surprise. Track alias-generated redirect file growth, enforce build artifact size and format checks in CI, and verify custom domain DNS and HTTPS readiness before Phase 7 cutover.

GitHub Pages site limits are hard constraints — a site that exceeds the 1 GB published size limit, produces a malformed artifact, or has a DNS configuration error on the custom domain will fail to deploy or serve content. These failures cannot be corrected mid-cutover. This workstream prevents them by making artifact integrity a CI gate before launch.

---

### Acceptance Criteria

- [x] `migration/reports/phase-5-pages-constraints-report.md` is committed and documents:
  - [x] Current `public/` output size (in MB) and headroom against the 1 GB Pages limit
  - [x] Artifact file count and structure conformance with `actions/upload-pages-artifact` requirements
  - [x] Alias-generated redirect file count and estimated size contribution per 100 aliases
  - [x] Build time is recorded for the measured production build path, and the CI workflow now exports the same metric on runner builds
  - [x] Confirmed absence of symbolic links in `public/` (GitHub Pages rejects them silently)
- [x] CI gate `check:pages-constraints` exists and:
  - [x] Measures `public/` directory size after a production build
  - [x] Fails if total size exceeds a configurable threshold (default: 800 MB — 80% of Pages limit, providing headroom)
  - [x] Measures artifact file count
  - [x] Detects symbolic links in `public/` (fail if any present)
  - [x] Produces a summary in console output and optionally to a report file
  - [x] Is referenced in `package.json` as `npm run check:pages-constraints`
- [x] Alias (redirect page) growth is monitored:
  - [x] Total alias count is recorded from `url-manifest.json` (`merge` disposition records)
  - [x] Estimated size impact per 100 aliases is documented (each alias generates one HTML file, typically 1–2 KB)
  - [x] Warning threshold defined: if alias count exceeds 500 records, evaluate edge redirect alternative
- [x] Custom domain and HTTPS readiness handling is documented per owner-approved launch timing:
  - [x] Current public DNS state for `www.rhino-inquisitor.com` is recorded in the report
  - [x] GitHub Pages custom-domain and HTTPS verification is explicitly deferred to Phase 9 by owner approval
  - [x] `.nojekyll` file exists in `src/static/` to prevent unintended Jekyll processing
  - [x] GitHub Pages repository settings remain recorded as the source of truth, without treating direct settings access as a Phase 5 repo blocker
- [x] No symbolic links exist in `public/` after a local production build

---

### Tasks

- [x] Run a local production build and measure artifact:
  - [x] Record `public/` directory size: `du -sh public/`
  - [x] Record file count: `find public/ -type f | wc -l`
  - [x] Check for symbolic links: `find public/ -type l`
  - [x] Record alias count from `url-manifest.json` merge records
  - [x] Record build time
- [x] Create `scripts/seo/check-pages-constraints.js` (or shell script equivalent):
  - [x] Measure `public/` size using Node.js `fs` or `du` subprocess
  - [x] Compare against configurable threshold (default 800 MB)
  - [x] Detect symbolic links using `find -type l`
  - [x] Output pass/fail summary to console
- [x] Verify `.nojekyll` file exists in `src/static/`:
  - [x] If absent, create `src/static/.nojekyll` (empty file)
- [x] Record GitHub Pages custom domain readiness handling:
  - [x] Document current DNS configuration in `migration/reports/phase-5-pages-constraints-report.md`
  - [x] Record owner-approved deferral of GitHub Pages settings and HTTPS verification to Phase 9
- [x] Draft `migration/reports/phase-5-pages-constraints-report.md` with all measurements and confirmations
- [x] Add `"check:pages-constraints": "node scripts/seo/check-pages-constraints.js"` to `package.json`
- [x] Integrate `check:pages-constraints` as a blocking step in the deploy CI workflow

---

### Out of Scope

- Edge CDN infrastructure setup (Phase 6 scope)
- DNS cutover execution (Phase 7 scope)
- GitHub Pages build rate limits for branch-based builds (using custom GitHub Actions workflow, not native Pages build)
- Repository size limits separate from Pages artifact limits (different constraint)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-047 Done — Phase 5 Bootstrap complete | Ticket | Done |
| RHI-029 Done — Phase 3 CI/CD deployment scaffolding (workflow confirmed working) | Ticket | Done |
| RHI-049 Done — Redirect signal matrix (alias count known) | Ticket | Done |
| Custom domain DNS access confirmation | Access | Owner-approved defer to Phase 9 |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Large number of Hugo alias redirect files inflates artifact size unexpectedly | Medium | Medium | Measure alias file size contribution early; if >200 MB from aliases alone, switch to edge redirect layer and remove from Hugo aliases | Engineering Owner |
| Symbolic links in `public/` cause silent Pages deployment failure | Low | High | `check:pages-constraints` detects symbolic links as a blocking CI gate | Engineering Owner |
| HTTPS certificate issuance fails after domain cutover due to Pages configuration mismatch | Low | High | Pre-verify DNS and Pages CNAME configuration before cutover; record in report as a pre-cutover checklist item | Engineering Owner |
| Pages deployment step exceeds GitHub Pages deployment timeout (10 minutes) due to oversized artifact or publish bottlenecks | Low | High | Keep artifact size below gate threshold, monitor deploy-step duration, and split/optimize payload before release candidate | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-059 is complete. The repository now has a deterministic Pages artifact constraints gate, committed Phase 5 artifact-baseline evidence, PR and deploy workflow enforcement, and a source-controlled `.nojekyll` marker so local and CI artifacts are validated the same way. Thomas Theunen also approved deferring GitHub Pages custom-domain settings verification and HTTPS confirmation to Phase 9, so the ticket closes with the current DNS baseline and accepted timing decision documented instead of treating direct repository-settings access as a Phase 5 blocker.

**Delivered artefacts:**

- `migration/reports/phase-5-pages-constraints-report.md`
- `scripts/seo/check-pages-constraints.js`
- `src/static/.nojekyll` confirmed or created
- `package.json` updated with `check:pages-constraints` script
- CI workflow updated with `check:pages-constraints` blocking gate
- `analysis/documentation/phase-5/rhi-059-github-pages-limits-artifact-integrity-implementation-2026-03-13.md`

**Deviations from plan:**

- GitHub Pages custom-domain repository-settings verification and HTTPS confirmation are deferred to Phase 9 by owner approval. Phase 5 records the current public DNS state and accepted defer decision instead of requiring direct settings access in this ticket.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-13 | In Progress | Added `check:pages-constraints`, committed `migration/reports/phase-5-pages-constraints-report.md`, made `src/static/.nojekyll` the source-controlled marker, and wired the Pages artifact gate into the PR and deploy workflows. Current local baseline is `85.59 MB`, `1870` files, `0` symbolic links, and `0` hard links with `140` manifest merge records (`124` `pages-static`, `16` `edge-cdn`). The ticket remains open because `www.rhino-inquisitor.com` is still on the legacy production stack and GitHub Pages repository settings/HTTPS state could not be verified from the current environment. |
| 2026-03-13 | Done | Thomas Theunen approved deferring GitHub Pages custom-domain repository-settings verification and HTTPS confirmation to Phase 9 because go-live configuration will be completed there. RHI-059 therefore closes with the Pages constraints gate, current DNS baseline, and owner-accepted defer decision recorded as the delivered outcome. |

---

### Notes

- Published GitHub Pages sites may be no larger than 1 GB. Treat this as a hard cap for release readiness and keep the CI gate threshold at 800 MB to preserve operational headroom.
- Custom GitHub Actions workflows (using `actions/upload-pages-artifact` and `actions/deploy-pages`) are NOT subject to the GitHub Pages 10 builds/hour soft limit that applies to native Jekyll builds. However, artifact upload size and format constraints still apply.
- For Actions-based Pages publishing, GitHub Pages repository settings remain the source of truth for the custom domain and HTTPS state. The committed report currently records the observable DNS state plus an explicit pending manual-settings verification note rather than claiming cutover readiness.
- Reference: `analysis/plan/details/phase-5.md` §Workstream L: GitHub Pages Limits and Artifact Integrity
