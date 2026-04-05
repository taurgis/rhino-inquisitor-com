# Navigation Prefetch And Resource Hints - 2026-04-05

## Change summary

Added conservative performance hints for navigation and video embeds: route-scoped YouTube connection warming, hover or focus-triggered same-origin document prefetch on selected internal links, and idle-time prefetch of the first related article targets on post pages.

## Why this changed

The site already prioritizes above-the-fold imagery well, but second-click navigation still depends entirely on cold HTML requests. This update improves likely next navigations without broad speculative fetching, and it keeps connection hints limited to cross-origin embeds that actually benefit from warming.

## Behavior details

Old behavior:

- Pages emitted no resource hints for video-related origins.
- Internal navigation always waited for a cold document request, even when the user had already hovered or focused a likely next destination.
- Post pages did not warm related-article destinations while the browser was idle.

New behavior:

- Pages that render a video hub or use the `video-embed` shortcode now emit `dns-prefetch` and `preconnect` hints for `youtube-nocookie.com` and `i.ytimg.com`.
- High-intent internal links in shared navigation, article cards, breadcrumbs, pagination, and article CTAs now trigger a same-origin document prefetch after a short hover dwell or on keyboard focus.
- Post pages opportunistically prefetch up to two related-article destinations after page load when the connection is not constrained.
- Automatic speculative fetching is suppressed on `noindex` pages, offline sessions, Save-Data sessions, and `2g` or `slow-2g` connections, with idle prefetch also skipped on `3g`.

## Impact

- Repeat navigation to likely next pages should feel faster on supported browsers because HTML documents can be warmed before the click.
- Video pages pay the connection setup cost for YouTube resources earlier, reducing first-play latency without adding global third-party hints to the whole site.
- Browsers without `rel=prefetch` or `requestIdleCallback` support still render and navigate normally because the feature degrades to a no-op.

## Verification

- Run `npm run build:prod` and confirm Hugo still renders all routes successfully.
- Run `npm run check:seo:artifact`, `npm run check:crawl-controls`, and `npm run check:internal-links` to confirm shared head and navigation behavior remain SEO-safe.
- Run `npm run check:perf:gate` or `npm run check:perf` to confirm the representative route set stays within the existing performance budget.
- In browser DevTools, verify that hovering or focusing annotated internal links adds at most one `prefetch` request per destination and that related-article prefetching does not start on constrained-network conditions.

## Related files

- `src/layouts/_default/baseof.html`
- `src/layouts/partials/seo/head-meta.html`
- `src/layouts/partials/seo/resource-hints.html`
- `src/static/scripts/smart-prefetch.js`
- `src/layouts/partials/site/header.html`
- `src/layouts/home.html`
- `src/layouts/partials/article/related-content.html`
- `src/layouts/partials/pagination.html`