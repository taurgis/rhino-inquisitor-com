# Redirect Retention Policy

This document records the redirect-retention posture for the site. It is referenced by the redirect-quality gate (`scripts/gates/check-redirect-quality.js`) as retention-policy evidence.

## Policy

- Established redirects and aliases are retained for **at least 12 months**, and indefinitely for any URL with organic search value.
- Redirect sources of truth are committed in the repository:
  - `url-data/url-manifest.json` — URL disposition (keep / merge / retire)
  - `url-data/url-map.csv` — source → destination redirect map
  - `url-data/redirect-signal-matrix.csv` — per-URL redirect signal expectations
- The URL-parity and redirect-integrity gates run on every route-sensitive change and on deploy. They must not be weakened; they protect existing redirects and canonical signals.

## Verification

- `npm run check:url-parity` and `npm run check:redirects:seo` — route/redirect integrity.
- `npm run check:redirect-quality` — redirect-quality gate (reads this document as retention evidence).
- Full deploy gate suite: `npm run gates:local`.
