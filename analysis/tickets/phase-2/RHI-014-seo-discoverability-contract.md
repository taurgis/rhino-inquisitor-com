## RHI-014 · Workstream D — SEO and Discoverability Contract

**Status:** Done  
**Priority:** High  
**Estimate:** M  
**Phase:** 2  
**Assigned to:** SEO Owner  
**Target date:** 2026-03-20  
**Created:** 2026-03-07  
**Updated:** 2026-03-09

---

### Goal

Define and approve the complete SEO and discoverability obligations for every Hugo template type so Phase 3 can implement them without ambiguity. This contract specifies which metadata tags, structured data blocks, sitemap behavior, and `robots.txt` policy must be produced for each indexable page type. Phase 3 template authors must be able to implement partials from this specification alone — no guesswork.

The contract must also explicitly address how robots and sitemap interact, ensuring draft pages and redirect helpers are excluded from both. Any SEO regression introduced by gaps in this contract will not be detected until Phase 8 (launch readiness), when remediation is expensive.

---

### Acceptance Criteria

- [x] Required HTML metadata for each template type is defined:
  - [x] Unique `<title>` tag — max 60 characters recommended
  - [x] Unique `<meta name="description">` — 120–155 characters
  - [x] `<link rel="canonical">` — absolute HTTPS URL matching the page's `.Permalink`
  - [x] `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:type">`, `<meta property="og:url">`, `<meta property="og:image">`
  - [x] Twitter card tags are documented as best-effort, non-blocking compatibility tags using the same resolved title/description/image inputs as Open Graph
- [x] JSON-LD structured data obligations are defined per template type:
  - [x] Article pages: `BlogPosting` schema with repo-required properties `headline`, `image`, `datePublished`, `dateModified`, `author`
  - [x] Site-level: `WebSite` schema emitted on homepage only
  - [x] Navigation hierarchy pages (category/taxonomy and pages that render a real breadcrumb trail): `BreadcrumbList` schema with required `item`, `name`, `position` properties
  - [x] List pages: no `BlogPosting`; `BreadcrumbList` only where applicable
- [x] All string values in JSON-LD must be processed through Hugo `jsonify`; this is documented as a hard coding requirement
- [x] Partial architecture is confirmed: all SEO meta generation lives in `layouts/partials/seo/`; no duplication across templates
- [x] Named partials are defined:
  - [x] `layouts/partials/seo/head-meta.html` — title, description, canonical, robots meta
  - [x] `layouts/partials/seo/open-graph.html` — OG tags and Twitter compatibility tags
  - [x] `layouts/partials/seo/json-ld-article.html` — `BlogPosting` schema
  - [x] `layouts/partials/seo/json-ld-site.html` — `WebSite` schema
  - [x] `layouts/partials/seo/json-ld-breadcrumb.html` — `BreadcrumbList` schema
- [x] Sitemap policy is approved:
  - [x] Sitemap generated from built pages only (Hugo embedded sitemap baseline)
  - [x] Draft pages excluded from sitemap (confirmed by `draft: true` build exclusion from RHI-012)
  - [x] Alias/redirect pages excluded from sitemap by verified implementation rule; Phase 3 must not assume an unvalidated Hugo default
  - [x] Sitemap URL matches canonical: `https://www.rhino-inquisitor.com/sitemap.xml`
- [x] `robots.txt` policy is approved:
  - [x] Hugo robots template output is the approved mechanism (`enableRobotsTXT = true` with repo-owned `layouts/robots.txt`)
  - [x] `Sitemap:` directive included pointing to canonical sitemap URL
  - [x] `robots.txt` never used as sole mechanism for de-indexing; paired with `<meta name="robots" content="noindex">` where applicable
  - [x] Staging/preview environments must set `noindex` meta tag, not only robots.txt Disallow
- [x] Template type matrix is approved (list of template types and their SEO obligations)
- [x] Contract is recorded in Outcomes and referenced from `analysis/plan/details/phase-2.md`

---

### Tasks

