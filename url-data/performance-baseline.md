# Phase 1 Performance and UX Baseline

Date captured: 2026-03-09
Method: Lighthouse CLI (lab metrics + category scores), CrUX API (field metrics), HTML quick-pass probes

## Immutability note

This report is a pre-migration baseline snapshot. After owner sign-off, do not overwrite historical values in this file. Add dated comparison notes instead.

## Representative URL set

| Template | URL | Selection rule |
|---|---|---|
| homepage | https://www.rhino-inquisitor.com/ | Fixed homepage URL from ticket AC |
| recent_article | https://www.rhino-inquisitor.com/lag-to-riches-a-pwa-kit-developers-guide/ | Highest non-homepage URL by clicks from 28-day RHI-005 export (migration/phase-1-seo-baseline.md) |
| archive | https://www.rhino-inquisitor.com/archive/ | Fixed archive URL from ticket AC |
| category | https://www.rhino-inquisitor.com/category/salesforce-commerce-cloud/ | Fixed category URL from ticket AC |
| video | https://www.rhino-inquisitor.com/sfcc-introduction/ | Fixed video URL from ticket AC |

## Baseline metrics (lab + field)

| Template | Device | Measured URL | Final URL | LCP (ms) | INP (ms) | FID fallback (ms) | CLS | TTFB (ms) | Total KB | JS KB | Image KB | Perf | A11y | BP | SEO | CrUX scope | CrUX query | CrUX LCP p75 | CrUX INP p75 | CrUX CLS p75 | CrUX TTFB p75 | CrUX period | Notes |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|---:|---:|---:|---:|---|---|
| homepage | mobile | https://www.rhino-inquisitor.com/ | https://www.rhino-inquisitor.com/ | 3797 | n/a | 24 | 0 | 26 | 405.9 | 53.6 | 171.5 | 86 | 95 | 100 | 100 | origin-aggregate | https://www.rhino-inquisitor.com | 1708 | 49 | 0.01 | n/a | 2026-02-08 to 2026-03-07 | URL-level and form-factor origin CrUX data unavailable; used aggregate origin data (no form factor) |
| homepage | desktop | https://www.rhino-inquisitor.com/ | https://www.rhino-inquisitor.com/ | 889 | n/a | 16 | 0 | 22 | 469.5 | 53.6 | 234.8 | 99 | 91 | 100 | 100 | origin | https://www.rhino-inquisitor.com | 1514 | 41 | 0.02 | n/a | 2026-02-08 to 2026-03-07 | URL-level CrUX data unavailable; used origin-level data |
| recent_article | mobile | https://www.rhino-inquisitor.com/lag-to-riches-a-pwa-kit-developers-guide/ | https://www.rhino-inquisitor.com/lag-to-riches-a-pwa-kit-developers-guide/ | 5786 | n/a | 31 | 0 | 35 | 535.4 | 68.4 | 226.1 | 69 | 92 | 100 | 100 | origin-aggregate | https://www.rhino-inquisitor.com | 1708 | 49 | 0.01 | n/a | 2026-02-08 to 2026-03-07 | URL-level and form-factor origin CrUX data unavailable; used aggregate origin data (no form factor) |
| recent_article | desktop | https://www.rhino-inquisitor.com/lag-to-riches-a-pwa-kit-developers-guide/ | https://www.rhino-inquisitor.com/lag-to-riches-a-pwa-kit-developers-guide/ | 1231 | n/a | 16 | 0.002 | 27 | 535 | 68.4 | 226.1 | 96 | 87 | 100 | 100 | origin | https://www.rhino-inquisitor.com | 1514 | 41 | 0.02 | n/a | 2026-02-08 to 2026-03-07 | URL-level CrUX data unavailable; used origin-level data |
| archive | mobile | https://www.rhino-inquisitor.com/archive/ | https://www.rhino-inquisitor.com/archive/ | 3988 | n/a | 40 | 0.099 | 38 | 1093 | 34.8 | 489.3 | 81 | 92 | 100 | 92 | origin-aggregate | https://www.rhino-inquisitor.com | 1708 | 49 | 0.01 | n/a | 2026-02-08 to 2026-03-07 | URL-level and form-factor origin CrUX data unavailable; used aggregate origin data (no form factor) |
| archive | desktop | https://www.rhino-inquisitor.com/archive/ | https://www.rhino-inquisitor.com/archive/ | 1205 | n/a | 16 | 0.017 | 35 | 1038.8 | 34.8 | 427.5 | 96 | 88 | 100 | 92 | origin | https://www.rhino-inquisitor.com | 1514 | 41 | 0.02 | n/a | 2026-02-08 to 2026-03-07 | URL-level CrUX data unavailable; used origin-level data |
| category | mobile | https://www.rhino-inquisitor.com/category/salesforce-commerce-cloud/ | https://www.rhino-inquisitor.com/category/salesforce-commerce-cloud/ | 4450 | n/a | 41 | 0 | 27 | 1239.1 | 34.8 | 877.4 | 78 | 94 | 100 | 92 | origin-aggregate | https://www.rhino-inquisitor.com | 1708 | 49 | 0.01 | n/a | 2026-02-08 to 2026-03-07 | URL-level and form-factor origin CrUX data unavailable; used aggregate origin data (no form factor) |
| category | desktop | https://www.rhino-inquisitor.com/category/salesforce-commerce-cloud/ | https://www.rhino-inquisitor.com/category/salesforce-commerce-cloud/ | 1192 | n/a | 16 | 0.029 | 25 | 1056.6 | 0 | 723.6 | 97 | 89 | 100 | 92 | origin | https://www.rhino-inquisitor.com | 1514 | 41 | 0.02 | n/a | 2026-02-08 to 2026-03-07 | URL-level CrUX data unavailable; used origin-level data |
| video | mobile | https://www.rhino-inquisitor.com/sfcc-introduction/ | https://www.rhino-inquisitor.com/sfcc-introduction/ | 3881 | n/a | 26 | 0 | 22 | 1363 | 754 | 55.3 | 83 | 92 | 96 | 100 | origin-aggregate | https://www.rhino-inquisitor.com | 1708 | 49 | 0.01 | n/a | 2026-02-08 to 2026-03-07 | URL-level and form-factor origin CrUX data unavailable; used aggregate origin data (no form factor) |
| video | desktop | https://www.rhino-inquisitor.com/sfcc-introduction/ | https://www.rhino-inquisitor.com/sfcc-introduction/ | 1299 | n/a | 16 | 0.002 | 21 | 1417.3 | 802 | 69.9 | 95 | 88 | 96 | 100 | origin | https://www.rhino-inquisitor.com | 1514 | 41 | 0.02 | n/a | 2026-02-08 to 2026-03-07 | URL-level CrUX data unavailable; used origin-level data |

