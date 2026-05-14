# CSS Modern Features Skill - 2026-05-14

## Change summary

Added a new Agent Skill at `.github/skills/css-modern-features/` by importing the upstream `rushenn/css-modern-features` skill bundle and adapting it for this repository.

The repo-local version keeps the full Markdown reference set, converts bundled-reference mentions to relative Markdown links, adds workspace-specific browser-target guidance, and corrects support notes that were stale in the imported material.

## Why this changed

Contributors working on CSS in this repository had no repo-local skill focused on modern CSS feature selection, progressive enhancement, and browser-target driven decisions.

The imported upstream skill was a strong base, but it was not fully correct to use unchanged here because:

- bundled resources were referenced as plain paths instead of Markdown links, which weakens VS Code resource loading behavior,
- the skill assumed framework-neutral or Tailwind-heavy usage rather than this repo's Hugo and plain-CSS default,
- several support notes used dated wording around `field-sizing`, `@scope`, anchor positioning, `margin-trim`, and other emerging features.

## Behavior details

Old behavior:

- No `css-modern-features` skill existed in the repository.
- CSS guidance depended on ad hoc prompts and the separate motion-focused skill.
- Contributors had no shared browser-tier checklist for choosing native CSS over legacy workarounds.

New behavior:

- A dedicated `css-modern-features` skill is available under `.github/skills/css-modern-features/`.
- The skill tells contributors how to determine browser targets, map them to feature tiers, and prefer native CSS features where support allows.
- The skill now includes a repo note that this workspace currently defaults to Tier 2 because no explicit browser target policy is configured.
- Tailwind examples are preserved as optional patterns, but the skill now frames plain CSS in Hugo templates and shared stylesheets as the local default.
- Internal references now use relative Markdown links so the bundled reference files are discoverable and loadable from `SKILL.md`.
- Reference files keep the upstream topical coverage while using more accurate or future-safe support wording for limited-availability features.
- The skill explicitly points contributors to the existing `css-motion-systems` skill when the task is about motion-system design rather than general CSS modernization.

## Impact

- Affected contributors: maintainers, developers, and agent operators who write or review CSS in this repository.
- Affected workflow: CSS-focused work now has a repo-local skill for browser-tier decisions, modern feature selection, and progressive-enhancement guidance.
- Scope: guidance and discoverability only; no runtime, build, or deployment behavior changed.

## Verification

1. Confirm the skill folder exists with the full imported reference set:

   - `.github/skills/css-modern-features/SKILL.md`
   - `.github/skills/css-modern-features/references/color.md`
   - `.github/skills/css-modern-features/references/layout.md`
   - `.github/skills/css-modern-features/references/selectors.md`
   - `.github/skills/css-modern-features/references/animation.md`
   - `.github/skills/css-modern-features/references/typography.md`
   - `.github/skills/css-modern-features/references/positioning.md`
   - `.github/skills/css-modern-features/references/components.md`
   - `.github/skills/css-modern-features/references/misc.md`
   - `.github/skills/css-modern-features/references/experimental.md`
   - `.github/skills/css-modern-features/references/houdini.md`

2. Confirm `SKILL.md` uses relative Markdown links for bundled references instead of plain path mentions.

3. Confirm the repo-local additions are present:

   - Tier 2 default note for this workspace
   - Plain CSS / Hugo-first guidance
   - Boundary note for `css-motion-systems`

4. Confirm limited-support features were downgraded to progressive-enhancement guidance where appropriate:

   - `field-sizing`
   - anchor positioning
   - `margin-trim`
   - experimental watch-list items with previously dated support wording

5. Confirm discoverability updates exist in:

   - `AGENTS.md`
   - `analysis/documentation/README.md`

## Related files

- `.github/skills/css-modern-features/SKILL.md`
- `.github/skills/css-modern-features/references/color.md`
- `.github/skills/css-modern-features/references/layout.md`
- `.github/skills/css-modern-features/references/selectors.md`
- `.github/skills/css-modern-features/references/animation.md`
- `.github/skills/css-modern-features/references/typography.md`
- `.github/skills/css-modern-features/references/positioning.md`
- `.github/skills/css-modern-features/references/components.md`
- `.github/skills/css-modern-features/references/misc.md`
- `.github/skills/css-modern-features/references/experimental.md`
- `.github/skills/css-modern-features/references/houdini.md`
- `AGENTS.md`
- `analysis/documentation/README.md`

## References

- Upstream source: `https://github.com/rushenn/css-modern-features/tree/main/css-modern-features`
- Upstream revision reviewed for import: `e5d7bea14b43e182c3f366f3b3159bd11965ab2d`
- `https://code.visualstudio.com/docs/copilot/customization/agent-skills`
- `https://agentskills.io/specification`