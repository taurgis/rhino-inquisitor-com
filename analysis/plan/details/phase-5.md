# Phase 5 Detailed Plan: SEO and Discoverability

## Purpose
Protect and improve organic discoverability during the migration of https://www.rhino-inquisitor.com from WordPress to Hugo on GitHub Pages.

Phase 5 turns SEO and crawlability from "best effort" into release-blocking engineering controls.

## Why Phase 5 Is High Risk
Most migration traffic loss comes from preventable technical mistakes, not content quality decline. The highest-risk failure modes are:
1. Redirect behavior that appears correct in local/browser checks but sends weak migration signals to search engines.
2. Canonical conflicts across templates, redirects, and sitemap entries.
3. Crawl/index controls that accidentally hide important content.
4. Metadata/schema coverage gaps introduced by partial template adoption.
5. Mobile and performance regressions that reduce indexing quality and rankings.
6. Loss of legacy discoverability surfaces (feeds, archives, category/video hubs).

## Phase Position and Dependencies
From [main-plan.MD](../../../main-plan.MD), Phase 5 depends on Phase 3 and runs in parallel with Phase 4.

Phase 5 consumes:
1. [phase-1.md](phase-1.md): URL inventory, canonical host policy, disposition rules.
2. [phase-2.md](phase-2.md): architecture decisions and redirect policy constraints.
3. [phase-3.md](phase-3.md): template scaffolding, CI framework, baseline quality gates.
4. [phase-4.md](phase-4.md): content completeness, front matter quality, URL mapping outputs.

## Scope
In scope:
1. Metadata and canonical strategy implementation.
2. Redirect signal strategy aligned to static-hosting constraints.
3. Crawl/index controls (`robots.txt`, `noindex`, sitemap governance).
4. Structured data coverage and rich-result eligibility checks.
5. Mobile-first parity, Core Web Vitals, and discoverability performance controls.
6. Feed and archive discoverability continuity.
7. Search Console and analytics monitoring runbooks.

Out of scope:
1. Full bulk content conversion mechanics (Phase 4).
2. DNS cutover execution (Phase 7).
3. Long-tail post-launch growth initiatives unrelated to migration stability (post Phase 9).

## Non-Negotiable Constraints
1. Every indexable URL must have one and only one intended canonical outcome.
2. Redirect chain count for migration routes must be zero in final configuration.
3. Canonical, sitemap URL, and internal-link destination must agree for each indexable URL.
4. `robots.txt` must never be used as a substitute for de-indexing decisions.
5. Staging `noindex` controls must not leak into release artifacts.
6. Any intentional URL retirement must resolve to meaningful `404` behavior, not thin soft-404 substitutes.
7. Pages targeted for indexation must be fully accessible on mobile with equivalent primary content and structured data.
8. Static-host redirect limitations must be treated as design constraints, not ignored as implementation details.
9. Any URL class relying on `noindex` must remain crawlable so crawlers can see the directive.
10. Non-HTML de-indexing and redirect needs must be solved with infrastructure that supports required headers or redirects.
11. Build and deployment outputs must stay within GitHub Pages and Pages artifact constraints.

## Critical Corrections Encoded in This Phase
1. Redirect implementation correction:
- Preferred migration signal is server-side permanent redirect (`301` or `308`) where infrastructure supports it.
- Hugo `aliases` produce static redirect pages, not true origin-level status-code redirects.
- Hugo `aliases` client-side redirects require HTML fetch/parse and are weaker operationally for large redirect sets.
- If static redirect behavior is insufficient for high-value moved URLs, add an edge redirect layer before launch.

2. Canonical signal correction:
- Canonical tags are supporting signals, not substitutes for redirect correctness.
- Duplicate/conflicting canonicals are release blockers.

3. Crawl-control correction:
- `robots.txt` controls crawling, not guaranteed indexing outcomes.
- Use `noindex` intentionally for de-indexing behavior; do not block crawlers from seeing pages that must be de-indexed.

