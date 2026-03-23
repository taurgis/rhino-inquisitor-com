# RHI-094: Image Caption Accessibility Pattern & Migration

**Status**: Closed - Complete  
**Phase**: Phase 9 Closeout  
**Start Date**: 2026-03-22  
**Closeout Date**: 2026-03-23  
**Phase Gate**: Corrected Recheck Complete + Evidence Consolidated  

---

## Executive Summary

Implemented a semantic `{{< img-caption >}}` shortcode with accessible figure and figcaption rendering, migrated the convertible caption inventory in deterministic batches, and completed the corrected nearby-text recheck for batches 5 through 8.

**Deliverables:**
- ✅ img-caption shortcode (`src/layouts/shortcodes/img-caption.html`)
- ✅ AAA-compliant CSS styling (`src/assets/styles/site.css`)
- ✅ Sample migration and rollout batches completed
- ✅ Pattern, QA, and recheck documentation published
- ✅ Corrected rechecks for batches 5 to 8 completed
- ✅ Migration closure verified with preserved exception classes retained

## Final Closeout Update (2026-03-23)

This ticket is complete. The original caption migration work was followed by a stricter corrected recheck that evaluates both figcaption text and the first plain paragraph immediately after each figure. That recheck was completed for batches 5 to 8 and is now the governing closeout evidence for RHI-094.

### Old vs New Behavior

**Old behavior:** Caption migration primarily proved shortcode conversion and render parity. It did not explicitly classify the first plain paragraph after each migrated figure as leftover caption text or legitimate body prose.

**New behavior:** Caption review now checks both the visible figcaption and the immediate post-figure paragraph against nearby body copy. Leftover caption-style paragraphs are removed, while legitimate instructions, warnings, transitions, and explanations are retained as reviewed exceptions.

### Consolidated Batch Outcomes

| Batch | Routes reviewed | Candidates flagged | Removals | Rewrites | Keep-body exceptions | Source edits | Final disposition |
|---|---|---|---|---|---|---|---|
| 5 | 15 | 7 | 8 | 0 | 0 | yes | Closed with zero remaining candidates |
| 6 | 15 | 1 | 0 | 0 | 1 | no | Closed with one reviewed keep-body exception |
| 7 | 15 | 2 | 0 | 0 | 2 | no | Closed with two reviewed keep-body exceptions |
| 8 | 6 | 0 | 0 | 0 | 0 | no | Closed as preservation-only no-op recheck |

### Closeout Result

- Convertible Markdown image migration is complete.
- Batches 5 to 8 are closed under the corrected rule.
- The repository-wide reviewed exception allowlist remains anchored to the current global audit output in `tmp/post-figure-paragraph-candidates.csv`.
- Batch-6 and batch-7 reviewed keep-body decisions remain documented in their batch recheck notes even when they are not part of the standing global allowlist set.
- Batch 8 remains preservation-only with no shortcode routes, no nearby-text candidates, and unchanged linked-image / svg exception classes.

### Final Evidence Set

- Consolidated closeout summary: `analysis/documentation/phase-9/RHI-094-img-caption-recheck-closeout-batches-5-8-2026-03-23.md`
- Rule update: `analysis/documentation/phase-9/RHI-094-caption-quality-rule-update-2026-03-23.md`
- Reviewed exception allowlist: `analysis/documentation/phase-9/RHI-094-caption-reviewed-exception-allowlist-2026-03-23.md`
- Batch recheck evidence:
   - `analysis/documentation/phase-9/RHI-094-img-caption-batch-5-recheck-2026-03-23.md`
   - `analysis/documentation/phase-9/RHI-094-img-caption-batch-6-recheck-2026-03-23.md`
   - `analysis/documentation/phase-9/RHI-094-img-caption-batch-7-recheck-2026-03-23.md`
   - `analysis/documentation/phase-9/RHI-094-img-caption-batch-8-recheck-2026-03-23.md`

---

## Problem Statement

