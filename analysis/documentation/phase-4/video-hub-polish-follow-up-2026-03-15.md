# Video Hub Polish Follow-up

## Change summary

A bounded `/video/` hub polish removed duplicated selected-video labeling under the player and increased desktop player width within the hub surface split.

## Why this changed

The previous hub still showed redundant watch context below the iframe (`Selected video` plus another `Watch on YouTube` link) while the same action already exists in the active player action row. The player also remained visually undersized relative to available desktop column space.

## Behavior details

Old vs new behavior:

1. Old: the player card rendered a figcaption under the iframe containing `Selected video` and a duplicate `Watch on YouTube` link.
2. New: the figcaption block is removed; the single source of watch action remains in the `Now watching` card actions.
3. Old: desktop hub surface split used `minmax(0, 1.62fr) minmax(18rem, 0.82fr)`.
4. New: desktop hub surface split uses `minmax(0, 1.95fr) minmax(16rem, 0.72fr)` so the player takes more column width while preserving a usable playlist rail.
5. Old: playlist script maintained a selector/update path for the removed figcaption watch link.
6. New: obsolete selector/update path is removed; script updates only the active action-row watch CTA.

## Impact

1. `/video/` now shows a cleaner player surface with no duplicate selected-video messaging.
2. Desktop viewing emphasizes the active player more strongly without changing playlist selection behavior.
3. Active-state updates continue to synchronize title, duration, description, query-param state, and action links.

## Verification

1. Run `hugo --minify --environment production` and confirm build success.
2. Open `/video/` on desktop width (`>= 64rem`) and confirm the player column is visibly wider than before.
3. Confirm no figcaption label/link appears below the iframe.
4. Click multiple playlist entries and verify `Now watching` title, duration, description, and both action links update correctly.
5. Confirm URL query string still updates to `?video=<slug>` per selected playlist item.

## Related files

1. `src/layouts/partials/article/video-hub.html`
2. `src/assets/styles/site.css`
3. `src/static/scripts/video-playlist.js`
