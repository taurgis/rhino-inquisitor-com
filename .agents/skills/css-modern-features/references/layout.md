# Layout and Sizing - Modern CSS Reference

## `min()`, `max()`, `clamp()`

**Tier**: 2+ | Chrome 79, Safari 11.1, Firefox 75

Replace breakpoint-heavy sizing with fluid, math-driven values.

```css
h1 { font-size: clamp(1.5rem, 4vw + 1rem, 3.5rem); }
.container { width: clamp(320px, 90%, 1200px); }

.sidebar { width: min(300px, 100%); }
.hero { padding: max(2rem, 5vh); }

:root {
  --space-s: clamp(0.75rem, 1.5vw, 1rem);
  --space-m: clamp(1rem, 2vw, 1.5rem);
  --space-l: clamp(1.5rem, 4vw, 3rem);
}
```

## Container Queries

**Tier**: 2+ | Chrome 105, Safari 16, Firefox 110

Style components based on their container size, not the viewport.

```css
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card { display: grid; grid-template-columns: 1fr 2fr; }
}

@container (min-width: 600px) {
  .card__title { font-size: 1.5rem; }
}
```

### Container Query Units

```css
.card__heading {
  font-size: clamp(1rem, 4cqw, 2rem);
}
```

## Subgrid

**Tier**: 2+ | Chrome 117, Safari 16, Firefox 71

Align grid items across nested grid contexts.

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto auto auto;
  gap: 1rem;
}

.card {
  display: grid;
  grid-row: span 3;
  grid-template-rows: subgrid;
}
```

## `aspect-ratio`

**Tier**: 2+ | Chrome 88, Safari 15, Firefox 89

Replace the padding-top hack entirely.

```css
.video { aspect-ratio: 16 / 9; width: 100%; }
.avatar { aspect-ratio: 1; border-radius: 50%; }
.square-grid { aspect-ratio: 1; }
```

## `field-sizing: content`

**Tier**: 0 with `@supports` | Chromium stable; verify Safari and Firefox support before using broadly

Auto-resize `<input>` and `<textarea>` to fit their content with no JS.

```css
textarea {
  field-sizing: content;
  min-height: 3lh;
  max-height: 20lh;
  resize: none;
}

input[type="text"] {
  field-sizing: content;
  min-width: 10ch;
}
```

**`@supports` guard**:

```css
@supports (field-sizing: content) {
  textarea { field-sizing: content; resize: none; }
}
```

## Intrinsic Sizing Keywords

**Tier**: 2+ | broadly supported

```css
.sidebar { width: min-content; }
.tag { width: max-content; }
.card { width: fit-content(400px); }
```

## Dynamic Viewport Units

**Tier**: 2+ | Chrome 108, Safari 15.4, Firefox 101

Solve the classic `100vh` mobile browser bar problem.

```css
.hero { height: 100svh; }
.overlay { height: 100dvh; }
.panel { min-height: 100svh; max-height: 100lvh; }

:root {
  --viewport-height: 100dvh;
}
```

## CSS Math Functions - `round()`, `mod()`, `rem()`, `abs()`, `sign()`

**Tier**: 2+ | Chrome 125, Safari 15.4, Firefox 118

Snap values to a grid, compute remainders, and handle signs in CSS.

```css
.card {
  width: round(var(--container-width), 8px);
}

.font { font-size: round(nearest, 1.7rem, 0.25rem); }
.box { width: round(up, 33.3%, 1px); }

.stripe:nth-child(n) {
  background: oklch(calc(0.9 - mod(var(--i, 0), 3) * 0.1) 0 0);
}

.offset { translate: abs(var(--x)) 0; }

.arrow {
  rotate: calc(sign(var(--delta)) * 45deg);
}
```