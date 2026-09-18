---
schema_version: 1
artifact_type: section
source_url: https://arxiv.org/html/2303.11156v4#c1-proof-of-theorem-1
source_urls:
  - https://arxiv.org/html/2303.11156v4#c1-proof-of-theorem-1
normalized_url: https://arxiv.org/html/2303.11156v4
cache_key: d8ebb64f19aecdf861cacdd79924962f0db4df51db8ee31b0a6ad9de5a8f379d
topic: 
tags:
  - text
  - mathcal
  - ai-generated
  - paraphrasing
  - detected
format_available:
  - compressed
  - detailed
tier: standard
ttl: 
fetched_at: 2026-09-18T07:07:31.348Z
validated_at: 2026-09-18T07:07:31.348Z
stale_after: 2026-10-18T07:07:31.348Z
capture_method: static_fetch
extraction_status: extracted
extraction_confidence: high
quality_notes:
  - readability extracted main article
  - quality:oversized
  - auto-generated tags via keyword extraction
supplied_at: 
supplied_by: 
etag: "CILG0biOupYDEAE="
last_modified: Mon, 24 Aug 2026 20:33:45 GMT
content_hash: 4aa149c3a9ac42645f49e7b1a0901f8cd592a1570c3c2672a0c8b0431ea5bf68
token_estimate:
  compressed: 598
  detailed: 675
status: active
site_module_id: 
docs_engine: generated-static
docs_framework: 
source_doc_url: 
search_provider: 
parent_cache_key: c3e4ea511335c20b7066458b397a125e4545e17b1de484a06f9869d9f4d1f8ba
section_anchor: c1-proof-of-theorem-1
section_heading_path: Appendix C Proofs and Corollaries > C.1 Proof of Theorem 1
---

## Summary

Appendix C Proofs and Corollaries > C.1 Proof of Theorem 1

## Compressed

### C.1 Proof of Theorem [1]

###### Theorem 1.

The area under the ROC of any detector DD is bounded as

|  | 𝖠𝖴𝖱𝖮𝖢⁡(D)≤12+𝖳𝖵⁡(ℳ,ℋ)−𝖳𝖵​(ℳ,ℋ)22.\mathsf{AUROC}(D)\leq\frac{1}{2}+\mathsf{TV}(\mathcal{M},\mathcal{H})-\frac{\mathsf{TV}(\mathcal{M},\mathcal{H})^{2}}{2}. |  |
| --- | --- | --- |

###### Proof.

The ROC is a plot between the true positive rate (TPR) and the false positive rate (FPR), which are defined as follows:

|  | 𝖳𝖯𝖱γ\displaystyle\mathsf{TPR}_{\gamma} | =Ps∼ℳ[D(s)≥γ]\displaystyle=\mathbb{P}_{s\sim\mathcal{M}}[D(s)\geq\gamma] |  |
| --- | --- | --- | --- |
|  | and ​𝖥𝖯𝖱γ\displaystyle\text{and }\mathsf{FPR}_{\gamma} | =Ps∼ℋ[D(s)≥γ],\displaystyle=\mathbb{P}_{s\sim\mathcal{H}}[D(s)\geq\gamma], |  |

where γ\\gamma is some classifier parameter.

|  | \|𝖳𝖯𝖱γ−𝖥𝖯𝖱γ\|\displaystyle\|\mathsf{TPR}_{\gamma}-\mathsf{FPR}_{\gamma}\| | =\|Ps∼ℳ[D(s)≥γ]−Ps∼ℋ[D(s)≥γ]\|≤𝖳𝖵(ℳ,ℋ)\displaystyle=\left\|\mathbb{P}_{s\sim\mathcal{M}}[D(s)\geq\gamma]-\mathbb{P}_{s\sim\mathcal{H}}[D(s)\geq\gamma]\right\|\leq\mathsf{TV}(\mathcal{M},\mathcal{H}) |  | (1) |
| --- | --- | --- | --- | --- |
|  | 𝖳𝖯𝖱γ\displaystyle\mathsf{TPR}_{\gamma} | ≤𝖥𝖯𝖱γ+𝖳𝖵⁡(ℳ,ℋ).\displaystyle\leq\mathsf{FPR}_{\gamma}+\mathsf{TV}(\mathcal{M},\mathcal{H}). |  | (2) |

