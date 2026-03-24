# Footer External Link New-Tab Follow-Up (2026-03-24)

## Change summary

The site footer now opens its external social-profile links in a new tab while keeping internal footer navigation in the same tab.

## Why this changed

The earlier article-link audit intentionally focused on article-body rendering and shortcode output. A follow-up chrome audit showed that the footer still contained hardcoded external social links that used `rel="noopener noreferrer"` but did not open in a new tab, leaving footer behavior inconsistent with the updated article policy.

## Behavior details

### Old behavior

- Footer social links to GitHub, Twitter, and LinkedIn opened in the same tab.
- Those links already included `rel="noopener noreferrer"`, but they did not include `target="_blank"`.
- Internal footer links such as About, RSS, and Privacy opened in the same tab.

### New behavior

- Footer social links to GitHub, Twitter, and LinkedIn now render with `target="_blank" rel="noopener noreferrer"`.
- The social-link `aria-label` values now announce that the destination opens in a new tab.
- Internal footer navigation remains same-tab and unchanged.

## Impact

- Non-article chrome now matches the established external-link behavior expected by the follow-up audit scope.
- Screen-reader users get explicit announcement that the footer social links open a new tab.
- No changes were required for header or footer internal navigation because the chrome audit found only the footer social cluster as a hardcoded external-link surface.

## Verification

1. Run `npm run build:prod` and confirm the build succeeds.
2. Confirm rendered footer social links include `target="_blank" rel="noopener noreferrer"`.
3. Confirm rendered internal footer navigation links do not include `target="_blank"`.
4. Confirm article-body external-link behavior remains unchanged after the footer update.

## Related files

- src/layouts/partials/site/footer.html
- analysis/documentation/README.md

## Assumptions and open questions

- No owner clarification was required because the follow-up scope was the previously identified non-article chrome gap in the footer social links.