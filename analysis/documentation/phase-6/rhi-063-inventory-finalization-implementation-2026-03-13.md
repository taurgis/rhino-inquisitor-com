# RHI-063 Inventory Finalization Implementation

## Change summary

RHI-063 is now complete with concrete inventory-finalization artifacts. The manifest was updated to reflect the owner-approved Model A implementation-layer rules, required system and legacy sitemap routes were added, and Phase 6 now has dedicated scripts to validate the manifest and generate `migration/url-map.csv` from it.

## Why this changed

RHI-062 changed the valid launch-state inventory semantics. The manifest still contained Model B-era implementation-layer values, and RHI-063 had no committed validator or repeatable `url-map.csv` generator. Without these changes, WS-B and WS-C would consume stale inventory assumptions and Phase 6 would lack a deterministic inventory gate.

## Behavior details

Old behavior:

1. `migration/url-manifest.json` still contained `edge-cdn` rows even though launch now uses Model A.
2. Query-string `merge` routes still carried `pages-static` even though Hugo aliases cannot serve query-string sources.
3. Required system routes and legacy sitemap surfaces were not fully represented in the manifest.
4. `migration/url-map.csv` and `validate:url-inventory` did not have a committed Phase 6 implementation path.

New behavior:

1. Path-based legacy merge routes previously marked `edge-cdn` are now classified as `pages-static` per the owner-approved Model A inventory rule.
2. Query-string legacy merge routes now use `implementation_layer: none` to reflect accepted unsupported-at-launch scope under Model A.
3. Explicit records now exist for `/rss/`, `/sitemap.xml`, `/sitemap_index.xml`, the 5 legacy WordPress sitemap shards, `/robots.txt`, `/wp-admin/`, and `/wp-login.php`.
4. `npm run validate:url-inventory` validates manifest normalization, required fields, allowed implementation-layer values, required system endpoints, and the Model A query-string rule.
5. `npm run phase6:generate-url-map` generates `migration/url-map.csv` with the columns RHI-063 requires for downstream review.
6. The RHI-063 404 criterion is satisfied by documentation and artifact evidence rather than a symbolic manifest row: existing Phase 5 implementation evidence already confirms a real `public/404.html` output and a non-indexable 404 path policy.

## Impact

1. WS-A now has a real validation gate instead of relying on ad hoc inspection.
2. WS-B and WS-C can consume a current `migration/url-map.csv` generated from the post-RHI-062 manifest state.
3. The manifest no longer advertises `edge-cdn` launch behavior that the ADR explicitly rejected.
4. RHI-063 can now close without leaving undocumented legacy sitemap XML endpoints behind.

## Verification

1. Re-audited sitemap, Search Console top-200, and backlink inputs against the manifest before editing.
2. Confirmed sitemap coverage and backlink coverage were complete.
3. Confirmed the only Search Console misses were already-covered PDF compatibility assets whose file paths should not be slash-normalized.
4. Run `npm run validate:url-inventory` after the manifest and script changes.
5. Run `npm run phase6:generate-url-map` and confirm `migration/url-map.csv` is regenerated from the committed manifest.
6. Reconcile the closeout ticket against existing Phase 5 404 evidence in `analysis/documentation/phase-5/rhi-048-metadata-canonical-architecture-implementation-2026-03-12.md` and the related Phase 5 policy files before marking the ticket Done.

## Related files

1. `migration/url-manifest.json`
2. `migration/url-map.csv`
3. `scripts/phase-6/validate-url-inventory.js`
4. `scripts/phase-6/generate-url-map.js`
5. `package.json`
6. `analysis/tickets/phase-6/RHI-063-legacy-url-inventory-finalization.md`