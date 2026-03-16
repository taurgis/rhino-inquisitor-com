# Feature Name

Archive mobile UX flattening

## Change Summary

Updated the shared archive mobile presentation to reduce repeated boxed surfaces, tighten spacing between archive sections, add breathing room above the mobile filter disclosure, keep result card media stacked above the text on small screens, and reclaim unused horizontal space in the mobile archive layout.

## Why This Changed

Archive pages on mobile were carrying the same elevated panel treatment across the outer shell, filter disclosure, search block, year jump, results block, year groups, and cards. That created unnecessary visual depth and wasted vertical space before users reached content.

## Behavior Details

### Previous Behavior

- The mobile archive stack rendered multiple bordered and shadowed containers in sequence.
- Archive headers stayed centered and roomy on narrow screens, which slowed scanning.
- Result cards kept a fully stacked card treatment and strong button CTA styling even when already nested inside results and year-group surfaces.
- A follow-up mobile pass briefly moved result card media beside the text, which made article cards feel too compressed on narrow screens and left the filter disclosure too close to the archive header.

### New Behavior

- The outer archive shell remains the primary surface while inner mobile sections flatten into lighter content bands.
- The mobile filter disclosure keeps the existing details and summary pattern, but now uses tighter spacing, a clearer plus/minus affordance, and a small top margin so it does not crowd the archive header.
- Search, jump-to-year, results, and topic hubs now separate with lighter rules instead of repeated elevated panels.
- Archive result cards keep the lighter mobile surface treatment, but article media remains stacked above the text instead of sitting beside it.
- Mobile archive cards now clip the media inside the card surface and use narrower outer gutters so the articles make fuller use of the available viewport width.
- Desktop archive rail behavior and desktop card styling remain unchanged.

## Impact and Verification

### Impact

- Affects mobile archive/list/taxonomy scanability across the shared archive surfaces.
- Does not change archive URLs, taxonomy logic, SEO output, pagination behavior, or archive-search selector contracts.
- Keeps the current server-rendered and client-rendered archive card structure intact.

### Acceptance Criteria

- [x] Mobile archive surfaces no longer stack repeated strong panel treatments for every inner section.
- [x] Mobile archive spacing is tighter and more consistent between header, controls, search, year navigation, and results.
- [x] Archive behavior remains unchanged because the DOM and JS selector contract were not modified.

### Verification

- `hugo --minify --environment production` completed successfully on 2026-03-15.
- Local archive verification targeted `/category/video/`, which exercises the shared archive templates and archive card layout.
- Browser automation could not persist a forced mobile viewport in the integrated browser tab, so final responsive verification should still include a normal browser or device pass against the `@media (max-width: 47.99rem)` rules added in this change.

## Related Files

- `src/assets/styles/site.css`
- `src/layouts/_default/list.html`
- `src/layouts/_default/taxonomy.html`
- `src/layouts/_default/term.html`
- `src/layouts/partials/content-list.html`
- `src/layouts/partials/archive/filter-bar.html`

## Assumptions and Open Questions

- Assumption: the requested scope was visual cleanup for archive mobile UX rather than a broader archive IA redesign.
- Open question: whether a follow-up should further reduce card metadata or CTA prominence on very small screens after device review.