# RHI-024 Homepage Schema Cache Hardening - 2026-03-12

## Change summary

Removed `partialCached` from the homepage `WebSite` JSON-LD emission path so Hugo always renders the schema directly during production builds.

## Why this changed

GitHub Actions continued to fail `npm run check:seo` with `/: missing WebSite JSON-LD on homepage` even after the SEO smoke check was updated to rebuild `public/` before validation. The remaining fragile point was the homepage-only schema partial being rendered through a static `partialCached` key in `src/layouts/partials/seo/head-meta.html`, which added unnecessary cache behavior to a single critical homepage SEO signal.

## Behavior details

Old behavior:

- The homepage schema path used `{{ partialCached "seo/json-ld-site.html" . "seo-json-ld-site" }}` behind an `.IsHome` guard.
- Local builds could pass while CI still failed, leaving the homepage `WebSite` JSON-LD missing from the rendered output checked by `scripts/check-seo.js`.
- The validator remained strict, but the template path included cache behavior that was not needed for a single homepage render.

New behavior:

- The homepage schema path now uses `{{ partial "seo/json-ld-site.html" . }}`.
- The `WebSite` JSON-LD block is rendered directly from the current homepage context on every production build.
- `npm run check:seo` remains unchanged as a strict gate and now validates the non-cached homepage schema output.

## Impact

- Homepage structured data is no longer dependent on template cache behavior during CI builds.
- The SEO smoke check keeps its existing homepage requirement instead of weakening the validator.
- The change removes an unnecessary optimization from a single-render SEO partial while leaving other schema partial behavior unchanged.

## Verification

- Run `npm run check:seo` and confirm it passes.
- Confirm `public/index.html` contains `"@type":"WebSite"` after the production build.
- Spot-check a representative article page and confirm it still emits `BlogPosting` JSON-LD while the homepage emits `WebSite` JSON-LD.

## Related files

- `src/layouts/partials/seo/head-meta.html`
- `src/layouts/partials/seo/json-ld-site.html`
- `scripts/check-seo.js`
- `package.json`
