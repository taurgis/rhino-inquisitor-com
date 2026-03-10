## RHI-031 · Phase 4 Bootstrap: Kickoff and Pipeline Environment Setup

**Status:** Open  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 4  
**Assigned to:** Migration Owner  
**Target date:** 2026-04-09  
**Created:** 2026-03-07  
**Updated:** 2026-03-10

---

### Goal

Confirm that Phase 3 sign-off is complete, all Phase 3 scaffold outputs are accessible and functional in the Phase 4 working environment, and every prerequisite for pipeline implementation is in place before any workstream begins. This ticket is the hard gate for all Phase 4 workstream tickets (RHI-032 through RHI-042). No Phase 4 workstream should begin until this ticket is `Done`.

Phase 4 involves irreversible data transformations. Starting workstreams before confirming the Phase 3 foundation (front matter validation, URL parity tools, CI/CD) means any pipeline defects propagate across all migrated content. Early environment verification prevents this.

---

### Acceptance Criteria

- [ ] Phase 3 sign-off (RHI-030) is `Done` and `migration/phase-3-signoff.md` is committed
- [ ] Migration owner, SEO owner, and engineering owner are confirmed for Phase 4
- [ ] All Phase 4 workstream owners have read `analysis/plan/details/phase-4.md` and confirmed understanding
- [ ] Phase 3 scaffold outputs are accessible and verified:
  - [ ] RHI-022 Outcomes — Archetypes committed; `validate:frontmatter` script is callable
  - [ ] RHI-024 Outcomes — `check:seo` script is callable
  - [ ] RHI-025 Outcomes — `check:url-parity` script is callable; `migration/url-parity-report.json` exists
  - [ ] RHI-029 Outcomes — CI/CD pipeline runs to completion; Pages deployment operational
- [ ] Phase 1 data artifacts are accessible and confirmed current:
  - [ ] `migration/url-inventory.normalized.json` exists with expected record count
  - [ ] `migration/url-manifest.json` exists with 100% disposition coverage
- [ ] Phase 2 contracts are accessible by all Phase 4 workstream owners:
  - [ ] RHI-012 Outcomes — Front matter contract (required fields, `draft` lifecycle, URL normalization rules)
  - [ ] RHI-013 Outcomes — Route and redirect contract (mechanism, threshold, legacy endpoints)
  - [ ] RHI-015 Outcomes — Approved tooling list (Hugo version, Node packages including `turndown`, `gray-matter`, `fast-xml-parser`)
- [ ] WordPress source access is confirmed:
  - [ ] WXR export file is available and parseable
  - [ ] WordPress SQL dump is available and parseable for metadata recovery
  - [ ] WordPress filesystem snapshot is available with documented content root and uploads path
  - [ ] WordPress REST API endpoint is accessible if structured API enrichment is needed
  - [ ] WordPress media origin is accessible for download
  - [ ] Source artifact timestamps are recorded and any cross-source freshness mismatch is escalated before WS-A starts
  - [ ] WordPress content type inventory is known (posts, pages, video, categories, tags)
- [ ] Phase 4 migration workspace directories are created:
  - [ ] `migration/input/` exists
  - [ ] `migration/intermediate/` exists
  - [ ] `migration/output/` exists
  - [ ] `migration/reports/` exists
  - [ ] `scripts/migration/` exists
- [ ] Pipeline tooling dependencies are installable:
  - [ ] `turndown` and `@joplin/turndown-plugin-gfm` available in `package.json`
  - [ ] `gray-matter` available in `package.json`
  - [ ] `fast-xml-parser` available in `package.json`
  - [ ] `zod` available in `package.json`
  - [ ] `p-limit` available in `package.json`
  - [ ] `csv-stringify` available in `package.json`
- [ ] Non-Negotiable Migration Constraints from `analysis/plan/details/phase-4.md` reviewed with engineering owner:
  - [ ] All migrated routes must be explicit — no implicit auto-generated routes
  - [ ] Migration scripts must be idempotent and rerunnable
  - [ ] No batch merges to `src/content/` until validation gates pass
  - [ ] Staging index controls must not leak into release artifacts
- [ ] Phase 4 batch sequence is agreed: Pilot → High-Value → Long-Tail+Taxonomy
- [ ] Workstream owner for each of WS-A through WS-K is named and recorded in the Progress Log
- [ ] Phase 4 target completion date is set and agreed by all workstream owners

---

### Tasks

- [ ] Verify RHI-030 is `Done`; if not, document the blocker and pause Phase 4
- [ ] Confirm migration owner, SEO owner, and engineering owner identities for Phase 4
- [ ] Share `analysis/plan/details/phase-4.md` with all workstream owners; request read confirmation
- [ ] Share links to Phase 2 contract outcomes (RHI-012, RHI-013, RHI-015)
- [ ] Share `migration/phase-3-signoff.md` with Phase 4 team
- [ ] Verify each Phase 3 script is callable from a clean install:
  - [ ] `npm run validate:frontmatter` exits with code 0 on scaffold
  - [ ] `npm run check:url-parity` exits with code 0 on scaffold
  - [ ] `npm run check:seo` exits with code 0 on scaffold
