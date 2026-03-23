# RHI-094 Caption Quality Rule Update (2026-03-23)

## Change summary

RHI-094 caption migration now uses a stricter content-quality rule: a caption must not duplicate the nearest body copy, not only the image alt text or a migrated WordPress figcaption. This update adds business-analysis decision criteria for when a caption should be removed versus rewritten and defines a recheck gate for completed caption batches.

## Why this changed

The prior rule focused on duplicate alt text and redundant old-site caption paragraphs. That was not strict enough for posts where the surrounding paragraph already carried the full reader-facing message, leaving some migrated figures with visible captions that repeated nearby content without adding value.

## Behavior details

### Old behavior

- Captions were considered acceptable if they were distinct from alt text and old standalone caption paragraphs were removed.
- Nearby paragraph duplication was not an explicit removal condition.
- Batch verification primarily proved shortcode/render parity, not caption-value quality against adjacent copy.

### New behavior

Apply the decision in this order for every migrated figure:

1. Remove the caption when the nearest heading, paragraph, or list item already communicates the same reader-facing message and the figure only supports that nearby explanation.
2. Rewrite the caption when nearby copy overlaps on topic but the figure still needs a short image-specific label for scanability, reference, warning identification, UI naming, or disambiguation.
3. Keep the caption only when it adds net-new image-specific value that is not already present in alt text or adjacent body copy.

Decision notes:

- Compare against the immediate heading and the closest explanatory paragraph or list item before and after the figure.
- Treat duplication as same meaning, not just exact word repetition.
- Prefer removal over rewrite when the rewritten caption would still add no materially new value.
- If a caption is removed, remove any leftover standalone paragraph that repeats the same message so the page says it once.

### Leftover paragraph criteria

Remove the first plain paragraph immediately after a figure when all are true:

- It directly follows the figure with no intervening heading, list, or second figure.
- It functions only as a figure label, image title, or short restatement of what the image shows.
- It substantially duplicates the figcaption, the image message, or the nearest surrounding body copy.
- Removing it does not break the article's sentence flow, transition, or instructional meaning.

Keep the paragraph as body prose when any are true:

- It adds net-new explanation, instruction, warning, consequence, or interpretation.
- It starts the next step, comparison, or argument rather than merely naming the image.
- Later sentences depend on it for flow or context.
- Removing it would delete unique reader-facing meaning.

### Remove versus rewrite criteria

Remove a caption when all are true:

- The nearby paragraph already states the figure message in reader-facing terms.
- The caption would only restate that same message.
- The figure does not need a separate visible label for reference or disambiguation.

Rewrite a caption when all are true:

- Nearby copy covers the same topic at a paragraph level.
- The figure still benefits from a short image-specific identifier.
- A shorter caption can add unique value such as the exact screen name, warning name, comparison axis, or figure reference.

Keep a caption when all are true:

- The caption adds unique value not already present nearby.
- The value is visible-reader useful, not only screen-reader fallback.
- The caption helps readers identify or reference the image more precisely than nearby prose does.

## Impact

- Content reviewers must compare captions against adjacent body copy, not only alt text.
- Reviewers must separately classify the first plain paragraph after each figure as leftover caption text to remove or legitimate body prose to keep.
- Completed RHI-094 batches need a targeted quality recheck even if shortcode/render parity already passed.
- Execution evidence must now record caption dispositions, not just figure counts and build success.

## Verification

### Acceptance criteria for completed-batch recheck

1. Every migrated figure in every completed caption batch is reviewed against the nearest surrounding body copy and dispositioned as keep, rewrite, or remove.
2. Any figure marked remove no longer renders a figcaption and no longer leaves a leftover first paragraph after the figure when that paragraph only repeats the figure label or nearby body-copy message.
3. Any figure marked rewrite keeps a caption that adds net-new image-specific value not already present in adjacent copy.
4. Alt text remains descriptive and does not absorb visible-caption duties that belong in body content.

5. Hugo build success is rerun after any recheck edits.
6. Rendered figure parity is rerun after any recheck edits so shortcode cleanup does not regress semantic output.
7. Recheck evidence records route, figure identifier, final caption disposition, any immediate post-figure paragraph decision (`remove` or `keep`), and rationale for every changed figure and every reviewed no-change exception.

### Practical recheck workflow

1. Start from each completed batch inventory and open the source Markdown plus rendered page.
2. For each migrated figure, compare the caption to the immediate heading and nearest explanatory paragraph or list item, then evaluate the first plain paragraph after the figure separately.
3. Record keep when the caption adds unique value, rewrite when a shorter image-specific label is justified, and remove when nearby copy already carries the full message; for the immediate post-figure paragraph, record remove only when it is leftover caption text and keep when it advances the article.
4. Rebuild Hugo and rerun render-parity checks after any recheck edits.
5. Publish one recheck note listing reviewed batches, changed routes, unchanged routes, and verification evidence.

## Related files

- analysis/tickets/phase-9/RHI-094-img-caption-accessibility-migration.md
- analysis/documentation/phase-9/RHI-094-img-caption-accessibility-pattern.md
- analysis/documentation/phase-9/RHI-094-img-caption-batch-3-execution-2026-03-22.md
- analysis/documentation/phase-9/RHI-094-img-caption-batch-4-execution-2026-03-22.md
- analysis/documentation/phase-9/RHI-094-img-caption-batch-5-execution-2026-03-22.md
- analysis/documentation/phase-9/RHI-094-img-caption-batch-6-execution-2026-03-22.md
- analysis/documentation/phase-9/RHI-094-img-caption-batch-7-execution-2026-03-22.md
- analysis/documentation/phase-9/RHI-094-img-caption-batch-8-execution-2026-03-22.md
