# Downloadable File URL Convention

Date: 2026-03-13
Status: Active
Related implementation baseline: `analysis/documentation/phase-5/rhi-058-non-html-resource-seo-controls-implementation-2026-03-13.md`

## Change summary

This document formalizes the repository convention for site-hosted downloadable files. New and updated editorial download links must use canonical `/media/...` URLs by default. Legacy `wp-content/uploads/...` routes may remain live only as explicit compatibility exceptions while Phase 6 prepares stronger edge redirects or owner-approved long-term keep behavior.

## Why this changed

RHI-058 established a working PDF pattern: article-facing downloads now use canonical `/media/...pdf` paths while legacy WordPress upload URLs remain available for backward compatibility. That behavior was correct but implementation-specific. The repository needed a durable rule so future downloadable assets do not reintroduce `wp-content/uploads` as the preferred public URL surface.

## Behavior details

### Old behavior

- Downloadable-file handling was implicit and ticket-specific.
- Legacy `wp-content/uploads/...` paths could remain live without a reusable repository rule explaining when that was acceptable.
- There was no durable default that told maintainers whether a new downloadable file belonged under `/media/...` or under a legacy upload path.

### New behavior

- Canonical editorial links for site-hosted downloadable files use `/media/...` by default.
- Legacy `wp-content/uploads/...` routes are compatibility-only surfaces, not preferred editorial targets.
- Any live legacy compatibility route must map to one canonical `/media/...` destination and be traceable in migration policy artifacts.
- Compatibility copies are temporary by default and move to Phase 6 edge redirects once redirect rules are live, one-hop validated, and covered by rollback planning.
- Permanent legacy keep behavior is allowed only as an explicit owner-approved exception.

## Convention rules

| Scenario | Required canonical URL | Legacy URL handling | Notes |
|---|---|---|---|
| New downloadable file | `/media/...` | None unless required by migration policy | Default authoring rule |
| Migrated downloadable file with legacy backlinks or bookmarks | `/media/...` | Temporary compatibility asset or approved keep exception | Must have owner, rationale, and target mapping |
| Legacy compatibility asset after Phase 6 edge redirect is live | `/media/...` | Replace static copy with edge redirect unless explicit keep exception remains | Removal requires runtime verification |
| Exception that must stay directly downloadable at the legacy path | `/media/...` plus approved legacy path | Keep legacy route as explicit exception | Must be documented in manifest and policy artifacts |

## Impact

- Content authors and maintainers have one default rule for future downloads: link to `/media/...`, not `wp-content/uploads/...`.
- SEO and migration reviewers can treat legacy upload routes as exceptions that need explicit rationale rather than as a normal publishing pattern.
- Phase 6 redirect planning has a clear target state for compatibility-copy removal without reopening the canonical URL decision.

## Verification

For any new or updated downloadable asset:

1. Confirm authored content links to the canonical `/media/...` path.
2. If a legacy compatibility route remains live, confirm it is represented in `migration/url-manifest.json` and `migration/reports/phase-5-non-html-policy.csv`.
3. Run `npm run build:prod`.
4. Run `npm run check:internal-links` to verify the canonical `/media/...` link resolves from the built article output.
5. Run `npm run check:non-html-policy` whenever legacy compatibility routes or non-HTML policy rows change.
6. During Phase 6, do not remove a compatibility asset until the edge redirect is live, single-hop verified, and rollback steps are documented.

## Related files

- `analysis/documentation/phase-5/rhi-058-non-html-resource-seo-controls-implementation-2026-03-13.md`
- `analysis/tickets/phase-5/RHI-058-non-html-resource-seo-controls.md`
- `analysis/plan/details/phase-6.md`
- `analysis/tickets/phase-6/INDEX.md`
- `migration/url-manifest.json`
- `migration/reports/phase-5-non-html-policy.csv`
- `migration/reports/phase-5-internal-links-audit.csv`

## Assumptions and open questions

- This convention applies to site-hosted downloadable files such as PDFs and similar non-HTML assets exposed through article content.
- Phase 6 will decide which compatibility routes become redirects and which, if any, remain owner-approved permanent exceptions.
- The current three RHI-058 PDFs remain valid compatibility exceptions unless a later Phase 6 decision changes their policy explicitly.