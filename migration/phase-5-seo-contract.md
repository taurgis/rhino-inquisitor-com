# Phase 5 SEO Contract

Date drafted: 2026-03-13  
Date finalized: 2026-03-13  
Owner: SEO Owner  
Related ticket: `analysis/tickets/phase-5/RHI-060-phase-5-signoff.md`

## Purpose

This contract freezes the Phase 5 SEO and discoverability decisions that Phase 6 and Phase 8 must treat as authoritative for launch-window planning, validation, and risk escalation. It consolidates the canonical policy, redirect signal baseline, sitemap and feed policy, structured-data coverage, monitoring runbook, and non-HTML controls into one handover artifact.

The contract baseline is the `main` branch production state captured at commit `d7cb968caf37bf1b5ac1066c35c32e637a26cfe1`, validated locally on 2026-03-13 between `2026-03-13T12:59:06Z` and `2026-03-13T13:02:44Z`, and publicly deployed in GitHub Actions run `23051490605`: `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23051490605`.

## Authoritative source artifacts

| Area | Source artifact | Contract role |
| --- | --- | --- |
| Canonical and metadata policy | `migration/phase-5-canonical-policy.md` | Defines canonical invariants and override restrictions for all indexable routes. |
| Redirect outcome and implementation layer baseline | `migration/phase-5-redirect-signal-matrix.csv` | Defines `keep`, `merge`, and `retire` outcomes plus Pages-static versus edge-layer handling. |
| Redirect validation evidence | `migration/reports/phase-5-redirect-validation.csv` | Confirms zero chain, loop, and broad-redirect defects on the current baseline. |
| Crawl and indexing controls | `migration/reports/phase-5-crawl-control-audit.csv` | Confirms production `robots.txt` and page-level robots directives are mutually consistent. |
| Sitemap and feed policy | `migration/phase-5-sitemap-feed-policy.md` | Freezes sitemap inclusion rules and feed compatibility behavior. |
| Structured-data contract | `migration/phase-5-structured-data-coverage.md` | Freezes schema types, scope, and validation expectations. |
| Monitoring and escalation runbook | `migration/phase-5-monitoring-runbook.md` | Defines Search Console monitoring, incident thresholds, and launch-week checks. |
| Non-HTML resource policy | `migration/reports/phase-5-non-html-policy.csv` | Records attachment and non-HTML keep, merge, retire, or edge requirements. |
| Pages artifact constraints evidence | `migration/reports/phase-5-pages-constraints-report.md` | Records GitHub Pages artifact size, structure, and `.nojekyll` compliance. |
| Phase 5 gate summary | `migration/reports/phase-5-gate-summary.csv` | Records the sign-off gate evidence for the current `main` baseline. |

## Frozen launch-window rules

### Canonical and metadata

- Every indexable route must emit exactly one absolute HTTPS canonical URL on `https://www.rhino-inquisitor.com/`.
- Canonical, `og:url`, sitemap URL, and internal-link destination must agree on scheme, host, path, and trailing slash.
- Canonical overrides remain exceptional, same-host only, and require explicit SEO-owner approval before they can change.
- Duplicate canonical tags, canonicals pointing to preview hosts, redirected URLs, or retired URLs remain release blockers.
- The current metadata baseline passed `npm run check:metadata` for `215` indexable pages with `0` blocking failures and `10` warning-only duplicate metadata advisories that remain visible in the audit report.

### Redirect and URL preservation

- `keep` routes must continue to render at their preserved final path.
- `merge` routes must resolve directly to the final target without chains, loops, or broad homepage redirects.
- `retire` routes must resolve to meaningful `404` behavior unless an approved equivalent destination exists.
- The current redirect validation baseline passed with `0` chain defects, `0` loop defects, and `0` broad redirects.
- The current indexed URL change rate is `41.96%` (`141 / 336`), which exceeds the approved `5%` escalation threshold. Phase 6 must therefore treat edge redirects as mandatory before launch; static Pages helpers are not sufficient as the final migration posture for all moved indexed URLs.
- Query-string redirects, flattened taxonomy redirects, and other rows already classified as `edge-cdn` in the redirect signal matrix are frozen as edge-owned implementation work, not open design questions.

### Crawlability and indexing

- Production `robots.txt` remains template-generated from `src/layouts/robots.txt`, not a static hand-edited artifact.
- Preview builds remain crawlable with page-level `noindex, nofollow`; production builds must not leak preview-host `noindex` directives.
- `robots.txt` is never used as a substitute for de-indexing decisions. Any page that relies on `noindex` must remain crawlable so crawlers can observe the directive.
- The current production crawl-control audit passed for `223` HTML routes with `0` unintended `noindex` defects and `0` `robots` or `noindex` contradictions.

