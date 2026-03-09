## RHI-027 · Workstream H — Accessibility and UX Baseline

**Status:** Done  
**Priority:** Medium  
**Estimate:** M  
**Phase:** 3  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-03  
**Created:** 2026-03-07  
**Updated:** 2026-03-09

---

### Goal

Establish WCAG 2.2 AA accessibility conformance as a measurable baseline for all scaffold templates before content migration begins. Retrofitting accessibility into a fully populated site is significantly more expensive than building it in from the start. The semantic structure decisions made in this ticket — heading hierarchy, landmark regions, keyboard navigability, skip links, and image alt-text policy — must be encoded in templates and enforced in CI so that content migration cannot silently degrade them.

---

### Acceptance Criteria

- [x] Semantic structure expectations are encoded in all scaffold templates:
  - [x] Each page has exactly one `<h1>` (post/page `title` or homepage site title)
  - [x] Heading hierarchy starts at `<h1>` and does not skip levels (e.g. `<h1>` → `<h2>` → `<h3>`)
  - [x] Landmark regions are present: `<header>`, `<main>`, `<nav>` (where applicable), `<footer>`
  - [x] Skip-to-main-content link exists in each template before the navigation landmark
- [x] Image alt-text policy from RHI-022 (content contract) is reflected in templates:
  - [x] All `<img>` elements in templates include an `alt` attribute
  - [x] Template partials that render images require a non-empty `alt` value or conditionally omit the image
  - [x] Purely decorative images use `alt=""` with `role="presentation"` where applicable
- [x] Keyboard navigability is confirmed for all interactive elements in the scaffold:
  - [x] All links and buttons are focusable and have visible focus styles
  - [x] No interactive elements are keyboard-inaccessible (e.g. click-only without keyboard equivalent)
- [x] Automated accessibility check tool is configured:
  - [x] `pa11y-ci` (or equivalent) is installed as a dev dependency
  - [x] Configuration file (`pa11y-ci` config or `.pa11yci.json`) targets representative scaffold pages
  - [x] Compliance target is WCAG 2.2 AA; automated tool baseline is documented as `WCAG2AA` with a manual WCAG 2.2 delta checklist
  - [x] Runner exits with non-zero code on any automated WCAG violation in the configured ruleset
- [x] `pa11y-ci` passes on all scaffold template types (homepage, article, page, archive, category term) with placeholder content
- [x] Color contrast: scaffold base styles (if any) meet WCAG AA minimum contrast ratio (4.5:1 for normal text, 3:1 for large text)
- [x] Known manual-review checks are documented in `docs/migration/RUNBOOK.md`:
  - [x] Focus order (logical reading order matches visual order)
  - [x] Skip links (visually hidden but reachable)
  - [x] Color contrast for any custom UI elements not caught by automated tools
- [x] `npm run check:a11y` is defined in `package.json` and passes on scaffold build

---

### Tasks

- [x] Audit scaffold templates from RHI-023 for semantic structure:
  - [x] Confirm single `<h1>` per page type; fix any template using multiple `<h1>` elements
  - [x] Add `<header>`, `<main>`, `<footer>` landmark regions to `baseof.html`
  - [x] Add `<nav aria-label="Primary navigation">` landmark where site navigation is rendered
  - [x] Add skip-to-main-content link at the top of `baseof.html`:
    ```html
    <a href="#main-content" class="skip-link">Skip to main content</a>
    ```
  - [x] Add `id="main-content"` to the `<main>` element
- [x] Review all `<img>` usage in templates; ensure `alt` attribute is always present:
  - [x] For `heroImage` or featured image partials: require `alt` from front matter or provide a computed fallback
  - [x] For decorative layout images (if any): use `alt=""` with `role="presentation"`
- [x] Add minimal focus-visible styles to scaffold CSS (or document as a post-Phase 4 requirement if no CSS exists yet)
- [x] Install `pa11y-ci` as a dev dependency: `npm install pa11y-ci --save-dev --save-exact`
- [x] Create `.pa11yci.json` (or equivalent) config:
  - [x] Set `standard: "WCAG2AA"` and document this as tool-supported baseline for the WCAG 2.2 AA target
  - [x] Add URLs for each representative scaffold template type
  - [x] Configure `runners: ["axe", "htmlcs"]` for comprehensive coverage
