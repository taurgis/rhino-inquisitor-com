# Phase 4 Detailed Plan: Content Migration Pipeline

## Purpose
Execute a controlled, auditable migration of content from WordPress into Hugo content files while preserving URL equity, metadata quality, media integrity, and indexability for https://www.rhino-inquisitor.com.

Phase 4 is where most irreversible SEO mistakes are introduced. This phase must prioritize correctness and traceability over speed.

## Why This Phase Is High Risk
A content migration can look successful in local preview while failing in production search behavior. The main failure modes are:
1. URL drift (slug or trailing-slash mismatches).
2. Broken or low-fidelity redirects for changed URLs.
3. Metadata loss (title/description/canonical/schema fields dropped).
4. Media breakage (missing files, wrong MIME, hotlinked assets).
5. Internal link regressions (links still pointing to old WordPress routes).
6. Soft-404 patterns caused by weak retire handling.
7. Accessibility regression (missing alt text, broken heading hierarchy).

## Phase 4 Position in Program
From [main-plan.MD](main-plan.MD), Phase 4 depends on Phase 3 and runs in parallel with Phase 5.

Phase 4 objective from top-level plan:
1. Export WordPress content.
2. Convert HTML to Markdown.
3. Preserve URLs using explicit front matter `url` and `aliases`.
4. Download/relink media.
5. Produce per-item migration report.

This document expands those items into an execution-grade plan.

## Scope
In scope:
1. Extraction from WordPress export sources.
2. Normalization and transformation into migration dataset.
3. HTML-to-Markdown conversion with deterministic rewrite rules.
4. Front matter mapping to Hugo contract.
5. URL and alias assignment from Phase 1 manifest.
6. Media ingestion and path rewriting.
7. Migration QA reports and release-blocking checks.

Out of scope:
1. Final SEO strategy tuning for discoverability experiments (Phase 5).
2. Deployment and DNS cutover (Phase 7).
3. Post-launch monitoring window (Phase 9).

## Dependencies and Inputs
Required from earlier phases:
1. Phase 1 URL artifacts and policies:
- `migration/url-inventory.normalized.json`
- `migration/url-manifest.json`
- host/slash/case/query policy decisions.
2. Phase 2 architecture contract (Hugo + Pages + front matter requirements).
3. Phase 3 scaffolding:
- Hugo config and template baseline.
- Discovery and article UI expectations from `RHI-104` and `RHI-105`.
- front matter validator.
- CI baseline.

Required external access:
1. WordPress export/API sources (WXR and REST as available).
2. Full WordPress SQL dump for metadata recovery and audit.
3. Full WordPress filesystem snapshot for uploads and source-of-truth verification of content-bearing assets.
4. Media origin access.
5. Search Console baseline data for QA comparisons.

## Publishing Model and Domain Authority Prerequisites
These decisions are usually finalized in deployment phases, but Phase 4 depends on them for canonical and redirect correctness.

1. Lock publishing model before large-batch migration:
- GitHub Pages branch/folder publishing, or
- GitHub Pages custom GitHub Actions workflow.
2. If using GitHub Actions deployment, treat Pages settings as custom-domain source of truth.
3. If using GitHub Actions deployment, do not assume a generated `CNAME` file controls domain configuration.
4. Lock one canonical host variant (apex or `www`) and ensure:
- Pages custom domain,
- Hugo `baseURL`,
- template canonical generation,
all use the same host.
5. Do not use wildcard DNS records for GitHub Pages custom domain setup.
6. Treat `https://taurgis.github.io/rhino-inquisitor-com/` as a preview-only rehearsal host injected at build time; migrated content and front matter must not depend on that host directly.

