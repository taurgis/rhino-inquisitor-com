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
  - subset runs now auto-include any WXR attachment records referenced by selected records' verified `_thumbnail_id` links so featured-image recovery remains structurally complete without manually adding attachment IDs to the subset input file
  - the extractor records these support rows in `extract-summary.json -> featuredImageDependencies` and exits non-zero if any selected thumbnail attachment cannot be recovered from the approved WXR source
- Coverage behavior for RHI-032 is owner-confirmed as `source-backed-content-only`:
  - blocking coverage targets: source-backed posts, page-sitemap-backed pages except the homepage, uploads-backed attachments, category term routes, and content detail custom types with source evidence
  - reported-but-non-blocking routes: system, feed, query, pagination, homepage, and synthetic index routes
- Quarantine policy:
  - malformed or unmappable source records are written to `extract-quarantine.json` with `sourceId`, `errorType`, `errorMessage`, and a raw fragment
  - quarantine is an escalation if it exceeds 5% of the extracted records
  - the run exits non-zero when source-backed manifest coverage fails or the quarantine threshold is exceeded
- Filesystem verification is optional but supported when the approved `wp-content` snapshot is available. Upload-backed attachment paths and body-media references are checked against the snapshot and recorded as a `filesystem` source channel when verified.
- REST enrichment is not part of the current default run because the approved WXR and SQL inputs cover the Phase 4 content-backed scope. If a later run needs REST supplementation, use the WordPress REST pagination headers `X-WP-Total` and `X-WP-TotalPages` as the completeness gate.

### RHI-033 - Canonical Record Normalization

- Run the normalizer with `npm run migrate:normalize`.
- The normalizer reads the Phase 4 extraction and URL-governance inputs:
  - `migration/intermediate/extract-records.json`
  - `migration/intermediate/extract-summary.json`
  - `migration/url-manifest.json`
  - `migration/url-inventory.normalized.json`
- The canonical record schema is owned by `scripts/migration/schemas/record.schema.js` and validated with Zod before records are written.
- Normalization behavior locked for the 2026-03-10 validated run:
  - required `targetUrl` coverage follows the same `source-backed-content-only` denominator as RHI-032
  - `aliasUrls` are derived from all manifest rows that share the same `target_url`, excluding the canonical target path itself
  - `mediaRefs` are collected from `src` attributes plus parsed `srcset` candidate URLs; attachment upload URLs are preserved when available
  - attachment `inherit` status is normalized to canonical `publish`
  - when source timestamps are missing, `publishedAt` falls back to `modifiedAt` then `sourceTimestamp`, and `modifiedAt` falls back to `publishedAt` then `sourceTimestamp`
- The normalizer writes deterministic artifacts to `migration/intermediate/` only:
  - `records.normalized.json`
  - `normalize-summary.json`
  - `normalize-errors.json`
- Output interpretation for the validated 2026-03-10 full run:
  - `records.normalized.json` contains 331 normalized records with zero schema errors
  - required coverage is 192 manifest-backed `keep` or `merge` records, all of which normalize with non-null `targetUrl`
  - 138 manifest-backed `retire` records normalize with explicit `targetUrl: null`
  - 616 extracted records without a manifest row are reported under `normalize-summary.json -> normalizationNotes.skippedWithoutManifest`; they are audit-visible but excluded from the owner-approved required scope
- Validation steps for RHI-033:
  - `npm run migrate:normalize`
  - confirm `migration/intermediate/normalize-errors.json` is empty
  - confirm `migration/intermediate/normalize-summary.json` shows `requiredManifestCount` equal to `normalizedRequiredCount`

### RHI-038 - Internal Link and Navigation Rewrites

- Run the internal link rewrite pass with `npm run migrate:rewrite-links` after `npm run migrate:map-frontmatter` and `npm run migrate:rewrite-media`.
- After `npm run migrate:rewrite-links`, run `npm run migrate:apply-corrections` to normalize staged Markdown structure and apply curated image-alt overrides, or use `npm run migrate:finalize-content` as the combined post-mapping sequence.
- The rewrite pass reads staged Markdown from `migration/output/content/` and URL governance data from:
  - `migration/url-manifest.json`
  - `migration/intermediate/media-manifest.json`
