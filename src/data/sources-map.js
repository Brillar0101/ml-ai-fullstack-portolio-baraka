// Which verified sources belong to which post.
//
// A source is listed here only when it actually supports what the post claims.
// Padding a list to hit a count would be its own kind of dishonesty, so any
// post that cannot reach five genuinely relevant sources is not in this map,
// and the publish gate holds it back as a draft rather than shipping it thin.
import { S } from './sources-library';

export const SOURCES = {
  // ---------- src/data/seriesPosts.js ----------
  'foundation-models-explained': [S.foundation, S.gpt3, S.llmSurvey, S.llama, S.instructgpt, S.wikiLLM],
  'why-models-hallucinate': [S.hallSurvey, S.hallNLG, S.factscore, S.hallInev, S.truthfulqa, S.wikiHall],
  'evaluation-is-the-hard-part': [S.helm, S.evalSurvey, S.mtbench, S.mmlu, S.contamination, S.checklist],
  'prompt-engineering-that-helps': [S.gpt3, S.promptProg, S.principled, S.cot, S.helm, S.ifeval],
  'prompt-injection': [S.indirectInj, S.promptInj, S.gcg, S.owasp, S.wikiInj, S.nist],
  'what-rag-is': [S.rag, S.ragSurvey, S.fid, S.dpr, S.ragBest, S.wikiRAG],
  'what-an-agent-is': [S.react, S.toolformer, S.agentSurvey, S.reflexion, S.voyager, S.gaia],
  'finetuning-or-rag': [S.ragfinetune, S.rag, S.lora, S.lima, S.ragSurvey, S.qlora],
  'quantization-plain-terms': [S.int8, S.gptq, S.awq, S.qlora, S.wikiQuant, S.scaleInfer],
  'data-quality': [S.dedup, S.lima, S.textbooks, S.pile, S.refinedweb, S.checklist],
  'latency-throughput-cost': [S.scaleInfer, S.pagedattn, S.flashattn, S.mqa, S.vllmDocs, S.int8],
  'guardrails': [S.owasp, S.nist, S.indirectInj, S.hh, S.gcg, S.hallSurvey],
  'ai-eng-vs-ml-eng': [S.foundation, S.llmSurvey, S.llmSurvey2, S.helm, S.checklist, S.gpt3],
  'three-layers-ai-stack': [S.foundation, S.llmSurvey, S.llmSurvey2, S.pagedattn, S.scaleInfer, S.vllmDocs],
  'model-size': [S.scaling, S.chinchilla, S.llama, S.phi3, S.distilbert, S.palm],
  'sft-vs-preference': [S.instructgpt, S.dpo, S.hh, S.lima, S.ppo, S.orca],
  'structured-outputs': [S.guided, S.jsonSchema, S.smcSteering, S.toolformer, S.gpt3, S.ifeval],
  'test-time-compute': [S.testTime, S.selfconsist, S.r1, S.cot, S.zeroshotCot, S.grpo],
  'entropy-cross-entropy': [S.wikiEntropy, S.wikiCrossEnt, S.wikiPerplex, S.scaling, S.transformer, S.gpt3],
  'embeddings-meaning-vectors': [S.word2vec, S.sbert, S.e5, S.wikiEmbed, S.wikiCosine, S.dpr],
  'reading-benchmarks': [S.contamination, S.mmlu, S.helm, S.arena, S.leaderboards, S.ifeval],
  'chain-of-thought': [S.zeroshotCot, S.cot, S.gsm8k, S.selfconsist, S.testTime, S.r1],
  'context-length': [S.lostmiddle, S.longformer, S.rope, S.distracted, S.flashattn, S.ragSurvey],
  'chunking-for-rag': [S.ragSurvey, S.raptor, S.graphrag, S.ragBest, S.rag, S.lostmiddle],
  'retrieval-algorithms': [S.wikiBM25, S.dpr, S.rerankBert, S.ragSurvey, S.hnsw, S.sbert],
  'kv-cache': [S.scaleInfer, S.pagedattn, S.mqa, S.flashattn, S.transformer, S.vllmDocs],
  'probabilistic-nature': [S.nucleus, S.gpt3, S.smcSteering, S.selfconsist, S.transformer, S.guided],
  'multilingual-quality': [S.tokenCost, S.mt5, S.bpe, S.llmSurvey2, S.llmSurvey, S.helm],

  // ---------- content/ai-series ----------
  'domain-specific-models': [S.biobert, S.bloomberggpt, S.codellama, S.ragfinetune, S.lora, S.lima],
  'functional-correctness': [S.codex, S.mbpp, S.codellama, S.llmSE, S.gaia, S.checklist],
  'ai-as-a-judge': [S.mtbench, S.evalSurvey, S.helm, S.factscore, S.ragas, S.leaderboards],
  'jailbreaking': [S.gcg, S.dan, S.pair, S.owasp, S.hh, S.nist],
  'build-vs-buy-model': [S.buyBuild, S.llama, S.lora, S.scaling, S.chinchilla, S.vllmDocs],
  'detection-without-a-detector': [S.locateAnything, S.clip, S.coco, S.yolo, S.llmSurvey2, S.transformer],
};
