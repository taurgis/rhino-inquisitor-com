# RHI-048 Metadata and Canonical Architecture Implementation

Date: 2026-03-12
Ticket: `analysis/tickets/phase-5/RHI-048-metadata-canonical-architecture.md`

## Change summary

RHI-048 now has a dedicated metadata validation gate, an explicit Phase 5 canonical policy, paginator-aware canonical rendering, and an explicit 404 template. The new gate validates built HTML in `public/`, writes a per-page CSV report, and blocks CI before deploy when canonical or metadata defects are present.

## Why this changed

Phase 5 Workstream A is the first hard SEO control after bootstrap. The repository already had centralized SEO partials, but it did not yet have a dedicated metadata/canonical validator, a committed canonical policy, or explicit 404 output. Paginated archive pages were also indexable while still canonicalizing to the section root, which conflicted with the Phase 5 rule that canonical, sitemap URL, and rendered page URL must agree for retained paginated routes.

## Behavior details

Old behavior:

- The repo used the shared SEO partials in `src/layouts/partials/seo/`, but there was no dedicated `check:metadata` gate or CSV report for metadata and canonical validation.
- Paginated archive pages such as `/posts/page/2/` rendered as indexable routes while reusing the section root canonical URL.
- There was no committed `migration/phase-5-canonical-policy.md` artifact.
- There was no explicit `src/layouts/404.html` template, so the representative 404 requirement from RHI-048 could not be validated from a real output artifact.

New behavior:

- `scripts/seo/check-metadata.js` scans built `public/**/*.html` output with Cheerio, validates required metadata and canonical rules for indexable pages, checks canonical-to-sitemap consistency, enforces manifest-based canonical safety, and writes `migration/reports/phase-5-metadata-report.csv`.
- `npm run check:metadata` is now available in `package.json` and is wired into both the PR route-sensitive build and the deploy workflow as a blocking step before later release stages.
- Paginated archive pages now self-canonicalize to their current `/page/N/` route, and their metadata title/description become page-number-aware to avoid duplicate metadata drift across retained archive pages.
- `src/layouts/404.html` now emits a real error-page artifact that shares the central SEO logic, allowing explicit validation that the 404 page is `noindex`, absent from the sitemap, and not canonicalized to a live indexable route.
- `migration/phase-5-canonical-policy.md` records the default rule, override constraints, conflict-resolution procedure, and sitemap-consistency requirement for future workstreams.
- The current `phase-5-metadata-report.csv` closes with zero blocking rows and 10 warning-only duplicate metadata advisories from the existing content corpus.

## Impact

- Phase 5 now has a machine-verifiable metadata and canonical gate that can stop deploys before bad canonical signals reach production.
- Workstreams that depend on canonical policy, especially sitemap/discovery continuity and internal-linking validation, now have a committed policy and report artifact to reference.
- Paginated archive routes align with the repository’s existing sitemap contract instead of emitting a root-list canonical mismatch.

## Verification

- `npm run build:prod`
- `npm run check:metadata` -> passed for `215` indexable pages; `migration/reports/phase-5-metadata-report.csv` written with `10` warning-only duplicate metadata advisories and `0` blocking failures
- `npm run check:seo:artifact` -> passed for `215` indexable routes
- `npx markdownlint-cli2 analysis/documentation/phase-5/rhi-048-metadata-canonical-architecture-implementation-2026-03-12.md migration/phase-5-canonical-policy.md`
- Manual artifact checks on representative outputs: `public/index.html`, `public/a-beginners-guide-to-webdav-in-sfcc/index.html`, `public/category/technical/index.html`, `public/about/index.html`, `public/posts/page/2/index.html`, and `public/404.html`

## Related files

- `src/layouts/_default/list.html`
- `src/layouts/partials/seo/resolve.html`
- `src/layouts/404.html`
- `scripts/seo/check-metadata.js`
- `package.json`
- `.github/workflows/build-pr.yml`
- `.github/workflows/deploy-pages.yml`
- `migration/phase-5-canonical-policy.md`
- `analysis/tickets/phase-5/RHI-048-metadata-canonical-architecture.md`
