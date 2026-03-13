# RHI-065 Alias Validation Controls

## Change summary

RHI-065 now includes two Phase 6 validation scripts that close the remaining implementation-evidence gap for the Model A alias surface: `scripts/phase-6/validate-alias-pages.js` validates the built alias helper pages, and `scripts/phase-6/check-redirect-chains.js` verifies that those helper pages resolve in one hop to a final destination.

## Why this changed

The repository already contained the narrowed RHI-065 remediation slice for category aliases, feed helpers, and parity/feed-policy alignment, but the ticket still named two missing validation controls as deliverables. Without these scripts, the workstream could prove parity and SEO outcomes indirectly, but it could not produce a dedicated Phase 6 artifact showing that alias-backed redirect pages were present, pointed at the right canonical destination, and did not chain through other helper pages.

## Behavior details

Old behavior:

1. `npm run check:url-parity` and `npm run check:redirects:seo` could catch many redirect defects, but there was no Phase 6-specific validator focused on the alias-backed subset of `migration/url-map.csv`.
2. The workstream did not generate a dedicated report proving that each `pages-static` merge row had a built alias helper page with both canonical and meta-refresh targets aligned to the approved destination.
3. Redirect-chain evidence depended on broader SEO validation output rather than a script that explicitly traced the implemented alias helper graph.

New behavior:

1. `npm run phase6:validate-alias-pages` validates every `merge` row in `migration/url-map.csv` with `implementation_layer: pages-static` against the built `public/` artifact.
2. The alias validator writes `migration/reports/phase-6-alias-page-validation.csv` and fails on missing alias pages, missing meta refresh, wrong refresh target, missing canonical, wrong canonical target, self-referencing canonicals, and canonical/refresh mismatches.
3. `npm run phase6:check-redirect-chains` validates the same alias-backed subset against the built `public/` artifact and the Hugo content route map.
4. The chain checker writes `migration/reports/phase-6-redirect-chain-report.csv` and fails when a legacy alias source conflicts with a canonical content route, loops back to itself, points to another redirect helper, or resolves through additional alias hops.
5. `check:redirects:seo` now logs the Phase 5 edge-baseline trigger as superseded by the owner-approved RHI-062 Model A exception, which keeps the validator message aligned with the active redirect ADR.

## Impact

1. Phase 6 now has dedicated, repeatable evidence for the alias-backed portion of Workstream C.
2. Maintainers can distinguish alias-surface defects from broader parity or SEO validator failures.
3. The redirect governance messaging in SEO validation no longer conflicts with the accepted Model A launch posture.

## Verification

1. Run `npm run build:prod` to generate a clean production artifact.
2. Run `npm run phase6:validate-alias-pages` and confirm it exits with `0` and writes `migration/reports/phase-6-alias-page-validation.csv` with zero fail rows.
3. Run `npm run phase6:check-redirect-chains` and confirm it exits with `0` and writes `migration/reports/phase-6-redirect-chain-report.csv` with zero chain or loop defects.
4. Run `npm run check:url-parity` and `npm run check:redirects:seo` on the same clean build to confirm the broader Phase 6 redirect gates remain aligned.
5. Verified on 2026-03-13: `npm run build:prod` completed with `Pages 204` and `Aliases 17`; `npm run test:url-parity` passed `7` of `7` tests; `npm run check:url-parity` reported `1223` pass rows and `0` failures; `npm run phase6:validate-alias-pages` reported `18` pass rows and `0` failures; `npm run phase6:check-redirect-chains` reported `18` pass rows with `0` chains and `0` loops; and `npm run check:redirects:seo` reported `1026` pass rows and `0` failures on the same clean artifact.

## Related files

1. `scripts/phase-6/validate-alias-pages.js`
2. `scripts/phase-6/check-redirect-chains.js`
3. `package.json`
4. `scripts/seo/check-redirects.js`
5. `analysis/tickets/phase-6/RHI-065-hugo-route-preservation-alias-integration.md`