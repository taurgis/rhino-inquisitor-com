## RHI-084 · Workstream A — Release Candidate Freeze and Validation Dataset

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 8  
**Assigned to:** Migration Owner  
**Target date:** 2026-06-04  
**Created:** 2026-03-08  
**Updated:** 2026-03-08

---

### Goal

Lock the release candidate inputs so that all Phase 8 validation results are meaningful, repeatable, and traceable to a single immutable build state. Define the representative page sample matrix and priority route set that every downstream workstream (WS-B through WS-H) will use as the validation target. Without a frozen RC and a defined sample matrix, validation results are not comparable between workstreams and the go/no-go decision lacks an auditable evidence baseline.

---

### Acceptance Criteria

- [ ] Release candidate is frozen and immutably identified:
  - [ ] Git tag `phase-8-rc-v1` exists on the RC commit (set in RHI-083 bootstrap)
  - [ ] RC commit SHA is recorded in `migration/phase-8-rc-record.md`
  - [ ] Content, URL mapping, and configuration changes are locked: no merges to the RC branch without an explicit unfreeze and re-tag protocol
  - [ ] The frozen URL manifest path is confirmed: `migration/url-manifest.json` (Phase 6 frozen state, git tag `phase-6-redirect-map-v1`)
- [ ] Expected URL outcomes dataset is derived from the frozen manifest:
  - [ ] `keep` URLs: the generated Hugo page at the exact legacy path returns HTTP 200
  - [ ] `merge` (redirect) URLs: the legacy path resolves with a 301 to the target URL in one hop
  - [ ] `retire` URLs: the legacy path returns 404 (or 410 where supported)
  - [ ] Dataset is committed as `validation/expected-url-outcomes.json`
- [ ] Representative page sample matrix is defined and committed to `validation/sample-matrix.json`:
  - [ ] Homepage (`/`)
  - [ ] At least 10 recent post URLs (explicit list)
  - [ ] Archive page(s) URL(s)
  - [ ] At least 5 category page URLs (explicit list)
  - [ ] Privacy/legal page URL(s)
  - [ ] Video template URL(s) if retained in scope
  - [ ] Landing page template URL(s) if retained in scope
  - [ ] Every template family present in the Hugo build is represented by at least one URL
- [ ] Priority route set is defined and committed to `validation/priority-routes.json`:
  - [ ] Top organic-traffic URLs (from Search Console data in `migration/phase-1-seo-baseline.md`)
  - [ ] Top backlink URLs (from baseline external link report)
  - [ ] Explicitly covers all URL classes: `post`, `page`, `category`, `video`, `landing`, `system`
  - [ ] Priority routes are annotated with expected outcome (`keep`, `redirect`, `retire`)
- [ ] Hugo production build of the RC commit succeeds with zero errors:
  - [ ] `hugo --gc --minify --environment production` exits 0 on the RC commit
  - [ ] Build output is confirmed at `./public` with a top-level `index.html`
  - [ ] Build output size is within GitHub Pages limits (< 1 GB)
  - [ ] Build duration is documented (must complete within the 10-minute Pages deploy time budget)
- [ ] Validation dataset schema is documented in `validation/README.md`:
  - [ ] Schema for `expected-url-outcomes.json`
  - [ ] Schema for `sample-matrix.json`
  - [ ] Schema for `priority-routes.json`
  - [ ] Instructions for downstream workstreams on how to consume these files

---

### Tasks

- [ ] Confirm `phase-8-rc-v1` tag is set from RHI-083; if not, set it now on the agreed RC commit
- [ ] Create `migration/phase-8-rc-record.md`:
  - [ ] RC commit SHA
  - [ ] Date and time of freeze
  - [ ] Name of person who froze it
  - [ ] Hugo version used for the RC build
  - [ ] Link to the Actions run that validated the Phase 7 gates
- [ ] Derive expected URL outcomes dataset from `migration/url-manifest.json`:
  - [ ] Iterate all manifest entries
  - [ ] Map `disposition: keep` → expected HTTP 200 at `target_url`
  - [ ] Map `disposition: merge` → expected HTTP 301 redirect from `legacy_url` to `target_url` in one hop
  - [ ] Map `disposition: retire` → expected HTTP 404 at `legacy_url`
  - [ ] Commit as `validation/expected-url-outcomes.json`
- [ ] Run Hugo production build on RC commit:
  - [ ] `hugo --gc --minify --environment production`
  - [ ] Record exit code, duration, and output size
  - [ ] Verify `public/index.html` exists
  - [ ] Run `npm run validate:artifact` to confirm no symlinks or structure violations
- [ ] Define representative page sample matrix:
  - [ ] Extract homepage URL
  - [ ] Select at least 10 recent post URLs from the generated sitemap
  - [ ] Identify archive page URL(s) from the Hugo output
  - [ ] Select at least 5 category page URLs
  - [ ] Confirm privacy/legal URL(s)
  - [ ] Identify any video or landing templates and include at least one URL of each
  - [ ] Commit as `validation/sample-matrix.json`
- [ ] Define priority route set:
  - [ ] Cross-reference Search Console data from `migration/phase-1-seo-baseline.md` for top organic URLs
  - [ ] Cross-reference external link data from SEO baseline for top backlink URLs
  - [ ] Annotate each URL with URL class and expected outcome
  - [ ] Commit as `validation/priority-routes.json`
- [ ] Draft `validation/README.md` with dataset schema and consumption instructions
- [ ] Communicate RC freeze to all WS-B through WS-H owners with:
  - [ ] RC commit SHA and `phase-8-rc-v1` tag reference
  - [ ] Link to `validation/expected-url-outcomes.json`
  - [ ] Link to `validation/sample-matrix.json`
  - [ ] Link to `validation/priority-routes.json`

---

### Out of Scope

- Changing content, URL mappings, or site configuration (the RC is frozen; changes require an explicit re-cut protocol)
- Running the validation gate checks (covered by WS-B through WS-H)
- Go/no-go decision (covered by WS-H)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-083 Done — Phase 8 Bootstrap complete and `phase-8-rc-v1` tag set | Ticket | Pending |
| `migration/url-manifest.json` frozen at `phase-6-redirect-map-v1` tag | Phase | Pending |
| `migration/phase-1-seo-baseline.md` available for top-traffic URL selection | Phase | Pending |
| Hugo production build of RC exits 0 | Build | Pending |
| `npm run validate:artifact` passes on RC build output | Phase | Pending |

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- `migration/phase-8-rc-record.md` — RC commit SHA, freeze metadata, build evidence
- `validation/expected-url-outcomes.json` — full expected outcome dataset from frozen manifest
- `validation/sample-matrix.json` — representative page matrix covering all template families
- `validation/priority-routes.json` — annotated priority route set from organic/backlink data
- `validation/README.md` — schema documentation and consumption instructions for downstream workstreams

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | Open | Ticket created |

---

### Notes

- This ticket is the most important input gate in Phase 8. If the RC is not frozen or the expected-outcomes dataset is incomplete, workstream validation results cannot be compared or aggregated for the go/no-go decision.
- The `expected-url-outcomes.json` file is the machine-readable contract that WS-B uses for URL parity checks. Its schema must be agreed with RHI-085 owner before this ticket is closed.
- The sample matrix must cover every Hugo template family — not just post and page. Missing a template family means class-wide defects (e.g., missing canonical on video templates) will not be caught until post-launch.
- Reference: `analysis/plan/details/phase-8.md` §Workstream A: Release Candidate Freeze and Validation Dataset
