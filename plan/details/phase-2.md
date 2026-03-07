# Phase 2 Detailed Plan: Stack and Architecture Decision

## Purpose
Lock the final stack and architecture for migrating https://www.rhino-inquisitor.com from WordPress to static hosting, and define all execution-critical decisions required before Phase 3 scaffolding begins.

This document has two parts:
1. Execution blueprint for Phase 2 (what must be decided, produced, and approved).
2. Comparative tool decision record (why Hugo was selected).

## Phase 2 Scope
In scope:
- Final tool and deployment architecture decision.
- Front matter and route contract for migrated content.
- SEO and metadata architecture contract for templates.
- Redirect strategy contract under GitHub Pages constraints.
- Validation and governance requirements that Phase 3 must implement.

Out of scope:
- Writing production templates/components.
- Running bulk migration conversion.
- DNS cutover.

## Final Stack Decision
- Generator: Hugo.
- Deployment model: GitHub Pages custom workflow (build in Actions, deploy artifact).
- Authoring format: Markdown with front matter.
- Route preservation primitive: front matter `url`.
- Redirect primitive: front matter `aliases`.

## Architecture Principles (Non-Negotiable)
1. Preserve existing high-value URLs exactly whenever possible.
2. Do not rely on canonical tags as a substitute for redirects.
3. Make SEO behavior template-driven and testable.
4. Fail build/CI on URL collisions and missing mapped routes.
5. Keep architecture explicit in docs and config, not implicit in tooling defaults.

## Execution Blueprint

## Workstream A: Generator and Repo Contract
Required decisions:
1. Confirm Hugo project layout (`content/`, `layouts/`, `static/`, `assets/`, `data/`).
2. Confirm primary config file format and location (`hugo.toml`).
3. Define output directory contract (`public/`) and artifact handoff to Pages workflow.
4. Define environments (`local`, `ci`, `prod`) and variable handling for canonical origin.
5. Define `baseURL` contract for production (canonical origin, trailing slash) and how CI injects it.

Outputs:
- Architecture section in this file approved.
- Repository structure decisions recorded in main plan.

## Workstream B: Content Model and Data Contract
Required front matter fields:
- `title`
- `description`
- `date`
- `lastmod`
- `categories`
- `tags`
- `heroImage`
- `url`
- `aliases`
- `canonical`
- `draft`

Recommended fields:
- `slug`
- `author`
- `seo` object (`noindex`, `ogImage`, `twitterCard`, optional overrides)

Rules:
1. `url` is mandatory for migrated content.
2. `url` normalization must be documented and enforced (leading slash behavior, lowercase policy, multilingual behavior if enabled).
3. Canonical handling defaults to rendered page absolute URL; per-page canonical overrides are allowed only as absolute HTTPS URLs.
4. Draft pages must be excluded from production build outputs and sitemap.
5. Production builds must not use `--buildDrafts`, `--buildFuture`, or `--buildExpired`.
6. Any `aliases` value must map to known legacy URLs from the manifest.

## Workstream C: Route and Redirect Contract
Required decisions:
1. Host policy: `www.rhino-inquisitor.com` canonical.
2. Trailing slash policy: preserve existing high-value behavior and avoid dual-indexable variants.
3. Case policy: lowercase route outputs only.
4. Taxonomy route policy: explicit category/video/archive path shape.
5. Taxonomy route implementation: lock config-level taxonomies and permalink patterns, and reserve per-page `url` overrides for exceptions.

Redirect policy:
1. Primary moved-route mechanism: Hugo `aliases`.
2. Alias behavior must be treated explicitly as client-side HTML redirect output (instant meta refresh), not guaranteed origin-level HTTP 301/308.
3. Prefer server-side permanent redirects (301/308) when hosting infrastructure supports them.
4. Keep fallback redirect artifacts for at least 12 months.
5. Avoid redirect chains; old URLs should resolve directly to final destination.
6. If changed URLs exceed 5 percent of indexed inventory, edge redirect layer is mandatory before launch.

Critical caveat:
- GitHub Pages is static hosting, so generated redirects are not equivalent to full origin-level 301/308 control for all cases.

Redirect acceptance criteria:
1. SEO contract explicitly accepts client-side alias redirects on Pages-only hosting.
2. URL parity validation proves every legacy URL resolves to the intended destination or explicit retire behavior.
3. Alias coverage includes non-trivial legacy routes and does not silently skip required paths or required output formats.

## Workstream D: SEO and Discoverability Contract
Each indexable template type must produce:
1. Unique `title`.
2. Unique meta description.
3. Canonical URL.
4. Open Graph baseline (`og:title`, `og:description`, `og:type`, `og:url`, `og:image`).
5. Twitter card compatibility tags (best-effort, non-blocking if platform docs change).
6. JSON-LD:
   - `BlogPosting` (or `Article`) for article pages, with recommended properties (for example `headline`, `image`, `datePublished`, `dateModified`, `author`).
   - `WebSite` for site-level context.
   - `BreadcrumbList` where hierarchy exists, including required breadcrumb properties.