- [x] Review `analysis/plan/details/phase-2.md` §Workstream D with SEO owner and engineering owner
- [x] Define the full list of Hugo template types for this site:
  - Article/post single page
  - Standard page single
  - Category term page
  - Video page (`/video/` preserved page route)
  - Homepage / site index
  - Approved pagination pages retained by RHI-013 policy
  - Tag list page default-retired unless an explicit future exception is approved
  - Search results page if a production search feature is later validated
  - 404 error page (not indexed)
  - Alias redirect page (not indexed)
- [x] For each template type, define required metadata (title, description, canonical, OG, Twitter compatibility tags)
- [x] Define JSON-LD schema requirements per template type
  - [x] Confirm `BlogPosting` as the article-page default with SEO owner
  - [x] Define required and recommended schema properties for each type
  - [x] Document the `jsonify` requirement for all string values
- [x] Confirm partial architecture — all SEO logic in `layouts/partials/seo/`; single source of truth
- [x] Define the five named SEO partials listed in Acceptance Criteria; document their expected inputs (page context, site config, resolved SEO context)
- [x] Define sitemap policy:
  - [x] Use Hugo embedded sitemap generation as the baseline
  - [x] Require explicit exclusion for any built non-indexable page (`seo.noindex`, alias helpers, 404, search results)
  - [x] Confirm sitemap URL
- [x] Define `robots.txt` policy:
  - [x] Evaluate Hugo robots template vs. static `static/robots.txt`
  - [x] Choose Hugo robots template output with repo-owned `layouts/robots.txt`
  - [x] Draft production `robots.txt` content and required directives
  - [x] Confirm staging noindex strategy
- [x] Confirm `.Permalink` (not `.RelPermalink`) for all canonical and OG URL generation; document this as a coding rule
- [x] Build the template type SEO matrix; circulate for SEO owner and engineering owner approval
- [x] Record approved contract in Outcomes
- [x] Update `analysis/plan/details/phase-2.md` §Workstream D

---

### Out of Scope

- Implementing any partial or template file (Phase 3)
- Validating structured data with Google Rich Results Test (Phase 3 validation gate)
- Writing CSS, JS, or visual design for metadata display
- AMP or non-standard social platform integrations not listed above

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-010 Done — Phase 2 kickoff and decision owners confirmed | Ticket | Done |
| RHI-011 Done — generator layout confirmed (partials directory confirmed) | Ticket | Done |
| RHI-013 Done — canonical URL shape, sitemap host, route policy, and tag default-retirement confirmed | Ticket | Done |
| `migration/phase-1-seo-baseline.md` — reviewed for structured data and discoverability baseline preservation | Phase | Done |
| SEO owner available to approve all metadata and schema decisions | Access | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Structured data schema incomplete for article pages — breaks Rich Results eligibility | Medium | High | Use Google's recommended `BlogPosting` property list as a checklist; validate against Rich Results Test in Phase 3 | SEO Owner |
| Canonical URL generation uses `.RelPermalink` instead of `.Permalink` — produces relative canonical tags | Medium | High | Document `.Permalink` as the required function in this contract; Phase 3 code review enforces it | Engineering Owner |
| `robots.txt` Disallow rule accidentally blocks production content | Low | High | Draft robots.txt in this ticket; review against sitemap URL list from Phase 1; test in staging before deploy | SEO Owner |
| Alias redirect pages indexed by Google because they lack noindex | Medium | Medium | Hugo alias pages do not include `<meta name="robots" content="noindex">` by default; document custom template override as a Phase 3 requirement | Engineering Owner |
| Twitter card tag requirements change post-launch | Low | Low | Mark Twitter card as best-effort and non-blocking in the contract; prioritize OG tags | SEO Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Completed. Workstream D is now the approved Phase 2 SEO and discoverability contract for Phase 3 template implementation, Phase 5 SEO governance, and downstream launch-validation gates.

Approved decisions:

