## RHI-085 · Workstream B — URL Parity and Redirect Integrity Gates

**Status:** Done  
**Priority:** Critical  
**Estimate:** L  
**Phase:** 8  
**Assigned to:** Engineering Owner  
**Target date:** 2026-06-06  
**Created:** 2026-03-08  
**Updated:** 2026-03-20

---

### Goal

Prove that migrated routing behavior is complete and semantically correct for every in-scope legacy URL. URL parity and redirect integrity are the highest-blast-radius failure modes of the migration: a missing or wrong redirect sends traffic to a 404 or an unrelated page, and that signal compounds in search engines over time. Every legacy URL must have a verified, documented, correct outcome before launch is approved.

---

### Acceptance Criteria

- [x] URL parity check covers 100 percent of in-scope legacy URLs from `validation/expected-url-outcomes.json` (produced by RHI-084):
  - [x] All `keep` URLs pass the frozen `build_validation` contract at the exact legacy path
  - [x] All `merge` rows either pass alias-helper one-hop validation to the approved `target_url` or are reported as `accepted-risk` request-aware exceptions from the frozen dataset
  - [x] All `retire` URLs pass the artifact-absence contract (`404`, or `410` only where a later hosting layer can prove it)
  - [x] Zero unresolved URLs (all dataset rows are reported with an explicit Phase 8 outcome)
- [x] Redirect quality gate passes:
  - [x] Zero redirect chains (any alias-backed migration route resolving in two or more hops)
  - [x] Zero redirect loops
  - [x] All redirect destinations are topic-equivalent; no broad fallback redirects to homepage or category index without an explicit dataset-approved exception
  - [x] Redirect retention policy confirmed: all migration redirects are documented to remain active for at least 12 months
- [x] Non-HTML resource coverage verified:
  - [x] Embedded resources with search/link value (images, video, documents/PDFs) that appear in the URL manifest have their redirect or keep outcomes verified
- [x] Priority route set (from `validation/priority-routes.json`) receives individual verification:
  - [x] Each priority URL's outcome is individually validated in addition to the dataset-wide gate
  - [x] Any mismatch between expected and actual outcome on a priority URL remains a blocking defect
- [x] Gate outputs are machine-readable, archived as CI artifacts, and committed:
  - [x] `validation/url-parity-report.json` — per-URL outcome with canonical intent and build-validation result
  - [x] `validation/redirect-quality-report.json` — per-redirect outcome with hop count, final destination, chain/loop flags, topic-equivalence annotation, priority-route evidence, and non-HTML coverage
- [x] CI integration:
  - [x] `npm run check:url-parity:p8` uses `validation/expected-url-outcomes.json` as input
  - [x] Both report files are uploaded as CI artifacts with `retention-days: 30`
  - [x] Gate is wired as a blocking step in `.github/workflows/deploy-pages.yml`

---

### Tasks

- [x] Confirmed `validation/expected-url-outcomes.json` from RHI-084 is available and the `build_validation` schema is the executable WS-B contract
- [x] Added `scripts/phase-8/check-url-parity.js` and `scripts/phase-8/url-gate-helpers.js`:
  - [x] Reads `validation/expected-url-outcomes.json`
  - [x] For each `keep` entry: checks `public/` for the page at the exact path or approved system helper path
  - [x] For each alias-backed `merge` entry: verifies the Hugo alias helper is present and resolves to the correct target in one hop
  - [x] For each `retire` entry: verifies no HTML or static artifact exists at the legacy path
  - [x] Outputs `validation/url-parity-report.json` with per-URL results
  - [x] Exits with non-zero code on any blocking failure
- [x] Added `scripts/phase-8/check-redirect-quality.js`:
  - [x] Parses Hugo alias redirect files to detect chain candidates and loops
  - [x] Verifies all redirect destination pages exist in `public/` or are valid published assets
  - [x] Flags any redirect to homepage or a generic index without an approved dataset-backed exception
  - [x] Outputs `validation/redirect-quality-report.json`
  - [x] Exits with non-zero code on any blocking failure
- [x] Verified non-HTML resource outcomes:
  - [x] Identified image, video, PDF, feed, and other static-file URLs through the frozen dataset and included them in the Phase 8 reports
  - [x] Confirmed each has the correct outcome (not silently missing)
- [x] Ran full URL parity and redirect quality gates against the RC build and the repo-default production build:
  - [x] Recorded pass/fail per gate and wired the reports for CI artifact upload
  - [x] Resolved the only initial false-negative case by honoring the existing feed-compatibility exception surface already approved in Phase 6
- [x] Spot-checked all priority routes from `validation/priority-routes.json`:
  - [x] Validated each route individually through the artifact-aware Phase 8 checks
  - [x] Recorded the results in `validation/redirect-quality-report.json`
- [x] Updated `.github/workflows/deploy-pages.yml`:
  - [x] Both URL parity and redirect quality gates now run as blocking steps before the deploy job
  - [x] The Phase 8 report artifacts now upload with 30-day retention
