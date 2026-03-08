# Phase 6 Detailed Plan: URL Preservation and Redirect Strategy

## Purpose
Preserve search equity, referral value, and user trust during migration by enforcing deterministic URL outcomes for every legacy route on https://www.rhino-inquisitor.com.

Phase 6 converts URL strategy from documentation into release-blocking engineering controls.

## Why Phase 6 Is High Risk
Migration traffic losses are often caused by redirect and canonical mistakes, not content quality issues.

Highest-risk failure modes:
1. Using GitHub Pages-compatible redirect pages where server-side permanent redirects are required for high-value moved URLs.
2. Redirect chains/loops introduced by mixed host rules (`http`/`https`, apex/`www`, trailing slash drift).
3. Soft-404 behavior from bulk redirecting unrelated legacy URLs to homepage/category roots.
4. Canonical/sitemap/internal-link disagreement that weakens URL consolidation signals.
5. Retired URL handling that is ambiguous, inconsistent, or undocumented.
6. No post-launch redirect telemetry, causing late discovery of crawl/indexing regressions.

## Phase Position and Dependencies
From [main-plan.MD](main-plan.MD), Phase 6 depends on Phases 1, 4, and 5.

Phase 6 consumes:
1. [plan/details/phase-1.md](plan/details/phase-1.md): URL inventory, route classes, keep/merge/retire dispositions.
2. [plan/details/phase-2.md](plan/details/phase-2.md): hosting and architecture constraints (Hugo + GitHub Pages).
3. [plan/details/phase-4.md](plan/details/phase-4.md): migrated content outputs, explicit `url` assignments, alias candidates.
4. [plan/details/phase-5.md](plan/details/phase-5.md): canonical policy, crawl/index rules, and SEO gates.

Phase 6 enables:
1. Phase 7 deployment cutover safety.
2. Phase 8 launch-readiness verification.
3. Phase 9 post-launch stability and recovery.

## Scope
In scope:
1. Final URL invariant policy for production host, protocol, and trailing slash behavior.
2. Complete old-to-new URL mapping with explicit outcomes.
3. Redirect implementation strategy under GitHub Pages constraints.
4. Retirement policy (`404`/`410` intent) and user-friendly error pathway.
5. Redirect quality gates and parity validation automation.
6. Post-launch redirect monitoring and incident response thresholds.
7. Security controls for redirect safety (open redirect prevention, host enforcement).

Out of scope:
1. Bulk content transformation internals (Phase 4).
2. Final DNS record execution (Phase 7).
3. Long-term SEO growth experiments not directly tied to migration stability.

## Non-Negotiable Constraints (Release Blocking)
1. Every legacy URL in scope has one explicit and testable outcome: `keep`, `redirect`, or `retire`.
2. Redirect chains for migration routes are not allowed.
3. Redirect loops are not allowed.
4. Broad fallback redirects to homepage are not allowed for unrelated content.
5. Canonical URL, sitemap URL, and internal-link destination must agree for each indexable target.
6. Redirect destinations must preserve content intent (topic-equivalent outcome).
7. Staging index controls and test hosts must not leak into production canonical/redirect outputs.
8. Redirect behavior and mapping must be frozen before launch window.

## Critical Corrections Applied in This Phase Plan
1. Permanent redirect preference is explicit:
- Search engines prefer server-side permanent redirects (`301`/`308`) as strongest consolidation signals.
- For URL moves, client-side redirects are a fallback when server-side redirects are not technically possible.

2. GitHub Pages capability constraint is explicit:
- GitHub Pages is static hosting and does not provide an in-repo arbitrary per-path server-side redirect rule engine.
- GitHub Pages platform-managed redirects can cover host/protocol consolidation (`http` to `https` when enforced, and apex/`www` redirection with correct custom-domain setup).
- Hugo `aliases` generate static redirect helper pages (meta refresh), not origin-level `301`/`308`.

3. Retirement behavior is explicit:
- Irrelevant mass redirects are treated as soft-404 risk.
- Intentionally removed content needs meaningful not-found behavior and clear policy.

4. Redirect quality is measurable:
- Zero chain/loop tolerance for migration routes.
- Coverage and intent-equivalence checks are required, not optional.

