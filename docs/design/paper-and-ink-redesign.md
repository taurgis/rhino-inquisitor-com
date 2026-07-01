# Paper & Ink redesign

## Change summary

Adopts the "Paper & Ink" visual system (mockups in `tmp/redesign/*.dc.html`) across
the site: a warm cream palette, three self-hosted typefaces, monospace meta/labels,
pill controls, a navy mobile flyout, terminal-style code blocks, and an accent-marked
table of contents. This is a **visual migration** — no content, routing, front matter,
`permalinks`, `taxonomies`, or `baseURL` changed, so SEO/URL parity is unaffected.

## Old vs new behaviour

| Area | Old | New |
|------|-----|-----|
| Palette | Cool blue/white (`#eef3f8` / `#0a5fc8`) with a light/dark toggle | Warm paper: Base `#F6F2EA`, Panel `#FBF8F1`, Ink `#211D18`, Accent blue `#1E6FBE`, Navy `#123A5E`. **Light-only.** |
| Fonts | System stacks (Iowan Old Style / Avenir Next) | Self-hosted **Newsreader** (display), **Public Sans** (body/UI), **JetBrains Mono** (labels/meta/code) — woff2, no CDN |
| Dark mode | `data-theme` toggle button + persistence JS + `[data-theme="dark"]` tokens | Removed (toggle, inline `<head>` script, and header toggle script deleted) |
| Meta/labels | Sans, mixed | JetBrains Mono, uppercase eyebrows in accent blue |
| Code blocks | Flat dark panel | Slate `#122234` panel with a terminal chrome bar (traffic-light dots), rounded top |
| Mobile nav | Light slide-in drawer | Full navy flyout, knockout logo, large Newsreader links, accent CTA |
| TOC | Bulleted list, bold active | Bullet-free, left-border markers, blue active marker (scroll-spy) + top reading-progress bar |
| Filter chips | Blue-tint pills | Navy-fill active / outline inactive pills |

## Token architecture

`site.css` `:root` defines raw Paper & Ink tokens (`--canvas/--base/--panel/--rule/
--ink/--blue/--navy/--code-bg/--serif/--sans/--mono/--r-*`) and re-points the existing
semantic names templates already consume (`--page-bg`, `--surface-bg`, `--accent`,
`--chrome-*`, `--radius-*`, `--font-display/body`). Surface hierarchy: page = Base,
elevated cards = Panel, chrome = Base + hairlines. The three `critical-*.css` files
carry concrete copies of the tokens for first-paint (no palette flash).

## Self-hosted fonts

woff2 files live in `src/static/fonts/` (served from `/fonts/…`, stable paths).
`src/assets/styles/fragments/fonts.css` holds the `@font-face` rules (`font-display:swap`),
concatenated first into the bundle and inlined into each critical file; the two
above-the-fold faces are `<link rel=preload>`ed in `site/stylesheet.html`.

## Intentional adaptations (features not in the mockups, styled in the same language)

- Home keeps the **Active Projects** box, profile links, and a **Latest Posts** list
  beside the featured lane (mockups showed a 3-up card grid).
- Home **Featured** is a stacked card (mockups showed a 50/50 image split).
- Archive was rebuilt to the mockup: **single column, horizontal filter chips, and
  year-grouped rows** (date · category eyebrow · title · reading time). The
  jump-to-year and sort controls are retained (not in the mockup) and styled to match.
- Header keeps the **search** control (not present in the mockups).

## Impacted files

- New: `src/static/fonts/*.woff2`, `src/assets/styles/fragments/fonts.css`,
  `docs/design/paper-and-ink-redesign.md`
- CSS: `src/assets/styles/site.css`, `critical-home.css`, `critical-post.css`,
  `critical-archive.css`, `fragments/article-structure.css`, `fragments/archive-structure.css`
- Templates: `_default/baseof.html` (removed theme script), `partials/site/{header,footer,stylesheet}.html`,
  `critical-home.css` hero, chip/search/card styling.

## Verification

1. `hugo --minify --environment production` → zero errors.
2. Confirm **no request to fonts.googleapis.com / gstatic.com** (DevTools Network);
   fonts load from `/fonts/…`.
3. Visual check at 1280px and 390px against `tmp/redesign/*.dc.html`: home, an article
   (TOC active marker, terminal code block, callout), archive, mobile navy flyout.
4. Confirm the theme-toggle button is gone and there are no `data-theme` console errors.
5. Existing `pa11y`/Lighthouse gates (see `.pa11yci.json`, `lighthouserc.json`).

## Known dead code (safe, inert)

`.theme-toggle*` rules and a few `[data-theme="dark"]` selectors remain in the CSS but
never match (no `data-theme` attribute is ever set). They can be pruned later.
