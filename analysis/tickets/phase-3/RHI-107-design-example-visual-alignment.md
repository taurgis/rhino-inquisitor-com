## RHI-107 · Workstream M — Design Example Visual Alignment

**Status:** Open  
**Priority:** High  
**Estimate:** M  
**Phase:** 3  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-08  
**Created:** 2026-03-10  
**Updated:** 2026-03-10

---

### Goal

Align the homepage, archive, taxonomy, and shared site shell with the approved high-fidelity design examples under `analysis/design/generated-images/design-examples/` so the Phase 3 scaffold matches the intended editorial visual language instead of only the low-fidelity structural wireframes.

This ticket exists because `RHI-104` closed the structural discovery surfaces and reusable primitives, but the screenshot-driven visual contract was not made executable in the ticket acceptance criteria. `RHI-107` keeps `RHI-104` historically accurate and adds a clean implementation vehicle for the screenshot-parity work the current implementation still misses.

---

### Acceptance Criteria

- [ ] The generated design-example screenshots are treated as the canonical visual references for homepage and archive discovery surfaces:
  - [ ] `analysis/design/generated-images/design-examples/homepage-desktop-design-v1.png`
  - [ ] `analysis/design/generated-images/design-examples/homepage-mobile-design-v1.png`
  - [ ] `analysis/design/generated-images/design-examples/archive-desktop-design-v1.png`
  - [ ] `analysis/design/generated-images/design-examples/archive-mobile-design-v1.png`
- [ ] Shared shell styling is visually aligned with the approved design direction without reopening routing or SEO architecture:
  - [ ] Header uses the screenshot-aligned editorial masthead treatment, including darker navigation chrome, visible search affordance, and primary CTA hierarchy
  - [ ] Typography system clearly separates editorial-display headings from highly legible body copy
  - [ ] Accent system reflects the approved deep-slate plus energetic blue/cyan direction rather than an ad hoc warm-only palette
  - [ ] Footer, newsletter strip, and secondary modules use restrained surfaces and spacing that match the screenshots' density and hierarchy
- [ ] Homepage visual alignment is implemented on top of the `RHI-104` structure:
  - [ ] Hero reflects the screenshot-scale editorial headline, supporting copy, dual CTA hierarchy, and complementary visual area
  - [ ] Featured content card uses image-first presentation with elevated surface styling
  - [ ] Recent-post cards, topic hubs, project rail, and newsletter strip visually match the approved card rhythm and spacing
  - [ ] Mobile homepage follows the screenshot's single-column composition and tap-target density
- [ ] Archive and taxonomy visual alignment is implemented on top of the `RHI-104` structure:
  - [ ] Archive title block, search/control row, and left-rail filter treatment match the approved screenshot hierarchy
  - [ ] Archive cards use image thumbnails, metadata-first scanning, and card styling consistent with the desktop and mobile design examples
  - [ ] Pagination and jump-to-year controls use the same visual system as the approved archive screenshots
  - [ ] Mobile archive controls remain visible and compact near the top of the page, matching the mobile screenshot contract
- [ ] Implementation remains technically safe:
  - [ ] No duplicate canonical, Open Graph, JSON-LD, breadcrumb, or robots logic is introduced outside the existing shared SEO partials
  - [ ] No JavaScript-only archive filtering or search dependency is introduced to achieve visual parity
  - [ ] The visual work is driven by shared tokens, component classes, or partial updates rather than per-template one-off overrides
- [ ] Traceability is explicit in the implementation notes and ticket outcomes:
  - [ ] Screenshot filenames are mapped to affected templates, partials, and stylesheet ownership
  - [ ] Binding visual traits and non-binding illustrative details are documented separately
  - [ ] Checklist items reused from `RHI-104` are cross-referenced instead of silently reinterpreted
- [ ] Existing Phase 3 quality gates still pass after the visual alignment work:
  - [ ] `hugo --minify --environment production`
  - [ ] `npm run check:seo`
  - [ ] `npm run check:a11y`
  - [ ] `npm run check:perf`

---

### Tasks

- [ ] Audit the current homepage and archive output against the approved screenshot examples and document concrete mismatches by route and component
- [ ] Define the binding visual contract for shared shell, homepage, archive, and taxonomy surfaces in Phase 3 documentation
- [ ] Refactor shared CSS tokens, layout primitives, and card treatments to match the approved visual direction
- [ ] Update `src/layouts/home.html`, `src/layouts/_default/list.html`, `src/layouts/_default/taxonomy.html`, `src/layouts/_default/term.html`, and related shared partials so the implementation reflects the screenshots
- [ ] Add or restore the compact project/newsletter/supporting modules shown in the approved homepage examples when a stable data source exists, or document the exact approved omission if one still applies
- [ ] Capture before/after screenshot evidence for desktop and mobile homepage/archive surfaces
- [ ] Re-run representative accessibility, SEO, and performance checks on homepage, archive, and taxonomy routes
- [ ] Update ticket outcomes, Phase 3 documentation, and sign-off artefacts with the final screenshot-to-template traceability map

---

### Out of Scope

- Article-page screenshot alignment, TOC styling, callout styling, and related-content visual parity owned by `RHI-105`
- Search backend, recommendation engine, or client-side faceted filtering
- Route, canonical, taxonomy, sitemap, or robots policy changes already established by `RHI-021` through `RHI-025`
- Inventing project or newsletter data that does not yet exist in the repository
- Replacing the generated design examples with a different visual direction

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-104 Done — Structural discovery surfaces and shared UI primitives exist | Ticket | Done |
| Approved high-fidelity design examples under `analysis/design/generated-images/design-examples/` | Artifact | Done |
| UI implementation checklist with structural ownership and visual-contract updates | Artifact | Pending |
| RHI-105 Open — Article-page visual alignment proceeds separately on the same design system | Ticket | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Screenshot sample content is mistaken for binding content requirements | Medium | Medium | Document sample copy, counts, and illustration specifics as non-binding unless explicitly promoted | Engineering Owner |
| Shared visual token changes unintentionally regress article surfaces | High | Medium | Coordinate shared CSS changes with `RHI-105` and verify representative article routes during QA | Engineering Owner |
| Image-first cards require hero/media coverage that migrated content does not yet supply consistently | High | Medium | Define graceful media fallback treatment and avoid blocking content batches on optional imagery | Engineering Owner |
| Visual parity work regresses accessibility or performance | Medium | High | Keep `check:a11y` and `check:perf` mandatory exit gates for this ticket | Engineering Owner |
| Scope drifts from screenshot fidelity into a new design direction | Medium | High | Treat the generated design examples as the design ceiling for this ticket and reject unrelated visual changes | Engineering Owner |

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

- Screenshot-aligned shared visual system for homepage, archive, taxonomy, and site shell
- Phase 3 documentation update that separates structural and visual acceptance
- Before/after evidence linked to the approved design examples

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-10 | Open | Ticket created after screenshot review showed that `RHI-104` delivered structural discovery surfaces but not the approved high-fidelity visual direction from the generated design examples. |

---

### Notes

- `RHI-104` remains the structural delivery record for homepage, archive, taxonomy, and shared UI primitives.
- This ticket must preserve the no-JavaScript discovery contract introduced in Phase 3 unless a separate approved scope change explicitly changes that rule.
- If a screenshot element depends on unavailable data, document the fallback rather than fabricating placeholder production data.