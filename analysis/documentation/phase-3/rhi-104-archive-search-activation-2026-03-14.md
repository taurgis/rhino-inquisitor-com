# RHI-104 Archive Search Activation - 2026-03-14

## Change summary

The archive search shell now works as a real client-side search experience instead of a placeholder. Archive, taxonomy, and term pages now load a Hugo-generated `index.json`, apply scoped matching in the browser, and replace the archive results region with grouped matches when a user submits a query.

## Why this changed

Phase 3 introduced the archive search UI as part of the discovery-surface scaffold, but the shipped implementation only preserved the shell and explicitly told users that full search was still coming later. That created a broken user expectation because header, drawer, 404, and archive pages all exposed search entry points without any runtime search behavior behind them.

## Behavior details

### Previous behavior

- `src/layouts/partials/search/search-bar.html` rendered a `q` form and helper copy, but there was no search index output or client-side query handler.
- Submitting the form only reloaded the same archive surface with a `q` query parameter and an anchor jump.
- Archive search UI on list, taxonomy, and term pages behaved as a non-functional placeholder.

### New behavior

- `hugo.toml` now enables the built-in home `json` output while preserving `html` as the primary home output.
- `src/layouts/home.json.json` now emits a search index for indexable regular pages, including title, summary, permalink, topic metadata, reading time, and date information.
- `src/static/scripts/archive-search.js` now reads the `q` query parameter, fetches the search index once, applies scoped matching for the active surface, and renders grouped article cards into the existing archive results region.
- `src/layouts/partials/search/search-bar.html` now exposes search configuration via data attributes, replaces the placeholder helper copy with live runtime status text, and keeps the existing form URL behavior so query state is shareable.
- Taxonomy and term surfaces scope search to the current category; list pages scope search to the current content type.

## Impact

- Users can now search from the visible archive entry points instead of landing on a placeholder shell.
- Maintainers now have a Hugo-native search index artifact that can be extended later without introducing a new public search route.
- The change avoids new canonical or sitemap routes because search state remains query-parameter based on existing archive surfaces.

## Verification

1. Build a production artifact:

```bash
npm run build:prod
```

2. Run the existing quality gates affected by layout and asset changes:

```bash
npm run check:links
npm run check:a11y
npm run check:metadata
npm run check:sitemap
```

3. Open `/posts/`, `/category/`, and at least one `/category/<term>/` route in a local or preview server and verify:
   - a query updates the result set;
   - an empty query restores the default archive view;
   - a no-match query shows a clear recovery state;
   - a query-bearing URL reload reproduces the same search state.

## Related files

- `hugo.toml`
- `src/layouts/home.json.json`
- `src/layouts/_default/list.html`
- `src/layouts/_default/taxonomy.html`
- `src/layouts/_default/term.html`
- `src/layouts/partials/search/search-bar.html`
- `src/layouts/partials/archive/year-jump.html`
- `src/static/scripts/archive-search.js`
- `analysis/documentation/phase-3/rhi-104-discovery-surfaces-shared-ui-components-2026-03-09.md`