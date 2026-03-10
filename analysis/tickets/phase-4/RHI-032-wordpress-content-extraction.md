## RHI-032 · Workstream A — WordPress Content Extraction

**Status:** Done  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 4  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-11  
**Created:** 2026-03-07  
**Updated:** 2026-03-10

---

### Goal

Build a complete, provenance-tracked source dataset of all WordPress content by ingesting the approved WordPress source artifacts for the run: WXR export, REST API, SQL dump, and filesystem snapshot as needed. WXR and REST remain the preferred structured extraction inputs, while the SQL dump and filesystem snapshot are approved recovery and enrichment sources for fields or assets that are missing, incomplete, or cleaner outside the export/API path. The output must cover 100% of in-scope URL types (posts, pages, video-related, categories, landing pages) and include every field required for normalization in WS-B. Records that cannot be parsed must be quarantined — never silently dropped — so the extraction gap is fully visible before any downstream transformation begins.

This ticket is the entry point of the entire migration pipeline. All subsequent workstreams consume the artifacts produced here.

---

### Acceptance Criteria

- [x] Extraction script `scripts/migration/extract.js` exists and:
  - [x] Parses WXR file using `fast-xml-parser`
  - [x] Extracts WordPress post types present in the validated source-backed scope: `post`, `page`, `attachment`, and `e-landing-page` mapped to `landing`
  - [x] Preserves per-record fields: `sourceId`, `sourceType`, `sourceChannels`, `slug`, `status`, `postType`, `titleRaw`, `excerptRaw`, `bodyHtml`, `publishedAt`, `modifiedAt`, `author`, `categories`, `tags`, `legacyUrl`, `mediaRefs`
  - [x] Records source artifact timestamps for the run in the extraction summary
  - [x] Supports optional subset mode (by `sourceId` list and/or postType filter) for pilot runs
  - [x] Records extraction scope metadata (`mode`, selection input, record count) in extract summary
  - [x] Is idempotent — re-running on the same source file produces identical output
  - [x] Exits with a non-zero code and an actionable error message if source file is unreadable or malformed
- [x] Enabled-source reconciliation report is produced:
  - [x] Count by post type and status across the approved source channels used in the run
  - [x] Any URL present in `migration/url-inventory.normalized.json` but absent from extracted records is flagged
- [x] Source-channel supplementation is implemented where needed for the validated source set:
  - [x] WXR is the primary structured extraction channel for the validated run
  - [x] SQL recovery path is available for additive recovery when approved dump content is missing from WXR
  - [x] Filesystem recovery path is available for attachment and upload references that require source-of-truth verification
  - [x] REST enrichment remains optional and was not required on the validated run; if enabled later, pagination completeness must be verified before use
- [x] All malformed or unparseable records land in `migration/intermediate/extract-quarantine.json` with:
  - [x] `sourceId` (if determinable)
  - [x] `errorType` and `errorMessage`
  - [x] Raw source fragment for manual inspection
  - [x] Records are never silently dropped
- [x] `migration/intermediate/extract-summary.json` is produced with:
  - [x] Total records extracted by type and status
  - [x] Quarantine count and reason summary
  - [x] Source artifact timestamps, selected source channels, and extraction method summary for the run
- [x] Coverage check:
  - [x] Full mode: every source-backed `keep` or `merge` URL in `migration/url-manifest.json` has a corresponding extracted record, per owner-confirmed `source-backed-content-only` scope
  - [x] Subset mode: every selected source-backed `keep` or `merge` URL in the subset has a corresponding extracted record
- [x] Script is referenced in `package.json` as `npm run migrate:extract`

---

### Tasks

