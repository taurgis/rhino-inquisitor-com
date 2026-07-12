# Responsive article tables

## Change summary

Markdown tables in post/page bodies (`.article-body table`) now degrade to a
stacked "label: value" bullet layout below the `39.99rem` breakpoint, instead
of relying on horizontal scrolling alone on small screens. This is a generic,
site-wide change: it comes from a Hugo table render hook, so every markdown
table gets it automatically — no per-post markup is required.

Alongside this, a separate desktop fix wraps tables in a `.table-scroll`
container (`overflow-x: auto`) so wide tables scroll within their own box
instead of the table element itself owning the scroll/shadow/border-radius
styling.

## Old vs new behaviour

| Area | Old | New |
|------|-----|-----|
| Table markup | Default Goldmark table rendering, no render hook | `src/layouts/_default/_markup/render-table.html` → `partials/article/render-table.html`: wraps in `<div class="table-scroll" tabindex="0">`, adds `<th scope="col">` and a `data-label` attribute (copied from the column header text via `plainify`) on every `<td>` |
| Small-screen layout (< 39.99rem) | Table stayed a grid; long cell text squeezed columns or forced horizontal scroll | `table`/`tbody`/`tr` become `display: block`; each row renders as a bold row heading (first cell) followed by a bulleted `Label: value` list (remaining cells, labelled via `content: attr(data-label)`) |
| `<thead>` on small screens | Visible, cramped into the stacked layout | Visually hidden (clip-based, not `display: none`) — kept in the DOM so the `scope="col"` header association is still available to assistive tech |
| Keyboard access to a scrolling table | Table wasn't focusable, so keyboard users couldn't scroll a wide table | `.table-scroll` wrapper has `tabindex="0"` |

## Why a render hook rather than a CSS-only trick

The classic "blockify + `attr(data-label)`" responsive-table pattern (Adrian
Roselli, *A Responsive Accessible Table*, https://adrianroselli.com/2017/11/a-responsive-accessible-table.html)
needs a `data-label` attribute on every cell, which Goldmark's default table
renderer doesn't emit. A render hook (https://gohugo.io/render-hooks/tables/)
is the only way to add it for every table in the content tree without editing
each post by hand.

## Accessibility notes

- Applying `display: block` to `<table>`/`<tr>`/`<td>` used to strip a
  table's accessible semantics in some browsers. That bug is fixed in Chrome,
  Firefox, and Safari 17+ (2023) — see the browser-compat table in Adrian
  Roselli's follow-up (https://adrianroselli.com/2022/07/its-mid-2022-and-browsers-mostly-safari-still-break-accessibility-via-display-properties.html)
  and Zell Liew's 2024 retest (https://zellwk.com/blog/data-table-accessibility-2024/).
  No extra ARIA roles or JS are added to compensate — they're unnecessary for
  a simple table with no `colspan`/`rowspan`/`scope="rowgroup"`.
- The visible bullet label (`::before { content: attr(data-label) }`) and the
  still-present `<th scope="col">` are two independent, non-duplicating paths
  to the same information: sighted mobile users read the generated label;
  assistive tech gets the header/cell association from the native table
  structure regardless of the visual layout.
- Inline per-cell alignment (`style="text-align: …"` from Markdown's
  `:---:`/`---:` column syntax) is forced back to left with `!important` in
  the stacked layout, since right/center alignment has no meaning once cells
  no longer share a column.

## Related files

- `src/layouts/_default/_markup/render-table.html` — Hugo render hook entry point
- `src/layouts/partials/article/render-table.html` — actual table markup (wrapper, `scope`, `data-label`)
- `src/assets/styles/site.css` — `/* ── Article tables ── */` section: desktop `.table-scroll`/`table` styles plus the `@media (max-width: 39.99rem)` stacked-bullet block directly below it

## Verification

1. `hugo --minify --environment production` — build succeeds, zero errors.
2. Inspect built HTML for a post with a table (e.g. `public/tokens-arent-free-picking-models-and-keeping-agents-grounded/index.html`) and confirm `data-label`, `scope=col`, and the `table-scroll` wrapper are present.
3. Visual check at a mobile width (≤ 390px) and a desktop width (≥ 900px) against the compiled `site.min.*.css` — desktop shows the normal scrollable grid table, mobile shows bold row headings with bulleted `Label: value` lists and no horizontal scrollbar.
