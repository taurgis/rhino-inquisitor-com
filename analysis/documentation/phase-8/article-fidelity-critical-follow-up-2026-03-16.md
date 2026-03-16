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
- Pass: `19`
- Needs review: `0`
- Fail: `0`
- Confirmed high-severity regressions: `0`
- Confirmed medium-severity follow-ups: `0`

### Resolved high-severity issue

1. `/a-look-at-the-salesforce-b2c-commerce-cloud-24-2-release/`
   The local code block for the inventory timestamp example now restores the XML tag names, and the rendered example matches the live article again.

### Body follow-ups closed

1. `/getting-to-know-sfra-as-a-developer/`
   The local Learn Commerce Cloud section now matches the live baseline without the Removed warning block.
2. `/salesforce-b2c-commerce-the-22-5-release/`
   The password-less login note now renders as normal prose with no literal strikethrough markers.
3. `/the-realm-split-field-guide-to-migrating-an-sfcc-site/`
   The local matrix heading and formatting artifacts are gone. The remaining difference is title-only drift, which sits outside this critical body queue.

### Rows closed after direct rendered review

1. `/lag-to-riches-a-pwa-kit-developers-guide/`
   The previously flagged Hard vs Soft Navigation and CrUX section already appears on the live page. That row now collapses to expected title-only drift and no longer belongs in the critical body queue.

### Next risk queue outside the critical slice

The suspicious raw-URL queue has now been reviewed separately in `analysis/documentation/phase-8/article-fidelity-raw-url-follow-up-2026-03-16.md`.

That separate review split the former raw-URL backlog into:

- eight accepted-drift rows
- eight reader-facing presentation defects that remain open in the broader rerun tracker

### Rows collapsed to non-material drift

Most of the former `body-text-review` rows reduced to one of these patterns after direct review:

- heading punctuation differences
- paragraph regrouping
- link-text rewrites without instructional loss
- explanatory additions that did not remove or contradict the live article

## Impact

- Maintainers now have a fully closed critical body/code slice for this rerun.
- The broad rerun queue is no longer best read as 66 equally important problems; the critical slice now contains zero confirmed high-severity defects and zero open medium body/formatting rows.
- Title-only drift remains visible in the broader rerun tracker, but it is no longer part of the critical article-fidelity slice because the owner explicitly marked it expected.

## Verification

1. Review `migration/reports/phase-8-article-fidelity-critical-follow-up-2026-03-16.csv` for the final per-row closure state.
2. Review `migration/reports/phase-8-article-fidelity-critical-follow-up-summary-2026-03-16.csv` for the `19 pass / 0 needs-review / 0 fail` outcome.
3. Re-check the live and local 24.2 release article code block to confirm the XML tag names remain restored after future content changes.
4. Review the dedicated raw-URL follow-up if you need the remaining presentation defects split from accepted visible-link drift.

## Related files

- `migration/reports/phase-8-article-fidelity-rerun-2026-03-16.csv`
- `migration/reports/phase-8-article-fidelity-rerun-summary-2026-03-16.csv`
- `migration/reports/phase-8-article-fidelity-critical-follow-up-2026-03-16.csv`
- `migration/reports/phase-8-article-fidelity-critical-follow-up-summary-2026-03-16.csv`
- `migration/reports/phase-8-article-fidelity-raw-url-follow-up-2026-03-16.csv`
- `migration/reports/phase-8-article-fidelity-raw-url-follow-up-summary-2026-03-16.csv`
- `analysis/documentation/phase-8/article-fidelity-rerun-2026-03-16.md`
