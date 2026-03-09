# Design Traceability Ticket Extension

Date: 2026-03-09
Scope: Phase 3 and Phase 4 ticketing update to make approved design artifacts executable and traceable.

## Change summary

Added three new implementation tickets to connect the approved design brief, wireframes, and UI checklist to the execution backlog:

- `RHI-104` for homepage, archive, taxonomy, and shared discovery UI
- `RHI-105` for article readability and contextual navigation UI
- `RHI-106` for Phase 4 discovery-metadata extension and enrichment

## Why this changed

The repository already contained design artifacts under `analysis/design/` and an implementation checklist under `analysis/documentation/checklists/`, but those artefacts were not fully mapped to executable tickets. Phase 3 had shipped scaffold templates and baseline quality gates, yet the approved UI direction and discovery/readability metadata model still lacked explicit work ownership.

## Behavior details

### Old behavior

- Phase 3 owned scaffold templates, accessibility/performance baselines, and SEO foundations.
- The design brief and wireframes existed as analysis-only guidance.
- Phase 4 front matter mapping was limited to the Phase 2 minimum contract.

### New behavior

- Phase 3 now has explicit tickets for shared discovery UI and article readability UI.
- Phase 4 now has an explicit metadata-extension ticket for optional discovery/readability fields under `params`.
- Phase 3 sign-off and Phase 4 front matter mapping now reference the new tickets so the design work is part of the tracked execution path rather than implied future scope.
- The UI implementation checklist now uses shipped scaffold anchors and explicit ticket ownership instead of older proposed component paths.
- The Phase 3 and Phase 4 detail plans now mention the new design-traceability workstreams so the ticket additions are visible outside the phase indexes.
- The Phase 5 detail plan and the master migration plan now explicitly consume `RHI-104`, `RHI-105`, and `RHI-106` so downstream SEO/discoverability work treats those tickets as prerequisites rather than implied scope.

## Impact

- **Maintainers:** can now trace homepage, archive, article, and discovery-metadata requirements directly to ticket IDs.
- **Phase 3 workflow:** sign-off now includes the two new UI tickets.
- **Phase 4 workflow:** front matter mapping and pilot-batch review now depend on the discovery-metadata extension.
- **Design traceability:** checklist item ownership is now split across the shared discovery surfaces ticket, the article readability ticket, and the metadata-extension ticket.

## Verification

Verify this ticketing update by confirming:

1. `analysis/tickets/phase-3/INDEX.md` lists `RHI-104` and `RHI-105`, updates the dependency graph, and includes both tickets in the Phase 3 Definition of Done.
2. `analysis/tickets/phase-4/INDEX.md` lists `RHI-106`, updates the dependency graph, and includes it in the Phase 4 Definition of Done.
3. `analysis/tickets/phase-3/RHI-030-phase-3-signoff.md` now requires `RHI-104` and `RHI-105` for sign-off.
4. `analysis/tickets/phase-4/RHI-035-front-matter-mapping.md` now references the discovery-metadata extension before final mapping behavior is considered complete.
5. `analysis/documentation/checklists/ui-implementation-checklist-2026-03-08.md` now references `src/layouts/home.html`, shipped scaffold anchors, and ticket ownership for `RHI-104`, `RHI-105`, and `RHI-106`.
6. `analysis/plan/details/phase-3.md` and `analysis/plan/details/phase-4.md` now include short workstream notes for the new design-traceability tickets.
7. `analysis/plan/details/phase-5.md` and `analysis/main-plan.MD` now explicitly consume `RHI-104`, `RHI-105`, and `RHI-106` as downstream planning inputs.

## Related files

- `analysis/tickets/INDEX.md`
- `analysis/tickets/phase-3/INDEX.md`
- `analysis/tickets/phase-3/RHI-030-phase-3-signoff.md`
- `analysis/tickets/phase-3/RHI-104-discovery-surfaces-shared-ui-components.md`
- `analysis/tickets/phase-3/RHI-105-article-readability-contextual-navigation.md`
- `analysis/tickets/phase-4/INDEX.md`
- `analysis/tickets/phase-4/RHI-035-front-matter-mapping.md`
- `analysis/tickets/phase-4/RHI-106-discovery-metadata-extension.md`
- `analysis/plan/details/phase-3.md`
- `analysis/plan/details/phase-4.md`
- `analysis/plan/details/phase-5.md`
- `analysis/main-plan.MD`
- `analysis/design/blog-modernization-designs-2026-03-08.md`
- `analysis/design/low-fi-wireframes-2026-03-08.md`
- `analysis/documentation/checklists/ui-implementation-checklist-2026-03-08.md`