# RHI-089 img-caption Link Support Remediation

## Change summary

Added first-class `link` support to the `img-caption` shortcode and migrated the remaining wrapped `img-caption` usages in post content to the new parameter.

## Why this changed

Phase 8 HTML conformance failed because Markdown link syntax was wrapping shortcode output that renders a block-level `<figure>`. Hugo expanded the shortcode before Markdown rendering, which produced invalid structures such as `<p><a><figure>...</figure></a></p>`. The new shortcode parameter preserves clickable figures without relying on invalid Markdown wrappers.

## Behavior details

### Previous behavior

- Clickable figures were authored as `[{{< img-caption ... >}}](target)` in content.
- Hugo rendered those wrappers into invalid HTML when `img-caption` emitted a `<figure>` block.
- Self-links to the same image and external links both depended on the same invalid pattern.

### New behavior

- `src/layouts/shortcodes/img-caption.html` now accepts an optional `link` parameter.
- When `link` is present, the shortcode wraps only the rendered image in an anchor inside the `<figure>`.
- Existing bare `img-caption` usage continues to render unchanged.
- Migrated post content now uses `{{< img-caption ... link="..." >}}` instead of Markdown link wrappers.

## Impact

- Fixes the HTML conformance root cause for sampled routes and for the broader set of posts that used the wrapper pattern.
- Preserves image click-through behavior for both same-image links and external reference links.
- Changes authoring guidance for future content: do not wrap `img-caption` in Markdown link syntax.

## Verification

1. Run `npm run build:prod` and confirm the Hugo production build completes successfully.
2. Run `npm run check:html-conformance` and confirm the report passes with zero failing routes.
3. Search for remaining wrapped shortcode usage with `rg '^\[\{\{< img-caption' src/content` and confirm zero matches.
4. Spot-check representative routes with same-image links and external links to confirm the figure renders and the image remains clickable.

## Related files

- `src/layouts/shortcodes/img-caption.html`
- Converted wrapped shortcode usages across affected post files in `src/content/posts/`
- `validation/html-conformance-report.json`