## URL Policy Contract (Final)
Canonical URL invariants:
1. Canonical host: `https://www.rhino-inquisitor.com`.
2. Protocol: HTTPS only in all canonicals and sitemap entries.
3. Path style: lowercase, trailing slash preserved per inventory policy.
4. Query handling: canonical targets must not depend on tracking query parameters.

Route outcome policy:
1. `keep`: route path remains exactly preserved and renders final content directly.
2. `redirect`: route permanently consolidates to one final equivalent destination.
3. `retire`: route returns not-found behavior with helpful navigation, unless mapped replacement is justified.

Host/protocol consolidation policy:
1. `http://` entry points must resolve to `https://`.
2. Apex/non-canonical host must resolve to canonical host.
3. Legacy alternate host variants are documented and tested as migration entry points.

## Redirect Architecture Decision Model
Phase 6 must select and freeze one of the following models before Phase 7 cutover.

Model A: GitHub Pages + Hugo aliases only
1. Mechanism: Hugo-generated alias pages (meta refresh + canonical helper).
2. Pros: simple, repository-native, no extra infra.
3. Cons: instant meta refresh can be interpreted as permanent, but still has lower migration-signal confidence than true server-side `301`/`308`.
4. Allowed when:
- URL change percentage is low.
- High-value backlink-heavy routes are mostly preserved (`keep`).
- Team explicitly accepts client-side redirect semantics for moved routes and documents risk acceptance.

Model B: Edge redirect layer in front of Pages (recommended for medium/high URL churn)
1. Mechanism: CDN/edge worker/router performs `301`/`308` and optional `410` by ruleset.
2. Pros: strongest migration signal control, cleaner diagnostics, deterministic status semantics.
3. Cons: additional operational complexity and maintenance.
4. Required when any trigger is met:
- URL change rate exceeds 5 percent (`change_rate = changed_indexed_urls / indexed_urls * 100`, with `indexed_urls = count(disposition == "keep" OR has_organic_traffic == true)` and `changed_indexed_urls = count(indexed_urls where disposition != "keep")`).
- More than 100 high-value linked legacy URLs require redirects.
- There is a hard requirement for true `301`/`308` and/or explicit `410` responses.

Decision output artifact:
1. `migration/phase-6-redirect-architecture-decision.md`
2. Include chosen model, rationale, constraints, risk acceptance, and owner sign-off.

## GitHub Pages Redirect Capability Baseline
What Pages can do reliably with platform configuration:
1. Redirect apex and `www` variants when DNS and custom-domain setup are correct.
2. Redirect `http` to `https` when `Enforce HTTPS` is enabled.

What Pages should not be assumed to do by itself:
1. Arbitrary per-path `301`/`308` redirect rule management from repository config.
2. Explicit per-path `410` response handling without an additional edge layer.

Implementation consequence:
1. If migration needs deterministic per-path HTTP status behavior at scale, use Model B.
2. If using Model A, use Hugo alias pages and verify outcomes with URL-level tests.

## Workstream A: Legacy URL Inventory Finalization
Goal: lock redirect scope and prevent launch-time unknown URLs.

Tasks:
1. Merge sitemap-derived URLs with analytics landing pages and backlink-derived URLs.
2. Normalize URL forms (protocol/host/case/trailing slash) to route keys.
3. Mark each route with final disposition and target path (if redirect).
4. Add explicit exception notes for legal/privacy/system endpoints.

Validation:
1. No duplicate legacy keys after normalization.
2. No in-scope URL without disposition.
3. No redirect record without target.

Acceptance criteria:
1. URL manifest coverage is 100 percent for in-scope routes.
2. Manifest is versioned and immutable during release freeze except hotfix process.

## Workstream B: Redirect Mapping Specification and Intent Review
Goal: ensure every redirect is semantically appropriate and defensible.

Tasks:
1. Build `old_path -> new_path` mapping table with route class and intent tag.
2. Review `merge` mappings for topic-equivalence and user expectation.
3. Reject convenience redirects that collapse diverse content to generic destinations.
4. Flag ambiguous redirects for editorial or SEO review.

Intent classes:
1. Exact-equivalent content moved.
2. Consolidated equivalent content.
3. Retired content with no equivalent (not-found behavior).

