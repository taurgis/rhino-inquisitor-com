# Animation and Transitions - Modern CSS Reference

## Scroll-Driven Animations

**Tier**: 2+ | Chrome 115, Edge 115, Firefox 110, Safari 18 (partial)

Link animations directly to scroll position with no IntersectionObserver or scroll JS.

```css
@keyframes grow-bar {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.progress-bar {
  animation: grow-bar linear;
  animation-timeline: scroll(root);
  transform-origin: left;
}

@keyframes fade-in {
  from { opacity: 0; translate: 0 2rem; }
  to { opacity: 1; translate: 0 0; }
}

.section {
  animation: fade-in linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 30%;
}

.scroll-container {
  scroll-timeline-name: --gallery;
  scroll-timeline-axis: inline;
  overflow-x: scroll;
}

.gallery-item {
  animation: slide-in linear;
  animation-timeline: --gallery;
}
```

**`@supports` guard**:

```css
@supports (animation-timeline: scroll()) {
  .progress-bar {
    animation: grow-bar linear;
    animation-timeline: scroll(root);
  }
}
```

## `@starting-style`

**Tier**: 2+ | Chrome 117, Edge 117, Safari 17.5, Firefox 129

Define the style an element transitions from when it is first displayed.

```css
dialog {
  transition: opacity 0.3s, transform 0.3s, display 0.3s allow-discrete, overlay 0.3s allow-discrete;
  opacity: 1;
  transform: translateY(0);
}

@starting-style {
  dialog[open] {
    opacity: 0;
    transform: translateY(-1rem);
  }
}

dialog:not([open]) {
  opacity: 0;
  transform: translateY(-1rem);
}
```

## `transition-behavior: allow-discrete`

**Tier**: 2+ | Chrome 117, Safari 17.5, Firefox 129

Enable transitions for discrete properties such as `display`, `visibility`, and `overlay`.

```css
.drawer {
  display: none;
  opacity: 0;
  transform: translateX(-100%);
  transition:
    display 0.3s allow-discrete,
    opacity 0.3s,
    transform 0.3s,
    overlay 0.3s allow-discrete;
}

.drawer.is-open {
  display: block;
  opacity: 1;
  transform: translateX(0);
}

@starting-style {
  .drawer.is-open {
    opacity: 0;
    transform: translateX(-100%);
  }
}
```

## View Transitions

**Tier**: 2+ (same-document) | Chrome 111, Safari 18, Firefox 128

Animate between two states of a page or component.

```css
.hero-image {
  view-transition-name: hero;
}

.page-title {
  view-transition-name: page-title;
}

::view-transition-old(hero) {
  animation: 300ms ease-out fade-out;
}

::view-transition-new(hero) {
  animation: 300ms ease-in fade-in;
}

@view-transition {
  navigation: auto;
}
```

JS trigger for same-document transitions:

```js
document.startViewTransition(() => {
  updateContent();
});
```

## `prefers-reduced-motion`

**Tier**: 1-4 (always include)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .hero { animation: slide-in 0.6s ease both; }
}
```