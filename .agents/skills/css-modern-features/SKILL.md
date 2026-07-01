---
name: css-modern-features
description: 'Use when writing, reviewing, or refactoring CSS in plain stylesheets, Hugo templates, component markup, CSS Modules, or Tailwind-enabled projects. This skill maps browser targets to safe modern CSS features so native layout, theming, and animation primitives replace legacy workarounds when support allows.'
compatibility: VS Code 1.x+, GitHub Copilot
---

# Modern CSS Skill

Write CSS that uses the most capable, expressive features available for the project's browser targets.
Never reach for a legacy workaround when a modern native feature is supported.

## Step 1 - Detect Browser Targets

Before writing any CSS, resolve the project's browser target. Check in this order:

### 1a. `package.json`

```json
"browserslist": ["> 1%", "last 2 versions", "not dead"]
```

or a `browserslist` key pointing to a config.

### 1b. `.browserslistrc` file

```text
> 1%
last 2 versions
not dead
```

### 1c. Framework-specific configs

- Vite: `build.target` in `vite.config.*`
- Next.js: `next.config.*` for `browserslist` or `transpilePackages`
- Astro: `build.target` in `astro.config.*`

### 1d. No config found -> assume Tier 2

Tier 2 is the conservative-modern default.

### Repo note for this workspace

- This repository currently has no explicit `browserslist`, `.browserslistrc`, or Vite `build.target` setting, so default to Tier 2 unless maintainers add a browser policy.
- Prefer plain CSS in Hugo templates and shared stylesheets first. Tailwind examples later in this skill are optional patterns, not the local default.
- For motion-system design, easing tokens, or deeper View Transitions choreography, use the separate `css-motion-systems` skill.

## Step 2 - Map Targets to Feature Tiers

Once you know the targets, map them to a tier:

| Tier | Typical target | Description |
|------|----------------|-------------|
| Tier 0 | Latest Chromium only, or explicit opt-in | Experimental or limited availability; `@supports` required and a real fallback is expected |
| Tier 1 | Current evergreen browsers | Stable modern features that are broadly available across current Chrome, Edge, Safari, and Firefox |
| Tier 2 | Last 2 versions / > 0.5% | Modern baseline; most widely shipped features are safe |
| Tier 3 | > 1% or older Safari still in scope | Be selective and wrap newer features in `@supports` |
| Tier 4 | IE 11 or legacy Android in scope | Stick to fundamentals and polyfills |

Quick heuristic:

- Chrome 125+, Safari 17.5+, Firefox 128+ -> Tier 1
- Chrome 111+, Safari 16.4+, Firefox 113+ -> Tier 2
- Chrome 105+, Safari 15+, Firefox 110+ -> Tier 3

Use `npx browserslist` in the project root to get the exact resolved list when uncertain.

## Step 3 - Apply the Modern CSS Checklist

Before finalizing any CSS, run through this checklist. Each item has a minimum tier.

### Color and Theming

- [ ] Use CSS custom properties for repeated values such as colors, spacing, and radii - Tier 1-4
- [ ] Use `oklch()` for color definitions instead of hex or HSL - Tier 2+
- [ ] Use `color-mix()` for tints, shades, and opacity variants - Tier 2+
- [ ] Use relative color syntax such as `oklch(from var(--color) l c h)` for derived colors - Tier 1+
- [ ] Use `light-dark()` instead of two `@media (prefers-color-scheme)` blocks - Tier 1+
- [ ] Use `accent-color` to theme native form controls in one line - Tier 2+

### Layout and Sizing

- [ ] Use `clamp()` for fluid typography and spacing instead of breakpoint steps - Tier 2+
- [ ] Use `min()` and `max()` for bounded sizing instead of JS or complex media queries - Tier 2+
- [ ] Use `round()`, `mod()`, `abs()`, and `sign()` for grid snapping and math - Tier 2+
- [ ] Use dynamic viewport units such as `svh`, `dvh`, and `lvh` instead of `100vh` - Tier 2+
- [ ] Use container queries for component-level responsiveness instead of viewport media queries - Tier 2+
- [ ] Use `subgrid` when grid children need to align across rows or columns - Tier 2+
- [ ] Use `aspect-ratio` instead of the padding-top hack - Tier 2+
- [ ] Use `field-sizing: content` only as a progressive enhancement with `@supports` - Tier 0
- [ ] Use `margin-trim` only as a progressive enhancement with `@supports` - Tier 0

### Selectors and Logic

