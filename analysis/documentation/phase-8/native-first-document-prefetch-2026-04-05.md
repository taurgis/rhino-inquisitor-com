# Native-First Document Prefetch - 2026-04-05

## Change summary

Refactored the earlier document-prefetch implementation to prefer native browser document speculation on post detail pages, while reducing the JavaScript fallback to a small post-page-only compatibility layer.

## Why this changed

The previous implementation used a global `rel=prefetch` script and attached speculative loading markers across shared navigation, archive pagination, breadcrumbs, cards, and homepage CTAs. Official browser guidance now prefers Speculation Rules for document navigations where supported, and the broad marker footprint created more speculative traffic than a conservative first rollout should allow.

## Behavior details

Old behavior:

- A global fallback script loaded on every page and managed document prefetch through DOM-injected `link rel="prefetch"` tags.
- Shared navigation, footer links, homepage article links, breadcrumbs, archive cards, pagination, and related content all participated in speculative loading.
- Article pages also used idle-time related-link prefetch.

New behavior:

- Post detail pages now emit a native `<script type="speculationrules">` block that prefetches only links explicitly marked as article-navigation candidates.
- Only high-confidence article journeys remain eligible: related article cards and the next-article CTA.
- The JavaScript fallback now runs only on post pages and only when the browser does not support Speculation Rules.
- The fallback no longer performs idle prefetch and now mirrors the browser-native `moderate` hover timing more closely with a 200 ms dwell.
- Shared navigation, footer links, breadcrumbs, homepage links, archive cards, archive search results, and pagination no longer participate in document speculation.

## Impact

- Chromium-class browsers can use native document speculation for article-to-article navigation, which better aligns with current browser guidance.
- Non-supporting browsers keep a minimal same-origin fallback on the same article-navigation targets instead of losing the feature entirely.
- The overall speculative-request footprint is reduced because low-confidence utility and archive journeys are no longer warmed.
- Route-scoped YouTube `dns-prefetch` and `preconnect` hints remain unchanged because they are already the correct native primitive for that cross-origin dependency.

## Verification

- Run `npm run build:prod` and confirm the site builds cleanly.
- Run `npm run check:seo:artifact`, `npm run check:crawl-controls`, and `npm run check:internal-links` to confirm shared navigation and head output stay valid.
- Run `npm run check:perf:gate` to confirm the representative route set stays within budget after reducing the speculative footprint.
- In a Chromium browser, inspect the article page head and confirm a `speculationrules` script is present only on post detail pages.
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