- All SEO metadata generation is centralized under `layouts/partials/seo/`. Leaf templates must pass page context into shared partials rather than duplicate canonical, Open Graph, or schema logic.
- Canonical and Open Graph URLs must use `.Permalink`; `.RelPermalink` is prohibited for canonical and `og:url` generation.
- Twitter card tags remain part of the contract, but they are best-effort compatibility tags and are non-blocking for closeout if platform expectations change. Open Graph tags remain the blocking social-preview baseline.
- `BlogPosting` is the approved article schema type for migrated article/post pages. The contract requires `headline`, `image`, `datePublished`, `dateModified`, and `author`, with canonical URL alignment enforced in Phase 3 validation.
- `WebSite` JSON-LD is limited to the homepage. `BreadcrumbList` applies only where the rendered page exposes a real breadcrumb trail; list, taxonomy, pagination, 404, and alias pages must never emit `BlogPosting`.
- All string values inside JSON-LD must be piped through Hugo `jsonify`. This is a hard security and correctness rule, not a style preference.
- The approved metadata fallback order is:
  - description: front matter `description` from RHI-012; no indexable page may ship without one;
  - social image: `seo.ogImage`, then `heroImage`, then an approved site-level default social image;
  - Twitter card type: explicit `seo.twitterCard` when present, otherwise derive from image availability (`summary_large_image` when an image resolves, else `summary`).
- Tag archives remain retired by default per RHI-013 and are not part of the default public indexable template set. Any future indexed tag exception must be explicitly approved and reflected in the manifest and template matrix.

Approved template type SEO matrix:

| Template type | Indexable | Sitemap | Required metadata | Structured data | Notes |
|---------------|-----------|---------|-------------------|-----------------|-------|
| Homepage | Yes | Yes | `title`, `description`, canonical, OG baseline, Twitter best-effort | `WebSite` | `og:type=website` |
| Article/post single | Yes | Yes | `title`, `description`, canonical, OG baseline, Twitter best-effort | `BlogPosting`; `BreadcrumbList` when a real hierarchy is rendered | Primary article rich-result surface |
| Standard page single | Yes | Yes | `title`, `description`, canonical, OG baseline, Twitter best-effort | `BreadcrumbList` only when a real hierarchy is rendered | No article schema by default |
| `/video/` page | Yes | Yes | `title`, `description`, canonical, OG baseline, Twitter best-effort | `BreadcrumbList` when a real hierarchy is rendered | Preserved page route from RHI-013; not a `VideoObject` contract |
| Category term page | Yes | Yes | `title`, `description`, canonical, OG baseline, Twitter best-effort | `BreadcrumbList` | No `BlogPosting` |
| Approved pagination page (`/page/{n}/` or preserved category pagination) | Yes only when retained by RHI-013 policy | Yes only when retained | `title`, `description`, canonical, OG baseline, Twitter best-effort | `BreadcrumbList` only when a real hierarchy is rendered | Self-canonical; never canonicalize page 2+ to page 1 |
| Tag page | No by default | No | `noindex` only if ever rendered for an exception workflow | None by default | Retired unless a later manifest-backed exception is approved |
| Search results page | No | No | `noindex`; no social requirements | None | Only relevant if a production search feature is later introduced |
| 404 page | No | No | `noindex`; minimal metadata only | None | Never indexable |
| Alias redirect helper | No | No | canonical to destination, `noindex`, no social requirements | None | Custom alias template required in Phase 3 |

Approved SEO partial contracts:

| Partial | Expected inputs | Required output |
|---------|-----------------|-----------------|
| `layouts/partials/seo/head-meta.html` | page context, resolved title, resolved description, resolved canonical, indexability flag | `<title>`, meta description, canonical, robots meta |
| `layouts/partials/seo/open-graph.html` | page context, resolved title, resolved description, resolved canonical, resolved absolute image URL, content classification | Open Graph baseline plus Twitter compatibility tags |
| `layouts/partials/seo/json-ld-article.html` | article page context, resolved headline, description, image, author, publish date, modify date, canonical URL | `BlogPosting` JSON-LD only on article/post singles |
| `layouts/partials/seo/json-ld-site.html` | homepage context, site title, site description, canonical host | `WebSite` JSON-LD on homepage only |
| `layouts/partials/seo/json-ld-breadcrumb.html` | page context plus an explicit breadcrumb list | `BreadcrumbList` JSON-LD only when the UI exposes a real breadcrumb hierarchy |

