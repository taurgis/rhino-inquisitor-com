## RHI-015 · Workstream E — Library and Tooling Contract

**Status:** Open  
**Priority:** Medium  
**Estimate:** S  
**Phase:** 2  
**Assigned to:** Engineering Owner  
**Target date:** 2026-03-18  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Confirm and document the complete tooling and library list for the migration pipeline and Hugo build so Phase 3 can install dependencies and write scripts with a locked set of packages. This workstream is deliberately scoped narrowly: evaluate only the packages listed in `analysis/plan/details/phase-2.md` §Workstream E, justify each inclusion, and explicitly decide any optional packages. Avoid adding new dependencies unless there is a concrete, documented need.

Phase 4 pipeline scripts and Phase 3 validation scripts both depend on this approved list. Undocumented dependencies introduced later are an operational risk and a security surface.

---

### Acceptance Criteria

- [ ] All core tooling decisions are confirmed and recorded:
  - [ ] Hugo — confirmed as SSG; version pin recorded (from RHI-011)
  - [ ] GitHub Pages Actions deployment trio confirmed: `actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages` (from RHI-016)
- [ ] All migration and audit tooling decisions are confirmed:
  - [ ] `turndown` — HTML-to-Markdown conversion; inclusion justified
  - [ ] `@joplin/turndown-plugin-gfm` — GFM tables and strikethrough; inclusion justified
  - [ ] `fast-glob` — file pattern matching for batch processing; required by Phase 1 plan tooling
  - [ ] `gray-matter` — front matter parsing for validation scripts; inclusion justified
  - [ ] `fast-xml-parser` — WXR XML parsing; required by Phase 1 plan tooling
  - [ ] `undici` (or Node native `fetch`) — HTTP fetching for crawl and validation; decision recorded
  - [ ] `p-limit` — concurrency limiter for batch operations; required by Phase 1 plan tooling
- [ ] Optional package decisions are recorded with explicit accept/defer/reject and rationale:
  - [ ] HTML DOM parser (e.g. `node-html-parser` or `cheerio`) — for conversion cleanup edge cases
  - [ ] Output minification tool (e.g. `html-minifier-terser`) — deferred until correctness is stable
- [ ] Explicitly avoided packages are listed with rationale:
  - [ ] Heavy client-side frameworks (React, Vue, etc.) — excluded; mostly static pages
  - [ ] Overlapping SEO plugins — excluded; SEO logic is template-driven per RHI-014 contract
- [ ] Security advisory check result is recorded for all new packages (any package not yet installed in the project `package.json`)
- [ ] `package.json` will be updated in Phase 3 with the approved list; that update plan is noted here
- [ ] Tooling contract is recorded in Outcomes and referenced from `analysis/plan/details/phase-2.md`

---

### Tasks

- [ ] Review `analysis/plan/details/phase-2.md` §Workstream E with engineering owner
- [ ] Confirm which packages from the Phase 1 tooling plan (`analysis/plan/details/phase-1.md` §Tooling for Phase 1) are shared with Phase 2 and Phase 3 needs; identify gaps that require new packages
- [ ] Evaluate each package in the core and migration tooling list:
  - For each package: confirm latest stable version, verify no known critical vulnerabilities, record justification
  - Check GitHub Advisory Database or `npm audit` output for each new package
- [ ] Decide on HTML DOM parser: `node-html-parser` (lightweight) vs. `cheerio` (jQuery-like API) — record choice and reason, or explicitly defer to Phase 4 with a documented trigger condition
- [ ] Decide on `undici` vs. Node native `fetch`: record runtime version constraint and choice
- [ ] Explicitly defer or reject output minification tooling with documented rationale and a trigger condition for re-evaluation
- [ ] Confirm that no client-side framework or overlapping SEO plugin will be added
- [ ] Document the Phase 3 `package.json` update plan: which packages will be added in Phase 3 vs. Phase 4
- [ ] Record all decisions in Outcomes
- [ ] Update `analysis/plan/details/phase-2.md` §Workstream E

---

### Out of Scope

- Running `npm install` or updating `package.json` (Phase 3)
- Writing any pipeline script or utility function
- Evaluating Hugo themes or UI component libraries

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-010 Done — Phase 2 kickoff and decision owners confirmed | Ticket | Pending |
| RHI-011 In Progress — Hugo version pin identified | Ticket | Pending |
| Phase 1 tooling plan reviewed — shared package requirements identified (`analysis/plan/details/phase-1.md` §Tooling for Phase 1) | Phase | Pending |
| Engineering owner available for tooling evaluation | Access | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| A required package has an unpatched critical vulnerability | Low | High | Run security advisory check for every new package before approval; do not approve packages with critical unpatched CVEs | Engineering Owner |
| HTML DOM parser choice creates conversion quality problems in Phase 4 | Medium | Medium | Evaluate against a sample of WordPress post HTML before committing; defer if evaluation is not possible in Phase 2 | Engineering Owner |
| Dependency version drift between team members' environments | Low | Medium | Exact version pinning in `package.json` with `--save-exact`; committed `package-lock.json` enforces reproducibility | Engineering Owner |
| Scope creep — team wants to add unlisted packages during Phase 3 | Medium | Low | This contract is the approved list; additions require a new ticket or a documented amendment | Engineering Owner |

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

- Approved tooling list with versions (recorded in this ticket's Outcomes)
- Security advisory check results for new packages
- Updated `analysis/plan/details/phase-2.md` §Workstream E

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- This ticket is intentionally lower priority than WS-A, WS-B, WS-C, and WS-D because tooling choices are more reversible than architecture decisions. However, it must complete before Phase 3 scripts are written.
- `gray-matter` is the standard Hugo front matter parser for Node.js tooling; it handles TOML, YAML, and JSON front matter. The Hugo configuration file being `hugo.toml` (TOML format) does **not** imply that content front matter must also use TOML — Hugo supports YAML (`---`), TOML (`+++`), and JSON (`{`) front matter independently of the config file format. The front matter format for migrated content must be explicitly decided in RHI-012 (content model contract); confirm that `gray-matter` supports the chosen format.
- Reference: `analysis/plan/details/phase-2.md` §Workstream E
