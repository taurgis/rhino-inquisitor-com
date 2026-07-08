# GEO / E-E-A-T author entity — connected Person graph

**Date:** 2026-07-08
**Trigger:** A GEO (generative engine optimization) audit flagged the homepage:
*"Absence of author info reduces E-A-T signals, making AI less confident to trust
or cite this content as expert guidance."* The finding was confirmed correct.

## Change summary

The site is a single-author expert blog (all 151 posts are authored by Thomas
Theunen), but the homepage JSON-LD advertised only `Organization` + `WebSite` —
no `Person` entity. Article schema carried a thin inline author (name + one URL +
`sameAs`) with no stable identity, and non-post pages (including `/about/`) had no
author-bearing structured data at all. Search and generative engines therefore had
no first-class, credentialed author entity to attribute expertise to.

This change introduces a single canonical `Person` entity and wires it into every
author-bearing page type through `@id` references, forming one connected knowledge
graph (the pattern generative engines rely on to tie content → author →
organization). This is the E-E-A-T mechanism, not a cosmetic tag.

## What changed (old → new)

### 1. Canonical author identity (single source of truth)

- **Old:** Author facts were scattered — a bare `Person` inline in
  `json-ld-article.html`, `sameAs` duplicated in `json-ld-site.html`, and prose on
  `/about/` and the homepage data file — with no machine-readable identity.
- **New:** `[params.author]` in `hugo.toml` holds `name`, `jobTitle`, `worksFor`
  (name + url), `url`, `image`, `description`, `sameAs`, and `knowsAbout`. One place
  to edit; every schema block derives from it.

### 2. Reusable Person partial

- **New:** `src/layouts/partials/seo/json-ld-person.html` returns a `Person` dict
  with a stable `@id` of `https://rhino-inquisitor.com/#person`. Empty fields are
  omitted; the portrait is resolved to a processed absolute image URL. Consumed via
  `partialCached` (site-level, identical on every page).

### 3. Homepage graph now includes the author

- **Old:** `@graph` = `[Organization, WebSite]`.
- **New:** `@graph` = `[Person, Organization, WebSite]`. `Organization.founder` and
  `WebSite.author` both reference `#person` by `@id`. This is the direct fix for the
  flagged warning.

### 4. Article author upgraded to the full expert entity

- **Old:** `BlogPosting.author` = inline `{ Person, name, url, sameAs }`.
- **New:** `BlogPosting.author` = the shared `Person` node (`@id`, `jobTitle`,
  `worksFor`, `knowsAbout`, `image`, `sameAs`), so every article attributes content
  to the same credentialed, resolvable author. `BlogPosting.publisher` also gained
  the `#organization` `@id`, so its full node consolidates with the homepage
  Organization entity instead of reading as a separate publisher.

### 5. About page is now a machine-readable author profile

- **Old:** `/about/` emitted only `BreadcrumbList` — no author schema despite being
  the human bio page.
- **New:** `profilePage: true` front matter triggers
  `src/layouts/partials/seo/json-ld-profile.html`, emitting a `ProfilePage` whose
  `mainEntity` is the `Person`. This explicitly tells engines "this page is about
  this expert."

## Impact & verification

- **Impacted:** homepage, all post pages, and the `/about/` page JSON-LD. No URL,
  routing, permalink, sitemap, or `robots.txt` change — so no URL-parity impact.
- **Verified:**
  - `hugo --minify --environment production` — 0 errors.
  - Every emitted `application/ld+json` block parses as valid JSON.
  - Home `@graph` = `Person, Organization, WebSite`, all cross-linked by `@id`.
  - `/about/` = `ProfilePage (mainEntity → Person)` + `BreadcrumbList`.
  - Article = `BlogPosting (author → Person @id)` + `BreadcrumbList`.
  - Confirm live with the [Google Rich Results Test](https://search.google.com/test/rich-results)
    and the [Schema Markup Validator](https://validator.schema.org/).

## Related files

- `hugo.toml` — `[params.author]`
- `src/layouts/partials/seo/json-ld-person.html` (new)
- `src/layouts/partials/seo/json-ld-profile.html` (new)
- `src/layouts/partials/seo/json-ld-site.html`
- `src/layouts/partials/seo/json-ld-article.html`
- `src/layouts/partials/seo/head-meta.html`
- `src/content/pages/about/index.md`

## Not changed (deliberate scope)

- **List / taxonomy / term pages** keep `BreadcrumbList` + full meta/OG tags. They
  reference the author graph transitively via the homepage's `#person`/`#organization`
  nodes; emitting the full Person/Org graph on every archive page would be redundant.
  A `CollectionPage` type on these archives is a possible future GEO enhancement, not
  part of this E-E-A-T fix.
