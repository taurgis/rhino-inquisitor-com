# Deploy gate matrix optimization

## Change summary

`deploy-pages.yml` previously ran five separate, near-identical gate jobs
(`gate_url`, `gate_seo`, `gate_a11y`, `gate_security`, `gate_perf`). They were
consolidated into a single matrixed `gates` job, and per-job setup was trimmed.

## Old vs new behavior

| Aspect | Old | New |
|--------|-----|-----|
| Gate jobs | 5 hand-copied jobs (~170 lines) | 1 `gates` job with `strategy.matrix` over `url`, `seo`, `security`, `a11y`, `perf` |
| Playwright install | Installed in every gate job **and** `build_site` | Installed only for `a11y` and `perf` (matrix `browser: true`) — the only groups whose gates drive a browser |
| Playwright browsers | Re-downloaded every run | Cached at `~/.cache/ms-playwright`, keyed on `package-lock.json` |
| Dependency cache | Cached `~/.npm` **and** `node_modules` | Caches `~/.npm` only (`npm ci` deletes `node_modules`, so restoring it was wasted I/O) |
| Dead config | `CANONICAL_PRODUCTION_BASE_URL` env declared but unused | Removed (the gate runner hardcodes its own canonical base URL) |
| Shared setup | Node setup + npm cache + `npm ci` hand-copied per job | Extracted to composite action `.github/actions/setup-node-env` |
| Perf gate Chrome | LHCI launched Playwright Chromium with the default sandbox → `No usable sandbox!` on Ubuntu runners | `lighthouserc.json` collect settings now pass `chromeFlags: "--no-sandbox --disable-dev-shm-usage"` |

Gate coverage, ordering guarantees, and the deploy contract are unchanged:
`deploy` still depends on `build_site` + all gate legs, and the official
`configure-pages` → `upload-pages-artifact` → `deploy-pages` triple with
`concurrency: { group: pages, cancel-in-progress: false }` is preserved.

## Impact and verification

- Impacted workflow: `.github/workflows/deploy-pages.yml`.
- Gate logic itself is untouched — the browser-need split was verified against
  `scripts/gates/run-all-gates.sh` group assignments (only `check:accessibility`
  and `check:perf:gate` load Playwright/LHCI).
- **Action required after merge:** branch-protection required status checks
  changed name from `gate_url` / `gate_seo` / … to `gate (url)` / `gate (seo)` /
  `gate (security)` / `gate (a11y)` / `gate (perf)`. Update the required checks in
  repository Settings → Branches, or protection will stop enforcing them.
- Verify by opening the next `main` deploy run: confirm the five matrix legs
  appear, `url`/`seo`/`security` skip the Playwright install step, and `deploy`
  runs only after all legs pass.

## Follow-up: perf gate CLS blocker

After the matrix change the perf gate ran but failed its Lighthouse assertion:
`/category/ai/` scored a mobile median of ~0.76–0.78 (e.g. runs `1, 0.78, 0.78`)
against `categories:performance minScore 0.9`, from an intermittent ~0.5
Cumulative Layout Shift on archive/section/taxonomy pages.

Root cause (bisected, not fonts): the site inlines a per-type critical stylesheet
(`critical-archive.css`) and loads the full `site.css` asynchronously
(`preload` + `onload` swap). After the "Paper & Ink" redesign the inlined critical
CSS drifted out of sync with the full stylesheet — confirmed by 73 divergent
`:root` design tokens plus structural differences in the archive controls. When
the async `site.css` applied after first paint it re-laid-out the above-the-fold
search/filter area (search bar `399px → 44px`, filter panel `0 → 269px`), producing
the shift. A Playwright bisect under network throttling isolated it: blocking
`site.css` → CLS 0.000; blocking fonts or `archive-search.js` → shift persisted.

The same drift also affected posts (`critical-post.css`; shift source
`.page-article--single`). Home was clean.

Fix — regenerate the critical CSS from the rendered site. Added
`scripts/generate-critical-css.js` (npm: `generate:critical-css`), a penthouse
extractor that, from a representative built page of each type (home / archive /
post) at both mobile (390px) and desktop (1280px) widths, re-extracts the
above-the-fold subset of the full `site.css` into
`src/assets/styles/critical-{home,archive,post}.css`. penthouse strips
`@font-face`, so `stylesheet.html` still prepends the self-hosted `fonts.css`
fragment to the inline critical block. The layout partial was simplified to inline
`fonts + critical-{type}.css` and async-swap the full stylesheet for every page
type (the render-blocking interim and the old hand-maintained header/structure
concat were removed — penthouse already captures those above-the-fold rules).

Because the critical files are now generated from `site.css`, they carry the
current design tokens and layout automatically and cannot silently drift again;
rerun `npm run generate:critical-css` after a build whenever the design changes.

Verified locally (Playwright network+CPU throttle, 5 runs each, and the full perf
gate): home / archive / post all CLS ~0 on the async inline-critical path; all URLs
pass the perf gate with `Blocking failures: 0` and no FCP regression.

Regeneration workflow:

