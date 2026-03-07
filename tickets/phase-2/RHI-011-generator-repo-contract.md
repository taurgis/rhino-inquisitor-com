## RHI-011 · Workstream A — Generator and Repo Contract

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 2  
**Assigned to:** Engineering Owner  
**Target date:** 2026-03-19  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Lock the Hugo project layout, configuration file contract, output directory contract, environment model, and `baseURL` handling so Phase 3 scaffolding can begin with zero ambiguity. Every structural convention decided here becomes a hard dependency for the CI workflow (RHI-016), the content model (RHI-012), and the deployment artifact (Phase 3). Decisions must be documented in this ticket's Outcomes and reflected in the architecture section of `analysis/plan/details/phase-2.md`.

This workstream is the structural foundation; instability here cascades to every other workstream and Phase 3 scaffold work.

---

### Acceptance Criteria

- [ ] Hugo project directory layout is confirmed and documented:
  - [ ] `content/` — Markdown source
  - [ ] `layouts/` — templates and partials
  - [ ] `static/` — pass-through assets (images, fonts, `robots.txt`)
  - [ ] `assets/` — pipeline-processed assets (CSS, JS)
  - [ ] `data/` — structured data files
  - [ ] `public/` — build output (git-ignored, CI artifact)
- [ ] Primary config file is confirmed as `hugo.toml` at repository root (TOML format)
- [ ] `baseURL` production value is confirmed as `https://www.rhino-inquisitor.com/` (www, HTTPS, trailing slash)
- [ ] Environment model is documented:
  - [ ] `local` — development environment with relative URLs or localhost base
  - [ ] `ci` — build validation environment; production flags, no draft/future/expired content
  - [ ] `prod` — production deployment target; `baseURL` injected as environment variable or Hugo config
- [ ] CI injection method for `baseURL` is chosen and documented (environment variable override vs. `config/production/hugo.toml` overlay)
- [ ] Output directory contract is confirmed: Hugo writes to `./public/`; Pages artifact is sourced from `./public/`
- [ ] Hugo version pin strategy is documented: specific version recorded in `analysis/plan/details/phase-2.md` and will be pinned in CI via `HUGO_VERSION` env var
- [ ] Architecture decisions are recorded in the Outcomes section of this ticket

---

### Tasks

- [ ] Review `analysis/plan/details/phase-2.md` §Workstream A with engineering owner and migration owner
- [ ] Confirm Hugo directory layout as listed in Acceptance Criteria; document any deviations with rationale
- [ ] Confirm `hugo.toml` as the config file (not `config.yaml` or `config/_default/`); document reason if changed
- [ ] Confirm `baseURL` production value and trailing slash behavior
- [ ] Decide and document CI `baseURL` injection method:
  - Option 1: `HUGO_BASEURL` environment variable overriding `hugo.toml`
  - Option 2: `config/production/hugo.toml` overlay file with `baseURL` only
  - Record chosen option and rationale
- [ ] Decide and document environment model:
  - How does local development set `baseURL`?
  - How does CI distinguish build-only from deploy runs?
  - Document the `--environment` flag usage for Hugo builds
- [ ] Identify the Hugo version to use; record it explicitly (e.g. `0.145.0`)
- [ ] Confirm `public/` as the build output and Pages artifact directory
- [ ] Draft the architecture decisions summary; share with migration owner for review
- [ ] Record approved decisions in Outcomes
- [ ] Update `analysis/plan/details/phase-2.md` §Workstream A "Architecture section approved" status

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
| RHI-010 Done — Phase 2 kickoff and decision owners confirmed | Ticket | Pending |
| Engineering owner available for architecture review | Access | Pending |
| `analysis/plan/details/phase-2.md` reviewed by engineering owner | Phase | Pending |

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- Architecture decisions summary (recorded in this ticket's Outcomes)
- Updated `analysis/plan/details/phase-2.md` §Workstream A

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- The Hugo version pin is non-negotiable. "Latest" in CI is a future build-break waiting to happen. Research current stable Hugo extended version before approving.
- The `baseURL` trailing slash is load-bearing for canonical URL generation — do not omit it. Reference: Hugo docs on `baseURL` behavior with trailing slash.
- Reference: `analysis/plan/details/phase-2.md` §Workstream A, §Architecture Principles
- Reference: https://gohugo.io/getting-started/configuration/ (Hugo config docs)
- Reference: https://gohugo.io/hosting-and-deployment/hosting-on-github/ (Pages deployment guidance)
