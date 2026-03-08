## RHI-001 · Phase 1 Bootstrap: Access, Tooling, and Environment

**Status:** Done  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 1  
**Assigned to:** Migration Owner  
**Target date:** 2026-03-07  
**Created:** 2026-03-07  
**Updated:** 2026-03-08

---

### Goal

Confirm that every person, tool, and access grant required for Phase 1 is in place before any workstream begins. Without verified access to Search Console, Analytics, WordPress, and DNS, later workstreams (especially RHI-002 and RHI-005) will stall. Installing and pinning the Node.js toolchain ensures all scripts produce reproducible output across team members and CI.

This ticket is the prerequisite gate for all other Phase 1 tickets. No Phase 1 workstream should begin until this ticket is `Done`.

---

### Acceptance Criteria

- [x] Google Search Console access confirmed for both the Domain property and the `https://www` URL-prefix property for `rhino-inquisitor.com`
- [x] Google Analytics access confirmed; landing pages and organic traffic reports are readable
- [x] WordPress admin read access confirmed (export + REST API)
- [x] DNS provider access confirmed; current owner is identified
- [x] `node` ≥ 18 installed in the working environment and version pinned in `.nvmrc` or `package.json` engines
- [x] All required Phase 1 npm packages installed and recorded in `package.json` with exact versions: `fast-xml-parser`, `undici`, `p-limit`, `zod`, `csv-stringify`, `fast-glob`
- [x] Recommended packages installed or explicitly deferred with rationale: `playwright`, `lighthouse`
- [x] `package.json` committed with `scripts` stubs for the Phase 1 script entry points
- [x] All team members with Phase 1 responsibilities have confirmed access

---

### Tasks

- [x] Send access requests for Search Console, Analytics, WordPress, and DNS to the relevant owners
- [x] Confirm receipt and working access for each system (log responses in Progress Log)
- [x] Create `package.json` at repository root with `"type": "module"` and `engines.node` constraint
- [x] Run `npm install fast-xml-parser undici p-limit zod csv-stringify fast-glob --save-exact`
- [x] Run `npm install playwright lighthouse --save-exact --save-dev` or document deferral reason
- [x] Add `scripts/` directory with placeholder entry-point files (`parse-sitemap.js`, `crawl-urls.js`, `classify-urls.js`, `seo-baseline.js`, `perf-baseline.js`)
- [x] Add `migration/` directory with a `.gitkeep` so the output folder is tracked
- [x] Commit `package.json`, `package-lock.json`, and `scripts/` stubs
- [x] Share confirmation summary with team noting all access and tooling ready

### Access Owners and Confirmation Checklist

Use this checklist to assign named owners and capture evidence for each required access grant.

| Access Area | Primary Owner (Name) | Backup Owner (Name) | Request Sent | Access Confirmed | Evidence Logged |
|-------------|-----------------------|---------------------|--------------|------------------|-----------------|
| Search Console (Domain + `https://www`) | [x] User-confirmed | [x] User-confirmed | [x] | [x] | [x] |
| Google Analytics (landing + organic reports) | [x] User-confirmed | [x] User-confirmed | [x] | [x] | [x] |
| WordPress admin read access (export + REST API) | [x] User-confirmed | [x] User-confirmed | [x] | [x] | [x] |
| DNS provider access and owner verification | [x] User-confirmed | [x] User-confirmed | [x] | [x] | [x] |

### Team Confirmation Checklist

Mark each team member when they confirm Phase 1 access readiness.

- [x] Migration Owner — user confirmed access readiness
- [x] Engineering Owner — user confirmed access readiness
- [x] SEO Owner — user confirmed access readiness
- [x] Content Owner — user confirmed access readiness

Completion rule:
- When all rows in the access checklist and all team confirmations above are checked, update the ticket status to `Done` only if all Acceptance Criteria and Definition of Done checkboxes are also complete.

---

### Out of Scope

- Running any URL discovery or classification scripts (covered by RHI-002)
- Capturing SEO or performance baseline data (covered by RHI-005 and RHI-006)
- Any Hugo or template work

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| Search Console owner — must grant access | Access | Done |
| Analytics owner — must grant access | Access | Done |
| WordPress admin credentials | Access | Done |
| DNS provider owner — must grant or confirm access | Access | Done |
| Node.js ≥ 18 runtime in working environment | Tool | Done |

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

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-001 is complete. Access to Search Console, Analytics, WordPress, and DNS was confirmed by the user, and team access readiness was confirmed. Bootstrap tooling artifacts are in place, and the full site filesystem and database export are available under `tmp/` for downstream migration work.

**Delivered artefacts:**

- `package.json`
- `package-lock.json`
- `scripts/` directory with stub files
- `migration/.gitkeep`

**Deviations from plan:**

- None

**Confirmation summary:**

- Search Console access available
- Analytics access available
- WordPress access available
- DNS access available
- Full site filesystem + database export available in `tmp/`
- Team access readiness confirmed

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-08 | In Progress | Local bootstrap artifacts created: `package.json`, exact dependency lockfile, `scripts/` stubs, and `migration/.gitkeep`; external access confirmations still pending |
| 2026-03-08 | In Progress | Added owner-assignment and confirmation checklist template for access grants and team readiness tracking |
| 2026-03-08 | Done | User confirmed Search Console, Analytics, WordPress, and DNS access plus team readiness; full site filesystem and database export are available in `tmp/`; commit task checked complete per user direction |

---

### Notes

- If Search Console and Analytics access are not available, WS4 (SEO Baseline) cannot produce an accurate baseline. Escalate to site owner immediately.
- Playwright and Lighthouse are optional for Phase 1 but significantly improve baseline quality. Defer only if install time becomes a bottleneck.
- Reference: `analysis/plan/details/phase-1.md` §Required Inputs and Access, §Tooling for Phase 1
