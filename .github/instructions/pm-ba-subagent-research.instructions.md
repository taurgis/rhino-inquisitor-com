---
description: 'Require PM and BA subagent research on every request'
applyTo: '**'
---

# PM and BA Subagent Research Requirement

## Mandatory Pre-Step
- On every request, run the **Project Manager** subagent and the **Business Analyst** subagent.
- Use their outputs to provide research-backed recommendations before executing implementation work.

## Output Expectations
- Include clear planning recommendations from the Project Manager perspective (scope, sequencing, risks, and milestones).
- Include clear requirements and analysis recommendations from the Business Analyst perspective (problem framing, assumptions, acceptance criteria, and open questions).
- Reconcile any conflicts between PM and BA recommendations, state the chosen approach, and resolve trade-offs by prioritizing user-stated requirements first, then feasibility/risk, then delivery speed; if requirements are ambiguous or unsafe, ask clarifying questions and default to the safest feasible option.
- Document the final reconciled recommendation and trade-offs in the response.

## When Not Required

Skip PM and BA subagent invocation when **all** of the following are true:
- The task is fully specified with unambiguous acceptance criteria (no scope decision is open).
- The change is single-file or confined to a well-defined implementation unit with no cross-phase dependencies.
- The task is a correction to existing work (e.g., fixing a typo, updating a URL, reverting a value) with no new scope introduced.
- No new risks, sequencing decisions, or architectural trade-offs arise from the change.

Examples of tasks that are exempt:
- "Set `draft: true` on this front matter field."
- "Fix the broken internal link in this Markdown file."
- "Add the missing `url` field to this content file."

Examples of tasks that always require PM and BA research:
- New phase planning or plan updates.
- Architecture decisions (e.g., choosing a redirect mechanism, adding a new dependency).
- Scope changes that affect multiple phases or have SEO/URL implications.
- Any task where requirements are ambiguous or contradict existing plan decisions.
