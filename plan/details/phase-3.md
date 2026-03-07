# Phase 3 Detailed Plan: Repository Scaffolding and Quality Baseline

## Purpose
Build a production-ready Hugo repository baseline for https://www.rhino-inquisitor.com so content migration in later phases can proceed without reworking architecture, SEO foundations, or deployment mechanics.

Phase 3 converts Phase 2 decisions into executable scaffolding, guardrails, and CI checks.

## Why Phase 3 Is Critical
If Phase 3 is weak, later migration work will appear to progress while introducing hidden failures:
1. URL regressions discovered only after launch.
2. Canonical/meta/schema inconsistencies across templates.
3. Redirect behavior that looks correct in static previews but fails as an SEO signal.
4. GitHub Pages workflow mismatches that block or corrupt deploy artifacts.
5. Performance and accessibility debt that is expensive to remove after content import.

## Scope
In scope:
1. Repository layout and base Hugo setup.
2. Core config hardening (`baseURL`, taxonomies, outputs, sitemap, robots).
3. Template and partial scaffolding for consistent metadata and rendering.
4. Content model/archetype enforcement and route contracts.
5. Redirect and URL parity framework.
6. CI workflow scaffolding for build, URL, SEO, link, and quality checks.
7. Operational docs for local runbooks and release governance.

Out of scope:
1. Full WordPress content conversion.
2. Final DNS cutover.
3. Post-launch monitoring period.

## Inputs and Dependencies
Depends on:
1. [plan/details/phase-1.md](plan/details/phase-1.md): URL inventory and policy decisions.
2. [plan/details/phase-2.md](plan/details/phase-2.md): stack and architecture decisions.
3. URL manifest and mapping artifacts planned in Phase 1 deliverables.

Blocks:
1. Phase 4 content migration.
2. Phase 5 SEO/discoverability implementation depth.
3. Phase 7 deployment cutover readiness.

## Non-Negotiable Constraints (Officially Sourced)
1. Hugo `baseURL` must include protocol and trailing slash to avoid URL drift.
2. Hugo does not follow symlinks; do not design around symlinked content.
3. GitHub Pages custom workflow must use valid Pages artifact format and deploy permissions.
4. Custom domain source of truth is repository settings/API, not only a checked-in `CNAME` file.
5. For Actions-based Pages publishing, an existing `CNAME` file is ignored and not required.
6. Hugo `aliases` generate HTML redirect pages (meta refresh and canonical), not true HTTP `301`/`308` status redirects.
7. Static redirect pages are not equivalent to universal server-side `301`/`308` semantics.
8. `robots.txt` is crawl control, not guaranteed de-index control; use `noindex` for de-index intent.

## Audit Corrections Applied in This Phase Plan
The following corrections are now explicitly encoded to prevent migration mistakes:
1. Redirect semantics correction:
   - Hugo `aliases` are fallback redirect pages, not server status-code redirects.
   - Preserve URLs where possible and use true `301`/`308` redirect infrastructure for high-value moved routes.
2. Custom domain correction:
   - Domain is configured in repository settings/API.
   - `CNAME` file handling must not be treated as the source of truth for Actions-based publishing.
3. Staging index-control correction:
   - Staging protection must use `noindex` controls.
   - Do not rely on `robots.txt` disallow as a de-index mechanism.
4. Feed/sitemap parity correction:
   - Hugo default feed output path (`index.xml`) requires explicit compatibility handling for WordPress feed expectations (for example `/feed/`).
   - Sitemap behavior must be explicitly validated for monolingual versus multilingual mode.
5. Search migration reliability correction:
   - Avoid redirect chains and irrelevant mass redirects.
   - Keep redirects active for at least 12 months, and longer where feasible.

## Workstream A: Repository Bootstrap
Goal: establish deterministic project structure and local development ergonomics.

Tasks:
1. Initialize Hugo project layout and commit baseline directories:
   - `content/`
   - `layouts/`
   - `static/`
   - `assets/`
   - `data/`
   - `archetypes/`
