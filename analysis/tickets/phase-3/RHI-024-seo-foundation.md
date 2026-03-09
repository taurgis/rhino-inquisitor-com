## RHI-024 · Workstream E — SEO Foundation Implementation

**Status:** Done  
**Priority:** High  
**Estimate:** M  
**Phase:** 3  
**Assigned to:** SEO Owner  
**Target date:** 2026-04-02  
**Created:** 2026-03-07  
**Updated:** 2026-03-09

---

### Goal

Validate and complete the full SEO signal layer on top of the template scaffold (RHI-023): verify that every indexable page type emits correct canonical, meta, Open Graph, Twitter card, and structured data; that `sitemap.xml` and `robots.txt` match the approved host policy; that staging environments enforce `noindex` through meta tags (not only `robots.txt`); and that feed output paths are compatible with the WordPress migration. This ticket is the final SEO-correctness gate before Phase 4 content begins flowing in at volume.

---

### Acceptance Criteria

- [x] Every indexable page type (article, page, homepage, archive, category/term) produces:
  - [x] Unique `<title>` (max 60 chars recommended)
  - [x] `<meta name="description">` (120–155 chars)
  - [x] `<link rel="canonical">` pointing to the absolute `https://www.rhino-inquisitor.com/...` URL
  - [x] `og:title`, `og:description`, `og:type`, `og:url`, `og:image`
  - [x] Twitter/X card tags
- [x] `BlogPosting` JSON-LD is emitted on article templates only — not on list, taxonomy, or homepage templates
- [x] `WebSite` JSON-LD is emitted on the homepage
- [x] `BreadcrumbList` JSON-LD is emitted on templates with a meaningful hierarchy (articles, category terms)
- [x] All JSON-LD blocks are valid JSON (no unescaped special characters): verified with automated check
- [x] `datePublished` and `dateModified` in JSON-LD use ISO 8601 format with timezone
- [x] `public/sitemap.xml` is generated in production build and:
  - [x] Contains only indexable pages (no `draft: true` content)
  - [x] All URLs use the canonical `https://www.rhino-inquisitor.com/` base
  - [x] Alias/redirect pages are excluded from sitemap entries
- [x] `public/robots.txt` is generated in production build and:
  - [x] Does not accidentally block crawling of production content
  - [x] Contains a `Sitemap:` directive pointing to `https://www.rhino-inquisitor.com/sitemap.xml`
  - [x] Does not use `Disallow` as the sole mechanism for de-indexing
- [x] Staging environment enforces `noindex` via `<meta name="robots" content="noindex">` — not only `robots.txt Disallow`
- [x] Feed output path decision from RHI-013/RHI-021 is implemented:
  - [x] WordPress `/feed/` resolves (direct feed output or one-hop redirect) and target is correct
  - [x] Legacy feed variants are mapped per RHI-013 (`/feed/rss/`, `/feed/atom/`)
- [x] SEO smoke-check script (`scripts/check-seo.js`) exists and:
  - [x] Validates presence of canonical, meta description, and JSON-LD on representative pages in `public/`
  - [x] Exits with non-zero code if any required SEO element is missing
  - [x] Is referenced in `package.json` as `npm run check:seo`

---

### Tasks

- [x] Verify template outputs from RHI-023 against SEO criteria for each page type (inspect built `public/` HTML):
  - [x] Article: canonical, meta description, og:*, Twitter card, `BlogPosting` JSON-LD
  - [x] Page: canonical, meta description, og:*, Twitter card (no `BlogPosting` JSON-LD)
  - [x] Homepage: canonical, meta description, og:*, `WebSite` JSON-LD
  - [x] Archive/list: canonical, meta description, og:* (no `BlogPosting` JSON-LD)
  - [x] Category/term: canonical, meta description, og:*, `BreadcrumbList` JSON-LD
- [x] Fix any missing or incorrect SEO signal in templates (coordinate with RHI-023 if template changes needed)
- [x] Validate `sitemap.xml`:
  - [x] Build with sample draft and non-draft content
  - [x] Confirm draft pages are absent from sitemap
  - [x] Confirm all sitemap URLs use the canonical www base
  - [x] Confirm URL count is consistent with non-draft content count
