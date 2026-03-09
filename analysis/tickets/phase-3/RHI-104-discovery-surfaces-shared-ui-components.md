## RHI-104 · Workstream K — Discovery Surfaces and Shared UI Components

**Status:** Done  
**Priority:** High  
**Estimate:** L  
**Phase:** 3  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-05  
**Created:** 2026-03-09  
**Updated:** 2026-03-10

---

### Goal

Implement the shared Hugo UI primitives and list-surface discovery structure needed to turn the approved design artifacts into executable Phase 3 work. This ticket extends the scaffold delivered by RHI-023 without reopening the underlying SEO/template architecture. It owns the site shell extraction needed for maintainable UI work, the homepage discovery lanes, and the archive/category listing experience so that migrated content lands into intentional browse patterns instead of a placeholder scaffold.

This ticket closes the traceability gap between:

- `analysis/design/blog-modernization-designs-2026-03-08.md`
- `analysis/design/low-fi-wireframes-2026-03-08.md`
- `analysis/documentation/checklists/ui-implementation-checklist-2026-03-08.md`

and the actual Phase 3 implementation backlog.

---

### Acceptance Criteria

- [x] Shared UI partials exist for the scaffold paths actually used in this repo and do not duplicate SEO logic owned by `src/layouts/partials/seo/`:
  - [x] Site header partial extracted from `src/layouts/_default/baseof.html`
  - [x] Site footer partial extracted from `src/layouts/_default/baseof.html`
  - [x] Reusable article-card partial for home/list/taxonomy views
  - [x] Reusable metadata-row partial for date, reading time, topic, and update status presentation
  - [x] Shared empty-state treatment for low-content scaffold states
- [x] Homepage discovery experience is implemented in `src/layouts/home.html` using the current scaffold contract, not the earlier proposed `index.html` path:
  - [x] Hero includes short intro copy plus two visible primary actions: Start Reading and Browse Topics
  - [x] Featured lane, Recent lane, and Topic-hub lane render with stable empty states
  - [x] Mobile stacking order follows the approved wireframe: Featured, Recent, Topics, optional Project rail
  - [x] Topic lane can render counts or freshness hints without requiring JavaScript
- [x] Archive and taxonomy listing experience is implemented across `src/layouts/_default/list.html`, `src/layouts/_default/taxonomy.html`, and `src/layouts/_default/term.html`:
  - [x] Archive header includes title and short description
  - [x] Search input shell is present with explicit blog-scope placeholder text
  - [x] Filter/sort shell is present in a server-rendered, crawl-safe form; no JavaScript-only filtering requirement is introduced
  - [x] Desktop layout exposes a left-rail filter treatment; mobile collapses controls into an accessible toggle or chip row
  - [x] Cards present metadata above excerpt to match the approved hierarchy
  - [x] Pagination remains visible and compatible with the existing paginator partial
  - [x] Jump-to-year control is present or intentionally documented as deferred with rationale
- [x] Traceability is explicit in the delivered implementation notes:
  - [x] Wireframe IDs in scope: `WF-HOME-D`, `WF-HOME-M`, `WF-ARCH-D`, `WF-ARCH-M`
  - [x] Annotation keys in scope: `NAV-01`, `HERO-01`, `DISC-01`, `DISC-02`, `DISC-03`, `PROJ-01`, `ARCH-01`, `ARCH-02`
  - [x] Checklist items in scope are mapped and closed: `CL-001` through `CL-005`, `CL-010` through `CL-016`, `CL-020` through `CL-026`, `CL-040`, `CL-041`, `CL-044`, `CL-060`, `CL-061`, `CL-070`, `CL-071`, `CL-072`
- [x] Existing Phase 3 quality gates still pass after the UI changes:
  - [x] `hugo --minify --environment production`
  - [x] `npm run check:seo`
  - [x] `npm run check:a11y`
  - [x] `npm run check:perf`
- [x] No delivered component introduces duplicated canonical, Open Graph, JSON-LD, or robots logic outside the existing SEO partial architecture

---

### Tasks

- [x] Reconcile the design brief, low-fi wireframes, and UI implementation checklist against the scaffold paths shipped by RHI-023
- [x] Extract site header and footer markup from `src/layouts/_default/baseof.html` into reusable partials while preserving skip-link, landmark, and SEO behavior
- [x] Create shared content-list UI primitives:
  - [x] article-card partial
  - [x] metadata-row partial
  - [x] empty-state partial or equivalent shared pattern
- [x] Refactor `src/layouts/home.html` to support:
  - [x] Hero with dual CTA
  - [x] Featured content lane
  - [x] Recent posts lane
  - [x] Topic-hub lane
  - [x] Optional project rail slot with graceful omission when no data source exists
- [x] Refactor `src/layouts/_default/list.html`, `taxonomy.html`, and `term.html` to support:
  - [x] Search shell
  - [x] Filter/sort shell
  - [x] Metadata-first cards
  - [x] Jump-to-year affordance
  - [x] Mobile collapse behavior for list discovery controls
- [x] Verify that all new interactive controls are keyboard reachable and visibly focused
- [x] Verify that empty or low-content states remain coherent on the scaffold and on future migration batches
- [x] Update ticket outcomes and related Phase 3 documentation with the actual files delivered and any deferred checklist items

