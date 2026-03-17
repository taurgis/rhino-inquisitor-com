## RHI-078 · Workstream E — SEO-Safe Deployment and Host Consolidation

**Status:** In Progress  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 7  
**Assigned to:** SEO Owner  
**Target date:** 2026-05-27  
**Created:** 2026-03-07  
**Updated:** 2026-03-17

---

### Goal

Verify that SEO deployment behavior is safe on the staging domain `staging.rhino-inquisitor.com` while keeping staging intentionally blocked from indexing. This workstream validates that canonical tags, Open Graph URLs, JSON-LD URLs, sitemap entries, feed links, and internal absolute links all resolve to the staging host over HTTPS, while the staging crawl-state remains `noindex, nofollow` plus `Disallow: /`.

This workstream adds a dedicated Phase 7 host-safety checker and updates the deploy workflow so the blocked staging artifact is validated before deployment. Production host consolidation (`https://www.rhino-inquisitor.com`) remains deferred to the final production cutover ticket after staging sign-off.

---

### Acceptance Criteria

- [x] Project-host rehearsal checks remain safe:
  - [x] The deploy workflow still normalizes the Pages-provided base URL before the rehearsal build.
  - [x] The rehearsal artifact emits `noindex, nofollow`.
  - [x] The project-site path prefix is preserved whenever the configured Pages base URL includes a repository path.
- [x] Staging-host blocked-artifact checks pass locally:
  - [x] `scripts/phase-7/check-seo-safe-deploy.js` validates canonical tags, `og:url`, JSON-LD URLs, sitemap `<loc>` values, feed links, and internal absolute links against `https://staging.rhino-inquisitor.com/`.
  - [x] The checker fails on HTTP, `github.io`, or production-host leaks.
  - [x] The checker supports both `blocked` and `indexable` crawl modes and passes in `blocked` mode for the staging-style artifact.
- [x] Live staging sample routes are self-consistent:
  - [x] Verified on homepage, the three most-recent published posts by front matter date, the first alphabetical category slug, and the archive page.
  - [x] Each sampled route returns `200`, self-canonicalizes on `https://staging.rhino-inquisitor.com/`, emits matching `og:url`, and serves `noindex, nofollow`.
  - [x] No sampled route emits `X-Robots-Tag` headers.
- [x] Live staging host-level files use the staging host exclusively:
  - [x] `robots.txt` serves `User-agent: *`, `Disallow: /`, and `Sitemap: https://staging.rhino-inquisitor.com/sitemap.xml`.
  - [x] `sitemap.xml` sample `<loc>` values use `https://staging.rhino-inquisitor.com/`.
  - [x] `index.xml` feed `<link>` and `<atom:link>` values use `https://staging.rhino-inquisitor.com/`.
- [x] Existing parity gates remain green on their intended artifact surfaces:
  - [x] `npm run check:url-parity` exits `0` on the staging-targeted artifact.
  - [x] `npm run check:canonical-alignment` exits `0` on the default production-validation artifact used by the deploy workflow.
- [x] `scripts/phase-7/check-seo-safe-deploy.js` is wired into delivery paths:
  - [x] `package.json` exposes `npm run check:seo-safe-deploy`.
  - [x] `.github/workflows/deploy-pages.yml` runs the new gate against the post-preview/post-staging build before artifact upload.
- [ ] `migration/phase-7-seo-safety-staging-report.md` includes the release-candidate Actions run URL after the next push.

---

### Tasks

- [x] Write `scripts/phase-7/check-seo-safe-deploy.js`.
- [x] Add `"check:seo-safe-deploy": "node scripts/phase-7/check-seo-safe-deploy.js"` to `package.json`.
- [x] Wire `npm run check:seo-safe-deploy` into `.github/workflows/deploy-pages.yml` as a blocking pre-deploy gate.
- [x] Update the markdown render-link hook to rewrite same-site absolute Markdown links onto the active site host and base path.
- [x] Run a staging-style blocked build locally:
  - [x] `hugo --cleanDestinationDir --gc --minify --environment preview --baseURL "https://staging.rhino-inquisitor.com/"`
  - [x] `npm run check:seo-safe-deploy -- --expected-origin "https://staging.rhino-inquisitor.com/" --crawl-mode blocked`
  - [x] `npm run check:url-parity`
- [x] Re-run `npm run build:prod && npm run check:canonical-alignment` on the default production-validation artifact to confirm the existing Phase 6 gate stays green.
- [x] Capture deterministic live staging samples:
  - [x] Homepage `/`
  - [x] Three most-recent published posts by front matter date: `/real-time-inventory-checks-in-sfcc/`, `/a-dev-guide-to-combating-fraud-on-sfcc/`, `/kickstart-guide-for-new-sfcc-developers/`
  - [x] First alphabetical category slug: `/category/ai/`
  - [x] Archive page: `/archive/`
- [x] Commit `migration/phase-7-seo-safety-staging-report.md` with local and live staging evidence.
- [ ] Append the release-candidate Actions run URL to the staging report after the next push.

