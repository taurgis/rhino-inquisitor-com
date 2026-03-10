## RHI-035 · Workstream D — Front Matter Mapping and Hugo Contract

**Status:** Done  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 4  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-16  
**Created:** 2026-03-07  
**Updated:** 2026-03-10

---

### Goal

Produce complete, schema-valid Hugo front matter for every in-scope migrated record and write the final `.md` content files to the `migration/output/` staging area (ready for validated batch import to `src/content/`). Front matter must adhere to the Phase 2 contract (RHI-012) plus the approved discovery-metadata extension from RHI-106. No content file may receive an auto-generated route — every `url` field must come from the URL manifest.

This ticket is where the Hugo content files are first assembled. Errors here (missing fields, duplicate URLs, auto-generated routes) will manifest as broken pages, SEO failures, and redirect regressions in production.

---

### Acceptance Criteria

- [x] Front matter mapping script `scripts/migration/map-frontmatter.js` exists and:
  - [x] Reads converted records from `migration/output/` (WS-C output)
  - [x] Generates YAML front matter using `gray-matter` for each `keep` and `merge` record
  - [x] Maps all required fields per Phase 2 contract (RHI-012):
    - [x] `title` — from `titleRaw`; never empty
    - [x] `description` — from `excerptRaw` or auto-generated summary; length-capped at 155 chars; never empty for indexable pages
    - [x] `date` — from `publishedAt` (ISO 8601) for posts; optional for pages per RHI-012
    - [x] `lastmod` — from `modifiedAt` (ISO 8601)
    - [x] `categories` — from normalized taxonomy list for posts; omitted on pages per RHI-012
    - [x] `tags` — from normalized tag list for posts; omitted on pages per RHI-012
    - [x] `heroImage` — omitted in the validated run because current normalized and converted artifacts do not yet carry featured-media lookup data; featured-image recovery remains downstream media work in RHI-037
    - [x] `url` — from `targetUrl` in manifest; never derived from slug
    - [x] `aliases` — from `aliasUrls` in normalized record when the value is an approved path-only Hugo alias; non-path `/?p=` aliases are intentionally excluded from front matter and remain manifest-governed for RHI-036 and edge redirect work
    - [x] `draft` — `false` for `publish` status; `true` for all other statuses
  - [x] Preserves approved optional discovery metadata from RHI-106 under `params` when source data or curation rules provide it:
    - [x] `params.primaryTopic`
    - [x] `params.secondaryTopics`
    - [x] `params.contentType`
    - [x] `params.difficulty`
    - [x] `params.series`
    - [x] `params.summary`
    - [x] `params.relatedContent`
    - [x] `params.featuredHome`
  - [x] Does not fail launch-intended content solely because optional discovery metadata is absent
  - [x] Validates that `url` values are unique across the output set (duplicate detection)
  - [x] Validates that no `aliases` entry creates a loop (alias pointing to itself)
  - [x] Validates that no auto-generated routes exist (every output file has explicit `url`)
  - [x] Writes assembled `.md` files (front matter + converted body) to `migration/output/content/` with deterministic filenames
  - [x] Is idempotent across runs
  - [x] Exits with non-zero code on any validation error
- [x] Front matter validator passes for the complete generated set:
  - [x] `node scripts/validate-frontmatter.js --content-dir migration/output/content` exits with code 0 for all files in `migration/output/content/`
- [x] `migration/reports/frontmatter-errors.csv` is produced and:
  - [x] Contains zero entries for the release candidate batch
  - [x] Each error entry includes `sourceId`, `file`, `field`, `errorType`, and `errorMessage`
- [x] `retire` records produce no `.md` output files — they are logged only in the migration report (RHI-042)
- [x] Script is referenced in `package.json` as `npm run migrate:map-frontmatter`

---

### Tasks

- [x] Review the Phase 2 front matter contract (RHI-012 Outcomes) plus the approved discovery-metadata extension from RHI-106 to confirm all required and optional validation rules
- [x] Reconcile the existing `scripts/migration/map-frontmatter.js` entry point against the RHI-035 closure contract:
  - [x] Load converted records from `migration/output/`
  - [x] Build front matter for each `keep` or `merge` post/page record
  - [x] Apply deterministic description capping at 155 chars
  - [x] Validate `url` matches the canonical path contract and is never slug-derived
  - [x] Validate `aliases` are not self-referencing and only emit path-only Hugo-compatible aliases
  - [x] Preserve approved optional discovery metadata under `params` when present and validated by RHI-106
  - [x] Write `.md` files to `migration/output/content/{postType}/{slug}.md`
  - [x] Perform duplicate `url` and duplicate staged output-path detection across the generated set
  - [x] Write front matter errors to `migration/reports/frontmatter-errors.csv`
- [x] Run generated-content validation against `migration/output/content/` and iterate until the report is empty for the validated release-candidate records
- [x] Spot-check 10 generated `.md` files for front matter correctness:
  - [x] Verify `url` matches manifest `targetUrl` exactly
  - [x] Verify `draft` derivation matches WordPress status for published records
  - [x] Verify `aliases` are omitted cleanly when only non-path legacy aliases exist
  - [x] Verify description is populated and under 155 chars
  - [x] Verify optional discovery metadata renders under `params` when supplied and is omitted cleanly when absent
- [x] Confirm `package.json` exposes `npm run migrate:map-frontmatter`
- [x] Commit mapping script, generated staged content, and report artifacts

---

### Out of Scope

