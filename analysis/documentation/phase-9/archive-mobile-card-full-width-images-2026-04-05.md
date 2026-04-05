# Change summary

Archive article cards on mobile now render with truly full-bleed (edge-to-edge) images by removing the card border and border-radius that previously created a framed-card appearance.

# Why this changed

On mobile viewports (≤ 47.99rem), archive article cards inherited a `1px solid` border and `border-radius: 1rem` from the base `.article-card` selector. Although the card itself spanned the full viewport width, the border shrank the visible image area by 2px (1px on each side) and the rounded corners clipped the top of the image with a 1rem curve — creating a "framed island" look instead of a full-width image treatment. The focus-within state also applied `transform: translateY(-1px)` which caused the card to shift and leave a gap at the top viewport edge.

# Behavior details

## Old behavior

- `.archive-results .article-card` on mobile kept the inherited `border: 1px solid var(--surface-border)` and overrode `border-radius` to `1rem`.
- Image container (`article-card__media`) started at x=1 and was 388px wide at a 390px viewport — 2px short of the viewport due to the card's side borders.
- Rounded corners at the top of the card clipped the hero image, creating a "contained card" visual rather than a full-bleed photograph.
- `focus-within` applied `transform: translateY(-1px)` which lifted the full-width card and exposed a 1px gap at the top edge.

## New behavior

- `.archive-results .article-card` on mobile now has `border: 0` and `border-radius: 0`.
- Image container is now exactly 390px wide at a 390px viewport — truly edge-to-edge.
- No clipped corners: the hero image reaches both the left and right viewport edges at the top of each card.
- Cards without a hero image (`article-card--no-media`) receive a `3px solid var(--accent-soft)` top border as a visual accent in place of the missing image.
- The `focus-within` state on mobile now suppresses the translateY transform and box-shadow to avoid edge gaps.
- The gap between cards (`0.75rem`) shows the page background colour (`#eef3f8`), acting as a natural visual separator between articles.
- Desktop layout (≥ 48rem) is completely unchanged.

# Impact

- **Affected routes**: `/posts/`, `/posts/page/N/`, `/category/**/`, `/archive/` — any route that renders `.archive-results .article-card` at mobile width.
- **Unaffected routes**: single article pages, homepage, topic hubs, and any desktop/tablet viewport where the mobile media query does not activate.
- **SEO**: CSS-only change; no routing, URL, metadata, or canonical logic is affected.
- **Accessibility**: `focus-within` still activates for keyboard navigation; the visible focus indicator (outline) is unchanged.

# Verification

1. Run `npm run build:prod`.
2. Open `/posts/` at 390px and 375px mobile viewport widths.
3. Confirm each article card image spans the full viewport width with no visible border or rounded top corners.
4. Confirm the gap between cards shows the page background colour.
5. Confirm cards without hero images display the blue-tinted top accent bar.
6. Resize to ≥ 768px (desktop) and confirm the two-column card grid with borders and rounded corners is unchanged.
7. Tab through the archive cards and confirm focus outlines are still visible.

# Related files

- `src/assets/styles/site.css` — mobile `@media (max-width: 47.99rem)` block, selectors `.archive-results .article-card`, `.archive-results .article-card:focus-within`, `.archive-results .article-card--no-media`, `.archive-results .article-card__media`
