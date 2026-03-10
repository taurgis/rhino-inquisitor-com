# RHI-038 Internal Link Rewrite Implementation

## Change summary

RHI-038 now has a deterministic internal link rewrite pass for staged Phase 4 Markdown. The implementation adds `npm run migrate:rewrite-links`, rewrites legacy same-host article links to canonical Hugo-relative paths, rewrites mapped WordPress media wrappers to local `/media/...` paths when the media manifest or localized image wrapper proves the mapping, removes orphan page links with no redirect target, and records every rewrite action in `migration/reports/link-rewrite-log.csv`.

## Why this changed

Phase 4 needed a content-level rewrite step between front matter generation and staged-site validation. Without it, migrated Markdown still contained legacy WordPress hosts, stale category paths, and outdated article slugs that only surfaced as broken links once a staged Hugo build existed.

## Behavior details

Old behavior:

- Staged Markdown under `migration/output/content/` still contained `https://www.rhino-inquisitor.com/...` links, nested legacy category paths, and some same-host WordPress media wrapper links.
- No repository command rewrote staged internal links after media relinking and front matter mapping.
- The staged Hugo build failed the internal link gate with 15 broken internal links, primarily nested category routes and one stale eCDN article slug.

New behavior:

- `scripts/migration/rewrite-links.js` scans every staged Markdown file under `migration/output/content/`.
- The rewrite pass protects fenced code blocks, inline code, and HTML `code` or `pre` blocks so examples are not mutated.
- Manifest-backed page links on legacy apex, `www`, or relative WordPress paths are rewritten to canonical Hugo-relative targets.
- Nested category targets from the legacy manifest are normalized to the repository's Hugo taxonomy contract at `/category/{slug}/`.
- The stale legacy eCDN article path `/how-to-set-up-the-ecdn-for-staging-in-salesforce-b2c-commerce-cloud/` is rewritten to the staged canonical page route `/how-to-set-up-the-ecdn-in-sfcc-staging/` because the generated content does not ship the legacy slug as a live page.
- Same-host media wrapper links are rewritten to localized `/media/...` targets when the media manifest can prove the mapping or when the wrapped image already points at the localized asset.
- Retired internal page links with no redirect target are unlinked while preserving anchor text, and the orphan action is logged for manual review.
- The video hub page now links three playlist headings to matching staged video-page routes when those pages exist in the staged corpus.
- Every rewrite is recorded in `migration/reports/link-rewrite-log.csv` with source file, original URL, rewritten URL, action, link kind, and anchor text.

## Impact

- Maintainers now have a repeatable post-mapping command to canonicalize staged internal links before batch validation.
- The staged Hugo build for migrated content now passes the internal link gate with zero critical broken links.
- Navigation validation is aligned with the current Hugo route contract for archive, category, and matching video hub pages without modifying `migration/url-manifest.json`.
- Residual non-manifest same-host media references remain tracked by `npm run migrate:rewrite-media` warnings and stay in RHI-037 scope; they do not block the RHI-038 internal page-link gate.

## Verification

- Ran `npm run migrate:map-frontmatter`.
- Ran `npm run migrate:rewrite-media`.
- Ran `npm run migrate:rewrite-links` successfully; the final rewrite report contains 332 logged actions and 6 orphan removals.
- Re-ran `npm run migrate:rewrite-links -- --report tmp/rhi038-idempotency.csv`; the rerun updated 0 files and logged 0 actions.
- Built the staged site with `hugo --minify --environment production --contentDir migration/output/content --destination tmp/rhi038-public`.
- Ran `CHECK_LINKS_PUBLIC_DIR=tmp/rhi038-public npm run check:links`; the internal link check passed across 210 HTML files.
- Manually verified:
  - archive behavior remains non-paginated on `/archive/`
  - category term output resolves at `/category/release-notes/`
  - the staged video hub links matching playlist headings to `/the-path-to-being-an-architect/`, `/me-myself-and-headless-a-composable-commerce-cloud-story/`, and `/connecting-the-clouds-wedding-or-funeral/`
- Noted non-blocking residuals from the staged build:
  - `npm run migrate:rewrite-media` still reports 68 unmapped non-manifest media references from RHI-037 scope
  - the staged Hugo build still emits existing Goldmark raw-HTML warnings for three posts outside this ticket's link-rewrite scope

## Related files

- `scripts/migration/rewrite-links.js`
- `package.json`
- `docs/migration/RUNBOOK.md`
- `migration/output/content/`
- `migration/reports/link-rewrite-log.csv`
- `analysis/tickets/phase-4/RHI-038-internal-link-navigation-rewrites.md`
- `analysis/tickets/phase-4/INDEX.md`