## Non-Negotiable Migration Constraints
1. Legacy URL behavior must be explicit per URL record (`keep`, `merge`, `retire`).
2. No migrated page is allowed to receive an implicit auto-generated route.
3. Every indexable page must have explicit metadata fields populated or intentionally inherited from deterministic defaults.
4. Any unrecoverable content loss must be recorded in migration reports and approved by owner.
5. Migration scripts must be idempotent and rerunnable without manual cleanup.
6. Every script must fail with actionable errors, not silent warnings.
7. Redirect implementation type must be explicit (`server-301-308`, `meta-refresh`, `none`) per migrated URL where applicable.
8. Staging index controls must be removed from release artifacts before launch (`noindex` and accidental robots blocks are release blockers).
9. Canonicalization signals must be consistent across canonical tags, sitemap URLs, internal links, and redirect targets.
10. Generated content and front matter must remain environment-agnostic; no reusable field may hardcode the preview or production absolute host unless an approved same-host canonical override explicitly requires it.

## Staging Indexing Policy (No Contradictions)
When staging is publicly reachable, use one of the following models and do not mix incompatible controls.

1. Option A (public staging): allow crawling and apply `noindex` on staging pages so crawlers can see the directive.
2. Option B (private staging): enforce access controls (auth/IP allowlist) and do not rely on crawler directives for protection.
3. Do not disallow in `robots.txt` any URL where `noindex` must be discovered.
4. For this program, the default public staging surface is the GitHub Pages project URL, and QA must exercise the `/rhino-inquisitor-com/` path prefix there before production cutover.

## Pipeline Architecture
Implement Phase 4 as a staged pipeline with immutable artifacts between stages:
1. Extract
2. Normalize
3. Transform
4. Enrich
5. Validate
6. Emit
7. Report

Recommended workspace layout:
1. `migration/input/` (raw source snapshots)
2. `migration/intermediate/` (normalized JSON)
3. `migration/output/` (generated Markdown/front matter)
4. `migration/reports/` (quality and parity reports)
5. `scripts/migration/` (pipeline scripts)

Do not write directly into `content/` until validation passes.

## Workstream A: Extraction Strategy
Goal: build a complete source dataset with provenance.

Preferred extraction order:
1. Primary export: WXR snapshot for broad fidelity and point-in-time consistency.
2. Secondary enrich: WordPress REST API for fields that are cleaner or missing in WXR.
3. Approved recovery source: SQL dump for required metadata, attachment relationships, or content fields that are incomplete in WXR/API.
4. Approved recovery source: filesystem snapshot for uploads and content-bearing assets that need source-of-truth verification.
5. Optional fallback: targeted endpoint scraping only for edge records where approved source artifacts are still inconsistent.

Per-source capture requirements:
1. Record source timestamp.
2. Record primary source type (`wxr`, `rest`, `sql`, `filesystem`, `fallback`) and contributing source channels.
3. Preserve original IDs and slugs.
4. Store original raw HTML body.
5. Store taxonomies, author, publish dates, modified dates, status.

Critical checks:
1. Reconciliation must report by post type and status across the approved source channels used in the run.
2. Coverage must include all URLs in the intersection of sitemap URLs and top-traffic/top-linked pages.
3. REST pagination completeness must be verified so no pages are silently skipped.
4. SQL and filesystem capture timestamps must be compared to WXR/API timestamps before field precedence is approved.
5. No records should be dropped for parse errors; quarantine them instead.

Exit criteria:
1. `migration/intermediate/extract-summary.json` with counts by type/status.
2. `migration/intermediate/extract-quarantine.json` for malformed records.

## Workstream B: Normalization and Canonical Record Model
Goal: convert heterogeneous WordPress records into one canonical migration schema.

Canonical record fields (minimum):
1. `sourceId`
2. `sourceType`
3. `postType`
4. `status`
5. `titleRaw`
6. `excerptRaw`
7. `bodyHtml`
8. `slug`
9. `publishedAt`
10. `modifiedAt`
11. `author`
12. `categories`
13. `tags`
14. `legacyUrl`
15. `targetUrl` (from manifest)
16. `disposition`
17. `aliasUrls`
18. `mediaRefs`

Normalization requirements:
1. Normalize dates to ISO 8601.
2. Normalize taxonomy names/slugs with case policy.
3. Resolve entity encoding and invalid UTF-8 safely.
4. Keep raw source fields for traceability.

