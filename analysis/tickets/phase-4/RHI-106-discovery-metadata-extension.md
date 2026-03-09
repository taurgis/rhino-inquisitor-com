## RHI-106 · Workstream L — Discovery Metadata Extension and Enrichment

**Status:** Open  
**Priority:** High  
**Estimate:** M  
**Phase:** 4  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-15  
**Created:** 2026-03-09  
**Updated:** 2026-03-09

---

### Goal

Extend the migrated-content metadata contract so the Phase 3 UI implementation can render richer discovery and readability patterns without inventing ad hoc per-template fallbacks. This ticket does not replace the Phase 2 front matter contract; it adds a controlled, optional discovery-metadata layer under Hugo `params` for fields that are presentation- and curation-oriented rather than routing-critical.

The extension exists to support the approved design brief and UI tickets while preserving the existing hard requirements around `title`, `description`, `date`, `lastmod`, `categories`, `tags`, `url`, `aliases`, and `draft`.

---

### Acceptance Criteria

- [ ] Discovery metadata extension is documented as an additive contract layered on top of the Phase 2 front matter contract:
  - [ ] Reserved Hugo top-level fields remain unchanged
  - [ ] New custom discovery fields live under `params`
  - [ ] The documented field set includes:
    - [ ] `params.primaryTopic` (optional string)
    - [ ] `params.secondaryTopics` (optional string array)
    - [ ] `params.contentType` (optional enum: `article`, `video`, `external`, `podcast`)
    - [ ] `params.difficulty` (optional enum: `beginner`, `intermediate`, `advanced`)
    - [ ] `params.series` (optional object or string contract, documented explicitly)
    - [ ] `params.summary` (optional string array for article takeaway bullets)
    - [ ] `params.relatedContent` (optional curated override structure)
    - [ ] `params.featuredHome` (optional boolean or equivalent documented homepage-curation flag)
- [ ] Fields that Hugo can derive already are explicitly not duplicated in authored front matter unless a later ticket overrides that rule:
  - [ ] Reading time uses Hugo-derived output
  - [ ] Update status continues to derive from existing `date` and `lastmod` semantics
- [ ] Validation and authoring surfaces are updated for the new contract:
  - [ ] `scripts/validate-frontmatter.js` accepts and validates the new `params` fields when present
  - [ ] `src/archetypes/` includes commented examples or defaults for the new discovery fields
  - [ ] Validation remains backward compatible for content that omits all optional discovery fields
- [ ] Migration mapping is updated so the extension is usable in real content batches:
  - [ ] `scripts/migration/map-frontmatter.js` preserves approved discovery fields when source data or mapping rules supply them
  - [ ] The mapping script does not fail launch-intended content solely because optional discovery fields are absent
  - [ ] Coverage or exception reporting exists for discovery metadata so missing enrichment is visible rather than silent
- [ ] Downstream dependencies are explicit:
  - [ ] RHI-035 depends on this ticket before final mapping behavior is considered complete
  - [ ] Pilot-batch review criteria reference the new optional metadata where present
  - [ ] The UI tickets can rely on documented fallback behavior when enrichment is missing

---

### Tasks

- [ ] Define the extension schema for discovery/readability fields and document which values are required, optional, derived, or curated
- [ ] Document the contract location and examples for all new `params` fields
- [ ] Update `scripts/validate-frontmatter.js` to validate the optional field shapes and enum values without breaking existing content
- [ ] Update `src/archetypes/` to show how discovery metadata should be authored when available
- [ ] Update `scripts/migration/map-frontmatter.js` so approved discovery fields are preserved when extraction or curation supplies them
- [ ] Add or update coverage reporting so pilot and high-value batches can see which records are enriched versus using fallback behavior
- [ ] Update downstream ticket references where Phase 4 mapping and review workflows depend on the extension

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
| RHI-012 Done — Base content-model and front matter contract exists | Ticket | Pending |
| RHI-031 Done — Phase 4 bootstrap and pipeline environment are ready | Ticket | Pending |
| RHI-033 Done — Normalized records exist and can carry enrichment data | Ticket | Pending |
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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- Discovery metadata contract extension documentation
- `scripts/validate-frontmatter.js` updated for optional `params` discovery fields
- `src/archetypes/` updated with discovery-field examples
- `scripts/migration/map-frontmatter.js` updated to preserve approved discovery metadata when available
- Coverage or exception reporting for discovery metadata enrichment

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-09 | Open | Ticket created to add a controlled discovery-metadata layer before front matter mapping and pilot-batch review lock in the narrower Phase 2 contract. |

---

### Notes

- This ticket extends the content contract without reopening Phase 2 decisions about required top-level fields.
- The extension exists to support UI behavior, curation, and readability patterns; it must not silently alter routing or canonical logic.
- Reading time and updated status remain derived unless a later approved ticket changes that rule.