Crawler surfaces:
1. Sitemap generated from built pages only.
2. `robots.txt` generation is intentional:
   - either enable Hugo robots generation and override template behavior as needed,
   - or ship a controlled static robots file.
3. Add explicit `Sitemap: https://<canonical-host>/sitemap.xml` if used by policy.
4. Redirect helper pages and drafts excluded from sitemap.
5. Robots policy is never used as a substitute for noindex/index control.

## Workstream E: Library and Tooling Contract
Core:
- Hugo
- GitHub Pages Actions deployment trio (`configure-pages`, `upload-pages-artifact`, `deploy-pages`)

Migration and audit tooling:
- `turndown`
- `@joplin/turndown-plugin-gfm`
- `fast-glob`
- `gray-matter`
- `fast-xml-parser`
- `undici` (or Node native `fetch` on pinned runtime)
- `p-limit`

Optional (adopt only with justification):
- HTML DOM parser for conversion cleanup edge cases.
- Output minification after correctness is stable.

Avoid by default:
- Heavy client-side frameworks for mostly static pages.
- Overlapping SEO plugins that obscure source-of-truth logic.

## Workstream F: Deployment and Operations Contract
Workflow contract:
1. Build static output in CI.
2. Upload Pages artifact from Hugo output directory.
3. Deploy via official Pages action.
4. Explicit workflow permissions and minimal token scope (including `pages: write` and `id-token: write` for deployment).
5. `.nojekyll` handling is conditional:
   - required when publishing built output to a Pages source branch in external CI patterns,
   - optional for artifact-based Pages deployment unless a concrete issue requires it.

Operational constraints to record:
1. Custom domain source of truth:
   - configure domain in repository Pages settings or API for Actions publishing,
   - do not assume a repository `CNAME` file alone sets or updates domain configuration.
2. Artifact size and build-time budgets.
3. Rollback plan for failed deploys.
4. Pages artifact format constraints (single tar in gzip archive, no unsupported link types, size boundaries).

## Required Validation Gates (Defined in Phase 2, Implemented in Phase 3+)
1. URL parity gate: compare legacy manifest against built outputs + redirects.
2. Redirect correctness gate: verify direct legacy-to-final resolution (no avoidable chains), and verify accepted redirect behavior type.
3. SEO gate: validate canonical/meta/schema presence and correctness on representative templates.
4. Link integrity gate: broken-link scan across generated site.
5. Build gate: deterministic production build in CI with production flags.
6. Deployment integrity gate: verify Pages deploy permissions, artifact validity, and custom-domain configuration.
7. Launch-readiness gate: manual verification of robots, sitemap, core templates, and social preview tags.

## Tightened Validation Checklist
1. Every legacy URL maps to exactly one of: same-path output, intentional redirect target, or explicit retire behavior.
2. No irrelevant mass redirects (for example broad redirect-to-home patterns without content equivalence).
3. Canonical URLs are absolute and consistent with rendered paths.
4. No unintended `noindex`, draft, or future content appears in production output.
5. Structured data validates on representative templates (articles and breadcrumbs at minimum).
6. robots and sitemap are intentionally generated and internally consistent.
7. Deployment workflow uses official Pages actions and documented permissions.

## Risks and Mitigations
1. Static-host redirect limitations can reduce migration signal transfer.
- Mitigation: maximize route preservation, trigger edge redirects at threshold.

2. Legacy WordPress system endpoints may not map cleanly.
- Mitigation: classify each endpoint (`keep`, `merge`, `retire`) and avoid irrelevant redirects.

3. Taxonomy drift can break category/video discoverability.
- Mitigation: lock taxonomy route policy and enforce through parity checks.

4. Metadata drift across templates can cause SEO regression.
- Mitigation: centralize metadata partials and enforce CI checks.

## Phase 2 Deliverables
1. Final architecture decision record (this file).
2. Updated top-level migration plan reflecting chosen stack.
3. Content model contract for migrated front matter.
4. Redirect strategy with escalation trigger.
5. Validation contract for CI and launch gates.

## Definition of Done (Phase 2)
Phase 2 is complete only if all statements are true:
1. Generator and deploy architecture are finalized and documented.
2. Content model and route contract are fully specified.
3. Redirect strategy and edge-escalation trigger are approved.
4. SEO template obligations are explicit and testable.
5. Validation gates are defined for Phase 3 implementation.
6. No unresolved architecture blockers remain for scaffolding.

