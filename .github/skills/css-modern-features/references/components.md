# Component Patterns - Modern CSS Reference

## `accent-color`

**Tier**: 2+ | Chrome 93, Safari 15.4, Firefox 92

One-line theming for native form controls.

```css
:root {
  accent-color: oklch(0.6 0.2 260);
}

input[type="range"] { accent-color: oklch(0.7 0.15 150); }
input[type="checkbox"] { accent-color: var(--color-brand); }
```

## `::marker` Pseudo-element

**Tier**: 2+ | Chrome 86, Safari 14.1, Firefox 68

Style list bullets and numbers without `::before` hacks.

```css
li::marker {
  color: var(--color-brand);
  font-size: 0.75em;
}

ol li::marker {
  color: oklch(0.6 0.2 260);
  font-weight: 700;
  content: counters(list-item, ".") ". ";
}

ul.checklist li::marker {
  content: "✓ ";
  color: oklch(0.6 0.2 145);
}
```

## `counter()` / `counter-reset` / `counter-increment`

**Tier**: 2+ | broadly supported

CSS-only numbered steps, progress indicators, and section headings.

```css
.steps { counter-reset: step; }

.steps li {
  counter-increment: step;
}

.steps li::before {
  content: "Step " counter(step);
  display: block;
  font-weight: 700;
  color: var(--color-brand);
}

ol {
  counter-reset: section;
  list-style: none;
}

ol li { counter-increment: section; }

ol li::before {
  content: counters(section, ".") " ";
}
```

## `env()` Variables

**Tier**: 2+ | Chrome 69, Safari 11.1, Firefox 65

Access environment variables such as iOS safe areas.

```css
.navbar {
  padding-top: env(safe-area-inset-top);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

.bottom-nav {
  padding-bottom: max(env(safe-area-inset-bottom), 1rem);
}

:root {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}
```

Requires `<meta name="viewport" content="viewport-fit=cover">` in the HTML document.

## Media Feature Queries - Beyond Viewport Size

### `(hover: hover)` and `(pointer: fine)`

**Tier**: 2+ | Chrome 41, Safari 9, Firefox 64

```css
@media (hover: hover) {
  .card:hover { transform: translateY(-2px); }
  .button:hover { background: var(--color-brand-dark); }
}

@media (pointer: coarse) {
  .button { min-height: 44px; padding-inline: 1.5rem; }
  .checkbox { width: 1.5rem; height: 1.5rem; }
}

@media (pointer: fine) {
  .data-table td { padding: 0.375rem 0.75rem; }
}
```

### `(prefers-contrast: more)`

**Tier**: 2+ | Chrome 96, Safari 14.1, Firefox 101

```css
@media (prefers-contrast: more) {
  :root {
    --color-text: #000000;
    --color-bg: #ffffff;
    --border-width: 2px;
  }

  .button {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
}
```

### `(display-mode: standalone)`

**Tier**: 2+ | Chrome 45, Safari 13, Firefox 89

```css
@media (display-mode: standalone) {
  .install-banner { display: none; }
  .navbar { padding-top: env(safe-area-inset-top); }
}
```

### `(scripting: none)`

**Tier**: 1+ | Chrome 120, Safari 17, Firefox 113

```css
.accordion-content { display: none; }

@media (scripting: none) {
  .accordion-content { display: block; }
  .accordion-toggle { display: none; }
}
```

## `attr()` with Type Hints

**Tier**: Tier 0 | partial Chromium support; typed values are still emerging

Use HTML data attributes directly as CSS values where support exists.

```css
[data-label]::before {
  content: attr(data-label);
}

@supports (width: attr(data-width px)) {
  .bar {
    width: attr(data-width px);
  }
}
```

## `scroll-margin` / `scroll-padding`

**Tier**: 2+ | Chrome 69, Safari 14.1, Firefox 68

Offset scroll-to-anchor positions when a sticky header would otherwise cover the target.

```css
:root { --header-height: 64px; }

html { scroll-padding-top: var(--header-height); }

.section {
  scroll-margin-top: calc(var(--header-height) + 1rem);
}

html { scroll-behavior: smooth; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
```

## `scrollbar-color` / `scrollbar-width`

**Tier**: 2+ | Chrome 121, Safari 18.2, Firefox 64

Style scrollbars natively.

```css
:root {
  scrollbar-color: oklch(0.6 0.1 260) transparent;
  scrollbar-width: thin;
}

.sidebar {
  scrollbar-color: var(--color-muted) transparent;
  scrollbar-width: thin;
  overflow-y: auto;
}

.carousel {
  scrollbar-width: none;
  overflow-x: scroll;
}
```

## `margin-trim`

**Tier**: 0 with `@supports` | Safari 16.4, Chromium 130+, Firefox support pending

Remove leading and trailing child margins at the container edge.

```css
.card-body {
  margin-trim: block;
}

.tag-list {
  display: flex;
  margin-trim: inline;
}
```

**`@supports` guard**:

```css
@supports (margin-trim: block) {
  .card-body { margin-trim: block; }
}
```