## RHI-056 · Workstream I — Accessibility as Discoverability Support

**Status:** Done  
**Priority:** Medium  
**Estimate:** M  
**Phase:** 5  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-23  
**Created:** 2026-03-07  
**Updated:** 2026-03-13

---

### Goal

Confirm that all production templates meet a WCAG 2.2 launch baseline for in-scope pages, with Level A as a hard blocker and Level AA defects triaged to closure with owners and target dates. Accessibility and SEO are complementary: correct heading hierarchy, landmark regions, and non-text content alternatives help crawlers parse document structure, reduce bounce due to usability failures, and prevent legal and reputational risk. This workstream is not the full accessibility audit — it is the SEO-adjacent accessibility gate for launch readiness.

---

### Acceptance Criteria

- [x] Automated accessibility check is configured using `pa11y-ci` or equivalent:
  - [x] Runs against at least: homepage, one article page, one category page, privacy policy page
  - [x] Reports issues by WCAG 2.2 level: A, AA
  - [x] Produces `migration/reports/phase-5-accessibility-audit.md`
  - [x] Is referenced in `package.json` as `npm run check:a11y:seo`
  - [x] CI integration: runs against a locally served `public/` build
  - [x] Fails CI on any WCAG 2.2 Level A violation (critical)
  - [x] Fails CI on critical WCAG 2.2 Level AA violations on representative templates; non-critical Level AA violations must be triaged with owner and target resolution date
- [x] Heading hierarchy is correct on all template families:
  - [x] Each page has exactly one `<h1>` matching the page `<title>` or primary topic
  - [x] Heading levels do not skip (no `<h1>` → `<h3>` without `<h2>`)
  - [x] List and taxonomy templates use appropriate `<h1>` for the page context (not article titles)
- [x] Landmark regions are present on all templates:
  - [x] `<header>`, `<main>`, `<nav>`, `<footer>` semantic regions are present
  - [x] Skip navigation link is present to bypass repeated header content
- [x] Image alt text requirements are met (coordinate with Workstream H, RHI-055):
  - [x] All non-decorative `<img>` tags have descriptive `alt` attributes
  - [x] Decorative images have `alt=""` and `role="presentation"`
- [x] No critical unresolved accessibility defects remain on the representative page set before sign-off
- [x] Manual keyboard navigation check completed on homepage and one article page:
  - [x] All interactive elements are reachable by Tab
  - [x] Focus ring is visible on focused elements
  - [x] No keyboard traps

---

### Tasks

- [x] Install and configure `pa11y-ci`:
  - [x] Create `pa11y-ci.config.js` with target URL list and WCAG 2.2 AA standard
  - [x] Configure to serve from local `public/` directory
  - [x] Set error threshold: fail on Level A and critical Level AA; report non-critical Level AA with owner triage
- [x] Audit heading hierarchy across templates:
  - [x] Check `src/layouts/_default/single.html` — confirm `<h1>` is emitted once per page
  - [x] Check `src/layouts/_default/list.html` — confirm `<h1>` for list page context, not for each list item
  - [x] Check `src/layouts/partials/` for any heading-emitting partials that could duplicate `<h1>`
- [x] Audit landmark regions in `src/layouts/_default/baseof.html`:
  - [x] Confirm `<header>`, `<main>`, `<nav>`, `<footer>` are present
  - [x] Confirm skip navigation link exists (`<a href="#main-content">Skip to content</a>`)
- [x] Run `pa11y-ci` against the scaffold build:
  - [x] Record Level A and AA violation counts in Progress Log
  - [x] Fix all Level A violations before declaring this workstream Done
  - [x] Triage Level AA violations: fix if template-level, note if content-dependent
- [x] Perform manual keyboard navigation check on homepage and one article page
- [x] Add `"check:a11y:seo": "pa11y-ci"` (or equivalent) to `package.json`
- [x] Integrate `check:a11y:seo` as a CI step (blocking on Level A and critical Level AA defects)
- [x] Document all unresolved AA issues with owner and resolution target phase in Progress Log

---

### Out of Scope

