## RHI-031 · Phase 4 Bootstrap: Kickoff and Pipeline Environment Setup

**Status:** Done  
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

- [x] Phase 3 sign-off (RHI-030) is `Done` and `migration/phase-3-signoff.md` is committed
- [x] Migration owner, SEO owner, and engineering owner are confirmed for Phase 4
- [x] All Phase 4 workstream owners have read `analysis/plan/details/phase-4.md` and confirmed understanding
- [x] Phase 3 scaffold outputs are accessible and verified:
  - [x] RHI-022 Outcomes — Archetypes committed; `validate:frontmatter` script is callable
  - [x] RHI-024 Outcomes — `check:seo` script is callable
  - [x] RHI-025 Outcomes — `check:url-parity` script is callable; `migration/url-parity-report.json` exists
  - [x] RHI-029 Outcomes — CI/CD pipeline runs to completion; Pages deployment operational
- [x] Phase 1 data artifacts are accessible and confirmed current:
  - [x] `migration/url-inventory.normalized.json` exists with expected record count
  - [x] `migration/url-manifest.json` exists with 100% disposition coverage
- [x] Phase 2 contracts are accessible by all Phase 4 workstream owners:
  - [x] RHI-012 Outcomes — Front matter contract (required fields, `draft` lifecycle, URL normalization rules)
  - [x] RHI-013 Outcomes — Route and redirect contract (mechanism, threshold, legacy endpoints)
  - [x] RHI-015 Outcomes — Approved tooling list (Hugo version, Node packages including `turndown`, `gray-matter`, `fast-xml-parser`)
- [x] WordPress source access is confirmed:
  - [x] WXR export file is available and parseable
  - [x] WordPress SQL dump is available and parseable for metadata recovery
  - [x] WordPress filesystem snapshot is available with documented content root and uploads path
  - [x] WordPress REST API endpoint is accessible if structured API enrichment is needed
  - [x] WordPress media origin is accessible for download
  - [x] Source artifact timestamps are recorded and any cross-source freshness mismatch is escalated before WS-A starts
  - [x] WordPress content type inventory is known (posts, pages, video, categories, tags)
- [x] Phase 4 migration workspace directories are created:
  - [x] `migration/input/` exists
  - [x] `migration/intermediate/` exists
  - [x] `migration/output/` exists
  - [x] `migration/reports/` exists
  - [x] `scripts/migration/` exists
- [x] Pipeline tooling dependencies are installable:
  - [x] `turndown` and `@joplin/turndown-plugin-gfm` available in `package.json`
  - [x] `gray-matter` available in `package.json`
  - [x] `fast-xml-parser` available in `package.json`
  - [x] `zod` available in `package.json`
  - [x] `p-limit` available in `package.json`
  - [x] `csv-stringify` available in `package.json`
- [x] Non-Negotiable Migration Constraints from `analysis/plan/details/phase-4.md` reviewed with engineering owner:
  - [x] All migrated routes must be explicit — no implicit auto-generated routes
  - [x] Migration scripts must be idempotent and rerunnable
  - [x] No batch merges to `src/content/` until validation gates pass
  - [x] Staging index controls must not leak into release artifacts
- [x] Phase 4 batch sequence is agreed: Pilot → High-Value → Long-Tail+Taxonomy
- [x] Workstream owner for each of WS-A through WS-K is named and recorded in the Progress Log
- [x] Phase 4 target completion date is set and agreed by all workstream owners

---

### Tasks

- [x] Verify RHI-030 is `Done`; if not, document the blocker and pause Phase 4
- [x] Confirm migration owner, SEO owner, and engineering owner identities for Phase 4
- [x] Share `analysis/plan/details/phase-4.md` with all workstream owners; request read confirmation
- [x] Share links to Phase 2 contract outcomes (RHI-012, RHI-013, RHI-015)
- [x] Share `migration/phase-3-signoff.md` with Phase 4 team
- [x] Verify each Phase 3 script is callable from a clean install:
  - [x] `npm run validate:frontmatter` exits with code 0 on scaffold
  - [x] `npm run check:url-parity` exits with code 0 on scaffold
  - [x] `npm run check:seo` exits with code 0 on scaffold
- [x] Verify WordPress WXR export file exists and is parseable by `fast-xml-parser`
- [x] Verify WordPress SQL dump exists and is parseable enough to inspect core content/meta tables needed for migration recovery
- [x] Verify WordPress filesystem snapshot exists and document the effective `wp-content` / uploads location before WS-F planning begins
- [x] Verify REST API access (if API enrichment is needed): confirm pagination depth and rate limits
- [x] Record the approved source artifact paths and timestamps in the Progress Log before WS-A begins
- [x] Create Phase 4 workspace directories: `migration/input/`, `migration/intermediate/`, `migration/output/`, `migration/reports/`, `scripts/migration/`
- [x] Install Phase 4 pipeline dependencies via `npm install`:
  - [x] `turndown`
  - [x] `@joplin/turndown-plugin-gfm`
  - [x] `gray-matter`
  - [x] `fast-xml-parser`
  - [x] `zod`
  - [x] `p-limit`
  - [x] `csv-stringify`
  - [x] `cheerio` (strongly recommended for DOM cleanup)
