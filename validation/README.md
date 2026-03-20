# Phase 8 Validation Contract

## Purpose

This directory holds the machine-readable and human-readable validation artefacts that Phase 8 workstreams produce. RHI-083 created the scaffold only. RHI-084 now freezes the first RC-backed dataset contract so WS-B through WS-H can consume one auditable input set instead of inferring routes or schemas from ticket prose.

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

## RHI-084 Dataset Contract

RHI-084 introduces four authoritative artefacts for the first frozen Phase 8 RC:

| Artifact | Purpose | Primary consumers |
| --- | --- | --- |
| `migration/phase-8-rc-record.md` | Human-readable RC freeze record, toolchain versions, build evidence, and inherited deploy timing | WS-B through WS-H |
| `validation/runs/phase-8-rc-v1.json` | Machine-readable RC snapshot with build metrics and dataset checksums | WS-B through WS-H |
| `validation/expected-url-outcomes.json` | Legacy-URL contract derived from the frozen manifest | WS-B |
| `validation/sample-matrix.json` | Representative page and auxiliary route matrix for template-family coverage | WS-C through WS-F |
| `validation/priority-routes.json` | Priority route set from organic and backlink baselines, with class coverage supplements | WS-B through WS-H |

### `expected-url-outcomes.json`

Top-level fields:

- `schema_version`: current schema version for the file.
- `generated_at`: ISO timestamp for the dataset generation run.
- `rc`: RC tag/commit plus the frozen Phase 6 manifest tag/commit.
- `summary`: total row count, disposition counts, blocking-vs-accepted-risk counts, and query-string exception totals.
- `entries`: one row per manifest entry from `migration/url-manifest.json`.

Per-entry fields:

- `legacy_url`, `target_url`, `disposition`, `redirect_code`, `url_class`, `priority`, `implementation_layer`, `has_organic_traffic`, `has_external_links`, `source`
- `canonical_expectation`: the intended migration outcome for the legacy URL.
- `build_validation`: the Pages/Hugo validation contract that downstream scripts should enforce.

Important behavior detail:

- `canonical_expectation` preserves the migration intent (`200`, `301`, `404`/`410 where supported`).
- `build_validation` records what WS-B can actually verify against the built Pages artifact.
- Query-string legacy URLs are recorded as `build_validation.scope = "accepted-risk"` and `build_validation.mode = "request-aware-exception"` because the owner-approved Phase 6 Model A posture does not reproduce request-aware query routes with Hugo aliases alone.
- Non-query `keep`, alias-backed `merge`, and `retire` rows remain `build_validation.scope = "blocking"`.

### `sample-matrix.json`

Top-level fields:

- `schema_version`, `generated_at`, `rc`
- `selection_policy`: deterministic selection rules used to build the matrix.
- `page_samples`: homepage, 10 most-recent posts, archive routes, category routes, legal/privacy routes, video-capable pages, video-capable posts, and landing pages.
- `auxiliary_samples`: taxonomy roots, redirect helpers, error pages, and system outputs.
- `template_family_coverage`: explicit coverage statement for each live family and whether it is `covered`, `missing`, `not-present`, or `not-retained`.

Important behavior detail:

- `page_samples` are the main inputs for SEO, schema, performance, accessibility, and content-facing gates.
- `auxiliary_samples` prevent downstream tickets from losing coverage for taxonomy roots, redirect helpers, the 404 output, `robots.txt`, `sitemap.xml`, and feed/JSON discovery outputs.
- The `landing-page` family is currently `not-retained` because the frozen manifest contains no `keep` or `merge` rows for `url_class = landing`.

### `priority-routes.json`

Top-level fields:

- `schema_version`, `generated_at`, `rc`
- `selection_method`: organic source rule, backlink source rule, deduplication rule, supplement rule, and tie-breaker.
- `coverage`: required URL classes, represented classes, and classes added through coverage supplements.
- `ranked_sets`: ordered route lists for `organic`, `backlink`, and `coverage_supplements`.
- `routes`: the merged route records with per-source rank metadata.

Per-route fields:

- `route`, `final_target_url`, `disposition`, `expected_outcome`, `url_class`, `priority`
- `source`: one or more baseline-source records with rank and metrics.
- `coverage_supplement_for_url_class`: null for ranked rows; populated when a route exists only to guarantee class coverage.
- `selection_reason`: human-readable provenance.