## Resolved Decisions for Phase 3 Entry
1. URL-change threshold and owner:
- Threshold is fixed at 5 percent of indexed URL inventory.
- Decision owner is migration owner, with required approval from SEO owner.
2. Legacy endpoint policy:
- `/feed/` is the canonical feed route and must resolve on the migrated site.
- Legacy feed variants (`/feed/rss/`, `/feed/atom/`) must be explicitly mapped (redirect or retire) in the URL manifest.
- `/comments/feed/`, `/wp-json/`, `/xmlrpc.php`, and legacy `/author/*` system endpoints are retired with explicit not-found behavior (`404` on Pages-only hosting, `410` where edge layer is active).
- Legacy on-site search endpoints (`/search/*`) are retired unless a production search feature is implemented and validated before cutover.
3. Pagination parity policy:
- Strict pagination parity is required only for URL classes with demonstrated value (at least 100 clicks in 90 days or at least 10 referring domains).
- For non-critical deep pagination routes, intentional retirement is allowed with explicit mapping review.
- Pagination exception decisions must be recorded in `migration/pagination-priority-manifest.json` before Phase 3 scaffolding.
4. Edge redirect infrastructure timing:
- Edge redirect infrastructure is conditionally approved and must be activated before launch if any Model B trigger is met.
- If no trigger is met, Model A remains approved with explicit risk acceptance.
5. Feed format scope:
- RSS output is required; Atom parity is optional and non-blocking.
- Phase 4 must publish `migration/feed-compatibility-check.md` proving legacy feed endpoint outcomes.

## Decision Ownership and Sign-Off
1. Migration owner:
- owns redirect architecture choice, threshold enforcement, and rollout acceptance.
2. SEO owner:
- approves URL-change threshold usage, endpoint retire/keep outcomes, and pagination parity exceptions.
3. Engineering owner:
- approves implementation feasibility for Pages-only versus edge-layer path.

## Comparative Tool Decision Record (Separate Section)

### Decision Outcome
- Primary choice: Hugo + GitHub Pages (Actions artifact deployment).
- Runner-up: Eleventy + GitHub Pages (Actions artifact deployment).

### Why Hugo Won
1. Strong route and redirect primitives in front matter (`url`, `aliases`).
2. Built-in sitemap and RSS support.
3. Better fit for large legacy URL retention with fewer custom redirect mechanics.

### Caveat
- GitHub Pages remains static hosting; static redirect outputs are not always equivalent to full origin-level server redirect behavior.

### Evaluation Criteria (Weighted)
1. URL and route control: 25
2. Redirect practicality on static hosting: 20
3. SEO surfaces: 20
4. Markdown-first and WordPress migration ergonomics: 15
5. CI and operations simplicity: 10
6. Maintainability and maturity: 5
7. GitHub Pages fit: 5

### Scoring Matrix

| Tool | URL 25 | Redirects 20 | SEO 20 | WP + MD 15 | Ops 10 | Maintain 5 | Pages 5 | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Hugo | 5 | 5 | 5 | 3 | 5 | 5 | 4 | 93 |
| Eleventy | 5 | 3 | 4 | 5 | 4 | 4 | 4 | 84 |
| Jekyll | 4 | 4 | 4 | 3 | 3 | 5 | 5 | 79 |
| Astro | 4 | 2 | 4 | 4 | 3 | 4 | 4 | 70 |
| Next.js export | 4 | 1 | 4 | 3 | 2 | 3 | 3 | 61 |

### Switch Conditions
Switch to Eleventy if:
1. Team throughput depends on a Node-first migration and reduced Hugo template learning curve.
2. URL changes are minimal and redirect complexity is low.

Consider Jekyll if:
1. Strict GitHub Pages-native behavior is preferred and plugin constraints are acceptable.

Avoid Astro/Next static export for this migration if:
1. In-app static redirect limitations are unacceptable.
2. Framework interactivity is not a core requirement.

## Official Documentation References

### GitHub Pages and deployment
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://github.com/actions/upload-pages-artifact
- https://github.com/actions/deploy-pages

### Google migration and redirects
- https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- https://developers.google.com/search/docs/crawling-indexing/301-redirects
- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- https://developers.google.com/search/docs/crawling-indexing/robots/intro

### Hugo
- https://gohugo.io/content-management/front-matter/
- https://gohugo.io/content-management/urls/
- https://gohugo.io/content-management/taxonomies/
- https://gohugo.io/configuration/permalinks/
- https://gohugo.io/getting-started/configuration/
- https://gohugo.io/templates/sitemap/
- https://gohugo.io/templates/robots/
- https://gohugo.io/templates/rss/
- https://gohugo.io/templates/embedded/
- https://gohugo.io/hosting-and-deployment/hosting-on-github/

### Eleventy
- https://www.11ty.dev/docs/permalinks/
- https://www.11ty.dev/docs/migrate/wordpress/
- https://www.11ty.dev/docs/plugins/rss/

### Astro
- https://docs.astro.build/en/guides/content-collections/
- https://docs.astro.build/en/reference/configuration-reference/#redirects
- https://docs.astro.build/en/guides/deploy/github/

### Jekyll
- https://jekyllrb.com/docs/permalinks/
- https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll

### Next.js static export
- https://nextjs.org/docs/app/guides/static-exports
- https://nextjs.org/docs/app/guides/static-exports#unsupported-features
