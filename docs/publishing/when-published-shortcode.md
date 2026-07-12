# Publish-gated content: the `when-published` shortcode

## Change summary

A live article can now reference a planned (still-draft) article without
shipping a dead internal link. The new `when-published` shortcode
(`src/layouts/shortcodes/when-published.html`) wraps a block of Markdown and
renders it only when its `target` URL resolves to a page in the current
build. Because production builds never include drafts, the block stays
hidden until the target article actually publishes — then it appears on the
next deploy with no further edit to the referencing article.

A companion gate (`scripts/gates/check-when-published.js`) validates every
`target` against content front matter so a typo cannot silently hide a block
forever. See the "when-published gate" section in
[deploy-gate-matrix.md](deploy-gate-matrix.md) for the gate's finding table
and enforcement layers.

## Why this changed

On 2026-07-11 a freshness note was added to the live "Commerce on Core"
article linking to a new decision-guide post that was committed as
`draft: true`. Drafts are not built, so the internal-link gate correctly
failed the deploy (`href does not resolve to a built file in public/`), and
the note had to be reverted. The underlying need — update an older article
now, have the paragraph go live together with the planned article — kept no
supported path. This shortcode is that path.

## Usage

Standard notation (`{{< >}}`) is required — the template renders its inner
Markdown itself via `RenderString` in block mode, so the page's render hooks
(callouts, internal links) apply exactly once. With `{{% %}}` the rendered
HTML would be pushed through Goldmark a second time (the gate blocks this).

```md
{{< when-published target="/planned-article/" >}}
> [!NOTE]
> A 2026 update: see [the new post](/planned-article/) for the current answer.
{{< /when-published >}}
```

- `target` is the planned page's `url` front matter value, exactly:
  lowercase, leading and trailing slash. Aliases are rejected by the gate —
  an alias never matches the shortcode's `RelPermalink` lookup, so the block
  would never unhide.
- The inner content is ordinary page Markdown: callouts, internal links,
  emphasis, and other shortcodes all work.
- One shortcode gates on one target. If a block depends on two planned
  articles, nest two shortcodes or (usually better) split the block.

## Behavior details

| Situation | Old (before this change) | New |
|-----------|--------------------------|-----|
| Live article references a draft article | Dead link ships; internal-link gate fails the deploy | Block is omitted from the built page; build logs a `WARN when-published: target ... is not published yet` line so pending content stays visible |
| The draft article publishes (`draft: false`) | Author had to re-edit every referencing article at publish time | Block appears automatically on the next build, rendered through the normal render hooks |
| Typo in the reference | Internal-link gate catches it only if the block is live | `check-when-published` blocks the commit/deploy: the target must match some content file's `url` (draft or published) |

Publish-time checklist for a draft that is the target of pending blocks:

1. `npm run check:when-published -- --all` lists every pending block and the
   articles holding them (the `pending:` lines).
2. When flipping the draft live, bump `lastmod` on those referencing
   articles in the same commit — their built content changes even though
   their source does not.
3. After publication the wrapper is inert; the gate reports it as an
   `unwrap` notice and it can be removed on the next editorial pass of that
   article (no urgency, purely source hygiene).

## Impact

- **Authors**: may update older articles to reference planned posts at
  writing time instead of at publish time. The pre-commit hook validates the
  blocks in staged articles.
- **Maintainers**: one more `build`-group gate in the deploy pipeline and
  one more preflight suite; both dependency-free.
- **Deploy pipeline**: unchanged workflow file — the gate rides the existing
  `build` group in `scripts/gates/run-all-gates.sh`.
- **The callout gate** learned that a shortcode tag line (`{{< ... >}}` /
  `{{% ... %}}`) following a callout is a block boundary, not a lazy
  continuation — Hugo strips shortcode tags before Goldmark parses the
  Markdown (`isLazyContinuation` in `scripts/gates/check-callouts.js`).

## Verification

Verified end-to-end on 2026-07-12 with Hugo Extended 0.163.3 (the CI pin):

1. **Hidden path**: with the target still `draft: true`,
   `npm run build:prod` logs the `WARN when-published` line, the built page
   contains neither the note text nor the link, and the `build` and `seo`
   gate groups (including the internal-link check) pass.
2. **Published path**: temporarily flipping the target to `draft: false` and
   rebuilding renders the block as a styled callout
   (`article-callout--note`) with a working
   `href=/which-salesforce-commerce-is-my-commerce/` link.
3. **Regression suites**: `npm run test:when-published` (20 tests: notation,
   self-closing, unclosed, missing/malformed/alias/unknown targets, masking,
   front matter parsing including YAML block scalars, and a whole-corpus
   baseline) and `npm run test:callouts` (31 tests, including the new
   shortcode-tag boundary case).

## Related files

- `src/layouts/shortcodes/when-published.html` — the shortcode.
- `scripts/gates/check-when-published.js` — target-validation gate.
- `scripts/gates/check-when-published.test.js` — regression suite.
- `scripts/gates/check-callouts.js` — `isLazyContinuation` now treats
  shortcode tag lines as block boundaries.
- `scripts/gates/run-all-gates.sh` — gate registered in the `build` group.
- `.githooks/pre-commit` — staged check (`SKIP_WHEN_PUBLISHED_CHECK=1` to
  bypass once).
- `scripts/preflight.sh` — runs the regression suite pre-push.
- `package.json` — `check:when-published`, `test:when-published`.
- `src/content/posts/what-is-commerce-on-core/index.md` — first use: the
  2026 freshness note gated on `/which-salesforce-commerce-is-my-commerce/`.
- `src/content/posts/AGENTS.md` — authoring guidance for referencing
  planned articles.
