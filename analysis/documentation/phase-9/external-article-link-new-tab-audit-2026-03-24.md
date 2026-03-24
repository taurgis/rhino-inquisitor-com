# External Article Link New-Tab Audit (2026-03-24)

## Change summary

Article rendering now opens external site links in a new tab while leaving internal article links in the same tab. The change covers Markdown-authored article links across both posts and article-like pages, plus the article shortcodes that can emit external anchors.

## Why this changed

Internal links already behave correctly for same-site navigation, but outbound links in article content did not signal that the reader was leaving the site. The audit found that article Markdown links were centrally rendered through a Hugo link hook, and that `img-caption` plus `video-embed` were the only article shortcodes emitting anchors that could point to external sites. A follow-up verification pass also showed that article-like content under `/pages/` needed the same hook exposed from the standard top-level `_markup` lookup path, not only the `_default` path.

## Behavior details

### Old behavior

- Markdown links in article bodies rendered without `target="_blank"` or `rel="noopener noreferrer"`, even when they pointed to external sites.
- The `img-caption` shortcode wrapped linked images without distinguishing internal and external destinations.
- The `video-embed` shortcode rendered its optional YouTube watch link in the same tab.
- No raw HTML `<a>` tags were found under `src/content/posts/`, so the render-hook gap was the primary article-body issue.

### New behavior

- Markdown article links that still resolve to external `http` or `https` destinations after internal-host normalization now render with `target="_blank" rel="noopener noreferrer"` for both posts and article-like pages.
- Internal links, anchors, `mailto:`, `tel:`, bundle-relative resources, and same-site absolute URLs normalized to local paths continue to open in the same tab.
- `img-caption` now applies the same new-tab behavior only when its optional `link` parameter points to an external site.
- `video-embed` now renders its optional YouTube watch link with `target="_blank" rel="noopener noreferrer"`.
- The render-link logic now lives in a shared partial and is exposed from both `_default/_markup/render-link.html` and `_markup/render-link.html` so the behavior is consistent across Markdown article types.
- The `local-video` shortcode remains unchanged because its fallback anchor points to a local bundled video resource rather than an external site.

## Impact

- Readers now get consistent outbound-link behavior across article body Markdown links and shortcode-emitted external links.
- Maintainers can keep authoring Markdown and supported shortcodes without manually adding link attributes for external destinations.
- The audit scope for article-body anchors is now explicit: Markdown links, `img-caption`, and `video-embed` are covered centrally; raw HTML article anchors were not present at the time of the audit.

## Verification

1. Run `npm run build:prod` and confirm the production Hugo build exits successfully.
2. Confirm rendered article HTML contains external anchors with `target="_blank" rel="noopener noreferrer"`.
3. Confirm rendered internal article links do not include `target="_blank"`.
4. Confirm `src/content/posts/` still contains no raw HTML anchor tags that would bypass the audited rendering paths.

## Related files

- src/layouts/_default/_markup/render-link.html
- src/layouts/_markup/render-link.html
- src/layouts/partials/article/render-link.html
- src/layouts/shortcodes/img-caption.html
- src/layouts/shortcodes/video-embed.html
- analysis/documentation/README.md

## Assumptions and open questions

- No owner clarification was required because the request explicitly targeted links to external sites in articles, which excludes internal links and local-resource fallback anchors.