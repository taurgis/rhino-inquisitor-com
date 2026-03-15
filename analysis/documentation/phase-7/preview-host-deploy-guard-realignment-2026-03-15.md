# Preview Host Deploy Guard Realignment

## Change summary

The GitHub Pages deploy workflow no longer hard-fails preview-host rehearsal deployments when `actions/configure-pages` reports the project Pages host instead of the final custom domain. The workflow now records host readiness in the job summary and continues with the preview-safe deployment path.

## Why this changed

Old behavior:

1. `.github/workflows/deploy-pages.yml` failed before the Node and Hugo validation gates if `actions/configure-pages` did not report `www.rhino-inquisitor.com`.
2. That behavior blocked the repository’s preview-first deployment model even though Phase 7 explicitly defines `https://taurgis.github.io/rhino-inquisitor-com/` as the rehearsal host before custom-domain cutover.
3. The deploy runbook described that host check as a blocking prerequisite, which no longer matched the phase plan once preview-host deployment remained the active operating mode.

New behavior:

1. The workflow still requires `actions/configure-pages` to return host metadata.
2. When the reported host is not `www.rhino-inquisitor.com`, the workflow writes a readiness notice to the step summary and continues in preview-host rehearsal mode.
3. Preview-host safety remains enforced by the preview rebuild, preview crawl-control validation, and `noindex, nofollow` checks before the Pages artifact is uploaded.

## Behavior details

Old behavior:

1. Non-canonical Pages hosts were treated as a deploy-time blocker.
2. Preview-host rehearsals could not complete even though the deployed artifact was the preview build rather than the production-validation build.

New behavior:

1. Non-canonical Pages hosts are treated as a cutover-readiness signal rather than a build blocker.
2. The workflow remains aligned with the preview-first model until the custom-domain cutover phase activates the canonical Pages host.

## Impact

1. Deploy runs on `main` can complete on the project Pages URL again.
2. Production validation remains part of the workflow, but the uploaded artifact continues to be the preview-safe build.
3. Maintainers still get explicit evidence in the Actions summary when the canonical custom domain is not yet active.

## Verification

1. Run the deploy workflow on a commit while GitHub Pages still reports the project Pages host.
2. Confirm the host step writes a readiness notice instead of failing the run.
3. Confirm the workflow continues through preview rebuild, preview crawl-control validation, Pages artifact upload, and deploy.
4. Confirm the deployed preview artifact still emits `noindex, nofollow` and preview-path-correct asset URLs.

## Related files

1. `.github/workflows/deploy-pages.yml`
2. `docs/migration/RUNBOOK.md`
3. `analysis/documentation/phase-5/rhi-050-crawlability-indexing-controls-implementation-2026-03-13.md`
4. `analysis/tickets/phase-7/RHI-074-deployment-workflow-architecture.md`
5. `analysis/plan/details/phase-7.md`