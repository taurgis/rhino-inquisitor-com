## Change summary

Updated the pull-request build workflow so Phase 4 migration-batch PRs no longer fail the generic full-site route gates by construction. The workflow now classifies each PR into a validation mode, routes migration-batch PRs through staged subset route checks inside `migration-batch-validation`, and only runs full-manifest route validation when the PR is an ordinary route-sensitive change without migration-batch scope.

## Why this changed

The existing `.github/workflows/build-pr.yml` logic treated any `route_sensitive` PR as a full-site validation candidate. That blocked pilot migration PRs because the generic `build` job ran `npm run check:url-parity`, `npm run check:seo`, and `npm run check:links` against `src/content`, while Phase 4 pilot branches intentionally carry only a staged subset there. The dedicated `migration-batch-validation` job is the correct validation surface for staged subset content in `migration/output/content`, so the generic full-manifest route gate was producing deterministic false failures.

## Behavior details

### Old behavior

- `prepare` only emitted `route_sensitive`, `markdown_changed`, and `migration_batch_changed`.
- Any PR with `route_sensitive=true` ran the generic full-site route checks in `build`.
- `workflow_dispatch` forced all three flags to `true`, which made manual reruns behave like the broadest possible route-sensitive PR.

### New behavior

- `prepare` now computes a `validation_mode` plus `full_site_route_validation_required`.
- `workflow_dispatch` diffs the current branch against `origin/main` instead of forcing all flags to `true`.
- The generic `build` job still runs markdown lint, front matter validation, and a production Hugo build for all PRs.
- The generic full-site route checks (`check:url-parity`, `check:seo`, and `check:links`) now run only when `full_site_route_validation_required=true`.
- Migration-batch PRs keep the dedicated `migration-batch-validation` lane as the authoritative subset gate.
- That staged lane now runs selected-record URL parity, selected-record redirect validation, staged SEO completeness, and staged internal-link checks against `migration/output/content` and `tmp/migration-pr-public`.
- Ordinary route-sensitive PRs without migration-batch scope keep the full-site route gates.

## Impact

- Affected workflow: `.github/workflows/build-pr.yml`.
- Affected audience: maintainers reviewing migration-batch PRs and any contributor relying on PR build signals.
- Ordinary route-sensitive PRs keep the existing full-manifest validation path.
- Migration-batch PRs no longer fail on full-site `src/content` parity checks that cannot pass until the full corpus is migrated.
- Validator changes that stay inside migration-batch scope continue to be exercised by the staged subset validation lane instead of being forced through the incompatible full-site parity gate.

## Verification

1. Reviewed the current gate contracts in `analysis/plan/details/phase-2.md` and `analysis/plan/details/phase-7.md` before modifying the workflow.
2. Confirmed official GitHub Actions guidance for `pull_request` base or head SHA handling, job outputs, job-level `if` conditions, and required-check safety for skipped jobs.
3. Local validation of the current branch after the surrounding content fixes:
   - `npm run validate:frontmatter`
   - `npx markdownlint-cli2 migration/output/content/posts/*.md migration/output/content/pages/*.md`
   - `npx markdownlint-cli2 migration/input/body-overrides/about.md`
4. Post-change workflow validation expectations:
   - migration-batch PR: `validation_mode=migration-batch-only`, generic full-site route checks skipped, and staged subset URL parity, redirect, SEO, and link checks remain blocking inside `migration-batch-validation`.
   - ordinary route-sensitive PR: `validation_mode=full-site-route-sensitive`, full-site route checks still run.

## Related files

- `.github/workflows/build-pr.yml`
- `analysis/plan/details/phase-2.md`
- `analysis/plan/details/phase-7.md`
- `analysis/tickets/phase-4/RHI-043-pilot-batch-migration.md`


---

## 2026-03-13 follow-up: URL parity regression suite gate

### Change summary

Added an unconditional npm run test:url-parity step to the build job in .github/workflows/build-pr.yml so URL parity regression tests run on every PR validation run, not only route-sensitive changes.

### Why this changed

npm run test:url-parity was available as a local regression suite but was not wired into PR automation. That left a gap where validator regressions could merge undetected if a PR did not trigger the route-sensitive full-site gate path.

### Behavior details

#### Old behavior

- PR workflow executed npm run check:url-parity only when full_site_route_validation_required=true.
- The URL parity Node test suite npm run test:url-parity was not executed in CI.
- Non-route-sensitive PRs had no automated regression test coverage for URL parity validator logic.

#### New behavior

- The build job now runs npm run test:url-parity after npm ci on every PR and manual workflow run.
- Route-sensitive parity checks with npm run check:url-parity remain unchanged and still run conditionally when full-site route validation is required.
- CI now enforces both: a fast unit-style regression suite on every change and full-manifest parity validation when route-sensitive triggers are present.

### Impact

- Affected workflow: .github/workflows/build-pr.yml.
- Affected gate behavior: URL parity regression test failures now block PR validation regardless of changed-file classification.
- Migration-batch and non-route-sensitive PRs gain baseline protection against validator regressions without changing existing route-sensitive gating rules.

### Verification

1. Run npm run test:url-parity locally and confirm exit code 0 on current branch.
2. Confirm .github/workflows/build-pr.yml contains Run URL parity regression suite in the build job with no if condition.
3. Confirm existing Run URL parity check step still retains if: needs.prepare.outputs.full_site_route_validation_required == true.

### Related files

- .github/workflows/build-pr.yml
- package.json
- scripts/migration/validate-url-parity.test.js
