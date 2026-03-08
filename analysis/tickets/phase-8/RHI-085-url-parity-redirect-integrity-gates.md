## RHI-085 · Workstream B — URL Parity and Redirect Integrity Gates

**Status:** Open  
**Priority:** Critical  
**Estimate:** L  
**Phase:** 8  
**Assigned to:** Engineering Owner  
**Target date:** 2026-06-06  
**Created:** 2026-03-08  
**Updated:** 2026-03-08

---

### Goal

Prove that migrated routing behavior is complete and semantically correct for every in-scope legacy URL. URL parity and redirect integrity are the highest-blast-radius failure modes of the migration: a missing or wrong redirect sends traffic to a 404 or an unrelated page, and that signal compounds in search engines over time. Every legacy URL must have a verified, documented, correct outcome before launch is approved.

---

### Acceptance Criteria

- [ ] URL parity check covers 100 percent of in-scope legacy URLs from `validation/expected-url-outcomes.json` (produced by RHI-084):
  - [ ] All `keep` URLs return HTTP 200 at the exact legacy path
  - [ ] All `merge` (redirect) URLs resolve with HTTP 301 to the correct `target_url` in exactly one hop (no chains allowed on migration routes)
  - [ ] All `retire` URLs return HTTP 404 (or 410 where the hosting layer supports explicit 410)
  - [ ] Zero unresolved URLs (URLs in manifest with no outcome in the build output)
- [ ] Redirect quality gate passes:
  - [ ] Zero redirect chains (any legacy URL resolving in two or more hops)
  - [ ] Zero redirect loops
  - [ ] All redirect destinations are topic-equivalent; no broad fallback redirects to homepage or category index unless explicitly approved with owner sign-off
  - [ ] Redirect retention policy confirmed: all migration redirects are documented to remain active for at least 12 months
- [ ] Non-HTML resource coverage verified:
  - [ ] Embedded resources with search/link value (images, video, documents/PDFs) that appear in the URL manifest have their redirect or keep outcomes verified
- [ ] Priority route set (from `validation/priority-routes.json`) receives individual verification:
  - [ ] Each priority URL's outcome is manually spot-checked in addition to automated gate
  - [ ] Any mismatch between expected and actual outcome on a priority URL is a blocking defect
- [ ] Gate outputs are machine-readable, archived as CI artifacts, and committed:
  - [ ] `validation/url-parity-report.json` — per-URL outcome: URL, expected status, actual status, pass/fail
  - [ ] `validation/redirect-quality-report.json` — per-redirect-URL: legacy URL, hop count, final destination, chain/loop flag, topic-equivalence annotation
- [ ] CI integration:
  - [ ] `npm run check:url-parity` is updated or confirmed to use `validation/expected-url-outcomes.json` as input
  - [ ] Both report files are uploaded as CI artifacts with `retention-days: 30`
  - [ ] Gate is wired as a blocking step in `.github/workflows/deploy-pages.yml`

---

### Tasks

- [ ] Confirm `validation/expected-url-outcomes.json` from RHI-084 is available and schema is understood
- [ ] Update or create `scripts/phase-8/check-url-parity.js` (or extend existing `npm run check:url-parity`):
  - [ ] Read `validation/expected-url-outcomes.json`
  - [ ] For each `keep` entry: check `public/` for the page at the exact path (index.html or equivalent)
  - [ ] For each `merge` entry: verify Hugo alias file is present and resolves to correct target in one hop
  - [ ] For each `retire` entry: verify no file exists at the legacy path (should 404)
  - [ ] Output `validation/url-parity-report.json` with per-URL results
  - [ ] Exit with non-zero code on any blocking failure
- [ ] Update or create `scripts/phase-8/check-redirect-quality.js`:
  - [ ] Parse Hugo alias redirect files to detect chain candidates (alias pointing to another alias)
  - [ ] Verify all redirect destination pages exist in `public/` or are themselves valid keep-URLs
  - [ ] Flag any redirect to homepage or a generic index without an explicit approval annotation in the manifest
  - [ ] Output `validation/redirect-quality-report.json`
  - [ ] Exit with non-zero code on any blocking failure
- [ ] Verify non-HTML resource outcomes:
  - [ ] Identify any image, video, PDF, or JS/CSS URLs in the manifest
  - [ ] Confirm each has the correct outcome (not silently missing)
- [ ] Run full URL parity and redirect quality gates against the RC build:
  - [ ] Record pass/fail per gate; archive reports as CI artifacts
  - [ ] All blocking failures must be resolved before this ticket can be closed
- [ ] Spot-check all priority routes from `validation/priority-routes.json`:
  - [ ] Use `curl -I` to verify status codes and `Location` headers
  - [ ] Record results in the redirect quality report or a separate spot-check log
- [ ] Update `.github/workflows/deploy-pages.yml`:
  - [ ] Ensure both URL parity and redirect quality gates run as blocking steps before the deploy job
  - [ ] Ensure report artifacts are uploaded with 30-day retention
- [ ] Add `package.json` scripts:
  - [ ] `"check:url-parity:p8": "node scripts/phase-8/check-url-parity.js"`
  - [ ] `"check:redirect-quality": "node scripts/phase-8/check-redirect-quality.js"`

---

### Out of Scope

- Fixing content or redirect logic in the Hugo site (changes require an RC re-cut per the protocol in RHI-084)
- SEO indexing checks (covered by RHI-086)
- Changing the redirect architecture decision (frozen in Phase 6)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-083 Done — Phase 8 Bootstrap complete | Ticket | Pending |
| RHI-084 Done — RC frozen, `validation/expected-url-outcomes.json` committed | Ticket | Pending |
| Hugo production build of RC exits 0 | Build | Pending |
| `migration/url-manifest.json` frozen at `phase-6-redirect-map-v1` | Phase | Pending |
| Phase 7 `npm run check:url-parity` and `npm run check:redirect-chains` scripts available | Phase | Pending |

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

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

---

### Notes

- The distinction between Phase 6/7 URL parity gates and this Phase 8 gate is scope and evidence level. Phase 6/7 gates verified the gate existed and passed at the build level. Phase 8 WS-B generates a signed-off, archived evidence report against the specific RC that will go to production. The evidence must name the RC commit SHA.
- Any redirect that resolves to the homepage or a generic category index for an unrelated retired URL is treated as a soft-404 risk by Google. These are blocking unless the SEO owner signs off with a documented rationale in the manifest `reason` field.
- The 12-month redirect retention policy (from `analysis/plan/details/phase-6.md`) must be confirmed: redirect files generated by Hugo aliases will remain as long as the Hugo source files retain `aliases:` front matter. Document where the policy is enforced.
- Reference: `analysis/plan/details/phase-8.md` §Workstream B: URL Parity and Redirect Integrity Gates
