## RHI-023 · Workstream D — Template Scaffolding and Rendering Model

**Status:** Open  
**Priority:** Critical  
**Estimate:** L  
**Phase:** 3  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-01  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Establish a complete, maintainable template hierarchy before bulk content migration begins. All primary page types (article, page, home, archive, category) must render with shared metadata and layout primitives so that SEO signals, accessibility structure, and rendering behavior are consistent across the site. Centralizing metadata generation in shared partials — rather than duplicating it per template — prevents the canonical/metadata drift that would require expensive rework in later phases.

---

### Acceptance Criteria

- [ ] `src/layouts/_default/baseof.html` exists and defines named blocks for:
  - [ ] `{{ block "head" . }}` — for `<head>` content including meta and SEO partials
  - [ ] `{{ block "main" . }}` — for primary page content
  - [ ] `{{ block "scripts" . }}` — for footer scripts
- [ ] All leaf templates extend `baseof.html` via `{{ define "main" }}` — no standalone HTML boilerplate in individual templates
- [ ] Partial architecture is implemented with SEO-critical partials in `src/layouts/partials/seo/`:
  - [ ] `head-meta.html` — global head metadata (`<title>`, `<meta name="description">`, viewport, charset)
  - [ ] `canonical.html` — outputs `<link rel="canonical">` using `.Permalink` (or `canonical` front matter override when present)
  - [ ] `open-graph.html` — `og:title`, `og:description`, `og:type`, `og:url`, `og:image`
  - [ ] `twitter-card.html` — Twitter/X card tags
  - [ ] `json-ld-article.html` — `BlogPosting` JSON-LD (for article templates only)
  - [ ] `json-ld-website.html` — `WebSite` + optional `Person` JSON-LD (for site-level, using `partialCached`)
  - [ ] `breadcrumbs.html` — `BreadcrumbList` JSON-LD and HTML breadcrumb markup where applicable
- [ ] Section and taxonomy templates exist for all primary page types:
  - [ ] `src/layouts/index.html` — homepage
  - [ ] `src/layouts/_default/single.html` — article/post detail
  - [ ] `src/layouts/pages/single.html` — static page detail (or `src/layouts/_default/single.html` if unified)
  - [ ] `src/layouts/_default/list.html` — archive and section list
  - [ ] `src/layouts/_default/taxonomy.html` — category/tag term list page
  - [ ] `src/layouts/_default/term.html` — individual category/tag page
  - [ ] Video template (`src/layouts/videos/single.html`) if video route type is preserved per RHI-013
- [ ] Pagination partial exists for list pages using Hugo's built-in `.Paginator`
- [ ] All string values in `<script type="application/ld+json">` blocks are piped through `jsonify`
- [ ] No template uses `.URL` or `.RelPermalink` to generate canonical or OG URLs — `.Permalink` is used exclusively
- [ ] `hugo --minify --environment production` exits with code 0 after templates are added
- [ ] No template relies on undocumented implicit Hugo defaults (all behaviors are explicit)

---

### Tasks

- [ ] Create `src/layouts/_default/baseof.html` with `head`, `main`, and `scripts` block definitions
- [ ] Create `src/layouts/partials/seo/head-meta.html`:
  - [ ] `<title>` using `{{ .Title }} | {{ .Site.Title }}`
  - [ ] `<meta name="description">` from front matter `description`
  - [ ] viewport and charset meta tags
  - [ ] Include all other SEO partials from this partial to keep `baseof.html` clean
- [ ] Create `src/layouts/partials/seo/canonical.html`:
  - [ ] Default: `<link rel="canonical" href="{{ .Permalink }}">` 
  - [ ] Override: use `{{ .Params.canonical }}` when present and validate it is absolute HTTPS
- [ ] Create `src/layouts/partials/seo/open-graph.html`:
  - [ ] `og:title`, `og:description`, `og:type`, `og:url` (using `.Permalink`), `og:image`
  - [ ] Use `{{ with .Params.heroImage }}` for `og:image`