- [ ] Use `:has()` for conditional parent or sibling styling instead of JS class toggling - Tier 2+
- [ ] Use `:is()` and `:where()` to reduce selector repetition - Tier 2+
- [ ] Prefer shared opt-in classes and modifiers for repeated UI patterns instead of wrapper-plus-element selectors - Tier 1-4
- [ ] Use `@layer` to manage cascade order instead of specificity hacks - Tier 2+
- [ ] Use `@scope` for component-scoped styles when current evergreen browser support is available - Tier 1+
- [ ] Use CSS nesting (`&`) instead of preprocessor nesting or repeated selectors - Tier 2+

### Animation and Transitions

- [ ] Use scroll-driven animations for scroll-linked effects instead of IntersectionObserver plus JS - Tier 2+
- [ ] Use `@starting-style` for enter animations on newly displayed elements - Tier 2+
- [ ] Use `transition-behavior: allow-discrete` to animate `display: none` toggling - Tier 2+
- [ ] Use `view-transition-name` for page or component transitions instead of JS animation libraries - Tier 2+
- [ ] Use `offset-path` to animate elements along a curve instead of JS motion libraries - Tier 2+
- [ ] Use `interpolate-size: allow-keywords` only as an experimental enhancement with `@supports` - Tier 0
- [ ] Always respect `prefers-reduced-motion` - Tier 1-4

### Typography

- [ ] Use `text-wrap: balance` on headings - Tier 2+
- [ ] Use `text-wrap: pretty` on body text when graceful fallback is acceptable - Tier 1+
- [ ] Use `cap`, `lh`, and `rex` units for cap-height or line-height-relative sizing - Tier 2+
- [ ] Use `@font-face` `size-adjust` or `font-size-adjust` to normalize font fallbacks - Tier 2+
- [ ] Use `::marker` to style list bullets or numbers instead of hiding them with `::before` - Tier 2+
- [ ] Use `counter()` for CSS-only numbered steps or sections - Tier 2+

### Positioning

- [ ] Use `inset` shorthand instead of top, right, bottom, and left longhand - Tier 2+
- [ ] Use logical properties such as `margin-inline` and `padding-block` for i18n-ready layouts - Tier 2+
- [ ] Use `scroll-margin` and `scroll-padding` to offset sticky-header anchor scroll - Tier 2+
- [ ] Use full anchor positioning only when `position-anchor` support is confirmed, and keep a fallback - Tier 0

### Visual Effects

- [ ] Use `backdrop-filter` for frosted glass or blur overlays instead of image hacks - Tier 2+
- [ ] Use `mix-blend-mode` plus `isolation` for CSS compositing - Tier 2+
- [ ] Use `clip-path` for shape masking instead of SVG wrappers - Tier 2+
- [ ] Use gradient `border-image` or `background-clip: padding-box` for gradient borders - Tier 2+

### Component Patterns

- [ ] Use `env(safe-area-inset-*)` for iOS notch and Dynamic Island safe areas - Tier 2+
- [ ] Use `scrollbar-color` and `scrollbar-width` instead of `::-webkit-scrollbar` - Tier 2+
- [ ] Use `overscroll-behavior` to control scroll chaining on modals and drawers - Tier 2+
- [ ] Use `scroll-behavior: smooth` with a `prefers-reduced-motion` guard - Tier 2+
- [ ] Use `@media (hover: hover)` to scope hover effects away from touch devices - Tier 2+
- [ ] Use `@media (pointer: coarse)` for larger touch targets - Tier 2+
- [ ] Use `@media (scripting: none)` for no-JS progressive enhancement - Tier 1+
- [ ] Use `@media (prefers-contrast: more)` for accessibility enhancement - Tier 2+

### Architecture

- [ ] Use `@property` for typed custom properties that need transitions or range clamping - Tier 2+
- [ ] Use `content-visibility: auto` on off-screen heavy sections for rendering performance - Tier 2+
- [ ] Use `::backdrop` for dialog or popover overlay styling instead of a separate overlay element - Tier 2+
- [ ] Use `:popover-open` for native popover state styling - Tier 1+

### Experimental

- [ ] `interpolate-size: allow-keywords` - animate to or from intrinsic size keywords - Tier 0 with `@supports`
- [ ] `masonry` grid layout - native Pinterest-style layout - Tier 0 behind flags or proposal syntax
- [ ] `if()` inline conditionals - CSS-native branching - watch only
- [ ] `@function` - reusable CSS functions - watch only

## Step 3b - Prefer Reusable Style Hooks

When a visual treatment repeats across multiple surfaces, put the shared contract on the element being styled instead of encoding reuse through wrapper-plus-element selectors.

