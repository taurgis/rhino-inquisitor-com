# Article Fidelity Critical Rerun - 2026-03-17

## Change summary

Reran the critical live-versus-local article audit against the current production site and the current local Hugo preview, then fixed the two remaining real reader-facing article defects in source content.

This rerun produced:

- `migration/reports/phase-8-article-fidelity-critical-rerun-2026-03-17.csv`
- `migration/reports/phase-8-article-fidelity-critical-rerun-summary-2026-03-17.csv`
- `tmp/phase-8-article-fidelity-critical-rerun-2026-03-17-details.json`

## Why this changed

The article-fidelity queue had already been rerun on 2026-03-16, but the user requested another critical pass and then approved implementation work to close the remaining real defects in rendered article examples.

The rerun kept the existing policy boundary:

- H1 drift is expected and does not drive failure status.
- URL drift is expected at the route level and does not drive failure status.
- The critical queue only stays open for reader-facing body, code, and presentation issues.

## Behavior details

### Comparison contract

1. Compare live `.speachify-content` against local `section.article-body`.
2. Keep the 151-article scope from the existing critical rerun inventory.
3. Score body-text, headings, and code blocks automatically.
4. Re-open only reader-facing issues:
   - malformed or leaked visible URLs
   - visible markdown leaks
   - missing local article-body render
   - code-block loss or severe code drift
   - the known scaffold-only local route with no live article baseline
5. Manually verify rows that automation reopens because angle-bracket placeholders can be readable without being parity-clean.

### Old behavior

Before the content fixes, the 2026-03-17 critical rerun still left these real reader-facing defects open:

1. `/sfcc-url-cracking-the-code/`
   The local page rendered a malformed quoted example as `<https://www.example.com/blog/2021/post-title\">` instead of the clean live text.
2. `/the-sfcc-guide-to-finding-pod-numbers/`
   The local page exposed a placeholder host example plus literal `&lt;Cylinder&gt;` inline-code text where the live page kept the example cleaner.

The same rerun also continued to auto-flag two rows that manual review had already classified as acceptable readable placeholder drift:

1. `/mastering-sitemaps-in-sfcc/`
2. `/the-createorders-api-in-sfcc/`

### New behavior after the content fixes

The content fixes closed both real defects without touching sitewide Hugo rendering behavior.

#### Fixed rows

1. `/sfcc-url-cracking-the-code/`
   The malformed quoted URL example was normalized to stable inline-code text, and the row now closes as `pass`.
2. `/the-sfcc-guide-to-finding-pod-numbers/`
   The legacy Log Center example now uses readable placeholder text in both the hostname example and the inline `<Cylinder>` token, and the row now closes as `pass`.

#### Re-closed after manual review

1. `/mastering-sitemaps-in-sfcc/`
   The local page still shows angle-bracket placeholder examples such as `<https://www.your-pwa.com/sitemap_index.xml>`, but the rendered text remains readable and copy-safe. This stays accepted readable drift.
2. `/the-createorders-api-in-sfcc/`
   The local page still shows angle-bracketed endpoint examples. Manual review confirms the URLs remain readable technical examples rather than broken prose.

#### Remaining open row

1. `/phase-3-performance-baseline/`
   The row remains an accepted scope exception because the local content is marked `scaffoldFixture: true` and the live site returns a 404 instead of a comparable article body.

## Impact

- The two real reader-facing article defects are now closed in rendered output.
- The current critical-fidelity queue is effectively closed for migrated article content; only the known scaffold-only local route remains open as a scope exception.
- The dated tracker now reflects both the remediation and the recurring manual acceptance of readable placeholder rows that automation still flags.
- No template, render-hook, or Hugo configuration change was needed to resolve the defects.

## Verification

1. Start the local preview with `hugo server --bind 127.0.0.1 --baseURL http://localhost:1313 --disableFastRender`.
2. Run `node tmp/run-article-critical-rerun-2026-03-17.mjs` from the repository root.
3. Review `migration/reports/phase-8-article-fidelity-critical-rerun-summary-2026-03-17.csv` for final roll-up counts.
4. Review `migration/reports/phase-8-article-fidelity-critical-rerun-2026-03-17.csv` for row-level decisions and evidence.
5. Confirm the fixed rows now close as `pass`:
   - `https://www.rhino-inquisitor.com/sfcc-url-cracking-the-code/` versus `http://localhost:1313/sfcc-url-cracking-the-code/`
   - `https://www.rhino-inquisitor.com/the-sfcc-guide-to-finding-pod-numbers/` versus `http://localhost:1313/the-sfcc-guide-to-finding-pod-numbers/`
6. Reconfirm the manually accepted readable-placeholder rows remain readable in local render:
   - `http://localhost:1313/mastering-sitemaps-in-sfcc/`
   - `http://localhost:1313/the-createorders-api-in-sfcc/`
7. Confirm the only remaining open row is the scaffold exception at `http://localhost:1313/phase-3-performance-baseline/`.

## Related files

- `migration/reports/phase-8-article-fidelity-critical-rerun-2026-03-17.csv`
- `migration/reports/phase-8-article-fidelity-critical-rerun-summary-2026-03-17.csv`
- `tmp/phase-8-article-fidelity-critical-rerun-2026-03-17-details.json`
- `tmp/run-article-critical-rerun-2026-03-17.mjs`
- `tmp/article-critical-rerun-2026-03-16.mjs`
- `analysis/documentation/phase-8/article-fidelity-critical-rerun-2026-03-16.md`
- `src/content/posts/sfcc-url-cracking-the-code/index.md`
- `src/content/posts/the-sfcc-guide-to-finding-pod-numbers/index.md`