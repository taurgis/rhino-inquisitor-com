## RHI-033 · Workstream B — Normalization and Canonical Record Model

**Status:** Done  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 4  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-14  
**Created:** 2026-03-07  
**Updated:** 2026-03-10

---

### Goal

Transform the heterogeneous raw extraction output into a single, machine-validated canonical record model that every downstream pipeline stage (WS-C conversion, WS-D front matter, WS-E URL, WS-F media) can rely on without defensive re-parsing. Every record must have a deterministic `targetUrl` decision before this ticket is closed. Records without a resolvable `targetUrl` are a migration blocker and must be escalated, not silently defaulted.

This ticket is the schema foundation for all transformation workstreams. WS-C and WS-D cannot produce correct output without a validated canonical record set.

---

### Acceptance Criteria

- [x] Canonical record schema is defined using `zod` in `scripts/migration/schemas/record.schema.js` with required fields:
  - [x] `sourceId` — unique WordPress post ID
  - [x] `sourceType` — primary extraction channel: `wxr`, `rest`, `sql`, `filesystem`, or `fallback`
  - [x] `sourceChannels` — array of contributing source channels used for the record
  - [x] `postType` — `post`, `page`, `attachment`, `video`, or custom
  - [x] `status` — `publish`, `draft`, `private`, `trash`
  - [x] `titleRaw` — original unmodified title string
  - [x] `excerptRaw` — original excerpt or empty string
  - [x] `bodyHtml` — raw HTML body (CDATA-decoded)
  - [x] `slug` — WordPress slug
  - [x] `publishedAt` — ISO 8601 UTC timestamp
  - [x] `modifiedAt` — ISO 8601 UTC timestamp
  - [x] `author` — author display name or identifier
  - [x] `categories` — array of `{name, slug}` objects
  - [x] `tags` — array of `{name, slug}` objects
  - [x] `legacyUrl` — original WordPress permalink (absolute path)
  - [x] `targetUrl` — final Hugo URL path from manifest (non-null for `keep`/`merge`)
  - [x] `disposition` — `keep`, `merge`, or `retire`
  - [x] `aliasUrls` — array of legacy paths that should redirect to `targetUrl`
  - [x] `mediaRefs` — array of absolute media URLs referenced in body
- [x] Normalization script `scripts/migration/normalize.js` exists and:
  - [x] Consumes `migration/intermediate/extract-summary.json` and raw extraction data
  - [x] Joins each manifest-backed record with its `targetUrl` and `disposition` from `migration/url-manifest.json`
  - [x] Normalizes dates to ISO 8601 UTC
  - [x] Normalizes taxonomy name/slug casing per URL invariant policy from RHI-003
  - [x] Resolves HTML entity encoding and strips BOM/invalid UTF-8 sequences safely
  - [x] Preserves `sourceChannels` and source-traceability data needed for downstream audit reporting
  - [x] Preserves raw source fields under a `_raw` namespace for traceability
  - [x] Is idempotent across runs
  - [x] Exits with a non-zero code and actionable errors if schema validation fails
- [x] `migration/intermediate/records.normalized.json` is produced and:
  - [x] Validates against `record.schema.js` with zero schema errors
  - [x] Achieves 100% `targetUrl` coverage for the owner-approved `source-backed-content-only` in-scope `keep` and `merge` records
  - [x] Records with `disposition: retire` have `targetUrl: null` explicitly (not omitted)
- [x] Any records failing normalization are written to `migration/intermediate/normalize-errors.json` with error type and field context; out-of-scope extracted records without a manifest row are reported in `normalize-summary.json` and not silently dropped
- [x] Script is referenced in `package.json` as `npm run migrate:normalize`

---

### Tasks

- [x] Define canonical record schema in `scripts/migration/schemas/record.schema.js` using `zod`:
  - [x] Define each required field with type constraints and `.describe()` annotations
  - [x] Define `aliasUrls` and `mediaRefs` as arrays with URL path validation
  - [x] Export schema as both Zod schema and inferred TypeScript/JSDoc type
- [x] Create `scripts/migration/normalize.js`:
  - [x] Load raw extraction output from `migration/intermediate/`
  - [x] Load `migration/url-manifest.json` and index by `legacy_url`
  - [x] For each extracted record:
    - [x] Map manifest-backed `legacyUrl` values to `targetUrl` and `disposition`
    - [x] Report records with no manifest match in `normalize-summary.json -> normalizationNotes.skippedWithoutManifest` so they are audit-visible and not silently defaulted
    - [x] Normalize `publishedAt` and `modifiedAt` to ISO 8601 (handle WP format variants)
    - [x] Normalize taxonomy slugs per RHI-003 policy
    - [x] Decode HTML entities in title and excerpt
    - [x] Derive `aliasUrls` from manifest rows that share the same `target_url`
    - [x] Extract `mediaRefs` from `bodyHtml` `src` attributes plus `srcset` candidates using `cheerio`
  - [x] Validate each record against Zod schema; write failures to error log
  - [x] Write passing records to `migration/intermediate/records.normalized.json`
  - [x] Write normalization summary (total, success, skipped, errors) to `migration/intermediate/normalize-summary.json`
