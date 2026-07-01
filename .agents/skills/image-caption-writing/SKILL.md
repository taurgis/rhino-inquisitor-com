---
name: image-caption-writing
description: 'Guidance for writing, rewriting, or removing image captions using the RHI-094 cleanup standards. Use when reviewing img-caption shortcode content, figure captions, and nearby post-figure paragraphs for redundancy and reader value.'
argument-hint: 'Provide article routes, caption candidates, or img-caption snippets to review.'
user-invocable: true
license: Forward Proprietary
compatibility: 'Hugo content in src/content/posts/** and img-caption shortcode workflows'
---

# Image Caption Writing

Use this skill to decide whether an image should keep a visible caption, rewrite it, or remove it. The goal is reader value: captions should add unique image-specific meaning, not repeat surrounding copy.

## When to Use This Skill

- Reviewing or writing `caption="..."` text for `{{< img-caption >}}` shortcodes
- Cleaning caption text that may duplicate nearby body copy
- Auditing first plain paragraphs after figures for leftover caption-style text
- Creating quality checks for caption consistency in content review
- **Not for:** image conversion mechanics, shortcode rendering bugs, Hugo template styling changes, or always-on repository coding standards

## Quick Start

1. Evaluate the candidate caption against alt text plus the nearest heading, paragraph, or list item.
2. Classify the caption as `keep`, `rewrite`, or `remove` using the core decision rule.
3. Review the first plain post-figure paragraph independently.
4. Record a one-line reason describing net-new reader value or redundancy.
5. If uncertain, prefer `remove` unless a concrete image-specific benefit is evident.

## Core Decision Rule

Evaluate each image in this order:

1. Compare the caption candidate against nearby heading and nearest explanatory paragraph/list item.
2. Remove the caption if nearby copy already communicates the same reader-facing message.
3. Rewrite the caption if a short image-specific label is still useful for scanability or disambiguation.
4. Keep the caption only when it adds net-new visible value not present in alt text or nearby copy.

## Good and Bad Caption Rules

### Good caption traits

- Names a specific UI element, warning, state, or comparison axis shown in the image
- Adds concise context that helps readers identify or reference the image quickly
- Is short and purposeful (usually one phrase or a short sentence)
- Distinguishes this image from adjacent screenshots in the same section

### Bad caption traits

- Duplicates alt text with the same meaning
- Restates the section heading or nearby paragraph without adding new value
- Uses low-value labels only (`Figure X`, raw URL, generic screenshot label)
- Repeats a post-figure paragraph that already explains the same point

## Post-Figure Paragraph Rule

After deciding caption disposition, evaluate the first plain paragraph immediately after the figure.

Remove that paragraph when all are true:

- It directly follows the figure with no structural break
- It acts only as a figure label or short restatement
- It duplicates the figure message or nearby copy
- Removing it does not break narrative flow

Keep that paragraph when any are true:

- It adds new instruction, warning, interpretation, or next-step context
- Later sentences depend on it
- It starts the next argument instead of labeling the figure

## Audit-Learned Edge Cases

- Keep a figure-number style caption only when body copy explicitly references that figure number.
- Remove raw URL captions unless the URL itself is the subject being explained.
- For image sequences, keep short differentiating captions rather than repeating generic labels.
- Preserve reviewed keep-body exceptions when the paragraph is clearly instructional or transitional prose.
- If adjacent prose and caption compete, keep the stronger prose and remove the weaker caption.

## Quick Rubric

| Condition | Action |
|----------|--------|
| Caption is empty after trimming/placeholder cleanup | Remove caption |
| Caption duplicates alt text meaning | Remove caption |
| Caption duplicates nearby copy meaning | Remove caption |
| Topic overlaps nearby copy but image needs a specific label | Rewrite caption |
| Caption adds unique, image-specific reader value | Keep caption |

See the full rubric and examples in [Caption Rubric](references/CAPTION-RUBRIC.md).

## Examples

### Example: remove

- Section heading: `Setting up inventory lists`
- Nearby paragraph: explains that the screenshot shows inventory list setup
- Caption candidate: `Setting up inventory lists`
- Decision: remove (no new reader value)

### Example: rewrite

- Nearby paragraph: explains inventory synchronization generally
- Caption candidate: `Inventory synchronization settings`
- Improved caption: `Omnichannel Inventory toggle state before activation`
- Decision: rewrite (adds image-specific identifier)

### Example: keep

- Nearby paragraph: discusses API error handling generally
- Caption: `HTTP client warning banner: stale cache detected`
- Decision: keep (specific visual state not stated nearby)

## Verification Checklist

- [ ] Caption decision logged as `keep`, `rewrite`, or `remove`
- [ ] Reason states what net-new value the caption provides (or why it does not)
- [ ] First post-figure paragraph reviewed separately
- [ ] No duplicate meaning across caption, alt text, and nearby body copy
- [ ] No low-value labels remain when they are not referenced or disambiguating

## References

- [Caption Rubric](references/CAPTION-RUBRIC.md)
- [VS Code Agent Skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
- [VS Code customization concepts](https://code.visualstudio.com/docs/copilot/concepts/customization)
- [Agent Skills specification](https://agentskills.io/specification)
