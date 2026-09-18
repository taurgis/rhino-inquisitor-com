---
schema_version: 1
artifact_type: section
source_url: https://arxiv.org/html/2303.11156v4#c3-tightness-analysis-for-theorem-1
source_urls:
  - https://arxiv.org/html/2303.11156v4#c3-tightness-analysis-for-theorem-1
normalized_url: https://arxiv.org/html/2303.11156v4
cache_key: 6fbcea83d2ee98c48fb4415926dc96a18f9deeff8abaa8e9c009fadeed49c72c
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
content_hash: 1b08af4edf82d1c0462f05e0d1a6915b8dbcd48e4c9ca16ee2397107f958ecb3
token_estimate:
  compressed: 1031
  detailed: 1256
status: active
site_module_id: 
docs_engine: generated-static
docs_framework: 
source_doc_url: 
search_provider: 
parent_cache_key: c3e4ea511335c20b7066458b397a125e4545e17b1de484a06f9869d9f4d1f8ba
section_anchor: c3-tightness-analysis-for-theorem-1
section_heading_path: Appendix C Proofs and Corollaries > C.3 Tightness Analysis for Theorem 1
---

## Summary

Appendix C Proofs and Corollaries > C.3 Tightness Analysis for Theorem 1

## Compressed

### C.3 Tightness Analysis for Theorem [1]

In this section, we show that the bound in Theorem [1] is tight. Define sublevel sets of the probability density function of the distribution of human-generated text 𝗉𝖽𝖿ℋ\\mathsf{pdf}\_{\\mathcal{H}} over the set of all sequences Ω\\Omega as follows:

|  | Ωℋ​(c)={s∈Ω∣𝗉𝖽𝖿ℋ​(s)≤c}\Omega_{\mathcal{H}}(c)=\{s\in\Omega\mid\mathsf{pdf}_{\mathcal{H}}(s)\leq c\} |  |
| --- | --- | --- |

where c∈Rc\\in\\mathbb{R}. Now, consider a distribution ℳ\\mathcal{M}, with density function 𝗉𝖽𝖿ℳ\\mathsf{pdf}\_{\\mathcal{M}}, which has the following properties:

1.  1.
    
    The probability of a sequence drawn from ℳ\\mathcal{M} falling in Ωℋ​(0)\\Omega\_{\\mathcal{H}}(0) is 𝖳𝖵⁡(ℳ,ℋ)\\mathsf{TV}(\\mathcal{M},\\mathcal{H}), i.e., Ps∼ℳ\[s∈Ωℋ(0)\]\=𝖳𝖵(ℳ,ℋ)\\mathbb{P}\_{s\\sim\\mathcal{M}}\[s\\in\\Omega\_{\\mathcal{H}}(0)\]=\\mathsf{TV}(\\mathcal{M},\\mathcal{H}).
    
2.  2.
    
    𝗉𝖽𝖿ℳ​(s)\=𝗉𝖽𝖿ℋ​(s)\\mathsf{pdf}\_{\\mathcal{M}}(s)=\\mathsf{pdf}\_{\\mathcal{H}}(s) for all s∈Ω⁡(τ)−Ω⁡(0)s\\in\\Omega(\\tau)-\\Omega(0) where τ\>0\\tau>0 such that Ps∼ℋ\[s∈Ω(τ)\]\=1−𝖳𝖵(ℳ,ℋ)\\mathbb{P}\_{s\\sim\\mathcal{H}}\[s\\in\\Omega(\\tau)\]=1-\\mathsf{TV}(\\mathcal{M},\\mathcal{H}).
    
3.  3.
    
    𝗉𝖽𝖿ℳ​(s)\=0\\mathsf{pdf}\_{\\mathcal{M}}(s)=0 for all s∈Ω−Ω⁡(τ)s\\in\\Omega-\\Omega(\\tau).
    

