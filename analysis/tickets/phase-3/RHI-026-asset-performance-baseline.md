## RHI-026 · Workstream G — Asset and Performance Baseline

**Status:** Done  
**Priority:** Medium  
**Estimate:** M  
**Phase:** 3  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-03  
**Created:** 2026-03-07  
**Updated:** 2026-03-09

---

### Goal

Define and enforce asset management policies and Core Web Vitals targets before content migration imports a large and potentially unoptimized media set. Establishing image strategy, asset budgets, and Lighthouse CI automation now prevents performance and layout-shift debt that is expensive to remediate retroactively. The initial scaffold should meet good-threshold CWV targets on representative templates so that Phase 4 content import does not unknowingly degrade them.

---

### Acceptance Criteria

- [x] Image strategy policy is documented and implemented in `docs/migration/ASSET-POLICY.md`:
  - [x] Responsive image generation approach uses a repo-owned Hugo partial backed by `resources.Process`
  - [x] Modern format target is `webp` by default; AVIF is documented as a deferred enhancement only after toolchain validation
  - [x] Explicit width and height attributes on `<img>` elements prevent layout shift (CLS)
  - [x] Fallback behavior for images without explicit dimensions is documented
- [x] Asset budget limits are defined per template class and documented:
  - [x] Total JS budget (target: ≤ 50 KB uncompressed; no framework hydration by default)
  - [x] CSS budget (target: ≤ 30 KB uncompressed)
  - [x] Image weight guideline per page (suggested: ≤ 500 KB aggregate per page)
- [x] JavaScript usage policy documents that no client-side framework hydration is allowed without explicit justification and review
- [x] Lighthouse CI configuration (`lighthouserc.json`) exists and:
  - [x] Targets representative template URLs from the scaffold build
  - [x] Enforces lab thresholds aligned to the ticket intent:
    - [x] LCP ≤ 2.5s
    - [x] TBT ≤ 200ms as the lab proxy for the INP ≤ 200ms field target
    - [x] CLS ≤ 0.1
  - [x] Runs against locally served `public/` content with `collect.staticDistDir` (no live URL dependency)
- [x] Lighthouse CI passes on the scaffold (with placeholder/minimal content):
  - [x] Homepage template passed: LCP 755ms, CLS 0, TBT 0ms
  - [x] Article template passed: LCP 903ms, CLS 0, TBT 0ms
- [x] No uncontrolled third-party scripts are included in the scaffold build output
- [x] `@lhci/cli` is referenced in `package.json` as a dev dependency and in scripts as `npm run check:perf`

---

### Tasks

- [x] Document image strategy in `docs/migration/ASSET-POLICY.md`:
  - [x] Responsive image approach uses a Hugo image partial backed by local page resources
  - [x] `webp` is the default output format for Hugo-processed images
  - [x] Explicit `width` and `height` attributes are required for CLS prevention
  - [x] AVIF is documented as a deferred enhancement rather than a Phase 3 baseline requirement
- [x] Document asset budget table in `docs/migration/ASSET-POLICY.md`:
  - [x] JS budget: ≤ 50 KB uncompressed (no hydration framework)
  - [x] CSS budget: ≤ 30 KB uncompressed
  - [x] Image per-page weight guideline
- [x] Review scaffold templates from RHI-023 for unintended JS or CSS inclusions; no uncontrolled third-party scripts were found
- [x] Ensure scaffold `<img>` references are generated through a Hugo partial that enforces `width` and `height`
- [x] Install `@lhci/cli` as a dev dependency: `npm install @lhci/cli --save-dev --save-exact`
- [x] Create Lighthouse CI config (`lighthouserc.json`):
  - [x] Set `collect.url` to representative scaffold pages (homepage, sample article, sample category)
  - [x] Set `assert` thresholds for LCP, CLS, and TBT-as-INP-proxy
  - [x] Configure `collect.staticDistDir` to serve `public/` locally for this static site