2. Add root docs for migration context and run commands:
   - `README.md` with local dev/build/verification commands.
   - `docs/migration/` for phase-linked operational notes.
3. Pin tooling versions used in CI to prevent drift:
   - Hugo extended version.
   - Node runtime version (for migration and verification scripts).
4. Establish `.gitignore` and output path conventions (`public/` build output excluded from source control unless explicitly needed).

Acceptance criteria:
1. Fresh clone can build locally with one documented command.
2. No implicit environment assumptions beyond documented prerequisites.

## Workstream B: Hugo Configuration Hardening
Goal: enforce route, metadata, and output behavior in configuration rather than ad hoc templates.

Required config decisions:
1. Canonical site URL:
   - `baseURL = "https://www.rhino-inquisitor.com/"`
2. Content language defaults and locale settings.
3. Permalink strategy for posts/pages/categories that matches Phase 1 policy.
4. Taxonomy definitions (`category`, `tag`, and any video taxonomy mapping if required).
5. Output formats and enablement for:
   - HTML
   - sitemap
   - RSS
   - robots
6. Feed compatibility policy:
   - Hugo default feed output is `index.xml`.
   - Preserve or redirect WordPress feed endpoints (for example `/feed/`) explicitly.
7. Sitemap mode policy:
   - Confirm expected sitemap shape for monolingual vs multilingual configuration.
8. Build behavior:
   - drafts/future content excluded in production.
   - minification toggles controlled by environment.

Critical checks:
1. Any change to `baseURL`, permalink rules, or taxonomy paths requires URL parity re-run.
2. No environment-specific canonical host variation in production outputs.

Acceptance criteria:
1. Config expresses all routing/taxonomy rules required by migration.
2. Production build emits expected machine-readable files (`sitemap.xml`, `robots.txt`, feed outputs).
3. Feed and sitemap outputs match the agreed compatibility policy.

## Workstream C: Content Contract and Archetypes
Goal: standardize front matter and prevent inconsistent metadata during bulk import.

Mandatory front matter contract (migrated indexable content):
1. `title`
2. `description`
3. `url`
4. `draft`

Content-type required fields:
1. Articles/posts:
   - `date`
   - `lastmod`
   - `categories`
   - `tags`
2. Pages:
   - `lastmod`
3. `aliases` is required when a URL has mapped legacy paths in the manifest.

Strongly recommended across indexable content:
1. `heroImage` (or equivalent social image field) for richer social and search presentation.

Canonical contract:
1. Canonical defaults to the rendered page absolute URL (`.Permalink`) from canonical `baseURL`.
2. `canonical` front matter is an optional override only.
3. Any canonical override must be absolute HTTPS and must not conflict with sitemap and internal-link canonical signals.

URL safety contract:
1. Hugo does not sanitize `url` front matter values.
2. `url` values must be validated for URL safety and filesystem-safe generation constraints before merge.

Recommended extension fields:
1. `author`
2. `seo.noindex`
3. `seo.ogImage`
4. `seo.twitterCard`
5. `canonical`
6. `video` object for legacy video metadata parity

Tasks:
1. Create archetypes for article/page/category templates with required fields and comments removed from production content.
2. Add schema validation script for front matter consistency and type checks.
3. Add URL safety validation for front matter `url` values, including collision checks and invalid-character/path constraints.
4. Fail CI if required fields are missing on indexable content.

Acceptance criteria:
1. New content created through archetypes is compliant by default.
2. Bulk-imported content can be validated automatically before merge.
3. Canonical generation and optional overrides are verified as non-conflicting.

## Workstream D: Template Scaffolding and Rendering Model
Goal: provide a maintainable template hierarchy before large content volume arrives.

Template design baseline:
1. Base template with blocks for:
   - head/meta
   - primary content
   - structured data
   - footer scripts
2. Partial architecture for:
   - global head metadata
   - social tags
   - canonical
   - breadcrumbs
   - pagination controls
3. Section and taxonomy templates:
   - home
   - article detail
   - page detail
   - archive/list
   - category list and term pages
   - video-related templates if preserved in final route policy

