# RHI-107 Homepage Hero Refinement - 2026-03-17

## Change summary

Refined the homepage layout to make the hero and discovery lanes read more intentionally, moved the full About Thomas content into the top hero to remove homepage duplication, repositioned Active Projects into the hero media column, replaced the homepage hero illustration with Thomas Theunen's portrait using the taller legacy portrait source so the top of the page matches the legacy homepage's personal introduction more closely, and aligned the desktop Featured Deep Dive and Latest Posts lanes to the same height.

## Why this changed

The prior homepage refinement improved hierarchy, but the page still repeated the About Thomas content in a second panel below the hero and the discovery blocks did not align cleanly. The hero also previously used the rhino brand mark rather than the author portrait that anchored the current live homepage. This follow-up keeps the personal introduction above the fold once, reduces the weight of the supporting profile links, moves Active Projects into the hero media column, removes the homepage Top Topics lane, and gives the remaining sections a clearer editorial rhythm.

## Behavior details

### Previous behavior

- The homepage hero visually hid the page title and treated the rhino brand mark as the hero illustration.
- A second About Thomas panel repeated the personal introduction below the hero.
- Active Projects lived below the hero as a separate discovery card.
- A homepage Top Topics lane competed with the main reading flow.
- Featured, latest, project, and topic sections did not share a clean visual hierarchy, which made the discovery area feel flatter and less aligned than intended.

### New behavior

- The homepage hero now shows a visible `h1`, the full About Thomas copy, smaller supporting links, and the owner portrait in a taller portrait-oriented illustration frame with a tighter crop that emphasizes the face and upper body.
- The hero portrait is sourced from a production-safe asset copied into `src/assets/images/home/` rather than depending on a draft content bundle, and now uses the higher-resolution legacy portrait instead of the smaller cropped banner version.
- The duplicate lower About Thomas block has been removed entirely from the homepage.
- Active Projects now render directly below the portrait inside the hero media column.
- Top Topics has been removed from the homepage.
- Discovery lanes now use a cleaner sequence: featured row first, then latest posts as the only supporting desktop lane at an approximately `2/3` to `1/3` split.
- On desktop, the Featured Deep Dive and Latest Posts sections now stretch to the same row height so neither lane ends noticeably earlier than the other.
- The hero spacing has been tightened further so the portrait sits closer to the copy, the text column uses more of the available desktop width, and the primary CTA buttons fit side by side more reliably on desktop.

## Impact and verification

### Impact

- **Homepage readers:** see a more personal above-the-fold introduction that matches the current site's intent without repeated biography content further down the page.
- **Maintainers:** can update the homepage portrait through the global asset pipeline instead of relying on a draft page bundle.
- **Phase 3 discovery surfaces:** retain the RHI-104/RHI-107 structure while improving homepage visual hierarchy and reducing secondary-lane clutter.
- **Desktop homepage layout:** keeps the Featured and Latest cards visually balanced even when the featured article body or latest-list copy length changes.

### Verification

1. Run `npm run build:prod` and confirm Hugo builds successfully with the new homepage layout.
2. Open the homepage locally and verify the About Thomas content appears only in the hero.
3. Verify Active Projects appears below the portrait inside the hero media column.
4. Verify Top Topics no longer appears on the homepage.
5. Verify the portrait sits closer to the hero copy, the text block does not leave an oversized empty gutter, and the two CTA buttons fit side by side on desktop viewports.
6. Verify the desktop discovery area reads as Featured Deep Dive and Latest Posts with an approximately `2/3` to `1/3` split.
7. Verify the Featured Deep Dive and Latest Posts sections end at the same height on desktop without clipping article or list content.
8. Run `npm run check:seo` and confirm no homepage SEO regressions.
9. Note: `npm run check:a11y` still reports homepage contrast issues that were already present in the broader palette/system and were not fully resolved in this change.

## Related files

- `src/layouts/home.html`
- `src/assets/styles/site.css`
- `src/assets/images/home/thomas-theunen-hero.jpg`

## Assumptions and open questions

- The homepage should keep the personal introduction prominent above the fold.
- This change applies only to the homepage hero illustration, not the global site logo in the header/footer.