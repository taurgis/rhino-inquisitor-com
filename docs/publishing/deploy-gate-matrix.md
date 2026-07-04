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

## Update: content-only pushes skip perf + security gates

### Change summary

Publishing an article (a content-only push) ran the full gate suite even though
templates, CSS/JS bundle, redirect manifest, and host/header config were
unchanged — making the `perf` and `security` legs obsolete for that push.
`build_site` now classifies each push and emits the gate matrix dynamically, so
skipped groups do not spin up a runner at all.

### Old vs new behavior

| Aspect | Old | New |
|--------|-----|-----|
| Gate matrix | Static `include` list of all five groups every push | `strategy.matrix.include: ${{ fromJSON(needs.build_site.outputs.gate_matrix) }}` — computed per push |
| Content-only push | Ran `url`, `seo`, `security`, `a11y`, `perf` | Runs `url`, `seo`, `a11y`; **skips** `perf`, `security` |
| Route-sensitive push | Ran all five | Unchanged — runs all five |
| Detection | none | `gate_scope` step diffs `github.event.before`..`github.sha`; content-only ⇔ every changed file matches `^src/content/` |
| `build` group | Always in `build_site` | Unchanged — always runs |

Fallback to the full suite whenever the diff is not confident: `workflow_dispatch`,
first push, force-push, or a missing/unreachable parent commit.

### Impact and verification

- Impacted workflow: `.github/workflows/deploy-pages.yml` (`build_site.gate_scope`
  step + new `gate_matrix` / `content_only` outputs; `gates` matrix now dynamic).
- Group→gate assignments unchanged — sourced from `scripts/gates/run-all-gates.sh`;
  `perf` = `check:perf:gate`, `security` = https-security/mixed-content/host-protocol/redirect-security.
- **Action required after merge:** required status checks are now conditional. A
  content-only push produces no `gate (perf)` / `gate (security)` check, so those
  must **not** be marked *required* in branch protection or content pushes will
  block forever. Keep `gate (url)` / `gate (seo)` / `gate (a11y)` required.
- Verify: push an article-only change to a branch and open the deploy run — the
  step summary reads "Content-only push detected…", and only `gate (url)`,
  `gate (seo)`, `gate (a11y)` legs appear. Push a template/config change and
  confirm all five legs return.
- Related files: `.github/workflows/deploy-pages.yml`, `scripts/gates/run-all-gates.sh`.

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

## Update: docs-only changes skip gates and the Pages deploy

### Change summary

The content-only optimization above still treated every file outside
`src/content/` as route-sensitive, so a README or docs edit pushed to `main`
ran the **full** five-gate suite and redeployed a byte-identical site. Pushes
and PRs are now classified into three scopes — `docs`, `content`, `full` —
and a docs-only change skips the build, every gate, and the Pages deploy.

A path is docs-inert when it cannot affect the built site:
`README.md`, `LICENSE`, `SECURITY.md`, `AGENTS.md`, `skills-lock.json`,
`.gitignore`, and anything under `docs/`, `monitoring/`, `.claude/`,
`.github/instructions/`, `.github/agents/`, or `.github/skills/`.
Everything else (templates, `hugo.toml`, `scripts/`, workflows, `url-data/`,
`validation/`, static assets, dependencies) stays route-sensitive.

### Old vs new behavior

| Push scope | Old | New |
|-----------|-----|-----|
| Docs-only (e.g. README edit) | Full suite (`url`, `seo`, `security`, `a11y`, `perf`) + build + deploy | **No build, no gates, no deploy** |
| Content-only (`src/content/**`, optionally mixed with docs-inert files) | Mixed with a README edit → full suite | `url`, `seo`, `a11y` + deploy (docs-inert files no longer demote a content push to the full suite) |
| Anything route-sensitive | Full suite + deploy | Unchanged |
| Not confidently diffable (`workflow_dispatch`, first push, force-push, missing parent, empty diff) | Full suite + deploy | Unchanged — falls back to full suite + deploy |

Structurally, scope classification moved out of `build_site` into a new
lightweight `scope` job in `deploy-pages.yml` (`build_site` is now conditional
on `scope.outputs.deploy_needed`, and the `gates` matrix reads
`scope.outputs.gate_matrix`). The deploy contract is unchanged: `deploy` still
`needs` both `build_site` and all gate legs, and skips automatically when they
skip.

