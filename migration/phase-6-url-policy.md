# Phase 6 URL Policy

## Purpose

This document is the shared Phase 6 policy reference for URL-preservation controls that span host/protocol consolidation, retirement behavior, security constraints, and CI gate traceability.

RHI-066 establishes the host/protocol section in this document. Later Phase 6 tickets extend the retirement, security, and CI sections without changing the canonical-host contract defined here.

## Canonical Host Contract

1. Production canonical host is fixed to `https://www.rhino-inquisitor.com/`.
2. Root `hugo.toml` remains the production source of truth for `baseURL = "https://www.rhino-inquisitor.com/"`.
3. Production canonical tags, `og:url`, `sitemap.xml` `<loc>` values, and `robots.txt` `Sitemap:` directives must resolve to the production canonical host only.
4. No production artifact may emit apex-host, HTTP, or preview-host canonical URLs.
5. Any proposed change to the canonical host requires explicit SEO-owner approval and a full rerun of the URL-parity and SEO host checks.

## Environment Policy

| Environment | Host source | Indexing policy | Allowed absolute host output |
|---|---|---|---|
| Production build | `hugo.toml` or explicit production `--baseURL` override | `index, follow` on indexable routes | `https://www.rhino-inquisitor.com/` only |
| GitHub Pages preview build | Explicit Pages/project-site `--baseURL` override | `noindex, nofollow` on all HTML routes | Active preview host only |
| Local development | `hugo server` or explicit local `--baseURL` override | Non-production only; never used as release evidence | Active local host only |

Notes:

1. The current public rehearsal host is `https://taurgis.github.io/rhino-inquisitor-com/`.
2. Preview and localhost builds are allowed to emit their active build-context host in absolute URLs because they are intentionally non-indexable.
3. Release validation must always use a production artifact built for `https://www.rhino-inquisitor.com/` when checking canonical-host leakage.
4. Preview deployments must normalize the rehearsal host to HTTPS before Hugo renders absolute URLs. Using an HTTP preview base URL is not acceptable, even for a noindex host.

## GitHub Pages Host And Protocol Plan

1. GitHub Pages custom-domain source of truth is repository Settings -> Pages or the Pages API. For Actions-based publishing, a committed `CNAME` file is non-authoritative and may be ignored.
2. The configured custom domain for production must be `www.rhino-inquisitor.com`.
3. `Enforce HTTPS` must remain enabled once GitHub Pages has validated the custom domain and issued the certificate.
4. Production deployment uses the canonical `www` host; the preview project-site host remains a non-indexable rehearsal environment.
5. GitHub recommends `www` as the more stable custom-domain entry point. This repository keeps `www` as the canonical host.

### External Verification Checklist

The following checks cannot be proven from repository artifacts alone and must be verified in GitHub Pages settings or at runtime:

- [ ] GitHub Pages custom domain is set to `www.rhino-inquisitor.com`
- [ ] `Enforce HTTPS` is enabled
- [ ] GitHub Pages reports the custom-domain configuration as healthy
- [ ] Live HTTP entry points redirect to HTTPS as expected

## DNS Consolidation Plan

Canonical decision:

1. `https://www.rhino-inquisitor.com/` remains the only production canonical host.
2. Apex (`https://rhino-inquisitor.com/`) is a non-canonical entry point and must consolidate to `https://www.rhino-inquisitor.com/`.

Execution plan:

1. Configure both `www` and apex DNS records to satisfy GitHub Pages custom-domain requirements for the same site.
2. Keep `www.rhino-inquisitor.com` as the configured Pages custom domain so GitHub Pages can serve the canonical host and create the corresponding apex/`www` redirect behavior documented by GitHub.
3. Validate the live behavior after cutover with `dig` and `curl` checks for these entry paths:
   - `http://rhino-inquisitor.com/`
   - `http://www.rhino-inquisitor.com/`
   - `https://rhino-inquisitor.com/`
   - `https://www.rhino-inquisitor.com/`
4. If the provider setup cannot deliver the expected apex-to-`www` runtime redirect reliably, introduce provider URL forwarding or an edge/CDN redirect layer before production cutover.

Runtime validation requirements:

- [ ] `http://www.rhino-inquisitor.com/` redirects to `https://www.rhino-inquisitor.com/`
- [ ] `http://rhino-inquisitor.com/` redirects to `https://www.rhino-inquisitor.com/`
- [ ] `https://rhino-inquisitor.com/` redirects to `https://www.rhino-inquisitor.com/`
- [ ] `https://www.rhino-inquisitor.com/` responds with the production site and canonical tags on the `www` host

## Search Console Coverage

Required property coverage for launch monitoring:

| Property | Purpose | Status |
|---|---|---|
| `https://www.rhino-inquisitor.com/` | Primary preferred property | Pending external verification |
| `https://rhino-inquisitor.com/` | Apex variant monitoring | Pending external verification |
| `http://www.rhino-inquisitor.com/` | HTTP `www` entry monitoring | Pending external verification |
| `http://rhino-inquisitor.com/` | HTTP apex entry monitoring | Pending external verification |

