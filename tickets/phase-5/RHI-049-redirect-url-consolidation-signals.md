## RHI-049 · Workstream B — Redirect and URL Consolidation Signals

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 5  
**Assigned to:** SEO Owner  
**Target date:** 2026-04-14  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Validate that every URL disposition in `url-manifest.json` results in a correct, chain-free redirect outcome and that the redirect mechanism for each URL class is documented and implemented. Hugo `aliases` produce client-side meta-refresh redirect pages, not server-side HTTP 301/308 responses. This distinction is architecturally significant and must be understood, documented, and either accepted or escalated before launch.

Migration traffic equity depends on correct redirect signals. A redirect chain adds an unnecessary hop and dilutes link equity. A redirect to the homepage for unrelated content is a broad irrelevant redirect that Google treats as a soft-404. This workstream closes both gaps by making redirect correctness a verifiable release gate.

---

### Acceptance Criteria

- [ ] `migration/phase-5-redirect-signal-matrix.csv` is committed and contains, for every URL in `url-manifest.json` with `disposition: merge` or `disposition: retire`:
  - [ ] `legacy_url` — original WordPress path
  - [ ] `target_url` — final destination (or `null` for retire-to-404)
  - [ ] `redirect_code` — `301`, `308`, `meta-refresh`, or `none`
  - [ ] `implementation_layer` — `pages-static`, `edge-cdn`, `dns`, or `none`
  - [ ] `chain_count` — number of additional hops after the first legacy-to-target redirect (must be 0)
  - [ ] `loop_detected` — boolean (must be `false`)
  - [ ] `broad_redirect_risk` — boolean (flags redirects to homepage or unrelated content)
- [ ] Redirect validation script `scripts/seo/check-redirects.js` exists and:
  - [ ] Reads `url-manifest.json` and `public/` output
  - [ ] Checks all `merge` URLs have a corresponding alias redirect file or edge rule documented
  - [ ] Detects redirect chains (any legacy URL whose target is itself a redirect source)
  - [ ] Detects redirect loops
  - [ ] Detects broad redirects to homepage (`/`) for non-homepage legacy content
  - [ ] Validates that `retire` disposition URLs do not resolve to thin soft-404 pages
  - [ ] Produces `migration/reports/phase-5-redirect-validation.csv` with per-URL results
  - [ ] Exits with non-zero code on any chain, loop, or broad-redirect defect
  - [ ] Is referenced in `package.json` as `npm run check:redirects:seo`
- [ ] Redirect mechanism is documented per URL class in `migration/phase-5-redirect-signal-matrix.csv`:
  - [ ] `keep` URLs: confirm they render at exact preserved route, no redirect needed
  - [ ] `merge` URLs: confirm redirect mechanism (`pages-static` Hugo alias or `edge-cdn`)
  - [ ] `retire` URLs: confirm `404` response behavior (not routed to homepage)
- [ ] Escalation trigger assessed using explicit formula and edge redirect layer decision is documented:
  - [ ] `indexed_urls = count(disposition == "keep" OR has_organic_traffic == true)`
  - [ ] `changed_indexed_urls = count(indexed_urls where disposition != "keep")`
  - [ ] `change_rate = changed_indexed_urls / indexed_urls * 100`
  - [ ] If `change_rate > 5`, edge redirect layer decision is documented
- [ ] Zero redirect chains detected on `merge` disposition URLs in release candidate
- [ ] Zero redirect loops detected
- [ ] Zero broad irrelevant redirects to homepage for unrelated content

---

### Tasks

- [ ] Review `url-manifest.json` for all `merge` and `retire` disposition records:
  - [ ] Count total `merge` URLs and verify `target_url` is set and non-null
  - [ ] Count total `retire` URLs and verify `target_url` is `null` or mapped to 404 behavior
  - [ ] Calculate `change_rate = changed_indexed_urls / indexed_urls * 100` against Phase 1 indexed inventory baseline — flag if `change_rate > 5`
- [ ] Build `migration/phase-5-redirect-signal-matrix.csv`:
  - [ ] For each `merge` URL: record `redirect_code`, `implementation_layer`, `chain_count`, `loop_detected`, `broad_redirect_risk`
  - [ ] For each `retire` URL: record disposition outcome, confirm no homepage catch-all
- [ ] Create `scripts/seo/check-redirects.js`:
  - [ ] Read manifest and resolve all `merge` targets
  - [ ] Traverse chain: follow each `target_url` until it is a `keep` record or an external URL
  - [ ] Record additional chain hops beyond the first redirect; fail on any additional hops > 0
  - [ ] Detect cycles; fail on any loop
  - [ ] Flag any `target_url` that equals `/` for non-homepage sources
  - [ ] Write per-URL results to `migration/reports/phase-5-redirect-validation.csv`
- [ ] Verify Hugo alias files are generated for all `pages-static` mechanism URLs after a local build
- [ ] Assess edge redirect escalation trigger using explicit formula: if `change_rate > 5`, document the decision to add an edge redirect layer before launch
- [ ] Add `"check:redirects:seo": "node scripts/seo/check-redirects.js"` to `package.json`
- [ ] Integrate `check:redirects:seo` as a blocking step in the deploy CI workflow
- [ ] Document redirect mechanism decision (static aliases vs edge layer) in Progress Log with owner sign-off

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
| RHI-047 Done — Phase 5 Bootstrap complete | Ticket | Pending |
| RHI-004 Done — URL classification and disposition mapping | Ticket | Pending |
| RHI-013 Done — Phase 2 route and redirect contract | Ticket | Pending |
| RHI-036 Done — Phase 4 URL preservation and redirect integrity | Ticket | Pending |
| `migration/url-manifest.json` with 100% disposition and `implementation_layer` coverage | Phase | Pending |

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- `migration/phase-5-redirect-signal-matrix.csv`
- `scripts/seo/check-redirects.js`
- `migration/reports/phase-5-redirect-validation.csv`
- `package.json` updated with `check:redirects:seo` script
- CI workflow updated with `check:redirects:seo` blocking gate
- Edge redirect escalation decision documented in Progress Log

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- Hugo `aliases` generate redirect HTML pages using `<meta http-equiv="refresh">`. They are NOT server-sent HTTP 301/308 responses. Googlebot handles them, but they are operationally weaker than true server-side redirects — particularly for large redirect sets or high-value moved URLs. Document the chosen mechanism explicitly.
- The 5% threshold for edge redirect escalation is a hard policy gate from `analysis/plan/details/phase-5.md`. Do not defer this decision to launch week — it has architecture implications for Phase 6.
- Reference: `analysis/plan/details/phase-5.md` §Workstream B: Redirect and URL Consolidation Signals, §Critical Corrections
