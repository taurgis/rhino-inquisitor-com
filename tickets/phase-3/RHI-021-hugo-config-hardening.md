## RHI-021 · Workstream B — Hugo Configuration Hardening

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 3  
**Assigned to:** Engineering Owner  
**Target date:** 2026-03-27  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Lock all routing, output, taxonomy, and build-behavior decisions from Phase 2 (RHI-011, RHI-012, RHI-013) into `hugo.toml` so that URL generation, sitemap output, feed paths, and taxonomy pages behave deterministically in every build. Configuration is the authoritative source of truth for these behaviors — not ad hoc template logic or undocumented defaults.

Any subsequent change to `baseURL`, permalink rules, or taxonomy paths must trigger a URL parity re-run (RHI-025) to catch regressions before they reach production.

---

### Acceptance Criteria

- [ ] `baseURL` is set to `"https://www.rhino-inquisitor.com/"` — protocol, `www`, trailing slash, no variation
- [ ] Language and locale defaults are explicitly set (`defaultContentLanguage`, `languageCode`, `timeZone`)
- [ ] Permalink strategy for all content sections matches the Phase 1 URL policy (from RHI-003 and RHI-013):
  - [ ] Posts/articles permalink pattern documented and set
  - [ ] Pages permalink pattern documented and set
  - [ ] Category/taxonomy route pattern documented and set
- [ ] Taxonomy definitions are explicit and match front matter field names exactly (e.g. `category`/`categories` key alignment verified)
- [ ] Output formats are explicitly declared (no undocumented Hugo defaults relied upon):
  - [ ] HTML output enabled
  - [ ] Sitemap output enabled
  - [ ] RSS output enabled with feed path compatibility considered (WordPress `/feed/` endpoint — see Notes)
  - [ ] robots.txt output enabled
- [ ] Feed compatibility policy from RHI-013 is implemented or explicitly deferred with a tracked decision:
  - [ ] Hugo default feed path (`/index.xml`) noted
  - [ ] WordPress feed endpoint (`/feed/`) disposition recorded (redirect via alias, or retire — per RHI-013 decision)
- [ ] Build behavior is environment-gated:
  - [ ] `draft: true` content is excluded in production build
  - [ ] Future-dated content is excluded in production build
  - [ ] Minification is enabled for production, optional for development
- [ ] Sitemap mode policy is confirmed and documented:
  - [ ] Monolingual vs multilingual sitemap behavior explicitly chosen and matching site configuration
- [ ] `hugo --minify --environment production` exits with code 0 and emits `public/sitemap.xml`, `public/robots.txt`, and `public/index.xml` (feed)
- [ ] No environment-specific canonical host variation exists in production output

---

### Tasks

- [ ] Open `hugo.toml` and set `baseURL = "https://www.rhino-inquisitor.com/"`
- [ ] Set `defaultContentLanguage`, `languageCode = "en-us"`, and `timeZone` explicitly
- [ ] Add `[permalinks]` section matching Phase 1 URL policy (consult RHI-003 and RHI-013 Outcomes):
  - [ ] Define post permalink pattern (e.g. `/:slug/` or pattern that preserves WordPress slug paths)
  - [ ] Define page permalink pattern
- [ ] Add `[taxonomies]` section; verify key names match front matter field names used in archetypes (RHI-022):
  - [ ] `category = "categories"` (or pattern approved in RHI-012)
  - [ ] `tag = "tags"`
  - [ ] Video taxonomy if required per RHI-013 decision
- [ ] Add `[outputs]` section with explicit format lists for `home`, `section`, `taxonomy`, `term`, and `page`:
  - [ ] HTML included for all types
  - [ ] RSS included for `home` and `section` types
  - [ ] Sitemap included for `home`
  - [ ] robots.txt included for `home`
- [ ] Add `[build]` section with environment-specific behavior:
  - [ ] Set production to exclude drafts and future content
  - [ ] Enable `minify` in production environment (`config/production/hugo.toml` or environment flags)
- [ ] Record feed compatibility decision in configuration comments or `docs/migration/RUNBOOK.md`:
  - [ ] Document Hugo default feed output path (`/index.xml`)
  - [ ] Record disposition for WordPress `/feed/` path (redirect, retire, or alias — from RHI-013)
- [ ] Run `hugo --minify --environment production` and verify:
  - [ ] Exit code 0
  - [ ] `public/sitemap.xml` generated
  - [ ] `public/robots.txt` generated
  - [ ] `public/index.xml` generated (RSS feed)
- [ ] Run URL parity spot-check: confirm permalink rules produce the expected sample URL shapes from Phase 1 inventory
- [ ] Commit `hugo.toml` and any environment config files

---

### Out of Scope

- Template or partial authoring (covered by RHI-023 and RHI-024)
- Front matter schema and archetypes (covered by RHI-022)
- Redirect alias pages (covered by RHI-025)
- CI workflow definition (covered by RHI-029)
- robots.txt directive content beyond the output format enablement (covered by RHI-024)

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- `hugo.toml` with routing, taxonomy, output, and build behavior locked
- Environment config file (`config/production/hugo.toml`) if environment-split is used
- Feed compatibility decision recorded in `docs/migration/RUNBOOK.md` or `hugo.toml` comments

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- **Critical constraint:** any change to `[permalinks]` or `[taxonomies]` after this ticket is done must trigger an immediate URL parity check run (RHI-025). Add this constraint as a comment at the top of the `[permalinks]` block in `hugo.toml`.
- Hugo does not sanitize `url` front matter values — validation is the responsibility of the script in RHI-022.
- RSS feed: Hugo default emits `/index.xml`. The WordPress feed endpoint is `/feed/`. If subscribers rely on the old path, an alias redirect must be created. This decision was made in RHI-013; this ticket implements or records the outcome.
- Reference: `analysis/plan/details/phase-3.md` §Workstream B: Hugo Configuration Hardening