Since the 𝖳𝖯𝖱γ\\mathsf{TPR}\_{\\gamma} is also bounded by 1 we have:

|  | 𝖳𝖯𝖱γ≤min⁡(𝖥𝖯𝖱γ+𝖳𝖵⁡(ℳ,ℋ),1).\displaystyle\mathsf{TPR}_{\gamma}\leq\min(\mathsf{FPR}_{\gamma}+\mathsf{TV}(\mathcal{M},\mathcal{H}),1). |  | (3) |
| --- | --- | --- | --- |

Denoting 𝖥𝖯𝖱γ\\mathsf{FPR}\_{\\gamma}, 𝖳𝖯𝖱γ\\mathsf{TPR}\_{\\gamma}, and 𝖳𝖵⁡(ℳ,ℋ)\\mathsf{TV}(\\mathcal{M},\\mathcal{H}) with xx, yy, and t​vtv for brevity, we bound the AUROC as follows:

|  | 𝖠𝖴𝖱𝖮𝖢⁡(D)=∫01y​𝑑x\displaystyle\mathsf{AUROC}(D)=\int_{0}^{1}y\;dx | ≤∫01min⁡(x+t​v,1)​𝑑x\displaystyle\leq\int_{0}^{1}\min(x+tv,1)dx |  |
| --- | --- | --- | --- |
|  |  | =∫01−t​v(x+t​v)​𝑑x+∫1−t​v1𝑑x\displaystyle=\int_{0}^{1-tv}(x+tv)dx+\int_{1-tv}^{1}dx |  |
|  |  | =\|x22+t​v​x\|01−t​v+\|x\|1−t​v1\displaystyle=\left\|\frac{x^{2}}{2}+tvx\right\|_{0}^{1-tv}+\left\|x\right\|_{1-tv}^{1} |  |
|  |  | =(1−t​v)22+t​v​(1−t​v)+t​v\displaystyle=\frac{(1-tv)^{2}}{2}+tv(1-tv)+tv |  |
|  |  | =12+t​v22−t​v+t​v−t​v2+t​v\displaystyle=\frac{1}{2}+\frac{tv^{2}}{2}-tv+tv-tv^{2}+tv |  |
|  |  | =12+t​v−t​v22.\displaystyle=\frac{1}{2}+tv-\frac{tv^{2}}{2}. |  |

∎

## Detailed

### C.1 Proof of Theorem [1](https://arxiv.org/html/2303.11156v4#Thmtheorem1 "Theorem 1. ‣ 4 Hardness of Reliable AI Text Detection ‣ Can AI-Generated Text be Reliably Detected?")

###### Theorem 1.

The area under the ROC of any detector DD is bounded as

|  | 𝖠𝖴𝖱𝖮𝖢⁡(D)≤12+𝖳𝖵⁡(ℳ,ℋ)−𝖳𝖵​(ℳ,ℋ)22.\mathsf{AUROC}(D)\leq\frac{1}{2}+\mathsf{TV}(\mathcal{M},\mathcal{H})-\frac{\mathsf{TV}(\mathcal{M},\mathcal{H})^{2}}{2}. |  |
| --- | --- | --- |

###### Proof.

The ROC is a plot between the true positive rate (TPR) and the false positive rate (FPR), which are defined as follows:

|  | 𝖳𝖯𝖱γ\displaystyle\mathsf{TPR}_{\gamma} | =Ps∼ℳ[D(s)≥γ]\displaystyle=\mathbb{P}_{s\sim\mathcal{M}}[D(s)\geq\gamma] |  |
| --- | --- | --- | --- |
|  | and ​𝖥𝖯𝖱γ\displaystyle\text{and }\mathsf{FPR}_{\gamma} | =Ps∼ℋ[D(s)≥γ],\displaystyle=\mathbb{P}_{s\sim\mathcal{H}}[D(s)\geq\gamma], |  |

