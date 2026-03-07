# Phase 7 Detailed Plan: GitHub Pages Deployment and Domain Cutover

## Purpose
Deploy the migrated Hugo site to GitHub Pages and execute a controlled domain cutover for https://www.rhino-inquisitor.com with minimal SEO risk, minimal downtime, and explicit rollback safety.

Phase 7 converts the migration build output into production traffic serving. This is the highest blast-radius phase because deployment, DNS, HTTPS, canonical host behavior, and redirect behavior all converge here.

## Why Phase 7 Is High Risk
1. A technically successful build can still fail at launch if DNS, domain settings, or artifact shape is wrong.
2. Host mismatch during cutover can create duplicate-host indexing and canonical conflicts.
3. Invalid Pages permissions or environment rules can block deployment during launch window.
4. Certificate issuance can lag DNS and custom-domain changes, delaying HTTPS availability and launch readiness.
5. Large artifacts and slow deployments can exceed Pages deployment time constraints.
6. Missing post-deploy verification can hide broken URLs, wrong canonicals, or incomplete redirects until search engines crawl.

## Phase Position and Dependencies
From [main-plan.MD](main-plan.MD), Phase 7 depends on Phase 3 and can begin setup in parallel with Phases 4 and 5.

Phase 7 consumes:
1. [plan/details/phase-3.md](plan/details/phase-3.md): Hugo scaffolding, template architecture, SEO partials, CI baseline.
2. [plan/details/phase-4.md](plan/details/phase-4.md): migrated content, explicit URL fields, alias outputs, media paths.
3. [plan/details/phase-5.md](plan/details/phase-5.md): canonical/metadata rules, sitemap/robots policy, schema requirements.
4. [plan/details/phase-6.md](plan/details/phase-6.md): URL preservation map, redirect architecture decision, parity gate policy.

Phase 7 enables:
1. Phase 8 launch-readiness validation on live infrastructure.
2. Phase 9 post-launch monitoring and stabilization.

## Scope
In scope:
1. GitHub Pages custom workflow deployment pipeline.
2. Workflow permissions, environment protections, and deployment guardrails.
3. Artifact integrity constraints for Pages compatibility.
4. Custom domain configuration and DNS cutover execution.
5. HTTPS issuance and enforcement readiness.
6. SEO-safe host canonicalization during cutover.
7. Launch-day runbook, smoke tests, rollback strategy, and incident thresholds.

Out of scope:
1. Bulk migration transformation internals (Phase 4).
2. Full SEO template architecture design (Phase 5).
3. Long-term SEO growth experiments after stabilization (Phase 9+).

## Non-Negotiable Constraints (Release Blocking)
1. Pages publishing source is GitHub Actions, not branch-based Jekyll publishing.
2. Deploy job permissions include at least `pages: write` and `id-token: write`.
3. Build artifact contains top-level `index.html` and is Pages-compatible (no symlinks/hard links in artifact).
4. Canonical production host is locked before cutover and reflected in build outputs.
5. Custom domain is configured in Pages settings before DNS records are pointed at GitHub Pages.
6. HTTPS is available and enforceable before declaring launch complete.
7. URL parity and redirect gates from Phase 6 pass on the release candidate.
8. Rollback procedure is validated and owners are assigned before DNS cutover.
9. Deploy job must depend on successful build and artifact upload stages (`needs`/equivalent dependency).
10. `github-pages` environment protections are configured so only approved refs and actors can deploy.

## Critical Corrections Encoded in This Phase
1. GitHub Pages custom workflow behavior is explicit:
1.1. Deployment is performed through `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`.
1.2. The Pages environment is treated as the production deployment control plane.

2. Custom domain configuration source of truth is explicit:
2.1. For custom workflow deployments, custom domain must be managed in GitHub Pages settings.
2.2. Repository `CNAME` is not treated as authoritative in this model.

