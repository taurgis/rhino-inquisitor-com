## RHI-036 · Workstream E — URL Preservation and Redirect Integrity

**Status:** In Progress  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 4  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-17  
**Created:** 2026-03-07  
**Updated:** 2026-03-10

---

### Goal

Validate that every URL in the Phase 1 manifest has a deterministic, correct outcome in the migrated Hugo output — a live page at the right path for `keep` records, a working redirect to the approved target for `merge` records, and true not-found behavior (not a placeholder `200`) for `retire` records. Zero unresolved URL parity failures are allowed before batch migration begins.

URL integrity failures are the primary cause of SEO equity loss during migration. A single misconfigured redirect on a high-traffic page can wipe organic traffic permanently. This workstream builds the validation tooling that makes every batch provably correct.

---

### Acceptance Criteria

- [ ] URL parity validation script `scripts/migration/validate-url-parity.js` exists and:
  - [ ] Reads `migration/url-manifest.json` as source of truth
  - [ ] Reads Hugo-generated `public/` output to verify:
    - [ ] Every `keep` URL has a corresponding `public/{path}/index.html` and a source content file with explicit `url` front matter matching manifest `targetUrl`
    - [ ] Every `merge` URL is validated against the configured redirect type (`server-301-308` or `meta-refresh`) from the redirect contract/manifest mapping
    - [ ] `server-301-308`: HTTP status and `Location` target are correct
    - [ ] `meta-refresh`: Hugo alias page exists at `public/{legacy-path}/index.html` with `http-equiv="refresh"` pointing to the correct target
    - [ ] Every `retire` URL does not have a corresponding `public/{path}/index.html` (true not-found)
  - [ ] Reports all failures with severity: `critical` (indexed URLs) and `warning` (low-traffic URLs)
  - [ ] Exits with non-zero code on any `critical` failure
  - [ ] Is referenced in `package.json` as `npm run check:url-parity` (extends or wraps the Phase 3 script from RHI-025)
- [ ] Redirect integrity check script `scripts/migration/check-redirects.js` exists and:
  - [ ] For each `merge` record, validates behavior by configured redirect type:
    - [ ] `server-301-308`: verifies redirect status code and `Location` target
    - [ ] `meta-refresh`: verifies HTTP `200`, `<meta http-equiv="refresh" content="0; url=...">`, and canonical tag pointing to `targetUrl`
    - [ ] Any mismatch between configured redirect type and observed behavior is a failure
  - [ ] Reports all redirect-type mismatches for critical SEO URLs
  - [ ] Is referenced in `package.json` as `npm run check:redirects`
- [ ] No redirect chains exist: every legacy path resolves to a final target in one hop
- [ ] No `retire` URLs resolve to `200` with placeholder content (soft-404 prevention)
- [ ] No `merge` URL redirects to the homepage as a catch-all
- [ ] URL parity report `migration/reports/url-parity-report.csv` is produced with: `legacy_url`, `disposition`, `expected_target`, `actual_outcome`, `status` (`pass`/`fail`), `severity`
- [ ] Zero unresolved `critical` failures before any batch is merged to `src/content/`

---

### Tasks

- [ ] Review Phase 2 redirect contract (RHI-013 Outcomes) — confirm redirect implementation type:
  - [ ] Confirm whether Hugo `aliases` (meta-refresh) are sufficient or edge redirects are required
  - [ ] If 5% threshold was exceeded in Phase 3 (from RHI-030), escalate edge redirect decision before proceeding
- [ ] Create `scripts/migration/validate-url-parity.js`:
  - [ ] Load `migration/url-manifest.json`
  - [ ] For each `keep` record: verify `public/{path}/index.html` exists and source `.md` `url` front matter matches manifest `targetUrl`
  - [ ] For each `merge` record: branch validation by configured redirect type (`server-301-308` vs `meta-refresh`)
  - [ ] For each `retire` record: verify no HTML file exists at that path
  - [ ] Classify failures as `critical` or `warning` based on manifest `priority` field
  - [ ] Write results to `migration/reports/url-parity-report.csv`
  - [ ] Exit 1 if any `critical` failure exists
- [ ] Create `scripts/migration/check-redirects.js`:
  - [ ] Load redirect-type mapping for `merge` URLs from contract/manifest
  - [ ] Validate `server-301-308` redirects by HTTP status and `Location`
  - [ ] Validate `meta-refresh` alias pages in `public/` by refresh target and canonical tag
  - [ ] Detect redirect chains (target of one redirect is itself redirected)
  - [ ] Flag any alias page with a homepage target on a non-homepage content URL
  - [ ] Exit 1 on any critical integrity failure
- [ ] Add script references to `package.json`:
  - [ ] `"check:url-parity": "node scripts/migration/validate-url-parity.js"`
  - [ ] `"check:redirects": "node scripts/migration/check-redirects.js"`
- [ ] Run both scripts against a pilot-scale Hugo build and fix all failures
  - [x] Run both scripts against a staged-content Hugo build (`tmp/rhi036-public`) and capture the first parity baseline
  - [ ] Fix all unresolved failures
- [ ] Commit scripts, updated `package.json`, and parity report template

---

### Out of Scope

