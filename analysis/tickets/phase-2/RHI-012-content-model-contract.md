## RHI-012 · Workstream B — Content Model and Front Matter Contract

**Status:** Done  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 2  
**Assigned to:** Migration Owner  
**Target date:** 2026-03-19  
**Created:** 2026-03-07  
**Updated:** 2026-03-09

---

### Goal

Define and approve the complete front matter contract for all migrated content types so that the Phase 4 content conversion pipeline has an unambiguous output specification. Every field, its type, its source in WordPress export data, its validation rule, and its default value must be recorded here. Ambiguity in the content model at this stage propagates directly into thousands of incorrectly generated content files and broken URL routes.

The content model must also specify which fields are mandatory for production publishing, what normalization rules apply, and how `draft` status interacts with the build pipeline. This contract becomes an input to the front matter validation script (Phase 3) and the conversion pipeline (Phase 4).

---

### Acceptance Criteria

- [x] Contract scope is explicit and approved:
  - [x] Applies to migrated regular content files only: WordPress `post` and `page`
  - [x] Does not apply to `attachment` records, navigation items, or generated taxonomy/section/home/list pages
- [x] Front matter serialization format is approved and documented:
  - [x] YAML front matter is the standard for migrated content files
  - [x] Root `hugo.toml` format does not constrain content front matter format
- [x] All mandatory front matter fields are enumerated with type, purpose, and validation rule:
  - [x] `title` — string, required, maps from WordPress post/page title
  - [x] `description` — string, required for published indexable content, 120–155 chars recommended, maps from approved SEO meta when present, else excerpt/body summary fallback
  - [x] `date` — ISO 8601 datetime, required for posts, optional for pages, maps from WordPress `post_date_gmt` with `pubDate` fallback
  - [x] `lastmod` — ISO 8601 datetime, required, maps from WordPress `post_modified_gmt` with `post_date_gmt` fallback
  - [x] `categories` — string array, required and non-empty for posts, maps from WordPress category taxonomy
  - [x] `tags` — string array, required key for posts and may be empty, maps from WordPress post_tag taxonomy
  - [x] `heroImage` — string (site-root-relative asset path), optional, maps from WordPress featured media lookup
  - [x] `url` — string, mandatory for all migrated post/page content, path-only with leading and trailing slash, sourced from `migration/url-manifest.json`
  - [x] `aliases` — string array, optional, path-only, values must exist in `migration/url-manifest.json` as legacy URLs for the same target
  - [x] `canonical` — string, optional same-host override, must be absolute HTTPS `https://www.rhino-inquisitor.com/...` when present
  - [x] `draft` — boolean, required, derived from WordPress status (`publish` is the only state that maps to `draft: false`)
- [x] All recommended front matter fields are enumerated:
  - [x] `slug` — string, optional editorial override; does not control migrated routing when `url` is present
  - [x] `author` — string, optional on pages, recommended on posts, maps from WordPress `dc:creator`
  - [x] `seo` object fields defined: `noindex` (bool), `ogImage` (string), `twitterCard` (enum)
- [x] `url` source-of-truth and normalization rules are documented and approved:
  - [x] `migration/url-manifest.json` `target_url` is the source of truth for current page `url`
  - [x] Leading slash required
  - [x] Trailing slash required
  - [x] Lowercase only (`a-z`, `0-9`, hyphens, slashes)
  - [x] No query strings or fragments in `url` value
  - [x] No fallback to slug-derived routes for migrated content
- [x] Production build exclusion rules are documented:
  - [x] `draft: true` pages excluded from production build output and sitemap
  - [x] Production builds never use `--buildDrafts`, `--buildFuture`, or `--buildExpired`
- [x] `aliases` governance rule is documented: any alias value must map to a known legacy URL in `migration/url-manifest.json`; arbitrary aliases are prohibited; self-aliases and absolute URLs are prohibited
- [x] `canonical` override rule is documented: defaults to rendered page absolute URL on the canonical `www` host; per-page override must be same-host absolute HTTPS only
- [x] Field precedence and fallback rules are documented for description, author coverage, hero/OG image coverage, and canonical behavior
- [x] Field-to-WordPress-source mapping table is approved
- [x] Content model contract is recorded in the Outcomes section and referenced from `analysis/plan/details/phase-2.md`

---

### Tasks

