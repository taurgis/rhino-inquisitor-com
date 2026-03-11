## Change summary

Added a pilot-selection preparation command for RHI-043 so the repository can generate a deterministic candidate ledger before the migration owner locks the pilot source-id list.

## Why this changed

RHI-043 requires a representative 20 to 30 record pilot batch, but the current corpus does not map cleanly to the ticket wording in two places: there are no source-backed `merge` records in the normalized dataset, and there are no source-backed `postType=video` records. The ticket also references the Phase 1 top-10 traffic list, while the signed-off baseline contains both 90-day and 28-day ranking tables.

Without a repo-owned report, pilot selection would depend on ad hoc shell queries and would be hard to audit or reproduce.

## Behavior details

### Old behavior

- No dedicated command existed to summarize pilot candidates.
- Owner decisions about traffic-window selection, redirect-scenario coverage, and video-related coverage required manual data inspection across multiple files.
- The ticket status and dependency table still reflected a pre-start state even though the upstream Phase 4 workstreams are already complete.

### New behavior

- `npm run migrate:pilot-candidates` now generates:
  - `migration/reports/pilot-selection-candidates.csv`
  - `migration/reports/pilot-selection-summary.json`
- The candidate ledger combines:
  - Phase 1 traffic ranks from `migration/phase-1-seo-baseline.md`
  - normalized record metadata and source provenance from `migration/intermediate/records.normalized.json`
  - converted Markdown heuristics from `migration/output/*.json`
  - manifest redirect coverage from `migration/url-manifest.json`
- The generated summary explicitly reports the current pilot-selection gaps:
  - no source-backed `merge` records are available
  - no source-backed `postType=video` records are available
  - both 90-day and 28-day top-traffic windows exist, with the pilot lock now using the 90-day window
- The owner-approved pilot lock is now recorded in `migration/input/pilot-source-ids.txt`, including the chosen traffic window, homepage counting rule, video handling, redirect handling, and accessibility warning cap.
- The staged pilot execution now also relies on a manifest-backed subset mode for `check:links`, so valid rewritten targets outside the pilot batch do not fail the temporary pilot-only build.
- RHI-043 is now marked `In Progress`, and its dependency table reflects the already-complete upstream Phase 4 workstreams.

## Impact

- Maintainers can generate a deterministic pilot-candidate ledger instead of reconstructing selection evidence from one-off queries.
- The ticket now records the owner-approved pilot selection and its decision trail in a reusable source-id file.
- No migration content, manifest disposition, or staged Markdown behavior changed in this slice.

## Verification

1. `node --check scripts/migration/generate-pilot-candidates.js`
2. `npm run migrate:pilot-candidates`
3. Review `migration/reports/pilot-selection-summary.json` for:
   - `sourceBackedMergeCandidates: 0`
   - `sourceBackedVideoCandidates: 0`
   - both traffic windows represented
4. `npx markdownlint-cli2 docs/migration/RUNBOOK.md analysis/documentation/phase-4/rhi-043-pilot-selection-prep-2026-03-11.md analysis/tickets/phase-4/RHI-043-pilot-batch-migration.md`
5. `CHECK_LINKS_PUBLIC_DIR=tmp/rhi043-public CHECK_LINKS_ALLOW_MANIFEST_TARGETS=1 npm run check:links`

## Related files

- `scripts/migration/generate-pilot-candidates.js`
- `package.json`
- `docs/migration/RUNBOOK.md`
- `analysis/tickets/phase-4/RHI-043-pilot-batch-migration.md`
- `analysis/tickets/phase-4/INDEX.md`
- `migration/reports/pilot-selection-candidates.csv`
- `migration/reports/pilot-selection-summary.json`
- `migration/input/pilot-source-ids.txt`
- `scripts/check-links.js`
