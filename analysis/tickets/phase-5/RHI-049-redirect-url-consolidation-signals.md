## RHI-049 · Workstream B — Redirect and URL Consolidation Signals

**Status:** Done  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 5  
**Assigned to:** SEO Owner  
**Target date:** 2026-04-14  
**Created:** 2026-03-07  
**Updated:** 2026-03-13

---

### Goal

Validate that every URL disposition in `url-manifest.json` results in a correct, chain-free redirect outcome and that the redirect mechanism for each URL class is documented and implemented. Hugo `aliases` produce client-side meta-refresh redirect pages, not server-side HTTP 301/308 responses. This distinction is architecturally significant and must be understood, documented, and either accepted or escalated before launch.

Migration traffic equity depends on correct redirect signals. A redirect chain adds an unnecessary hop and dilutes link equity. A redirect to the homepage for unrelated content is a broad irrelevant redirect that Google treats as a soft-404. This workstream closes both gaps by making redirect correctness a verifiable release gate.

---

### Acceptance Criteria

- [x] `migration/phase-5-redirect-signal-matrix.csv` is committed and contains the required redirect signal fields for every manifest route, including all `merge` and `retire` URLs plus `keep` rows for class-level completeness:
  - [x] `legacy_url` — original WordPress path
  - [x] `target_url` — final destination (or `null` for retire-to-404)
  - [x] `redirect_code` — `301`, `308`, `meta-refresh`, or `none`
  - [x] `implementation_layer` — `pages-static`, `edge-cdn`, `dns`, or `none`
  - [x] `chain_count` — number of additional hops after the first legacy-to-target redirect (must be 0)
  - [x] `loop_detected` — boolean (must be `false`)
  - [x] `broad_redirect_risk` — boolean (flags redirects to homepage catch-alls)
- [x] Redirect validation script `scripts/seo/check-redirects.js` exists and:
  - [x] Reads `url-manifest.json` and `public/` output
  - [x] Checks all `merge` URLs have a corresponding alias redirect file or edge rule documented in the matrix/report output
  - [x] Detects redirect chains (any legacy URL whose target is itself a redirect source)
  - [x] Detects redirect loops
  - [x] Detects broad redirects to homepage (`/`) for non-homepage legacy content
  - [x] Validates that `retire` disposition URLs either produce no generated artifact or are documented as edge-layer not-found cases for query-string variants
  - [x] Produces `migration/reports/phase-5-redirect-validation.csv` with per-URL results
  - [x] Exits with non-zero code on any chain, loop, broad-redirect, or implementation defect
  - [x] Is referenced in `package.json` as `npm run check:redirects:seo`
- [x] Redirect mechanism is documented per URL class in `migration/phase-5-redirect-signal-matrix.csv`:
  - [x] `keep` URLs: confirm they remain exact-route, no-redirect entries in the matrix
  - [x] `merge` URLs: confirm redirect mechanism (`pages-static` Hugo alias or `edge-cdn`)
  - [x] `retire` URLs: confirm `404` behavior for path routes and documented edge-layer handling for query-string retire cases
- [x] Escalation trigger assessed using explicit formula and edge redirect layer decision is documented:
  - [x] `indexed_urls = count(disposition == "keep" OR has_organic_traffic == true)`
  - [x] `changed_indexed_urls = count(indexed_urls where disposition != "keep")`
  - [x] `change_rate = changed_indexed_urls / indexed_urls * 100`
  - [x] Current manifest baseline is `42.86%` (`144 / 336`), so the previously approved edge redirect layer decision remains mandatory before launch
- [x] Zero redirect chains detected on `merge` disposition URLs in release candidate
- [x] Zero redirect loops detected
- [x] Zero broad irrelevant redirects to homepage for unrelated content

---

### Tasks

- [x] Review `url-manifest.json` for all `merge` and `retire` disposition records:
  - [x] Count total `merge` URLs and verify `target_url` is set and non-null (`140` total)
  - [x] Count total `retire` URLs and verify `target_url` is `null` or mapped to explicit not-found behavior (`880` total)
  - [x] Calculate `change_rate = changed_indexed_urls / indexed_urls * 100` against the current indexed inventory baseline and retain the edge redirect escalation verdict (`42.86%`, `144 / 336`)
- [x] Build `migration/phase-5-redirect-signal-matrix.csv`:
  - [x] For each `merge` URL: record `redirect_code`, `implementation_layer`, `chain_count`, `loop_detected`, `broad_redirect_risk`
  - [x] For each `retire` URL: record disposition outcome and confirm no homepage catch-all
- [x] Create `scripts/seo/check-redirects.js`:
  - [x] Read manifest and resolve all `merge` targets
  - [x] Traverse chain: follow each `target_url` until it is a `keep` record or an external URL
  - [x] Record additional chain hops beyond the first redirect; fail on any additional hops > 0
  - [x] Detect cycles; fail on any loop
  - [x] Flag any `target_url` that equals `/` for non-homepage sources
  - [x] Write per-URL results to `migration/reports/phase-5-redirect-validation.csv`
