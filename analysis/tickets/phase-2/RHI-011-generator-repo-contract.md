## RHI-011 · Workstream A — Generator and Repo Contract

**Status:** Done  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 2  
**Assigned to:** Engineering Owner  
**Target date:** 2026-03-19  
**Created:** 2026-03-07  
**Updated:** 2026-03-09

---

### Goal

Lock the Hugo project layout, configuration file contract, output directory contract, environment model, and `baseURL` handling so Phase 3 scaffolding can begin with zero ambiguity. Every structural convention decided here becomes a hard dependency for the CI workflow (RHI-016), the content model (RHI-012), and the deployment artifact (Phase 3). Decisions must be documented in this ticket's Outcomes and reflected in the architecture section of `analysis/plan/details/phase-2.md`.

This workstream is the structural foundation; instability here cascades to every other workstream and Phase 3 scaffold work.

---

### Acceptance Criteria

- [x] Hugo project directory layout is confirmed and documented:
  - [x] `content/` — Markdown source
  - [x] `layouts/` — templates and partials
  - [x] `static/` — pass-through assets (images, fonts, `robots.txt`)
  - [x] `assets/` — pipeline-processed assets (CSS, JS)
  - [x] `data/` — structured data files
  - [x] `public/` — build output (git-ignored, CI artifact)
- [x] Primary config file is confirmed as `hugo.toml` at repository root (TOML format)
- [x] `baseURL` production value is confirmed as `https://www.rhino-inquisitor.com/` (www, HTTPS, trailing slash)
- [x] Environment model is documented:
  - [x] `local` — `hugo server` development mode for local preview; no separate production overlay is introduced in Phase 2
  - [x] `ci` — build validation environment using production semantics (`--environment production --gc --minify`), excluding draft/future/expired content
  - [x] `prod` — production deployment target reusing the exact CI-built artifact and canonical `baseURL` from root `hugo.toml`
- [x] Variable handling contract for `baseURL` is chosen and documented: root `hugo.toml` is the canonical production source; `HUGO_BASEURL` is reserved only for exceptional preview overrides; no `config/production/hugo.toml` overlay is introduced in Phase 2
- [x] Output directory contract is confirmed: Hugo writes to `./public/`; Pages artifact is sourced from `./public/`
- [x] Hugo version pin strategy is documented: Hugo Extended `0.157.0` is recorded in `analysis/plan/details/phase-2.md` and will be pinned in CI via `HUGO_VERSION=0.157.0`
- [x] Architecture decisions are recorded in the Outcomes section of this ticket

---

### Tasks

- [x] Review `analysis/plan/details/phase-2.md` §Workstream A with engineering owner and migration owner
- [x] Confirm Hugo directory layout as listed in Acceptance Criteria; no deviations approved for Phase 3 entry
- [x] Confirm `hugo.toml` as the config file (not `config.yaml` or `config/_default/`)
- [x] Confirm `baseURL` production value and trailing slash behavior
- [x] Decide and document the `baseURL` variable-handling contract:
  - [x] Root `hugo.toml` is the canonical production source of truth
  - [x] Standard production CI builds do not introduce a separate `config/production/` overlay
  - [x] `HUGO_BASEURL` remains available only for exceptional preview overrides if a future non-production host is introduced
- [x] Decide and document environment model:
  - [x] Local development uses `hugo server` development behavior for preview
  - [x] CI uses `hugo --environment production --gc --minify` for validation and artifact generation
  - [x] Production deploy reuses the exact CI-built `public/` artifact
- [x] Identify the Hugo version to use; record Hugo Extended `0.157.0` explicitly (`v0.157.0` release tag)
- [x] Confirm `public/` as the build output and Pages artifact directory
- [x] Draft the architecture decisions summary; share with migration owner for review
- [x] Record approved decisions in Outcomes
- [x] Update `analysis/plan/details/phase-2.md` §Workstream A architecture section to reflect the approved contract

---

### Out of Scope