- [x] Validate `robots.txt`:
  - [x] Review directives for accidental blocking
  - [x] Confirm `Sitemap:` directive is present and correct
  - [x] Confirm production `robots.txt` does not contain `Disallow: /` or any directive blocking production content
- [x] Implement staging `noindex` control:
  - [x] Create `config/staging/hugo.toml` or template condition that emits `<meta name="robots" content="noindex">` in staging builds
  - [x] Verify staging build does NOT emit `noindex` in production build
  - [x] Confirm staging protection does not rely solely on `robots.txt Disallow`
- [x] Implement `/feed/` compatibility path (per RHI-013 decision):
  - [x] Ensure `/feed/` resolves via direct output or one-hop redirect page in `src/static/feed/index.html`
  - [x] Verify redirect target is correct and does not create a redirect chain
- [x] Create `scripts/check-seo.js`:
  - [x] Read HTML files from `public/` using `fast-glob`
  - [x] Check each representative template type for: `<link rel="canonical">`, `<meta name="description">`, valid JSON-LD block presence
  - [x] Output list of failing pages with missing element names
  - [x] Exit 1 on any failure
- [x] Add `"check:seo": "node scripts/check-seo.js"` to `package.json` scripts
- [x] Run `npm run check:seo` on scaffold build — confirm pass
- [x] Validate at least one article template through [Google Rich Results Test](https://search.google.com/test/rich-results) (manual check; log result in Progress Log)
- [ ] Commit `scripts/check-seo.js`, any staging config changes, and feed path artifacts

---

### Out of Scope

- Final `robots.txt` content policy beyond draft blocking and sitemap reference (advanced Disallow rules are post-launch scope)
- Paid Search Console integration or GSC property verification (Phase 9)
- Full SEO audit against WordPress baseline (Phase 8)
- Social image creation (Phase 4 media scope)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-019 Done — Phase 3 Bootstrap complete | Ticket | Satisfied |
| RHI-021 Done — Output formats (sitemap, robots, RSS) enabled in config | Ticket | Satisfied |
| RHI-023 Done — Template scaffold with SEO partials committed | Ticket | Satisfied |
| RHI-013 Outcomes — `/feed/` must resolve and legacy feed variants are mapped | Ticket | Satisfied |
| RHI-014 Outcomes — SEO partial architecture and JSON-LD obligations approved | Ticket | Satisfied |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| `BlogPosting` JSON-LD emitted on non-article pages, producing invalid structured data | Medium | Medium | Enforce type guard `{{ if eq .Type "posts" }}` in json-ld-article.html; verify with automated check | Engineering Owner |
| Staging `noindex` accidentally included in production build | Medium | High | Use explicit environment config split; add CI test that production build HTML does not contain `noindex` meta | Engineering Owner |
| Sitemap contains `draft: true` content due to environment flag mismatch | Low | High | Run build validation with `--environment production` flag only; confirm draft exclusion in acceptance check | Engineering Owner |
| Feed redirect creates a chain (e.g. `/feed/` → `/index.xml` → actual feed) | Low | Medium | Verify redirect target resolves in one hop; check for chains in parity check | SEO Owner |
| JSON-LD fails Rich Results Test due to missing required field | Medium | Medium | Use Google Rich Results Test as manual acceptance step before close | SEO Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Completed. Workstream E now provides the implementation and validation scaffolding required to verify Phase 3 SEO behavior end-to-end on built Hugo output instead of relying on template inspection alone.

Implemented changes so far:

- Added environment-aware robots resolution in `src/layouts/partials/seo/resolve.html` so non-production builds emit `noindex, nofollow` through the shared SEO layer rather than through a config overlay.
- Added a repo-owned default social image fallback in `hugo.toml` plus `src/static/images/social-default.svg`, allowing `og:image` and `twitter:image` to render on every indexable page even when page-level `heroImage` or `seo.ogImage` values are absent.
- Added a feed discovery `<link rel="alternate">` in `src/layouts/partials/seo/head-meta.html` based on Hugo's RSS output lookup.
- Hardened Open Graph/Twitter output so `og:image` and `twitter:image` are always present when pages use the shared SEO resolver.
- Extended `BlogPosting` JSON-LD with publisher data while keeping it posts-only and emitted through `jsonify`.
- Added a custom `src/layouts/sitemap.xml` override so production sitemap generation excludes pages marked `seo.noindex` while preserving canonical-host output.
- Added Pages-safe feed compatibility helpers under `src/static/feed/`, `src/static/feed/rss/`, and `src/static/feed/atom/` as one-hop static redirect fallbacks to the canonical Hugo feed endpoint.
- Added `scripts/check-seo.js` and wired `npm run check:seo` in `package.json` to validate built HTML, `robots.txt`, and `sitemap.xml` against the Phase 2 SEO contract.

Validation work in this ticket verifies:

- canonical, description, OG, Twitter, and JSON-LD output from built `public/` files
- sitemap host and indexability parity with emitted HTML pages
- `robots.txt` sitemap directive and production crawl safety
- staging `noindex` behavior through template-driven environment branching
- `/feed/`, `/feed/rss/`, and `/feed/atom/` compatibility artifacts
- representative article/page/archive/category output through temporary validation fixtures that were removed before final scaffold validation
- Google Rich Results Test confirmation for one representative article

**Delivered artefacts:**

- `scripts/check-seo.js` — SEO smoke-check script
- Template-level staging `noindex` implementation in `src/layouts/partials/seo/resolve.html`
- `src/layouts/sitemap.xml` — sitemap override for indexable pages only
- Feed path artifacts in `src/static/feed/`, `src/static/feed/rss/`, and `src/static/feed/atom/`
- `package.json` updated with `check:seo` script
- `hugo.toml` updated with repo-level SEO defaults
- Rich Results Test result URL: `https://search.google.com/test/rich-results/result?id=NA7Sva7WYtceAcPUDpx5ZA`
- Progress Log entry with validation evidence and final closeout status

**Deviations from plan:**

- Staging `noindex` was implemented via template-level environment branching instead of `config/staging/hugo.toml` to preserve the locked root-config repo contract from RHI-011.
- Feed compatibility uses static Pages-safe redirect helpers rather than a direct `/feed/` XML output path because Hugo/GitHub Pages do not provide a first-class extensionless RSS endpoint in the current repo contract.
- No git commit was created during this session because repository policy in chat is to avoid committing unless the user explicitly requests it.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-09 | In Progress | Reconciled RHI-024 with RHI-013, RHI-014, Hugo specialist guidance, SEO migration rules, and official Hugo/GitHub Pages documentation before implementing the SEO validation layer. |
| 2026-03-09 | In Progress | Added environment-aware robots meta handling, default social-image fallback, feed compatibility helpers, sitemap indexability control, and the `check:seo` smoke-check script. |
| 2026-03-09 | In Progress | Validated representative article, page, archive, category, draft, noindex, and alias behaviors using temporary content fixtures; removed the fixtures after verification so the repository returns to the intended Phase 3 scaffold state. |
| 2026-03-09 | Done | Confirmed clean scaffold build passes `npm run check:seo`, staging scaffold build emits `noindex, nofollow`, and Rich Results Test reports 2 valid items detected (Articles and Breadcrumbs) for the representative article: `https://search.google.com/test/rich-results/result?id=NA7Sva7WYtceAcPUDpx5ZA`. |

---

### Notes

- **Canonical tags do not replace redirects.** If a URL has moved, a canonical pointing to the new location is helpful but not sufficient — a redirect must also exist. Do not close this ticket with canonical-only coverage for moved URLs; ensure RHI-025 covers those cases.
- Staging de-indexing must use `<meta name="robots" content="noindex">` because `robots.txt Disallow` can be ignored by some crawlers and does not guarantee de-indexing. See phase-3.md §Audit Corrections Applied.
- Do not use `robots.txt` as a canonicalization mechanism. Its purpose is crawl access control, not duplicate URL resolution.
- Reference: `analysis/plan/details/phase-3.md` §Workstream E: SEO Foundation Implementation; `.github/instructions/seo-compliance.instructions.md`
