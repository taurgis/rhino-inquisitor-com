# Migration Runbook

## Purpose

This runbook tracks the operational steps needed to move the repository from planning into implementation and, later, release execution. It complements the phase plans in `analysis/plan/details/` and should stay brief, actionable, and phase-linked.

## Phase 3 - Repository Bootstrap

- Verify local prerequisites before editing runtime files:
  - Hugo Extended `0.157.0`
  - Node.js `>=18`
- Use `hugo server` for local preview work during scaffold and template implementation.
- Use `hugo --minify --environment production` to validate the production-style build locally.
- Treat root `hugo.toml` as the canonical production config entry point until a later ticket explicitly changes that contract.
- RHI-021 locks the Hugo configuration contract in root `hugo.toml`:
  - `baseURL` stays fixed to `https://www.rhino-inquisitor.com/`
  - locale defaults are explicit: `defaultContentLanguage = "en"`, `languageCode = "en-us"`, `timeZone = "UTC"`
  - generated category routes are config-owned at `/category/` and `/category/{slug}/`
  - tag archives remain retired by default; `tags` stay front matter metadata until a later approved exception
  - `enableRobotsTXT = true` is backed by a repo-owned `src/layouts/robots.txt` template
  - home RSS remains Hugo's canonical `/index.xml` output in Phase 3
- Legacy feed continuity is tracked but not fully implemented in RHI-021:
  - canonical Hugo feed output is `/index.xml`
  - legacy WordPress `/feed/` must still resolve, with implementation deferred to RHI-024 so the redirect/output artifact can be tested with SEO outputs
- Hugo source components live under `src/`:
  - `src/content/`
  - `src/layouts/`
  - `src/static/`
  - `src/assets/`
  - `src/data/`
  - `src/archetypes/`
- `public/` remains the root build artifact directory for validation and Pages upload.
- Validate RHI-021 changes with:
  - `hugo --minify --environment production`
  - output checks for `public/sitemap.xml`, `public/robots.txt`, and `public/index.xml`
  - canonical-host spot checks in generated XML/text outputs
- Validate RHI-022 front matter and archetype enforcement with:
  - `npm run validate:frontmatter`
  - `hugo new content posts/example.md` for post archetype spot checks
  - `hugo new content pages/example.md` for page archetype spot checks
  - `hugo new content categories/example/_index.md` for category term metadata spot checks
- Validate RHI-024 SEO foundation behavior with:
  - `hugo --minify --environment production`
  - `hugo --environment staging`
  - `npm run check:seo`
  - output checks for canonical `https://www.rhino-inquisitor.com/` URLs in `public/**/*.html`
  - output checks for `public/sitemap.xml`, `public/robots.txt`, `public/index.xml`, and `/feed/` compatibility helpers under `public/feed/`
  - manual rich-results validation for at least one representative article HTML sample before ticket closeout
- Use the Phase 3 ticket set for workstream ownership and acceptance criteria:
  - `analysis/tickets/phase-3/RHI-020-repository-bootstrap.md`
  - `analysis/tickets/phase-3/RHI-021-hugo-config-hardening.md`
  - `analysis/tickets/phase-3/RHI-022-content-contract-archetypes.md`
  - `analysis/tickets/phase-3/RHI-024-seo-foundation.md`
  - `analysis/tickets/phase-3/RHI-029-cicd-deployment-scaffolding.md`

## Phase 4 - Content Migration

Placeholder for import and validation steps once the Phase 4 ticket set begins implementation.

## Phase 5 - SEO and Discoverability

Placeholder for sitemap, canonical, feed, and Search Console execution steps.

## Phase 6 - Redirect and URL Validation

Placeholder for redirect-layer readiness, parity evidence, and rollback-safe URL checks.

## Phase 7 - Deployment Cutover

Placeholder for release-day workflow, DNS validation, HTTPS checks, and rollback coordination.

## Phase 8 - Launch Readiness

Placeholder for launch sign-off evidence, deterministic sampling, and operational approvals.

## Phase 9 - Post-Launch Monitoring

Placeholder for stabilization, monitoring cadence, and closeout evidence.