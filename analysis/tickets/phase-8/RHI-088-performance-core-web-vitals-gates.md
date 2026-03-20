## RHI-088 · Workstream E — Performance and Core Web Vitals Gates

**Status:** Done  
**Priority:** High  
**Estimate:** M  
**Phase:** 8  
**Assigned to:** Engineering Owner  
**Target date:** 2026-06-09  
**Created:** 2026-03-08  
**Updated:** 2026-03-20

---

### Goal

Establish and enforce measurable performance thresholds so the Hugo site does not launch with avoidable user-experience regressions relative to the WordPress baseline captured in Phase 1. Lighthouse lab scores serve as regression gates — not substitutes for real-world field Core Web Vitals — and must block launch if mandatory thresholds are not met on the homepage and article template. The performance budget baseline sets a starting point for ongoing post-launch monitoring.

---

### Acceptance Criteria

- [x] Lighthouse CI gates pass on the RC build with blocking thresholds enforced:
  - [x] Performance ≥ 90 (median of three runs) for homepage and article template
  - [x] Accessibility ≥ 90 (median of three runs) for all sampled templates
  - [x] SEO ≥ 95 (median of three runs) for all sampled templates
  - [x] Best Practices ≥ 90 (median of three runs) for all sampled templates
  - [x] Thresholds apply to deterministic URLs from `validation/sample-matrix.json`: homepage, first sampled post, first sampled category page
- [x] Core Web Vitals targets are documented (field data evaluated when available; lab gates enforced at launch):
  - [x] LCP ≤ 2.5 s (target; lab equivalent used when field data unavailable)
  - [x] INP ≤ 200 ms (target; note: static Hugo sites have minimal JS interaction)
  - [x] CLS ≤ 0.1 (target; especially relevant for image-heavy pages if dimensions not set)
  - [x] Field CWV uses p75 when data is available; it is tracked as readiness evidence and not used to override blocking lab gates at launch when field data is sparse
- [x] Performance budget baseline is defined and documented:
  - [x] Critical-path transfer target: < 170 KB compressed for initial page load
  - [x] Budget applies to homepage and article template at minimum
  - [x] TTI documented as informational (non-blocking) trend metric
- [x] Lighthouse CI configuration (`lighthouserc.js`) is updated with Phase 8 blocking thresholds:
  - [x] `assert` blocks set for Performance, Accessibility, SEO, Best Practices with minimum scores
  - [x] `collect.numberOfRuns: 3` to reduce score variance
  - [x] URLs include homepage, a post page, and a category page
  - [x] `upload.target: filesystem` to archive reports as local artifacts
- [x] Lighthouse reports are archived as CI artifacts with 30-day retention:
  - [x] `validation/lhci-report/` — Lighthouse CI JSON results and HTML reports
- [x] Performance budget report is committed:
  - [x] `validation/performance-budget-report.json` — critical-path size per template, LCP/CLS lab values, Lighthouse scores per URL

---

### Tasks

- [x] Update `lighthouserc.js` to enforce Phase 8 blocking thresholds:
  - [x] Add `assert` configuration for: `categories:performance >= 0.90`, `categories:accessibility >= 0.90`, `categories:seo >= 0.95`, `categories:best-practices >= 0.90`
  - [x] Set `collect.numberOfRuns: 3`
  - [x] Add all three target URLs (homepage, post, category)
  - [x] Set `upload.target: filesystem` with output to `validation/lhci-report/`
- [x] Run Lighthouse CI against the RC build and record results:
  - [x] Static mode using `lhci autorun --collect.staticDistDir=./public` or equivalent
  - [ ] If static mode is unreliable, spin up a local server (`npx serve public/`) and use URL mode
  - [x] Record median scores per URL and per category
- [x] Create `scripts/phase-8/check-performance-budget.js`:
  - [x] Use `fast-glob` to enumerate HTML, JS, CSS, and image assets for homepage and article pages in `public/`
  - [x] Calculate compressed critical-path transfer size using estimated gzip ratios or actual sizes
  - [x] Extract LCP and CLS lab values from Lighthouse JSON results in `validation/lhci-report/`
  - [x] Output `validation/performance-budget-report.json` with per-template breakdown
  - [x] Exit with non-zero code if any template exceeds the 170 KB critical-path budget
- [x] Baseline WordPress performance comparison:
  - [x] Retrieve Phase 1 performance baseline from `migration/phase-1-performance-baseline.md`
  - [x] Compare Hugo RC Lighthouse scores against WordPress baseline
  - [x] Document improvement or regression in the performance budget report
- [x] Update `.github/workflows/deploy-pages.yml`:
  - [x] Upgrade Lighthouse job from advisory (Phase 7) to blocking status with the Phase 8 threshold configuration
  - [x] Wire performance budget check as a blocking step
  - [x] Upload Lighthouse CI reports and budget report as CI artifacts with 30-day retention
- [x] Add `package.json` scripts:
  - [x] `"check:perf-budget": "node scripts/phase-8/check-performance-budget.js"`
  - [x] `"lhci:run:p8"` runs the Phase 8 dual-profile LHCI wrapper so both blocking profiles archive filesystem reports.

---

### Out of Scope

