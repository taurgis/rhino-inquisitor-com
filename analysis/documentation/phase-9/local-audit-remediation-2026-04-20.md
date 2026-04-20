# Local Audit Remediation — 2026-04-20

## Change summary
Resolved the April 20 local audit defects across three article bodies and the `/category/` topics index. The update fixes malformed Markdown emphasis that caused merged words and unintended bold carryover, repairs the SLAS article paragraph break, and makes topic-hub cards fully clickable while restoring full-width desktop layout on the topics index.

## Why this changed
The audit found visible content defects in published article bodies and a broken desktop topics-index layout that reserved an empty rail while reducing category cards to a narrow column. Those defects degraded readability, reduced trust, and made category discovery feel broken.

## Behavior details

### Article body formatting
- Old: `/swc-and-storybook-error-failed-to-load-native-binding/` rendered `package-lock.jsonfile` and `node_modules,and` because bold markers were adjacent to words with no spaces.
- New: the sentence keeps the same wording, but spaces around the bold text now render correctly.

- Old: `/kickstart-guide-for-new-sfcc-developers/` had malformed emphasis around `Extend System Objects` and `Image Optimization with DIS`, which caused bold styling to bleed through whole sections and words to run together.
- New: only the intended labels and phrases render bold, and the surrounding prose renders normally.

- Old: `/how-to-set-up-slas-for-the-composable-storefront/` contained a run-together paragraph beginning `The link is not there If you do not see the link...`.
- New: that content is split into normal sentences and paragraphs with punctuation restored.

### Topics index layout and navigation
- Old: `/category/` used the shared archive desktop grid without a control rail, leaving topic content constrained to a narrow column and leaving the right side empty. Topic cards also only linked from the heading text, leaving most of each card as dead space.
- New: the topics-index branch declares its own archive-layout modifier so content spans the full desktop width, and each topic card is a single accessible anchor target with visible keyboard focus and the same hover treatment as before.

### Local host consistency
- Old: one audit session observed mixed `localhost:1313` and `localhost:64894` URLs on local pages.
- New: no repository change was required. A clean `npm run build:local` emitted only `http://localhost:1313/` across `/posts/`, `/category/`, sitemap output, and representative post pages. The mixed-port issue was treated as stale local-session drift rather than a source defect.

## Impact
- Readers of the three corrected articles now get clean text rendering.
- Topic discovery on `/category/` now uses the full available desktop width and supports whole-card mouse and keyboard activation.
- Maintainers should treat mixed localhost-port findings as reproduce-first issues; validate with a clean local build before changing shared SEO or baseURL logic.

## Verification
1. Load `/swc-and-storybook-error-failed-to-load-native-binding/` and confirm the solution paragraph renders `package-lock.json` and `node_modules` with normal spacing.
2. Load `/kickstart-guide-for-new-sfcc-developers/` and confirm the `Extend System Objects` and `Image Optimization with DIS` sections no longer show cascade bolding.
3. Load `/how-to-set-up-slas-for-the-composable-storefront/` and confirm the `The link is not there.` note renders as normal sentences across two paragraphs.
4. Load `/category/` at desktop width and confirm topic content spans the full archive surface with multiple cards per row.
5. Keyboard-focus a topic card on `/category/` and confirm visible focus styling plus full-card activation.
6. Run `npm run build:local` and confirm `public/` contains zero `localhost:64894` references.

## Related files
- `src/content/pages/swc-and-storybook-error-failed-to-load-native-binding/index.md`
- `src/content/posts/kickstart-guide-for-new-sfcc-developers/index.md`
- `src/content/posts/how-to-set-up-slas-for-the-composable-storefront/index.md`
- `src/layouts/_default/taxonomy.html`
- `src/layouts/partials/archive/topic-hubs.html`
- `src/assets/styles/site.css`
- `src/assets/styles/critical-archive.css`