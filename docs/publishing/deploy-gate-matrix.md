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
| Platform/protocol & SFCC UI terms | n/a | Terms that must match the platform keep their American spelling so prose matches the Business Manager menus / spec: `catalog`(s) (Products and Catalogs), the SFCC/SLAS `Organization` ID / BM tab, and the HTTP/OAuth `Authorization` header. Generic prose still uses British `organisation`/`authorisation`; the platform terms (`catalog`, `catalogs`, `organization`, `authorization`) are allowlisted. |
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

## Update: grammar checks in the spelling gate (error phrases + a/an agreement)

### Change summary

The gate checked spelling but almost no grammar: the only grammar-shaped check
was the lowercase repeated-word detector. It now also catches two classes of
error a dictionary can never see because every individual word is valid:

1. **Error phrases** — a curated map of multi-word mistakes with exact
   corrections: "should of" → "should have", "more then" → "more than",
   "to setup" → "to set up" (and login/logout/backup/rollback/workaround),
   plus common idiom slips ("sneak peak", "per say"). "to checkout" is
   deliberately excluded ("proceed to checkout" is a valid noun reading), and
   a capital past the first word ("to Setup" as a named page) is left alone.
2. **Article agreement** — "a" vs "an" judged by the sound of the next word:
   initialisms read letter by letter ("an SFCC instance", "an npm package",
   "an HTTPError", but "a URL" and "a UUID"), acronyms the site pronounces as
   words via a `WORD_ACRONYMS` set ("a REST API", "a SCAPI hook", "a LINK
   cartridge", "a SLAS token"), numbers read out ("an 8-second delay", "a 404
   page"), "you"-sound u-/eu- words ("a user", "a European", but "an
   uninstalled cartridge"), and silent-h words ("an hour").

The repeated-word check is now case-insensitive ("The the" is caught) while
still skipping hyphenated compounds ("Apple Web Sign-In in SFRA" is fine).
Running the new checks over all 197 content files surfaced 12 genuine errors
(4 × "to setup" including one post title, 7 article disagreements such as
"an Salesforce" / "a SFCC storefront" / "a enum" / "an useEffect", and a
placeholder client ID quoted in prose instead of inline code); all are fixed
in the same change and each edited article's `lastmod` was bumped.

### Old vs new behavior

| Aspect | Old | New |
|--------|-----|-----|
| Grammar coverage | Lowercase repeated function words only | + error phrases, + a/an agreement, repeated words now case-insensitive |
| False-positive escape hatch | Word allowlist only | A multi-word allowlist phrase is masked before any check, so it also suppresses a phrase/article finding (e.g. add `an slas` to keep a letter-read "an SLAS") |
| Front-matter finding lines | All findings pointed at the key line (third takeaway reported on `takeaways:`) | Each value reports its own line, falling back to the key line for wrapped/escaped YAML |
| Allowlist maintenance | Seed-only (`--list-unknown`) | + `--unused-allowlist` lists entries no content needs any more (advisory, exits 0); current list audited: 0 of 677 entries unused, and the stale placeholder-ID entry was removed |
| Gate summary line | "No spelling issues found" | Names the dictionary, project words, misspellings, error phrases, and grammar checks it ran |

### Impact and verification

- Impacted components: `scripts/gates/check-spelling.js` (new checks, CLI
  mode, reporting), `scripts/gates/check-spelling.test.js`,
  `scripts/gates/spelling-allow.txt` (one stale entry removed), and the 12
  corrected articles under `src/content/`. No workflow or `package.json`
  changes: the gate keeps its place in the `build` group and the pre-commit
  hook runs it unchanged.
- Verify: `npm run check:spelling` exits 0 across current content. Add
  "should of", "a SFCC", or "The the" to any article and confirm the gate
  exits 1 with the exact correction. `npm run test:spelling` covers the
  phrase map's integrity, the article-sound table, capitalisation in
  suggestions, the Q&A/masked-span/hyphen false-positive guards, and the
  phrase-based suppression workflow.
- Related files: `scripts/gates/check-spelling.js`,
  `scripts/gates/check-spelling.test.js`, `scripts/gates/spelling-allow.txt`,
  `docs/publishing/deploy-gate-matrix.md`, corrected articles under
  `src/content/`.

## Follow-up: grammar-check audit hardening (latent false positives/negatives)

### Change summary

An adversarial self-review of the grammar checks (eight independent review
angles, each candidate re-verified by executing it against the gate) found
ten latent defects: the gate was green on current content, but correct future
prose would have tripped it, and one error class escaped it. All are fixed
with regression tests (the suite grew to 38 tests).

### Old vs new behavior

| Defect (old behavior) | New behavior |
|-----------------------|--------------|
| Masking blanked code/URLs to spaces, so the doubled-word check paired words across a masked span: "pass the `id` the API returns" flagged a phantom "the the" | Masked regions are filled with a non-whitespace sentinel (`MASK_CHAR`), so no check can bridge a masked span; the article check's single-space rule now has defence in depth |
| "an unidentified error" flagged (u- rule read `unid-` as the "you" sound) | `unident-`/`unidiom-` stems keep "an"; `unidirectional` still takes "a" |
| Bare capital "A" mid-sentence read as an article: "option A and option B" → nonsense "An and" | A capital "A" is an article only at a sentence start (nearest non-blank character decides); labels like "option A", "Appendix A", "Plan A a.k.a." pass |
| All-caps dictionary words judged letter-by-letter: "a MUST" → wrong suggestion "an MUST" | All-caps tokens (≥3 letters) whose lowercase is a dictionary word are ambiguous — letter-read acronym ("an SPA", "an SAP") or caps-for-emphasis word ("a MUST", "a GET request") — so either article is accepted; `WORD_ACRONYMS` entries stay deterministic |
| Plural "SLAs" matched the SLAS word-acronym entry: correct "an SLAs" flagged | `WORD_ACRONYMS` applies only to fully upper-case tokens; "SLAs" is letter-read |
| Case-insensitive doubling flagged proper nouns ("Will Will Smith", "The The") and digit-glued tokens ("a 2in in the box") | 'will' removed from the safelist; a capitalised second word or a single-letter case-mismatched pair is skipped; lookarounds exclude digits |
| Title-case headings escaped the phrase check ("## More Then You Think" passed) | The capitalised-skip applies only to the compound-noun phrases with a proper-noun reading ("to Setup"); then/than and modal+of mistakes are flagged in any case |
| A takeaway repeating earlier front-matter text reported the earlier field's line | `lineOfValue` starts searching at the field's own key |
| Header comment showed an inverted suppression example ("a slas") | Corrected to "an slas"; `maskPhrases`, `findErrorPhrases`, and `--unused-allowlist` now share one `phrasePattern` builder so phrase matching cannot drift |
| Phrase regexes recompiled per call; `--unused-allowlist` mixed two overlapping "needed" mechanisms | Patterns precompiled at module level; the maintenance mode uses the occurrence scan as the single arbiter for phrases |

### Impact and verification

- Impacted components: `scripts/gates/check-spelling.js` and
  `scripts/gates/check-spelling.test.js` only — no content, workflow, or
  configuration changes; the gate's CLI, exit codes, and placement are
  unchanged.
- Verify: `npm run test:spelling` (38 tests, including one regression test per
  defect above) and `npm run check:spelling` (exits 0 across all 197 files);
  `node scripts/gates/check-spelling.js --unused-allowlist` still reports 0
  unused entries.
- Related files: `scripts/gates/check-spelling.js`,
  `scripts/gates/check-spelling.test.js`.

## Follow-up: markdownlint MD034 broke the seo gate via shortcode attributes

### Change summary

Deploy run 311 failed the `gate (seo)` leg on the internal-link check with
hrefs like `%3chttps://trailblazercommunitygroups.com/…%3e`. The cause was the
markdownlint pass in the "Keep platform identifiers American" change: MD034
(`no-bare-urls`) treats a URL inside a Hugo shortcode attribute — for example
`{{< img-caption link="https://…" >}}` — as a bare URL in prose, and its
`--fix` wraps it in `<…>`. Markdown autolink syntax means nothing inside a
shortcode argument, so Hugo emitted the angle brackets literally into the
`href`, producing links to `%3chttps…%3e` on two posts (three links total).
The same fix run also replaced one image `alt` with an angle-bracketed URL.

MD034 is now disabled in `.markdownlint-cli2.jsonc` (alongside the existing
MD028 exception) because the repo's `img-caption` shortcode legitimately takes
URL-valued attributes and markdownlint has no shortcode awareness; the
mangled attributes are restored, and the URL-as-alt-text case now carries a
descriptive alt instead.

### Old vs new behavior

- Old: MD034 active; `markdownlint --fix` rewrites `link="https://…"` to
  `link="<https://…>"` inside shortcodes, silently corrupting built hrefs, and
  the pre-push preflight rejects the correct unwrapped form as a bare URL.
- New: MD034 disabled repo-wide; URL-valued shortcode attributes lint clean as
  written, and bare URLs in prose are no longer flagged (accepted trade-off —
  the internal-link and metadata gates still validate rendered links).

### Impact and verification

- Impacted: `gate (seo)` internal-link check (was failing with 5 blocking
  findings), the pre-push preflight markdownlint step, and three posts:
  `/a-new-commerce-cloud-community-in-town/`,
  `/the-attribute-fallback-system-in-sfcc/`,
  `/guide-to-the-getprops-method-in-sfcc/`.
- Verify: `npx markdownlint-cli2 "src/content/posts/**/index.md"` reports no
  MD034 errors; `npm run build && npm run check:internal-links` reports 0
  blocking findings; the next `main` deploy run's `gate (seo)` leg passes.
- Related files: `.markdownlint-cli2.jsonc`,
  `src/content/posts/a-new-commerce-cloud-community-in-town/index.md`,
  `src/content/posts/the-attribute-fallback-system-in-sfcc/index.md`,
  `src/content/posts/guide-to-the-getprops-method-in-sfcc/index.md`.

## Update: American-form detection the dictionary cannot see

### Change summary

An audit of the British English enforcement (benchmarked against Vale's
substitution-rule approach, the GDS/GOV.UK and ONS style guides, and the
proselint/write-good curated lists) found the gate's one systematic blind
spot: American forms that the en-GB Hunspell dictionary also accepts as valid
words. "toward", "gotten", noun "license", verb "practice", and non-computing
"program" all passed the dictionary check, and the site had ~64 of them. The
gate now has a curated layer for exactly that class, and the American English
dictionary (`dictionary-en`, previously an unused dev dep) is used to label
findings: a word en-US knows is reported as "American spelling … (British: …)"
instead of "unknown word", so authors immediately see which fix applies.

### Old vs new behavior

| Aspect | Old | New |
|--------|-----|-----|
| American forms valid in en-GB | Invisible ("toward", "gotten", "anyways", "oftentimes", noun "license") | `AMERICANISMS` map flags them with the British form; hyphen-glued tokens ("ill-gotten") and verb derivatives ("licensed", "licensing") stay legal |
| Noun/verb heterographs | Invisible | Verb "practice" caught via context phrases ("to practice", modal + "practice" → "practise"); the noun stays untouched. A genuine verb use of "license" is kept via a phrase allowlist entry |
| programme/program | Invisible | Non-computing pairings flagged ("beta/pilot/partner/mentorship/rewards/loyalty/… program" → "programme"); computer programs keep "program" (ONS rule), and capitalised proper names ("AppExchange Partner Program") are skipped |
| Deliberately not flagged | n/a | meter/tire/curb/disk/dialog — each is also an everyday British word or a computing exception ("dialog box", "hard disk"), so word-level flagging would misfire; documented in the `AMERICANISMS` comment |
| Report classification | American variants reported as "unknown word" | en-US-valid words labelled "American spelling" with the British suggestion; `--list-unknown` excludes them so allowlist seeding can never launder an American spelling |
| Error phrases | 29 | 76: adds idiom slips ("could care less", "free reign", "piece of mind", "hone in on"), British style ("different than" → "different from", "fill out a form" → "fill in"), regards ("in/with regards to"), RAS redundancies ("PIN number", "ATM machine"), and more verb/noun splits ("to signup/shutdown/cleanup/logon") |
| Curated misspellings | 45 | 70 (high-frequency typo→fix pairs so reports carry exact suggestions) |
| Integrity tests | Misspelling map + allowlist shadow checks | + every `AMERICANISMS` key must pass en-GB (else the dictionary check owns it) and every suggestion must be a valid en-GB word; allowlist word entries may not disable an `AMERICANISMS` rule |

Alternatives considered: no maintained Vale package enforces British English
(teams pair a Hunspell dictionary with hand-curated substitution rules — the
same architecture as this gate); `retext-indefinite-article`/`repeated-words`
overlap with the existing tailored checks without the site-specific acronym
handling; LanguageTool needs Java/Docker in CI; `harper.js` (WASM, en-GB) is
the one credible future add-on if POS-aware checking is ever wanted.

The same audit fixed content the new rules cannot express: a SCAPI path the
original conversion had mangled to `/organisations/{organizationId}/…` (now
restored and in inline code), `sffc-ci` → `` `sfcc-ci` ``, a misspelled
contributor name ("Upmany" → "Upmanyu"), nonstandard words hidden by allowlist
entries ("preparational" → "preparatory", "migrational" → "migration",
"transferrable" → "transferable", "abovementioned" → "aforementioned"), and a
typo'd tutorial feed ID ("physicial" → "physical"). The six now-stale allowlist
entries were removed (677 → 671, `--unused-allowlist` reports 0 unused).

### Impact and verification

- Impacted components: `scripts/gates/check-spelling.js` (new `AMERICANISMS`
  check, en-US classification, phrase/misspelling additions),
  `scripts/gates/check-spelling.test.js` (suite grew to 47 tests),
  `scripts/gates/spelling-allow.txt` (6 entries removed, 1 corrected), and 57
  corrected articles under `src/content/` (each with a `lastmod` bump). The
  gate keeps its place in the `build` group; `dictionary-en` was already in
  `package.json`, so no dependency or workflow changes.
- Verify: `npm run check:spelling` exits 0 across all 197 files. Add "toward",
  "gotten", "a license", "should practice", or "beta program" to any article
  and confirm the gate exits 1 with the British correction; add "color" and
  confirm it is reported as an American spelling (not an unknown word).
  `npm run test:spelling` covers the new maps' integrity and behaviour.
- Related files: `scripts/gates/check-spelling.js`,
  `scripts/gates/check-spelling.test.js`, `scripts/gates/spelling-allow.txt`,
  corrected articles under `src/content/`.

## Update: external-link gate (pre-commit)

### Change summary

A new article shipped with an external link that resolved to a 404 (the
WebDAV guide's Salesforce Help links, fixed in the 2026-07-07 link audit),
because nothing verified external links before publish. A pre-commit
external-link gate now verifies every external link in the staged article(s)
before the commit lands.

### Behavior details

Old: `.githooks/pre-commit` ran only the spelling gate on staged
`src/content/**` Markdown; external links were never checked anywhere.

New: the hook additionally runs `npm run check:external-links -- --staged`,
which extracts prose links (front matter, fenced code blocks, and inline code
are masked — URLs there are examples, not citations) from the staged version
of each article and verifies each one according to its domain's entry in
`scripts/gates/external-link-domains.js`:

| Strategy | Used for | Verdict source |
| --- | --- | --- |
| `status` | Server-rendered sites (the default) | Final HTTP status after redirects; 404/410 or a dead DNS name block the commit |
| `render` | Client-rendered SPAs that answer the same 200 shell for valid and invalid URLs — `help.salesforce.com`, `developer.salesforce.com`, `trailhead.salesforce.com`, `trailblazer.salesforce.com`, `ideas.salesforce.com`, `appexchange.salesforce.com` | Headless Chromium (Playwright) loads the page, waits for the app to settle, and checks the rendered text/final URL against per-domain not-found markers |
| `skip` | Login walls, bot blockers, invite/registration links that expire by design, placeholder hosts | Never fetched; each entry records why |

A link to a domain with **no registry entry blocks the commit** and prints
instructions to classify the domain (one entry in
`scripts/gates/external-link-domains.js`) — that judgment is made by a human
once per domain, not guessed by the gate. The registry was seeded with every
domain linked from `src/content` at introduction time (~200 hosts), so
existing content passes as the baseline.

Verdicts are deliberately asymmetric so the hook never blocks an author on
someone else's flaky server: only confident dead signals fail (404, 410,
NXDOMAIN, a rendered not-found page, a malformed URL such as `http://t`);
403/429 bot walls, 5xx, timeouts, offline commits, and a missing Playwright
browser degrade to warnings. The `render` strategy needs a Playwright
Chromium (`npx playwright install chromium`); without one those links warn
with that instruction. Escape hatches: `SKIP_LINK_CHECK=1 git commit ...`
skips the gate (`SKIP_SPELLING=1` now skips only the spelling gate);
`LINK_GATE_CHROMIUM=<path>` points the renderer at a specific browser binary;
`LINK_GATE_IGNORE_HTTPS_ERRORS=1` lets the renderer work behind a
TLS-inspecting proxy.

The `render` markers are best-effort snapshots of each SPA's not-found
wording; when a Salesforce property rewords its error page, tune the
`deadMarkers` in the registry. For `help.salesforce.com` `cc.*` article IDs,
the DOC1 redirect mapping described in
`docs/content/webdav-article-refresh-2026-07.md` remains the reliable manual
oracle.

### Impact and verification

- Impacted components: `.githooks/pre-commit` (runs the new gate after the
  spelling gate), `package.json` (`check:external-links`,
  `test:external-links`), and the three new files under `scripts/gates/`.
  The deploy workflow is unchanged: the gate is local-only because it needs
  the network and must not make CI flaky on third-party outages.
- Verify: `npm run test:external-links` (24 tests) covers extraction/masking,
  registry integrity, the render-strategy classification of the async
  Salesforce SPAs, stubbed status/render/skip verdicts, and — as the
  baseline contract — that every domain currently linked from `src/content`
  resolves in the registry. End to end: stage an article containing
  `https://github.com/SalesforceCommerceCloud/not-a-real-repo-xyz` and
  confirm `npm run check:external-links -- --staged` exits 1 with `HTTP 404`;
  link any never-used domain and confirm it exits 1 with the registration
  instructions before any network request.
- Related files: `scripts/gates/check-external-links.js`,
  `scripts/gates/check-external-links.test.js`,
  `scripts/gates/external-link-domains.js`, `.githooks/pre-commit`,
  `package.json`.

## Related files

- `.github/workflows/deploy-pages.yml`
- `.github/actions/setup-node-env/action.yml`
- `scripts/gates/run-all-gates.sh`
- `scripts/gates/check-spelling.js` (+ `check:spelling` npm script)
- `scripts/gates/check-spelling.test.js` (+ `test:spelling` npm script)
- `scripts/gates/spelling-allow.txt`
- `scripts/gates/check-external-links.js` (+ `check:external-links` npm script)
- `scripts/gates/check-external-links.test.js` (+ `test:external-links` npm script)
- `scripts/gates/external-link-domains.js` (per-domain verification registry)
- `.githooks/pre-commit` (runs the spelling and external-link gates on content commits)
- `lighthouserc.json`
- `src/layouts/partials/site/stylesheet.html`
- `scripts/generate-critical-css.js` (+ `generate:critical-css` npm script)
- `src/assets/styles/critical-{home,archive,post}.css` (now generated, do not hand-edit)
