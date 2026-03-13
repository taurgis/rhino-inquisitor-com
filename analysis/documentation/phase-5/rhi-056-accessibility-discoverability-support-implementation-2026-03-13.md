# RHI-056 Accessibility Discoverability Support Implementation

Date: 2026-03-13
Ticket: `analysis/tickets/phase-5/RHI-056-accessibility-discoverability-support.md`

## Change summary

Implemented the Phase 5 accessibility discoverability gate for representative built Hugo output. The repository now includes a dedicated `pa11y-ci.config.js` profile, a `scripts/seo/check-a11y.js` wrapper that serves the local `public/` build and writes `migration/reports/phase-5-accessibility-audit.md`, a new `npm run check:a11y:seo` command, and blocking CI integration in both the PR accessibility job and the deploy workflow.

## Why this changed

RHI-056 required accessibility to move from an informational Phase 3 baseline to a release-blocking discoverability control. Before this change, the repository had a non-blocking `check:a11y` baseline tied to scaffold-oriented routes, but it did not have a representative Phase 5 route set, a markdown audit artifact, a deterministic Level A and Level AA policy, or deploy-time enforcement.

## Behavior details

### Old behavior

- The repository exposed `npm run check:a11y`, which built the site and ran the Phase 3 baseline wrapper from `scripts/check-a11y.js`.
- The baseline read `.pa11yci.json`, which targeted scaffold and archive routes rather than the RHI-056 page mix.
- The PR accessibility job was non-blocking through `continue-on-error: true`.
- The deploy workflow had no dedicated accessibility gate and did not archive a Phase 5 accessibility report.
- The archive filter shell on taxonomy pages rendered `h3` headings before the first `h2`, which created a heading-level skip on representative category pages.

### New behavior

- `pa11y-ci.config.js` defines the RHI-056 representative route set: homepage, one article, one category term page, and privacy policy.
- `scripts/seo/check-a11y.js` serves the built `public/` output locally, runs `pa11y-ci` with a JSON reporter, performs semantic template checks for heading hierarchy, landmarks, skip-link presence, and rendered image alt semantics, and writes `migration/reports/phase-5-accessibility-audit.md`.
- `npm run check:a11y:seo` now provides the Phase 5 accessibility gate contract used by CI.
- Level A findings are always blocking. Level AA findings are blocking by default and become non-blocking only if they are explicitly listed in `approvedNonCriticalAaExceptions` with owner and target-phase metadata inside `pa11y-ci.config.js`.
- The PR accessibility job now builds the production site, runs the blocking Phase 5 gate, and uploads the generated markdown audit artifact.
- The deploy workflow now runs the same accessibility gate before the performance gate and archives the report alongside the other Phase 5 artifacts.
- `src/layouts/partials/archive/filter-bar.html` now inserts a hidden section-level `h2` so the category archive filter controls no longer cause an `h1` to `h3` heading jump on representative taxonomy pages.

## Impact

- Maintainers now have a dedicated Phase 5 accessibility gate exposed as `npm run check:a11y:seo`.
- Route-sensitive PR validation and deploy validation both block on representative accessibility regressions.
- The repository has a durable markdown audit artifact for RHI-056 sign-off evidence.
- The shared archive filter shell now maintains a valid heading sequence on category pages without changing the visible interface.

## Verification

- Automated validation:
  - `npm run build:prod`
  - `npm run check:a11y:seo`
- Audit result:
  - `migration/reports/phase-5-accessibility-audit.md` generated with zero blocking Level A findings, zero blocking Level AA findings, zero technical failures, and zero semantic template findings on `/`, `/reflecting-on-2-years-of-blogging/`, `/category/platform/`, and `/privacy-policy/`.
- Manual keyboard verification:
  - Homepage `/`
  - Article `/reflecting-on-2-years-of-blogging/`
  - Result: on both routes the first `Tab` focused the skip link, `Enter` moved focus to `#main-content`, the next `Tab` reached the first in-content interactive target, visible focus rendered as a `3px` blue outline, and no keyboard trap was observed during the sampled traversal.

## Related files

- `pa11y-ci.config.js`
- `scripts/seo/check-a11y.js`
- `package.json`
- `.github/workflows/build-pr.yml`
- `.github/workflows/deploy-pages.yml`
- `src/layouts/partials/archive/filter-bar.html`
- `migration/reports/phase-5-accessibility-audit.md`
- `analysis/tickets/phase-5/RHI-056-accessibility-discoverability-support.md`