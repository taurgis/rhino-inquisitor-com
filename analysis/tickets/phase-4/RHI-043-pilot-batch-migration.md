## RHI-043 · Batch 1 — Pilot Migration Run (20–30 Records)

**Status:** In Progress  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 4  
**Assigned to:** Migration Owner  
**Target date:** 2026-04-22  
**Created:** 2026-03-07  
**Updated:** 2026-03-11

---

### Goal

Execute the first end-to-end pipeline run on a deliberately small, representative set of 20–30 records covering every in-scope content type. The pilot batch proves that the full pipeline functions correctly before committing to larger migration batches. Every generated file must be manually reviewed in this batch — no automated gate replaces human review at the pilot stage.

If the pilot batch reveals pipeline defects, they must be fixed before Batch 2 begins. A failed pilot is a success: it caught problems early. A skipped pilot is a risk multiplier.

---

### Acceptance Criteria

- [ ] Pilot record selection covers at least:
- [x] Pilot record selection covers at least:
  - [x] 1 representative blog post (standard article)
  - [x] 1 long-form article with code blocks and tables
  - [x] 1 article with embedded media (YouTube iframe or image gallery)
  - [x] 1 page (non-post content type)
  - [x] 1 video-related page or post (if applicable)
  - [x] 1 category listing page
  - [x] 1 redirect scenario (alias-backed keep record plus matching manifest merge row)
  - [x] 1 retire disposition route (verify it produces no output)
  - [x] Homepage (`/`)
  - [x] 5 pages from the top-10 traffic list (from Phase 1 SEO baseline)
- [x] Full pipeline executes cleanly on pilot records:
  - [x] `npm run migrate:extract` runs in explicit subset mode (by pilot `sourceId` file and/or postType filter), produces only pilot records, and records the pilot source-channel strategy
  - [x] `npm run migrate:normalize` validates all pilot records against schema
  - [x] `npm run migrate:convert` converts all pilot records with no unresolved fallbacks
  - [x] `npm run migrate:download-media` downloads all referenced media for pilot records
  - [x] `npm run migrate:map-frontmatter` generates front matter for all pilot records
  - [x] `npm run migrate:finalize-content` runs the standard post-mapping sequence for all pilot records:
    - [x] `npm run migrate:rewrite-media` rewrites media references to local paths
    - [x] `npm run migrate:rewrite-links` rewrites internal links for all pilot records
    - [x] `npm run migrate:apply-corrections` applies fenced-code cleanup, mixed image-paragraph normalization, and curated alt-text overrides from `migration/input/image-alt-corrections.csv`
  - [x] A second `npm run migrate:apply-corrections` run is idempotent and reports zero file changes on the corrected pilot content
  - [x] `npm run migrate:report` generates migration item report for pilot batch
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
  - [ ] Optional discovery metadata is reviewed where present: `params.summary`, `params.primaryTopic`, `params.series`, `params.relatedContent`, and `params.featuredHome`
  - [ ] Images render with correct alt text and local paths
  - [ ] Internal links resolve to correct pages
  - [ ] Redirect pages (`merge` records) redirect to correct targets
  - [x] `retire` records produce no Hugo page output
- [ ] Any manual review finding that affects generated Markdown is turned into a durable input or scripted fix before rerun:
  - [ ] Curated image-alt improvements are recorded in `migration/input/image-alt-corrections.csv`
  - [ ] Discovery/SEO metadata changes are recorded in approved pre-mapping curation inputs rather than patched directly into generated `.md` files
  - [ ] Structural Markdown cleanup gaps are fixed in the pipeline scripts, not as one-off edits in `migration/output/content/**`
- [x] All findings from manual review are logged in the Progress Log
- [ ] Pilot batch PR evidence includes the correction outputs used to approve the batch:
  - [ ] `migration/reports/content-corrections-summary.json`
  - [ ] `migration/reports/image-alt-corrections-audit.csv`
  - [ ] Confirmation that the second `npm run migrate:apply-corrections` run reported zero file changes