`build-pr.yml` applies the same path list: a docs-only PR reports
`validation_mode: docs-only` and skips the Hugo install, production build, URL
parity, front matter, video shortcode, and Pages-constraints steps — only
`npm ci` and the changed-file markdown lint still run. The `accessibility`,
`lighthouse`, and `performance_budget` jobs were already skipped via the
existing `route_sensitive` flag.

### Impact and verification

- Impacted workflows: `.github/workflows/deploy-pages.yml` (new `scope` job,
  conditional `build_site`), `.github/workflows/build-pr.yml` (new `docs_only`
  output + conditional build steps).
- **Branch protection reminder:** as with the content-only change, gate checks
  are conditional. A docs-only push produces *no* gate checks at all, and the
  `build` PR job reports success after markdown lint only — do not mark
  `gate (*)` checks as required for pushes, and keep PR-required checks limited
  to jobs that always run (`prepare`, `build`).
- Verify: push a README-only commit to `main` — the run's step summary reads
  "Docs-only push detected…", and `build_site`, all `gate (*)` legs, and
  `deploy` show as skipped. Push a content edit mixed with a docs edit and
  confirm the `url`/`seo`/`a11y` legs plus `deploy` run. Trigger
  `workflow_dispatch` and confirm the full suite plus deploy runs.
- Scope regexes were exercised against 18 sample change sets (docs-only,
  mixed docs+content, mixed docs+scripts, lookalike paths such as `READMEXmd`
  and `src/content-other/`) — all classified as intended.
- Lint config note: `.markdownlint-cli2.jsonc` now sets MD024 to
  `siblings_only`. This document's changelog-style sections repeat the same
  subsection headings ("Change summary", "Old vs new behavior", …) under
  different parents, which the default MD024 flags; `siblings_only` allows
  that while still rejecting duplicate headings at the same level.

### Related files

- `.github/workflows/deploy-pages.yml`
- `.github/workflows/build-pr.yml` (removed — see follow-up below)

### Follow-up: PR workflow removed entirely

PR-based development is disabled for this repository, so the `build-pr.yml`
changes described above were short-lived: the workflow file was deleted in the
same change series. All validation now happens exclusively on push to `main`
through the scoped gate suite in `deploy-pages.yml`.

Old vs new behavior: previously `build-pr.yml` ran build/lint/route validation
on every PR to `main` (and had just gained docs-only scoping); now no PR
workflow exists and pushes to `main` are the only validated path.

Impact: `.github/workflows/build-pr.yml` deleted; references updated in
`README.md` (badge, structure tree, publishing section), `SECURITY.md`,
`AGENTS.md`, and `.github/instructions/ci-workflow-standards.instructions.md`
(plus its generated copies under `.claude/rules/generated/` and
`.agents/rules/`), whose PR rules are now marked as applying only if PR-based
development is ever reinstated.

Verify: the Actions tab shows only the "Deploy to GitHub Pages" workflow, and
a push to `main` still classifies into docs/content/full scope as documented
above.

## Follow-up: perf gate failures on main + drifted critical-archive.css

After the b4500f3 mobile-padding fix, the `gate (perf)` leg failed on three
consecutive `main` runs (22b81ec, d8a60da, 1200cf3 — all docs-only commits on
identical site code), blocking every deploy while b4500f3's own run had
passed. The perf leg's log only printed "Blocking failures: 1" with no detail,
and the gate job uploaded no artifacts, so the failing template/metric was
invisible.

Two changes:

1. **Diagnostics** (`.github/workflows/deploy-pages.yml`): when the perf leg
   fails, the gates job now prints each entry's `blockingFindings` plus a
   score/CLS table from `validation/performance-budget-report.json` to the log
   and step summary, and uploads `perf-gate-diagnostics-<run_id>` (the budget
   report + LHCI JSON) with 7-day retention.
2. **Critical CSS re-sync** (`src/assets/styles/critical-archive.css`):
   b4500f3 hand-patched this *generated* file, appending the mobile
   `.archive-layout--rows` gutter rule **without** the `!important` that the
   source fragment (`fragments/archive-structure.css`) carries — so the
   inlined first-paint CSS diverged from `site.css` on exactly the archive
   template with the known intermittent-CLS history. The `!important` was
   added back so the rule matches the fragment byte-for-byte.