Critical best practices:
1. Keep metadata generation centralized in shared partials.
2. Avoid duplicating logic across list/detail templates.
3. Use predictable lookup-order behavior and document overrides.

Acceptance criteria:
1. All primary template types render with shared metadata and layout primitives.
2. No template relies on undocumented implicit defaults.

## Workstream E: SEO Foundation Implementation
Goal: guarantee baseline SEO signal parity before migration volume increases.

Required SEO outputs per indexable page:
1. Unique title and meta description.
2. Canonical URL aligned to final `https://www` URL.
3. Open Graph tags:
   - `og:title`
   - `og:description`
   - `og:type`
   - `og:url`
   - `og:image`
4. Twitter/X card tags compatible with current platform expectations.
5. Structured data:
   - `BlogPosting` for article templates.
   - `WebSite` for site-level context.
   - `BreadcrumbList` where hierarchy exists.

Required crawler surfaces:
1. `sitemap.xml` generated and deploy-visible.
2. `robots.txt` with sitemap reference and validated directives.
3. Feed outputs for existing subscriber paths (for example `/feed/`) if retained by policy.
4. Staging and temporary hosts enforce `noindex` without blocking crawler access to `noindex` directives.

Critical implications:
1. Canonical tags do not replace missing redirects.
2. Redirect helper pages created by static generation can be weaker migration signals than origin `301`/`308` responses.
3. Any retired URL strategy must avoid soft-404 behavior.
4. Do not mass-redirect unrelated legacy URLs to the homepage or unrelated sections.
5. Keep canonical signals consistent across `rel=canonical`, sitemap entries, and internal linking.
6. Do not use `robots.txt` as a canonicalization mechanism.
7. Client-side redirects can be recognized by search engines, but server-side `301`/`308` redirects are typically recognized faster.

Acceptance criteria:
1. Representative templates pass metadata and schema checks.
2. Crawler files are present and match canonical host policy.
3. Staging indexing controls are validated as `noindex`-based, not `robots.txt`-only.

## Workstream F: URL Preservation and Redirect Baseline
Goal: build executable route-preservation controls before importing full content volume.

Tasks:
1. Build URL parity script using Phase 1 manifest as source-of-truth.
2. Validate each legacy URL has one and only one outcome:
   - direct preserved route
   - mapped redirect target
   - approved retire behavior
3. Add collision checks:
   - duplicate `url` values in content
   - duplicate alias outputs
4. Generate parity report artifact for CI and release reviews.

Critical thresholds:
1. If changed indexed URLs exceed 5 percent of indexed inventory, edge redirect layer becomes mandatory before launch.
2. No redirect chains allowed in approved mapping.
3. Redirect lifespan target is minimum 12 months, with longer retention preferred.

Acceptance criteria:
1. URL parity check runs in CI and is release-blocking.
2. Mapping gaps are explicit failures, not warnings.
3. Redirect QA flags soft-404 risks caused by irrelevant target mapping.

## Workstream G: Asset and Performance Baseline
Goal: prevent static-site bloat and Core Web Vitals regressions early.

Tasks:
1. Define image strategy:
   - responsive image generation policy
   - modern formats (`webp`/`avif`) where practical
   - explicit dimensions to reduce layout shift
2. Define asset budgets per template class:
   - total JS budget
   - CSS budget
   - image weight guidelines
3. Minimize JavaScript by default; no framework hydration unless justified by user need.
4. Add automated Lighthouse CI profile for core templates.

Acceptance criteria:
1. Initial scaffold meets Core Web Vitals good-threshold targets on representative templates:
   - LCP <= 2.5s
   - INP <= 200ms
   - CLS <= 0.1
   - using 75th percentile framing where field data is available
2. No uncontrolled third-party script inclusion.

## Workstream H: Accessibility and UX Baseline
Goal: avoid accessibility retrofits late in migration.

Tasks:
1. Define semantic structure expectations for all templates:
   - one `h1`
   - landmark regions
   - keyboard navigability
