## RHI-032 · Workstream A — WordPress Content Extraction

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 4  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-11  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Build a complete, provenance-tracked source dataset of all WordPress content by ingesting the WXR export and supplementing with REST API data where necessary. The output must cover 100% of in-scope URL types (posts, pages, video-related, categories, landing pages) and include every field required for normalization in WS-B. Records that cannot be parsed must be quarantined — never silently dropped — so the extraction gap is fully visible before any downstream transformation begins.

This ticket is the entry point of the entire migration pipeline. All subsequent workstreams consume the artifacts produced here.

---

### Acceptance Criteria

- [ ] Extraction script `scripts/migration/extract.js` exists and:
  - [ ] Parses WXR file using `fast-xml-parser` (streaming or chunked for large files)
  - [ ] Extracts all WordPress post types: `post`, `page`, `attachment`, `video` custom type (if present)
  - [ ] Preserves per-record fields: `sourceId`, `sourceType` (`wxr`/`rest`/`fallback`), `slug`, `status`, `postType`, `titleRaw`, `excerptRaw`, `bodyHtml`, `publishedAt`, `modifiedAt`, `author`, `categories`, `tags`, `legacyUrl`, `mediaRefs`
  - [ ] Records source timestamp on the extraction run
  - [ ] Is idempotent — re-running on the same source file produces identical output
  - [ ] Exits with a non-zero code and an actionable error message if source file is unreadable or malformed
- [ ] WXR vs REST reconciliation report is produced:
  - [ ] Count by post type and status across WXR and REST (if REST is used)
  - [ ] Any URL present in `migration/url-inventory.normalized.json` but absent from extracted records is flagged
- [ ] REST API supplement is implemented (if needed for missing or cleaner fields):
  - [ ] Pagination completeness is verified — no pages silently skipped
  - [ ] Rate limiting handled with retry logic using `p-limit`
- [ ] All malformed or unparseable records land in `migration/intermediate/extract-quarantine.json` with:
  - [ ] `sourceId` (if determinable)
  - [ ] `errorType` and `errorMessage`
  - [ ] Raw source fragment for manual inspection
  - [ ] Records are never silently dropped
- [ ] `migration/intermediate/extract-summary.json` is produced with:
  - [ ] Total records extracted by type and status
  - [ ] Quarantine count and reason summary
  - [ ] Source timestamp and extraction method (`wxr`, `wxr+rest`, `wxr+rest+fallback`)
- [ ] Coverage check: every URL in `migration/url-manifest.json` with disposition `keep` or `merge` has a corresponding extracted record
- [ ] Script is referenced in `package.json` as `npm run migrate:extract`

---

### Tasks

- [ ] Review WXR file structure and confirm which post types are present
- [ ] Confirm whether REST API supplement is needed (check WXR completeness against manifest):
  - [ ] Compare WXR record slugs against `url-inventory.normalized.json`
  - [ ] Document decision in Progress Log: WXR-only vs hybrid
- [ ] Create `scripts/migration/extract.js`:
  - [ ] Use `fast-xml-parser` with options to handle CDATA body fields and special characters
  - [ ] Define and validate parsed field list against canonical record model (WS-B schema preview)
  - [ ] Implement quarantine handler: catch parse errors per record; write to quarantine log
  - [ ] Implement extraction summary writer
- [ ] If REST supplement needed:
  - [ ] Implement REST pagination loop with `p-limit`-bounded concurrency
  - [ ] Merge REST fields over WXR records using `sourceId` as key
  - [ ] Log merge statistics in extract summary
- [ ] Run `scripts/migration/extract.js` against the WXR source and review output:
  - [ ] Verify `migration/intermediate/extract-summary.json` counts match expected totals
  - [ ] Review `migration/intermediate/extract-quarantine.json` — remediate or accept each entry with owner sign-off
  - [ ] Verify all `keep`/`merge` URLs from manifest have a corresponding record
- [ ] Add `"migrate:extract": "node scripts/migration/extract.js"` to `package.json` scripts
- [ ] Commit `scripts/migration/extract.js`, extraction output artifacts, and updated `package.json`
- [ ] Document extraction method decision and quarantine handling in `docs/migration/RUNBOOK.md`

---

### Out of Scope

- Normalizing record fields into canonical schema (Workstream B — RHI-033)
- Converting HTML body to Markdown (Workstream C — RHI-034)
- Downloading media assets (Workstream F — RHI-037)
- Any writes to `content/` directory

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-031 Done — Phase 4 Bootstrap; workspace directories and tooling in place | Ticket | Pending |
| WordPress WXR export file available in `migration/input/` | Access | Pending |
| WordPress REST API accessible with authentication (if hybrid extraction required) | Access | Pending |
| `migration/url-inventory.normalized.json` from RHI-002 | Ticket | Pending |
| `migration/url-manifest.json` with full disposition coverage from RHI-004 | Ticket | Pending |
| `fast-xml-parser` and `p-limit` installed via `npm install` | Tool | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| WXR CDATA body fields not correctly extracted, resulting in empty body | High | Critical | Test CDATA parsing on a sample of 5 posts on Day 1; adjust `fast-xml-parser` options before full run | Engineering Owner |
| WXR file missing custom post types (e.g., video posts stored under a custom type) | Medium | High | Inspect WXR `<wp:post_type>` values before writing script; cross-check against live site URL types | Engineering Owner |
| REST pagination silently skips pages at boundaries | Medium | High | Verify total REST item count matches page count × per-page; assert on last page index | Engineering Owner |
| Extraction output is non-deterministic across runs (e.g., timestamp differences) | Low | Medium | Use fixed extraction timestamp from source file modification time; sort output by `sourceId` | Engineering Owner |
| Quarantine log grows unexpectedly large, masking a systemic parse issue | Low | High | Alert if quarantine exceeds 5% of total records; halt and escalate before proceeding | Engineering Owner |

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

- `scripts/migration/extract.js`
- `migration/intermediate/extract-summary.json`
- `migration/intermediate/extract-quarantine.json`
- `package.json` updated with `migrate:extract` script
- `docs/migration/RUNBOOK.md` extraction section

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- WXR CDATA parsing is the single most common failure mode for WordPress extraction. The `fast-xml-parser` option `cdataTagName` must be configured correctly; test on real data before bulk extraction.
- The extract summary record count must be reconciled against the Phase 1 URL manifest before WS-B begins. Any coverage gap must be documented and signed off as an explicit scope exception, not silently accepted.
- Do not write generated files into `migration/output/` or `content/` from this script. The pipeline enforces immutable artifacts between stages: extract output goes to `migration/intermediate/` only.
- Reference: `analysis/plan/details/phase-4.md` §Workstream A: Extraction Strategy
