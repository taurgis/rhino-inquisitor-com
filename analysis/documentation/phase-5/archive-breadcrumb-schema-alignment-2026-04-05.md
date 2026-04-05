# Archive Breadcrumb Schema Alignment - 2026-04-05

## Change summary

Aligned the `/archive/` visible breadcrumb trail and `BreadcrumbList` JSON-LD so both now resolve from the same shared breadcrumb source.

## Why this changed

The Phase 5 schema gate failed because `/archive/` rendered a two-item visible breadcrumb trail while the shared breadcrumb data used by the SEO schema partial added an extra `Pages` item. That produced a structured-data trail that did not match what users saw on the page.

## Behavior details

Old behavior:

- `src/layouts/pages/archive.html` hardcoded `Rhino Inquisitor > Archive` as visible breadcrumbs.
- `src/layouts/partials/breadcrumbs-data.html` treated `/archive/` like a regular page under the `pages` section and returned `Rhino Inquisitor > Pages > Archive` for JSON-LD.
- `scripts/seo/check-schema.js` failed because the `BreadcrumbList` item count did not match the visible breadcrumb trail.

New behavior:

- `src/layouts/pages/archive.html` now renders the shared `breadcrumbs.html` partial instead of a route-local breadcrumb implementation.
- `src/layouts/partials/breadcrumbs-data.html` now treats `/archive/` as a standalone archive route and returns `Rhino Inquisitor > Archive` for both visible breadcrumbs and JSON-LD.
- The schema gate now validates `/archive/` against a single breadcrumb interpretation.

## Impact

- `/archive/` breadcrumb markup and `BreadcrumbList` schema are now kept in sync from one shared source.
- The fix is scoped to the standalone archive route and does not redefine breadcrumb behavior for other page routes.
- Maintainers get schema-gate coverage for future `/archive/` breadcrumb regressions without weakening validator rules.

## Verification

- Run `npm run check:schema` and confirm the `/archive/` breadcrumb mismatch is gone.
- Run `npm run check:seo:artifact` to confirm no related structured-data regression appears in the broader SEO artifact gate.
- Inspect `public/archive/index.html` and confirm the visible breadcrumb labels match the `BreadcrumbList.itemListElement` labels and count.

## Related files

- `src/layouts/pages/archive.html`
- `src/layouts/partials/breadcrumbs-data.html`
- `src/layouts/partials/breadcrumbs.html`
- `src/layouts/partials/seo/json-ld-breadcrumb.html`
- `scripts/seo/check-schema.js`