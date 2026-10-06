---
schema_version: 1
artifact_type: source
source_url: https://arxiv.org/html/2603.11228v1
source_urls:
  - https://arxiv.org/html/2603.11228v1
normalized_url: https://arxiv.org/html/2603.11228v1
cache_key: 862c31fbbbf763a5fcdfedfd33b72cfc80e90acdd9a370d3b56d55da78fbe76c
topic: 
tags:
  - language
  - models
  - generation
  - markovian
  - large
format_available:
  - compressed
  - detailed
tier: standard
ttl: 
fetched_at: 2026-10-06T11:13:30.187Z
validated_at: 2026-10-06T11:13:30.187Z
stale_after: 2026-11-05T11:13:30.187Z
capture_method: static_fetch
extraction_status: extracted
extraction_confidence: high
quality_notes:
  - readability extracted main article
  - quality:oversized
  - auto-generated tags via keyword extraction
supplied_at: 
supplied_by: 
etag: "CM7q07GDupYDEAE="
last_modified: Mon, 24 Aug 2026 19:44:17 GMT
content_hash: c17474950fa4f578d09c7869fda47efa37d3a31452a70e480023d74736b8f086
token_estimate:
  compressed: 9838
  detailed: 17399
status: active
site_module_id: 
docs_engine: generated-static
docs_framework: 
source_doc_url: 
search_provider: 
parent_cache_key: 
section_anchor: 
section_heading_path: 
---

## Summary

Markovian Generation Chains in Large Language Models

## Compressed

Amr Mohamed† Affiliation: MBZUAI & Ecole Polytechnique Guokan Shang Affiliation: MBZUAI Michalis Vazirgiannis Affiliation: MBZUAI & Ecole Polytechnique Thierry Poibeau Affiliation: ENS-PSL & CNRS-Lattice

###### Abstract

The widespread use of large language models (LLMs) raises an important question: how do texts evolve when they are repeatedly processed by LLMs? In this paper, we define this iterative inference process as Markovian generation chains, where each step takes a specific prompt template and the previous output as input, without including any prior memory. In iterative rephrasing and round-trip translation experiments, the output either converges to a small recurrent set or continues to produce novel sentences over a finite horizon. Through sentence-level Markov chain modeling and analysis of simulated data, we show that iterative process can either increase or reduce sentence diversity depending on factors such as the temperature parameter and the initial input sentence.

$\\dagger$$\\dagger$footnotetext: Equal contribution.

## 1 Introduction

Large language models (LLMs) are used in a wide range of downstream tasks, such as translation and rewriting.

We refer to this process as Markovian generation chains in LLMs: the input consists only of a specific prompt template and the output of the previous inference, without including any prior memory. Although such recursive reuse arises naturally in iterative translation and repeated rephrasing workflows ([Perez et al., 2025]; [Mohamed et al., 2025]), it lacks a standard formalization and well-defined metrics for characterizing these outcomes.

We treat each _sentence_ as the primary unit of analysis and focus on the evolution in the iterative procedure, e.g., quantifying diversity based on how many _distinct sentences_ emerge over the repeated process. Furthermore, although a one-to-one correspondence cannot be constructed at the token level, it becomes feasible at the sentence level. Therefore, at the sentence level, the iterative reprocessing procedure can be described using a Markov chain, differing from previous work that analyzes a single inference at the token level using Markov chains ([Zekri et al., 2024]).

The accumulation of random perturbations and systematic biases can lead to equilibrium, periodic behavior, divergence, or random walk. The prevalence of these behaviors depends on the model, the decoding configuration, and the seed input sentence; in particular, sampling-based decoding typically increases exploration and prolongs pre-recurrence phases. Figure [1] provides an illustration of these behaviors under greedy versus sampling-based decoding.

Figure 1: Illustration of iterative LLM reprocessing (Markovian generation chains). Under greedy decoding, chains typically enter fixed points or short cycles, limiting sentence-level diversity. Under sampling-based decoding, stochasticity may yield longer transients and more distinct outputs

These iterative dynamics matter beyond controlled settings because LLM-mediated text can propagate through downstream communication and decision pipelines. In our experiments, text produced by an LLM via paraphrasing or translation is recursively reused as input, approximating multi-step and multi-user reprocessing workflows in the real world.

## 2 Related Work

##### Model collapse and iterative generation.

A growing line of work studies _model collapse_, where iteratively training on synthetic data can degrade coverage of the underlying data distribution ([Shumailov et al., 2024]; [Guo et al., 2023]). Repeated LLM use can also form multi-step transformation chains (e.g., iterated paraphrasing or round-trip translation) that accumulate changes across calls, with observed distortion ([Perez et al., 2025]; [Mohamed et al., 2025]).

##### Sampling and diversity in LLM-generated content.

Sampling methods derived from the softmax distribution, including top-kk ([Fan et al., 2018]), top-pp ([Holtzman et al., 2019]), and temperature-based sampling or logit suppression ([Chung et al., 2023]), induce controlled randomness in generation, despite known limitations of softmax-based sampling in certain regimes ([Chang and McCallum, 2022]).

##### Language change and convergence in human–LLM interaction.

Our work also relates to research on language change and cultural transmission ([Lieberman et al., 2007]; [Kirby et al., 2007]; [Griffiths and Kalish, 2007]; [Hamilton et al., 2016]) and to studies of machine-mediated communication ([Brinkmann et al., 2023]; [Arnon and Kirby, 2024]). We contribute an inference-time mechanism, iterative reprocessing under a fixed prompting setup, that provides a controlled lens on repeated reuse in these settings.

## 3 Methodology

This section formalizes iterative processes as Markovian generation chains and introduces the tools used to analyze the empirical regimes in our experiments.

### 3.1 Iterative reprocessing as a Markovian generation chain

Let s(0)s^{(0)} denote an initial _sentence_. Fix (i) a model MM, (ii) a prompt template ρ\\rho, and (iii) a decoding configuration dd (e.g., greedy decoding, or sampling-based decoding with specified temperature/top-pp). One step of iterative reprocessing defines a stochastic transformation operator 𝒯M,ρ,d\\mathcal{T}\_{M,\\rho,d} that maps the text-unit surface string to a distribution over surface strings:

|  | s(t+1)∼𝒯M,ρ,d(⋅∣s(t)),t=0,1,…,T−1.s^{(t+1)}\sim\mathcal{T}_{M,\rho,d}(\,\cdot\mid s^{(t)}),\qquad t=0,1,\dots,T-1. |  | (1) |
| --- | --- | --- | --- |

Equivalently, 𝒯M,ρ,d\\mathcal{T}\_{M,\\rho,d} defines a time-homogeneous Markov kernel PM,ρ,d​(s′∣s)P\_{M,\\rho,d}(s^{\\prime}\\mid s) over sentences.

##### Operational Markovian assumption.

Iterations are independent model calls conditioned only on ρ\\rho and s(t)s^{(t)}; no history, memory, or latent state is carried between steps.

##### Structured operators via composition.

A single iteration can be written as a composition of prompted calls. Let 𝒯M,ρ,dEN→ℓ\\mathcal{T}^{\\text{EN}\\to\\ell}\_{M,\\rho,d} and 𝒯M,ρ,dℓ→EN\\mathcal{T}^{\\ell\\to\\text{EN}}\_{M,\\rho,d} denote the induced operators for each direction under the same fixed setup.

|  | 𝒯M,ρ,dEN→ℓ→EN:=𝒯M,ρ,dℓ→EN∘𝒯M,ρ,dEN→ℓ,\mathcal{T}^{\text{EN}\to\ell\to\text{EN}}_{M,\rho,d}\;:=\;\mathcal{T}^{\ell\to\text{EN}}_{M,\rho,d}\circ\mathcal{T}^{\text{EN}\to\ell}_{M,\rho,d}, |  | (2) |
| --- | --- | --- | --- |

which induces a Markov chain on English sentences.

|  | PM,ρ,dEN→ℓ→EN​(s′∣s)=∑u∈𝒮ℓPM,ρ,dℓ→EN​(s′∣u)​PM,ρ,dEN→ℓ​(u∣s),P^{\text{EN}\to\ell\to\text{EN}}_{M,\rho,d}(s^{\prime}\mid s)=\sum_{u\in\mathcal{S}_{\ell}}P^{\ell\to\text{EN}}_{M,\rho,d}(s^{\prime}\mid u)\,P^{\text{EN}\to\ell}_{M,\rho,d}(u\mid s), |  | (3) |
| --- | --- | --- | --- |

where 𝒮ℓ\\mathcal{S}\_{\\ell} denotes the (conceptual) state space of sentences in language ℓ\\ell.

### 3.2 Sentence-level Markov chain formulation

We model iterative reprocessing at the _sentence_ level, treating sentence strings as discrete states and the prompted model as a transition operator.

##### State spaces.

For translation between languages lAl\_{A} and lBl\_{B}, let 𝒮A\={a1,…,am},𝒮B\={b1,…,bn}\\mathcal{S}\_{A}=\\{a\_{1},\\ldots,a\_{m}\\},\\ \\mathcal{S}\_{B}=\\{b\_{1},\\ldots,b\_{n}\\}.

##### Transition matrices.

Fix (M,ρ,d)(M,\\rho,d).

|  | [𝐏M,ρ,dA→B]i​j:=Pr⁡(bj∣ai;M,ρ,d)=PM,ρ,dA→B​(bj∣ai).[\mathbf{P}^{A\to B}_{M,\rho,d}]_{ij}\;:=\;\Pr\!\left(b_{j}\mid a_{i};\,M,\rho,d\right)\;=\;P^{A\to B}_{M,\rho,d}(b_{j}\mid a_{i}). |  | (4) |
| --- | --- | --- | --- |

For round-trip translation lA→lB→lAl\_{A}\\to l\_{B}\\to l\_{A}, the induced within-𝒮A\\mathcal{S}\_{A} transition matrix is the product

|  | 𝐏M,ρ,dA→B→A=𝐏M,ρ,dA→B​𝐏M,ρ,dB→A,\mathbf{P}^{A\to B\to A}_{M,\rho,d}=\mathbf{P}^{A\to B}_{M,\rho,d}\,\mathbf{P}^{B\to A}_{M,\rho,d}, |  | (5) |
| --- | --- | --- | --- |

mirroring the kernel composition in Eq. ([3]).

|  | X(n)=X(0)​(𝐏M,ρ,dA→B→A)n.X^{(n)}=X^{(0)}\left(\mathbf{P}^{A\to B\to A}_{M,\rho,d}\right)^{n}. |  | (6) |
| --- | --- | --- | --- |

For iterative rephrasing, we use the analogous within-language matrix 𝐏M,ρ,d\\mathbf{P}\_{M,\\rho,d} on 𝒮A\\mathcal{S}\_{A}.

### 3.3 Regimes under iteration: recurrent classes and transients

Empirically, iterative reprocessing exhibits two finite-horizon behaviors: (i) _early exact recurrence_ (a fixed point or short cycle) and (ii) _long pre-recurrence phases_ (continued production of novel surface forms within the iteration budget).

##### Asymptotic structure (conceptual).

