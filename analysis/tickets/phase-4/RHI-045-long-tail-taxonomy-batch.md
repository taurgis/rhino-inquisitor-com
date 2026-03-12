## RHI-045 · Batch 3 — Long-Tail and Taxonomy Migration

**Status:** In Progress  
**Priority:** High  
**Estimate:** L  
**Phase:** 4  
**Assigned to:** Migration Owner  
**Target date:** 2026-04-29  
**Created:** 2026-03-07  
**Updated:** 2026-03-12

---

### Goal

Migrate all remaining in-scope content not covered by the pilot or high-value batches: long-tail posts, remaining pages, category taxonomy pages, video archives, and any content type requiring special handling. This batch also includes the final exception closure pass — all outstanding HTML fallback conversions, quarantine records, and deferred items must be resolved, accepted, or explicitly deferred to Phase 5/8 before this batch is merged.

This is typically the largest batch in terms of record count but the lowest risk per-record, because the pipeline has been validated by two previous batches. However, taxonomy and archive pages carry specific SEO value and must be handled with the same care as individual posts.

---

### Acceptance Criteria

- [x] All remaining in-scope `keep` and `merge` records not migrated in Batch 1 or Batch 2 are included
- [x] Taxonomy and category pages are migrated with correct handling:
  - [x] Each category with organic traffic has a corresponding Hugo taxonomy term page with:
    - [x] Correct `url` matching legacy WordPress category URL
    - [x] `description` front matter (category description if available in WordPress)
    - [x] `title` matching category display name
  - [x] Video archive and hub pages are migrated with correct URL assignment
  - [x] Archive page structure (date-based archives, if applicable) is handled per manifest
- [x] All outstanding HTML fallback conversion records from earlier batches are resolved:
  - [x] Each fallback item is either:
    - [ ] Remediated through a durable script or approved curated input and converted to clean Markdown
    - [ ] Or explicitly accepted as HTML fallback with documented owner and planned Phase 5/8 remediation
  - [x] Fallback acceptance is recorded in `migration/reports/conversion-fallbacks.csv`
- [x] Full staged-content execution uses the standard post-mapping sequence before gates run:
  - [x] `npm run migrate:map-frontmatter`
  - [x] `npm run migrate:finalize-content` (or the explicit `rewrite-media -> rewrite-links -> apply-corrections` sequence)
  - [x] `npm run migrate:report`
- [x] Quarantine log (`migration/intermediate/extract-quarantine.json`) is fully resolved:
  - [x] Each quarantined record is either extracted, deferred with owner, or excluded with documented rationale
  - [x] No quarantine item is silently dropped
- [x] All CI gates pass on Batch 3 PR (same gate set as Batches 1 and 2)
- [x] Migration item report is complete for the full record set:
  - [x] 100% of in-scope `keep` and `merge` records have a `qa_status` of `ready` or `review-required`
  - [x] Zero records with `qa_status: blocked` remain unresolved
- [x] Exception closure summary is documented:
  - [x] List of all deferred items with owner and target resolution phase (Phase 5 SEO, Phase 8 validation)
  - [x] Approved by migration owner before this ticket is `Done`
- [ ] Batch 3 PR evidence includes the cumulative correction outputs used to approve the batch:
  - [x] `migration/reports/content-corrections-summary.json`
  - [x] `migration/reports/image-alt-corrections-audit.csv`
  - [ ] Confirmation that the finalized long-tail corpus passed a zero-change correction rerun
  - [x] Current non-convergence evidence is documented in `analysis/documentation/phase-4/rhi-045-correction-rerun-nonconvergence-2026-03-12.md`
- [ ] Batch 3 PR is merged to `main` only after all CI gates pass and exception closure summary is approved

---

### Tasks

- [x] Identify all remaining in-scope records not yet in `src/content/`:
  - [x] Query normalized records for records not present in `src/content/` directory
  - [x] Confirm all `retire`-disposition records are correctly excluded
- [x] Plan taxonomy and archive page handling with SEO owner:
  - [x] Confirm which category pages have organic traffic and must be preserved
  - [x] Confirm video archive URL strategy
  - [x] Confirm date archive URL strategy from manifest and baseline traffic data (do not assume Hugo generates WordPress-style date archives by default)