Exit criteria:
1. `migration/intermediate/records.normalized.json` validates against schema.
2. 100 percent of records have deterministic `targetUrl` decision.

## Workstream C: HTML-to-Markdown Conversion
Goal: preserve semantic meaning while producing maintainable Markdown.

Conversion rules:
1. Preserve heading hierarchy (`h1` in template, content starts from `h2` where needed).
2. Preserve fenced code blocks with language where detectable.
3. Preserve ordered/unordered lists and nested lists.
4. Preserve tables in GitHub-flavored Markdown where possible.
5. Convert embedded media with deterministic fallback (shortcode or plain link).
6. Strip or map unsupported WordPress shortcodes.

Critical edge cases:
1. Gutenberg blocks rendered as HTML comments or block wrappers.
2. Inline styles and presentational markup.
3. Escaped HTML that should remain escaped.
4. Legacy iframes (YouTube, social embeds) with consent/performance implications.

Quality policy:
1. Prefer readable Markdown over exact HTML mimicry.
2. If semantic conversion fails, preserve controlled fallback output and flag for manual review.
3. Keep raw HTML rendering disabled by default in Hugo markdown configuration.
4. Any exception that allows raw HTML must be documented, scoped, and sanitized.

Exit criteria:
1. Markdown output exists for all `keep` and `merge` records.
2. `migration/reports/conversion-fallbacks.csv` enumerates records with HTML fallback fragments.

## Workstream D: Front Matter Mapping and Hugo Contract
Goal: produce Hugo-compatible front matter with no implicit route behavior.

Required fields per migrated indexable item:
1. `title`
2. `description`
3. `date`
4. `lastmod`
5. `categories`
6. `tags`
7. `heroImage` (if available)
8. `url`
9. `aliases`
10. `draft`

Optional discovery/readability extension (tracked in `RHI-106`):
1. Custom enrichment fields live under `params`, not as new routing-critical top-level keys.
2. Supported extension fields may include:
	- `primaryTopic`
	- `secondaryTopics`
	- `contentType`
	- `difficulty`
	- `series`
	- `summary`
	- `relatedContent`
	- `featuredHome`
3. Reading time and update status remain derived unless a later approved ticket changes that rule.

Canonical handling requirement:
1. Every indexable page must render exactly one canonical tag.
2. Default canonical should be self-referencing based on final rendered URL.
3. Canonical override (if needed) must be explicit in front matter params and validated.

Mapping rules:
1. `url` must come from manifest/policy, not from slug generation.
2. `aliases` include only approved legacy paths, no broad wildcard behavior.
3. `draft` must be `false` for launch-intended content.
4. Description should be deterministic and length-capped if source excerpt is missing.
5. Workstream D consumes the optional extension defined in Workstream L/RHI-106 but does not make those fields mandatory for migration success.
6. Generated Markdown, front matter, and rewritten links must not hardcode `https://taurgis.github.io/rhino-inquisitor-com/`; host selection belongs to the active build/runtime contract.

Validation rules:
1. Reject duplicate `url` values.
2. Reject canonical mismatch with configured canonical host and final served URL.
3. Reject alias loops and alias-to-self entries.
4. Reject empty `title` and empty body for indexable pages.

Exit criteria:
1. Front matter validator passes for generated set.
2. `migration/reports/frontmatter-errors.csv` is empty for release candidate batch.

## Workstream L: Discovery Metadata Extension and Enrichment
Goal: add an optional `params`-based discovery metadata layer that supports the Phase 3 UI tickets without changing routing-critical fields.

Execution note:
1. Delivery is tracked in `RHI-106`.
2. The extension covers fields such as `primaryTopic`, `secondaryTopics`, `contentType`, `difficulty`, `series`, `summary`, `relatedContent`, and `featuredHome`.
3. Validation and mapping must remain backward compatible when enrichment is absent.
4. The extension supports UI behavior and curation; it does not reopen the Phase 2 required top-level front matter contract.

## Workstream E: URL Preservation and Redirect Integrity
Goal: ensure migration preserves ranking signals and user pathways.