4. Non-HTML control correction:
- `noindex` for non-HTML resources requires `X-Robots-Tag` headers, which static-only hosting cannot always set per path.
- Resource classes needing header-level control must be retained on infrastructure that supports response-header rules.

5. Mobile-first correction:
- Mobile parity is mandatory for indexing quality.
- Missing mobile content/metadata/schema can reduce visibility even when desktop looks complete.

6. Discoverability surface correction:
- Preserve or intentionally map WordPress discoverability endpoints (`/feed/`, archives, category/video hubs).
- Do not silently remove high-value archive/taxonomy surfaces.

7. Host constraint correction:
- GitHub Pages site limits and Pages artifact constraints are release blockers, not advisory notes.

## Workstream A: Metadata and Canonical Signal Architecture
Goal: ensure deterministic metadata and canonical behavior on every template type.

Required metadata outputs for every indexable page:
1. Unique page title.
2. Unique meta description.
3. Exactly one canonical URL tag.
4. Open Graph baseline (`og:title`, `og:description`, `og:type`, `og:url`, `og:image`).
5. Social card compatibility tags.

Canonical policy:
1. Default canonical is self-referencing absolute URL from production host.
2. Canonical overrides are rare and allowed only for approved cross-canonical cases.
3. Override values must be absolute HTTPS and must not conflict with sitemap entries.

Validation rules:
1. Reject pages with missing title, description, or canonical.
2. Reject pages with multiple canonical tags.
3. Reject canonicals that point to non-final host variants.
4. Reject canonicals that point to redirected URLs.

Acceptance criteria:
1. 100 percent metadata completeness for indexable URLs.
2. Zero canonical conflicts in automated checks.

## Workstream B: Redirect and URL Consolidation Signals
Goal: protect ranking and discovery signals during path changes.

Required redirect behavior by disposition:
1. `keep`: render final page at the exact preserved route.
2. `merge`: redirect legacy route directly to final target route.
3. `retire`: return meaningful `404` unless an equivalent destination exists.

Redirect implementation policy:
1. Use server-side `301` or `308` where supported.
2. On Pages-only static behavior, use instant redirect pages generated from Hugo aliases.
3. Disallow JavaScript-only redirects for migration-critical paths.
4. Document redirect mechanism per URL class (`server-301`, `server-308`, `client-meta-refresh`, `none`) in migration reports.

Quality controls:
1. Zero redirect chains.
2. Zero redirect loops.
3. Zero broad irrelevant redirects to homepage.
4. Redirect target must match content intent (topic-level equivalence).

Escalation trigger:
1. If URL change rate exceeds 5 percent, edge redirect layer becomes mandatory before launch.
	- `indexed_urls = count(disposition == "keep" OR has_organic_traffic == true)`
	- `changed_indexed_urls = count(indexed_urls where disposition != "keep")`
	- `change_rate = changed_indexed_urls / indexed_urls * 100`
2. If alias volume materially increases output footprint or deployment risk, move redirect handling to edge/server rules.

Acceptance criteria:
1. 100 percent of migrated legacy URLs have explicit outcome.
2. Redirect validation report shows zero chain/loop defects.
3. Redirect mechanism report exists and is approved by migration owner.

## Workstream C: Crawlability and Indexing Controls
Goal: ensure important pages are crawlable and intended indexing outcomes are explicit.

Required controls:
1. Production `robots.txt` aligned with crawl intent and includes sitemap reference.
2. No accidental disallow rules for core content templates or required assets.
3. `noindex` used intentionally and only where policy requires.
4. Environment-specific controls for staging/previews to avoid accidental indexation.

Critical rule:
1. Do not pair `Disallow` with a de-index objective when search engines need to crawl the page to see `noindex`.

Validation checks:
1. Robots parser checks for blocked critical sections.
2. URL sample verifies intended robots/noindex behavior.
3. Pre-launch artifact scan rejects unintended `noindex` on indexable templates.
4. Block release if any URL relies on `noindex` while blocked in `robots.txt`.

