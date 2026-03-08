## RHI-040 · Workstream I — Accessibility and Content Semantics

**Status:** Open  
**Priority:** Medium  
**Estimate:** M  
**Phase:** 4  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-18  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Verify that migrated content meets WCAG 2.2 Level AA requirements for in-scope content patterns and does not introduce accessibility regressions relative to the Phase 3 baseline. This workstream defines the content-level accessibility checks (alt text, heading order, link text quality, table structure) that apply to the generated Markdown and Hugo-rendered HTML, and ensures they are enforced as a CI gate for every batch.

Accessibility issues introduced during content migration are often harder to fix post-launch than structural template issues, because they exist in every individual content file rather than in shared templates.

---

### Acceptance Criteria

- [ ] Accessibility content check script `scripts/migration/check-a11y-content.js` exists and:
  - [ ] Scans all generated `.md` files in `migration/output/content/` for:
    - [ ] Images with missing or empty `alt` text — `![]()` or `![image]()` patterns
    - [ ] Heading hierarchy violations: skipped heading levels (e.g., `##` followed by `####`)
    - [ ] Repeated non-descriptive link text patterns: "click here", "read more", "here" as full link text
    - [ ] Tables without header row structure (GFM tables with no `|---|` divider or all empty headers)
  - [ ] Produces `migration/reports/a11y-content-warnings.csv` with per-file findings
  - [ ] Distinguishes `blocking` issues (missing alt text on informative images, completely empty headers) from `warnings` (non-descriptive link text, cosmetic only)
  - [ ] Exits with non-zero code on any blocking issue count exceeding the agreed batch cap
  - [ ] Is referenced in `package.json` as `npm run check:a11y-content`
- [ ] Automated accessibility scan on Hugo-rendered output:
  - [ ] `npm run check:a11y` from Phase 3 (RHI-027/RHI-029) passes on a representative 10-page sample from each batch
  - [ ] Results are recorded in `migration/reports/accessibility-scan-summary.md`
- [ ] Manual keyboard accessibility check for article template with migrated content:
  - [ ] Tab navigation reaches all interactive elements
  - [ ] Focus indicators are visible
  - [ ] Skip-to-main-content link works correctly
- [ ] All informative images in migrated content have non-empty, descriptive alt text
- [ ] Heading order is logical and non-skipping in all validated pages
- [ ] No unresolved critical (WCAG 2.2 Level A) accessibility failures in the release candidate batch

---

### Tasks

- [ ] Review Phase 3 accessibility baseline (RHI-027 Outcomes) to understand current template state
- [ ] Define content-level accessibility blocking threshold per batch:
  - [ ] Missing alt text: block (zero tolerance for informative images)
  - [ ] Skipped heading levels: warn (unless `h1` appears in body — then block)
  - [ ] Non-descriptive link text: warn with per-batch cap (agree cap with engineering owner)
  - [ ] Table missing header: warn
  - [ ] Record thresholds in `docs/migration/RUNBOOK.md`
- [ ] Create `scripts/migration/check-a11y-content.js`:
  - [ ] Implement alt text checker using regex on Markdown image syntax `![alt](src)`
  - [ ] Implement heading order validator (track heading depth, flag non-sequential jumps)
  - [ ] Implement link text quality checker (flag known problematic patterns)
  - [ ] Implement GFM table header checker
  - [ ] Write findings to `migration/reports/a11y-content-warnings.csv`
- [ ] Run `check:a11y-content` on pilot batch; fix all blocking issues before RHI-043
- [ ] Run `npm run check:a11y` (pa11y-ci) on a 10-page sample from pilot batch
- [ ] Record results in `migration/reports/accessibility-scan-summary.md`
- [ ] Conduct manual keyboard navigation check on rendered article template with migrated content
- [ ] Document any accepted exceptions with owner and planned remediation date
- [ ] Add `"check:a11y-content": "node scripts/migration/check-a11y-content.js"` to `package.json`
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
| RHI-031 Done — Phase 4 Bootstrap complete | Ticket | Pending |
| RHI-034 Done — Converted Markdown records available | Ticket | Pending |
| RHI-027 Done — Phase 3 accessibility baseline documented | Ticket | Pending |
| `npm run check:a11y` from RHI-027/RHI-029 is callable | Ticket | Pending |

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

---

### Notes

- Do not publish a WCAG conformance claim unless a documented conformance evaluation exists with explicit scope and methodology. This workstream establishes the automated gate, not a conformance claim.
- The difference between `alt=""` (decorative image) and `alt="image"` (non-descriptive but non-empty) is significant for screen readers. The check script should flag `alt="image"`, `alt="photo"`, and filename-based alt text patterns in addition to empty alt attributes.
- Heading order violations introduced by Gutenberg block to Markdown conversion are the most common content-level accessibility issue in WordPress migrations. Verify the WS-C heading shift logic handles this correctly.
- Reference: `analysis/plan/details/phase-4.md` §Workstream I: Accessibility and Content Semantics
