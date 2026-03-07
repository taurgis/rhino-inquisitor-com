## RHI-025 · Workstream F — URL Preservation and Redirect Baseline

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 3  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-02  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Build the URL parity checking framework that validates every legacy URL in `migration/url-manifest.json` has exactly one deterministic outcome in the Hugo build output: a direct route, a mapped redirect target, or an explicitly approved retired disposition. This framework must block CI on failures — missing or ambiguous URL mappings are release-blocking gaps, not warnings. The collision checks and parity report artifact created here become the authoritative release-gate mechanism for all subsequent content migration phases.

---

### Acceptance Criteria

- [ ] URL parity script (`scripts/check-url-parity.js`) exists and:
  - [ ] Reads `migration/url-manifest.json` as the source of truth
  - [ ] Reads the Hugo build output in `public/` to detect generated routes
  - [ ] For each `keep` URL: verifies a corresponding HTML page exists at `public/{path}/index.html`
  - [ ] For each `merge` URL: verifies a redirect/alias page exists at `public/{path}/index.html` with correct target
  - [ ] For each `retire` URL: verifies the disposition is explicitly `retire` with no orphaned mapping
  - [ ] Exits with non-zero code if any `keep` URL is missing or any `merge` redirect target is wrong
- [ ] Collision checks are included in the parity script (or a composable module):
  - [ ] Detects duplicate `url` front matter values across all content files
  - [ ] Detects duplicate alias outputs (two content files generating the same `public/` output path)
  - [ ] Exits with non-zero code on any collision
- [ ] Redirect chain detection is included:
  - [ ] Identifies any redirect whose target is itself a redirect page
  - [ ] Reports chains as failures (no chains allowed per RHI-013 policy)
- [ ] Parity report artifact (`migration/url-parity-report.json`) is generated on each run:
  - [ ] Per-URL status: `ok`, `missing`, `wrong-target`, `chain`, or `collision`
  - [ ] Summary counts by status
  - [ ] Timestamp of last run
- [ ] Soft-404 risk detection: any `merge` or `retire` URL mapping to the homepage, a 404 page, or an unrelated section is flagged as a warning in the report
- [ ] Script is referenced in `package.json` as `npm run check:url-parity`
- [ ] Running `npm run check:url-parity` against a clean scaffold with no content exits gracefully (no manifest URLs to check or empty pass)
- [ ] Running `npm run check:url-parity` with a sample manifest and a missing mapped URL exits with non-zero code
- [ ] 5% threshold check: script computes the percentage of indexed `keep`/`merge` URLs changed and warns if the threshold (from RHI-013) is approached or exceeded

---

### Tasks

- [ ] Review `migration/url-manifest.json` schema from Phase 1 (RHI-004) to confirm field names used by parity script
- [ ] Create `scripts/check-url-parity.js`:
  - [ ] Import `fast-glob` for scanning `public/` output
  - [ ] Import `fs/promises` for reading manifest and writing report
  - [ ] Load and parse `migration/url-manifest.json`
  - [ ] For each manifest entry, determine expected outcome based on `disposition` field
  - [ ] Check `public/` for corresponding file at expected path
  - [ ] For redirect/alias pages: parse HTML meta refresh target and compare to `target_url`
  - [ ] Collect duplicate URL and alias collision data (complement to RHI-022 front-matter check)
  - [ ] Detect redirect chains by following alias targets one hop
  - [ ] Flag soft-404 risk: target is homepage, `/404/`, or unrelated section
  - [ ] Compute percentage of `keep`/`merge` URLs that are absent; warn if ≥5% threshold
  - [ ] Write `migration/url-parity-report.json` with per-URL status and summary
  - [ ] Output human-readable summary to stdout
  - [ ] Exit 1 on any `missing`, `wrong-target`, `chain`, or `collision` status
- [ ] Add `"check:url-parity": "node scripts/check-url-parity.js"` to `package.json` scripts
- [ ] Create a fixture manifest with one `keep` URL and one `merge` URL for testing
- [ ] Build scaffold with matching and non-matching content files to verify exit codes
- [ ] Confirm `migration/url-parity-report.json` is generated with correct structure
- [ ] Confirm soft-404 detection flags a homepage-redirect mapping as a warning
- [ ] Remove fixture test files after validation
- [ ] Document parity script usage in `docs/migration/RUNBOOK.md`:
  - [ ] When to run it
  - [ ] How to interpret the report
  - [ ] What to do on failures
- [ ] Commit `scripts/check-url-parity.js` and updated `package.json`

---

### Out of Scope

- Populating `migration/url-manifest.json` with full URL dispositions (Phase 1, RHI-004)
- Creating the actual redirect alias pages for all legacy URLs (Phase 4 bulk migration scope)
- Edge redirect layer setup (Phase 2 decision, Phase 6 implementation if threshold is breached)
- DNS or server-side redirect infrastructure

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-019 Done — Phase 3 Bootstrap complete | Ticket | Pending |
| RHI-021 Done — Hugo config establishes permalink rules (determines expected `public/` paths) | Ticket | Pending |
| RHI-022 Done — Front matter URL validation (collision checks complement each other) | Ticket | Pending |
| RHI-004 Done — `migration/url-manifest.json` exists with `disposition`, `target_url` fields | Ticket | Pending |
| RHI-013 Outcomes — Redirect mechanism, chain policy, 5% threshold value confirmed | Ticket | Pending |
| `fast-glob` available in `package.json` | Tool | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| `migration/url-manifest.json` not yet complete when RHI-025 runs | Medium | Medium | Script must handle an empty or partial manifest gracefully; document partial-manifest behavior in RUNBOOK | Engineering Owner |
| Alias HTML pages do not contain a parseable redirect target (meta refresh format varies) | Low | Medium | Use a consistent alias template; test meta refresh parsing against Hugo alias output format | Engineering Owner |
| 5% threshold calculation uses wrong denominator (total URLs vs indexed URLs) | Low | High | Use only URLs with `has_organic_traffic: true` or `disposition: keep` as the indexed subset; document calculation in script comments | SEO Owner |
| Parity report grows large enough to be unwieldy in CI logs | Low | Low | Output summary counts to stdout; write per-URL detail to JSON file only | Engineering Owner |

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

- `scripts/check-url-parity.js`
- `migration/url-parity-report.json` (generated artifact; format validated)
- `package.json` updated with `check:url-parity` script
- `docs/migration/RUNBOOK.md` updated with parity check usage instructions

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- The parity check script is one of the two most important release gates in the entire migration (alongside the production build). It must be release-blocking from Phase 3 onwards — failures must not be downgraded to warnings.
- Redirect chains are specifically prohibited by RHI-013 policy. The script must detect them; do not rely on manual inspection.
- The 5% threshold (from RHI-013) determines whether the edge redirect layer becomes mandatory before launch. The script's threshold warning must surface early enough for that infrastructure decision to be made before Phase 7.
- Reference: `analysis/plan/details/phase-3.md` §Workstream F: URL Preservation and Redirect Baseline; `.github/instructions/migration-data.instructions.md`