Acceptance criteria:
1. Zero unintended crawl blocks on indexable sections.
2. Zero unintended `noindex` tags on release artifact.
3. Zero `robots`/`noindex` contradiction defects in policy report.

## Workstream D: Sitemap, Feed, and Discovery Surface Continuity
Goal: preserve machine-readable discovery pathways before and after cutover.

Sitemap requirements:
1. Generate sitemap entries from indexable final URLs only.
2. Exclude redirect-helper pages and drafts.
3. Keep sitemap host/path consistent with canonical URLs.
4. Maintain sitemap size/count limits with index files when needed.
5. Ensure sitemap URLs are absolute and use the canonical scheme/host.
6. Ensure `lastmod` is tied to meaningful content updates and not noisy rebuild timestamps.

Feed requirements:
1. Preserve active subscriber feed behavior (`/feed/` compatibility or explicit redirect mapping).
2. Ensure feed output includes valid canonical links and publication dates.
3. Validate archive and category feed discoverability where historically relevant.

Archive and taxonomy requirements:
1. Preserve category/video/archive URLs with demonstrated organic value.
2. Avoid removing pagination/archives without data-backed replacement strategy.

Acceptance criteria:
1. Sitemaps are valid, fetchable, and reference only canonical URLs.
2. Feed endpoint behavior is documented, tested, and parity-checked.

## Workstream E: Structured Data and Rich-Result Readiness
Goal: maintain or improve rich-result eligibility and semantic clarity.

Structured data baseline:
1. `WebSite` for global site context.
2. `BlogPosting` or `Article` for article detail templates.
3. `BreadcrumbList` where hierarchical navigation exists.
4. `VideoObject` for indexable video watch pages retained from legacy content.

Policy requirements:
1. Structured data must reflect visible page content.
2. Required properties for each schema type must be present.
3. Do not include unsupported or misleading structured data.

Validation requirements:
1. Rich Results Test pass for representative templates.
2. Schema lint checks in CI for required properties and value types.
3. Post-launch Search Console rich-result reports monitored for invalid spikes.
4. Structured data values must match visible page content and page intent.

Acceptance criteria:
1. Zero critical schema validation errors on representative page set.
2. Schema coverage report includes all applicable template families.

## Workstream F: Internal Linking and Information Architecture Signals
Goal: ensure discovery pathways and topical clustering remain crawl-efficient.

Required controls:
1. Internal links must target canonical final URLs.
2. Orphan pages are not allowed for indexable content.
3. Breadcrumb and related-content modules must reinforce taxonomy relevance.
4. Pagination and archive traversal must remain crawlable for important content sets.

Checks:
1. Internal-link graph analysis to detect orphan nodes.
2. Broken-link scanning across generated output.
3. Click-depth reporting for high-value landing pages.

Acceptance criteria:
1. Zero broken internal links on critical templates.
2. Zero indexable orphan pages.

## Workstream G: Mobile-First and Core Web Vitals Controls
Goal: prevent discoverability regressions caused by mobile and performance debt.

Mobile-first requirements:
1. Equivalent primary content and metadata on mobile/desktop.
2. Equivalent structured data across mobile/desktop rendering.
3. No critical content hidden behind interaction-only lazy patterns.

Core Web Vitals targets (75th percentile target framing where field data exists):
1. LCP <= 2.5s.
2. INP <= 200ms.
3. CLS <= 0.1.

Implementation controls:
1. Image dimension and responsive-srcset requirements on article/list templates.
2. Strict JS budget for mostly static pages.
3. Critical CSS and font-loading strategy to reduce render delay.

Acceptance criteria:
1. Lab baselines pass on representative templates before cutover.
2. Lighthouse is used as a regression budget check, not as a proxy for field CWV outcomes.
3. Search Console CWV report trends monitored post-launch with no sustained regression.

## Workstream H: Image and Video SEO Integrity
Goal: retain media discoverability and avoid render/indexing regressions.