- [x] Run full pipeline on remaining records, including `npm run migrate:finalize-content` after `npm run migrate:map-frontmatter`
- [x] Run exception closure pass:
  - [x] Review `migration/reports/conversion-fallbacks.csv` — remediate or accept each outstanding item
  - [x] If remediation is required, encode it in the migration scripts or approved curated inputs rather than patching generated Markdown by hand
  - [x] Review `migration/intermediate/extract-quarantine.json` — resolve each entry
  - [x] Document all accepted exceptions with owner in Progress Log
- [x] Record durable post-generation curation updates discovered during long-tail review:
  - [x] Add curated image-alt overrides to `migration/input/image-alt-corrections.csv`
  - [x] Add any approved pre-mapping metadata updates to the supported curation input before rerunning `npm run migrate:map-frontmatter` and `npm run migrate:finalize-content`
- [x] Run all CI gates and fix failures
- [x] Run complete migration item report across full record set:
  - [x] Verify 100% coverage for `keep` and `merge` records
  - [x] Verify zero `blocked` items
- [ ] Open Batch 3 PR:
  - [ ] PR description includes: record count, taxonomy pages list, exception closure summary, gate results, `migration/reports/content-corrections-summary.json`, `migration/reports/image-alt-corrections-audit.csv`, and correction-rerun idempotency confirmation
  - [ ] Migration owner reviews exception closure list and approves
  - [ ] All CI gates pass
- [ ] Merge Batch 3 PR
- [x] Investigate and document the correction-summary non-convergence evidence gap:
  - [x] Confirm the current checked-in summary state
  - [x] Measure rerun behavior against a temp copy of the current staged corpus
  - [x] Record the residual rewrite signatures and exact evidence gap in supporting documentation
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
| RHI-044 Done — High-value batch completed | Ticket | Resolved |
| All Batch 2 gate failures and SEO spot-check findings resolved | Ticket | Resolved |
| SEO owner available for taxonomy page strategy decision | Access | Resolved |
| All outstanding HTML fallback owners reachable for exception closure | Access | Resolved |

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
- [x] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Completed the Batch 3 closeout package, opened PR #27, and recorded a successful CI run at `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/22995801798`. On 2026-03-12 Thomas Theunen, acting as user-owner and migration owner, approved closing RHI-045 before merge based on the green PR evidence and the then-available local closeout package.

Current evidence review on 2026-03-12 reopened the ticket because the correction-rerun proof still does not support the zero-change acceptance criterion. The checked-in correction summary is now current for the regenerated staged corpus and reports `filesChanged: 166`, but a fresh temp-copy rerun investigation on the current `migration/output/content/` corpus still did not converge to `0` across five sequential correction passes (`60 -> 21 -> 17 -> 16 -> 16`).

Current verification on 2026-03-12 confirms the migration coverage itself is complete for article-like and in-scope taxonomy content: all `150` article-like `keep` or `merge` records (`post` plus `video`) match promoted files under `src/content/posts/` with explicit `url` front matter, and all `17` `keep`-disposition category routes with organic traffic are backed by taxonomy term bundles plus matching `public/sitemap.xml` entries. The remaining blocker is correction-rerun evidence, not missing migrated content.

**Delivered artefacts:**

- Long-tail and taxonomy batch `.md` files committed to `src/content/`
- Complete migration item report for full record set
- `migration/reports/content-corrections-summary.json`
- `migration/reports/image-alt-corrections-audit.csv`
- `analysis/documentation/phase-4/rhi-045-correction-rerun-nonconvergence-2026-03-12.md`
- `analysis/documentation/phase-4/rhi-045-residual-seo-closeout-2026-03-12.md`
- Exception closure summary (deferred items with owners)
- CI gate evidence for Batch 3 PR: `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/22995801798`
- Phase 4 sign-off package (input to RHI-046)

**Deviations from plan:**

- User-owner approved a pre-merge closeout on 2026-03-12, but that approval was based on evidence that is no longer internally consistent with the checked-in correction summary and rerun behavior. PR #27 remains open against `main`, and correction-rerun evidence must be refreshed before RHI-045 can be treated as fully closed again.

---

### Batch 3 Closeout Evidence Snapshot

