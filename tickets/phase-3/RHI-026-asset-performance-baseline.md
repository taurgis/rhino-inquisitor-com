## RHI-026 · Workstream G — Asset and Performance Baseline

**Status:** Open  
**Priority:** Medium  
**Estimate:** M  
**Phase:** 3  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-03  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Define and enforce asset management policies and Core Web Vitals targets before content migration imports a large and potentially unoptimized media set. Establishing image strategy, asset budgets, and Lighthouse CI automation now prevents performance and layout-shift debt that is expensive to remediate retroactively. The initial scaffold should meet good-threshold CWV targets on representative templates so that Phase 4 content import does not unknowingly degrade them.

---

### Acceptance Criteria

- [ ] Image strategy policy is documented and implemented in `docs/migration/RUNBOOK.md` or a dedicated `docs/migration/ASSET-POLICY.md`:
  - [ ] Responsive image generation approach (Hugo's `resources.Process` / Markdown image syntax / shortcode)
  - [ ] Modern format targets (`webp` as default; `avif` as progressive enhancement where Hugo extended supports it)
  - [ ] Explicit width and height attributes on `<img>` elements to prevent layout shift (CLS)
  - [ ] Fallback behavior for images without explicit dimensions documented
- [ ] Asset budget limits are defined per template class and documented:
  - [ ] Total JS budget (target: ≤ 50 KB uncompressed; no framework hydration by default)
  - [ ] CSS budget (target: ≤ 30 KB uncompressed)
  - [ ] Image weight guideline per page (suggested: ≤ 500 KB aggregate per page)
- [ ] JavaScript usage policy: no client-side framework hydration without documented justification; any script added to scaffold must be reviewed and documented
- [ ] Lighthouse CI configuration (`lighthouserc.js` or `.lighthouserc.json`) exists and:
  - [ ] Targets representative template URLs from the scaffold build
  - [ ] Enforces Core Web Vitals thresholds:
    - [ ] LCP ≤ 2.5s
    - [ ] INP ≤ 200ms (or FID if INP is not supported by tooling version)
    - [ ] CLS ≤ 0.1
  - [ ] Runs against locally served `public/` content (no live URL dependency)
- [ ] Lighthouse CI passes on the scaffold (with placeholder/minimal content):
  - [ ] LCP, CLS, and INP targets met on homepage template
  - [ ] LCP, CLS, and INP targets met on article template
- [ ] No uncontrolled third-party scripts are included in the scaffold build output
- [ ] `@lhci/cli` is referenced in `package.json` as a dev dependency and in scripts as `npm run check:perf`

---

### Tasks

- [ ] Document image strategy in `docs/migration/ASSET-POLICY.md`:
  - [ ] Responsive image approach using Hugo image processing pipeline or Markdown syntax
  - [ ] `webp` as the default output format for Hugo-processed images
  - [ ] Explicit `width` and `height` attribute requirement for CLS prevention
  - [ ] Note that `avif` is available in Hugo extended if build performance allows
- [ ] Document asset budget table in `docs/migration/ASSET-POLICY.md`:
  - [ ] JS budget: ≤ 50 KB uncompressed (no hydration framework)
  - [ ] CSS budget: ≤ 30 KB uncompressed
  - [ ] Image per-page weight guideline
- [ ] Review scaffold templates from RHI-023 for any unintended JS or CSS inclusions; remove or document any third-party script
- [ ] Ensure all `<img>` references in scaffold templates include `width` and `height` attributes or are generated through a Hugo partial that enforces them
- [ ] Install `@lhci/cli` as a dev dependency: `npm install @lhci/cli --save-dev --save-exact`
- [ ] Create Lighthouse CI config (`lighthouserc.js` or `.lighthouserc.json`):
  - [ ] Set `collect.url` to representative scaffold pages (homepage, sample article, sample category)
  - [ ] Set `assert` thresholds for LCP, CLS, and INP
  - [ ] Configure `startServerCommand` to serve `public/` locally (e.g. `npx http-server public`)
- [ ] Add `"check:perf": "lhci autorun"` to `package.json` scripts
- [ ] Build scaffold with sample representative content (one post, one page, one category)
- [ ] Run `npm run check:perf` — confirm all CWV thresholds pass
- [ ] Document any threshold failures with root cause and fix in Progress Log
- [ ] Commit `docs/migration/ASSET-POLICY.md`, Lighthouse CI config, and `package.json` changes

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
| RHI-019 Done — Phase 3 Bootstrap complete | Ticket | Pending |
| RHI-023 Done — Template scaffold committed (templates needed for Lighthouse runs) | Ticket | Pending |
| RHI-015 Outcomes — `@lhci/cli` approved in tooling list | Ticket | Pending |
| Hugo extended binary (required for image processing) | Tool | Pending |
| Node.js runtime for `@lhci/cli` | Tool | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Lighthouse CI fails on scaffold due to minimal/no content (no real render to measure) | Medium | Low | Use representative fixture content with placeholder images; CWV metrics on a minimal page should easily pass targets | Engineering Owner |
| `avif` generation slows down CI builds | Low | Low | Make `avif` output optional; default to `webp` only; document as a build-time trade-off | Engineering Owner |
| Asset budget enforced by policy only, not automated check | Medium | Medium | Add a file-size assertion step alongside Lighthouse CI that checks `public/` JS and CSS bundle sizes; escalate to automated if budget is exceeded | Engineering Owner |
| INP threshold not measurable in Lighthouse lab environment | Medium | Low | Use FID as proxy for lab measurement; note INP is a field-data metric; document limitation in `ASSET-POLICY.md` | Engineering Owner |

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

- `docs/migration/ASSET-POLICY.md` — image strategy and asset budget
- Lighthouse CI config (`lighthouserc.js` or `.lighthouserc.json`)
- `package.json` updated with `check:perf` script and `@lhci/cli` dev dependency

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- Core Web Vitals targets use the good-threshold values: LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms. These are 75th-percentile targets — field data may differ from lab data, but the scaffold should comfortably meet them since it has minimal content.
- No client-side JavaScript framework should be added to the scaffold without documented justification. The site is static; Hugo handles all templating server-side.
- Reference: `analysis/plan/details/phase-3.md` §Workstream G: Asset and Performance Baseline; https://web.dev/vitals/
