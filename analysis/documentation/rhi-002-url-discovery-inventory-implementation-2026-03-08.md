# RHI-002 URL Discovery and Inventory Implementation - 2026-03-08

## Change summary
Implemented the URL discovery pipeline for Phase 1 ticket RHI-002 by replacing the bootstrap stubs in the sitemap parser and crawler scripts with production behavior.

## Why this changed
RHI-002 is the source-of-truth input for URL classification (RHI-004) and SEO baseline work (RHI-005). Without a complete and validated inventory, downstream URL disposition decisions can miss live routes.

## Behavior details
Old behavior:
- `scripts/parse-sitemap.js` and `scripts/crawl-urls.js` were stubs and did not generate inventory artifacts.
- `migration/` did not contain URL inventory outputs.

New behavior:
- `scripts/parse-sitemap.js` now fetches and parses `sitemap_index.xml`, validates required sitemap files, parses URL entries via `fast-xml-parser`, validates records with `zod`, and writes:
  - `migration/url-inventory.sitemaps.raw.json`
  - `migration/url-discovery.sitemaps.summary.json`
  - `migration/url-inventory.raw.json` (sitemap-only baseline)
- `scripts/crawl-urls.js` now:
  - Loads sitemap records.
  - Builds non-sitemap seeds (homepage/archive/category/recent posts/footer and utility candidates).
  - Probes required system routes, including `/author/admin/` and `/author/thomas-theunen/`.
  - Runs depth-limited internal crawl (default depth 2).
  - Probes HTTP status and redirect destination for unique URLs.
  - Produces final artifacts:
    - `migration/url-inventory.raw.json` (pre-normalization with provenance)
    - `migration/url-inventory.normalized.json` (deduplicated normalized URLs with consolidated source list)
    - `migration/url-discovery.crawl.summary.json`

## Impact
- Phase 1 now has executable URL discovery tooling for RHI-002 acceptance checks.
- Inventory outputs now include required schema fields, source provenance, and normalized dedupe records needed by RHI-004.
- Search Console enrichment fields (`has_external_links`, `has_organic_traffic`) are currently `null` until API/CSV data is available.

## Verification
Executed and verified:
- `npm run phase1:parse-sitemap`
- `npm run phase1:crawl-urls`
- Record count checks: raw >= 200 and normalized >= 195
- Raw field coverage check for all required keys
- Required sitemap coverage check (all 5 named sitemap files present)
- Normalized uniqueness check (one record per normalized URL)
- Required system route presence check
- Normalization invariant check (canonical `www` host, lowercase path, trailing slash policy)

Observed run output:
- Sitemap parse: 200 raw entries, 195 unique normalized URLs from sitemap set
- Full crawl run: 1360 raw records, 1113 normalized records

## Related files
- `scripts/parse-sitemap.js`
- `scripts/crawl-urls.js`
- `migration/url-inventory.sitemaps.raw.json`
- `migration/url-discovery.sitemaps.summary.json`
- `migration/url-discovery.crawl.summary.json`
- `migration/url-inventory.raw.json`
- `migration/url-inventory.normalized.json`
- `analysis/tickets/phase-1/RHI-002-url-discovery-inventory.md`

## Official references used
- Sitemap protocol: https://www.sitemaps.org/protocol.html
- Google sitemap guidance: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google sitemap index guidance: https://developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps
- HTTP semantics (301/308/404/410): https://www.rfc-editor.org/rfc/rfc9110
- Google HTTP status handling: https://developers.google.com/crawling/docs/troubleshooting/http-status-codes
- Search Console Performance report: https://support.google.com/webmasters/answer/7576553
- Search Console Links report: https://support.google.com/webmasters/answer/9049606
