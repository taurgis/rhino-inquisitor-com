# Article Fidelity Audit Summary - 2026-03-23 (Third Audit)

## Audit Scope

- Date: 2026-03-23
- Comparison: live `https://www.rhino-inquisitor.com` vs local `http://127.0.0.1:1313`
- Method: automated article-body visual and textual audit with caption visibility and duplication checks
- Target set: all article routes in batches of 10 (10 routes processed)
- Claim boundary: repository-local comparative audit only; not a public WCAG conformance claim

## Topline Results

- PASS: `8`
- HOLD: `1`
- FAIL: `1`

## Batch Results

| Batch | Routes | PASS | HOLD | FAIL | Notes |
|---|---:|---:|---:|---:|---|
| BATCH-14 | 10 | 8 | 1 | 1 | /third-party-api-caching-in-commerce-cloud/ (LOW); /unravelling-the-mystery-of-dates-in-the-ocapi/ (HIGH) |

## Critical Caption Checks

- Live figcaptions are compared to local figcaptions so missing local captions are flagged explicitly.
- Local figcaption visibility is checked for display, visibility, opacity, and non-zero rendered size.
- Local figcaptions are flagged when they appear to duplicate the immediate next paragraph after the figure.
- Routes with flagged caption issues or other non-pass results have screenshots saved under the screenshot output directory.

## Flagged Routes

- BATCH-14-001 /third-party-api-caching-in-commerce-cloud/ - LOW HOLD: text_similarity=0.996 | heading_similarity=1 | visual_diff=12.04 | caption_dup_candidates=1 | caption-dup-candidate | possible duplicate caption copy: The number of requests handled by the API decreased consider
- BATCH-14-006 /unravelling-the-mystery-of-dates-in-the-ocapi/ - HIGH FAIL: text_similarity=0.996 | heading_similarity=0.778 | visual_diff=39.74 | empty_captions=1 | empty-caption | visual-drift | empty caption

## Related Files

- validation/article-audit-2026-03-23-rerun-b14-postfix.csv
- validation/ARTICLE-AUDIT-SUMMARY-2026-03-23-RERUN-B14-POSTFIX.md
- tmp/article-audit-2026-03-23-rerun-b14-postfix.json
- tmp/article-audit-2026-03-23-rerun-b14-postfix-screens
