---
description: 'Enforce quality and completion standards for agent and instruction governance files'
applyTo: '.github/agents/**,.github/instructions/**'
---

# Agent and Instruction Governance Quality Gate

## Purpose

Ensure agent and instruction files are complete, testable, and conflict-safe before merge.

## Mandatory Checks

1. Every `.agent.md` file must define:
   - Explicit `Scope` and `Out of scope` sections (or equivalent headings with the same intent).
   - A concrete `Working approach` with ordered steps.
   - A required output format or section schema.
   - At least one quality rule that makes outputs independently verifiable.

2. Every new or modified `.instructions.md` file in the current task must define:
   - Clear trigger conditions (`applyTo` plus any pre-check criteria).
   - Binary compliance expectations (pass/fail where possible).
   - Exemption conditions and the boundary of those exemptions.
   - Escalation path for high-risk or ambiguous cases when the file introduces blocking gates, governance controls, or deployment-impacting requirements.

3. Cross-file conflict check is mandatory:
   - New or modified rules must not conflict with existing repo-level instructions.
   - If overlap is required, document precedence in the file.
   - Avoid redundant rules duplicated across multiple instruction files unless scoped differently.

## Precedence Model

When instruction overlap occurs, apply this precedence order:

1. Narrower `applyTo` scope overrides broader `applyTo` scope.
2. Rules with explicit safety constraints override non-safety process rules.
3. If still ambiguous, follow the most conservative safe interpretation and document the conflict in the final response.

4. PM/BA/Tester governance handoff check is mandatory for `.github/agents/**` updates:
   - PM includes planning and risk framing.
   - BA includes requirement and acceptance-criteria traceability.
   - Tester includes verification coverage and severity-based quality risk reporting.

5. Official source traceability check:
   - Any new technical claim about platform behavior must cite an official documentation source.
   - If no source is available, mark it as assumption and avoid framing it as fact.

6. Subagent evidence check:
   - If an instruction requires a subagent, include evidence in the final response that the subagent ran and summarize its actionable output.

## Completion Criteria

A governance change is complete only when:

- All mandatory checks above pass.
- The final response includes the required change provenance report.
- Residual risks and unvalidated areas are explicitly documented.

## Escalation Path

If this governance gate conflicts with another instruction or is not fully satisfiable in the current task:

1. Escalate to the user with the exact conflicting rules and impacted files.
2. Apply the precedence model in this file and choose the safest feasible interpretation.
3. Document assumptions and unresolved compliance gaps in the final response.

## When This Is Not Required

- Purely editorial changes that do not alter behavior, requirements, constraints, or enforcement logic.
- File renames with no content changes.

## References

- [GitHub Copilot repository instructions](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions)
- [GitHub custom instruction support matrix](https://docs.github.com/en/copilot/reference/custom-instructions-support)
- [VS Code custom agents](https://code.visualstudio.com/docs/copilot/customization/custom-agents)
- [VS Code custom instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)
