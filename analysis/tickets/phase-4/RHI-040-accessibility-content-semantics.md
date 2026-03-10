## RHI-040 · Workstream I — Accessibility and Content Semantics

**Status:** In Progress  
**Priority:** Medium  
**Estimate:** M  
**Phase:** 4  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-18  
**Created:** 2026-03-07  
**Updated:** 2026-03-10

---

### Goal

Verify that migrated content meets WCAG 2.2 Level AA requirements for in-scope content patterns and does not introduce accessibility regressions relative to the Phase 3 baseline. This workstream defines the content-level accessibility checks (alt text, heading order, link text quality, table structure) that apply to the generated Markdown and Hugo-rendered HTML, and ensures they are enforced as a CI gate for every batch.

Accessibility issues introduced during content migration are often harder to fix post-launch than structural template issues, because they exist in every individual content file rather than in shared templates.

---

### Acceptance Criteria

- [ ] Accessibility content check script `scripts/migration/check-a11y-content.js` exists and:
  - [x] Scans all generated `.md` files in `migration/output/content/` for:
    - [x] Images with missing or empty `alt` text — `![]()` or `![image]()` patterns
    - [x] Heading hierarchy violations: skipped heading levels (e.g., `##` followed by `####`)
    - [x] Repeated non-descriptive link text patterns: "click here", "read more", "here" as full link text
    - [x] Tables without header row structure (GFM tables with no `|---|` divider or all empty headers)
  - [x] Produces `migration/reports/a11y-content-warnings.csv` with per-file findings
  - [x] Distinguishes `blocking` issues (missing alt text on informative images, completely empty headers) from `warnings` (non-descriptive link text, cosmetic only)
  - [x] Exits with non-zero code on any blocking issue count exceeding the agreed batch cap
  - [x] Is referenced in `package.json` as `npm run check:a11y-content`
- [ ] Automated accessibility scan on Hugo-rendered output:
  - [x] `npm run check:a11y` from Phase 3 (RHI-027/RHI-029) passes on a representative 10-page sample from each batch
  - [x] Results are recorded in `migration/reports/accessibility-scan-summary.md`
- [ ] Manual keyboard accessibility check for article template with migrated content:
  - [ ] Tab navigation reaches all interactive elements
  - [x] Focus indicators are visible
  - [x] Skip-to-main-content link works correctly
- [ ] All informative images in migrated content have non-empty, descriptive alt text
- [ ] Heading order is logical and non-skipping in all validated pages
- [ ] No unresolved critical (WCAG 2.2 Level A) accessibility failures in the release candidate batch

---

### Tasks

- [x] Review Phase 3 accessibility baseline (RHI-027 Outcomes) to understand current template state
- [x] Define content-level accessibility blocking threshold per batch:
  - [x] Missing alt text: block (zero tolerance for informative images)
  - [x] Skipped heading levels: warn (unless `h1` appears in body — then block)
  - [x] Non-descriptive link text: warn with per-batch cap (agreed with engineering owner at `5` warnings)
  - [x] Table missing header: warn
  - [x] Record thresholds in `docs/migration/RUNBOOK.md`
- [x] Create `scripts/migration/check-a11y-content.js`:
  - [x] Implement alt text checker using regex on Markdown image syntax `![alt](src)`
  - [x] Implement heading order validator (track heading depth, flag non-sequential jumps)
  - [x] Implement link text quality checker (flag known problematic patterns)
  - [x] Implement GFM table header checker
  - [x] Write findings to `migration/reports/a11y-content-warnings.csv`
- [ ] Run `check:a11y-content` on pilot batch; fix all blocking issues before RHI-043
- [x] Run `npm run check:a11y` (pa11y-ci) on a representative 10-page staged sample
- [x] Record results in `migration/reports/accessibility-scan-summary.md`
- [x] Conduct manual keyboard navigation check on rendered article template with migrated content
- [ ] Document any accepted exceptions with owner and planned remediation date
- [x] Add `"check:a11y-content": "node scripts/migration/check-a11y-content.js"` to `package.json`
- [ ] Commit accessibility check script, findings, and summary report