where γ\\gamma is some classifier parameter. We can bound the difference between the 𝖳𝖯𝖱γ\\mathsf{TPR}\_{\\gamma} and the 𝖥𝖯𝖱γ\\mathsf{FPR}\_{\\gamma} by the total variation between MM and HH:

|  | \|𝖳𝖯𝖱γ−𝖥𝖯𝖱γ\|\displaystyle\|\mathsf{TPR}_{\gamma}-\mathsf{FPR}_{\gamma}\| | =\|Ps∼ℳ[D(s)≥γ]−Ps∼ℋ[D(s)≥γ]\|≤𝖳𝖵(ℳ,ℋ)\displaystyle=\left\|\mathbb{P}_{s\sim\mathcal{M}}[D(s)\geq\gamma]-\mathbb{P}_{s\sim\mathcal{H}}[D(s)\geq\gamma]\right\|\leq\mathsf{TV}(\mathcal{M},\mathcal{H}) |  | (1) |
| --- | --- | --- | --- | --- |
|  | 𝖳𝖯𝖱γ\displaystyle\mathsf{TPR}_{\gamma} | ≤𝖥𝖯𝖱γ+𝖳𝖵⁡(ℳ,ℋ).\displaystyle\leq\mathsf{FPR}_{\gamma}+\mathsf{TV}(\mathcal{M},\mathcal{H}). |  | (2) |

Since the 𝖳𝖯𝖱γ\\mathsf{TPR}\_{\\gamma} is also bounded by 1 we have:

|  | 𝖳𝖯𝖱γ≤min⁡(𝖥𝖯𝖱γ+𝖳𝖵⁡(ℳ,ℋ),1).\displaystyle\mathsf{TPR}_{\gamma}\leq\min(\mathsf{FPR}_{\gamma}+\mathsf{TV}(\mathcal{M},\mathcal{H}),1). |  | (3) |
| --- | --- | --- | --- |

Denoting 𝖥𝖯𝖱γ\\mathsf{FPR}\_{\\gamma}, 𝖳𝖯𝖱γ\\mathsf{TPR}\_{\\gamma}, and 𝖳𝖵⁡(ℳ,ℋ)\\mathsf{TV}(\\mathcal{M},\\mathcal{H}) with xx, yy, and t​vtv for brevity, we bound the AUROC as follows:

|  | 𝖠𝖴𝖱𝖮𝖢⁡(D)=∫01y​𝑑x\displaystyle\mathsf{AUROC}(D)=\int_{0}^{1}y\;dx | ≤∫01min⁡(x+t​v,1)​𝑑x\displaystyle\leq\int_{0}^{1}\min(x+tv,1)dx |  |
| --- | --- | --- | --- |
|  |  | =∫01−t​v(x+t​v)​𝑑x+∫1−t​v1𝑑x\displaystyle=\int_{0}^{1-tv}(x+tv)dx+\int_{1-tv}^{1}dx |  |
|  |  | =\|x22+t​v​x\|01−t​v+\|x\|1−t​v1\displaystyle=\left\|\frac{x^{2}}{2}+tvx\right\|_{0}^{1-tv}+\left\|x\right\|_{1-tv}^{1} |  |
|  |  | =(1−t​v)22+t​v​(1−t​v)+t​v\displaystyle=\frac{(1-tv)^{2}}{2}+tv(1-tv)+tv |  |
|  |  | =12+t​v22−t​v+t​v−t​v2+t​v\displaystyle=\frac{1}{2}+\frac{tv^{2}}{2}-tv+tv-tv^{2}+tv |  |
|  |  | =12+t​v−t​v22.\displaystyle=\frac{1}{2}+tv-\frac{tv^{2}}{2}. |  |

∎

## Provenance

Section "Appendix C Proofs and Corollaries > C.1 Proof of Theorem 1" of https://arxiv.org/html/2303.11156v4 (parent c3e4ea511335c20b7066458b397a125e4545e17b1de484a06f9869d9f4d1f8ba)