- URL parity validation against the full manifest (Workstream E — RHI-036)
- Copying files from `migration/output/content/` to `src/content/` (part of batch execution in RHI-043–RHI-045)
- Media path rewriting (Workstream F — RHI-037)
- Internal link rewriting (Workstream G — RHI-038)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-031 Done — Phase 4 Bootstrap complete | Ticket | Done |
| RHI-033 Done — Normalized records available | Ticket | Done |
| RHI-034 Done — Converted records available in `migration/output/` | Ticket | Done |
| RHI-106 Done — Discovery metadata extension contract and validation rules confirmed | Ticket | Done |
| RHI-012 Outcomes — Front matter contract confirmed (required fields, URL normalization rules, `draft` lifecycle) | Ticket | Done |
| RHI-022 Done — `validate:frontmatter` script callable | Ticket | Done |
| `gray-matter` installed | Tool | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Duplicate `url` values across migrated content | Medium | Critical | Implement duplicate detection as a hard fail in the mapping script; do not allow batch merge with any URL collision | Engineering Owner |
| `description` field empty for posts with no excerpt | High | High | Implement fallback: use first 155 chars of converted body text; log as warning; validate fallback is readable | Engineering Owner |
| `aliases` contain stale or incorrect legacy paths | Medium | High | Cross-check alias paths against manifest `aliasUrls`; do not generate aliases outside approved manifest values | SEO Owner |
| Optional discovery metadata fields drift in shape across scripts and content authors | Medium | Medium | Validate the approved `params` schema from RHI-106 before writing any optional discovery fields | Engineering Owner |
| Auto-generated slug routes appearing if `url` is missing | Low | Critical | Add assertion: if `url` field is empty or not set, fail the script; never emit a content file without explicit `url` | Engineering Owner |
| Gray-matter serialization produces unexpected YAML for complex fields (e.g., multiline strings) | Low | Medium | Test serialization of edge-case field values (long titles, special characters, multiline descriptions) before full run | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Completed. Workstream D now has a validated and deterministic front matter mapping stage that converts the Phase 4 converted-record corpus into Hugo-ready Markdown files under `migration/output/content/` without relying on implicit routes or unchecked alias emission.

Validated 2026-03-10 full-run outcomes:

- 171 keep/merge non-category records mapped successfully to staged Markdown:
  - 150 posts
  - 21 pages
- `migration/reports/frontmatter-errors.csv` contains header-only output with zero data rows
- `node scripts/validate-frontmatter.js --content-dir migration/output/content` passed for all 171 generated Markdown files
- Rerun hashing confirmed idempotent output for all generated Markdown files plus `migration/reports/frontmatter-errors.csv` and `migration/reports/discovery-metadata-coverage.json`
- Discovery enrichment coverage is 0 records in the current corpus, and the coverage report remains deterministic across reruns
- 123 query-style `/?p=` aliases were intentionally excluded from front matter because the approved Phase 2 alias contract and the generated-content validator require path-only Hugo aliases
- A deterministic 10-file spot check confirmed exact `url` mapping, correct `draft` derivation, non-empty descriptions within the 155-character cap, and clean omission of optional `params` and `aliases` when absent

**Delivered artefacts:**

- `scripts/migration/map-frontmatter.js`
- `migration/output/content/` with generated `.md` files
- `migration/reports/frontmatter-errors.csv` (empty for release candidate batch)
- `migration/reports/discovery-metadata-coverage.json`
- `package.json` updated with `migrate:map-frontmatter` script
- `docs/migration/RUNBOOK.md` updated with the RHI-035 operational contract
- `analysis/documentation/phase-4/rhi-035-front-matter-mapping-implementation-2026-03-10.md`

**Deviations from plan:**

- Generated-content validation uses `node scripts/validate-frontmatter.js --content-dir migration/output/content` instead of the bare `npm run validate:frontmatter` script because the repository default validator target remains `src/content/`.
- Query-style legacy aliases from the manifest are not emitted into front matter because they are not Hugo alias-page compatible and violate the approved Phase 2 path-only alias contract. Those legacy URLs remain manifest-governed inputs for RHI-036 and the required edge redirect layer.
- `heroImage` remains omitted in the validated full run because the current normalized and converted artifacts do not expose featured-media lookup data or attachment linkage. Featured-image recovery and local-path rewriting remain downstream media work in RHI-037.
- The authoritative Phase 2 content contract remains content-type aware: `date`, `categories`, and `tags` are required for posts, while pages continue to omit post-only taxonomy fields and may omit `date`.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-10 | In Progress | Reconciled the existing mapper from RHI-106 against the approved Phase 2 contract, the generated-content validator, and Hugo-safe alias behavior. Identified query-style manifest aliases as the primary closure blocker for the staged content set. |
| 2026-03-10 | Done | Hardened `scripts/migration/map-frontmatter.js`, generated 171 staged Markdown files with a header-only front matter error report, excluded 123 non-path aliases from front matter, passed generated-content validation, verified rerun stability, and recorded the Phase 4 implementation contract. |

---

### Notes

- The `url` field must always come from `migration/url-manifest.json` via the normalized record `targetUrl`. Any record without a `targetUrl` should have been caught and escalated in WS-B; if one slips through here, it must fail loudly, not silently default.
- The description fallback (first 155 chars of body text) is acceptable for launch but should be reviewed during the high-value batch (RHI-044) for top-traffic pages where custom descriptions are worth crafting.
- `draft` lifecycle: published WordPress posts → `draft: false`; draft/private/trash WordPress posts → `draft: true`. This is a hard rule, not a heuristic.
- Discovery/readability enrichment fields remain optional and must live under `params`; reading time and update status remain derived unless a later approved ticket changes that rule.
- Path-only Hugo aliases remain the only allowed front matter alias shape in this workstream. Query-style legacy URLs remain valid manifest inputs, but they must be handled by downstream redirect validation and the required edge redirect layer instead of front matter alias emission.
- Reference: `analysis/plan/details/phase-4.md` §Workstream D: Front Matter Mapping and Hugo Contract
