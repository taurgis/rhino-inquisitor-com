# Table UI Refresh - Realm Split Checklist

**Date:** 2026-03-13

## Change summary

Replaced the raw checklist table under the "The Realm Split Data Migration Checklist" section with a dedicated Hugo shortcode component that fits the current article design, improves scanning, and keeps the table usable on narrower screens.

## Why this changed

The generic article-table treatment still looked too flat and spreadsheet-like for this dense migration matrix. The checklist needed stronger hierarchy, better risk emphasis, and a more intentional responsive wrapper so readers can compare timing, ownership, and cutover risks without losing context.

## Behavior details

### Old behavior

- The page used a plain Markdown table rendered through the shared article table styles.
- The checklist blended into the surrounding copy and gave dense rows such as "Order History" and "Customer Profiles" very little visual hierarchy.
- Long operational warnings read like uninterrupted paragraphs inside the risk column.
- Smaller screens relied on the generic article overflow behavior, with no local guidance or component framing.

### New behavior

- The article now renders the checklist through a dedicated shortcode with a scoped wrapper, helper copy, and a keyboard-focusable scroll container.
- The table uses tuned column widths, stronger first-column emphasis, and a higher-contrast header that aligns with the site's existing editorial surface styles.
- High-signal phrases such as "Critical PII risk", "Warning", "Mandatory", and "Salesforce Support Ticket" render as compact status flags instead of disappearing inside paragraph text.
- Narrow screens now show a local scroll hint while preserving all four columns and the underlying table semantics.

## Impact

- Affected route: `/the-realm-split-field-guide-to-migrating-an-sfcc-site/`.
- Styling scope: the new component styles apply only to the realm split checklist shortcode.
- No URL, canonical, sitemap, robots, or structured-data behavior changed.

## Verification

1. Run `npm run build:prod`.
2. Open `/the-realm-split-field-guide-to-migrating-an-sfcc-site/` in the built output and confirm:
   - the checklist renders inside the new component wrapper,
   - status flags appear for support-ticket and risk-critical states,
   - row hierarchy is clearer than the generic article table styling,
   - horizontal scrolling works on narrow viewports and the scroll container is focusable.
3. Run `npm run check:seo:artifact` and `npm run check:a11y:seo` to ensure no regressions in baseline checks.

## Related files

- `src/content/posts/the-realm-split-field-guide-to-migrating-an-sfcc-site.md`
- `src/layouts/shortcodes/realm-split-checklist-table.html`
- `src/static/styles/site.css`
- `analysis/documentation/phase-3/table-checklist-ui-refresh-2026-03-13.md`
