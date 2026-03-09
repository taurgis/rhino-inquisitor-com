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
1. Confirm Hugo project layout (`src/content/`, `src/layouts/`, `src/static/`, `src/assets/`, `src/data/`).
2. Confirm primary config file format and location (`hugo.toml`).
3. Define output directory contract (`public/`) and artifact handoff to Pages workflow.
4. Define environments (`local`, `preview-pages`, `ci-prod`, `prod`) and variable handling for canonical origin plus the GitHub Pages project-site path prefix.
5. Define `baseURL` contract for production (canonical origin, trailing slash) and for preview Pages rehearsal builds.

Approved contract:
- Repository layout is locked to root `hugo.toml` plus Hugo source components under `src/content/`, `src/layouts/`, `src/static/`, `src/assets/`, and `src/data/`, with `public/` as generated output only.
- Root `hugo.toml` is the primary config file; Phase 2 does not introduce `config/_default/` or `config/production/` overlays.
- Canonical production `baseURL` is `https://www.rhino-inquisitor.com/` with trailing slash.
- Environment model is fixed as:
   - `local`: `hugo server` development preview.
   - `preview-pages`: deployable rehearsal artifact built for `https://taurgis.github.io/rhino-inquisitor-com/` using the Pages-provided `base_url`.
   - `ci-prod`: `hugo --environment production --gc --minify` validation build producing `./public/` with the canonical production host.
   - `prod`: deploy the exact production artifact validated in CI after preview gates pass and the custom domain is configured.
- `baseURL` handling is fixed as: root `hugo.toml` is the canonical production source of truth; preview-pages builds use an explicit build-time override from GitHub Pages `base_url`; preview and production artifacts are separate outputs and must not be treated as one interchangeable host state.
- Hugo version pin is fixed to Hugo Extended `0.157.0` and will be implemented in CI as `HUGO_VERSION=0.157.0`.

Outputs:
- Architecture section in this file approved.
- Repository structure decisions recorded in main plan.

## Workstream B: Content Model and Data Contract
Approved contract:
- Scope is limited to migrated WordPress `post` and `page` records that become Hugo content files; attachments/media and generated home/section/taxonomy/list pages are outside this per-file front matter contract.
- YAML is the approved front matter serialization format for migrated content files.
- Common required fields for migrated content files are `title`, `description`, `lastmod`, `url`, and `draft`.
- Post-specific required fields are `date`, `categories`, and `tags`.
- Repo-approved custom extension fields remain `heroImage`, `canonical`, and `seo` (`noindex`, `ogImage`, `twitterCard`) to preserve continuity with downstream Phase 3 and Phase 4 tickets.

Rules:
1. `migration/url-manifest.json` `target_url` is the source of truth for `url`; migrated content never derives routes from `slug`.
2. `url` values are mandatory for migrated regular content and must be path-only, lowercase, start with `/`, end with `/`, and contain no query strings or fragments.
3. `aliases` values must be path-only legacy URLs from the manifest for the same target URL; arbitrary aliases, absolute URLs, and self-aliases are prohibited.
4. Canonical handling defaults to the rendered page absolute URL from the active build `baseURL`; per-page overrides are allowed only as same-host absolute HTTPS URLs in that active environment.
5. `draft` is derived from WordPress publication status: `publish` maps to `draft: false`; retained non-published states map to `draft: true`; trashed items do not produce content files.
6. Draft pages must be excluded from production build outputs and sitemap.
7. Production builds must not use `--buildDrafts`, `--buildFuture`, or `--buildExpired`.

## Workstream C: Route and Redirect Contract
Required decisions:
1. Host policy: `www.rhino-inquisitor.com` canonical.
2. Trailing slash policy: preserve existing high-value behavior and avoid dual-indexable variants.
3. Case policy: lowercase route outputs only.
4. Taxonomy route policy: explicit category/video/archive path shape.
5. Taxonomy route implementation: lock config-level taxonomies and permalink patterns for generated list pages; migrated regular post/page content continues to use explicit manifest-driven `url` values, while per-page `url` overrides remain exception-only outside that migration contract.

