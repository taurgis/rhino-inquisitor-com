# Favicon Logo Contract

## Change summary

- Added a sitewide favicon set derived from the existing Rhino Inquisitor brand mark.
- Centralized favicon link output in the shared Hugo SEO head partial so every rendered page emits the same icon contract.

## Why this changed

- The site was not emitting a working favicon set from the shared head path, so browsers and touch surfaces could miss the Rhino Inquisitor icon.
- Reusing the existing logo keeps branding consistent and avoids introducing a parallel icon source.

## Behavior details

### Old behavior

- The shared head partial emitted canonical, metadata, and structured-data tags but no favicon links.
- The static root did not contain the conventional favicon assets browsers expect.

### New behavior

- The shared SEO head partial now includes a dedicated favicon partial.
- The static root now publishes `favicon.svg`, `favicon.ico`, `favicon-32x32.png`, `favicon-16x16.png`, and `apple-touch-icon.png`.
- The favicon assets are derived from `src/static/images/brand-mark.svg`, which remains the source brand asset.

## Impact

- Affected workflows: Hugo head rendering, browser tab icon display, bookmark icon display, and iOS touch icon fallback.
- Affected maintainers: anyone updating site branding or favicon assets.
- Future logo updates should regenerate the root favicon assets from `src/static/images/brand-mark.svg` so the header logo and favicon stay aligned.

## Verification

1. Run `npm run build:prod`.
2. Confirm built pages emit the favicon links from the shared head path.
3. Confirm `/favicon.svg`, `/favicon.ico`, `/favicon-32x32.png`, `/favicon-16x16.png`, and `/apple-touch-icon.png` exist in the built output.
4. Check at least one Chromium browser and Safari with a hard refresh or fresh session because favicon caching is aggressive.

## Related files

- `src/layouts/partials/seo/head-meta.html`
- `src/layouts/partials/seo/favicons.html`
- `src/static/images/brand-mark.svg`
- `src/static/favicon.svg`
- `src/static/favicon.ico`
- `src/static/favicon-32x32.png`
- `src/static/favicon-16x16.png`
- `src/static/apple-touch-icon.png`