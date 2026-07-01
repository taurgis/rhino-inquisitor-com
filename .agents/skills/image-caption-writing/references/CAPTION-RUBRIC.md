# Caption Rubric

Use this rubric when reviewing `{{< img-caption >}}` caption text.

## Decision Matrix

| Signal | Evidence | Decision |
|---|---|---|
| Empty or placeholder caption | Caption is blank after trim, or contains only zero-width placeholder text | Remove |
| Alt-text duplication | Caption communicates the same meaning as image `alt` text | Remove |
| Nearby-copy duplication | Caption repeats the nearest heading, paragraph, or list-item message | Remove |
| Topic overlap but image needs distinct identifier | Nearby prose covers topic, but image needs a short visual label for scanability | Rewrite |
| Unique image-specific value | Caption adds visual detail not already available in nearby copy or alt text | Keep |

## Rewrite Guidance

When rewriting, target one concrete detail:

- Exact screen or panel name
- Warning/banner state
- Comparison axis or chart state
- Before/after context not explicit in nearby prose

Avoid these rewrite anti-patterns:

- Generic labels (`Figure 1`, `Screenshot`, `Overview`)
- Raw URLs as captions
- Repeating section headers verbatim

## Post-Figure Paragraph Cross-Check

After caption decision, review the first plain paragraph after the figure.

Remove paragraph when all are true:

- It is directly adjacent to the figure
- It acts as a label or short restatement
- It duplicates caption or nearby prose meaning
- Removal preserves narrative flow

Keep paragraph when any are true:

- Adds instruction, warning, or interpretation
- Starts next-step narrative
- Provides context required by later sentences

## Recording Format

Record one decision row per figure:

- `route`: article path
- `figure`: stable identifier (src filename or figure index)
- `caption_disposition`: `keep` | `rewrite` | `remove`
- `post_figure_paragraph`: `keep` | `remove` | `n/a`
- `reason`: one sentence focused on reader-visible value

## QA Pass Conditions

A review set passes only when all are true:

1. Every reviewed figure has a recorded caption disposition.
2. No kept or rewritten caption duplicates nearby copy or alt-text meaning.
3. Removed captions do not leave orphaned post-figure label paragraphs.
4. Known keep-body exceptions are explicitly documented with rationale.
