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

## Style Authorities Used For Fixes

- [GSA / plainlanguage.gov — avoid hidden verbs](https://github.com/GSA/plainlanguage.gov/blob/main/_pages/guidelines/words/avoid-hidden-verbs.md) — the nominalisation fix, with the "we manage the program" example.
- [GSA / plainlanguage.gov — use transition words](https://github.com/GSA/plainlanguage.gov/blob/main/_pages/guidelines/organize/use-transition-words.md) — readers find explicit connectives helpful. This is why the skill does not ban `moreover`.
- Williams, *Style* — the three nominalisation exceptions (refers back, replaces "the fact that", names a familiar concept).
- [Google technical writing — words](https://developers.google.com/tech-writing/one/words) — one term per concept, no synonym rotation.
- [Pullum, "Fear and Loathing of the English Passive"](https://pullum.ppls.ed.ac.uk/passive_loathing.html) — the charges against the passive are baseless.

## Claims This Skill Refuses To Make

- **Em-dash density.** [Merriam-Webster](https://www.merriam-webster.com/grammar/em-dash-en-dash-how-to-use) treats the choice as personal preference; CMOS calls it taste; only the [Guardian](https://www.theguardian.com/guardian-observer-style-guide-d) restrains density, on rhythm grounds. The population-level frequency finding is explicitly not a per-document detector, and per-model rates vary from zero upward.
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
