# Hugo Specialist Agent Broadening - 2026-03-08

## Change summary
Updated the Hugo Specialist agent profile from implementation-first Hugo migration guidance to a combined blog/website design plus Hugo implementation specialist role.

## Why this changed
Maintainers needed one agent that can handle both design intent and execution details for general blog/website tasks without losing existing Hugo, deployment, and governance safety controls.

## Behavior details
Old behavior:
- Focused mainly on Hugo implementation for migration tasks.
- Design direction was implicit and not part of the required output contract.
- The top-level agent catalog still described Hugo Specialist as configuration/template focused only.

New behavior:
- Explicitly includes design responsibilities (layout direction, visual hierarchy, responsive behavior) alongside Hugo implementation work.
- Requires a design-to-implementation workflow and a structured output format that includes risks and validation criteria.
- Preserves repository safety constraints for canonical consistency, production build flags, and Pages deployment expectations.
- Updates the root agent catalog description so selection guidance matches the updated specialist role.

## Impact
- Improves agent selection for users asking for design and implementation in one request.
- Reduces handoff overhead between separate design and Hugo implementation workflows for common website tasks.
- Keeps policy boundaries explicit by continuing to route SEO policy and DNS execution outside this agent.

## Verification
Manual verification steps:
- Confirmed the Hugo Specialist agent file includes `Scope`, `Out of scope`, ordered `Working approach`, `Required output format`, and verifiable `Quality rules` sections.
- Confirmed the updated scope includes both design-oriented and implementation-oriented responsibilities.
- Confirmed AGENTS catalog wording matches the broadened Hugo Specialist profile for discoverability consistency.

## Related files
- `.github/agents/hugo-specialist.agent.md`
- `AGENTS.md`
