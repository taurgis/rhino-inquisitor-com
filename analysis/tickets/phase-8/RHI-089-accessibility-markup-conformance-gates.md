## RHI-089 · Workstream F — Accessibility and Markup Conformance Gates

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

Launch with a measurable, documented accessibility baseline rather than aspirational statements. Automated axe checks catch the majority of detectable WCAG 2.2 AA violations on representative templates. Manual WAI Easy Checks cover keyboard navigation, focus management, and contrast — areas where automation has known gaps. HTML validity checks catch markup errors that can cause unexpected browser parsing and assistive technology failures. Together these gates produce an evidence-backed accessibility posture at launch.

---

### Acceptance Criteria

- [x] Automated axe accessibility checks pass on all pages in the sample matrix:
  - [x] Zero `critical` severity axe violations on any sampled page
  - [x] Zero `serious` severity axe violations on primary templates (homepage, article, category)
  - [x] Any `moderate` violations are documented with owner and target resolution date
  - [x] axe checks cover deterministic URLs from `validation/sample-matrix.json`: homepage, first 5 posts by front matter `date` descending (or all posts if fewer than 5), first 3 category slugs alphabetically (or all categories if fewer than 3), and privacy page
- [x] Manual WAI Easy Checks are completed and documented for all representative template types:
  - [x] Page titles are descriptive and unique (confirmed, not just automated)
  - [x] All images have meaningful, non-empty `alt` text (no `alt=""` on informational images)
  - [x] Heading structure is logical: `<h1>` is singular per page, headings do not skip levels
  - [x] Keyboard-only navigation: tab order is logical; all interactive elements are reachable without a mouse
  - [x] Visible focus indicator is present on all focusable elements
  - [x] Contrast ratio for normal text is ≥ 4.5:1; large text ≥ 3:1 (spot-check with browser devtools or a contrast tool)
  - [x] Manual check results are committed to `validation/accessibility-manual-checklist.md`
- [x] HTML conformance checks pass on all pages in the sample matrix:
  - [x] `html-validate` reports zero errors on all sampled pages
  - [x] Any warnings are reviewed and either accepted (documented) or fixed
  - [x] Checks cover: well-formed HTML5, no duplicate `id` attributes, valid `<head>` structure, no deprecated elements or attributes
- [x] No keyboard trap on any representative page (users can navigate away from all interactive components without a mouse)
- [x] No critical focus loss (focus does not disappear or reset to `<body>` on interactive actions)
- [x] Gate outputs are machine-readable, archived as CI artifacts, and committed:
  - [x] `validation/accessibility-axe-report.json` — per-URL axe violation list with severity, rule ID, element path, and pass/fail
  - [x] `validation/accessibility-manual-checklist.md` — template-level manual check results
  - [x] `validation/html-conformance-report.json` — per-URL html-validate results with error/warning counts
- [x] CI integration:
  - [x] Automated axe checks run as a blocking CI step on representative URLs
  - [x] HTML conformance check runs as a blocking CI step on the full sample matrix HTML output
  - [x] Reports are uploaded as CI artifacts with 30-day retention

---

### Tasks

- [x] Set up Playwright and `@axe-core/playwright`:
  - [x] Confirm `playwright` and `@axe-core/playwright` are installed (from bootstrap RHI-083)
  - [x] Install Playwright browser binaries: `npx playwright install chromium`
- [x] Create `scripts/phase-8/check-accessibility-axe.js`:
  - [x] Spin up a local server serving `public/` (or use a deployed staging URL)
  - [x] For each URL in the sample matrix: load the page in Playwright, run `axe.analyze()`, extract violations by severity
  - [x] Fail on any `critical` violation; fail on `serious` violations on primary templates
  - [x] Output `validation/accessibility-axe-report.json` with per-URL violation details
  - [x] Exit with non-zero code on blocking failures
- [x] Create `scripts/phase-8/check-html-conformance.js`:
  - [x] Use `html-validate` to check all HTML files in `public/` matching sample matrix paths
  - [x] Capture all errors and warnings
  - [x] Fail on any errors; document warnings
  - [x] Output `validation/html-conformance-report.json`
  - [x] Exit with non-zero code on any errors
- [x] Complete manual WAI Easy Checks:
  - [x] Assign a reviewer for manual checks (SEO owner, engineering owner, or migration owner)
  - [x] Walk through each check item for each representative template type:
    - [x] Post template (check all items)
    - [x] Homepage (check all items)
    - [x] Category list page (check all items)
    - [x] Privacy/legal page (check page title, headings, and keyboard navigation at minimum)
  - [x] Check for keyboard trap on any modals, dropdowns, or interactive components
  - [x] Document results in `validation/accessibility-manual-checklist.md` with template, pass/fail, notes
