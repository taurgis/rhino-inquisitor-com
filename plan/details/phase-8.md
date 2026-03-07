# Phase 8 Detailed Plan: Validation and Launch Readiness

## Purpose
Convert migration quality checks into objective release gates so launch is evidence-based, not judgment-based.

Phase 8 is the final technical control point before DNS cutover and public indexing impact. If Phase 8 is weak, migration regressions are discovered by users and crawlers instead of CI and controlled rehearsal.

## Why Phase 8 Is High Risk
1. Passing build/deploy does not prove URL parity, crawlability, accessibility, or performance quality.
2. Static-hosting constraints can mask redirect/header limitations until real traffic and crawlers hit production.
3. SEO regressions (canonical drift, soft-404 patterns, robots/noindex conflicts) often appear after cutover if not explicitly gated.
4. Missing launch thresholds produces subjective go/no-go decisions and delayed rollback.
5. Incomplete validation across representative templates (home, post, archive, category, policy pages) hides class-wide defects.
6. Post-launch monitoring is ineffective if baselines and ownership were not defined pre-launch.

## Phase Position and Dependencies
From [main-plan.MD](main-plan.MD), Phase 8 depends on Phases 4, 5, 6, and 7.

Phase 8 consumes:
1. [plan/details/phase-4.md](plan/details/phase-4.md): migrated content integrity, media paths, front matter completeness.
2. [plan/details/phase-5.md](plan/details/phase-5.md): SEO policy, canonical rules, schema requirements, crawl/index controls.
3. [plan/details/phase-6.md](plan/details/phase-6.md): URL manifest outcomes (`keep`/`redirect`/`retire`) and redirect architecture decision.
4. [plan/details/phase-7.md](plan/details/phase-7.md): GitHub Pages workflow, domain setup, HTTPS readiness, deployment runbook.

Phase 8 enables:
1. Phase 9 cutover and stabilization with measurable baselines.
2. Faster incident triage if issues occur post-launch.

## Scope
In scope:
1. Release-candidate validation gates in CI and pre-launch rehearsal.
2. SEO/indexing checks (redirects, canonical, sitemap, robots, structured data).
3. Performance and Core Web Vitals launch thresholds.
4. Accessibility and markup quality checks.
5. Security and HTTPS readiness checks applicable to static hosting.
6. Go/no-go criteria, sign-off protocol, rollback trigger matrix.

Out of scope:
1. New feature development unrelated to migration stability.
2. Long-term SEO growth experiments (handled after launch stabilization).

## Non-Negotiable Release Gates (Hard Blockers)
1. URL parity gate passes for all in-scope legacy URLs with explicit outcomes.
2. Redirect quality gate passes with direct redirects to final destinations, zero loops, and zero redirect chains on migration routes.
3. Canonical consistency gate passes (canonical, sitemap, internal links agree on final URLs).
4. Robots/noindex gate passes (no accidental blocking or accidental `noindex` on indexable pages).
5. Structured data gate passes on representative templates with no critical errors.
6. HTTPS gate passes (valid cert, enforce HTTPS enabled, no critical mixed content).
7. Accessibility gate passes for defined representative templates and critical user paths against WCAG 2.2 AA criteria; no site-wide WCAG conformance claim is made without WCAG-EM evaluation/reporting.
8. Performance gate passes required Lighthouse and budget thresholds.
9. Launch smoke test gate passes on production-like environment.
10. Rollback drill has been executed and timed before launch window.

## Critical Corrections Encoded in This Phase
1. Search migration signal correction:
1.1. Canonical tags do not replace redirect correctness.
1.2. Irrelevant broad redirects are treated as soft-404 risk.

2. Crawl/index control correction:
2.1. `robots.txt` manages crawling, not guaranteed de-indexing.
2.2. Pages requiring `noindex` must remain crawlable so crawlers can see directives.

3. Structured data correction:
3.1. Schema must match visible page content.
3.2. Template-level rich-result validity is mandatory before launch.

4. Performance correction:
4.1. Lighthouse lab scores are regression gates, not substitutes for field CWV.
4.2. Core Web Vitals thresholds are target metrics evaluated at the 75th percentile when field data exists.

5. Static-host security correction:
5.1. GitHub Pages HTTPS enforcement is required.
5.2. If required security headers (for example CSP/HSTS) are not configurable at the origin host, enforce them through an edge/CDN layer.

## Validation Architecture
Two-layer model:
1. Layer 1: CI gates on every release-candidate commit.
2. Layer 2: pre-launch rehearsal against deployed release-candidate environment and live-domain dry run checks.

Principles:
1. Every gate must produce machine-readable output artifacts.
2. Every failure has explicit owner and blocking severity.
3. Launch decision uses gate outcomes, not manual interpretation alone.

