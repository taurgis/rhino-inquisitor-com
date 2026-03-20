## RHI-084 · Workstream A — Release Candidate Freeze and Validation Dataset

**Status:** Done  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 8  
**Assigned to:** Migration Owner  
**Target date:** 2026-06-04  
**Created:** 2026-03-08  
**Updated:** 2026-03-20

---

### Goal

Lock the release candidate inputs so that all Phase 8 validation results are meaningful, repeatable, and traceable to a single immutable build state. Define the representative page sample matrix and priority route set that every downstream workstream (WS-B through WS-H) will use as the validation target. Without a frozen RC and a defined sample matrix, validation results are not comparable between workstreams and the go/no-go decision lacks an auditable evidence baseline.

---

### Acceptance Criteria

- [x] Release candidate is frozen and immutably identified:
  - [x] Git tag `phase-8-rc-v1` exists on the RC commit (set in RHI-083 bootstrap)
  - [x] RC commit SHA is recorded in `migration/phase-8-rc-record.md`
  - [x] Content, URL mapping, and configuration changes are locked: no merges to the RC branch without an explicit unfreeze and re-tag protocol
  - [x] The frozen URL manifest path is confirmed: `migration/url-manifest.json` (Phase 6 frozen state, git tag `phase-6-redirect-map-v1`)
- [x] Expected URL outcomes dataset is derived from the frozen manifest:
  - [x] `keep` URLs: the generated Hugo page at the exact legacy path returns HTTP 200
  - [x] `merge` (redirect) URLs: the legacy path resolves with a 301 to the target URL in one hop
  - [x] `retire` URLs: the legacy path returns 404 (or 410 where supported)
  - [x] Dataset is committed as `validation/expected-url-outcomes.json`
- [x] Representative page sample matrix is defined and committed to `validation/sample-matrix.json`:
  - [x] Homepage (`/`)
  - [x] 10 most-recent published post URLs by front matter `date` descending (or all posts if fewer than 10)
  - [x] Archive page(s) URL(s)
  - [x] First 5 alphabetical category slugs with live pages (or all categories if fewer than 5)
  - [x] Privacy/legal page URL(s)
  - [x] Video template URL(s) if retained in scope
  - [x] Landing page template URL(s) if retained in scope
  - [x] Every template family present in the Hugo build is represented by one or more URLs, with selection method recorded in `validation/README.md`
- [x] Priority route set is defined and committed to `validation/priority-routes.json`:
  - [x] Top 20 organic-traffic URLs (from Search Console data in `migration/phase-1-seo-baseline.md`)
  - [x] Top 20 backlink URLs (from baseline external link report)
  - [x] Explicitly covers all URL classes: `post`, `page`, `category`, `video`, `landing`, `system`
  - [x] Priority routes are annotated with expected outcome (`keep`, `redirect`, `retire`)
  - [x] Selection and ranking method is documented (source metric, sort order, tie-breaker)
- [x] RC toolchain versions are frozen in `migration/phase-8-rc-record.md`:
  - [x] `hugo version` output recorded
  - [x] `@lhci/cli` version recorded
  - [x] `@axe-core/playwright` version recorded
  - [x] `html-validate` version recorded
  - [x] `lighthouserc.json` checksum or commit reference recorded
- [x] Hugo production build of the RC commit succeeds with zero errors:
  - [x] `hugo --gc --minify --environment production` exits 0 on the RC commit
  - [x] Build output is confirmed at `./public` with a top-level `index.html`
  - [x] Build output size is within GitHub Pages limits (< 1 GB)
  - [x] Build and publish timings are documented; if end-to-end Pages publication exceeds platform timeout expectations, launch is blocked until resolved
- [x] Validation dataset schema is documented in `validation/README.md`:
  - [x] Schema for `expected-url-outcomes.json`
  - [x] Schema for `sample-matrix.json`
  - [x] Schema for `priority-routes.json`
  - [x] Instructions for downstream workstreams on how to consume these files