## Accessibility quick-pass

| Template | URL | Landmarks (`main`, `nav`, `header`, `footer`) | Heading hierarchy starts at h1 and no skips | Missing alt images | Keyboard nav spot-check | Notes |
|---|---|---|---|---:|---|---|
| homepage | https://www.rhino-inquisitor.com/ | fail | pass | 2 | pass | Keyboard path is a static HTML spot-check for focusable nav links; full keyboard traversal remains a manual follow-up. |
| recent_article | https://www.rhino-inquisitor.com/lag-to-riches-a-pwa-kit-developers-guide/ | pass | fail | 3 | pass | Keyboard path is a static HTML spot-check for focusable nav links; full keyboard traversal remains a manual follow-up. |
| archive | https://www.rhino-inquisitor.com/archive/ | fail | pass | 2 | pass | Keyboard path is a static HTML spot-check for focusable nav links; full keyboard traversal remains a manual follow-up. |
| category | https://www.rhino-inquisitor.com/category/salesforce-commerce-cloud/ | fail | fail | 2 | pass | Keyboard path is a static HTML spot-check for focusable nav links; full keyboard traversal remains a manual follow-up. |
| video | https://www.rhino-inquisitor.com/sfcc-introduction/ | pass | fail | 3 | pass | Keyboard path is a static HTML spot-check for focusable nav links; full keyboard traversal remains a manual follow-up. |

## Top 3 performance pain points by template

### homepage

1. LCP exceeds good threshold (3797ms); prioritize render-path and media optimization.
2. Accessibility quick-pass found issues; fix landmarks/headings/alt text/nav focus order.
3. Monitor template in Phase 3 optimization sprint; no critical blocker detected in baseline snapshot.

### recent_article

1. LCP exceeds good threshold (5786ms); prioritize render-path and media optimization.
2. Accessibility quick-pass found issues; fix landmarks/headings/alt text/nav focus order.
3. Performance score is low (69); prioritize above-the-fold critical path.

### archive

1. LCP exceeds good threshold (3988ms); prioritize render-path and media optimization.
2. Accessibility quick-pass found issues; fix landmarks/headings/alt text/nav focus order.
3. Monitor template in Phase 3 optimization sprint; no critical blocker detected in baseline snapshot.

### category

1. LCP exceeds good threshold (4450ms); prioritize render-path and media optimization.
2. Accessibility quick-pass found issues; fix landmarks/headings/alt text/nav focus order.
3. Monitor template in Phase 3 optimization sprint; no critical blocker detected in baseline snapshot.

### video

1. LCP exceeds good threshold (3881ms); prioritize render-path and media optimization.
2. JavaScript payload is heavy (802KB); defer non-critical scripts.
3. Accessibility quick-pass found issues; fix landmarks/headings/alt text/nav focus order.

## Methodology and caveats

- Lab metrics and category scores were generated with local Lighthouse CLI (mobile profile + desktop preset).
- CrUX data uses URL-level records first, then origin with form factor, then aggregate origin without form factor.
- CrUX form factors queried: `PHONE` for mobile and `DESKTOP` for desktop.
- TTFB field metric is captured from CrUX `experimental_time_to_first_byte` when available.
- CrUX `NOT_FOUND` is treated as a valid no-data condition per official docs, not a script failure.
- Accessibility quick-pass is a lightweight static check; full keyboard traversal and WCAG conformance remain out of scope for this ticket.
- Raw Lighthouse JSON snapshots are stored in `tmp/phase-1-perf-baseline/` for audit traceability.
