## Scope

PR evidence package for the final local RHI-043 pilot state after the scripted remediation rerun, the durable About-page content override, the refreshed reports, and the focused final review pass.

Linked ticket: `analysis/tickets/phase-4/RHI-043-pilot-batch-migration.md`

## Pilot batch composition

- Selected source IDs: `73`, `1077`, `category:12`, `2`, `3089`, `68`, `12435`, `2265`, `11658`, `10642`, `8698`, `1389`, `2770`, `7979`, `528`, `2942`, `12231`, `14004`, `4455`, `9316`
- Output shape: 14 posts, 4 pages, 1 taxonomy-generated category route, and 1 retire route
- Coverage goals met: homepage, standard article, long-form article, embedded-media/article-image content, page content, video page, category route, redirect scenario, and retire route

## About-page source trace and curation path

- Record traced to sourceId `68` with legacy URL `/about/`
- Verified source artifact: WXR-derived body in `migration/output/68.json` and `migration/intermediate/extract-records.json`
- Root cause: source-content quality defect in the legacy WordPress page, not a pipeline defect
- Owner decision: author replacement now
- Durable implementation path:
  - `migration/input/body-overrides.json`
  - `migration/input/body-overrides/about.md`
  - `scripts/migration/apply-content-corrections.js` now applies page-level body and optional description overrides during the correction pass
- Outcome: `/about/` now renders authored replacement copy with local media paths and a curated description, and the correction rerun remains idempotent

## Validation summary

Local final-state checks completed successfully against `tmp/rhi043-final-public`:

| Check | Result | Evidence |
|---|---|---|
| Hugo production build | Pass | `hugo --minify --environment production --contentDir migration/output/content --destination tmp/rhi043-final-public` |
| Front matter validation | Pass | `npm run validate:frontmatter -- --content-dir migration/output/content` |
| URL parity | Pass | `node scripts/migration/validate-url-parity.js --scope selected-records --records-file migration/intermediate/records.normalized.json --content-dir migration/output/content --public-dir tmp/rhi043-final-public` |
| Redirect validation | Pass | `node scripts/migration/check-redirects.js --scope selected-records --records-file migration/intermediate/records.normalized.json --public-dir tmp/rhi043-final-public` |
| SEO completeness | Pass with warnings | `migration/reports/seo-completeness-report.csv` shows 0 failures and 14 warnings |
| Feed compatibility | Pass | `npm run check:feed-compatibility -- --public-dir tmp/rhi043-final-public` |
| Media integrity | Pass | `npm run check:media -- --content-dir migration/output/content --public-dir tmp/rhi043-final-public` |
| Internal links | Pass | `CHECK_LINKS_PUBLIC_DIR=tmp/rhi043-final-public CHECK_LINKS_ALLOW_MANIFEST_TARGETS=1 npm run check:links` |
| Accessibility content | Pass | `npm run check:a11y-content -- --content-dir migration/output/content` reported 0 blocking findings and 0 warnings |
| Security content | Pass | `node scripts/migration/check-security-content.js --content-dir migration/output/content --records-dir migration/output --public-dir tmp/rhi043-final-public` reported 0 critical findings and 0 warnings |
| noindex check | Pass | `CHECK_NOINDEX_PUBLIC_DIR=tmp/rhi043-final-public npm run check:noindex` |
| Migration thresholds | Pass | `npm run check:migration-thresholds` |
| Retire route | Pass | `/sample-page/` absent from the final build |
| Canonical delta route | Pass | `/delta-exports-in-salesforce-b2c-commerce-cloud/` present in the final build |

## Correction-pass evidence

- `migration/reports/content-corrections-summary.json`
  - `filesChanged: 0` on the final rerun
  - `bodyOverridesApplied: 1`
- `migration/reports/image-alt-corrections-audit.csv`
- `migration/reports/link-text-corrections-audit.csv`

Idempotency confirmation:

- The final two consecutive `npm run migrate:apply-corrections` runs both reported `filesChanged: 0`

## Manual review summary

Focused final browser review completed against the final preview build for:

- `/about/`
- `/`
- `/a-beginners-guide-to-webdav-in-sfcc/`
- `/how-to-use-ocapi-scapi-hooks/`
- `/caching-in-the-sfcc-composable-storefront/`
- `/sitegenesis-vs-sfra-vs-pwa/`
- `/understanding-sfcc-instances/`
- `/delta-exports-in-salesforce-b2c-commerce-cloud/`

Results:

- About page now renders authored copy, updated description text, and separated local images
- WebDAV opening paragraph no longer splits the linked `Cloud` text
- Hooks article renders the leading `Info` banner as a note callout
- Caching article renders the reconstructed callouts correctly
- SiteGenesis and Instances descriptions render cleanly with preserved linked subject text
- Home page route still behaves correctly in the final sample set and retains the corrected staged payload
- No new manual-review blockers were found in the focused final pass

Manual review status:

- All 18 copied pilot Markdown files are locally approved after the final rerun

## Reporting nuance

`migration/reports/migration-item-report.csv` still reports `Ready: 4` and `Review-required: 16` under the current RHI-042 rollup rules. That state is expected because the report treats applied correction evidence and warning-level SEO findings as `review-required`; it does not indicate unresolved blocker defects in the reviewed pilot subset.

## Artifacts for PR description

- `analysis/tickets/phase-4/RHI-043-pilot-batch-migration.md`
- `analysis/documentation/phase-4/rhi-043-scripted-pilot-remediation-2026-03-11.md`
- `migration/reports/content-corrections-summary.json`
- `migration/reports/image-alt-corrections-audit.csv`
- `migration/reports/link-text-corrections-audit.csv`
- `migration/reports/migration-item-report.csv`
- `migration/reports/seo-completeness-report.csv`
- `migration/reports/feed-compatibility-report.csv`
- `migration/reports/media-integrity-report.csv`
- `migration/reports/a11y-content-warnings.csv`
- `migration/reports/security-content-scan.csv`

## Remaining open items

- Create the actual pull request
- Let GitHub PR checks run on the PR head commit
- Obtain migration-owner and engineering-owner sign-off before merge
