# Homepage Owner And Project Migration

## Change summary

Added a content-driven owner and active-project module to the Hugo homepage so the front page again includes personal context and project links that exist on the live site.

## Why this changed

The active Hugo homepage rendered only the discovery surfaces for featured content, latest posts, topics, and newsletter actions. The current live homepage still exposes who Thomas is and links to active projects, so the migration was missing material homepage context users already expect.

## Behavior details

### Old behavior

- The active homepage rendered the hero, CTA bar, featured article, latest posts, topic pills, and newsletter section only.
- The migrated legacy homepage content existed in `src/content/pages/home/index.md`, but it stayed inactive as a draft and could not safely be re-enabled as another root `/` publisher.

### New behavior

- The homepage keeps the existing discovery-first layout and now inserts a dedicated owner and active-project section between the CTA bar and the content grid.
- Owner copy, action links, and project links are stored in `src/data/homepage.json`, so future copy updates do not require template edits.
- The draft legacy homepage content remains inactive, avoiding the prior root-route collision risk while still restoring the missing homepage information.

## Impact

- Affects the homepage only.
- Restores parity with the live site's personal-intro and project-link behavior without changing canonical, routing, or post discovery behavior.
- Gives maintainers a single structured data file for homepage owner/project updates.

## Verification

- Run `npm run build:prod`.
- Run `npm run check:metadata`.
- Run `npm run check:schema`.
- Run `npm run check:internal-links`.
- Run `npm run check:links`.
- Manually confirm the homepage module reads clearly on desktop and mobile and that both external project links resolve.

## Related files

- `src/data/homepage.json`
- `src/layouts/home.html`
- `src/assets/styles/site.css`
