# Write-Article Workflow (Claude Code)

## What changed and why

Added `.claude/workflows/write-article.js`, a Claude Code Workflow script that automates the first-draft pass of a new blog post end to end: grounded research, a style/voice/duplicate-topic review against this repo's existing skills and recent posts, drafting, image/screenshot prompt generation, three separate prose-verification passes plus a fact recheck, and the repo's quality gates — all before a human reviews and decides to publish.

This exists because authoring a post already means chaining research, `human-prose-editing`, `anti-ai-writing`, and the gate commands in a specific order every time. Scripting that sequence removes the risk of skipping a step or running the prose passes in the wrong order — `human-prose-editing` must run before `anti-ai-writing` per `.github/instructions/post-writing-skills.instructions.md`, and the workflow enforces that by running them as sequential edits on the same file rather than in parallel.

## Behavior

- **Old:** authoring a new post was a manual, ad hoc sequence of skill invocations and gate commands chosen per session, with no fixed ordering guarantee.
- **New:** running the workflow with a topic brief produces a `draft: true` post under `src/content/posts/<slug>/index.md`, per-image prompt files under that post's own `prompts/` folder for any non-Mermaid image, and a structured report of what each verification and gate pass found and fixed. It never sets `draft: false` and never runs `git add`/`commit`/`push` or the full `npm run gates:local` suite — those remain explicit human actions taken after review.
- **New:** when the Draft phase needs a diagram (flowchart, sequence diagram, decision tree, architecture/state diagram — anything expressible as nodes/edges or steps), it writes a `` ```mermaid `` fenced code block directly into the post body instead of an image placeholder, using this site's native Mermaid support (`docs/development/mermaid-diagram-support.md`). No placeholder, no prompt file, and no human production step are generated for that diagram — only genuine screenshots and house-style cartoon illustrations still go through the placeholder-and-prompt-file path. Previously every diagram, including simple flow diagrams, went through the same PNG-placeholder-and-prompt-file path as real screenshots and illustrations, which meant a human had to produce artwork for diagrams the site could already render natively as themed SVG.
- **New:** every post now gets a hero image, unconditionally. The Draft phase always sets `heroImage` to the intended filename (e.g. `<slug>-hero.png`) and writes real `heroImageAlt` text at draft time, rather than leaving `heroImage: ""` and only adding it to `imagesNeeded` when the drafting agent judged the post needed illustration. `imagesNeeded` always contains a `kind: "illustration"` entry for the hero image, so the Draft phase's image-prompt step always produces a hero-image prompt file, and the Gate phase now fails the run if `heroImage`/`heroImageAlt` are blank. **Old:** hero image generation was conditional on the drafting agent deciding one was warranted, which produced posts with an empty `heroImage` and no prompt file at all.
- **New:** illustration prompt files are now fully self-contained image-generation prompts, not references to the house style. Old behavior pointed the reader at "match this site's house style — see past hero images and `AGENTS.md`'s Images section," which only works if whoever executes the prompt can open this repository. New behavior has the image-prompt agent open one real existing hero/illustration file itself, translate what it sees into labeled sections (Subject, Scene, Setting, Color palette, Line and rendering style, Composition, No-text constraint, Aspect ratio/output), and write those out in full prose in the prompt file — so a separate image-generation agent with zero repository access can execute the prompt verbatim and still match the site's mascot design and "Paper & Ink" palette. Screenshot prompts are unaffected — they still just specify the exact Business Manager path/UI/state to capture. Every illustration prompt also gets a ready-to-paste front matter/shortcode snippet appended below it.
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

## Gate exclusions for `prompts/` files

`*.prompt.md` files under a post's `prompts/` folder are excluded from `npm run check:spelling` (`scripts/gates/check-spelling.js`'s `collectMarkdownFiles`), the same way `AGENTS.md` files are excluded — they're self-contained image-generation specs meant to be read by a human or an external image-generation agent with no access to this repo, not published house-style prose, so American spellings, informal image-generation vocabulary ("keycard", "cel-shaded", "desaturated"), and similar terms shouldn't be forced through the en-GB content dictionary. They were already excluded from `npm run validate:frontmatter` (`**/prompts/**` in `scripts/validate-frontmatter.js`) since they carry no front matter, and Hugo doesn't render them as pages since they're page-bundle resources, not `index.md`/`_index.md`.

- **Before:** `check-spelling.js` scanned every `.md` file under `src/content/posts/**` except `AGENTS.md`, so the first committed `prompts/*.prompt.md` file failed the spelling gate on ordinary image-generation vocabulary.
- **After:** files ending in `.prompt.md` anywhere in the content tree are also excluded from the spelling gate.

## Related files

- `.claude/workflows/write-article.js` — the workflow script
- `src/content/posts/AGENTS.md` — the style/voice/front-matter contract it drafts against
- `src/archetypes/posts.md` — front matter shape
- `docs/development/mermaid-diagram-support.md` — the site's native Mermaid rendering the Draft phase relies on when it writes a diagram directly into the body instead of an image placeholder
- `.agents/skills/human-prose-editing/SKILL.md`, `.agents/skills/anti-ai-writing/SKILL.md`, `.agents/skills/beginner-technical-writing/SKILL.md`, `.agents/skills/web-research/SKILL.md`, `.agents/skills/image-caption-writing/SKILL.md`, `.agents/skills/audience-layering/SKILL.md`, `.agents/skills/code-walkthrough-authoring/SKILL.md` — skills it invokes or references
- `.github/instructions/post-writing-skills.instructions.md` — the skill ordering/routing it follows
- `.github/instructions/content-quality.instructions.md`, `.github/instructions/seo-compliance.instructions.md`, `.github/instructions/hugo-coding-standards.instructions.md` — the gates it checks against

## Update: `anti-ai-writing` and `human-prose-editing` rebuilt on cited evidence (2026-09-18)

### Change summary

Both prose skills were rewritten after an in-task research pass found that several
rules they enforced were not supported by the sources they implied. The skills now
tag every rule **[Evidenced]**, **[Craft]**, or **[Taste]**, and each file's
`references/REFERENCE.md` carries a per-source table of what that source actually
supports — replacing a "Source Basis" section that had listed categories of
guidance ("university writing-center guidance") with no URLs at all.

### Old vs new behavior

- **Before:** `human-prose-editing` framed detection around "low burstiness"
  (glossed as similar sentence lengths) and "low perplexity". Both skills ran a
  per-paragraph em-dash count, listed `moreover`/`furthermore` as removable on
  sight, treated hedges as padding, preferred the active voice as a default, and
  duplicated the same signal list in both files. Neither skill told a writer what
  to **add**.
- **After:**
  - Burstiness and perplexity are removed as editorial terms. Burstiness
    technically denotes word recurrence intervals, not sentence-length variance,
    and GPTZero states it no longer uses either metric as of autumn 2023 (its page
    also still calls burstiness a key factor, so it is cited as marketing, not
    method). Rhythm variation is retained as **[Craft]**, sourced to Provost.
  - The em-dash count is dropped. Merriam-Webster and CMOS treat the mark as
    taste; the frequency research disclaims per-document use.
  - `moreover`-class connectives, hedges, and the passive voice each gained an
    explicit carve-out, because the evidence runs against the folklore: LLM prose
    carries *fewer* hedges than student prose, and GPT-4o uses agentless passive
    at about half the human rate, so anti-passive editing moves a draft toward the
    machine profile.
  - New **[Evidenced]** markers: nominalisation density, trailing participial
    clauses, subject `that`-clauses, copula avoidance, document metadiscourse, and
    marker *co-occurrence* rather than single words (published word lists decay
    once publicised).
  - `human-prose-editing` now runs an **additive pass first**, on the finding that
    most "generated-sounding" prose is missing a causal link rather than carrying
    padding, and carries Gopen & Swan's topic/stress-position mechanics, Williams's
    topic and thematic strings, their stress-position sentence-length test, and an
    explicit **stop condition**.
  - Ownership is now split: `anti-ai-writing` owns clauses and words,
    `human-prose-editing` owns paragraphs and above. The shared signal list is gone.
  - Both carry a restraint rule: cite an authority per change, never edit inside a
    quotation, code fence, or Mermaid block, and never Americanise (the spelling
    gate enforces en-GB on content).

### Impact and verification

No runtime or gate behavior changes; these files are agent instructions. Verify by
running either skill on a post and checking that each proposed change carries a
tier and a reason. The diagnostic snippet embedded in `anti-ai-writing`'s SKILL.md
prints per-pattern counts for a single post; it is deliberately a copy-pasteable
snippet rather than a committed script, so no new tooling surface is introduced.
Applied to `src/content/posts/webmcp-vs-mcp-shipping-agent-tools/index.md`, the
scan returned zero participial tails, zero copula-avoidance phrases, zero
metadiscourse phrases, and zero marker-cluster words; the only nominalisation
flagged sat inside a quoted source, which the new restraint rule excludes.

### Related files

- `.agents/skills/anti-ai-writing/SKILL.md`, `.agents/skills/anti-ai-writing/references/REFERENCE.md`
- `.agents/skills/human-prose-editing/SKILL.md`, `.agents/skills/human-prose-editing/references/REFERENCE.md`
- `.claude/skills/anti-ai-writing`, `.claude/skills/human-prose-editing` — symlinks to the above; there is no second copy to update
- `.github/instructions/post-writing-skills.instructions.md` — the routing rule that orders these two skills
- `.bonsai/research/` — cached source pages (CMOS Shop Talk and ACES failed extraction and were read over direct HTTP/Wayback)
