# RHI-074 — Deployment Workflow Architecture

**Date:** 2026-03-16
**Phase:** 7
**Ticket:** RHI-074
**Status:** Done
**Author:** Engineering Owner

---

## Change Summary

RHI-074 audited and hardened the GitHub Pages deployment workflow to satisfy Phase 7 acceptance criteria. The primary gap identified in the pre-existing workflow was a missing `url:` field on the `deploy` job's `environment:` declaration, which prevented the deployment URL from being surfaced in the GitHub Deployments panel. All other Phase 7 structural requirements were already satisfied by the workflow produced in Phase 3 (RHI-029) and later Phase 5/6 gate additions.

---

## Old vs. New Behavior

### `deploy-pages.yml` — deploy job environment declaration

**Before:**
```yaml
environment: github-pages
```

**After:**
```yaml
environment:
  name: github-pages
  url: ${{ steps.deployment.outputs.page_url }}
```

**Impact:** The deployment URL is now registered with the `github-pages` environment and displayed in the GitHub Deployments panel and the Environment tab on the repository. The URL was already being written to the Actions step summary; this change registers it with GitHub's Deployments API so it is linkable from PRs, branches, and the repository home page.

### `docs/migration/RUNBOOK.md` — Phase 7 section

**Before:** A one-line placeholder: `Placeholder for release-day workflow, DNS validation, HTTPS checks, and rollback coordination.`

**After:** A full Phase 7 deployment runbook section (RHI-074) covering:
- Two methods for triggering a deployment (push to `main` or `workflow_dispatch`)
- The complete ordered gate sequence (production validation build → 21 blocking quality gates → preview rehearsal build → artifact upload → deploy)
- A gate-by-gate failure interpretation table with local reproduction commands
- Rollback instructions (re-run prior deploy job first; fallback to `workflow_dispatch` on a known-good commit; do not re-run build job only)
- Environment protection explanation
- Preview-rehearsal vs. production-validation build purpose distinction

---

## Audit Findings: Pre-Existing Compliance

The following Phase 7 RHI-074 acceptance criteria were already satisfied by the workflow before this ticket's changes:

| Criterion | Result |
|---|---|
| Triggers on push to `main` and `workflow_dispatch` | ✅ passes |
| Top-level `permissions: contents: read` only; no `write-all` | ✅ passes |
| `env: HUGO_VERSION` pinned to `0.157.0` | ✅ passes |
| `actions/checkout@v4` with `fetch-depth: 0` | ✅ passes |
| `actions/configure-pages` runs before Hugo build, `id: pages` | ✅ passes |
| Preview build uses `${{ steps.pages.outputs.base_url }}` | ✅ passes |
| `actions/upload-pages-artifact` with `path: ./public` | ✅ passes |
| Deploy job `needs: build` | ✅ passes |
| Deploy job `permissions: pages: write, id-token: write` | ✅ passes |
| Deploy job `concurrency: group: pages, cancel-in-progress: false` | ✅ passes |
| Deploy job uses `actions/deploy-pages@v4` | ✅ passes |
| Separate production validation build path exists | ✅ passes |
| `build-pr.yml` has correct trigger, permissions, concurrency, and gates | ✅ passes |

The single gap was the `environment.url` field described above.

---

## Impacted Components

| Component | Change Type |
|---|---|
| `.github/workflows/deploy-pages.yml` | Bug fix — expanded `environment:` declaration |
| `docs/migration/RUNBOOK.md` | New content — Phase 7 deployment runbook section |
| `analysis/tickets/phase-7/RHI-074-deployment-workflow-architecture.md` | Status update — marked Done |
| `analysis/tickets/phase-7/INDEX.md` | Status update — RHI-074 row changed to Done |

---

## Verification

1. **Local YAML validation**: run `cat .github/workflows/deploy-pages.yml | grep -A3 'environment:'` in the `deploy` job block and confirm the `name:` and `url:` keys are present.
2. **Post-deploy check**: after the next successful `workflow_dispatch` or push-to-main deployment, confirm the deployment URL appears in the GitHub Deployments panel under the `github-pages` environment.
3. **RUNBOOK review**: open `docs/migration/RUNBOOK.md` and verify the `## Phase 7 - Deployment Cutover` section contains the RHI-074 subsection with gate table and rollback instructions.

---

## Related Files

- [.github/workflows/deploy-pages.yml](../../../../.github/workflows/deploy-pages.yml)
- [.github/workflows/build-pr.yml](../../../../.github/workflows/build-pr.yml)
- [docs/migration/RUNBOOK.md](../../../../docs/migration/RUNBOOK.md)
- [analysis/tickets/phase-7/RHI-074-deployment-workflow-architecture.md](../../tickets/phase-7/RHI-074-deployment-workflow-architecture.md)
- [analysis/tickets/phase-7/INDEX.md](../../tickets/phase-7/INDEX.md)
