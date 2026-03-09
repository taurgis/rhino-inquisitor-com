## RHI-015 · Workstream E — Library and Tooling Contract

**Status:** Done  
**Priority:** Medium  
**Estimate:** S  
**Phase:** 2  
**Assigned to:** Engineering Owner  
**Target date:** 2026-03-18  
**Created:** 2026-03-07  
**Updated:** 2026-03-09

---

### Goal

Confirm and document the complete tooling and library list for the migration pipeline and Hugo build so Phase 3 can install dependencies and write scripts with a locked set of packages. This workstream is deliberately scoped narrowly: evaluate only the packages listed in `analysis/plan/details/phase-2.md` §Workstream E, justify each inclusion, and explicitly decide any optional packages. Avoid adding new dependencies unless there is a concrete, documented need.

Phase 4 pipeline scripts and Phase 3 validation scripts both depend on this approved list. Undocumented dependencies introduced later are an operational risk and a security surface.

---

### Acceptance Criteria

- [x] All core tooling decisions are confirmed and recorded:
  - [x] Hugo — confirmed as SSG; version pin recorded (from RHI-011)
  - [x] GitHub Pages Actions deployment trio confirmed as the platform contract: `actions/configure-pages@v5`, `actions/upload-pages-artifact@v4`, `actions/deploy-pages@v4` (workflow implementation remains in RHI-016)
- [x] All migration and audit tooling decisions are confirmed:
  - [x] `turndown@7.2.2` — HTML-to-Markdown conversion; inclusion justified for Phase 3/4 conversion work
  - [x] `@joplin/turndown-plugin-gfm@1.0.64` — GFM tables and strikethrough; inclusion justified for Markdown fidelity
  - [x] `fast-glob@3.3.3` — file pattern matching for batch processing; retained from current repo baseline and required by the Phase 1 tooling plan
  - [x] `gray-matter@4.0.3` — front matter parsing for validation scripts; inclusion justified
  - [x] `fast-xml-parser@5.4.2` — WXR XML parsing; retained from current repo baseline and required by the Phase 1 tooling plan
  - [x] Node native `fetch` — approved for new Phase 3+ HTTP fetching under the repo Node `>=18` baseline; existing Phase 1 `undici` usage is grandfathered but not expanded
  - [x] `p-limit@7.3.0` — concurrency limiter for batch operations; retained from current repo baseline and required by the Phase 1 tooling plan
- [x] Optional package decisions are recorded with explicit accept/defer/reject and rationale:
  - [x] HTML DOM parser (`node-html-parser` or `cheerio`) — deferred to Phase 4 pending an early conversion QA trigger
  - [x] Output minification tool (e.g. `html-minifier-terser`) — deferred until correctness is stable and evidence shows a material need
- [x] Explicitly avoided packages are listed with rationale:
  - [x] Heavy client-side frameworks (React, Vue, etc.) — excluded; site remains mostly static
  - [x] Overlapping SEO plugins — excluded; SEO logic is template-driven per RHI-014 contract
- [x] Security advisory check result is recorded for all new packages (any package not yet installed in the project `package.json`)
- [x] `package.json` will be updated in Phase 3 with the approved list; that update plan is noted here
- [x] Tooling contract is recorded in Outcomes and referenced from `analysis/plan/details/phase-2.md`

---

### Tasks

- [x] Review `analysis/plan/details/phase-2.md` §Workstream E with engineering owner
- [x] Confirm which packages from the Phase 1 tooling plan (`analysis/plan/details/phase-1.md` §Tooling for Phase 1) are shared with Phase 2 and Phase 3 needs; identify gaps that require new packages
- [x] Evaluate each package in the core and migration tooling list:
  - [x] For each package: confirm latest stable version, verify no known critical vulnerabilities, record justification
  - [x] Check GitHub Advisory Database guidance and `npm audit` output for each new package
- [x] Decide on HTML DOM parser: defer to Phase 4 with a documented trigger condition
- [x] Decide on `undici` vs. Node native `fetch`: record runtime version constraint and choice
- [x] Explicitly defer output minification tooling with documented rationale and a trigger condition for re-evaluation
- [x] Confirm that no client-side framework or overlapping SEO plugin will be added
- [x] Document the Phase 3 `package.json` update plan: which packages will be added in Phase 3 vs. Phase 4
- [x] Record all decisions in Outcomes
- [x] Update `analysis/plan/details/phase-2.md` §Workstream E

---

### Out of Scope

