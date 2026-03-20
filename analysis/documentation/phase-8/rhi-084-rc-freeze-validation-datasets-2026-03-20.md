# RHI-084 RC Freeze and Validation Datasets

## Change Summary

RHI-084 replaced the Phase 8 validation placeholders with RC-backed datasets, a reproducible generator script, and a freeze record tied to `phase-8-rc-v1`. The repository now has committed machine-readable inputs for URL outcomes, representative page coverage, and priority-route verification instead of relying on ticket prose and ad hoc selection.

## Why This Changed

WS-B through WS-H need one immutable contract for the Phase 8 release candidate. Before this change, `validation/README.md` only described placeholder ownership and the repository had no committed RC freeze record or reusable dataset generator.

## Behavior Details

Old behavior:

- `validation/README.md` documented placeholder ownership only.
- `validation/expected-url-outcomes.json`, `validation/sample-matrix.json`, and `validation/priority-routes.json` did not exist.
- Downstream tickets would have needed to reinterpret the manifest, SEO baseline tables, and template-family coverage rules by hand.

New behavior:

- `scripts/phase-8/generate-validation-datasets.js` generates the three RHI-084 datasets from the frozen manifest, the Phase 1 SEO baseline, the repository content tree, and a built RC artifact.
- `validation/expected-url-outcomes.json` now distinguishes canonical migration intent from build-level validation mode so query-string request-aware routes remain visible without making WS-B enforce impossible Pages behavior.
- `validation/sample-matrix.json` now covers homepage, recent posts, archive routes, category terms, legal/privacy pages, video-capable pages/posts, taxonomy roots, redirect helpers, the 404 output, and system outputs.
- `validation/priority-routes.json` now preserves the Phase 1 ranking order for organic and link-equity sources while adding deterministic supplements for missing URL classes.
- `migration/phase-8-rc-record.md` and `validation/runs/phase-8-rc-v1.json` record the frozen RC SHA, toolchain versions, checksums, build evidence, and inherited publish timing baseline.

## Impact

- WS-B can consume `validation/expected-url-outcomes.json` without inventing its own exception model for query-string routes.
- WS-C through WS-F have a committed sample matrix that explicitly marks page-facing versus auxiliary validation modes.
- WS-H has both human-readable and machine-readable RC provenance for go/no-go evidence.
- Maintainers can regenerate the datasets with `npm run phase8:generate-validation-datasets` once a matching RC build artifact exists.

## Verification

Verification performed for this update:

1. Built the frozen RC tag with `hugo --gc --minify --environment production --source tmp/phase-8-rc-v1-worktree --destination tmp/phase-8-rc-v1-worktree/tmp/phase-8-rc-v1-public`.
2. Confirmed Hugo build success with `204` pages and a top-level `index.html`.
3. Ran `node scripts/phase-7/validate-artifact.js --public-dir tmp/phase-8-rc-v1-worktree/tmp/phase-8-rc-v1-public --report tmp/phase-8-rc-v1-artifact-validation.json --label phase-8-rc-v1` and recorded a passing artifact report.
4. Generated the datasets with `node scripts/phase-8/generate-validation-datasets.js --public-dir tmp/phase-8-rc-v1-worktree/tmp/phase-8-rc-v1-public`.
5. Captured RC evidence, dataset checksums, and the inherited Phase 7 deploy timing baseline in `migration/phase-8-rc-record.md` and `validation/runs/phase-8-rc-v1.json`.

## Related Files

- `scripts/phase-8/generate-validation-datasets.js`
- `package.json`
- `migration/phase-8-rc-record.md`
- `validation/README.md`
- `validation/expected-url-outcomes.json`
- `validation/sample-matrix.json`
- `validation/priority-routes.json`
- `validation/runs/phase-8-rc-v1.json`
- `analysis/tickets/phase-8/RHI-084-rc-freeze-validation-dataset.md`