- The script rewrites legacy same-host article links to Hugo-relative targets, rewrites mapped WordPress media wrappers to localized `/media/...` assets, removes orphan page links with no redirect target while preserving anchor text, and records every change in `migration/reports/link-rewrite-log.csv`.
- Current validated 2026-03-10 behavior:
  - the final rewrite report contains 332 logged actions with 6 orphan removals
  - nested legacy category paths are normalized to the Hugo taxonomy contract at `/category/{slug}/`
  - the legacy eCDN staging article slug is rewritten to the staged canonical route `/how-to-set-up-the-ecdn-in-sfcc-staging/`
  - the video hub page links matching playlist headings to existing staged video-page routes when those pages are present in the staged corpus
  - rerunning the command against already-rewritten staged Markdown is idempotent; the validated rerun updated 0 files and logged 0 actions when writing to `tmp/rhi038-idempotency.csv`
- Validation steps for RHI-038:
  - `npm run migrate:map-frontmatter`
  - `npm run migrate:rewrite-media`
  - `npm run migrate:rewrite-links`
  - `npm run migrate:apply-corrections`
  - `hugo --minify --environment production --contentDir migration/output/content --destination tmp/rhi038-public`
  - `CHECK_LINKS_PUBLIC_DIR=tmp/rhi038-public npm run check:links`
  - spot-check `tmp/rhi038-public/archive/index.html`, one representative category term page such as `tmp/rhi038-public/category/release-notes/index.html`, and `tmp/rhi038-public/video/index.html`
  - treat residual `npm run migrate:rewrite-media` warnings for unmapped non-manifest media references as RHI-037 scope, not a blocker for the RHI-038 internal page-link gate
  - rerun `npm run migrate:normalize` and confirm the normalized artifact hashes remain stable

### Post-Generation Content Corrections

- Run the staged-content correction pass with `npm run migrate:apply-corrections` after `npm run migrate:rewrite-links`.
- The correction pass reads staged Markdown from `migration/output/content/` and applies deterministic generated-content fixes plus curated text overrides:
  - fenced-code cleanup for WordPress wrapper indentation and blank-first-line artifacts
  - image paragraph normalization when generated Markdown keeps images and prose in the same paragraph block
  - inline label/callout reconstruction when flattened WordPress text leaves labels such as `Info`, `CDN`, `Default Cache Times`, `Not Found`, `Replication`, `Deprecation`, `Deletion`, or `Caching` embedded in plain paragraphs
  - split-word inline-link repair when source anchor markup cuts through a single word boundary in generated Markdown
  - malformed table repair when a generated Markdown table contains an empty placeholder header row before the real header row
  - page-level body and description overrides from `migration/input/body-overrides.json` plus Markdown bodies stored under `migration/input/body-overrides/`
  - curated alt-text overrides from `migration/input/image-alt-corrections.csv`
  - curated weak-link label overrides from `migration/input/link-text-corrections.csv`
- Use `npm run migrate:finalize-content` after `npm run migrate:map-frontmatter` when you want the standard post-mapping sequence in one command.
- The seeded alt-text corrections file contract is:
  - path: `migration/input/image-alt-corrections.csv`
  - required columns: `page_url`, `image_src`, `occurrence_index`, `corrected_alt`
  - optional columns: `original_alt`, `source_file`
  - matching rule: `page_url + image_src + occurrence_index` identifies a specific Markdown image occurrence in the staged corpus
- The weak-link corrections file contract is:
  - path: `migration/input/link-text-corrections.csv`
  - required columns: `page_url`, `target`, `corrected_text`
  - optional columns: `occurrence_index`, `original_text`, `source_file`
  - matching rule: `page_url + target + occurrence_index` identifies a specific Markdown link occurrence in the staged corpus
  - rows with a blank `corrected_text` are treated as seed inventory and are ignored by the correction pass until curated text is supplied
- The page body override contract is:
  - manifest path: `migration/input/body-overrides.json`
  - body directory: `migration/input/body-overrides/`
  - required JSON keys per row: `page_url`, `body_file`
  - optional JSON key: `description`
  - matching rule: `page_url` identifies the staged Markdown file whose body should be replaced during the correction pass; `body_file` resolves relative to `migration/input/body-overrides/`
  - intended use: durable authored replacements for source-content defects that are not pipeline bugs but must survive reruns
- Seed or refresh the weak-link inventory with `npm run migrate:export-link-text-corrections`.
- The correction pass writes:
  - `migration/reports/content-corrections-summary.json`
  - `migration/reports/image-alt-corrections-audit.csv`
  - `migration/reports/link-text-corrections-audit.csv`
- Current validated 2026-03-11 behavior on a fresh staged-content temp run:
  - updated 133 of 171 staged Markdown files on the first correction pass
  - normalized 187 fenced code blocks carrying wrapper indentation artifacts
  - split 57 mixed image-and-prose paragraph lines into separate Markdown blocks
  - applied 314 curated image-alt corrections from `migration/input/image-alt-corrections.csv`
  - reported 0 unmatched curated alt corrections
  - reran idempotently with 0 updated files on the second pass
  - reduced the fenced-code indentation scan from 185 findings across 50 files to 0 findings across 0 files after the final heuristic adjustment
