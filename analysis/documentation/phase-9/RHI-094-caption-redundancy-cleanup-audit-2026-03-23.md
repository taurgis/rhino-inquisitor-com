# RHI-094 Caption Redundancy Cleanup Audit (2026-03-23)

## Change summary

Audited every `img-caption` shortcode used in `src/content/posts/**/index.md`, removed explicit captions that were empty or duplicated the image alt text, and updated the shortcode layout so captionless images no longer render the bordered caption card.

## Why this changed

The previous `img-caption` implementation always rendered the figure container with caption-specific padding, border, and background styling, even when no visible caption remained. In practice that left some articles with unnecessary card chrome around plain images and some duplicate visible caption text that added no reader value beyond the alt text.

## Behavior details

### Old behavior

- `img-caption` always rendered the `article-figure` card layout around the image.
- A visible `figcaption` rendered whenever a `caption` parameter existed, even when it duplicated the image alt text or only carried a zero-width placeholder.
- Posts with no meaningful caption still paid the visual cost of the figure card.

### New behavior

- `img-caption` now renders `article-figure--captioned` only when the caption text is visibly non-empty after trimming and zero-width placeholder removal.
- Captionless shortcode images render as `article-figure--plain`, which keeps normal article image spacing without the border, padding, or background card.
- The article audit removed 56 explicit `caption` parameters from 33 post files where the caption was empty or duplicated the alt text.
- An additional 50 shortcode images already had no caption parameter and now also benefit from the plain layout automatically.
- A follow-up nearby-text recheck removed 4 leftover post-figure label paragraphs from 2 post files.
- A later follow-up removed 12 additional low-value captions across 6 posts where the visible caption only restated the section topic, a raw URL, or an unused `Figure X` label.

## Impact

- Shortcode scope reviewed: 402 `img-caption` instances across all post articles.
- Content cleanup scope: 56 obsolete captions removed across 33 files in `src/content/posts/`.
- Nearby-text cleanup scope: 4 leftover caption-style paragraphs removed across 2 files.
- Low-value caption cleanup scope: 12 additional captions removed across 6 files.
- Layout scope: all 106 captionless shortcode images now render without caption-card chrome.
- Accessibility scope: alt text remains unchanged; semantic `figure` and `figcaption` output is preserved for images that still carry meaningful visible captions.

## Verification

1. Audit inventory: scanned all `img-caption` shortcodes in `src/content/posts/**/index.md` and classified explicit captions using this deterministic rule set:
   - remove when caption is empty after normalization
   - remove when caption text duplicates alt text after normalization
2. Example route check: `/lets-go-live-customer-migration/` now keeps both images while dropping the redundant duplicate-alt captions.
3. Renderer safety: shortcode logic now trims caption text before deciding whether to render `figcaption` and whether to apply caption-card styling.
4. Nearby-text recheck: rerun `node tmp/check_post_figure_paragraphs.cjs` after cleanup and confirm only the documented keep-body exceptions remain.
5. Low-value caption review: remove captions only when they do not distinguish adjacent screenshots, are not referenced by figure number in body copy, and add no visible information beyond the section heading or alt text.
6. Build verification: run `npm run build:prod` after the cleanup and confirm zero Hugo build errors.

## Related files

- `src/layouts/shortcodes/img-caption.html`
- `src/assets/styles/site.css`
- `src/content/posts/**/index.md`
- `src/content/posts/lets-go-live-customer-migration/index.md`
- `analysis/documentation/README.md`