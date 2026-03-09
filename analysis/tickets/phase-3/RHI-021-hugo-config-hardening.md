## RHI-021 · Workstream B — Hugo Configuration Hardening

**Status:** Done  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 3  
**Assigned to:** Engineering Owner  
**Target date:** 2026-03-27  
**Created:** 2026-03-07  
**Updated:** 2026-03-09

---

### Goal

Lock all routing, output, taxonomy, and build-behavior decisions from Phase 2 (RHI-011, RHI-012, RHI-013) into `hugo.toml` so that URL generation, sitemap output, feed paths, and taxonomy pages behave deterministically in every build. Configuration is the authoritative source of truth for these behaviors — not ad hoc template logic or undocumented defaults.

Any subsequent change to `baseURL`, permalink rules, or taxonomy paths must trigger a URL parity re-run (RHI-025) to catch regressions before they reach production.

---

### Acceptance Criteria

- [x] `baseURL` is set to `"https://www.rhino-inquisitor.com/"` — protocol, `www`, trailing slash, no variation
- [x] Language and locale defaults are explicitly set (`defaultContentLanguage`, `languageCode`, `timeZone`)
- [x] Generated-route strategy matches the Phase 1 and Phase 2 URL policy:
  - [x] Migrated posts and pages continue to use explicit front matter `url` values from RHI-012
  - [x] Category/taxonomy route pattern is documented and set at `/category/` and `/category/{slug}/`
  - [x] `/video/` remains an explicit page route, distinct from `/category/video/`
- [x] Taxonomy definitions are explicit and aligned with the approved public route contract:
  - [x] `category = "categories"`
  - [x] Tag archives remain retired by default; `tags` continue as front matter metadata only until an approved exception exists
- [x] Output behavior is explicitly declared and documented:
  - [x] HTML output enabled for all rendered page kinds
  - [x] RSS output enabled for `home` and `section`
  - [x] Sitemap output remains enabled as the monolingual built-in site output
- [x] Robots generation mechanism is explicitly configured and documented:
  - [x] `enableRobotsTXT = true` is set explicitly
  - [x] Mechanism is documented and backed by Hugo template `src/layouts/robots.txt`
- [x] Feed compatibility policy from RHI-013 is recorded with a tracked decision:
  - [x] Hugo default feed path (`/index.xml`) is noted and emitted
  - [x] WordPress feed endpoint (`/feed/`) is recorded as a must-resolve downstream dependency, implemented in RHI-024
- [x] Build behavior is environment-gated:
  - [x] `draft: true` content is excluded in production build
  - [x] Future-dated content is excluded in production build
  - [x] Minification is enabled for production via `hugo --minify --environment production`
- [x] Sitemap mode policy is confirmed and documented:
  - [x] Phase 3 remains monolingual, so Hugo emits a single root `sitemap.xml`
- [x] `hugo --minify --environment production` exits with code 0 and emits `public/sitemap.xml`, `public/robots.txt`, and `public/index.xml` (feed)
- [x] No environment-specific canonical host variation exists in production output

---

### Tasks

- [x] Harden root `hugo.toml` while keeping root config as the only production source of truth
- [x] Set `defaultContentLanguage`, `languageCode = "en-us"`, and `timeZone` explicitly
- [x] Add generated-route config matching the approved public route policy:
  - [x] Keep migrated post/page routing owned by explicit front matter `url`
  - [x] Define category taxonomy routes at `/category/` and `/category/{slug}/`
- [x] Add explicit public taxonomy config aligned with front matter and route contracts:
  - [x] `category = "categories"`
  - [x] Keep tag archives retired by default instead of generating public `/tag/*` pages
- [x] Add `[outputs]` with explicit format lists for `home`, `section`, `taxonomy`, `term`, and `page`:
  - [x] HTML included for all rendered page kinds
  - [x] RSS included for `home` and `section`
  - [x] Sitemap behavior documented as the built-in monolingual site output
- [x] Configure robots generation behavior explicitly:
  - [x] Set `enableRobotsTXT = true` in `hugo.toml`
  - [x] Add repo-owned template source `src/layouts/robots.txt`
- [x] Use Hugo-supported production build controls instead of a misleading `[build]` section:
  - [x] Set production defaults to exclude drafts, future, and expired content with explicit root settings
  - [x] Keep production minification on the validated CLI path `hugo --minify --environment production`
