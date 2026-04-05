# Native-First Document Prefetch - 2026-04-05

## Change summary

Refactored the earlier document-prefetch implementation to prefer native browser document speculation on post detail pages, while reducing the JavaScript fallback to a small post-page-only compatibility layer. The native rollout now also extends conservatively to archive surfaces for post destination links only.

This update widens that conservative native rollout in two bounded ways: the `Next` pagination edge on `/posts/` and `/pages/` archives, and archive-entry prefetch on `/pages/` list surfaces.

## Why this changed

The previous implementation used a global `rel=prefetch` script and attached speculative loading markers across shared navigation, archive pagination, breadcrumbs, cards, and homepage CTAs. Official browser guidance now prefers Speculation Rules for document navigations where supported, and the broad marker footprint created more speculative traffic than a conservative first rollout should allow.

## Behavior details

Old behavior:

- A global fallback script loaded on every page and managed document prefetch through DOM-injected `link rel="prefetch"` tags.
- Shared navigation, footer links, homepage article links, breadcrumbs, archive cards, pagination, and related content all participated in speculative loading.
- Article pages also used idle-time related-link prefetch.

New behavior:

- Post detail pages now emit a native `<script type="speculationrules">` block that prefetches only links explicitly marked as article-navigation candidates.
- Post detail pages now use `conservative` eagerness for their native article-navigation rule so document speculation stays opt-in by direct intent and does not rely on mobile viewport heuristics.
- Archive surfaces such as `/posts/`, paginated `/posts/page/N/`, and `/category/` routes now emit a separate native prefetch rule for explicit post destination links only.
- `/pages/` and `/pages/page/N/` routes now participate in the same native archive-entry prefetch pattern for page destination links.
- Paginated `/posts/` and `/pages/` routes now emit a separate native prefetch rule for the single rendered `Next` pagination edge only.
- Only high-confidence article journeys remain eligible: related article cards and the next-article CTA.
- On archive surfaces, only primary destination links and the `Next` pagination edge participate. Numbered pagination, `Previous`, filters, year jumps, breadcrumbs, footer links, shared navigation, topic hubs, and the standalone `/archive/` content page remain excluded.
- The JavaScript fallback now runs only on post pages and only when the browser does not support Speculation Rules.
- The fallback no longer performs idle prefetch and now mirrors the browser-native `moderate` hover timing more closely with a 200 ms dwell.
- Shared navigation, footer links, breadcrumbs, homepage links, archive cards, archive search results, and pagination no longer participate in document speculation.

## Impact

- Chromium-class browsers can use native document speculation for article-to-article navigation, which better aligns with current browser guidance.
- Chromium-class browsers can now also warm likely post destinations from archive screens without reopening speculation on archive controls or pagination.
- Chromium-class browsers can also warm likely reference-page destinations from `/pages/` archives and prefetch the single `Next` pagination edge on `/posts/` and `/pages/` lists.
- Non-supporting browsers keep a minimal same-origin fallback on the same article-navigation targets instead of losing the feature entirely.
- The overall speculative-request footprint is reduced because low-confidence utility and archive journeys are no longer warmed.
- Route-scoped YouTube `dns-prefetch` and `preconnect` hints remain unchanged because they are already the correct native primitive for that cross-origin dependency.

## Verification

- Run `npm run build:prod` and confirm the site builds cleanly.
- Run `npm run check:seo:artifact`, `npm run check:crawl-controls`, and `npm run check:internal-links` to confirm shared navigation and head output stay valid.
- Run `npm run check:perf:gate` to confirm the representative route set stays within budget after reducing the speculative footprint.
- In a Chromium browser, inspect the article page head and confirm a `speculationrules` script is present only on post detail pages.
- Inspect a built archive route such as `/posts/` or a category archive and confirm a `speculationrules` script is present there as well, but only post destination links carry the archive selector contract.
- Inspect built `/pages/` and `/pages/page/2/` artifacts and confirm they emit native archive speculation and the separate `Next` pagination rule.
- Confirm numbered pagination links and the `Previous` edge do not carry a speculation selector.
- In a non-supporting browser or forced fallback scenario, verify only related-article and next-article links can trigger `rel=prefetch`, and that shared navigation no longer does.

## Related files

- `src/layouts/partials/seo/speculation-rules.html`
- `src/layouts/partials/seo/head-meta.html`
- `src/layouts/_default/single.html`
- `src/static/scripts/smart-prefetch.js`
- `src/layouts/partials/article/related-content.html`
- `src/layouts/partials/article/footer-actions.html`
- `src/layouts/partials/site/header.html`
- `src/layouts/partials/site/footer.html`
- `src/layouts/partials/pagination.html`