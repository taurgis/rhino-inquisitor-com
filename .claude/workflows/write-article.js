export const meta = {
  name: 'write-article',
  description: 'Research, draft, verify, and gate-check a new rhino-inquisitor.com blog post from a topic brief',
  whenToUse: 'When the user gives a topic/goal for a brand-new post under src/content/posts/** and wants a full first-draft pass: research, drafting, image prompts, prose/fact verification, and quality gates — stopping short of publish. Stops early after Research if the topic looks like a near-duplicate of an existing post. The fact-check runs one read-only Sonnet (high effort) reviewer per chapter, then one agent applies the merged corrections; pass args.depth: "thorough" on higher-stakes posts to add a second, adversarial reviewer per chapter (default "quick" is one reviewer per chapter). The anti-ai-writing pass also runs per chapter (one read-only Sonnet reviewer each), after the fact-check, so text written by the beginner and fact-check passes gets the same sentence-level review.',
  phases: [
    { title: 'Research', detail: 'grounded web research + style/skills/duplicate-topic review (Haiku); early-exits on near-duplicate topics' },
    { title: 'Draft', detail: 'write the post + generate image/screenshot prompt files (Sonnet)' },
    { title: 'Verify', detail: 'human-prose-editing, beginner-technical-writing, per-chapter fact-check (1 or 2 reviewers per chapter, by depth), per-chapter anti-ai-writing review, holistic read (Sonnet)' },
    { title: 'Gate', detail: 'run repo quality gates, independently verify word count, and report pass/fail (Sonnet)' },
  ],
}

const brief = typeof args === 'string' ? args : (args && args.brief) || ''
const notes = typeof args === 'object' && args && args.notes ? args.notes : ''
const slugHint = typeof args === 'object' && args && args.slugHint ? args.slugHint : ''
const depth = typeof args === 'object' && args && args.depth === 'thorough' ? 'thorough' : 'quick'

if (!brief) {
  throw new Error(
    "write-article requires args: either a topic-brief string, or an object like { brief: 'topic and goal', notes: 'optional extra context', slugHint: 'optional-preferred-slug', depth: 'quick' | 'thorough' }"
  )
}

const RESEARCH_SCHEMA = {
  type: 'object',
  properties: {
    sourcesConsulted: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          url: { type: 'string' },
          title: { type: 'string' },
          note: { type: 'string', description: 'What this source confirms or provides' },
        },
        required: ['url'],
      },
    },
    keyFacts: { type: 'array', items: { type: 'string' }, description: 'Concrete, citable facts the article can rely on' },
    openQuestions: { type: 'array', items: { type: 'string' } },
    cacheNotes: { type: 'string', description: 'What was fetched/cached via Bonsai' },
  },
  required: ['sourcesConsulted', 'keyFacts'],
}

const STYLE_SCHEMA = {
  type: 'object',
  properties: {
    voiceNotes: { type: 'array', items: { type: 'string' }, description: 'Specific, concrete voice cues to imitate' },
    similarExistingPosts: {
      type: 'array',
      items: {
        type: 'object',
        properties: { url: { type: 'string' }, title: { type: 'string' }, overlapNote: { type: 'string' } },
      },
    },
    duplicateRisk: { type: 'string', description: "'none', 'partial-overlap: ...', or 'near-duplicate: recommend updating <url> instead'" },
    isTeachingPost: { type: 'boolean', description: 'True if this brief explains a technical concept/mechanism to a learner' },
    suggestedCategories: { type: 'array', items: { type: 'string' } },
    suggestedTags: { type: 'array', items: { type: 'string' } },
    crossLinkCandidates: {
      type: 'array',
      items: { type: 'object', properties: { url: { type: 'string' }, title: { type: 'string' }, why: { type: 'string' } } },
    },
  },
  required: ['voiceNotes', 'isTeachingPost', 'duplicateRisk'],
}

const DRAFT_SCHEMA = {
  type: 'object',
  properties: {
    slug: { type: 'string' },
    url: { type: 'string' },
    filePath: { type: 'string', description: 'Repo-relative path to the new index.md' },
    title: { type: 'string' },
    wordCount: { type: 'number' },
    imagesNeeded: {
      type: 'array',
      description: 'Non-Mermaid images only — real screenshots and house-style illustrations. Diagrams rendered as Mermaid fences belong in the body, not here.',
      items: {
        type: 'object',
        properties: {
          filename: { type: 'string' },
          kind: { type: 'string', enum: ['illustration', 'screenshot', 'diagram'] },
          placementNote: { type: 'string' },
        },
        required: ['filename', 'kind'],
      },
    },
    mermaidDiagramsAdded: {
      type: 'array',
      items: { type: 'string' },
      description: 'Short description of each Mermaid diagram written directly into the body, if any.',
    },
    openQuestionsForAuthor: { type: 'array', items: { type: 'string' } },
  },
  required: ['slug', 'url', 'filePath', 'title', 'imagesNeeded'],
}

const IMAGE_PROMPTS_SCHEMA = {
  type: 'object',
  properties: {
    promptFiles: {
      type: 'array',
      items: { type: 'object', properties: { path: { type: 'string' }, forImage: { type: 'string' } } },
    },
  },
  required: ['promptFiles'],
}

