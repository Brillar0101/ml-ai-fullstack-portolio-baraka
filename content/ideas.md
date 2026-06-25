# AI Engineering series — content ideas

A running backlog of blog and demo ideas for the hands-on series on building
with foundation models. Every item is original teaching content. Demos are
marked **[DEMO]** and always ship with a companion blog. Authoring follows the
`lab-writeup` standard: open on a concrete real scenario, define terms before
using them, keep it humanized, and run 1000+ words.

How to use this file: pick an idea, move it from "Planned" to "Done" once it is
live, and add new ideas as they come up.

---

## Already shipped (26 posts + 1 demo)

Foundation models, hallucination, sampling [DEMO], why evaluation is hard,
prompt engineering, prompt injection, what RAG is, what an agent is,
finetuning vs RAG, quantization, data quality, latency/throughput/cost,
guardrails, AI vs ML engineering, the AI stack, model size, supervised vs
preference finetuning, structured outputs, test-time compute, entropy &
cross-entropy, embeddings, reading benchmarks, chunking for RAG, retrieval
algorithms, KV cache.

---

## Planned

### Foundation models
- How attention works, visually **[DEMO]** — watch a token attend to others
- Multilingual models and why quality is uneven across languages
- Domain-specific models: when a general model is not enough
- The probabilistic nature of AI: same prompt, different answer

### Evaluation
- Functional correctness: grading code by running it
- Similarity metrics **[DEMO]** — BLEU / ROUGE / exact-match, side by side
- AI as a judge: rubrics, biases, and when to trust it
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

## Priority order (suggested)

1. Finish the 3 stubbed demos: tokenization, embeddings-search, quantization.
2. Build the high-impact new demos: attention, few-shot, batching, numerical formats.
3. Fill remaining blogs to keep the daily drip stocked through the year.
