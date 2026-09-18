---
schema_version: 1
artifact_type: section
source_url: https://arxiv.org/html/2304.02819v3#mitigating-bias-through-linguistic-diversity-enhancement-of-non-native-samples
source_urls:
  - https://arxiv.org/html/2304.02819v3#mitigating-bias-through-linguistic-diversity-enhancement-of-non-native-samples
normalized_url: https://arxiv.org/html/2304.02819v3
cache_key: 66c3e3b4d88f32a5f90caa4f9a66efcddf43fb43d0fec7bceae7da3a32d2db5b
topic: 
tags:
  - detectors
  - non-native
  - gpt
  - essays
  - english
format_available:
  - compressed
  - detailed
tier: standard
ttl: 
fetched_at: 2026-09-18T07:03:51.024Z
validated_at: 2026-09-18T07:03:51.024Z
stale_after: 2026-10-18T07:03:51.024Z
capture_method: static_fetch
extraction_status: extracted
extraction_confidence: high
quality_notes:
  - readability extracted main article
  - quality:oversized
  - auto-generated tags via keyword extraction
supplied_at: 
supplied_by: 
etag: "CO/H3835uZYDEAE="
last_modified: Mon, 24 Aug 2026 19:00:32 GMT
content_hash: 0b273b59020301ae2f5c378dede3badff85b6714d19555832aa7616ae910dcff
token_estimate:
  compressed: 489
  detailed: 891
status: active
site_module_id: 
docs_engine: generated-static
docs_framework: 
source_doc_url: 
search_provider: 
parent_cache_key: dc97fc161b55d880fe42481487f0f339e678b20309371e50f7a83bbaedec7b0b
section_anchor: mitigating-bias-through-linguistic-diversity-enhancement-of-non-native-samples
section_heading_path: Results > Mitigating Bias through Linguistic Diversity Enhancement of Non-Native Samples
---

## Summary

Results > Mitigating Bias through Linguistic Diversity Enhancement of Non-Native Samples

## Compressed

### Mitigating Bias through Linguistic Diversity Enhancement of Non-Native Samples

To explore the hypothesis that the restricted linguistic variability and word choices characteristic of non-native English writers contribute to the observed bias, we employed ChatGPT to enrich the language in the TOEFL essays, aiming to emulate the vocabulary usage of native speakers (Prompt: “Enhance the word choices to sound more like that of a native speaker.”) (Fig. In contrast, applying ChatGPT to adjust the word choices in US 8th-grade essays to mimic non-native speaker writing (Prompt: "Simplify word choices as if written by a non-native speaker.") led to a significant increase in the misclassification rate as AI-generated text, from an average of 5.19% across detectors to 56.65% (Fig. This word choice adjustment also resulted in significantly lower text perplexity (Fig.

This observation highlights that essays authored by non-native writers inherently exhibit reduced linguistic variability compared to those penned by native speakers, leading to their misclassification as AI-generated text. Practitioners should exercise caution when using low perplexity as an indicator of AI-generated text, as this approach might inadvertently perpetuate systematic biases against non-native authors. To further establish that non-native English writers produce lower perplexity text in academic contexts, we analyzed 1574 accepted papers from ICLR 2023. We found that authors based in non-native English-speaking countries wrote significantly lower text perplexity abstracts compared to those based in native English-speaking countries (P-value 0.035). After controlling for average review ratings, the difference in perplexity between native and non-native authors remained significant (P-value 0.033). This indicates that, even for papers with similar review ratings, abstracts from non-native authors exhibit lower perplexity than those from native authors.

## Detailed

### Mitigating Bias through Linguistic Diversity Enhancement of Non-Native Samples

To explore the hypothesis that the restricted linguistic variability and word choices characteristic of non-native English writers contribute to the observed bias, we employed ChatGPT to enrich the language in the TOEFL essays, aiming to emulate the vocabulary usage of native speakers (Prompt: “Enhance the word choices to sound more like that of a native speaker.”) (Fig. [1](https://arxiv.org/html/2304.02819v3#Sx6.F1 "Figure 1 ‣ GPT detectors are biased against non-native English writers")cc). Remarkably, this intervention led to a substantial reduction in misclassification, with the average false positive rate decreasing by 49.45% (from 61.22% to 11.77%). Post-intervention, the TOEFL essays’ perplexity significantly increased (P-value=9.36E-05), and only 1 out of 91 essays (1.10%) was unanimously detected as AI-written. In contrast, applying ChatGPT to adjust the word choices in US 8th-grade essays to mimic non-native speaker writing (Prompt: "Simplify word choices as if written by a non-native speaker.") led to a significant increase in the misclassification rate as AI-generated text, from an average of 5.19% across detectors to 56.65% (Fig. [1](https://arxiv.org/html/2304.02819v3#Sx6.F1 "Figure 1 ‣ GPT detectors are biased against non-native English writers")a​cac). This word choice adjustment also resulted in significantly lower text perplexity (Fig. [1](https://arxiv.org/html/2304.02819v3#Sx6.F1 "Figure 1 ‣ GPT detectors are biased against non-native English writers")dd).

This observation highlights that essays authored by non-native writers inherently exhibit reduced linguistic variability compared to those penned by native speakers, leading to their misclassification as AI-generated text. Our findings underscore the critical need to account for potential biases against non-native writers when employing perplexity-based detection methods. Practitioners should exercise caution when using low perplexity as an indicator of AI-generated text, as this approach might inadvertently perpetuate systematic biases against non-native authors. Non-native English writers have been shown to exhibit reduced linguistic variability in terms of lexical richness \[[25](https://arxiv.org/html/2304.02819v3#bib.bib25)\], lexical diversity \[[26](https://arxiv.org/html/2304.02819v3#bib.bib26), [27](https://arxiv.org/html/2304.02819v3#bib.bib27)\], syntactic complexity \[[28](https://arxiv.org/html/2304.02819v3#bib.bib28), [29](https://arxiv.org/html/2304.02819v3#bib.bib29), [30](https://arxiv.org/html/2304.02819v3#bib.bib30)\], and grammatical complexity \[[31](https://arxiv.org/html/2304.02819v3#bib.bib31)\]. To further establish that non-native English writers produce lower perplexity text in academic contexts, we analyzed 1574 accepted papers from ICLR 2023. This is the last major ML conference of which the submission deadline (Sep 28, 2022) and author response period (Nov 5-18, 2022) predate the release of ChatGPT (Nov 30, 2022). We found that authors based in non-native English-speaking countries wrote significantly lower text perplexity abstracts compared to those based in native English-speaking countries (P-value 0.035). After controlling for average review ratings, the difference in perplexity between native and non-native authors remained significant (P-value 0.033). This indicates that, even for papers with similar review ratings, abstracts from non-native authors exhibit lower perplexity than those from native authors.

## Provenance

Section "Results > Mitigating Bias through Linguistic Diversity Enhancement of Non-Native Samples" of https://arxiv.org/html/2304.02819v3 (parent dc97fc161b55d880fe42481487f0f339e678b20309371e50f7a83bbaedec7b0b)