# Video Hub External Link New-Tab Follow-Up (2026-03-25)

## Change summary

The video hub component now opens its YouTube actions in a new tab while leaving internal "Open page" actions in the same tab.

## Why this changed

After the article-body and footer follow-ups were complete, a remaining template-driven link audit found one uncovered external-link surface: the reusable video hub partial. It renders YouTube watch links outside Markdown render hooks, so those anchors needed explicit new-tab handling to match the repository-wide external-link policy.

## Behavior details

### Old behavior

- The active video hub CTA labeled "Watch on YouTube" opened in the same tab.
- Playlist item actions labeled "YouTube" also opened in the same tab.
- Internal "Open page" actions continued to route to local site pages in the same tab.
- The video hub script updated the active YouTube URL dynamically, but did not update any accessibility announcement for new-tab behavior.

### New behavior

- The active video hub YouTube CTA now renders with `target="_blank" rel="noopener noreferrer"`.
- Playlist item YouTube actions now render with `target="_blank" rel="noopener noreferrer"`.
- The active YouTube CTA now carries an `aria-label` that announces the selected video title and that it opens in a new tab.
- The video hub script now refreshes that `aria-label` when the selected video changes.
- Internal "Open page" actions remain same-tab and unchanged.

## Impact

- The remaining template-driven external-link surface now matches the external-link behavior already used for article bodies, shortcodes, and footer social links.
- Screen-reader users get explicit new-tab announcement for the active video hub YouTube CTA and per-item playlist YouTube links.
- The audit result for template-driven external links outside article Markdown and footer chrome is now complete: no other hardcoded external-link templates were identified in `src/layouts/`.

## Verification

1. Run `npm run build:prod` and confirm the build succeeds.
2. Confirm rendered video hub YouTube links include `target="_blank" rel="noopener noreferrer"`.
3. Confirm rendered internal video hub "Open page" links do not include `target="_blank"`.
4. Confirm the active video hub CTA updates its `aria-label` when the selected video changes.

## Related files

- src/layouts/partials/article/video-hub.html
- src/static/scripts/video-playlist.js
- analysis/documentation/README.md

## Assumptions and open questions

- No owner clarification was required because this was the last concrete template-driven external-link gap identified by the follow-up audit.