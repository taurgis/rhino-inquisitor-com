## RHI-012 · Workstream B — Content Model and Front Matter Contract

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 2  
**Assigned to:** Migration Owner  
**Target date:** 2026-03-19  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Define and approve the complete front matter contract for all migrated content types so that the Phase 4 content conversion pipeline has an unambiguous output specification. Every field, its type, its source in WordPress export data, its validation rule, and its default value must be recorded here. Ambiguity in the content model at this stage propagates directly into thousands of incorrectly generated content files and broken URL routes.

The content model must also specify which fields are mandatory for production publishing, what normalization rules apply, and how `draft` status interacts with the build pipeline. This contract becomes an input to the front matter validation script (Phase 3) and the conversion pipeline (Phase 4).

---

### Acceptance Criteria

- [ ] All mandatory front matter fields are enumerated with type, purpose, and validation rule:
  - [ ] `title` — string, required, maps from WordPress post title
  - [ ] `description` — string, required for published posts, 120–155 chars recommended, maps from WordPress excerpt or meta description
  - [ ] `date` — ISO 8601 datetime, required, maps from WordPress `post_date_gmt`
  - [ ] `lastmod` — ISO 8601 datetime, required, maps from WordPress `post_modified_gmt`
  - [ ] `categories` — string array, required for posts, maps from WordPress category taxonomy
  - [ ] `tags` — string array, optional, maps from WordPress post_tag taxonomy
  - [ ] `heroImage` — string (relative path), optional, maps from WordPress featured media
  - [ ] `url` — string, mandatory for all migrated content, absolute path with leading and trailing slash
  - [ ] `aliases` — string array, optional, values must exist in `migration/url-manifest.json` as legacy URLs
  - [ ] `canonical` — string, optional override, must be absolute HTTPS `https://www.rhino-inquisitor.com/...` when present
  - [ ] `draft` — boolean, required, default `true` until production review
- [ ] All recommended front matter fields are enumerated:
  - [ ] `slug` — string, optional, explicit slug override
  - [ ] `author` — string, optional, maps from WordPress post author
  - [ ] `seo` object fields defined: `noindex` (bool), `ogImage` (string), `twitterCard` (string)
- [ ] `url` normalization rules are documented and approved:
  - [ ] Leading slash required
  - [ ] Trailing slash required
  - [ ] Lowercase only (a–z, 0–9, hyphens, slashes)
  - [ ] No query strings or fragments in `url` value
- [ ] Production build exclusion rules are documented:
  - [ ] `draft: true` pages excluded from production build output and sitemap
  - [ ] Production builds never use `--buildDrafts`, `--buildFuture`, or `--buildExpired`
- [ ] `aliases` governance rule is documented: any alias value must map to a known legacy URL in `migration/url-manifest.json`; arbitrary aliases are prohibited
- [ ] `canonical` override rule is documented: defaults to rendered page absolute URL; per-page override must be absolute HTTPS only
- [ ] Field-to-WordPress-source mapping table is approved
- [ ] Content model contract is recorded in the Outcomes section and referenced from `analysis/plan/details/phase-2.md`

---

### Tasks

- [ ] Review `analysis/plan/details/phase-2.md` §Workstream B with migration owner and SEO owner
- [ ] Enumerate all mandatory fields with their WordPress export field mappings (WXR field names)
- [ ] Enumerate all recommended/optional fields
- [ ] Draft `url` normalization rules; validate against examples from `migration/url-manifest.json`
- [ ] Define the `aliases` governance rule and confirm with SEO owner that it aligns with redirect strategy (RHI-013)
- [ ] Define the `canonical` default and override behavior; confirm with SEO owner
- [ ] Define the `draft` lifecycle rule: when is `draft: false` set? Who approves? What is the default for migrated content?
- [ ] Define the `seo` object shape: field names, types, and when each field takes precedence over defaults
- [ ] Build the field-to-WordPress-source mapping table (front matter field → WXR element path)
- [ ] Review the draft contract with SEO owner for SEO correctness
- [ ] Review the draft contract with engineering owner for technical feasibility in Hugo templates
- [ ] Resolve any conflicts between SEO requirements and Hugo template conventions
- [ ] Record approved contract in Outcomes
- [ ] Update `analysis/plan/details/phase-2.md` to reflect approved content model

---

### Out of Scope

- Writing the front matter validation script (Phase 3)
- Writing the WordPress-to-Markdown conversion pipeline (Phase 4)
- Migrating any individual content file
- Designing Hugo template partials (Phase 3)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-010 Done — Phase 2 kickoff and decision owners confirmed | Ticket | Pending |
| RHI-003 Done — URL invariant policy approved (url normalization baseline) | Ticket | Pending |
| `migration/url-manifest.json` committed — needed to validate aliases governance rule | Phase | Pending |
| SEO owner available to approve canonical and metadata field rules | Access | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| WordPress export fields do not cleanly map to required front matter | Medium | High | Audit WXR schema against required fields during this ticket; flag gaps before Phase 4 pipeline is written | Migration Owner |
| `url` normalization rule conflicts with legacy URL shape | Low | High | Validate normalization rule against the full `url-manifest.json` inventory; log exceptions before approving | Migration Owner |
| `aliases` scope creep — team adds arbitrary aliases not in manifest | Medium | Medium | Document governance rule explicitly; front matter validation script (Phase 3) must reject unmapped aliases | SEO Owner |
| `draft` default not enforced leads to unreviewed content in production | Medium | High | Default is `true`; conversion pipeline must set `draft: true` on all output; Phase 3 validator checks this | Engineering Owner |
| Conflicting `canonical` handling between templates and front matter override | Low | Medium | Define explicit precedence rule in this ticket; template partial must honor per-page override | Engineering Owner |

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

- Approved front matter field contract (recorded in this ticket's Outcomes)
- Field-to-WordPress-source mapping table
- Updated `analysis/plan/details/phase-2.md` §Workstream B

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- The `url` field is the single most important contract item. Every URL routing decision in Phase 3 and Phase 4 depends on it being correct and consistently normalized. Treat any ambiguity here as a Critical risk.
- Coordinate with RHI-013 on `aliases` values — the redirect contract and the content model contract must be consistent.
- WXR field reference: `analysis/plan/details/phase-2.md` §Workstream B; Hugo front matter reference: https://gohugo.io/content-management/front-matter/
