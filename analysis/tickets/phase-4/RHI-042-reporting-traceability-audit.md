## RHI-042 · Workstream K — Reporting, Traceability, and Audit

**Status:** Done  
**Priority:** High  
**Estimate:** M  
**Phase:** 4  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-17  
**Created:** 2026-03-07  
**Updated:** 2026-03-11

---

### Goal

Build the migration reporting framework that produces per-item status records and aggregated quality reports for every batch run. Reports must be machine-generated, reproducible, and attached to CI artifacts so that every migration decision is inspectable at any point — both during execution and in post-launch audits.

Traceability is not optional. If a piece of content is missing from the site after launch or an SEO regression appears, the migration report is the first document that must explain what happened to that URL and why.

---

### Acceptance Criteria

- [x] Migration item report script `scripts/migration/generate-report.js` exists and:
  - [x] Reads normalized records from `migration/intermediate/records.normalized.json`
  - [x] Reads outputs from each pipeline stage (conversion, front matter, media, content corrections, links, URL parity, SEO, a11y, security)
  - [x] Produces `migration/reports/migration-item-report.csv` with per-item columns:
    - [x] `source_id`
    - [x] `primary_source_type`
    - [x] `source_channel_set`
    - [x] `source_url`
    - [x] `target_file`
    - [x] `target_url`
    - [x] `disposition`
    - [x] `conversion_mode` (`markdown`, `html-fallback`, `manual`)
    - [x] `media_status` (`ok`, `missing`, `hotlink`)
    - [x] `seo_status` (`pass`, `warn`, `fail`)
    - [x] `a11y_status` (`pass`, `warn`, `fail`)
    - [x] `security_status` (`pass`, `warn`, `fail`)
    - [x] `url_parity_status` (`pass`, `fail`)
    - [x] `content_corrections_status` (`clean`, `corrected`, `review-required`)
    - [x] `qa_status` (`ready`, `review-required`, `blocked`)
    - [x] `owner`
  - [x] Is idempotent — re-running the report generator on the same inputs produces identical output
  - [x] Is referenced in `package.json` as `npm run migrate:report`
- [x] Blocking threshold enforcement script or integration is implemented:
  - [x] Reads the migration item report
  - [x] Enforces zero-tolerance thresholds: URL parity failures, missing required front matter, unintended `noindex`
  - [x] Enforces batch cap thresholds: HTML fallback conversions, a11y warnings
  - [x] Exits with non-zero code if any zero-tolerance threshold is breached
  - [x] Is referenced in `package.json` as `npm run check:migration-thresholds`
- [x] All required report artifacts are produced and attached to CI artifacts in their specified formats:
  - [x] `migration/reports/migration-item-report.csv`
  - [x] `migration/reports/url-parity-report.csv`
  - [x] `migration/reports/conversion-fallbacks.csv`
  - [x] `migration/reports/media-integrity-report.csv`
  - [x] `migration/reports/frontmatter-errors.csv`
  - [x] `migration/reports/seo-completeness-report.csv`
  - [x] `migration/reports/feed-compatibility-report.csv`
  - [x] `migration/reports/a11y-content-warnings.csv`
  - [x] `migration/reports/accessibility-scan-summary.md`
  - [x] `migration/reports/security-content-scan.csv`
  - [x] `migration/reports/link-rewrite-log.csv`
  - [x] `migration/reports/content-corrections-summary.json`
  - [x] `migration/reports/image-alt-corrections-audit.csv`
- [x] CI pipeline (from RHI-029) is updated to:
  - [x] Run `npm run migrate:report` as part of the migration batch validation job
  - [x] Run `npm run check:migration-thresholds` as a blocking gate
  - [x] Run report generation only after `npm run migrate:finalize-content` (or the explicit `rewrite-media -> rewrite-links -> apply-corrections` sequence) has completed for the batch under test
  - [x] Upload all `migration/reports/` artifacts (CSV and Markdown) as build artifacts (retained for 7 days minimum)
- [x] `csv-stringify` is used for all CSV serialization (consistent column ordering and escaping)

---

### Tasks

- [x] Design report schema with migration owner and SEO owner:
  - [x] Confirm `qa_status` classification rules (`ready` / `review-required` / `blocked`)
  - [x] Confirm `content_corrections_status` rollup rules from `migration/reports/content-corrections-summary.json` and `migration/reports/image-alt-corrections-audit.csv`
  - [x] Confirm batch cap values for HTML fallbacks and a11y warnings per batch
  - [x] Confirm how source-channel provenance is surfaced in per-item reporting and extract summaries
  - [x] Record agreed thresholds in `docs/migration/RUNBOOK.md`
