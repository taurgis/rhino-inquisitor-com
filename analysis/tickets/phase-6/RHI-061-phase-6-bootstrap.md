## RHI-061 · Phase 6 Bootstrap: Kickoff and Redirect Governance Environment Setup

**Status:** Open  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 6  
**Assigned to:** Migration Owner  
**Target date:** 2026-05-05  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Confirm that Phase 5 sign-off is complete and all Phase 5 outputs required by Phase 6 are accessible before any redirect workstream begins. Establish the Phase 6 team, review governing contracts, confirm tooling availability, and agree the workstream sequence, owners, and the architecture decision deadline.

Phase 6 operates at the intersection of URL equity, search consolidation signals, and deployment safety. Mistakes introduced without proper bootstrapping — such as starting redirect implementation before the architecture decision is frozen, or implementing without the final URL inventory — can corrupt index signals at scale and are difficult to unwind post-launch. This bootstrap enforces the correct order of operations.

No Phase 6 workstream ticket (RHI-062 through RHI-071) should begin until this ticket is `Done`.

---

### Acceptance Criteria

- [ ] Phase 5 sign-off (RHI-060) is `Done` and `migration/phase-5-signoff.md` is committed
- [ ] `migration/phase-5-seo-contract.md` is committed and canonical policy and redirect signal decisions are confirmed as the Phase 6 operating baseline
- [ ] `migration/phase-5-redirect-signal-matrix.csv` is committed and accessible
- [ ] Migration owner, SEO owner, and engineering owner are confirmed and available for Phase 6
- [ ] All Phase 6 workstream owners have read `analysis/plan/details/phase-6.md` and confirmed understanding
- [ ] Phase 1 and Phase 4 URL inventory outputs are accessible:
  - [ ] `migration/url-manifest.json` exists with 100% disposition and `implementation_layer` coverage
  - [ ] `migration/url-inventory.normalized.json` exists with expected route count
  - [ ] RHI-004 Outcomes — URL classification and disposition mapping is committed
  - [ ] RHI-036 Outcomes — URL preservation and redirect integrity from Phase 4 is committed
- [ ] Phase 6 non-negotiable constraints reviewed with the full team:
  - [ ] Every legacy URL in scope has one explicit and testable outcome: `keep`, `redirect`, or `retire`
  - [ ] Redirect chains for migration routes are zero-tolerance
  - [ ] Redirect loops are zero-tolerance
  - [ ] Broad fallback redirects to homepage are blocked for unrelated content
  - [ ] Canonical URL, sitemap URL, and internal-link destination must agree for each indexable target
  - [ ] Redirect destinations must preserve content intent (topic-equivalent outcome)
  - [ ] Redirect behavior and mapping must be frozen before launch window
- [ ] Phase 6 tooling dependencies confirmed available in `package.json`:
  - [ ] `fast-glob` — output file discovery and mapping input discovery
  - [ ] `fast-xml-parser` — sitemap parity parsing
  - [ ] `zod` — redirect map schema validation
  - [ ] `csv-parse` and `csv-stringify` — deterministic mapping and compliance reports
  - [ ] `cheerio` — canonical/meta extraction from generated HTML
  - [ ] `undici` or `node-fetch` — HTTP resolution checks in validation scripts
  - [ ] `p-limit` — concurrency control for large redirect verification runs
  - [ ] `playwright` — browser-observed redirect outcome checks (critical routes)
  - [ ] `linkinator` or equivalent — internal link residual legacy URL detection
- [ ] Redirect architecture decision deadline is agreed (required before WS-C implementation begins):
  - [ ] Architecture decision owner identified (SEO Owner + Engineering Owner)
  - [ ] RHI-062 target date confirmed
- [ ] Phase 6 workstream owner for each of WS-A through WS-I is named and recorded in the Progress Log
- [ ] Phase 6 target completion dates for each workstream are agreed and recorded

---

### Tasks

- [ ] Verify RHI-060 is `Done`; if not, document the blocker and pause Phase 6
- [ ] Confirm migration owner, SEO owner, and engineering owner identities for Phase 6
- [ ] Share `analysis/plan/details/phase-6.md` with all workstream owners; request read confirmation
- [ ] Verify Phase 5 SEO contract outputs are accessible:
  - [ ] Confirm `migration/phase-5-seo-contract.md` is committed and readable
  - [ ] Confirm `migration/phase-5-redirect-signal-matrix.csv` is committed with redirect mechanism decisions
  - [ ] Confirm `migration/phase-5-canonical-policy.md` is committed
