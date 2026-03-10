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
- Validate RHI-025 URL parity baseline with:
  - `hugo --minify --environment production`
  - `npm run check:url-parity`
  - review `migration/url-parity-report.json` for:
    - hard-failure statuses: `missing`, `wrong-target`, `chain`, `collision`
    - soft-404 warnings for homepage, 404, or section-mismatch targets
    - threshold summary showing both the early-warning state at `>= 5%` and the Phase 2 edge-redirect requirement at `> 5%`
- Interpret RHI-025 baseline results as follows:
  - scaffold mode is expected while `src/content/` has no migrated Markdown files; the command still validates manifest/report structure and writes the report, but route-level parity checks are skipped
  - once migrated content exists, any hard-failure status blocks release readiness and must be fixed before merge
  - query-string legacy URLs are still reported against the built output; if static hosting cannot represent them correctly, the report exposes the gap instead of masking it
- Validate RHI-026 asset and performance baseline with:
  - `npm run build:prod`
  - `npm run check:perf:budget`
  - `npm run check:perf`
  - review `docs/migration/ASSET-POLICY.md` for the current image strategy, budget limits, and JavaScript policy
  - confirm representative scaffold routes exist in the built output:
    - `public/index.html`
    - `public/phase-3-performance-baseline/index.html`
    - `public/category/platform/index.html`
  - review `tmp/lhci/` for the local Lighthouse CI reports written by the baseline run
- Validate RHI-028 security and privacy hardening with:
  - `hugo --cleanDestinationDir --minify --environment production`
  - `npm run check:security`
  - review `docs/migration/SECURITY-CONTROLS.md` for the current control matrix, owner assignments, and deferred analytics decision
  - confirm the current scaffold still has no external `<script src>` references; only repo-owned inline JSON-LD remains in rendered HTML
  - when validating draft exclusion changes, use a temporary `draft: true` fixture and confirm the route is absent from both `public/` and `public/sitemap.xml` before removing the fixture
- Validate RHI-029 CI/CD and deployment scaffolding with:
  - `npm run validate:frontmatter`
  - `hugo --cleanDestinationDir --minify --environment production`
  - `npm run check:url-parity`
  - `npm run check:seo`
  - `npm run check:links`
  - for PR workflow parity, run `npx markdownlint-cli2 <changed-markdown-files>` when Markdown files are in scope
  - use `npm run check:a11y` and `npm run check:perf` as staged informational baselines; failures do not block Phase 3 deploys but do require fix or explicit risk acceptance before RHI-030 closes
- Use the Phase 3 ticket set for workstream ownership and acceptance criteria:
  - `analysis/tickets/phase-3/RHI-020-repository-bootstrap.md`
  - `analysis/tickets/phase-3/RHI-021-hugo-config-hardening.md`
  - `analysis/tickets/phase-3/RHI-022-content-contract-archetypes.md`
  - `analysis/tickets/phase-3/RHI-024-seo-foundation.md`
  - `analysis/tickets/phase-3/RHI-025-url-parity-redirect-baseline.md`
  - `analysis/tickets/phase-3/RHI-026-asset-performance-baseline.md`
  - `analysis/tickets/phase-3/RHI-027-accessibility-ux-baseline.md`
  - `analysis/tickets/phase-3/RHI-028-security-privacy-hardening.md`
  - `analysis/tickets/phase-3/RHI-029-cicd-deployment-scaffolding.md`

## RHI-029 Deployment Runbook

- Trigger deployment with either:
  - a push to `main`, which runs `.github/workflows/deploy-pages.yml`
  - a manual `workflow_dispatch` run of `Deploy to GitHub Pages` for a known commit
- Expect the deploy workflow to run the blocking Phase 3 gates in this order before the Pages artifact is published:
  - `npm run validate:frontmatter`
  - `hugo --minify --environment production`
  - `npm run check:url-parity`
  - `npm run check:seo`
  - `npm run check:links`
- After the production validation gates pass, the workflow rebuilds the deployable preview artifact with the Pages project-site base URL and preview environment:
  - `hugo --gc --minify --environment preview --baseURL "${{ steps.pages.outputs.base_url }}/"`
  - this keeps the rehearsal artifact path-prefix-correct on `https://taurgis.github.io/rhino-inquisitor-com/`
  - preview-host artifacts must emit `noindex, nofollow` and are not the same host-state as the production validation build
- Use the PR workflow `.github/workflows/build-pr.yml` for pre-merge validation:
  - every PR to `main` runs front matter validation and a production Hugo build
  - route-sensitive PRs also run URL parity, SEO smoke, and internal link checks
  - changed Markdown files are linted with `markdownlint-cli2`
  - accessibility and performance jobs are informational in Phase 3 and must be reviewed when they fail
- Reproduce quality gate failures locally with the matching command:
  - front matter: `npm run validate:frontmatter`
  - production build: `hugo --cleanDestinationDir --minify --environment production`
  - preview-host rehearsal build: `hugo --gc --minify --environment preview --baseURL "https://taurgis.github.io/rhino-inquisitor-com/"`
  - URL parity: `npm run check:url-parity`
  - SEO smoke: `npm run check:seo`
  - internal links: `npm run check:links`
  - accessibility baseline: `npm run check:a11y`
  - performance baseline: `npm run check:perf`
