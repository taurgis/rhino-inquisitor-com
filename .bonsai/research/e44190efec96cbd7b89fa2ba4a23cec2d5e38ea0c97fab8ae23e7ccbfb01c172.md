---
schema_version: 1
artifact_type: section
source_url: https://arxiv.org/html/2604.19768v1#53-composite-metrics
source_urls:
  - https://arxiv.org/html/2604.19768v1#53-composite-metrics
normalized_url: https://arxiv.org/html/2604.19768v1
cache_key: e44190efec96cbd7b89fa2ba4a23cec2d5e38ea0c97fab8ae23e7ccbfb01c172
topic: 
tags:
  - language
  - framework
  - models
  - large
  - miscalibration
format_available:
  - compressed
  - detailed
tier: standard
ttl: 
fetched_at: 2026-09-18T07:12:04.747Z
validated_at: 2026-09-18T07:12:04.747Z
stale_after: 2026-10-18T07:12:04.747Z
capture_method: static_fetch
extraction_status: extracted
extraction_confidence: high
quality_notes:
  - readability extracted main article
  - quality:oversized
  - auto-generated tags via keyword extraction
supplied_at: 
supplied_by: 
etag: "CLz/iPidupYDEAE="
last_modified: Mon, 24 Aug 2026 21:43:04 GMT
content_hash: 04a88a6f98d837761cba7235601f1b154a90836f2d30bb27198a1ecbc26a42ce
token_estimate:
  compressed: 567
  detailed: 1009
status: active
site_module_id: 
docs_engine: generated-static
docs_framework: 
source_doc_url: 
search_provider: 
parent_cache_key: 641ba9dd0a287f068a4ea359713ce7065c431856b306034d96571c131c587cf1
section_anchor: 53-composite-metrics
section_heading_path: 5 Results and Discussion > 5.3 Composite Metrics
---

## Summary

5 Results and Discussion > 5.3 Composite Metrics

## Compressed

### 5.3 Composite Metrics

#### 5.3.1 Form-Meaning Divergence

