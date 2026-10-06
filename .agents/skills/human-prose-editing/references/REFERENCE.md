# Human Prose Editing Reference

Sources behind the `human-prose-editing` skill. The skill's central claim — that most "generated-sounding" prose is missing something rather than carrying something extra — comes from the first two entries, and they are the ones to read if you only read one thing.

## The Additive Core

- [Gopen & Swan, "The Science of Scientific Writing"](https://www.americanscientist.org/blog/the-long-view/the-science-of-scientific-writing) — seven reader-expectation principles: subject followed promptly by its verb; old information in the topic position; new, emphasis-worthy information in the stress position; the person whose story it is placed first; the action of every clause articulated in its verb; context before new material. Two things to take from it beyond the principles:
  - **The finding that reframes editing**: of their four examples, only one was fixable by rearrangement. "Filling the gaps required the addition of extra material."
  - **The length test**: "A sentence is too long when it has more viable candidates for stress positions than there are stress positions available." Semicolons and colons create secondary stress positions, which is what makes a long sentence legitimate.
  - They explicitly decline to reduce this to a simplified rule set, so do not quote them as a checklist.
- Williams, *Style: Toward Clarity and Grace*, [chapter scan](https://marcuse.faculty.history.ucsb.edu/classes/204writingworkshop/pdfs/Williams1995CoherenceConcisionOCR.pdf) — topic strings, thematic strings, one POINT sentence per section, and the placement of that point at the end of the opening issue rather than as an opening topic sentence. Also the "it's obvious" diagnostic, and the instruction to underestimate the reader's knowledge and make themes explicit.
- [Duke WRP cohesion and coherence handout](https://wrp.duke.edu/sites/twp.duke.edu/files/documents/updated-Cohesion-and-Coherence-Handout-Feb2023.pdf) — cohesion is not coherence, demonstrated with a passage that links perfectly and means nothing. Also the retention order: readers remember the ending, then the beginning, then the middle.
- [Klinkenborg, via Craft Literary](https://www.craftliterary.com/2017/09/26/several-short-klinkenborg/) — deletion is the simplest revision, not the best one.

## Document and Section Craft

- [Google — paragraphs](https://developers.google.com/tech-writing/one/paragraphs): every paragraph answers what, why, how.
- [Google — large docs](https://developers.google.com/tech-writing/two/large-docs): open with scope, assumed knowledge, and explicit exclusions.
- [Google — audience](https://developers.google.com/tech-writing/one/audience): audience gap as needed knowledge minus current knowledge.
- [Google — tone](https://developers.google.com/style/tone): the read-aloud test; avoid choppy and long-winded; do not open consecutive sentences identically.
- [digital.gov plain-language style](https://digital.gov/guides/plain-language/writing/style): a worked example after every complex concept; transitions are an addition readers need even when the writer thinks otherwise.
- [Poynter — Clark's fifty writing tools](https://www.poynter.org/reporting-editing/2006/fifty-writing-tools-quick-list/): get the name of the dog; ladder of abstraction; reports render information, stories render experience; strong words at beginning and end.

## First-Person Technical Narrative

- [Cloudflare, July 2019 outage write-up](https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/) — timestamps with timezone, impact as a number, and the line on single root causes obscuring reality.
- [SRE Workbook, postmortem culture](https://sre.google/workbook/postmortem-culture/) and the [example postmortem](https://sre.google/sre-book/example-postmortem/) — blameless phrasing; the what-went-well / what-went-wrong / where-we-got-lucky skeleton. The internal quality rubric referenced in the chapter is not public.
- [Julia Evans on confusing explanations](https://jvns.ca/blog/confusing-explanations/) — label a mistake where you introduce it; give the reader a check they can run.
- [Dan Luu, writing non-advice](https://danluu.com/writing-non-advice/) — over-supply examples; they pin ideas down.
- [Allspaw, "The Infinite Hows"](https://www.kitchensoap.com/2014/11/14/the-infinite-hows-or-the-dangers-of-the-five-whys/) — ask how, not why.

## Evidenced Structural Markers

| Source | What it supports |
| --- | --- |
| [arXiv 2604.19768](https://arxiv.org/abs/2604.19768) | Human experts cluster rhetorical devices at argumentative stress points; LLM text spreads them evenly. Uniform excellence is itself a marker. |
| [Jiang & Hyland](https://ueaeprints.uea.ac.uk/id/eprint/97952/) | LLM prose carries fewer engagement markers, particularly questions and personal asides. Supports adding them, deliberately and sparingly. |
| [QUDsim, arXiv 2504.09373](https://arxiv.org/abs/2504.09373) | LLMs reuse discourse structure across documents even when content differs. Audit several posts side by side. |

## LLM Prose and LLM Editors (added 2026-10-06)

| Source | What it supports | What it does not support |
| --- | --- | --- |
| [Chakrabarty et al., CHI 2025, arXiv 2409.14509](https://arxiv.org/abs/2409.14509) | 18 professional writers' 8,035 edits to LLM paragraphs: awkward word choice 28%, poor sentence structure 20%, unnecessary/redundant exposition 18%, clichés 17%. Exposition and lack-of-specificity edits "remain relatively constant" as paragraph quality rises. LLM editors are "mostly ineffective at addressing Lack of Specificity and Detail" and "sometimes replace clichés with other clichés". The basis for splitting the additive pass into logic (fillable) and specifics (author-only). | Technical prose — literary fiction and creative non-fiction only, which the authors say is "less applicable to… technical writing". Whole-document structure: the study is paragraph-level. |
| [van Nuenen, arXiv 2604.22142](https://arxiv.org/abs/2604.22142) | Three 2026 models' revisions all reduce function words and first-person pronouns and move "from explicit causal reasoning to compressed abstraction"; "Voice-preserving prompts reduce effect magnitude by 32% but preserve direction." The basis for the before/after first-person, contraction, and causal-link count. | Reader-perceived voice (stylometric proxies only); technical prose. Preprint. |
| [arXiv 2604.24444](https://arxiv.org/abs/2604.24444) | Post-edited LLM drafts stay "closer in style to LLM text than to participants' unassisted control text", while participants perceive them as their own. Why "it still sounds like the author" is not a usable stop test. | Edits by a separate editor rather than the author. Read at abstract level. |
| [White et al., arXiv 2603.18161](https://arxiv.org/abs/2603.18161) | LLMs asked "to only make grammar edits" still significantly alter semantic meaning. | Technical posts. |
| [DELEGATE-52, arXiv 2604.15597](https://arxiv.org/abs/2604.15597) | Frontier models relaying edits through long workflows "corrupt an average of 25% of document content"; errors are sparse but severe, worse with document size and in natural-language domains. Supports one bounded pass, not repeated passes. | A comparison of diff-style edits against whole-document rewrites: proposing minimal edits is an inference from it, not a tested result. |
| [arXiv 2502.15208](https://arxiv.org/abs/2502.15208), [Perez et al., arXiv 2407.04503](https://arxiv.org/abs/2407.04503) | Repeated paraphrasing settles into attractor cycles that limit diversity; "less constrained tasks lead to stronger attractors". | Editing of a human draft specifically — these are transmission chains. |
| [Panickssery et al., arXiv 2404.13076](https://arxiv.org/abs/2404.13076), [Saito et al., arXiv 2310.10076](https://arxiv.org/abs/2310.10076) | LLM evaluators prefer their own outputs and longer answers more than humans do. Why "reads better to me" is not a reason for an LLM editor. | Editing directly: both measure judging. No study found measures an LLM editing toward its own style. |
| [Liu et al., "Lost in the Middle"](https://arxiv.org/abs/2307.03172), [Chroma, Context Rot](https://research.trychroma.com/context-rot) | Model performance drops with input length and for material in the middle of long contexts. Indirect support for running sentence-level review per chapter while keeping paragraph- and document-level review whole. | Prose editing: both test retrieval and QA. Context Rot is a vendor report. |
| [Antislop, arXiv 2510.15061](https://arxiv.org/abs/2510.15061) | "It's not X, it's Y" at 6.3× the human rate in some models — moves the repeated-contrast signal from [Taste] to [Evidenced]. | Frontier models or technical prose (small open models, creative-writing prompts). |

## Claims This Skill Dropped

- **"Low burstiness" and "low perplexity" as editorial concepts.** Burstiness' technical origin is word recurrence intervals ([Katz 1996](https://www.cambridge.org/core/journals/natural-language-engineering/article/abs/distribution-of-content-words-and-phrases-in-text-and-language-modelling/EB3C843581872E629502A818C5D0082F), [Altmann 2009](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0007678)), not sentence-length variance. GPTZero states it "no longer uses perplexity and burstiness" as of autumn 2023 ([source](https://gptzero.me/news/perplexity-and-burstiness-what-is-it/)) while elsewhere on the same page still calling burstiness a key factor — a self-contradiction that disqualifies the page as method. Perplexity is measured against a chosen scoring model, so plain clear writing scores low by construction, which is one mechanism behind false accusations against non-native writers.
- **Sentence-length variance as a cited standard.** No major style guide prescribes it as a goal. GOV.UK imposes caps instead (split sentences over 25 words; five sentences per paragraph). Keep rhythm variation as craft, sourced to [Provost](https://www.aerogrammestudio.com/2014/08/05/this-sentence-has-five-words/), and stop claiming research support.
- **Uniform paragraph length as a measured marker.** Not established. The nearest real finding is that LLM sentences cluster in a 10–30 token band while human sentences scatter more ([Muñoz-Ortiz et al.](https://link.springer.com/article/10.1007/s10462-024-10903-2)), which is distribution plots on 2023 news-genre models, not a paragraph rule.
- **"Summary conclusions add nothing" and "thesis-support-recap" as measured shapes.** Both rest on judgement, not corpus work. Keep them as [Taste]. A 2026 research pass again found no corpus study of conclusion restatement or equal-length sections.

## Voice Preservation

- [ACES — three steps to protecting the author's voice](https://aceseditors.org/news/2019/three-steps-to-protecting-the-authors-voice) — the "couch potatoes" before/after, where a grammatical edit erases the writer.
- [Saller on overstepping](https://cmosshoptalk.com/2019/09/17/do-you-overstep-when-editing-fiction-three-easy-cures/) — repetition, long sentences, and comma splices can all work in the right place.
- [ACES, archived counter-argument](https://web.archive.org/web/20231129181014/https://aceseditors.org/news/2018/how-much-editing-is-too-much-heres-the-answer-with-a-twist) — held deliberately: not every writer has a voice worth protecting, and the real question may be whether you are editing enough. On this blog the author's voice is established, so restraint is the default.
- [EFA service definitions](https://www.the-efa.org/editorial-services-definitions/) — copyediting is mechanics; changing language and style is a separately commissioned line edit. Know which one you were asked for.

## Verification Notes

Sources above were fetched in-task and cached under `.bonsai/research/`, except the CMOS Shop Talk and ACES pages, which failed extraction and were read over direct HTTP and the Wayback Machine. Zinsser and Klinkenborg are book-only and are cited via secondary transcripts. One widely circulated Saller quotation about writer/editor adversarialism could not be found on its claimed source page and is treated as fabricated — do not repeat it.