- Running `npm install` or updating `package.json` (Phase 3)
- Writing any pipeline script or utility function
- Evaluating Hugo themes or UI component libraries

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-010 Done — Phase 2 kickoff and decision owners confirmed | Ticket | Done |
| RHI-011 Done — Hugo version pin identified | Ticket | Done |
| Phase 1 tooling plan reviewed — shared package requirements identified (`analysis/plan/details/phase-1.md` §Tooling for Phase 1) | Phase | Done |
| Engineering owner available for tooling evaluation | Access | Done |

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

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Completed. Workstream E is now the approved tooling contract for repo-side migration, validation, and Hugo build support.

Approved decisions:

- Core tooling contract:
  - Hugo Extended `0.156.0` remains the pinned SSG/build tool per RHI-011. It is treated as CI tooling, not an npm dependency.
  - GitHub Pages custom workflow usage is locked to the official Pages Actions trio `actions/configure-pages@v5`, `actions/upload-pages-artifact@v4`, and `actions/deploy-pages@v4`. Detailed workflow semantics remain owned by RHI-016.
- Approved repo-side packages:
  - Existing baseline retained: `fast-glob@3.3.3`, `fast-xml-parser@5.4.2`, `p-limit@7.3.0`
  - New exact pins approved for Phase 3: `turndown@7.2.2`, `@joplin/turndown-plugin-gfm@1.0.64`, `gray-matter@4.0.3`
- HTTP client contract:
  - New Phase 3+ scripts standardize on Node native `fetch` under the repo's Node `>=18` baseline.
  - Existing Phase 1 scripts may continue using `undici@7.22.0` until later cleanup, but RHI-015 does not approve new `undici` usage for future work unless a later ticket requires Undici-specific APIs.
- Optional tooling decisions:
  - HTML DOM parser is deferred to Phase 4. Trigger: approve `node-html-parser` or `cheerio` only if early conversion QA finds repeated DOM-cleanup cases that cannot be handled acceptably by `turndown` plus the GFM plugin alone.
  - Output minification tooling is deferred. Trigger: reconsider only if artifact-budget review or representative performance evidence shows that markup/output minification is materially needed after correctness, image handling, and template cleanup are stable.
- Explicit avoid list:
  - Heavy client-side frameworks remain excluded because the site remains mostly static.
  - SEO plugins remain excluded because SEO behavior stays template-driven per RHI-014.
- Security evidence:
  - `npm audit --json` was run on `2026-03-09` against a disposable temp manifest containing the newly approved packages plus deferred candidates (`node-html-parser`, `cheerio`, `html-minifier-terser`) and returned `0` known vulnerabilities.
- Phase 1 baseline review:
  - `zod@4.3.6` and `csv-stringify@6.6.0` remain existing Phase 1 dependencies, but no additional shared Phase 3/4 contract scope was identified in this workstream.
- Phase 3 `package.json` update plan:
  - Add exact pins for `turndown`, `@joplin/turndown-plugin-gfm`, and `gray-matter`
  - Retain existing `fast-glob`, `fast-xml-parser`, and `p-limit` pins
  - Prefer native `fetch` for new scripts and do not add new `undici` imports
  - Do not add a DOM parser or output minifier unless the recorded trigger conditions are met

**Delivered artefacts:**

- Approved tooling list with versions (recorded in this ticket's Outcomes)
- Security advisory check results for new packages
- Updated `analysis/plan/details/phase-2.md` §Workstream E
- Documentation note: `analysis/documentation/rhi-015-library-tooling-contract-2026-03-09.md`

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-09 | In Progress | Compared Workstream E against the current `package.json` baseline, the Phase 1 tooling plan, RHI-011, and official Hugo, GitHub Pages, Node.js, and npm guidance |
| 2026-03-09 | In Progress | Owner decisions recorded: use Node native `fetch` for new scripts, defer the HTML DOM parser to a Phase 4 QA trigger, and defer output minification until evidence shows material need |
| 2026-03-09 | Done | Exact package pins, security evidence, and Phase 3 package update plan recorded; Workstream E contract is approved and Phase 2 plan/index are updated |

---

### Notes

- This ticket is intentionally lower priority than WS-A, WS-B, WS-C, and WS-D because tooling choices are more reversible than architecture decisions. However, it must complete before Phase 3 scripts are written.
- `gray-matter` is the standard Hugo front matter parser for Node.js tooling; it handles TOML, YAML, and JSON front matter. The Hugo configuration file being `hugo.toml` (TOML format) does **not** imply that content front matter must also use TOML — Hugo supports YAML (`---`), TOML (`+++`), and JSON (`{`) front matter independently of the config file format. The front matter format for migrated content must be explicitly decided in RHI-012 (content model contract); confirm that `gray-matter` supports the chosen format.
- Reference: `analysis/plan/details/phase-2.md` §Workstream E
- Reference: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- Reference: https://nodejs.org/api/globals.html#fetch
- Reference: https://docs.npmjs.com/specifying-dependencies-and-devdependencies-in-a-package-json-file
