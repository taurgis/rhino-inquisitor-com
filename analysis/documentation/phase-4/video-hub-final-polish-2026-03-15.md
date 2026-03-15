# Video Hub Final Polish

## Change summary

A bounded `/video/` hub polish removed the duplicated "Selected video / Watch on YouTube" row beneath the player and increased desktop player-width share in the hub split layout.

## Why this changed

The selected-video actions already exist in the "Now watching" action row, so the extra under-player caption/link duplicated the same destination and created visual noise. The desktop player area also remained too narrow for comfortable viewing.

## Behavior details

Old behavior:

1. The selected video card rendered an extra figcaption below the iframe with `Selected video` and a second `Watch on YouTube` link.
2. Desktop hub surface used `grid-template-columns: minmax(0, 1.35fr) minmax(18rem, 0.9fr)`.

New behavior:

1. The selected video card renders only the iframe; the duplicated under-player caption/link is removed.
2. Desktop hub surface now uses `grid-template-columns: minmax(0, 2.2fr) minmax(15rem, 0.65fr)` so the player takes more of the available width.

## Impact

1. `/video/` has cleaner selected-player chrome with a single YouTube action source in the primary action row.
2. Desktop viewing prioritizes the player while retaining a usable playlist column.
3. Playlist selection behavior and metadata updates remain unchanged.

## Verification

1. Run `hugo --minify --environment production` and confirm a successful build.
2. Open `/video/` at desktop width and confirm there is no label/link row directly under the selected iframe.
3. Confirm the player visually occupies more width than before and playlist cards remain readable.
4. Click several playlist items and confirm title/duration/description and "Watch on YouTube" action in the "Now watching" area still update correctly.

## Related files

1. `src/layouts/partials/article/video-hub.html`
2. `src/assets/styles/site.css`
