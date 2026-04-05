# Change summary

Archive article card images on mobile now reliably fill the full width of their container by adding explicit `width: 100%` and `min-width: 0` constraints to the card, its list-item wrapper, and the media container.

# Why this changed

On mobile viewports (≤ 47.99rem), the `aspect-ratio: 16/9` and `min-height: 11rem` properties on `.article-card__media` can interact in a way that causes the browser to compute the element's intrinsic inline size from the `min-height` value via the aspect ratio. For example, at a 280px viewport: `min-height: 11rem = 176px`, and `aspect-ratio: 16/9` derives `width = 176 × 16/9 = 313px`. This computed intrinsic width exceeds the card's actual width (280px).

When `justify-self: normal` does not override the intrinsic sizing, the media element can be wider than the card. The parent card has `overflow: hidden`, so the right portion of the media (and the image inside it) is clipped. The card's white background (`#ffffff`) is then visible to the right of the visible image area — this appears as spacing on the right.

Similarly, the `<li>` grid item and the `.article-card` element relied on CSS Grid's default `justify-self: stretch` without an explicit `width: 100%`, leaving them dependent on the browser's intrinsic-sizing algorithm.

# Behavior details

## Old behavior

- `.archive-results .article-card-grid > li` had no explicit `min-width` constraint.
- `.archive-results .article-card` had no explicit `width` or `min-width`.
- `.archive-results .article-card__media` had no explicit `width`.
- At small mobile viewports (roughly < 313px), the `aspect-ratio: 16/9` combined with `min-height: 11rem` could cause the media element to exceed the card's width. The card's `overflow: hidden` then clipped the right portion of the image, showing the card's white background on the right — visible as spacing.

## New behavior

- `.archive-results .article-card-grid > li` has `min-width: 0`, preventing intrinsic-size expansion of list items.
- `.archive-results .article-card` has `width: 100%` and `min-width: 0`, explicitly pinning the card to the grid column and preventing intrinsic-size expansion.
- `.archive-results .article-card__media` has `width: 100%`, explicitly constraining the media container to the card's width regardless of the `aspect-ratio` + `min-height` computation.
- Images fill the full card width at all mobile viewport sizes.
- Desktop layout (≥ 48rem) is completely unchanged.

# Impact

- **Affected routes**: `/posts/`, `/posts/page/N/`, `/category/**/`, `/archive/` — any route that renders `.archive-results .article-card` at mobile width.
- **Unaffected routes**: single article pages, homepage, topic hubs, and any desktop/tablet viewport where the mobile media query does not activate.
- **SEO**: CSS-only change; no routing, URL, metadata, or canonical logic is affected.
- **Accessibility**: focus outlines and keyboard navigation are unchanged.

# Verification

1. Run `npm run build:prod`.
2. Open `/posts/` at 390px, 375px, and 320px mobile viewport widths.
3. Confirm each article card image spans the full viewport width with no visible right-side gap.
4. Resize to ≥ 768px (desktop) and confirm the two-column card grid is unchanged.
5. Test with browser DevTools mobile emulation at various device sizes.

# Related files

- `src/assets/styles/site.css` — mobile `@media (max-width: 47.99rem)` block, selectors:
  - `.archive-results .article-card-grid > li` (new rule)
  - `.archive-results .article-card` (added `width: 100%`, `min-width: 0`)
  - `.archive-results .article-card__media` (added `width: 100%`)