- Current validated 2026-03-11 follow-up behavior after the accessibility remediation refresh:
  - `npm run migrate:export-link-text-corrections` seeded 47 weak-link inventory rows in `migration/input/link-text-corrections.csv`
  - `npm run migrate:apply-corrections` updated 4 files on the first rerun after the script change, auto-promoted 3 malformed table header rows, and applied 1 curated alt correction
  - after curating descriptive labels in `migration/input/link-text-corrections.csv`, `npm run migrate:apply-corrections` updated 37 files with 46 link-text replacements, and a second occurrence-specific ERD follow-up updated 1 file with 2 more replacements
  - `npm run check:a11y-content` now reports 0 blocking findings and 2 warnings: 1 remaining weak-link row in the PWA Kit v2.6.0 sentence plus 1 multiline-table warning in the realm-split article
- Current validated 2026-03-11 pilot remediation behavior:
  - a pilot rerun after script updates repaired flattened inline callout labels in the caching, hooks, and instance articles, repaired the split-word WebDAV inline link, and split the home-page link-and-image block into separate Markdown blocks
  - the correction pass now supports page-level body overrides and was used to replace the legacy About-page placeholder source via `migration/input/body-overrides.json` and `migration/input/body-overrides/about.md`
  - a second `npm run migrate:apply-corrections` rerun remained idempotent with `filesChanged: 0`
- Validation steps for the correction pass:
  - `npm run migrate:export-alt-corrections -- --current-dir migration/output/content --baseline-dir tmp/rhi-correction-validate-content --output-file migration/input/image-alt-corrections.csv` when reseeding curated alt text from reviewed staged content
  - `npm run migrate:export-link-text-corrections`
  - `npm run migrate:apply-corrections`
  - rerun `npm run migrate:apply-corrections` and confirm the summary reports 0 updated files
  - `hugo --minify --environment production --contentDir migration/output/content --destination tmp/rhi-corrections-public`
  - `npm run check:a11y-content`

### RHI-039 - SEO Signal Preservation

### RHI-042 - Reporting, Traceability, and Threshold Enforcement

- Run reporting only after the standard post-mapping sequence has completed for the batch under review:
  - `npm run migrate:map-frontmatter`
  - `npm run migrate:finalize-content`
  - `npm run migrate:report`
  - `npm run check:migration-thresholds`
- `npm run migrate:report` reads:
  - `migration/intermediate/records.normalized.json`
  - `migration/output/*.json`
  - staged Markdown under `migration/output/content/`
  - stage reports under `migration/reports/`
- `npm run migrate:report` writes `migration/reports/migration-item-report.csv` with the Phase 4 per-item audit trail columns:
  - `source_id`, `primary_source_type`, `source_channel_set`, `source_url`
  - `target_file`, `target_url`, `disposition`, `conversion_mode`
  - `media_status`, `seo_status`, `a11y_status`, `security_status`, `url_parity_status`
  - `content_corrections_status`, `qa_status`, `owner`
- Approved 2026-03-11 rollup rules for batch reporting:
  - `primary_source_type` comes from the normalized record `sourceType`; `source_channel_set` joins the normalized `sourceChannels` array in deterministic order
  - `conversion_mode` resolves to `markdown` for standard converted records, `html-fallback` when fallback rows exist without manual-review escalation, and `manual` for manual-review conversions plus non-generated disposition records such as retire/category decisions
  - `content_corrections_status` resolves to `clean` when no correction audit rows were applied, `corrected` when the alt-text or link-text audits show applied fixes, and `review-required` when any correction audit row is unmatched
  - `qa_status` resolves to `blocked` on any fail state, missing or hotlinked media, front matter errors, or manual-review conversions for generated content; `review-required` on warnings, `html-fallback`, or applied correction rows; otherwise `ready`
- Approved 2026-03-11 threshold defaults:
  - zero tolerance: any `url_parity_status=fail` on a file-backed migrated content row (`target_file` present)
  - zero tolerance: any required front matter failure from `migration/reports/frontmatter-errors.csv` or the blocking front matter checks in `migration/reports/seo-completeness-report.csv`
  - zero tolerance: any `noindex_absent` failure from `migration/reports/seo-completeness-report.csv`
  - cap: maximum `5` `html-fallback` rows per batch
  - cap: maximum `25` item rows with `a11y_status=warn`
