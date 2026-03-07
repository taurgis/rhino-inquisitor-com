## RHI-014 · Workstream D — SEO and Discoverability Contract

**Status:** Open  
**Priority:** High  
**Estimate:** M  
**Phase:** 2  
**Assigned to:** SEO Owner  
**Target date:** 2026-03-20  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Define and approve the complete SEO and discoverability obligations for every Hugo template type so Phase 3 can implement them without ambiguity. This contract specifies which metadata tags, structured data blocks, sitemap behavior, and `robots.txt` policy must be produced for each indexable page type. Phase 3 template authors must be able to implement partials from this specification alone — no guesswork.

The contract must also explicitly address how robots and sitemap interact, ensuring draft pages and redirect helpers are excluded from both. Any SEO regression introduced by gaps in this contract will not be detected until Phase 8 (launch readiness), when remediation is expensive.

---

### Acceptance Criteria

- [ ] Required HTML metadata for each template type is defined:
  - [ ] Unique `<title>` tag — max 60 characters recommended
  - [ ] Unique `<meta name="description">` — 120–155 characters
  - [ ] `<link rel="canonical">` — absolute HTTPS URL matching the page's `.Permalink`
  - [ ] `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:type">`, `<meta property="og:url">`, `<meta property="og:image">`
  - [ ] Twitter card tags: `<meta name="twitter:card">`, `<meta name="twitter:title">`, `<meta name="twitter:description">`, `<meta name="twitter:image">`
- [ ] JSON-LD structured data obligations are defined per template type:
  - [ ] Article pages: `BlogPosting` (or `Article`) schema with `headline`, `image`, `datePublished`, `dateModified`, `author`
  - [ ] Site-level: `WebSite` schema emitted on homepage
  - [ ] Navigation hierarchy pages (category/taxonomy): `BreadcrumbList` schema with required `item`, `name`, `position` properties
  - [ ] List pages: no `BlogPosting`; `BreadcrumbList` only where applicable
- [ ] All string values in JSON-LD must be processed through Hugo `jsonify`; this is documented as a hard coding requirement
- [ ] Partial architecture is confirmed: all SEO meta generation lives in `layouts/partials/seo/`; no duplication across templates
- [ ] Named partials are defined:
  - [ ] `layouts/partials/seo/head-meta.html` — title, description, canonical
  - [ ] `layouts/partials/seo/open-graph.html` — OG and Twitter card tags
  - [ ] `layouts/partials/seo/json-ld-article.html` — BlogPosting/Article schema
  - [ ] `layouts/partials/seo/json-ld-site.html` — WebSite schema
  - [ ] `layouts/partials/seo/json-ld-breadcrumb.html` — BreadcrumbList schema
- [ ] Sitemap policy is approved:
  - [ ] Sitemap generated from built pages only (Hugo default behavior)
  - [ ] Draft pages excluded from sitemap (confirmed by `draft: true` build exclusion from RHI-012)
  - [ ] Alias/redirect pages excluded from sitemap
  - [ ] Sitemap URL matches canonical: `https://www.rhino-inquisitor.com/sitemap.xml`
- [ ] `robots.txt` policy is approved:
  - [ ] Either Hugo robots template output or controlled static file — decision recorded and justified
  - [ ] `Sitemap:` directive included pointing to canonical sitemap URL
  - [ ] `robots.txt` never used as sole mechanism for de-indexing; paired with `<meta name="robots" content="noindex">` where applicable
  - [ ] Staging/preview environments must set `noindex` meta tag, not only robots.txt Disallow
- [ ] Template type matrix is approved (list of template types and their SEO obligations)
- [ ] Contract is recorded in Outcomes and referenced from `analysis/plan/details/phase-2.md`

---

### Tasks

- [ ] Review `analysis/plan/details/phase-2.md` §Workstream D with SEO owner and engineering owner
- [ ] Define the full list of Hugo template types for this site:
  - Article/post single page
  - Category list page
  - Video list page
  - Homepage / site index
  - Tag list page (if indexed)
  - 404 error page (not indexed)
  - Alias redirect page (not indexed)
- [ ] For each template type, define required metadata (title, description, canonical, OG, Twitter card)
- [ ] Define JSON-LD schema requirements per template type
  - Confirm `BlogPosting` vs. `Article` choice with SEO owner
  - Define required and recommended schema properties for each type
  - Document the `jsonify` requirement for all string values
- [ ] Confirm partial architecture — all SEO logic in `layouts/partials/seo/`; single source of truth
- [ ] Define the five named SEO partials listed in Acceptance Criteria; document their expected inputs (page context, site config, etc.)
- [ ] Define sitemap policy:
  - Confirm Hugo automatic sitemap generation is used (not a custom template) or document override requirement
  - Confirm exclusion behavior for drafts and alias pages
  - Confirm sitemap URL
- [ ] Define `robots.txt` policy:
  - Evaluate: Hugo robots template vs. static `static/robots.txt`
  - Decision: document chosen approach with rationale
  - Draft `robots.txt` content (Disallow rules, Sitemap directive, crawler-specific rules if any)
  - Confirm staging noindex strategy
- [ ] Confirm `.Permalink` (not `.RelPermalink`) for all canonical and OG URL generation; document this as a coding rule
- [ ] Build the template type SEO matrix; circulate for SEO owner and engineering owner approval
- [ ] Record approved contract in Outcomes
- [ ] Update `analysis/plan/details/phase-2.md` §Workstream D

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
| RHI-010 Done — Phase 2 kickoff and decision owners confirmed | Ticket | Pending |
| RHI-011 In Progress — generator layout confirmed (partials directory confirmed) | Ticket | Pending |
| RHI-013 In Progress — canonical URL shape and trailing slash policy confirmed | Ticket | Pending |
| `migration/phase-1-seo-baseline.md` — review for existing structured data signals to preserve | Phase | Pending |
| SEO owner available to approve all metadata and schema decisions | Access | Pending |

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- Template type SEO matrix (recorded in this ticket's Outcomes)
- Named SEO partial specifications
- `robots.txt` draft content
- Updated `analysis/plan/details/phase-2.md` §Workstream D

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- The `jsonify` requirement for JSON-LD is a security rule, not a style preference. Unescaped user-controlled strings in a `<script>` block can produce malformed JSON or, in adversarial cases, injection. Never skip this.
- `partialCached` should be considered for site-level partials (WebSite schema, robots meta for non-page contexts) to reduce render time on large sites.
- Reference: `analysis/plan/details/phase-2.md` §Workstream D
- Reference: https://developers.google.com/search/docs/appearance/structured-data/article (Article schema)
- Reference: https://gohugo.io/templates/sitemap/ (Hugo sitemap)
- Reference: https://gohugo.io/templates/robots/ (Hugo robots template)
