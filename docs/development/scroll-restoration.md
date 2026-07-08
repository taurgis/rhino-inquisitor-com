# Scroll Position Restoration

## Change summary

Added a small client-side script that preserves the reader's scroll position in
two cases:

1. A backgrounded browser tab is discarded and later reloaded — most commonly
   after a reader opens an external link in a new tab (external links render with
   `target="_blank"`) and then returns to the article tab.
2. The reader follows an internal link and then presses the browser Back button.

## Old vs new behavior

- **Old:** External links open in a new tab. On memory-constrained devices
  (and increasingly on desktop) the original tab is discarded while backgrounded.
  Returning to it triggers a full reload. Because articles load deferred scripts
  and lazy media (`lite-youtube`, image zoom), the document height is unstable at
  load time, so the browser's automatic scroll restoration fails and the reader
  is dropped back to the top of the article.
  Separately, pressing Back after following an internal link could also lose the
  position: once we take manual control of scroll restoration, the browser no
  longer restores it, and a back-forward cache restore never fires the `load`
  event our first version listened on.
- **New:** `scroll-restore.js` sets `history.scrollRestoration = 'manual'`,
  persists the scroll offset to `sessionStorage` (keyed by pathname) whenever the
  page is hidden or unloaded, and re-applies it on `pageshow`. It restores when
  the `pageshow` event's `persisted` flag is set (a back-forward cache restore —
  the usual Back-button case) or, for non-bfcache loads, when the Navigation
  Timing type is `reload` or `back_forward`. This distinction matters: a bfcache
  restore reports its *original* Navigation Timing type (usually `navigate`), so
  gating on navigation type alone would skip exactly the Back-button case — the
  `persisted` flag is the reliable signal. The restore is retried across a few
  animation frames to survive late layout growth from deferred content.

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
  1. `node --check src/assets/scripts/scroll-restore.js` (syntax gate).
  2. Build and serve locally (`npm run dev`), open a long article, scroll down,
     click an external link to open a new tab, then discard the article tab
     (DevTools → Application → Frames → discard, or background it on mobile) and
     return — the article should reopen at the previous scroll position.
  3. From an article, follow an internal link, then press the browser Back
     button — the article should reopen at the previous scroll position.
  4. Confirm a first-time navigation to the same article still lands at the top,
     and that `/article/#anchor` links still jump to the anchor.

## Asset caching

The script lives in `src/assets/scripts/` (not `src/static/`) and is loaded
through Hugo Pipes with `fingerprint`, so its published URL contains a content
hash (e.g. `/scripts/scroll-restore.min.<hash>.js`). This matters because JS
assets are served with a one-year `Cache-Control: max-age=31536000`. A
stable, hash-less filename (the previous `static/` approach) meant a returning
visitor's browser kept serving the first cached copy for up to a year, so
subsequent fixes never reached them. Fingerprinting changes the URL whenever
the file changes, which busts the cache. The rest of the site's scripts still
live in `static/` and share this stale-cache limitation — worth migrating them
to fingerprinted assets when touched.

## Related files

- `src/assets/scripts/scroll-restore.js` — the restoration logic.
- `src/layouts/_default/baseof.html` — fingerprints and includes the script
  site-wide.
- `src/layouts/partials/article/render-link.html` — where external links gain
  `target="_blank" rel="noopener noreferrer"`.
