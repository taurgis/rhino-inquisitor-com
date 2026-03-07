---
name: content-migration
description: 'WordPress-to-Hugo content migration pipeline: WXR/REST export parsing, HTML-to-Markdown conversion via turndown, front matter generation, media asset handling, and per-item migration reporting. Use when writing or reviewing migration scripts, converting WordPress post/page exports, generating Hugo front matter from WordPress metadata, or auditing migration output quality.'
license: Forward Proprietary
compatibility: 'Node.js 18+, Hugo extended v0.120+'
---

# Content Migration

Practical guidance for the WordPress-to-Hugo content pipeline for rhino-inquisitor.com. Covers WXR/REST parsing, HTML-to-Markdown conversion, front matter generation, media handling, and migration reporting.

## When to Use This Skill

- Writing Node.js scripts to parse WordPress WXR export files or REST API responses
- Converting WordPress post HTML body content to Hugo-compatible Markdown
- Generating Hugo front matter (including `url`, `aliases`, `categories`, `tags`) from WordPress metadata
- Handling image/media asset extraction and relinking
- Producing per-item and summary migration reports
- Validating migration output quality before importing into Hugo content directories
- **Not for:** Hugo template authoring (use `hugo-development`) or SEO redirect decisions (use `seo-migration`)

## Required Libraries

```json
{
  "dependencies": {
    "turndown": "^7.x",
    "@joplin/turndown-plugin-gfm": "^1.x",
    "gray-matter": "^4.x",
    "fast-xml-parser": "^4.x",
    "fast-glob": "^3.x",
    "gray-matter": "^4.x",
    "p-limit": "^5.x",
    "zod": "^3.x",
    "csv-stringify": "^6.x"
  }
}
```

## Migration Pipeline Architecture

```
WordPress (WXR file or REST API)
         ↓
  1. Parse & Normalize     fast-xml-parser / fetch
         ↓
  2. Validate & Classify   zod schema, url-manifest lookup
         ↓
  3. Convert HTML → MD     turndown + GFM plugin
         ↓
  4. Generate Front Matter gray-matter, url-manifest mapping
         ↓
  5. Write Hugo Content    content/posts/, content/pages/
         ↓
  6. Download Media        p-limit (concurrency), local static/
         ↓
  7. Relink Assets         update image paths in Markdown
         ↓
  8. Produce Reports       CSV + JSON migration report
```

## WXR Parsing (fast-xml-parser)

```js
import { XMLParser } from 'fast-xml-parser';
import { readFile } from 'node:fs/promises';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  cdataPropName: '__cdata',
  isArray: (name) => ['item', 'category'].includes(name),
});

export async function parseWxr(wxrPath) {
  const xml = await readFile(wxrPath, 'utf-8');
  const doc = parser.parse(xml);
  return doc.rss.channel.item ?? [];
}
```

## Front Matter Generation from WordPress Item

```js
import matter from 'gray-matter';
import { urlManifest } from './url-manifest.js';   // migration/url-manifest.json

export function buildFrontMatter(wpItem) {
  const legacyUrl  = new URL(wpItem.link).pathname; // e.g. "/some-article/"
  const manifest   = urlManifest.find(e => e.legacy_url === legacyUrl);
  const targetUrl  = manifest?.target_url ?? legacyUrl;
  const aliases    = manifest?.legacy_url !== targetUrl ? [manifest.legacy_url] : [];

  const fm = {
    title:       wpItem.title.__cdata ?? wpItem.title,
    description: wpItem['excerpt:encoded']?.__cdata?.slice(0, 155) ?? '',
    date:        new Date(wpItem.pubDate).toISOString(),
    lastmod:     new Date(wpItem['wp:post_modified_gmt']).toISOString(),
    categories:  extractTerms(wpItem.category, 'category'),
    tags:        extractTerms(wpItem.category, 'post_tag'),
    url:         targetUrl,    // REQUIRED: explicit path for Hugo
    draft:       wpItem['wp:status'].__cdata !== 'publish',
  };

  if (aliases.length) fm.aliases = aliases;

  return fm;
}

function extractTerms(categories, domain) {
  if (!Array.isArray(categories)) return [];
  return categories
    .filter(c => c['@_domain'] === domain)
    .map(c => c.__cdata ?? c['#text'] ?? '');
}
```

## HTML to Markdown Conversion (turndown + GFM)