Image controls:
1. Descriptive alt text policy with decorative exceptions.
2. Stable media URLs or explicit redirects for moved media.
3. Compressed modern formats with quality controls and fallbacks.

Video controls:
1. Preserve watch-page indexability for legacy video pages with traffic/backlinks.
2. Validate playable media accessibility and metadata consistency.
3. Apply `VideoObject` schema only where content qualifies.

Acceptance criteria:
1. No missing media on representative templates.
2. Image/video schema validation passes where applicable.

## Workstream I: Accessibility as Discoverability Support
Goal: reduce risk that poor semantics degrade crawl interpretation and UX signals.

Required checks:
1. One logical `h1` per page template.
2. Landmark regions and skip navigation pattern.
3. Non-text content alternatives policy.
4. Keyboard accessibility and focus visibility checks on core templates.

Standard target:
1. WCAG 2.2 AA baseline for in-scope templates.

Acceptance criteria:
1. Automated and manual accessibility checks show no critical unresolved defects on representative pages.

## Workstream J: Search Console and Analytics Monitoring Program
Goal: detect migration regressions early and recover quickly.

Pre-launch checklist:
1. Verify Search Console property access continuity for canonical host.
2. Prepare baseline report snapshots (indexing, CWV, top landing pages, links).
3. Prepare URL Inspection sample set for high-value routes.
4. Verify sitemap submission workflow and ownership before cutover day.
5. Verify preservation of any DNS/HTML verification methods across deployment changes.

Launch-week monitoring:
1. Submit sitemap and confirm fetch success.
2. Monitor Page Indexing for not-found, redirect, duplicate, and crawl anomalies.
3. Monitor rich-result status reports for new invalid items.

30/60-day monitoring:
1. Compare organic landing pages and clicks versus baseline windows.
2. Track unresolved 404 patterns and redirect misses.
3. Re-crawl top linked legacy URLs to confirm expected outcomes.

Incident response thresholds:
1. If indexable 404 spike exceeds 2 percent of indexed URLs or 25 priority URLs in any 24-hour window, trigger rollback/patch window.
2. If canonical mismatch is detected on any priority URL or exceeds 0.5 percent across sampled indexable URLs, block additional rollout batches.
3. If high-value page impressions decline more than 20 percent versus the Phase 1 baseline for 7 consecutive days (excluding expected launch-week volatility), escalate technical audit.

Acceptance criteria:
1. Monitoring runbook exists with owners, cadence, and escalation triggers.
2. Launch and 30/60-day review checkpoints are scheduled before cutover.

## Workstream K: Non-HTML Resource SEO Controls
Goal: prevent migration blind spots for PDFs, media files, and other non-HTML endpoints.

Required controls:
1. Classify non-HTML legacy resources as `keep`, `redirect`, or `retire` with explicit behavior.
2. Preserve high-value media/PDF URLs where redirect or header controls are unavailable.
3. Use `X-Robots-Tag` only where infrastructure can emit response headers.
4. Do not assume `robots.txt` can replace non-HTML `noindex` needs.

Validation checks:
1. Non-HTML URL inventory parity check for in-scope legacy assets.
2. Spot-check response headers and status for representative non-HTML URLs.
3. Fail release if required non-HTML index controls are impossible on chosen hosting path.

Acceptance criteria:
1. Non-HTML policy is implemented per URL class with owner sign-off.
2. No unresolved non-HTML indexing/redirect blockers remain.

## Workstream L: GitHub Pages Limits and Artifact Integrity
Goal: prevent deployment-time SEO incidents caused by hosting and artifact constraints.

Required controls:
1. Enforce published site size budget against GitHub Pages limits.
2. Enforce deployment-time budget against Pages deployment timeout expectations.
3. Enforce Pages artifact validation constraints when using custom workflows.
4. Track alias growth impact on output size and file-count behavior.
5. Document build-rate expectations by publishing mode:
- branch-based Pages builds are subject to Pages build-rate soft limits.
- custom GitHub Actions workflows are not subject to the Pages 10 builds/hour soft limit, but deployment size/time constraints still apply.
6. Verify custom domain ownership, DNS correctness, and HTTPS readiness before cutover.

