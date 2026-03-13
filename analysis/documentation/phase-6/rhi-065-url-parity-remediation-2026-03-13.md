# RHI-065 URL Parity Remediation

## Change summary

RHI-065 now includes a focused remediation slice for the remaining clean-build URL parity blockers. The change adds the missing category term aliases required by the finalized manifest, adds explicit `/rss/` feed compatibility output, and updates parity/feed validation so non-HTML system files and feed compatibility helpers are checked against the behavior Hugo actually publishes.

## Why this changed

The repository-level parity investigation showed two different failure classes. A stale `public/` artifact caused preview-host alias and missing-PDF false failures, while the clean production artifact still had real implementation gaps: missing category alias pages, missing `/rss/` compatibility output, and validator logic that treated `robots.txt` and `sitemap.xml` as if they had to be HTML pages.

Without this remediation, `npm run check:url-parity` continued to fail even on a clean production build, blocking Workstream C closeout and Phase 6 sign-off.

## Behavior details

Old behavior:

1. Category term bundles under `src/content/categories/**/_index.md` had no aliases for the approved nested legacy category merge routes, so Hugo did not generate the alias pages required by the manifest.
2. Feed compatibility output existed for `/feed/`, `/feed/rss/`, and `/feed/atom/`, but there was no `/rss/` helper even though the manifest contains an explicit `/rss/` merge record.
3. Feed helper HTML redirected directly to `/index.xml`, but `validate-url-parity` required a literal match to manifest target `/feed/`, which produced false `wrong-refresh-target` and `wrong-canonical-target` risk for feed compatibility helpers.
4. `validate-url-parity` only treated attachments as non-HTML keep assets. `robots.txt` and `sitemap.xml` were therefore reported as `missing-public-page` even when Hugo had generated them correctly.

New behavior:

1. The canonical category term bundles now declare the approved legacy aliases, so Hugo generates alias pages for the nested category merge routes required by the manifest.
2. `/rss/` now ships as a Pages-compatible feed helper alongside `/feed/`, `/feed/rss/`, and `/feed/atom/`.
3. Feed compatibility helpers continue to point directly to Hugo's canonical feed artifact `/index.xml`, but parity validation now treats `/index.xml` as an approved implementation of manifest target `/feed/` for system feed compatibility routes. This preserves one-hop helper behavior instead of introducing helper-to-helper chains.
4. `validate-url-parity` now validates non-HTML system keep routes such as `/robots.txt` and `/sitemap.xml` against the published public asset map instead of the HTML page map.
5. Feed-related validation and policy scripts now include `/rss/` so feed compatibility behavior is checked consistently across parity, sitemap, crawl-control, and non-HTML policy tooling.

## Impact

1. Workstream C now has concrete alias coverage for the approved category merge routes recorded in the manifest.
2. The Phase 6 parity gate better distinguishes real route defects from expected Hugo-generated file outputs.
3. Feed compatibility checks are now aligned across `/feed/`, `/feed/rss/`, `/feed/atom/`, and `/rss/`.
4. Clean production parity results are no longer blocked by false failures for `robots.txt` and `sitemap.xml`.

## Verification

1. Run `npm run build:prod` to regenerate a clean production artifact.
2. Run `npm run test:url-parity` to confirm the validator regression coverage still passes.
3. Run `npm run check:url-parity` and confirm the clean-build category, feed, and system-file failures are cleared.
4. Run `npm run check:feed-compatibility` to verify `/feed/`, `/feed/rss/`, `/feed/atom/`, and `/rss/` all resolve through the approved compatibility pattern.
5. Run `npm run check:sitemap` and `npm run check:crawl-controls` to confirm the additional `/rss/` compatibility route is treated consistently by downstream SEO checks.
6. Verified on 2026-03-13: `npm run test:url-parity` passed 6 of 6 tests, `npm run check:url-parity` reported `1223` pass rows and `0` failures, `npm run check:feed-compatibility` reported `0` failures, and both `npm run check:sitemap` and `npm run check:crawl-controls` passed on the clean production build.

## Related files

1. `src/content/categories/release-notes/_index.md`
2. `src/content/categories/linkedin/_index.md`
3. `src/content/categories/salesforce-architects-blog/_index.md`
4. `src/content/categories/salesforce-ben/_index.md`
5. `src/content/categories/ai/_index.md`
6. `src/content/categories/architecture/_index.md`
7. `src/content/categories/salesforce-commerce-cloud/_index.md`
8. `src/content/categories/erd/_index.md`
9. `src/content/categories/go-live/_index.md`
10. `src/content/categories/technical/_index.md`
11. `src/content/categories/podcasts/_index.md`
12. `src/content/categories/sessions/_index.md`
13. `src/content/categories/external/_index.md`
14. `src/static/feed/index.html`
15. `src/static/feed/rss/index.html`
16. `src/static/feed/atom/index.html`
17. `src/static/rss/index.html`
18. `scripts/migration/validate-url-parity.js`
19. `scripts/migration/validate-url-parity.test.js`
20. `scripts/migration/check-feed-compatibility.js`
21. `scripts/seo/check-sitemap.js`
22. `scripts/seo/check-crawl-controls.js`
23. `scripts/seo/build-non-html-policy.js`
24. `analysis/tickets/phase-6/RHI-065-hugo-route-preservation-alias-integration.md`