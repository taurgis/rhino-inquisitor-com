## RHI-099 · Workstream F — SEO, Schema, and Content-Signal Drift Monitoring

**Status:** Open  
**Priority:** High  
**Estimate:** M  
**Phase:** 9  
**Workstream:** WS-F  
**Assigned to:** SEO Owner  
**Target date:** 2026-07-29  
**Created:** 2026-03-08  
**Updated:** 2026-03-08

---

### Goal

Prevent post-launch configuration drift that degrades discoverability. Canonical tags, sitemap URLs, robots.txt directives, structured data, and social preview signals must remain consistent and aligned throughout the 6-week stabilization window. A single misconfigured canonical or an accidental noindex on an article template can silently affect rankings without producing a 4xx error that monitoring tools would catch.

---

### Acceptance Criteria

**Daily (week 1):**
- [ ] Canonical tags on homepage and article template verified to reference `https://www.rhino-inquisitor.com/...`
- [ ] No template-level noindex present on canonically indexable pages
- [ ] Sitemap verified: canonical-only URLs, no redirected or helper pages, correct `Sitemap:` directive in robots.txt
- [ ] Open Graph image URLs are HTTPS-resolvable on homepage and article template
- [ ] Structured data on homepage and article template produces no critical errors (Rich Results Test or equivalent)
- [ ] Daily findings recorded in `monitoring/canonical-consistency-report.json`

**Weekly (weeks 2–6):**
- [ ] Canonical self-consistency check run on representative page sample
- [ ] Sitemap content reviewed: count of canonical URLs and absence of non-canonical/redirected entries
- [ ] `robots.txt` reviewed for alignment with crawl policy and `Sitemap:` directive
- [ ] Structured data validated on homepage and article templates for content alignment (not just syntax)
- [ ] OG/Twitter card URLs spot-checked for HTTPS resolvability
- [ ] Weekly findings appended to `monitoring/canonical-consistency-report.json`

**Change-control gate:**
- [ ] No template-level SEO field change (canonical override, robots meta tag, sitemap inclusion rule, JSON-LD template) made without running a targeted validation and recording named owner approval during stabilization window

**Escalation triggers (Sev-1/Sev-2):**
- [ ] Sev-1 triggered if: canonical host drift appears in any primary template family
- [ ] Sev-1 triggered if: accidental `noindex` on indexable pages (not just staging)
- [ ] Sev-2 triggered if: structured data critical errors appear on homepage or article templates
- [ ] Sev-2 triggered if: sitemap contains non-canonical or redirected URLs

**Stabilization exit:**
- [ ] Canonical, sitemap, and robots consistency stable for two consecutive weekly audits
- [ ] Structured data validity confirmed with no critical errors on primary templates
- [ ] No post-launch SEO configuration drift incidents left open

---

### Tasks

**Daily week-1 checks:**
- [ ] Fetch homepage and one article page; check `<link rel="canonical">` value and `<meta name="robots">` tag
- [ ] Fetch sitemap; run through `fast-xml-parser`; count URLs; verify no redirect or helper page URLs included
- [ ] Check `robots.txt` Sitemap directive; confirm Disallow rules are correct for production
- [ ] Fetch an OG image URL from homepage and article; confirm HTTPS 200 response
- [ ] Run structured data validation (Rich Results Test URL or equivalent) on homepage and one article
- [ ] Record check results in `monitoring/canonical-consistency-report.json` with `runTimestamp` and per-signal status

**Weekly checks (weeks 2–6):**
- [ ] Run canonical spot-check across a 10-page sample (mix of article, category, homepage)
- [ ] Review sitemap URL count vs expected; flag any unexpected additions or removals
- [ ] Validate structured data on homepage and article template for content accuracy (not just schema validity)
- [ ] Confirm OG image URLs resolve for all templates
- [ ] Append weekly findings to `monitoring/canonical-consistency-report.json`

**Change-control enforcement:**
- [ ] If a template or configuration change is proposed during stabilization, require:
  - [ ] Targeted validation run (build + canonical/sitemap/structured-data checks)
  - [ ] Named owner approval recorded before merge
  - [ ] Specific impact scope defined (which template families affected)
- [ ] Log all approved template changes during stabilization in `monitoring/canonical-consistency-report.json`

**Social-preview hygiene:**
- [ ] Confirm OG image file paths are absolute HTTPS URLs (not relative paths that would break on the live host)
- [ ] If OG images use query parameters, confirm GitHub Pages serves them correctly
- [ ] Spot-check Twitter card and Open Graph preview with a link unfurling tool (e.g., OpenGraph.xyz)

---

### Out of Scope

- SEO ranking analysis or content strategy decisions
- New content creation or metadata optimisation experiments
- Creating new schema types beyond what is already defined in Phase 5 templates
- Keyword research or search analytics review (not a stabilization concern)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-093 Done — Phase 9 Bootstrap complete | Ticket | Pending |
| RHI-094 Done — Cutover executed; live host responding | Ticket | Pending |
| Phase 5 SEO partials deployed in RC (canonical, OG, JSON-LD — RHI-048 through RHI-052) | Phase | Pending |
| Phase 8 SEO consistency baseline in `validation/seo-consistency-report.json` | Phase | Pending |
| `fast-xml-parser` available for sitemap verification | Phase | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Content edit accidentally overrides canonical via front matter field | Low | High | Communicate canonical field policy to content editors; audit front matter on merge PRs during stabilization | SEO Owner |
| Sitemap grows to include helper or redirect pages via a template change | Low | High | Review sitemap template change before merge; run `fast-xml-parser` count check after each deploy | Engineering Owner |
| Structured data becomes content-inaccurate after a post-launch hotfix | Medium | Medium | Include structured data spot-check in the hotfix validation checklist | Engineering Owner |
| OG images broken after media path refactor (if any) | Low | High | No media path changes should occur during stabilization; treat as a change-freeze violation | Engineering Owner |
| robots.txt accidentally disallows production paths after a config edit | Low | Critical | robots.txt changes require SEO owner approval and immediate production verification | SEO Owner |
| Canonical tag drift introduced by a Hugo template partial change | Low | High | Any SEO partial change requires full validation run; treat as a Phase 9 change-control event | Engineering Owner |

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

- `monitoring/canonical-consistency-report.json` — daily week-1 and weekly week-2–6 SEO signal consistency log
- Template change log entries (if any approved changes were made during stabilization)
- Social preview spot-check evidence

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | Open | Ticket created |

---

### Notes

- Configuration drift is the silent killer of post-migration SEO. A single template change that overrides canonical or removes a JSON-LD block may not be detectable by smoke tests but will affect indexing over weeks.
- The change-control gate in this workstream is intentionally strict during stabilization. Once the site exits the stabilization window and enters BAU operations, the gate cadence can be relaxed.
- Structured data must be content-accurate, not just syntactically valid. A `BlogPosting` schema that references an incorrect `datePublished` or missing `author` is a policy violation even if it passes the Rich Results Test without errors.
- Reference: `analysis/plan/details/phase-9.md` §Workstream F: SEO, Schema, and Content-Signal Drift Monitoring
