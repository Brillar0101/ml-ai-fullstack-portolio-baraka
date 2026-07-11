# AI Engineering series — content ideas

A running backlog of blog and demo ideas for the hands-on series on building
with foundation models. Every item is original teaching content. Demos are
marked **[DEMO]** and always ship with a companion blog. Authoring follows the
`lab-writeup` standard: open on a concrete real scenario, define terms before
using them, keep it humanized, and run 1000+ words.

How to use this file: pick an idea, move it from "Planned" to "Done" once it is
live, and add new ideas as they come up.

---

## Already shipped (31 posts + 1 demo)

Foundation models, hallucination, sampling [DEMO], why evaluation is hard,
prompt engineering, prompt injection, what RAG is, what an agent is,
finetuning vs RAG, quantization, data quality, latency/throughput/cost,
guardrails, AI vs ML engineering, the AI stack, model size, supervised vs
preference finetuning, structured outputs, test-time compute, entropy &
cross-entropy, embeddings, reading benchmarks, chunking for RAG, retrieval
algorithms, KV cache.

Backlog now live (scheduled on the daily drip, 2026-07-16 onward):
probabilistic nature of AI, multilingual quality, domain-specific models,
functional correctness, AI as a judge.

---

## Planned

### Foundation models
- How attention works, visually **[DEMO]** — watch a token attend to others

### Evaluation
- Similarity metrics **[DEMO]** — BLEU / ROUGE / exact-match, side by side
- Comparative evaluation and ranking **[DEMO]** — an arena / Elo simulator

### Evaluate AI systems
- The capabilities that matter: domain, generation, instruction-following, cost
- Build vs buy a model
- Designing an evaluation pipeline end to end

### Prompt engineering
- Zero-shot vs few-shot **[DEMO]** — toggle examples, watch behavior change
- Jailbreaking: real cases (the "DAN" prompts, the bedtime-story trick) and defenses
- Information extraction prompts that do not break

### RAG and agents
- RAG architecture, the full picture
- RAG beyond text: tables, images, structured data
- Agent tools, planning, and failure modes (3 posts)
- Agent memory: short-term vs long-term

### Finetuning
- Numerical formats **[DEMO]** — fp32 / fp16 / bf16 / int8, the bits and the rounding
- The memory math of training **[DEMO]** — a calculator: params to VRAM needed
- LoRA and parameter-efficient finetuning **[DEMO]**
- Model merging: combining models without training

### Data
- Data synthesis and augmentation
- AI-powered synthesis and model distillation
- Deduplication **[DEMO]** — a near-duplicate finder (MinHash)

### Inference
- Inference performance metrics that actually matter
- AI accelerators: why GPUs and TPUs, in plain terms
- Batching **[DEMO]** — drag the batch size, watch throughput vs latency trade off

### Architecture and feedback
- The five-step app architecture: context, guardrails, router, cache, agents
- Model routers and gateways
- Monitoring and observability for AI features
- Designing for user feedback, and its limits

---

## Document extraction & OCR (spillover from the extraction post, with sources)

Concepts that came up while reworking "Extraction prompts that survive contact
with real documents" but belong in their own posts. Each keeps its source so the
research is not lost.

- **OCR with vision-language models** — doing OCR + layout with a VLM instead of
  tesseract: free / markdown / grounding modes, plus OCR-aware fine-tuning on
  synthetic degraded data and visual chain-of-thought. Cover keyword: `scanner`.
  - Sources: Simon Willison, DeepSeek-OCR prompts guide,
    https://github.com/simonw/research/blob/main/deepseek-ocr-nvidia-spark/PROMPTS_GUIDE.md
    ; arXiv:2605.16409 (OCR-aware fine-tuning + prompt-guided CoT).
- **Grounding and bounding boxes** — which pixels a field came from, and why
  coordinates matter for trust and correction. Cover keyword: `pushpin`.
  - Source: DeepSeek-OCR grounding mode (simonw guide above).
- **Pipeline and multi-pass prompting for hard extraction** — read → normalize →
  classify → validate, and re-reading low-confidence regions. Cover keyword: `assembly`.
  - Source: https://zenn.dev/coffin299/articles/60ba24446c0c27 (sections 3 and 9).
- **Self-verifying prompts** — a model checking its own output against rules before
  you trust it. Cover keyword: `checklist`.
  - Source: https://zenn.dev/coffin299/articles/60ba24446c0c27 (section 10).
- **Lexicon injection** — giving the model a domain word list with common OCR
  misreads so it self-corrects (e.g. Amlodibin → Amlodipine). Cover keyword: `dictionary`.
  - Source: https://zenn.dev/coffin299/articles/60ba24446c0c27 (section 5).

---

## Priority order (suggested)

1. Finish the 3 stubbed demos: tokenization, embeddings-search, quantization.
2. Build the high-impact new demos: attention, few-shot, batching, numerical formats.
3. Fill remaining blogs to keep the daily drip stocked through the year.
