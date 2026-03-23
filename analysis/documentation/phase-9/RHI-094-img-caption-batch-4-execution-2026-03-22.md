# RHI-094 Batch 4 Execution (2026-03-22)

## Change summary
Executed the next caption-migration batch for 15 post routes in `src/content/posts`, converting Markdown image syntax to `{{< img-caption >}}` shortcode usage so migrated images render as semantic `<figure>/<figcaption>` blocks.

## Why this changed
Phase 9 caption rollout is being executed in deterministic batches. This batch advances post coverage after batch 3 and keeps the migration auditable with source parity and rendered parity evidence.

## Behavior details
### Old behavior
- Batch-4 routes rendered article images from Markdown `![alt](src)` syntax.
- Those images did not consistently emit semantic figure/caption relationships.

### New behavior
- Batch-4 routes now render migrated images through `{{< img-caption src="..." alt="..." caption="..." >}}`.
- Built HTML emits `<figure class="article-figure">` and `<figcaption class="article-figure__caption">` for each migrated image.

## Impact
- Scope: 15 routes listed in `tmp/img-caption-batch-4-seed-2026-03-22.txt`.
- Source impact: 73 Markdown image entries migrated to shortcode usage.
- Progress impact: migrated-post inventory increased from 45 to 60 posts using `img-caption`.

## Verification
1. Source baseline and totals:
- `tmp/img-caption-batch-4-before.csv`
- `tmp/img-caption-batch-4-after.csv`
- Result: `before_md=73`, `after_md=0`, `after_shortcode=73`.

2. Hugo build success:
- Command: `hugo --config hugo.toml --destination tmp/hugo-caption-batch-4 --cleanDestinationDir`
- Result: successful build (`Pages=204`, `Processed images=736`, no build errors).

3. Semantic rendered parity:
- Report: `tmp/img-caption-batch-4-render-parity.csv`
- Method: per route, compare expected shortcode count with rendered `<figure class="article-figure">` and `<figcaption class="article-figure__caption">` counts.
- Result: `routes_total=15`, `pass=15`, `fail=0`.

## Related files
- `tmp/img-caption-batch-4-seed-2026-03-22.txt`
- `tmp/img-caption-batch-4-before.csv`
- `tmp/img-caption-batch-4-after.csv`
- `tmp/img-caption-batch-4-render-parity.csv`
- `src/content/posts/the-state-of-ohana-for-salesforce-commerce-cloud/index.md`
- `src/content/posts/what-can-i-use-chatgpt-for-when-working-with-salesforce/index.md`
- `src/content/posts/what-is-commerce-on-core/index.md`
- `src/content/posts/where-to-hook-into-an-sfra-controller/index.md`
- `src/content/posts/commerce-cloud-t-shirts-on-shirtforce/index.md`
- `src/content/posts/creating-custom-ocapi-endpoints/index.md`
- `src/content/posts/how-to-use-ocapi-scapi-hooks/index.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-governance-and-quotas/index.md`
- `src/content/posts/salesforce-b2c-commerce-the-22-6-release/index.md`
- `src/content/posts/a-dev-guide-to-combating-fraud-on-sfcc/index.md`
- `src/content/posts/a-look-at-the-salesforce-b2c-commerce-cloud-24-2-release/index.md`
- `src/content/posts/a-new-day-for-commerce-recap/index.md`
- `src/content/posts/ai-wont-steal-your-sfcc-job-but-a-developer-using-ai-will/index.md`
- `src/content/posts/helpful-salesforce-b2c-commerce-cloud-cartridges/index.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-22-8/index.md`