Important note on `/video/` URL class: Phase 1 data confirms that `/video/` is a WordPress **page** (listed in `page-sitemap.xml`), NOT a custom post type archive or taxonomy route. It must be preserved as a `page` class URL, not as a taxonomy archive. The `/category/video/` URL is a separate category archive route and must be handled independently.

Redirect policy:
1. Primary moved-route mechanism: Hugo `aliases`.
2. Alias behavior must be treated explicitly as client-side HTML redirect output (instant meta refresh), not guaranteed origin-level HTTP 301/308.
3. Prefer server-side permanent redirects (301/308) when hosting infrastructure supports them.
4. Keep fallback redirect artifacts for at least 12 months.
5. Avoid redirect chains; old URLs should resolve directly to final destination.
6. If URL change rate exceeds 5 percent, edge redirect layer is mandatory before launch.
   - `indexed_urls = count(disposition == "keep" OR has_organic_traffic == true)`
   - `changed_indexed_urls = count(indexed_urls where disposition != "keep")`
   - `change_rate = changed_indexed_urls / indexed_urls * 100`
7. Tag archives are excluded from the default public Phase 3 route contract; the legacy `/tag/*` family remains retired unless an explicit exception is later approved in `migration/url-manifest.json`.

Critical caveat:
- GitHub Pages is static hosting, so generated redirects are not equivalent to full origin-level 301/308 control for all cases.

Redirect acceptance criteria:
1. SEO contract explicitly accepts client-side alias redirects on Pages-only hosting.
2. URL parity validation proves every legacy URL resolves to the intended destination or explicit retire behavior.
3. Alias coverage includes non-trivial legacy routes and does not silently skip required paths or required output formats.
4. Current manifest baseline calculation on `2026-03-09` is `39.1%` (`131 / 335`), so the Model B trigger is already met and edge redirect infrastructure is mandatory before launch.

## Workstream D: SEO and Discoverability Contract
Approved contract:
1. All SEO metadata and schema output lives in `src/layouts/partials/seo/`; leaf templates must not duplicate canonical, Open Graph, or JSON-LD logic.
2. Required named partials are fixed to `head-meta.html`, `open-graph.html`, `json-ld-article.html`, `json-ld-site.html`, and `json-ld-breadcrumb.html`.
3. Canonical and `og:url` generation must use `.Permalink`; `.RelPermalink` is not allowed for absolute SEO URLs.
4. Indexable template families are:
   - homepage;
   - article/post singles;
   - standard page singles;
   - the preserved `/video/` page route;
   - category term pages;
   - pagination pages intentionally retained under RHI-013 policy.
5. Non-indexable surfaces are:
   - tag pages by default;
   - search results pages if a production search feature is later introduced;
   - 404 pages;
   - alias redirect helpers;
   - every staging or preview page.
6. Every indexable page must emit:
   - unique `title`;
   - unique meta description;
   - canonical URL;
   - Open Graph baseline (`og:title`, `og:description`, `og:type`, `og:url`, `og:image`).
7. Twitter card tags remain best-effort, non-blocking compatibility tags using the same resolved title, description, and image inputs as the Open Graph layer.
8. Structured data contract is fixed as:
   - article singles emit `BlogPosting` with repo-required properties `headline`, `image`, `datePublished`, `dateModified`, and `author`;
   - homepage emits `WebSite`;
   - pages, lists, and terms may emit `BreadcrumbList` only when a real visible breadcrumb hierarchy exists;
   - list, term, pagination, 404, and alias pages never emit `BlogPosting`.
9. All string values inside JSON-LD must use Hugo `jsonify`.
10. Metadata fallback precedence is fixed for Phase 3 implementation:
   - description comes from approved front matter `description`;
   - social image resolves from `seo.ogImage`, then `heroImage`, then an approved site-level default social image;
   - Twitter card type resolves from explicit `seo.twitterCard` or derives from image presence.
11. Preview-pages artifacts must be internally self-consistent on `https://taurgis.github.io/rhino-inquisitor-com/`, remain `noindex`, and never be used as production submission targets; production validation builds must contain zero preview-host URLs and zero accidental `noindex`.

