## RHI-001 · Phase 1 Bootstrap: Access, Tooling, and Environment

**Status:** Open  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 1  
**Assigned to:** Migration Owner  
**Target date:** 2026-03-07  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Confirm that every person, tool, and access grant required for Phase 1 is in place before any workstream begins. Without verified access to Search Console, Analytics, WordPress, and DNS, later workstreams (especially RHI-002 and RHI-005) will stall. Installing and pinning the Node.js toolchain ensures all scripts produce reproducible output across team members and CI.

This ticket is the prerequisite gate for all other Phase 1 tickets. No Phase 1 workstream should begin until this ticket is `Done`.

---

### Acceptance Criteria

- [ ] Google Search Console access confirmed for both the Domain property and the `https://www` URL-prefix property for `rhino-inquisitor.com`
- [ ] Google Analytics access confirmed; landing pages and organic traffic reports are readable
- [ ] WordPress admin read access confirmed (export + REST API)
- [ ] DNS provider access confirmed; current owner is identified
- [ ] `node` ≥ 18 installed in the working environment and version pinned in `.nvmrc` or `package.json` engines
- [ ] All required Phase 1 npm packages installed and recorded in `package.json` with exact versions: `fast-xml-parser`, `undici`, `p-limit`, `zod`, `csv-stringify`, `fast-glob`
- [ ] Recommended packages installed or explicitly deferred with rationale: `playwright`, `lighthouse`
- [ ] `package.json` committed with `scripts` stubs for the Phase 1 script entry points
- [ ] All team members with Phase 1 responsibilities have confirmed access

---

### Tasks

- [ ] Send access requests for Search Console, Analytics, WordPress, and DNS to the relevant owners
- [ ] Confirm receipt and working access for each system (log responses in Progress Log)
- [ ] Create `package.json` at repository root with `"type": "module"` and `engines.node` constraint
- [ ] Run `npm install fast-xml-parser undici p-limit zod csv-stringify fast-glob --save-exact`
- [ ] Run `npm install playwright lighthouse --save-exact --save-dev` or document deferral reason
- [ ] Add `scripts/` directory with placeholder entry-point files (`parse-sitemap.js`, `crawl-urls.js`, `classify-urls.js`, `seo-baseline.js`, `perf-baseline.js`)
- [ ] Add `migration/` directory with a `.gitkeep` so the output folder is tracked
- [ ] Commit `package.json`, `package-lock.json`, and `scripts/` stubs
- [ ] Share confirmation summary with team noting all access and tooling ready

---

### Out of Scope

- Running any URL discovery or classification scripts (covered by RHI-002)
- Capturing SEO or performance baseline data (covered by RHI-005 and RHI-006)
- Any Hugo or template work

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| Search Console owner — must grant access | Access | Pending |
| Analytics owner — must grant access | Access | Pending |
| WordPress admin credentials | Access | Pending |
| DNS provider owner — must grant or confirm access | Access | Pending |
| Node.js ≥ 18 runtime in working environment | Tool | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Search Console access delayed | Medium | High | Chase owner on Day 1 morning; unblock WS4 with alternative data sources (Analytics, logs) if delayed > 24 hours | Migration Owner |
| DNS access unclear or contested | Medium | High | Identify DNS provider from WHOIS and current hosting setup on Day 1; escalate to site owner | Migration Owner |
| Dependency version conflict on team members' machines | Low | Medium | Pin exact versions in `package.json` and commit `package-lock.json` | Migration Owner |
| WordPress export access blocked or slow | Low | Medium | REST API is an acceptable fallback; test both routes on Day 1 | Migration Owner |

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

- `package.json`
- `package-lock.json`
- `scripts/` directory with stub files
- `migration/.gitkeep`

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- If Search Console and Analytics access are not available, WS4 (SEO Baseline) cannot produce an accurate baseline. Escalate to site owner immediately.
- Playwright and Lighthouse are optional for Phase 1 but significantly improve baseline quality. Defer only if install time becomes a bottleneck.
- Reference: `analysis/plan/details/phase-1.md` §Required Inputs and Access, §Tooling for Phase 1
