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

## WS-C Report Notes

RHI-086 replaces the bootstrap placeholders with two committed JSON report contracts:

- `validation/seo-consistency-report.json`
	- top-level metadata: `phase`, `ticket`, `artifact`, `status`, `rcTag`, `rcSha`, `generatedAt`, `publicDir`
	- artifact provenance: `artifactProvenance.gitHead`, `artifactProvenance.workspaceDirty`, `artifactProvenance.matchesDatasetRc`, and `artifactProvenance.provenanceStatus`
	- dataset provenance: `sampleMatrix.path`, `sampleMatrix.generatedAt`, `priorityRoutes.path`, `priorityRoutes.generatedAt`, `sitemap.path`, `sitemap.urlCount`
	- policy metadata: `policy.canonicalHost`, pagination duplicate-title exception, and metadata severity rules
	- run summary: sampled route counts, checked vs skipped totals, pass/fail counts, blocking failure count, warning count, duplicate-title counts, and environment-diagnostic count
	- detailed sections: `entries`, `duplicateTitles`, `environmentDiagnostics`, and `expectedNoindexRoutes`

- `validation/robots-sitemap-report.json`
	- top-level metadata: same RC and artifact fields as the SEO consistency report
	- artifact provenance: same `artifactProvenance` object as the SEO consistency report
	- sitemap evidence: `sitemap.rootPath`, `sitemap.expectedUrl`, `sitemap.documents`, `sitemap.unresolvedChildren`, and `sitemap.entries`
	- robots evidence: `robots.present`, `robots.sitemapDirectives`, `robots.wildcardRules`, `robots.disallowedSitemapRoutes`, and blocking `robots.findings`
	- crawl-control coverage: `noindexPages`, `aliasPages`, `summary`, and top-level `blockingFindings`

## WS-C Model Notes

1. Priority routes that resolve only to system or redirect-helper outputs can be reported as `skipped` in the SEO consistency report when they are not indexable HTML pages.
2. Duplicate titles remain blocking unless every duplicate is a paginated route with a self-canonical URL.
3. Metadata length guidance remains advisory-only; missing metadata remains blocking.
4. `rcTag` and `rcSha` identify the frozen dataset lineage. Use `artifactProvenance` to determine whether a given report was produced from that exact RC artifact or from later branch-state rerun evidence.