- [ ] Verify WordPress WXR export file exists and is parseable by `fast-xml-parser`
- [ ] Verify WordPress SQL dump exists and is parseable enough to inspect core content/meta tables needed for migration recovery
- [ ] Verify WordPress filesystem snapshot exists and document the effective `wp-content` / uploads location before WS-F planning begins
- [ ] Verify REST API access (if API enrichment is needed): confirm pagination depth and rate limits
- [ ] Record the approved source artifact paths and timestamps in the Progress Log before WS-A begins
- [ ] Create Phase 4 workspace directories: `migration/input/`, `migration/intermediate/`, `migration/output/`, `migration/reports/`, `scripts/migration/`
- [ ] Install Phase 4 pipeline dependencies via `npm install`:
  - [ ] `turndown`
  - [ ] `@joplin/turndown-plugin-gfm`
  - [ ] `gray-matter`
  - [ ] `fast-xml-parser`
  - [ ] `zod`
  - [ ] `p-limit`
  - [ ] `csv-stringify`
  - [ ] `cheerio` (strongly recommended for DOM cleanup)
- [ ] Review Non-Negotiable Constraints with engineering owner; log confirmations in Progress Log
- [ ] Assign workstream owners for WS-A through WS-K
- [ ] Agree on target dates for each workstream ticket (RHI-032 through RHI-042)
- [ ] Log all confirmations in Progress Log with names and dates
- [ ] Announce Phase 4 kickoff with linked Phase 3 sign-off and Phase 4 plan

---

### Out of Scope

- Implementing any pipeline script (covered by RHI-032 through RHI-042)
- Making new architecture decisions (decided in Phase 2)
- Migrating any content (covered by RHI-043 through RHI-045)
- Changing any Phase 3 scaffold without a documented deviation and sign-off

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-030 Done — Phase 3 sign-off recorded | Ticket | Pending |
| `migration/phase-3-signoff.md` committed and readable | Phase | Pending |
| Migration owner available for Phase 4 kickoff | Access | Pending |
| SEO owner available and confirmed | Access | Pending |
| Engineering owner available and confirmed | Access | Pending |
| WordPress WXR export file available | Access | Pending |
| WordPress SQL dump available | Access | Pending |
| WordPress filesystem snapshot available with documented content root | Access | Pending |
| WordPress REST API accessible (if needed) | Access | Pending |
| WordPress media origin accessible | Access | Pending |
| Node.js runtime and `package.json` from Phase 3 | Tool | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Phase 3 sign-off delayed, blocking Phase 4 start | Medium | High | Pre-position Phase 4 materials; confirm tool availability; resolve `package.json` dependencies before sign-off lands | Migration Owner |
| WordPress WXR export is stale or incomplete | Medium | High | Cross-check WXR record count against sitemap URL inventory and other approved source artifacts; flag discrepancy before starting WS-A | Engineering Owner |
| WordPress SQL dump or filesystem snapshot is missing, stale, or from a different capture window | Medium | High | Record source artifact timestamps at kickoff; escalate mismatches before extraction strategy is approved | Engineering Owner |
| WordPress REST API rate limits or authentication barriers | Medium | Medium | Test pagination depth on Day 1; if blocked, proceed with the approved non-API extraction strategy and document the gap | Engineering Owner |
| Required Node packages not compatible with pinned Node version | Low | Medium | Verify package compatibility against pinned Node version on Day 1; resolve before WS-A begins | Engineering Owner |
| Phase 4 workstream ownership gaps (WS-H SEO, WS-I accessibility) | Medium | Medium | Identify backup owners at kickoff; confirm availability for workstreams with Phase 5 coordination requirements | Migration Owner |

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

- Progress Log entries confirming Phase 4 team alignment and Phase 3 contract receipt
- Phase 4 workspace directories committed
- `package.json` updated with Phase 4 pipeline dependencies
- Agreed workstream ownership record

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- Do not begin any Phase 4 workstream until this ticket is `Done`. The pipeline depends on Phase 3 tooling; verify each script before assuming it is callable.
- WordPress WXR exports can be large (100 MB+). Confirm the file is parseable incrementally before committing to an export-first extraction strategy.
- WordPress filesystem artifacts can include uploads plus theme or plugin-exported assets, but this ticket does not expand scope to migrating plugin or theme code. It only confirms source availability for content recovery and auditability.
- Phase 4 is the highest-risk phase for SEO equity loss. Any workstream owner uncertainty about disposition rules or redirect contract must be resolved at kickoff, not during migration execution.
- Reference: `analysis/plan/details/phase-4.md` §Dependencies and Inputs, §Non-Negotiable Migration Constraints, §Pipeline Architecture
