# RHI-089 Accessibility and HTML Conformance Gates

## Change summary

Started RHI-089 by replacing the Phase 8 placeholder accessibility artefacts with working gate automation and workflow wiring. The repository now has a Playwright plus axe gate for representative page samples, an `html-validate` gate for the same frozen sample matrix, a structured manual-check scaffold owned by the Engineering Owner, and deploy workflow artifact upload for the new reports. A follow-up shared-header remediation also fixed desktop keyboard focus leaking into the closed mobile drawer and made the skip link reveal immediately when focused.

## Why this changed

RHI-089 is the Workstream F launch baseline for accessibility and markup conformance. Before this change, Phase 8 only had placeholder report files and no blocking automation for the required representative page sample set. That left launch readiness dependent on ticket prose instead of reproducible evidence.

## Behavior details

### Previous behavior

- `validation/accessibility-axe-report.json` and `validation/html-conformance-report.json` were bootstrap placeholders created by RHI-083.
- The Phase 7 deploy gate runner had no Phase 8 accessibility or HTML conformance steps.
- `.github/workflows/deploy-pages.yml` did not install Playwright browsers or upload dedicated RHI-089 reports.
- `validation/accessibility-manual-checklist.md` was only a placeholder checklist with no reviewer assignment or route coverage context.
- During the first manual follow-up pass, desktop keyboard focus could move into closed mobile-drawer controls and the skip link could receive focus while still effectively offscreen.

### New behavior

- `npm run check:accessibility` now runs `scripts/phase-8/check-accessibility-axe.js` against the frozen `validation/sample-matrix.json` page-sample routes.
- The axe gate blocks on any `critical` violation across sampled routes and on any `serious` violation for primary templates: homepage, article, and category families.
- Moderate axe findings are reported with Engineering Owner ownership and require a target resolution date before they can be treated as non-blocking.
- `npm run check:html-conformance` now runs `scripts/phase-8/check-html-conformance.js` on the same frozen page-sample routes using `html-validate:recommended` with explicit overrides that remove stylistic, duplicated accessibility, and serializer-level raw-character rules so the gate stays focused on structural HTML conformance.
- HTML conformance errors are blocking. Warnings are non-blocking but are assigned to the Engineering Owner for review and disposition.
- `scripts/phase-7/run-all-gates.sh` now includes both new RHI-089 steps as blocking gates.
- `.github/workflows/deploy-pages.yml` now installs Playwright Chromium dependencies before the gate runner and uploads a dedicated Phase 8 accessibility artifact bundle with 30-day retention.
- `validation/accessibility-manual-checklist.md` now records the agreed reviewer role and representative template coverage instead of remaining a placeholder.
- Shared remediation landed in the site layer as well: syntax-highlight comment text now meets contrast requirements, and the realm-split checklist table is directly keyboard-focusable without relying on an omitted `colgroup` wrapper.
- The shared site header now keeps the mobile drawer hidden and inert while closed, updates drawer state attributes as it opens and closes, and restores the skip link immediately into the visible viewport on focus.
- Browser-assisted rerun evidence now shows the representative manual checklist passing for homepage, article, category, and privacy templates, and the automated WS-F reports reran with zero warnings.

## Impact

- Affects Phase 8 deployment validation, CI artifact coverage, and go or no-go evidence consumed by RHI-091 and RHI-092.
- Adds browser-install time to the deploy workflow because Playwright Chromium is now required before the gate run.
- Keeps manual accessibility review in scope. The automated gates do not replace the committed WAI Easy Checks evidence requirement.
- Uses the frozen sample matrix as the authoritative scope for automation, which is broader than the original 5-post and 3-category ticket shorthand.
- Removes a shared desktop keyboard-navigation defect from the site header without changing navigation IA or production URLs.

## Verification

1. Run `npm run build:prod` to refresh the production artifact.
2. Run `npm run check:html-conformance` and confirm `validation/html-conformance-report.json` is rewritten with non-placeholder RHI-089 results.
3. Run `npm run check:accessibility` and confirm `validation/accessibility-axe-report.json` is rewritten with non-placeholder RHI-089 results.
4. Run `bash scripts/phase-7/run-all-gates.sh` or `npm run gates:local` and confirm both new RHI-089 steps appear as blocking gates.
5. In GitHub Actions, confirm `.github/workflows/deploy-pages.yml` installs Playwright Chromium and uploads the RHI-089 reports with 30-day retention.
6. Complete the remaining manual checklist rows in `validation/accessibility-manual-checklist.md` before closing the ticket.
7. Confirm the final automated state remains `pass` for HTML conformance and accessibility, with only non-blocking warnings if any are present.
8. For the shared header follow-up, verify on desktop that first `Tab` reveals the skip link visibly and that the next header focus targets stay within visible controls only.
9. For the shared header follow-up, verify on a mobile viewport that the menu toggle opens the drawer, focus moves to the close button, `Escape` closes the drawer, and focus returns to the toggle.

## Related files

- `scripts/phase-8/check-accessibility-axe.js`
- `scripts/phase-8/check-html-conformance.js`
- `scripts/phase-7/run-all-gates.sh`
- `.github/workflows/deploy-pages.yml`
- `package.json`
- `src/assets/styles/site.css`
- `src/layouts/partials/site/header.html`
- `src/layouts/shortcodes/realm-split-checklist-table.html`
- `validation/accessibility-manual-checklist.md`
- `validation/README.md`

## Assumptions and open questions

- The frozen `validation/sample-matrix.json` dataset remains the authoritative automation scope for RHI-089.
- Engineering Owner is the committed reviewer for manual checks and for warning or moderate-finding disposition.
- Ticket closeout accepted the completed browser-assisted checklist plus owner acknowledgment as the final manual evidence set for RHI-089.