1. `npm run build:prod` (produces `public/` + the fingerprinted `site.min.*.css`).
2. `npm run generate:critical-css` (rewrites the three `critical-*.css` files).
3. `npm run build:prod` again and commit the regenerated critical files.

## Follow-up: canonical-alignment gate false positive on paginated routes

After `8469a0b` ("Standardize canonical domain to apex") the `url` gate's
canonical-alignment check began failing with 16 mismatches — every one a
paginated archive view (`/posts/page/2…16/`, `/pages/page/2/`) reported as an
"indexable HTML page missing from sitemap.xml." No content change caused it.

Root cause: the gate's skip clause for paginated routes only excluded them when
they were **not** self-canonical:

```js
const selfCanonical = record.canonical === record.url;
if (!selfCanonical && /\/page\/\d+\/$/u.test(route)) { continue; }
```

The gate helper `canonicalOrigin` was previously `https://www.rhino-inquisitor.com`
while the site already emitted apex canonicals, so `record.url` (www) never equalled
`record.canonical` (apex) — `selfCanonical` was always `false` and the clause
silently skipped every pagination page. Standardizing the helper to the apex origin
made the comparison genuinely equal, `selfCanonical` became `true`, and the clause
stopped firing.

The paginated pages are correct as-is: `index, follow`, self-canonical (Hugo
convention and Google's post-2019 guidance to self-canonicalize paged views rather
than point them at page 1), and intentionally excluded from the content sitemaps.
Their absence from `sitemap.xml` is expected, so the gate assumption was stale.

The same stale assumption lived in four gate scripts across the `url`, `seo`, and
`security` gates — all keyed to the www/apex mismatch that previously masked it.
Once the origins aligned, every one began flagging paginated routes:

| Script | Gate | Old | New |
|--------|------|-----|-----|
| `scripts/gates/generate-canonical-alignment-report.js` | url | Skipped paginated routes only when `!selfCanonical` | Skips all `/page/N/` routes; unused `selfCanonical` removed |
| `scripts/seo/check-metadata.js` | security (host-protocol) | Flagged self-canonical paginated routes as missing from sitemap | Exempts `/page/N/` from both the canonical-match and sitemap-membership checks |
| `scripts/gates/check-seo-consistency.js` | seo | "Expected route is missing from sitemap.xml" on paginated routes | Adds `!isPaginationRoute(...)` guard |
| `scripts/seo/check-sitemap.js` | security | Flagged paginated routes as missing, and counted them in the sitemap/metadata size delta | Skips `/page/N/` in the per-route loop and excludes them from the count delta |

Gate result on `main`: FAIL (16 canonical-alignment mismatches, 16 host-protocol
metadata failures, 1 seo-consistency blocking finding, 16 sitemap-inventory
failures + a count-delta failure) → PASS across all four scripts.

Verification: `hugo --minify --environment production`, then
`npm run check:canonical-alignment`, `npm run check:metadata && npm run check:sitemap`,
`npm run check:seo-consistency`, and `npm run check:host-protocol` — all exit 0
("Mismatch rows: 0", "223 indexable page(s)", "186 sitemap URL(s)", "Blocking
failures: 0"). Content, sitemaps, and the pages' canonical tags are unchanged.

Related files: `scripts/gates/generate-canonical-alignment-report.js`,
`scripts/seo/check-metadata.js`, `scripts/gates/check-seo-consistency.js`,
`scripts/seo/check-sitemap.js`.

## Follow-up: SEO smoke check missed `@graph`-nested JSON-LD

The SEO smoke check (`scripts/check-seo.js`, "Run SEO smoke check" step) failed the
homepage with `missing WebSite JSON-LD on homepage (schema types: none; raw WebSite
marker: present)`. The homepage schema is now emitted as a single
`{ "@context", "@graph": [...] }` container, so the WebSite node lives inside
`@graph` rather than at the top level.

The newer `scripts/seo/check-schema.js` gate already understands `@graph` (it passed
for all 257 pages), but the smoke check's `findSchema`/`flattenSchemaTypes` helpers
only inspected top-level `@type`, so they reported zero schema types even though the
raw marker was present.

Fix — old vs new behavior:

| Aspect | Old | New |
|--------|-----|-----|
| `findSchema` / `flattenSchemaTypes` | Only read top-level `@type` on each JSON-LD block | Also descend into a block's `@graph` array |
| Homepage smoke check | FAIL — WebSite reported missing | PASS |

The `@graph` descent also feeds the negative assertions (e.g. "WebSite emitted on
article page"); the full run stays green across all 223 indexable routes, so those
still hold.

Verification: `node scripts/check-seo.js` → "SEO validation passed for 223 indexable
route(s)", exit 0. Content and emitted JSON-LD are unchanged.

Related file: `scripts/check-seo.js`.

## Related files

- `.github/workflows/deploy-pages.yml`
- `.github/actions/setup-node-env/action.yml`
- `scripts/gates/run-all-gates.sh`
- `lighthouserc.json`
- `src/layouts/partials/site/stylesheet.html`
- `scripts/generate-critical-css.js` (+ `generate:critical-css` npm script)
- `src/assets/styles/critical-{home,archive,post}.css` (now generated, do not hand-edit)
