## RHI-056 · Workstream I — Accessibility as Discoverability Support

**Status:** Open  
**Priority:** Medium  
**Estimate:** M  
**Phase:** 5  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-23  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Confirm that all production templates meet a WCAG 2.2 AA accessibility baseline for in-scope pages. Accessibility and SEO are complementary: correct heading hierarchy, landmark regions, and non-text content alternatives help crawlers parse document structure, reduce bounce due to usability failures, and prevent legal and reputational risk. This workstream is not the full accessibility audit — it is the SEO-adjacent accessibility gate for launch readiness.

---

### Acceptance Criteria

- [ ] Automated accessibility check is configured using `pa11y-ci` or equivalent:
  - [ ] Runs against at least: homepage, one article page, one category page, privacy policy page
  - [ ] Reports issues by WCAG 2.2 level: A, AA
  - [ ] Produces `migration/reports/phase-5-accessibility-audit.md`
  - [ ] Is referenced in `package.json` as `npm run check:a11y:seo`
  - [ ] CI integration: runs against a locally served `public/` build
  - [ ] Fails CI on any WCAG 2.2 Level A violation (critical)
  - [ ] Warns on WCAG 2.2 Level AA violations (non-blocking for launch, must be reviewed)
- [ ] Heading hierarchy is correct on all template families:
  - [ ] Each page has exactly one `<h1>` matching the page `<title>` or primary topic
  - [ ] Heading levels do not skip (no `<h1>` → `<h3>` without `<h2>`)
  - [ ] List and taxonomy templates use appropriate `<h1>` for the page context (not article titles)
- [ ] Landmark regions are present on all templates:
  - [ ] `<header>`, `<main>`, `<nav>`, `<footer>` semantic regions are present
  - [ ] Skip navigation link is present to bypass repeated header content
- [ ] Image alt text requirements are met (coordinate with Workstream H, RHI-055):
  - [ ] All non-decorative `<img>` tags have descriptive `alt` attributes
  - [ ] Decorative images have `alt=""` and `role="presentation"`
- [ ] No critical unresolved accessibility defects remain on the representative page set before sign-off
- [ ] Manual keyboard navigation check completed on homepage and one article page:
  - [ ] All interactive elements are reachable by Tab
  - [ ] Focus ring is visible on focused elements
  - [ ] No keyboard traps

---

### Tasks

- [ ] Install and configure `pa11y-ci`:
  - [ ] Create `pa11y-ci.config.js` with target URL list and WCAG 2.2 AA standard
  - [ ] Configure to serve from local `public/` directory
  - [ ] Set error threshold: fail on Level A; warn on Level AA
- [ ] Audit heading hierarchy across templates:
  - [ ] Check `layouts/_default/single.html` — confirm `<h1>` is emitted once per page
  - [ ] Check `layouts/_default/list.html` — confirm `<h1>` for list page context, not for each list item
  - [ ] Check `layouts/partials/` for any heading-emitting partials that could duplicate `<h1>`
- [ ] Audit landmark regions in `layouts/_default/baseof.html`:
  - [ ] Confirm `<header>`, `<main>`, `<nav>`, `<footer>` are present
  - [ ] Confirm skip navigation link exists (`<a href="#main-content">Skip to content</a>`)
- [ ] Run `pa11y-ci` against the scaffold build:
  - [ ] Record Level A and AA violation counts in Progress Log
  - [ ] Fix all Level A violations before declaring this workstream Done
  - [ ] Triage Level AA violations: fix if template-level, note if content-dependent
- [ ] Perform manual keyboard navigation check on homepage and one article page
- [ ] Add `"check:a11y:seo": "pa11y-ci"` (or equivalent) to `package.json`
- [ ] Integrate `check:a11y:seo` as a CI step (blocking on Level A; non-blocking on AA for this phase)
- [ ] Document all unresolved AA issues with owner and resolution target phase in Progress Log

---

### Out of Scope

- Full WCAG 2.2 AAA compliance (beyond launch scope)
- Colour contrast optimization (AA compliance only — deferred to post-launch if not critical)
- Screen reader testing with NVDA, VoiceOver (manual — deferred to post Phase 9 accessibility audit)
- Accessibility of content body (word complexity, reading level) — post-launch
- WCAG compliance for JavaScript-heavy interactive features (none expected on this static site)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-047 Done — Phase 5 Bootstrap complete | Ticket | Pending |
| RHI-023 Done — Phase 3 template scaffolding (full HTML output for pa11y to scan) | Ticket | Pending |
| RHI-027 Done — Phase 3 accessibility and UX baseline | Ticket | Pending |
| RHI-055 — Workstream H image alt text audit (coordinate on alt text findings) | Ticket | Pending |
| `pa11y-ci` available in `package.json` | Tool | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Phase 3 templates have no skip navigation, causing WCAG Level A violation | Medium | High | Fix in template at task start — skip navigation is a one-line template change | Engineering Owner |
| `<h1>` appears multiple times on list/category pages (e.g., every article title is an `<h1>`) | High | High | Check list template first; article title in list context should be `<h2>`, not `<h1>` | Engineering Owner |
| `pa11y-ci` generates false positives from dynamic content not yet present in scaffold | Medium | Low | Accept scaffold-level false positives; re-run against Pilot Batch content (RHI-043) for final gate | Engineering Owner |

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

- `pa11y-ci.config.js`
- `migration/reports/phase-5-accessibility-audit.md`
- `package.json` updated with `check:a11y:seo` script
- CI workflow updated with `check:a11y:seo` step
- All Level A violations resolved; Level AA unresolved issues documented with owners

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- Accessibility issues at the template level affect every page uniformly — a missing `<h1>` or skip nav in a base template is a single fix that resolves the issue site-wide. Content-level accessibility issues (e.g., a specific post missing alt text on an image) are proportional to the content volume and are addressed per-batch.
- The scope of this workstream is specifically the intersection of accessibility and discoverability: heading hierarchy, landmark regions, and alt text. A deeper accessibility audit (colour contrast, ARIA, complex interactions) is outside Phase 5 scope.
- Reference: `analysis/plan/details/phase-5.md` §Workstream I: Accessibility as Discoverability Support
