# Phase 9 Archive And Article Container Alignment - 2026-05-14

## Change summary

Updated the archive and article stylesheet slices to use route-shell container queries for responsive layout decisions while keeping the existing Hugo critical CSS split intact.

This change now also moves the shared archive and article shell logic into Hugo-managed fragment stylesheets that are concatenated into the full and route-critical bundles at build time.

The resulting build keeps archive rails, archive mobile controls, article reading-column breakpoints, and desktop TOC visibility aligned between first paint and fully loaded CSS without maintaining duplicate shell blocks by hand.

## Why this changed

The archive CSS had a real breakpoint mismatch: the archive critical bundle switched to a desktop rail layout at tablet widths while the full shared stylesheet intentionally kept archive pages in a single-column mobile-style layout until larger widths.

The article slice already behaved consistently, but its breakpoint logic was still viewport-coupled. Moving the archive and article layout handoff to route-shell container queries reduces coupling to viewport size and improves maintainability for these page families.

After the first alignment pass, the same shell logic still existed in multiple authored CSS entry files, and the archive critical stylesheet had a malformed inline shell insertion. Consolidating that logic into shared fragments removes the bad archive critical source block and makes the archive and article route families easier to change safely.

## Behavior details

Old behavior:

- Archive critical CSS could render the left rail too early on tablet-sized viewports, causing a first-paint mismatch before the full stylesheet loaded.
- Archive and article breakpoint logic depended mainly on viewport media queries rather than the route shell width.
- The desktop article TOC used `100vh`-based sizing.
- Archive shell logic for `/archive/` was not sourced from the same hook as the standard archive list routes because the page template uses a `page-article-route--archive` wrapper.
- The archive and article shell blocks were duplicated across `site.css` and the route-critical CSS files.

New behavior:

- Archive route shells now act as layout containers, and compact archive shells force a single-column `header -> controls -> content` flow with the mobile filter control visible and the desktop rail hidden.
- Article route shells now act as layout containers, and wider article shells enable the two-column reading layout and desktop TOC independently from the global viewport.
- The sticky desktop TOC now uses `100dvh` sizing instead of `100vh` sizing.
- The archive shell hook now covers both direct `archive-layout` children and the `/archive/` wrapper variant that nests `archive-layout` inside `page-article-route--archive`.
- Shared `archive-structure.css` and `article-structure.css` fragments are concatenated into `site.css`, `critical-archive.css`, and `critical-post.css` by `src/layouts/partials/site/stylesheet.html` so first paint and settled paint use the same shell logic from one source per route family.

## Impact

- Affected users: readers on archive and article routes, especially at tablet and compact desktop widths.
- Affected maintainers: contributors working in `src/assets/styles/site.css`, `src/assets/styles/fragments/archive-structure.css`, `src/assets/styles/fragments/article-structure.css`, `src/assets/styles/critical-archive.css`, `src/assets/styles/critical-post.css`, and `src/layouts/partials/site/stylesheet.html`.
- Affected workflow: responsive layout changes for archive and article route families now need to update the shared fragment source and let Hugo compose those fragments into the route bundles.

## Verification

1. Run the Hugo asset pipeline with `npm run build:local`.
2. Confirm no CSS or Hugo resource concat errors are reported for:

   - `src/assets/styles/site.css`
   - `src/assets/styles/fragments/archive-structure.css`
   - `src/assets/styles/fragments/article-structure.css`
   - `src/assets/styles/critical-archive.css`
   - `src/assets/styles/critical-post.css`
   - `src/layouts/partials/site/stylesheet.html`

3. In a browser, verify `/archive/` now reports the archive route shell behavior through the wrapper variant and keeps first-paint and settled archive states aligned.
4. In a browser, verify `/posts/` switches between compact archive layout at narrow widths and the desktop rail/content split at wider widths under both full CSS and critical-only reloads.
5. On article routes, verify compact shells keep the mobile TOC visible and the desktop TOC hidden, while wider shells restore the reading-column split and sticky desktop TOC under both full CSS and critical-only reloads.
6. Confirm the desktop TOC still scrolls within its rail and respects the updated `100dvh` max-height sizing.

## Related files

- `src/assets/styles/site.css`
- `src/assets/styles/fragments/archive-structure.css`
- `src/assets/styles/fragments/article-structure.css`
- `src/assets/styles/critical-archive.css`
- `src/assets/styles/critical-post.css`
- `src/layouts/partials/site/stylesheet.html`
- `analysis/documentation/README.md`