3. Artifact constraints are enforced:
3.1. Published Pages site output must stay below the 1 GB site limit.
3.2. Deployment duration must stay comfortably below the 10-minute timeout limit.
3.3. Pages artifact tarball must stay below 10 GB and avoid unsupported file/link types.

4. Domain security sequencing is explicit:
4.1. Set domain in GitHub first, then update DNS records.
4.2. Add domain verification TXT records to reduce domain takeover risk.

5. Canonical host discipline is explicit:
5.1. Canonical host for this migration is `https://www.rhino-inquisitor.com`.
5.2. Apex and protocol variants must consolidate to this host.

## Workstream A: Deployment Workflow Architecture
Goal: produce deterministic, auditable deployments with minimal cutover risk.

Required workflow file:
1. [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml) with jobs for build, artifact upload, and deploy.

Required workflow characteristics:
1. Trigger on pushes to protected release branch and manual dispatch.
2. Set minimal job permissions:
2.1. `contents: read`
2.2. `pages: write`
2.3. `id-token: write`
3. Use `actions/configure-pages` before Hugo build.
4. Build with production-compatible base URL:
4.1. `hugo --gc --minify --baseURL "${{ steps.pages.outputs.base_url }}/"`
5. Upload the `public` directory with `actions/upload-pages-artifact`.
6. Deploy with `actions/deploy-pages` to the `github-pages` environment.
7. Deploy job must explicitly depend on build and artifact upload completion (`needs`).
8. Enforce deployment concurrency so only one production deploy runs at a time.
9. Pin Actions to stable major versions or commit SHAs per repository policy.

Recommended workflow hardening:
1. Protect the `github-pages` environment with required reviewers and ref restrictions.
2. Treat Pages settings as "source = GitHub Actions" only; do not assume Pages binds deployment to one workflow file.
3. Fail-fast gates before artifact upload (URL parity, link checks, metadata checks).

Acceptance criteria:
1. Workflow can deploy same commit repeatedly with functionally equivalent outputs (routing, canonical, and required SEO metadata checks remain stable).
2. Deploy logs show successful Pages deployment ID and environment URL.
3. Deployment can be re-run without manual cleanup.

## Workstream B: Artifact Integrity and Build Limits
Goal: prevent deploy-time failures caused by invalid artifact structure or size.

Artifact requirements:
1. Top-level `index.html` present.
2. No symlinks or hard links in final artifact.
3. Artifact contains only files and directories (no unsupported special file types).
4. Artifact packaged exactly through Pages artifact action defaults.
5. Artifact size budget target: less than 700 MB compressed output as internal guardrail.
6. Absolute hard stop if projected deploy output approaches Pages limits.

Build output controls:
1. Enable Hugo garbage collection (`--gc`) and minification (`--minify`).
2. Optimize image assets during migration pipeline to reduce output weight.
3. Prevent accidental inclusion of source dumps, archives, or backup files in `public`.
4. Validate deterministic output paths and case consistency.
5. `.nojekyll` is required only for branch-based publishing patterns; it is not required for Pages custom workflow artifact deployments.
6. Custom workflow publishing is not subject to the branch-build soft limit (10 builds/hour), but deployment timeout and published-site size limits still apply.
7. Monitor monthly bandwidth usage against GitHub Pages soft guidance to avoid surprise service pressure post-cutover.

Acceptance criteria:
1. Artifact validator report is attached to CI run.
2. Size and structure checks pass on release candidate commit.

## Workstream C: Domain and DNS Cutover Strategy
Goal: cut traffic to GitHub Pages cleanly while preserving canonical host and minimizing propagation uncertainty.

Canonical host decision:
1. Canonical host remains `www.rhino-inquisitor.com`.
2. Apex host is configured as alternate with Pages-supported apex records so GitHub Pages can automatically redirect apex and `www` based on configured custom-domain host.

Preparation tasks (minimum 24 hours before cutover):
1. Reduce DNS TTL on relevant records where provider allows.
2. Configure custom domain in GitHub Pages settings first.
3. Verify the domain in GitHub account/organization settings and keep the `_github-pages-challenge-...` TXT record in place.
4. Snapshot current DNS zone and active records for rollback.
5. Remove conflicting wildcard or stale records that could shadow Pages records.

