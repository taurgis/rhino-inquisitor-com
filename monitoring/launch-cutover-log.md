# Launch Cutover Log

- Status: `repo-ready` (awaiting Pages custom-domain switch)
- Run timestamp: `2026-07-01`
- Environment: `production`
- Commit SHA: `TBD`
- Owner: `TBD`
- T-0 window: `TBD`
- Incident bridge: `TBD`

## Timeline

| Time (UTC) | Event | Owner | Status | Notes |
| --- | --- | --- | --- | --- |
| TBD | Stub created during RHI-093 bootstrap | Migration Owner | not-started | Replace with live launch-window events. |
| 2026-07-01 | Deploy workflow re-pointed from staging to production host (`EXPECTED_PAGES_HOST: www.rhino-inquisitor.com`) | Owner | done | Indexing/robots remain gated on the live Pages custom domain; no committed flag forces production. |

## Findings

- Production artifact (auto-selected when the Pages domain equals `https://www.rhino-inquisitor.com/`) emits open `robots.txt` (`User-agent: * → Allow: /`; `Disallow:` limited to intentional AI-training bots and `/wp-json/`, `/xmlrpc.php`, `/author/`) and indexable pages (no `noindex` meta on real content; canonical points to production `www`).
- Preview artifact (any other Pages host) still ships `noindex` + `Disallow: /` — the staging safety net is intact.

## Follow-up actions

- **Operational (not code):** In GitHub repo **Settings → Pages**, set the custom domain to `www.rhino-inquisitor.com` and configure DNS (`www` CNAME → `<org>.github.io`, apex `A`/`ALIAS` → GitHub Pages IPs, apex redirects to `www`). This is the single switch that flips the pipeline to the production (indexable) artifact.
- After the domain is live: confirm `https://www.rhino-inquisitor.com/robots.txt` shows `Allow: /`, submit `sitemap.xml` in Google Search Console, and request indexing.