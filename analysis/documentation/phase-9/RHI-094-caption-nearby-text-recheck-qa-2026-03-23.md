# RHI-094 Caption Nearby-Text Recheck QA (2026-03-23)

**Document Type**: QA Guidance and Regression Gate  
**Phase**: Phase 9  
**Date**: 2026-03-23  
**Status**: Active  

## Change summary

This guidance adds a stricter recheck rule for completed RHI-094 caption batches. A caption now fails not only when it duplicates alt text, but also when it substantially repeats nearby body text that appears immediately before or after the figure.

## Why this changed

The original RHI-094 rollout evidence focused on shortcode conversion totals, Hugo build success, and rendered `figure`/`figcaption` parity. That was necessary, but it was not sufficient to catch a second readability issue: some migrated captions can restate the same sentence or claim that already exists in the adjacent body copy, which creates unnecessary repetition for sighted readers and screen-reader users.

## Behavior details

### Old behavior

- A migrated route passed when shortcode/render parity held, the Hugo build succeeded, and the caption was not a near-copy of the image alt text.
- Nearby body-copy duplication was reviewed inconsistently and was not a measurable release gate.

### New behavior

- A migrated route still must pass shortcode/render parity and build checks.
- A migrated caption now also fails if it materially duplicates nearby body text within the defined review window.
- Batch rechecks must use both deterministic scan rules and manual sampling before the batch is closed again.

## Impact

- Scope in repository evidence: documented completed caption batches 3 through 8.
- Recheck scope for duplicate-with-nearby-body-text review:
  - Batches 3 through 7: full caption review required.
  - Batch 8: preservation-only closure batch; verify that no newly edited captions were introduced, but no duplicate-caption audit is needed unless those preserved routes are changed.
- Process impact: caption cleanup after recheck is now measured as a content-quality gate, not only a semantic-markup gate.

## Verification

### Detection rule

Apply the stricter rule to every `{{< img-caption >}}` instance in recheck scope.

1. Normalize the caption and nearby body text before comparison:
   - lowercase text
   - remove leading `Figure N:` labels
   - strip punctuation, quotes, and extra whitespace
   - compare on word tokens, not raw markup
2. Define the nearby body-text window as:
   - the first body block before the figure, if it is within two content blocks
   - the first body block after the figure, if it is within two content blocks
3. Count as a body block:
   - paragraph
   - blockquote
   - admonition/note body
   - list item group that directly explains the figure
4. Ignore for automatic failure:
   - headings alone
   - blank lines
   - bare image links wrapping the shortcode

### Measurable failure criteria

Mark a caption as `FAIL` when any of the following is true:

1. Exact normalized match between caption and nearby body block.
2. Nearby body block contains a contiguous span of 8 or more caption words.
3. Nearby body block contains at least 80% of the caption's meaningful tokens and the caption has 8 or more meaningful tokens.

Mark as `REVIEW` when both are true:

1. Token overlap is 60% to 79%.
2. The nearby block appears in the same local figure context but may add one new fact.

Mark as `PASS` when both are true:

1. Token overlap stays below 60%, or only shared product/platform names overlap.
2. The nearby text adds distinct explanation, instruction, or analysis rather than restating the caption.

### Sampling plan

Run the recheck in two layers.

1. Automated scan: 100% of caption shortcodes in all documented completed batches.
2. Manual review: 100% of `FAIL` and `REVIEW` candidates.
3. Unflagged sample: review at least 20% of routes per batch, rounded up, with these minimums:
   - batches 3 through 7: 3 routes each
   - batch 8: 0 routes unless a preserved route was edited
4. Sample composition per batch should include, when available:
   - 1 route with caption followed by a paragraph
   - 1 route with a link-wrapped caption image
   - 1 route with screenshot/tutorial style copy

### Escalation rule

If manual review finds 1 confirmed false negative in the unflagged sample for a batch, expand that batch to full manual caption review before sign-off.

### Regression gates after edits

Do not reclose the edited batch unless all gates below pass.

1. Content gate: 0 confirmed nearby-text duplication findings remain on edited routes.
2. Structure gate: rendered `figure.article-figure` and `figcaption.article-figure__caption` counts match the edited route's shortcode count.
3. Build gate: `hugo --config hugo.toml --cleanDestinationDir` succeeds for the validation build.
4. Exception gate: known preservation cases remain intact unless separately validated:
   - linked-image click targets
   - the Batch 5 retained GIF route
   - the Batch 7 retained SVG route
5. Diff gate: content changes stay limited to caption text and immediately redundant nearby copy unless an explicit editorial correction is documented.

## Related files

- `analysis/documentation/phase-9/RHI-094-img-caption-accessibility-pattern.md`
- `analysis/tickets/phase-9/RHI-094-img-caption-accessibility-migration.md`
- `analysis/documentation/phase-9/RHI-094-img-caption-batch-3-execution-2026-03-22.md`
- `analysis/documentation/phase-9/RHI-094-img-caption-batch-4-execution-2026-03-22.md`
- `analysis/documentation/phase-9/RHI-094-img-caption-batch-5-execution-2026-03-22.md`
- `analysis/documentation/phase-9/RHI-094-img-caption-batch-6-execution-2026-03-22.md`
- `analysis/documentation/phase-9/RHI-094-img-caption-batch-7-execution-2026-03-22.md`
- `analysis/documentation/phase-9/RHI-094-img-caption-batch-8-execution-2026-03-22.md`
