---
schema_version: 1
artifact_type: section
source_url: https://arxiv.org/html/2502.20258v2#d1-bilingual-self-loop-bleurt-scores
source_urls:
  - https://arxiv.org/html/2502.20258v2#d1-bilingual-self-loop-bleurt-scores
normalized_url: https://arxiv.org/html/2502.20258v2
cache_key: 49320c5afc68fdda5b24b9fdfc2fab5042ea40293bd17a49bf9a8f5f3fd4ebaa
topic: 
tags:
  - information
  - generation
  - iterative
  - text
  - translation
format_available:
  - compressed
  - detailed
tier: standard
ttl: 
fetched_at: 2026-10-06T11:13:30.421Z
validated_at: 2026-10-06T11:13:30.421Z
stale_after: 2026-11-05T11:13:30.421Z
capture_method: static_fetch
extraction_status: extracted
extraction_confidence: high
quality_notes:
  - readability extracted main article
  - quality:oversized
  - auto-generated tags via keyword extraction
supplied_at: 
supplied_by: 
etag: "CMn125ucupYDEAE="
last_modified: Mon, 24 Aug 2026 21:35:22 GMT
content_hash: a4044431451ccf605472f310b9647c9bfc45f983c1ddde5bacbe633f8b5c514f
token_estimate:
  compressed: 260
  detailed: 519
status: active
site_module_id: 
docs_engine: generated-static
docs_framework: 
source_doc_url: 
search_provider: 
parent_cache_key: a1c86bc6b03006b552add6c9ff8866e20526f5ba29d5c91ecb2dff9a302b9c20
section_anchor: d1-bilingual-self-loop-bleurt-scores
section_heading_path: Appendix D Additional BLEURT Score Evaluations > D.1 Bilingual Self-loop BLEURT Scores
---

## Summary

Appendix D Additional BLEURT Score Evaluations > D.1 Bilingual Self-loop BLEURT Scores

## Compressed

### D.1 Bilingual Self-loop BLEURT Scores

Table [4] presents the BLEURT scores for the Bilingual Self-loop experiment, corresponding to the Llama model on the News2024 dataset (as detailed in Section [4.1] and visualized for other metrics in Figure [2]).

Table 4: BLEURT scores for the Bilingual Self-loop experiment using Llama on the News2024 dataset. Scores show the evolution of text quality over 100 iterations for different language pairs.

Similar to our previous results for textual relevance and factuality in this experimental setup, the BLEURT scores exhibit the same trends. This degradation is less severe for language pairs where the bridge language uses a Latin script and shares more similarities with English (e.g., EN ↔\\leftrightarrow FR, EN ↔\\leftrightarrow NL, EN ↔\\leftrightarrow DE), which show higher BLEURT scores throughout the iterations compared to pairs involving non-Latin scripts or more distant languages (e.g., EN ↔\\leftrightarrow VN, EN ↔\\leftrightarrow ZH, and particularly EN ↔\\leftrightarrow TH).

## Detailed

### D.1 Bilingual Self-loop BLEURT Scores

Table [4](https://arxiv.org/html/2502.20258v2#A4.T4 "Table 4 ‣ D.1 Bilingual Self-loop BLEURT Scores ‣ Appendix D Additional BLEURT Score Evaluations ‣ LLM as a Broken Telephone: Iterative Generation Distorts Information") presents the BLEURT scores for the Bilingual Self-loop experiment, corresponding to the Llama model on the News2024 dataset (as detailed in Section [4.1](https://arxiv.org/html/2502.20258v2#S4.SS1 "4.1 Experiment 1: Bilingual Self-loop ‣ 4 Experiments ‣ LLM as a Broken Telephone: Iterative Generation Distorts Information") and visualized for other metrics in Figure [2](https://arxiv.org/html/2502.20258v2#S4.F2 "Figure 2 ‣ 4.1 Experiment 1: Bilingual Self-loop ‣ 4 Experiments ‣ LLM as a Broken Telephone: Iterative Generation Distorts Information")).

Table 4: BLEURT scores for the Bilingual Self-loop experiment using Llama on the News2024 dataset. Scores show the evolution of text quality over 100 iterations for different language pairs.

Similar to our previous results for textual relevance and factuality in this experimental setup, the BLEURT scores exhibit the same trends. Specifically, there is a consistent decline in scores across all iterations, indicating progressive degradation of text quality. This degradation is less severe for language pairs where the bridge language uses a Latin script and shares more similarities with English (e.g., EN ↔\\leftrightarrow FR, EN ↔\\leftrightarrow NL, EN ↔\\leftrightarrow DE), which show higher BLEURT scores throughout the iterations compared to pairs involving non-Latin scripts or more distant languages (e.g., EN ↔\\leftrightarrow VN, EN ↔\\leftrightarrow ZH, and particularly EN ↔\\leftrightarrow TH). This observation aligns with Hypothesis [1](https://arxiv.org/html/2502.20258v2#Thmhyp1 "Hypothesis 1 (H) ‣ 4.1 Experiment 1: Bilingual Self-loop ‣ 4 Experiments ‣ LLM as a Broken Telephone: Iterative Generation Distorts Information"), which posited that lexical and script similarity would influence the degree of information distortion.

## Provenance

Section "Appendix D Additional BLEURT Score Evaluations > D.1 Bilingual Self-loop BLEURT Scores" of https://arxiv.org/html/2502.20258v2 (parent a1c86bc6b03006b552add6c9ff8866e20526f5ba29d5c91ecb2dff9a302b9c20)