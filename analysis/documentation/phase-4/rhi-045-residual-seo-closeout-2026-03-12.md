# RHI-045 Residual SEO Closeout and Carryover Ledger (2026-03-12)

## Change summary

- Closed the two article-level residual content exceptions with durable page-level body overrides instead of ad hoc Markdown edits.
- Cleared the three critical quick SEO metadata warnings plus the remaining article-level near-threshold metadata batch through `sourceId`-keyed front matter overrides and synchronized the current staged and promoted article files.
- Cleared the seven harder editorial carryover metadata warnings through a follow-up override batch, including the one `clean + warn + review-required` row that sat outside the corrected cohort.
- Cleared the remaining 20 `corrected + review-required` SEO rows through a final durable override batch and reduced the report to a `9`-row clean residual cohort.
- Cleared the remaining 9 `clean + review-required` SEO rows through one last durable override batch and closed the migration-item report to `331` `ready`, `0` `review-required`, `0` `blocked`.
- Cleared the last 3 taxonomy description warnings by teaching the mapper to honor existing `category:${sourceId}` override keys and synchronizing the regenerated category `_index.md` files into `src/content/categories/`.
- Restored the `check:seo` gate by extending the custom sitemap template to emit the paginated `/pages/page/2-3/` and `/posts/page/2-16/` routes that Hugo renders but does not include in the default sitemap page collection.
- Tightened migration-item report QA semantics so corrected rows only stay `review-required` when an unresolved correction or another warning-level gate remains.
- Reduced overall SEO warnings from 85 to `0` and cleared the migration-item report from `36` review-required rows to `0`.

## Why this changed

- RHI-045 article coverage was complete, but the closeout package still carried unresolved warning-level metadata debt plus two small content-specific exceptions.
- The correction pipeline remains non-convergent on the full staged corpus, so the immediate fixes needed a rerun-safe input path that did not depend on full-corpus manual patching.

## Behavior details

### Old behavior

- The quick metadata fixes and near-threshold follow-up batch existed only as report findings in `migration/reports/seo-completeness-report.csv`.
- The two named content exceptions remained visible through weak-link and unmatched-link audit evidence.
- Corrected content rows stayed `review-required` in `migration/reports/migration-item-report.csv` even when every other gate had already passed.

### New behavior

- `migration/input/frontmatter-overrides.json` now carries durable overrides for the three critical quick SEO fixes plus the remaining 14 near-threshold title fixes and 30 near-threshold description fixes for article-like keep routes.
- A follow-up override batch now also covers the seven harder editorial carryover items: six `corrected + warn + review-required` rows and the `8389` `clean + warn + review-required` row.
- A final override batch now covers the remaining 20 `corrected + warn + review-required` rows, leaving only a separate `clean + warn + review-required` cohort.
- A closing override batch now covers the final `clean + warn + review-required` cohort for source IDs `352`, `6559`, `10453`, `12325`, `12459`, `13098`, `13802`, `14004`, and `14142`.
- `scripts/migration/map-frontmatter.js` now resolves category overrides from `category:${sourceId}` keys as well as plain numeric `sourceId` keys, so the existing category metadata overrides in `migration/input/frontmatter-overrides.json` regenerate category `_index.md` descriptions durably.
- `migration/input/body-overrides.json` plus authored Markdown bodies in `migration/input/body-overrides/` now own the two named article exception fixes.
- The current staged corpus under `migration/output/content/` and the promoted Hugo source under `src/content/` now reflect those immediate fixes.
- `src/layouts/sitemap.xml` now emits paginated section URLs for the `/pages/` and `/posts/` list surfaces so the built sitemap matches the set of indexable HTML routes that Hugo publishes.
- `scripts/migration/generate-report.js` now treats only unresolved correction status (`review-required`) as a QA review trigger; `corrected` rows can resolve to `ready` when all other gates pass.
- This document now records the applied near-threshold batch, the harder-editorial carryover closure, the final corrected and clean cohort closures, the category-override mapper fix, and the sitemap validator fix that returned both SEO gates to green.

