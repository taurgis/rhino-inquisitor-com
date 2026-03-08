## RHI-006 · Performance and UX Baseline

**Status:** Open  
**Priority:** High  
**Estimate:** M  
**Phase:** 1  
**Assigned to:** Migration Engineer  
**Target date:** 2026-03-12  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Record pre-migration Core Web Vitals, performance metrics, and accessibility signals for representative page templates. This baseline gives the team measurable targets for Phase 3 (scaffold) and Phase 8 (launch readiness) and ensures the migration produces a performance improvement, not a regression.

Without this baseline, post-launch changes in LCP, CLS, or INP cannot be attributed to the migration with confidence.

---

### Acceptance Criteria

- [ ] `migration/phase-1-performance-baseline.md` exists and contains data for all five template types
- [ ] Five template types measured: Homepage, Recent article, Archive, Category page, Video page
- [ ] Core Web Vitals captured for each page: LCP, INP (or FID if INP unavailable), CLS
- [ ] TTFB captured for each page
- [ ] Page weight captured: total payload (KB), JavaScript weight, image weight
- [ ] Accessibility quick-pass completed: landmark elements present, heading structure reviewed, alt text coverage noted, keyboard path spot-checked
- [ ] Lighthouse scores (or PageSpeed API scores) recorded: Performance, Accessibility, Best Practices, SEO — for both mobile and desktop
- [ ] Baseline report reviewed and approved by migration owner

---

### Tasks

- [ ] Identify representative page URLs for each template type
  - [ ] Homepage: `https://www.rhino-inquisitor.com/`
  - [ ] Recent article: one of the top-performing posts from RHI-005 SEO baseline
  - [ ] Archive: `https://www.rhino-inquisitor.com/archive/` (confirmed present in `page-sitemap.xml`)
  - [ ] Category: `https://www.rhino-inquisitor.com/category/salesforce-commerce-cloud/` (or highest-traffic category per RHI-005 baseline; `/category/sfcc/` does not exist on the live site)
  - [ ] Video page: `https://www.rhino-inquisitor.com/sfcc-introduction/` (confirmed in `video-sitemap.xml`; substitute another video URL if access or playback unavailable)
- [ ] Run Lighthouse (CLI or PageSpeed API) for each URL — both mobile and desktop
  - [ ] Record Performance, Accessibility, Best Practices, SEO scores
  - [ ] Capture LCP, INP/FID, CLS, TTFB from Lighthouse output
- [ ] Capture network waterfall payload data: total KB, JS KB, image KB
- [ ] Run quick accessibility pass for each template:
  - [ ] Confirm `<main>`, `<nav>`, `<header>`, `<footer>` landmarks present
  - [ ] Confirm heading hierarchy starts at `<h1>` and is not skipped
  - [ ] Count images missing alt text
  - [ ] Verify keyboard tab order on primary navigation
- [ ] Record all data in `migration/phase-1-performance-baseline.md` using a consistent table format
- [ ] Identify top 3 performance pain points per template to target in Phase 3
- [ ] Review and approve baseline with migration owner

---

### Out of Scope

- Fixing performance or accessibility issues (those are Phase 3 and Phase 8 targets)
- Full WCAG 2.2 audit (this is a quick-pass only)
- Measuring performance of non-HTML assets or API endpoints

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-001 Done | Ticket | Pending |
| Lighthouse CLI or PageSpeed API access | Tool | Pending (RHI-001) |
| Representative page URLs from SEO baseline (optional, for best article selection) | Data | Pending (RHI-005) |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| PageSpeed API rate limit or quota | Low | Low | Use Lighthouse CLI as fallback for all measurements | Migration Engineer |
| Archive or video pages return unexpected status codes | Low | Medium | Use best available alternative URL for the template type; note in baseline | Migration Engineer |
| WordPress site has aggressive caching that masks real performance | Low | Medium | Run measurements from multiple locations; use field data from CrUX where available | Migration Engineer |
| INP not measurable via Lighthouse in all environments | Low | Low | Record FID as fallback; note limitation in baseline | Migration Engineer |

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

- `migration/phase-1-performance-baseline.md`

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- The baseline table format should use consistent column headers so Phase 8 comparison is straightforward.
- Document any known performance limitations of the current WordPress theme that the Hugo migration is expected to fix — these become Phase 3 targets.
- Reference: `analysis/plan/details/phase-1.md` §Workstream 5
- Official: https://web.dev/articles/vitals | https://www.w3.org/TR/WCAG22/