Caveat: the proper fix is `npm run build:prod && npm run generate:critical-css`
per the regeneration workflow above; that could not be run in the environment
that authored this change (no Hugo binary reachable), so the minimal
hand-alignment was applied instead. Run the full regeneration at the next
opportunity. Note the PR-time "Check critical CSS is in sync" step was deleted
with `build-pr.yml`, so nothing currently guards against this drift — the perf
gate catches it only indirectly (and flakily).

Verify: next full-scope push to `main` — if `gate (perf)` fails, the step
summary now names the failing template and metric; if it passes, `deploy`
publishes and the backlog of blocked commits goes live.

Related files: `.github/workflows/deploy-pages.yml`,
`src/assets/styles/critical-archive.css`,
`scripts/gates/check-performance-budget.js` (report shape, unchanged).

## Update: deploys always regenerate critical CSS in-pipeline

### Change summary

The committed `src/assets/styles/critical-*.css` files are generated
artifacts, but the deploy pipeline inlined them verbatim — so a stale or
hand-edited commit shipped drifted first-paint CSS (the exact failure mode of
the b4500f3 incident above), and nothing guarded against it after the PR-time
sync check was deleted with `build-pr.yml`. `build_site` now regenerates the
critical CSS from the built site before the gate build, so the deployed HTML
always inlines critical CSS derived from the exact `site.css` being shipped.

### Old vs new behavior

| Aspect | Old | New |
|--------|-----|-----|
| Critical CSS at deploy | Committed files inlined verbatim, drift and all | Regenerated in-pipeline from the built site; gate build rebuilds with the regenerated files |
| Drift handling | Undetected (perf gate caught it only indirectly and flakily) | Deploy self-heals; a step-summary warning reports the drift with a `git diff --stat` and commit instructions, and the step log prints the full `git apply`-able diff |
| Builds per deploy | One (`build:prod` inside the `build` gate group) | Two — a priming `build:prod` so `public/` exists for penthouse, then the gate-group rebuild with regenerated CSS. All downstream gates and the Pages artifact see the final output |
| Regenerated files | n/a | Included in the `build-outputs-<sha>` artifact so they can be committed back without a local build |

