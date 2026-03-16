# Render-Link Video Fallback Cleanup

## Change summary

This cleanup removes reliance on automatic Markdown link to video-player conversion by keeping the link render hook anchor-only and shifting migration behavior to explicit `local-video` shortcode authoring.

## Why this changed

The repository now treats inline local video playback as explicit authoring intent, not implicit render-hook behavior. Keeping fallback logic in generic link rendering increases hidden behavior risk and makes migration outputs harder to review.

## Behavior details

### Old behavior

1. Migration output could contain standalone Markdown links to local `.mp4` and `.mov` files and rely on render-hook fallback behavior for inline playback.
2. No dedicated validation command prevented new local video Markdown links from re-entering `src/content/**`.
3. Link render hook resource resolution used `.Page` context only.

### New behavior

1. `scripts/migration/bundle-posts.js` rewrites standalone localized local video links into explicit `{{< local-video ... >}}` shortcodes.
2. `scripts/migration/bundle-posts.js` reports `shortcodeConversionCount` at both per-file and summary levels for migration traceability.
3. `src/layouts/_default/_markup/render-link.html` remains anchor-only and now resolves relative bundle resources through `.PageInner | default .Page` for shortcode include compatibility without media-type conversion behavior.
4. `scripts/migration/check-local-video-shortcodes.js` enforces that local `.mp4/.mov` Markdown links are not present in content.
5. `package.json` exposes this validation as `npm run check:local-video-shortcodes`.

## Impact

1. Video playback in article bodies is now explicitly tied to `local-video` shortcode usage.
2. Generic Markdown links continue to render as links, reducing hidden template-side media behavior.
3. Migration reruns are less likely to regress into implicit video-link rendering patterns.
4. Maintainers gain a fast fail-safe command for shortcode-policy drift.

## Verification

Run the following commands:

```bash
node --check scripts/migration/bundle-posts.js
node --check scripts/migration/check-local-video-shortcodes.js
npm run check:local-video-shortcodes
hugo --minify --environment production
```

Expected results:

1. Both Node scripts pass syntax checks.
2. `npm run check:local-video-shortcodes` reports zero findings.
3. Production Hugo build completes without template or shortcode errors.

## Related files

1. `scripts/migration/bundle-posts.js`
2. `scripts/migration/check-local-video-shortcodes.js`
3. `package.json`
4. `src/layouts/_default/_markup/render-link.html`
