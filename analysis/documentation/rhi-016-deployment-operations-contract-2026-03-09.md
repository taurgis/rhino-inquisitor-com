# RHI-016 Deployment and Operations Contract - 2026-03-09

## Change summary

Finalized Phase 2 Workstream F by replacing open GitHub Pages deployment questions with an approved deployment and operations contract for later Phase 3 or Phase 7 workflow implementation.

## Why this changed

RHI-016 was still carrying incorrect or ambiguous assumptions around custom-domain authority, `CNAME` handling, checkout depth, artifact behavior, `.nojekyll`, and rollback mechanics. That left RHI-017 without a stable deployment-integrity contract and would have pushed avoidable launch risk into later phases.

## Behavior details

Old behavior:

- Workstream F only described the Pages workflow at a high level and left several operational details open.
- The ticket treated `CNAME` persistence, `.nojekyll`, checkout depth, and deploy-job-only rollback as unresolved research items.
- Artifact handling language implied an explicit artifact-name input was required and did not capture official artifact packaging or retention behavior.

New behavior:

- The contract now fixes workflow triggers, action versions and order, permissions, environment, concurrency rules, build command, checkout-depth rule, artifact path and constraints, and action pinning strategy.
- Pages settings or API are now the explicit custom-domain authority for custom GitHub Actions publishing; committed `CNAME` files are ignored and not required in that model.
- `.nojekyll` is explicitly not required for artifact-based Pages deployment.
- Rollback now uses GitHub's 30-day workflow rerun window or `workflow_dispatch` on the last known good commit instead of depending on deploy-job-only artifact reuse.
- Planning guardrails now exist for compressed artifact size, CI build time, and deployment timeout headroom.

## Impact

- Gives Phase 3 or Phase 7 an implementation-safe GitHub Pages workflow contract instead of a partially open research ticket.
- Gives RHI-017 explicit deployment-integrity inputs: permissions, action sequence, artifact packaging, custom-domain handling, rollback assumptions, and concurrency semantics.
- Removes incorrect custom-domain and `.nojekyll` assumptions that could have caused launch-day misconfiguration.

## Verification

- Reviewed against official GitHub Pages custom workflow, custom domain, Pages limits, workflow rerun, and official Pages action documentation on 2026-03-09.
- Cross-checked checkout-depth decision against RHI-012, which makes front matter `lastmod` authoritative from WordPress export metadata.
- Used Phase 1 inventory profiling to size the planning budget guardrails for primary rendered routes.

## Related files

- analysis/tickets/phase-2/RHI-016-deployment-operations-contract.md
- analysis/plan/details/phase-2.md
- analysis/tickets/phase-2/INDEX.md