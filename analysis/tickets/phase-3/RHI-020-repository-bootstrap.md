## RHI-020 · Workstream A — Repository Bootstrap

**Status:** Done  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 3  
**Assigned to:** Engineering Owner  
**Target date:** 2026-03-26  
**Created:** 2026-03-07  
**Updated:** 2026-03-09

---

### Goal

Initialize the Hugo project structure and establish a deterministic local development baseline so that every subsequent Phase 3 workstream (templates, config, archetypes, CI) has a stable root to build on. A fresh clone must be able to produce a reproducible build from a single documented command without any undocumented environment assumptions.

This ticket is the foundation for all Phase 3 implementation work. RHI-021 (Hugo config hardening) depends on this project scaffold being committed first.

---

### Acceptance Criteria

- [x] Manual scaffold equivalent to `hugo new site .` has been applied; all standard Hugo source directories exist under `src/` while root `hugo.toml` remains authoritative:
  - [x] `src/content/`
  - [x] `src/layouts/`
  - [x] `src/static/`
  - [x] `src/assets/`
  - [x] `src/data/`
  - [x] `src/archetypes/`
- [x] `hugo.toml` exists at repository root (initial stub; full hardening in RHI-021)
- [x] `.gitignore` excludes Hugo output directory (`public/`), system files, and editor artifacts
- [x] `README.md` documents the following at minimum:
  - [x] Required prerequisites (Hugo version, Node version)
  - [x] Local build command (`hugo --minify --environment production`)
  - [x] Local dev server command (`hugo server`)
  - [x] How to run validation scripts (once created in later workstreams)
- [x] `docs/migration/` directory exists with a placeholder `RUNBOOK.md` covering phase-linked operational notes
- [x] Hugo extended version (as pinned in RHI-011) is explicitly documented in `README.md`
- [x] Node version is documented and consistent with `package.json` engines constraint from RHI-001
- [x] `hugo build` (production mode) exits with code 0 on the scaffold with no content errors
- [x] No implicit environment assumptions exist beyond what is documented in `README.md`

---

### Tasks

- [x] Manually create the Phase 2-approved directory structure instead of running `hugo new site . --force` in the populated repository root
- [x] Verify all standard Hugo directories are created under `src/`: `src/content/`, `src/layouts/`, `src/static/`, `src/assets/`, `src/data/`, `src/archetypes/`
- [x] Create or update `.gitignore`:
  - [x] Add `public/` (Hugo build output)
  - [x] Add `resources/` (Hugo processed asset cache)
  - [x] Add `.hugo_build.lock`
  - [x] Verify `node_modules/` is already excluded (from Phase 1 setup)
  - [x] Add OS/editor artifacts (`.DS_Store`, `Thumbs.db`, `.idea/`, `.vscode/`)
- [x] Create stub `hugo.toml` with at minimum `baseURL`, `languageCode`, and `title` (full configuration is RHI-021's scope)
- [x] Update `README.md` with:
  - [x] Hugo version prerequisite (from RHI-011 pin)
  - [x] Node version prerequisite
  - [x] `hugo --minify --environment production` as the production build command
  - [x] `hugo server` as the local dev command
  - [x] Note that quality validation scripts will be added during Phase 3
- [x] Create `docs/migration/RUNBOOK.md` with phase-linked operational notes structure (headings for each phase, initial content for Phase 3 steps)
- [x] Pin Hugo version in documentation by referencing the exact version from RHI-011 in `README.md`
- [x] Run `hugo --minify --environment production` and confirm exit code 0 on the empty scaffold
- [ ] Verify a clean clone with only documented prerequisites can replicate the build
- [ ] Commit all scaffold files, `.gitignore`, `README.md`, and `docs/migration/RUNBOOK.md`

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
| RHI-019 Done — Phase 3 Bootstrap complete | Ticket | Done |
| RHI-011 Outcomes — Hugo version pin confirmed | Ticket | Done |
| Hugo extended binary (pinned version) available in working environment | Tool | Done |
| `package.json` and Node tooling from Phase 1 (RHI-001) committed | Ticket | Done |

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
- [x] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Completed. Workstream A now provides the minimal Hugo scaffold required by the approved Phase 2 repo contract without overwriting the existing planning-first repository structure.

Key decisions implemented:

- Used a manual scaffold instead of `hugo new site . --force` because the repository already contains tracked planning artefacts, root docs, and package metadata.
- Added the approved Hugo source directories under `src/` (`src/content/`, `src/layouts/`, `src/static/`, `src/assets/`, `src/data/`, `src/archetypes/`) and kept optional Hugo directories out of scope for this ticket.
- Added root `hugo.toml` with the locked production `baseURL`, `languageCode`, and title stub only; taxonomy, outputs, robots, feed, and permalink hardening remain in RHI-021.
- Root `hugo.toml` now explicitly points Hugo component directories at `src/` while preserving the root-level `public/` artifact contract.
- Expanded root documentation so contributors can build and preview the scaffold with documented prerequisites only.

**Delivered artefacts:**

- Hugo project directory structure under `src/`
- `.gitignore` with build output and artifact exclusions
- Stub `hugo.toml`
- `README.md` with build and dev commands
- `docs/migration/RUNBOOK.md` operational notes stub
- `analysis/documentation/phase-3/rhi-020-repository-bootstrap-2026-03-09.md`

**Deviations from plan:**

- Manual scaffolding was used in place of `hugo new site . --force` to avoid accidental overwrite risk in the non-empty repository while preserving the same required directory contract.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-09 | In Progress | Reviewed the approved Phase 2 repo contract, Hugo specialist guidance, QA acceptance evidence, and official Hugo/GitHub Pages documentation; confirmed RHI-020 should stay limited to manual scaffold, root config stub, ignore rules, README command guidance, and the migration runbook. |
| 2026-03-09 | In Progress | Added the approved Hugo source directories under `src/`, kept root `hugo.toml` as the canonical config entry point, preserved root `public/` output, and updated README and runbook guidance without introducing config overlays, template logic, or deployment files reserved for later Phase 3 tickets. |
| 2026-03-09 | In Progress | Verified `hugo config` resolves all Hugo component directories from `src/` and confirmed `hugo --minify --environment production` exits with code 0 from repository root. |

---

### Notes

- Hugo extended variant is required for SASS/SCSS processing. Even if no custom styles are used in Phase 3, extended is the safer default to avoid unblocking WS-G and WS-H asset work.
- The `docs/migration/RUNBOOK.md` is an operational document for team use. It should link to relevant phase plan details, not repeat them. Keep it brief and actionable.
- Reference: `analysis/plan/details/phase-3.md` §Workstream A: Repository Bootstrap
