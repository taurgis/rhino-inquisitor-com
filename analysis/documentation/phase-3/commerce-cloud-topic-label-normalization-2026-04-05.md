# Change summary

The category previously displayed as Salesforce Commerce Cloud now renders as Commerce Cloud across topic-driven UI surfaces while keeping the existing category slug and route unchanged.

# Why this changed

The longer label was visually heavy in archive badges and topic metadata, and the Salesforce prefix was redundant in this site context. The goal was to shorten the reader-facing label without triggering a taxonomy rename or requiring bulk edits across post front matter.

# Behavior details

Old behavior:
- Topic metadata and archive surfaces often rendered the raw category value Salesforce Commerce Cloud directly from post front matter.
- The matching category page also displayed Salesforce Commerce Cloud as its title.
- Normalizing the label would have required editing many posts if done at the content taxonomy-key level.

New behavior:
- The existing `/category/salesforce-commerce-cloud/` topic now displays as Commerce Cloud.
- Archive cards, article metadata, footer topic navigation, archive topic filters, homepage latest-post metadata, and archive search result metadata now use the resolved topic page label instead of the raw category string.
- Stored post category values remain unchanged, so taxonomy identity and route stability are preserved.

# Impact

- Affected workflows: archive browsing, topic scanning, article topic navigation, and archive search result review.
- Affected components: category term metadata and shared topic-label rendering partials.
- SEO-safe routing is preserved because the category slug remains `salesforce-commerce-cloud`.

# Verification

1. Run `npm run build:prod`.
2. Run `npm run check:seo:artifact`.
3. Confirm `/category/salesforce-commerce-cloud/` still resolves while its visible heading reads Commerce Cloud.
4. Confirm archive cards and article metadata show Commerce Cloud instead of Salesforce Commerce Cloud.
5. Confirm archive filters and search results use Commerce Cloud as the visible topic label.

# Related files

- `src/content/categories/salesforce-commerce-cloud/_index.md`
- `src/layouts/partials/article/resolve-primary-topic.html`
- `src/layouts/partials/cards/article-card-badges.html`
- `src/layouts/partials/article/meta-row.html`
- `src/layouts/partials/article/footer-actions.html`
- `src/layouts/home.html`
- `src/layouts/home.json.json`
- `src/layouts/partials/archive/filter-groups.html`