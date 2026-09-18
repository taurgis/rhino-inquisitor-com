---
name: anti-ai-writing
description: 'Edit sentence-level prose to remove formulaic AI patterns and replace them with direct, specific, human writing. Use when refining markdown posts in src/content/posts/** after the structure and technical claims are already sound.'
license: Forward Proprietary
compatibility: 'Markdown post authoring in src/content/posts/**'
---

# Anti-AI Writing

Use this skill when a sentence sounds generic, padded, or mechanically polished in a way that makes the draft feel generated.

This skill is for clause and sentence level work. If the problem is paragraph flow, topic order, section shape, or voice, use `human-prose-editing`. The two skills no longer share a signal list: this one owns words, clauses, and verbs; that one owns paragraphs and above.

## Goal

Improve prose quality by making sentences more direct, specific, and audience-aware.

Do not use this skill to game detectors or add fake human quirks. The point is better writing, not disguise.

## Evidence Tiers

Every rule below is tagged. The tag decides how hard you are allowed to push.

- **[Evidenced]** — a measured difference between LLM and human prose in published research. Fix these first; they are the rules worth being firm about.
- **[Craft]** — long-standing style guidance from a named authority, predating AI. Apply with judgement.
- **[Taste]** — a house preference for this blog. Suggest, never enforce. If the author wrote it deliberately, it stays.

Anything not in one of these tiers is not a rule. Do not invent new ones mid-edit.

## The Restraint Rule (read before editing)

Carol Fisher Saller's first rule of copyediting is "do no harm", and her test is the one to apply here: "every time you mark on someone else's copy, you should be able to cite an authority in support of that change" ([CMOS Shop Talk](https://cmosshoptalk.com/2015/11/30/editors-corner-4-2/)). Also: "Never, ever edit merely because it sounds better to you without knowing why."

Concretely, in this repo:

- **Never edit inside a quotation, a code block, or a Mermaid diagram.** A source's wording is evidence, not copy. If a quote reads badly, change your introduction to it, not the quote.
- Never change a technical term to a synonym for variety.
- Posts are **British English** and the spelling gate enforces it. Do not Americanise spelling while line editing.
- If you cannot name the tier and the reason for a change, skip it.

## [Evidenced] Clause-Level Markers

These are the highest-value targets, measured in parallel corpora of human and LLM text using Douglas Biber's feature set ([Reinhart et al., arXiv 2410.16107](https://arxiv.org/abs/2410.16107)). The paper's own summary: "LLMs struggle to match human stylistic variation."

