## RHI-019 · Phase 3 Bootstrap: Kickoff and Environment Readiness

**Status:** Done  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 3  
**Assigned to:** Migration Owner  
**Target date:** 2026-03-25  
**Created:** 2026-03-07  
**Updated:** 2026-03-09

---

### Goal

Confirm that Phase 2 sign-off is complete, all Phase 2 decision contracts are accessible and understood by the Phase 3 team, and that every prerequisite for scaffolding work is in place before any workstream begins. This ticket is the hard gate for all Phase 3 workstream tickets (RHI-020 through RHI-029). No Phase 3 workstream should begin until this ticket is `Done`.

Without verified access to Phase 2 outputs — particularly the approved `hugo.toml` config contract, the front matter contract, the redirect contract, and the validation gate specifications — the scaffold work will be built on unconfirmed decisions, leading to expensive rework in later phases.

---

### Acceptance Criteria

- [x] Phase 2 sign-off (RHI-018) is `Done` and `migration/phase-2-signoff.md` is committed
- [x] Migration owner, SEO owner, and engineering owner are confirmed for Phase 3
- [x] All Phase 3 workstream owners have read `analysis/plan/details/phase-3.md` and confirmed understanding
- [x] Phase 2 decision contracts are accessible to all Phase 3 workstream owners:
  - [x] RHI-011 Outcomes — Hugo version pin, project layout, `baseURL`, environment model confirmed
  - [x] RHI-012 Outcomes — Front matter contract (mandatory fields, `draft` lifecycle, URL normalization rules) confirmed
  - [x] RHI-013 Outcomes — Route/redirect contract (mechanism, threshold, legacy endpoints, pagination policy) confirmed
  - [x] RHI-014 Outcomes — SEO partial architecture obligations confirmed
  - [x] RHI-015 Outcomes — Approved tooling list (Hugo version, Node packages, quality tools) confirmed
  - [x] RHI-016 Outcomes — Deployment and operations contract confirmed
  - [x] RHI-017 Outcomes — Validation gate specifications confirmed
- [x] Hugo extended binary (pinned version from RHI-011) is installable in the working environment
- [x] Node.js version (from Phase 1/2 contracts) is available and `package.json` is accessible
- [x] Workstream owner for each of WS-A through WS-J is named and recorded in the Progress Log
- [x] Phase 3 target completion date is set and agreed by all workstream owners
- [x] Phase 3 timeline (7–10 working days per plan) is acknowledged; buffer days are identified

---

### Tasks

- [x] Verify RHI-018 is `Done`; if not, document blocker in Progress Log and pause Phase 3
- [x] Confirm migration owner, SEO owner, and engineering owner identities for Phase 3
- [x] Share `analysis/plan/details/phase-3.md` with all workstream owners; request read confirmation
- [x] Share links to Phase 2 contract outcomes (RHI-011 through RHI-017 Outcomes sections)
- [x] Share `migration/phase-2-signoff.md` with Phase 3 team
- [x] Verify Hugo extended binary (correct version per RHI-011) is available locally and in CI runner
- [x] Verify Node.js and `package.json` are in place from Phase 1 bootstrap (RHI-001)
- [x] Assign workstream owners for WS-A through WS-J (can be the same person for multiple)
- [x] Agree on target dates for each workstream ticket (RHI-020 through RHI-029)
- [x] Review Non-Negotiable Constraints in `analysis/plan/details/phase-3.md` with engineering owner:
  - [x] Hugo `baseURL` protocol and trailing slash requirement
  - [x] Hugo alias redirect semantics (HTML pages, not `301`/`308`) — and approved redirect mechanism
  - [x] GitHub Pages artifact requirements (no symlinks, artifact name `github-pages`)
  - [x] Custom domain source of truth is repository settings/API, not CNAME file
- [x] Log all confirmations in Progress Log with names and dates
- [x] Announce Phase 3 kickoff to the team with linked Phase 2 decision summary

### Phase 3 Owner Alignment Record

| Role | Name | Contact | Phase 3 confirmation |
|------|------|---------|----------------------|
| Migration Owner | Thomas Theunen | thomas.theunen@forward.eu | Confirmed 2026-03-09 |
| SEO Owner | Thomas Theunen | thomas.theunen@forward.eu | Confirmed 2026-03-09 |
| Engineering Owner | Thomas Theunen | thomas.theunen@forward.eu | Confirmed 2026-03-09 |

### Workstream Ownership And Delivery Record

| Workstream | Ticket | Owner | Phase 3 plan confirmation | Target date |
|------------|--------|-------|---------------------------|-------------|
| WS-A — Repository Bootstrap | RHI-020 | Engineering Owner | Confirmed 2026-03-09 | 2026-03-26 |
| WS-B — Hugo Configuration Hardening | RHI-021 | Engineering Owner | Confirmed 2026-03-09 | 2026-03-27 |
| WS-C — Content Contract and Archetypes | RHI-022 | Engineering Owner | Confirmed 2026-03-09 | 2026-03-28 |
| WS-D — Template Scaffolding and Rendering Model | RHI-023 | Engineering Owner | Confirmed 2026-03-09 | 2026-04-01 |
| WS-E — SEO Foundation Implementation | RHI-024 | SEO Owner | Confirmed 2026-03-09 | 2026-04-02 |
| WS-F — URL Preservation and Redirect Baseline | RHI-025 | Engineering Owner | Confirmed 2026-03-09 | 2026-04-02 |
| WS-G — Asset and Performance Baseline | RHI-026 | Engineering Owner | Confirmed 2026-03-09 | 2026-04-03 |
| WS-H — Accessibility and UX Baseline | RHI-027 | Engineering Owner | Confirmed 2026-03-09 | 2026-04-03 |
| WS-I — Security, Privacy, and Operational Hardening | RHI-028 | Engineering Owner | Confirmed 2026-03-09 | 2026-04-03 |
| WS-J — CI/CD and Deployment Scaffolding | RHI-029 | Engineering Owner | Confirmed 2026-03-09 | 2026-04-04 |

