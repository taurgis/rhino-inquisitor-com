## RHI-023 · Workstream D — Template Scaffolding and Rendering Model

**Status:** Done  
**Priority:** Critical  
**Estimate:** L  
**Phase:** 3  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-01  
**Created:** 2026-03-07  
**Updated:** 2026-03-09

---

### Goal

Establish a complete, maintainable template hierarchy before bulk content migration begins. All primary page types (article, page, home, archive, category) must render with shared metadata and layout primitives so that SEO signals, accessibility structure, and rendering behavior are consistent across the site. Centralizing metadata generation in shared partials — rather than duplicating it per template — prevents the canonical/metadata drift that would require expensive rework in later phases.

---

### Acceptance Criteria

- [x] `src/layouts/_default/baseof.html` exists and defines named blocks for:
  - [x] `{{ block "head" . }}` — for `<head>` content including meta and SEO partials
  - [x] `{{ block "main" . }}` — for primary page content
  - [x] `{{ block "scripts" . }}` — for footer scripts
- [x] All leaf templates extend `baseof.html` via `{{ define "main" }}` — no standalone HTML boilerplate in individual templates
- [x] Partial architecture is implemented with SEO-critical partials in `src/layouts/partials/seo/`, aligned to the approved RHI-014 contract:
  - [x] `head-meta.html` — global head metadata (`<title>`, `<meta name="description">`, canonical, viewport, charset, robots)
  - [x] `open-graph.html` — `og:title`, `og:description`, `og:type`, `og:url`, `og:image`, plus Twitter/X compatibility tags
  - [x] `json-ld-article.html` — `BlogPosting` JSON-LD (for article templates only)
  - [x] `json-ld-site.html` — `WebSite` JSON-LD for the homepage, called with `partialCached`
  - [x] `json-ld-breadcrumb.html` — `BreadcrumbList` JSON-LD where the UI exposes breadcrumbs
  - [x] Internal helper partial(s) may be used inside `src/layouts/partials/seo/` to keep metadata resolution centralized
- [x] HTML breadcrumb markup is implemented separately in `src/layouts/partials/breadcrumbs.html`
- [x] Section and taxonomy templates exist for the approved public page kinds in this repo:
  - [x] `src/layouts/home.html` — homepage
  - [x] `src/layouts/_default/single.html` — unified article/page detail
  - [x] `src/layouts/_default/list.html` — section and archive list fallback
  - [x] `src/layouts/_default/taxonomy.html` — category taxonomy root page
  - [x] `src/layouts/_default/term.html` — individual category term page
- [x] Public tag archives are not reintroduced: category remains the only public taxonomy in the scaffold, matching RHI-013 and `hugo.toml`
- [x] The preserved `/video/` route is handled by the standard page/single template chain; no dedicated `src/layouts/videos/single.html` is required unless a future explicit `layout` or `type` override is introduced
- [x] Pagination partial exists and list/term templates paginate via Hugo's built-in paginator once per page
- [x] JSON-LD is emitted from Hugo dict/object structures encoded with `jsonify`
- [x] No template uses `.RelPermalink` to generate canonical or OG URLs — `.Permalink` is used exclusively
- [x] `hugo --minify --environment production` exits with code 0 after templates are added
- [x] Current missing-layout warnings for `home` and `taxonomy` are cleared
- [x] No template relies on undocumented implicit Hugo defaults in the delivered scaffold

---

### Tasks

- [x] Reconcile RHI-023 with the approved RHI-013 and RHI-014 contracts before implementation
- [x] Create `src/layouts/_default/baseof.html` with `head`, `main`, and `scripts` block definitions
- [x] Create `src/layouts/partials/seo/head-meta.html`:
  - [x] `<title>` from a centralized SEO resolver
  - [x] `<meta name="description">` from front matter `description` with safe repo-level fallback
  - [x] viewport, charset, canonical, and robots meta tags
  - [x] Include all other SEO partials from this partial to keep `baseof.html` clean
- [x] Create a shared metadata resolver in `src/layouts/partials/seo/` so head, OG, and schema partials use one source of truth
- [x] Create `src/layouts/partials/seo/open-graph.html`:
  - [x] `og:title`, `og:description`, `og:type`, `og:url` (using `.Permalink`), `og:image`
  - [x] Twitter/X compatibility tags using the same resolved inputs
  - [x] `seo.ogImage` override, then `heroImage`, then empty-image fallback
- [x] Create `src/layouts/partials/seo/json-ld-article.html`:
  - [x] `BlogPosting` schema with `headline`, `datePublished`, `dateModified`, `description`, `url`, `author`
  - [x] Emit JSON via Hugo dict/object + `jsonify`
  - [x] Guard with `{{ if eq .Type "posts" }}` so it does not emit on list/taxonomy pages
