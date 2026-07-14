# Write-Article Workflow (Claude Code)

## What changed and why

Added `.claude/workflows/write-article.js`, a Claude Code Workflow script that automates the first-draft pass of a new blog post end to end: grounded research, a style/voice/duplicate-topic review against this repo's existing skills and recent posts, drafting, image/screenshot prompt generation, three separate prose-verification passes plus a fact recheck, and the repo's quality gates — all before a human reviews and decides to publish.

This exists because authoring a post already means chaining research, `human-prose-editing`, `anti-ai-writing`, and the gate commands in a specific order every time. Scripting that sequence removes the risk of skipping a step or running the prose passes in the wrong order — `human-prose-editing` must run before `anti-ai-writing` per `.github/instructions/post-writing-skills.instructions.md`, and the workflow enforces that by running them as sequential edits on the same file rather than in parallel.

## Behavior

- **Old:** authoring a new post was a manual, ad hoc sequence of skill invocations and gate commands chosen per session, with no fixed ordering guarantee.
- **New:** running the workflow with a topic brief produces a `draft: true` post under `src/content/posts/<slug>/index.md`, per-image prompt files under that post's own `prompts/` folder, and a structured report of what each verification and gate pass found and fixed. It never sets `draft: false` and never runs `git add`/`commit`/`push` or the full `npm run gates:local` suite — those remain explicit human actions taken after review.
- If the Research phase's style/duplicate review classifies the topic as a near-duplicate of an existing post, the workflow stops right there and returns the finding instead of spending the Draft/Verify/Gate phases on a likely-redundant article.
- The three prose/fact edits in Verify run sequentially against the same file, not in parallel — `human-prose-editing` must run before `anti-ai-writing` (`post-writing-skills.instructions.md`), and parallel edits to one file would race. A holistic read-through closes the phase: a fresh-eyes agent with no edit history checks whether the sequential passes left seams (inconsistent voice, a fix undoing an earlier rhythm choice) — it flags issues in the report rather than editing further.
- Fact-checking has two modes via `args.depth`: `"quick"` (default) is a single re-verify-and-fix pass; `"thorough"` runs 3 independent read-only fact reviewers in parallel, then a single agent applies the merged, judgment-weighted corrections — avoiding both the blind-spot risk of one reviewer and the file-write races that running edits in parallel would cause.
- The Gate phase independently counts the post's body word count rather than trusting the drafting agent's self-reported number, and re-runs any check it patches before deciding pass/fail — a fix it doesn't verify isn't a fix. It also checks that any link to another `draft: true` post is wrapped in `when-published`, since a bare link to an unpublished draft fails the deploy's internal-link gate.

## How to run it

- From Claude Code: `Workflow({ name: 'write-article', args: '<topic brief>' })`, or pass `{ brief, notes, slugHint, depth }` for extra context (`depth: 'thorough'` for higher-stakes posts; default is `'quick'`).
- Model assignment: research and the style/skills/duplicate-topic review run on Haiku; drafting, image-prompt generation, all verification passes, and the gate-check phase run on Sonnet.
- Phases: `Research` (parallel: grounded web research + style/voice/duplicate review; early-exits on a near-duplicate topic) → `Draft` (write the post, then generate image prompt files) → `Verify` (sequential: `human-prose-editing`, `anti-ai-writing`, conditionally `beginner-technical-writing`, fact-check per `depth`, then a holistic read) → `Gate` (frontmatter/spelling/markdownlint/callout/when-published/preflight checks, an independent word-count check, and a manual SEO/content-quality checklist).

## Impact and verification

- Touches no runtime site behavior — it only produces new content under `src/content/posts/<slug>/` (an `index.md` and a `prompts/` folder) and runs read-only or content-scoped quality-gate commands (`validate:frontmatter`, `check:spelling`, `markdownlint-cli2`, `check:callouts`, `check:when-published`, `preflight`).
- Verify a run by inspecting the generated post's front matter and body against `src/content/posts/AGENTS.md`, reviewing the `Gate` phase's report for `passed: true`, and manually running `npm run gates:local` before flipping `draft: false`.

## Related files

- `.claude/workflows/write-article.js` — the workflow script
- `src/content/posts/AGENTS.md` — the style/voice/front-matter contract it drafts against
- `src/archetypes/posts.md` — front matter shape
- `.agents/skills/human-prose-editing/SKILL.md`, `.agents/skills/anti-ai-writing/SKILL.md`, `.agents/skills/beginner-technical-writing/SKILL.md`, `.agents/skills/web-research/SKILL.md`, `.agents/skills/image-caption-writing/SKILL.md`, `.agents/skills/audience-layering/SKILL.md`, `.agents/skills/code-walkthrough-authoring/SKILL.md` — skills it invokes or references
- `.github/instructions/post-writing-skills.instructions.md` — the skill ordering/routing it follows
- `.github/instructions/content-quality.instructions.md`, `.github/instructions/seo-compliance.instructions.md`, `.github/instructions/hugo-coding-standards.instructions.md` — the gates it checks against
