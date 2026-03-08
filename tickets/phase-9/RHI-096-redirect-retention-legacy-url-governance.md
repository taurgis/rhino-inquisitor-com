## RHI-096 · Workstream C — Redirect Retention and Legacy URL Governance

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 9  
**Workstream:** WS-C  
**Assigned to:** Engineering Owner + SEO Owner  
**Target date:** 2026-07-29  
**Created:** 2026-03-08  
**Updated:** 2026-03-08

---

### Goal

Ensure all legacy URL dispositions defined in Phase 6 (`migration/url-manifest.json`) resolve correctly in production, maintain redirect records for moved URLs for a minimum of 12 months, and actively reduce redirect debt (chains, loops, unresolved routes) throughout the stabilization window. Redirect integrity is a direct SEO signal-transfer mechanism: unresolved legacy routes destroy link equity and create soft-404 patterns that confuse Google's indexing pipeline.

---

### Acceptance Criteria

**Launch day:**
- [ ] All `keep` URLs in `url-manifest.json` return HTTP 200 with correct content on the live host
- [ ] All `merge` URLs return HTTP 301 resolving in a single hop to the target URL on the live host
- [ ] All `retire` URLs return HTTP 404 or HTTP 410 (not 200, not soft-404 to homepage) on the live host
- [ ] No redirect chains (two or more hops) exist in any priority-route redirect
- [ ] No redirect loops detected in any sampled legacy URL
- [ ] `monitoring/legacy-route-health-report.json` populated with initial post-launch state

**Week 1 (daily checks):**
- [ ] Priority legacy URL set checked daily for any new unresolved or mismapped routes
- [ ] Any unresolved route discovered is assigned an explicit disposition update and owner same day
- [ ] Redirect chain depth policy checked; any chain discovered is treated as Sev-2
- [ ] Daily findings recorded in `monitoring/legacy-route-health-report.json`

**Week 2 (confirmation):**
- [ ] All priority legacy URLs have approved outcomes with no unresolved gaps
- [ ] No new systemic redirect failure classes appeared in week 2
- [ ] Link-reclamation list started for highest-value inbound links targeting legacy URLs
- [ ] GitHub Pages origin behavior documented: confirm if additional edge-layer uplift is required for headers or redirect types not achievable at origin

**Weeks 3–6 (governance cadence):**
- [ ] Weekly redirect health check run against priority route set
- [ ] Redirect chain reduction progress tracked and improving
- [ ] Redirect retention calendar reviewed: 12-month horizon confirmed for all moved URLs
- [ ] Any edge-layer implementation plan progressed if GitHub Pages-only behavior is insufficient

**Stabilization exit:**
- [ ] Priority legacy URL set has approved, policy-compliant outcomes
- [ ] Redirect chain depth policy is met across all sampled legacy routes
- [ ] Redirect retention plan documented with minimum 12-month horizon
- [ ] Edge-layer escalation decision recorded (implemented or explicitly not needed with rationale)

---

### Tasks

**Launch-day baseline:**
- [ ] Run `npm run check:url-parity` (or equivalent) against live production host; confirm all `keep` URLs return 200
- [ ] Sample-check `merge` routes for correct 301 single-hop behavior using `playwright` or `curl`
- [ ] Sample-check `retire` routes for correct 404/410 behavior
- [ ] Record initial state in `monitoring/legacy-route-health-report.json` with `runTimestamp`, `environment`, `commitSha`, and per-URL outcomes
- [ ] Confirm no broad catch-all redirects to homepage are masking retired URLs as soft-404

**Week 1 daily redirect governance:**
- [ ] Run priority route check daily; log pass/fail per URL
- [ ] Capture any newly discovered unresolved routes; update `url-manifest.json` with disposition update if required
- [ ] Check for redirect chains: no route should require more than one redirect hop
- [ ] Raise Sev-2 for any redirect chain discovered; raise Sev-1 if systemic (5+ priority URLs affected)
- [ ] Compile link-reclamation candidates: identify highest-value inbound external links still pointing to legacy routes

**Week 2 confirmation check:**
- [ ] Run full priority route audit and confirm all have approved outcomes
- [ ] Document GitHub Pages redirect-capability findings: are all required redirect behaviors (e.g., 301, apex→www) achievable at origin, or is an edge-layer required?
- [ ] If edge-layer is required, open a separate implementation ticket and escalate to engineering owner
- [ ] Update link-reclamation list with contact/outreach strategy for top-value external links

**Weeks 3–6 ongoing governance:**
- [ ] Weekly redirect health check; update `monitoring/legacy-route-health-report.json`
- [ ] Review chain-reduction progress; document any chains that could not be collapsed and rationale
- [ ] Confirm redirect retention policy: all moved URLs remain in redirect configuration with 12-month expiry date recorded
- [ ] Document `redirect-retention-calendar.md` with planned review dates and expiry tracking

**At stabilization exit:**
- [ ] Produce final redirect health summary in `monitoring/legacy-route-health-report.json`
- [ ] Document redirect retention calendar with minimum 12-month horizon for each moved URL
- [ ] Record edge-layer escalation outcome

---

### Out of Scope

- Creating net-new redirects not in `url-manifest.json` without explicit disposition review (requires `migration-data.instructions.md` gate)
- Redirect performance optimization beyond chain removal
- Monitoring 404s for brand-new content (not legacy URL scope)
- Link-building or outreach to external sites (can be done post-stabilization)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-093 Done — Phase 9 Bootstrap complete | Ticket | Pending |
| RHI-094 Done — Cutover executed; live host responds | Ticket | Pending |
| Phase 6 frozen URL manifest (`migration/url-manifest.json`) | Phase | Pending |
| Phase 6 redirect architecture decision (`migration/phase-6-redirect-adr.md` or equivalent) | Phase | Pending |
| Hugo aliases and redirect pages deployed in RC (`phase-8-rc-v1`) | Phase | Pending |
| `npm run check:url-parity` script operational against live host | Phase | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| GitHub Pages cannot serve 301 redirects for apex domain (no ALIAS/ANAME record) | Medium | High | Document behavior in Phase 7; if apex redirect is required, edge/proxy layer must be in place at T-0 | Engineering Owner |
| Broad catch-all redirect to homepage masking retired URLs as soft-404 | Low | High | Phase 6/7 contracts forbid this; verify at launch with explicit retired-URL spot-checks | SEO Owner |
| A high-value legacy URL missed in Phase 6 manifest is discovered post-launch | Medium | Medium | Assign explicit disposition via updated `url-manifest.json` (follow migration-data governance gate); implement redirect within same business day | Engineering Owner |
| Redirect chain persists because Hugo alias creates intermediate page | Medium | Medium | Audit Hugo alias output during Phase 8; if chains are found post-launch, update front matter and redeploy | Engineering Owner |
| Inbound high-value external links target legacy routes with no redirect | Low | High | Link-reclamation list captures these; proactive outreach is secondary to ensuring the redirect resolves correctly | SEO Owner |
| Redirect retention lapses before 12 months (config removed in cleanup) | Low | High | Redirect retention calendar reviewed monthly; any planned removal requires SEO owner approval | SEO Owner |

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

- `monitoring/legacy-route-health-report.json` — full redirect health log through stabilization
- `monitoring/redirect-retention-calendar.md` — 12-month horizon plan for moved URLs
- Link-reclamation list for highest-value external inbound links
- Edge-layer escalation decision record (implemented or not needed with rationale)

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | Open | Ticket created |

---

### Notes

- Redirect chains are an active SEO defect, not just a performance concern. Each extra hop in a chain adds latency and reduces signal transfer confidence. Treat any chain as a same-day defect regardless of chain depth.
- Do not use the homepage as a catch-all for retired or unresolved legacy URLs. This creates soft-404 signals where Google sees a 200-OK page with irrelevant content at a URL it expected to be missing or redirected. This is among the most persistent post-migration SEO defects.
- The 12-month redirect retention requirement is a minimum. Redirects for high-value URLs should remain indefinitely unless an explicit expiry decision has been approved and documented.
- Reference: `analysis/plan/details/phase-9.md` §Workstream C: Redirect Retention and Legacy URL Governance, §SEO Implications and Best-Practice Enforcement