- [x] Create `src/layouts/partials/seo/json-ld-site.html`:
  - [x] `WebSite` schema with site name, URL, and description
  - [x] Use `partialCached` when called from templates (site-level context only)
- [x] Create `src/layouts/partials/seo/json-ld-breadcrumb.html` plus `src/layouts/partials/breadcrumbs.html`:
  - [x] `BreadcrumbList` JSON-LD
  - [x] HTML breadcrumb markup with `aria-label="Breadcrumb"`
- [x] Create `src/layouts/home.html` (homepage): extend `baseof.html`, emit `json-ld-site`, list recent content and categories
- [x] Create `src/layouts/_default/single.html` (article/page): extend `baseof.html`, emit `json-ld-article` when applicable, render breadcrumbs and content
- [x] Create `src/layouts/_default/list.html` (archive/section list): extend `baseof.html`, paginate content listings
- [x] Create `src/layouts/_default/taxonomy.html` and `term.html`: extend `baseof.html`
- [x] Do not add a dedicated video template in this ticket; `/video/` remains a preserved page route handled by the unified single-template chain unless a later explicit override is introduced
- [x] Create pagination partial `src/layouts/partials/pagination.html` using Hugo's built-in paginator
- [x] Run `hugo --minify --environment production` on the empty scaffold — confirm exit code 0 and no missing `home`/`taxonomy` warnings
- [x] Create temporary sample content for validation, inspect generated HTML, then remove the fixtures:
  - [x] `<link rel="canonical">` is present and uses the `www` URL
  - [x] `<meta name="description">` is present
  - [x] JSON-LD blocks are syntactically valid JSON emitted through `jsonify`
- [x] Commit-ready templates, partials, ticket updates, and Phase 3 documentation prepared

---

### Out of Scope

- Final CSS/theme styling (scaffold uses minimal or no styling; aesthetics are post-migration scope)
- robots.txt and sitemap template customization (covered by RHI-024)
- Accessibility automation checks (covered by RHI-027)
- Performance profiling and asset budgets (covered by RHI-026)
- Content itself (Phase 4)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-019 Done — Phase 3 Bootstrap complete | Ticket | Done |
| RHI-021 Done — Hugo configuration hardened (taxonomy names, permalink rules) | Ticket | Done |
| RHI-022 Done — Front matter contract known (field names used in templates must match) | Ticket | Done |
| RHI-014 Outcomes — SEO partial architecture obligations confirmed | Ticket | Done |
| Hugo extended binary available | Tool | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Canonical/metadata logic duplicated across templates instead of centralized in partials | High | High | Keep all SEO output in `src/layouts/partials/seo/` and route every template through shared resolver partials | Engineering Owner |
| JSON-LD emitted as hand-written strings instead of structured objects, causing invalid JSON | Medium | High | Build schema objects with Hugo dicts/slices and encode the final object with `jsonify` | Engineering Owner |
| Template lookup order ambiguity causing wrong template to render | Medium | Medium | Use explicit `home.html`, `_default/single.html`, `_default/list.html`, `_default/taxonomy.html`, and `_default/term.html`; verify with temporary sample content | Engineering Owner |
| Contract drift reintroduces public tag pages or a dedicated `/video/` content type by accident | Medium | High | Keep category as the only public taxonomy and document `/video/` as a preserved page route rendered by the standard page/single chain | Engineering Owner |
| Alias-helper noindex behavior is assumed without any alias pages to prove it | Low | Medium | Leave alias-helper enforcement explicitly tracked for RHI-024, where alias output and sitemap behavior are verified alongside the broader SEO foundation | Engineering Owner |

---

### Definition of Done

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Completed. Workstream D now provides a build-clean Hugo template scaffold with a shared SEO layer, explicit home/list/taxonomy coverage, and route handling consistent with the approved Phase 2 route and SEO contracts.

Approved implementation decisions:

- Kept `src/layouts/_default/baseof.html` as the repo's base template and routed all delivered leaf templates through named `head`, `main`, and `scripts` blocks.
- Aligned the SEO partial set to the approved RHI-014 contract instead of the older draft naming in this ticket:
  - `head-meta.html`
  - `open-graph.html`
  - `json-ld-article.html`
  - `json-ld-site.html`
  - `json-ld-breadcrumb.html`
