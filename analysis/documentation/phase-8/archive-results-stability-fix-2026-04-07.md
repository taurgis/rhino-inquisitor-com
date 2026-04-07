# Feature Name

Archive Results Stability Fix

## Change Summary

Updated the shared archive card rendering path so the first image-bearing archive card is emitted as an eager, high-priority candidate on the initial server-rendered page, aligned the archive critical CSS with the final archive card and desktop filter-rail layout to reduce first-paint shifts on archive-style routes, and removed the remaining explicit style query from the header drawer script as a forced-reflow hardening step.

## Why This Changed

PageSpeed reported three related issues on the posts/archive experience:

- The first visible image-bearing archive card was still lazy-loaded and not marked as high priority.
- The archive filter rail, jump-year controls, and archive results block shifted when the deferred full stylesheet replaced the inline critical archive CSS.
- The resulting instability surfaced as archive-results CLS on desktop and a general forced-reflow warning on mobile.

The existing critical archive stylesheet reserved materially different card, filter-rail, and results geometry than the final stylesheet, so the route was painting one layout and settling into another after CSS swap.

## Behavior Details

### Previous Behavior

- Every archive card image used the archive default lazy-loading behavior unless the card used the featured variant.
- The first visible archive card on posts, archive, and term/list routes was not eligible for eager fetch or fetchpriority high on initial HTML.
- The inline critical archive CSS used smaller card gaps, smaller card padding, a narrower grid minimum, extra archive-results padding, no badge-overlay positioning, and lacked the desktop archive-rail sizing and topic-link grid rules used by the final stylesheet.
- The header drawer close path restored focus by calling `window.getComputedStyle(toggle).display` before focusing the mobile menu button.

### New Behavior

- The shared content-list partial now flags the first image-bearing archive card for priority treatment in the shared article-card partial.
- The first image-bearing archive card on the initial server-rendered view now uses eager loading and fetchpriority high, while later archive cards remain lazy-loaded.
- The archive critical CSS now mirrors the final archive card geometry more closely for results spacing, grid sizing, card padding, media containers, badge overlays, and the desktop archive filter rail so the archive-results section is less likely to jump when the deferred stylesheet applies.
- The header drawer close path now relies on the existing desktop media query state instead of a runtime `getComputedStyle` check before restoring focus to the mobile menu toggle.

## Impact and Verification

### Impact

- Affected routes: posts list, dedicated archive page, taxonomy term archives, and other routes that render the shared archive card list.
- Affected maintainers: anyone changing archive card templates, archive critical CSS, list/term route performance behavior, or the shared header drawer script.
- Risk profile: low-to-medium. The image-loading change is intentionally limited to the first archive card on the initial server-rendered page, and the CSS change is scoped to critical archive layout parity for both cards and the desktop filter rail.

### Acceptance Criteria

- [x] The first server-rendered image-bearing archive card on archive-style routes is no longer lazy-loaded and is marked with high fetch priority.
- [x] The archive critical CSS reserves the same above-the-fold card geometry as the final stylesheet for archive results.

### Verification

- Build the production artifact with `npm run build:prod`.
- Inspect the built archive-style HTML and confirm the first archive card image uses eager loading and fetchpriority high.
- Re-run PageSpeed or Lighthouse on a posts/archive route and confirm the archive-results section no longer shows the same first-paint shift pattern.
- Re-test one taxonomy term archive because it shares the same content-list and card stack.

## Related Files

- `src/layouts/partials/content-list.html`
- `src/layouts/partials/cards/article-card.html`
- `src/assets/styles/critical-archive.css`
- `src/layouts/partials/site/header.html`

## Assumptions and Open Questions

- This fix targets the initial server-rendered archive view. The client-rendered search and sort path still uses the search index payload, which does not yet include the full responsive image metadata emitted by the Hugo image partial.
- If PageSpeed still reports forced reflow after this change on the default archive route, the next inspection target should be route-specific runtime behavior captured in a Chrome Performance trace rather than further archive template changes.