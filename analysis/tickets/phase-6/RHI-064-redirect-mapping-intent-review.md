## RHI-064 · Workstream B — Redirect Mapping Specification and Intent Review

**Status:** Done  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 6  
**Assigned to:** SEO Owner  
**Target date:** 2026-05-08  
**Created:** 2026-03-07  
**Updated:** 2026-03-13

---

### Goal

Produce a validated, intent-reviewed redirect mapping table that covers every URL with a `redirect` or `merge` disposition. Every mapping must pass an equivalence review that confirms the target is topic-relevant to the source. Convenience redirects, bulk homepage fallbacks, and ambiguous mappings are explicitly blocked from reaching implementation.

This workstream is the editorial and SEO quality gate for redirects. Technical implementation of aliases and redirect pages (WS-C: RHI-065) depends directly on the validated mapping from this workstream. Shortcuts here — approving unreviewed mappings or deferring intent review to post-launch — create soft-404 patterns that are difficult and expensive to unwind after Google has indexed them.

---

### Acceptance Criteria

- [x] `migration/url-map.csv` (produced by WS-A) is loaded as the review input
- [x] Every URL with `disposition: redirect` (merge) has an assigned `intent_class`:
  - [x] `exact-equivalent` — identical content moved to a new path with no material change
  - [x] `consolidated-equivalent` — content merged into a topically equivalent destination
  - [x] `retired-no-equivalent` — content removed with no suitable replacement (must use retirement path, not redirect)
- [x] Intent review rules enforced and documented:
  - [x] Zero homepage (`/`) redirects for non-home legacy content unless topic equivalence is proven and documented
  - [x] Zero category-root redirects for content not categorically equivalent
  - [x] Zero multi-hop redirect chains (target URL must be a final canonical destination, not an intermediate)
  - [x] Zero redirects to thin or low-quality aggregate pages unless SEO owner approves in writing
- [x] All ambiguous mappings are resolved before this ticket closes:
  - [x] Ambiguous mapping = any record where topic equivalence is unclear or debated
  - [x] Each resolved ambiguous mapping has a decision note in the `notes` field of `migration/url-map.csv`
  - [x] Any mapping that cannot be resolved is reclassified as `retired-no-equivalent` and documented
- [x] Final mapping table `migration/url-map.csv` updated with:
  - [x] `intent_class` for every redirect row
  - [x] `owner` field populated for all records
  - [x] `notes` for every ambiguous or edge-case resolution
- [x] `migration/reports/phase-6-redirect-intent-review.csv` generated:
  - [x] One row per redirect record
  - [x] Columns: `legacy_url`, `target_url`, `intent_class`, `review_status` (approved/rejected/deferred), `reviewer`, `notes`
  - [x] All rows have `review_status: approved` or are reclassified as retired before ticket closes
- [x] Zero `review_status: deferred` rows in the review report at ticket close
- [x] Review report is committed and the redirect mapping is frozen pending WS-C implementation

---

### Tasks

- [x] Load finalized `migration/url-map.csv` from WS-A (RHI-063)
- [x] Filter all records with `disposition: redirect` (merge) into a working review queue
- [x] For each redirect record:
  - [x] Review the source URL content (check live site or archived content)
  - [x] Review the target URL content (check Phase 4 migrated content or planned destination)
  - [x] Assign `intent_class`: `exact-equivalent`, `consolidated-equivalent`, or `retired-no-equivalent`
  - [x] Approve, reject, or flag as ambiguous
- [x] Apply blocking rules during review:
  - [x] Reject any homepage redirect for non-home content — escalate for reclassification as `retire`
  - [x] Reject any category-root redirect for non-equivalent content — escalate for reclassification
  - [x] Reject any record where target URL is itself a redirect destination (chain prevention)
  - [x] Reject any record where target URL resolves to a thin or generic page
- [x] Escalate rejected or ambiguous records to SEO owner for final decision:
  - [x] Agree resolution within Phase 6 timeline
  - [x] Reclassify unresolvable records as `retired-no-equivalent`
- [x] Write `migration/reports/phase-6-redirect-intent-review.csv`
- [x] Update `migration/url-map.csv` with `intent_class` and `notes` for each reviewed record
- [x] Run validation to confirm zero deferred rows and zero unapproved records
- [x] Commit updated `migration/url-map.csv` and `migration/reports/phase-6-redirect-intent-review.csv`
- [x] Notify WS-C owner (RHI-065) that mapping is frozen and ready for implementation

---

### Out of Scope

