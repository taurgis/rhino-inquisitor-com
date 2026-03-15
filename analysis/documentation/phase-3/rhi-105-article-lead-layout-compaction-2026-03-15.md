# RHI-105 · Article Lead Layout Compaction

**Date:** 2026-03-15
**Ticket:** `analysis/tickets/phase-3/RHI-105-article-readability-contextual-navigation.md`

## Change Summary

Updated the Phase 3 article template so post hero media and key takeaways share a single responsive lead region instead of rendering as two full-width blocks one after the other. The change reduces above-the-fold height on article pages while preserving the existing authoring model, article metadata, and shared SEO partial behavior.

## Why This Changed

The original RHI-105 article layout improved readability, but on posts with both a hero image and takeaways the lead stack consumed too much vertical space before the article body began. This made the first paragraph fall below the initial viewport on common desktop sizes and delayed access to the content.

## Behavior Details

### Old vs new behavior

| Surface | Before | After |
|---------|--------|-------|
| Post lead layout | Title/meta, then full-width hero, then full-width takeaways | Title/meta, then responsive lead region combining hero and takeaways |
| Desktop/tablet posts with hero + takeaways | Hero and takeaways stacked vertically | Takeaways render on the left and hero on the right in a split grid |
| Mobile posts with hero + takeaways | Hero then takeaways | Takeaways then hero, reducing scroll-to-context and showing article value earlier |
| Posts with hero only | Hero rendered in header | Hero still rendered in header with no summary chrome added |
| Posts with takeaways only | Takeaways rendered below header | Takeaways render inside the lead region with no empty media slot |
| Non-post single pages | Existing header/hero behavior | Unchanged |

### Rendering notes

- `src/layouts/_default/single.html` now computes whether the current page is a post and whether a summary/takeaways list exists before deciding where the summary partial renders.
- `src/layouts/partials/article/summary-box.html` accepts an optional variant so the same summary logic can render as either the original full-width strip or the compact lead card.
- Lead hero images use a narrower responsive `sizes` hint because they no longer span the entire article width on larger breakpoints.

## Impact

- **Impacted routes:** Post single pages with `heroImage` and/or `takeaways` or `summary` front matter
- **Unchanged routes:** Non-post single pages, archive pages, taxonomy pages, homepage, sitemap, RSS, SEO partial output
- **Authoring impact:** None. Existing `takeaways`, legacy `summary`, and `heroImage` front matter continue to work without changes.

## Verification

1. Run `npm run build:prod` and confirm Hugo builds without template or asset errors.
2. Validate representative post pages at mobile and desktop widths to confirm the first body content appears earlier than before and there is no horizontal overflow.
3. Confirm posts without takeaways and posts without hero images still render without blank layout gaps.
4. Re-run targeted quality gates for this UI change:
   - `npm run check:a11y`
   - `npm run check:seo`

## Related Files

- `src/layouts/_default/single.html`
- `src/layouts/partials/article/summary-box.html`
- `src/static/styles/site.css`
- `analysis/documentation/phase-3/rhi-105-article-readability-2026-03-10.md`