2. Ensure image alt-text handling policy is encoded in content contract.
3. Run automated accessibility checks on representative pages.
4. Capture known manual-review checks for focus order, skip links, and contrast.

Acceptance criteria:
1. Templates pass baseline WCAG 2.2 AA checks used by project tooling.
2. Conformance review treats full pages and complete processes as the assessment scope.
3. Accessibility regressions are CI-visible.

## Workstream I: Security, Privacy, and Operational Hardening
Goal: ship a static site that is secure-by-default despite limited origin controls on Pages.

Tasks:
1. Document header strategy and implementation layer:
   - what can be done in GitHub Pages alone
   - what requires edge/CDN (CSP, HSTS tuning, advanced headers)
2. Validate HTTPS and mixed-content cleanliness in generated markup.
3. Define privacy-safe analytics and consent behavior (if analytics is retained).
4. Ensure no accidental exposure of migration artifacts, draft content, or internal URLs.

Acceptance criteria:
1. Security control matrix exists with owner per control.
2. No high-risk mixed-content or accidental indexable private content in sample build.

## Workstream J: CI/CD and Deployment Scaffolding
Goal: make deploy behavior deterministic and auditable.

Tasks:
1. Create Pages workflow with official action sequence:
   - configure-pages
   - upload-pages-artifact
   - deploy-pages
2. Configure required permissions and environment protection flow:
   - `pages: write`
   - `id-token: write`
   - deploy target environment `github-pages`
3. Ensure artifact packaging constraints are met:
   - artifact name `github-pages`
   - use `actions/upload-pages-artifact` unless custom packaging exactly matches required format
   - no symbolic links or hard links in deployment artifact
4. Add pre-deploy checks:
   - Hugo production build
   - URL parity check
   - metadata/schema smoke checks
   - broken link check
5. Configure custom domain in repository settings/API and verify DNS and HTTPS status during release checks.
   - Verify the custom domain with GitHub Pages before assigning it to the repository.
   - Avoid wildcard DNS records due to takeover risk.
6. Add `.nojekyll` handling when needed to avoid unintended processing behavior.
7. Include Search Console migration runbook steps:
   - submit new sitemap set after cutover
   - keep old sitemap references during transition as needed
   - monitor indexing and soft-404 signals during migration window
8. Add workflow concurrency control for deployment jobs to prevent overlapping Pages deploys.

Acceptance criteria:
1. Main branch deployment is reproducible from clean CI environment.
2. Deploy is blocked automatically on quality gate failures.

## Required Libraries and Tooling (Phase 3 Baseline)
Hugo and deployment:
1. Hugo extended (pinned)
2. GitHub Pages actions:
   - `actions/configure-pages`
   - `actions/upload-pages-artifact`
   - `actions/deploy-pages`

Migration and validation scripts (Node-based):
1. `turndown`
2. `@joplin/turndown-plugin-gfm`
3. `gray-matter`
4. `fast-glob`
5. `fast-xml-parser`
6. `p-limit`
7. `undici` (or Node native fetch on pinned runtime)
8. `zod` for manifest/front-matter schema validation
9. `csv-stringify` for audit/report exports

Quality checks (recommended for Phase 3 adoption):
1. `markdownlint-cli2` for plan/docs consistency
2. `html-validate` for static HTML policy checks
3. `pa11y-ci` (or equivalent) for automated accessibility checks
4. `@lhci/cli` for Lighthouse CI runs

Critical note:
If tool adoption creates high setup overhead, prioritize URL parity, build determinism, and SEO smoke checks first. Accessibility and Lighthouse checks can be staged but must be scheduled and tracked.

## Phase 3 Deliverables
1. `hugo.toml` with locked routing/output policy.
2. Base template and shared metadata partials scaffold.
3. Archetypes for primary content types.
4. CI workflow for Pages deployment with gate checks.
5. URL parity script and report artifact format.
6. SEO smoke-check script and representative fixture pages.
7. Phase 3 runbook doc covering local and CI execution.

