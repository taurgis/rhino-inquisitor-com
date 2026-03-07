# Hugo Template Patterns Reference

## Base Template Block Architecture (`layouts/_default/baseof.html`)

```go-html-template
<!DOCTYPE html>
<html lang="{{ .Site.LanguageCode | default "en" }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  {{ block "head" . }}{{ partial "head.html" . }}{{ end }}
</head>
<body>
  {{ partial "header.html" . }}
  <main>
    {{ block "main" . }}{{ end }}
  </main>
  {{ partial "footer.html" . }}
  {{ block "scripts" . }}{{ end }}
</body>
</html>
```

## Head Partial Assembly (`layouts/partials/head.html`)

```go-html-template
{{ partial "seo/head-meta.html" . }}
{{ partial "seo/open-graph.html" . }}
{{ partial "seo/twitter-card.html" . }}
{{ partial "seo/json-ld-website.html" . }}
{{ if .IsPage }}
  {{ if eq .Type "posts" }}{{ partial "seo/json-ld-article.html" . }}{{ end }}
  {{ partial "seo/json-ld-breadcrumb.html" . }}
{{ end }}
<link rel="stylesheet" href="{{ "css/main.css" | relURL }}">
```

## SEO Head Meta Partial (`layouts/partials/seo/head-meta.html`)

```go-html-template
<title>{{ if .IsHome }}{{ .Site.Title }}{{ else }}{{ .Title }} | {{ .Site.Title }}{{ end }}</title>

{{ with .Description }}<meta name="description" content="{{ . }}">{{ end }}

{{ $canonical := .Permalink }}
{{ with .Params.canonical }}{{ $canonical = . }}{{ end }}
<link rel="canonical" href="{{ $canonical }}">

{{ if .Params.seo.noindex }}<meta name="robots" content="noindex, follow">{{ end }}
```

**Rules:**
- Title must be unique per page — `{{ .Title }} — {{ .Site.Title }}` for interior pages; `{{ .Site.Title }}` alone for homepage.
- Description falls through from front matter `.Description` — CI must fail if missing on indexable content.
- Canonical defaults to `.Permalink` (Hugo uses `baseURL` to build this correctly in production).
- `noindex` is opt-in via front matter; default is indexable.

## Open Graph Partial (`layouts/partials/seo/open-graph.html`)

```go-html-template
{{ $ogImage := .Site.Params.defaultOgImage }}
{{ with .Params.heroImage }}{{ $ogImage = . | absURL }}{{ end }}
{{ with .Params.seo.ogImage }}{{ $ogImage = . | absURL }}{{ end }}

<meta property="og:site_name" content="{{ .Site.Title }}">
<meta property="og:type" content="{{ if .IsPage }}article{{ else }}website{{ end }}">
<meta property="og:title" content="{{ .Title }}">
<meta property="og:description" content="{{ .Description | default .Site.Params.description }}">
<meta property="og:url" content="{{ .Permalink }}">
{{ with $ogImage }}<meta property="og:image" content="{{ . }}">{{ end }}
{{ if .IsPage }}
  <meta property="article:published_time" content="{{ .Date.Format "2006-01-02T15:04:05Z07:00" }}">
  <meta property="article:modified_time" content="{{ .Lastmod.Format "2006-01-02T15:04:05Z07:00" }}">
{{ end }}
```

## JSON-LD Article Partial (`layouts/partials/seo/json-ld-article.html`)

```go-html-template
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": {{ .Title | jsonify }},
  "description": {{ .Description | jsonify }},
  "datePublished": "{{ .Date.Format "2006-01-02T15:04:05Z07:00" }}",
  "dateModified": "{{ .Lastmod.Format "2006-01-02T15:04:05Z07:00" }}",
  "url": "{{ .Permalink }}",
  {{ with .Params.heroImage }}"image": "{{ . | absURL }}",{{ end }}
  "author": {
    "@type": "Person",
    "name": {{ (.Params.author | default .Site.Params.author) | jsonify }}
  },
  "publisher": {
    "@type": "Organization",
    "name": {{ .Site.Title | jsonify }},
    "url": "{{ .Site.BaseURL }}"
  }
}
</script>
```

## BreadcrumbList Partial (`layouts/partials/seo/json-ld-breadcrumb.html`)

```go-html-template
{{ if not .IsHome }}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "{{ .Site.BaseURL }}"
    }
    {{ with .CurrentSection }}
    ,{
      "@type": "ListItem",
      "position": 2,
      "name": {{ .Title | jsonify }},
      "item": "{{ .Permalink }}"
    }
    {{ end }}
    {{ if not .IsSection }}
    ,{
      "@type": "ListItem",
      "position": 3,
      "name": {{ .Title | jsonify }},
      "item": "{{ .Permalink }}"
    }
    {{ end }}
  ]
}
</script>
{{ end }}
```

## Anti-Patterns to Avoid

| ❌ Bad | ✅ Good |
|--------|---------|
| Duplicate title logic in list.html and single.html | Single `partials/seo/head-meta.html` |
| Hardcoded site name in OG tags | `{{ .Site.Title }}` |
| `{{ .URL }}` for canonical | `{{ .Permalink }}` (includes baseURL and protocol) |
| Missing `jsonify` on schema string fields | Always pipe strings into `jsonify` in JSON-LD |
| Implicit content type detection | Explicit `{{ if eq .Type "posts" }}` guards |

## Sitemap Exclusions

Pages that must NOT appear in `sitemap.xml`:
- `draft: true` pages (Hugo excludes by default when not `--buildDrafts`)
- Alias-generated redirect pages (Hugo excludes by default)
- `seo.noindex: true` pages — override sitemap template to exclude these explicitly

Verify after any output config change:
```bash
hugo build && grep -c "<loc>" public/sitemap.xml
```

## Official References

- https://gohugo.io/templates/introduction/
- https://gohugo.io/templates/partials/
- https://gohugo.io/templates/base/
- https://gohugo.io/templates/sitemap/
- https://schema.org/BlogPosting
- https://schema.org/BreadcrumbList
- https://developers.google.com/search/docs/appearance/structured-data/article
- https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
