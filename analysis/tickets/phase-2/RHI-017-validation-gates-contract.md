## RHI-017 · Validation Gates Contract Definition

**Status:** Done  
**Priority:** High  
**Estimate:** M  
**Phase:** 2  
**Assigned to:** Migration Owner  
**Target date:** 2026-03-21  
**Created:** 2026-03-07  
**Updated:** 2026-03-09

---

### Goal

Define all seven validation gates that Phase 3 and subsequent phases must implement, so that engineers know exactly what each gate checks, what a pass/fail looks like, and which phase is responsible for implementing and running it. Gates defined here are not implemented in Phase 2 — they are specified. Phase 3 implements them; Phase 8 verifies them as launch-readiness criteria.

Without a precise validation gate specification, Phase 3 build and CI tooling will be written without a clear target, and Phase 8 launch-readiness checks will lack an objective pass/fail standard. This ticket is also the authoritative source for the CI gate requirements referenced in `analysis/plan/details/phase-2.md` §Required Validation Gates.

---

### Acceptance Criteria

- [x] All seven validation gates are defined in Outcomes with gate ID, scope, hard pass condition, hard fail consequence, implementation phase, execution frequency, named entry point or tool, blocking level, required evidence artifact, and upstream contract references:
  - [x] **Gate 1 — URL Parity Gate** covers `keep`, `merge`, and `retire` outcomes from `migration/url-manifest.json`, plus the pagination pre-condition from `migration/pagination-priority-manifest.json`
  - [x] **Gate 2 — Redirect Correctness Gate** verifies direct legacy-to-final resolution, approved redirect mechanism by environment, and rejection of irrelevant mass redirects
  - [x] **Gate 3 — SEO Gate** enforces the RHI-014 metadata, canonical, Open Graph, sitemap-membership, and JSON-LD obligations for indexable templates
  - [x] **Gate 4 — Link Integrity Gate** separates blocking internal and asset checks from advisory-in-CI external-link checks, with a fixed tool choice
  - [x] **Gate 5 — Build Integrity Gate** uses the approved Hugo production build contract, verifies draft/future/expired exclusion, and defines deterministic-build evidence
  - [x] **Gate 6 — Deployment Integrity Gate** verifies the RHI-016 workflow contract, artifact constraints, and post-deploy Pages settings checks required before cutover
  - [x] **Gate 7 — Launch Readiness Gate** is defined as the manual/live sign-off gate for robots, sitemap, feed continuity, social preview, and unintended production `noindex`
- [x] For each gate, the primary entry point or tool contract is identified even though implementation is deferred to later phases
- [x] For each gate, the responsible implementation phase is confirmed, including where live post-deploy checks move from CI into Phase 7 or Phase 8
- [x] For each gate, CI-blocking, deploy-blocking, launch-blocking, or advisory-only status is documented explicitly
- [x] Pagination priority manifest (`migration/pagination-priority-manifest.json`) is recorded as a hard pre-condition for Gate 1 implementation and execution on pagination routes
- [x] The tightened validation checklist from `analysis/plan/details/phase-2.md` §Tightened Validation Checklist is mapped to gates and evidence artifacts in Outcomes
- [x] Validation gate contract is recorded in Outcomes, documented in `analysis/documentation/phase-2/rhi-017-validation-gates-contract-2026-03-09.md`, and referenced from `analysis/plan/details/phase-2.md`

---

### Tasks

- [x] Review `analysis/plan/details/phase-2.md` §Required Validation Gates and §Tightened Validation Checklist against the completed RHI-011, RHI-012, RHI-013, RHI-014, and RHI-016 contracts
- [x] Draft a specification for each of the seven gates covering:
  - Gate name and ID
  - What it checks
  - Pass condition (specific, binary)
  - Fail condition and consequence (CI/deploy/launch blocking or advisory)
  - Implementation phase (`3`, `7`, `8`, or combined where live-state checks are required)
  - Owning script or tool contract (`npm run check:url-parity`, `npm run check:seo`, etc.)
  - Execution frequency (every CI build, release-candidate deploy, or launch only)
  - Evidence artifact or run URL required for later sign-off
- [x] Define Gate 1 (URL Parity) in detail:
  - Inputs: `migration/url-manifest.json`, `migration/pagination-priority-manifest.json`, and `public/`
  - Logic: every manifest entry must validate to exactly one approved outcome (`keep`, `merge`, or `retire`) with environment-aware handling for Pages-only fallback vs. live edge behavior
  - Script contract: `scripts/check-url-parity.js` exposed as `npm run check:url-parity` in Phase 3
  - Blocking: CI-blocking and deploy-blocking
