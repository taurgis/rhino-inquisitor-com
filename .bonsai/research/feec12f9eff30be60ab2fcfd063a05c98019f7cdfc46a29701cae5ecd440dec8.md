---
schema_version: 1
artifact_type: section
source_url: https://arxiv.org/html/2604.22142#51-findings
source_urls:
  - https://arxiv.org/html/2604.22142#51-findings
normalized_url: https://arxiv.org/html/2604.22142
cache_key: feec12f9eff30be60ab2fcfd063a05c98019f7cdfc46a29701cae5ecd440dec8
topic: 
tags:
  - narrative
  - models
  - under
  - normalization
  - voice
format_available:
  - compressed
  - detailed
tier: standard
ttl: 
fetched_at: 2026-10-06T11:13:49.558Z
validated_at: 2026-10-06T11:13:49.558Z
stale_after: 2026-11-05T11:13:49.558Z
capture_method: static_fetch
extraction_status: extracted
extraction_confidence: high
quality_notes:
  - readability extracted main article
  - quality:oversized
  - auto-generated tags via keyword extraction
supplied_at: 
supplied_by: 
etag: "CKiz+u6YupYDEAE="
last_modified: Mon, 24 Aug 2026 21:20:23 GMT
content_hash: f24cf91bb5d902b143bbb531b45aa8eeeedbbeda355e4bb3e86963b579549168
token_estimate:
  compressed: 197
  detailed: 212
status: active
site_module_id: 
docs_engine: generated-static
docs_framework: 
source_doc_url: 
search_provider: 
parent_cache_key: bb47a8d217f8665cf816470403d6654f64a177b0e44ae2f067c7e22ca3db153b
section_anchor: 51-findings
section_heading_path: 5 Model-Specific Anomaly: Increased Compression Under Voice-Preserving Prompting > 5.1 Findings
---

## Summary

5 Model-Specific Anomaly: Increased Compression Under Voice-Preserving Prompting > 5.1 Findings

## Compressed

### 5.1 Findings

Using Levene’s test for equality of variances across 58 stylometric features (combining the 13 core markers with additional character n-gram and lexical measures), variance compression was compared between prompt conditions:

*   •
    
    Generic prompt: Claude compressed 78% of features (45/58) with a median variance reduction of 26%. Multivariate dispersion decreased by 9% (Cohen’s d\=0.36d=0.36).
    
*   •
    
    Voice-preserving prompt: Claude compressed 95% of features (55/58) with a median variance reduction of 34%. Multivariate dispersion decreased by 16% (Cohen’s d\=0.65d=0.65).
    

This represents an 80% increase in effect size (d\=0.36→0.65d=0.36\\rightarrow 0.65), moving from a “small” to a “medium” effect under the conventional benchmarks.

## Detailed

### 5.1 Findings

Using Levene’s test for equality of variances across 58 stylometric features (combining the 13 core markers with additional character n-gram and lexical measures), variance compression was compared between prompt conditions:

*   •
    
    Generic prompt: Claude compressed 78% of features (45/58) with a median variance reduction of 26%. Multivariate dispersion decreased by 9% (Cohen’s d\=0.36d=0.36).
    
*   •
    
    Voice-preserving prompt: Claude compressed 95% of features (55/58) with a median variance reduction of 34%. Multivariate dispersion decreased by 16% (Cohen’s d\=0.65d=0.65).
    

This represents an 80% increase in effect size (d\=0.36→0.65d=0.36\\rightarrow 0.65), moving from a “small” to a “medium” effect under the conventional benchmarks. The proportion of features showing compression rises to 95%.

## Provenance

Section "5 Model-Specific Anomaly: Increased Compression Under Voice-Preserving Prompting > 5.1 Findings" of https://arxiv.org/html/2604.22142 (parent bb47a8d217f8665cf816470403d6654f64a177b0e44ae2f067c7e22ca3db153b)