- [ ] Pilot batch PR is merged to `main` only after all gate failures are resolved and manual review is complete
- [x] Pipeline defects discovered are backlogged as explicit follow-up items before Batch 2 begins

---

### Tasks

- [x] Select pilot records (20–30) covering all content type categories listed in acceptance criteria
- [x] Document selected records in Progress Log (source IDs, slugs, content types)
- [x] Document the pilot source artifacts used and note whether any selected records required SQL, API, or filesystem recovery beyond the base export
- [ ] Create and commit pilot subset selection input (for example `migration/input/pilot-source-ids.txt`)
- [x] Configure pipeline scripts to run in subset mode (by `sourceId` list and/or postType filter)
- [x] Run full pipeline on pilot records:
  - [x] Extract → Normalize → Convert → Download Media → Map Front Matter → Finalize Content
- [ ] Seed and maintain durable correction inputs before final validation:
  - [ ] Create or update `migration/input/image-alt-corrections.csv` for curated image-alt overrides discovered during pilot review
  - [ ] If discovery metadata or custom copy must change, update the approved pre-mapping curation input and rerun `npm run migrate:map-frontmatter` followed by `npm run migrate:finalize-content`
  - [ ] Do not patch `migration/output/content/**` directly for fixes that must survive reruns
- [x] Run report generation: `npm run migrate:report`
- [x] Run all CI gates locally and fix failures:
  - [x] Iterate until all gates pass
  - [x] Document each failure and fix in Progress Log
- [x] Copy approved pilot batch files from `migration/output/content/` to `src/content/`:
  - [x] Post files → `src/content/posts/`
  - [x] Page files → `src/content/pages/`
  - [x] Category files → `src/content/categories/` (not applicable; the selected category listing is taxonomy-generated in the staged build)
- [ ] Open a PR for the pilot batch:
  - [ ] PR description includes: record list, gate results summary, manual review findings, `migration/reports/content-corrections-summary.json`, `migration/reports/image-alt-corrections-audit.csv`, and idempotency confirmation for the second correction pass
  - [ ] All CI gates pass in the PR checks
