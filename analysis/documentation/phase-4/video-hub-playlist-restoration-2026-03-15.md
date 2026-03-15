# Video Hub Playlist Restoration

## Change summary

The `/video/` page now gives the playlist surface more usable space on desktop and removes confirmed offline videos from active watch surfaces.

## Why this changed

Old behavior:

1. The `/video/` hub body inherited the generic two-column article layout, which constrained the player and playlist area.
2. The playlist still included a video (`u0mlLP_M6HU`) that is no longer playable on YouTube.
3. Two dedicated pages (`/life-with-goldie/` and `/inside-the-ohana/`) still rendered inline embeds for videos that are now unavailable.

New behavior:

1. The `/video/` hub body is forced to a full-width content column so the player and playlist are not compressed by the article sidebar grid.
2. The desktop player and playlist split now reserves more width for both panels.
3. The offline `Life With Goldie` entry was removed from the `/video/` playlist.
4. Offline embed metadata and shortcode usage were removed from the affected dedicated pages, with a short availability notice retained in page body copy.

## Behavior details

Old vs new behavior:

1. Old: `/video/` inherited `.page-article__body` desktop split columns intended for content plus TOC rails.
2. New: `/video/` explicitly overrides that split and uses one full-width body column for the hub and supporting copy.
3. Old: desktop hub surface used `minmax(0, 1.35fr) minmax(18rem, 0.9fr)`.
4. New: desktop hub surface uses `minmax(0, 1.45fr) minmax(22rem, 1fr)`.
5. Old: playlist item `goldie-podcast` exposed a now-unavailable video.
6. New: that item is removed from playlist front matter and no longer appears on `/video/`.
7. Old: `/life-with-goldie/` and `/inside-the-ohana/` emitted `VideoObject` inputs and inline video embed shortcodes for unavailable videos.
8. New: those pages no longer emit page-level video metadata or inline embeds for unavailable videos.

## Impact

1. `/video/` now allocates more practical viewing space to the player and playlist on desktop breakpoints.
2. The watch hub no longer advertises a known-unavailable video entry.
3. Offline dedicated video pages no longer present a broken or unavailable embed surface.
4. The schema gate remains aligned because page-level `VideoObject` inputs now map only to pages with working on-page video surfaces.

## Verification

Run these checks after the update:

```bash
npm run build:prod
npm run check:schema
```

Offline status confirmation method used for removals:

1. Check YouTube oEmbed endpoint for each candidate ID.
2. Confirm watch-page playability status in fetched HTML metadata.
3. Treat only IDs with oEmbed `404` and playability `ERROR` as removal candidates.

Command pattern:

```bash
curl -sS -o /dev/null -w "%{http_code}" "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<VIDEO_ID>&format=json"
```

Manual validation:

1. Open `/video/` and confirm the playlist count and entries no longer include `Life With Goldie`.
2. On desktop, confirm player and playlist cards render with visibly larger usable width.
3. Click each remaining playlist entry and confirm player title, duration, links, and active-state transitions still update correctly.
4. Open `/life-with-goldie/` and `/inside-the-ohana/` and confirm no inline iframe or video watch action is rendered.
5. Confirm both pages still render cleanly with body copy and no template/script errors.

## Bounded follow-up (2026-03-15)

### Change summary

The `/video/` hub was refined again so the selected video has an explicit responsive 16:9 stage with more vertical presence, the playlist rail is slightly wider, and playlist actions render as compact integrated chips instead of feeling dropped beneath each card.

### Behavior details

Old vs new behavior for desktop hub layout:

1. Old: the selected player relied mostly on width for presence, and the hub-specific player frame did not define its own responsive stage height.
2. New: `.video-embed--hub .video-embed__frame` now defines a responsive `16 / 9` stage with a desktop-oriented minimum height so the video feels larger without depending only on column width.
3. Old: `.video-hub__surface` used `grid-template-columns: minmax(0, 2.2fr) minmax(15rem, 0.65fr)` at `min-width: 64rem`, which left the playlist rail too narrow for clean action placement.
4. New: `.video-hub__surface` uses `grid-template-columns: minmax(0, 1.72fr) minmax(20rem, 1fr)` at `min-width: 64rem`, giving the playlist more room while preserving a dominant player.
5. Old: playlist action links sat in a padded row that felt visually pushed down and disconnected from each item.
6. New: playlist actions render as compact chip-style links aligned with the card content column.
7. Contract retained: the selected player area should not render a duplicate below-player row labeled `Selected video` with a second `Watch on YouTube` link; the primary watch CTA remains in the `Now watching` actions block.

### Impact

1. The selected video feels larger because the player stage has explicit responsive height as well as full-width sizing.
2. The playlist rail has more room for thumbnails, titles, and actions without collapsing the player.
3. Playlist action links now read as part of each card instead of a detached row.
4. The watch action remains singular in the summary action row rather than duplicated beneath the iframe.

### Verification

1. Run `hugo --minify --environment production` and confirm a successful build.
2. Open `/video/` on desktop width (`>= 64rem`) and verify the player has stronger visible height/presence than before.
3. Confirm the playlist rail is slightly wider and the `Open page` and `YouTube` links render as compact integrated chips rather than a detached padded row.
4. Confirm the current-video action row stays visually attached to the `Now watching` summary block.
5. Confirm there is no below-player `Selected video` label row and no duplicate watch CTA below the iframe.
6. Click multiple playlist entries and verify title, duration, active-state labels, and the `Watch on YouTube` action continue updating correctly.

## Support copy polish (2026-03-15)

### Change summary

The supporting copy block below the `/video/` hub now uses explicit internal spacing so the two paragraphs read as a deliberate card instead of inherited article-body content.

### Behavior details

Old vs new behavior for the support copy card:

1. Old: `.article-body--video-hub-copy` had padding, but paragraph spacing still relied on generic article-body margins.
2. New: `.article-body--video-hub-copy` uses a grid gap and paragraph margin reset so the copy spacing is controlled by the card itself.

### Impact

1. The support text below the hub feels more intentional and visually consistent with the rest of the `/video/` page.
2. The card reads as one surface with cleaner rhythm between paragraphs.

### Verification

1. Open `/video/` and confirm the two support paragraphs sit inside a padded card with consistent spacing.
2. Confirm the gap between the two paragraphs is driven by the card layout instead of loose inherited paragraph margins.

## Related files

1. `src/assets/styles/site.css`
2. `src/content/pages/video/index.md`
3. `src/content/pages/life-with-goldie/index.md`
4. `src/content/pages/inside-the-ohana/index.md`
