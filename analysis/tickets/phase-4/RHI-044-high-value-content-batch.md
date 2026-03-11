## RHI-044 · Batch 2 — High-Value Content Migration

**Status:** Open  
**Priority:** Critical  
**Estimate:** L  
**Phase:** 4  
**Assigned to:** Migration Owner  
**Target date:** 2026-04-25  
**Created:** 2026-03-07  
**Updated:** 2026-03-11

---

### Goal

Migrate the 30–50 highest-value pages — identified by organic traffic, backlink count, and editorial significance from the Phase 1 SEO baseline — through the proven pilot-validated pipeline. This batch must receive a higher degree of manual review than subsequent batches because these pages carry the greatest SEO equity and will have the largest impact on organic visibility post-launch.

Errors in this batch directly damage the migration's primary success criterion: preserving search rankings for the site's most valuable content.

---

### Acceptance Criteria

- [ ] High-value record selection is completed and documented:
  - [ ] Selection is based on Phase 1 SEO baseline (RHI-005): top 10 organic traffic pages, top 10 backlink pages, top 5 category pages (by traffic), 3 video-related pages, 5 long-tail pages with known external links
  - [ ] Total batch size: 30–50 records (adjust based on pilot findings)
  - [ ] Any records from the pilot batch are excluded (already migrated)
  - [ ] Record selection is reviewed and approved by SEO owner before pipeline run
- [ ] All pipeline defects discovered in the pilot batch are resolved before this batch begins
- [ ] Full pipeline executes cleanly on high-value records using the same standard sequence proven in Batch 1:
  - [ ] `npm run migrate:map-frontmatter`
  - [ ] `npm run migrate:finalize-content` (or the explicit `rewrite-media -> rewrite-links -> apply-corrections` sequence)
  - [ ] `npm run migrate:report`
- [ ] All CI gates pass on the high-value batch PR (same gate set as Batch 1)
- [ ] SEO-specific review is performed on top-10 traffic pages:
  - [ ] Each of the 10 highest-traffic pages is spot-checked:
    - [ ] `title` is accurate, compelling, and under 60 characters
    - [ ] `description` is meaningful and SEO-quality (not just a body text excerpt)
    - [ ] `url` matches manifest `targetUrl` for the page
    - [ ] Disposition behavior is respected: `keep` preserves legacy path, `merge` validates redirect behavior from legacy URL to `targetUrl`
    - [ ] Body content renders correctly and is complete
    - [ ] Hero image renders with alt text and correct dimensions
    - [ ] Internal links are rewritten to canonical paths
    - [ ] JSON-LD structured data renders correctly (verify via `<script type="application/ld+json">` in built HTML)
  - [ ] SEO spot-check findings are documented in Progress Log
- [ ] All `merge`-disposition pages in this batch have correctly generated redirect alias pages
- [ ] Custom SEO descriptions are authored for top-10 traffic pages if auto-generated descriptions are inadequate:
  - [ ] Descriptions are human-authored, 120–155 characters, and accurately describe page intent
  - [ ] The curated description source is updated through an approved pre-mapping input (for example `migration/input/discovery-metadata.json`), not by patching generated Markdown directly
  - [ ] After description updates, `npm run migrate:map-frontmatter` and `npm run migrate:finalize-content` are rerun before `check:seo-completeness`
- [ ] Curated image-alt improvements found during high-value review are recorded in `migration/input/image-alt-corrections.csv` and re-applied through `npm run migrate:finalize-content`, not as one-off edits in `migration/output/content/**`
- [ ] High-value batch PR evidence includes the correction outputs used to approve the batch:
  - [ ] `migration/reports/content-corrections-summary.json`
  - [ ] `migration/reports/image-alt-corrections-audit.csv`
  - [ ] Confirmation that the correction rerun for the finalized batch reported zero file changes
- [ ] High-value batch PR is merged to `main` only after SEO owner approval and all CI gates pass

---

### Tasks

- [ ] Export top-traffic and top-backlink data from Phase 1 SEO baseline:
  - [ ] Extract top-10 organic traffic URLs from `migration/phase-1-seo-baseline.md`
  - [ ] Extract top-10 backlink URLs
  - [ ] Extract top category pages by traffic
  - [ ] Build candidate list; remove pilot batch records
