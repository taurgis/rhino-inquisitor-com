# Skip AVIF cache generation for local builds

## Change summary

`npm run build:local`, `npm run build:prod`, and `npm run dev` all ran
`generate:avif-cache` (`scripts/generate-avif-cache.js`) unconditionally before
invoking Hugo. On a cold or invalidated cache this re-encodes every source
image in `src/content/**` and `src/assets/**` into multiple AVIF variants via
`sharp`, which takes on the order of 20–30 minutes in this sandbox and made
"make a template change, rebuild, look at it" loops impractically slow. The
script now honors a `SKIP_AVIF_CACHE=1` environment variable to bypass AVIF
generation entirely, and two convenience scripts (`build:local:fast`,
`dev:fast`) set it automatically.

## Why this changed

Local iteration on templates, CSS, or content structure does not need AVIF
output to be correct — it needs the page to render. Waiting out a full AVIF
re-encode on every build for that kind of check was pure overhead.

## Behavior details

| Aspect | Old | New |
|--------|-----|-----|
| `generate:avif-cache` | Always scanned and encoded/cached every source image | Exits immediately with a log line when `SKIP_AVIF_CACHE=1` is set, before touching the filesystem or `sharp` |
| `build:local` / `build:prod` / `dev` | No way to bypass the AVIF step | Unchanged by default; set `SKIP_AVIF_CACHE=1` on any of them to skip |
| New scripts | n/a | `build:local:fast` = `SKIP_AVIF_CACHE=1 npm run build:local`; `dev:fast` = `SKIP_AVIF_CACHE=1 npm run dev` |
| Rendered output when skipped | n/a | `layouts/partials/media/image.html` looks up AVIF resources with Hugo's `resources.Get`, which returns nothing for a missing file — the `<picture><source type="image/avif">` element is simply omitted and the `<img>` (WebP or original) renders normally. No build error, no broken markup. |

The skip is intentionally scoped to the AVIF step only. Hugo's own WebP
processing (`$resource.Process`/`$resource.Resize` in `image.html`) still
runs, so images are not broken or unprocessed — they just lack the AVIF
`<source>` tier.

## Impact and verification

- Impacted components: `scripts/generate-avif-cache.js`, `package.json`
  (`build:local:fast`, `dev:fast`), `README.md` (Local Commands).
- Not impacted: `build:prod`, the deploy pipeline
  (`.github/workflows/deploy-pages.yml`), and `check:seo`/`check:perf` (which
  run `build:prod`) — none of these set `SKIP_AVIF_CACHE`, so production and
  gated builds always generate the real AVIF cache.
- Verify:
  1. `SKIP_AVIF_CACHE=1 npm run generate:avif-cache` prints the skip message
     and returns immediately (no `sharp` processing).
  2. `npm run build:local:fast` completes a full Hugo build with no errors;
     `grep -rl 'type="image/avif"' public/` returns no matches (confirmed:
     376 pages built in ~2 minutes with zero AVIF `<source>` tags emitted).
  3. `npm run build:prod` (no env var) still regenerates the AVIF cache as
     before — unaffected by this change.

## Related files

- `scripts/generate-avif-cache.js` — `SKIP_AVIF_CACHE` check in `main()`
- `package.json` — `build:local:fast`, `dev:fast` scripts
- `src/layouts/partials/media/image.html` — graceful fallback when an AVIF
  resource is missing
- `README.md` — Local Commands entry
- `AGENTS.md` — Local Hugo Setup note for future agents in this sandbox