- Taxonomy and other generated surfaces without a migration-owned `target_file` remain visible in `migration-item-report.csv` and `migration/reports/url-parity-report.csv`, but they do not block `check:migration-thresholds`; those route-level gaps stay owned by the dedicated URL parity and route-governance workstreams.
- Threshold caps can be overridden for dry runs or future owner-approved changes with:
  - `MIGRATION_THRESHOLD_HTML_FALLBACK_CAP=<count>`
  - `MIGRATION_THRESHOLD_A11Y_WARNING_CAP=<count>`
- Current CI contract in `.github/workflows/build-pr.yml`:
  - the migration batch validation job runs `npm run migrate:finalize-content`, `npm run migrate:report`, `npm run check:migration-thresholds`, then builds `tmp/migration-pr-public` as a staged sanity check
  - the job explicitly verifies that the required `migration/reports/` files exist before uploading the artifact bundle
  - `migration/reports/` uploads as a GitHub Actions artifact with `retention-days: 7`, even when the threshold gate fails
- Report artifacts that must exist for batch review:
  - `migration/reports/migration-item-report.csv`
  - `migration/reports/url-parity-report.csv`
  - `migration/reports/conversion-fallbacks.csv`
  - `migration/reports/media-integrity-report.csv`
  - `migration/reports/frontmatter-errors.csv`
  - `migration/reports/seo-completeness-report.csv`
  - `migration/reports/feed-compatibility-report.csv`
  - `migration/reports/a11y-content-warnings.csv`
  - `migration/reports/security-content-scan.csv`
  - `migration/reports/link-rewrite-log.csv`
  - `migration/reports/content-corrections-summary.json`
  - `migration/reports/image-alt-corrections-audit.csv`

### RHI-043 - Pilot Selection and Batch Prep

- Generate the pilot candidate ledger before selecting `migration/input/pilot-source-ids.txt`:
  - `npm run migrate:pilot-candidates`
- `npm run migrate:pilot-candidates` reads:
  - `migration/intermediate/records.normalized.json`
  - `migration/output/*.json`
  - `migration/url-manifest.json`
  - `migration/phase-1-seo-baseline.md`
- The command writes:
  - `migration/reports/pilot-selection-candidates.csv`
  - `migration/reports/pilot-selection-summary.json`
- Candidate ledger columns identify source-backed pilot coverage signals without patching generated Markdown:
  - traffic rank from the owner-approved Phase 1 SEO baseline tables (`top_90_rank`, `top_28_rank`)
  - Hugo-compatible alias coverage for static redirect validation (`compatible_alias_count`)
  - content-shape heuristics for long-form/code/table and embedded-media candidates
  - route-validation-only retire candidates that should produce no staged output
- Current validated 2026-03-11 findings from the generated summary:
  - the normalized corpus has `0` source-backed `merge` records, so redirect coverage must be planned with alias-backed keep records and one manifest merge URL
  - the normalized corpus has `0` source-backed `postType=video` records; the current video-related candidate is the `/video/` page
  - the Phase 1 baseline contains both 90-day and 28-day top-page lists, so the migration owner must choose the authoritative traffic window before locking the pilot source-id file
- Owner decisions recorded on 2026-03-11 for the first pilot lock:
  - top-traffic window: `90-day`
  - homepage counts separately from the five traffic-priority pages
  - `/video/` satisfies the video-related criterion
  - the redirect scenario uses the alias-backed keep record `/delta-exports-in-salesforce-b2c-commerce-cloud/` plus its matching manifest merge URL `/delta-exports-in-salesforce-b2c-commerce/`
  - the pilot accessibility warning cap stays at `25`
- The locked source-backed pilot input currently lives at `migration/input/pilot-source-ids.txt` and contains 20 records.
- With the locked `migration/input/pilot-source-ids.txt` in place, run the subset pipeline starting with:
  - `npm run migrate:extract -- --source-id-file migration/input/pilot-source-ids.txt`
  - `npm run migrate:normalize`
  - `npm run migrate:convert`
  - `npm run migrate:download-media`
  - `npm run migrate:map-frontmatter`
  - `npm run migrate:finalize-content`
  - `npm run migrate:report`
  - `npm run check:migration-thresholds`
- For staged pilot-only link validation, allow manifest-backed non-pilot targets so the checker validates rewrite correctness instead of requiring the full site corpus in the temporary build:
  - `CHECK_LINKS_PUBLIC_DIR=tmp/rhi043-public CHECK_LINKS_ALLOW_MANIFEST_TARGETS=1 npm run check:links`

- Run the SEO completeness validator after the staged migration corpus has completed the normal post-mapping preparation sequence:
  - `npm run migrate:map-frontmatter`
  - `npm run migrate:rewrite-media`
  - `npm run migrate:rewrite-links`
