## RHI-054 · Workstream G — Mobile-First and Core Web Vitals Controls

**Status:** Open  
**Priority:** High  
**Estimate:** M  
**Phase:** 5  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-22  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Establish lab-based performance quality gates for representative page templates using Lighthouse CI, and confirm mobile parity for content, metadata, and structured data across all templates. Prevent discoverability regressions caused by performance debt introduced during the migration.

Google uses mobile-first indexing: the mobile version of a page determines its indexing quality, ranking signals, and Core Web Vitals assessment. A template that looks correct on desktop but has missing content, hidden metadata, or poor LCP on mobile can silently reduce index quality. This workstream makes mobile parity and lab performance a machine-verified gate before launch.

---

### Acceptance Criteria

- [ ] Lighthouse CI is configured (`lighthouserc.js` or equivalent) with:
  - [ ] Target URLs: homepage, one representative article, one category page
  - [ ] Assertions:
    - [ ] `first-contentful-paint` ≤ 3000ms (lab budget, not field target)
    - [ ] `largest-contentful-paint` ≤ 4000ms (lab budget — field target is ≤ 2.5s; lab budget is relaxed)
    - [ ] `cumulative-layout-shift` ≤ 0.1
    - [ ] `interactive` ≤ 5000ms
    - [ ] Performance score ≥ 75 (warn below; block below 60)
    - [ ] Accessibility score ≥ 80 (coordinate with WS-I RHI-056)
  - [ ] Is referenced in `package.json` as `npm run check:perf`
  - [ ] CI integration: runs against a locally served `public/` build
- [ ] Mobile parity validation is completed for representative templates:
  - [ ] Primary page content (article body, category listing) is visible on mobile without interaction
  - [ ] All meta tags (`<title>`, canonical, OG, description) are present in mobile HTML output
  - [ ] Structured data (`BlogPosting`, `WebSite`) is present in mobile HTML output
  - [ ] No content is hidden behind mobile-specific lazy-load patterns that block crawlers
- [ ] Image handling for Core Web Vitals:
  - [ ] Hero/featured images on article templates have explicit `width` and `height` attributes
  - [ ] `loading="lazy"` is NOT applied to above-the-fold hero images (prevents LCP regression)
  - [ ] Images use responsive `srcset` with multiple sizes where media volume is significant
- [ ] JS budget is enforced:
  - [ ] Total JS payload on article and category pages ≤ 50 KB (uncompressed) for a mostly-static site
  - [ ] No JavaScript frameworks loaded solely for metadata or layout logic
- [ ] `npm run check:perf` produces a Lighthouse report and fails CI if assertions are not met

---

### Tasks

- [ ] Install and configure `@lhci/cli`:
  - [ ] Create `lighthouserc.js` with assertions for the LCP, CLS, FCP, TTI, performance score, and accessibility score thresholds
  - [ ] Configure CI to serve the built `public/` directory locally during Lighthouse checks
  - [ ] Set target URL list: homepage, one article, one category page
- [ ] Audit Hugo templates for mobile parity issues:
  - [ ] Check `layouts/_default/baseof.html` for responsive viewport meta tag (`<meta name="viewport">`)
  - [ ] Check article single template for hero image `width`/`height` attribute presence
  - [ ] Check whether `loading="lazy"` is applied to hero images (remove if above-the-fold)
  - [ ] Verify that responsive `srcset` is used on high-impact images
- [ ] Run initial Lighthouse audit on the scaffold (even without full content):
  - [ ] Record baseline scores in Progress Log
  - [ ] Identify and fix any performance issues in templates before content load
- [ ] Verify mobile metadata parity:
  - [ ] Use Chrome DevTools mobile emulation to confirm metadata is present in mobile rendered output
  - [ ] Document findings in Progress Log
- [ ] Verify no runtime JS framework is loaded on static pages
- [ ] Add `"check:perf": "lhci autorun"` to `package.json`
- [ ] Integrate `check:perf` in the CI workflow with explicit pass/fail gating on the defined assertions
- [ ] Document any acceptable deviations from targets (e.g., image-heavy pages) with rationale in Progress Log

---

### Out of Scope

- Field CWV (real-user measurements) — not measurable until the site is live; tracked via Search Console in Phase 9
- Full responsive design implementation (covered in Phase 3 template scaffolding)
- Font-loading optimization (deferred to post-launch unless it causes a blocking CLS issue)
- Server-side performance optimization (not applicable — static site)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-047 Done — Phase 5 Bootstrap complete | Ticket | Pending |
| RHI-023 Done — Phase 3 template scaffolding (complete HTML output for Lighthouse to scan) | Ticket | Pending |
| RHI-026 Done — Phase 3 asset and performance baseline established | Ticket | Pending |
| `@lhci/cli` available in `package.json` | Tool | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Lighthouse lab scores fail due to image assets not yet migrated (Phase 4 still running) | High | Medium | Run initial Lighthouse on scaffold template only; assess template-level performance; re-run full check after Batch 1 (RHI-043) is merged | Engineering Owner |
| Hero images missing `width`/`height` causing CLS ≥ 0.1 | High | High | Add explicit dimensions to image shortcodes in Hugo templates as a Phase 3 corrective action before LHCI assertion | Engineering Owner |
| `loading="lazy"` on LCP hero image causing LCP ≥ 4000ms | Medium | High | Remove `loading="lazy"` from first image in article template; apply only to below-fold images | Engineering Owner |
| LHCI server/local-serve setup fails in CI environment | Low | Medium | Test CI local-serve configuration in a branch before enforcing as blocking gate | Engineering Owner |

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

- `lighthouserc.js` with assertions for representative templates
- `package.json` updated with `check:perf` script
- CI workflow updated with `check:perf` blocking gate
- Mobile parity validation notes recorded in Progress Log
- Lighthouse baseline scores recorded in Progress Log

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- Lighthouse CI (LHCI) is a lab tool, not a substitute for field CWV. Lab scores have a known divergence from field data. Do not use Lighthouse scores to make launch/no-launch decisions about CWV — use them as a regression budget: if lab scores pass, the template is not regressing. Field CWV will be monitored in Phase 9 via Search Console.
- The CLS target (≤ 0.1) is particularly important for post layouts where images, fonts, or embeds load asynchronously and shift content. Verify CLS in the browser DevTools Layout Shift panel, not just from Lighthouse.
- Reference: `analysis/plan/details/phase-5.md` §Workstream G: Mobile-First and Core Web Vitals Controls
