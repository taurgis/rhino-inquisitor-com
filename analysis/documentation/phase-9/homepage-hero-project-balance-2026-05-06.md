# Homepage Hero Project Balance

## Change Summary

The homepage hero was rebalanced so the Active Projects card now appears in the left hero content flow, directly below the primary CTA buttons, while the right rail contains only the portrait image.

## Why This Changed

The previous homepage hero placed both the portrait and the Active Projects card in the right rail. After aligning the hero rail width with the Latest Posts column, that right side felt visually too large. Moving Active Projects into the left content flow keeps the buttons and project links grouped together and reduces the visual weight of the right rail.

## Behavior Details

### Previous Behavior

Active Projects rendered inside the right hero media column underneath the portrait image.

The left hero column contained the intro copy, the two primary CTA buttons, and the support links.

### New Behavior

Active Projects renders in the left hero column immediately below the CTA button row and above the support links.

The right hero media column now contains only the portrait image.

On desktop, the portrait keeps an inner right inset within the media column so it does not sit flush against the outer hero edge.

The CTA buttons remain side by side on desktop, and the left-column Active Projects card is width-capped so it stays visually tied to the CTA cluster instead of spanning the full text column.

## Impact and Verification

### Impact

Impacted component: homepage hero layout.

Impacted workflow: homepage visual QA for above-the-fold layout, including the critical CSS and full stylesheet pair used on first paint.

SEO impact: none. This change does not alter URLs, canonicals, metadata, sitemap output, robots directives, or structured data.

### Acceptance Criteria

- [x] Active Projects renders in the left hero content area below the CTA row instead of the right media rail.
- [x] The right hero rail contains only the portrait on desktop.
- [x] The two homepage CTA buttons remain side by side on desktop.
- [x] The production Hugo build completes successfully after the layout change.

### Verification

Ran `hugo --cleanDestinationDir --gc --minify --environment production` successfully after the template move and again after the CSS width cap update.

Verified the rebuilt homepage in the browser with DOM and layout inspection:

- Active Projects parent is `.page-hero__body--home`.
- Active Projects renders below the CTA row in the left hero column.
- The left-column Active Projects card renders at about `496px` width on desktop after the width cap.
- The right portrait rail renders at about `403px` width on desktop.
- The visible portrait frame renders at about `365px` width on desktop, leaving an inner right inset of about `38px`.
- The two CTA buttons share the same top position on desktop, confirming a single-row layout.

Limitation: automated mobile viewport verification was attempted in the embedded browser, but the viewport did not change as requested, so mobile validation remains a manual follow-up.

## Related Files

- `src/layouts/home.html`
- `src/assets/styles/site.css`
- `src/assets/styles/critical-home.css`

## Assumptions and Open Questions

- Assumption: placing Active Projects directly below the CTA row and above the support links matches the requested grouping.
- Open question: none.