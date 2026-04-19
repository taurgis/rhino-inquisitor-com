# Home, Archive, and Screenshot Caption Cleanup - 2026-04-19

## Change summary
Phase 9 cleanup tightened low-signal excerpt handling across discovery surfaces and added visible figure labels to selected procedural screenshot posts so home, archive, topic, related, search, and metadata outputs carry stronger editorial context.

## Why this changed
A focused audit found two quality issues that were leaking into public discovery surfaces:
- several article descriptions were CTA-like or filler-heavy, which made cards, search summaries, and meta descriptions feel low-signal
- several screenshot-heavy procedural posts relied on alt text alone, leaving visible figure context too thin in the rendered article body

## Behavior details
### Summary and description surfaces
Old behavior:
- home, archive, related-content, search index, and llms discovery outputs each resolved excerpts separately
- pages with missing descriptions fell back inconsistently
- pages with weak descriptions pushed that same low-signal copy into archive cards, search summaries, and metadata

New behavior:
- a shared excerpt resolver now supplies fallback copy for card, related, search-index, llms, RSS, and metadata surfaces
- when description is missing, the resolver falls back to the first summary or takeaway item before using plain body summary text
- the worst CTA-style front matter descriptions in the audited slice were rewritten to concise editorial summaries

### Procedural screenshot captions
Old behavior:
- several procedural screenshot posts rendered images with no visible caption even when the screenshot carried a distinct step or control-panel context

New behavior:
- selected screenshot posts now render short visible figure labels that identify the exact UI state, settings panel, or workflow step shown in each image
- captions stay brief so they orient the reader without rewriting the surrounding paragraph
- duplicate screenshot-only bridge lines were removed where the caption already carries the visible label

### Audit scope
Old behavior:
- the prior audit findings existed as approved cleanup items but the local public build had not yet been rerun against the touched article set

New behavior:
- the local build was rerun and the focused audit slice now covers home, archive, topics index, a Commerce Cloud topic page, search-index summaries, and 10 touched article outputs

## Impact
- Readers get stronger summaries on homepage cards, archive cards, related cards, search results, llms outputs, and article metadata.
- Readers get stronger summaries in RSS item descriptions and llms full-page summaries when front matter descriptions are missing.
- Procedural screenshot posts now expose visible figure context instead of relying on alt text alone.
- Maintainers now have one shared excerpt contract in Hugo templates rather than repeating fallback rules in each discovery surface.

## Verification
- `npm run build:local`
- Browser spot checks on `http://localhost:1313/`, `http://localhost:1313/archive/`, `http://localhost:1313/category/`, and `http://localhost:1313/category/salesforce-commerce-cloud/`
- Focused static-output audit of `public/index.html`, `public/archive/index.html`, `public/category/index.html`, `public/category/salesforce-commerce-cloud/index.html`, `public/index.json`, and the 10 touched article routes
- Remnant check for low-signal phrases `Read the full article on Rhino Inquisitor` and `implementation details.` across public home/archive/category/search surfaces

## Related files
- `src/layouts/partials/article/resolve-excerpt.html`
- `src/layouts/partials/cards/article-card.html`
- `src/layouts/partials/article/related-content.html`
- `src/layouts/partials/seo/resolve.html`
- `src/layouts/home.html`
- `src/layouts/home.json.json`
- `src/layouts/home.llms.txt`
- `src/layouts/home.llmsfull.txt`
- `src/layouts/home.rss.xml`
- `src/content/posts/a-survival-guide-to-sfcc-platform-limits/index.md`
- `src/content/posts/image-ine-sfcc-dis-for-developers/index.md`
- `src/content/posts/salesforce-connections-2024-and-sfcc/index.md`
- `src/content/posts/the-realm-split-field-guide-to-migrating-an-sfcc-site/index.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-23-3-release/index.md`
- `src/content/posts/a-look-at-the-sfcc-23-5-release/index.md`
- `src/content/posts/a-beginners-guide-to-webdav-in-sfcc/index.md`
- `src/content/posts/field-guide-to-custom-caches-in-sfcc/index.md`
- `src/content/posts/how-to-set-up-the-ecdn-in-sfcc-staging/index.md`
- `src/content/posts/mastering-sitemaps-in-sfcc/index.md`
- `src/content/posts/delta-exports-in-salesforce-b2c-commerce-cloud/index.md`
- `src/content/posts/caching-rest-apis-in-sfcc/index.md`
- `src/content/posts/secure-coding-in-salesforce-b2c-commerce-cloud/index.md`
- `src/content/posts/slas-in-sfra-or-sitegenesis/index.md`
- `src/content/posts/your-definitive-mobile-app-checklist/index.md`
