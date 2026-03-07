---
name: documentation
description: 'Guides documentation updates for new or changed features, workflows, and governance. Use when adding, changing, or deprecating behavior that users or maintainers must understand.'
license: Forward Proprietary
compatibility: VS Code 1.x+, GitHub Copilot
---

# Documentation Skill

Provides a repeatable workflow to keep project documentation aligned with feature and process changes.

## When to Use This Skill

- Adding, changing, or deprecating scripts, workflows, templates, or governance rules.
- Introducing new behavior that affects usage, build, deployment, or migration steps.
- Updating quality gates, acceptance criteria, or operational runbooks.
- **Not for:** purely editorial fixes or content-only edits with no behavior change.

## Prerequisites

- A clear understanding of what changed and who it impacts.
- The primary doc location where the change should be recorded.

## Quick Start

1. Identify the change type and impacted audience.
2. Update or create a doc in `analysis/documentation/`.
3. Include: what changed, why, and how to verify.
4. Link to affected files and related plan phases if applicable.

## How to Use

### Basic Usage

1. Write a short change summary and scope boundary.
2. Record behavioral changes and any new assumptions.
3. Add verification steps or references to existing gates.
4. Confirm the doc location is discoverable from the repo root or plan.

### Advanced Usage

Use a dedicated doc when the change alters multiple workflows or adds new tooling:

- Add a new doc under `analysis/documentation/` with a clear title.
- Include a "Migration impact" note if URLs, content, or SEO behaviors change.
- Add a lightweight changelog section if the process will evolve further.

## Quick Reference

| Change type | Minimum doc update | Suggested location |
|------------|--------------------|--------------------|
| New script or tool | Purpose, inputs, outputs, run steps | `analysis/documentation/` |
| Workflow change | Steps, gates, rollback notes | `analysis/documentation/` |
| Quality gate change | New criteria and evidence | `analysis/documentation/` |
| Plan or phase change | Updated scope and dependencies | `main-plan.MD` or `analysis/plan/` |

## Required Feature Doc Sections

For new or changed features, include these sections in the documentation update:

1. `Change summary`
2. `Why this changed`
3. `Behavior details` (old vs new when updating an existing feature)
4. `Impact` (users, maintainers, and affected workflows)
5. `Verification` (tests, checks, or manual validation)
6. `Related files`

## Examples

### Example 1: New migration script

- Add a doc describing inputs, outputs, and rerun safety.
- Link to the script and any validation outputs.

### Example 2: Updated deploy workflow

- Document the new gate sequence and required evidence.
- Note the rollback path and owner.

## Troubleshooting

### Issue: Unsure where to document a change

**Cause:** No existing doc matches the change scope.
**Solution:** Create a new doc under `analysis/documentation/` and flag open questions for review.

## References

- [Skill Authoring Guide](../skill-authoring/SKILL.md) - Structure and formatting expectations for skills
- [.github/instructions/documentation-updates.instructions.md](../../instructions/documentation-updates.instructions.md) - Documentation gate that invokes this skill