Blocking rules:
1. Homepage redirect for non-home legacy content is blocked unless equivalence is proven.
2. Category-root redirects for dissimilar content are blocked.
3. Multi-hop targets are blocked.

Acceptance criteria:
1. 100 percent of redirect rows have approved intent class.
2. 0 unresolved ambiguous mappings in launch candidate.

## Workstream C: Hugo Route Preservation and Alias Integration
Goal: implement deterministic route rendering and static redirect outputs.

Tasks:
1. Enforce explicit `url` in front matter for preserved paths.
2. Generate `aliases` only for approved moved URLs.
3. Ensure alias pages include immediate redirect and canonical to destination.
4. Validate that sitemap output contains only final canonical destination URLs, not legacy redirect-source URLs.

Critical caveat:
1. Alias pages are static redirect helpers and do not replace server-side permanent redirects where such signals are required.

Acceptance criteria:
1. `keep` URLs resolve as first-class content pages.
2. `redirect` URLs resolve through approved mechanism with no chain.
3. `retire` URLs are not silently remapped.

## Workstream D: Host and Protocol Canonical Consolidation
Goal: prevent authority dilution across host/protocol variants.

Tasks:
1. Configure canonical host policy in templates and sitemap generation.
2. Verify GitHub Pages custom-domain and HTTPS settings enforce expected host/protocol entry behavior.
3. Validate apex versus `www` behavior is consistent with canonical policy.
4. Add checks for accidental canonical leakage to non-production hosts.
5. Verify Search Console property coverage for canonical and redirected host variants.

Acceptance criteria:
1. Canonicals never reference non-canonical host variants.
2. Entry-path tests confirm single canonical endpoint behavior.

## Workstream E: Retirement and Error Path Governance
Goal: retire content safely without soft-404 patterns or user confusion.

Tasks:
1. Define retirement decision rubric:
- redirect only when equivalent replacement exists.
- otherwise return meaningful not-found behavior.
2. Implement high-quality `404` page with search/navigation recovery.
3. Use `404` or `410` for removed content; prefer `410` when permanent removal is certain and technically feasible (typically edge layer on this stack).
4. Maintain audit list of retired URLs and reason codes.

Acceptance criteria:
1. Retired URL outcomes are explicit and documented.
2. No systematic irrelevant redirects to generic pages.

## Workstream F: Security and Privacy Controls for Redirect Logic
Goal: avoid redirect abuse and prevent data leakage.

Controls:
1. Redirect targets must come from static allowlisted map, never user-supplied destination parameters.
2. Enforce same-site destination policy unless explicitly approved cross-domain target exists.
3. Preserve HTTPS destinations; no downgrade redirects.
4. Remove secrets/tokens from logged redirect test artifacts.

Acceptance criteria:
1. Open-redirect patterns are absent by design.
2. Security review sign-off completed before cutover.

## Workstream G: Redirect Observability and Reporting
Goal: make redirect behavior measurable before and after launch.

Pre-launch reports:
1. Coverage report: total legacy URLs vs mapped outcomes.
2. Quality report: chains, loops, unreachable targets, cross-host anomalies.
3. Intent report: non-equivalent redirect candidates.

Post-launch reports:
1. Top unresolved 404/soft-404 candidates.
2. Redirect health trend for high-value legacy routes using available telemetry:
- edge/server logs when Model B is active,
- Search Console indexing/coverage proxies when Model A is active.
3. Canonical mismatch sample on migrated templates.

Acceptance criteria:
1. All required reports generated per release candidate.
2. Incident thresholds are codified with owners.

## Workstream H: CI and Release Gates (Phase 6)
Goal: block deploys that can damage consolidation signals.

Mandatory CI gates:
1. URL manifest completeness gate.
2. Redirect target existence gate.
3. Redirect chain/loop gate.
4. Canonical/redirect/sitemap alignment gate.
5. Retired-route policy gate (no irrelevant fallback redirects).
6. Host/protocol invariant gate.
7. Redirect verification method gate (bulk HTTP checks via scripts; browser checks for sampled routes only).

