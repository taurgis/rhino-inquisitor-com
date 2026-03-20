# Phase 8 Validation Contract

## Purpose

This directory holds the machine-readable and human-readable validation artefacts that Phase 8 workstreams produce. RHI-083 creates the scaffold only. RHI-084 and later tickets must replace placeholders with real datasets, reports, and execution metadata.

## Bootstrap scope

RHI-083 commits the output locations that downstream Phase 8 tickets expect:

- `url-parity-report.json`
- `redirect-quality-report.json`
- `seo-consistency-report.json`
- `robots-sitemap-report.json`
- `structured-data-report.json`
- `social-preview-report.json`
- `performance-budget-report.json`
- `accessibility-axe-report.json`
- `accessibility-manual-checklist.md`
- `html-conformance-report.json`
- `https-security-report.json`
- `lhci-report/`
- `report-schema/`
- `runs/`

## Ownership

| Artifact | Owning ticket |
|----------|---------------|
| `expected-url-outcomes.json` | RHI-084 |
| `sample-matrix.json` | RHI-084 |
| `priority-routes.json` | RHI-084 |
| `url-parity-report.json` | RHI-085 |
| `redirect-quality-report.json` | RHI-085 |
| `seo-consistency-report.json` | RHI-086 |
| `robots-sitemap-report.json` | RHI-086 |
| `structured-data-report.json` | RHI-087 |
| `social-preview-report.json` | RHI-087 |
| `lhci-report/` | RHI-088 |
| `performance-budget-report.json` | RHI-088 |
| `accessibility-axe-report.json` | RHI-089 |
| `accessibility-manual-checklist.md` | RHI-089 |
| `html-conformance-report.json` | RHI-089 |
| `https-security-report.json` | RHI-090 |

## RC metadata convention

- Record per-run metadata under `validation/runs/`.
- Use one metadata file per RC ref once the canonical RC is confirmed.
- Include the RC tag or SHA, environment mode, build timestamp, and any workflow or gate run URLs.

## Placeholder policy

- Placeholders must be overwritten by the owning Phase 8 workstream.
- Until the RC is fixed, placeholder reports must keep `status: "placeholder"` and null RC fields.
- Do not treat placeholder files as passing evidence.