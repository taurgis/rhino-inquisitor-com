---
name: anti-ai-writing
description: 'Edit sentence-level prose to remove formulaic AI patterns and replace them with direct, specific, human writing. Use when refining markdown posts in src/content/posts/** after the structure and technical claims are already sound.'
license: Forward Proprietary
compatibility: 'Markdown post authoring in src/content/posts/**'
---

# Anti-AI Writing

Use this skill when a sentence sounds generic, padded, or mechanically polished in a way that makes the draft feel generated.

This skill is for clause and sentence level work. If the problem is paragraph flow, topic order, section shape, voice, or a move that recurs across sections, use `human-prose-editing`. This one owns words, clauses, and verbs; that one owns paragraphs and above.

## Goal

Improve prose quality by making sentences more direct, specific, and audience-aware.

The point is better writing, not disguise. Wikipedia's AI Cleanup editors, who review AI text at volume, put it directly: "Please do not merely treat these signs as the problems to be fixed; that could just make detection harder." Fix a sentence because it is worse for the reader, never because it pattern-matches.

## Evidence Tiers

Every rule below is tagged. The tag decides how hard you are allowed to push.

- **[Evidenced]** — a measured difference between LLM and human prose in a corpus study with a disclosed method: peer-reviewed, preprint, or an industry study that publishes its data. Fix these first.
- **[Craft]** — guidance from a named authority: a style guide that predates AI, or an editorial body that reviews AI text at volume (Wikipedia's AI Cleanup project, a model vendor's own style documentation). Apply with judgement.
- **[Taste]** — a house preference for this blog. Suggest, never enforce. If the author wrote it deliberately, it stays.

