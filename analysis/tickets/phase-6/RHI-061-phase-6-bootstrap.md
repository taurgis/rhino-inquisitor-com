## RHI-061 · Phase 6 Bootstrap: Kickoff and Redirect Governance Environment Setup

**Status:** Done  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 6  
**Assigned to:** Migration Owner  
**Target date:** 2026-05-05  
**Created:** 2026-03-07  
**Updated:** 2026-03-13

---

### Goal

Confirm that Phase 5 sign-off is complete and all Phase 5 outputs required by Phase 6 are accessible before any redirect workstream begins. Establish the Phase 6 team, review governing contracts, confirm tooling availability, and agree the workstream sequence, owners, and the architecture decision deadline.

Phase 6 operates at the intersection of URL equity, search consolidation signals, and deployment safety. Mistakes introduced without proper bootstrapping — such as starting redirect implementation before the architecture decision is frozen, or implementing without the final URL inventory — can corrupt index signals at scale and are difficult to unwind post-launch. This bootstrap enforces the correct order of operations.

No Phase 6 workstream ticket (RHI-062 through RHI-071) should begin until this ticket is `Done`.

---

### Acceptance Criteria

- [x] Phase 5 sign-off (RHI-060) is `Done` and `migration/phase-5-signoff.md` is committed
- [x] `migration/phase-5-seo-contract.md` is committed and canonical policy and redirect signal decisions are confirmed as the Phase 6 operating baseline
- [x] `migration/phase-5-redirect-signal-matrix.csv` is committed and accessible
- [x] Migration owner, SEO owner, and engineering owner are confirmed and available for Phase 6
- [x] All Phase 6 workstream owners have read `analysis/plan/details/phase-6.md` and confirmed understanding
- [x] Phase 1 and Phase 4 URL inventory outputs are accessible:
  - [x] `migration/url-manifest.json` exists with 100% disposition and `implementation_layer` coverage
  - [x] `migration/url-inventory.normalized.json` exists with expected route count
  - [x] RHI-004 Outcomes — URL classification and disposition mapping is committed
  - [x] RHI-036 Outcomes — URL preservation and redirect integrity from Phase 4 is committed
- [x] Phase 6 non-negotiable constraints reviewed with the full team:
  - [x] Every legacy URL in scope has one explicit and testable outcome: `keep`, `redirect`, or `retire`
  - [x] Redirect chains for migration routes are zero-tolerance
  - [x] Redirect loops are zero-tolerance
  - [x] Broad fallback redirects to homepage are blocked for unrelated content
  - [x] Canonical URL, sitemap URL, and internal-link destination must agree for each indexable target
  - [x] Redirect destinations must preserve content intent (topic-equivalent outcome)
  - [x] Redirect behavior and mapping must be frozen before launch window
- [x] Phase 6 tooling dependencies confirmed available in `package.json`:
  - [x] `fast-glob` — output file discovery and mapping input discovery
  - [x] `fast-xml-parser` — sitemap parity parsing
  - [x] `zod` — redirect map schema validation
  - [x] `csv-parse` and `csv-stringify` — deterministic mapping and compliance reports
  - [x] `cheerio` — canonical/meta extraction from generated HTML
  - [x] `undici` or `node-fetch` — HTTP resolution checks in validation scripts
  - [x] `p-limit` — concurrency control for large redirect verification runs
  - [x] `playwright` — browser-observed redirect outcome checks (critical routes)
  - [x] `linkinator` or equivalent — internal link residual legacy URL detection
- [x] Redirect architecture decision deadline is agreed (required before WS-C implementation begins):
  - [x] Architecture decision owner identified (SEO Owner + Engineering Owner)
  - [x] RHI-062 target date confirmed
- [x] Phase 6 workstream owner for each of WS-A through WS-I is named and recorded in the Progress Log
- [x] Phase 6 target completion dates for each workstream are agreed and recorded

---

### Tasks

- [x] Verify RHI-060 is `Done`; if not, document the blocker and pause Phase 6
- [x] Confirm migration owner, SEO owner, and engineering owner identities for Phase 6
- [x] Share `analysis/plan/details/phase-6.md` with all workstream owners; request read confirmation
- [x] Verify Phase 5 SEO contract outputs are accessible:
  - [x] Confirm `migration/phase-5-seo-contract.md` is committed and readable
  - [x] Confirm `migration/phase-5-redirect-signal-matrix.csv` is committed with redirect mechanism decisions
  - [x] Confirm `migration/phase-5-canonical-policy.md` is committed
- [x] Verify Phase 1 and Phase 4 URL inventory outputs are accessible:
  - [x] Confirm `migration/url-manifest.json` exists with 100% disposition coverage
  - [x] Confirm `migration/url-inventory.normalized.json` exists and record count is expected
  - [x] Review RHI-036 Outcomes for URL preservation decisions made in Phase 4
- [x] Verify Phase 6 tooling dependencies are installable (`npm install`)
- [x] Review Phase 6 Non-Negotiable Constraints with the full team; log confirmations in Progress Log
- [x] Agree redirect architecture decision deadline and assign RHI-062 to decision owners
- [x] Assign workstream owners for WS-A through WS-I
- [x] Agree on target dates for each workstream ticket (RHI-062 through RHI-071)
- [x] Establish Phase 6 execution sequence:
  - [x] WS-A (inventory) and architecture decision (RHI-062) run in parallel on Day 1
  - [x] WS-B (mapping) begins after WS-A and architecture decision are Done
  - [x] WS-C (Hugo routes) begins after WS-B and architecture decision are Done
  - [x] WS-D (host/protocol) can begin in parallel with WS-B
  - [x] WS-E (retirement/errors) can begin in parallel with WS-B
  - [x] WS-F (security) can begin in parallel with WS-C
  - [x] WS-G (observability) requires WS-A through WS-C Done
  - [x] WS-H (CI gates) requires WS-C Done
  - [x] WS-I (cutover/rollback) requires all workstreams Done