---

### Out of Scope

- Redesigning canonical tag templates (Phase 3/5 scope — fix bugs only, not redesign)
- Changing sitemap generation strategy or robots.txt policy (Phase 5 scope)
- Implementing new redirect rules (Phase 6 scope — manifest is frozen)
- Production host consolidation and post-launch Search Console actions (future production cutover / Phase 9 scope)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-073 Done — Phase 7 Bootstrap complete | Ticket | Done |
| RHI-074 Done — WS-A deployment workflow complete; production build available | Ticket | Done |
| RHI-024 Done — Phase 3 SEO foundation partials committed (canonical, sitemap, robots.txt templates) | Ticket | Done |
| RHI-050 Done — Phase 5 crawlability and indexing controls (robots.txt, noindex policy) committed | Ticket | Done |
| RHI-065 Done — Phase 6 Hugo route preservation and alias integration complete | Ticket | Done |
| RHI-069 Done — Phase 6 canonical alignment report passing | Ticket | Done |
| `cheerio` available in `package.json` (from Phase 6 tooling) | Tool | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Same-site Markdown links hard-coded to `https://www.rhino-inquisitor.com/` leak into staging HTML and feed output | Medium | High | Normalize same-site absolute links in `render-link.html` so builds emit host-correct links for staging, preview, and production | SEO Owner |
| Preview or staging host output drifts to `github.io`, `www`, or `http://` because a template emits hard-coded absolutes | Medium | High | Run `check:seo-safe-deploy` after the preview/staging build and fail the workflow on any host or protocol mismatch | SEO Owner |
| The existing Phase 6 canonical-alignment checker is misread as a staging blocked-artifact gate even though it only audits indexable pages | Medium | Medium | Record the intended surfaces explicitly: `check:canonical-alignment` remains a production-validation artifact gate, while staging blocked-host validation is handled by `check:seo-safe-deploy` plus live sampling | SEO Owner |

---

### Definition of Done

- [ ] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Implemented the dedicated Phase 7 staging host-safety checker, wired it into the deploy workflow, normalized same-site Markdown links so they follow the active build host, and committed the staging SEO safety report with deterministic local and live staging evidence.

**Delivered artefacts:**

- `scripts/phase-7/check-seo-safe-deploy.js` — SEO host and canonical safety checker
- `package.json` updated with `check:seo-safe-deploy` script
- `.github/workflows/deploy-pages.yml` updated to wire SEO safety gate
- `src/layouts/_default/_markup/render-link.html` — same-site absolute Markdown links now normalize onto the active build host
- `migration/phase-7-seo-safety-staging-report.md` — staging sign-off report with deterministic samples and live staging evidence

**Deviations from plan:**

- The release-candidate Actions run URL is still pending because this session cannot push or trigger GitHub Actions. Add the run URL after the next push to close the final acceptance item.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-17 | In Progress | Added `scripts/phase-7/check-seo-safe-deploy.js`, wired `npm run check:seo-safe-deploy` into `package.json` and `.github/workflows/deploy-pages.yml`, switched the workflow expectation to the staging Pages host, and documented the staging-first contract. |
| 2026-03-17 | In Progress | Normalized same-site absolute Markdown links in `src/layouts/_default/_markup/render-link.html`, then re-ran a staging-style blocked build at `https://staging.rhino-inquisitor.com/`; `check:seo-safe-deploy` passed with `235` HTML routes and `212` sitemap `<loc>` values checked. |
| 2026-03-17 | In Progress | Re-ran `npm run check:url-parity` successfully on the staging-targeted artifact (`1223` pass rows, `0` fail rows) and confirmed `npm run build:prod && npm run check:canonical-alignment` still passes on the default production-validation artifact (`212` rows, `0` mismatches). |
| 2026-03-17 | In Progress | Captured live staging evidence for homepage, the three most-recent posts by front matter date, `/category/ai/`, and `/archive/`: all returned `200`, self-canonicalized on the staging host, emitted matching `og:url`, served `noindex, nofollow`, and emitted no `X-Robots-Tag` header. |
| 2026-03-17 | In Progress | Captured live host-level staging evidence showing `robots.txt` returns `User-agent: *`, `Disallow: /`, and `Sitemap: https://staging.rhino-inquisitor.com/sitemap.xml`, while sitemap and feed samples also use the staging host exclusively. Remaining blocker is appending the release-candidate Actions run URL after the next push. |

---

### Notes

- Staging remains intentionally blocked from indexing in this workstream. The ticket validates staging host self-consistency plus blocked crawl-state, not an indexable staging launch.
- `check:canonical-alignment` is still valuable, but it applies to the default production-validation artifact because that checker only audits indexable pages. It is not reused as the blocked staging host gate.
- The dedicated Phase 7 host-safety checker is the release-blocking gate for post-preview/post-staging host correctness in `.github/workflows/deploy-pages.yml`.
- Reference: `analysis/plan/details/phase-7.md` §Workstream E: SEO-Safe Deployment and Host Consolidation; Google canonical guidance: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
