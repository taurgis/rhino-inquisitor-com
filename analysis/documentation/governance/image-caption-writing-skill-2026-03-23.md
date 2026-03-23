# Image Caption Writing Skill - 2026-03-23

## Change summary

Added a new Agent Skill, `.github/skills/image-caption-writing/`, that codifies image-caption quality rules from the recent RHI-094 caption cleanup and recheck work. The skill defines clear keep/rewrite/remove criteria, low-value caption signals, post-figure paragraph handling, and review evidence expectations.

## Why this changed

Caption cleanup decisions were previously distributed across multiple Phase 9 audit and recheck documents. Contributors needed a single reusable skill to apply the same quality standard during future content review and migration stabilization work.

## Behavior details

Old behavior:
- Caption quality guidance existed across Phase 9 execution and audit docs only.
- Reviewers could apply inconsistent interpretation of low-value captions and nearby-text duplication.
- No dedicated skill existed for rapid caption keep/rewrite/remove decisioning.

New behavior:
- A dedicated `image-caption-writing` skill now provides one decision workflow for caption review.
- The workflow explicitly compares caption text against alt text and nearby body copy before disposition.
- Low-value caption patterns (section restatements, raw URL labels, unreferenced figure labels) are called out as removal candidates.
- A companion rubric reference file provides a compact decision matrix and review-notes template.

## Impact

- Affected contributors: content reviewers, migration maintainers, and AI-agent operators working on image-caption quality.
- Affected workflow: future caption cleanup and stabilization work can activate one skill instead of reconstructing rules from multiple phase docs.
- Discoverability: the skill is indexed from both `AGENTS.md` and `analysis/documentation/README.md`.
- Scope: documentation/governance and AI guidance only; no runtime or build behavior changed.

## Verification

1. Confirm skill folder and required file exist:
- `.github/skills/image-caption-writing/SKILL.md`
- `.github/skills/image-caption-writing/references/CAPTION-RUBRIC.md`

2. Confirm skill guidance includes:
- Good vs bad caption rules
- Keep/rewrite/remove decision workflow
- Edge-case guidance from RHI-094 cleanup outcomes

3. Confirm companion reference exists and is linked:
- `.github/skills/image-caption-writing/references/CAPTION-RUBRIC.md`

4. Confirm discoverability update exists in documentation index:
- `analysis/documentation/README.md`

5. Confirm discoverability update exists in the repository agent guide:
- `AGENTS.md`

## Related files

- `.github/skills/image-caption-writing/SKILL.md`
- `.github/skills/image-caption-writing/references/CAPTION-RUBRIC.md`
- `AGENTS.md`
- `analysis/documentation/README.md`
- `analysis/documentation/phase-9/RHI-094-caption-quality-rule-update-2026-03-23.md`
- `analysis/documentation/phase-9/RHI-094-caption-redundancy-cleanup-audit-2026-03-23.md`
- `analysis/documentation/phase-9/RHI-094-caption-reviewed-exception-allowlist-2026-03-23.md`

## References

- https://code.visualstudio.com/docs/copilot/customization/agent-skills
- https://code.visualstudio.com/docs/copilot/concepts/customization
- https://agentskills.io/specification
