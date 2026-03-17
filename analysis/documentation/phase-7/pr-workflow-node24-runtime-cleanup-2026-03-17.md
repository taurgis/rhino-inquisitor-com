# PR Workflow Node 24 Runtime Cleanup

## Change summary

Aligned the pull request validation workflow with the deploy workflow's GitHub Actions runtime cleanup by opting repo-controlled JavaScript actions into Node 24 and upgrading the helper action majors used in .github/workflows/build-pr.yml.

## Why this changed

The deploy workflow had already been updated to reduce GitHub Actions Node 20 deprecation noise for repo-controlled helper actions. The PR workflow still used older helper action majors, so the repository's two primary CI workflows were inconsistent even though they shared the same checkout, setup-node, cache, and artifact-upload patterns.

## Behavior details

### Old behavior

- .github/workflows/build-pr.yml used actions/checkout@v4, actions/setup-node@v4, actions/cache@v4, and actions/upload-artifact@v4.
- The workflow did not set FORCE_JAVASCRIPT_ACTIONS_TO_NODE24.
- actions/setup-node relied on its default package-manager cache behavior, which could drift from the repository's explicit npm and node_modules cache steps on newer majors.

### New behavior

- .github/workflows/build-pr.yml now sets FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true at workflow scope.
- Repo-controlled helper actions now use actions/checkout@v5, actions/setup-node@v5, actions/cache@v5, and actions/upload-artifact@v6.
- Every actions/setup-node@v5 step sets package-manager-cache: false so the workflow keeps using the repository's explicit cache steps and does not add implicit npm cache behavior.
- Job triggers, permissions, NODE_VERSION, Hugo build commands, gate ordering, artifacts, and route-sensitive conditions are unchanged.

## Impact

- Affects pull request CI runtime management only.
- Reduces Node 20 deprecation warnings for repo-controlled JavaScript helper actions used by the PR workflow.
- Preserves the existing PR validation behavior, cache contract, and artifact outputs.
- Does not change Pages deployment behavior or the official Pages action trio because they are not used in .github/workflows/build-pr.yml.

## Verification

- Review .github/workflows/build-pr.yml and confirm every repo-controlled helper action major matches the deploy workflow cleanup pattern.
- Confirm each actions/setup-node@v5 step includes package-manager-cache: false.
- Run the PR workflow in GitHub Actions and confirm the jobs still execute the same validation/build steps while the repo-controlled helper actions no longer emit Node 20 runtime deprecation warnings.
- Confirm artifact uploads and cache restore/save steps still succeed in the migration batch, build, accessibility, and performance jobs.

## Related files

- .github/workflows/build-pr.yml
- analysis/tickets/phase-7/RHI-079-deployment-quality-gates-tooling.md
- analysis/documentation/phase-7/rhi-079-deployment-quality-gates-tooling-2026-03-17.md
