# Post Critical CSS Preload

## Change summary

Post detail pages now inline a small critical CSS subset for the initial viewport and preload the full shared stylesheet asynchronously. Non-post routes keep the normal fingerprinted stylesheet link. The shared stylesheet is also minified before fingerprinting.

## Why this changed

PageSpeed identified the shared stylesheet as render-blocking on article routes, including `/real-time-inventory-checks-in-sfcc/`. The goal was to reduce that blocking cost on the article template without weakening the first view, introducing FOUC, or changing homepage and archive behavior unnecessarily.

## Behavior details

Old behavior:
- Every route loaded the full shared stylesheet as a blocking `rel="stylesheet"` asset in the document head.
- Post pages waited for the full CSS response before the browser could paint the article shell.
- The shared stylesheet was fingerprinted but not minified by the template partial.

New behavior:
- Post pages inline a targeted critical CSS block for the shared shell, header, breadcrumbs, article header, lead media, summary box, and first article layout structure.
- Post pages request the full shared stylesheet with `rel="preload" as="style"` and promote it to `rel="stylesheet"` on load, with a `noscript` fallback stylesheet link.
- Non-post routes still emit a normal blocking stylesheet link.
- The shared stylesheet is minified before fingerprinting on all routes.

## Impact

- Affected runtime surfaces: post detail pages that render through `src/layouts/_default/single.html` with `.Type == "posts"`.
- Unchanged runtime surfaces: homepage, archive/list routes, and non-post pages continue using the normal stylesheet path.
- Maintainer impact: post-route styling now has a dedicated critical CSS source that must stay aligned with the above-the-fold article shell.

## Verification

1. Run `npm run build:prod` and confirm the production build succeeds.
2. Inspect `public/real-time-inventory-checks-in-sfcc/index.html` and confirm it contains:
   - an inline `<style>` block with the critical post CSS
   - a `rel="preload" as="style"` link for the shared stylesheet
   - a `noscript` fallback `rel="stylesheet"` link
3. Inspect `public/index.html` and confirm it still contains a normal `rel="stylesheet"` link for the shared stylesheet.
4. Run `npm run check:perf:budget`.
   - Current branch-state result still reports missing Phase 8 LHCI manifests, which is an existing validation artifact gap rather than a CSS budget overflow.
5. Re-run PageSpeed or LHCI on the target post route to confirm the render-blocking CSS opportunity is reduced without visible first-view regression.

## Related files

- `src/assets/styles/critical-post.css`
- `src/layouts/partials/site/stylesheet.html`
- `src/assets/styles/site.css`