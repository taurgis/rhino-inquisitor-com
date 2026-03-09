## RHI-025 · Workstream F — URL Preservation and Redirect Baseline

**Status:** Done  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 3  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-02  
**Created:** 2026-03-07  
**Updated:** 2026-03-09

---

### Goal

Build the URL parity checking framework that validates every legacy URL in `migration/url-manifest.json` has exactly one deterministic outcome in the Hugo build output: a direct route, a mapped redirect target, or an explicitly approved retired disposition. This framework must block CI on failures — missing or ambiguous URL mappings are release-blocking gaps, not warnings. The collision checks and parity report artifact created here become the authoritative release-gate mechanism for all subsequent content migration phases.

---

### Acceptance Criteria

- [x] URL parity script (`scripts/check-url-parity.js`) exists and:
  - [x] Reads `migration/url-manifest.json` as the source of truth
  - [x] Reads the Hugo build output in `public/` to detect generated routes
  - [x] For each `keep` URL: verifies a corresponding HTML page exists at `public/{path}/index.html`
  - [x] For each `merge` URL: verifies a redirect/alias page exists at `public/{path}/index.html` with correct target
  - [x] For each `retire` URL: verifies the disposition is explicitly `retire` with no orphaned mapping
  - [x] Exits with non-zero code if any `keep` URL is missing or any `merge` redirect target is wrong
- [x] Collision checks are included in the parity script (or a composable module):
  - [x] Detects duplicate `url` front matter values across all content files
  - [x] Detects duplicate alias outputs (two content files generating the same `public/` output path)
  - [x] Exits with non-zero code on any collision
- [x] Redirect chain detection is included:
  - [x] Identifies any redirect whose target is itself a redirect page
  - [x] Reports chains as failures (no chains allowed per RHI-013 policy)
- [x] Parity report artifact (`migration/url-parity-report.json`) is generated on each run:
  - [x] Per-URL status: `ok`, `missing`, `wrong-target`, `chain`, or `collision`
  - [x] Summary counts by status
  - [x] Timestamp of last run
- [x] Soft-404 risk detection: any `merge` or `retire` URL mapping to the homepage, a 404 page, or an unrelated section is flagged as a warning in the report
- [x] Script is referenced in `package.json` as `npm run check:url-parity`
- [x] Running `npm run check:url-parity` against a clean scaffold with no content exits gracefully (no manifest URLs to check or empty pass)
- [x] Running `npm run check:url-parity` with a sample manifest and a missing mapped URL exits with non-zero code
- [x] 5% threshold check uses an explicit indexed-URL formula and warns when threshold is reached:
  - [x] `indexed_urls = count(disposition == "keep" OR has_organic_traffic == true)`
  - [x] `changed_indexed_urls = count(indexed_urls where disposition != "keep")`
  - [x] `change_rate = changed_indexed_urls / indexed_urls * 100`
  - [x] Warn if `change_rate >= 5`

---

### Tasks

- [x] Review `migration/url-manifest.json` schema from Phase 1 (RHI-004) to confirm field names used by parity script
- [x] Create `scripts/check-url-parity.js`:
  - [x] Import `fast-glob` for scanning `public/` output
  - [x] Import `fs/promises` for reading manifest and writing report
  - [x] Load and parse `migration/url-manifest.json`
  - [x] For each manifest entry, determine expected outcome based on `disposition` field
  - [x] Check `public/` for corresponding file at expected path
  - [x] For redirect/alias pages: parse HTML meta refresh target and compare to `target_url`
  - [x] Collect duplicate URL and alias collision data (complement to RHI-022 front-matter check)
  - [x] Detect redirect chains by following alias targets one hop
  - [x] Flag soft-404 risk: target is homepage, `/404/`, or unrelated section
  - [x] Compute indexed URL change rate using the explicit formula; warn if `change_rate >= 5`
  - [x] Write `migration/url-parity-report.json` with per-URL status and summary
  - [x] Output human-readable summary to stdout
  - [x] Exit 1 on any `missing`, `wrong-target`, `chain`, or `collision` status
