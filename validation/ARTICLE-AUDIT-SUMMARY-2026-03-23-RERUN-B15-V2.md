# Article Fidelity Audit Summary - 2026-03-23 (Third Audit)

## Audit Scope

- Date: 2026-03-23
- Comparison: live `https://www.rhino-inquisitor.com` vs local `http://127.0.0.1:1313`
- Method: automated article-body visual and textual audit with caption visibility and duplication checks
- Target set: all article routes in batches of 10 (10 routes processed)
- Claim boundary: repository-local comparative audit only; not a public WCAG conformance claim

## Topline Results

- PASS: `9`
- HOLD: `0`
- FAIL: `1`

## Batch Results

| Batch | Routes | PASS | HOLD | FAIL | Notes |
|---|---:|---:|---:|---:|---|
| BATCH-15 | 10 | 9 | 0 | 1 | /what-is-the-ocapi-session-bridge/ (HIGH) |

## Critical Caption Checks

- Live figcaptions are compared to local figcaptions so missing local captions are flagged explicitly.
- Local figcaption visibility is checked for display, visibility, opacity, and non-zero rendered size.
- Local figcaptions are flagged when they appear to duplicate the immediate next paragraph after the figure.
- Routes with flagged caption issues or other non-pass results have screenshots saved under the screenshot output directory.

## Flagged Routes

- BATCH-15-003 /what-is-the-ocapi-session-bridge/ - HIGH FAIL: text_similarity=0.993 | heading_similarity=1 | visual_diff=18.17 | empty_captions=1 | empty-caption | empty caption

## Related Files

- validation/article-audit-2026-03-23-rerun-b15-v2.csv
- validation/ARTICLE-AUDIT-SUMMARY-2026-03-23-RERUN-B15-V2.md
- tmp/article-audit-2026-03-23-rerun-b15-v2.json
- tmp/article-audit-2026-03-23-rerun-b15-v2-screens
