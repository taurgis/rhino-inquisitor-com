---
schema_version: 1
artifact_type: section
source_url: https://arxiv.org/html/2510.15061#appendix-b-inference-performance-toks
source_urls:
  - https://arxiv.org/html/2510.15061#appendix-b-inference-performance-toks
normalized_url: https://arxiv.org/html/2510.15061
cache_key: ce4fb3703fab8980859daf1799eb84a32dfaaafbdda401b6dad4b5adc31d290a
topic: 
tags:
  - ftpo
  - patterns
  - writing
  - model
  - antislop
format_available:
  - compressed
  - detailed
tier: standard
ttl: 
fetched_at: 2026-10-06T11:12:05.406Z
validated_at: 2026-10-06T11:12:05.406Z
stale_after: 2026-11-05T11:12:05.406Z
capture_method: static_fetch
extraction_status: extracted
extraction_confidence: high
quality_notes:
  - readability extracted main article
  - quality:oversized
  - auto-generated tags via keyword extraction
supplied_at: 
supplied_by: 
etag: "COHypb+HupYDEAE="
last_modified: Mon, 24 Aug 2026 20:02:40 GMT
content_hash: 77ae151781753959768f7270ca6623426c6d1edf35eec4b6f8bbc3e9150d1cee
token_estimate:
  compressed: 229
  detailed: 340
status: active
site_module_id: 
docs_engine: generated-static
docs_framework: 
source_doc_url: 
search_provider: 
parent_cache_key: fae80d484bc2779653026d8ed8fa0909a1fc5232d19cc282b8ce4893b4a2d503
section_anchor: appendix-b-inference-performance-toks
section_heading_path: Appendix B Inference Performance (tok/s)
---

## Summary

Appendix B Inference Performance (tok/s)

## Compressed

## Appendix B Inference Performance (tok/s)

We release two implementations of the Antislop sampler: A single-threaded version using Huggingface Transformers, and a higher-throughput version that works with any OpenAI-compatible v1/completion endpoint that supports top\_logprobs. The sampler incurs significant throughput penalty, especially with larger banlist sizes, due to the backtracking events. This could be optimized further by, for example, integrating the sampler into vLLM directly rather than generating chunkwise via the API.

The maximum token rate of our OpenAI API implementation is discovered with binary search on the number of concurrent threads when generating with vLLM.

We measure a 69% reduction in throughput at a banlist size of 1,000, up to 96% reduction at banlist size 8,000.

Figure 6: Rate of inference is measured for each method when generating with optimal parallelism with vLLM.

## Detailed

## Appendix B Inference Performance (tok/s)

We release two implementations of the Antislop sampler: A single-threaded version using Huggingface Transformers, and a higher-throughput version that works with any OpenAI-compatible v1/completion endpoint that supports top\_logprobs. The sampler incurs significant throughput penalty, especially with larger banlist sizes, due to the backtracking events. There is additional performance lost with the API implementation, since it generates in chunks, with banned pattern detection only occurring after a chunk is generated. This could be optimized further by, for example, integrating the sampler into vLLM directly rather than generating chunkwise via the API.

The maximum token rate of our OpenAI API implementation is discovered with binary search on the number of concurrent threads when generating with vLLM. Figures cited are using a single Nvidia H100 gpu.

We measure a 69% reduction in throughput at a banlist size of 1,000, up to 96% reduction at banlist size 8,000. However, these should be considered worst-case values. A banlist of this size would be overkill for most real-world usage; we include it here as a stress-test.

![Refer to caption](2510.15061v2/iclr2026/figures/tokrate.png)

Figure 6: Rate of inference is measured for each method when generating with optimal parallelism with vLLM.

## Provenance

Section "Appendix B Inference Performance (tok/s)" of https://arxiv.org/html/2510.15061 (parent fae80d484bc2779653026d8ed8fa0909a1fc5232d19cc282b8ce4893b4a2d503)