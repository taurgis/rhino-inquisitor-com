# RHI-032 Phase 4 WordPress Source Channels - 2026-03-10

## Change summary

Updated the Phase 4 migration planning set to treat the WordPress WXR export, REST API, SQL dump, and filesystem snapshot as approved source artifacts for content migration. The change keeps WXR and REST as the preferred structured inputs while clarifying that the SQL dump and filesystem snapshot are valid recovery and audit sources when export or API coverage is incomplete.

## Why this changed

The repository already contains a full WordPress database dump and filesystem snapshot in addition to API access, but the Phase 4 tickets mostly described extraction as WXR-only or WXR-plus-REST. That wording understated the actual recovery options for metadata, media, and content-bearing assets and risked treating missing export fields as unavailable rather than recoverable.

## Behavior details

Old behavior:

- Phase 4 bootstrap and extraction tickets framed source readiness mainly as WXR availability with optional REST access.
- Downstream Phase 4 tickets did not consistently say that SQL and filesystem artifacts could be used for metadata, attachment, and audit recovery.
- Sign-off expectations did not require explicit evidence of which source channels were actually used during migration runs.

New behavior:

- Phase 4 tickets now define four approved WordPress source channels: WXR export, REST API, SQL dump, and filesystem snapshot.
- Bootstrap requires source-artifact availability and timestamp checks before Workstream A begins.
- Extraction, normalization, reporting, pilot, and sign-off tickets now require the selected source-channel strategy and provenance to be documented.
- Media, SEO, and security tickets now explicitly account for filesystem and SQL recovery paths where relevant.
- The Phase 4 detailed plan now records SQL and filesystem access as expected inputs and documents their role in extraction precedence.

## Impact

- Migration planning now matches the actual source material already present in the repository.
- Workstream owners have clearer guidance on when SQL or filesystem recovery is acceptable without reopening scope into plugin or theme migration.
- Audit and sign-off artifacts must now show which source channels were used, which reduces ambiguity for downstream Phase 5 and Phase 6 work.

## Verification

- Reviewed the Phase 4 ticket set for WXR or REST-only wording and updated the affected tickets.
- Updated the Phase 4 detailed plan so external access and extraction strategy match the ticket set.
- Confirmed the edited Markdown files report no editor diagnostics after the update.

## Related files

- `analysis/tickets/phase-4/INDEX.md`
- `analysis/tickets/phase-4/RHI-031-phase-4-bootstrap.md`
- `analysis/tickets/phase-4/RHI-032-wordpress-content-extraction.md`
- `analysis/tickets/phase-4/RHI-033-normalization-record-model.md`
- `analysis/tickets/phase-4/RHI-037-media-migration-asset-hygiene.md`
- `analysis/tickets/phase-4/RHI-039-seo-signal-preservation.md`
- `analysis/tickets/phase-4/RHI-041-security-data-hygiene.md`
- `analysis/tickets/phase-4/RHI-042-reporting-traceability-audit.md`
- `analysis/tickets/phase-4/RHI-043-pilot-batch-migration.md`
- `analysis/tickets/phase-4/RHI-046-phase-4-signoff.md`
- `analysis/plan/details/phase-4.md`

## Assumptions and open questions

- WXR and REST remain the preferred structured extraction inputs unless the approved run strategy documents a different precedence for a specific field class.
- SQL and filesystem availability do not expand scope to migrating plugin code, theme code, or operational WordPress configuration beyond content-recovery needs.
- Field-level precedence rules still need to be finalized during Workstream A implementation if multiple source channels disagree for the same record.