- Roll back by redeploying the last known-good commit from GitHub Actions:
  - first choice: rerun the last known-good deployment while its artifact is still available in Actions
  - fallback: use `workflow_dispatch` on the same known-good commit so CI rebuilds and redeploys the exact source revision
  - do not rerun an isolated build-only job and assume it changed production; the rollback action must execute the Pages deploy path
- Track deployment evidence for Phase 3 sign-off:
  - successful workflow run URL
  - deployed Pages URL returned by `actions/deploy-pages`
  - any staged accessibility or performance failure together with its fix plan or risk acceptance
- Search Console follow-up after cutover belongs to the deploy handoff checklist:
  - submit `https://www.rhino-inquisitor.com/sitemap.xml` in the production property
  - keep transition-era sitemap references only as long as they help Google discover the final canonical set
  - monitor Page indexing and soft-404 reports after each production deploy during the cutover window
  - inspect the highest-value legacy URLs if parity or redirect reports show regressions

## RHI-027 Accessibility Manual Review Checklist

- Run `npm run check:a11y` after a production build. The command serves `public/` locally and runs `pa11y-ci` against the representative scaffold routes for the home, post, page, archive, taxonomy index, and category term templates.
- Treat the automated `WCAG2AA` ruleset as the repo's Phase 3 baseline only. WCAG 2.2-specific manual checks still apply before later-phase sign-off.
- Verify skip-link behavior on each representative route:
  - load the page from the top
  - press `Tab` once
  - confirm the "Skip to main content" link becomes visible as the first focusable element
  - activate it with `Enter`
  - confirm focus lands on the main content region
- Verify focus order with a keyboard-only walk:
  - continue tabbing from the skip link through primary navigation, breadcrumbs, in-page links, pagination, and footer links
  - confirm the tab order matches the visual reading order and no element traps focus
- Verify focus visibility:
  - confirm every link or other focusable control has a visible focus indicator
  - if custom focus styling is overridden later, re-check contrast and thickness before merge
- Verify contrast for custom UI additions not covered by the scaffold default browser styles:
  - check any new custom text, badges, buttons, or focus rings against WCAG AA thresholds
  - use browser DevTools or an approved contrast checker for any non-default color pair
- Verify image semantics in rendered HTML:
  - informative images must render with a non-empty `alt`
  - decorative images must render with `alt=""` and `role="presentation"`

## Phase 4 - Content Migration

### RHI-032 - WordPress Extraction

- Run the extractor with `npm run migrate:extract`.
- The extractor auto-discovers approved Phase 4 source artifacts in this order unless explicit paths are provided:
  - WXR export from `migration/input/*.xml`, then `tmp/*.xml`
  - SQL dump from `migration/input/*.sql`, then `tmp/wordpress-database.sql`
  - filesystem snapshot from `migration/input/website-wordpress-backup/wp-content`, then `tmp/website-wordpress-backup/wp-content`
- Current default extraction strategy is WXR-first with optional SQL recovery and filesystem verification. On the validated 2026-03-10 run, WXR plus filesystem verification satisfied the source-backed content scope and the SQL scan did not contribute additional recovered records.
- The extractor writes immutable Phase 4 extraction artifacts to `migration/intermediate/` only:
  - `extract-records.json`
  - `extract-summary.json`
  - `extract-quarantine.json`
- Determinism rules:
  - output records are sorted by `legacyUrl` then `sourceId`
  - source timestamps are derived from source artifact modification times rather than wall-clock execution time
  - summary selection metadata records whether the run was `full` or `subset`
- Subset mode options:
  - `--source-id-file <path>` limits the run to the listed source IDs
  - `--post-type <types>` limits the run to specific post types such as `post,page,video`
- Coverage behavior for RHI-032 is owner-confirmed as `source-backed-content-only`:
  - blocking coverage targets: source-backed posts, page-sitemap-backed pages except the homepage, uploads-backed attachments, category term routes, and content detail custom types with source evidence
  - reported-but-non-blocking routes: system, feed, query, pagination, homepage, and synthetic index routes
- Quarantine policy:
  - malformed or unmappable source records are written to `extract-quarantine.json` with `sourceId`, `errorType`, `errorMessage`, and a raw fragment
  - quarantine is an escalation if it exceeds 5% of the extracted records
  - the run exits non-zero when source-backed manifest coverage fails or the quarantine threshold is exceeded
- Filesystem verification is optional but supported when the approved `wp-content` snapshot is available. Upload-backed attachment paths and body-media references are checked against the snapshot and recorded as a `filesystem` source channel when verified.
- REST enrichment is not part of the current default run because the approved WXR and SQL inputs cover the Phase 4 content-backed scope. If a later run needs REST supplementation, use the WordPress REST pagination headers `X-WP-Total` and `X-WP-TotalPages` as the completeness gate.

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