- Writing `hugo.toml` configuration file (Phase 3 — RHI-019 or equivalent scaffold ticket)
- Creating any template, partial, or layout file (Phase 3)
- Setting up the GitHub Actions CI workflow (covered by RHI-016)
- Installing Hugo locally (covered by Phase 3 bootstrap)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-010 Done — Phase 2 kickoff and decision owners confirmed | Ticket | Done |
| Engineering owner available for architecture review | Access | Done |
| `analysis/plan/details/phase-2.md` reviewed by engineering owner | Phase | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Disagreement on config format (TOML vs YAML) causes delay | Low | Medium | Default to TOML per Hugo documentation recommendation; document override rationale if changed | Engineering Owner |
| `baseURL` injection method unclear causing CI misconfiguration | Medium | High | Decide and document in this ticket before Phase 3 begins; Phase 3 scaffold must match chosen approach | Engineering Owner |
| Hugo version mismatch between local and CI environments | Medium | Medium | Record exact version number in this ticket and enforce via `HUGO_VERSION` env var in CI workflow | Engineering Owner |
| Directory layout deviation causes template resolution failures in Phase 3 | Low | High | Validate layout against Hugo official docs before approval; any deviation requires explicit justification | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Completed. Workstream A is now the approved repo contract for Phase 3 scaffolding and downstream Phase 2 contracts.

Approved decisions:

- Hugo repository layout is locked to `content/`, `layouts/`, `static/`, `assets/`, `data/`, with `public/` as generated output only.
- Primary config file is root `hugo.toml` in TOML format. Phase 2 does not introduce `config/_default/` or `config/production/` overlays.
- Canonical production `baseURL` is locked to `https://www.rhino-inquisitor.com/` with trailing slash.
- Environment model is fixed as:
  - `local`: `hugo server` development behavior for preview and authoring.
  - `ci`: production-semantics validation build using `hugo --environment production --gc --minify` and producing `./public/`.
  - `prod`: deploy the exact `./public/` artifact validated in CI; no separate production-only config tree is required.
- `baseURL` handling contract is fixed as: root `hugo.toml` is the canonical production source of truth; standard production CI builds do not override it; `HUGO_BASEURL` is reserved for exceptional future preview-host use only.
- Hugo version pin is fixed to Hugo Extended `0.157.0` (`v0.157.0` release tag), to be implemented in CI as `HUGO_VERSION=0.157.0`.
- Pages artifact contract is fixed to `./public/` only.

**Delivered artefacts:**

- Architecture decisions summary (recorded in this ticket's Outcomes)
- Updated `analysis/plan/details/phase-2.md` §Workstream A
- Updated `analysis/main-plan.MD` Phase 2/3 repo-contract summary
- Documentation note: `analysis/documentation/phase-2/rhi-011-generator-repo-contract-2026-03-09.md`

**Deviations from plan:**

- The original ticket framed `baseURL` handling as a choice between CI env override and `config/production/` overlay. Approved owner direction narrows this further: root `hugo.toml` is the production source of truth, and `HUGO_BASEURL` is retained only as an escape hatch for future preview builds.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-09 | In Progress | Reviewed Workstream A against the Phase 2 plan, Hugo repo skill, Hugo specialist guidance, and official Hugo/GitHub Pages documentation; confirmed that the repo already standardizes on root `hugo.toml`, canonical `baseURL`, and pinned `HUGO_VERSION` |
| 2026-03-09 | In Progress | Owner decision recorded: keep root `hugo.toml` as the canonical production source, do not introduce `config/production/` in Phase 2, reserve `HUGO_BASEURL` for exceptional preview overrides only, and pin Hugo Extended release `v0.157.0` (`HUGO_VERSION=0.157.0`) |
| 2026-03-09 | Done | All Workstream A acceptance criteria satisfied; Phase 2 plan and main plan updated to reflect the approved repo contract, unblocking downstream Phase 2 contracts and Phase 3 scaffolding |

---

### Notes

- The Hugo version pin is non-negotiable. "Latest" in CI is a future build-break waiting to happen. Research current stable Hugo extended version before approving.
- The `baseURL` trailing slash is load-bearing for canonical URL generation — do not omit it. Reference: Hugo docs on `baseURL` behavior with trailing slash.
- Reference: `analysis/plan/details/phase-2.md` §Workstream A, §Architecture Principles
- Reference: https://gohugo.io/configuration/introduction/ (Hugo config docs)
- Reference: https://gohugo.io/commands/hugo/ (Hugo build flags and environment handling)
- Reference: https://gohugo.io/host-and-deploy/host-on-github-pages/ (Pages deployment guidance)
