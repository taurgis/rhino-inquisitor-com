# RHI-105 · Article Lead Layout Compaction

**Date:** 2026-03-15
**Ticket:** `analysis/tickets/phase-3/RHI-105-article-readability-contextual-navigation.md`

## Change Summary

Updated the Phase 3 article template so post hero media and key takeaways share a single responsive lead region instead of rendering as two full-width blocks one after the other, and widened the desktop article-title measure so long post headlines use the header more effectively. The change reduces above-the-fold height on article pages while preserving the existing authoring model, article metadata, shared SEO partial behavior, and mobile title handling.

## Why This Changed

The original RHI-105 article layout improved readability, but on posts with both a hero image and takeaways the lead stack consumed too much vertical space before the article body began. This made the first paragraph fall below the initial viewport on common desktop sizes and delayed access to the content.

After the compaction update, the shared article header still constrained long titles to an `18ch` max width on desktop. On representative posts this limited the headline to roughly one-third of the available header width, which weakened hierarchy and made the hero/summary region feel visually wider than the title introducing it.

## Behavior Details

### Old vs new behavior

| Surface | Before | After |
|---------|--------|-------|
| Post lead layout | Title/meta, then full-width hero, then full-width takeaways | Title/meta, then responsive lead region combining hero and takeaways |
| Desktop/tablet posts with hero + takeaways | Hero and takeaways stacked vertically | Takeaways render on the left and hero on the right in a split grid |
| Desktop post title measure | Title capped at `18ch`, often using about one-third of the header width on long headlines | Title uses a bounded fluid measure (`clamp(22ch, 52vw, 31ch)`) with balanced wrapping so it occupies more of the header without becoming a single overlong line |
| Mobile posts with long code samples | Header could inherit width pressure from wide syntax-highlighted code lines later in the article | Article shell and key grid children now opt into `min-width: 0`, so mobile headers stay within the viewport while `pre` blocks continue to scroll horizontally inside the content column |
| Mobile posts with hero + takeaways | Hero then takeaways | Takeaways then hero, reducing scroll-to-context and showing article value earlier |
| Posts with hero only | Hero rendered in header | Hero still rendered in header with no summary chrome added |
| Posts with takeaways only | Takeaways rendered below header | Takeaways render inside the lead region with no empty media slot |
| Non-post single pages | Existing header/hero behavior | Unchanged |

### Rendering notes

- `src/layouts/_default/single.html` now computes whether the current page is a post and whether a summary/takeaways list exists before deciding where the summary partial renders.
- `src/layouts/partials/article/summary-box.html` accepts an optional variant so the same summary logic can render as either the original full-width strip or the compact lead card.
- Lead hero images use a narrower responsive `sizes` hint because they no longer span the entire article width on larger breakpoints.
- `src/assets/styles/site.css` now lets `.page-article__intro` breathe slightly wider on desktop and replaces the fixed title cap with a fluid bounded measure plus `text-wrap: balance` for cleaner multi-line headlines.
- The article shell also applies `min-width: 0` to the header/body siblings so wide code examples keep their own horizontal scroll instead of stretching the entire post container on mobile.

## Impact

- **Impacted routes:** Post single pages with `heroImage` and/or `takeaways` or `summary` front matter
- **Unchanged routes:** Non-post single pages, archive pages, taxonomy pages, homepage, sitemap, RSS, SEO partial output
- **Authoring impact:** None. Existing `takeaways`, legacy `summary`, and `heroImage` front matter continue to work without changes.
- **Responsive impact:** Mobile keeps the existing uncapped title rule, while desktop and tablet now give long titles a wider but still controlled measure.
- **Code-heavy article impact:** Syntax-highlighted code blocks continue to use internal horizontal scrolling on narrow screens, but they no longer force the article header or footer modules wider than the viewport.

## Verification

1. Run `npm run build:prod` and confirm Hugo builds without template or asset errors.
2. Validate representative post pages at mobile and desktop widths to confirm the first body content appears earlier than before, long titles use more of the header width, and there is no horizontal overflow.
3. Confirm posts without takeaways and posts without hero images still render without blank layout gaps.
4. Re-run targeted quality gates for this UI change:
   - `npm run check:a11y`
   - `npm run check:seo`
5. Verify the target article at `http://localhost:1313/field-guide-to-custom-caches-in-sfcc/` at desktop and mobile widths:
   - Desktop: title should occupy materially more than the previous ~33% header-width baseline while remaining multi-line and readable.
   - Mobile: title should stay within the content padding with no clipping, and any long code examples should scroll inside their own `pre` container instead of widening the full article shell.

## Related Files

- `src/layouts/_default/single.html`
- `src/layouts/partials/article/summary-box.html`
- `src/assets/styles/site.css`
- `analysis/documentation/phase-3/rhi-105-article-readability-2026-03-10.md`