# Hugo Specialist Subagent Instruction Update - 2026-03-08

## Change summary

Added a new repository instruction that requires invoking the Hugo Specialist subagent when a request needs expert guidance on website design direction or Hugo implementation decisions.

## Why this changed

Design-heavy and Hugo-specific requests benefit from domain-specialist recommendations before implementation. Making this invocation explicit improves consistency and lowers avoidable rework across template, configuration, and deployment decisions.

## Behavior details

Old behavior:
- Hugo Specialist invocation was optional and depended on operator judgment.

New behavior:
- Hugo Specialist invocation is mandatory when defined design/Hugo trigger conditions are met.
- The new instruction includes binary pass/fail compliance expectations, explicit exemptions, and an escalation path for ambiguous or conflicting guidance.
- The requirement is additive and does not replace existing PM/BA/Tester/Official Docs governance requirements.

## Impact

- Improves consistency of design and Hugo decision quality across requests.
- Increases traceability by requiring subagent evidence in final responses when the trigger applies.
- Reduces ambiguity by documenting when the requirement is not needed.

## Verification

- Confirm `.github/instructions/hugo-specialist-subagent.instructions.md` exists and has valid frontmatter (`description`, `applyTo`).
- Confirm the instruction includes trigger conditions, required action, exemptions, and escalation path sections.
- Confirm the instruction references existing governance files for precedence and conflict handling.

## Related files

- `.github/instructions/hugo-specialist-subagent.instructions.md`
- `.github/agents/hugo-specialist.agent.md`
- `.github/instructions/pm-ba-subagent-research.instructions.md`
- `.github/instructions/agent-governance-quality.instructions.md`