- [ ] Verify Phase 1 and Phase 4 URL inventory outputs are accessible:
  - [ ] Confirm `migration/url-manifest.json` exists with 100% disposition coverage
  - [ ] Confirm `migration/url-inventory.normalized.json` exists and record count is expected
  - [ ] Review RHI-036 Outcomes for URL preservation decisions made in Phase 4
- [ ] Verify Phase 6 tooling dependencies are installable (`npm install`)
- [ ] Review Phase 6 Non-Negotiable Constraints with the full team; log confirmations in Progress Log
- [ ] Agree redirect architecture decision deadline and assign RHI-062 to decision owners
- [ ] Assign workstream owners for WS-A through WS-I
- [ ] Agree on target dates for each workstream ticket (RHI-062 through RHI-071)
- [ ] Establish Phase 6 execution sequence:
  - [ ] WS-A (inventory) and architecture decision (RHI-062) run in parallel on Day 1
  - [ ] WS-B (mapping) begins after WS-A and architecture decision are Done
  - [ ] WS-C (Hugo routes) begins after WS-B and architecture decision are Done
  - [ ] WS-D (host/protocol) can begin in parallel with WS-B
  - [ ] WS-E (retirement/errors) can begin in parallel with WS-B
  - [ ] WS-F (security) can begin in parallel with WS-C
  - [ ] WS-G (observability) requires WS-A through WS-C Done
  - [ ] WS-H (CI gates) requires WS-C Done
  - [ ] WS-I (cutover/rollback) requires all workstreams Done
- [ ] Log all confirmations in Progress Log with names and dates
- [ ] Announce Phase 6 kickoff with linked Phase 5 sign-off and Phase 6 plan

---

### Out of Scope

- Implementing any redirect, alias page, or parity validation script (covered by RHI-062 through RHI-071)
- Making new architecture decisions without the formal ADR process (RHI-062)
- DNS record execution (Phase 7 scope)
- Full launch validation and smoke tests (Phase 8 scope)
- Post-launch monitoring actions (Phase 9 scope)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-060 Done — Phase 5 sign-off recorded | Ticket | Pending |
| `migration/phase-5-signoff.md` committed | Phase | Pending |
| `migration/phase-5-seo-contract.md` committed | Phase | Pending |
| `migration/phase-5-redirect-signal-matrix.csv` committed | Phase | Pending |
| `migration/url-manifest.json` with 100% disposition coverage | Phase | Pending |
| RHI-036 Done — Phase 4 URL preservation outputs committed | Ticket | Pending |
| Migration owner, SEO owner, and engineering owner available | Access | Pending |
| Node.js runtime and `package.json` from Phase 3 | Tool | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Phase 5 sign-off delayed, blocking Phase 6 start | Medium | High | Pre-position Phase 6 materials; review all contracts and prepare WS-A inventory inputs before sign-off lands | Migration Owner |
| URL manifest disposition coverage not at 100% when Phase 6 starts | Medium | High | Run manifest coverage check at bootstrap; if gaps found, raise with Phase 1/4 owners before proceeding — Phase 6 cannot define redirect outcomes for unmapped URLs | SEO Owner |
| Architecture decision (RHI-062) timeline slips, blocking WS-C implementation | Medium | High | Set architecture decision deadline on Day 1 of Phase 6; escalate to migration owner by Day 2 if not resolved | Migration Owner |
| Phase 6 tooling (undici, playwright) not available in existing `package.json` | Medium | Medium | Verify at bootstrap; install and pin missing dependencies; align with Phase 3 engineering owner on version constraints | Engineering Owner |

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

- Progress Log entries confirming Phase 6 team alignment and Phase 5 contract receipt
- Phase 6 workstream owner assignments recorded
- Architecture decision deadline and owner confirmed (RHI-062)
- Agreed target dates for RHI-062 through RHI-072

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- Phase 6 has a hard sequencing dependency on the architecture decision (RHI-062). The decision between Model A (Hugo aliases only) and Model B (edge redirect layer) must be made before WS-C implementation starts. Delaying this decision is the single highest-risk scheduling failure in Phase 6.
- Phase 4 URL preservation work (RHI-036) should already have produced per-content-item `url` front matter and alias candidates. Phase 6 WS-A and WS-C consume these outputs directly — confirm they are complete and correct at bootstrap rather than assuming.
- Search Console access continuity must be verified at bootstrap for Phase 6 WS-D and WS-I. The host/protocol consolidation and cutover readiness workstreams require active Search Console access.
- Reference: `analysis/plan/details/phase-6.md` §Phase Position and Dependencies, §Non-Negotiable Constraints, §Required Libraries and Tooling