- Full WCAG 2.2 AAA compliance (beyond launch scope)
- AAA-level colour contrast enhancements beyond WCAG 2.2 AA thresholds
- Screen reader testing with NVDA, VoiceOver (manual — deferred to post Phase 9 accessibility audit)
- Accessibility of content body (word complexity, reading level) — post-launch
- WCAG compliance for JavaScript-heavy interactive features (none expected on this static site)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-047 Done — Phase 5 Bootstrap complete | Ticket | Done |
| RHI-023 Done — Phase 3 template scaffolding (full HTML output for pa11y to scan) | Ticket | Done |
| RHI-027 Done — Phase 3 accessibility and UX baseline | Ticket | Done |
| RHI-055 — Workstream H image alt text audit (coordinate on alt text findings) | Ticket | Done |
| `pa11y-ci` available in `package.json` | Tool | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Phase 3 templates have no skip navigation, causing WCAG Level A violation | Medium | High | Fix in template at task start — skip navigation is a one-line template change | Engineering Owner |
| `<h1>` appears multiple times on list/category pages (e.g., every article title is an `<h1>`) | High | High | Check list template first; article title in list context should be `<h2>`, not `<h1>` | Engineering Owner |
| `pa11y-ci` generates false positives from dynamic content not yet present in scaffold | Medium | Low | Accept scaffold-level false positives; re-run against Pilot Batch content (RHI-043) for final gate | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-056 is complete. The repository now enforces a blocking Phase 5 accessibility discoverability gate on representative built output, writes a markdown audit artifact for sign-off evidence, and records manual keyboard verification on the homepage and a representative article route. During implementation the new gate surfaced a real taxonomy-page heading-level skip in the shared archive filter shell; that was fixed at the partial level so the representative category route now passes with zero blocking findings.

**Delivered artefacts:**

- `pa11y-ci.config.js`
- `migration/reports/phase-5-accessibility-audit.md`
- `scripts/seo/check-a11y.js`
- `package.json` updated with `check:a11y:seo` script
- CI workflows updated with `check:a11y:seo` blocking steps
- `src/layouts/partials/archive/filter-bar.html` updated to restore a valid heading sequence on representative category pages
- `analysis/documentation/phase-5/rhi-056-accessibility-discoverability-support-implementation-2026-03-13.md`
- All Level A and critical Level AA violations resolved; remaining non-critical Level AA issues documented with owners

**Deviations from plan:**

- `check:a11y:seo` is implemented through a repository wrapper (`scripts/seo/check-a11y.js`) around `pa11y-ci` rather than a raw direct `pa11y-ci` command so the gate can emit the required markdown report and enforce the heading/landmark checks that RHI-056 treats as launch-blocking template semantics.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-13 | In Progress | Added the dedicated `pa11y-ci.config.js` profile, implemented `scripts/seo/check-a11y.js`, wired `npm run check:a11y:seo` into PR and deploy validation, and generated the first `migration/reports/phase-5-accessibility-audit.md`. The initial semantic pass surfaced a real heading-level skip on `/category/platform/` caused by the shared archive filter shell rendering `h3` groups before any `h2`. |
| 2026-03-13 | Done | Fixed the archive filter heading hierarchy at the shared partial level, reran `npm run build:prod && npm run check:a11y:seo` to a clean pass on `/`, `/reflecting-on-2-years-of-blogging/`, `/category/platform/`, and `/privacy-policy/`, and completed manual keyboard checks on the homepage and representative article route. |

---

### Notes

- Accessibility issues at the template level affect every page uniformly — a missing `<h1>` or skip nav in a base template is a single fix that resolves the issue site-wide. Content-level accessibility issues (e.g., a specific post missing alt text on an image) are proportional to the content volume and are addressed per-batch.
- The scope of this workstream is specifically the intersection of accessibility and discoverability: heading hierarchy, landmark regions, and alt text. A deeper accessibility audit (colour contrast, ARIA, complex interactions) is outside Phase 5 scope.
- Critical Level AA handling is conservative by design: every Level AA finding on the representative route set is blocking unless it is explicitly listed in `approvedNonCriticalAaExceptions` within `pa11y-ci.config.js` with owner and target-phase metadata.
- Reference: `analysis/plan/details/phase-5.md` §Workstream I: Accessibility as Discoverability Support