- Article coverage evidence:
  - All `150` article-like `keep` or `merge` manifest records (`post` plus `video`) are present in `src/content/posts/*.md` with matching `url` front matter.
  - All corresponding migration item report rows are `qa_status=ready`, including the five `video`-class routes promoted as posts.

- Taxonomy evidence:
  - The `17` `keep`-disposition category routes with organic traffic are backed by term bundles under `src/content/categories/**/_index.md`, matching generated `public/category/**/index.html` output, and current `public/sitemap.xml` entries.
  - Durable category term bundles now exist under `src/content/categories/**/_index.md`, including `video`, `podcasts`, and `sessions`.
  - The owner-approved flat taxonomy contract remains the active Batch 3 rule for nested long-tail category paths.
- Video evidence:
  - `/video/` is backed by `src/content/pages/video.md`.
  - `/category/video/`, `/category/podcasts/`, and `/category/sessions/` pass URL parity as generated routes.
  - `/category/video/podcasts/` and `/category/video/sessions/` pass URL parity as merge-based deferred-edge redirects.
- Archive evidence:
  - `/archive/` is backed by `src/content/pages/archive.md`.
  - `/archive/2/` through `/archive/8/` are explicitly retired in the manifest and pass URL parity as true not found.
  - Hugo does not generate WordPress-style date archive routes implicitly; any kept archive surface must be modeled explicitly.
- Correction and reporting evidence:
  - `migration/reports/content-corrections-summary.json` currently reports `filesChanged: 166`; this checked-in file is current for the regenerated staged corpus and still does not support the zero-change rerun claim.
  - A fresh temp-copy rerun investigation against the current `migration/output/content/` corpus remained non-idempotent across five sequential passes: `60 -> 21 -> 17 -> 16 -> 16` files changed.
  - The net residual pass-5 diff collapsed to a single post with malformed nested angle-bracket token patterns: `what-is-new-in-sfcc-24-6.md`.
  - A separate temp-copy replay of the full `migrate:apply-corrections` workflow, including `markdownlint-cli2 --fix`, converged at the final-tree level after four completed passes (`166 -> 48 -> 3 -> 0` net diffs between finished pass snapshots), but it still fails the stricter first-rerun zero-change acceptance criterion.
  - Supporting investigation note: `analysis/documentation/phase-4/rhi-045-correction-rerun-nonconvergence-2026-03-12.md`.
  - `migration/reports/migration-item-report.csv` now reports `331` `ready`, `0` `review-required`, and `0` `blocked` after the final clean-cohort metadata batch.
  - `migration/reports/seo-completeness-report.csv` now reports `0` warnings and `0` failures after the category taxonomy description closure.
  - `npm run check:seo` now passes after `src/layouts/sitemap.xml` was extended to emit the rendered `/pages/page/2-3/` and `/posts/page/2-16/` routes.
  - `migration/reports/image-alt-corrections-audit.csv` is present and reflects the final curated alt-text input state.
  - `migration/reports/conversion-fallbacks.csv` remains header-only.
  - `migration/intermediate/extract-quarantine.json` remains empty.

### Draft Exception Closure Summary

| Item | Current evidence | Owner | Target phase | Approval status |
|------|------------------|-------|--------------|-----------------|
| SEO metadata length warnings | `0` warning-only rows remain in `migration/reports/seo-completeness-report.csv`; all migration-item review cohorts are now `0` | User-owner | Phase 5 | Closed |
| Accessibility weak-link warning | 0 warning rows in `migration/reports/a11y-content-warnings.csv` after the named exception cleanup | User-owner | Phase 8 | Pending |
| URL parity warning carryover | 0 fail rows in `migration/reports/url-parity-report.csv`; 541 deferred-edge warning-pass rows remain expected until Phase 6 redirect implementation | User-owner | Phase 6 | Pending |
| Goldmark raw HTML warnings | 2 render warnings recorded during local build validation | User-owner | Phase 8 | Pending |

### Remaining PR Blocker