- The completeness validator reads migration-facing inputs from:
  - `migration/output/content/`
  - `migration/url-manifest.json`
  - `migration/phase-1-seo-baseline.md`
  - a built Hugo output directory (`public/` by default, or a staged directory passed through `--public-dir`)
- Current validated contract for this workstream:
  - all staged launch-intended Markdown files must have non-empty `title`, `description`, `url`, `date`, and `lastmod`
  - post entries must carry at least one category in front matter
  - indexable staged content must not set `noindex` in either top-level or `seo.noindex` front matter
  - the validator performs sampled built-output checks for homepage, top-traffic pages from the Phase 1 baseline, category routes, video routes, backlink-backed routes, and merge-target routes when those routes are present in the built output
  - sampled HTML checks enforce canonical-to-target parity, sitemap inclusion, and that internal links do not point at legacy merge routes or missing built routes
- The completeness validator writes `migration/reports/seo-completeness-report.csv` and exits non-zero on blocking failures.
- Build staged migrated content before sampled HTML validation when the default `public/` build does not correspond to `migration/output/content/`:
  - `hugo --minify --environment production --contentDir migration/output/content --destination tmp/rhi039-public`
  - `npm run check:seo-completeness -- --public-dir tmp/rhi039-public`
- Run the feed compatibility validator with `npm run check:feed-compatibility` after a production-style build.
- Run the noindex gate with `npm run check:noindex` on the same production-style build output. Use `CHECK_NOINDEX_PUBLIC_DIR=tmp/rhi039-public npm run check:noindex` when validating a staged migration build outside `public/`.
- The feed validator checks:
  - canonical Hugo feed output at `index.xml`
  - Pages-compatible helper routes at `/feed/`, `/feed/rss/`, and `/feed/atom/`
  - `robots.txt` does not disallow the canonical or compatibility feed endpoints
- The feed validator writes `migration/reports/feed-compatibility-report.csv` and exits non-zero on feed regressions.
- The noindex gate fails when production-style HTML emits `noindex` on indexable routes; feed helpers, other redirect pages, and the 404 route remain exempt.
- Current repository behavior remains aligned with the Phase 2 and Phase 3 contract:
  - Hugo emits the canonical XML feed at `/index.xml`
  - Pages-safe helper routes under `src/static/feed/` meta-refresh to `/index.xml`
  - edge redirects remain the required launch-time mechanism for canonical legacy feed preservation beyond Pages fallback behavior

### RHI-034 - HTML-to-Markdown Conversion

- Run the converter with `npm run migrate:convert`.
- The converter reads the canonical normalized record set from `migration/intermediate/records.normalized.json` and processes only manifest-backed `keep` and `merge` records.
- The converter writes deterministic Phase 4 conversion artifacts to:
  - `migration/output/*.json` as one converted JSON record per `sourceId`
  - `migration/reports/conversion-fallbacks.csv` as the fallback work queue
- Current validated 2026-03-10 behavior:
  - 193 keep/merge records convert successfully on the full run
  - the validated fallback report contains header-only output with zero rows
  - warning distribution on the validated full run is:
    - `missing-image-alt`: 211
    - `shortcode-converted-to-note`: 2
  - body-heading normalization reserves `h1` for the template title by shifting body `h1` elements to `h2`, and now also clamps later heading jumps so generated Markdown does not skip directly from `h2` to `h4` or deeper levels
  - literal technical examples such as `<iscache>`, `<iframe>`, `<picture>`, `<img>`, `<video>`, `<object>`, `<link rel="preload">`, and placeholder tokens like `<key>` are preserved as inline code so Hugo Goldmark can render them with raw HTML disabled
  - known shortcode handling on the current corpus converts `matomo_opt_out` and `cmplz-document` to explicit Markdown notes rather than silent removal
  - loose WordPress alert paragraphs such as `Asynchronous`, `Limitations`, `Deprecated`, `Documentation`, and `Important` are rewritten into GitHub-style blockquote alerts so Hugo renders them through the existing article callout blockquote hook instead of flattening them into body text
  - Hugo now renders non-alert blockquotes as regular editorial quotes while keeping alert-designated blockquotes on the labeled callout path, so quotations and warnings no longer share the same presentation
  - unknown iframe handling remains implemented as a commented marker plus fallback-log entry, but the validated keep/merge corpus currently contains zero iframe embeds
- Corpus audit findings used to shape the converter rules:
  - Gutenberg wrapper comments currently appear only as `paragraph` and `heading`
  - real shortcode usage in the keep/merge corpus is limited to `matomo_opt_out` and `cmplz-document`
  - no iframe hosts are present in the current keep/merge corpus
