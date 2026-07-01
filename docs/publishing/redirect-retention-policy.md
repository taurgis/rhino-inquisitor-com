# Redirect Retention Policy

This document is the living record of the redirect-retention posture carried forward after the WordPress → Hugo migration. It is referenced by the redirect-quality gate (`scripts/phase-8/check-redirect-quality.js`) as retention-policy evidence.

## Policy

- Redirects and aliases established during the migration are retained for **at least 12 months** from launch, and indefinitely for any URL with organic search value.
- Redirect sources of truth remain committed in the repository:
  - `migration/url-manifest.json` — URL disposition (keep / merge / retire)
  - `migration/url-map.csv` — source → destination redirect map
  - `migration/phase-5-redirect-signal-matrix.csv` — per-URL redirect signal expectations
- The URL-parity and redirect-integrity gates run on every route-sensitive change and on deploy. They must not be weakened; they protect the redirects and canonical signals set up during migration.

## Verification

- `npm run check:url-parity` and `npm run check:redirects:seo` — route/redirect integrity.
- `npm run check:redirect-quality` — redirect-quality gate (reads this document as retention evidence).
- Full deploy gate suite: `npm run gates:local`.
