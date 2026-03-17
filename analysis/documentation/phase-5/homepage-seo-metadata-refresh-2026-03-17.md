# Homepage SEO Metadata Refresh

## Change summary

Improved the homepage title, meta description, and social preview image by adding homepage-specific SEO inputs and routing them through the shared Hugo SEO partials.

## Why this changed

The homepage previously rendered a brand-only title, a short generic description from global site settings, and the generic site-wide social image. That left the root page under-described for search results and made homepage shares visually indistinguishable from the site fallback.

## Behavior details

### Old behavior

- Homepage title rendered as `Rhino Inquisitor`.
- Homepage description rendered from the global `params.description` value in `hugo.toml`.
- Homepage Open Graph and Twitter image tags fell back to the site-wide `defaultSocialImage` asset.
- The shared SEO resolver ignored homepage title overrides even when a template set `seoTitleOverride`.

### New behavior

- Homepage SEO copy now lives in `src/data/homepage.json` under a dedicated `seo` block.
- The homepage template defines a custom `head` block that sets home-only SEO title, description, and social-image overrides before the shared SEO partials render.
- The shared resolver now honors a homepage title override, so the root page can use a descriptive title without changing site-wide naming.
- The rendered homepage title is now `Rhino Inquisitor | Salesforce B2C Commerce Guidance`.
- The rendered homepage description is now `Field-tested Salesforce B2C Commerce guidance, release analysis, and migration playbooks for developers, architects, and commerce leaders.`
- The rendered homepage Open Graph and Twitter image tags now point to `/images/home/home-social.jpg` instead of the generic site fallback.

## Impact

- Affects homepage metadata only.
- Updates the title tag, meta description, Open Graph description/title/image, Twitter description/title/image, and homepage WebSite schema description through the existing shared SEO pipeline.
- Does not change canonical URLs, sitemap behavior, or metadata generation for article, list, taxonomy, or 404 templates.

## Verification

- Run `npm run build:prod`.
- Run `npm run check:seo`.
- Inspect `public/index.html` and confirm the homepage renders the new `<title>` and `<meta name="description">` values.
- Confirm Open Graph and Twitter tags inherit the same title and description and now reference the homepage-specific share image.
- Confirm the built homepage share image exists at `public/images/home/home-social.jpg`.

## Related files

- `src/data/homepage.json`
- `src/layouts/home.html`
- `src/layouts/partials/seo/resolve.html`
- `src/static/images/home/home-social.jpg`