Define a hypothetical detector DD that maps each sequence in Ω\\Omega to the negative of the probability density function of ℋ\\mathcal{H}, i.e., D​(s)\=−𝗉𝖽𝖿ℋ​(s)D(s)=-\\mathsf{pdf}\_{\\mathcal{H}}(s).

|  | 𝖳𝖯𝖱γ\displaystyle\mathsf{TPR}_{\gamma} | =Ps∼ℳ[D(s)≥γ]\displaystyle=\mathbb{P}_{s\sim\mathcal{M}}[D(s)\geq\gamma] |  |
| --- | --- | --- | --- |
|  |  | =Ps∼ℳ[−𝗉𝖽𝖿ℋ(s)≥γ]\displaystyle=\mathbb{P}_{s\sim\mathcal{M}}[-\mathsf{pdf}_{\mathcal{H}}(s)\geq\gamma] |  |
|  |  | =Ps∼ℳ[𝗉𝖽𝖿ℋ(s)≤−γ]\displaystyle=\mathbb{P}_{s\sim\mathcal{M}}[\mathsf{pdf}_{\mathcal{H}}(s)\leq-\gamma] |  |
|  |  | =Ps∼ℳ[s∈Ωℋ(−γ)]\displaystyle=\mathbb{P}_{s\sim\mathcal{M}}[s\in\Omega_{\mathcal{H}}(-\gamma)] |  |

Similarly,

|  | 𝖥𝖯𝖱γ=Ps∼ℋ[s∈Ωℋ(−γ)].\mathsf{FPR}_{\gamma}=\mathbb{P}_{s\sim\mathcal{H}}[s\in\Omega_{\mathcal{H}}(-\gamma)]. |  |
| --- | --- | --- |

For γ∈\[−τ,0\]\\gamma\\in\[-\\tau,0\],

|  | 𝖳𝖯𝖱γ\displaystyle\mathsf{TPR}_{\gamma} | =Ps∼ℳ[s∈Ωℋ(−γ)]\displaystyle=\mathbb{P}_{s\sim\mathcal{M}}[s\in\Omega_{\mathcal{H}}(-\gamma)] |  |  |
| --- | --- | --- | --- | --- |
|  |  | =Ps∼ℳ[s∈Ωℋ(0)]+Ps∼ℳ[s∈Ωℋ(−γ)−Ωℋ(0)]\displaystyle=\mathbb{P}_{s\sim\mathcal{M}}[s\in\Omega_{\mathcal{H}}(0)]+\mathbb{P}_{s\sim\mathcal{M}}[s\in\Omega_{\mathcal{H}}(-\gamma)-\Omega_{\mathcal{H}}(0)] |  |  |
|  |  | =𝖳𝖵(ℳ,ℋ)+Ps∼ℳ[s∈Ωℋ(−γ)−Ωℋ(0)]\displaystyle=\mathsf{TV}(\mathcal{M},\mathcal{H})+\mathbb{P}_{s\sim\mathcal{M}}[s\in\Omega_{\mathcal{H}}(-\gamma)-\Omega_{\mathcal{H}}(0)] |  | (using property 1) |
|  |  | =𝖳𝖵(ℳ,ℋ)+Ps∼ℋ[s∈Ωℋ(−γ)−Ωℋ(0)]\displaystyle=\mathsf{TV}(\mathcal{M},\mathcal{H})+\mathbb{P}_{s\sim\mathcal{H}}[s\in\Omega_{\mathcal{H}}(-\gamma)-\Omega_{\mathcal{H}}(0)] |  | (using property 2) |
|  |  | =𝖳𝖵(ℳ,ℋ)+Ps∼ℋ[s∈Ωℋ(−γ)]−Ps∼ℋ[s∈Ωℋ(0)]\displaystyle=\mathsf{TV}(\mathcal{M},\mathcal{H})+\mathbb{P}_{s\sim\mathcal{H}}[s\in\Omega_{\mathcal{H}}(-\gamma)]-\mathbb{P}_{s\sim\mathcal{H}}[s\in\Omega_{\mathcal{H}}(0)] |  | (Ωℋ​(0)⊆Ωℋ​(−γ)\Omega_{\mathcal{H}}(0)\subseteq\Omega_{\mathcal{H}}(-\gamma)) |
|  |  | =𝖳𝖵⁡(ℳ,ℋ)+𝖥𝖯𝖱γ.\displaystyle=\mathsf{TV}(\mathcal{M},\mathcal{H})+\mathsf{FPR}_{\gamma}. |  | (Ps∼ℋ[s∈Ωℋ(0)]=0\mathbb{P}_{s\sim\mathcal{H}}[s\in\Omega_{\mathcal{H}}(0)]=0) |

