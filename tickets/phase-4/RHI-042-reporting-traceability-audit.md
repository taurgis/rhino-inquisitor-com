## RHI-042 · Workstream K — Reporting, Traceability, and Audit

**Status:** Open  
**Priority:** High  
**Estimate:** M  
**Phase:** 4  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-17  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Build the migration reporting framework that produces per-item status records and aggregated quality reports for every batch run. Reports must be machine-generated, reproducible, and attached to CI artifacts so that every migration decision is inspectable at any point — both during execution and in post-launch audits.

Traceability is not optional. If a piece of content is missing from the site after launch or an SEO regression appears, the migration report is the first document that must explain what happened to that URL and why.

---

### Acceptance Criteria

- [ ] Migration item report script `scripts/migration/generate-report.js` exists and:
  - [ ] Reads normalized records from `migration/intermediate/records.normalized.json`
  - [ ] Reads outputs from each pipeline stage (conversion, front matter, URL parity, media, links, SEO, a11y, security)
  - [ ] Produces `migration/reports/migration-item-report.csv` with per-item columns:
    - [ ] `source_id`
    - [ ] `source_url`
    - [ ] `target_file`
    - [ ] `target_url`
    - [ ] `disposition`
    - [ ] `conversion_mode` (`markdown`, `html-fallback`, `manual`)
    - [ ] `media_status` (`ok`, `missing`, `hotlink`)
    - [ ] `seo_status` (`pass`, `warn`, `fail`)
    - [ ] `a11y_status` (`pass`, `warn`, `fail`)
    - [ ] `security_status` (`pass`, `warn`, `fail`)
    - [ ] `url_parity_status` (`pass`, `fail`)
    - [ ] `qa_status` (`ready`, `review-required`, `blocked`)
    - [ ] `owner`
  - [ ] Is idempotent — re-running the report generator on the same inputs produces identical output
  - [ ] Is referenced in `package.json` as `npm run migrate:report`
- [ ] Blocking threshold enforcement script or integration is implemented:
  - [ ] Reads the migration item report
  - [ ] Enforces zero-tolerance thresholds: URL parity failures, missing required front matter, unintended `noindex`
  - [ ] Enforces batch cap thresholds: HTML fallback conversions, a11y warnings
  - [ ] Exits with non-zero code if any zero-tolerance threshold is breached
  - [ ] Is referenced in `package.json` as `npm run check:migration-thresholds`
- [ ] All report CSV files are produced and attached to CI artifacts:
  - [ ] `migration/reports/migration-item-report.csv`
  - [ ] `migration/reports/url-parity-report.csv`
  - [ ] `migration/reports/conversion-fallbacks.csv`
  - [ ] `migration/reports/media-integrity-report.csv`
  - [ ] `migration/reports/frontmatter-errors.csv`
  - [ ] `migration/reports/seo-completeness-report.csv`
  - [ ] `migration/reports/a11y-content-warnings.csv`
  - [ ] `migration/reports/security-content-scan.csv`
  - [ ] `migration/reports/link-rewrite-log.csv`
- [ ] CI pipeline (from RHI-029) is updated to:
  - [ ] Run `npm run migrate:report` as part of the migration batch validation job
  - [ ] Run `npm run check:migration-thresholds` as a blocking gate
  - [ ] Upload all `migration/reports/` CSV files as build artifacts (retained for 7 days minimum)
- [ ] `csv-stringify` is used for all CSV serialization (consistent column ordering and escaping)

---

### Tasks

- [ ] Design report schema with migration owner and SEO owner:
  - [ ] Confirm `qa_status` classification rules (`ready` / `review-required` / `blocked`)
  - [ ] Confirm batch cap values for HTML fallbacks and a11y warnings per batch
  - [ ] Record agreed thresholds in `docs/migration/RUNBOOK.md`
- [ ] Create `scripts/migration/generate-report.js`:
  - [ ] Implement per-stage status aggregation (read each stage's output report)
  - [ ] Implement `qa_status` rollup logic
  - [ ] Implement CSV serialization using `csv-stringify`
- [ ] Create `scripts/migration/check-migration-thresholds.js`:
  - [ ] Read `migration-item-report.csv`
  - [ ] Implement threshold checks with configurable caps (read from a config object or `.env`-style config)
  - [ ] Exit 1 on any zero-tolerance breach; print actionable error message with record IDs
- [ ] Update CI workflow (`.github/workflows/build-pr.yml` from RHI-029) to include report generation and threshold check:
  - [ ] Add `npm run migrate:report` step after migration scripts run
  - [ ] Add `npm run check:migration-thresholds` as a blocking gate before Hugo build
  - [ ] Add artifact upload step for `migration/reports/`
- [ ] Add script references to `package.json`:
  - [ ] `"migrate:report": "node scripts/migration/generate-report.js"`
  - [ ] `"check:migration-thresholds": "node scripts/migration/check-migration-thresholds.js"`
- [ ] Run report generation on pilot batch (RHI-043); verify all reports are populated and thresholds enforced
- [ ] Commit report framework scripts, CI updates, and `package.json`

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
| RHI-032 Done — Extraction complete; `extract-summary.json` available for report input | Ticket | Pending |
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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

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

---

### Notes

- The migration item report is the single audit trail that connects every WordPress source record to its Hugo output. It must be produced and attached to every batch PR's CI artifacts — not just the final batch.
- Threshold values must be agreed with the migration owner before the pilot batch (RHI-043). Do not run batches with unspecified thresholds.
- The report generator depends on consistent output from all stage scripts. Define the per-stage report schemas before stage scripts are written (in WS-B, each stage should write its report to a known path and format).
- Reference: `analysis/plan/details/phase-4.md` §Workstream K: Reporting, Traceability, and Audit