const EDIT_REPORT_SCHEMA = {
  type: 'object',
  properties: {
    changesSummary: { type: 'string' },
    issuesFixed: { type: 'array', items: { type: 'string' } },
    issuesFlaggedNotFixed: { type: 'array', items: { type: 'string' } },
  },
  required: ['changesSummary'],
}

const FACT_CHECK_SCHEMA = {
  type: 'object',
  properties: {
    verifiedClaims: { type: 'number' },
    correctionsMade: { type: 'array', items: { type: 'string' } },
    unverifiableClaims: { type: 'array', items: { type: 'string' } },
    sourcesRecheckedUrls: { type: 'array', items: { type: 'string' } },
  },
  required: ['correctionsMade'],
}

const CHAPTERS_SCHEMA = {
  type: 'object',
  properties: {
    chapters: {
      type: 'array',
      items: { type: 'string', description: 'Verbatim `## ` heading line, or the literal intro label for the first entry' },
    },
  },
  required: ['chapters'],
}

const CHAPTER_FACT_REVIEW_SCHEMA = {
  type: 'object',
  description: 'Read-only fact review of one chapter — no file edits.',
  properties: {
    chapter: { type: 'string' },
    chapterVerdict: { type: 'string', description: 'One or two sentences: is this chapter safe to publish as-is?' },
    claims: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          quote: { type: 'string', description: 'Short verbatim text from the post' },
          verdict: {
            type: 'string',
            enum: ['verified', 'incorrect', 'partially_correct', 'unverifiable_but_framed_ok', 'unverifiable_and_overstated', 'author_observation'],
          },
          severity: { type: 'string', enum: ['high', 'medium', 'low', 'none'] },
          evidence: { type: 'string', description: 'What the official source actually says, or why it cannot be verified' },
          sourceUrls: { type: 'array', items: { type: 'string' } },
          oldText: { type: 'string', description: 'Exact verbatim substring of the post to replace, if a fix is needed' },
          newText: { type: 'string', description: 'Replacement text, if a fix is needed' },
        },
        required: ['quote', 'verdict', 'severity', 'evidence'],
      },
    },
    codeAndCommandIssues: { type: 'array', items: { type: 'string' }, description: 'Problems in code blocks, commands, URLs, paths, or Mermaid diagrams in this chapter' },
    linkIssues: { type: 'array', items: { type: 'string' }, description: 'Broken, wrong, or mis-attributed links in this chapter' },
  },
  required: ['chapter', 'chapterVerdict', 'claims'],
}

const CHAPTER_PROSE_REVIEW_SCHEMA = {
  type: 'object',
  description: 'Read-only anti-ai-writing review of one chapter — no file edits.',
  properties: {
    chapter: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          pattern: { type: 'string', description: 'The skill rule this change applies, by name (e.g. "trailing participial clause", "invented-specific risk")' },
          tier: { type: 'string', enum: ['Evidenced', 'Craft', 'Taste'] },
          reason: { type: 'string', description: 'One sentence: why this sentence is worse than the rewrite' },
          oldText: { type: 'string', description: 'Exact verbatim substring of the post (prose only — never inside a quotation, code fence, or Mermaid block)' },
          newText: { type: 'string', description: 'Replacement text. Same claims, same facts, same technical terms, same links' },
        },
        required: ['pattern', 'tier', 'reason', 'oldText', 'newText'],
      },
    },
    recurringAcrossPost: {
      type: 'array',
      items: { type: 'string' },
      description: 'Moves you saw repeated in other chapters too (same pivot, same closer, same opener). Report them; do not fix outside your chapter',
    },
    chapterVerdict: { type: 'string', description: 'One sentence: does this chapter read as written by the author, or does generated phrasing remain?' },
  },
  required: ['chapter', 'findings', 'chapterVerdict'],
}

const PROSE_APPLY_SCHEMA = {
  type: 'object',
  properties: {
    changesSummary: { type: 'string' },
    applied: { type: 'array', items: { type: 'string' }, description: 'Chapter, pattern, and a short before/after for each applied fix' },
    rejected: { type: 'array', items: { type: 'string' }, description: 'Proposed fixes not applied, each with why (changed a claim, touched a quote/code, overlapped a fact correction, made the sentence worse)' },
    tasteSuggestionsForAuthor: { type: 'array', items: { type: 'string' }, description: '[Taste] proposals, left unapplied for the author to decide' },
    recurringPatternsFixed: { type: 'array', items: { type: 'string' } },
  },
  required: ['changesSummary', 'applied', 'rejected'],
}

const HOLISTIC_SCHEMA = {
  type: 'object',
  properties: {
    coherent: { type: 'boolean', description: 'False if the sequential edit passes left visible seams' },
    seams: { type: 'array', items: { type: 'string' }, description: 'Specific spots that read as stitched-together or inconsistent' },
    verdict: { type: 'string', description: 'One or two direct sentences: would this get published as-is?' },
  },
  required: ['coherent', 'verdict'],
}

const GATE_SCHEMA = {
  type: 'object',
  properties: {
    commandsRun: { type: 'array', items: { type: 'string' } },
    passed: { type: 'boolean' },
    failures: { type: 'array', items: { type: 'string' } },
    fixesApplied: { type: 'array', items: { type: 'string' } },
    verifiedWordCount: { type: 'number', description: 'Body word count, independently counted — not copied from the draft agent' },
    remainingManualSteps: { type: 'array', items: { type: 'string' } },
  },
  required: ['passed', 'verifiedWordCount'],
}

