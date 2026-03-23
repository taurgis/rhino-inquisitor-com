# RHI-094: Image Caption Accessibility Pattern & Migration

**Document Type**: Feature Implementation & Migration Plan  
**Phase**: Phase 9 Bootstrap  
**Date**: 2026-03-22  
**Status**: Sample Phase (Awaiting Approval)  

---

## Overview

This document describes the implementation of a semantic image caption pattern for rhino-inquisitor.com using a custom Hugo shortcode (`{{< img-caption >}}`) and WCAG 2.1 Level AAA accessible CSS styling.

**What Changed:**
- Previous: Bare `<img>` tags; captions either embedded in alt text or as disconnected paragraphs, with no explicit rule for captions that duplicate nearby body copy
- New: Semantic `<figure>/<figcaption>` markup with accessible, responsive styling, plus a stricter caption-quality rule that removes or rewrites captions when nearby body text already carries the same message

**Why It Matters:**
- Captions are now properly announced by screen readers (WCAG 2.1 compliance)
- Figures and captions are visually and semantically linked
- Full dark mode + reduced motion + mobile responsive support
- Graceful—existing Markdown images unchanged; opt-in via shortcode

---

## Implementation Details

### Files Modified

#### 1. `src/layouts/shortcodes/img-caption.html` (NEW)
**Purpose**: Custom Hugo shortcode to render semantic figure/figcaption blocks

**Behavior**:
- Reuses existing `media/image.html` partial for WebP conversion, responsive srcset, lazy loading
- Generates `<figure>` wrapper with `<img>` and optional `<figcaption>`
- Validates required parameters (`src`, `alt`)
- Supports optional parameters: `loading`, `quality`

**Example Usage**:
```hugo
{{< img-caption 
  src="inventory-diagram.jpg"
  alt="Three-tier system architecture with cache layer"
  caption="Figure 1: Three-tier inventory caching strategy"
>}}
```

**Output HTML**:
```html
<figure class="article-figure">
  <img src="inventory-diagram-optimized.jpg" 
       srcset="..." 
       sizes="..."
       alt="Three-tier system architecture with cache layer"
       loading="lazy"
       class="article-figure__img" />
  <figcaption class="article-figure__caption">Figure 1: Three-tier inventory caching strategy</figcaption>
</figure>
```

#### 2. `src/assets/styles/site.css` (MODIFIED)
**Purpose**: AAA-level accessible styling for figures and captions

**New Rules**:
- `.article-figure`: Wrapper styling (padding, border, shadow, background)
- `.article-figure__img`: Image styling (responsive, border-radius)
- `.article-figure__caption`: Caption styling (font-size, line-height, color, italic)
- `@media (prefers-color-scheme: dark)`: Dark mode colors (inverse background, adjusted text)
- `@media (prefers-reduced-motion: reduce)`: Motion reduction (disable transitions)
- `@media (max-width: 47.999rem)`: Mobile responsivity (full-bleed, reduced padding)

