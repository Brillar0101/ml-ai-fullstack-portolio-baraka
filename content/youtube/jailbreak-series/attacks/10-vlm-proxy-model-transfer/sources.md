# Sources — Proxy-Model Transfer Attacks

## Start here
- Survey (umbrella source, indexes every method below): Chen et al., "Jailbreaking LLMs & VLMs: Mechanisms, Evaluation, and Unified Defenses" (2026), arXiv:2601.03594 — https://arxiv.org/abs/2601.03594
- Anchor (Atlas): Dong et al., "Jailbreaking Text-to-Image Models with LLM-Based Agents" (2024), arXiv:2408.00523 (verified) — https://arxiv.org/abs/2408.00523

## Transferability foundations (why proxy attacks work)
- Momentum Iterative Method (MIM), Dong et al. (2018) — the momentum trick that boosts black-box transfer
- Input Diversity (DIM), Xie et al. (2019) — random input transforms that reduce overfitting to the proxy

## Other methods in this family
- 2M / O2M attacks (cross-modal, extended to medical MLLMs), Huang et al. (2024)
- Open Sesame (model-agnostic genetic attack), Lapid et al. (2023)
- Related transfer evidence: GCG suffixes, Zou et al. (2023), arXiv:2307.15043 — https://arxiv.org/abs/2307.15043

## Note
The survey (arXiv:2601.03594) is the master index: its reference list links the primary paper for every method here. Links marked (verified) were confirmed directly; the rest are cited by author, year, and method title so you can find them on arXiv or Google Scholar.