For γ∈\[−∞,−τ\]\\gamma\\in\[-\\infty,-\\tau\], 𝖳𝖯𝖱γ\=1\\mathsf{TPR}\_{\\gamma}=1, by property 3. Also, as γ\\gamma goes from 00 to −∞\-\\infty, 𝖥𝖯𝖱γ\\mathsf{FPR}\_{\\gamma} goes from 00 to 11. Therefore, 𝖳𝖯𝖱γ\=min⁡(𝖥𝖯𝖱γ+𝖳𝖵⁡(ℳ,ℋ),1)\\mathsf{TPR}\_{\\gamma}=\\min(\\mathsf{FPR}\_{\\gamma}+\\mathsf{TV}(\\mathcal{M},\\mathcal{H}),1) which is similar to Equation [3].

|  | 𝖠𝖴𝖱𝖮𝖢⁡(D)=12+𝖳𝖵⁡(ℳ,ℋ)−𝖳𝖵​(ℳ,ℋ)22.\mathsf{AUROC}(D)=\frac{1}{2}+\mathsf{TV}(\mathcal{M},\mathcal{H})-\frac{\mathsf{TV}(\mathcal{M},\mathcal{H})^{2}}{2}. |  |
| --- | --- | --- |

## Detailed

### C.3 Tightness Analysis for Theorem [1](https://arxiv.org/html/2303.11156v4#Thmtheorem1 "Theorem 1. ‣ 4 Hardness of Reliable AI Text Detection ‣ Can AI-Generated Text be Reliably Detected?")

