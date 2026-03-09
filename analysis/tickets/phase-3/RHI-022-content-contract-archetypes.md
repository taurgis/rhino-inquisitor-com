## RHI-022 · Workstream C — Content Contract and Archetypes

**Status:** Done  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 3  
**Assigned to:** Engineering Owner  
**Target date:** 2026-03-28  
**Created:** 2026-03-07  
**Updated:** 2026-03-09

---

### Goal

Encode the front matter contract approved in Phase 2 (RHI-012) into Hugo archetypes, a machine-validated schema, and a CI-blocking validation script so that bulk-imported content during Phase 4 cannot reach a production build with missing mandatory fields, unsafe URL values, or `url` collisions. The archetype and validation layer is the enforcement point for the contract — without it, the contract is aspirational but unverifiable.

---

### Acceptance Criteria

- [x] Archetypes exist for all primary content types with mandatory fields pre-populated and comments removed:
  - [x] `src/archetypes/posts.md` — includes `title`, `description`, `url`, `draft`, `date`, `lastmod`, `categories`, `tags`
  - [x] `src/archetypes/pages.md` — includes `title`, `description`, `url`, `draft`, `lastmod`
  - [x] `src/archetypes/categories.md` — supports category term metadata bundles without imposing the migrated post/page `url` contract
  - [x] `src/archetypes/default.md` — includes `title`, `description`, `url`, `draft` as a fallback
- [x] Archetype stubs include `heroImage` (or approved social image field) as a recommended but non-blocking field
- [x] Archetype stubs include extension fields as optional commented-out entries: `author`, `seo.noindex`, `seo.ogImage`, `seo.twitterCard`, `canonical`, `aliases`
- [x] Front matter validation script (`scripts/validate-frontmatter.js`) exists and:
  - [x] Reads all Markdown files in `src/content/` recursively
  - [x] Validates presence of all mandatory fields per content type
  - [x] Reports each failing file with field name and violation type
  - [x] Exits with non-zero code if any required-field violation is found
- [x] URL safety validation is part of the same script (or a composable module):
  - [x] Validates each `url` value is lowercase, starts with `/`, ends with `/`, and contains only `a-z 0-9 - /`
  - [x] Detects duplicate `url` values across all content files (collision check)
  - [x] Exits with non-zero code on any URL violation or collision
- [x] `canonical` front matter override — when present — is validated as absolute HTTPS with the approved `www` host
- [x] Validation script is referenced in `package.json` scripts as `npm run validate:frontmatter`
- [x] Running `npm run validate:frontmatter` on the scaffold (with no content) exits with code 0
- [x] Running `npm run validate:frontmatter` on a directory with a file missing a mandatory field exits with non-zero code

---

### Tasks

- [x] Review approved front matter contract from RHI-012 Outcomes:
  - [x] Mandatory fields for indexable content: `title`, `description`, `url`, `draft`
  - [x] Additional mandatory fields for articles: `date`, `lastmod`, `categories`, `tags`
  - [x] Additional mandatory fields for pages: `lastmod`
  - [x] Required when URL has mapped legacy paths: `aliases`
- [x] Create `src/archetypes/posts.md` with all mandatory fields and recommended extension fields
- [x] Create `src/archetypes/pages.md` with mandatory page fields and recommended extension fields
- [x] Create `src/archetypes/categories.md` for category term metadata bundles under `src/content/categories/**/_index.md`
- [x] Create `src/archetypes/default.md` as a safe fallback with base mandatory fields
- [x] Review existing `src/archetypes/default.md` scaffold placeholder and replace with contract-compliant version
- [x] Create `scripts/validate-frontmatter.js`:
  - [x] Import `gray-matter` for front matter parsing
  - [x] Import `fast-glob` for recursive file discovery
  - [x] Define required field schema per content type (post/page/category/default)
  - [x] Implement required field presence check with per-file error reporting
  - [x] Implement URL format validation (regex: `^\/[a-z0-9\-\/]+\/$`)
  - [x] Implement URL collision detection (collect all `url` values; flag duplicates)
  - [x] Implement `canonical` override validation (must be absolute HTTPS www URL when present)
  - [x] Output structured error list to stdout; exit 1 on any failure
- [x] Add `"validate:frontmatter": "node scripts/validate-frontmatter.js"` to `package.json` scripts
- [x] Run `npm run validate:frontmatter` on empty scaffold — confirm exit code 0
- [x] Create a fixture content file missing a mandatory field and confirm exit code 1 (then delete fixture)
- [x] Create a fixture with a duplicate `url` value and confirm exit code 1 (then delete fixture)
- [x] Commit-ready archetypes and validation script prepared

---

### Out of Scope

