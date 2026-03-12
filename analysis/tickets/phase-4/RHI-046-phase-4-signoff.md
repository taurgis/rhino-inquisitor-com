## RHI-046 · Phase 4 Sign-off and Handover to Phase 5/6

**Status:** Done  
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

- [x] All Phase 4 workstream tickets are `Done`:
  - [x] RHI-031 Done — Phase 4 Bootstrap complete
  - [x] RHI-032 Done — WordPress content extraction complete
  - [x] RHI-033 Done — Normalization and canonical record model complete
  - [x] RHI-034 Done — HTML-to-Markdown conversion engine complete
  - [x] RHI-035 Done — Front matter mapping and Hugo contract complete
  - [x] RHI-036 Done — URL preservation and redirect integrity complete
  - [x] RHI-037 Done — Media migration and asset hygiene complete
  - [x] RHI-038 Done — Internal link and navigation rewrites complete
  - [x] RHI-039 Done — SEO signal preservation complete
  - [x] RHI-040 Done — Accessibility and content semantics complete
  - [x] RHI-041 Done — Security and data hygiene complete
  - [x] RHI-042 Done — Reporting, traceability, and audit framework complete
  - [x] RHI-043 Done — Pilot batch migrated and merged
  - [x] RHI-044 Done — High-value batch migrated and merged
  - [x] RHI-045 Done — Long-tail and taxonomy batch migrated and merged (Batch 3 merge evidence recorded from commit `596298f2fc2ea5ae9a2fcc5081ba196ce6901339` on `main`)
- [x] Final migration item report confirms:
  - [x] 100% of in-scope `keep` and `merge` records are present in `src/content/` or explicitly deferred with documented owner
  - [x] Zero records with `qa_status: blocked`
  - [x] All `retire`-disposition records are confirmed absent from Hugo output
  - [x] Source-channel provenance is documented for migrated records and any waived source artifacts are explicitly noted
- [x] The final post-generation correction contract is verified and preserved:
  - [x] `migration/input/image-alt-corrections.csv` is committed as the durable curated alt-text input used by the final Phase 4 batches
  - [x] `migration/reports/content-corrections-summary.json` and `migration/reports/image-alt-corrections-audit.csv` are present in the final evidence set
  - [x] Re-running `npm run migrate:apply-corrections` on the final staged corpus is idempotent
- [x] All CI gates pass on the final `main` branch build:
  - [x] `hugo --minify --environment production` exits with code 0
  - [x] `npm run validate:frontmatter` exits with code 0
  - [x] `npm run check:url-parity` exits with code 0
  - [x] `npm run check:redirects` exits with code 0
  - [x] `npm run check:seo-completeness` exits with code 0
  - [x] `npm run check:noindex` exits with code 0
  - [x] `npm run check:feed-compatibility` exits with code 0
  - [x] `npm run check:media` exits with code 0
  - [x] `npm run check:links` exits with code 0
  - [x] `npm run check:a11y` exits with code 0 or within agreed cap
  - [x] `npm run check:security-content` exits with code 0
  - [x] `npm run check:migration-thresholds` exits with code 0
- [x] Phase 4 exit gate conditions from `analysis/plan/details/phase-4.md` are met:
  - [x] Phase 5 can consume complete metadata fields without backfill
  - [x] Phase 6 has full alias/mapping data for all moved URLs
  - [x] Phase 8 can run against a content-complete build artifact
- [x] `migration/phase-4-signoff.md` is committed with:
  - [x] Summary of all Phase 4 workstream outcomes (RHI-032 through RHI-045) with ticket IDs and file paths
  - [x] Final migration item report metrics (total records, by type, by status)
  - [x] Approved source artifacts used for migration runs, including any SQL or filesystem recovery notes
  - [x] The approved post-mapping execution sequence (`npm run migrate:map-frontmatter` followed by `npm run migrate:finalize-content`) and the correction artifacts it produces
  - [x] Exception register: all accepted deferrals with owner, reason, and target resolution phase
  - [x] Phase 4 Definition of Done compliance statement
  - [x] Phase 5/6/8 entry conditions — what downstream phases can rely on
  - [x] Outstanding risks accepted for Phase 5/6 (with owners)
  - [x] Stakeholder sign-off block (migration owner, SEO owner, engineering owner)
- [x] Phase 5 and Phase 6 teams have confirmed receipt of the Phase 4 handover package

---

### Tasks

- [x] Confirm all 15 Phase 4 workstream and batch tickets are `Done`
- [x] Run all CI gates locally against the final `main` branch build:
  - [x] Full gate list as above — every gate must pass
  - [x] Record CI run URL in Progress Log
- [x] Generate final migration item report:
  - [x] `npm run migrate:report`
  - [x] Verify 100% coverage and zero blocked items
- [x] Verify final correction evidence before handover:
  - [x] Confirm `migration/input/image-alt-corrections.csv` is committed and reflects the approved curated overrides from the final batches
  - [x] Re-run `npm run migrate:apply-corrections` on the final staged corpus and confirm the rerun is idempotent
  - [x] Include `migration/reports/content-corrections-summary.json` and `migration/reports/image-alt-corrections-audit.csv` in the handover evidence set
  - [x] Confirm PR #27 closeout evidence references the refreshed staged-corpus rerun (`filesChanged: 0`) and the `main` merge commit
