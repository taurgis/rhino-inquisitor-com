# RHI-093 Bootstrap Monitoring Scaffold (2026-03-24)

## Change summary

RHI-093 now has the required `monitoring/` directory scaffold and placeholder artifact contracts for every Phase 9 cutover and stabilization output named in the ticket. This change establishes fixed locations and minimum report fields before live cutover work begins.

## Why this changed

The ticket requires the monitoring directory to exist before any downstream Phase 9 workstream starts. Without a committed scaffold, later workstreams would have to invent artifact locations and report shapes during launch pressure, which weakens traceability and slows incident response.

## Behavior details

### Old behavior

- No `monitoring/` directory existed in the repository.
- Phase 9 artifact names were listed only in the ticket.
- There was no shared report contract for Phase 9 JSON or Markdown monitoring outputs.

### New behavior

- The repository now includes a `monitoring/` directory with all ten Phase 9 placeholder artifacts required by RHI-093.
- JSON stubs expose a shared top-level contract: `runTimestamp`, `environment`, `commitSha`, `status`, `owner`, and `findings`.
- Markdown stubs mirror the same metadata in a simple header block so launch operators can record live results consistently.
- `monitoring/README.md` documents artifact purposes, allowed status values, and the bootstrap blockers that still prevent RHI-093 from closing.

## Impact

- Phase 9 workstreams now have stable output targets for cutover logging, Search Console reporting, legacy-route health checks, canonical checks, CWV tracking, security checks, and stabilization closeout.
- The bootstrap ticket can now mark the monitoring-directory acceptance block complete and record named single-operator launch coverage for this repository.
- Staging readiness evidence now exists for the preview-host smoke check, direct Playwright probe, `fast-xml-parser` usage through the smoke script, and AJV validation of the monitoring stub contract.
- Search Console API automation now has a dedicated probe script at `scripts/phase-9/check-search-console-auth.js` and an npm entrypoint at `npm run check:search-console-auth`, so credential-path and property-access verification can be executed directly instead of being handled manually.
- The probe wiring itself was validated by generating `tmp/rhi-093-search-console-auth-check.json`; the current failure mode is expected and limited to missing live credentials (`No credential path provided`).
- The kickoff announcement required by RHI-093 is now recorded in `analysis/documentation/phase-9/RHI-093-phase-9-kickoff-announcement-2026-03-24.md`.
- The migration owner explicitly accepted bootstrap closure without requiring a live Search Console API call, so RHI-093 is now complete while still preserving the auth probe for future runtime use.

## Verification

1. Confirm the `monitoring/` directory contains all ten artifacts named in RHI-093.
2. Confirm each JSON file parses and includes the shared top-level report-contract fields.
3. Confirm each Markdown file includes stub metadata for status, timestamp, environment, commit SHA, and owner.
4. Run `node scripts/phase-8/check-preview-launch-readiness.js --base-url https://taurgis.github.io/rhino-inquisitor-com/ --report tmp/rhi-093-preview-launch-readiness-report.json --markdown tmp/rhi-093-preview-launch-readiness.md` and confirm it resolves the rehearsal host, completes 13 smoke checks, and reports 0 blocking failures.
5. Run a direct Playwright probe against `https://staging.rhino-inquisitor.com/` and confirm the homepage title resolves successfully.
6. Validate `monitoring/sitemap-processing-report.json` with AJV against the shared top-level stub contract and confirm validation passes.
7. Run `node scripts/phase-8/run-lhci.js --profile mobile --output-root tmp/rhi-093-lhci` and confirm the CLI produces a filesystem report, while recording any assertion failures separately from CLI availability.
8. Run `npm run check:search-console-auth -- --report tmp/rhi-093-search-console-auth-check.json` and confirm the probe executes and writes the expected report shape, even when live credentials are not provided.
9. Confirm RHI-093 records the owner decision that a live Search Console API call is not required for bootstrap closure.

## Related files

- monitoring/README.md
- monitoring/launch-cutover-log.md
- monitoring/search-console-indexing-report.md
- monitoring/url-inspection-sample-report.json
- monitoring/sitemap-processing-report.json
- monitoring/legacy-route-health-report.json
- monitoring/canonical-consistency-report.json
- monitoring/cwv-lighthouse-trend.json
- monitoring/cwv-field-trend.md
- monitoring/security-domain-report.json
- monitoring/stabilization-summary.md
- analysis/tickets/phase-9/RHI-093-phase-9-bootstrap.md
- analysis/documentation/phase-9/RHI-093-phase-9-kickoff-announcement-2026-03-24.md
- scripts/phase-9/check-search-console-auth.js
- tmp/rhi-093-preview-launch-readiness-report.json
- tmp/rhi-093-preview-launch-readiness.md

## Assumptions and open questions

- No further bootstrap blockers remain after the owner-approved waiver of the live Search Console API call.