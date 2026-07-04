# YouTube Channel: AI Engineering, One Concept at a Time

Not published on the site. Planning doc for the video series. Each video takes
ONE narrow concept and explains it fully, anchored in research papers or
textbooks (never blog posts or docs as primary sources). Companion blog posts
already exist on the site for most of these, so every video can end with
"read the written version" and every post can embed the video later.

## Selection criteria

- Narrow enough to explain completely in 12–20 minutes (a mechanism, not a field)
- Anchored in 1–3 credible primary sources (paper or textbook chapter)
- Visual: the mechanism can be drawn (reuse the site's diagram styles for graphics)
- A concrete hook a non-expert already cares about
- Not already owned by 3Blue1Brown / Karpathy-style coverage, or approachable
  from a genuinely different angle (the engineer's angle, not the math angle)

## Launch sequence (first 8 videos)

1. **Tokenization: why the model can't count the r's in "strawberry"**
   - Hook: strawberry r-counting, 9.9 vs 9.11 comparisons failing
   - Mechanism: byte-pair encoding, merges, why numbers and rare words fragment
   - Sources: Sennrich, Haddow & Birch, "Neural Machine Translation of Rare
     Words with Subword Units" (ACL 2016); Jurafsky & Martin, "Speech and
     Language Processing" (3rd ed. draft), tokenization chapter
   - Companion post: (none yet — write one after the video)

2. **Sampling and temperature: why the same prompt gives different answers**
   - Hook: run the same prompt twice, get two answers; what temperature really does
   - Mechanism: logits → softmax → temperature scaling → top-k / nucleus sampling
   - Sources: Holtzman et al., "The Curious Case of Neural Text Degeneration"
     (ICLR 2020) — the nucleus sampling paper
   - Companion: `probabilistic-nature` post + the site's interactive SamplingDemo

3. **The KV cache: why long chats get slow and expensive**
   - Hook: why token 10,000 costs the same as token 10 to generate (it shouldn't)
   - Mechanism: attention recomputation, caching keys/values, memory growth,
     why inference is memory-bound not compute-bound
   - Sources: Vaswani et al., "Attention Is All You Need" (NeurIPS 2017) for the
     attention primer; Pope et al., "Efficiently Scaling Transformer Inference"
     (2022); Kwon et al., "Efficient Memory Management for Large Language Model
     Serving with PagedAttention" (SOSP 2023, the vLLM paper)
   - Companion post: `kv-cache`

4. **LoRA: finetuning a 7B model on a gaming GPU**
   - Hook: full finetune needs a server rack; LoRA needs your desktop. Where did
     the cost go?
   - Mechanism: low-rank decomposition, why ΔW ≈ BA works, rank as a dial,
     merging adapters at inference
   - Sources: Hu et al., "LoRA: Low-Rank Adaptation of Large Language Models"
     (ICLR 2022); Raschka, "Build a Large Language Model (From Scratch)"
     (Manning 2024), finetuning chapters
   - Companion post: `finetuning-or-rag`

5. **LLM-as-a-judge and its biases: when the grader cheats**
   - Hook: models prefer the first answer shown, longer answers, and their own
     outputs — measured, not anecdotal
   - Mechanism: pairwise vs pointwise judging; position, verbosity, and
     self-enhancement bias; agreement rates with humans; mitigations
   - Sources: Zheng et al., "Judging LLM-as-a-Judge with MT-Bench and Chatbot
     Arena" (NeurIPS 2023)
   - Companion posts: `ai-as-a-judge`, `evaluation-pipeline`

6. **Speculative decoding: the free-lunch speedup**
   - Hook: how a small model makes a big model 2–3x faster with identical output
   - Mechanism: draft-then-verify, acceptance sampling, why the output
     distribution is provably unchanged
   - Sources: Leviathan, Kalman & Matias, "Fast Inference from Transformers via
     Speculative Decoding" (ICML 2023); Chen et al., "Accelerating Large Language
     Model Decoding with Speculative Sampling" (2023)
   - Companion post: `latency-throughput-cost` (loose)

7. **Chinchilla: the scaling law that embarrassed the giants**
   - Hook: a 70B model beat a 280B model, and the reason was a budget equation
   - Mechanism: compute-optimal frontier, params-vs-tokens tradeoff, why
     everyone was undertraining, what it means for model choice today
   - Sources: Hoffmann et al., "Training Compute-Optimal Large Language Models"
     (NeurIPS 2022); Kaplan et al., "Scaling Laws for Neural Language Models"
     (2020) for contrast
   - Companion post: `model-size`

8. **Why models hallucinate: the statistics of confident nonsense**
   - Hook: hallucination is not a bug to patch, it falls out of the training math
   - Mechanism: next-token pressure to guess, calibration vs correctness,
     why "I don't know" is trained out, what actually reduces it
   - Sources: Kalai et al., "Why Language Models Hallucinate" (2025); Ji et al.,
     "Survey of Hallucination in Natural Language Generation" (ACM Computing
     Surveys 2023) as background
   - Companion post: `why-models-hallucinate`

## Bench (later videos, same bar)

- **RoPE / rotary position embeddings** — Su et al., "RoFormer" (2021); why
  context extension tricks (NTK scaling, YaRN) work
- **FlashAttention** — Dao et al. (NeurIPS 2022); the memory-hierarchy story
- **Mixture of Experts** — Shazeer et al. (2017), Fedus et al. "Switch
  Transformer" (2022), Jiang et al. "Mixtral of Experts" (2024); only 2 of 8
  experts fire, so where does capacity come from
- **DPO** — Rafailov et al. (NeurIPS 2023); how it deletes the reward model
- **Quantization outliers** — Dettmers et al., "LLM.int8()" (NeurIPS 2022);
  why 8-bit almost works and the outlier features that break it
- **Embeddings and contrastive training** — Reimers & Gurevych, "Sentence-BERT"
  (EMNLP 2019)
- **Chain-of-thought** — Wei et al. (NeurIPS 2022); Kojima et al., "Large
  Language Models are Zero-Shot Reasoners" (2022)

## Reference textbooks (recurring across videos)

- Chip Huyen, "AI Engineering" (O'Reilly, 2025) — framing and production angle
- Sebastian Raschka, "Build a Large Language Model (From Scratch)" (Manning, 2024)
- Jurafsky & Martin, "Speech and Language Processing" (3rd ed. draft, free)
- Goodfellow, Bengio & Courville, "Deep Learning" (MIT Press, 2016) — math backup

## Rules (mirror the blog skill)

- Original explanations only; papers are sources, never scripts. No reproduced
  figures — redraw every diagram in our own styles (sketch tree / architecture /
  flow, same as the site components).
- Every video names its sources on screen and in the description.
- One concept per video. If the outline needs "and" twice, split it.
- Each video pairs with a blog post on the site (existing or new) for the
  written version.