In this section, we show that the bound in Theorem [1](https://arxiv.org/html/2303.11156v4#Thmtheorem1 "Theorem 1. ‣ 4 Hardness of Reliable AI Text Detection ‣ Can AI-Generated Text be Reliably Detected?") is tight. For a given distribution of human-generated text sequences ℋ\\mathcal{H}, we construct an AI-text distribution ℳ\\mathcal{M} and a detector DD such that the bound holds with equality. Define sublevel sets of the probability density function of the distribution of human-generated text 𝗉𝖽𝖿ℋ\\mathsf{pdf}\_{\\mathcal{H}} over the set of all sequences Ω\\Omega as follows:

|  | Ωℋ​(c)={s∈Ω∣𝗉𝖽𝖿ℋ​(s)≤c}\Omega_{\mathcal{H}}(c)=\{s\in\Omega\mid\mathsf{pdf}_{\mathcal{H}}(s)\leq c\} |  |
| --- | --- | --- |

where c∈Rc\\in\\mathbb{R}. Assume that, Ωℋ​(0)\\Omega\_{\\mathcal{H}}(0) is not empty. Now, consider a distribution ℳ\\mathcal{M}, with density function 𝗉𝖽𝖿ℳ\\mathsf{pdf}\_{\\mathcal{M}}, which has the following properties:

1.  1.
    
    The probability of a sequence drawn from ℳ\\mathcal{M} falling in Ωℋ​(0)\\Omega\_{\\mathcal{H}}(0) is 𝖳𝖵⁡(ℳ,ℋ)\\mathsf{TV}(\\mathcal{M},\\mathcal{H}), i.e., Ps∼ℳ\[s∈Ωℋ(0)\]\=𝖳𝖵(ℳ,ℋ)\\mathbb{P}\_{s\\sim\\mathcal{M}}\[s\\in\\Omega\_{\\mathcal{H}}(0)\]=\\mathsf{TV}(\\mathcal{M},\\mathcal{H}).
    
2.  2.
    
    𝗉𝖽𝖿ℳ​(s)\=𝗉𝖽𝖿ℋ​(s)\\mathsf{pdf}\_{\\mathcal{M}}(s)=\\mathsf{pdf}\_{\\mathcal{H}}(s) for all s∈Ω⁡(τ)−Ω⁡(0)s\\in\\Omega(\\tau)-\\Omega(0) where τ\>0\\tau>0 such that Ps∼ℋ\[s∈Ω(τ)\]\=1−𝖳𝖵(ℳ,ℋ)\\mathbb{P}\_{s\\sim\\mathcal{H}}\[s\\in\\Omega(\\tau)\]=1-\\mathsf{TV}(\\mathcal{M},\\mathcal{H}).
    
3.  3.
    
    𝗉𝖽𝖿ℳ​(s)\=0\\mathsf{pdf}\_{\\mathcal{M}}(s)=0 for all s∈Ω−Ω⁡(τ)s\\in\\Omega-\\Omega(\\tau).
    

Define a hypothetical detector DD that maps each sequence in Ω\\Omega to the negative of the probability density function of ℋ\\mathcal{H}, i.e., D​(s)\=−𝗉𝖽𝖿ℋ​(s)D(s)=-\\mathsf{pdf}\_{\\mathcal{H}}(s). Using the definitions of 𝖳𝖯𝖱γ\\mathsf{TPR}\_{\\gamma} and 𝖥𝖯𝖱γ\\mathsf{FPR}\_{\\gamma}, we have:

|  | 𝖳𝖯𝖱γ\displaystyle\mathsf{TPR}_{\gamma} | =Ps∼ℳ[D(s)≥γ]\displaystyle=\mathbb{P}_{s\sim\mathcal{M}}[D(s)\geq\gamma] |  |
| --- | --- | --- | --- |
|  |  | =Ps∼ℳ[−𝗉𝖽𝖿ℋ(s)≥γ]\displaystyle=\mathbb{P}_{s\sim\mathcal{M}}[-\mathsf{pdf}_{\mathcal{H}}(s)\geq\gamma] |  |
|  |  | =Ps∼ℳ[𝗉𝖽𝖿ℋ(s)≤−γ]\displaystyle=\mathbb{P}_{s\sim\mathcal{M}}[\mathsf{pdf}_{\mathcal{H}}(s)\leq-\gamma] |  |
|  |  | =Ps∼ℳ[s∈Ωℋ(−γ)]\displaystyle=\mathbb{P}_{s\sim\mathcal{M}}[s\in\Omega_{\mathcal{H}}(-\gamma)] |  |

Similarly,

|  | 𝖥𝖯𝖱γ=Ps∼ℋ[s∈Ωℋ(−γ)].\mathsf{FPR}_{\gamma}=\mathbb{P}_{s\sim\mathcal{H}}[s\in\Omega_{\mathcal{H}}(-\gamma)]. |  |
| --- | --- | --- |

For γ∈\[−τ,0\]\\gamma\\in\[-\\tau,0\],

|  | 𝖳𝖯𝖱γ\displaystyle\mathsf{TPR}_{\gamma} | =Ps∼ℳ[s∈Ωℋ(−γ)]\displaystyle=\mathbb{P}_{s\sim\mathcal{M}}[s\in\Omega_{\mathcal{H}}(-\gamma)] |  |  |
| --- | --- | --- | --- | --- |
|  |  | =Ps∼ℳ[s∈Ωℋ(0)]+Ps∼ℳ[s∈Ωℋ(−γ)−Ωℋ(0)]\displaystyle=\mathbb{P}_{s\sim\mathcal{M}}[s\in\Omega_{\mathcal{H}}(0)]+\mathbb{P}_{s\sim\mathcal{M}}[s\in\Omega_{\mathcal{H}}(-\gamma)-\Omega_{\mathcal{H}}(0)] |  |  |
|  |  | =𝖳𝖵(ℳ,ℋ)+Ps∼ℳ[s∈Ωℋ(−γ)−Ωℋ(0)]\displaystyle=\mathsf{TV}(\mathcal{M},\mathcal{H})+\mathbb{P}_{s\sim\mathcal{M}}[s\in\Omega_{\mathcal{H}}(-\gamma)-\Omega_{\mathcal{H}}(0)] |  | (using property 1) |
|  |  | =𝖳𝖵(ℳ,ℋ)+Ps∼ℋ[s∈Ωℋ(−γ)−Ωℋ(0)]\displaystyle=\mathsf{TV}(\mathcal{M},\mathcal{H})+\mathbb{P}_{s\sim\mathcal{H}}[s\in\Omega_{\mathcal{H}}(-\gamma)-\Omega_{\mathcal{H}}(0)] |  | (using property 2) |
|  |  | =𝖳𝖵(ℳ,ℋ)+Ps∼ℋ[s∈Ωℋ(−γ)]−Ps∼ℋ[s∈Ωℋ(0)]\displaystyle=\mathsf{TV}(\mathcal{M},\mathcal{H})+\mathbb{P}_{s\sim\mathcal{H}}[s\in\Omega_{\mathcal{H}}(-\gamma)]-\mathbb{P}_{s\sim\mathcal{H}}[s\in\Omega_{\mathcal{H}}(0)] |  | (Ωℋ​(0)⊆Ωℋ​(−γ)\Omega_{\mathcal{H}}(0)\subseteq\Omega_{\mathcal{H}}(-\gamma)) |
|  |  | =𝖳𝖵⁡(ℳ,ℋ)+𝖥𝖯𝖱γ.\displaystyle=\mathsf{TV}(\mathcal{M},\mathcal{H})+\mathsf{FPR}_{\gamma}. |  | (Ps∼ℋ[s∈Ωℋ(0)]=0\mathbb{P}_{s\sim\mathcal{H}}[s\in\Omega_{\mathcal{H}}(0)]=0) |

For γ∈\[−∞,−τ\]\\gamma\\in\[-\\infty,-\\tau\], 𝖳𝖯𝖱γ\=1\\mathsf{TPR}\_{\\gamma}=1, by property 3. Also, as γ\\gamma goes from 00 to −∞\-\\infty, 𝖥𝖯𝖱γ\\mathsf{FPR}\_{\\gamma} goes from 00 to 11. Therefore, 𝖳𝖯𝖱γ\=min⁡(𝖥𝖯𝖱γ+𝖳𝖵⁡(ℳ,ℋ),1)\\mathsf{TPR}\_{\\gamma}=\\min(\\mathsf{FPR}\_{\\gamma}+\\mathsf{TV}(\\mathcal{M},\\mathcal{H}),1) which is similar to Equation [3](https://arxiv.org/html/2303.11156v4#A3.E3 "In Proof. ‣ C.1 Proof of Theorem ‣ Appendix C Proofs and Corollaries ‣ Can AI-Generated Text be Reliably Detected?"). Calculating the AUROC in a similar fashion as in the previous section, we get the following:

|  | 𝖠𝖴𝖱𝖮𝖢⁡(D)=12+𝖳𝖵⁡(ℳ,ℋ)−𝖳𝖵​(ℳ,ℋ)22.\mathsf{AUROC}(D)=\frac{1}{2}+\mathsf{TV}(\mathcal{M},\mathcal{H})-\frac{\mathsf{TV}(\mathcal{M},\mathcal{H})^{2}}{2}. |  |
| --- | --- | --- |

## Provenance

Section "Appendix C Proofs and Corollaries > C.3 Tightness Analysis for Theorem 1" of https://arxiv.org/html/2303.11156v4 (parent c3e4ea511335c20b7066458b397a125e4545e17b1de484a06f9869d9f4d1f8ba)