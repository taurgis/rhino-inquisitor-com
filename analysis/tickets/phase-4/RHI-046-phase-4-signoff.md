## RHI-046 · Phase 4 Sign-off and Handover to Phase 5/6

**Status:** Open  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 4  
**Assigned to:** Migration Owner  
**Target date:** 2026-05-02  
**Created:** 2026-03-07  
**Updated:** 2026-03-12

---

### Goal

Formally close Phase 4 by verifying that all workstream scripts are complete, all three migration batches have passed their CI gates and been merged, the full migration item report shows 100% coverage with no unresolved blockers, and the Phase 5/6 teams have received and acknowledged the handover package. Phase 5 (SEO and Discoverability) and Phase 6 (URL Preservation and Redirect Strategy) must not rely on Phase 4 outputs until this sign-off is recorded.

Any unresolved exception, quarantine record, or failing gate identified here must be fixed or explicitly accepted with documented owner before sign-off is recorded. Undocumented risk acceptance is indistinguishable from overlooked risk.

---

### Acceptance Criteria

- [ ] All Phase 4 workstream tickets are `Done`:
  - [ ] RHI-031 Done — Phase 4 Bootstrap complete
  - [ ] RHI-032 Done — WordPress content extraction complete
  - [ ] RHI-033 Done — Normalization and canonical record model complete
  - [ ] RHI-034 Done — HTML-to-Markdown conversion engine complete
  - [ ] RHI-035 Done — Front matter mapping and Hugo contract complete
  - [ ] RHI-036 Done — URL preservation and redirect integrity complete
  - [ ] RHI-037 Done — Media migration and asset hygiene complete
  - [ ] RHI-038 Done — Internal link and navigation rewrites complete
  - [ ] RHI-039 Done — SEO signal preservation complete
  - [ ] RHI-040 Done — Accessibility and content semantics complete
  - [ ] RHI-041 Done — Security and data hygiene complete
  - [x] RHI-042 Done — Reporting, traceability, and audit framework complete
  - [ ] RHI-043 Done — Pilot batch migrated and merged
  - [x] RHI-044 Done — High-value batch migrated and merged
  - [x] RHI-045 Done — Long-tail and taxonomy batch migrated and merged (Batch 3 merge evidence recorded from commit `596298f2fc2ea5ae9a2fcc5081ba196ce6901339` on `main`)
- [ ] Final migration item report confirms:
  - [ ] 100% of in-scope `keep` and `merge` records are present in `src/content/` or explicitly deferred with documented owner
  - [ ] Zero records with `qa_status: blocked`
  - [ ] All `retire`-disposition records are confirmed absent from Hugo output
  - [ ] Source-channel provenance is documented for migrated records and any waived source artifacts are explicitly noted
- [ ] The final post-generation correction contract is verified and preserved:
  - [x] `migration/input/image-alt-corrections.csv` is committed as the durable curated alt-text input used by the final Phase 4 batches
  - [x] `migration/reports/content-corrections-summary.json` and `migration/reports/image-alt-corrections-audit.csv` are present in the final evidence set
  - [x] Re-running `npm run migrate:apply-corrections` on the final staged corpus is idempotent
- [ ] All CI gates pass on the final `main` branch build:
  - [ ] `hugo --minify --environment production` exits with code 0
  - [ ] `npm run validate:frontmatter` exits with code 0
  - [ ] `npm run check:url-parity` exits with code 0
  - [ ] `npm run check:redirects` exits with code 0
  - [ ] `npm run check:seo-completeness` exits with code 0
  - [ ] `npm run check:noindex` exits with code 0
  - [ ] `npm run check:feed-compatibility` exits with code 0
  - [ ] `npm run check:media` exits with code 0
  - [ ] `npm run check:links` exits with code 0
  - [ ] `npm run check:a11y` exits with code 0 or within agreed cap
  - [ ] `npm run check:security-content` exits with code 0
  - [ ] `npm run check:migration-thresholds` exits with code 0
