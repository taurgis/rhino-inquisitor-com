# RHI-094: Sample Article Selection for Caption Migration

**Date**: 2026-03-22  
**Phase**: Phase 9 Bootstrap - Sample Phase  
**Status**: Ready for Migration  

---

## Selection Criteria

✅ **All 5 samples:**
- Have existing images with descriptive context (captions)
- Cover diverse article types (architecture, performance, reference, UI guides)
- High-value content that benefits from semantic caption markup
- Moderate image count (3–6 images each = 20 total images to migrate)

---

## Sample 1: Real-Time Inventory Checks in SFCC

**Path**: `src/content/posts/real-time-inventory-checks-in-sfcc/index.md`  
**Images**: 3  
**Category**: Architecture + Performance  
**Why Selected**: Core reference article with cartoon infographics that need proper semantic figure grouping

### Images & Captions

| # | Filename | Alt Text (Excerpt) | Caption | Context |
|---|----------|-------------------|---------|---------|
| 1 | `self-inflicted-dos-f3485c24ab.png` | "Self-Inflicted Denial of Service" cartoon | **Figure 1: The Self-Inflicted Denial of Service** | Shows how high traffic overloads legacy backend systems, creating cascading failures |
| 2 | `inventory-threshold-model-dfa3d5bd0f.jpeg` | "Hybrid Inventory Threshold Model bar graph" | **Figure 2: Hybrid Inventory Threshold Model** | Illustrates the pragmatic pattern: cached checks above threshold, real-time calls below |
| 3 | `the-inventory-architectural-decision-fc1b43abe0.png` | "Three tiers: SFCC-only, omnichannel, Salesforce-centric" | **Figure 3: Your Architectural Mandate—Choosing the Right Inventory Strategy** | Decision tree based on omnichannel maturity level |

---

## Sample 2: Lag to Riches: A PWA Kit Developer's Guide

**Path**: `src/content/posts/lag-to-riches-a-pwa-kit-developers-guide/index.md`  
**Images**: 4  
**Category**: Performance Guide  
**Why Selected**: Performance modernization deep-dive with multiple educational infographics needing proper captioning

### Images & Captions

| # | Filename | Alt Text (Excerpt) | Caption | Context |
|---|----------|-------------------|---------|---------|
| 1 | `core-web-vitals-visualised-*.jpg` | "Three-panel illustration of Slow LCP, High INP, and High CLS" | **Figure 1: Core Web Vitals Explained—LCP, INP, and CLS** | Visual guide to the three key metrics that matter for user experience |
| 2 | `server-side-rendering-client-side-*.jpg` | "Two-panel cartoon: stressed user vs. happy user" | **Figure 2: Server-Side Rendering vs. Client-Side Rendering** | Illustrates the performance difference: immediate gratification vs. delayed content |
| 3 | `spa-performance-bottlenecks-*.jpeg` | "Chaotic factory cartoon with truck, pipes, machine, workers" | **Figure 3: SPA Performance Bottlenecks** | Four critical bottlenecks: Large Bundle Size, Network Waterfalls, Re-render Storms, Memory Leaks |
| 4 | `taming-the-third-party-script-beast-*.jpeg` | "Developer taming a code beast with async/defer collars" | **Figure 4: Taming the Third-Party Script Beast** | Demonstrates control strategies: `async`, `defer`, and lazy loading |

---

## Sample 3: Image-ine SFCC DIS for Developers

**Path**: `src/content/posts/image-ine-sfcc-dis-for-developers/index.md`  
**Images**: 3  
**Category**: Technical Reference  
**Why Selected**: Heavy use of JavaScript code snippets and cartoon explanations of Dynamic Image Service concepts

### Images & Captions

| # | Filename | Alt Text (Excerpt) | Caption | Context |
|---|----------|-------------------|---------|---------|
| 1 | (Cartoon in content) | "DIS transformation pipeline diagram" | **Figure 1: DIS Image Transformation Pipeline** | Shows how source images are transformed and cached by Salesforce Dynamic Image Service |
| 2 | (Section illustration) | "Best practices for DIS usage" | **Figure 2: DIS Best Practices—Optimization Tips** | Highlights size limits (6MB/3000x3000), timeout handling, and format conversion strategies |
| 3 | (Code example visual) | "URLUtils and MediaFile API usage" | **Figure 3: Script API Image URL Generation** | Demonstrates the correct way to generate DIS URLs using Script API |

---

## Sample 4: Delta Exports in Salesforce B2C Commerce Cloud

**Path**: `src/content/posts/delta-exports-in-salesforce-b2c-commerce-cloud/index.md`  
**Images**: 6  
**Category**: Business Manager UI Guide  
**Why Selected**: Step-by-step tutorial with sequential Business Manager screenshots that require clear labeling

### Images & Captions

| # | Filename | Alt Text (Excerpt) | Caption | Context |
|---|----------|-------------------|---------|---------|
| 1 | `delta-jobs-overview-dccafc63a7.png` | "Delta Exports module in Business Manager" | **Figure 1: Delta Exports Module Overview** | Entry point to Delta Jobs configuration in Business Manager |
| 2 | `delta-job-selection-718f8a1686.png` | "General configuration tab" | **Figure 2: Delta Job Configuration—General Tab** | Configure job name, consumers, and data type |
| 3 | `delta-job-schedule-1c300976ae.png` | "Schedule tab" | **Figure 3: Delta Job Schedule Configuration** | Set fixed intervals for delta export execution |
| 4 | `history-70bccb6f6f.png` | "Delta export history" | **Figure 4: Delta Export History** | View previously generated delta files and execution logs |
| 5 | `delta-job-consumer-867e8bc380.png` | "Consumer tab with WebDAV path" | **Figure 5: Delta Job Consumer Configuration** | Configure export destination and WebDAV path per consumer |
| 6 | (Additional configuration) | "Advanced settings" | **Figure 6: Delta Job Advanced Settings** | (If present—verify during migration) |