1. **Nominalisations — the action hidden inside a noun.** The single place where research and every style authority agree. LLM prose buries verbs in nouns at roughly twice the human rate. Federal plain-language guidance gives the fix directly: write "we manage the program", not "we are responsible for management of the program" ([GSA, avoid hidden verbs](https://github.com/GSA/plainlanguage.gov/blob/main/_pages/guidelines/words/avoid-hidden-verbs.md)).
   - Williams' three exceptions, which you must honour: keep the nominalisation when it refers back to something already said, when it replaces an awkward "the fact that", or when it names a concept the audience already treats as a thing (`deployment`, `cache invalidation`).
2. **Trailing participial clauses.** The largest measured effect in that corpus study. These are the `, highlighting the need for…` / `, showcasing…` / `, allowing teams to…` tails stapled to the end of a sentence. Convert to a finite clause or a new sentence: the action gets a real subject and tense back.
3. **`, which is` / `, which means` appositive tails.** The same defect in a different costume: explanation demoted to an afterthought. Two or three in a post is normal; ten is a tic. Promote the best ones to their own short sentence.
4. **Subject `that`-clauses.** "That the API rejects silently is the problem" → "The API rejects silently, and that is the problem."
5. **Copula avoidance.** LLM prose reaches for `serves as`, `stands as a testament to`, `acts as` where `is` would do; use of `is`/`are` measurably fell in post-2022 academic writing ([arXiv 2404.08627](https://arxiv.org/abs/2404.08627)). Use `is`.
6. **Document metadiscourse.** LLM prose over-signposts: it narrates the document instead of advancing the argument ([Jiang & Hyland](https://research-portal.uea.ac.uk/en/publications/rhetorical-distinctions-comparing-metadiscourse-in-essays-by-chat)). Cut talk *about the text* ("This section discusses…", "Worth saying plainly…", "Here's the part I want to be straight about…"). Keep signals about the *argument* ("The cause turned out to be different", "Two things follow").
7. **Word clusters, not word lists.** Individual flagged words are a trap: the measurable signal is *co-occurrence* — `underscore` with `pivotal` went from 0.03 to 0.45 correlation in two years ([Thelwall, arXiv 2509.09596](https://arxiv.org/abs/2509.09596)) — and any published list decays once writers learn it, as `delve` did ([arXiv 2502.09606](https://arxiv.org/abs/2502.09606)). So do not keep a banned-word list in your head. Look for two or three of `delve`, `underscore`, `showcase`, `pivotal`, `intricate`, `robust`, `seamless`, `testament`, `landscape`, `realm` in one post, and treat that cluster as the finding.

## [Craft] Sentence-Level Moves

- Throat-clearing openings: "It is important to note that", "In order to", "The reason for this is that". Start the sentence later.
- Empty praise adjectives where a behaviour would be more specific: robust, powerful, seamless, comprehensive, innovative.
- Weak verb phrases: "conduct an analysis" → "analyse". "Is responsible for management of" → "manages".
- Prepositional clutter that stacks *of / in / for / through* until the subject and verb drift apart.
- Abstract nouns — solution, functionality, capability, process, approach — where a real object exists. Name the file, API, script, or behaviour.
- Self-narrating adverbs: genuinely, plainly, frankly, candidly, honestly. If the sentence is honest, it does not need the label. This one earns its place: it is the metadiscourse marker above, wearing an adverb.

## Rules Deliberately Dropped

Earlier versions of this skill enforced these. The evidence does not support them, and enforcing them made prose worse. Do not reintroduce them.

- **Do not count em dashes.** Merriam-Webster: em dashes are "used in all kinds of writing, including the most formal", and the choice "is really a matter of personal preference" ([M-W](https://www.merriam-webster.com/grammar/em-dash-en-dash-how-to-use)). CMOS calls it "a matter of taste". The one dissent is the Guardian's "use sparingly", on rhythm grounds ([Guardian style guide](https://www.theguardian.com/guardian-observer-style-guide-d)). Per-document density has no research behind it; the frequency finding is explicitly "a population-level indicator, not a per-paper detector". **[Taste]** at most: if a dash clause is a whole sentence, consider making it one — for the rhythm, not for the count.
- **Do not ban `moreover` / `furthermore` / `however` on sight.** Pinker lists "the deft use of coherence connectors such as nonetheless and moreover" as good writing, and federal guidance actively recommends transition words because readers "find them helpful" ([GSA](https://github.com/GSA/plainlanguage.gov/blob/main/_pages/guidelines/organize/use-transition-words.md)). Cut a connective only when the logical relation it claims is absent.
- **Do not strip hedges by default.** Contrary to folklore, ChatGPT essays carried *fewer* hedges than student ones. Pinker's carve-out governs: "a responsible writer should insert a qualifier… their hedging is a choice, not a tic." Target only *unmotivated* hedges — stacked qualifiers with no evidential basis. "I think", "as far as I can tell", and "I have no numbers on this" are load-bearing on a blog that shows its work, and they stay.
- **Do not prefer the active voice as a blanket rule.** Pullum: "the specific stylistic charges leveled against the passive are entirely baseless" ([paper](https://pullum.ppls.ed.ac.uk/passive_loathing.html)). Gopen and Swan show the passive is *correct* when the sentence continues an existing story. And GPT-4o uses agentless passive at about half the human rate, so reflexive anti-passive editing pushes a draft *toward* the machine profile.
- **Do not fear triads.** Tricolon is a named classical virtue. The measured fault is *unmotivated* parallelism used as default filler, not parallelism itself.
- **Never cite a detector score as evidence.** OpenAI withdrew its own classifier at 26% true-positive and 9% false-positive ([OpenAI](https://openai.com/index/new-ai-classifier-for-indicating-ai-written-text/)); an evaluation of 14 tools put all of them under 80% accuracy ([Weber-Wulff et al.](https://link.springer.com/article/10.1007/s40979-023-00146-z)); Vanderbilt disabled Turnitin's detector ([statement](https://www.vanderbilt.edu/brightspace/2023/08/16/guidance-on-ai-detection-and-why-were-disabling-turnitins-ai-detector/)). Detectors also false-flag non-native English writers. Edit on quality grounds only.

## A Diagnostic Pass You Can Run

Counting beats intuition, and it keeps this skill honest about which rules are habits. From the repo root:

```bash
python3 - <<'PY'
import io,re,sys
s=io.open(sys.argv[1] if len(sys.argv)>1 else 'index.md',encoding='utf-8').read()
b=re.sub(r'```.*?```','',s.split('---',2)[2],flags=re.S)   # strip code fences
b=re.sub(r'^> .*$','',b,flags=re.M)                         # strip callouts/quotes
pats={
 'participial tails': r", (highlighting|showcasing|allowing|enabling|underscoring|reflecting|making it)\b",
 'which-tails':       r", which (is|are|means|tells|turns|permits)\b",
 'nominalisation-ish':r"\b\w+(tion|ment|ance|ence|ity|ness) of\b",
 'copula avoidance':  r"\b(serves as|acts as|stands as|functions as)\b",
 'metadiscourse':     r"(?i)\b(this (section|post|article) (will |)(discuss|cover|explain)|worth (saying|noting)|let's (dive|explore))",
 'self-narrating adv':r"(?i)\b(genuinely|plainly|frankly|candidly|honestly)\b",
 'marker cluster':    r"(?i)\b(delve|underscore|showcase|pivotal|intricate|seamless|testament|landscape|realm)\w*\b",
}
for k,p in pats.items(): print(f"{len(re.findall(p,b)):>4}  {k}")
PY
```

Read the counts as a prompt to look, never as a verdict. A high count on one pattern in a 3,000-word post is a habit; one instance is a choice.

## Rewrite Method

1. Find the actual subject of the sentence.
2. Move that subject closer to the front.
3. Articulate the action of the clause in its verb — not in a noun, not in a participle.
4. Replace abstract nouns with the real object, file, API, or behaviour.
5. Reduce prepositional clutter until the action is easy to follow.
6. Delete qualifiers only when they express no real uncertainty.
7. Keep transitions that mark a genuine contrast, cause, or sequence.
8. Read it aloud once. If the cadence sounds canned, simplify again.

## When To Stop

Over-editing is a real failure mode with its own literature: authors degrading clear prose to dodge false positives ([Springer](https://link.springer.com/article/10.1007/s10439-026-04242-2)), and comprehension peaking around 16–20 words per sentence ([PMC9955962](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9955962/)). Stop when:

- Every remaining flagged pattern is a deliberate choice you can defend in one sentence.
- The last pass produced only [Taste] changes.
- You are rewriting sentences that were already clear.

If a pass leaves a section shorter but less informative, revert it. Deletion is not improvement. When the defect is a *missing* explanation rather than an excess one, stop and switch to `human-prose-editing`, which owns additive repair.

## Prefer These Rewrites

| Avoid | Prefer |
| --- | --- |
| In order to configure a cartridge | To configure a cartridge |
| It is important to note that hooks run before this step | Hooks run before this step |
| SFCC provides a robust way to handle this | This hook lets SFCC call custom logic before the basket is recalculated |
| The reason for this is that the cache is shared | This happens because the cache is shared |
| The code performs validation of the request | The code validates the request |
| The gate failed, highlighting the need for a version check | The gate failed. A stale nested dependency was the cause |
| The directive serves as a signal to crawlers | The directive tells crawlers what they may do |
| There is a need for careful naming here | Name this carefully |

## Technical Post Rules

- Repeat the correct technical term when precision matters. Never rotate synonyms for variety ([Google technical writing](https://developers.google.com/tech-writing/one/words)).
- Keep one claim per sentence when introducing a new concept.
- Replace a broad adjective with the concrete effect on storefront behaviour, Business Manager behaviour, or developer workflow.
- If punctuation is doing work a sharper verb should do, rewrite the clause instead of adding another mark.

## What Not To Do

- Do not inject mistakes, slang, or awkward phrasing to look more human.
- Do not add personal asides that distract from the explanation.
- Do not swap precise terms for looser synonyms.
- Do not keep filler because it sounds polished.
- Do not edit a quotation, ever.

## Best Practice References

- [references/REFERENCE.md](references/REFERENCE.md) — sources, with what each one actually supports.
- [examples/EXAMPLES.md](examples/EXAMPLES.md) — sentence-level rewrite examples.

## When To Use Alongside Other Skills

- `beginner-technical-writing` for first-pass explanations.
- This skill for clause and sentence cleanup.
- `human-prose-editing` for paragraph flow, topic order, voice, and anything the draft is *missing*.
- If you find yourself rewriting three adjacent sentences for rhythm, switch skills.