- Phase 3 target completion date: `2026-04-08`
- Phase 3 schedule buffer: `2026-04-06` through `2026-04-08` reserved for integration, validation reruns, and RHI-030 sign-off closeout

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
| RHI-018 Done — Phase 2 sign-off recorded | Ticket | Done |
| `migration/phase-2-signoff.md` committed and readable | Phase | Done |
| Migration owner available for Phase 3 kickoff | Access | Done |
| SEO owner available and confirmed | Access | Done |
| Engineering owner available and confirmed | Access | Done |
| Hugo extended binary (pinned version) install path verified for local macOS and Linux CI environments | Tool | Done |
| Node.js runtime available (version per RHI-001 pin) | Tool | Done |

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

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Completed. Phase 3 is formally kicked off with Phase 2 sign-off verified, contract accessibility confirmed, owner alignment recorded, and local environment prerequisites checked against the repo contract and official install paths.

**Delivered artefacts:**

- Progress Log entries confirming Phase 3 team alignment, Phase 2 contract receipt, and Phase 3 constraint acknowledgment
- Phase 3 owner alignment and workstream ownership records in this ticket
- Phase 3 schedule confirmed with target completion date `2026-04-08` and explicit integration/sign-off buffer
- Local runtime verification evidence: Node `v22.22.0`, npm `10.9.4`, `package.json` present, local Homebrew Hugo `v0.157.0+extended+withdeploy` verified in PATH, and official Hugo `0.157.0` macOS/Linux release assets identified for pinned-version installability
- Phase 3 kickoff note: `analysis/documentation/phase-3/rhi-019-phase-3-bootstrap-2026-03-09.md`

**Deviations from plan:**

- Exact Hugo pin verification now aligns local and planned CI usage on `v0.157.0`: the installed Homebrew binary was verified locally, and the official `v0.157.0` release assets remain the CI-install evidence path for deterministic workflow pinning.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-09 | Open | Phase 2 prerequisite cleared: RHI-018 is `Done`, `migration/phase-2-signoff.md` is present, and the Phase 2 handover package explicitly marks Phase 3 receipt confirmed. |
| 2026-03-09 | In Progress | Thomas Theunen confirmed Phase 3 owner alignment across Migration Owner, SEO Owner, and Engineering Owner responsibilities; reachable contact remains `thomas.theunen@forward.eu`; the direct kickoff instruction in chat was recorded as the Phase 3 start confirmation. |
| 2026-03-09 | In Progress | `analysis/plan/details/phase-3.md`, `migration/phase-2-signoff.md`, and the Phase 2 contract tickets RHI-011 through RHI-017 were re-shared for Phase 3 entry; because all Phase 3 workstream owners map to the same confirmed owner set in this phase, the kickoff review in this task serves as the dated read confirmation for WS-A through WS-J. |
| 2026-03-09 | In Progress | Verified local runtime readiness: `package.json` is accessible, Node `v22.22.0` and npm `10.9.4` satisfy the repo baseline `>=18`, local Hugo resolves from `/opt/homebrew/bin/hugo` and reports `hugo v0.157.0+extended+withdeploy`, and official Hugo `v0.157.0` install assets were confirmed for macOS (`hugo_extended_0.157.0_darwin-universal.pkg`) and Linux CI (`hugo_extended_0.157.0_linux-amd64.tar.gz`, `hugo_extended_0.157.0_linux-arm64.tar.gz`). |
| 2026-03-09 | In Progress | WS-A through WS-J ownership was aligned to the downstream Phase 3 ticket assignees and target dates already recorded in the Phase 3 ticket set; phase target completion date is fixed to `2026-04-08` and buffer is reserved from `2026-04-06` through `2026-04-08` for integration, reruns, and sign-off closeout. |
| 2026-03-09 | Done | Reviewed the Phase 3 non-negotiable constraints against the approved Phase 2 contracts: canonical `baseURL` with trailing slash, Hugo alias helper semantics, GitHub Pages artifact requirements, and Pages settings/API as the custom-domain source of truth remain understood and accepted for scaffold implementation. All RHI-019 acceptance criteria are satisfied and downstream Phase 3 workstreams may begin. |

---

### Notes

- Do not begin any workstream ticket until this ticket is `Done`. The dependency chain ensures Phase 2 contracts reach Phase 3 implementers before any scaffold work starts.
- If any Phase 2 contract is missing or ambiguous at kickoff, log the gap here and assess whether Phase 3 can proceed with a documented risk acceptance.
- No owner clarification remained open for this ticket. The Phase 2 bootstrap pattern already identified Thomas Theunen as Migration Owner, SEO Owner, and Engineering Owner, and the current kickoff request confirmed Phase 3 start under that same owner set.
- The repo runtime contract remains `node >=18`, but the local environment check for this bootstrap used Node `v22.22.0`; official Node release guidance now treats Node 18 as end-of-life, so ongoing Phase 3 work should continue on a supported LTS runtime even though no contract change is made in this ticket.
- Reference: `analysis/plan/details/phase-3.md` §Inputs and Dependencies, §Non-Negotiable Constraints