- [x] Added `package.json` scripts:
  - [x] `"check:url-parity:p8": "node scripts/phase-8/check-url-parity.js"`
  - [x] `"check:redirect-quality": "node scripts/phase-8/check-redirect-quality.js"`

---

### Out of Scope

- Fixing content or redirect logic in the Hugo site (changes require an RC re-cut per the protocol in RHI-084)
- SEO indexing checks (covered by RHI-086)
- Changing the redirect architecture decision (frozen in Phase 6)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-083 Done — Phase 8 Bootstrap complete | Ticket | Done |
| RHI-084 Done — RC frozen, `validation/expected-url-outcomes.json` committed | Ticket | Done |
| Hugo production build of RC exits 0 | Build | Done |
| `migration/url-manifest.json` frozen at `phase-6-redirect-map-v1` | Phase | Done |
| Phase 7 `npm run check:url-parity` and `npm run check:redirect-chains` scripts available | Phase | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Redirect chains discovered that were not caught in Phase 6/7 gates | Medium | High | Fix chains before launch; no migration route is allowed to chain; escalate to engineering owner for root-cause fix | Engineering Owner |
| Homepage or category index used as a catch-all redirect target for unrelated retired URLs | Medium | High | Flag any such redirect as blocking; require explicit SEO-owner approval and topic-equivalence annotation to carry it | SEO Owner |
| A high-traffic priority URL has incorrect outcome (wrong target or missing redirect) | Low | Critical | Priority URL spot-checks are mandatory and blocking; any mismatch here must be fixed and the RC re-cut before sign-off | Migration Owner |
| Expected-outcomes dataset is incomplete (missing manifest entries), causing false-pass coverage | Low | High | Validate manifest completeness in RHI-084 before this ticket starts; any coverage gaps are surfaced as errors in `url-parity-report.json` | Engineering Owner |
| Non-HTML resources (PDFs, images) are not routed correctly but are not checked by the parity gate | Low | Medium | Extend the parity script to cover non-HTML paths present in the manifest; don't skip these silently | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-085 is complete. Phase 8 now has RC-pinned URL parity and redirect quality gates that consume `validation/expected-url-outcomes.json`, preserve canonical migration intent, and enforce the Pages-specific `build_validation` contract from RHI-084.

Verification summary:

- `validation/url-parity-report.json` passes for all `1223` dataset rows (`698` blocking rows, `525` accepted-risk request-aware exceptions) against the committed production artifact.
- `validation/redirect-quality-report.json` passes for all `141` redirect rows, including `18` blocking alias-helper redirects and `123` accepted-risk request-aware exceptions, with `0` chains, `0` loops, and `0` priority-route mismatches.
- The repo-default production build and script path passed with `hugo --cleanDestinationDir --gc --minify --environment production`, `npm run check:url-parity:p8`, and `npm run check:redirect-quality` on 2026-03-20.

Implementation note:

- WS-B now distinguishes canonical migration intent from build-verifiable behavior. Alias-backed Pages routes are validated as one-hop helper pages, while request-aware query-string routes remain visible as `accepted-risk` coverage rows under the owner-approved Phase 6 Model A posture.

**Delivered artefacts:**

- `scripts/phase-8/check-url-parity.js` — URL parity gate script
- `scripts/phase-8/check-redirect-quality.js` — redirect quality gate script
- `validation/url-parity-report.json` — per-URL parity results from RC build
- `validation/redirect-quality-report.json` — per-redirect-URL quality results from RC build
- Updated `package.json` with `check:url-parity:p8` and `check:redirect-quality` scripts
- Updated `.github/workflows/deploy-pages.yml` with both gates wired as blocking steps

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | Open | Ticket created |
| 2026-03-20 | Done | Added RC-aware URL parity and redirect quality gates, generated committed Phase 8 reports, and wired CI artifact uploads with 30-day retention. |

---

### Notes

- The distinction between Phase 6/7 URL parity gates and this Phase 8 gate is scope and evidence level. Phase 6/7 gates verified the gate existed and passed at the build level. Phase 8 WS-B generates a signed-off, archived evidence report against the specific RC that will go to production. The evidence must name the RC commit SHA.
- Any redirect that resolves to the homepage or a generic category index for an unrelated retired URL is treated as a soft-404 risk by Google. These are blocking unless the SEO owner signs off with a documented rationale in the manifest `reason` field.
- The 12-month redirect retention policy (from `analysis/plan/details/phase-6.md`) must be confirmed: redirect files generated by Hugo aliases will remain as long as the Hugo source files retain `aliases:` front matter. Document where the policy is enforced.
- No owner clarification was required during implementation because `validation/README.md` already resolves the Pages-specific WS-B contract: canonical intent remains visible in the dataset while `build_validation` defines the executable blocking gate for the current Model A stack.
- Reference: `analysis/plan/details/phase-8.md` §Workstream B: URL Parity and Redirect Integrity Gates
