## RHI-027 · Workstream H — Accessibility and UX Baseline

**Status:** Open  
**Priority:** Medium  
**Estimate:** M  
**Phase:** 3  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-03  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Establish WCAG 2.2 AA accessibility conformance as a measurable baseline for all scaffold templates before content migration begins. Retrofitting accessibility into a fully populated site is significantly more expensive than building it in from the start. The semantic structure decisions made in this ticket — heading hierarchy, landmark regions, keyboard navigability, skip links, and image alt-text policy — must be encoded in templates and enforced in CI so that content migration cannot silently degrade them.

---

### Acceptance Criteria

- [ ] Semantic structure expectations are encoded in all scaffold templates:
  - [ ] Each page has exactly one `<h1>` (post/page `title` or homepage site title)
  - [ ] Heading hierarchy starts at `<h1>` and does not skip levels (e.g. `<h1>` → `<h2>` → `<h3>`)
  - [ ] Landmark regions are present: `<header>`, `<main>`, `<nav>` (where applicable), `<footer>`
  - [ ] Skip-to-main-content link exists in each template before the navigation landmark
- [ ] Image alt-text policy from RHI-022 (content contract) is reflected in templates:
  - [ ] All `<img>` elements in templates include an `alt` attribute
  - [ ] Template partials that render images require a non-empty `alt` value or conditionally omit the image
  - [ ] Purely decorative images use `alt=""` with `role="presentation"` where applicable
- [ ] Keyboard navigability is confirmed for all interactive elements in the scaffold:
  - [ ] All links and buttons are focusable and have visible focus styles
  - [ ] No interactive elements are keyboard-inaccessible (e.g. click-only without keyboard equivalent)
- [ ] Automated accessibility check tool is configured:
  - [ ] `pa11y-ci` (or equivalent) is installed as a dev dependency
  - [ ] Configuration file (`pa11y-ci` config or `.pa11yci.json`) targets representative scaffold pages
  - [ ] Compliance target is WCAG 2.2 AA; automated tool baseline is documented as `WCAG2AA` with a manual WCAG 2.2 delta checklist
  - [ ] Runner exits with non-zero code on any automated WCAG violation in the configured ruleset
- [ ] `pa11y-ci` passes on all scaffold template types (homepage, article, page, archive, category term) with placeholder content
- [ ] Color contrast: scaffold base styles (if any) meet WCAG AA minimum contrast ratio (4.5:1 for normal text, 3:1 for large text)
- [ ] Known manual-review checks are documented in `docs/migration/RUNBOOK.md`:
  - [ ] Focus order (logical reading order matches visual order)
  - [ ] Skip links (visually hidden but reachable)
  - [ ] Color contrast for any custom UI elements not caught by automated tools
- [ ] `npm run check:a11y` is defined in `package.json` and passes on scaffold build

---

### Tasks

- [ ] Audit scaffold templates from RHI-023 for semantic structure:
  - [ ] Confirm single `<h1>` per page type; fix any template using multiple `<h1>` elements
  - [ ] Add `<header>`, `<main>`, `<footer>` landmark regions to `baseof.html`
  - [ ] Add `<nav aria-label="Primary navigation">` landmark where site navigation is rendered
  - [ ] Add skip-to-main-content link at the top of `baseof.html`:
    ```html
    <a href="#main-content" class="skip-link">Skip to main content</a>
    ```
  - [ ] Add `id="main-content"` to the `<main>` element
- [ ] Review all `<img>` usage in templates; ensure `alt` attribute is always present:
  - [ ] For `heroImage` or featured image partials: require `alt` from front matter or provide a computed fallback
  - [ ] For decorative layout images (if any): use `alt=""` with `role="presentation"`
- [ ] Add minimal focus-visible styles to scaffold CSS (or document as a post-Phase 4 requirement if no CSS exists yet)
- [ ] Install `pa11y-ci` as a dev dependency: `npm install pa11y-ci --save-dev --save-exact`
- [ ] Create `.pa11yci.json` (or equivalent) config:
  - [ ] Set `standard: "WCAG2AA"` and document this as tool-supported baseline for the WCAG 2.2 AA target
  - [ ] Add URLs for each representative scaffold template type
  - [ ] Configure `runners: ["axe", "htmlcs"]` for comprehensive coverage
- [ ] Add `"check:a11y": "pa11y-ci"` to `package.json` scripts
- [ ] Build scaffold with representative placeholder content (homepage, one article, one category page)
- [ ] Run `npm run check:a11y` — review all violations
- [ ] Fix any WCAG AA violations in templates; document known false positives in `.pa11yci.json`
- [ ] Run `npm run check:a11y` again — confirm pass
- [ ] Document manual-review checklist in `docs/migration/RUNBOOK.md`:
  - [ ] Focus order verification steps
  - [ ] Skip-link testing procedure (Tab key from top of page)
  - [ ] Contrast check for any custom UI elements
- [ ] Commit templates with a11y fixes, `pa11y-ci` config, and `package.json` changes

---

### Out of Scope

- Full WCAG 2.2 AA audit with manual testing across all content types (Phase 8 pre-launch scope)
- Remediation of accessibility issues in WordPress-imported content bodies (Phase 4 scope)
- Screen reader user testing (post-launch)
- ARIA patterns for complex interactive components (not present in Phase 3 scaffold)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-019 Done — Phase 3 Bootstrap complete | Ticket | Pending |
| RHI-023 Done — Template scaffold committed (templates needed for a11y checks) | Ticket | Pending |
| RHI-015 Outcomes — `pa11y-ci` approved in tooling list | Ticket | Pending |
| Node.js runtime for `pa11y-ci` | Tool | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| `pa11y-ci` requires a running HTTP server; CI setup is complex | Medium | Medium | Use `startUrls` with a local server command in config; document local execution steps in RUNBOOK | Engineering Owner |
| Automated tools miss keyboard navigation and focus-order issues | High | Medium | Document these as required manual checks in RUNBOOK; schedule manual review before Phase 4 sign-off | Engineering Owner |
| Minimal scaffold CSS means focus styles are browser default only | Medium | Low | Document as acceptable for Phase 3; assign visible focus style implementation to Phase 4/5 design scope | Engineering Owner |
| `pa11y-ci` version conflicts with Node version or other dependencies | Low | Low | Pin exact version; test in CI environment before committing lock file | Engineering Owner |

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

- Updated scaffold templates with semantic landmarks, skip link, and corrected heading hierarchy
- `.pa11yci.json` (or equivalent) accessibility check configuration
- `package.json` updated with `check:a11y` script and `pa11y-ci` dev dependency
- `docs/migration/RUNBOOK.md` updated with manual-review checklist

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- WCAG 2.2 AA conformance requires evaluating full pages and complete processes — not just individual components. Automated tools catch approximately 30–40% of WCAG violations; manual review is always necessary. This ticket establishes the automated baseline; the manual review is Phase 8 scope.
- Skip-to-main-content links are only useful if they are the first focusable element on the page. Verify tab order with a keyboard test before close.
- Reference: `analysis/plan/details/phase-3.md` §Workstream H: Accessibility and UX Baseline; https://www.w3.org/TR/WCAG22/