- [x] Review Non-Negotiable Constraints with engineering owner; log confirmations in Progress Log
- [x] Assign workstream owners for WS-A through WS-K
- [x] Agree on target dates for each workstream ticket (RHI-032 through RHI-042)
- [x] Log all confirmations in Progress Log with names and dates
- [x] Announce Phase 4 kickoff with linked Phase 3 sign-off and Phase 4 plan

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
| RHI-030 Done — Phase 3 sign-off recorded | Ticket | Verified |
| `migration/phase-3-signoff.md` committed and readable | Phase | Verified locally |
| Migration owner available for Phase 4 kickoff | Access | Verified — Thomas Theunen |
| SEO owner available and confirmed | Access | Verified — Thomas Theunen |
| Engineering owner available and confirmed | Access | Verified — Thomas Theunen |
| WordPress WXR export file available | Access | Verified locally — `tmp/therhinoinquisitor.WordPress.2026-03-10.xml` parsed with 958 items |
| WordPress SQL dump available | Access | Verified locally — `tmp/wordpress-database.sql` |
| WordPress filesystem snapshot available with documented content root | Access | Verified locally — `tmp/website-wordpress-backup/wp-content` and `tmp/website-wordpress-backup/wp-content/uploads` |
| WordPress REST API accessible (if needed) | Access | Verified locally — `GET /wp-json/wp/v2/posts?per_page=1&page=1` returned `200` |
| WordPress media origin accessible | Access | Verified locally — direct sample upload request returned `200` |
| Node.js runtime and `package.json` from Phase 3 | Tool | Verified locally — Node >=18 repo contract intact; Phase 4 dependencies installed |

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

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Phase 4 bootstrap is complete. The repo-side migration workspace, dependency set, source inventory, owner assignments, and Phase 3 handoff evidence are in place for workstream execution.

**Delivered artefacts:**

- Progress Log entries confirming Phase 4 team alignment and Phase 3 contract receipt
- Phase 4 workspace directories committed
- `package.json` updated with Phase 4 pipeline dependencies
- Agreed workstream ownership record
- Verified WXR source artifact: `tmp/therhinoinquisitor.WordPress.2026-03-10.xml`
- Phase 4 bootstrap readiness note: `analysis/documentation/phase-4/rhi-031-phase-4-bootstrap-readiness-2026-03-10.md`

**Deviations from plan:**

- The WXR export is newer than the SQL dump and filesystem snapshot by about two days. Thomas Theunen explicitly accepted this freshness mismatch for bootstrap, with WXR treated as the primary structured source and SQL/filesystem retained as recovery and audit inputs for later workstreams.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-10 | In Progress | Verified local Phase 3 script callability: `npm run validate:frontmatter`, `npm run check:url-parity`, and `npm run check:seo` all exited with code 0 on the current scaffold. |
| 2026-03-10 | In Progress | Confirmed Phase 1 data artifacts remain accessible: `migration/url-inventory.normalized.json` contains 1199 records and `migration/url-manifest.json` contains 1201 records with 1201/1201 dispositions populated. |
| 2026-03-10 | In Progress | Bootstrapped the Phase 4 workspace by creating `migration/input/`, `migration/intermediate/`, `migration/output/`, `migration/reports/`, and `scripts/migration/`. Installed `turndown`, `@joplin/turndown-plugin-gfm`, and `cheerio` into `package.json`. |
| 2026-03-10 | In Progress | Verified WordPress recovery sources available locally: WXR export `tmp/therhinoinquisitor.WordPress.2026-03-10.xml` timestamp `2026-03-10 11:03:55 +0100`, parsed with 958 items via `fast-xml-parser`; SQL dump timestamp `2026-03-08 16:23:08 +0100`; filesystem snapshot timestamp `2026-03-08 16:22:14 +0100`; content root `tmp/website-wordpress-backup/wp-content`; uploads path `tmp/website-wordpress-backup/wp-content/uploads`. Quick SQL inventory signal: `post 1448`, `page 99`, `video 9`, `attachment 1148`, `nav_menu_item 14`, `revision 935`. |
| 2026-03-10 | In Progress | Recorded owner decisions from the ticket owner: Thomas Theunen is Migration Owner, SEO Owner, Engineering Owner, and the single owner for WS-A through WS-K. Thomas confirmed review of `analysis/plan/details/phase-4.md`, Phase 2 contracts RHI-012/RHI-013/RHI-015, the Non-Negotiable Migration Constraints, and the default batch sequence `Pilot → High-Value → Long-Tail+Taxonomy`. The current Phase 4 target dates in `analysis/tickets/phase-4/INDEX.md` remain the agreed initial schedule. |
| 2026-03-10 | In Progress | WXR and REST inventory signals now confirm the content-type set needed for bootstrap: WXR includes `post 164`, `page 22`, and taxonomy domains `category` and `post_tag`; the SQL dump confirms additional `video 9` records. REST probe to `/wp-json/wp/v2/posts?per_page=1&page=1` returned `200`, `X-WP-TotalPages: 160`, and no explicit rate-limit headers. |
| 2026-03-10 | Done | Thomas Theunen explicitly accepted the WXR-versus-SQL/filesystem freshness mismatch for bootstrap. WXR is the primary structured source for Phase 4 bootstrap readiness, while SQL and filesystem artifacts remain approved recovery and audit channels. RHI-030 is now `Done`, the Phase 3 handover package is accepted, and Phase 4 kickoff is approved to proceed. |

---

### Notes

- Do not begin any Phase 4 workstream until this ticket is `Done`. The pipeline depends on Phase 3 tooling; verify each script before assuming it is callable.
- WordPress WXR exports can be large (100 MB+). Confirm the file is parseable incrementally before committing to an export-first extraction strategy.
- WordPress filesystem artifacts can include uploads plus theme or plugin-exported assets, but this ticket does not expand scope to migrating plugin or theme code. It only confirms source availability for content recovery and auditability.
- Phase 4 is the highest-risk phase for SEO equity loss. Any workstream owner uncertainty about disposition rules or redirect contract must be resolved at kickoff, not during migration execution.
- Reference: `analysis/plan/details/phase-4.md` §Dependencies and Inputs, §Non-Negotiable Migration Constraints, §Pipeline Architecture
