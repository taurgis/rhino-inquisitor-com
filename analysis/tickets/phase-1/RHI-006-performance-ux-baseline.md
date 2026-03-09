## RHI-006 · Performance and UX Baseline

**Status:** Done  
**Priority:** High  
**Estimate:** M  
**Phase:** 1  
**Assigned to:** Migration Engineer  
**Target date:** 2026-03-12  
**Created:** 2026-03-07  
**Updated:** 2026-03-09

---

### Goal

Record pre-migration Core Web Vitals, performance metrics, and accessibility signals for representative page templates. This baseline gives the team measurable targets for Phase 3 (scaffold) and Phase 8 (launch readiness) and ensures the migration produces a performance improvement, not a regression.

Without this baseline, post-launch changes in LCP, CLS, or INP cannot be attributed to the migration with confidence.

---

### Acceptance Criteria

- [x] `migration/phase-1-performance-baseline.md` exists and contains data for all five template types
- [x] Five template types measured: Homepage, Recent article, Archive, Category page, Video page
- [x] Core Web Vitals captured for each page: LCP, INP (or FID if INP unavailable), CLS
- [x] TTFB captured for each page
- [x] Page weight captured: total payload (KB), JavaScript weight, image weight
- [x] Accessibility quick-pass completed: landmark elements present, heading structure reviewed, alt text coverage noted, keyboard path spot-checked
- [x] Lighthouse scores (or PageSpeed API scores) recorded: Performance, Accessibility, Best Practices, SEO — for both mobile and desktop
- [x] Baseline report reviewed and approved by migration owner

---

### Tasks

- [x] Identify representative page URLs for each template type
  - [x] Homepage: `https://www.rhino-inquisitor.com/`
  - [x] Recent article: one of the top-performing posts from RHI-005 SEO baseline (`/lag-to-riches-a-pwa-kit-developers-guide/` from 28-day export)
  - [x] Archive: `https://www.rhino-inquisitor.com/archive/` (confirmed present in `page-sitemap.xml`)
  - [x] Category: `https://www.rhino-inquisitor.com/category/salesforce-commerce-cloud/` (or highest-traffic category per RHI-005 baseline; `/category/sfcc/` does not exist on the live site)
  - [x] Video page: `https://www.rhino-inquisitor.com/sfcc-introduction/` (confirmed in `video-sitemap.xml`; substitute another video URL if access or playback unavailable)
- [x] Run Lighthouse (CLI or PageSpeed API) for each URL — both mobile and desktop
  - [x] Record Performance, Accessibility, Best Practices, SEO scores
  - [x] Capture LCP, INP/FID, CLS, TTFB from Lighthouse output
- [x] Capture network waterfall payload data: total KB, JS KB, image KB
- [x] Run quick accessibility pass for each template:
  - [x] Confirm `<main>`, `<nav>`, `<header>`, `<footer>` landmarks present
  - [x] Confirm heading hierarchy starts at `<h1>` and is not skipped
  - [x] Count images missing alt text
  - [x] Verify keyboard tab order on primary navigation (static spot-check heuristic)
- [x] Record all data in `migration/phase-1-performance-baseline.md` using a consistent table format
- [x] Identify top 3 performance pain points per template to target in Phase 3
- [x] Review and approve baseline with migration owner

---

### Out of Scope

- Fixing performance or accessibility issues (those are Phase 3 and Phase 8 targets)
- Full WCAG 2.2 audit (this is a quick-pass only)
- Measuring performance of non-HTML assets or API endpoints

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-001 Done | Ticket | Ready |
| Lighthouse CLI or PageSpeed API access | Tool | Ready (Lighthouse CLI used; PageSpeed API project not enabled) |
| Representative page URLs from SEO baseline (optional, for best article selection) | Data | Ready (RHI-005 complete) |

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

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-006 is complete. Baseline package delivered, reviewed, and approved.

**Delivered artefacts:**

- `migration/phase-1-performance-baseline.md`
- `tmp/phase-1-perf-baseline/*.json` (raw Lighthouse JSON evidence)

**Deviations from plan:**

- PageSpeed API project for provided key returned `403` (API disabled), so lab metrics were captured with Lighthouse CLI fallback.
- CrUX URL-level lookups returned `NOT_FOUND`; script now falls back to origin-level data (desktop) and aggregate-origin data without form factor (mobile) where needed.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-09 | In Progress | Started RHI-006 after RHI-005 closure; implemented `scripts/perf-baseline.js` collector and generated first baseline snapshot |
| 2026-03-09 | In Progress | Baseline captured for 5 templates x 2 device profiles (10 rows), including payload breakdown, accessibility quick-pass, and top-3 pain points per template |
| 2026-03-09 | In Progress | CrUX fallback expanded and verified: desktop uses origin-level form-factor data; mobile uses aggregate-origin data (no form factor) when form-factor data is unavailable |
| 2026-03-09 | In Progress | Finalized CrUX fallback behavior in script and regenerated baseline; ticket artifacts are commit-ready pending migration-owner approval |
| 2026-03-09 | Done | Migration owner reviewed and approved baseline; acceptance criteria and Definition of Done satisfied |

---

### Notes

- The baseline table format should use consistent column headers so Phase 8 comparison is straightforward.
- Document any known performance limitations of the current WordPress theme that the Hugo migration is expected to fix — these become Phase 3 targets.
- Reference: `analysis/plan/details/phase-1.md` §Workstream 5
- Official: https://web.dev/articles/vitals | https://www.w3.org/TR/WCAG22/
