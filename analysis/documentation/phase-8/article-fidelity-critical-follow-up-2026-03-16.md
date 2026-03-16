# Article Fidelity Critical Follow-up - 2026-03-16

## Change summary

Completed a follow-up review of the previously open high-risk article-fidelity rows from the live WordPress site versus the local Hugo build.

This follow-up produced:

- `migration/reports/phase-8-article-fidelity-critical-follow-up-2026-03-16.csv`
- `migration/reports/phase-8-article-fidelity-critical-follow-up-summary-2026-03-16.csv`

## Why this changed

The broader rerun tracker still had a large `needs-review` queue, but the owner clarified that H1 drift and page URL drift are expected. That changed the review priority.

This follow-up therefore focused on the rows where a real reader-facing defect was still plausible:

- code-block integrity
- body-text review rows with similarity drops
- title-and-body rows that looked like body expansion rather than title-only drift

## Behavior details

### Focused comparison method

1. Use the existing rerun tracker as the source of the open-risk queue.
2. Re-check the highest-risk rows against live `.speachify-content` and local `section.article-body` output.
3. Treat title-only drift as outside the critical slice because the owner marked H1 drift expected.
4. Close rows as `pass` when the rendered article meaning and copy-paste safety still hold.
5. Keep rows open when the local article materially inserts new body content or exposes formatting corruption.

### Current critical follow-up outcome

- Focused rows reviewed: `19`
- Pass: `15`
- Needs review: `4`
- Fail: `0`
- Confirmed high-severity regressions: `0`
- Confirmed medium-severity follow-ups: `4`

### Resolved high-severity issue

1. `/a-look-at-the-salesforce-b2c-commerce-cloud-24-2-release/`
   The local code block for the inventory timestamp example now restores the XML tag names, and the rendered example matches the live article again.

### Medium follow-ups that remain open

1. `/getting-to-know-sfra-as-a-developer/`
   The local article adds a removed-resource warning block that is not present in the live baseline.
2. `/lag-to-riches-a-pwa-kit-developers-guide/`
   The local article adds a new Hard vs Soft Navigation and CrUX section that materially extends the body.
3. `/salesforce-b2c-commerce-the-22-5-release/`
   The local body diff still suggests formatting drift around the password-less login note and should be checked directly before closure.
4. `/the-realm-split-field-guide-to-migrating-an-sfcc-site/`
   The local article adds a migration planning matrix and comparison guidance that are absent from the live article.

### Next risk queue outside the critical slice

Several rows in the broader rerun tracker still look more serious than harmless link-display drift because the visible local URLs appear malformed or copy-paste unsafe. Examples include trailing `>` characters, placeholder-domain tokens, and raw media-file URLs rendered directly in article body copy.

Those rows were not fully re-audited in this follow-up because the owner asked to focus on critical issues first, but they are the next queue to review if the parity target expands beyond confirmed high-severity defects.

### Rows collapsed to non-material drift

Most of the former `body-text-review` rows reduced to one of these patterns after direct review:

- heading punctuation differences
- paragraph regrouping
- link-text rewrites without instructional loss
- explanatory additions that did not remove or contradict the live article

## Impact

- Maintainers now have a much smaller list of genuinely risky article-fidelity rows.
- The broad rerun queue is no longer best read as 76 equally important problems; the critical slice now contains zero confirmed high-severity defects and four medium editorial/body-formatting decisions.
- Title-only drift remains visible in the broader rerun tracker, but it is no longer part of the critical article-fidelity slice because the owner explicitly marked it expected.

## Verification

1. Review `migration/reports/phase-8-article-fidelity-critical-follow-up-2026-03-16.csv` for per-row follow-up decisions.
2. Review `migration/reports/phase-8-article-fidelity-critical-follow-up-summary-2026-03-16.csv` for focused counts.
3. Re-check the live and local 24.2 release article code block to confirm the XML tag names remain restored after future content changes.
4. If parity needs to go beyond critical defects, review the remaining suspicious raw-URL rows from the broader rerun tracker next.

## Related files

- `migration/reports/phase-8-article-fidelity-rerun-2026-03-16.csv`
- `migration/reports/phase-8-article-fidelity-rerun-summary-2026-03-16.csv`
- `migration/reports/phase-8-article-fidelity-critical-follow-up-2026-03-16.csv`
- `migration/reports/phase-8-article-fidelity-critical-follow-up-summary-2026-03-16.csv`
- `analysis/documentation/phase-8/article-fidelity-rerun-2026-03-16.md`