- [x] Log all confirmations in Progress Log with names and dates
- [x] Announce Phase 6 kickoff with linked Phase 5 sign-off and Phase 6 plan

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
| RHI-060 Done — Phase 5 sign-off recorded | Ticket | Resolved |
| `migration/phase-5-signoff.md` committed | Phase | Verified |
| `migration/phase-5-seo-contract.md` committed | Phase | Verified |
| `migration/phase-5-redirect-signal-matrix.csv` committed | Phase | Verified |
| `migration/url-manifest.json` with 100% disposition coverage | Phase | Verified locally — `1212 / 1212` populated `disposition` and `implementation_layer` values |
| RHI-036 Done — Phase 4 URL preservation outputs committed | Ticket | Verified |
| Migration owner, SEO owner, and engineering owner available | Access | Resolved |
| Node.js runtime and `package.json` from Phase 3 | Tool | Verified via successful `npm ci` |

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

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Phase 6 bootstrap is complete. The Phase 5 sign-off package and SEO contract are now recorded as the authoritative operating baseline for redirect work, the current repository state confirms `migration/url-manifest.json` still has full `disposition` and `implementation_layer` coverage (`1212 / 1212`) while `migration/url-inventory.normalized.json` remains the `1199`-row discovery baseline, and the manifest delta is accepted as the current Phase 5 expansion for approved feed and non-HTML compatibility routes rather than an unresolved bootstrap blocker.

Thomas Theunen confirmed availability as Migration Owner, SEO Owner, Engineering Owner, and the single owner for WS-A through WS-I, confirmed review of `analysis/plan/details/phase-6.md` and the Phase 6 non-negotiable constraints, accepted the seeded target dates for `RHI-062` through `RHI-071` as the current working schedule, kept `RHI-062` ownership with the SEO Owner and Engineering Owner roles and the existing `2026-05-06` decision deadline, and approved the current repo validators (`npm run check:links` and `npm run check:internal-links`) as the accepted `linkinator or equivalent` bootstrap control.

**Delivered artefacts:**

- Progress Log entries confirming Phase 6 team alignment and Phase 5 contract receipt
- Phase 6 workstream owner assignments recorded
- Architecture decision deadline and owner confirmed (RHI-062)
- Agreed target dates for RHI-062 through RHI-072
- Phase 6 bootstrap readiness note: `analysis/documentation/phase-6/rhi-061-phase-6-bootstrap-readiness-2026-03-13.md`

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-13 | In Progress | Re-verified the Phase 5 handover baseline from current repo state: `RHI-060` is `Done`, `migration/phase-5-signoff.md`, `migration/phase-5-seo-contract.md`, `migration/phase-5-canonical-policy.md`, and `migration/phase-5-redirect-signal-matrix.csv` are committed and readable, and the Phase 5 contract keeps edge redirects mandatory before launch because the indexed URL change rate remains above the approved escalation threshold. |
| 2026-03-13 | In Progress | Confirmed current Phase 1 and Phase 4 URL readiness from the repository: `migration/url-manifest.json` now has `1212 / 1212` populated `disposition` and `implementation_layer` values, `migration/url-inventory.normalized.json` remains at `1199` rows, and the current manifest delta is accepted as the approved Phase 5 expansion for feed compatibility and non-HTML compatibility routes rather than an unresolved Phase 6 blocker. |
| 2026-03-13 | In Progress | Ran `npm ci` successfully to verify the current Phase 6 tooling baseline is installable. Confirmed `package.json` includes `fast-glob`, `fast-xml-parser`, `zod`, `csv-parse`, `csv-stringify`, `cheerio`, `undici`, `p-limit`, and `playwright`, and Thomas approved `npm run check:links` plus `npm run check:internal-links` as the accepted `linkinator or equivalent` bootstrap validator set. |
| 2026-03-13 | Done | Thomas Theunen confirmed availability as Migration Owner, SEO Owner, Engineering Owner, and the single owner for WS-A through WS-I; confirmed review of `analysis/plan/details/phase-6.md` and the Phase 6 non-negotiable constraints; accepted the seeded ticket dates for `RHI-062` through `RHI-071`; kept `RHI-062` ownership with the SEO Owner and Engineering Owner roles and the existing `2026-05-06` decision deadline; and approved Phase 6 kickoff to proceed. |

---

### Notes

- Phase 6 has a hard sequencing dependency on the architecture decision (RHI-062). The decision between Model A (Hugo aliases only) and Model B (edge redirect layer) must be made before WS-C implementation starts. Delaying this decision is the single highest-risk scheduling failure in Phase 6.
- Phase 5 already froze the launch-window baseline that edge redirects are mandatory before launch. RHI-062 remains a required ADR because WS-C and WS-I still need the exact implementation model, tooling, and risk acceptance documented, but it does not reopen the approved escalation threshold.
- Phase 4 URL preservation work (RHI-036) should already have produced per-content-item `url` front matter and alias candidates. Phase 6 WS-A and WS-C consume these outputs directly — confirm they are complete and correct at bootstrap rather than assuming.
- Search Console access continuity must be verified at bootstrap for Phase 6 WS-D and WS-I. The host/protocol consolidation and cutover readiness workstreams require active Search Console access.
- Reference: `analysis/plan/details/phase-6.md` §Phase Position and Dependencies, §Non-Negotiable Constraints, §Required Libraries and Tooling
