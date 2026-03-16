# Local Video Shortcode Rollout

## Change summary

Local bundle `.mp4` and `.mov` playback in article bodies now uses an explicit `local-video` shortcode instead of implicit auto-conversion in the Markdown link render hook.

## Why this changed

The previous behavior rendered local video players from normal Markdown links whenever a link destination resolved to a page-bundle video resource. While this preserved playback, the authoring intent was hidden because content looked like ordinary links.

The new approach makes video authoring explicit and easier to review by requiring a dedicated shortcode call in article content.

## Behavior details

### Old behavior

1. `src/layouts/_default/_markup/render-link.html` detected bundle-local video resources during Markdown link rendering.
2. Standard Markdown links such as `[Demo](clip.mp4)` were rendered as `<video>` elements.
3. Video playback behavior was implicit and coupled to generic link rendering logic.

### New behavior

1. `src/layouts/shortcodes/local-video.html` provides explicit local video rendering.
2. The shortcode requires a bundle-relative `src` and validates that it resolves to a page resource of media type `video`.
3. `src/layouts/_default/_markup/render-link.html` is restored to standard link output (with existing resource URL resolution retained).
4. Existing article-local video references were migrated from Markdown links to shortcode calls.

Example authoring:

```md
{{< local-video src="Cookie-Support-Demo.mp4" title="Cookie support demo recording" >}}
```

## Impact

1. Authoring intent is explicit: maintainers can identify local inline videos directly from Markdown source.
2. Generic link rendering is simpler and no longer applies hidden media-specific behavior.
3. Existing local video playback is preserved for migrated article references through explicit shortcode conversion.
4. Shortcode validation now fails fast on missing/non-video resources, reducing silent rendering drift risk.

## Verification

Run the following checks:

```bash
hugo --minify --environment production
rg --pcre2 "\\[[^\\]]+\\]\\([^)]*\\.(mp4|mov)\\)" src/content
```

Expected outcomes:

1. Hugo build completes without shortcode resolution errors.
2. The `rg` query returns no matches in `src/content/**` for link-style local `.mp4/.mov` authoring.
3. Representative updated pages render `<video class="article-body-video">` via shortcode output.

## Related files

1. `src/layouts/shortcodes/local-video.html`
2. `src/layouts/_default/_markup/render-link.html`
3. `src/content/posts/what-is-new-in-the-23-8-commerce-cloud-release/index.md`
4. `src/content/posts/salesforce-b2c-commerce-cloud-23-2/index.md`
5. `src/content/posts/everything-new-in-sfcc-23-4/index.md`
6. `src/content/posts/new-apis-and-features-for-a-headless-sfcc/index.md`
7. `src/content/posts/b2c-commerce-cloud-campaign-erd/index.md`
8. `src/content/posts/it-sure-has-been-quiet-on-this-blog/index.md`
9. `src/content/posts/salesforce-payments-experience-explained/index.md`
10. `src/content/posts/navigating-dates-calendars-in-sfcc/index.md`
