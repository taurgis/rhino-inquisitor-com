# Archive, Topic, and Mobile Audit Follow-Up — 2026-04-19

## Change summary
Resolved the April 19 audit follow-up findings across article bodies, category discovery, and a video-led article header. This update removes stale editorial artifacts, prevents duplicate lead media on `sfcc-introduction`, prioritizes archive and topic content ahead of filters in mobile DOM order, removes off-route year navigation from `/category/`, and adds mobile-safe wrapping or stacking for the audited code and checklist table surfaces.

## Why this changed
The audit flagged six code-heavy articles that still needed horizontal overflow handling on small screens, the realm split checklist table overflowing on mobile, `/category/` offering year-jump links that routed users into `/posts/`, filters consuming too much initial viewport space on archive and topic surfaces, and `sfcc-introduction` repeating the same artwork in both the lead hero and the top video.

## Behavior details

### Archive and topic surfaces
- Old: `/category/` rendered search, filters, and year-jump controls ahead of topic hubs, and the year-jump links were built from the blog archive so they sent users to `/posts/` pages.
- New: `/category/` keeps the header, archive search, and topic hubs only. No year-jump or filter rail is rendered there. Archive and category term pages still keep filters, but the DOM order now prioritizes main content before filters so mobile users reach results sooner while desktop grid placement remains unchanged.

### Article lead media
- Old: post headers always rendered the lead hero whenever `heroImage` was set, even if the post intentionally opened with embedded video content.
- New: posts can opt out with `hideLeadHero: true`. `sfcc-introduction` now uses that flag so cards and SEO still keep the hero image while the article page above the fold shows the summary and embedded video without duplicate artwork.

### Mobile article overflow
- Old: the audited code blocks and the realm split checklist relied on horizontal overflow handling on smaller screens.
- New: mobile code blocks wrap long lines, and the realm split checklist stacks rows into labeled cards instead of relying on horizontal scroll.

### Content cleanup
- Old: the POD guide and sandbox article exposed editorial debris, including inline rewrite notes and struck-through update history.
- New: both articles present clean prose only.

## Impact
- Users on `/category/`, `/archive/`, category term pages, `sfcc-introduction`, and the audited code-heavy articles.
- Maintainers now have an explicit `hideLeadHero` contract for future video-first posts.
- Mobile QA scope should prioritize the audited routes used in the overflow report plus `/category/` and `sfcc-introduction/`.

## Verification
1. Run `hugo --minify --environment production`.
2. Confirm `/category/` renders no year-jump or filter-rail markup and still exposes topic hubs plus archive search.
3. Confirm `sfcc-introduction` renders no `.page-article__hero--lead` element while keeping the lead summary and embedded video figure.
4. Validate mobile behavior at 390x844 on audited routes:
   - `/field-guide-to-custom-caches-in-sfcc/` reports no page overflow and no overflowing `pre` elements in Playwright.
   - `/the-realm-split-field-guide-to-migrating-an-sfcc-site/` reports no page overflow, no overflowing checklist wrapper, and a grid-stacked checklist body.
5. Confirm the cleaned POD and sandbox articles contain no leftover strike-through or editorial-note strings.

## Related files
- `src/layouts/_default/single.html`
- `src/layouts/pages/archive.html`
- `src/layouts/_default/taxonomy.html`
- `src/assets/styles/site.css`
- `src/layouts/shortcodes/realm-split-checklist-table.html`
- `src/content/posts/sfcc-introduction/index.md`
- `src/content/posts/the-sfcc-guide-to-finding-pod-numbers/index.md`
- `src/content/posts/how-to-get-a-salesforce-b2c-commerce-cloud-sandbox/index.md`