- [x] Define Gate 3 (SEO) in detail:
  - Inputs: built HTML files in `public/`, sitemap output, and template classification derived from front matter and path rules
  - Logic: assert the required metadata, canonical, Open Graph, JSON-LD, and sitemap-membership rules from RHI-014
  - Script contract: `scripts/check-seo.js` exposed as `npm run check:seo` in Phase 3
  - Blocking: CI-blocking and deploy-blocking
- [x] Resolve Gate 4 (Link Integrity) tooling:
  - Tool choice fixed to a custom Node script to stay within the approved Node toolchain and avoid adding an unapproved dependency in Phase 3
  - Internal link and asset checks are CI-blocking
  - External link checks are advisory in CI and launch-blocking in Phase 8
- [x] Map each item in the tightened validation checklist to a gate and evidence artifact
- [x] Identify the `package.json` script stubs Phase 3 must add for each automated gate
- [x] Confirm all gates are implementable within the Hugo + Pages + Node contract already approved in Phase 2
- [x] Record the approved gate specifications in Outcomes
- [x] Update `analysis/plan/details/phase-2.md` §Required Validation Gates with RHI-017 as the detailed contract reference

---

### Out of Scope

- Implementing any validation script (Phase 3)
- Running any gate against production or staging (Phase 3 and Phase 8)
- Defining monitoring or alerting post-launch (Phase 9)
- Writing GitHub Actions workflow steps for gates (Phase 3)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-010 Done — Phase 2 kickoff confirmed | Ticket | Done |
| RHI-011 Done — Hugo output directory and build command confirmed | Ticket | Done |
| RHI-012 Done — content model defines what constitutes a valid indexable page | Ticket | Done |
| RHI-013 Done — redirect contract defines expected redirect behavior for Gate 1 and Gate 2 | Ticket | Done |
| RHI-014 Done — SEO contract defines the pass criteria for Gate 3 | Ticket | Done |
| RHI-016 Done — deployment contract defines the pass criteria for Gate 6 | Ticket | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| `migration/pagination-priority-manifest.json` is not populated before Gate 1 implementation begins | Medium | High | Keep the manifest as an explicit pre-condition in the contract and carry it forward into Phase 3 and RHI-018 sign-off checks | Migration Owner |
| Live-state checks for custom domain, DNS, and HTTPS are treated as repo-only CI checks | Medium | High | Keep Gate 6 split between CI-static validation and Phase 7 live Pages-settings verification; keep Gate 7 as the launch-only manual/live gate | Engineering Owner |
| Gate outputs are not retained as evidence, weakening Phase 8 auditability | Medium | Medium | Require each automated gate to emit a named JSON or Markdown report, or a workflow run URL, and reference that evidence in Outcomes and later sign-off tickets | Migration Owner |
| Gate logic drifts from upstream contracts in later phases | Low | High | Record upstream contract references per gate so Phase 3, Phase 7, and Phase 8 can reconcile against RHI-011 through RHI-016 instead of reinterpreting the rules | Migration Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Completed. RHI-017 is now the approved validation-gates contract for Phase 3 CI scaffolding, Phase 7 release-candidate checks, and Phase 8 launch sign-off.

Approved implementation contract:

