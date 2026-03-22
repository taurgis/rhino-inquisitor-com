# Article Fidelity Manual Review - 2026-03-22

## Change summary

Completed a manual route-by-route review pass after the automated 2026-03-22 article-fidelity reruns.

This manual pass reviewed:

- the single open non-pass row from automated text and visual audits
- critical canary routes that previously carried code or presentation risk
- watchlist canaries with prior medium-risk review history

This run produced:

- `migration/reports/phase-8-article-fidelity-manual-review-2026-03-22.csv`
- `migration/reports/phase-8-article-fidelity-manual-review-summary-2026-03-22.csv`

## Why this changed

The owner requested a manual review to confirm that automated pass status still holds under direct human validation of rendered content.

The manual check preserved the same scope contract used by previous reruns:

- H1 drift is expected and non-blocking.
- URL drift is expected and non-blocking.
- Critical focus remains body text fidelity, code example integrity, and visual readability.

## Behavior details

### Manual review behavior

1. Reviewed 12 routes in a focused pack:
   - 1 flagged baseline-exception route
   - 8 critical canary routes
   - 3 watchlist canaries
2. Compared live article rendering against local article rendering for each route.
3. Recorded route-level disposition in CSV as one of:
   - `confirmed-pass`
   - `accepted-low-drift`
   - `accepted-exception`

### Old versus new behavior

- Old: automated reruns were the primary closure source, with only one known scaffold exception still open.
- New: manual route-level validation was added as a second evidence layer, confirming no critical regressions and preserving only the same scaffold exception as non-pass.

### Manual review outcome

Manual summary (`phase-8-manual-review-2026-03-22`):

- scope reviewed: 12 routes
- pass: 11
- needs review: 1
- fail: 0
- confirmed regressions: 0
- accepted low-drift rows: 4
- accepted exceptions: 1
- remaining non-pass row: `/phase-3-performance-baseline/` scaffold baseline exception

## Impact

- The manual review confirms no critical or high-severity article regressions in the checked canary set.
- Previously suspicious visual drift on `/salesforce-b2c-commerce-cloud-the-22-7-release/` remains non-critical and attributable to presentation-level icon/image counting differences.
- The only open non-pass row remains the known scaffold route without a live article baseline.

## Verification

1. Start local preview:
   - `hugo server --bind 127.0.0.1 --baseURL http://localhost:1313 --disableFastRender`
2. Open and compare each manual-review route in live and local environments.
3. Confirm route-level dispositions in:
   - `migration/reports/phase-8-article-fidelity-manual-review-2026-03-22.csv`
4. Confirm summary counts in:
   - `migration/reports/phase-8-article-fidelity-manual-review-summary-2026-03-22.csv`
5. Confirm no `fail` rows and no confirmed regressions.

## Related files

- `migration/reports/phase-8-article-fidelity-manual-review-2026-03-22.csv`
- `migration/reports/phase-8-article-fidelity-manual-review-summary-2026-03-22.csv`
- `migration/reports/phase-8-article-fidelity-reaudit-2026-03-22.csv`
- `migration/reports/phase-8-article-fidelity-reaudit-summary-2026-03-22.csv`
- `migration/reports/phase-8-article-fidelity-visual-2026-03-22.csv`
- `migration/reports/phase-8-article-fidelity-visual-summary-2026-03-22.csv`