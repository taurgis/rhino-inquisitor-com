# RHI-052 Structured Data and Rich-Result Readiness Implementation

Date: 2026-03-13
Ticket: `analysis/tickets/phase-5/RHI-052-structured-data-rich-result-readiness.md`

## Change summary

RHI-052 now has a dedicated Phase 5 schema audit gate, a committed structured-data coverage artifact, blocking CI integration for route-sensitive PR and deploy workflows, a template fix that stops breadcrumb schema from leaking onto the 404 page, and owner-approved closeout language for homepage `WebSite` Rich Results behavior.

## Why this changed

The repository already emitted core JSON-LD through the shared SEO partials, but Workstream E still lacked a repo-owned coverage contract, a dedicated post-build validator, and CI enforcement targeted at required schema properties and template-family scope. Without that gate, invalid dates, missing authors, article-schema leakage onto non-article routes, or raw template output in JSON-LD would remain latent until external Google tooling or Search Console surfaced them.

## Behavior details

### Old behavior

- The repo emitted `WebSite`, `BlogPosting`, and `BreadcrumbList` JSON-LD through shared Hugo partials, but there was no dedicated `npm run check:schema` gate or per-page Phase 5 schema audit report.
- Route-sensitive PR and deploy workflows did not block on a structured-data validation step.
- The 404 artifact inherited breadcrumb schema eligibility from shared breadcrumb data even though it does not render a visible breadcrumb trail.
- The repository had no committed structured-data coverage document confirming which template families emit which schema types and why `VideoObject` is or is not in scope.

### New behavior

- `scripts/seo/check-schema.js` now scans every built HTML file in `public/`, parses all `application/ld+json` blocks, validates required `WebSite`, `BlogPosting`, and `BreadcrumbList` properties, enforces article-schema scope, checks ISO 8601 dates with timezone offsets, checks author-object shape, compares schema headlines and breadcrumb labels to visible page content, detects raw Hugo template-expression leakage, and writes `migration/reports/phase-5-schema-audit.csv`.
- `npm run check:schema` is now available in `package.json` and runs as a blocking step in both `.github/workflows/build-pr.yml` and `.github/workflows/deploy-pages.yml`.
- `migration/phase-5-structured-data-coverage.md` records the schema inventory, required-property checklist, template mapping, and the current decision not to emit `VideoObject` because the site does not yet render qualifying on-page watch templates.
- `src/layouts/partials/seo/json-ld-breadcrumb.html` now suppresses breadcrumb schema on the 404 page so structured data only ships where the breadcrumb trail is actually visible.
- The ticket closeout now treats homepage Rich Results Test output as evidence language rather than a pass/fail rich-result item: the recorded `No items detected` result for homepage `WebSite` markup is accepted when homepage `WebSite` properties pass the schema audit gate.

## Impact

- Maintainers now have a dedicated Phase 5 schema audit artifact in `migration/reports/phase-5-schema-audit.csv` for sign-off evidence and CI traceability.
- Route-sensitive PRs and production deploys will now fail before release if required structured-data properties go missing, dates lose timezone offsets, breadcrumb markup drifts from visible navigation, or article schema leaks onto non-article routes.
- The repository now has an explicit decision record that `VideoObject` is deferred until the site renders a true watch-page experience instead of merely linking out to external video hosts.

## Verification

- `npm run build:prod`
- `npm run check:schema`
- `npm run check:metadata`
- `npm run check:sitemap`
- `npm run check:crawl-controls`
- `npm run check:seo:artifact`
- `npm run check:links`

Observed results on 2026-03-13:

- Schema audit: passed for `223` built HTML pages; `migration/reports/phase-5-schema-audit.csv` written with `0` critical failures
- Metadata audit: passed for `215` indexable pages; `10` warning-only duplicate metadata advisories remain unchanged from the current corpus baseline
- Sitemap/feed audit: passed for `215` sitemap URLs
- Crawl-control audit: passed for `223` HTML routes in production mode
- SEO smoke check: passed
- Internal link check: passed
- Manual Google Rich Results Test, category sample (`/category/video/` reduced code input): `1` valid Breadcrumbs item detected; result URL `https://search.google.com/test/rich-results/result?id=XRzC5U9CsEECUPce9DanBg`
- Manual Google Rich Results Test, article sample (`/a-dev-guide-to-combating-fraud-on-sfcc/` reduced code input): `2` valid items detected (`Articles: 1 valid item detected`, `Breadcrumbs: 1 valid item detected`), with `Articles` showing non-critical issues; result URL `https://search.google.com/test/rich-results/result?id=rQ8ezV94VwjdFWNutmdBjg`
- Manual Google Rich Results Test, homepage sample (`/` reduced code input): `No items detected`; the tool reported `No rich results detected in this URL` because `WebSite` is not a supported Google rich-result type; result URL `https://search.google.com/test/rich-results/result?id=IcCP2xWkKgYxXXej0x-l8A`

## Related files

- `scripts/seo/check-schema.js`
- `src/layouts/partials/seo/json-ld-breadcrumb.html`
- `package.json`
- `.github/workflows/build-pr.yml`
- `.github/workflows/deploy-pages.yml`
- `migration/phase-5-structured-data-coverage.md`
- `migration/reports/phase-5-schema-audit.csv`
- `analysis/tickets/phase-5/RHI-052-structured-data-rich-result-readiness.md`

## Assumptions and open questions

- `VideoObject` remains intentionally unimplemented because the current corpus exposes outbound YouTube links and archive listings rather than an on-page watch experience with the metadata Google expects for video rich results.
