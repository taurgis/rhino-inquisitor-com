# Rich Results Test Evidence

## Purpose

Store the manual Google Rich Results Test evidence that RHI-087 requires for representative homepage, article, category, and video routes.

## Current Status

RHI-087 manual Rich Results evidence is complete.

On 2026-03-20, the owner approved Google Rich Results Test code mode against a clean local production build because the staging host is intentionally blocked from indexing and therefore unsuitable for live-URL validation.

Evidence captured:

- `homepage-code-mode.png` — homepage production HTML pasted into Rich Results Test code mode; Google returned `No items detected` and no critical errors.
- `recent-post-1-code-mode.png` — `/real-time-inventory-checks-in-sfcc/`; Google detected `2 valid items` (`Articles` and `Breadcrumbs`).
- `recent-post-2-code-mode.png` — `/a-dev-guide-to-combating-fraud-on-sfcc/`; Google detected `2 valid items` (`Articles` and `Breadcrumbs`).
- `category-ai-code-mode.png` — `/category/ai/`; Google detected `1 valid item` (`Breadcrumbs`).
- `video-page-code-mode.png` — `/connecting-the-clouds-wedding-or-funeral/`; Google detected `2 valid items` (`Videos` and `Breadcrumbs`).
- `staging-homepage-url-unavailable.png` — screenshot of the Google Rich Results Test result page showing the staging-host crawl failure.

## Validation Method

1. Build a clean production artifact with `hugo --cleanDestinationDir --gc --minify --environment production --destination tmp/rich-results-prod-public`.
2. Serve that artifact locally.
3. Open each representative route from the production build.
4. Paste the rendered HTML into Google Rich Results Test code mode.
5. Save a screenshot of the resulting Google validation page.

## Notes

The historical live-URL failure on `https://staging.rhino-inquisitor.com/` is preserved here for traceability, but it is not a blocker for RHI-087 closeout because the owner accepted local production HTML code-mode validation as the final evidence path.