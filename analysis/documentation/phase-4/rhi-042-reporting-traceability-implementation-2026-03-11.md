# RHI-042 Reporting, Traceability, and Audit - 2026-03-11

## Change summary

Implemented the Phase 4 reporting framework that aggregates normalized records, converted-record outputs, staged Markdown, and the existing stage reports into a deterministic per-item audit CSV. Added a threshold gate script, CI migration-batch validation job, and runbook documentation for the approved threshold contract and artifact retention behavior.

## Why this changed

Before this work, Phase 4 produced many stage-specific reports but no single item-level audit trail and no reusable batch gate that could block a pilot or later batch on agreed failure conditions. Reviewers could inspect individual artifacts, but they could not answer “what happened to this source record?” from one machine-generated report.

## Behavior details

### Old behavior


### New behavior

  - `migration/intermediate/records.normalized.json`
  - `migration/output/*.json`
  - staged Markdown under `migration/output/content/`
  - stage reports under `migration/reports/`
  - zero tolerance for URL parity failures on file-backed migrated content rows
  - zero tolerance for required front matter failures
  - zero tolerance for unintended `noindex`
  - cap of `5` HTML fallback rows
  - cap of `25` item rows with a11y warnings
  - `npm run migrate:report`
  - `npm run check:migration-thresholds`
  - `npm run migrate:finalize-content`
  - `npm run migrate:report`
  - `npm run check:migration-thresholds`
  - a staged Hugo production build from `migration/output/content`
  - an explicit required-artifact existence check before upload so CI fails if the expected migration report bundle is incomplete

## Impact


## Verification

  - generated `331` item rows
  - `ready: 179`
  - `review-required: 152`
  - `blocked: 0`
  - passed with `0/5` HTML fallback rows
  - passed with `2/25` a11y warning rows

## Related files