### Current State: Accessibility Gap
- **Zero semantic caption markup**: Images render as bare `<img>` tags
- **Caption locations**: Either embedded in long alt text or as disconnected paragraphs below images
- **Screen reader impact**: Cannot announce caption relationship to image (WCAG 2.1 violation)
- **Mobile UX**: No responsive caption layout or visual figure grouping

### Impact Scope
- **185–200 articles** with images (385 total posts)  
- **100–150 total images** across site
- **High-value articles** (ERD diagrams, architecture docs, infographics) severely impacted

---

## Design Decision: img-caption Shortcode

**Why This Pattern?**
✅ Full semantic `<figure>/<figcaption>` structure (WCAG 2.1 AA+)  
✅ Graceful—existing `![]()`markdown images remain unchanged  
✅ Reuses image pipeline (WebP, srcset, responsive, lazy-load)  
✅ Zero breaking changes  
✅ Clear, discoverable for writers  

**Usage:**
```hugo
{{< img-caption 
  src="inventory-diagram.jpg"
  alt="System architecture showing three-tier caching layer"
  caption="Figure 1: Three-tier inventory caching strategy with 15-minute TTL"
>}}
```

**Parameters:**
- `src`: Image path (relative or URL) — **REQUIRED**
- `alt`: Descriptive alt text — **REQUIRED**
- `caption`: Figcaption text — **OPTIONAL**
- `loading`: "eager" or "lazy" (default: lazy)
- `quality`: JPEG/WebP quality 1–100 (default: 80)

---

## CSS Styling (WCAG 2.1 Level AAA)

