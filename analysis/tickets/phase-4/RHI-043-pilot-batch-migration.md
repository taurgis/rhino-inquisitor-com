## RHI-043 · Batch 1 — Pilot Migration Run (20–30 Records)

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 4  
**Assigned to:** Migration Owner  
**Target date:** 2026-04-22  
**Created:** 2026-03-07  
**Updated:** 2026-03-10

---

### Goal

Execute the first end-to-end pipeline run on a deliberately small, representative set of 20–30 records covering every in-scope content type. The pilot batch proves that the full pipeline functions correctly before committing to larger migration batches. Every generated file must be manually reviewed in this batch — no automated gate replaces human review at the pilot stage.

If the pilot batch reveals pipeline defects, they must be fixed before Batch 2 begins. A failed pilot is a success: it caught problems early. A skipped pilot is a risk multiplier.

---

### Acceptance Criteria

- [ ] Pilot record selection covers at least:
  - [ ] 1 representative blog post (standard article)
  - [ ] 1 long-form article with code blocks and tables
  - [ ] 1 article with embedded media (YouTube iframe or image gallery)
  - [ ] 1 page (non-post content type)
  - [ ] 1 video-related post (if applicable)
  - [ ] 1 category listing page
  - [ ] 1 post with `merge` disposition (redirect scenario)
  - [ ] 1 post with `retire` disposition (verify it produces no output)
  - [ ] Homepage (`/`)
  - [ ] 5 pages from the top-10 traffic list (from Phase 1 SEO baseline)
- [ ] Full pipeline executes cleanly on pilot records:
  - [ ] `npm run migrate:extract` runs in explicit subset mode (by pilot `sourceId` file and/or postType filter), produces only pilot records, and records the pilot source-channel strategy
  - [ ] `npm run migrate:normalize` validates all pilot records against schema
  - [ ] `npm run migrate:convert` converts all pilot records with no unresolved fallbacks
  - [ ] `npm run migrate:download-media` downloads all referenced media for pilot records
  - [ ] `npm run migrate:rewrite-media` rewrites media references to local paths
  - [ ] `npm run migrate:map-frontmatter` generates front matter for all pilot records
  - [ ] `npm run migrate:rewrite-links` rewrites internal links for all pilot records
  - [ ] `npm run migrate:report` generates migration item report for pilot batch
- [ ] All CI gates pass on the pilot batch PR:
  - [ ] `hugo --minify --environment production` exits with code 0
  - [ ] `npm run validate:frontmatter` exits with code 0
  - [ ] `npm run check:url-parity` exits with code 0
  - [ ] `npm run check:redirects` exits with code 0
  - [ ] `npm run check:seo-completeness` exits with code 0
  - [ ] `npm run check:noindex` exits with code 0
  - [ ] `npm run check:feed-compatibility` exits with code 0
  - [ ] `npm run check:media` exits with code 0
  - [ ] `npm run check:links` exits with code 0
  - [ ] `npm run check:a11y-content` exits with code 0 or agreed cap
  - [ ] `npm run check:security-content` exits with code 0
  - [ ] `npm run check:migration-thresholds` exits with code 0
- [ ] Every generated content file is manually reviewed:
  - [ ] Body content renders correctly in `hugo server`
  - [ ] Front matter fields are correct and complete
  - [ ] Images render with correct alt text and local paths
  - [ ] Internal links resolve to correct pages
  - [ ] Redirect pages (`merge` records) redirect to correct targets
  - [ ] `retire` records produce no Hugo page output
- [ ] All findings from manual review are logged in the Progress Log
- [ ] Pilot batch PR is merged to `main` only after all gate failures are resolved and manual review is complete
- [ ] Pipeline defects discovered are backlogged as explicit follow-up items before Batch 2 begins

---

### Tasks

- [ ] Select pilot records (20–30) covering all content type categories listed in acceptance criteria
- [ ] Document selected records in Progress Log (source IDs, slugs, content types)
- [ ] Document the pilot source artifacts used and note whether any selected records required SQL, API, or filesystem recovery beyond the base export
- [ ] Create and commit pilot subset selection input (for example `migration/input/pilot-source-ids.txt`)
- [ ] Configure pipeline scripts to run in subset mode (by `sourceId` list and/or postType filter)
- [ ] Run full pipeline on pilot records:
  - [ ] Extract → Normalize → Convert → Download Media → Rewrite Media → Map Front Matter → Rewrite Links