- [x] Review WXR file structure and confirm which post types are present
- [x] Inspect WordPress SQL dump tables needed for content and metadata recovery (`wp_posts`, `wp_postmeta`, taxonomy tables, and any documented custom tables in scope)
- [x] Inspect WordPress filesystem snapshot for uploads structure and any content-bearing plugin/theme export assets that materially affect migration completeness
- [x] Confirm which supplemental channels are needed (check WXR/API completeness against manifest and known metadata/media gaps):
  - [x] Compare extracted record coverage against `url-inventory.normalized.json`
  - [x] Document decision in Progress Log: selected source-channel strategy and fallback rationale
- [x] Create `scripts/migration/extract.js`:
  - [x] Use `fast-xml-parser` with options to handle CDATA body fields and special characters
  - [x] Define and validate the parsed field list against the downstream record contract
  - [x] Implement quarantine handler: catch parse errors per record; write to quarantine log
  - [x] Implement subset selectors (`--source-id-file` and `--post-type`) for pilot execution
  - [x] Implement extraction summary writer
- [x] REST API enrichment was assessed and intentionally not required for the validated run:
  - [x] No REST pagination loop was added to the default extractor because the approved source-backed scope passed without API supplementation
  - [x] The runbook documents the completeness gate to use if REST enrichment is introduced later
- [x] SQL recovery support is available:
  - [x] Implement statement-safe SQL scanning for approved dump reads and additive recovery hooks
- [x] Filesystem recovery support is available:
  - [x] Implement attachment and uploads reconciliation against the snapshot and log verified or missing assets
- [x] Run `scripts/migration/extract.js` against the approved source artifacts and review output:
  - [x] Verify `migration/intermediate/extract-summary.json` counts match the validated run totals
  - [x] Review `migration/intermediate/extract-quarantine.json` — the validated run produced zero quarantined records
  - [x] Verify all source-backed `keep` or `merge` URLs from the manifest have a corresponding record
- [x] Add `"migrate:extract": "node scripts/migration/extract.js"` to `package.json` scripts
- [x] Commit `scripts/migration/extract.js`, extraction output artifacts, and updated `package.json`
- [x] Document extraction method decision and quarantine handling in `docs/migration/RUNBOOK.md`

---

### Out of Scope

- Normalizing record fields into canonical schema (Workstream B — RHI-033)
- Converting HTML body to Markdown (Workstream C — RHI-034)
- Downloading media assets (Workstream F — RHI-037)
- Any writes to `src/content/` directory

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-031 Done — Phase 4 Bootstrap; workspace directories and tooling in place | Ticket | Done |
| WordPress WXR export file available in the approved working source location | Access | Verified locally — `tmp/therhinoinquisitor.WordPress.2026-03-10.xml` |
| WordPress SQL dump available in the approved working source location | Access | Verified locally — `tmp/wordpress-database.sql` |
| WordPress filesystem snapshot available in the approved working source location | Access | Verified locally — `tmp/website-wordpress-backup/wp-content` |
| WordPress REST API accessible with authentication (if API enrichment is required) | Access | Verified locally during RHI-031; not required for the validated RHI-032 run |
| `migration/url-inventory.normalized.json` from RHI-002 | Ticket | Verified locally |
| `migration/url-manifest.json` with full disposition coverage from RHI-004 | Ticket | Verified locally |
| `fast-xml-parser` and related migration dependencies installed via `npm install` | Tool | Verified locally |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| WXR CDATA body fields not correctly extracted, resulting in empty body | High | Critical | Test CDATA parsing on a sample of 5 posts on Day 1; adjust `fast-xml-parser` options before full run | Engineering Owner |
| WXR file missing custom post types (e.g., video posts stored under a custom type) | Medium | High | Inspect WXR `<wp:post_type>` values before writing script; cross-check against live site URL types | Engineering Owner |
| REST pagination silently skips pages at boundaries | Medium | High | Verify total REST item count matches page count × per-page; assert on last page index | Engineering Owner |
| SQL dump capture window or schema differs from WXR/API snapshot, creating conflicting values | Medium | High | Record artifact timestamps and resolve precedence before full extraction; do not silently overwrite conflicting fields | Engineering Owner |
| Filesystem snapshot uses a customized content or uploads path | Medium | Medium | Inspect the snapshot and WordPress config before asset reconciliation; document the effective path contract in the runbook | Engineering Owner |
| Extraction output is non-deterministic across runs (e.g., timestamp differences) | Low | Medium | Use fixed extraction timestamp from source file modification time; sort output by `sourceId` | Engineering Owner |
| Quarantine log grows unexpectedly large, masking a systemic parse issue | Low | High | Alert if quarantine exceeds 5% of total records; halt and escalate before proceeding | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Implemented on 2026-03-10.

