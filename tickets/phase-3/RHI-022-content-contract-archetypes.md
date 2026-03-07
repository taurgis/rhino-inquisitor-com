## RHI-022 · Workstream C — Content Contract and Archetypes

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 3  
**Assigned to:** Engineering Owner  
**Target date:** 2026-03-28  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Encode the front matter contract approved in Phase 2 (RHI-012) into Hugo archetypes, a machine-validated schema, and a CI-blocking validation script so that bulk-imported content during Phase 4 cannot reach a production build with missing mandatory fields, unsafe URL values, or `url` collisions. The archetype and validation layer is the enforcement point for the contract — without it, the contract is aspirational but unverifiable.

---

### Acceptance Criteria

- [ ] Archetypes exist for all primary content types with mandatory fields pre-populated and comments removed:
  - [ ] `archetypes/posts.md` — includes `title`, `description`, `url`, `draft`, `date`, `lastmod`, `categories`, `tags`
  - [ ] `archetypes/pages.md` — includes `title`, `description`, `url`, `draft`, `lastmod`
  - [ ] `archetypes/default.md` — includes `title`, `description`, `url`, `draft` as a fallback
- [ ] Archetype stubs include `heroImage` (or approved social image field) as a recommended but non-blocking field
- [ ] Archetype stubs include extension fields as optional commented-out entries: `author`, `seo.noindex`, `seo.ogImage`, `seo.twitterCard`, `canonical`, `aliases`
- [ ] Front matter validation script (`scripts/validate-frontmatter.js`) exists and:
  - [ ] Reads all Markdown files in `content/` recursively
  - [ ] Validates presence of all mandatory fields per content type
  - [ ] Reports each failing file with field name and violation type
  - [ ] Exits with non-zero code if any required-field violation is found
- [ ] URL safety validation is part of the same script (or a composable module):
  - [ ] Validates each `url` value is lowercase, starts with `/`, ends with `/`, and contains only `a-z 0-9 - /`
  - [ ] Detects duplicate `url` values across all content files (collision check)
  - [ ] Exits with non-zero code on any URL violation or collision
- [ ] `canonical` front matter override — when present — is validated as absolute HTTPS with the approved `www` host
- [ ] Validation script is referenced in `package.json` scripts as `npm run validate:frontmatter`
- [ ] Running `npm run validate:frontmatter` on the scaffold (with no content) exits with code 0
- [ ] Running `npm run validate:frontmatter` on a directory with a file missing a mandatory field exits with non-zero code

---

### Tasks

- [ ] Review approved front matter contract from RHI-012 Outcomes:
  - [ ] Mandatory fields for indexable content: `title`, `description`, `url`, `draft`
  - [ ] Additional mandatory fields for articles: `date`, `lastmod`, `categories`, `tags`
  - [ ] Additional mandatory fields for pages: `lastmod`
  - [ ] Required when URL has mapped legacy paths: `aliases`
- [ ] Create `archetypes/posts.md` with all mandatory fields and recommended extension fields
- [ ] Create `archetypes/pages.md` with mandatory page fields and recommended extension fields
- [ ] Create `archetypes/default.md` as a safe fallback with base mandatory fields
- [ ] Review existing `archetypes/default.md` created by `hugo new site` and replace with contract-compliant version
- [ ] Create `scripts/validate-frontmatter.js`:
  - [ ] Import `gray-matter` for front matter parsing
  - [ ] Import `fast-glob` for recursive file discovery
  - [ ] Define required field schema per content type (post/page/default)
  - [ ] Implement required field presence check with per-file error reporting
  - [ ] Implement URL format validation (regex: `^\/[a-z0-9\-\/]+\/$`)
  - [ ] Implement URL collision detection (collect all `url` values; flag duplicates)
  - [ ] Implement `canonical` override validation (must be absolute HTTPS www URL when present)
  - [ ] Output structured error list to stdout; exit 1 on any failure
- [ ] Add `"validate:frontmatter": "node scripts/validate-frontmatter.js"` to `package.json` scripts
- [ ] Run `npm run validate:frontmatter` on empty scaffold — confirm exit code 0
- [ ] Create a fixture content file missing a mandatory field and confirm exit code 1 (then delete fixture)
- [ ] Create a fixture with a duplicate `url` value and confirm exit code 1 (then delete fixture)
- [ ] Commit archetypes and validation script

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
| RHI-019 Done — Phase 3 Bootstrap complete | Ticket | Pending |
| RHI-021 Done — Hugo config hardening (taxonomy keys must match archetype field names) | Ticket | Pending |
| RHI-012 Outcomes — Front matter field list, mandatory/optional split, URL normalization rules approved | Ticket | Pending |
| `gray-matter` and `fast-glob` available in `package.json` (RHI-001 or RHI-015) | Tool | Pending |
| `zod` available in `package.json` for schema validation (RHI-015) | Tool | Pending |

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- `archetypes/posts.md`
- `archetypes/pages.md`
- `archetypes/default.md`
- `scripts/validate-frontmatter.js`
- `package.json` updated with `validate:frontmatter` script

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- Hugo does not sanitize `url` front matter values — the validation script is the only guard between an unsafe URL value and a broken build or URL regression.
- The `aliases` field is required when the `url-manifest.json` has a mapped legacy path for that content item. The validation script does not yet know the manifest; Phase 4 migration tooling will enforce this. Phase 3 scope is limited to validating the field format when it is present.
- Use `zod` for schema definition where practical to keep validation logic maintainable and extensible.
- Reference: `analysis/plan/details/phase-3.md` §Workstream C: Content Contract and Archetypes
