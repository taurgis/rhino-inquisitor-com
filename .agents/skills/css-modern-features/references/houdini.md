# Houdini - CSS Paint Worklet and Low-Level APIs

Houdini exposes hooks into the browser's rendering engine. Most of it is superseded by newer native CSS features.
Focus on Paint Worklet and `@property`, which remain the most practical parts for CSS authoring.

## Paint Worklet (`CSS.paintWorklet`)

**Tier**: 1+ | Chrome 65, Edge 79 | Safari unsupported | Firefox unsupported
**Use with**: `@supports` guard and a PNG or SVG fallback

Draw custom backgrounds, borders, and fills using a Canvas-like API registered as a CSS image value.

### Setup

**worklet file** (`paint-checkerboard.js`):

```js
class CheckerboardPainter {
  static get inputProperties() {
    return ['--checkerboard-size', '--checkerboard-color'];
  }

  paint(ctx, geometry, properties) {
    const size = parseInt(properties.get('--checkerboard-size')) || 32;
    const color = properties.get('--checkerboard-color').toString().trim() || '#ccc';

    ctx.fillStyle = color;

    for (let y = 0; y < geometry.height; y += size) {
      for (let x = 0; x < geometry.width; x += size) {
        if ((x / size + y / size) % 2 === 0) {
          ctx.fillRect(x, y, size, size);
        }
      }
    }
  }
}

registerPaint('checkerboard', CheckerboardPainter);
```

**Register in JS**:

```js
if ('paintWorklet' in CSS) {
  CSS.paintWorklet.addModule('/paint-checkerboard.js');
}
```

**Use in CSS**:

```css
.pattern-bg {
  --checkerboard-size: 20;
  --checkerboard-color: oklch(0.85 0.05 260);

  background: oklch(0.95 0 0);
  background: paint(checkerboard);
}
```

### Animated Paint (with `@property`)

```js
class ProgressPainter {
  static get inputProperties() { return ['--progress']; }

  paint(ctx, geo, props) {
    const progress = parseFloat(props.get('--progress')) / 100;
    ctx.fillStyle = 'oklch(0.6 0.2 260)';
    ctx.fillRect(0, 0, geo.width * progress, geo.height);
  }
}

registerPaint('progress-bar', ProgressPainter);
```

```css
@property --progress {
  syntax: "<number>";
  inherits: false;
  initial-value: 0;
}

.progress {
  background: paint(progress-bar);
  --progress: 0;
  transition: --progress 0.5s ease;
}

.progress.loaded { --progress: 75; }
```

### `@supports` guard pattern

```css
.hero {
  background: linear-gradient(135deg, oklch(0.7 0.15 260), oklch(0.5 0.2 300));
}

@supports (background: paint(anything)) {
  .hero {
    background: paint(noise-gradient);
  }
}
```

## `CSS.registerProperty()`

**Tier**: 2+ | Chrome 78, Safari 16.4, Firefox 128

The JS equivalent of `@property`. Use it when the initial value is dynamic or computed at runtime.

```js
CSS.registerProperty({
  name: '--theme-hue',
  syntax: '<number>',
  inherits: true,
  initialValue: '260',
});

CSS.registerProperty({
  name: '--card-opacity',
  syntax: '<number>',
  inherits: false,
  initialValue: '1',
});
```

Once registered, the property can be transitioned like a native property:

```css
.card {
  --card-opacity: 1;
  opacity: var(--card-opacity);
  transition: --card-opacity 0.3s;
}

.card:hover { --card-opacity: 0.85; }
```

## Layout Worklet

The CSS Layout Worklet API never gained practical cross-browser support. Native CSS features such as subgrid, container queries, and masonry cover most of the same use cases. Do not use it.

## Typed OM

The CSS Typed Object Model exposes CSS values as typed JS objects instead of strings.
It is mainly relevant to JS-heavy animation or graphics code, not everyday CSS authoring.

```js
el.style.opacity = String(value);
el.attributeStyleMap.set('opacity', CSS.number(value));
```

## When to Reach for Houdini

| Need | Reach for |
|------|-----------|
| Custom background pattern or texture | Paint Worklet |
| Animating a custom property | `@property` or `CSS.registerProperty()` |
| Masonry layout | `grid-template-rows: masonry` plus CSS columns fallback |
| Custom scroll animation | Scroll-driven animations |
| Gradient borders | `border-image` with gradients, or Paint Worklet for complex shapes |