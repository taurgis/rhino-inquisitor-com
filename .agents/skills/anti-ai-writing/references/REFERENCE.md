# Anti-AI Writing Reference

Sources behind the `anti-ai-writing` skill, with what each one actually supports. Read the "supports" column before citing any of these in a review comment: several are routinely over-claimed.

## Evidenced Markers

| Source | What it supports | What it does not support |
| --- | --- | --- |
| [Reinhart et al., arXiv 2410.16107](https://arxiv.org/abs/2410.16107) | LLM prose over-uses nominalisations, trailing participial clauses, subject `that`-clauses, and phrasal coordination, measured with Biber's feature set across parallel human/LLM corpora. Differences grow with instruction tuning. | Any claim about sentence-length variance. The paper's 66 features do not include it. |
| [Kobak et al., arXiv 2406.07016](https://arxiv.org/abs/2406.07016) | 379 excess style words in 2024 PubMed abstracts, mostly verbs and adjectives. | That any single word proves authorship. |
| [Thelwall, arXiv 2509.09596](https://arxiv.org/abs/2509.09596) | *Co-occurrence* is the real lexical signal — `underscore` × `pivotal` correlation rose from 0.03 to 0.45 in two years. | A stable banned-word list. |
| [arXiv 2502.09606](https://arxiv.org/abs/2502.09606) | Marker words decay once publicised (`delve`). Any hardcoded list rots. | — |
| [arXiv 2404.08627](https://arxiv.org/abs/2404.08627) | Copula avoidance: `is`/`are` use fell over 10% in post-2022 academic writing. | — |
| [Jiang & Hyland](https://research-portal.uea.ac.uk/en/publications/rhetorical-distinctions-comparing-metadiscourse-in-essays-by-chat) | LLM text over-uses transitions and endophoric markers while under-using interactional ones. | A ban on transitions as such. |
| [arXiv 2508.01930](https://arxiv.org/abs/2508.01930) | RLHF annotators systematically preferred text containing these markers, which is *why* models produce them. Edit on quality grounds, not avoidance. | "It's not just X, it's Y" as a measured marker — the paper mentions it only speculatively. |
| [Antislop, arXiv 2510.15061](https://arxiv.org/abs/2510.15061) | "It's not X, it's Y" constructions at 6.3× the human rate "in some models"; phrase-level slop measured as a frequency ratio against a human baseline. Also cites the "pink elephant" risk: telling a model to avoid listed words may backfire. | A multiplier for technical prose or frontier models: the 6.3× figure comes from small open models on Reddit creative-writing prompts. The pink-elephant claim is cited, not tested. |
| [Russell, Karpinska & Iyyer, arXiv 2501.15654](https://arxiv.org/abs/2501.15654) | Frequent LLM users detect AI non-fiction at 92.7% TPR / 3.3% FPR; non-experts are near chance (52.5% FPR) with high confidence. Expert clues: vocabulary (53%), sentence structure (36%, incl. "not only… but also" and lists of exactly three), grammar, originality, quotes. Paraphrasing and a prompt "humanizer" did not defeat the experts; "many of the largest identifiable traits of AI were due to the base generation." | That fixing these clues improves prose; a ranking of which clues survive evasion. American English news and magazine prose, 2024–25 models. |
| [Graphite, "AI Tells"](https://graphite.io/five-percent/research/ai-tells) and [Opus 5.5 update](https://graphite.io/five-percent/research/ai-tells-opus-5-5-update) | Industry corpus with disclosed method: 10,000 pre-ChatGPT articles against 90,000 AI articles on the same topics. "is genuinely" 1,021× in Opus 5 against 4× human; "less like a _ and more like" 125 against 1; corrective framing more common across successive GPT versions; latest GPT and Gemini use em dashes "far less often than human writers"; 55–72% of tells differ between consecutive versions of a model. | Per-document classification: Graphite itself does not recommend "classifying authorship based on individual tells". Not peer-reviewed; one prompt; web-article genre. |
| [Shaib et al., arXiv 2509.19163](https://arxiv.org/abs/2509.19163) | "Slop" decomposes into density, relevance, factuality, bias, structure, coherence, and tone; trained annotators agree on factuality (AC1 0.76) far more than on a binary slop label (κ −0.15 to 0.29). GPT-5, DeepSeek-V3, and o3-mini labelling slop: κ ≈ 0, recall 0.08–0.12. | Any sentence-level pattern list. News and QA text. |
| [Sun et al., arXiv 2502.12150](https://arxiv.org/abs/2502.12150) | Models are distinguishable from *each other* at 97% from word choice and formatting habits. | Anything about AI versus human: there is no human baseline. |

## Editor Communities and Vendor Guidance ([Craft])

- [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) (WikiProject AI Cleanup). Curated observations, not measurements: "this list is descriptive, not prescriptive; it consists of observations, not rules." Supports: negative parallelism, superficial -ing analyses, vague attributions, copula avoidance, undue emphasis on significance, rule of three where "most people would not bother", chat residue, and per-era vocabulary (`delve` "dropped off sharply in 2025"). Also supports what *not* to flag: its "Ineffective indicators" list includes transition words in isolation, and its "Signs of human writing" list includes plain is/has, hedges and intensifiers, and wordy constructions like *in order to* and *the fact that*. It warns against treating the signs as "the problems to be fixed".
- [Anthropic, prompting Claude Fable 5.1](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1) — the definition of mannered prose ("a dial worth turning", "earns its keep") and its fix: "When a literal phrase is available, use it." The same page notes that prompts still carry anti-formatting rules written for earlier models, while the current model already "leans the other way": the decay problem in vendor form.

## LLM Editors' Own Failure Modes

| Source | What it supports | What it does not support |
| --- | --- | --- |
| [Chakrabarty et al., CHI 2025, arXiv 2409.14509](https://arxiv.org/abs/2409.14509) | Professional writers' edits to LLM paragraphs: awkward word choice 28%, poor sentence structure 20%, redundant exposition 18%, clichés 17%. LLM-edited text ranks between raw LLM text and writer-edited text. Detection "is not the bottleneck"; the rewrite is. LLMs "sometimes replace clichés with other clichés". | Technical prose (the authors call it "less applicable to… technical writing"). Category frequencies as prevalence: they are edit counts shaped by annotator style. |
| [White et al., arXiv 2603.18161](https://arxiv.org/abs/2603.18161) | Even when "asked to only make grammar edits", LLMs "still change the text in a way that significantly alters its semantic meaning." | Technical posts — argumentative essays only. |
| [van Nuenen, arXiv 2604.22142](https://arxiv.org/abs/2604.22142) | GPT-5.4, Claude Sonnet 4.6, and Gemini 3.1 Pro revisions all push the same way: function words and first-person pronouns down; vocabulary diversity, word length, and punctuation elaboration up; explicit causal reasoning toward compressed abstraction. "Voice-preserving prompts reduce effect magnitude by 32% but preserve direction." | Reader-perceived voice: the markers are stylometric proxies. Short personal narratives, preprint. |

## Style Authorities Used For Fixes

- [GSA / plainlanguage.gov — avoid hidden verbs](https://github.com/GSA/plainlanguage.gov/blob/main/_pages/guidelines/words/avoid-hidden-verbs.md) — the nominalisation fix, with the "we manage the program" example.
- [GSA / plainlanguage.gov — use transition words](https://github.com/GSA/plainlanguage.gov/blob/main/_pages/guidelines/organize/use-transition-words.md) — readers find explicit connectives helpful. This is why the skill does not ban `moreover`.
- Williams, *Style* — the three nominalisation exceptions (refers back, replaces "the fact that", names a familiar concept).
- [Google technical writing — words](https://developers.google.com/tech-writing/one/words) — one term per concept, no synonym rotation.
- [Pullum, "Fear and Loathing of the English Passive"](https://pullum.ppls.ed.ac.uk/passive_loathing.html) — the charges against the passive are baseless.

## Claims This Skill Refuses To Make

- **Em-dash density.** [Merriam-Webster](https://www.merriam-webster.com/grammar/em-dash-en-dash-how-to-use) treats the choice as personal preference; CMOS calls it taste; only the [Guardian](https://www.theguardian.com/guardian-observer-style-guide-d) restrains density, on rhythm grounds. The population-level frequency finding is explicitly not a per-document detector, and per-model rates vary from zero upward. By 2026 the newest GPT and Gemini versions use them less than human writers do ([Graphite](https://graphite.io/five-percent/research/ai-tells)).
- **"not X but Y" as proof.** It is measured as over-represented, and Wikipedia's editors still note it is "common among human writers". It is a pattern to fix when it argues with nobody, not an authorship signal.
- **Stock-phrase claims without a source.** *Staccato fragment runs*, *colon reveals* ("The result? Faster checkout."), and *honestly*/*frankly* as fake candor are widely repeated, but this research pass found no corpus measurement for them. They stay [Taste] unless a source turns up.
- **Detector scores as evidence.** [OpenAI's withdrawn classifier](https://openai.com/index/new-ai-classifier-for-indicating-ai-written-text/) (26% TPR / 9% FPR); [Weber-Wulff et al.](https://link.springer.com/article/10.1007/s40979-023-00146-z) (14 tools, all under 80%); [RAID](https://aclanthology.org/2024.acl-long.674/) (headline accuracies only at matching high false-positive rates); [Vanderbilt disabling Turnitin's detector](https://www.vanderbilt.edu/brightspace/2023/08/16/guidance-on-ai-detection-and-why-were-disabling-turnitins-ai-detector/). Detectors also disadvantage non-native English writers.
- **Hedge count.** Hyland found LLM essays carried *fewer* hedges than student ones. Only unmotivated hedging is a defect.
- **Over-editing as a safe default.** [Un-AI-ing documents](https://link.springer.com/article/10.1007/s10439-026-04242-2) records authors degrading clear prose to avoid false flags; comprehension peaks at [16–20 words per sentence](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9955962/).

## Editorial Restraint

- [Saller, CMOS Shop Talk — "do no harm"](https://cmosshoptalk.com/2015/11/30/editors-corner-4-2/): be able to cite an authority for every mark you make.
- [Saller on overstepping](https://cmosshoptalk.com/2019/09/17/do-you-overstep-when-editing-fiction-three-easy-cures/): never edit merely because it sounds better to you.

Note: CMOS §2.53–2.57 on editorial discretion is paywalled and was not verified directly. The Shop Talk posts above are the citable versions.

## Repo-Local Rules

- Posts are British English; the spelling gate enforces it. Never Americanise during a line edit.
- Never edit inside a quotation, code fence, or Mermaid block.
- Every change carries a tier: [Evidenced], [Craft], or [Taste].
- Never invent a specific to make a sentence concrete; flag it for the author instead.

## Verification Notes

The 2026-10-06 additions (Antislop, Russell et al., Graphite, Shaib et al., Sun et al., Wikipedia, Anthropic, Chakrabarty et al., White et al., van Nuenen) were fetched in-task through Bonsai and their quoted figures checked against the cached text under `.bonsai/research/`. Not verified: Graphite's raw data (Google Drive), Arena's primary analysis of Opus 5 output (only a secondary write-up was reachable, so its figures are not cited here), and the Washington Post original of its GPT-4o phrase analysis.
