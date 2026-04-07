# Route-Family Critical CSS Preload

## Change summary

Homepage, archive-family, post detail, and regular single pages now inline route-appropriate critical CSS for the initial viewport and preload the full shared stylesheet asynchronously. The dedicated `/video/` hub and any unmatched routes keep the normal fingerprinted stylesheet link. The shared stylesheet is also minified before fingerprinting.

## Why this changed

PageSpeed identified the shared stylesheet as render-blocking on article routes, including `/real-time-inventory-checks-in-sfcc/`. After the single-page version worked, the same approach was extended to homepage, archive, taxonomy index, and taxonomy term routes with route-specific critical CSS so each family keeps the correct first-view layout instead of borrowing article-shell styles.

## Behavior details

Old behavior:
- Every route loaded the full shared stylesheet as a blocking `rel="stylesheet"` asset in the document head.
- Homepage and archive-family routes waited for the full CSS response before the browser could paint their route shell.
- The shared stylesheet was fingerprinted but not minified by the template partial.

New behavior:
- Homepage routes inline `critical-home.css` and use the preload-plus-noscript fallback pattern for the full shared stylesheet.
- Archive-family routes, including the archive page, section/list routes, taxonomy index routes, and taxonomy term routes, inline `critical-archive.css` and use the same preload-plus-noscript fallback pattern.
- Post pages and regular single pages continue to inline `critical-post.css` and preload the full shared stylesheet.
- The `/video/` hub and any unmatched routes still emit a normal blocking stylesheet link.
- The shared stylesheet is minified before fingerprinting on all routes.

## Impact

- Affected runtime surfaces: homepage, archive page, section/list routes, taxonomy index routes, taxonomy term routes, post detail pages, and regular single pages, with `/video/` excluded.
- Unchanged runtime surfaces: alias pages, the `/video/` hub, and any route not matched by the explicit family map continue using the normal stylesheet path.
- Maintainer impact: the stylesheet partial now owns a route-family map and three dedicated critical CSS assets that must stay aligned with their above-the-fold shells.

## Verification

1. Run `npm run build:prod` and confirm the production build succeeds.
2. Inspect `public/real-time-inventory-checks-in-sfcc/index.html` and confirm it contains:
   - an inline `<style>` block with the critical single-page CSS
   - a `rel="preload" as="style"` link for the shared stylesheet
   - a `noscript` fallback `rel="stylesheet"` link
3. Inspect `public/index.html` and confirm it contains the homepage critical CSS inline, plus the stylesheet preload and `noscript` fallback.
4. Inspect `public/about/index.html` and confirm it contains the single-page critical CSS, plus the stylesheet preload and `noscript` fallback.
5. Inspect representative archive-family routes such as `public/archive/index.html`, `public/posts/index.html`, `public/category/index.html`, and one taxonomy term page such as `public/category/ai/index.html`, and confirm they contain the archive critical CSS inline, plus the stylesheet preload and `noscript` fallback.
6. Inspect `public/video/index.html` and confirm it still contains a normal blocking stylesheet link.
7. Run `npm run check:perf:budget`.
   - Current branch-state result still reports missing Phase 8 LHCI manifests, which is an existing validation artifact gap rather than a CSS budget overflow.
8. Re-run PageSpeed or LHCI on representative home, archive-family, post, and non-post single routes to confirm the render-blocking CSS opportunity is reduced without visible first-view regression.

## Related files

- `src/assets/styles/critical-post.css`
- `src/assets/styles/critical-home.css`
- `src/assets/styles/critical-archive.css`
- `src/layouts/partials/site/stylesheet.html`
- `src/assets/styles/site.css`