For a finite state space, 𝐏\\mathbf{P} can be permuted into the standard block form with recurrent classes {Ci}\\{C\_{i}\\} and a transient block 𝐏tr\\mathbf{P}\_{\\mathrm{tr}} (Eq. [7]. ‣ 3.3 Regimes under iteration: recurrent classes and transients ‣ 3 Methodology ‣ Markovian Generation Chains in Large Language Models")); early recurrence corresponds to fast entry into a small recurrent class, while long pre-recurrence corresponds to trajectories that remain in transient regions over the finite horizon.

|  | 𝐏=[𝐏1𝟎⋯𝟎𝟎𝟎𝐏2⋯𝟎𝟎⋱𝟎𝟎⋯𝐏c𝟎𝐐1𝐐2⋯𝐐c𝐏tr],\mathbf{P}=\begin{bmatrix}\mathbf{P}_{1}&\mathbf{0}&\cdots&\mathbf{0}&\mathbf{0}\\ \mathbf{0}&\mathbf{P}_{2}&\cdots&\mathbf{0}&\mathbf{0}\\ \vdots&\vdots&\ddots&\vdots&\vdots\\ \mathbf{0}&\mathbf{0}&\cdots&\mathbf{P}_{c}&\mathbf{0}\\ \mathbf{Q}_{1}&\mathbf{Q}_{2}&\cdots&\mathbf{Q}_{c}&\mathbf{P}_{\mathrm{tr}}\end{bmatrix}\!, |  | (7) |
| --- | --- | --- | --- |

where 𝐏i\\mathbf{P}\_{i} governs motion within CiC\_{i}, 𝐐i\\mathbf{Q}\_{i} captures transitions from transient states into CiC\_{i}, and 𝐏tr\\mathbf{P}\_{\\mathrm{tr}} governs transient-to-transient motion.

##### Finite-horizon recurrence statistics.

We treat “exact” equality as literal string equality on model outputs.

|  | τT=min⁡{t∈{1,…,T}:∃j<t​ such that ​s(t)=s(j)},\tau_{T}\;=\;\min\{t\in\{1,\dots,T\}:\exists j<t\text{ such that }s^{(t)}=s^{(j)}\}, |  | (8) |
| --- | --- | --- | --- |

with τT\=T+1\\tau\_{T}=T+1 if no exact repeat occurs within the horizon.

##### Effect of decoding on pre-recurrence behavior.

Decoding controls inside dd (e.g., temperature/top-pp) affect 𝐏\\mathbf{P} by redistributing transition mass. Sampling-based decoding typically increases probability assigned to lower-ranked continuations, enlarging the set of accessible next-step realizations and thereby increasing τT\\tau\_{T} on average, i.e., prolonging pre-recurrence phases relative to greedy decoding.

### 3.4 Information-theoretic tools for iterative reprocessing

We record three standard properties of the induced kernel 𝐏\\mathbf{P}—entropy behavior, Kullback-Leibler (KL) contraction, and mixture bounds—that help interpret diversity and stabilization under iteration.

##### Entropy under doubly stochastic kernels.

Let XX be a distribution over sentences and 𝐏\\mathbf{P} a row-stochastic transition matrix (the kernel induced by (M,ρ,d)(M,\\rho,d)).

|  | H(X)=−∑sX(s)logX(s).\mathrm{H}(X)=-\sum_{s}X(s)\log X(s)\,. |  | (9) |
| --- | --- | --- | --- |

If 𝐏\\mathbf{P} is doubly stochastic, then H⁡(X​𝐏)≥H⁡(X)\\mathrm{H}(X\\mathbf{P})\\geq\\mathrm{H}(X); otherwise (as for prompted LLM kernels) entropy may increase or decrease depending on XX and 𝐏\\mathbf{P}.

##### Data processing and KL contraction.

For distributions X,YX,Y over sentences, KL divergence contracts under a stochastic matrix:

|  | DKL(X𝐏∥Y𝐏)≤DKL(X∥Y),D_{\mathrm{KL}}(X\mathbf{P}\,\\|\,Y\mathbf{P})\leq D_{\mathrm{KL}}(X\,\\|\,Y)\,, |  | (10) |
| --- | --- | --- | --- |

Proof in Appendix [B]. If π\\pi is stationary (π​𝐏\=π\\pi\\mathbf{P}=\\pi), then DKL(X𝐏n∥π)D\_{\\mathrm{KL}}(X\\mathbf{P}^{n}\\|\\pi) is non-increasing in nn, formalizing stabilization under repeated application of the same kernel.

##### Mixtures of original and reprocessed text.

To reflect settings where original and model-processed text coexist, consider the mixture Y\=b​X+(1−b)​X​𝐏Y=bX+(1-b)X\\mathbf{P} for b∈\[0,1\]b\\in\[0,1\].

|  | b​H​(X)+(1−b)​H​(X​𝐏)≤H⁡(Y)≤b​H​(X)+(1−b)​H​(X​𝐏)+h⁡(b),b\,\mathrm{H}(X)+(1-b)\,\mathrm{H}(X\mathbf{P})\leq\mathrm{H}(Y)\leq b\,\mathrm{H}(X)+(1-b)\,\mathrm{H}(X\mathbf{P})+h(b), |  | (11) |
| --- | --- | --- | --- |

where h⁡(b)\=−b​log⁡b−(1−b)​log⁡(1−b)h(b)=-b\\log b-(1-b)\\log(1-b) is the binary entropy.

### 3.5 Measurement and evaluations

We used the following methods for measurement and evaluation:

*   •
    
    _Distinct-sentence count:_ U\=|{c⁡(s(t)):0≤t≤T}|U=\\left|\\{c(s^{(t)}):0\\leq t\\leq T\\}\\right|.
    
*   •
    
    _First recurrence time:_ defined in Eq. [8].
    
*   •
    
    _Drift:_ METEOR ([Banerjee and Lavie, 2005]), ROUGE-1 ([Lin, 2004]), BLEU ([Papineni et al., 2002]), and TF–IDF cosine (2–4 grams), computed stepwise (s(t)s^{(t)} vs. s(t−1)s^{(t-1)}) and cumulative (s(t)s^{(t)} vs. s(0)s^{(0)}).
    
*   •
    
    _Input sensitivity:_ correlation of seed length with UU (Pearson rr and linear regression).
    

## 4 Experimental Setup

##### Data

We use three corpora spanning distinct domains: BookSum ([Kryściński et al., 2022]), ScriptBase-alpha ([Gorinski and Lapata, 2015]), and (BBC) News2024 ([Li et al., 2024]).

##### Models and baselines.

We evaluate instruction-tuned open-weight models: Mistral-7B-Instruct ([Jiang et al., 2023]), Llama-3.1-8B-Instruct ([Dubey et al., 2024]), and Qwen2.5-7B-Instruct ([Yang et al., 2024]).

##### Decoding configurations and prompts.

We compare two decoding regimes. Under sampling-based decoding, we sample with fixed hyperparameters for comparability (unless otherwise stated, τ\=0.7\\tau=0.7, top-p\=0.9p=0.9).

## 5 Results

### 5.1 Main Results and Findings

Table 1: Illustrative greedy-decoding trajectories under iterative rephrasing.

Figure 2: Average number of unique paraphrases generated over 50 iterative rephrasings across three datasets, comparing four instruction-tuned LLMs: GPT-4o-mini, Llama-3.1-8B, Mistral-7B, and Qwen-2.5-7B.

Figure 3: Evolution of text similarity metrics across 50 rephrasing iterations for the BookSum dataset using greedy decoding. Each iteration compares the current rephrased text against the previous iteration’s text as reference.

Table [1] provides an illustrative greedy-decoding trajectory and Figure [2] reports sentence-level diversity over T\=50T{=}50 iterations across datasets and models. Under greedy decoding, trajectories typically enter small recurrent sets (fixed points or short cycles) after few steps, yielding repeated surface strings or short alternations among near-paraphrases. For sampling-based decoding, trajectories exhibit longer pre-recurrence phases and a non-trivial fraction of chains show no exact repetition within T\=50T{=}50 (Appendix Table [3]). Sampling yields markedly larger support sizes with substantial heterogeneity across models and domains, suggesting that both the induced kernel (model/decoding) and the seed distribution modulate time-to-recurrence within the finite horizon.

To characterize local dynamics along trajectories, we compute METEOR, ROUGE-1, and BLEU between successive iterations (s(t)s^{(t)} vs. s(t−1)s^{(t-1)}). Under greedy decoding, these stepwise similarity scores rapidly plateau (Figure [3]; Appendix Figures [8] and [9]), consistent with confinement to a small recurrent set rather than continued exploration.

### 5.2 Parameters and Inputs

The behavior of iterative reprocessing depends on both the _decoding configuration_ and the _initial input_.

The initial input affects the size of the accessible paraphrastic neighborhood and thus the diversity observed along an iterative chain. Table [4] reports the association between seed length (words) and sentence-level diversity (the number of distinct outputs over T\=50T=50 iterations) across models, decoding regimes, and datasets.

  

Figure 4: Pearson correlation rr between seed length (words) and the number of distinct outputs over T\=50T=50 iterations.

### 5.3 Ablations

We perform a set of ablation studies to evaluate the robustness of the observed iterative regimes and to identify which elements of the chain specification most strongly affect recurrence and output diversity. Specifically, we vary: (i) the prompt template, (ii) prompt heterogeneity across iterations, (iii) the granularity of the input unit (sentences vs. paragraphs), and (iv) the task instantiation via round-trip translation.

#### 5.3.1 Sensitivity to prompt specification and prompt heterogeneity

We first assess the sensitivity of iterative rephrasing dynamics to the prompt template. As shown in Figure [5], the decoding regime is the primary driver within this prompt range: sampling-based decoding consistently yields a substantially larger number of distinct sentence realizations than greedy decoding, whereas the prompt variation induces comparatively smaller changes.

To better approximate heterogeneous real-world pipelines, we next introduce prompt heterogeneity across iterations by alternating prompts. This setting remains _Markovian_ at the sentence level, but the kernel becomes _time-inhomogeneous_: iteration tt uses PM,ρt,d(t)P^{(t)}\_{M,\\rho\_{t},d} rather than a single fixed PM,ρ,dP\_{M,\\rho,d}. Figure [6] shows that prompt alternation increases the number of distinct outputs relative to a single fixed prompt under the same sampling-based configuration, but does not eliminate exact recurrences: some sentences still reappear across iterations.

Figure 5: Number of distinct sentences produced over 50 iterative rephrasings with GPT-4o-mini under different settings.

Figure 6: Prompt heterogeneity across iterations (GPT-4o-mini, sampling-based decoding).

#### 5.3.2 Beyond single sentences: paragraph-level iterative reprocessing

Our primary experiments model the chain state at the sentence level. However, recurrence remains pronounced at the sentence level: when we segment each paragraph output into sentences, individual sentence forms can reappear frequently across iterations, indicating that local attractor-like behavior can persist even when the state comprises multiple sentences.

To quantify exploration at this granularity, we compute a _normalized diversity ratio_: the number of distinct sentence realizations observed over the iterative trajectory divided by the number of sentences in the original paragraph. Over 50 iterations, this ratio is 26.7 for BookSum, 19.7 for ScriptBase-alpha, and 24.2 for News2024, indicating that iterative paragraph-level reprocessing can generate substantial sentence-level variation even when full-paragraph exact recurrence is rare.

Table 2: Highest recurrence frequency observed sentences within the 50-iteration paragraph-level runs (GPT-4o-mini, sampling-based decoding, prompt P1) on 150 BookSum paragraphs.

#### 5.3.3 Round-trip translation and comparison to a production MT service

We additionally instantiate iterative reprocessing through round-trip translation (EN→ℓ→\\rightarrow\\ell\\rightarrowEN).

We evaluate multiple bridge languages and compare sampling-based LLM translation with Google Translate (v3) as a production machine translation service baseline. Figure [7] reports distinct-sentence counts under iterated round-trip translation for GPT-4o-mini and Google Translate (v3). Unlike prompted LLM translation, which can exhibit substantial stochastic variation under sampling-based decoding, production MT services tend to behave nearly deterministically for fixed inputs. These results highlight that prompted LLM translation can induce substantially stronger surface-form variability under iterative reuse than a production MT service, even under a nominal meaning-preservation objective.

Figure 7: Distinct-sentence counts under iterated round-trip translation for GPT-4o-mini (sampling-based decoding) and Google Translate (v3).

### 5.4 Distinction from training-time model collapse

[Shumailov et al. (2024)] describe _model collapse_ as a training-time phenomenon in which repeated optimization on model-generated data can reduce coverage of the original data distribution. Our setting is mechanistically distinct: we investigate _inference-time_ recursion under a fixed model, prompt, and decoding configuration, where an induced transformation operator is applied iteratively without any parameter updates.

Consequently, the behaviors we observe—including rapid convergence to fixed points or short cycles under greedy decoding and longer transients with sustained production of distinct realizations under sampling-based decoding—are attributable to properties of the induced transition kernel rather than to distributional contraction driven by learning. Moreover, at the sentence level, iterative reprocessing can preserve or even increase the diversity for certain inputs, in contrast to the diversity degradation typically emphasized in training-time collapse accounts.

## 6 Discussions and Conclusions

LLMs are progressively integrated into text-processing pipelines, where their outputs can be fed into subsequent steps, either within a single workflow or reused across users.

LLMs are frequently applied to tasks such as translation and rewriting. At the same time, sentence diversity does not imply semantic fidelity, as iterative reprocessing can introduce cumulative drift even under meaning-preserving prompts.

The _Markovian generation chains_ we define naturally arise in the real world, for instance through interactions among different LLM agents.

## Acknowledgments

This work benefited from funding from the French State, managed by the Agence Nationale de la Recherche, under the France 2030 program (grant reference ANR-23-IACL-0008).

## References

*   Arnon and Kirby (2024) I. Arnon and S. Kirby Cultural evolution creates the statistical structure of language. Scientific Reports 14 (1), pp. 5255. Cited by: [§2].
*   Banerjee and Lavie (2005) S. Banerjee and A. Lavie METEOR: an automatic metric for mt evaluation with improved correlation with human judgments. In Proceedings of the acl workshop on intrinsic and extrinsic evaluation measures for machine translation and/or summarization, pp. 65–72. Cited by: [3rd item].
*   Blevins et al. (2025) T. Blevins, S. Schmalwieser, and B. Roth Do language models accommodate their users? a study of linguistic convergence. arXiv preprint arXiv:2508.03276. Cited by: [§2].
*   Brinkmann et al. (2023) L. Brinkmann, F. Baumann, J. Bonnefon, M. Derex, T. F. Müller, A. Nussberger, A. Czaplicka, A. Acerbi, T. L. Griffiths, J. Henrich, et al. Machine culture. Nature Human Behaviour 7 (11), pp. 1855–1868. Cited by: [§2].
*   Burton et al. (2024) J. W. Burton, E. Lopez-Lopez, S. Hechtlinger, Z. Rahwan, S. Aeschbach, M. A. Bakker, J. A. Becker, A. Berditchevskaia, J. Berger, L. Brinkmann, et al. How large language models can reshape collective intelligence. Nature human behaviour 8 (9), pp. 1643–1655. Cited by: [§1].
*   Chang and McCallum (2022) H. Chang and A. McCallum Softmax bottleneck makes language models unable to represent multi-mode word distributions. In Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics, Vol. 1. Cited by: [Appendix A], [§2].
*   Chung et al. (2023) J. J. Y. Chung, E. Kamar, and S. Amershi Increasing diversity while maintaining accuracy: text data generation with large language models and human interventions. arXiv preprint arXiv:2306.04140. Cited by: [§2].
*   Dubey et al. (2024) A. Dubey, A. Jauhri, A. Pandey, A. Kadian, A. Al-Dahle, A. Letman, A. Mathur, A. Schelten, A. Yang, A. Fan, et al. The llama 3 herd of models. arXiv e-prints, pp. arXiv–2407. Cited by: [§4].
*   Fan et al. (2018) A. Fan, M. Lewis, and Y. Dauphin Hierarchical neural story generation. arXiv preprint arXiv:1805.04833. Cited by: [§2].
*   Geng et al. (2025) M. Geng, C. Chen, Y. Wu, Y. Wan, P. Zhou, and D. Chen The impact of large language models in academia: from writing to speaking. In Findings of the Association for Computational Linguistics: ACL 2025, pp. 19303–19319. Cited by: [§2].
*   Geng and Trotta (2025) M. Geng and R. Trotta Human-llm coevolution: evidence from academic writing. In Findings of the Association for Computational Linguistics: ACL 2025, pp. 12689–12696. Cited by: [§2].
*   Gerstgrasser et al. (2024) M. Gerstgrasser, R. Schaeffer, A. Dey, R. Rafailov, H. Sleight, J. Hughes, T. Korbak, R. Agrawal, D. Pai, A. Gromov, et al. Is model collapse inevitable? breaking the curse of recursion by accumulating real and synthetic data. arXiv preprint arXiv:2404.01413. Cited by: [§2].
*   Gloeckle et al. (2024) F. Gloeckle, B. Y. Idrissi, B. Rozière, D. Lopez-Paz, and G. Synnaeve Better & faster large language models via multi-token prediction. arXiv preprint arXiv:2404.19737. Cited by: [Appendix A].
*   Gorinski and Lapata (2015) P. Gorinski and M. Lapata Movie script summarization as graph-based scene extraction. In Proceedings of the 2015 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, pp. 1066–1076. Cited by: [§4].
*   Griffiths and Kalish (2007) T. L. Griffiths and M. L. Kalish Language evolution by iterated learning with bayesian agents. Cognitive science 31 (3), pp. 441–480. Cited by: [§2].
*   Guo et al. (2024) Y. Guo, G. Shang, and C. Clavel Benchmarking linguistic diversity of large language models. arXiv preprint arXiv:2412.10271. Cited by: [§2].
*   Guo et al. (2023) Y. Guo, G. Shang, M. Vazirgiannis, and C. Clavel The curious decline of linguistic diversity: training language models on synthetic text. arXiv preprint arXiv:2311.09807. Cited by: [§2].
*   Hamilton et al. (2016) W. L. Hamilton, J. Leskovec, and D. Jurafsky Diachronic word embeddings reveal statistical laws of semantic change. arXiv preprint arXiv:1605.09096. Cited by: [§2].
*   He and Lab (2025) H. He and T. M. Lab Defeating nondeterminism in llm inference. Thinking Machines Lab: Connectionism. Note: https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/ External Links: [Document] Cited by: [Appendix A], [§1].
*   Holtzman et al. (2019) A. Holtzman, J. Buys, L. Du, M. Forbes, and Y. Choi The curious case of neural text degeneration. arXiv preprint arXiv:1904.09751. Cited by: [Appendix A], [§2].
*   Huang et al. (2026) J. Y. Huang, L. Choshen, R. Astudillo, T. Broderick, and J. Andreas Do llms benefit from their own words?. arXiv preprint arXiv:2602.24287. Cited by: [§6].
*   Hurst et al. (2024) A. Hurst, A. Lerer, A. P. Goucher, A. Perelman, A. Ramesh, A. Clark, A. Ostrow, A. Welihinda, A. Hayes, A. Radford, et al. Gpt-4o system card. arXiv preprint arXiv:2410.21276. Cited by: [§4].
*   Jang et al. (2016) E. Jang, S. Gu, and B. Poole Categorical reparameterization with gumbel-softmax. arXiv preprint arXiv:1611.01144. Cited by: [Appendix A], [§1].
*   Jiang et al. (2023) A. Q. Jiang, A. Sablayrolles, A. Mensch, C. Bamford, D. S. Chaplot, D. d. l. Casas, F. Bressand, G. Lengyel, G. Lample, L. Saulnier, et al. Mistral 7b. arXiv preprint arXiv:2310.06825. Cited by: [§4].
*   Jiang et al. (2025) L. Jiang, Y. Chai, M. Li, M. Liu, R. Fok, N. Dziri, Y. Tsvetkov, M. Sap, A. Albalak, and Y. Choi Artificial hivemind: the open-ended homogeneity of language models (and beyond). arXiv preprint arXiv:2510.22954. Cited by: [§2].
*   Kandra et al. (2025) F. Kandra, V. Demberg, and A. Koller LLMs syntactically adapt their language use to their conversational partner. arXiv preprint arXiv:2503.07457. Cited by: [§2].
*   Kirby et al. (2007) S. Kirby, M. Dowman, and T. L. Griffiths Innateness and culture in the evolution of language. Proceedings of the National Academy of Sciences 104 (12), pp. 5241–5245. Cited by: [§2].
*   Kryściński et al. (2022) W. Kryściński, N. Rajani, D. Agarwal, C. Xiong, and D. Radev Booksum: a collection of datasets for long-form narrative summarization. In Findings of the association for computational linguistics: EMNLP 2022, pp. 6536–6558. Cited by: [§4].
*   Laban et al. (2025) P. Laban, H. Hayashi, Y. Zhou, and J. Neville Llms get lost in multi-turn conversation. arXiv preprint arXiv:2505.06120. Cited by: [§6].
*   Li et al. (2025) Y. Li, X. Shen, X. Yao, X. Ding, Y. Miao, R. Krishnan, and R. Padman Beyond single-turn: a survey on multi-turn interactions with large language models. arXiv preprint arXiv:2504.04717. Cited by: [§6].
*   Li et al. (2024) Y. Li, F. Guerin, and C. Lin Latesteval: addressing data contamination in language model evaluation through dynamic and time-sensitive test construction. In Proceedings of the AAAI Conference on Artificial Intelligence, Vol. 38, pp. 18600–18607. Cited by: [§4].
*   Lieberman et al. (2007) E. Lieberman, J. Michel, J. Jackson, T. Tang, and M. A. Nowak Quantifying the evolutionary dynamics of language. Nature 449 (7163), pp. 713–716. Cited by: [§2].
*   Lin (2004) C. Lin Rouge: a package for automatic evaluation of summaries. In Text summarization branches out, pp. 74–81. Cited by: [3rd item].
*   Mikhaylovskiy (2025) N. Mikhaylovskiy Zipf’s and heaps’ laws for tokens and llm-generated texts. In Findings of the Association for Computational Linguistics: EMNLP 2025, pp. 15469–15481. Cited by: [§2].
*   Mohamed et al. (2025) A. Mohamed, M. Geng, M. Vazirgiannis, and G. Shang Llm as a broken telephone: iterative generation distorts information. In Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pp. 7493–7509. Cited by: [§1], [§1], [§2].
*   Muñoz-Ortiz et al. (2024) A. Muñoz-Ortiz, C. Gómez-Rodríguez, and D. Vilares Contrasting linguistic patterns in human and llm-generated news text. Artificial Intelligence Review 57 (10), pp. 265. Cited by: [§2].
*   Padmakumar and He (2023) V. Padmakumar and H. He Does writing with language models reduce content diversity?. arXiv preprint arXiv:2309.05196. Cited by: [§2].
*   Papineni et al. (2002) K. Papineni, S. Roukos, T. Ward, and W. Zhu Bleu: a method for automatic evaluation of machine translation. In Proceedings of the 40th annual meeting of the Association for Computational Linguistics, pp. 311–318. Cited by: [3rd item].
*   Perez et al. (2025) J. Perez, G. Kovač, C. Léger, C. Colas, G. Molinaro, M. Derex, P. Oudeyer, and C. Moulin-Frier When llms play the telephone game: cultural attractors as conceptual tools to evaluate llms in multi-turn settings. In The Thirteenth International Conference on Learning Representations, Cited by: [§1], [§2].
*   Peterson (2025) A. J. Peterson AI and the problem of knowledge collapse. AI & SOCIETY, pp. 1–21. Cited by: [§2].
*   Schaeffer et al. (2025) R. Schaeffer, J. Kazdan, A. C. Arulandu, and S. Koyejo Position: model collapse does not mean what you think. arXiv preprint arXiv:2503.03150. Cited by: [§5.4].
*   Seddik et al. (2024) M. E. A. Seddik, S. Chen, S. Hayou, P. Youssef, and M. Debbah How bad is training on synthetic data? a statistical analysis of language model collapse. arXiv preprint arXiv:2404.05090. Cited by: [§2].
*   Shumailov et al. (2024) I. Shumailov, Z. Shumaylov, Y. Zhao, N. Papernot, R. Anderson, and Y. Gal AI models collapse when trained on recursively generated data. Nature 631 (8022), pp. 755–759. Cited by: [§2], [§5.4].
*   Smith et al. (2025) B. Smith, M. R. Bouadjenek, T. A. Kheya, P. Dawson, and S. Aryal A comprehensive analysis of large language model outputs: similarity, diversity, and bias. arXiv preprint arXiv:2505.09056. Cited by: [§2].
*   Teng et al. (2025) F. Teng, Q. Shi, Z. Yu, J. Zhang, Y. Luo, C. Wu, and Z. Guo Atom of thoughts for markov llm test-time scaling. arXiv preprint arXiv:2502.12018. Cited by: [§1].
*   Wright et al. (2025) D. Wright, S. Masud, J. Moore, S. Yadav, M. Antoniak, P. E. Christensen, C. Y. Park, and I. Augenstein Epistemic diversity and knowledge collapse in large language models. arXiv preprint arXiv:2510.04226. Cited by: [§2].
*   Xu et al. (2025) W. Xu, N. Jojic, S. Rao, C. Brockett, and B. Dolan Echoes in ai: quantifying lack of plot diversity in llm outputs. Proceedings of the National Academy of Sciences 122 (35), pp. e2504966122. Cited by: [§2].
*   Yakura et al. (2024) H. Yakura, E. Lopez-Lopez, L. Brinkmann, I. Serna, P. Gupta, I. Soraperra, and I. Rahwan Empirical evidence of large language model’s influence on human spoken communication. arXiv preprint arXiv:2409.01754. Cited by: [§2].
*   Yang et al. (2024) A. Yang, B. Yang, B. Hui, B. Zheng, B. Yu, C. Zhou, C. Li, C. Li, D. Liu, F. Huang, G. Dong, H. Wei, H. Lin, J. Tang, J. Wang, J. Yang, J. Tu, J. Zhang, J. Ma, J. Xu, J. Zhou, J. Bai, J. He, J. Lin, K. Dang, K. Lu, K. Chen, K. Yang, M. Li, M. Xue, N. Ni, P. Zhang, P. Wang, R. Peng, R. Men, R. Gao, R. Lin, S. Wang, S. Bai, S. Tan, T. Zhu, T. Li, T. Liu, W. Ge, X. Deng, X. Zhou, X. Ren, X. Zhang, X. Wei, X. Ren, Y. Fan, Y. Yao, Y. Zhang, Y. Wan, Y. Chu, Y. Liu, Z. Cui, Z. Zhang, and Z. Fan Qwen2 technical report. arXiv preprint arXiv:2407.10671. Cited by: [§4].
*   Zekri et al. (2024) O. Zekri, A. Odonnat, A. Benechehab, L. Bleistein, N. Boullé, and I. Redko Large language models as markov chains. arXiv preprint arXiv:2410.02724. Cited by: [§1].

## Appendix A Token-level stochasticity and decoding

Iterative trajectories depend on decoding-induced stochasticity ([Jang et al., 2016]), in addition to system-level nondeterminism ([He and Lab, 2025]).

|  | πτ​(wt′∣x,w<t′)=exp⁡(z⁡(wt′,x,w<t′)/τ)∑vexp⁡(z⁡(v,x,w<t′)/τ),\pi_{\tau}(w_{t^{\prime}}\mid x,w_{<t^{\prime}})\;=\;\frac{\exp(z(w_{t^{\prime}};x,w_{<t^{\prime}})/\tau)}{\sum_{v}\exp(z(v;x,w_{<t^{\prime}})/\tau)}\,, |  | (12) |
| --- | --- | --- | --- |

where larger τ\\tau typically increases randomness ([Holtzman et al., 2019]).

|  | Πτ(w1:n∣x)=∏t′=1nπτ(wt′∣x,w<t′).\Pi_{\tau}(w_{1:n}\mid x)=\prod_{{t^{\prime}}=1}^{n}\pi_{\tau}(w_{t^{\prime}}\mid x,w_{<t^{\prime}})\,. |  | (13) |
| --- | --- | --- | --- |

These token-level choices induce the sentence-level transition kernel in Eq. ([1]) and can compound under iteration.

## Appendix B Contraction of relative entropy

KL divergence is defined as,

|  | DK​L(X∥Y)=∑iXilog(XiYi).D_{KL}(X\\|Y)=\sum_{i}X_{i}\log\left(\frac{X_{i}}{Y_{i}}\right)\,. |  | (14) |
| --- | --- | --- | --- |

Similarly,

|  | DKL(X𝐏∥Y𝐏)=∑j(X𝐏)jlog((X​𝐏)j(Y​𝐏)j),D_{\mathrm{KL}}(X\mathbf{P}\\|Y\mathbf{P})=\sum_{j}(X\mathbf{P})_{j}\log\left(\frac{(X\mathbf{P})_{j}}{(Y\mathbf{P})_{j}}\right), |  | (15) |
| --- | --- | --- | --- |

where (X​𝐏)j\=∑iXi​Pi​j(X\\mathbf{P})\_{j}=\\sum\_{i}X\_{i}P\_{ij} and (Y​𝐏)j\=∑iYi​Pi​j(Y\\mathbf{P})\_{j}=\\sum\_{i}Y\_{i}P\_{ij}.

|  | (∑iXi​Pi​j)​log⁡∑iXi​Pi​j∑iYi​Pi​j≤∑iXi​Pi​j​log⁡Xi​Pi​jYi​Pi​j,\left(\sum_{i}X_{i}P_{ij}\right)\log\frac{\sum_{i}X_{i}P_{ij}}{\sum_{i}Y_{i}P_{ij}}\;\leq\;\sum_{i}X_{i}P_{ij}\log\frac{X_{i}P_{ij}}{Y_{i}P_{ij}}, |  | (16) |
| --- | --- | --- | --- |

with the convention that terms with Xi​Pi​j\=0X\_{i}P\_{ij}=0 contribute 00.

|  | DKL(X𝐏∥Y𝐏)\displaystyle D_{\mathrm{KL}}(X\mathbf{P}\\|Y\mathbf{P}) | ≤∑j∑iXi​Pi​j​log⁡Xi​Pi​jYi​Pi​j\displaystyle\leq\sum_{j}\sum_{i}X_{i}P_{ij}\log\frac{X_{i}P_{ij}}{Y_{i}P_{ij}} |  | (17) |
| --- | --- | --- | --- | --- |
|  |  | =∑iXi​log⁡XiYi​∑jPi​j.\displaystyle=\sum_{i}X_{i}\log\frac{X_{i}}{Y_{i}}\sum_{j}P_{ij}. |  | (18) |

Since 𝐏\\mathbf{P} is row-stochastic, ∑jPi​j\=1\\sum\_{j}P\_{ij}=1, hence

|  | DKL(X𝐏∥Y𝐏)≤DKL(X∥Y).D_{\mathrm{KL}}(X\mathbf{P}\\|Y\mathbf{P})\leq D_{\mathrm{KL}}(X\\|Y). |  | (19) |
| --- | --- | --- | --- |

## Appendix C Prompts

This section lists the prompt templates used in the main experiments and ablations. In all listings, {content} is replaced with the current input text at iteration tt, and {target\_lang} denotes the chosen bridge language for round-trip translation. Unless stated otherwise, the same template is reused across iterations.

##### Tasks.

Iterative rephrasing. For bridge language ℓ\\ell with prompts ρtr\\rho\_{\\mathrm{tr}}, one iteration applies 𝒯M,ρtr,dEN→ℓ→EN\\mathcal{T}^{\\text{EN}\\to\\ell\\to\\text{EN}}\_{M,\\rho\_{\\mathrm{tr}},d} (Eq.

|  | sEN(t)→EN→ℓuℓ(t)→ℓ→ENsEN(t+1).s^{(t)}_{\text{EN}}\xrightarrow{\text{EN}\to\ell}u^{(t)}_{\ell}\xrightarrow{\ell\to\text{EN}}s^{(t+1)}_{\text{EN}}. |  |
| --- | --- | --- |

##### Rephrasing prompts.

Listing [1] is the main meaning-preserving rephrasing template, and Listing [2] is a shorter ablation variant used in the prompt-sensitivity study.

Listing 1: Prompt for rephrasing

"Given a passage, rephrase it while preserving all the original meaning and without losing any context.\\n"

"Do not write an introduction or a summary.

"Rephrase the following text:\\n{content}"

Listing 2: Prompt for rephrasing (ablation)

"Rephrase the following text:\\n{content}"

##### Translation prompts.

For round-trip translation, we use direction-specific templates (EN→ℓ\\to\\ell and ℓ→\\ell\\toEN).

Listing 3: Prompt for translation

"Translate the following English text into {target\_lang}:"

"Translate the following {target\_lang} text into English:"

## Appendix D Additional Results

This section provides supplementary qualitative trajectories and full metric plots referenced in the main text. We include (i) iterative rephrasing examples under sampling, (ii) round-trip translation examples, (iii) similarity-metric trajectories for additional datasets/decoding regimes, and (iv) full length–diversity correlation outputs.

##### Iterative rephrasing under sampling.

Table [3] shows representative trajectories under sampling-based decoding (τ\=0.7\\tau=0.7, top-p\=0.9p=0.9), illustrating how some chains exhibit continued drift while others still enter short cycles.

Table 3: Examples of repeated rephrasing by different LLMs (temperature=0.7, top-p=0.9).

##### Iterated round-trip translation examples.

Tables [4] and [5] provide illustrative round-trip translation chains (EN→\\rightarrowFrench→\\rightarrowEN), highlighting early stabilization and occasional alternation between near-identical variants.

Table 4: Examples of iterative translation via GPT-4o-mini (temperature=0.7, top-p=0.9).

Table 5: Examples of iterative translation via GPT-4o-mini (temperature=0.7, top-p=0.9).

##### Similarity dynamics across iterations.

Figures [8] and [9] extend the greedy-decoding analysis to additional datasets.

Figure 8: Evolution of text similarity metrics across 50 rephrasing iterations for the News2024 dataset using greedy decoding. Each iteration compares the current rephrased text against the previous iteration’s text as reference.

Figure 9: Evolution of text similarity metrics across 50 rephrasing iterations for the ScriptBase dataset using greedy decoding.

Figure 10: Evolution of text similarity metrics across 50 rephrasing iterations for the BookSum dataset using sampling-based decoding.

Figure 11: Evolution of text similarity metrics across 50 rephrasing iterations for the News2024 dataset using sampling-based decoding.

Figure 12: Evolution of text similarity metrics across 50 rephrasing iterations for the ScriptBase dataset using sampling-based decoding.

##### Full length–diversity correlation results.

Table [6] reports Pearson correlations between seed length and diversity, along with pp\-values, linear-fit R2R^{2}, and slopes for each model/decoding setting and dataset.

Table 6: Results of the Correlation Analysis. rr represents the Pearson correlation coefficient, and R2R^{2} represents the coefficient of determination.

## Detailed

Amr Mohamed† Affiliation: MBZUAI & Ecole Polytechnique    Guokan Shang Affiliation: MBZUAI    Michalis Vazirgiannis Affiliation: MBZUAI & Ecole Polytechnique    Thierry Poibeau Affiliation: ENS-PSL & CNRS-Lattice

###### Abstract

The widespread use of large language models (LLMs) raises an important question: how do texts evolve when they are repeatedly processed by LLMs? In this paper, we define this iterative inference process as Markovian generation chains, where each step takes a specific prompt template and the previous output as input, without including any prior memory. In iterative rephrasing and round-trip translation experiments, the output either converges to a small recurrent set or continues to produce novel sentences over a finite horizon. Through sentence-level Markov chain modeling and analysis of simulated data, we show that iterative process can either increase or reduce sentence diversity depending on factors such as the temperature parameter and the initial input sentence. These results offer valuable insights into the dynamics of iterative LLM inference and their implications for multi-agent LLM systems.

$\\dagger$$\\dagger$footnotetext: Equal contribution.

## 1 Introduction

Large language models (LLMs) are used in a wide range of downstream tasks, such as translation and rewriting. As LLM-generated content becomes more prevalent, the likelihood that such content will be iteratively reprocessed increases. This motivates a practical but underexplored question: _how do texts evolve under repeated LLM reprocessing?_

We refer to this process as Markovian generation chains in LLMs: the input consists only of a specific prompt template and the output of the previous inference, without including any prior memory. Although such recursive reuse arises naturally in iterative translation and repeated rephrasing workflows ([Perez et al., 2025](https://arxiv.org/html/2603.11228v1#bib.bib8); [Mohamed et al., 2025](https://arxiv.org/html/2603.11228v1#bib.bib9)), it lacks a standard formalization and well-defined metrics for characterizing these outcomes.

We treat each _sentence_ as the primary unit of analysis and focus on the evolution in the iterative procedure, e.g., quantifying diversity based on how many _distinct sentences_ emerge over the repeated process. While LLM outputs are largely determined by the input, the model ([Jang et al., 2016](https://arxiv.org/html/2603.11228v1#bib.bib6)) and the hardware ([He and Lab, 2025](https://arxiv.org/html/2603.11228v1#bib.bib21)) may also introduce variation. Furthermore, although a one-to-one correspondence cannot be constructed at the token level, it becomes feasible at the sentence level. Therefore, at the sentence level, the iterative reprocessing procedure can be described using a Markov chain, differing from previous work that analyzes a single inference at the token level using Markov chains ([Zekri et al., 2024](https://arxiv.org/html/2603.11228v1#bib.bib13)). Markov chains have also been used in other studies on LLMs, such as the reasoning process ([Teng et al., 2025](https://arxiv.org/html/2603.11228v1#bib.bib45)).

The accumulation of random perturbations and systematic biases can lead to equilibrium, periodic behavior, divergence, or random walk. The prevalence of these behaviors depends on the model, the decoding configuration, and the seed input sentence; in particular, sampling-based decoding typically increases exploration and prolongs pre-recurrence phases. Figure [1](https://arxiv.org/html/2603.11228v1#S1.F1 "Figure 1 ‣ 1 Introduction ‣ Markovian Generation Chains in Large Language Models") provides an illustration of these behaviors under greedy versus sampling-based decoding.

Figure 1: Illustration of iterative LLM reprocessing (Markovian generation chains). Each node denotes the output after iteration ii. Under greedy decoding, chains typically enter fixed points or short cycles, limiting sentence-level diversity. Under sampling-based decoding, stochasticity may yield longer transients and more distinct outputs

These iterative dynamics matter beyond controlled settings because LLM-mediated text can propagate through downstream communication and decision pipelines. Prior work suggests that LLMs may reshape collective intelligence ([Burton et al., 2024](https://arxiv.org/html/2603.11228v1#bib.bib5)), and that repeated generation can introduce information distortion even when prompts request meaning preservation ([Mohamed et al., 2025](https://arxiv.org/html/2603.11228v1#bib.bib9)). In our experiments, text produced by an LLM via paraphrasing or translation is recursively reused as input, approximating multi-step and multi-user reprocessing workflows in the real world. The sentence-level framing supports a natural mapping between an input sentence and the set of plausible output sentences, and it could be extended to paragraph-level simulations as an ablation.

## 2 Related Work

##### Model collapse and iterative generation.

A growing line of work studies _model collapse_, where iteratively training on synthetic data can degrade coverage of the underlying data distribution ([Shumailov et al., 2024](https://arxiv.org/html/2603.11228v1#bib.bib1); [Guo et al., 2023](https://arxiv.org/html/2603.11228v1#bib.bib10)). Follow-up studies analyze when collapse arises and propose mitigations such as mixing real and synthetic data or other data curation strategies ([Gerstgrasser et al., 2024](https://arxiv.org/html/2603.11228v1#bib.bib11); [Seddik et al., 2024](https://arxiv.org/html/2603.11228v1#bib.bib30)), with broader concerns about downstream “knowledge collapse” in information ecosystems ([Peterson, 2025](https://arxiv.org/html/2603.11228v1#bib.bib7); [Wright et al., 2025](https://arxiv.org/html/2603.11228v1#bib.bib47)). Repeated LLM use can also form multi-step transformation chains (e.g., iterated paraphrasing or round-trip translation) that accumulate changes across calls, with observed distortion ([Perez et al., 2025](https://arxiv.org/html/2603.11228v1#bib.bib8); [Mohamed et al., 2025](https://arxiv.org/html/2603.11228v1#bib.bib9)).

##### Sampling and diversity in LLM-generated content.

Sampling methods derived from the softmax distribution, including top-kk ([Fan et al., 2018](https://arxiv.org/html/2603.11228v1#bib.bib19)), top-pp ([Holtzman et al., 2019](https://arxiv.org/html/2603.11228v1#bib.bib22)), and temperature-based sampling or logit suppression ([Chung et al., 2023](https://arxiv.org/html/2603.11228v1#bib.bib25)), induce controlled randomness in generation, despite known limitations of softmax-based sampling in certain regimes ([Chang and McCallum, 2022](https://arxiv.org/html/2603.11228v1#bib.bib20)). Moreover, architectural and distributional constraints impose statistical regularities on outputs ([Mikhaylovskiy, 2025](https://arxiv.org/html/2603.11228v1#bib.bib44)). A substantial body of work studies stylistic and diversity differences between LLM-generated and human-written text ([Muñoz-Ortiz et al., 2024](https://arxiv.org/html/2603.11228v1#bib.bib42)). Several studies suggest that LLM-assisted generation can reduce downstream diversity, including in creative settings ([Padmakumar and He, 2023](https://arxiv.org/html/2603.11228v1#bib.bib24); [Xu et al., 2025](https://arxiv.org/html/2603.11228v1#bib.bib29); [Jiang et al., 2025](https://arxiv.org/html/2603.11228v1#bib.bib40)). Most evaluations of LLM-generated content emphasize token-, phrase-, or corpus-level statistics ([Chung et al., 2023](https://arxiv.org/html/2603.11228v1#bib.bib25); [Guo et al., 2024](https://arxiv.org/html/2603.11228v1#bib.bib3); [Smith et al., 2025](https://arxiv.org/html/2603.11228v1#bib.bib41)), sentence-level variation is a natural granularity for iterative rewriting and translation pipelines, providing a transparent and interpretable complement to existing metrics.

##### Language change and convergence in human–LLM interaction.

Our work also relates to research on language change and cultural transmission ([Lieberman et al., 2007](https://arxiv.org/html/2603.11228v1#bib.bib38); [Kirby et al., 2007](https://arxiv.org/html/2603.11228v1#bib.bib43); [Griffiths and Kalish, 2007](https://arxiv.org/html/2603.11228v1#bib.bib2); [Hamilton et al., 2016](https://arxiv.org/html/2603.11228v1#bib.bib39)) and to studies of machine-mediated communication ([Brinkmann et al., 2023](https://arxiv.org/html/2603.11228v1#bib.bib4); [Arnon and Kirby, 2024](https://arxiv.org/html/2603.11228v1#bib.bib46)). In interaction settings, LLMs adapt to conversational partners ([Kandra et al., 2025](https://arxiv.org/html/2603.11228v1#bib.bib15); [Blevins et al., 2025](https://arxiv.org/html/2603.11228v1#bib.bib14)). Users may learn and converge toward model language patterns over time ([Yakura et al., 2024](https://arxiv.org/html/2603.11228v1#bib.bib16); [Geng et al., 2025](https://arxiv.org/html/2603.11228v1#bib.bib17)), and even more complex interaction dynamics have also been observed ([Geng and Trotta, 2025](https://arxiv.org/html/2603.11228v1#bib.bib18)). We contribute an inference-time mechanism, iterative reprocessing under a fixed prompting setup, that provides a controlled lens on repeated reuse in these settings.

## 3 Methodology

This section formalizes iterative processes as Markovian generation chains and introduces the tools used to analyze the empirical regimes in our experiments.

### 3.1 Iterative reprocessing as a Markovian generation chain

Let s(0)s^{(0)} denote an initial _sentence_. Fix (i) a model MM, (ii) a prompt template ρ\\rho, and (iii) a decoding configuration dd (e.g., greedy decoding, or sampling-based decoding with specified temperature/top-pp). One step of iterative reprocessing defines a stochastic transformation operator 𝒯M,ρ,d\\mathcal{T}\_{M,\\rho,d} that maps the text-unit surface string to a distribution over surface strings:

|  | s(t+1)∼𝒯M,ρ,d(⋅∣s(t)),t=0,1,…,T−1.s^{(t+1)}\sim\mathcal{T}_{M,\rho,d}(\,\cdot\mid s^{(t)}),\qquad t=0,1,\dots,T-1. |  | (1) |
| --- | --- | --- | --- |

Equivalently, 𝒯M,ρ,d\\mathcal{T}\_{M,\\rho,d} defines a time-homogeneous Markov kernel PM,ρ,d​(s′∣s)P\_{M,\\rho,d}(s^{\\prime}\\mid s) over sentences. We restrict the state space to single-sentence strings by requiring each iteration to output exactly one sentence. Further details are explained in Appendix [A](https://arxiv.org/html/2603.11228v1#A1 "Appendix A Token-level stochasticity and decoding ‣ Markovian Generation Chains in Large Language Models").

##### Operational Markovian assumption.

Iterations are independent model calls conditioned only on ρ\\rho and s(t)s^{(t)}; no history, memory, or latent state is carried between steps. Thus {s(t)}t\=0T\\{s^{(t)}\\}\_{t=0}^{T} is Markovian, with any system nondeterminism absorbed into PM,ρ,dP\_{M,\\rho,d}.

##### Structured operators via composition.

A single iteration can be written as a composition of prompted calls. For round-trip translation with bridge language ℓ\\ell, one iteration composes two translations (EN→ℓ\\to\\ell then ℓ→\\ell\\toEN). Let 𝒯M,ρ,dEN→ℓ\\mathcal{T}^{\\text{EN}\\to\\ell}\_{M,\\rho,d} and 𝒯M,ρ,dℓ→EN\\mathcal{T}^{\\ell\\to\\text{EN}}\_{M,\\rho,d} denote the induced operators for each direction under the same fixed setup. The resulting EN\-to-EN two-step operator is

|  | 𝒯M,ρ,dEN→ℓ→EN:=𝒯M,ρ,dℓ→EN∘𝒯M,ρ,dEN→ℓ,\mathcal{T}^{\text{EN}\to\ell\to\text{EN}}_{M,\rho,d}\;:=\;\mathcal{T}^{\ell\to\text{EN}}_{M,\rho,d}\circ\mathcal{T}^{\text{EN}\to\ell}_{M,\rho,d}, |  | (2) |
| --- | --- | --- | --- |

which induces a Markov chain on English sentences. At the kernel level, this composition corresponds to the standard product of Markov kernels:

|  | PM,ρ,dEN→ℓ→EN​(s′∣s)=∑u∈𝒮ℓPM,ρ,dℓ→EN​(s′∣u)​PM,ρ,dEN→ℓ​(u∣s),P^{\text{EN}\to\ell\to\text{EN}}_{M,\rho,d}(s^{\prime}\mid s)=\sum_{u\in\mathcal{S}_{\ell}}P^{\ell\to\text{EN}}_{M,\rho,d}(s^{\prime}\mid u)\,P^{\text{EN}\to\ell}_{M,\rho,d}(u\mid s), |  | (3) |
| --- | --- | --- | --- |

where 𝒮ℓ\\mathcal{S}\_{\\ell} denotes the (conceptual) state space of sentences in language ℓ\\ell.

### 3.2 Sentence-level Markov chain formulation

We model iterative reprocessing at the _sentence_ level, treating sentence strings as discrete states and the prompted model as a transition operator. For conceptual clarity, we consider finite (but extremely large) state spaces.

##### State spaces.

For translation between languages lAl\_{A} and lBl\_{B}, let 𝒮A\={a1,…,am},𝒮B\={b1,…,bn}\\mathcal{S}\_{A}=\\{a\_{1},\\ldots,a\_{m}\\},\\ \\mathcal{S}\_{B}=\\{b\_{1},\\ldots,b\_{n}\\}. For rephrasing, the chain remains within a single language, i.e., 𝒮A→𝒮A\\mathcal{S}\_{A}\\to\\mathcal{S}\_{A}.

##### Transition matrices.

Fix (M,ρ,d)(M,\\rho,d). For translation from lAl\_{A} to lBl\_{B}, define the sentence-level transition matrix

|  | [𝐏M,ρ,dA→B]i​j:=Pr⁡(bj∣ai;M,ρ,d)=PM,ρ,dA→B​(bj∣ai).[\mathbf{P}^{A\to B}_{M,\rho,d}]_{ij}\;:=\;\Pr\!\left(b_{j}\mid a_{i};\,M,\rho,d\right)\;=\;P^{A\to B}_{M,\rho,d}(b_{j}\mid a_{i}). |  | (4) |
| --- | --- | --- | --- |

For round-trip translation lA→lB→lAl\_{A}\\to l\_{B}\\to l\_{A}, the induced within-𝒮A\\mathcal{S}\_{A} transition matrix is the product

|  | 𝐏M,ρ,dA→B→A=𝐏M,ρ,dA→B​𝐏M,ρ,dB→A,\mathbf{P}^{A\to B\to A}_{M,\rho,d}=\mathbf{P}^{A\to B}_{M,\rho,d}\,\mathbf{P}^{B\to A}_{M,\rho,d}, |  | (5) |
| --- | --- | --- | --- |

mirroring the kernel composition in Eq. ([3](https://arxiv.org/html/2603.11228v1#S3.E3 "In Structured operators via composition. ‣ 3.1 Iterative reprocessing as a Markovian generation chain ‣ 3 Methodology ‣ Markovian Generation Chains in Large Language Models")). If X(0)X^{(0)} denotes an initial distribution over 𝒮A\\mathcal{S}\_{A} represented as a row vector, then after nn iterations

|  | X(n)=X(0)​(𝐏M,ρ,dA→B→A)n.X^{(n)}=X^{(0)}\left(\mathbf{P}^{A\to B\to A}_{M,\rho,d}\right)^{n}. |  | (6) |
| --- | --- | --- | --- |

For iterative rephrasing, we use the analogous within-language matrix 𝐏M,ρ,d\\mathbf{P}\_{M,\\rho,d} on 𝒮A\\mathcal{S}\_{A}.

### 3.3 Regimes under iteration: recurrent classes and transients

Empirically, iterative reprocessing exhibits two finite-horizon behaviors: (i) _early exact recurrence_ (a fixed point or short cycle) and (ii) _long pre-recurrence phases_ (continued production of novel surface forms within the iteration budget). We characterize these regimes using finite-horizon recurrence statistics computed on exact string equality.

##### Asymptotic structure (conceptual).

For a finite state space, 𝐏\\mathbf{P} can be permuted into the standard block form with recurrent classes {Ci}\\{C\_{i}\\} and a transient block 𝐏tr\\mathbf{P}\_{\\mathrm{tr}} (Eq. [7](https://arxiv.org/html/2603.11228v1#S3.E7 "In Asymptotic structure (conceptual). ‣ 3.3 Regimes under iteration: recurrent classes and transients ‣ 3 Methodology ‣ Markovian Generation Chains in Large Language Models")); early recurrence corresponds to fast entry into a small recurrent class, while long pre-recurrence corresponds to trajectories that remain in transient regions over the finite horizon.

|  | 𝐏=[𝐏1𝟎⋯𝟎𝟎𝟎𝐏2⋯𝟎𝟎⋱𝟎𝟎⋯𝐏c𝟎𝐐1𝐐2⋯𝐐c𝐏tr],\mathbf{P}=\begin{bmatrix}\mathbf{P}_{1}&\mathbf{0}&\cdots&\mathbf{0}&\mathbf{0}\\ \mathbf{0}&\mathbf{P}_{2}&\cdots&\mathbf{0}&\mathbf{0}\\ \vdots&\vdots&\ddots&\vdots&\vdots\\ \mathbf{0}&\mathbf{0}&\cdots&\mathbf{P}_{c}&\mathbf{0}\\ \mathbf{Q}_{1}&\mathbf{Q}_{2}&\cdots&\mathbf{Q}_{c}&\mathbf{P}_{\mathrm{tr}}\end{bmatrix}\!, |  | (7) |
| --- | --- | --- | --- |

where 𝐏i\\mathbf{P}\_{i} governs motion within CiC\_{i}, 𝐐i\\mathbf{Q}\_{i} captures transitions from transient states into CiC\_{i}, and 𝐏tr\\mathbf{P}\_{\\mathrm{tr}} governs transient-to-transient motion. In extremely large sentence state spaces, these sets are primarily a conceptual aid: empirical trajectories are finite, and the chain may not exhibit observable recurrence within the chosen horizon.

##### Finite-horizon recurrence statistics.

We treat “exact” equality as literal string equality on model outputs. Given a trajectory {s(t)}t\=0T\\{s^{(t)}\\}\_{t=0}^{T}, the first recurrence time is

|  | τT=min⁡{t∈{1,…,T}:∃j<t​ such that ​s(t)=s(j)},\tau_{T}\;=\;\min\{t\in\{1,\dots,T\}:\exists j<t\text{ such that }s^{(t)}=s^{(j)}\}, |  | (8) |
| --- | --- | --- | --- |

with τT\=T+1\\tau\_{T}=T+1 if no exact repeat occurs within the horizon. Small τT\\tau\_{T} corresponds to early entry into a fixed point or short cycle; large τT\\tau\_{T} (or T+1T+1) corresponds to a long pre-recurrence phase within TT steps.

##### Effect of decoding on pre-recurrence behavior.

Decoding controls inside dd (e.g., temperature/top-pp) affect 𝐏\\mathbf{P} by redistributing transition mass. Sampling-based decoding typically increases probability assigned to lower-ranked continuations, enlarging the set of accessible next-step realizations and thereby increasing τT\\tau\_{T} on average, i.e., prolonging pre-recurrence phases relative to greedy decoding.

### 3.4 Information-theoretic tools for iterative reprocessing

We record three standard properties of the induced kernel 𝐏\\mathbf{P}—entropy behavior, Kullback-Leibler (KL) contraction, and mixture bounds—that help interpret diversity and stabilization under iteration.

##### Entropy under doubly stochastic kernels.

Let XX be a distribution over sentences and 𝐏\\mathbf{P} a row-stochastic transition matrix (the kernel induced by (M,ρ,d)(M,\\rho,d)). The sentence entropy is

|  | H(X)=−∑sX(s)logX(s).\mathrm{H}(X)=-\sum_{s}X(s)\log X(s)\,. |  | (9) |
| --- | --- | --- | --- |

If 𝐏\\mathbf{P} is doubly stochastic, then H⁡(X​𝐏)≥H⁡(X)\\mathrm{H}(X\\mathbf{P})\\geq\\mathrm{H}(X); otherwise (as for prompted LLM kernels) entropy may increase or decrease depending on XX and 𝐏\\mathbf{P}.

##### Data processing and KL contraction.

For distributions X,YX,Y over sentences, KL divergence contracts under a stochastic matrix:

|  | DKL(X𝐏∥Y𝐏)≤DKL(X∥Y),D_{\mathrm{KL}}(X\mathbf{P}\,\\|\,Y\mathbf{P})\leq D_{\mathrm{KL}}(X\,\\|\,Y)\,, |  | (10) |
| --- | --- | --- | --- |

Proof in Appendix [B](https://arxiv.org/html/2603.11228v1#A2 "Appendix B Contraction of relative entropy ‣ Markovian Generation Chains in Large Language Models"). If π\\pi is stationary (π​𝐏\=π\\pi\\mathbf{P}=\\pi), then DKL(X𝐏n∥π)D\_{\\mathrm{KL}}(X\\mathbf{P}^{n}\\|\\pi) is non-increasing in nn, formalizing stabilization under repeated application of the same kernel.

##### Mixtures of original and reprocessed text.

To reflect settings where original and model-processed text coexist, consider the mixture Y\=b​X+(1−b)​X​𝐏Y=bX+(1-b)X\\mathbf{P} for b∈\[0,1\]b\\in\[0,1\]. Then

|  | b​H​(X)+(1−b)​H​(X​𝐏)≤H⁡(Y)≤b​H​(X)+(1−b)​H​(X​𝐏)+h⁡(b),b\,\mathrm{H}(X)+(1-b)\,\mathrm{H}(X\mathbf{P})\leq\mathrm{H}(Y)\leq b\,\mathrm{H}(X)+(1-b)\,\mathrm{H}(X\mathbf{P})+h(b), |  | (11) |
| --- | --- | --- | --- |

where h⁡(b)\=−b​log⁡b−(1−b)​log⁡(1−b)h(b)=-b\\log b-(1-b)\\log(1-b) is the binary entropy. Thus, mixing bounds the uncertainty of the combined distribution while still allowing iteration to increase or decrease entropy depending on the induced kernel.

### 3.5 Measurement and evaluations

We used the following methods for measurement and evaluation:

*   •
    
    _Distinct-sentence count:_ U\=|{c⁡(s(t)):0≤t≤T}|U=\\left|\\{c(s^{(t)}):0\\leq t\\leq T\\}\\right|.
    
*   •
    
    _First recurrence time:_ defined in Eq. [8](https://arxiv.org/html/2603.11228v1#S3.E8 "In Finite-horizon recurrence statistics. ‣ 3.3 Regimes under iteration: recurrent classes and transients ‣ 3 Methodology ‣ Markovian Generation Chains in Large Language Models").
    
*   •
    
    _Drift:_ METEOR ([Banerjee and Lavie, 2005](https://arxiv.org/html/2603.11228v1#bib.bib32)), ROUGE-1 ([Lin, 2004](https://arxiv.org/html/2603.11228v1#bib.bib33)), BLEU ([Papineni et al., 2002](https://arxiv.org/html/2603.11228v1#bib.bib31)), and TF–IDF cosine (2–4 grams), computed stepwise (s(t)s^{(t)} vs. s(t−1)s^{(t-1)}) and cumulative (s(t)s^{(t)} vs. s(0)s^{(0)}).
    
*   •
    
    _Input sensitivity:_ correlation of seed length with UU (Pearson rr and linear regression).
    

## 4 Experimental Setup

##### Data

We use three corpora spanning distinct domains: BookSum ([Kryściński et al., 2022](https://arxiv.org/html/2603.11228v1#bib.bib26)), ScriptBase-alpha ([Gorinski and Lapata, 2015](https://arxiv.org/html/2603.11228v1#bib.bib27)), and (BBC) News2024 ([Li et al., 2024](https://arxiv.org/html/2603.11228v1#bib.bib28)). From each dataset, we randomly sample 150 documents and extract the first sentence as the seed s(0)s^{(0)}.

##### Models and baselines.

We evaluate instruction-tuned open-weight models: Mistral-7B-Instruct ([Jiang et al., 2023](https://arxiv.org/html/2603.11228v1#bib.bib35)), Llama-3.1-8B-Instruct ([Dubey et al., 2024](https://arxiv.org/html/2603.11228v1#bib.bib34)), and Qwen2.5-7B-Instruct ([Yang et al., 2024](https://arxiv.org/html/2603.11228v1#bib.bib36)). We also include GPT-4o-mini ([Hurst et al., 2024](https://arxiv.org/html/2603.11228v1#bib.bib37)) via API. For round-trip translation, we compare prompted LLM translation to Google Translate (v3) (API), a near-deterministic production MT baseline for fixed inputs.

##### Decoding configurations and prompts.

We compare two decoding regimes. Under greedy decoding, tokens are selected by argmax at each step, close to a deterministic mapping. Under sampling-based decoding, we sample with fixed hyperparameters for comparability (unless otherwise stated, τ\=0.7\\tau=0.7, top-p\=0.9p=0.9). When the stack exposes an explicit random seed, we fix it per chain; otherwise (e.g., APIs) we treat each chain as a stochastic realization and aggregate over many runs. We use ρreph\\rho\_{\\mathrm{reph}} for rephrasing and ρtr\\rho\_{\\mathrm{tr}} for each translation direction. Full templates (including alternation variants) are in Appendix [C](https://arxiv.org/html/2603.11228v1#A3 "Appendix C Prompts ‣ Markovian Generation Chains in Large Language Models").

## 5 Results

### 5.1 Main Results and Findings

Table 1: Illustrative greedy-decoding trajectories under iterative rephrasing. Qwen2.5-7B enters a 2-cycle after one step, while Llama-3.1-8B alternates between two near-paraphrases with different lexical realizations.

Figure 2: Average number of unique paraphrases generated over 50 iterative rephrasings across three datasets, comparing four instruction-tuned LLMs: GPT-4o-mini, Llama-3.1-8B, Mistral-7B, and Qwen-2.5-7B. Results are shown for greedy decoding (orange) and sampling-based decoding (purple). Error bars represent one standard deviation.

Figure 3: Evolution of text similarity metrics across 50 rephrasing iterations for the BookSum dataset using greedy decoding. Each iteration compares the current rephrased text against the previous iteration’s text as reference.

Table [1](https://arxiv.org/html/2603.11228v1#S5.T1 "Table 1 ‣ 5.1 Main Results and Findings ‣ 5 Results ‣ Markovian Generation Chains in Large Language Models") provides an illustrative greedy-decoding trajectory and Figure [2](https://arxiv.org/html/2603.11228v1#S5.F2 "Figure 2 ‣ 5.1 Main Results and Findings ‣ 5 Results ‣ Markovian Generation Chains in Large Language Models") reports sentence-level diversity over T\=50T{=}50 iterations across datasets and models. Under greedy decoding, trajectories typically enter small recurrent sets (fixed points or short cycles) after few steps, yielding repeated surface strings or short alternations among near-paraphrases. The observed cycle structure and lexical realizations vary by model, indicating model-specific attractors under a fixed prompting setup. For sampling-based decoding, trajectories exhibit longer pre-recurrence phases and a non-trivial fraction of chains show no exact repetition within T\=50T{=}50 (Appendix Table [3](https://arxiv.org/html/2603.11228v1#A4.T3 "Table 3 ‣ Iterative rephrasing under sampling. ‣ Appendix D Additional Results ‣ Markovian Generation Chains in Large Language Models")). Across all datasets, greedy decoding produces substantially fewer unique paraphrases, consistent with rapid entry into recurrent behavior. Sampling yields markedly larger support sizes with substantial heterogeneity across models and domains, suggesting that both the induced kernel (model/decoding) and the seed distribution modulate time-to-recurrence within the finite horizon.

To characterize local dynamics along trajectories, we compute METEOR, ROUGE-1, and BLEU between successive iterations (s(t)s^{(t)} vs. s(t−1)s^{(t-1)}). Under greedy decoding, these stepwise similarity scores rapidly plateau (Figure [3](https://arxiv.org/html/2603.11228v1#S5.F3 "Figure 3 ‣ 5.1 Main Results and Findings ‣ 5 Results ‣ Markovian Generation Chains in Large Language Models"); Appendix Figures [8](https://arxiv.org/html/2603.11228v1#A4.F8 "Figure 8 ‣ Similarity dynamics across iterations. ‣ Appendix D Additional Results ‣ Markovian Generation Chains in Large Language Models") and [9](https://arxiv.org/html/2603.11228v1#A4.F9 "Figure 9 ‣ Similarity dynamics across iterations. ‣ Appendix D Additional Results ‣ Markovian Generation Chains in Large Language Models")), consistent with confinement to a small recurrent set rather than continued exploration. Differences in plateau levels across models reflect variation in the lexical distance between recurrent paraphrase variants despite comparable semantic content.

### 5.2 Parameters and Inputs

The behavior of iterative reprocessing depends on both the _decoding configuration_ and the _initial input_. Increasing the temperature generally flattens the distribution and increases the probability of selecting lower-ranked tokens, thereby expanding the set of plausible continuations. Supplementary results in Appendix Figures [10](https://arxiv.org/html/2603.11228v1#A4.F10 "Figure 10 ‣ Similarity dynamics across iterations. ‣ Appendix D Additional Results ‣ Markovian Generation Chains in Large Language Models")–[12](https://arxiv.org/html/2603.11228v1#A4.F12 "Figure 12 ‣ Similarity dynamics across iterations. ‣ Appendix D Additional Results ‣ Markovian Generation Chains in Large Language Models") indicate that higher-temperature settings tend to delay or prevent rapid entry into small recurrent sets, yielding longer transients with fewer exact repetitions.

The initial input affects the size of the accessible paraphrastic neighborhood and thus the diversity observed along an iterative chain. Table [4](https://arxiv.org/html/2603.11228v1#S5.F4.fig1 "Figure 4 ‣ 5.2 Parameters and Inputs ‣ 5 Results ‣ Markovian Generation Chains in Large Language Models") reports the association between seed length (words) and sentence-level diversity (the number of distinct outputs over T\=50T=50 iterations) across models, decoding regimes, and datasets. Correlations are generally positive but heterogeneous: sampling often amplifies the effect (notably on BookSum and News2024), while ScriptBase is weaker or inconsistent. Full correlation and regression results are given in Appendix [D](https://arxiv.org/html/2603.11228v1#A4 "Appendix D Additional Results ‣ Markovian Generation Chains in Large Language Models") (Table [6](https://arxiv.org/html/2603.11228v1#A4.T6 "Table 6 ‣ Full length–diversity correlation results. ‣ Appendix D Additional Results ‣ Markovian Generation Chains in Large Language Models")).

  

Figure 4: Pearson correlation rr between seed length (words) and the number of distinct outputs over T\=50T=50 iterations.

### 5.3 Ablations

We perform a set of ablation studies to evaluate the robustness of the observed iterative regimes and to identify which elements of the chain specification most strongly affect recurrence and output diversity. Specifically, we vary: (i) the prompt template, (ii) prompt heterogeneity across iterations, (iii) the granularity of the input unit (sentences vs. paragraphs), and (iv) the task instantiation via round-trip translation.

#### 5.3.1 Sensitivity to prompt specification and prompt heterogeneity

We first assess the sensitivity of iterative rephrasing dynamics to the prompt template. Using GPT-4o-mini as a representative model, we compare two prompt variants (P1 and P2; Listings [1](https://arxiv.org/html/2603.11228v1#LST1 "Listing 1 ‣ Rephrasing prompts. ‣ Appendix C Prompts ‣ Markovian Generation Chains in Large Language Models") and [2](https://arxiv.org/html/2603.11228v1#LST2 "Listing 2 ‣ Rephrasing prompts. ‣ Appendix C Prompts ‣ Markovian Generation Chains in Large Language Models")). As shown in Figure [5](https://arxiv.org/html/2603.11228v1#S5.F5 "Figure 5 ‣ 5.3.1 Sensitivity to prompt specification and prompt heterogeneity ‣ 5.3 Ablations ‣ 5 Results ‣ Markovian Generation Chains in Large Language Models"), the decoding regime is the primary driver within this prompt range: sampling-based decoding consistently yields a substantially larger number of distinct sentence realizations than greedy decoding, whereas the prompt variation induces comparatively smaller changes. For the prompts considered here, the induced operator is not altered sufficiently to dominate recurrence behavior largely determined by decoding.

To better approximate heterogeneous real-world pipelines, we next introduce prompt heterogeneity across iterations by alternating prompts. This setting remains _Markovian_ at the sentence level, but the kernel becomes _time-inhomogeneous_: iteration tt uses PM,ρt,d(t)P^{(t)}\_{M,\\rho\_{t},d} rather than a single fixed PM,ρ,dP\_{M,\\rho,d}. Equivalently, the process can be cast as a time-homogeneous Markov chain on an augmented state space (s,k)(s,k) where kk indexes the active prompt (or prompt schedule). Figure [6](https://arxiv.org/html/2603.11228v1#S5.F6 "Figure 6 ‣ 5.3.1 Sensitivity to prompt specification and prompt heterogeneity ‣ 5.3 Ablations ‣ 5 Results ‣ Markovian Generation Chains in Large Language Models") shows that prompt alternation increases the number of distinct outputs relative to a single fixed prompt under the same sampling-based configuration, but does not eliminate exact recurrences: some sentences still reappear across iterations. Round-trip translation can be interpreted as a structured instance of such heterogeneity, since each iteration composes distinct directional mappings (EN→ℓ\\rightarrow\\ell and ℓ→\\ell\\rightarrowEN).

Figure 5: Number of distinct sentences produced over 50 iterative rephrasings with GPT-4o-mini under different settings. P1 and P2 correspond to Listings [1](https://arxiv.org/html/2603.11228v1#LST1 "Listing 1 ‣ Rephrasing prompts. ‣ Appendix C Prompts ‣ Markovian Generation Chains in Large Language Models") and [2](https://arxiv.org/html/2603.11228v1#LST2 "Listing 2 ‣ Rephrasing prompts. ‣ Appendix C Prompts ‣ Markovian Generation Chains in Large Language Models") in the Appendix. Boxes denote the interquartile range, and the center line indicates the median.

Figure 6: Prompt heterogeneity across iterations (GPT-4o-mini, sampling-based decoding). We compare a single fixed prompt against alternating prompts, and a mixed variant constructed from prompt halves.

#### 5.3.2 Beyond single sentences: paragraph-level iterative reprocessing

Our primary experiments model the chain state at the sentence level. To examine whether analogous recurrence phenomena persist at larger granularities, we additionally run paragraph-level simulations on 450 paragraph seeds (150 per dataset), using GPT-4o-mini with temperature 0.70.7 and top-pp 0.90.9 for T\=50T=50 transitions. Exact recurrence at the paragraph level—i.e., verbatim repetition of the full multi-sentence input—is uncommon within this horizon. However, recurrence remains pronounced at the sentence level: when we segment each paragraph output into sentences, individual sentence forms can reappear frequently across iterations, indicating that local attractor-like behavior can persist even when the state comprises multiple sentences.

To quantify exploration at this granularity, we compute a _normalized diversity ratio_: the number of distinct sentence realizations observed over the iterative trajectory divided by the number of sentences in the original paragraph. Over 50 iterations, this ratio is 26.7 for BookSum, 19.7 for ScriptBase-alpha, and 24.2 for News2024, indicating that iterative paragraph-level reprocessing can generate substantial sentence-level variation even when full-paragraph exact recurrence is rare.

Table 2: Highest recurrence frequency observed sentences within the 50-iteration paragraph-level runs (GPT-4o-mini, sampling-based decoding, prompt P1) on 150 BookSum paragraphs.

#### 5.3.3 Round-trip translation and comparison to a production MT service

We additionally instantiate iterative reprocessing through round-trip translation (EN→ℓ→\\rightarrow\\ell\\rightarrowEN). Appendix Tables [4](https://arxiv.org/html/2603.11228v1#A4.T4 "Table 4 ‣ Iterated round-trip translation examples. ‣ Appendix D Additional Results ‣ Markovian Generation Chains in Large Language Models") and [5](https://arxiv.org/html/2603.11228v1#A4.T5 "Table 5 ‣ Iterated round-trip translation examples. ‣ Appendix D Additional Results ‣ Markovian Generation Chains in Large Language Models") provide qualitative examples of two representative finite-horizon behaviors: early entry into a fixed point and oscillation among a small set of closely related variants.

We evaluate multiple bridge languages and compare sampling-based LLM translation with Google Translate (v3) as a production machine translation service baseline. Figure [7](https://arxiv.org/html/2603.11228v1#S5.F7 "Figure 7 ‣ 5.3.3 Round-trip translation and comparison to a production MT service ‣ 5.3 Ablations ‣ 5 Results ‣ Markovian Generation Chains in Large Language Models") reports distinct-sentence counts under iterated round-trip translation for GPT-4o-mini and Google Translate (v3). Unlike prompted LLM translation, which can exhibit substantial stochastic variation under sampling-based decoding, production MT services tend to behave nearly deterministically for fixed inputs. These results highlight that prompted LLM translation can induce substantially stronger surface-form variability under iterative reuse than a production MT service, even under a nominal meaning-preservation objective.

Figure 7: Distinct-sentence counts under iterated round-trip translation for GPT-4o-mini (sampling-based decoding) and Google Translate (v3).

### 5.4 Distinction from training-time model collapse

[Shumailov et al. (2024)](https://arxiv.org/html/2603.11228v1#bib.bib1) describe _model collapse_ as a training-time phenomenon in which repeated optimization on model-generated data can reduce coverage of the original data distribution. Subsequent analyses argue that the severity of this effect depends on strong assumptions and that it may be attenuated in more realistic training settings ([Schaeffer et al., 2025](https://arxiv.org/html/2603.11228v1#bib.bib12)). Our setting is mechanistically distinct: we investigate _inference-time_ recursion under a fixed model, prompt, and decoding configuration, where an induced transformation operator is applied iteratively without any parameter updates.

Consequently, the behaviors we observe—including rapid convergence to fixed points or short cycles under greedy decoding and longer transients with sustained production of distinct realizations under sampling-based decoding—are attributable to properties of the induced transition kernel rather than to distributional contraction driven by learning. Moreover, at the sentence level, iterative reprocessing can preserve or even increase the diversity for certain inputs, in contrast to the diversity degradation typically emphasized in training-time collapse accounts. These differences motivate the use of separate terminology and analytical tools for iterative inference dynamics, as formalized in our Markovian generation chain framework.

## 6 Discussions and Conclusions

LLMs are progressively integrated into text-processing pipelines, where their outputs can be fed into subsequent steps, either within a single workflow or reused across users. Many researchers are interested in exploring the differences between single-turn and multi-turn interactions in LLMs ([Li et al., 2025](https://arxiv.org/html/2603.11228v1#bib.bib50); [Laban et al., 2025](https://arxiv.org/html/2603.11228v1#bib.bib48); [Huang et al., 2026](https://arxiv.org/html/2603.11228v1#bib.bib49)), whereas the scenarios considered in our paper can be regarded as multi-single-turn.

LLMs are frequently applied to tasks such as translation and rewriting. Repeated inference-time reprocessing is mechanistically distinct from training-time model-collapse phenomena: the dynamics we study arise from iterating transformation operators rather than from optimizing model parameters on synthetic data. At the same time, sentence diversity does not imply semantic fidelity, as iterative reprocessing can introduce cumulative drift even under meaning-preserving prompts. The behavior of LLMs in a wider range of scenarios also requires further study.

The _Markovian generation chains_ we define naturally arise in the real world, for instance through interactions among different LLM agents. Our Markov-chain framing provides a compact way to describe these phenomena and and connect them to standard properties of stochastic operators (e.g., contraction of divergences under repeated application of a fixed kernel). This clear and direct method of explanation can help us broadly understand the simulation results. Therefore, the results of this paper also provide insights into the development and use of LLMs.

## Acknowledgments

This work benefited from funding from the French State, managed by the Agence Nationale de la Recherche, under the France 2030 program (grant reference ANR-23-IACL-0008). This research also received support from the ENS-PSL BeYs Chair in Data Science and Cybersecurity. We appreciate the thoughtful conversations and valuable suggestions from Gibbs Nwemadji.

## References

*   Arnon and Kirby (2024) I. Arnon and S. Kirby Cultural evolution creates the statistical structure of language. Scientific Reports 14 (1), pp. 5255. Cited by: [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px3.p1.1 "Language change and convergence in human–LLM interaction. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Banerjee and Lavie (2005) S. Banerjee and A. Lavie METEOR: an automatic metric for mt evaluation with improved correlation with human judgments. In Proceedings of the acl workshop on intrinsic and extrinsic evaluation measures for machine translation and/or summarization, pp. 65–72. Cited by: [3rd item](https://arxiv.org/html/2603.11228v1#S3.I1.i3.p1.1 "In 3.5 Measurement and evaluations ‣ 3 Methodology ‣ Markovian Generation Chains in Large Language Models").
*   Blevins et al. (2025) T. Blevins, S. Schmalwieser, and B. Roth Do language models accommodate their users? a study of linguistic convergence. arXiv preprint arXiv:2508.03276. Cited by: [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px3.p1.1 "Language change and convergence in human–LLM interaction. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Brinkmann et al. (2023) L. Brinkmann, F. Baumann, J. Bonnefon, M. Derex, T. F. Müller, A. Nussberger, A. Czaplicka, A. Acerbi, T. L. Griffiths, J. Henrich, et al. Machine culture. Nature Human Behaviour 7 (11), pp. 1855–1868. Cited by: [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px3.p1.1 "Language change and convergence in human–LLM interaction. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Burton et al. (2024) J. W. Burton, E. Lopez-Lopez, S. Hechtlinger, Z. Rahwan, S. Aeschbach, M. A. Bakker, J. A. Becker, A. Berditchevskaia, J. Berger, L. Brinkmann, et al. How large language models can reshape collective intelligence. Nature human behaviour 8 (9), pp. 1643–1655. Cited by: [§1](https://arxiv.org/html/2603.11228v1#S1.p5.1 "1 Introduction ‣ Markovian Generation Chains in Large Language Models").
*   Chang and McCallum (2022) H. Chang and A. McCallum Softmax bottleneck makes language models unable to represent multi-mode word distributions. In Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics, Vol. 1. Cited by: [Appendix A](https://arxiv.org/html/2603.11228v1#A1.p1.2 "Appendix A Token-level stochasticity and decoding ‣ Markovian Generation Chains in Large Language Models"), [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px2.p1.1 "Sampling and diversity in LLM-generated content. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Chung et al. (2023) J. J. Y. Chung, E. Kamar, and S. Amershi Increasing diversity while maintaining accuracy: text data generation with large language models and human interventions. arXiv preprint arXiv:2306.04140. Cited by: [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px2.p1.1 "Sampling and diversity in LLM-generated content. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Dubey et al. (2024) A. Dubey, A. Jauhri, A. Pandey, A. Kadian, A. Al-Dahle, A. Letman, A. Mathur, A. Schelten, A. Yang, A. Fan, et al. The llama 3 herd of models. arXiv e-prints, pp. arXiv–2407. Cited by: [§4](https://arxiv.org/html/2603.11228v1#S4.SS0.SSS0.Px2.p1.1 "Models and baselines. ‣ 4 Experimental Setup ‣ Markovian Generation Chains in Large Language Models").
*   Fan et al. (2018) A. Fan, M. Lewis, and Y. Dauphin Hierarchical neural story generation. arXiv preprint arXiv:1805.04833. Cited by: [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px2.p1.1 "Sampling and diversity in LLM-generated content. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Geng et al. (2025) M. Geng, C. Chen, Y. Wu, Y. Wan, P. Zhou, and D. Chen The impact of large language models in academia: from writing to speaking. In Findings of the Association for Computational Linguistics: ACL 2025, pp. 19303–19319. Cited by: [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px3.p1.1 "Language change and convergence in human–LLM interaction. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Geng and Trotta (2025) M. Geng and R. Trotta Human-llm coevolution: evidence from academic writing. In Findings of the Association for Computational Linguistics: ACL 2025, pp. 12689–12696. Cited by: [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px3.p1.1 "Language change and convergence in human–LLM interaction. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Gerstgrasser et al. (2024) M. Gerstgrasser, R. Schaeffer, A. Dey, R. Rafailov, H. Sleight, J. Hughes, T. Korbak, R. Agrawal, D. Pai, A. Gromov, et al. Is model collapse inevitable? breaking the curse of recursion by accumulating real and synthetic data. arXiv preprint arXiv:2404.01413. Cited by: [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px1.p1.1 "Model collapse and iterative generation. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Gloeckle et al. (2024) F. Gloeckle, B. Y. Idrissi, B. Rozière, D. Lopez-Paz, and G. Synnaeve Better & faster large language models via multi-token prediction. arXiv preprint arXiv:2404.19737. Cited by: [Appendix A](https://arxiv.org/html/2603.11228v1#A1.p1.3 "Appendix A Token-level stochasticity and decoding ‣ Markovian Generation Chains in Large Language Models").
*   Gorinski and Lapata (2015) P. Gorinski and M. Lapata Movie script summarization as graph-based scene extraction. In Proceedings of the 2015 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, pp. 1066–1076. Cited by: [§4](https://arxiv.org/html/2603.11228v1#S4.SS0.SSS0.Px1.p1.1 "Data ‣ 4 Experimental Setup ‣ Markovian Generation Chains in Large Language Models").
*   Griffiths and Kalish (2007) T. L. Griffiths and M. L. Kalish Language evolution by iterated learning with bayesian agents. Cognitive science 31 (3), pp. 441–480. Cited by: [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px3.p1.1 "Language change and convergence in human–LLM interaction. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Guo et al. (2024) Y. Guo, G. Shang, and C. Clavel Benchmarking linguistic diversity of large language models. arXiv preprint arXiv:2412.10271. Cited by: [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px2.p1.1 "Sampling and diversity in LLM-generated content. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Guo et al. (2023) Y. Guo, G. Shang, M. Vazirgiannis, and C. Clavel The curious decline of linguistic diversity: training language models on synthetic text. arXiv preprint arXiv:2311.09807. Cited by: [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px1.p1.1 "Model collapse and iterative generation. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Hamilton et al. (2016) W. L. Hamilton, J. Leskovec, and D. Jurafsky Diachronic word embeddings reveal statistical laws of semantic change. arXiv preprint arXiv:1605.09096. Cited by: [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px3.p1.1 "Language change and convergence in human–LLM interaction. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   He and Lab (2025) H. He and T. M. Lab Defeating nondeterminism in llm inference. Thinking Machines Lab: Connectionism. Note: https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/ External Links: [Document](https://dx.doi.org/10.64434/tml.20250910) Cited by: [Appendix A](https://arxiv.org/html/2603.11228v1#A1.p1.1 "Appendix A Token-level stochasticity and decoding ‣ Markovian Generation Chains in Large Language Models"), [§1](https://arxiv.org/html/2603.11228v1#S1.p3.1 "1 Introduction ‣ Markovian Generation Chains in Large Language Models").
*   Holtzman et al. (2019) A. Holtzman, J. Buys, L. Du, M. Forbes, and Y. Choi The curious case of neural text degeneration. arXiv preprint arXiv:1904.09751. Cited by: [Appendix A](https://arxiv.org/html/2603.11228v1#A1.p1.2 "Appendix A Token-level stochasticity and decoding ‣ Markovian Generation Chains in Large Language Models"), [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px2.p1.1 "Sampling and diversity in LLM-generated content. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Huang et al. (2026) J. Y. Huang, L. Choshen, R. Astudillo, T. Broderick, and J. Andreas Do llms benefit from their own words?. arXiv preprint arXiv:2602.24287. Cited by: [§6](https://arxiv.org/html/2603.11228v1#S6.p1.1 "6 Discussions and Conclusions ‣ Markovian Generation Chains in Large Language Models").
*   Hurst et al. (2024) A. Hurst, A. Lerer, A. P. Goucher, A. Perelman, A. Ramesh, A. Clark, A. Ostrow, A. Welihinda, A. Hayes, A. Radford, et al. Gpt-4o system card. arXiv preprint arXiv:2410.21276. Cited by: [§4](https://arxiv.org/html/2603.11228v1#S4.SS0.SSS0.Px2.p1.1 "Models and baselines. ‣ 4 Experimental Setup ‣ Markovian Generation Chains in Large Language Models").
*   Jang et al. (2016) E. Jang, S. Gu, and B. Poole Categorical reparameterization with gumbel-softmax. arXiv preprint arXiv:1611.01144. Cited by: [Appendix A](https://arxiv.org/html/2603.11228v1#A1.p1.1 "Appendix A Token-level stochasticity and decoding ‣ Markovian Generation Chains in Large Language Models"), [§1](https://arxiv.org/html/2603.11228v1#S1.p3.1 "1 Introduction ‣ Markovian Generation Chains in Large Language Models").
*   Jiang et al. (2023) A. Q. Jiang, A. Sablayrolles, A. Mensch, C. Bamford, D. S. Chaplot, D. d. l. Casas, F. Bressand, G. Lengyel, G. Lample, L. Saulnier, et al. Mistral 7b. arXiv preprint arXiv:2310.06825. Cited by: [§4](https://arxiv.org/html/2603.11228v1#S4.SS0.SSS0.Px2.p1.1 "Models and baselines. ‣ 4 Experimental Setup ‣ Markovian Generation Chains in Large Language Models").
*   Jiang et al. (2025) L. Jiang, Y. Chai, M. Li, M. Liu, R. Fok, N. Dziri, Y. Tsvetkov, M. Sap, A. Albalak, and Y. Choi Artificial hivemind: the open-ended homogeneity of language models (and beyond). arXiv preprint arXiv:2510.22954. Cited by: [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px2.p1.1 "Sampling and diversity in LLM-generated content. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Kandra et al. (2025) F. Kandra, V. Demberg, and A. Koller LLMs syntactically adapt their language use to their conversational partner. arXiv preprint arXiv:2503.07457. Cited by: [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px3.p1.1 "Language change and convergence in human–LLM interaction. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Kirby et al. (2007) S. Kirby, M. Dowman, and T. L. Griffiths Innateness and culture in the evolution of language. Proceedings of the National Academy of Sciences 104 (12), pp. 5241–5245. Cited by: [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px3.p1.1 "Language change and convergence in human–LLM interaction. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Kryściński et al. (2022) W. Kryściński, N. Rajani, D. Agarwal, C. Xiong, and D. Radev Booksum: a collection of datasets for long-form narrative summarization. In Findings of the association for computational linguistics: EMNLP 2022, pp. 6536–6558. Cited by: [§4](https://arxiv.org/html/2603.11228v1#S4.SS0.SSS0.Px1.p1.1 "Data ‣ 4 Experimental Setup ‣ Markovian Generation Chains in Large Language Models").
*   Laban et al. (2025) P. Laban, H. Hayashi, Y. Zhou, and J. Neville Llms get lost in multi-turn conversation. arXiv preprint arXiv:2505.06120. Cited by: [§6](https://arxiv.org/html/2603.11228v1#S6.p1.1 "6 Discussions and Conclusions ‣ Markovian Generation Chains in Large Language Models").
*   Li et al. (2025) Y. Li, X. Shen, X. Yao, X. Ding, Y. Miao, R. Krishnan, and R. Padman Beyond single-turn: a survey on multi-turn interactions with large language models. arXiv preprint arXiv:2504.04717. Cited by: [§6](https://arxiv.org/html/2603.11228v1#S6.p1.1 "6 Discussions and Conclusions ‣ Markovian Generation Chains in Large Language Models").
*   Li et al. (2024) Y. Li, F. Guerin, and C. Lin Latesteval: addressing data contamination in language model evaluation through dynamic and time-sensitive test construction. In Proceedings of the AAAI Conference on Artificial Intelligence, Vol. 38, pp. 18600–18607. Cited by: [§4](https://arxiv.org/html/2603.11228v1#S4.SS0.SSS0.Px1.p1.1 "Data ‣ 4 Experimental Setup ‣ Markovian Generation Chains in Large Language Models").
*   Lieberman et al. (2007) E. Lieberman, J. Michel, J. Jackson, T. Tang, and M. A. Nowak Quantifying the evolutionary dynamics of language. Nature 449 (7163), pp. 713–716. Cited by: [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px3.p1.1 "Language change and convergence in human–LLM interaction. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Lin (2004) C. Lin Rouge: a package for automatic evaluation of summaries. In Text summarization branches out, pp. 74–81. Cited by: [3rd item](https://arxiv.org/html/2603.11228v1#S3.I1.i3.p1.1 "In 3.5 Measurement and evaluations ‣ 3 Methodology ‣ Markovian Generation Chains in Large Language Models").
*   Mikhaylovskiy (2025) N. Mikhaylovskiy Zipf’s and heaps’ laws for tokens and llm-generated texts. In Findings of the Association for Computational Linguistics: EMNLP 2025, pp. 15469–15481. Cited by: [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px2.p1.1 "Sampling and diversity in LLM-generated content. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Mohamed et al. (2025) A. Mohamed, M. Geng, M. Vazirgiannis, and G. Shang Llm as a broken telephone: iterative generation distorts information. In Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pp. 7493–7509. Cited by: [§1](https://arxiv.org/html/2603.11228v1#S1.p2.1 "1 Introduction ‣ Markovian Generation Chains in Large Language Models"), [§1](https://arxiv.org/html/2603.11228v1#S1.p5.1 "1 Introduction ‣ Markovian Generation Chains in Large Language Models"), [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px1.p1.1 "Model collapse and iterative generation. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Muñoz-Ortiz et al. (2024) A. Muñoz-Ortiz, C. Gómez-Rodríguez, and D. Vilares Contrasting linguistic patterns in human and llm-generated news text. Artificial Intelligence Review 57 (10), pp. 265. Cited by: [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px2.p1.1 "Sampling and diversity in LLM-generated content. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Padmakumar and He (2023) V. Padmakumar and H. He Does writing with language models reduce content diversity?. arXiv preprint arXiv:2309.05196. Cited by: [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px2.p1.1 "Sampling and diversity in LLM-generated content. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Papineni et al. (2002) K. Papineni, S. Roukos, T. Ward, and W. Zhu Bleu: a method for automatic evaluation of machine translation. In Proceedings of the 40th annual meeting of the Association for Computational Linguistics, pp. 311–318. Cited by: [3rd item](https://arxiv.org/html/2603.11228v1#S3.I1.i3.p1.1 "In 3.5 Measurement and evaluations ‣ 3 Methodology ‣ Markovian Generation Chains in Large Language Models").
*   Perez et al. (2025) J. Perez, G. Kovač, C. Léger, C. Colas, G. Molinaro, M. Derex, P. Oudeyer, and C. Moulin-Frier When llms play the telephone game: cultural attractors as conceptual tools to evaluate llms in multi-turn settings. In The Thirteenth International Conference on Learning Representations, Cited by: [§1](https://arxiv.org/html/2603.11228v1#S1.p2.1 "1 Introduction ‣ Markovian Generation Chains in Large Language Models"), [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px1.p1.1 "Model collapse and iterative generation. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Peterson (2025) A. J. Peterson AI and the problem of knowledge collapse. AI & SOCIETY, pp. 1–21. Cited by: [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px1.p1.1 "Model collapse and iterative generation. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Schaeffer et al. (2025) R. Schaeffer, J. Kazdan, A. C. Arulandu, and S. Koyejo Position: model collapse does not mean what you think. arXiv preprint arXiv:2503.03150. Cited by: [§5.4](https://arxiv.org/html/2603.11228v1#S5.SS4.p1.1 "5.4 Distinction from training-time model collapse ‣ 5 Results ‣ Markovian Generation Chains in Large Language Models").
*   Seddik et al. (2024) M. E. A. Seddik, S. Chen, S. Hayou, P. Youssef, and M. Debbah How bad is training on synthetic data? a statistical analysis of language model collapse. arXiv preprint arXiv:2404.05090. Cited by: [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px1.p1.1 "Model collapse and iterative generation. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Shumailov et al. (2024) I. Shumailov, Z. Shumaylov, Y. Zhao, N. Papernot, R. Anderson, and Y. Gal AI models collapse when trained on recursively generated data. Nature 631 (8022), pp. 755–759. Cited by: [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px1.p1.1 "Model collapse and iterative generation. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models"), [§5.4](https://arxiv.org/html/2603.11228v1#S5.SS4.p1.1 "5.4 Distinction from training-time model collapse ‣ 5 Results ‣ Markovian Generation Chains in Large Language Models").
*   Smith et al. (2025) B. Smith, M. R. Bouadjenek, T. A. Kheya, P. Dawson, and S. Aryal A comprehensive analysis of large language model outputs: similarity, diversity, and bias. arXiv preprint arXiv:2505.09056. Cited by: [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px2.p1.1 "Sampling and diversity in LLM-generated content. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Teng et al. (2025) F. Teng, Q. Shi, Z. Yu, J. Zhang, Y. Luo, C. Wu, and Z. Guo Atom of thoughts for markov llm test-time scaling. arXiv preprint arXiv:2502.12018. Cited by: [§1](https://arxiv.org/html/2603.11228v1#S1.p3.1 "1 Introduction ‣ Markovian Generation Chains in Large Language Models").
*   Wright et al. (2025) D. Wright, S. Masud, J. Moore, S. Yadav, M. Antoniak, P. E. Christensen, C. Y. Park, and I. Augenstein Epistemic diversity and knowledge collapse in large language models. arXiv preprint arXiv:2510.04226. Cited by: [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px1.p1.1 "Model collapse and iterative generation. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Xu et al. (2025) W. Xu, N. Jojic, S. Rao, C. Brockett, and B. Dolan Echoes in ai: quantifying lack of plot diversity in llm outputs. Proceedings of the National Academy of Sciences 122 (35), pp. e2504966122. Cited by: [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px2.p1.1 "Sampling and diversity in LLM-generated content. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Yakura et al. (2024) H. Yakura, E. Lopez-Lopez, L. Brinkmann, I. Serna, P. Gupta, I. Soraperra, and I. Rahwan Empirical evidence of large language model’s influence on human spoken communication. arXiv preprint arXiv:2409.01754. Cited by: [§2](https://arxiv.org/html/2603.11228v1#S2.SS0.SSS0.Px3.p1.1 "Language change and convergence in human–LLM interaction. ‣ 2 Related Work ‣ Markovian Generation Chains in Large Language Models").
*   Yang et al. (2024) A. Yang, B. Yang, B. Hui, B. Zheng, B. Yu, C. Zhou, C. Li, C. Li, D. Liu, F. Huang, G. Dong, H. Wei, H. Lin, J. Tang, J. Wang, J. Yang, J. Tu, J. Zhang, J. Ma, J. Xu, J. Zhou, J. Bai, J. He, J. Lin, K. Dang, K. Lu, K. Chen, K. Yang, M. Li, M. Xue, N. Ni, P. Zhang, P. Wang, R. Peng, R. Men, R. Gao, R. Lin, S. Wang, S. Bai, S. Tan, T. Zhu, T. Li, T. Liu, W. Ge, X. Deng, X. Zhou, X. Ren, X. Zhang, X. Wei, X. Ren, Y. Fan, Y. Yao, Y. Zhang, Y. Wan, Y. Chu, Y. Liu, Z. Cui, Z. Zhang, and Z. Fan Qwen2 technical report. arXiv preprint arXiv:2407.10671. Cited by: [§4](https://arxiv.org/html/2603.11228v1#S4.SS0.SSS0.Px2.p1.1 "Models and baselines. ‣ 4 Experimental Setup ‣ Markovian Generation Chains in Large Language Models").
*   Zekri et al. (2024) O. Zekri, A. Odonnat, A. Benechehab, L. Bleistein, N. Boullé, and I. Redko Large language models as markov chains. arXiv preprint arXiv:2410.02724. Cited by: [§1](https://arxiv.org/html/2603.11228v1#S1.p3.1 "1 Introduction ‣ Markovian Generation Chains in Large Language Models").

## Appendix A Token-level stochasticity and decoding

Iterative trajectories depend on decoding-induced stochasticity ([Jang et al., 2016](https://arxiv.org/html/2603.11228v1#bib.bib6)), in addition to system-level nondeterminism ([He and Lab, 2025](https://arxiv.org/html/2603.11228v1#bib.bib21)). At generation step t′t^{\\prime}, let z⁡(⋅,x,w<t′)z(\\cdot\\,;\\,x,w\_{<t^{\\prime}}) denote the logits given input xx and prefix w<t′w\_{<t^{\\prime}}. Temperature τ\\tau induces

|  | πτ​(wt′∣x,w<t′)=exp⁡(z⁡(wt′,x,w<t′)/τ)∑vexp⁡(z⁡(v,x,w<t′)/τ),\pi_{\tau}(w_{t^{\prime}}\mid x,w_{<t^{\prime}})\;=\;\frac{\exp(z(w_{t^{\prime}};x,w_{<t^{\prime}})/\tau)}{\sum_{v}\exp(z(v;x,w_{<t^{\prime}})/\tau)}\,, |  | (12) |
| --- | --- | --- | --- |

where larger τ\\tau typically increases randomness ([Holtzman et al., 2019](https://arxiv.org/html/2603.11228v1#bib.bib22)). Top-kk, nucleus sampling (top-pp), and logit controls further truncate or reweighs this distribution (with limitations in some regimes ([Chang and McCallum, 2022](https://arxiv.org/html/2603.11228v1#bib.bib20))). The probability of a length-nn sequence is

|  | Πτ(w1:n∣x)=∏t′=1nπτ(wt′∣x,w<t′).\Pi_{\tau}(w_{1:n}\mid x)=\prod_{{t^{\prime}}=1}^{n}\pi_{\tau}(w_{t^{\prime}}\mid x,w_{<t^{\prime}})\,. |  | (13) |
| --- | --- | --- | --- |

These token-level choices induce the sentence-level transition kernel in Eq. ([1](https://arxiv.org/html/2603.11228v1#S3.E1 "In 3.1 Iterative reprocessing as a Markovian generation chain ‣ 3 Methodology ‣ Markovian Generation Chains in Large Language Models")) and can compound under iteration. Even when alternative decoding objectives are proposed, such as multi-token prediction ([Gloeckle et al., 2024](https://arxiv.org/html/2603.11228v1#bib.bib23)), the core stochastic selection mechanism remains central to typical deployments.

## Appendix B Contraction of relative entropy

KL divergence is defined as,

|  | DK​L(X∥Y)=∑iXilog(XiYi).D_{KL}(X\\|Y)=\sum_{i}X_{i}\log\left(\frac{X_{i}}{Y_{i}}\right)\,. |  | (14) |
| --- | --- | --- | --- |

Similarly,

|  | DKL(X𝐏∥Y𝐏)=∑j(X𝐏)jlog((X​𝐏)j(Y​𝐏)j),D_{\mathrm{KL}}(X\mathbf{P}\\|Y\mathbf{P})=\sum_{j}(X\mathbf{P})_{j}\log\left(\frac{(X\mathbf{P})_{j}}{(Y\mathbf{P})_{j}}\right), |  | (15) |
| --- | --- | --- | --- |

where (X​𝐏)j\=∑iXi​Pi​j(X\\mathbf{P})\_{j}=\\sum\_{i}X\_{i}P\_{ij} and (Y​𝐏)j\=∑iYi​Pi​j(Y\\mathbf{P})\_{j}=\\sum\_{i}Y\_{i}P\_{ij}. Assume (Y​𝐏)j\>0(Y\\mathbf{P})\_{j}>0 whenever (X​𝐏)j\>0(X\\mathbf{P})\_{j}>0 (otherwise the divergence is infinite and the inequality holds trivially). By the log-sum inequality, for each jj,

|  | (∑iXi​Pi​j)​log⁡∑iXi​Pi​j∑iYi​Pi​j≤∑iXi​Pi​j​log⁡Xi​Pi​jYi​Pi​j,\left(\sum_{i}X_{i}P_{ij}\right)\log\frac{\sum_{i}X_{i}P_{ij}}{\sum_{i}Y_{i}P_{ij}}\;\leq\;\sum_{i}X_{i}P_{ij}\log\frac{X_{i}P_{ij}}{Y_{i}P_{ij}}, |  | (16) |
| --- | --- | --- | --- |

with the convention that terms with Xi​Pi​j\=0X\_{i}P\_{ij}=0 contribute 00. Summing over jj gives

|  | DKL(X𝐏∥Y𝐏)\displaystyle D_{\mathrm{KL}}(X\mathbf{P}\\|Y\mathbf{P}) | ≤∑j∑iXi​Pi​j​log⁡Xi​Pi​jYi​Pi​j\displaystyle\leq\sum_{j}\sum_{i}X_{i}P_{ij}\log\frac{X_{i}P_{ij}}{Y_{i}P_{ij}} |  | (17) |
| --- | --- | --- | --- | --- |
|  |  | =∑iXi​log⁡XiYi​∑jPi​j.\displaystyle=\sum_{i}X_{i}\log\frac{X_{i}}{Y_{i}}\sum_{j}P_{ij}. |  | (18) |

Since 𝐏\\mathbf{P} is row-stochastic, ∑jPi​j\=1\\sum\_{j}P\_{ij}=1, hence

|  | DKL(X𝐏∥Y𝐏)≤DKL(X∥Y).D_{\mathrm{KL}}(X\mathbf{P}\\|Y\mathbf{P})\leq D_{\mathrm{KL}}(X\\|Y). |  | (19) |
| --- | --- | --- | --- |

## Appendix C Prompts

This section lists the prompt templates used in the main experiments and ablations. In all listings, {content} is replaced with the current input text at iteration tt, and {target\_lang} denotes the chosen bridge language for round-trip translation. Unless stated otherwise, the same template is reused across iterations.

##### Tasks.

Iterative rephrasing. Using rephrasing prompt ρreph\\rho\_{\\mathrm{reph}}, we iterate s(t+1)∼𝒯M,ρreph,d(⋅∣s(t))s^{(t+1)}\\sim\\mathcal{T}\_{M,\\rho\_{\\mathrm{reph}},d}(\\cdot\\mid s^{(t)}). Iterated round-trip translation. For bridge language ℓ\\ell with prompts ρtr\\rho\_{\\mathrm{tr}}, one iteration applies 𝒯M,ρtr,dEN→ℓ→EN\\mathcal{T}^{\\text{EN}\\to\\ell\\to\\text{EN}}\_{M,\\rho\_{\\mathrm{tr}},d} (Eq. [2](https://arxiv.org/html/2603.11228v1#S3.E2 "In Structured operators via composition. ‣ 3.1 Iterative reprocessing as a Markovian generation chain ‣ 3 Methodology ‣ Markovian Generation Chains in Large Language Models")):

|  | sEN(t)→EN→ℓuℓ(t)→ℓ→ENsEN(t+1).s^{(t)}_{\text{EN}}\xrightarrow{\text{EN}\to\ell}u^{(t)}_{\ell}\xrightarrow{\ell\to\text{EN}}s^{(t+1)}_{\text{EN}}. |  |
| --- | --- | --- |

##### Rephrasing prompts.

Listing [1](https://arxiv.org/html/2603.11228v1#LST1 "Listing 1 ‣ Rephrasing prompts. ‣ Appendix C Prompts ‣ Markovian Generation Chains in Large Language Models") is the main meaning-preserving rephrasing template, and Listing [2](https://arxiv.org/html/2603.11228v1#LST2 "Listing 2 ‣ Rephrasing prompts. ‣ Appendix C Prompts ‣ Markovian Generation Chains in Large Language Models") is a shorter ablation variant used in the prompt-sensitivity study.

Listing 1: Prompt for rephrasing

"Given a passage, rephrase it while preserving all the original meaning and without losing any context.\\n"

"Do not write an introduction or a summary. Return only the rephrased passage.\\n\\n"

"Rephrase the following text:\\n{content}"

Listing 2: Prompt for rephrasing (ablation)

"Rephrase the following text:\\n{content}"

##### Translation prompts.

For round-trip translation, we use direction-specific templates (EN→ℓ\\to\\ell and ℓ→\\ell\\toEN). The current input text is appended after the instruction, and {target\_lang} specifies the intermediate language ℓ\\ell.

Listing 3: Prompt for translation

"Translate the following English text into {target\_lang}:"

"Translate the following {target\_lang} text into English:"

## Appendix D Additional Results

This section provides supplementary qualitative trajectories and full metric plots referenced in the main text. We include (i) iterative rephrasing examples under sampling, (ii) round-trip translation examples, (iii) similarity-metric trajectories for additional datasets/decoding regimes, and (iv) full length–diversity correlation outputs.

##### Iterative rephrasing under sampling.

Table [3](https://arxiv.org/html/2603.11228v1#A4.T3 "Table 3 ‣ Iterative rephrasing under sampling. ‣ Appendix D Additional Results ‣ Markovian Generation Chains in Large Language Models") shows representative trajectories under sampling-based decoding (τ\=0.7\\tau=0.7, top-p\=0.9p=0.9), illustrating how some chains exhibit continued drift while others still enter short cycles.

Table 3: Examples of repeated rephrasing by different LLMs (temperature=0.7, top-p=0.9).

##### Iterated round-trip translation examples.

Tables [4](https://arxiv.org/html/2603.11228v1#A4.T4 "Table 4 ‣ Iterated round-trip translation examples. ‣ Appendix D Additional Results ‣ Markovian Generation Chains in Large Language Models") and [5](https://arxiv.org/html/2603.11228v1#A4.T5 "Table 5 ‣ Iterated round-trip translation examples. ‣ Appendix D Additional Results ‣ Markovian Generation Chains in Large Language Models") provide illustrative round-trip translation chains (EN→\\rightarrowFrench→\\rightarrowEN), highlighting early stabilization and occasional alternation between near-identical variants.

Table 4: Examples of iterative translation via GPT-4o-mini (temperature=0.7, top-p=0.9).

Table 5: Examples of iterative translation via GPT-4o-mini (temperature=0.7, top-p=0.9). The omitted lines are all identical to the content in the second round (the italicized sentences). The similar scenario also occurs after the 19th round.

##### Similarity dynamics across iterations.

Figures [8](https://arxiv.org/html/2603.11228v1#A4.F8 "Figure 8 ‣ Similarity dynamics across iterations. ‣ Appendix D Additional Results ‣ Markovian Generation Chains in Large Language Models") and [9](https://arxiv.org/html/2603.11228v1#A4.F9 "Figure 9 ‣ Similarity dynamics across iterations. ‣ Appendix D Additional Results ‣ Markovian Generation Chains in Large Language Models") extend the greedy-decoding analysis to additional datasets. Figures [10](https://arxiv.org/html/2603.11228v1#A4.F10 "Figure 10 ‣ Similarity dynamics across iterations. ‣ Appendix D Additional Results ‣ Markovian Generation Chains in Large Language Models")– [12](https://arxiv.org/html/2603.11228v1#A4.F12 "Figure 12 ‣ Similarity dynamics across iterations. ‣ Appendix D Additional Results ‣ Markovian Generation Chains in Large Language Models") report the analogous plots under sampling-based decoding. As in the main text, each point compares iteration tt to iteration t−1t-1 using METEOR, ROUGE-1, and BLEU.

Figure 8: Evolution of text similarity metrics across 50 rephrasing iterations for the News2024 dataset using greedy decoding. Each iteration compares the current rephrased text against the previous iteration’s text as reference.

Figure 9: Evolution of text similarity metrics across 50 rephrasing iterations for the ScriptBase dataset using greedy decoding. Each iteration compares the current rephrased text against the previous iteration’s text as reference.

Figure 10: Evolution of text similarity metrics across 50 rephrasing iterations for the BookSum dataset using sampling-based decoding. Each iteration compares the current rephrased text against the previous iteration’s text as reference.

Figure 11: Evolution of text similarity metrics across 50 rephrasing iterations for the News2024 dataset using sampling-based decoding. Each iteration compares the current rephrased text against the previous iteration’s text as reference.

Figure 12: Evolution of text similarity metrics across 50 rephrasing iterations for the ScriptBase dataset using sampling-based decoding. Each iteration compares the current rephrased text against the previous iteration’s text as reference.

##### Full length–diversity correlation results.

Table [6](https://arxiv.org/html/2603.11228v1#A4.T6 "Table 6 ‣ Full length–diversity correlation results. ‣ Appendix D Additional Results ‣ Markovian Generation Chains in Large Language Models") reports Pearson correlations between seed length and diversity, along with pp\-values, linear-fit R2R^{2}, and slopes for each model/decoding setting and dataset.

Table 6: Results of the Correlation Analysis. rr represents the Pearson correlation coefficient, and R2R^{2} represents the coefficient of determination.

## Provenance

Fetched from https://arxiv.org/html/2603.11228v1 on 2026-10-06T11:13:30.187Z