## Tooling and Library Stack (Required/Recommended)
Required baseline:
1. `fast-glob`: deterministic discovery of generated output for parity/coverage checks.
2. `gray-matter`: front matter policy checks for canonical/metadata required fields.
3. `@lhci/cli`: Lighthouse CI budgets and regression thresholds.
4. `html-validate`: HTML/markup sanity checks on generated templates.
5. `@axe-core/playwright`: automated accessibility checks in scripted browser flows.
6. `playwright`: scripted smoke tests, route assertions, and metadata extraction.
7. `fast-xml-parser`: sitemap and feed validation for URL consistency checks.

Recommended adjunct tools:
1. `lychee` or `linkinator`: broken-link scanning over generated output and deployed URLs.
2. `ajv`: JSON-schema validation for migration manifest and validation-report contracts.
3. `curl` + `dig`: protocol/host/DNS verification in launch runbook.
4. Search Console tools: URL Inspection, Sitemaps report, Page Indexing report, Rich result status reports.
5. W3C validators: Nu HTML Checker and W3C Link Checker for supplemental validation.

Implementation note:
1. Keep CLI dependencies pinned to stable versions.
2. Archive all validation reports as CI artifacts to preserve launch auditability.

## Workstream A: Release Candidate Freeze and Validation Dataset
Goal: lock inputs so validation results are meaningful and repeatable.

Tasks:
1. Freeze content and URL mapping changes at RC cut.
2. Snapshot legacy URL manifest and expected outcomes (`keep`/`redirect`/`retire`).
3. Define representative page sample matrix:
3.1. homepage
3.2. at least 10 recent posts
3.3. archive page(s)
3.4. at least 5 category pages
3.5. privacy/legal pages
3.6. video and landing templates if retained
4. Define priority route set (top organic and top backlink URLs).

Acceptance criteria:
1. Frozen RC manifest is versioned and immutable during launch window.
2. Sample matrix covers every live template family.

## Workstream B: URL Parity and Redirect Integrity Gates
Goal: prove migrated routing behavior is complete and semantically correct.

Mandatory checks:
1. 100 percent of in-scope legacy URLs resolve to approved outcomes.
2. Redirects go directly to final destinations; redirect chains are not allowed on migration routes.
3. Zero redirect loops.
4. Redirect destinations are topic-equivalent and not generic fallback shortcuts.
5. Retired URLs return intended not-found behavior (`404` or `410` where supported).
6. Move mapping explicitly covers embedded resources with search/link value (images, videos, JavaScript, CSS, and downloads such as PDFs).
7. Redirect retention policy is documented: keep redirects for as long as possible, generally at least 1 year.

Operational thresholds:
1. Blocking defect if any high-priority legacy URL is unresolved or mismapped.
2. Blocking defect if any redirect target is unreachable.
3. Blocking defect if chain depth exceeds policy on priority routes.

Outputs:
1. `validation/url-parity-report.json`
2. `validation/redirect-quality-report.json`

## Workstream C: SEO and Indexing Readiness Gates
Goal: avoid crawl/index regressions at launch.

Mandatory checks:
1. Each final URL has exactly one `rel="canonical"` in the HTML head, pointing to the final HTTPS canonical URL using an absolute URL (typically self-referencing).
2. No canonical points to redirected or non-canonical host URLs.
3. Sitemap contains final canonical URLs only and excludes redirect helper pages.
4. `robots.txt` behavior is intentional and valid (served at root if used; if absent, returns proper 404), with no accidental crawl blocks during or after move.
5. No accidental `noindex` on indexable templates.
6. No `robots` and `noindex` contradictions for URLs intended to de-index.
7. Search Console ownership and verification continuity are confirmed for old/new and host/protocol variants where applicable.
8. Sitemap protocol constraints pass: UTF-8 encoding, fully qualified absolute URLs, and per-file size/count limits (50 MB uncompressed or 50,000 URLs).
9. Sitemap submission is treated as a discovery hint (not an indexing guarantee), with indexing outcomes validated in Page Indexing and URL Inspection checks.

Operational thresholds:
1. Blocking defect for any canonical mismatch in priority route set.
2. Blocking defect for any critical template missing title or meta description.
3. Blocking defect if Search Console verification/ownership continuity fails for required properties.

Outputs:
1. `validation/seo-consistency-report.json`
2. `validation/robots-sitemap-report.json`

## Workstream D: Structured Data and Social Preview Gates
Goal: preserve rich-result eligibility and sharing quality.

