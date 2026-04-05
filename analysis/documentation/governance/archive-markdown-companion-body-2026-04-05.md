# Archive Markdown Companion Body Alignment - 2026-04-05

## Change summary

Updated the LLM artifact generator so archive-style pages emit meaningful Markdown body content even when they do not render a standard `section.article-body` region.

## Why this changed

The archive route uses a custom HTML layout with archive headers, filters, search controls, and grouped yearly results instead of a standard article-body section. The LLM artifact generator only extracted `section.article-body`, which left `public/archive/index.md` empty and caused `npm run check:llm-artifacts` to fail.

## Behavior details

Old behavior:

- `public/archive/index.md` emitted front matter but no Markdown body content.
- `scripts/seo/check-llm-artifacts.js` failed on the archive companion with `empty Markdown body`.
- `scripts/seo/generate-llm-artifacts.js` only extracted `section.article-body`, so archive-layout pages had no usable body source.

New behavior:

- `scripts/seo/generate-llm-artifacts.js` now falls back to archive-layout extraction when a page does not expose `section.article-body`.
- `public/archive/index.md` now emits a concise archive summary, result count, and year coverage derived from the rendered archive HTML.
- The archive HTML layout continues to render from `src/layouts/pages/archive.html` with no change to the visitor-facing page.

## Impact

- The LLM artifact validation gate now receives meaningful machine-readable content for the archive route.
- Archive-style pages no longer depend entirely on the article-body selector during Markdown companion generation.
- The archive HTML page behavior remains unchanged because the fix only adjusts the post-build Markdown artifact rewrite.

## Verification

- Run `npm run build:prod` to rebuild the production artifact.
- Run `npm run check:llm-artifacts` and confirm the archive companion no longer reports an empty body.
- Inspect `public/archive/index.md` and confirm it contains both front matter and the generated archive summary, result count, and year coverage.

## Related files

- `src/layouts/pages/archive.html`
- `scripts/seo/generate-llm-artifacts.js`
- `scripts/seo/check-llm-artifacts.js`