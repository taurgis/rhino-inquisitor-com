# RHI-042 Reporting, Traceability, and Audit - 2026-03-11

## Change summary

Implemented the Phase 4 reporting framework that aggregates normalized records, converted-record outputs, staged Markdown, and the existing stage reports into a deterministic per-item audit CSV. Added a threshold gate script, CI migration-batch validation job, and runbook documentation for the approved threshold contract and artifact retention behavior.

## Why this changed

Before this work, Phase 4 produced many stage-specific reports but no single item-level audit trail and no reusable batch gate that could block a pilot or later batch on agreed failure conditions. Reviewers could inspect individual artifacts, but they could not answer “what happened to this source record?” from one machine-generated report.

## Behavior details

### Old behavior

- No `npm run migrate:report` command existed.
- No `migration/reports/migration-item-report.csv` file existed.
- No `npm run check:migration-thresholds` gate existed.
- The PR workflow did not run a migration-batch validation path for `migration/output/content/` and did not upload `migration/reports/` artifacts for 7-day audit review.

### New behavior

- `scripts/migration/generate-report.js` now builds `migration/reports/migration-item-report.csv` from:
  - `migration/intermediate/records.normalized.json`
  - `migration/output/*.json`
  - staged Markdown under `migration/output/content/`
  - stage reports under `migration/reports/`
- The item report is deterministic and currently emits 331 rows on the validated full corpus.
- `scripts/migration/check-migration-thresholds.js` now enforces the owner-approved batch gate:
  - zero tolerance for URL parity failures on file-backed migrated content rows
  - zero tolerance for required front matter failures
  - zero tolerance for unintended `noindex`
  - cap of `5` HTML fallback rows
  - cap of `25` item rows with a11y warnings
- Generated taxonomy and other non-file-backed rows still remain visible in the item report as blocked or review-needed status when route parity is unresolved, but the threshold gate excludes them from zero-tolerance blocking because they are outside the migration-owned per-file content contract.
- `package.json` now exposes:
  - `npm run migrate:report`
  - `npm run check:migration-thresholds`
- `.github/workflows/build-pr.yml` now includes a `migration-batch-validation` job that runs:
  - `npm run migrate:finalize-content`
  - `npm run migrate:report`
  - `npm run check:migration-thresholds`
  - a staged Hugo production build from `migration/output/content`
  - an explicit required-artifact existence check before upload so CI fails if the expected migration report bundle is incomplete
- The report generator now treats both `applied` and `already-current` curated correction audit rows as `content_corrections_status=corrected`, so idempotent reruns do not erase the fact that a record belongs to the curated-correction set.
- The PR workflow now uploads `migration/reports/` with `retention-days: 7` even if the threshold gate fails.

## Impact

- Phase 4 batches now have a machine-generated per-item audit trail instead of only stage-specific CSVs and JSON summaries.
- The pilot batch and later batches can use a reusable blocking gate before PR review and manual approval.
- GitHub Actions now preserves the migration report bundle long enough for owner review, CI investigation, and post-batch audit follow-up.

## Verification

- `node --check scripts/migration/generate-report.js`
- `node --check scripts/migration/check-migration-thresholds.js`
- `node scripts/migration/generate-report.js`
  - generated `331` item rows
  - `ready: 179`
  - `review-required: 152`
  - `blocked: 0`
- `node scripts/migration/check-migration-thresholds.js`
  - passed with `0/5` HTML fallback rows
  - passed with `2/25` a11y warning rows

## Related files

- `scripts/migration/generate-report.js`
- `scripts/migration/check-migration-thresholds.js`
- `.github/workflows/build-pr.yml`
- `package.json`
- `docs/migration/RUNBOOK.md`

