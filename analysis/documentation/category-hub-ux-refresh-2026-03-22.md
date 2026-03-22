# Category Hub UX Refresh — 2026-03-22

## Overview
Refresh of the `/category/` topic hub item list to improve visual hierarchy, spacing, interaction feedback, and information density. Aligned with archive redesign patterns for consistency across the site.

## Objective
Eliminate compression, improve visual hierarchy, and create a premium card experience that matches archive page modernization direction.

---

## What Changed

### 1. Grid Layout Enhancement
- **Mobile-first**: Changed grid-template-columns from `minmax(13rem, 1fr)` to `minmax(18rem, 1fr)` with increased gap to `1.25rem`
- **Desktop breakpoint (≥48rem)**: Upgraded to `minmax(20rem, 1fr)` with `1.5rem` gap for better breathing room
- **Outcome**: Cards now have more visual weight and better information hierarchy without cramping

### 2. Card Spacing & Padding
- **Card padding**: Increased from `1rem` to `1.5rem` (mobile), `1.75rem` (desktop)
- **Internal gap**: Refined from `1rem` to `0.85rem` (mobile), `0.95rem` (desktop) for tighter vertical rhythm
- **Outcome**: Better content hierarchy and visual balance

### 3. Card Elevation & Hover Effects
- **Base shadow** (desktop): Added subtle `0 1px 3px rgba(8, 20, 35, 0.04)` for depth
- **Hover/focus shadow**: Elevated to `0 12px 28px rgba(8, 20, 35, 0.08)` with `translateY(-2px)` lift
- **Transition**: Smooth 0.15s ease on transform, shadow, and border-color
- **Outcome**: Interactive feedback and premium card feel matching article-card pattern

### 4. Typography Hierarchy
- **Heading weight**: Enforced `font-weight: 700` for category names
- **Heading size**: Mobile base remains `1.1rem`, desktop upgraded to `1.2rem`
- **Heading link color**: Strong ink on default, accent-strong on hover/focus with underline
- **Stats font size**: Refined from `1rem` to `0.9rem` with `--ink-muted` color to reduce visual weight
- **Outcome**: Clear visual hierarchy with stronger category name prominence

### 5. Card Border Treatment
- Maintained `1px solid var(--surface-border)` for consistency with archive rail styling
- Replaced heavy outward box-shadows with subtle edge definition
- Outcome: Cleaner visual structure without visual clutter

---

## Behavior Details (Old vs New)

| Aspect | Old | New |
|--------|-----|-----|
| **Grid min-width** | 13rem (compact, crowded) | 18–20rem (spacious, readable) |
| **Card padding** | 1rem | 1.5–1.75rem |
| **Gap** | 1rem | 1.25–1.5rem |
| **Hover state** | None | Lift + shadow elevation |
| **Typography** | Body text weight | Bold (700) with size hierarchy |
| **Stats color** | `--ink-default` | `--ink-muted` (lighter, secondary) |
| **Desktop shadow** | None | `0 1px 3px` base, `0 12px 28px` on hover |

---

## Impact and Verification

### Affected Components
- `/category/` landing page topic hub grid (`.topic-hub-grid`)
- Topic card component (`.topic-card`, `.topic-card__body`, `.topic-card h3`, `.topic-card__stats`)
- Mobile (`<48rem`) and desktop (`≥48rem`) responsive behavior

### Verification Steps

1. **Desktop Visual Pass (1440px, 1920px)**
   - Load `http://localhost:1313/category/`
   - Confirm: Topic cards are wider (18–20rem min), spacing is visible
   - Confirm: Cards have subtle shadow at rest, lift on hover
   - Confirm: Category names are bold and prominent
   - Confirm: Entry count text is lighter (muted) and secondary

2. **Tablet Pass (768px–1024px)**
   - Resize to 768px width
   - Confirm: Grid switches to `minmax(18rem, 1fr)` with 1.25rem gap
   - Confirm: Cards remain readable, no overflow

3. **Mobile Pass (<768px)**
   - Test narrow viewport (375px)
   - Confirm: Single-column fallback, cards remain legible
   - Confirm: Padding scales appropriately

4. **Interaction Pass**
   - Hover over category cards
   - Confirm: Smooth lift with shadow expansion (no jank)
   - Confirm: Focus-visible state on keyboard navigation
   - Confirm: Hover link color and underline work

5. **Performance Check**
   - Run Lighthouse on `/category/` after deployment
   - Confirm: No performance regression (animations smooth, <16ms frame time)
   - Confirm: Accessibility score ≥ 95 (no contrast or focus regressions)

---

## Related Files Touched

- [src/assets/styles/site.css](src/assets/styles/site.css) — Grid, card, elevation, spacing, typography, hover effects
- [src/layouts/partials/archive/topic-hubs.html](src/layouts/partials/archive/topic-hubs.html) — No changes (template remains compatible)

---

## Design Decisions

### D1: Follow Archive Pattern for Consistency
**Confirmed**: Category hub cards now adopt similar spacing, elevation, and hover treatment as archive page redesign (article cards, filter rail).
- Benefit: Consistent design language across key discovery surfaces
- Trade-off: Slight increase in card footprint (larger min-width), but improves readability

### D2: Metadata Expansion
**Deferred**: Card metadata (count, freshness) remains as-is; future expansion to description/type badges can layer on top of this baseline without disruption.

### D3: Mobile-First Responsive
**Confirmed**: Baseline mobile responsive with stepped increases at 48rem+ breakpoint.
- Mobile: 18rem min-width, 1rem gap, 0.15s transitions
- Desktop: 20rem min-width, 1.5rem gap, enhanced shadows

---

## Sign-Off

**Status**: **Ready for QA / User Testing**  
**Implementation Date**: 2026-03-22  
**Testing Environment**: Local Hugo dev (`http://localhost:1313/category/`)  

All changes are **backwards-compatible** and preserve the public `/category/` API. No breaking changes to template, data model, or filtering behavior.

---

## Assumptions and Open Questions

1. **Category metadata expansion** — Second-phase work can add topic description excerpts without modifying card structure (adopt `.metadata-row` partial pattern).
2. **Format/type badges** — If categories gain format designation, add via `.topic-card__format-badge` without restructuring card layout.
3. **Mobile hover state** — Touch targets remain accessible; focus-visible states tested on keyboard navigation.
