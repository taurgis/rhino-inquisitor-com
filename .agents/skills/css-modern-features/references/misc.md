# Miscellaneous - Modern CSS Reference

## `@property`

**Tier**: 2+ | Chrome 85, Safari 16.4, Firefox 128

Define typed custom properties. This enables transitions on custom properties and can prevent unintended inheritance.

```css
@property --angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

@property --hue {
  syntax: "<number>";
  inherits: true;
  initial-value: 260;
}

.button {
  --angle: 0deg;
  background: conic-gradient(from var(--angle), oklch(0.6 0.2 var(--hue)), oklch(0.8 0.1 calc(var(--hue) + 60)));
  transition: --angle 1s;
}

.button:hover { --angle: 360deg; }

@property --progress {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 0%;
}
```

## `content-visibility`

**Tier**: 2+ | Chrome 85, Edge 85, Firefox 125, Safari partial

Skip rendering off-screen content to improve long-page performance.

```css
.page-section {
  content-visibility: auto;
  contain-intrinsic-size: auto 400px;
}

.offscreen-panel {
  content-visibility: hidden;
}
```

## `overscroll-behavior`

**Tier**: 2+ | Chrome 63, Safari 16, Firefox 59

Stop scroll events from propagating to the page when a scrollable element reaches its boundary.

```css
.modal {
  overflow-y: auto;
  overscroll-behavior-y: contain;
}

.carousel {
  overflow-x: scroll;
  overscroll-behavior-x: contain;
}

html {
  overscroll-behavior: none;
}
```

## `::backdrop`

**Tier**: 2+ | Chrome 67, Safari 15.4, Firefox 47

Style the backdrop of `<dialog>`, fullscreen elements, or popovers without an extra overlay element.

```css
dialog::backdrop {
  background: oklch(0 0 0 / 0.5);
  backdrop-filter: blur(4px);
  transition: opacity 0.3s;
}

[popover]::backdrop {
  background: transparent;
}
```

## Popover API

**Tier**: 1+ | Chrome 114, Safari 17, Firefox 125

Native popovers without JS positioning libraries.

```html
<button popovertarget="my-menu">Open</button>
<div id="my-menu" popover>Menu content</div>
```

```css
[popover] {
  opacity: 0;
  transform: translateY(-0.5rem);
  transition: opacity 0.2s, transform 0.2s,
              display 0.2s allow-discrete,
              overlay 0.2s allow-discrete;
}

[popover]:popover-open {
  opacity: 1;
  transform: translateY(0);
}

@starting-style {
  [popover]:popover-open {
    opacity: 0;
    transform: translateY(-0.5rem);
  }
}
```

## `scroll-snap`

**Tier**: 2+ | Chrome 69, Safari 11, Firefox 68

```css
.carousel {
  display: flex;
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
}

.carousel-item {
  scroll-snap-align: start;
  flex: 0 0 100%;
}
```

## `image-set()`

**Tier**: 2+ | Chrome 113, Safari 17.2, Firefox 89

Responsive images in CSS, similar to `srcset` for background images.

```css
.hero {
  background-image: image-set(
    url("hero.avif") type("image/avif"),
    url("hero.webp") type("image/webp"),
    url("hero.jpg") type("image/jpeg")
  );
}
```

## Cascade Layers with Import

**Tier**: 2+

```css
@import url("reset.css") layer(reset);
@import url("base.css") layer(base);

@layer reset, base, components, utilities;
```

## Custom Media Queries via `@custom-media`

**Tier**: Not yet native; requires a PostCSS plugin

```css
@custom-media --sm (min-width: 640px);
@custom-media --md (min-width: 768px);

@media (--md) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}
```

## `backdrop-filter`

**Tier**: 2+ | Chrome 76, Safari 9 (prefixed), Firefox 103

Apply filter effects to what sits behind an element.

```css
.navbar {
  background: oklch(1 0 0 / 0.7);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
}

.modal-overlay {
  background: oklch(0 0 0 / 0.4);
  backdrop-filter: blur(4px);
}

.glass-card {
  background: oklch(1 0 0 / 0.15);
  backdrop-filter: blur(16px) brightness(1.1);
  border: 1px solid oklch(1 0 0 / 0.3);
}
```

## `mix-blend-mode` and `isolation`

**Tier**: 2+ | Chrome 41, Safari 8, Firefox 32

Composite elements using blend modes with CSS.

```css
.blend-title {
  mix-blend-mode: multiply;
  color: oklch(0.4 0.2 260);
}

.card {
  isolation: isolate;
}

.card-overlay {
  mix-blend-mode: overlay;
  background: oklch(0.6 0.2 30 / 0.5);
}
```

## `clip-path` with `path()` and `shape()`

**Tier**: `path()` Tier 2+ | `shape()` Tier 1 (Chrome 132+)

Clip elements to arbitrary shapes.

```css
.avatar { clip-path: circle(50%); }
.chevron { clip-path: polygon(0 0, 100% 0, 85% 100%, 15% 100%); }
.diagonal { clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%); }

.blob {
  clip-path: path("M 0,100 C 20,80 80,80 100,100 L 100,0 L 0,0 Z");
}

@supports (clip-path: shape(from 0% 0%, line to 100% 0%)) {
  .card {
    clip-path: shape(
      from 0% 0%,
      line to 100% 0%,
      line to 100% calc(100% - 2rem),
      arc to 0% calc(100% - 2rem) of 2rem cw,
      close
    );
  }
}
```

## `offset-path`

**Tier**: 2+ | Chrome 115, Safari 15.4, Firefox 72

Animate elements along a curved or geometric path with no JS motion library.

```css
@keyframes move-along {
  from { offset-distance: 0%; }
  to { offset-distance: 100%; }
}

.icon {
  offset-path: path("M 10,80 C 40,10 65,10 95,80 S 150,150 180,80");
  offset-rotate: auto;
  animation: move-along 2s linear infinite;
}

.orbiter {
  offset-path: circle(40% at center);
  animation: move-along 3s linear infinite;
}
```