Required behavior per disposition:
1. `keep`: generate content at exact legacy path.
2. `merge`: map legacy path to approved target with explicit redirect type.
3. `retire`: return real not-found behavior unless explicit mapped replacement exists.

Redirect type policy for `merge`:
1. Preferred: server-side permanent redirect (`301` or `308`) when infrastructure supports it.
2. Fallback: immediate HTML meta refresh page when server-side redirect is not possible on static hosting.
3. JavaScript-only redirects are not allowed unless approved as an exception.
4. On GitHub Pages without an edge redirect layer, treat Hugo alias pages as the expected redirect implementation.

Critical constraints:
1. No chain redirects.
2. No blanket redirect-to-home for unrelated content.
3. No retired URLs silently rendering thin placeholder pages.

GitHub Pages implications:
1. Hugo `aliases` generate static redirect pages; this is not equivalent to universal origin-level 301 or 308 handling.
2. If URL-change volume is high or SEO risk is unacceptable, escalate to edge redirect layer.

Validation tasks:
1. URL parity script compares manifest against generated outputs and aliases.
2. Redirect-check script validates redirect type and target correctness:
- for `server-301-308`, verify HTTP status and `Location` target,
- for `meta-refresh`, verify HTTP `200` plus instant meta refresh (`content="0; url=..."`) and canonical pointing at target.
3. Response-check script confirms retired URLs do not return `200` with placeholder content.

Exit criteria:
1. 100 percent manifest coverage with explicit outcome.
2. Zero unresolved URL parity failures.
3. Zero unresolved redirect-type mismatches on critical SEO URLs.

## Workstream F: Media Migration and Asset Hygiene
Goal: eliminate fragile media dependencies and preserve rendering quality.

Asset tasks:
1. Download referenced media to controlled path under `static/` or managed asset directory.
2. Deduplicate by checksum.
3. Preserve original file extension where possible.
4. Normalize unsafe file names to deterministic slug-based names.
5. Repoint Markdown references to final hosted paths.

Image quality and performance policy:
1. Generate responsive variants for large images when practical.
2. Prefer modern formats (`webp`, optionally `avif`) with fallback strategy.
3. Ensure dimensions are available for layout stability.
4. Keep hero images optimized for LCP-sensitive templates.

Integrity checks:
1. Every referenced media URL resolves to an existing file.
2. MIME type aligns with extension.
3. No hotlinks to deprecated WordPress upload paths unless intentionally approved.
4. Generated pages have no mixed-content references on HTTPS pages.

Exit criteria:
1. `migration/reports/media-missing.csv` is empty.
2. `migration/reports/media-hotlinks.csv` approved exceptions only.

## Workstream G: Internal Link and Navigation Rewrites
Goal: avoid crawl traps and broken user journeys.

Rewrite policy:
1. Convert internal absolute links from all legacy host/scheme variants (apex, `www`, `http`, old WordPress domains) into canonical internal links aligned with new routes.
2. Remove links to retired pages unless redirected.
3. Preserve query parameters only where required by product behavior.
4. Normalize anchor formatting and encoded characters.

Checks:
1. Broken-link scan on generated site.
2. Internal-link target coverage for top traffic pages.
3. Navigation parity review for archive/category/video hubs.

Exit criteria:
1. No critical broken links on representative templates.
2. Link report includes severity and owner for any remaining non-blocking issues.

## Workstream H: SEO Signal Preservation During Migration
Goal: prevent ranking and indexing regressions caused by content conversion.

Required SEO preservation controls:
1. Preserve page intent and topical relevance in migrated body content.
2. Preserve publish date and modified date semantics.
3. Preserve taxonomy discoverability where those pages have organic value.
4. Ensure unique title and description coverage.
5. Ensure canonical, Open Graph, and schema-ready data fields remain available to templates.
6. Ensure release artifacts do not contain accidental `noindex` on indexable pages.
7. Ensure `robots.txt` does not block critical crawl paths or assets required for rendering.
8. Keep canonical signals aligned across `rel=canonical`, sitemap URLs, internal links, and redirect targets.