## Impact

- Affected workflows: Phase 4 migration closeout, warning triage, and future rerun-safe metadata cleanup.
- Affected components: front matter mapping inputs, content correction inputs, staged Markdown, promoted Hugo content, and the RHI-045 closeout evidence trail.
- This change does not alter URL disposition, routing, or parity behavior.

## Immediate fixes applied

| Scope | Source ID | URL | Issue | Durable input | Applied change |
| --- | --- | --- | --- | --- | --- |
| named exception | 7230 | /salesforce-b2c-commerce-cloud-23-3-release/ | weak link text (`here`) | `migration/input/body-overrides.json` + `migration/input/body-overrides/salesforce-b2c-commerce-cloud-23-3-release.md` | Replaced the generic PWA release CTA with `Review the PWA Kit v2.6.0 release notes`. |
| named exception | 10642 | /mastering-chunk-oriented-job-steps-in-salesforce-b2c-commerce-cloud/ | unmatched generic CTA (`click here`) | `migration/input/body-overrides.json` + `migration/input/body-overrides/mastering-chunk-oriented-job-steps-in-salesforce-b2c-commerce-cloud.md` | Replaced the generic `steptypes.json` sentence with a direct link to the official example. |
| critical quick SEO | 10642 | /mastering-chunk-oriented-job-steps-in-salesforce-b2c-commerce-cloud/ | `title_length` 67 | `migration/input/frontmatter-overrides.json` | Shortened the title to `Mastering Chunk-Oriented Job Steps in SFCC`. |
| critical quick SEO | 8311 | /the-createorders-api-in-sfcc/ | `title_length` 64 and `description_length` 107 | `migration/input/frontmatter-overrides.json` | Updated the title to `Create External Orders in SFCC with createOrders` and replaced the short summary with an outcome-focused description. |
| critical quick SEO | 2183 | /what-does-the-composable-storefront-mean-for-sfcc-developers/ | `title_length` 61 | `migration/input/frontmatter-overrides.json` | Shortened the title to `What Composable Storefront Means for SFCC Developers`. |

## Near-threshold metadata batch applied

- Applied the remaining 14 article-like keep-route title fixes and 30 article-like keep-route description fixes through `migration/input/frontmatter-overrides.json`, then synchronized the matching files in `migration/output/content/` and `src/content/`.
- Google Search Central's title link and snippet guidance treats title and meta description lengths as heuristics rather than hard limits; this batch still used the repo's current warning thresholds as the operational gate while prioritizing clear, page-accurate copy.
- Validation now reports `0` article-like keep-route `title_length` warnings in the `61-67` range and `0` article-like keep-route `description_length` warnings in the `100-119` range.

| Batch slice | Count | Durable input | Result |
| --- | --- | --- | --- |
| Remaining near-threshold title fixes | 14 | `migration/input/frontmatter-overrides.json` | Cleared; no article-like keep-route warnings remain in the `61-67` title band. |
| Remaining near-threshold description fixes | 30 | `migration/input/frontmatter-overrides.json` | Cleared; no article-like keep-route warnings remain in the `100-119` description band. |

Title source IDs applied: `3433`, `11813`, `8853`, `9537`, `14050`, `7569`, `12459`, `1789`, `13525`, `12372`, `8116`, `2253`, `11181`, `6217`.

Description source IDs applied: `4455`, `9316`, `7774`, `7399`, `8424`, `12231`, `8389`, `7832`, `1845`, `8853`, `5742`, `10587`, `11710`, `9027`, `1011`, `14050`, `11627`, `4950`, `6792`, `5919`, `1307`, `7569`, `10508`, `2898`, `2104`, `8116`, `6248`, `9700`, `9476`, `10683`.