Mandatory checks:
1. Required schema types are present by template family (`WebSite`, `BlogPosting`/`Article`, `BreadcrumbList`, `VideoObject` where applicable).
2. Required schema properties are present and value types are valid.
3. Schema values match visible page content.
4. Representative template URLs pass Rich Results Test with no critical errors.
5. Open Graph/Twitter preview tags are present and resolve valid media URLs.

Operational thresholds:
1. Blocking defect for schema errors on homepage and article template.
2. Blocking defect if social preview images are missing on priority pages.

Outputs:
1. `validation/structured-data-report.json`
2. `validation/social-preview-report.json`

## Workstream E: Performance and Core Web Vitals Gates
Goal: prevent launch with avoidable user experience regressions.

Required thresholds:
1. Core Web Vitals target framing (field, when available):
1.1. evaluate at 75th percentile (p75), separately for mobile and desktop
1.2. LCP <= 2.5s
1.3. INP <= 200ms
1.4. CLS <= 0.1
2. Lighthouse launch thresholds (lab regression gates; run multiple times and use median because results vary run-to-run):
2.1. Performance >= 90 for homepage and article template
2.2. Accessibility >= 90 for sampled templates
2.3. SEO >= 95 for sampled templates
2.4. Best Practices >= 90 for sampled templates
3. Performance budget baseline (starter values; tune with real traffic and template behavior):
3.1. critical-path transfer target less than 170 KB (compressed) as initial budget
3.2. TTI tracked as informational (non-blocking) trend metric

Operational thresholds:
1. Blocking defect if median Lighthouse results for homepage or article template fail required thresholds.
2. Warning-level defect for secondary template budget overruns, escalated to blocker if repeated across template family.
3. If field data is unavailable at launch, enforce lab gates and schedule field-CWV checkpoint once sufficient data is available.

Outputs:
1. `validation/lhci-report/`
2. `validation/performance-budget-report.json`

## Workstream F: Accessibility and Markup Conformance Gates
Goal: launch with measurable accessibility baseline, not aspirational statements.

Accessibility target:
1. WCAG 2.2 AA for launch-critical templates and critical user paths.
2. Site-wide WCAG conformance claims are made only with formal WCAG-EM scoped evaluation/reporting.

Mandatory checks:
1. Automated axe checks on representative templates and key user flows.
2. Manual WAI Easy Checks on representative templates (quick, non-exhaustive baseline):
2.1. page titles
2.2. image alt text
2.3. heading structure
2.4. keyboard-only navigation and visible focus
2.5. contrast ratio baseline (4.5:1 for normal text)
3. HTML validity checks on generated representative pages.

Operational thresholds:
1. Blocking defect for keyboard trap, focus loss, or critical contrast failures on primary templates.
2. Blocking defect for repeated heading/landmark defects across template family.

Outputs:
1. `validation/accessibility-axe-report.json`
2. `validation/accessibility-manual-checklist.md`
3. `validation/html-conformance-report.json`

## Workstream G: Security and HTTPS Readiness Gates
Goal: prevent security regressions in production posture.

Mandatory checks:
1. HTTPS certificate valid on canonical host.
2. Enforce HTTPS enabled in GitHub Pages settings.
3. No critical mixed-content resources.
4. HTTP entry points consolidate to HTTPS canonical host behavior.
5. Canonical and sitemap URLs are HTTPS-only.
6. Custom domain verification is active (domain takeover risk reduced), and wildcard DNS records are not used.
7. If CAA records are present, they allow `letsencrypt.org`.

Recommended hardening checks:
1. Security header posture documented (CSP, HSTS, Referrer-Policy, X-Content-Type-Options).
2. If strict headers cannot be set at origin, decision and edge-layer plan documented before launch.

Operational thresholds:
1. Blocking defect for any HTTPS enforcement failure.
2. Blocking defect for mixed content on homepage or article template.

Outputs:
1. `validation/https-security-report.json`

## Workstream H: Operational Readiness, Rehearsal, and Go/No-Go
Goal: execute launch with clear accountability and fallback confidence.

Pre-launch rehearsal:
1. Run full gate suite on final RC commit.
2. Deploy RC artifact through production-equivalent workflow.
3. Execute smoke tests on representative template matrix.
4. Execute rollback drill and capture mean time to rollback.

Go/No-Go protocol:
1. Required approvers:
1.1. migration owner
1.2. SEO owner
1.3. engineering owner
1.4. operations/DNS owner
2. Block launch on any unresolved blocker gate.
3. Require written risk acceptance for any warning carried into launch.
4. If the migration includes a domain change, Change of Address submission is prepared and validated (not used for HTTP to HTTPS only migrations).