Crawler surfaces:
1. Use Hugo embedded sitemap generation as the baseline starting point.
2. Draft pages remain excluded because production builds never enable draft, future, or expired content.
3. Any built page that is non-indexable must also be explicitly excluded from sitemap output; `seo.noindex` alone is not assumed to change sitemap membership.
4. Alias redirect helpers are not assumed to be excluded by default; Phase 3 must verify sitemap exclusion and override the sitemap template if needed.
5. Canonical sitemap URL is fixed to `https://www.rhino-inquisitor.com/sitemap.xml` for production builds; preview-pages builds may emit preview-host sitemap/feed URLs only for rehearsal validation and are never production submission targets.
6. `robots.txt` is implemented via Hugo output (`enableRobotsTXT = true`) with a repo-owned `src/layouts/robots.txt` template that includes the canonical sitemap directive.
7. `robots.txt` is crawl control only and is never used as a substitute for page-level `noindex`.
8. Staging and preview environments must emit `<meta name="robots" content="noindex">` on every rendered page.
9. The canonical feed route approved in Workstream C (`/feed/`) must remain crawlable and must not be blocked by the production robots policy.

## Workstream E: Library and Tooling Contract
Approved contract:
- Hugo Extended `0.157.0` remains the pinned SSG/build tool per Workstream A and is managed as CI tooling rather than as an npm dependency.
- GitHub Pages custom workflow usage is locked to the official Pages Actions trio `actions/configure-pages@v5`, `actions/upload-pages-artifact@v4`, and `actions/deploy-pages@v4`; detailed workflow semantics remain in Workstream F.
- Approved repo-side migration and validation packages are:
   - existing baseline retained: `fast-glob@3.3.3`, `fast-xml-parser@5.4.2`, `p-limit@7.3.0`;
   - new exact pins approved for Phase 3: `turndown@7.2.2`, `@joplin/turndown-plugin-gfm@1.0.64`, `gray-matter@4.0.3`.
- HTTP client contract is fixed as: Node native `fetch` is the default for new Phase 3+ scripts under the repo Node `>=18` baseline; existing Phase 1 `undici` usage may remain until later cleanup, but no new `undici` usage is required by this contract.
- Existing Phase 1-only packages `zod` and `csv-stringify` remain available for current scripts, but Workstream E does not expand their Phase 3/4 role.
- Optional package decisions are fixed as:
   - HTML DOM parser is deferred to Phase 4 and may only be added if early conversion QA shows repeated DOM-cleanup cases beyond `turndown` plus the GFM plugin.
   - Output minification tooling is deferred and may only be reconsidered if artifact-budget review or representative performance evidence shows material need after correctness and asset/template cleanup stabilize.
- New package approvals must be exact-pinned in `package.json` and `package-lock.json`; a disposable `npm audit` check on `2026-03-09` returned zero known vulnerabilities for newly approved and deferred candidates.

Avoid by default:
- Heavy client-side frameworks for mostly static pages.
- Overlapping SEO plugins that obscure source-of-truth logic.

## Workstream F: Deployment and Operations Contract
Workflow contract:
1. Workflow triggers are fixed to `push` on `main` and `workflow_dispatch`.
2. Build job uses shallow checkout by default because RHI-012 makes front matter `lastmod` authoritative from WordPress export metadata; `fetch-depth: 0` becomes mandatory only if a later approved contract adopts Hugo `.GitInfo` or other git-derived lastmod behavior.
3. Build contract is fixed to workflow-level `HUGO_VERSION=0.157.0` and two artifact modes:
   - preview-pages rehearsal deploys use `actions/configure-pages` `base_url` with `hugo --gc --minify --environment preview --baseURL "${{ steps.pages.outputs.base_url }}/"`;
   - production validation and launch builds use `hugo --gc --minify --environment production` with canonical `https://www.rhino-inquisitor.com/`, excluding draft, future, and expired content.
