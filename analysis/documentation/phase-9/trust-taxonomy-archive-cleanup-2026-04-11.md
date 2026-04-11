# Trust, Taxonomy, and Archive Cleanup - 2026-04-11

## Change summary
Phase 9 cleanup adjusted discovery surfaces and selected content so the public Hugo site no longer signals features that do not exist, no longer surfaces empty topic hubs as active archives, and no longer mixes utility pages into the public pages archive.

## Why this changed
A post migration review found several trust issues and archive leaks:
- header search looked broader than the archive search it actually opens
- homepage follow copy implied a newsletter that the site does not run
- several migrated articles still carried visible formatting drift
- privacy and about copy did not make the public contact route explicit enough
- taxonomy and page archive surfaces still exposed empty or utility routes as if they were active content destinations

## Behavior details
### Search and homepage trust copy
Old behavior:
- header search reused generic search language and could imply a sitewide live search
- homepage promoted a newsletter even though only RSS and archive links existed

New behavior:
- header search is labeled as archive search and keeps the archive destination explicit
- homepage follow copy points readers to RSS and the latest archive entries

### Contact path
Old behavior:
- privacy copy referred readers to the about contact path, but the contact section was not explicit enough about the public channels to use

New behavior:
- the about page contact section now names public contact channels clearly and the privacy page now points readers to those public links

### Taxonomy and archive leakage
Old behavior:
- empty topic term routes could backfill unrelated recent posts
- the topics index could surface zero entry hubs
- the pages archive included utility and scaffold routes such as archive, offline, video, policy, and scaffold pages

New behavior:
- empty topic routes keep the archive shell but remain empty
- the topics index only lists categories with published entries
- the pages archive filters routes marked with archiveExclude and scaffoldFixture

### Sitemap paginator poisoning
Old behavior:
- the custom sitemap template called `.Paginate` on section pages to enumerate paginated URLs, which poisoned Hugo's per-page paginator cache and caused the pages archive filter in list.html to be silently ignored

New behavior:
- the sitemap computes paginated URL counts mathematically instead of calling `.Paginate`, so the list template's filtered `.Paginate` call is now the first and authoritative one
- the sitemap applies the same archiveExclude and scaffoldFixture filter when computing the pages section page count, preventing phantom paginated URLs that would 404

### Article formatting
Old behavior:
- several articles still had malformed emphasis, missing spacing around bold text, or broken inline note formatting that leaked directly into the rendered page

New behavior:
- the affected articles now render emphasis, inline notes, and highlighted guidance cleanly in the public article body

## Impact
- Readers get more accurate discovery copy in the header, homepage, and policy pages.
- Empty topic hubs no longer present as active archive destinations.
- The pages archive now focuses on public reference content instead of utility routes.
- Maintainers can exclude future utility pages from the public pages archive with archiveExclude.

## Verification
- npm run build:prod
- npm run lhci:run:p8:mobile
- Manual spot checks on /category, empty topic term routes, /pages, /about, /privacy-policy, and the updated article surfaces

## Related files
- src/layouts/partials/site/header.html
- src/layouts/home.html
- src/layouts/_default/taxonomy.html
- src/layouts/_default/list.html
- src/layouts/partials/search/search-bar.html
- src/content/pages/about/index.md
- src/content/pages/privacy-policy/index.md
- src/content/pages/archive/index.md
- src/content/pages/offline/index.md
- src/content/pages/scaffold-readiness/index.md
- src/content/pages/video/index.md
- src/content/pages/cookie-policy-eu/index.md
- src/content/posts/real-time-inventory-checks-in-sfcc/index.md
- src/content/posts/how-to-use-ocapi-scapi-hooks/index.md
- src/content/posts/how-to-set-up-the-ecdn-in-sfcc-staging/index.md
- src/content/posts/image-ine-sfcc-dis-for-developers/index.md
- src/content/posts/slas-in-sfra-or-sitegenesis/index.md
- src/layouts/sitemap.xml