Important behavior detail:

- Organic routes are taken from the 90-day top-pages-by-clicks table in `migration/phase-1-seo-baseline.md`.
- Backlink routes are taken from the Search Console top linked target pages table in the same baseline file, which is the repository's current backlink baseline of record.
- If the ranked sets miss a required URL class, RHI-084 adds one deterministic supplement for that class rather than mutating the baseline ranking order.

## Downstream Consumption Rules

1. WS-B must load `validation/expected-url-outcomes.json` first and treat `build_validation.scope = "blocking"` rows as hard gate inputs.
2. WS-B must still report `accepted-risk` query-string rows for coverage, but it must not treat them as missing build artifacts when the dataset marks them as `request-aware-exception`.
3. WS-B must use `validation/priority-routes.json` for route-level spot checks after loading the expected outcomes dataset.
4. WS-C through WS-F should start from `validation/sample-matrix.json` page samples, then include auxiliary routes when their gate touches redirect helpers, taxonomy roots, 404 behavior, feeds, JSON, `robots.txt`, or `sitemap.xml`.
5. WS-H should use `migration/phase-8-rc-record.md` plus `validation/runs/phase-8-rc-v1.json` as the RC provenance layer for go/no-go evidence.

## WS-B Report Contract

RHI-085 replaces the placeholder WS-B outputs with committed machine-readable evidence:

- `validation/url-parity-report.json` records one result row per entry in `validation/expected-url-outcomes.json`, preserving the canonical migration intent (`200`, `301`, `404`) while passing or failing against the Pages-specific `build_validation` contract.
- `validation/redirect-quality-report.json` records redirect integrity for all `merge` rows, priority-route spot-check evidence from `validation/priority-routes.json`, non-HTML coverage, and redirect-retention policy confirmation.
- Both reports must retain the frozen RC tag and commit from the expected-outcomes dataset so downstream reviewers can distinguish RC-scoped evidence from later branch-state builds.

## WS-C Report Contract

RHI-086 replaces the placeholder WS-C outputs with committed machine-readable SEO and crawl-control evidence:

- `validation/seo-consistency-report.json` records sampled indexable-route checks from `validation/sample-matrix.json` plus HTML-backed priority-route coverage from `validation/priority-routes.json`, including canonical count, canonical URL, sitemap agreement, robots directives, title and description presence, advisory metadata-length warnings, and duplicate-title results across the full build.
- `validation/robots-sitemap-report.json` records sitemap protocol validation, alias-helper exclusion evidence, robots.txt directive analysis, sitemap-blocking `Disallow` findings, and the full set of built HTML routes carrying `noindex`.
- Both WS-C reports include `artifactProvenance` so reviewers can distinguish frozen-RC evidence from later branch-state reruns that still consume the frozen datasets.
- `validation/seo-consistency-report.json` treats missing title or description, unexpected `noindex`, canonical drift, and duplicate non-pagination titles as blocking failures. Metadata-length guidance remains warning-only by owner decision.
- `validation/robots-sitemap-report.json` treats invalid sitemap URLs, sitemap protocol-limit violations, alias-helper inclusion, missing or incorrect `Sitemap:` directives, and `robots.txt` blocks on sitemap URLs as blocking failures.
- Both WS-C reports must retain the frozen RC tag and commit from `validation/sample-matrix.json` so downstream reviewers can tie SEO evidence back to the exact release-candidate snapshot.

Important provenance rule:

- If content, metadata, or configuration changes occur after the RC freeze, WS-C may still produce branch-state reports against the frozen datasets for debugging or closeout preparation, but those reports must not be treated as refreshed RC evidence until a new RC tag is cut and the datasets are regenerated.

## RC metadata convention

- Record per-run metadata under `validation/runs/`.
- Use one metadata file per RC ref once the canonical RC is confirmed.
- RHI-084 establishes `validation/runs/phase-8-rc-v1.json` as the first machine-readable RC snapshot and `migration/phase-8-rc-record.md` as the authoritative human-readable freeze record.
- Include the RC tag or SHA, environment mode, build timestamp, dataset checksums, and any workflow or gate run URLs.

## Placeholder policy

- Placeholders must be overwritten by the owning Phase 8 workstream.
- Until the RC is fixed, placeholder reports must keep `status: "placeholder"` and null RC fields.
- Do not treat placeholder files as passing evidence.