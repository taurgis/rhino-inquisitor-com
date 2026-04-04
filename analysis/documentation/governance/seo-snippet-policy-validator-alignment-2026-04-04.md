# SEO Snippet Policy Validator Alignment - 2026-04-04

## Change summary

Updated the general SEO artifact validator so explicit snippet-policy coverage is enforced in both the crawl-control gate and the broader SEO artifact gate.

## Why this changed

The repository already emitted an explicit discovery-friendly snippet policy for indexable production HTML pages, and `npm run check:crawl-controls` already enforced those tokens. The broader `scripts/check-seo.js` validator still treated the robots meta tag as present-or-missing only, which left a gap where a snippet-policy regression could evade the general SEO artifact check.

## Behavior details

Old behavior:

- `scripts/check-seo.js` required indexable pages to emit a `meta[name="robots"]` tag but did not assert the explicit snippet-policy tokens.
- `scripts/seo/check-crawl-controls.js` enforced the open snippet policy on production indexable routes, so snippet-policy coverage existed only in the crawl-control gate.

New behavior:

- `scripts/check-seo.js` now tokenizes the robots meta content for every indexable page it validates.
- When a page does not opt into `nosnippet`, the validator now requires `max-snippet:-1`, `max-image-preview:large`, and `max-video-preview:-1`.
- Pages that intentionally emit `nosnippet` remain valid without the open snippet-policy tokens.

## Impact

- The explicit snippet-policy contract is now checked by both SEO artifact validation paths instead of only by crawl-control validation.
- Maintainers get earlier detection if a template or metadata change drops one of the expected production snippet tokens.
- The validator still allows route-specific restrictive overrides through `nosnippet` without creating a false failure.

## Verification

- Run `npm run check:seo:artifact` and confirm the current production artifact passes with the new snippet-policy assertion in place.
- Run `npm run check:crawl-controls` and confirm the crawl-control gate still reports the same snippet-policy expectations.
- If a route intentionally switches to `nosnippet`, confirm `npm run check:seo:artifact` still passes without the open snippet tokens on that route.

## Related files

- `scripts/check-seo.js`
- `scripts/seo/check-crawl-controls.js`
- `analysis/documentation/phase-5/llms-txt-and-geo-discovery-2026-04-04.md`
