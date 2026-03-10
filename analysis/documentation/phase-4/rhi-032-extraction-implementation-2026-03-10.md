# RHI-032 Extraction Implementation - 2026-03-10

## Change summary

Implemented the first Phase 4 extraction workflow in `scripts/migration/extract.js`, added the `npm run migrate:extract` entry point, and documented the operational contract in the migration runbook.

## Why this changed

RHI-032 is the pipeline entry point for all Phase 4 migration work. Without a deterministic extraction layer, downstream normalization, conversion, front matter mapping, and reporting work would be forced to re-parse source artifacts or guess at provenance.

## Behavior details

Old behavior:

- Phase 4 had no extraction script.
- `migration/intermediate/` had no extraction dataset, summary, or quarantine artifacts.
- The runbook had only a placeholder for Phase 4 migration execution.

New behavior:

- `scripts/migration/extract.js` auto-discovers the approved Phase 4 source artifacts or accepts explicit CLI overrides.
- The extractor parses the WXR export with `fast-xml-parser`, preserves CDATA-backed HTML fields, and emits deterministic JSON artifacts.
- SQL supplementation is available for recovery when the approved dump contains content records that are missing from WXR. On the current validated dump, the extraction run completed without additional SQL-recovered records.
- Filesystem verification is available for upload-backed attachment and body-media references when the approved `wp-content` snapshot is present.
- Coverage now follows the owner-confirmed scope of source-backed content routes only. Blocking coverage is based on source-backed evidence such as post/page/video sitemap provenance, WXR taxonomy terms, and uploads-backed attachment paths. System, feed, query, homepage, pagination, and synthetic index routes are reported separately instead of blocking the extraction run.

## Impact

- Phase 4 now has a concrete extraction command surface for pilot and full runs.
- Downstream Phase 4 tickets can consume a stable raw extraction dataset from `migration/intermediate/extract-records.json` instead of reading source artifacts directly.
- Missing or malformed source records are visible through a quarantine artifact instead of being silently lost.

## Verification

- Run `npm run migrate:extract`.
- Review `migration/intermediate/extract-summary.json` for source-channel selection, counts by type and status, and coverage results.
- Review `migration/intermediate/extract-quarantine.json` for any malformed records.
- Confirm `migration/intermediate/extract-records.json` is stable across repeat runs on unchanged source artifacts.

## Related files

- `scripts/migration/extract.js`
- `package.json`
- `docs/migration/RUNBOOK.md`
- `migration/intermediate/extract-records.json`
- `migration/intermediate/extract-summary.json`
- `migration/intermediate/extract-quarantine.json`

## Assumptions and open questions

- WXR remains the primary structured source unless a later run proves a coverage or field-fidelity gap that requires REST supplementation.
- SQL recovery is intentionally additive: it fills missing records or fields rather than overriding populated WXR values when recoverable content exists in the approved dump.
- Filesystem verification is scoped to upload-backed media evidence and does not expand Phase 4 into plugin or theme migration.