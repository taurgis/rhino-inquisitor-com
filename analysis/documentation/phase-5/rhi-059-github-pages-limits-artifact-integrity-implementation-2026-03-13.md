# RHI-059 GitHub Pages Limits and Artifact Integrity Implementation

Date: 2026-03-13
Ticket: `analysis/tickets/phase-5/RHI-059-github-pages-limits-artifact-integrity.md`

## Change summary

Added a repo-owned Pages constraints gate at `scripts/seo/check-pages-constraints.js`, exposed it as `npm run check:pages-constraints`, wired it into both the deploy workflow and PR build workflow after the production Hugo build, and moved `.nojekyll` to a source-controlled `src/static/.nojekyll` marker so local and CI artifacts stay aligned.

## Why this changed

Before this change, the repository depended on GitHub Pages action defaults and a post-build `touch public/.nojekyll` step, but it had no explicit guardrail for published-site size, no symlink or hard-link rejection gate, no committed Phase 5 report for artifact headroom, and no alias-growth measurement tied to the current redirect manifest. That left a launch-day failure mode unguarded even though Phase 5 and Phase 7 treat Pages artifact limits as release blockers.

## Behavior details

### Old behavior

- There was no `check:pages-constraints` command in `package.json`.
- Neither workflow had an explicit Pages artifact constraints step after the production build.
- `.github/workflows/deploy-pages.yml` injected `.nojekyll` directly into `public/` during CI instead of keeping the marker in source.
- The repository had no committed `migration/reports/phase-5-pages-constraints-report.md` artifact documenting current size, file count, redirect-helper footprint, and structure conformance.
- Custom-domain and HTTPS verification remained documented elsewhere as a Phase 7 concern, but RHI-059 had no ticket-specific evidence capture.

### New behavior

- `npm run check:pages-constraints` inspects `public/`, fails on size-budget breaches, symbolic links, hard links, unsupported special files, or a missing top-level `index.html`, and writes a markdown report.
- The report records current output size, gate headroom, 1 GB headroom, file and directory counts, manifest merge counts, detected redirect-helper page footprint, and the current `.nojekyll` source-marker state.
- Both `.github/workflows/deploy-pages.yml` and `.github/workflows/build-pr.yml` capture Hugo build duration and run the Pages constraints gate immediately after the production build.
- `src/static/.nojekyll` is now the repository source of truth, so the built artifact picks up the marker without a workflow-only mutation step.
- The report leaves GitHub Pages settings and production-domain readiness as explicit informational checks because they cannot be derived from repository state alone in the current environment; Thomas Theunen approved deferring those external checks to Phase 9.

## Impact

- Maintainers now get an explicit, reproducible failure before Pages artifact upload when the generated site exceeds the configured size budget or violates the Pages artifact file-type contract.
- PR validation now catches Pages artifact regressions before merge instead of only on main-branch deploys.
- The `.nojekyll` marker is visible in source control, which removes local-versus-CI drift.
- RHI-059 now has a Phase 5 evidence artifact and workflow gate coverage, while the external GitHub Pages repository-settings and HTTPS confirmation is recorded as an owner-approved Phase 9 defer item.

## Verification

- `npm run build:prod`
- `npm run check:pages-constraints`
- `npm run check:seo:artifact`
- `npm run check:links`

## Related files

- `scripts/seo/check-pages-constraints.js`
- `package.json`
- `.github/workflows/deploy-pages.yml`
- `.github/workflows/build-pr.yml`
- `src/static/.nojekyll`
- `migration/reports/phase-5-pages-constraints-report.md`
- `analysis/tickets/phase-5/RHI-059-github-pages-limits-artifact-integrity.md`

## Assumptions and open questions

- Official GitHub documentation says `.nojekyll` is not required for Actions-based Pages artifact deployments. This repository keeps the marker as a harmless, source-controlled consistency control because the ticket explicitly requires it and the marker does not interfere with the custom workflow.
- The current environment cannot directly inspect repository Pages settings because no authenticated GitHub settings session or CLI access is available.
- Thomas Theunen approved deferring the GitHub Pages custom-domain and HTTPS settings verification to Phase 9, so this implementation note records the current DNS state and accepted defer decision rather than treating settings access as a repository blocker.
- Public DNS for `www.rhino-inquisitor.com` still resolves through the legacy production stack today, so the ticket records current state rather than claiming GitHub Pages cutover readiness earlier than the owner-approved launch phase.