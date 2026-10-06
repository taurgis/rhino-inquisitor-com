---
schema_version: 1
artifact_type: section
source_url: https://arxiv.org/html/2509.10179#32-statistical-processing
source_urls:
  - https://arxiv.org/html/2509.10179#32-statistical-processing
normalized_url: https://arxiv.org/html/2509.10179
cache_key: 4addd1e9dbc90b9e7dc6fcb0ddc332e57dff1776cc22353744f9c7fd3b7d1acd
topic: 
tags:
  - models
  - texts
  - english
  - stylistic
  - czech
format_available:
  - compressed
  - detailed
tier: standard
ttl: 
fetched_at: 2026-10-06T11:13:21.495Z
validated_at: 2026-10-06T11:13:21.495Z
stale_after: 2026-11-05T11:13:21.495Z
capture_method: static_fetch
extraction_status: extracted
extraction_confidence: high
quality_notes:
  - readability extracted main article
  - quality:oversized
  - auto-generated tags via keyword extraction
supplied_at: 
supplied_by: 
etag: "CMXLu/b9uZYDEAE="
last_modified: Mon, 24 Aug 2026 19:19:51 GMT
content_hash: 03fa56d04478b09e3b2482f12ab2f1e29a62b32d040301f61c8a0d4ef597702e
token_estimate:
  compressed: 344
  detailed: 398
status: active
site_module_id: 
docs_engine: generated-static
docs_framework: 
source_doc_url: 
search_provider: 
parent_cache_key: 13756bc15f061e267dcde7f9a02047170b2049f7de27c464a732ee0e536eaa2d
section_anchor: 32-statistical-processing
section_heading_path: 3 Analysis methods > 3.2 Statistical processing
---

## Summary

3 Analysis methods > 3.2 Statistical processing

## Compressed

### 3.2 Statistical processing

Simple comparison in each dimension is realized as a difference between the second part of the original text chunk vo​r​i​g​2\\textbf{v}\_{orig2} and the generated text chunk vm​o​d​e​l\\textbf{v}\_{model} in each dimension:

|  | Δ​v=vo​r​i​g​2−vm​o​d​e​l.\Delta\textbf{v}=\textbf{v}_{orig2}-\textbf{v}_{model}. |  | (1) |
| --- | --- | --- | --- |

The average of these differences for each dimension Δ​vd¯\\overline{\\Delta v\_{d}} can serve to compare models on each dimension separately, but cannot be used to compare the models across dimensions, since each of these dimensions have different baseline behavior (some of them differ a lot even within two halves of the same texts, others are stable).

|  | i=vo​r​i​g​2−vo​r​i​g​1,\textbf{i}=\textbf{v}_{orig2}-\textbf{v}_{orig1}, |  | (2) |
| --- | --- | --- | --- |

and

|  | bd=Δ​vd¯SE​(Id).b_{d}=\frac{\overline{\Delta v_{d}}}{\textnormal{SE}(I_{d})}. |  | (3) |
| --- | --- | --- | --- |

To obtain less fine-grained, one-dimensional benchmark BB (only one number per model), Euclidean length of these normalized average vectors can be calculated:

|  | B=‖b‖.B=\|\|\textbf{b}\|\|. |  | (4) |
| --- | --- | --- | --- |

At each step, confidence intervals are calculated by bootstrap resampling (even the SE is calculated by resampling, since the underlying distribution is unknown).

## Detailed

### 3.2 Statistical processing

Simple comparison in each dimension is realized as a difference between the second part of the original text chunk vo​r​i​g​2\\textbf{v}\_{orig2} and the generated text chunk vm​o​d​e​l\\textbf{v}\_{model} in each dimension:

|  | Δ​v=vo​r​i​g​2−vm​o​d​e​l.\Delta\textbf{v}=\textbf{v}_{orig2}-\textbf{v}_{model}. |  | (1) |
| --- | --- | --- | --- |

The average of these differences for each dimension Δ​vd¯\\overline{\\Delta v\_{d}} can serve to compare models on each dimension separately, but cannot be used to compare the models across dimensions, since each of these dimensions have different baseline behavior (some of them differ a lot even within two halves of the same texts, others are stable). This is why the main metric of the benchmark (bdb\_{d}) is calculated by normalizing the average differences by the standard error of differences between the two halves of the original text chunk (idi\_{d}), where:

|  | i=vo​r​i​g​2−vo​r​i​g​1,\textbf{i}=\textbf{v}_{orig2}-\textbf{v}_{orig1}, |  | (2) |
| --- | --- | --- | --- |

and

|  | bd=Δ​vd¯SE​(Id).b_{d}=\frac{\overline{\Delta v_{d}}}{\textnormal{SE}(I_{d})}. |  | (3) |
| --- | --- | --- | --- |

To obtain less fine-grained, one-dimensional benchmark BB (only one number per model), Euclidean length of these normalized average vectors can be calculated:

|  | B=‖b‖.B=\|\|\textbf{b}\|\|. |  | (4) |
| --- | --- | --- | --- |

At each step, confidence intervals are calculated by bootstrap resampling (even the SE is calculated by resampling, since the underlying distribution is unknown).

## Provenance

Section "3 Analysis methods > 3.2 Statistical processing" of https://arxiv.org/html/2509.10179 (parent 13756bc15f061e267dcde7f9a02047170b2049f7de27c464a732ee0e536eaa2d)