- Correction-rerun evidence remains unresolved for RHI-045 closeout. The ticket cannot claim a zero-change correction rerun until the correction pipeline converges on the current staged corpus or the acceptance criteria are explicitly revised with owner approval.
- PR #27 is green and still open, but the closeout evidence package is incomplete while the correction-summary non-convergence remains unresolved.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-11 | In Progress | Refreshed the full Phase 4 extraction and normalization artifacts and confirmed the real Batch 3 backlog: 193 in-scope `keep` or `merge` records, 144 routes not yet promoted into `src/content/`, 22 category routes, 0 conversion fallback rows, and 0 quarantine rows. |
| 2026-03-11 | In Progress | User-owner approved keeping the current flat Hugo taxonomy contract for Batch 3. Nine remaining nested category `keep` routes were converted to merge-based flattening, explicit flat keep rows were added for the canonical category targets, and `map-frontmatter.js` now emits durable `categories/**/_index.md` term bundles keyed by canonical category target URLs instead of skipping category records. |
| 2026-03-11 | In Progress | Ran the full Batch 3 local pipeline through `migrate:report`, promoted the validated corpus into `src/content/`, removed the superseded `/privacy-policy/` scaffold placeholder, and revalidated the promoted build. Current local evidence: 331 migration item rows, 186 `ready`, 145 `review-required`, 0 `blocked`; `conversion-fallbacks.csv` remains header-only; `extract-quarantine.json` is empty; `check:migration-thresholds` passes; `content-corrections-summary.json` ends at `filesChanged: 0` after the convergence rerun. Remaining closeout work is PR/open-merge workflow plus review of the warning-level SEO/media/accessibility carryover items. |
| 2026-03-11 | In Progress | Ticket checklist updated to reflect completed local Batch 3 execution work. RHI-045 is not yet ready for commit/PR closeout because PR-only acceptance items remain open: exception closure summary with owner approval, warning-level carryover review, CI evidence on a Batch 3 PR, and final merge approval. |
| 2026-03-12 | In Progress | Drafted the Batch 3 closeout evidence and exception summary, confirmed the video and archive route strategy in the current repo state, and isolated the remaining parity mismatch to two manual seed manifest rows: `/archives/` and `/blog/`. A dedicated branch (`copilot/rhi-045-batch-3-closeout`) now holds the closeout work. |
| 2026-03-12 | In Progress | User-owner approved retiring `/archives/` and `/blog/` because both routes had no source-backed content, organic traffic, or external links. After updating the manifest and rerunning the targeted gates, URL parity dropped from 9 warning-level failures to 7 with 0 critical failures, and `check:migration-thresholds` still passed. |
| 2026-03-12 | Done | PR #27 (`RHI-045 prepare Batch 3 closeout`) recorded a successful GitHub Actions run at `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/22995801798`. Thomas Theunen explicitly approved marking RHI-045 `Done` before merge; the still-open PR is treated as operational follow-through, not a closeout blocker. |
| 2026-03-12 | In Progress | Revalidated the correction evidence against the current staged Batch 3 corpus. The checked-in `migration/reports/content-corrections-summary.json` still reports `filesChanged: 166`, while a temp-copy rerun investigation remained non-idempotent across four sequential passes (`60 -> 21 -> 18 -> 2`) and reduced the residual rewrite loop to two malformed angle-bracket or email/autolink cases. RHI-045 is reopened until that evidence gap is resolved or explicitly accepted. |
| 2026-03-12 | In Progress | Refreshed Batch 3 closeout evidence after the URL-parity fixes. `check:url-parity` now reports `1212` pass rows, `0` fail rows, and `0` critical failures. A fresh temp-copy rerun on the current staged corpus remained non-idempotent across five sequential passes (`60 -> 21 -> 17 -> 16 -> 16`), and the net pass-5 residual diff collapsed to `what-is-new-in-sfcc-24-6.md`. |
| 2026-03-12 | In Progress | Closed the two named article exceptions with durable body overrides, applied the three critical quick SEO fixes through `frontmatter-overrides.json`, and documented the remaining near-threshold and harder editorial metadata work in `analysis/documentation/phase-4/rhi-045-residual-seo-closeout-2026-03-12.md`. The current staged and promoted article files were synchronized manually to avoid triggering unrelated full-corpus churn while the correction rerun remains non-convergent. |
| 2026-03-12 | In Progress | Applied the remaining 14 near-threshold title fixes and 30 near-threshold description fixes for article-like keep routes through `frontmatter-overrides.json`, synchronized the staged and promoted content front matter, and tightened `generate-report.js` so `content_corrections_status=corrected` no longer forces `review-required` by itself. Fresh evidence: `check:seo-completeness` now reports `41` warnings with `0` remaining article-like near-threshold title/description rows; `migrate:report` now reports `295` `ready`, `36` `review-required`, `0` `blocked`. |
| 2026-03-12 | In Progress | Applied the seven harder-editorial carryover metadata fixes through `frontmatter-overrides.json`, synchronized staged and promoted content, and revalidated the closeout package. Fresh evidence: `check:seo-completeness` now reports `34` warnings with `0` remaining warnings for the seven carryover URLs; `migrate:report` now reports `302` `ready`, `29` `review-required`, `0` `blocked`; the corrected `review-required` cohort dropped from `26` rows to `20`, while `8389` resolved through the `clean` path. |
| 2026-03-12 | In Progress | Applied the remaining 20 corrected SEO metadata fixes through `frontmatter-overrides.json`, reran `migrate:map-frontmatter` plus `migrate:rewrite-media`, synchronized the affected staged/promoted content, and extended `src/layouts/sitemap.xml` so `check:seo` includes Hugo paginator routes in `public/sitemap.xml`. Fresh evidence: `check:seo-completeness` now reports `14` warnings, `migrate:report` now reports `322` `ready`, `9` `review-required`, `0` `blocked`, `build:prod` passes, and `check:seo` passes for `215` indexable routes. |
| 2026-03-12 | In Progress | Applied the final 9 clean SEO metadata fixes through `frontmatter-overrides.json`, reran `migrate:map-frontmatter` plus `migrate:rewrite-media`, synchronized the affected staged/promoted content, and refreshed the closeout evidence. Fresh evidence: `check:seo-completeness` now reports `3` warnings, `migrate:report` now reports `331` `ready`, `0` `review-required`, `0` `blocked`, `build:prod` passes, and `check:seo` passes for `215` indexable routes. |
| 2026-03-12 | In Progress | Resolved the final 3 category taxonomy `description_length` warnings by making `map-frontmatter.js` honor `category:${sourceId}` override keys already present in `frontmatter-overrides.json`, regenerated the staged category `_index.md` files, and synchronized those three files into `src/content/categories/`. Fresh evidence: `check:seo-completeness` now reports `0` warnings and `0` failures while `migrate:report`, `build:prod`, and `check:seo` remain green. |
| 2026-03-12 | In Progress | Verified the remaining Batch 3 migration coverage open items. Current evidence confirms all `150` article-like `keep` or `merge` routes (`post` plus `video`) are promoted in `src/content/posts/` with matching `url` front matter, all `17` keep-disposition category routes with organic traffic are backed by taxonomy term bundles and current sitemap entries, and durable curation inputs remain recorded in `migration/input/image-alt-corrections.csv` (`315` rows) plus `migration/input/frontmatter-overrides.json` (`86` keys). A temp-copy replay of the full correction workflow converged at the final-tree level after four passes (`166 -> 48 -> 3 -> 0` net diffs), but the first rerun still changes files, so the zero-change rerun blocker remains open. |

---

### Notes

- Taxonomy (category) pages in Hugo are automatically generated from front matter `categories` fields, but Batch 3 now uses an owner-approved flattening exception for nested long-tail category paths that conflict with the current flat `/category/:slug/` Hugo contract. Keep the manifest and generated term bundles aligned with that approved target set before rerunning the batch.
- Category term URLs are enforced through `[permalinks.term].categories = "/category/:slug/"` in `hugo.toml`; the generated `_index.md` term bundles intentionally rely on that routing contract instead of duplicating per-file `url` front matter.
- Date-based archives (`/2020/`, `/2020/10/`) may or may not exist in WordPress. Check the URL manifest for any date archive URLs with traffic before assuming they should be preserved.
- The exception closure pass is not a rubber stamp. Every deferred item represents a known gap in the migration. The migration owner must explicitly accept each one — undocumented deferrals are equivalent to untracked risks.
- Long-tail remediation must still be reproducible. If a fallback or formatting issue needs a fix that survives reruns, turn it into a scripted rule or curated input update before this ticket is closed.
- Reference: `analysis/plan/details/phase-4.md` §Batch Strategy and Execution Cadence