- Validation steps for RHI-034:
  - `npm run migrate:convert`
  - confirm `migration/reports/conversion-fallbacks.csv` is present and review any rows before batch inclusion
  - rerun `npm run migrate:convert` and confirm the generated output hashes remain stable
  - spot-check `migration/output/14050.json` and `migration/output/content/posts/real-time-inventory-checks-in-sfcc.md` when alert-heavy posts are in scope
  - spot-check `migration/output/1845.json` and `migration/output/content/posts/get-connected-at-salesforce-connections-2022.md` when heading-heavy schedule or playlist content is in scope
  - build a temporary Hugo site from a representative 10-record sample and confirm Hugo emits zero `warning-goldmark-raw-html` warnings for the generated Markdown

### RHI-035 - Front Matter Mapping

- Run the mapper with `npm run migrate:map-frontmatter`.
- The mapper reads converted Phase 4 JSON artifacts from `migration/output/` and writes final staged Markdown files to:
  - `migration/output/content/posts/*.md`
  - `migration/output/content/pages/*.md`
- Current validated 2026-03-10 behavior:
  - 171 keep/merge non-category records map successfully to staged Markdown
  - `migration/reports/frontmatter-errors.csv` contains header-only output with zero data rows on the validated full run
  - `migration/reports/discovery-metadata-coverage.json` remains deterministic across reruns and reports 0 discovery-enriched records in the current corpus
  - 123 query-style `/?p=` aliases are intentionally excluded from front matter because the approved Phase 2 alias contract is path-only and the generated-content validator rejects non-path Hugo aliases
  - true featured-image linkage now survives extraction and normalization, so the mapper emits `heroImage` when `_raw.extracted.featuredImageUrl` is available; the current validated run produces `heroImage` for all 150 staged posts and 8 staged pages with true featured-image metadata
  - description generation now normalizes Markdown artifacts, avoids forced ... truncation, and prefers sentence-complete metadata text with a concise fallback suffix when source copy is too short
  - when `_raw.extracted.metaDescription` is present, the mapper now prefers that source metadata before falling back to excerpt/body-derived text, and Markdown link text is preserved during description normalization
  - mapper output still uses source-side media URLs at this stage; local `/media/...` rewriting remains the downstream RHI-037 responsibility
- Mapper hard-fail behavior now includes:
  - empty `title`
  - invalid or missing canonical `url`
  - alias self-reference
  - duplicate `url` values across generated files
  - duplicate staged output file paths
- Validation steps for RHI-035:
  - `npm run migrate:map-frontmatter`
  - `node scripts/validate-frontmatter.js --content-dir migration/output/content`
  - confirm `migration/reports/frontmatter-errors.csv` remains header-only
  - rerun `npm run migrate:map-frontmatter` and confirm the generated Markdown and both reports hash identically
  - spot-check 10 representative generated files against their `migration/output/*.json` source records for exact `url`, derived `draft`, description presence, and clean omission of optional fields when absent

### RHI-036 - URL Preservation and Redirect Integrity

- Phase 4 URL validation now uses two migration-owned scripts:
  - `npm run check:url-parity` runs `scripts/migration/validate-url-parity.js`
  - `npm run check:redirects` runs `scripts/migration/check-redirects.js`
  - `npm run check:url-parity:baseline` preserves the Phase 3 scaffold baseline at `scripts/check-url-parity.js`
- For staged Phase 4 validation, build Hugo against the generated migration content instead of `src/content/`:
  - `hugo --minify --environment production --contentDir migration/output/content --destination tmp/rhi036-public`
  - `npm run check:url-parity -- --content-dir migration/output/content --public-dir tmp/rhi036-public`
  - `npm run check:redirects -- --public-dir tmp/rhi036-public`
- Current validated 2026-03-10 behavior:
  - `migration/reports/url-parity-report.csv` is generated with the required columns `legacy_url`, `disposition`, `expected_target`, `actual_outcome`, `status`, `severity`
  - query-style legacy URLs that static Hugo output cannot represent are reported as `deferred-edge-redirect`
  - the first staged run produced 1201 parity rows with 38 failures, including 27 critical failures
  - after the staged taxonomy-route fixes and the owner-approved delta-exports disposition correction, the latest staged run now reports 9 warning-level failures, 0 critical failures, and 528 deferred edge-layer rows
  - the remaining warning rows are unresolved keep URLs without source-backed staged content and should be treated as manifest/content cleanup rather than validator defects
  - the redirect integrity checker now reports 126 merge URLs with 0 critical failures; all 126 are currently deferred to the edge layer because 123 merge records are `/?p=` routes and 3 merge records now require edge handling