- [x] Add `"check:url-parity": "node scripts/check-url-parity.js"` to `package.json` scripts
- [x] Create a fixture manifest with one `keep` URL and one `merge` URL for testing
- [x] Build scaffold with matching and non-matching content files to verify exit codes
- [x] Confirm `migration/url-parity-report.json` is generated with correct structure
- [x] Confirm soft-404 detection flags a homepage-redirect mapping as a warning
- [x] Remove fixture test files after validation
- [x] Document parity script usage in `docs/migration/RUNBOOK.md`:
  - [x] When to run it
  - [x] How to interpret the report
  - [x] What to do on failures
- [x] Commit `scripts/check-url-parity.js` and updated `package.json`

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
| RHI-019 Done — Phase 3 Bootstrap complete | Ticket | Ready |
| RHI-021 Done — Hugo config establishes permalink rules (determines expected `public/` paths) | Ticket | Ready |
| RHI-022 Done — Front matter URL validation (collision checks complement each other) | Ticket | Ready |
| RHI-004 Done — `migration/url-manifest.json` exists with `disposition`, `target_url` fields | Ticket | Ready |
| RHI-013 Outcomes — Redirect mechanism, chain policy, 5% threshold value confirmed | Ticket | Ready |
| `fast-glob` available in `package.json` | Tool | Ready |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| `migration/url-manifest.json` not yet complete when RHI-025 runs | Medium | Medium | Script must handle an empty or partial manifest gracefully; document partial-manifest behavior in RUNBOOK | Engineering Owner |
| Alias HTML pages do not contain a parseable redirect target (meta refresh format varies) | Low | Medium | Use a consistent alias template; test meta refresh parsing against Hugo alias output format | Engineering Owner |
| 5% threshold calculation uses wrong denominator (total URLs vs indexed URLs) | Low | High | Use explicit indexed-URL formula: `indexed_urls = count(disposition == "keep" OR has_organic_traffic == true)` and `changed_indexed_urls = count(indexed_urls where disposition != "keep")`; document in script comments | SEO Owner |
| Parity report grows large enough to be unwieldy in CI logs | Low | Low | Output summary counts to stdout; write per-URL detail to JSON file only | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Final outcomes:

- Added `scripts/check-url-parity.js` as the Phase 3 URL parity baseline gate with manifest validation, output-path checks, redirect-target verification, collision detection, redirect-chain detection, soft-404 warnings, and indexed-URL threshold reporting.
- Wired `npm run check:url-parity` in `package.json` and updated `docs/migration/RUNBOOK.md` with execution and interpretation guidance.
- Generated baseline report artifact `migration/url-parity-report.json` from the current scaffold build; current scaffold result is `scaffold_mode: true`, zero hard failures, and a 39.1% indexed-URL change rate warning (`131 / 335`) that keeps the Phase 2 edge-redirect requirement visible.
- Validated non-scaffold behavior with temporary fixtures: a passing keep-plus-merge case exited `0`, removing the kept route flipped the command to exit `1`, and a homepage redirect target produced a `soft-404-homepage` warning in the report.

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
| 2026-03-09 | In Progress | Implemented `scripts/check-url-parity.js`, wired `npm run check:url-parity`, and documented scaffold-mode/report behavior in `docs/migration/RUNBOOK.md` |
| 2026-03-09 | Done | Production scaffold build and isolated fixture validation passed: baseline report generated, hard-failure exit paths verified, and homepage soft-404 warning behavior confirmed |

---

### Notes

- The parity check script is one of the two most important release gates in the entire migration (alongside the production build). It must be release-blocking from Phase 3 onwards — failures must not be downgraded to warnings.
- Redirect chains are specifically prohibited by RHI-013 policy. The script must detect them; do not rely on manual inspection.
- The 5% threshold (from RHI-013) determines whether the edge redirect layer becomes mandatory before launch. The script's threshold warning must surface early enough for that infrastructure decision to be made before Phase 7.
- Reference: `analysis/plan/details/phase-3.md` §Workstream F: URL Preservation and Redirect Baseline; `.github/instructions/migration-data.instructions.md`