- [x] Create `scripts/migration/generate-report.js`:
  - [x] Implement per-stage status aggregation (read each stage's output report)
  - [x] Merge correction-stage outputs into per-item reporting so reviewers can see whether a record was corrected, stayed clean, or still needs review
  - [x] Implement `qa_status` rollup logic
  - [x] Implement CSV serialization using `csv-stringify`
- [x] Create `scripts/migration/check-migration-thresholds.js`:
  - [x] Read `migration-item-report.csv`
  - [x] Implement threshold checks with configurable caps (read from a config object or `.env`-style config)
  - [x] Exit 1 on any zero-tolerance breach; print actionable error message with record IDs
- [x] Update CI workflow (`.github/workflows/build-pr.yml` from RHI-029) to include report generation and threshold check:
  - [x] Add `npm run migrate:report` step after `npm run migrate:finalize-content` completes for the batch
  - [x] Add `npm run check:migration-thresholds` as a blocking gate before Hugo build
  - [x] Add artifact upload step for `migration/reports/`
- [x] Add script references to `package.json`:
  - [x] `"migrate:report": "node scripts/migration/generate-report.js"`
  - [x] `"check:migration-thresholds": "node scripts/migration/check-migration-thresholds.js"`
- [x] Run report generation on pilot batch (RHI-043); verify all reports are populated and thresholds enforced
- [x] Commit report framework scripts, CI updates, and `package.json`

---

### Out of Scope

- Creating the individual stage check scripts (those belong to WS-C through WS-J)
- Designing the content of individual audit reports (those are defined in each respective workstream)
- Post-launch analytics or reporting (Phase 9)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-031 Done — Phase 4 Bootstrap complete | Ticket | Pending |
| RHI-032 Done — Extraction complete; `extract-summary.json` with source-channel metadata available for report input | Ticket | Pending |
| RHI-029 Done — CI pipeline in place for workflow update | Ticket | Pending |
| `csv-stringify` installed | Tool | Pending |
| All stage check scripts (RHI-034 through RHI-041) available as inputs | Ticket | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Stage scripts produce inconsistent output formats, making aggregation difficult | Medium | Medium | Define report field names as a shared contract in `scripts/migration/schemas/` before each stage writes its report | Engineering Owner |
| Threshold config is hardcoded, making it difficult to adjust per batch | Low | Low | Use a config object or environment variable for threshold values; document in RUNBOOK | Engineering Owner |
| CI artifact upload step fails silently, leaving reports unavailable for review | Low | Medium | Test artifact upload on dry-run before pilot batch; verify reports are downloadable from Actions UI | Engineering Owner |
| `migration-item-report.csv` file size becomes unwieldy for large record sets | Low | Low | Use `csv-stringify` streaming output; test with full normalized record set size before pilot | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-042 is complete. The reporting framework, threshold gate, and CI artifact upload path are implemented and validated locally and in GitHub Actions workflow run `22955229784` on commit `81799adf4b92c02f6d3afc427501df3e99d36a86`. The remote `migration-batch-validation` job succeeded in `1m 8s`, and the workflow uploaded the `migration-reports-22955229784` artifact (`115 KB`, digest `sha256:2c75ccad3b003a5672b0661277b605bae8ae7c8834401393e9fc5066979a6669`).

**Delivered artefacts:**

- `scripts/migration/generate-report.js`
- `scripts/migration/check-migration-thresholds.js`
- Updated `.github/workflows/build-pr.yml` with report and threshold check steps
- `package.json` updated with `migrate:report` and `check:migration-thresholds` scripts
- Threshold config documented in `docs/migration/RUNBOOK.md`

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-11 | In Progress | Implemented `migrate:report` and `check:migration-thresholds`, updated the PR workflow to run the reporting gate and upload `migration/reports/` artifacts for 7 days, documented the threshold contract in the runbook, and validated the local batch path. Remote workflow execution and artifact-download confirmation remain pending before closeout. |
| 2026-03-11 | Done | Verified GitHub Actions workflow run `22955229784` on commit `81799ad` succeeded, including the `migration-batch-validation` job and uploaded `migration-reports-22955229784` artifact. |

---

### Notes

- The migration item report is the single audit trail that connects every WordPress source record to its Hugo output. It must preserve which approved source channels contributed to each record and be attached to every batch PR's CI artifacts — not just the final batch.
- Threshold values must be agreed with the migration owner before the pilot batch (RHI-043). Do not run batches with unspecified thresholds.
- The report generator depends on consistent output from all stage scripts. Define the per-stage report schemas before stage scripts are written (in WS-B, each stage should write its report to a known path and format).
- The correction stage is now part of the auditable pipeline contract. Batch reporting must include `migration/reports/content-corrections-summary.json` and `migration/reports/image-alt-corrections-audit.csv`, not treat Markdown cleanup as invisible manual work.
- Reference: `analysis/plan/details/phase-4.md` §Workstream K: Reporting, Traceability, and Audit
