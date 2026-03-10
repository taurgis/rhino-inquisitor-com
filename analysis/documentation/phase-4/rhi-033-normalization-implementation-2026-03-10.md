# RHI-033 Normalization Implementation

## Change summary

RHI-033 now has a working canonical record schema and normalization pipeline. The implementation adds a Zod-owned record contract, a deterministic `npm run migrate:normalize` entry point, and generated normalization artifacts under `migration/intermediate/`.

## Why this changed

Phase 4 needed a stable machine-validated contract between extraction and every downstream workstream. Without a canonical normalized dataset, Workstreams C through F would each have to re-parse extraction output and make their own URL, timestamp, and taxonomy decisions.

## Behavior details

Old behavior:
- Phase 4 stopped at extraction artifacts only.
- No schema-validated canonical record model existed.
- No deterministic join from extracted records to manifest-backed `targetUrl` and `disposition` existed.

New behavior:
- `scripts/migration/schemas/record.schema.js` defines the canonical record contract with Zod and enforces relative-path, URL, and disposition rules.
- `scripts/migration/normalize.js` joins extracted records to `migration/url-manifest.json`, normalizes status, timestamps, taxonomy slugs, aliases, and media references, and writes deterministic JSON artifacts.
- Required coverage follows the owner-approved `source-backed-content-only` scope from RHI-032. On the validated 2026-03-10 full run, 192 required `keep` or `merge` manifest entries normalized successfully with zero schema errors.
- Manifest-backed `retire` records normalize with explicit `targetUrl: null`.
- Extracted records without any manifest row are not silently dropped: they are reported in `normalize-summary.json` under `normalizationNotes.skippedWithoutManifest` and remain outside the required coverage denominator.

## Impact

- Downstream migration workstreams can now consume `migration/intermediate/records.normalized.json` instead of extraction output directly.
- URL intent is centralized in normalization before HTML conversion or front matter generation begins.
- Audit visibility improves because timestamp fallbacks, status transforms, and skipped unmatched records are all summarized in a deterministic artifact.

## Verification

- Ran `npm run migrate:normalize` successfully.
- Verified `migration/intermediate/normalize-errors.json` is empty.
- Verified `migration/intermediate/normalize-summary.json` reports:
  - `requiredManifestCount: 192`
  - `normalizedRequiredCount: 192`
  - `keepMergeMissingTargetUrlCount: 0`
  - `blockingErrorCount: 0`
- Verified `records.normalized.json` is generated and populated.
- Planned rerun stability verification is part of the ticket closeout validation.

## Related files

- `scripts/migration/schemas/record.schema.js`
- `scripts/migration/normalize.js`
- `package.json`
- `docs/migration/RUNBOOK.md`
- `migration/intermediate/records.normalized.json`
- `migration/intermediate/normalize-summary.json`
- `migration/intermediate/normalize-errors.json`