phase('Research')
log('Researching sources and reviewing house style/voice in parallel.')

const [research, styleGuide] = await parallel([
  () =>
    agent(
      `You are researching background for a new blog post on rhino-inquisitor.com, an SFCC/Salesforce Commerce Cloud technical blog. Do grounded, source-cited research before any writing happens — do not rely on training-data knowledge alone.

Topic brief: "${brief}"
${notes ? `Additional notes from the requester: ${notes}` : ''}

Steps:
1. Follow this repo's web-research skill workflow: discover the official/authoritative source URLs yourself (web search), then fetch each through Bonsai so it is cached for reuse: \`npx @taurgis/bonsai <url> --format detailed\`. Prefer official Salesforce Help/Developer docs, changelogs, and other primary sources over third-party blogs when the topic depends on platform behavior.
2. Extract the concrete facts, version numbers, API/class names, limits, and dates the article will depend on.
3. Note anything you could not verify, or where sources disagree.

Return sourcesConsulted (url + title + a one-line note on what it confirms), keyFacts (concrete, citable facts), openQuestions, and cacheNotes (what you fetched/cached via Bonsai).`,
      { label: 'grounded-research', phase: 'Research', model: 'haiku', schema: RESEARCH_SCHEMA }
    ),
  () =>
    agent(
      `You are preparing style and scope guidance for a new blog post on rhino-inquisitor.com. This is a read-only review — do not edit anything.

Topic brief: "${brief}"
${notes ? `Additional notes from the requester: ${notes}` : ''}

Read before reporting back:
1. \`src/content/posts/AGENTS.md\` — the full style guide (voice, structure, front matter contract).
2. \`.agents/skills/human-prose-editing/SKILL.md\`, \`.agents/skills/anti-ai-writing/SKILL.md\`, \`.agents/skills/beginner-technical-writing/SKILL.md\` — the rules that will apply during editing later.
3. 3-5 of the most recently modified posts under \`src/content/posts/**/index.md\` (check \`lastmod\`/\`date\` front matter) to sample current voice, and skim their front matter for the current \`categories\`/\`tags\` vocabulary.
4. Scan \`src/content/posts/**\` for any existing post that substantially overlaps this brief's topic (title/description/body skim), so effort isn't spent duplicating a published article.

Return: voiceNotes (specific, concrete cues to imitate — not generic advice), similarExistingPosts (any overlapping posts found), duplicateRisk ('none', or a note on the overlap and whether to proceed anyway or update the existing post instead), isTeachingPost (true only if this brief explains a technical concept/mechanism to a learner — decides whether beginner-technical-writing applies later), suggestedCategories and suggestedTags (reuse existing vocabulary observed; only propose new ones if nothing fits, and say so), and crossLinkCandidates (2-5 existing posts worth linking to, with why).`,
      { label: 'style-and-duplicate-review', phase: 'Research', model: 'haiku', schema: STYLE_SCHEMA }
    ),
])

if (styleGuide.duplicateRisk && styleGuide.duplicateRisk !== 'none') {
  log(`Duplicate-topic warning: ${styleGuide.duplicateRisk}`)
}

if (styleGuide.duplicateRisk && styleGuide.duplicateRisk.toLowerCase().startsWith('near-duplicate')) {
  log('Stopping after Research — near-duplicate topic detected. Not spending Draft/Verify/Gate on a likely-redundant post.')
  return {
    stoppedEarly: true,
    reason: 'near-duplicate-topic',
    duplicateRisk: styleGuide.duplicateRisk,
    similarExistingPosts: styleGuide.similarExistingPosts,
    research,
  }
}

phase('Draft')
log('Writing the draft, then generating image/screenshot prompt files for it.')