- [x] Add `check:perf` to `package.json` scripts
- [x] Add `check:perf:budget` to `package.json` scripts for representative-page asset enforcement
- [x] Build scaffold with sample representative content (one post, one page, one category)
- [x] Run `npm run check:perf` — confirm all thresholds pass
- [x] No threshold failures were encountered; results were recorded in the Progress Log
- [x] Commit-ready artifact set includes `docs/migration/ASSET-POLICY.md`, `lighthouserc.json`, `package.json`, fixture content, and supporting template/script changes

---

### Out of Scope

- Full media asset import from WordPress (Phase 4)
- Final CSS design and theming (post-Phase 4)
- Image CDN or external media hosting decisions (deferred unless build times require it)
- Paid performance monitoring or field data tools

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-019 Done — Phase 3 Bootstrap complete | Ticket | Resolved |
| RHI-023 Done — Template scaffold committed (templates needed for Lighthouse runs) | Ticket | Resolved |
| RHI-015 Outcomes — `@lhci/cli` approved in tooling list | Ticket | Resolved |
| Hugo extended binary (required for image processing) | Tool | Resolved |
| Node.js runtime for `@lhci/cli` | Tool | Resolved |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Lighthouse CI fails on scaffold due to minimal/no content (no real render to measure) | Medium | Low | Use representative fixture content with placeholder images; keep the route set deterministic and scaffold-owned | Engineering Owner |
| `avif` generation slows down CI builds | Low | Low | Make `avif` output optional; default to `webp` only; document as a build-time trade-off | Engineering Owner |
| Asset budget enforced by policy only, not automated check | Medium | Medium | Keep `check:perf:budget` alongside Lighthouse CI so representative-page JS, CSS, image budgets, and `<img>` dimensions are enforced locally | Engineering Owner |
| INP threshold not measurable in Lighthouse lab environment | Medium | Low | Use TBT as the lab proxy; keep INP as the field target and document the distinction in `ASSET-POLICY.md` | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Implemented a deterministic Phase 3 performance baseline with representative fixture content, a repo-owned asset policy, local budget enforcement, and Lighthouse CI over the built static scaffold.

**Delivered artefacts:**

- `docs/migration/ASSET-POLICY.md` — image strategy and asset budget
- `lighthouserc.json` — local static-output Lighthouse CI configuration
- `scripts/check-perf-budget.js` — representative-page asset budget and markup enforcement
- `package.json` updated with `build:prod`, `check:perf:budget`, and `check:perf`
- `src/layouts/partials/media/image.html` — centralized scaffold image path with dimension-safe output
- Fixture content under `src/content/posts/phase-3-performance-baseline/` and `src/content/pages/scaffold-readiness/`

**Deviations from plan:**

- Used `collect.staticDistDir` instead of `startServerCommand` because the scaffold is a static site and Lighthouse CI officially recommends static-dist collection for that case.
- Used TBT as the lab proxy for the INP field target because Lighthouse does not measure real INP in lab runs.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-09 | Done | Added `docs/migration/ASSET-POLICY.md`, fixture content, `scripts/check-perf-budget.js`, `lighthouserc.json`, and `check:perf`; validated with passing Hugo build, budget audit, and Lighthouse CI (`/` LCP 755ms, `/phase-3-performance-baseline/` LCP 903ms, `/category/platform/` LCP 753ms; CLS 0 and TBT 0ms on all three routes) |

---

### Notes

- Core Web Vitals targets use the good-threshold values: LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms. These are field targets at the 75th percentile; Phase 3 lab gating uses TBT as the local proxy for INP.
- No client-side JavaScript framework should be added to the scaffold without documented justification. The site is static; Hugo handles all templating server-side.
- Reference: `analysis/plan/details/phase-3.md` §Workstream G: Asset and Performance Baseline; https://web.dev/articles/vitals/; https://googlechrome.github.io/lighthouse-ci/docs/configuration.html#staticdistdir; https://developer.chrome.com/docs/lighthouse/performance/lighthouse-total-blocking-time/