Blocking thresholds:
1. Missing mapped outcome for in-scope legacy URL: 0 allowed.
2. Redirect chains in migration routes: 0 allowed.
3. Redirect loops: 0 allowed.
4. Canonical target mismatch with final URL: 0 allowed.
5. Redirect target not found: 0 allowed.
6. Non-canonical host in canonical tags/sitemaps: 0 allowed.

## Workstream I: Cutover Readiness and Rollback Design
Goal: execute launch with bounded risk and fast recovery.

Pre-cutover checklist:
1. Redirect architecture decision is signed off.
2. Final redirect map is frozen and version tagged.
3. Representative legacy URLs (top traffic + top backlinks) pass manual verification.
4. Search Console ownership and access continuity confirmed for all relevant host/protocol variants.
5. Rollback trigger criteria agreed and communication path defined.
6. Monitoring expectations are documented:
- old-URL sitemap redirect warnings are expected during transition,
- sitemap submissions use final sitemap URLs directly (do not rely on sitemap-URL redirects),
- success criteria are index shift and error-trend stabilization.
7. Link-update plan is prepared:
- internal links are fully migrated to destination URLs,
- top external referrer/backlink sources are queued for outreach updates.

Rollback triggers:
1. High-value URL failures exceed 5 priority URLs or 2 percent of priority-route sample in first 24 hours.
2. Indexing anomalies show widespread canonical mismatch/soft-404 behavior.
3. Critical route classes (homepage/article/category/privacy) fail parity checks.

Rollback options:
1. Re-enable previous site if operationally available.
2. Apply emergency redirect map patch (priority set).
3. Route traffic through edge override rules while static build is repaired.

## Required Libraries and Tooling (Phase 6)
Required:
1. `fast-glob`
- Discover generated output files and mapping inputs quickly.
2. `fast-xml-parser`
- Parse legacy and generated sitemap feeds for parity checks.
3. `zod`
- Validate redirect map schema and policy fields.
4. `csv-parse` and `csv-stringify`
- Produce deterministic mapping and compliance reports.
5. `cheerio`
- Validate canonical/meta behavior in generated HTML.
6. `undici` (or `node-fetch`)
- Perform deterministic HTTP resolution checks in Node scripts.
7. `p-limit`
- Control concurrency during large redirect verification runs.

Strongly recommended:
1. `playwright`
- Confirm browser-observed redirect outcomes for critical routes.
2. `linkinator` (or equivalent)
- Catch internal links still pointing to legacy or intermediate URLs.
3. `@lhci/cli`
- Ensure redirect/canonical changes do not regress critical page quality metrics.

Optional (if using edge redirect layer):
1. Provider-specific rules validator/CLI.
2. Contract tests for ruleset syntax and precedence.

Anti-patterns:
1. Manual spreadsheet-only redirect operations without schema validation.
2. Multiple conflicting redirect sources of truth.
3. Redirect logic embedded ad hoc in templates without centralized manifest.
4. Launching with unresolved ambiguous mappings.

## Data Contracts and File Artifacts
Primary data contract:
1. `migration/url-map.csv`
- columns: `legacy_url`, `legacy_path`, `route_class`, `disposition`, `target_url`, `intent_class`, `owner`, `notes`.

Generated artifacts:
1. `migration/reports/phase-6-coverage.csv`
2. `migration/reports/phase-6-chains-loops.csv`
3. `migration/reports/phase-6-canonical-alignment.csv`
4. `migration/reports/phase-6-retired-url-audit.csv`
5. `migration/phase-6-cutover-runbook.md`
6. `migration/phase-6-rollback-runbook.md`

## Test Strategy
Automated tests:
1. Mapping schema validation test.
2. Deterministic resolver test for legacy URL outcomes.
3. Canonical alignment test on representative template set.
4. No-chain/no-loop graph test.
5. Route-class sampling test (`post`, `page`, `category`, `video`, `landing`, `system`).
6. Sitemap canonical-only test (final URLs only, fully qualified absolute URLs).

Manual tests (release candidate):
1. Top 100 traffic legacy URLs.
2. Top 100 backlink legacy URLs.
3. Critical legal/system routes (privacy, terms, archives, feed endpoints).
4. Host/protocol variants (`http`, apex, `www`) for core templates.
5. Redirect validation method split:
- command-line/scripted HTTP checks are primary,
- Search Console URL Inspection is supplementary and not the sole redirect validator.

