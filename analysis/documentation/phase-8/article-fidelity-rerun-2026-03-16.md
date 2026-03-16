# Article Fidelity Rerun - 2026-03-16

## Change summary

Reran the article-fidelity audit against the current live site and the current local Hugo build to confirm whether the previously closed article backlog still holds up under a fresh comparison.

This rerun produced:

- `migration/reports/phase-8-article-fidelity-rerun-2026-03-16.csv`
- `migration/reports/phase-8-article-fidelity-rerun-summary-2026-03-16.csv`

## Why this changed

The previous audit was fully closed on 2026-03-15, but the user requested a second pass to verify the current live-versus-local article experience again with a critical lens.

The rerun keeps title drift visible instead of auto-closing it, filters out obvious blank-code false positives from the automated compare, and records explicit exceptions when a local route has no live article baseline.

## Behavior details

### Comparison method

1. Compare live article body content from `.speachify-content` against local article body content from `section.article-body`.
2. Capture body-text similarity, heading-set drift, code-block similarity, and visible raw-URL exposure.
3. Manually verify the highest-risk rows before classifying them as confirmed regressions.
4. Keep scaffold-only local routes out of strict parity conclusions.

### Current rerun outcome

- Scope reviewed: `151` article routes
- Pass: `74`
- Needs review: `77`
- Fail: `0`
- Confirmed high-severity regressions: `0`
- Title/H1 drift rows: `46`
- Raw visible URL drift rows: `16`
- Local-only scaffold exceptions: `1`

### Targeted remediation completed

1. `image-ine-sfcc-dis-for-developers`
   The missing final `DynamicImage` example was restored, and the local page now renders the same five code blocks as the live article.
2. `mail-attachments-in-b2c-commerce-cloud`
   The later MIME examples were restored, and the visible raw ISO-8859-1 URL no longer appears in the local article body.

### Dominant non-blocking pattern

The largest bucket is still editorial drift rather than body corruption. Many local articles keep stable body and code content while using shorter rewritten H1s than the live WordPress pages.

## Impact

- Maintainers now have a fresh parity tracker that distinguishes confirmed regressions from title drift, raw-link presentation drift, and scaffold exceptions.
- The rerun shows that the content migration is not broadly regressing, but it is also not truly parity-clean if live H1 alignment still matters.
- The rerun no longer has confirmed high-severity article regressions, but it still is not parity-clean if title and presentation drift matter for signoff.

## Verification

1. Review `migration/reports/phase-8-article-fidelity-rerun-summary-2026-03-16.csv` for roll-up counts.
2. Review `migration/reports/phase-8-article-fidelity-rerun-2026-03-16.csv` for article-level evidence and recommended action.
3. Confirm the rerun detail rows for the two remediated articles now show `pass` with post-fix evidence.
4. Decide whether title-only drift should remain visible as an audit finding or be policy-closed again.

## Related files

- `migration/reports/phase-8-article-fidelity-rerun-2026-03-16.csv`
- `migration/reports/phase-8-article-fidelity-rerun-summary-2026-03-16.csv`
- `migration/reports/phase-8-article-fidelity-audit.csv`
- `migration/reports/phase-8-article-fidelity-audit-summary.csv`
- `analysis/documentation/phase-8/article-fidelity-audit-2026-03-15.md`