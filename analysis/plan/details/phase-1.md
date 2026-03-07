# Phase 1 Detailed Plan: Baseline and URL Inventory

## Goal
Create an authoritative migration baseline for https://www.rhino-inquisitor.com so later phases do not introduce SEO regressions, URL loss, or avoidable architecture mistakes.

Phase 1 is complete only when every known live URL is classified (`keep`, `merge`, `retire`) and mapped to explicit target behavior that is technically implementable on GitHub Pages.

## URL Class Taxonomy (Normative)
Every discovered URL must be assigned to exactly one class so preservation and retirement decisions are deterministic.

| Class | Primary source | Example | Default outcome | Sitemap inclusion |
| --- | --- | --- | --- | --- |
| `post` | `post-sitemap.xml` | `/some-article/` | preserve same path | yes |
| `page` | `page-sitemap.xml` | `/privacy-policy/` | preserve same path | yes |
| `category` | `category-sitemap.xml` | `/category/salesforce-commerce-cloud/` | preserve by default; merge by exception | yes |
| `video` | `video-sitemap.xml` | `/sfcc-introduction/` | preserve by default; merge by exception | yes |
| `landing` | `e-landing-page-sitemap.xml` | `/some-landing-page/` | preserve by default; merge by exception | yes |
| `system` | crawl, logs, probes | `/wp-json/`, `/xmlrpc.php` | retire by default | no |
| `attachment` | crawl, logs, probes | `/?attachment_id=123` | retire or redirect to parent content | no |
| `pagination` | crawl, logs, probes | `/page/2/` | preserve for qualified classes; otherwise retire | conditional |

Decision rules:
1. Any URL class outside this matrix is a Phase 1 blocker until policy is defined.
2. `system` and `attachment` default to `retire` unless approved by migration owner and SEO owner with explicit target behavior.
3. Pagination retention requires measured value (minimum 100 clicks in 90 days or 10 referring domains) and SEO owner approval.
4. Phase 1 must publish `migration/url-class-matrix.json` with class assignment for every normalized URL.
5. `category`, `video`, and `landing` default to `keep`; `merge` is allowed only with explicit mapping rationale and approval from migration owner plus SEO owner.

## Critical Audit Corrections
1. Move type must be split:
- Same domain plus same URLs is primarily a hosting migration.
- Any changed path still requires URL-change migration controls.

2. Search Console Change of Address is not for this scenario unless domain or subdomain changes.

3. GitHub Pages constraints must be explicit:
- Static hosting means limited origin-level rewrite/header control.
- Redirect and header requirements must identify implementation layer (`pages`, `edge`, `dns`).

4. Removed URL handling must be realistic:
- `404` is baseline.
- `410` is only required where infrastructure can emit it.

5. URL inventory must include non-HTML resources and Search Console links data.

## Current Live-Site Snapshot (2026-03-07)
Observed from sitemaps and HTTP probes:

1. Sitemap index contains 5 sitemap files:
- `post-sitemap.xml` (150 URLs)
- `page-sitemap.xml` (22 URLs)
- `category-sitemap.xml` (22 URLs)
- `video-sitemap.xml` (5 URLs — all 5 also appear in `post-sitemap.xml`)
- `e-landing-page-sitemap.xml` (1 URL)
- Total: 200 raw sitemap entries; 195 unique after de-duplication

2. `robots.txt` references `sitemap_index.xml`.

3. Canonical tags sampled on key pages point to `https://www.rhino-inquisitor.com/...`.

4. Sampled risk: both `www` and apex host variants return `200`.

5. Sampled risk: both slash and no-slash variants return `200` for key routes.

6. Legacy/system endpoints currently live:
- `/feed/` (`200`)
- `/comments/feed/` (`200`)
- `/wp-json/` (`200`)
- `/xmlrpc.php` (`405`)
- `/author/admin/` (`200`) — note: `/author/thomas-theunen/` is the active author URL visible in video-sitemap uploader data; probe both routes during inventory
- `/search/sfcc/` (`200`)

Note: sampling is not exhaustive. Full coverage comes from Workstream 1.

