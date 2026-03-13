# RHI-065 Route Preservation Closeout

## Change summary

RHI-065 is now closed with the remaining Workstream C evidence for keep-route preservation, retire-route non-remap behavior, and sitemap cleanliness. The closeout adds `scripts/phase-6/validate-keep-routes.js` and `scripts/phase-6/validate-retire-sitemap.js`, generates the matching Phase 6 reports, and reconciles the ticket wording with the approved Hugo taxonomy-route exception and the existing RHI-062 Model A request-aware limitation.

## Why this changed

The earlier RHI-065 slice completed alias validation, redirect-chain checks, and feed/system parity remediation, but the ticket still lacked direct evidence for the remaining open acceptance criteria. In particular, the original keep-route wording assumed every preserved route would be backed by explicit content `url` front matter, which is not true for Hugo taxonomy-generated category routes, system helper routes, or generated/static keep files.

Without this closeout work, the repository could prove most behavior operationally, but Workstream C would remain open because the ticket evidence did not explicitly cover the remaining keep, retire, and sitemap clauses.

## Behavior details

Old behavior:

1. There was no RHI-065-specific report showing how every `keep` row in `migration/url-map.csv` was preserved across explicit front matter routes, taxonomy-generated routes, system helpers, and static/generated assets.
2. There was no dedicated Phase 6 report proving that `retire` rows were excluded from built redirect outputs and from the sitemap.
3. The ticket wording implied every keep route had to be backed by explicit content front matter, even for preserved Hugo taxonomy routes and non-content system/static routes.

New behavior:

1. `npm run phase6:validate-keep-routes` audits every `keep` row in `migration/url-map.csv` and writes `migration/reports/phase-6-keep-route-audit.csv`.
2. The keep audit now distinguishes four valid preservation modes:
   - explicit content `url` front matter,
   - owner-approved taxonomy-generated keep routes for category terms,
   - generated system routes such as `/feed/`,
   - static or generated asset/file outputs.
3. `npm run phase6:validate-retire-sitemap` audits `retire` and `merge` rows against the built `public/` tree and `public/sitemap.xml`, then writes `migration/reports/phase-6-retire-sitemap-audit.csv`.
4. The retire and sitemap audit treats query-string legacy routes as the documented RHI-062 Model A request-aware limitation, so they are verified as excluded from static outputs rather than falsely compared against the homepage path.
5. RHI-065 closure now explicitly records that full retirement UX and policy governance still continues in RHI-067, while WS-C proves that the current Hugo build does not silently remap retired routes and keeps legacy merge/retire sources out of the sitemap.

## Impact

1. Workstream C now has direct evidence for all remaining keep, retire, and sitemap acceptance criteria.
2. Phase 6 downstream tickets can rely on committed reports for keep-route preservation and retire/sitemap exclusion, rather than inferring those outcomes indirectly from broader parity gates.
3. Ticket wording now matches the actual Hugo + GitHub Pages implementation model, including the approved taxonomy exception and the already accepted request-aware limitation.

## Verification

1. Run `npm run build:prod` to generate a clean production artifact.
2. Run `npm run phase6:validate-keep-routes` and confirm `migration/reports/phase-6-keep-route-audit.csv` reports zero failures.
3. Run `npm run phase6:validate-retire-sitemap` and confirm `migration/reports/phase-6-retire-sitemap-audit.csv` reports zero failures.
4. Run `npm run check:url-parity` and confirm the clean-build parity report remains green.
5. Run `npm run check:sitemap` and confirm the canonical sitemap audit remains green.
6. Verified on 2026-03-13: `npm run build:prod` completed with `Pages 204` and `Aliases 17`; `npm run test:url-parity` passed `7` of `7` tests; `npm run check:url-parity` reported `1223` pass rows and `0` failures; `npm run phase6:validate-alias-pages` reported `18` pass rows and `0` failures; `npm run phase6:check-redirect-chains` reported `18` pass rows with `0` chains and `0` loops; `npm run phase6:validate-keep-routes` passed `197` of `197` rows; `npm run phase6:validate-retire-sitemap` passed `2126` of `2126` rows; `npm run check:feed-compatibility` reported `0` failures across `6` checks; `npm run check:sitemap` passed for `215` sitemap URLs; `npm run check:crawl-controls` passed for `237` HTML routes; and `npm run check:redirects:seo` reported `1026` pass rows and `0` failures.

## Related files

1. `scripts/phase-6/validate-keep-routes.js`
2. `scripts/phase-6/validate-retire-sitemap.js`
3. `migration/reports/phase-6-keep-route-audit.csv`
4. `migration/reports/phase-6-retire-sitemap-audit.csv`
5. `migration/reports/phase-6-alias-page-validation.csv`
6. `migration/reports/phase-6-redirect-chain-report.csv`
7. `analysis/tickets/phase-6/RHI-065-hugo-route-preservation-alias-integration.md`
8. `analysis/tickets/phase-6/INDEX.md`
9. `analysis/tickets/INDEX.md`
10. `package.json`