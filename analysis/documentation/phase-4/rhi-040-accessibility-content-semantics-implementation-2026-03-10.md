# RHI-040 Accessibility Content Semantics Implementation

## Change summary

RHI-040 now adds a migration-facing accessibility content gate via `npm run check:a11y-content`, extends the existing rendered-page accessibility runner so it can target staged migration builds and custom URL samples, and records the first baseline results for the current Phase 4 corpus in `migration/reports/accessibility-scan-summary.md`.

2026-03-11 follow-up: the staged-content correction workflow now removes the remaining table-header blockers automatically, seeds a curated weak-link inventory via `npm run migrate:export-link-text-corrections`, and drives the Markdown gate down to zero blocking findings. After curating the weak-link inventory, the repository gate now passes with just two residual warnings left: one intentionally unresolved weak-link sentence in the PWA Kit v2.6.0 section and one multiline-table warning in the realm-split article.

## Why this changed

Phase 3 already established a template-level accessibility baseline with `npm run check:a11y`, but Phase 4 did not yet have a content-level gate that could fail batches for missing alt text, heading regressions, weak link labels, or malformed Markdown tables before those issues propagated across the migrated corpus. RHI-040 closes that gap and provides the evidence needed to distinguish an implemented gate from a passing gate.

## Behavior details

Old behavior:

- No repository command scanned `migration/output/content/` for accessibility issues in generated Markdown.
- The rendered accessibility command only used the scaffold route list from `.pa11yci.json` and the default `public/` build directory.
- Phase 4 had no repository-owned report that captured accessibility findings for staged migration content.

New behavior:

- `scripts/migration/check-a11y-content.js` scans all staged Markdown files in `migration/output/content/` and writes per-finding CSV output to `migration/reports/a11y-content-warnings.csv`.
- `scripts/migration/check-a11y-content.js` now only evaluates table-divider warnings at the start of a table block, which removes the previous body-row false positives on valid Markdown tables.
- The content gate now enforces the owner-approved thresholds selected on 2026-03-10:
  - blocking cap `0`
  - weak-link warning cap `5`
  - generic or filename-like alt text is blocking
  - empty alt text is only allowed through an explicit decorative-image exception entry in `migration/input/a11y-content-exceptions.json`
- `scripts/migration/apply-content-corrections.js` now auto-promotes the real header row when generated Markdown emits an empty placeholder header row followed by the divider row, and it can apply curated weak-link label replacements from `migration/input/link-text-corrections.csv`.
- `scripts/migration/export-link-text-corrections.js` seeds `migration/input/link-text-corrections.csv` with every current weak-link finding so maintainers can review link labels with the same CSV-driven pattern already used for curated alt text.
- `scripts/check-a11y.js` now accepts `CHECK_A11Y_PUBLIC_DIR` and `CHECK_A11Y_URLS`, which allows `npm run check:a11y` to exercise a staged migration build and a deterministic 10-page sample without changing the default Phase 3 scaffold workflow.
- `migration/reports/accessibility-scan-summary.md` now records the Markdown-gate results, the rendered 10-page sample results, and the manual keyboard review evidence for a representative migrated article.

## Impact

- Maintainers now have a repeatable Phase 4 accessibility gate that can be run before pilot-batch approval.
- The follow-up correction-slice reduced the Markdown gate from 238 blocking findings to 0 blocking findings and then reduced the weak-link inventory from 47 warnings to 1.
- RHI-040 is no longer blocked by the repository gate: the owner-approved weak-link cap is satisfied at `1/5`, and the remaining work is limited to two non-blocking warnings.
- The rendered accessibility runner can now validate staged migration builds directly, which keeps the Phase 3 command surface reusable for later Phase 4 and Phase 8 sampling.

## Verification

- Run `npm run check:a11y-content`.
- Run `npm run migrate:export-link-text-corrections`.
- Run `npm run migrate:apply-corrections` and rerun it once to confirm idempotence.
- Build staged migration content with `hugo --minify --environment production --contentDir migration/output/content --destination tmp/rhi040-public`.
- Run `CHECK_A11Y_PUBLIC_DIR=tmp/rhi040-public CHECK_A11Y_URLS='["/","/posts/","/category/","/category/release-notes/","/about/","/video/","/how-to-set-up-slas-for-the-composable-storefront/","/how-to-use-node-18-with-sfra/","/the-realm-split-field-guide-to-migrating-an-sfcc-site/","/what-can-i-use-chatgpt-for-when-working-with-salesforce/"]' npm run check:a11y`.
- Run `CHECK_A11Y_PUBLIC_DIR=tmp/rhi-a11y-public CHECK_A11Y_URLS='["/ai-einstein-in-salesforce-b2c-commerce-cloud/","/lag-to-riches-a-pwa-kit-developers-guide/","/mastering-sitemaps-in-sfcc/","/the-realm-split-field-guide-to-migrating-an-sfcc-site/"]' npm run check:a11y` after building `tmp/rhi-a11y-public` from `migration/output/content/`.
- Review:
  - `migration/reports/a11y-content-warnings.csv`
  - `migration/reports/accessibility-scan-summary.md`
- Manual keyboard spot-check performed on `/the-realm-split-field-guide-to-migrating-an-sfcc-site/` in the staged build:
  - first `Tab` focused the skip link
  - `Enter` moved focus to `#main-content`
  - the next `Tab` reached the breadcrumb link
  - computed focus styling on the active breadcrumb link was `outline: 3px solid rgb(10, 132, 255)`

## Related files

- `scripts/migration/check-a11y-content.js`
- `scripts/migration/apply-content-corrections.js`
- `scripts/migration/export-link-text-corrections.js`
- `scripts/check-a11y.js`
- `package.json`
- `migration/input/link-text-corrections.csv`
- `docs/migration/RUNBOOK.md`
- `migration/reports/a11y-content-warnings.csv`
- `migration/reports/accessibility-scan-summary.md`
- `analysis/tickets/phase-4/RHI-040-accessibility-content-semantics.md`
