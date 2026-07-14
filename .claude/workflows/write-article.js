export const meta = {
  name: 'write-article',
  description: 'Research, draft, verify, and gate-check a new rhino-inquisitor.com blog post from a topic brief',
  whenToUse: 'When the user gives a topic/goal for a brand-new post under src/content/posts/** and wants a full first-draft pass: research, drafting, image prompts, prose/fact verification, and quality gates — stopping short of publish. Stops early after Research if the topic looks like a near-duplicate of an existing post. Pass args.depth: "thorough" for an adversarial 3-reviewer fact-check on higher-stakes posts (default "quick" is a single fact-check pass).',
  phases: [
    { title: 'Research', detail: 'grounded web research + style/skills/duplicate-topic review (Haiku); early-exits on near-duplicate topics' },
    { title: 'Draft', detail: 'write the post + generate image/screenshot prompt files (Sonnet)' },
    { title: 'Verify', detail: 'sequential human-prose-editing, anti-ai-writing, beginner-technical-writing, fact-check (single or 3-reviewer, by depth), holistic read (Sonnet)' },
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

const FACT_REVIEW_SCHEMA = {
  type: 'object',
  description: 'Read-only independent fact review — no file edits.',
  properties: {
    suspectedIssues: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          claim: { type: 'string' },
          whyDoubtful: { type: 'string' },
          suggestedFix: { type: 'string' },
        },
        required: ['claim', 'whyDoubtful'],
      },
    },
    sourcesRecheckedUrls: { type: 'array', items: { type: 'string' } },
  },
  required: ['suspectedIssues'],
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
4. Create \`src/content/posts/<slug>/index.md\` with complete front matter in the required field order: title, description (120-155 chars, folded scalar \`>-\`, benefit-first, never "This post..."), date and lastmod (quoted ISO 8601 with milliseconds and Z, same timestamp for both since this is new), url, draft: true, heroImage (leave "" for now), categories, tags (reuse styleGuide.suggestedCategories/suggestedTags unless they genuinely don't fit), author: "Thomas Theunen", and takeaways (exactly 3 double-quoted strings, third-person verb first, no trailing periods).
5. Write the body: minimum 800 words of substance, in the voice from AGENTS.md and styleGuide.voiceNotes. If the post needs to serve both hands-on implementers and higher-level readers, consult \`.agents/skills/audience-layering/SKILL.md\`. If it walks through code, hooks, or request flow, consult \`.agents/skills/code-walkthrough-authoring/SKILL.md\`.
6. Add 2-4 internal cross-links from styleGuide.crossLinkCandidates using relative paths.
7. For any diagram the post needs that Mermaid can render (flowcharts, sequence diagrams, decision trees, state/architecture diagrams — anything expressible as nodes/edges or a sequence of steps), write it directly in the body as a \`\`\`mermaid fenced code block instead of an image placeholder — this site has native Mermaid support (see \`docs/development/mermaid-diagram-support.md\`), so no placeholder, no prompt file, and no human production step are needed. Match the plain-flowchart/sequenceDiagram style already used in \`src/content/posts/the-bouncer-at-the-door-bot-protection-in-sfcc/index.md\` and \`src/content/posts/tokens-arent-free-picking-models-and-keeping-agents-grounded/index.md\` (quoted node labels, \`\\n\` for line breaks inside labels, quoted subgraph names) and rely on the site's theme-driven coloring — don't hardcode colors. Do not list Mermaid diagrams in imagesNeeded. For any hero image or in-body screenshot/illustration that genuinely isn't diagram-shaped (a real UI screenshot, a house-style cartoon illustration), do not invent an image file — insert a placeholder reference instead (e.g. \`![alt text](PLACEHOLDER-<kebab-name>.png)\`) and list it in imagesNeeded; a later step generates a prompt file per placeholder for a human to produce.
8. Do not set draft: false and do not run any git commands.

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
log(`Running human-prose-editing, anti-ai-writing, fact verification (${depth} mode), and a holistic read in sequence (same file — no parallel edits).`)

const humanProseResult = await agent(
  `Apply the \`human-prose-editing\` skill (\`.agents/skills/human-prose-editing/SKILL.md\`) to the draft at \`${draft.filePath}\`. Edit paragraph rhythm, section openings/endings, and voice per its "Thomas Style Cues" and "Paragraph-Level Method" sections and its Detection Reality warning. Do not touch front matter. Leave sentence-level wording cleanup to the next pass — focus on structure, flow, and voice. Edit the file directly.

Return changesSummary, issuesFixed, issuesFlaggedNotFixed.`,
  { label: 'verify-human-prose-editing', phase: 'Verify', model: 'sonnet', schema: EDIT_REPORT_SCHEMA }
)

const antiAiResult = await agent(
  `Apply the \`anti-ai-writing\` skill (\`.agents/skills/anti-ai-writing/SKILL.md\`) to \`${draft.filePath}\` — sentence-level cleanup only, now that the structure/voice pass is in place. Follow its "Sentence-Level Signals To Remove", "Rewrite Method", and "Quick Pass Checklist". Edit the file directly.

Return changesSummary, issuesFixed, issuesFlaggedNotFixed.`,
  { label: 'verify-anti-ai-writing', phase: 'Verify', model: 'sonnet', schema: EDIT_REPORT_SCHEMA }
)

