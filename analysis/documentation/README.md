# Documentation Index

This directory holds structured analysis documentation for the migration project.

## Layout

| Location | Use for |
|----------|---------|
| `analysis/documentation/TEMPLATE.md` | Shared feature-documentation scaffold |
| `analysis/documentation/checklists/` | Reusable cross-phase checklists and operational guides |
| `analysis/documentation/governance/` | Repository process, agent, instruction, and policy change reports |
| `analysis/documentation/phase-1/` | Phase 1 implementation, kickoff, and sign-off docs |
| `analysis/documentation/phase-2/` | Phase 2 contracts and implementation docs |
| `analysis/documentation/phase-3/` | Phase 3 kickoff, bootstrap, implementation, and sign-off docs |
| `analysis/documentation/phase-4/` | Phase 4 migration-planning, source-policy, and sign-off docs |
| `analysis/documentation/phase-5/` | Phase 5 kickoff, bootstrap, SEO governance, and discoverability readiness docs |
| `analysis/documentation/phase-6/` | Phase 6 bootstrap, redirect governance, and URL-preservation readiness docs |
| `analysis/documentation/phase-7/` | Phase 7 deployment workflow, cutover-readiness, and validation docs |
| `analysis/documentation/phase-8/` | Phase 8 validation, audit, and launch-readiness docs |
| `analysis/documentation/phase-9/` | Phase 9 stabilization, post-cutover execution, and closeout docs |

## Placement Rules

1. Put phase-specific implementation, kickoff, contract, and sign-off docs in the matching `phase-N/` directory.
2. Put reusable checklists and shared operational guidance in `checklists/`.
3. Put repository governance, agent, instruction, and policy change reports in `governance/`.
4. Keep `TEMPLATE.md` and this index at the root so contributors can find the structure quickly.
5. If a clear new category is needed, create it under `analysis/documentation/` and update this index in the same change.

## Current Entry Points

- [Template](TEMPLATE.md)
- [Checklists](checklists/)
- [Governance docs](governance/)
- [Chrome DevTools MCP skill](governance/chrome-devtools-mcp-skill-2026-04-11.md)
- [Favicon logo contract](governance/favicon-logo-contract-2026-04-07.md)
- [Downloadable file URL convention](governance/downloadable-file-url-convention-2026-03-13.md)
- [Home RSS filtering](governance/home-rss-filtering-2026-04-06.md)
- [Local video shortcode CI gate](governance/local-video-shortcode-ci-gate-2026-03-16.md)
- [Phase 3 performance baseline retirement](governance/phase-3-performance-baseline-retirement-2026-03-17.md)
- [Image caption writing skill](governance/image-caption-writing-skill-2026-03-23.md)
- [Phase 1 docs](phase-1/)
- [Phase 2 docs](phase-2/)
- [Phase 3 docs](phase-3/)
- [Phase 4 docs](phase-4/)
- [Phase 5 docs](phase-5/)
- [Phase 6 docs](phase-6/)
- [Phase 7 docs](phase-7/)
- [Phase 8 docs](phase-8/)
- [Phase 9 docs](phase-9/)
- [Phase 9 caption quality rule update](phase-9/RHI-094-caption-quality-rule-update-2026-03-23.md)
- [Phase 9 caption nearby-text QA](phase-9/RHI-094-caption-nearby-text-recheck-qa-2026-03-23.md)
- [Phase 9 caption reviewed exception allowlist](phase-9/RHI-094-caption-reviewed-exception-allowlist-2026-03-23.md)
- [Phase 9 caption recheck closeout summary](phase-9/RHI-094-img-caption-recheck-closeout-batches-5-8-2026-03-23.md)
- [Phase 9 caption redundancy cleanup audit](phase-9/RHI-094-caption-redundancy-cleanup-audit-2026-03-23.md)
- [Phase 9 batch 5 caption recheck](phase-9/RHI-094-img-caption-batch-5-recheck-2026-03-23.md)
- [Phase 9 batch 6 caption recheck](phase-9/RHI-094-img-caption-batch-6-recheck-2026-03-23.md)
- [Phase 9 batch 7 caption recheck](phase-9/RHI-094-img-caption-batch-7-recheck-2026-03-23.md)
- [Phase 9 batch 8 caption recheck](phase-9/RHI-094-img-caption-batch-8-recheck-2026-03-23.md)
- [Phase 9 Hugo crash and HOLD drift remediation](phase-9/RHI-094-hugo-crash-and-hold-drift-remediation-2026-03-23.md)
- [Phase 9 bootstrap monitoring scaffold](phase-9/RHI-093-bootstrap-monitoring-scaffold-2026-03-24.md)
- [Phase 9 kickoff announcement](phase-9/RHI-093-phase-9-kickoff-announcement-2026-03-24.md)
- [Phase 9 external article link new-tab audit](phase-9/external-article-link-new-tab-audit-2026-03-24.md)
- [Phase 9 footer external link new-tab follow-up](phase-9/footer-external-link-new-tab-follow-up-2026-03-24.md)
- [Phase 9 video hub external link new-tab follow-up](phase-9/video-hub-external-link-new-tab-follow-up-2026-03-25.md)
- [Phase 9 home/archive summary and caption cleanup](phase-9/home-archive-summary-caption-cleanup-2026-04-19.md)
- [Phase 9 archive/topic/mobile audit follow-up](phase-9/archive-topic-mobile-follow-up-2026-04-19.md)
- [Phase 9 article image zoom modal](phase-9/article-image-zoom-modal-2026-05-05.md)
- [Phase 9 homepage hero project balance](phase-9/homepage-hero-project-balance-2026-05-06.md)

## Naming Conventions

- Preserve established filenames such as `rhi-###-...` and date-stamped suffixes.
- Use phase folders for scope; do not encode the phase twice in a new naming pattern beyond existing filenames.
- Keep one document focused on one feature, contract, report, or tightly related change set.

## Related Guidance

- [.github/instructions/documentation-updates.instructions.md](../../.github/instructions/documentation-updates.instructions.md)
- [.github/skills/documentation/SKILL.md](../../.github/skills/documentation/SKILL.md)
- [AGENTS.md](../../AGENTS.md)
