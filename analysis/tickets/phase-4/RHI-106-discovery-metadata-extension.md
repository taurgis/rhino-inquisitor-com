## RHI-106 · Workstream L — Discovery Metadata Extension and Enrichment

**Status:** Done  
**Priority:** High  
**Estimate:** M  
**Phase:** 4  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-15  
**Created:** 2026-03-09  
**Updated:** 2026-03-10

---

### Goal

Extend the migrated-content metadata contract so the Phase 3 UI implementation can render richer discovery and readability patterns without inventing ad hoc per-template fallbacks. This ticket does not replace the Phase 2 front matter contract; it adds a controlled, optional discovery-metadata layer under Hugo `params` for fields that are presentation- and curation-oriented rather than routing-critical.

The extension exists to support the approved design brief and UI tickets while preserving the existing hard requirements around `title`, `description`, `date`, `lastmod`, `categories`, `tags`, `url`, `aliases`, and `draft`.

---

### Acceptance Criteria

- [x] Discovery metadata extension is documented as an additive contract layered on top of the Phase 2 front matter contract:
  - [x] Reserved Hugo top-level fields remain unchanged
  - [x] New custom discovery fields live under `params`
  - [x] The documented field set includes:
    - [x] `params.primaryTopic` (optional string)
    - [x] `params.secondaryTopics` (optional string array)
    - [x] `params.contentType` (optional enum: `article`, `video`, `external`, `podcast`)
    - [x] `params.difficulty` (optional enum: `beginner`, `intermediate`, `advanced`)
    - [x] `params.series` (optional object contract with `id`, `title`, optional `position`, optional `total`, optional `landingPage`)
    - [x] `params.summary` (optional string array for article takeaway bullets)
    - [x] `params.relatedContent` (optional curated override structure with `nextInTopic`, `adjacentTopic`, and `foundational` object-list buckets)
    - [x] `params.featuredHome` (optional boolean or equivalent documented homepage-curation flag)
- [x] Fields that Hugo can derive already are explicitly not duplicated in authored front matter unless a later ticket overrides that rule:
  - [x] Reading time uses Hugo-derived output
  - [x] Update status continues to derive from existing `date` and `lastmod` semantics
- [x] Validation and authoring surfaces are updated for the new contract:
  - [x] `scripts/validate-frontmatter.js` accepts and validates the new `params` fields when present
  - [x] `src/archetypes/` includes commented examples or defaults for the new discovery fields
  - [x] Validation remains backward compatible for content that omits all optional discovery fields
- [x] Migration mapping is updated so the extension is usable in real content batches:
  - [x] `scripts/migration/map-frontmatter.js` preserves approved discovery fields when source data or mapping rules supply them
  - [x] The mapping script does not fail launch-intended content solely because optional discovery fields are absent
  - [x] Coverage or exception reporting exists for discovery metadata so missing enrichment is visible rather than silent
- [x] Downstream dependencies are explicit:
  - [x] RHI-035 depends on this ticket before final mapping behavior is considered complete
  - [x] Pilot-batch review criteria reference the new optional metadata where present
  - [x] The UI tickets can rely on documented fallback behavior when enrichment is missing

---

### Tasks

- [x] Define the extension schema for discovery/readability fields and document which values are required, optional, derived, or curated
- [x] Document the contract location and examples for all new `params` fields
- [x] Update `scripts/validate-frontmatter.js` to validate the optional field shapes and enum values without breaking existing content
- [x] Update `src/archetypes/` to show how discovery metadata should be authored when available
- [x] Update `scripts/migration/map-frontmatter.js` so approved discovery fields are preserved when extraction or curation supplies them
- [x] Add or update coverage reporting so pilot and high-value batches can see which records are enriched versus using fallback behavior
- [x] Update downstream ticket references where Phase 4 mapping and review workflows depend on the extension

---

### Out of Scope

