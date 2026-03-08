## RHI-033 · Workstream B — Normalization and Canonical Record Model

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 4  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-14  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Transform the heterogeneous raw extraction output into a single, machine-validated canonical record model that every downstream pipeline stage (WS-C conversion, WS-D front matter, WS-E URL, WS-F media) can rely on without defensive re-parsing. Every record must have a deterministic `targetUrl` decision before this ticket is closed. Records without a resolvable `targetUrl` are a migration blocker and must be escalated, not silently defaulted.

This ticket is the schema foundation for all transformation workstreams. WS-C and WS-D cannot produce correct output without a validated canonical record set.

---

### Acceptance Criteria

- [ ] Canonical record schema is defined using `zod` in `scripts/migration/schemas/record.schema.js` with required fields:
  - [ ] `sourceId` — unique WordPress post ID
  - [ ] `sourceType` — `wxr`, `rest`, or `fallback`
  - [ ] `postType` — `post`, `page`, `attachment`, `video`, or custom
  - [ ] `status` — `publish`, `draft`, `private`, `trash`
  - [ ] `titleRaw` — original unmodified title string
  - [ ] `excerptRaw` — original excerpt or empty string
  - [ ] `bodyHtml` — raw HTML body (CDATA-decoded)
  - [ ] `slug` — WordPress slug
  - [ ] `publishedAt` — ISO 8601 UTC timestamp
  - [ ] `modifiedAt` — ISO 8601 UTC timestamp
  - [ ] `author` — author display name or identifier
  - [ ] `categories` — array of `{name, slug}` objects
  - [ ] `tags` — array of `{name, slug}` objects
  - [ ] `legacyUrl` — original WordPress permalink (absolute path)
  - [ ] `targetUrl` — final Hugo URL path from manifest (non-null for `keep`/`merge`)
  - [ ] `disposition` — `keep`, `merge`, or `retire`
  - [ ] `aliasUrls` — array of legacy paths that should redirect to `targetUrl`
  - [ ] `mediaRefs` — array of absolute media URLs referenced in body
- [ ] Normalization script `scripts/migration/normalize.js` exists and:
  - [ ] Consumes `migration/intermediate/extract-summary.json` and raw extraction data
  - [ ] Joins each record with its `targetUrl` and `disposition` from `migration/url-manifest.json`
  - [ ] Normalizes dates to ISO 8601 UTC
  - [ ] Normalizes taxonomy name/slug casing per URL invariant policy from RHI-003
  - [ ] Resolves HTML entity encoding and strips BOM/invalid UTF-8 sequences safely
  - [ ] Preserves raw source fields under a `_raw` namespace for traceability
  - [ ] Is idempotent across runs
  - [ ] Exits with a non-zero code and actionable errors if schema validation fails
- [ ] `migration/intermediate/records.normalized.json` is produced and:
  - [ ] Validates against `record.schema.js` with zero schema errors
  - [ ] Achieves 100% `targetUrl` coverage — every in-scope record has a non-null `targetUrl`
  - [ ] Records with `disposition: retire` have `targetUrl: null` explicitly (not omitted)
- [ ] Any records failing normalization are written to `migration/intermediate/normalize-errors.json` with error type and field context; none are silently dropped
- [ ] Script is referenced in `package.json` as `npm run migrate:normalize`

---

### Tasks

- [ ] Define canonical record schema in `scripts/migration/schemas/record.schema.js` using `zod`:
  - [ ] Define each required field with type constraints and `.describe()` annotations
  - [ ] Define `aliasUrls` and `mediaRefs` as arrays with URL path validation
  - [ ] Export schema as both Zod schema and inferred TypeScript/JSDoc type
- [ ] Create `scripts/migration/normalize.js`:
  - [ ] Load raw extraction output from `migration/intermediate/`
  - [ ] Load `migration/url-manifest.json` and index by `legacy_url`
  - [ ] For each extracted record:
    - [ ] Map `legacyUrl` → `targetUrl` and `disposition` from manifest
    - [ ] Flag records with no manifest match as normalization errors (not silent defaults)
    - [ ] Normalize `publishedAt` and `modifiedAt` to ISO 8601 (handle WP format variants)
    - [ ] Normalize taxonomy slugs per RHI-003 policy
    - [ ] Decode HTML entities in title, excerpt
    - [ ] Populate `aliasUrls` from manifest `aliases` field (if any)
    - [ ] Extract `mediaRefs` from `bodyHtml` `src` attributes using `cheerio`
  - [ ] Validate each record against Zod schema; write failures to error log
  - [ ] Write passing records to `migration/intermediate/records.normalized.json`
  - [ ] Write normalization summary (total, success, errors) to `migration/intermediate/normalize-summary.json`
- [ ] Run normalization and review outputs:
  - [ ] Confirm 100% `targetUrl` coverage for `keep` and `merge` records
  - [ ] Review and resolve all entries in `migration/intermediate/normalize-errors.json`
  - [ ] Any unresolvable errors must be escalated to migration owner before WS-C begins
- [ ] Add `"migrate:normalize": "node scripts/migration/normalize.js"` to `package.json`
- [ ] Commit schema, normalization script, and output artifacts
- [ ] Document normalization decisions and any exceptions in `docs/migration/RUNBOOK.md`

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
| RHI-031 Done — Phase 4 Bootstrap complete | Ticket | Pending |
| RHI-032 Done — Extraction complete; `migration/intermediate/` populated | Ticket | Pending |
| `migration/url-manifest.json` with 100% disposition coverage from RHI-004 | Ticket | Pending |
| `migration/url-inventory.normalized.json` with URL invariant policies from RHI-003 | Ticket | Pending |
| `zod` and `cheerio` installed | Tool | Pending |

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- `scripts/migration/schemas/record.schema.js`
- `scripts/migration/normalize.js`
- `migration/intermediate/records.normalized.json`
- `migration/intermediate/normalize-summary.json`
- `migration/intermediate/normalize-errors.json` (empty for release candidate run)
- `package.json` updated with `migrate:normalize` script

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- The canonical record model is the contract between the extraction layer and all transformation workstreams. Any field added or renamed here will require updates to WS-C, WS-D, WS-E, and WS-F.
- `aliasUrls` must come from the URL manifest, not from ad-hoc logic. Do not generate aliases outside of the approved manifest values.
- The Zod schema is the single source of truth for the record model. Keep it co-located with the scripts and document it in the RUNBOOK so future contributors know where the schema lives.
- Reference: `analysis/plan/details/phase-4.md` §Workstream B: Normalization and Canonical Record Model