Verification notes:

1. User-owner confirmation on 2026-03-14: Search Console ownership exists for the domain.
2. Record whether that ownership is a domain property or URL-prefix properties when Phase 7 cutover evidence is assembled.
3. If an HTTP property is unavailable because of property-type limitations or account scope, record that explicitly rather than assuming verification.

## Retirement And Error Path Governance

### Retirement Decision Rubric

1. `404` is the default retire outcome for Phase 6 because the committed RHI-062 Model A launch path uses Hugo plus GitHub Pages without request-aware edge status overrides.
2. Use `301` only when WS-B already approved a topic-equivalent replacement and the legacy route is classified as `merge`, not `retire`.
3. Use `410` only when all are true:
  - an edge layer is active for the affected route,
  - permanent removal is explicitly confirmed by editorial or legal intent,
  - the implementation evidence is captured in the retirement audit.
4. Never redirect retired content to the homepage, a category root, or another convenience destination without a documented topic-equivalent replacement.
5. High-volume route classes such as pagination, attachments, and system helpers can inherit a class-level `404` policy when no equivalent content exists, but the class-level rationale must still be reflected in the retirement audit.

### Model A Boundary

1. Under the committed Model A launch posture, explicit `410` handling is unavailable in repository-controlled Hugo output.
2. Path-based retired routes should resolve through normal GitHub Pages not-found handling because no HTML or asset artifact is published at the legacy path.
3. Request-aware query-string retire routes must still be audited because GitHub Pages ignores query semantics at the static artifact layer.
4. If a request-aware retire route shares a published path component, treat it as a release-blocking residual until the owner accepts the limitation or an edge layer is introduced.

### Retired URL Audit Contract

`migration/reports/phase-6-retired-url-audit.csv` is the required Phase 6 audit record for retire outcomes. Each row must include:

1. `legacy_url`
2. `route_class`
3. `reason_code`
4. `has_organic_traffic`
5. `has_external_links`
6. `outcome`
7. `reviewer`
8. `notes`

Reason-code guidance for the current inventory:

1. `attachment-no-equivalent` for retired WordPress upload and derivative media routes with no source-backed keep path.
2. `pagination-no-equivalent` for paginated archives, category pages, and tag pages that should not survive migration.
3. `system-route-no-equivalent` for system, feed, and crawl-discovered utility routes with no public replacement.
4. `legacy-sitemap-replaced` for legacy WordPress sitemap shards replaced by the canonical Hugo `sitemap.xml` output.
5. `page-no-source`, `landing-no-source`, `wordpress-default-removed`, `wordpress-system-removed`, `invalid-placeholder-route`, and `redirect-target-unresolvable` for the explicit manual-review exceptions already recorded in the URL map notes.

Traffic and backlink review rule:

1. Any retired URL with organic traffic or external links must include a notes entry confirming why no topic-equivalent replacement was approved and why the explicit not-found outcome remains intentional.

Runtime verification requirements:

1. `public/404.html` must exist in the production artifact.
2. The built 404 output must remain `noindex, nofollow` and absent from the sitemap.
3. Manual staging or preview validation must confirm that an unknown path returns the custom 404 page on GitHub Pages.

## Redirect Security And Privacy Controls

### Redirect Destination Policy

1. Redirect destinations for Phase 6 must remain source-controlled. The in-scope redirect surfaces are:
  - `migration/url-map.csv` for redirect intent and merge-target review,
  - Hugo content front matter `aliases` as site-relative legacy source paths,
  - built Hugo alias pages rendered from `src/layouts/alias.html`,
  - committed feed compatibility helper pages under `src/static/feed/**` and `src/static/rss/index.html`.
2. Query parameters, request input, or environment variables must never determine a published redirect destination.
3. Hugo alias pages must render same-site canonical and meta-refresh targets from `.Permalink`, which in production resolves from `baseURL = "https://www.rhino-inquisitor.com/"`.
4. No intentional cross-domain redirect exceptions are approved for the current Model A launch posture. Any future cross-domain redirect requires explicit SEO-owner sign-off and a documented exception entry in this section before merge.
5. The feed compatibility helpers are not generated by Hugo aliases. They are allowlisted static compatibility pages that keep site-relative `/index.xml` targets only for the legacy feed entry paths audited in `migration/url-map.csv`. Validation must still prove those targets remain same-site and non-user-controlled.

### Security Review Checklist

- [x] All reviewed `aliases` front matter values are site-relative paths; zero absolute alias URLs found in `src/content/**`
- [x] `migration/url-map.csv` contains zero `http://` target URLs in the current reviewed dataset
- [x] Built Hugo alias pages resolve to same-site destinations on `https://www.rhino-inquisitor.com/`
- [x] Built Hugo alias pages keep canonical and meta-refresh destinations aligned
- [x] Approved feed compatibility helper pages stay on same-site `/index.xml` targets and are allowlisted explicitly
- [x] Phase 6 scripts and reports scan clean for credential-like and PII-like patterns under the RHI-068 validator scope
- [x] `npm run check:redirect-security` passes on a clean production build artifact
- [x] Engineering owner sign-off recorded

