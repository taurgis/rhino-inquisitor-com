# Article Image Zoom Modal — 2026-05-05

## Change summary
Added an article-image zoom flow for large local raster images. Eligible article-body images and `img-caption` figures now render a smaller responsive inline asset and expose a larger version in an on-page modal so readers can inspect diagrams and screenshots without leaving the article.

## Why this changed
Several articles rely on screenshots and diagrams where inline reading width hides important detail. The previous implementation rendered article images as static content only, so readers had no in-page way to inspect larger visuals and maintainers had no shared rule for when a larger view should be offered.

## Behavior details

### Previous behavior
- Article-body Markdown images rendered as plain inline images with no modal behavior.
- `img-caption` figures rendered as plain figures, and any same-image links navigated directly to the file instead of opening an in-page larger view.
- Article image rendering intentionally skipped Hugo processing in these paths, so the inline view and any manual larger view used the same source asset.

### New behavior
- Local processable raster images in article bodies now render as responsive inline assets capped for reading width.
- If the source image is at least `1280px` wide and offers at least `320px` of additional width beyond the inline rendition, the image becomes zoom-eligible.
- Zoom-eligible images now show a visible `Zoom` badge so readers can tell which images open the larger view.
- Zoom-eligible images open a single page-level modal with a larger source asset. When available, the modal also uses the larger AVIF sidecar.
- Plain eligible images gain keyboard support and can open with `Enter`; the modal closes with the close button or `Escape`, and focus returns to the original trigger.
- External image links stay untouched. Same-image `img-caption` links continue to work as links without JavaScript and open the modal when JavaScript is active.
- Hero images remain out of scope for this feature.

## Impact
- Readers can inspect larger diagrams and screenshots without leaving the article route.
- Maintainers now have one shared eligibility rule for article image zoom rather than per-post behavior.
- Hugo builds now process article-body local raster images into responsive inline assets, so changes to article image sizing should be validated with a production build.

## Verification
1. Run `hugo --minify --environment production`.
2. Confirm a large local article image emits `data-rhino-zoom-*` attributes and loads the modal dialog shell in the rendered HTML.
3. Open an eligible page such as `/salesforce-b2c-commerce-cloud-erd/` and verify click and `Enter` open the modal, `Escape` closes it, and focus returns to the image trigger.
4. Open a page with an external linked image such as `/where-to-start-when-you-are-new-to-salesforce-b2c-commerce-cloud-development/` and verify the image is not upgraded into a zoom trigger.
5. In Safari, verify the eligible page renders one zoom trigger with one visible `Zoom` badge, keyboard activation opens the modal, and `Escape` closes it without upgrading the external-link example page.

## Related files
- `src/layouts/partials/media/image.html`
- `src/layouts/_default/_markup/render-image.html`
- `src/layouts/shortcodes/img-caption.html`
- `src/layouts/_default/single.html`
- `src/static/scripts/article-image-zoom.js`
- `src/assets/styles/site.css`

## Assumptions and open questions
- This feature applies only to local processable raster images. Remote images, GIFs, and hero images remain unchanged.
- The current eligibility rule favors large diagrams and screenshots. If maintainers later want more article images to zoom, they can lower the minimum source width or inline cap in the shared media partial.