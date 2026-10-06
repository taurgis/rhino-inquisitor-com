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
- Fact-checking runs per chapter (see the 2026-10-05 update below): a cheap Haiku agent lists the post's chapters, one read-only Sonnet reviewer at high effort checks each chapter against freshly fetched official docs, and a single agent applies the merged corrections and checks for contradictions between chapters. `args.depth` sets reviewers per chapter: `"quick"` (default) is one, `"thorough"` adds a second, adversarial reviewer to each chapter.
- The Gate phase independently counts the post's body word count rather than trusting the drafting agent's self-reported number, and re-runs any check it patches before deciding pass/fail — a fix it doesn't verify isn't a fix. It also checks that any link to another `draft: true` post is wrapped in `when-published`, since a bare link to an unpublished draft fails the deploy's internal-link gate.

## How to run it

- From Claude Code: `Workflow({ name: 'write-article', args: '<topic brief>' })`, or pass `{ brief, notes, slugHint, depth }` for extra context (`depth: 'thorough'` for higher-stakes posts; default is `'quick'`).
- Model assignment: research and the style/skills/duplicate-topic review run on Haiku; drafting, image-prompt generation, all verification passes, and the gate-check phase run on Sonnet. The per-chapter fact reviewers run on Sonnet at `high` effort, the per-chapter anti-ai-writing reviewers on Sonnet at `medium` effort; the chapter-listing step runs on Haiku at `low` effort.
- Phases: `Research` (parallel: grounded web research + style/voice/duplicate review; early-exits on a near-duplicate topic) → `Draft` (write the post, then generate image prompt files) → `Verify` (in order: `human-prose-editing`, conditionally `beginner-technical-writing`, per-chapter fact-check (reviewers per chapter set by `depth`), per-chapter `anti-ai-writing` review, then a holistic read) → `Gate` (frontmatter/spelling/markdownlint/callout/when-published/preflight checks, an independent word-count check, and a manual SEO/content-quality checklist).

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

## Update: anti-ai-writing runs per chapter, after the fact-check (2026-10-06)

### Change summary