---

### Tasks

- [x] Confirm `phase-8-rc-v1` tag is set from RHI-083; if not, set it now on the agreed RC commit
- [x] Create `migration/phase-8-rc-record.md`:
  - [x] RC commit SHA
  - [x] Date and time of freeze
  - [x] Name of person who froze it
  - [x] Hugo version used for the RC build
  - [x] Lighthouse, axe-core, and html-validate versions used for RC validation
  - [x] `lighthouserc.json` checksum or commit reference
  - [x] Link to the Actions run that validated the Phase 7 gates
- [x] Derive expected URL outcomes dataset from `migration/url-manifest.json`:
  - [x] Iterate all manifest entries
  - [x] Map `disposition: keep` → expected HTTP 200 at `target_url`
  - [x] Map `disposition: merge` → expected HTTP 301 redirect from `legacy_url` to `target_url` in one hop
  - [x] Map `disposition: retire` → expected HTTP 404 at `legacy_url`
  - [x] Commit as `validation/expected-url-outcomes.json`
- [x] Run Hugo production build on RC commit:
  - [x] `hugo --gc --minify --environment production`
  - [x] Record exit code, duration, and output size
  - [x] Verify `public/index.html` exists
  - [x] Run `npm run validate:artifact` to confirm no symlinks or structure violations
- [x] Define representative page sample matrix:
  - [x] Extract homepage URL
  - [x] Select 10 most-recent posts by front matter `date` descending (or all posts if fewer than 10)
  - [x] Identify archive page URL(s) from the Hugo output
  - [x] Select first 5 alphabetical category slugs with live pages (or all categories if fewer than 5)
  - [x] Confirm privacy/legal URL(s)
  - [x] Identify any video or landing templates and include at least one URL of each
  - [x] Commit as `validation/sample-matrix.json`
- [x] Define priority route set:
  - [x] Cross-reference Search Console data from `migration/phase-1-seo-baseline.md` for top 20 organic URLs
  - [x] Cross-reference external link data from SEO baseline for top 20 backlink URLs
  - [x] Document ranking method and tie-breaker in `validation/README.md`
  - [x] Annotate each URL with URL class and expected outcome
  - [x] Commit as `validation/priority-routes.json`
- [x] Draft `validation/README.md` with dataset schema and consumption instructions
- [x] Communicate RC freeze to all WS-B through WS-H owners with:
  - [x] RC commit SHA and `phase-8-rc-v1` tag reference
  - [x] Link to `validation/expected-url-outcomes.json`
  - [x] Link to `validation/sample-matrix.json`
  - [x] Link to `validation/priority-routes.json`

---

### Out of Scope

- Changing content, URL mappings, or site configuration (the RC is frozen; changes require an explicit re-cut protocol)
- Running the validation gate checks (covered by WS-B through WS-H)
- Go/no-go decision (covered by WS-H)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-083 Done — Phase 8 Bootstrap complete and `phase-8-rc-v1` tag set | Ticket | Done |
| `migration/url-manifest.json` frozen at `phase-6-redirect-map-v1` tag | Phase | Done |
| `migration/phase-1-seo-baseline.md` available for top-traffic URL selection | Phase | Done |
| Hugo production build of RC exits 0 | Build | Done |
| `npm run validate:artifact` passes on RC build output | Phase | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| RC build fails, blocking validation dataset creation | Medium | High | Fix build failures before declaring RC frozen; no workstream validation is meaningful against a broken build | Engineering Owner |
| URL manifest has undecided or missing dispositions, making expected-outcomes dataset incomplete | Low | High | Validate manifest completeness at bootstrap (RHI-083); escalate to Phase 6 owners for any missing disposition before RC freeze | Migration Owner |
| Sample matrix misses a live template family, masking class-wide defects | Medium | High | Cross-reference Hugo output with template type list; use `hugo list all` and inspect output structure to ensure all template types are represented | Engineering Owner |
| RC is re-cut mid-Phase-8 due to a found defect, invalidating prior validation runs | Medium | Medium | Define the re-cut protocol upfront: re-tag as `phase-8-rc-v2`, notify all workstream owners, and re-run all gates against the new RC | Migration Owner |
| Build output size approaches GitHub Pages 1 GB limit | Low | High | Check output size at each RC build; surface early if within 20% of the limit to allow asset optimization before launch | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-084 closed on 2026-03-20. The RC freeze now points at the bootstrap-selected tag `phase-8-rc-v1` on commit `a510ead8`, the frozen Phase 6 manifest is recorded as the dataset source, the RC build evidence is captured in `migration/phase-8-rc-record.md`, and the three validation datasets are committed with a reproducible generator script for future re-cuts.

