# Home RSS Filtering - 2026-04-06

## Change summary

Added a repo-owned home RSS template so the canonical `/index.xml` feed now syndicates published post entries only, and extended the feed compatibility validator to fail if blocked or non-post routes appear in the root feed.

## Why this changed

The site was relying on Hugo's embedded home RSS template, which included all regular pages by default. That allowed the content-backed `/404/` route and the published scaffold fixture at `/scaffold-readiness/` to appear in the staging and production root feed, and it also allowed standalone page content such as `/about/`, `/archive/`, and `/privacy-policy/` to enter the same subscriber-facing stream as blog posts.

## Behavior details

Old behavior:

- Hugo's default home RSS feed included all regular pages, so `/404/`, `/scaffold-readiness/`, and other non-post page routes could appear in `/index.xml`.
- The first repository-owned fix excluded blocked routes such as `noindex` and scaffold fixtures, but the root feed could still syndicate non-post pages.
- `scripts/migration/check-feed-compatibility.js` did not assert that all root feed items were post routes.

New behavior:

- `src/layouts/home.rss.xml` now overrides only the home feed and sources items exclusively from the posts content type.
- The home feed still excludes routes marked with top-level `noindex`, `seo.noindex`, or `scaffoldFixture: true` as a defense-in-depth rule for post content.
- Section, taxonomy, and term feeds continue to use Hugo's embedded templates because the fix only targets the canonical root feed.
- `scripts/migration/check-feed-compatibility.js` now parses feed item links and fails if blocked or non-post routes appear in `/index.xml`.
- The feed validator accepts an optional `--content-dir` argument so staged migration builds can apply the same blocked-route policy against non-default content roots.

## Impact

- Feed subscribers now get a stable blog-post stream rather than a mixed stream of posts plus standalone pages.
- The root RSS behavior now matches the expected editorial meaning of the site feed while still honoring the repository's noindex and scaffold-fixture contracts.
- Feed regressions now fail the compatibility gate even when the XML remains syntactically valid.

## Verification

1. Run `npm run build:staging` and confirm `public/index.xml` no longer contains `/404/`, `/scaffold-readiness/`, or known page routes such as `/about/`.
2. Run `npm run build:prod` and confirm the canonical feed still renders valid RSS with published post entries.
3. Run `npm run check:feed-compatibility` and confirm it passes against the default `src/content` and `public/` build.
4. For staged migration builds, run `npm run check:feed-compatibility -- --content-dir migration/output/content --public-dir tmp/rhi039-public --robots-file tmp/rhi039-public/robots.txt` and confirm the same posts-only policy is enforced.

## Related files

- `src/layouts/home.rss.xml`
- `scripts/migration/check-feed-compatibility.js`
- `docs/migration/RUNBOOK.md`