### Sign-Off Record

| Date | Reviewer | Decision | Notes |
|---|---|---|---|
| 2026-03-14 | Engineering Owner | Approved | User-owner approved engineering sign-off in the implementation session after the RHI-068 validation commands passed. |

## Repository Validation Commands

Production host/protocol validation:

```bash
npm run check:host-protocol -- --public-dir tmp/rhi066-prod-public --report-dir tmp/rhi066-host-protocol
```

Production plus preview validation:

```bash
npm run check:host-protocol -- \
  --public-dir tmp/rhi066-prod-public \
  --preview-public-dir tmp/rhi066-preview-public \
  --report-dir tmp/rhi066-host-protocol
```

Expected behavior:

1. Production validation fails on any canonical, sitemap, or robots `Sitemap:` reference that does not use `https://www.rhino-inquisitor.com/`.
2. Optional preview validation fails when preview HTML routes are missing `noindex, nofollow` or when preview robots output uses the wrong preview-host sitemap URL.
3. Validation reports are written under the supplied `--report-dir` and are safe to keep in `tmp/` for local evidence capture.

Retirement policy validation:

```bash
npm run check:retirement-policy -- --public-dir public --report migration/reports/phase-6-retired-url-audit.csv
```

Expected behavior:

1. The command generates one audit row per `retire` URL in `migration/url-map.csv`.
2. The command fails on any retired route that still appears in source aliases, built HTML or asset output, or `sitemap.xml`.
3. The command fails when a request-aware retire route still shares a published path component under Model A, because the repository cannot prove deterministic `404` behavior for that route without an edge layer.
4. The command fails when `public/404.html` is missing from the production artifact.

Redirect security validation:

```bash
npm run check:redirect-security -- --public-dir public --report migration/reports/phase-6-redirect-security.csv
```

Expected behavior:

1. The command audits source-controlled content aliases and fails on empty, absolute, or malformed alias values.
2. The command fails on any `http://` target URL in `migration/url-map.csv`.
3. The command parses built alias helper pages in `public/` and fails when canonical or meta-refresh destinations are off-site, HTTP, mismatched, self-referencing, or missing.
4. The command treats the committed feed compatibility helpers as an allowlisted same-site exception surface and verifies that they still resolve to `/index.xml` only.
5. The command scans Phase 6 scripts and reports for credential-like and PII-like patterns and fails on any match.

## Phase 6 CI Gate Reference

Phase 6 release gates run against the production artifact after `hugo --minify --environment production` and before any Pages artifact upload. Any non-zero exit code is release-blocking and prevents artifact upload and deploy.

| Gate | Command | Scope | Blocking threshold | Zero tolerance | Status |
|---|---|---|---|---|---|
| URL inventory completeness and schema contract | `npm run validate:url-inventory` | Validates `migration/url-manifest.json` required records, normalization, and Model A implementation-layer constraints before deploy | Any validation issue | Yes | Active in RHI-070 |
| Legacy URL parity against production output | `npm run check:url-parity` | Validates all `keep`, `merge`, and `retire` outcomes against the production build and writes `migration/url-parity-report.csv` | Any critical parity failure | Yes for critical parity defects | Active in RHI-070 |
| Redirect target publication | `npm run check:redirect-targets` | Validates every `merge` row target in `migration/url-map.csv` against the production artifact and writes `migration/reports/phase-6-redirect-targets.csv` | Any missing published target | Yes | Active in RHI-070 |
| Redirect chains and loops | `npm run check:redirect-chains` | Validates alias-backed `pages-static` redirects for one-hop final delivery and writes `migration/reports/phase-6-chains-loops.csv` | Any chain, loop, missing target, HTTP target, or cross-host anomaly | Yes | Active in RHI-070 |
| Canonical alignment | `npm run check:canonical-alignment` | Validates canonical tags against sitemap `<loc>` values and writes `migration/reports/phase-6-canonical-alignment.csv` | Any mismatch or missing sitemap alignment | Yes | Active in RHI-070 |
| Retirement and error-path governance | `npm run check:retirement-policy` | Validates retire leakage, request-aware residual handling, and `404.html`, and writes `migration/reports/phase-6-retired-url-audit.csv` | Any retired route leakage or unresolved Model A limitation | Yes | Active in RHI-070 |
| Canonical host/protocol invariant | `npm run check:host-protocol` | Validates production canonical host/protocol output and writes reports under `tmp/phase-6-host-protocol` | Any canonical, sitemap, robots, or crawl-control host/protocol defect | Yes | Active in RHI-070 |
| Redirect security and privacy controls | `npm run check:redirect-security` | Validates source aliases, `url-map` targets, built alias pages, and approved feed compatibility helpers for same-site HTTPS-only behavior | Any off-site, HTTP, malformed, or sensitive-data violation | Yes | Active in RHI-070 |

## Future Sections

The sections below are intentionally reserved for later Phase 6 tickets that extend this shared document:

1. Cutover and rollback handoff references (RHI-071 and RHI-072)