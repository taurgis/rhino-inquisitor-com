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

## Phase 6 CI Gate Reference

| Gate | Command | Scope | Status |
|---|---|---|---|
| Canonical host/protocol invariant | `npm run check:host-protocol` | Production build required; preview check optional when a preview artifact is available | Active in RHI-066 |
| Additional Phase 6 URL-policy gates | Added by RHI-067, RHI-068, and RHI-070 | Retirement, security, and release-gate expansion | Pending |

## Future Sections

The sections below are intentionally reserved for later Phase 6 tickets that extend this shared document:

1. Retirement decision rubric and error-path governance (RHI-067)
2. Redirect security and privacy controls (RHI-068)
3. Full Phase 6 CI gate matrix and handoff references (RHI-070)