- Template rendering (covered by RHI-023 and RHI-024)
- URL parity checking against the Phase 1 manifest (covered by RHI-025)
- Migration pipeline that populates front matter in bulk (Phase 4)
- Accessibility, performance, or SEO checks (covered by RHI-026, RHI-027, RHI-024)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-019 Done — Phase 3 Bootstrap complete | Ticket | Done |
| RHI-021 Done — Hugo config hardening (taxonomy keys must match archetype field names) | Ticket | Done |
| RHI-012 Outcomes — Front matter field list, mandatory/optional split, URL normalization rules approved | Ticket | Done |
| `gray-matter` and `fast-glob` available in `package.json` (RHI-001 or RHI-015) | Tool | Done |
| `zod` available in `package.json` for schema validation (RHI-015) | Tool | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Front matter contract changed after archetypes are committed | Low | High | Any contract change requires update to archetypes, validation schema, and a re-run in CI; document update process in `RUNBOOK.md` | Engineering Owner |
| Validation script too strict, blocking valid content edge cases | Medium | Medium | Define clearly what is optional vs mandatory; use `zod` optional fields for extension fields | Engineering Owner |
| Collision check is slow on large content sets | Low | Low | Use `fast-glob` streaming; acceptable for Phase 3 scaffold sizes; re-evaluate in Phase 4 | Engineering Owner |
| Archetype used incorrectly — engineers use `default.md` for posts | Low | Medium | Add a comment at the top of each archetype explaining its intended content type | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Completed. Workstream C now enforces the Phase 2 front matter contract through Hugo archetypes plus a repo-side validation script that is safe to run locally and in CI before Phase 4 bulk import begins.

Approved implementation decisions:

- Added archetypes for posts, pages, categories, and default fallback under `src/archetypes/`.
- Kept migrated regular-content enforcement limited to posts and pages. Category archetype support applies to manually authored taxonomy term metadata bundles under `src/content/categories/**/_index.md` and intentionally does not impose the explicit migrated-page `url` contract.
- Preserved the approved repo field names from RHI-012, including top-level `heroImage`, `canonical`, and `seo`.
- Added `scripts/validate-frontmatter.js` using `gray-matter`, `fast-glob`, and `zod` to enforce required field presence, ISO-like datetime validation, lowercase path-only `url` rules, duplicate `url` collision detection, same-host absolute HTTPS validation for `canonical`, and path-only alias validation when `aliases` is present.
- Validation dispatch is path-driven rather than heuristic-driven:
  - `src/content/posts/**` -> post schema
  - `src/content/pages/**` -> page schema
  - `src/content/categories/**` -> category term metadata schema
  - all other Markdown content -> default schema
- Added `npm run validate:frontmatter` to `package.json` as the Phase 3 blocking entry point for this contract.

Validation completed:

- `npm run validate:frontmatter` passes on the empty scaffold.
- Negative fixture run confirms missing required fields fail with a non-zero exit code and per-file error output.
- Negative fixture run confirms duplicate `url` values fail with a non-zero exit code.
- Hugo archetype spot checks were run for post, page, and category creation paths to confirm the expected archetype files are selected.

**Delivered artefacts:**

- `src/archetypes/posts.md`
- `src/archetypes/pages.md`
- `src/archetypes/categories.md`
- `src/archetypes/default.md`
- `scripts/validate-frontmatter.js`
- `package.json` updated with `validate:frontmatter` script
- `README.md` updated with the new validation command
- `docs/migration/RUNBOOK.md` updated with archetype and validation run steps
- `analysis/documentation/phase-3/rhi-022-content-contract-archetypes-2026-03-09.md`

**Deviations from plan:**

- The original ticket acceptance criteria listed only posts, pages, and default archetypes. Owner clarification during implementation added `categories.md` so category term metadata can be scaffolded explicitly without changing the migrated post/page contract.
- The validator intentionally does not enforce manifest-aware `aliases` requiredness in Phase 3. That remains a Phase 4 migration-pipeline responsibility, as already noted in this ticket.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-09 | In Progress | Reconciled RHI-022 with RHI-012, Phase 3 Workstream C, the documentation skill gate, Hugo specialist guidance, and official Hugo guidance for archetype lookup, front matter formats, and URL behavior. |
| 2026-03-09 | In Progress | Added post/page/category/default archetypes and implemented a path-driven front matter validator with URL collision, canonical, alias, and datetime checks. |
| 2026-03-09 | Done | Added the `validate:frontmatter` package script, validated empty-scaffold and negative-fixture behavior, spot-checked Hugo archetype selection for posts/pages/categories, and updated the Phase 3 documentation and ticket tracking artefacts. |

---

### Notes

- Hugo does not sanitize `url` front matter values — the validation script is the only guard between an unsafe URL value and a broken build or URL regression.
- The `aliases` field is required when the `url-manifest.json` has a mapped legacy path for that content item. The validation script does not yet know the manifest; Phase 4 migration tooling will enforce this. Phase 3 scope is limited to validating the field format when it is present.
- Use `zod` for schema definition where practical to keep validation logic maintainable and extensible.
- Category archetype support in this ticket applies to term metadata bundles under `src/content/categories/**/_index.md`; it does not convert category term pages into migrated regular content with mandatory explicit `url` values.
- Reference: `analysis/plan/details/phase-3.md` §Workstream C: Content Contract and Archetypes
