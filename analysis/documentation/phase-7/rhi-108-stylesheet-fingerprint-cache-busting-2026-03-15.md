# RHI-108 · Fingerprinted Stylesheet Cache Busting

## Change summary

The shared site stylesheet now ships through Hugo's asset pipeline as a fingerprinted file instead of a fixed `/styles/site.css` path. This changes the generated CSS filename whenever the stylesheet content changes, which prevents browsers from reusing a stale deployed stylesheet after a release.

## Why this changed

Staging and preview checks showed that browsers could continue using a cached copy of the fixed stylesheet URL after deploys. A deployment timestamp would force a new CSS URL every release, but Hugo content fingerprinting is a safer fit because it invalidates cache only when the stylesheet bytes actually change.

## Behavior details

Old behavior:
- Templates linked the stylesheet with a fixed path: `/styles/site.css`.
- Deploy validation asserted that exact fixed path in preview output.
- Browsers could legitimately keep using a stale CSS file until the fixed URL was revalidated.

New behavior:
- Templates now render the shared stylesheet through a single partial backed by `resources.Get` and `fingerprint`.
- Build output now emits a hashed stylesheet filename such as `/styles/site.<hash>.css` or `/styles/site.min.<hash>.css`, depending on the final Hugo Pipes chain.
- The deploy workflow validates the fingerprinted path prefix instead of a fixed filename.
- Browsers fetch a new stylesheet whenever the CSS content changes, while unchanged CSS keeps the same URL.

## Impact

- Affected runtime surfaces: every page that uses the shared site shell or archive head block.
- Affected maintainer workflow: preview deployment validation now expects a fingerprinted stylesheet path.
- Unchanged behavior: page URLs, canonical output, sitemap behavior, and GitHub Pages deployment architecture.

## Verification

1. Run `npm run build:prod` and confirm generated HTML references a fingerprinted stylesheet path such as `/styles/site.<hash>.css` or `/styles/site.min.<hash>.css` rather than `/styles/site.css`.
2. Run the preview build path used by the Pages workflow and confirm the stylesheet URL includes the preview base-path prefix plus the fingerprinted filename.
3. Run the Pages deploy validation logic and confirm the preview-host stylesheet assertion passes with the hashed CSS URL.
4. Re-run targeted regression gates:
   - `npm run check:a11y:seo`
   - `npm run check:seo:artifact`

## Related files

- `src/assets/styles/site.css`
- `src/layouts/partials/site/stylesheet.html`
- `src/layouts/_default/baseof.html`
- `src/layouts/_default/list.html`
- `.github/workflows/deploy-pages.yml`
- `analysis/documentation/phase-7/rhi-074-preview-validation-baseurl-2026-03-10.md`