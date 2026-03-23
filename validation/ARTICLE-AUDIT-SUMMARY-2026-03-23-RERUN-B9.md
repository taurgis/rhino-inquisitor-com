# Article Fidelity Audit Summary - 2026-03-23 (Third Audit)

## Audit Scope

- Date: 2026-03-23
- Comparison: live `https://www.rhino-inquisitor.com` vs local `http://127.0.0.1:1313`
- Method: automated article-body visual and textual audit with caption visibility and duplication checks
- Target set: all article routes in batches of 10 (10 routes processed)
- Claim boundary: repository-local comparative audit only; not a public WCAG conformance claim

## Topline Results

- PASS: `0`
- HOLD: `9`
- FAIL: `1`

## Batch Results

| Batch | Routes | PASS | HOLD | FAIL | Notes |
|---|---:|---:|---:|---:|---|
| BATCH-9 | 10 | 0 | 9 | 1 | /salesforce-b2c-commerce-cloud-22-9-release/ (MEDIUM); /salesforce-b2c-commerce-cloud-23-1/ (MEDIUM); /salesforce-b2c-commerce-cloud-23-10-release-a-comprehensive-overview/ (MEDIUM) |

## Critical Caption Checks

- Live figcaptions are compared to local figcaptions so missing local captions are flagged explicitly.
- Local figcaption visibility is checked for display, visibility, opacity, and non-zero rendered size.
- Local figcaptions are flagged when they appear to duplicate the immediate next paragraph after the figure.
- Routes with flagged caption issues or other non-pass results have screenshots saved under the screenshot output directory.

## Flagged Routes

- BATCH-9-001 /salesforce-b2c-commerce-cloud-22-9-release/ - MEDIUM HOLD: text_similarity=0.971 | heading_similarity=1 | visual_diff=21.59 | caption_text_drift=3 | caption-text-drift | local_only_caption=Meme-style graphic celebrating the higher WebDAV upload limit. | local_only_caption=Watch on YouTube | local_only_caption=AfterPay and Venmo payment options highlighted for Salesforce Payments.
- BATCH-9-002 /salesforce-b2c-commerce-cloud-23-1/ - MEDIUM HOLD: text_similarity=0.991 | heading_similarity=1 | visual_diff=7.74 | caption_text_drift=2 | caption-text-drift | caption_text_drift_pair=HSTS in the eCDN => HSTS max-age setting shown in the eCDN interface. | caption_text_drift_pair=HSTS in the Business Manager => HSTS max-age setting shown in Business Manager.
- BATCH-9-003 /salesforce-b2c-commerce-cloud-23-10-release-a-comprehensive-overview/ - MEDIUM HOLD: text_similarity=0.988 | heading_similarity=1 | visual_diff=11.73 | caption_text_drift=1 | caption-text-drift | local_only_caption=Einstein is standing in the middle of a warehouse lane, looking at the camera.
- BATCH-9-004 /salesforce-b2c-commerce-cloud-23-2/ - HIGH FAIL: text_similarity=0.996 | heading_similarity=0.957 | visual_diff=6.4 | missing_live_captions=1 | missing-live-caption | missing_caption_text=New Moving Component
- BATCH-9-005 /salesforce-b2c-commerce-cloud-23-3-release/ - MEDIUM HOLD: text_similarity=0.991 | heading_similarity=0.833 | visual_diff=6.09 | caption_text_drift=2 | caption-text-drift | local_only_caption=AppExchange partner program artwork used for the trial sandbox announcement. | local_only_caption=SLAS Admin UI updated in the 23.3 release.
- BATCH-9-006 /salesforce-b2c-commerce-cloud-catalog-erd/ - MEDIUM HOLD: text_similarity=0.993 | heading_similarity=1 | visual_diff=12.71 | caption_text_drift=1 | caption-text-drift | local_only_caption=Figure 1: Salesforce B2C Commerce Cloud Product and Catalog ERD
- BATCH-9-007 /salesforce-b2c-commerce-cloud-content-erd/ - MEDIUM HOLD: text_similarity=0.986 | heading_similarity=1 | visual_diff=20.72 | caption_text_drift=1 | caption-text-drift | local_only_caption=Figure 1: Salesforce B2C Commerce Cloud Content ERD
- BATCH-9-008 /salesforce-b2c-commerce-cloud-customer-erd/ - MEDIUM HOLD: text_similarity=0.989 | heading_similarity=1 | visual_diff=20.58 | caption_text_drift=1 | caption-text-drift | local_only_caption=Figure 1: Salesforce B2C Commerce Cloud Customer ERD
- BATCH-9-009 /salesforce-b2c-commerce-cloud-documentation/ - MEDIUM HOLD: text_similarity=0.979 | heading_similarity=1 | visual_diff=8.03 | caption_text_drift=3 | caption-text-drift | local_only_caption=Trailhead is the recommended starting point for developers building structured learning around B2C Commerce. | local_only_caption=Partner Learning Camp is exclusive to Salesforce partner organisations and requires a Partner Community login. | local_only_caption=The Solution Architect path sits above Technical Architect and requires cross-cloud integration expertise beyond a singl
- BATCH-9-010 /salesforce-b2c-commerce-cloud-governance-and-quotas/ - MEDIUM HOLD: text_similarity=0.965 | heading_similarity=1 | visual_diff=8.53 | caption_text_drift=5 | caption-text-drift | caption_text_drift_pair=Quota Status in Business Manager => An enforced quota is the point where governance stops being theoretical and star | local_only_caption=Most teams only care about quotas after the first painful surprise in production. | local_only_caption=Alert subscriptions are the cheapest way to notice trouble before the quota is enforced. | local_only_caption=Garbage collection is one of the invisible platform limits that still shapes implementation choices. | local_only_caption=Sometimes the most important quota detail is hidden in community notes rather than product UI.

## Related Files

- validation/article-audit-2026-03-23-rerun-b9.csv
- validation/ARTICLE-AUDIT-SUMMARY-2026-03-23-RERUN-B9.md
- tmp/article-audit-2026-03-23-rerun-b9.json
- tmp/article-audit-2026-03-23-rerun-b9-screens