## Definition of Done
Phase 3 is complete only when all are true:
1. Repository scaffolding supports deterministic local and CI builds.
2. Core template types exist and include shared SEO primitives.
3. Front matter contract is machine-validated in CI.
4. URL parity checks are implemented and release-blocking.
5. Pages deployment workflow is configured and successfully deploys test artifact.
6. Baseline performance/accessibility/security checks run and produce report artifacts.
7. Custom domain and HTTPS readiness are validated from repository settings/API and DNS state.
8. Staging noindex controls are verified to avoid accidental indexation.
9. Outstanding risks have owners, mitigations, and target resolution phase.

## Critical Risks and Mitigations
1. Risk: over-reliance on static alias redirects for high-volume moved URLs.
   - Mitigation: preserve URLs wherever possible; escalate to edge redirects if threshold breached.
2. Risk: canonical/metadata drift due to duplicated template logic.
   - Mitigation: enforce shared partials and template snapshot checks.
3. Risk: GitHub Pages domain and DNS misconfiguration near cutover.
   - Mitigation: pre-validate settings/API state and DNS records before launch week.
4. Risk: performance degradation from unoptimized media imports.
   - Mitigation: enforce image policy and budget checks before importing full media set.
5. Risk: WCAG regressions hidden by content-focused migration urgency.
   - Mitigation: enforce minimum automated accessibility gates in CI.
6. Risk: migration signal dilution from combining too many high-impact changes simultaneously.
   - Mitigation: stage and sequence changes where practical (for example infrastructure first, then large URL/content changes in controlled batches).

## Suggested Timeline (7-10 Working Days)
1. Day 1: bootstrap repo structure, pin runtimes, create baseline config.
2. Day 2: template skeleton and metadata partial architecture.
3. Day 3: archetypes and front matter validation scripts.
4. Day 4: URL parity and collision checks wired to CI.
5. Day 5: Pages workflow and deployment smoke.
6. Day 6: performance/accessibility/security baseline automation.
7. Day 7: fix-forward on gaps and produce sign-off package.
8. Days 8-10 (buffer): unresolved blockers and environment-specific hardening.

## Exit Gate to Phase 4
Phase 4 cannot start until:
1. CI pipeline is passing on scaffold-only content.
2. URL parity tooling is validated against a sampled subset of Phase 1 manifest.
3. SEO smoke checks pass on all primary template classes.
4. Deployment to Pages succeeds in non-production dry run with correct canonical host behavior.

## Official References
Hugo:
1. https://gohugo.io/getting-started/quick-start/
2. https://gohugo.io/getting-started/directory-structure/
3. https://gohugo.io/content-management/organization/
4. https://gohugo.io/content-management/front-matter/
5. https://gohugo.io/content-management/urls/
6. https://gohugo.io/content-management/taxonomies/
7. https://gohugo.io/templates/base/
8. https://gohugo.io/templates/lookup-order/
9. https://gohugo.io/templates/embedded/
10. https://gohugo.io/templates/sitemap/
11. https://gohugo.io/templates/rss/
12. https://gohugo.io/templates/robots/
13. https://gohugo.io/content-management/urls/#aliases
14. https://gohugo.io/commands/hugo/

GitHub Pages:
1. https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
2. https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
3. https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
4. https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages
5. https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
6. https://github.com/actions/deploy-pages
7. https://github.com/actions/upload-pages-artifact
8. https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages
9. https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#concurrency

Google Search guidance:
1. https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
2. https://developers.google.com/search/docs/crawling-indexing/site-move-no-url-changes
3. https://developers.google.com/search/docs/crawling-indexing/301-redirects
4. https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
5. https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
6. https://developers.google.com/search/docs/crawling-indexing/robots/intro
7. https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
8. https://developers.google.com/search/docs/crawling-indexing/block-indexing

Quality standards:
1. https://web.dev/vitals/
2. https://developers.google.com/search/docs/appearance/page-experience
3. https://www.w3.org/TR/WCAG22/
