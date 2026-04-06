# AVIF Picture Fallback Support - 2026-04-06

## Change summary

Updated the shared Hugo image-rendering contract so local images automatically gain generated AVIF variants through a pre-build Sharp cache while keeping the existing non-AVIF `<img>` fallback path for browsers that do not support AVIF.

## Why this changed

The repository previously emitted either a single processed `webp` image or a single original-image fallback. The first AVIF implementation required manually authored sibling `.avif` files, which did not satisfy the requirement that AVIF support happen automatically. The updated change adds automatic AVIF generation without depending on undocumented Hugo AVIF transcoding behavior.

## Behavior details

Old behavior:

- `src/layouts/partials/media/image.html` always emitted a standalone `<img>` element.
- Processable local raster images were converted to `webp`, and non-processed paths kept the original asset.
- Markdown body images rendered through a separate hook that bypassed the shared image partial.
- `scripts/seo/check-images.js` validated `<img src>` paths only and did not inspect `<source srcset>` candidates.
- AVIF support required a manually authored sibling `.avif` asset to exist before `<picture>` markup could appear.

New behavior:

- `scripts/generate-avif-cache.js` now generates AVIF derivatives automatically for eligible local raster sources before Hugo builds the site.
- Generated AVIF assets are written under `src/assets/generated-avif/`, which is ignored by git but available to Hugo as global resources during the build.
- `src/layouts/partials/media/image.html` now resolves generated AVIF derivatives automatically and emits `<picture>` with width-matched `srcset` candidates when they exist.
- The fallback `<img>` remains the canonical compatibility path and keeps the existing width, height, loading, decoding, class, and responsive non-AVIF `srcset` behavior.
- Markdown body images now reuse the shared image partial on local assets so they follow the same AVIF-with-fallback contract.
- `scripts/seo/check-images.js` now validates `srcset` candidates on both `<img>` and `<picture><source>` elements so broken AVIF branches cannot slip past CI.

## Impact

- Maintainers no longer need to author AVIF companions manually; the build generates them automatically for supported local raster assets.
- Unsupported browsers continue to render the existing fallback image path instead of failing on AVIF-only markup.
- Markdown article images now share the same image contract as hero, card, and shortcode-driven images for local assets.
- The build now owns AVIF cache freshness, so updated source images automatically regenerate their AVIF derivatives on the next build.
- Image validation coverage now includes `<picture>` sources and `srcset` candidates, reducing regressions in responsive image markup.

## Verification

- Run `npm run build:prod` and confirm the Hugo production build completes successfully.
- Confirm the build logs report AVIF cache generation before Hugo starts.
- Run `npm run check:images` and confirm both `<img src>` and `<picture><source srcset>` targets resolve in built output.
- Run `npm run check:html-conformance` and confirm the updated markup remains valid.
- Inspect a representative built page with a local image and confirm the HTML includes `<picture>` with generated AVIF sources and the existing non-AVIF fallback.

## Related files

- `src/layouts/partials/media/image.html`
- `src/layouts/_default/_markup/render-image.html`
- `scripts/generate-avif-cache.js`
- `scripts/seo/check-images.js`
- `docs/migration/ASSET-POLICY.md`