# RHI-094 Batch 6 Execution (2026-03-22)

## Change summary
Executed the next caption-migration batch for 15 post routes in `src/content/posts`, converting plain Markdown image syntax to `{{< img-caption >}}` shortcode usage so migrated images render as semantic `<figure>/<figcaption>` blocks.

## Why this changed
Phase 9 caption rollout is progressing in deterministic, auditable batches. Batch 6 extends post coverage while preserving existing repository behavior for linked images and recording source and rendered parity evidence.

## Behavior details

### Old behavior
- Batch-6 routes rendered article images from Markdown `![alt](src)` syntax, including some link-wrapped image patterns.
- Those plain Markdown images did not emit semantic figure/caption relationships.

### New behavior
- Plain Markdown images in the 15 batch-6 routes now render through `{{< img-caption src="..." alt="..." caption="..." >}}`.
- Existing linked-image Markdown patterns were intentionally preserved in 5 cases to retain their click-target behavior, consistent with already-migrated posts elsewhere in the repository.
- Rendered HTML for migrated images emits `<figure class="article-figure">` and `<figcaption class="article-figure__caption">`.

## Impact
- Scope: 15 routes listed in `tmp/img-caption-batch-6-seed-2026-03-22.txt`.
- Source conversion impact:
  - Before: `before_md=32`, `before_shortcode=0`
  - After: `after_md=5`, `after_shortcode=27`
- Deterministic tracking impact: `/tmp/img_caption_articles.txt` advanced from 104 to 119 total tracked routes.

## Verification

### 1. Source parity evidence
- `tmp/img-caption-batch-6-before.csv`
- `tmp/img-caption-batch-6-after.csv`
- Result: 27 plain Markdown images migrated to shortcode usage; 5 linked-image Markdown instances intentionally retained.

### 2. Hugo build success
- Command: `hugo --config hugo.toml --destination tmp/hugo-caption-batch-6 --cleanDestinationDir`
- Result: successful build (`Pages=204`, `Processed images=1000`, no build errors).

### 3. Rendered figure/figcaption parity
- Report: `tmp/img-caption-batch-6-render-parity.csv`
- Method: for each batch route, compare expected shortcode count with rendered `<figure class="article-figure">` and `<figcaption class="article-figure__caption">` counts.
- Result: `routes_total=15`, `pass=15`, `fail=0`.

## Related files
- `tmp/img-caption-batch-6-seed-2026-03-22.txt`
- `tmp/img-caption-batch-6-before.csv`
- `tmp/img-caption-batch-6-after.csv`
- `tmp/img-caption-batch-6-render-parity.csv`
- `src/content/posts/where-to-start-when-you-are-new-to-salesforce-b2c-commerce-cloud-development/index.md`
- `src/content/posts/your-definitive-mobile-app-checklist/index.md`
- `src/content/posts/how-to-use-node-18-with-sfra/index.md`
- `src/content/posts/it-sure-has-been-quiet-on-this-blog/index.md`
- `src/content/posts/lets-go-live-customer-migration/index.md`
- `src/content/posts/leveraging-generic-mappings-in-sfcc/index.md`
- `src/content/posts/reflecting-on-2-years-of-blogging/index.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-22-9-release/index.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-23-1/index.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-23-10-release-a-comprehensive-overview/index.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-23-3-release/index.md`
- `src/content/posts/salesforce-payments-experience-explained/index.md`
- `src/content/posts/secure-coding-in-salesforce-b2c-commerce-cloud/index.md`
- `src/content/posts/sending-emails-from-sfcc/index.md`
- `src/content/posts/sfcc-24-1-release-a-new-year-update/index.md`