Anything not in one of these tiers is not a rule. Do not invent new ones mid-edit. A feeling that a sentence "sounds AI" is not a tier: non-expert readers judge that at chance while feeling confident ([Russell et al.](https://arxiv.org/abs/2501.15654)), and LLMs asked to label slop agree with human annotators at κ ≈ 0 ([Shaib et al.](https://arxiv.org/abs/2509.19163)). Name the pattern or leave the sentence alone.

## The Restraint Rule (read before editing)

Carol Fisher Saller's first rule of copyediting is "do no harm", and her test is the one to apply here: "every time you mark on someone else's copy, you should be able to cite an authority in support of that change" ([CMOS Shop Talk](https://cmosshoptalk.com/2015/11/30/editors-corner-4-2/)). Also: "Never, ever edit merely because it sounds better to you without knowing why."

Concretely, in this repo:

- **Keep every claim.** An edit may cut filler, but it keeps every qualification, number, version, name, link, and technical term the original stated. Compare each rewrite with the original before moving on.
- **Use only specifics you have.** A vague phrase becomes concrete only with a fact from the post, the author's notes, or a fetched source. When the sentence needs a fact you do not have, leave it general or flag it for the author (`<!-- TODO author: what was the measured retry count? -->`). A vague true sentence beats a specific false one.
- **Leave quotations, code blocks, inline code, and Mermaid diagrams exactly as they are.** A source's wording is evidence, not copy. If a quote reads badly, change your introduction to it.
- Repeat a technical term rather than rotating synonyms for variety.
- Posts are **British English** and the spelling gate enforces it. Keep the spelling the post already uses.
- If you cannot name the tier and the reason for a change, skip it.

## [Evidenced] Clause-Level Markers

These are the highest-value targets. The first five were measured in parallel corpora of human and LLM text using Douglas Biber's feature set ([Reinhart et al., arXiv 2410.16107](https://arxiv.org/abs/2410.16107)): "LLMs struggle to match human stylistic variation."

1. **Nominalisations — the action hidden inside a noun.** LLM prose buries verbs in nouns at roughly twice the human rate. Federal plain-language guidance gives the fix: write "we manage the program", not "we are responsible for management of the program" ([GSA, avoid hidden verbs](https://github.com/GSA/plainlanguage.gov/blob/main/_pages/guidelines/words/avoid-hidden-verbs.md)).
   - Williams' three exceptions, which you must honour: keep the nominalisation when it refers back to something already said, when it replaces an awkward "the fact that", or when it names a concept the audience already treats as a thing (`deployment`, `cache invalidation`).
2. **Trailing participial clauses.** The largest measured effect in that corpus study, and the "superficial analyses" sign on Wikipedia's list ([Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)). These are the `, highlighting the need for…` / `, ensuring…` / `, allowing teams to…` tails stapled to the end of a sentence. Convert to a finite clause or a new sentence so the action gets a real subject and tense back — or cut the tail when it only asserts significance.
3. **`, which is` / `, which means` appositive tails.** The same defect in a different costume: explanation demoted to an afterthought. Two or three in a post is normal; ten is a habit. Promote the best ones to their own short sentence.
4. **Subject `that`-clauses.** "That the API rejects silently is the problem" → "The API rejects silently, and that is the problem."
5. **Copula avoidance.** LLM prose reaches for `serves as`, `stands as`, `acts as`, `boasts`, `features` where `is` or `has` would do; use of `is`/`are` measurably fell in post-2022 academic writing ([arXiv 2404.08627](https://arxiv.org/abs/2404.08627)). Wikipedia's editors list plain is/has among the signs of *human* writing. Use `is`.
6. **Corrective framing — "not X, it's Y".** "This isn't a caching problem. It's a sequencing problem." The sentence denies a claim nobody made so the real claim can land as a revelation. Measured at 6.3× the human rate "in some models" ([Antislop, arXiv 2510.15061](https://arxiv.org/abs/2510.15061)), named by expert detectors as a structural tell ([Russell et al.](https://arxiv.org/abs/2501.15654)), and still growing: corrective framing became more common across successive GPT versions, and Claude Opus 5 used the frame "less like a _ and more like" 125 times against once in a matched human corpus ([Graphite](https://graphite.io/five-percent/research/ai-tells)). State the positive claim. Keep the contrast when it corrects a misconception the reader plausibly holds, and say whose: "The docs suggest a timeout; the log shows a lock."
7. **Self-narrating adverbs.** genuinely, honestly, frankly, plainly, candidly. "is genuinely" appeared 1,021 times in Claude Opus 5 articles against 4 in the matched human set ([Graphite](https://graphite.io/five-percent/research/ai-tells); industry corpus, one prompt). If the sentence is honest, it needs no label. Cut the adverb.
8. **Document metadiscourse.** LLM prose over-signposts: it narrates the document instead of advancing the argument ([Jiang & Hyland](https://research-portal.uea.ac.uk/en/publications/rhetorical-distinctions-comparing-metadiscourse-in-essays-by-chat)). Cut talk *about the text* ("This section discusses…", "Worth saying plainly…", "Here's the part I want to be straight about…"). Keep signals about the *argument* ("The cause turned out to be different", "Two things follow").
9. **Word clusters, not word lists.** The measurable lexical signal is *co-occurrence* — `underscore` with `pivotal` went from 0.03 to 0.45 correlation in two years ([Thelwall, arXiv 2509.09596](https://arxiv.org/abs/2509.09596)) — and any list decays once writers and model vendors learn it: `delve` "dropped off sharply in 2025" (Wikipedia), and 55–72% of a model's tells change between versions ([Graphite](https://graphite.io/five-percent/research/ai-tells-opus-5-5-update)). So look for two or three marker words in one post — current examples include `genuinely`, `showcase`, `highlighting`, `enhance`, `pivotal`, `robust`, `seamless`, `landscape` — and treat that cluster as the finding. A single instance is a choice.

## [Craft] Sentence-Level Moves

- **Mannered prose.** Metaphor where a literal phrase exists. Anthropic's own style guidance for its models defines it: "Instead of 'a parameter worth varying,' the mannered writer produces 'a dial worth turning.' Instead of 'this point still matters,' they write 'this point earns its keep'" ([Claude prompting docs](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1)). Its fix: "When a literal phrase is available, use it." Same family: *load-bearing*, *does the heavy lifting*, *quietly* as an intensifier, *the real [X]*.
- **Significance inflation and vague attribution.** "Marks a pivotal moment", "plays a vital role", "experts agree", "industry observers note", "widely regarded as" (Wikipedia: undue emphasis on significance; vague attributions). Keep the fact and drop the significance. Name the source and what it said, or cut the attribution.
- **Draft and chat residue.** Text that describes its own edit history ("This section has been updated to…", "Corrected: …", "As noted in the fact-check…"), offers to help, or disclaims a knowledge cutoff. Describe the thing as it is now. This matters in this repo because fact-check and editing agents write into the same file.
- **Throat-clearing openings.** "It is important to note that", "The reason for this is that". Start the sentence later.
- **Empty praise adjectives** where a behaviour would be more specific: robust, powerful, seamless, comprehensive. Replace with the behaviour — if you know it (see the restraint rule).
- **Weak verb phrases.** "conduct an analysis" → "analyse". "is responsible for management of" → "manages".
- **Prepositional clutter** that stacks *of / in / for / through* until the subject and verb drift apart.
- **Abstract nouns** — solution, functionality, capability, process, approach — where a real object exists. Name the file, API, script, or behaviour.

`In order to` → `to` and `the fact that` are concision edits, not AI tells. Wikipedia's editors list both among the signs of *human* writing. Fix one when it clutters a sentence; never count them as evidence.

## When an Agent Applies This Skill

LLM editors have measured failure modes of their own. If you are a model running this skill, these are your guardrails:

- **Swapping one stock phrase for another.** LLM editors "sometimes replace clichés with other clichés" ([Chakrabarty et al., CHI 2025](https://arxiv.org/abs/2409.14509)). Fix the sentence shape, not the word: ask what the sentence claims, then write that claim. Before finishing, check your new text for the patterns above.
- **Drifting meaning.** Even when told to make only grammar edits, LLMs "still change the text in a way that significantly alters its semantic meaning" ([White et al., arXiv 2603.18161](https://arxiv.org/abs/2603.18161)). Propose the smallest edit that fixes the named pattern, and re-read every changed sentence against the original.
- **Flattening the voice.** LLM revision moves every author the same way: fewer first-person pronouns and function words, longer words, explicit causal reasoning compressed into abstraction. Telling the model to preserve voice cut the effect by only 32% ([van Nuenen, arXiv 2604.22142](https://arxiv.org/abs/2604.22142)). Keep the author's contractions, first person, `because`/`so` links, and plain short words. An edit that removes any of them needs its own reason.
- **Rewriting what was fine.** Detection is rarely the problem; the rewrite is ([Chakrabarty et al.](https://arxiv.org/abs/2409.14509)). Returning no change for a clean sentence is a correct result.

## Rules Deliberately Dropped

Earlier versions of this skill enforced these. The evidence does not support them, and enforcing them made prose worse.

- **Em-dash counts.** Merriam-Webster: em dashes are "used in all kinds of writing, including the most formal", and the choice "is really a matter of personal preference" ([M-W](https://www.merriam-webster.com/grammar/em-dash-en-dash-how-to-use)). CMOS calls it "a matter of taste". The tell is also obsolete: by 2026 the latest GPT and Gemini models use em dashes below the human rate and Opus 5 at about the human rate ([Graphite](https://graphite.io/five-percent/research/ai-tells)). **[Taste]** at most: if a dash clause is a whole sentence, consider making it one — for the rhythm, not for the count.
- **Banning `moreover` / `furthermore` / `however` on sight.** Pinker lists "the deft use of coherence connectors such as nonetheless and moreover" as good writing, and federal guidance recommends transition words because readers "find them helpful" ([GSA](https://github.com/GSA/plainlanguage.gov/blob/main/_pages/guidelines/organize/use-transition-words.md)). Wikipedia's editors list transition words in isolation as an *ineffective* indicator. Cut a connective only when the logical relation it claims is absent.
- **Stripping hedges by default.** ChatGPT essays carried *fewer* hedges than student ones, and Wikipedia lists hedges and intensifiers (`very`, `perhaps`, `tends to`) among the signs of human writing. Pinker's carve-out governs: "their hedging is a choice, not a tic." Target only *unmotivated* hedges — stacked qualifiers with no evidential basis. "I think", "as far as I can tell", and "I have no numbers on this" stay.
- **Preferring the active voice as a blanket rule.** Pullum: "the specific stylistic charges leveled against the passive are entirely baseless" ([paper](https://pullum.ppls.ed.ac.uk/passive_loathing.html)). Gopen and Swan show the passive is *correct* when the sentence continues an existing story. GPT-4o uses agentless passive at about half the human rate, so reflexive anti-passive editing pushes a draft *toward* the machine profile.
- **Fearing triads.** Tricolon is a named classical virtue. The fault is a triad "where most people would not bother" (Wikipedia) — every list padded or trimmed to three. Give as many items as there are.
- **Citing a detector score as evidence.** OpenAI withdrew its own classifier at 26% true-positive and 9% false-positive ([OpenAI](https://openai.com/index/new-ai-classifier-for-indicating-ai-written-text/)); an evaluation of 14 tools put all of them under 80% accuracy ([Weber-Wulff et al.](https://link.springer.com/article/10.1007/s40979-023-00146-z)); Vanderbilt disabled Turnitin's detector ([statement](https://www.vanderbilt.edu/brightspace/2023/08/16/guidance-on-ai-detection-and-why-were-disabling-turnitins-ai-detector/)). Detectors also false-flag non-native English writers. Edit on quality grounds only.

## A Diagnostic Pass You Can Run

Counting beats intuition, and it keeps this skill honest about which rules are habits. From the repo root:

```bash
python3 - src/content/posts/<slug>/index.md <<'PY'
import io,re,sys
s=io.open(sys.argv[1],encoding='utf-8').read()
b=re.sub(r'```.*?```','',s.split('---',2)[2],flags=re.S)   # strip code fences
b=re.sub(r'`[^`\n]*`','',b)                                 # strip inline code
b=re.sub(r'^>.*$','',b,flags=re.M)                          # strip callouts/quotes
pats={
 'participial tails': r", (highlighting|showcasing|allowing|enabling|ensuring|underscoring|reflecting|making it)\b",
 'which-tails':       r", which (is|are|means|tells|turns|permits)\b",
 'nominalisation-ish':r"\b\w+(tion|ment|ance|ence|ity|ness) of\b",
 'copula avoidance':  r"\b(serves as|acts as|stands as|functions as|boasts)\b",
 'corrective framing':r"(?i)(\b(isn't|is not|aren't|wasn't|doesn't)\b[^.]{0,60}\.\s+(it|they|this|that)('s| is| are| was)\b|\bnot (just|simply|merely)\b|\bless like an? .{1,40}more like\b)",
 'self-narrating adv':r"(?i)\b(genuinely|plainly|frankly|candidly|honestly)\b",
 'metadiscourse':     r"(?i)\b(this (section|post|article) (will |)(discuss|cover|explain)|worth (saying|noting)|let's (dive|explore))",
 'mannered':          r"(?i)\b(load-bearing|earns? its (keep|place)|heavy lifting|quietly|worth turning)\b",
 'vague attribution': r"(?i)\b(experts|observers|industry reports|many developers) (say|agree|argue|note|believe)\b",
 'draft residue':     r"(?i)\b(this (section|post|paragraph) (has been|was) (updated|corrected|revised)|as of my last|i hope this helps)\b",
 'marker cluster':    r"(?i)\b(delve|underscore|showcase|pivotal|intricate|seamless|testament|landscape|realm|tapestry)\w*\b",
}
for k,p in pats.items(): print(f"{len(re.findall(p,b)):>4}  {k}")
PY
```

Read the counts as a prompt to look, never as a verdict. A high count on one pattern in a 3,000-word post is a habit; one instance is a choice.

## Rewrite Method

1. Find the actual subject of the sentence.
2. Move that subject closer to the front.
3. Articulate the action of the clause in its verb — not in a noun, not in a participle.
4. Replace abstract nouns with the real object, file, API, or behaviour — one the post already names or a source confirms.
5. Reduce prepositional clutter until the action is easy to follow.
6. Delete qualifiers only when they express no real uncertainty.
7. Keep transitions that mark a genuine contrast, cause, or sequence.
8. Compare with the original: every claim kept, no fact added, the author's first person and contractions intact.
9. Read it aloud once. If the cadence sounds canned, simplify again.

## When To Stop

Over-editing is a real failure mode with its own literature: authors degrading clear prose to dodge false positives ([Springer](https://link.springer.com/article/10.1007/s10439-026-04242-2)), and comprehension peaking around 16–20 words per sentence ([PMC9955962](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9955962/)). Stop when:

- Every remaining flagged pattern is a deliberate choice you can defend in one sentence.
- The last pass produced only [Taste] changes.
- You are rewriting sentences that were already clear.

If a pass leaves a section shorter but less informative, revert it. Deletion is not improvement. When the defect is a *missing* explanation rather than an excess one, stop and switch to `human-prose-editing`, which owns additive repair.

## Prefer These Rewrites

| Avoid | Prefer |
| --- | --- |
| It is important to note that hooks run before this step | Hooks run before this step |
| SFCC provides a robust way to handle this | This hook lets SFCC call custom logic before the basket is recalculated |
| The reason for this is that the cache is shared | This happens because the cache is shared |
| The code performs validation of the request | The code validates the request |
| The gate failed, highlighting the need for a version check | The gate failed. A stale nested dependency was the cause |
| The directive serves as a signal to crawlers | The directive tells crawlers what they may do |
| This isn't a WebDAV problem. It's a timing problem. | The upload failed because two jobs wrote the same path at once |
| The cache key is the load-bearing decision here | The cache key decides whether shoppers see each other's baskets |
| This is genuinely the hardest part | This is the hardest part |
| Experts agree headless is the future | `<!-- TODO author: source? -->` or cut |

The right column assumes the post already contains the fact it states. Without it, keep the sentence general.

## Technical Post Rules

- Repeat the correct technical term when precision matters ([Google technical writing](https://developers.google.com/tech-writing/one/words)).
- Keep one claim per sentence when introducing a new concept.
- Replace a broad adjective with the concrete effect on storefront behaviour, Business Manager behaviour, or developer workflow.
- If punctuation is doing work a sharper verb should do, rewrite the clause instead of adding another mark.

## Best Practice References

- [references/REFERENCE.md](references/REFERENCE.md) — sources, with what each one actually supports and what it does not.
- [examples/EXAMPLES.md](examples/EXAMPLES.md) — sentence-level rewrite examples.

## When To Use Alongside Other Skills

- `beginner-technical-writing` for first-pass explanations.
- This skill for clause and sentence cleanup.
- `human-prose-editing` for paragraph flow, topic order, voice, anything the draft is *missing*, and any move that recurs across sections (the same pivot or closer in every chapter is a document problem).
- If you find yourself rewriting three adjacent sentences for rhythm, switch skills.