- [x] Record feed compatibility decision in configuration comments and `docs/migration/RUNBOOK.md`:
  - [x] Document Hugo default feed output path (`/index.xml`)
  - [x] Record `/feed/` as a must-resolve downstream dependency owned by RHI-024
- [x] Run `hugo --minify --environment production` and verify:
  - [x] Exit code 0
  - [x] `public/sitemap.xml` generated
  - [x] `public/robots.txt` generated
  - [x] `public/index.xml` generated (RSS feed)
- [x] Run URL-shape spot-check: generated category route contract and canonical host behavior documented for downstream parity validation
- [x] Commit-ready config, template, and documentation changes prepared with no production overlay config introduced

---

### Out of Scope

- Template or partial authoring (covered by RHI-023 and RHI-024)
- Front matter schema and archetypes (covered by RHI-022)
- Redirect alias pages (covered by RHI-025)
- CI workflow definition (covered by RHI-029)
- robots.txt directive content beyond generation mechanism and output verification (covered by RHI-024)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-019 Done — Phase 3 Bootstrap complete | Ticket | Pending |
| RHI-020 Done — Repository layout and stub `hugo.toml` committed | Ticket | Pending |
| RHI-011 Outcomes — Hugo version pin, `baseURL`, environment model approved | Ticket | Pending |
| RHI-012 Outcomes — Front matter field names and URL normalization rules approved | Ticket | Pending |
| RHI-013 Outcomes — Permalink strategy, taxonomy routes, feed endpoint disposition approved | Ticket | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Permalink pattern change after RHI-021 is done causes URL regression | Medium | High | Enforce URL parity re-run (RHI-025) on any subsequent `[permalinks]` change; note constraint in `hugo.toml` comment | Engineering Owner |
| Taxonomy key mismatch between `[taxonomies]` and front matter field names | Medium | High | Cross-check config keys against approved front matter contract (RHI-012) before commit | Engineering Owner |
| Feed output path incompatibility creates silent WordPress subscriber drop | Medium | High | Document feed path decision explicitly; do not close RHI-021 without feed disposition recorded | SEO Owner |
| Sitemap output shape differs between monolingual and multilingual config modes | Low | Medium | Explicitly set monolingual config and validate sitemap URL count after build | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Completed. Workstream B now locks the Phase 3 Hugo configuration contract for locale defaults, generated routes, outputs, robots generation, and production build behavior. Downstream tickets RHI-023, RHI-024, and RHI-025 continue the rendering, feed-resolution, and parity-validation work, but they are no longer treated as blockers to RHI-021 completion.

Approved implementation decisions:

- Root `hugo.toml` remains the only production configuration source of truth; no `config/production/` or environment overlay was introduced.
- Locale defaults are now explicit: `defaultContentLanguage = "en"`, `languageCode = "en-us"`, and `timeZone = "UTC"`.
- Migrated post and page routes remain owned by explicit front matter `url` values from RHI-012; this ticket does not add broad post/page permalink rules that could conflict with manifest-driven routing.
- Public generated taxonomy routing is limited to categories in Phase 3:
  - category list root: `/category/`
  - category term pages: `/category/{slug}/`
- For Hugo `v0.157.0`, the taxonomy permalink override keys must match the taxonomy name (`categories`) inside `[permalinks.taxonomy]` and `[permalinks.term]`; using the singular alias does not apply the override even though `[taxonomies]` itself is declared as `category = "categories"`.
- Tag archives remain intentionally retired by default per RHI-013. The `tags` front matter key remains valid metadata, but no public tag taxonomy is generated in Phase 3.
- Output behavior is explicit for rendered page kinds:
  - `home = ["html", "rss"]`
  - `section = ["html", "rss"]`
  - `page = ["html"]`
  - `taxonomy = ["html"]`
  - `term = ["html"]`
- Phase 3 remains monolingual, so Hugo's built-in sitemap behavior emits a single root `sitemap.xml`.
- Robots generation now follows the approved mechanism from RHI-014:
  - `enableRobotsTXT = true`
  - repo-owned template at `src/layouts/robots.txt`
- Canonical feed output remains Hugo's home RSS endpoint at `/index.xml`.
- Legacy `/feed/` continuity is not optional, but the path-resolution artifact is intentionally deferred to RHI-024 because it requires SEO/output work beyond config hardening. RHI-021 records that dependency explicitly instead of silently relying on Hugo defaults.
- Production build behavior is now explicit without misusing a `[build]` section:
  - `buildDrafts = false`
  - `buildFuture = false`
  - `buildExpired = false`
  - validated production command: `hugo --minify --environment production`

