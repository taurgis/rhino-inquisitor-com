# Senior QA Engineer Agent Rename - 2026-03-09

## Change summary

Renamed the repository custom agent from `Tester` to `Senior QA Engineer`, updated its canonical `.agent.md` filename, and synchronized active governance and guide references to the new identity.

## Why this changed

The repository uses custom agents as explicit workflow roles. The old `Tester` label described the function accurately but underrepresented the level of independent verification, severity-based risk judgment, and release-readiness evidence the role is expected to provide.

## Behavior details

Old behavior:
- The QA role was published as `Tester` from `.github/agents/tester.agent.md`.
- Active governance and guide documents instructed operators to run `Tester` for verification-oriented review.
- The agent definition emphasized verification and release readiness, but did not explicitly call out untestable acceptance criteria or the need to separate confirmed defects from residual risks.

New behavior:
- The QA role is now published as `Senior QA Engineer` from `.github/agents/senior-qa-engineer.agent.md`.
- Active governance and guide documents now instruct operators to run `Senior QA Engineer` for verification-oriented review.
- The agent contract remains functionally the same, with small quality improvements:
  - explicit challenge of ambiguous or untestable acceptance criteria
  - explicit separation of confirmed defects from residual or unvalidated risks
  - stronger evidence expectations in reproducibility guidance

## Impact

- Maintainers now have one canonical QA agent name across `.github/agents/`, `.github/instructions/`, and `AGENTS.md`.
- VS Code and GitHub Copilot custom-agent discovery should show the new identity after refresh because both the frontmatter `name` and the agent filename now match.
- Existing workflow intent is preserved: PM plans, BA defines requirements, and Senior QA Engineer verifies coverage, severity, and release recommendation.

## Verification

- Manual reference scan for active `Tester` mentions in `.github/**`, `AGENTS.md`, and `analysis/documentation/**`.
- Official-doc check against GitHub Copilot and VS Code custom-agent guidance to confirm that agent filenames and agent names are both identity surfaces that must be updated together.
- Post-change validation target for operators:
  - confirm the new agent appears in the custom-agent picker after refresh
  - confirm chat diagnostics show the renamed agent file loading without errors

## Related files

- `.github/agents/senior-qa-engineer.agent.md`
- `.github/agents/project-manager.agent.md`
- `.github/agents/business-analyst.agent.md`
- `.github/agents/senior-developer.agent.md`
- `.github/instructions/pm-ba-subagent-research.instructions.md`
- `.github/instructions/agent-governance-quality.instructions.md`
- `.github/instructions/hugo-specialist-subagent.instructions.md`
- `AGENTS.md`
- `analysis/documentation/hugo-specialist-subagent-instruction-2026-03-08.md`