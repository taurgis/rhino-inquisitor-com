# Deferred Video Embed Accessibility Remediation

## Change summary

The shared `video-embed` shortcode now renders a deferred `lite-youtube` watch surface instead of an eager YouTube iframe, which keeps inline video playback available while preventing the third-party player runtime from loading during initial gate evaluation.

## Why this changed

The Phase 8 accessibility axe gate reported blocking violations on the two sampled video-post routes. The failing nodes were injected by the loaded YouTube player runtime after the page iframe initialized, not by authored Hugo markup. A route-local watch-link fallback cleared accessibility, but it broke the image/video SEO and structured-data contracts because the sampled `video-post` routes still needed qualifying on-page video surfaces plus `VideoObject` schema.

## Behavior details

Old behavior:

1. Inline video pages using the shared `video-embed` shortcode rendered eager `youtube-nocookie` iframes on initial page load.
2. During the accessibility gate run, the loaded YouTube runtime injected blocking violations into sampled `video-post` embeds, including `aria-prohibited-attr` and `button-name`.

New behavior:

1. The shared shortcode now renders a poster-based `lite-youtube` element with an accessible play button and a fallback watch link.
2. The YouTube iframe is created only after explicit user activation, so the third-party player runtime is absent during initial accessibility and SEO gate scans.
3. Pages that already relied on the shortcode keep their inline watch surface and remain eligible for `VideoObject` schema.

## Impact

1. Readers still get inline video playback on shortcode-backed routes, but playback starts after a deliberate click instead of during initial page load.
2. The change applies to every page that uses the shared `video-embed` shortcode, including the sampled `video-post` routes `/sfcc-introduction/` and `/salesforce-b2c-commerce-cloud-22-9-release/`.
3. The Phase 8 accessibility, image/video SEO, and structured-data gates now share the same contract: a qualifying on-page video surface exists, but third-party player DOM is deferred until activation.

## Verification

1. Run `npm run build:prod`.
2. Run `npm run check:accessibility`.
3. Run `npm run check:images`.
4. Run `npm run check:structured-data`.
5. Confirm the sampled video-post routes render the deferred player shell with a play button before activation and still expose the fallback YouTube link.

## Related files

1. `src/layouts/shortcodes/video-embed.html`
2. `src/layouts/_default/single.html`
3. `src/static/scripts/lite-youtube.js`
4. `src/assets/styles/site.css`
5. `src/content/posts/sfcc-introduction/index.md`
6. `src/content/posts/salesforce-b2c-commerce-cloud-22-9-release/index.md`
7. `analysis/documentation/phase-8/sfcc-introduction-accessibility-video-fallback-2026-03-21.md`