# Post Writing Skills Routing - 2026-05-24

## Change summary

Normalized the copied post-authoring skills under `.github/skills/` for this repository's `src/content/posts/**` workflow and added a new `.github/instructions/post-writing-skills.instructions.md` file to route post-writing tasks to the relevant skill instead of relying on generic prose edits.

## Why this changed

The copied skills arrived with book-centric wording, one malformed root-level skill file, and no repository instruction connecting them to the actual post authoring path. Contributors needed a repo-native writing workflow that matches how posts are drafted and revised in this codebase.

## Behavior details

Old behavior:

- The copied writing skills existed as raw imports and were not aligned to `src/content/posts/**`.
- `audience-layering` lived as `.github/skills/SKILL.md`, which does not follow the repo's per-skill folder layout.
- `code-walkthrough-authoring` still referenced missing companion skills from another context.
- No path-specific instruction told Copilot which skill to apply when working on post content.

New behavior:

- The copied skills now describe post authoring in this repository and advertise compatibility with `src/content/posts/**`.
- `audience-layering` is now packaged as `.github/skills/audience-layering/SKILL.md`.
- Missing external skill references were removed from `code-walkthrough-authoring`.
- A new `post-writing-skills` instruction routes post tasks to the smallest relevant skill set for prose editing, beginner explanations, walkthroughs, audience framing, and caption work.
- `AGENTS.md` now lists the new writing skills so contributors can discover them from the repository guide as well as through Copilot skill routing.

## Impact

- Affected contributors: content authors, editors, and AI-agent operators revising Markdown posts.
- Affected workflow: post drafting and rewriting in `src/content/posts/**` now has explicit skill routing.
- Scope: AI guidance and repository governance only; no runtime, build, or Hugo rendering behavior changed.

## Verification

1. Confirm the copied skills now use post-oriented descriptions and `src/content/posts/**` compatibility where applicable.
2. Confirm `.github/skills/SKILL.md` no longer exists and `.github/skills/audience-layering/SKILL.md` exists instead.
3. Confirm `.github/instructions/post-writing-skills.instructions.md` has a narrow `applyTo: 'src/content/posts/**'` scope and conditional skill routing.
4. Confirm `code-walkthrough-authoring` no longer references missing companion skills.
5. Confirm `AGENTS.md` lists the new writing skills in the repository skills inventory.
6. Confirm this governance report is indexed from `analysis/documentation/README.md`.

## Related files

- `.github/skills/audience-layering/SKILL.md`
- `.github/skills/anti-ai-writing/SKILL.md`
- `.github/skills/anti-ai-writing/references/REFERENCE.md`
- `.github/skills/beginner-technical-writing/SKILL.md`
- `.github/skills/code-walkthrough-authoring/SKILL.md`
- `.github/skills/human-prose-editing/SKILL.md`
- `.github/instructions/post-writing-skills.instructions.md`
- `AGENTS.md`
- `analysis/documentation/README.md`

## References

- https://code.visualstudio.com/docs/copilot/customization/agent-skills
- https://code.visualstudio.com/docs/copilot/customization/custom-instructions
- https://docs.github.com/en/copilot/how-tos/configure-custom-instructions-in-your-ide/add-repository-instructions-in-your-ide