---
description: 'Allow multiple developer subagents in parallel only when feature slices are independent and cross-agent file-awareness is explicit'
applyTo: '**'
---

# Parallel Developer Subagent Execution

## Mandatory Pre-Step

Before launching multiple developer subagents:

1. Complete required PM/BA research and reconciliation from `.github/instructions/pm-ba-subagent-research.instructions.md`.
2. Confirm no narrower safety instruction requires a specialist-first flow for the requested scope.
3. Classify each requested feature slice as `parallel-safe` or `sequential-only`.

## Trigger Conditions

Apply this instruction when all of the following are true:

1. The user request includes two or more implementation features.
2. At least two features can be delivered without blocking dependencies.
3. Parallel execution is explicitly requested by the user or proposed and accepted in the current task.

## Required Action

When trigger conditions are met:

1. Create a subagent assignment map that includes per-slice primary files and shared files.
2. In every subagent prompt, include a cross-agent notice that peers may adjust related files:
   - Required sentence (or equivalent):
     - "Other subagents are running in parallel and may adjust related files you did not touch; treat those changes as expected and reconcile safely."
3. Include full task context and acceptance criteria in each subagent prompt; do not assume subagents inherit full coordinator context.
4. Require each subagent to report files changed and unresolved overlaps.
5. Run an integration pass after parallel execution to reconcile overlaps and finalize consistency.
6. If independence cannot be proven, switch to sequential execution.

## Binary Compliance Expectations

This requirement passes only if one of the following is true:

1. Trigger conditions are not met and the response states parallel subagents were not used.
2. Trigger conditions are met and all are true:
   - parallel assignment map exists,
   - each subagent received the cross-agent notice,
   - integration pass was completed,
   - final response includes overlap/reconciliation evidence.

## Relationship to Other Governance Instructions

This instruction is additive and does not replace existing governance requirements.

1. `.github/instructions/pm-ba-subagent-research.instructions.md` remains mandatory before implementation work.
2. `.github/instructions/hugo-specialist-subagent.instructions.md` remains mandatory when design/Hugo triggers are met.
3. File-scoped safety instructions (for example Hugo, SEO, CI, migration data) take precedence for their matched paths.
4. If overlap is ambiguous, apply precedence from `.github/instructions/agent-governance-quality.instructions.md` and choose the safer interpretation.

## When This Is Not Required

Do not run multiple developer subagents in parallel when any of the following is true:

1. The task is single-feature, single-file, or a simple correction.
2. The work touches shared high-risk governance files:
   - `.github/agents/**`
   - `.github/instructions/**`
   - `analysis/main-plan.MD`
3. Dependencies between slices are unresolved.
4. Acceptance criteria are ambiguous or conflicting.

## Escalation Path

If it is unclear whether parallel execution is safe:

1. Escalate to the user with exact dependency or overlap uncertainty.
2. Provide the safest sequential fallback plan.
3. Mark assumptions and unresolved conflicts explicitly.

## References

- `.github/instructions/pm-ba-subagent-research.instructions.md`
- `.github/instructions/agent-governance-quality.instructions.md`
- https://code.visualstudio.com/docs/copilot/customization/custom-agents
- https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions
