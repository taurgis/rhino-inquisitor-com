# RHI-027 Accessibility and UX Baseline - 2026-03-09

## Change summary

Added the Phase 3 accessibility baseline across the shared Hugo scaffold, wired a repeatable `pa11y-ci` command against locally served `public/` output, and documented the manual WCAG review steps required beyond the automated gate.

## Why this changed

Phase 3 needed an enforceable accessibility baseline before Phase 4 content migration begins. Without shared landmark semantics, skip-link support, image-alt enforcement, and a reproducible automated check, imported content could regress accessibility without any early warning.

## Behavior details

Old behavior:

- The scaffold had no skip link, no explicit keyboard-focus treatment, and only partial landmark labeling.
- Shared image rendering guaranteed dimensions for performance, but not a centralized accessibility contract for informative versus decorative images.
- The repository had no `check:a11y` command, no `pa11y-ci` config, and no repo-owned way to serve `public/` locally for accessibility checks.
- `docs/migration/RUNBOOK.md` did not include the manual focus-order, skip-link, and contrast checks required to supplement the automated baseline.

New behavior:

- `src/layouts/_default/baseof.html` now exposes a first-focus skip link, a focusable `main` target, labeled primary navigation, and minimal shared focus-visible styling.
- `src/layouts/partials/media/image.html` now centralizes non-empty alt fallback for informative images, omits images when no informative alt is available, and supports decorative rendering with `alt=""` plus presentational treatment.
- Breadcrumb and pagination partials now expose current-page state with accessible labels instead of treating every breadcrumb or page number as a generic link.
- `package.json` now exposes `npm run check:a11y`, backed by `.pa11yci.json` and `scripts/check-a11y.js`, which serves `public/` locally and runs `pa11y-ci` against representative scaffold routes.
- `docs/migration/RUNBOOK.md` now documents the Phase 3 automated baseline and the manual keyboard, skip-link, focus-visibility, and contrast checks that remain required.

## Impact

- Phase 3 accessibility regressions are now visible through a repeatable local command surface before Phase 4 import work begins.
- Shared scaffold templates now enforce one repo-owned pattern for landmarks, skip links, current-page navigation semantics, and image accessibility behavior.
- The repo keeps the existing Node `>=18` contract by pinning `pa11y-ci` to `3.1.0` instead of silently raising the runtime floor to the current major's Node 20+ requirement.

## Verification

- Run `npm run build:prod`.
- Run `npm run check:a11y`.
- Manually verify keyboard behavior on representative routes by tabbing to the skip link and activating it.
- Review `docs/migration/RUNBOOK.md` for the manual WCAG 2.2 delta checklist.

Observed results on 2026-03-09:

- `npm run build:prod` passed.
- `npm run check:a11y` passed on `/`, `/phase-3-performance-baseline/`, `/scaffold-readiness/`, `/posts/`, `/category/`, and `/category/platform/`.
- Manual keyboard checks confirmed that the first `Tab` reaches the skip link and `Enter` moves focus to `#main-content` on both the home and article routes.

## Related files

- `package.json`
- `package-lock.json`
- `.pa11yci.json`
- `scripts/check-a11y.js`
- `src/layouts/_default/baseof.html`
- `src/layouts/_default/single.html`
- `src/layouts/home.html`
- `src/layouts/partials/content-list.html`
- `src/layouts/partials/breadcrumbs.html`
- `src/layouts/partials/pagination.html`
- `src/layouts/partials/media/image.html`
- `docs/migration/RUNBOOK.md`
- `README.md`
- `analysis/tickets/phase-3/RHI-027-accessibility-ux-baseline.md`