- [ ] Create `src/layouts/partials/seo/twitter-card.html`:
  - [ ] `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- [ ] Create `src/layouts/partials/seo/json-ld-article.html`:
  - [ ] `BlogPosting` schema with `headline`, `datePublished`, `dateModified`, `description`, `url`, `author`
  - [ ] All string values piped through `jsonify`
  - [ ] Guard with `{{ if eq .Type "posts" }}` or equivalent type check — do not emit on list/taxonomy pages
- [ ] Create `src/layouts/partials/seo/json-ld-website.html`:
  - [ ] `WebSite` schema with site name, URL, and optional `Person` for site owner
  - [ ] Use `partialCached` when called from templates (site-level context only)
- [ ] Create `src/layouts/partials/seo/breadcrumbs.html`:
  - [ ] `BreadcrumbList` JSON-LD
  - [ ] HTML breadcrumb markup with `aria-label="Breadcrumb"`
- [ ] Create `src/layouts/index.html` (homepage): extend `baseof.html`, emit `json-ld-website`, list recent content
- [ ] Create `src/layouts/_default/single.html` (article/post): extend `baseof.html`, emit `json-ld-article`, breadcrumbs
- [ ] Create `src/layouts/_default/list.html` (archive/section list): extend `baseof.html`, pagination partial
- [ ] Create `src/layouts/_default/taxonomy.html` and `term.html`: extend `baseof.html`
- [ ] Create video template (`src/layouts/videos/single.html`) if video routes are preserved per RHI-013 decision
- [ ] Create pagination partial `src/layouts/partials/pagination.html` using Hugo's `.Paginator`
- [ ] Run `hugo --minify --environment production` on scaffold (with empty or sample content) — confirm exit code 0
- [ ] Inspect generated HTML for at least one sample page of each template type to verify:
  - [ ] `<link rel="canonical">` is present and uses `www` URL
  - [ ] `<meta name="description">` is present
  - [ ] JSON-LD blocks are syntactically valid JSON (no unescaped values)
- [ ] Commit all templates and partials

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
| RHI-019 Done — Phase 3 Bootstrap complete | Ticket | Pending |
| RHI-021 Done — Hugo configuration hardened (taxonomy names, permalink rules) | Ticket | Pending |
| RHI-022 Done — Front matter contract known (field names used in templates must match) | Ticket | Pending |
| RHI-014 Outcomes — SEO partial architecture obligations confirmed | Ticket | Pending |
| Hugo extended binary available (required for any SCSS processing) | Tool | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Canonical/metadata logic duplicated across templates instead of centralized in partials | High | High | Code review all templates before commit; fail review if SEO logic appears outside `src/layouts/partials/seo/` | Engineering Owner |
| JSON-LD string values not escaped through `jsonify`, causing invalid JSON in output | Medium | High | Add a build-time inspection step (grep for `ld+json` blocks in `public/` and validate JSON) | Engineering Owner |
| Template lookup order ambiguity causing wrong template to render | Medium | Medium | Test each template type with a sample content file; document lookup override in `RUNBOOK.md` | Engineering Owner |
| Video template skipped due to uncertainty about video route decision | Low | Medium | If RHI-013 video disposition is not finalized, create placeholder template with a `TODO` comment; do not block sign-off | Engineering Owner |

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

- `src/layouts/_default/baseof.html`
- `src/layouts/partials/seo/head-meta.html`
- `src/layouts/partials/seo/canonical.html`
- `src/layouts/partials/seo/open-graph.html`
- `src/layouts/partials/seo/twitter-card.html`
- `src/layouts/partials/seo/json-ld-article.html`
- `src/layouts/partials/seo/json-ld-website.html`
- `src/layouts/partials/seo/breadcrumbs.html`
- `src/layouts/partials/pagination.html`
- `src/layouts/index.html`
- `src/layouts/_default/single.html`
- `src/layouts/_default/list.html`
- `src/layouts/_default/taxonomy.html`
- `src/layouts/_default/term.html`
- Video template (if applicable)

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- All SEO metadata generation must live in `src/layouts/partials/seo/`. Never duplicate canonical, OG, or schema logic in individual templates — this is the single most important template-quality rule for migration correctness.
- Use `.Permalink` (not `.URL` or `.RelPermalink`) for all canonical and OG URL generation. `.URL` and `.RelPermalink` are relative; `.Permalink` produces the correct absolute URL from `baseURL`.
- `partialCached` should be used for `json-ld-website.html` since site-level JSON-LD does not change per page.
- Reference: `analysis/plan/details/phase-3.md` §Workstream D: Template Scaffolding and Rendering Model; `.github/instructions/hugo-coding-standards.instructions.md`