- [x] Review `analysis/plan/details/phase-2.md` §Workstream B with migration owner and SEO owner
- [x] Enumerate all mandatory fields with their WordPress export field mappings (WXR field names)
- [x] Enumerate all recommended/optional fields
- [x] Define scope boundary for this contract (`post`/`page` content files only; attachments and generated list pages excluded)
- [x] Approve YAML as the migrated content front matter format
- [x] Draft `url` normalization rules; validate against examples from `migration/url-manifest.json`
- [x] Define the `aliases` governance rule and confirm with SEO owner that it aligns with redirect strategy (RHI-013)
- [x] Define the `canonical` default and override behavior; confirm with SEO owner
- [x] Define the `draft` lifecycle rule and align it with the source WordPress publication status model
- [x] Define the `seo` object shape: field names, types, and when each field takes precedence over defaults
- [x] Build the field-to-WordPress-source mapping table (front matter field → WXR element path)
- [x] Review the draft contract with SEO owner for SEO correctness
- [x] Review the draft contract with engineering owner for technical feasibility in Hugo templates
- [x] Resolve the Workstream B/Workstream C routing ambiguity by reserving explicit per-file `url` values for migrated post/page content and config-driven routes for generated list pages
- [x] Record approved contract in Outcomes
- [x] Update `analysis/plan/details/phase-2.md` to reflect approved content model

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
| RHI-010 Done — Phase 2 kickoff and decision owners confirmed | Ticket | Done |
| RHI-003 Done — URL invariant policy approved (url normalization baseline) | Ticket | Done |
| `migration/url-manifest.json` committed — needed to validate aliases governance rule | Phase | Done |
| SEO owner available to approve canonical and metadata field rules | Access | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| WordPress export fields do not cleanly map to required front matter | Medium | High | Audit WXR schema against required fields during this ticket; flag gaps before Phase 4 pipeline is written; use explicit fallback order where the primary source can be absent | Migration Owner |
| `url` normalization rule conflicts with legacy URL shape | Low | High | Validate normalization rule against the full `url-manifest.json` inventory; log exceptions before approving; do not allow slug-derived fallback routes | Migration Owner |
| `aliases` scope creep — team adds arbitrary aliases not in manifest | Medium | Medium | Document governance rule explicitly; front matter validation script (Phase 3) must reject unmapped aliases, absolute URLs, and self-aliases | SEO Owner |
| `draft` lifecycle drifts from source publication state | Medium | High | Derive `draft` from WordPress `wp:status`; published items render with `draft: false`, all non-published items stay `true`, and production builds still exclude all draft/future/expired items | Engineering Owner |
| Conflicting `canonical` handling between templates and front matter override | Low | Medium | Define explicit precedence rule in this ticket; template partial must honor same-host absolute override only and otherwise use the rendered page URL | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Completed. Workstream B is now the approved content model and front matter contract for migrated regular content files and is the source of truth for Phase 3 validation/archetypes and Phase 4 front matter generation.

Approved scope:

- This contract applies to migrated WordPress `post` and `page` records that will become Hugo content files.
- This contract does not apply to `attachment` items, media assets, `nav_menu_item` records, or generated home/section/taxonomy/term/list pages. Those are handled by media tooling, Hugo configuration, and template contracts.

Approved front matter format and repo convention:

- YAML front matter is the standard serialization format for migrated content files.
- The root `hugo.toml` configuration format does not constrain content front matter format.
- To preserve continuity with the existing Phase 3 and Phase 4 ticket set, the repo keeps `heroImage`, `canonical`, and `seo` as repo-approved top-level custom fields rather than moving them under `params` in this phase.

Approved contract rules:

- `migration/url-manifest.json` `target_url` is the source of truth for each migrated content file `url`.
- Migrated content never derives a route from `slug`; `slug` is optional editorial metadata only when `url` is already explicit.
- `url` values are path-only, monolingual, lowercase, and must match `^/[a-z0-9\-/]+/$` with no query strings or fragments.
- `aliases` values are path-only, site-relative legacy URLs from `migration/url-manifest.json` for the same target URL. They must start and end with `/`, must not duplicate `url`, and must not be absolute URLs.
- `canonical` defaults to the rendered page absolute URL on `https://www.rhino-inquisitor.com/`. A front matter override is allowed only for same-host absolute HTTPS consolidation cases approved by SEO review.
- `draft` is derived from WordPress publication state: `publish` maps to `draft: false`; `draft`, `private`, `pending`, and `future` map to `draft: true`; `trash` is excluded from migration output.
- Production builds must continue to exclude all draft, future, and expired content and must never use `--buildDrafts`, `--buildFuture`, or `--buildExpired`.
- `heroImage` and `seo.ogImage` store site-root-relative asset paths beginning with `/`; the render layer converts them to absolute canonical-host URLs when required for OG/Twitter tags.
- `seo.noindex: true` is allowed only for explicitly non-indexable pages or approved archive exceptions and requires exclusion from sitemap.
- `seo.twitterCard` is constrained to `summary` or `summary_large_image`.
- Published posts must resolve to an author value at render time. If a migrated file omits `author`, the downstream SEO/template contract must supply the approved site-level fallback rather than render an empty author signal.

Approved field-to-WordPress-source mapping:

