## RHI-017 · Validation Gates Contract Definition

**Status:** Open  
**Priority:** High  
**Estimate:** M  
**Phase:** 2  
**Assigned to:** Migration Owner  
**Target date:** 2026-03-21  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Define all seven validation gates that Phase 3 and subsequent phases must implement, so that engineers know exactly what each gate checks, what a pass/fail looks like, and which phase is responsible for implementing and running it. Gates defined here are not implemented in Phase 2 — they are specified. Phase 3 implements them; Phase 8 verifies them as launch-readiness criteria.

Without a precise validation gate specification, Phase 3 build and CI tooling will be written without a clear target, and Phase 8 launch-readiness checks will lack an objective pass/fail standard. This ticket is also the authoritative source for the CI gate requirements referenced in `analysis/plan/details/phase-2.md` §Required Validation Gates.

---

### Acceptance Criteria

- [ ] All seven validation gates are defined with name, description, pass/fail criteria, implementation phase, and owning script or tool:
  - [ ] **Gate 1 — URL Parity Gate**: every URL in `migration/url-manifest.json` with `disposition: keep` appears in Hugo's built output; every `disposition: merge` URL has a corresponding alias HTML page at the legacy path; every `disposition: retire` URL returns 404 behavior
  - [ ] **Gate 2 — Redirect Correctness Gate**: every alias page resolves to its intended destination in one hop; no redirect chains; redirect mechanism type is documented (client-side alias vs. server-side 301/308) and matches the approved contract from RHI-013
  - [ ] **Gate 3 — SEO Gate**: every indexable built page has a non-empty `<title>`, non-empty `<meta name="description">`, absolute `<link rel="canonical">`, and at minimum `og:title` and `og:url` tags; structured data is valid JSON-LD on article templates
  - [ ] **Gate 4 — Link Integrity Gate**: no broken internal links in the generated site; no referenced static assets return 404; external links are checked best-effort (non-blocking on CI, blocking on launch)
  - [ ] **Gate 5 — Build Gate**: `hugo --minify --environment production` exits with code 0; no draft/future/expired content in output; build is deterministic (identical input produces identical output)
  - [ ] **Gate 6 — Deployment Integrity Gate**: Pages deploy job uses correct permissions; artifact is valid (not empty, within size limit); custom domain configuration is confirmed post-deploy
  - [ ] **Gate 7 — Launch Readiness Gate**: manual verification checklist — robots.txt correct, sitemap accessible, core template social preview renders correctly in social debugger, no unintended noindex on production pages
- [ ] For each gate: the script entry point or tool name is identified (even if the script does not exist yet)
- [ ] For each gate: the phase responsible for implementing the gate is confirmed
- [ ] For each gate: whether the gate is blocking for CI deploy vs. advisory-only is documented
- [ ] Pagination priority manifest (`migration/pagination-priority-manifest.json`) is identified as a pre-condition for Gate 1 (URL parity cannot pass if pagination routes are unresolved)
- [ ] The tightened validation checklist from `analysis/plan/details/phase-2.md` §Tightened Validation Checklist is mapped to gates (each checklist item is traceable to a gate)
- [ ] Validation gate contract is recorded in Outcomes and referenced from `analysis/plan/details/phase-2.md`

---

### Tasks

- [ ] Review `analysis/plan/details/phase-2.md` §Required Validation Gates and §Tightened Validation Checklist with migration owner and engineering owner
- [ ] For each of the seven gates, draft a specification covering:
  - Gate name and ID
  - What it checks
  - Pass condition (specific, binary)
  - Fail condition and consequence (blocking deploy / advisory)
  - Implementation phase (3, 4, 8, etc.)
  - Owning script or tool (`npm run check:url-parity`, `npm run check:seo`, etc.)
  - Execution frequency (every CI build, pre-deploy only, launch only)
- [ ] Define Gate 1 (URL Parity) in detail — this is the most complex gate:
  - Input: `migration/url-manifest.json` and `public/` output directory
  - Logic: for each manifest entry, check corresponding output path or alias file exists
  - Script: `scripts/check-url-parity.js` (to be created in Phase 3)
  - Blocking: yes, blocks deploy
- [ ] Define Gate 3 (SEO) in detail — second most complex gate:
  - Input: built HTML files in `public/`
  - Logic: parse each `.html` file; assert required meta tags are non-empty
  - Script: `scripts/check-seo.js` (to be created in Phase 3)
  - Blocking: yes, blocks deploy
- [ ] Define Gate 4 (Link Integrity):
  - Tool decision: custom script vs. `broken-link-checker` or `lychee` — record choice and rationale
  - Internal link checking: blocking for CI
  - External link checking: non-blocking for CI; blocking for launch
- [ ] Map each item in the tightened validation checklist (7 items) to its corresponding gate
- [ ] Identify which `package.json` script stubs need to be created in Phase 3 for each gate
- [ ] Confirm with engineering owner that all gates are implementable within the Hugo + Pages + Node toolchain
- [ ] Record approved gate specifications in Outcomes
- [ ] Update `analysis/plan/details/phase-2.md` §Required Validation Gates with "Specified in RHI-017" status

---

### Out of Scope

- Implementing any validation script (Phase 3)
- Running any gate against production or staging (Phase 3 and Phase 8)
- Defining monitoring or alerting post-launch (Phase 9)
- Writing GitHub Actions workflow steps for gates (Phase 3)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-010 Done — Phase 2 kickoff confirmed | Ticket | Pending |
| RHI-011 In Progress — Hugo output directory and build command confirmed | Ticket | Pending |
| RHI-012 In Progress — content model defines what constitutes a valid indexable page | Ticket | Pending |
| RHI-013 In Progress — redirect contract defines expected redirect behavior for Gate 1 and Gate 2 | Ticket | Pending |
| RHI-014 In Progress — SEO contract defines the pass criteria for Gate 3 | Ticket | Pending |
| RHI-016 In Progress — deployment contract defines the pass criteria for Gate 6 | Ticket | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Gate specification is too vague for Phase 3 engineers to implement without interpretation | Medium | High | Each gate must have a specific, binary pass condition — not "looks correct" but "exits with code 0" or "all assertions pass" | Migration Owner |
| URL parity gate cannot be defined until `pagination-priority-manifest.json` is populated | Medium | Medium | Define Gate 1 spec with a dependency note on the pagination manifest; Phase 3 implementation blocked until manifest exists | Migration Owner |
| Broken-link tool choice creates an unsupported dependency or license conflict | Low | Medium | Evaluate two options (custom script vs. third-party tool) before committing; prefer simple custom script for portability | Engineering Owner |
| Gates overlap with each other causing double-implementation effort in Phase 3 | Low | Low | Map tightened checklist to gates to identify coverage; eliminate duplication before Phase 3 | Engineering Owner |

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

- Validation gate specification table (seven gates with full spec, recorded in this ticket's Outcomes)
- Tightened checklist-to-gate mapping
- Updated `analysis/plan/details/phase-2.md` §Required Validation Gates

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- Gates must be implementable in CI before launch readiness is possible. If any gate cannot be automated, document the manual check procedure explicitly and assign an owner for Phase 8.
- The URL parity gate is the highest-value gate in the entire pipeline. It is the automated proof that no URL was accidentally dropped. Invest the most specification rigor here.
- Consider that `npm run` script names chosen here become the canonical entry points for CI. Name them meaningfully: `check:url-parity`, `check:seo`, `check:links`, `validate:frontmatter`.
- Reference: `analysis/plan/details/phase-2.md` §Required Validation Gates, §Tightened Validation Checklist