DNS record model:
1. `www` as CNAME to `<owner>.github.io` (excluding repository name).
2. Apex configured using provider-supported ALIAS/ANAME or GitHub-documented A/AAAA records.
3. No conflicting second CNAMEs or stale A records for `www`.
4. Do not point `www` CNAME at apex; point directly to `<owner>.github.io`.

Validation commands for runbook:
1. `dig www.rhino-inquisitor.com CNAME +short`
2. `dig rhino-inquisitor.com A +short`
3. `dig rhino-inquisitor.com AAAA +short`
4. `dig _github-pages-challenge-<github-username-or-org>.rhino-inquisitor.com TXT +short`

Cutover acceptance criteria:
1. DNS responses match intended records from at least two independent resolvers.
2. Pages settings show custom domain check as healthy.
3. `www` host serves new artifact over HTTPS.

## Workstream D: HTTPS Issuance and Security Controls
Goal: ensure encrypted traffic and safe launch posture from first production requests.

Tasks:
1. Monitor certificate issuance status in Pages settings.
2. Enable Enforce HTTPS when available.
3. Validate no mixed-content references in templates or content.
4. If CAA records exist, ensure `letsencrypt.org` authorization is present to avoid issuance failure.
5. Confirm canonical tags and sitemap URLs are HTTPS only.

Constraints and caveats:
1. Certificate provisioning can lag DNS changes; launch plan must include waiting window.
2. Enforce HTTPS availability can lag after domain changes; launch plan must include explicit wait/recheck logic.
3. If HTTPS cannot be enforced within launch window, rollback or hold criteria must trigger.

Acceptance criteria:
1. HTTPS works for homepage and representative deep URLs.
2. HTTP requests consolidate to HTTPS canonical host behavior.

## Workstream E: SEO-Safe Deployment and Host Consolidation
Goal: avoid migration-era duplicate indexing and preserve ranking signals during host cutover.

Required controls:
1. Build output canonical host equals `https://www.rhino-inquisitor.com`.
2. Sitemap URLs use canonical host and HTTPS only.
3. `robots.txt` references canonical sitemap URL.
4. Internal links resolve to canonical host and final paths.
5. Redirect map from Phase 6 is active and parity-tested on deployed artifact.
6. Feed endpoint continuity is validated (`/feed/` or mapped equivalent).
7. Canonical signals must not conflict: canonical tags, sitemap URLs, redirects, and internal links must agree on final host and path form.

Critical anti-regression checks:
1. No production pages emit canonicals to `github.io` host.
2. No `noindex` leakage from preview or staging assumptions.
3. No canonical points to redirected paths.

Acceptance criteria:
1. Canonical, sitemap, and internal link destinations align on sampled critical templates.
2. Top legacy inbound routes resolve as expected (`keep` direct render or approved redirect).

## Workstream F: Deployment Quality Gates and Tooling
Goal: make cutover decisions evidence-based rather than manual intuition.

Required CI gates before deploy job:
1. Hugo production build success gate.
2. URL parity checker from Phase 6 with zero missing required mappings.
3. Broken-link scanner across generated output.
4. Metadata/canonical completeness checker on representative templates.
5. Structured data sanity checks for required templates.
6. Artifact size and structure gate.

Recommended tooling stack:
1. Existing migration tooling:
1.1. `fast-glob` for output file discovery and parity checks.
1.2. `gray-matter` for front matter policy checks.
2. Suggested deployment validation tooling:
2.1. `lychee` for static link checking in generated site.
2.2. `@lhci/cli` for targeted pre-cutover Lighthouse checks.
2.3. `html-validate` for markup sanity on generated HTML samples.
2.4. Lightweight custom Node scripts for canonical/sitemap/robots consistency assertions.
3. Operational tooling:
3.1. `dig` and `nslookup` for DNS verification.
3.2. `curl -I` for response and redirect header validation.