- Implementing server-side 301/308 redirects (requires edge/CDN layer — Phase 6/7 scope)
- DNS-level redirect configuration (Phase 7)
- Internal link rewriting (Workstream G — RHI-038)
- SEO metadata completeness validation (Workstream H — RHI-039)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-031 Done — Phase 4 Bootstrap complete | Ticket | Verified |
| RHI-035 Done — Front matter mapping complete; Hugo `url` and `aliases` fields populated | Ticket | Verified |
| RHI-013 Outcomes — Redirect contract confirmed (type: Hugo aliases vs edge) | Ticket | Verified |
| RHI-025 Done — Phase 3 URL parity baseline script available (extend, not replace) | Ticket | Verified |
| `migration/url-manifest.json` with full disposition coverage from RHI-004 | Ticket | Verified |
| Hugo build (`public/`) available for validation | Tool | Verified via staged build `tmp/rhi036-public` |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| 5% URL-change threshold exceeded — Hugo alias pages insufficient for SEO preservation | Medium | Critical | Check threshold status in Phase 3 sign-off (RHI-030); if exceeded, escalate edge redirect infrastructure decision before starting batch migration | SEO Owner, Migration Owner |
| Hugo alias pages produce meta-refresh with incorrect target URL | Medium | High | Test alias generation on 5 `merge` records before full batch; inspect generated HTML manually | Engineering Owner |
| `retire` records accidentally generating Hugo pages via taxonomy/category listing | Medium | High | Verify `retire` URLs are absent from all Hugo output including taxonomy list pages | Engineering Owner |
| Redirect chains introduced by overlapping `merge` targets | Low | High | Run chain detection in `check-redirects.js`; fail on any chain of depth > 1 | Engineering Owner |
| URL parity script misses encoded or non-canonical path variants | Low | Medium | Normalize path encoding before comparison; test with paths containing dashes, underscores, and query strings | Engineering Owner |

---

### Definition of Done

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Ticket remains open. The validator and redirect checker now exist, the critical parity blockers are cleared, and the remaining work is warning-level manifest/content cleanup before final closure.

**Delivered artefacts:**

- `scripts/migration/validate-url-parity.js`
- `scripts/migration/check-redirects.js`
- `scripts/migration/url-validation-helpers.js`
- `migration/reports/url-parity-report.csv`
- `package.json` updated with `check:url-parity` and `check:redirects` scripts

**Deviations from plan:**

- Query-style legacy URLs are validated as `deferred-edge-redirect` rows during Phase 4 static-output checks because Hugo cannot emit distinct `public/` files for `/?p=` routes. Full runtime redirect validation for those rows remains edge-layer work.
- The first staged-content validation run did not pass: `migration/reports/url-parity-report.csv` recorded 38 failures, including 27 critical failures on kept category/list routes, one missing kept content route, and retired category pagination routes that still publish.
- After route fixes and the owner-approved delta-exports merge decision, the latest staged-content validation run now reports 9 warning-level failures and 0 critical failures.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-10 | In Progress | Owner decision recorded for Phase 4 static validation: query-style merge URLs that Hugo cannot represent are reported as `deferred-edge-redirect` rather than treated as false static-path failures. |
| 2026-03-10 | In Progress | Implemented `scripts/migration/validate-url-parity.js`, `scripts/migration/check-redirects.js`, and shared helpers; updated `package.json`; fixed staged-build blocking template defects in `src/layouts/partials/article/related-content.html`. |
| 2026-03-10 | In Progress | First staged-content parity run produced `migration/reports/url-parity-report.csv` with 38 failures (`27` critical). Redirect integrity produced zero critical failures but deferred all 125 merge URLs to the edge-layer contract. |
| 2026-03-10 | In Progress | Added staged category term content for manifest-backed nested keep routes, removed taxonomy term pagination that published retired `/page/N/` URLs, and updated `/feed/` validation handling for the generated system helper route. |
| 2026-03-10 | In Progress | Owner approved changing `/delta-exports-in-salesforce-b2c-commerce/` from `keep` to `merge` targeting `/delta-exports-in-salesforce-b2c-commerce-cloud/` on the `edge-cdn` layer. Latest staged parity run: 9 failures, 0 critical. |

---

### Notes

- Hugo `aliases` generate HTML pages with `<meta http-equiv="refresh" content="0; url=...">`. This is a meta-refresh, NOT a server-side 301/308. Search engines do understand and follow meta refreshes, but with a processing delay compared to server redirects. If the 5% threshold was exceeded in Phase 3, a true redirect infrastructure decision must be made before this workstream locks in redirect behavior.
- Phase 3 sign-off already confirmed the 5% threshold is exceeded (`39.1%`). Edge redirect infrastructure remains mandatory before launch; RHI-036 does not reopen that decision.
- The current manifest shape matters for implementation: 123 merge URLs and 402 retire URLs are query-style legacy routes, so static Hugo validation can only report them and defer runtime behavior to the edge redirect layer.
- No redirect should ever target the homepage for unrelated content. This pattern destroys Google's understanding of site structure and is a hard anti-pattern in `analysis/plan/details/phase-4.md`.
- The parity check must run on a built `public/` directory, not on source files. Build first, then validate.
- Reference: `analysis/plan/details/phase-4.md` §Workstream E: URL Preservation and Redirect Integrity
