## RHI-088 · Workstream E — Performance and Core Web Vitals Gates

**Status:** Open  
**Priority:** High  
**Estimate:** M  
**Phase:** 8  
**Assigned to:** Engineering Owner  
**Target date:** 2026-06-09  
**Created:** 2026-03-08  
**Updated:** 2026-03-08

---

### Goal

Establish and enforce measurable performance thresholds so the Hugo site does not launch with avoidable user-experience regressions relative to the WordPress baseline captured in Phase 1. Lighthouse lab scores serve as regression gates — not substitutes for real-world field Core Web Vitals — and must block launch if mandatory thresholds are not met on the homepage and article template. The performance budget baseline sets a starting point for ongoing post-launch monitoring.

---

### Acceptance Criteria

- [ ] Lighthouse CI gates pass on the RC build with blocking thresholds enforced:
  - [ ] Performance ≥ 90 (median of three runs) for homepage and article template
  - [ ] Accessibility ≥ 90 (median of three runs) for all sampled templates
  - [ ] SEO ≥ 95 (median of three runs) for all sampled templates
  - [ ] Best Practices ≥ 90 (median of three runs) for all sampled templates
  - [ ] Thresholds apply to: homepage, at least 1 representative post, at least 1 category page
- [ ] Core Web Vitals targets are documented (field data evaluated when available; lab gates enforced at launch):
  - [ ] LCP ≤ 2.5 s (target; lab equivalent used when field data unavailable)
  - [ ] INP ≤ 200 ms (target; note: static Hugo sites have minimal JS interaction)
  - [ ] CLS ≤ 0.1 (target; especially relevant for image-heavy pages if dimensions not set)
- [ ] Performance budget baseline is defined and documented:
  - [ ] Critical-path transfer target: < 170 KB compressed for initial page load
  - [ ] Budget applies to homepage and article template at minimum
  - [ ] TTI documented as informational (non-blocking) trend metric
- [ ] Lighthouse CI configuration (`lighthouserc.js`) is updated with Phase 8 blocking thresholds:
  - [ ] `assert` blocks set for Performance, Accessibility, SEO, Best Practices with minimum scores
  - [ ] `collect.numberOfRuns: 3` to reduce score variance
  - [ ] URLs include homepage, a post page, and a category page
  - [ ] `upload.target: filesystem` to archive reports as local artifacts
- [ ] Lighthouse reports are archived as CI artifacts with 30-day retention:
  - [ ] `validation/lhci-report/` — Lighthouse CI JSON results and HTML reports
- [ ] Performance budget report is committed:
  - [ ] `validation/performance-budget-report.json` — critical-path size per template, LCP/CLS lab values, Lighthouse scores per URL

---

### Tasks

- [ ] Update `lighthouserc.js` to enforce Phase 8 blocking thresholds:
  - [ ] Add `assert` configuration for: `categories:performance >= 0.90`, `categories:accessibility >= 0.90`, `categories:seo >= 0.95`, `categories:best-practices >= 0.90`
  - [ ] Set `collect.numberOfRuns: 3`
  - [ ] Add all three target URLs (homepage, post, category)
  - [ ] Set `upload.target: filesystem` with output to `validation/lhci-report/`
- [ ] Run Lighthouse CI against the RC build in three modes and record results:
  - [ ] Static mode using `lhci autorun --collect.staticDistDir=./public` or equivalent
  - [ ] If static mode is unreliable, spin up a local server (`npx serve public/`) and use URL mode
  - [ ] Record median scores per URL and per category
- [ ] Create `scripts/phase-8/check-performance-budget.js`:
  - [ ] Use `fast-glob` to enumerate HTML, JS, CSS, and image assets for homepage and article pages in `public/`
  - [ ] Calculate compressed critical-path transfer size using estimated gzip ratios or actual sizes
  - [ ] Extract LCP and CLS lab values from Lighthouse JSON results in `validation/lhci-report/`
  - [ ] Output `validation/performance-budget-report.json` with per-template breakdown
  - [ ] Exit with non-zero code if any template exceeds the 170 KB critical-path budget
- [ ] Baseline WordPress performance comparison:
  - [ ] Retrieve Phase 1 performance baseline from `migration/phase-1-performance-baseline.md`
  - [ ] Compare Hugo RC Lighthouse scores against WordPress baseline
  - [ ] Document improvement or regression in the performance budget report
- [ ] Update `.github/workflows/deploy-pages.yml`:
  - [ ] Upgrade Lighthouse job from advisory (Phase 7) to blocking status with the Phase 8 threshold configuration
  - [ ] Wire performance budget check as a blocking step
  - [ ] Upload Lighthouse CI reports and budget report as CI artifacts with 30-day retention
- [ ] Add `package.json` scripts:
  - [ ] `"check:perf-budget": "node scripts/phase-8/check-performance-budget.js"`
  - [ ] `"lhci:run:p8": "lhci autorun"` (uses updated `lighthouserc.js`)

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- `lighthouserc.js` — updated with Phase 8 blocking thresholds (`assert` configuration)
- `scripts/phase-8/check-performance-budget.js` — critical-path budget gate script
- `validation/lhci-report/` — Lighthouse CI JSON results and HTML reports from RC
- `validation/performance-budget-report.json` — critical-path size and CWV lab values per template
- Updated `package.json` with `check:perf-budget` and `lhci:run:p8` scripts
- Updated `.github/workflows/deploy-pages.yml` with Lighthouse and budget gates as blocking steps

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | Open | Ticket created |

---

### Notes

- Lighthouse scores vary run-to-run, especially in constrained CI environments. Always use `numberOfRuns: 3` and evaluate the median. Never fail a build on a single run.
- CLS is the most likely CWV failure for migrated content: images, embeds, and ads that load after initial render can shift layout significantly. Check every image in the article template for explicit `width` and `height` attributes.
- The 170 KB critical-path budget is a starter value from `analysis/plan/details/phase-8.md`. Tune it post-launch based on real asset analysis for this site.
- Lighthouse's SEO category checks overlap with but do not replace WS-C (RHI-086). The Lighthouse SEO score catches a different subset of issues (e.g., font size, tap target size) than the canonical/sitemap/robots checks.
- Reference: `analysis/plan/details/phase-8.md` §Workstream E: Performance and Core Web Vitals Gates; https://web.dev/articles/vitals
