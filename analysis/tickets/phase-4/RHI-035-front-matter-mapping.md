## RHI-035 · Workstream D — Front Matter Mapping and Hugo Contract

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 4  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-16  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Produce complete, schema-valid Hugo front matter for every in-scope migrated record and write the final `.md` content files to the `migration/output/` staging area (ready for validated batch import to `src/content/`). Front matter must adhere exactly to the Phase 2 contract (RHI-012). No content file may receive an auto-generated route — every `url` field must come from the URL manifest.

This ticket is where the Hugo content files are first assembled. Errors here (missing fields, duplicate URLs, auto-generated routes) will manifest as broken pages, SEO failures, and redirect regressions in production.

---

### Acceptance Criteria

- [ ] Front matter mapping script `scripts/migration/map-frontmatter.js` exists and:
  - [ ] Reads converted records from `migration/output/` (WS-C output)
  - [ ] Generates YAML front matter using `gray-matter` for each `keep` and `merge` record
  - [ ] Maps all required fields per Phase 2 contract (RHI-012):
    - [ ] `title` — from `titleRaw`; never empty
    - [ ] `description` — from `excerptRaw` or auto-generated summary; length-capped at 155 chars; never empty for indexable pages
    - [ ] `date` — from `publishedAt` (ISO 8601)
    - [ ] `lastmod` — from `modifiedAt` (ISO 8601)
    - [ ] `categories` — from normalized taxonomy list
    - [ ] `tags` — from normalized tag list
    - [ ] `heroImage` — from first featured image ref if available; omitted if not
    - [ ] `url` — from `targetUrl` in manifest; never derived from slug
    - [ ] `aliases` — from `aliasUrls` in normalized record; only approved legacy paths
    - [ ] `draft` — `false` for `publish` status; `true` for all other statuses
  - [ ] Validates that `url` values are unique across the output set (duplicate detection)
  - [ ] Validates that no `aliases` entry creates a loop (alias pointing to itself)
  - [ ] Validates that no auto-generated routes exist (every output file has explicit `url`)
  - [ ] Writes assembled `.md` files (front matter + converted body) to `migration/output/content/` with deterministic filenames
  - [ ] Is idempotent across runs
  - [ ] Exits with non-zero code on any validation error
- [ ] Front matter validator passes for the complete generated set:
  - [ ] `npm run validate:frontmatter` exits with code 0 for all files in `migration/output/content/`
- [ ] `migration/reports/frontmatter-errors.csv` is produced and:
  - [ ] Contains zero entries for the release candidate batch
  - [ ] Each error entry includes `sourceId`, `file`, `field`, `errorType`, and `errorMessage`
- [ ] `retire` records produce no `.md` output files — they are logged only in the migration report (RHI-042)
- [ ] Script is referenced in `package.json` as `npm run migrate:map-frontmatter`

---

### Tasks

- [ ] Review Phase 2 front matter contract (RHI-012 Outcomes) to confirm all required fields and validation rules
- [ ] Create `scripts/migration/map-frontmatter.js`:
  - [ ] Load converted records from `migration/output/`
  - [ ] For each record with `disposition: keep` or `disposition: merge`:
    - [ ] Build front matter object with all required fields
    - [ ] Apply description length cap (max 155 chars); log truncations as warnings
    - [ ] Validate `url` matches canonical path format: lowercase, starts with `/`, ends with `/`
    - [ ] Validate `aliases` are not self-referencing and not duplicates of `url`
    - [ ] Write `.md` file to `migration/output/content/{postType}/{slug}.md`
  - [ ] Perform duplicate `url` detection across all output files; exit on any duplicate found
  - [ ] Write front matter errors to `migration/reports/frontmatter-errors.csv`
- [ ] Run `npm run validate:frontmatter` against `migration/output/content/`:
  - [ ] Fix any failures; iterate until the report is empty for release candidate records
- [ ] Spot-check 10 generated `.md` files for front matter correctness:
  - [ ] Verify `url` matches manifest `targetUrl` exactly
  - [ ] Verify `draft: false` for published records
  - [ ] Verify `aliases` match expected redirect paths
  - [ ] Verify description is populated and under 155 chars
- [ ] Add `"migrate:map-frontmatter": "node scripts/migration/map-frontmatter.js"` to `package.json`
- [ ] Commit mapping script and front matter error report template

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
| RHI-031 Done — Phase 4 Bootstrap complete | Ticket | Pending |
| RHI-033 Done — Normalized records available | Ticket | Pending |
| RHI-034 Done — Converted records available in `migration/output/` | Ticket | Pending |
| RHI-012 Outcomes — Front matter contract confirmed (required fields, URL normalization rules, `draft` lifecycle) | Ticket | Pending |
| RHI-022 Done — `validate:frontmatter` script callable | Ticket | Pending |
| `gray-matter` installed | Tool | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Duplicate `url` values across migrated content | Medium | Critical | Implement duplicate detection as a hard fail in the mapping script; do not allow batch merge with any URL collision | Engineering Owner |
| `description` field empty for posts with no excerpt | High | High | Implement fallback: use first 155 chars of converted body text; log as warning; validate fallback is readable | Engineering Owner |
| `aliases` contain stale or incorrect legacy paths | Medium | High | Cross-check alias paths against manifest `aliasUrls`; do not generate aliases outside approved manifest values | SEO Owner |
| Auto-generated slug routes appearing if `url` is missing | Low | Critical | Add assertion: if `url` field is empty or not set, fail the script; never emit a content file without explicit `url` | Engineering Owner |
| Gray-matter serialization produces unexpected YAML for complex fields (e.g., multiline strings) | Low | Medium | Test serialization of edge-case field values (long titles, special characters, multiline descriptions) before full run | Engineering Owner |

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

- `scripts/migration/map-frontmatter.js`
- `migration/output/content/` with generated `.md` files
- `migration/reports/frontmatter-errors.csv` (empty for release candidate batch)
- `package.json` updated with `migrate:map-frontmatter` script

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- The `url` field must always come from `migration/url-manifest.json` via the normalized record `targetUrl`. Any record without a `targetUrl` should have been caught and escalated in WS-B; if one slips through here, it must fail loudly, not silently default.
- The description fallback (first 155 chars of body text) is acceptable for launch but should be reviewed during the high-value batch (RHI-044) for top-traffic pages where custom descriptions are worth crafting.
- `draft` lifecycle: published WordPress posts → `draft: false`; draft/private/trash WordPress posts → `draft: true`. This is a hard rule, not a heuristic.
- Reference: `analysis/plan/details/phase-4.md` §Workstream D: Front Matter Mapping and Hugo Contract