- Centralized title, description, canonical, robots, and social-image resolution in one helper partial under `src/layouts/partials/seo/` so home, single, and list kinds use the same metadata rules.
- Implemented an explicit `src/layouts/home.html` for the homepage, plus `_default/list.html`, `_default/taxonomy.html`, and `_default/term.html` so the current Hugo build no longer warns about missing `home` and `taxonomy` layouts.
- Preserved the current route contract: category remains the only public taxonomy, and `/video/` remains a preserved page route rendered by the unified single-template chain rather than a dedicated `videos` content type.
- Used Hugo dict/slice data structures plus `jsonify` for JSON-LD emission rather than hand-written JSON strings.
- Added separate breadcrumb data, HTML, and JSON-LD partials so UI breadcrumbs and schema stay synchronized without duplicating the crumb-building logic.

Validation completed:

- `hugo --minify --environment production` passes on the empty scaffold with no missing `home` or `taxonomy` warnings.
- Temporary validation fixtures were created for one post, one page, and the preserved `/video/` page route, then removed after inspection.
- Sample output inspection confirmed canonical tags use absolute `https://www.rhino-inquisitor.com/...` URLs, meta descriptions are present, and JSON-LD blocks render as valid JSON from `jsonify` output.
- Validation also exposed that the category taxonomy permalink overrides in `hugo.toml` were keyed by the singular alias. The config was corrected in this task so Hugo `v0.157.0` now emits the approved `/category/` and `/category/{slug}/` routes during scaffold verification.
- A full URL parity rerun could not be executed in this task because the expected RHI-025 tooling is not in the repo yet: `scripts/check-url-parity.js` and `migration/url-parity-report.json` are both still absent.

**Delivered artefacts:**

- `src/layouts/_default/baseof.html`
- `src/layouts/home.html`
- `src/layouts/_default/single.html`
- `src/layouts/_default/list.html`
- `src/layouts/_default/taxonomy.html`
- `src/layouts/_default/term.html`
- `src/layouts/partials/seo/resolve.html`
- `src/layouts/partials/seo/head-meta.html`
- `src/layouts/partials/seo/open-graph.html`
- `src/layouts/partials/seo/json-ld-article.html`
- `src/layouts/partials/seo/json-ld-site.html`
- `src/layouts/partials/seo/json-ld-breadcrumb.html`
- `src/layouts/partials/breadcrumbs-data.html`
- `src/layouts/partials/breadcrumbs.html`
- `src/layouts/partials/pagination.html`
- `hugo.toml`
- `analysis/documentation/phase-3/rhi-023-template-scaffolding-2026-03-09.md`

**Deviations from plan:**

- The original draft ticket expected `src/layouts/index.html` and separate `canonical.html`, `twitter-card.html`, and combined breadcrumb partial requirements. The delivered scaffold instead follows the approved RHI-014 contract with `src/layouts/home.html`, canonical output inside `head-meta.html`, Twitter compatibility tags inside `open-graph.html`, and JSON-LD breadcrumbs split from the HTML breadcrumb partial.
- No dedicated `src/layouts/videos/single.html` was added. RHI-013 locks `/video/` as a preserved page route, not a separate content type, so the current scaffold correctly serves it through the standard page/single template chain.
- Alias-helper noindex enforcement is explicitly carried into RHI-024 because the current scaffold emits no alias pages to validate yet.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-09 | In Progress | Reconciled RHI-023 with RHI-013, RHI-014, RHI-022, Hugo specialist guidance, and current official Hugo template guidance before changing the scaffold. |
| 2026-03-09 | In Progress | Added the base template, home/list/taxonomy/term templates, shared SEO partials, breadcrumb partials, and pagination partial under `src/layouts/`. |
| 2026-03-09 | In Progress | Validation uncovered that the category taxonomy permalink overrides in `hugo.toml` were keyed by the singular alias. The config was corrected so the scaffold now verifies against the approved `/category/...` route contract instead of Hugo's default `/categories/...` fallback. |
| 2026-03-09 | Done | Verified `hugo --minify --environment production` on the scaffold, validated canonical/meta/schema output with temporary sample content, removed the fixtures, and documented the completed Workstream D implementation. |

---

### Notes

- All SEO metadata generation must live in `src/layouts/partials/seo/`. Never duplicate canonical, OG, or schema logic in individual templates.
- Use `.Permalink` (not `.RelPermalink`) for all canonical and OG URL generation so emitted metadata stays absolute and aligned to `baseURL`.
- Category remains the only public taxonomy in the scaffold; public tag pages are still retired by default.
- No owner clarification was required for this ticket. The approved Phase 2 route and SEO contracts were specific enough to resolve the earlier draft ambiguities.
- Reference: `analysis/plan/details/phase-3.md` §Workstream D: Template Scaffolding and Rendering Model; `.github/instructions/hugo-coding-standards.instructions.md`; `.github/instructions/seo-compliance.instructions.md`
