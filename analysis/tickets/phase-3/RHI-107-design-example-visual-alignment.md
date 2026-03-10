## RHI-107 · Workstream M — Design Example Visual Alignment

**Status:** Done  
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

- [x] The generated design-example screenshots are treated as the canonical visual references for homepage and archive discovery surfaces:
  - [x] `analysis/design/generated-images/design-examples/homepage-desktop-design-v1.png`
  - [x] `analysis/design/generated-images/design-examples/homepage-mobile-design-v1.png`
  - [x] `analysis/design/generated-images/design-examples/archive-desktop-design-v1.png`
  - [x] `analysis/design/generated-images/design-examples/archive-mobile-design-v1.png`
- [x] Shared shell styling is visually aligned with the approved design direction without reopening routing or SEO architecture:
  - [x] Header uses the screenshot-aligned editorial masthead treatment, including darker navigation chrome, visible search affordance, and primary CTA hierarchy
  - [x] Typography system clearly separates editorial-display headings from highly legible body copy
  - [x] Accent system reflects the approved deep-slate plus energetic blue/cyan direction rather than an ad hoc warm-only palette
  - [x] Footer, newsletter strip, and secondary modules use restrained surfaces and spacing that match the screenshots' density and hierarchy
- [x] Homepage visual alignment is implemented on top of the `RHI-104` structure:
  - [x] Hero reflects the screenshot-scale editorial headline, supporting copy, dual CTA hierarchy, and complementary visual area
  - [x] Featured content card uses image-first presentation with elevated surface styling
  - [x] Recent-post cards, topic hubs, project rail, and newsletter strip visually match the approved card rhythm and spacing
  - [x] Mobile homepage follows the screenshot's single-column composition and tap-target density
- [x] Archive and taxonomy visual alignment is implemented on top of the `RHI-104` structure:
  - [x] Archive title block, search/control row, and left-rail filter treatment match the approved screenshot hierarchy
  - [x] Archive cards use image thumbnails, metadata-first scanning, and card styling consistent with the desktop and mobile design examples
  - [x] Pagination and jump-to-year controls use the same visual system as the approved archive screenshots
  - [x] Mobile archive controls remain visible and compact near the top of the page, matching the mobile screenshot contract
- [x] Implementation remains technically safe:
  - [x] No duplicate canonical, Open Graph, JSON-LD, breadcrumb, or robots logic is introduced outside the existing shared SEO partials
  - [x] No JavaScript-only archive filtering or search dependency is introduced to achieve visual parity
  - [x] The visual work is driven by shared tokens, component classes, or partial updates rather than per-template one-off overrides
- [x] Traceability is explicit in the implementation notes and ticket outcomes:
  - [x] Screenshot filenames are mapped to affected templates, partials, and stylesheet ownership
  - [x] Binding visual traits and non-binding illustrative details are documented separately
  - [x] Checklist items reused from `RHI-104` are cross-referenced instead of silently reinterpreted
- [x] Existing Phase 3 quality gates still pass after the visual alignment work:
  - [x] `hugo --minify --environment production`
  - [x] `npm run check:seo`
  - [x] `npm run check:a11y`
  - [x] `npm run check:perf`

---

### Tasks

- [x] Audit the current homepage and archive output against the approved screenshot examples and document concrete mismatches by route and component
- [x] Define the binding visual contract for shared shell, homepage, archive, and taxonomy surfaces in Phase 3 documentation
- [x] Refactor shared CSS tokens, layout primitives, and card treatments to match the approved visual direction
- [x] Update `src/layouts/home.html`, `src/layouts/_default/list.html`, `src/layouts/_default/taxonomy.html`, `src/layouts/_default/term.html`, and related shared partials so the implementation reflects the screenshots
- [x] Add or restore the compact project/newsletter/supporting modules shown in the approved homepage examples when a stable data source exists, or document the exact approved omission if one still applies
- [x] Capture before/after screenshot evidence for desktop and mobile homepage/archive surfaces
- [x] Re-run representative accessibility, SEO, and performance checks on homepage, archive, and taxonomy routes
- [x] Update ticket outcomes, Phase 3 documentation, and sign-off artefacts with the final screenshot-to-template traceability map

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
| UI implementation checklist with structural ownership and visual-contract updates | Artifact | Done |
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

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Implemented the screenshot-aligned visual pass across the shared shell, homepage, archive, taxonomy, and term surfaces using shared CSS and partial updates rather than one-off template styling. The project rail remains intentionally omitted because `src/data/` still has no stable project dataset; that omission is now explicit in both the homepage support strip and the Phase 3 documentation note.

