# Typography - Modern CSS Reference

## `text-wrap: balance`

**Tier**: 2+ | Chrome 114, Safari 17.5, Firefox 121

Evenly distribute words across lines in headings. Use it on headings; browsers limit balancing to a small number of lines for performance.

```css
h1, h2, h3, h4, .card__title, .hero__headline {
  text-wrap: balance;
}
```

## `text-wrap: pretty`

**Tier**: 1+ | broader support is newer than `balance`; verify before treating it as a baseline requirement

Like `balance`, but for body text. It reduces awkward orphaned last words and degrades gracefully when unsupported.

```css
p, li, blockquote {
  text-wrap: pretty;
}
```

**Combined pattern**:

```css
:is(h1, h2, h3, h4, h5, h6, .heading) { text-wrap: balance; }
:is(p, li, blockquote, figcaption) { text-wrap: pretty; }
```

## `cap` and `lh` Units

**Tier**: 2+ | Chrome 109, Safari 16.4, Firefox 110 (`cap`); Chrome 109, Safari 17, Firefox 120 (`lh`)

- `cap` = height of a capital letter in the current font
- `lh` = current `line-height`
- `rlh` = root `line-height`
- `rex` = x-height of the root font

```css
.icon {
  width: 1cap;
  height: 1cap;
  vertical-align: middle;
}

textarea {
  min-height: 3lh;
  max-height: 20lh;
}

.section {
  padding-block: 2rlh;
}
```

## `font-size-adjust`

**Tier**: 2+ | Chrome 127, Safari 17, Firefox 118 (`from-font` value)

Normalize x-height across font fallbacks so text does not jump size while web fonts load.

```css
body {
  font-family: "Inter", system-ui, sans-serif;
  font-size-adjust: from-font;
}

body {
  font-size-adjust: 0.52;
}
```

## `hyphenate-limit-chars`

**Tier**: 2+ | Chrome 109, Safari 17, Firefox partial

Fine-grained control over hyphenation.

```css
p {
  hyphens: auto;
  hyphenate-limit-chars: 8 4 3;
}
```

## `initial-letter`

**Tier**: 1+ | Chrome 110, Safari 9 (prefixed), Firefox 130

Use native drop caps.

```css
p::first-letter {
  initial-letter: 3;
  color: var(--color-brand);
  margin-right: 0.125em;
}
```