The committed files are still the source for local builds — when the warning
fires, run `npm run build:prod && npm run generate:critical-css` locally (or
pull the files from the run's `build-outputs` artifact) and commit them; the
workflow has `contents: read` and intentionally does not push fixes back.

### Impact and verification

- Impacted workflow: `.github/workflows/deploy-pages.yml` (`build_site`:
  new "Regenerate critical CSS from built site" step before the build gate
  group; `build-outputs` artifact now also carries
  `src/assets/styles/critical-*.css`).
- The step runs on every deploy (content-only and full scope alike), so a
  content publish cannot ship previously committed drift either.
- Verify: on the next deploy run, `build_site` shows the regenerate step; the
  step summary reads either "in sync" or the stale-CSS warning. Force-verify
  by pushing a deliberate whitespace edit to a `critical-*.css` file — the
  warning must fire and the deployed page's inline `<style>` must not contain
  the edit.
- Related files: `.github/workflows/deploy-pages.yml`,
  `scripts/generate-critical-css.js` (unchanged, now invoked in CI),
  `scripts/gates/run-all-gates.sh` (build group rebuild, unchanged).

## Update: deploy retry, a11y diagnostics, puppeteer cache, Node 22

### Change summary

Four pipeline-hardening changes in one pass, all motivated by incidents or
waste observed while operating the pipeline:

1. **Automatic Pages deploy retry** — the Pages service transiently failed a
   deployment ("Deployment failed, try again later." during `syncing_files`,
   run #301) and required a manual re-run. The first `deploy-pages` attempt
   now runs with `continue-on-error`; on failure the job waits 30s and makes
   one automatic second attempt. The environment URL and step summary read
   from whichever attempt succeeded.
2. **a11y gate diagnostics** — an a11y failure previously uploaded nothing in
   the deploy pipeline (the old PR workflow's audit upload died with
   `build-pr.yml`). On failure the a11y leg now uploads
   `url-data/reports/accessibility-audit.md` as
   `a11y-gate-diagnostics-<run_id>` (7-day retention), mirroring the perf leg.
3. **Puppeteer Chrome caching / skipping** — every job's `npm ci` downloaded
   puppeteer's ~170 MB Chrome. `setup-node-env` now caches `~/.cache/puppeteer`
   keyed on `package-lock.json`, and takes a `skip-puppeteer-download` input
   that the `gates` job sets per leg: `'true'` for `url`/`seo`/`security`/
   `perf` (those only launch Playwright), `'false'` for `a11y` — **pa11y-ci
   drives puppeteer**, so skipping there broke the accessibility gate with
   "Could not find expected browser (chrome) locally" (run #304, first
   attempt). Emitted as `PUPPETEER_SKIP_DOWNLOAD`; note puppeteer treats any
   non-empty value as truthy, so the action emits `''` rather than `'false'`
   when the download should proceed. `build_site` keeps the download
   (penthouse needs it).
4. **Node 22** — `NODE_VERSION` bumped `20.18.1` → `22.22.2`; Node 20 is
   deprecated on GitHub runners. `package.json` `engines` (`>=20.18.1`) is
   satisfied unchanged.

### Impact and verification

- Impacted files: `.github/workflows/deploy-pages.yml`,
  `.github/actions/setup-node-env/action.yml`.
- Node 22 was sanity-checked before the bump: `npm ci`,
  `validate:frontmatter`, `check:local-video-shortcodes`, a sharp AVIF
  native-binding smoke test, `test:url-parity`, and `markdownlint-cli2` all
  pass under Node 22.22.2.
- Verify on the next deploy run: gate legs' "Install Node dependencies" no
  longer downloads Chrome and the puppeteer cache step is skipped for them;
  `build_site` shows a puppeteer cache restore; a green run's deploy shows a
  single attempt. Force-verify the retry only if a transient failure recurs —
  the step summary then notes "succeeded on automatic retry".
- Caveat: the npm cache key embeds the Node version, so the first run after
  the bump repopulates the `~/.npm` and puppeteer caches.

### Follow-up: AVIF cache restore-keys no longer embed volatile hashes

The Node bump (run #304) and the subsequent lockfile change (run #306) each
triggered a **full ~29-minute AVIF re-encode**, because both the primary key
and the single restore-key embedded `NODE_VERSION` and the
`package-lock.json` hash — any change to either invalidated the fallback too.
The generator (`scripts/generate-avif-cache.js`) is incremental (it skips
derivatives that already exist), so a stale restore is always safe. The
restore-keys now fall back progressively (full prefix → node-version prefix →
cache-version prefix), so lockfile/generator/Node changes re-encode only the
delta. Bump `AVIF_CACHE_VERSION` to force a genuine full re-encode (e.g.
after a sharp/libvips upgrade that changes encoding output).

## Update: content spelling gate

### Change summary

Obvious misspellings could reach production because no gate inspected prose —
`validate:frontmatter` checks front-matter structure, not spelling. A new
blocking gate, "Check content spelling", now scans article prose for known
misspellings before the build.

### Old vs new behavior

| Aspect | Old | New |
|--------|-----|-----|
| Spelling check | None — typos shipped until spotted by a reader | `scripts/gates/check-spelling.js` scans `src/content/**/*.md` on every content and full-scope push |
| Placement | n/a | `build` gate group, right after `validate:frontmatter` (fast, runs before the Hugo build) |
| Detection method | n/a | Curated misspelling→correction dictionary **plus** a repeated-word check ("the the"); only tokens that are never valid English/jargon/British spellings, so no domain false positives |
| Repeated words | n/a | Lowercase doubles of a small function-word safelist only, so proper nouns ("Will Will"), sentence starts, and valid doubles ("had had", "that that") are not flagged |
| Non-prose | n/a | Fenced/inline code, HTML comments, link targets, and bare URLs are masked before scanning |
| Exceptions | n/a | A flagged-but-intentional token can be allowlisted in `scripts/gates/spelling-allow.txt` |
| Regression cover | n/a | `scripts/gates/check-spelling.test.js` (`npm run test:spelling`) exercises detection, masking, the allowlist, and dictionary integrity |

The gate is intentionally not a grammar or full-dictionary spell checker — a
dictionary checker would flag SFCC jargon on every run and need a large,
high-maintenance allowlist. This gate targets the "obvious typo" class only.
Broaden coverage by adding pairs to the `MISSPELLINGS` map (or words to the
`DOUBLED_WORDS` safelist) in the gate script; the integrity test guards against
a bad entry silently disabling the gate.

### Impact and verification

- Impacted components: `scripts/gates/run-all-gates.sh` (new `build`-group
  gate), `package.json` (`check:spelling` script). The gate auto-runs inside
  the existing `npm run gates:local -- --group build` step, so
  `deploy-pages.yml` needs no change.
- The gate is dependency-free (native Node recursive `readdir`), so it runs
  without `npm ci`.
- Verify: `npm run check:spelling` exits 0 and reports "No spelling issues
  found" across current content. Add a known typo (e.g. `recieve`) or a doubled
  word (e.g. `the the`) to any content file and confirm the gate exits 1 and
  names the file, line, and suggested correction. Run `npm run test:spelling`
  for the unit + integrity suite.
- Related files: `scripts/gates/check-spelling.js`,
  `scripts/gates/check-spelling.test.js`, `scripts/gates/spelling-allow.txt`,
  `scripts/gates/run-all-gates.sh`, `package.json`.

## Update: full-dictionary spelling gate + British house style

### Change summary

The curated-misspelling gate above only caught typos someone had added to a
list. It is now backed by a full British English Hunspell dictionary (nspell +
`dictionary-en-gb`), so any word the dictionary does not know is flagged. British
English is adopted as the single house style: all existing articles were
converted from American to British spelling, and the gate now rejects American
variants so future content stays consistent.

### Old vs new behavior

| Aspect | Old | New |
|--------|-----|-----|
| Detection | Curated `MISSPELLINGS` list + repeated words | Full en-GB dictionary check + curated list (for exact suggestions) + repeated words |
| Spelling variant | British and American both tolerated | **British only** — `color`, `organize`, `center`, `catalog`, … are flagged; write `colour`, `organise`, `centre`, `catalogue` |
| Existing content | Mixed US/UK spelling | 123 articles converted to British (prose only; code, URLs, and proper nouns such as "Red Hot Chili Peppers" left untouched) |
| Unknown words | n/a | Valid jargon, product/brand names, and cited people's names live in `scripts/gates/spelling-allow.txt` (the project dictionary, seeded via `--list-unknown`) |
| Front matter | Body only | `title`, `description`, and `takeaways` values are also checked (keys, `url`, tags, and file names are not) |
| Deliberate US spellings kept | n/a | `adapter` (software term) and `chili` (band name) are allowlisted rather than converted |
| Dependencies | Dependency-free | Adds dev deps `nspell`, `dictionary-en-gb`, and reuses `gray-matter`; the gate now needs `npm ci` (already run before the `build` gate group in CI) |
| Local pre-commit | none | `.githooks/pre-commit` runs the gate when a commit stages `src/content/**` Markdown (bypass with `SKIP_SPELLING=1` or `--no-verify`) |

`--list-unknown` prints every word the dictionary and project list do not know,
to help vet and extend the allowlist. To convert a stray American spelling that
slips in, rewrite it in British form; to accept new jargon, append it (lowercased)
to `scripts/gates/spelling-allow.txt`.

### Impact and verification

- Impacted components: `scripts/gates/check-spelling.js` (dictionary layer,
  British-only, front-matter aware), `scripts/gates/spelling-allow.txt` (project
  dictionary), `.githooks/pre-commit` (new), `package.json` (dev deps), and all
  converted articles under `src/content/`.
- The gate still runs in the `build` group via `npm run gates:local`, so
  `deploy-pages.yml` is unchanged; CI installs dependencies before that step.
- Verify: `npm run check:spelling` exits 0 across current content; introduce an
  American spelling (e.g. `optimize`) and confirm it is flagged with the British
  suggestion. `npm run test:spelling` covers British acceptance, American
  rejection, masking, front matter, and dictionary/allowlist integrity.
- Related files: `scripts/gates/check-spelling.js`,
  `scripts/gates/check-spelling.test.js`, `scripts/gates/spelling-allow.txt`,
  `.githooks/pre-commit`, `package.json`.

## Related files

- `.github/workflows/deploy-pages.yml`
- `.github/actions/setup-node-env/action.yml`
- `scripts/gates/run-all-gates.sh`
- `scripts/gates/check-spelling.js` (+ `check:spelling` npm script)
- `scripts/gates/check-spelling.test.js` (+ `test:spelling` npm script)
- `scripts/gates/spelling-allow.txt`
- `.githooks/pre-commit` (runs the spelling gate on content commits)
- `lighthouserc.json`
- `src/layouts/partials/site/stylesheet.html`
- `scripts/generate-critical-css.js` (+ `generate:critical-css` npm script)
- `src/assets/styles/critical-{home,archive,post}.css` (now generated, do not hand-edit)
