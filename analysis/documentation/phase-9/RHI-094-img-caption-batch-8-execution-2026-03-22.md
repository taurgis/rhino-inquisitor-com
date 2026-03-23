# RHI-094 Batch 8 Execution — Migration Closure (2026-03-22)

## Change summary

Batch 8 is the closure batch for RHI-094 caption migration. A definitive inventory scan found that the only remaining posts with Markdown image syntax fall into intentional preservation categories. No source file conversions were performed.

## Why this changed

The refreshed candidate inventory showed that all remaining unmigrated posts are non-convertible under the repository’s established rules:

- linked-image Markdown that preserves click-target behavior
- one SVG image that remains Markdown for shortcode build safety

This leaves zero remaining convertible plain Markdown images.

## Behavior details

### Old behavior
The remaining six candidates still used Markdown image syntax and had not been recorded as final preservation-only routes.

### New behavior
These six routes are now formally closed as intentional preservations:

| Category | Posts | Preserved images |
|---|---|---|
| linked-image (click target) | 5 | 6 |
| svg-exception | 1 | 1 |
| **Convertible remaining** | **0** | **0** |

RHI-094 img-caption conversion work is complete. No further conversion batches are needed.

## Preserved posts (final closure batch)

| Slug | md_images | sc | Reason |
|---|---|---|---|
| storefront-protection-in-the-pwa-kit | 2 | 0 | linked-image |
| submitting-a-file-to-a-third-party-service-in-sfcc | 2 | 0 | linked-image |
| helpful-salesforce-b2c-commerce-cloud-cli-tools | 1 | 0 | svg-exception |
| salesforce-b2c-commerce-cloud-the-22-7-release | 1 | 0 | linked-image |
| submit-multipart-form-data-to-a-third-party-service-in-sfcc | 1 | 0 | linked-image |
| the-deprecation-of-the-uuid-token-for-api-clients | 1 | 0 | linked-image |

## Impact
- Scope: 6 preserved posts documented in `tmp/img-caption-batch-8-seed-2026-03-22.txt`.
- Source conversions: 0 (all posts in this batch are intentional preservations).
- Deterministic closure impact: no remaining convertible plain Markdown images remain in the current inventory.
- RHI-094 status: **migration complete** — no further conversion batches are needed.

## Verification

### 1. Source parity evidence
- `tmp/img-caption-batch-8-before.csv`
- `tmp/img-caption-batch-8-after.csv`
- Result: before and after are identical; all six posts remain preservation-only by design.

### 2. Hugo build success
- Command: `hugo --config hugo.toml --destination tmp/hugo-caption-batch-8 --cleanDestinationDir`
- Result: successful build (`Pages=204`, `Processed images=1028`, no build errors).

### 3. Rendered figure/figcaption parity
- Report: `tmp/img-caption-batch-8-render-parity.csv`
- Method: for each preserved post, compare expected shortcode count with rendered `<figure class="article-figure">` and `<figcaption class="article-figure__caption">` counts.
- Result: `routes_total=6`, `pass=6`, `fail=0`.

## Related files
- `tmp/img-caption-batch-8-seed-2026-03-22.txt`
- `tmp/img-caption-batch-8-before.csv`
- `tmp/img-caption-batch-8-after.csv`
- `tmp/img-caption-batch-8-render-parity.csv`
- `src/content/posts/storefront-protection-in-the-pwa-kit/index.md`
- `src/content/posts/submitting-a-file-to-a-third-party-service-in-sfcc/index.md`
- `src/content/posts/helpful-salesforce-b2c-commerce-cloud-cli-tools/index.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-the-22-7-release/index.md`
- `src/content/posts/submit-multipart-form-data-to-a-third-party-service-in-sfcc/index.md`
- `src/content/posts/the-deprecation-of-the-uuid-token-for-api-clients/index.md`