Validation completed:

- `hugo --minify --environment production` exited with code 0.
- `public/sitemap.xml`, `public/robots.txt`, and `public/index.xml` were generated.
- Generated outputs use the canonical `https://www.rhino-inquisitor.com/` host; no localhost, apex, or HTTP host drift was observed in the sampled machine-readable outputs.
- The clean production build still emits expected warnings about missing `home` and `taxonomy` HTML layouts. Those warnings are a downstream RHI-023 template-scaffolding dependency, not a Hugo config error.
- During RHI-023 validation, the taxonomy route contract was rechecked against rendered HTML and the config was corrected so the build now emits `public/category/index.html` and `public/category/migration/index.html` instead of falling back to Hugo's default `/categories/...` paths.
- A full URL parity rerun could not be executed in this task because the expected RHI-025 tooling is not in the repo yet: `scripts/check-url-parity.js` and `migration/url-parity-report.json` are both still absent.

**Delivered artefacts:**

- `hugo.toml` with routing, taxonomy, output, and build behavior locked
- Root `hugo.toml` with explicit production-safe defaults; no production overlay introduced
- `src/layouts/robots.txt` implementing the repo-owned robots generation mechanism
- Feed compatibility decision recorded in `docs/migration/RUNBOOK.md` and `hugo.toml` comments
- Documentation note: `analysis/documentation/phase-3/rhi-021-hugo-config-hardening-2026-03-09.md`

**Deviations from plan:**

- The original task list suggested a `[build]` section for draft/future/minify behavior. Hugo's documented configuration model uses explicit root settings plus the validated CLI flags instead, so the implementation follows official semantics rather than the earlier shorthand.
- The original checklist implied `tag = "tags"` in `[taxonomies]`. That would generate public tag archive routes that conflict with the approved RHI-013 route contract, so tag archives remain intentionally unconfigured in Phase 3.
- `/feed/` must-resolve behavior is recorded and tracked, but the redirect/output artifact is deferred to RHI-024 instead of forcing a premature custom feed path into config-only hardening.
- Production validation in this ticket proves the machine-readable outputs only. Missing `home` and `taxonomy` HTML layout warnings remain expected until RHI-023 provides the rendering templates.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-09 | In Progress | Reviewed RHI-021 against RHI-011 through RHI-014, the Hugo skill guidance, Hugo specialist guidance, and official Hugo documentation for config, outputs, robots, RSS, and build semantics |
| 2026-03-09 | In Progress | Hardened root `hugo.toml`, added a repo-owned `src/layouts/robots.txt`, and documented the explicit `/index.xml` feed contract plus `/feed/` downstream dependency in `docs/migration/RUNBOOK.md` |
| 2026-03-09 | In Progress | RHI-023 scaffold validation exposed that the taxonomy permalink overrides in `hugo.toml` were keyed by the singular alias. The config was corrected to use the taxonomy name (`categories`) so the approved `/category/` and `/category/{slug}/` routes render as intended in Hugo `v0.157.0`. |
| 2026-03-09 | Done | Production validation passed via `hugo --cleanDestinationDir --minify --environment production`; required machine-readable outputs were emitted, canonical-host drift was not observed in sampled outputs, and the remaining missing-layout warnings plus parity follow-up were recorded as downstream dependencies rather than blockers |

---

### Notes

- **Critical constraint:** any change to `[permalinks]` or `[taxonomies]` after this ticket is done must trigger an immediate URL parity check run (RHI-025). Add this constraint as a comment at the top of the `[permalinks]` block in `hugo.toml`.
- Hugo does not sanitize `url` front matter values — validation is the responsibility of the script in RHI-022.
- RSS feed: Hugo default emits `/index.xml`. The WordPress feed endpoint is `/feed/`. If subscribers rely on the old path, an alias redirect must be created. This decision was made in RHI-013; this ticket implements or records the outcome.
- Hugo's documented production gating uses explicit root settings (`buildDrafts`, `buildFuture`, `buildExpired`) plus the production build command, rather than a `[build]` section for content inclusion or minification behavior.
- A full URL parity run still belongs to RHI-025. RHI-021 records the route contract and the parity rerun requirement, but does not own the parity tool implementation.
- Because `hugo.toml` changed again during RHI-023 validation, RHI-025 remains a mandatory follow-up gate before merge once the parity tooling exists.
- Reference: `analysis/plan/details/phase-3.md` §Workstream B: Hugo Configuration Hardening
