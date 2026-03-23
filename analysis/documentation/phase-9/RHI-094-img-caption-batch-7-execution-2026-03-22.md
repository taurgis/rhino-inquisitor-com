# RHI-094 Batch 7 Execution (2026-03-22)

## Change summary
Executed the next deterministic caption-migration batch for 15 post routes in `src/content/posts`, converting plain Markdown image syntax to `{{< img-caption >}}` shortcode usage where build-safe while preserving click-target linked-image Markdown.

## Why this changed
Phase 9 caption rollout is progressing in deterministic, auditable batches. Batch 7 extends post coverage while preserving established repository exceptions for linked-image click targets and newly observed shortcode build-safety limits for SVG media.

## Behavior details

### Old behavior
- Batch-7 routes rendered body images from Markdown image syntax, including multiple link-wrapped image patterns used as direct click targets.
- Those plain Markdown images did not emit semantic figure/caption relationships.

### New behavior
- 10 routes now use `{{< img-caption src="..." alt="..." caption="..." >}}` for 14 previously plain Markdown images.
- Existing linked-image Markdown patterns were intentionally preserved in 9 cases to retain click-target behavior, consistent with already-migrated posts elsewhere in the repository.
- `helpful-salesforce-b2c-commerce-cloud-cli-tools` keeps one SVG as Markdown image because the current `img-caption` and `media/image.html` path requires a local image resource with metadata or explicit dimensions for non-processable images.
- Rendered HTML for migrated images emits `<figure class="article-figure">` and `<figcaption class="article-figure__caption">`.

## Impact
- Scope: 15 routes listed in `tmp/img-caption-batch-7-seed-2026-03-22.txt`.
- Source conversion impact:
  - Before: `before_md=24`, `before_shortcode=0`
  - After: `after_md=10`, `after_shortcode=14`
- Deterministic tracking impact: `/tmp/img_caption_articles.txt` advanced from 119 to 134 total tracked routes.

## Verification

### 1. Source parity evidence
- `tmp/img-caption-batch-7-before.csv`
- `tmp/img-caption-batch-7-after.csv`
- Result: 14 plain Markdown images migrated to shortcode usage; 9 linked-image Markdown instances and 1 SVG Markdown image were intentionally retained.

### 2. Hugo build success
- Command: `hugo --config hugo.toml --destination tmp/hugo-caption-batch-7 --cleanDestinationDir`
- Result: successful build (`Pages=204`, `Processed images=1024`, no build errors).

### 3. Rendered figure/figcaption parity
- Report: `tmp/img-caption-batch-7-render-parity.csv`
- Method: for each batch route, compare expected shortcode count with rendered `<figure class="article-figure">` and `<figcaption class="article-figure__caption">` counts.
- Result: `routes_total=15`, `pass=15`, `fail=0`.

## Related files
- `tmp/img-caption-batch-7-seed-2026-03-22.txt`
- `tmp/img-caption-batch-7-before.csv`
- `tmp/img-caption-batch-7-after.csv`
- `tmp/img-caption-batch-7-render-parity.csv`
- `src/content/posts/should-i-get-javascript-developer-i-certified/index.md`
- `src/content/posts/the-b2c-commerce-architect-certification/index.md`
- `src/content/posts/the-createorders-api-in-sfcc/index.md`
- `src/content/posts/the-request-body-in-an-sfcc-controller/index.md`
- `src/content/posts/three-things-to-secure-sfcc/index.md`
- `src/content/posts/unravelling-the-mystery-of-dates-in-the-ocapi/index.md`
- `src/content/posts/why-circumventing-sfcc-quota-limits-is-a-bad-idea/index.md`
- `src/content/posts/salesforce-connections-2024-and-sfcc/index.md`
- `src/content/posts/sfcc-url-cracking-the-code/index.md`
- `src/content/posts/should-i-use-sfra-rest-endpoints-in-a-composable-storefront/index.md`
- `/tmp/img_caption_articles.txt`