- [ ] Phase 4 exit gate conditions from `analysis/plan/details/phase-4.md` are met:
  - [ ] Phase 5 can consume complete metadata fields without backfill
  - [ ] Phase 6 has full alias/mapping data for all moved URLs
  - [ ] Phase 8 can run against a content-complete build artifact
- [ ] `migration/phase-4-signoff.md` is committed with:
  - [ ] Summary of all Phase 4 workstream outcomes (RHI-032 through RHI-045) with ticket IDs and file paths
  - [ ] Final migration item report metrics (total records, by type, by status)
  - [ ] Approved source artifacts used for migration runs, including any SQL or filesystem recovery notes
  - [ ] The approved post-mapping execution sequence (`npm run migrate:map-frontmatter` followed by `npm run migrate:finalize-content`) and the correction artifacts it produces
  - [ ] Exception register: all accepted deferrals with owner, reason, and target resolution phase
  - [ ] Phase 4 Definition of Done compliance statement
  - [ ] Phase 5/6/8 entry conditions — what downstream phases can rely on
  - [ ] Outstanding risks accepted for Phase 5/6 (with owners)
  - [ ] Stakeholder sign-off block (migration owner, SEO owner, engineering owner)
- [ ] Phase 5 and Phase 6 teams have confirmed receipt of the Phase 4 handover package

---

### Tasks

- [ ] Confirm all 15 Phase 4 workstream and batch tickets are `Done`
- [ ] Run all CI gates locally against the final `main` branch build:
  - [ ] Full gate list as above — every gate must pass
  - [ ] Record CI run URL in Progress Log
- [ ] Generate final migration item report:
  - [ ] `npm run migrate:report`
  - [ ] Verify 100% coverage and zero blocked items
- [ ] Verify final correction evidence before handover:
  - [x] Confirm `migration/input/image-alt-corrections.csv` is committed and reflects the approved curated overrides from the final batches
  - [x] Re-run `npm run migrate:apply-corrections` on the final staged corpus and confirm the rerun is idempotent
  - [x] Include `migration/reports/content-corrections-summary.json` and `migration/reports/image-alt-corrections-audit.csv` in the handover evidence set
  - [x] Confirm PR #27 closeout evidence references the refreshed staged-corpus rerun (`filesChanged: 0`) and the `main` merge commit
- [ ] Review source artifact evidence from RHI-031, RHI-032, and RHI-042:
  - [ ] Confirm the approved source-channel strategy was documented for each batch
  - [ ] Confirm any waived or unavailable source artifacts were accepted explicitly by the owner
- [ ] Review exception register from Batch 3 (RHI-045):
  - [ ] Confirm all deferred items have owners and target phases
  - [ ] Confirm no deferred item represents an unacceptable launch risk
- [ ] Trigger full CI deployment workflow (`workflow_dispatch`) on the final content build:
  - [ ] Confirm all quality gates pass in CI
  - [ ] Confirm Pages deployment succeeds
  - [ ] Confirm all migrated URLs are accessible and canonical in the deployed build
  - [ ] Record CI run URL in Progress Log
- [ ] Draft `migration/phase-4-signoff.md`:
  - [ ] Workstream outcomes table (ticket ID, deliverable, file path)
  - [ ] Final migration metrics table (total, by type, by batch)
  - [ ] Exception register (accepted deferrals with owners)
  - [ ] Definition of Done compliance checklist
  - [ ] Phase 5/6/8 entry conditions (what downstream phases can rely on)
  - [ ] Stakeholder sign-off block
- [ ] Circulate sign-off document for approval (migration owner, SEO owner, engineering owner)
- [ ] Record final approval in Progress Log with approver names and dates
- [ ] Notify Phase 5 team (SEO and Discoverability) that Phase 4 is complete
- [ ] Notify Phase 6 team (URL Preservation and Redirect Strategy) that Phase 4 alias data is available