4. Build/test jobs use ref-scoped concurrency with `cancel-in-progress: true`; deploy job uses a dedicated Pages deployment concurrency group with `cancel-in-progress: false` and depends on build via `needs`.
5. Official Pages action sequence is fixed to `actions/configure-pages@v5`, `actions/upload-pages-artifact@v4` with `path: ./public` and default artifact `github-pages`, then `actions/deploy-pages@v4` targeting `environment: github-pages`.
6. Deploy job minimum permissions are `contents: read`, `pages: write`, and `id-token: write`; broader repository write scopes are not part of this contract.
7. Pages artifact constraints are fixed to the official model: a single gzip archive containing a single tar file generated from `./public` only, with files/directories only and no symbolic or hard links.

Operational constraints to record:
1. Custom domain source of truth:
   - configure domain in repository Pages settings or API for Actions publishing,
   - committed `CNAME` files are ignored and are not required for custom GitHub Actions workflow publishing,
   - save the custom domain in Pages settings before DNS changes.
2. `.nojekyll` is not required for artifact-based Pages deployment and remains relevant only to branch-published or external-CI patterns.
3. Rollback contract uses GitHub rerun of the last known good workflow within the 30-day rerun window or `workflow_dispatch` on the same known-good commit; do not depend on deploy-job-only reruns after artifact expiry.
4. Planning budgets are fixed as guardrails:
   - Phase 1 inventory profiling indicates roughly 220 primary rendered routes plus shared outputs,
   - investigate if the compressed Pages artifact exceeds 100 MB or the CI production build exceeds 5 minutes,
   - block release-candidate promotion if the compressed artifact exceeds 500 MB or Pages deployment approaches the 10-minute timeout window.
5. Action pinning strategy uses the official Pages action majors locked in Workstream E and never `latest`; future SHA hardening must preserve the same semantic versions.

## Required Validation Gates (Defined in Phase 2, Implemented in Phase 3+)

Detailed contract: `analysis/tickets/phase-2/RHI-017-validation-gates-contract.md`

1. URL parity gate: validate every `keep`, `merge`, and `retire` outcome in `migration/url-manifest.json` against `public/`, with `migration/pagination-priority-manifest.json` as a hard pre-condition for pagination routes.
2. Redirect correctness gate: verify one-hop direct legacy-to-final behavior, reject irrelevant mass redirects, and enforce the approved redirect mechanism for the active environment.
3. SEO gate: validate the RHI-014 metadata, canonical, Open Graph, sitemap-membership, and JSON-LD obligations on indexable templates.
4. Link integrity gate: block on internal-link and same-site asset failures; record external-link failures as advisory in CI and blocking at launch.
5. Build integrity gate: run the approved Hugo production build contract, verify draft or future exclusion, and prove deterministic output from the same commit.
6. Deployment integrity gate: verify the RHI-016 workflow contract, Pages artifact constraints, and pre-cutover Pages settings state.
7. Launch-readiness gate: perform the live manual sign-off checks that cannot be proven from repository state alone, including robots, sitemap, feed continuity, social preview, and unintended production `noindex`.
8. Preview-host gate: verify the deployed project-site rehearsal artifact is `noindex`, path-prefix-correct, and free of production-host assumptions before custom-domain cutover work begins.

## Tightened Validation Checklist
1. Every legacy URL maps to exactly one of: same-path output, intentional redirect target, or explicit retire behavior.
2. No irrelevant mass redirects (for example broad redirect-to-home patterns without content equivalence).
3. Canonical URLs are absolute and consistent with rendered paths.
4. No unintended `noindex`, draft, or future content appears in production output.
5. Structured data validates on representative templates (articles and breadcrumbs at minimum).
6. robots and sitemap are intentionally generated and internally consistent.
7. Deployment workflow uses official Pages actions and documented permissions.
8. Preview-pages artifacts remain `noindex` and path-prefix-correct, and production artifacts contain zero preview-host leakage.

## Risks and Mitigations
1. Static-host redirect limitations can reduce migration signal transfer.
- Mitigation: maximize route preservation, trigger edge redirects at threshold.