### Sitemap, feed, and discovery surfaces

- The production sitemap target remains `https://www.rhino-inquisitor.com/sitemap.xml` and must only list canonical, indexable production URLs.
- Redirect helpers, 404 pages, preview-host pages, and other non-indexable surfaces must remain excluded from the production sitemap.
- `/feed/` remains the required legacy compatibility endpoint, with `/feed/rss/` and `/feed/atom/` preserved as compatibility variants to the same feed target until Phase 6 replaces them with edge rules.
- `/archive/`, `/video/`, and keep-disposition category routes with organic value remain preserved discovery surfaces.
- The current sitemap audit passed for `215` sitemap URLs with zero host-mismatch or excluded-URL defects.

### Structured data

- Structured-data scope is frozen to `WebSite` on the homepage, `BlogPosting` on single post pages, and `BreadcrumbList` where visible breadcrumbs render.
- `BlogPosting` must not emit on list, taxonomy, term, 404, or alias-helper templates.
- Homepage `WebSite` markup remains acceptable when Google Rich Results Test reports `No items detected` while `npm run check:schema` passes the homepage properties.
- `VideoObject` is intentionally deferred until the site renders a dedicated watch-page experience with the required metadata. Downstream phases must not add `VideoObject` opportunistically without a matching page model.
- The current schema audit passed for `223` built HTML pages with `0` critical schema defects.

### Non-HTML and attachment policy

- Non-HTML resources that require `X-Robots-Tag` control or request-aware redirect behavior remain dependent on infrastructure that can emit those headers or redirects.
- Owner-approved attachment exceptions recorded in `migration/reports/phase-5-non-html-policy.csv` remain preserved and must not be reclassified by later phases without explicit owner approval.
- Legacy `/wp-content/uploads/` compatibility assets that remain intentionally served for attachment continuity are part of the frozen Phase 5 policy and must not be treated as accidental leftovers.

### Monitoring and evidence

- Search Console is the accepted monitoring source of truth for this migration. No analytics runtime will be introduced as part of the launch-window plan.
- Phase 8 validation must reuse the exact gate set recorded in `migration/reports/phase-5-gate-summary.csv` and the incident thresholds in `migration/phase-5-monitoring-runbook.md`.
- Any launch-week rollback or hotfix decision about indexing, canonical mismatches, sitemap fetch failures, or redirect misses must reference the incident thresholds and URL-inspection sample set already defined in the monitoring runbook.

## Downstream obligations

### Phase 6 obligations

1. Implement the frozen edge redirect requirements from `migration/phase-5-redirect-signal-matrix.csv` without reopening the Phase 5 canonical, sitemap, feed, or non-HTML decisions by default.
2. Preserve the canonical-host and trailing-slash contract while adding redirect infrastructure.
3. Keep feed compatibility, attachment exceptions, and preserved discovery surfaces intact during redirect implementation.
4. Treat the current `41.96%` indexed URL change rate as a launch constraint, not a planning estimate.

### Phase 8 obligations

1. Validate release-candidate builds with the same Phase 5 blocking gates recorded in `migration/reports/phase-5-gate-summary.csv`.
2. Use `migration/phase-5-signoff.md` as the authoritative statement of what is frozen, what is accepted carry-forward, and what downstream teams can rely on.
3. Validate launch candidates against the monitoring runbook instead of inventing a separate Search Console or analytics policy.

## Accepted carry-forward items

| Item | Current state | Owner | Target phase |
| --- | --- | --- | --- |
| Edge redirect infrastructure | Required before launch because the indexed URL change rate remains above the approved escalation threshold and the signal matrix still contains edge-owned rows. | Thomas Theunen | Phase 6 |
| Search Console live-evidence refresh | The monitoring runbook is complete, but fresh repository-backed screenshots, owner-access revalidation, and DNS TXT recheck evidence were accepted as residual risk for closeout. | Thomas Theunen | Phase 8 |
| GitHub Pages custom-domain and HTTPS settings verification | Current DNS and artifact readiness are recorded, but repository-settings confirmation remains external to repo state and is owner-approved for later verification. | Thomas Theunen | Phase 9 |
| `VideoObject` schema | Deferred until the site has a qualifying watch-page experience instead of external-video links and archive surfaces only. | Thomas Theunen | Future content or platform scope |

## Contract use statement

Phase 6 and Phase 8 may rely on this document as the Phase 5 policy baseline for redirect implementation, launch readiness validation, and incident escalation. Any change that would alter the canonical policy, sitemap inclusion rules, feed compatibility behavior, structured-data scope, or attachment exceptions requires explicit owner approval and a corresponding update to this contract.