| Field | Applies To | Type | Required | WordPress source / fallback | Validation / notes |
|-------|------------|------|----------|-----------------------------|--------------------|
| `title` | post, page | string | Yes | `item/title` | Non-empty; preserve visible title text |
| `description` | post, page | string | Yes for published indexable content | Approved SEO meta from `item/wp:postmeta` when captured in export, else `item/excerpt:encoded`, else first meaningful paragraph from `item/content:encoded` stripped to plain text and trimmed to 155 chars | Never empty for published indexable content |
| `date` | post (required), page (optional) | ISO 8601 UTC string | Post: Yes; Page: No | `item/wp:post_date_gmt`, fallback `item/pubDate` | Use explicit UTC serialization |
| `lastmod` | post, page | ISO 8601 UTC string | Yes | `item/wp:post_modified_gmt`, fallback `item/wp:post_date_gmt` | Required on all migrated content files |
| `categories` | post | string[] | Yes, non-empty | `item/category[@domain='category']` display names | Omit on pages |
| `tags` | post | string[] | Yes, key required; array may be empty | `item/category[@domain='post_tag']` display names | Omit on pages |
| `heroImage` | post, page | string | No | `item/wp:postmeta[_thumbnail_id]` -> attachment map -> `wp:attachment_url` or `_wp_attached_file` -> relinked site asset path | Site-root-relative path such as `/images/posts/slug/hero.webp` |
| `url` | post, page | string | Yes | `migration/url-manifest.json` `target_url` for the matched source record | Never derived from `slug` |
| `aliases` | post, page | string[] | No | `migration/url-manifest.json` legacy URLs that map to the same `target_url` and differ from `url` | Path-only; no self-aliases; no absolute URLs |
| `canonical` | post, page | string | No | No core WXR source; set only when migration/SEO review requires explicit consolidation | Same-host absolute HTTPS only |
| `draft` | post, page | boolean | Yes | `item/wp:status` | `publish` is the only retained state that maps to `draft: false`; all others stay `true` |
| `slug` | post, page | string | No | `item/wp:post_name` when present | Optional editorial metadata; not a route source for migrated content |
| `author` | post, page | string | No | `item/dc:creator` | Recommended on posts; optional on pages |
| `seo.noindex` | post, page | boolean | No | Approved SEO postmeta key when captured, else omitted | Requires sitemap exclusion when `true` |
| `seo.ogImage` | post, page | string | No | Approved SEO postmeta key when captured, else fallback to `heroImage` | Site-root-relative path |
| `seo.twitterCard` | post, page | string | No | Approved SEO postmeta key when captured, else derived by render layer from image presence | Allowed values: `summary`, `summary_large_image` |

Approved example blocks:

```yaml
---
title: Article title
description: Unique meta description for search and sharing.
date: 2024-01-15T09:00:00Z
lastmod: 2024-06-01T12:00:00Z
categories:
  - SFCC
tags:
  - B2C Commerce
heroImage: /images/posts/article-title/hero.webp
url: /article-title/
author: Thomas Theunen
draft: false
seo:
  noindex: false
  ogImage: /images/posts/article-title/og.webp
  twitterCard: summary_large_image
---
```

```yaml
---
title: About
description: Background and context for Rhino Inquisitor.
lastmod: 2024-06-01T12:00:00Z
url: /about/
draft: false
---
```

**Delivered artefacts:**

- Approved front matter field contract (recorded in this ticket's Outcomes)
- Field-to-WordPress-source mapping table
- Updated `analysis/plan/details/phase-2.md` §Workstream B
- Documentation note: `analysis/documentation/rhi-012-content-model-contract-2026-03-09.md`
- Phase 2 tracking updates in the ticket indexes and sign-off checklist

**Deviations from plan:**

- The original ticket said migrated content should default to `draft: true` until production review. The approved contract instead derives `draft` from WordPress publication status to stay consistent with downstream Phase 3/4 validation and mapping tickets.
- The original Phase 2 plan described per-page `url` overrides as exception-oriented in Workstream C. The approved contract resolves this by distinguishing migrated regular content (explicit `url` required) from generated list/taxonomy pages (config-driven routing).

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-09 | In Progress | Reviewed Workstream B against the Phase 2 plan, Phase 1 URL invariant policy, content-migration references, Hugo specialist guidance, SEO guidance, and official Hugo documentation for front matter, URLs, build options, cascade, and sitemap behavior |
| 2026-03-09 | Done | Approved the migrated content contract: posts/pages only, YAML front matter, manifest-driven `url`, path-only manifest-backed `aliases`, status-derived `draft`, and explicit field precedence/mapping rules; updated the Phase 2 plan and tracking artifacts |

---

### Notes

- The `url` field is the single most important contract item. Every URL routing decision in Phase 3 and Phase 4 depends on it being correct and consistently normalized. Treat any ambiguity here as a Critical risk.
- Coordinate with RHI-013 on `aliases` values — the redirect contract and the content model contract must be consistent.
- The repo deliberately retains top-level custom fields (`heroImage`, `canonical`, `seo`) in this phase because the downstream Phase 3 and Phase 4 tickets already depend on those names; revisit only if a later cross-phase contract update is approved.
- WXR field reference: `analysis/plan/details/phase-2.md` §Workstream B; Hugo front matter reference: https://gohugo.io/content-management/front-matter/
- Official references used during approval: https://gohugo.io/content-management/front-matter/, https://gohugo.io/content-management/urls/, https://gohugo.io/content-management/build-options/, https://gohugo.io/configuration/front-matter/, https://gohugo.io/configuration/cascade/, https://gohugo.io/templates/sitemap/
