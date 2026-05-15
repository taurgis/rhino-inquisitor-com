# Phase 9 Reusable Title Hooks - 2026-05-14

## Change summary

Extended the reusable low-specificity hook pattern from archive chips to repeated title surfaces.

This change introduces explicit title and title-link hooks for the homepage featured article title, the homepage latest-list title path, the taxonomy topic-hub lane header title, the taxonomy topic-card title path, the shared archive article-card title, and the client-rendered archive search card title path.

## Why this changed

Title styling for the homepage featured article, homepage latest-list titles, taxonomy topic-hub titles, taxonomy topic cards, and archive article cards still depended on wrapper-plus-element selectors or bare structural headings such as `.featured-article h3 a`, `.latest-list__item a`, bare `h2` lane-header titles, `.topic-card--link h3`, and `.archive-results .article-card h3`.

That made the title contract harder to reuse across homepage and archive surfaces, and it kept title ownership tied to specific element structures instead of the element being styled.

## Behavior details

Old behavior:

- The homepage featured article title relied on descendant selectors for title link styling.
- The homepage latest-list titles relied on a full-card anchor plus a local title span without the reusable title hook classes.
- The taxonomy topic-hub lane header title was still a bare `h2` with no explicit reusable title hook in markup.
- Taxonomy topic-card titles relied on `.topic-card h3` and `.topic-card--link h3` selectors instead of explicit title hooks.
- Shared archive article-card titles relied on element selectors and inherited link styling rather than explicit reusable hooks.
- The archive search JavaScript renderer emitted `<h3><a ...>` card titles without the new reusable title hook classes.

New behavior:

- The homepage featured article title now uses `.surface-title` and `.surface-title-link` with local featured-title classes layered on top.
- The homepage latest-list now keeps the existing full-card link but applies `.surface-title-link` to that link and `.surface-title` to the inner title span so the reusable hook vocabulary reaches that surface without changing the click target.
- The taxonomy topic-hub lane header title now uses `.surface-title lane-header__title` while keeping the title non-interactive and preserving the sibling lane action as the only link in that header row.
- Taxonomy topic cards now keep the existing whole-card link but apply `.surface-title-link` to the outer card anchor and `.surface-title` to the inner topic title so the same title-hook vocabulary reaches topic hubs without changing the single-link card structure.
- Shared article-card titles now use `.surface-title` and `.surface-title-link` in both Hugo-rendered markup and `archive-search.js` client-rendered results.
- Route-specific title scale remains local to each surface, while reusable title/link ownership now lives on explicit hook classes.
- `critical-home.css` and `critical-archive.css` mirror the new title-hook ownership so first paint stays aligned with the full stylesheet on the affected surfaces.

## Impact

- Affected users: readers on the homepage featured and latest-list sections, taxonomy topic-hub pages, and archive/search result surfaces.
- Affected maintainers: contributors working in homepage markup, taxonomy topic-hub markup, shared article-card markup, archive-search rendering, and the home/archive critical stylesheets.
- Affected workflow: repeated title styling should now prefer explicit title/title-link hooks over wrapper-plus-element selectors when the same UI contract appears in more than one rendered path.

## Verification

1. Run `npm run build:local`.
2. Confirm no file errors are reported for:

   - `src/layouts/home.html`
   - `src/layouts/partials/cards/article-card.html`
   - `src/static/scripts/archive-search.js`
   - `src/assets/styles/site.css`
   - `src/assets/styles/critical-home.css`
   - `src/assets/styles/critical-archive.css`

3. In a browser, confirm the homepage featured title includes `.featured-article__title` and `.surface-title-link` and that full CSS versus critical-only values stay aligned.
4. In a browser, confirm homepage latest-list items use `.latest-list__link.surface-title-link` and `.surface-title.latest-list__title`, and that only the title receives underline treatment on hover or keyboard focus.
5. In a browser, confirm the topic-hub lane header on `/category/` uses `.surface-title.lane-header__title`, keeps the heading as a non-interactive `h2`, and leaves the sibling lane action as the only link in that header row.
6. In a browser, confirm taxonomy topic cards on `/category/` use `.topic-card--link.surface-title-link` and `.surface-title.topic-card__title`, keep a single whole-card anchor, and underline only the title on hover or keyboard focus.
7. On `/posts/`, confirm server-rendered article cards include `.article-card__title` and `.surface-title-link.article-card__title-link`.
8. Trigger archive search results and confirm client-rendered article cards also include the new title hooks.

## Related files

- `src/layouts/home.html`
- `src/layouts/partials/archive/topic-hubs.html`
- `src/layouts/partials/cards/article-card.html`
- `src/static/scripts/archive-search.js`
- `src/assets/styles/site.css`
- `src/assets/styles/critical-home.css`
- `src/assets/styles/critical-archive.css`
- `analysis/documentation/README.md`