## SEO Implications and Best-Practice Enforcement
1. Redirects are canonicalization signals, not a substitute for content quality alignment.
2. Canonical tags support consolidation but cannot rescue poor redirect mappings.
3. Soft-404 patterns waste crawl budget and delay signal consolidation.
4. Redirect chains dilute crawl efficiency and increase migration uncertainty; although crawlers may follow multiple hops, migration policy still requires direct final routing.
5. Sitemap entries must reference final canonical URLs only.
6. Internal links must be updated to final destinations before launch to reduce redirect dependence.
7. Redirects for changed URLs should remain active for at least 12 months, with priority on long-lived high-link routes.
8. Irrelevant mass redirects (especially to homepage) are migration defects and soft-404 risks.

## Launch-Window Execution Plan
T-7 to T-3 days:
1. Freeze redirect map and run full automated gate suite.
2. Execute manual sampling on critical routes.
3. Validate host/protocol consolidation behavior in production-like environment.

T-2 to T-1 days:
1. Finalize runbooks and on-call ownership.
2. Pre-stage hotfix redirect patch set for highest-risk routes.

T0 (cutover day):
1. Deploy approved release candidate.
2. Run immediate smoke verification for priority legacy URLs.
3. Submit new production sitemap and retain old-URL sitemap monitoring during transition.

T+1 to T+14:
1. Daily review of 404/soft-404 and canonical anomalies.
2. Patch redirect defects in priority order.
3. Confirm stabilization trend before reducing monitoring intensity.

## Deliverables
1. `migration/phase-6-redirect-architecture-decision.md`
2. `migration/url-map.csv`
3. `migration/phase-6-url-policy.md`
4. `migration/phase-6-cutover-runbook.md`
5. `migration/phase-6-rollback-runbook.md`
6. `migration/reports/phase-6-coverage.csv`
7. `migration/reports/phase-6-chains-loops.csv`
8. `migration/reports/phase-6-canonical-alignment.csv`
9. `migration/reports/phase-6-retired-url-audit.csv`

## Definition of Done
Phase 6 is complete only when all statements are true:
1. Legacy URL inventory is complete and every route has an approved outcome.
2. Redirect architecture decision is explicit, approved, and compatible with launch risk profile.
3. URL invariants for host/protocol/path are enforced and tested.
4. Redirect quality gates pass with zero blocking defects.
5. Retirement behavior is policy-compliant with no mass soft-404 pattern.
6. Cutover and rollback runbooks are complete with named owners.
7. Post-launch monitoring thresholds and cadence are operational.

## Exit Gate to Phase 7 and Phase 8
Phase 7 deployment cutover and Phase 8 launch readiness may proceed only if:
1. All Phase 6 mandatory CI gates are green on final candidate.
2. Redirect map is frozen and signed off.
3. Critical route-class manual verification is complete.
4. Rollback path is tested at least once on staging/pre-production process.

## Suggested Timeline (6-9 Working Days)
1. Days 1-2: finalize inventory, mapping specification, and architecture decision.
2. Days 3-4: implement redirect outputs and automated parity gates.
3. Days 5-6: canonical/host/protocol hardening and manual priority-route validation.
4. Days 7-9: launch runbook finalization, drill, and sign-off.

## Official References
Google Search Central and crawling/indexing:
1. https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
2. https://developers.google.com/search/docs/crawling-indexing/301-redirects
3. https://developers.google.com/crawling/docs/troubleshooting/http-status-codes#3xx-redirection
4. https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
5. https://developers.google.com/crawling/docs/crawl-budget
6. https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors#soft-404-errors
7. https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
8. https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap

Search Console:
1. https://support.google.com/webmasters/answer/9012289
2. https://support.google.com/webmasters/answer/9679690
3. https://support.google.com/webmasters/answer/9370220
4. https://support.google.com/webmasters/answer/7451001

GitHub Pages:
1. https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages
2. https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
3. https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

Hugo:
1. https://gohugo.io/content-management/urls/#aliases

HTTP and security guidance:
1. https://www.rfc-editor.org/rfc/rfc9110.html
2. https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html