- [x] Review source artifact evidence from RHI-031, RHI-032, and RHI-042:
  - [x] Confirm the approved source-channel strategy was documented for each batch
  - [x] Confirm any waived or unavailable source artifacts were accepted explicitly by the owner
- [x] Review exception register from Batch 3 (RHI-045):
  - [x] Confirm all deferred items have owners and target phases
  - [x] Confirm no deferred item represents an unacceptable launch risk
- [x] Capture final public CI deployment workflow evidence on the final content build:
  - [x] Confirm the current `main` branch deploy workflow passed publicly
  - [x] Confirm Pages deployment succeeded
  - [x] Confirm migrated URLs remain build-valid and canonical in the deployed workflow path
  - [x] Record CI run URL in Progress Log
- [x] Draft `migration/phase-4-signoff.md`:
  - [x] Workstream outcomes table (ticket ID, deliverable, file path)
  - [x] Final migration metrics table (total, by type, by batch)
  - [x] Exception register (accepted deferrals with owners)
  - [x] Definition of Done compliance checklist
  - [x] Phase 5/6/8 entry conditions (what downstream phases can rely on)
  - [x] Stakeholder sign-off block
- [x] Circulate sign-off document for approval (migration owner, SEO owner, engineering owner)
- [x] Record final approval in Progress Log with approver names and dates
- [x] Notify Phase 5 team (SEO and Discoverability) that Phase 4 is complete
- [x] Notify Phase 6 team (URL Preservation and Redirect Strategy) that Phase 4 alias data is available

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
| RHI-031 through RHI-045 all Done | Ticket | Resolved |
| Migration owner, SEO owner, and engineering owner available for sign-off | Access | Resolved |
| Phase 5 and Phase 6 teams available to receive handover | Access | Resolved |

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

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Phase 4 is now formally closed. The final sign-off evidence set includes the Phase 4 summary at `migration/phase-4-signoff.md`, refreshed staged-corpus media and security validation, the current `main` branch deploy workflow evidence for commit `a8d877d`, and explicit user-owner approval plus Phase 5/6 handover receipt confirmation recorded on 2026-03-12.

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
| 2026-03-12 | In Progress | Re-ran `npm run migrate:finalize-content` against the current staged corpus, which localized the stale `heroImage` hotlinks and restored green results for both `npm run check:media` and `npm run check:security-content`. The resulting migration report now shows `331` total rows, `331` `ready`, and `0` blocked, with no remaining staged-corpus gate failures. |
| 2026-03-12 | In Progress | Completed the full local sign-off sweep on current `main` head `a8d877d`: `migrate:report`, `check:migration-thresholds`, `validate:frontmatter`, `build:prod`, `check:url-parity`, `check:redirects`, `check:seo-completeness`, `check:noindex`, `check:feed-compatibility`, `check:media`, `check:links`, `check:a11y`, and `check:security-content` all passed. Drafted `migration/phase-4-signoff.md` with the final metrics, source provenance, execution sequence, exception register, and downstream entry conditions. |
| 2026-03-12 | In Progress | Captured current public `main` branch deploy workflow evidence for the repository head: `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23022101012` (`Deploy to GitHub Pages #44`, commit `a8d877d`). Remaining blockers are explicit migration-owner, SEO-owner, and engineering-owner approval plus Phase 5 and Phase 6 handover receipt confirmation. |
| 2026-03-12 | Done | Thomas Theunen confirmed Phase 4 sign-off approval in the migration-owner, SEO-owner, and engineering-owner roles and also confirmed Phase 5 and Phase 6 handover receipt. Marked `RHI-046` done, finalized `migration/phase-4-signoff.md`, and closed Phase 4 in the ticket indexes. |

---

### Notes

- The sign-off document must include a clear Phase 5/6 entry conditions section. Phase 5 and Phase 6 engineers should be able to read `migration/phase-4-signoff.md` and know exactly what content exists, what the redirect data covers, and what is still an open question.
- Phase 4 sign-off also needs to show which approved WordPress source artifacts were actually relied on. Downstream teams should not have to infer whether metadata or media coverage depended on API, SQL, or filesystem recovery.
- Downstream teams should also be able to see that post-generation cleanup is no longer hidden manual work. The handover package must make the `map-frontmatter -> finalize-content` sequence, the curated alt-text input, and the correction audit artifacts explicit.
- Any risk accepted at sign-off must be logged with the accepting owner's name. Undocumented risk acceptance is indistinguishable from overlooked risk — this is a hard rule, not a recommendation.
- The exception register is not a place to hide problems. Every deferred item is a known gap. If the gap is too large to accept for launch, address it in Phase 4 before closing this ticket.
- Reference: `analysis/plan/details/phase-4.md` §Definition of Done, §Exit Gate to Phase 5/6/8
