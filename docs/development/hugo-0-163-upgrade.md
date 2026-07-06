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
| `hugo.toml` language key | `languageCode = "en-us"` | `locale = "en-us"` (`languageCode` deprecated in Hugo 0.158) |
| Template language access | `.Site.LanguageCode` / `site.Language.LanguageCode` in `baseof.html`, `alias.html`, `home.rss.xml` | `.Site.Language.Locale` / `site.Language.Locale` |
| Data access in `seo/resolve.html` | `.Site.Data.categoryDescriptions` (`.Site.Data` deprecated in Hugo 0.156) | `hugo.Data.categoryDescriptions` |

The first 0.163.3 build surfaced four deprecation warnings (three template,
one config). All were fixed as part of this upgrade; the rendered output is
byte-identical for the affected values (`<html lang=en-us>`, RSS
`<language>en-us</language>`, category term meta descriptions from
`categoryDescriptions.toml`). The `hugo-development` skill's config
examples were updated to match (`locale` key, current version pin).

## Impact

- **CI**: the first deploy after this change re-downloads the Hugo binary
  (cache miss on the new version key); subsequent runs hit the cache.
- **Contributors / agents**: re-run `scripts/install-hugo.sh` to pick up
  the new pinned version locally.
- **Site output**: verified against the production build gate (see below).

## Verification

Performed 2026-07-06 (per `hugo-coding-standards` validation
requirements), all passing:

1. `scripts/install-hugo.sh` installed Hugo Extended 0.163.3 (source-build
   fallback via the Go module proxy in the sandboxed session);
   `hugo version` reports `v0.163.3+extended`.
2. `npm run build:prod` succeeds — 376 pages, zero errors, zero
   deprecation warnings after the fixes above.
3. `npm run check:url-parity` — 1224 rows, 0 failures, 0 blocking
   failures.
4. `npm run validate:frontmatter` — 197 files pass.
5. Sitemap output intact: `sitemap.xml` index with 5 child sitemaps
   (151 posts, 21 pages, 14 categories, plus image/video sitemaps).
6. Output spot-checks byte-identical to the 0.157.0-era baseline for
   `<html lang>`, RSS `<language>`, and category meta descriptions.

## Related files

- `.github/workflows/deploy-pages.yml` — `HUGO_VERSION` pin.
- `README.md` — Local Prerequisites version reference.
- `scripts/install-hugo.sh` — reads the pin; no change needed.
- `docs/development/hugo-local-install.md` — install flow documentation.
- `hugo.toml` — `languageCode` → `locale`.
- `src/layouts/_default/baseof.html`, `src/layouts/alias.html`,
  `src/layouts/home.rss.xml` — language template deprecations.
- `src/layouts/partials/seo/resolve.html` — `.Site.Data` → `hugo.Data`.
- `.agents/skills/hugo-development/SKILL.md` and
  `assets/hugo-toml-template.toml` — config examples updated to match.