- Prefer named hooks such as `.surface-chip`, `.surface-chip--current`, or `.card-title` over selectors like `.archive-filter-links a`, `.pagination span`, or `.component h3 a`.
- Reserve bare element selectors for true base styles, resets, and prose or semantic containers where the HTML structure itself is the contract.
- Use `:where()` when you need scoped structure without adding selector weight. Use `:is()` to deduplicate selectors only when you accept the resulting specificity.
- Use `@layer` to control precedence between base, components, and utilities instead of raising selector specificity.

Repo example for this workspace:

- If archive filters, year-jump links, and pagination chips share one interaction pattern, give those elements a shared class hook and style that hook in both `site.css` and the matching critical stylesheet.
- Do not rely on `.archive-filter-links a`, `.jump-year__links a`, `.pagination a`, and `.pagination span` as the source of truth for the same UI pattern.
- Keep first-paint parity in mind: when a reusable hook affects archive or home routes, update the relevant critical stylesheet alongside the shared stylesheet.

## Step 4 - `@supports` Guards for Tier 3

When writing for Tier 3, wrap cutting-edge features with `@supports` and provide a functional fallback:

```css
/* Fallback first */
.card {
  color: hsl(220 80% 50%);
}

/* Enhancement */
@supports (color: oklch(0 0 0)) {
  .card {
    color: oklch(0.55 0.2 260);
  }
}
```

For layout:

```css
.grid {
  display: flex;
  flex-wrap: wrap;
}

@supports (grid-template-rows: subgrid) {
  .grid {
    display: grid;
    grid-template-rows: subgrid;
  }
}
```

## Step 5 - Tailwind Optional Patterns

This repository does not currently use Tailwind. Use the following patterns only when a project already includes Tailwind; otherwise prefer plain CSS.

Modern CSS features belong in arbitrary values rather than custom CSS files when they are one-off utilities:

```html
<!-- clamp() for fluid text -->
<h1 class="text-[clamp(1.5rem,4vw,3rem)]">

<!-- OKLCH color -->
<div class="bg-[oklch(0.7_0.15_200)]">

<!-- dynamic viewport height -->
<div class="h-[100dvh]">

<!-- container query size (within @container) -->
<p class="[@container(min-width:400px)]:text-lg">

<!-- CSS variable reference -->
<div class="gap-[var(--space-md)]">

<!-- light-dark() -->
<div class="text-[light-dark(#111,#eee)]">

<!-- anchor positioning -->
<div class="[position-anchor:--my-anchor]">

<!-- backdrop-filter -->
<nav class="backdrop-blur-md bg-white/70">

<!-- scroll margin for sticky header offset -->
<section class="scroll-mt-16">

<!-- accent color -->
<input type="checkbox" class="accent-[oklch(0.6_0.2_260)]">
```

For reusable patterns, extend `tailwind.config.*` with the feature value rather than repeating arbitrary syntax.

## Feature Reference

For browser support notes, syntax examples, and implementation patterns, load the relevant file as needed:

- [references/color.md](references/color.md) - OKLCH, `color-mix()`, relative color, `light-dark()`
- [references/layout.md](references/layout.md) - `clamp()`, container queries, `subgrid`, `field-sizing`, dynamic viewport units, math functions
- [references/selectors.md](references/selectors.md) - `:has()`, `@layer`, `@scope`, nesting
- [references/animation.md](references/animation.md) - scroll-driven animation, `@starting-style`, View Transitions, `offset-path`
- [references/typography.md](references/typography.md) - `text-wrap`, cap units, `font-size-adjust`, `::marker`, `counter()`
- [references/positioning.md](references/positioning.md) - anchor positioning, logical properties, `scroll-margin`
- [references/misc.md](references/misc.md) - `@property`, `content-visibility`, popover, `backdrop-filter`, blend modes, `clip-path`
- [references/components.md](references/components.md) - `accent-color`, `env()`, media features, scrollbar styling, `margin-trim`, scroll snapping
- [references/experimental.md](references/experimental.md) - `interpolate-size`, masonry, `if()`, `@function`, `reading-flow`
- [references/houdini.md](references/houdini.md) - Paint Worklet and `CSS.registerProperty()`

Load a reference file when you need exact syntax, version floors, or `@supports` patterns for a specific feature. Do not load all reference files at once.

## Agent Usage

Any agent writing CSS should:

1. Read `package.json` or `.browserslistrc` for targets.
2. Map the project to a tier using Step 2.
3. Run the checklist in Step 3 before finalizing output.
4. Wrap Tier 3 and Tier 0 features in `@supports` and keep fallbacks.
5. Treat Tailwind syntax as optional unless the project already uses it.

The files in `references/` are bundled Markdown resources. Load them only when needed.