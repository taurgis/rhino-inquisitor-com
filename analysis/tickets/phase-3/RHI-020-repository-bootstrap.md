## RHI-020 · Workstream A — Repository Bootstrap

**Status:** Open  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 3  
**Assigned to:** Engineering Owner  
**Target date:** 2026-03-26  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Initialize the Hugo project structure and establish a deterministic local development baseline so that every subsequent Phase 3 workstream (templates, config, archetypes, CI) has a stable root to build on. A fresh clone must be able to produce a reproducible build from a single documented command without any undocumented environment assumptions.

This ticket is the foundation for all Phase 3 implementation work. RHI-021 (Hugo config hardening) depends on this project scaffold being committed first.

---

### Acceptance Criteria

- [ ] `hugo new site .` or equivalent manual layout has been applied; all standard Hugo directories exist at repository root:
  - [ ] `content/`
  - [ ] `layouts/`
  - [ ] `static/`
  - [ ] `assets/`
  - [ ] `data/`
  - [ ] `archetypes/`
- [ ] `hugo.toml` exists at repository root (initial stub; full hardening in RHI-021)
- [ ] `.gitignore` excludes Hugo output directory (`public/`), system files, and editor artifacts
- [ ] `README.md` documents the following at minimum:
  - [ ] Required prerequisites (Hugo version, Node version)
  - [ ] Local build command (`hugo --minify --environment production`)
  - [ ] Local dev server command (`hugo server`)
  - [ ] How to run validation scripts (once created in later workstreams)
- [ ] `docs/migration/` directory exists with a placeholder `RUNBOOK.md` covering phase-linked operational notes
- [ ] Hugo extended version (as pinned in RHI-011) is explicitly documented in `README.md` or `.tool-versions`/`.nvmrc` equivalent
- [ ] Node version is documented and consistent with `package.json` engines constraint from RHI-001
- [ ] `hugo build` (production mode) exits with code 0 on the scaffold with no content errors
- [ ] No implicit environment assumptions exist beyond what is documented in `README.md`

---

### Tasks

- [ ] Run `hugo new site . --force` in the repository root (or manually create the directory structure if Hugo binary is not available during this ticket)
- [ ] Verify all standard Hugo directories are created: `content/`, `layouts/`, `static/`, `assets/`, `data/`, `archetypes/`
- [ ] Create or update `.gitignore`:
  - [ ] Add `public/` (Hugo build output)
  - [ ] Add `resources/` (Hugo processed asset cache)
  - [ ] Add `.hugo_build.lock`
  - [ ] Verify `node_modules/` is already excluded (from Phase 1 setup)
  - [ ] Add OS/editor artifacts (`.DS_Store`, `Thumbs.db`, `.idea/`, `.vscode/` if desired)
- [ ] Create stub `hugo.toml` with at minimum `baseURL`, `languageCode`, and `title` (full configuration is RHI-021's scope)
- [ ] Update `README.md` with:
  - [ ] Hugo version prerequisite (from RHI-011 pin)
  - [ ] Node version prerequisite
  - [ ] `hugo --minify --environment production` as the production build command
  - [ ] `hugo server` as the local dev command
  - [ ] Note that quality validation scripts will be added during Phase 3
- [ ] Create `docs/migration/RUNBOOK.md` with phase-linked operational notes structure (headings for each phase, initial content for Phase 3 steps)
- [ ] Pin Hugo version in documentation or tooling config (e.g., `.tool-versions` for `asdf` users, or a comment in `README.md` referencing the exact version from RHI-011)
- [ ] Run `hugo --minify --environment production` and confirm exit code 0 on the empty scaffold
- [ ] Commit all scaffold files, `.gitignore`, `README.md`, and `docs/migration/RUNBOOK.md`
- [ ] Verify a clean clone with only documented prerequisites can replicate the build

---

### Out of Scope

- Hugo configuration hardening (taxonomies, outputs, permalinks, robots — covered by RHI-021)
- Template or partial authoring (covered by RHI-023 and RHI-024)
- Archetype creation (covered by RHI-022)
- CI workflow definition (covered by RHI-029)
- Content migration scripts (Phase 4)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-019 Done — Phase 3 Bootstrap complete | Ticket | Pending |
| RHI-011 Outcomes — Hugo version pin confirmed | Ticket | Pending |
| Hugo extended binary (pinned version) available in working environment | Tool | Pending |
| `package.json` and Node tooling from Phase 1 (RHI-001) committed | Ticket | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| `hugo new site` overwrites existing files when run on non-empty repo | Medium | High | Use `--force` flag with care; review diff before committing; manually create directories if safer | Engineering Owner |
| Hugo version mismatch between local and CI environment | Medium | High | Pin version in documentation on Day 1; add version check to `README.md` prerequisites | Engineering Owner |
| `.gitignore` missing entries causes accidental commit of build artifacts | Low | Medium | Review `.gitignore` against Hugo's official recommended ignore list before commit | Engineering Owner |
| `docs/migration/RUNBOOK.md` left as empty placeholder, never populated | Medium | Low | Create minimal operational content in this ticket; assign runbook completion to RHI-029 as a pre-deploy check | Engineering Owner |

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

- Hugo project directory structure at repository root
- `.gitignore` with build output and artifact exclusions
- Stub `hugo.toml`
- `README.md` with build and dev commands
- `docs/migration/RUNBOOK.md` operational notes stub

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- Hugo extended variant is required for SASS/SCSS processing. Even if no custom styles are used in Phase 3, extended is the safer default to avoid unblocking WS-G and WS-H asset work.
- The `docs/migration/RUNBOOK.md` is an operational document for team use. It should link to relevant phase plan details, not repeat them. Keep it brief and actionable.
- Reference: `analysis/plan/details/phase-3.md` §Workstream A: Repository Bootstrap