- [x] Run normalization and review outputs:
  - [x] Confirm 100% `targetUrl` coverage for in-scope `keep` and `merge` records
  - [x] Review and resolve all entries in `migration/intermediate/normalize-errors.json`
  - [x] Capture the out-of-scope unmatched extracted records in the normalization summary before WS-C begins
- [x] Add `"migrate:normalize": "node scripts/migration/normalize.js"` to `package.json`
- [x] Commit schema, normalization script, and output artifacts
- [x] Document normalization decisions and any exceptions in `docs/migration/RUNBOOK.md`

---

### Out of Scope

- Converting `bodyHtml` to Markdown (Workstream C — RHI-034)
- Generating Hugo front matter YAML (Workstream D — RHI-035)
- URL parity validation (Workstream E — RHI-036)
- Media download (Workstream F — RHI-037)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-031 Done — Phase 4 Bootstrap complete | Ticket | Done |
| RHI-032 Done — Extraction complete; `migration/intermediate/` populated | Ticket | Done |
| `migration/url-manifest.json` with 100% disposition coverage from RHI-004 | Ticket | Done |
| `migration/url-inventory.normalized.json` with URL invariant policies from RHI-003 | Ticket | Done |
| `zod` and `cheerio` installed | Tool | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Records present in extraction but absent from URL manifest (discovery-only or stub pages) | Medium | High | Flag as normalization errors; resolve by either adding to manifest or marking as `retire` before WS-C | Migration Owner |
| WordPress date format variants (GMT vs local time, missing timezone) | Medium | Medium | Test date normalization on 10 sample records before full run; default to UTC with a documented assumption | Engineering Owner |
| Taxonomy slugs in WordPress differ from URL inventory policy (case or encoding) | Medium | Medium | Apply RHI-003 casing policy during normalization; log all slug transformations for audit | Engineering Owner |
| `records.normalized.json` too large for single JSON parse in downstream scripts | Low | Medium | If >50 MB, switch downstream consumers to streaming JSON (e.g., `stream-json`); document in RUNBOOK | Engineering Owner |
| HTML entities in titles create invalid characters in normalized output | Low | Medium | Test entity decoding on titles containing `&amp;`, `&nbsp;`, and named entities before full run | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Final outcomes:

- Canonical schema implemented in `scripts/migration/schemas/record.schema.js` with Zod-enforced path, URL, and disposition rules.
- Deterministic normalization pipeline implemented in `scripts/migration/normalize.js` and exposed via `npm run migrate:normalize`.
- Validated normalization artifacts committed under `migration/intermediate/`.
- Owner-approved normalization clarifications recorded in the runbook and Phase 4 implementation documentation.
- Required coverage validated for the `source-backed-content-only` denominator inherited from RHI-032: 192 required manifest-backed `keep` or `merge` records normalized successfully with zero schema errors.

**Delivered artefacts:**

- `scripts/migration/schemas/record.schema.js`
- `scripts/migration/normalize.js`
- `migration/intermediate/records.normalized.json`
- `migration/intermediate/normalize-summary.json`
- `migration/intermediate/normalize-errors.json` (empty for release candidate run)
- `package.json` updated with `migrate:normalize` script
- `docs/migration/RUNBOOK.md`
- `analysis/documentation/phase-4/rhi-033-normalization-implementation-2026-03-10.md`

**Deviations from plan:**

- `aliasUrls` are derived from manifest rows that share the same `target_url`; the manifest does not currently carry an explicit `aliases` field.
- Extracted records without a manifest row are reported in `normalize-summary.json -> normalizationNotes.skippedWithoutManifest` instead of `normalize-errors.json` because the owner-approved required scope remains `source-backed-content-only`.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-10 | Done | Implemented the canonical record schema and deterministic normalization pipeline; validated 192/192 required manifest-backed `keep`/`merge` records with zero schema errors and recorded 616 out-of-scope extracted records as skipped audit items. |

---

### Notes

- The canonical record model is the contract between the extraction layer and all transformation workstreams. Any field added or renamed here will require updates to WS-C, WS-D, WS-E, and WS-F.
- Normalization must remain channel-agnostic: once WS-A has merged WXR, REST, SQL, and filesystem recovery data into the extraction output, downstream workstreams should not need source-specific parsing logic.
- `aliasUrls` remain manifest-governed. Until the manifest gains an explicit aliases field, derive alias paths only from other manifest rows that share the same `target_url`.
- The Zod schema is the single source of truth for the record model. Keep it co-located with the scripts and document it in the RUNBOOK so future contributors know where the schema lives.
- Reference: `analysis/plan/details/phase-4.md` §Workstream B: Normalization and Canonical Record Model
