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
- Pass: `85`
- Needs review: `66`
- Fail: `0`
- Confirmed high-severity regressions: `0`
- Title/H1 drift rows: `45`
- Raw visible URL drift rows: `8`
- Local-only scaffold exceptions: `1`

### Targeted remediation completed

1. `image-ine-sfcc-dis-for-developers`
   The missing final `DynamicImage` example was restored, and the local page now renders the same five code blocks as the live article.
2. `mail-attachments-in-b2c-commerce-cloud`
   The later MIME examples were restored, and the visible raw ISO-8859-1 URL no longer appears in the local article body.
3. `a-look-at-the-salesforce-b2c-commerce-cloud-24-2-release`
   The XML import example now restores the `allocation-timestamp` tags, and the local rendered code block matches the live article again.

### Follow-up review completed

1. Medium body-follow-up queue
   The critical body queue is now fully closed. `/getting-to-know-sfra-as-a-developer/` and `/salesforce-b2c-commerce-the-22-5-release/` now pass fully, while `/the-realm-split-field-guide-to-migrating-an-sfcc-site/` collapses to expected title-only drift after the body fixes landed.
2. Raw-URL follow-up queue
   The dedicated raw-URL follow-up split the former sixteen-row raw-link bucket into eight accepted-drift rows and eight reader-facing presentation defects.

### Dominant non-blocking pattern

The largest bucket is still editorial drift rather than body corruption. Many local articles keep stable body and code content while using shorter rewritten H1s than the live WordPress pages.

The raw-URL queue is also now narrower and more actionable. The remaining open rows are no longer generic visible-link differences; they are leaked media-file URLs, malformed example tokens, or literal markdown syntax that a reader can actually see.

## Impact

- Maintainers now have a fresh parity tracker that distinguishes confirmed regressions from title drift, raw-link presentation drift, and scaffold exceptions.
- Maintainers also now have a dedicated raw-URL follow-up report that separates accepted readable reference URLs from genuine reader-facing presentation defects.
- The medium body queue is closed; the remaining rerun backlog now sits in title-only drift, raw-URL presentation defects, and the local scaffold exception.
- The rerun shows that the content migration is not broadly regressing, but it is also not truly parity-clean if live H1 alignment still matters.
- The rerun no longer has confirmed high-severity article regressions, but it still is not parity-clean if title and presentation drift matter for signoff.

## Verification

1. Review `migration/reports/phase-8-article-fidelity-rerun-summary-2026-03-16.csv` for roll-up counts.
2. Review `migration/reports/phase-8-article-fidelity-rerun-2026-03-16.csv` for article-level evidence and recommended action.
3. Review `migration/reports/phase-8-article-fidelity-raw-url-follow-up-2026-03-16.csv` for the split between accepted visible-link drift and open raw-URL defects.
4. Confirm the rerun detail rows now reflect the closed critical-body queue and the reviewed raw-URL classifications.
5. Decide whether title-only drift should remain visible as an audit finding or be policy-closed again.

## Related files

- `migration/reports/phase-8-article-fidelity-rerun-2026-03-16.csv`
- `migration/reports/phase-8-article-fidelity-rerun-summary-2026-03-16.csv`
- `migration/reports/phase-8-article-fidelity-raw-url-follow-up-2026-03-16.csv`
- `migration/reports/phase-8-article-fidelity-raw-url-follow-up-summary-2026-03-16.csv`
- `migration/reports/phase-8-article-fidelity-audit.csv`
- `migration/reports/phase-8-article-fidelity-audit-summary.csv`
- `analysis/documentation/phase-8/article-fidelity-audit-2026-03-15.md`