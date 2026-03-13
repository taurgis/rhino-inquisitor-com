# RHI-058 Non-HTML Resource SEO Controls Implementation

Date: 2026-03-13
Ticket: `analysis/tickets/phase-5/RHI-058-non-html-resource-seo-controls.md`

## Change summary

Added a repo-backed non-HTML policy generator at `scripts/seo/build-non-html-policy.js`, committed `migration/reports/phase-5-non-html-policy.csv`, added `npm run check:non-html-policy`, aligned the report with the approved feed compatibility policy from RHI-051, and preserved all three owner-required article PDFs as canonical `/media/...pdf` downloads while keeping their legacy `wp-content/uploads` paths as compatibility assets.

## Why this changed

Before this change, RHI-058 had no committed policy artifact even though the manifest already contained many attachment and feed decisions. The repository also had a mismatch between the RHI-051 feed continuity decision and the manifest default retire state for `/feed/`, and a small set of migrated posts still linked to manifest-tracked legacy upload URLs instead of their current `/media/...` equivalents or preserved download targets. This change turns the owner-approved RHI-058 policy into a reproducible artifact and Phase 6 handoff source.

## Behavior details

### Old behavior

- `migration/reports/phase-5-non-html-policy.csv` did not exist.
- The repo had no dedicated command for generating or validating the non-HTML policy artifact.
- The manifest still defaulted `/feed/` to `retire` even though RHI-051 had already implemented `/feed/`, `/feed/rss/`, and `/feed/atom/` as Pages-compatible compatibility helpers to `/index.xml`.
- Manifest-tracked legacy upload URLs still appeared in a small set of source posts as image click targets or PDF links.
- The first implementation iteration preserved two PDFs directly at legacy paths and redirected the third Einstein PDF to its article because the standalone binary was not yet recoverable.

### New behavior

- `npm run check:non-html-policy` generates `migration/reports/phase-5-non-html-policy.csv` from the committed manifest, media manifest, source content URLs, and built `public/` artifact.
- Attachment URLs with exact migrated media replacements now resolve in the policy report as `redirect` rows targeting the current `/media/...` asset path, with `implementation_layer: edge-cdn` to record the required Phase 6 redirect handoff.
- The three owner-required legacy article PDFs now resolve in the policy report as `keep` rows with `implementation_layer: pages-static`, and each binary is published both as a canonical `/media/...pdf` article download and as a legacy `wp-content/uploads/...` compatibility asset.
- `/feed/`, `/feed/rss/`, and `/feed/atom/` are recorded as compatibility redirects to `/index.xml`; all other legacy feed variants remain retired.
- The affected source posts no longer depend on manifest-tracked legacy image and PDF upload URLs.

## Impact

- Maintainers now have a reproducible RHI-058 artifact and command instead of a one-off spreadsheet process.
- Phase 6 has an explicit handoff list: every `edge-cdn` row in `migration/reports/phase-5-non-html-policy.csv` requires infrastructure-owned redirect implementation.
- The built site now preserves all three owner-required PDF attachments as canonical `/media/...pdf` downloads while keeping the legacy upload paths available for backward compatibility.

## Verification

- `npm run build:prod`
- `npm run check:non-html-policy`
- `npm run check:redirects:seo`
- The generator validates all committed `src/static/` files are present in `public/`, verifies that kept PDF attachments exist in built output, and fails if any non-kept manifest-tracked legacy attachment URL still appears in built HTML.

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

- All three legacy PDFs are intentionally preserved as direct static compatibility downloads because the owner required them to remain attached in the articles.
- The Einstein PDF binary was recovered from the Internet Archive because the production `wp-content/uploads` URL had already fallen to `404`.
- Legacy `.mov` and `.mp4` upload URLs still present in source content were not part of the manifest-backed RHI-058 attachment inventory and were not changed in this ticket.