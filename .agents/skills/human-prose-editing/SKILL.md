---
name: human-prose-editing
description: 'Rewrite technical prose so it sounds specific, deliberate, and human instead of generic, formulaic, or AI-generated copy. Use when revising paragraph-level flow or voice in markdown posts under src/content/posts/**.'
license: Forward Proprietary
compatibility: 'Markdown post authoring in src/content/posts/**'
---

# Human Prose Editing

Use this skill when a draft is technically acceptable but reads like generated text, a paraphrase of generated text, or an over-smoothed editorial pass.

This skill owns paragraphs and above: topic order, cohesion, section shape, voice, and whatever the draft is *missing*. For clauses, verbs, and word choice, use `anti-ai-writing`. The two skills do not share a signal list.

## Primary Goal

Make the prose feel written by a thoughtful engineer who knows the subject and respects the reader's time.

## The Biggest Thing This Skill Does

**Most prose that reads as generated is missing something, not carrying something extra.** A delete-only checklist cannot find a missing causal link, because the defect is an absence.

Gopen and Swan reached this conclusion directly: of their four worked examples, only one could be fixed by rearrangement. "In all the other examples, revision revealed existing conceptual gaps… Filling the gaps required the addition of extra material" ([The Science of Scientific Writing](https://www.americanscientist.org/blog/the-long-view/the-science-of-scientific-writing)). One of their examples needed two entirely new sentences supplying logic the author had assumed was obvious.

So run the additive pass **first**, before any cutting:

1. Ask of each section: what does the reader have to already believe for this to land? Is that on the page?
2. Where the draft asserts a cause, is the mechanism stated, or only implied?
3. Where the draft reports a number, is the reader told what it means?
4. Where you wrote "obviously", "of course", or "it turns out", you have probably skipped a step. Williams' diagnostic: ask the writer for the point, and if the answer is "it's obvious", the point is missing from the page.

The additive pass has two kinds of gap, and they need different fills:

- **Missing logic** — an unstated mechanism, a number with no meaning attached, a step the argument skips. Fill it from what the post, its sources, or a fetched document already establish.
- **Missing specifics** — a real example, an incident, a measurement, a first-person judgement. These come from the author's notes or a cited source, never from the editor. Flag the gap (`<!-- TODO author: an example of a deploy that hit this? -->`) instead of writing one. When professional writers edited LLM prose, the need to add specificity did not shrink as the LLM paragraphs got better, and LLM editors were "mostly ineffective" at supplying it ([Chakrabarty et al., CHI 2025](https://arxiv.org/abs/2409.14509)); an editor that invents the example produces a confident falsehood in the author's voice.

The inverse defect is real too. Redundant exposition — a sentence that explains what the previous one already showed, often as a `[point], [explanation of the point]` tail — was 18% of the writers' edits in the same study. Adding the missing step and cutting the restated one are both this skill's job.

Klinkenborg: "It's true that the simplest revision is deletion. But there's often a fine sentence lurking within a bad sentence… Don't try to fix an existing sentence with minimal effort, without reimagining it" ([Craft Literary](https://www.craftliterary.com/2017/09/26/several-short-klinkenborg/)).

## Cohesion Mechanics (the checkable part)

This is the most teachable material in the skill, and the part to reach for when a paragraph "flows" but does not land.

**Topic and stress positions** ([Gopen & Swan](https://www.americanscientist.org/blog/the-long-view/the-science-of-scientific-writing)):

- Put **old information that links backward** in the topic position, at the start of the sentence.
- Put the **new information you want emphasised** in the stress position, at the point of syntactic closure — usually just before a full stop, colon, or semicolon.
- Follow a subject promptly with its verb.
- Put the person or thing whose story it is first.
- Provide context before asking the reader to consider anything new.

**The diagnostic, which is theirs and not a heuristic:** extract the topic position of every sentence in a paragraph into a list. If most entries are appearing for the first time, the paragraph is broken regardless of how smooth it sounds.

**Their length test, which replaces any word count:** "A sentence is too long when it has more viable candidates for stress positions than there are stress positions available." A semicolon or colon creates a second stress position, which is what legitimises a genuinely long sentence.

**Topic strings and thematic strings** (Williams, *Style: Toward Clarity and Grace*, [chapter scan](https://marcuse.faculty.history.ucsb.edu/classes/204writingworkshop/pdfs/Williams1995CoherenceConcisionOCR.pdf)):

- A paragraph needs a consistent **topic string** (the subjects of its sentences) *and* a **thematic string** (a set of conceptually related words running through it — related, not repeated).
- Every section needs one **POINT sentence** that exists on the page. Williams places it at the end of the opening issue, and explicitly rejects the handbook rule that a paragraph must open with a topic sentence. Either position is defensible; the point being absent is not.
- Readers remember the **ending first, the beginning second, the middle least** ([Duke WRP](https://wrp.duke.edu/sites/twp.duke.edu/files/documents/updated-Cohesion-and-Coherence-Handout-Feb2023.pdf)). Put the sentence the section depends on accordingly.
- Cohesion is not coherence. Prose can link perfectly sentence to sentence and still be about nothing; the Duke handout demonstrates it with a passage that slides from lecture notes to poodles to birdseed.

Williams' line that matters most for this blog: "Since we ordinarily write for readers who know much less than we do about a subject, it is always prudent to underestimate a reader's knowledge and make themes explicit."

## What The Research Actually Supports

Tag findings honestly, the same way `anti-ai-writing` does.

**[Evidenced]**

- **Uniform distribution of rhetorical devices.** Human experts *cluster* their devices at argumentative stress points; LLM text spreads them evenly across the document. Measured as a distribution-evenness score in [arXiv 2604.19768](https://arxiv.org/abs/2604.19768). Actionable: put your sharpest turn of phrase where the argument turns, and leave the connective tissue plain. Even excellence is a marker when it is evenly spread.
- **Missing reader engagement.** LLM prose carries fewer rhetorical questions and personal asides than human writing — measured in essays ([Jiang & Hyland](https://ueaeprints.uea.ac.uk/id/eprint/97952/)) and again in expert prose. This makes engagement an *additive* fix: one real question, one first-person judgement, one admission of uncertainty per section is corrective, not decoration. The judgement and the uncertainty must be the author's — taken from their notes or already in the draft, never composed for them.
- **Moves that recur across sections.** Corrective framing ("this isn't A, it's B") is measured at 6.3× the human rate in some models ([Antislop](https://arxiv.org/abs/2510.15061)) and named by expert detectors as a structural tell ([Russell et al.](https://arxiv.org/abs/2501.15654)). One instance is a sentence problem for `anti-ai-writing`. The same pivot, the same closing verdict, or the same opener in every section is a document problem, and it is yours: keep the instance that does real work and rewrite the others.
- **Structural reuse across documents.** LLMs reuse discourse structures between posts even when the content differs ([QUDsim, arXiv 2504.09373](https://arxiv.org/abs/2504.09373)). So audit **several posts side by side**, not one paragraph in isolation. If three posts open with a scene, pivot at the same point, and close on a caution, the template is the problem even though each post reads well alone.

**[Craft]**

- Sentence-length variation as prosody. Gary Provost's demonstration passage is the canonical case ([passage](https://www.aerogrammestudio.com/2014/08/05/this-sentence-has-five-words/)). Note honestly that **no major style guide prescribes variance as a goal**; Google gives only negative guidance (avoid choppy, avoid long-winded, do not open consecutive sentences identically) plus a read-aloud test ([Google tone](https://developers.google.com/style/tone)).
- Every paragraph answers what, why, and how ([Google](https://developers.google.com/tech-writing/one/paragraphs)).
- Open a document with scope, assumed prior knowledge, and explicit exclusions ([Google](https://developers.google.com/tech-writing/two/large-docs)).
- Audience gap as arithmetic: what the reader needs to know minus what they already know ([Google](https://developers.google.com/tech-writing/one/audience)).
- A worked example after every complex concept ([digital.gov](https://digital.gov/guides/plain-language/writing/style)).
- Clark's tools, especially "get the name of the dog", the ladder of abstraction, and strong words at the beginning and end ([Poynter](https://www.poynter.org/reporting-editing/2006/fifty-writing-tools-quick-list/)).

**Dropped — do not reintroduce**

- **"Burstiness" and "perplexity" as editorial terms.** Both were imported from detector marketing and neither means what this skill used to claim. Burstiness' technical origin is word *recurrence intervals*, not sentence-length variance, and GPTZero — whose tool popularised it — states "as of autumn 2023, GPTZero no longer uses perplexity and burstiness" ([GPTZero](https://gptzero.me/news/perplexity-and-burstiness-what-is-it/)). That same page still calls burstiness "a key factor unique to GPTZero", so it contradicts itself; treat it as marketing, not method. No peer-reviewed work validates sentence-length variance as a human/LLM signal. Keep varying rhythm because it reads better, and say that is why.
- **Detector scores as a target.** See the list in `anti-ai-writing`. Editing to move a score is editing toward a broken instrument.
- **Counting em dashes per paragraph.** Owned and dropped in `anti-ai-writing`; do not re-add it here as a "structure" rule.

## Signals Worth Investigating

- A paragraph whose sentences all begin with a first-time subject (run the topic-position list).
- Three or more consecutive sentences on the same scaffold.
- A section that restates its own opening at the end and calls it a conclusion.
- Sections of suspiciously equal length, each with a tidy thesis and a tidy moral.
- Prose that is evenly good — no plain stretches, no peaks.
- Paragraphs that assert consequence without stating mechanism.
- Abstract nouns where a real object exists; hand these to `anti-ai-writing`.
- The same contrast formula, closer, or opener in several sections (see "Moves that recur across sections" above).

## Paragraph-Level Method

1. Identify the one point the paragraph makes, and confirm a sentence on the page says it.
2. Add what is missing: the mechanism, the stake, the number's meaning.
3. Cut sentences that only restate the point.
4. Fix the topic positions so each sentence starts from something the reader already has.
5. Move the sentence you most want remembered to the end.
6. Check rhythm last. If every sentence lands the same way, rewrite one.

## Thomas Style Cues

Sampled from the author's published posts. Prefer this posture:

- Open important sections with a concrete scenario, tension point, or sharp question.
- State the operational stake early: what breaks, what slows down, what gets blocked, what decision the team faces.
- Mix a short verdict sentence with longer explanatory ones.
- Keep metaphor rare and anchored to the technical point.
- Name the tradeoff instead of pretending a pattern is universally good.
- Keep first-person uncertainty. "I have no numbers on this" is a feature of this blog, not a hedge to strip.
- End on implication, caution, or next action rather than a neat recap.

Do not apply these mechanically. One rhetorical question per section helps; one per paragraph is its own template.

## First-Person Technical Narrative

This blog runs a lot of "here is the week I got this wrong" posts. What makes the form land, from the practitioners who set the conventions:

- Give timestamps a stated timezone on every state change, and express impact as a number rather than a duration ([Cloudflare](https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/)).
- Name two or more contributing conditions rather than one root cause: "getting to a single root cause, while satisfying, may obscure the reality" (same source).
- Ask **how**, not why, or the narrative flattens into blame ([Allspaw](https://www.kitchensoap.com/2014/11/14/the-infinite-hows-or-the-dangers-of-the-five-whys/)).
- No animated phrasing and no person in the causal position ([SRE Workbook](https://sre.google/workbook/postmortem-culture/)); the "what went well / what went wrong / where we got lucky" split is a good section skeleton ([SRE book](https://sre.google/sre-book/example-postmortem/)).
- Print the actual artifact — the config diff, the regex, the error string.
- Label a mistake as a mistake where you introduce it, and give any claim the reader would otherwise take on faith a check they can run ([Evans](https://jvns.ca/blog/confusing-explanations/)).
- Over-supply examples; they "pin ideas down" ([Luu](https://danluu.com/writing-non-advice/)).

## Voice Preservation

A defensible edit can still erase the author. ACES demonstrates it: "As far as I'm concerned, there are no true human couch potatoes" edited to "One could say that…" is grammatical, preserves the meaning, and loses the writer ([ACES](https://aceseditors.org/news/2019/three-steps-to-protecting-the-authors-voice)).

Saller's warning applies to structure as much as to sentences: "Repetition, alliteration, long sentences, comma splices — almost any writing foible that we tend to see as problematic can work brilliantly in the right place" ([CMOS Shop Talk](https://cmosshoptalk.com/2019/09/17/do-you-overstep-when-editing-fiction-three-easy-cures/)).

LLM editors erase voice in a measurable, consistent direction. Revisions by GPT-5.4, Claude Sonnet 4.6, and Gemini 3.1 Pro all cut function words and first-person pronouns, lengthened words, and compressed explicit causal reasoning into abstraction; a voice-preserving instruction cut the effect by 32% and left its direction unchanged ([van Nuenen, arXiv 2604.22142](https://arxiv.org/abs/2604.22142)). Writers who post-edited LLM drafts kept text closer to LLM style than to their own, while perceiving it as their own ([arXiv 2604.24444](https://arxiv.org/abs/2604.24444)). So "it still sounds like the author" is not a check an editor can run by feel. Run this one instead: count first-person pronouns, contractions, and `because`/`so` links in each section before and after your pass. If any count dropped, each removal needs its own reason, or it goes back.

Counter-evidence, held deliberately: ACES has also argued the opposite, that "not every writer has a terrific voice" and the real question is whether you are editing *enough* ([archived](https://web.archive.org/web/20231129181014/https://aceseditors.org/news/2018/how-much-editing-is-too-much-heres-the-answer-with-a-twist)). Both are true at different times. On this blog the author's voice is established and the default is restraint.

## When To Stop

State a stop condition before starting, and honour it.

- Stop when the additive questions above are all answered on the page.
- Stop when a pass produces only [Taste] changes.
- Stop when a section is shorter but tells the reader less — and revert that change.
- Stop counting anything once the count is in a defensible range; a number is a prompt to look, never a target to hit.

Do not run this skill twice in a row on the same text. A second consecutive pass trades specificity for smoothness, which is the defect it exists to fix. The evidence for compounding is direct: frontier models relaying edits through long workflows corrupted an average of 25% of document content, worse on longer documents and in natural-language domains than programmatic ones ([DELEGATE-52, arXiv 2604.15597](https://arxiv.org/abs/2604.15597)); repeated LLM paraphrasing settles into stable repeating cycles that limit linguistic diversity ([arXiv 2502.15208](https://arxiv.org/abs/2502.15208)); and less constrained instructions ("improve this") pull text toward stronger attractors than constrained ones ([Perez et al., arXiv 2407.04503](https://arxiv.org/abs/2407.04503)). Make each change for a named reason, as small as that reason allows.

Your own sense that a revision is better is also biased: LLM judges rate their own outputs higher than humans do ([Panickssery et al.](https://arxiv.org/abs/2404.13076)) and prefer longer answers more than humans do ([Saito et al.](https://arxiv.org/abs/2310.10076)). "Reads better to me" is not a reason; a named signal from this skill is.

## Editing Checklist

- Each paragraph makes one point, and a sentence on the page states it.
- Nothing the argument depends on is left implicit.
- Topic positions start from information the reader already has.
- The most memorable sentence sits at the end of its section.
- Sharp phrasing is clustered where the argument turns, not spread evenly.
- The reader can hear a specific person's judgement.
- Quotations, code, and diagrams are untouched.
- Every example, number, and first-person statement came from the author or a source, not from you.
- First-person pronouns, contractions, and causal links did not drop without a reason.

## Best Practice References

- [references/REFERENCE.md](references/REFERENCE.md) — sources, with what each supports and what it does not.
- [examples/EXAMPLES.md](examples/EXAMPLES.md) — paragraph-level rewrite examples.

## When Not To Use

- Early rough outlines, where structure matters more than voice.
- Factual verification — use the fact checker.
- Large post-outline reordering before the argument is settled.
- Any attempt to mimic human writing by adding mistakes, randomness, or fake eccentricity.