- Making all new discovery fields mandatory for every migrated record
- Replacing taxonomy or routing contracts already established in Phase 2
- Implementing a search backend or recommendation engine
- Creating bespoke authored reading-time values when Hugo-derived reading time is sufficient
- Reopening SEO partial architecture or canonical logic from Phase 3

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-012 Done — Base content-model and front matter contract exists | Ticket | Done |
| RHI-031 Done — Phase 4 bootstrap and pipeline environment are ready | Ticket | Done |
| RHI-033 Done — Normalized records exist and can carry enrichment data | Ticket | Done |
| Approved design artifacts and UI checklist identify the discovery/readability fields that need support | Artifact | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Custom discovery fields are added as top-level front matter instead of under `params` | Medium | High | Document the contract clearly and enforce it in validation rules | Engineering Owner |
| Optional enrichment fields become accidental migration blockers | High | High | Keep the new fields optional unless explicitly elevated later and require graceful UI fallbacks | Engineering Owner |
| Source exports do not contain enough information to populate the new fields consistently | High | Medium | Preserve what exists, report gaps, and avoid blocking batches on non-critical enrichment | Engineering Owner |
| `series` or `relatedContent` structures drift across content authors and scripts | Medium | Medium | Lock the structure in the contract and validate shape rather than allowing free-form data | Engineering Owner |
| Reading time or update status are duplicated in front matter and drift from Hugo-derived values | Medium | Medium | Document that those values remain derived and keep them out of the extension contract | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Completed. RHI-106 now defines and enforces the optional discovery/readability metadata layer under `params` without changing the Phase 2 required top-level front matter contract.

Approved contract highlights:

- Discovery fields must live under `params`; top-level `title`, `description`, `date`, `lastmod`, `categories`, `tags`, `url`, `aliases`, and `draft` remain unchanged.
- `params.series` is object-only with `id`, `title`, optional `position`, optional `total`, and optional `landingPage`.
- `params.relatedContent` is a curated object with optional `nextInTopic`, `adjacentTopic`, and `foundational` buckets. Each bucket item is an object with required `path` and optional `title` and `description`.
- `params.summary` is the canonical summary-bullet field for article takeaways.
- Reading time and update status remain derived and are rejected when authored under `params`.

Implementation outcomes:

- `scripts/migration/schemas/discovery-metadata.schema.js` now defines the approved optional discovery field schema shared by validation and mapping.
- `scripts/validate-frontmatter.js` now validates the discovery metadata contract, rejects misplaced top-level discovery fields, rejects authored derived fields, and accepts the homepage route `/`.
- `src/archetypes/posts.md`, `src/archetypes/pages.md`, `src/archetypes/default.md`, and `src/archetypes/categories.md` now include commented discovery metadata examples.
- `scripts/migration/map-frontmatter.js` now provides the front matter mapping entry point with optional `migration/input/discovery-metadata.json` curation support and coverage reporting for enriched versus fallback records.
- `src/layouts/partials/article/summary-box.html` now prefers `params.summary` with legacy `params.takeaways` fallback.
- `src/layouts/partials/article/related-content.html` now accepts the canonical object-list related-content contract while preserving compatibility with legacy string entries.
- `analysis/documentation/phase-4/rhi-106-discovery-metadata-contract-2026-03-10.md` records the contract, behavior change, and validation path.
- `analysis/tickets/phase-4/RHI-043-pilot-batch-migration.md` now requires manual review of optional discovery metadata where present.

Validation summary:

- `npm run validate:frontmatter` passed on the authored content set.
- `npm run migrate:map-frontmatter -- --content-dir <tmp> --error-report <tmp> --coverage-report <tmp>` completed successfully and mapped 171 keep/merge records while reporting 0 enriched records in the current data set.
- `hugo --minify --environment production` passed after the article partial updates.
- Generated-content alias validation remains a downstream RHI-035 concern because the current manifest includes alias shapes that are not yet normalized for Hugo alias-page output.

**Delivered artefacts:**

- Discovery metadata contract extension documentation
- `scripts/validate-frontmatter.js` updated for optional `params` discovery fields
- `src/archetypes/` updated with discovery-field examples
- `scripts/migration/map-frontmatter.js` updated to preserve approved discovery metadata when available
- Coverage or exception reporting for discovery metadata enrichment
- Article partial compatibility updates for `params.summary` and curated `params.relatedContent`

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-09 | Open | Ticket created to add a controlled discovery-metadata layer before front matter mapping and pilot-batch review lock in the narrower Phase 2 contract. |
| 2026-03-10 | Done | Locked the `params` contract, added shared schema/validator support, added the front matter mapping entry point with coverage reporting, updated article partial compatibility, and documented pilot-review expectations. |

---

### Notes

- This ticket extends the content contract without reopening Phase 2 decisions about required top-level fields.
- The extension exists to support UI behavior, curation, and readability patterns; it must not silently alter routing or canonical logic.
- Reading time and updated status remain derived unless a later approved ticket changes that rule.
- The approved owner decisions for this ticket are: `params.series` uses the documented object contract and `params.relatedContent` uses object-list buckets keyed by `nextInTopic`, `adjacentTopic`, and `foundational`.
