# RHI-057 Search Console Monitoring Program Implementation

Date: 2026-03-13
Ticket: `analysis/tickets/phase-5/RHI-057-search-console-monitoring-program.md`

## Change summary

Created the Phase 5 monitoring runbook at `migration/phase-5-monitoring-runbook.md`, moved RHI-057 from Open to Done, and centralized the current Search Console continuity evidence, baseline-capture procedure, sitemap submission workflow, launch-week checklist, 30-day and 60-day review cadence, incident thresholds, and the owner-approved Search Console-only monitoring policy in one operator-facing document.

## Why this changed

Before this change, the inputs needed for RHI-057 were scattered across the Phase 1 baseline, the Phase 5 plan, and the ticket itself. That made the monitoring program hard to execute consistently and easy to leave until after cutover. The runbook now makes the pre-cutover evidence requirements explicit and records the owner decision to close the ticket with the remaining live Search Console evidence gaps accepted as residual risk.

## Behavior details

### Old behavior

- The repository had no dedicated `migration/phase-5-monitoring-runbook.md` deliverable.
- Search Console access and DNS TXT continuity evidence were only recorded in the Phase 1 baseline and kickoff notes.
- The launch-week monitoring cadence, 30-day and 60-day checkpoints, and incident thresholds existed in plan and ticket text but not in an operator-ready runbook.
- The URL Inspection sample set required by RHI-057 had not been assembled into a single list.
- Analytics remained deferred from Phase 3 with no recorded owner decision on whether to activate it or leave the site Search Console-only.

### New behavior

- `migration/phase-5-monitoring-runbook.md` now captures the Phase 5 monitoring workflow in one place.
- The runbook records the repo-backed current state for Search Console access, verification continuity, sitemap target, historical baseline evidence, and the owner-approved decision to keep analytics disabled for this migration.
- The runbook defines the required pre-cutover snapshot set and the expected artifact naming under `migration/reports/`.
- The runbook includes a 16-URL launch inspection sample that covers the homepage, the top 10 organic landing pages from the signed-off Phase 1 baseline, retained category surfaces, retained video surfaces, the privacy policy, and a representative static page.
- The runbook records the launch-week monitoring checklist, the 30-day and 60-day review checkpoints, and the incident escalation thresholds directly from the Phase 5 plan.
- The ticket and Phase 5 index now show RHI-057 as Done instead of Open.

## Impact

- Maintainers now have a concrete Phase 5 monitoring runbook to complete before Phase 7 cutover.
- The previously open live-system gaps are now recorded as owner-accepted residual risks.
- The repository now records that Search Console, not GA4, is the accepted monitoring source of truth for this migration.

## Verification

- Verified documentation alignment against:
  - `migration/phase-1-seo-baseline.md`
  - `analysis/plan/details/phase-5.md`
  - `docs/migration/SECURITY-CONTROLS.md`
  - `hugo.toml`
  - `src/layouts/_default/baseof.html`
  - `src/layouts/partials/seo/head-meta.html`
- Confirmed the ticket deliverable path `migration/phase-5-monitoring-runbook.md` now exists in source control after this change.
- No build, lint, or runtime validation was run because this change is documentation and ticket tracking only.
- Runtime validation completed after the documentation pass:
  - `npm run build:prod`
  - `hugo --minify --environment preview --destination tmp/rhi057-preview`
  - exact-marker scans across `public/`, `tmp/rhi057-preview/`, `src/layouts/`, and `hugo.toml` found no GA4 or equivalent analytics runtime markers

## Related files

- `migration/phase-5-monitoring-runbook.md`
- `analysis/tickets/phase-5/RHI-057-search-console-monitoring-program.md`
- `analysis/tickets/phase-5/INDEX.md`
- `migration/phase-1-seo-baseline.md`
- `docs/migration/SECURITY-CONTROLS.md`

## Assumptions and open questions

- The signed-off Phase 1 baseline remains the authoritative historical SEO baseline even though the temporary `tmp/search-console/` export folder referenced there is not present in the current workspace anymore.
- The Search Console property type is now owner-confirmed as the Domain property, but live Search Console access still needs to be re-verified during evidence capture.
- The ticket is closed on explicit owner risk acceptance despite the missing fresh Search Console evidence.