- [x] Add `"check:a11y": "pa11y-ci"` to `package.json` scripts
- [x] Build scaffold with representative placeholder content (homepage, one article, one category page)
- [x] Run `npm run check:a11y` — review all violations
- [x] Fix any WCAG AA violations in templates; document known false positives in `.pa11yci.json`
- [x] Run `npm run check:a11y` again — confirm pass
- [x] Document manual-review checklist in `docs/migration/RUNBOOK.md`:
  - [x] Focus order verification steps
  - [x] Skip-link testing procedure (Tab key from top of page)
  - [x] Contrast check for any custom UI elements
- [x] Commit templates with a11y fixes, `pa11y-ci` config, and `package.json` changes

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
| RHI-019 Done — Phase 3 Bootstrap complete | Ticket | Resolved |
| RHI-023 Done — Template scaffold committed (templates needed for a11y checks) | Ticket | Resolved |
| RHI-015 Outcomes — `pa11y-ci` approved in tooling list | Ticket | Resolved |
| Node.js runtime for `pa11y-ci` | Tool | Resolved |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| `pa11y-ci` requires a running HTTP server; CI setup is complex | Medium | Medium | Use the repo-owned `scripts/check-a11y.js` wrapper to serve `public/` locally, expand route-only config entries to `localhost`, and document the command in `RUNBOOK.md` | Engineering Owner |
| Automated tools miss keyboard navigation and focus-order issues | High | Medium | Document these as required manual checks in RUNBOOK; schedule manual review before Phase 4 sign-off | Engineering Owner |
| Minimal scaffold CSS means focus styles are browser default only | Medium | Low | Document as acceptable for Phase 3; assign visible focus style implementation to Phase 4/5 design scope | Engineering Owner |
| `pa11y-ci` version conflicts with Node version or other dependencies | Low | Low | Pin exact version; test in CI environment before committing lock file | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Implemented the Phase 3 accessibility baseline across the shared scaffold, added a repo-owned local `pa11y-ci` runner, and documented the manual keyboard and contrast checks that remain necessary beyond the automated `WCAG2AA` gate.

**Delivered artefacts:**

- Updated scaffold templates with semantic landmarks, a keyboard-reachable skip link, labeled navigation landmarks, accessible current-page states, and corrected heading hierarchy
- `.pa11yci.json` accessibility-check configuration covering the representative scaffold routes
- `scripts/check-a11y.js` local static-server wrapper for `public/` plus `pa11y-ci`
- `package.json` and `package-lock.json` updated with `check:a11y` and pinned `pa11y-ci@3.1.0`
- `docs/migration/RUNBOOK.md` updated with the manual-review checklist and local accessibility command guidance
- `analysis/documentation/phase-3/rhi-027-accessibility-ux-baseline-2026-03-09.md`

**Deviations from plan:**

- Pinned `pa11y-ci` to `3.1.0` instead of the current 4.x major to preserve the repository's documented Node `>=18` runtime contract while still using the same `WCAG2AA`/`axe`/`htmlcs` config surface.
- Used a repo-owned Node wrapper around `pa11y-ci` rather than assuming a built-in static-dist mode. The wrapper serves `public/` locally because official `pa11y-ci` docs are URL-based rather than `staticDistDir`-based.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-09 | In Progress | Reconciled RHI-027 with PM, BA, Hugo Specialist, Senior QA, and official-source guidance; audited the scaffold for landmarks, heading hierarchy, skip links, and image semantics. |
| 2026-03-09 | In Progress | Added the skip-link/focus baseline, centralized image-alt handling, `pa11y-ci` config, and the repo-owned local runner in `scripts/check-a11y.js`. |
| 2026-03-09 | Done | `npm run build:prod` passed, `npm run check:a11y` passed on `/`, `/phase-3-performance-baseline/`, `/scaffold-readiness/`, `/posts/`, `/category/`, and `/category/platform/`, and manual keyboard checks confirmed skip-link focus transfer on the home and article routes. |

---

### Notes

- WCAG 2.2 AA conformance requires evaluating full pages and complete processes — not just individual components. Automated tools catch approximately 30–40% of WCAG violations; manual review is always necessary. This ticket establishes the automated baseline; the manual review is Phase 8 scope.
- Skip-to-main-content links are only useful if they are the first focusable element on the page. Verify tab order with a keyboard test before close.
- The repo uses exactly one page-level `<h1>` per route as a project convention for the scaffold, even though WCAG itself does not require that exact HTML rule.
- Reference: `analysis/plan/details/phase-3.md` §Workstream H: Accessibility and UX Baseline; https://www.w3.org/TR/WCAG22/