**Delivered artefacts:**

- `migration/phase-8-rc-record.md` — RC commit SHA, freeze metadata, build evidence
- `validation/expected-url-outcomes.json` — full expected outcome dataset from frozen manifest
- `validation/sample-matrix.json` — representative page matrix covering all template families
- `validation/priority-routes.json` — annotated priority route set from organic/backlink data
- `validation/README.md` — schema documentation and consumption instructions for downstream workstreams
- `validation/runs/phase-8-rc-v1.json` — machine-readable RC snapshot with build metrics and dataset checksums
- `scripts/phase-8/generate-validation-datasets.js` — reproducible RHI-084 dataset generator
- `analysis/documentation/phase-8/rhi-084-rc-freeze-validation-datasets-2026-03-20.md` — Phase 8 documentation update for the dataset contract

**Deviations from plan:**

- `validation/expected-url-outcomes.json` now separates canonical migration intent from build-validation mode so the owner-approved Phase 6 Model A query-string exception scope remains explicit instead of being silently treated as missing Pages artifacts.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | Open | Ticket created |
| 2026-03-20 | In Progress | Built the frozen RC tag `phase-8-rc-v1` (`a510ead8`) with `hugo --gc --minify --environment production`, recorded a successful build (`204` pages, `17` aliases), and captured a passing artifact report at `tmp/phase-8-rc-v1-artifact-validation.json` with projected published size `581.39 MB` and compressed artifact size `523.94 MB`. |
| 2026-03-20 | In Progress | Generated `validation/expected-url-outcomes.json`, `validation/sample-matrix.json`, and `validation/priority-routes.json` from the frozen manifest, the Phase 1 SEO baseline, and the RC build output via `scripts/phase-8/generate-validation-datasets.js`. |
| 2026-03-20 | In Progress | Replaced the validation placeholder contract with dataset schemas and downstream consumption guidance in `validation/README.md`, then recorded the human-readable and machine-readable freeze evidence in `migration/phase-8-rc-record.md` and `validation/runs/phase-8-rc-v1.json`. |
| 2026-03-20 | Done | All RHI-084 acceptance criteria are now satisfied. WS-B through WS-H can consume the frozen RC datasets and provenance records without reopening Phase 8 input selection. |

---

### Notes

- This ticket is the most important input gate in Phase 8. If the RC is not frozen or the expected-outcomes dataset is incomplete, workstream validation results cannot be compared or aggregated for the go/no-go decision.
- The `expected-url-outcomes.json` file is the machine-readable contract that WS-B uses for URL parity checks. The committed schema now distinguishes canonical migration intent from build-validation mode so WS-B can carry the accepted request-aware query-string exceptions without losing 100 percent manifest coverage.
- The sample matrix must cover every Hugo template family — not just post and page. Missing a template family means class-wide defects (e.g., missing canonical on video templates) will not be caught until post-launch.
- Reference: `analysis/plan/details/phase-8.md` §Workstream A: Release Candidate Freeze and Validation Dataset
