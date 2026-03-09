# RHI-107 Design Example Fidelity - 2026-03-10

## Change summary

Documented the generated design-example screenshots as the binding visual references for Phase 3 discovery surfaces, split screenshot-level homepage/archive/shared-shell parity into a new ticket (`RHI-107`), and expanded `RHI-105` so article implementation must also follow the approved article screenshots.

## Why this changed

`RHI-104` correctly delivered the structural Phase 3 discovery surfaces, but the approved generated screenshots were never translated into executable ticket acceptance criteria. That created a gap between the implemented scaffold and the intended high-fidelity visual direction. The ticketing and checklist updates in this change separate structural completion from screenshot-level visual completion so future work can close the actual design gap without rewriting history.

## Behavior details

### Old behavior

- `RHI-104` was the only ticket owning homepage/archive/shared UI, even though its acceptance criteria described structural behavior more clearly than screenshot-level styling.
- `RHI-105` described article structure and usability patterns but did not explicitly require parity with the generated article design examples.
- The UI checklist pointed to the wireframes and implementation paths, but it did not distinguish structural acceptance from visual acceptance.

### New behavior

- `RHI-104` remains the structural-delivery record for shared discovery surfaces and now explicitly points screenshot-parity work to `RHI-107`.
- `RHI-107` now owns homepage, archive, taxonomy, and shared-shell alignment to the approved generated screenshots under `analysis/design/generated-images/design-examples/`.
- `RHI-105` now explicitly owns article screenshot-level visual parity in addition to the article structural modules it already owned.
- The UI checklist now distinguishes low-fi wireframes as the structural source of truth and generated design examples as the visual source of truth.
- Phase 3 sign-off and indexes now treat screenshot-level visual parity as tracked implementation scope rather than an implied nice-to-have.

## Impact

- **Maintainers:** can tell whether a ticket delivered structure, final visual treatment, or both.
- **Phase 3 workflow:** sign-off now has a ticketed path for the screenshot mismatch the current implementation still shows.
- **Design traceability:** generated screenshots are now actionable references with explicit ticket ownership instead of passive assets in `analysis/design/`.

## Verification

Verify this ticketing and documentation update by confirming:

1. `analysis/tickets/phase-3/RHI-104-discovery-surfaces-shared-ui-components.md` states that structural scope is done and points screenshot-level homepage/archive/shared-shell alignment to `RHI-107`.
2. `analysis/tickets/phase-3/RHI-105-article-readability-contextual-navigation.md` explicitly references the generated article screenshots in its acceptance criteria.
3. `analysis/tickets/phase-3/RHI-107-design-example-visual-alignment.md` exists and owns homepage/archive/shared-shell screenshot fidelity.
4. `analysis/documentation/checklists/ui-implementation-checklist-2026-03-08.md` separates structural and visual contracts and includes `RHI-107` ownership.
5. `analysis/tickets/phase-3/INDEX.md`, `analysis/tickets/phase-3/RHI-030-phase-3-signoff.md`, and `analysis/tickets/INDEX.md` include `RHI-107` in the Phase 3 planning and sign-off path.

## Related files

- `analysis/design/generated-images/design-examples/README.md`
- `analysis/tickets/phase-3/RHI-104-discovery-surfaces-shared-ui-components.md`
- `analysis/tickets/phase-3/RHI-105-article-readability-contextual-navigation.md`
- `analysis/tickets/phase-3/RHI-107-design-example-visual-alignment.md`
- `analysis/tickets/phase-3/INDEX.md`
- `analysis/tickets/phase-3/RHI-030-phase-3-signoff.md`
- `analysis/tickets/INDEX.md`
- `analysis/documentation/checklists/ui-implementation-checklist-2026-03-08.md`

## Assumptions and bounds

- The generated design examples are treated as approved references for visual parity, not merely inspirational prompts.
- Sample copy, counts, and placeholder imagery in those screenshots are not automatically binding content requirements.
- This documentation update records ticket ownership and acceptance scope only; it does not claim the implementation is already visually aligned.