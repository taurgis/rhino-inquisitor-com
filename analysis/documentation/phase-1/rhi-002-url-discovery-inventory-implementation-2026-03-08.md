# RHI-002 URL Discovery and Inventory Implementation - 2026-03-08

## Change summary
Implemented the URL discovery and Search Console enrichment pipeline for Phase 1 ticket RHI-002 by replacing bootstrap stubs and adding CSV-based enrichment behavior.

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
- `scripts/enrich-search-console.js` now:
  - Reads Search Console CSV exports from `tmp/search-console/`
  - Detects the traffic pages export and top target pages links exports
  - Normalizes Search Console URLs using the same canonical URL rules as inventory generation
  - Enriches fields:
    - `has_organic_traffic`: `true` when Search Console clicks/impressions are present, otherwise `false`
    - `has_external_links`: `true` for URLs present in top target pages export, otherwise remains `null`
  - Adds Search Console-only URLs missing from the inventory (with source provenance) so they are not lost before classification
  - Writes:
    - `migration/url-inventory.raw.json`
    - `migration/url-inventory.normalized.json`
    - `migration/url-discovery.search-console.summary.json`
    - `migration/url-discovery.search-console.gaps.json`

## Impact
- Phase 1 now has executable URL discovery tooling for RHI-002 acceptance checks.
- Inventory outputs now include required schema fields, source provenance, and normalized dedupe records needed by RHI-004.
- Search Console enrichment is now applied from CSV exports and has expanded inventory coverage with Search Console-only URLs.
- `has_external_links` remains `null` for URLs not present in top-target-links export because available links data is top-N (not exhaustive).

## Verification
Executed and verified:
- `npm run phase1:parse-sitemap`
- `npm run phase1:crawl-urls`
- `npm run phase1:enrich-search-console`
- Record count checks: raw >= 200 and normalized >= 195
- Raw field coverage check for all required keys
- Required sitemap coverage check (all 5 named sitemap files present)
- Normalized uniqueness check (one record per normalized URL)
- Required system route presence check
- Normalization invariant check (canonical `www` host, lowercase path, trailing slash policy)
- Enrichment field population check (`has_organic_traffic`, `has_external_links`)
- Search Console gap report check (SC URLs not in inventory before enrichment)

Observed run output:
- Sitemap parse: 200 raw entries, 195 unique normalized URLs from sitemap set
- Full crawl run: 1360 raw records, 1113 normalized records
- Search Console enrichment run: 1446 raw records, 1199 normalized records
- Search Console-only normalized URLs added: 86
- Enrichment population: `has_organic_traffic` true=320, false=879, null=0; `has_external_links` true=36, null=1163

## Related files
- `scripts/parse-sitemap.js`
- `scripts/crawl-urls.js`
- `scripts/enrich-search-console.js`
- `migration/url-inventory.sitemaps.raw.json`
- `migration/url-discovery.sitemaps.summary.json`
- `migration/url-discovery.crawl.summary.json`
- `migration/url-inventory.raw.json`
- `migration/url-inventory.normalized.json`
- `migration/url-discovery.search-console.summary.json`
- `migration/url-discovery.search-console.gaps.json`
- `analysis/tickets/phase-1/RHI-002-url-discovery-inventory.md`

## Official references used
- Sitemap protocol: https://www.sitemaps.org/protocol.html
- Google sitemap guidance: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google sitemap index guidance: https://developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps
- HTTP semantics (301/308/404/410): https://www.rfc-editor.org/rfc/rfc9110
- Google HTTP status handling: https://developers.google.com/crawling/docs/troubleshooting/http-status-codes
- Search Console Performance report: https://support.google.com/webmasters/answer/7576553
- Search Console Links report: https://support.google.com/webmasters/answer/9049606