---

### Out of Scope

- Advanced SEO optimization and discoverability experiments (Phase 5)
- Server-side redirect infrastructure (Phase 6)
- GitHub Pages domain cutover (Phase 7)
- Post-launch validation and monitoring (Phase 8/9)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-031 through RHI-045 all Done | Ticket | Pending |
| Migration owner, SEO owner, and engineering owner available for sign-off | Access | Pending |
| Phase 5 and Phase 6 teams available to receive handover | Access | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| One or more batch tickets not `Done` by target date | Medium | High | Identify blockers on Day 12 of Phase 4; assess whether to defer records or extend timeline | Migration Owner |
| Final CI gate run reveals a systemic failure not caught in individual batches | Low | High | Run all gates against full `main` build 2 days before sign-off; leave time to fix before stakeholder review | Engineering Owner |
| Exception register accepted deferrals create unacceptable launch risk for Phase 7 | Low | High | Review each deferred item against Phase 7 go/no-go criteria; do not defer items that block launch without an explicit escalation plan | Migration Owner |
| Phase 5 or Phase 6 teams unavailable to acknowledge handover | Low | Medium | Notify Phase 5/6 teams on Day 12; confirm availability for handover receipt before sign-off is scheduled | Project Manager |
| `migration/phase-4-signoff.md` lacks sufficient detail for Phase 5/6 to operate independently | Low | Medium | Use RHI-030 sign-off document as structural reference; ensure Phase 5/6 entry conditions section is actionable | Migration Owner |

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

- `migration/phase-4-signoff.md`
- All Phase 4 workstream and batch tickets (RHI-032 through RHI-045) confirmed `Done`
- Final migration item report
- CI gate evidence (passing Actions run URL)

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-12 | In Progress | PR #27 remains the gating path for RHI-045 closeout. Sign-off wording now requires refreshed correction evidence plus direct merge proof on `main` before RHI-046 can treat RHI-045 as complete. |
| 2026-03-12 | In Progress | Re-ran `npm run migrate:apply-corrections` twice against the real staged corpus and reconfirmed the stable contract in-place: both runs converged in `1` internal pass, both rewrote `migration/reports/content-corrections-summary.json` with `filesChanged: 0`, and both completed with `markdownlint-cli2` reporting `0` errors. Updated the sign-off checklist so correction-evidence items are closed while PR #27 merge-proof items remain open. |
| 2026-03-12 | In Progress | Verified merge commit `596298f2fc2ea5ae9a2fcc5081ba196ce6901339` (`Merge branch 'copilot/rhi-045-batch-3-closeout'`) in local git history and confirmed it is contained by both local `main` and `origin/main`. Updated RHI-046 so the RHI-045 dependency and PR-closeout evidence items are closed, while broader Phase 4 sign-off gates remain open. |

---

### Notes

- The sign-off document must include a clear Phase 5/6 entry conditions section. Phase 5 and Phase 6 engineers should be able to read `migration/phase-4-signoff.md` and know exactly what content exists, what the redirect data covers, and what is still an open question.
- Phase 4 sign-off also needs to show which approved WordPress source artifacts were actually relied on. Downstream teams should not have to infer whether metadata or media coverage depended on API, SQL, or filesystem recovery.
- Downstream teams should also be able to see that post-generation cleanup is no longer hidden manual work. The handover package must make the `map-frontmatter -> finalize-content` sequence, the curated alt-text input, and the correction audit artifacts explicit.
- Any risk accepted at sign-off must be logged with the accepting owner's name. Undocumented risk acceptance is indistinguishable from overlooked risk — this is a hard rule, not a recommendation.
- The exception register is not a place to hide problems. Every deferred item is a known gap. If the gap is too large to accept for launch, address it in Phase 4 before closing this ticket.
- Reference: `analysis/plan/details/phase-4.md` §Definition of Done, §Exit Gate to Phase 5/6/8