---

### Out of Scope

- Full WCAG 2.2 conformance audit (Phase 8 scope)
- Publishing a formal WCAG conformance statement (not before a full documented evaluation)
- Redesigning content layouts for better accessibility (Phase 3/template scope)
- Fixing pre-existing accessibility issues in WordPress content that are out of migration scope

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-031 Done — Phase 4 Bootstrap complete | Ticket | Satisfied |
| RHI-034 Done — Converted Markdown records available | Ticket | Satisfied |
| RHI-027 Done — Phase 3 accessibility baseline documented | Ticket | Satisfied |
| `npm run check:a11y` from RHI-027/RHI-029 is callable | Ticket | Satisfied |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| High volume of images with no alt text in WordPress source | High | High | Prioritize alt text checks during pilot batch; allow empty alt text only for explicitly decorative images; require `alt=""` to be set intentionally, not by omission | Engineering Owner |
| WordPress content uses `h1` headings inside article body (conflicts with template `h1`) | Medium | Medium | Conversion engine (WS-C) should downshift `h1` in body; verify this consistently before accessibility check | Engineering Owner |
| `pa11y-ci` fails on Hugo-generated pages with complex embedded media | Low | Medium | Exclude known inaccessible embeds from pa11y scope; document exclusions with owner | Engineering Owner |
| Manual accessibility check availability gap (no dedicated accessibility reviewer) | Medium | Medium | Engineering owner performs keyboard check with documented checklist; flag for dedicated reviewer in Phase 8 | Engineering Owner |

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

- `scripts/migration/check-a11y-content.js`
- `migration/reports/a11y-content-warnings.csv`
- `migration/reports/accessibility-scan-summary.md`
- `package.json` updated with `check:a11y-content` script

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-10 | In Progress | Agreed the Phase 4 accessibility threshold contract with the engineering owner: blocking cap `0`, weak-link warning cap `5`, generic and filename-like alt text are blocking, and empty alt text requires an explicit decorative-image exception. |
| 2026-03-10 | In Progress | Added `scripts/migration/check-a11y-content.js`, wired `npm run check:a11y-content`, and extended `scripts/check-a11y.js` so `npm run check:a11y` can target `CHECK_A11Y_PUBLIC_DIR` plus a custom `CHECK_A11Y_URLS` sample list for staged migration builds. |
| 2026-03-10 | In Progress | Baseline evidence recorded in `migration/reports/accessibility-scan-summary.md`: the Markdown gate scanned 171 staged files and reported 315 blocking findings plus 88 warnings; the deterministic 10-page rendered sample passed on 6 of 10 routes; and a manual keyboard spot-check confirmed skip-link behavior plus visible focus styling on `/the-realm-split-field-guide-to-migrating-an-sfcc-site/`. |
| 2026-03-10 | In Progress | Targeted remediation on the highest-priority staged files reduced the Markdown gate to 270 blocking findings plus 87 warnings and brought the deterministic 10-page rendered sample to 10 of 10 passing routes. RHI-040 remains open because the Markdown gate still exceeds the zero-blocking threshold. |
| 2026-03-10 | In Progress | A second remediation slice on the next highest-blocking files reduced the Markdown gate further to 238 blocking findings plus 84 warnings while keeping the deterministic rendered sample at 10 of 10 passing routes. |

---

### Notes

- Do not publish a WCAG conformance claim unless a documented conformance evaluation exists with explicit scope and methodology. This workstream establishes the automated gate, not a conformance claim.
- The difference between `alt=""` (decorative image) and `alt="image"` (non-descriptive but non-empty) is significant for screen readers. The check script should flag `alt="image"`, `alt="photo"`, and filename-based alt text patterns in addition to empty alt attributes.
- Heading order violations introduced by Gutenberg block to Markdown conversion are the most common content-level accessibility issue in WordPress migrations. Verify the WS-C heading shift logic handles this correctly.
- Reference: `analysis/plan/details/phase-4.md` §Workstream I: Accessibility and Content Semantics