FMD follows a monotonic ordering across sub-corpora (Figure [5](a)). The HE texts score lowest (δ¯\=0.009\\bar{\\delta}=0.009), HN intermediate (δ¯\=0.012\\bar{\\delta}=0.012), and LG highest (δ¯\=0.017\\bar{\\delta}=0.017). Both human groups differ significantly from LG (p<0.001p<0.001; Δ\=0.68\\Delta=0.68 for HE vs LG, Δ\=0.30\\Delta=0.30 for HN vs LG), while the difference between the two human groups does not reach significance as the gap is small relative to within-group variance. LLM texts combine elevated rhetorical intensity ρ⁡(d)\\rho(d) while genuine epistemic grounding in the denominator of ([11] ‣ 4.3 Stage 3: ERM Feature Engineering ‣ 4 Methodological Implementation ‣ Saying More Than They Know: A Framework for Quantifying Epistemic-Rhetorical Miscalibration in Large Language Models")) does not proportionally compensate.

Figure 5: Distribution of the three composite ERM metrics across sub-corpora. Significance brackets: ∗p<.05{}^{\*}p{<}.05, ∗∗∗p<.001{}^{\*\*\*}p{<}.001. (a) FMD δ⁡(d)\\delta(d). (b) GPR γ⁡(d)\\gamma(d). (c) RDDE ηnorm​(d)\\eta\_{\\mathrm{norm}}(d).

#### 5.3.2 Genuine-to-Performed Epistemic Ratio

GPR shows an interesting three-way ordering (Figure [5](b)), with HE highest (γ¯\=0.267\\bar{\\gamma}=0.267), LG intermediate (γ¯\=0.217\\bar{\\gamma}=0.217), and HN lowest (γ¯\=0.172\\bar{\\gamma}=0.172) (p<0.001p<0.001). The largest pairwise contrast is between HE and HN texts (Δ\=0.89\\Delta=0.89, p<0.001p<0.001), reflecting expert advantage in grounding claims in identifiable evidential bases such as extensively higher modal auxiliary counts, adverbials, and syntactic restrictors.

#### 5.3.3 Rhetorical Device Distribution Entropy

LLM-generated texts show (Figure [5](c)) the highest and most consistent RDDE (η¯norm\=0.753,σηnorm\=0.083\\bar{\\eta}\_{\\text{norm}}=0.753,\\sigma\_{\\eta\_{\\text{norm}}}=0.083) compared to HE (η¯ηnorm\=0.666,σnorm\=0.143\\bar{\\eta}\_{\\eta\_{\\text{norm}}}=0.666,\\sigma\_{\\text{norm}}=0.143; Δ\=0.74\\Delta=0.74, p<0.001p<0.001) and HN (η¯norm\=0.697\\bar{\\eta}\_{\\text{norm}}=0.697; Δ\=0.53\\Delta=0.53, p\=0.011p=0.011) texts. The human groups do not differ significantly from each other (p\=0.573p=0.573).

## Detailed

### 5.3 Composite Metrics

#### 5.3.1 Form-Meaning Divergence

FMD follows a monotonic ordering across sub-corpora (Figure [5](https://arxiv.org/html/2604.19768v1#S5.F5 "Figure 5 ‣ 5.3.1 Form-Meaning Divergence ‣ 5.3 Composite Metrics ‣ 5 Results and Discussion ‣ Saying More Than They Know: A Framework for Quantifying Epistemic-Rhetorical Miscalibration in Large Language Models")(a)). The HE texts score lowest (δ¯\=0.009\\bar{\\delta}=0.009), HN intermediate (δ¯\=0.012\\bar{\\delta}=0.012), and LG highest (δ¯\=0.017\\bar{\\delta}=0.017). Both human groups differ significantly from LG (p<0.001p<0.001; Δ\=0.68\\Delta=0.68 for HE vs LG, Δ\=0.30\\Delta=0.30 for HN vs LG), while the difference between the two human groups does not reach significance as the gap is small relative to within-group variance. The dominant effect is the elevation of LLM output beyond both human groups. LLM texts combine elevated rhetorical intensity ρ⁡(d)\\rho(d) while genuine epistemic grounding in the denominator of ([11](https://arxiv.org/html/2604.19768v1#S4.E11 "In 4.3.1 Form-Meaning Divergence (FMD) ‣ 4.3 Stage 3: ERM Feature Engineering ‣ 4 Methodological Implementation ‣ Saying More Than They Know: A Framework for Quantifying Epistemic-Rhetorical Miscalibration in Large Language Models")) does not proportionally compensate. In Gricean terms, their assertoric weight consistently exceeds the epistemic position they report.

![Refer to caption](2604.19768v1/fig5_composite_metrics.png)

Figure 5: Distribution of the three composite ERM metrics across sub-corpora. Each violin shows the full density estimate; the internal bar spans the interquartile range; the white dot marks the median; jittered points show individual documents. Significance brackets: ∗p<.05{}^{\*}p{<}.05, ∗∗∗p<.001{}^{\*\*\*}p{<}.001. (a) FMD δ⁡(d)\\delta(d). (b) GPR γ⁡(d)\\gamma(d). (c) RDDE ηnorm​(d)\\eta\_{\\mathrm{norm}}(d).

#### 5.3.2 Genuine-to-Performed Epistemic Ratio

GPR shows an interesting three-way ordering (Figure [5](https://arxiv.org/html/2604.19768v1#S5.F5 "Figure 5 ‣ 5.3.1 Form-Meaning Divergence ‣ 5.3 Composite Metrics ‣ 5 Results and Discussion ‣ Saying More Than They Know: A Framework for Quantifying Epistemic-Rhetorical Miscalibration in Large Language Models")(b)), with HE highest (γ¯\=0.267\\bar{\\gamma}=0.267), LG intermediate (γ¯\=0.217\\bar{\\gamma}=0.217), and HN lowest (γ¯\=0.172\\bar{\\gamma}=0.172) (p<0.001p<0.001). The largest pairwise contrast is between HE and HN texts (Δ\=0.89\\Delta=0.89, p<0.001p<0.001), reflecting expert advantage in grounding claims in identifiable evidential bases such as extensively higher modal auxiliary counts, adverbials, and syntactic restrictors. LLM texts sit above non-experts but below experts. The LG vs HN comparison does not reach significance (p\=0.055p=0.055), which is consistent with the prompt instruction to engage honestly with uncertainty.

#### 5.3.3 Rhetorical Device Distribution Entropy

LLM-generated texts show (Figure [5](https://arxiv.org/html/2604.19768v1#S5.F5 "Figure 5 ‣ 5.3.1 Form-Meaning Divergence ‣ 5.3 Composite Metrics ‣ 5 Results and Discussion ‣ Saying More Than They Know: A Framework for Quantifying Epistemic-Rhetorical Miscalibration in Large Language Models")(c)) the highest and most consistent RDDE (η¯norm\=0.753,σηnorm\=0.083\\bar{\\eta}\_{\\text{norm}}=0.753,\\sigma\_{\\eta\_{\\text{norm}}}=0.083) compared to HE (η¯ηnorm\=0.666,σnorm\=0.143\\bar{\\eta}\_{\\eta\_{\\text{norm}}}=0.666,\\sigma\_{\\text{norm}}=0.143; Δ\=0.74\\Delta=0.74, p<0.001p<0.001) and HN (η¯norm\=0.697\\bar{\\eta}\_{\\text{norm}}=0.697; Δ\=0.53\\Delta=0.53, p\=0.011p=0.011) texts. The human groups do not differ significantly from each other (p\=0.573p=0.573). Higher entropy indicates more uniform device distribution across the document consistent with stylistically enforcing habit rather than argumentative occasion. The lower LG variance, on the other hand, points to template-driven generation producing cross-document consistency absent in human writing.

## Provenance

Section "5 Results and Discussion > 5.3 Composite Metrics" of https://arxiv.org/html/2604.19768v1 (parent 641ba9dd0a287f068a4ea359713ce7065c431856b306034d96571c131c587cf1)