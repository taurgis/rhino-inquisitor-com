## RHI-059 · Workstream L — GitHub Pages Limits and Artifact Integrity

**Status:** Open  
**Priority:** High  
**Estimate:** S  
**Phase:** 5  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-25  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Ensure the Hugo production build and Pages deployment artifact remain within documented GitHub Pages constraints and that no hosting limitation becomes a launch-day surprise. Track alias-generated redirect file growth, enforce build artifact size and format checks in CI, and verify custom domain DNS and HTTPS readiness before Phase 7 cutover.

GitHub Pages site limits are hard constraints — a site that exceeds the 1 GB published size limit, produces a malformed artifact, or has a DNS configuration error on the custom domain will fail to deploy or serve content. These failures cannot be corrected mid-cutover. This workstream prevents them by making artifact integrity a CI gate before launch.

---

### Acceptance Criteria

- [ ] `migration/reports/phase-5-pages-constraints-report.md` is committed and documents:
  - [ ] Current `public/` output size (in MB) and headroom against the 1 GB Pages limit
  - [ ] Artifact file count and structure conformance with `actions/upload-pages-artifact` requirements
  - [ ] Alias-generated redirect file count and estimated size contribution per 100 aliases
  - [ ] Build time on CI runner for a full production build
  - [ ] Confirmed absence of symbolic links in `public/` (GitHub Pages rejects them silently)
- [ ] CI gate `check:pages-constraints` exists and:
  - [ ] Measures `public/` directory size after a production build
  - [ ] Fails if total size exceeds a configurable threshold (default: 800 MB — 80% of Pages limit, providing headroom)
  - [ ] Measures artifact file count
  - [ ] Detects symbolic links in `public/` (fail if any present)
  - [ ] Produces a summary in console output and optionally to a report file
  - [ ] Is referenced in `package.json` as `npm run check:pages-constraints`
- [ ] Alias (redirect page) growth is monitored:
  - [ ] Total alias count is recorded from `url-manifest.json` (`merge` disposition records)
  - [ ] Estimated size impact per 100 aliases is documented (each alias generates one HTML file, typically 1–2 KB)
  - [ ] Warning threshold defined: if alias count exceeds 500 records, evaluate edge redirect alternative
- [ ] Custom domain and HTTPS readiness is verified (pre-cutover check):
  - [ ] Domain CNAME (`www.rhino-inquisitor.com`) points to the correct GitHub Pages target
  - [ ] HTTPS certificate issuance is confirmed by GitHub Pages settings
  - [ ] `.nojekyll` file exists in `static/` to prevent unintended Jekyll processing
  - [ ] GitHub Pages custom domain configuration in repository Settings matches `CNAME` or API configuration
- [ ] No symbolic links exist in `public/` after a local production build

---

### Tasks

- [ ] Run a local production build and measure artifact:
  - [ ] Record `public/` directory size: `du -sh public/`
  - [ ] Record file count: `find public/ -type f | wc -l`
  - [ ] Check for symbolic links: `find public/ -type l`
  - [ ] Record alias count from `url-manifest.json` merge records
  - [ ] Record build time
- [ ] Create `scripts/seo/check-pages-constraints.js` (or shell script equivalent):
  - [ ] Measure `public/` size using Node.js `fs` or `du` subprocess
  - [ ] Compare against configurable threshold (default 800 MB)
  - [ ] Detect symbolic links using `find -type l`
  - [ ] Output pass/fail summary to console
- [ ] Verify `.nojekyll` file exists in `static/`:
  - [ ] If absent, create `static/.nojekyll` (empty file)
- [ ] Verify GitHub Pages custom domain readiness:
  - [ ] Confirm CNAME DNS record for `www.rhino-inquisitor.com` exists and points to `taurgis.github.io` (or the correct Pages target)
  - [ ] Confirm HTTPS enforcement is enabled in Pages settings
  - [ ] Document DNS configuration in `migration/reports/phase-5-pages-constraints-report.md`
- [ ] Draft `migration/reports/phase-5-pages-constraints-report.md` with all measurements and confirmations
- [ ] Add `"check:pages-constraints": "node scripts/seo/check-pages-constraints.js"` to `package.json`
- [ ] Integrate `check:pages-constraints` as a blocking step in the deploy CI workflow

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
| RHI-047 Done — Phase 5 Bootstrap complete | Ticket | Pending |
| RHI-029 Done — Phase 3 CI/CD deployment scaffolding (workflow confirmed working) | Ticket | Pending |
| RHI-049 Done — Redirect signal matrix (alias count known) | Ticket | Pending |
| Custom domain DNS access confirmation | Access | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Large number of Hugo alias redirect files inflates artifact size unexpectedly | Medium | Medium | Measure alias file size contribution early; if >200 MB from aliases alone, switch to edge redirect layer and remove from Hugo aliases | Engineering Owner |
| Symbolic links in `public/` cause silent Pages deployment failure | Low | High | `check:pages-constraints` detects symbolic links as a blocking CI gate | Engineering Owner |
| HTTPS certificate issuance fails after domain cutover due to Pages configuration mismatch | Low | High | Pre-verify DNS and Pages CNAME configuration before cutover; record in report as a pre-cutover checklist item | Engineering Owner |
| Production build time exceeds GitHub Actions job timeout (6 hours) due to image volume | Very Low | High | Record baseline build time now; if it approaches 30+ minutes, investigate Hugo caching options | Engineering Owner |

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

- `migration/reports/phase-5-pages-constraints-report.md`
- `scripts/seo/check-pages-constraints.js`
- `static/.nojekyll` confirmed or created
- `package.json` updated with `check:pages-constraints` script
- CI workflow updated with `check:pages-constraints` blocking gate

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- GitHub Pages published site size limit is 1 GB. This is a soft limit that GitHub recommends sites stay under. There is no hard error at exactly 1 GB, but GitHub may reject or throttle sites that consistently exceed it. Use 800 MB as the CI gate threshold to maintain safe headroom.
- Custom GitHub Actions workflows (using `actions/upload-pages-artifact` and `actions/deploy-pages`) are NOT subject to the GitHub Pages 10 builds/hour soft limit that applies to native Jekyll builds. However, artifact upload size and format constraints still apply.
- Reference: `analysis/plan/details/phase-5.md` §Workstream L: GitHub Pages Limits and Artifact Integrity
