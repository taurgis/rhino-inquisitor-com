# AGENTS.md Guides Inside the Content Tree

## What changed and why

`src/content/posts/AGENTS.md` is a writing-style guide for AI agents, distilled from the 20 most recent published posts. Nested `AGENTS.md` files are the emerging cross-tool convention for agent guidance (Claude Code, Copilot, Cursor all read them near the files being edited), so the guide lives in the posts folder itself rather than under `docs/`.

Because the file sits inside Hugo's `contentDir`, three tools that previously scanned every `*.md` under `src/content` now exclude `AGENTS.md`:

1. `hugo.toml` — added `ignoreFiles = ['AGENTS\.md$']`.
2. `scripts/validate-frontmatter.js` — the fast-glob call ignores `**/AGENTS.md`.
3. `scripts/gates/check-spelling.js` — `collectMarkdownFiles` filters out `AGENTS.md` entries.

## Old vs new behavior

- **Before:** any `.md` file under `src/content` was rendered by Hugo as a page, required valid post/page front matter, and was spell-checked against the en-GB dictionary. An `AGENTS.md` would have failed the front matter gate, produced an unexpected `/posts/agents/` URL (breaking URL parity), and been flagged for verbatim American-spelling quotes.
- **After:** files named `AGENTS.md` anywhere in the content tree are invisible to the Hugo build, the front matter validator, and the spelling gate. All other content files are processed exactly as before.

## Impact and verification

Impacted: Hugo build output, `npm run validate:frontmatter`, `npm run check:spelling`, and by extension `npm run preflight` and `npm run gates:local`.

To verify:

1. `npm run validate:frontmatter` — passes with `src/content/posts/AGENTS.md` present and front-matter-free.
2. `npm run check:spelling` — reports the same file count as before the guide was added.
3. `npm run build:prod` — `public/` contains no `posts/agents/` directory and the sitemap gains no new URL.

## Related files

- `src/content/posts/AGENTS.md` (the guide itself)
- `hugo.toml`
- `scripts/validate-frontmatter.js`
- `scripts/gates/check-spelling.js`
