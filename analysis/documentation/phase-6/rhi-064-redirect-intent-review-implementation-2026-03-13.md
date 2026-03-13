# RHI-064 Redirect Mapping Intent Review Implementation

## Change summary

RHI-064 is complete with deterministic redirect-intent review artifacts. Phase 6 now includes a repeatable review script that adjudicates every current `merge` row in `migration/url-map.csv`, appends the final intent rationale into the mapping table, and writes the required `migration/reports/phase-6-redirect-intent-review.csv` report.

## Why this changed

WS-B is the editorial SEO gate between the finalized inventory and the alias implementation work in WS-C. After RHI-063, the mapping table still contained `141` `merge` rows with placeholder `intent_class: pending-review` values and there was no committed review report or validation path proving the ticket's closeout rules.

Without a reproducible review workflow, the repository would rely on one-off CSV editing for a release-blocking redirect decision set. That would make it easy to lose approvals, miss ambiguous mappings, or hand an unverified map to WS-C.

## Behavior details

Old behavior:

1. `migration/url-map.csv` marked every `merge` row as `pending-review`.
2. No committed `migration/reports/phase-6-redirect-intent-review.csv` artifact existed.
3. Phase 6 had no validator enforcing zero deferred rows, zero pending-review rows, and report-to-map parity.

New behavior:

1. `npm run phase6:review-redirect-intent` reviews every current `merge` row and rewrites `migration/url-map.csv` with final `intent_class` values and appended `RHI-064 review` notes.
2. The same script writes `migration/reports/phase-6-redirect-intent-review.csv` with one approved row per reviewed redirect, including reviewer and decision notes.
3. `npm run validate:redirect-intent-review` validates the closeout rules for WS-B: exact report parity, zero `pending-review`, zero non-approved report rows, zero homepage targets, and zero `merge -> merge` chains within the reviewed redirect scope.
4. Query-string legacy routes remain explicitly documented as approved semantic matches where the destination is a one-to-one surviving page or article, while also retaining the accepted Model A launch-risk note from RHI-062 that these request-aware routes are unsupported by Hugo aliases at launch.

## Impact

1. WS-C can now consume a frozen, reviewed `migration/url-map.csv` instead of a placeholder review queue.
2. Broad or non-obvious targets such as `/archive/`, `/ideas/`, `/video/`, `/category/external/`, `/category/salesforce-commerce-cloud/`, and `/feed/` now carry explicit rationale in the reviewed data.
3. Re-running the review is deterministic and no longer depends on manual spreadsheet handling.
4. Phase 6 sign-off and downstream redirect reporting tickets now have the committed intent-review artifact RHI-064 requires.

## Verification

1. Run `npm run phase6:review-redirect-intent`.
2. Run `npm run validate:redirect-intent-review`.
3. Confirm the reviewed outputs contain `141` reviewed merge rows and `141` report rows.
4. Confirm final intent-class counts are `138` `exact-equivalent` and `3` `consolidated-equivalent`.

## Related files

1. `migration/url-map.csv`
2. `migration/reports/phase-6-redirect-intent-review.csv`
3. `scripts/phase-6/review-redirect-intent.js`
4. `scripts/phase-6/validate-redirect-intent-review.js`
5. `package.json`
6. `analysis/tickets/phase-6/RHI-064-redirect-mapping-intent-review.md`
