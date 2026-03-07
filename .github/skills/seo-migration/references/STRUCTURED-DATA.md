# Structured Data Templates

All structured data is emitted as `<script type="application/ld+json">` in the `<head>` element.
Hugo template code is shown alongside the JSON output shape.

## BlogPosting (Article Pages)

Hugo partial: `layouts/partials/seo/json-ld-article.html`

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Article Title — max 110 characters",
  "description": "Meta description text — 120–155 characters",
  "datePublished": "2024-01-15T09:00:00Z",
  "dateModified": "2024-06-01T12:00:00Z",
  "url": "https://www.rhino-inquisitor.com/article-slug/",
  "image": "https://www.rhino-inquisitor.com/images/posts/article-slug/hero.webp",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Rhino Inquisitor",
    "url": "https://www.rhino-inquisitor.com/"
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://www.rhino-inquisitor.com/article-slug/"
  }
}
```

**Required fields:** `headline`, `datePublished`, `dateModified`, `url`, `author`, `publisher`
**Recommended:** `image`, `description`, `mainEntityOfPage`
**Validation:** https://search.google.com/test/rich-results

## WebSite (All Pages — Site-Level Context)

Hugo partial: `layouts/partials/seo/json-ld-website.html`
Included once in `baseof.html` — not repeated per page.

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Rhino Inquisitor",
  "url": "https://www.rhino-inquisitor.com/"
}
```

Optional: add `potentialAction` (SearchAction) only if a working search page exists post-migration.

## BreadcrumbList (Section and Article Pages)

Hugo partial: `layouts/partials/seo/json-ld-breadcrumb.html`

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.rhino-inquisitor.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Category Name",
      "item": "https://www.rhino-inquisitor.com/category/sfcc/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Article Title",
      "item": "https://www.rhino-inquisitor.com/article-slug/"
    }
  ]
}
```

**Required fields per item:** `@type: ListItem`, `position`, `name`, `item`
**Note:** `item` must be a full absolute URL.

## Validation Checklist

Before any structured data change is merged:
- [ ] Output passes [Google Rich Results Test](https://search.google.com/test/rich-results)
- [ ] All string values piped through `jsonify` in Hugo template (prevents XSS and JSON injection)
- [ ] All URLs are absolute HTTPS `https://www.rhino-inquisitor.com/...`
- [ ] `datePublished` and `dateModified` use ISO 8601 format with timezone
- [ ] `headline` ≤ 110 characters
- [ ] `image` URL resolves to an accessible image (not a draft/404 path)
- [ ] No structured data on `draft: true` pages
- [ ] WebSite schema emitted only once per page (not duplicated)

## Common Errors

| Error | Fix |
|-------|-----|
| `headline` truncated by Google | Keep under 110 chars; Hugo `.Title` may be too long |
| `dateModified` not updating | Ensure `lastmod` front matter is set on edit |
| Image URL 404 | Use `absURL` in Hugo template; verify asset path exists |
| Breadcrumb missing on category pages | Ensure partial is included in taxonomy templates |
| JSON syntax error from unescaped characters | Always use `jsonify` for string values in JSON-LD |

## Official References

- https://developers.google.com/search/docs/appearance/structured-data/article
- https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox
- https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- https://schema.org/BlogPosting
- https://schema.org/BreadcrumbList
- https://schema.org/WebSite
