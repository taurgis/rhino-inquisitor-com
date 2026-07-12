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
  `<div class="mermaid-wrap"><div class="mermaid">...</div></div>` instead of a
  Chroma-highlighted `<pre>`. Client-side, `mermaid.min.js` (vendored, pinned to
  `11.16.0`) renders every `.mermaid` element into inline SVG on page load, and
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
  background, border, and an `overflow-x: auto` scroll container so a wide
  diagram never causes horizontal page scroll.
