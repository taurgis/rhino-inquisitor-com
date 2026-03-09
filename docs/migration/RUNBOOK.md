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
- Hugo source components live under `src/`:
  - `src/content/`
  - `src/layouts/`
  - `src/static/`
  - `src/assets/`
  - `src/data/`
  - `src/archetypes/`
- `public/` remains the root build artifact directory for validation and Pages upload.
- Use the Phase 3 ticket set for workstream ownership and acceptance criteria:
  - `analysis/tickets/phase-3/RHI-020-repository-bootstrap.md`
  - `analysis/tickets/phase-3/RHI-021-hugo-config-hardening.md`
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