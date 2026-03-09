## RHI-105 · Workstream L — Article Readability and Contextual Navigation

**Status:** Open  
**Priority:** High  
**Estimate:** L  
**Phase:** 3  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-07  
**Created:** 2026-03-09  
**Updated:** 2026-03-09

---

### Goal

Implement the article-page readability and discovery structure required by the approved design brief so that long-form posts become easier to scan, navigate, and continue from. This ticket owns the single-page UI patterns that sit on top of the scaffold delivered by RHI-023: metadata row, summary box, heading-derived TOC, related-content matrix, and contextual footer actions.

This ticket intentionally depends on RHI-104 so article-specific work can reuse the shared metadata-row and shell primitives instead of creating a second UI architecture.

---

### Acceptance Criteria

- [ ] `src/layouts/_default/single.html` is extended using the shipped scaffold contract and any new article partials created by this ticket:
  - [ ] Article header presents title, metadata row, and optional update status in a consistent order
  - [ ] Summary box supports 2-3 bullet takeaways when `params.summary` exists and degrades cleanly when it does not
  - [ ] Article TOC is derived from page headings rather than hand-maintained markup
  - [ ] Desktop TOC remains visible in a stable reading rail; mobile exposes the TOC through an accessible collapsible control
  - [ ] Footer actions include Back to topic hub and Next article or documented fallback behavior
- [ ] Related-content presentation is implemented without requiring a new recommendation engine:
  - [ ] Supports three buckets: Next in topic, Adjacent topic, Foundational explainer
  - [ ] Accepts explicit override data when present
  - [ ] Falls back to Hugo-related or taxonomy-based logic when explicit data is absent
  - [ ] Handles fewer than three related items without broken layout or empty chrome
- [ ] Article readability patterns are explicitly covered:
  - [ ] Visible spacing rhythm between sections and headings
  - [ ] Callout treatment exists for warnings, tips, or key takeaways without breaking Markdown rendering
  - [ ] Metadata row surfaces date, reading time, primary topic, and update status when available
  - [ ] Tap targets and toggle controls remain usable on mobile
- [ ] Traceability is explicit in the delivered implementation notes:
  - [ ] Wireframe IDs in scope: `WF-ART-D`, `WF-ART-M`
  - [ ] Annotation keys in scope: `ART-01`, `ART-02`, `ART-03`
  - [ ] Checklist items in scope are mapped and closed: `CL-030` through `CL-036`, `CL-042`, `CL-043`, `CL-062`, `CL-070`, `CL-071`, `CL-072`
- [ ] Existing Phase 3 quality gates still pass after the article UI changes:
  - [ ] `hugo --minify --environment production`
  - [ ] `npm run check:seo`
  - [ ] `npm run check:a11y`
  - [ ] `npm run check:perf`
- [ ] The ticket does not introduce duplicate breadcrumb, canonical, Open Graph, or JSON-LD logic outside the existing shared partials

---

### Tasks

- [ ] Reconcile article wireframes and checklist items against the actual scaffold shipped by RHI-023 and the shared UI primitives delivered by RHI-104
- [ ] Create or extract article-specific partials as needed for:
  - [ ] metadata row composition
  - [ ] summary box
  - [ ] TOC rail and mobile toggle
  - [ ] related-content matrix
  - [ ] contextual footer actions
- [ ] Extend `src/layouts/_default/single.html` to use the new article partials without duplicating base template or SEO behavior
- [ ] Use Hugo heading-derived TOC output rather than maintaining a separate manual chapter list
- [ ] Define graceful fallback behavior for:
  - [ ] missing `params.summary`
  - [ ] missing discovery metadata
  - [ ] fewer than three related items
  - [ ] articles whose headings do not produce a meaningful TOC
- [ ] Re-run representative accessibility, SEO, and performance checks on at least one article route and one low-content route
- [ ] Update ticket outcomes and related Phase 3 documentation with final file paths, fallback rules, and deferred items if any

---

### Out of Scope

- Manual editorial rewriting of article bodies to improve heading quality
- Search backend or recommendation-engine infrastructure
- Post-launch tuning of related-content heuristics
- Reopening route, canonical, or schema contracts already delivered by RHI-023 and RHI-024
- Mandatory presence of enriched metadata on every migrated article before Phase 4 mapping exists

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-023 Done — Template scaffold exists and article pages already render through `_default/single.html` | Ticket | Pending |
| RHI-024 Done — Shared SEO partial architecture remains the only SEO source of truth | Ticket | Pending |
| RHI-027 Done — Accessibility baseline exists for article semantics and skip-link behavior | Ticket | Pending |
| RHI-104 Done — Shared UI primitives exist for metadata row and shell composition | Ticket | Pending |
| Approved article wireframes and checklist items remain available in `analysis/design/` and `analysis/documentation/checklists/` | Artifact | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Migrated heading structure produces a poor TOC on real content | High | Medium | Keep TOC derived from headings but require graceful fallback when the heading structure is too sparse or noisy | Engineering Owner |
| Related-content buckets appear empty before Phase 4 metadata enrichment lands | High | Medium | Support explicit overrides and taxonomy-based fallback; require coherent empty states | Engineering Owner |
| Summary box assumes metadata that does not yet exist on migrated content | Medium | Medium | Make summary optional and hide the module when no data is present | Engineering Owner |
| Article UI refactor regresses current a11y or perf baselines | Medium | High | Re-run current Phase 3 gates on representative article routes before closure | Engineering Owner |
| Callout styling requires broader visual system work than Phase 3 can absorb | Medium | Low | Keep callout scope structural and minimal; defer advanced styling polish if needed | Engineering Owner |

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

- `src/layouts/_default/single.html` updated with article readability and contextual-navigation structure
- Article partials for summary, TOC, related content, and footer actions
- Phase 3 documentation update describing article UI coverage, fallback behavior, and any deferred items

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-09 | Open | Ticket created to add article readability and contextual navigation coverage missing from the original Phase 3 scaffold. |

---

### Notes

- Reading time should use Hugo-derived output rather than a separate authored front matter field unless a later contract explicitly changes that choice.
- Update status should continue to derive from existing date and `lastmod` semantics rather than a second top-level date field.
- This ticket must preserve breadcrumb and SEO composition rules already established in the scaffold.
