# Change summary

Article pages now switch to a full-width mobile route at the existing small-screen breakpoint so both the breadcrumb strip and article card reach the viewport edges instead of inheriting the shared page gutter.

# Why this changed

The shared `.surface-shell` wrapper applied a `calc(100% - 2rem)` width on every route, which left a visible outer gutter on mobile article pages even after the article-specific mobile padding rules were applied.

# Behavior details

Old behavior:
- On screens at or below `47.99rem`, article pages still inherited the shared `.surface-shell` outer gutter, so the article card sat inset from the viewport on both sides.
- The article card kept its desktop rounded corners and shadow at the mobile breakpoint, which reinforced the inset-card appearance.

New behavior:
- Single article routes now render with a `.page-article-route--single` wrapper plus the `.page-article--single` article modifier.
- On screens at or below `47.99rem`, the route wrapper expands by the same `2rem` that the shared shell removes and offsets it with `-1rem` inline margins so the breadcrumb strip and article surface both reach the viewport edges.
- The breadcrumb row gets mobile inline padding so its text still aligns with the article header content.
- The mobile article card removes its border radius and shadow so the article surface reads as full-width.
- Internal article padding remains unchanged, so copy, figures, TOC, and related sections still retain readable spacing inside the article surface.

# Impact

- Affected workflow: mobile QA for article and single-page routes rendered through `src/layouts/_default/single.html`.
- Unaffected workflows: archive, homepage, topic hubs, and other surfaces that still rely on the shared `.surface-shell` gutter at mobile widths.
- SEO behavior is unchanged because the update is CSS-only and does not affect routing, metadata, or canonical logic.

# Verification

1. Run `npm run build:prod`.
2. Open a mobile-width article page around `375px` and `390px` viewport widths.
3. Confirm the breadcrumb row and article surface both reach the viewport edges with no outer gutter.
4. Confirm breadcrumb text and article body content still align to the same internal reading gutter and no horizontal scroll appears.
5. Confirm non-article routes such as `/posts/` keep their existing mobile gutter.

# Related files

- `src/assets/styles/site.css`
- `src/layouts/_default/single.html`