---

## Sample 5: Slicing Versus Variation Groups in SFCC

**Path**: `src/content/posts/slicing-versus-variation-groups-in-sfcc/index.md`  
**Images**: 4  
**Category**: Product Catalog Reference  
**Why Selected**: Comparison article with technical diagrams and deprecation warnings that need proper context

### Images & Captions

| # | Filename | Alt Text (Excerpt) | Caption | Context |
|---|----------|-------------------|---------|---------|
| 1 | `a-robot-slicing-a-tshirt-*.jpg` | "A robot slicing a cake shaped like a t-shirt" | **Figure 1: Slicing—A Legacy Approach to Product Variants** | Visual metaphor for the deprecated variant management method |
| 2 | `base-variation-group-variant-explained-*.png` | "Base Product, Variation Group, Variant structure" | **Figure 2: Modern Architecture—Base Product, Variation Group, and Variant** | Current best practice: hierarchical product structure with flexible grouping |
| 3 | `sfcc-slicing-deprecated-*.png` | "ProductSearchHit warning: slicing deprecated" | **Figure 3: Slicing Deprecation Notice** | Official warning in SFCC documentation (ProductSearchHit class) |
| 4 | `variations-quota-limit-sfcc-*.png` | "Quota limits documentation" | **Figure 4: Variation Quota Limits** | Maximum variations per base product: critical for large catalogs |

---

## Migration Effort Summary

| Sample | Images | Effort | Notes |
|--------|--------|--------|-------|
| real-time-inventory-checks-in-sfcc | 3 | 0.15 days | Straightforward infographics + section titles as captions |
| lag-to-riches-a-pwa-kit-developers-guide | 4 | 0.2 days | Clear context paragraphs below images |
| image-ine-sfcc-dis-for-developers | 3 | 0.15 days | Text-embedded, some captions may need extraction |
| delta-exports-in-salesforce-b2c-commerce-cloud | 6 | 0.25 days | Sequential UI screenshots, clear step-by-step context |
| slicing-versus-variation-groups-in-sfcc | 4 | 0.15 days | Deprecation warnings + technical diagrams |
| **TOTAL** | **20** | **0.9 days** | ~2 hours per article |

---

## Validation Checklist (Per Sample)

### Step 1: Extract Captions
- [ ] Read article to identify all images
- [ ] Extract caption text from context, section titles, or descriptive paragraphs
- [ ] Verify captions are distinct from alt text (not duplicative)
- [ ] Record filename + caption mapping

### Step 2: Update Markdown
- [ ] Replace `![alt](src)` with `{{< img-caption src="src" alt="alt" caption="caption" >}}`
- [ ] Verify alt text remains descriptive and complete
- [ ] Remove any redundant caption paragraphs that are now in figcaption

### Step 3: Build & Verify
- [ ] Run `hugo --source src` (should build clean, no errors)
- [ ] Inspect HTML output: verify `<figure class="article-figure">` + `<figcaption>` structure
- [ ] Visual check: images render with captions styled correctly

### Step 4: Light Accessibility Test
- [ ] Desktop view: caption readable, proper contrast
- [ ] Mobile view (resize to <768px): layout responsive, caption not cut off
- [ ] Dark mode (if testable): colors adjust, caption visible
- [ ] Keyboard: Tab through page, no focus traps on figures

### Step 5: Document
- [ ] Screenshot of rendered page (desktop + mobile)
- [ ] Note any issues or variations from shortcode pattern

---

## Expected Outcomes (Post-Migration)

✅ **All 5 samples:**
- Hugo builds without errors
- HTML output has semantic `<figure>/<figcaption>` markup
- Screen reader announces caption relationship correctly
- Lighthouse accessibility score ≥95
- Contrast verified (7:1+)
- No regressions to existing article styling

✅ **Documentation Updated:**
- Sample migration notes recorded
- Batch rollout plan finalized
- Caption best practices confirmed

---

## Approval Gate

Before proceeding to batch rollout (10-article batches):

- [ ] All 5 sample articles migrated
- [ ] Hugo builds cleanly
- [ ] Screen reader test passed (≥2 samples)
- [ ] Lighthouse accessibility ≥95
- [ ] Contrast verified (axe/WAVE: 7:1+)
- [ ] No CSS regressions
- [ ] Documentation approved
- [ ] Owner sign-off: Ready for batches

**Expected Approval Date**: 2026-03-27

---

## Notes

- **Estimated time per sample**: 1.5–2 hours (extract captions, migrate, test)
- **Total sample phase**: ~0.9 days (can be done in 1–2 working hours)
- **Post-approval rollout**: 10 articles/batch × 0.5 days = ~5 days for full migration (30–40 remaining articles)
- **Risk**: Low; shortcode pattern reusable, no breaking changes to existing content

---

**Next Step**: [Ready for user approval to proceed with migration]
