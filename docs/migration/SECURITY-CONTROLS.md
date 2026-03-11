# Security Controls

## Purpose

This document records the current Phase 3 security and privacy baseline for the GitHub Pages scaffold. It separates controls that are implemented in the repository today from controls that still require infrastructure outside the scaffold.

## Scope

- Hugo scaffold output built into `public/`
- GitHub Pages custom-domain deployment assumptions already established in Phase 2
- Phase 3 template, build, and artifact-isolation controls

Out of scope:

- Edge or CDN implementation
- WAF, bot mitigation, or origin-server security controls
- Legal review of privacy notices or consent language

## Status definitions

- `implemented`: enforced today by the scaffold, build contract, or GitHub Pages platform settings already in use
- `edge-required`: not available in the Phase 3 scaffold and requires an edge or CDN layer before it can be treated as active
- `deferred`: intentionally not implemented yet; later phase work must define and ship it before the control can be treated as active

## Verified baseline on 2026-03-09

- `hugo --cleanDestinationDir --minify --environment production` completed successfully.
- No template-generated `href`, `src`, or `action` attributes in `public/**/*.html` used `http://`.
- No external runtime `<script src>` references were present in the scaffold source or generated HTML.
- No `migration/`, `scripts/`, `analysis/`, `tmp/`, `package.json`, `package-lock.json`, `README.md`, or `.md` source artifacts were present in `public/`.
- A temporary `draft: true` fixture page was excluded from both `public/` and `public/sitemap.xml` during validation.

## Control matrix

| Control | Status | Layer | Owner | Current implementation | Verification |
|---|---|---|---|---|---|
| HTTPS enforcement | `implemented` | `github-pages` | Migration Owner | GitHub Pages HTTPS remains the platform control, and the repo-side canonical host is fixed to `https://www.rhino-inquisitor.com/` in `hugo.toml`. The launch checklist keeps GitHub Pages `Enforce HTTPS` enabled. | Keep GitHub Pages `Enforce HTTPS` enabled and keep the canonical host in `hugo.toml` set to HTTPS. |
| HSTS | `edge-required` | `edge-cdn` | Migration Owner | Not implemented in the Phase 3 scaffold. Any HSTS policy must be added at the future edge layer. | Revisit when the edge/CDN workstream from Phase 2 outcomes is implemented. |
| Content Security Policy | `edge-required` | `edge-cdn` | Engineering Owner | Not implemented in the Phase 3 scaffold. No repo-owned response-header control exists in the Pages artifact for CSP delivery. | Revisit when the edge/CDN workstream from Phase 2 outcomes is implemented. |
| `X-Frame-Options` / `frame-ancestors` | `edge-required` | `edge-cdn` | Engineering Owner | Not implemented in the Phase 3 scaffold. Any clickjacking defense must be delivered at the edge layer. | Revisit when the edge/CDN workstream from Phase 2 outcomes is implemented. |
| `Permissions-Policy` | `edge-required` | `edge-cdn` | Engineering Owner | Not implemented in the Phase 3 scaffold. No repo-owned response-header control exists in the Pages artifact for this policy. | Revisit when the edge/CDN workstream from Phase 2 outcomes is implemented. |
| `X-Content-Type-Options: nosniff` | `edge-required` | `edge-cdn` | Engineering Owner | Not implemented in the Phase 3 scaffold. Any `nosniff` enforcement must be delivered at the edge layer. | Revisit when the edge/CDN workstream from Phase 2 outcomes is implemented. |
| Mixed-content safety | `implemented` | `github-pages` | Engineering Owner | Repo-owned templates and generated HTML do not emit `http://` URLs for rendered `href`, `src`, or `action` attributes. | Run `npm run check:security`. Source scanning allowlists only XML namespaces and protocol-guard checks. |
| Staging `noindex` | `implemented` | `github-pages` | Engineering Owner | `src/layouts/partials/seo/resolve.html` emits `noindex, nofollow` outside production, preserving the RHI-024 staging guardrail. | Run `npm run check:seo` and inspect the staging build behavior documented in RHI-024. |
| Draft content exclusion | `implemented` | `github-pages` | Engineering Owner | `hugo.toml` keeps `buildDrafts = false`, and production validation confirms draft routes do not render or enter the sitemap. | Run `npm run check:security`; for spot checks, rebuild with a temporary `draft: true` fixture and confirm it is absent from `public/` and `public/sitemap.xml`. |
| Migration artifact isolation | `implemented` | `github-pages` | Engineering Owner | The Pages artifact contains only generated site output; migration data, repo metadata, scripts, and Markdown sources are excluded. | Run `npm run check:security`. |
| Analytics and consent model | `deferred` | `none` | Migration Owner | No analytics runtime is shipped in the Phase 3 scaffold. Any future addition must document the tool, staging suppression, consent model, and no-PII first-request behavior. | Revisit in [RHI-057](../../analysis/tickets/phase-5/RHI-057-search-console-monitoring-program.md). |

## Current script inventory

- The Phase 3 scaffold currently contains no external runtime `<script src>` references.
- The only `<script>` blocks in rendered HTML are repo-owned inline JSON-LD fragments emitted by the SEO partials.
- Any future third-party runtime script must update this document before merge, including purpose, owner, privacy impact, staging behavior, and consent handling.

## Edge and deployment dependencies

- The redirect and edge-escalation contract is documented in [RHI-013](../../analysis/tickets/phase-2/RHI-013-route-redirect-contract.md).
- The GitHub Pages deployment and custom-domain contract is documented in [RHI-016](../../analysis/tickets/phase-2/RHI-016-deployment-operations-contract.md).
- The Phase 4 migration gate now treats stricter response-header policy as edge-owned work; repository artifacts only validate HTTPS-safe output and content hygiene, not header delivery.
- For Actions-based Pages publishing, custom-domain state remains a Pages settings or API concern rather than a committed `CNAME` file concern.

## Official references

- GitHub Pages HTTPS and mixed-content guidance: <https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https>
- GitHub Pages custom domains: <https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages>
- GitHub Pages publishing-source behavior for Actions workflows: <https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site>
- GitHub Pages custom workflows: <https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages>
- Hugo markup renderer configuration: <https://gohugo.io/getting-started/configuration-markup/>
- Hugo configuration reference: <https://gohugo.io/configuration/all/>
- Hugo environment reference: <https://gohugo.io/functions/hugo/environment/>
- Hugo command reference: <https://gohugo.io/commands/hugo/>
