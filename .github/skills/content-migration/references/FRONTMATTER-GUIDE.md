# Front Matter Field Guide

## Mandatory Fields (All Migrated Indexable Content)

| Field | Type | Rule | Example |
|-------|------|------|---------|
| `title` | string | Required, 1–200 chars, unique per page | `"How to Debug SFCC Cartridges"` |
| `description` | string | Required on indexable pages, 120–155 chars | `"Learn how to..."` |
| `url` | string | Required, lowercase, leading + trailing `/` | `"/debug-sfcc-cartridges/"` |
| `draft` | boolean | Required; `true` only for non-published WP items | `false` |

## Content-Type Fields

### Posts / Articles
| Field | Type | Rule |
|-------|------|------|
| `date` | ISO 8601 string | WordPress `pubDate` → ISO 8601 UTC |
| `lastmod` | ISO 8601 string | WordPress `post_modified_gmt` → ISO 8601 UTC |
| `categories` | string[] | WordPress `category` terms with domain=`category` |
| `tags` | string[] | WordPress `category` terms with domain=`post_tag` |
| `heroImage` | string | Relinked local path under `src/static/` |

### Pages
| Field | Type | Rule |
|-------|------|------|
| `lastmod` | ISO 8601 string | Required on pages |

## Conditional Fields

| Field | When Required |
|-------|--------------|
| `aliases` | When URL changed or content merged; values must exist in `url-manifest.json` |
| `canonical` | Only when canonical must differ from rendered URL; absolute HTTPS only |
| `seo.noindex` | Only for pages that must not be indexed (staging, utility pages) |
| `seo.ogImage` | When post-specific OG image differs from `heroImage` |

## URL Field Rules

The `url` field is the single most critical migration field:
1. Must start with `/`
2. Must end with `/`
3. Must be lowercase
4. Must use only `a-z`, `0-9`, `-`, `/`
5. Must match the `legacy_url` in `migration/url-manifest.json` for `keep`-disposition items
6. Must be unique across all content files

Hugo does **not** sanitize `url` values — any invalid value silently produces a malformed path.

## Date Format

All dates must be ISO 8601 UTC:
```
2024-01-15T09:00:00Z      ✅
2024-01-15                 ⚠️  (date-only, assumes midnight — acceptable fallback)
Mon, 15 Jan 2024 09:00:00 +0000  ✅  (standard WP pubDate format, must be converted)
```

Conversion: `new Date(wpItem.pubDate).toISOString()`

## Category and Tag Normalization

WordPress category terms map to Hugo `categories` and `tags` arrays:

```xml
<!-- WordPress WXR -->
<category domain="category" nicename="sfcc"><![CDATA[SFCC]]></category>
<category domain="post_tag"  nicename="b2c"><![CDATA[B2C Commerce]]></category>
```

```yaml
# Hugo front matter
categories: ["SFCC"]
tags: ["B2C Commerce"]
```

Use the `__cdata` value (display name), not `nicename` (slug), for consistency with existing WordPress taxonomy display names.

## Archetype Template

```yaml
---
title: ""
description: ""
date: {{ .Date }}
lastmod: {{ .Date }}
categories: []
tags: []
heroImage: ""
url: "/"
draft: true
---
```

Save as `src/archetypes/posts.md` and `src/archetypes/pages.md`.
