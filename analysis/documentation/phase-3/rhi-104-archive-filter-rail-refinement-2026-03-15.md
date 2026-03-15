# RHI-104 Archive Filter Rail Refinement - 2026-03-15

## Change summary

The archive filter rail now uses a wider desktop column, clearer group containers, and more resilient chip sizing so long labels stay inside their controls. The shared Year filter data also now reflects the full archive surface instead of only the currently paginated page, topic term pages now show the current topic with an active filter state, and the taxonomy root archive header keeps its title and description centered on desktop.

## Why this changed

The Phase 3 archive scaffold shipped with a compact filter rail that worked functionally but felt crowded on desktop, especially in the Topics group where many category links were packed into a narrow surface. It also generated Year links from only the current paginated slice on list archives, which meant the filter could hide valid years and send inconsistent navigation signals.

## Behavior details

### Previous behavior

- The desktop filter rail used a narrower column and relied on a single shared chip treatment for all filter links.
- Filter groups sat directly inside the rail with limited separation, so Topics, Type, Year, and Sort read as one dense block.
- Some longer filter labels could push against or beyond their chip boundaries.
- List archive Year links were derived from the current paginated page only, so later years disappeared from the filter until the user paged deeper into the archive.
- Topic term pages rendered the current topic link identically to every other topic, so the rail did not help users orient themselves within the active topic archive.
- The taxonomy root archive header on `/category/` let its wider title and description read left-heavy on desktop, which weakened the centered hero treatment used on the other archive surfaces.

### New behavior

- The desktop archive layout now gives the filter rail more horizontal room.
- The rail now presents each filter group as a distinct surfaced container with added padding and spacing.
- Topic and year links now support safer wrapping for longer labels instead of overflowing their controls.
- On larger desktops the Topics group switches to a two-column grid with a full-width `All topics` reset action.
- Shared year-link generation for paginated archive lists now inspects every pager and maps each year to the first page where that year cluster appears, so the filter and jump navigation expose the full year set consistently.
- Topic filter links now mark the current archive topic with an active state via `aria-current="page"` and a stronger visual treatment.
- The taxonomy root archive header now uses a route-specific centered text measure so the Categories title and supporting copy stay visually centered on desktop.
- Mobile filter disclosure behavior remains unchanged.

## Impact

- Desktop readers can scan the `/posts/` filters faster and distinguish group boundaries more easily.
- Long topic labels no longer rely on a narrow fixed chip width to remain readable.
- Paginated list archives now expose a complete, deterministic Year filter instead of a page-local subset.
- Shared archive surfaces that reuse the filter partial inherit the same desktop refinement, and the category index now points year links at valid paginated blog archive targets.
- Topic term pages now communicate the active archive context directly inside the shared filter rail on both desktop and mobile renderings.
- The `/category/` landing page now keeps its heading block visually centered without changing term-page header behavior.

## Verification

1. Build a production artifact:

```bash
npm run build:prod
```

2. Open `/posts/` in a local or preview build and verify on desktop widths that:
   - the left rail has visibly more breathing room;
   - Topics, Type, Year, and Sort read as distinct groups;
   - long filter labels stay inside their chips;
   - the Year filter shows the full set of archive years on page 1 and later paginated pages;
   - on a topic term page, the current topic is visibly marked as the active filter;
   - on `/category/`, the title and description remain visually centered on desktop;
   - mobile filter disclosure still behaves the same below the desktop breakpoint.

3. Smoke-check another archive surface that shares the filter partial, such as `/category/`, to confirm the desktop refinement applies cleanly there and Year links resolve to valid blog archive pages.

## Related files

- `src/layouts/partials/archive/filter-groups.html`
- `src/layouts/partials/archive/year-jump.html`
- `src/layouts/partials/archive/year-links.html`
- `src/layouts/_default/list.html`
- `src/layouts/_default/term.html`
- `src/layouts/_default/taxonomy.html`
- `src/assets/styles/site.css`
- `analysis/documentation/phase-3/rhi-104-discovery-surfaces-shared-ui-components-2026-03-09.md`