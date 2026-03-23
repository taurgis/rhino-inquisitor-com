# Article Fidelity Audit Summary - 2026-03-23 (Third Audit)

## Audit Scope

- Date: 2026-03-23
- Comparison: live `https://www.rhino-inquisitor.com` vs local `http://127.0.0.1:1313`
- Method: automated article-body visual and textual audit with caption visibility and duplication checks
- Target set: all article routes in batches of 10 (10 routes processed)
- Claim boundary: repository-local comparative audit only; not a public WCAG conformance claim

## Topline Results

- PASS: `3`
- HOLD: `2`
- FAIL: `5`

## Batch Results

| Batch | Routes | PASS | HOLD | FAIL | Notes |
|---|---:|---:|---:|---:|---|
| BATCH-15 | 10 | 3 | 2 | 5 | /what-is-oci-omnichannel-inventory/ (HIGH); /what-is-the-ocapi-session-bridge/ (HIGH); /what-is-the-sfcc-managed-runtime/ (HIGH) |

## Critical Caption Checks

- Live figcaptions are compared to local figcaptions so missing local captions are flagged explicitly.
- Local figcaption visibility is checked for display, visibility, opacity, and non-zero rendered size.
- Local figcaptions are flagged when they appear to duplicate the immediate next paragraph after the figure.
- Routes with flagged caption issues or other non-pass results have screenshots saved under the screenshot output directory.

## Flagged Routes

- BATCH-15-002 /what-is-oci-omnichannel-inventory/ - HIGH FAIL: text_similarity=0.98 | heading_similarity=1 | visual_diff=9.42 | missing_live_captions=1 | missing-live-caption | missing_caption_text=Example of location grouping
- BATCH-15-003 /what-is-the-ocapi-session-bridge/ - HIGH FAIL: text_similarity=0.993 | heading_similarity=1 | visual_diff=18.33 | missing_live_captions=3 | missing-live-caption | missing_caption_text= | missing_caption_text=A secure way of working with sensitive data | missing_caption_text=SFCC Makes sure no sensitive data is shared in a possibly insecure scenario
- BATCH-15-004 /what-is-the-sfcc-managed-runtime/ - HIGH FAIL: text_similarity=1 | heading_similarity=1 | visual_diff=14.7 | missing_live_captions=1 | missing-live-caption | missing_caption_text=An example of a "roll your own" architecture
- BATCH-15-005 /what-skills-do-i-need-as-a-sfcc-architect/ - MEDIUM HOLD: text_similarity=0.942 | heading_similarity=1 | visual_diff=12 | caption_text_drift=2 | caption-text-drift | caption_text_drift_pair=Having a clear understanding of a business's needs and wants is essential. => The role shifts from building features to turning ambiguous business goals into  | caption_text_drift_pair=It's impossible to have all the answers. It's okay to reach out and seek assista => Community and mentorship shorten the path from platform knowledge to architectur
- BATCH-15-006 /where-is-the-new-sfcc-documentation/ - HIGH FAIL: text_similarity=1 | heading_similarity=1 | visual_diff=10.39 | missing_live_captions=1 | missing-live-caption | missing_caption_text=I just go with the flow...but suggest improvements
- BATCH-15-007 /where-to-hook-into-an-sfra-controller/ - HIGH FAIL: text_similarity=0.974 | heading_similarity=1 | visual_diff=13.58 | missing_live_captions=6 | missing-live-caption | missing_caption_text=The "home.js" controller file of SFRA | missing_caption_text=The standard Home-Show controller logic visualised | missing_caption_text=Visualising what "prepending" does in a single route (Home-Show) | missing_caption_text=Visualising what "appending" does in a single route (Home-Show) | missing_caption_text=Visualising what "replacing" does in a single route (Home-Show) | missing_caption_text=Bringing all of the options together!
- BATCH-15-009 /why-circumventing-sfcc-quota-limits-is-a-bad-idea/ - MEDIUM HOLD: text_similarity=0.964 | heading_similarity=1 | visual_diff=35.41 | caption_text_drift=1 | caption-text-drift | visual-restyle-drift | caption_text_drift_pair=No... you aren't going to get arrested => A bear wearing an orange prison jumpsuit with a blue cloud logo on the back, wal

## Related Files

- validation/article-audit-2026-03-23-rerun-b15.csv
- validation/ARTICLE-AUDIT-SUMMARY-2026-03-23-RERUN-B15.md
- tmp/article-audit-2026-03-23-rerun-b15.json
- tmp/article-audit-2026-03-23-rerun-b15-screens
