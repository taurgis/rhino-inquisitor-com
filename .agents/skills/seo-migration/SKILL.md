---
name: seo-migration
description: 'Technical SEO strategy, URL preservation, redirect architecture, canonical signals, structured data, and Search Console workflow for the rhino-inquisitor.com WordPress-to-Hugo migration. Use when making decisions about URL disposition (keep/merge/retire), redirect implementation, canonical tags, sitemap/robots.txt policy, JSON-LD schema, or Google Search Console actions during migration and post-launch monitoring.'
license: Forward Proprietary
compatibility: 'Hugo, GitHub Pages, Google Search Console'
---

# SEO Migration

Authoritative guidance for preserving and improving search equity across the WordPress-to-Hugo migration of rhino-inquisitor.com. Covers URL strategy, redirect architecture, canonical signals, structured data, sitemap/robots policy, and Search Console workflow.

## When to Use This Skill

- Assigning URL disposition (`keep`, `merge`, `retire`) to any discovered URL
- Deciding how to implement a redirect on GitHub Pages static hosting
- Writing or reviewing canonical tag, sitemap, or robots.txt logic
- Authoring JSON-LD structured data for article, site, or breadcrumb templates
- Planning or executing Search Console actions (sitemap submission, URL inspection)
- Evaluating whether edge/CDN redirect infrastructure is required
- Assessing SEO impact of any content, template, or routing change
- **Not for:** Hugo template syntax (use `hugo-development`) or WordPress data extraction (use `content-migration`)

## Core Risk Model for This Migration

This is a **hosting migration with URL preservation as primary goal** — not a Change of Address.

| Risk | Severity | Mitigation |
|------|----------|-----------|
| URL loss on migrated routes | Critical | Explicit `url` front matter on every page |
| Redirect quality (meta-refresh vs 301) | High | Preserve URLs; use edge layer if >5% change |
| Canonical signal misalignment | High | Align canonical tag, sitemap URL, internal links |
| Soft-404 from irrelevant redirects | High | Map to nearest relevant destination or explicit 404 |
| Duplicate indexable variants (www/apex, slash/no-slash) | High | DNS + Pages settings enforce single canonical host |
| Staging site accidentally indexed | Medium | `noindex` meta tag on staging — never rely on robots.txt alone |
| Structured data loss across templates | Medium | Template-driven JSON-LD enforced in CI smoke checks |
| Search Console verification disruption | Medium | Verify continuity method before DNS cutover |

## URL Disposition Decision Rules

Every URL in `migration/url-manifest.json` must have exactly one disposition:

| Disposition | Meaning | Required output |
|-------------|---------|----------------|
| `keep` | Path preserved exactly | Hugo page with `url` matching legacy path |
| `merge` | Content consolidated | Hugo `aliases` on target page pointing to this path |
| `retire` | No equivalent content | 404 (default) or 410 (edge layer only) |

**Approval gates:**
- `merge` requires written rationale + SEO owner approval.
- `retire` with redirect to homepage is **not allowed** for content with organic traffic.
- Pagination `keep` requires ≥ 100 clicks (90d) **or** ≥ 10 referring domains.

## Redirect Architecture Hierarchy

```
Priority 1 (strongest signal):  HTTP 301/308 — origin or edge/CDN layer
Priority 2 (acceptable fallback): Hugo alias — HTML meta-refresh + rel=canonical
Priority 3 (emergency only):    JavaScript redirect — weakest signal, avoid
```

**GitHub Pages constraint:** Pages is static hosting with no origin-level HTTP status control.
Hugo `aliases` produce meta-refresh HTML — Google follows these but they are slower to process.

**Edge redirect threshold:** If > 5% of indexed URLs change path, activate edge/CDN redirect infrastructure before launch (Phase 2 decision trigger).

**Rules:**
1. Never redirect to homepage as a catch-all for missing legacy URLs.
2. No redirect chains — every legacy URL must resolve in a single hop.
3. Keep redirects active for minimum 12 months; longer preferred.
4. Alias pages must be excluded from sitemap (verify Hugo default holds).

## Canonical Signal Alignment (All Three Must Agree)

```
rel=canonical tag  →  https://www.rhino-inquisitor.com/path/
sitemap.xml entry  →  https://www.rhino-inquisitor.com/path/
Internal links     →  /path/  (relative, resolves to www canonical)
```

**Violation patterns to catch in CI:**
- Canonical points to a different path than the page's own URL.
- Sitemap contains alias/redirect pages.
- Internal links use apex domain instead of www.
- Canonical uses HTTP instead of HTTPS.

## Structured Data Requirements