Feed compatibility policy:
1. Define canonical feed endpoint(s) for Hugo output and legacy WordPress feed endpoint(s) that need compatibility.
2. If strict feed backward compatibility is required, use a redirect-capable infrastructure layer for feed endpoint redirects.
3. If strict feed compatibility is not feasible, record it as an intentional breaking change and communicate the new feed URL before cutover.

Explicit anti-patterns to block:
1. Truncating long content without redirecting old deep links.
2. Replacing many pages with generic "overview" pages.
3. Converting rich pages into thin content stubs.
4. Removing archive/category pages with existing organic traffic without mapped alternatives.

Validation sampling (minimum):
1. Homepage
2. 10 highest-traffic articles
3. 5 category pages
4. 3 video-related pages
5. 5 long-tail pages with backlinks

Exit criteria:
1. SEO smoke checks pass on sampled pages.
2. Metadata completeness report achieves 100 percent for title, description, and canonical on indexable pages.
3. Index-control checks pass (no unintended `noindex`; robots policy aligned with production intent).

## Workstream I: Accessibility and Content Semantics
Goal: maintain or improve accessibility during migration.

Accessibility target:
1. WCAG 2.2 Level AA on in-scope templates and migrated content patterns.
2. Do not publish a WCAG conformance claim unless a documented conformance evaluation exists with explicit scope and method.

Content-level requirements:
1. Images must include meaningful alt text or explicit decorative treatment.
2. Heading order must be logical and non-skipping.
3. Link text must be descriptive (no repeated "click here" patterns where avoidable).
4. Tables require header structure when tabular meaning exists.

Checks:
1. Automated accessibility scan on representative migrated pages.
2. Manual keyboard path check for article template and navigation components.
3. Manual focus visibility and reading-order checks on representative pages.
4. Documented exceptions with owner and remediation date.

Exit criteria:
1. Automated accessibility gate passes for sample set.
2. Manual accessibility checklist completed for representative templates.
3. No unresolved critical accessibility defects in release candidate batch.

## Workstream J: Security and Data Hygiene
Goal: avoid introducing insecure or private content artifacts.

Hosting reality requirement:
1. GitHub Pages does not provide full custom response-header control for strict CSP/HSTS tuning.
2. If strict header policy is mandatory, route through an edge/CDN layer with managed headers.

Required controls:
1. Sanitize unsafe HTML/script fragments from source content.
2. Block inline script remnants from untrusted source widgets.
3. Remove private drafts or protected content unless explicitly approved.
4. Strip source-system-only metadata not needed in static site.

Checks:
1. Scan for script tags, inline event handlers, and suspicious iframes in generated output.
2. Ensure no sensitive tokens or internal URLs leaked in content.
3. Verify HTTPS-only asset references for migrated pages.

Exit criteria:
1. Security content scan report contains no critical findings.
2. Header strategy and ownership are documented for launch phase.

## Workstream K: Reporting, Traceability, and Audit
Goal: make every migration decision inspectable.

Per-item report fields (minimum):
1. `source_id`
2. `source_url`
3. `target_file`
4. `target_url`
5. `disposition`
6. `conversion_mode` (`markdown`, `html-fallback`, `manual`)
7. `media_status`
8. `seo_status`
9. `qa_status`
10. `owner`

Required reports:
1. `migration/reports/migration-item-report.csv`
2. `migration/reports/url-parity-report.csv`
3. `migration/reports/conversion-fallbacks.csv`
4. `migration/reports/media-integrity-report.csv`
5. `migration/reports/seo-completeness-report.csv`
6. `migration/reports/accessibility-scan-summary.md`

Exit criteria:
1. Reports are generated in CI and attached to build artifacts.
2. Blocking thresholds are machine-enforced.

