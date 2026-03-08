## RHI-019 · Phase 3 Bootstrap: Kickoff and Environment Readiness

**Status:** Open  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 3  
**Assigned to:** Migration Owner  
**Target date:** 2026-03-25  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Confirm that Phase 2 sign-off is complete, all Phase 2 decision contracts are accessible and understood by the Phase 3 team, and that every prerequisite for scaffolding work is in place before any workstream begins. This ticket is the hard gate for all Phase 3 workstream tickets (RHI-020 through RHI-029). No Phase 3 workstream should begin until this ticket is `Done`.

Without verified access to Phase 2 outputs — particularly the approved `hugo.toml` config contract, the front matter contract, the redirect contract, and the validation gate specifications — the scaffold work will be built on unconfirmed decisions, leading to expensive rework in later phases.

---

### Acceptance Criteria

- [ ] Phase 2 sign-off (RHI-018) is `Done` and `migration/phase-2-signoff.md` is committed
- [ ] Migration owner, SEO owner, and engineering owner are confirmed for Phase 3
- [ ] All Phase 3 workstream owners have read `analysis/plan/details/phase-3.md` and confirmed understanding
- [ ] Phase 2 decision contracts are accessible to all Phase 3 workstream owners:
  - [ ] RHI-011 Outcomes — Hugo version pin, project layout, `baseURL`, environment model confirmed
  - [ ] RHI-012 Outcomes — Front matter contract (mandatory fields, `draft` lifecycle, URL normalization rules) confirmed
  - [ ] RHI-013 Outcomes — Route/redirect contract (mechanism, threshold, legacy endpoints, pagination policy) confirmed
  - [ ] RHI-014 Outcomes — SEO partial architecture obligations confirmed
  - [ ] RHI-015 Outcomes — Approved tooling list (Hugo version, Node packages, quality tools) confirmed
  - [ ] RHI-016 Outcomes — Deployment and operations contract confirmed
  - [ ] RHI-017 Outcomes — Validation gate specifications confirmed
- [ ] Hugo extended binary (pinned version from RHI-011) is installable in the working environment
- [ ] Node.js version (from Phase 1/2 contracts) is available and `package.json` is accessible
- [ ] Workstream owner for each of WS-A through WS-J is named and recorded in the Progress Log
- [ ] Phase 3 target completion date is set and agreed by all workstream owners
- [ ] Phase 3 timeline (7–10 working days per plan) is acknowledged; buffer days are identified

---

### Tasks

- [ ] Verify RHI-018 is `Done`; if not, document blocker in Progress Log and pause Phase 3
- [ ] Confirm migration owner, SEO owner, and engineering owner identities for Phase 3
- [ ] Share `analysis/plan/details/phase-3.md` with all workstream owners; request read confirmation
- [ ] Share links to Phase 2 contract outcomes (RHI-011 through RHI-017 Outcomes sections)
- [ ] Share `migration/phase-2-signoff.md` with Phase 3 team
- [ ] Verify Hugo extended binary (correct version per RHI-011) is available locally and in CI runner
- [ ] Verify Node.js and `package.json` are in place from Phase 1 bootstrap (RHI-001)
- [ ] Assign workstream owners for WS-A through WS-J (can be the same person for multiple)
- [ ] Agree on target dates for each workstream ticket (RHI-020 through RHI-029)
- [ ] Review Non-Negotiable Constraints in `analysis/plan/details/phase-3.md` with engineering owner:
  - [ ] Hugo `baseURL` protocol and trailing slash requirement
  - [ ] Hugo alias redirect semantics (HTML pages, not `301`/`308`) — and approved redirect mechanism
  - [ ] GitHub Pages artifact requirements (no symlinks, artifact name `github-pages`)
  - [ ] Custom domain source of truth is repository settings/API, not CNAME file
- [ ] Log all confirmations in Progress Log with names and dates
- [ ] Announce Phase 3 kickoff to the team with linked Phase 2 decision summary

---

### Out of Scope

- Making any new architecture decisions (decided in Phase 2)
- Implementing any Hugo scaffold, templates, or scripts (covered by RHI-020 through RHI-029)
- Changing any Phase 2 contract decisions (any changes require a documented deviation and sign-off)
- Content migration (Phase 4)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-018 Done — Phase 2 sign-off recorded | Ticket | Pending |
| `migration/phase-2-signoff.md` committed and readable | Phase | Pending |
| Migration owner available for Phase 3 kickoff | Access | Pending |
| SEO owner available and confirmed | Access | Pending |
| Engineering owner available and confirmed | Access | Pending |
| Hugo extended binary (pinned version) available in environment | Tool | Pending |
| Node.js runtime available (version per RHI-001 pin) | Tool | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Phase 2 sign-off delayed, blocking Phase 3 start | Medium | High | Identify earliest resolvable blocker in RHI-018; pre-position Phase 3 materials so kickoff is instant once sign-off lands | Migration Owner |
| Phase 2 contract decisions are ambiguous or incomplete | Low | High | Escalate to Phase 2 decision owners before Phase 3 begins; do not proceed with an undocumented decision | Migration Owner |
| Hugo version pinned in RHI-011 is no longer installable | Low | Medium | Verify Hugo binary availability on Day 1; if unavailable, re-evaluate version pin with engineering owner | Engineering Owner |
| Workstream owner availability gaps for WS-D/E/F (SEO and redirect workstreams) | Medium | Medium | Identify backup owners on Day 1; confirm availability for high-dependency workstreams first | Migration Owner |

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

- Progress Log entries confirming Phase 3 team alignment and Phase 2 contract receipt
- Agreed workstream ownership record
- Phase 3 schedule confirmed

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- Do not begin any workstream ticket until this ticket is `Done`. The dependency chain ensures Phase 2 contracts reach Phase 3 implementers before any scaffold work starts.
- If any Phase 2 contract is missing or ambiguous at kickoff, log the gap here and assess whether Phase 3 can proceed with a documented risk acceptance.
- Reference: `analysis/plan/details/phase-3.md` §Inputs and Dependencies, §Non-Negotiable Constraints