- Real-field CWV measurement (requires live traffic; this is Phase 9 monitoring scope)
- Optimizing assets or template code to improve performance (changes require RC re-cut per RHI-084 protocol)
- Setting video performance budgets (video-specific performance tuning is post-launch scope)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-083 Done — Phase 8 Bootstrap complete | Ticket | Pending |
| RHI-084 Done — RC frozen, sample matrix committed | Ticket | Pending |
| `@lhci/cli` installed and `lighthouserc.js` committed from Phase 7 (RHI-079) | Phase | Pending |
| `migration/phase-1-performance-baseline.md` available for comparison | Phase | Pending |
| Hugo production build of RC exits 0 (required before Lighthouse scan) | Build | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Lighthouse score variability causes flaky gate failures | High | Medium | Use `numberOfRuns: 3` and enforce on the median; if flakiness persists, investigate CI environment resource constraints (underpowered runner) | Engineering Owner |
| CLS failures caused by images without explicit `width` and `height` attributes | Medium | High | Check Hugo image shortcode and template output for explicit dimensions; missing dimensions are a common cause of CLS on migrated content | Engineering Owner |
| Performance budget exceeded due to large unoptimized images migrated from WordPress | Medium | High | If exceeded, identify top contributors with the budget report; fix in a targeted asset optimization pass and re-cut RC | Engineering Owner |
| Lighthouse static mode produces different scores than URL mode | Medium | Low | Prefer URL mode with a local server for more representative results; document the mode used in the report | Engineering Owner |
| Field CWV data unavailable at launch (site not indexed yet) | High | Low | Expected at launch; fall back to lab gates exclusively; schedule the first field CWV check for 4 weeks post-launch when CrUX data becomes available | Migration Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-088 closed on 2026-03-20 after an RC-safe remediation path. The repository first implemented the dual-profile Lighthouse and performance-budget gate, then performed the required Hugo template remediation for homepage/article image weight, committed the code snapshot, tagged it as `phase-8-rc-v2`, regenerated the Phase 8 datasets against the re-cut RC, and reran the WS-E gate stack successfully.

The committed `validation/performance-budget-report.json` now passes with `phase-8-rc-v2` metadata. The remediated homepage critical-path transfer is `109034` bytes (`106.48 KB`), and the first sampled article is `131235` bytes (`128.16 KB`), both under the blocking `170 KB` threshold. Mobile and desktop Lighthouse runs also passed the blocking category thresholds for homepage, first sampled post, and first sampled category.

**Delivered artefacts:**

- `lighthouserc.js` — updated with Phase 8 blocking thresholds (`assert` configuration)
- `scripts/phase-8/check-performance-budget.js` — critical-path budget gate script
- `scripts/phase-8/run-lhci.js` — dual-profile LHCI runner with override support for clean RC evidence reruns
- `scripts/phase-8/run-performance-gates.js` — wrapper that coordinates LHCI and the budget report
- `validation/lhci-report/` — Lighthouse CI JSON results and HTML reports from RC
- `validation/performance-budget-report.json` — critical-path size and CWV lab values per template
- `migration/phase-8-rc-v2-record.md` — human-readable RC re-cut record for the performance remediation snapshot
- `validation/runs/phase-8-rc-v2.json` — machine-readable RC re-cut snapshot with build and checksum evidence
- `validation/runs/phase-8-rc-v2-artifact-validation.json` — artifact validation evidence for the re-cut RC build
- Updated `package.json` with `check:perf-budget` and `lhci:run:p8` scripts
- Updated `.github/workflows/deploy-pages.yml` with Lighthouse and budget gates as blocking steps

**Deviations from plan:**

- `lhci:run:p8` is implemented as a Phase 8 wrapper script instead of a single bare `lhci autorun` command so both required blocking profiles (mobile and desktop) run and archive their filesystem reports deterministically.
- The homepage remediation intentionally keeps the portrait as the primary eager LCP candidate and downgrades the featured-card image from eager to lazy loading so the budget reflects the critical path instead of a secondary content image.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | Open | Ticket created |
| 2026-03-20 | In Progress | Implemented the Phase 8 dual-profile LHCI gate, performance-budget report, workflow artifact uploads, and documentation update. Static-dist build validation passed all Lighthouse category thresholds for homepage, first sampled post, and first sampled category on both mobile and desktop, but the committed budget report recorded blocking 170 KB compressed budget overruns on the homepage (`271221` bytes) and first sampled post (`204429` bytes). Ticket remains open pending RC-safe remediation through the out-of-scope optimization / RC re-cut path. |
| 2026-03-20 | Done | Committed the remediation snapshot, tagged it as `phase-8-rc-v2` on `efdcefce`, regenerated the validation datasets, and reran the RC-scoped WS-E evidence. The committed performance report now passes the blocking budget and dual-profile Lighthouse thresholds for the sampled homepage, article, and category routes. |

---

### Notes

- Lighthouse scores vary run-to-run, especially in constrained CI environments. Always use `numberOfRuns: 3` and evaluate the median. Never fail a build on a single run.
- CLS is the most likely CWV failure for migrated content: images, embeds, and ads that load after initial render can shift layout significantly. Check every image in the article template for explicit `width` and `height` attributes.
- The 170 KB critical-path budget is a starter value from `analysis/plan/details/phase-8.md`. Tune it post-launch based on real asset analysis for this site.
- Lighthouse's SEO category checks overlap with but do not replace WS-C (RHI-086). The Lighthouse SEO score catches a different subset of issues (e.g., font size, tap target size) than the canonical/sitemap/robots checks.
- Reference: `analysis/plan/details/phase-8.md` §Workstream E: Performance and Core Web Vitals Gates; https://web.dev/articles/vitals
