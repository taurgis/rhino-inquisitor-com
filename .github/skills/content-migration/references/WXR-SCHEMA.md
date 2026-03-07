# WordPress WXR Schema Reference

## WXR Field → Hugo Front Matter Mapping

| Hugo Field | WXR XPath | Notes |
|-----------|-----------|-------|
| `title` | `item/title/__cdata` | Strip HTML entities |
| `description` | `item/excerpt:encoded/__cdata` | Truncate to 155 chars; may be empty |
| `url` | `item/link` → extract pathname | Normalize to lowercase, trailing slash |
| `date` | `item/pubDate` | Parse RFC 2822, convert to ISO 8601 UTC |
| `lastmod` | `item/wp:post_modified_gmt` | Already UTC, append `Z` |
| `draft` | `item/wp:status.__cdata !== 'publish'` | `true` for draft/private/pending |
| `categories` | `item/category[@domain='category']/__cdata` | Array of display names |
| `tags` | `item/category[@domain='post_tag']/__cdata` | Array of display names |
| `heroImage` | `item/wp:postmeta[wp:meta_key='_thumbnail_id']` | Requires second WXR lookup by attachment ID |
| Body content | `item/content:encoded/__cdata` | Convert via turndown |

## WXR Post Status Values

| `wp:status` | Hugo `draft` |
|-------------|-------------|
| `publish` | `false` |
| `draft` | `true` |
| `private` | `true` |
| `pending` | `true` |
| `future` | `true` (scheduled) |
| `trash` | Exclude from migration entirely |

## WXR Post Type Values

| `wp:post_type` | Hugo content directory |
|---------------|----------------------|
| `post` | `content/posts/` |
| `page` | `content/pages/` |
| `attachment` | Handle separately (media asset) |
| `nav_menu_item` | Skip |
| `custom_css` | Skip |

## WXR Attachment Handling

Attachment items (`wp:post_type = 'attachment'`) contain media assets:

```xml
<item>
  <title>image-filename</title>
  <wp:post_type><![CDATA[attachment]]></wp:post_type>
  <wp:attachment_url><![CDATA[https://...wp-content/uploads/...]]></wp:attachment_url>
  <wp:postmeta>
    <wp:meta_key><![CDATA[_wp_attached_file]]></wp:meta_key>
    <wp:meta_value><![CDATA[2024/01/image.jpg]]></wp:meta_value>
  </wp:postmeta>
</item>
```

Build an attachment map keyed by `wp:post_id` to resolve `_thumbnail_id` references from posts.

## WXR Namespace Declarations

WXR files use these XML namespaces — configure fast-xml-parser accordingly:

```
xmlns:excerpt  = "http://wordpress.org/export/1.2/excerpt/"
xmlns:content  = "http://purl.org/rss/1.0/modules/content/"
xmlns:wfw      = "http://wellformedweb.org/CommentAPI/"
xmlns:dc       = "http://purl.org/dc/elements/1.1/"
xmlns:wp       = "http://wordpress.org/export/1.2/"
```

fast-xml-parser strips namespace prefixes by default. Use `tagValueProcessor` or prefix mapping if namespace collisions occur.

## Official References

- https://codex.wordpress.org/Tools_Export_Screen
- https://github.com/WordPress/wordpress-develop/blob/trunk/src/wp-includes/export.php
