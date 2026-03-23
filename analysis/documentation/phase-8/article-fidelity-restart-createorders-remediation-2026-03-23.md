# Article Fidelity Restart CreateOrders Remediation - 2026-03-23

## Change summary

- Restored the exact SLAS trusted-system shopper scope string in the CreateOrders article so the localhost Hugo render no longer breaks the copyable token.
- Updated the restart audit records after remediation verification so the Batch 12 CreateOrders row can close as passing.

## Why this changed

- Batch 12 of the restart audit confirmed that the local article render changed the documented shopper scope from `sfcc.ts_ext_on_behalf_of` to `sfcc.ts_ext_ on_behalf_ of`.
- Official Salesforce Commerce documentation confirms `sfcc.ts_ext_on_behalf_of` is the exact trusted-system scope name, so the rendered split token was a reader-facing technical defect rather than an acceptable formatting change.

## Behavior details

- Old behavior:
  - The CreateOrders article rendered the custom shopper scope with inserted spaces around underscore groups, making the scope string incorrect for copy and paste.
  - Batch 12 recorded `/the-createorders-api-in-sfcc/` as a `FAIL` with a HIGH-severity technical-example regression.
- New behavior:
  - The CreateOrders article now renders the full scope inside inline code as `sfcc.ts_ext_on_behalf_of`, preserving the exact official token text.
  - After verification, the restart audit row returned to `PASS` with no open HIGH article-fidelity issue remaining in Batch 12.

## Impact

- Readers following the CreateOrders authentication guidance can again copy the documented shopper scope without introducing an invalid value into SLAS client configuration.
- The restart article-fidelity tracker no longer carries an open HIGH regression for this route.

## Verification

1. Reloaded the localhost route `/the-createorders-api-in-sfcc/` and confirmed the rendered list item shows `sfcc.ts_ext_on_behalf_of` exactly.
2. Compared the rendered localhost token and trusted-system body example to the live production article and confirmed the values match.
3. Updated `validation/article-audit-2026-03-23-restart.csv` and `validation/ARTICLE-AUDIT-SUMMARY-2026-03-23-RESTART.md` to close the remediated Batch 12 row as passing.
4. Reconciled totals in the restart ledger and summary before resuming Batch 13.

## Related files

- `src/content/posts/the-createorders-api-in-sfcc/index.md`
- `validation/article-audit-2026-03-23-restart.csv`
- `validation/ARTICLE-AUDIT-SUMMARY-2026-03-23-RESTART.md`
- `analysis/documentation/phase-8/article-fidelity-restart-createorders-remediation-2026-03-23.md`