Phase 4 now has a deterministic WordPress extraction entry point that produces the stable intermediate dataset required by downstream workstreams. The validated run completed with 947 extracted records, zero quarantined records, full source-backed manifest coverage, and stable hashes across reruns.

**Delivered artefacts:**

- `scripts/migration/extract.js`
- `migration/intermediate/extract-records.json`
- `migration/intermediate/extract-summary.json`
- `migration/intermediate/extract-quarantine.json`
- `package.json` updated with `migrate:extract` script
- `docs/migration/RUNBOOK.md` extraction section
- `analysis/documentation/phase-4/rhi-032-extraction-implementation-2026-03-10.md`

**Deviations from plan:**

- The original ticket language treated every `keep` or `merge` manifest URL as blocking extraction completeness. During implementation, Thomas Theunen clarified that only source-backed content routes should block completion; system, feed, query, homepage, pagination, and synthetic index routes are reported separately.
- REST supplementation was not added to the default run because the approved WXR plus filesystem-backed scope passed validation without API enrichment.
- The SQL recovery path was implemented and validated against the approved dump format, but the validated run did not require additional SQL-recovered records.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-10 | In Progress | Reviewed the approved WXR export, SQL dump, filesystem snapshot, manifest, and normalized inventory to confirm the executable extraction scope and the required record fields for downstream normalization. |
| 2026-03-10 | In Progress | Thomas Theunen confirmed the coverage rule: extraction completeness blocks only on source-backed content routes. System, feed, query, homepage, pagination, and synthetic index routes are reported but do not block WS-A completion. |
| 2026-03-10 | In Progress | Implemented `scripts/migration/extract.js` with WXR parsing, subset mode, per-record quarantine handling, deterministic summary generation, filesystem verification, and additive SQL recovery support. Added `npm run migrate:extract` in `package.json` and documented the workflow in `docs/migration/RUNBOOK.md`. |
| 2026-03-10 | In Progress | Initial extraction run surfaced source-backed coverage drift caused by synthetic page-class manifest entries and then exposed a SQL parser defect on multi-line dump statements. The coverage predicate was aligned with approved source-backed provenance and the SQL parser was fixed to buffer multi-line `INSERT` statements. |
| 2026-03-10 | Done | Validated `npm run migrate:extract` end to end: 947 extracted records, 0 quarantined records, 192/192 source-backed manifest URLs matched, inventory gap report empty for the blocking scope, and repeated artifact hashes remained stable across reruns. Committed implementation as `c2a7cac` (`Implement RHI-032 extraction workflow`). |

---

### Notes

- WXR CDATA parsing is the single most common failure mode for WordPress extraction. The `fast-xml-parser` option `cdataTagName` must be configured correctly; test on real data before bulk extraction.
- Use the full WordPress filesystem snapshot and SQL dump as approved source artifacts for completeness and recovery, not as a license to broaden scope into plugin or theme migration. Only content-bearing or audit-relevant fields belong in the extraction output.
- The extract summary record count must be reconciled against the Phase 1 URL manifest before WS-B begins. Any coverage gap must be documented and signed off as an explicit scope exception, not silently accepted.
- Do not write generated files into `migration/output/` or `src/content/` from this script. The pipeline enforces immutable artifacts between stages: extract output goes to `migration/intermediate/` only.
- Reference: `analysis/plan/details/phase-4.md` §Workstream A: Extraction Strategy
