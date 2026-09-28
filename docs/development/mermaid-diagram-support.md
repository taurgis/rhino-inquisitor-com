# Mermaid Diagram Support

## Change summary

Added site-wide support for rendering [Mermaid](https://mermaid.js.org/) diagrams
from a plain ` ```mermaid ` fenced code block in post Markdown, themed to match
the site's warm "Paper & Ink" palette. First used in the
`tokens-arent-free-picking-models-and-keeping-agents-grounded` post to visualize
a prompt-cache hit/miss sequence in an agentic tool-calling loop.

## Old vs new behavior

- **Old:** No Mermaid support existed. A ` ```mermaid ` fence would render as a
  plain syntax-highlighted code block (via Hugo's default Chroma highlighting),
  showing the diagram source as text instead of a diagram.
- **New:** A markdown render hook intercepts fenced code blocks whose language is
  `mermaid`, marks the page (via `.Page.Scratch.Set "hasMermaid" true`) so the
  template knows to load Mermaid, and outputs the block as
  `<div class="mermaid-wrap"><div class="mermaid-wrap__scroll"><div class="mermaid">...</div></div></div>`
  instead of a Chroma-highlighted `<pre>`. Client-side, `mermaid.min.js`
  (vendored, pinned to `11.16.0`) renders every `.mermaid` element into inline
  SVG once the DOM is ready, and
  `mermaid-init.js` configures Mermaid's `theme: 'base'` with `themeVariables`
  read live from the site's CSS custom properties (`--panel`, `--navy`,
  `--callout`, etc.), so a diagram's colors track the site's palette
  automatically instead of duplicating hex values in JS.

Only pages containing at least one mermaid fence load the library — the
`hasMermaid` Scratch flag gates both `<script>` tags in
`layouts/_default/single.html`, following the same conditional-script pattern
already used for `hasLiteYoutube`.

## Impact and verification

- **Impacted components:** All post/page templates that extend
  `_default/single.html`; any future content file using a ` ```mermaid ` fence.
- **Page weight:** `mermaid.min.js` is a vendored third-party bundle and is
  **not small** — 3.5MB unminified-equivalent size (~950KB gzipped over the
  wire). It only loads on pages that actually contain a diagram, deferred, so
  it does not affect any other page's weight or block rendering — but it is a
  meaningfully heavy asset for whichever post opts in. Weigh that before adding
  a diagram to a post that doesn't clearly benefit from one.
- **Verify:**
  1. `hugo --minify --environment production` — zero build errors, and confirm
     the two mermaid `<script>` tags only appear on pages that use the
     shortcode (`grep -o '/scripts/mermaid[^"]*' public/<page>/index.html`).
  2. Serve locally (`npm run dev`), open a page with a mermaid fence, and
     confirm the diagram renders as an SVG (not raw text) with no console
     errors — `agent-browser` (or DevTools) against
     `.mermaid svg` count == number of diagrams on the page.
  3. Confirm a page **without** a mermaid fence emits neither `<script>` tag
     (`hasMermaid` Scratch flag correctly gates the include).
  4. Visually confirm diagram colors (node fill, borders, note backgrounds)
     match the site's warm palette rather than Mermaid's default theme.

## Related files

- `src/layouts/_default/_markup/render-codeblock-mermaid.html` — the markdown
  render hook; Hugo routes ` ```mermaid ` fences here automatically by
  filename convention (`render-codeblock-{lang}.html`), leaving all other
  fenced code blocks on the default Chroma highlighting path.
- `src/layouts/_default/single.html` — `scripts` block: the `hasMermaid`
  conditional that loads the two assets via the fingerprinted Hugo Pipes
  pattern (`resources.Get | fingerprint`, matching `scroll-restore.js`'s
  cache-busting approach — see `docs/development/scroll-restoration.md`).
  `mermaid.min.js` skips `| minify` since it is already minified upstream and
  re-minifying a 3.5MB vendored file is pure build-time overhead with nothing
  to gain.
- `src/assets/scripts/mermaid.min.js` — vendored Mermaid `11.16.0` UMD bundle.
  Bump by re-downloading `https://cdn.jsdelivr.net/npm/mermaid@<version>/dist/mermaid.min.js`.
- `src/assets/scripts/mermaid-init.js` — calls `mermaid.initialize(...)`,
  resolving theme colors from the page's live CSS custom properties at
  runtime via `getComputedStyle`.
- `src/assets/styles/site.css` — `.article-body .mermaid-wrap` rules: panel
  background and border on the outer wrap, and an `overflow-x: auto` scroll
  container (`.mermaid-wrap__scroll`) so a wide diagram never causes horizontal
  page scroll.

## Diagram zoom

### Change summary

Mermaid diagrams can now be opened in a larger view. Diagrams are drawn to fit
the article column, so wide flowcharts and sequence diagrams often end up with
small text. Every rendered diagram now gets a visible **Zoom** button in its
top-right corner, and clicking anywhere on the diagram does the same thing. The
diagram opens in the same `<dialog>` that article images already use.

### Old vs new behavior

- **Old:** A diagram only ever showed at article-column width. The only way to
  read small labels was browser zoom or scrolling a wide diagram sideways.
  Mermaid rendered through `startOnLoad`, which waits for the window `load`
  event (after every image on the page has loaded).
- **New:**
  - `mermaid-init.js` sets `startOnLoad: false` and calls
    `mermaid.run({ querySelector: '.mermaid', suppressErrors: true })` as soon
    as the DOM is ready. When it finishes (even if one diagram fails to parse),
    it dispatches a `rhino:diagrams-rendered` event on `document`.
  - `article-image-zoom.js` already owns the zoom dialog. On that event it adds
    a `<button class="rhino-diagram-zoom-button">` to each `.mermaid-wrap` that
    contains a rendered SVG and marks the wrap `.rhino-diagram-zoom-target`
    (zoom-in cursor, extra top padding so the button never covers the diagram).
    Unlike the image badge, the button is always visible, because touch
    screens have no hover state to reveal it.
  - Opening a diagram puts a copy of its SVG in the dialog. Every id in the
    copy gets a `-zoom` suffix, because Mermaid scopes its `<style>` rules,
    arrow markers and `aria-labelledby` references to the SVG id, and the
    copy would otherwise duplicate the inline diagram's ids. The copy fills
    the dialog width without exceeding the viewport height. A tall diagram
    that would come out smaller than inline that way is shown at its natural
    width or 1.5× its inline width (whichever is larger), and the dialog
    scrolls vertically.
  - The dialog toolbar has a new **Zoom in** / **Fit to screen** toggle
    (`[data-rhino-image-zoom-toggle]`), shown only for diagrams. It doubles
    the diagram size and the dialog area scrolls both ways. Clicking the
    enlarged diagram also toggles it and keeps the clicked point under the
    cursor.
  - While a diagram is open, the dialog's `aria-label` becomes
    "Expanded diagram" and the close button's becomes "Close enlarged diagram".
    Both go back to the image labels on close, and focus returns to the
    diagram's Zoom button. Escape, a backdrop click and the Close button all
    close it, exactly as they do for images.
  - Clicks on links inside a diagram, or a click that ends a text selection,
    do not open the dialog.

### Impact and verification

- **Impacted components:** Every page with a ` ```mermaid ` fence; the shared
  image-zoom dialog in `single.html` (new toolbar wrapper around the Close
  button; image zoom behavior is unchanged). Without JavaScript nothing
  changes: the button is created by script, so no dead control is rendered.
- **Verify:**
  1. `npm run build:local:fast` builds without errors.
  2. Serve `public/` and open a post with a diagram (for example
     `/securing-custom-endpoints-in-sfcc/`). Each `.mermaid-wrap` has one
     `.rhino-diagram-zoom-button`.
  3. Click the diagram. The dialog opens larger than the inline diagram,
     with a **Zoom in** button. **Zoom in** doubles the diagram and it scrolls.
     Escape closes the dialog and focus returns to the Zoom button.
  4. Tab to the Zoom button and press Enter. The dialog opens with focus on
     Close.
  5. With the dialog open, the document has no duplicate `id` values.
  6. Open an article image on the same page. It still opens with no
     **Zoom in** button and the "Expanded article image" label.

### Related files

- `src/layouts/_default/_markup/render-codeblock-mermaid.html` — adds the
  `.mermaid-wrap__scroll` element so the Zoom button sits outside the
  horizontal scroll area.
- `src/assets/scripts/mermaid-init.js` — explicit `mermaid.run()` and the
  `rhino:diagrams-rendered` event.
- `src/static/scripts/article-image-zoom.js` — diagram trigger creation, SVG
  copy with renamed ids, dialog sizing and the zoom toggle.
- `src/layouts/_default/single.html` — dialog toolbar and the hidden
  `[data-rhino-image-zoom-toggle]` button.
- `src/assets/styles/site.css` — `.rhino-diagram-zoom-button`,
  `.article-image-zoom__toolbar`, `.article-image-zoom__action` and
  `.article-image-zoom__diagram` rules.
