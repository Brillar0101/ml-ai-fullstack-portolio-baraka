// Verified source library.
//
// Every arXiv entry below was checked against the arXiv API and its title is
// reproduced verbatim from the response, so no citation here is a guess about
// what a paper is called or whether it exists. Every non-arXiv URL was fetched
// and its page title confirmed. See scripts/verify-sources.mjs, which re-runs
// both checks against this file.
//
// Commercial vendor pages are deliberately thin on the ground. Where a vendor
// is the normative source for its own protocol or server (the MCP spec, the
// vLLM docs) it is cited as a specification, never as a recommendation.

const a = (id, title, year) => ({
  title: `${title} (arXiv:${id}${year ? `, ${year}` : ''})`,
  url: `https://arxiv.org/abs/${id}`,
});

export const S = {
  // ---- Foundations ----
  foundation:   a('2108.07258', 'Bommasani et al., On the Opportunities and Risks of Foundation Models', 2021),
  gpt3:         a('2005.14165', 'Brown et al., Language Models are Few-Shot Learners', 2020),
  llmSurvey:    a('2303.18223', 'Zhao et al., A Survey of Large Language Models', 2023),
  llmSurvey2:   a('2402.06196', 'Minaee et al., Large Language Models: A Survey', 2024),
  llama:        a('2302.13971', 'Touvron et al., LLaMA: Open and Efficient Foundation Language Models', 2023),
  transformer:  a('1706.03762', 'Vaswani et al., Attention Is All You Need', 2017),
  bert:         a('1810.04805', 'Devlin et al., BERT: Pre-training of Deep Bidirectional Transformers', 2018),
  wikiLLM:      { title: 'Large language model (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Large_language_model' },

  // ---- Hallucination and truthfulness ----
  hallSurvey:   a('2311.05232', 'Huang et al., A Survey on Hallucination in Large Language Models', 2023),
  hallNLG:      a('2202.03629', 'Ji et al., Survey of Hallucination in Natural Language Generation', 2022),
  factscore:    a('2305.14251', 'Min et al., FActScore: Fine-grained Atomic Evaluation of Factual Precision', 2023),
  hallInev:     a('2401.11817', 'Xu et al., Hallucination is Inevitable: An Innate Limitation of LLMs', 2024),
  truthfulqa:   a('2109.07958', 'Lin et al., TruthfulQA: Measuring How Models Mimic Human Falsehoods', 2021),
  wikiHall:     { title: 'Hallucination (artificial intelligence) (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Hallucination_(artificial_intelligence)' },

  // ---- Evaluation ----
  helm:         a('2211.09110', 'Liang et al., Holistic Evaluation of Language Models (HELM)', 2022),
  mtbench:      a('2306.05685', 'Zheng et al., Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena', 2023),
  evalSurvey:   a('2307.03109', 'Chang et al., A Survey on Evaluation of Large Language Models', 2023),
  mmlu:         a('2009.03300', 'Hendrycks et al., Measuring Massive Multitask Language Understanding', 2020),
  contamination: a('2310.18018', 'Sainz et al., NLP Evaluation in Trouble: Measuring LLM Data Contamination', 2023),
  checklist:    a('2005.04118', 'Ribeiro et al., Beyond Accuracy: Behavioral Testing of NLP Models with CheckList', 2020),
  arena:        a('2403.04132', 'Chiang et al., Chatbot Arena: An Open Platform for Evaluating LLMs', 2024),
  leaderboards: a('2009.13888', 'Ethayarajh & Jurafsky, Utility is in the Eye of the User: A Critique of NLP Leaderboards', 2020),
  ifeval:       a('2311.07911', 'Zhou et al., Instruction-Following Evaluation for Large Language Models', 2023),
  ragas:        a('2309.15217', 'Es et al., Ragas: Automated Evaluation of Retrieval Augmented Generation', 2023),
  gaia:         a('2311.12983', 'Mialon et al., GAIA: A Benchmark for General AI Assistants', 2023),

  // ---- Prompting and reasoning ----
  cot:          a('2201.11903', 'Wei et al., Chain-of-Thought Prompting Elicits Reasoning in LLMs', 2022),
  zeroshotCot:  a('2205.11916', 'Kojima et al., Large Language Models are Zero-Shot Reasoners', 2022),
  gsm8k:        a('2110.14168', 'Cobbe et al., Training Verifiers to Solve Math Word Problems (GSM8K)', 2021),
  selfconsist:  a('2203.11171', 'Wang et al., Self-Consistency Improves Chain of Thought Reasoning', 2022),
  promptProg:   a('2102.07350', 'Reynolds & McDonell, Prompt Programming for Large Language Models', 2021),
  principled:   a('2312.16171', 'Bsharat et al., Principled Instructions Are All You Need', 2023),
  testTime:     a('2408.03314', 'Snell et al., Scaling LLM Test-Time Compute Optimally', 2024),
  r1:           a('2501.12948', 'DeepSeek-AI, DeepSeek-R1: Incentivizing Reasoning Capability via RL', 2025),
  distracted:   a('2302.00093', 'Shi et al., Large Language Models Can Be Easily Distracted by Irrelevant Context', 2023),

  // ---- Security ----
  indirectInj:  a('2302.12173', 'Greshake et al., Not What You Signed Up For: Indirect Prompt Injection', 2023),
  promptInj:    a('2306.05499', 'Liu et al., Prompt Injection Attack against LLM-integrated Applications', 2023),
  gcg:          a('2307.15043', 'Zou et al., Universal and Transferable Adversarial Attacks on Aligned LLMs', 2023),
  dan:          a('2308.03825', 'Shen et al., "Do Anything Now": Characterizing In-The-Wild Jailbreak Prompts', 2023),
  pair:         a('2310.08419', 'Chao et al., Jailbreaking Black Box Large Language Models in Twenty Queries', 2023),
  owasp:        { title: 'OWASP Top 10 for Large Language Model Applications', url: 'https://genai.owasp.org/llm-top-10/' },
  nist:         { title: 'NIST AI Risk Management Framework', url: 'https://www.nist.gov/itl/ai-risk-management-framework' },
  wikiInj:      { title: 'Prompt injection (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Prompt_injection' },

  // ---- RAG and retrieval ----
  rag:          a('2005.11401', 'Lewis et al., Retrieval-Augmented Generation for Knowledge-Intensive NLP', 2020),
  ragSurvey:    a('2312.10997', 'Gao et al., Retrieval-Augmented Generation for LLMs: A Survey', 2023),
  fid:          a('2007.01282', 'Izacard & Grave, Leveraging Passage Retrieval with Generative Models', 2020),
  dpr:          a('2004.04906', 'Karpukhin et al., Dense Passage Retrieval for Open-Domain Question Answering', 2020),
  ragBest:      a('2407.01219', 'Wang et al., Searching for Best Practices in Retrieval-Augmented Generation', 2024),
  selfrag:      a('2310.11511', 'Asai et al., Self-RAG: Learning to Retrieve, Generate, and Critique', 2023),
  hydePaper:    a('2212.10496', 'Gao et al., Precise Zero-Shot Dense Retrieval without Relevance Labels (HyDE)', 2022),
  raptor:       a('2401.18059', 'Sarthi et al., RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval', 2024),
  graphrag:     a('2404.16130', 'Edge et al., From Local to Global: A Graph RAG Approach', 2024),
  rerankBert:   a('1901.04085', 'Nogueira & Cho, Passage Re-ranking with BERT', 2019),
  hnsw:         a('1603.09320', 'Malkov & Yashunin, Efficient and Robust Approximate Nearest Neighbor Search (HNSW)', 2016),
  ragfinetune:  a('2312.05934', 'Ovadia et al., Fine-Tuning or Retrieval? Comparing Knowledge Injection in LLMs', 2023),
  wikiRAG:      { title: 'Retrieval-augmented generation (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Retrieval-augmented_generation' },
  wikiBM25:     { title: 'Okapi BM25 (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Okapi_BM25' },

  // ---- Embeddings ----
  word2vec:     a('1301.3781', 'Mikolov et al., Efficient Estimation of Word Representations in Vector Space', 2013),
  sbert:        a('1908.10084', 'Reimers & Gurevych, Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks', 2019),
  e5:           a('2212.03533', 'Wang et al., Text Embeddings by Weakly-Supervised Contrastive Pre-training', 2022),
  wikiEmbed:    { title: 'Word embedding (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Word_embedding' },
  wikiCosine:   { title: 'Cosine similarity (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Cosine_similarity' },

  // ---- Agents and tools ----
  react:        a('2210.03629', 'Yao et al., ReAct: Synergizing Reasoning and Acting in Language Models', 2022),
  toolformer:   a('2302.04761', 'Schick et al., Toolformer: Language Models Can Teach Themselves to Use Tools', 2023),
  agentSurvey:  a('2308.11432', 'Wang et al., A Survey on Large Language Model based Autonomous Agents', 2023),
  reflexion:    a('2303.11366', 'Shinn et al., Reflexion: Language Agents with Verbal Reinforcement Learning', 2023),
  autogen:      a('2308.08155', 'Wu et al., AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation', 2023),
  voyager:      a('2305.16291', 'Wang et al., Voyager: An Open-Ended Embodied Agent with Large Language Models', 2023),
  webgpt:       a('2112.09332', 'Nakano et al., WebGPT: Browser-assisted Question-answering with Human Feedback', 2021),
  mcpSpec:      { title: 'Model Context Protocol specification', url: 'https://modelcontextprotocol.io/specification/2025-06-18' },

  // ---- Training, tuning, alignment ----
  instructgpt:  a('2203.02155', 'Ouyang et al., Training Language Models to Follow Instructions with Human Feedback', 2022),
  dpo:          a('2305.18290', 'Rafailov et al., Direct Preference Optimization: Your Language Model is Secretly a Reward Model', 2023),
  hh:           a('2204.05862', 'Bai et al., Training a Helpful and Harmless Assistant with RLHF', 2022),
  lima:         a('2305.11206', 'Zhou et al., LIMA: Less Is More for Alignment', 2023),
  lora:         a('2106.09685', 'Hu et al., LoRA: Low-Rank Adaptation of Large Language Models', 2021),
  ppo:          a('1707.06347', 'Schulman et al., Proximal Policy Optimization Algorithms', 2017),
  grpo:         a('2402.03300', 'Shao et al., DeepSeekMath: Pushing the Limits of Mathematical Reasoning (GRPO)', 2024),
  selfinstruct: a('2212.10560', 'Wang et al., Self-Instruct: Aligning Language Models with Self-Generated Instructions', 2022),
  orca:         a('2306.02707', 'Mukherjee et al., Orca: Progressive Learning from Complex Explanation Traces', 2023),

  // ---- Scaling and size ----
  scaling:      a('2001.08361', 'Kaplan et al., Scaling Laws for Neural Language Models', 2020),
  chinchilla:   a('2203.15556', 'Hoffmann et al., Training Compute-Optimal Large Language Models', 2022),
  palm:         a('2204.02311', 'Chowdhery et al., PaLM: Scaling Language Modeling with Pathways', 2022),
  phi3:         a('2404.14219', 'Abdin et al., Phi-3 Technical Report: A Highly Capable Language Model Locally on Your Phone', 2024),
  distilbert:   a('1910.01108', 'Sanh et al., DistilBERT, a distilled version of BERT: smaller, faster, cheaper and lighter', 2019),

  // ---- Data ----
  dedup:        a('2107.06499', 'Lee et al., Deduplicating Training Data Makes Language Models Better', 2021),
  textbooks:    a('2306.11644', 'Gunasekar et al., Textbooks Are All You Need', 2023),
  pile:         a('2101.00027', 'Gao et al., The Pile: An 800GB Dataset of Diverse Text', 2020),
  refinedweb:   a('2306.01116', 'Penedo et al., The RefinedWeb Dataset for Falcon LLM', 2023),

  // ---- Inference, serving, efficiency ----
  scaleInfer:   a('2211.05102', 'Pope et al., Efficiently Scaling Transformer Inference', 2022),
  pagedattn:    a('2309.06180', 'Kwon et al., Efficient Memory Management for LLM Serving with PagedAttention', 2023),
  flashattn:    a('2205.14135', 'Dao et al., FlashAttention: Fast and Memory-Efficient Exact Attention', 2022),
  mqa:          a('1911.02150', 'Shazeer, Fast Transformer Decoding: One Write-Head is All You Need', 2019),
  int8:         a('2208.07339', 'Dettmers et al., LLM.int8(): 8-bit Matrix Multiplication for Transformers at Scale', 2022),
  gptq:         a('2210.17323', 'Frantar et al., GPTQ: Accurate Post-Training Quantization', 2022),
  awq:          a('2306.00978', 'Lin et al., AWQ: Activation-aware Weight Quantization', 2023),
  qlora:        a('2305.14314', 'Dettmers et al., QLoRA: Efficient Finetuning of Quantized LLMs', 2023),
  vllmDocs:     { title: 'vLLM documentation', url: 'https://docs.vllm.ai/en/latest/' },
  wikiQuant:    { title: 'Quantization (signal processing) (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Quantization_(signal_processing)' },

  // ---- Architecture ----
  moeShazeer:   a('1701.06538', 'Shazeer et al., Outrageously Large Neural Networks: The Sparsely-Gated MoE Layer', 2017),
  switch:       a('2101.03961', 'Fedus et al., Switch Transformers: Scaling to Trillion Parameter Models', 2021),
  mixtral:      a('2401.04088', 'Jiang et al., Mixtral of Experts', 2024),
  wikiMoE:      { title: 'Mixture of experts (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Mixture_of_experts' },
  rope:         a('2104.09864', 'Su et al., RoFormer: Enhanced Transformer with Rotary Position Embedding', 2021),
  longformer:   a('2004.05150', 'Beltagy et al., Longformer: The Long-Document Transformer', 2020),
  lostmiddle:   a('2307.03172', 'Liu et al., Lost in the Middle: How Language Models Use Long Contexts', 2023),

  // ---- Decoding and sampling ----
  nucleus:      a('1904.09751', 'Holtzman et al., The Curious Case of Neural Text Degeneration', 2019),
  guided:       a('2307.09702', 'Willard & Louf, Efficient Guided Generation for Large Language Models', 2023),
  smcSteering:  a('2306.03081', 'Lew et al., Sequential Monte Carlo Steering of Large Language Models', 2023),
  jsonSchema:   { title: 'JSON Schema specification', url: 'https://json-schema.org/' },

  // ---- Code ----
  codex:        a('2107.03374', 'Chen et al., Evaluating Large Language Models Trained on Code (HumanEval)', 2021),
  mbpp:         a('2108.07732', 'Austin et al., Program Synthesis with Large Language Models (MBPP)', 2021),
  codellama:    a('2308.12950', 'Rozière et al., Code Llama: Open Foundation Models for Code', 2023),
  llmSE:        a('2308.10620', 'Hou et al., Large Language Models for Software Engineering: A Systematic Review', 2023),

  // ---- Multilingual and tokenization ----
  tokenCost:    a('2305.13707', 'Ahia et al., Do All Languages Cost the Same? Tokenization in the Era of Commercial LMs', 2023),
  mt5:          a('2010.11934', 'Xue et al., mT5: A Massively Multilingual Pre-trained Text-to-Text Transformer', 2020),
  bpe:          a('1508.07909', 'Sennrich et al., Neural Machine Translation of Rare Words with Subword Units', 2015),

  // ---- Domain models ----
  biobert:      a('1901.08746', 'Lee et al., BioBERT: A Pre-trained Biomedical Language Representation Model', 2019),
  bloomberggpt: a('2303.17564', 'Wu et al., BloombergGPT: A Large Language Model for Finance', 2023),

  // ---- Information theory ----
  wikiEntropy:  { title: 'Entropy (information theory) (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Entropy_(information_theory)' },
  wikiCrossEnt: { title: 'Cross-entropy (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Cross-entropy' },
  wikiPerplex:  { title: 'Perplexity (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Perplexity' },

  // ---- Vision ----
  clip:         a('2103.00020', 'Radford et al., Learning Transferable Visual Models From Natural Language Supervision', 2021),
  coco:         a('1405.0312', 'Lin et al., Microsoft COCO: Common Objects in Context', 2014),
  yolo:         a('1804.02767', 'Redmon & Farhadi, YOLOv3: An Incremental Improvement', 2018),
  locateAnything: a('2605.27365', 'LocateAnything: Fast and High-Quality Vision-Language Grounding with Parallel Box Decoding', 2026),
  ocrCot:       a('2605.16409', 'Xu et al., Multilingual OCR-Aware Fine-Tuning and Prompt-Guided CoT Reasoning', 2026),
  wikiOCR:      { title: 'Optical character recognition (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Optical_character_recognition' },
  wikiIE:       { title: 'Information extraction (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Information_extraction' },

  // ---- Observability ----
  otelTraces:   { title: 'OpenTelemetry: Traces', url: 'https://opentelemetry.io/docs/concepts/signals/traces/' },

  // ---- Governance ----
  buyBuild:     a('2602.13033', 'Lu et al., Buy versus Build an LLM: A Decision Framework for Governments', 2026),
};
