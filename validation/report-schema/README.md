# Phase 8 Validation Report Schemas

Use this directory for JSON schemas or contract notes that define the structure of Phase 8 validation datasets and reports.

## WS-B Report Notes

RHI-085 replaces the bootstrap placeholders with two committed JSON report contracts:

- `validation/url-parity-report.json`
	- top-level metadata: `phase`, `ticket`, `artifact`, `status`, `rcTag`, `rcSha`, `generatedAt`, `publicDir`
	- dataset provenance: `dataset.path`, `dataset.generatedAt`, `dataset.summary`
	- run summary: `summary.totalEntries`, blocking vs accepted-risk totals, pass/fail counts, per-mode counts, and per-outcome counts
	- per-entry rows: one row per `validation/expected-url-outcomes.json` entry, preserving canonical intent (`expectedStatus`, expected targets) and build-validation results (`mode`, `scope`, `actualOutcome`, `result`)

- `validation/redirect-quality-report.json`
	- top-level metadata: same RC and artifact fields as the parity report
	- priority-route provenance: `priorityRoutes.path`, `priorityRoutes.generatedAt`, `priorityRoutes.routeCount`
	- policy evidence: `retentionPolicy`
	- run summary: redirect totals, blocking failures, chain/loop counts, priority-route failures, and non-HTML blocking failures
	- detailed sections: `redirects`, `priorityRouteChecks`, and `nonHtmlCoverage`

## Model Notes

1. Canonical migration intent remains visible through `expectedStatus` and the dataset's `canonical_expectation` fields.
2. Blocking pass/fail is determined by the Phase 8 `build_validation` contract, not by assuming GitHub Pages can prove origin-level `301` or `410` responses.
3. Query-string request-aware routes remain visible as `accepted-risk` coverage rows under the owner-approved Phase 6 Model A posture.