let beginnerResult = null
if (styleGuide.isTeachingPost) {
  beginnerResult = await agent(
    `Apply the \`beginner-technical-writing\` skill (\`.agents/skills/beginner-technical-writing/SKILL.md\`) to \`${draft.filePath}\` — this post teaches a technical/platform concept, so verify every explanation stays correct while remaining readable to a reader still learning SFCC, per its Reader Model and Writing Defaults. Edit the file directly where needed.

Return changesSummary, issuesFixed, issuesFlaggedNotFixed.`,
    { label: 'verify-beginner-technical-writing', phase: 'Verify', model: 'sonnet', schema: EDIT_REPORT_SCHEMA }
  )
} else {
  log('Skipping beginner-technical-writing pass — style review classified this as a non-teaching post.')
}

let factCheckResult
if (depth === 'thorough') {
  log('Thorough mode: 3 independent read-only fact reviewers, then one agent applies the merged corrections.')

  const reviews = await parallel(
    [1, 2, 3].map((n) => () =>
      agent(
        `Independently re-verify every factual claim in \`${draft.filePath}\` against the research below. This is a READ-ONLY review — do not edit the file. Where you doubt a claim, re-check with fresh Bonsai fetches (\`npx @taurgis/bonsai <url> --format detailed\`) rather than trusting memory.

Research already gathered: ${JSON.stringify(research)}

Check specifically: version numbers, API/class names, Business Manager paths, limits/quotas, dates, and anything that reads as reworded from the earlier prose passes in a way that may have drifted from the source facts. You are reviewer #${n} of 3 — do not assume the others already caught something; check the whole post yourself.

Return suspectedIssues (each: claim, whyDoubtful, and a suggestedFix if you have one) and sourcesRecheckedUrls.`,
        { label: `fact-review-${n}`, phase: 'Verify', model: 'sonnet', schema: FACT_REVIEW_SCHEMA }
      )
    )
  )

  const mergedIssues = reviews.filter(Boolean).flatMap((r) => r.suspectedIssues || [])
  const mergedSources = [...new Set(reviews.filter(Boolean).flatMap((r) => r.sourcesRecheckedUrls || []))]
  log(`Fact reviewers surfaced ${mergedIssues.length} suspected issue(s) across 3 independent passes.`)

  factCheckResult = await agent(
    `Three independent reviewers just re-checked the factual claims in \`${draft.filePath}\` against the research below and surfaced the issues listed. A claim raised by more than one reviewer is corroborated — weigh it accordingly; a claim only one reviewer raised may still be real, so use the original research to judge each one rather than dismissing by vote count alone.

Suspected issues: ${JSON.stringify(mergedIssues)}
Research already gathered: ${JSON.stringify(research)}

For each real issue, correct it directly in the file. For anything you genuinely cannot resolve, leave an inline \`<!-- TODO verify: ... -->\` comment rather than guessing.

Return verifiedClaims (count of claims you evaluated, including ones you confirmed fine), correctionsMade (each naming the wrong claim and the fix), unverifiableClaims, and sourcesRecheckedUrls.`,
    { label: 'fact-check-apply', phase: 'Verify', model: 'sonnet', schema: FACT_CHECK_SCHEMA }
  )
  factCheckResult.sourcesRecheckedUrls = [...new Set([...(factCheckResult.sourcesRecheckedUrls || []), ...mergedSources])]
} else {
  factCheckResult = await agent(
    `Re-verify every factual claim in \`${draft.filePath}\` against the research below, and where you have doubts, re-check with fresh Bonsai fetches (\`npx @taurgis/bonsai <url> --format detailed\`) rather than trusting memory or the earlier draft.

Research already gathered: ${JSON.stringify(research)}

Check specifically: version numbers, API/class names, Business Manager paths, limits/quotas, dates, and anything the earlier editing passes may have reworded in a way that changed its meaning. Correct any mistake directly in the file. For anything you genuinely cannot verify, leave an inline \`<!-- TODO verify: ... -->\` comment rather than guessing.

Return verifiedClaims (count), correctionsMade (each naming the wrong claim and the fix), unverifiableClaims, and sourcesRecheckedUrls.`,
    { label: 'verify-facts', phase: 'Verify', model: 'sonnet', schema: FACT_CHECK_SCHEMA }
  )
}

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
- every image reference has non-empty, descriptive alt text
- all internal links are relative paths — no absolute rhino-inquisitor.com URLs
- any internal link that points to another \`draft: true\` post is wrapped in the \`{{< when-published >}}\` shortcode (see \`docs/publishing/when-published-shortcode.md\`) — a direct link to an unpublished draft fails the deploy's internal-link gate
- body starts headings at \`##\`, fenced code blocks carry a language tag
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
