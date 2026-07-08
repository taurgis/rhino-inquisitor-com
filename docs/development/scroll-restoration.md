# Scroll Position Restoration

## Change summary

Added a small client-side script that preserves the reader's scroll position
when a backgrounded browser tab is discarded and later reloaded. This most
commonly happens after a reader opens an external link in a new tab (external
links render with `target="_blank"`) and then returns to the article tab.

## Old vs new behavior

- **Old:** External links open in a new tab. On memory-constrained devices
  (and increasingly on desktop) the original tab is discarded while backgrounded.
  Returning to it triggers a full reload. Because articles load deferred scripts
  and lazy media (`lite-youtube`, image zoom), the document height is unstable at
  load time, so the browser's automatic scroll restoration fails and the reader
  is dropped back to the top of the article.
- **New:** `scroll-restore.js` sets `history.scrollRestoration = 'manual'`,
  persists the scroll offset to `sessionStorage` (keyed by pathname) whenever the
  page is hidden or unloaded, and re-applies it on reload / back-forward
  navigations. The restore is retried across a few animation frames to survive
  late layout growth from deferred content.

Guards:
- Skips entirely when `sessionStorage` or `history.scrollRestoration` is
  unavailable (including Safari private mode, which throws on write).
- Does not override an explicit URL `#anchor` target.
- Only restores for `reload` and `back_forward` navigations, so a fresh
  navigation to a page still starts at the top.

## Impact and verification

- **Impacted components:** All pages, via `layouts/_default/baseof.html` (the
  script loads site-wide, deferred, before the per-template `scripts` block).
- **Verify:**
  1. `node --check src/static/scripts/scroll-restore.js` (syntax gate).
  2. Build and serve locally (`npm run dev`), open a long article, scroll down,
     click an external link to open a new tab, then discard the article tab
     (DevTools → Application → Frames → discard, or background it on mobile) and
     return — the article should reopen at the previous scroll position.
  3. Confirm a first-time navigation to the same article still lands at the top,
     and that `/article/#anchor` links still jump to the anchor.

## Related files

- `src/static/scripts/scroll-restore.js` — the restoration logic.
- `src/layouts/_default/baseof.html` — includes the script site-wide.
- `src/layouts/partials/article/render-link.html` — where external links gain
  `target="_blank" rel="noopener noreferrer"`.
