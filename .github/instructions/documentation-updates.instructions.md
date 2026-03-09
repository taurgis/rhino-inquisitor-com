---
description: 'Require documentation updates when features are added or changed'
applyTo: '**'
---

# Documentation Update Gate

## Mandatory Pre-Step

When this gate is triggered, consult and apply `.github/skills/documentation/SKILL.md` before finalizing implementation changes.

## Trigger Conditions

Apply this gate when a change matched by `applyTo` adds, changes, or removes behavior that a maintainer or user must understand to operate the repo. Triggers include:

- New or modified scripts, workflows, templates, or configuration that changes behavior.
- New or updated quality gates, acceptance criteria, or governance requirements.
- Deprecations or removals that change how the system is used or maintained.

## Documentation Update Requirements

When triggered, the change must include at least one documentation update that meets **all** of the following:

1. **Location**: Update a file in `analysis/documentation/**` (preferred) using the structured layout below, or update `main-plan.MD` / `analysis/plan/**` when plan or phase scope changes.
	- `analysis/documentation/phase-N/` for phase-specific implementation, kickoff, contract, and sign-off docs
	- `analysis/documentation/checklists/` for reusable cross-phase checklists
	- `analysis/documentation/governance/` for repository process, agent, instruction, or policy change reports
	- Keep `analysis/documentation/TEMPLATE.md` and `analysis/documentation/README.md` at the root as the documentation anchors
2. **Change summary**: Describe what changed and why.
3. **Behavior details**: Include old vs new behavior when updating an existing feature.
4. **Impact and verification**: State impacted components or workflows and how to verify the change (steps or a reference to an existing gate).
5. **Related files**: Link or list implementation files touched by the feature change.

If any item above is missing, the change **does not pass** this gate.

## Exemptions

- Purely editorial or formatting-only changes with no behavior impact.
- Content-only edits under `content/**` that do not alter scripts, workflows, or governance.
- Changes that are exclusively documentation updates or documentation-governance scaffolding, with no runtime or workflow impact.

## Precedence and Conflict Handling

If this gate overlaps with a narrower instruction (for example `content-quality`, `hugo-coding-standards`, or `seo-compliance`), follow both. When requirements conflict, the narrower or safety-focused instruction takes precedence; this gate only adds documentation-update requirements.

## Escalation

If the documentation impact is unclear or no appropriate doc location exists, pause and ask for owner direction. If the category is clear but the target subdirectory does not exist yet, create the matching location under `analysis/documentation/**` and add it to `analysis/documentation/README.md`.
