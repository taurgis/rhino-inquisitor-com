# Positioning - Modern CSS Reference

## Anchor Positioning

**Tier**: 0 with `@supports` | `anchor-name` is broadly available, but `position-anchor` and `anchor()` remain limited

Position an element relative to another element on the page without `getBoundingClientRect()`.
Treat full anchor positioning as progressive enhancement unless Chromium-first targets are explicit.

```css
.trigger {
  anchor-name: --my-anchor;
}

.tooltip {
  position: absolute;
  position-anchor: --my-anchor;
  top: anchor(bottom);
  left: anchor(center);
  translate: -50% 0;
  margin-top: 0.5rem;
}

@position-try --flip-above {
  top: auto;
  bottom: anchor(top);
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.tooltip {
  position-try-fallbacks: --flip-above, --flip-left;
  position-try-order: most-width;
}
```

**`@supports` guard**:

```css
@supports (position-anchor: --x) {
  .tooltip {
    position: absolute;
    position-anchor: --my-anchor;
    top: anchor(bottom);
  }
}
```

Fallback: keep existing JS positioning or use a simpler popover or dialog placement model.

## `inset` Shorthand

**Tier**: 2+ | Chrome 87, Safari 14.1, Firefox 87

```css
.overlay { inset: 0; }
.modal { inset: 1rem; }
.tooltip { inset: auto auto 0 50%; }
```

## Logical Properties

**Tier**: 2+ | Chrome 89, Safari 15, Firefox 87

Use writing-mode aware layout for RTL and vertical text.

```css
margin-left -> margin-inline-start
margin-right -> margin-inline-end
margin-top -> margin-block-start
margin-bottom -> margin-block-end

.card {
  margin-inline: auto;
  margin-block: var(--space-m);
  padding-inline: var(--space-l);
  padding-block: var(--space-m);
  border-inline-start: 3px solid var(--color-brand);
}

.icon {
  inline-size: 1.5rem;
  block-size: 1.5rem;
  max-inline-size: 100%;
}
```

## `position: sticky` with Logical Offsets

**Tier**: 2+

```css
.sticky-header {
  position: sticky;
  inset-block-start: 0;
  z-index: 10;
}
```