### BlogPosting (article pages)
Required fields: `headline`, `datePublished`, `dateModified`, `url`, `author`, `publisher`
Recommended: `image`, `description`, `mainEntityOfPage`

### WebSite (all pages via base template)
Required fields: `name`, `url`
Recommended: `description`, `potentialAction` (SearchAction if search exists)

### BreadcrumbList (section/article pages)
Required fields: `itemListElement` array with `@type: ListItem`, `position`, `name`, `item`

**Validation:** Test with [Google Rich Results Test](https://search.google.com/test/rich-results) and Search Console Rich Results report.

## Sitemap Policy

- `sitemap.xml` is generated by Hugo from build output only — never hand-authored.
- Must exclude: `draft: true` pages, alias redirect pages, `noindex` pages.
- Must include: all indexable posts, pages, category term pages, video pages.
- Submit to Search Console after cutover; keep old WordPress sitemap reference during transition.
- Verify sitemap URL count matches expected inventory from `migration/url-manifest.json` `keep` items.

## robots.txt Rules

```
User-agent: *
Allow: /
Disallow: /wp-json/          # Retire — system endpoint
Disallow: /xmlrpc.php
Disallow: /author/           # Retire — system endpoint
Sitemap: https://www.rhino-inquisitor.com/sitemap.xml
```

**Critical distinctions:**
- `Disallow` controls crawling, not indexing. Use `noindex` meta tag to prevent indexing.
- Never use `robots.txt` as the sole protection for staging environments.
- `noindex` in `robots.txt` is not standard and may not be respected; use `<meta name="robots" content="noindex">`.

## Core Web Vitals Thresholds (Launch Gate)

| Metric | Good (target) | Needs Improvement | Poor (blocking) |
|--------|--------------|-------------------|----------------|
| LCP | ≤ 2.5s | 2.5–4.0s | > 4.0s |
| INP | ≤ 200ms | 200–500ms | > 500ms |
| CLS | ≤ 0.1 | 0.1–0.25 | > 0.25 |

Measure at 75th percentile of field data where available; lab data (Lighthouse) as proxy during development.

## Search Console Migration Workflow

### Pre-migration
1. Confirm both Domain property and `https://www.` URL-prefix property are verified.
2. Export: top organic pages (90d), top linked pages from Links report.
3. Capture indexing baseline: Page Indexing report, Sitemap status.
4. Lower DNS TTL ≥ 1 week before cutover.

### At cutover
1. Deploy Hugo build to GitHub Pages.
2. Update DNS records; verify HTTPS issuance (can take hours).
3. Submit new sitemap URL (`https://www.rhino-inquisitor.com/sitemap.xml`).
4. Use URL Inspection to request indexing of homepage and top 10 URLs.
5. Do NOT use "Change of Address" — this applies only to domain-level moves (e.g., example.com → newdomain.com), not hosting migrations.

### Post-cutover monitoring (weeks 1–6)
1. Daily: Page Indexing report for anomalies, 404/soft-404 spikes.
2. Weekly: Coverage trend, sitemap processing status, CWV field report.
3. Priority URL Inspection sample for top 20 organic landing pages.
4. Watch for canonical drift, soft-404 clusters, unexpected de-indexing.

## Quick Reference: SEO Anti-Patterns

| ❌ Anti-pattern | ✅ Correct approach |
|----------------|-------------------|
| Redirect all missing pages to homepage | Map to nearest relevant content or serve 404 |
| Use `robots.txt Disallow` to block staging | Use `<meta name="robots" content="noindex">` |
| Set canonical to a different host variant | Canonical must match the rendered www URL |
| Submit Change of Address for hosting move | No CoA needed; just update DNS and sitemap |
| Remove old sitemaps from Search Console immediately | Keep old sitemap during transition window |
| Use `410 Gone` on Pages-only hosting | Pages cannot emit 410; use edge layer or accept 404 |
| Trust alias redirect pages as full 301 equivalents | Preserve URLs wherever possible |

## References

- [Redirect decision guide](references/REDIRECT-GUIDE.md) — When to use each redirect mechanism
- [Structured data templates](references/STRUCTURED-DATA.md) — Full schema markup examples
- [Google site move (no URL changes)](https://developers.google.com/search/docs/crawling-indexing/site-move-no-url-changes)
- [Google site move (with URL changes)](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [Google redirects guidance](https://developers.google.com/search/docs/crawling-indexing/301-redirects)
- [Google canonical consolidation](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google block indexing / noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [Google sitemaps overview](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Search Console URL Inspection](https://support.google.com/webmasters/answer/9012289)
- [Core Web Vitals](https://web.dev/articles/vitals)
