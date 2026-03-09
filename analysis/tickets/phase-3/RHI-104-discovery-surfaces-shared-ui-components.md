## RHI-104 · Workstream K — Discovery Surfaces and Shared UI Components

**Status:** Open  
**Priority:** High  
**Estimate:** L  
**Phase:** 3  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-05  
**Created:** 2026-03-09  
**Updated:** 2026-03-09

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

- [ ] Shared UI partials exist for the scaffold paths actually used in this repo and do not duplicate SEO logic owned by `src/layouts/partials/seo/`:
  - [ ] Site header partial extracted from `src/layouts/_default/baseof.html`
  - [ ] Site footer partial extracted from `src/layouts/_default/baseof.html`
  - [ ] Reusable article-card partial for home/list/taxonomy views
  - [ ] Reusable metadata-row partial for date, reading time, topic, and update status presentation
  - [ ] Shared empty-state treatment for low-content scaffold states
- [ ] Homepage discovery experience is implemented in `src/layouts/home.html` using the current scaffold contract, not the earlier proposed `index.html` path:
  - [ ] Hero includes short intro copy plus two visible primary actions: Start Reading and Browse Topics
  - [ ] Featured lane, Recent lane, and Topic-hub lane render with stable empty states
  - [ ] Mobile stacking order follows the approved wireframe: Featured, Recent, Topics, optional Project rail
  - [ ] Topic lane can render counts or freshness hints without requiring JavaScript
- [ ] Archive and taxonomy listing experience is implemented across `src/layouts/_default/list.html`, `src/layouts/_default/taxonomy.html`, and `src/layouts/_default/term.html`:
  - [ ] Archive header includes title and short description
  - [ ] Search input shell is present with explicit blog-scope placeholder text
  - [ ] Filter/sort shell is present in a server-rendered, crawl-safe form; no JavaScript-only filtering requirement is introduced
  - [ ] Desktop layout exposes a left-rail filter treatment; mobile collapses controls into an accessible toggle or chip row
  - [ ] Cards present metadata above excerpt to match the approved hierarchy
  - [ ] Pagination remains visible and compatible with the existing paginator partial
  - [ ] Jump-to-year control is present or intentionally documented as deferred with rationale
- [ ] Traceability is explicit in the delivered implementation notes:
  - [ ] Wireframe IDs in scope: `WF-HOME-D`, `WF-HOME-M`, `WF-ARCH-D`, `WF-ARCH-M`
  - [ ] Annotation keys in scope: `NAV-01`, `HERO-01`, `DISC-01`, `DISC-02`, `DISC-03`, `PROJ-01`, `ARCH-01`, `ARCH-02`
  - [ ] Checklist items in scope are mapped and closed: `CL-001` through `CL-005`, `CL-010` through `CL-016`, `CL-020` through `CL-026`, `CL-040`, `CL-041`, `CL-044`, `CL-060`, `CL-061`, `CL-070`, `CL-071`, `CL-072`
- [ ] Existing Phase 3 quality gates still pass after the UI changes:
  - [ ] `hugo --minify --environment production`
  - [ ] `npm run check:seo`
  - [ ] `npm run check:a11y`
  - [ ] `npm run check:perf`
- [ ] No delivered component introduces duplicated canonical, Open Graph, JSON-LD, or robots logic outside the existing SEO partial architecture

---

### Tasks

- [ ] Reconcile the design brief, low-fi wireframes, and UI implementation checklist against the scaffold paths shipped by RHI-023
- [ ] Extract site header and footer markup from `src/layouts/_default/baseof.html` into reusable partials while preserving skip-link, landmark, and SEO behavior
- [ ] Create shared content-list UI primitives:
  - [ ] article-card partial
  - [ ] metadata-row partial
  - [ ] empty-state partial or equivalent shared pattern
- [ ] Refactor `src/layouts/home.html` to support:
  - [ ] Hero with dual CTA
  - [ ] Featured content lane
  - [ ] Recent posts lane
  - [ ] Topic-hub lane
  - [ ] Optional project rail slot with graceful omission when no data source exists
- [ ] Refactor `src/layouts/_default/list.html`, `taxonomy.html`, and `term.html` to support:
  - [ ] Search shell
  - [ ] Filter/sort shell
  - [ ] Metadata-first cards
  - [ ] Jump-to-year affordance
  - [ ] Mobile collapse behavior for list discovery controls
- [ ] Verify that all new interactive controls are keyboard reachable and visibly focused
- [ ] Verify that empty or low-content states remain coherent on the scaffold and on future migration batches
- [ ] Update ticket outcomes and related Phase 3 documentation with the actual files delivered and any deferred checklist items

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
| RHI-023 Done — Template scaffold exists and is the only allowed structural base | Ticket | Pending |
| RHI-024 Done — Shared SEO partial architecture remains the source of truth | Ticket | Pending |
| RHI-026 Done — Performance baseline exists for representative templates | Ticket | Pending |
| RHI-027 Done — Accessibility baseline exists for representative templates | Ticket | Pending |
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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- `src/layouts/_default/baseof.html` updated to consume reusable shell partials
- `src/layouts/home.html` updated with discovery lanes and hero actions
- `src/layouts/_default/list.html`, `taxonomy.html`, and `term.html` updated with archive discovery structure
- Shared UI partials for header, footer, cards, metadata row, and empty states
- Phase 3 documentation update describing checklist coverage and any deferred UI items

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-09 | Open | Ticket created to close the design-to-template traceability gap for homepage, archive, taxonomy, and shared discovery UI. |

---

### Notes

- The implementation checklist proposed `src/layouts/index.html`, but the scaffold delivered by RHI-023 uses `src/layouts/home.html`. This ticket must follow the shipped scaffold, not revert to the earlier proposal.
- Preserve the current empty-state and low-content tolerance already present in the scaffold.
- Search input and filters in this ticket are UI surfaces only. A real search system or dynamic faceting is separate scope.
