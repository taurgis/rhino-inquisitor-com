---
schema_version: 1
artifact_type: section
source_url: https://arxiv.org/html/2604.22142#32-models-and-prompt-conditions
source_urls:
  - https://arxiv.org/html/2604.22142#32-models-and-prompt-conditions
normalized_url: https://arxiv.org/html/2604.22142
cache_key: f7adffecef3c28b84c7be291585d6e6d4ed5bedbfe5358f6255b2527f3fcafaa
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
content_hash: 27fbea85845b9363d5c0bbcc96c3f2a734b98a09cbd6f4f6d53ce534aeefe7e5
token_estimate:
  compressed: 390
  detailed: 506
status: active
site_module_id: 
docs_engine: generated-static
docs_framework: 
source_doc_url: 
search_provider: 
parent_cache_key: bb47a8d217f8665cf816470403d6654f64a177b0e44ae2f067c7e22ca3db153b
section_anchor: 32-models-and-prompt-conditions
section_heading_path: 3 Methods > 3.2 Models and Prompt Conditions
---

## Summary

3 Methods > 3.2 Models and Prompt Conditions

## Compressed

### 3.2 Models and Prompt Conditions

The study implements a fully crossed within-subjects design in which each narrative is rewritten under every combination of model and prompt condition. With 300 source narratives, 3 models, and 3 prompt conditions, the design yields 300×3×3\=2,700300\\times 3\\times 3=2{,}700 rewrites.

The study tests three frontier LLMs from major providers: OpenAI GPT-5.4 (gpt5.42026-02), Anthropic Claude Sonnet 4.6 (claudesonnet4.620260215), and Google Gemini 3.1 Pro (gemini3.1pro). Temperature 0.7 balances determinism and variation; robustness checks confirm results hold across settings (see below).

To examine whether normalization depends on instruction framing, the study uses three prompt conditions:

1.  1.
    
    Generic improvement:  
    “Please improve the following story while preserving its meaning.”
    
2.  2.
    
    Voice-preserving improvement:  
    “Please improve the following story while preserving the author’s voice and emotional tone.”
    
3.  3.
    
    Rewrite-only:  
    “Please rewrite the following story.”
    

These conditions separate three related factors, namely broad revision framing, explicit voice-retention guidance, and the presence or absence of evaluative language. The voice-preserving condition tests whether a simple user-level instruction attenuates normalization. The rewrite-only condition removes the evaluative verb improve, allowing us to assess whether normalization is tied specifically to improvement-oriented framing or emerges under rewriting more generally.

## Detailed

### 3.2 Models and Prompt Conditions

The study implements a fully crossed within-subjects design in which each narrative is rewritten under every combination of model and prompt condition. Each text therefore serves as its own control. With 300 source narratives, 3 models, and 3 prompt conditions, the design yields 300×3×3\=2,700300\\times 3\\times 3=2{,}700 rewrites.

The study tests three frontier LLMs from major providers: OpenAI GPT-5.4 (gpt5.42026-02), Anthropic Claude Sonnet 4.6 (claudesonnet4.620260215), and Google Gemini 3.1 Pro (gemini3.1pro). All API calls were made between March 1–15, 2026. These models were selected to capture variation across leading commercial systems rather than minor differences within a single provider. All models were accessed through their official APIs with temperature set to 0.7 and maximum output length set to 4,096 tokens. Temperature 0.7 balances determinism and variation; robustness checks confirm results hold across settings (see below).

To examine whether normalization depends on instruction framing, the study uses three prompt conditions:

1.  1.
    
    Generic improvement:  
    “Please improve the following story while preserving its meaning.”
    
2.  2.
    
    Voice-preserving improvement:  
    “Please improve the following story while preserving the author’s voice and emotional tone.”
    
3.  3.
    
    Rewrite-only:  
    “Please rewrite the following story.”
    

These conditions separate three related factors, namely broad revision framing, explicit voice-retention guidance, and the presence or absence of evaluative language. The generic condition approximates a common writing-assistant request without stylistic constraints. The voice-preserving condition tests whether a simple user-level instruction attenuates normalization. The rewrite-only condition removes the evaluative verb improve, allowing us to assess whether normalization is tied specifically to improvement-oriented framing or emerges under rewriting more generally.

## Provenance

Section "3 Methods > 3.2 Models and Prompt Conditions" of https://arxiv.org/html/2604.22142 (parent bb47a8d217f8665cf816470403d6654f64a177b0e44ae2f067c7e22ca3db153b)