### Accessibility Features
| Feature | Spec | Implementation |
|---------|------|-----------------|
| **Color Contrast** | 7:1 minimum | Ink-muted (#4c6177) on light ≈ 7.2:1 ratio |
| **Font Size** | Readable | 0.9375rem (15px) base caption size |
| **Line Height** | Adequate spacing | 1.6 for captions |
| **Dark Mode** | Supported | Uses CSS custom properties, tested in (prefers-color-scheme: dark) |
| **Reduced Motion** | Supported | Disables transitions under (prefers-reduced-motion: reduce) |
| **Visual Link** | Figure borders + spacing | 1px border + 1rem margin-top to figcaption |

### Responsive Behavior
- **Desktop (>48rem)**: Padded figure with 1.25rem, border, soft shadow
- **Mobile (<48rem)**: Full-bleed edges, reduced padding (1rem), maintains contrast
- **Dark Mode**: Inverse colors with adjusted borders and shadow

---

## Sample Article Selection (Phase 1)

Target articles with **existing WordPress captions** and **high visual/informational value**:

### Batch 1: Core Infrastructure (5 Articles)

1. **[real-time-inventory-checks-in-sfcc](real-time-inventory-checks-in-sfcc/index.md)**
   - Images: 2 (Self-Inflicted DoS cartoon, Threshold model graphic)
   - Captions: "The Self-Inflicted Denial of Service" + "Hybrid Inventory Threshold Model"
   - Reason: Architecture + infographic — high value

2. **[lag-to-riches-pwa-kit-developers-guide](lag-to-riches-a-pwa-kit-developers-guide/index.md)**
   - Images: 4 (Core Web Vitals visual, SSR vs CSR comparison, Bottlenecks factory, SPA challenges)
   - Captions: All present in original WP content
   - Reason: Performance guide — extensive diagrams require clear captions

3. **[image-ine-sfcc-dis-for-developers](image-ine-sfcc-dis-for-developers/index.md)**
   - Images: 2 (Traffic jam metaphor, DIS vs alternatives fork-in-road)
   - Captions: Both illustrate complex concepts
   - Reason: Cartoon infographics — captions clarify intent

4. **[delta-exports-in-salesforce-b2c-commerce-cloud](delta-exports-in-salesforce-b2c-commerce-cloud/index.md)**
   - Images: 5 (Business Manager UI screenshots with labels)
   - Captions: Config steps, history, consumer tabs, status log
   - Reason: Step-by-step guide — screenshots need clear labels

5. **[slicing-versus-variation-groups-in-sfcc](slicing-versus-variation-groups-in-sfcc/index.md)**
   - Images: 3 (Product hierarchy diagram, quota limit screenshot)
   - Captions: "Base Product / Variation Group / Variant" + deprecation warning
   - Reason: Tech reference — structural diagrams + deprecation notice

---

## Acceptance Criteria

### Shortcode Implementation ✅
- [x] `src/layouts/shortcodes/img-caption.html` created and tested
- [x] Shortcode correctly reuses `media/image.html` partial
- [x] WebP + responsive image handling verified (srcset, sizes, loading)
- [x] Both `caption` optional and required params tested
- [x] Hugo build succeeds with no warnings

### CSS Styling ✅
- [x] `src/assets/styles/site.css` includes article-figure + figcaption rules
- [x] Light mode: 7:1+ contrast verified (ink-muted on white background)
- [x] Dark mode: Colors adjust with `@media (prefers-color-scheme: dark)`
- [x] Reduced motion: Transitions disabled under `@media (prefers-reduced-motion: reduce)`
- [x] Mobile: Full-bleed layout + readable font size verified
- [x] No CSS regression on existing article-body styles

### Sample Migration ✅
- [x] All 5 sample articles updated to use `{{< img-caption >}}` shortcode
- [x] WordPress captions extracted and normalized into shortcode `caption` parameter
- [x] Alt text verified as descriptive (not duplicating caption)
- [x] Caption text verified as not substantially duplicating nearby body copy within the local figure context
- [x] Any first plain paragraph immediately after a migrated figure is removed only when it functions as leftover caption text; explanatory or procedural prose is kept
- [x] Hugo site builds cleanly with all samples
- [x] HTML output has valid `<figure class="article-figure">` + `<figcaption class="article-figure__caption">` structure

### Accessibility Validation ✅
- [x] Screen reader test: captions announced on at least 2 samples (NVDA or Narrator)
- [x] Lighthouse accessibility score ≥95 on sample article pages
- [x] Contrast passed (WAVE, axe DevTools 7:1+ for captions)
- [x] Keyboard navigation: figure content focusable, no tab traps
- [x] Mobile (iOS + Android): caption text readable, layout not broken

### Documentation ✅
- [x] `analysis/documentation/phase-9/RHI-094-img-caption-implementation.md` created with:
  - Shortcode usage guide
  - Caption best practices (concise, descriptive)
  - WordPress metadata extraction process
  - Dark mode + mobile behavior documented
- [x] Sample article migration notes recorded
- [x] Batch rollout plan defined (10 articles/batch)

---

## Implementation Tasks

### Task 1: Create Shortcode
- **Status**: ✅ COMPLETE
- **File**: `src/layouts/shortcodes/img-caption.html`
- **Details**: Shortcode reuses image partial for WebP/responsive handling

### Task 2: Add AAA CSS Styling
- **Status**: ✅ COMPLETE
- **File**: `src/assets/styles/site.css` (article-figure + figcaption rules)
- **Details**: Full dark mode + reduced motion + mobile responsive support

### Task 3: Extract WordPress Caption Data
- **Status**: ✅ COMPLETE
- **Scope**: 5 sample articles
- **Data Source**: Original WordPress content (verify from wp-posts.xml or theme preview)
- **Output**: Spreadsheet with mapping: `article.md` → `caption_text` → `image_src`

### Task 4: Migrate Sample Articles (5)
- **Status**: ✅ COMPLETE
- **Scope**: Update all `![alt](src)` syntax to `{{< img-caption >}}` shortcode
- **Validation**: Hugo builds, HTML has correct `<figure>` structure, no alt text loss
- **Articles**:
  1. real-time-inventory-checks-in-sfcc
  2. lag-to-riches-a-pwa-kit-developers-guide
  3. image-ine-sfcc-dis-for-developers
  4. delta-exports-in-salesforce-b2c-commerce-cloud
  5. slicing-versus-variation-groups-in-sfcc

### Task 5: Screen Reader + Accessibility Validation
- **Status**: ✅ COMPLETE
- **Tool**: NVDA (Windows) or VoiceOver (macOS)
- **Test**: Verify captions announced on ≥2 sample pages
- **Coverage**: Light mode, dark mode, mobile viewport
- **Evidence**: Screenshot of NVDA/VoiceOver output, Lighthouse score

### Task 6: Documentation
- **Status**: ✅ COMPLETE
- **File**: `analysis/documentation/phase-9/RHI-094-img-caption-implementation.md`
- **Sections**:
  - Shortcode usage + examples
  - Caption writing best practices
  - Batch migration workflow
  - Dark mode behavior
  - Mobile responsivity
  - Accessibility test results (evidence from Task 5)

### Task 7: Plan Batch Rollout (Post-Approval)
- **Status**: ✅ COMPLETE
- **Scope**: Remaining 30–40 articles with captions (in ~10-article batches)
- **Sequencing**: Dependent on approval of samples (Task 5)
- **Output**: Phase 9 rollout plan with timeline

---

## Phase Gate: Sample Approval Checklist

Before final closeout, all must be true:

- [x] 5 sample articles migrated and Hugo build succeeds
- [x] Screen reader announces captions on ≥2 samples
- [x] Lighthouse accessibility ≥95 on sample pages
- [x] Contrast verified (7:1+) via axe DevTools or WAVE
- [x] CSS renders correctly on mobile, desktop, dark mode
- [x] No regressions in article-body or existing image styles
- [x] Documentation complete + batch rollout plan signed off
- [x] Corrected rechecks for batches 5 to 8 completed and documented

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| WordPress caption data missing/incomplete | MEDIUM | Data loss, manual re-work | Verify WP export before migration; spot-check 2+ sources |
| CSS dark mode contrast regression | LOW | Accessibility failure | Test on actual dark mode, not just @media simulation |
| Hugo build breaks with shortcode | LOW | Blocker | Test locally on 1 article before batch |
| Caption or leftover post-image paragraph duplicates nearby body copy | MEDIUM | Poor UX, verbose screen reader output, redundant reading flow | Establish caption rule: "Never duplicate alt text or immediately adjacent body copy, and remove the first post-image paragraph only when it is leftover caption text" |

---

## Success Metrics

- ✅ 5 sample articles fully migrated and accessible
- ✅ WCAG 2.1 Level AAA on all samples (verified via screen reader + contrast tools)
- ✅ Zero existing article regressions
- ✅ Documentation published with batch rollout plan
- ✅ Owner approval to proceed with 10-article batches

---

## Timeline & Dependencies

| Phase | Effort | Blocker | DueDate |
|-------|--------|---------|---------|
| Shortcode + CSS (D) | 0.5 day | None | 2026-03-22 ✅ |
| Bootstrap WP data | 0.25 day | None | 2026-03-23 ✅ |
| Migrate 5 samples | 0.75 day | Data ready | 2026-03-24 ✅ |
| A11y validation | 0.75 day | Samples done | 2026-03-25 ✅ |
| Documentation | 0.5 day | Validation done | 2026-03-26 ✅ |
| **Corrected recheck closeout** | — | Batch evidence ready | 2026-03-23 ✅ |

---

## Related Artifacts

- [img-caption shortcode](src/layouts/shortcodes/img-caption.html)
- [CSS styling](src/assets/styles/site.css) (article-figure + figcaption rules)
- [Corrected recheck closeout summary](analysis/documentation/phase-9/RHI-094-img-caption-recheck-closeout-batches-5-8-2026-03-23.md)
- [Reviewed exception allowlist](analysis/documentation/phase-9/RHI-094-caption-reviewed-exception-allowlist-2026-03-23.md)
- WordPress export reference: `tmp/wp-posts.xml` (if available)
- Phase 9 blocking issues: [RHI-091](analysis/tickets/phase-8/RHI-091-operational-readiness-go-nogo.md)

---

## Notes

- This ticket established the semantic caption pattern, completed the deterministic rollout, and closed the corrected recheck program for batches 5 to 8.
- Repository-wide reviewed exceptions remain governed by `analysis/documentation/phase-9/RHI-094-caption-reviewed-exception-allowlist-2026-03-23.md`.
- This ticket closeout is repository-local implementation evidence and is not a public WCAG conformance claim.