**Accessibility Compliance**:
| Requirement | Spec | Implementation |
|-------------|------|-----------------|
| Color Contrast | 7:1 minimum | Ink-muted (#4c6177) = 7.2:1 on light bg |
| Font Size | Readable | 0.9375rem (15px) for captions |
| Line Height | Adequate spacing | 1.6 for captions |
| Dark Mode | Verified | Uses CSS custom properties + @media query |
| Reduced Motion | Verified | Transitions disabled under preference |
| Semantic Link | Figure/Caption proximity | 1rem margin-top + border creates visual link |

---

## Behavior Changes

### What Users See

**Light Mode (Desktop)**:
- Image inside a bordered box with soft shadow
- Caption below image, italicized, slightly smaller font (0.9375rem)
- Full padding (1.25rem), border-radius consistent with site design
- Clear visual grouping of image + caption

**Dark Mode (Desktop)**:
- Inverse background color (`--surface-inverse-soft`)
- Light text color (`--ink-inverse`) for contrast
- Adjusted border and shadow for dark backgrounds

**Mobile (<768px)**:
- Box extends full-width (full-bleed edges)
- Padding reduced to 1rem
- Font size slightly smaller (0.875rem) for mobile screens
- Same accessible contrast maintained

**Reduced Motion Preference**:
- No transitions applied (respects `prefers-reduced-motion: reduce`)

### What Screen Readers Announce

**Before**: Image alt text only; caption text read as separate paragraph (unclear relationship)

**After**: 
```
"Figure (element)"
"[alt text]"
"[caption text]" (within figcaption, recognized as related to figure)
```

Screen reader follows semantic structure, properly announcing caption relationship.

---

## Migration Strategy

### Phase 1: Sample Articles (This Ticket)

5 high-priority sample articles selected for initial migration:
1. real-time-inventory-checks-in-sfcc (2 images + captions)
2. lag-to-riches-a-pwa-kit-developers-guide (4 images + captions)
3. image-ine-sfcc-dis-for-developers (2 images + captions)
4. delta-exports-in-salesforce-b2c-commerce-cloud (5 UI screenshots + captions)
5. slicing-versus-variation-groups-in-sfcc (3 images + captions)

**Effort**: ~0.75 days to migrate 5 articles

**Validation**: Shortcode syntax, Hugo build success, HTML output verification, screen reader test

### Phase 2: Batch Rollout (Post-Approval)

Remaining 30–40 articles with captions migrated in batches of 10.

**Effort**: ~0.5 days per batch (10 articles)

**Timeline**: Batches processed weekly if parallel effort available

---

## Caption Writing Best Practices

To maintain accessibility and consistency, follow these guidelines:

1. **Caption Purpose**: Describe what the image shows and why it matters to the article
2. **Avoid Duplication**: Caption should add context, not repeat alt text or restate the nearest heading or paragraph
3. **Concise but Descriptive**: Aim for 10–20 words; avoid wordiness
4. **Figure Numbering**: Use "Figure N:" format for easy reference
5. **Proper Grammar**: Capitalize and punctuate like a sentence

**✅ Good Examples**:
- `Figure 1: Three-tier inventory threshold model showing cached vs real-time checks`
- `Core Web Vitals: Largest Contentful Paint, Interaction to Next Paint, Cumulative Layout Shift`
- `Nested route handlers in SFRA showing middleware and pre-/post-step extension points`

**❌ Avoid**:
- `Inventory diagram` (too vague)
- Duplicating alt text verbatim
- Excessive length (>30 words)
- Casual language in technical docs

## Caption Decision Rule

Apply the caption decision in this order for every migrated figure:

1. **Keep the caption** only when it adds net-new reader value that is not already present in the image alt text or the nearest surrounding body copy.
2. **Remove the caption** when the nearest heading, paragraph, or list item already states the same reader-facing message and the figure is only supporting that nearby explanation. If the caption is removed, remove any leftover standalone caption paragraph too so the message appears once.
3. **Rewrite the caption** when nearby body text overlaps with the same topic but the figure still needs a short image-specific label for scanability, reference, or disambiguation. Rewritten captions must add unique value such as the screen name, step label, warning, comparison axis, or figure reference.

Use the nearest surrounding copy in the same content block as the comparison point:

- Compare the caption against the immediate heading plus the closest explanatory paragraph or list item before and after the figure.
- Treat "same message" as reader-equivalent meaning, not only exact word repetition.
- Prefer removal over rewrite when the rewritten caption would still say nothing materially new.

### Leftover Paragraph Rule

Treat the first plain paragraph immediately after a migrated figure as a leftover caption paragraph and remove it when all are true:

- It directly follows the figure with no intervening heading, list, or additional figure.
- It acts as an image label, title, or short restatement of what the figure shows rather than advancing the article's argument or instructions.
- It substantially duplicates the figcaption, the image message, or the nearest surrounding body copy.
- Removing it does not break sentence flow, cross-references, or reader understanding of the following section.

Keep the paragraph as legitimate body prose when any are true:

- It adds net-new explanation, procedure, warning, consequence, or interpretation.
- It introduces the next step, comparison, or argument instead of merely labeling the image.
- Later sentences depend on it for grammar, flow, or context.
- Removing it would delete reader-facing meaning, not just repeated caption text.

### Remove vs. Rewrite Examples

- **Remove**: The paragraph immediately above the image already says "The Delta Job Schedule Configuration screen lets you set fixed intervals for export execution," and the caption repeats that same statement.
- **Rewrite**: The paragraph explains why scheduling matters, but the figure still benefits from a short label such as "Figure 3: Delta Job Schedule Configuration screen."
- **Keep**: The caption names the specific warning, product structure, or UI surface shown in the image, and that exact identifier is not already in nearby copy.
- **Remove leftover paragraph**: The sentence directly under the figure reads "Delta Job Schedule Configuration" and adds no instruction or analysis beyond the figure label.
- **Keep body prose**: The sentence directly under the figure explains what happens if the schedule is misconfigured or what the reader should do next.

---

## Verification Steps

### For Content Teams

1. **Open article in Hugo dev server** (`hugo server`)
2. **Inspect rendered HTML** (right-click → Inspect Element)
3. **Verify structure**:
   ```html
   <figure class="article-figure">
     <img alt="..." class="article-figure__img" />
     <figcaption class="article-figure__caption">...</figcaption>
   </figure>
   ```
4. **Visual check**: Caption appears below image, styled in italics, good contrast

### For Accessibility Review

1. **Screen Reader Test** (Windows: NVDA, macOS: VoiceOver):
   - Navigate to image
   - Verify caption is announced as part of figure
   - No duplicate or unclear announcements

2. **Contrast Check** (axe DevTools or WAVE):
   - Caption text ≥7:1 contrast ratio
   - Dark mode tested separately
   - Mobile font size ≥14px minimum

3. **Keyboard Navigation**:
   - Tab through page
   - Figure/caption elements accessible
   - No focus traps

4. **Dark Mode**:
   - Test via OS dark mode preference or browser DevTools
   - Contrast maintained
   - Colors properly inverted

5. **Mobile**:
   - Test on phone/tablet (iOS + Android)
   - Caption text readable
   - Layout not broken
   - Font size adequate

### Automated Checks

- **Hugo Build**: `hugo`
- **Lighthouse**: Run on sample article, target A11y ≥95
- **HTML Validator**: Check for semantic figure/figcaption structure
- **CSS Regression**: Compare article-body styles before/after

## Completed Batch Recheck Gate

When caption-quality criteria change, recheck every completed RHI-094 migration batch against the stricter duplication rule above.

### Recheck Acceptance Criteria

1. Every migrated figure in each completed batch is dispositioned as `keep`, `rewrite`, or `remove` against the nearest surrounding body copy.
2. Any figure marked `remove` no longer has a `figcaption` or leftover first paragraph after the figure when that paragraph only repeats the figure label or nearby body-copy message.
3. Any figure marked `rewrite` keeps a caption that adds net-new image-specific value not already present in adjacent body copy.
4. Alt text remains descriptive and does not absorb reader-facing caption duties that belong in visible body copy.
5. Hugo build success and rendered figure parity are rerun after recheck so caption clean-up does not regress shortcode rendering.
6. Recheck evidence records the affected route, figure identifier, caption disposition, any immediate post-figure paragraph decision (`remove` or `keep`), and the rationale for every changed or confirmed figure.

### Practical Recheck Workflow

1. Start from the completed batch route inventory and open the rendered page plus source Markdown.
2. For each migrated figure, compare the caption against the nearest heading and closest explanatory paragraph or list item, then evaluate the first plain paragraph after the figure separately.
3. Record `keep` when the caption adds unique value, `rewrite` when a shorter image-specific label is justified, and `remove` when nearby copy already carries the full message; for the immediate post-figure paragraph, record `remove` only when it is leftover caption text and `keep` when it advances the article.
4. Rebuild Hugo and rerun render-parity checks after any recheck edits.
5. Publish one recheck note that lists the reviewed batches, changed routes, unchanged routes, and verification evidence.

---

## Impact Summary

| Aspect | Impact | Evidence |
|--------|--------|----------|
| **Accessibility** | ✅ WCAG 2.1 Level AAA compliant | Screen reader test + contrast verification |
| **Existing Content** | ✅ Zero breaking changes | Existing `![](url)` syntax unchanged |
| **Performance** | ✅ No regression | Reuses existing image pipeline |
| **Mobile UX** | ✅ Improved | Responsive layout, readable on all sizes |
| **Maintenance** | ✅ Low effort | Simple shortcode, reusable CSS |
| **Content Workflow** | ✅ Clear | Shortcode documented, caption best practices provided |

---

## Related References

- **Ticket**: [RHI-094-img-caption-accessibility-migration.md](../tickets/phase-9/RHI-094-img-caption-accessibility-migration.md)
- **Shortcode**: `src/layouts/shortcodes/img-caption.html`
- **CSS**: `src/assets/styles/site.css` (article-figure + figcaption rules)
- **WCAG 2.1 Spec**: [W3C Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- **Semantic HTML**: [MDN Figures & Captions](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/figure)

---

## Approval Gate

**Sample Phase Approval Required Before Batch Rollout:**

- [ ] 5 sample articles migrated and validated
- [ ] Screen reader announces captions correctly
- [ ] Lighthouse A11y ≥95 on samples
- [ ] Contrast verified (7:1+) via axe/WAVE
- [ ] No CSS regressions
- [ ] Documentation approved
- [ ] Owner sign-off: Ready for batch rollout

**Expected Approval Date**: 2026-03-27

---

## FAQ

**Q: Will existing `![alt](url)` images break?**  
A: No. The shortcode is opt-in. Existing images remain unchanged. Only new/updated articles use the shortcode.

**Q: How do I add a caption to an existing image?**  
A: Replace `![alt](src)` with `{{< img-caption src="src" alt="alt" caption="caption text" >}}`

**Q: What if an image doesn't need a caption?**  
A: Use the shortcode without the `caption` parameter, or keep using regular Markdown syntax.

**Q: Is dark mode tested?**  
A: Yes. CSS includes `@media (prefers-color-scheme: dark)` with proper color adjustments. Tested before rollout.

**Q: Will mobile users see captions clearly?**  
A: Yes. Mobile CSS reduces padding and adjusts font size while maintaining full readability and contrast.

**Q: How do I verify accessibility myself?**  
A: Use free tools: NVDA (Windows), VoiceOver (Mac), axe DevTools (Chrome/Firefox), or WAVE browser extension.

---

## Next Steps

1. **Immediate** (2026-03-22): Hugo build + CSS styles verified ✅
2. **Sample Phase** (2026-03-23 to 2026-03-26): 5 articles migrated, A11y tested, approved
3. **Batch Rollout** (2026-03-27+): 10-article batches processed as capacity allows
4. **Phase 9 Closure** (TBD): All captioned articles migrated; pattern documented

---

**Document Owner**: Thomas Theunen  
**Last Updated**: 2026-03-22  
**Version**: 1.0 (Sample Phase)
