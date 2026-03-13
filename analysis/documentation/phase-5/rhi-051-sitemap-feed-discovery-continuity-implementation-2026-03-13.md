# RHI-051 Sitemap, Feed, and Discovery Surface Continuity Implementation

Date: 2026-03-13
Ticket: `analysis/tickets/phase-5/RHI-051-sitemap-feed-discovery-continuity.md`

## Change summary

RHI-051 now has a dedicated Phase 5 sitemap and feed validation gate, a committed sitemap/feed policy, blocking CI coverage, and term-page fallback behavior that keeps preserved empty category routes from shipping as orphan discovery surfaces.

## Why this changed

Phase 5 Workstream D requires machine-readable discovery signals to be release-blocking. The repository already had a custom sitemap template, the Hugo root RSS feed, and static `/feed/` compatibility helpers, but it did not yet have a dedicated sitemap/feed validator, a committed policy for sitemap/feed/discovery behavior, or a safe way to keep preserved but currently unpopulated category routes non-empty.

## Behavior details

### Old behavior

- The repo had `src/layouts/sitemap.xml`, but no dedicated `npm run check:sitemap` gate or Phase 5 sitemap audit report.
- Feed validation existed only in `scripts/migration/check-feed-compatibility.js`, outside the Phase 5 SEO gate sequence.
- Route-sensitive PR and deploy workflows did not block on a Phase 5 sitemap/feed audit.
- Four preserved category routes with organic traffic rendered as empty-state pages because they currently have no direct migrated posts.
- `public/sitemap.xml` omitted `lastmod` on those empty category routes because the term pages had no page-derived last modified value.

### New behavior

- `scripts/seo/check-sitemap.js` now validates the built sitemap, sitemap-index readiness, metadata-to-sitemap parity, lastmod presence/format, feed XML integrity, `/feed/` compatibility routing, and discovery-surface continuity, then writes `migration/reports/phase-5-sitemap-audit.csv`.
- `npm run check:sitemap` is now available in `package.json` and is wired into the full-site route-sensitive PR workflow and the deploy workflow as a blocking step after `npm run check:metadata`.
- `migration/phase-5-sitemap-feed-policy.md` records the approved sitemap generation strategy, inclusion/exclusion rules, split threshold, feed routing contract, and archive/category preservation rules.
- Empty preserved term pages now fall back to recent posts instead of rendering an orphan empty-state shell, which keeps those URLs useful and crawlable until direct term assignments are backfilled.
- `src/layouts/sitemap.xml` now supplies a fallback `lastmod` for empty term pages based on the latest post in the archive, preventing sitemap rows from shipping without a parseable timestamp.

## Impact

- Maintainers now have a Phase 5 sitemap/feed audit artifact in `migration/reports/phase-5-sitemap-audit.csv` for sign-off and CI evidence.
- PR and deploy workflows will now fail before release if sitemap URLs drift from metadata canonicals, if excluded routes leak into the sitemap, if feed integrity breaks, or if preserved discovery surfaces collapse into empty pages.
- Preserved organic category routes stay non-empty without changing the underlying URL disposition policy or inventing new category assignments in migrated post front matter.

## Verification

- `npm run build:prod`
- `npm run check:metadata`
- `npm run check:sitemap`
- `npm run check:crawl-controls`
- `npm run check:seo:artifact`
- `npm run check:links`
- `hugo --gc --minify --environment preview --baseURL "https://taurgis.github.io/rhino-inquisitor-com/"`
- `node scripts/seo/check-crawl-controls.js --mode preview --base-url "https://taurgis.github.io/rhino-inquisitor-com/" --report tmp/phase-5-sitemap-preview-crawl-control-audit.csv`

Observed results on 2026-03-13:

- Production sitemap/feed audit: passed for `215` sitemap URLs; `migration/reports/phase-5-sitemap-audit.csv` written with `0` blocking failures
- Production metadata audit: passed for `215` indexable pages; `migration/reports/phase-5-metadata-report.csv` written
- Production crawl-control audit: passed with `0` blocking failures
- Production SEO smoke check: passed
- Production internal link check: passed

## Related files

- `scripts/seo/check-sitemap.js`
- `src/layouts/sitemap.xml`
- `src/layouts/_default/taxonomy.html`
- `package.json`
- `.github/workflows/build-pr.yml`
- `.github/workflows/deploy-pages.yml`
- `migration/phase-5-sitemap-feed-policy.md`
- `migration/reports/phase-5-sitemap-audit.csv`
- `analysis/tickets/phase-5/RHI-051-sitemap-feed-discovery-continuity.md`

## Assumptions and open questions

- The current GitHub Pages-compatible `/feed/` implementation remains a static helper redirect to `/index.xml`, not a true origin-level HTTP redirect. That is intentional under the current hosting constraint and remains acceptable until Phase 6 edge redirects are available.
- The fallback recent-post listing on empty preserved category routes is an interim discovery-surface strategy, not a substitute for restoring direct term-specific content assignments where source data justifies them.
