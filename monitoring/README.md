# Phase 9 Monitoring Artifacts

This directory holds the Phase 9 cutover and stabilization artifacts defined in RHI-093.

## Status values

- `not-started`: the artifact stub exists but no live run has been recorded yet.
- `pass`: the latest run completed with no blocking findings.
- `warn`: the latest run completed with non-blocking findings that still require follow-up.
- `fail`: the latest run found a blocking issue or the run itself failed.

## Shared report contract

All JSON reports in this directory use these top-level fields:

- `runTimestamp`
- `environment`
- `commitSha`
- `status`
- `owner`
- `findings`

Markdown reports mirror the same metadata in their header sections.

## Artifact list

- `launch-cutover-log.md`: chronological launch-window log for DNS, deployment, validation, and incident decisions.
- `search-console-indexing-report.md`: launch-day and stabilization indexing observations for the canonical Search Console property.
- `url-inspection-sample-report.json`: sampled URL Inspection outcomes for priority live URLs.
- `sitemap-processing-report.json`: sitemap fetch, parse, and canonical-only validation results.
- `legacy-route-health-report.json`: sampled legacy-URL resolution and redirect-health results.
- `canonical-consistency-report.json`: live canonical-host and self-referential canonical checks.
- `cwv-lighthouse-trend.json`: launch-week Lighthouse trend data for representative templates.
- `cwv-field-trend.md`: Search Console/Core Web Vitals field trend notes and week-over-week interpretation.
- `security-domain-report.json`: HTTPS, mixed-content, and domain-verification findings.
- `stabilization-summary.md`: weekly stabilization narrative and handoff summary.

## Bootstrap status

RHI-093 bootstrap is complete. The scaffold is ready, the launch command model has been assigned for the current single-operator team, and the Search Console API probe remains available for future runtime verification even though a live API call was not required for bootstrap closure.