```js
import TurndownService from 'turndown';
import { gfm, tables, strikethrough } from '@joplin/turndown-plugin-gfm';

const td = new TurndownService({
  headingStyle:   'atx',     // ## Heading
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',  // ``` blocks
  fence:          '```',
  hr:             '---',
});

td.use(gfm);
td.use(tables);
td.use(strikethrough);

// Keep WordPress figure/caption markup as simple Markdown
td.addRule('wp-caption', {
  filter: ['figure'],
  replacement: (content) => `\n\n${content.trim()}\n\n`,
});

// Relink internal WordPress URLs to relative Hugo paths
td.addRule('internal-links', {
  filter: (node) => node.nodeName === 'A' && node.getAttribute('href')?.includes('rhino-inquisitor.com'),
  replacement: (content, node) => {
    const href = node.getAttribute('href').replace('https://www.rhino-inquisitor.com', '');
    return `[${content}](${href})`;
  },
});

export function htmlToMarkdown(html) {
  return td.turndown(html ?? '');
}
```

## Writing Hugo Content Files (gray-matter)

```js
import matter from 'gray-matter';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

export async function writeHugoContent(fm, markdownBody, outputDir) {
  const slug     = fm.url.replace(/^\/|\/$/g, '').replace(/\//g, '-');
  const filePath = path.join(outputDir, `${slug}.md`);

  await mkdir(outputDir, { recursive: true });

  const fileContent = matter.stringify(markdownBody, fm);
  await writeFile(filePath, fileContent, 'utf-8');

  return filePath;
}
```

## Media Asset Handling

```js
import { mkdir, writeFile } from 'node:fs/promises';
import pLimit from 'p-limit';
import path from 'node:path';

const limit = pLimit(5);  // max 5 concurrent downloads

export async function downloadMedia(imageUrls, staticDir) {
  return Promise.all(
    imageUrls.map((url) =>
      limit(async () => {
        try {
          const res  = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const buf  = await res.arrayBuffer();
          const dest = path.join(staticDir, new URL(url).pathname);
          await mkdir(path.dirname(dest), { recursive: true });
          await writeFile(dest, Buffer.from(buf));
          return { url, status: 'ok', dest };
        } catch (err) {
          return { url, status: 'error', error: err.message };
        }
      })
    )
  );
}
```

## Front Matter Validation Schema (zod)

```js
import { z } from 'zod';

export const FrontMatterSchema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().min(1).max(160),
  date:        z.string().datetime(),
  lastmod:     z.string().datetime(),
  url:         z.string().regex(/^\/[a-z0-9\-\/]+\/$/, 'Must be lowercase, start and end with /'),
  draft:       z.boolean(),
  categories:  z.array(z.string()).optional(),
  tags:        z.array(z.string()).optional(),
  aliases:     z.array(z.string()).optional(),
});

export function validateFrontMatter(fm) {
  return FrontMatterSchema.safeParse(fm);
}
```

## Migration Report Format

Each migrated item produces a record in `migration/migration-report.json`:

```json
{
  "source_url": "/old-wordpress-slug/",
  "hugo_file": "content/posts/old-wordpress-slug.md",
  "target_url": "/old-wordpress-slug/",
  "status": "ok",
  "warnings": [],
  "timestamp": "2024-06-01T12:00:00Z"
}
```

Status values: `ok`, `warning`, `error`
Summary CSV exported to `migration/migration-report.csv` using `csv-stringify`.

## Quality Checks Before Merge

- [ ] Every migrated file passes `FrontMatterSchema` validation
- [ ] `url` values are unique across all content files (collision check)
- [ ] All `aliases` values exist in `migration/url-manifest.json`
- [ ] No broken image references in Markdown body (image path resolves under `static/`)
- [ ] `draft: false` only for items with WordPress status `publish`
- [ ] Migration report shows 0 `error`-status items before merge

## References

- [Front matter field guide](references/FRONTMATTER-GUIDE.md) — All fields, types, and validation rules
- [WordPress WXR schema](references/WXR-SCHEMA.md) — WXR field mapping to Hugo front matter
- [turndown docs](https://github.com/mixmark-io/turndown)
- [@joplin/turndown-plugin-gfm](https://github.com/laurent22/joplin/tree/dev/packages/turndown-plugin-gfm)
- [gray-matter docs](https://github.com/jonschlinkert/gray-matter)
- [fast-xml-parser docs](https://github.com/NaturalIntelligence/fast-xml-parser)
- [Hugo content management](https://gohugo.io/content-management/front-matter/)