- [ ] Run report generation: `npm run migrate:report`
- [ ] Run all CI gates locally and fix failures:
  - [ ] Iterate until all gates pass
  - [ ] Document each failure and fix in Progress Log
- [ ] Copy approved pilot batch files from `migration/output/content/` to `src/content/`:
  - [ ] Post files → `src/content/posts/`
  - [ ] Page files → `src/content/pages/`
  - [ ] Category files → `src/content/categories/` (if applicable)
- [ ] Open a PR for the pilot batch:
  - [ ] PR description includes: record list, gate results summary, manual review findings
  - [ ] All CI gates pass in the PR checks
- [ ] Manually review every generated file in the PR diff
- [ ] Merge pilot batch PR after sign-off from migration owner and engineering owner
- [ ] Document all pipeline defects and improvements needed before Batch 2 in a dedicated issue or Progress Log entry
- [ ] Confirm Batch 2 readiness: all defects resolved or explicitly accepted with owner

---

### Out of Scope

- Migrating all posts or any category not explicitly selected for the pilot
- Final SEO optimization of descriptions (high-value batch scope)
- Custom description authoring for top-traffic pages (Batch 2 scope — RHI-044)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-032 Done — Extraction pipeline complete | Ticket | Pending |
| RHI-032 selected source-channel strategy documented for pilot execution | Ticket | Pending |
| RHI-032 subset-mode extraction support is available and documented | Ticket | Pending |
| RHI-033 Done — Normalization complete | Ticket | Pending |
| RHI-034 Done — HTML-to-MD conversion engine complete | Ticket | Pending |
| RHI-035 Done — Front matter mapping complete | Ticket | Pending |
| RHI-036 Done — URL parity and redirect validation complete | Ticket | Pending |
| RHI-037 Done — Media download and rewrite pipeline complete | Ticket | Pending |
| RHI-038 Done — Internal link rewrite complete | Ticket | Pending |
| RHI-039 Done — SEO completeness check available | Ticket | Pending |
| RHI-040 Done — Accessibility content check available | Ticket | Pending |
| RHI-041 Done — Security content scan available | Ticket | Pending |
| RHI-042 Done — Reporting framework and threshold checks available | Ticket | Pending |
| Phase 1 SEO baseline available for traffic-priority selection | Ticket | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Pipeline defects cause majority of pilot records to fail gates | Medium | High | This is the expected discovery function of the pilot; treat failures as findings, fix pipeline scripts, re-run | Migration Owner |
| Manual review scope creep (more than 30 records selected for pilot) | Medium | Medium | Hard cap at 30 records; any additional candidates go into Batch 2 | Migration Owner |
| Hugo build time increases significantly with even 30 records | Low | Low | Monitor build time; if >5 minutes, investigate and optimize before Batch 2 adds more records | Engineering Owner |
| Pilot content includes a page with complex edge-case formatting that blocks the batch | Medium | Medium | If a single record blocks a gate, quarantine it with an owner and proceed with the remaining pilot records | Engineering Owner |

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

- Pilot batch `.md` files committed to `src/content/`
- CI gate run results (links to passing GitHub Actions runs)
- Migration item report for pilot batch
- Manual review findings log in Progress Log
- Pipeline defect backlog before Batch 2

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- The pilot batch is the only batch where every single generated file must be manually reviewed. Batches 2 and 3 rely on the pilot having proven the pipeline trustworthy. Do not skip or rush the manual review.
- If the pilot needs SQL, API, or filesystem supplementation to recover representative fields, capture that explicitly in the pilot evidence. Batch 2 should not rediscover a hidden source dependency.
- Include at least one record with `merge` disposition to verify the redirect alias generates correctly in the pilot. Finding a redirect error in Batch 1 is far better than finding it in Batch 3.
- CI gate failures during the pilot are expected and acceptable — that is the point. What is not acceptable is merging the pilot batch with unresolved gate failures or unreviewed files.
- Reference: `analysis/plan/details/phase-4.md` §Batch Strategy and Execution Cadence