- Static-hosting contract locked for this workstream:
  - 123 merge URLs and 402 retire URLs in `migration/url-manifest.json` are query-style legacy routes that Hugo cannot emit as distinct `public/` files
  - these rows remain valid Phase 4 reporting inputs, but full runtime redirect validation stays with the required edge redirect layer
- The staged Hugo build now completes, but it still emits three `warning-goldmark-raw-html` warnings for generated posts; keep those warnings visible until the underlying conversion/rendering issue is resolved upstream.

### RHI-037 - Media Migration and Asset Hygiene

- Run the media downloader with `npm run migrate:download-media`.
- The downloader reads `migration/intermediate/records.normalized.json`, groups media refs by canonical source URL, and writes:
  - `migration/intermediate/media-manifest.json`
  - `migration/reports/media-missing.csv`
- Owner-approved storage contract for the current implementation:
  - processable raster images are stored as Hugo global resources under `src/assets/media/`
  - non-processable files and direct attachments stay under `src/static/media/`
  - true featured images are emitted only when source channels provide verified linkage; no first-body-image fallback is synthesized
  - the downloader can recover `404` WordPress-origin assets from the approved filesystem snapshot root at `tmp/website-wordpress-backup/wp-content` when HTTP fetches fail
- Run the rewrite pass with `npm run migrate:rewrite-media`.
- Build staged migration content before running the integrity gate:
  - `hugo --minify --environment production --contentDir migration/output/content --destination tmp/rhi037-public`
- Run the integrity gate with:
  - `npm run check:media -- --content-dir migration/output/content --public-dir tmp/rhi037-public`
- Current 2026-03-10 implementation status:
  - normalization now adds verified featured-image source URLs into `mediaRefs`, which allows the media pipeline to download and rewrite hero-banner assets alongside body images
  - the latest full corpus run groups 1803 source references into 574 canonical media items
  - after HTTP download plus filesystem fallback recovery and the final normalization-time thumbnail remap, `migration/reports/media-missing.csv` is now header-only for the staged release-candidate batch
  - `npm run migrate:download-media` now caps any localized hero image above the 2000px longest-edge budget during asset generation, which removes the previous 30 hero-size gate failures without changing content paths
  - `npm run migrate:rewrite-media` now rewrites all staged post and page `heroImage` fields with verified featured-image linkage to local `/media/...` paths
  - the rewrite pass now correctly replaces media URLs inside Markdown image and link syntax, which removes the prior WordPress hotlink left in `guide-to-the-getprops-method-in-sfcc`
  - the staged `video` page now uses a local WordPress-backed fallback image for the final unresolved YouTube thumbnail instead of leaving a dead mixed-content URL in the rendered output
  - the staged Hugo build now completes successfully against `migration/output/content`
  - `npm run check:media -- --content-dir migration/output/content --public-dir tmp/rhi037-public` now reports 0 failures on the staged release-candidate content set
  - Markdown body images now resolve through a Hugo render hook backed by global resources, but bulk `.Process` transforms were intentionally not applied in the render hook after the staged build hit Hugo memory/panic failures

### RHI-040 - Accessibility and Content Semantics

- Run the Markdown-level accessibility gate with `npm run check:a11y-content`.
- Current owner-approved threshold contract for the 2026-03-10 implementation:
  - blocking cap: `0`
  - weak-link warning cap: `5` findings per batch
  - generic or filename-like alt text is `blocking`
  - empty alt text is only allowed when the image is declared explicitly in `migration/input/a11y-content-exceptions.json`
- Optional decorative-image exception file contract:
  - path: `migration/input/a11y-content-exceptions.json`
  - shape: `{ "decorativeImages": [{ "file": "posts/example.md", "src": "/media/example.jpg", "reason": "decorative separator" }] }`
  - exceptions are matched by staged content-relative file path plus image `src`
- The content gate scans all staged Markdown under `migration/output/content/` and records per-finding output at:
  - `migration/reports/a11y-content-warnings.csv`
- Finding classes currently enforced by the content gate:
  - blocking: missing alt text, generic or filename-like alt text, body `h1` headings, empty Markdown table headers
  - warnings: skipped heading levels, weak link text (`click here`, `read more`, `here`), Markdown tables missing a divider row
