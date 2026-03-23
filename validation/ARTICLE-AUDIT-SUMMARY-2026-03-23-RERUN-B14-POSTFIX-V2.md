# Article Fidelity Audit Summary - 2026-03-23 (Third Audit)

## Audit Scope

- Date: 2026-03-23
- Comparison: live `https://www.rhino-inquisitor.com` vs local `http://127.0.0.1:1313`
- Method: automated article-body visual and textual audit with caption visibility and duplication checks
- Target set: all article routes in batches of 10 (10 routes processed)
- Claim boundary: repository-local comparative audit only; not a public WCAG conformance claim

## Topline Results

- PASS: `9`
- HOLD: `1`
- FAIL: `0`

## Batch Results

| Batch | Routes | PASS | HOLD | FAIL | Notes |
|---|---:|---:|---:|---:|---|
| BATCH-14 | 10 | 9 | 1 | 0 | /unravelling-the-mystery-of-dates-in-the-ocapi/ (MEDIUM) |

## Critical Caption Checks

- Live figcaptions are compared to local figcaptions so missing local captions are flagged explicitly.
- Local figcaption visibility is checked for display, visibility, opacity, and non-zero rendered size.
- Local figcaptions are flagged when they appear to duplicate the immediate next paragraph after the figure.
- Routes with flagged caption issues or other non-pass results have screenshots saved under the screenshot output directory.

## Flagged Routes

- BATCH-14-006 /unravelling-the-mystery-of-dates-in-the-ocapi/ - MEDIUM HOLD: text_similarity=0.989 | heading_similarity=0.778 | visual_diff=39.48 | caption_text_drift=1 | caption-text-drift | visual-drift | caption_text_drift_pair= => Illustration introducing OCAPI date-range filtering.

## Related Files

- validation/article-audit-2026-03-23-rerun-b14-postfix-v2.csv
- validation/ARTICLE-AUDIT-SUMMARY-2026-03-23-RERUN-B14-POSTFIX-V2.md
- tmp/article-audit-2026-03-23-rerun-b14-postfix-v2.json
- tmp/article-audit-2026-03-23-rerun-b14-postfix-v2-screens
