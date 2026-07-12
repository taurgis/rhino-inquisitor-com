# Publish-gated content: the `when-published` / `when-unpublished` shortcodes

## Change summary

A live article can now reference a planned (still-draft) article without
shipping a dead internal link. The `when-published` shortcode
(`src/layouts/shortcodes/when-published.html`) wraps Markdown and renders it
only when its `target` URL resolves to a page in the current build. Because
production builds never include drafts, the block stays hidden until the
target article actually publishes — then it appears on the next deploy with
no further edit to the referencing article.

Two extensions (added 2026-07-12, same day, while merging the two article
branches that motivated the system):

- **`when-unpublished`** — the "else" branch: renders its inner Markdown
  only while the target is still draft. Pair the two to *swap* wording at
  publish time instead of just adding some.
- **`display="inline"`** — splices a phrase into a sentence or list item
  (no paragraph wrapper) instead of emitting a standalone block.

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

- `target` is the planned page's `url` front matter value: lowercase,
  leading slash (a missing trailing slash is normalized to Hugo's served
  form). Category term pages (`/category/<slug>/`) are valid targets too —
  the gate derives their URLs from `[permalinks.term]`. Aliases are rejected
  by the gate — an alias never matches the shortcode's `RelPermalink`
  lookup, so the block would never unhide.
- A `draft: false` target with a **future date** counts as unpublished:
  production builds never pass `--buildFuture`, so blocks stay gated (and
  the gate reports `pending`, not `unwrap`) until the date passes.
- The inner content is ordinary page Markdown: callouts, internal links,
  emphasis, and other shortcodes all work.
- One shortcode gates on one target. If a block depends on two planned
  articles, nest two shortcodes or (usually better) split the block.

### The else branch: swapping wording at publish time

When the interim text must *change* rather than merely gain a block, put
the current wording in `when-unpublished` and its replacement in
`when-published`, same target. Exactly one branch renders in any build, and
the switch happens automatically on the first deploy after the target goes
live. Leave a blank line between the two blocks — adjacent shortcode tags
without one get wrapped in a stray paragraph.

```md
{{< when-unpublished target="/planned-article/" >}}
I haven't published the deep dive yet, so the short version: check the
official guide before committing.
{{< /when-unpublished >}}

{{< when-published target="/planned-article/" >}}
I've since written [the full deep dive](/planned-article/) — start there.
{{< /when-published >}}
```

### Inline form: a phrase inside a sentence

`display="inline"` renders the inner Markdown without a paragraph wrapper,
so a link or clause can sit mid-sentence or at the end of a list item. Both
shortcodes support it, and the two can be chained back-to-back inside one
paragraph for a sentence-level if/else (see the Storefront Next footnote in
the Composable Storefront article for a real example):

```md
- **The B2C Shopper Agent** acts as a shopping assistant inside chat.
  {{< when-published target="/planned-article/" display="inline" >}}[Read
  the deep dive.](/planned-article/){{< /when-published >}}
```

Keep the separating space *outside* the tags (before the opening tag) — the
template trims the inner content's edges.

## Behavior details

| Situation | Old (before this change) | New |
|-----------|--------------------------|-----|
| Live article references a draft article | Dead link ships; internal-link gate fails the deploy | Block is omitted from the built page; build logs a `WARN when-published: target ... is not published yet` line so pending content stays visible |
| The draft article publishes (`draft: false`) | Author had to re-edit every referencing article at publish time | Block appears automatically on the next build, rendered through the normal render hooks |
| Typo in the reference | Internal-link gate catches it only if the block is live | `check-when-published` blocks the commit/deploy: the target must match some content file's `url` (draft or published) |

Publish-time checklist for a draft that is the target of pending blocks:

1. `npm run check:when-published -- --all` lists every affected block and
   the articles holding them: `pending` lines are blocks that will appear,
   `fallback-active` lines are interim wordings that will disappear.
2. When flipping the draft live, bump `lastmod` on those referencing
   articles in the same commit — their built content changes even though
   their source does not.
3. After publication the wrappers are inert; the gate reports `unwrap`
   (when-published can be unwrapped in place) and `stale-fallback`
   (when-unpublished now renders nothing and can be deleted) notices for
   cleanup on the next editorial pass of that article (no urgency).

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

## Follow-up: 2026-07-12 review fixes

A same-day high-effort review confirmed nine defects in the first cut; all
are fixed and regression-tested:

- The gate's tag regex no longer misreads an unquoted target's trailing
  slash as a self-closing marker, double-backtick code spans mask
  correctly, and tag balance is checked in both directions (a stray closing
  tag now blocks too).
- The url shape rule moved to `scripts/gates/url-shape.js`, shared with
  `scripts/validate-frontmatter.js` so the two cannot drift; targets and
  index keys are normalized to Hugo's served form.
- Scheduled posts (`draft: false`, future date) count as unpublished, so
  the notices no longer advise removing load-bearing gating.
- `--staged` mode validates against the git index (the tree the commit
  creates): untracked drafts no longer satisfy a target locally that CI
  would reject.
- `src/layouts/partials/llms/clean-body.html` resolves the gating pair to
  exactly one branch, so Hugo-native markdown alternates and `llms-full.txt`
  never leak raw tags or both branches (previously masked in production
  only by the post-build rewrite; visible in `hugo server`).
- The callout gate's shortcode exemption narrowed to **closing** tags only:
  an opening or standalone shortcode directly under a callout is a real
  lazy continuation (its inline placeholder renders inside the callout box,
  verified against Hugo 0.163) and is flagged again.

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
- `src/layouts/shortcodes/when-unpublished.html` — the else branch.
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
- `src/content/posts/ai-einstein-in-salesforce-b2c-commerce-cloud/index.md`
  — inline use: a deep-dive link at the end of a list item.
- `src/content/posts/sitegenesis-vs-sfra-vs-pwa/index.md` — inline if/else:
  a sentence swapped inside a paragraph.
- `src/content/posts/what-does-the-composable-storefront-mean-for-sfcc-developers/index.md`
  — inline link-target swap plus a block-level paragraph swap.
- `src/content/posts/AGENTS.md` — authoring guidance for referencing
  planned articles.