- [ ] Review candidate list with SEO owner; confirm final selection (30–50 records)
- [ ] Confirm all pilot batch pipeline defects are resolved (review RHI-043 Progress Log)
- [ ] Run full pipeline on high-value record set (same sequence as RHI-043, including `npm run migrate:finalize-content` after `npm run migrate:map-frontmatter`)
- [ ] Run all CI gates and fix any failures
- [ ] Perform SEO spot-check on top-10 traffic pages:
  - [ ] Review generated `.md` files in `hugo server`
  - [ ] Review built HTML for canonical tag, OG tags, JSON-LD
  - [ ] Verify each sampled URL/disposition against manifest `targetUrl` and redirect behavior
  - [ ] Author custom descriptions where auto-generated is inadequate
  - [ ] Record custom descriptions in the approved pre-mapping curation input and rerun `npm run migrate:map-frontmatter` plus `npm run migrate:finalize-content`
  - [ ] Record curated image-alt overrides in `migration/input/image-alt-corrections.csv` and rerun `npm run migrate:finalize-content`
  - [ ] Re-run `check:seo-completeness` after the regenerated content reflects those curated updates
- [ ] Update migration item report for this batch
- [ ] Open high-value batch PR:
  - [ ] PR description includes: record list, SEO spot-check summary, gate results, `migration/reports/content-corrections-summary.json`, `migration/reports/image-alt-corrections-audit.csv`, and correction-rerun idempotency confirmation
  - [ ] SEO owner reviews and approves PR before merge
  - [ ] All CI gates pass
- [ ] Merge high-value batch PR
- [ ] Record batch metrics in Progress Log: total records, gate failures, SEO issues, custom descriptions authored

---

### Out of Scope

- Migrating long-tail posts or category archives (Batch 3 — RHI-045)
- Advanced SEO optimization experiments (Phase 5 scope)
- Changing any URL or redirect decision without following migration data governance gate

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-043 Done — Pilot batch completed; pipeline proven | Ticket | Pending |
| All pilot batch pipeline defects resolved | Ticket | Pending |
| Phase 1 SEO baseline (RHI-005) available for traffic-priority selection | Ticket | Pending |
| SEO owner available for record selection approval and PR review | Access | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Pilot pipeline defects not fully resolved, causing gate failures in Batch 2 | Medium | High | Batch 2 must not start until all pilot defects are either resolved or explicitly accepted with owner; hard dependency | Migration Owner |
| Auto-generated descriptions are inadequate for top-traffic pages | High | Medium | Plan time for description authoring during this batch; the SEO spot-check will surface which pages need it | SEO Owner |
| Top-traffic pages have complex content (long-form, heavy media) that exposes conversion gaps | Medium | Medium | Include at least 2 long-form high-traffic pages in the pilot batch to surface this early | Engineering Owner |
| SEO owner unavailable for PR review | Low | High | Identify backup approver before batch begins; do not merge without SEO review | Migration Owner |

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

- High-value batch `.md` files committed to `src/content/`
- SEO spot-check findings documented in Progress Log
- Migration item report updated for Batch 2
- `migration/reports/content-corrections-summary.json`
- `migration/reports/image-alt-corrections-audit.csv`
- List of custom descriptions authored

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- This batch contains the pages that matter most for SEO equity. If any gate failure is found in this batch that was not caught in the pilot, it must be treated as a pipeline gap, not a content anomaly — fix the pipeline, re-run the entire batch.
- Custom description authoring is the one task in this batch that cannot be automated. Budget time for it explicitly. A 10-minute description investment on a top-traffic page pays dividends in click-through rate for months.
- Even when the review is manual, durable changes must flow through curated inputs and reruns. Do not treat `migration/output/content/**` as the long-term source of truth for custom descriptions or image-alt fixes.
- The SEO spot-check structured data check (JSON-LD in rendered HTML) must be done on the built HTML, not on the Markdown source. Build with `hugo server` and inspect the actual rendered `<script type="application/ld+json">` block.
- Reference: `analysis/plan/details/phase-4.md` §Batch Strategy and Execution Cadence