const draft = await agent(
  `Write a new blog post for rhino-inquisitor.com from the research and style findings below. This is a live Hugo site — follow its conventions exactly.

Topic brief: "${brief}"
${notes ? `Additional notes from the requester: ${notes}` : ''}
${slugHint ? `Preferred slug (use if it doesn't collide, otherwise adapt): ${slugHint}` : ''}

Research findings (cite these facts in the article; do not invent facts, versions, limits, or API names beyond what this supports):
${JSON.stringify(research)}

Style, voice, and scope findings:
${JSON.stringify(styleGuide)}

Requirements:
1. Read \`src/content/posts/AGENTS.md\` in full and follow it — the authoritative style guide (voice, structure, front matter field order, length, endings, boundaries).
2. Read \`src/archetypes/posts.md\` for the front matter shape.
3. Pick a slug and \`url\` that do not collide with any existing folder under \`src/content/posts/\` or entry in \`url-data/url-manifest.json\`.
4. Create \`src/content/posts/<slug>/index.md\` with complete front matter in the required field order: title, description (120-155 chars, folded scalar \`>-\`, benefit-first, never "This post..."), date and lastmod (quoted ISO 8601 with milliseconds and Z, same timestamp for both since this is new), url, draft: true, heroImage (every post gets one — set this to the intended filename, e.g. \`<slug>-hero.png\`, even though the file doesn't exist yet; a later step generates the prompt to produce it), heroImageAlt (write the real descriptive alt text now, under 125 characters — do not leave it blank), categories, tags (reuse styleGuide.suggestedCategories/suggestedTags unless they genuinely don't fit), author: "Thomas Theunen", and takeaways (exactly 3 double-quoted strings, third-person verb first, no trailing periods).
5. Write the body: minimum 800 words of substance, in the voice from AGENTS.md and styleGuide.voiceNotes. If the post needs to serve both hands-on implementers and higher-level readers, consult \`.agents/skills/audience-layering/SKILL.md\`. If it walks through code, hooks, or request flow, consult \`.agents/skills/code-walkthrough-authoring/SKILL.md\`.
6. Add 2-4 internal cross-links from styleGuide.crossLinkCandidates using relative paths.
7. For any diagram the post needs that Mermaid can render (flowcharts, sequence diagrams, decision trees, state/architecture diagrams — anything expressible as nodes/edges or a sequence of steps), write it directly in the body as a \`\`\`mermaid fenced code block instead of an image placeholder — this site has native Mermaid support (see \`docs/development/mermaid-diagram-support.md\`), so no placeholder, no prompt file, and no human production step are needed. Match the plain-flowchart/sequenceDiagram style already used in \`src/content/posts/the-bouncer-at-the-door-bot-protection-in-sfcc/index.md\` and \`src/content/posts/tokens-arent-free-picking-models-and-keeping-agents-grounded/index.md\` (quoted node labels, \`\\n\` for line breaks inside labels, quoted subgraph names) and rely on the site's theme-driven coloring — don't hardcode colors. Do not list Mermaid diagrams in imagesNeeded. For any in-body screenshot/illustration that genuinely isn't diagram-shaped (a real UI screenshot, a house-style cartoon illustration), do not invent an image file — insert a placeholder reference instead (e.g. \`![alt text](PLACEHOLDER-<kebab-name>.png)\`) and list it in imagesNeeded; a later step generates a prompt file per placeholder for a human to produce.
8. Every post gets a hero image — this is mandatory, not conditional on whether the body needs other illustrations. Always add exactly one entry to imagesNeeded for it: \`{ filename: "<the heroImage value from step 4>", kind: "illustration", placementNote: "hero image" }\`. This applies even to posts with no in-body images at all.
9. Do not set draft: false and do not run any git commands.

Return slug, url, filePath (repo-relative), title, wordCount (body word count), imagesNeeded (filename/kind/placementNote per non-Mermaid placeholder inserted), mermaidDiagramsAdded (one line per Mermaid diagram written into the body, if any), and openQuestionsForAuthor (anything guessed or left as a TODO).`,
  { label: 'write-draft', phase: 'Draft', model: 'sonnet', schema: DRAFT_SCHEMA }
)

log(`Draft written: ${draft.filePath}`)

const imagePrompts = await agent(
  `Generate prompt files for the images/screenshots the draft at \`${draft.filePath}\` still needs, so a human (or a separate image-generation agent with zero access to this repository) can produce them from the prompt file alone.

Images to cover: ${JSON.stringify(draft.imagesNeeded)}

For each image, create a prompt file at \`src/content/posts/${draft.slug}/prompts/<filename-without-extension>.prompt.md\` (create the \`prompts/\` folder if needed — these are working notes, not published content, and are not image files themselves). Open with what the image is for and exactly where it sits in the article (section heading, position relative to nearby prose/code).

Then branch by kind:

**If \`kind\` is \`"illustration"\` (or a \`"diagram"\` too pictorial for Mermaid — a real piece of generated artwork, not a nodes-and-edges diagram):** write a fully self-contained image-generation prompt. The agent that executes it has no access to this repository, cannot open \`src/content/posts/AGENTS.md\`, and cannot view any reference image — every visual fact has to be spelled out in words, not referenced by pointing at "the house style." Before writing it, open one existing hero/in-body illustration file in this repo (e.g. a \`.png\`/\`.jpg\` sitting next to a post's \`index.md\` with a non-empty \`heroImage\`, or referenced by an \`img-caption\` illustration) and look at it directly, then translate what you see into the sections below — do not skip looking at a real example and guess. Structure the prompt with these labeled sections:
   - **Subject**: the site's mascot is an anthropomorphic gray rhinoceros — stocky, humanoid proportions, upright two-legged stance, human-like five-fingered hands, heavy sloped brow, small rounded ears, one large horn plus one smaller horn, textured wrinkled gray skin. Describe how it's dressed/staged for this specific image.
   - **Scene**: the specific action/metaphor for this image, tailored to what this article is actually about — not a generic mascot pose.
   - **Setting**: background and lighting.
   - **Color palette**: warm, restrained "Paper & Ink" palette — cream/paper midtones, deep ink-navy shadows, one warm amber/gold accent color reserved for the single most important element in the scene; no neon, no saturated primaries, no default AI-generator color grading.
   - **Line and rendering style**: clean dark ink outlines (comic-book line art) filled with painterly digital shading and visible brushwork texture — not flat vector/cel-shading, not photorealistic.
   - **Composition**: main subject placement, open negative space on one side for a possible text overlay, landscape orientation.
   - **No-text constraint**: explicitly instruct the generator to render no legible text, labels, logos, or watermarks anywhere in the image — general-purpose image generators reliably garble or misspell text, so anything that needs to be exact belongs in the article's prose or a Mermaid diagram, never in generated artwork.
   - **Aspect ratio / output**: 16:9 landscape, roughly matching this site's existing hero image pixel dimensions (check one real file's dimensions rather than assuming), single cohesive scene, high detail, no panel splits or collage.
   Below the prompt, include a ready-to-paste front matter snippet: for a hero image, \`heroImage:\`/\`heroImageAlt:\` lines; for an in-body image, the \`{{< img-caption src="..." alt="..." caption="..." >}}\` shortcode call — using the suggested filename (plain descriptive kebab-case, no hash suffix), a suggested alt text (descriptive, under 125 characters), and, for in-body images, a suggested caption per \`.agents/skills/image-caption-writing/SKILL.md\` (the caption must carry the argument/point, never restate the alt text, never say "Figure 1").

**If \`kind\` is \`"screenshot"\`:** skip the illustration-prompt structure above entirely — this is a real capture, not generated art. Give the exact Business Manager path/UI/URL/state to capture, plus the same suggested alt text and caption fields as above.

Do not generate the actual image — only the prompt file.

Return promptFiles (path + forImage for each file written).`,
  { label: 'image-prompt-files', phase: 'Draft', model: 'sonnet', schema: IMAGE_PROMPTS_SCHEMA }
)

phase('Verify')
log(`Running human-prose-editing, beginner-technical-writing, a per-chapter fact-check (${depth} mode), a per-chapter anti-ai-writing review, and a holistic read in that order. Edits to the post never run in parallel; per-chapter reviewers are read-only and one agent applies their fixes.`)

const humanProseResult = await agent(
  `Apply the \`human-prose-editing\` skill (\`.agents/skills/human-prose-editing/SKILL.md\`) to the draft at \`${draft.filePath}\`. Read the whole skill first and follow it as written: the additive pass before any cutting, the cohesion mechanics, the voice-preservation rules, and its stop condition. This pass owns paragraphs and above (section openings and endings, topic order, cohesion, voice, moves repeated across sections). Leave word- and clause-level cleanup to the later \`anti-ai-writing\` pass. Do not touch front matter, quotations, code fences, or Mermaid blocks, and never invent a fact, number, or first-person experience the brief and research do not support. Edit the file directly.

Author's brief and notes (the only first-person material you may draw on): ${JSON.stringify({ brief, notes })}

Return changesSummary, issuesFixed, issuesFlaggedNotFixed.`,
  { label: 'verify-human-prose-editing', phase: 'Verify', model: 'sonnet', schema: EDIT_REPORT_SCHEMA }
)

let beginnerResult = null
if (styleGuide.isTeachingPost) {
  beginnerResult = await agent(
    `Apply the \`beginner-technical-writing\` skill (\`.agents/skills/beginner-technical-writing/SKILL.md\`) to \`${draft.filePath}\`. This post teaches a technical/platform concept, so verify every explanation stays correct while remaining readable to a reader still learning SFCC, per the skill's reader model and writing defaults. Edit the file directly where needed. A per-chapter anti-ai-writing review runs after you, so focus on what the reader needs explained, not on polishing wording.

Return changesSummary, issuesFixed, issuesFlaggedNotFixed.`,
    { label: 'verify-beginner-technical-writing', phase: 'Verify', model: 'sonnet', schema: EDIT_REPORT_SCHEMA }
  )
} else {
  log('Skipping beginner-technical-writing pass — style review classified this as a non-teaching post.')
}

const INTRO_CHAPTER = 'Front matter + intro (everything before the first `## ` heading, including title, description, heroImageAlt, and takeaways)'

const chapterList = await agent(
  `List the chapters of \`${draft.filePath}\` for a per-chapter fact-check. Read the file; do not edit it.

Return \`chapters\` in document order. The first entry is exactly this literal string: "${INTRO_CHAPTER}". After it, one entry per \`## \` heading line in the body, copied verbatim including the \`## \` prefix. Ignore \`#\` lines inside fenced code blocks (shell comments are not headings) and do not list \`###\` subheadings separately; they belong to their \`## \` chapter.`,
  { label: 'fact-check-chapters', phase: 'Verify', model: 'haiku', effort: 'low', schema: CHAPTERS_SCHEMA }
)
const chapters = chapterList && chapterList.chapters && chapterList.chapters.length > 1 ? chapterList.chapters : null
if (!chapters) {
  log('Could not split the post into chapters; falling back to one reviewer for the whole post.')
}
const chapterTargets = chapters || ['The whole post (front matter and every section)']

const reviewersPerChapter = depth === 'thorough' ? 2 : 1
log(`Fact-checking ${chapterTargets.length} chapter(s) with ${reviewersPerChapter} read-only Sonnet reviewer(s) each (high effort), then one agent applies the merged corrections.`)

const reviewerLens = (n) =>
  n === 1
    ? 'Default to doubting: "plausible" is not "verified".'
    : 'You are the adversarial second reviewer for this chapter. Assume the first reviewer missed something: try to refute each claim, and hunt hardest for subtle drift (a number, a menu path, a flag, a cause-and-effect claim stated more strongly than its source).'

const chapterReviewPrompt = (chapter, n) => `You are doing a DEEP fact-check of ONE chapter of a draft blog post on rhino-inquisitor.com (an SFCC / Salesforce B2C Commerce technical blog).

File: \`${draft.filePath}\`
Your chapter: ${chapter}

Read the whole post for context, but fact-check ONLY your chapter. This is READ-ONLY: do not edit the post or any other repo file. Return proposed fixes in the schema instead; \`oldText\` must be an exact verbatim substring of the post so the fix can be applied mechanically.

How to check:
- Extract every factual or technical claim in your chapter: platform behaviour, limits, timeouts, retention numbers, version numbers, API/class names, Business Manager menu paths, URLs and paths, HTTP methods and status codes, CLI commands and flags, language/runtime semantics, CI syntax, shell behaviour in code blocks, dates and conversions, link targets and what each link is cited for.
- Verify each against CURRENT official documentation fetched in this task. Use the web-research skill / Bonsai (\`npx @taurgis/bonsai <url> --format detailed\`) for Salesforce Help and Developer pages; discover URLs with web search if needed. Check \`npx @taurgis/bonsai list\` for already-cached pages first, but re-fetch anything critical. Training-data knowledge does not count as verification.
- For each link in your chapter, confirm the page exists and actually supports the sentence it is attached to.
- For code blocks and diagrams: reason carefully about whether they work and match the prose (flags, quoting, exit codes, regex, loop logic, diagram branches). Run harmless local checks (e.g. \`bash -n\`, a date conversion, a tiny local experiment) where that settles a question.
- ${reviewerLens(n)}

Claims taken from the author's own notes in the brief (observed logs, stack traces, incidents) are not publicly documented: mark them \`author_observation\` and do not call them wrong for being undocumented, but DO flag (\`unverifiable_and_overstated\`) any place where the post states an inference about them as established platform fact, and propose hedged wording.

Author's brief and notes, for telling author observations apart from claims the post should be able to source: ${JSON.stringify({ brief, notes })}

Research already gathered: ${JSON.stringify(research)}

Keep the author's voice (British English, first person, dry, practitioner tone) in any \`newText\`, and keep fixes minimal. Flag any \`<!-- TODO verify -->\` comment in your chapter and propose how to resolve it. Include verified claims too (severity \`none\`) so the report shows coverage.`

const chapterReviews = (
  await parallel(
    chapterTargets.flatMap((chapter, i) =>
      Array.from({ length: reviewersPerChapter }, (_, k) => () =>
        agent(chapterReviewPrompt(chapter, k + 1), {
          label: `fact-review:${i}${reviewersPerChapter > 1 ? `.${k + 1}` : ''}:${chapter.replace(/^## /, '').slice(0, 40)}`,
          phase: 'Verify',
          model: 'sonnet',
          effort: 'high',
          schema: CHAPTER_FACT_REVIEW_SCHEMA,
        })
      )
    )
  )
).filter(Boolean)

const expectedReviews = chapterTargets.length * reviewersPerChapter
if (chapterReviews.length < expectedReviews) {
  log(`${expectedReviews - chapterReviews.length} of ${expectedReviews} chapter review(s) returned nothing; those chapters are only covered by the apply agent's own check.`)
}
const flaggedClaims = chapterReviews.flatMap((r) => (r.claims || []).filter((c) => c.severity !== 'none'))
const reviewSources = [...new Set(chapterReviews.flatMap((r) => (r.claims || []).flatMap((c) => c.sourceUrls || [])))]
log(`Chapter reviewers checked ${chapterReviews.reduce((n, r) => n + (r.claims || []).length, 0)} claim(s) and flagged ${flaggedClaims.length}.`)

const factCheckResult = await agent(
  `Read-only reviewers just fact-checked \`${draft.filePath}\` chapter by chapter (${reviewersPerChapter} reviewer(s) per chapter). Their reports are below. Apply the corrections to the file.

Chapter reviews: ${JSON.stringify(chapterReviews)}
Research already gathered: ${JSON.stringify(research)}

How to apply:
- Apply every fix marked \`incorrect\`, \`partially_correct\`, or \`unverifiable_and_overstated\`, plus the code, command, and link issues. Where two reviewers of the same chapter disagree, or a fix looks wrong, re-check the source with a fresh Bonsai fetch before deciding; do not settle it by vote count.
- \`oldText\` was quoted from the file before any fix landed, so an earlier fix may have changed the text: apply by meaning when the exact string no longer matches.
- Per-chapter reviewers cannot see contradictions BETWEEN chapters. Read the post once more after applying and fix any you find (for example a diagram or script in one chapter that contradicts the advice in another, or the same number stated differently twice).
- Resolve existing \`<!-- TODO verify -->\` comments where the reviews settle them. For anything you genuinely cannot resolve, leave or add an inline \`<!-- TODO verify: ... -->\` comment rather than guessing.

Return verifiedClaims (count of claims evaluated across all chapters, including ones confirmed fine), correctionsMade (each naming the chapter, the wrong claim, and the fix), unverifiableClaims, and sourcesRecheckedUrls.`,
  { label: 'fact-check-apply', phase: 'Verify', model: 'sonnet', schema: FACT_CHECK_SCHEMA }
)
factCheckResult.sourcesRecheckedUrls = [...new Set([...(factCheckResult.sourcesRecheckedUrls || []), ...reviewSources])]
factCheckResult.chaptersChecked = chapterTargets
factCheckResult.chapterVerdicts = chapterReviews.map((r) => ({ chapter: r.chapter, verdict: r.chapterVerdict }))

// anti-ai-writing runs per chapter AFTER the fact-check: the beginner and
// fact-check passes write new sentences, and a whole-post pass before them
// never saw that text. Same shape as the fact-check: read-only reviewers in
// parallel, then one agent applies, so no two agents edit the file at once.
log(`Running anti-ai-writing on ${chapterTargets.length} chapter(s) with one read-only Sonnet reviewer each, then one agent applies the fixes.`)

const proseReviewPrompt = (chapter) => `Review ONE chapter of a draft blog post on rhino-inquisitor.com against the \`anti-ai-writing\` skill. This is sentence- and clause-level review only.

File: \`${draft.filePath}\`
Your chapter: ${chapter}
(If that heading no longer matches the file exactly, an earlier pass edited it: review the section in that position.)

Read \`.agents/skills/anti-ai-writing/SKILL.md\` in full first, including its restraint rule, evidence tiers, the rules it deliberately dropped, and its stop condition. Then read the whole post for context, and review ONLY your chapter. You may run the skill's diagnostic snippet on the file to find candidates, but a count is a prompt to look, not a verdict.

This is READ-ONLY: do not edit the post or any other repo file. Propose each fix in the schema, with \`oldText\` an exact verbatim substring of the post so it can be applied mechanically. Keep each \`oldText\` as short as uniquely locates the change (usually one sentence).

Hard limits on every \`newText\`:
- Keep every claim, qualification, number, version, API or class name, menu path, link, and technical term exactly as the post states it. The fact-check just verified this text; a style fix must not re-open it. The corrections it made are listed below — leave their facts intact.
- Never invent a specific to replace a vague phrase. If a sentence needs a fact the post, brief, or research does not contain, either keep it general or append a \`<!-- TODO author: ... -->\` comment naming the missing fact, as the skill describes.
- Never edit inside a quotation, code fence, inline code, Mermaid block, or front matter.
- Keep British English and the author's first-person, dry practitioner voice. Do not strip motivated hedges such as "I think" or "as far as I can tell".

Tag every finding with its tier from the skill. Propose [Taste] items only when they are clear improvements; they go to the author, not into the file. If your chapter is clean, return an empty \`findings\` array: no change is a valid result, and edits made for their own sake are a failure mode the skill warns against.

Fact-check corrections already applied: ${JSON.stringify(factCheckResult.correctionsMade || [])}
Author's brief and notes: ${JSON.stringify({ brief, notes })}`

const proseReviews = (
  await parallel(
    chapterTargets.map((chapter, i) => () =>
      agent(proseReviewPrompt(chapter), {
        label: `anti-ai-review:${i}:${chapter.replace(/^## /, '').slice(0, 40)}`,
        phase: 'Verify',
        model: 'sonnet',
        effort: 'medium',
        schema: CHAPTER_PROSE_REVIEW_SCHEMA,
      })
    )
  )
).filter(Boolean)

if (proseReviews.length < chapterTargets.length) {
  log(`${chapterTargets.length - proseReviews.length} of ${chapterTargets.length} anti-ai-writing review(s) returned nothing; those chapters get no sentence-level pass.`)
}
const proseFindings = proseReviews.flatMap((r) => (r.findings || []).map((f) => ({ chapter: r.chapter, ...f })))
const enforceable = proseFindings.filter((f) => f.tier !== 'Taste')
const recurring = [...new Set(proseReviews.flatMap((r) => r.recurringAcrossPost || []))]
log(`Anti-ai-writing reviewers proposed ${proseFindings.length} fix(es): ${enforceable.length} [Evidenced]/[Craft], ${proseFindings.length - enforceable.length} [Taste] for the author.`)

let antiAiResult
if (enforceable.length === 0 && recurring.length === 0) {
  antiAiResult = {
    changesSummary: 'No [Evidenced] or [Craft] findings in any chapter; file left unchanged.',
    applied: [],
    rejected: [],
    tasteSuggestionsForAuthor: proseFindings.map((f) => `${f.chapter}: ${f.oldText} → ${f.newText} (${f.reason})`),
    recurringPatternsFixed: [],
  }
} else {
  antiAiResult = await agent(
    `Read-only reviewers just checked \`${draft.filePath}\` chapter by chapter against the \`anti-ai-writing\` skill (\`.agents/skills/anti-ai-writing/SKILL.md\`; read it first). Apply their fixes to the file.

[Evidenced]/[Craft] findings to apply: ${JSON.stringify(enforceable)}
[Taste] findings (do NOT apply; return them in tasteSuggestionsForAuthor): ${JSON.stringify(proseFindings.filter((f) => f.tier === 'Taste'))}
Moves reviewers saw recurring across chapters: ${JSON.stringify(recurring)}
Fact-check corrections already applied: ${JSON.stringify(factCheckResult.correctionsMade || [])}

How to apply:
- Apply a fix only if \`newText\` keeps every claim, qualification, number, name, link, and technical term of \`oldText\`, adds no fact the post did not already contain, and reads better. Reject anything else and say why. When a fix would undo or blur a fact-check correction, the correction wins.
- Never change text inside quotations, code fences, inline code, Mermaid blocks, or front matter, even if a reviewer proposed it.
- Per-chapter reviewers each see one instance of a move; you see the document. For each recurring move listed above, keep the instance that does real work and fix the rest, within the same limits.
- Check that the fixes do not leave the post with a new stock phrase repeated in place of the old one.

Return changesSummary, applied, rejected, tasteSuggestionsForAuthor, recurringPatternsFixed.`,
    { label: 'anti-ai-apply', phase: 'Verify', model: 'sonnet', schema: PROSE_APPLY_SCHEMA }
  )
}
if (antiAiResult) antiAiResult.chapterVerdicts = proseReviews.map((r) => ({ chapter: r.chapter, verdict: r.chapterVerdict }))

const holisticReview = await agent(
  `Read \`${draft.filePath}\` start to finish as a fresh reader with no memory of the editing history — this is a READ-ONLY pass, do not edit the file. Judge only the whole: does it read as one coherent voice throughout, or do the sequential edit passes show seams (a paragraph that reads differently from its neighbors, a fix that undid an earlier rhythm choice, a spot where the tone whiplashes)? Read \`src/content/posts/AGENTS.md\` first so you know the target voice, then ask: would Thomas actually publish this as-is?

Return coherent (false if you find real seams), seams (each specific spot, quoted or described precisely enough to find), and verdict (one or two direct sentences).`,
  { label: 'holistic-read', phase: 'Verify', model: 'sonnet', schema: HOLISTIC_SCHEMA }
)

if (!holisticReview.coherent) {
  log(`Holistic read flagged ${(holisticReview.seams || []).length} seam(s) for a human to look at before publishing.`)
}

phase('Gate')
log('Running repository quality gates against the new post.')

const gateResult = await agent(
  `Run this repo's quality gates against the new post at \`${draft.filePath}\` and fix anything they flag that's safe to fix automatically (formatting, front matter field issues, obvious typos). Do not touch content that's a judgment call. If a command fails and you apply a fix for what it flagged, re-run that exact command afterward and base \`passed\`/\`failures\` on the re-run's result, not the original failure.

Run, in order, from the repo root:
1. \`npm run validate:frontmatter\`
2. \`npm run check:spelling\`
3. \`npx markdownlint-cli2 "${draft.filePath}"\`
4. \`npm run check:callouts\`
5. \`npm run check:when-published\`
6. \`npm run preflight\`

Also manually confirm against \`.agents/skills/hugo-development/SKILL.md\` and the content-quality/seo-compliance checklists:
- url is lowercase, starts/ends with \`/\`, and is unique across \`src/content/posts/**\` and \`url-data/url-manifest.json\`
- description is 120-155 characters
- categories reuse existing vocabulary unless there's a stated reason not to
- takeaways: exactly 3, double-quoted, third-person verb first, no trailing periods
- heroImage is non-empty and heroImageAlt is set with descriptive alt text under 125 characters — every post requires a hero image, so flag it as a failure if either is blank or missing
- every image reference has non-empty, descriptive alt text
- all internal links are relative paths — no absolute rhino-inquisitor.com URLs
- any internal link that points to another \`draft: true\` post is wrapped in the \`{{< when-published >}}\` shortcode (see \`docs/publishing/when-published-shortcode.md\`) — a direct link to an unpublished draft fails the deploy's internal-link gate
- body starts headings at \`##\`, fenced code blocks carry a language tag
- list every remaining \`<!-- TODO ... -->\` comment (\`TODO verify\` from the fact-check, \`TODO author\` from the prose passes) in remainingManualSteps. Hugo does not render raw HTML in Markdown (\`markup.goldmark.renderer.unsafe\` defaults to false and this repo does not set it), so a comment left behind never shows on the page and no gate catches it; leave them in the file for the author
- if the post links to a new external domain, it must be registered in \`scripts/gates/external-link-domains.js\` before it can be committed — flag this, don't edit that file yourself

Independently count the words in the post's body (excluding front matter) yourself — do not copy the draft agent's self-reported word count — and confirm it meets the 800-word minimum from \`src/content/posts/AGENTS.md\`. If it falls short, note it in failures/remainingManualSteps rather than padding the post yourself.

Do NOT set \`draft: false\`, do NOT run \`git add\`/\`git commit\`/\`git push\`, and do NOT run \`npm run gates:local\` (the full deploy suite — leave that for the human before publishing).

Return commandsRun, passed (true only if every command exited clean after any re-runs and the manual checklist has no unresolved issues), failures (command/check plus the actual error), fixesApplied, verifiedWordCount (your own count), and remainingManualSteps (e.g. "flip draft:false when ready", "register domain X", "supply the N images in prompts/").`,
  { label: 'gate-checks', phase: 'Gate', model: 'sonnet', schema: GATE_SCHEMA }
)

return {
  title: draft.title,
  filePath: draft.filePath,
  url: draft.url,
  wordCount: draft.wordCount,
  duplicateRisk: styleGuide.duplicateRisk,
  imagePromptFiles: imagePrompts.promptFiles,
  mermaidDiagramsAdded: draft.mermaidDiagramsAdded,
  openQuestionsForAuthor: draft.openQuestionsForAuthor,
  verification: {
    humanProseEditing: humanProseResult,
    antiAiWriting: antiAiResult,
    beginnerTechnicalWriting: beginnerResult,
    factCheck: factCheckResult,
    holisticRead: holisticReview,
  },
  gate: gateResult,
}
