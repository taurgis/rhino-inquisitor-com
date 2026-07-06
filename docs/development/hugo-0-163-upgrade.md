# Hugo Extended upgrade: 0.157.0 → 0.163.3

## Change summary

The pinned Hugo Extended version moved from `0.157.0` to `0.163.3` (latest
stable release, 2026-06-18) in `HUGO_VERSION` in
`.github/workflows/deploy-pages.yml`. `README.md` and the local install
flow pick the new version up automatically because both read the CI pin
(`scripts/install-hugo.sh` parses the workflow file).

## Why this changed

The pin had fallen six minor releases behind the latest stable Hugo.
Staying near current keeps security fixes and rendering improvements
flowing and avoids a larger, riskier multi-version jump later.

## Behavior details

| Aspect | Old | New |
|--------|-----|-----|
| `HUGO_VERSION` (CI + local install) | `0.157.0` | `0.163.3` |
| CI binary cache key | `~/.cache/hugo/0.157.0` | `~/.cache/hugo/0.163.3` (new cache entry populated on first run) |

No template, config, or content changes were required for the upgrade.

## Impact

- **CI**: the first deploy after this change re-downloads the Hugo binary
  (cache miss on the new version key); subsequent runs hit the cache.
- **Contributors / agents**: re-run `scripts/install-hugo.sh` to pick up
  the new pinned version locally.
- **Site output**: verified against the production build gate (see below).

## Verification

Steps (per `hugo-coding-standards` validation requirements):

1. `scripts/install-hugo.sh` installs Hugo Extended 0.163.3 (source-build
   fallback via the Go module proxy in sandboxed sessions).
2. `npm run build:prod` must succeed with the new binary — zero build
   errors.
3. `npm run check:url-parity` must pass against the freshly built
   `public/` (URL parity gate).

Status: verification running in the upgrade session; results recorded in
the follow-up commit that finalizes this document.

## Related files

- `.github/workflows/deploy-pages.yml` — `HUGO_VERSION` pin.
- `README.md` — Local Prerequisites version reference.
- `scripts/install-hugo.sh` — reads the pin; no change needed.
- `docs/development/hugo-local-install.md` — install flow documentation.
