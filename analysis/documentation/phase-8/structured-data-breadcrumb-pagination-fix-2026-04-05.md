# Structured Data Breadcrumb Pagination Fix - 2026-04-05

## Change summary

Fixed the Phase 8 structured-data gate failure on paginated archive routes by making breadcrumb generation use the current paginator URL instead of the base section permalink.

## Why this changed

After `/pages/page/2/` was added to the validation sample matrix, the structured-data gate started failing because the emitted `BreadcrumbList` still ended at `https://www.rhino-inquisitor.com/pages/` instead of the actual current route `https://www.rhino-inquisitor.com/pages/page/2/`.

## Behavior details

Old behavior:

- Shared breadcrumb data used `.Permalink` for the current item on list-style routes.
- Hugo paginated archive pages such as `/pages/page/2/` therefore emitted a `BreadcrumbList` whose final item URL pointed at the base archive route.
- `npm run check:structured-data` failed with `BreadcrumbList final item does not match the current route`.

New behavior:

- Shared breadcrumb data now checks the active paginator from `listPaginator` and, when the current page number is greater than 1, uses the paginator URL as the current breadcrumb URL.
- Paginated archives now emit `BreadcrumbList` final items that resolve to the actual paginated route.
- The fix applies through the shared breadcrumb data path, so both visible breadcrumb generation and JSON-LD breadcrumb generation stay aligned.

## Impact

- `npm run check:structured-data` now passes for paginated `/pages/` archive routes.
- Future paginated list surfaces that populate `listPaginator` inherit the same breadcrumb URL behavior.
- The change is limited to paginated breadcrumb URL resolution and does not widen schema families or alter canonical handling.

## Verification

- Run `npm run build:prod`.
- Run `npm run check:structured-data` and confirm `validation/structured-data-report.json` reports `29` checked routes, `29` pass routes, `0` fail routes, and `0` blocking findings.
- Inspect `public/pages/page/2/index.html` and confirm the `BreadcrumbList` final item points to `https://www.rhino-inquisitor.com/pages/page/2/`.
- Run `npm run check:seo:artifact` to confirm the change does not disturb the broader SEO artifact gate.

## Related files

- `src/layouts/partials/breadcrumbs-data.html`
- `src/layouts/partials/breadcrumbs.html`
- `src/layouts/partials/seo/json-ld-breadcrumb.html`
- `scripts/phase-8/check-structured-data.js`
- `validation/structured-data-report.json`