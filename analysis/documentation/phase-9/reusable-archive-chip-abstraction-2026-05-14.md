# Phase 9 Reusable Archive Chip Abstraction - 2026-05-14

## Change summary

Updated the repository CSS skill to explicitly prefer reusable low-specificity style hooks over wrapper-plus-element selectors for repeated UI patterns.

Applied that guidance to the archive route family by introducing a shared `.surface-chip` hook for archive filters, year-jump links, and pagination controls, then wiring the archive critical stylesheet to the same abstraction.

## Why this changed

The archive CSS encoded a reusable chip pattern through selectors such as `.archive-filter-links a`, `.jump-year__links a`, `.pagination a`, and `.pagination span` instead of putting the shared contract on the styled elements.

That made the pattern harder to reuse, easier to drift across templates and critical CSS, and less aligned with current best practices from MDN and web.dev around keeping selector weight low and using reusable hooks before escalating specificity.

## Behavior details

Old behavior:

- The CSS skill encouraged modern selectors and cascade tools, but it did not explicitly tell maintainers to prefer reusable class hooks over wrapper-plus-element selectors for shared UI patterns.
- Archive filters, year-jump links, and pagination controls depended on context-specific element selectors as the source of truth for their chip styling.
- The archive topic rail also relied on positional element targeting for the "All topics" chip.

New behavior:

- The CSS skill now includes a repo-specific rule to prefer shared opt-in classes and modifiers for repeated UI patterns, reserve bare element selectors for base and prose semantics, use `:where()` when scoped structure should stay easy to override, and use `@layer` for precedence instead of specificity escalation.
- Archive filters, year-jump links, and pagination controls now carry a shared `.surface-chip` hook in the markup.
- Archive-specific chip states such as current filters and the featured "All topics" chip now use explicit classes and modifiers instead of element-only selectors.
- `src/assets/styles/critical-archive.css` now mirrors the same hook-based archive chip model so first paint and full CSS stay aligned for the affected archive controls.

## Impact

- Affected users: readers on archive routes and paginated archive pages.
- Affected maintainers: contributors working in the CSS skill, archive partials, `src/assets/styles/site.css`, and `src/assets/styles/critical-archive.css`.
- Affected workflow: repeated archive UI treatments should now be implemented by adding or reusing explicit hook classes on the styled element rather than extending wrapper-plus-element selector lists.

## Verification

1. Run `npm run build:local`.
2. Confirm no file errors are reported for:

   - `.github/skills/css-modern-features/SKILL.md`
   - `src/layouts/partials/archive/filter-groups.html`
   - `src/layouts/partials/archive/year-jump.html`
   - `src/layouts/partials/pagination.html`
   - `src/assets/styles/site.css`
   - `src/assets/styles/critical-archive.css`

3. In a browser, verify `.surface-chip` is present on archive filters, year-jump links, and pagination controls.
4. On `/archive/`, confirm the featured "All topics" chip uses the explicit archive hook and the archive filter controls still render correctly.
5. On `/posts/page/2/`, confirm pagination chips render correctly and remain aligned between full CSS and critical-only reloads.

## Related files

- `.github/skills/css-modern-features/SKILL.md`
- `src/layouts/partials/archive/filter-groups.html`
- `src/layouts/partials/archive/year-jump.html`
- `src/layouts/partials/pagination.html`
- `src/assets/styles/site.css`
- `src/assets/styles/critical-archive.css`
- `analysis/documentation/README.md`