| Gate | Name | What it checks | Hard pass condition | Fail consequence | Implementation phase | Entry point or tool | Execution frequency | Blocking level | Evidence required | Upstream contract(s) |
|------|------|----------------|---------------------|------------------|----------------------|--------------------|--------------------|----------------|------------------|----------------------|
| G1 | URL Parity | Every manifest entry validates to exactly one approved rendered outcome | For every entry in `migration/url-manifest.json`: `keep` target exists in `public/`; `merge` target exists and a legacy alias helper exists at the old path; `retire` has no built page or alias at the retired path and is marked for live `404` or `410` behavior. Pagination entries are checked only when `migration/pagination-priority-manifest.json` is populated. | Block CI and deploy; do not promote a release candidate | 3 | `scripts/check-url-parity.js` -> `npm run check:url-parity` | Every CI production build | CI-blocking, deploy-blocking | `reports/url-parity.json` with totals, failures, and per-URL disposition results | RHI-012, RHI-013 |
| G2 | Redirect Correctness | Redirect behavior matches the approved contract for the active environment | Every `merge` URL resolves directly to its final target in one step with no chains; no retired URL redirects to homepage or unrelated content; Pages-only validation accepts Hugo alias helpers that point straight to the final canonical target; launch validation expects the live routing layer to match the approved behavior for that environment, which is HTTP `301` or `308` when the mandatory edge layer is active. | Block deploy for CI or release-candidate failures; block launch if live routing fails | 3, 7 | `scripts/check-redirect-correctness.js` -> `npm run check:redirects` | Every CI build for artifact-level checks; full live run on release candidate | CI-blocking, launch-blocking | `reports/redirect-correctness.json` plus release-candidate run URL | RHI-013, RHI-016 |
| G3 | SEO | Indexable pages emit the required SEO metadata and schema contract | Every indexable page has non-empty `<title>` and `<meta name="description">`, absolute HTTPS canonical and `og:url` derived from `.Permalink`, Open Graph baseline (`og:title`, `og:description`, `og:type`, `og:url`, `og:image`), and the correct JSON-LD family from RHI-014. Article pages must emit valid parseable `BlogPosting` JSON-LD with `headline`, `image`, `datePublished`, `dateModified`, and `author`. Homepage must emit `WebSite`. Pages that are non-indexable must not appear in the sitemap. Recommended title and description length ranges are recorded as warnings, not blocking thresholds. | Block CI and deploy | 3 | `scripts/check-seo.js` -> `npm run check:seo` | Every CI production build | CI-blocking, deploy-blocking | `reports/seo-audit.json` with per-template counts and failures | RHI-012, RHI-014 |
| G4 | Link Integrity | Generated site links and referenced assets resolve correctly | Internal links and same-site asset references across generated HTML return expected built targets with zero broken references. External link checks run in a separate mode with retries and timeouts; CI records failures as advisory, but Phase 8 launch sign-off requires zero unresolved critical external-link failures on the release candidate. Tool choice is fixed to a custom Node validator to stay within the approved toolchain and avoid adding an unapproved dependency. | Internal or asset failures block CI and deploy; unresolved critical external failures block launch | 3, 8 | `scripts/check-links.js` -> `npm run check:links` and `npm run check:links:external` | Internal and asset scan on every CI build; external scan on CI as advisory and again before launch | CI-blocking for internal/assets, advisory in CI for external, launch-blocking for external | `reports/link-integrity-internal.json` and `reports/link-integrity-external.json` | RHI-014, RHI-015 |
| G5 | Build Integrity | Hugo production build contract and determinism hold | Build uses `HUGO_VERSION=0.157.0` and `hugo --gc --minify --environment production`; exit code is `0`; output excludes draft, future, and expired content; two clean builds from the same commit produce identical normalized file-hash manifests for `public/` after excluding filesystem metadata. | Block CI and deploy | 3 | `npm run build:prod` and `scripts/check-build-integrity.js` -> `npm run check:build` | Every CI production build | CI-blocking, deploy-blocking | Build log plus `reports/build-integrity.json` and normalized hash manifest | RHI-011, RHI-012, RHI-016 |
| G6 | Deployment Integrity | Workflow, artifact, and Pages deployment contract are correct | Workflow YAML uses the approved Pages action majors and order, `needs`, `environment: github-pages`, minimum permissions, and deploy concurrency rules from RHI-016; Pages artifact is derived from `./public`, satisfies official structure constraints, contains top-level `index.html`, contains no symbolic or hard links, and remains within the approved planning thresholds. Before DNS cutover, live Pages settings confirm the custom domain is saved in Pages settings or API and not dependent on a committed `CNAME` file. | Block deploy or cutover | 3, 7 | `scripts/check-deploy-integrity.js` -> `npm run check:deploy`, plus workflow run review and Pages settings verification | Every CI build for static workflow and artifact checks; Phase 7 before cutover for Pages settings verification | CI-blocking, cutover-blocking | `reports/deploy-integrity.json`, workflow run URL, and Pages settings evidence | RHI-015, RHI-016 |
| G7 | Launch Readiness | Live launch sign-off conditions that cannot be fully proven from repo state | Manual or live verification confirms `robots.txt` is reachable and matches the approved policy, `sitemap.xml` is reachable on the canonical host, canonical feed continuity is preserved at `/feed/`, representative homepage/article/category pages show the expected indexability state, and social preview output is acceptable in the chosen debuggers. No unintended production page carries `noindex`. | Block launch | 8 | Phase 8 runbook and sign-off checklist | Launch rehearsal and launch window | Launch-blocking | `migration/phase-8-launch-readiness-checklist.md` or successor sign-off artifact with links to gate evidence | RHI-013, RHI-014, RHI-016 |

Phase 3 script stub contract:

| Gate | Phase 3 script or command stub |
|------|-------------------------------|
| G1 | `npm run check:url-parity` |
| G2 | `npm run check:redirects` |
| G3 | `npm run check:seo` |
| G4 | `npm run check:links` and `npm run check:links:external` |
| G5 | `npm run build:prod` and `npm run check:build` |
| G6 | `npm run check:deploy` |
| G7 | No npm stub required; launch checklist and live verification workflow only |