- Implementing Hugo aliases or redirect pages (WS-C: RHI-065)
- Changing disposition of `keep` or `retire` URLs without SEO owner approval
- Writing CI validation scripts for redirect behavior (WS-H: RHI-070)
- Reviewing host/protocol consolidation mappings (WS-D: RHI-066)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-063 Done — `migration/url-map.csv` finalized and committed | Ticket | Resolved |
| RHI-062 Done — Redirect architecture decision committed (needed to confirm intent-class scope) | Ticket | Resolved |
| SEO owner available for intent review and approval | Access | Resolved |
| Access to live site content for source URL review | Access | Resolved via legacy route evidence, target-path inspection, and prior Phase 4/5 migration artifacts |
| Phase 4 migrated content accessible for target URL review | Phase | Resolved |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Large redirect queue makes intent review take longer than allocated time | Medium | Medium | Prioritize high-traffic and high-backlink records first; use Phase 1 SEO baseline to rank review queue; timebox per-record review to 5 minutes | SEO Owner |
| SEO owner unavailable during review window, creating bottleneck | Medium | High | Pre-identify a backup reviewer for Medium/Low priority records; Critical records must have primary SEO owner approval | Migration Owner |
| Ambiguous mappings with no clear equivalent destination discovered at scale | Medium | High | Reclassify as `retired-no-equivalent` rather than forcing weak consolidation; document scale in Progress Log and raise to migration owner if >10% of redirect records affected | SEO Owner |
| Phase 4 migrated content not yet available for target URL verification | Medium | Medium | For Phase 4 content not yet committed, use Phase 4 migration plan documents and front matter mapping as reference; flag any target URL not confirmed in content as provisional | SEO Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-064 is complete. The finalized Phase 6 review covered all `141` `merge` rows produced by RHI-063 and froze the reviewed mapping for WS-C consumption. Final review outcomes are `138` `exact-equivalent` rows and `3` `consolidated-equivalent` rows, with `0` unresolved mappings, `0` deferred review statuses, `0` homepage fallbacks, and `0` redirect chains within merge scope.

The review also documented the accepted Model A limitations for the `123` query-string legacy routes without weakening the semantic review. Those rows now carry explicit notes that they remain exact-equivalent editorial mappings while launch delivery stays outside Hugo alias support under the RHI-062 accepted-risk posture. Broad or potentially ambiguous targets such as `/archive/`, `/ideas/`, `/video/`, `/category/external/`, `/category/salesforce-commerce-cloud/`, and `/feed/` now have written rationale in both the mapping table and the review report.

This ticket produced the repeatable Phase 6 controls needed for handoff and later governance work: `npm run phase6:review-redirect-intent` regenerates the reviewed `migration/url-map.csv` and the required report, while `npm run validate:redirect-intent-review` enforces report parity and the WS-B zero-pending/zero-deferred closure rules.

**Delivered artefacts:**

- `migration/url-map.csv` — updated with `intent_class`, `owner`, and `notes` for all redirect rows
- `migration/reports/phase-6-redirect-intent-review.csv` — intent review report with all rows approved
- `scripts/phase-6/review-redirect-intent.js` — deterministic redirect-intent review generator
- `scripts/phase-6/validate-redirect-intent-review.js` — redirect-intent review validation gate
- `analysis/documentation/phase-6/rhi-064-redirect-intent-review-implementation-2026-03-13.md` — implementation and verification record

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-13 | In Progress | Started WS-B after RHI-063 freeze. Confirmed the active review queue is `141` `merge` rows from `migration/url-map.csv`: `123` query-string rows on `implementation_layer: none` plus `18` path-based rows on `pages-static`. Reviewed the approved Phase 4 taxonomy flattening routes, the legacy feed variants, the alternate page-slug merges, and the query-string accepted-risk subset against the RHI-062 Model A ADR and the Phase 6 blocking rules. |
| 2026-03-13 | Done | Added deterministic review and validation scripts for WS-B, regenerated `migration/url-map.csv`, and wrote `migration/reports/phase-6-redirect-intent-review.csv`. Final review counts: `141` reviewed rows, `138` `exact-equivalent`, `3` `consolidated-equivalent`, `0` deferred, `0` homepage targets, and `0` merge-scope redirect chains. The reviewed map is frozen and ready for WS-C (RHI-065). |

---

### Notes

- The intent review is an SEO editorial function, not a technical function. The reviewer must assess whether a user arriving at the legacy URL would consider the redirect destination a suitable and relevant outcome. Technically valid mappings can still be SEO defects if topic equivalence is weak.
- The blocking rule against homepage redirects for non-home content is non-negotiable. It is derived from Google's soft-404 guidance: bulk redirecting unrelated legacy URLs to the homepage causes those URLs to eventually be treated as soft-404s and removed from the index without equity transfer.
- Multi-hop redirect detection must check whether any `target_url` in the mapping table is itself a `legacy_url` in the same table. If so, that is a chain and must be re-mapped to the final destination.
- The intent review report (`phase-6-redirect-intent-review.csv`) is a Phase 6 deliverable and must be available for Phase 8 launch readiness review (RHI-092 sign-off). Do not omit it even if the review appears straightforward.
- Reference: `analysis/plan/details/phase-6.md` §Workstream B, §SEO Implications and Best-Practice Enforcement
