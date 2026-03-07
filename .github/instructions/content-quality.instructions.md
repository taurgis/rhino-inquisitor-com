---
description: 'Enforce Markdown body quality standards on migrated and authored content files under content/**'
applyTo: 'content/**'
---

# Content Quality Gate

## Mandatory Pre-Check

Before committing or approving any file matched by `applyTo`, verify whether the file was produced by the migration pipeline (i.e., it originated from a WordPress post, page, or video item). If yes, apply the **Full Migration Body Checklist** below. If the file is newly authored content with no migration context, apply the **Authored Content Checklist** only.

## Full Migration Body Checklist

Run this checklist on every file produced by the content migration pipeline before marking `draft: false`.

### 1. WordPress Artifact Removal

- [ ] No raw WordPress shortcode patterns remain in the body: search for `[caption`, `[gallery`, `[embed`, `[youtube`, `[video`, `[audio`, `[playlist` and remove or replace.
- [ ] No inline `<style>`, `<span>`, or `<div>` HTML remnants in the Markdown body (these survive some HTML-to-Markdown conversions).
- [ ] No `<!--more-->` WordPress read-more comments left in Markdown.
- [ ] No `[…]` or `[Read more]` link patterns generated from WordPress excerpt truncation.
- [ ] No WordPress-generated `wp-content/uploads` absolute URLs remain in image or link references; all media must point to local `static/` paths.

### 2. Internal URL Relinking

- [ ] All internal links in the body that previously pointed to `https://www.rhino-inquisitor.com/...` have been converted to relative Hugo paths (e.g., `/some-article/`).
- [ ] No remaining absolute WordPress internal links that would resolve to the old host after cutover.

### 3. Image Alt Text

- [ ] Every image reference using `![...](...)` syntax has a non-empty descriptive `alt` text string — `![]()` or `![image]()` does not pass.
- [ ] Alt text is descriptive (not just the filename) and under 125 characters.

### 4. Content Completeness (Thin Content Guard)

- [ ] Post body word count is ≥ 150 words OR the post has `draft: true`. Posts under 150 words must be reviewed by the migration owner and either enriched or explicitly set to `draft: true`.
- [ ] Exception: video pages, landing pages, and category description pages may have shorter bodies if they are primarily media or navigation pages — annotate with a front matter comment `# content-type: video-page` or equivalent.

### 5. Line Ending and Encoding Normalization

- [ ] File uses LF (Unix) line endings, not CRLF (Windows). WXR exports from Windows environments often produce CRLF; verify with `file` command or editor inspection.
- [ ] File encoding is UTF-8 without BOM.

### 6. Markdown Syntax Validation

- [ ] No broken heading hierarchy: headings start at `##` (not `#`, which conflicts with the page `title` front matter).
- [ ] No unescaped bare angle brackets (`<`, `>`) in body text that are not intentional HTML.
- [ ] Code blocks use fenced syntax (``` ``` ```) with a language identifier where the language is known.
- [ ] Tables use GFM pipe syntax — no raw HTML `<table>` elements unless there is no Markdown equivalent.

## Authored Content Checklist

For newly written (non-migrated) content files:

- [ ] Body starts at heading level `##` or lower — never `#`.
- [ ] All image references include descriptive alt text.
- [ ] Internal links use relative paths (e.g., `/category/sfcc/`) — no hardcoded absolute URLs.
- [ ] No draft content (`draft: false`) published without a `description` front matter field.

## Thin Content Review Trigger

If a migrated post body is **under 150 words** after conversion and the WordPress source status was `publish`:

1. Flag the item with `status: warning` and `warnings: ["thin-content: N words"]` in the migration report.
2. Set `draft: true` in the generated front matter until the migration owner reviews.
3. Options: enrich content, merge into a related post (with `seo-migration` disposition update), or intentionally publish as a stub with `draft: false` after explicit approval.

## Escalation

If more than 10% of migrated posts trigger the thin-content warning, escalate to the migration owner before continuing. This may indicate a systematic WXR parsing issue (e.g., CDATA body field not correctly extracted).

## When This Is Not Required

- Changes to front matter only (no body edits) — covered by `hugo-coding-standards` and `seo-compliance` instructions.
- SEO template or layout changes in `layouts/` — covered by `hugo-coding-standards` instruction.
- Static asset changes in `static/` with no content file implications.

## References

- `.github/skills/content-migration/SKILL.md` — Authoritative conversion rules, WXR parsing, turndown configuration
- `.github/skills/content-migration/references/FRONTMATTER-GUIDE.md` — Front matter field requirements
- `.github/skills/content-migration/references/WXR-SCHEMA.md` — WXR field mapping and CDATA extraction
- `plan/details/phase-4.md` — Content migration pipeline requirements and quality gates
- [WCAG 2.2 — Image alt text](https://www.w3.org/TR/WCAG22/#non-text-content) — Accessibility requirement for image descriptions
- [Google image best practices](https://developers.google.com/search/docs/appearance/google-images) — Alt text and image SEO guidance