- [x] Verify Hugo alias files are generated for all `pages-static` mechanism URLs after a local build (`1` path-based merge URL on the current manifest; `123` query-style merge URLs are documented as edge-layer requirements)
- [x] Assess edge redirect escalation trigger using explicit formula and record that the approved edge-layer requirement remains in force before launch
- [x] Add `"check:redirects:seo": "node scripts/seo/check-redirects.js"` to `package.json`
- [x] Integrate `check:redirects:seo` as a blocking step in the deploy CI workflow and the route-sensitive PR build workflow
- [x] Document redirect mechanism decision (static aliases vs edge layer) in Progress Log with current validation evidence

---

### Out of Scope

- Implementing the edge redirect infrastructure (Phase 6 scope, RHI-062+)
- JavaScript-only redirect implementations (disallowed by Phase 5 policy)
- Redirect analytics and monitoring (Workstream J, RHI-057)
- Rewriting the `url-manifest.json` disposition decisions (Phase 1/4 scope)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-047 Done — Phase 5 Bootstrap complete | Ticket | Verified |
| RHI-004 Done — URL classification and disposition mapping | Ticket | Verified |
| RHI-013 Done — Phase 2 route and redirect contract | Ticket | Verified |
| RHI-036 Done — Phase 4 URL preservation and redirect integrity | Ticket | Verified |
| `migration/url-manifest.json` with 100% disposition and `implementation_layer` coverage | Phase | Verified |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Hugo `aliases` produce meta-refresh pages, not true HTTP 301/308 — may be insufficient for high-value moved URLs | High | High | Assess each `merge` URL against Phase 1 SEO baseline traffic and backlink data; escalate to edge redirect layer if any high-value URL is in scope | SEO Owner |
| URL change rate exceeds 5% (`change_rate = changed_indexed_urls / indexed_urls * 100`), triggering mandatory edge redirect decision | Medium | High | Run change-rate calculation at task start using explicit indexed-URL formula; communicate escalation decision to Phase 6 owner by Day 4 to avoid Phase 6 timeline delay | SEO Owner |
| Redirect chains introduced by multi-hop `merge` paths in manifest | Low | High | The chain detection script catches this; fix manifest records before release | Engineering Owner |
| `retire` URLs silently resolving to 200 OK on Hugo's 404 fallback behavior | Medium | Medium | Verify 404 handling in Hugo config; confirm retired URLs return true 404 in local build | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-049 is complete. The repo now has a dedicated Phase 5 redirect signal gate, a committed redirect signal matrix, and a validation report that distinguishes static Pages alias coverage from edge-only redirect and retire cases under the approved GitHub Pages constraints.

**Delivered artefacts:**

- `migration/phase-5-redirect-signal-matrix.csv`
- `scripts/seo/check-redirects.js`
- `migration/reports/phase-5-redirect-validation.csv`
- `package.json` updated with `check:redirects:seo` script
- `.github/workflows/deploy-pages.yml` updated with `check:redirects:seo` as a blocking gate and report artifact upload
- `.github/workflows/build-pr.yml` updated with `check:redirects:seo` for route-sensitive PR validation and report artifact upload
- `analysis/documentation/phase-5/rhi-049-redirect-url-consolidation-signals-implementation-2026-03-13.md`
- Current edge redirect escalation decision documented in Progress Log using the refreshed manifest baseline (`42.86%`, `144 / 336`)

**Deviations from plan:**

- The redirect signal matrix includes `keep` rows in addition to the required `merge` and `retire` rows so the Phase 5 artifact documents all three URL outcome classes in one place.
- Query-string `merge` and `retire` rows are recorded as `edge-cdn` implementation requirements in the Phase 5 matrix because GitHub Pages artifacts cannot represent query-aware alias behavior directly.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-13 | In Progress | Reviewed the existing migration redirect checks, the Phase 2 route and redirect contract, Hugo/GitHub Pages official docs, and the current manifest distribution. Confirmed the previous migration validator was deferring edge-sensitive rows and was not producing the Phase 5 matrix/report deliverables required by this ticket. |
| 2026-03-13 | In Progress | Added `scripts/seo/check-redirects.js`, which writes `migration/phase-5-redirect-signal-matrix.csv` and `migration/reports/phase-5-redirect-validation.csv`, computes explicit chain and loop results, and records the effective implementation layer required under GitHub Pages constraints for each redirect-sensitive manifest row. |
| 2026-03-13 | Done | Ran `npm run build:prod && npm run check:url-parity && npm run check:redirects:seo && npm run check:metadata && npm run check:seo:artifact && npm run check:links`. Results: `0` redirect failures, `0` chains, `0` loops, `0` broad homepage redirects, `1212` matrix rows, `1020` redirect validation rows, `541` edge-layer rows, `1` Pages alias row, and a refreshed change-rate baseline of `42.86%` (`144 / 336`), which keeps the approved edge redirect requirement in force before launch. |

---

### Notes

- Hugo `aliases` generate redirect HTML pages using `<meta http-equiv="refresh">`. They are NOT server-sent HTTP 301/308 responses. Googlebot handles them, but they are operationally weaker than true server-side redirects — particularly for large redirect sets or high-value moved URLs. Document the chosen mechanism explicitly.
- The 5% threshold for edge redirect escalation is a hard policy gate from `analysis/plan/details/phase-5.md`. The current manifest baseline is now `42.86%` (`144 / 336`), so edge redirect infrastructure remains mandatory before launch.
- Reference: `analysis/plan/details/phase-5.md` §Workstream B: Redirect and URL Consolidation Signals, §Critical Corrections
