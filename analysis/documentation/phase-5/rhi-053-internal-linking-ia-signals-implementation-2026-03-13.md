# RHI-053 Internal Linking and Information Architecture Signals Implementation

Date: 2026-03-13
Ticket: `analysis/tickets/phase-5/RHI-053-internal-linking-ia-signals.md`

## Change summary

RHI-053 now has a dedicated Phase 5 internal-link audit gate, a committed CSV audit artifact, blocking CI integration for PR and deploy workflows, backward-compatible support for the legacy `check:links` command, targeted content fixes for deprecated internal page routes, and a taxonomy hub fix that keeps preserved empty category routes discoverable instead of orphaned.

## Why this changed

The repository already had a lightweight internal-link existence check, but it did not satisfy the Phase 5 IA contract. It did not resolve relative links, distinguish canonical page-link defects from legacy non-HTML asset carryovers, report inbound-link or click-depth data, or enforce orphan-page detection on the built output. That left a gap where redirect-source links, disconnected preserved category routes, and missing IA evidence could survive until late SEO sign-off.

## Behavior details

### Old behavior

- The repo exposed `npm run check:links`, backed by `scripts/check-links.js`, which only checked slash-prefixed internal links against built-file existence.
- There was no dedicated `scripts/seo/check-internal-links.js`, no `npm run check:internal-links` command, and no Phase 5 internal-links CSV artifact.
- PR and deploy workflows ran the older `check:links` gate and did not upload a Phase 5 internal-links report.
- The category hub page only rendered taxonomy terms with active term counts, which left preserved empty category routes such as `/category/external/` and `/category/linkedin/` orphaned even though they were intentionally kept.
- A few article bodies still linked to deprecated merge-source routes or a placeholder path, which created true IA defects on built output.

### New behavior

- `scripts/seo/check-internal-links.js` now crawls built HTML in `public/`, extracts all internal anchors with `cheerio`, resolves relative links per source route, checks built-target existence, detects deprecated `merge` and `retire` manifest source links, flags legacy internal hosts and `wp-content` paths, builds an inbound-link graph, computes homepage click depth, identifies orphan and homepage-unreachable indexable pages, and writes `migration/reports/phase-5-internal-links-audit.csv` with per-link and per-page rows.
- Blocking behavior is now aligned to RHI-053 scope: HTML IA defects, critical-template defects, navigation and breadcrumb defects, missing critical routes, and orphan/unreachable indexable pages fail the gate; legacy non-HTML `wp-content` carryovers are still reported but remain warning-only for later non-HTML follow-up.
- `package.json` now exposes `npm run check:internal-links`, while `npm run check:links` remains available as a compatibility alias.
- `.github/workflows/build-pr.yml` and `.github/workflows/deploy-pages.yml` now run `npm run check:internal-links` and upload `migration/reports/phase-5-internal-links-audit.csv` as part of the validation artifact set.
- The staged migration PR lane now runs the same checker in `subset` mode with manifest-target allowances so partial-build validation remains useful without turning incomplete staged content into false orphan failures.
- `src/layouts/_default/taxonomy.html` now includes preserved zero-count category routes from `src/content/categories/**` in the topic-hub grid, so intentionally kept category URLs remain internally discoverable even before content is backfilled.
- Deprecated content links were corrected in:
  - `src/content/posts/understanding-sfcc-instances.md`
  - `src/content/posts/new-apis-and-features-for-a-headless-sfcc.md`
  - `src/content/posts/salesforce-b2c-commerce-cloud-content-erd.md`

## Impact

- Maintainers now have a dedicated Phase 5 IA audit artifact in `migration/reports/phase-5-internal-links-audit.csv` for PR evidence, deploy evidence, and Phase 5 sign-off.
- Route-sensitive PRs and production deploys now fail before release if canonical page-link defects, navigation or breadcrumb link errors, missing critical routes, or indexable orphan pages reappear.
- Preserved empty category routes are no longer disconnected from the category hub, which keeps route-preservation work and IA signals aligned.
- The audit currently reports `33` warning-only legacy non-HTML media references. These do not block RHI-053 closure and remain visible for follow-up under the non-HTML/media workstreams.

## Verification

- `npm run build:prod`
- `npm run check:internal-links`
- `CHECK_LINKS_PUBLIC_DIR=public CHECK_INTERNAL_LINKS_MODE=subset npm run check:internal-links`
- `npm run check:links`

Observed results on 2026-03-13:

- Production build: passed; Hugo generated `223` HTML routes (`204` pages, `17` paginator pages, `4` aliases)
- Full internal-link gate: passed with `0` blocking findings and `33` warning-only findings; `migration/reports/phase-5-internal-links-audit.csv` written
- Subset compatibility mode: passed with `0` blocking findings and `28` warning-only findings
- Legacy alias command: passed and executed the new gate successfully with `0` blocking findings and `33` warning-only findings

## Related files

- `scripts/seo/check-internal-links.js`
- `scripts/check-links.js`
- `package.json`
- `.github/workflows/build-pr.yml`
- `.github/workflows/deploy-pages.yml`
- `src/layouts/_default/taxonomy.html`
- `src/content/posts/understanding-sfcc-instances.md`
- `src/content/posts/new-apis-and-features-for-a-headless-sfcc.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-content-erd.md`
- `migration/reports/phase-5-internal-links-audit.csv`
- `analysis/tickets/phase-5/RHI-053-internal-linking-ia-signals.md`

## Assumptions and open questions

- Warning-only legacy `wp-content` and other non-HTML internal asset references remain intentionally visible in the report and are not treated as RHI-053 blocking defects because their ownership sits with later non-HTML/media validation work.
- The representative orphan set is the full indexable production build, per user-owner clarification during implementation.
