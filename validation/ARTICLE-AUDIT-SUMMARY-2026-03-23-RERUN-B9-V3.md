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
| BATCH-9 | 10 | 9 | 1 | 0 | /salesforce-b2c-commerce-cloud-22-9-release/ (MEDIUM) |

## Critical Caption Checks

- Live figcaptions are compared to local figcaptions so missing local captions are flagged explicitly.
- Local figcaption visibility is checked for display, visibility, opacity, and non-zero rendered size.
- Local figcaptions are flagged when they appear to duplicate the immediate next paragraph after the figure.
- Routes with flagged caption issues or other non-pass results have screenshots saved under the screenshot output directory.

## Flagged Routes

- BATCH-9-001 /salesforce-b2c-commerce-cloud-22-9-release/ - MEDIUM HOLD: text_similarity=0.984 | heading_similarity=1 | visual_diff=23.2 | caption_text_drift=1 | caption-text-drift | local_only_caption=Watch on YouTube

## Related Files

- validation/article-audit-2026-03-23-rerun-b9-v3.csv
- validation/ARTICLE-AUDIT-SUMMARY-2026-03-23-RERUN-B9-V3.md
- tmp/article-audit-2026-03-23-rerun-b9-v3.json
- tmp/article-audit-2026-03-23-rerun-b9-v3-screens
