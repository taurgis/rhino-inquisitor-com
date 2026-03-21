# Change summary

The homepage content copy baseline was normalized to 16px-equivalent sizing for common descriptive text blocks. The global root/body baseline is now explicit through relative CSS declarations, and the homepage excerpts and support paragraphs that previously rendered below 16px were raised to `1rem`.

# Why this changed

Rendered verification showed that the site root and article body already inherited a 16px browser-default baseline, but several homepage content paragraphs still computed below that threshold. This update closes that accessibility gap without forcing a broader typography redesign or changing intentionally compact UI metadata.

# Behavior details

Old behavior:
- `html` and `body` relied on browser defaults and already computed to 16px.
- Homepage descriptive copy still rendered below the 16px baseline in several places:
- `.page-hero__projects-intro` rendered at 13.12px.
- `.featured-article__excerpt` rendered at 15.36px.
- `.latest-list__excerpt` rendered at 13.6px.
- `.home-newsletter__body p` rendered at 14.4px.
- `.home-section__empty` and `.home-section__support` rendered at 14.4px.

New behavior:
- `html` explicitly uses `font-size: 100%` and `body` explicitly uses `font-size: 1rem` to preserve the browser-default 16px baseline with relative units.
- The homepage descriptive copy selectors listed above now render at `1rem`, giving those content paragraphs a 16px computed size at default browser settings.
- Smaller UI-specific text such as metadata rows, support links, and control labels remains unchanged in this update.

# Impact

Impacted components and workflows:
- Homepage hero project intro copy
- Homepage section support and empty-state copy
- Homepage featured-article and latest-post excerpts
- Homepage newsletter descriptive paragraph

This change is limited to typography styling in the shared site stylesheet and does not alter Hugo templates, URL behavior, SEO metadata, or structured data output.

# Verification

Verification steps used for this change:
1. Serve the built site locally from `public/`.
2. Confirm computed styles in a browser for `html`, `body`, homepage copy selectors, and article body paragraphs.
3. Verify the article body copy already computed to 16px before the change and that the homepage copy selectors listed above were the remaining outliers.
4. Recheck the homepage after the stylesheet update to confirm those selectors compute to 16px.
5. Run the production build to ensure the stylesheet change does not break the asset pipeline.

# Related files

- `src/assets/styles/site.css`
- `public/index.html`