## RHI-034 · Workstream C — HTML-to-Markdown Conversion Engine

**Status:** Open  
**Priority:** Critical  
**Estimate:** L  
**Phase:** 4  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-16  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Build a deterministic, rule-governed HTML-to-Markdown conversion engine that produces maintainable, semantically correct Markdown from WordPress `bodyHtml` content. The engine must handle WordPress-specific patterns (Gutenberg blocks, shortcodes, inline styles, legacy iframes) with explicit, documented rules — not silent transformations. Any conversion that cannot be handled cleanly must produce a controlled fallback fragment and be logged for manual review.

This is the most complex script in the pipeline. Quality here directly determines the fidelity and accessibility of all migrated content.

---

### Acceptance Criteria

- [ ] Conversion script `scripts/migration/convert.js` exists and:
  - [ ] Uses `turndown` with `@joplin/turndown-plugin-gfm` for base conversion
  - [ ] Pre-processes `bodyHtml` with `cheerio` before Turndown (DOM-level cleanup)
  - [ ] Preserves heading hierarchy: `h1` is reserved for template title; body content starts at `h2` or lower
  - [ ] Preserves fenced code blocks with language identifier where detectable
  - [ ] Preserves ordered/unordered lists and nested lists correctly
  - [ ] Preserves GFM tables from HTML `<table>` elements
  - [ ] Converts embedded media with a deterministic rule:
    - [ ] YouTube/video iframes: convert to Hugo shortcode `{{< youtube id >}}` or plain link
    - [ ] Unknown iframes: preserve as a commented-out `<!-- iframe: [url] -->` marker with manual review flag
  - [ ] WordPress-specific handling:
    - [ ] Strips Gutenberg block wrapper comments (`<!-- wp:... -->`)
    - [ ] Strips `[caption]`, `[gallery]`, `[embed]` shortcodes or converts to Markdown equivalents
    - [ ] Removes inline `<style>`, presentational `<span>`, `<div>` wrappers with no semantic meaning
    - [ ] Removes `<!--more-->` WordPress read-more comments
    - [ ] Removes `[…]` and `[Read more]` excerpt truncation patterns
  - [ ] Raw HTML is disabled by default; any exception is explicit and sanitized
  - [ ] Is idempotent across runs on the same input
  - [ ] Exits with non-zero code and actionable errors if conversion fails for a record
- [ ] Conversion fallback policy is implemented:
  - [ ] Controlled HTML fallback fragment is preserved when semantic conversion fails
  - [ ] Fallback records are written to `migration/reports/conversion-fallbacks.csv` with `sourceId`, `fallbackType`, and `manualReviewNote`
  - [ ] Each fallback record requires an explicit owner assignment before it can be included in a merge batch
