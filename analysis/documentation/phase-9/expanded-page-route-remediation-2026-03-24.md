# Expanded Page Route Remediation 2026-03-24

## Change summary

- Extended the page-route audit beyond the initial spot-check set to cover the remaining standalone pages plus representative archive surfaces.
- Repaired five page descriptions that were either duplicating the first visible body paragraph or leaking raw body content into the visible lead.
- Confirmed the shared archive shells did not need additional template changes in this pass.

## Why this changed

- The earlier spot-check pass fixed confirmed regressions on a limited set of pages, but the remaining standalone page routes still needed review against the same defect classes.
- The expanded audit found content-local lead regressions caused by malformed or overly literal front matter descriptions.
- Fixing those descriptions preserves the current template contract while improving visible intros and archive excerpts without widening the blast radius into shared layouts.

## Behavior details

### Old behavior

- Some non-post pages displayed a visible lead that repeated the first body paragraph almost verbatim.
- Some page descriptions had absorbed raw body text or placeholder phrasing, producing broken visible leads and degraded archive-card summaries.
- Archive, taxonomy, and term surfaces were suspected candidates but had no newly confirmed shared-shell regression in this sweep.

### New behavior

- The affected pages now use concise front matter descriptions that summarize the page without repeating or corrupting the first body paragraph.
- The offline page body copy now complements the lead instead of duplicating it and no longer repeats the page title as an extra heading.
- Shared archive shells remain unchanged because the expanded audit did not confirm a template-level regression beyond the already-fixed footer links.

## Impact

- Visitors now see cleaner page intros on the affected standalone pages.
- Archive cards and metadata derived from `description` now inherit the corrected summaries for those routes.
- Maintainers can continue treating page lead issues as content-local unless the same regression reproduces through a shared layout or partial.

## Verification

1. Run `hugo --minify --environment production`.
2. If the local Hugo server is serving stale page output, rebuild into an isolated directory such as `tmp/page-audit-build` and verify the canonical HTML there.
3. Recheck the updated canonical routes:
   - `/offline/`
   - `/swc-and-storybook-error-failed-to-load-native-binding/`
   - `/privacy-policy/`
   - `/can-a-isslot-element-have-a-dynamic-id/`
   - `/salesforce-b2c-commerce-cloud-erd/`
4. Confirm each route shows one visible lead summary, distinct first body copy, and the corrected footer social links.
5. Recheck representative archive surfaces to confirm no shared-shell regression was introduced:
   - `/posts/`
   - `/posts/page/2/`
   - `/pages/`
   - `/category/`
   - `/category/ai/`

## Related files

- `src/content/pages/offline/index.md`
- `src/content/pages/swc-and-storybook-error-failed-to-load-native-binding/index.md`
- `src/content/pages/privacy-policy/index.md`
- `src/content/pages/can-a-isslot-element-have-a-dynamic-id/index.md`
- `src/content/pages/salesforce-b2c-commerce-cloud-erd/index.md`