## Scope
In scope:
- URL discovery and normalization policy.
- URL classification and migration behavior mapping.
- SEO, crawl, performance, accessibility, and security baseline capture.
- GitHub Pages feasibility checks for redirects and headers.
- Risk register, blockers, and sign-off artifacts.

Out of scope:
- Template implementation.
- Content conversion.
- Production cutover execution.

## Required Inputs and Access
1. Search Console access (Domain property and `https://www` URL-prefix).
2. Analytics access (landing pages and organic baseline).
3. DNS provider access path and owner.
4. WordPress export/read access.
5. Preferred: CDN/server logs and backlink data exports.

## Tooling for Phase 1
Required:
- `fast-xml-parser`
- `undici` or Node native `fetch`
- `p-limit`
- `zod`
- `csv-stringify`
- `fast-glob`

Recommended:
- `playwright`
- `lighthouse` or PageSpeed API integration

## GitHub Pages Constraints (Must Be Acknowledged)
1. GitHub Pages is static hosting; do not assume dynamic server rewrite control.
2. If apex and `www` DNS are configured correctly, GitHub Pages can auto-redirect between them.
3. Enforce HTTPS and validate mixed-content cleanup.
4. Redirect strategy layering:
- Preferred: server-side permanent redirects (`301` or `308`) where feasible.
- Fallback: static redirect pages with instant meta refresh and canonical tags.
- Escalate to edge/CDN when redirect complexity exceeds static feasibility.
5. Header controls may require edge/CDN for robust CSP variants and `X-Robots-Tag` on non-HTML resources.

## Workstream 1: URL Discovery Inventory
1. Parse all sitemap files from `sitemap_index.xml`.
2. De-duplicate by normalized absolute URL and preserve source provenance.
3. Expand with internal crawl seeds:
- Homepage
- Archive
- Category pages
- 10-20 recent posts
- Footer and utility links
4. Expand with Search Console and logs:
- Performance report top pages
- Links report top linked pages
- CDN/server logs
5. Include non-HTML resources:
- Images
- Videos
- PDFs/downloads
- High-value static assets
6. Probe system routes:
- feeds, search, author/tag archives, attachment pages, `wp-json`, paginated routes
7. Output merged inventory with fields:
- `url`, `path`, `source`, `url_type`, `http_status`, `canonical_target`, `indexability_signal`, `in_sitemap`, `lastmod`, `has_external_links`, `has_organic_traffic`

Exit criteria:
- Every discovered URL has exactly one record with source provenance.

## Workstream 2: Canonical and URL Invariant Policy
1. Host policy:
- Canonical host is `www.rhino-inquisitor.com`.
- Apex and `www` DNS records configured for deterministic canonical behavior.
2. Slash policy:
- No blind global slash rewrite.
- Keep one indexable canonical variant per route.
3. Case policy:
- Normalize internal/generated URLs to lowercase.
- Add explicit legacy-case redirects only where needed.
4. Query parameter policy:
- Define tracking and filter parameter behavior.
- Prevent crawlable duplicate states.
5. Canonical-tag policy:
- Canonical tags must resolve to final canonical `https://www` URLs.

Exit criteria:
- Written policy approved and adopted as input to all mapping work.

## Workstream 3: URL Classification and Mapping
Disposition per URL:
1. `keep`
2. `merge`
3. `retire`

Retire handling:
- Redirect to nearest relevant destination, or
- Return `404` (`410` only where infra supports explicit status).

Mandatory mapping fields:
- `legacy_url`
- `disposition`
- `target_url`
- `redirect_code`
- `reason`
- `owner`
- `priority`
- `implementation_layer` (`pages-static`, `edge-cdn`, `dns`, `none`)

QA rules:
- No redirect chains.
- Redirect directly to final destination.
- Verify final status and canonical alignment.

Exit criteria:
- 100% URL mapping completeness with implementable behavior.

