---
paths:
  - "src/content/posts/**"
---

<!-- GENERATED: forward-nexus ide-sync -->

Source: `.github/instructions/post-writing-skills.instructions.md`

# Post Writing Skill Routing

## Purpose

Ensure substantive post-authoring work uses the smallest useful set of repository writing skills instead of a generic all-skills rewrite pass.

## Trigger Conditions

Apply this instruction when a task on a matched file does any of the following:

1. Drafts or rewrites substantive body copy.
2. Revises section-level explanations, code walkthroughs, or audience framing.
3. Reworks captions or nearby figure text.
4. Requests prose cleanup beyond typo-only edits.

Do not treat this file as a reason to load every writing skill on every post task.

## Required Action

Before editing substantive post body content, choose only the skills that match the task:

- Use `human-prose-editing` for paragraph flow, voice, section openings and endings, and repeated scaffolds.
- Use `anti-ai-writing` for sentence-level cleanup after the structure and technical claims are already sound.
- Use `beginner-technical-writing` when the post teaches platform or implementation concepts to readers still learning the subject.
- Use `code-walkthrough-authoring` when the post explains code, request flow, APIs, hooks, templates, or stepwise implementation logic.
- Use `audience-layering` when the same post must serve both hands-on implementers and solution-level readers without splitting into two tracks.
- Use `image-caption-writing` when editing captions, `img-caption` shortcodes, or the first paragraph after a figure that may duplicate caption text.

## Skill Selection Rules

- Choose the minimum set needed for the current edit slice.
- Use `human-prose-editing` before `anti-ai-writing` when a task spans both paragraph-level and sentence-level cleanup.
- Do not invoke `beginner-technical-writing` or `code-walkthrough-authoring` for non-technical opinion or corporate posts unless the edited section is actually teaching a technical concept.
- Do not use `anti-ai-writing` as a substitute for fact checking, structural rework, or Hugo/content-migration policy checks.

## Relationship to Other Instructions

This instruction is additive and does not replace existing repository rules.

1. Continue to follow `.github/instructions/content-quality.instructions.md` when that instruction applies.
2. Continue to follow `.github/instructions/seo-compliance.instructions.md` when links, metadata, canonical signals, or structured data behavior change.
3. Continue to follow `.github/instructions/documentation-updates.instructions.md` when the task changes repository behavior or governance rather than only post copy.
4. For Hugo template, shortcode implementation, or stylesheet work, follow the Hugo and SEO instructions instead of treating this file as the primary guide.

## Binary Compliance Expectations

This instruction passes only if one of the following is true:

1. The task is exempt under "When This Is Not Required".
2. The task edits substantive post copy and the work clearly reflects the relevant skill choice instead of a generic all-skills rewrite.

## When This Is Not Required

- Front matter only edits.
- URL, taxonomy, or metadata fixes with no body-copy rewrite.
- Hugo template, shortcode implementation, or stylesheet changes.
- Pure typo corrections, formatting-only cleanup, or link-target fixes that do not materially change the prose.
- Migration mechanics or script changes outside the post body itself.

## Escalation Path

If it is unclear whether a matched task is primarily technical instruction, general editorial writing, or caption cleanup:

1. Choose the narrowest relevant skill set.
2. If two approaches would materially change the post's audience, ask the user which audience should dominate the revision.
3. Do not apply a full tutorial-style rewrite to a non-tutorial post without explicit direction.

## References

- `.agents/skills/human-prose-editing/SKILL.md`
- `.agents/skills/anti-ai-writing/SKILL.md`
- `.agents/skills/beginner-technical-writing/SKILL.md`
- `.agents/skills/code-walkthrough-authoring/SKILL.md`
- `.agents/skills/audience-layering/SKILL.md`
- `.agents/skills/image-caption-writing/SKILL.md`
