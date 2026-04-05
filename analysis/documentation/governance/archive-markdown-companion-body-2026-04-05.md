# Archive Markdown Companion Body Alignment - 2026-04-05

## Change summary

Added source body content for the archive page and introduced an archive-specific Markdown template so the generated companion at `public/archive/index.md` always contains meaningful body text and passes the LLM artifact quality gate.

## Why this changed

The archive route used a content-backed page with a custom HTML layout. The HTML page rendered correctly, but the default Markdown companion template still produced an empty body for this route, which caused `npm run check:llm-artifacts` to fail.

## Behavior details

Old behavior:

- `public/archive/index.md` emitted front matter but no Markdown body content.
- `scripts/seo/check-llm-artifacts.js` failed on the archive companion with `empty Markdown body`.
- The archive route relied on the generic Markdown output template, which did not yield a usable body for this page.

New behavior:

- `src/content/pages/archive/index.md` now includes a concise body that explains the archive route and its interactive HTML features.
- `src/layouts/pages/archive/page.archive.markdown.md` now gives the archive route a dedicated Markdown output path at the route-specific Hugo lookup location.
- `public/archive/index.md` now emits non-empty Markdown body content from the cleaned source body when available, or a generated archive summary plus year coverage when it is not.
- The archive HTML layout continues to render from `src/layouts/pages/archive.html` without depending on the Markdown-specific fallback.

## Impact

- The LLM artifact validation gate now receives meaningful machine-readable content for the archive route.
- The archive Markdown companion has a route-specific fallback instead of depending entirely on generic page-body extraction.
- The archive HTML page behavior remains unchanged because the custom layout and the new Markdown template are separate output paths.

## Verification

- Run `npm run build:prod` to rebuild the production artifact.
- Run `npm run check:llm-artifacts` and confirm the archive companion no longer reports an empty body.
- Inspect `public/archive/index.md` and confirm it contains both front matter and the generated archive summary or source-derived body text.

## Related files

- `src/content/pages/archive/index.md`
- `src/layouts/pages/archive/page.archive.markdown.md`
- `src/layouts/_default/single.markdown.md`
- `src/layouts/pages/archive.html`
- `scripts/seo/check-llm-artifacts.js`