Validation checks:
1. CI gate for site output size with explicit fail threshold.
2. CI gate for artifact format/size constraints required by Pages deployment.
3. CI report tracks alias count and generated redirect-file footprint trend.

Acceptance criteria:
1. Build artifacts remain within documented Pages and Pages-artifact constraints.
2. Deployment pipeline remains stable under expected migration batch sizes.

## Required Libraries and Tooling (Phase 5)
Required:
1. `zod`
- Schema validation for metadata, canonical, and sitemap records.
2. `fast-glob`
- Efficient content and generated-output discovery.
3. `fast-xml-parser`
- Sitemap/feed parsing for validation and parity checks.
4. `cheerio`
- HTML-level tag extraction checks (canonical/meta/schema).
5. `linkinator` or `broken-link-checker`
- Broken-link validation for internal discovery paths.
6. `pa11y-ci` (or equivalent)
- Accessibility quick checks on representative pages.
7. `@lhci/cli`
- Lab-based performance quality gate for representative templates.
8. `file-type` (optional but recommended where media integrity is high risk)
- Verify non-HTML assets by signature when extension trust is insufficient.

Strongly recommended:
1. `html-validate`
- Policy checks for malformed head metadata and duplicate tags.
2. `csv-stringify`
- Deterministic compliance report outputs.
3. `playwright`
- Rendered-page checks for canonical/meta/schema presence and visual parity.

Optional:
1. `schema-dts`
- Typed schema objects in generation logic where TypeScript is used.
2. `ajv`
- JSON Schema validation for generated structured data payloads.

Anti-patterns:
1. Adding heavy runtime client frameworks solely to implement metadata logic.
2. Using multiple overlapping SEO plugins with unclear source of truth.
3. Relying on manual spot checks instead of automated release gates.

## CI Quality Gates and Blocking Thresholds
Every migration batch PR must pass:
1. Metadata completeness check (title/description/canonical).
2. Canonical conflict and canonical-host check.
3. Redirect parity and chain/loop check.
4. Robots/noindex policy check.
5. Sitemap validation and canonical URL consistency check.
6. Structured data required-field check.
7. Internal-link integrity check.
8. Accessibility quick scan.
9. Lighthouse representative template checks.
10. Non-HTML resource policy and header/status checks.
11. Pages output and artifact constraint checks.

Blocking thresholds:
1. Missing required metadata on indexable pages: 0 allowed.
2. Canonical conflicts: 0 allowed.
3. Redirect chains/loops in mapped migration routes: 0 allowed.
4. Broken internal links on critical templates: 0 allowed.
5. Unintended `noindex` on indexable pages: 0 allowed.
6. Invalid required schema properties on critical templates: 0 allowed.
7. `robots`/`noindex` contradiction defects: 0 allowed.
8. Artifact-format violations for Pages deployment: 0 allowed.

## Must-Have Launch Checklist
1. Canonical host is consistent across `baseURL`, canonical tags, sitemap URLs, and internal links.
2. All high-value legacy URLs are either preserved or redirected to equivalent targets.
3. Redirect behavior type is documented for each moved route class.
4. `robots.txt` and sitemap are production-correct and internally consistent.
5. Structured data is valid on representative pages for each major template family.
6. Mobile and desktop parity checks pass for content/metadata/schema.
7. Feed compatibility strategy is implemented and verified.
8. Search Console properties, sitemap submissions, and monitoring runbook are prepared.
9. Staging-only index suppression controls are removed from release artifact.
10. Non-HTML resource strategy is validated for redirects and index-control needs.
11. Pages size/artifact checks are green for the release candidate.

