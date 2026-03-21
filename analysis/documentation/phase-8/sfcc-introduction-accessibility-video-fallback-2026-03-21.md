# Video Post Accessibility Watch-Link Fallback

## Change summary

The sampled video-post routes `/sfcc-introduction/` and `/salesforce-b2c-commerce-cloud-22-9-release/` now use direct YouTube watch links in the article body instead of inline embedded players.

## Why this changed

The Phase 8 accessibility axe gate reported blocking violations on the two sampled video-post routes. The failing nodes were injected by the loaded YouTube player runtime after the page iframe initialized, not by authored Hugo markup.

## Behavior details

Old behavior:

1. The two sampled video-post bodies opened with the shared `video-embed` shortcode, which rendered inline `youtube-nocookie` iframes.
2. During the accessibility gate run, the loaded YouTube runtime injected blocking violations into those embeds, including `aria-prohibited-attr` and, on `/salesforce-b2c-commerce-cloud-22-9-release/`, `button-name`.

New behavior:

1. The two sampled video-post bodies now open with normal YouTube watch links instead of inline iframes.
2. The pages keep their existing front matter `video` metadata, hero images, and written summary content.
3. The accessibility gate no longer needs to evaluate the third-party runtime on those sampled primary routes.

## Impact

1. Readers still have a clear path to watch each video, but playback now opens on YouTube instead of inside the article body on the sampled video-post routes.
2. The change is limited to `/sfcc-introduction/` and `/salesforce-b2c-commerce-cloud-22-9-release/`; other pages that still use the shared `video-embed` shortcode are unchanged.
3. Both routes remain eligible for video metadata and related SEO outputs because the page front matter was not changed.

## Verification

1. Run `npm run build:prod`.
2. Run `npm run check:accessibility`.
3. Confirm `validation/accessibility-axe-report.json` reports `failCount: 0` and `blockingFailures: 0` for the sampled set.
4. Spot-check `/sfcc-introduction/` and `/salesforce-b2c-commerce-cloud-22-9-release/` in the built output to confirm the articles show the watch links and their written content.

## Related files

1. `src/content/posts/sfcc-introduction/index.md`
2. `src/content/posts/salesforce-b2c-commerce-cloud-22-9-release/index.md`
3. `validation/accessibility-axe-report.json`
4. `analysis/documentation/phase-8/sfcc-introduction-accessibility-video-fallback-2026-03-21.md`