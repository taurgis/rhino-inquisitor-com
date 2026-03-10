# RHI-035 Description Display Policy

## Change summary

Single post pages no longer render front matter `description` as visible intro copy above the article body. The field remains in migrated front matter for SEO metadata, social sharing tags, and archive/card excerpts.

## Why this changed

The Phase 4 front matter mapper intentionally generates non-empty `description` values for indexable content, including fallback summaries capped for metadata use. On long-form migrated posts, rendering that metadata field above the article body produced a duplicated and sometimes truncated opening paragraph, which weakened article readability.

## Behavior details

Old behavior:

- `src/layouts/_default/single.html` rendered `description` for all single pages, including migrated posts.
- Migrated post descriptions created by RHI-035 could appear as clipped intro text ending with `...` before the full article body repeated the same opening idea.

New behavior:

- `src/layouts/_default/single.html` suppresses the visible description block when the page type is `posts`.
- Standard single pages can still render `description` when present.
- `description` remains unchanged in front matter and continues to feed SEO and sharing surfaces through `src/layouts/partials/seo/resolve.html`, plus archive/card excerpt fallbacks.

## Impact

- Migrated articles open directly with the body content instead of a duplicated metadata excerpt.
- SEO metadata coverage is preserved because the underlying front matter and SEO resolver contract are unchanged.
- Archive, home, and related-content surfaces can continue using `description` as excerpt content.

## Verification

- Build a staged migration site with `hugo --minify --environment production --contentDir migration/output/content --destination tmp/rhi-description-public`.
- Confirm `/the-realm-split-field-guide-to-migrating-an-sfcc-site/` no longer renders the clipped description block above the body.
- Confirm the page still emits a non-empty meta description from `description`.

## Related files

- `src/layouts/_default/single.html`
- `src/layouts/partials/seo/resolve.html`
- `scripts/migration/map-frontmatter.js`
- `analysis/tickets/phase-4/RHI-035-front-matter-mapping.md`