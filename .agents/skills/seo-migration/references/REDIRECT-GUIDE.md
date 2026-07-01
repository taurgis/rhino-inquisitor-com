# Redirect Decision Guide

## Decision Tree: Which Redirect Mechanism to Use

```
Is the original URL preserved exactly on the new site?
  └─ YES → No redirect needed. Use explicit `url` front matter.
  └─ NO  → Has the URL changed intentionally?
              └─ YES → Is this > 5% of indexed inventory?
                          └─ YES → Edge/CDN layer required (301/308).
                          └─ NO  → Hugo alias acceptable (meta-refresh).
              └─ NO  → Is there no equivalent content?
                          └─ YES → Serve 404 (or 410 via edge if available).
```

## Mechanism Reference

### Mechanism A: URL Preservation (Preferred)

Set explicit `url` front matter on the Hugo page to match the legacy WordPress path exactly.

```yaml
url: "/some-article/"
```

**Signal strength:** Full — the page is at the same URL, no redirect needed.
**Use for:** All `keep`-disposition URLs in the manifest.

### Mechanism B: Hugo Alias (Acceptable Fallback)

Add `aliases` front matter for genuinely changed or consolidated URLs.

```yaml
url: "/new-path/"
aliases: ["/old-wordpress-path/", "/another-old-variant/"]
```

Hugo generates `old-wordpress-path/index.html` containing:
```html
<meta http-equiv="refresh" content="0; url=https://www.rhino-inquisitor.com/new-path/">
<link rel="canonical" href="https://www.rhino-inquisitor.com/new-path/">
```

**Signal strength:** Moderate — Google follows meta-refresh; link equity transfer is slower than 301.
**Use for:** `merge`-disposition URLs and known legacy path variants.

### Mechanism C: Edge/CDN 301/308 (Required at Threshold)

When > 5% of indexed URLs change path, deploy edge redirect rules returning true HTTP 301/308 responses.

**Signal strength:** Strongest — equivalent to origin server 301.
**Use for:** High-value moved URLs when volume exceeds static redirect feasibility.
**Trigger:** Evaluated in Phase 6 based on Phase 1 manifest counts.

### Mechanism D: 404 (Retired Content)

Serve a 404 response. On GitHub Pages static hosting, this is the only available error code without an edge layer.

**Use for:** `retire`-disposition URLs with no equivalent content.
**Note:** 410 (Gone) is semantically preferred for permanently removed content but requires edge/CDN to emit.

## Anti-Patterns

| Pattern | Risk | Alternative |
|---------|------|-------------|
| Redirect all 404s to homepage | Mass soft-404 signal; link equity dilution | Map to nearest relevant content |
| Redirect chains (A→B→C) | Dilutes signal; slower for Googlebot | Map A directly to final destination C |
| Alias for URL that already exists | Collision error in Hugo build | Check manifest for duplicate paths |
| Canonical-only "redirect" (no HTML/redirect page) | Googlebot may not follow canonical as redirect | Use alias HTML redirect page |
| Remove redirects after 6 months | Breaks inbound links and bookmarks | Keep for minimum 12 months |

## Redirect QA Checklist

Before any redirect mapping is merged:
- [ ] Source URL exists in `migration/url-manifest.json` with documented disposition
- [ ] Target URL exists in Hugo output (`public/` artifact)
- [ ] No redirect chain: source resolves in one hop to final canonical URL
- [ ] Alias page excluded from `sitemap.xml`
- [ ] Target URL has correct canonical pointing to itself
- [ ] For `merge`: written rationale and SEO owner approval recorded

## Edge Redirect Activation Decision

Evaluate after Phase 4 content import is complete:

```
Count of URLs where path changed (disposition ≠ keep) / Total indexed URLs
  > 5%  → Activate edge redirect layer before launch (Phase 7 dependency)
  ≤ 5%  → Hugo aliases acceptable; document risk acceptance
```

Record decision with owner sign-off in `migration/redirect-architecture-decision.md`.

## Official References

- https://developers.google.com/search/docs/crawling-indexing/301-redirects
- https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- https://httpwg.org/specs/rfc9110.html#status.301