- [ ] All converted records that pass validation are written to `migration/output/` as individual JSON objects (not yet as `.md` files — that is WS-D's job)
- [ ] Image alt text extraction: every `<img>` `alt` attribute is preserved in the Markdown reference; missing alt text is logged as a warning (addressed further in WS-I)
- [ ] Script is referenced in `package.json` as `npm run migrate:convert`
- [ ] Markdown output can be parsed by Hugo's Goldmark renderer with zero errors on a 10-record spot-check

---

### Tasks

- [ ] Audit a sample of 20 WordPress posts for conversion edge cases:
  - [ ] Identify all Gutenberg block types in use
  - [ ] Identify all shortcode types in use
  - [ ] Identify all iframe embed sources in use
  - [ ] Document findings in Progress Log before writing conversion rules
- [ ] Create `scripts/migration/convert.js`:
  - [ ] Configure Turndown options: `headingStyle: 'atx'`, `bulletListMarker: '-'`, `codeBlockStyle: 'fenced'`
  - [ ] Register `@joplin/turndown-plugin-gfm` plugin
  - [ ] Implement Cheerio pre-processing pipeline:
    - [ ] Remove Gutenberg block wrapper comments
    - [ ] Unwrap presentation-only `<div>` and `<span>` with inline styles
    - [ ] Strip `<style>` and `<script>` tags
    - [ ] Preserve semantic structure (`<table>`, `<ul>`, `<ol>`, `<code>`, `<pre>`)
  - [ ] Implement shortcode handling rules (strip, convert, or flag per shortcode type)
  - [ ] Implement iframe handling rules (YouTube shortcode or commented marker)
  - [ ] Implement heading level normalization (shift `h1` body headings down by one)
  - [ ] Implement fallback handler: wrap unresolvable HTML in `<!-- fallback -->` markers and log
- [ ] Define conversion rule registry (map of shortcode/element → handler function) for maintainability
- [ ] Run conversion on full normalized record set and review:
  - [ ] Spot-check 10 output records for heading hierarchy, code blocks, tables, and list rendering
  - [ ] Review `migration/reports/conversion-fallbacks.csv` — assign owners to all entries
  - [ ] Re-run with fixes until fallback count is below the agreed per-batch cap
- [ ] Add `"migrate:convert": "node scripts/migration/convert.js"` to `package.json`
- [ ] Verify 10 sample converted records render correctly in `hugo server` with no Goldmark errors
- [ ] Commit conversion script, updated `package.json`, and fallback report

---

### Out of Scope

- Generating Hugo front matter YAML (Workstream D — RHI-035)
- Writing final `.md` files to `content/` (Workstream D — RHI-035)
- Media file downloads (Workstream F — RHI-037)
- Image path rewriting (Workstream F — RHI-037)
- Internal link rewriting to canonical paths (Workstream G — RHI-038)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-031 Done — Phase 4 Bootstrap complete | Ticket | Pending |
| RHI-033 Done — Normalized records available at `migration/intermediate/records.normalized.json` | Ticket | Pending |
| `turndown`, `@joplin/turndown-plugin-gfm`, `cheerio` installed | Tool | Pending |
| Hugo Goldmark configuration from RHI-021 (raw HTML policy confirmed) | Ticket | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Gutenberg block HTML wrappers produce noisy Markdown output | High | High | Audit block types on Day 1; add targeted Cheerio stripping rules before full conversion run | Engineering Owner |
| Nested shortcodes (e.g., `[gallery]` inside a `[caption]`) produce malformed output | Medium | Medium | Handle nested shortcode removal in Cheerio pre-processing; test with known complex records | Engineering Owner |
| Heading level shift breaks deeply nested content structure | Medium | Medium | Scan extracted records for `h1` usage in body before applying shift; warn if shift results in skipped levels | Engineering Owner |
| Large fallback count indicates a systemic conversion gap | High | High | Set batch cap at 5% fallback rate; halt and improve rules before proceeding if exceeded | Engineering Owner |
| YouTube iframes render as blocked content in Hugo's Goldmark with raw HTML disabled | Medium | Medium | Confirm Hugo shortcode approach with engineering owner before full run; test shortcode output on dev build | Engineering Owner |

---

### Definition of Done

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- `scripts/migration/convert.js`
- `migration/reports/conversion-fallbacks.csv`
- Converted records in `migration/output/` (pre-front matter JSON)
- `package.json` updated with `migrate:convert` script

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- The editorial audit of 20 posts before writing conversion rules is not optional. Conversion rules written without inspecting real data will fail on edge cases that appear frequently in this specific site's content.
- Raw HTML rendering in Hugo's Goldmark must remain disabled by default. Any exception (e.g., a video embed with no shortcode equivalent) must be explicitly documented, scoped, and sanitized via the fallback mechanism.
- The conversion fallback list is not a cosmetic report — it is an explicit work queue. Every fallback entry with no assigned owner blocks the corresponding record from being included in a merge batch.
- Reference: `analysis/plan/details/phase-4.md` §Workstream C: HTML-to-Markdown Conversion