2. Legacy WordPress system endpoints may not map cleanly.
- Mitigation: classify each endpoint (`keep`, `merge`, `retire`) and avoid irrelevant redirects.

3. Taxonomy drift can break category/video discoverability.
- Mitigation: lock taxonomy route policy and enforce through parity checks.

4. Metadata drift across templates can cause SEO regression.
- Mitigation: centralize metadata partials and enforce CI checks.

5. Preview and production artifact behavior can drift and hide host-specific defects.
- Mitigation: require both preview-pages rehearsal validation and production-only build validation before launch approval.

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
6. Validation gates are defined for both preview-host rehearsal and production-host launch validation.
6. No unresolved architecture blockers remain for scaffolding.

## Resolved Decisions for Phase 3 Entry
1. URL-change threshold and owner:
- Threshold is fixed at 5 percent of indexed URL inventory.
- Formula is fixed: `change_rate = changed_indexed_urls / indexed_urls * 100`, where `indexed_urls = count(disposition == "keep" OR has_organic_traffic == true)` and `changed_indexed_urls = count(indexed_urls where disposition != "keep")`.
- Decision owner is migration owner, with required approval from SEO owner.
2. Legacy endpoint policy:
- `/feed/` is the canonical feed route and must resolve on the migrated site.
- Legacy feed variants (`/feed/rss/`, `/feed/atom/`) merge directly to `/feed/` and must be recorded explicitly in `migration/url-manifest.json`.
- `/comments/feed/`, `/wp-json/`, `/xmlrpc.php`, and legacy `/author/*` system endpoints are retired with explicit not-found behavior (`404` on Pages-only hosting, `410` where edge layer is active).
- Legacy on-site search endpoints (`/search/*`) are retired unless a production search feature is implemented and validated before cutover.
- Tag archives are not part of the approved public route contract for Phase 3; the legacy `/tag/*` family remains retired unless an explicit exception is approved later.
3. Pagination parity policy:
- Strict pagination parity is required only for URL classes with demonstrated value (at least 100 clicks in 90 days or at least 10 referring domains).
- For non-critical deep pagination routes, intentional retirement is allowed with explicit mapping review.
- `migration/pagination-priority-manifest.json` schema and scaffold file must exist before Phase 3 scaffolding; population is assigned to the migration engineer and must be completed before URL parity gate implementation.
- `migration/pagination-priority-manifest.json` must be an array of entries containing `legacy_url`, `url_class`, `value_signal` object (`clicks_90d`, `ref_domains`), `decision` (`keep` or `retire`), and `approvers`.
- Both value signals must be present; when one signal is unavailable, record it as `null` and document data-source limitation.
- Example entry:
```json
[
  {
    "legacy_url": "/category/sfcc/page/2/",
    "url_class": "pagination",
    "value_signal": {
      "clicks_90d": 145,
      "ref_domains": 7
    },
    "decision": "keep",
    "approvers": ["alex@rhino-inquisitor.com", "seo-lead@rhino-inquisitor.com"]
  }
]
```
4. Edge redirect infrastructure timing:
- Edge redirect infrastructure is conditionally approved and must be activated before launch if any Model B trigger is met.
- Current approved baseline calculation is `39.1%` (`131 / 335`), so the trigger is already met and edge redirect infrastructure is mandatory before launch.
- Hugo `aliases` remain approved only as Pages-only fallback behavior and for validation scenarios where origin or edge status-code redirects are not yet active.
5. Feed format scope:
- RSS output is required; Atom parity is optional and non-blocking.
- Phase 4 must publish `migration/feed-compatibility-check.md` (a Phase 4 deliverable) as a table proving legacy feed endpoint outcomes (tested URL, observed status code, final destination URL, content type, and validation timestamp).

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
| Jekyll | 4 | 4 | 4 | 3 | 3 | 5 | 5 | 77 |
| Astro | 4 | 2 | 4 | 4 | 3 | 4 | 4 | 70 |
| Next.js export | 4 | 1 | 4 | 3 | 2 | 3 | 3 | 59 |

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