- [ ] Manually review every generated file in the PR diff
- [ ] Merge pilot batch PR after sign-off from migration owner and engineering owner
- [x] Document all pipeline defects and improvements needed before Batch 2 in a dedicated issue or Progress Log entry
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
| RHI-032 Done — Extraction pipeline complete | Ticket | Resolved |
| RHI-032 selected source-channel strategy documented for pilot execution | Ticket | Resolved |
| RHI-032 subset-mode extraction support is available and documented | Ticket | Resolved |
| RHI-033 Done — Normalization complete | Ticket | Resolved |
| RHI-034 Done — HTML-to-MD conversion engine complete | Ticket | Resolved |
| RHI-035 Done — Front matter mapping complete | Ticket | Resolved |
| RHI-036 Done — URL parity and redirect validation complete | Ticket | Resolved |
| RHI-037 Done — Media download and rewrite pipeline complete | Ticket | Resolved |
| RHI-038 Done — Internal link rewrite complete | Ticket | Resolved |
| RHI-039 Done — SEO completeness check available | Ticket | Resolved |
| RHI-040 Done — Accessibility content check available | Ticket | Resolved |
| RHI-041 Done — Security content scan available | Ticket | Resolved |
| RHI-042 Done — Reporting framework and threshold checks available | Ticket | Resolved |
| Phase 1 SEO baseline available for traffic-priority selection | Ticket | Resolved |

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
- `migration/reports/content-corrections-summary.json`
- `migration/reports/image-alt-corrections-audit.csv`
- Manual review findings log in Progress Log
- Pipeline defect backlog before Batch 2

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-11 | In Progress | Added `npm run migrate:pilot-candidates` and the pilot-selection report artifacts to map Phase 1 traffic, alias-backed redirect coverage, and representative content-shape signals before locking the pilot source-id list. |
| 2026-03-11 | In Progress | Candidate analysis confirmed that the current normalized corpus has no source-backed `merge` records and no source-backed `postType=video` records; owner approved using the 90-day traffic list, counting homepage separately, treating `/video/` as the video-related item, validating redirects with the alias-backed keep record `/delta-exports-in-salesforce-b2c-commerce-cloud/` plus its matching manifest merge URL, and keeping the pilot accessibility cap at 25 warnings. |
| 2026-03-11 | In Progress | Locked `migration/input/pilot-source-ids.txt` with 20 pilot IDs: `73 / (page)`, `1077 /video/ (page)`, `category:12 /category/salesforce-commerce-cloud/ (category)`, `2 /sample-page/ (retire page)`, `3089 /delta-exports-in-salesforce-b2c-commerce-cloud/ (post alias redirect)`, `68 /about/ (page)`, `12435 /swc-and-storybook-error-failed-to-load-native-binding/ (page)`, `2265 /how-to-use-ocapi-scapi-hooks/ (post)`, `11658 /in-the-ring-ocapi-versus-scapi/ (post)`, `10642 /mastering-chunk-oriented-job-steps-in-salesforce-b2c-commerce-cloud/ (post)`, `8698 /a-beginners-guide-to-webdav-in-sfcc/ (post)`, `1389 /sitegenesis-vs-sfra-vs-pwa/ (post)`, `2770 /creating-custom-ocapi-endpoints/ (post)`, `7979 /understanding-sfcc-instances/ (post)`, `528 /how-to-get-a-salesforce-b2c-commerce-cloud-sandbox/ (post)`, `2942 /salesforce-b2c-commerce-cloud-22-8/ (long-form post)`, `12231 /caching-in-the-sfcc-composable-storefront/ (post)`, `14004 /a-survival-guide-to-sfcc-platform-limits/ (post)`, `4455 /20-years-of-dreamforce/ (post)`, and `9316 /a-deep-dive-into-the-23-7-sfcc-release/ (post)`. |
| 2026-03-11 | In Progress | Documented pilot source artifacts from `migration/intermediate/extract-summary.json`: WXR export `tmp/therhinoinquisitor.WordPress.2026-03-10.xml`, filesystem snapshot `tmp/website-wordpress-backup/wp-content`, and SQL dump `tmp/wordpress-database.sql`; the selected pilot records used WXR as the authoritative source, 16 records gained filesystem verification for media/upload references, and no selected record required SQL-only recovery or API supplementation. |
| 2026-03-11 | In Progress | Fixed subset-mode blockers discovered during pilot execution: extraction inventory reconciliation now honors selected records, normalization coverage summaries now reflect subset scope, URL parity and redirect validation can run in `selected-records` scope against the staged pilot build, and `check:links` now supports manifest-backed unresolved non-pilot targets for isolated pilot validation. |
| 2026-03-11 | In Progress | Executed the locked pilot pipeline successfully: extract subset (20 records), normalize (20 records, 0 errors), convert (0 unresolved fallback rows), download media, map front matter, finalize content, second correction pass with `filesChanged: 0`, report generation (`20` rows, `4` ready, `16` review-required, `0` blocked), and migration thresholds pass. |
| 2026-03-11 | In Progress | Staged pilot validation passed locally against `tmp/rhi043-public`: Hugo production build, front matter validation, selected-records URL parity, selected-records redirect validation, SEO completeness, feed compatibility, media integrity, manifest-backed subset link validation, a11y content, security content, and noindex. |
| 2026-03-11 | In Progress | Copied the 18 generated pilot Markdown files from `migration/output/content/{posts,pages}/` into `src/content/{posts,pages}/` for the pilot batch payload. Manual PR review, PR creation, and merge/sign-off remain open before the ticket can move to `Done`. |
| 2026-03-11 | In Progress | Completed a local manual review pass on the 18 copied pilot Markdown files (`14` posts, `4` pages). Result: `11` files passed without blocking findings and `7` files need follow-up before pilot approval. Verified `/sample-page/` produces no output in `tmp/rhi043-public`, and confirmed the Delta Exports canonical path plus alias-backed pilot route both resolve in the local preview. |
| 2026-03-11 | In Progress | Manual review findings that need durable follow-up before pilot approval: `src/content/pages/about.md` contains visible placeholder and gibberish legacy source copy; `src/content/pages/home.md` contains a malformed adjacent-link block in the copied page payload and a clipped description; `src/content/posts/a-beginners-guide-to-webdav-in-sfcc.md` splits the word `Cloud` around an inline internal link; `src/content/posts/caching-in-the-sfcc-composable-storefront.md`, `src/content/posts/how-to-use-ocapi-scapi-hooks.md`, and `src/content/posts/understanding-sfcc-instances.md` contain collapsed label/callout text that should be reconstructed by the pipeline; `src/content/posts/sitegenesis-vs-sfra-vs-pwa.md` and `src/content/posts/understanding-sfcc-instances.md` have malformed generated descriptions. These findings are now the primary Batch 2-prep backlog items in addition to the still-open PR/sign-off steps. |
| 2026-03-11 | In Progress | Implemented a script-driven remediation pass using `scripts/migration/map-frontmatter.js` and `scripts/migration/apply-content-corrections.js`, then reran `npm run migrate:map-frontmatter`, `npm run migrate:finalize-content`, a second idempotency check with `npm run migrate:apply-corrections`, the staged pilot build, and the local pilot validation gates. Resolved the script-fixable findings in `home.md`, `a-beginners-guide-to-webdav-in-sfcc.md`, `caching-in-the-sfcc-composable-storefront.md`, `how-to-use-ocapi-scapi-hooks.md`, `sitegenesis-vs-sfra-vs-pwa.md`, and `understanding-sfcc-instances.md`; the remaining open pilot issue is `src/content/pages/about.md`, which still reflects placeholder legacy source copy rather than a pipeline defect. |
| 2026-03-11 | In Progress | Traced the About-page defect to sourceId `68` in the WXR-derived record and, per owner decision, replaced the legacy placeholder copy through a durable correction input instead of patching generated output. Added `migration/input/body-overrides.json` and `migration/input/body-overrides/about.md`, extended `scripts/migration/apply-content-corrections.js` to apply page-level body/description overrides during the correction pass, reran the correction pass to an idempotent `filesChanged: 0`, refreshed `src/content/pages/about.md`, rebuilt `tmp/rhi043-final-public`, refreshed `migration/reports/migration-item-report.csv`, and completed a focused browser review on `/about/`, `/`, `/a-beginners-guide-to-webdav-in-sfcc/`, `/how-to-use-ocapi-scapi-hooks/`, `/caching-in-the-sfcc-composable-storefront/`, `/sitegenesis-vs-sfra-vs-pwa/`, `/understanding-sfcc-instances/`, the canonical Delta Exports route, and the retired `/sample-page/` route. Result: all 18 copied pilot Markdown files now pass local manual review; only PR creation, PR checks, and formal sign-off remain open. |