- Representative rendered-page validation still uses the Phase 3 command surface. For staged migration content, build the staged site first and then point `npm run check:a11y` at that build and sample set:
  - `hugo --minify --environment production --contentDir migration/output/content --destination tmp/rhi040-public`
  - `CHECK_A11Y_PUBLIC_DIR=tmp/rhi040-public CHECK_A11Y_URLS='["/","/posts/","/category/","/category/release-notes/","/about/","/video/","/how-to-set-up-slas-for-the-composable-storefront/","/how-to-use-node-18-with-sfra/","/the-realm-split-field-guide-to-migrating-an-sfcc-site/","/what-can-i-use-chatgpt-for-when-working-with-salesforce/"]' npm run check:a11y`
- `scripts/check-a11y.js` now serves the directory from `CHECK_A11Y_PUBLIC_DIR` when present and replaces the `.pa11yci.json` route list with `CHECK_A11Y_URLS` when that env var is set to a JSON array or comma/newline-delimited list.
- Manual keyboard review for this workstream reuses the Phase 3 checklist above. At minimum, verify on one representative migrated article that:
  - the skip link is the first focusable element
  - activating the skip link moves focus to `#main-content`
  - subsequent `Tab` navigation reaches article-region interactive elements with a visible focus indicator
- Current validated 2026-03-10 baseline status:
  - `npm run check:a11y-content` now scans 171 staged Markdown files and reports 0 blocking findings plus 2 warnings; 1 is a remaining weak-link warning and 1 is the multiline-table warning in the realm-split article
  - the deterministic 10-page rendered sample now passes on 10 of 10 routes after the targeted `/about/`, SLAS, ChatGPT, and code-block remediations
  - the default Phase 3 rendered route set still passes on 6 of 6 routes, and a staged 4-page sample covering the newly corrected Einstein, PWA Kit, sitemap, and realm-split articles also passes on 4 of 4 routes
  - the owner-approved weak-link cap is now satisfied at `1/5`; the remaining cleanup work is limited to the single unresolved PWA Kit weak-link sentence and the multiline-table warning in the realm-split article

### RHI-041 - Security and Data Hygiene

- Run the staged migration security gate with `npm run check:security-content`.
- The command now builds a production-style staged site from `migration/output/content/` into `tmp/rhi041-public` and then scans both:
  - staged Markdown under `migration/output/content/`
  - rendered article-body HTML under `tmp/rhi041-public`
- Current blocking findings for this gate are:
  - raw `<script>` tags in content
  - inline `on*=` event handler attributes
  - `javascript:` URI schemes
  - WordPress nonce or auth artifacts such as `_wpnonce`, `X-WP-Nonce`, `wordpress_logged_in_*`, `wordpress_sec_*`, `wp-postpass_*`, or `wp-settings-*`
  - `draft: false` when the mapped source record status is not `publish`
  - source-system-only front matter keys such as `sourceId`, `legacyUrl`, `_raw`, `wpPostId`, or leaked local filesystem paths
- Current warning findings for this gate are:
  - unapproved `<iframe>` hosts; approved allowlist entries are YouTube (`youtube.com`, `youtu.be`, `youtube-nocookie.com`) and Vimeo (`vimeo.com`, `player.vimeo.com`)
  - WordPress admin or REST API URLs in content (`/wp-admin/`, `/wp-json/wp/v2/`)
  - `http://` image references on pages that will be served over HTTPS
- Goldmark safety contract for this workstream:
  - Hugo Goldmark raw HTML remains non-rendering in the staged migration build, and the current validated run still emits `warning-goldmark-raw-html` warnings for three posts while omitting that raw HTML from rendered output
  - keep those warnings visible as evidence that inline raw HTML is not being rendered; do not suppress them just to make the build quieter
- Batch execution sequence for pilot and downstream migration batches:
  - `npm run migrate:map-frontmatter`
  - `npm run migrate:finalize-content`
  - `npm run check:security-content`
- Current validated 2026-03-11 status:
  - pre-implementation spot-audit on a 20-record sample found no live `<script>`, inline `on*=`, or `javascript:` patterns in corrected Markdown; only non-blocking general `http://` links and one prose `<iframe>` mention were observed during manual review
  - `npm run check:security-content` now scans 171 staged Markdown files plus 171 rendered article pages and writes `migration/reports/security-content-scan.csv`
  - the validated release-candidate report is header-only with `0` critical findings and `0` warnings
- GitHub Pages hosting constraints for this gate:
  - GitHub Pages HTTPS enforcement remains the documented platform control for the public site; keep `Enforce HTTPS` enabled
  - stricter response-header policy decisions such as CSP, HSTS, `X-Frame-Options` or `frame-ancestors`, `Permissions-Policy`, and `X-Content-Type-Options` remain edge/CDN follow-up work rather than repository-artifact controls
  - see `docs/migration/SECURITY-CONTROLS.md` and `migration/phase-1-security-header-matrix.md` before Phase 6/7 cutover decisions

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
