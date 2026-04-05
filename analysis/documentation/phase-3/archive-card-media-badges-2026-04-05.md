# Change summary

Archive post cards now place the primary topic and publication date on the image as bottom-right badge overlays instead of repeating those two items in the body metadata row.

# Why this changed

The archive card metadata sat entirely below the image, which made the image block feel visually detached from the article context. Modern publishing platforms commonly anchor one or two high-value metadata chips on the image so readers can identify topic and freshness faster while scanning a dense archive.

# Behavior details

Old behavior:
- Archive post cards rendered the published date, reading time, primary topic, and optional updated date together in the body metadata row.
- The image area had no contextual metadata and relied on the body block for all scanning cues.
- Topic navigation was only exposed from the inline metadata row.

New behavior:
- Archive post cards with hero images now render a topic badge and date badge at the bottom-right of the image.
- The topic badge keeps its category link directly from the image overlay.
- The body metadata row now keeps the remaining non-duplicated details, such as reading time and updated date, when the overlay is present.
- Post cards without hero images continue to use the body metadata row for date and topic so the layout does not lose context.

# Impact

- Affected components: archive post card partials and shared metadata rendering.
- Affected workflows: archive browsing and topic-driven scanning on `/posts/` and paginated post archive routes.
- SEO behavior is unchanged because URLs, canonicals, schema output, and crawl controls were not modified.

# Verification

1. Run `npm run build:prod`.
2. Open `/posts/` and a paginated archive route such as `/posts/page/2/` and confirm the topic and date badges sit on the image bottom-right.
3. Confirm the topic badge still links to the matching category archive.
4. Confirm post cards without images still show date and topic in the body metadata row.
5. Run `npm run check:seo:artifact` to verify the Hugo template change did not affect artifact validation.

# Related files

- `src/layouts/partials/cards/article-card.html`
- `src/layouts/partials/cards/article-card-badges.html`
- `src/layouts/partials/article/meta-row.html`
- `src/assets/styles/site.css`