## Deliverables
1. `migration/phase-5-seo-contract.md`
2. `migration/phase-5-canonical-policy.md`
3. `migration/phase-5-redirect-signal-matrix.csv`
4. `migration/phase-5-sitemap-feed-policy.md`
5. `migration/phase-5-structured-data-coverage.md`
6. `migration/phase-5-monitoring-runbook.md`
7. `migration/reports/phase-5-gate-summary.csv`
8. `migration/reports/phase-5-non-html-policy.csv`
9. `migration/reports/phase-5-pages-constraints-report.md`

## Definition of Done
Phase 5 is complete only when all statements are true:
1. Metadata/canonical requirements are fully implemented and validated.
2. Redirect and URL-consolidation behavior is documented, tested, and policy-compliant.
3. Crawl and index controls are explicit, correct, and environment-safe.
4. Sitemap/feed discoverability surfaces are validated and compatible with migration goals.
5. Structured data is valid and coverage is complete for applicable templates.
6. Mobile-first and baseline CWV gates are operational and passing for representative templates.
7. Search Console and analytics monitoring plan is active with owners and thresholds.
8. Non-HTML resource indexing and redirect behavior is resolved for in-scope assets.
9. Pages constraint and artifact-integrity checks are passing in CI.
10. No unresolved Phase 5 blocking defects remain for launch-readiness gates.

## Exit Gate to Phase 6 and Phase 8
Phase 6 and Phase 8 launch-readiness work may proceed only if:
1. Phase 5 blocking gates are green on latest release candidate.
2. Redirect behavior and canonical policies are frozen for launch window.
3. Monitoring and rollback decision paths are confirmed with owners.

## Suggested Timeline (8-12 Working Days)
1. Days 1-2: metadata/canonical implementation and validation scripts.
2. Days 3-4: redirect signal checks and crawl/index governance checks.
3. Days 5-6: structured data coverage and sitemap/feed compatibility validation.
4. Days 7-8: mobile/CWV/accessibility gate hardening.
5. Days 9-10: Search Console runbook setup and incident-threshold tuning.
6. Days 11-12: non-HTML and Pages-constraint hardening, then final sign-off package.

## Official References
Google Search Central:
1. https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
2. https://developers.google.com/search/docs/crawling-indexing/301-redirects
3. https://developers.google.com/crawling/docs/troubleshooting/http-status-codes#3xx-redirection
4. https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
5. https://developers.google.com/search/docs/crawling-indexing/robots/intro
6. https://developers.google.com/search/docs/crawling-indexing/block-indexing
7. https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
8. https://developers.google.com/search/docs/monitor-debug/search-console-start
9. https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
10. https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
11. https://developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps
12. https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
13. https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing
14. https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
15. https://developers.google.com/search/docs/appearance/structured-data/sd-policies
16. https://developers.google.com/search/docs/appearance/structured-data/video
17. https://developers.google.com/search/docs/appearance/video
18. https://developers.google.com/search/docs/appearance/google-images

Search Console documentation:
1. https://support.google.com/webmasters/answer/7440203
2. https://support.google.com/webmasters/answer/7451001
3. https://support.google.com/webmasters/answer/9012289
4. https://support.google.com/webmasters/answer/9205520
5. https://support.google.com/webmasters/answer/7552505

Hugo:
1. https://gohugo.io/content-management/urls/#aliases
2. https://gohugo.io/templates/sitemap/
3. https://gohugo.io/templates/robots/
4. https://gohugo.io/templates/rss/

GitHub Pages:
1. https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
2. https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages
3. https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
4. https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages
5. https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
6. https://github.com/actions/upload-pages-artifact

Performance and accessibility:
1. https://web.dev/articles/vitals
2. https://web.dev/articles/lab-and-field-data-differences
3. https://www.w3.org/WAI/tutorials/images/
4. https://www.w3.org/TR/WCAG22/

Hugo configuration and URL behavior:
1. https://gohugo.io/configuration/all/#baseurl
2. https://gohugo.io/configuration/relativeurls/

Standards and supporting references:
1. https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/301
2. https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link