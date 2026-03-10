# RHI-035 Front Matter Mapping Implementation

## Change summary

RHI-035 is now closed with a validated front matter mapping stage for Phase 4. The mapper reads converted JSON records from `migration/output/`, writes deterministic Markdown files under `migration/output/content/`, emits a header-only `migration/reports/frontmatter-errors.csv` for the validated release-candidate run, and produces a deterministic discovery coverage report.

## Why this changed

Phase 4 needed an auditable handoff between converted Markdown bodies and Hugo-ready content files. Without a validated mapping stage, downstream URL, SEO, and pilot-batch work would be forced to reason about front matter from partially assembled data or accept silent route and alias regressions.

## Behavior details

Old behavior:

- The repository already exposed `npm run migrate:map-frontmatter`, but the mapper came from the RHI-106 discovery-metadata work and had not been reconciled against the full RHI-035 closure criteria.
- Query-style legacy aliases such as `/?p=11627` were emitted directly into front matter, which caused generated-content validation to fail because the approved Phase 2 contract only allows path-only Hugo aliases.
- The mapper did not explicitly hard-fail empty titles or duplicate output file paths.
- The discovery coverage report used wall-clock generation time, so the report artifact drifted between identical reruns.

New behavior:

- `scripts/migration/map-frontmatter.js` still maps all non-category `keep` and `merge` converted records, but now hard-fails empty titles, checks duplicate output file paths, and keeps the discovery coverage report deterministic across reruns.
- The mapper now excludes non-path legacy aliases from front matter emission. On the validated 2026-03-10 full run, 123 query-style `/?p=` aliases were intentionally excluded because they are not Hugo alias-page compatible and violate the approved Phase 2 path-only alias contract.
- Generated-content validation is now explicitly performed against `migration/output/content/` with `node scripts/validate-frontmatter.js --content-dir migration/output/content`, rather than the default authored-content root under `src/content/`.
- The validated full run mapped 171 records into `migration/output/content/` and reported 0 discovery-enriched records in the current corpus.
- The mapper now emits `heroImage` when the converted record carries a verified `_raw.extracted.featuredImageUrl`. On the validated 2026-03-10 run, that produces hero-banner source URLs for all 150 staged posts and 8 staged pages with true featured-image metadata. Local `/media/...` rewriting remains downstream media work in RHI-037.
- The approved Phase 2 contract remains authoritative for content-type-specific fields: `date`, `categories`, and `tags` are required for posts, while pages continue to omit post-only taxonomy fields and may omit `date`.

## Impact

- RHI-036 can now build URL and redirect validation on top of a stable `url` contract and Hugo-safe alias emission.
- Pilot and batch execution can use `migration/output/content/` as a reproducible staging set instead of assuming the authored-content validator covers generated files.
- RHI-037 inherits a clear boundary: featured-image recovery and local asset rewriting remain media work, not front matter route assembly work.
- RHI-037 still owns local asset rewriting and download validation, but true featured-image metadata is now available upstream so front matter can expose hero-banner intent before media localization.

## Verification

- Ran `npm run migrate:map-frontmatter` successfully on the full converted dataset.
- Verified the validated run mapped 171 keep/merge non-category records into `migration/output/content/`.
- Verified `migration/reports/frontmatter-errors.csv` exists and contains header-only output (1 line total).
- Verified `node scripts/validate-frontmatter.js --content-dir migration/output/content` passed for all 171 generated Markdown files.
- Verified rerun stability by hashing all generated Markdown files plus `migration/reports/frontmatter-errors.csv` and `migration/reports/discovery-metadata-coverage.json` before and after a repeat run; hashes remained unchanged.
- Verified a 10-file spot check against representative source records confirmed exact `url` mapping, correct `draft` derivation, non-empty descriptions within the 155-character cap, and clean omission of optional `params` and `aliases` when absent.
- Verified representative staged files now include `heroImage` when source records carry verified featured-image linkage, including `real-time-inventory-checks-in-sfcc`, `a-dev-guide-to-combating-fraud-on-sfcc`, `kickstart-guide-for-new-sfcc-developers`, and `your-definitive-mobile-app-checklist`.

## Related files

- `scripts/migration/map-frontmatter.js`
- `docs/migration/RUNBOOK.md`
- `migration/output/content/`
- `migration/reports/frontmatter-errors.csv`
- `migration/reports/discovery-metadata-coverage.json`
- `analysis/tickets/phase-4/RHI-035-front-matter-mapping.md`
- `analysis/tickets/phase-4/INDEX.md`
- `analysis/tickets/INDEX.md`