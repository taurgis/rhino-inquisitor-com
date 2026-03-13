# RHI-058 Non-HTML Resource SEO Controls Implementation

Date: 2026-03-13
Ticket: `analysis/tickets/phase-5/RHI-058-non-html-resource-seo-controls.md`

## Change summary

Added a repo-backed non-HTML policy generator at `scripts/seo/build-non-html-policy.js`, committed `migration/reports/phase-5-non-html-policy.csv`, added `npm run check:non-html-policy`, aligned the report with the approved feed compatibility policy from RHI-051, and removed manifest-tracked legacy `wp-content/uploads` attachment dependencies from the affected source posts.

## Why this changed

Before this change, RHI-058 had no committed policy artifact even though the manifest already contained many attachment and feed decisions. The repository also had a mismatch between the RHI-051 feed continuity decision and the manifest default retire state for `/feed/`, and a small set of migrated posts still linked to manifest-tracked legacy upload URLs instead of their current `/media/...` equivalents or retired text. This change turns the owner-approved RHI-058 policy into a reproducible artifact and Phase 6 handoff source.

## Behavior details

### Old behavior

- `migration/reports/phase-5-non-html-policy.csv` did not exist.
- The repo had no dedicated command for generating or validating the non-HTML policy artifact.
- The manifest still defaulted `/feed/` to `retire` even though RHI-051 had already implemented `/feed/`, `/feed/rss/`, and `/feed/atom/` as Pages-compatible compatibility helpers to `/index.xml`.
- Manifest-tracked legacy upload URLs still appeared in a small set of source posts as image click targets or PDF links.

### New behavior

- `npm run check:non-html-policy` generates `migration/reports/phase-5-non-html-policy.csv` from the committed manifest, media manifest, source content URLs, and built `public/` artifact.
- Attachment URLs with exact migrated media replacements now resolve in the policy report as `redirect` rows targeting the current `/media/...` asset path, with `implementation_layer: edge-cdn` to record the required Phase 6 redirect handoff.
- High-signal legacy PDFs now resolve in the policy report as `redirect` rows targeting their owning article pages because the standalone PDF binaries are no longer present in the repo.
- `/feed/`, `/feed/rss/`, and `/feed/atom/` are recorded as compatibility redirects to `/index.xml`; all other legacy feed variants remain retired.
- The affected source posts no longer depend on manifest-tracked legacy image and PDF upload URLs.

## Impact

- Maintainers now have a reproducible RHI-058 artifact and command instead of a one-off spreadsheet process.
- Phase 6 has an explicit handoff list: every `edge-cdn` row in `migration/reports/phase-5-non-html-policy.csv` requires infrastructure-owned redirect implementation.
- The built site no longer relies on manifest-tracked legacy attachment URLs for the updated image and PDF references.

## Verification

- `npm run build:prod`
- `npm run check:non-html-policy`
- The generator validates all committed `src/static/` files are present in `public/` and fails if any manifest-tracked legacy attachment URL still appears in built HTML.

## Related files

- `scripts/seo/build-non-html-policy.js`
- `package.json`
- `migration/reports/phase-5-non-html-policy.csv`
- `analysis/tickets/phase-5/RHI-058-non-html-resource-seo-controls.md`
- `analysis/tickets/phase-5/INDEX.md`
- `analysis/tickets/phase-5/RHI-060-phase-5-signoff.md`
- `src/content/posts/why-circumventing-sfcc-quota-limits-is-a-bad-idea.md`
- `src/content/posts/ai-wont-steal-your-sfcc-job-but-a-developer-using-ai-will.md`
- `src/content/posts/getting-to-know-sfra-as-a-developer.md`
- `src/content/posts/slicing-versus-variation-groups-in-sfcc.md`
- `src/content/posts/ai-einstein-in-salesforce-b2c-commerce-cloud.md`

## Assumptions and open questions

- The three remaining legacy PDF URLs are intentionally handled as redirect-to-article outcomes because no standalone PDF files are present in the repository.
- Legacy `.mov` and `.mp4` upload URLs still present in source content were not part of the manifest-backed RHI-058 attachment inventory and were not changed in this ticket.