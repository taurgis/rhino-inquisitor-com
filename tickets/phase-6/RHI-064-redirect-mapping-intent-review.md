## RHI-064 · Workstream B — Redirect Mapping Specification and Intent Review

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 6  
**Assigned to:** SEO Owner  
**Target date:** 2026-05-08  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Produce a validated, intent-reviewed redirect mapping table that covers every URL with a `redirect` or `merge` disposition. Every mapping must pass an equivalence review that confirms the target is topic-relevant to the source. Convenience redirects, bulk homepage fallbacks, and ambiguous mappings are explicitly blocked from reaching implementation.

This workstream is the editorial and SEO quality gate for redirects. Technical implementation of aliases and redirect pages (WS-C: RHI-065) depends directly on the validated mapping from this workstream. Shortcuts here — approving unreviewed mappings or deferring intent review to post-launch — create soft-404 patterns that are difficult and expensive to unwind after Google has indexed them.

---

### Acceptance Criteria

- [ ] `migration/url-map.csv` (produced by WS-A) is loaded as the review input
- [ ] Every URL with `disposition: redirect` (merge) has an assigned `intent_class`:
  - [ ] `exact-equivalent` — identical content moved to a new path with no material change
  - [ ] `consolidated-equivalent` — content merged into a topically equivalent destination
  - [ ] `retired-no-equivalent` — content removed with no suitable replacement (must use retirement path, not redirect)
- [ ] Intent review rules enforced and documented:
  - [ ] Zero homepage (`/`) redirects for non-home legacy content unless topic equivalence is proven and documented
  - [ ] Zero category-root redirects for content not categorically equivalent
  - [ ] Zero multi-hop redirect chains (target URL must be a final canonical destination, not an intermediate)
  - [ ] Zero redirects to thin or low-quality aggregate pages unless SEO owner approves in writing
- [ ] All ambiguous mappings are resolved before this ticket closes:
  - [ ] Ambiguous mapping = any record where topic equivalence is unclear or debated
  - [ ] Each resolved ambiguous mapping has a decision note in the `notes` field of `migration/url-map.csv`
  - [ ] Any mapping that cannot be resolved is reclassified as `retired-no-equivalent` and documented
- [ ] Final mapping table `migration/url-map.csv` updated with:
  - [ ] `intent_class` for every redirect row
  - [ ] `owner` field populated for all records
  - [ ] `notes` for every ambiguous or edge-case resolution
- [ ] `migration/reports/phase-6-redirect-intent-review.csv` generated:
  - [ ] One row per redirect record
  - [ ] Columns: `legacy_url`, `target_url`, `intent_class`, `review_status` (approved/rejected/deferred), `reviewer`, `notes`
  - [ ] All rows have `review_status: approved` or are reclassified as retired before ticket closes
- [ ] Zero `review_status: deferred` rows in the review report at ticket close
- [ ] Review report is committed and the redirect mapping is frozen pending WS-C implementation

---

### Tasks

- [ ] Load finalized `migration/url-map.csv` from WS-A (RHI-063)
- [ ] Filter all records with `disposition: redirect` (merge) into a working review queue
- [ ] For each redirect record:
  - [ ] Review the source URL content (check live site or archived content)
  - [ ] Review the target URL content (check Phase 4 migrated content or planned destination)
  - [ ] Assign `intent_class`: `exact-equivalent`, `consolidated-equivalent`, or `retired-no-equivalent`
  - [ ] Approve, reject, or flag as ambiguous
- [ ] Apply blocking rules during review:
  - [ ] Reject any homepage redirect for non-home content — escalate for reclassification as `retire`
  - [ ] Reject any category-root redirect for non-equivalent content — escalate for reclassification
  - [ ] Reject any record where target URL is itself a redirect destination (chain prevention)
  - [ ] Reject any record where target URL resolves to a thin or generic page
- [ ] Escalate rejected or ambiguous records to SEO owner for final decision:
  - [ ] Agree resolution within Phase 6 timeline
  - [ ] Reclassify unresolvable records as `retired-no-equivalent`
- [ ] Write `migration/reports/phase-6-redirect-intent-review.csv`
- [ ] Update `migration/url-map.csv` with `intent_class` and `notes` for each reviewed record
- [ ] Run validation to confirm zero deferred rows and zero unapproved records
- [ ] Commit updated `migration/url-map.csv` and `migration/reports/phase-6-redirect-intent-review.csv`
- [ ] Notify WS-C owner (RHI-065) that mapping is frozen and ready for implementation

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
| RHI-063 Done — `migration/url-map.csv` finalized and committed | Ticket | Pending |
| RHI-062 Done — Redirect architecture decision committed (needed to confirm intent-class scope) | Ticket | Pending |
| SEO owner available for intent review and approval | Access | Pending |
| Access to live site content for source URL review | Access | Pending |
| Phase 4 migrated content accessible for target URL review | Phase | Pending |

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- `migration/url-map.csv` — updated with `intent_class`, `owner`, and `notes` for all redirect rows
- `migration/reports/phase-6-redirect-intent-review.csv` — intent review report with all rows approved

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- The intent review is an SEO editorial function, not a technical function. The reviewer must assess whether a user arriving at the legacy URL would consider the redirect destination a suitable and relevant outcome. Technically valid mappings can still be SEO defects if topic equivalence is weak.
- The blocking rule against homepage redirects for non-home content is non-negotiable. It is derived from Google's soft-404 guidance: bulk redirecting unrelated legacy URLs to the homepage causes those URLs to eventually be treated as soft-404s and removed from the index without equity transfer.
- Multi-hop redirect detection must check whether any `target_url` in the mapping table is itself a `legacy_url` in the same table. If so, that is a chain and must be re-mapped to the final destination.
- The intent review report (`phase-6-redirect-intent-review.csv`) is a Phase 6 deliverable and must be available for Phase 8 launch readiness review (RHI-046 equivalent sign-off). Do not omit it even if the review appears straightforward.
- Reference: `analysis/plan/details/phase-6.md` §Workstream B, §SEO Implications and Best-Practice Enforcement
