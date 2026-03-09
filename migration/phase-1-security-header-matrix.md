# Phase 1 Security Header Matrix

Date captured: 2026-03-09
Method: `curl -sSI <url>`

## Scope

- Homepage HTML: `https://www.rhino-inquisitor.com/`
- Representative post HTML: `https://www.rhino-inquisitor.com/swc-and-storybook-error-failed-to-load-native-binding/`
- Non-HTML resource: `https://www.rhino-inquisitor.com/sitemap_index.xml`

## Header matrix

| URL | Content-Security-Policy | Strict-Transport-Security | X-Frame-Options | X-Content-Type-Options | Referrer-Policy | Permissions-Policy | X-Robots-Tag |
|---|---|---|---|---|---|---|---|
| https://www.rhino-inquisitor.com/ | (not present) | (not present) | (not present) | (not present) | (not present) | (not present) | (not present) |
| https://www.rhino-inquisitor.com/swc-and-storybook-error-failed-to-load-native-binding/ | (not present) | (not present) | (not present) | (not present) | (not present) | (not present) | (not present) |
| https://www.rhino-inquisitor.com/sitemap_index.xml | (not present) | (not present) | (not present) | (not present) | (not present) | (not present) | (not present) |

## Notes

- This is a baseline capture only. Missing headers are not treated as a Phase 1 blocker.
- Hardening actions are expected in launch/security workstreams (Phase 7+).
