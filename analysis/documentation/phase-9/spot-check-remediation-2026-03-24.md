# Spot-Check Remediation 2026-03-24

## Change summary

This update remediates defects found during a localhost-versus-live spot-check audit.

- Corrected broken footer social-profile links in the Hugo footer partial.
- Removed page-summary duplication on four page routes by rewriting front matter descriptions so the rendered lead copy no longer repeats the first body paragraph.
- Restored one flattened nested-list example on the Page Designer optional-subcategories page.
- Converted three page-bundle image-plus-plain-caption patterns to the repository's semantic `img-caption` shortcode.

## Why this changed

The spot-check audit found two classes of user-visible regressions on the migrated site.

- Footer social links on localhost pointed to generic placeholder destinations instead of Thomas Theunen's real public profiles.
- Several `src/content/pages/**` routes had content-structure issues that reduced fidelity relative to the live site: duplicated intro copy, a flattened example list, and plain caption paragraphs instead of semantic figures.

## Behavior details

### Footer social links

- Old behavior: the footer rendered placeholder `GitHub`, `Twitter`, and `Instagram` links pointing to generic homepages.
- New behavior: the footer renders verified profile links for GitHub, Twitter, and LinkedIn.

### Page content structure

- Old behavior: four page routes rendered a lead summary that repeated the opening body text, one page rendered a flattened hierarchy example, and three pages rendered image captions as plain paragraphs after the image.
- New behavior: page descriptions are distinct from the opening body copy, the hierarchy example is nested again, and affected page images render as semantic figures with figcaptions via `img-caption`.

## Impact

- Affected user-facing workflows: footer profile navigation on content pages and readability/semantic fidelity on affected page routes.
- Affected components: `src/layouts/partials/site/footer.html` and specific files under `src/content/pages/**`.
- Verification impact: build verification and targeted browser parity checks are required on the touched routes.

## Verification

Run and confirm all of the following:

1. `hugo --minify --environment production`
2. Manual route checks on:
   - `/headless/`
   - `/connecting-the-clouds-wedding-or-funeral/`
   - `/the-path-to-being-an-architect/`
   - `/me-myself-and-headless-a-composable-commerce-cloud-story/`
   - `/ideas/page-designer-dynamic-pages-optional-subcategories/`
   - `/ideas/page-designer-add-ability-to-copy-paste-components/`
   - `/versioning-of-content-assets/`
3. Footer link click checks for GitHub, Twitter, and LinkedIn from a page route and the homepage.

## Related files

- `src/layouts/partials/site/footer.html`
- `src/content/pages/headless/index.md`
- `src/content/pages/connecting-the-clouds-wedding-or-funeral/index.md`
- `src/content/pages/the-path-to-being-an-architect/index.md`
- `src/content/pages/me-myself-and-headless-a-composable-commerce-cloud-story/index.md`
- `src/content/pages/page-designer-dynamic-pages-optional-subcategories/index.md`
- `src/content/pages/page-designer-add-ability-to-copy-paste-components/index.md`
- `src/content/pages/versioning-of-content-assets/index.md`