## Library and Tooling Plan
Required libraries (Node migration scripts):
1. `turndown`
- HTML to Markdown conversion core.
2. `@joplin/turndown-plugin-gfm`
- Better table/list/code conversion fidelity.
3. `gray-matter`
- Front matter parsing and serialization.
4. `fast-glob`
- Efficient content/output file discovery.
5. `fast-xml-parser`
- Parse WordPress XML and sitemap XML safely.
6. `zod`
- Runtime schema validation for records and manifests.
7. `p-limit`
- Bounded concurrency for extraction/download tasks.
8. `undici` or Node native `fetch` (pinned runtime)
- HTTP extraction and media downloads.
9. `csv-stringify`
- Deterministic report exports.

Strongly recommended:
1. `cheerio`
- DOM-level cleanup before Markdown conversion.
2. `unified` + `remark` + `rehype` utilities
- Advanced AST transforms and linting for markdown/html hybrids.
3. `sharp`
- Image transformation pipeline and responsive outputs.
4. `broken-link-checker` or equivalent link-audit tool
- Generated-site link integrity.
5. `pa11y-ci` (or equivalent)
- Automated accessibility checks on built pages.

Hosting and deployment constraints references to apply in CI policy:
1. GitHub Pages limits (site size, deployment timeout, and related constraints).
2. GitHub Pages custom-domain verification and sequencing requirements.

Optional, based on complexity:
1. `slugify`
- Deterministic fallback slug generation for assets.
2. `file-type`
- MIME verification by file signature.

Tooling anti-patterns:
1. Do not add heavyweight framework runtime dependencies to solve migration scripting.
2. Do not mix multiple conversion engines without clear ownership and precedence rules.

## CI Gates for Phase 4 Batches
Every migration batch PR must pass:
1. Hugo production build.
2. Front matter schema validation.
3. URL parity validation against manifest subset/full set.
4. Redirect-type validation (server redirect vs meta refresh vs none, as mapped).
5. Retired URL response validation (no soft-404 style `200` placeholders).
6. Broken-link check.
7. SEO metadata completeness check.
8. Index-control check (`noindex` and robots policy).
9. Feed compatibility check for declared legacy and canonical feed endpoints.
10. Media integrity check.
11. Accessibility quick scan for representative pages.
12. GitHub Pages deployment-size and timeout budget check.

Recommended blocking thresholds:
1. URL parity failures: 0 allowed.
2. Missing required front matter fields: 0 allowed.
3. Broken internal links (critical pages): 0 allowed.
4. Missing title/description/canonical on indexable pages: 0 allowed.
5. Unintended `noindex` on indexable pages: 0 allowed.
6. Feed endpoint regressions: 0 allowed for routes marked compatibility-critical.
7. HTML fallback conversions: allowed only with explicit issue owner and cap per batch.
8. Site size and deployment budgets: must remain within GitHub Pages limits.

## Must-Have Gate Checklist
1. Publishing model and custom-domain authority are locked and documented.
2. URL mapping is complete with explicit disposition and target behavior.
3. Redirect implementation type is explicit for every `merge` URL.
4. No redirect chains and no irrelevant mass redirects to homepage.
5. Retired URLs return true not-found behavior.
6. Canonicals are self-consistent with configured host and final served URLs.
7. No staging index controls leak into release artifacts.
8. WordPress extraction coverage is reconciled (WXR, REST, sitemap/traffic intersection).
9. Media integrity and HTTPS asset checks pass.
10. Raw HTML policy is intentional and exceptions are sanitized and approved.
11. Core Web Vitals lab checks are green on representative templates and tracked as regression proxies.
12. Field Core Web Vitals are monitored post-launch and treated as real-world success criteria.
13. Accessibility checks meet documented WCAG 2.2 AA scope.
14. Security content scan is clean for critical issues.

## Batch Strategy and Execution Cadence
Do not migrate all content in one pass.

Suggested batch sequence:
1. Pilot batch: 20-30 representative records.
2. High-value batch: top traffic and backlink pages.
3. Long-tail batch: remaining posts/pages.
4. Taxonomy and archive refinement batch.

Per-batch process:
1. Run pipeline.
2. Review generated reports.
3. Fix mapping/conversion issues.
4. Re-run pipeline.
5. Merge only when gates pass.

