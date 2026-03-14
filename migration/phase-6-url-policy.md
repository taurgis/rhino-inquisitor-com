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

## Phase 6 CI Gate Reference

| Gate | Command | Scope | Status |
|---|---|---|---|
| Canonical host/protocol invariant | `npm run check:host-protocol` | Production build required; preview check optional when a preview artifact is available | Active in RHI-066 |
| Retirement and error-path governance | `npm run check:retirement-policy` | Production build required; generates the retired URL audit and fails on retire leakage or unresolved request-aware Model A limitations | Active in RHI-067 |
| Additional Phase 6 URL-policy gates | Added by RHI-068 and RHI-070 | Redirect security and release-gate expansion | Pending |

## Future Sections

The sections below are intentionally reserved for later Phase 6 tickets that extend this shared document:

1. Redirect security and privacy controls (RHI-068)
2. Full Phase 6 CI gate matrix and handoff references (RHI-070)