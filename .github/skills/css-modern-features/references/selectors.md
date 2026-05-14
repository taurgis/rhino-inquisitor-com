# Selectors and Logic - Modern CSS Reference

## `:has()` Selector

**Tier**: 2+ | Chrome 105, Safari 15.4, Firefox 121

The parent selector. Conditionally style an element based on what it contains or based on a sibling.

```css
.card:has(img) { grid-template-columns: 1fr 2fr; }

.field:has(input:invalid) label { color: oklch(0.55 0.2 30); }

.nav-item:has(> [aria-current="page"]) {
  background: var(--color-active-bg);
  font-weight: 600;
}

:has(+ input:focus) { color: var(--color-brand); }

tr:has(input[type="checkbox"]:checked) {
  background: oklch(0.95 0.05 260);
}
```

**`@supports` guard**:

```css
@supports selector(:has(a)) {
  .card:has(img) { grid-template-columns: 1fr 2fr; }
}
```

## `:is()` and `:where()`

**Tier**: 2+ | Chrome 88, Safari 14, Firefox 78

Group selectors without repeating them. `:is()` keeps the specificity of the highest selector. `:where()` has zero specificity.

```css
:is(h1, h2, h3, h4) a { color: var(--color-brand); }

:where(ul, ol) { list-style: none; margin: 0; padding: 0; }

:is(.theme-dark, [data-theme="dark"]) .card {
  background: oklch(0.2 0 0);
}
```

## CSS Nesting

**Tier**: 2+ | Chrome 112, Safari 17.2, Firefox 117

Native `&` nesting without a preprocessor.

```css
.card {
  padding: var(--space-m);
  border-radius: var(--radius-md);

  & .card__title {
    font-size: 1.25rem;
  }

  &:hover {
    box-shadow: 0 4px 12px oklch(0 0 0 / 0.1);
  }

  & + & {
    margin-top: var(--space-s);
  }

  @media (min-width: 640px) {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}
```

## `@layer`

**Tier**: 2+ | Chrome 99, Safari 15.4, Firefox 97

Explicit cascade layer ordering to avoid specificity wars.

```css
@layer reset, base, components, utilities;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
}

@layer components {
  .button { background: var(--color-brand); }
}

@layer utilities {
  .sr-only { position: absolute; width: 1px; clip: rect(0,0,0,0); }
}
```

## `@scope`

**Tier**: 1+ | broadly supported in current evergreen browsers

Scoped styles without extra wrapper classes, data attributes, or CSS Modules.

```css
@scope (.card) {
  :scope { padding: 1rem; }
  h2 { font-size: 1.25rem; }
  p { color: var(--color-muted); }
}

@scope (.card) to (.card) {
  p { font-weight: 500; }
}
```

**`@supports` guard**:

```css
@supports at-rule(@scope) {
  @scope (.card) { h2 { font-size: 1.25rem; } }
}
```

## `:nth-child(An+B of S)`

**Tier**: 1+ | Chrome 111, Safari 9, Firefox 113

Filter `nth-child` by a selector so non-matching siblings do not affect the count.

```css
.post:nth-child(2n of .post) {
  background: var(--color-stripe);
}
```