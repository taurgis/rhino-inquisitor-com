# RHI-094 Batch 5 Execution (2026-03-22)

## Change summary
Executed the next deterministic caption-migration batch for 15 post routes in `src/content/posts`, converting Markdown image syntax to `{{< img-caption >}}` shortcode usage where safe for semantic `<figure>/<figcaption>` output.

## Why this changed
Phase 9 caption rollout is progressing in deterministic, auditable batches. Batch 5 extends coverage while preserving build safety and route-level render parity evidence.

## Behavior details
### Old behavior
- Batch-5 routes rendered body images from Markdown `![alt](src)` syntax.
- Those images did not consistently emit semantic figure/caption relationships.

### New behavior
- 14 routes now use `{{< img-caption src="..." alt="..." caption="..." >}}` for all previously Markdown images.
- `salesforce-b2c-commerce-cloud-23-2` keeps one `.gif` as Markdown image to avoid Hugo image-processing instability for that asset, while the other images on that route were migrated.
- Rendered HTML for migrated images emits `<figure class="article-figure">` and `<figcaption class="article-figure__caption">`.

## Impact
- Scope: 15 routes listed in `tmp/img-caption-batch-5-seed-2026-03-22.txt`.
- Source conversion impact:
  - Before: `before_md=52`, `before_shortcode=0`
  - After: `after_md=1`, `after_shortcode=51`
- Deterministic tracking impact: `/tmp/img_caption_articles.txt` advanced from 60 to 75 tracked routes.

## Verification
1. Source parity evidence:
- `tmp/img-caption-batch-5-before.csv`
- `tmp/img-caption-batch-5-after.csv`
- Result: 51 of 52 Markdown images migrated; 1 Markdown GIF intentionally retained for build safety.

2. Hugo build success:
- Command: `hugo --config hugo.toml --destination tmp/hugo-caption-batch-5 --cleanDestinationDir`
- Result: successful build (`Pages=204`, `Processed images=824`, no build errors).

3. Rendered figure/figcaption parity:
- Report: `tmp/img-caption-batch-5-render-parity.csv`
- Method: for each batch route, compare expected shortcode count with rendered `<figure class="article-figure">` and `<figcaption class="article-figure__caption">` counts.
- Result: `routes_total=15`, `pass=15`, `fail=0`.

## Related files
- `tmp/img-caption-batch-5-seed-2026-03-22.txt`
- `tmp/img-caption-batch-5-before.csv`
- `tmp/img-caption-batch-5-after.csv`
- `tmp/img-caption-batch-5-render-parity.csv`
- `tmp/img-caption-batch-5-single-build-results.csv`
- `src/content/posts/salesforce-b2c-commerce-cloud-23-2/index.md`
- `src/content/posts/salesforce-b2c-commerce-the-22-5-release/index.md`
- `src/content/posts/the-journey-from-developer-to-architect/index.md`
- `src/content/posts/the-realm-split-field-guide-to-migrating-an-sfcc-site/index.md`
- `src/content/posts/understanding-sfcc-instances/index.md`
- `src/content/posts/what-is-the-ocapi-session-bridge/index.md`
- `src/content/posts/what-is-the-sfcc-managed-runtime/index.md`
- `src/content/posts/a-deep-dive-into-the-23-7-sfcc-release/index.md`
- `src/content/posts/a-look-at-the-23-9-commerce-cloud-release/index.md`
- `src/content/posts/a-survival-guide-to-sfcc-platform-limits/index.md`
- `src/content/posts/b2c-commerce-whats-new-in-the-22-3-release/index.md`
- `src/content/posts/certifications-for-salesforce-b2c-commerce-cloud/index.md`
- `src/content/posts/getting-to-know-the-sfcc-24-4-release/index.md`
- `src/content/posts/how-to-get-salesforce-certification-vouchers/index.md`
- `src/content/posts/how-to-setup-oauth-jwt-for-the-ocapi/index.md`
