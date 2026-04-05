# Archive, Contact, 404, And Mobile Overflow Remediation - 2026-04-05

## Change summary

Remediated four site-audit issues in the Hugo source and rebuilt artifact output:

- `/archive/` now renders a real archive surface instead of placeholder fallback copy.
- The footer `Contact` item now points to the public contact section on `/about/` instead of a retired `/contact/` route.
- The content-backed `404.html` and `/404/` routes now publish explicit recovery links in the rendered page body.
- The hidden mobile drawer no longer contributes horizontal overflow on `/category/` at narrow mobile widths.

## Why this changed

The audit found a user-facing placeholder archive route, misleading global footer navigation, underpowered recovery behavior on the built 404 routes, and a reproducible 12px mobile overflow on the category index. These were all public-surface quality issues that could confuse visitors even though the underlying SEO and crawl gates were otherwise passing.

## Behavior details

Old behavior:

- `src/content/pages/archive/index.md` rendered through the standard single-page template and showed `No body content has been added yet.` because the page had no body content.
- `src/layouts/partials/site/footer.html` exposed `Contact` as a global footer link, but the destination either reused `/about/` directly or failed when pointed at the retired legacy `/contact/` route.
- The built `/404/` and `404.html` routes showed explanatory body text only and did not expose actionable recovery links in the rendered artifact.
- The closed mobile drawer remained laid out off-canvas and produced horizontal overflow on `/category/` at small mobile widths.

New behavior:

- `src/layouts/pages/archive.html` gives `/archive/` a dedicated archive shell using the existing archive filter, search, year-jump, and article-card partials.
- Footer `Contact` now resolves to `/about/#contact`, and the About page explicitly exposes that section as the public contact destination.
- The content-backed `src/content/404.md` and `src/content/404-html.md` now include explicit links back to home, archive, archive search, and topics so the built artifact remains useful even when the specialized 404 template path is not selected for those content routes.
- `src/assets/styles/site.css` now forces hidden drawer/backdrop elements out of layout with `[hidden] { display: none; }`, removing the measured mobile overflow.

## Impact

- Visitors who land on `/archive/` now receive a usable archive page instead of placeholder copy.
- Footer navigation no longer points users at a retired route or an ambiguous destination.
- The public 404 routes now offer clear recovery options in the emitted artifact, not just in source templates.
- Category pages no longer introduce sideways scrolling on narrow mobile screens because of the hidden drawer shadow.

## Verification

1. Run `npm run build:prod`.
2. Run `npm run validate:frontmatter`.
3. Run `npm run check:url-parity`.
4. Run `npm run check:seo:artifact`.
5. Run `npm run check:crawl-controls`.
6. Run `npm run check:internal-links`.
7. Manually verify that `/archive/` no longer contains placeholder fallback copy.
8. Manually verify that footer `Contact` resolves to `/about/#contact`.
9. Verify that `/404/` and `/404.html` render recovery links to `/`, `/archive/`, `/archive/#archive-search`, and `/category/`.
10. Verify at a `390px` viewport that `/category/` reports `0px` horizontal overflow.

## Related files

- `src/content/pages/archive/index.md`
- `src/layouts/pages/archive.html`
- `src/layouts/partials/site/footer.html`
- `src/content/pages/about/index.md`
- `src/content/pages/privacy-policy/index.md`
- `src/content/404.md`
- `src/content/404-html.md`
- `src/assets/styles/site.css`
- `src/layouts/404.html`
- `src/layouts/_default/404.html`
- `src/layouts/page/404.html`