Launch smoke tests (minimum set):
1. homepage
2. top 3 recent posts
3. archive
4. top 3 category pages
5. privacy-policy
6. selected high-backlink legacy routes and their expected outcomes
7. Search Console monitoring setup confirms new and old-URL sitemap submissions via the Sitemaps report/API and transition monitoring (including expected redirect warnings on old-URL sitemap entries).

## CI Integration and Pipeline Placement
Required stages (in order):
1. `build`: Hugo production build.
2. `validate:content`: front matter and required metadata checks.
3. `validate:url`: parity, redirect quality, canonical/sitemap alignment.
4. `validate:quality`: links, HTML conformance, accessibility, Lighthouse.
5. `validate:security`: HTTPS/mixed-content, host invariants, and domain verification checks.
6. `validate:platform`: GitHub Pages constraints (site size <= 1 GB, deploy runtime <= 10 minutes, build-rate assumptions aligned with publishing mode).
7. `deploy:pages`: only runs if all required validation stages pass.

Branch policy:
1. Protect release branch with required checks for all hard blockers.
2. Restrict direct pushes during launch window.

## Definition of Done
1. All Phase 8 hard-blocker gates pass on the designated release-candidate commit.
2. All validation artifacts are generated, archived, and reviewed by named owners.
3. Go/No-Go decision is recorded with approvals and any explicit risk acceptances.
4. Rollback drill is completed with recovery objective of initiating rollback within 60 minutes.
5. Search Console migration readiness items are completed (verification continuity, sitemap submissions, and monitoring dashboards).
6. Phase 9 monitoring handoff package is complete.

## Deliverables Produced by Phase 8
1. [plan/details/phase-8.md](plan/details/phase-8.md) approved plan.
2. CI validation scripts and workflows for all mandatory gates.
3. Validation artifact bundle (`validation/*`) from final RC, including:
- `validation/url-parity-report.json`
- `validation/redirect-quality-report.json`
- `validation/seo-consistency-report.json`
- `validation/robots-sitemap-report.json`
- `validation/structured-data-report.json`
4. Launch Go/No-Go checklist with named approvers and `LAUNCH-GATE-PASS-SUMMARY.md`.
5. `CUTOVER-VERIFICATION-CHECKLIST.md` completed at T-24h with ownership sign-off from engineering, SEO, and incident commander.
6. Rollback rehearsal report and handoff notes for Phase 9.

## Official References Incorporated
1. Site moves with URL changes: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
2. Redirects and Google Search behavior: https://developers.google.com/search/docs/crawling-indexing/301-redirects
3. Canonical consolidation: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
4. Canonical troubleshooting: https://developers.google.com/search/docs/crawling-indexing/canonicalization-troubleshooting
5. Sitemaps overview: https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
6. Build and submit a sitemap: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
7. Robots.txt creation and testing: https://developers.google.com/search/docs/crawling-indexing/robots/create-robots-txt
8. Block indexing and noindex behavior: https://developers.google.com/search/docs/crawling-indexing/block-indexing
9. Ask Google to recrawl URLs: https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
10. URL Inspection tool (Search Console): https://support.google.com/webmasters/answer/9012289
11. Sitemaps report (Search Console): https://support.google.com/webmasters/answer/7451001
12. Page Indexing report (Search Console): https://support.google.com/webmasters/answer/7440203
13. Change of Address tool: https://support.google.com/webmasters/answer/9370220
14. Structured data introduction and validation flow: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
15. Rich Results Test: https://search.google.com/test/rich-results
16. Rich result status reports: https://support.google.com/webmasters/answer/7552505
17. Web Vitals metrics and thresholds: https://web.dev/articles/vitals
18. PageSpeed Insights metric interpretation: https://developers.google.com/speed/docs/insights/v5/about
19. Lighthouse performance scoring: https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/
20. Performance budgets guidance: https://web.dev/articles/performance-budgets-101
21. Lighthouse CI: https://github.com/GoogleChrome/lighthouse-ci
22. WCAG 2.2 conformance: https://www.w3.org/TR/WCAG22/#conformance
23. WCAG-EM evaluation methodology: https://www.w3.org/WAI/test-evaluate/conformance/wcag-em/
24. WAI Easy Checks: https://www.w3.org/WAI/test-evaluate/easy-checks/
25. GitHub Pages limits: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
26. GitHub Pages HTTPS: https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
27. GitHub Pages custom domains: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages
28. Verify custom domain for GitHub Pages: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages
29. Custom domain troubleshooting: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages
30. web.dev HTTPS migration practices: https://web.dev/articles/enable-https
31. web.dev security headers overview: https://web.dev/articles/security-headers
32. MDN HSTS header reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
33. MDN Content Security Policy guide: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
34. W3C Nu HTML Checker: https://validator.w3.org/nu/
35. W3C Link Checker: https://validator.w3.org/checklink