#### Manual review matrix (current after scripted rerun on 2026-03-11)

| File | Status | Notes |
|------|--------|-------|
| `src/content/pages/about.md` | Pass | The placeholder source copy was replaced through the durable override input (`migration/input/body-overrides.json` + `migration/input/body-overrides/about.md`); refreshed Markdown and staged HTML now render cleanly with correct local media paths and updated description text. |
| `src/content/pages/home.md` | Pass | Description now uses the source meta description and the project links/images are split into separate Markdown blocks by the correction pass; current site homepage template still does not render this body directly. |
| `src/content/pages/swc-and-storybook-error-failed-to-load-native-binding.md` | Pass | Front matter and body render cleanly; no blocking issues found in the copied page payload. |
| `src/content/pages/video.md` | Pass | Front matter, media paths, and list structure reviewed cleanly; no blocking issues found. |
| `src/content/posts/20-years-of-dreamforce.md` | Pass | Front matter, images, headings, and internal/external links reviewed cleanly. |
| `src/content/posts/a-beginners-guide-to-webdav-in-sfcc.md` | Pass | The opening inline internal link no longer splits the word `Cloud`; fenced-code cleanup and render-level spot checks passed after the scripted rerun. |
| `src/content/posts/a-deep-dive-into-the-23-7-sfcc-release.md` | Pass | Front matter, media, and body structure reviewed cleanly. |
| `src/content/posts/a-survival-guide-to-sfcc-platform-limits.md` | Pass | Long-form body, headings, and media reviewed cleanly; no blocking issues found. |
| `src/content/posts/caching-in-the-sfcc-composable-storefront.md` | Pass | Flattened caching labels are now reconstructed into rendered callouts by the correction pass and the staged HTML spot check confirmed `article-callout` output. |
| `src/content/posts/creating-custom-ocapi-endpoints.md` | Pass | Deprecated warning renders acceptably and body structure reviewed cleanly. |
| `src/content/posts/delta-exports-in-salesforce-b2c-commerce-cloud.md` | Pass | Front matter and article body reviewed cleanly; canonical local preview route renders and the alias-backed pilot route resolves in local preview. |
| `src/content/posts/how-to-get-a-salesforce-b2c-commerce-cloud-sandbox.md` | Pass | Front matter, links, and media reviewed cleanly. |
| `src/content/posts/how-to-use-ocapi-scapi-hooks.md` | Pass | Leading `Info` update text is now reconstructed into a note callout and the description now uses the source meta description instead of the flattened banner text. |
| `src/content/posts/in-the-ring-ocapi-versus-scapi.md` | Pass | Front matter, images, and article structure reviewed cleanly. |
| `src/content/posts/mastering-chunk-oriented-job-steps-in-salesforce-b2c-commerce-cloud.md` | Pass | Code fences, headings, and front matter reviewed cleanly. |
| `src/content/posts/salesforce-b2c-commerce-cloud-22-8.md` | Pass | Long-form release-notes body, images, and links reviewed cleanly. |
| `src/content/posts/sitegenesis-vs-sfra-vs-pwa.md` | Pass | Generated description now preserves the leading linked subject text and reads cleanly in front matter and staged HTML metadata. |
| `src/content/posts/understanding-sfcc-instances.md` | Pass | Generated description now preserves linked subject text, and the `Deprecation`, `Deletion`, and `Caching` inline labels are reconstructed into callouts by the correction pass. |

Manual review note: `migration/reports/migration-item-report.csv` still shows `review-required` rows under the current RHI-042 rollup contract when rows carry applied correction evidence or warning-level SEO findings. That report state does not indicate unresolved blockers in the pilot subset after the focused final review recorded above.

---

### Notes

- The pilot batch is the only batch where every single generated file must be manually reviewed. Batches 2 and 3 rely on the pilot having proven the pipeline trustworthy. Do not skip or rush the manual review.
- If the pilot needs SQL, API, or filesystem supplementation to recover representative fields, capture that explicitly in the pilot evidence. Batch 2 should not rediscover a hidden source dependency.
- Include at least one record with `merge` disposition to verify the redirect alias generates correctly in the pilot. Finding a redirect error in Batch 1 is far better than finding it in Batch 3.
- CI gate failures during the pilot are expected and acceptable — that is the point. What is not acceptable is merging the pilot batch with unresolved gate failures or unreviewed files.
- Manual review is still mandatory in the pilot, but durable fixes must land in scripts or curated input files. If a reviewer changes generated Markdown directly and the change must survive reruns, the ticket is not complete until that change is encoded in the pipeline or in an approved upstream curation input.
- Reference: `analysis/plan/details/phase-4.md` §Batch Strategy and Execution Cadence
