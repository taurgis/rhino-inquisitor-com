## RHI-089 · Workstream F — Accessibility and Markup Conformance Gates

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

Launch with a measurable, documented accessibility baseline rather than aspirational statements. Automated axe checks catch the majority of detectable WCAG 2.2 AA violations on representative templates. Manual WAI Easy Checks cover keyboard navigation, focus management, and contrast — areas where automation has known gaps. HTML validity checks catch markup errors that can cause unexpected browser parsing and assistive technology failures. Together these gates produce an evidence-backed accessibility posture at launch.

---

### Acceptance Criteria

- [ ] Automated axe accessibility checks pass on all pages in the sample matrix:
  - [ ] Zero `critical` severity axe violations on any sampled page
  - [ ] Zero `serious` severity axe violations on primary templates (homepage, article, category)
  - [ ] Any `moderate` violations are documented with owner and target resolution date
  - [ ] axe checks cover deterministic URLs from `validation/sample-matrix.json`: homepage, first 5 posts by front matter `date` descending (or all posts if fewer than 5), first 3 category slugs alphabetically (or all categories if fewer than 3), and privacy page
- [ ] Manual WAI Easy Checks are completed and documented for all representative template types:
  - [ ] Page titles are descriptive and unique (confirmed, not just automated)
  - [ ] All images have meaningful, non-empty `alt` text (no `alt=""` on informational images)
  - [ ] Heading structure is logical: `<h1>` is singular per page, headings do not skip levels
  - [ ] Keyboard-only navigation: tab order is logical; all interactive elements are reachable without a mouse
  - [ ] Visible focus indicator is present on all focusable elements
  - [ ] Contrast ratio for normal text is ≥ 4.5:1; large text ≥ 3:1 (spot-check with browser devtools or a contrast tool)
  - [ ] Manual check results are committed to `validation/accessibility-manual-checklist.md`
- [ ] HTML conformance checks pass on all pages in the sample matrix:
  - [ ] `html-validate` reports zero errors on all sampled pages
  - [ ] Any warnings are reviewed and either accepted (documented) or fixed
  - [ ] Checks cover: well-formed HTML5, no duplicate `id` attributes, valid `<head>` structure, no deprecated elements or attributes
- [ ] No keyboard trap on any representative page (users can navigate away from all interactive components without a mouse)
- [ ] No critical focus loss (focus does not disappear or reset to `<body>` on interactive actions)
- [ ] Gate outputs are machine-readable, archived as CI artifacts, and committed:
  - [ ] `validation/accessibility-axe-report.json` — per-URL axe violation list with severity, rule ID, element path, and pass/fail
  - [ ] `validation/accessibility-manual-checklist.md` — template-level manual check results
  - [ ] `validation/html-conformance-report.json` — per-URL html-validate results with error/warning counts
- [ ] CI integration:
  - [ ] Automated axe checks run as a blocking CI step on representative URLs
  - [ ] HTML conformance check runs as a blocking CI step on the full sample matrix HTML output
  - [ ] Reports are uploaded as CI artifacts with 30-day retention

---

### Tasks

- [ ] Set up Playwright and `@axe-core/playwright`:
  - [ ] Confirm `playwright` and `@axe-core/playwright` are installed (from bootstrap RHI-083)
  - [ ] Install Playwright browser binaries: `npx playwright install chromium`
- [ ] Create `scripts/phase-8/check-accessibility-axe.js`:
  - [ ] Spin up a local server serving `public/` (or use a deployed staging URL)
  - [ ] For each URL in the sample matrix: load the page in Playwright, run `axe.analyze()`, extract violations by severity
  - [ ] Fail on any `critical` violation; fail on `serious` violations on primary templates
  - [ ] Output `validation/accessibility-axe-report.json` with per-URL violation details
  - [ ] Exit with non-zero code on blocking failures
- [ ] Create `scripts/phase-8/check-html-conformance.js`:
  - [ ] Use `html-validate` to check all HTML files in `public/` matching sample matrix paths
  - [ ] Capture all errors and warnings
  - [ ] Fail on any errors; document warnings
  - [ ] Output `validation/html-conformance-report.json`
  - [ ] Exit with non-zero code on any errors
- [ ] Complete manual WAI Easy Checks:
  - [ ] Assign a reviewer for manual checks (SEO owner, engineering owner, or migration owner)
  - [ ] Walk through each check item for each representative template type:
    - [ ] Post template (check all items)
    - [ ] Homepage (check all items)
    - [ ] Category list page (check all items)
    - [ ] Privacy/legal page (check page title, headings, and keyboard navigation at minimum)
  - [ ] Check for keyboard trap on any modals, dropdowns, or interactive components
  - [ ] Document results in `validation/accessibility-manual-checklist.md` with template, pass/fail, notes
- [ ] Run both automated gates against the RC build; archive reports as CI artifacts with 30-day retention
- [ ] Update `.github/workflows/deploy-pages.yml`:
  - [ ] Add `check:accessibility` as blocking step (axe checks on primary templates)
  - [ ] Add `check:html-conformance` as blocking step
  - [ ] Upload both reports as CI artifacts
- [ ] Add `package.json` scripts:
  - [ ] `"check:accessibility": "node scripts/phase-8/check-accessibility-axe.js"`
  - [ ] `"check:html-conformance": "node scripts/phase-8/check-html-conformance.js"`

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
| RHI-083 Done — Phase 8 Bootstrap complete; `playwright` and `@axe-core/playwright` installed | Ticket | Pending |
| RHI-084 Done — RC frozen, sample matrix committed | Ticket | Pending |
| `html-validate` installed and available | Tool | Pending |
| Hugo production build of RC exits 0 | Build | Pending |
| Phase 4 RHI-040 Done — Accessibility and content semantics applied to migrated content | Phase | Pending |

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- `scripts/phase-8/check-accessibility-axe.js` — automated axe gate script
- `scripts/phase-8/check-html-conformance.js` — HTML conformance gate script
- `validation/accessibility-axe-report.json` — per-URL axe violation report from RC build
- `validation/accessibility-manual-checklist.md` — documented manual WAI Easy Check results
- `validation/html-conformance-report.json` — per-URL html-validate results from RC build
- Updated `package.json` with `check:accessibility` and `check:html-conformance` scripts
- Updated `.github/workflows/deploy-pages.yml` with both gates wired as blocking steps

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | Open | Ticket created |

---

### Notes

- Automated axe checks detect only a subset of WCAG issues. Manual checks (keyboard navigation, focus management, contrast) are not optional because they cover gaps that automation cannot reliably detect.
- A formal WCAG conformance claim is only appropriate after a full WCAG-EM scoped evaluation. The outputs of this ticket establish a measurable baseline, not a conformance claim. Do not describe the site as "WCAG 2.2 AA conformant" based on these checks alone.
- Missing `alt` text on images is the most common accessibility failure in migrated content and is also an SEO signal. If found, it must be fixed — not accepted — before launch.
- Reference: `analysis/plan/details/phase-8.md` §Workstream F: Accessibility and Markup Conformance Gates; https://www.w3.org/WAI/test-evaluate/easy-checks/; https://www.w3.org/TR/WCAG22/
