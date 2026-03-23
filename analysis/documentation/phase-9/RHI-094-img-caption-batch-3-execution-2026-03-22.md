# RHI-094 Batch 3 Execution (2026-03-22)

## Change summary
Executed the next caption-migration batch for 15 post routes in `src/content/posts`, converting Markdown image syntax to `{{< img-caption >}}` shortcode usage for semantic `<figure>/<figcaption>` rendering.

## Why this changed
The Phase 9 caption rollout requires incremental migration of image-heavy routes so article media uses the approved accessible caption pattern and no longer depends on plain Markdown image rendering.

## Behavior details
### Old behavior
- Routes in this batch rendered image content from Markdown `![alt](src)`.
- Semantic figure/caption relationships were not emitted by default for these images.

### New behavior
- All batch image entries now render through `{{< img-caption src="..." alt="..." caption="..." >}}`.
- Rendered HTML emits `<figure class="article-figure">` and `<figcaption class="article-figure__caption">` for each migrated image.

## Impact
- Scope: 15 routes listed in `tmp/img-caption-batch-3-seed-2026-03-22.txt`.
- Content impact: 106 Markdown image entries migrated to shortcode usage.
- Maintainer impact: parity checks now track `figure/figcaption` counts on these routes.

## Verification
1. Conversion baseline and totals:
- `tmp/img-caption-batch-3-before.csv`
- `tmp/img-caption-batch-3-after-fix.csv`
- Result: `total_md=0`, `total_img_caption=106` after migration.

2. Hugo build success:
- Command: `hugo --config hugo.toml --destination tmp/hugo-caption-batch-3 --cleanDestinationDir`
- Result: successful build (`Pages=204`, `Processed images=621`, no build errors).

3. Semantic render parity:
- Report: `tmp/img-caption-batch-3-render-parity.csv`
- Method: per migrated route, compare expected shortcode count against rendered `<figure class="article-figure">` and `<figcaption class="article-figure__caption">` counts.
- Result: `routes_total=15`, `pass=15`, `fail=0`.

## Related files
- `tmp/img-caption-batch-3-seed-2026-03-22.txt`
- `tmp/img-caption-batch-3-before.csv`
- `tmp/img-caption-batch-3-after-fix.csv`
- `tmp/img-caption-batch-3-render-parity.csv`
- `src/content/posts/lets-go-live-ecdn/index.md`
- `src/content/posts/salesforce-commerce-cloud-products/index.md`
- `src/content/posts/how-to-set-up-slas-for-the-composable-storefront/index.md`
- `src/content/posts/20-years-of-dreamforce/index.md`
- `src/content/posts/ai-einstein-in-salesforce-b2c-commerce-cloud/index.md`
- `src/content/posts/how-to-extend-active-data-in-salesforce-b2c-commerce-cloud/index.md`
- `src/content/posts/sitegenesis-vs-sfra-vs-pwa/index.md`
- `src/content/posts/ai-as-an-architect-and-content-creator/index.md`
- `src/content/posts/b2c-commerce-whats-new-in-22-4/index.md`
- `src/content/posts/chasing-clouds-catching-up-with-the-commercecrew-at-dreamforce-2023/index.md`
- `src/content/posts/how-to-change-the-code-compatibility-mode-in-salesforce-b2c-commerce-cloud/index.md`
- `src/content/posts/non-technical-sfcc-certifications/index.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-22-10/index.md`
- `src/content/posts/server-side-performance-in-sfcc/index.md`
- `src/content/posts/taming-the-beast-a-developers-deep-dive-into-sfcc-meta-tag-rules/index.md`