Gate-specific clarifications:

- Gate 1 pre-condition: `migration/pagination-priority-manifest.json` must be populated before pagination URLs can be treated as passing or failing parity. Until then, the validator must fail closed on unresolved pagination rows instead of silently skipping them.
- Gate 2 environment rule: CI validates Pages artifact behavior and alias helper correctness; launch-time validation checks the active live layer. Because RHI-013 already determined the edge threshold is exceeded, live launch validation expects server-side status-code redirects once the edge layer is active.
- Gate 3 threshold rule: non-empty metadata is blocking; length heuristics remain reportable warnings because RHI-014 recorded them as recommendations rather than hard pass or fail boundaries.
- Gate 4 tool choice: custom Node script is approved because RHI-015 did not approve any dedicated link-checking package and the repo already standardizes on the Node toolchain.
- Gate 5 determinism method: compare a normalized checksum manifest of `public/` from two clean builds of the same commit; filesystem timestamps and artifact packaging metadata are excluded from comparison.
- Gate 6 live-state rule: custom-domain configuration, DNS readiness, and HTTPS readiness are not provable from repository state alone and therefore remain split between Gate 6 live Pages checks and Gate 7 launch validation.

Tightened validation checklist mapping:

| Checklist item from `analysis/plan/details/phase-2.md` | Gate coverage | Evidence |
|--------------------------------------------------------|---------------|----------|
| Every legacy URL maps to exactly one of same-path output, intentional redirect target, or explicit retire behavior | G1 | `reports/url-parity.json` |
| No irrelevant mass redirects without content equivalence | G2 | `reports/redirect-correctness.json` |
| Canonical URLs are absolute and consistent with rendered paths | G3 | `reports/seo-audit.json` |
| No unintended `noindex`, draft, or future content appears in production output | G3, G5, G7 | `reports/seo-audit.json`, `reports/build-integrity.json`, launch checklist |
| Structured data validates on representative templates | G3 | `reports/seo-audit.json` |
| robots and sitemap are intentionally generated and internally consistent | G3, G7 | `reports/seo-audit.json`, launch checklist |
| Deployment workflow uses official Pages actions and documented permissions | G6 | `reports/deploy-integrity.json` and workflow run URL |

Phase ownership and sequencing decisions:

- Phase 3 owns the first implementation of G1 through G6.
- Phase 7 reruns live-state portions of G2 and G6 on the release candidate before cutover.
- Phase 8 owns G7 and consumes the evidence outputs from G1 through G6 as launch sign-off inputs.

**Delivered artefacts:**

- Validation gate specification matrix with seven gates, blocking levels, tool contracts, and evidence outputs
- Tightened checklist-to-gate mapping and evidence matrix
- Updated `analysis/plan/details/phase-2.md` §Required Validation Gates
- Documentation note: `analysis/documentation/phase-2/rhi-017-validation-gates-contract-2026-03-09.md`

**Deviations from plan:**

- Gate 4 tooling is no longer an open evaluation item; the contract now fixes a custom Node validator so Phase 3 does not reopen package-selection scope.
- Gate 6 is explicitly split between static CI validation and live Pages-settings confirmation because custom-domain and HTTPS readiness depend on external GitHub Pages state rather than repository contents alone.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-09 | In Progress | Reconciled the draft ticket against the completed RHI-011, RHI-012, RHI-013, RHI-014, and RHI-016 contracts, plus official Hugo and GitHub Pages documentation, to eliminate vague or conflicting gate language |
| 2026-03-09 | In Progress | Fixed the Gate 4 tool decision to a custom Node validator, split Gate 6 into CI-static and live Pages checks, and defined evidence outputs for every automated gate so Phase 8 can audit release-candidate results |
| 2026-03-09 | Done | Approved validation-gates contract recorded in Outcomes; checklist mapping, blocking levels, script stub names, and implementation phase ownership are now locked for Phase 3 and Phase 8 |

---

### Notes

- Gates must be implementable within the approved Hugo + GitHub Pages + Node toolchain. If a later phase needs a new dependency or external service to satisfy a gate, that is a contract amendment and not an implementation detail.
- The URL parity gate remains the highest-value automated gate because it is the first proof that no approved URL was silently lost during generation.
- Script names in Outcomes are now the canonical Phase 3 stub names; later phases should not rename them casually because they become audit anchors for Phase 7 and Phase 8 evidence.
- No owner clarification was required to complete this ticket: the remaining Gate 4 tool decision was resolved by the already-approved RHI-015 tooling contract and the repository preference to avoid unnecessary new dependencies.
- Reference: `analysis/plan/details/phase-2.md` §Required Validation Gates, §Tightened Validation Checklist