## Critical Risks and Mitigations
1. Risk: hidden URL drift from slug normalization.
- Mitigation: manifest-driven `url` only, collision checks, parity gate.

2. Risk: loss of content fidelity from aggressive conversion rules.
- Mitigation: controlled fallback policy with manual queue, sanitization checks, and report.

3. Risk: media bloat harming Core Web Vitals.
- Mitigation: image optimization pipeline and page-weight budget checks.

4. Risk: static alias redirects insufficient for high-change migrations.
- Mitigation: early threshold check and edge redirect escalation decision.

5. Risk: taxonomy or archive pages dropped despite SEO value.
- Mitigation: preserve high-value taxonomy routes based on baseline traffic data.

6. Risk: migration scripts become non-deterministic across environments.
- Mitigation: pinned runtime versions, schema validation, and reproducible CI artifacts.

## Deliverables
1. Migration pipeline scripts in `scripts/migration/`.
2. Normalized migration datasets in `migration/intermediate/`.
3. Generated content batch output and import process into `content/`.
4. Media ingestion artifacts and mapping tables.
5. Full migration reports under `migration/reports/`.
6. Phase 4 signoff note with unresolved exceptions and owners.

## Definition of Done
Phase 4 is complete only when all are true:
1. All in-scope `keep` and `merge` records are migrated or explicitly deferred with owner and reason.
2. URL parity is complete for migrated scope with no unresolved blockers.
3. Front matter and metadata validation passes for migrated scope.
4. Media integrity and link integrity checks pass for migrated scope.
5. Accessibility and security content scans have no critical unresolved findings.
6. Migration reports are complete, reproducible, and attached to CI artifacts.
7. Any remaining manual edits are tracked as explicit backlog items before launch gate.

## Exit Gate to Phase 5/6/8
Phase 4 output is eligible for downstream launch readiness only if:
1. Phase 5 SEO outputs can consume complete metadata fields without backfill.
2. Phase 6 redirect strategy has full alias/mapping data for moved URLs.
3. Phase 8 validation can run against a content-complete build artifact.

## Suggested Timeline (10-15 Working Days)
1. Days 1-2: extraction and normalization.
2. Days 3-5: conversion rules and pilot batch.
3. Days 6-8: media pipeline and link rewrite hardening.
4. Days 9-11: high-value content migration and QA fixes.
5. Days 12-13: long-tail batch and report stabilization.
6. Days 14-15: exception closure and Phase 4 signoff package.

## Reference Guidance Used for This Phase
Google Search and indexing:
1. https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
2. https://developers.google.com/search/docs/crawling-indexing/301-redirects
3. https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
4. https://developers.google.com/search/docs/crawling-indexing/block-indexing
5. https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
6. https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors#soft-404-errors
7. https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview

GitHub Pages:
1. https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
2. https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
3. https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
4. https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
5. https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

Hugo:
1. https://gohugo.io/content-management/urls/#aliases
2. https://gohugo.io/content-management/front-matter/
3. https://gohugo.io/getting-started/configuration-markup/#goldmark

WordPress:
1. https://wordpress.org/documentation/article/tools-export-screen/
2. https://developer.wordpress.org/rest-api/
3. https://developer.wordpress.org/rest-api/using-the-rest-api/pagination/

Performance and accessibility:
1. https://web.dev/articles/vitals
2. https://web.dev/articles/lcp
3. https://web.dev/articles/inp
4. https://web.dev/articles/cls
5. https://support.google.com/webmasters/answer/9205520
6. https://www.w3.org/TR/WCAG22/
7. https://www.w3.org/WAI/test-evaluate/

Feeds and output compatibility:
1. https://gohugo.io/templates/rss/
2. https://gohugo.io/configuration/output-formats/
3. https://developer.wordpress.org/reference/functions/get_feed_link/
4. https://developer.wordpress.org/advanced-administration/wordpress/feeds/

Security:
1. https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
2. https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
3. https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html
