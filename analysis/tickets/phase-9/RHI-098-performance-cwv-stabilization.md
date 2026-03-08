## RHI-098 · Workstream E — Performance and Core Web Vitals Stabilization

**Status:** Open  
**Priority:** High  
**Estimate:** M  
**Phase:** 9  
**Workstream:** WS-E  
**Assigned to:** Engineering Owner  
**Target date:** 2026-07-29  
**Created:** 2026-03-08  
**Updated:** 2026-03-08

---

### Goal

Detect performance regressions immediately after launch by running daily Lighthouse checks, compare against the Phase 8 baseline, confirm field Core Web Vitals convergence in Search Console over the 6-week stabilization window, and ensure the site meets fixed operational thresholds throughout. Lab metrics (Lighthouse) are the immediate regression signal; field metrics (CWV from Search Console) are the trailing-window truth that confirms real-user experience.

---

### Acceptance Criteria

**Days 0–7 (daily lab checks):**
- [ ] Daily Lighthouse run executed on representative template matrix:
  - [ ] Homepage
  - [ ] Article template (recent post)
  - [ ] Category listing page
- [ ] Lighthouse results recorded in `monitoring/cwv-lighthouse-trend.json` with timestamp, URL, and scores
- [ ] Results compared against Phase 8 Lighthouse baselines from `validation/lhci-report/`
- [ ] Any regression below fixed thresholds (Performance < 90, Accessibility < 90, SEO < 95, Best Practices < 90) is escalated:
  - [ ] Single-day dip: noted and tracked
  - [ ] Three consecutive days below threshold: treated as Sev-2 and requires investigation
- [ ] No unexplained render-blocking resources, excessive image payloads, or layout shifts introduced post-launch

**Weeks 2–6 (transitional and field CWV):**
- [ ] Field CWV data tracked in Search Console Core Web Vitals report weekly at p75:
  - [ ] LCP ≤ 2.5 s
  - [ ] INP ≤ 200 ms
  - [ ] CLS ≤ 0.1
- [ ] p75 field CWV trend evaluated weekly; "No data available" gaps on new URL groups treated as expected (use lab metrics in the interim)
- [ ] Lab and field data interpreted together; lab-only fluctuations not escalated as Sev-2 unless confirmed by field trend
- [ ] Weekly findings appended to `monitoring/cwv-lighthouse-trend.json` and `monitoring/cwv-field-trend.md`
- [ ] Performance budget remains intact: critical-path < 170 KB compressed (from Phase 8)

**Stabilization exit:**
- [ ] Lighthouse trend stable within thresholds for the last two consecutive weekly check periods
- [ ] Field CWV category at Good or Needs Improvement with stable or improving trend (not actively degrading)
- [ ] No unresolved regression caused by post-launch configuration change

---

### Tasks

**Launch-day baseline capture:**
- [ ] Run Lighthouse via `@lhci/cli` against live production URLs immediately after cutover stabilizes (T+1h at earliest — wait for DNS propagation)
- [ ] Record homepage, article, and category scores in `monitoring/cwv-lighthouse-trend.json`
- [ ] Compare to Phase 8 baseline; flag any metric that is more than 5 points below Phase 8 median

**Days 1–7 daily lab checks:**
- [ ] Run `npm run lhci:run:p9` (or equivalent post-launch config) daily for homepage, article, category
- [ ] Record scores with `runTimestamp`, `environment: production`, `commitSha`
- [ ] Check for: render-blocking scripts, unoptimized images, layout shift from embeds, excessive JS
- [ ] Raise escalation alert if three consecutive days below Performance 90 or SEO 95
- [ ] Investigate and resolve regression root cause:
  - [ ] Check if a new content embed introduced heavy JS or external resource
  - [ ] Check if a post-RC hotfix changed template rendering
  - [ ] Check image delivery (alt paths, dimensions, lazy loading)

**Weeks 2–6 field CWV and lab trend:**
- [ ] Check Search Console Core Web Vitals report weekly; record p75 values for URL groups
- [ ] Note "No data" gaps — expected for low-traffic or new URL groups during transition
- [ ] Compare field trend to Phase 1 performance baseline (from `migration/phase-1-performance-baseline.md`)
- [ ] Use PSI (PageSpeed Insights) for spot-checks when field data is unavailable
- [ ] Record weekly interpretation notes in `monitoring/cwv-field-trend.md`

**Performance budget governance:**
- [ ] Run `npm run check:perf-budget` periodically to confirm critical-path payload remains < 170 KB compressed
- [ ] Alert if any content edit or embed increases critical-path significantly

---

### Out of Scope

- Redesigning templates or implementing new performance optimisations beyond regression remediation
- A/B testing or feature-flag-based performance experiments
- Evaluating ranking impact of performance scores (covered under WS-F)
- Mobile-vs-desktop parity analysis beyond Lighthouse built-in category (separate investigation if needed)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-093 Done — Phase 9 Bootstrap; `@lhci/cli` confirmed available | Ticket | Pending |
| RHI-094 Done — Cutover executed; live host responding | Ticket | Pending |
| Phase 8 Lighthouse baseline in `validation/lhci-report/` | Phase | Pending |
| Phase 1 performance baseline in `migration/phase-1-performance-baseline.md` | Phase | Pending |
| `lighthouserc.js` config updated for production URLs (from Phase 8, RHI-088) | Phase | Pending |
| `npm run check:perf-budget` script operational (from Phase 8, RHI-088) | Phase | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Lighthouse scores lower on production than on staging (network and CDN behaviour) | Medium | Medium | Accept 2–3 point variation as noise; only escalate sustained 5+ point regression lasting 3 days | Engineering Owner |
| Field CWV data delayed beyond week 3 (low traffic volume) | Medium | Low | Use lab metrics as the primary signal for low-traffic pages; field CWV is a confirmatory signal only | Engineering Owner |
| Post-launch content edit embeds heavy external JS (YouTube, Twitter, etc.) | Medium | Medium | Review content editors' workflow; add performance check to content merge pipeline if feasible | Engineering Owner |
| Performance regression caused by GitHub Pages CDN behaviour not replicable in local testing | Low | Medium | Use PSI and live Lighthouse runs (not local) as the canonical performance signal | Engineering Owner |
| CLS spike caused by font loading or image sizing inconsistency post-launch | Medium | Medium | Check font-display strategy and image dimension attributes on article templates | Engineering Owner |

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

- `monitoring/cwv-lighthouse-trend.json` — daily week-1 and weekly week-2–6 Lighthouse trend
- `monitoring/cwv-field-trend.md` — weekly field CWV interpretation notes
- Performance regression investigation reports (if any)

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | Open | Ticket created |

---

### Notes

- Lighthouse is an immediate regression detection tool, not real-user truth. A single-run Lighthouse drop does not mean real users experienced a regression. Evaluate over multiple runs and cross-check with field CWV before escalating.
- Field CWV uses a trailing 28-day window. Immediately post-launch, field data will reflect a mix of old WordPress and new Hugo user sessions. Do not use day-1 field CWV as a baseline for the new site.
- The Performance < 90 threshold for three consecutive daily runs is the escalation trigger, not a defect in itself. A single low run may be noise.
- Reference: `analysis/plan/details/phase-9.md` §Workstream E: Performance and Core Web Vitals Stabilization, §Fixed Operational Thresholds
