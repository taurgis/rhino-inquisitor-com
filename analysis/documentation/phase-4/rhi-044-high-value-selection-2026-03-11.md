# RHI-044 High-Value Batch Selection

## Change summary

Locked the Batch 2 source-id input for RHI-044 and documented the high-value selection rules used to move from the RHI-043 pilot subset to the first scaled migration batch.

## Why this changed

RHI-044 requires a reproducible, owner-approved selection of 30-50 non-pilot records based on the Phase 1 SEO baseline. The pilot proved the pipeline mechanics, but Batch 2 needs an explicit selection contract so the migration run, SEO review, and PR evidence all refer to the same corpus.

## Behavior details

Old behavior:

- The repository only had the pilot subset input at `migration/input/pilot-source-ids.txt`.
- Batch 2 selection criteria existed in the ticket, but no locked source-id file documented which high-value records were in scope.
- The ticket's top-10 traffic SEO spot-check requirement was ambiguous because the original Phase 1 top-10 pages were already migrated in the pilot.

New behavior:

- `migration/input/batch2-source-ids.txt` now locks a 35-record Batch 2 set.
- The selection excludes all pilot records and draws from these non-pilot cohorts:
  - 90-day traffic priority routes (ranks 12-25 after pilot exclusions)
  - backlink-backed long-tail routes with known external links
  - top category routes by traffic
  - three video-related pages that populate the video taxonomy surfaces in the staged build
  - recent editorial-significance routes from the 28-day Search Console window
- The SEO owner decision for RHI-044 is recorded as: re-check the original Phase 1 top-10 traffic pages in the combined build rather than redefining the top-10 sample to only newly migrated Batch 2 pages.

Selected cohort summary:

- 14 traffic-priority content records from the signed-off 90-day top-pages export
- 7 backlink-backed long-tail records outside the pilot set
- 5 category route validation targets
- 3 video-related pages
- 6 28-day trending or editorial-significance records

## Impact

- Batch 2 pipeline runs can now use a committed subset input instead of an ad hoc candidate list.
- Manual SEO review can trace every expected route back to a fixed source-id selection.
- Category and video route checks remain combined-build validations; category source IDs are included for coverage traceability even though taxonomy routes are generated from the selected content corpus rather than emitted as standalone Markdown files.

## Verification

1. Refresh the full corpus before selection work:
   - `npm run migrate:extract`
   - `npm run migrate:normalize`
2. Confirm pilot exclusions against `migration/input/pilot-source-ids.txt`.
3. Verify the selected routes still map to `keep` category, page, or post records in `migration/intermediate/records.normalized.json`.
4. Run the RHI-044 subset pipeline with:
   - `npm run migrate:extract -- --source-id-file migration/input/batch2-source-ids.txt`

## Related files

- `migration/input/batch2-source-ids.txt`
- `migration/input/pilot-source-ids.txt`
- `migration/phase-1-seo-baseline.md`
- `analysis/tickets/phase-4/RHI-044-high-value-content-batch.md`