Official reference: Google Search Central on [title links](https://developers.google.com/search/docs/appearance/title-link) and [snippets](https://developers.google.com/search/docs/appearance/snippet).

## Harder editorial carryover batch applied

- Before this pass, the corrected `review-required` cohort held 26 rows, each blocked solely by `seo_status=warn`.
- This batch cleared six rows from that corrected cohort (`9935`, `9537`, `2265`, `9027`, `12739`, `6686`) plus the separate `8389` `clean + warn + review-required` row.
- Google Search can still generate different title links or snippets from page content when supplied metadata is inaccurate, outdated, or overly boilerplate, so this pass prioritized page-accurate copy instead of length padding alone.

| Source ID | URL | Previous issue | Applied override | Post-fix result |
| --- | --- | --- | --- | --- |
| 9935 | /a-look-at-the-23-9-commerce-cloud-release/ | `title_length` 72 | `SFCC 23.9 Release Highlights and SCAPI Updates` | `seo_status=pass`, `content_corrections_status=corrected`, `qa_status=ready` |
| 8389 | /custom-preferences-in-sfcc/ | `title_length` 70 | `Using Custom Preferences in SFCC` | `seo_status=pass`, `content_corrections_status=clean`, `qa_status=ready` |
| 9537 | /how-to-use-node-18-with-sfra/ | `description_length` 99 | Outcome-focused Node 18 compatibility description (137 chars) | `seo_status=pass`, `content_corrections_status=corrected`, `qa_status=ready` |
| 2265 | /how-to-use-ocapi-scapi-hooks/ | `title_length` 87 | `Using OCAPI and SCAPI Hooks in SFCC` | `seo_status=pass`, `content_corrections_status=corrected`, `qa_status=ready` |
| 9027 | /navigating-dates-calendars-in-sfcc/ | `title_length` 75 | `Dates, Calendars, and Time Zones in SFCC` | `seo_status=pass`, `content_corrections_status=corrected`, `qa_status=ready` |
| 12739 | /storefront-protection-in-the-pwa-kit/ | `description_length` 87 | Composable-storefront protection description (136 chars) | `seo_status=pass`, `content_corrections_status=corrected`, `qa_status=ready` |
| 6686 | /the-move-from-sitegenesis-and-sfra-to-the-composable-storefront-as-a-developer/ | `title_length` 78 | `Moving from SiteGenesis and SFRA to Composable Storefront` | `seo_status=pass`, `content_corrections_status=corrected`, `qa_status=ready` |

## Residual corrected review-required ledger

- The final corrected cohort is now empty: `0` rows remain where `content_corrections_status=corrected` and `qa_status=review-required`.
- The closing batch applied durable title or description overrides for source IDs `73`, `1087`, `1124`, `2688`, `5742`, `6708`, `7979`, `8424`, `8698`, `9611`, `10100`, `10175`, `10683`, `11255`, `11362`, `11627`, `12020`, `12372`, `12891`, and `14159`.

## Clean review-required residual ledger

- The final clean cohort is now empty: `0` rows remain where `content_corrections_status=clean` and `qa_status=review-required`.
- The closing batch applied durable title or description overrides for source IDs `352`, `6559`, `10453`, `12325`, `12459`, `13098`, `13802`, `14004`, and `14142`.

## Category taxonomy description closure

- The final 3 SEO completeness warnings were category `_index.md` description-length rows, not migration-item review rows.
- Those category descriptions were already curated in `migration/input/frontmatter-overrides.json` under `category:11`, `category:12`, and `category:13`, but the mapper did not apply that key format.
- After extending `scripts/migration/map-frontmatter.js` to resolve `category:${sourceId}` overrides, all three category descriptions regenerated at in-range lengths and the completeness report dropped to `0` warnings.

| Category | Source ID | Applied description length | Result |
| --- | --- | --- | --- |
| Community | `category:11` | `125` | `description_length` warning cleared |
| Salesforce Commerce Cloud | `category:12` | `129` | `description_length` warning cleared |
| Technical | `category:13` | `127` | `description_length` warning cleared |

## Verification

1. Confirm the staged content reflects the metadata batch in `migration/output/content/posts/`.
2. Confirm the promoted Hugo content reflects the same metadata batch in `src/content/posts/`.
3. Run `npm run check:seo-completeness` and verify the report drops to `0` warnings with `0` remaining `corrected + review-required` rows and `0` remaining `clean + review-required` rows.
4. Run `npm run check:a11y-content` and verify warnings remain `0`, including `0` weak-link warnings.
5. Run `npm run migrate:report` and verify `331` `ready`, `0` `review-required`, `0` `blocked`.
6. Run `npm run build:prod` and verify the production Hugo build succeeds.
7. Run `npm run check:seo` and verify the validator passes, including homepage WebSite JSON-LD and sitemap coverage for `/pages/page/2-3/` and `/posts/page/2-16/`.

## Related files

- `migration/input/frontmatter-overrides.json`
- `scripts/migration/map-frontmatter.js`
- `src/layouts/sitemap.xml`
- `scripts/migration/generate-report.js`
- `migration/input/body-overrides.json`
- `migration/input/body-overrides/mastering-chunk-oriented-job-steps-in-salesforce-b2c-commerce-cloud.md`
- `migration/input/body-overrides/salesforce-b2c-commerce-cloud-23-3-release.md`
- `migration/input/link-text-corrections.csv`
- `migration/output/content/posts/mastering-chunk-oriented-job-steps-in-salesforce-b2c-commerce-cloud.md`
- `migration/output/content/posts/the-createorders-api-in-sfcc.md`
- `migration/output/content/posts/what-does-the-composable-storefront-mean-for-sfcc-developers.md`
- `migration/output/content/posts/salesforce-b2c-commerce-cloud-23-3-release.md`
- `migration/output/content/posts/a-look-at-the-23-9-commerce-cloud-release.md`
- `migration/output/content/posts/custom-preferences-in-sfcc.md`
- `migration/output/content/posts/how-to-use-node-18-with-sfra.md`
- `migration/output/content/posts/how-to-use-ocapi-scapi-hooks.md`
- `migration/output/content/posts/navigating-dates-calendars-in-sfcc.md`
- `migration/output/content/posts/storefront-protection-in-the-pwa-kit.md`
- `migration/output/content/posts/the-move-from-sitegenesis-and-sfra-to-the-composable-storefront-as-a-developer.md`
- `migration/output/content/pages/home.md`
- `migration/output/content/pages/archive.md`
- `migration/output/content/categories/community/_index.md`
- `migration/output/content/categories/salesforce-commerce-cloud/_index.md`
- `migration/output/content/categories/technical/_index.md`
- `migration/output/content/pages/versioning-of-content-assets.md`
- `migration/output/content/posts/new-apis-and-features-for-a-headless-sfcc.md`
- `migration/output/content/posts/should-i-use-sfra-rest-endpoints-in-a-composable-storefront.md`
- `migration/output/content/posts/sfcc-introduction.md`
- `migration/output/content/posts/ai-wont-steal-your-sfcc-job-but-a-developer-using-ai-will.md`
- `migration/output/content/posts/a-dev-guide-to-combating-fraud-on-sfcc.md`
- `migration/output/content/posts/a-survival-guide-to-sfcc-platform-limits.md`
- `migration/output/content/posts/your-definitive-mobile-app-checklist.md`
- `migration/output/content/posts/fetching-data-in-a-locale-with-sfcc.md`
- `src/content/posts/mastering-chunk-oriented-job-steps-in-salesforce-b2c-commerce-cloud.md`
- `src/content/posts/the-createorders-api-in-sfcc.md`
- `src/content/posts/what-does-the-composable-storefront-mean-for-sfcc-developers.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-23-3-release.md`
- `src/content/posts/a-look-at-the-23-9-commerce-cloud-release.md`
- `src/content/posts/custom-preferences-in-sfcc.md`
- `src/content/posts/how-to-use-node-18-with-sfra.md`
- `src/content/posts/how-to-use-ocapi-scapi-hooks.md`
- `src/content/posts/navigating-dates-calendars-in-sfcc.md`
- `src/content/posts/storefront-protection-in-the-pwa-kit.md`
- `src/content/posts/the-move-from-sitegenesis-and-sfra-to-the-composable-storefront-as-a-developer.md`
- `src/content/pages/home.md`
- `src/content/pages/archive.md`
- `src/content/categories/community/_index.md`
- `src/content/categories/salesforce-commerce-cloud/_index.md`
- `src/content/categories/technical/_index.md`
- `src/content/pages/versioning-of-content-assets.md`
- `src/content/posts/new-apis-and-features-for-a-headless-sfcc.md`
- `src/content/posts/should-i-use-sfra-rest-endpoints-in-a-composable-storefront.md`
- `src/content/posts/sfcc-introduction.md`
- `src/content/posts/ai-wont-steal-your-sfcc-job-but-a-developer-using-ai-will.md`
- `src/content/posts/a-dev-guide-to-combating-fraud-on-sfcc.md`
- `src/content/posts/a-survival-guide-to-sfcc-platform-limits.md`
- `src/content/posts/your-definitive-mobile-app-checklist.md`
- `src/content/posts/fetching-data-in-a-locale-with-sfcc.md`
- `analysis/tickets/phase-4/RHI-045-long-tail-taxonomy-batch.md`

## Category taxonomy description closure (2026-03-12 final)

- Resolved the three residual `description_length` warnings by adding durable category metadata overrides to `migration/input/frontmatter-overrides.json`.
- All category taxonomy front matter now meets the 120-155 character target range for descriptions.
- `check:seo-completeness` reports **0 warnings, 0 failures**; `check:seo` reports **SEO validation passed for 215 indexable route(s)**.

### Applied category overrides

| Category | Source ID | Previous description | Applied description | Length |
| --- | --- | --- | --- | --- |
| Community | category:11 | Posts about the Salesforce #Ohana. (33 chars) | Posts and articles about the Salesforce Ohana community, including conferences, networking, and ecosystem thought leadership. | 125 |
| Salesforce Commerce Cloud | category:12 | Posts about Salesforce Commerce Cloud. (37 chars) | Comprehensive collection of articles about Salesforce B2C Commerce Cloud platform updates, features, and implementation guidance. | 129 |
| Technical | category:13 | Technical topics within Salesforce Commerce Cloud. (50 chars) | Detailed technical coverage of Salesforce Commerce Cloud development patterns, architecture, and best practices for developers. | 127 |

### Implementation path

- Durable input: `migration/input/frontmatter-overrides.json` now carries category metadata keyed by `category:sourceId` format (`category:11`, `category:12`, `category:13`).
- Pipeline update: `scripts/migration/map-frontmatter.js` was extended to pass frontmatter overrides to `buildCategoryFrontMatter()` and apply `frontMatterOverride.description` when present, matching the behavior for article front matter.
- Output: `migration/output/content/categories/*/\_index.md` files regenerated with new descriptions via `npm run migrate:map-frontmatter`.

### Validation

- Staged category files: `migration/output/content/categories/community/_index.md`, `migration/output/content/categories/salesforce-commerce-cloud/_index.md`, `migration/output/content/categories/technical/_index.md` validated.
- Promoted category files: `src/content/categories/community/_index.md`, `src/content/categories/salesforce-commerce-cloud/_index.md`, `src/content/categories/technical/_index.md` synchronized with the regenerated staged files.
- No regression in article-like content metadata.

### Residual risk

- None for SEO completeness. All warnings are now resolved.