- [x] Run both automated gates against the RC build; archive reports as CI artifacts with 30-day retention
- [x] Update `.github/workflows/deploy-pages.yml`:
  - [x] Add `check:accessibility` as blocking step (axe checks on primary templates)
  - [x] Add `check:html-conformance` as blocking step
  - [x] Upload both reports as CI artifacts
- [x] Add `package.json` scripts:
  - [x] `"check:accessibility": "node scripts/phase-8/check-accessibility-axe.js"`
  - [x] `"check:html-conformance": "node scripts/phase-8/check-html-conformance.js"`

---

### Out of Scope

- Full WCAG-EM conformance evaluation or formal WCAG conformance claim (site-wide WCAG claims require a scoped WCAG-EM evaluation; this gate produces a baseline, not a conformance statement)
- Fixing accessibility defects found during this gate (changes require RC re-cut per RHI-084 protocol)
- Screen reader testing (valuable but out of scope for launch gates; schedule as a post-launch improvement)
- Automated cognitive accessibility checks (no reliable automated tooling exists for these)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-083 Done — Phase 8 Bootstrap complete; `playwright` and `@axe-core/playwright` installed | Ticket | Done |
| RHI-084 Done — RC frozen, sample matrix committed | Ticket | Done |
| `html-validate` installed and available | Tool | Done |
| Hugo production build of RC exits 0 | Build | Done |
| Phase 4 RHI-040 Done — Accessibility and content semantics applied to migrated content | Phase | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Migrated content contains images without `alt` text from the WordPress source | High | High | Phase 4 content migration should have enforced alt text (RHI-040); if violations found in axe, fix at content level and re-cut RC | Engineering Owner |
| Keyboard trap in navigation or search components | Low | High | Blocking defect; requires template fix and RC re-cut | Engineering Owner |
| Heading hierarchy violations across migrated posts (headings start at `<h1>` in body) | Medium | Medium | Content quality gate in Phase 4 should have caught this; address in content fix if found, then re-cut RC | Migration Owner |
| `html-validate` reports hundreds of warnings from migrated content HTML fragments | Medium | Low | Filter to errors only for blocking threshold; review warnings in a separate pass; accept non-blocking warnings with documented rationale | Engineering Owner |
| Focus indicator not visible in custom theme styles | Low | Medium | Manual check specifically tests focus visibility; if invisible, a CSS fix is required before launch | Engineering Owner |
| Playwright browser install fails in CI environment | Low | Medium | Pin Playwright version; use `--only-shell` install if full browser install is not possible in CI; alternatively run accessibility checks against a deployed staging URL | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-089 is complete. The repository now has committed WS-F automation for axe and HTML conformance, deploy workflow artifact upload for both reports, a completed manual accessibility checklist, and a follow-up shared-header remediation that closed the only remaining manual keyboard/focus gap. Ticket owner acknowledgment was recorded at closeout based on the completed evidence set and final passing reruns.

**Delivered artefacts:**

- `scripts/phase-8/check-accessibility-axe.js` — automated axe gate script
- `scripts/phase-8/check-html-conformance.js` — HTML conformance gate script
- `validation/accessibility-axe-report.json` — per-URL axe violation report from RC build
- `validation/accessibility-manual-checklist.md` — documented manual WAI Easy Check results
- `validation/html-conformance-report.json` — per-URL html-validate results from RC build
- Updated `package.json` with `check:accessibility` and `check:html-conformance` scripts
- Updated `.github/workflows/deploy-pages.yml` with both gates wired as blocking steps

**Deviations from plan:**

- Final evidence is branch-state against the frozen `phase-8-rc-v2` sample-matrix dataset rather than a fresh RC tag cut after the last shared-header remediation. The ticket owner accepted that closeout basis at final ticket completion.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | Open | Ticket created |
| 2026-03-20 | Done | Automated axe and HTML gates pass, manual checklist passes after shared-header remediation, CI artifact wiring is in place, and owner closeout acknowledgment is recorded. |

---

### Notes

- Automated axe checks detect only a subset of WCAG issues. Manual checks (keyboard navigation, focus management, contrast) are not optional because they cover gaps that automation cannot reliably detect.
- A formal WCAG conformance claim is only appropriate after a full WCAG-EM scoped evaluation. The outputs of this ticket establish a measurable baseline, not a conformance claim. Do not describe the site as "WCAG 2.2 AA conformant" based on these checks alone.
- Missing `alt` text on images is the most common accessibility failure in migrated content and is also an SEO signal. If found, it must be fixed — not accepted — before launch.
- Reference: `analysis/plan/details/phase-8.md` §Workstream F: Accessibility and Markup Conformance Gates; https://www.w3.org/WAI/test-evaluate/easy-checks/; https://www.w3.org/TR/WCAG22/