---

### Out of Scope

- Functional site-search backend or search-index implementation
- Client-side faceted filtering that requires a new data or JavaScript layer
- Analytics-driven ranking, popularity weighting, or recommendation tuning
- Final visual art direction or post-launch polish beyond the approved Phase 3 structural UI scope
- Replacing the centralized SEO metadata architecture from RHI-023 and RHI-024

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-023 Done — Template scaffold exists and is the only allowed structural base | Ticket | Done |
| RHI-024 Done — Shared SEO partial architecture remains the source of truth | Ticket | Done |
| RHI-026 Done — Performance baseline exists for representative templates | Ticket | Done |
| RHI-027 Done — Accessibility baseline exists for representative templates | Ticket | Done |
| Approved design artifacts and UI checklist are available in `analysis/design/` and `analysis/documentation/checklists/` | Artifact | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| UI work duplicates SEO/layout behavior already delivered by RHI-023 | Medium | High | Keep SEO logic in `src/layouts/partials/seo/` and scope this ticket to shell and discovery UI only | Engineering Owner |
| Discovery lanes fail or look broken on an empty scaffold | High | Medium | Require explicit empty-state behavior for homepage and list views before sign-off | Engineering Owner |
| Filter controls imply unsupported dynamic search/filter behavior | Medium | Medium | Keep controls server-rendered and presentational unless a separate search/data ticket is approved | Engineering Owner |
| Project rail blocks completion because no stable data source exists | Medium | Low | Treat project rail as optional in this ticket and document omission criteria | Engineering Owner |
| New chrome regresses current accessibility or performance baselines | Medium | High | Keep existing Phase 3 gates mandatory for this ticket and re-run them on representative routes | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Implemented on 2026-03-09.

The Phase 3 scaffold now ships reusable site shell and archive/list primitives, a discovery-led homepage, metadata-first archive and topic surfaces, and explicit footer/legal destinations that preserve the scaffolded `/about/` and `/privacy-policy/` routes. The implementation keeps SEO ownership in `src/layouts/partials/seo/`, preserves skip-link and landmark behavior, and closes the checklist traceability gap documented when `RHI-104` was created.

Design review on 2026-03-10 confirmed that this ticket closed the structural discovery-surface contract but did not encode screenshot-level visual parity with the generated design examples. That follow-up scope is now tracked in `RHI-107` so this ticket remains an accurate record of the work that was actually delivered.

**Delivered artefacts:**

- `src/layouts/_default/baseof.html` updated to consume reusable shell partials and shared stylesheet output
- `src/layouts/home.html` updated with the hero, featured lane, recent lane, topic-hub lane, and documented project-rail omission
- `src/layouts/_default/list.html`, `taxonomy.html`, and `term.html` updated with archive descriptors, search/filter shells, metadata-first cards, and jump-to-year controls
- Shared UI partials delivered under `src/layouts/partials/site/`, `src/layouts/partials/cards/`, `src/layouts/partials/article/`, `src/layouts/partials/archive/`, and `src/layouts/partials/search/`
- `src/static/styles/site.css` added for the Phase 3 responsive shell and contrast/focus baseline
- `src/content/pages/about/index.md` and `src/content/pages/privacy-policy/index.md` added so the shell can expose real about/contact/legal destinations on the scaffold
- `analysis/documentation/phase-3/rhi-104-discovery-surfaces-shared-ui-components-2026-03-09.md` added with wireframe, annotation-key, and checklist traceability

**Deviations from plan:**

- The optional project rail (`PROJ-01`) remains intentionally omitted because the repository still has no stable project dataset under `src/data/`. This omission is documented in the homepage summary and the Phase 3 implementation note rather than being simulated with placeholder data.
- High-fidelity screenshot alignment for homepage, archive, taxonomy, and shared shell was not part of this ticket's executable acceptance criteria; that visual-parity work now has explicit ownership in `RHI-107`.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-09 | Open | Ticket created to close the design-to-template traceability gap for homepage, archive, taxonomy, and shared discovery UI. |
| 2026-03-09 | Done | Extracted the shared site shell, implemented discovery-led home/archive/category surfaces, added scaffolded about/privacy destinations, and passed `hugo --minify --environment production`, `npm run check:seo`, `npm run check:a11y`, and `npm run check:perf`. |
| 2026-03-10 | Done | Screenshot review clarified that `RHI-104` completed structural UI scope only; screenshot-level visual alignment was split into `RHI-107` rather than retroactively redefining this ticket. |

---

### Notes

- The implementation checklist proposed `src/layouts/index.html`, but the scaffold delivered by RHI-023 uses `src/layouts/home.html`. This ticket must follow the shipped scaffold, not revert to the earlier proposal.
- Preserve the current empty-state and low-content tolerance already present in the scaffold.
- Search input and filters in this ticket are UI surfaces only. A real search system or dynamic faceting is separate scope.
- Generated screenshot parity for the homepage and archive is tracked separately in `RHI-107`; this ticket should not be reopened to pretend that visual acceptance was originally explicit when it was not.
