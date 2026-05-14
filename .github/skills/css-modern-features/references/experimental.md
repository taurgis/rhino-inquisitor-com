# Experimental CSS - Watch List

These features are in spec and actively shipping, but they are not yet safe for production without explicit opt-in.
Check current MDN and Can I Use data before using any of them.
Always wrap them in `@supports` and keep a full fallback.

## `if()` Inline Conditionals

**Status**: preview or flag channels only in Chromium; no stable Safari or Firefox support
**Spec**: [CSS Values 5](https://drafts.csswg.org/css-values-5/#if-notation)

CSS-native conditional logic without custom-property tricks or JS class toggling.

```css
.button {
  background: if(
    style(--variant: danger): oklch(0.55 0.2 25);
    style(--variant: success): oklch(0.55 0.2 145);
    else: oklch(0.6 0.2 260)
  );
}
```

Do not use in production yet. Syntax may change before stable release.

## `@function`

**Status**: preview or flag channels only in Chromium; no stable Safari or Firefox support
**Spec**: [CSS Functions and Mixins](https://drafts.csswg.org/css-mixins/)

Define reusable CSS functions natively.

```css
@function --fluid-size(--min, --max, --from: 320px, --to: 1200px) {
  result: clamp(
    var(--min),
    calc(var(--min) + (var(--max) - var(--min)) * ((100vw - var(--from)) / (var(--to) - var(--from)))),
    var(--max)
  );
}

h1 { font-size: --fluid-size(1.5rem, 3rem); }
```

Do not use in production yet.

## `interpolate-size: allow-keywords`

**Status**: Chromium stable; Safari and Firefox support is still emerging
**Spec**: [CSS Values 5](https://drafts.csswg.org/css-values-5/#interpolate-size)

Animate to and from intrinsic size keywords such as `height: auto` or `width: max-content`.

```css
:root {
  interpolate-size: allow-keywords;
}

.accordion-content {
  height: 0;
  overflow: hidden;
  transition: height 0.3s ease;
}

.accordion-content.is-open {
  height: auto;
}
```

**Tier 0** - safe only with `@supports` and a real fallback.

```css
@supports (interpolate-size: allow-keywords) {
  :root { interpolate-size: allow-keywords; }

  .accordion-content {
    height: 0;
    overflow: hidden;
    transition: height 0.3s;
  }

  .accordion-content.is-open { height: auto; }
}
```

## `masonry` Grid Layout

**Status**: flagged or proposal-stage across engines
**Spec**: [CSS Grid Level 3](https://drafts.csswg.org/css-grid-3/)

Native Pinterest-style masonry layout with no JS column splitting.

```css
.masonry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-template-rows: masonry;
  gap: 1rem;
}

.masonry-grid {
  display: masonry;
  masonry-template-tracks: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}
```

Fallback: CSS columns or a JS library.

```css
.masonry-grid {
  columns: 3 250px;
  gap: 1rem;
}

@supports (grid-template-rows: masonry) {
  .masonry-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    grid-template-rows: masonry;
    columns: unset;
  }
}
```

## `reading-flow`

**Status**: preview or flag channels only in Chromium; no stable Safari or Firefox support
**Spec**: [CSS Display 4](https://drafts.csswg.org/css-display-4/#reading-flow)

Control tab order and reading order based on visual layout instead of DOM order.

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  reading-flow: grid-order;
}

.flex-reversed {
  display: flex;
  flex-direction: row-reverse;
  reading-flow: flex-visual;
}
```

## `sibling-count()` / `sibling-index()`

**Status**: in development only; no stable browser support
**Spec**: [CSS Values 5](https://drafts.csswg.org/css-values-5/)

Style elements based on their index or sibling count.

```css
.list-item {
  animation-delay: calc(sibling-index() * 100ms);
}

.tag {
  font-size: calc(1rem + (1 / sibling-count()) * 0.5rem);
}
```

Not production-ready. Watch for stable support before use.

## `@media (prefers-color-scheme)` + `color-scheme` vs `light-dark()`

**Note**: Not experimental. This section clarifies the recommended modern pattern.

Prefer `light-dark()` over two separate `@media` blocks.
Use `color-scheme: light dark` on `:root` so browser UI such as scrollbars and form controls can adapt too.

```css
:root {
  color-scheme: light dark;
  --bg: light-dark(#fff, #111);
}

:root { --bg: #fff; }

@media (prefers-color-scheme: dark) {
  :root { --bg: #111; }
}
```