Phase 3 may introduce an internal helper partial to resolve the SEO context once per page, but these five named output partials are mandatory and remain the public contract.

Approved sitemap policy:

- Use Hugo embedded sitemap generation as the baseline starting point for the monolingual site.
- Draft pages remain excluded because production builds do not enable draft/future/expired output.
- Any built page that is non-indexable must also be explicitly excluded from sitemap output; `seo.noindex` alone is not assumed to change sitemap membership.
- Alias redirect helper pages must be verified absent from the built sitemap. If Hugo default behavior does not guarantee that exclusion, Phase 3 must override the sitemap template to enforce it.
- Canonical sitemap URL is fixed at `https://www.rhino-inquisitor.com/sitemap.xml`.

Approved `robots.txt` policy:

- Production `robots.txt` is implemented via Hugo output (`enableRobotsTXT = true`) with a repo-owned `layouts/robots.txt` template.
- `robots.txt` must include the canonical sitemap directive and must not block the canonical feed route approved in RHI-013.
- `robots.txt` is crawl control only; it is never the sole de-indexing mechanism.
- Staging and preview environments must emit `<meta name="robots" content="noindex">` on every rendered page even if robots rules also differ by environment.

Required production `robots.txt` baseline:

```text
User-agent: *
Allow: /
Disallow: /wp-json/
Disallow: /xmlrpc.php
Disallow: /author/
Sitemap: https://www.rhino-inquisitor.com/sitemap.xml
```

**Delivered artefacts:**

- Approved template type SEO matrix (recorded in this ticket's Outcomes)
- Named SEO partial specifications and input contracts
- `robots.txt` policy and production baseline content
- Updated `analysis/plan/details/phase-2.md` §Workstream D
- Documentation note: `analysis/documentation/phase-2/rhi-014-seo-discoverability-contract-2026-03-09.md`

**Deviations from plan:**

- Twitter card tags remain in scope but are now explicitly best-effort/non-blocking rather than release-blocking requirements.
- Alias/redirect sitemap exclusion is treated as a verified Phase 3 implementation rule rather than an assumed Hugo default, because the official docs do not guarantee it implicitly.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-09 | In Progress | Reconciled Workstream D against RHI-012 front matter rules, RHI-013 route/redirect outcomes, the Phase 1 SEO baseline, Hugo specialist guidance, and current official Hugo and Google Search documentation |
| 2026-03-09 | In Progress | Owner decisions resolved for the remaining open policy points: `BlogPosting` is the article schema default, `robots.txt` uses Hugo template output, tag pages remain retired by default, and Twitter card tags are best-effort/non-blocking |
| 2026-03-09 | Done | All acceptance criteria satisfied; template obligations, partial contracts, sitemap policy, robots policy, and indexability rules are now locked for Phase 3 implementation and downstream validation work |

---

### Notes

- The `jsonify` requirement for JSON-LD is a security rule, not a style preference. Unescaped user-controlled strings in a `<script>` block can produce malformed JSON or, in adversarial cases, injection. Never skip this.
- `partialCached` should be considered for site-level partials (WebSite schema, robots meta for non-page contexts) to reduce render time on large sites.
- Reference: `analysis/plan/details/phase-2.md` §Workstream D
- Reference: https://gohugo.io/templates/sitemap/ (Hugo sitemap)
- Reference: https://gohugo.io/templates/robots/ (Hugo robots template)
- Reference: https://gohugo.io/content-management/urls/ (Hugo aliases and URL management)
- Reference: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls (Google canonical guidance)
- Reference: https://developers.google.com/search/docs/crawling-indexing/block-indexing (Google noindex guidance)
- Reference: https://developers.google.com/search/docs/appearance/structured-data/article (Google Article and BlogPosting guidance)
- Reference: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb (Google BreadcrumbList guidance)
- Reference: https://developers.google.com/search/docs/appearance/site-names (Google homepage WebSite guidance)