**Delivered artefacts:**

- Screenshot-aligned shared visual system for homepage, archive, taxonomy, and site shell
- Phase 3 documentation note with screenshot-to-template traceability and binding-vs-illustrative guidance
- Manual route verification and browser-session screenshot evidence for homepage and archive surfaces

**Design system decisions established in this ticket:**

- **Hero treatment:** White/light background with left-aligned tagline text and right-aligned brand illustration; replaces the original dark-gradient hero panel. No stat counters or aside panels.
- **CTA hierarchy:** Primary solid button (`site-cta`) and outline variant (`site-cta--outline`) centered below the hero in a light accent bar. Used consistently for "Start Reading" (primary) and "Browse Topics" (outline).
- **Homepage content grid:** 3-column layout (`home-content-grid`) with Featured Deep Dive card (image + title + excerpt + metadata), Latest Posts text list (title + excerpt + meta per row, hover highlight), and Top Topics pill cloud (filled accent-colored pills with count). Responsive: 2-column at 64rem, single-column at 48rem.
- **Typography scale:** Reduced from oversized display sizes — h1 now `clamp(1.75rem, 4vw, 2.5rem)`, h2 `clamp(1.35rem, 3vw, 1.75rem)`, h3 `clamp(1.1rem, 2.5vw, 1.35rem)`. Section labels use `.home-section__title` at 0.8rem uppercase.
- **Breadcrumbs:** Transparent inline text with muted color, no dark pill background. Font-size 0.85rem, slash separators, hover underline.
- **Archive header:** Center-aligned with `.eyebrow` label above h1 and description text below. Light `#f7fbff` background with bottom border separator.
- **Newsletter/support strip:** Light `#f0f4f8` background bar with left-aligned text (h2 + subtitle) and right-aligned CTA buttons. Replaces the dark `#0b1728` support strip.
- **Eyebrow labels:** Reduced to contextual markers ("Archive", "Topics") at 0.75rem, muted color. Internal scaffold labels (DISC-01, ARCH-01, etc.) removed from all templates.
- **Card grid:** Archive cards use `repeat(auto-fill, minmax(18rem, 1fr))` for responsive fill. Topic cards removed eyebrow "Topic" prefix.
- **Color accents retained:** Deep-slate ink (`--ink-strong`), energetic blue accent (`--accent`, `--accent-strong`), soft blue backgrounds (`--accent-soft`). No dark chrome outside the header.

**Deviations from plan:**

- The project rail remains omitted by design because the repository still lacks a stable project data source under `src/data/`.
- The homepage no longer uses lane-grid / feature-card / hero-stat patterns from the original scaffold; these were replaced with lighter purpose-built components that better match the design examples.
- Topic hubs on the homepage use a pill cloud pattern instead of individual topic cards, matching the design example's compact topic discovery surface.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-10 | Open | Ticket created after screenshot review showed that `RHI-104` delivered structural discovery surfaces but not the approved high-fidelity visual direction from the generated design examples. |
| 2026-03-10 | Done | Shared shell, homepage, archive, taxonomy, and term surfaces were visually aligned to the generated design examples; Phase 3 Hugo, SEO, accessibility, and performance gates all passed after the shared-system refresh. |

---

### Notes

- `RHI-104` remains the structural delivery record for homepage, archive, taxonomy, and shared UI primitives.
- This ticket must preserve the no-JavaScript discovery contract introduced in Phase 3 unless a separate approved scope change explicitly changes that rule.
- If a screenshot element depends on unavailable data, document the fallback rather than fabricating placeholder production data.