## Workstream 4: SEO Baseline Capture
Capture pre-migration baseline:
1. Indexing and crawling:
- page indexing trend, crawl stats trend, sitemap/indexing issues
2. Organic landing pages:
- top pages for 90 and 28 days
- impressions, clicks, CTR, average position
3. Link equity:
- top linked pages (Search Console links report)
- external backlinks for critical routes where available
4. Metadata quality:
- title uniqueness, description coverage, canonical consistency
- OG URL/title/image coverage
- structured data presence and validity
5. Technical controls:
- robots directives and sitemap references
- security header presence matrix
- indexability controls (`meta robots`, `X-Robots-Tag` usage)
6. Verification continuity:
- confirm Search Console verification method persists after migration

Exit criteria:
- Baseline report approved as launch comparison benchmark.

## Workstream 5: Performance and UX Baseline
Template sample set:
- Homepage
- Recent article
- Archive
- Category
- Video page

Metrics:
- LCP, INP, CLS
- TTFB and payload size
- JS and image weight
- accessibility quick-pass issues (landmarks, heading structure, alt coverage, keyboard path)

Exit criteria:
- Baseline metric table captured and reviewable.

## Workstream 6: Staging and Indexing Guardrails
1. If using temporary host, apply `noindex` on staging pages.
2. Remove temporary crawl/index blocks before launch.
3. Validate representative URLs with URL inspection.
4. Lower DNS TTL at least one week before cutover window.

Exit criteria:
- Approved staging-indexing and launch-unblock checklist.

## Workstream 7: Risk Register and Mitigations
Initial high-risk items:
1. Host duplication (`www` and apex indexable).
2. Slash duplication.
3. Legacy endpoint handling gaps.
4. Video/taxonomy parity risk.
5. Redirect design exceeds Pages capabilities.
6. DNS/certificate/verification timing risk.

Each risk must define:
- `impact`, `likelihood`, `owner`, `mitigation`, `trigger`, `contingency`

Exit criteria:
- Risks reviewed with assigned owners before Phase 2.

## SEO Policy Items That Cannot Be Deferred
1. Canonical host and implementation layer.
2. Route-level slash strategy.
3. Taxonomy hierarchy strategy.
4. Legacy endpoint policy.
5. Structured data continuity by template.
6. Sitemap inclusion policy.
7. Hosting-move vs URL-change handling model.

Unresolved item blocks Phase 2.

## Deliverables
1. `migration/url-inventory.raw.json`
2. `migration/url-inventory.normalized.json`
3. `migration/url-class-matrix.json`
4. `migration/url-manifest.json`
5. `migration/url-manifest.csv`
6. `migration/phase-1-seo-baseline.md`
7. `migration/phase-1-performance-baseline.md`
8. `migration/phase-1-security-header-matrix.md`
9. `migration/risk-register.md`
10. `migration/phase-1-signoff.md`

## Definition of Done
1. All sitemap URLs in normalized manifest.
2. Additional discovered URLs included and classified.
3. Every URL has explicit behavior and implementable handling.
4. Canonical/slash/case/query policies approved.
5. Hosting-only vs URL-change controls documented.
6. SEO/performance/accessibility/security baselines captured.
7. Search Console verification continuity and staging noindex plan approved.
8. Risk owners and mitigation plans documented.
9. Stakeholder sign-off recorded.

## Suggested Timeline (6-8 Working Days)
1. Day 1: access checks, sitemap harvest, initial inventory
2. Day 2: crawl expansion, Search Console and log expansion
3. Day 3: policy workshop and feasibility checks
4. Day 4: URL classification and redirect QA
5. Day 5: baseline capture and risk updates
6. Day 6: staging guardrails and DNS TTL readiness
7. Days 7-8: blockers and sign-off

## Official References
- Google hosting move (no URL changes): https://developers.google.com/search/docs/crawling-indexing/site-move-no-url-changes
- Google move with URL changes: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- Redirects: https://developers.google.com/search/docs/crawling-indexing/301-redirects
- Change of Address limitations: https://support.google.com/webmasters/answer/9370220
- Canonical guidance: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Sitemap guidance: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Robots intro: https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Robots meta and X-Robots-Tag: https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
- GitHub Pages basics: https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages
- GitHub Pages custom domains: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages
- GitHub Pages HTTPS: https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
- Core Web Vitals: https://web.dev/articles/vitals
- OWASP headers: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
