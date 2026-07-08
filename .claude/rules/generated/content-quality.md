---
paths:
  - "content/**"
---

<!-- GENERATED: forward-nexus ide-sync -->

Source: `.github/instructions/content-quality.instructions.md`

# Content Quality Gate

## Mandatory Pre-Check

Before committing or approving any file matched by `applyTo`, run the Content Body Checklist below on the article body before marking `draft: false`.

## Content Body Checklist

### 1. Clean Markup

- [ ] No stray shortcode-style patterns in the body: search for `[caption`, `[gallery`, `[embed`, `[youtube`, `[video`, `[audio`, `[playlist` and remove or replace with proper Hugo shortcodes or Markdown.
- [ ] No leftover inline `<style>`, `<span>`, or `<div>` HTML noise in the Markdown body.
- [ ] No stray `<!--more-->` or `[Read more]` truncation artifacts.

### 2. Internal Links and Media

- [ ] All internal links use relative Hugo paths (e.g., `/some-article/`) — no hardcoded absolute `https://rhino-inquisitor.com/...` URLs.
- [ ] All media points to local `static/` paths — no external absolute media URLs or hotlinks.

### 3. Image Alt Text

- [ ] Every image reference using `![...](...)` syntax has a non-empty descriptive `alt` text string — `![]()` or `![image]()` does not pass.
- [ ] Alt text is descriptive (not just the filename) and under 125 characters.

### 4. Content Completeness (Thin Content Guard)

- [ ] Post body word count is ≥ 150 words OR the post has `draft: true`. Posts under 150 words are either enriched or explicitly set to `draft: true`.
- [ ] Exception: video pages, landing pages, and category description pages may have shorter bodies if they are primarily media or navigation pages — annotate with a front matter comment `# content-type: video-page` or equivalent.

### 5. Line Ending and Encoding

- [ ] File uses LF (Unix) line endings, not CRLF (Windows).
- [ ] File encoding is UTF-8 without BOM.

### 6. Markdown Syntax Validation

- [ ] No broken heading hierarchy: headings start at `##` (not `#`, which conflicts with the page `title` front matter).
- [ ] No unescaped bare angle brackets (`<`, `>`) in body text that are not intentional HTML.
- [ ] Code blocks use fenced syntax with a language identifier where the language is known.
- [ ] Tables use GFM pipe syntax — no raw HTML `<table>` elements unless there is no Markdown equivalent.
- [ ] No draft content (`draft: false`) published without a `description` front matter field.

## When This Is Not Required

- Changes to front matter only (no body edits) — covered by `hugo-coding-standards` and `seo-compliance` instructions.
- SEO template or layout changes in `layouts/` — covered by `hugo-coding-standards` instruction.
- Static asset changes in `static/` with no content file implications.

## References

- `.agents/skills/hugo-development/SKILL.md` — Front matter fields and content authoring rules
- [WCAG 2.2 — Image alt text](https://www.w3.org/TR/WCAG22/#non-text-content) — Accessibility requirement for image descriptions
- [Google image best practices](https://developers.google.com/search/docs/appearance/google-images) — Alt text and image SEO guidance