Acceptance criteria:
1. All required gates pass on final release candidate commit.
2. Gate outputs are archived as deployment artifacts for auditability.

## Workstream G: Launch Window Execution Runbook
Goal: perform cutover in a predictable sequence with clear owner accountability.

T-7 to T-2 days:
1. Freeze workflow design and permissions.
2. Dry-run full deploy to Pages using non-production domain or staging expectation.
3. Validate all gates, smoke checks, and rollback steps.
4. Confirm Search Console ownership access and monitoring dashboards.

T-24 hours:
1. Lower DNS TTL where possible.
2. Confirm custom domain is configured in Pages settings.
3. Confirm domain verification TXT is in place.
4. Re-run release candidate CI with final content snapshot.

T-0 cutover:
1. Deploy signed release candidate artifact.
2. Apply DNS changes.
3. Monitor propagation and Pages health indicators.
4. Run smoke tests:
4.1. homepage
4.2. three recent posts
4.3. archive
4.4. three category pages
4.5. privacy-policy
5. Confirm canonical and sitemap on live host.

T+1 to T+24 hours:
1. Track 404 spikes and crawl anomalies.
2. Validate HTTPS enforcement and mixed-content absence.
3. Re-run parity checks against live domain.
4. Escalate if incident thresholds are crossed.

## Workstream H: Incident Response and Rollback
Goal: bound migration risk with predefined, executable fallback options.

Rollback triggers:
1. Critical URLs returning 404/5xx above threshold after propagation window.
2. Broken HTTPS/certificate issuance not resolved inside launch SLO.
3. Severe canonical/redirect defects on high-value templates.

Rollback options:
1. Redeploy last known good Pages artifact.
2. Revert DNS records to previous host if severe platform-blocking issue persists.
3. Temporarily hold crawl-sensitive endpoints from further changes while hotfixing.

Operational requirements:
1. Named incident commander for launch day.
2. Named deployment operator and DNS operator.
3. Shared incident log and timeline notes.
4. Stakeholder notification template prepared before launch.
5. Custom-domain safety note in runbook: do not leave DNS pointed at Pages if Pages site is disabled or detached.

Acceptance criteria:
1. Rollback dry run is completed pre-launch.
2. Mean time to rollback objective is documented and feasible.

## Deliverables Produced by Phase 7
1. [plan/details/phase-7.md](plan/details/phase-7.md) final approved plan.
2. [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml) production workflow with protected environment.
3. DNS change record and rollback snapshot.
4. Launch checklist and signed runbook.
5. Deployment validation report bundle (gates + smoke tests + DNS/HTTPS checks).

## Definition of Done
1. Deployment pipeline publishes Hugo artifact successfully to GitHub Pages from protected workflow.
2. Custom domain `www.rhino-inquisitor.com` is active, verified, and serving over HTTPS.
3. Canonical host and sitemap consistency checks pass on live domain.
4. URL parity and redirect gates pass with zero release-blocking defects.
5. Launch smoke tests pass for all critical routes.
6. Rollback path is tested and documented.

## Official References Incorporated
1. GitHub Pages custom workflows: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
2. Configuring publishing source for Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
3. Deploy Pages Action security and permissions: https://github.com/actions/deploy-pages
4. Upload Pages artifact constraints: https://github.com/actions/upload-pages-artifact
5. GitHub Pages limits: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
6. Custom domains and DNS records: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
7. Domain verification for Pages: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages
8. HTTPS for GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
9. Hugo host on GitHub Pages: https://gohugo.io/host-and-deploy/host-on-github-pages/
10. Hugo baseURL configuration: https://gohugo.io/configuration/all/
11. Hugo URLs and aliases: https://gohugo.io/content-management/urls/
12. Troubleshooting custom domains and HTTPS errors: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages
13. GitHub Pages with static site generators and `.nojekyll`: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site#static-site-generators
14. Google canonical consolidation guidance: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
15. Google site move guidance: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes