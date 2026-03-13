# Phase 6 Redirect Architecture Decision Record

Status: Accepted by owner-approved exception  
Date: 2026-03-13  
Related ticket: `analysis/tickets/phase-6/RHI-062-redirect-architecture-decision.md`

## Decision

Select Model A as the final launch redirect posture: Hugo remains the main system, with canonical content, explicit `url` routing, and Hugo `aliases` used as the committed redirect mechanism on GitHub Pages. This decision is an explicit owner-approved exception to the Phase 5 baseline that previously treated an edge redirect layer as mandatory before launch.

## Context

Phase 6 requires a committed redirect architecture before WS-C and WS-I can proceed. The required trigger evaluation based on `migration/url-manifest.json` is:

- Total in-scope legacy URLs: `1212`
- Indexed URLs: `336`
- Changed indexed URLs: `141`
- Change rate: `41.96%`
- `merge` rows: `140`
- `retire` rows: `877`
- Redirect rows with external links: `1`

The ticket formula is:

`indexed_urls = count(disposition == keep OR has_organic_traffic == true)`

`changed_indexed_urls = count(indexed_urls where disposition != keep)`

`change_rate = changed_indexed_urls / indexed_urls * 100`

By that formula, Model B is triggered because `41.96%` exceeds the approved `5%` threshold. Phase 5 also produced a redirect signal matrix that resolves the effective implementation layer needed under GitHub Pages constraints:

- Effective implementation split: `541 edge-cdn`, `1 pages-static`, `670 none`
- Query-string edge-owned rows: `525`
- Non-query edge-owned rows: `16`
- Edge-owned `wp-content/uploads` compatibility rows: `122`
- Query-string retire rows requiring request-aware not-found behavior in the validation artefact: `402`

GitHub Pages capability constraints remain unchanged:

- GitHub Pages is static hosting and does not provide repository-native arbitrary per-path HTTP `301` or `308` redirect management.
- GitHub Pages can handle host and protocol consolidation only within its documented custom-domain and HTTPS controls.
- Hugo `aliases` generate client-side HTML redirect helper pages with meta refresh and canonical tags, not true origin-level `301`, `308`, or `410` responses.

## Options evaluated

### Option 1: Model A — GitHub Pages plus Hugo aliases only

Mechanism:

- Hugo content files and explicit `url` front matter remain the route source of truth.
- Hugo `aliases` provide redirect helper pages for alias-eligible moved routes.
- GitHub Pages custom-domain and HTTPS settings handle host and protocol consolidation where supported.

Pros:

- Keeps Hugo as the main system.
- Avoids introducing an external edge dependency into the launch path.
- Keeps redirect behavior closer to repository-managed content and front matter.
- Simplifies cutover ownership and reduces infrastructure breadth.

Cons:

- Does not provide deterministic per-path HTTP `301` or `308` semantics.
- Cannot provide explicit `410` responses for retirement policy.
- Cannot faithfully reproduce request-aware query-string redirect handling through Hugo aliases.
- Leaves a material gap against the prior Phase 5 edge-mandatory baseline.

### Option 2: Model B — Edge redirect layer in front of GitHub Pages

Mechanism:

- GitHub Pages serves the canonical Hugo origin.
- An edge layer enforces per-path HTTP redirects and optional `410` responses.
- Hugo aliases act, at most, as fallback or preview-host support.

Pros:

- Strongest migration signal for changed indexed URLs.
- Supports true request-aware redirect behavior for query-string and similar legacy routes.
- Aligns with the original Phase 5 baseline and Phase 6 plan.

Cons:

- Adds operational complexity and a second system of redirect truth.
- Increases drift risk between edge rules and Hugo alias destinations.
- Moves redirect management partially out of Hugo and GitHub Pages.

### Option 3: Hybrid — Edge for some routes, Hugo aliases for others

Mechanism:

- Some route classes remain edge-owned while others rely on Hugo aliases.

Pros:

- Reduces edge surface while preserving stronger handling for complex routes.

Cons:

- Preserves most of the operational complexity of Model B.
- Increases ambiguity and drift risk unless route-class boundaries are enforced perfectly.
- Does not satisfy the owner goal of keeping Hugo as the main system.

## Decision rationale

Model A is accepted by explicit owner exception even though the quantitative triggers and prior Phase 5 baseline favored Model B.

The accepted rationale is:

1. Hugo remains the preferred main system for the migration launch posture.
2. The owner prefers repository-native redirect behavior and simpler operational ownership over adding an external edge redirect dependency before launch.
3. The owner accepts the weaker redirect semantics and the resulting legacy-route limitations as an explicit launch risk.

Rejected rationale summary:

- Model B was rejected because it adds a second operational control plane and moves redirect authority away from Hugo as the main system.
- Hybrid was rejected because it keeps much of the same complexity and does not materially simplify governance compared with Model B.

## GitHub Pages capability constraints

This ADR does not change the underlying platform constraints:

1. GitHub Pages does not provide repository-configured arbitrary per-path HTTP `301` or `308` redirect rules.
2. Hugo aliases remain client-side redirect helpers rather than HTTP status redirects.
3. Explicit `410` handling is not available in a Pages-only redirect posture.
4. Preview-host validation can prove Hugo render and alias-helper behavior, but it cannot prove true edge-style redirect semantics.

## Risk acceptance

Named owner: Thomas Theunen  
Roles: SEO Owner, Engineering Owner  
Decision date: 2026-03-13

Accepted risks:

1. Moved legacy URLs will rely on meta-refresh alias behavior instead of true HTTP `301` or `308` responses where URL preservation is not handled by direct route preservation.
2. Retired routes cannot serve explicit `410` responses under the final launch posture.
3. Query-string and other request-aware legacy routes documented as edge-owned in Phase 5 cannot be fully reproduced by Hugo aliases alone.
4. The effective Phase 5 edge-owned scope remains a known limitation under this exception:
   - `541` effective edge-owned rows in the Phase 5 signal matrix
   - `525` query-string edge-owned rows
   - `402` query-string retire rows requiring request-aware not-found behavior in the Phase 5 validation report
5. Search engines may treat the client-side redirects as weaker and slower consolidation signals than true server-side permanent redirects.

Accepted mitigation strategy:

1. Preserve all `keep` URLs directly wherever possible so redirects are only needed for the reduced moved set.
2. Keep one-hop destination alignment strict between Hugo aliases, canonicals, sitemap URLs, and internal links.
3. Treat unsupported query-string and request-aware legacy routes as explicit launch risks, not hidden implementation gaps.
4. Carry this exception into WS-C, WS-I, and later validation work so no downstream ticket assumes edge semantics are available.

## Implementation impact

### WS-C impact

WS-C must treat Hugo as the only committed redirect implementation surface:

1. Preserve explicit `url` front matter for all `keep` routes.
2. Add `aliases` only for alias-eligible moved routes.
3. Do not implement a required edge ruleset as part of the launch posture.
4. Record the unsupported query-string and request-aware legacy routes as known exception scope instead of pretending alias coverage exists for them.
5. Keep alias destinations aligned exactly with final canonical destinations to avoid chain and canonical-conflict regressions.

### WS-I impact

WS-I must assume there is no edge override layer available for launch or rollback:

1. Remove any assumption that rollback option 3 relies on edge override rules.
2. Focus rollback planning on previous-site re-enable and emergency Hugo or content-patch paths.
3. Expand manual verification to sample the unsupported query-string and request-aware legacy routes as accepted-risk checks.
4. Record that preview-host or static-host validation cannot prove true HTTP redirect semantics because those semantics are intentionally not part of the final posture.

## Communication

The decision is communicated to the dependent workstreams as follows:

- WS-C owner notified through this ADR and the RHI-062 ticket Progress Log on 2026-03-13.
- WS-I owner notified through this ADR and the RHI-062 ticket Progress Log on 2026-03-13.

Because Thomas Theunen is also the current WS-C and WS-I owner, repository-owner acknowledgement and downstream notification are recorded together.

## Sign-off

| Role | Name | Status | Date |
| --- | --- | --- | --- |
| SEO Owner | Thomas Theunen | Approved | 2026-03-13 |
| Engineering Owner | Thomas Theunen | Approved | 2026-03-13 |

## References

- `analysis/tickets/phase-6/RHI-062-redirect-architecture-decision.md`
- `analysis/plan/details/phase-6.md`
- `migration/phase-5-seo-contract.md`
- `migration/phase-5-redirect-signal-matrix.csv`
- `migration/reports/phase-5-redirect-validation.csv`
- `analysis/tickets/phase-6/RHI-065-hugo-route-preservation-alias-integration.md`
- `analysis/tickets/phase-6/RHI-071-cutover-readiness-rollback-design.md`
