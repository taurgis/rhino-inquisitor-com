# Change summary

Archive pagination now uses a compact page window on list routes so desktop pagination stays on a single line even when the archive spans many pages.

# Why this changed

The previous pagination rendered every page number for the paginator. On longer archives, the desktop control wrapped onto multiple lines, which made the navigation row feel unstable and visually noisy.

# Behavior details

Old behavior:
- Archive pagination rendered links for every available page number.
- On longer archives such as the blog posts index, the pagination row could wrap to a second line on desktop.
- First and last page access existed, but the control became harder to scan as page counts grew.

New behavior:
- Archive pagination now shows a bounded window of page links around the current page.
- The control always keeps access to previous and next pages, the first page, the last page, and the current page context.
- Ellipsis markers indicate skipped ranges when the archive has more than seven pages.
- Desktop layout keeps the status label and pagination controls on one line, while smaller viewports can still wrap gracefully.

# Impact

- Affected workflow: archive and taxonomy browsing through the shared pagination partial.
- Affected components: the Hugo pagination partial and the shared archive pagination styling.
- SEO behavior is unchanged because route generation, canonical output, and metadata rules remain the same.

# Verification

1. Run `npm run build:prod`.
2. Open a long archive route such as `/posts/page/2/` at a desktop viewport and confirm the pagination remains on one line.
3. Confirm previous, next, first, last, and current-neighbor page navigation all render as expected.
4. Confirm shorter paginators still show every page number.
5. Run `npm run check:seo:artifact` to verify the production artifact remains valid after the template change.

# Related files

- `src/layouts/partials/pagination.html`
- `src/assets/styles/site.css`