## RHI-045 · Batch 3 — Long-Tail and Taxonomy Migration

**Status:** Open  
**Priority:** High  
**Estimate:** L  
**Phase:** 4  
**Assigned to:** Migration Owner  
**Target date:** 2026-04-29  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Migrate all remaining in-scope content not covered by the pilot or high-value batches: long-tail posts, remaining pages, category taxonomy pages, video archives, and any content type requiring special handling. This batch also includes the final exception closure pass — all outstanding HTML fallback conversions, quarantine records, and deferred items must be resolved, accepted, or explicitly deferred to Phase 5/8 before this batch is merged.

This is typically the largest batch in terms of record count but the lowest risk per-record, because the pipeline has been validated by two previous batches. However, taxonomy and archive pages carry specific SEO value and must be handled with the same care as individual posts.

---

### Acceptance Criteria

- [ ] All remaining in-scope `keep` and `merge` records not migrated in Batch 1 or Batch 2 are included
- [ ] Taxonomy and category pages are migrated with correct handling:
  - [ ] Each category with organic traffic has a corresponding Hugo taxonomy term page with:
    - [ ] Correct `url` matching legacy WordPress category URL
    - [ ] `description` front matter (category description if available in WordPress)
    - [ ] `title` matching category display name
  - [ ] Video archive and hub pages are migrated with correct URL assignment
  - [ ] Archive page structure (date-based archives, if applicable) is handled per manifest
- [ ] All outstanding HTML fallback conversion records from earlier batches are resolved:
  - [ ] Each fallback item is either:
    - [ ] Manually remediated and converted to clean Markdown
    - [ ] Or explicitly accepted as HTML fallback with documented owner and planned Phase 5/8 remediation
  - [ ] Fallback acceptance is recorded in `migration/reports/conversion-fallbacks.csv`
- [ ] Quarantine log (`migration/intermediate/extract-quarantine.json`) is fully resolved:
  - [ ] Each quarantined record is either extracted, deferred with owner, or excluded with documented rationale
  - [ ] No quarantine item is silently dropped
- [ ] All CI gates pass on Batch 3 PR (same gate set as Batches 1 and 2)
- [ ] Migration item report is complete for the full record set:
  - [ ] 100% of in-scope `keep` and `merge` records have a `qa_status` of `ready` or `review-required`
  - [ ] Zero records with `qa_status: blocked` remain unresolved
- [ ] Exception closure summary is documented:
  - [ ] List of all deferred items with owner and target resolution phase (Phase 5 SEO, Phase 8 validation)
  - [ ] Approved by migration owner before this ticket is `Done`
- [ ] Batch 3 PR is merged to `main` only after all CI gates pass and exception closure summary is approved

---

### Tasks

- [ ] Identify all remaining in-scope records not yet in `src/content/`:
  - [ ] Query normalized records for records not present in `src/content/` directory
  - [ ] Confirm all `retire`-disposition records are correctly excluded
- [ ] Plan taxonomy and archive page handling with SEO owner:
  - [ ] Confirm which category pages have organic traffic and must be preserved
  - [ ] Confirm video archive URL strategy
  - [ ] Confirm date archive URL strategy from manifest and baseline traffic data (do not assume Hugo generates WordPress-style date archives by default)
- [ ] Run full pipeline on remaining records
- [ ] Run exception closure pass:
  - [ ] Review `migration/reports/conversion-fallbacks.csv` — remediate or accept each outstanding item
  - [ ] Review `migration/intermediate/extract-quarantine.json` — resolve each entry
  - [ ] Document all accepted exceptions with owner in Progress Log
- [ ] Run all CI gates and fix failures
- [ ] Run complete migration item report across full record set:
  - [ ] Verify 100% coverage for `keep` and `merge` records
  - [ ] Verify zero `blocked` items
- [ ] Open Batch 3 PR:
  - [ ] PR description includes: record count, taxonomy pages list, exception closure summary, gate results
  - [ ] Migration owner reviews exception closure list and approves
  - [ ] All CI gates pass
- [ ] Merge Batch 3 PR
- [ ] Prepare Phase 4 sign-off package (RHI-046):
  - [ ] Complete migration item report
  - [ ] Exception closure summary
  - [ ] Deferred item list with owners and target phases
  - [ ] CI gate evidence (links to passing Actions runs)

---

### Out of Scope

- Content enrichment, SEO optimization, or editorial improvements (Phase 5)
- Post-launch monitoring (Phase 9)
- Deploying to production domain (Phase 7)
- Fixing structural template issues surfaced by content review (Phase 3 or Phase 8 scope)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-044 Done — High-value batch completed | Ticket | Pending |
| All Batch 2 gate failures and SEO spot-check findings resolved | Ticket | Pending |
| SEO owner available for taxonomy page strategy decision | Access | Pending |
| All outstanding HTML fallback owners reachable for exception closure | Access | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Taxonomy pages for high-traffic categories have no description data in WordPress | High | Medium | Use a template-based description fallback for category pages; flag for Phase 5 description enrichment | SEO Owner |
| Large batch size causes Hugo build time to exceed CI timeout | Medium | Medium | Monitor build time on Batch 2 output; if build time trend is concerning, split Batch 3 into sub-batches | Engineering Owner |
| Unresolved quarantine records silently missing from final site coverage | Low | High | Quarantine resolution is a hard acceptance criterion; do not merge Batch 3 with unresolved quarantine items | Migration Owner |
| WordPress date archive URLs require explicit Hugo routing decisions | Low | Medium | Validate date archive behavior strictly from manifest mappings; implement only explicitly mapped archive URLs | Engineering Owner |
| Exception closure incomplete — items accepted without owner assignment | Medium | Medium | Require owner field in fallback acceptance log; migration owner reviews before PR merge | Migration Owner |

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

- Long-tail and taxonomy batch `.md` files committed to `src/content/`
- Complete migration item report for full record set
- Exception closure summary (deferred items with owners)
- CI gate evidence for Batch 3 PR
- Phase 4 sign-off package (input to RHI-046)

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- Taxonomy (category) pages in Hugo are automatically generated from front matter `categories` fields. However, the URL for the generated taxonomy pages must match the legacy WordPress category URL paths. Verify this mapping explicitly before running the batch.
- Date-based archives (`/2020/`, `/2020/10/`) may or may not exist in WordPress. Check the URL manifest for any date archive URLs with traffic before assuming they should be preserved.
- The exception closure pass is not a rubber stamp. Every deferred item represents a known gap in the migration. The migration owner must explicitly accept each one — undocumented deferrals are equivalent to untracked risks.
- Reference: `analysis/plan/details/phase-4.md` §Batch Strategy and Execution Cadence
