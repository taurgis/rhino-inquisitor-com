# RHI-036 URL Parity and Redirect Integrity Implementation

## Change summary

RHI-036 now has a Phase 4 URL-validation toolchain in place. The repository exposes a staged-content parity validator, a redirect integrity checker, and a shared helper module that understands the manifest schema, Hugo-generated redirect pages, and the repository's distinction between static Pages validation and the required edge redirect layer.

## Why this changed

RHI-035 closed the front matter mapping stage, but Phase 4 still lacked a concrete way to prove URL outcomes against real Hugo output. Without RHI-036 tooling, batch work would have no auditable gate for kept pages, retired paths, or redirect integrity, and the migration would be forced to rely on assumptions about Hugo aliases that do not hold for query-style legacy URLs.

## Behavior details

Old behavior:

- The repository only had the Phase 3 scaffold-oriented baseline at `scripts/check-url-parity.js`.
- There was no Phase 4 script that could validate `migration/url-manifest.json` against a Hugo build created from `migration/output/content/`.
- Query-style legacy URLs such as `/?p=11627` had no explicit validation contract, even though RHI-035 had already excluded them from front matter aliases.
- The staged-content Hugo build had not been exercised against the current article templates, so a mixed-shape bug in `src/layouts/partials/article/related-content.html` remained latent.

New behavior:

- `scripts/migration/validate-url-parity.js` validates the manifest against a selected content directory and built output directory, and writes `migration/reports/url-parity-report.csv` with the required columns.
- `scripts/migration/check-redirects.js` validates redirect integrity for merge records against a selected build output and can optionally check runtime behavior when a base URL is supplied.
- `scripts/migration/url-validation-helpers.js` centralizes manifest parsing, URL normalization, staged-content route discovery, and Hugo meta-refresh extraction.
- `package.json` now points `check:url-parity` at the new Phase 4 validator, preserves the older scaffold contract as `check:url-parity:baseline`, and adds `check:redirects`.
- Phase 4 static-validation policy is now explicit: query-style legacy URLs that static Hugo output cannot represent are reported as `deferred-edge-redirect` rows instead of being misreported as successful alias pages.
- The staged-content build uncovered and this change fixed a Hugo partial defect in `src/layouts/partials/article/related-content.html`, where the fallback related-content path mixed plain `page.Page` values with dict-shaped items and crashed the build.

## Impact

- Maintainers now have a repeatable command sequence for validating Phase 4 URL outcomes against generated content rather than the scaffold-only site tree.
- The repository now preserves both validation modes: the scaffold/baseline Phase 3 parity check and the staged-content Phase 4 parity check.
- Query-style merge and retire rows remain visible in reporting, but the repository no longer pretends Hugo can validate them as file-based alias pages.
- RHI-036 is now closed. Warning-level manifest/content gaps still remain, but Thomas Theunen accepted those nine residuals as downstream cleanup after staged parity reached zero critical failures.

## Verification

- Verified `scripts/migration/validate-url-parity.js`, `scripts/migration/check-redirects.js`, and `scripts/migration/url-validation-helpers.js` are free of editor diagnostics.
- Built staged Phase 4 output with `hugo --minify --environment production --contentDir migration/output/content --destination tmp/rhi036-public`.
- Confirmed the staged build now succeeds after fixing the related-content partial; the build still emits three `warning-goldmark-raw-html` warnings, which remain visible evidence for upstream migration follow-up.
- Ran `node scripts/migration/validate-url-parity.js --content-dir migration/output/content --public-dir tmp/rhi036-public` and generated `migration/reports/url-parity-report.csv`.
- Verified the first staged parity run reported 1201 rows, 38 failures, and 27 critical failures.
- Added staged taxonomy term content for manifest-backed nested category keep routes, removed taxonomy-term pagination that emitted retired `/page/N/` URLs, and treated `/feed/` as a valid generated system helper route.
- Applied the owner-approved manifest correction for `/delta-exports-in-salesforce-b2c-commerce/`, changing it from `keep` to `merge` toward `/delta-exports-in-salesforce-b2c-commerce-cloud/` on the `edge-cdn` layer.
- Re-ran staged parity and verified the current report now shows 9 failures, all warning-level, with 0 critical failures and 528 deferred edge-layer rows.
- Ran `node scripts/migration/check-redirects.js --public-dir tmp/rhi036-public` and verified zero critical failures with 126 deferred edge-layer rows.
- Recorded owner acceptance of the remaining nine warning-level residual parity gaps and closed RHI-036 on the zero-critical-failure gate.

## Related files

- `scripts/migration/validate-url-parity.js`
- `scripts/migration/check-redirects.js`
- `scripts/migration/url-validation-helpers.js`
- `package.json`
- `docs/migration/RUNBOOK.md`
- `analysis/tickets/phase-4/RHI-036-url-preservation-redirect-integrity.md`
- `analysis/tickets/phase-4/INDEX.md`
- `src/layouts/partials/article/related-content.html`
- `src/layouts/_default/term.html`
- `src/layouts/_default/taxonomy.html`
- `migration/output/content/categories/`
- `migration/reports/url-parity-report.csv`