The `anti-ai-writing` pass now runs one read-only Sonnet reviewer per chapter,
after the fact-check, instead of one whole-post editing pass before it. Two
problems prompted this. First, the old pass ran before `beginner-technical-writing`
and before the fact-check, and both of those write new sentences, so their text
never got a sentence-level review. Second, the workflow prompts for both prose
passes named skill sections ("Detection Reality warning", "Sentence-Level
Signals To Remove", "Quick Pass Checklist") that the 2026-09-18 skill rebuild
removed. The new prompts tell agents to read and follow the whole skill, not
named sections, so a future skill edit cannot leave them stale again.

### Old vs new behavior

- **Before:** `human-prose-editing` → `anti-ai-writing` (one Sonnet agent, whole
  post, editing directly) → `beginner-technical-writing` (if teaching post) →
  per-chapter fact-check → holistic read.
- **After:** `human-prose-editing` → `beginner-technical-writing` (if teaching
  post) → per-chapter fact-check → per-chapter `anti-ai-writing` review →
  holistic read. `human-prose-editing` still runs before `anti-ai-writing`, as
  `post-writing-skills.instructions.md` requires.
  1. `anti-ai-review:<n>:<chapter>` (Sonnet, `effort: 'medium'`) runs in
     parallel, one per chapter from the fact-check's chapter list. Each reviewer
     reads the full skill, is read-only, and returns findings with exact
     `oldText`/`newText`, the skill rule, and its evidence tier. Reviewers must
     keep every claim, number, name, link, and term (the fact-check has just
     verified them), must not invent specifics, must not touch quotations, code,
     Mermaid, or front matter, and may return no findings.
  2. `anti-ai-apply` (Sonnet) applies the [Evidenced] and [Craft] findings,
     rejects any that change a claim or blur a fact-check correction, and fixes
     moves that reviewers saw recurring across chapters (which no single
     per-chapter reviewer can judge). [Taste] findings are returned to the
     author unapplied, as the skill requires.
  3. If no chapter returns an [Evidenced] or [Craft] finding and nothing
     recurs, the apply agent is skipped and the file is left unchanged.
- `verification.antiAiWriting` now holds `applied`, `rejected`,
  `tasteSuggestionsForAuthor`, `recurringPatternsFixed`, and per-chapter
  `chapterVerdicts`, instead of `issuesFixed`/`issuesFlaggedNotFixed`.
- `depth` does not change the anti-ai-writing pass: it is always one reviewer
  per chapter.
- The Gate phase now lists every remaining `<!-- TODO verify -->` and
  `<!-- TODO author -->` comment in `remainingManualSteps`. Both prose skills
  now tell editors to flag a missing fact with `TODO author` instead of
  inventing one. Hugo does not render raw HTML in Markdown
  (`markup.goldmark.renderer.unsafe` defaults to `false`, per
  <https://gohugo.io/configuration/markup/>), so a forgotten comment would
  never show on the page and no deploy gate would catch it.

### Impact and verification

Only the write-article workflow's Verify phase changes. No site runtime or
deploy gate is affected. A run now spawns one more agent per chapter plus one
apply agent, and the whole-post anti-ai agent is gone. To verify, run the
workflow and confirm the Verify phase shows `fact-check-apply`, then one
`anti-ai-review:` agent per chapter, then `anti-ai-apply` (or a log line saying
no fixes were proposed), then `holistic-read`. The script was exercised with
mocked agents: quick and thorough both produced one anti-ai reviewer per
chapter after the fact-check, and an all-clean review skipped the apply agent.

### Related files

- `.claude/workflows/write-article.js` — `CHAPTER_PROSE_REVIEW_SCHEMA`,
  `PROSE_APPLY_SCHEMA`, the reordered Verify phase, and the rewritten
  `verify-human-prose-editing` prompt
- `.agents/skills/anti-ai-writing/SKILL.md` — the rules reviewers apply
- `.github/instructions/post-writing-skills.instructions.md` — the ordering rule

## Update: prose skills extended with 2025–2026 evidence (2026-10-06)

### Change summary

A second research pass on `anti-ai-writing` and `human-prose-editing` looked
for evidence published since the 2026-09-18 rebuild, and for evidence on how
LLM *editors* fail, since this workflow runs both skills through agents. Three
findings drove the changes. LLM editors are poor at adding specifics and tend
to invent or swap in stock phrases (Chakrabarty et al., CHI 2025). LLM
revision moves every author's voice the same way, and a "preserve the voice"
instruction only cut the effect by a third (van Nuenen, 2026). Corrective
framing ("this isn't A, it's B"), which the skills had filed as [Taste]
because nothing measured it, now has corpus measurements (Antislop; Graphite
2026). Every source was fetched through Bonsai, and the quoted figures were
checked against the cached text.

### Old vs new behavior

- **`anti-ai-writing`, before:** no rule against inventing specifics; its
  "prefer" table replaced vague phrases with facts that might not exist. No
  guidance on corrective framing, mannered prose, vague attribution, or edit
  history left in the text. The diagnostic snippet ran on a hard-coded
  `index.md` and counted inline code.
- **`anti-ai-writing`, after:**
  - The restraint rule now requires keeping every claim and using only
    specifics the post, notes, or a source supply. A missing fact gets a
    `<!-- TODO author: ... -->` comment.
  - New [Evidenced] markers: corrective framing and self-narrating adverbs
    ("is genuinely": 1,021 against 4 in Graphite's corpus).
  - New [Craft] moves, sourced to Wikipedia's AI Cleanup project and
    Anthropic's style docs: mannered prose, significance inflation and vague
    attribution, and draft/chat residue.
  - A new "When an Agent Applies This Skill" section covers the measured
    failure modes of LLM editors: cliché swapping, meaning drift, and voice
    flattening.
  - `In order to` is reclassified as a concision edit, not an AI tell:
    Wikipedia lists it among the signs of *human* writing.
  - The diagnostic snippet takes the post path as an argument, strips inline
    code, and counts five more patterns.
  - Every example now uses only facts its context supplies. One example shows
    the correct output being no edit.
- **`human-prose-editing`, before:** the additive pass filled any gap,
  including examples and first-person judgements. Repeated contrast formulas
  were [Taste]. Voice preservation relied on judgement alone.
- **`human-prose-editing`, after:**
  - The additive pass separates missing *logic* (fill it from sources) from
    missing *specifics* (author only; flag it). Redundant exposition is named
    as the inverse defect.
  - Moves that recur across sections are [Evidenced] and owned by this skill;
    a single instance belongs to `anti-ai-writing`.
  - Voice preservation adds a check an editor can run: count first-person
    pronouns, contractions, and `because`/`so` links before and after the
    pass, and justify any drop.
  - The "do not run twice" rule now cites evidence that repeated LLM edits
    compound damage, and warns that an LLM editor's sense that a revision
    "reads better" is biased toward its own and longer text.
  - Its own uses of "load-bearing" were replaced.

### Impact and verification

No runtime, build, or deploy gate changes; these are agent instructions used by
`write-article` and by anyone running the skills directly. To verify, run the
`anti-ai-writing` diagnostic snippet on any post:
`src/content/posts/sfcc-webdav-deployment-failures-explained/index.md` returns
2 which-tails, 1 marker word, and 0 for every new pattern. A synthetic sample
containing each new pattern made each counter fire, with inline code ignored.
Then run either skill on a draft and check that each proposed change names a
tier and a pattern, and that no change adds a fact.

### Related files

- `.agents/skills/anti-ai-writing/SKILL.md`,
  `.agents/skills/anti-ai-writing/references/REFERENCE.md`,
  `.agents/skills/anti-ai-writing/examples/EXAMPLES.md`
- `.agents/skills/human-prose-editing/SKILL.md`,
  `.agents/skills/human-prose-editing/references/REFERENCE.md`,
  `.agents/skills/human-prose-editing/examples/EXAMPLES.md`
- `.claude/workflows/write-article.js` — the per-chapter reviewer prompt and
  the Gate phase TODO listing
- `.bonsai/research/` — cached sources for this pass

## Update: fact-check split per chapter (2026-10-05)

### Change summary

The Verify phase's fact-check now runs one reviewer per chapter instead of one
reviewer (or three) for the whole post. A single agent checking a
2,000-plus-word post has to spread its attention across every claim, link, and
code block at once. On the WebDAV deployment failures draft, the whole-post
pass verified 34 claims, but it left a retry script that contradicted the
diagnosis flowchart, which only the holistic read caught. Giving each chapter
its own high-effort reviewer narrows each agent's scope so it can check links,
commands, and code in depth.

### Old vs new behavior

- **Before:** `quick` (default) ran one Sonnet agent that re-verified the whole
  post and edited it directly. `thorough` ran three independent read-only
  whole-post reviewers, then one agent applied the merged fixes.
- **After:**
  1. `fact-check-chapters` (Haiku, low effort) lists the chapters: front matter
     plus intro as the first chapter, then one per level-two (`##`) heading. `###`
     subheadings stay with their parent, and `#` comments inside code fences
     are ignored. If it cannot split the post, the workflow logs that and falls
     back to one whole-post reviewer.
  2. `fact-review:<n>:<chapter>` (Sonnet, `effort: 'high'`) runs in parallel,
     one per chapter. Each reviewer is read-only, fetches current official
     docs through Bonsai, checks every link, command, code block, and diagram
     in its chapter, and returns per-claim verdicts with exact
     `oldText`/`newText` fixes. Claims sourced from the author's own notes are
     marked `author_observation`, not wrong. The reviewer is still told to flag
     any inference that the post states as platform fact.
  3. `fact-check-apply` (Sonnet) applies the fixes. It re-checks sources where
     reviewers disagree, resolves `TODO verify` comments the reviews settle,
     and reads the post again for contradictions between chapters, which
     per-chapter reviewers cannot see.
- `depth: 'thorough'` now means two reviewers per chapter (the second prompted
  to refute) rather than three whole-post reviewers.
- The returned `verification.factCheck` adds `chaptersChecked` and
  `chapterVerdicts`, and logs how many claims were checked and flagged. A
  chapter whose reviewer returns nothing is logged, not silently skipped.

### Impact and verification

Only the write-article workflow's Verify phase changes. The prose passes,
holistic read, and Gate phase are untouched, and no site runtime or deploy gate
is affected. The fact-check now spawns one agent per chapter (two in thorough
mode) plus two small coordinating agents, so expect more tokens and a shorter
wall-clock than the old sequential thorough run. To verify, run the workflow on
any brief and confirm the Verify phase shows one `fact-review:` agent per `##`
heading plus the intro, followed by `fact-check-apply`. The script was also
exercised with mocked agents in both depths: quick produced one reviewer per
chapter, thorough two, all Sonnet at high effort.

### Related files

- `.claude/workflows/write-article.js` — `CHAPTERS_SCHEMA`,
  `CHAPTER_FACT_REVIEW_SCHEMA`, and the fact-check block in the Verify phase
  (replaces `FACT_REVIEW_SCHEMA` and the old quick/thorough branches)
- `.agents/skills/web-research/SKILL.md` — the Bonsai fetch workflow reviewers follow

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
